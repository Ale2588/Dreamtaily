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

test("book reader and checkout distinguish preview from final AI generation",()=>{
  assert.match(html,/Questa è un’anteprima del tuo libro/);
  assert.match(html,/genererà con l’IA le illustrazioni finali/);
  assert.match(html,/Continua e genera il libro finale/);
  assert.match(html,/La conferma avvierà la generazione tramite IA/);
});
