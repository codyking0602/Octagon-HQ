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

export type FootballRecognitionSubjectKind = FootballCanonicalSubjectKind | "franchise" | "game" | "era";
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
  /** Independent corroboration used for recognition only; never treated as a factual-stat source. */
  corroboratingSourceProviders?: readonly FootballSourceProviderId[];
}

type CfbSeed = readonly [
  id: string,
  name: string,
  position: FootballCanonicalPosition,
  school: string,
  tier: FootballRecognizabilityTier,
  basis?: FootballRecognitionEvidenceBasis,
  provider?: FootballSourceProviderId,
];
type NflSeed = readonly [id: string, name: string, position: FootballCanonicalPosition, tier: FootballRecognizabilityTier];
type CoachSeed = readonly [id: string, name: string, league: FootballCanonicalLeague, tier: FootballRecognizabilityTier];
type EraSeed = readonly [id: string, name: string, startSeason: number, endSeason: number, tier: FootballRecognizabilityTier, franchises: readonly string[]];
type GameSeed = readonly [id: string, name: string, season: number, tier: FootballRecognizabilityTier];

const cfb = (
  id: string,
  name: string,
  position: FootballCanonicalPosition,
  school: string,
  tier: FootballRecognizabilityTier = "C",
  basis: FootballRecognitionEvidenceBasis = "first-team-all-america",
  provider: FootballSourceProviderId = "sports-reference",
): CfbSeed => [id, name, position, school, tier, basis, provider];

