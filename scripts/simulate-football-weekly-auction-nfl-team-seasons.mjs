import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const NFL_TEAM_SEASON_NORMAL_DAYS = 6;
export const NFL_TEAM_SEASON_CARDS_PER_DAY = 4;

export const NFL_TEAM_SEASON_THEME_FAMILIES = Object.freeze([
  "division",
  "season",
  "era",
  "rivalry",
  "franchise_history",
  "fell_short",
  "conference_clash",
  "open_field",
]);

export const NFL_TEAM_SEASON_THEME_WEIGHTS = Object.freeze({
  division: 1.35,
  season: 1.1,
  era: 1,
  rivalry: 1.15,
  franchise_history: 0.9,
  fell_short: 1,
  conference_clash: 1,
  open_field: 1.5,
});

export const NFL_TEAM_SEASON_THEME_WEEKLY_CAPS = Object.freeze({
  division: 2,
  season: 1,
  era: 1,
  rivalry: 1,
  franchise_history: 1,
  fell_short: 1,
  conference_clash: 1,
  open_field: 2,
});

export const NFL_DIVISION_BY_FRANCHISE = Object.freeze({
  BUF: "AFC East",
  MIA: "AFC East",
  NE: "AFC East",
  NYJ: "AFC East",
  BAL: "AFC North",
  CIN: "AFC North",
  CLE: "AFC North",
  PIT: "AFC North",
  HOU: "AFC South",
  IND: "AFC South",
  JAX: "AFC South",
  TEN: "AFC South",
  DEN: "AFC West",
  KC: "AFC West",
  LV: "AFC West",
  LAC: "AFC West",
  DAL: "NFC East",
  NYG: "NFC East",
  PHI: "NFC East",
  WAS: "NFC East",
  CHI: "NFC North",
  DET: "NFC North",
  GB: "NFC North",
  MIN: "NFC North",
  ATL: "NFC South",
  CAR: "NFC South",
  NO: "NFC South",
  TB: "NFC South",
  ARI: "NFC West",
  LAR: "NFC West",
  SF: "NFC West",
  SEA: "NFC West",
});

const SHORT_TEAM_NAMES = Object.freeze({
  BUF: "Bills",
  MIA: "Dolphins",
  NE: "Patriots",
  NYJ: "Jets",
  BAL: "Ravens",
  CIN: "Bengals",
  CLE: "Browns",
  PIT: "Steelers",
  HOU: "Texans",
  IND: "Colts",
  JAX: "Jaguars",
  TEN: "Titans",
  DEN: "Broncos",
  KC: "Chiefs",
  LV: "Raiders",
  LAC: "Chargers",
  DAL: "Cowboys",
  NYG: "Giants",
  PHI: "Eagles",
  WAS: "Washington",
  CHI: "Bears",
  DET: "Lions",
  GB: "Packers",
  MIN: "Vikings",
  ATL: "Falcons",
  CAR: "Panthers",
  NO: "Saints",
  TB: "Buccaneers",
  ARI: "Cardinals",
  LAR: "Rams",
  SF: "49ers",
  SEA: "Seahawks",
});

export const NFL_TEAM_SEASON_RIVALRY_PAIRS = Object.freeze([
  ["DAL", "PHI"],
  ["GB", "CHI"],
  ["BAL", "PIT"],
  ["KC", "LV"],
  ["NE", "NYJ"],
  ["SF", "LAR"],
  ["ATL", "NO"],
  ["DEN", "KC"],
  ["NYG", "PHI"],
  ["SEA", "SF"],
  ["CLE", "PIT"],
  ["MIN", "GB"],
]);

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POOL_PATH = path.join(
  DEFAULT_ROOT,
  "data/generated/football/nfl/nfl-best-teams-grading-v1.json",
);

function createRng(seed = 0x6d4a3f19) {
  let state = Number(seed) >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function shuffle(values, rng) {
  const output = values.slice();
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    [output[index], output[swap]] = [output[swap], output[index]];
  }
  return output;
}

