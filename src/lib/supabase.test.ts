import { describe, expect, it } from "vitest";
import { SUPABASE_BROWSER_CONFIG } from "./supabase";

describe("Supabase browser configuration", () => {
  it("uses the canonical production project instead of a placeholder", () => {
    expect(SUPABASE_BROWSER_CONFIG.url).toBe("https://rvbspcjvebgwqzssayts.supabase.co");
    expect(SUPABASE_BROWSER_CONFIG.url).not.toContain("your-project-id");
    expect(SUPABASE_BROWSER_CONFIG.publishableKey).toMatch(/^sb_publishable_/);
  });
});
