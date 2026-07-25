import { describe, expect, it } from "vitest";
import { resolveSupabaseBrowserUrl } from "./supabase";

const configuredUrl = "https://octagonproject.supabase.co";

describe("resolveSupabaseBrowserUrl", () => {
  it("routes production Workers traffic through the same origin", () => {
    expect(resolveSupabaseBrowserUrl(configuredUrl, {
      hostname: "octagon.hq-app.workers.dev",
      origin: "https://octagon.hq-app.workers.dev",
    })).toBe("https://octagon.hq-app.workers.dev/api/supabase/octagonproject");
  });

  it("routes branch previews through their own same origin", () => {
    expect(resolveSupabaseBrowserUrl(configuredUrl, {
      hostname: "feature-home-next-up-spotlight-watchlist-octagon.hq-app.workers.dev",
      origin: "https://feature-home-next-up-spotlight-watchlist-octagon.hq-app.workers.dev",
    })).toBe(
      "https://feature-home-next-up-spotlight-watchlist-octagon.hq-app.workers.dev/api/supabase/octagonproject",
    );
  });

  it("keeps local development pointed at Supabase directly", () => {
    expect(resolveSupabaseBrowserUrl(configuredUrl, {
      hostname: "localhost",
      origin: "http://localhost:5173",
    })).toBe(configuredUrl);
  });

  it("does not proxy custom Supabase domains without a locked project reference", () => {
    expect(resolveSupabaseBrowserUrl("https://data.example.com", {
      hostname: "octagon.hq-app.workers.dev",
      origin: "https://octagon.hq-app.workers.dev",
    })).toBe("https://data.example.com");
  });
});
