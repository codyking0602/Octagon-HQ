import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const main = readFileSync("src/main.tsx", "utf8");
const motion = readFileSync("src/styles/picks-event-motion.css", "utf8");

describe("Picks event header motion", () => {
  it("uses compositor motion for the poster and separate visible atmosphere", () => {
    expect(motion).toContain(".picks-event-hero.has-poster .picks-event-hero__poster");
    expect(motion).toContain("transform: translate3d(0, 0, 0) scale(1.025)");
    expect(motion).toContain("picks-event-header-particles");
    expect(motion).toContain("picks-event-header-sheen");
    expect(motion).toContain(".picks-page .picks-event-hero.has-poster .picks-event-hero__poster::after");
    expect(motion).toContain("display: block");
    expect(motion).toContain("@media (prefers-reduced-motion: reduce)");
    expect(motion).not.toContain("will-change: background-size");
    expect(motion).not.toContain("background-size: cover, 102.5% auto, cover");
    expect(motion).not.toContain("url(");
    expect(motion).not.toContain("pick-event-headers");
  });

  it("keeps picks-polish as the final player-facing Picks style owner", () => {
    const motionImport = main.indexOf('import "./styles/picks-event-motion.css";');
    const polishImport = main.indexOf('import "./styles/picks-polish.css";');

    expect(motionImport).toBeGreaterThan(-1);
    expect(polishImport).toBeGreaterThan(motionImport);
  });
});
