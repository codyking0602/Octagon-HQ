import type {
  FootballCanonicalLeague,
  FootballCanonicalPosition,
  FootballCanonicalSubject,
  FootballCanonicalSubjectKind,
} from "./footballFactualStatsCatalog";
import type {
  FootballRecognizabilityTier,
  FootballSourceProviderId,
} from "./footballSubjectEligibility";

export type FootballRecognitionSubjectKind = FootballCanonicalSubjectKind | "franchise" | "game";
export type FootballRecognitionEvidenceBasis =
  | "first-team-all-america"
  | "major-award-or-hall-of-fame"
  | "reviewed-national-recognition"
  | "notable-game";

export interface FootballRecognitionIdentitySubject extends Omit<FootballCanonicalSubject, "kind"> {
  kind: FootballRecognitionSubjectKind;
}

export interface FootballRecognitionEvidenceRecord extends FootballRecognitionIdentitySubject {
  tier: FootballRecognizabilityTier;
  basis: FootballRecognitionEvidenceBasis;
  sourceProvider: FootballSourceProviderId;
  sourceId: string;
}

type CfbSeed = readonly [
  id: string,
  name: string,
  position: FootballCanonicalPosition,
  school: string,
  tier: FootballRecognizabilityTier,
  basis: FootballRecognitionEvidenceBasis,
  provider?: FootballSourceProviderId,
  sourceId?: string,
];

type NflSeed = readonly [id: string, name: string, position: FootballCanonicalPosition, tier: FootballRecognizabilityTier];
type GameSeed = readonly [id: string, name: string, season: number, tier: FootballRecognizabilityTier];

