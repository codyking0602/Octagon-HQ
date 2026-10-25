import {
  FOOTBALL_HIGHER_LOWER_QUESTION_COUNT,
  footballHigherLowerQuestionEvidence,
  footballHigherLowerSemanticPairKey,
  footballHigherLowerSubjectMetricKey,
  type FootballHigherLowerQuestion,
} from "../back-room/footballHigherLowerModel";
import { buildFootballHigherLowerDailyPublication } from "./footballHigherLowerDailyRuntime";

/** Approved future weight; shared scheduler ownership remains in the coordinated cadence PR. */
export const FOOTBALL_HIGHER_LOWER_APPROVED_DAILY_WEIGHT = 2;

type DailyEvidence = ReturnType<typeof footballHigherLowerQuestionEvidence>;
export interface FootballHigherLowerAuditedQuestion {
  day: string;
  position: number;
  league: string;
  metricKey: string;
  metricLabel: string;
  category: string;
  difficulty: string;
  matchupKey: string;
  semanticPairKey: string;
  known: FootballHigherLowerQuestion["known"] & { evidence: DailyEvidence["known"] };
  hidden: FootballHigherLowerQuestion["hidden"] & { evidence: DailyEvidence["hidden"] };
  answer: string;
  questionId: string;
}

/**
 * This is an audit, not a new Daily scheduler. Input dates MUST come from the
 * final coordinated official schedule before a release is certified.
 * The official builder/seed is used and each frozen board excludes every prior
 * subject pair and subject+metric combination.
 */
