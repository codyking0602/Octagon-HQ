import {
  createReplaySeed,
  seededLineupRandom,
  selectReplayLineup,
  shuffleLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import {
  getFootballBlindResumeEvidenceProfile,
  getFootballSubject,
  queryFootballSubjects,
  type FootballBlindResumeArchetype,
  type FootballSubjectKind,
  type FootballSubjectProfile,
  type FootballSubjectQuery,
} from "./footballFactualStats";
import type { FootballRankFivePackId } from "./footballRankFiveModel";

export const FOOTBALL_BLIND_RESUME_GAME_ID = "football-blind-resume";
export const FOOTBALL_BLIND_RESUME_ROUNDS = 3;
export const FOOTBALL_BLIND_RESUME_REVEAL_STAGES = 3;
export const FOOTBALL_BLIND_RESUME_CORRECT_POINTS = [10, 8, 7] as const;
export const FOOTBALL_BLIND_RESUME_MISS_POINTS = [-4, -1, 0] as const;
export const FOOTBALL_BLIND_RESUME_RAW_MAX = 30;
export const FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES = ["hard", "hard", "medium"] as const;

export type FootballBlindResumeLeague = "NFL" | "CFB";
export type FootballBlindResumeDifficulty = "medium" | "hard";
export type FootballBlindResumeRevealStage = 0 | 1 | 2;

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
  /** Evidence-family identifier. This does not imply an active Rank Five product. */
  packId: FootballRankFivePackId;
  league: FootballBlindResumeLeague;
  archetype: FootballBlindResumeArchetype;
  contextLabel: string;
  prompt: string;
  leftId: string;
  rightId: string;
  winnerId: string;
  difficulty: FootballBlindResumeDifficulty;
  stats: readonly FootballBlindResumeStat[];
  revealCounts: readonly [number, number, number];
}

export interface FootballBlindResumeRound extends FootballBlindResumeMatchup {
  leftName: string;
  rightName: string;
  leftSubtitle: string;
  rightSubtitle: string;
}

export interface FootballBlindResumeRun {
  rounds: FootballBlindResumeRound[];
  identity: PlayLineupIdentity;
}

interface MatchupFamily {
  league: FootballBlindResumeLeague;
  archetype: FootballBlindResumeArchetype;
  contextLabel: string;
}

interface CuratedMatchupSpec {
  packId: FootballRankFivePackId;
  leftId: string;
  rightId: string;
  winnerId: string;
  difficulty: FootballBlindResumeDifficulty;
  evidenceOrder: readonly number[];
  revealCounts: readonly [number, number, number];
}

const MATCHUP_FAMILIES: Partial<Record<FootballRankFivePackId, MatchupFamily>> = {
  "nfl-quarterbacks": { league: "NFL", archetype: "player-career", contextLabel: "NFL · QB · CAREER" },
  "nfl-running-backs": { league: "NFL", archetype: "player-career", contextLabel: "NFL · RB · CAREER" },
  "nfl-wide-receivers": { league: "NFL", archetype: "player-career", contextLabel: "NFL · WR · CAREER" },
  "nfl-tight-ends": { league: "NFL", archetype: "player-career", contextLabel: "NFL · TE · CAREER" },
  "nfl-defensive-players": { league: "NFL", archetype: "player-career", contextLabel: "NFL · DEFENSE · CAREER" },
  "nfl-head-coaches": { league: "NFL", archetype: "coach", contextLabel: "NFL · HEAD COACH · CAREER" },
  "nfl-qb-seasons": { league: "NFL", archetype: "player-season", contextLabel: "NFL · QB · SEASON" },
  "college-quarterbacks": { league: "CFB", archetype: "player-season", contextLabel: "CFB · QB · SEASON" },
  "college-head-coaches": { league: "CFB", archetype: "coach", contextLabel: "CFB · HEAD COACH · CAREER" },
  "college-programs": { league: "CFB", archetype: "program-era", contextLabel: "CFB · PROGRAM · SINCE 2000" },
  "college-program-eras": { league: "CFB", archetype: "program-era", contextLabel: "CFB · PROGRAM ERA" },
};

const CAREER_SWING = [1, 2, 0, 5, 6, 3, 4, 7] as const;
const CAREER_PEAK_FIRST = [2, 1, 0, 5, 3, 6, 4] as const;
const SEASON_SWING = [0, 1, 5, 3, 4, 2, 6, 7] as const;
const COACH_SWING = [3, 4, 6, 0, 2, 1, 5, 7] as const;
const PROGRAM_SWING = [0, 4, 5, 3, 2, 1, 6, 7] as const;