function pick(values, rng) {
  return values[Math.floor(rng() * values.length)];
}

export function loadNflTeamSeasonAuctionPool(rootDir = DEFAULT_ROOT) {
  const artifact = JSON.parse(
    fs.readFileSync(path.join(rootDir, path.relative(DEFAULT_ROOT, POOL_PATH)), "utf8"),
  );

  if (artifact.subject_key !== "nfl-best-team-seasons-since-2000") {
    throw new Error("Unexpected NFL team-season subject authority.");
  }
  if (!Array.isArray(artifact.items) || artifact.items.length !== 200) {
    throw new Error(`NFL team-season auction authority drifted: expected 200 items, received ${artifact.items?.length ?? 0}.`);
  }

  const refs = new Set(artifact.items.map((item) => item.item_reference));
  if (refs.size !== artifact.items.length) {
    throw new Error("NFL team-season auction authority contains duplicate item references.");
  }

  return artifact.items;
}

function franchiseCounts(pool) {
  return pool.reduce((counts, item) => {
    counts[item.franchise_id] = (counts[item.franchise_id] ?? 0) + 1;
    return counts;
  }, {});
}

function weightedFamily(familyCounts, rng) {
  const candidates = NFL_TEAM_SEASON_THEME_FAMILIES.filter(
    (family) => (familyCounts[family] ?? 0) < NFL_TEAM_SEASON_THEME_WEEKLY_CAPS[family],
  );
  const totalWeight = candidates.reduce(
    (sum, family) => sum + NFL_TEAM_SEASON_THEME_WEIGHTS[family],
    0,
  );
  let roll = rng() * totalWeight;
  for (const family of candidates) {
    roll -= NFL_TEAM_SEASON_THEME_WEIGHTS[family];
    if (roll <= 0) return family;
  }
  return candidates.at(-1);
}

function themeVariant(pool, family, rng) {
  if (family === "division") {
    return pick([...new Set(Object.values(NFL_DIVISION_BY_FRANCHISE))], rng);
  }
  if (family === "season") {
    return 2000 + Math.floor(rng() * 26);
  }
  if (family === "era") {
    return pick(["2000s", "2010s", "2020s"], rng);
  }
  if (family === "rivalry") {
    return pick(NFL_TEAM_SEASON_RIVALRY_PAIRS, rng);
  }
  if (family === "franchise_history") {
    const counts = franchiseCounts(pool);
    return pick(
      Object.entries(counts)
        .filter(([, count]) => count >= NFL_TEAM_SEASON_CARDS_PER_DAY)
        .map(([franchiseId]) => franchiseId),
      rng,
    );
  }
  return null;
}

function themeLabel(family, variant) {
  if (family === "division") return `${variant} Spotlight`;
  if (family === "season") return `${variant} Season Spotlight`;
  if (family === "era") return `${variant} Spotlight`;
  if (family === "rivalry") {
    return `${SHORT_TEAM_NAMES[variant[0]]} vs ${SHORT_TEAM_NAMES[variant[1]]}`;
  }
  if (family === "franchise_history") {
    return `${SHORT_TEAM_NAMES[variant]} Through the Years`;
  }
  if (family === "fell_short") return "Great Teams That Fell Short";
  if (family === "conference_clash") return "AFC vs NFC";
  return "Open Field";
}

function chooseThemeDefinitions(pool, rng) {
  const definitions = [];
  const familyCounts = {};
  const usedLabels = new Set();

  for (let slot = 0; slot < NFL_TEAM_SEASON_NORMAL_DAYS; slot += 1) {
    let chosen = null;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const family = weightedFamily(familyCounts, rng);
      const variant = themeVariant(pool, family, rng);
      const theme = themeLabel(family, variant);
      if (usedLabels.has(theme)) continue;
      chosen = { family, variant, theme };
      break;
    }
    if (!chosen) return null;
    definitions.push(chosen);
    familyCounts[chosen.family] = (familyCounts[chosen.family] ?? 0) + 1;
    usedLabels.add(chosen.theme);
  }

  return definitions;
}

