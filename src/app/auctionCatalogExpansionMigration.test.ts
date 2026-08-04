import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { rankedPlayFighters } from "../features/play/playFighterPool";
import { canonicalRankingInputs } from "../features/rankings/data/rankingInputs";

const catalogSql = readFileSync("supabase/migrations/202609040001_auction_catalog_expansion.sql", "utf8");
const graderSql = readFileSync("supabase/migrations/202609040002_auction_catalog_v2_grader.sql", "utf8");

const v1CatalogSql = [2, 3, 4, 5, 6].map((part) => readFileSync(`supabase/migrations/20260902000${part}_auction_real_ufc_catalog_${part === 2 ? "fighters" : part === 3 ? "careers" : part === 4 ? "history_a" : part === 5 ? "history_b" : "history_c"}.sql`, "utf8")).join("\n");
const copiedV1Items = [...v1CatalogSql.matchAll(/\$auction_catalog_rows\$\s*([\s\S]*?)\s*\$auction_catalog_rows\$/g)]
  .flatMap((block) => block[1]!.trim().split("\n"))
  .map((row) => {
    const [mode, originalLabel] = row.split("|");
    const replacements: Record<string, string> = {
      "fighter-performances|Jose Aldo vs Urijah Faber — UFC 112": "José Aldo performance vs Frankie Edgar — UFC 156",
      "championship-performances|Jose Aldo vs Urijah Faber — UFC 112": "José Aldo vs Frankie Edgar — UFC 156",
      "dominant-performances|Jose Aldo vs Urijah Faber — UFC 112": "Georges St-Pierre vs Dan Hardy — UFC 111",
    };
    return { mode: mode!, label: replacements[`${mode}|${originalLabel}`] ?? originalLabel! };
  })
  .filter(({ mode }) => !["jon-jones-performances", "conor-mcgregor-performances", "charles-oliveira-performances"].includes(mode));
const insertedV2Items = [...catalogSql.matchAll(/\('ufc-auction-2026-08-v2','([^']+)','[^']+','((?:[^']|'')*)'/g)]
  .map((match) => ({ mode: match[1]!, label: match[2]!.replaceAll("''", "'") }));
const effectiveV2Items = [...copiedV1Items, ...insertedV2Items];

