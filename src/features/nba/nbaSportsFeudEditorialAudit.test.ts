import { describe, expect, it } from "vitest";
import { matchFamilyFeudAnswer, normalizeFamilyFeudInput } from "../games/familyFeudEngine";
import {
  NBA_SPORTS_FEUD_MAIN,
  NBA_SPORTS_FEUD_FAST,
  buildNbaSportsFeudPack,
  nbaSportsFeudEditorialLane,
} from "./nbaSportsFeudBank";

const ALL = [...NBA_SPORTS_FEUD_MAIN, ...NBA_SPORTS_FEUD_FAST];
function findPack(id: string, group: "main" | "fast") {
  for (let n = 0; n < 2048; n++) {
    const pack = buildNbaSportsFeudPack("editorial-" + n);
    if ((group === "main" ? pack.mainBoards : pack.fastMoney).some(q => q.id === "nba-feud-" + id)) return pack;
  }
  throw new Error("Unreachable editorial question " + id);
}
function accepted(id: string, group: "main" | "fast", guess: string) {
  const pack = findPack(id, group);
  const question = [...pack.mainBoards, ...pack.fastMoney].find(q => q.id === "nba-feud-" + id)!;
  const match = matchFamilyFeudAnswer(pack, question, guess);
  return match.status === "matched"
    ? pack.entities.find(e => e.id === match.entityId)!.displayName
    : match.status;
}

