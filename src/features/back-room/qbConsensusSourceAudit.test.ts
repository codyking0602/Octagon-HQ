import { describe, expect, it } from "vitest";
import { getFootballRankFivePack } from "./footballRankFivePlayableModel";

const decodeHtml = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, "")
    .trim();

describe("QB consensus source audit", () => {
  it("prints the exact runtime QB pool and PFR HOF Monitor order", async () => {
    const pack = getFootballRankFivePack("nfl-quarterbacks");
    const rows = pack.items.map((item) => ({ id: item.id, name: item.name }));

    console.log("QB_CONSENSUS_SOURCE_AUDIT_BEGIN");
    console.log(JSON.stringify(rows));
    console.log("QB_CONSENSUS_SOURCE_AUDIT_END");

    const response = await fetch("https://www.pro-football-reference.com/hof/hofm_QB.htm", {
      headers: { "User-Agent": "Mozilla/5.0 Octagon-HQ source audit" },
    });
    console.log("PFR_HOF_MONITOR_STATUS", response.status);
    const html = await response.text();
    const playerCells = [...html.matchAll(/data-stat="player"[^>]*>([\s\S]*?)<\/th>/g)].map((match) =>
      decodeHtml(match[1]),
    );
    console.log("PFR_HOF_MONITOR_PLAYERS_BEGIN");
    console.log(JSON.stringify(playerCells));
    console.log("PFR_HOF_MONITOR_PLAYERS_END");

    expect(rows).toHaveLength(122);
    expect(response.ok).toBe(true);
    expect(playerCells.length).toBeGreaterThanOrEqual(250);
  });
});
