import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BUCKET = Deno.env.get("DREAMTAILY_RENDER_BUCKET") || "book-renders";
const SIGNED_SECONDS = 60 * 60;
const cors = {
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"content-type, apikey, authorization",
  "Access-Control-Allow-Methods":"GET, OPTIONS"
};
const svc=createClient(SUPABASE_URL,SERVICE_ROLE,{auth:{persistSession:false,autoRefreshToken:false}});

function reply(status:number,body:unknown){
  return new Response(JSON.stringify(body),{
    status,
    headers:{...cors,"Content-Type":"application/json","Cache-Control":"no-store, max-age=0"}
  });
}
function validSlug(value:string){ return /^[a-f0-9]{48,96}$/i.test(value); }

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
  if(req.method!=="GET") return reply(405,{error:"METHOD_NOT_ALLOWED"});
  try{
    const slug=String(new URL(req.url).searchParams.get("slug")||"").trim();
    if(!validSlug(slug)) return reply(400,{error:"INVALID_SLUG"});

    const {data:render,error}=await svc.from("book_renders")
      .select("id,status,permalink_slug,book_snapshot,pages,finished_at")
      .eq("permalink_slug",slug).eq("status","ready").maybeSingle();
    if(error) throw error;
    if(!render) return reply(404,{error:"BOOK_NOT_FOUND"});

    const rawPages=Array.isArray(render.pages)?render.pages:[];
    if(!rawPages.length) return reply(409,{error:"BOOK_EMPTY"});
    const paths=rawPages.map((p:any)=>p?.render?.generated_image_path||null);
    if(paths.some((p:any)=>!p)) return reply(409,{error:"BOOK_INCOMPLETE"});

    const {data:signed,error:signedError}=await svc.storage.from(BUCKET).createSignedUrls(paths,SIGNED_SECONDS);
    if(signedError) throw signedError;

    const pages=rawPages.map((p:any,index:number)=>({
      page_id:p.page_id,kind:p.kind,chapter:p.chapter,title:p.title||"",text:p.text||"",
      scene_id:p.scene_id||null,image_url:signed?.[index]?.signedUrl||null
    }));
    const snapshot=render.book_snapshot||{};
    return reply(200,{
      render_id:render.id,
      title:snapshot?.meta?.title||pages.find((p:any)=>p.kind==="cover")?.title||"DreamTaily",
      protagonist:snapshot?.meta?.protagonist||null,
      helper:snapshot?.meta?.helper||null,
      style:snapshot?.meta?.style||null,
      finished_at:render.finished_at,
      pages
    });
  }catch(error){
    console.error("deliver-book",error);
    return reply(500,{error:"DELIVERY_FAILED"});
  }
});