// This bank is intentionally editorial and explicit. It is the temporary verdict authority
// until Football has an approved exact-ranking product. Factual rows still come only from
// footballFactualStats; generated comparison ratings do not decide these winners.
const CURATED_MATCHUPS: readonly CuratedMatchupSpec[] = [
  { packId: "nfl-quarterbacks", leftId: "drew-brees", rightId: "peyton-manning", winnerId: "peyton-manning", difficulty: "hard", evidenceOrder: CAREER_SWING, revealCounts: [3, 6, 8] },
  { packId: "nfl-quarterbacks", leftId: "dan-marino", rightId: "joe-montana", winnerId: "joe-montana", difficulty: "hard", evidenceOrder: CAREER_PEAK_FIRST, revealCounts: [2, 5, 7] },
  { packId: "nfl-quarterbacks", leftId: "dan-marino", rightId: "peyton-manning", winnerId: "peyton-manning", difficulty: "medium", evidenceOrder: CAREER_PEAK_FIRST, revealCounts: [2, 4, 7] },

  { packId: "nfl-running-backs", leftId: "adrian-peterson", rightId: "emmitt-smith", winnerId: "emmitt-smith", difficulty: "hard", evidenceOrder: CAREER_PEAK_FIRST, revealCounts: [2, 5, 7] },
  { packId: "nfl-running-backs", leftId: "adrian-peterson", rightId: "walter-payton", winnerId: "walter-payton", difficulty: "hard", evidenceOrder: CAREER_SWING, revealCounts: [3, 5, 8] },
  { packId: "nfl-running-backs", leftId: "adrian-peterson", rightId: "barry-sanders", winnerId: "barry-sanders", difficulty: "hard", evidenceOrder: CAREER_PEAK_FIRST, revealCounts: [2, 5, 7] },

  { packId: "nfl-wide-receivers", leftId: "randy-moss", rightId: "jerry-rice", winnerId: "jerry-rice", difficulty: "hard", evidenceOrder: CAREER_PEAK_FIRST, revealCounts: [2, 5, 7] },
  { packId: "nfl-wide-receivers", leftId: "terrell-owens", rightId: "jerry-rice", winnerId: "jerry-rice", difficulty: "medium", evidenceOrder: CAREER_SWING, revealCounts: [3, 6, 8] },
  { packId: "nfl-wide-receivers", leftId: "calvin-johnson", rightId: "jerry-rice", winnerId: "jerry-rice", difficulty: "medium", evidenceOrder: CAREER_PEAK_FIRST, revealCounts: [2, 4, 7] },

  { packId: "nfl-tight-ends", leftId: "antonio-gates", rightId: "rob-gronkowski", winnerId: "rob-gronkowski", difficulty: "hard", evidenceOrder: CAREER_SWING, revealCounts: [3, 5, 8] },
  { packId: "nfl-tight-ends", leftId: "shannon-sharpe", rightId: "rob-gronkowski", winnerId: "rob-gronkowski", difficulty: "hard", evidenceOrder: CAREER_PEAK_FIRST, revealCounts: [2, 5, 7] },
  { packId: "nfl-tight-ends", leftId: "antonio-gates", rightId: "tony-gonzalez", winnerId: "tony-gonzalez", difficulty: "hard", evidenceOrder: CAREER_SWING, revealCounts: [3, 6, 8] },

  { packId: "nfl-defensive-players", leftId: "jj-watt", rightId: "lawrence-taylor", winnerId: "lawrence-taylor", difficulty: "hard", evidenceOrder: CAREER_PEAK_FIRST, revealCounts: [2, 5, 7] },
  { packId: "nfl-defensive-players", leftId: "jj-watt", rightId: "reggie-white", winnerId: "reggie-white", difficulty: "hard", evidenceOrder: CAREER_SWING, revealCounts: [3, 5, 8] },

  { packId: "nfl-head-coaches", leftId: "bill-walsh", rightId: "bill-belichick", winnerId: "bill-belichick", difficulty: "hard", evidenceOrder: COACH_SWING, revealCounts: [3, 6, 8] },
  { packId: "nfl-head-coaches", leftId: "don-shula", rightId: "bill-belichick", winnerId: "bill-belichick", difficulty: "hard", evidenceOrder: COACH_SWING, revealCounts: [2, 5, 8] },

  { packId: "nfl-qb-seasons", leftId: "aaron-rodgers-2011", rightId: "patrick-mahomes-2022", winnerId: "patrick-mahomes-2022", difficulty: "hard", evidenceOrder: SEASON_SWING, revealCounts: [3, 5, 8] },
  { packId: "nfl-qb-seasons", leftId: "aaron-rodgers-2011", rightId: "steve-young-1994", winnerId: "steve-young-1994", difficulty: "hard", evidenceOrder: SEASON_SWING, revealCounts: [2, 5, 8] },
  { packId: "nfl-qb-seasons", leftId: "tom-brady-2007", rightId: "patrick-mahomes-2022", winnerId: "patrick-mahomes-2022", difficulty: "hard", evidenceOrder: SEASON_SWING, revealCounts: [3, 6, 8] },

  { packId: "college-quarterbacks", leftId: "tim-tebow-2007", rightId: "joe-burrow-2019", winnerId: "joe-burrow-2019", difficulty: "medium", evidenceOrder: SEASON_SWING, revealCounts: [2, 5, 8] },
  { packId: "college-quarterbacks", leftId: "tim-tebow-2007", rightId: "cam-newton-2010", winnerId: "cam-newton-2010", difficulty: "hard", evidenceOrder: SEASON_SWING, revealCounts: [3, 5, 8] },
  { packId: "college-quarterbacks", leftId: "vince-young-2005", rightId: "joe-burrow-2019", winnerId: "joe-burrow-2019", difficulty: "hard", evidenceOrder: SEASON_SWING, revealCounts: [3, 6, 8] },

  { packId: "college-head-coaches", leftId: "urban-meyer-cfb", rightId: "nick-saban-cfb", winnerId: "nick-saban-cfb", difficulty: "hard", evidenceOrder: COACH_SWING, revealCounts: [3, 6, 8] },
  { packId: "college-head-coaches", leftId: "bob-stoops-cfb", rightId: "nick-saban-cfb", winnerId: "nick-saban-cfb", difficulty: "medium", evidenceOrder: COACH_SWING, revealCounts: [2, 5, 8] },
  { packId: "college-head-coaches", leftId: "kirby-smart-cfb", rightId: "nick-saban-cfb", winnerId: "nick-saban-cfb", difficulty: "hard", evidenceOrder: COACH_SWING, revealCounts: [3, 5, 8] },

  { packId: "college-programs", leftId: "georgia-program", rightId: "alabama-program", winnerId: "alabama-program", difficulty: "hard", evidenceOrder: PROGRAM_SWING, revealCounts: [3, 6, 8] },
  { packId: "college-programs", leftId: "lsu-program", rightId: "alabama-program", winnerId: "alabama-program", difficulty: "medium", evidenceOrder: PROGRAM_SWING, revealCounts: [2, 5, 8] },

  { packId: "college-program-eras", leftId: "clemson-2015-2020", rightId: "alabama-2009-2020", winnerId: "alabama-2009-2020", difficulty: "hard", evidenceOrder: PROGRAM_SWING, revealCounts: [3, 6, 8] },
  { packId: "college-program-eras", leftId: "georgia-2021-2024", rightId: "alabama-2009-2020", winnerId: "alabama-2009-2020", difficulty: "medium", evidenceOrder: PROGRAM_SWING, revealCounts: [2, 5, 8] },
  { packId: "college-program-eras", leftId: "usc-2002-2008", rightId: "alabama-2009-2020", winnerId: "alabama-2009-2020", difficulty: "hard", evidenceOrder: PROGRAM_SWING, revealCounts: [3, 6, 8] },
] as const;

