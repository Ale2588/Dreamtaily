(function(){
"use strict";

const STORY_ROOT="stories/il-bosco-dei-sussurri";
const HELPER_CATALOG={
  etto:{name:"Etto",image:"assets/char/crayon/fox.png"},
  briciola:{name:"Briciola",image:"assets/char/water/rabbit.png"},
  fiamma:{name:"Fiamma",image:"assets/char/water/bear.png"},
  ulivo:{name:"Ulivo",image:"assets/char/paper/rabbit.png"}
};

let sourceCache=null;
let bookPageIndex=0;
let checkoutEmail="";

function injectMvpStyles(){
  if(document.getElementById("dt-mvp-styles")) return;
  const style=document.createElement("style");
  style.id="dt-mvp-styles";
  style.textContent=`
  .dt-setup-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,.82fr);gap:22px}
  .dt-choice-block{padding:20px;border:1px solid var(--line);border-radius:20px;background:#fff;margin-top:14px}
  .dt-choice-block.setup{background:#f8f3ea}
  .dt-choice-block.story{border-left:5px solid var(--coral)}
  .dt-choice-block h2{font-family:'Baloo 2';font-size:22px;margin-bottom:4px}
  .dt-choice-prompt{color:var(--muted);font-size:14px;line-height:1.5;margin-bottom:12px}
  .dt-choice-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
  .dt-choice-option{border:2px solid var(--line);border-radius:15px;background:#fff;padding:12px;text-align:left;color:var(--brown)}
  .dt-choice-option.selected{border-color:var(--coral);background:#fff5f1;box-shadow:0 8px 20px rgba(232,115,90,.13)}
  .dt-choice-option img{width:100%;height:94px;object-fit:cover;border-radius:10px;margin-bottom:8px;background:#efe7da}
  .dt-choice-option strong{display:block}
  .dt-setup-preview{position:sticky;top:18px;padding:20px}
  .dt-preview-character{width:150px;height:150px;border-radius:22px;object-fit:contain;background:linear-gradient(160deg,#dce8df,#f4e6d2);display:block;margin:0 auto 14px}
  .dt-preview-story{font-family:'Lora';font-style:italic;line-height:1.65;color:var(--muted);text-align:center}
  .dt-compose-status{display:none;margin-top:12px;padding:12px 14px;border-radius:12px;background:#e4f0ef;color:#356f70;font-weight:800}
  .dt-compose-status.visible{display:block}
  .dt-reader-shell{max-width:760px;margin:0 auto}
  .dt-reader-card{overflow:hidden;border-radius:28px;background:var(--paper);border:1px solid var(--line);box-shadow:var(--shadow)}
  .dt-reader-image{position:relative;aspect-ratio:4/3;overflow:hidden;background:linear-gradient(160deg,#dce8df,#526d65)}
  .dt-reader-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .dt-reader-wash{position:absolute;inset:0;z-index:1;pointer-events:none}
  .dt-reader-layer{position:absolute;transform:translate(-50%,-100%);width:auto;object-fit:contain;filter:drop-shadow(0 10px 12px rgba(0,0,0,.25))}
  .dt-reader-copy{padding:24px clamp(20px,5vw,42px) 28px}
  .dt-reader-chapter{font-size:12px;text-transform:uppercase;letter-spacing:1.3px;color:var(--coral-dark);font-weight:800}
  .dt-reader-copy h1{font-family:'Baloo 2';font-size:clamp(28px,5vw,42px);line-height:1.05;margin:6px 0 13px}
  .dt-reader-text{font-family:'Lora';font-size:clamp(17px,2vw,20px);line-height:1.72;white-space:pre-wrap}
  .dt-reader-qa{display:inline-flex;margin-top:16px;padding:5px 9px;border-radius:999px;font-size:11px;font-weight:800}
  .dt-reader-qa.ok{background:#e3f2e7;color:#3e7148}.dt-reader-qa.bad{background:#fdeae5;color:#a8402e}
  .dt-reader-nav{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:16px}
  .dt-reader-dots{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;flex:1}
  .dt-reader-dot{width:9px;height:9px;padding:0;border:0;border-radius:50%;background:#d8cab5}
  .dt-reader-dot.active{width:24px;border-radius:8px;background:var(--teal)}
  .dt-checkout-grid{display:grid;grid-template-columns:1fr .8fr;gap:20px}
  .dt-summary-list{margin-top:14px}
  .dt-summary-row{display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid var(--line)}
  .dt-delivery-link{display:flex;gap:8px;align-items:center;margin-top:18px;padding:13px;border:1px solid var(--line);border-radius:14px;background:#fff}
  .dt-delivery-link code{flex:1;overflow-wrap:anywhere}
  @media(max-width:820px){.dt-setup-grid,.dt-checkout-grid{grid-template-columns:1fr}.dt-setup-preview{position:static;order:-1}}
  @media(max-width:560px){.dt-choice-options{grid-template-columns:1fr}.dt-reader-nav{display:grid;grid-template-columns:1fr 1fr}.dt-reader-dots{grid-column:1/-1;grid-row:1}.dt-reader-nav .btn{width:100%;padding:12px}}
  `;
  document.head.appendChild(style);
}

function storyStepByKey(key){
  return app.activeStoryDefinition?.steps?.find(step=>step.key===key)||null;
}

function branchDecision(key){
  return (app.activeStoryDefinition?.steps||[])
    .map(step=>step.decision)
    .find(decision=>decision?.type==="branch"&&decision.key===key)||null;
}

function chosenHelperId(){
  const value=app.compositionChoices.helper;
  return typeof value==="string"?value:value?.value||null;
}

function currentProtagonist(){
  const current=app.bookStories.find(item=>item.id===app.activeBookStoryId);
  const assignment=current?.story_cast_assignments?.find(item=>item.slot_key==="protagonist");
  const saved=app.savedCharacters.find(item=>item.id===assignment?.character_asset_id);
  return {
    name:saved?.name||value("name")||"Il tuo personaggio",
    image:saved?.image_url||app.previewUrl||"assets/char/water/rabbit.png"
  };
}

function helperDecisionForPath(pathKey){
  const decision=branchDecision("d_sentiero");
  const option=(decision?.options||[]).find(item=>item.key===pathKey);
  let key=option?.next||null;
  const visited=new Set();
  while(key&&!visited.has(key)){
    visited.add(key);
    const step=storyStepByKey(key);
    if(!step) return null;
    if(step.decision?.type==="cast") return step.decision;
    key=step.next||null;
  }
  return null;
}

function setupOption(key,value){
  const item=(app.activeStoryDefinition?.setup||[]).find(entry=>entry.key===key);
  return (item?.options||[]).find(option=>option.key===value)||null;
}

function optionButton({key,value,label,image,selected,onClick}){
  return `<button type="button" class="dt-choice-option ${selected?"selected":""}"
    onclick="${onClick}">
    ${image?`<img src="${escapeHtml(image)}" alt="">`:""}
    <strong>${escapeHtml(label)}</strong>
  </button>`;
}

function renderMvpSetup(){
  injectMvpStyles();
  const definition=app.activeStoryDefinition;
  if(!definition) return;

  const protagonist=currentProtagonist();
  const atmosphere=(definition.setup||[]).find(item=>item.key==="atmosfera");
  const sentiero=branchDecision("d_sentiero");
  const finale=branchDecision("d_finale");
  const selectedPath=app.compositionChoices.d_sentiero||null;
  const helperDecision=helperDecisionForPath(selectedPath);
  const helperId=chosenHelperId();

  if(helperId&&!(helperDecision?.catalog_roster||[]).some(item=>item.key===helperId)){
    delete app.compositionChoices.helper;
  }

  const atmosphereHtml=(atmosphere?.options||[]).map(option=>optionButton({
    key:"atmosfera",value:option.key,label:option.label,
    image:option.image_ref?`${STORY_ROOT}/${option.image_ref}`:"",
    selected:app.compositionChoices.atmosfera===option.key,
    onClick:`selectMvpChoice('atmosfera','${option.key}')`
  })).join("");

  const pathHtml=(sentiero?.options||[]).map(option=>optionButton({
    key:"d_sentiero",value:option.key,label:option.label,image:"",
    selected:selectedPath===option.key,
    onClick:`selectMvpChoice('d_sentiero','${option.key}')`
  })).join("");

  const helperHtml=selectedPath
    ?(helperDecision?.catalog_roster||[]).map(entry=>{
      const item=HELPER_CATALOG[entry.key];
      if(!item) return "";
      return optionButton({
        key:"helper",value:entry.key,label:item.name,image:item.image,
        selected:chosenHelperId()===entry.key,
        onClick:`selectMvpHelper('${entry.key}','${escapeHtml(entry.entrance_ref)}')`
      });
    }).join("")
    :`<p class="dt-choice-prompt">Scegli prima il sentiero: gli incontri cambiano in base al ramo.</p>`;

  const finaleHtml=(finale?.options||[]).map(option=>optionButton({
    key:"d_finale",value:option.key,label:option.label,image:"",
    selected:app.compositionChoices.d_finale===option.key,
    onClick:`selectMvpChoice('d_finale','${option.key}')`
  })).join("");

  const ready=Boolean(
    app.compositionChoices.atmosfera&&
    app.compositionChoices.d_sentiero&&
    chosenHelperId()&&
    app.compositionChoices.d_finale
  );

  const screen=document.getElementById("screen-setup");
  screen.innerHTML=`
    <div class="shell">
      <div class="topbar">
        <button class="brand-dark" onclick="showScreen('stories')">
          <img src="assets/brand/dreamtaily-icon.png" alt=""><span>DreamTaily</span>
        </button>
        <div class="phase">4 · Prepara la storia</div>
      </div>
      <div class="dt-setup-grid">
        <div class="panel" style="padding:clamp(22px,4vw,38px)">
          <div class="phase">Il Bosco dei Sussurri</div>
          <h1 class="step-title">Le scelte della tua avventura</h1>
          <p class="intro">Quattro scelte, tutte su una pagina. Il testo del libro è già scritto: qui decidi quale percorso vivrà ${escapeHtml(protagonist.name)}.</p>

          <section class="dt-choice-block setup">
            <h2>${escapeHtml(atmosphere?.prompt||"Quando comincia la storia?")}</h2>
            <p class="dt-choice-prompt">Cambia luce e sensazioni, non gli eventi.</p>
            <div class="dt-choice-options">${atmosphereHtml}</div>
          </section>

          <section class="dt-choice-block story">
            <h2>${escapeHtml(String(sentiero?.prompt||"Da che parte prosegue [Nome]?").replaceAll("[Nome]",protagonist.name))}</h2>
            <p class="dt-choice-prompt">Questa scelta cambia l’incontro e due capitoli del percorso.</p>
            <div class="dt-choice-options">${pathHtml}</div>
          </section>

          <section class="dt-choice-block story">
            <h2>${escapeHtml(String(helperDecision?.prompt||"Chi accompagna [Nome]?").replaceAll("[Nome]",protagonist.name))}</h2>
            <p class="dt-choice-prompt">Sono mostrati solo gli aiutanti con un’entrata scritta per il ramo scelto.</p>
            <div class="dt-choice-options">${helperHtml}</div>
          </section>

          <section class="dt-choice-block story">
            <h2>${escapeHtml(finale?.prompt||"Come termina l’avventura?")}</h2>
            <p class="dt-choice-prompt">La storia converge, poi l’ultimo capitolo cambia davvero.</p>
            <div class="dt-choice-options">${finaleHtml}</div>
          </section>

          <div class="error" id="setup-error"></div>
          <div class="dt-compose-status" id="dt-compose-status">Sto componendo il libro…</div>
          <div class="form-actions">
            <button class="btn btn-ghost" onclick="showScreen('stories')">← Cambia storia</button>
            <button class="btn btn-primary" id="setup-next" ${ready?"":"disabled"} onclick="composeAndOpenMvpBook()">Sfoglia il libro →</button>
          </div>
        </div>

        <aside class="panel dt-setup-preview">
          <img class="dt-preview-character" src="${escapeHtml(protagonist.image)}" alt="${escapeHtml(protagonist.name)}">
          <h2 style="font-family:'Baloo 2';text-align:center">${escapeHtml(protagonist.name)}</h2>
          <p class="dt-preview-story">${selectedPath
            ?selectedPath==="felci"
              ?"Le felci si muovono senza vento. Qualcuno aspetta tra le foglie."
              :"Il ruscello custodisce piccole impronte. Qualcuno conosce la strada."
            :"Il sentiero non è ancora stato scelto."}</p>
        </aside>
      </div>
    </div>`;
}

window.selectMvpChoice=function(key,choice){
  app.compositionChoices[key]=choice;
  if(key==="atmosfera") app.setupChoices.atmosfera=choice;
  if(key==="d_sentiero") delete app.compositionChoices.helper;
  renderMvpSetup();
};

window.selectMvpHelper=function(helperId,entranceRef){
  app.compositionChoices.helper={
    source:"catalog_character",
    value:helperId,
    entrance_ref:entranceRef
  };
  renderMvpSetup();
};

async function loadCompositionSource(){
  if(sourceCache) return sourceCache;
  const [story,rawScenes]=await Promise.all([
    fetch(`${STORY_ROOT}/story.json`,{cache:"no-store"}).then(checkResponse).then(r=>r.json()),
    fetch(`${STORY_ROOT}/scene-pilot.json`,{cache:"no-store"}).then(checkResponse).then(r=>r.json())
  ]);
  const refs=new Set();
  for(const step of story.steps||[]){
    if(step.content_ref) refs.add(step.content_ref);
    for(const variants of Object.values(step.variant_refs||{})){
      for(const ref of Object.values(variants||{})) refs.add(ref);
    }
    for(const entry of step.decision?.catalog_roster||[]){
      if(entry.entrance_ref) refs.add(entry.entrance_ref);
    }
  }
  const contentByRef={};
  await Promise.all([...refs].map(async ref=>{
    const response=await fetch(`${STORY_ROOT}/${ref}`,{cache:"no-store"});
    checkResponse(response);
    contentByRef[ref]=await response.text();
  }));
  const scenes=structuredClone(rawScenes);
  const prefix=ref=>!ref||/^(?:https?:|data:|blob:|\/)/.test(ref)?ref:`${STORY_ROOT}/${ref}`;
  const fix=scene=>{
    if(!scene) return;
    scene.background_ref=prefix(scene.background_ref);
    for(const variants of Object.values(scene.variant_backgrounds||{})){
      for(const key of Object.keys(variants)) variants[key]=prefix(variants[key]);
    }
  };
  fix(scenes.cover);
  Object.values(scenes.scenes||{}).forEach(fix);
  sourceCache={story,scenes,contentByRef};
  return sourceCache;
}

function checkResponse(response){
  if(!response.ok) throw new Error(`HTTP_${response.status}:${response.url}`);
  return response;
}

async function persistMvpChoices(){
  const helper=app.compositionChoices.helper;
  const pathChoices={
    atmosfera:app.compositionChoices.atmosfera,
    d_sentiero:app.compositionChoices.d_sentiero,
    d_finale:app.compositionChoices.d_finale
  };
  const client=getSupabase();
  const {error:pathError}=await client.from("book_stories")
    .update({path_choices:pathChoices,updated_at:new Date().toISOString()})
    .eq("id",app.activeBookStoryId);
  if(pathError) throw pathError;

  const {error:helperError}=await client.from("story_cast_assignments")
    .upsert({
      book_story_id:app.activeBookStoryId,
      slot_key:"helper",
      character_asset_id:null,
      catalog_character_id:helper.value
    },{onConflict:"book_story_id,slot_key"});
  if(helperError) throw helperError;
}

function validateResolvedBook(book){
  const marker=/\[[^\]]+\]/;
  const failures=book.pages.filter(page=>marker.test(page.text||""));
  if(failures.length){
    console.error("[DreamTaily] Marker residui:",failures);
    throw new Error("MARKER_IRRISOLTI");
  }
  return true;
}

window.composeAndOpenMvpBook=async function(){
  const button=document.getElementById("setup-next");
  const status=document.getElementById("dt-compose-status");
  button.disabled=true;
  status?.classList.add("visible");
  showError("setup-error",null);

  try{
    await persistMvpChoices();
    const [{composeStory},source]=await Promise.all([
      import("./src/story-composer.js"),
      loadCompositionSource()
    ]);
    const protagonist=currentProtagonist();
    const helperId=chosenHelperId();
    const catalog=Object.fromEntries(
      Object.entries(HELPER_CATALOG).map(([key,item])=>[key,{name:item.name,image:item.image}])
    );
    const book=composeStory({
      story:source.story,
      scenes:source.scenes,
      contentByRef:source.contentByRef,
      catalog,
      choices:{
        story:source.story.slug,
        style:app.style,
        protagonist:{name:protagonist.name,asset_ref:protagonist.image},
        cast:{helper:helperId},
        setup:{atmosfera:app.compositionChoices.atmosfera},
        branches:{
          d_sentiero:app.compositionChoices.d_sentiero,
          d_finale:app.compositionChoices.d_finale
        }
      }
    });
    validateResolvedBook(book);
    app.composedBook=book;
    app.composedBookChoices={
      atmosfera:app.compositionChoices.atmosfera,
      d_sentiero:app.compositionChoices.d_sentiero,
      helper:helperId,
      d_finale:app.compositionChoices.d_finale
    };
    bookPageIndex=0;
    renderMvpBook();
    showScreen("book");
  }catch(error){
    console.error("[DreamTaily] Composition error:",error);
    showError("setup-error",
      error?.message==="MARKER_IRRISOLTI"
        ?"Il libro contiene ancora un marcatore tecnico. Ho bloccato l’anteprima."
        :"Non sono riuscito a comporre il libro. Controlla le scelte e riprova."
    );
  }finally{
    button.disabled=false;
    status?.classList.remove("visible");
  }
};

function sceneHtml(scene){
  const bg=scene?.bg
    ?`<img class="dt-reader-bg" src="${escapeHtml(scene.bg)}" alt="" onerror="this.remove()">`
    :"";
  const wash=scene?.wash?`<div class="dt-reader-wash" style="background:${escapeHtml(scene.wash)}"></div>`:"";
  const layers=[...(scene?.layers||[])].sort((a,b)=>(a.z||0)-(b.z||0)).map(layer=>`
    <img class="dt-reader-layer" src="${escapeHtml(layer.src)}" alt=""
      style="left:${Number(layer.x||0)*100}%;top:${Number(layer.y||0)*100}%;
      height:${Number(layer.scale||0)*100}%;z-index:${Number(layer.z||0)+2}"
      onerror="this.remove()">`).join("");
  return bg+wash+layers;
}

function readableSequence(){
  const book=app.composedBook;
  if(!book) return [];
  const cover=book.cover?[
    {
      id:"cover",kind:"cover",chapter:null,
      title:book.cover.title||book.meta.title,
      text:book.cover.subtitle||"",
      scene:book.cover.scene
    }
  ]:[];
  return cover.concat(book.pages.map(page=>({...page,kind:"page"})));
}

window.goToMvpBookPage=function(index){
  const seq=readableSequence();
  bookPageIndex=Math.max(0,Math.min(Number(index)||0,seq.length-1));
  renderMvpBook();
};

function renderMvpBook(){
  injectMvpStyles();
  const seq=readableSequence();
  if(!seq.length){
    renderBookSummary();
    return;
  }
  const page=seq[bookPageIndex];
  const last=bookPageIndex===seq.length-1;
  const marker=/\[[^\]]+\]/.test(page.text||"");
  const screen=document.getElementById("screen-book");
  screen.innerHTML=`
    <div class="shell">
      <div class="topbar">
        <button class="brand-dark" onclick="showScreen('landing')">
          <img src="assets/brand/dreamtaily-icon.png" alt=""><span>DreamTaily</span>
        </button>
        <div class="phase">5 · Sfoglia il libro</div>
      </div>
      <div class="dt-reader-shell">
        <div class="dt-reader-card">
          <div class="dt-reader-image">${sceneHtml(page.scene)}</div>
          <div class="dt-reader-copy">
            <div class="dt-reader-chapter">${page.kind==="cover"?"Copertina":`Capitolo ${page.chapter}`}</div>
            <h1>${escapeHtml(page.title)}</h1>
            <div class="dt-reader-text">${escapeHtml(page.text)}</div>
            <span class="dt-reader-qa ${marker?"bad":"ok"}">${marker?"⚠ marcatore residuo":"✓ testo risolto"}</span>
          </div>
        </div>
        <div class="dt-reader-nav">
          <button class="btn btn-ghost" ${bookPageIndex===0?"disabled":""} onclick="goToMvpBookPage(${bookPageIndex-1})">← Indietro</button>
          <div class="dt-reader-dots">${seq.map((_,index)=>`
            <button class="dt-reader-dot ${index===bookPageIndex?"active":""}" onclick="goToMvpBookPage(${index})" aria-label="Pagina ${index+1}"></button>
          `).join("")}</div>
          ${last
            ?`<button class="btn btn-primary" onclick="openMvpCheckout()">Ordina il libro →</button>`
            :`<button class="btn btn-primary" onclick="goToMvpBookPage(${bookPageIndex+1})">Avanti →</button>`}
        </div>
        <div class="form-actions" style="justify-content:center">
          <button class="btn btn-soft" onclick="renderMvpSetup();showScreen('setup')">← Modifica le scelte</button>
        </div>
      </div>
    </div>`;
}

