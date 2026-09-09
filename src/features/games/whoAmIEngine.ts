export type WhoAmISport = "ufc" | "football";
export type WhoAmILeague = "UFC" | "NFL" | "CFB";
export type WhoAmISubjectKind = "fighter" | "player" | "coach";
export type WhoAmIClueBand = "broad" | "helpful" | "strong" | "giveaway";

export interface WhoAmISubject {
  id: string;
  name: string;
  kind: WhoAmISubjectKind;
}

export interface WhoAmIClue {
  id: string;
  text: string;
  band: WhoAmIClueBand;
}

export interface WhoAmICandidate extends WhoAmISubject {
  clues: readonly WhoAmIClue[];
}

export interface WhoAmIUniverse {
  sport: WhoAmISport;
  league: WhoAmILeague;
  candidates: readonly WhoAmICandidate[];
}

export interface WhoAmIRound {
  sport: WhoAmISport;
  league: WhoAmILeague;
  subjects: readonly WhoAmISubject[];
  hiddenSubject: WhoAmISubject;
  clues: readonly WhoAmIClue[];
}

export const WHO_AM_I_CLUE_LIMIT = 10;
export const WHO_AM_I_CLUES_PER_REVEAL = 2;
export const WHO_AM_I_WRONG_GUESS_PENALTY = 15;
export const WHO_AM_I_WINDOW_SCORES = [100, 90, 80, 70, 60] as const;

const BAND_ORDER: readonly WhoAmIClueBand[] = ["broad", "helpful", "strong", "giveaway"];
const BAND_TARGETS: Readonly<Record<WhoAmIClueBand, number>> = {
  broad: 2,
  helpful: 3,
  strong: 3,
  giveaway: 2,
};

function shuffled<T>(values: readonly T[], random: () => number) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!];
  }
  return copy;
}

export function whoAmIProgressiveClues(clues: readonly WhoAmIClue[], random: () => number = Math.random) {
  const selected: WhoAmIClue[] = [];
  const leftovers: WhoAmIClue[] = [];

  for (const band of BAND_ORDER) {
    const bandClues = shuffled(clues.filter((clue) => clue.band === band), random);
    selected.push(...bandClues.slice(0, BAND_TARGETS[band]));
    leftovers.push(...bandClues.slice(BAND_TARGETS[band]));
  }

  if (selected.length < WHO_AM_I_CLUE_LIMIT) {
    selected.push(...leftovers.slice(0, WHO_AM_I_CLUE_LIMIT - selected.length));
  }

  return selected.slice(0, WHO_AM_I_CLUE_LIMIT);
}

export function createWhoAmIRound(universe: WhoAmIUniverse, random: () => number = Math.random): WhoAmIRound {
  const eligible = universe.candidates.filter((candidate) => (
    whoAmIProgressiveClues(candidate.clues, () => 0.5).length >= WHO_AM_I_CLUE_LIMIT
  ));
  if (!eligible.length) throw new Error(`Who Am I has no eligible ${universe.league} subjects with ${WHO_AM_I_CLUE_LIMIT} clues.`);
  const hidden = eligible[Math.floor(random() * eligible.length)]!;
  const clues = whoAmIProgressiveClues(hidden.clues, random);
  if (clues.length !== WHO_AM_I_CLUE_LIMIT) throw new Error(`Who Am I generated ${clues.length} clues; expected ${WHO_AM_I_CLUE_LIMIT}.`);
  return {
    sport: universe.sport,
    league: universe.league,
    subjects: eligible.map(({ id, name, kind }) => ({ id, name, kind })),
    hiddenSubject: { id: hidden.id, name: hidden.name, kind: hidden.kind },
    clues,
  };
}

export function whoAmIBaseScore(revealedClueCount: number) {
  const window = Math.min(
    WHO_AM_I_WINDOW_SCORES.length - 1,
    Math.max(0, Math.ceil(revealedClueCount / WHO_AM_I_CLUES_PER_REVEAL) - 1),
  );
  return WHO_AM_I_WINDOW_SCORES[window]!;
}

export function whoAmIScore(revealedClueCount: number, wrongGuesses: number) {
  return Math.max(0, whoAmIBaseScore(revealedClueCount) - wrongGuesses * WHO_AM_I_WRONG_GUESS_PENALTY);
}
