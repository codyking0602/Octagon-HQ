import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync("src/styles/pull-to-refresh.css", "utf8");

describe("pull-to-refresh fixed overlay ownership", () => {
  it("does not create a fixed-position containing block while the page is idle", () => {
    const idleContentRule = styles.match(/\.pull-refresh-content\s*\{([^}]*)\}/s)?.[1] ?? "";

    expect(idleContentRule).toContain("transform: none;");
    expect(idleContentRule).not.toContain("will-change");
  });

  it("applies translation and the rendering hint only during an active pull or refresh", () => {
    expect(styles).toMatch(
      /\.pull-refresh-region--pulling \.pull-refresh-content,\s*\.pull-refresh-region--ready \.pull-refresh-content,\s*\.pull-refresh-region--refreshing \.pull-refresh-content\s*\{[^}]*transform:\s*translate3d\(0, var\(--pull-refresh-distance\), 0\);[^}]*will-change:\s*transform;/s,
    );
  });
});
