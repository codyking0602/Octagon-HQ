import { seededLineupRandom, shuffleLineup } from "../play/lineupModel";
import {
  getFootballBlindResumeEvidenceProfile,
  type FootballBlindResumeArchetype,
} from "./footballFactualStats";
import {
  getFootballRankFivePack,
  type FootballRankFivePackId,
} from "./footballRankFiveModel";

export const FOOTBALL_BLIND_RESUME_GAME_ID = "football-blind-resume";
export const FOOTBALL_BLIND_RESUME_ROUNDS = 3;
export const FOOTBALL_BLIND_RESUME_REVEAL_STAGES = [1, 2, 3] as const;
export const FOOTBALL_BLIND_RESUME_MAX_RAW_SCORE = 30;
export const FOOTBALL_BLIND_RESUME_STAGE_SCORING = [
  { correct: 10, wrong: -4 },
  { correct: 8, wrong: -1 },
  { correct: 7, wrong: 0 },
] as const;

export type FootballBlindResumeLeague = "NFL" | "CFB";
export type FootballBlindResumeRevealStage = typeof FOOTBALL_BLIND_RESUME_REVEAL_STAGES[number];
export type FootballBlindResumeDifficulty = "hard" | "villain";

export interface FootballBlindResumeFactSource {
  owner: "footballFactualStats";
  dimensionId: string;
}

export interface FootballBlindResumeStat {
  label: string;
  valueA: string;
  valueB: string;
  source: FootballBlindResumeFactSource;
}

export interface FootballBlindResumeMatchup {
  id: string;
  packId: FootballRankFivePackId;
  league: FootballBlindResumeLeague;
  archetype: FootballBlindResumeArchetype;
  prompt: string;
  leftId: string;
  rightId: string;
  winnerId: string;
  difficulty: FootballBlindResumeDifficulty;
  stats: readonly FootballBlindResumeStat[];
  revealEnds: readonly [number, number, number];
}

export interface FootballBlindResumeRound extends FootballBlindResumeMatchup {
  leftName: string;
  rightName: string;
  leftSubtitle: string;
  rightSubtitle: string;
}

interface MatchupFamily {
  packId: FootballRankFivePackId;
  league: FootballBlindResumeLeague;
  archetype: FootballBlindResumeArchetype;
  prompt: string;
}

interface CuratedMatchupDefinition {
  packId: FootballRankFivePackId;
  leftId: string;
  rightId: string;
  winnerId: string;
  difficulty: FootballBlindResumeDifficulty;
  revealGroups: readonly [readonly string[], readonly string[], readonly string[]];
}

const MATCHUP_FAMILIES: readonly MatchupFamily[] = [
  { packId: "nfl-quarterbacks", league: "NFL", archetype: "player-career", prompt: "Which NFL quarterback career was greater?" },
  { packId: "nfl-running-backs", league: "NFL", archetype: "player-career", prompt: "Which NFL running back career was greater?" },
  { packId: "nfl-wide-receivers", league: "NFL", archetype: "player-career", prompt: "Which NFL wide receiver career was greater?" },
  { packId: "nfl-tight-ends", league: "NFL", archetype: "player-career", prompt: "Which NFL tight end career was greater?" },
  { packId: "nfl-defensive-players", league: "NFL", archetype: "player-career", prompt: "Which NFL defensive career was greater?" },
  { packId: "nfl-head-coaches", league: "NFL", archetype: "coach", prompt: "Which NFL head-coaching career was greater?" },
  { packId: "nfl-qb-seasons", league: "NFL", archetype: "player-season", prompt: "Which NFL quarterback season was greater?" },
  { packId: "nfl-team-seasons", league: "NFL", archetype: "team-season", prompt: "Which NFL team season was greater?" },
  { packId: "college-quarterbacks", league: "CFB", archetype: "player-season", prompt: "Which college quarterback season was greater?" },
  { packId: "college-head-coaches", league: "CFB", archetype: "coach", prompt: "Which college head-coaching career was greater?" },
  { packId: "college-programs", league: "CFB", archetype: "program-era", prompt: "Which program has the stronger resume since 2000?" },
  { packId: "college-program-eras", league: "CFB", archetype: "program-era", prompt: "Which defined college program era was greater?" },
  { packId: "college-team-seasons", league: "CFB", archetype: "team-season", prompt: "Which college team season was greater?" },
] as const;

