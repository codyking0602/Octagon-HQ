import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const WEEKLY_AUCTION_THEME_COUNTS = Object.freeze({
  SEC: 2,
  "Big Ten": 2,
  "Big 12": 1,
  ACC: 1,
  Wildcard: 1,
});

export const WEEKLY_AUCTION_SHAPE_WEIGHTS = Object.freeze({
  Wide: 19,
  Compressed: 18,
  TopHeavy: 17,
  MiddleHeavy: 20,
  Trap: 14,
  Chaotic: 12,
});

export const WEEKLY_AUCTION_ELITE_GRADE = 96;
export const WEEKLY_AUCTION_MIN_ELITES = 1;
export const WEEKLY_AUCTION_MAX_ELITES = 6;

const BLUEBLOODS = new Set([
  "Alabama", "Ohio State", "USC", "Texas", "Oklahoma", "Michigan",
  "Notre Dame", "Georgia", "LSU", "Florida", "Florida State", "Clemson",
  "Miami", "Penn State", "Nebraska", "Oregon", "Auburn",
]);

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATION_PATH = path.join(DEFAULT_ROOT, "supabase/migrations/202612310123_stage19_cfb_best_teams.sql");
const EXPANSION_PATH = path.join(DEFAULT_ROOT, "data/generated/football/cfb/weekly-auction-team-grade-expansion-v1.json");

