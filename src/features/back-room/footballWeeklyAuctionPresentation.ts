import type { CSSProperties } from "react";
import {
  cfbBestTeamSeasonPresentation,
  cfbBestTeamSeasonVisualIdentity,
} from "./cfbBestTeamSeasonPresentation";

export type FootballWeeklyAuctionTeamIdentity = {
  primary: string;
  primaryRgb: string;
  secondary: string;
  logoSrc: string | null;
  resume: string;
  sportsReferenceUrl: string;
};

const WILDCARD_PRESENTATION: Readonly<Record<string, FootballWeeklyAuctionTeamIdentity>> = Object.freeze({
  "weekly-cfb-boise-state-2006": { primary: "#0033A0", primaryRgb: "0, 51, 160", secondary: "#D64309", logoSrc: "https://a.espncdn.com/i/teamlogos/ncaa/500/68.png", resume: "13–0 · No. 5 Final AP · Won Fiesta Bowl", sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/boise-state/2006.html" },
  "weekly-cfb-hawaii-2007": { primary: "#024731", primaryRgb: "2, 71, 49", secondary: "#FFFFFF", logoSrc: "https://a.espncdn.com/i/teamlogos/ncaa/500/62.png", resume: "12–1 · No. 19 Final AP · Lost Sugar Bowl", sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/hawaii/2007.html" },
  "weekly-cfb-boise-state-2009": { primary: "#0033A0", primaryRgb: "0, 51, 160", secondary: "#D64309", logoSrc: "https://a.espncdn.com/i/teamlogos/ncaa/500/68.png", resume: "14–0 · No. 4 Final AP · Won Fiesta Bowl", sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/boise-state/2009.html" },
  "weekly-cfb-boise-state-2010": { primary: "#0033A0", primaryRgb: "0, 51, 160", secondary: "#D64309", logoSrc: "https://a.espncdn.com/i/teamlogos/ncaa/500/68.png", resume: "12–1 · No. 9 Final AP · Won Maaco Bowl", sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/boise-state/2010.html" },
  "weekly-cfb-boise-state-2011": { primary: "#0033A0", primaryRgb: "0, 51, 160", secondary: "#D64309", logoSrc: "https://a.espncdn.com/i/teamlogos/ncaa/500/68.png", resume: "12–1 · No. 8 Final AP · Won Maaco Bowl", sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/boise-state/2011.html" },
  "weekly-cfb-northern-illinois-2012": { primary: "#BA0C2F", primaryRgb: "186, 12, 47", secondary: "#000000", logoSrc: "https://a.espncdn.com/i/teamlogos/ncaa/500/2459.png", resume: "12–2 · No. 22 Final AP · Lost Orange Bowl", sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/northern-illinois/2012.html" },
  "weekly-cfb-fresno-state-2013": { primary: "#DB0032", primaryRgb: "219, 0, 50", secondary: "#13294B", logoSrc: "https://a.espncdn.com/i/teamlogos/ncaa/500/278.png", resume: "11–2 · Lost Las Vegas Bowl", sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/fresno-state/2013.html" },
  "weekly-cfb-western-michigan-2016": { primary: "#6C4023", primaryRgb: "108, 64, 35", secondary: "#B5A167", logoSrc: "https://a.espncdn.com/i/teamlogos/ncaa/500/2711.png", resume: "13–1 · No. 15 Final AP · Lost Cotton Bowl", sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/western-michigan/2016.html" },
  "weekly-cfb-coastal-carolina-2020": { primary: "#006F71", primaryRgb: "0, 111, 113", secondary: "#A27752", logoSrc: "https://a.espncdn.com/i/teamlogos/ncaa/500/324.png", resume: "11–1 · No. 14 Final AP · Lost Cure Bowl", sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/coastal-carolina/2020.html" },
  "weekly-cfb-liberty-2020": { primary: "#002D62", primaryRgb: "0, 45, 98", secondary: "#C41230", logoSrc: "https://a.espncdn.com/i/teamlogos/ncaa/500/2335.png", resume: "10–1 · No. 17 Final AP · Won Cure Bowl", sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/liberty/2020.html" },
  "weekly-cfb-tulane-2022": { primary: "#006747", primaryRgb: "0, 103, 71", secondary: "#418FDE", logoSrc: "https://a.espncdn.com/i/teamlogos/ncaa/500/2655.png", resume: "12–2 · No. 9 Final AP · Won Cotton Bowl", sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/tulane/2022.html" },
  "weekly-cfb-liberty-2023": { primary: "#002D62", primaryRgb: "0, 45, 98", secondary: "#C41230", logoSrc: "https://a.espncdn.com/i/teamlogos/ncaa/500/2335.png", resume: "13–1 · No. 25 Final AP · Lost Fiesta Bowl", sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/liberty/2023.html" },
  "weekly-cfb-boise-state-2024": { primary: "#0033A0", primaryRgb: "0, 51, 160", secondary: "#D64309", logoSrc: "https://a.espncdn.com/i/teamlogos/ncaa/500/68.png", resume: "12–2 · No. 8 Final AP · Lost Fiesta Bowl", sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/boise-state/2024.html" },
});

const SPORTS_REFERENCE_SLUGS: Readonly<Record<string, string>> = Object.freeze({
  "BYU": "brigham-young",
  "LSU": "louisiana-state",
  "Miami": "miami-fl",
  "NC State": "north-carolina-state",
  "Ole Miss": "mississippi",
  "Pitt": "pittsburgh",
  "SMU": "southern-methodist",
  "TCU": "texas-christian",
  "UCF": "central-florida",
  "USC": "southern-california",
});

function schoolSlug(school: string) {
  return SPORTS_REFERENCE_SLUGS[school] ?? school
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function footballWeeklyAuctionTeamIdentity(
  seasonReference: string,
  school: string,
  seasonYear: number,
): FootballWeeklyAuctionTeamIdentity {
  const wildcard = WILDCARD_PRESENTATION[seasonReference];
  if (wildcard) return wildcard;

  const season = cfbBestTeamSeasonPresentation(seasonReference);
  const visual = cfbBestTeamSeasonVisualIdentity(seasonReference);
  return {
    primary: visual?.primary ?? "#27445A",
    primaryRgb: visual?.primaryRgb ?? "39, 68, 90",
    secondary: visual?.secondary ?? "#FFFFFF",
    logoSrc: visual?.logoSrc ?? null,
    resume: season?.summary ?? school + " · " + seasonYear,
    sportsReferenceUrl: "https://www.sports-reference.com/cfb/schools/" + schoolSlug(school) + "/" + seasonYear + ".html",
  };
}

export function footballWeeklyAuctionTeamStyle(identity: FootballWeeklyAuctionTeamIdentity) {
  return {
    "--weekly-team": identity.primary,
    "--weekly-team-rgb": identity.primaryRgb,
    "--weekly-team-secondary": identity.secondary,
  } as CSSProperties;
}

export const FOOTBALL_WEEKLY_AUCTION_WILDCARD_PRESENTATION_COUNT = Object.keys(WILDCARD_PRESENTATION).length;
