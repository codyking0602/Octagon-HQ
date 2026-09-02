import { describe, expect, it } from "vitest";
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
});