function familyFor(packId: FootballRankFivePackId) {
  const family = MATCHUP_FAMILIES[packId];
  if (!family) throw new Error(`Football Blind Resume has no curated family metadata for ${packId}.`);
  return family;
}

function buildStats(spec: CuratedMatchupSpec) {
  const family = familyFor(spec.packId);
  const left = getFootballBlindResumeEvidenceProfile(spec.packId, spec.leftId);
  const right = getFootballBlindResumeEvidenceProfile(spec.packId, spec.rightId);
  if (left.league !== family.league || right.league !== family.league || left.archetype !== family.archetype || right.archetype !== family.archetype) {
    throw new Error(`Football Blind Resume curated evidence ${spec.packId}:${spec.leftId}:${spec.rightId} does not match its family.`);
  }
  if (spec.evidenceOrder.length < 6 || spec.evidenceOrder.length > 8 || new Set(spec.evidenceOrder).size !== spec.evidenceOrder.length) {
    throw new Error(`Football Blind Resume curated evidence order ${spec.packId}:${spec.leftId}:${spec.rightId} must contain 6–8 unique rows.`);
  }
  if (spec.evidenceOrder.some((index) => !Number.isInteger(index) || index < 0 || index >= left.evidence.length)) {
    throw new Error(`Football Blind Resume curated evidence order ${spec.packId}:${spec.leftId}:${spec.rightId} contains an invalid row.`);
  }
  const [first, second, third] = spec.revealCounts;
  if (!(first > 0 && first < second && second < third && third === spec.evidenceOrder.length)) {
    throw new Error(`Football Blind Resume reveal stages ${spec.packId}:${spec.leftId}:${spec.rightId} must increase and end at the evidence count.`);
  }

  return spec.evidenceOrder.map((sourceIndex) => {
    const leftRow = left.evidence[sourceIndex]!;
    const rightRow = right.evidence[sourceIndex]!;
    if (leftRow.dimensionId !== rightRow.dimensionId || leftRow.label !== rightRow.label) {
      throw new Error(`Football Blind Resume curated rows ${spec.packId}:${spec.leftId}:${spec.rightId} are misaligned.`);
    }
    return {
      label: leftRow.label,
      valueA: leftRow.value,
      valueB: rightRow.value,
      source: { owner: "footballFactualStats", dimensionId: leftRow.dimensionId } as const,
    };
  });
}

