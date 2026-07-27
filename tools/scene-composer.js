(function(globalObject){
  "use strict";

  const CANONICAL_POSES=new Set([
    "in_piedi",
    "cammina",
    "seduto",
    "si_china",
    "di_spalle"
  ]);

  function resolveStoryAsset(storySlug,ref){
    if(!ref) return "";
    if(/^(?:https?:|data:|blob:|\/)/.test(ref)) return ref;
    return `../stories/${storySlug}/${ref}`;
  }

  function resolveBackground(scene,choices){
    let ref=scene?.background_ref||"";
    for(const [key,variants] of Object.entries(scene?.variant_backgrounds||{})){
      const selected=choices?.[key];
      if(selected&&variants?.[selected]) ref=variants[selected];
    }
    return ref;
  }

  function validateScene(scene,roles){
    const errors=[];
    if(!scene||typeof scene!=="object"){
      errors.push("SCENE_MISSING");
      return errors;
    }
    if(!scene.background_ref) errors.push("BACKGROUND_REF_MISSING");

    for(const [variantKey,values] of Object.entries(scene.variant_backgrounds||{})){
      if(!variantKey) errors.push("VARIANT_KEY_MISSING");
      for(const [value,ref] of Object.entries(values||{})){
        if(!value||!ref) errors.push(`VARIANT_BACKGROUND_INVALID:${variantKey}/${value}`);
      }
    }

    for(const slot of scene.slots||[]){
      if(!roles.has(slot.role)) errors.push(`ROLE_UNKNOWN:${slot.role}`);
      if(!CANONICAL_POSES.has(slot.pose)) errors.push(`POSE_INVALID:${slot.pose}`);
      for(const field of ["x","y","scale"]){
        if(typeof slot[field]!=="number"||slot[field]<0||slot[field]>1){
          errors.push(`SLOT_${field.toUpperCase()}_INVALID:${slot.role}`);
        }
      }
      if(!Number.isFinite(slot.z)) errors.push(`SLOT_Z_INVALID:${slot.role}`);
    }
    return errors;
  }

  function renderScene({
    container,
    storySlug,
    scene,
    choices={},
    cast={}
  }){
    if(!container) throw new Error("CONTAINER_REQUIRED");

    const roles=new Set(Object.keys(cast));
    const errors=validateScene(scene,roles);
    if(errors.length) throw new Error(errors.join(", "));

    container.innerHTML="";
    container.classList.add("dt-scene-stage");

    const background=document.createElement("img");
    background.className="dt-scene-background";
    background.src=resolveStoryAsset(storySlug,resolveBackground(scene,choices));
    background.alt="";
    container.appendChild(background);

    const slots=[...(scene.slots||[])].sort((a,b)=>a.z-b.z);
    for(const slot of slots){
      const character=cast[slot.role];
      if(!character) continue;

      const poseRef=character.poses?.[slot.pose]||character.poses?.in_piedi;
      if(!poseRef) continue;

      const image=document.createElement("img");
      image.className="dt-scene-character";
      image.src=poseRef.startsWith("../")||/^(?:https?:|data:|blob:|\/)/.test(poseRef)
        ?poseRef
        :resolveStoryAsset(storySlug,poseRef);
      image.alt=character.name||slot.role;
      image.style.left=`${slot.x*100}%`;
      image.style.top=`${slot.y*100}%`;
      image.style.height=`${slot.scale*100}%`;
      image.style.zIndex=String(slot.z);
      container.appendChild(image);
    }

    return {
      background: background.src,
      slots: slots.length
    };
  }

  globalObject.DreamTailySceneComposer={
    CANONICAL_POSES,
    resolveStoryAsset,
    resolveBackground,
    validateScene,
    renderScene
  };
})(typeof window!=="undefined"?window:globalThis);
