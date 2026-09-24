import { describe, expect, it } from "vitest";
import {
  assertFamilyFeudPack,
  matchFamilyFeudAnswer,
  normalizeFamilyFeudInput,
} from "../games/familyFeudEngine";
import type {
  FamilyFeudEntity,
  FamilyFeudPack,
  FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import { NFL_SPORTS_FEUD_MAIN } from "./nflSportsFeudMain";
import { NFL_SPORTS_FEUD_FAST_1 } from "./nflSportsFeudFast1";
import { NFL_SPORTS_FEUD_FAST_2 } from "./nflSportsFeudFast2";
import { NFL_SPORTS_FEUD_FAST_3 } from "./nflSportsFeudFast3";
import { NFL_SPORTS_FEUD_FAST_4 } from "./nflSportsFeudFast4";
import { NFL_SPORTS_FEUD_FAST_5 } from "./nflSportsFeudFast5";
import {
  buildSportsFeudPack,
  footballSportsFeudDomainForDay,
} from "./sportsFeudDailyBanks";
import type { SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";

const NFL_FAST = [
  ...NFL_SPORTS_FEUD_FAST_1,
  ...NFL_SPORTS_FEUD_FAST_2,
  ...NFL_SPORTS_FEUD_FAST_3,
  ...NFL_SPORTS_FEUD_FAST_4,
  ...NFL_SPORTS_FEUD_FAST_5,
] as const;

const NFL_ALL = [...NFL_SPORTS_FEUD_MAIN, ...NFL_FAST] as const;

function addDays(day: string, offset: number) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function surname(displayName: string) {
  const tokens = normalizeFamilyFeudInput(displayName).split(" ").filter(Boolean);
  while (
    tokens.length > 1
    && ["jr", "sr", "ii", "iii", "iv", "v"].includes(tokens[tokens.length - 1]!)
  ) {
    tokens.pop();
  }
  return tokens.at(-1) ?? "";
}

type MaterializedQuestion = {
  pack: FamilyFeudPack;
  question: FamilyFeudQuestion;
};

let cachedMaterialized: Map<string, MaterializedQuestion> | null = null;

function materializedNflQuestions() {
  if (cachedMaterialized) return cachedMaterialized;

  const found = new Map<string, MaterializedQuestion>();
  for (let offset = 0; offset < 730; offset += 1) {
    const pack = buildSportsFeudPack("nfl", addDays("2026-09-23", offset));
    assertFamilyFeudPack(pack);
    for (const question of [...pack.mainBoards, ...pack.fastMoney]) {
      if (!found.has(question.id)) found.set(question.id, { pack, question });
    }
  }

  cachedMaterialized = found;
  return found;
}

function selectedQuestion(id: string) {
  const selected = materializedNflQuestions().get(id);
  if (!selected) throw new Error(`NFL Sports Feud question ${id} did not materialize in the audit window.`);
  return selected;
}

function matchedDisplayName(id: string, input: string) {
  const { pack, question } = selectedQuestion(id);
  const match = matchFamilyFeudAnswer(pack, question, input);
  expect(match.status).toBe("matched");
  if (match.status !== "matched") return null;
  return pack.entities.find((entity) => entity.id === match.entityId)?.displayName ?? null;
}

function normalizedNames(question: SportsFeudAuthoredQuestion) {
  return question.answers.map((answer) => normalizeFamilyFeudInput(answer.name));
}

function candidateEntities(pack: FamilyFeudPack, question: FamilyFeudQuestion) {
  const byId = new Map(pack.entities.map((entity) => [entity.id, entity]));
  return question.candidateIds.map((entityId) => {
    const entity = byId.get(entityId);
    if (!entity) throw new Error(`Missing NFL Sports Feud entity ${entityId}.`);
    return entity;
  });
}

function matchTerms(entity: FamilyFeudEntity) {
  const terms = [
    normalizeFamilyFeudInput(entity.displayName),
    ...(entity.aliases ?? []).map(normalizeFamilyFeudInput),
  ];
  if (entity.kind === "person") terms.push(surname(entity.displayName));
  return [...new Set(terms.filter(Boolean))];
}

describe("NFL Sports Feud authored answer quality", () => {
  it("keeps all 350 NFL prompts explicitly typed with exactly eight ranked scoring answers", () => {
    expect(NFL_SPORTS_FEUD_MAIN).toHaveLength(100);
    expect(NFL_FAST).toHaveLength(250);
    expect(NFL_ALL).toHaveLength(350);
    expect(new Set(NFL_ALL.map((question) => question.id)).size).toBe(350);

    for (const question of NFL_ALL) {
      expect(["person", "team", "school", "other"]).toContain(question.entityKind);
      expect(question.answers).toHaveLength(8);
      expect(new Set(normalizedNames(question)).size).toBe(8);
    }
  });

  it("keeps valid off-board pools curated, unique, and separate from ranked answers", () => {
    for (const question of NFL_ALL) {
      const ranked = new Set(normalizedNames(question));
      const accepted = (question.alsoAcceptedAnswers ?? []).map((answer) =>
        normalizeFamilyFeudInput(answer.name));

      expect(new Set(accepted).size).toBe(accepted.length);
      expect(accepted.every((name) => !ranked.has(name))).toBe(true);
      expect(question.answers.length + accepted.length).toBeLessThanOrEqual(25);
    }
  });

  it("materializes every NFL prompt and keeps generated packs valid across a long window", () => {
    const questions = materializedNflQuestions();
    expect(questions.size).toBe(350);
    expect([...questions.keys()].sort()).toEqual(NFL_ALL.map((question) => question.id).sort());
  });

  it("supports surnames for person entities while protecting every intentional normalized collision", () => {
    for (const { pack, question } of materializedNflQuestions().values()) {
      const termOwners = new Map<string, Set<string>>();
      for (const entity of candidateEntities(pack, question)) {
        for (const term of matchTerms(entity)) {
          if (!termOwners.has(term)) termOwners.set(term, new Set());
          termOwners.get(term)!.add(entity.id);
        }
      }

      for (const [term, owners] of termOwners) {
        const match = matchFamilyFeudAnswer(pack, question, term);
        if (owners.size === 1) {
          expect(match).toMatchObject({
            status: "matched",
            entityId: [...owners][0],
          });
        } else {
          expect(match.status).toBe("ambiguous");
          if (match.status === "ambiguous") {
            expect(new Set(match.entityIds)).toEqual(owners);
          }
        }
      }
    }
  });

  it("protects Mahomes, Brady, Rice, Rodgers, and Manning surname behavior", () => {
    expect(matchedDisplayName("nfl-main-06-1", "Mahomes")).toBe("Patrick Mahomes");
    expect(matchedDisplayName("nfl-main-06-1", "Brady")).toBe("Tom Brady");
    expect(matchedDisplayName("nfl-main-06-1", "Rodgers")).toBe("Aaron Rodgers");
    expect(matchedDisplayName("nfl-main-08-1", "Rice")).toBe("Jerry Rice");

    const { pack, question } = selectedQuestion("nfl-fast5-01-1");
    const manning = matchFamilyFeudAnswer(pack, question, "Manning");
    expect(manning.status).toBe("ambiguous");
    if (manning.status === "ambiguous") {
      const names = manning.entityIds
        .map((entityId) => pack.entities.find((entity) => entity.id === entityId)?.displayName)
        .filter(Boolean)
        .sort();
      expect(names).toEqual(["Eli Manning", "Peyton Manning"]);
    }
  });

  it("accepts natural franchise shorthand without collapsing ambiguous city names", () => {
    expect(matchedDisplayName("nfl-fast1-01-1", "Cowboys")).toBe("Dallas Cowboys");
    expect(matchedDisplayName("nfl-fast1-01-1", "Dallas")).toBe("Dallas Cowboys");
    expect(matchedDisplayName("nfl-fast1-01-1", "Packers")).toBe("Green Bay Packers");
    expect(matchedDisplayName("nfl-fast1-01-1", "Green Bay")).toBe("Green Bay Packers");
    expect(matchedDisplayName("nfl-fast1-01-1", "49ers")).toBe("San Francisco 49ers");
    expect(matchedDisplayName("nfl-fast1-01-1", "Niners")).toBe("San Francisco 49ers");
    expect(matchedDisplayName("nfl-fast1-01-1", "San Francisco")).toBe("San Francisco 49ers");

    expect(matchedDisplayName("nfl-fast1-02-1", "Chiefs")).toBe("Kansas City Chiefs");
    expect(matchedDisplayName("nfl-fast1-02-1", "KC")).toBe("Kansas City Chiefs");
    expect(matchedDisplayName("nfl-fast1-02-1", "Steelers")).toBe("Pittsburgh Steelers");
    expect(matchedDisplayName("nfl-fast1-02-1", "Pittsburgh")).toBe("Pittsburgh Steelers");
    expect(matchedDisplayName("nfl-fast1-02-1", "Patriots")).toBe("New England Patriots");
    expect(matchedDisplayName("nfl-fast1-02-1", "New England")).toBe("New England Patriots");

    const { pack, question } = selectedQuestion("nfl-fast1-01-1");
    expect(matchFamilyFeudAnswer(pack, question, "New York").status).toBe("unrecognized");
  });

  it("preserves stadium, award, Draft, defensive, and offensive quick-answer shorthand", () => {
    expect(matchedDisplayName("nfl-fast3-05-1", "Chiefs")).toBe("Arrowhead Stadium");
    expect(matchedDisplayName("nfl-fast3-05-1", "Arrowhead")).toBe("Arrowhead Stadium");
    expect(matchedDisplayName("nfl-fast3-07-1", "DPOY")).toBe("Defensive Player of the Year");
    expect(matchedDisplayName("nfl-fast3-07-1", "All-Pro")).toBe("First-team All-Pro");
    expect(matchedDisplayName("nfl-fast4-03-1", "DPI")).toBe("Pass interference");
    expect(matchedDisplayName("nfl-fast4-03-1", "Unnecessary roughness")).toBe("Personal foul");
    expect(matchedDisplayName("nfl-fast4-09-1", "BPA")).toBe("Best player available");
    expect(matchedDisplayName("nfl-fast4-07-1", "Blitz")).toBe("Blitz");
    expect(matchedDisplayName("nfl-fast4-06-1", "PA")).toBe("Play-action");
    expect(matchedDisplayName("nfl-fast4-06-1", "run pass option")).toBe("RPO");
    expect(matchedDisplayName("nfl-fast4-06-1", "four verts")).toBe("Four verticals");
    expect(matchedDisplayName("nfl-fast4-01-1", "RB")).toBe("Running back");
    expect(matchedDisplayName("nfl-fast4-02-1", "TD")).toBe("Touchdown");
    expect(matchedDisplayName("nfl-fast4-02-1", "FG")).toBe("Field goal");
    expect(matchedDisplayName("nfl-fast4-02-1", "PAT")).toBe("Extra point");
    expect(matchedDisplayName("nfl-fast4-04-1", "YPA")).toBe("Yards per attempt");
    expect(matchedDisplayName("nfl-fast4-05-1", "TFL")).toBe("Tackles for loss");
  });

  it("keeps the NFL division universe exact and Fast Money answers easy to enter", () => {
    const divisions = NFL_FAST.find((question) => question.id === "nfl-fast4-10-1");
    expect(divisions).toBeDefined();
    expect(divisions?.answers.map((answer) => answer.name)).toEqual([
      "AFC East",
      "AFC North",
      "AFC South",
      "AFC West",
      "NFC East",
      "NFC North",
      "NFC South",
      "NFC West",
    ]);
    expect(divisions?.alsoAcceptedAnswers ?? []).toEqual([]);

    for (const question of NFL_FAST) {
      const { pack, question: materialized } = selectedQuestion(question.id);
      for (const answer of materialized.answers) {
        const entity = pack.entities.find((candidate) => candidate.id === answer.entityId)!;
        expect(matchFamilyFeudAnswer(pack, materialized, entity.displayName))
          .toMatchObject({ status: "matched", entityId: entity.id });
      }
    }
  });

  it("keeps NFL Main questions 81-100 independently authored after review", () => {
    for (const familyNumber of [17, 18, 19, 20]) {
      const prefix = "nfl-main-" + String(familyNumber).padStart(2, "0") + "-";
      const rows = NFL_SPORTS_FEUD_MAIN.filter((question) => question.id.startsWith(prefix));
      expect(rows).toHaveLength(5);

      const universeSignatures = rows.map((question) =>
        [
          ...question.answers,
          ...(question.alsoAcceptedAnswers ?? []),
        ].map((answer) => normalizeFamilyFeudInput(answer.name)).join("|"),
      );
      expect(new Set(universeSignatures).size, prefix + " independent universes").toBe(5);
    }

    const casualPositions = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-17-3")!;
    expect(casualPositions.answers.map((answer) => answer.name)).toContain("Kicker");

    const scoutTraits = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-18-3")!;
    expect(scoutTraits.prompt).toContain("evaluate quickly");
    expect(scoutTraits.answers.slice(0, 3).map((answer) => answer.name)).toEqual([
      "Arm strength",
      "Accuracy",
      "Mobility",
    ]);

    const playoffDefense = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-19-5")!;
    expect(playoffDefense.answers.slice(0, 4).map((answer) => answer.name)).toEqual([
      "Pass rush",
      "Run defense",
      "Tackling",
      "Coverage",
    ]);

    const classicUniforms = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-20-4")!;
    expect(classicUniforms.answers.slice(0, 3).map((answer) => answer.name)).toEqual([
      "Green Bay Packers",
      "Las Vegas Raiders",
      "Chicago Bears",
    ]);

    const sep25Visual = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-20-2")!;
    expect(sep25Visual.prompt).toBe(
      "Name an NFL franchise with a classic visual identity that has stayed recognizable for decades.",
    );
  });

  it("keeps NFL Main questions 61-80 independently authored after review", () => {
    for (const familyNumber of [13, 14, 15, 16]) {
      const prefix = "nfl-main-" + String(familyNumber).padStart(2, "0") + "-";
      const rows = NFL_SPORTS_FEUD_MAIN.filter((question) => question.id.startsWith(prefix));
      expect(rows).toHaveLength(5);

      const universeSignatures = rows.map((question) =>
        [
          ...question.answers,
          ...(question.alsoAcceptedAnswers ?? []),
        ].map((answer) => normalizeFamilyFeudInput(answer.name)).join("|"),
      );
      expect(new Set(universeSignatures).size, prefix + " independent universes").toBe(5);
    }

    const vocabularyMoment = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-13-4")!;
    expect(vocabularyMoment.prompt).toContain("nickname");
    expect(vocabularyMoment.answers.map((answer) => answer.name)).toEqual(
      expect.arrayContaining(["Immaculate Reception", "The Catch", "Music City Miracle", "Beast Quake"]),
    );

    const historyTeam = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-14-3")!;
    expect(historyTeam.answers.map((answer) => answer.name)).toContain("Chicago Bears");
    expect(historyTeam.alsoAcceptedAnswers?.map((answer) => answer.name)).toContain("Cleveland Browns");

    const honor = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-15-3")!;
    expect(honor.answers.map((answer) => answer.name)).toContain("Pro Football Hall of Fame");
    expect(honor.answers.map((answer) => answer.name)).toContain("First-team All-Pro");

    const milestone = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-16-3")!;
    expect(milestone.prompt).toContain("statistical milestone");
    expect(milestone.answers.map((answer) => answer.name)).toEqual(
      expect.arrayContaining(["Rush for 2,000 yards", "Pass for 5,000 yards", "Record 20 sacks", "Throw 50 touchdown passes"]),
    );
  });

  it("keeps NFL Main questions 41-60 independently authored after review", () => {
    for (const familyNumber of [9, 10, 11, 12]) {
      const prefix = "nfl-main-" + String(familyNumber).padStart(2, "0") + "-";
      const rows = NFL_SPORTS_FEUD_MAIN.filter((question) => question.id.startsWith(prefix));
      expect(rows).toHaveLength(5);

      const universeSignatures = rows.map((question) =>
        [
          ...question.answers,
          ...(question.alsoAcceptedAnswers ?? []),
        ].map((answer) => normalizeFamilyFeudInput(answer.name)).join("|"),
      );
      expect(new Set(universeSignatures).size, prefix + " independent universes").toBe(5);
    }

    const highlightDefender = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-09-4")!;
    expect(highlightDefender.answers.map((answer) => answer.name)).toContain("Ed Reed");
    expect(highlightDefender.alsoAcceptedAnswers?.map((answer) => answer.name)).toContain("Troy Polamalu");

    const dynasty = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-10-3")!;
    expect(dynasty.answers.map((answer) => answer.name)).toEqual(
      expect.arrayContaining(["Bill Belichick", "Vince Lombardi", "Chuck Noll", "Bill Walsh", "Andy Reid"]),
    );

    const fanHate = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-11-3")!;
    expect(fanHate.answers.slice(0, 3).map((answer) => answer.name)).toEqual([
      "Cowboys-Eagles",
      "Steelers-Ravens",
      "Raiders-Chiefs",
    ]);

    const crowdNoise = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-12-2")!;
    expect(crowdNoise.answers[0]?.name).toBe("Arrowhead Stadium");
    expect(crowdNoise.answers.map((answer) => answer.name)).toEqual(
      expect.arrayContaining(["Lumen Field", "Superdome", "Highmark Stadium", "U.S. Bank Stadium"]),
    );
  });

  it("keeps NFL Main questions 21-40 independently authored after review", () => {
    for (const familyNumber of [5, 6, 7, 8]) {
      const prefix = "nfl-main-" + String(familyNumber).padStart(2, "0") + "-";
      const rows = NFL_SPORTS_FEUD_MAIN.filter((question) => question.id.startsWith(prefix));
      expect(rows).toHaveLength(5);

      const universeSignatures = rows.map((question) =>
        [
          ...question.answers,
          ...(question.alsoAcceptedAnswers ?? []),
        ].map((answer) => normalizeFamilyFeudInput(answer.name)).join("|"),
      );
      expect(new Set(universeSignatures).size, prefix + " independent universes").toBe(5);
    }

    const highlightQb = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-06-4")!;
    expect(highlightQb.alsoAcceptedAnswers?.map((answer) => answer.name)).toEqual(
      expect.arrayContaining(["Michael Vick", "Lamar Jackson", "Cam Newton"]),
    );

    const historyQb = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-06-5")!;
    expect(historyQb.alsoAcceptedAnswers?.map((answer) => answer.name)).toEqual(
      expect.arrayContaining(["Joe Namath", "Bart Starr"]),
    );

    const physicalBack = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-07-5")!;
    expect(physicalBack.answers[0]?.name).toBe("Derrick Henry");
    expect(physicalBack.answers.map((answer) => answer.name)).toContain("Marshawn Lynch");

    const highlightReceiver = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-08-3")!;
    expect(highlightReceiver.answers[0]?.name).toBe("Randy Moss");
    expect(highlightReceiver.answers.map((answer) => answer.name)).toContain("Odell Beckham Jr.");
  });

  it("keeps NFL Main questions 1-20 independently authored after review", () => {
    for (const familyNumber of [1, 2, 3, 4]) {
      const prefix = "nfl-main-" + String(familyNumber).padStart(2, "0") + "-";
      const rows = NFL_SPORTS_FEUD_MAIN.filter((question) => question.id.startsWith(prefix));
      expect(rows).toHaveLength(5);

      const universeSignatures = rows.map((question) =>
        [
          ...question.answers,
          ...(question.alsoAcceptedAnswers ?? []),
        ].map((answer) => normalizeFamilyFeudInput(answer.name)).join("|"),
      );
      expect(new Set(universeSignatures).size, prefix + " independent universes").toBe(5);
    }

    expect(NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-01-5")?.prompt)
      .toBe("Name an NFL franchise where becoming the starting quarterback comes with major historical expectations.");
    expect(NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-02-5")?.prompt)
      .toBe("Name an NFL franchise with more than one running back worthy of an all-time-team debate.");
    expect(NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-04-4")?.prompt)
      .toBe("Name an NFL franchise that has had elite wide receiver talent in multiple eras.");

    const groundGame = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-02-3")!;
    expect(groundGame.answers.map((answer) => answer.name)).toContain("Baltimore Ravens");

    const passCatchers = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-04-2")!;
    expect(passCatchers.answers.map((answer) => answer.name)).toContain("Kansas City Chiefs");
    expect(passCatchers.answers.map((answer) => answer.name)).toContain("New England Patriots");
  });

  it("locks the September 25 NFL slate to seven reviewed prompts", () => {
    expect(footballSportsFeudDomainForDay("2026-09-25")).toBe("nfl");

    const pack = buildSportsFeudPack("nfl", "2026-09-25");
    expect(pack.mainBoards.map((question) => question.id)).toEqual([
      "nfl-main-20-2",
      "nfl-main-07-4",
    ]);
    expect(pack.fastMoney.map((question) => question.id)).toEqual([
      "nfl-fast4-08-1",
      "nfl-fast5-07-3",
      "nfl-fast1-06-5",
      "nfl-fast2-06-2",
      "nfl-fast3-05-4",
    ]);

    const visual = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-20-2")!;
    expect(visual.prompt).toBe(
      "Name an NFL franchise with a classic visual identity that has stayed recognizable for decades.",
    );
    expect(visual.answers.map((answer) => answer.name)).toEqual([
      "Green Bay Packers",
      "Las Vegas Raiders",
      "Pittsburgh Steelers",
      "Dallas Cowboys",
      "San Francisco 49ers",
      "Chicago Bears",
      "Kansas City Chiefs",
      "Miami Dolphins",
    ]);

    const runningBack = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-07-4")!;
    expect(runningBack.answers.map((answer) => answer.name)).toEqual([
      "Barry Sanders",
      "Walter Payton",
      "Emmitt Smith",
      "Jim Brown",
      "Derrick Henry",
      "Adrian Peterson",
      "LaDainian Tomlinson",
      "Eric Dickerson",
    ]);
    expect(runningBack.alsoAcceptedAnswers?.map((answer) => answer.name)).toEqual(
      expect.arrayContaining([
        "Marshawn Lynch",
        "Christian McCaffrey",
        "Saquon Barkley",
        "Ezekiel Elliott",
        "Priest Holmes",
        "Shaun Alexander",
      ]),
    );

    const coverage = NFL_FAST.find((question) => question.id === "nfl-fast5-07-3")!;
    expect(coverage.prompt).toBe("Name an NFL cornerback famous for coverage ability.");
    expect(coverage.alsoAcceptedAnswers?.map((answer) => answer.name)).toEqual(
      expect.arrayContaining(["Patrick Surtain II", "Nnamdi Asomugha"]),
    );

    const mvp = NFL_FAST.find((question) => question.id === "nfl-fast1-06-5")!;
    expect([
      ...mvp.answers,
      ...(mvp.alsoAcceptedAnswers ?? []),
    ].map((answer) => answer.name)).toContain("Matthew Stafford");

    const siblingVisual = NFL_SPORTS_FEUD_MAIN.find((question) => question.id === "nfl-main-20-1")!;
    expect(siblingVisual.prompt).toBe("Name an NFL team with an iconic uniform or logo.");
    expect(siblingVisual.answers[1]?.name).toBe("Dallas Cowboys");
    expect(visual.answers[1]?.name).toBe("Las Vegas Raiders");
  });

  it("leaves the September 23 Football Daily routed to CFB", () => {
    expect(footballSportsFeudDomainForDay("2026-09-23")).toBe("cfb");
  });
});
