import type { DraftRoomModeId } from "../play/draftRoomContract";
import {
  buildQbTeamVisualIdentity,
  buildQbVisualIdentity,
  type BuildQbVisualIdentity,
} from "./buildQbVisualIdentity";
import { CFB_BUILD_QB_SCHOOL_COLORS } from "./cfbBuildQbVisualIdentity";
import { footballCfbTeamMediaId } from "./footballMediaIdentity";
import { footballSubjectAsset, footballTeamAssets } from "./footballSubjectAssets";

const NFL_TRIO_TEAM_BY_PLAYER: Readonly<Record<string, string>> = {
  "randall-cunningham": "PHI",
  "geno-smith": "SEA",
  "christian-mccaffrey": "SF",
  "saquon-barkley": "PHI",
  "todd-gurley": "LAR",
  "nick-chubb": "CLE",
  "jonathan-taylor": "IND",
  "bo-jackson": "LV",
  "alvin-kamara": "NO",
  "ezekiel-elliott": "DAL",
  "matt-forte": "CHI",
  "josh-jacobs": "GB",
  "aaron-jones": "MIN",
  "bijan-robinson": "ATL",
  "jahmyr-gibbs": "DET",
  "melvin-gordon": "LAC",
  "devonta-freeman": "ATL",
  "james-conner": "ARI",
  "david-montgomery": "DET",
  "najee-harris": "PIT",
  "breece-hall": "NYJ",
  "deangelo-williams": "CAR",
  "thomas-jones": "NYJ",
  "ronnie-brown": "MIA",
  "rhamondre-stevenson": "NE",
  "justin-jefferson": "MIN",
  "jamarr-chase": "CIN",
  "ceedee-lamb": "DAL",
  "michael-irvin": "DAL",
  "cooper-kupp": "LAR",
  "stefon-diggs": "BUF",
  "aj-brown": "PHI",
  "deebo-samuel": "SF",
  "sterling-sharpe": "GB",
  "ty-hilton": "IND",
  "brandin-cooks": "HOU",
  "jarvis-landry": "MIA",
  "adam-thielen": "MIN",
  "tyler-lockett": "SEA",
  "chris-godwin": "TB",
  "terry-mclaurin": "WAS",
  "dj-moore": "CHI",
  "dk-metcalf": "SEA",
  "mike-williams": "LAC",
  "courtland-sutton": "DEN",
  "devonta-smith": "PHI",
  "keyshawn-johnson": "TB",
};

const CFB_TRIO_FALLBACK_ESPN_ID: Readonly<Record<string, number>> = {
  "Arizona": 12,
  "Arkansas": 8,
  "Boise State": 68,
  "Georgia Tech": 59,
  "Indiana": 84,
  "Memphis": 235,
  "Michigan State": 127,
  "Oregon State": 204,
  "Penn State": 213,
  "UTEP": 2638,
  "West Virginia": 277,
};

function slugifyPlayer(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function rgbChannels(hex: string) {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}`;
}

function schoolCode(school: string) {
  const words = school.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0]!.slice(0, 3).toUpperCase();
  return words.map((word) => word[0]).join("").slice(0, 4).toUpperCase();
}

function teamCodeFromNflLogo(src: string | undefined) {
  const match = src?.match(/\/nfl\/500\/([a-z0-9]+)\.png(?:\?.*)?$/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function nflTrioVisualIdentity(displayLabel: string): BuildQbVisualIdentity | null {
  const playerSlug = slugifyPlayer(displayLabel);
  const buildIdentity = buildQbVisualIdentity(`build-qb-${playerSlug}`);
  if (buildIdentity) return buildIdentity;

  const subjectAsset = footballSubjectAsset(playerSlug);
  const subjectTeamCode = teamCodeFromNflLogo(subjectAsset?.src);
  const subjectIdentity = buildQbTeamVisualIdentity(subjectTeamCode);
  if (subjectAsset && subjectIdentity) {
    return {
      ...subjectIdentity,
      teamName: subjectAsset.label,
      logoSrc: subjectAsset.src,
    };
  }

  const fallbackCode = NFL_TRIO_TEAM_BY_PLAYER[playerSlug];
  return fallbackCode ? buildQbTeamVisualIdentity(fallbackCode) : null;
}

function cfbTrioVisualIdentity(displayLabel: string): BuildQbVisualIdentity | null {
  const match = /^(.*?) · (.+) (\d{4})$/.exec(displayLabel.trim());
  if (!match) return null;
  const school = match[2]!;
  const season = match[3]!;
  const colors = CFB_BUILD_QB_SCHOOL_COLORS[school];
  if (!colors) return null;

  const asset = footballTeamAssets[footballCfbTeamMediaId(school)];
  const fallbackEspnId = CFB_TRIO_FALLBACK_ESPN_ID[school];
  const logoSrc = asset?.src
    ?? (fallbackEspnId ? `https://a.espncdn.com/i/teamlogos/ncaa/500/${fallbackEspnId}.png` : null);

  return {
    teamCode: schoolCode(school),
    teamName: `${school} · ${season}`,
    primary: colors[0],
    primaryRgb: rgbChannels(colors[0]),
    secondary: colors[1],
    logoSrc,
  };
}

export function trioPlayerVisualIdentity(
  modeId: DraftRoomModeId,
  displayLabel: string,
): BuildQbVisualIdentity | null {
  return modeId === "trio-cfb"
    ? cfbTrioVisualIdentity(displayLabel)
    : modeId === "trio-nfl"
      ? nflTrioVisualIdentity(displayLabel)
      : null;
}
