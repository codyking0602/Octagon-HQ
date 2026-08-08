import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync("src/styles/whats-new.css", "utf8");

describe("What's New unread badge styling", () => {
  it("uses yellow only for the Home unread-count pill", () => {
    const unreadPill = styles.match(
      /\.whats-new-preview__heading > span \{([\s\S]*?)\n\}/,
    )?.[1];

    expect(unreadPill).toBeDefined();
    expect(unreadPill).toContain("border: 1px solid rgba(245, 158, 11, .42);");
    expect(unreadPill).toContain("background: rgba(245, 158, 11, .1);");
    expect(unreadPill).toContain("color: #f5b942;");
    expect(unreadPill).not.toContain("var(--ufc-red");

    expect(styles).toContain(".app-whats-new-action__badge");
    expect(styles).toContain("background: var(--ufc-red);");
  });
});
