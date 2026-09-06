import { describe, expect, it } from "vitest";
import { getFootballRankFivePack } from "./footballRankFivePlayableModel";

const decodeHtml = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const emitNoticeChunks = (title: string, rows: readonly unknown[], chunkSize = 40) => {
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    console.log(`::notice title=${title} ${index + 1}-${index + chunk.length}::${JSON.stringify(chunk)}`);
  }
};

describe("QB consensus source audit", () => {
  it("prints the exact runtime QB pool plus PFR and Ranker source order", async () => {
    const pack = getFootballRankFivePack("nfl-quarterbacks");
    const rows = pack.items.map((item) => ({ id: item.id, name: item.name }));
    emitNoticeChunks("QB_RUNTIME_POOL", rows);

    const pfrResponse = await fetch("https://www.pro-football-reference.com/hof/hofm_QB.htm", {
      headers: { "User-Agent": "Mozilla/5.0 Octagon-HQ source audit" },
    });
    const pfrHtml = await pfrResponse.text();
    const pfrPlayers = [...pfrHtml.matchAll(/data-stat="player"[^>]*>([\s\S]*?)<\/th>/g)]
      .map((match) => decodeHtml(match[1]))
      .filter(Boolean);
    emitNoticeChunks("PFR_HOFM_QB_ORDER", pfrPlayers, 50);

    const rankerResponse = await fetch("https://www.ranker.com/list/the-best-quarterbacks-of-all-time/ranker-nfl", {
      headers: { "User-Agent": "Mozilla/5.0 Octagon-HQ source audit" },
    });
    const rankerHtml = await rankerResponse.text();
    const rankerPlayers = [...rankerHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)]
      .map((match) => decodeHtml(match[1]))
      .filter((name) => name && !/^The Best Quarterbacks/i.test(name));
    emitNoticeChunks("RANKER_QB_H2_ORDER", rankerPlayers, 30);

    console.log("::notice title=QB_SOURCE_STATUS::" + JSON.stringify({
      pfrStatus: pfrResponse.status,
      pfrPlayers: pfrPlayers.length,
      rankerStatus: rankerResponse.status,
      rankerPlayers: rankerPlayers.length,
    }));

    expect(rows).toHaveLength(122);
    expect(pfrResponse.ok).toBe(true);
    expect(pfrPlayers.length).toBeGreaterThanOrEqual(250);
    expect(rankerResponse.ok).toBe(true);
    expect(rankerPlayers.length).toBeGreaterThan(30);
  });
});