const cfbSeeds: readonly CfbSeed[] = [
  ["cfb-carson-palmer", "Carson Palmer", "QB", "USC", "B", "reviewed-national-recognition"],
  ["cfb-jason-white", "Jason White", "QB", "Oklahoma", "B", "reviewed-national-recognition"],
  ["cfb-matt-leinart", "Matt Leinart", "QB", "USC", "B", "reviewed-national-recognition"],
  ["cfb-vince-young", "Vince Young", "QB", "Texas", "A", "reviewed-national-recognition"],
  ["cfb-sam-bradford", "Sam Bradford", "QB", "Oklahoma", "B", "reviewed-national-recognition"],
  ["cfb-colt-mccoy", "Colt McCoy", "QB", "Texas", "B", "reviewed-national-recognition"],
  ["cfb-robert-griffin-iii", "Robert Griffin III", "QB", "Baylor", "B", "first-team-all-america", "ncaafb", "2011:Robert Griffin III:Baylor"],
  ["cfb-johnny-manziel", "Johnny Manziel", "QB", "Texas A&M", "A", "first-team-all-america", "ncaafb", "2012:Johnny Manziel:Texas A&M"],
  ["cfb-jameis-winston", "Jameis Winston", "QB", "Florida State", "B", "first-team-all-america", "ncaafb", "2013:Jameis Winston:Florida State"],

  ["cfb-larry-johnson", "Larry Johnson", "RB", "Penn State", "C", "reviewed-national-recognition"],
  ["cfb-reggie-bush", "Reggie Bush", "RB", "USC", "A", "reviewed-national-recognition"],
  ["cfb-adrian-peterson", "Adrian Peterson", "RB", "Oklahoma", "A", "reviewed-national-recognition"],
  ["cfb-darren-mcfadden", "Darren McFadden", "RB", "Arkansas", "A", "reviewed-national-recognition"],
  ["cfb-ray-rice", "Ray Rice", "RB", "Rutgers", "C", "reviewed-national-recognition"],
  ["cfb-mark-ingram-ii", "Mark Ingram II", "RB", "Alabama", "B", "reviewed-national-recognition"],
  ["cfb-lamichael-james", "LaMichael James", "RB", "Oregon", "B", "first-team-all-america", "ncaafb", "2011:LaMichael James:Oregon"],
  ["cfb-montee-ball", "Montee Ball", "RB", "Wisconsin", "B", "first-team-all-america", "ncaafb", "2012:Montee Ball:Wisconsin"],
  ["cfb-trent-richardson", "Trent Richardson", "RB", "Alabama", "B", "first-team-all-america", "ncaafb", "2011:Trent Richardson:Alabama"],
  ["cfb-ka-deem-carey", "Ka'Deem Carey", "RB", "Arizona", "C", "first-team-all-america", "ncaafb", "2013:Ka'Deem Carey:Arizona"],

  ["cfb-larry-fitzgerald", "Larry Fitzgerald", "WR", "Pittsburgh", "A", "reviewed-national-recognition"],
  ["cfb-braylon-edwards", "Braylon Edwards", "WR", "Michigan", "C", "reviewed-national-recognition"],
  ["cfb-calvin-johnson", "Calvin Johnson", "WR", "Georgia Tech", "A", "reviewed-national-recognition"],
  ["cfb-michael-crabtree", "Michael Crabtree", "WR", "Texas Tech", "A", "reviewed-national-recognition"],
  ["cfb-dez-bryant", "Dez Bryant", "WR", "Oklahoma State", "B", "reviewed-national-recognition"],
  ["cfb-justin-blackmon", "Justin Blackmon", "WR", "Oklahoma State", "A", "first-team-all-america", "ncaafb", "2011:Justin Blackmon:Oklahoma State"],
  ["cfb-marqise-lee", "Marqise Lee", "WR", "USC", "B", "first-team-all-america", "ncaafb", "2012:Marqise Lee:Southern California"],
  ["cfb-sammy-watkins", "Sammy Watkins", "WR", "Clemson", "B", "first-team-all-america", "ncaafb", "2013:Sammy Watkins:Clemson"],
  ["cfb-brandin-cooks", "Brandin Cooks", "WR", "Oregon State", "B", "first-team-all-america", "ncaafb", "2013:Brandin Cooks:Oregon State"],
  ["cfb-mike-evans", "Mike Evans", "WR", "Texas A&M", "B", "first-team-all-america", "ncaafb", "2013:Mike Evans:Texas A&M"],

  ["cfb-kellen-winslow-ii", "Kellen Winslow II", "TE", "Miami", "B", "reviewed-national-recognition"],
  ["cfb-heath-miller", "Heath Miller", "TE", "Virginia", "C", "reviewed-national-recognition"],
  ["cfb-marcedes-lewis", "Marcedes Lewis", "TE", "UCLA", "C", "reviewed-national-recognition"],
  ["cfb-chase-coffman", "Chase Coffman", "TE", "Missouri", "C", "major-award-or-hall-of-fame"],
  ["cfb-jermaine-gresham", "Jermaine Gresham", "TE", "Oklahoma", "B", "major-award-or-hall-of-fame"],
  ["cfb-dwayne-allen", "Dwayne Allen", "TE", "Clemson", "C", "first-team-all-america", "ncaafb", "2011:Dwayne Allen:Clemson"],
  ["cfb-zach-ertz", "Zach Ertz", "TE", "Stanford", "C", "first-team-all-america", "ncaafb", "2012:Zach Ertz:Stanford"],
  ["cfb-jace-amaro", "Jace Amaro", "TE", "Texas Tech", "C", "first-team-all-america", "ncaafb", "2013:Jace Amaro:Texas Tech"],
  ["cfb-mark-andrews", "Mark Andrews", "TE", "Oklahoma", "B", "major-award-or-hall-of-fame"],
  ["cfb-jake-butt", "Jake Butt", "TE", "Michigan", "C", "major-award-or-hall-of-fame"],
  ["cfb-hunter-henry", "Hunter Henry", "TE", "Arkansas", "C", "major-award-or-hall-of-fame"],
  ["cfb-kyle-pitts", "Kyle Pitts", "TE", "Florida", "B", "major-award-or-hall-of-fame"],
  ["cfb-brock-bowers", "Brock Bowers", "TE", "Georgia", "A", "major-award-or-hall-of-fame"],

  ["cfb-robert-gallery", "Robert Gallery", "OL", "Iowa", "B", "major-award-or-hall-of-fame"],
  ["cfb-joe-thomas", "Joe Thomas", "OL", "Wisconsin", "B", "reviewed-national-recognition"],
  ["cfb-jake-long", "Jake Long", "OL", "Michigan", "B", "reviewed-national-recognition"],
  ["cfb-alex-mack", "Alex Mack", "OL", "California", "B", "major-award-or-hall-of-fame"],
  ["cfb-trent-williams", "Trent Williams", "OL", "Oklahoma", "B", "reviewed-national-recognition"],
  ["cfb-barrett-jones", "Barrett Jones", "OL", "Alabama", "B", "first-team-all-america", "ncaafb", "2012:Barrett Jones:Alabama"],
  ["cfb-luke-joeckel", "Luke Joeckel", "OL", "Texas A&M", "C", "first-team-all-america", "ncaafb", "2012:Luke Joeckel:Texas A&M"],
  ["cfb-taylor-lewan", "Taylor Lewan", "OL", "Michigan", "C", "first-team-all-america", "ncaafb", "2012:Taylor Lewan:Michigan"],
  ["cfb-jake-matthews", "Jake Matthews", "OL", "Texas A&M", "C", "first-team-all-america", "ncaafb", "2013:Jake Matthews:Texas A&M"],
  ["cfb-bryan-stork", "Bryan Stork", "OL", "Florida State", "C", "first-team-all-america", "ncaafb", "2013:Bryan Stork:Florida State"],
  ["cfb-brandon-scherff", "Brandon Scherff", "OL", "Iowa", "B", "major-award-or-hall-of-fame"],
  ["cfb-quenton-nelson", "Quenton Nelson", "OL", "Notre Dame", "B", "reviewed-national-recognition"],
  ["cfb-orlando-brown", "Orlando Brown", "OL", "Oklahoma", "C", "reviewed-national-recognition"],
  ["cfb-penei-sewell", "Penei Sewell", "OL", "Oregon", "B", "major-award-or-hall-of-fame"],
  ["cfb-tyler-linderbaum", "Tyler Linderbaum", "OL", "Iowa", "B", "major-award-or-hall-of-fame"],
  ["cfb-joe-alt", "Joe Alt", "OL", "Notre Dame", "B", "reviewed-national-recognition"],

  ["cfb-terrell-suggs", "Terrell Suggs", "DL", "Arizona State", "B", "major-award-or-hall-of-fame"],
  ["cfb-david-pollack", "David Pollack", "DL", "Georgia", "B", "reviewed-national-recognition"],
  ["cfb-brian-orakpo", "Brian Orakpo", "DL", "Texas", "B", "reviewed-national-recognition"],
  ["cfb-ndamukong-suh", "Ndamukong Suh", "DL", "Nebraska", "A", "major-award-or-hall-of-fame"],
  ["cfb-melvin-ingram", "Melvin Ingram", "DL", "South Carolina", "C", "first-team-all-america", "ncaafb", "2011:Melvin Ingram:South Carolina"],
  ["cfb-jadeveon-clowney", "Jadeveon Clowney", "DL", "South Carolina", "A", "first-team-all-america", "ncaafb", "2012:Jadeveon Clowney:South Carolina"],
  ["cfb-aaron-donald", "Aaron Donald", "DL", "Pittsburgh", "A", "first-team-all-america", "ncaafb", "2013:Aaron Donald:Pittsburgh"],
  ["cfb-michael-sam", "Michael Sam", "DL", "Missouri", "C", "first-team-all-america", "ncaafb", "2013:Michael Sam:Missouri"],
  ["cfb-myles-garrett", "Myles Garrett", "DL", "Texas A&M", "A", "reviewed-national-recognition"],
  ["cfb-chase-young", "Chase Young", "DL", "Ohio State", "A", "major-award-or-hall-of-fame"],
  ["cfb-will-anderson-jr", "Will Anderson Jr.", "DL", "Alabama", "A", "major-award-or-hall-of-fame"],

  ["cfb-derrick-johnson", "Derrick Johnson", "LB", "Texas", "B", "major-award-or-hall-of-fame"],
  ["cfb-aj-hawk", "A.J. Hawk", "LB", "Ohio State", "B", "reviewed-national-recognition"],
  ["cfb-patrick-willis", "Patrick Willis", "LB", "Ole Miss", "B", "major-award-or-hall-of-fame"],
  ["cfb-von-miller", "Von Miller", "LB", "Texas A&M", "A", "reviewed-national-recognition"],
  ["cfb-luke-kuechly", "Luke Kuechly", "LB", "Boston College", "A", "first-team-all-america", "ncaafb", "2011:Luke Kuechly:Boston College"],
  ["cfb-manti-teo", "Manti Te'o", "LB", "Notre Dame", "A", "first-team-all-america", "ncaafb", "2012:Manti Te'o:Notre Dame"],
  ["cfb-cj-mosley", "C.J. Mosley", "LB", "Alabama", "B", "first-team-all-america", "ncaafb", "2013:C.J. Mosley:Alabama"],
  ["cfb-khalil-mack", "Khalil Mack", "LB", "Buffalo", "B", "first-team-all-america", "ncaafb", "2013:Khalil Mack:Buffalo"],
  ["cfb-roquan-smith", "Roquan Smith", "LB", "Georgia", "A", "major-award-or-hall-of-fame"],
  ["cfb-micah-parsons", "Micah Parsons", "LB", "Penn State", "B", "reviewed-national-recognition"],

  ["cfb-terence-newman", "Terence Newman", "DB", "Kansas State", "B", "major-award-or-hall-of-fame"],
  ["cfb-sean-taylor", "Sean Taylor", "DB", "Miami", "A", "reviewed-national-recognition"],
  ["cfb-michael-huff", "Michael Huff", "DB", "Texas", "B", "major-award-or-hall-of-fame"],
  ["cfb-eric-berry", "Eric Berry", "DB", "Tennessee", "A", "major-award-or-hall-of-fame"],
  ["cfb-patrick-peterson", "Patrick Peterson", "DB", "LSU", "A", "reviewed-national-recognition"],
  ["cfb-tyrann-mathieu", "Tyrann Mathieu", "DB", "LSU", "A", "first-team-all-america", "ncaafb", "2011:Tyrann Mathieu:LSU"],
  ["cfb-morris-claiborne", "Morris Claiborne", "DB", "LSU", "B", "first-team-all-america", "ncaafb", "2011:Morris Claiborne:LSU"],
  ["cfb-dee-milliner", "Dee Milliner", "DB", "Alabama", "C", "first-team-all-america", "ncaafb", "2012:Dee Milliner:Alabama"],
  ["cfb-darqueze-dennard", "Darqueze Dennard", "DB", "Michigan State", "B", "first-team-all-america", "ncaafb", "2013:Darqueze Dennard:Michigan State"],
  ["cfb-minkah-fitzpatrick", "Minkah Fitzpatrick", "DB", "Alabama", "A", "major-award-or-hall-of-fame"],

  ["cfb-mason-crosby", "Mason Crosby", "K", "Colorado", "C", "reviewed-national-recognition"],
  ["cfb-randy-bullock", "Randy Bullock", "K", "Texas A&M", "C", "first-team-all-america", "ncaafb", "2011:Randy Bullock:Texas A&M"],
  ["cfb-cairo-santos", "Cairo Santos", "K", "Tulane", "C", "first-team-all-america", "ncaafb", "2012:Cairo Santos:Tulane"],
  ["cfb-roberto-aguayo", "Roberto Aguayo", "K", "Florida State", "B", "first-team-all-america", "ncaafb", "2013:Roberto Aguayo:Florida State"],
  ["cfb-daniel-sepulveda", "Daniel Sepulveda", "P", "Baylor", "C", "major-award-or-hall-of-fame"],
  ["cfb-brad-wing", "Brad Wing", "P", "LSU", "C", "first-team-all-america", "ncaafb", "2011:Brad Wing:LSU"],
  ["cfb-ryan-allen", "Ryan Allen", "P", "Louisiana Tech", "C", "first-team-all-america", "ncaafb", "2012:Ryan Allen:Louisiana Tech"],
  ["cfb-tom-hornsey", "Tom Hornsey", "P", "Memphis", "C", "first-team-all-america", "ncaafb", "2013:Tom Hornsey:Memphis"],
  ["cfb-michael-dickson", "Michael Dickson", "P", "Texas", "B", "major-award-or-hall-of-fame"],
  ["cfb-tory-taylor", "Tory Taylor", "P", "Iowa", "B", "reviewed-national-recognition"],
] as const;

