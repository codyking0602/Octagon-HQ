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

export type FootballRecognitionEvidenceBasis =
  | "first-team-all-america"
  | "major-award-or-hall-of-fame"
  | "reviewed-national-recognition"
  | "notable-game";

export interface FootballRecognitionEvidenceRecord {
  id: string;
  name: string;
  kind: FootballCanonicalSubjectKind;
  league: FootballCanonicalLeague;
  tier: FootballRecognizabilityTier;
  basis: FootballRecognitionEvidenceBasis;
  sourceProvider: FootballSourceProviderId;
  sourceId: string;
  position?: FootballCanonicalPosition;
  school?: string;
  startSeason?: number;
  endSeason?: number;
  season?: number;
  aliases?: readonly string[];
}

const cfbPlayer = (
  id: string,
  name: string,
  position: FootballCanonicalPosition,
  school: string,
  tier: FootballRecognizabilityTier,
  basis: FootballRecognitionEvidenceBasis,
  sourceProvider: FootballSourceProviderId = "octagon-hq",
  sourceId = id,
): FootballRecognitionEvidenceRecord => ({
  id,
  name,
  kind: "player-career",
  league: "CFB",
  position,
  school,
  tier,
  basis,
  sourceProvider,
  sourceId,
});

const nflPlayer = (
  id: string,
  name: string,
  position: FootballCanonicalPosition,
  tier: FootballRecognizabilityTier,
): FootballRecognitionEvidenceRecord => ({
  id,
  name,
  kind: "player-career",
  league: "NFL",
  position,
  tier,
  basis: "major-award-or-hall-of-fame",
  sourceProvider: "octagon-hq",
  sourceId: id,
});

const cfbGame = (
  id: string,
  name: string,
  season: number,
  tier: FootballRecognizabilityTier,
): FootballRecognitionEvidenceRecord => ({
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
});

/**
 * Stage 12 recognition evidence supplements, but never replaces, the large production-based projection.
 * These rows answer only "is this identity recognizable enough for A-C?" They contain no game statistics.
 *
 * The pinned ncaafb rows below are selected first-team All-Americans from the CC0 historical dataset at
 * lebebr01/ncaafb commit 21f8bf9070e95e6aa561d7b6d7d4a1c956f4cfd8. Reviewed rows cover obvious national
 * recognition gaps that a box-score feed cannot encode cleanly (older stars, OL, specialists, awards/HOF context).
 */
