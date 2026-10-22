import { describe, expect, it } from "vitest";
import {
  FAMILY_FEUD_FAST_MONEY_TIME_MS,
  assertFamilyFeudPack,
  createFamilyFeudState,
  familyFeudScore,
  matchFamilyFeudAnswer,
  submitFamilyFeudFastMoneyAnswer,
  submitFamilyFeudMainAnswer,
  timeoutFamilyFeudFastMoney,
} from "../games/familyFeudEngine";
import {
  NBA_SPORTS_FEUD_MAIN,
  NBA_SPORTS_FEUD_FAST,
  NBA_SPORTS_FEUD_MAIN_POINTS,
  NBA_SPORTS_FEUD_FAST_POINTS,
  buildNbaSportsFeudPack,
} from "./nbaSportsFeudBank";

function findSeed(questionId: string, side: "main" | "fast") {
  for (let i = 0; i < 256; i++) {
    const seed = "quality-" + i;
    const pack = buildNbaSportsFeudPack(seed);
    const questions = side === "main" ? pack.mainBoards : pack.fastMoney;
    if (questions.some(question => question.id === "nba-feud-" + questionId)) return pack;
  }
  throw new Error("No seed selected " + questionId);
}
function matchedEntity(pack: ReturnType<typeof buildNbaSportsFeudPack>, questionId: string, input: string) {
  const question = [...pack.mainBoards, ...pack.fastMoney].find(q => q.id === "nba-feud-" + questionId)!;
  const result = matchFamilyFeudAnswer(pack, question, input);
  return result.status === "matched"
    ? pack.entities.find(entity => entity.id === result.entityId)?.displayName
    : result.status;
}

