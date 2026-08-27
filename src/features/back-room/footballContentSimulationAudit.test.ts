import { describe, expect, it } from "vitest";
import type { PlayLineupHistory } from "../play/lineupModel";
import {
  buildFootballBlindRankBoard,
  buildFootballKeepCutBoard,
  footballComparisonTier,
} from "./footballComparisonGeneration";
import {
  FOOTBALL_BLIND_RESUME_ROUNDS,
  buildFootballBlindResumeRounds,
  footballBlindResumeMatchups,
  footballBlindResumeSubjectIdentityId,
} from "./footballBlindResumeModel";
import {
  FOOTBALL_FIND_LEADER_FAMILY_CYCLE,
  createFootballFindLeaderBoard,
  footballFindLeaderCompetitionAudit,
  footballFindLeaderQuestions,
} from "./footballFindLeaderModel";
import {
  FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE,
  createFootballHitTheNumberPlan,
  footballHitTheNumberPlanQuality,
  footballHitTheNumberSubjects,
} from "./footballHitTheNumberModel";
import { footballRankFivePacks } from "./footballRankFiveModel";
import {
  createFootballWavelengthRound,
  footballWavelengthClues,
  nextFootballWavelengthClue,
  type FootballWavelengthRound,
} from "./footballWavelengthModel";

const COMPARISON_RUNS_PER_PACK = 384;
const BLIND_RESUME_RUNS = 1_200;
const WAVELENGTH_RUNS = 2_000;
const HIT_THE_NUMBER_RUNS = 1_000;
const FIND_LEADER_RUNS = 1_600;

function share(value: number, total: number) {
  return total === 0 ? 0 : value / total;
}

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function maxValue(map: ReadonlyMap<string, number>) {
  return Math.max(0, ...map.values());
}

function clampGuess(value: number) {
  return Math.max(1, Math.min(100, value));
}

function exposureFloor(boardSize: number, poolSize: number) {
  const unavoidableAverageExposure = boardSize / poolSize;
  return Math.min(0.92, Math.max(0.45, unavoidableAverageExposure * 1.8));
}

function expectTierAwareExposure(
  pack: (typeof footballRankFivePacks)[number],
  appearances: ReadonlyMap<string, number>,
  boardSize: number,
  label: string,
) {
  const globalFloor = exposureFloor(boardSize, pack.items.length);
  const tiers = new Set(pack.items.map(footballComparisonTier));

  for (const tier of tiers) {
    const tierItems = pack.items.filter((item) => footballComparisonTier(item) === tier);
    if (tierItems.length < 2) continue;
    const tierAppearances = tierItems.reduce((sum, item) => sum + (appearances.get(item.id) ?? 0), 0);
    const averageTierExposure = share(tierAppearances, COMPARISON_RUNS_PER_PACK * tierItems.length);
    const tierCeiling = Math.min(0.92, Math.max(globalFloor, averageTierExposure * 1.5 + 0.05));

    for (const item of tierItems) {
      expect(
        share(appearances.get(item.id) ?? 0, COMPARISON_RUNS_PER_PACK),
        `${pack.id} ${label} ${tier} exposure: ${item.id}`,
      ).toBeLessThan(tierCeiling);
    }
  }
}

function relativeThirdIds(
  items: readonly { id: string; rating: number }[],
  section: "high" | "middle" | "low",
) {
  const ordered = [...items].sort((left, right) => right.rating - left.rating || left.id.localeCompare(right.id));
  const third = Math.ceil(ordered.length / 3);
  if (section === "high") return new Set(ordered.slice(0, third).map((item) => item.id));
  if (section === "low") return new Set(ordered.slice(-third).map((item) => item.id));
  return new Set(ordered.slice(third, Math.max(third, ordered.length - third)).map((item) => item.id));
}

function emptyHistory(recentItemIds: string[] = []): PlayLineupHistory {
  return { entries: [], recentItemIds, recentFighterIds: [], lastLineup: [] };
}

