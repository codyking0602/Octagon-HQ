import type { CSSProperties } from "react";

export interface FootballSpecialDailyTheme {
  day: string;
  eventLabel: string;
  matchup: string;
  resultLabel: string;
  teamName: string;
  opponentName: string;
  primary: string;
  secondary: string;
  teamLogo: string;
  opponentLogo: string;
  rivalryAccent?: string;
  opponentAccent?: string;
  videoUrl?: string;
}

const NFL_LOGO = (code: string) => `https://a.espncdn.com/i/teamlogos/nfl/500/${code}.png`;
const CFB_LOGO = (teamId: number) => `https://a.espncdn.com/i/teamlogos/ncaa/500/${teamId}.png`;

const THEMES: Readonly<Record<string, FootballSpecialDailyTheme>> = {
  "2026-10-10": {
    day: "2026-10-10",
    eventLabel: "RED RIVER EDITION",
    matchup: "TEXAS vs OKLAHOMA",
    resultLabel: "RED RIVER RESULT",
    teamName: "Texas",
    opponentName: "Oklahoma",
    primary: "#BF5700",
    secondary: "#F4E9DA",
    rivalryAccent: "#841617",
    videoUrl: "https://www.youtube.com/shorts/W4f0b2CwUGM",
    teamLogo: CFB_LOGO(251),
    opponentLogo: CFB_LOGO(201),
  },
  "2026-10-26": {
    day: "2026-10-26",
    eventLabel: "RIVALRY GAME EDITION",
    matchup: "COWBOYS @ EAGLES",
    resultLabel: "COWBOYS GAME DAY RESULT",
    teamName: "Dallas Cowboys",
    opponentName: "Philadelphia Eagles",
    opponentAccent: "#004C54",
    primary: "#041E42",
    secondary: "#A7B4C3",
    teamLogo: NFL_LOGO("dal"),
    opponentLogo: NFL_LOGO("phi"),
  },
  "2026-11-27": {
    day: "2026-11-27",
    eventLabel: "LONE STAR SHOWDOWN",
    matchup: "TEXAS @ TEXAS A&M",
    resultLabel: "LONE STAR SHOWDOWN RESULT",
    teamName: "Texas",
    opponentName: "Texas A&M",
    opponentAccent: "#500000",
    primary: "#BF5700",
    secondary: "#F4E9DA",
    teamLogo: CFB_LOGO(251),
    opponentLogo: CFB_LOGO(245),
  },
  "2026-12-07": {
    day: "2026-12-07",
    eventLabel: "COWBOYS GAME DAY",
    matchup: "COWBOYS @ SEAHAWKS",
    resultLabel: "COWBOYS GAME DAY RESULT",
    teamName: "Dallas Cowboys",
    opponentName: "Seattle Seahawks",
    opponentAccent: "#69BE28",
    primary: "#041E42",
    secondary: "#A7B4C3",
    teamLogo: NFL_LOGO("dal"),
    opponentLogo: NFL_LOGO("sea"),
  },
};

function rgbChannels(hex: string) {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}`;
}

export function footballSpecialDailyThemeForDay(day: string) {
  return THEMES[day] ?? null;
}

export function footballSpecialDailyThemeForCentralToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((value) => value.type === type)?.value ?? "";
  return footballSpecialDailyThemeForDay(`${part("year")}-${part("month")}-${part("day")}`);
}


export function footballSpecialDailyStyle(theme: FootballSpecialDailyTheme): CSSProperties {
  return {
    "--special-daily-primary": theme.primary,
    "--special-daily-primary-rgb": rgbChannels(theme.primary),
    "--special-daily-secondary": theme.secondary,
    "--special-daily-rivalry-accent": theme.rivalryAccent ?? theme.primary,
    "--special-daily-opponent": theme.opponentAccent ?? theme.rivalryAccent ?? theme.primary,
    "--special-daily-opponent-rgb": rgbChannels(theme.opponentAccent ?? theme.rivalryAccent ?? theme.primary),
  } as CSSProperties;
}

export function FootballSpecialDailyHubMark({ theme }: { theme: FootballSpecialDailyTheme }) {
  return (
    <div className="football-special-daily-hub-mark" aria-label={`${theme.eventLabel}: ${theme.matchup}`}>
      <span className="football-special-daily-hub-mark__logos" aria-hidden="true">
        <img src={theme.teamLogo} alt="" loading="lazy" referrerPolicy="no-referrer" />
        <b>×</b>
        <img src={theme.opponentLogo} alt="" loading="lazy" referrerPolicy="no-referrer" />
      </span>
      <span>
        <small>{theme.eventLabel}</small>
        <strong>{theme.matchup}</strong>
      </span>
    </div>
  );
}

export function FootballSpecialDailyChrome({
  theme,
  score = null,
  showIntro = false,
}: {
  theme: FootballSpecialDailyTheme;
  score?: number | null;
  showIntro?: boolean;
}) {
  return (
    <>
      {showIntro ? (
        <div className="football-special-daily-intro" aria-hidden="true">
          <div className="football-special-daily-intro__logos">
            <img src={theme.teamLogo} alt="" referrerPolicy="no-referrer" />
            <span>vs</span>
            <img src={theme.opponentLogo} alt="" referrerPolicy="no-referrer" />
          </div>
          <small>{theme.eventLabel}</small>
          <strong>{theme.matchup}</strong>
          <em>OCTAGON HQ · GAME DAY</em>
        </div>
      ) : null}

      <div className="football-special-daily-ribbon" aria-label={`${theme.eventLabel}: ${theme.matchup}`}>
        <span className="football-special-daily-ribbon__logos" aria-hidden="true">
          <img src={theme.teamLogo} alt="" referrerPolicy="no-referrer" />
          <img src={theme.opponentLogo} alt="" referrerPolicy="no-referrer" />
        </span>
        <span>
          <small>{score == null ? theme.eventLabel : theme.resultLabel}</small>
          <strong>{score == null ? theme.matchup : `${theme.matchup} · ${score}/100`}</strong>
        </span>
      </div>

      <img
        className="football-special-daily-watermark"
        src={theme.teamLogo}
        alt=""
        aria-hidden="true"
        referrerPolicy="no-referrer"
      />
    </>
  );
}
