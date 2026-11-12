import { describe, expect, it } from "vitest";
import { matchFamilyFeudAnswer, type FamilyFeudPack } from "../games/familyFeudEngine";
import {
  advanceFamilyFeudDailyCore,
  buildFamilyFeudDailySetup,
  hydrateUfcFeudFairAnswers,
} from "./familyFeudDailyCore";
import { buildUfcFeudV2DailyPack } from "./sportsFeudDailyBanks";

const day = "2026-11-12";
const schedule = "ufc-daily-v22-higher-lower-oct29";
const stoppageId = "ufc-v2-fast13-close-stoppage-debate";
const soundId = "ufc-v2-fast-fight-sounds";

function question(pack: FamilyFeudPack, id: string) {
  const found = pack.fastMoney.find((row) => row.id === id);
  if (!found) throw new Error("Missing UFC Feud question: " + id);
  return found;
}

function beforeFairAnswerFix(): FamilyFeudPack {
  const published = buildUfcFeudV2DailyPack(day);
  const sound = question(published, soundId);
  const kickId = sound.candidateIds.find((id) =>
    published.entities.some((row) => row.id === id && row.displayName === "Kick landing"));
  if (!kickId) throw new Error("Future UFC Feud sound catalog lost its curated kick answer");

  // Reconstruct the exact missing identities/aliases from the Nov 12
  // published answer universe; keep the eight official ranked slots intact.
  return {
    ...published,
    entities: published.entities.filter((row) => row.id !== kickId).map((row) =>
      row.id === stoppageId + ":a3"
        ? { ...row, aliases: (row.aliases ?? []).filter((alias) =>
            !["Got Up Quick", "Got Back Up", "Stood Up Quickly",
              "Back On Their Feet", "Got Up Immediately"].includes(alias)) }
        : { ...row }),
    fastMoney: published.fastMoney.map((row) => row.id === soundId
      ? {
          ...row,
          candidateIds: row.candidateIds.filter((id) => id !== kickId),
          alsoAcceptedEntityIds: (row.alsoAcceptedEntityIds ?? []).filter((id) => id !== kickId),
        }
      : row),
  };
}

describe("November 12 UFC Sports Feud fair Fast Money grading", () => {
  it("updates the future authored catalogs with two distinct, scoped concepts", () => {
    const pack = buildUfcFeudV2DailyPack(day);
    const stoppage = question(pack, stoppageId);
    const sounds = question(pack, soundId);
    const match = matchFamilyFeudAnswer(pack, stoppage, "Got Up Quick");
    expect(match).toMatchObject({ status: "matched", entityId: stoppageId + ":a3" });
    if (match.status === "matched") {
      expect(stoppage.answers.find((answer) => answer.entityId === match.entityId)?.points).toBe(6);
    }
    const kick = matchFamilyFeudAnswer(pack, sounds, "Kick");
    expect(kick.status).toBe("matched");
    if (kick.status === "matched") {
      expect(sounds.answers.some((row) => row.entityId === kick.entityId)).toBe(false);
      expect(sounds.alsoAcceptedEntityIds).toContain(kick.entityId);
    }
  });

  it("replays Cody's actual completed answers against the immutable published pack at 86", () => {
    const historical = beforeFairAnswerFix();
    expect(historical.mainBoards.map((row) => row.id)).toEqual([
      "ufc-v2-main9-title-fight-wins", "ufc-v2-main-interim-title-holders",
    ]);
    expect(historical.fastMoney.map((row) => row.id)).toEqual([
      "ufc-v2-fast8-hurt-survival", stoppageId, soundId,
      "ufc-v2-fast5-other-promotions", "ufc-v2-fast3-fan-acronyms",
    ]);
    expect(matchFamilyFeudAnswer(historical, question(historical, stoppageId), "Got Up Quick").status)
      .toBe("unrecognized");
    expect(matchFamilyFeudAnswer(historical, question(historical, soundId), "Kick").status)
      .toBe("unrecognized");

    const frozen = structuredClone(historical);
    const hydrated = hydrateUfcFeudFairAnswers(historical);
    const correctedStoppage = matchFamilyFeudAnswer(hydrated, question(hydrated, stoppageId), "Got Up Quick");
    expect(correctedStoppage).toMatchObject({ status: "matched", entityId: stoppageId + ":a3" });
    const correctedKick = matchFamilyFeudAnswer(hydrated, question(hydrated, soundId), "Kick");
    expect(correctedKick.status).toBe("matched");
    expect(hydrateUfcFeudFairAnswers(hydrated)).toEqual(hydrated);
    expect(historical).toEqual(frozen);
    expect(hydrated.fastMoney.map((q) => q.answers)).toEqual(historical.fastMoney.map((q) => q.answers));

    const published = buildFamilyFeudDailySetup(historical, day, schedule);
    const frozenEvidence = structuredClone(published.privateSetupEvidence);
    let submissionState: Record<string, unknown> = {};
    let last: ReturnType<typeof advanceFamilyFeudDailyCore> | null = null;
    const submissions = [
      "Jon Jones", "Georges St-pierre", "Demetrius Johnson", "Anderson Silva",
      "Dustin Poirier", "Charles Oliveira", "Tony Ferguson", "Ciryl Gane", "Conor Mcgregor",
      "Clinch", "Got Up Quick", "Kick", "Strikeforce", "Ko",
    ];
    for (const answer of submissions) {
      last = advanceFamilyFeudDailyCore({
        setupKey: published.setupKey,
        publicSetup: published.publicSetup,
        privateSetupEvidence: published.privateSetupEvidence,
        submissionState,
      }, { type: "answer", answer });
      submissionState = last.submissionState;
    }
    expect(last?.complete).toBe(true);
    expect(last?.finalSubmission).toMatchObject({
      main_points: 57, fast_money_points: 29, native_score: 86, normalized_score: 86,
    });
    const fast = last!.publicState.fast_money as {
      results: { points: number; counted: boolean; board_rank: number | null }[];
    };
    expect(fast.results.map((row) => row.points)).toEqual([8, 6, 1, 6, 8]);
    expect(fast.results[1]).toMatchObject({ counted: true, board_rank: 3 });
    expect(fast.results[2]).toMatchObject({ counted: true, board_rank: null });
    expect(published.privateSetupEvidence).toEqual(frozenEvidence);
  });

  it("does not touch unrelated sports or older UFC packs", () => {
    const other: FamilyFeudPack = {
      id: "other", sport: "football", entities: [], mainBoards: [], fastMoney: [],
    };
    const older: FamilyFeudPack = { ...other, sport: "ufc" };
    expect(hydrateUfcFeudFairAnswers(other)).toBe(other);
    expect(hydrateUfcFeudFairAnswers(older)).toBe(older);
  });
});
