import { describe, expect, it } from "vitest";
import {
  COWBOYS_PLAYER_SUMMARIES,
  cowboysPlayerSummary,
} from "./cowboysPlayerSummaries";

describe("Cowboys player summaries", () => {
  it("covers the complete approved 69-player Cowboys Since 2007 population", () => {
    expect(Object.keys(COWBOYS_PLAYER_SUMMARIES)).toHaveLength(69);
    expect(cowboysPlayerSummary("Unknown Cowboy")).toBe("");
  });

  it("keeps the brief Dallas-only resume anchors factual and grade-free", () => {
    expect(cowboysPlayerSummary("Tony Romo")).toBe("QB • 2007 NFC No. 1 seed • Three Pro Bowls from 2007 forward");
    expect(cowboysPlayerSummary("Ezekiel Elliott")).toBe("RB • Two-time NFL rushing champion • 2016 first-team All-Pro");
    expect(cowboysPlayerSummary("DeMarcus Ware")).toBe("EDGE • 20 sacks in 2008 • Two NFL sack titles with Dallas");
    expect(cowboysPlayerSummary("DaRon Bland")).toBe("DB • 2023 first-team All-Pro • NFL-record 5 pick-sixes");
    expect(cowboysPlayerSummary("Brandon Aubrey")).toBe("K • 2023 first-team All-Pro • 35 straight makes to start career");

    for (const summary of Object.values(COWBOYS_PLAYER_SUMMARIES)) {
      expect(summary).not.toMatch(/\b(?:grade|icon|elite|star|strong|core|wildcard)\b/i);
    }
  });
});