function ensureCheckoutScreens(){
  if(document.getElementById("screen-checkout")) return;
  document.body.insertAdjacentHTML("beforeend",`
  <section class="screen" id="screen-checkout"></section>
  <section class="screen" id="screen-delivery"></section>`);
}

function choiceLabel(decisionKey,valueKey){
  const decision=branchDecision(decisionKey);
  return (decision?.options||[]).find(item=>item.key===valueKey)?.label||valueKey||"—";
}

window.openMvpCheckout=function(){
  ensureCheckoutScreens();
  const protagonist=currentProtagonist();
  const helper=HELPER_CATALOG[chosenHelperId()];
  const atmosphere=setupOption("atmosfera",app.composedBookChoices?.atmosfera);
  const pages=app.composedBook?.pages?.length||0;
  const screen=document.getElementById("screen-checkout");
  screen.innerHTML=`
    <div class="shell">
      <div class="topbar">
        <button class="brand-dark" onclick="renderMvpBook();showScreen('book')">
          <img src="assets/brand/dreamtaily-icon.png" alt=""><span>DreamTaily</span>
        </button>
        <div class="phase">6 · Checkout dimostrativo</div>
      </div>
      <div class="dt-checkout-grid">
        <div class="panel" style="padding:clamp(24px,4vw,40px)">
          <div class="phase">Il libro è già pronto</div>
          <h1 class="step-title">Dove lo consegniamo?</h1>
          <p class="intro">Nessuna coda: il libro è già pronto. Questo pagamento è soltanto una simulazione per il test MVP.</p>
          <label for="dt-checkout-email">Email</label>
          <input class="input" id="dt-checkout-email" type="email" value="${escapeHtml(checkoutEmail)}"
            placeholder="nome@esempio.it" oninput="checkoutEmail=this.value;updateMvpPayButton()">
          <div class="error" id="checkout-error"></div>
          <button class="btn btn-primary" id="dt-pay-button" style="width:100%;margin-top:18px"
            onclick="completeMvpCheckout()" disabled>Paga €9,90 (finto)</button>
        </div>
        <aside class="panel" style="padding:24px">
          <h2 style="font-family:'Baloo 2'">${escapeHtml(app.composedBook.meta.title)}</h2>
          <div class="dt-summary-list">
            ${[
              ["Protagonista",protagonist.name],
              ["Aiutante",helper?.name||"—"],
              ["Stile",app.style],
              ["Atmosfera",atmosphere?.label||"—"],
              ["Sentiero",choiceLabel("d_sentiero",app.composedBookChoices?.d_sentiero)],
              ["Finale",choiceLabel("d_finale",app.composedBookChoices?.d_finale)],
              ["Capitoli",String(pages)]
            ].map(([key,val])=>`<div class="dt-summary-row"><span>${escapeHtml(key)}</span><strong>${escapeHtml(val)}</strong></div>`).join("")}
          </div>
        </aside>
      </div>
    </div>`;
  showScreen("checkout");
};