function makeMatchup(spec: CuratedMatchupSpec): FootballBlindResumeMatchup {
  const family = familyFor(spec.packId);
  if (spec.winnerId !== spec.leftId && spec.winnerId !== spec.rightId) {
    throw new Error(`Football Blind Resume curated winner ${spec.winnerId} is not on matchup ${spec.leftId}:${spec.rightId}.`);
  }
  return {
    id: `${spec.packId}-${spec.leftId}-v-${spec.rightId}`,
    packId: spec.packId,
    league: family.league,
    archetype: family.archetype,
    contextLabel: family.contextLabel,
    prompt: "Who has the better résumé?",
    leftId: spec.leftId,
    rightId: spec.rightId,
    winnerId: spec.winnerId,
    difficulty: spec.difficulty,
    stats: buildStats(spec),
    revealCounts: spec.revealCounts,
  };
}

export const footballBlindResumeMatchups: readonly FootballBlindResumeMatchup[] = CURATED_MATCHUPS.map(makeMatchup);

if (new Set(footballBlindResumeMatchups.map((row) => row.id)).size !== footballBlindResumeMatchups.length) {
  throw new Error("Football Blind Resume curated bank contains a duplicate matchup.");
}

function subjectSubtitle(subject: FootballSubjectProfile) {
  if (subject.kind === "player-career") {
    const seasons = subject.startSeason != null && subject.endSeason != null
      ? `${subject.startSeason}–${subject.endSeason}`
      : null;
    return [subject.position, subject.school, seasons].filter(Boolean).join(" · ") || subject.league;
  }
  if (subject.kind === "player-season") {
    return [subject.position, subject.season].filter(Boolean).join(" · ") || subject.league;
  }
  if (subject.kind === "coach") {
    return subject.school ? `${subject.school} · Head coach` : `${subject.league} head coach`;
  }
  if (subject.kind === "program-era") {
    const seasons = subject.startSeason != null && subject.endSeason != null
      ? `${subject.startSeason}–${subject.endSeason}`
      : null;
    return [subject.school, seasons].filter(Boolean).join(" · ") || "Program era";
  }
  if (subject.kind === "team-season") {
    return subject.season ? `${subject.league} · ${subject.season}` : `${subject.league} team season`;
  }
  return subject.school ?? subject.league;
}