export function auditFootballHigherLowerDailyDates(
  dates: readonly string[],
  scheduleVersion: string,
) {
  if (!scheduleVersion.trim() || new Set(dates).size !== dates.length
    || dates.some((date, i) => i > 0 && date <= dates[i - 1]!)) {
    throw new Error("Higher or Lower audit requires sorted unique dates and canonical schedule version.");
  }
  const allPriorQuestions: FootballHigherLowerQuestion[] = [];
  const boardSnapshots: Array<{ day: string; setupKey: string; seed: string; questions: FootballHigherLowerAuditedQuestion[] }> = [];
  const subjects = new Map<string, { name: string; appearances: number }>();
  const categoryCounts: Record<string, number> = {};
  const metricCounts: Record<string, number> = {};
  const difficultyCounts: Record<string, number> = {};
  const leagueCounts: Record<string, number> = {};
  const semanticPairs = new Set<string>();
  const subjectMetrics = new Set<string>();
  const boardFingerprints = new Set<string>();
  let exactRepeats = 0;
  let semanticRepeats = 0;
  let repeatedSubjectMetrics = 0;
  let invalidBindings = 0;
  let incorrectGrading = 0;
  let duplicateBoards = 0;
  let metadataOnlyDraftFacts = 0;
  let historicalComparisons = 0;
  const exactIds = new Set<string>();
  const overlap: Array<{ day: string; reusedSubjectsFromPreviousBoard: number }> = [];
  let priorSubjects = new Set<string>();

  for (const day of dates) {
    const publication = buildFootballHigherLowerDailyPublication(day, scheduleVersion, allPriorQuestions);
    const board = (publication.privateSetupEvidence as { board: { seed: string; questions: FootballHigherLowerQuestion[] } }).board;
    if (board.questions.length !== FOOTBALL_HIGHER_LOWER_QUESTION_COUNT
      || board.questions.filter(q => q.league === "NFL").length !== 5
      || board.questions.filter(q => q.league === "CFB").length !== 5) {
      throw new Error("Invalid Football Higher or Lower official mixed board on " + day);
    }
    const todaysSubjects = new Set<string>();
    const rowQuestions: FootballHigherLowerAuditedQuestion[] = [];
    for (const [index, q] of board.questions.entries()) {
      const semanticPairKey = footballHigherLowerSemanticPairKey(q.known.subjectId, q.hidden.subjectId);
      const exactKey = q.metricKey + "|" + [q.known.subjectId, q.hidden.subjectId].sort().join("|");
      if (exactIds.has(exactKey)) exactRepeats++;
      if (semanticPairs.has(semanticPairKey)) semanticRepeats++;
      exactIds.add(exactKey);
      semanticPairs.add(semanticPairKey);
      for (const subject of [q.known, q.hidden]) {
        const subjectMetric = footballHigherLowerSubjectMetricKey(subject.subjectId, q.metricKey);
        if (subjectMetrics.has(subjectMetric)) repeatedSubjectMetrics++;
        subjectMetrics.add(subjectMetric);
        const previous = subjects.get(subject.subjectId);
        subjects.set(subject.subjectId, { name: subject.name, appearances: (previous?.appearances ?? 0) + 1 });
        todaysSubjects.add(subject.subjectId);
      }
      const gradingAnswer = q.hidden.value > q.known.value ? "higher" : "lower";
      if (q.answer !== gradingAnswer) incorrectGrading++;
      const evidence = footballHigherLowerQuestionEvidence(q);
      for (const side of [evidence.known, evidence.hidden]) {
        if (side.registryOnly) metadataOnlyDraftFacts++;
        if (!side.registryOnly && !side.sourceIds.length) invalidBindings++;
      }
      const modern = (q.known.referenceYear ?? 0) >= 2010 && (q.hidden.referenceYear ?? 0) >= 2010;
      if (!modern) historicalComparisons++;
      categoryCounts[q.category] = (categoryCounts[q.category] ?? 0) + 1;
      metricCounts[q.metricKey] = (metricCounts[q.metricKey] ?? 0) + 1;
      difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] ?? 0) + 1;
      leagueCounts[q.league] = (leagueCounts[q.league] ?? 0) + 1;
      rowQuestions.push({
        day, position: index + 1, league: q.league,
        metricKey: q.metricKey, metricLabel: q.metricLabel,
        category: q.category, difficulty: q.difficulty,
        matchupKey: exactKey, semanticPairKey, questionId: q.id,
        known: { ...q.known, evidence: evidence.known },
        hidden: { ...q.hidden, evidence: evidence.hidden },
        answer: q.answer,
      });
    }
    const fingerprint = [...rowQuestions.map(q => q.matchupKey)].sort().join(";");
    if (boardFingerprints.has(fingerprint)) duplicateBoards++;
    boardFingerprints.add(fingerprint);
    overlap.push({
      day,
      reusedSubjectsFromPreviousBoard: [...todaysSubjects].filter(id => priorSubjects.has(id)).length,
    });
    priorSubjects = todaysSubjects;
    boardSnapshots.push({ day, setupKey: publication.setupKey, seed: board.seed, questions: rowQuestions });
    allPriorQuestions.push(...board.questions);
  }
  return {
    auditKind: "generator-backed-official-daily-board-simulation",
    inputScheduleVersion: scheduleVersion,
    days: [...dates],
    summary: {
      scheduledAppearances: dates.length,
      generatedBoards: boardSnapshots.length,
      totalComparisons: allPriorQuestions.length,
      nflComparisons: leagueCounts.NFL ?? 0,
      cfbComparisons: leagueCounts.CFB ?? 0,
      exactDistinctComparisons: exactIds.size,
      semanticDistinctPairs: semanticPairs.size,
      exactRepeats, semanticRepeats, repeatedSubjectMetrics,
      invalidBindings, incorrectGrading, duplicateBoards,
      metadataOnlyDraftFacts, historicalComparisons,
      uniqueSubjectSeasons: subjects.size,
      mostRepeatedSubjects: [...subjects.entries()]
        .map(([id, row]) => ({ id, ...row }))
        .sort((a, b) => b.appearances - a.appearances || a.id.localeCompare(b.id))
        .slice(0, 20),
      categoryCounts, metricCounts, difficultyCounts, leagueCounts,
      consecutiveBoardOverlap: overlap,
    },
    boards: boardSnapshots,
  };
}