const cfbSeeds: readonly CfbSeed[] = [
  // Quarterbacks — college identity is independent from NFL success.
  cfb("cfb-michael-vick", "Michael Vick", "QB", "Virginia Tech", "B", "reviewed-national-recognition"),
  cfb("cfb-drew-brees", "Drew Brees", "QB", "Purdue", "B"),
  cfb("cfb-chris-weinke", "Chris Weinke", "QB", "Florida State", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-josh-heupel", "Josh Heupel", "QB", "Oklahoma"),
  cfb("cfb-rex-grossman", "Rex Grossman", "QB", "Florida", "B"),
  cfb("cfb-ken-dorsey", "Ken Dorsey", "QB", "Miami", "B"),
  cfb("cfb-carson-palmer", "Carson Palmer", "QB", "USC", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-eli-manning", "Eli Manning", "QB", "Ole Miss", "B"),
  cfb("cfb-jason-white", "Jason White", "QB", "Oklahoma", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-alex-smith", "Alex Smith", "QB", "Utah"),
  cfb("cfb-matt-leinart", "Matt Leinart", "QB", "USC", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-vince-young", "Vince Young", "QB", "Texas", "A", "reviewed-national-recognition"),
  cfb("cfb-brady-quinn", "Brady Quinn", "QB", "Notre Dame", "B"),
  cfb("cfb-troy-smith", "Troy Smith", "QB", "Ohio State", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-colt-brennan", "Colt Brennan", "QB", "Hawaii", "B"),
  cfb("cfb-tim-tebow", "Tim Tebow", "QB", "Florida", "A", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-sam-bradford", "Sam Bradford", "QB", "Oklahoma", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-colt-mccoy", "Colt McCoy", "QB", "Texas", "B"),
  cfb("cfb-kellen-moore", "Kellen Moore", "QB", "Boise State", "B"),
  cfb("cfb-cam-newton", "Cam Newton", "QB", "Auburn", "A", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-andrew-luck", "Andrew Luck", "QB", "Stanford", "B"),
  cfb("cfb-robert-griffin-iii", "Robert Griffin III", "QB", "Baylor", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-johnny-manziel", "Johnny Manziel", "QB", "Texas A&M", "A", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-aj-mccarron", "A.J. McCarron", "QB", "Alabama"),
  cfb("cfb-jameis-winston", "Jameis Winston", "QB", "Florida State", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),

  // Running backs.
  cfb("cfb-ron-dayne", "Ron Dayne", "RB", "Wisconsin", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-ladainian-tomlinson", "LaDainian Tomlinson", "RB", "TCU", "B"),
  cfb("cfb-shaun-alexander", "Shaun Alexander", "RB", "Alabama", "B"),
  cfb("cfb-clinton-portis", "Clinton Portis", "RB", "Miami"),
  cfb("cfb-larry-johnson", "Larry Johnson", "RB", "Penn State", "B"),
  cfb("cfb-willis-mcgahee", "Willis McGahee", "RB", "Miami", "B"),
  cfb("cfb-steven-jackson", "Steven Jackson", "RB", "Oregon State", "B"),
  cfb("cfb-darren-sproles", "Darren Sproles", "RB", "Kansas State", "B"),
  cfb("cfb-cedric-benson", "Cedric Benson", "RB", "Texas", "B"),
  cfb("cfb-adrian-peterson", "Adrian Peterson", "RB", "Oklahoma", "A"),
  cfb("cfb-reggie-bush", "Reggie Bush", "RB", "USC", "A", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-deangelo-williams", "DeAngelo Williams", "RB", "Memphis", "B"),
  cfb("cfb-darren-mcfadden", "Darren McFadden", "RB", "Arkansas", "A"),
  cfb("cfb-ray-rice", "Ray Rice", "RB", "Rutgers", "B"),
  cfb("cfb-jonathan-stewart", "Jonathan Stewart", "RB", "Oregon"),
  cfb("cfb-jamaal-charles", "Jamaal Charles", "RB", "Texas", "B"),
  cfb("cfb-marshawn-lynch", "Marshawn Lynch", "RB", "California", "B"),
  cfb("cfb-matt-forte", "Matt Forte", "RB", "Tulane"),
  cfb("cfb-shonn-greene", "Shonn Greene", "RB", "Iowa"),
  cfb("cfb-knowshon-moreno", "Knowshon Moreno", "RB", "Georgia"),
  cfb("cfb-mark-ingram-ii", "Mark Ingram II", "RB", "Alabama", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-toby-gerhart", "Toby Gerhart", "RB", "Stanford"),
  cfb("cfb-lamichael-james", "LaMichael James", "RB", "Oregon", "B"),
  cfb("cfb-montee-ball", "Montee Ball", "RB", "Wisconsin", "B"),
  cfb("cfb-trent-richardson", "Trent Richardson", "RB", "Alabama", "B"),
  cfb("cfb-ka-deem-carey", "Ka'Deem Carey", "RB", "Arizona"),

  // Wide receivers.
  cfb("cfb-peter-warrick", "Peter Warrick", "WR", "Florida State", "B"),
  cfb("cfb-antonio-bryant", "Antonio Bryant", "WR", "Pittsburgh"),
  cfb("cfb-roy-williams-wr", "Roy Williams", "WR", "Texas", "B"),
  cfb("cfb-andre-johnson", "Andre Johnson", "WR", "Miami", "B"),
  cfb("cfb-larry-fitzgerald", "Larry Fitzgerald", "WR", "Pittsburgh", "A"),
  cfb("cfb-braylon-edwards", "Braylon Edwards", "WR", "Michigan", "B"),
  cfb("cfb-desean-jackson", "DeSean Jackson", "WR", "California", "B"),
  cfb("cfb-calvin-johnson", "Calvin Johnson", "WR", "Georgia Tech", "A"),
  cfb("cfb-dwayne-jarrett", "Dwayne Jarrett", "WR", "USC"),
  cfb("cfb-jeff-samardzija", "Jeff Samardzija", "WR", "Notre Dame"),
  cfb("cfb-michael-crabtree", "Michael Crabtree", "WR", "Texas Tech", "A"),
  cfb("cfb-dez-bryant", "Dez Bryant", "WR", "Oklahoma State", "B"),
  cfb("cfb-jordan-shipley", "Jordan Shipley", "WR", "Texas", "B"),
  cfb("cfb-golden-tate", "Golden Tate", "WR", "Notre Dame"),
  cfb("cfb-ryan-broyles", "Ryan Broyles", "WR", "Oklahoma", "B"),
  cfb("cfb-justin-blackmon", "Justin Blackmon", "WR", "Oklahoma State", "A"),
  cfb("cfb-robert-woods", "Robert Woods", "WR", "USC"),
  cfb("cfb-marqise-lee", "Marqise Lee", "WR", "USC", "B"),
  cfb("cfb-sammy-watkins", "Sammy Watkins", "WR", "Clemson", "B"),
  cfb("cfb-brandin-cooks", "Brandin Cooks", "WR", "Oregon State", "B"),
  cfb("cfb-mike-evans", "Mike Evans", "WR", "Texas A&M", "B"),
  cfb("cfb-davante-adams", "Davante Adams", "WR", "Fresno State", "B"),
  cfb("cfb-amari-cooper", "Amari Cooper", "WR", "Alabama", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-devonta-smith", "DeVonta Smith", "WR", "Alabama", "A", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-jamarr-chase", "Ja'Marr Chase", "WR", "LSU", "B"),

  // Tight ends. National position awards and consensus recognition are especially important here.
  cfb("cfb-todd-heap", "Todd Heap", "TE", "Arizona State"),
  cfb("cfb-jeremy-shockey", "Jeremy Shockey", "TE", "Miami", "B"),
  cfb("cfb-dan-graham", "Dan Graham", "TE", "Colorado"),
  cfb("cfb-dallas-clark", "Dallas Clark", "TE", "Iowa", "B"),
  cfb("cfb-kellen-winslow-ii", "Kellen Winslow II", "TE", "Miami", "B"),
  cfb("cfb-heath-miller", "Heath Miller", "TE", "Virginia", "B"),
  cfb("cfb-vernon-davis", "Vernon Davis", "TE", "Maryland", "B"),
  cfb("cfb-marcedes-lewis", "Marcedes Lewis", "TE", "UCLA", "B"),
  cfb("cfb-zach-miller", "Zach Miller", "TE", "Arizona State"),
  cfb("cfb-fred-davis", "Fred Davis", "TE", "USC"),
  cfb("cfb-chase-coffman", "Chase Coffman", "TE", "Missouri", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-jermaine-gresham", "Jermaine Gresham", "TE", "Oklahoma", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-rob-gronkowski", "Rob Gronkowski", "TE", "Arizona", "B"),
  cfb("cfb-aaron-hernandez", "Aaron Hernandez", "TE", "Florida"),
  cfb("cfb-michael-egnew", "Michael Egnew", "TE", "Missouri"),
  cfb("cfb-dwayne-allen", "Dwayne Allen", "TE", "Clemson", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-tyler-eifert", "Tyler Eifert", "TE", "Notre Dame", "B"),
  cfb("cfb-zach-ertz", "Zach Ertz", "TE", "Stanford", "B"),
  cfb("cfb-jace-amaro", "Jace Amaro", "TE", "Texas Tech"),
  cfb("cfb-eric-ebron", "Eric Ebron", "TE", "North Carolina"),
  cfb("cfb-jake-butt", "Jake Butt", "TE", "Michigan", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-hunter-henry", "Hunter Henry", "TE", "Arkansas", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-mark-andrews", "Mark Andrews", "TE", "Oklahoma", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-tj-hockenson", "T.J. Hockenson", "TE", "Iowa", "B"),
  cfb("cfb-noah-fant", "Noah Fant", "TE", "Iowa"),
  cfb("cfb-kyle-pitts", "Kyle Pitts", "TE", "Florida", "B"),
  cfb("cfb-trey-mcbride", "Trey McBride", "TE", "Colorado State", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-michael-mayer", "Michael Mayer", "TE", "Notre Dame", "B"),
  cfb("cfb-brock-bowers", "Brock Bowers", "TE", "Georgia", "A", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-colston-loveland", "Colston Loveland", "TE", "Michigan"),

  // Offensive line. Production feeds cannot discover this pool reliably.
  cfb("cfb-steve-hutchinson", "Steve Hutchinson", "OL", "Michigan", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-leonard-davis", "Leonard Davis", "OL", "Texas", "B"),
  cfb("cfb-lecharles-bentley", "LeCharles Bentley", "OL", "Ohio State"),
  cfb("cfb-bryant-mckinnie", "Bryant McKinnie", "OL", "Miami", "B"),
  cfb("cfb-andre-gurode", "Andre Gurode", "OL", "Colorado"),
  cfb("cfb-jordan-gross", "Jordan Gross", "OL", "Utah"),
  cfb("cfb-shawn-andrews", "Shawn Andrews", "OL", "Arkansas"),
  cfb("cfb-robert-gallery", "Robert Gallery", "OL", "Iowa", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-jammal-brown", "Jammal Brown", "OL", "Oklahoma"),
  cfb("cfb-dbrickashaw-ferguson", "D'Brickashaw Ferguson", "OL", "Virginia", "B"),
  cfb("cfb-nick-mangold", "Nick Mangold", "OL", "Ohio State", "B"),
  cfb("cfb-justin-blalock", "Justin Blalock", "OL", "Texas"),
  cfb("cfb-joe-thomas", "Joe Thomas", "OL", "Wisconsin", "B"),
  cfb("cfb-jake-long", "Jake Long", "OL", "Michigan", "B"),
  cfb("cfb-ryan-clady", "Ryan Clady", "OL", "Boise State"),
  cfb("cfb-michael-oher", "Michael Oher", "OL", "Ole Miss", "B"),
  cfb("cfb-alex-mack", "Alex Mack", "OL", "California", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-maurkice-pouncey", "Maurkice Pouncey", "OL", "Florida", "B"),
  cfb("cfb-trent-williams", "Trent Williams", "OL", "Oklahoma", "B"),
  cfb("cfb-mike-iupati", "Mike Iupati", "OL", "Idaho"),
  cfb("cfb-gabe-carimi", "Gabe Carimi", "OL", "Wisconsin"),
  cfb("cfb-nate-solder", "Nate Solder", "OL", "Colorado"),
  cfb("cfb-rodney-hudson", "Rodney Hudson", "OL", "Florida State"),
  cfb("cfb-david-decastro", "David DeCastro", "OL", "Stanford", "B"),
  cfb("cfb-matt-kalil", "Matt Kalil", "OL", "USC"),
  cfb("cfb-barrett-jones", "Barrett Jones", "OL", "Alabama", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-luke-joeckel", "Luke Joeckel", "OL", "Texas A&M"),
  cfb("cfb-taylor-lewan", "Taylor Lewan", "OL", "Michigan", "B"),
  cfb("cfb-chance-warmack", "Chance Warmack", "OL", "Alabama"),
  cfb("cfb-jonathan-cooper", "Jonathan Cooper", "OL", "North Carolina"),
  cfb("cfb-jake-matthews", "Jake Matthews", "OL", "Texas A&M", "B"),
  cfb("cfb-cyrus-kouandjio", "Cyrus Kouandjio", "OL", "Alabama"),
  cfb("cfb-cyril-richardson", "Cyril Richardson", "OL", "Baylor"),
  cfb("cfb-david-yankey", "David Yankey", "OL", "Stanford"),
  cfb("cfb-bryan-stork", "Bryan Stork", "OL", "Florida State"),
  cfb("cfb-gabe-ikard", "Gabe Ikard", "OL", "Oklahoma"),
  cfb("cfb-dj-fluker", "D.J. Fluker", "OL", "Alabama"),
  cfb("cfb-eric-fisher", "Eric Fisher", "OL", "Central Michigan"),
  cfb("cfb-russell-okung", "Russell Okung", "OL", "Oklahoma State", "B"),
  cfb("cfb-brandon-scherff", "Brandon Scherff", "OL", "Iowa", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-jack-conklin", "Jack Conklin", "OL", "Michigan State"),
  cfb("cfb-ryan-kelly", "Ryan Kelly", "OL", "Alabama"),
  cfb("cfb-cam-robinson", "Cam Robinson", "OL", "Alabama"),
  cfb("cfb-quenton-nelson", "Quenton Nelson", "OL", "Notre Dame", "B"),
  cfb("cfb-mike-mcglinchey", "Mike McGlinchey", "OL", "Notre Dame"),
  cfb("cfb-garrett-bradbury", "Garrett Bradbury", "OL", "NC State"),
  cfb("cfb-orlando-brown", "Orlando Brown", "OL", "Oklahoma", "B"),
  cfb("cfb-tristan-wirfs", "Tristan Wirfs", "OL", "Iowa", "B"),
  cfb("cfb-penei-sewell", "Penei Sewell", "OL", "Oregon", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-rashawn-slater", "Rashawn Slater", "OL", "Northwestern"),
  cfb("cfb-landon-dickerson", "Landon Dickerson", "OL", "Alabama"),
  cfb("cfb-tyler-linderbaum", "Tyler Linderbaum", "OL", "Iowa", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-paris-johnson-jr", "Paris Johnson Jr.", "OL", "Ohio State"),
  cfb("cfb-joe-alt", "Joe Alt", "OL", "Notre Dame", "B"),
  cfb("cfb-graham-barton", "Graham Barton", "OL", "Duke"),
  cfb("cfb-seth-mclaughlin", "Seth McLaughlin", "OL", "Ohio State"),

  // DL / EDGE.
  cfb("cfb-julius-peppers", "Julius Peppers", "DL", "North Carolina", "B"),
  cfb("cfb-john-henderson", "John Henderson", "DL", "Tennessee", "B"),
  cfb("cfb-dwight-freeney", "Dwight Freeney", "DL", "Syracuse", "B"),
  cfb("cfb-terrell-suggs", "Terrell Suggs", "DL", "Arizona State", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-tommie-harris", "Tommie Harris", "DL", "Oklahoma", "B"),
  cfb("cfb-david-pollack", "David Pollack", "DL", "Georgia", "B"),
  cfb("cfb-tamba-hali", "Tamba Hali", "DL", "Penn State"),
  cfb("cfb-elvis-dumervil", "Elvis Dumervil", "DL", "Louisville"),
  cfb("cfb-haloti-ngata", "Haloti Ngata", "DL", "Oregon", "B"),
  cfb("cfb-mario-williams", "Mario Williams", "DL", "NC State", "B"),
  cfb("cfb-glenn-dorsey", "Glenn Dorsey", "DL", "LSU", "B"),
  cfb("cfb-chris-long", "Chris Long", "DL", "Virginia", "B"),
  cfb("cfb-brian-orakpo", "Brian Orakpo", "DL", "Texas", "B"),
  cfb("cfb-gerald-mccoy", "Gerald McCoy", "DL", "Oklahoma", "B"),
  cfb("cfb-ndamukong-suh", "Ndamukong Suh", "DL", "Nebraska", "A", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-terrence-cody", "Terrence Cody", "DL", "Alabama"),
  cfb("cfb-jj-watt", "J.J. Watt", "DL", "Wisconsin", "B"),
  cfb("cfb-nick-fairley", "Nick Fairley", "DL", "Auburn"),
  cfb("cfb-daquan-bowers", "Da'Quan Bowers", "DL", "Clemson"),
  cfb("cfb-melvin-ingram", "Melvin Ingram", "DL", "South Carolina"),
  cfb("cfb-jadeveon-clowney", "Jadeveon Clowney", "DL", "South Carolina", "A"),
  cfb("cfb-aaron-donald", "Aaron Donald", "DL", "Pittsburgh", "A"),
  cfb("cfb-michael-sam", "Michael Sam", "DL", "Missouri"),
  cfb("cfb-joey-bosa", "Joey Bosa", "DL", "Ohio State", "B"),
  cfb("cfb-myles-garrett", "Myles Garrett", "DL", "Texas A&M", "A"),
  cfb("cfb-jonathan-allen", "Jonathan Allen", "DL", "Alabama", "B"),
  cfb("cfb-nick-bosa", "Nick Bosa", "DL", "Ohio State", "B"),
  cfb("cfb-quinnen-williams", "Quinnen Williams", "DL", "Alabama", "B"),
  cfb("cfb-chase-young", "Chase Young", "DL", "Ohio State", "A", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-will-anderson-jr", "Will Anderson Jr.", "DL", "Alabama", "A", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-jalen-carter", "Jalen Carter", "DL", "Georgia", "B"),
  cfb("cfb-aidan-hutchinson", "Aidan Hutchinson", "DL", "Michigan", "B"),
  cfb("cfb-kayvon-thibodeaux", "Kayvon Thibodeaux", "DL", "Oregon", "B"),
  cfb("cfb-tvondre-sweat", "T'Vondre Sweat", "DL", "Texas"),
  cfb("cfb-jerzhan-newton", "Jer'Zhan Newton", "DL", "Illinois"),
  cfb("cfb-mason-graham", "Mason Graham", "DL", "Michigan", "B"),
  cfb("cfb-abdul-carter", "Abdul Carter", "DL", "Penn State", "B"),

  // Linebackers.
  cfb("cfb-brian-urlacher", "Brian Urlacher", "LB", "New Mexico", "B"),
  cfb("cfb-dan-morgan", "Dan Morgan", "LB", "Miami", "B"),
  cfb("cfb-rocky-calmus", "Rocky Calmus", "LB", "Oklahoma"),
  cfb("cfb-ej-henderson", "E.J. Henderson", "LB", "Maryland"),
  cfb("cfb-derrick-johnson", "Derrick Johnson", "LB", "Texas", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-aj-hawk", "A.J. Hawk", "LB", "Ohio State", "B"),
  cfb("cfb-paul-posluszny", "Paul Posluszny", "LB", "Penn State", "B"),
  cfb("cfb-patrick-willis", "Patrick Willis", "LB", "Ole Miss", "B"),
  cfb("cfb-james-laurinaitis", "James Laurinaitis", "LB", "Ohio State", "B"),
  cfb("cfb-rey-maualuga", "Rey Maualuga", "LB", "USC"),
  cfb("cfb-brian-cushing", "Brian Cushing", "LB", "USC"),
  cfb("cfb-rolando-mcclain", "Rolando McClain", "LB", "Alabama", "B"),
  cfb("cfb-von-miller", "Von Miller", "LB", "Texas A&M", "A"),
  cfb("cfb-lavonte-david", "Lavonte David", "LB", "Nebraska"),
  cfb("cfb-donta-hightower", "Dont'a Hightower", "LB", "Alabama"),
  cfb("cfb-luke-kuechly", "Luke Kuechly", "LB", "Boston College", "A"),
  cfb("cfb-manti-teo", "Manti Te'o", "LB", "Notre Dame", "A"),
  cfb("cfb-cj-mosley", "C.J. Mosley", "LB", "Alabama", "B"),
  cfb("cfb-anthony-barr", "Anthony Barr", "LB", "UCLA"),
  cfb("cfb-ryan-shazier", "Ryan Shazier", "LB", "Ohio State"),
  cfb("cfb-khalil-mack", "Khalil Mack", "LB", "Buffalo", "B"),
  cfb("cfb-jaylon-smith", "Jaylon Smith", "LB", "Notre Dame", "B"),
  cfb("cfb-roquan-smith", "Roquan Smith", "LB", "Georgia", "A"),
  cfb("cfb-devin-white", "Devin White", "LB", "LSU", "B"),
  cfb("cfb-isaiah-simmons", "Isaiah Simmons", "LB", "Clemson", "B"),
  cfb("cfb-micah-parsons", "Micah Parsons", "LB", "Penn State", "B"),
  cfb("cfb-jeremiah-owusu-koramoah", "Jeremiah Owusu-Koramoah", "LB", "Notre Dame"),
  cfb("cfb-nakobe-dean", "Nakobe Dean", "LB", "Georgia", "B"),
  cfb("cfb-jack-campbell", "Jack Campbell", "LB", "Iowa"),
  cfb("cfb-payton-wilson", "Payton Wilson", "LB", "NC State"),
  cfb("cfb-edgerrin-cooper", "Edgerrin Cooper", "LB", "Texas A&M"),

  // Secondary.
  cfb("cfb-champ-bailey", "Champ Bailey", "DB", "Georgia", "B"),
  cfb("cfb-ed-reed", "Ed Reed", "DB", "Miami", "A"),
  cfb("cfb-roy-williams-db", "Roy Williams", "DB", "Oklahoma", "B"),
  cfb("cfb-quentin-jammer", "Quentin Jammer", "DB", "Texas"),
  cfb("cfb-troy-polamalu", "Troy Polamalu", "DB", "USC", "B"),
  cfb("cfb-sean-taylor", "Sean Taylor", "DB", "Miami", "A"),
  cfb("cfb-michael-huff", "Michael Huff", "DB", "Texas", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-aaron-ross", "Aaron Ross", "DB", "Texas", "B"),
  cfb("cfb-eric-weddle", "Eric Weddle", "DB", "Utah", "B"),
  cfb("cfb-aqib-talib", "Aqib Talib", "DB", "Kansas"),
  cfb("cfb-malcolm-jenkins", "Malcolm Jenkins", "DB", "Ohio State", "B"),
  cfb("cfb-eric-berry", "Eric Berry", "DB", "Tennessee", "A", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-earl-thomas", "Earl Thomas", "DB", "Texas", "B"),
  cfb("cfb-patrick-peterson", "Patrick Peterson", "DB", "LSU", "A"),
  cfb("cfb-tyrann-mathieu", "Tyrann Mathieu", "DB", "LSU", "A"),
  cfb("cfb-morris-claiborne", "Morris Claiborne", "DB", "LSU", "B"),
  cfb("cfb-dee-milliner", "Dee Milliner", "DB", "Alabama"),
  cfb("cfb-darqueze-dennard", "Darqueze Dennard", "DB", "Michigan State", "B"),
  cfb("cfb-lamarcus-joyner", "Lamarcus Joyner", "DB", "Florida State"),
  cfb("cfb-ha-ha-clinton-dix", "Ha Ha Clinton-Dix", "DB", "Alabama"),
  cfb("cfb-jason-verrett", "Jason Verrett", "DB", "TCU"),
  cfb("cfb-vernon-hargreaves-iii", "Vernon Hargreaves III", "DB", "Florida", "B"),
  cfb("cfb-jalen-ramsey", "Jalen Ramsey", "DB", "Florida State", "B"),
  cfb("cfb-minkah-fitzpatrick", "Minkah Fitzpatrick", "DB", "Alabama", "A"),
  cfb("cfb-jamal-adams", "Jamal Adams", "DB", "LSU", "B"),
  cfb("cfb-derwin-james", "Derwin James", "DB", "Florida State", "B"),
  cfb("cfb-jabrill-peppers", "Jabrill Peppers", "DB", "Michigan", "B"),
  cfb("cfb-budda-baker", "Budda Baker", "DB", "Washington", "B"),
  cfb("cfb-jeff-okudah", "Jeff Okudah", "DB", "Ohio State", "B"),
  cfb("cfb-antoine-winfield-jr", "Antoine Winfield Jr.", "DB", "Minnesota", "B"),
  cfb("cfb-patrick-surtain-ii", "Patrick Surtain II", "DB", "Alabama", "B"),
  cfb("cfb-sauce-gardner", "Sauce Gardner", "DB", "Cincinnati", "B"),
  cfb("cfb-kyle-hamilton", "Kyle Hamilton", "DB", "Notre Dame", "B"),
  cfb("cfb-cooper-dejean", "Cooper DeJean", "DB", "Iowa", "B"),
  cfb("cfb-malaki-starks", "Malaki Starks", "DB", "Georgia", "B"),
  cfb("cfb-caleb-downs", "Caleb Downs", "DB", "Ohio State", "B"),
  cfb("cfb-travis-hunter-db", "Travis Hunter", "DB", "Colorado", "A", "major-award-or-hall-of-fame", "official-cfb-awards"),

  // Specialists.
  cfb("cfb-sebastian-janikowski", "Sebastian Janikowski", "K", "Florida State", "B"),
  cfb("cfb-mike-nugent", "Mike Nugent", "K", "Ohio State", "B"),
  cfb("cfb-mason-crosby", "Mason Crosby", "K", "Colorado", "B"),
  cfb("cfb-graham-gano", "Graham Gano", "K", "Florida State"),
  cfb("cfb-kai-forbath", "Kai Forbath", "K", "UCLA"),
  cfb("cfb-alex-henery", "Alex Henery", "K", "Nebraska"),
  cfb("cfb-dan-bailey", "Dan Bailey", "K", "Oklahoma State", "B"),
  cfb("cfb-randy-bullock", "Randy Bullock", "K", "Texas A&M"),
  cfb("cfb-cairo-santos", "Cairo Santos", "K", "Tulane"),
  cfb("cfb-dustin-hopkins", "Dustin Hopkins", "K", "Florida State"),
  cfb("cfb-roberto-aguayo", "Roberto Aguayo", "K", "Florida State", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-zane-gonzalez", "Zane Gonzalez", "K", "Arizona State", "B"),
  cfb("cfb-rodrigo-blankenship", "Rodrigo Blankenship", "K", "Georgia", "B"),
  cfb("cfb-jake-elliott", "Jake Elliott", "K", "Memphis"),
  cfb("cfb-kaimi-fairbairn", "Ka'imi Fairbairn", "K", "UCLA"),
  cfb("cfb-shane-lechler", "Shane Lechler", "P", "Texas A&M", "B"),
  cfb("cfb-dustin-colquitt", "Dustin Colquitt", "P", "Tennessee"),
  cfb("cfb-daniel-sepulveda", "Daniel Sepulveda", "P", "Baylor", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-kevin-huber", "Kevin Huber", "P", "Cincinnati"),
  cfb("cfb-pat-mcafee", "Pat McAfee", "P", "West Virginia", "B"),
  cfb("cfb-drew-butler", "Drew Butler", "P", "Georgia"),
  cfb("cfb-brad-wing", "Brad Wing", "P", "LSU"),
  cfb("cfb-ryan-allen", "Ryan Allen", "P", "Louisiana Tech", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-tom-hornsey", "Tom Hornsey", "P", "Memphis"),
  cfb("cfb-michael-dickson", "Michael Dickson", "P", "Texas", "B", "major-award-or-hall-of-fame", "official-cfb-awards"),
  cfb("cfb-braden-mann", "Braden Mann", "P", "Texas A&M"),
  cfb("cfb-pressley-harvin-iii", "Pressley Harvin III", "P", "Georgia Tech"),
  cfb("cfb-matt-araiza", "Matt Araiza", "P", "San Diego State", "B"),
  cfb("cfb-tory-taylor", "Tory Taylor", "P", "Iowa", "B"),
] as const;

const nflSeeds: readonly NflSeed[] = [
  ["nfl-jonathan-ogden", "Jonathan Ogden", "OL", "A"],
  ["nfl-orlando-pace", "Orlando Pace", "OL", "A"],
  ["nfl-walter-jones", "Walter Jones", "OL", "A"],
  ["nfl-will-shields", "Will Shields", "OL", "A"],
  ["nfl-steve-hutchinson", "Steve Hutchinson", "OL", "A"],
  ["nfl-alan-faneca", "Alan Faneca", "OL", "A"],
  ["nfl-kevin-mawae", "Kevin Mawae", "OL", "A"],
  ["nfl-joe-thomas", "Joe Thomas", "OL", "A"],
  ["nfl-jason-peters", "Jason Peters", "OL", "B"],
  ["nfl-andrew-whitworth", "Andrew Whitworth", "OL", "B"],
  ["nfl-nick-mangold", "Nick Mangold", "OL", "B"],
  ["nfl-joe-staley", "Joe Staley", "OL", "B"],
  ["nfl-alex-mack", "Alex Mack", "OL", "B"],
  ["nfl-maurkice-pouncey", "Maurkice Pouncey", "OL", "B"],
  ["nfl-trent-williams", "Trent Williams", "OL", "A"],
  ["nfl-marshal-yanda", "Marshal Yanda", "OL", "A"],
  ["nfl-tyron-smith", "Tyron Smith", "OL", "A"],
  ["nfl-zack-martin", "Zack Martin", "OL", "A"],
  ["nfl-jason-kelce", "Jason Kelce", "OL", "A"],
  ["nfl-lane-johnson", "Lane Johnson", "OL", "B"],
  ["nfl-david-bakhtiari", "David Bakhtiari", "OL", "B"],
  ["nfl-travis-frederick", "Travis Frederick", "OL", "B"],
  ["nfl-ryan-kalil", "Ryan Kalil", "OL", "C"],
  ["nfl-quenton-nelson", "Quenton Nelson", "OL", "B"],
  ["nfl-creed-humphrey", "Creed Humphrey", "OL", "B"],
  ["nfl-tristan-wirfs", "Tristan Wirfs", "OL", "B"],
  ["nfl-penei-sewell", "Penei Sewell", "OL", "B"],
  ["nfl-jordan-mailata", "Jordan Mailata", "OL", "C"],
  ["nfl-adam-vinatieri", "Adam Vinatieri", "K", "A"],
  ["nfl-justin-tucker", "Justin Tucker", "K", "A"],
  ["nfl-jason-hanson", "Jason Hanson", "K", "B"],
  ["nfl-sebastian-janikowski", "Sebastian Janikowski", "K", "B"],
  ["nfl-stephen-gostkowski", "Stephen Gostkowski", "K", "B"],
  ["nfl-robbie-gould", "Robbie Gould", "K", "B"],
  ["nfl-matt-prater", "Matt Prater", "K", "B"],
  ["nfl-mason-crosby", "Mason Crosby", "K", "B"],
  ["nfl-harrison-butker", "Harrison Butker", "K", "B"],
  ["nfl-shane-lechler", "Shane Lechler", "P", "A"],
  ["nfl-johnny-hekker", "Johnny Hekker", "P", "B"],
  ["nfl-andy-lee", "Andy Lee", "P", "B"],
  ["nfl-thomas-morstead", "Thomas Morstead", "P", "B"],
  ["nfl-sam-koch", "Sam Koch", "P", "C"],
  ["nfl-pat-mcafee", "Pat McAfee", "P", "A"],
] as const;

const coachSeeds: readonly CoachSeed[] = [
  ["bobby-bowden", "Bobby Bowden", "CFB", "A"],
  ["steve-spurrier", "Steve Spurrier", "CFB", "A"],
  ["mack-brown", "Mack Brown", "CFB", "B"],
  ["bob-stoops", "Bob Stoops", "CFB", "B"],
  ["pete-carroll", "Pete Carroll", "CFB", "A"],
  ["jim-tressel", "Jim Tressel", "CFB", "B"],
  ["nick-saban", "Nick Saban", "CFB", "A"],
  ["urban-meyer", "Urban Meyer", "CFB", "A"],
  ["les-miles", "Les Miles", "CFB", "B"],
  ["mark-richt", "Mark Richt", "CFB", "B"],
  ["gary-patterson", "Gary Patterson", "CFB", "B"],
  ["frank-beamer", "Frank Beamer", "CFB", "B"],
  ["mike-leach", "Mike Leach", "CFB", "B"],
  ["chris-petersen", "Chris Petersen", "CFB", "B"],
  ["chip-kelly", "Chip Kelly", "CFB", "B"],
  ["dabo-swinney", "Dabo Swinney", "CFB", "A"],
  ["jim-harbaugh", "Jim Harbaugh", "CFB", "B"],
  ["jim-fisher", "Jimbo Fisher", "CFB", "B"],
  ["gus-malzahn", "Gus Malzahn", "CFB", "C"],
  ["ed-orgeron", "Ed Orgeron", "CFB", "B"],
  ["brian-kelly", "Brian Kelly", "CFB", "B"],
  ["kyle-whittingham", "Kyle Whittingham", "CFB", "B"],
  ["bill-snyder", "Bill Snyder", "CFB", "B"],
  ["lincoln-riley", "Lincoln Riley", "CFB", "B"],
  ["lane-kiffin", "Lane Kiffin", "CFB", "B"],
  ["ryan-day", "Ryan Day", "CFB", "B"],
  ["kirby-smart", "Kirby Smart", "CFB", "A"],
  ["james-franklin", "James Franklin", "CFB", "B"],
  ["luke-fickell", "Luke Fickell", "CFB", "C"],
  ["dan-lanning", "Dan Lanning", "CFB", "B"],
  ["deion-sanders", "Deion Sanders", "CFB", "B"],
];

const eraSeeds: readonly EraSeed[] = [
  ["nfl-era-patriots-belichick-brady", "New England Patriots — Belichick/Brady era", 2001, 2019, "A", ["NE"]],
  ["nfl-era-chiefs-mahomes-reid", "Kansas City Chiefs — Mahomes/Reid era", 2018, 2025, "A", ["KC"]],
  ["nfl-era-colts-peyton-manning", "Indianapolis Colts — Peyton Manning era", 1998, 2010, "B", ["IND"]],
  ["nfl-era-broncos-peyton-manning", "Denver Broncos — Peyton Manning era", 2012, 2015, "B", ["DEN"]],
  ["nfl-era-packers-rodgers", "Green Bay Packers — Aaron Rodgers era", 2008, 2022, "B", ["GB"]],
  ["nfl-era-saints-brees-payton", "New Orleans Saints — Brees/Payton era", 2006, 2020, "B", ["NO"]],
  ["nfl-era-seahawks-legion-of-boom", "Seattle Seahawks — Legion of Boom era", 2012, 2015, "B", ["SEA"]],
  ["nfl-era-rams-greatest-show-on-turf", "St. Louis Rams — Greatest Show on Turf", 1999, 2001, "A", ["LAR"]],
  ["nfl-era-steelers-roethlisberger", "Pittsburgh Steelers — Roethlisberger era", 2004, 2021, "B", ["PIT"]],
  ["nfl-era-ravens-ray-lewis", "Baltimore Ravens — Ray Lewis era", 1996, 2012, "B", ["BAL"]],
  ["nfl-era-cowboys-triplets", "Dallas Cowboys — Triplets dynasty", 1992, 1995, "A", ["DAL"]],
  ["nfl-era-49ers-montana-walsh", "San Francisco 49ers — Montana/Walsh dynasty", 1981, 1989, "A", ["SF"]],
];

const gameSeeds: readonly GameSeed[] = [
  ["cfb-game-2006-rose-bowl", "2006 Rose Bowl — Texas vs USC", 2005, "A"],
  ["cfb-game-2007-fiesta-bowl", "2007 Fiesta Bowl — Boise State vs Oklahoma", 2006, "A"],
  ["cfb-game-2007-app-state-michigan", "2007 Appalachian State at Michigan", 2007, "A"],
  ["cfb-game-2007-lsu-florida", "2007 LSU vs Florida", 2007, "C"],
  ["cfb-game-2008-texas-tech-texas", "2008 Texas at Texas Tech", 2008, "A"],
  ["cfb-game-2010-bcs-title", "2010 BCS Championship — Alabama vs Texas", 2009, "B"],
  ["cfb-game-2011-game-of-the-century", "2011 Alabama vs LSU", 2011, "B"],
  ["cfb-game-2012-sec-title", "2012 SEC Championship — Alabama vs Georgia", 2012, "B"],
  ["cfb-game-2013-kick-six", "2013 Iron Bowl — Alabama vs Auburn", 2013, "A"],
  ["cfb-game-2014-ohio-state-alabama", "2014 Sugar Bowl CFP — Ohio State vs Alabama", 2014, "B"],
  ["cfb-game-2014-cfp-title", "2014 CFP National Championship — Ohio State vs Oregon", 2014, "B"],
  ["cfb-game-2017-cfp-title", "2017 CFP National Championship — Clemson vs Alabama", 2016, "B"],
  ["cfb-game-2018-rose-bowl", "2018 Rose Bowl — Georgia vs Oklahoma", 2017, "B"],
  ["cfb-game-2018-cfp-title", "2018 CFP National Championship — Alabama vs Georgia", 2017, "A"],
  ["cfb-game-2019-cfp-title", "2019 CFP National Championship — Clemson vs Alabama", 2018, "B"],
  ["cfb-game-2020-cfp-title", "2020 CFP National Championship — LSU vs Clemson", 2019, "B"],
  ["cfb-game-2021-cfp-title", "2021 CFP National Championship — Alabama vs Ohio State", 2020, "C"],
  ["cfb-game-2022-cfp-title", "2022 CFP National Championship — Georgia vs Alabama", 2021, "B"],
  ["cfb-game-2022-tennessee-alabama", "2022 Tennessee vs Alabama", 2022, "B"],
  ["cfb-game-2022-peach-bowl", "2022 Peach Bowl CFP — Georgia vs Ohio State", 2022, "A"],
  ["cfb-game-2023-iron-bowl", "2023 Iron Bowl — Alabama vs Auburn", 2023, "C"],
  ["cfb-game-2024-rose-bowl", "2024 Rose Bowl CFP — Michigan vs Alabama", 2023, "B"],
  ["cfb-game-2024-sugar-bowl", "2024 Sugar Bowl CFP — Washington vs Texas", 2023, "B"],
  ["cfb-game-2024-cfp-title", "2024 CFP National Championship — Michigan vs Washington", 2023, "B"],
  ["cfb-game-2025-cfp-title", "2025 CFP National Championship — Ohio State vs Notre Dame", 2024, "B"],
] as const;

const cfbRecords = cfbSeeds.map(([
  id, name, position, school, tier, basis = "first-team-all-america", provider = "sports-reference",
]): FootballRecognitionEvidenceRecord => ({
  id,
  name,
  kind: "player-career",
  league: "CFB",
  position,
  school,
  tier,
  basis,
  sourceProvider: provider,
  sourceId: `${provider}:${id}`,
  corroboratingSourceProviders: provider === "official-cfb-awards"
    ? ["sports-reference"]
    : ["ncaafb", "official-cfb-awards"].filter((candidate) => candidate !== provider) as FootballSourceProviderId[],
}));

const nflRecords = nflSeeds.map(([id, name, position, tier]): FootballRecognitionEvidenceRecord => ({
  id,
  name,
  kind: "player-career",
  league: "NFL",
  position,
  tier,
  basis: "major-award-or-hall-of-fame",
  sourceProvider: "nfl-honors",
  sourceId: `nfl-honors:${id}`,
  corroboratingSourceProviders: ["sports-reference"],
}));

const coachRecords = coachSeeds.map(([id, name, league, tier]): FootballRecognitionEvidenceRecord => ({
  id,
  name,
  kind: "coach",
  league,
  tier,
  basis: "reviewed-national-recognition",
  sourceProvider: "sports-reference",
  sourceId: `sports-reference:${id}`,
  corroboratingSourceProviders: league === "CFB" ? ["official-cfb-awards"] : ["nfl-honors"],
}));

const eraRecords = eraSeeds.map(([id, name, startSeason, endSeason, tier, franchises]): FootballRecognitionEvidenceRecord => ({
  id,
  name,
  kind: "era",
  league: "NFL",
  franchises,
  startSeason,
  endSeason,
  activeDecades: Array.from(
    { length: Math.floor(endSeason / 10) - Math.floor(startSeason / 10) + 1 },
    (_, index) => (Math.floor(startSeason / 10) + index) * 10,
  ),
  tier,
  basis: "reviewed-national-recognition",
  sourceProvider: "nfl-honors",
  sourceId: `nfl-honors:${id}`,
  corroboratingSourceProviders: ["sports-reference"],
}));

const gameRecords = gameSeeds.map(([id, name, season, tier]): FootballRecognitionEvidenceRecord => ({
  id,
  name,
  kind: "game",
  league: "CFB",
  season,
  startSeason: season,
  endSeason: season,
  activeDecades: [Math.floor(season / 10) * 10],
  tier,
  basis: "notable-game",
  sourceProvider: "octagon-hq",
  sourceId: id,
  corroboratingSourceProviders: ["sports-reference"],
}));

/**
 * Recognition evidence supplements, but never replaces, the large production projection. These rows answer only
 * "is this identity recognizable enough for A-C?" and deliberately contain no objective game statistics.
 * The historical All-America archive is a pinned CC0 discovery source; Sports-Reference, official award/HOF records,
 * and NFL honor/HOF records independently cross-check recognition so no production feed or single recognition list
 * becomes the product's sole recognizability authority.
 */
export const footballRecognitionEvidenceRecords: readonly FootballRecognitionEvidenceRecord[] = [
  ...cfbRecords,
  ...nflRecords,
  ...coachRecords,
  ...eraRecords,
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
  if (subject.school) {
    const sameSchool = matches.filter((record) => record.school === subject.school);
    if (sameSchool.length === 1) return sameSchool[0]!;
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
  franchises: record.franchises,
  season: record.season,
  startSeason: record.startSeason,
  endSeason: record.endSeason,
  activeDecades: record.activeDecades,
  aliases: record.aliases,
}));

export const FOOTBALL_STAGE12_RECOGNITION_EVIDENCE_SOURCE = {
  provider: "ncaafb" as const,
  repository: "lebebr01/ncaafb",
  commit: "21f8bf9070e95e6aa561d7b6d7d4a1c956f4cfd8",
  path: "data-raw/allAmericans.csv",
  license: "CC0",
  role: "historical recognition discovery only; never a factual-stat authority",
} as const;

export const FOOTBALL_STAGE12_RECOGNITION_EVIDENCE_SOURCES = [
  FOOTBALL_STAGE12_RECOGNITION_EVIDENCE_SOURCE,
  {
    provider: "sports-reference" as const,
    reference: "College Football at Sports-Reference consensus All-America and awards indexes",
    role: "independent recognition cross-check; no runtime fetch and no copied objective stats",
  },
  {
    provider: "official-cfb-awards" as const,
    reference: "NCAA/NFF/Heisman/FWAA and official major position-award archives",
    role: "major-award, Hall-of-Fame and national-honor recognition evidence",
  },
  {
    provider: "nfl-honors" as const,
    reference: "Pro Football Hall of Fame plus official/AP NFL honor records",
    role: "NFL All-Pro/Hall-of-Fame/major-honor recognition evidence",
  },
] as const;
