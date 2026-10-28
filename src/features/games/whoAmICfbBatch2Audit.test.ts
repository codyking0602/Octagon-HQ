import { describe, expect, it } from "vitest";
import {
  footballWhoAmIApplicableIdentityFacts,
  footballWhoAmIApplicableMetricFacts,
  footballWhoAmIMetricFactIsPlayable,
  getFootballWhoAmILaunchPool,
  getFootballWhoAmIUniverse,
} from "./footballWhoAmIAuthority";
import { CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS } from "./footballWhoAmICuration";
import { whoAmIClueFacet, whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import { WHO_AM_I_CLUE_LIMIT, whoAmIProgressiveClues } from "./whoAmIEngine";
import { whoAmISemanticClueKey, whoAmISemanticSetKey } from "./whoAmISemanticQuality";
import { whoAmIQualityCompatibleReplayTargets } from "./whoAmIRevealPlanner";

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const TRANSFER_ANCHORS: Readonly<Record<string, readonly string[]>> = {
  "cfb-jeremy-shockey": ["Northeastern Oklahoma A&M", "Miami"],
};

const PARTIAL_CAREER_METRIC_SUBJECT_IDS = [
  "cfb-ezekiel-elliott",
  "cfb-amari-cooper",
  "cfb-hunter-henry",
  "cfb-jake-butt",
] as const;

const FULL_CAREER_ANCHORS: Readonly<Record<(typeof PARTIAL_CAREER_METRIC_SUBJECT_IDS)[number], RegExp>> = {
  "cfb-ezekiel-elliott": /3,961 career rushing yards|696 yards and eight touchdowns/i,
  "cfb-amari-cooper": /228 passes for 3,463 yards and 31 touchdowns|2014 Biletnikoff Award/i,
  "cfb-hunter-henry": /116 passes for 1,661 yards and nine touchdowns/i,
  "cfb-jake-butt": /138 receptions and 1,646 receiving yards|11 touchdown passes/i,
};

describe("CFB Who Am I batch 2 calibration", () => {
  it("locks launch-order subjects 51-100 to the curated batch", () => {
    const ids = getFootballWhoAmILaunchPool("CFB").subjects.slice(50, 100).map((subject) => subject.id);
    expect(ids).toEqual(CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS);
  });

  it("keeps transfer-heavy college identities tied to their actual college stops", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    for (const [subjectId, schools] of Object.entries(TRANSFER_ANCHORS)) {
      const candidate = candidates.get(subjectId)!;
      const text = candidate.clues.map((clue) => clue.text).join(" | ");
      for (const school of schools) expect(text, `${subjectId} missing ${school}`).toContain(school);
    }
  });

  it("keeps retained factual and identity clues bound to applicable CFB source facts", () => {
    const subjects = new Map(getFootballWhoAmILaunchPool("CFB").subjects.map((subject) => [subject.id, subject]));
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    for (const subjectId of CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS) {
      const subject = subjects.get(subjectId)!;
      const candidate = candidates.get(subjectId)!;
      const identityFactIds = new Set(footballWhoAmIApplicableIdentityFacts(subject).map(({ fact }) => fact.factId));
      const metricIds = new Set(
        footballWhoAmIApplicableMetricFacts(subject)
          .filter(({ fact }) => footballWhoAmIMetricFactIsPlayable(subject, fact))
          .map(({ fact }) => fact.metricId),
      );

      for (const clue of candidate.clues.filter((entry) => entry.identityKnowledge)) {
        expect(clue.sourceFactId, `${subjectId} identity source`).toBeTruthy();
        expect(identityFactIds.has(clue.sourceFactId!), `${subjectId} foreign identity fact ${clue.sourceFactId}`).toBe(true);
      }
      for (const clue of candidate.clues.filter((entry) => entry.id.startsWith("fact:"))) {
        expect(metricIds.has(clue.id.slice("fact:".length) as never), `${subjectId} foreign metric ${clue.id}`).toBe(true);
      }
    }
  });

  it("keeps college clues free of answer leaks and NFL-stage resume leakage", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    const sameNameLeakPatterns: Readonly<Record<string, RegExp>> = {
      "cfb-marvin-harrison-jr": /\bMarvin\b|\bHarrison\b/i,
      "cfb-kellen-winslow-ii": /\bKellen\b|\bWinslow\b/i,
    };

    for (const subjectId of CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS) {
      const candidate = candidates.get(subjectId)!;
      for (const clue of candidate.clues) {
        expect(clue.text.toLowerCase(), `${subjectId} answer leak: ${clue.id}`).not.toContain(candidate.name.toLowerCase());
        const sameNameLeak = sameNameLeakPatterns[subjectId];
        if (sameNameLeak) expect(clue.text, `${subjectId} surname/name leak: ${clue.id}`).not.toMatch(sameNameLeak);
        if (!/draft|selected|pick/i.test(clue.text)) {
          expect(clue.text, `${subjectId} NFL-stage leak: ${clue.id}`).not.toMatch(
            /\bNFL\b|Super Bowl|All-Pro|Pro Bowl|NFL MVP|Defensive Player of the Year|professional football hall of fame/i,
          );
        }
      }
    }
  });

  it("keeps known biography, trivia, and off-field filler out of the curated batch", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    const forbidden: Readonly<Record<string, RegExp>> = {
      "cfb-christian-mccaffrey": /pianist|mission trip|Rwanda/i,
      "cfb-darren-sproles": /stutter|public speaking|degree|cancer/i,
      "cfb-deangelo-williams": /breast cancer|advocacy/i,
      "cfb-george-rogers": /foundation|first-generation college/i,
      "cfb-lamichael-james": /restaurant|grandmother died|lived on my own/i,
      "cfb-calvin-johnson": /two doctorates|academically intense family/i,
      "cfb-justin-blackmon": /class president|played drums/i,
      "cfb-michael-crabtree": /funded a texas tech scholarship|community efforts/i,
      "cfb-andre-johnson": /namesake foundation|charitable work/i,
      "cfb-braylon-edwards": /finish my degree|endow.*scholarship/i,
      "cfb-davante-adams": /mother.*two jobs|college costs/i,
      "cfb-dallas-clark": /family farm|returned to farming/i,
      "cfb-hunter-henry": /church youth group|food drive/i,
      "cfb-jermaine-gresham": /maintenance work|real estate|grandmother/i,
      "cfb-keith-jackson": /academic all-big eight/i,
      "cfb-alex-mack": /legal studies|magna cum laude|graduate student|studying education/i,
      "cfb-barrett-jones": /accounting|mission trip|haiti|nicaragua|academic all-america/i,
    };

    for (const [subjectId, pattern] of Object.entries(forbidden)) {
      const text = candidates.get(subjectId)!.clues.map((clue) => clue.text).join(" | ");
      expect(text, `${subjectId} biography/trivia leak`).not.toMatch(pattern);
    }
  });

  it("does not present partial source windows as full college-career totals", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));

    for (const subjectId of PARTIAL_CAREER_METRIC_SUBJECT_IDS) {
      const candidate = candidates.get(subjectId)!;
      expect(
        candidate.clues.some((clue) => /^fact:cfb-career-/.test(clue.id)),
        subjectId + " partial career metric leakage",
      ).toBe(false);
      const text = candidate.clues.map((clue) => clue.text).join(" | ");
      expect(text, subjectId + " missing verified full-career replacement anchor").toMatch(FULL_CAREER_ANCHORS[subjectId]);
    }
  });

  it("keeps retained identity copy polished after first-person redaction", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    const brokenFirstPerson = /\bme\s+(?:focused|collided|attended|led|entered|executed|hit|briefly|passed|produced|repeatedly|scored|announced|rebuilt|chose|went|pursued|scrambled|delivered|handled|could|asked|broke|also|gave|weighed|pledged|lost|wanted|committed|struck|learned|watched|lived|told|decided|caught|built|excelled|arrived|returned|rushed|played|won|became|had|was|is|underwent|pointed|created|helped|impressed|reportedly)\b|\bI\s+to\s+sit\b|\bI\s+a\b|\bI\s+died\b|\bI\s+has\b|\bme\s+and\s+my\b|\bFuture\s+and\s+I\s+quarterback\b|\bWilliam\s+myself\b|\bI\s+saw\s+me\b|\bAfter\s+(?:got|left)\b|\bWhile\s+was\b|\bWhen\s+finally\s+got\b|\bthe\s+skinny\s+me\b|\bQuarterback\s+and\s+I\s+[A-Z]/i;
    for (const subjectId of CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS) {
      const candidate = candidates.get(subjectId)!;
      for (const clue of candidate.clues) {
        expect(clue.text, `${subjectId} malformed first-person copy: ${clue.id}`).not.toMatch(brokenFirstPerson);
      }
    }
  });

  it("prints compact replay diagnostics for all 50 subjects before enforcing hard gates", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    const report = CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS.map((subjectId) => {
      const candidate = candidates.get(subjectId)!;
      const sequences = Array.from({ length: 64 }, (_value, index) => whoAmIProgressiveClues(candidate.clues, seededRandom(index + 1)));
      const first = new Set(sequences[0]!.map(whoAmISemanticClueKey));
      const surfaced = new Set(sequences.flatMap((sequence) => sequence.map(whoAmISemanticClueKey)));
      return {
        id: subjectId,
        pool: candidate.clues.length,
        surfaced: surfaced.size,
        boards: new Set(sequences.map(whoAmISemanticSetKey)).size,
        rotated: Math.max(...sequences.map((sequence) => sequence.filter((clue) => !first.has(whoAmISemanticClueKey(clue))).length)),
        minSports: Math.min(...sequences.map((sequence) => sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "sports-identity").length)),
        maxDeep: Math.max(...sequences.map((sequence) => sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography").length)),
        maxColor: Math.max(...sequences.map((sequence) => sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "identity-color").length)),
        maxRelationships: Math.max(...sequences.map((sequence) => sequence.filter((clue) => whoAmIClueFacet(clue) === "relationships").length)),
        minFinalStrong: Math.min(...sequences.map((sequence) => sequence.slice(-2).filter((clue) => clue.band === "strong" || clue.band === "giveaway").length)),
      };
    });
    console.info("CFB WHO AM I BATCH 2 PREFLIGHT", JSON.stringify(report));
  }, 150_000);

  it("keeps every batch-two pool sports-first, replayable, and free of filler", () => {
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));

    for (const subjectId of CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS) {
      const candidate = candidates.get(subjectId);
      expect(candidate, subjectId).toBeDefined();
      expect(candidate!.clues.length, `${subjectId} playable pool`).toBeGreaterThanOrEqual(12);
      expect(candidate!.clues.length, `${subjectId} playable pool`).toBeLessThanOrEqual(16);
      expect(candidate!.clues.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography"), `${subjectId} deep biography`).toHaveLength(0);
      expect(candidate!.clues.filter((clue) => whoAmIClueSelectionClass(clue) === "identity-color").length, `${subjectId} color clues`).toBeLessThanOrEqual(1);
      expect(candidate!.clues.filter((clue) => whoAmIClueFacet(clue) === "relationships").length, `${subjectId} relationship clues`).toBeLessThanOrEqual(1);
      expect(candidate!.clues.some((clue) => ["player-career-start", "player-career-end", "career-span"].includes(clue.id)), `${subjectId} useless chronology`).toBe(false);
      expect(candidate!.clues.some((clue) => (
        clue.id === "fact:cfb-career-games"
        || clue.id === "fact:cfb-career-starts"
        || clue.id === "fact:cfb-career-passing-completions"
        || clue.id === "fact:cfb-career-passing-attempts"
        || clue.id === "fact:cfb-career-rushing-attempts"
        || clue.id === "fact:cfb-career-targets"
        || clue.id === "fact:cfb-career-interceptions-thrown"
        || clue.conceptId === "identity:career-games"
        || clue.conceptId === "identity:career-starts"
        || clue.conceptId === "identity:career-games-starts"
        || clue.conceptId === "identity:career-passing-completions"
        || clue.conceptId === "identity:career-passing-attempts"
        || clue.conceptId === "identity:career-rushing-attempts"
        || clue.conceptId === "identity:career-targets"
        || clue.conceptId === "identity:career-interceptions-thrown"
      )), `${subjectId} generic volume filler`).toBe(false);

      const sequences = Array.from({ length: 64 }, (_value, index) => whoAmIProgressiveClues(candidate!.clues, seededRandom(index + 1)));
      const first = new Set(sequences[0]!.map(whoAmISemanticClueKey));
      const surfaced = new Set(sequences.flatMap((sequence) => sequence.map(whoAmISemanticClueKey)));
      const boards = new Set(sequences.map(whoAmISemanticSetKey));
      const maxRotated = Math.max(...sequences.map((sequence) => sequence.filter((clue) => !first.has(whoAmISemanticClueKey(clue))).length));

      for (const sequence of sequences) {
        expect(sequence, `${subjectId} clue count`).toHaveLength(WHO_AM_I_CLUE_LIMIT);
        expect(sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "sports-identity").length, `${subjectId} sports identity`).toBeGreaterThanOrEqual(9);
        expect(sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography"), `${subjectId} deep biography in run`).toHaveLength(0);
        expect(sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "identity-color").length, `${subjectId} color in run`).toBeLessThanOrEqual(1);
        expect(sequence.filter((clue) => whoAmIClueFacet(clue) === "relationships").length, `${subjectId} relationship slots`).toBeLessThanOrEqual(1);
        expect(sequence.slice(-2).every((clue) => clue.band === "strong" || clue.band === "giveaway"), `${subjectId} strongest finish`).toBe(true);
      }

      const semanticTargets = whoAmIQualityCompatibleReplayTargets(candidate!.clues, sequences);
      expect(surfaced.size, `${subjectId} surfaced replay depth`).toBeGreaterThanOrEqual(semanticTargets.surfaced);
      expect(maxRotated, `${subjectId} rotating slots`).toBeGreaterThanOrEqual(semanticTargets.rotated);
      expect(boards.size, `${subjectId} distinct boards`).toBeGreaterThanOrEqual(semanticTargets.boards);
    }
  }, 150_000);
});