export const footballRecognitionEvidenceRecords: readonly FootballRecognitionEvidenceRecord[] = [
  // CFB quarterbacks — older national stars must not depend on an NFL crossover.
  cfbPlayer("cfb-carson-palmer", "Carson Palmer", "QB", "USC", "B", "reviewed-national-recognition"),
  cfbPlayer("cfb-jason-white", "Jason White", "QB", "Oklahoma", "B", "reviewed-national-recognition"),
  cfbPlayer("cfb-matt-leinart", "Matt Leinart", "QB", "USC", "B", "reviewed-national-recognition"),
  cfbPlayer("cfb-vince-young", "Vince Young", "QB", "Texas", "A", "reviewed-national-recognition"),
  cfbPlayer("cfb-sam-bradford", "Sam Bradford", "QB", "Oklahoma", "B", "reviewed-national-recognition"),
  cfbPlayer("cfb-colt-mccoy", "Colt McCoy", "QB", "Texas", "B", "reviewed-national-recognition"),
  cfbPlayer("cfb-robert-griffin-iii", "Robert Griffin III", "QB", "Baylor", "B", "first-team-all-america", "ncaafb", "2011:Robert Griffin III:Baylor"),
  cfbPlayer("cfb-johnny-manziel", "Johnny Manziel", "QB", "Texas A&M", "A", "first-team-all-america", "ncaafb", "2012:Johnny Manziel:Texas A&M"),
  cfbPlayer("cfb-jameis-winston", "Jameis Winston", "QB", "Florida State", "B", "first-team-all-america", "ncaafb", "2013:Jameis Winston:Florida State"),

  // CFB running backs.
  cfbPlayer("cfb-larry-johnson", "Larry Johnson", "RB", "Penn State", "C", "reviewed-national-recognition"),
  cfbPlayer("cfb-reggie-bush", "Reggie Bush", "RB", "USC", "A", "reviewed-national-recognition"),
  cfbPlayer("cfb-adrian-peterson", "Adrian Peterson", "RB", "Oklahoma", "A", "reviewed-national-recognition"),
  cfbPlayer("cfb-darren-mcfadden", "Darren McFadden", "RB", "Arkansas", "A", "reviewed-national-recognition"),
  cfbPlayer("cfb-ray-rice", "Ray Rice", "RB", "Rutgers", "C", "reviewed-national-recognition"),
  cfbPlayer("cfb-mark-ingram-ii", "Mark Ingram II", "RB", "Alabama", "B", "reviewed-national-recognition"),
  cfbPlayer("cfb-lamichael-james", "LaMichael James", "RB", "Oregon", "B", "first-team-all-america", "ncaafb", "2011:LaMichael James:Oregon"),
  cfbPlayer("cfb-montee-ball", "Montee Ball", "RB", "Wisconsin", "B", "first-team-all-america", "ncaafb", "2012:Montee Ball:Wisconsin"),
  cfbPlayer("cfb-trent-richardson", "Trent Richardson", "RB", "Alabama", "B", "first-team-all-america", "ncaafb", "2011:Trent Richardson:Alabama"),
  cfbPlayer("cfb-ka-deem-carey", "Ka'Deem Carey", "RB", "Arizona", "C", "first-team-all-america", "ncaafb", "2013:Ka'Deem Carey:Arizona"),

  // CFB wide receivers.
  cfbPlayer("cfb-larry-fitzgerald", "Larry Fitzgerald", "WR", "Pittsburgh", "A", "reviewed-national-recognition"),
  cfbPlayer("cfb-braylon-edwards", "Braylon Edwards", "WR", "Michigan", "C", "reviewed-national-recognition"),
  cfbPlayer("cfb-calvin-johnson", "Calvin Johnson", "WR", "Georgia Tech", "A", "reviewed-national-recognition"),
  cfbPlayer("cfb-michael-crabtree", "Michael Crabtree", "WR", "Texas Tech", "A", "reviewed-national-recognition"),
  cfbPlayer("cfb-dez-bryant", "Dez Bryant", "WR", "Oklahoma State", "B", "reviewed-national-recognition"),
  cfbPlayer("cfb-justin-blackmon", "Justin Blackmon", "WR", "Oklahoma State", "A", "first-team-all-america", "ncaafb", "2011:Justin Blackmon:Oklahoma State"),
  cfbPlayer("cfb-marquise-lee", "Marqise Lee", "WR", "USC", "B", "first-team-all-america", "ncaafb", "2012:Marqise Lee:Southern California"),
  cfbPlayer("cfb-sammy-watkins", "Sammy Watkins", "WR", "Clemson", "B", "first-team-all-america", "ncaafb", "2013:Sammy Watkins:Clemson"),
  cfbPlayer("cfb-brandin-cooks", "Brandin Cooks", "WR", "Oregon State", "B", "first-team-all-america", "ncaafb", "2013:Brandin Cooks:Oregon State"),
  cfbPlayer("cfb-mike-evans", "Mike Evans", "WR", "Texas A&M", "B", "first-team-all-america", "ncaafb", "2013:Mike Evans:Texas A&M"),

  // CFB tight ends — a first-class college pool, not an NFL afterthought.
  cfbPlayer("cfb-kellen-winslow-ii", "Kellen Winslow II", "TE", "Miami", "B", "reviewed-national-recognition"),
  cfbPlayer("cfb-heath-miller", "Heath Miller", "TE", "Virginia", "C", "reviewed-national-recognition"),
  cfbPlayer("cfb-marcedes-lewis", "Marcedes Lewis", "TE", "UCLA", "C", "reviewed-national-recognition"),
  cfbPlayer("cfb-chase-coffman", "Chase Coffman", "TE", "Missouri", "C", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-jermaine-gresham", "Jermaine Gresham", "TE", "Oklahoma", "B", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-dwayne-allen", "Dwayne Allen", "TE", "Clemson", "C", "first-team-all-america", "ncaafb", "2011:Dwayne Allen:Clemson"),
  cfbPlayer("cfb-zach-ertz", "Zach Ertz", "TE", "Stanford", "C", "first-team-all-america", "ncaafb", "2012:Zach Ertz:Stanford"),
  cfbPlayer("cfb-jace-amaro", "Jace Amaro", "TE", "Texas Tech", "C", "first-team-all-america", "ncaafb", "2013:Jace Amaro:Texas Tech"),
  cfbPlayer("cfb-mark-andrews", "Mark Andrews", "TE", "Oklahoma", "B", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-jake-butt", "Jake Butt", "TE", "Michigan", "C", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-hunter-henry", "Hunter Henry", "TE", "Arkansas", "C", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-kyle-pitts", "Kyle Pitts", "TE", "Florida", "B", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-brock-bowers", "Brock Bowers", "TE", "Georgia", "A", "major-award-or-hall-of-fame"),

  // CFB offensive line — recognition is honors-driven because box scores are the wrong authority.
  cfbPlayer("cfb-robert-gallery", "Robert Gallery", "OL", "Iowa", "B", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-joe-thomas", "Joe Thomas", "OL", "Wisconsin", "B", "reviewed-national-recognition"),
  cfbPlayer("cfb-jake-long", "Jake Long", "OL", "Michigan", "B", "reviewed-national-recognition"),
  cfbPlayer("cfb-alex-mack", "Alex Mack", "OL", "California", "B", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-trent-williams", "Trent Williams", "OL", "Oklahoma", "B", "reviewed-national-recognition"),
  cfbPlayer("cfb-barrett-jones", "Barrett Jones", "OL", "Alabama", "B", "first-team-all-america", "ncaafb", "2012:Barrett Jones:Alabama"),
  cfbPlayer("cfb-luke-joeckel", "Luke Joeckel", "OL", "Texas A&M", "C", "first-team-all-america", "ncaafb", "2012:Luke Joeckel:Texas A&M"),
  cfbPlayer("cfb-taylor-lewan", "Taylor Lewan", "OL", "Michigan", "C", "first-team-all-america", "ncaafb", "2012:Taylor Lewan:Michigan"),
  cfbPlayer("cfb-jake-matthews", "Jake Matthews", "OL", "Texas A&M", "C", "first-team-all-america", "ncaafb", "2013:Jake Matthews:Texas A&M"),
  cfbPlayer("cfb-bryan-stork", "Bryan Stork", "OL", "Florida State", "C", "first-team-all-america", "ncaafb", "2013:Bryan Stork:Florida State"),
  cfbPlayer("cfb-brandon-scherff", "Brandon Scherff", "OL", "Iowa", "B", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-quenton-nelson", "Quenton Nelson", "OL", "Notre Dame", "B", "reviewed-national-recognition"),
  cfbPlayer("cfb-orlando-brown", "Orlando Brown", "OL", "Oklahoma", "C", "reviewed-national-recognition"),
  cfbPlayer("cfb-penei-sewell", "Penei Sewell", "OL", "Oregon", "B", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-tyler-linderbaum", "Tyler Linderbaum", "OL", "Iowa", "B", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-joe-alt", "Joe Alt", "OL", "Notre Dame", "B", "reviewed-national-recognition"),

  // CFB DL / EDGE.
  cfbPlayer("cfb-terrell-suggs", "Terrell Suggs", "DL", "Arizona State", "B", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-david-pollack", "David Pollack", "DL", "Georgia", "B", "reviewed-national-recognition"),
  cfbPlayer("cfb-brian-orakpo", "Brian Orakpo", "DL", "Texas", "B", "reviewed-national-recognition"),
  cfbPlayer("cfb-ndamukong-suh", "Ndamukong Suh", "DL", "Nebraska", "A", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-melvin-ingram", "Melvin Ingram", "DL", "South Carolina", "C", "first-team-all-america", "ncaafb", "2011:Melvin Ingram:South Carolina"),
  cfbPlayer("cfb-jadeveon-clowney", "Jadeveon Clowney", "DL", "South Carolina", "A", "first-team-all-america", "ncaafb", "2012:Jadeveon Clowney:South Carolina"),
  cfbPlayer("cfb-aaron-donald", "Aaron Donald", "DL", "Pittsburgh", "A", "first-team-all-america", "ncaafb", "2013:Aaron Donald:Pittsburgh"),
  cfbPlayer("cfb-michael-sam", "Michael Sam", "DL", "Missouri", "C", "first-team-all-america", "ncaafb", "2013:Michael Sam:Missouri"),
  cfbPlayer("cfb-myles-garrett", "Myles Garrett", "DL", "Texas A&M", "A", "reviewed-national-recognition"),
  cfbPlayer("cfb-chase-young", "Chase Young", "DL", "Ohio State", "A", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-will-anderson-jr", "Will Anderson Jr.", "DL", "Alabama", "A", "major-award-or-hall-of-fame"),

  // CFB linebackers.
  cfbPlayer("cfb-derrick-johnson", "Derrick Johnson", "LB", "Texas", "B", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-aj-hawk", "A.J. Hawk", "LB", "Ohio State", "B", "reviewed-national-recognition"),
  cfbPlayer("cfb-patrick-willis", "Patrick Willis", "LB", "Ole Miss", "B", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-von-miller", "Von Miller", "LB", "Texas A&M", "A", "reviewed-national-recognition"),
  cfbPlayer("cfb-luke-kuechly", "Luke Kuechly", "LB", "Boston College", "A", "first-team-all-america", "ncaafb", "2011:Luke Kuechly:Boston College"),
  cfbPlayer("cfb-manti-teo", "Manti Te'o", "LB", "Notre Dame", "A", "first-team-all-america", "ncaafb", "2012:Manti Te'o:Notre Dame"),
  cfbPlayer("cfb-cj-mosley", "C.J. Mosley", "LB", "Alabama", "B", "first-team-all-america", "ncaafb", "2013:C.J. Mosley:Alabama"),
  cfbPlayer("cfb-khalil-mack", "Khalil Mack", "LB", "Buffalo", "B", "first-team-all-america", "ncaafb", "2013:Khalil Mack:Buffalo"),
  cfbPlayer("cfb-roquan-smith", "Roquan Smith", "LB", "Georgia", "A", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-micah-parsons", "Micah Parsons", "LB", "Penn State", "B", "reviewed-national-recognition"),

  // CFB secondary.
  cfbPlayer("cfb-terence-newman", "Terence Newman", "DB", "Kansas State", "B", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-sean-taylor", "Sean Taylor", "DB", "Miami", "A", "reviewed-national-recognition"),
  cfbPlayer("cfb-michael-huff", "Michael Huff", "DB", "Texas", "B", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-eric-berry", "Eric Berry", "DB", "Tennessee", "A", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-patrick-peterson", "Patrick Peterson", "DB", "LSU", "A", "reviewed-national-recognition"),
  cfbPlayer("cfb-tyrann-mathieu", "Tyrann Mathieu", "DB", "LSU", "A", "first-team-all-america", "ncaafb", "2011:Tyrann Mathieu:LSU"),
  cfbPlayer("cfb-morris-claiborne", "Morris Claiborne", "DB", "LSU", "B", "first-team-all-america", "ncaafb", "2011:Morris Claiborne:LSU"),
  cfbPlayer("cfb-dee-milliner", "Dee Milliner", "DB", "Alabama", "C", "first-team-all-america", "ncaafb", "2012:Dee Milliner:Alabama"),
  cfbPlayer("cfb-darqueze-dennard", "Darqueze Dennard", "DB", "Michigan State", "B", "first-team-all-america", "ncaafb", "2013:Darqueze Dennard:Michigan State"),
  cfbPlayer("cfb-minkah-fitzpatrick", "Minkah Fitzpatrick", "DB", "Alabama", "A", "major-award-or-hall-of-fame"),

  // CFB specialists.
  cfbPlayer("cfb-mason-crosby", "Mason Crosby", "K", "Colorado", "C", "reviewed-national-recognition"),
  cfbPlayer("cfb-randy-bullock", "Randy Bullock", "K", "Texas A&M", "C", "first-team-all-america", "ncaafb", "2011:Randy Bullock:Texas A&M"),
  cfbPlayer("cfb-cairo-santos", "Cairo Santos", "K", "Tulane", "C", "first-team-all-america", "ncaafb", "2012:Cairo Santos:Tulane"),
  cfbPlayer("cfb-roberto-aguayo", "Roberto Aguayo", "K", "Florida State", "B", "first-team-all-america", "ncaafb", "2013:Roberto Aguayo:Florida State"),
  cfbPlayer("cfb-daniel-sepulveda", "Daniel Sepulveda", "P", "Baylor", "C", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-brad-wing", "Brad Wing", "P", "LSU", "C", "first-team-all-america", "ncaafb", "2011:Brad Wing:LSU"),
  cfbPlayer("cfb-ryan-allen", "Ryan Allen", "P", "Louisiana Tech", "C", "first-team-all-america", "ncaafb", "2012:Ryan Allen:Louisiana Tech"),
  cfbPlayer("cfb-tom-hornsey", "Tom Hornsey", "P", "Memphis", "C", "first-team-all-america", "ncaafb", "2013:Tom Hornsey:Memphis"),
  cfbPlayer("cfb-michael-dickson", "Michael Dickson", "P", "Texas", "B", "major-award-or-hall-of-fame"),
  cfbPlayer("cfb-tory-taylor", "Tory Taylor", "P", "Iowa", "B", "reviewed-national-recognition"),

  // NFL OL — absent from the old production-threshold projection because box-score volume is the wrong signal.
  nflPlayer("nfl-joe-thomas", "Joe Thomas", "OL", "A"),
  nflPlayer("nfl-trent-williams", "Trent Williams", "OL", "A"),
  nflPlayer("nfl-jason-peters", "Jason Peters", "OL", "B"),
  nflPlayer("nfl-marshal-yanda", "Marshal Yanda", "OL", "B"),
  nflPlayer("nfl-tyron-smith", "Tyron Smith", "OL", "A"),
  nflPlayer("nfl-zack-martin", "Zack Martin", "OL", "A"),
  nflPlayer("nfl-jason-kelce", "Jason Kelce", "OL", "A"),
  nflPlayer("nfl-lane-johnson", "Lane Johnson", "OL", "B"),
  nflPlayer("nfl-quenton-nelson", "Quenton Nelson", "OL", "B"),
  nflPlayer("nfl-travis-frederick", "Travis Frederick", "OL", "B"),

  // NFL specialists.
  nflPlayer("nfl-adam-vinatieri", "Adam Vinatieri", "K", "A"),
  nflPlayer("nfl-justin-tucker", "Justin Tucker", "K", "A"),
  nflPlayer("nfl-stephen-gostkowski", "Stephen Gostkowski", "K", "B"),
  nflPlayer("nfl-robbie-gould", "Robbie Gould", "K", "B"),
  nflPlayer("nfl-sebastian-janikowski", "Sebastian Janikowski", "K", "B"),
  nflPlayer("nfl-shane-lechler", "Shane Lechler", "P", "A"),
  nflPlayer("nfl-johnny-hekker", "Johnny Hekker", "P", "B"),
  nflPlayer("nfl-thomas-morstead", "Thomas Morstead", "P", "B"),
  nflPlayer("nfl-pat-mcafee", "Pat McAfee", "P", "A"),
  nflPlayer("nfl-andy-lee", "Andy Lee", "P", "C"),

  // Recognizable CFB games establish the canonical game identity family. Stage 13 may hydrate objective facts later.
  cfbGame("cfb-game-2006-rose-bowl", "2006 Rose Bowl — Texas vs USC", 2005, "A"),
  cfbGame("cfb-game-2007-fiesta-bowl", "2007 Fiesta Bowl — Boise State vs Oklahoma", 2006, "A"),
  cfbGame("cfb-game-2011-game-of-the-century", "2011 Alabama vs LSU", 2011, "B"),
  cfbGame("cfb-game-2013-kick-six", "2013 Iron Bowl — Alabama vs Auburn", 2013, "A"),
  cfbGame("cfb-game-2014-cfp-title", "2014 CFP National Championship — Ohio State vs Oregon", 2014, "B"),
  cfbGame("cfb-game-2017-cfp-title", "2017 CFP National Championship — Clemson vs Alabama", 2016, "B"),
  cfbGame("cfb-game-2018-rose-bowl", "2018 Rose Bowl — Georgia vs Oklahoma", 2017, "B"),
  cfbGame("cfb-game-2020-cfp-title", "2020 CFP National Championship — LSU vs Clemson", 2019, "B"),
  cfbGame("cfb-game-2022-tennessee-alabama", "2022 Tennessee vs Alabama", 2022, "C"),
  cfbGame("cfb-game-2024-rose-bowl", "2024 Rose Bowl — Michigan vs Alabama", 2023, "B"),
] as const;

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

function matchingEvidence(subject: FootballCanonicalSubject) {
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

export function footballRecognitionEvidenceFor(subject: FootballCanonicalSubject) {
  const record = matchingEvidence(subject);
  if (!record) return null;
  return {
    tier: record.tier,
    sourceIdentityKey: { provider: record.sourceProvider, id: record.sourceId } as const,
    basis: record.basis,
  };
}

export const footballRecognitionEvidenceSubjects: readonly FootballCanonicalSubject[] = footballRecognitionEvidenceRecords.map((record) => ({
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
