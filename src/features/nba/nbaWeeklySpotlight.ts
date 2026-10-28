export type WeeklyStat = { label: string; value: string };
export type NbaWeeklySpotlight = {
  weekStart: string;
  weekEnd: string;
  publishedAt: string;
  player: {
    name: string;
    team: string;
    /** Verified abbreviation for the player's current NBA team. */
    teamId?: string;
    position: string;
    /** Number of verified final box scores contributing to the weekly averages. */
    gamesPlayed: number;
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
    /** ESPN season standings captured when this week's package was published. */
    seasonRecord?: string;
    conference?: "EAST" | "WEST";
    conferenceSeed?: number;
    standingsAsOf?: string;
    ppg: string;
    oppPpg: string;
    netMargin: string;
    /** Aggregate shooting over verified weekly final boxscores. */
    fgPct?: string;
    threePct?: string;
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
  if (player.teamId !== undefined && !/^[A-Z]{2,3}$/.test(player.teamId)) return null;
  if ([team.seasonRecord,team.conference,team.conferenceSeed,team.standingsAsOf].some(v=>v!==undefined)
    && (!/^\\d{1,2}-\\d{1,2}$/.test(team.seasonRecord ?? "")
      || !["EAST","WEST"].includes(team.conference ?? "")
      || !Number.isInteger(team.conferenceSeed) || (team.conferenceSeed ?? 0)<1 || (team.conferenceSeed ?? 0)>15
      || !team.standingsAsOf || !Number.isFinite(Date.parse(team.standingsAsOf)))) return null;
  if (team.fgPct !== undefined && !/^\d{1,3}\.\d$/.test(team.fgPct)) return null;
  if (team.threePct !== undefined && !/^\d{1,3}\.\d$/.test(team.threePct)) return null;
  if (!Number.isInteger(player.gamesPlayed) || player.gamesPlayed < 1 || player.gamesPlayed > 7
    || !player.stats.every(s => s && string(s.label) && string(s.value))) return null;
  if (!isHttpsFrom(player.headshotUrl, /(^|\.)espncdn\.com$/i)
    || !isHttpsFrom(team.logoUrl, /(^|\.)espncdn\.com$/i)
    || !isHttpsFrom(player.profileUrl, /^(www\.)?basketball-reference\.com$/i)
    || !(
      /^\/players\/[a-z]\/\w+\.html$/.test(new URL(player.profileUrl).pathname)
      || (new URL(player.profileUrl).pathname === "/search/search.fcgi"
          && new URL(player.profileUrl).searchParams.get("search") === player.name)
    )
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