window.updateMvpPayButton=function(){
  const email=document.getElementById("dt-checkout-email")?.value.trim()||"";
  checkoutEmail=email;
  const valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const button=document.getElementById("dt-pay-button");
  if(button) button.disabled=!valid;
};

async function markBookReady(){
  const client=getSupabase();
  const now=new Date().toISOString();
  const {error:storyError}=await client.from("book_stories")
    .update({status:"ready",path_choices:{
      atmosfera:app.composedBookChoices.atmosfera,
      d_sentiero:app.composedBookChoices.d_sentiero,
      d_finale:app.composedBookChoices.d_finale
    },updated_at:now})
    .eq("id",app.activeBookStoryId);
  if(storyError) throw storyError;
  const {error:bookError}=await client.from("books")
    .update({status:"ready",updated_at:now})
    .eq("id",app.bookId);
  if(bookError) throw bookError;
}

window.completeMvpCheckout=async function(){
  const email=document.getElementById("dt-checkout-email")?.value.trim()||"";
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    showError("checkout-error","Inserisci un’email valida.");
    return;
  }
  const button=document.getElementById("dt-pay-button");
  button.disabled=true;
  button.textContent="Consegna in corso…";
  try{
    await markBookReady();
    renderMvpDelivery();
    showScreen("delivery");
  }catch(error){
    console.error("[DreamTaily] Ready save error:",error);
    showError("checkout-error","Il libro è pronto, ma non sono riuscito a salvarne lo stato. Riprova.");
    button.disabled=false;
    button.textContent="Paga €9,90 (finto)";
  }
};

