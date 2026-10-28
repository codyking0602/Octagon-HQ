export type PlayLineupType = "daily" | "replayable" | "curated";

export type PlayReplayBehavior =
  | "same-daily-lineup"
  | "new-lineup"
  | "same-curated-challenge";

export interface PlayLineupIdentity {
  gameId: string;
  type: PlayLineupType;
  scopeId: string;
  challengeId: string;
  seed: string;
  replayBehavior: PlayReplayBehavior;
  day?: string;
}

export interface PlayLineupHistoryEntry {
  challengeId: string;
  seed: string;
  type: PlayLineupType;
  itemIds: string[];
  fighterIds: string[];
  createdAt: string;
  completedAt?: string;
  result?: unknown;
}

export interface PlayLineupHistory {
  entries: PlayLineupHistoryEntry[];
  recentItemIds: string[];
  recentFighterIds: string[];
  lastLineup: string[];
}

export interface PlayLineupValidation {
  valid: boolean;
  reason?: "wrong-size" | "duplicate-items" | "outside-pool" | "division-restriction";
}

export interface ReplayLineupCandidate<T> {
  value: T;
  itemIds: readonly string[];
  fighterIds?: readonly string[];
}

export interface SelectReplayLineupOptions<T> {
  gameId: string;
  scopeId?: string;
  lineupSize: number;
  attempts?: number;
  validItemIds?: ReadonlySet<string>;
  validFighterIds?: ReadonlySet<string>;
  seedFactory?: (attempt: number) => string;
  build: (seed: string, attempt: number, history: PlayLineupHistory) => ReplayLineupCandidate<T>;
  persist?: boolean;
}

export interface SelectedReplayLineup<T> extends ReplayLineupCandidate<T> {
  identity: PlayLineupIdentity;
  itemIds: string[];
  fighterIds: string[];
  penalty: number;
}

export interface LineupPoolOptions<T> {
  getId: (item: T) => string;
  getDivisions?: (item: T) => readonly string[];
  requiredDivisions?: readonly string[];
  divisionMode?: "any" | "all";
  isEligible?: (item: T) => boolean;
}

const HISTORY_KEY = "octagon-hq:play-lineup-history:v1";
const HISTORY_ENTRY_LIMIT = 8;
const RECENT_ITEM_LIMIT = 60;
const RECENT_FIGHTER_LIMIT = 40;
const DEFAULT_REPLAY_ATTEMPTS = 10;

function cleanPart(value: string) {
  return value.trim().replace(/[^a-z0-9:_-]+/gi, "-").replace(/^-+|-+$/g, "") || "default";
}