function createRng(seed = 0x7a61c3d5) {
  let state = Number(seed) >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function gaussian(rng) {
  let u = 0;
  let v = 0;
  while (!u) u = rng();
  while (!v) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function shuffle(values, rng) {
  const out = values.slice();
  for (let index = out.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    [out[index], out[swap]] = [out[swap], out[index]];
  }
  return out;
}

function weightedShape(rng) {
  let roll = rng() * 100;
  for (const [shape, weight] of Object.entries(WEEKLY_AUCTION_SHAPE_WEIGHTS)) {
    roll -= weight;
    if (roll <= 0) return shape;
  }
  return "Chaotic";
}

function gradeBand(grade) {
  if (grade >= 97) return "97-100";
  if (grade >= 94) return "94-96.5";
  if (grade >= 91) return "91-93.5";
  if (grade >= 88) return "88-90.5";
  return "86-87.5";
}

export function loadWeeklyAuctionPool(rootDir = DEFAULT_ROOT) {
  const migration = fs.readFileSync(path.join(rootDir, path.relative(DEFAULT_ROOT, MIGRATION_PATH)), "utf8");
  const expansion = JSON.parse(
    fs.readFileSync(path.join(rootDir, path.relative(DEFAULT_ROOT, EXPANSION_PATH)), "utf8"),
  );

  const start = migration.indexOf("insert into private.draft_room_cfb_best_teams_pool");
  const end = migration.indexOf("create table private.draft_room_cfb_best_teams_board_shapes");
  if (start < 0 || end < 0 || end <= start) {
    throw new Error("Unable to locate approved Best CFB Teams pool in Stage 19 migration.");
  }

  const pattern = /\('([^']+)',\s*(\d+),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*([\d.]+)\)/g;
  const approved = [];
  let match;
  const block = migration.slice(start, end);
  while ((match = pattern.exec(block)) !== null) {
    approved.push({
      season_reference: match[1],
      season_year: Number(match[2]),
      school: match[3],
      conference_bucket: match[4],
      display_label: match[5],
      hidden_grade: Number(match[6]),
      origin: "approved_anchor",
    });
  }

  const additions = expansion.additions.map((entry) => ({
    ...entry,
    hidden_grade: Number(entry.hidden_grade),
    origin: "audited_expansion",
  }));

  const pool = [...approved, ...additions];
  if (approved.length !== 132 || additions.length !== 101 || pool.length !== 233) {
    throw new Error(
      `Weekly Auction grading universe drifted: approved=${approved.length}, additions=${additions.length}, total=${pool.length}.`,
    );
  }

  const identities = new Set(pool.map((entry) => `${entry.school}|${entry.season_year}`));
  if (identities.size !== pool.length) {
    throw new Error("Weekly Auction grading universe contains duplicate school-season identities.");
  }

  return pool;
}

function themePool(pool, theme, usedSchools) {
  return pool.filter((entry) => {
    if (usedSchools.has(entry.school)) return false;
    if (theme === "Wildcard") {
      return entry.conference_bucket === "Notre Dame" || entry.conference_bucket === "Wildcard";
    }
    return entry.conference_bucket === theme;
  });
}

function nearestCandidate(candidates, target, blockedRefs, blockedSchools, rng) {
  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    if (blockedRefs.has(candidate.season_reference) || blockedSchools.has(candidate.school)) continue;
    const distance = Math.abs(candidate.hidden_grade - target) + rng() * 0.3;
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

function fallbackTargets(shape, rng) {
  if (shape === "Wide") {
    const high = 94 + Math.floor(rng() * 9) * 0.5;
    return [high, high - (4 + rng() * 1.5), high - (7 + rng() * 2)];
  }
  if (shape === "Compressed") {
    const center = 88.5 + Math.floor(rng() * 14) * 0.5;
    return [center - 0.5, center, center + 0.5];
  }
  if (shape === "TopHeavy") {
    const high = 94 + Math.floor(rng() * 8) * 0.5;
    return [high, high - (0.5 + rng()), high - (4 + rng() * 2)];
  }
  if (shape === "MiddleHeavy") {
    const center = 89.5 + Math.floor(rng() * 8) * 0.5;
    return [
      center - (1.2 + rng() * 0.8),
      center + (rng() - 0.5) * 0.5,
      center + (1.2 + rng() * 0.8),
    ];
  }
  if (shape === "Trap") {
    return [90 + rng() * 4, 92 + rng() * 3, 88.5 + rng() * 3.5];
  }
  return shuffle([86 + rng() * 14, 86 + rng() * 14, 86 + rng() * 14], rng);
}

function buildDailyBoard(pool, theme, shape, usedSchools, rng) {
  const candidates = themePool(pool, theme, usedSchools);
  if (candidates.length < 3) return null;

  let selected = [];
  let blockedRefs = new Set();
  let blockedSchools = new Set();

  const addNearest = (target) => {
    const candidate = nearestCandidate(candidates, target, blockedRefs, blockedSchools, rng);
    if (!candidate) return;
    selected.push(candidate);
    blockedRefs.add(candidate.season_reference);
    blockedSchools.add(candidate.school);
  };

  if (shape === "Trap") {
    const bluebloods = shuffle(candidates.filter((entry) => BLUEBLOODS.has(entry.school)), rng);
    const others = shuffle(candidates.filter((entry) => !BLUEBLOODS.has(entry.school)), rng);
    let pair = null;

    outer:
    for (const blueblood of bluebloods) {
      for (const other of others) {
        if (
          other.hidden_grade >= blueblood.hidden_grade + 1.5
          && other.hidden_grade <= blueblood.hidden_grade + 4.5
        ) {
          pair = [blueblood, other];
          break outer;
        }
      }
    }

    if (pair) {
      selected = pair.slice();
      blockedRefs = new Set(pair.map((entry) => entry.season_reference));
      blockedSchools = new Set(pair.map((entry) => entry.school));
      addNearest((pair[0].hidden_grade + pair[1].hidden_grade) / 2);
    }
  }

  if (selected.length < 3) {
    selected = [];
    blockedRefs = new Set();
    blockedSchools = new Set();
    for (const target of fallbackTargets(shape, rng)) addNearest(target);
  }

  if (selected.length < 3) {
    for (const candidate of shuffle(candidates, rng)) {
      if (usedSchools.has(candidate.school) || blockedSchools.has(candidate.school)) continue;
      selected.push(candidate);
      blockedSchools.add(candidate.school);
      if (selected.length === 3) break;
    }
  }

  return selected.length === 3 ? selected : null;
}

function themeSchedule(rng) {
  const themes = [];
  for (const [theme, count] of Object.entries(WEEKLY_AUCTION_THEME_COUNTS)) {
    for (let index = 0; index < count; index += 1) themes.push(theme);
  }
  return shuffle(themes, rng);
}

function buildWeekCandidate(pool, rng) {
  const usedSchools = new Set();
  const days = [];
  let previous = null;
  let twoBack = null;

  for (const theme of themeSchedule(rng)) {
    let shape = "Chaotic";
    for (let attempt = 0; attempt < 30; attempt += 1) {
      shape = weightedShape(rng);
      if (!(shape === previous && shape === twoBack)) break;
    }

    const teams = buildDailyBoard(pool, theme, shape, usedSchools, rng);
    if (!teams) return null;

    for (const team of teams) usedSchools.add(team.school);
    days.push({
      theme,
      shape,
      teams,
    });

    twoBack = previous;
    previous = shape;
  }

  return days;
}

export function generateWeeklyAuctionBoard(pool, seed = 1) {
  const rng = createRng(seed);
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const days = buildWeekCandidate(pool, rng);
    if (!days) continue;

    const teams = days.flatMap((day) => day.teams);
    const eliteCount = teams.filter((team) => team.hidden_grade >= WEEKLY_AUCTION_ELITE_GRADE).length;
    if (eliteCount < WEEKLY_AUCTION_MIN_ELITES || eliteCount > WEEKLY_AUCTION_MAX_ELITES) continue;

    const schools = new Set(teams.map((team) => team.school));
    if (schools.size !== 21) continue;

    return {
      version: "weekly-auction-cfb-board-generator-2026-09-v1",
      seed,
      days,
    };
  }

  throw new Error("Unable to generate a valid Weekly Auction board within retry budget.");
}

function maxShapeRun(days) {
  let max = 1;
  let run = 1;
  for (let index = 1; index < days.length; index += 1) {
    if (days[index].shape === days[index - 1].shape) {
      run += 1;
      max = Math.max(max, run);
    } else {
      run = 1;
    }
  }
  return max;
}

export function validateWeeklyAuctionBoard(board) {
  const errors = [];
  const teams = board.days.flatMap((day) => day.teams);
  const themeCounts = board.days.reduce((counts, day) => {
    counts[day.theme] = (counts[day.theme] ?? 0) + 1;
    return counts;
  }, {});

  if (board.days.length !== 7) errors.push("week must contain exactly 7 daily boards");
  if (teams.length !== 21) errors.push("week must contain exactly 21 team-seasons");

  for (const [theme, expected] of Object.entries(WEEKLY_AUCTION_THEME_COUNTS)) {
    if ((themeCounts[theme] ?? 0) !== expected) {
      errors.push(`${theme} must appear ${expected} time(s)`);
    }
  }

  if (new Set(teams.map((team) => team.school)).size !== teams.length) {
    errors.push("a school repeated within the same week");
  }
  if (new Set(teams.map((team) => team.season_reference)).size !== teams.length) {
    errors.push("a team-season repeated within the same week");
  }
  if (maxShapeRun(board.days) > 2) errors.push("same hidden board shape appeared more than twice in a row");

  const eliteCount = teams.filter((team) => team.hidden_grade >= WEEKLY_AUCTION_ELITE_GRADE).length;
  if (eliteCount < WEEKLY_AUCTION_MIN_ELITES || eliteCount > WEEKLY_AUCTION_MAX_ELITES) {
    errors.push("weekly elite inventory fell outside extreme-only guardrail");
  }

  return errors;
}

export function simulateBoardGenerator(pool, weeks = 30000, seed = 0x13579bdf) {
  const shapeCounts = {};
  const bandCounts = {
    "86-87.5": 0,
    "88-90.5": 0,
    "91-93.5": 0,
    "94-96.5": 0,
    "97-100": 0,
  };
  const eliteDistribution = {};
  let spreadTotal = 0;
  let compressedDays = 0;
  let wideDays = 0;
  let notreDameWeeks = 0;
  let repeatWeeks = 0;
  let maxRun = 0;

  for (let index = 0; index < weeks; index += 1) {
    const board = generateWeeklyAuctionBoard(pool, seed + index * 7919);
    const errors = validateWeeklyAuctionBoard(board);
    if (errors.length) throw new Error(`Invalid simulated board: ${errors.join("; ")}`);

    const teams = board.days.flatMap((day) => day.teams);
    if (new Set(teams.map((team) => team.school)).size !== 21) repeatWeeks += 1;
    if (teams.some((team) => team.school === "Notre Dame")) notreDameWeeks += 1;

    let eliteCount = 0;
    for (const day of board.days) {
      shapeCounts[day.shape] = (shapeCounts[day.shape] ?? 0) + 1;
      const grades = day.teams.map((team) => team.hidden_grade);
      const spread = Math.max(...grades) - Math.min(...grades);
      spreadTotal += spread;
      if (spread <= 2) compressedDays += 1;
      if (spread >= 6) wideDays += 1;
      for (const team of day.teams) {
        bandCounts[gradeBand(team.hidden_grade)] += 1;
        if (team.hidden_grade >= WEEKLY_AUCTION_ELITE_GRADE) eliteCount += 1;
      }
    }

    eliteDistribution[eliteCount] = (eliteDistribution[eliteCount] ?? 0) + 1;
    maxRun = Math.max(maxRun, maxShapeRun(board.days));
  }

  const days = weeks * 7;
  const teams = weeks * 21;
  return {
    pool_size: pool.length,
    simulated_weeks: weeks,
    shape_share_pct: Object.fromEntries(
      Object.entries(shapeCounts).map(([shape, count]) => [shape, Number(((count / days) * 100).toFixed(1))]),
    ),
    average_daily_grade_spread: Number((spreadTotal / days).toFixed(2)),
    compressed_days_pct: Number(((compressedDays / days) * 100).toFixed(1)),
    wide_days_pct: Number(((wideDays / days) * 100).toFixed(1)),
    school_repeat_weeks: repeatWeeks,
    max_same_shape_run: maxRun,
    notre_dame_week_presence_pct: Number(((notreDameWeeks / weeks) * 100).toFixed(1)),
    grade_band_share_pct: Object.fromEntries(
      Object.entries(bandCounts).map(([band, count]) => [band, Number(((count / teams) * 100).toFixed(1))]),
    ),
    elite_subjects_per_week_pct: Object.fromEntries(
      Object.entries(eliteDistribution).map(([count, occurrences]) => [
        count,
        Number(((occurrences / weeks) * 100).toFixed(1)),
      ]),
    ),
  };
}

function buildBids(player, teams, rng) {
  const raw = teams.map((team) => {
    const estimate = team.hidden_grade + gaussian(rng) * player.sigma + player.bias;
    const prior = player.wins.slice().sort((a, b) => b.estimate - a.estimate);
    let desire = estimate - 86;
    if (prior.length >= 3) desire = Math.max(0.2, estimate - prior[2].estimate + 2);

    let bid = Math.max(0, Math.round((1 + desire * 0.78) * player.aggression));
    if (estimate < 87.5 && prior.length >= 2) bid = Math.min(bid, 2);
    return { bid, estimate };
  });

  let committed = raw.reduce((sum, item) => sum + item.bid, 0);
  while (committed > player.cash) {
    let index = -1;
    let weakest = Number.POSITIVE_INFINITY;
    for (let bidIndex = 0; bidIndex < raw.length; bidIndex += 1) {
      if (raw[bidIndex].bid <= 0) continue;
      const priority = raw[bidIndex].estimate + raw[bidIndex].bid * 0.15;
      if (priority < weakest) {
        weakest = priority;
        index = bidIndex;
      }
    }
    if (index < 0) break;
    raw[index].bid -= 1;
    committed -= 1;
  }

  return raw;
}

export function simulateAuctionMarket(pool, playersCount, weeks = 8000, seed = 0x2468ace1) {
  const rng = createRng(seed + playersCount * 1009);
  let playerWeeks = 0;
  let fewerThanThree = 0;
  let remainingCash = 0;
  let teamsWon = 0;
  let maxPlayerShare = 0;
  let noBidLots = 0;
  let tieLots = 0;
  const winDistribution = {};

  for (let weekIndex = 0; weekIndex < weeks; weekIndex += 1) {
    const board = generateWeeklyAuctionBoard(pool, seed + weekIndex * 3571 + playersCount);
    const players = Array.from({ length: playersCount }, (_, index) => ({
      cash: 40,
      spent: 0,
      wins: [],
      sigma: 1.7 + index * 0.35,
      aggression: 0.9 + index * 0.05,
      bias: (index - (playersCount - 1) / 2) * 0.1,
    }));

    let awarded = 0;
    for (const day of board.days) {
      const bids = players.map((player) => buildBids(player, day.teams, rng));

      for (let teamIndex = 0; teamIndex < day.teams.length; teamIndex += 1) {
        const highest = Math.max(...bids.map((entry) => entry[teamIndex].bid));
        if (highest <= 0) {
          noBidLots += 1;
          continue;
        }

        const tied = players
          .map((_, index) => index)
          .filter((index) => bids[index][teamIndex].bid === highest);

        if (tied.length > 1) tieLots += 1;

        tied.sort((leftIndex, rightIndex) => {
          const left = players[leftIndex];
          const right = players[rightIndex];
          if (left.wins.length !== right.wins.length) return left.wins.length - right.wins.length;
          if (left.spent !== right.spent) return left.spent - right.spent;
          return rng() < 0.5 ? -1 : 1;
        });

        const winnerIndex = tied[0];
        const winner = players[winnerIndex];
        const amount = highest;
        winner.cash -= amount;
        winner.spent += amount;
        winner.wins.push({
          grade: day.teams[teamIndex].hidden_grade,
          estimate: bids[winnerIndex][teamIndex].estimate,
          amount,
        });
        awarded += 1;
      }
    }

    let mostWins = 0;
    for (const player of players) {
      playerWeeks += 1;
      const won = player.wins.length;
      mostWins = Math.max(mostWins, won);
      if (won < 3) fewerThanThree += 1;
      remainingCash += player.cash;
      teamsWon += won;
      winDistribution[won] = (winDistribution[won] ?? 0) + 1;
    }

    if (awarded > 0) maxPlayerShare += mostWins / awarded;
  }

  return {
    players: playersCount,
    simulated_weeks: weeks,
    players_with_fewer_than_three_pct: Number(((fewerThanThree / playerWeeks) * 100).toFixed(2)),
    average_remaining_cash: Number((remainingCash / playerWeeks).toFixed(2)),
    average_teams_won: Number((teamsWon / playerWeeks).toFixed(2)),
    average_largest_player_share_pct: Number(((maxPlayerShare / weeks) * 100).toFixed(1)),
    no_bid_lots_pct: Number(((noBidLots / (weeks * 21)) * 100).toFixed(2)),
    tied_lots_pct: Number(((tieLots / (weeks * 21)) * 100).toFixed(1)),
    win_count_distribution_pct: Object.fromEntries(
      Object.entries(winDistribution).map(([count, occurrences]) => [
        count,
        Number(((occurrences / playerWeeks) * 100).toFixed(1)),
      ]),
    ),
  };
}

function runCli() {
  const pool = loadWeeklyAuctionPool();
  const report = {
    version: "weekly-auction-cfb-generator-calibration-2026-09-v1",
    board_generator: simulateBoardGenerator(pool, 30000),
    auction_market_4_players: simulateAuctionMarket(pool, 4, 8000),
    auction_market_5_players: simulateAuctionMarket(pool, 5, 8000),
  };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  runCli();
}
