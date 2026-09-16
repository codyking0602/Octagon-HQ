import type { CSSProperties } from "react";
import {
  cfbBestTeamSeasonPresentation,
  cfbBestTeamSeasonVisualIdentity,
} from "./cfbBestTeamSeasonPresentation";
import { footballCfbTeamMediaId } from "./footballMediaIdentity";
import { footballTeamAssets } from "./footballSubjectAssets";

export type FootballWeeklyAuctionTeamIdentity = {
  primary: string;
  primaryRgb: string;
  secondary: string;
  logoSrc: string | null;
  resume: string;
  finalApRank: number | null;
  sportsReferenceUrl: string;
};

const FINAL_AP_RANK_BY_SEASON_REFERENCE: Readonly<Record<string, number | null>> = Object.freeze({
  "cfb-best-oklahoma-2000": 1,
  "cfb-best-lsu-2003": 2,
  "cfb-best-auburn-2004": 2,
  "cfb-best-texas-2005": 1,
  "cfb-best-florida-2006": 1,
  "cfb-best-lsu-2007": 1,
  "cfb-best-florida-2008": 1,
  "cfb-best-oklahoma-2008": 5,
  "cfb-best-alabama-2009": 1,
  "cfb-best-auburn-2010": 1,
  "cfb-best-alabama-2011": 1,
  "cfb-best-lsu-2011": 2,
  "cfb-best-alabama-2012": 1,
  "cfb-best-texas-aandm-2012": 5,
  "cfb-best-auburn-2013": 2,
  "cfb-best-missouri-2013": 5,
  "cfb-best-south-carolina-2013": 4,
  "cfb-best-mississippi-state-2014": 11,
  "cfb-best-alabama-2015": 1,
  "cfb-best-alabama-2016": 2,
  "cfb-best-georgia-2017": 2,
  "cfb-best-arkansas-2011": 5,
  "cfb-best-lsu-2019": 1,
  "cfb-best-alabama-2020": 1,
  "cfb-best-georgia-2021": 1,
  "cfb-best-ole-miss-2023": 9,
  "cfb-best-tennessee-2022": 6,
  "cfb-best-georgia-2022": 1,
  "cfb-best-georgia-2023": 4,
  "cfb-best-texas-2023": 3,
  "cfb-best-kentucky-2018": 12,
  "cfb-best-vanderbilt-2025": 15,
  "cfb-best-nebraska-2001": 4,
  "cfb-best-ohio-state-2002": 2,
  "cfb-best-usc-2003": 1,
  "cfb-best-usc-2004": 1,
  "cfb-best-usc-2005": 2,
  "cfb-best-penn-state-2005": 3,
  "cfb-best-ohio-state-2006": 2,
  "cfb-best-usc-2008": 3,
  "cfb-best-iowa-2009": 7,
  "cfb-best-oregon-2010": 3,
  "cfb-best-wisconsin-2010": 7,
  "cfb-best-wisconsin-2011": 10,
  "cfb-best-oregon-2012": 2,
  "cfb-best-michigan-state-2013": 3,
  "cfb-best-ohio-state-2014": 1,
  "cfb-best-oregon-2014": 2,
  "cfb-best-iowa-2015": 9,
  "cfb-best-michigan-state-2015": 6,
  "cfb-best-penn-state-2016": 7,
  "cfb-best-washington-2016": 4,
  "cfb-best-wisconsin-2017": 7,
  "cfb-best-ohio-state-2019": 3,
  "cfb-best-minnesota-2019": 10,
  "cfb-best-ohio-state-2020": 2,
  "cfb-best-michigan-2021": 3,
  "cfb-best-michigan-2022": 3,
  "cfb-best-michigan-2023": 1,
  "cfb-best-washington-2023": 2,
  "cfb-best-oregon-2024": 3,
  "cfb-best-ohio-state-2024": 1,
  "cfb-best-penn-state-2024": 5,
  "cfb-best-indiana-2025": 1,
  "cfb-best-colorado-2001": 3,
  "cfb-best-utah-2004": 4,
  "cfb-best-west-virginia-2005": 5,
  "cfb-best-kansas-2007": 7,
  "cfb-best-west-virginia-2007": 6,
  "cfb-best-utah-2008": 2,
  "cfb-best-texas-tech-2008": 12,
  "cfb-best-cincinnati-2009": 8,
  "cfb-best-tcu-2010": 2,
  "cfb-best-houston-2011": 18,
  "cfb-best-oklahoma-state-2011": 3,
  "cfb-best-kansas-state-2012": 12,
  "cfb-best-baylor-2013": 13,
  "cfb-best-ucf-2013": 10,
  "cfb-best-arizona-2014": 19,
  "cfb-best-baylor-2014": 7,
  "cfb-best-tcu-2014": 3,
  "cfb-best-houston-2015": 8,
  "cfb-best-ucf-2017": 6,
  "cfb-best-byu-2020": 11,
  "cfb-best-iowa-state-2020": 9,
  "cfb-best-baylor-2021": 5,
  "cfb-best-cincinnati-2021": 4,
  "cfb-best-oklahoma-state-2021": 7,
  "cfb-best-kansas-state-2022": 14,
  "cfb-best-tcu-2022": 2,
  "cfb-best-arizona-2023": 11,
  "cfb-best-arizona-state-2024": 7,
  "cfb-best-byu-2024": 13,
  "cfb-best-iowa-state-2024": 15,
  "cfb-best-texas-tech-2025": 7,
  "cfb-best-byu-2025": 11,
  "cfb-best-miami-2000": 2,
  "cfb-best-miami-2001": 1,
  "cfb-best-miami-2002": 1,
  "cfb-best-florida-state-2000": 5,
  "cfb-best-nc-state-2002": 17,
  "cfb-best-california-2004": 9,
  "cfb-best-virginia-tech-2004": 10,
  "cfb-best-virginia-tech-2005": 7,
  "cfb-best-louisville-2006": 6,
  "cfb-best-wake-forest-2006": 18,
  "cfb-best-boston-college-2007": 11,
  "cfb-best-virginia-tech-2007": 9,
  "cfb-best-virginia-tech-2010": 16,
  "cfb-best-stanford-2010": 4,
  "cfb-best-stanford-2011": 7,
  "cfb-best-florida-state-2012": 10,
  "cfb-best-stanford-2012": 7,
  "cfb-best-duke-2013": 23,
  "cfb-best-florida-state-2013": 1,
  "cfb-best-louisville-2013": 15,
  "cfb-best-florida-state-2014": 6,
  "cfb-best-georgia-tech-2014": 8,
  "cfb-best-stanford-2015": 3,
  "cfb-best-clemson-2015": 2,
  "cfb-best-north-carolina-2015": 15,
  "cfb-best-clemson-2016": 1,
  "cfb-best-clemson-2018": 1,
  "cfb-best-clemson-2019": 2,
  "cfb-best-pitt-2021": 13,
  "cfb-best-florida-state-2023": 7,
  "cfb-best-smu-2024": 12,
  "cfb-best-miami-2025": 2,
  "cfb-best-notre-dame-2012": 4,
  "cfb-best-notre-dame-2018": 5,
  "cfb-best-notre-dame-2020": 5,
  "cfb-best-notre-dame-2024": 2,
  "weekly-cfb-boise-state-2006": 5,
  "weekly-cfb-hawaii-2007": 19,
  "weekly-cfb-boise-state-2009": 4,
  "weekly-cfb-boise-state-2010": 9,
  "weekly-cfb-boise-state-2011": 8,
  "weekly-cfb-northern-illinois-2012": 22,
  "weekly-cfb-fresno-state-2013": null,
  "weekly-cfb-western-michigan-2016": 15,
  "weekly-cfb-coastal-carolina-2020": 14,
  "weekly-cfb-liberty-2020": 17,
  "weekly-cfb-tulane-2022": 9,
  "weekly-cfb-liberty-2023": 25,
  "weekly-cfb-boise-state-2024": 8,
});

const WILDCARD_PRESENTATION: Readonly<Record<string, Omit<FootballWeeklyAuctionTeamIdentity, "finalApRank">>> = Object.freeze({
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
  if (wildcard) {
    return {
      ...wildcard,
      finalApRank: FINAL_AP_RANK_BY_SEASON_REFERENCE[seasonReference] ?? null,
    };
  }

  const season = cfbBestTeamSeasonPresentation(seasonReference);
  const visual = cfbBestTeamSeasonVisualIdentity(seasonReference);
  const fallbackAsset = footballTeamAssets[footballCfbTeamMediaId(school)];
  return {
    primary: visual?.primary ?? "#27445A",
    primaryRgb: visual?.primaryRgb ?? "39, 68, 90",
    secondary: visual?.secondary ?? "#FFFFFF",
    logoSrc: visual?.logoSrc ?? fallbackAsset?.src ?? null,
    resume: season?.summary ?? school + " · " + seasonYear,
    finalApRank: FINAL_AP_RANK_BY_SEASON_REFERENCE[seasonReference] ?? null,
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
