import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html=await readFile(new URL("../index.html",import.meta.url),"utf8");

test("the homepage account menu exposes the essential personal space",()=>{
  assert.match(html,/id="dt-account-trigger"/);
  assert.match(html,/I miei libri/);
  assert.match(html,/I miei personaggi/);
  assert.match(html,/id="dt-account-create"/);
  assert.match(html,/Esci da questo dispositivo/);
});

test("account state distinguishes anonymous and permanent users",()=>{
  assert.match(html,/async function refreshDtAccountUI\(\)/);
  assert.match(html,/!user\.is_anonymous&&user\.email/);
  assert.match(html,/Il tuo spazio gratuito/);
  assert.match(html,/Il tuo spazio DreamTaily/);
  assert.match(html,/auth\.onAuthStateChange/);
});

test("voluntary signup resumes in the library without enabling account merge",()=>{
  assert.match(html,/requireDtAccount\('account_home'\)/);
  assert.match(html,/if\(action==='account_home'\)return openBookLibrary\(\)/);
  assert.doesNotMatch(html,/merge-account/);
});

test("logout is local, clears pending intent and reloads away cached account data",()=>{
  assert.match(html,/auth\.signOut\(\{scope:'local'\}\)/);
  assert.match(html,/authInFlight=null/);
  assert.match(html,/sessionStorage\.removeItem\('dreamtaily\.auth\.pending_action'\)/);
  assert.match(html,/location\.replace\(location\.pathname\)/);
});
