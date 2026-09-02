import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const recovery = readFileSync("src/app/installUpdateRecovery.ts", "utf8");
const verifier = readFileSync("scripts/verify-live-frontend-delivery.mjs", "utf8");
const whatsNewVerifier = readFileSync("scripts/verify-whats-new-live.mjs", "utf8");
const pinAuthVerifier = readFileSync("scripts/verify-pin-auth-live.mjs", "utf8");
const workflow = readFileSync(".github/workflows/verify-live-frontend-delivery.yml", "utf8");
const backendWorkflow = readFileSync(".github/workflows/verify-supabase-backend.yml", "utf8");
const viteConfig = readFileSync("vite.config.ts", "utf8");

describe("global frontend delivery proof", () => {
  it("embeds the exact deployment revision and checks it from the running app", () => {
    expect(viteConfig).toContain("process.env.SOURCE_SHA");
    expect(viteConfig).toContain("__OCTAGON_DEPLOYMENT_SHA__");
    expect(recovery).toContain("/deployment.json");
    expect(recovery).toContain("octagon-hq:update-target-sha");
    expect(recovery).toContain('target.addEventListener("pageshow"');
    expect(recovery).toContain('documentTarget.addEventListener("visibilitychange"');
  });

  it("requires the live shell to load real fingerprinted JavaScript and CSS", () => {
    expect(verifier).toContain("extractShellAssetReferences");
    expect(verifier).toContain('path.endsWith(".js")');
    expect(verifier).toContain('path.endsWith(".css")');
    expect(verifier).toContain("The JavaScript loaded by the live shell does not contain deployment");
    expect(verifier).toContain("resolved to the SPA fallback");
  });

  it("owns frontend delivery origin separately from backend CORS origin", () => {
    expect(verifier).toContain('const DEFAULT_ORIGIN = "https://the.hq-app.workers.dev"');
    expect(verifier).toContain(
      "origin: process.env.FRONTEND_PRODUCTION_ORIGIN ?? DEFAULT_ORIGIN",
    );
    expect(verifier).not.toContain(
      "origin: process.env.OCTAGON_PRODUCTION_ORIGIN ?? DEFAULT_ORIGIN",
    );
  });

  it("keeps backend WebKit frontend SHA proof separate from the transitional auth-origin proof", () => {
    expect(backendWorkflow).toContain(
      "EXPECTED_SOURCE_SHA: ${{ steps.live_frontend.outputs.sha }}",
    );
    expect(backendWorkflow).not.toContain("EXPECTED_DEPLOYMENT_SHA:");
    expect(pinAuthVerifier).toContain(
      'if (expectedDeploymentSha && liveDeploymentSha !== expectedDeploymentSha)',
    );
  });

  it("keeps authenticated WebKit proof selectors aligned with The HQ profile trigger", () => {
    for (const liveVerifier of [whatsNewVerifier, pinAuthVerifier]) {
      expect(liveVerifier).toContain('name: "Sign in to The HQ"');
      expect(liveVerifier).not.toContain('name: "Sign in to Octagon HQ"');
    }
  });

  it("runs exact delivery proof only after the canonical frontend deployment succeeds", () => {
    expect(workflow).toContain("workflow_run:");
    expect(workflow).toContain("Deploy Cloudflare Frontend");
    expect(workflow).toContain("github.event.workflow_run.conclusion == 'success'");
    expect(workflow).toContain("node scripts/verify-live-frontend-delivery.mjs");
  });
});