describe("NBA Sports Feud curated-bank and unchanged engine contract", () => {
  it("maintains a substantial, distinct authored pool and editorial scoring ladders", () => {
    expect(NBA_SPORTS_FEUD_MAIN).toHaveLength(16);
    expect(NBA_SPORTS_FEUD_FAST).toHaveLength(32);
    expect(NBA_SPORTS_FEUD_MAIN_POINTS.slice(0, 4).reduce((a, b) => a + b, 0)).toBe(30);
    expect(NBA_SPORTS_FEUD_FAST_POINTS[0]).toBe(8);
    for (const question of [...NBA_SPORTS_FEUD_MAIN, ...NBA_SPORTS_FEUD_FAST]) {
      expect(question.answers).toHaveLength(8);
      expect(new Set([...question.answers, ...question.extras].map(s => s.toLowerCase())).size)
        .toBe(question.answers.length + question.extras.length);
      expect(question.prompt.length).toBeLessThan(150);
    }
  });

  it("keeps all 32 Fast Money prompts answerable without season-roster or Finals recall", () => {
    const narrowTrivia = /\\b(?:19|20)\\d{2}\\b|\\b(?:finals|playoff series|game [1-7]|championship roster)\\b/i;
    expect(NBA_SPORTS_FEUD_FAST).toHaveLength(32);
    for (const question of NBA_SPORTS_FEUD_FAST) {
      expect(question.prompt).not.toMatch(narrowTrivia);
      expect(question.prompt).toMatch(/^Name (?:an? |a |a famous |a well-known )/);
      expect(question.answers).toHaveLength(8);
      expect(question.category).toBeTruthy();
    }
    // Category collisions between the banks are deliberate: they ensure we
    // never ask nearly identical topics (e.g. Bulls alumni and Bulls All-Stars)
    // during a single seven-question run.
    const sharedTopics = [
      ["bulls-stars", "duke"],
      ["lakers-champs", "lakers-legends"],
      ["warriors-champs", "warriors"],
      ["spurs-champs", "spurs"],
      ["dunk-winners", "dunkers"],
      ["three-point-contest", "shooters"],
    ] as const;
    for (const [mainId, fastId] of sharedTopics) {
      expect(NBA_SPORTS_FEUD_MAIN.find(q => q.id === mainId)!.category)
        .toBe(NBA_SPORTS_FEUD_FAST.find(q => q.id === fastId)!.category);
    }
  });

  it("replaces narrow finals and one-year rosters with immediate NBA associations", () => {
    const examples: ReadonlyArray<[string, string]> = [
      ["finals24", "Kyrie Irving"],
      ["finals23", "Nikola Jokic"],
      ["bubble", "Kawhi Leonard"],
      ["cavs16", "James Harden"],
      ["mavs11", "Devin Booker"],
      ["celtics08", "Giannis"],
      ["pistons04", "Cade Cunningham"],
      ["duke", "Michael Jordan"],
      ["top-picks", "Steph"],
      ["sixth", "D-Wade"],
      ["rookies", "Cooper Flagg"],
    ];
    for (const [id, answer] of examples) {
      const pack = findSeed(id, "fast");
      const result = matchedEntity(pack, id, answer);
      expect(result, `${id} should accept ${answer}`).not.toMatch(/^(ambiguous|unrecognized|empty)$/);
      expect(result).toBeTruthy();
    }
  });

  it("selects two main boards and five varied fast prompts on a reproducible seed", () => {
    for (let i = 0; i < 96; i++) {
      const seed = "2026-11-" + i;
      const pack = buildNbaSportsFeudPack(seed);
      expect(() => assertFamilyFeudPack(pack)).not.toThrow();
      expect(pack).toEqual(buildNbaSportsFeudPack(seed));
      expect(pack.sport).toBe("nba");
      expect(pack.mainBoards).toHaveLength(2);
      expect(pack.fastMoney).toHaveLength(5);
      expect(new Set([...pack.mainBoards, ...pack.fastMoney].map(q => q.id)).size).toBe(7);
      const selected = [...pack.mainBoards, ...pack.fastMoney]
        .map(q => [...NBA_SPORTS_FEUD_MAIN, ...NBA_SPORTS_FEUD_FAST]
          .find(authored => q.id === "nba-feud-" + authored.id)!.category);
      expect(new Set(selected).size).toBe(7);
    }
  });

  it("recognizes player nicknames, team abbreviations, surname typos, and valid off-board answers", () => {
    const finalsPack = findSeed("fmvp", "main");
    expect(matchedEntity(finalsPack, "fmvp", "King James")).toBe("LeBron James");
    expect(matchedEntity(finalsPack, "fmvp", "Steph")).toBe("Stephen Curry");
    expect(matchedEntity(finalsPack, "fmvp", "SGA")).toBe("Shai Gilgeous-Alexander");
    expect(matchedEntity(finalsPack, "fmvp", "Nowitzk")).toBe("Dirk Nowitzki");

    const championsPack = findSeed("champions", "main");
    expect(matchedEntity(championsPack, "champions", "Mavs")).toBe("Dallas Mavericks");
    expect(matchedEntity(championsPack, "champions", "GSW")).toBe("Golden State Warriors");
    expect(matchedEntity(championsPack, "champions", "Cavs")).toBe("Cleveland Cavaliers");

    let state = createFamilyFeudState();
    if (finalsPack.mainBoards[0]?.id !== "nba-feud-fmvp") {
      // Clear the prior selected main board to reach the Finals MVP prompt.
      for (const unknown of ["no one a", "no one b", "no one c"]) {
        state = submitFamilyFeudMainAnswer(finalsPack, state, unknown).state;
      }
    }
    const accepted = submitFamilyFeudMainAnswer(finalsPack, state, "SGA");
    expect(accepted.outcome.type).toBe("board-also-accepted");
    expect(accepted.outcome).toMatchObject({ points: 2 });
    expect(accepted.state.mainBoards[accepted.state.mainBoardIndex]!.strikes).toBe(0);
  });

  it("accepts the complete bounded 1992 Dream Team roster, not only the eight top-ranked names", () => {
    const pack = findSeed("dream92", "main");
    const roster = [
      "Michael Jordan", "Magic Johnson", "Larry Bird", "Charles Barkley",
      "Scottie Pippen", "Karl Malone", "John Stockton", "Patrick Ewing",
      "David Robinson", "Chris Mullin", "Clyde Drexler", "Christian Laettner",
    ];
    const question = pack.mainBoards.find(q => q.id === "nba-feud-dream92")!;
    expect(question.candidateIds).toHaveLength(12);
    for (const name of roster) expect(matchedEntity(pack, "dream92", name)).toBe(name);
  });

  it("accepts recent and less obvious factual award, dunk, and 70-point answers", () => {
    expect(matchedEntity(findSeed("dpoy", "main"), "dpoy", "Wemby"))
      .toBe("Victor Wembanyama");
    expect(matchedEntity(findSeed("dunk-winners", "main"), "dunk-winners", "Keshad Johnson"))
      .toBe("Keshad Johnson");
    expect(matchedEntity(findSeed("seventy", "main"), "seventy", "David Robinson"))
      .toBe("David Robinson");
    expect(matchedEntity(findSeed("multi-mvp", "main"), "multi-mvp", "SGA"))
      .toBe("Shai Gilgeous-Alexander");
  });

  it("does not award ambiguous player first names or a repeat guess", () => {
    const pack = findSeed("celtics-legends", "fast");
    const question = pack.fastMoney.find(q => q.id === "nba-feud-celtics-legends")!;
    expect(matchFamilyFeudAnswer(pack, question, "Kevin").status).toBe("ambiguous");
    const finals = findSeed("fmvp", "main");
    let state = createFamilyFeudState();
    if (finals.mainBoards[0]?.id !== "nba-feud-fmvp") {
      for (const unknown of ["wrong one", "wrong two", "wrong three"]) {
        state = submitFamilyFeudMainAnswer(finals, state, unknown).state;
      }
    }
    state = submitFamilyFeudMainAnswer(finals, state, "LeBron James").state;
    const repeated = submitFamilyFeudMainAnswer(finals, state, "King James");
    expect(repeated.outcome.type).toBe("already-guessed");
    expect(repeated.state).toEqual(state);
  });

  it("runs two four-answer boards, five Fast Money answers, and produces the exact 100-point result", () => {
    const pack = buildNbaSportsFeudPack("full-run");
    let state = createFamilyFeudState();
    for (const board of pack.mainBoards) {
      for (const ranked of board.answers.slice(0, 4)) {
        const name = pack.entities.find(e => e.id === ranked.entityId)!.displayName;
        state = submitFamilyFeudMainAnswer(pack, state, name).state;
      }
    }
    expect(state.phase).toBe("fast-money");
    expect(familyFeudScore(pack, state).main).toBe(60);
    for (const question of pack.fastMoney) {
      const name = pack.entities.find(e => e.id === question.answers[0]!.entityId)!.displayName;
      state = submitFamilyFeudFastMoneyAnswer(pack, state, name, FAMILY_FEUD_FAST_MONEY_TIME_MS - 1).state;
    }
    expect(state.phase).toBe("complete");
    expect(state.fastMoneyResults).toHaveLength(5);
    expect(familyFeudScore(pack, state)).toMatchObject({ main: 60, fastMoney: 40, raw: 100, hq: 100 });
  });

  it("uses three strikes per board, then expires Fast Money at 50 seconds", () => {
    const pack = buildNbaSportsFeudPack("timeout");
    let state = createFamilyFeudState();
    for (let board = 0; board < 2; board++) {
      for (let miss = 0; miss < 3; miss++) {
        const next = submitFamilyFeudMainAnswer(pack, state, "not-valid-" + board + "-" + miss);
        expect(next.outcome.type).toBe("board-strike");
        state = next.state;
      }
    }
    expect(state.phase).toBe("fast-money");
    expect(state.mainBoards.map(b => b.strikes)).toEqual([3, 3]);
    state = timeoutFamilyFeudFastMoney(state).state;
    expect(state.phase).toBe("complete");
    expect(state.fastMoneyTimeRemainingMs).toBe(0);
    expect(familyFeudScore(pack, state).hq).toBe(0);
  });

  it("limits Fast Money to five responses with one point for a defensible off-board answer", () => {
    const pack = findSeed("lakers-legends", "fast");
    let state = createFamilyFeudState();
    for (let board = 0; board < 2; board++) {
      for (let miss = 0; miss < 3; miss++) {
        state = submitFamilyFeudMainAnswer(pack, state, "missing-" + board + "-" + miss).state;
      }
    }
    for (const question of pack.fastMoney) {
      const response = question.id === "nba-feud-lakers-legends"
        ? "Wilt Chamberlain"
        : pack.entities.find(e => e.id === question.answers[0]!.entityId)!.displayName;
      state = submitFamilyFeudFastMoneyAnswer(pack, state, response, 40_000).state;
    }
    expect(state.phase).toBe("complete");
    expect(state.fastMoneyResults.find(r => r.questionId === "nba-feud-lakers-legends")?.points).toBe(1);
    expect(state.fastMoneyResults).toHaveLength(5);
    expect(familyFeudScore(pack, state).fastMoney).toBe(33);
  });
});
