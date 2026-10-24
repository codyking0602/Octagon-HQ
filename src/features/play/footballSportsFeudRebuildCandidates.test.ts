import { describe, expect, it } from "vitest";
import {
  CFB_FEUD_REBUILD_CANDIDATES, NFL_FEUD_REBUILD_CANDIDATES,
} from "./footballSportsFeudRebuildCandidates";
import {
  previewFootballFeudRebuildRotation, FOOTBALL_FEUD_REBUILD_VALIDATED_APPEARANCES_PER_SPORT,
} from "./footballSportsFeudRebuildRotation";
import { matchFamilyFeudAnswer, normalizeFamilyFeudInput } from "../games/familyFeudEngine";
import type { FamilyFeudPack, FamilyFeudQuestion } from "../games/familyFeudEngine";
import type { SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";

const BANKS = { nfl: NFL_FEUD_REBUILD_CANDIDATES, cfb: CFB_FEUD_REBUILD_CANDIDATES };
const normalize = normalizeFamilyFeudInput;
const lane = (q: SportsFeudAuthoredQuestion) => q.collisionGroup ?? q.category;

function matching(q: SportsFeudAuthoredQuestion, input: string) {
  const answers = [...q.answers, ...(q.alsoAcceptedAnswers ?? [])];
  const entities = answers.map((a, index) => ({
    id: q.id + ":accept:" + index,
    kind: q.entityKind, displayName: a.name, aliases: [...(a.aliases ?? [])],
  }));
  const question: FamilyFeudQuestion = {
    id: q.id, prompt: q.prompt,
    candidateIds: entities.map(e => e.id),
    answers: entities.slice(0, 8).map((e, index) => ({ entityId: e.id, points: 8 - index })),
    alsoAcceptedEntityIds: entities.slice(8).map(e => e.id),
  };
  const pack: FamilyFeudPack = { id: q.id, sport: "football", entities, mainBoards: [], fastMoney: [] };
  return matchFamilyFeudAnswer(pack, question, input);
}

describe("future-only Football Sports Feud editorial rebuild", () => {
  it("counts distinct ideas, never paraphrase families", () => {
    expect(NFL_FEUD_REBUILD_CANDIDATES.main).toHaveLength(34);
    expect(NFL_FEUD_REBUILD_CANDIDATES.fast).toHaveLength(85);
    expect(CFB_FEUD_REBUILD_CANDIDATES.main).toHaveLength(34);
    expect(CFB_FEUD_REBUILD_CANDIDATES.fast).toHaveLength(86);
    for (const bank of Object.values(BANKS)) {
      const all = [...bank.main, ...bank.fast];
      expect(new Set(all.map(q => q.id)).size).toBe(all.length);
      expect(new Set(all.map(q => normalize(q.prompt))).size).toBe(all.length);
      for (const q of all) {
        expect(q.answers, q.id).toHaveLength(8);
        const allNames = [...q.answers, ...(q.alsoAcceptedAnswers ?? [])].map(a => normalize(a.name));
        expect(new Set(allNames).size, q.id).toBe(allNames.length);
      }
    }
  });

  it("keeps distinct semantic lanes across the newly authored set", () => {
    for (const bank of Object.values(BANKS)) {
      const newRows = [...bank.main, ...bank.fast].filter(q => q.id.includes("-feud-r2-"));
      expect(new Set(newRows.map(lane)).size).toBe(newRows.length);
      expect(newRows.every(q => (q.alsoAcceptedAnswers?.length ?? 0) >= 3)).toBe(true);
    }
  });

  it("recognizes all explicit candidate names on all newly authored boards", () => {
    for (const bank of Object.values(BANKS)) {
      for (const q of [...bank.main, ...bank.fast].filter(row => row.id.includes("-feud-r2-"))) {
        for (const answer of [...q.answers, ...(q.alsoAcceptedAnswers ?? [])]) {
          const hit = matching(q, answer.name);
          expect(hit.status, q.id + " / " + answer.name).toBe("matched");
        }
      }
    }
  });

  it("accepts non-ranked legitimate answers and common aliases", () => {
    const find = (id: string) => [...BANKS.nfl.main, ...BANKS.nfl.fast,
      ...BANKS.cfb.main, ...BANKS.cfb.fast].find(q => q.id.endsWith(id))!;
    expect(matching(find("first-pick-quarterbacks"), "Cam Ward").status).toBe("matched");
    expect(matching(find("route-tree"), "Fly route").status).toBe("matched");
    expect(matching(find("fcs-to-nfl"), "Randy Moss").status).toBe("matched");
    expect(matching(find("cfb-2024-realignment"), "SMU").status).toBe("matched");
    expect(matching(find("first-12team-playoff"), "Indiana").status).toBe("matched");
  });


  it("rejects nonqualifying career milestones and outdated Hall of Fame entries", () => {
    const all = [...BANKS.nfl.main, ...BANKS.nfl.fast];
    const question = (id: string) => all.find(q => q.id.endsWith(id))!;
    // Romo finished with 34,183 passing yards (below the 40,000-yard floor).
    expect(matching(question("qbs-40000-passing"), "Tony Romo").status).not.toBe("matched");
    expect(matching(question("qbs-40000-passing"), "Russell Wilson").status).toBe("matched");
    // Adams was at 12,633 receiving yards after 2025, short of 13,000.
    expect(matching(question("career-15k-receiving"), "Davante Adams").status).not.toBe("matched");
    // Nalen was not in the Hall of Fame by the question's 2025 cutoff.
    expect(matching(question("nfl-hof-centers"), "Tom Nalen").status).not.toBe("matched");
    expect(matching(question("nfl-hof-centers"), "Bulldog Turner").status).toBe("matched");
    expect(matching(question("qbs-40000-passing"), "Johnny Unitas").status).toBe("matched");
    expect(matching(question("qbs-40td-season"), "Baker Mayfield").status).toBe("matched");
    expect(matching(question("qbs-40td-season"), "Lamar Jackson").status).toBe("matched");
    expect(matching(question("career-15k-receiving"), "Mike Evans").status).toBe("matched");
    expect(matching(question("nfl-rookie-dpoy"), "Carson Schwesinger").status).toBe("matched");

  });

  it("rehearses 34 total appearances with no repeat of an ID or semantic lane", () => {
    expect(FOOTBALL_FEUD_REBUILD_VALIDATED_APPEARANCES_PER_SPORT).toBe(17);
    for (const sport of ["nfl", "cfb"] as const) {
      const slots = previewFootballFeudRebuildRotation(sport);
      expect(slots).toHaveLength(17);
      const all = slots.flatMap(slot => [...slot.main, ...slot.fast]);
      expect(all).toHaveLength(119);
      expect(new Set(all.map(q => q.id)).size).toBe(119);
      expect(slots.every(slot => slot.main.length === 2 && slot.fast.length === 5)).toBe(true);
      for (const slot of slots) {
        const lanes = [...slot.main, ...slot.fast].map(lane);
        expect(new Set(lanes).size, sport).toBe(7);
      }
    }
    expect(() => previewFootballFeudRebuildRotation("cfb", 20)).toThrow();
    expect(() => previewFootballFeudRebuildRotation("nfl", 20)).toThrow();
  });
});
