import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
}

const wrangler = source("../../wrangler.jsonc");
const packageJson = source("../../package.json");
const viteConfig = source("../../vite.config.ts");
const workerConfig = source("../../vite.worker.config.ts");
const worker = source("../../worker/index.ts");
const previewModel = source("../../worker/previewModel.ts");
const architecture = source("../../docs/rich-preview-architecture.md");
const assetsIgnore = source("../../public/.assetsignore");

describe("rich preview foundation ownership", () => {
  it("uses one Worker in front of only the approved first-slice routes", () => {
    expect(wrangler).toContain('"main": "./dist/_worker.js"');
    expect(wrangler).toContain('"binding": "ASSETS"');
    expect(wrangler).toContain('"/fighters/*"');
    expect(wrangler).toContain('"/rankings"');
    expect(wrangler).not.toContain('"run_worker_first": true');
    expect(assetsIgnore).toContain("_worker.js");
  });

  it("derives compact fighter preview data from the canonical ranking model", () => {
    expect(viteConfig).toContain('import { allTime } from "./src/features/rankings/rankingModel"');
    expect(viteConfig).toContain('fileName: "preview-data/rankings.json"');
    expect(worker).toContain("preview-data/rankings.json");
    expect(worker).not.toContain("rankingInputs");
  });

  it("bundles the Worker into the exact production artifact", () => {
    expect(packageJson).toContain("vite build --config vite.worker.config.ts");
    expect(workerConfig).toContain('fileName: () => "_worker.js"');
    expect(workerConfig).toContain("emptyOutDir: false");
  });

  it("injects crawler metadata without adding a React metadata owner", () => {
    expect(worker).toContain("HTMLRewriter");
    expect(worker).toContain("og:title");
    expect(worker).toContain("og:image");
    expect(worker).toContain("twitter:card");
    expect(worker).toContain("X-Octagon-Preview");
    expect(worker).not.toContain("localStorage");
    expect(worker).not.toContain("sessionStorage");
  });

  it("uses plain GOAT and resume copy", () => {
    const previewSources = `${previewModel}\n${architecture}`;
    expect(previewSources).toContain("GOAT");
    expect(previewSources).toContain("resume");
    expect(previewSources).not.toMatch(/G\.O\.A\.T\.|résumé|resumé/i);
  });
});
