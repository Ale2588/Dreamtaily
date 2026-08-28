import { createClient } from "npm:@supabase/supabase-js@2";
import { buildIdentityPrompt } from "../../../src/identity-prompt.js";
import { buildPageRenderPrompt } from "../../../src/render-prompts.js";
import { allPagesReady, planBookRender } from "../../../src/render-job.js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI = Deno.env.get("OPENAI_API_KEY")!;
const ASSET_BASE = (Deno.env.get("DREAMTAILY_ASSET_BASE_URL") ||
  "https://raw.githubusercontent.com/Ale2588/Dreamtaily/main").replace(/\/+$/, "");
const OUTPUT_BUCKET = Deno.env.get("DREAMTAILY_RENDER_BUCKET") || "book-renders";
const MODEL = Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-2";
const SIZE = Deno.env.get("OPENAI_IMAGE_SIZE") || "1536x1024";
const QUALITY = Deno.env.get("OPENAI_IMAGE_QUALITY") || "medium";
const MAX_ATTEMPTS = 3;
const MAX_CONCURRENCY = 3;

const cors = {
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":"POST, OPTIONS"
};
const svc = createClient(SUPABASE_URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}});

function reply(status:number, body:any){
  return new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
}
function msg(e:any){ return e instanceof Error ? e.message : String(e); }
async function sha256(s:string){
  const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
function abs(ref:string){ return /^https?:\/\//i.test(ref) ? ref : `${ASSET_BASE}/${String(ref).replace(/^\/+/, "")}`; }
async function fetchBlob(ref:string,label:string){
  const r=await fetch(abs(ref));
  if(!r.ok) throw new Error(`${label}_HTTP_${r.status}`);
  const b=await r.blob();
  if(!b.size) throw new Error(`${label}_EMPTY`);
  return b;
}
function helperRef(id:string,pose:string){
  const p=["in_piedi","seduto","cammina","si_china"].includes(pose)?pose:"in_piedi";
  return `assets/char/paper/${id}_${p}.png`;
}

async function authenticate(req:Request){
  const token=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"").trim();
  if(!token) throw new Error("AUTH_REQUIRED");
  const c=createClient(SUPABASE_URL,ANON,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await c.auth.getUser(token);
  if(error||!data.user) throw new Error("AUTH_INVALID");
  return data.user;
}

async function ensureBucket(){
  const {data,error}=await svc.storage.listBuckets();
  if(error) throw error;
  if((data||[]).some((b:any)=>b.name===OUTPUT_BUCKET)) return;
  const {error:e}=await svc.storage.createBucket(OUTPUT_BUCKET,{
    public:false,fileSizeLimit:"20MB",allowedMimeTypes:["image/png"]
  });
  if(e&&!/already exists/i.test(e.message)) throw e;
}

async function loadContext(bookId:string,userId:string){
  const {data:book,error:be}=await svc.from("books")
    .select("id,profile_id,current_style").eq("id",bookId).maybeSingle();
  if(be) throw be;
  if(!book||book.profile_id!==userId) throw new Error("BOOK_NOT_FOUND");

  const {data:stories,error:se}=await svc.from("book_stories")
    .select("id,story_slug,path_choices,content_snapshot")
    .eq("book_id",bookId).order("position");
  if(se) throw se;
  if(!stories?.length) throw new Error("BOOK_HAS_NO_STORIES");
  if(stories.length!==1) throw new Error("MVP_ONE_STORY_ONLY");

  const story=stories[0];
  if(story.story_slug!=="il-bosco-dei-sussurri") throw new Error("MVP_STORY_NOT_SUPPORTED");
  if(!story.content_snapshot) throw new Error("BOOK_SNAPSHOT_MISSING");

  const {data:assign,error:ae}=await svc.from("story_cast_assignments")
    .select("slot_key,character_asset_id,catalog_character_id").eq("book_story_id",story.id);
  if(ae) throw ae;

  const pa=(assign||[]).find((x:any)=>x.slot_key==="protagonist");
  if(!pa?.character_asset_id) throw new Error("PROTAGONIST_ASSIGNMENT_MISSING");

  const {data:char,error:ce}=await svc.from("character_assets")
    .select("id,name,traits,identity_prompt,default_style,status")
    .eq("id",pa.character_asset_id).maybeSingle();
  if(ce) throw ce;
  if(!char) throw new Error("PROTAGONIST_ASSET_MISSING");

  let identity=String(char.identity_prompt||"").trim();
  if(!identity){
    identity=buildIdentityPrompt(char.traits?.appearance||{},char.name||"");
    if(!identity) throw new Error("PROTAGONIST_IDENTITY_MISSING");
    const {error:e}=await svc.from("character_assets")
      .update({identity_prompt:identity,updated_at:new Date().toISOString()}).eq("id",char.id);
    if(e) throw e;
  }

  const {data:refs,error:re}=await svc.from("character_references")
    .select("style,view_type,storage_path,status,created_at")
    .eq("character_asset_id",char.id).order("created_at",{ascending:false});
  if(re) throw re;
  const ready=(refs||[]).filter((r:any)=>r.status==="ready"&&r.storage_path);
  const ref=ready.find((r:any)=>r.style===char.default_style&&r.view_type==="canonical")
    ||ready.find((r:any)=>r.style===char.default_style&&r.view_type==="wow_preview")
    ||ready[0];
  if(!ref) throw new Error("PROTAGONIST_REFERENCE_MISSING");

  return {snapshot:story.content_snapshot,identity,reference:ref};
}

async function protagonistBlob(path:string){
  const {data,error}=await svc.storage.from("character-references").download(path);
  if(error||!data) throw error||new Error("PROTAGONIST_REFERENCE_DOWNLOAD_FAILED");
  return data;
}

async function openAIEdit(images:Blob[],prompt:string){
  const f=new FormData();
  f.append("model",MODEL); f.append("prompt",prompt); f.append("size",SIZE);
  f.append("quality",QUALITY); f.append("output_format","png");
  images.forEach((b,i)=>f.append("image[]",b,["background.png","protagonist.png","helper.png"][i]||`ref-${i}.png`));
  const r=await fetch("https://api.openai.com/v1/images/edits",{
    method:"POST",headers:{Authorization:`Bearer ${OPENAI}`},body:f
  });
  const p=await r.json().catch(()=>null);
  if(!r.ok) throw new Error(`OPENAI_IMAGE_ERROR:${p?.error?.message||r.status}`);
  const b64=p?.data?.[0]?.b64_json;
  if(!b64) throw new Error("OPENAI_IMAGE_EMPTY");
  return Uint8Array.from(atob(b64),(c)=>c.charCodeAt(0));
}

async function store(renderId:string,pageId:string,bytes:Uint8Array){
  const path=`${renderId}/${pageId.replace(/[^a-zA-Z0-9_-]/g,"_")}.png`;
  const {error}=await svc.storage.from(OUTPUT_BUCKET).upload(path,bytes,{contentType:"image/png",upsert:true});
  if(error) throw error;
  const {data,error:e}=await svc.storage.from(OUTPUT_BUCKET).createSignedUrl(path,604800);
  if(e) throw e;
  return {path,url:data.signedUrl};
}

async function renderOne(renderId:string,page:any,protagonist:Blob,identity:string){
  const prompt=buildPageRenderPrompt({
    sceneId:page.scene_id, atmosphere:page.atmosphere,
    protagonistIdentity:identity, protagonistPose:page.protagonist_pose||"in_piedi",
    helperId:page.helper_id||null, helperPose:page.helper_pose||"in_piedi"
  });
  const ph=await sha256(prompt);
  let last="";
  for(let attempt=Number(page.render?.attempts||0)+1;attempt<=MAX_ATTEMPTS;attempt++){
    try{
      const imgs:Blob[]=[await fetchBlob(page.background_ref,"BACKGROUND"),protagonist];
      if(page.helper_id) imgs.push(await fetchBlob(helperRef(page.helper_id,page.helper_pose||"in_piedi"),"HELPER"));
      const bytes=await openAIEdit(imgs,prompt);
      const s=await store(renderId,page.page_id,bytes);
      return {...page,render:{status:"ready",generated_image_url:s.url,generated_image_path:s.path,
        attempts:attempt,prompt_hash:ph,error:null}};
    }catch(e){
      last=msg(e);
      if(attempt<MAX_ATTEMPTS) await new Promise(r=>setTimeout(r,1000*Math.pow(2,attempt-1)));
    }
  }
  return {...page,render:{...page.render,status:"failed",attempts:MAX_ATTEMPTS,prompt_hash:ph,error:last||"UNKNOWN_RENDER_ERROR"}};
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
  if(req.method!=="POST") return reply(405,{error:"METHOD_NOT_ALLOWED"});
  try{
    if(!OPENAI) throw new Error("OPENAI_API_KEY_MISSING");
    const user=await authenticate(req);
    const body=await req.json().catch(()=>({}));
    const bookId=String(body.book_id||"").trim();
    const key=String(body.idempotency_key||"").trim();
    if(!bookId) return reply(400,{error:"BOOK_ID_REQUIRED"});
    if(!key) return reply(400,{error:"IDEMPOTENCY_KEY_REQUIRED"});

    const ctx=await loadContext(bookId,user.id);
    let {data:job,error:je}=await svc.from("book_renders").select("*").eq("idempotency_key",key).maybeSingle();
    if(je) throw je;
    if(job&&job.book_id!==bookId) throw new Error("IDEMPOTENCY_KEY_CONFLICT");
    if(job&&job.status!=="running") return reply(200,{
      render_id:job.id,status:job.status,pages:job.pages,permalink_slug:job.permalink_slug,idempotent:true
    });

    if(!job){
      const {data,error}=await svc.from("book_renders").insert({
        book_id:bookId,status:"running",idempotency_key:key,book_snapshot:ctx.snapshot,
        pages:planBookRender(ctx.snapshot),started_at:new Date().toISOString(),updated_at:new Date().toISOString()
      }).select("*").single();
      if(error) throw error;
      job=data;
    }

    await ensureBucket();
    const protagonist=await protagonistBlob(ctx.reference.storage_path);
    const pages=(job.pages||planBookRender(ctx.snapshot)).map((p:any)=>({...p,render:{...p.render}}));

    const pending=pages.map((page:any,index:number)=>({page,index}))
      .filter(({page}:any)=>page.render?.status!=="ready"&&Number(page.render?.attempts||0)<MAX_ATTEMPTS)
      .slice(0,MAX_CONCURRENCY);

    if(pending.length){
      const results=await Promise.all(pending.map(({page}:any)=>renderOne(job.id,page,protagonist,ctx.identity)));
      results.forEach((r:any,i:number)=>pages[pending[i].index]=r);
      const {error}=await svc.from("book_renders").update({pages,updated_at:new Date().toISOString()}).eq("id",job.id);
      if(error) throw error;
    }

    const ready=allPagesReady(pages);
    const exhausted=!ready&&pages.some((p:any)=>p.render?.status==="failed"&&Number(p.render?.attempts||0)>=MAX_ATTEMPTS);
    const status=ready?"ready":exhausted?"review":"running";
    const slug=ready?(job.permalink_slug||`${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-","")):job.permalink_slug||null;
    const payload:any={status,pages,permalink_slug:slug,error:exhausted?"ONE_OR_MORE_PAGES_FAILED":null,updated_at:new Date().toISOString()};
    if(ready||exhausted) payload.finished_at=new Date().toISOString();

    const {data:done,error:de}=await svc.from("book_renders").update(payload).eq("id",job.id).select("*").single();
    if(de) throw de;
    const remaining=pages.filter((p:any)=>p.render?.status!=="ready"&&Number(p.render?.attempts||0)<MAX_ATTEMPTS).length;
    return reply(status==="running"?202:200,{
      render_id:done.id,status:done.status,pages:done.pages,permalink_slug:done.permalink_slug,idempotent:false,remaining
    });
  }catch(e){
    const d=msg(e);
    const status=d.startsWith("AUTH_")?401:d==="BOOK_NOT_FOUND"?404:d==="BOOK_SNAPSHOT_MISSING"?409:500;
    console.error("render-book-v3",d);
    return reply(status,{error:d});
  }
});