const nflSeeds: readonly NflSeed[] = [
  ["nfl-joe-thomas", "Joe Thomas", "OL", "A"],
  ["nfl-trent-williams", "Trent Williams", "OL", "A"],
  ["nfl-jason-peters", "Jason Peters", "OL", "B"],
  ["nfl-marshal-yanda", "Marshal Yanda", "OL", "B"],
  ["nfl-tyron-smith", "Tyron Smith", "OL", "A"],
  ["nfl-zack-martin", "Zack Martin", "OL", "A"],
  ["nfl-jason-kelce", "Jason Kelce", "OL", "A"],
  ["nfl-lane-johnson", "Lane Johnson", "OL", "B"],
  ["nfl-quenton-nelson", "Quenton Nelson", "OL", "B"],
  ["nfl-travis-frederick", "Travis Frederick", "OL", "B"],
  ["nfl-adam-vinatieri", "Adam Vinatieri", "K", "A"],
  ["nfl-justin-tucker", "Justin Tucker", "K", "A"],
  ["nfl-stephen-gostkowski", "Stephen Gostkowski", "K", "B"],
  ["nfl-robbie-gould", "Robbie Gould", "K", "B"],
  ["nfl-sebastian-janikowski", "Sebastian Janikowski", "K", "B"],
  ["nfl-shane-lechler", "Shane Lechler", "P", "A"],
  ["nfl-johnny-hekker", "Johnny Hekker", "P", "B"],
  ["nfl-thomas-morstead", "Thomas Morstead", "P", "B"],
  ["nfl-pat-mcafee", "Pat McAfee", "P", "A"],
  ["nfl-andy-lee", "Andy Lee", "P", "C"],
] as const;

