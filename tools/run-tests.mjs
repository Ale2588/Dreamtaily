import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const mode = process.argv[2] || "unit";
if (!new Set(["unit", "live"]).has(mode)) {
  console.error(`Unknown test mode: ${mode}`);
  process.exit(2);
}

const testsDir = resolve("tests");
const files = readdirSync(testsDir)
  .filter((name) => name.endsWith(".test.mjs"))
  .filter((name) => mode === "live" ? name.endsWith("-live.test.mjs") : !name.endsWith("-live.test.mjs"))
  .sort()
  .map((name) => resolve(testsDir, name));

if (!files.length) {
  console.error(`No ${mode} test files found.`);
  process.exit(2);
}

console.log(`Running ${files.length} ${mode} test files.`);
const result = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
