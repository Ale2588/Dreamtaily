import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html=await readFile(new URL("../index.html",import.meta.url),"utf8");

test("anonymous visitors keep one character and one story before the account gate",()=>{
  assert.match(html,/async function dtPermanentUser\(\)/);
  assert.match(html,/user&&!user\.is_anonymous&&Boolean\(user\.email\)/);
  assert.match(html,/requireDtAccount\('add_story_same'\)/);
  assert.match(html,/requireDtAccount\('add_story_character'\)/);
  assert.match(html,/requireDtAccount\('new_character'\)/);
  assert.match(html,/requireDtAccount\('checkout'\)/);
});

test("new registration links email to the current anonymous user and resumes intent",()=>{
  assert.match(html,/auth\.updateUser\(\{email\},\{emailRedirectTo:redirect\.href\}\)/);
  assert.match(html,/dreamtaily\.auth\.pending_action/);
  assert.match(html,/resumeDtAuthAction/);
  assert.match(html,/Salva il mondo che hai creato/);
  assert.match(html,/senza perdere il personaggio e il racconto/);
});

test("registration gate is centered, illustrated and reassures about saved work",()=>{
  assert.match(html,/\.dt-auth-dialog\{position:fixed;inset:0;[^}]*margin:auto/);
  assert.match(html,/assets\/home\/bambino-carta\.webp/);
  assert.match(html,/Il tuo piccolo mondo resta con te/);
  assert.match(html,/Quello che hai fatto finora è già al sicuro/);
});

test("email confirmation waits for Supabase and returns to the interrupted journey",()=>{
  assert.match(html,/async function waitForDtPermanentUser/);
  assert.match(html,/onAuthStateChange/);
  assert.match(html,/async function handleDtAuthReturn/);
  assert.match(html,/Il tuo spazio è pronto/);
  assert.match(html,/if\(sessionStorage\.getItem\('dreamtaily\.auth\.pending_action'\)\)return resumeDtAuthAction\(\)/);
  assert.match(html,/return openBookLibrary\(\)/);
  assert.match(html,/await detectDraftBook\(\);await detectSavedCharactersForHomepage\(\);await handleDtAuthReturn\(\)/);
});

test("existing accounts use a short-lived merge ticket before passwordless login",()=>{
  assert.match(html,/Hai già uno spazio DreamTaily\?/);
  assert.match(html,/functions\.invoke\('merge-account',\{body:\{action:'prepare'\}\}\)/);
  assert.match(html,/sessionStorage\.setItem\('dreamtaily\.auth\.merge_claim',data\.claim_token\)/);
  assert.match(html,/signInWithOtp\(\{email,options:\{shouldCreateUser:false,emailRedirectTo:redirect\.href\}\}\)/);
  assert.match(html,/redirect\.searchParams\.set\('merge_resume','1'\)/);
});

test("returning existing accounts finalize the merge before resuming the journey",()=>{
  assert.match(html,/functions\.invoke\('merge-account',\{body:\{action:'finalize',claim_token:claimToken\}\}\)/);
  assert.match(html,/await finalizeDtExistingAccountMerge\(\)/);
  assert.match(html,/app\.savedCharacters=\[\];app\.bookId=null;app\.bookStories=\[\]/);
  assert.match(html,/Il collegamento del lavoro anonimo è scaduto/);
});

test("book reader and checkout distinguish preview from final AI generation",()=>{
  assert.match(html,/Questa è un’anteprima del tuo libro/);
  assert.match(html,/genererà con l’IA le illustrazioni finali/);
  assert.match(html,/Continua e genera il libro finale/);
  assert.match(html,/La conferma avvierà la generazione tramite IA/);
});