const reviewedFighterPerformances = [
  {
    "label": "Georges St-Pierre performance vs Jon Fitch — UFC 87",
    "score": 97
  },
  {
    "label": "Anderson Silva performance vs Chris Leben — UFC Fight Night 5",
    "score": 96
  },
  {
    "label": "Jon Jones performance vs Ryan Bader — UFC 126",
    "score": 96
  },
  {
    "label": "Conor McGregor performance vs Chad Mendes — UFC 189",
    "score": 95
  },
  {
    "label": "Max Holloway performance vs Brian Ortega — UFC 231",
    "score": 98
  },
  {
    "label": "Khabib Nurmagomedov performance vs Justin Gaethje — UFC 254",
    "score": 97
  },
  {
    "label": "Demetrious Johnson performance vs Henry Cejudo — UFC 197",
    "score": 94
  },
  {
    "label": "Amanda Nunes performance vs Ronda Rousey — UFC 207",
    "score": 98
  },
  {
    "label": "José Aldo performance vs Chad Mendes — UFC 179",
    "score": 96
  },
  {
    "label": "Dominick Cruz performance vs Takeya Mizugaki — UFC 178",
    "score": 95
  },
  {
    "label": "Cody Garbrandt performance vs Raphael Assunção — UFC 250",
    "score": 97
  },
  {
    "label": "T.J. Dillashaw performance vs John Lineker — UFC 207",
    "score": 98
  },
  {
    "label": "Kamaru Usman performance vs Jorge Masvidal — UFC 261",
    "score": 96
  },
  {
    "label": "Alexander Volkanovski performance vs Chan Sung Jung — UFC 273",
    "score": 95
  },
  {
    "label": "Islam Makhachev performance vs Dan Hooker — UFC 267",
    "score": 94
  },
  {
    "label": "Charles Oliveira performance vs Kevin Lee — UFC Fight Night 170",
    "score": 94
  },
  {
    "label": "Alex Pereira performance vs Sean Strickland — UFC 276",
    "score": 93
  },
  {
    "label": "Ilia Topuria performance vs Josh Emmett — UFC Jacksonville",
    "score": 95
  },
  {
    "label": "Leon Edwards performance vs Nate Diaz — UFC 263",
    "score": 91
  },
  {
    "label": "Zhang Weili performance vs Jessica Andrade — UFC Shenzhen",
    "score": 96
  },
  {
    "label": "Valentina Shevchenko performance vs Priscila Cachoeira — UFC Fight Night 125",
    "score": 94
  },
  {
    "label": "Ronda Rousey performance vs Sara McMann — UFC 170",
    "score": 95
  },
  {
    "label": "Chris Weidman performance vs Mark Muñoz — UFC on Fuel TV 4",
    "score": 96
  },
  {
    "label": "Lyoto Machida performance vs Thiago Silva — UFC 95",
    "score": 97
  },
  {
    "label": "B.J. Penn performance vs Joe Stevenson — UFC 80",
    "score": 97
  },
  {
    "label": "Frankie Edgar performance vs Yair Rodríguez — UFC 211",
    "score": 94
  },
  {
    "label": "Tony Ferguson performance vs Rafael dos Anjos — UFC Fight Night 98",
    "score": 95
  },
  {
    "label": "Dustin Poirier performance vs Eddie Alvarez — UFC on Fox 30",
    "score": 94
  },
  {
    "label": "Justin Gaethje performance vs Tony Ferguson — UFC 249",
    "score": 98
  },
  {
    "label": "Robbie Lawler performance vs Josh Koscheck — UFC 157",
    "score": 92
  },
  {
    "label": "Demian Maia performance vs Jon Fitch — UFC 156",
    "score": 94
  },
  {
    "label": "Fabricio Werdum performance vs Cain Velasquez — UFC 188",
    "score": 97
  },
  {
    "label": "Stipe Miocic performance vs Francis Ngannou — UFC 220",
    "score": 96
  },
  {
    "label": "Daniel Cormier performance vs Derrick Lewis — UFC 230",
    "score": 93
  },
  {
    "label": "Francis Ngannou performance vs Jairzinho Rozenstruik — UFC 249",
    "score": 94
  },
  {
    "label": "Tom Aspinall performance vs Alexander Volkov — UFC London",
    "score": 94
  },
  {
    "label": "Alexandre Pantoja performance vs Steve Erceg — UFC 301",
    "score": 93
  },
  {
    "label": "Brandon Moreno performance vs Kai Kara-France — UFC 277",
    "score": 94
  },
  {
    "label": "Sean O’Malley performance vs Aljamain Sterling — UFC 292",
    "score": 94
  },
  {
    "label": "Merab Dvalishvili performance vs Petr Yan — UFC Fight Night 221",
    "score": 96
  }
] as const;

const targets = {
  "ultimate-fighter": 80,
  "jon-jones-performances": 24,
  "conor-mcgregor-performances": 14,
  "charles-oliveira-performances": 37,
  "fighter-performances": 64,
  strikers: 48,
  grapplers: 48,
  "knockout-artists": 48,
  "greatest-ufc-card": 64,
  "championship-performances": 48,
  finishes: 64,
  "dominant-performances": 48,
  wars: 48,
  rivalries: 48,
  "iconic-moments": 64,
  nicknames: 64,
} as const;

