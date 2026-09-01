import { createClient } from "npm:@supabase/supabase-js@2";
import { validateAuthoringContract } from "../_shared/story-authoring-validator.js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
        .select("id,story_project_id,version_number,status,published_at,updated_at")
        .in("story_project_id", ids)
    : { data: [], error: null };
  if (versionError) throw versionError;
  return (projects || []).map((project) => {
    const own = (versions || []).filter((version) => version.story_project_id === project.id);
    return {
      ...project,
      draft_count: own.filter((version) => version.status === "draft").length,
      published_version: own.find((version) => version.id === project.current_published_version_id) || null,
      latest_version: own.sort((left, right) => right.version_number - left.version_number)[0] || null,
    };
  });
}

async function createProject(req: Request, uid: string) {
  const body = await json(req);
  const slug = String(body.slug || "").trim().toLowerCase();
  const internalTitle = String(body.internal_title || "").trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return reply(400, { error: "SLUG_INVALID" });
  if (!internalTitle || internalTitle.length > 160) return reply(400, { error: "INTERNAL_TITLE_INVALID" });

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const user = await currentUser(req);
    const admin = isAdmin(user);
    const path = new URL(req.url).pathname.replace(/\/+$/, "");
    const base = path.endsWith("/authoring-admin");
    const versionMatch = path.match(/\/authoring-admin\/versions\/([0-9a-f-]{36})(?:\/(validate))?$/i);

    if (req.method === "GET" && base) return reply(200, { projects: await listProjects(user.id, admin) });
    if (req.method === "POST" && path.endsWith("/authoring-admin/projects")) return createProject(req, user.id);
    if (req.method === "POST" && path.endsWith("/authoring-admin/versions")) return createVersion(req, user.id, admin);
    if (versionMatch && req.method === "GET" && !versionMatch[2]) return getVersion(versionMatch[1], user.id, admin);
    if (versionMatch && req.method === "PUT" && !versionMatch[2]) return saveVersion(req, versionMatch[1], user.id, admin);
    if (versionMatch && req.method === "POST" && versionMatch[2] === "validate") return validateVersion(versionMatch[1], user.id, admin);
    return reply(405, { error: "METHOD_NOT_ALLOWED" });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "AUTH_REQUIRED" || code === "AUTH_INVALID") return reply(401, { error: code });
    console.error("authoring-admin", error);
    return reply(500, { error: "AUTHORING_ADMIN_FAILED" });
  }
});
