import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const identityControl = readFileSync("src/features/identity/IdentityControl.tsx", "utf8");
const identityStyles = readFileSync("src/styles/identity.css", "utf8");

describe("signed-in header profile control", () => {
  it("targets the actual rendered avatar and forces both it and its image to 46px", () => {
    expect(identityControl).toContain('<i className="identity-trigger__photo">{avatar}</i>');
    expect(identityStyles).toContain(".identity-trigger.is-ready > .identity-trigger__photo { flex: 0 0 46px; width: 46px; min-width: 46px; max-width: 46px; height: 46px;");
    expect(identityStyles).toContain(".identity-trigger.is-ready > .identity-trigger__photo > img { display: block; width: 46px; min-width: 46px; max-width: 46px; height: 46px;");
    expect(identityStyles).toContain("box-shadow: inset 0 0 0 1px rgba(229, 9, 20, .48)");
    expect(identityStyles).toContain(".identity-trigger.is-ready span { display: flex; align-items: center; height: 46px;");
    expect(identityStyles).toContain("border-left: 0; border-radius: 0 15px 15px 0;");
  });
});