describe("NBA Feud expanded question-bank editorial integrity", () => {
  it("has eight distinctive ranked names and valid extras on all curated questions", () => {
    expect(NBA_SPORTS_FEUD_MAIN).toHaveLength(71);
    expect(NBA_SPORTS_FEUD_FAST).toHaveLength(130);
    expect(new Set(ALL.map(q => q.id)).size).toBe(ALL.length);
    expect(new Set(ALL.map(q => normalizeFamilyFeudInput(q.prompt))).size).toBe(ALL.length);
    for (const q of ALL) {
      const universe = [...q.answers, ...q.extras].map(normalizeFamilyFeudInput);
      expect(q.answers, q.id).toHaveLength(8);
      expect(new Set(universe).size, q.id).toBe(universe.length);
      expect(q.kind, q.id).toMatch(/^(person|team|other)$/);
      expect(q.prompt.length, q.id).toBeLessThan(150);
    }
  });

  it("does not ask season-specific or Finals-roster trivia in Fast Money", () => {
    for (const q of NBA_SPORTS_FEUD_FAST) {
      expect(q.prompt, q.id).not.toMatch(/\b(?:19|20)\d{2}\b|\b(?:finals|game [1-7]|playoff series|roster|season-specific)\b/i);
      expect(q.prompt, q.id).toMatch(/^Name (?:an? |someone |something )/);
      // The player can immediately name one of eight mainstream associations,
      // instead of reconstructing one single-season roster or obscure stat line.
      expect(q.answers).toHaveLength(8);
    }
  });

  it("accepts the complete defined conference, medal-team and never-champion sets", () => {
    for (const [id, size] of [
      ["east-teams", 15], ["west-teams", 15], ["without-nba-title", 10],
      ["redeem-team-2008", 12], ["london-team-2012", 12],
      ["recent-title-franchises", 12],
    ] as const) {
      const q = NBA_SPORTS_FEUD_MAIN.find(v => v.id === id)!;
      expect(q.answers.length + q.extras.length, id).toBe(size);
    }
    expect(accepted("east-teams", "main", "Wizards")).toBe("Washington Wizards");
    expect(accepted("west-teams", "main", "Clippers")).toBe("Los Angeles Clippers");
    expect(accepted("without-nba-title", "main", "Nets")).toBe("Brooklyn Nets");
    expect(accepted("redeem-team-2008", "main", "Deron Williams")).toBe("Deron Williams");
    expect(accepted("london-team-2012", "main", "Andre Iguodala")).toBe("Andre Iguodala");
  });

  it("fixes 2026 NBA champions and awards and catches normal fan alternate names", () => {
    expect(accepted("fmvp", "main", "Brunson")).toBe("Jalen Brunson");
    expect(accepted("finalists", "main", "Knicks")).toBe("New York Knicks");
    expect(accepted("champions", "main", "Wizards")).toBe("Washington Wizards");
    expect(accepted("champions", "main", "Kings")).toBe("Sacramento Kings");
    expect(accepted("sixth-man-award", "main", "Keldon Johnson")).toBe("Keldon Johnson");
    expect(accepted("coaches-award", "main", "Mazzulla")).toBe("Joe Mazzulla");
    expect(accepted("duke-alumni", "main", "Flagg")).toBe("Cooper Flagg");
    expect(accepted("number-one-picks", "main", "Hakeem")).toBe("Hakeem Olajuwon");
    expect(accepted("fast-free-throws", "fast", "Steph")).toBe("Stephen Curry");
    expect(accepted("nets-alumni", "fast", "KD")).toBe("Kevin Durant");
    expect(accepted("lakers-legends", "fast", "Elgin Baylor")).toBe("Elgin Baylor");
    expect(accepted("celtics-legends", "fast", "Marcus Smart")).toBe("Marcus Smart");
    expect(accepted("heat", "fast", "Duncan Robinson")).toBe("Duncan Robinson");
    expect(accepted("warriors", "fast", "Jimmy Butler")).toBe("Jimmy Butler");
    expect(accepted("knicks", "fast", "Karl-Anthony Towns")).toBe("Karl-Anthony Towns");
    expect(accepted("mavericks", "fast", "Cooper Flagg")).toBe("Cooper Flagg");
    expect(accepted("nicknames", "fast", "PG13")).toBe("Paul George");
    expect(accepted("wolves-alumni", "fast", "KAT")).toBe("Karl-Anthony Towns");
  });


  it("accepts second-pass basketball terms, venue renames and bounded history", () => {
    expect(accepted("allstar-game-mvps", "main", "Steph")).toBe("Stephen Curry");
    expect(accepted("multiple-dpoy", "main", "Sidney Moncrief")).toBe("Sidney Moncrief");
    expect(accepted("usa-paris-2024", "main", "Derrick White")).toBe("Derrick White");
    expect(accepted("assists-title-stars", "main", "Joker")).toBe("Nikola Jokic");
    expect(accepted("basketball-stat-box", "fast", "PTS")).toBe("Points");
    expect(accepted("basketball-stat-box", "fast", "Reb")).toBe("Rebounds");
    expect(accepted("basketball-shot-types", "fast", "Jumper")).toBe("Jump shot");
    expect(accepted("basketball-violations", "fast", "Palming")).toBe("Carrying");
    expect(accepted("basketball-violations", "fast", "Travel")).toBe("Traveling");
    expect(accepted("basketball-worn-gear", "fast", "Sneakers")).toBe("Basketball shoes");
    expect(accepted("basketball-court-gear", "fast", "3pt line")).toBe("Three-point line");
    expect(accepted("nba-arenas", "fast", "MSG")).toBe("Madison Square Garden");
    expect(accepted("nba-arenas", "fast", "Staples Center")).toBe("Crypto.com Arena");
    expect(accepted("nba-arenas", "fast", "Wells Fargo Center")).toBe("Xfinity Mobile Arena");
    for (const [id, size] of [
      ["multiple-dpoy", 10], ["usa-paris-2024", 12],
    ] as const) {
      const q = NBA_SPORTS_FEUD_MAIN.find(v => v.id === id)!;
      expect(q.answers.length + q.extras.length, id).toBe(size);
    }
  });


  it("accepts recognisable NBA culture, pairings and obvious Fast Money language", () => {
    expect(accepted("two-k-covers", "main", "Wemby")).toBe("Victor Wembanyama");
    expect(accepted("two-k-covers", "main", "D Wade")).toBe("Dwyane Wade");
    expect(accepted("two-k-covers", "main", "Dirk")).toBe("Dirk Nowitzki");
    expect(accepted("two-k-covers", "main", "Kareem")).toBe("Kareem Abdul-Jabbar");
    expect(accepted("two-k-covers", "main", "Vince Carter")).toBe("Vince Carter");
    expect(accepted("two-k-covers", "main", "Carmelo Anthony")).toBe("Carmelo Anthony");
    expect(accepted("space-jam-cast", "main", "Sharone Wright")).toBe("Sharone Wright");
    expect(accepted("space-jam-cast", "main", "Muggsy Bogues")).toBe("Muggsy Bogues");
    expect(accepted("famous-duos", "main", "Kobe and Shaq"))
      .toBe("Shaquille O'Neal and Kobe Bryant");
    expect(accepted("famous-duos", "main", "Klay and Steph"))
      .toBe("Stephen Curry and Klay Thompson");
    expect(accepted("named-nba-eras", "main", "Heatles")).toBe("Big Three Heat");
    expect(accepted("nba-award-labels", "main", "MVP")).toBe("Most Valuable Player");
    expect(accepted("multi-franchise-states", "main", "Kings")).toBe("Sacramento Kings");
    expect(accepted("arena-food", "fast", "coke")).toBe("Soda");
    expect(accepted("fan-gear", "fast", "baseball cap")).toBe("Team hat");
    expect(accepted("basketball-hardware", "fast", "rim")).toBe("Hoop");
    expect(accepted("before-free-throw", "fast", "bounce twice")).toBe("Dribble the ball");
    expect(accepted("nba-allstar-events", "fast", "3 point contest"))
      .toBe("Three-Point Contest");
    expect(accepted("nba-scoreboard", "fast", "quarter")).toBe("Quarter");
    expect(accepted("nba-fan-collect", "fast", "signed photos")).toBe("Signed photos");
  });

  it("keeps new bounded and subjective boards distinct from previous questions", () => {
    const thirdPassMain = [
      "two-k-covers","space-jam-cast","famous-duos","blockbuster-trades","draft-steals",
      "named-nba-eras","nba-award-labels","nba-courtside-fans","jordan-playoff-rivals",
      "former-players-execs","multi-franchise-states",
    ];
    const thirdPassFast = [
      "arena-food","arena-sights","arena-sounds","fan-gear","big-shot-crowd","crowd-boos",
      "nba-halftime","nba-introductions","nba-game-jobs","nba-scoreboard","nba-locker",
      "nba-whistle","common-fouls","turnover-reasons","ref-on-court","coach-shouts",
      "nba-subs","before-free-throw","dribble-moves","defense-actions","nba-allstar-events",
      "nba-draft-night","nba-championship-party","nba-tv-broadcast","basketball-hardware",
      "nba-pregame","nba-fan-collect",
    ];
    expect(thirdPassMain).toHaveLength(11);
    expect(thirdPassFast).toHaveLength(27);
    expect(NBA_SPORTS_FEUD_MAIN.filter(q => thirdPassMain.includes(q.id))).toHaveLength(11);
    expect(NBA_SPORTS_FEUD_FAST.filter(q => thirdPassFast.includes(q.id))).toHaveLength(27);
    expect(NBA_SPORTS_FEUD_MAIN.length + NBA_SPORTS_FEUD_FAST.length).toBe(201);
  });

  it("runs 20,000 complete varied seven-question seeds and checks alias collisions", () => {
    const frequencies = new Map<string, number>();
    const distinctSequences = new Set<string>();
    const auditedAliasQuestions = new Set<string>();
    const byId = new Map(ALL.map(q => ["nba-feud-" + q.id, q]));
    for (let i = 0; i < 20_000; i++) {
      const seed = "nba-feud-audit-" + i;
      // The pack constructor itself calls assertFamilyFeudPack; do not run
      // the expensive validation a second time on every seeded trial.
      const pack = buildNbaSportsFeudPack(seed);
      const questions = [...pack.mainBoards, ...pack.fastMoney];
      expect(questions).toHaveLength(7);
      const ids = questions.map(q => q.id);
      expect(new Set(ids).size).toBe(7);
      const categories = ids.map(id => byId.get(id)!.category);
      expect(new Set(categories).size).toBe(7);
      expect(new Set(categories.map(nbaSportsFeudEditorialLane)).size).toBe(7);
      distinctSequences.add(ids.join("|"));
      for (const question of questions) {
        frequencies.set(question.id, (frequencies.get(question.id) ?? 0) + 1);
        // A question's candidate universe never varies by seed. Validate its
        // canonical names and aliases once, rather than 20,000 times.
        if (auditedAliasQuestions.has(question.id)) continue;
        auditedAliasQuestions.add(question.id);
        const tokens = new Map<string, string>();
        const candidates = new Set(question.candidateIds);
        for (const entity of pack.entities.filter(e => candidates.has(e.id))) {
          for (const label of [entity.displayName, ...(entity.aliases ?? [])]) {
            const key = normalizeFamilyFeudInput(label);
            const prior = tokens.get(key);
            expect(prior === undefined || prior === entity.id,
              question.id + ": " + label + " ambiguously identifies two answers").toBe(true);
            tokens.set(key, entity.id);
          }
        }
      }
    }
    expect(distinctSequences.size).toBe(20_000);
    expect(auditedAliasQuestions.size).toBe(ALL.length);
    for (const q of ALL) expect(frequencies.get("nba-feud-" + q.id) ?? 0, q.id).toBeGreaterThan(0);
  }, 120_000);
});