const careerSeven = [
  ["career-production", "efficiency"],
  ["peak", "longevity"],
  ["awards", "team-success", "records"],
] as const;
const careerSix = [
  ["efficiency", "career-production"],
  ["peak", "records"],
  ["awards", "team-success"],
] as const;
const seasonSeven = [
  ["season-production", "secondary-production"],
  ["efficiency-rank", "team-result"],
  ["awards", "big-game", "season-distinction"],
] as const;
const coachSeven = [
  ["win-loss", "longevity"],
  ["peak-stretch", "conference-division"],
  ["championships", "elite-postseason", "coach-distinction"],
] as const;
const programSeven = [
  ["era-record", "dominance"],
  ["conference-titles", "talent-pipeline"],
  ["national-titles", "postseason-results", "era-distinction"],
] as const;

/**
 * Temporary Football Blind Resume verdict owner while the full Football ranking product is still being built.
 * Every row is deliberately curated: factual values still come only from footballFactualStats, while the winner
 * is an explicit editorial verdict instead of a hidden numeric rating or within-tier comparison.
 */
const CURATED_MATCHUPS: readonly CuratedMatchupDefinition[] = [
  { packId: "nfl-quarterbacks", leftId: "peyton-manning", rightId: "drew-brees", winnerId: "peyton-manning", difficulty: "hard", revealGroups: careerSeven },
  { packId: "nfl-quarterbacks", leftId: "joe-montana", rightId: "drew-brees", winnerId: "joe-montana", difficulty: "hard", revealGroups: careerSix },
  { packId: "nfl-quarterbacks", leftId: "peyton-manning", rightId: "dan-marino", winnerId: "peyton-manning", difficulty: "hard", revealGroups: careerSeven },
  { packId: "nfl-quarterbacks", leftId: "joe-montana", rightId: "dan-marino", winnerId: "joe-montana", difficulty: "villain", revealGroups: careerSix },
  { packId: "nfl-running-backs", leftId: "emmitt-smith", rightId: "adrian-peterson", winnerId: "emmitt-smith", difficulty: "hard", revealGroups: careerSeven },
  { packId: "nfl-running-backs", leftId: "walter-payton", rightId: "adrian-peterson", winnerId: "walter-payton", difficulty: "villain", revealGroups: careerSix },
  { packId: "nfl-wide-receivers", leftId: "jerry-rice", rightId: "randy-moss", winnerId: "jerry-rice", difficulty: "hard", revealGroups: careerSeven },
  { packId: "nfl-wide-receivers", leftId: "jerry-rice", rightId: "terrell-owens", winnerId: "jerry-rice", difficulty: "hard", revealGroups: careerSix },
  { packId: "nfl-wide-receivers", leftId: "jerry-rice", rightId: "calvin-johnson", winnerId: "jerry-rice", difficulty: "hard", revealGroups: careerSeven },
  { packId: "nfl-tight-ends", leftId: "rob-gronkowski", rightId: "antonio-gates", winnerId: "rob-gronkowski", difficulty: "hard", revealGroups: careerSix },
  { packId: "nfl-tight-ends", leftId: "tony-gonzalez", rightId: "antonio-gates", winnerId: "tony-gonzalez", difficulty: "hard", revealGroups: careerSeven },
  { packId: "nfl-tight-ends", leftId: "rob-gronkowski", rightId: "shannon-sharpe", winnerId: "rob-gronkowski", difficulty: "hard", revealGroups: careerSeven },
  { packId: "nfl-defensive-players", leftId: "lawrence-taylor", rightId: "jj-watt", winnerId: "lawrence-taylor", difficulty: "villain", revealGroups: careerSeven },
  { packId: "nfl-defensive-players", leftId: "reggie-white", rightId: "jj-watt", winnerId: "reggie-white", difficulty: "hard", revealGroups: careerSix },
  { packId: "nfl-defensive-players", leftId: "ray-lewis", rightId: "jj-watt", winnerId: "ray-lewis", difficulty: "villain", revealGroups: careerSeven },
  { packId: "nfl-head-coaches", leftId: "bill-belichick", rightId: "don-shula", winnerId: "bill-belichick", difficulty: "hard", revealGroups: coachSeven },
  { packId: "college-quarterbacks", leftId: "joe-burrow-2019", rightId: "tim-tebow-2007", winnerId: "joe-burrow-2019", difficulty: "hard", revealGroups: seasonSeven },
  { packId: "college-quarterbacks", leftId: "cam-newton-2010", rightId: "tim-tebow-2007", winnerId: "cam-newton-2010", difficulty: "hard", revealGroups: seasonSeven },
  { packId: "college-head-coaches", leftId: "nick-saban-cfb", rightId: "urban-meyer-cfb", winnerId: "nick-saban-cfb", difficulty: "hard", revealGroups: coachSeven },
  { packId: "college-head-coaches", leftId: "nick-saban-cfb", rightId: "kirby-smart-cfb", winnerId: "nick-saban-cfb", difficulty: "hard", revealGroups: coachSeven },
  { packId: "college-programs", leftId: "alabama-program", rightId: "lsu-program", winnerId: "alabama-program", difficulty: "hard", revealGroups: programSeven },
  { packId: "college-programs", leftId: "alabama-program", rightId: "georgia-program", winnerId: "alabama-program", difficulty: "villain", revealGroups: programSeven },
  { packId: "college-program-eras", leftId: "alabama-2009-2020", rightId: "clemson-2015-2020", winnerId: "alabama-2009-2020", difficulty: "hard", revealGroups: programSeven },
  { packId: "college-program-eras", leftId: "alabama-2009-2020", rightId: "georgia-2021-2024", winnerId: "alabama-2009-2020", difficulty: "hard", revealGroups: programSeven },
] as const;

