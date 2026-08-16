import { appendFileSync } from "node:fs";
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

function writeOutput(shouldDeploy, reason) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    throw new Error("GITHUB_OUTPUT is required when resolving backend release scope.");
  }
  appendFileSync(outputPath, `should_deploy=${shouldDeploy ? "true" : "false"}\n`);
  appendFileSync(outputPath, `reason=${reason}\n`);
}

async function resolveChangedFiles(repository, before, source, token) {
  const response = await fetch(
    `https://api.github.com/repos/${repository}/compare/${before}...${source}?per_page=100`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "octagon-hq-backend-release-scope/1",
      },
    },
  );
  if (!response.ok) {
    throw new Error(`GitHub compare failed with HTTP ${response.status}.`);
  }
  const body = await response.json();
  const files = Array.isArray(body.files) ? body.files.map((file) => file.filename).filter(Boolean) : [];
  return { files, truncated: files.length >= 300 };
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

  const { files, truncated } = await resolveChangedFiles(repository, before, source, token);
  if (truncated) {
    writeOutput(true, "large change set; deploy conservatively");
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
