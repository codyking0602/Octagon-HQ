export type SportsFeudHostSport = "ufc" | "nfl" | "cfb";

export const SPORTS_FEUD_MAIN_STAGE_ASSET = "/assets/sports-feud-main-stage.png";
export const SPORTS_FEUD_FAST_MONEY_STAGE_ASSET = "/assets/sports-feud-fast-money-stage.png";

export const SPORTS_FEUD_HOSTS: Record<SportsFeudHostSport, readonly [string, string, string]> = {
  ufc: ["/assets/1ufc.png", "/assets/2ufc.png", "/assets/3ufc.png"],
  nfl: ["/assets/1nfl.png", "/assets/2nfl.png", "/assets/3nfl.png"],
  cfb: ["/assets/1cfb.png", "/assets/2cfb.png", "/assets/3cfb.png"],
};

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

export function sportsFeudHostNumber(
  sport: SportsFeudHostSport,
  dateKey = sportsFeudCentralDateKey(),
) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const epochDay = Math.floor(
    Date.UTC(year || 1970, Math.max(0, (month || 1) - 1), day || 1) / 86_400_000,
  );
  const offset = sport === "cfb" ? 0 : sport === "nfl" ? 1 : 2;
  return ((epochDay + offset) % 3 + 3) % 3 + 1;
}

export function sportsFeudHostAsset(
  sport: SportsFeudHostSport,
  dateKey?: string,
) {
  return SPORTS_FEUD_HOSTS[sport][sportsFeudHostNumber(sport, dateKey) - 1];
}
