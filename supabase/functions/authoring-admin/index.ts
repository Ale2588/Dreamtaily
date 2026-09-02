import { createClient } from "npm:@supabase/supabase-js@2";
import { validateAuthoringContract } from "../_shared/story-authoring-validator.js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const AGE_RANGES = new Set(["3–5 anni", "4–7 anni", "4–8 anni", "5–9 anni", "6–10 anni"]);
const TONES = new Set(["Dolce e luminoso", "Caldo e rassicurante", "Avventuroso e rassicurante", "Curiosità e amicizia", "Coraggio e ascolto", "Fiabesco e contemplativo"]);
const IMAGE_TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const ADMINS = new Set(
  (Deno.env.get("AUTHORING_ADMIN_EMAILS") || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
);
const svc = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
};

function reply(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function currentUser(req: Request) {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new Error("AUTH_REQUIRED");
  const auth = createClient(SUPABASE_URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await auth.auth.getUser(token);
  if (error || !data.user) throw new Error("AUTH_INVALID");
  return data.user;
}

function isAdmin(user: { email?: string | null }) {
  return Boolean(user.email && ADMINS.has(user.email.toLowerCase()));
}

function uuid(value: unknown) {
  const normalized = String(value || "");
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)
    ? normalized
    : null;
}

async function json(req: Request) {
  return await req.json().catch(() => ({}));
}

async function ownedProject(projectId: string, uid: string, admin: boolean) {
  const { data, error } = await svc
    .from("story_projects")
    .select("id,owner_id")
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { response: reply(404, { error: "PROJECT_NOT_FOUND" }) };
  if (data.owner_id !== uid && !admin) return { response: reply(403, { error: "PROJECT_FORBIDDEN" }) };
  return { project: data };
}

async function ownedVersion(versionId: string, uid: string, admin: boolean) {
  const { data: version, error } = await svc
    .from("story_versions")
    .select("id,story_project_id,version_number,status,source_story,source_scenes,content_by_ref,validation_report,updated_at")
    .eq("id", versionId)
    .maybeSingle();
  if (error) throw error;
  if (!version) return { response: reply(404, { error: "VERSION_NOT_FOUND" }) };
  const access = await ownedProject(version.story_project_id, uid, admin);
  if (access.response) return access;
  return { version };
}

async function listProjects(uid: string, admin: boolean) {
  let query = svc
    .from("story_projects")
    .select("id,slug,internal_title,public_title,status,owner_id,current_published_version_id,updated_at")
    .order("updated_at", { ascending: false });
  if (!admin) query = query.eq("owner_id", uid);
  const { data: projects, error } = await query;
  if (error) throw error;
  const ids = (projects || []).map((project) => project.id);
  const { data: versions, error: versionError } = ids.length
    ? await svc
        .from("story_versions")
        .select("id,story_project_id,version_number,status,published_at,updated_at,source_story")
        .in("story_project_id", ids)
    : { data: [], error: null };
  if (versionError) throw versionError;
  return (projects || []).map((project) => {
    const own = (versions || []).filter((version) => version.story_project_id === project.id);
    const latest = own.sort((left, right) => right.version_number - left.version_number)[0] || null;
    const latestStory = latest?.source_story || {};
    return {
      ...project,
      public_title: latestStory.title || project.public_title,
      draft_count: own.filter((version) => version.status === "draft").length,
      published_version: own.find((version) => version.id === project.current_published_version_id) || null,
      latest_version: latest,
    };
  });
}

async function createProject(req: Request, uid: string) {
  const body = await json(req);
  const slug = String(body.slug || "").trim().toLowerCase();
  const internalTitle = String(body.internal_title || "").trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return reply(400, { error: "SLUG_INVALID" });
  if (!internalTitle || internalTitle.length > 160) return reply(400, { error: "INTERNAL_TITLE_INVALID" });
  if (!AGE_RANGES.has(String(body.age_range || ""))) return reply(400, { error: "AGE_RANGE_INVALID" });
  if (!TONES.has(String(body.tone || ""))) return reply(400, { error: "TONE_INVALID" });

  const { data: project, error: projectError } = await svc
    .from("story_projects")
    .insert({
      slug,
      internal_title: internalTitle,
      public_title: String(body.public_title || internalTitle).trim(),
      language: String(body.language || "it").trim(),
      age_range: body.age_range || null,
      tone: body.tone || null,
      description: body.description || null,
      status: "active",
      owner_id: uid,
    })
    .select("id,slug,internal_title,owner_id,created_at")
    .single();
  if (projectError) {
    if (projectError.code === "23505") return reply(409, { error: "SLUG_ALREADY_EXISTS" });
    throw projectError;
  }

  const sourceStory = {
    slug,
    version: 1,
    title: String(body.public_title || internalTitle).trim(),
    editorial: {
      age_range: body.age_range,
      tone: body.tone,
      summary: body.description || null,
      description: body.description || null,
      cover_ref: null,
    },
    start: null,
    cast_slots: [{ key: "protagonist", label: "Protagonista", allowed_sources: ["user_character"], introduced_at: "start" }],
    steps: [],
  };
  const { data: version, error: versionError } = await svc
    .from("story_versions")
    .insert({
      story_project_id: project.id,
      version_number: 1,
      status: "draft",
      source_story: sourceStory,
      source_scenes: { version: 1, scenes: {} },
      content_by_ref: {},
      validation_report: { status: "not_validated" },
    })
    .select("id,version_number,status,updated_at")
    .single();
  if (versionError) {
    await svc.from("story_projects").delete().eq("id", project.id).eq("owner_id", uid);
    throw versionError;
  }
  return reply(201, { project, version });
}

function decodeBase64(value: unknown) {
  const encoded = String(value || "");
  if (!encoded || encoded.length > 11_200_000) return null;
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  } catch (_error) {
    return null;
  }
}

