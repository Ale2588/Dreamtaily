(function(globalObject){
  "use strict";

  function validateStory(story){
    const errors=[];
    const warnings=[];
    const fail=(code,message)=>errors.push({level:"error",code,message});
    const warn=(code,message)=>warnings.push({level:"warning",code,message});
    const setup=Array.isArray(story?.setup)?story.setup:[];
    const steps=Array.isArray(story?.steps)?story.steps:[];

    if(setup.length>2) fail("SETUP_TOO_MANY","Massimo 2 setup.");
    if(setup.filter(item=>item?.type==="branch").length>1) fail("SETUP_BRANCH_TOO_MANY","Massimo 1 setup branch.");

    const setupKeys=new Set();
    const setupByKey=new Map();
    const stepByKey=new Map();
    const decisionKeys=new Set();

    for(const item of setup){
      if(!item?.key){ fail("SETUP_KEY_MISSING","Setup senza key."); continue; }
      if(setupKeys.has(item.key)) fail("SETUP_KEY_DUPLICATE",item.key);
      setupKeys.add(item.key); setupByKey.set(item.key,item);
      const optionKeys=new Set();
      for(const option of item.options||[]){
        if(!option?.key) fail("SETUP_OPTION_KEY_MISSING",item.key);
        else if(optionKeys.has(option.key)) fail("SETUP_OPTION_KEY_DUPLICATE",`${item.key}/${option.key}`);
        else optionKeys.add(option.key);
      }
    }

    for(const step of steps){
      if(!step?.key){ fail("STEP_KEY_MISSING","Step senza key."); continue; }
      if(stepByKey.has(step.key)) fail("STEP_KEY_DUPLICATE",step.key);
      stepByKey.set(step.key,step);
      if(!step.composer_summary) warn("COMPOSER_SUMMARY_MISSING",step.key);

      for(const setupKey of Object.keys(step.variant_refs||{})){
        const setupItem=setupByKey.get(setupKey);
        if(!setupItem) fail("VARIANT_SETUP_UNKNOWN",setupKey);
        else if(setupItem.type!=="variant") fail("VARIANT_SETUP_NOT_VARIANT",setupKey);
        const expected=new Set((setupItem?.options||[]).map(option=>option.key));
        const actual=new Set(Object.keys(step.variant_refs?.[setupKey]||{}));
        for(const value of expected) if(!actual.has(value)) warn("VARIANT_OPTION_MISSING",`${step.key}/${setupKey}/${value}`);
        for(const value of actual) if(!expected.has(value)) fail("VARIANT_OPTION_UNKNOWN",`${step.key}/${setupKey}/${value}`);
      }

      const decision=step.decision;
      if(!decision) continue;
      if(!decision.key) fail("DECISION_KEY_MISSING",step.key);
      else if(setupKeys.has(decision.key)) fail("KEY_COLLISION",decision.key);
      else if(decision.type==="branch"&&decisionKeys.has(decision.key)) fail("DECISION_KEY_DUPLICATE",decision.key);
      else if(decision.type==="branch") decisionKeys.add(decision.key);

      if(decision.type==="branch"){
        const optionKeys=new Set();
        for(const option of decision.options||[]){
          if(!option?.key) fail("BRANCH_OPTION_KEY_MISSING",decision.key);
          else if(optionKeys.has(option.key)) fail("BRANCH_OPTION_KEY_DUPLICATE",`${decision.key}/${option.key}`);
          else optionKeys.add(option.key);
          if(!option?.next) fail("BRANCH_TERMINAL_OPTION",decision.key);
        }
      }else if(decision.type==="cast"){
        for(const entry of decision.catalog_roster||[]){
          if(!entry?.key||!entry?.entrance_ref) fail("ROSTER_ENTRY_INVALID",decision.key);
        }
      }else fail("DECISION_TYPE_INVALID",step.key);
    }

    if(!stepByKey.has(story?.start)) fail("START_INVALID",story?.start||"—");
    for(const step of steps){
      if(step.next&&!stepByKey.has(step.next)) fail("NEXT_DANGLING",step.next);
      if(step.decision?.type==="branch"){
        for(const option of step.decision.options||[]){
          if(option.next&&!stepByKey.has(option.next)) fail("OPTION_NEXT_DANGLING",option.next);
        }
      }
    }

    const reachable=new Set();
    const stack=[story?.start].filter(key=>stepByKey.has(key));
    let terminalFound=false;
    while(stack.length){
      const key=stack.pop();
      if(reachable.has(key)) continue;
      reachable.add(key);
      const step=stepByKey.get(key);
      const targets=step?.decision?.type==="branch"
        ?(step.decision.options||[]).map(option=>option.next).filter(Boolean)
        :(step?.next?[step.next]:[]);
      if(!targets.length) terminalFound=true;
      for(const target of targets) if(stepByKey.has(target)) stack.push(target);
    }
    if(!terminalFound) fail("NO_REACHABLE_END","Nessun finale raggiungibile.");
    for(const key of stepByKey.keys()) if(!reachable.has(key)) warn("STEP_UNREACHABLE",key);

    return {valid:errors.length===0,errors,warnings};
  }

  globalObject.DreamTailyStoryValidator={validateStory};

  /*
   * GATE D TEMPORARY ADAPTER
   * ------------------------
   * index.html still asks for stories/catalog.json, story.json,
   * scene-pilot.json and markdown refs. For Gate D we deliberately
   * intercept ONLY those reads and serve them from the immutable
   * PublishedStoryVersion contract.
   *
   * IMPORTANT: there is intentionally NO repository fallback.
   * If the DB/API fails, the story flow fails visibly. This makes
   * the Gate D test meaningful instead of silently using old files.
   */
  const NATIVE_FETCH=globalObject.fetch.bind(globalObject);
  const PUBLISHED_STORY_URL=
    "https://hirzbtruxvjzmcnncvmv.supabase.co/functions/v1/published-story";
  const contractCache=new Map();
  let catalogPromise=null;

  function jsonResponse(value,status=200){
    return new Response(JSON.stringify(value),{
      status,
      headers:{
        "Content-Type":"application/json; charset=utf-8",
        "Cache-Control":"no-store",
        "X-DreamTaily-Story-Source":"published-story-db"
      }
    });
  }

  function textResponse(value,status=200){
    return new Response(String(value??""),{
      status,
      headers:{
        "Content-Type":"text/plain; charset=utf-8",
        "Cache-Control":"no-store",
        "X-DreamTaily-Story-Source":"published-story-db"
      }
    });
  }

  async function requestJson(url){
    const response=await NATIVE_FETCH(url,{cache:"no-store"});
    const payload=await response.json().catch(()=>null);
    if(!response.ok||!payload){
      throw new Error(payload?.error||`PUBLISHED_STORY_HTTP_${response.status}`);
    }
    return payload;
  }

  async function loadCatalog(){
    if(!catalogPromise){
      catalogPromise=requestJson(PUBLISHED_STORY_URL)
        .then(payload=>{
          const stories=Array.isArray(payload.stories)?payload.stories:[];
          return stories.map(item=>({
            slug:item.slug,
            title:item.title||item.slug,
            age:item.age||"",
            tone:item.tone||"",
            length:item.length||"Percorso dinamico",
            description:item.description||"",
            image:item.image||"assets/char/water/bear.png",
            definition:`stories/${item.slug}/story.json`,
            published_version:item.version||null
          }));
        })
        .catch(error=>{
          catalogPromise=null;
          throw error;
        });
    }
    return catalogPromise;
  }

  async function loadContract(slug){
    if(contractCache.has(slug)) return contractCache.get(slug);
    const promise=requestJson(`${PUBLISHED_STORY_URL}?slug=${encodeURIComponent(slug)}`)
      .then(payload=>{
        if(!payload.contract?.story||!payload.contract?.scenes||!payload.contract?.contentByRef){
          throw new Error(`PUBLISHED_STORY_CONTRACT_INVALID:${slug}`);
        }
        return payload;
      })
      .catch(error=>{
        contractCache.delete(slug);
        throw error;
      });
    contractCache.set(slug,promise);
    return promise;
  }

  function requestPath(input){
    try{
      const raw=typeof input==="string"?input:input?.url;
      return new URL(raw,globalObject.location?.href||"https://dreamtaily.invalid/").pathname;
    }catch(_error){
      return "";
    }
  }

  globalObject.fetch=async function dreamTailyGateDFetch(input,init){
    const path=requestPath(input);

    if(/\/stories\/catalog\.json$/.test(path)){
      return jsonResponse(await loadCatalog());
    }

    const storyMatch=path.match(/\/stories\/([^/]+)\/(.+)$/);
    if(!storyMatch){
      return NATIVE_FETCH(input,init);
    }

    const slug=decodeURIComponent(storyMatch[1]);
    const ref=decodeURIComponent(storyMatch[2]);

    // Do not intercept visual assets; only authoring/runtime source files.
    const isDefinition=ref==="story.json";
    const isSceneContract=ref==="scene-pilot.json";
    const isTextRef=ref.startsWith("chapters/")||ref.startsWith("entrances/");
    if(!isDefinition&&!isSceneContract&&!isTextRef){
      return NATIVE_FETCH(input,init);
    }

    const payload=await loadContract(slug);
    const contract=payload.contract;

    if(isDefinition){
      return jsonResponse(contract.story);
    }
    if(isSceneContract){
      return jsonResponse(contract.scenes);
    }

    if(!Object.prototype.hasOwnProperty.call(contract.contentByRef,ref)){
      return textResponse(`Missing published story ref: ${ref}`,404);
    }
    return textResponse(contract.contentByRef[ref]);
  };

  globalObject.DreamTailyPublishedStorySource={
    mode:"published-story-db",
    endpoint:PUBLISHED_STORY_URL,
    loadCatalog,
    loadContract,
    clearCache(){
      catalogPromise=null;
      contractCache.clear();
    }
  };

})(typeof window!=="undefined"?window:globalThis);
