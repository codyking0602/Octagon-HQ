import { planUfcFeudV2Appearance } from "./ufcSportsFeudV2FutureSelection";
import {
  UFC_V2_APPROVED_MAIN_IDS, UFC_V2_APPROVED_FAST_IDS,
  UFC_V2_NEW_MAIN_DRAFTS, UFC_V2_NEW_FAST_DRAFTS,
  ufcFeudAppearanceDatesInWindow, ufcFeudSixMonthReleaseReadiness,
} from "./ufcSportsFeudV2EditorialReleaseGate";
import { UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT, UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT }
  from "./ufcSportsFeudV2RetainedDraft";
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
import { NFL_FEUD_REBUILD_CANDIDATES, CFB_FEUD_REBUILD_CANDIDATES } from "./footballSportsFeudRebuildCandidates";
import { footballFeudRebuildQuestionsForAppearance } from "./footballSportsFeudRebuildRotation";
import { FOOTBALL_APPROVED_WEIGHTED_CYCLE, FOOTBALL_TWO_GAME_CUTOVER_DAY, lockedWeightedGameForDay } from "./dailyChallengeRotation";
import { OCT19_NFL_SPORTS_FEUD_MAIN, OCT19_NFL_SPORTS_FEUD_FAST } from "./oct19NflSportsFeudQuality";
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
import {
  FOOTBALL_THEMED_SPORTS_FEUD_QUESTIONS,
  footballThemedSportsFeudPackForDay,
} from "./footballTeamThemeDailyPacks";

export const SPORTS_FEUD_BANK_VERSION = "sports-feud-bank-v1" as const;
export const SPORTS_FEUD_HISTORICAL_LAUNCH_DAY = "2026-09-23" as const;
export const SPORTS_FEUD_WEIGHTED_LAUNCH_DAY = "2026-09-24" as const;
export const SPORTS_FEUD_BAR_TRIVIA_LAUNCH_DAY = "2026-09-29" as const;
export const PRE_BAR_TRIVIA_SPORTS_FEUD_APPEARANCES = 2;
export const UFC_SPORTS_FEUD_CYCLE_LENGTH = 30;
export const UFC_SPORTS_FEUD_SLOTS = [0, 8, 16, 24] as const;
export const FOOTBALL_SPORTS_FEUD_CYCLE_LENGTH = 26;
export const FOOTBALL_SPORTS_FEUD_SLOTS = [1, 6, 12, 20] as const;
export const UFC_BAR_TRIVIA_SPORTS_FEUD_CYCLE_LENGTH = 24;
export const UFC_BAR_TRIVIA_SPORTS_FEUD_SLOTS = [1, 7, 13, 19] as const;
export const FOOTBALL_BAR_TRIVIA_SPORTS_FEUD_CYCLE_LENGTH = 22;
export const FOOTBALL_BAR_TRIVIA_SPORTS_FEUD_SLOTS = [2, 8, 12, 18] as const;

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

function scopedAliasIndex(domain: SportsFeudBankDomain) {
  const map = new Map<string, string[]>();
  for (const question of [...BANKS[domain].main, ...BANKS[domain].fast]) {
    const group = question.collisionGroup ?? question.category;
    for (const answer of [...question.answers, ...(question.alsoAcceptedAnswers ?? [])]) {
      const aliases = answer.aliases ?? [];
      if (!aliases.length) continue;
      const key = `${group}|${answer.name}`;
      map.set(key, unique([...(map.get(key) ?? []), ...aliases]));
    }
  }
  return map;
}

const SCOPED_ALIAS_INDEX = {
  cfb: scopedAliasIndex("cfb"),
  nfl: scopedAliasIndex("nfl"),
  ufc: scopedAliasIndex("ufc"),
};

const CFB_RIVALRY_SHORTHAND: Readonly<Record<string, readonly string[]>> = {
  "Ohio State": ["OSU", "Ohio St"],
  Alabama: ["Bama"],
  Texas: ["UT"],
  Oklahoma: ["OU"],
  USC: ["Southern Cal"],
  "Notre Dame": ["ND"],
  Florida: ["UF"],
  Georgia: ["UGA"],
  "Florida State": ["FSU"],
  Miami: ["The U"],
  Oregon: ["UO"],
  Washington: ["UW"],
  "Michigan State": ["MSU"],
  BYU: ["BYU"],
  "Washington State": ["WSU"],
};

