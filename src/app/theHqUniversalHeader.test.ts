import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shell = readFileSync("src/app/AppShell.tsx", "utf8");
const brandLink = readFileSync("src/features/back-room/BackRoomLogoLink.tsx", "utf8");
const brandConfig = readFileSync("src/config/brand.ts", "utf8");
const manifest = readFileSync("public/app.webmanifest", "utf8");
const documentShell = readFileSync("index.html", "utf8");
const styles = readFileSync("src/styles/global.css", "utf8");
const appIcon = readFileSync("public/assets/the-hq-app-icon-v2.png");

describe("The HQ universal header", () => {
  it("keeps one shell header owner across UFC and Football routes", () => {
    expect(shell).toContain('className="app-header app-header--universal"');
    expect(shell).not.toContain("<FootballHeader />");
    expect(shell).toContain("<NotificationHeaderAction />");
    expect(shell).toContain('to="/intelligence"');
    expect(shell).toContain('aria-label="Open UFC Intelligence"');
    expect(shell).toContain("<IdentityControl />");
  });

  it("uses the approved neutral symbol through the canonical brand owner", () => {
    expect(brandLink).toContain('aria-label="The HQ"');
    expect(brandLink).toContain('className="the-hq-brand__logo"');
    expect(brandLink).toContain("src={brand.logoUrl}");
    expect(brandLink).not.toContain('>HQ</span>');
    expect(brandLink).toContain("borderRadius: 10");
    expect(brandConfig).toContain('logoUrl: "/assets/the-hq-app-icon-v2.png"');
    expect(existsSync("public/assets/the-hq-app-icon-v2.png")).toBe(true);
    expect(appIcon.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(appIcon.readUInt32BE(16)).toBe(512);
    expect(appIcon.readUInt32BE(20)).toBe(512);
    expect(brandLink).toContain('<small>THE</small> HQ');
    expect(styles).toContain(".app-header--universal");
  });

  it("uses the same cache-busted local HQ asset for install and Home Screen icon metadata", () => {
    expect(manifest).toContain('"src": "/assets/the-hq-app-icon-v2.png"');
    expect(documentShell).toContain('rel="icon" type="image/png" href="/assets/the-hq-app-icon-v2.png"');
    expect(documentShell).toContain('rel="apple-touch-icon" href="/assets/the-hq-app-icon-v2.png"');
    expect(documentShell).toContain('<img src="/assets/the-hq-app-icon-v2.png" alt="" />');
    expect(brandConfig).not.toContain('logoUrl: "/assets/the-hq-app-icon-v1.png"');
    expect(manifest).not.toContain('"src": "/assets/the-hq-app-icon-v1.png"');
    expect(documentShell).not.toContain('href="/assets/the-hq-app-icon-v1.png"');
    expect(documentShell).not.toContain('<img src="/assets/the-hq-app-icon-v1.png" alt="" />');
    expect(manifest).not.toContain("codyking0602.github.io/ufc-goat-rankings/assets/app-icon.png");
    expect(documentShell).not.toContain("codyking0602.github.io/ufc-goat-rankings/assets/app-icon.png");
  });
});