function chooseLeastUsedDistinctFranchises(candidates, count, usedRefs, weeklyFranchiseCounts, rng) {
  let available = candidates.filter((candidate) => !usedRefs.has(candidate.item_reference));
  const selected = [];
  const dayFranchises = new Set();

  for (let slot = 0; slot < count; slot += 1) {
    const options = available.filter(
      (candidate) =>
        !dayFranchises.has(candidate.franchise_id)
        && (weeklyFranchiseCounts[candidate.franchise_id] ?? 0) < 2,
    );
    if (!options.length) return null;

    const leastUsed = Math.min(
      ...options.map((candidate) => weeklyFranchiseCounts[candidate.franchise_id] ?? 0),
    );
    const preferred = options.filter(
      (candidate) => (weeklyFranchiseCounts[candidate.franchise_id] ?? 0) === leastUsed,
    );
    const chosen = pick(preferred, rng);
    selected.push(chosen);
    dayFranchises.add(chosen.franchise_id);
    available = available.filter(
      (candidate) => candidate.item_reference !== chosen.item_reference,
    );
  }

  return selected;
}

function isFellShortCandidate(item) {
  return (
    !item.postseason.super_bowl_champion
    && (
      item.regular_season.win_rate >= 0.75
      || item.postseason.conference_championship_game
      || item.postseason.super_bowl_appearance
    )
  );
}

function buildThemeDay(pool, definition, usedRefs, weeklyFranchiseCounts, rng) {
  let selected = null;

  if (definition.family === "division") {
    selected = [];
    const franchises = Object.keys(NFL_DIVISION_BY_FRANCHISE).filter(
      (franchiseId) => NFL_DIVISION_BY_FRANCHISE[franchiseId] === definition.variant,
    );
    for (const franchiseId of shuffle(franchises, rng)) {
      const options = pool.filter(
        (item) =>
          item.franchise_id === franchiseId
          && !usedRefs.has(item.item_reference),
      );
      if (!options.length) return null;
      selected.push(pick(options, rng));
    }
  } else if (definition.family === "season") {
    selected = chooseLeastUsedDistinctFranchises(
      pool.filter((item) => item.season_year === definition.variant),
      NFL_TEAM_SEASON_CARDS_PER_DAY,
      usedRefs,
      weeklyFranchiseCounts,
      rng,
    );
  } else if (definition.family === "era") {
    const [start, end] =
      definition.variant === "2000s"
        ? [2000, 2009]
        : definition.variant === "2010s"
          ? [2010, 2019]
          : [2020, 2025];
    selected = chooseLeastUsedDistinctFranchises(
      pool.filter((item) => item.season_year >= start && item.season_year <= end),
      NFL_TEAM_SEASON_CARDS_PER_DAY,
      usedRefs,
      weeklyFranchiseCounts,
      rng,
    );
  } else if (definition.family === "rivalry") {
    selected = [];
    for (const franchiseId of definition.variant) {
      const options = shuffle(
        pool.filter(
          (item) =>
            item.franchise_id === franchiseId
            && !usedRefs.has(item.item_reference),
        ),
        rng,
      ).slice(0, 2);
      if (options.length < 2) return null;
      selected.push(...options);
    }
  } else if (definition.family === "franchise_history") {
    const options = shuffle(
      pool.filter(
        (item) =>
          item.franchise_id === definition.variant
          && !usedRefs.has(item.item_reference),
      ),
      rng,
    );
    if (options.length < NFL_TEAM_SEASON_CARDS_PER_DAY) return null;
    selected = options.slice(0, NFL_TEAM_SEASON_CARDS_PER_DAY);
  } else if (definition.family === "fell_short") {
    selected = chooseLeastUsedDistinctFranchises(
      pool.filter(isFellShortCandidate),
      NFL_TEAM_SEASON_CARDS_PER_DAY,
      usedRefs,
      weeklyFranchiseCounts,
      rng,
    );
  } else if (definition.family === "conference_clash") {
    selected = [];
    for (const conference of ["AFC", "NFC"]) {
      const conferenceRefs = new Set([
        ...usedRefs,
        ...selected.map((item) => item.item_reference),
      ]);
      const half = chooseLeastUsedDistinctFranchises(
        pool.filter((item) =>
          NFL_DIVISION_BY_FRANCHISE[item.franchise_id]?.startsWith(conference),
        ),
        2,
        conferenceRefs,
        weeklyFranchiseCounts,
        rng,
      );
      if (!half) return null;
      selected.push(...half);
    }
  } else {
    selected = chooseLeastUsedDistinctFranchises(
      pool,
      NFL_TEAM_SEASON_CARDS_PER_DAY,
      usedRefs,
      weeklyFranchiseCounts,
      rng,
    );
  }

  if (!selected || selected.length !== NFL_TEAM_SEASON_CARDS_PER_DAY) return null;

  return {
    family: definition.family,
    theme: definition.theme,
    variant: definition.variant,
    teams: shuffle(selected, rng),
  };
}

