import {
  footballCareerCfbProgramMediaOwners,
  footballCareerTeamMediaId,
} from "./footballCareerMediaContext";
import { footballComparisonDepthItems } from "./footballComparisonDepthCatalog";
import { footballFindLeaderProjectedCfbTeamMediaOwners } from "./footballFindLeaderRuntimeProjection";
import {
  footballCfbTeamMediaId,
  footballNflTeamMediaCode,
  footballNflTeamMediaId,
  footballTeamMediaIdFromComparisonAsset,
  type FootballTeamMediaId,
} from "./footballMediaIdentity";
import { getFootballSubject } from "./footballSubjectRegistry";

export type FootballSubjectAssetKind = "team-mark" | "program-mark";

export interface FootballSubjectAsset {
  src: string;
  kind: FootballSubjectAssetKind;
  label: string;
  darkSurfaceTreatment?: "light-backplate";
}

function nflMark(team: string, label: string): FootballSubjectAsset {
  const mediaCode = footballNflTeamMediaCode(team);
  return {
    src: `https://a.espncdn.com/i/teamlogos/nfl/500/${mediaCode}.png`,
    kind: "team-mark",
    label,
  };
}

function cfbMark(teamId: number, label: string): FootballSubjectAsset {
  return {
    src: `https://a.espncdn.com/i/teamlogos/ncaa/500/${teamId}.png`,
    kind: "program-mark",
    label,
    ...(teamId === 194 ? { darkSurfaceTreatment: "light-backplate" as const } : {}),
  };
}

const footballTeamAssetEntries = new Map<FootballTeamMediaId, FootballSubjectAsset>();

function registerFootballTeamAsset(teamId: FootballTeamMediaId, asset: FootballSubjectAsset) {
  const current = footballTeamAssetEntries.get(teamId);
  if (current && (current.src !== asset.src || current.kind !== asset.kind)) {
    throw new Error(`Conflicting Football media owner for ${teamId}`);
  }
  if (!current) footballTeamAssetEntries.set(teamId, asset);
}

const coreNflTeamAssets = [
  ["ARI", "Arizona Cardinals"],
  ["ATL", "Atlanta Falcons"],
  ["BAL", "Baltimore Ravens"],
  ["BUF", "Buffalo Bills"],
  ["CAR", "Carolina Panthers"],
  ["CHI", "Chicago Bears"],
  ["CIN", "Cincinnati Bengals"],
  ["CLE", "Cleveland Browns"],
  ["DAL", "Dallas Cowboys"],
  ["DEN", "Denver Broncos"],
  ["DET", "Detroit Lions"],
  ["GB", "Green Bay Packers"],
  ["HOU", "Houston Texans"],
  ["IND", "Indianapolis Colts"],
  ["JAX", "Jacksonville Jaguars"],
  ["KC", "Kansas City Chiefs"],
  ["LAC", "Los Angeles Chargers"],
  ["LAR", "Los Angeles Rams"],
  ["LV", "Las Vegas Raiders"],
  ["MIA", "Miami Dolphins"],
  ["MIN", "Minnesota Vikings"],
  ["NE", "New England Patriots"],
  ["NO", "New Orleans Saints"],
  ["NYG", "New York Giants"],
  ["NYJ", "New York Jets"],
  ["PHI", "Philadelphia Eagles"],
  ["PIT", "Pittsburgh Steelers"],
  ["SEA", "Seattle Seahawks"],
  ["SF", "San Francisco 49ers"],
  ["TB", "Tampa Bay Buccaneers"],
  ["TEN", "Tennessee Titans"],
  ["WSH", "Washington Commanders"],
] as const;

// NFL team marks are owned here so historical factual seasons do not depend on comparison-catalog coverage.
for (const [teamCode, label] of coreNflTeamAssets) {
  registerFootballTeamAsset(footballNflTeamMediaId(teamCode), nflMark(teamCode, label));
}

const coreCfbTeamAssets = [
  ["nebraska", 158, "Nebraska"],
  ["tennessee", 2633, "Tennessee"],
  ["florida-state", 52, "Florida State"],
  ["oklahoma", 201, "Oklahoma"],
  ["miami", 2390, "Miami"],
  ["ohio-state", 194, "Ohio State"],
  ["lsu", 99, "LSU"],
  ["usc", 30, "USC"],
  ["texas", 251, "Texas"],
  ["florida", 57, "Florida"],
  ["alabama", 333, "Alabama"],
  ["auburn", 2, "Auburn"],
  ["clemson", 228, "Clemson"],
  ["georgia", 61, "Georgia"],
] as const;

