import { describe, expect, it } from "vitest";
import { UPDATE_RECOVERY_CACHE_CONTROL } from "./updateRecoveryHeaders";
import { LEGACY_REDIRECT_STATUS, legacyOctagonRedirect } from "./legacyOctagonRedirect";

describe("legacyOctagonRedirect", () => {
  it("permanently preserves path and query while redirecting to the canonical The HQ host", () => {
    const response = legacyOctagonRedirect(
      new Request("https://octagon.hq-app.workers.dev/play/futures?week=1&source=legacy"),
    );

    expect(response.status).toBe(LEGACY_REDIRECT_STATUS);
    expect(response.headers.get("location")).toBe(
      "https://the.hq-app.workers.dev/play/futures?week=1&source=legacy",
    );
  });

  it("keeps stale installed clients able to read the deployment marker across the host redirect", () => {
    const response = legacyOctagonRedirect(
      new Request("https://octagon.hq-app.workers.dev/deployment.json?running=old&check=1"),
    );

    expect(response.status).toBe(LEGACY_REDIRECT_STATUS);
    expect(response.headers.get("location")).toBe(
      "https://the.hq-app.workers.dev/deployment.json?running=old&check=1",
    );
    expect(response.headers.get("cache-control")).toBe(UPDATE_RECOVERY_CACHE_CONTROL);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
  });
});