function renderMvpDelivery(){
  ensureCheckoutScreens();
  const protagonist=currentProtagonist();
  const slug=(protagonist.name||"libro").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const permanent=`${location.origin}${location.pathname}?book=${encodeURIComponent(app.bookId||slug)}`;
  const screen=document.getElementById("screen-delivery");
  screen.innerHTML=`
    <div class="shell" style="max-width:720px">
      <div class="panel" style="padding:clamp(28px,6vw,56px);text-align:center">
        <div style="font-size:58px">🎉</div>
        <div class="phase">Consegna</div>
        <h1 class="step-title">Il tuo libro è pronto</h1>
        <p class="intro">Il Bosco dei Sussurri di ${escapeHtml(protagonist.name)} è stato salvato come pronto.</p>
        <div class="dt-delivery-link">
          <code id="dt-permanent-link">${escapeHtml(permanent)}</code>
          <button class="btn btn-soft" onclick="copyMvpBookLink()">Copia</button>
        </div>
        <div class="form-actions" style="justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="bookPageIndex=0;renderMvpBook();showScreen('book')">Apri il libro</button>
          <button class="btn btn-ghost" onclick="openCharacterLibrary()">Torna alla libreria</button>
          <button class="btn btn-soft" onclick="showScreen('landing')">Torna alla home</button>
        </div>
      </div>
    </div>`;
}

