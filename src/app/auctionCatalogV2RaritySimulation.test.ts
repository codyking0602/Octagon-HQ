import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Item = { mode: string; ref: string; label: string; band: number; weight: number; cls: string };
const oldSql = readdirSync("supabase/migrations").filter((name) => /^20260902000[2-6]_/.test(name)).map((name) => readFileSync(`supabase/migrations/${name}`, "utf8")).join("\n");
const expansion = readFileSync("supabase/migrations/202609040001_auction_catalog_expansion.sql", "utf8");
const counters = new Map<string, number>();
const oldItems = [...oldSql.matchAll(/\$auction_catalog_rows\$\s*([\s\S]*?)\s*\$auction_catalog_rows\$/g)].flatMap((block) => block[1]!.trim().split("\n")).map((row): Item => {
  const [mode, label, band, weight, cls] = row.split("|") as [string, string, string, string, string];
  const number = (counters.get(mode) ?? 0) + 1; counters.set(mode, number);
  return { mode, ref: `${mode}-${number}`, label, band: Number(band), weight: Number(weight), cls };
}).filter((item) => !item.mode.endsWith("-performances") || item.mode === "fighter-performances");
const inserted = [...expansion.matchAll(/\('ufc-auction-2026-08-v2','([^']+)','([^']+)','((?:[^']|'')*)','(?:[^']|'')*',(\d+),([0-9.]+),'([^']+)',jsonb_build_object/g)].map((match): Item => ({
  mode: match[1]!, ref: match[2]!, label: match[3]!.replaceAll("''", "'"), band: Number(match[4]), weight: Number(match[5]), cls: match[6]!,
}));
const catalog = [...oldItems, ...inserted].map((item) => ({ ...item,
  weight: item.label === "Jon Jones" && item.mode === "ultimate-fighter" ? 0.11 : item.cls === "ace" ? 1.7 : item.cls === "headliner" ? 0.7 : item.weight,
}));
function random(seed: number) { let state = seed >>> 0; return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 2 ** 32; }; }
function deck(items: Item[], size: number, rng: () => number) {
  const keyed = items.map((item) => ({ item, key: -Math.log(Math.max(1e-7, rng())) / item.weight })).sort((a, b) => a.key - b.key);
  const capped = (classes: string[], cap: number) => new Set(keyed.filter(({ item }) => classes.includes(item.cls)).slice(0, cap).map(({ item }) => item.ref));
  const rare = capped(["mythic", "crown"], 2), featured = capped(["ace", "headliner", "signature"], 2);
  const high = new Set(keyed.filter(({ item }) => item.band >= 4).slice(0, 4).map(({ item }) => item.ref));
  return keyed.filter(({ item }) => (!rare.has(item.ref) && ["mythic", "crown"].includes(item.cls) ? false : !featured.has(item.ref) && ["ace", "headliner", "signature"].includes(item.cls) ? false : item.band >= 4 && !high.has(item.ref) ? false : true)).slice(0, size).map(({ item }) => item);
}
describe("Auction v2 rarity simulation", () => {
  it("keeps exact decks, caps, appearance bands, and improved overlap", () => {
    const rng = random(0x292_2026), runs = 8_000;
    const ultimate = catalog.filter((item) => item.mode === "ultimate-fighter");
    expect(ultimate).toHaveLength(80);
    let jon = 0, overlap = 0;
    for (let run = 0; run < runs; run += 1) {
      const first = deck(ultimate, 10, rng), second = deck(ultimate, 10, rng);
      expect(new Set(first.map((item) => item.ref)).size).toBe(10);
      expect(first.filter((item) => ["mythic", "crown"].includes(item.cls)).length).toBeLessThanOrEqual(2);
      expect(first.filter((item) => item.band >= 4).length).toBeLessThanOrEqual(4);
      if (first.some((item) => item.label === "Jon Jones")) jon += 1;
      overlap += first.filter((item) => second.some((candidate) => candidate.ref === item.ref)).length;
    }
    expect(jon / runs).toBeGreaterThanOrEqual(0.01);
    expect(jon / runs).toBeLessThanOrEqual(0.025);
    expect(overlap / runs).toBeLessThan(2.5);
    for (const mode of ["strikers", "grapplers", "knockout-artists"]) {
      const items = catalog.filter((item) => item.mode === mode); expect(items).toHaveLength(48);
      const aces = items.filter((item) => item.cls === "ace"); const counts = new Map(aces.map((item) => [item.ref, 0]));
      for (let run = 0; run < runs; run += 1) { const result = deck(items, 8, rng); expect(new Set(result.map((item) => item.ref)).size).toBe(8); expect(result.filter((item) => item.cls === "ace").length).toBeLessThanOrEqual(2); for (const ace of aces) if (result.some((item) => item.ref === ace.ref)) counts.set(ace.ref, counts.get(ace.ref)! + 1); }
      for (const count of counts.values()) { expect(count / runs, mode).toBeGreaterThan(0.20); expect(count / runs, mode).toBeLessThan(0.30); }
    }
  });
});
