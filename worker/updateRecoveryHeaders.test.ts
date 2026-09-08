import { describe, expect, it } from "vitest";
import { UPDATE_RECOVERY_CACHE_CONTROL, withUpdateRecoveryHeaders } from "./updateRecoveryHeaders";

describe("update recovery response headers", () => {
  it("forces HTML shells to bypass stale installed-app caches", async () => {
    const response = withUpdateRecoveryHeaders(
      new Response("<html></html>", { headers: { "Content-Type": "text/html; charset=utf-8" } }),
      new URL("https://the.hq-app.workers.dev/play"),
    );

    expect(response.headers.get("cache-control")).toBe(UPDATE_RECOVERY_CACHE_CONTROL);
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(response.headers.get("expires")).toBe("0");
    expect(await response.text()).toBe("<html></html>");
  });

  it("makes the deployment marker readable after a legacy-host redirect", async () => {
    const response = withUpdateRecoveryHeaders(
      new Response('{"sha":"abc"}', { headers: { "Content-Type": "application/json" } }),
      new URL("https://the.hq-app.workers.dev/deployment.json?check=1"),
    );

    expect(response.headers.get("cache-control")).toBe(UPDATE_RECOVERY_CACHE_CONTROL);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(await response.text()).toBe('{"sha":"abc"}');
  });

  it("leaves hashed static assets alone", () => {
    const original = new Response("bundle", {
      headers: { "Content-Type": "application/javascript", "Cache-Control": "public, max-age=31536000" },
    });
    const response = withUpdateRecoveryHeaders(
      original,
      new URL("https://the.hq-app.workers.dev/assets/index-abc.js"),
    );

    expect(response).toBe(original);
    expect(response.headers.get("cache-control")).toBe("public, max-age=31536000");
  });
});