const BUILD_PRIORITY = Object.freeze({
  franchise_history: 0,
  rivalry: 1,
  division: 2,
  season: 3,
  fell_short: 4,
  era: 5,
  conference_clash: 6,
  open_field: 7,
});

export function generateNflTeamSeasonThemedWeek(pool, seed = 1) {
  const rng = createRng(seed);

  for (let attempt = 0; attempt < 300; attempt += 1) {
    const definitions = chooseThemeDefinitions(pool, rng);
    if (!definitions) continue;

    const usedRefs = new Set();
    const weeklyFranchiseCounts = {};
    const builtDays = [];
    let valid = true;

    for (const definition of definitions
      .slice()
      .sort((left, right) => BUILD_PRIORITY[left.family] - BUILD_PRIORITY[right.family])) {
      const day = buildThemeDay(pool, definition, usedRefs, weeklyFranchiseCounts, rng);
      if (!day) {
        valid = false;
        break;
      }

      for (const team of day.teams) {
        usedRefs.add(team.item_reference);
        weeklyFranchiseCounts[team.franchise_id] =
          (weeklyFranchiseCounts[team.franchise_id] ?? 0) + 1;
      }
      builtDays.push(day);
    }

    if (!valid) continue;

    const franchiseHistoryId = builtDays.find(
      (day) => day.family === "franchise_history",
    )?.variant;

    const tooManyFranchiseCards = Object.entries(weeklyFranchiseCounts).some(
      ([franchiseId, count]) => count > (franchiseId === franchiseHistoryId ? 4 : 3),
    );
    if (tooManyFranchiseCards) continue;

    const days = shuffle(builtDays, rng).map((day, index) => ({
      day_number: index + 1,
      ...day,
    }));

    const board = {
      version: "weekly-auction-nfl-team-season-themed-generator-2026-10-v1",
      seed,
      days,
    };
    if (validateNflTeamSeasonThemedWeek(board).length === 0) return board;
  }

  throw new Error("Unable to generate a valid NFL team-season themed week within retry budget.");
}