function automaticAliases(name: string, domain?: SportsFeudBankDomain) {
  const aliases: string[] = [];
  if (name.includes(" over ")) {
    const [winner, loser] = name.split(" over ", 2);
    aliases.push(winner!, `${winner} vs ${loser}`, `${loser} vs ${winner}`);
  } else if (name.includes("-") && !/^\d{4}/.test(name) && !name.startsWith("UFC ")) {
    const [left, right] = name.split("-", 2);
    if (left && right && /[A-Z]/.test(left) && /[A-Z]/.test(right)) {
      aliases.push(`${right}-${left}`, `${left} vs ${right}`, `${right} vs ${left}`);
      if (domain === "cfb") {
        const leftNames = [left, ...(CFB_RIVALRY_SHORTHAND[left] ?? [])];
        const rightNames = [right, ...(CFB_RIVALRY_SHORTHAND[right] ?? [])];
        for (const leftName of leftNames) {
          for (const rightName of rightNames) {
            aliases.push(
              `${leftName}-${rightName}`,
              `${rightName}-${leftName}`,
              `${leftName} vs ${rightName}`,
              `${rightName} vs ${leftName}`,
            );
          }
        }
      }
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

// Only these NFL defensive-trait boards should translate play descriptions
// into their canonical answer. Avoid broad aliases that change other games.
const NFL_DEFENSIVE_TRAIT_ALIASES: Readonly<Record<string, readonly string[]>> = {
  Turnovers: ["Force Turnovers", "Forced Turnovers", "Interception", "Interceptions", "Takeaway", "Takeaways"],
  Coverage: ["Pass Defense", "Pass Coverage", "Man Coverage", "Sticky Man Coverage"],
};

function answerAliases(
  domain: SportsFeudBankDomain,
  question: SportsFeudAuthoredQuestion,
  answer: SportsFeudAuthoredAnswer,
) {
  const group = question.collisionGroup ?? question.category;
  // V2 uses scoped editorial aliases. The unrelated V1 global Fast Money alias
  // map can otherwise make a different V2 answer ambiguous or falsely valid.
  if (domain === "ufc" && question.id.startsWith("ufc-v2-")) {
    return unique([...(answer.aliases ?? []), ...automaticAliases(answer.name,domain)])
      .filter(alias => alias.trim() && alias !== answer.name);
  }
  return unique([
    ...(answer.aliases ?? []),
    ...(ALIAS_INDEX[domain].get(answer.name) ?? []),
    ...(group === "rivalries"
      ? (SCOPED_ALIAS_INDEX[domain].get(`${group}|${answer.name}`) ?? [])
      : []),
    ...automaticAliases(answer.name, domain),
    ...(domain === "nfl" && group === "defense" ? (NFL_DEFENSIVE_TRAIT_ALIASES[answer.name] ?? []) : []),
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
for (const sport of ["nfl", "cfb"] as const) {
  const rebuilt = sport === "nfl" ? NFL_FEUD_REBUILD_CANDIDATES : CFB_FEUD_REBUILD_CANDIDATES;
  for (const question of [...rebuilt.main, ...rebuilt.fast]) {
    CURRENT_QUESTION_INDEX.set(question.id, { domain: sport, question });
  }
}
// Index the staged future UFC identities for immutable published-result grading.
for (const q of [...UFC_V2_NEW_MAIN_DRAFTS, ...UFC_V2_NEW_FAST_DRAFTS,
                 ...UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT, ...UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT]) {
  CURRENT_QUESTION_INDEX.set(q.id, {domain:"ufc",question:q});
}
for (const themed of FOOTBALL_THEMED_SPORTS_FEUD_QUESTIONS) {
  CURRENT_QUESTION_INDEX.set(themed.question.id, themed);
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
    aliases: answerAliases(current.domain, current.question, answer),
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
      aliases: answerAliases(domain, question, answer),
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
      aliases: answerAliases(domain, question, answer),
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
  anchor: string,
  cycleLength: number,
  slots: readonly number[],
) {
  const offset = dayNumber(day) - dayNumber(anchor);
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
  if (day >= SPORTS_FEUD_BAR_TRIVIA_LAUNCH_DAY) {
    return PRE_BAR_TRIVIA_SPORTS_FEUD_APPEARANCES
      + weightedAppearanceCountThroughDay(
        day,
        SPORTS_FEUD_BAR_TRIVIA_LAUNCH_DAY,
        UFC_BAR_TRIVIA_SPORTS_FEUD_CYCLE_LENGTH,
        UFC_BAR_TRIVIA_SPORTS_FEUD_SLOTS,
      );
  }
  return historicalLaunchAppearanceCount(day)
    + weightedAppearanceCountThroughDay(
      day,
      SPORTS_FEUD_WEIGHTED_LAUNCH_DAY,
      UFC_SPORTS_FEUD_CYCLE_LENGTH,
      UFC_SPORTS_FEUD_SLOTS,
    );
}

export function footballSportsFeudAppearanceCountThroughDay(day: string) {
  if (day >= SPORTS_FEUD_BAR_TRIVIA_LAUNCH_DAY) {
    return PRE_BAR_TRIVIA_SPORTS_FEUD_APPEARANCES
      + weightedAppearanceCountThroughDay(
        day,
        SPORTS_FEUD_BAR_TRIVIA_LAUNCH_DAY,
        FOOTBALL_BAR_TRIVIA_SPORTS_FEUD_CYCLE_LENGTH,
        FOOTBALL_BAR_TRIVIA_SPORTS_FEUD_SLOTS,
      );
  }
  return historicalLaunchAppearanceCount(day)
    + weightedAppearanceCountThroughDay(
      day,
      SPORTS_FEUD_WEIGHTED_LAUNCH_DAY,
      FOOTBALL_SPORTS_FEUD_CYCLE_LENGTH,
      FOOTBALL_SPORTS_FEUD_SLOTS,
    );
}

/**
 * V22 must count the ACTUAL future publication slots. The old 22-day
 * appearance counter is historical and drifts under the approved 28-day
 * schedule; using it for the editorial pack index recycled seven questions
 * on nearby dates. Never use this count for published pre-v22 boards.
 */
function approvedFootballFeudAppearanceIndex(day: string): number | null {
  if (day < FOOTBALL_TWO_GAME_CUTOVER_DAY || lockedWeightedGameForDay("football", day) !== "sports_feud") {
    return null;
  }
  const offset = dayNumber(day) - dayNumber(FOOTBALL_TWO_GAME_CUTOVER_DAY);
  const fullCycles = Math.floor(offset / FOOTBALL_APPROVED_WEIGHTED_CYCLE.length);
  const withinCycle = FOOTBALL_APPROVED_WEIGHTED_CYCLE.slice(0, offset % FOOTBALL_APPROVED_WEIGHTED_CYCLE.length + 1)
    .filter(game => game === "sports_feud").length;
  return fullCycles * FOOTBALL_APPROVED_WEIGHTED_CYCLE.filter(game => game === "sports_feud").length
    + withinCycle - 1;
}

export function footballSportsFeudDomainForDay(day: string): "cfb" | "nfl" {
  const approved = approvedFootballFeudAppearanceIndex(day);
  // Preserve Nov 27 Texas–A&M (fifth approved Feud) as CFB and alternate
  // NFL/CFB without legacy appearance-counter drift on future Daily dates.
  if (approved != null) return approved % 2 === 0 ? "cfb" : "nfl";
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
  const themedPack = footballThemedSportsFeudPackForDay(domain, day);
  const oct19Nfl = domain === "nfl" && day === "2026-10-19";
  const authoredMain = oct19Nfl
    ? OCT19_NFL_SPORTS_FEUD_MAIN
    : themedPack
      ? themedPack.main
    : useSep24UfcPrototype
      ? UFC_SPORTS_FEUD_SEP24_PROTOTYPE.main
      : domain === "ufc" && day === "2026-10-10"
        // Keep today's opening personality board and five Fast Money prompts,
        // but replace the ambiguous classic-fights second board with finishes.
        ? [selectMain(domain, day)[0]!, UFC_SPORTS_FEUD_MAIN.find((q) => q.id === "ufc-main-19-1")!]
        : selectMain(domain, day);
  const authoredFast = oct19Nfl
    ? ["nfl-fast4-10-5", "nfl-fast5-10-2", "nfl-fast1-09-4",
       "nfl-fast2-09-1", "nfl-fast3-08-3"].map((id) => {
        const original = NFL_FAST.find((question) => question.id === id);
        if (!original) throw new Error("Missing locked Oct 19 NFL Fast Money question " + id);
        const patch = OCT19_NFL_SPORTS_FEUD_FAST[id];
        return patch
          ? {
              ...original,
              prompt: patch.prompt,
              alsoAcceptedAnswers: [
                ...(original.alsoAcceptedAnswers ?? []),
                ...patch.additionalAccepted.map((name) => ({ name,
                  aliases: id === "nfl-fast5-10-2" ? [name.split(" ").at(-1)!] : [],
                })),
              ],
            }
          : original;
      })
    : themedPack
      ? themedPack.fastMoney
      : useSep24UfcPrototype
        ? UFC_SPORTS_FEUD_SEP24_PROTOTYPE.fastMoney
        : selectFast(domain, day, authoredMain);
  const main = authoredMain.map((question) =>
    materializeQuestion(domain, question, MAIN_POINTS, entities));
  const fast = authoredFast.map((question) =>
    materializeQuestion(domain, question, FAST_POINTS, entities));
  if (oct19Nfl) {
    // Preserve all previously ranked Raiders' scores: move Maxx into the
    // five-point slot alongside Tim Brown, and retain Gene Upshaw at one point
    // as an off-board accepted answer. Entity IDs remain stable for regrades.
    const raiders = fast[3]!;
    const maxx = entities.find((e) => e.id.startsWith("nfl-fast2-09-1:") && e.displayName === "Maxx Crosby")?.id;
    const gene = entities.find((e) => e.id.startsWith("nfl-fast2-09-1:") && e.displayName === "Gene Upshaw")?.id;
    if (!maxx || !gene || raiders.answers[7]?.entityId !== gene ||
        !raiders.alsoAcceptedEntityIds?.includes(maxx)) {
      throw new Error("Oct 19 Raiders Fast Money identities changed before editorial regrade.");
    }
    raiders.answers = [
      ...raiders.answers.slice(0, 4),
      { entityId: maxx, points: 5 },
      ...raiders.answers.slice(4, 7),
    ];
    raiders.alsoAcceptedEntityIds = [
      ...raiders.alsoAcceptedEntityIds.filter((id) => id !== maxx), gene,
    ];
  }
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

/**
 * Versioned Football-only Daily cutover. Historical v1 packs and the UFC
 * selection code are immutable; the new Daily uses distinct candidate IDs.
 * Published daily setups embed the full answer universe for server grading.
 */
export const FOOTBALL_FEUD_REBUILD_CUTOVER_DAY = "2026-10-29" as const;

export function buildFootballFeudRebuildPack(
  domain: "nfl" | "cfb",
  day: string,
): FamilyFeudPack {
  if (day < FOOTBALL_FEUD_REBUILD_CUTOVER_DAY) {
    return buildSportsFeudPack(domain, day);
  }
  if (footballThemedSportsFeudPackForDay(domain, day)) {
    return buildSportsFeudPack(domain, day);
  }
  const approved = approvedFootballFeudAppearanceIndex(day);
  const count = footballSportsFeudAppearanceCountThroughDay(day);
  // V22 appearance ordinals follow the 28-slot schedule, not the now-obsolete
  // 22-day legacy counter. Keep the legacy fallback for old caller/replay paths.
  const index = approved != null ? Math.floor(approved / 2)
    : Math.max(0, Math.floor((count - (domain === "nfl" ? 8 : 9)) / 2));
  const chosen = footballFeudRebuildQuestionsForAppearance(domain, index);
  const entities: FamilyFeudEntity[] = [];
  const main = chosen.main.map((question) => materializeQuestion(domain, question, MAIN_POINTS, entities));
  const fastMoney = chosen.fast.map((question) => materializeQuestion(domain, question, FAST_POINTS, entities));
  return {
    id: `sports-feud-bank-r2-${domain}-${day}-${main.map(q => q.id).join("-")}`,
    sport: "football",
    entities,
    mainBoards: main,
    fastMoney,
  };
}

/**
 * UFC-only, future-only Daily cutover. This does not alter any previous packs,
 * Casual Feud, NFL/CFB, or cached server-published setup evidence.
 * A zero-approved editorial bank deliberately falls back to existing V1.
 */
export const UFC_FEUD_V2_DAILY_CUTOVER_DAY = "2026-11-04" as const;
export function buildUfcFeudV2DailyPack(day:string):FamilyFeudPack {
  if (day < UFC_FEUD_V2_DAILY_CUTOVER_DAY) return buildSportsFeudPack("ufc",day);
  const readiness=ufcFeudSixMonthReleaseReadiness();
  if (!readiness.ready) return buildSportsFeudPack("ufc",day);
  // The actual UFC weighted Daily calendar, not obsolete pre-October slots,
  // determines the canonical appearance ordinal shared by every player.
  const until=new Date(Date.parse(day+"T00:00:00Z")+86400000).toISOString().slice(0,10);
  const appearances=ufcFeudAppearanceDatesInWindow(UFC_FEUD_V2_DAILY_CUTOVER_DAY,until);
  if (appearances.at(-1)!==day) throw new Error("UFC Feud V2 only publishes on a canonical Feud Daily date");
  const mainCandidates=[...UFC_V2_NEW_MAIN_DRAFTS,...UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT]
    .filter(q=>UFC_V2_APPROVED_MAIN_IDS.has(q.id));
  const fastCandidates=[...UFC_V2_NEW_FAST_DRAFTS,...UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT]
    .filter(q=>UFC_V2_APPROVED_FAST_IDS.has(q.id));
  const selected=planUfcFeudV2Appearance(mainCandidates,fastCandidates,appearances.length-1);
  const entities:FamilyFeudEntity[]=[];
  const mainBoards=selected.main.map(q=>materializeQuestion("ufc",q,MAIN_POINTS,entities));
  const fastMoney=selected.fast.map(q=>materializeQuestion("ufc",q,FAST_POINTS,entities));
  return {id:`sports-feud-v2-ufc-${day}-${mainBoards.map(q=>q.id).join("-")}`,
    sport:"ufc",entities,mainBoards,fastMoney};
}
