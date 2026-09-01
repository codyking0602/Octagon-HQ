import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shell = readFileSync("src/app/AppShell.tsx", "utf8");
const brandLink = readFileSync("src/features/back-room/BackRoomLogoLink.tsx", "utf8");
const brandConfig = readFileSync("src/config/brand.ts", "utf8");
const manifest = readFileSync("public/app.webmanifest", "utf8");
const documentShell = readFileSync("index.html", "utf8");
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

  it("uses the approved HQ asset through the canonical brand owner", () => {
    expect(brandLink).toContain('aria-label="The HQ"');
    expect(brandLink).toContain('className="the-hq-brand__logo"');
    expect(brandLink).toContain("src={brand.logoUrl}");
    expect(brandLink).not.toContain('>HQ</span>');
    expect(brandConfig).toContain('logoUrl: "/assets/app-icon.png"');
    expect(existsSync("public/assets/app-icon.png")).toBe(true);
    expect(brandLink).toContain('<small>THE</small> HQ');
    expect(styles).toContain(".app-header--universal");
    expect(styles).toContain("color: #d4af37");
  });

  it("uses the same local HQ asset for install and Home Screen icon metadata", () => {
    expect(manifest).toContain('"src": "/assets/app-icon.png"');
    expect(documentShell).toContain('rel="icon" type="image/png" href="/assets/app-icon.png"');
    expect(documentShell).toContain('rel="apple-touch-icon" href="/assets/app-icon.png"');
    expect(documentShell).toContain('<img src="/assets/app-icon.png" alt="" />');
    expect(manifest).not.toContain("codyking0602.github.io/ufc-goat-rankings/assets/app-icon.png");
    expect(documentShell).not.toContain("codyking0602.github.io/ufc-goat-rankings/assets/app-icon.png");
  });
});
