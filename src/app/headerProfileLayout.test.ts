import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const identityCss = readFileSync(
  fileURLToPath(new URL("../styles/identity.css", import.meta.url)),
  "utf8",
);

describe("universal header profile layout", () => {
  it("keeps the ready profile photo inside the canonical 42px header action", () => {
    expect(identityCss).toContain(".app-header--universal .identity-trigger.is-ready span { display: none; }");
    expect(identityCss).toContain(".app-header--universal .identity-trigger.is-ready > .identity-trigger__photo");
    expect(identityCss).toContain("width: 42px; min-width: 42px; max-width: 42px; height: 42px;");
  });
});
