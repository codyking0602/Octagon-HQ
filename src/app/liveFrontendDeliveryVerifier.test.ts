import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resolveAcceptedDeploymentSha } from "../../scripts/verify-live-frontend-delivery.mjs";

const mainSha = "a".repeat(40);
const authorizedPrSha = "b".repeat(40);
const unrelatedSha = "c".repeat(40);
const verifierSource = readFileSync("scripts/verify-live-frontend-delivery.mjs", "utf8");

describe("live frontend exact-SHA verification", () => {
  it("accepts the exact verified main deployment", () => {
    expect(resolveAcceptedDeploymentSha({
      markerSha: mainSha,
      expectedSha: mainSha,
    })).toBe(mainSha);
  });

  it("accepts the exact current PR head only when explicitly allowed", () => {
    expect(resolveAcceptedDeploymentSha({
      markerSha: authorizedPrSha,
      expectedSha: mainSha,
      allowedDeployedShas: [authorizedPrSha],
    })).toBe(authorizedPrSha);
  });

  it("rejects an unrelated live deployment marker", () => {
    expect(() => resolveAcceptedDeploymentSha({
      markerSha: unrelatedSha,
      expectedSha: mainSha,
      allowedDeployedShas: [authorizedPrSha],
    })).toThrow(`expected ${mainSha} or ${authorizedPrSha}`);
  });

  it("limits the alternate exact head to pull-request verification", () => {
    expect(verifierSource).toContain('process.env.GITHUB_EVENT_NAME === "pull_request"');
    expect(verifierSource).toContain("process.env.EXPECTED_SYNC_SOURCE_SHA");
    expect(verifierSource).not.toMatch(/allowedDeployedShas\s*=\s*\[process\.env\.SOURCE_SHA/);
  });
});
