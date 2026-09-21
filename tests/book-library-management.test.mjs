import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const api = await readFile(new URL("../supabase/functions/manage-book/index.ts", import.meta.url), "utf8");
const migration = await readFile(new URL("../supabase/migrations/20260921102628_add_books_archived_at.sql", import.meta.url), "utf8");

test("book library supports search, status, ordering and progressive loading", () => {
  assert.match(html, /id="saved-books-search"/);
  assert.match(html, /id="saved-books-filter"/);
  assert.match(html, /id="saved-books-order"/);
  assert.match(html, /limit:8/);
  assert.match(html, /dtBookLibrary\.limit\+=8/);
  assert.match(html, /function dtBookPriority/);
});

test("finished books are archived reversibly while drafts keep delete", () => {
  assert.match(html, /data-book-view="archived"/);
  assert.match(html, /dtManageSavedBook/);
  assert.match(html, /draft\?`<button[^`]+dtDeleteSavedBook/);
  assert.match(api, /auth\.getUser\(token\)/);
  assert.match(api, /\.eq\("id", bookId\)\.eq\("profile_id", user\.id\)/);
  assert.match(api, /DRAFT_DELETE_REQUIRED/);
  assert.match(api, /action === "archive" \? new Date\(\)\.toISOString\(\) : null/);
});

test("archive storage is additive and indexed per owner", () => {
  assert.match(migration, /add column if not exists archived_at timestamptz/);
  assert.match(migration, /\(profile_id, archived_at, updated_at desc\)/);
});
