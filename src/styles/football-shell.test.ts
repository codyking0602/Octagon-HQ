import { describe, expect, it } from "vitest";
import footballShellCss from "./football-shell.css?raw";

describe("Football HQ team theme", () => {
  it("keeps the Cowboys shell navy-first with silver as the secondary accent", () => {
    expect(footballShellCss).toContain(`.app-shell--football-team-cowboys {
  --football-accent: #aebdcb;
  --football-accent-rgb: 4, 30, 66;
  --football-accent-contrast: #06111f;
  --football-action: #163f67;
  --football-action-contrast: #f5f7fa;
  --football-card: #0b1118;
  --football-card-raised: #0e1822;
  --football-card-soft: #080d12;
}`);

    expect(footballShellCss).toContain("background: var(--football-action) !important;");
    expect(footballShellCss).toContain("color: var(--football-action-contrast) !important;");
  });
});
