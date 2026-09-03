import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":"POST, OPTIONS"
};
const svc = createClient(SUPABASE_URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}});

function reply(status:number,body:unknown){
  return new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
}
function message(error:unknown){ return error instanceof Error?error.message:String(error); }

async function authenticate(req:Request){
  const token=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"").trim();
  if(!token) throw new Error("AUTH_REQUIRED");
  const client=createClient(SUPABASE_URL,ANON,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await client.auth.getUser(token);
  if(error||!data.user) throw new Error("AUTH_INVALID");
  return data.user;
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
  if(req.method!=="POST") return reply(405,{error:"METHOD_NOT_ALLOWED"});
  try{
    const user=await authenticate(req);
    const body=await req.json().catch(()=>({}));
    const bookId=String(body.book_id||"").trim();
    const email=String(body.email||"").trim().toLowerCase();
    const idempotencyKey=String(body.idempotency_key||"").trim();
    if(!bookId) return reply(400,{error:"BOOK_ID_REQUIRED"});
    if(!idempotencyKey) return reply(400,{error:"IDEMPOTENCY_KEY_REQUIRED"});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400,{error:"CHECKOUT_EMAIL_INVALID"});

    const {data:existing,error:existingError}=await svc.from("book_renders")
      .select("id,book_id,status,permalink_slug")
      .eq("idempotency_key",idempotencyKey).maybeSingle();
    if(existingError) throw existingError;
    if(existing){
      const {data:owned}=await svc.from("books").select("id").eq("id",existing.book_id).eq("profile_id",user.id).maybeSingle();
      if(!owned||existing.book_id!==bookId) throw new Error("IDEMPOTENCY_KEY_CONFLICT");
      return reply(200,{render_id:existing.id,book_id:bookId,status:existing.status,
        permalink_slug:existing.permalink_slug,idempotent:true});
    }

    const {data:book,error:bookError}=await svc.from("books")
      .select("id,profile_id,title,current_style,status").eq("id",bookId).eq("profile_id",user.id).maybeSingle();
    if(bookError) throw bookError;
    if(!book) throw new Error("BOOK_NOT_FOUND");
    if(book.status!=="draft") throw new Error("BOOK_NOT_EDITABLE");

    const {data:stories,error:storiesError}=await svc.from("book_stories")
      .select("id,story_slug,story_version_id,position,status,path_choices,content_snapshot")
      .eq("book_id",bookId).order("position");
    if(storiesError) throw storiesError;
    if(!stories?.length) throw new Error("BOOK_HAS_NO_STORIES");
    if(stories.some((story:any)=>story.status!=="ready"||!story.content_snapshot?.meta||!Array.isArray(story.content_snapshot?.pages)))
      throw new Error("BOOK_STORIES_INCOMPLETE");

    const storyIds=stories.map((story:any)=>story.id);
    const {data:assignments,error:assignmentError}=await svc.from("story_cast_assignments")
      .select("book_story_id,slot_key,character_asset_id,catalog_character_id")
      .in("book_story_id",storyIds);
    if(assignmentError) throw assignmentError;
    const characterIds=[...new Set((assignments||[]).map((item:any)=>item.character_asset_id).filter(Boolean))];
    const {data:characters,error:characterError}=characterIds.length
      ?await svc.from("character_assets").select("id,name,traits,identity_prompt,default_style,status").in("id",characterIds)
      :{data:[],error:null};
    if(characterError) throw characterError;
    const {data:references,error:referenceError}=characterIds.length
      ?await svc.from("character_references").select("character_asset_id,style,view_type,storage_path,status,created_at").in("character_asset_id",characterIds).eq("status","ready").order("created_at",{ascending:false})
      :{data:[],error:null};
    if(referenceError) throw referenceError;

    const characterById=new Map((characters||[]).map((item:any)=>[item.id,item]));
    const snapshotStories=stories.map((story:any)=>{
      const cast=(assignments||[]).filter((item:any)=>item.book_story_id===story.id).map((item:any)=>{
        const character=item.character_asset_id?characterById.get(item.character_asset_id):null;
        const reference=character?(references||[]).find((ref:any)=>
          ref.character_asset_id===character.id&&ref.style===character.default_style&&ref.view_type==="canonical"
        )||(references||[]).find((ref:any)=>ref.character_asset_id===character.id):null;
        return {slot_key:item.slot_key,character_asset_id:item.character_asset_id,
          catalog_character_id:item.catalog_character_id,
          character:character?{id:character.id,name:character.name,traits:character.traits,
            identity_prompt:character.identity_prompt,default_style:character.default_style,
            reference:reference?{style:reference.style,view_type:reference.view_type,storage_path:reference.storage_path}:null}:null};
      });
      const protagonist=cast.find((item:any)=>item.slot_key==="protagonist");
      if(!protagonist?.character?.identity_prompt) throw new Error(`PROTAGONIST_IDENTITY_MISSING:${story.id}`);
      if(!protagonist?.character?.reference?.storage_path) throw new Error(`PROTAGONIST_REFERENCE_MISSING:${story.id}`);
      return {book_story_id:story.id,story_slug:story.story_slug,story_version_id:story.story_version_id,
        position:story.position,path_choices:story.path_choices,content:story.content_snapshot,cast};
    });

    const confirmedAt=new Date().toISOString();
    const snapshot={schema_version:"checkout-book-v1",confirmed_at:confirmedAt,
      meta:{book_id:book.id,title:book.title,style:book.current_style,story_count:snapshotStories.length},
      stories:snapshotStories};
    const {data:finalized,error:finalizeError}=await svc.rpc("finalize_book_checkout_v1",{
      p_book_id:book.id,p_profile_id:user.id,p_idempotency_key:idempotencyKey,
      p_checkout_email:email,p_book_snapshot:snapshot
    });
    if(finalizeError) throw finalizeError;
    return reply(201,finalized);
  }catch(error){
    const detail=message(error);
    const status=detail.startsWith("AUTH_")?401:detail==="BOOK_NOT_FOUND"?404:
      /INCOMPLETE|NOT_EDITABLE|MISSING/.test(detail)?409:500;
    console.error("checkout-book-v1",detail);
    return reply(status,{error:detail});
  }
});