// Core CFB teams used by factual Find the Leader seasons. Each program owns one mark.
for (const [id, espnId, label] of coreCfbTeamAssets) {
  registerFootballTeamAsset(footballCfbTeamMediaId(id), cfbMark(espnId, label));
}

// Career media uses the same pinned CFB relationship corpus, registering each unambiguous program exactly once.
for (const { programName, sourceProgramId } of footballCareerCfbProgramMediaOwners) {
  registerFootballTeamAsset(
    footballCfbTeamMediaId(programName),
    cfbMark(Number(sourceProgramId), programName),
  );
}

// Projected factual CFB seasons carry their source program identity, so every eligible school owns one mark here.
for (const { programName, sourceProgramId } of footballFindLeaderProjectedCfbTeamMediaOwners) {
  registerFootballTeamAsset(
    footballCfbTeamMediaId(programName),
    cfbMark(Number(sourceProgramId), programName),
  );
}

// Comparison records contribute team relationships, but duplicate seasons collapse onto one team owner.
for (const item of footballComparisonDepthItems) {
  const teamId = footballTeamMediaIdFromComparisonAsset(item.asset);
  registerFootballTeamAsset(
    teamId,
    item.asset.kind === "nfl"
      ? nflMark(item.asset.team, item.asset.label)
      : cfbMark(item.asset.teamId, item.asset.label),
  );
}

export const footballTeamAssets: Readonly<Record<FootballTeamMediaId, FootballSubjectAsset>> = Object.freeze(
  Object.fromEntries(footballTeamAssetEntries) as Record<FootballTeamMediaId, FootballSubjectAsset>,
);

const comparisonPersonAssets = Object.fromEntries(
  footballComparisonDepthItems.flatMap((item) => {
    const subject = getFootballSubject(item.id);
    if (subject?.kind !== "player-career" && subject?.kind !== "coach") return [];
    const asset = item.asset.kind === "nfl"
      ? nflMark(item.asset.team, item.asset.label)
      : cfbMark(item.asset.teamId, item.asset.label);
    return [[item.id, asset] as const];
  }),
) as Readonly<Record<string, FootballSubjectAsset>>;

/**
 * Canonical person-card media that predates dedicated headshots.
 * Historical team/program records do not live here; they resolve through teamId.
 */
