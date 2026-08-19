import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const picksStyles = readFileSync(resolve(process.cwd(), "src/styles/picks-polish.css"), "utf8");

describe("Picks event hero title presentation", () => {
  it("hides the redundant matchup subtitle when persisted poster artwork is present", () => {
    const posterSubtitleRule = picksStyles.match(
      /\.picks-event-hero\.has-poster \.picks-event-hero__copy > strong\s*\{([^}]*)\}/,
    )?.[1];

    expect(posterSubtitleRule).toContain("display: none");
  });

  it("keeps the normal event copy for cards without poster artwork", () => {
    expect(picksStyles).toContain(".picks-event-hero__copy > strong {");
    expect(picksStyles).toContain("font-size: clamp(15px, 4.5vw, 20px)");
  });

  it("keeps the poster event heading available to accessibility APIs", () => {
    const posterHeadingRule = picksStyles.match(
      /\.picks-event-hero\.has-poster \.picks-event-hero__copy h2\s*\{([^}]*)\}/,
    )?.[1];

    expect(posterHeadingRule).toContain("position: absolute");
    expect(posterHeadingRule).toContain("clip: rect(0 0 0 0)");
  });
});
