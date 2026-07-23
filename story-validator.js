(function(global){
  "use strict";

  function validateStory(story, availableFiles){
    const errors=[];
    const warnings=[];
    const files=availableFiles ? new Set(availableFiles) : null;

    const fail=(code,message,path="")=>errors.push({level:"error",code,message,path});
    const warn=(code,message,path="")=>warnings.push({level:"warning",code,message,path});

    if(!story || typeof story!=="object"){
      fail("STORY_NOT_OBJECT","La storia deve essere un oggetto JSON.");
      return {valid:false,errors,warnings};
    }

    const steps=Array.isArray(story.steps)?story.steps:[];
    const stepKeys=new Set();
    const decisionKeys=new Set();
    const stepByKey=new Map();

    for(const [index,step] of steps.entries()){
      const path=`steps[${index}]`;
      if(!step?.key){ fail("STEP_KEY_MISSING","Passo senza key.",path); continue; }
      if(stepKeys.has(step.key)) fail("STEP_KEY_DUPLICATE",`Step key duplicata: ${step.key}.`,path);
      stepKeys.add(step.key);
      stepByKey.set(step.key,step);

      if(!step.content_ref) fail("CONTENT_REF_MISSING",`content_ref mancante in ${step.key}.`,path);
      else if(files && !files.has(step.content_ref)) fail("CONTENT_FILE_MISSING",`File non trovato: ${step.content_ref}.`,path);

      if(!step.composer_summary) warn("COMPOSER_SUMMARY_MISSING",`composer_summary mancante in ${step.key}.`,path);

      const d=step.decision;
      if(!d) continue;
      if(!d.key) fail("DECISION_KEY_MISSING",`Decisione senza key in ${step.key}.`,path);
      else if(d.type==="branch" && decisionKeys.has(d.key)) fail("DECISION_KEY_DUPLICATE",`Decision key duplicata: ${d.key}.`,path);
      else if(d.type==="branch") decisionKeys.add(d.key);

      if(d.type==="branch"){
        if(!Array.isArray(d.options) || d.options.length<2) fail("BRANCH_OPTIONS_INVALID",`Il bivio ${d.key} deve avere almeno due opzioni.`,path);
        for(const [optIndex,opt] of (d.options||[]).entries()){
          if(!opt.next) fail("BRANCH_TERMINAL_OPTION",`L'opzione ${opt.key||optIndex} di ${d.key} deve puntare a un passo finale reale.`,`${path}.decision.options[${optIndex}]`);
        }
      }else if(d.type==="cast"){
        const allowsCatalog=(d.allowed_sources||[]).includes("catalog_character");
        if(!allowsCatalog && (d.catalog_roster||[]).length){
          warn("ROSTER_SOURCE_MISMATCH",`Il roster di ${d.key} è valorizzato ma catalog_character non è ammesso.`,path);
        }
        for(const [rIndex,entry] of (d.catalog_roster||[]).entries()){
          if(typeof entry!=="object" || !entry.key || !entry.entrance_ref){
            fail("ROSTER_ENTRY_INVALID",`Voce roster incompleta in ${d.key}.`,`${path}.decision.catalog_roster[${rIndex}]`);
          }else if(files && !files.has(entry.entrance_ref)){
            fail("ENTRANCE_FILE_MISSING",`File d'entrata non trovato: ${entry.entrance_ref}.`,`${path}.decision.catalog_roster[${rIndex}]`);
          }
        }
      }else{
        fail("DECISION_TYPE_INVALID",`Tipo decisione non valido in ${step.key}.`,path);
      }
    }

    if(!story.start || !stepByKey.has(story.start)) fail("START_INVALID",`Il passo iniziale ${story.start||"—"} non esiste.`);

    for(const step of steps){
      if(step.next && !stepByKey.has(step.next)) fail("NEXT_DANGLING",`${step.key} punta a uno step inesistente: ${step.next}.`);
      const d=step.decision;
      if(d?.type==="branch"){
        for(const opt of d.options||[]){
          if(opt.next && !stepByKey.has(opt.next)) fail("OPTION_NEXT_DANGLING",`${d.key}/${opt.key} punta a uno step inesistente: ${opt.next}.`);
        }
      }
    }

    const reachable=new Set();
    const stack=story.start?[story.start]:[];
    let terminalReachable=false;
    while(stack.length){
      const key=stack.pop();
      if(reachable.has(key)) continue;
      reachable.add(key);
      const step=stepByKey.get(key);
      if(!step) continue;
      const targets=[];
      if(step.decision?.type==="branch") targets.push(...(step.decision.options||[]).map(o=>o.next).filter(Boolean));
      else if(step.next) targets.push(step.next);
      if(!targets.length) terminalReachable=true;
      stack.push(...targets);
    }

    if(!terminalReachable) fail("NO_REACHABLE_END","Nessun finale è raggiungibile dal passo iniziale.");
    for(const key of stepKeys) if(!reachable.has(key)) warn("STEP_UNREACHABLE",`Passo irraggiungibile: ${key}.`);

    function maxDecisionDepth(key, visiting=new Set()){
      if(!key || visiting.has(key)) return 0;
      const step=stepByKey.get(key);
      if(!step) return 0;
      const nextVisiting=new Set(visiting); nextVisiting.add(key);
      const weight=step.decision?1:0;
      if(step.decision?.type==="branch"){
        return weight+Math.max(0,...(step.decision.options||[]).map(o=>maxDecisionDepth(o.next,nextVisiting)));
      }
      return weight+maxDecisionDepth(step.next,nextVisiting);
    }
    const decisions=maxDecisionDepth(story.start);
    if(Number.isInteger(story.max_decisions) && decisions>story.max_decisions){
      warn("MAX_DECISIONS_EXCEEDED",`Il percorso più lungo contiene ${decisions} decisioni, oltre max_decisions=${story.max_decisions}.`);
    }

    return {valid:errors.length===0,errors,warnings,stats:{steps:steps.length,reachable:reachable.size,maxDecisions:decisions}};
  }

  global.DreamTailyStoryValidator={validateStory};
})(typeof window!=="undefined"?window:globalThis);