describe("Football PR10 content simulation / replay audit", () => {
  it("proves Blind Rank and Keep/Cut keep broad coverage, relative pool texture, board uniqueness, and hard cutoffs at scale", () => {
    const rankSignatures = new Set<string>();
    const keepCutSignatures = new Set<string>();
    const rankTierAppearances = new Map<string, number>();
    const keepCutTierAppearances = new Map<string, number>();
    let rankTotalItems = 0;
    let keepCutTotalItems = 0;
    let rankLowBoards = 0;
    let rankMultipleLowBoards = 0;
    let rankHighLowBoards = 0;
    let keepCutTightBoards = 0;
    let keepCutGapTotal = 0;
    let totalBoards = 0;

    for (const pack of footballRankFivePacks) {
      const rankSeen = new Set<string>();
      const keepCutSeen = new Set<string>();
      const rankAppearances = new Map<string, number>();
      const keepCutAppearances = new Map<string, number>();
      const highIds = relativeThirdIds(pack.items, "high");
      const lowIds = relativeThirdIds(pack.items, "low");

      for (let index = 0; index < COMPARISON_RUNS_PER_PACK; index += 1) {
        const rank = buildFootballBlindRankBoard(pack.items, pack.id, `pr10-rank-${pack.id}-${index}`);
        const keepCut = buildFootballKeepCutBoard(pack.items, pack.id, `pr10-keep-${pack.id}-${index}`);
        const rankIds = rank.items.map((item) => item.id);
        const keepCutIds = keepCut.items.map((item) => item.id);
        const rankLowCount = rankIds.filter((id) => lowIds.has(id)).length;
        const rankHighCount = rankIds.filter((id) => highIds.has(id)).length;

        totalBoards += 1;
        rankSignatures.add(`${pack.id}:${[...rankIds].sort().join("|")}`);
        keepCutSignatures.add(`${pack.id}:${[...keepCutIds].sort().join("|")}`);
        expect(new Set(rankIds).size).toBe(5);
        expect(new Set(keepCutIds).size).toBe(8);
        expect(rank.badItems).toBeLessThanOrEqual(1);
        expect(keepCut.badItems).toBeLessThanOrEqual(2);
        expect(keepCut.cutoffGap).toBeLessThanOrEqual(8);
        if (rankLowCount >= 1) rankLowBoards += 1;
        if (rankLowCount >= 2) rankMultipleLowBoards += 1;
        if (rankLowCount >= 1 && rankHighCount >= 1) rankHighLowBoards += 1;
        if (keepCut.cutoffGap <= 4) keepCutTightBoards += 1;
        keepCutGapTotal += keepCut.cutoffGap;

        for (const item of rank.items) {
          rankSeen.add(item.id);
          increment(rankAppearances, item.id);
          increment(rankTierAppearances, footballComparisonTier(item));
          rankTotalItems += 1;
        }
        for (const item of keepCut.items) {
          keepCutSeen.add(item.id);
          increment(keepCutAppearances, item.id);
          increment(keepCutTierAppearances, footballComparisonTier(item));
          keepCutTotalItems += 1;
        }
      }

      expect(share(rankSeen.size, pack.items.length), `${pack.id} Blind Rank pool coverage`).toBeGreaterThanOrEqual(0.8);
      expect(share(keepCutSeen.size, pack.items.length), `${pack.id} Keep/Cut pool coverage`).toBeGreaterThanOrEqual(0.8);
      expectTierAwareExposure(pack, rankAppearances, 5, "Blind Rank");
      expectTierAwareExposure(pack, keepCutAppearances, 8, "Keep/Cut");
    }

    const rankAbsoluteLowShare = share(
      (rankTierAppearances.get("below-average") ?? 0) + (rankTierAppearances.get("bad") ?? 0),
      rankTotalItems,
    );
    const rankAbsoluteMiddleShare = share(
      (rankTierAppearances.get("good") ?? 0) + (rankTierAppearances.get("average") ?? 0),
      rankTotalItems,
    );
    const keepCutAbsoluteLowShare = share(
      (keepCutTierAppearances.get("below-average") ?? 0) + (keepCutTierAppearances.get("bad") ?? 0),
      keepCutTotalItems,
    );
    const keepCutAbsoluteMiddleShare = share(
      (keepCutTierAppearances.get("good") ?? 0) + (keepCutTierAppearances.get("average") ?? 0),
      keepCutTotalItems,
    );

    expect(rankSignatures.size).toBeGreaterThan(totalBoards * 0.94);
    expect(keepCutSignatures.size).toBeGreaterThan(totalBoards * 0.9);
    expect(share(rankLowBoards, totalBoards)).toBeGreaterThanOrEqual(0.62);
    expect(share(rankMultipleLowBoards, totalBoards)).toBeGreaterThanOrEqual(0.32);
    expect(share(rankHighLowBoards, totalBoards)).toBeGreaterThanOrEqual(0.55);
    expect(share(keepCutTightBoards, totalBoards)).toBeGreaterThanOrEqual(0.8);
    expect(keepCutGapTotal / totalBoards).toBeLessThanOrEqual(4.2);

    console.info("PR10 comparison audit", JSON.stringify({
      packs: footballRankFivePacks.length,
      boardsPerGame: totalBoards,
      blindRankUniqueBoardShare: share(rankSignatures.size, totalBoards),
      blindRankRelativeLowBoardShare: share(rankLowBoards, totalBoards),
      blindRankMultiLowBoardShare: share(rankMultipleLowBoards, totalBoards),
      blindRankHighLowContrastShare: share(rankHighLowBoards, totalBoards),
      blindRankAbsoluteLowTierAppearanceShare: rankAbsoluteLowShare,
      blindRankAbsoluteMiddleTierAppearanceShare: rankAbsoluteMiddleShare,
      keepCutUniqueBoardShare: share(keepCutSignatures.size, totalBoards),
      keepCutAbsoluteLowTierAppearanceShare: keepCutAbsoluteLowShare,
      keepCutAbsoluteMiddleTierAppearanceShare: keepCutAbsoluteMiddleShare,
      keepCutTightCutoffShare: share(keepCutTightBoards, totalBoards),
      keepCutAverageCutoffGap: keepCutGapTotal / totalBoards,
    }));
  });

  it("proves Blind Resume consumes a small fraction per run and avoids catalog, category, and real-subject overexposure", () => {
    const matchupCounts = new Map<string, number>();
    const subjectCounts = new Map<string, number>();
    const packCounts = new Map<string, number>();
    const signatures = new Set<string>();
    let consecutiveExactRepeats = 0;
    let previousSignature = "";

    for (let index = 0; index < BLIND_RESUME_RUNS; index += 1) {
      const rounds = buildFootballBlindResumeRounds(`pr10-blind-resume-${index}`);
      expect(rounds).toHaveLength(FOOTBALL_BLIND_RESUME_ROUNDS);
      expect(new Set(rounds.map((round) => round.id)).size).toBe(FOOTBALL_BLIND_RESUME_ROUNDS);
      expect(new Set(rounds.map((round) => round.packId)).size).toBe(FOOTBALL_BLIND_RESUME_ROUNDS);

      const identities = rounds.flatMap((round) => [
        footballBlindResumeSubjectIdentityId(round.leftId),
        footballBlindResumeSubjectIdentityId(round.rightId),
      ]);
      expect(new Set(identities).size).toBe(FOOTBALL_BLIND_RESUME_ROUNDS * 2);
      expect(rounds.filter((round) => round.league === "NFL").length).toBeGreaterThanOrEqual(2);
      expect(rounds.filter((round) => round.league === "CFB").length).toBeGreaterThanOrEqual(2);

      const signature = [...rounds.map((round) => round.id)].sort().join("|");
      signatures.add(signature);
      if (signature === previousSignature) consecutiveExactRepeats += 1;
      previousSignature = signature;

      for (const round of rounds) {
        increment(matchupCounts, round.id);
        increment(packCounts, round.packId);
        increment(subjectCounts, footballBlindResumeSubjectIdentityId(round.leftId));
        increment(subjectCounts, footballBlindResumeSubjectIdentityId(round.rightId));
      }
    }

    const totalRounds = BLIND_RESUME_RUNS * FOOTBALL_BLIND_RESUME_ROUNDS;
    const matchupAverage = totalRounds / footballBlindResumeMatchups.length;
    const subjectAverage = (totalRounds * 2) / subjectCounts.size;

    expect(share(matchupCounts.size, footballBlindResumeMatchups.length)).toBeGreaterThanOrEqual(0.95);
    expect(share(signatures.size, BLIND_RESUME_RUNS)).toBeGreaterThanOrEqual(0.98);
    expect(consecutiveExactRepeats).toBe(0);
    expect(packCounts.size).toBeGreaterThanOrEqual(13);
    expect(maxValue(matchupCounts)).toBeLessThanOrEqual(matchupAverage * 2);
    expect(maxValue(subjectCounts)).toBeLessThanOrEqual(subjectAverage * 3.25);
    expect(FOOTBALL_BLIND_RESUME_ROUNDS / footballBlindResumeMatchups.length).toBeLessThanOrEqual(0.065);

    console.info("PR10 Blind Resume audit", JSON.stringify({
      catalogSize: footballBlindResumeMatchups.length,
      roundsPerRun: FOOTBALL_BLIND_RESUME_ROUNDS,
      catalogConsumptionPerRun: FOOTBALL_BLIND_RESUME_ROUNDS / footballBlindResumeMatchups.length,
      matchupCoverage: share(matchupCounts.size, footballBlindResumeMatchups.length),
      uniqueRunShare: share(signatures.size, BLIND_RESUME_RUNS),
      maxMatchupVsAverage: maxValue(matchupCounts) / matchupAverage,
      maxSubjectVsAverage: maxValue(subjectCounts) / subjectAverage,
      categoryCountSeen: packCounts.size,
    }));
  });

  it("proves Wavelength uses the full calibrated range with broad clue/category exposure and no in-round repeats", () => {
    const targetCounts = new Map<string, number>();
    const clueCounts = new Map<string, number>();
    const categoryCounts = new Map<string, number>();
    let lowTargets = 0;
    let middleTargets = 0;
    let highTargets = 0;
    let consecutiveTargetRepeats = 0;
    let consecutiveOpeningCategoryRepeats = 0;
    let previousTarget: number | null = null;
    let previousOpeningCategory = "";

    for (let index = 0; index < WAVELENGTH_RUNS; index += 1) {
      const seed = `pr10-wavelength-${index}`;
      let round = createFootballWavelengthRound(seed);
      const guesses = [
        clampGuess(round.target - 18),
        clampGuess(round.target + 18),
        clampGuess(round.target - 7),
      ];

      for (let clueIndex = 1; clueIndex <= 3; clueIndex += 1) {
        const guess = guesses[clueIndex - 1]!;
        const clue = nextFootballWavelengthClue(round, guess, clueIndex, seed, guesses.slice(0, clueIndex - 1));
        if (guess < round.target) expect(clue.rating).toBeGreaterThan(round.target);
        if (guess > round.target) expect(clue.rating).toBeLessThan(round.target);
        round = { ...round, clues: [...round.clues, clue] } satisfies FootballWavelengthRound;
      }

      expect(round.clues).toHaveLength(4);
      expect(new Set(round.clues.map((clue) => clue.id)).size).toBe(4);
      expect(new Set(round.clues.map((clue) => clue.category)).size).toBe(4);
      increment(targetCounts, String(round.target));
      if (round.target <= 39) lowTargets += 1;
      else if (round.target <= 69) middleTargets += 1;
      else highTargets += 1;

      const openingCategory = round.clues[0]!.category;
      if (previousTarget === round.target) consecutiveTargetRepeats += 1;
      if (previousOpeningCategory === openingCategory) consecutiveOpeningCategoryRepeats += 1;
      previousTarget = round.target;
      previousOpeningCategory = openingCategory;

      for (const clue of round.clues) {
        increment(clueCounts, clue.id);
        increment(categoryCounts, clue.category);
      }
    }

    const totalClues = WAVELENGTH_RUNS * 4;
    expect(targetCounts.size).toBeGreaterThanOrEqual(74);
    expect(clueCounts.size).toBeGreaterThanOrEqual(160);
    expect(categoryCounts.size).toBe(27);
    expect(share(lowTargets, WAVELENGTH_RUNS)).toBeGreaterThanOrEqual(0.2);
    expect(share(middleTargets, WAVELENGTH_RUNS)).toBeGreaterThanOrEqual(0.3);
    expect(share(highTargets, WAVELENGTH_RUNS)).toBeGreaterThanOrEqual(0.25);
    expect(share(maxValue(categoryCounts), totalClues)).toBeLessThan(0.15);
    expect(share(consecutiveTargetRepeats, WAVELENGTH_RUNS - 1)).toBeLessThan(0.06);
    expect(share(consecutiveOpeningCategoryRepeats, WAVELENGTH_RUNS - 1)).toBeLessThan(0.15);

    console.info("PR10 Wavelength audit", JSON.stringify({
      catalogSize: footballWavelengthClues.length,
      categoriesSeen: categoryCounts.size,
      cluesSeen: clueCounts.size,
      targetsSeen: targetCounts.size,
      lowTargetShare: share(lowTargets, WAVELENGTH_RUNS),
      middleTargetShare: share(middleTargets, WAVELENGTH_RUNS),
      highTargetShare: share(highTargets, WAVELENGTH_RUNS),
      maxCategoryAppearanceShare: share(maxValue(categoryCounts), totalClues),
      consecutiveTargetRepeatShare: share(consecutiveTargetRepeats, WAVELENGTH_RUNS - 1),
      consecutiveOpeningCategoryRepeatShare: share(consecutiveOpeningCategoryRepeats, WAVELENGTH_RUNS - 1),
    }));
  });

  it("proves Hit the Number preserves format/domain balance, broad subject coverage, and quality-gated outcomes", () => {
    const formatCounts = new Map<string, number>();
    const domainCounts = new Map<string, number>();
    const pairCounts = new Map<string, number>();
    const subjectCounts = new Map<string, number>();
    const signatures = new Set<string>();
    let legalSelectionTotal = 0;
    let consecutiveExactRepeats = 0;
    let previousSignature = "";

    for (let index = 0; index < HIT_THE_NUMBER_RUNS; index += 1) {
      const plan = createFootballHitTheNumberPlan(`pr10-hit-number-${index}`);
      const quality = footballHitTheNumberPlanQuality(plan);
      expect(quality.passes).toBe(true);
      expect(quality.hasGoodUnder).toBe(true);
      expect(quality.hasMiddlingOutcome).toBe(true);
      expect(quality.hasMeaningfulBust).toBe(true);
      expect(quality.legalSelectionCount).toBeGreaterThanOrEqual(6);
      legalSelectionTotal += quality.legalSelectionCount;

      increment(formatCounts, plan.formatId);
      increment(domainCounts, plan.domainId);
      increment(pairCounts, `${plan.domainId}:${plan.formatId}`);
      for (const subjectId of plan.subjectIds) increment(subjectCounts, subjectId);

      const signature = `${plan.domainId}:${plan.formatId}:${plan.target}:${[...plan.subjectIds].sort().join("|")}`;
      signatures.add(signature);
      if (signature === previousSignature) consecutiveExactRepeats += 1;
      previousSignature = signature;
    }

    expect(formatCounts.size).toBe(FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE.length);
    expect(domainCounts.size).toBe(3);
    expect(pairCounts.size).toBe(12);
    expect(share(subjectCounts.size, footballHitTheNumberSubjects.length)).toBeGreaterThanOrEqual(0.85);
    expect(consecutiveExactRepeats).toBe(0);
    expect(share(signatures.size, HIT_THE_NUMBER_RUNS)).toBeGreaterThanOrEqual(0.85);

    for (const row of FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE) {
      const actual = share(formatCounts.get(row.value) ?? 0, HIT_THE_NUMBER_RUNS);
      expect(actual, row.value).toBeGreaterThanOrEqual(row.weight / 100 - 0.07);
      expect(actual, row.value).toBeLessThanOrEqual(row.weight / 100 + 0.07);
    }
    for (const count of domainCounts.values()) {
      expect(share(count, HIT_THE_NUMBER_RUNS)).toBeGreaterThanOrEqual(0.25);
      expect(share(count, HIT_THE_NUMBER_RUNS)).toBeLessThanOrEqual(0.42);
    }

    console.info("PR10 Hit the Number audit", JSON.stringify({
      subjectsSeen: subjectCounts.size,
      subjectCatalogSize: footballHitTheNumberSubjects.length,
      domainsSeen: domainCounts.size,
      formatDomainPairsSeen: pairCounts.size,
      uniquePlanShare: share(signatures.size, HIT_THE_NUMBER_RUNS),
      averageLegalSelections: legalSelectionTotal / HIT_THE_NUMBER_RUNS,
      formatShares: Object.fromEntries([...formatCounts].map(([key, value]) => [key, share(value, HIT_THE_NUMBER_RUNS)])),
      domainShares: Object.fromEntries([...domainCounts].map(([key, value]) => [key, share(value, HIT_THE_NUMBER_RUNS)])),
    }));
  }, 60_000);

  it("proves Find the Leader rotates content, covers its catalog, and records its finite source-pool replay ceiling", () => {
    const questionCounts = new Map<string, number>();
    const metricCounts = new Map<string, number>();
    const familyCounts = new Map<string, number>();
    const domainCounts = new Map<string, number>();
    const signatures = new Set<string>();
    let immediateQuestionRepeats = 0;
    let immediateMetricRepeats = 0;
    let immediateFamilyRepeats = 0;
    let previousQuestion = "";
    let previousMetric = "";
    let previousFamily = "";
    const recentBoards: Array<{ question: string; metric: string; family: string }> = [];

    for (let index = 0; index < FIND_LEADER_RUNS; index += 1) {
      const recentItemIds = recentBoards.flatMap((row) => [
        `question:${row.question}`,
        `metric:${row.metric}`,
        `family:${row.family}`,
      ]);
      const board = createFootballFindLeaderBoard(`pr10-find-leader-${index}`, emptyHistory(recentItemIds));
      increment(questionCounts, board.definitionId);
      increment(metricCounts, board.metricId);
      increment(familyCounts, board.family);
      increment(domainCounts, board.domainId);
      signatures.add(`${board.definitionId}:${[...board.candidates.map((candidate) => candidate.id)].sort().join("|")}`);

      if (board.definitionId === previousQuestion) immediateQuestionRepeats += 1;
      if (board.metricId === previousMetric) immediateMetricRepeats += 1;
      if (board.family === previousFamily) immediateFamilyRepeats += 1;
      previousQuestion = board.definitionId;
      previousMetric = board.metricId;
      previousFamily = board.family;

      recentBoards.unshift({ question: board.definitionId, metric: board.metricId, family: board.family });
      recentBoards.splice(4);
    }

    const audit = footballFindLeaderCompetitionAudit();
    for (const row of audit) {
      expect(row.boardValid, row.definitionId).toBe(true);
      expect(row.nearContenderCount, row.definitionId).toBeGreaterThanOrEqual(4);
      expect(row.outsideClosestNineCount, row.definitionId).toBeLessThanOrEqual(2);
      if (row.nonRecordLeaderAvailable) expect(row.leaderIsGlobalMax, row.definitionId).toBe(false);
    }

    const uniqueBoardShare = share(signatures.size, FIND_LEADER_RUNS);
    const enabledMetricCount = new Set(footballFindLeaderQuestions.map((question) => question.metricId)).size;
    const enabledDomainCount = new Set(footballFindLeaderQuestions.map((question) => question.domainId)).size;
    expect(share(questionCounts.size, footballFindLeaderQuestions.length)).toBeGreaterThanOrEqual(0.95);
    expect(metricCounts.size).toBe(enabledMetricCount);
    expect(familyCounts.size).toBe(new Set(FOOTBALL_FIND_LEADER_FAMILY_CYCLE).size);
    expect(domainCounts.size).toBe(enabledDomainCount);
    expect(immediateQuestionRepeats).toBe(0);
    expect(immediateMetricRepeats).toBe(0);
    expect(immediateFamilyRepeats).toBe(0);
    expect(uniqueBoardShare).toBeGreaterThanOrEqual(0.18);

    let maxQuestionVsDomainAverage = 0;
    let maxMetricVsDomainAverage = 0;
    for (const [domainId, domainBoardCount] of domainCounts) {
      const domainQuestions = footballFindLeaderQuestions.filter((question) => question.domainId === domainId);
      const domainMetricIds = [...new Set(domainQuestions.map((question) => question.metricId))];
      const questionAverage = domainBoardCount / domainQuestions.length;
      const metricAverage = domainBoardCount / domainMetricIds.length;
      const questionMax = Math.max(...domainQuestions.map((question) => questionCounts.get(question.id) ?? 0));
      const metricMax = Math.max(...domainMetricIds.map((metricId) => metricCounts.get(metricId) ?? 0));
      maxQuestionVsDomainAverage = Math.max(maxQuestionVsDomainAverage, questionMax / questionAverage);
      maxMetricVsDomainAverage = Math.max(maxMetricVsDomainAverage, metricMax / metricAverage);
      expect(questionMax, `${domainId} question exposure`).toBeLessThanOrEqual(questionAverage * 2.75);
      expect(metricMax, `${domainId} metric exposure`).toBeLessThanOrEqual(metricAverage * 2.75);
    }
    const maxFamilyShare = share(maxValue(familyCounts), FIND_LEADER_RUNS);
    expect(maxFamilyShare).toBeLessThanOrEqual(0.25);

    console.info("PR10 Find the Leader audit", JSON.stringify({
      questionsSeen: questionCounts.size,
      questionCatalogSize: footballFindLeaderQuestions.length,
      metricsSeen: metricCounts.size,
      familiesSeen: familyCounts.size,
      domainsSeen: domainCounts.size,
      uniqueBoardShare,
      maxQuestionVsDomainAverage,
      maxMetricVsDomainAverage,
      maxFamilyShare,
      immediateQuestionRepeats,
      immediateMetricRepeats,
      immediateFamilyRepeats,
    }));
  });
});