function validImageBytes(bytes: Uint8Array, contentType: string) {
  if (contentType === "image/png") return bytes.length > 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  if (contentType === "image/jpeg") return bytes.length > 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (contentType === "image/webp") return bytes.length > 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return false;
}

async function uploadAsset(req: Request, versionId: string, uid: string, admin: boolean) {
  const access = await ownedVersion(versionId, uid, admin);
  if (access.response) return access.response;
  if (access.version.status !== "draft") return reply(409, { error: "VERSION_IMMUTABLE" });
  const body = await json(req);
  const kind = body.kind === "cover" ? "cover" : body.kind === "scene" ? "scene" : null;
  const contentType = String(body.content_type || "").toLowerCase();
  const extension = IMAGE_TYPES[contentType];
  const bytes = decodeBase64(body.base64);
  const sceneKey = String(body.scene_key || "").replace(/[^a-z0-9_-]/gi, "");
  if (!kind || !extension || !bytes || bytes.byteLength > 8_000_000 || !validImageBytes(bytes, contentType) || (kind === "scene" && !sceneKey)) {
    return reply(400, { error: "IMAGE_INVALID" });
  }
  const projectSlug = String(access.version.source_story?.slug || access.version.story_project_id).replace(/[^a-z0-9-]/gi, "");
  const filename = kind === "cover" ? `cover.${extension}` : `scenes/${sceneKey}.${extension}`;
  const path = `authoring/${projectSlug}/${versionId}/${filename}`;
  const { error } = await svc.storage.from("story-images").upload(path, bytes, { contentType, upsert: true, cacheControl: "3600" });
  if (error) throw error;
  const { data } = svc.storage.from("story-images").getPublicUrl(path);
  return reply(201, { asset: { kind, path, public_url: `${data.publicUrl}?v=${Date.now()}`, content_type: contentType } });
}

async function createVersion(req: Request, uid: string, admin: boolean) {
  const body = await json(req);
  const projectId = uuid(body.story_project_id);
  if (!projectId) return reply(400, { error: "PROJECT_ID_INVALID" });
  const access = await ownedProject(projectId, uid, admin);
  if (access.response) return access.response;
  const { data: latest, error: latestError } = await svc
    .from("story_versions")
    .select("version_number,source_story,source_scenes,content_by_ref")
    .eq("story_project_id", projectId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestError) throw latestError;
  if (!latest) return reply(409, { error: "SOURCE_VERSION_MISSING" });
  const { data: version, error } = await svc
    .from("story_versions")
    .insert({
      story_project_id: projectId,
      version_number: latest.version_number + 1,
      status: "draft",
      source_story: latest.source_story,
      source_scenes: latest.source_scenes,
      content_by_ref: latest.content_by_ref,
      validation_report: { status: "not_validated", created_from_version: latest.version_number },
    })
    .select("id,version_number,status,created_at,updated_at")
    .single();
  if (error) {
    if (error.code === "23505") return reply(409, { error: "VERSION_CONFLICT_RETRY" });
    throw error;
  }
  return reply(201, { version });
}

async function getVersion(versionId: string, uid: string, admin: boolean) {
  const access = await ownedVersion(versionId, uid, admin);
  if (access.response) return access.response;
  return reply(200, { version: access.version });
}

async function saveVersion(req: Request, versionId: string, uid: string, admin: boolean) {
  const access = await ownedVersion(versionId, uid, admin);
  if (access.response) return access.response;
  if (access.version.status !== "draft") return reply(409, { error: "VERSION_IMMUTABLE" });
  const body = await json(req);
  const expected = String(body.expected_updated_at || "");
  if (!expected || expected !== access.version.updated_at) {
    return reply(409, { error: "REVISION_CONFLICT", current_updated_at: access.version.updated_at });
  }
  if (!body.source_story || !body.source_scenes || !body.content_by_ref) {
    return reply(400, { error: "SOURCE_BUNDLE_REQUIRED" });
  }
  const nextRevision = new Date().toISOString();
  const { data, error } = await svc
    .from("story_versions")
    .update({
      source_story: body.source_story,
      source_scenes: body.source_scenes,
      content_by_ref: body.content_by_ref,
      validation_report: { status: "not_validated" },
      updated_at: nextRevision,
    })
    .eq("id", versionId)
    .eq("status", "draft")
    .eq("updated_at", expected)
    .select("id,updated_at")
    .maybeSingle();
  if (error) throw error;
  if (!data) return reply(409, { error: "REVISION_CONFLICT" });
  return reply(200, { version: data });
}

