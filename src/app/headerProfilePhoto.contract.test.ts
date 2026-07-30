import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const identityStyles = readFileSync("src/styles/identity.css", "utf8");

describe("signed-in header profile control", () => {
  it("uses a true 46px photo segment joined to the member name", () => {
    expect(identityStyles).toContain(".identity-trigger.is-ready { gap: 0; overflow: hidden; height: 46px; padding: 0; border: 0;");
    expect(identityStyles).toContain(".identity-trigger.is-ready i { flex: 0 0 46px; width: 46px; height: 46px;");
    expect(identityStyles).toContain("box-shadow: inset 0 0 0 1px rgba(229, 9, 20, .48)");
    expect(identityStyles).toContain(".identity-trigger.is-ready span { display: flex; align-items: center; height: 46px;");
    expect(identityStyles).toContain("border-left: 0; border-radius: 0 15px 15px 0;");
  });
});
