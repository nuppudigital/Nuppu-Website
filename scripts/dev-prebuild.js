#!/usr/bin/env node
// Builds admin-dashboard/ and app-prototype/ into public/admin and
// public/app-preview only if that output doesn't exist yet. `npm run dev`
// needs these directories to exist so Vite's sub-app fallback (see
// vite.config.ts) has something to serve at /admin and /app-preview, but
// rebuilding both sub-apps from scratch on every dev start is slow and
// usually unnecessary. `npm run build` / `vercel-build` always rebuild
// both unconditionally, so production output never goes stale.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const targets = [
  { dir: "public/admin", script: "build:admin" },
  { dir: "public/app-preview", script: "build:prototype" },
];

for (const { dir, script } of targets) {
  if (existsSync(path.join(rootDir, dir, "index.html"))) {
    console.log(`[dev-prebuild] ${dir} already built, skipping ${script} (run "npm run ${script}" to force a rebuild)`);
    continue;
  }
  console.log(`[dev-prebuild] ${dir} missing, running ${script}...`);
  execSync(`npm run ${script}`, { cwd: rootDir, stdio: "inherit" });
}
