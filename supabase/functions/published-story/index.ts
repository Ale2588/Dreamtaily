import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const svc=createClient(SUPABASE_URL,SERVICE_ROLE,{
  auth:{persistSession:false,autoRefreshToken:false}
});
const cors={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"content-type, apikey, authorization",
  "Access-Control-Allow-Methods":"GET, OPTIONS"
};

function reply(status:number,body:unknown){
  return new Response(JSON.stringify(body),{
    status,
    headers:{...cors,"Content-Type":"application/json","Cache-Control":"no-store, max-age=0"}
  });
}
function validSlug(v:string){
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  if(req.method!=="GET")return reply(405,{error:"METHOD_NOT_ALLOWED"});

  try{
    const slug=String(new URL(req.url).searchParams.get("slug")||"").trim();

    if(!slug){
      const {data:projects,error:pe}=await svc.from("story_projects")
        .select("id,slug,public_title,age_range,tone,description,current_published_version_id")
        .eq("status","active")
        .not("current_published_version_id","is",null)
        .order("public_title");
      if(pe)throw pe;

      const ids=(projects||[])
        .map((p:any)=>p.current_published_version_id)
        .filter(Boolean);
      if(!ids.length)return reply(200,{stories:[]});

      const {data:versions,error:ve}=await svc.from("story_versions")
        .select("id,version_number,status,published_at,published_contract")
        .in("id",ids)
        .eq("status","published");
      if(ve)throw ve;

      const byId=new Map((versions||[]).map((v:any)=>[v.id,v]));
      const stories=(projects||[]).map((p:any)=>{
        const v:any=byId.get(p.current_published_version_id);
        if(!v?.published_contract)return null;
        const story=v.published_contract?.story||{};
        return {
          slug:p.slug,
          title:story.title||p.public_title||p.slug,
          age:story.editorial?.age_range||story.age_range||p.age_range||null,
          tone:story.editorial?.tone||story.tone||p.tone||null,
          description:story.editorial?.summary||story.editorial?.description||story.summary||p.description||"",
          image:story.editorial?.cover_ref||story.cover_image||"assets/char/water/bear.png",
          length:"Percorso dinamico",
          version:v.version_number,
          published_at:v.published_at
        };
      }).filter(Boolean);

      return reply(200,{stories});
    }

    if(!validSlug(slug))return reply(400,{error:"INVALID_SLUG"});

    const {data:p,error:pe}=await svc.from("story_projects")
      .select("id,slug,current_published_version_id")
      .eq("slug",slug)
      .eq("status","active")
      .maybeSingle();
    if(pe)throw pe;
    if(!p?.current_published_version_id)return reply(404,{error:"STORY_NOT_FOUND"});

    const {data:v,error:ve}=await svc.from("story_versions")
      .select("id,version_number,status,published_contract,published_at")
      .eq("id",p.current_published_version_id)
      .eq("story_project_id",p.id)
      .eq("status","published")
      .maybeSingle();
    if(ve)throw ve;
    if(!v?.published_contract)return reply(404,{error:"STORY_NOT_FOUND"});

    return reply(200,{
      slug:p.slug,
      version_id:v.id,
      version_number:v.version_number,
      published_at:v.published_at,
      contract:v.published_contract
    });
  }catch(error){
    console.error("published-story",error);
    return reply(500,{error:"STORY_CATALOG_FAILED"});
  }
});
