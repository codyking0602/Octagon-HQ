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

export async function resolveChangedFiles(repository, source, token, fetchImpl = fetch) {
  const response = await fetchImpl(
    `https://api.github.com/repos/${repository}/commits/${source}?per_page=100`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "octagon-hq-backend-release-scope/2",
      },
    },
  );
  if (!response.ok) {
    throw new Error(`GitHub commit lookup failed with HTTP ${response.status}.`);
  }
  const body = await response.json();
  if (!Array.isArray(body.files)) {
    throw new Error("GitHub commit lookup did not return a changed-file list.");
  }
  const files = body.files.map((file) => file.filename).filter(Boolean);
  return { files, truncated: files.length >= 100 };
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
  const repository = process.env.GITHUB_REPOSITORY ?? "";
  const token = process.env.GITHUB_TOKEN ?? "";

  if (!/^[0-9a-f]{40}$/.test(source) || !repository || !token) {
    throw new Error("Backend release scope is missing the exact source SHA, repository, or GitHub token.");
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

  const commitCount = Number.isInteger(payload?.size)
    ? payload.size
    : Array.isArray(payload?.commits)
      ? payload.commits.length
      : null;
  if (commitCount !== 1) {
    writeOutput(true, "push contains multiple or unknown commits; deploy conservatively");
    return;
  }

  const { files, truncated } = await resolveChangedFiles(repository, source, token);
  if (truncated) {
    writeOutput(true, "single commit has at least 100 changed files; deploy conservatively");
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
