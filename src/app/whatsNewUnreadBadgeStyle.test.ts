import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync("src/styles/whats-new.css", "utf8");

function selectorBlock(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return styles.match(new RegExp(`${escaped} \\{([\\s\\S]*?)\\}`))?.[1] ?? "";
}

describe("What's New unread count accent", () => {
  it("keeps the preview X NEW pill yellow instead of UFC red", () => {
    const badge = selectorBlock(".whats-new-preview__heading > span");

    expect(badge).toContain("border: 1px solid rgba(245, 158, 11, .42);");
    expect(badge).toContain("background: rgba(245, 158, 11, .1);");
    expect(badge).toContain("color: #f5b942;");
    expect(badge).not.toContain("var(--ufc-red");
  });
});