describe("Auction catalog expansion migration", () => {
  it("pins all exact v2 counts and validates private absolute inputs", () => {
    for (const [mode, count] of Object.entries(targets)) {
      expect(catalogSql).toContain(`"${mode}":${count}`);
    }
    expect(catalogSql).toContain("grading_inputs->>'overall')::numeric not between 0 and 100");
    expect(catalogSql).toContain("array['Striking','Grappling','Frame','Power','Heart']");
    expect(catalogSql).toContain("content_version='ufc-auction-2026-08-v2'");
    expect(catalogSql).not.toMatch(/update\s+private\.auction_catalog\s+set/i);
    expect(catalogSql).toContain("when private_generation_class='ace' then 1.70");
    expect(catalogSql).toContain("when private_generation_class='headliner' then 0.70");
  });

  it("keeps one grader, plain averages, and both pinned generations", () => {
    expect(graderSql).toContain("create or replace function private.grade_auction");
    expect(graderSql.match(/round\(avg\(score_value\), 2\)/g)).toHaveLength(2);
    expect(graderSql).not.toMatch(/percentile|percent_rank|bank_size|rarity_band\s*\*/i);
    for (const version of ["ufc-auction-2026-08-v1", "ufc-auction-2026-08-v2"]) {
      expect(graderSql).toContain(version);
    }
  });

  it("reproduces every added Ultimate Fighter field from canonical ranking data", () => {
    const frameByDivision: Record<string, number> = {
      Heavyweight: 96, "Light Heavyweight": 91, Middleweight: 86, Welterweight: 82,
      Lightweight: 79, Featherweight: 76, Bantamweight: 72, Flyweight: 68,
      "Women's Bantamweight": 70, "Women's Flyweight": 66, "Women's Strawweight": 62,
    };
    const additions = [...catalogSql.matchAll(/'ultimate-fighter-(\d+)','((?:[^']|'')*)'.*?jsonb_build_object\(([^)]*)\)/g)]
      .filter((match) => Number(match[1]) >= 31);
    expect(additions).toHaveLength(50);
    const canonicalByName = new Map(rankedPlayFighters.map((fighter) => [fighter.name.replaceAll("’", "'").normalize("NFKD").replace(/[\u0300-\u036f]/g, ""), fighter]));
    for (const row of additions) {
      const name = row[2]!.replaceAll("''", "'");
      const fighter = canonicalByName.get(name.replaceAll("’", "'").normalize("NFKD").replace(/[\u0300-\u036f]/g, ""));
      expect(fighter, `missing canonical fighter for ${name}`).toBeDefined();
      const inputs = Object.fromEntries([...row[3]!.matchAll(/'([^']+)',(\d+)/g)].map((entry) => [entry[1]!, Number(entry[2])]));
      const expectedPower = Math.min(99, Math.max(55, Math.round(62 + fighter!.model.visibleStats.finishRatePct * 0.36)));
      const expectedHeart = Math.min(99, Math.max(60, Math.round(0.55 * fighter!.model.visibleStats.roundsWonPct + 0.9 * fighter!.model.longevity + 25)));
      expect(inputs, name).toEqual({
        overall: fighter!.ratings.career,
        Striking: fighter!.ratings.striking,
        Grappling: fighter!.ratings.grappling,
        Frame: frameByDivision[fighter!.model.primaryDivision] ?? 78,
        Power: expectedPower,
        Heart: expectedHeart,
      });
    }
  });

  it("contains current career identities and mode-specific category membership", () => {
    for (const [mode, count] of [["jon-jones-performances", 24], ["conor-mcgregor-performances", 14], ["charles-oliveira-performances", 37]] as const) {
      const references = [...catalogSql.matchAll(new RegExp(`'${mode}','${mode}-([0-9]+)'`, "g"))].map((match) => Number(match[1]));
      expect(references, mode).toEqual(Array.from({ length: count }, (_, index) => index + 1));
    }
    expect(catalogSql).toContain("Jon Jones vs Daniel Cormier — UFC 214");
    expect(catalogSql).toContain("Conor McGregor vs Dustin Poirier — UFC 264");
    expect(catalogSql).toContain("Charles Oliveira vs Mateusz Gamrot — UFC Fight Night: Oliveira vs Gamrot");
    expect(catalogSql).toContain("Charles Oliveira vs Max Holloway — UFC 326");
    expect(catalogSql).not.toContain("delete from private.auction_catalog");
    for (const invalid of ["Conor McGregor", "Stipe Miocic", "Dustin Poirier", "Justin Gaethje", "Max Holloway", "Cris Cyborg", "Ciryl Gane", "Junior dos Santos", "Chuck Liddell", "Sean O’Malley"]) {
      expect(catalogSql).not.toMatch(new RegExp(`'grapplers-[0-9]+','${invalid}'`));
    }
    for (const invalid of ["Merab Dvalishvili", "Ronda Rousey", "Dominick Cruz", "Henry Cejudo"]) {
      expect(catalogSql).not.toMatch(new RegExp(`'knockout-artists-[0-9]+','${invalid}'`));
    }
    const additionsFor = (mode: string) => [...catalogSql.matchAll(new RegExp(`'${mode}-(?:2[5-9]|[3-5][0-9]|6[0-4])','((?:[^']|'')*)'`, "g"))].map((match) => match[1]!.replaceAll("''", "'"));
    const performances = additionsFor("fighter-performances");
    const wars = additionsFor("wars");
    expect(performances).toEqual(reviewedFighterPerformances.map((item) => item.label));
    const performanceScores = [...catalogSql.matchAll(/'fighter-performances-(?:2[5-9]|[3-5][0-9]|6[0-4])'.*?jsonb_build_object\('overall',(\d+)\)/g)].map((match) => Number(match[1]));
    expect(performanceScores).toEqual(reviewedFighterPerformances.map((item) => item.score));
    const boutIdentity = (label: string) => label.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(" performance vs ", " vs ").split(" — ")[0]!.trim();
    const performanceBouts = new Set(performances.map(boutIdentity));
    for (const mode of ["wars", "greatest-ufc-card", "championship-performances", "dominant-performances"]) {
      const reused = additionsFor(mode).map(boutIdentity).filter((identity) => performanceBouts.has(identity));
      expect(reused.length, `${mode} sequence was recycled`).toBeLessThan(10);
    }
    const rivalries = additionsFor("rivalries");
    expect(rivalries).toHaveLength(24);
    expect(rivalries).not.toContain("Israel Adesanya vs Kelvin Gastelum");
    expect(rivalries).not.toContain("Dustin Poirier vs Dan Hooker");
    const reviewedTitleBouts = new Set([
      "Georges St-Pierre vs B.J. Penn — UFC 94", "Frankie Edgar vs Gray Maynard — UFC 125", "Jon Jones vs Alexander Gustafsson — UFC 165", "Jose Aldo vs Chad Mendes — UFC 179",
      "Kamaru Usman vs Colby Covington — UFC 245", "Jiri Prochazka vs Glover Teixeira — UFC 275", "Leon Edwards vs Kamaru Usman — UFC 278", "Alex Pereira vs Israel Adesanya — UFC 287",
      "Anderson Silva vs Chael Sonnen — UFC 117", "Demetrious Johnson vs Ray Borg — UFC 216", "Amanda Nunes vs Ronda Rousey — UFC 207", "Kamaru Usman vs Gilbert Burns — UFC 258",
      "B.J. Penn vs Joe Stevenson — UFC 80", "Cain Velasquez vs Junior dos Santos — UFC 166", "Ronda Rousey vs Miesha Tate — UFC 168", "Rose Namajunas vs Joanna Jedrzejczyk — UFC 217",
      "Valentina Shevchenko vs Taila Santos — UFC 275", "Charles Oliveira vs Michael Chandler — UFC 262", "Matt Hughes vs Frank Trigg — UFC 52", "Alexandre Pantoja vs Steve Erceg — UFC 301",
      "Holly Holm vs Ronda Rousey — UFC 193", "Chris Weidman vs Anderson Silva — UFC 162", "Michael Bisping vs Luke Rockhold — UFC 199", "Anthony Pettis vs Benson Henderson — UFC 164",
    ]);
    expect(additionsFor("championship-performances")).toEqual([...reviewedTitleBouts]);
    expect(catalogSql).not.toContain("Melvin Manhoef");
    const normalize = (value: string) => value.replaceAll("’", "'").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const ranked = new Map(rankedPlayFighters.map((fighter) => [normalize(fighter.name), fighter]));
    const facts = new Map(canonicalRankingInputs.fighters.map((fighter) => [normalize(fighter.fighter), fighter]));
    for (const mode of ["strikers", "grapplers", "knockout-artists"] as const) {
      const rows = [...catalogSql.matchAll(new RegExp(`'${mode}-(?:1[7-9]|[2-4][0-9])','((?:[^']|'')*)'.*?jsonb_build_object\\('overall',(\\d+)`, "g"))];
      expect(rows, mode).toHaveLength(32);
      for (const row of rows) {
        const name = row[1]!.replaceAll("''", "'");
        const fighter = ranked.get(normalize(name));
        expect(fighter, `${mode}: ${name} lacks canonical UFC participation`).toBeDefined();
        if (mode === "strikers") expect(Number(row[2]), name).toBe(fighter!.ratings.striking);
        if (mode === "grapplers") expect(Number(row[2]), name).toBe(fighter!.ratings.grappling);
        if (mode === "knockout-artists") {
          const koWins = facts.get(normalize(name))!.facts.fights.filter((fight) => fight.officialResult === "win" && fight.methodCategory === "ko-tko").length;
          expect(koWins, `${name} has no completed UFC knockout`).toBeGreaterThan(0);
          expect(Number(row[2]), name).toBe(Math.min(95, 75 + koWins * 2));
        }
      }
    }
  });

  it("builds every effective v2 bank without label or cosmetic identity duplicates", () => {
    const normalizeText = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replaceAll("’", "'").toLowerCase().trim();
    const fighters = rankedPlayFighters.map((fighter) => normalizeText(fighter.name)).sort((a, b) => b.length - a.length);
    const matchupModes = new Set(["greatest-ufc-card", "championship-performances", "dominant-performances", "wars", "rivalries"]);
    const identity = (mode: string, label: string) => {
      const normalized = normalizeText(label);
      const [rawBase, rawEvent = ""] = normalized.split(" — ");
      const base = rawBase!.replace(" performance vs ", " vs ").replace(/ featured bout$/, "").trim();
      const event = rawEvent.replace(/^ufc fight night:?\s*/, "ufc fn ").replace(/^ufc on (fox|espn|fuel tv)\s*/, "ufc $1 ").trim();
      if (matchupModes.has(mode) && base.includes(" vs ")) return `${base.split(" vs ").map((name) => name.trim()).sort().join(" vs ")} @ ${event}`;
      if (mode === "finishes") {
        const participants = fighters.filter((fighter) => base.includes(fighter));
        if (participants.length >= 2) return `${[...new Set(participants.slice(0, 2))].sort().join(" vs ")} @ ${event}`;
      }
      return `${base} @ ${event}`;
    };
    expect(effectiveV2Items).toHaveLength(811);
    for (const [mode, label] of [
      ["fighter-performances", "José Aldo performance vs Frankie Edgar — UFC 156"],
      ["championship-performances", "José Aldo vs Frankie Edgar — UFC 156"],
      ["dominant-performances", "Georges St-Pierre vs Dan Hardy — UFC 111"],
      ["fighter-performances", "José Aldo performance vs Chad Mendes — UFC 179"],
      ["dominant-performances", "Georges St-Pierre vs Thiago Alves — UFC 100"],
    ] as const) expect(effectiveV2Items).toContainEqual({ mode, label });
    const normalizedLabels = effectiveV2Items.map((item) => normalizeText(item.label));
    expect(normalizedLabels.filter((label) => label.includes("aldo") && label.includes("faber"))).toEqual([]);
    expect(normalizedLabels.some((label) => label.includes("aldo") && label.includes("faber") && (label.includes("ufc 112") || label.includes("ufc 169")))).toBe(false);
    expect(catalogSql).not.toMatch(/(?:update|delete\s+from)\s+private\.auction_catalog\b/i);
    for (const [mode, expected] of Object.entries(targets)) {
      const labels = effectiveV2Items.filter((item) => item.mode === mode).map((item) => item.label);
      expect(labels, mode).toHaveLength(expected);
      expect(new Set(labels).size, `${mode} duplicate display_label`).toBe(expected);
      const identities = labels.map((label) => identity(mode, label));
      expect(new Set(identities).size, `${mode} duplicate underlying identity`).toBe(expected);
    }
  });

  it("does not grant browser roles access to catalog or grading internals", () => {
    expect(catalogSql).not.toMatch(/grant\s+select[\s\S]*auction_catalog/i);
    expect(graderSql).toContain("from public, anon, authenticated");
    expect(graderSql).not.toMatch(/grant\s+execute/i);
  });
});
