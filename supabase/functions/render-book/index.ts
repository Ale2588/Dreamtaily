import { createClient } from "npm:@supabase/supabase-js@2";
import { buildIdentityPrompt } from "../../../src/identity-prompt.js";
import { buildPageRenderPrompt } from "../../../src/render-prompts.js";
import { allPagesReady, planBookRender } from "../../../src/render-job.js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const IMAGE_MODEL = Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-2";
const IMAGE_SIZE = Deno.env.get("OPENAI_IMAGE_SIZE") || "1536x1024";
const IMAGE_QUALITY = Deno.env.get("OPENAI_IMAGE_QUALITY") || "medium";
const ASSET_BASE_URL = (Deno.env.get("DREAMTAILY_ASSET_BASE_URL") || "").replace(/\/+$/, "");
const OUTPUT_BUCKET = Deno.env.get("DREAMTAILY_RENDER_BUCKET") || "book-renders";
const MAX_CONCURRENCY = Math.max(1, Math.min(4, Number(Deno.env.get("RENDER_MAX_CONCURRENCY") || 3)));
const MAX_ATTEMPTS = Math.max(1, Math.min(5, Number(Deno.env.get("RENDER_MAX_ATTEMPTS") || 3)));
const STALE_RUNNING_MS = Number(Deno.env.get("RENDER_STALE_MINUTES") || 15) * 60_000;
const SIGNED_URL_SECONDS = Number(Deno.env.get("RENDER_SIGNED_URL_SECONDS") || 604800);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function json(status:number, body:unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {...corsHeaders, "Content-Type":"application/json"},
  });
}
function sleep(ms:number){ return new Promise((resolve)=>setTimeout(resolve,ms)); }
function errMsg(error:unknown){ return error instanceof Error ? error.message : String(error); }

function requireEnv(){
  const missing=[
    ["SUPABASE_URL",SUPABASE_URL],["SUPABASE_ANON_KEY",SUPABASE_ANON_KEY],
    ["SUPABASE_SERVICE_ROLE_KEY",SUPABASE_SERVICE_ROLE_KEY],["OPENAI_API_KEY",OPENAI_API_KEY],
    ["DREAMTAILY_ASSET_BASE_URL",ASSET_BASE_URL]
  ].filter(([,v])=>!v).map(([k])=>k);
  if(missing.length) throw new Error(`MISSING_ENV:${missing.join(",")}`);
}

async function authenticate(req:Request){
  const token=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"").trim();
  if(!token) throw new Error("AUTH_REQUIRED");
  const client=createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await client.auth.getUser(token);
  if(error||!data.user) throw new Error("AUTH_INVALID");
  return data.user;
}

async function sha256(value:string){
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
}