export const footballSubjectAssets: Readonly<Record<string, FootballSubjectAsset>> = {
  // NFL quarterbacks
  "tom-brady": nflMark("ne", "New England Patriots"),
  "patrick-mahomes": nflMark("kc", "Kansas City Chiefs"),
  "joe-montana": nflMark("sf", "San Francisco 49ers"),
  "peyton-manning": nflMark("ind", "Indianapolis Colts"),
  "aaron-rodgers": nflMark("gb", "Green Bay Packers"),
  "johnny-unitas": nflMark("ind", "Baltimore / Indianapolis Colts franchise"),
  "drew-brees": nflMark("no", "New Orleans Saints"),
  "dan-marino": nflMark("mia", "Miami Dolphins"),
  "john-elway": nflMark("den", "Denver Broncos"),
  "brett-favre": nflMark("gb", "Green Bay Packers"),
  "steve-young": nflMark("sf", "San Francisco 49ers"),
  "roger-staubach": nflMark("dal", "Dallas Cowboys"),
  "lamar-jackson": nflMark("bal", "Baltimore Ravens"),
  "kurt-warner": nflMark("lar", "Rams"),
  "terry-bradshaw": nflMark("pit", "Pittsburgh Steelers"),
  "ben-roethlisberger": nflMark("pit", "Pittsburgh Steelers"),
  "troy-aikman": nflMark("dal", "Dallas Cowboys"),
  "eli-manning": nflMark("nyg", "New York Giants"),
  "russell-wilson": nflMark("sea", "Seattle Seahawks"),
  "matt-ryan": nflMark("atl", "Atlanta Falcons"),
  "philip-rivers": nflMark("lac", "Chargers"),
  "matthew-stafford": nflMark("lar", "Los Angeles Rams"),
  "cam-newton": nflMark("car", "Carolina Panthers"),
  "donovan-mcnabb": nflMark("phi", "Philadelphia Eagles"),
  "tony-romo": nflMark("dal", "Dallas Cowboys"),
  "carson-palmer": nflMark("ari", "Arizona Cardinals"),
  "joe-flacco": nflMark("bal", "Baltimore Ravens"),
  "kirk-cousins": nflMark("min", "Minnesota Vikings"),
  "derek-carr": nflMark("lv", "Raiders"),
  "andy-dalton": nflMark("cin", "Cincinnati Bengals"),
  "jay-cutler": nflMark("chi", "Chicago Bears"),
  "ryan-fitzpatrick": nflMark("buf", "Buffalo Bills"),
  "carson-wentz": nflMark("phi", "Philadelphia Eagles"),
  "jameis-winston": nflMark("tb", "Tampa Bay Buccaneers"),
  "marcus-mariota": nflMark("ten", "Tennessee Titans"),
  "sam-bradford": nflMark("lar", "Rams"),
  "mitchell-trubisky": nflMark("chi", "Chicago Bears"),
  "zach-wilson": nflMark("nyj", "New York Jets"),
  "jamarcus-russell": nflMark("lv", "Raiders"),
  "ryan-leaf": nflMark("lac", "Chargers"),
  "johnny-manziel": nflMark("cle", "Cleveland Browns"),

  // NFL running backs
  "jim-brown": nflMark("cle", "Cleveland Browns"),
  "barry-sanders": nflMark("det", "Detroit Lions"),
  "walter-payton": nflMark("chi", "Chicago Bears"),
  "emmitt-smith": nflMark("dal", "Dallas Cowboys"),
  "adrian-peterson": nflMark("min", "Minnesota Vikings"),
  "ladainian-tomlinson": nflMark("lac", "Chargers"),
  "marshall-faulk": nflMark("lar", "Rams"),
  "derrick-henry": nflMark("ten", "Tennessee Titans"),
  "eric-dickerson": nflMark("lar", "Rams"),
  "oj-simpson": nflMark("buf", "Buffalo Bills"),
  "earl-campbell": nflMark("ten", "Oilers / Titans franchise"),
  "curtis-martin": nflMark("nyj", "New York Jets"),
  "thurman-thomas": nflMark("buf", "Buffalo Bills"),
  "tony-dorsett": nflMark("dal", "Dallas Cowboys"),
  "marcus-allen": nflMark("lv", "Raiders"),
  "edgerrin-james": nflMark("ind", "Indianapolis Colts"),
  "jerome-bettis": nflMark("pit", "Pittsburgh Steelers"),
  "terrell-davis": nflMark("den", "Denver Broncos"),
  "frank-gore": nflMark("sf", "San Francisco 49ers"),
  "lesean-mccoy": nflMark("phi", "Philadelphia Eagles"),
  "marshawn-lynch": nflMark("sea", "Seattle Seahawks"),
  "steven-jackson": nflMark("lar", "Rams"),
  "priest-holmes": nflMark("kc", "Kansas City Chiefs"),
  "jamaal-charles": nflMark("kc", "Kansas City Chiefs"),
  "shaun-alexander": nflMark("sea", "Seattle Seahawks"),
  "clinton-portis": nflMark("wsh", "Washington"),
  "tiki-barber": nflMark("nyg", "New York Giants"),
  "eddie-george": nflMark("ten", "Tennessee Titans"),
  "ricky-williams": nflMark("mia", "Miami Dolphins"),
  "chris-johnson": nflMark("ten", "Tennessee Titans"),
  "maurice-jones-drew": nflMark("jax", "Jacksonville Jaguars"),
  "arian-foster": nflMark("hou", "Houston Texans"),
  "demarco-murray": nflMark("dal", "Dallas Cowboys"),
  "mark-ingram": nflMark("no", "New Orleans Saints"),
  "reggie-bush": nflMark("no", "New Orleans Saints"),
  "david-johnson": nflMark("ari", "Arizona Cardinals"),
  "eddie-lacy": nflMark("gb", "Green Bay Packers"),
  "darren-mcfadden": nflMark("lv", "Raiders"),
  "peyton-hillis": nflMark("cle", "Cleveland Browns"),
  "ron-dayne": nflMark("nyg", "New York Giants"),
  "trent-richardson": nflMark("cle", "Cleveland Browns"),
  "montee-ball": nflMark("den", "Denver Broncos"),

  // NFL wide receivers
  "jerry-rice": nflMark("sf", "San Francisco 49ers"),
  "randy-moss": nflMark("min", "Minnesota Vikings"),
  "terrell-owens": nflMark("sf", "San Francisco 49ers"),
  "calvin-johnson": nflMark("det", "Detroit Lions"),
  "larry-fitzgerald": nflMark("ari", "Arizona Cardinals"),
  "marvin-harrison": nflMark("ind", "Indianapolis Colts"),
  "antonio-brown": nflMark("pit", "Pittsburgh Steelers"),
  "julio-jones": nflMark("atl", "Atlanta Falcons"),
  "andre-johnson": nflMark("hou", "Houston Texans"),
  "tyreek-hill": nflMark("kc", "Kansas City Chiefs"),
  "cris-carter": nflMark("min", "Minnesota Vikings"),
  "steve-smith-sr": nflMark("car", "Carolina Panthers"),
  "isaac-bruce": nflMark("lar", "Rams"),
  "torry-holt": nflMark("lar", "Rams"),
  "tim-brown": nflMark("lv", "Raiders"),
  "reggie-wayne": nflMark("ind", "Indianapolis Colts"),
  "deandre-hopkins": nflMark("hou", "Houston Texans"),
  "mike-evans": nflMark("tb", "Tampa Bay Buccaneers"),
  "hines-ward": nflMark("pit", "Pittsburgh Steelers"),
  "anquan-boldin": nflMark("ari", "Arizona Cardinals"),
  "davante-adams": nflMark("gb", "Green Bay Packers"),
  "chad-johnson": nflMark("cin", "Cincinnati Bengals"),
  "brandon-marshall": nflMark("chi", "Chicago Bears"),
  "aj-green": nflMark("cin", "Cincinnati Bengals"),
  "demaryius-thomas": nflMark("den", "Denver Broncos"),
  "dez-bryant": nflMark("dal", "Dallas Cowboys"),
  "wes-welker": nflMark("ne", "New England Patriots"),
  "keenan-allen": nflMark("lac", "Chargers"),
  "roddy-white": nflMark("atl", "Atlanta Falcons"),
  "odell-beckham-jr": nflMark("nyg", "New York Giants"),
  "jordy-nelson": nflMark("gb", "Green Bay Packers"),
  "amari-cooper": nflMark("lv", "Raiders"),
  "santonio-holmes": nflMark("pit", "Pittsburgh Steelers"),
  "plaxico-burress": nflMark("nyg", "New York Giants"),
  "michael-thomas": nflMark("no", "New Orleans Saints"),
  "percy-harvin": nflMark("min", "Minnesota Vikings"),
  "juju-smith-schuster": nflMark("pit", "Pittsburgh Steelers"),
  "braylon-edwards": nflMark("cle", "Cleveland Browns"),
  "josh-gordon": nflMark("cle", "Cleveland Browns"),
  "sammy-watkins": nflMark("buf", "Buffalo Bills"),
  "kenny-golladay": nflMark("det", "Detroit Lions"),
  "kelvin-benjamin": nflMark("car", "Carolina Panthers"),
  "tavon-austin": nflMark("lar", "Rams"),
  "justin-blackmon": nflMark("jax", "Jacksonville Jaguars"),
  "corey-coleman": nflMark("cle", "Cleveland Browns"),
  "nkeal-harry": nflMark("ne", "New England Patriots"),
  "charles-rogers": nflMark("det", "Detroit Lions"),

  // NFL head coaches
  "bill-belichick": nflMark("ne", "New England Patriots"),
  "vince-lombardi": nflMark("gb", "Green Bay Packers"),
  "don-shula": nflMark("mia", "Miami Dolphins"),
  "andy-reid": nflMark("kc", "Kansas City Chiefs"),
  "bill-walsh": nflMark("sf", "San Francisco 49ers"),
  "chuck-noll": nflMark("pit", "Pittsburgh Steelers"),
  "tom-landry": nflMark("dal", "Dallas Cowboys"),
  "paul-brown": nflMark("cle", "Cleveland Browns"),
  "joe-gibbs": nflMark("wsh", "Washington"),
  "bill-parcells": nflMark("nyg", "New York Giants"),
  "mike-tomlin": nflMark("pit", "Pittsburgh Steelers"),
  "marty-schottenheimer": nflMark("kc", "Kansas City Chiefs"),
  "john-harbaugh": nflMark("bal", "Baltimore Ravens"),
  "pete-carroll": nflMark("sea", "Seattle Seahawks"),
  "sean-mcvay": nflMark("lar", "Los Angeles Rams"),
  "sean-payton": nflMark("no", "New Orleans Saints"),
  "tom-coughlin": nflMark("nyg", "New York Giants"),
  "tony-dungy": nflMark("ind", "Indianapolis Colts"),
  "mike-shanahan": nflMark("den", "Denver Broncos"),
  "bill-cowher": nflMark("pit", "Pittsburgh Steelers"),
  "mike-holmgren": nflMark("gb", "Green Bay Packers"),
  "mike-mccarthy": nflMark("gb", "Green Bay Packers"),
  "bruce-arians": nflMark("tb", "Tampa Bay Buccaneers"),
  "doug-pederson": nflMark("phi", "Philadelphia Eagles"),
  "dan-quinn": nflMark("atl", "Atlanta Falcons"),
  "ron-rivera": nflMark("car", "Carolina Panthers"),
  "marvin-lewis": nflMark("cin", "Cincinnati Bengals"),
  "mike-vrabel": nflMark("ne", "New England Patriots"),
  "jeff-fisher": nflMark("ten", "Oilers / Titans franchise"),
  "rex-ryan": nflMark("nyj", "New York Jets"),
  "jason-garrett": nflMark("dal", "Dallas Cowboys"),
  "kliff-kingsbury": nflMark("ari", "Arizona Cardinals"),
  "adam-gase": nflMark("nyj", "New York Jets"),
  "josh-mcdaniels": nflMark("lv", "Las Vegas Raiders"),
  "matt-patricia": nflMark("det", "Detroit Lions"),
  "nathaniel-hackett": nflMark("den", "Denver Broncos"),
  "urban-meyer": nflMark("jax", "Jacksonville Jaguars"),
  "hue-jackson": nflMark("cle", "Cleveland Browns"),

  // Legacy college player cards remain person-scoped until dedicated headshots replace them.
  "cam-newton-2010": cfbMark(2, "Auburn"),
  "joe-burrow-2019": cfbMark(99, "LSU"),
  "vince-young-2005": cfbMark(251, "Texas"),
  "tim-tebow-2007": cfbMark(57, "Florida"),
  "lamar-jackson-2016": cfbMark(97, "Louisville"),
  "matt-leinart-2004": cfbMark(30, "USC"),
  "baker-mayfield-2017": cfbMark(201, "Oklahoma"),
  "trevor-lawrence-2018": cfbMark(228, "Clemson"),
  "marcus-mariota-2014": cfbMark(2483, "Oregon"),
  "johnny-manziel-2012": cfbMark(245, "Texas A&M"),
  "colt-mccoy-2008": cfbMark(251, "Texas"),
  "sam-bradford-2008": cfbMark(201, "Oklahoma"),
  "caleb-williams-2022": cfbMark(30, "USC"),
  "bryce-young-2021": cfbMark(333, "Alabama"),
  "jameis-winston-2013": cfbMark(52, "Florida State"),

  ...comparisonPersonAssets,
};

