import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const identityControl = readFileSync("src/features/identity/IdentityControl.tsx", "utf8");
const identityStyles = readFileSync("src/styles/identity.css", "utf8");

describe("signed-in header profile control", () => {
  it("renders the 46px photo and username inside one continuous outlined control", () => {
    expect(identityControl).toContain('<i className="identity-trigger__photo">{avatar}</i>');
    expect(identityStyles).toContain(".identity-trigger.is-ready { position: relative; gap: 0; overflow: hidden; height: 46px; padding: 0; border: 0; border-radius: 15px; background: var(--surface); box-shadow: none;");
    expect(identityStyles).toContain('.identity-trigger.is-ready::after { content: ""; position: absolute; inset: 0; border: 1px solid rgba(229, 9, 20, .48); border-radius: inherit; pointer-events: none; }');
    expect(identityStyles).toContain(".identity-trigger.is-ready > .identity-trigger__photo { flex: 0 0 46px; width: 46px; min-width: 46px; max-width: 46px; height: 46px;");
    expect(identityStyles).toContain("border-right: 1px solid rgba(229, 9, 20, .48); border-radius: 0; box-shadow: none;");
    expect(identityStyles).toContain(".identity-trigger.is-ready > .identity-trigger__photo > img { display: block; width: 46px; min-width: 46px; max-width: 46px; height: 46px;");
    expect(identityStyles).toContain(".identity-trigger.is-ready span { display: flex; align-items: center; height: 46px;");
    expect(identityStyles).toContain("border: 0; border-radius: 0; background: transparent;");
    expect(identityStyles).not.toContain("box-shadow: inset 0 0 0 1px rgba(229, 9, 20, .48)");
  });
});
