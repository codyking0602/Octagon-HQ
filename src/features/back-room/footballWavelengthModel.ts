import { desiredWavelengthCorrection } from "../play/wavelengthEngine";
import {
  seededLineupRandom,
  selectReplayLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import { footballWavelengthExpansionCategories } from "./footballWavelengthExpansionCatalog";
import { footballWavelengthCanonicalSubjectForClue } from "./footballWavelengthSubjectAuthority";

export const FOOTBALL_WAVELENGTH_GAME_ID = "football-wavelength";
export const FOOTBALL_WAVELENGTH_CATALOG_VERSION = "football-wavelength-catalog-v3" as const;
export const FOOTBALL_WAVELENGTH_CALIBRATION_VERSION = "football-wavelength-calibration-v2" as const;

export type FootballWavelengthCategory =
  | "NFL LEGACY"
  | "GUNSLINGER"
  | "QB CARRY JOB"
  | "OFFENSIVE CHAOS"
  | "FANBASE INSANITY"
  | "PROGRAM TRADITION"
  | "UNIFORM QUALITY"
  | "STADIUM ATMOSPHERE"
  | "RIVALRY HATRED"
  | "SYSTEM QB PERCEPTION"
  | "COACHING CHAOS"
  | "OFFENSIVE INNOVATION"
  | "DEFENSIVE TERROR"
  | "DRAFT BUST"
  | "CLUTCH REPUTATION"
  | "CHOKE REPUTATION"
  | "FRANCHISE TRADITION"
  | "FOOTBALL WEIRDNESS"
  | "MEDIA ENERGY"
  | "TAILGATE CULTURE"
  | "COACHING GENIUS"
  | "HOME-FIELD ADVANTAGE"
  | "FOOTBALL VILLAINY"
  | "FRANCHISE DYSFUNCTION"
  | "OFFENSIVE FIREPOWER"
  | "BIG ARM TALENT"
  | "ATHLETIC FREAK";

export type FootballWavelengthThemeFamily =
  | "quarterback"
  | "offense"
  | "defense-athleticism"
  | "tradition-organization"
  | "game-day-culture"
  | "coaching-media"
  | "reputation";

const FOOTBALL_WAVELENGTH_THEME_FAMILY_BY_CATEGORY = {
  "NFL LEGACY": "reputation",
  GUNSLINGER: "quarterback",
  "QB CARRY JOB": "quarterback",
  "OFFENSIVE CHAOS": "offense",
  "FANBASE INSANITY": "game-day-culture",
  "PROGRAM TRADITION": "tradition-organization",
  "UNIFORM QUALITY": "game-day-culture",
  "STADIUM ATMOSPHERE": "game-day-culture",
  "RIVALRY HATRED": "game-day-culture",
  "SYSTEM QB PERCEPTION": "quarterback",
  "COACHING CHAOS": "coaching-media",
  "OFFENSIVE INNOVATION": "offense",
  "DEFENSIVE TERROR": "defense-athleticism",
  "DRAFT BUST": "reputation",
  "CLUTCH REPUTATION": "reputation",
  "CHOKE REPUTATION": "reputation",
  "FRANCHISE TRADITION": "tradition-organization",
  "FOOTBALL WEIRDNESS": "game-day-culture",
  "MEDIA ENERGY": "coaching-media",
  "TAILGATE CULTURE": "game-day-culture",
  "COACHING GENIUS": "coaching-media",
  "HOME-FIELD ADVANTAGE": "game-day-culture",
  "FOOTBALL VILLAINY": "reputation",
  "FRANCHISE DYSFUNCTION": "tradition-organization",
  "OFFENSIVE FIREPOWER": "offense",
  "BIG ARM TALENT": "quarterback",
  "ATHLETIC FREAK": "defense-athleticism",
} as const satisfies Record<FootballWavelengthCategory, FootballWavelengthThemeFamily>;

export function footballWavelengthThemeFamilyForCategory(category: FootballWavelengthCategory) {
  return FOOTBALL_WAVELENGTH_THEME_FAMILY_BY_CATEGORY[category];
}

export interface FootballWavelengthClue {
  id: string;
  category: FootballWavelengthCategory;
  text: string;
  rating: number;
}

export interface FootballWavelengthRound {
  target: number;
  clues: FootballWavelengthClue[];
}

export interface FootballWavelengthRun {
  seed: string;
  initialRound: FootballWavelengthRound;
  identity: PlayLineupIdentity;
}

export interface FootballWavelengthCategoryAnchor {
  category: FootballWavelengthCategory;
  ratingQuestion: string;
  bottomTier: string;
  average: string;
  exceptional: string;
}

export const FOOTBALL_WAVELENGTH_RATING_BANDS = [
  { label: "bottom-tier", min: 1, max: 10, meaning: "almost no credible case for the stated football trait" },
  { label: "poor", min: 11, max: 30, meaning: "clearly weak or rarely associated with the stated football trait" },
  { label: "below-average", min: 31, max: 45, meaning: "some recognizable case, but below a normal football baseline" },
  { label: "average", min: 46, max: 60, meaning: "a credible middle-of-the-scale example for the exact question" },
  { label: "strong", min: 61, max: 79, meaning: "clearly associated with the trait without being an era-defining benchmark" },
  { label: "elite", min: 80, max: 89, meaning: "excellent, famous, or unusually strong for the stated football trait" },
  { label: "exceptional", min: 90, max: 100, meaning: "iconic to virtually unimprovable for the exact question" },
] as const;

export const FOOTBALL_WAVELENGTH_CATEGORY_ANCHORS: readonly FootballWavelengthCategoryAnchor[] = [
  { category: "NFL LEGACY", ratingQuestion: "How large is this subject's NFL legacy?", bottomTier: "NFL footnote", average: "Meaningful NFL career", exceptional: "Defining NFL history" },
  { category: "GUNSLINGER", ratingQuestion: "How strong is the gunslinger tendency?", bottomTier: "Risk-averse distributor", average: "Will challenge windows", exceptional: "Lives for the dangerous throw" },
  { category: "QB CARRY JOB", ratingQuestion: "How much does the quarterback feel like the engine carrying the offense?", bottomTier: "Mostly along for the ride", average: "Important co-driver", exceptional: "The offense lives or dies with him" },
  { category: "OFFENSIVE CHAOS", ratingQuestion: "How chaotic is the offensive experience?", bottomTier: "Rigid and predictable", average: "Normal variation", exceptional: "Beautiful football anarchy" },
  { category: "FANBASE INSANITY", ratingQuestion: "How irrationally intense is the fanbase?", bottomTier: "Detached", average: "Normal committed fandom", exceptional: "Football is a civic religion" },
  { category: "PROGRAM TRADITION", ratingQuestion: "How deep is the college program's football tradition?", bottomTier: "Little historical weight", average: "Real regional history", exceptional: "Foundational blue-blood tradition" },
  { category: "UNIFORM QUALITY", ratingQuestion: "How good is the football uniform identity?", bottomTier: "Design liability", average: "Perfectly fine look", exceptional: "Untouchable football aesthetic" },
  { category: "STADIUM ATMOSPHERE", ratingQuestion: "How intimidating and memorable is the live football atmosphere?", bottomTier: "Sterile", average: "Solid game-day energy", exceptional: "Bucket-list football environment" },
  { category: "RIVALRY HATRED", ratingQuestion: "How much genuine hatred and emotional weight does the rivalry carry?", bottomTier: "Mostly schedule trivia", average: "Real rivalry", exceptional: "365-day identity-level hatred" },
  { category: "SYSTEM QB PERCEPTION", ratingQuestion: "How strong is the perception that the quarterback's success is system-driven?", bottomTier: "Seen as system-proof", average: "Scheme gets real credit", exceptional: "The system-QB label defines the conversation" },
  { category: "COACHING CHAOS", ratingQuestion: "How chaotic is the coach's football orbit?", bottomTier: "Corporate calm", average: "Normal coaching drama", exceptional: "Every week can become a documentary" },
  { category: "OFFENSIVE INNOVATION", ratingQuestion: "How innovative is the offensive football idea or coach?", bottomTier: "Actively stale", average: "Useful modern offense", exceptional: "Changed how football is played" },
  { category: "DEFENSIVE TERROR", ratingQuestion: "How terrifying is this defense or defender to face?", bottomTier: "Offenses circle the matchup", average: "Respectable resistance", exceptional: "Historic nightmare fuel" },
  { category: "DRAFT BUST", ratingQuestion: "How severe is the draft-bust reputation?", bottomTier: "Massive draft value", average: "Disappointing relative to cost", exceptional: "All-time draft disaster" },
  { category: "CLUTCH REPUTATION", ratingQuestion: "How strong is the subject's clutch football reputation?", bottomTier: "Fans expect the late failure", average: "Mixed big-moment record", exceptional: "Late-game mythology" },
  { category: "CHOKE REPUTATION", ratingQuestion: "How strong is the choke reputation?", bottomTier: "Almost immune to the label", average: "Some painful scars", exceptional: "The collapse became the identity" },
  { category: "FRANCHISE TRADITION", ratingQuestion: "How deep is the NFL franchise's tradition?", bottomTier: "Young or historically thin", average: "Real league history", exceptional: "Foundational NFL institution" },
  { category: "FOOTBALL WEIRDNESS", ratingQuestion: "How weird is this football moment, rule, or tradition?", bottomTier: "Completely ordinary", average: "Noticeably quirky", exceptional: "Only football could produce this" },
  { category: "MEDIA ENERGY", ratingQuestion: "How much football-media personality energy does this subject create?", bottomTier: "Deliberately low-key", average: "Useful football personality", exceptional: "Content machine" },
  { category: "TAILGATE CULTURE", ratingQuestion: "How strong is the tailgate and pregame culture?", bottomTier: "Minimal ritual", average: "Good parking-lot scene", exceptional: "Destination-level football pilgrimage" },
  { category: "COACHING GENIUS", ratingQuestion: "How strong is the case that this coach is a football genius?", bottomTier: "Actively outcoached", average: "Credible high-level coach", exceptional: "Changed what elite coaching looks like" },
  { category: "HOME-FIELD ADVANTAGE", ratingQuestion: "How much real home-field advantage does this environment create?", bottomTier: "Barely feels like home", average: "Useful home edge", exceptional: "The venue changes the game" },
  { category: "FOOTBALL VILLAINY", ratingQuestion: "How strong is the football-villain aura?", bottomTier: "Almost impossible to hate", average: "Draws real opposing heat", exceptional: "The sport needs them as the bad guy" },
  { category: "FRANCHISE DYSFUNCTION", ratingQuestion: "How dysfunctional is the NFL franchise or era?", bottomTier: "Model stability", average: "Normal NFL messiness", exceptional: "Organizational chaos is the brand" },
  { category: "OFFENSIVE FIREPOWER", ratingQuestion: "How overwhelming is the offensive firepower?", bottomTier: "Points feel accidental", average: "Functional scoring offense", exceptional: "Every possession threatens a touchdown" },
  { category: "BIG ARM TALENT", ratingQuestion: "How freakish is the quarterback's raw arm talent?", bottomTier: "Arm strength is a limitation", average: "Enough arm for every normal throw", exceptional: "The field has almost no arm-strength limit" },
  { category: "ATHLETIC FREAK", ratingQuestion: "How extreme is the subject's raw football athleticism?", bottomTier: "Wins almost entirely without physical gifts", average: "Normal pro-level athlete", exceptional: "Combine-video-game physical specimen" },
] as const;

type FootballWavelengthSeed = readonly [id: string, text: string, rating: number];

function defineFootballWavelengthCategory(
  category: FootballWavelengthCategory,
  prefix: string,
  seeds: readonly FootballWavelengthSeed[],
): readonly FootballWavelengthClue[] {
  return seeds.map(([id, text, rating]) => ({ id: `${prefix}-${id}`, category, text, rating }));
}

const baseFootballWavelengthClues: readonly FootballWavelengthClue[] = [
  ...defineFootballWavelengthCategory("NFL LEGACY", "legacy", [
    ["ryan-leaf", "Ryan Leaf", 1],
    ["jamarcus-russell", "JaMarcus Russell", 3],
    ["tebow", "Tim Tebow", 5],
    ["reggie-bush", "Reggie Bush", 11],
    ["vince-young", "Vince Young", 18],
    ["matt-leinart", "Matt Leinart", 24],
    ["cam-newton", "Cam Newton", 55],
    ["tony-romo", "Tony Romo", 64],
    ["lamar-jackson", "Lamar Jackson", 72],
    ["eli-manning", "Eli Manning", 82],
    ["drew-brees", "Drew Brees", 90],
    ["peyton-manning", "Peyton Manning", 91],
    ["aaron-rodgers", "Aaron Rodgers", 95],
    ["patrick-mahomes", "Patrick Mahomes", 97],
    ["tom-brady", "Tom Brady", 100],
  ]),
  ...defineFootballWavelengthCategory("GUNSLINGER", "gunslinger", [
    ["chad-pennington", "Chad Pennington", 6],
    ["alex-smith", "Alex Smith", 12],
    ["brock-purdy", "Brock Purdy", 28],
    ["jared-goff", "Jared Goff", 43],
    ["kirk-cousins", "Kirk Cousins", 49],
    ["tom-brady", "Tom Brady", 56],
    ["joe-flacco", "Joe Flacco", 68],
    ["baker-mayfield", "Baker Mayfield", 76],
    ["stafford", "Matthew Stafford", 80],
    ["mahomes", "Patrick Mahomes", 88],
    ["romo", "Tony Romo", 90],
    ["rex-grossman", "Rex Grossman", 92],
    ["jay-cutler", "Jay Cutler", 94],
    ["favre", "Brett Favre", 97],
    ["josh-allen", "Josh Allen", 100],
  ]),
  ...defineFootballWavelengthCategory("QB CARRY JOB", "carry", [
    ["trent-dilfer-ravens", "Trent Dilfer on the 2000 Ravens", 3],
    ["peyton-2015-broncos", "Peyton Manning on the 2015 Broncos", 8],
    ["aj-mccarron", "A.J. McCarron at Alabama", 11],
    ["mac-jones-bama", "Mac Jones at Alabama", 20],
    ["brock-purdy", "Brock Purdy", 35],
    ["jared-goff", "Jared Goff", 48],
    ["eli-2011-giants", "Eli Manning on the 2011 Giants", 70],
    ["joe-burrow", "Joe Burrow", 79],
    ["tom-brady", "Tom Brady", 86],
    ["cam-2015-panthers", "Cam Newton on the 2015 Panthers", 90],
    ["lamar-jackson", "Lamar Jackson", 92],
    ["rodgers-2020-packers", "Aaron Rodgers on the 2020 Packers", 94],
    ["mahomes", "Patrick Mahomes", 97],
    ["josh-allen", "Josh Allen", 99],
    ["mahomes-2022-chiefs", "Patrick Mahomes on the 2022 Chiefs", 100],
  ]),
  ...defineFootballWavelengthCategory("OFFENSIVE CHAOS", "chaos", [
    ["iowa", "Iowa offense", 2],
    ["2022-broncos", "2022 Broncos offense", 8],
    ["2023-steelers", "2023 Steelers offense", 14],
    ["harbaugh", "Jim Harbaugh offense", 35],
    ["army", "Army triple option", 48],
    ["kliff-kingsbury", "Kliff Kingsbury offense", 72],
    ["lincoln-riley", "Lincoln Riley offense", 79],
    ["gus-malzahn", "Gus Malzahn Auburn offense", 84],
    ["2007-patriots", "2007 Patriots", 86],
    ["chip-kelly", "Chip Kelly Oregon", 88],
    ["2010-oregon", "2010 Oregon", 91],
    ["2019-lsu", "2019 LSU", 93],
    ["boise-trick-play-era", "Boise State trick-play era", 95],
    ["mike-leach", "Mike Leach Air Raid", 97],
    ["band-play", "Cal–Stanford band play", 100],
  ]),
  ...defineFootballWavelengthCategory("FANBASE INSANITY", "fans", [
    ["rams", "Los Angeles Rams", 8],
    ["cardinals", "Arizona Cardinals", 11],
    ["chargers", "Los Angeles Chargers", 14],
    ["falcons", "Atlanta Falcons", 24],
    ["packers", "Green Bay Packers", 66],
    ["texas", "Texas Longhorns", 76],
    ["cowboys", "Dallas Cowboys", 84],
    ["nebraska", "Nebraska", 86],
    ["ohio-state", "Ohio State", 88],
    ["alabama", "Alabama", 91],
    ["tennessee", "Tennessee", 94],
    ["bills", "Bills Mafia", 96],
    ["lsu", "LSU", 97],
    ["eagles", "Philadelphia Eagles", 99],
    ["texas-am", "Texas A&M", 100],
  ]),
  ...defineFootballWavelengthCategory("PROGRAM TRADITION", "tradition", [
    ["ucf", "UCF", 10],
    ["boise-state", "Boise State", 16],
    ["oregon", "Oregon", 22],
    ["utah", "Utah", 31],
    ["miami", "Miami", 45],
    ["florida", "Florida", 53],
    ["clemson", "Clemson", 57],
    ["lsu", "LSU", 68],
    ["georgia", "Georgia", 72],
    ["penn-state", "Penn State", 86],
    ["nebraska", "Nebraska", 88],
    ["texas", "Texas", 90],
    ["ohio-state", "Ohio State", 96],
    ["michigan", "Michigan", 98],
    ["notre-dame", "Notre Dame", 100],
  ]),
  ...defineFootballWavelengthCategory("UNIFORM QUALITY", "uniform", [
    ["jaguars-2013", "2013 Jaguars two-tone helmet", 4],
    ["steelers-bumblebee", "Steelers bumblebee throwbacks", 12],
    ["browns", "Cleveland Browns", 25],
    ["commanders", "Washington Commanders", 34],
    ["falcons-current", "Atlanta Falcons current set", 41],
    ["rams-current", "Los Angeles Rams current set", 48],
    ["seahawks", "Seattle Seahawks", 62],
    ["oregon", "Oregon", 74],
    ["alabama", "Alabama", 82],
    ["packers", "Green Bay Packers", 86],
    ["cowboys", "Dallas Cowboys", 88],
    ["lsu", "LSU", 90],
    ["raiders", "Las Vegas Raiders", 94],
    ["michigan", "Michigan", 97],
    ["texas", "Texas Longhorns", 100],
  ]),
  ...defineFootballWavelengthCategory("STADIUM ATMOSPHERE", "atmosphere", [
    ["chargers-sofi", "Chargers home game at SoFi Stadium", 12],
    ["falcons-mbs", "Falcons home game at Mercedes-Benz Stadium", 24],
    ["jaguars-everbank", "Jaguars home game at EverBank Stadium", 35],
    ["cowboys-att", "Cowboys home game at AT&T Stadium", 52],
    ["notre-dame", "Notre Dame Stadium", 68],
    ["texas-dkr", "DKR on a huge Texas night", 78],
    ["michigan-big-house", "Michigan Stadium", 84],
    ["ohio-stadium", "Ohio Stadium", 88],
    ["autzen", "Autzen Stadium", 91],
    ["lambeau", "Lambeau Field", 93],
    ["lumen", "Lumen Field", 94],
    ["arrowhead", "Arrowhead Stadium", 96],
    ["kyle-field", "Kyle Field", 97],
    ["penn-state-whiteout", "Penn State White Out", 99],
    ["lsu-night", "LSU at Tiger Stadium at night", 100],
  ]),
  ...defineFootballWavelengthCategory("RIVALRY HATRED", "rivalry", [
    ["texans-colts", "Texans–Colts", 10],
    ["jaguars-titans", "Jaguars–Titans", 22],
    ["rams-49ers", "Rams–49ers", 38],
    ["seahawks-49ers", "Seahawks–49ers", 55],
    ["usc-notre-dame", "USC–Notre Dame", 72],
    ["packers-bears", "Packers–Bears", 78],
    ["army-navy", "Army–Navy", 84],
    ["florida-georgia", "Florida–Georgia", 90],
    ["chiefs-raiders", "Chiefs–Raiders", 91],
    ["steelers-ravens", "Steelers–Ravens", 95],
    ["cowboys-eagles", "Cowboys–Eagles", 97],
    ["texas-am-texas", "Texas–Texas A&M", 98],
    ["alabama-auburn", "Alabama–Auburn", 99],
    ["texas-oklahoma", "Texas–Oklahoma", 100],
    ["michigan-ohio-state", "Michigan–Ohio State", 100],
  ]),
  ...defineFootballWavelengthCategory("SYSTEM QB PERCEPTION", "system-qb", [
    ["peyton-manning", "Peyton Manning", 4],
    ["patrick-mahomes", "Patrick Mahomes", 6],
    ["josh-allen", "Josh Allen", 8],
    ["aaron-rodgers", "Aaron Rodgers", 10],
    ["justin-herbert", "Justin Herbert", 18],
    ["joe-burrow", "Joe Burrow", 24],
    ["cj-stroud", "C.J. Stroud", 30],
    ["baker-mayfield", "Baker Mayfield", 43],
    ["kirk-cousins", "Kirk Cousins", 52],
    ["jalen-hurts", "Jalen Hurts", 61],
    ["tom-brady-early", "Early-career Tom Brady", 68],
    ["tua-tagovailoa", "Tua Tagovailoa", 74],
    ["brock-purdy", "Brock Purdy", 87],
    ["mac-jones", "Mac Jones", 93],
    ["aj-mccarron", "A.J. McCarron at Alabama", 98],
  ]),
  ...defineFootballWavelengthCategory("COACHING CHAOS", "coach-chaos", [
    ["andy-reid", "Andy Reid", 8],
    ["nick-saban", "Nick Saban", 12],
    ["mike-tomlin", "Mike Tomlin", 20],
    ["bill-belichick", "Bill Belichick", 28],
    ["brian-kelly", "Brian Kelly", 48],
    ["chip-kelly", "Chip Kelly", 58],
    ["dan-campbell", "Dan Campbell", 68],
    ["jim-harbaugh", "Jim Harbaugh", 76],
    ["jimbo-fisher", "Jimbo Fisher", 81],
    ["rex-ryan", "Rex Ryan", 84],
    ["lane-kiffin", "Lane Kiffin", 90],
    ["deion-sanders", "Deion Sanders", 93],
    ["urban-meyer", "Urban Meyer", 96],
    ["hugh-freeze", "Hugh Freeze", 97],
    ["bobby-petrino", "Bobby Petrino", 100],
  ]),
  ...defineFootballWavelengthCategory("OFFENSIVE INNOVATION", "innovation", [
    ["matt-canada", "Matt Canada offense", 5],
    ["jeff-fisher", "Jeff Fisher offense", 14],
    ["old-school-three-yards", "Three-yards-and-a-cloud-of-dust football", 24],
    ["modern-pro-style", "Generic modern pro-style offense", 50],
    ["service-academy-option", "Modern service-academy option football", 64],
    ["gus-malzahn", "Gus Malzahn", 78],
    ["lincoln-riley", "Lincoln Riley", 82],
    ["kyle-shanahan", "Kyle Shanahan", 86],
    ["sean-mcvay", "Sean McVay", 88],
    ["steve-spurrier", "Steve Spurrier", 90],
    ["chip-kelly", "Chip Kelly at Oregon", 92],
    ["andy-reid", "Andy Reid", 94],
    ["mike-leach", "Mike Leach Air Raid", 97],
    ["don-coryell", "Don Coryell", 98],
    ["bill-walsh", "Bill Walsh West Coast offense", 100],
  ]),
  ...defineFootballWavelengthCategory("DEFENSIVE TERROR", "terror", [
    ["2008-lions", "2008 Lions defense", 4],
    ["2020-raiders", "2020 Raiders defense", 18],
    ["average-nfl-defense", "A league-average NFL defense", 50],
    ["2023-cowboys", "2023 Cowboys defense", 72],
    ["2009-jets", "2009 Jets defense", 84],
    ["legion-of-boom", "Legion of Boom Seahawks", 94],
    ["ndamukong-suh-nebraska", "Ndamukong Suh at Nebraska", 95],
    ["jj-watt", "Prime J.J. Watt", 96],
    ["2015-broncos", "2015 Broncos defense", 97],
    ["2002-buccaneers", "2002 Buccaneers defense", 98],
    ["2021-georgia", "2021 Georgia defense", 98],
    ["reggie-white", "Prime Reggie White", 99],
    ["aaron-donald", "Prime Aaron Donald", 99],
    ["2000-ravens", "2000 Ravens defense", 100],
    ["1985-bears", "1985 Bears defense", 100],
  ]),
  ...defineFootballWavelengthCategory("DRAFT BUST", "bust", [
    ["tom-brady", "Tom Brady", 1],
    ["aaron-donald", "Aaron Donald", 3],
    ["patrick-mahomes", "Patrick Mahomes", 5],
    ["sam-bradford", "Sam Bradford", 42],
    ["jadeveon-clowney", "Jadeveon Clowney", 50],
    ["reggie-bush", "Reggie Bush", 56],
    ["vince-young", "Vince Young", 74],
    ["matt-leinart", "Matt Leinart", 79],
    ["zach-wilson", "Zach Wilson", 88],
    ["josh-rosen", "Josh Rosen", 90],
    ["trey-lance", "Trey Lance", 92],
    ["johnny-manziel", "Johnny Manziel", 95],
    ["trent-richardson", "Trent Richardson", 97],
    ["ryan-leaf", "Ryan Leaf", 99],
    ["jamarcus-russell", "JaMarcus Russell", 100],
  ]),
  ...defineFootballWavelengthCategory("CLUTCH REPUTATION", "clutch", [
    ["dak-prescott", "Dak Prescott", 24],
    ["kirk-cousins", "Kirk Cousins", 34],
    ["lamar-jackson", "Lamar Jackson", 48],
    ["tony-romo", "Tony Romo", 58],
    ["aaron-rodgers", "Aaron Rodgers", 76],
    ["peyton-manning", "Peyton Manning", 78],
    ["jalen-hurts", "Jalen Hurts", 82],
    ["brett-favre", "Brett Favre", 83],
    ["ben-roethlisberger", "Ben Roethlisberger", 88],
    ["joe-flacco", "Joe Flacco in the playoffs", 90],
    ["matthew-stafford", "Matthew Stafford", 91],
    ["joe-burrow", "Joe Burrow", 92],
    ["eli-manning", "Eli Manning", 96],
    ["patrick-mahomes", "Patrick Mahomes", 99],
    ["tom-brady", "Tom Brady", 100],
  ]),
  ...defineFootballWavelengthCategory("CHOKE REPUTATION", "choke", [
    ["tom-brady", "Tom Brady", 2],
    ["joe-montana", "Joe Montana", 3],
    ["patrick-mahomes", "Patrick Mahomes", 5],
    ["eli-manning", "Eli Manning", 10],
    ["average-contender", "A typical playoff contender", 50],
    ["lamar-jackson", "Lamar Jackson postseason narrative", 60],
    ["peyton-manning", "Peyton Manning postseason narrative", 65],
    ["aaron-rodgers", "Aaron Rodgers postseason narrative", 70],
    ["matt-ryan", "Matt Ryan", 76],
    ["vikings", "Minnesota Vikings postseason history", 82],
    ["tony-romo", "Tony Romo", 85],
    ["cowboys-modern", "Modern Dallas Cowboys playoffs", 90],
    ["2014-packers", "2014 Packers NFC Championship collapse", 93],
    ["2007-patriots", "2007 Patriots Super Bowl finish", 95],
    ["28-3-falcons", "28–3 Falcons", 100],
  ]),
  ...defineFootballWavelengthCategory("FRANCHISE TRADITION", "franchise", [
    ["texans", "Houston Texans", 12],
    ["jaguars", "Jacksonville Jaguars", 16],
    ["panthers", "Carolina Panthers", 20],
    ["cardinals", "Arizona Cardinals", 32],
    ["chargers", "Los Angeles Chargers", 48],
    ["seahawks", "Seattle Seahawks", 62],
    ["chiefs", "Kansas City Chiefs", 80],
    ["broncos", "Denver Broncos", 82],
    ["eagles", "Philadelphia Eagles", 86],
    ["dolphins", "Miami Dolphins", 88],
    ["raiders", "Las Vegas Raiders", 90],
    ["giants", "New York Giants", 92],
    ["49ers", "San Francisco 49ers", 97],
    ["packers", "Green Bay Packers", 100],
    ["steelers", "Pittsburgh Steelers", 100],
  ]),
  ...defineFootballWavelengthCategory("FOOTBALL WEIRDNESS", "weird", [
    ["victory-formation", "Victory formation", 3],
    ["qb-sneak", "Quarterback sneak", 6],
    ["normal-punt", "Normal fourth-down punt", 12],
    ["fake-punt", "Fake punt", 38],
    ["snow-game", "Heavy-snow football game", 55],
    ["hook-and-lateral", "Hook-and-lateral", 68],
    ["iowa-wave", "Iowa Wave after the first quarter", 74],
    ["philly-special", "Philly Special", 82],
    ["maction", "Tuesday-night MACtion", 86],
    ["flutie-drop-kick", "Doug Flutie drop kick", 91],
    ["boise-statue-liberty", "Boise State Statue of Liberty", 94],
    ["kick-six", "Kick Six", 96],
    ["butt-fumble", "Butt Fumble", 99],
    ["one-point-safety", "One-point safety", 100],
    ["cal-band", "Cal–Stanford band ending", 100],
  ]),
  ...defineFootballWavelengthCategory("MEDIA ENERGY", "media", [
    ["belichick-presser", "Bill Belichick press conference", 8],
    ["eli-manning-presser", "Eli Manning press conference", 20],
    ["nick-saban-presser", "Nick Saban press conference", 44],
    ["kirk-herbstreit", "Kirk Herbstreit", 58],
    ["chris-collinsworth", "Chris Collinsworth", 64],
    ["tony-romo-booth", "Tony Romo in the booth", 72],
    ["paul-finebaum", "Paul Finebaum", 80],
    ["manningcast", "ManningCast", 84],
    ["marshawn-lynch", "Marshawn Lynch interview", 88],
    ["shannon-sharpe", "Shannon Sharpe", 90],
    ["rex-ryan", "Rex Ryan", 91],
    ["stephen-a-smith", "Stephen A. Smith football debate", 93],
    ["lane-kiffin", "Lane Kiffin social media", 96],
    ["deion-sanders", "Deion Sanders media orbit", 99],
    ["pat-mcafee", "Pat McAfee Show football energy", 100],
  ]),
  ...defineFootballWavelengthCategory("TAILGATE CULTURE", "tailgate", [
    ["chargers", "Chargers tailgate scene", 12],
    ["rams", "Rams tailgate scene", 20],
    ["falcons", "Falcons tailgate scene", 32],
    ["generic-nfl", "Average NFL parking-lot tailgate", 50],
    ["cowboys", "Cowboys tailgate scene", 62],
    ["texas", "Texas tailgate scene", 72],
    ["ohio-state", "Ohio State tailgate scene", 78],
    ["steelers", "Steelers tailgate scene", 82],
    ["alabama", "Alabama tailgate scene", 86],
    ["lsu", "LSU tailgate scene", 94],
    ["chiefs", "Chiefs tailgate at Arrowhead", 95],
    ["bills", "Bills Mafia tailgate", 97],
    ["wisconsin", "Wisconsin game-day tailgate", 98],
    ["ole-miss-grove", "The Grove at Ole Miss", 99],
    ["texas-am", "Texas A&M game-day tailgate culture", 100],
  ]),
] as const;

const expansionFootballWavelengthClues = footballWavelengthExpansionCategories.flatMap(({ category, prefix, seeds }) =>
  defineFootballWavelengthCategory(category as FootballWavelengthCategory, prefix, seeds),
);

export const footballWavelengthClues: readonly FootballWavelengthClue[] = [
  ...baseFootballWavelengthClues,
  ...expansionFootballWavelengthClues,
];

function chooseFootballWavelengthClue(
  desiredRating: number,
  options: {
    target: number;
    direction?: number;
    usedClues?: readonly FootballWavelengthClue[];
    random: () => number;
  },
) {
  const usedClues = options.usedClues ?? [];
  const usedIds = new Set(usedClues.map((clue) => clue.id));
  const usedCategories = new Set(usedClues.map((clue) => clue.category));
  const usedCanonicalSubjectIds = new Set(
    usedClues
      .map((clue) => footballWavelengthCanonicalSubjectForClue(clue)?.id)
      .filter((id): id is string => Boolean(id)),
  );
  const usedThemeFamilies = new Set(
    usedClues.map((clue) => footballWavelengthThemeFamilyForCategory(clue.category)),
  );
  const base = footballWavelengthClues.filter((clue) => {
    if (usedIds.has(clue.id)) return false;
    const canonicalSubjectId = footballWavelengthCanonicalSubjectForClue(clue)?.id;
    return !canonicalSubjectId || !usedCanonicalSubjectIds.has(canonicalSubjectId);
  });
  let candidates = base;
  if ((options.direction ?? 0) > 0) {
    const directional = base.filter((clue) => clue.rating > options.target);
    if (directional.length) candidates = directional;
  } else if ((options.direction ?? 0) < 0) {
    const directional = base.filter((clue) => clue.rating < options.target);
    if (directional.length) candidates = directional;
  }

  const unusedCategoryCandidates = candidates.filter((clue) => !usedCategories.has(clue.category));
  if (unusedCategoryCandidates.length) candidates = unusedCategoryCandidates;

  // Diversity is a preference layered after directional and category fit. If no unused
  // family survives those stricter constraints, relax only this family filter.
  const unusedFamilyCandidates = candidates.filter(
    (clue) => !usedThemeFamilies.has(footballWavelengthThemeFamilyForCategory(clue.category)),
  );
  if (unusedFamilyCandidates.length) candidates = unusedFamilyCandidates;

  return [...candidates]
    .map((clue) => ({
      clue,
      score: Math.abs(clue.rating - desiredRating) + options.random() * 2,
    }))
    .sort((left, right) => left.score - right.score)[0]!.clue;
}

export function createFootballWavelengthRound(seed: string): FootballWavelengthRound {
  const random = seededLineupRandom(FOOTBALL_WAVELENGTH_GAME_ID, "round", seed);
  const target = 20 + Math.floor(random() * 76);
  const opening = chooseFootballWavelengthClue(target + (random() > 0.5 ? 3 : -3), {
    target,
    random,
  });
  return { target, clues: [opening] };
}

export function nextFootballWavelengthClue(
  round: FootballWavelengthRound,
  lastGuess: number,
  nextClueIndex: number,
  seed: string,
  priorGuesses: readonly number[],
) {
  const random = seededLineupRandom(
    FOOTBALL_WAVELENGTH_GAME_ID,
    "next",
    seed,
    nextClueIndex,
    ...priorGuesses,
    lastGuess,
  );
  const direction = Math.sign(round.target - lastGuess);
  const desired = desiredWavelengthCorrection(round.target, lastGuess, nextClueIndex, random);
  return chooseFootballWavelengthClue(desired, {
    target: round.target,
    direction,
    usedClues: round.clues,
    random,
  });
}

export function createFootballWavelengthRun(): FootballWavelengthRun {
  const selected = selectReplayLineup({
    gameId: FOOTBALL_WAVELENGTH_GAME_ID,
    lineupSize: 3,
    attempts: 12,
    build: (seed) => {
      const initialRound = createFootballWavelengthRound(seed);
      const opening = initialRound.clues[0]!;
      return {
        value: { seed, initialRound },
        itemIds: [
          `target:${initialRound.target}`,
          `clue:${opening.id}`,
          `category:${opening.category}`,
        ],
      };
    },
  });
  return { ...selected.value, identity: selected.identity };
}