function subjectUsesTeamMedia(kind: string | undefined) {
  return kind === "player-season" || kind === "team-season" || kind === "program" || kind === "program-era";
}

function normalizedAssetIdentity(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

const nflCareerPersonAssetByName = new Map(
  Object.entries(footballSubjectAssets).map(([id, asset]) => [normalizedAssetIdentity(id), asset]),
);

/** One shared resolver for Football media. Historical records resolve through canonical identity first. */
export function footballSubjectAsset(itemId: string) {
  const subject = getFootballSubject(itemId);
  if (subject?.kind === "player-career") {
    const reviewedPersonAsset = footballSubjectAssets[itemId]
      ?? footballSubjectAssets[subject.id]
      ?? (subject.league === "NFL" ? nflCareerPersonAssetByName.get(normalizedAssetIdentity(subject.name)) : undefined);
    if (reviewedPersonAsset) return reviewedPersonAsset;

    const careerTeamId = footballCareerTeamMediaId(subject);
    return careerTeamId ? footballTeamAssets[careerTeamId] ?? null : null;
  }
  if (subject && subjectUsesTeamMedia(subject.kind)) {
    return subject.teamId ? footballTeamAssets[subject.teamId] ?? null : null;
  }
  return footballSubjectAssets[itemId] ?? null;
}
