export type WeeklyStat = { label: string; value: string };
export type NbaWeeklySpotlight = {
  weekStart: string;
  weekEnd: string;
  publishedAt: string;
  player: {
    name: string;
    team: string;
    position: string;
    headshotUrl: string;
    profileUrl: string;
    highlightUrl: string;
    summary: string;
    stats: [WeeklyStat, WeeklyStat, WeeklyStat, WeeklyStat];
  };
  team: {
    name: string;
    teamId: string;
    logoUrl: string;
    profileUrl: string;
    record: string;
    ppg: string;
    oppPpg: string;
    netMargin: string;
    summary: string;
  };
};
function isHttpsFrom(url: unknown, host: RegExp) {
  if (typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && host.test(parsed.hostname);
  } catch { return false; }
}
export function readVerifiedNbaWeekly(raw: unknown): NbaWeeklySpotlight | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<NbaWeeklySpotlight>;
  const player = value.player, team = value.team;
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(value.weekStart ?? "")
    || !/^20\d{2}-\d{2}-\d{2}$/.test(value.weekEnd ?? "")
    || !value.publishedAt || !Number.isFinite(Date.parse(value.publishedAt))
    || !player || !team || !Array.isArray(player.stats) || player.stats.length !== 4) return null;
  const string = (v: unknown) => typeof v === "string" && v.trim().length > 0;
  if (![player.name,player.team,player.position,player.summary,team.name,team.teamId,
    team.record,team.ppg,team.oppPpg,team.netMargin,team.summary].every(string)) return null;
  if (!player.stats.every(s => s && string(s.label) && string(s.value))) return null;
  if (!isHttpsFrom(player.headshotUrl, /(^|\.)espncdn\.com$/i)
    || !isHttpsFrom(team.logoUrl, /(^|\.)espncdn\.com$/i)
    || !isHttpsFrom(player.profileUrl, /(^|\.)espn\.com$/i)
    || !isHttpsFrom(team.profileUrl, /(^|\.)espn\.com$/i)
    || !isHttpsFrom(player.highlightUrl, /^(www\.)?(youtube\.com|youtu\.be)$/i)) return null;
  const published = new Date(value.publishedAt);
  if (published.getTime() > Date.now() + 60_000) return null;
  return value as NbaWeeklySpotlight;
}
