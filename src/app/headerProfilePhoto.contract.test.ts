import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const identityStyles = readFileSync("src/styles/identity.css", "utf8");

describe("signed-in header profile control", () => {
  it("keeps a full-size profile photo joined to the member name", () => {
    expect(identityStyles).toContain(".identity-trigger.is-ready { gap: 10px; overflow: hidden; padding: 0 12px 0 0;");
    expect(identityStyles).toContain(".identity-trigger.is-ready i { flex: 0 0 44px; width: 44px; height: 44px;");
    expect(identityStyles).toContain("border-radius: 14px 0 0 14px");
    expect(identityStyles).toContain(".identity-trigger.is-ready span { max-width: 70px;");
  });
});
