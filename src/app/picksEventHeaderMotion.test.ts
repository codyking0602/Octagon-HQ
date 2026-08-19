import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const main = readFileSync("src/main.tsx", "utf8");
const motion = readFileSync("src/styles/picks-event-motion.css", "utf8");

describe("Picks event header motion", () => {
  it("uses noticeable compositor motion with visible particles and sheen", () => {
    expect(motion).toContain(".picks-event-hero.has-poster .picks-event-hero__poster");
    expect(motion).toContain("animation: picks-event-header-push 12s");
    expect(motion).toContain("transform: translate3d(0, 0, 0) scale(1.06)");
    expect(motion).toContain("animation: picks-event-header-particles 14s");
    expect(motion).toContain("animation: picks-event-header-sheen 6.5s");
    expect(motion).toContain("opacity: .68");
    expect(motion).toContain(".picks-page .picks-event-hero.has-poster .picks-event-hero__poster::after");
    expect(motion).toContain("display: block");
    expect(motion).toContain("@media (prefers-reduced-motion: reduce)");
    expect(motion).not.toContain("will-change: background-size");
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
