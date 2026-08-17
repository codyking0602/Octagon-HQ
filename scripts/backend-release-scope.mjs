import { appendFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const backendReleasePatterns = [
  /^supabase\//,
  /^\.github\/workflows\/deploy-supabase\.yml$/,
  /^scripts\/backend-release-scope\.mjs$/,
  /^scripts\/bundle-daily-challenge-runtime\.mjs$/,
  /^scripts\/configure-monitoring-scheduler\.mjs$/,
  /^scripts\/verify-monitoring-function-deployment\.mjs$/,
  /^scripts\/verify-sync-function-deployment\.mjs$/,
  /^src\/features\/play\//,
  /^package\.json$/,
  /^package-lock\.json$/,
];

export function isBackendReleasePath(path) {
  return backendReleasePatterns.some((pattern) => pattern.test(path));
}

export function changedFilesFromPushPayload(payload) {
  const commits = Array.isArray(payload?.commits) ? payload.commits : [];
  const expectedCommitCount = Number.isInteger(payload?.size) ? payload.size : commits.length;
  const files = new Set();

  for (const commit of commits) {
    for (const field of ["added", "modified", "removed"]) {
      const paths = Array.isArray(commit?.[field]) ? commit[field] : [];
      for (const path of paths) {
        if (typeof path === "string" && path) files.add(path);
      }
    }
  }

  return {
    files: [...files],
    truncated: expectedCommitCount > commits.length,
  };
}

function writeOutput(shouldDeploy, reason) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    throw new Error("GITHUB_OUTPUT is required when resolving backend release scope.");
  }
  appendFileSync(outputPath, `should_deploy=${shouldDeploy ? "true" : "false"}\n`);
  appendFileSync(outputPath, `reason=${reason}\n`);
}

async function main() {
  const eventName = process.env.GITHUB_EVENT_NAME ?? "";
  if (eventName !== "push") {
    writeOutput(true, `explicit ${eventName || "deployment"} event`);
    return;
  }

  const before = (process.env.BACKEND_RELEASE_BEFORE_SHA ?? "").trim().toLowerCase();
  const source = (process.env.BACKEND_RELEASE_SOURCE_SHA ?? process.env.GITHUB_SHA ?? "").trim().toLowerCase();

  if (!/^[0-9a-f]{40}$/.test(source)) {
    throw new Error("Backend release scope is missing the exact source SHA.");
  }
  if (!/^[0-9a-f]{40}$/.test(before) || /^0{40}$/.test(before)) {
    writeOutput(true, "previous main SHA unavailable; deploy conservatively");
    return;
  }

  const eventPath = process.env.GITHUB_EVENT_PATH ?? "";
  if (!eventPath) {
    throw new Error("GITHUB_EVENT_PATH is required for push release-scope resolution.");
  }
  const payload = JSON.parse(readFileSync(eventPath, "utf8"));
  const payloadBefore = String(payload?.before ?? "").trim().toLowerCase();
  const payloadAfter = String(payload?.after ?? "").trim().toLowerCase();
  if (payloadBefore !== before || payloadAfter !== source) {
    throw new Error(
      `Push payload SHA mismatch: expected ${before}...${source}, received ${payloadBefore}...${payloadAfter}.`,
    );
  }

  const { files, truncated } = changedFilesFromPushPayload(payload);
  if (truncated) {
    writeOutput(true, "push payload commit list truncated; deploy conservatively");
    return;
  }

  const backendFiles = files.filter(isBackendReleasePath);
  if (backendFiles.length > 0) {
    writeOutput(true, `backend-owned changes: ${backendFiles.join(", ")}`);
    return;
  }

  writeOutput(false, `backend unchanged across ${files.length} changed file(s)`);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath && fileURLToPath(import.meta.url) === invokedPath) {
  await main();
}
