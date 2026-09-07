import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const styles = readFileSync(resolve(process.cwd(), "src/styles/picks-polish.css"), "utf8");

describe("Picks fighter name wrapping", () => {
  it("lets standard-fight names such as Waldo Cortes Acosta use two lines", () => {
    const standardFightNames = styles.match(
      /\.pick-bout-card:not\(\.is-main-event\) \.pick-choice > span \{([\s\S]*?)\}/,
    )?.[1] ?? "";

    expect(standardFightNames).toContain("min-height: 31px");
    expect(standardFightNames).toContain("white-space: normal");
    expect(standardFightNames).toContain("-webkit-line-clamp: 2");
    expect(standardFightNames).not.toContain("-webkit-line-clamp: 1");
  });
});