export function validateNflTeamSeasonThemedWeek(board) {
  const errors = [];
  if (board.days.length !== NFL_TEAM_SEASON_NORMAL_DAYS) {
    errors.push("week must contain exactly six normal auction days");
  }

  const teams = board.days.flatMap((day) => day.teams);
  if (teams.length !== NFL_TEAM_SEASON_NORMAL_DAYS * NFL_TEAM_SEASON_CARDS_PER_DAY) {
    errors.push("five-player week must contain exactly 24 normal-auction team-seasons");
  }
  if (new Set(teams.map((team) => team.item_reference)).size !== teams.length) {
    errors.push("team-season repeated within the same week");
  }
  if (new Set(board.days.map((day) => day.theme)).size !== board.days.length) {
    errors.push("public theme label repeated within the same week");
  }

  const familyCounts = {};
  for (const day of board.days) {
    familyCounts[day.family] = (familyCounts[day.family] ?? 0) + 1;
    if (day.teams.length !== NFL_TEAM_SEASON_CARDS_PER_DAY) {
      errors.push(`day ${day.day_number} does not contain four cards`);
      continue;
    }

    if (day.family === "division") {
      const divisions = new Set(
        day.teams.map((team) => NFL_DIVISION_BY_FRANCHISE[team.franchise_id]),
      );
      if (divisions.size !== 1 || !divisions.has(day.variant)) {
        errors.push(`day ${day.day_number} violates Division Spotlight eligibility`);
      }
      if (new Set(day.teams.map((team) => team.franchise_id)).size !== 4) {
        errors.push(`day ${day.day_number} Division Spotlight must show all four franchises`);
      }
    }

    if (
      day.family === "season"
      && day.teams.some((team) => team.season_year !== day.variant)
    ) {
      errors.push(`day ${day.day_number} violates Season Spotlight eligibility`);
    }

    if (day.family === "era") {
      const [start, end] =
        day.variant === "2000s"
          ? [2000, 2009]
          : day.variant === "2010s"
            ? [2010, 2019]
            : [2020, 2025];
      if (day.teams.some((team) => team.season_year < start || team.season_year > end)) {
        errors.push(`day ${day.day_number} violates era eligibility`);
      }
    }

    if (day.family === "rivalry") {
      const counts = day.teams.reduce((acc, team) => {
        acc[team.franchise_id] = (acc[team.franchise_id] ?? 0) + 1;
        return acc;
      }, {});
      const values = Object.values(counts).sort((left, right) => left - right);
      if (
        values.length !== 2
        || values[0] !== 2
        || values[1] !== 2
        || Object.keys(counts).some((franchiseId) => !day.variant.includes(franchiseId))
      ) {
        errors.push(`day ${day.day_number} violates rivalry eligibility`);
      }
    }

    if (
      day.family === "franchise_history"
      && (
        new Set(day.teams.map((team) => team.franchise_id)).size !== 1
        || day.teams[0]?.franchise_id !== day.variant
      )
    ) {
      errors.push(`day ${day.day_number} violates franchise-history eligibility`);
    }

    if (day.family === "fell_short" && day.teams.some((team) => !isFellShortCandidate(team))) {
      errors.push(`day ${day.day_number} violates fell-short eligibility`);
    }

    if (day.family === "conference_clash") {
      const afc = day.teams.filter((team) =>
        NFL_DIVISION_BY_FRANCHISE[team.franchise_id]?.startsWith("AFC"),
      ).length;
      if (afc !== 2) {
        errors.push(`day ${day.day_number} AFC vs NFC must contain two teams from each conference`);
      }
    }
  }

  for (const [family, count] of Object.entries(familyCounts)) {
    if (count > NFL_TEAM_SEASON_THEME_WEEKLY_CAPS[family]) {
      errors.push(`${family} exceeded its weekly cap`);
    }
  }

  const weeklyFranchiseCounts = teams.reduce((counts, team) => {
    counts[team.franchise_id] = (counts[team.franchise_id] ?? 0) + 1;
    return counts;
  }, {});
  const franchiseHistoryId = board.days.find(
    (day) => day.family === "franchise_history",
  )?.variant;
  for (const [franchiseId, count] of Object.entries(weeklyFranchiseCounts)) {
    const max = franchiseId === franchiseHistoryId ? 4 : 3;
    if (count > max) errors.push(`${franchiseId} appeared ${count} times in one week`);
  }

  return errors;
}

function publicCard(team) {
  return {
    item_reference: team.item_reference,
    season_year: team.season_year,
    franchise_id: team.franchise_id,
    team_name: team.team_name,
    display_label: team.display_label,
    record: team.record,
    postseason_finish: team.postseason_finish,
    card_tag: team.card_tag,
  };
}

