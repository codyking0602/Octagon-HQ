import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const picksStyles = readFileSync(resolve(process.cwd(), "src/styles/picks-polish.css"), "utf8");

describe("Picks event poster copy", () => {
  it("hides the duplicated matchup subtitle only when event artwork is present", () => {
    expect(picksStyles).toContain(
      ".picks-event-hero.has-poster .picks-event-hero__copy > strong {\n  display: none;\n}",
    );
    expect(picksStyles).toContain(
      ".picks-event-hero__copy > strong {\n  overflow: hidden;",
    );
  });
});
