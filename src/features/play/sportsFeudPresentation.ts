export type SportsFeudHostSport = "ufc" | "nfl" | "cfb";

export const SPORTS_FEUD_MAIN_STAGE_ASSET = "/assets/sports-feud-main-stage.png";
export const SPORTS_FEUD_FAST_MONEY_STAGE_ASSET = "/assets/sports-feud-fast-money-stage.png";

export const SPORTS_FEUD_HOSTS: Record<SportsFeudHostSport, readonly [string, string, string]> = {
  ufc: ["/assets/1ufc.png", "/assets/2ufc.png", "/assets/3ufc.png"],
  nfl: ["/assets/1nfl.png", "/assets/2nfl.png", "/assets/3nfl.png"],
  cfb: ["/assets/1cfb.png", "/assets/2cfb.png", "/assets/3cfb.png"],
};

const SPORTS_FEUD_HOST_ROTATION = {
  ufc: {
    launchDay: "2026-09-23",
    cycleLength: 30,
    appearanceSlots: [0, 9, 17, 25],
    firstHostNumber: 1,
  },
  cfb: {
    launchDay: "2026-09-23",
    cycleLength: 26,
    appearanceSlots: [0, 15],
    firstHostNumber: 3,
  },
  nfl: {
    launchDay: "2026-09-23",
    cycleLength: 26,
    appearanceSlots: [8, 22],
    firstHostNumber: 1,
  },
} as const satisfies Record<
  SportsFeudHostSport,
  {
    launchDay: string;
    cycleLength: number;
    appearanceSlots: readonly number[];
    firstHostNumber: 1 | 2 | 3;
  }
>;

function sportsFeudDayNumber(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Sports Feud day must use YYYY-MM-DD.");
  const [year, month, date] = day.split("-").map(Number);
  const stamp = Date.UTC(year!, month! - 1, date!);
  if (new Date(stamp).toISOString().slice(0, 10) !== day) throw new Error("Sports Feud day is invalid.");
  return Math.floor(stamp / 86_400_000);
}

function mod(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

export function sportsFeudCentralDateKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function sportsFeudHostAppearanceIndex(
  sport: SportsFeudHostSport,
  dateKey = sportsFeudCentralDateKey(),
) {
  const config = SPORTS_FEUD_HOST_ROTATION[sport];
  const offset = sportsFeudDayNumber(dateKey) - sportsFeudDayNumber(config.launchDay);
  if (offset < 0) return 0;

  const completedCycles = Math.floor(offset / config.cycleLength);
  const dayInCycle = mod(offset, config.cycleLength);
  const appearancesThisCycle = config.appearanceSlots.filter((slot) => slot <= dayInCycle).length;
  const appearancesThroughDay = completedCycles * config.appearanceSlots.length + appearancesThisCycle;
  return Math.max(0, appearancesThroughDay - 1);
}

export function sportsFeudHostNumber(
  sport: SportsFeudHostSport,
  dateKey = sportsFeudCentralDateKey(),
) {
  const config = SPORTS_FEUD_HOST_ROTATION[sport];
  const appearanceIndex = sportsFeudHostAppearanceIndex(sport, dateKey);
  return mod(config.firstHostNumber - 1 + appearanceIndex, 3) + 1;
}

export function sportsFeudHostAsset(
  sport: SportsFeudHostSport,
  dateKey?: string,
) {
  return SPORTS_FEUD_HOSTS[sport][sportsFeudHostNumber(sport, dateKey) - 1];
}