const gameSeeds: readonly GameSeed[] = [
  ["cfb-game-2006-rose-bowl", "2006 Rose Bowl — Texas vs USC", 2005, "A"],
  ["cfb-game-2007-fiesta-bowl", "2007 Fiesta Bowl — Boise State vs Oklahoma", 2006, "A"],
  ["cfb-game-2011-game-of-the-century", "2011 Alabama vs LSU", 2011, "B"],
  ["cfb-game-2013-kick-six", "2013 Iron Bowl — Alabama vs Auburn", 2013, "A"],
  ["cfb-game-2014-cfp-title", "2014 CFP National Championship — Ohio State vs Oregon", 2014, "B"],
  ["cfb-game-2017-cfp-title", "2017 CFP National Championship — Clemson vs Alabama", 2016, "B"],
  ["cfb-game-2018-rose-bowl", "2018 Rose Bowl — Georgia vs Oklahoma", 2017, "B"],
  ["cfb-game-2020-cfp-title", "2020 CFP National Championship — LSU vs Clemson", 2019, "B"],
  ["cfb-game-2022-tennessee-alabama", "2022 Tennessee vs Alabama", 2022, "C"],
  ["cfb-game-2024-rose-bowl", "2024 Rose Bowl — Michigan vs Alabama", 2023, "B"],
] as const;

