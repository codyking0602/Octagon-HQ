import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabaseBrowserConfig } from "./supabase";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getSupabaseBrowserConfig", () => {
  it("keeps production and preview browsers pointed directly at Supabase", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://octagonproject.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

    expect(getSupabaseBrowserConfig()).toEqual({
      url: "https://octagonproject.supabase.co",
      publishableKey: "sb_publishable_test",
    });
  });

  it("returns null when the public project configuration is incomplete", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");

    expect(getSupabaseBrowserConfig()).toBeNull();
  });
});
