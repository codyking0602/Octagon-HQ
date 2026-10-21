import { MILLIONAIRE_CHOICE_IDS, MILLIONAIRE_LEVELS, MILLIONAIRE_MONEY_BY_LEVEL, type MillionaireChoiceId, type MillionaireRuntimeQuestion } from "../games/millionaireAuthority";
import type { MillionaireRun } from "../games/millionaireEngine";
import { millionaireCentralDateKey } from "../play/MillionaireCasualModel";
import { nbaMillionaireEarly } from "./nbaMillionaireEarly";
import { nbaMillionaireQ3 } from "./nbaMillionaireQ3";
import { nbaMillionaireQ4 } from "./nbaMillionaireQ4";
import { nbaMillionaireQ5 } from "./nbaMillionaireQ5";
import { nbaMillionaireQ6 } from "./nbaMillionaireQ6";
import { nbaMillionaireQ7 } from "./nbaMillionaireQ7";
import { nbaMillionaireQ8 } from "./nbaMillionaireQ8";

/** Source pages list the season-by-season winner, champion or selection named in the question. */
export const NBA_MILLIONAIRE_SOURCES = {
  mvp: "https://www.nba.com/news/history-mvp-award-winners",
  finals: "https://www.nba.com/news/history-finals-mvp-winners",
  champ: "https://www.nba.com/news/history-nba-champions",
  draft: "https://www.nba.com/news/history-draft",
  dpoy: "https://www.nba.com/news/history-defensive-player-of-the-year-winners",
  rookie: "https://www.nba.com/news/history-rookie-of-the-year-winners",
  sixth: "https://www.nba.com/news/history-sixth-man-of-the-year-winners",
  history: "https://www.nba.com/history",
} as const;

type NbaSource = keyof typeof NBA_MILLIONAIRE_SOURCES;
export type NbaMillionaireFact = {
  id: string;
  prompt: string;
  answer: string;
  distractors: readonly [string, string, string];
  explanation: string;
  category: string;
  era: string;
  source: NbaSource;
};

const rawBank: readonly (readonly string[])[] = [
  nbaMillionaireEarly[0],
  nbaMillionaireEarly[1],
  nbaMillionaireQ3,
  nbaMillionaireQ4,
  nbaMillionaireQ5,
  nbaMillionaireQ6,
  nbaMillionaireQ7,
  nbaMillionaireQ8,
];

function parseFact(line: string, level: number, index: number): NbaMillionaireFact {
  const fields = line.split("|");
  if (fields.length !== 9) throw new Error(`Invalid NBA Millionaire bank row Q${level + 1} #${index + 1}`);
  const [prompt, answer, wrong1, wrong2, wrong3, explanation, category, era, source] = fields;
  if (!prompt || !answer || !wrong1 || !wrong2 || !wrong3 || !explanation || !category || !era || !source ||
      !(source in NBA_MILLIONAIRE_SOURCES) || new Set([answer, wrong1, wrong2, wrong3]).size !== 4) {
    throw new Error(`Invalid NBA Millionaire options/metadata Q${level + 1} #${index + 1}`);
  }
  return {
    id: `nba-millionaire-q${level + 1}-${String(index + 1).padStart(2, "0")}`,
    prompt, answer,
    distractors: [wrong1, wrong2, wrong3],
    explanation, category, era, source: source as NbaSource,
  };
}

/** 30 independently curated prompts per level. No free-form generated facts at runtime. */
export const NBA_MILLIONAIRE_QUESTION_BANK: readonly (readonly NbaMillionaireFact[])[] =
  rawBank.map((lines, level) => {
    if (lines.length !== 30) throw new Error(`NBA Millionaire Q${level + 1} must contain 30 questions; got ${lines.length}`);
    return lines.map((line, index) => parseFact(line, level, index));
  });

function stringSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toRuntime(fact: NbaMillionaireFact, levelIndex: number, random: () => number): MillionaireRuntimeQuestion {
  const level = MILLIONAIRE_LEVELS[levelIndex]!;
  const shuffled = [fact.answer, ...fact.distractors].map((text) => ({ text, sort: random() })).sort((a, b) => a.sort - b.sort);
  const choices = shuffled.map((row, index) => ({ id: MILLIONAIRE_CHOICE_IDS[index]!, text: row.text })) as MillionaireRuntimeQuestion["choices"];
  const correctChoiceId = choices.find((choice) => choice.text === fact.answer)!.id;
  const wrongIds = choices.filter((choice) => choice.id !== correctChoiceId).map((choice) => choice.id);
  const survivor = wrongIds[Math.floor(random() * wrongIds.length)]!;
  const survivors = MILLIONAIRE_CHOICE_IDS.filter((id) => id === correctChoiceId || id === survivor) as [MillionaireChoiceId, MillionaireChoiceId];
  const removals = MILLIONAIRE_CHOICE_IDS.filter((id) => !survivors.includes(id)) as [MillionaireChoiceId, MillionaireChoiceId];
  const finalQuestion = level === "Q8";
  const extraHint = fact.distractors[Math.floor(random() * fact.distractors.length)]!;
  return {
    id: fact.id, sport: "nba", level, money: MILLIONAIRE_MONEY_BY_LEVEL[level],
    type: fact.category, prompt: fact.prompt, choices, correctChoiceId,
    explanation: fact.explanation,
    statSheet: finalQuestion ? null : `NBA HISTORY FILE · ${fact.era}. ${extraHint} is not the correct answer.`,
    fiftyFifty: { survivorChoiceIds: survivors, removalChoiceIds: removals },
    lifelineCompatibility: { fiftyFifty: !finalQuestion, statSheet: !finalQuestion, doubleDip: !finalQuestion },
  };
}

/** Pure: equal seeds make equal boards; recent casual IDs are excluded when possible. */
export function createNbaMillionaireRun(seed: string, recentIds: readonly string[] = []): MillionaireRun {
  const random = createRandom(stringSeed(`nba-millionaire-v1:${seed}`));
  const recent = new Set(recentIds);
  const chosen: NbaMillionaireFact[] = [];
  for (const level of NBA_MILLIONAIRE_QUESTION_BANK) {
    const ranked = level.map((fact) => {
      const alreadySeen = recent.has(fact.id) ? 1000 : 0;
      const sameAnswer = chosen.some((other) => other.answer === fact.answer) ? 80 : 0;
      const categoryRepetition = chosen.filter((other) => other.category === fact.category).length * 14;
      const eraRepetition = chosen.filter((other) => other.era === fact.era).length * 8;
      return { fact, rank: alreadySeen + sameAnswer + categoryRepetition + eraRepetition + random() * 25 };
    });
    ranked.sort((a, b) => a.rank - b.rank);
    chosen.push(ranked[0]!.fact);
  }
  return chosen.map((fact, index) => toRuntime(fact, index, random)) as unknown as MillionaireRun;
}

const HISTORY_KEY = "octagon-nba-millionaire-casual-v1";
type RunHistory = { serial: number; ids: string[] };
function readHistory(): RunHistory {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "null") as RunHistory | null;
    if (typeof parsed?.serial === "number" && Array.isArray(parsed.ids)) {
      return { serial: parsed.serial, ids: parsed.ids.filter((id): id is string => typeof id === "string").slice(0, 160) };
    }
  } catch { /* Private browsing and storage-disabled environments remain playable. */ }
  return { serial: 0, ids: [] };
}
export function nextNbaMillionaireCasualRun(): MillionaireRun {
  const old = readHistory();
  const serial = old.serial + 1;
  const run = createNbaMillionaireRun(`casual-${serial}-${Date.now()}`, old.ids);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify({ serial, ids: [...run.map((q) => q.id), ...old.ids].slice(0, 160) }));
  } catch { /* No persistence required to play. */ }
  return run;
}
export function nbaMillionaireDailyPreviewRun(dateKey = millionaireCentralDateKey()): MillionaireRun {
  return createNbaMillionaireRun(`daily-${dateKey}`);
}