function familyFor(packId: FootballRankFivePackId) {
  const family = MATCHUP_FAMILIES.find((row) => row.packId === packId);
  if (!family) throw new Error(`Football Blind Resume has no family for ${packId}.`);
  return family;
}

function buildCuratedMatchup(definition: CuratedMatchupDefinition): FootballBlindResumeRound {
  const family = familyFor(definition.packId);
  const left = getFootballBlindResumeEvidenceProfile(definition.packId, definition.leftId);
  const right = getFootballBlindResumeEvidenceProfile(definition.packId, definition.rightId);
  if (left.archetype !== family.archetype || right.archetype !== family.archetype || left.league !== family.league || right.league !== family.league) {
    throw new Error(`Football Blind Resume curated matchup ${definition.packId}:${definition.leftId}:${definition.rightId} has mismatched evidence.`);
  }
  if (definition.winnerId !== definition.leftId && definition.winnerId !== definition.rightId) {
    throw new Error(`Football Blind Resume curated matchup winner must be one of the two subjects.`);
  }
  const leftByDimension = new Map(left.evidence.map((row) => [row.dimensionId, row]));
  const rightByDimension = new Map(right.evidence.map((row) => [row.dimensionId, row]));
  const orderedDimensions = definition.revealGroups.flat();
  if (new Set(orderedDimensions).size !== orderedDimensions.length || definition.revealGroups.some((group) => group.length === 0)) {
    throw new Error(`Football Blind Resume curated matchup reveal plan is invalid.`);
  }
  const stats = orderedDimensions.map((dimensionId) => {
    const leftRow = leftByDimension.get(dimensionId);
    const rightRow = rightByDimension.get(dimensionId);
    if (!leftRow || !rightRow || leftRow.label !== rightRow.label) {
      throw new Error(`Football Blind Resume curated matchup is missing aligned evidence dimension ${dimensionId}.`);
    }
    return {
      label: leftRow.label,
      valueA: leftRow.value,
      valueB: rightRow.value,
      source: { owner: "footballFactualStats", dimensionId } as const,
    };
  });
  const firstEnd = definition.revealGroups[0].length;
  const secondEnd = firstEnd + definition.revealGroups[1].length;
  const thirdEnd = stats.length;
  const pack = getFootballRankFivePack(definition.packId);
  const leftPresentation = pack.items.find((row) => row.id === definition.leftId);
  const rightPresentation = pack.items.find((row) => row.id === definition.rightId);
  if (!leftPresentation || !rightPresentation) throw new Error(`Football Blind Resume curated subject presentation is unavailable.`);
  return {
    id: `${definition.packId}-${definition.leftId}-v-${definition.rightId}`,
    packId: definition.packId,
    league: family.league,
    archetype: family.archetype,
    prompt: family.prompt,
    leftId: definition.leftId,
    rightId: definition.rightId,
    winnerId: definition.winnerId,
    difficulty: definition.difficulty,
    stats,
    revealEnds: [firstEnd, secondEnd, thirdEnd],
    leftName: leftPresentation.name,
    rightName: rightPresentation.name,
    leftSubtitle: leftPresentation.subtitle,
    rightSubtitle: rightPresentation.subtitle,
  };
}

