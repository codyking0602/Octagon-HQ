import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

const backRoomDir = "src/features/back-room";
const sharedComponent = readFileSync(
  backRoomDir + "/AuctionTableRosterScroll.tsx",
  "utf8",
);
const sharedStyles = readFileSync(
  "src/styles/weekly-auction-table-shared.css",
  "utf8",
);

function expandableAuctionTableDialogs() {
  return readdirSync(backRoomDir)
    .filter((name) => name.endsWith("TableDialog.tsx"))
    .map((name) => ({
      name,
      content: readFileSync(backRoomDir + "/" + name, "utf8"),
    }))
    .filter(({ content }) => (
      content.includes("AUCTION TABLE")
      && content.includes("aria-expanded")
    ));
}

describe("Weekly Auction Table roster scroll contract", () => {
  it("keeps expanded player rosters independently scrollable on touch devices", () => {
    expect(sharedComponent).toContain('className={["weekly-auction-table__roster-scroll", className]');
    expect(sharedComponent).toContain('role="region"');
    expect(sharedComponent).toContain("tabIndex={0}");
    expect(sharedStyles).toContain("max-height: min(43dvh, 360px);");
    expect(sharedStyles).toContain("overflow-y: auto;");
    expect(sharedStyles).toContain("touch-action: pan-y;");
    expect(sharedStyles).toContain("overscroll-behavior-y: contain;");
    expect(sharedStyles).toContain("-webkit-overflow-scrolling: touch;");
    expect(sharedStyles).toContain("max-height: min(46dvh, 340px);");
  });

  it("requires every expandable Auction Table dialog to use the shared inner roster scroller", () => {
    const dialogs = expandableAuctionTableDialogs();
    expect(dialogs.length).toBeGreaterThanOrEqual(3);

    for (const dialog of dialogs) {
      expect(
        dialog.content,
        dialog.name + " must use AuctionTableRosterScroll so expanded player pills never clip roster rows",
      ).toContain("AuctionTableRosterScroll");
    }
  });
});