function normalizedSubjectLabel(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

function evidenceSubjectNameKey(subjectId: string, archetype: FootballBlindResumeArchetype) {
  if (archetype === "player-season") return normalizedSubjectLabel(subjectId.replace(/-\d{4}$/, ""));
  if (archetype === "player-career") return normalizedSubjectLabel(subjectId.replace(/-career$/, "").replace(/-cfb$/, ""));
  if (archetype === "coach") return normalizedSubjectLabel(subjectId.replace(/-cfb$/, ""));
  return normalizedSubjectLabel(subjectId.replace(/-program$/, ""));
}

function evidenceSubjectQuery(matchup: FootballBlindResumeMatchup, subjectId: string): FootballSubjectQuery {
  const collegeQuarterbackSeason = matchup.packId === "college-quarterbacks" && matchup.archetype === "player-season";
  let kind: FootballSubjectKind;
  switch (matchup.archetype) {
    case "player-career":
      kind = "player-career";
      break;
    case "player-season":
      // Historical CFB season evidence predates the source-backed season projection window.
      // Its canonical identity owner is therefore the CFB player career, while the evidence remains season-scoped.
      kind = collegeQuarterbackSeason ? "player-career" : "player-season";
      break;
    case "coach":
      kind = "coach";
      break;
    case "team-season":
      kind = "team-season";
      break;
    case "program-era":
      kind = matchup.packId === "college-programs" ? "program" : "program-era";
      break;
  }
  const seasonMatch = matchup.archetype === "player-season" && !collegeQuarterbackSeason
    ? /-(\d{4})$/.exec(subjectId)
    : null;
  return {
    kind,
    league: matchup.league,
    ...(seasonMatch ? { season: Number(seasonMatch[1]) } : {}),
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  };
}

function resolveEvidenceSubject(matchup: FootballBlindResumeMatchup, subjectId: string) {
  const direct = getFootballSubject(subjectId);
  if (direct) return direct;

  const targetName = evidenceSubjectNameKey(subjectId, matchup.archetype);
  const matches = queryFootballSubjects(evidenceSubjectQuery(matchup, subjectId))
    .filter((subject) => normalizedSubjectLabel(subject.name) === targetName);
  const uniqueById = new Map(matches.map((subject) => [subject.id, subject]));
  return uniqueById.size === 1 ? [...uniqueById.values()][0]! : null;
}

function resolveMatchup(matchup: FootballBlindResumeMatchup): FootballBlindResumeRound {
  const left = resolveEvidenceSubject(matchup, matchup.leftId);
  const right = resolveEvidenceSubject(matchup, matchup.rightId);
  if (!left || !right) {
    throw new Error(`Football Blind Resume matchup ${matchup.id} references an unavailable canonical subject.`);
  }
  return {
    ...matchup,
    leftName: left.name,
    rightName: right.name,
    leftSubtitle: subjectSubtitle(left),
    rightSubtitle: subjectSubtitle(right),
  };
}

export function resolvedFootballBlindResumeMatchups() {
  return footballBlindResumeMatchups.map(resolveMatchup);
}

const nflQuarterbackCareerIds = new Set(
  queryFootballSubjects({
    kind: "player-career",
    league: "NFL",
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  }).map((subject) => subject.id),
);

export function footballBlindResumeSubjectIdentityId(subjectId: string) {
  for (const careerId of nflQuarterbackCareerIds) {
    if (subjectId === careerId || subjectId.startsWith(`${careerId}-`)) return careerId;
  }
  return subjectId;
}

export function footballBlindResumeDifficultyLabel(difficulty: FootballBlindResumeDifficulty) {
  return difficulty.toUpperCase();
}

function canUseRound(matchup: FootballBlindResumeRound, usedMatchupIds: ReadonlySet<string>, usedSubjectIds: ReadonlySet<string>, usedPackIds: ReadonlySet<FootballRankFivePackId>) {
  return !usedMatchupIds.has(matchup.id)
    && !usedPackIds.has(matchup.packId)
    && !usedSubjectIds.has(footballBlindResumeSubjectIdentityId(matchup.leftId))
    && !usedSubjectIds.has(footballBlindResumeSubjectIdentityId(matchup.rightId));
}

export function buildFootballBlindResumeRounds(seed: string, requestedDifficulties?: readonly FootballBlindResumeDifficulty[]) {
  if (requestedDifficulties && requestedDifficulties.length !== FOOTBALL_BLIND_RESUME_ROUNDS) {
    throw new Error("Football Blind Resume difficulty slate must contain exactly three rounds.");
  }
  const random = seededLineupRandom(FOOTBALL_BLIND_RESUME_GAME_ID, seed);
  const shuffled = shuffleLineup(resolvedFootballBlindResumeMatchups(), random);

  const search = (
    index: number,
    selected: FootballBlindResumeRound[],
    usedMatchupIds: Set<string>,
    usedSubjectIds: Set<string>,
    usedPackIds: Set<FootballRankFivePackId>,
  ): FootballBlindResumeRound[] | null => {
    if (index === FOOTBALL_BLIND_RESUME_ROUNDS) {
      const leagues = new Set(selected.map((round) => round.league));
      return leagues.size === 2 ? selected : null;
    }
    const desiredDifficulty = requestedDifficulties?.[index] ?? null;
    const candidates = shuffled.filter((matchup) =>
      (!desiredDifficulty || matchup.difficulty === desiredDifficulty)
      && canUseRound(matchup, usedMatchupIds, usedSubjectIds, usedPackIds));
    for (const matchup of candidates) {
      const nextMatchupIds = new Set(usedMatchupIds).add(matchup.id);
      const nextSubjectIds = new Set(usedSubjectIds);
      nextSubjectIds.add(footballBlindResumeSubjectIdentityId(matchup.leftId));
      nextSubjectIds.add(footballBlindResumeSubjectIdentityId(matchup.rightId));
      const nextPackIds = new Set(usedPackIds).add(matchup.packId);
      const found = search(index + 1, [...selected, matchup], nextMatchupIds, nextSubjectIds, nextPackIds);
      if (found) return found;
    }
    return null;
  };

  const selected = search(0, [], new Set(), new Set(), new Set());
  if (!selected) throw new Error("Football Blind Resume curated bank cannot build a three-round mixed NFL/CFB daily slate.");
  return selected;
}

export function createFootballBlindResumeRun(): FootballBlindResumeRun {
  const resolved = resolvedFootballBlindResumeMatchups();
  const selected = selectReplayLineup({
    gameId: FOOTBALL_BLIND_RESUME_GAME_ID,
    lineupSize: FOOTBALL_BLIND_RESUME_ROUNDS,
    attempts: 12,
    validItemIds: new Set(resolved.map((row) => row.id)),
    validFighterIds: new Set(resolved.flatMap((row) => [
      footballBlindResumeSubjectIdentityId(row.leftId),
      footballBlindResumeSubjectIdentityId(row.rightId),
    ])),
    seedFactory: () => createReplaySeed(FOOTBALL_BLIND_RESUME_GAME_ID),
    build: (seed) => {
      const rounds = buildFootballBlindResumeRounds(seed);
      return {
        value: rounds,
        itemIds: rounds.map((round) => round.id),
        fighterIds: rounds.flatMap((round) => [
          footballBlindResumeSubjectIdentityId(round.leftId),
          footballBlindResumeSubjectIdentityId(round.rightId),
        ]),
      };
    },
  });
  return { rounds: selected.value, identity: selected.identity };
}

export function footballBlindResumeRevealStage(matchup: Pick<FootballBlindResumeMatchup, "revealCounts">, revealedCount: number): FootballBlindResumeRevealStage {
  const index = matchup.revealCounts.indexOf(revealedCount);
  if (index < 0) throw new Error(`Football Blind Resume reveal count ${revealedCount} is not a valid stage.`);
  return index as FootballBlindResumeRevealStage;
}

export function footballBlindResumeNextRevealCount(matchup: Pick<FootballBlindResumeMatchup, "revealCounts">, revealedCount: number) {
  const stage = footballBlindResumeRevealStage(matchup, revealedCount);
  return matchup.revealCounts[stage + 1] ?? null;
}

export function footballBlindResumeRoundPoints(stage: FootballBlindResumeRevealStage, correct: boolean) {
  return correct ? FOOTBALL_BLIND_RESUME_CORRECT_POINTS[stage] : FOOTBALL_BLIND_RESUME_MISS_POINTS[stage];
}

export function normalizeFootballBlindResumeDailyScore(rawPoints: number) {
  if (!Number.isFinite(rawPoints)) throw new Error("Football Blind Resume raw score must be finite.");
  return Math.max(0, Math.min(100, Math.round((rawPoints / FOOTBALL_BLIND_RESUME_RAW_MAX) * 100)));
}

export function footballBlindResumeScore(rawPoints: number) {
  return normalizeFootballBlindResumeDailyScore(rawPoints);
}

export function footballBlindResumeTier(score: number) {
  if (score >= 90) return "FRONT OFFICE SAVANT";
  if (score >= 75) return "ELITE BALL KNOWER";
  if (score >= 55) return "SOLID TAPE";
  if (score >= 35) return "GROUP CHAT GM";
  return "BACK TO THE FILM";
}
