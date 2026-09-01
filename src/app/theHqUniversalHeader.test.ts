import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shell = readFileSync("src/app/AppShell.tsx", "utf8");
const brandLink = readFileSync("src/features/back-room/BackRoomLogoLink.tsx", "utf8");
const styles = readFileSync("src/styles/global.css", "utf8");

describe("The HQ universal header", () => {
  it("keeps one shell header owner across UFC and Football routes", () => {
    expect(shell).toContain('className="app-header app-header--universal"');
    expect(shell).not.toContain("<FootballHeader />");
    expect(shell).toContain("<NotificationHeaderAction />");
    expect(shell).toContain('to="/intelligence"');
    expect(shell).toContain('aria-label="Open UFC Intelligence"');
    expect(shell).toContain("<IdentityControl />");
  });

  it("uses compact umbrella branding and the locked universal palette", () => {
    expect(brandLink).toContain('aria-label="The HQ"');
    expect(brandLink).toContain('className="the-hq-brand__logo"');
    expect(brandLink).toContain('<small>THE</small> HQ');
    expect(styles).toContain(".app-header--universal");
    expect(styles).toContain("color: #d4af37");
  });
});