window.copyMvpBookLink=async function(){
  const text=document.getElementById("dt-permanent-link")?.textContent||"";
  try{await navigator.clipboard.writeText(text)}catch(_error){}
};

async function startMvpStory(story,bookStoryId){
  const definition=await loadStoryDefinition(story);
  app.activeStoryDefinition=definition;
  app.activeBookStoryId=bookStoryId;
  await loadBookStories();
  await ensureBookCharactersHydrated();

  const current=app.bookStories.find(item=>item.id===bookStoryId);
  app.compositionChoices={...(current?.path_choices||{})};
  const helper=current?.story_cast_assignments?.find(item=>item.slot_key==="helper");
  if(helper?.catalog_character_id){
    const decision=helperDecisionForPath(app.compositionChoices.d_sentiero);
    const entry=(decision?.catalog_roster||[]).find(item=>item.key===helper.catalog_character_id);
    if(entry){
      app.compositionChoices.helper={
        source:"catalog_character",
        value:entry.key,
        entrance_ref:entry.entrance_ref
      };
    }
  }
  renderMvpSetup();
  showScreen("setup");
}

/* Replace only the orphan iframe entry point. */
window.startStoryComposer=startMvpStory;

/* Reopen a composed in-memory book; otherwise return to its choices. */
const originalGoToBook=window.goToBook;
window.goToBook=async function(){
  if(app.composedBook){
    renderMvpBook();
    showScreen("book");
    return;
  }
  if(app.activeStoryDefinition&&app.activeBookStoryId){
    renderMvpSetup();
    showScreen("setup");
    return;
  }
  return originalGoToBook?.();
};

injectMvpStyles();
ensureCheckoutScreens();
})();