import { shuffleLineup } from "./lineupModel";

export interface FindLeaderCompetitionConfig<Row> {
  getId: (row: Row) => string;
  getValue: (row: Row) => number;
  competitiveWindowSize: number;
  supportEndIndex: number;
  isLeaderAllowed?: (row: Row) => boolean;
  compareLeaderTie?: (left: Row, right: Row) => number;
  candidateCount?: number;
  scoreWindow?: number;
  closestCount?: number;
  supportCount?: number;
  wildcardStartIndex?: number;
  wildcardEndIndex?: number;
  wildcardCount?: number;
}

export interface FindLeaderCompetitionSelection<Row> {
  leader: Row;
  lower: Row[];
  challengers: Row[];
  competitionScore: number;
}

export function viableCompetitiveLeaders<Row>(
  pool: readonly Row[],
  config: FindLeaderCompetitionConfig<Row>,
  excludeGlobalMax: boolean,
) {
  const value = config.getValue;
  const globalMax = pool[0] ? value(pool[0]) : 0;
  const challengerCount = (config.candidateCount ?? 10) - 1;
  return pool.filter((row) => (
    (config.isLeaderAllowed?.(row) ?? true)
    && (!excludeGlobalMax || value(row) < globalMax)
    && pool.filter((other) => value(other) < value(row)).length >= challengerCount
  ));
}

function closestRows<Row>(
  rows: readonly Row[],
  count: number,
  random: () => number,
  value: (row: Row) => number,
) {
  if (rows.length < count) return [];
  const cutoff = value(rows[count - 1]!);
  const closer = rows.filter((row) => value(row) > cutoff);
  const tied = shuffleLineup(rows.filter((row) => value(row) === cutoff), random);
  return [...closer, ...tied.slice(0, count - closer.length)];
}

export function selectFindLeaderCompetition<Row>(
  pool: readonly Row[],
  random: () => number,
  config: FindLeaderCompetitionConfig<Row>,
): FindLeaderCompetitionSelection<Row> | null {
  const value = config.getValue;
  const nonRecord = viableCompetitiveLeaders(pool, config, true);
  const viable = nonRecord.length ? nonRecord : viableCompetitiveLeaders(pool, config, false);
  const challengerCount = (config.candidateCount ?? 10) - 1;
  const ranked = viable.map((leader) => {
    const lower = pool.filter((row) => value(row) < value(leader));
    const nearest = lower.slice(0, challengerCount);
    const scale = Math.max(Math.abs(value(leader)), 1);
    const spread = value(leader) - value(nearest.at(-1)!);
    const runnerUpGap = value(leader) - value(nearest[0]!);
    return { leader, lower, competitionScore: (spread / scale) + ((runnerUpGap / scale) * 0.35) };
  }).sort((left, right) => (
    left.competitionScore - right.competitionScore
    || value(right.leader) - value(left.leader)
    || (config.compareLeaderTie?.(left.leader, right.leader) ?? 0)
  ));
  if (!ranked.length) return null;

  const best = ranked[0]!.competitionScore;
  const options = ranked
    .filter((row) => row.competitionScore <= best + (config.scoreWindow ?? 0.12))
    .slice(0, config.competitiveWindowSize);
  const option = options[Math.floor(random() * options.length)] ?? ranked[0]!;

  const closestCount = config.closestCount ?? 4;
  const core = closestRows(option.lower, closestCount, random, value);
  const used = new Set(core.map(config.getId));
  const take = (start: number, end: number, count: number) => {
    const selected = shuffleLineup(
      option.lower.slice(start, Math.min(end, option.lower.length)).filter((row) => !used.has(config.getId(row))),
      random,
    ).slice(0, count);
    selected.forEach((row) => used.add(config.getId(row)));
    return selected;
  };
  const support = take(closestCount, config.supportEndIndex, config.supportCount ?? 3);
  const wildcards = take(config.wildcardStartIndex ?? 9, config.wildcardEndIndex ?? 20, config.wildcardCount ?? 2);
  const challengers = [...core, ...support, ...wildcards];
  if (challengers.length < challengerCount) {
    challengers.push(...shuffleLineup(
      option.lower.filter((row) => !used.has(config.getId(row))),
      random,
    ).slice(0, challengerCount - challengers.length));
  }
  return { ...option, challengers: challengers.slice(0, challengerCount) };
}
