import { describe, expect, it } from "vitest";
import auctionTableCss from "./football-weekly-auction-table.css?raw";

describe("Football Weekly Auction Table mobile sheet", () => {
  it("clears the fixed bottom navigation while keeping the roster scrollable", () => {
    expect(auctionTableCss).toContain(
      "padding: 12px 10px calc(72px + var(--safe-bottom));",
    );
    expect(auctionTableCss).toContain("min-height: 0;");
    expect(auctionTableCss).toContain("overflow-y: auto;");
  });
});