export function stableLineupHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededLineupRandom(...parts: Array<string | number>) {
  let value = stableLineupHash(parts.join("|"));
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleLineup<T>(rows: readonly T[], random: () => number) {
  const copy = [...rows];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function replayBehaviorFor(type: PlayLineupType): PlayReplayBehavior {
  if (type === "daily") return "same-daily-lineup";
  if (type === "curated") return "same-curated-challenge";
  return "new-lineup";
}

export function replayLabelFor(type: PlayLineupType) {
  if (type === "daily") return "REPLAY TODAY";
  if (type === "curated") return "REPLAY CHALLENGE";
  return "PLAY AGAIN";
}

export function dailyLineupSeed(day: string) {
  return `daily|${cleanPart(day)}`;
}

export function dailyLineupIdentity(gameId: string, day: string, scopeId = "default"): PlayLineupIdentity {
  const cleanGame = cleanPart(gameId);
  const cleanScope = cleanPart(scopeId);
  const cleanDay = cleanPart(day);
  return {
    gameId: cleanGame,
    type: "daily",
    scopeId: cleanScope,
    challengeId: `${cleanGame}:daily:${cleanDay}:${cleanScope}`,
    seed: dailyLineupSeed(day),
    replayBehavior: "same-daily-lineup",
    day,
  };
}

export function createReplaySeed(gameId: string) {
  const cryptoValue = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.floor(Math.random() * 0xffffffff).toString(36)}`;
  return `${cleanPart(gameId)}-${cryptoValue}`;
}

export function replayLineupIdentity(gameId: string, seed: string, scopeId = "default"): PlayLineupIdentity {
  const cleanGame = cleanPart(gameId);
  const cleanScope = cleanPart(scopeId);
  return {
    gameId: cleanGame,
    type: "replayable",
    scopeId: cleanScope,
    challengeId: `${cleanGame}:replay:${cleanPart(seed)}`,
    seed,
    replayBehavior: "new-lineup",
  };
}

export function curatedLineupIdentity(
  gameId: string,
  challengeId: string,
  itemIds: readonly string[] = [],
  scopeId = "curated",
): PlayLineupIdentity {
  const cleanGame = cleanPart(gameId);
  const cleanScope = cleanPart(scopeId);
  const cleanChallenge = cleanPart(challengeId || itemIds.join("|"));
  return {
    gameId: cleanGame,
    type: "curated",
    scopeId: cleanScope,
    challengeId: `${cleanGame}:curated:${cleanChallenge}`,
    seed: `curated|${cleanGame}|${cleanChallenge}`,
    replayBehavior: "same-curated-challenge",
  };
}

export function validLineupPool<T>(pool: readonly T[], options: LineupPoolOptions<T>) {
  const required = new Set(options.requiredDivisions ?? []);
  const divisionMode = options.divisionMode ?? "any";
  const seen = new Set<string>();
  return pool.filter((item) => {
    const id = options.getId(item);
    if (!id || seen.has(id) || options.isEligible?.(item) === false) return false;
    if (required.size && options.getDivisions) {
      const divisions = new Set(options.getDivisions(item));
      const matches = divisionMode === "all"
        ? [...required].every((division) => divisions.has(division))
        : [...required].some((division) => divisions.has(division));
      if (!matches) return false;
    }
    seen.add(id);
    return true;
  });
}

export function validateLineupIds(
  itemIds: readonly string[],
  lineupSize: number,
  validItemIds?: ReadonlySet<string>,
): PlayLineupValidation {
  if (itemIds.length !== lineupSize) return { valid: false, reason: "wrong-size" };
  if (new Set(itemIds).size !== itemIds.length) return { valid: false, reason: "duplicate-items" };
  if (validItemIds && itemIds.some((id) => !validItemIds.has(id))) {
    return { valid: false, reason: "outside-pool" };
  }
  return { valid: true };
}

function emptyHistory(): PlayLineupHistory {
  return { entries: [], recentItemIds: [], recentFighterIds: [], lastLineup: [] };
}

function storageKey(gameId: string, scopeId: string) {
  return `${cleanPart(gameId)}::${cleanPart(scopeId)}`;
}

function parseHistoryStore() {
  if (typeof window === "undefined") return {} as Record<string, PlayLineupHistoryEntry[]>;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "{}") as Record<string, unknown>;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, PlayLineupHistoryEntry[]>
      : {};
  } catch {
    return {} as Record<string, PlayLineupHistoryEntry[]>;
  }
}

function normalizeEntries(value: unknown): PlayLineupHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const row = entry as Partial<PlayLineupHistoryEntry>;
    if (
      typeof row.challengeId !== "string"
      || typeof row.seed !== "string"
      || (row.type !== "daily" && row.type !== "replayable" && row.type !== "curated")
      || !Array.isArray(row.itemIds)
      || !Array.isArray(row.fighterIds)
      || typeof row.createdAt !== "string"
    ) return [];
    return [{
      challengeId: row.challengeId,
      seed: row.seed,
      type: row.type,
      itemIds: row.itemIds.filter((id): id is string => typeof id === "string"),
      fighterIds: row.fighterIds.filter((id): id is string => typeof id === "string"),
      createdAt: row.createdAt,
      completedAt: typeof row.completedAt === "string" ? row.completedAt : undefined,
      result: row.result,
    }];
  }).slice(0, HISTORY_ENTRY_LIMIT);
}

export function loadLineupHistory(gameId: string, scopeId = "default"): PlayLineupHistory {
  const entries = normalizeEntries(parseHistoryStore()[storageKey(gameId, scopeId)]);
  return {
    entries,
    recentItemIds: entries.flatMap((entry) => entry.itemIds).slice(0, RECENT_ITEM_LIMIT),
    recentFighterIds: entries.flatMap((entry) => entry.fighterIds).slice(0, RECENT_FIGHTER_LIMIT),
    lastLineup: entries[0]?.itemIds ?? [],
  };
}

function frequencyPressure(entries: readonly PlayLineupHistoryEntry[], field: "itemIds" | "fighterIds") {
  const pressure = new Map<string, number>();
  entries.forEach((entry, index) => {
    const weight = Math.max(1, HISTORY_ENTRY_LIMIT - index);
    entry[field].forEach((id) => pressure.set(id, (pressure.get(id) ?? 0) + weight));
  });
  return pressure;
}

function signature(ids: readonly string[]) {
  return [...ids].sort().join("|");
}

export function lineupCandidatePenalty(
  history: PlayLineupHistory,
  itemIds: readonly string[],
  fighterIds: readonly string[] = [],
) {
  const lastSignature = signature(history.lastLineup);
  const exactRepeat = Boolean(lastSignature) && signature(itemIds) === lastSignature;
  const lastSet = new Set(history.lastLineup);
  const immediateOverlap = itemIds.filter((id) => lastSet.has(id)).length;
  const itemPressure = frequencyPressure(history.entries, "itemIds");
  const fighterPressure = frequencyPressure(history.entries, "fighterIds");
  const itemScore = itemIds.reduce((sum, id) => sum + (itemPressure.get(id) ?? 0), 0);
  const fighterScore = fighterIds.reduce((sum, id) => sum + (fighterPressure.get(id) ?? 0), 0);
  return (exactRepeat ? 100_000 : 0) + immediateOverlap * 1_000 + fighterScore * 10 + itemScore;
}

export function rememberLineup(
  identity: PlayLineupIdentity,
  itemIds: readonly string[],
  fighterIds: readonly string[] = [],
) {
  if (typeof window === "undefined") return;
  try {
    const store = parseHistoryStore();
    const key = storageKey(identity.gameId, identity.scopeId);
    const current = normalizeEntries(store[key]);
    const existing = current.find((entry) => entry.challengeId === identity.challengeId);
    const entry: PlayLineupHistoryEntry = existing ?? {
      challengeId: identity.challengeId,
      seed: identity.seed,
      type: identity.type,
      itemIds: [...itemIds],
      fighterIds: [...fighterIds],
      createdAt: new Date().toISOString(),
    };
    store[key] = [entry, ...current.filter((row) => row.challengeId !== identity.challengeId)].slice(0, HISTORY_ENTRY_LIMIT);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(store));
  } catch {
    // Lineup history is progressive enhancement; gameplay remains available without storage.
  }
}

export function recordLineupCompletion(identity: PlayLineupIdentity, result?: unknown) {
  if (typeof window === "undefined") return;
  try {
    const store = parseHistoryStore();
    const key = storageKey(identity.gameId, identity.scopeId);
    const current = normalizeEntries(store[key]);
    const index = current.findIndex((entry) => entry.challengeId === identity.challengeId);
    if (index < 0) return;
    current[index] = { ...current[index], completedAt: new Date().toISOString(), result };
    store[key] = current;
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(store));
  } catch {
    // Completion history is progressive enhancement.
  }
}

export function selectReplayLineup<T>(options: SelectReplayLineupOptions<T>): SelectedReplayLineup<T> {
  const scopeId = options.scopeId ?? "default";
  const history = loadLineupHistory(options.gameId, scopeId);
  const attempts = Math.max(1, options.attempts ?? DEFAULT_REPLAY_ATTEMPTS);
  let selected: SelectedReplayLineup<T> | null = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const seed = options.seedFactory?.(attempt) ?? createReplaySeed(options.gameId);
    const candidate = options.build(seed, attempt, history);
    const itemIds = [...candidate.itemIds];
    const fighterIds = [...(candidate.fighterIds ?? [])];
    const itemValidation = validateLineupIds(itemIds, options.lineupSize, options.validItemIds);
    if (!itemValidation.valid) continue;
    if (options.validFighterIds && fighterIds.some((id) => !options.validFighterIds!.has(id))) continue;
    const penalty = lineupCandidatePenalty(history, itemIds, fighterIds);
    const identity = replayLineupIdentity(options.gameId, seed, scopeId);
    if (!selected || penalty < selected.penalty) {
      selected = { ...candidate, identity, itemIds, fighterIds, penalty };
    }
    if (penalty === 0) break;
  }

  if (!selected) throw new Error(`${options.gameId} could not build a valid ${options.lineupSize}-item lineup.`);
  if (options.persist !== false) rememberLineup(selected.identity, selected.itemIds, selected.fighterIds);
  return selected;
}
