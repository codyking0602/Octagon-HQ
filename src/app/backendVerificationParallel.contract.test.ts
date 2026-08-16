import workflow from "../../.github/workflows/verify-supabase-backend.yml?raw";
import { describe, expect, it } from "vitest";

describe("Supabase backend verification lanes", () => {
  it("keeps the fresh database and live production proofs parallel behind one final verify gate", () => {
    const localStart = workflow.indexOf("  fresh_database_proof:");
    const productionStart = workflow.indexOf("  production_proof:");
    const verifyStart = workflow.indexOf("  verify:");

    expect(localStart).toBeGreaterThan(-1);
    expect(productionStart).toBeGreaterThan(localStart);
    expect(verifyStart).toBeGreaterThan(productionStart);

    const localBlock = workflow.slice(localStart, productionStart);
    const productionBlock = workflow.slice(productionStart, verifyStart);
    const verifyBlock = workflow.slice(verifyStart);

    expect(localBlock).toContain("supabase db start");
    expect(localBlock).toContain("auction_private_lifecycle.sql");
    expect(localBlock).not.toContain("Install production WebKit proof harness");
    expect(productionBlock).toContain("Install production WebKit proof harness");
    expect(productionBlock).toContain("Verify signed-in live Gable What's New item");
    expect(productionBlock).not.toContain("supabase db start");
    expect(verifyBlock).toContain("needs: [fresh_database_proof, production_proof]");
    expect(verifyBlock).toContain("needs.fresh_database_proof.result");
    expect(verifyBlock).toContain("needs.production_proof.result");
  });

  it("checks out the exact requested source in both proof lanes", () => {
    expect(workflow).toContain("SOURCE_SHA: ${{ github.event.pull_request.head.sha || github.sha }}");
    expect(workflow.match(/ref: \$\{\{ env\.SOURCE_SHA \}\}/g)).toHaveLength(2);
    expect(workflow.match(/Exact verification source verified/g)).toHaveLength(2);
  });
});
