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
    if(setup.filter(item=>item?.type==="branch").length>1){
      fail("SETUP_BRANCH_TOO_MANY","Massimo 1 setup branch.");
    }

    const setupKeys=new Set();
    const setupByKey=new Map();
    const stepByKey=new Map();
    const decisionKeys=new Set();

    for(const item of setup){
      if(!item?.key){
        fail("SETUP_KEY_MISSING","Setup senza key.");
        continue;
      }
      if(setupKeys.has(item.key)) fail("SETUP_KEY_DUPLICATE",item.key);
      setupKeys.add(item.key);
      setupByKey.set(item.key,item);

      const optionKeys=new Set();
      for(const option of item.options||[]){
        if(!option?.key) fail("SETUP_OPTION_KEY_MISSING",item.key);
        else if(optionKeys.has(option.key)){
          fail("SETUP_OPTION_KEY_DUPLICATE",`${item.key}/${option.key}`);
        }else optionKeys.add(option.key);
      }
    }

    for(const step of steps){
      if(!step?.key){
        fail("STEP_KEY_MISSING","Step senza key.");
        continue;
      }
      if(stepByKey.has(step.key)) fail("STEP_KEY_DUPLICATE",step.key);
      stepByKey.set(step.key,step);

      if(!step.composer_summary) warn("COMPOSER_SUMMARY_MISSING",step.key);

      for(const setupKey of Object.keys(step.variant_refs||{})){
        const setupItem=setupByKey.get(setupKey);
        if(!setupItem) fail("VARIANT_SETUP_UNKNOWN",setupKey);
        else if(setupItem.type!=="variant") fail("VARIANT_SETUP_NOT_VARIANT",setupKey);

        const expected=new Set((setupItem?.options||[]).map(option=>option.key));
        const actual=new Set(Object.keys(step.variant_refs?.[setupKey]||{}));
        for(const value of expected){
          if(!actual.has(value)) warn("VARIANT_OPTION_MISSING",`${step.key}/${setupKey}/${value}`);
        }
        for(const value of actual){
          if(!expected.has(value)) fail("VARIANT_OPTION_UNKNOWN",`${step.key}/${setupKey}/${value}`);
        }
      }

      const decision=step.decision;
      if(!decision) continue;
      if(!decision.key) fail("DECISION_KEY_MISSING",step.key);
      else if(setupKeys.has(decision.key)) fail("KEY_COLLISION",decision.key);
      else if(decisionKeys.has(decision.key)) fail("DECISION_KEY_DUPLICATE",decision.key);
      else decisionKeys.add(decision.key);

      if(decision.type==="branch"){
        const optionKeys=new Set();
        for(const option of decision.options||[]){
          if(!option?.key) fail("BRANCH_OPTION_KEY_MISSING",decision.key);
          else if(optionKeys.has(option.key)){
            fail("BRANCH_OPTION_KEY_DUPLICATE",`${decision.key}/${option.key}`);
          }else optionKeys.add(option.key);

          if(!option?.next) fail("BRANCH_TERMINAL_OPTION",decision.key);
        }
      }else if(decision.type==="cast"){
        for(const entry of decision.catalog_roster||[]){
          if(!entry?.key||!entry?.entrance_ref){
            fail("ROSTER_ENTRY_INVALID",decision.key);
          }
        }
      }else{
        fail("DECISION_TYPE_INVALID",step.key);
      }
    }


    if(!stepByKey.has(story?.start)) fail("START_INVALID",story?.start||"—");

    for(const item of setup.filter(item=>item?.type==="branch")){
      for(const option of item.options||[]){
        if(!stepByKey.has(option.start)) fail("SETUP_START_DANGLING",option.start);
      }
    }

    for(const step of steps){
      if(step.next&&!stepByKey.has(step.next)) fail("NEXT_DANGLING",step.next);
      if(step.decision?.type==="branch"){
        for(const option of step.decision.options||[]){
          if(option.next&&!stepByKey.has(option.next)){
            fail("OPTION_NEXT_DANGLING",option.next);
          }
        }
      }
    }

    const starts=new Set([story?.start]);
    for(const item of setup.filter(item=>item?.type==="branch")){
      for(const option of item.options||[]) starts.add(option.start);
    }

    const reachable=new Set();
    const stack=[...starts].filter(key=>stepByKey.has(key));
    let terminalFound=false;

    while(stack.length){
      const key=stack.pop();
      if(reachable.has(key)) continue;
      reachable.add(key);

      const step=stepByKey.get(key);
      const decision=step?.decision;
      const targets=decision?.type==="branch"
        ?(decision.options||[]).map(option=>option.next).filter(Boolean)
        :(step?.next?[step.next]:[]);

      if(!targets.length) terminalFound=true;
      for(const target of targets){
        if(stepByKey.has(target)) stack.push(target);
      }
    }

    if(!terminalFound) fail("NO_REACHABLE_END","Nessun finale raggiungibile.");
    for(const key of stepByKey.keys()){
      if(!reachable.has(key)) warn("STEP_UNREACHABLE",key);
    }

    for(const item of setup.filter(item=>item?.type==="variant")){
      if(!steps.some(step=>step.variant_refs?.[item.key])){
        warn("SETUP_VARIANT_UNUSED",item.key);
      }
    }

    if(Number.isInteger(story?.max_decisions)){
      const memo=new Map();
      const visiting=new Set();

      function maxDecisionsFrom(key){
        if(!stepByKey.has(key)) return 0;
        if(memo.has(key)) return memo.get(key);
        if(visiting.has(key)) return 0;

        visiting.add(key);
        const step=stepByKey.get(key);
        const decision=step?.decision;
        const own=decision?1:0;
        let childMax=0;

        if(decision?.type==="branch"){
          childMax=Math.max(
            0,
            ...(decision.options||[]).map(option=>maxDecisionsFrom(option.next))
          );
        }else if(step?.next){
          childMax=maxDecisionsFrom(step.next);
        }

        visiting.delete(key);
        const total=own+childMax;
        memo.set(key,total);
        return total;
      }

      const pathStarts=[story?.start];
      for(const item of setup.filter(item=>item?.type==="branch")){
        for(const option of item.options||[]) pathStarts.push(option.start);
      }

      const actualMax=Math.max(
        0,
        ...pathStarts.filter(Boolean).map(maxDecisionsFrom)
      );

      if(actualMax>story.max_decisions){
        fail(
          "MAX_DECISIONS_EXCEEDED",
          `Dichiarato ${story.max_decisions}, massimo per percorso ${actualMax}.`
        );
      }
    }

    return {valid:errors.length===0,errors,warnings};
  }

  globalObject.DreamTailyStoryValidator={validateStory};
})(typeof window!=="undefined"?window:globalThis);
