type UnknownRecord = Record<string, unknown>;

export interface CfbApTop25Team {
  rank: number;
  espnId: string;
  name: string;
  abbreviation: string | null;
}

export interface CfbApTop25Snapshot {
  poll: "AP Top 25";
  pollDate: string | null;
  teams: CfbApTop25Team[];
}

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : null;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function rankValue(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value);
  return null;
}

function isoDate(value: unknown) {
  const raw = text(value);
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
  return parsed.toISOString().slice(0, 10);
}

function pollLabel(poll: UnknownRecord) {
  return [poll.name, poll.shortName, poll.type]
    .map(text)
    .filter((value): value is string => Boolean(value))
    .join(" ");
}

export function normalizeCfbApTop25(payload: unknown): CfbApTop25Snapshot | null {
  const root = asRecord(payload);
  if (!root) return null;
  const rankings = Array.isArray(root.rankings) ? root.rankings : [];
  const poll = rankings
    .map(asRecord)
    .find((candidate) => candidate && /\bAP\b|Associated Press/i.test(pollLabel(candidate)));
  if (!poll) return null;

  const ranks = Array.isArray(poll.ranks) ? poll.ranks : [];
  const seenRanks = new Set<number>();
  const seenTeams = new Set<string>();
  const teams: CfbApTop25Team[] = [];

  for (const rawRank of ranks) {
    const item = asRecord(rawRank);
    const team = asRecord(item?.team);
    const rank = rankValue(item?.current ?? item?.rank);
    const espnId = text(team?.id);
    const name = text(team?.displayName) ?? text(team?.location) ?? text(team?.name);
    if (!rank || rank < 1 || rank > 25 || !espnId || !name) continue;
    if (seenRanks.has(rank) || seenTeams.has(espnId)) continue;
    seenRanks.add(rank);
    seenTeams.add(espnId);
    teams.push({
      rank,
      espnId,
      name,
      abbreviation: text(team?.abbreviation),
    });
  }

  teams.sort((left, right) => left.rank - right.rank);
  if (teams.length !== 25 || teams.some((team, index) => team.rank !== index + 1)) return null;

  return {
    poll: "AP Top 25",
    pollDate: isoDate(poll.date ?? poll.lastUpdated ?? root.timestamp),
    teams,
  };
}
