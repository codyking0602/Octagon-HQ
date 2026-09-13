import { describe, expect, it } from "vitest";
import { trioPlayerVisualIdentity } from "./draftRoomTrioVisualIdentity";

describe("Draft Room Trio visual identity", () => {
  it("resolves NFL players through canonical or curated franchise identity", () => {
    expect(trioPlayerVisualIdentity("trio-nfl", "Tom Brady")).toMatchObject({
      teamCode: "NE",
      primary: "#002244",
    });
    expect(trioPlayerVisualIdentity("trio-nfl", "Josh Jacobs")).toMatchObject({
      teamCode: "GB",
      primary: "#203731",
      logoSrc: "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png",
    });
    expect(trioPlayerVisualIdentity("trio-nfl", "Cooper Kupp")).toMatchObject({
      teamCode: "LAR",
      primary: "#003594",
    });
  });

  it("uses the peak college school embedded in the CFB Trio label", () => {
    expect(trioPlayerVisualIdentity("trio-cfb", "Golden Tate · Notre Dame 2009")).toMatchObject({
      teamName: "Notre Dame · 2009",
      primary: "#0C2340",
    });
    expect(trioPlayerVisualIdentity("trio-cfb", "Miles Sanders · Penn State 2018")).toMatchObject({
      teamName: "Penn State · 2018",
      primary: "#041E42",
    });
  });
});