export const footballBlindResumeMatchups: readonly FootballBlindResumeRound[] = CURATED_MATCHUPS.map(buildCuratedMatchup);

export function resolvedFootballBlindResumeMatchups() {
  return [...footballBlindResumeMatchups];
}

export function footballBlindResumeVisibleCount(round: Pick<FootballBlindResumeRound, "revealEnds">, stage: FootballBlindResumeRevealStage) {
  return round.revealEnds[stage - 1];
}

export function footballBlindResumeNextRevealStage(stage: FootballBlindResumeRevealStage) {
  return stage < 3 ? (stage + 1) as FootballBlindResumeRevealStage : null;
}

export function footballBlindResumeRoundPoints(stage: FootballBlindResumeRevealStage, correct: boolean) {
  const scoring = FOOTBALL_BLIND_RESUME_STAGE_SCORING[stage - 1];
  if (!scoring) throw new Error(`Unsupported Football Blind Resume reveal stage ${stage}.`);
  return correct ? scoring.correct : scoring.wrong;
}

export function footballBlindResumeDailyScore(rawScore: number) {
  return Math.max(0, Math.min(100, Math.round((rawScore / FOOTBALL_BLIND_RESUME_MAX_RAW_SCORE) * 100)));
}

export function footballBlindResumeTier(normalizedScore: number) {
  if (normalizedScore >= 90) return "FRONT OFFICE SAVANT";
  if (normalizedScore >= 75) return "ELITE BALL KNOWER";
  if (normalizedScore >= 60) return "SOLID TAPE";
  if (normalizedScore >= 40) return "GROUP CHAT GM";
  return "BACK TO THE FILM";
}

export function buildFootballBlindResumeRounds(seed: string) {
  const random = seededLineupRandom(FOOTBALL_BLIND_RESUME_GAME_ID, seed);
  const shuffled = shuffleLineup(footballBlindResumeMatchups, random);
  const selected: FootballBlindResumeRound[] = [];
  const usedPacks = new Set<FootballRankFivePackId>();
  const usedSubjects = new Set<string>();
  for (const matchup of shuffled) {
    if (usedPacks.has(matchup.packId) || usedSubjects.has(matchup.leftId) || usedSubjects.has(matchup.rightId)) continue;
    selected.push(matchup);
    usedPacks.add(matchup.packId);
    usedSubjects.add(matchup.leftId);
    usedSubjects.add(matchup.rightId);
    if (selected.length === FOOTBALL_BLIND_RESUME_ROUNDS) break;
  }
  if (selected.length !== FOOTBALL_BLIND_RESUME_ROUNDS) throw new Error("Football Blind Resume curated catalog cannot build a three-round daily card.");
  return selected;
}
