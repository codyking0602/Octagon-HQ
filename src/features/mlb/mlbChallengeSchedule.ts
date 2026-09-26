export type MlbScheduledChallenge = {
  id: string;
  slot: number;
  title: string;
  kicker: string;
  description: string;
  route: string;
  date: string;
  game_type: string;
  ready: boolean;
  is_live: boolean;
};

type MlbScheduledChallengeDefinition = Omit<MlbScheduledChallenge, "is_live">;

export const MLB_POSTSEASON_CHALLENGE_SCHEDULE: readonly MlbScheduledChallengeDefinition[] = [
  {
    id: "mlb-2026-play-01",
    slot: 1,
    title: "Find the Leader",
    kicker: "FIND THE LEADER",
    description: "Two boards. Eliminate decoys and leave the stat leader standing.",
    route: "/mlb/challenge",
    date: "2026-09-29",
    game_type: "find_leader",
    ready: true,
  },
  {
    id: "mlb-2026-play-02",
    slot: 2,
    title: "Wavelength",
    kicker: "WAVELENGTH",
    description: "Two games. Four adaptive clues each.",
    route: "/mlb/challenge",
    date: "2026-10-01",
    game_type: "wavelength",
    ready: true,
  },
  {
    id: "mlb-2026-play-03",
    slot: 3,
    title: "Who Wants to Be a Millionaire?",
    kicker: "MILLIONAIRE",
    description: "Eight questions. Three lifelines. One postseason run.",
    route: "/mlb/challenge",
    date: "2026-10-03",
    game_type: "millionaire",
    ready: true,
  },
  {
    id: "mlb-2026-play-04",
    slot: 4,
    title: "Who Am I",
    kicker: "WHO AM I",
    description: "Identify the baseball name from a progressive clue ladder.",
    route: "/mlb/challenge",
    date: "2026-10-06",
    game_type: "who_am_i",
    ready: true,
  },
  {
    id: "mlb-2026-play-05",
    slot: 5,
    title: "Blind Resume",
    kicker: "BLIND RESUME",
    description: "Compare the resumes without the names.",
    route: "/mlb/challenge",
    date: "2026-10-09",
    game_type: "blind_resume",
    ready: false,
  },
  {
    id: "mlb-2026-play-06",
    slot: 6,
    title: "Featured Challenge",
    kicker: "MLB PLAYOFF CHALLENGE",
    description: "A new postseason challenge.",
    route: "/mlb/challenge",
    date: "2026-10-12",
    game_type: "open",
    ready: false,
  },
  {
    id: "mlb-2026-play-07",
    slot: 7,
    title: "Sports Feud",
    kicker: "SPORTS FEUD",
    description: "Clear the baseball board, then finish with Fast Money.",
    route: "/mlb/challenge",
    date: "2026-10-15",
    game_type: "sports_feud",
    ready: false,
  },
  {
    id: "mlb-2026-play-08",
    slot: 8,
    title: "Hit the Number",
    kicker: "HIT THE NUMBER",
    description: "Build a total without going over the target.",
    route: "/mlb/challenge",
    date: "2026-10-18",
    game_type: "hit_the_number",
    ready: false,
  },
  {
    id: "mlb-2026-play-09",
    slot: 9,
    title: "Who Wants to Be a Millionaire?",
    kicker: "MILLIONAIRE",
    description: "Eight questions. Three lifelines. One postseason run.",
    route: "/mlb/challenge",
    date: "2026-10-23",
    game_type: "millionaire",
    ready: false,
  },
  {
    id: "mlb-2026-play-10",
    slot: 10,
    title: "Wavelength",
    kicker: "WAVELENGTH",
    description: "Two games. Four adaptive clues each.",
    route: "/mlb/challenge",
    date: "2026-10-27",
    game_type: "wavelength",
    ready: true,
  },
] as const;

export function mlbCentralDateKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function resolveMlbFeaturedChallenge(now = new Date()): MlbScheduledChallenge | null {
  const dateKey = mlbCentralDateKey(now);
  const started = MLB_POSTSEASON_CHALLENGE_SCHEDULE.filter((challenge) => challenge.date <= dateKey);
  const definition = started.at(-1) ?? MLB_POSTSEASON_CHALLENGE_SCHEDULE[0] ?? null;
  if (!definition) return null;
  return {
    ...definition,
    is_live: definition.date <= dateKey,
  };
}
