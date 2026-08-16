import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const fullValidation = readFileSync(".github/workflows/validate.yml", "utf8");
const fastFeedback = readFileSync(".github/workflows/fast-pr-feedback.yml", "utf8");

describe("draft fast feedback and final validation", () => {
  it("reserves the full validation lanes for ready PRs and main pushes", () => {
    const readyOrMain = "github.event_name == 'push' || github.event.pull_request.draft == false";
    expect(fullValidation.match(new RegExp(readyOrMain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))).toHaveLength(4);
    expect(fullValidation).toContain("shard: [1, 2, 3, 4, 5, 6, 7, 8]");
    expect(fullValidation).toContain("name: validate");
  });

  it("gives draft PRs exact-head typecheck plus affected-test feedback", () => {
    expect(fastFeedback).toContain("name: Fast PR Feedback");
    expect(fastFeedback).toContain("if: ${{ github.event.pull_request.draft == true }}");
    expect(fastFeedback).toContain("SOURCE_SHA: ${{ github.event.pull_request.head.sha }}");
    expect(fastFeedback).toContain("BASE_SHA: ${{ github.event.pull_request.base.sha }}");
    expect(fastFeedback).toContain("ref: ${{ env.SOURCE_SHA }}");
    expect(fastFeedback).toContain("fetch-depth: 0");
    expect(fastFeedback).toContain("npm run typecheck");
    expect(fastFeedback).toContain('npm test -- --changed="$BASE_SHA" --passWithNoTests');
  });

  it("cancels obsolete draft feedback without weakening final validation", () => {
    expect(fastFeedback).toContain("group: fast-pr-feedback-${{ github.event.pull_request.number }}");
    expect(fastFeedback).toContain("cancel-in-progress: true");
    expect(fastFeedback).not.toContain("SUPABASE_ACCESS_TOKEN");
    expect(fastFeedback).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});