export function revealNflTeamSeasonAuctionDay(board, dayNumber) {
  const day = board.days.find((candidate) => candidate.day_number === dayNumber);
  if (!day) throw new Error(`No normal auction day ${dayNumber} exists.`);
  return {
    version: board.version,
    day_number: day.day_number,
    theme: day.theme,
    family: day.family,
    teams: day.teams.map(publicCard),
  };
}

export function simulateNflTeamSeasonThemeGenerator(
  pool,
  weeks = 30000,
  seed = 1,
) {
  const familyCounts = {};
  const themeLabels = new Set();
  const familySequences = new Set();
  const maxFranchiseDistribution = {};
  const gradeBands = {
    "<85": 0,
    "85-89.5": 0,
    "90-94.5": 0,
    "95+": 0,
  };
  let generationFailures = 0;
  let invalidWeeks = 0;
  let gradeTotal = 0;
  let dailySpreadTotal = 0;

  for (let index = 0; index < weeks; index += 1) {
    let board;
    try {
      board = generateNflTeamSeasonThemedWeek(pool, seed + index);
    } catch {
      generationFailures += 1;
      continue;
    }

    const errors = validateNflTeamSeasonThemedWeek(board);
    if (errors.length) {
      invalidWeeks += 1;
      continue;
    }

    familySequences.add(board.days.map((day) => day.family).join("|"));
    const weeklyFranchiseCounts = {};

    for (const day of board.days) {
      familyCounts[day.family] = (familyCounts[day.family] ?? 0) + 1;
      themeLabels.add(day.theme);
      const grades = day.teams.map((team) => team.hidden_grade);
      dailySpreadTotal += Math.max(...grades) - Math.min(...grades);

      for (const team of day.teams) {
        gradeTotal += team.hidden_grade;
        weeklyFranchiseCounts[team.franchise_id] =
          (weeklyFranchiseCounts[team.franchise_id] ?? 0) + 1;

        if (team.hidden_grade < 85) gradeBands["<85"] += 1;
        else if (team.hidden_grade < 90) gradeBands["85-89.5"] += 1;
        else if (team.hidden_grade < 95) gradeBands["90-94.5"] += 1;
        else gradeBands["95+"] += 1;
      }
    }

    const maxFranchiseCount = Math.max(...Object.values(weeklyFranchiseCounts));
    maxFranchiseDistribution[maxFranchiseCount] =
      (maxFranchiseDistribution[maxFranchiseCount] ?? 0) + 1;
  }

  const validWeeks = weeks - generationFailures - invalidWeeks;
  const totalDays = validWeeks * NFL_TEAM_SEASON_NORMAL_DAYS;
  const totalCards = totalDays * NFL_TEAM_SEASON_CARDS_PER_DAY;

  return {
    version: "weekly-auction-nfl-team-season-themed-generator-calibration-2026-10-v1",
    pool_size: pool.length,
    simulated_weeks: weeks,
    generation_failures: generationFailures,
    invalid_weeks: invalidWeeks,
    distinct_family_sequences: familySequences.size,
    distinct_public_theme_labels: themeLabels.size,
    family_day_share_pct: Object.fromEntries(
      Object.entries(familyCounts).map(([family, count]) => [
        family,
        Number(((count / totalDays) * 100).toFixed(1)),
      ]),
    ),
    average_card_grade: Number((gradeTotal / totalCards).toFixed(2)),
    average_daily_grade_spread: Number((dailySpreadTotal / totalDays).toFixed(2)),
    grade_band_share_pct: Object.fromEntries(
      Object.entries(gradeBands).map(([band, count]) => [
        band,
        Number(((count / totalCards) * 100).toFixed(1)),
      ]),
    ),
    max_franchise_cards_per_week_pct: Object.fromEntries(
      Object.entries(maxFranchiseDistribution).map(([count, weeksAtCount]) => [
        count,
        Number(((weeksAtCount / validWeeks) * 100).toFixed(1)),
      ]),
    ),
  };
}

function runCli() {
  const pool = loadNflTeamSeasonAuctionPool();
  const report = simulateNflTeamSeasonThemeGenerator(pool);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  runCli();
}