const cfbRecords = cfbSeeds.map(([id, name, position, school, tier, basis, provider = "octagon-hq", sourceId = id]): FootballRecognitionEvidenceRecord => ({
  id,
  name,
  kind: "player-career",
  league: "CFB",
  position,
  school,
  tier,
  basis,
  sourceProvider: provider,
  sourceId,
}));

const nflRecords = nflSeeds.map(([id, name, position, tier]): FootballRecognitionEvidenceRecord => ({
  id,
  name,
  kind: "player-career",
  league: "NFL",
  position,
  tier,
  basis: "major-award-or-hall-of-fame",
  sourceProvider: "octagon-hq",
  sourceId: id,
}));

const gameRecords = gameSeeds.map(([id, name, season, tier]): FootballRecognitionEvidenceRecord => ({
  id,
  name,
  kind: "game",
  league: "CFB",
  season,
  startSeason: season,
  endSeason: season,
  tier,
  basis: "notable-game",
  sourceProvider: "octagon-hq",
  sourceId: id,
}));

/**
 * Recognition evidence supplements, but never replaces, the large production projection. These rows answer only
 * "is this identity recognizable enough for A-C?" and deliberately contain no game statistics.
 *
 * Pinned `ncaafb` rows are selected first-team All-Americans from the CC0 historical dataset at commit
 * 21f8bf9070e95e6aa561d7b6d7d4a1c956f4cfd8. Reviewed rows cover obvious national-recognition gaps that a
 * box-score feed cannot encode cleanly: older stars, offensive linemen, specialists, major awards and HOF context.
 */
