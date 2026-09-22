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
import type {
  SportsFeudAuthoredAnswer,
  SportsFeudAuthoredQuestion,
  SportsFeudBankDomain,
} from "./sportsFeudBankTypes";

export const SPORTS_FEUD_BANK_VERSION = "sports-feud-bank-v1" as const;
export const FOOTBALL_SPORTS_FEUD_LAUNCH_DAY = "2026-09-22" as const;
export const FOOTBALL_SPORTS_FEUD_CYCLE_LENGTH = 26;
export const FOOTBALL_SPORTS_FEUD_SLOTS = [0, 8, 15, 22] as const;

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
    for (const answer of question.answers) {
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

function entityKind(question: SportsFeudAuthoredQuestion): FamilyFeudEntityKind {
  const prompt = question.prompt.toLowerCase();
  if (/\b(fight|rivalry|team|program|school|franchise|stadium|venue|city|country|award|record|stat|position|route|coverage|formation|play|technique|submission|takedown|kick|elbow|weight class|division|something|trait|way|type|style matchup|gym|event)\b/.test(prompt)) {
    return "other";
  }
  if (/\b(fighter|player|quarterback|running back|receiver|wide receiver|linebacker|defensive back|pass rusher|tight end|kicker|offensive lineman|coach|defender|rookie|return man|woman|champion)\b/.test(prompt)) {
    return "person";
  }
  return "other";
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

function materializeQuestion(
  domain: SportsFeudBankDomain,
  question: SportsFeudAuthoredQuestion,
  points: readonly number[],
  entities: FamilyFeudEntity[],
): FamilyFeudQuestion {
  const kind = entityKind(question);
  const answers = question.answers.map((answer, index) => {
    const entityId = `${question.id}:a${index + 1}`;
    entities.push({
      id: entityId,
      displayName: answer.name,
      kind,
      aliases: answerAliases(domain, answer),
    });
    return { entityId, points: points[index] ?? 1 };
  });
  return {
    id: question.id,
    prompt: question.prompt,
    candidateIds: answers.map((answer) => answer.entityId),
    answers,
  };
}

export function footballSportsFeudDomainForDay(day: string): "cfb" | "nfl" {
  const offset = dayNumber(day) - dayNumber(FOOTBALL_SPORTS_FEUD_LAUNCH_DAY);
  if (offset < 0) return "cfb";
  const cycle = Math.floor(offset / FOOTBALL_SPORTS_FEUD_CYCLE_LENGTH);
  const slot = mod(offset, FOOTBALL_SPORTS_FEUD_CYCLE_LENGTH);
  const slotIndex = FOOTBALL_SPORTS_FEUD_SLOTS.indexOf(slot as typeof FOOTBALL_SPORTS_FEUD_SLOTS[number]);
  if (slotIndex < 0) {
    return mod(offset, 2) === 0 ? "cfb" : "nfl";
  }
  const appearance = cycle * FOOTBALL_SPORTS_FEUD_SLOTS.length + slotIndex;
  return appearance % 2 === 0 ? "cfb" : "nfl";
}

export function buildSportsFeudPack(
  domain: SportsFeudBankDomain,
  day: string,
): FamilyFeudPack {
  const entities: FamilyFeudEntity[] = [];
  const main = selectMain(domain, day).map((question) =>
    materializeQuestion(domain, question, MAIN_POINTS, entities));
  const fast = selectFast(domain, day, main).map((question) =>
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
