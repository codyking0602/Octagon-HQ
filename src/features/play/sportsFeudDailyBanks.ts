import type {
  FamilyFeudEntity,
  FamilyFeudEntityKind,
  FamilyFeudPack,
  FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import { CFB_SPORTS_FEUD_MAIN } from "./cfbSportsFeudMain";
import { CFB_SPORTS_FEUD_FAST_1 } from "./cfbSportsFeudFast1";
import { CFB_SPORTS_FEUD_FAST_2 } from "./cfbSportsFeudFast2";
import { CFB_SPORTS_FEUD_FAST_3 } from "./cfbSportsFeudFast3";
import { CFB_SPORTS_FEUD_FAST_4 } from "./cfbSportsFeudFast4";
import { CFB_SPORTS_FEUD_FAST_5 } from "./cfbSportsFeudFast5";
import { NFL_SPORTS_FEUD_MAIN } from "./nflSportsFeudMain";
import { NFL_SPORTS_FEUD_FAST_1 } from "./nflSportsFeudFast1";
import { NFL_SPORTS_FEUD_FAST_2 } from "./nflSportsFeudFast2";
import { NFL_SPORTS_FEUD_FAST_3 } from "./nflSportsFeudFast3";
import { NFL_SPORTS_FEUD_FAST_4 } from "./nflSportsFeudFast4";
import { NFL_SPORTS_FEUD_FAST_5 } from "./nflSportsFeudFast5";
import { UFC_SPORTS_FEUD_MAIN } from "./ufcSportsFeudMain";
import { UFC_SPORTS_FEUD_FAST_1 } from "./ufcSportsFeudFast1";
import { UFC_SPORTS_FEUD_FAST_2 } from "./ufcSportsFeudFast2";
import { UFC_SPORTS_FEUD_FAST_3 } from "./ufcSportsFeudFast3";
import { UFC_SPORTS_FEUD_FAST_4 } from "./ufcSportsFeudFast4";
import { UFC_SPORTS_FEUD_FAST_5 } from "./ufcSportsFeudFast5";
import { UFC_SPORTS_FEUD_SEP24_PROTOTYPE } from "./ufcSportsFeudSep24Prototype";
import type {
  SportsFeudAuthoredAnswer,
  SportsFeudAuthoredQuestion,
  SportsFeudBankDomain,
} from "./sportsFeudBankTypes";

export const SPORTS_FEUD_BANK_VERSION = "sports-feud-bank-v1" as const;
export const SPORTS_FEUD_HISTORICAL_LAUNCH_DAY = "2026-09-23" as const;
export const SPORTS_FEUD_WEIGHTED_LAUNCH_DAY = "2026-09-24" as const;
export const UFC_SPORTS_FEUD_CYCLE_LENGTH = 30;
export const UFC_SPORTS_FEUD_SLOTS = [0, 8, 16, 24] as const;
export const FOOTBALL_SPORTS_FEUD_CYCLE_LENGTH = 26;
export const FOOTBALL_SPORTS_FEUD_SLOTS = [1, 6, 12, 20] as const;

const MAIN_POINTS = [10, 8, 7, 5, 5, 4, 4, 3] as const;
const FAST_POINTS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

const CFB_FAST = [
  ...CFB_SPORTS_FEUD_FAST_1,
  ...CFB_SPORTS_FEUD_FAST_2,
  ...CFB_SPORTS_FEUD_FAST_3,
  ...CFB_SPORTS_FEUD_FAST_4,
  ...CFB_SPORTS_FEUD_FAST_5,
] as const;
const NFL_FAST = [
  ...NFL_SPORTS_FEUD_FAST_1,
  ...NFL_SPORTS_FEUD_FAST_2,
  ...NFL_SPORTS_FEUD_FAST_3,
  ...NFL_SPORTS_FEUD_FAST_4,
  ...NFL_SPORTS_FEUD_FAST_5,
] as const;
const UFC_FAST = [
  ...UFC_SPORTS_FEUD_FAST_1,
  ...UFC_SPORTS_FEUD_FAST_2,
  ...UFC_SPORTS_FEUD_FAST_3,
  ...UFC_SPORTS_FEUD_FAST_4,
  ...UFC_SPORTS_FEUD_FAST_5,
] as const;

const BANKS = {
  cfb: { main: CFB_SPORTS_FEUD_MAIN, fast: CFB_FAST },
  nfl: { main: NFL_SPORTS_FEUD_MAIN, fast: NFL_FAST },
  ufc: { main: UFC_SPORTS_FEUD_MAIN, fast: UFC_FAST },
} as const;

function dayNumber(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Sports Feud day must use YYYY-MM-DD.");
  const [year, month, date] = day.split("-").map(Number);
  const stamp = Date.UTC(year!, month! - 1, date!);
  if (new Date(stamp).toISOString().slice(0, 10) !== day) throw new Error("Sports Feud day is invalid.");
  return Math.floor(stamp / 86_400_000);
}

function mod(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function unique<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function aliasIndex(domain: SportsFeudBankDomain) {
  const map = new Map<string, string[]>();
  for (const question of BANKS[domain].fast) {
    for (const answer of [...question.answers, ...(question.alsoAcceptedAnswers ?? [])]) {
      const aliases = answer.aliases ?? [];
      if (!aliases.length) continue;
      map.set(answer.name, unique([...(map.get(answer.name) ?? []), ...aliases]));
    }
  }
  return map;
}

const ALIAS_INDEX = {
  cfb: aliasIndex("cfb"),
  nfl: aliasIndex("nfl"),
  ufc: aliasIndex("ufc"),
};

function automaticAliases(name: string) {
  const aliases: string[] = [];
  if (name.includes(" over ")) {
    const [winner, loser] = name.split(" over ", 2);
    aliases.push(winner!, `${winner} vs ${loser}`, `${loser} vs ${winner}`);
  } else if (name.includes("-") && !/^\d{4}/.test(name) && !name.startsWith("UFC ")) {
    const [left, right] = name.split("-", 2);
    if (left && right && /[A-Z]/.test(left) && /[A-Z]/.test(right)) {
      aliases.push(`${right}-${left}`, `${left} vs ${right}`, `${right} vs ${left}`);
    }
  }
  return aliases;
}

function questionOffset(domain: SportsFeudBankDomain, salt: string) {
  return stableHash(`${SPORTS_FEUD_BANK_VERSION}|${domain}|${salt}`);
}

function selectMain(domain: SportsFeudBankDomain, day: string) {
  const source = BANKS[domain].main;
  if (source.length !== 100) throw new Error(`${domain.toUpperCase()} Sports Feud needs 100 main boards.`);
  const base = mod(dayNumber(day) * 7 + questionOffset(domain, "main"), source.length);
  const first = source[base]!;
  let cursor = mod(base + 37, source.length);
  for (let scanned = 0; scanned < source.length; scanned += 1) {
    const candidate = source[cursor]!;
    if (candidate.id !== first.id && candidate.category !== first.category) return [first, candidate] as const;
    cursor = mod(cursor + 37, source.length);
  }
  throw new Error("Sports Feud could not select two distinct main boards.");
}

function selectFast(
  domain: SportsFeudBankDomain,
  day: string,
  excludedQuestions: readonly SportsFeudAuthoredQuestion[] = [],
) {
  const source = BANKS[domain].fast;
  if (source.length !== 250) throw new Error(`${domain.toUpperCase()} Sports Feud needs 250 Fast Money prompts.`);
  const base = mod(dayNumber(day) * 11 + questionOffset(domain, "fast"), source.length);
  const selected: SportsFeudAuthoredQuestion[] = [];
  const groups = new Set<string>();
  const excludedGroups = new Set(excludedQuestions.map((question) => question.collisionGroup ?? question.category));
  const excludedPrompts = new Set(excludedQuestions.map((question) => question.prompt));
  let cursor = base;
  for (let scanned = 0; scanned < source.length && selected.length < 5; scanned += 1) {
    const candidate = source[cursor]!;
    const group = candidate.collisionGroup ?? candidate.category;
    if (!groups.has(group) && !excludedGroups.has(group) && !excludedPrompts.has(candidate.prompt)) {
      selected.push(candidate);
      groups.add(group);
    }
    cursor = mod(cursor + 47, source.length);
  }
  if (selected.length !== 5) throw new Error("Sports Feud could not select five varied Fast Money prompts.");
  return selected;
}

function answerAliases(domain: SportsFeudBankDomain, answer: SportsFeudAuthoredAnswer) {
  return unique([
    ...(answer.aliases ?? []),
    ...(ALIAS_INDEX[domain].get(answer.name) ?? []),
    ...automaticAliases(answer.name),
  ]).filter((alias) => alias.trim() && alias !== answer.name);
}

export interface SportsFeudCurrentEntityMetadata {
  kind: FamilyFeudEntityKind;
  aliases: readonly string[];
}

const CURRENT_QUESTION_INDEX = new Map<
  string,
  { domain: SportsFeudBankDomain; question: SportsFeudAuthoredQuestion }
>();

for (const domain of ["cfb", "nfl", "ufc"] as const) {
  for (const question of [...BANKS[domain].main, ...BANKS[domain].fast]) {
    CURRENT_QUESTION_INDEX.set(question.id, { domain, question });
  }
}
for (const question of [
  ...UFC_SPORTS_FEUD_SEP24_PROTOTYPE.main,
  ...UFC_SPORTS_FEUD_SEP24_PROTOTYPE.fastMoney,
]) {
  CURRENT_QUESTION_INDEX.set(question.id, { domain: "ufc", question });
}

export function sportsFeudCurrentEntityMetadata(
  entityId: string,
  displayName: string,
): SportsFeudCurrentEntityMetadata | null {
  const separator = entityId.lastIndexOf(":");
  if (separator <= 0) return null;

  const questionId = entityId.slice(0, separator);
  const current = CURRENT_QUESTION_INDEX.get(questionId);
  if (!current) return null;

  const normalizedName = displayName.trim().toLowerCase();
  const answer = [
    ...current.question.answers,
    ...(current.question.alsoAcceptedAnswers ?? []),
  ].find((candidate) => candidate.name.trim().toLowerCase() === normalizedName);
  if (!answer) return null;

  return {
    kind: current.question.entityKind,
    aliases: answerAliases(current.domain, answer),
  };
}

function materializeQuestion(
  domain: SportsFeudBankDomain,
  question: SportsFeudAuthoredQuestion,
  points: readonly number[],
  entities: FamilyFeudEntity[],
): FamilyFeudQuestion {
  const rankedNames = new Set(question.answers.map((answer) => answer.name.trim().toLowerCase()));
  const answers = question.answers.map((answer, index) => {
    const entityId = `${question.id}:a${index + 1}`;
    entities.push({
      id: entityId,
      displayName: answer.name,
      kind: question.entityKind,
      aliases: answerAliases(domain, answer),
    });
    return { entityId, points: points[index] ?? 1 };
  });
  const alsoAcceptedEntityIds = (question.alsoAcceptedAnswers ?? []).map((answer, index) => {
    if (rankedNames.has(answer.name.trim().toLowerCase())) {
      throw new Error(`Sports Feud valid off-board answer ${answer.name} duplicates a ranked answer for ${question.id}.`);
    }
    const entityId = `${question.id}:v${index + 1}`;
    entities.push({
      id: entityId,
      displayName: answer.name,
      kind: question.entityKind,
      aliases: answerAliases(domain, answer),
    });
    return entityId;
  });
  return {
    id: question.id,
    prompt: question.prompt,
    candidateIds: [...answers.map((answer) => answer.entityId), ...alsoAcceptedEntityIds],
    answers,
    ...(alsoAcceptedEntityIds.length ? { alsoAcceptedEntityIds } : {}),
  };
}

function weightedAppearanceCountThroughDay(
  day: string,
  cycleLength: number,
  slots: readonly number[],
) {
  const offset = dayNumber(day) - dayNumber(SPORTS_FEUD_WEIGHTED_LAUNCH_DAY);
  if (offset < 0) return 0;
  const completedCycles = Math.floor(offset / cycleLength);
  const dayInCycle = mod(offset, cycleLength);
  const appearancesThisCycle = slots.filter((slot) => slot <= dayInCycle).length;
  return completedCycles * slots.length + appearancesThisCycle;
}

function historicalLaunchAppearanceCount(day: string) {
  return dayNumber(day) >= dayNumber(SPORTS_FEUD_HISTORICAL_LAUNCH_DAY) ? 1 : 0;
}

export function ufcSportsFeudAppearanceCountThroughDay(day: string) {
  return historicalLaunchAppearanceCount(day)
    + weightedAppearanceCountThroughDay(day, UFC_SPORTS_FEUD_CYCLE_LENGTH, UFC_SPORTS_FEUD_SLOTS);
}

export function footballSportsFeudAppearanceCountThroughDay(day: string) {
  return historicalLaunchAppearanceCount(day)
    + weightedAppearanceCountThroughDay(day, FOOTBALL_SPORTS_FEUD_CYCLE_LENGTH, FOOTBALL_SPORTS_FEUD_SLOTS);
}

export function footballSportsFeudDomainForDay(day: string): "cfb" | "nfl" {
  const appearances = footballSportsFeudAppearanceCountThroughDay(day);
  if (appearances <= 0) return "cfb";
  return (appearances - 1) % 2 === 0 ? "cfb" : "nfl";
}

export function buildSportsFeudPack(
  domain: SportsFeudBankDomain,
  day: string,
): FamilyFeudPack {
  const entities: FamilyFeudEntity[] = [];
  const useSep24UfcPrototype = domain === "ufc" && day === "2026-09-24";
  const authoredMain = useSep24UfcPrototype
    ? UFC_SPORTS_FEUD_SEP24_PROTOTYPE.main
    : selectMain(domain, day);
  const authoredFast = useSep24UfcPrototype
    ? UFC_SPORTS_FEUD_SEP24_PROTOTYPE.fastMoney
    : selectFast(domain, day, authoredMain);
  const main = authoredMain.map((question) =>
    materializeQuestion(domain, question, MAIN_POINTS, entities));
  const fast = authoredFast.map((question) =>
    materializeQuestion(domain, question, FAST_POINTS, entities));
  return {
    id: `${SPORTS_FEUD_BANK_VERSION}-${domain}-${day}-${main.map((q) => q.id).join("-")}`,
    sport: domain === "ufc" ? "ufc" : "football",
    entities,
    mainBoards: main,
    fastMoney: fast,
  };
}

export function sportsFeudQuestionIdsForDay(domain: SportsFeudBankDomain, day: string) {
  const pack = buildSportsFeudPack(domain, day);
  return {
    main: pack.mainBoards.map((question) => question.id),
    fastMoney: pack.fastMoney.map((question) => question.id),
  };
}