export const footballRecognitionEvidenceRecords: readonly FootballRecognitionEvidenceRecord[] = [
  ...cfbRecords,
  ...nflRecords,
  ...gameRecords,
];

function normalizedRecognitionName(name: string) {
  return name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

const byId = new Map(footballRecognitionEvidenceRecords.map((record) => [record.id, record]));
const byKindLeagueAndName = new Map<string, FootballRecognitionEvidenceRecord[]>();
for (const record of footballRecognitionEvidenceRecords) {
  const key = `${record.kind}:${record.league}:${normalizedRecognitionName(record.name)}`;
  const values = byKindLeagueAndName.get(key) ?? [];
  values.push(record);
  byKindLeagueAndName.set(key, values);
}

export function footballRecognitionEvidenceFor(subject: FootballRecognitionIdentitySubject) {
  const direct = byId.get(subject.id)
    ?? (subject.aliases ?? []).map((alias) => byId.get(alias)).find((record) => record != null);
  if (direct) return direct;
  const matches = byKindLeagueAndName.get(`${subject.kind}:${subject.league}:${normalizedRecognitionName(subject.name)}`) ?? [];
  if (matches.length === 1) return matches[0]!;
  if (subject.position) {
    const samePosition = matches.filter((record) => record.position === subject.position);
    if (samePosition.length === 1) return samePosition[0]!;
  }
  return null;
}

export function footballRecognitionEvidenceSubjectIdFor(subject: FootballRecognitionIdentitySubject) {
  return footballRecognitionEvidenceFor(subject)?.id ?? null;
}

export const footballRecognitionEvidenceSubjects: readonly FootballRecognitionIdentitySubject[] = footballRecognitionEvidenceRecords.map((record) => ({
  id: record.id,
  name: record.name,
  kind: record.kind,
  league: record.league,
  position: record.position,
  school: record.school,
  season: record.season,
  startSeason: record.startSeason,
  endSeason: record.endSeason,
  aliases: record.aliases,
}));

export const FOOTBALL_STAGE12_RECOGNITION_EVIDENCE_SOURCE = {
  provider: "ncaafb" as const,
  repository: "lebebr01/ncaafb",
  commit: "21f8bf9070e95e6aa561d7b6d7d4a1c956f4cfd8",
  path: "data-raw/allAmericans.csv",
  license: "CC0",
  role: "recognition evidence only; never a factual-stat authority",
} as const;