async function validateVersion(versionId: string, uid: string, admin: boolean) {
  const access = await ownedVersion(versionId, uid, admin);
  if (access.response) return access.response;
  if (access.version.status !== "draft") return reply(409, { error: "VERSION_IMMUTABLE" });
  const report = validateAuthoringContract({
    story: access.version.source_story,
    scenes: access.version.source_scenes,
    contentByRef: access.version.content_by_ref,
  });
  const validationReport = {
    status: report.valid ? "valid" : "invalid",
    revision: access.version.updated_at,
    validated_at: new Date().toISOString(),
    errors: report.errors,
  };
  const { error } = await svc
    .from("story_versions")
    .update({ validation_report: validationReport })
    .eq("id", versionId)
    .eq("status", "draft")
    .eq("updated_at", access.version.updated_at);
  if (error) throw error;
  return reply(200, { validation: validationReport });
}

async function publishVersion(req: Request, versionId: string, uid: string, admin: boolean) {
  const access = await ownedVersion(versionId, uid, admin);
  if (access.response) return access.response;
  if (access.version.status !== "draft") return reply(409, { error: "VERSION_IMMUTABLE" });
  const body = await json(req);
  const expected = String(body.expected_updated_at || "");
  if (!expected || expected !== access.version.updated_at) return reply(409, { error: "REVISION_CONFLICT" });

  const report = validateAuthoringContract({
    story: access.version.source_story,
    scenes: access.version.source_scenes,
    contentByRef: access.version.content_by_ref,
  });
  const validation = access.version.validation_report || {};
  if (!report.valid || validation.status !== "valid" || validation.revision !== access.version.updated_at) {
    return reply(409, { error: "VALIDATION_REQUIRED", validation: report });
  }

  const { data: characters, error: catalogError } = await svc
    .from("catalog_characters")
    .select("key,name,species,identity_prompt,canonical_markers,art")
    .eq("status", "active")
    .order("key");
  if (catalogError) throw catalogError;
  const catalog = Object.fromEntries((characters || []).map((character) => [character.key, {
    name: character.name,
    species: character.species,
    identity_prompt: character.identity_prompt,
    canonical_markers: character.canonical_markers,
    art: character.art,
  }]));
  const publishedContract = {
    contract_version: 1,
    story: access.version.source_story,
    scenes: access.version.source_scenes,
    contentByRef: access.version.content_by_ref,
    catalog,
  };
  const { data, error } = await svc.rpc("publish_story_version_atomic", {
    p_version_id: versionId,
    p_expected_updated_at: expected,
    p_published_contract: publishedContract,
  });
  if (error) {
    for (const code of ["VERSION_NOT_FOUND", "VERSION_IMMUTABLE", "REVISION_CONFLICT", "VALIDATION_REQUIRED", "PUBLISHED_CONTRACT_INVALID"]) {
      if (error.message.includes(code)) return reply(code === "VERSION_NOT_FOUND" ? 404 : 409, { error: code });
    }
    throw error;
  }
  return reply(200, { publication: data?.[0] || null });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const user = await currentUser(req);
    const admin = isAdmin(user);
    const path = new URL(req.url).pathname.replace(/\/+$/, "");
    const base = path.endsWith("/authoring-admin");
    const versionMatch = path.match(/\/authoring-admin\/versions\/([0-9a-f-]{36})(?:\/(validate|publish|assets))?$/i);

    if (req.method === "GET" && base) return reply(200, { projects: await listProjects(user.id, admin) });
    if (req.method === "POST" && path.endsWith("/authoring-admin/projects")) return createProject(req, user.id);
    if (req.method === "POST" && path.endsWith("/authoring-admin/versions")) return createVersion(req, user.id, admin);
    if (versionMatch && req.method === "GET" && !versionMatch[2]) return getVersion(versionMatch[1], user.id, admin);
    if (versionMatch && req.method === "PUT" && !versionMatch[2]) return saveVersion(req, versionMatch[1], user.id, admin);
    if (versionMatch && req.method === "POST" && versionMatch[2] === "validate") return validateVersion(versionMatch[1], user.id, admin);
    if (versionMatch && req.method === "POST" && versionMatch[2] === "publish") return publishVersion(req, versionMatch[1], user.id, admin);
    if (versionMatch && req.method === "POST" && versionMatch[2] === "assets") return uploadAsset(req, versionMatch[1], user.id, admin);
    return reply(405, { error: "METHOD_NOT_ALLOWED" });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "AUTH_REQUIRED" || code === "AUTH_INVALID") return reply(401, { error: code });
    console.error("authoring-admin", error);
    return reply(500, { error: "AUTHORING_ADMIN_FAILED" });
  }
});
