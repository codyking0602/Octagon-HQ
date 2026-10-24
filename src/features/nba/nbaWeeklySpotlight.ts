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
    highlightUrl: string | null;
    /** Only videos verified against the official @NBA channel are accepted. */
    highlightSourceChannelId?: string;
    channelUrl?: string;
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
  if (![player.name,player.team,player.position,team.name,team.teamId,
    team.record,team.ppg,team.oppPpg,team.netMargin].every(string)) return null;
  if (!player.stats.every(s => s && string(s.label) && string(s.value))) return null;
  if (!isHttpsFrom(player.headshotUrl, /(^|\.)espncdn\.com$/i)
    || !isHttpsFrom(team.logoUrl, /(^|\.)espncdn\.com$/i)
    || !isHttpsFrom(player.profileUrl, /(^|\.)espn\.com$/i)
    || !isHttpsFrom(team.profileUrl, /^(www\.)?basketball-reference\.com$/i)
    || !/^\/teams\/[A-Z]{3}\/20\d{2}\.html$/.test(new URL(team.profileUrl).pathname)
    || Number(new URL(team.profileUrl).pathname.slice(-9,-5)) !== (
      Number(value.weekEnd?.slice(0,4)) + (Number(value.weekEnd?.slice(5,7)) >= 8 ? 1 : 0)
    )
    || (player.highlightUrl
      ? !isHttpsFrom(player.highlightUrl, /^(www\.)?(youtube\.com|youtu\.be)$/i)
        || player.highlightSourceChannelId !== "UCWJ2lWNubArHWmf3FIHbfcQ"
      : player.channelUrl !== "https://www.youtube.com/@NBA")) return null;
  const published = new Date(value.publishedAt);
  if (published.getTime() > Date.now() + 60_000) return null;
  return value as NbaWeeklySpotlight;
}

/** Football HQ-style editorial date, never the raw ISO range. */
export function nbaSpotlightWeekLabel(start: string, end: string): string {
  const from = new Date(start + "T12:00:00Z");
  const to = new Date(end + "T12:00:00Z");
  if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime())) return "THIS WEEK";
  if (start === "2026-10-20" && end === "2026-10-23") return "OPENING WEEK";
  const fmt = (d: Date) => d.toLocaleString("en-US", {month: "short", timeZone: "UTC"}).toUpperCase();
  const firstMonth = fmt(from), finalMonth = fmt(to);
  return firstMonth === finalMonth
    ? `${firstMonth} ${from.getUTCDate()}–${to.getUTCDate()}`
    : `${firstMonth} ${from.getUTCDate()}–${finalMonth} ${to.getUTCDate()}`;
}