function assetUrl(ref:string){
  if(/^https?:\/\//i.test(ref)) return ref;
  return `${ASSET_BASE_URL}/${String(ref).replace(/^\/+/,"")}`;
}
async function fetchBlob(url:string,label:string){
  const response=await fetch(url);
  if(!response.ok) throw new Error(`${label}_HTTP_${response.status}`);
  const blob=await response.blob();
  if(!blob.size) throw new Error(`${label}_EMPTY`);
  return blob;
}

async function ensureBucket(){
  const {data,error}=await service.storage.listBuckets();
  if(error) throw error;
  if((data||[]).some(b=>b.name===OUTPUT_BUCKET)) return;
  const {error:createError}=await service.storage.createBucket(OUTPUT_BUCKET,{
    public:false,fileSizeLimit:"20MB",allowedMimeTypes:["image/png"]
  });
  if(createError && !/already exists/i.test(createError.message)) throw createError;
}

function pickReference(refs:any[],style:string){
  const ready=(refs||[]).filter(r=>r.status==="ready"&&r.storage_path);
  return ready.find(r=>r.style===style&&r.view_type==="canonical")
    || ready.find(r=>r.style===style&&r.view_type==="wow_preview")
    || ready.find(r=>r.style===style)
    || ready[0] || null;
}

async function loadContext(bookId:string,userId:string){
  const {data:book,error:bookError}=await service.from("books")
    .select("id,profile_id,title,status,current_style").eq("id",bookId).maybeSingle();
  if(bookError) throw bookError;
  if(!book||book.profile_id!==userId) throw new Error("BOOK_NOT_FOUND");

  const {data:stories,error:storyError}=await service.from("book_stories")
    .select("id,book_id,story_slug,position,status,path_choices,content_snapshot")
    .eq("book_id",bookId).order("position",{ascending:true});
  if(storyError) throw storyError;
  if(!stories?.length) throw new Error("BOOK_HAS_NO_STORIES");
  if(stories.length!==1) throw new Error("MVP_ONE_STORY_ONLY");

  const story=stories[0];
  if(story.story_slug!=="il-bosco-dei-sussurri") throw new Error("MVP_STORY_NOT_SUPPORTED");
  if(!story.content_snapshot) throw new Error("BOOK_SNAPSHOT_MISSING");

  const {data:assignments,error:castError}=await service.from("story_cast_assignments")
    .select("id,slot_key,character_asset_id,catalog_character_id").eq("book_story_id",story.id);
  if(castError) throw castError;

  const protagonist=(assignments||[]).find(a=>a.slot_key==="protagonist");
  if(!protagonist?.character_asset_id) throw new Error("PROTAGONIST_ASSIGNMENT_MISSING");

  const {data:character,error:charError}=await service.from("character_assets")
    .select("id,name,traits,identity_prompt,default_style,status")
    .eq("id",protagonist.character_asset_id).maybeSingle();
  if(charError) throw charError;
  if(!character||character.status==="archived") throw new Error("PROTAGONIST_ASSET_MISSING");

  let identity=String(character.identity_prompt||"").trim();
  if(!identity){
    identity=buildIdentityPrompt(character.traits?.appearance||{},character.name||"");
    if(!identity) throw new Error("PROTAGONIST_IDENTITY_MISSING");
    const {error}=await service.from("character_assets")
      .update({identity_prompt:identity,updated_at:new Date().toISOString()}).eq("id",character.id);
    if(error) throw error;
  }

  const {data:refs,error:refsError}=await service.from("character_references")
    .select("id,style,view_type,storage_path,status,approved,created_at")
    .eq("character_asset_id",character.id).order("created_at",{ascending:false});
  if(refsError) throw refsError;
  const reference=pickReference(refs||[],character.default_style||book.current_style||"paper");
  if(!reference) throw new Error("PROTAGONIST_REFERENCE_MISSING");

  const helperAssignment=(assignments||[]).find(a=>a.slot_key==="helper");
  const helperId=helperAssignment?.catalog_character_id
    || story.path_choices?.helper || story.content_snapshot?.meta?.helper || null;

  return {book,story,snapshot:story.content_snapshot,identity,reference,helperId};
}

async function protagonistBlob(storagePath:string){
  const {data,error}=await service.storage.from("character-references").download(storagePath);
  if(error||!data) throw error||new Error("PROTAGONIST_REFERENCE_DOWNLOAD_FAILED");
  return data;
}

function helperRef(id:string,pose:string){
  const p=["in_piedi","seduto","cammina","si_china"].includes(pose)?pose:"in_piedi";
  return `assets/char/paper/${id}_${p}.png`;
}

async function openAIEdit(images:Blob[],prompt:string){
  const form=new FormData();
  form.append("model",IMAGE_MODEL);
  form.append("prompt",prompt);
  form.append("size",IMAGE_SIZE);
  form.append("quality",IMAGE_QUALITY);
  form.append("output_format","png");
  images.forEach((blob,i)=>form.append("image[]",blob,["background.png","protagonist.png","helper.png"][i]||`ref-${i}.png`));

  const response=await fetch("https://api.openai.com/v1/images/edits",{
    method:"POST",headers:{Authorization:`Bearer ${OPENAI_API_KEY}`},body:form
  });
  const payload=await response.json().catch(()=>null);
  if(!response.ok) throw new Error(`OPENAI_IMAGE_ERROR:${payload?.error?.message||`HTTP_${response.status}`}`);

  const base64=payload?.data?.[0]?.b64_json;
  if(!base64) throw new Error("OPENAI_IMAGE_EMPTY");
  const bytes=Uint8Array.from(atob(base64),(c)=>c.charCodeAt(0));
  if(bytes.length<10000) throw new Error("OUTPUT_IMAGE_TOO_SMALL");
  if(!(bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47)) throw new Error("OUTPUT_NOT_PNG");
  return bytes;
}

async function storeImage(renderId:string,pageId:string,bytes:Uint8Array){
  const safe=pageId.replace(/[^a-zA-Z0-9_-]/g,"_");
  const path=`${renderId}/${safe}.png`;
  const {error}=await service.storage.from(OUTPUT_BUCKET)
    .upload(path,bytes,{contentType:"image/png",upsert:true});
  if(error) throw error;
  const {data,error:signedError}=await service.storage.from(OUTPUT_BUCKET).createSignedUrl(path,SIGNED_URL_SECONDS);
  if(signedError) throw signedError;
  return {path,url:data.signedUrl};
}

async function renderPage(renderId:string,page:any,protagonist:Blob,identity:string){
  const prompt=buildPageRenderPrompt({
    sceneId:page.scene_id, atmosphere:page.atmosphere,
    protagonistIdentity:identity, protagonistPose:page.protagonist_pose||"in_piedi",
    helperId:page.helper_id||null, helperPose:page.helper_pose||"in_piedi"
  });
  const promptHash=await sha256(prompt);
  let lastError="";

  for(let attempt=Number(page.render?.attempts||0)+1;attempt<=MAX_ATTEMPTS;attempt++){
    try{
      const images:Blob[]=[await fetchBlob(assetUrl(page.background_ref),"BACKGROUND"),protagonist];
      if(page.helper_id){
        images.push(await fetchBlob(assetUrl(helperRef(page.helper_id,page.helper_pose||"in_piedi")),"HELPER"));
      }
      const bytes=await openAIEdit(images,prompt);
      const saved=await storeImage(renderId,page.page_id,bytes);
      return {...page,render:{status:"ready",generated_image_url:saved.url,generated_image_path:saved.path,
        attempts:attempt,prompt_hash:promptHash,error:null}};
    }catch(error){
      lastError=errMsg(error);
      if(attempt<MAX_ATTEMPTS) await sleep(1000*Math.pow(2,attempt-1));
    }
  }
  return {...page,render:{...page.render,status:"failed",attempts:MAX_ATTEMPTS,prompt_hash:promptHash,error:lastError||"UNKNOWN_RENDER_ERROR"}};
}

async function persistPages(id:string,pages:any[]){
  const {error}=await service.from("book_renders").update({pages,updated_at:new Date().toISOString()}).eq("id",id);
  if(error) throw error;
}

async function runBatches(id:string,initial:any[],protagonist:Blob,identity:string){
  const pages=initial.map(p=>({...p,render:{...p.render}}));
  while(true){
    const pending=pages.map((page,index)=>({page,index}))
      .filter(({page})=>page.render?.status!=="ready"&&Number(page.render?.attempts||0)<MAX_ATTEMPTS)
      .slice(0,MAX_CONCURRENCY);
    if(!pending.length) break;

    const results=await Promise.all(pending.map(({page})=>renderPage(id,page,protagonist,identity)));
    results.forEach((result,i)=>{pages[pending[i].index]=result;});
    await persistPages(id,pages);
  }
  return pages;
}

async function createOrResume(bookId:string,key:string,snapshot:any){
  const {data:existing,error}=await service.from("book_renders").select("*").eq("idempotency_key",key).maybeSingle();
  if(error) throw error;
  if(existing){
    if(existing.book_id!==bookId) throw new Error("IDEMPOTENCY_KEY_CONFLICT");
    if(existing.status!=="running") return {job:existing,run:false};
    const stamp=Date.parse(existing.updated_at||existing.created_at||"");
    const stale=!Number.isFinite(stamp)||Date.now()-stamp>STALE_RUNNING_MS;
    return {job:existing,run:stale};
  }

  const {data:created,error:createError}=await service.from("book_renders").insert({
    book_id:bookId,status:"running",idempotency_key:key,book_snapshot:snapshot,
    pages:planBookRender(snapshot),started_at:new Date().toISOString(),updated_at:new Date().toISOString()
  }).select("*").single();
  if(createError) throw createError;
  return {job:created,run:true};
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:corsHeaders});
  if(req.method!=="POST") return json(405,{error:"METHOD_NOT_ALLOWED"});

  try{
    requireEnv();
    const user=await authenticate(req);
    const body=await req.json().catch(()=>({}));
    const bookId=String(body?.book_id||"").trim();
    const key=String(body?.idempotency_key||"").trim();
    if(!bookId) return json(400,{error:"BOOK_ID_REQUIRED"});
    if(!key) return json(400,{error:"IDEMPOTENCY_KEY_REQUIRED"});

    const ctx=await loadContext(bookId,user.id);
    const {job,run}=await createOrResume(bookId,key,ctx.snapshot);
    if(!run) return json(job.status==="running"?202:200,{
      render_id:job.id,status:job.status,pages:job.pages,permalink_slug:job.permalink_slug,idempotent:true
    });

    await ensureBucket();
    await service.from("book_renders").update({status:"running",error:null,updated_at:new Date().toISOString()}).eq("id",job.id);

    const protagonist=await protagonistBlob(ctx.reference.storage_path);
    const pages=await runBatches(job.id,Array.isArray(job.pages)&&job.pages.length?job.pages:planBookRender(ctx.snapshot),protagonist,ctx.identity);

    const ready=allPagesReady(pages);
    const status=ready?"ready":"review";
    const slug=ready?(job.permalink_slug||`${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-","")):null;

    const {data:finished,error:finishError}=await service.from("book_renders").update({
      status,pages,permalink_slug:slug,error:ready?null:"ONE_OR_MORE_PAGES_FAILED",
      finished_at:new Date().toISOString(),updated_at:new Date().toISOString()
    }).eq("id",job.id).select("*").single();
    if(finishError) throw finishError;

    return json(200,{render_id:finished.id,status:finished.status,pages:finished.pages,
      permalink_slug:finished.permalink_slug,idempotent:false});
  }catch(error){
    const detail=errMsg(error);
    const status=(detail==="AUTH_REQUIRED"||detail==="AUTH_INVALID")?401:
      detail==="BOOK_NOT_FOUND"?404:detail==="BOOK_SNAPSHOT_MISSING"?409:500;
    return json(status,{error:detail});
  }
});
