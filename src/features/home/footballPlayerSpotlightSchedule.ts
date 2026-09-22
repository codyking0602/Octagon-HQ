export type FootballSpotlightKind = "cfb" | "nfl";

export interface FootballPlayerSpotlight {
  name: string;
  team: string;
  position: string;
  stats: readonly { value: string; label: string }[];
  result: string;
  measurements: string;
  teamColor: string;
  highlightUrl: string;
}

export interface FootballPlayerSpotlightPair {
  id: string;
  activatesAt: string;
  spotlights: Readonly<Record<FootballSpotlightKind, FootballPlayerSpotlight>>;
}

export type FootballSpotlightPhotoSources = Readonly<
  Record<string, Readonly<Partial<Record<FootballSpotlightKind, string | null>>>>
>;

export const FOOTBALL_PLAYER_SPOTLIGHT_PAIRS: readonly FootballPlayerSpotlightPair[] = [
  {
    id: "2026-09-15-drew-josh",
    activatesAt: "2026-09-15T05:00:00.000Z",
    spotlights: {
      cfb: {
        name: "Drew Mestemaker",
        team: "Oklahoma State",
        position: "QB",
        stats: [
          { value: "317", label: "PYDS" },
          { value: "109", label: "RYDS" },
          { value: "426", label: "TOTAL YDS" },
          { value: "3", label: "TOTAL TDS" },
        ],
        result: "VS #6 OREGON · W 39–31",
        measurements: "6'3\" · 215 LB",
        teamColor: "#FF7300",
        highlightUrl: "https://youtu.be/Ia6UXgdSKw4?is=i2gxMRVoqonuhYtB",
      },
      nfl: {
        name: "Josh Allen",
        team: "Buffalo Bills",
        position: "QB",
        stats: [
          { value: "334", label: "PYDS" },
          { value: "2", label: "PASS TD" },
          { value: "2", label: "RUSH TD" },
          { value: "130.5", label: "QB RTG" },
        ],
        result: "AT HOUSTON · W 36–31",
        measurements: "6'5\" · 237 LB",
        teamColor: "#00338D",
        highlightUrl: "https://youtu.be/ZeJwLzd2I4E?is=a_f7gk7JKUEYJPZs",
      },
    },
  },
  {
    id: "2026-09-22-trinidad-dak",
    activatesAt: "2026-09-22T05:00:00.000Z",
    spotlights: {
      cfb: {
        name: "Trinidad Chambliss",
        team: "Ole Miss",
        position: "QB",
        stats: [
          { value: "363", label: "PYDS" },
          { value: "68.8", label: "CMP%" },
          { value: "2", label: "PASS TD" },
          { value: "1", label: "RUSH TD" },
        ],
        result: "VS #7 LSU · W 32–24",
        measurements: "6'0\" · 210 LB",
        teamColor: "#14213D",
        highlightUrl: "https://youtu.be/3j6ijizvXmg?is=VJY4f509RYu8TC0p",
      },
      nfl: {
        name: "Dak Prescott",
        team: "Dallas Cowboys",
        position: "QB",
        stats: [
          { value: "279", label: "PYDS" },
          { value: "4", label: "PASS TD" },
          { value: "143.8", label: "QB RTG" },
          { value: "83.9%", label: "CMP" },
        ],
        result: "VS WASHINGTON · W 37–20",
        measurements: "6'2\" · 230 LB",
        teamColor: "#041E42",
        highlightUrl: "https://youtu.be/7KEkO4RFFLM?is=0eBE2IagbqAG1SzX",
      },
    },
  },
] as const;

export const FOOTBALL_BASE_SPOTLIGHT_PAIR_ID = FOOTBALL_PLAYER_SPOTLIGHT_PAIRS[0].id;

export const FOOTBALL_DEFAULT_SPOTLIGHT_PHOTO_SOURCES: FootballSpotlightPhotoSources = {
  [FOOTBALL_BASE_SPOTLIGHT_PAIR_ID]: {},
  "2026-09-22-trinidad-dak": {
    cfb: "/assets/football/player-spotlight/2026-09-22-trinidad-dak/cfb.webp",
    nfl: "/assets/football/player-spotlight/2026-09-22-trinidad-dak/nfl.webp",
  },
};

export function footballSpotlightKindAt(now = new Date()): FootballSpotlightKind {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);

  if (weekday === "Sat") return "cfb";
  if (weekday === "Sun" || weekday === "Mon") return "nfl";
  return hour < 15 ? "cfb" : "nfl";
}

// Weekly rollover is atomic: a future pair cannot activate until both photos are preloaded.
export function footballSpotlightPairHasPhotos(
  pair: FootballPlayerSpotlightPair,
  photoSources: FootballSpotlightPhotoSources,
) {
  const photos = photoSources[pair.id];
  return Boolean(photos?.cfb && photos?.nfl);
}

export function footballSpotlightPairAt(
  now = new Date(),
  photoSources: FootballSpotlightPhotoSources = {},
) {
  const nowMs = now.getTime();
  let active = FOOTBALL_PLAYER_SPOTLIGHT_PAIRS[0];

  for (const pair of FOOTBALL_PLAYER_SPOTLIGHT_PAIRS) {
    if (Date.parse(pair.activatesAt) > nowMs) break;
    if (pair.id === FOOTBALL_BASE_SPOTLIGHT_PAIR_ID || footballSpotlightPairHasPhotos(pair, photoSources)) {
      active = pair;
    }
  }

  return active;
}

export function footballSpotlightNextPair(
  now = new Date(),
  photoSources: FootballSpotlightPhotoSources = {},
) {
  const active = footballSpotlightPairAt(now, photoSources);
  const activeIndex = FOOTBALL_PLAYER_SPOTLIGHT_PAIRS.findIndex((pair) => pair.id === active.id);
  return FOOTBALL_PLAYER_SPOTLIGHT_PAIRS[activeIndex + 1] ?? null;
}
