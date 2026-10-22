import type { FamilyFeudEntity, FamilyFeudEntityKind, FamilyFeudPack, FamilyFeudQuestion } from "../games/familyFeudEngine";
import { assertFamilyFeudPack, normalizeFamilyFeudInput } from "../games/familyFeudEngine";
import { NBA_SPORTS_FEUD_MAIN_ADDITIONS, NBA_SPORTS_FEUD_FAST_ADDITIONS } from "./nbaSportsFeudExpansion";

/**
 * NBA Sports Feud editorial bank, v1.
 *
 * NOT A SURVEY. Rankings are editorial estimates of general-fan recognition:
 * familiar stars / teams first, then less immediate but clearly correct answers.
 * The fixed HQ ladders preserve the Football/UFC Sports Feud scoring contract.
 *
 * Testing-bank editorial gate (Oct 2026):
 * - Fast Money asks questions an average NBA fan can immediately understand
 *   and answer without remembering a single Finals, exact roster year, or
 *   specialist statistical cutoff. No calendar-year/season clues in Fast Money.
 * - Eight ranked examples emphasize highly recognizable answers. Other
 *   defensible answers, spelling variants, and nicknames remain valid.
 * - Main rounds may include a smaller number of challenging topics.
 * - Rankings are editorial recognition judgments, never fabricated survey data.
 *
 * Objective award and championship claims use official NBA history pages:
 * nba.com/news/history-rookie-of-the-year-winners,
 * nba.com/news/history-nba-champions, nba.com/news/history-finals-mvp-winners,
 * and nba.com/news/history-mvp-award-winners.
 * Each question defines its own answer universe for collision-safe matching.
 *
 * Main boards show four correct guesses, not necessarily the four top ranks.
 * Any of the eight ranked answers can fill a slot; lower-ranked valid answers
 * are awarded 2 (main) or 1 (Fast Money) as off-board acceptance.
 */
type Authored = { id: string; category: string; prompt: string; kind: FamilyFeudEntityKind;
  answers: readonly string[]; extras: readonly string[] };

export const NBA_SPORTS_FEUD_BANK_VERSION = "nba-sports-feud-v2" as const;
export const NBA_SPORTS_FEUD_MAIN_POINTS = [10, 8, 7, 5, 5, 4, 4, 3] as const;
export const NBA_SPORTS_FEUD_FAST_POINTS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

const BANK: { main: Authored[]; fast: Authored[]; alias: Record<string, string[]> } =
{
  "main": [
    {
      "id": "fmvp",
      "category": "finals-mvp",
      "prompt": "Name an NBA player who has won Finals MVP.",
      "kind": "person",
      "answers": [
        "Michael Jordan",
        "LeBron James",
        "Kobe Bryant",
        "Stephen Curry",
        "Shaquille O'Neal",
        "Kevin Durant",
        "Tim Duncan",
        "Nikola Jokic"
      ],
      "extras": [
        "Giannis Antetokounmpo",
        "Kawhi Leonard",
        "Dirk Nowitzki",
        "Jaylen Brown",
        "Andre Iguodala",
        "Shai Gilgeous-Alexander",
        "Dwyane Wade",
        "Paul Pierce",
        "Magic Johnson",
        "Larry Bird",
        "Kareem Abdul-Jabbar",
        "James Worthy",
        "Hakeem Olajuwon",
        "Tony Parker",
        "Chauncey Billups",
        "Moses Malone",
        "Rick Barry",
        "Joe Dumars",
        "Isiah Thomas",
        "Willis Reed",
        "Bill Walton",
        "Jerry West",
        "John Havlicek",
        "Cedric Maxwell",
        "Dennis Johnson",
        "Jo Jo White",
        "Wes Unseld",
        "Jalen Brunson"
      ]
    },
    {
      "id": "champions",
      "category": "champion-franchises",
      "prompt": "Name an NBA team that has won an NBA championship.",
      "kind": "team",
      "answers": [
        "Los Angeles Lakers",
        "Golden State Warriors",
        "Boston Celtics",
        "Chicago Bulls",
        "San Antonio Spurs",
        "Miami Heat",
        "Cleveland Cavaliers",
        "Dallas Mavericks"
      ],
      "extras": [
        "Milwaukee Bucks",
        "Toronto Raptors",
        "Detroit Pistons",
        "Oklahoma City Thunder",
        "Houston Rockets",
        "Denver Nuggets",
        "Philadelphia 76ers",
        "New York Knicks",
        "Portland Trail Blazers",
        "Sacramento Kings",
        "Atlanta Hawks",
        "Washington Wizards"
      ]
    },
    {
      "id": "mvp",
      "category": "mvp-winners",
      "prompt": "Name an NBA player who has won regular-season MVP.",
      "kind": "person",
      "answers": [
        "Michael Jordan",
        "LeBron James",
        "Stephen Curry",
        "Nikola Jokic",
        "Giannis Antetokounmpo",
        "Kobe Bryant",
        "Kevin Durant",
        "Shaquille O'Neal"
      ],
      "extras": [
        "James Harden",
        "Russell Westbrook",
        "Derrick Rose",
        "Joel Embiid",
        "Shai Gilgeous-Alexander",
        "Tim Duncan",
        "Magic Johnson",
        "Larry Bird",
        "Kareem Abdul-Jabbar",
        "Charles Barkley",
        "Dirk Nowitzki",
        "Steve Nash",
        "Allen Iverson",
        "Kevin Garnett",
        "Karl Malone",
        "Wilt Chamberlain",
        "Bill Russell",
        "Moses Malone"
      ]
    },
    {
      "id": "paris24",
      "category": "clippers-stars",
      "prompt": "Name a well-known NBA player who has played for the LA Clippers.",
      "kind": "person",
      "answers": [
        "Kawhi Leonard",
        "Blake Griffin",
        "Chris Paul",
        "James Harden",
        "Paul George",
        "DeAndre Jordan",
        "Lou Williams",
        "Norman Powell"
      ],
      "extras": [
        "Russell Westbrook",
        "Jamal Crawford",
        "JJ Redick",
        "Elton Brand",
        "Baron Davis",
        "Eric Gordon",
        "Shai Gilgeous-Alexander",
        "Ivica Zubac",
        "Bob McAdoo",
        "Terance Mann",
        "Reggie Jackson",
        "John Wall",
        "Marcus Morris Sr."
      ]
    },
    {
      "id": "finalists",
      "category": "finalists",
      "prompt": "Name an NBA team that has reached the Finals since 2000.",
      "kind": "team",
      "answers": [
        "Golden State Warriors",
        "Cleveland Cavaliers",
        "Boston Celtics",
        "Los Angeles Lakers",
        "Miami Heat",
        "Denver Nuggets",
        "Dallas Mavericks",
        "Toronto Raptors"
      ],
      "extras": [
        "Milwaukee Bucks",
        "Phoenix Suns",
        "Oklahoma City Thunder",
        "Indiana Pacers",
        "San Antonio Spurs",
        "Philadelphia 76ers",
        "Detroit Pistons",
        "Orlando Magic",
        "New York Knicks"
      ]
    },
    {
      "id": "seventy",
      "category": "famous-scorers",
      "prompt": "Name a player who scored at least 70 points in a single NBA game.",
      "kind": "person",
      "answers": [
        "Wilt Chamberlain",
        "Kobe Bryant",
        "Luka Doncic",
        "Damian Lillard",
        "Joel Embiid",
        "Donovan Mitchell",
        "Devin Booker",
        "Bam Adebayo"
      ],
      "extras": [
        "Elgin Baylor",
        "David Robinson",
        "David Thompson"
      ]
    },
    {
      "id": "multi-mvp",
      "category": "mvp-winners",
      "prompt": "Name an NBA player who won the regular-season MVP award at least twice.",
      "kind": "person",
      "answers": [
        "Michael Jordan",
        "LeBron James",
        "Stephen Curry",
        "Giannis Antetokounmpo",
        "Nikola Jokic",
        "Tim Duncan",
        "Magic Johnson",
        "Larry Bird"
      ],
      "extras": [
        "Kareem Abdul-Jabbar",
        "Wilt Chamberlain",
        "Karl Malone",
        "Moses Malone",
        "Steve Nash",
        "Bill Russell",
        "Bob Pettit",
        "Shai Gilgeous-Alexander"
      ]
    },
    {
      "id": "dunk-winners",
      "category": "dunking",
      "prompt": "Name a player who won the NBA Slam Dunk Contest.",
      "kind": "person",
      "answers": [
        "Vince Carter",
        "Michael Jordan",
        "Kobe Bryant",
        "Zach LaVine",
        "Blake Griffin",
        "Nate Robinson",
        "Dwight Howard",
        "Mac McClung"
      ],
      "extras": [
        "Dominique Wilkins",
        "Jason Richardson",
        "Spud Webb",
        "Keshad Johnson",
        "Obi Toppin",
        "Anfernee Simons",
        "Derrick Jones Jr.",
        "Hamidou Diallo",
        "Donovan Mitchell",
        "Glenn Robinson III",
        "John Wall",
        "Terrence Ross",
        "Jeremy Evans",
        "Gerald Green",
        "Josh Smith",
        "Fred Jones",
        "Desmond Mason",
        "Brent Barry",
        "Harold Miner",
        "Isaiah Rider",
        "Cedric Ceballos",
        "Dee Brown",
        "Kenny Walker",
        "Larry Nance"
      ]
    },
    {
      "id": "london12",
      "category": "magic-stars",
      "prompt": "Name a well-known player who has played for the Orlando Magic.",
      "kind": "person",
      "answers": [
        "Shaquille O'Neal",
        "Dwight Howard",
        "Tracy McGrady",
        "Penny Hardaway",
        "Paolo Banchero",
        "Franz Wagner",
        "Jalen Suggs",
        "Vince Carter"
      ],
      "extras": [
        "Nikola Vucevic",
        "Rashard Lewis",
        "Hedo Turkoglu",
        "Aaron Gordon",
        "Grant Hill",
        "Jameer Nelson",
        "Dennis Scott",
        "Evan Fournier"
      ]
    },
    {
      "id": "dream92",
      "category": "dream-team-1992",
      "prompt": "Name a member of the USA men's 1992 Olympic Dream Team.",
      "kind": "person",
      "answers": [
        "Michael Jordan",
        "Magic Johnson",
        "Larry Bird",
        "Charles Barkley",
        "Scottie Pippen",
        "Karl Malone",
        "John Stockton",
        "Patrick Ewing"
      ],
      "extras": [
        "David Robinson",
        "Chris Mullin",
        "Clyde Drexler",
        "Christian Laettner"
      ]
    },
    {
      "id": "dpoy",
      "category": "defensive-awards",
      "prompt": "Name a player who won NBA Defensive Player of the Year.",
      "kind": "person",
      "answers": [
        "Rudy Gobert",
        "Kawhi Leonard",
        "Draymond Green",
        "Giannis Antetokounmpo",
        "Dwight Howard",
        "Ben Wallace",
        "Dikembe Mutombo",
        "Hakeem Olajuwon"
      ],
      "extras": [
        "Marc Gasol",
        "Joakim Noah",
        "Tyson Chandler",
        "Kevin Garnett",
        "David Robinson",
        "Victor Wembanyama",
        "Evan Mobley",
        "Jaren Jackson Jr.",
        "Marcus Smart",
        "Gary Payton",
        "Dennis Rodman",
        "Michael Jordan",
        "Alonzo Mourning",
        "Metta World Peace",
        "Marcus Camby",
        "Mark Eaton",
        "Michael Cooper",
        "Alvin Robertson",
        "Sidney Moncrief"
      ]
    },
    {
      "id": "bulls-stars",
      "category": "bulls-players",
      "prompt": "Name a player who made an NBA All-Star team while playing for the Chicago Bulls.",
      "kind": "person",
      "answers": [
        "Michael Jordan",
        "Scottie Pippen",
        "Derrick Rose",
        "Jimmy Butler",
        "Joakim Noah",
        "DeMar DeRozan",
        "Zach LaVine",
        "Pau Gasol"
      ],
      "extras": [
        "Luol Deng",
        "Artis Gilmore",
        "Horace Grant"
      ]
    },
    {
      "id": "lakers-champs",
      "category": "lakers-players",
      "prompt": "Name a player who won an NBA championship with the Lakers.",
      "kind": "person",
      "answers": [
        "Kobe Bryant",
        "LeBron James",
        "Shaquille O'Neal",
        "Magic Johnson",
        "Kareem Abdul-Jabbar",
        "Pau Gasol",
        "Anthony Davis",
        "James Worthy"
      ],
      "extras": [
        "Derek Fisher",
        "Robert Horry",
        "Rick Fox",
        "Lamar Odom",
        "Wilt Chamberlain",
        "Jerry West",
        "Rajon Rondo",
        "Dwight Howard",
        "Alex Caruso"
      ]
    },
    {
      "id": "warriors-champs",
      "category": "warriors-players",
      "prompt": "Name a player who won an NBA title with Golden State from 2015 through 2022.",
      "kind": "person",
      "answers": [
        "Stephen Curry",
        "Klay Thompson",
        "Draymond Green",
        "Kevin Durant",
        "Andre Iguodala",
        "Andrew Wiggins",
        "Jordan Poole",
        "Kevon Looney"
      ],
      "extras": [
        "Shaun Livingston",
        "Harrison Barnes",
        "Andrew Bogut",
        "JaVale McGee",
        "Gary Payton II"
      ]
    },
    {
      "id": "spurs-champs",
      "category": "spurs-players",
      "prompt": "Name a player who won an NBA title with the Spurs between 1999 and 2014.",
      "kind": "person",
      "answers": [
        "Tim Duncan",
        "Manu Ginobili",
        "Tony Parker",
        "David Robinson",
        "Kawhi Leonard",
        "Boris Diaw",
        "Patty Mills",
        "Danny Green"
      ],
      "extras": [
        "Bruce Bowen",
        "Robert Horry",
        "Tiago Splitter"
      ]
    },
    {
      "id": "three-point-contest",
      "category": "three-point-shooting",
      "prompt": "Name a player who has won the NBA Three-Point Contest.",
      "kind": "person",
      "answers": [
        "Stephen Curry",
        "Klay Thompson",
        "Damian Lillard",
        "Buddy Hield",
        "Kyrie Irving",
        "Larry Bird",
        "Ray Allen",
        "Craig Hodges"
      ],
      "extras": [
        "Devin Booker",
        "Karl-Anthony Towns",
        "Dirk Nowitzki",
        "Kevin Love",
        "Paul Pierce",
        "Eric Gordon",
        "Tyler Herro",
        "Joe Harris",
        "Peja Stojakovic",
        "Kyle Korver",
        "Steve Kerr",
        "Marco Belinelli",
        "Jason Kapono",
        "Quentin Richardson",
        "James Jones",
        "Glen Rice"
      ]
    }
  ],
  "fast": [
    {
      "id": "lakers-legends",
      "category": "lakers-players",
      "prompt": "Name a Lakers legend.",
      "kind": "person",
      "answers": [
        "Kobe Bryant",
        "Magic Johnson",
        "LeBron James",
        "Shaquille O'Neal",
        "Kareem Abdul-Jabbar",
        "Jerry West",
        "James Worthy",
        "Pau Gasol"
      ],
      "extras": [
        "Wilt Chamberlain",
        "Anthony Davis",
        "Lamar Odom"
      ]
    },
    {
      "id": "celtics-legends",
      "category": "celtics-legends",
      "prompt": "Name a Celtics legend.",
      "kind": "person",
      "answers": [
        "Larry Bird",
        "Bill Russell",
        "Jayson Tatum",
        "Paul Pierce",
        "Kevin Garnett",
        "Kevin McHale",
        "John Havlicek",
        "Bob Cousy"
      ],
      "extras": [
        "Sam Jones",
        "Jaylen Brown",
        "Ray Allen",
        "Rajon Rondo"
      ]
    },
    {
      "id": "shooters",
      "category": "three-point-shooting",
      "prompt": "Name an NBA player famous for shooting threes.",
      "kind": "person",
      "answers": [
        "Stephen Curry",
        "Klay Thompson",
        "Damian Lillard",
        "Ray Allen",
        "Reggie Miller",
        "James Harden",
        "Kyle Korver",
        "JJ Redick"
      ],
      "extras": [
        "Kevin Durant",
        "Trae Young",
        "Paul George",
        "Buddy Hield",
        "Devin Booker",
        "Tyler Herro",
        "Luka Doncic",
        "Jayson Tatum",
        "Desmond Bane",
        "Kon Knueppel",
        "Seth Curry"
      ]
    },
    {
      "id": "passers",
      "category": "passing",
      "prompt": "Name a player famous for great passing.",
      "kind": "person",
      "answers": [
        "Magic Johnson",
        "John Stockton",
        "Steve Nash",
        "Chris Paul",
        "LeBron James",
        "Nikola Jokic",
        "Luka Doncic",
        "Jason Kidd"
      ],
      "extras": [
        "Tyrese Haliburton",
        "Rajon Rondo",
        "Isiah Thomas"
      ]
    },
    {
      "id": "heat",
      "category": "heat-stars",
      "prompt": "Name an NBA player associated with the Miami Heat.",
      "kind": "person",
      "answers": [
        "Dwyane Wade",
        "LeBron James",
        "Jimmy Butler",
        "Shaquille O'Neal",
        "Chris Bosh",
        "Bam Adebayo",
        "Alonzo Mourning",
        "Tim Hardaway"
      ],
      "extras": [
        "Tyler Herro",
        "Goran Dragic",
        "Udonis Haslem"
      ]
    },
    {
      "id": "animals",
      "category": "animal-teams",
      "prompt": "Name an NBA franchise with an animal in its team name.",
      "kind": "team",
      "answers": [
        "Chicago Bulls",
        "Milwaukee Bucks",
        "Atlanta Hawks",
        "Minnesota Timberwolves",
        "Memphis Grizzlies",
        "Toronto Raptors",
        "New Orleans Pelicans",
        "Charlotte Hornets"
      ],
      "extras": []
    },
    {
      "id": "bigs",
      "category": "great-bigs",
      "prompt": "Name a famous NBA center or big man.",
      "kind": "person",
      "answers": [
        "Shaquille O'Neal",
        "Nikola Jokic",
        "Joel Embiid",
        "Kareem Abdul-Jabbar",
        "Tim Duncan",
        "Hakeem Olajuwon",
        "Wilt Chamberlain",
        "Patrick Ewing"
      ],
      "extras": [
        "David Robinson",
        "Dwight Howard",
        "Yao Ming",
        "Victor Wembanyama",
        "Anthony Davis",
        "Rudy Gobert",
        "Karl-Anthony Towns",
        "Ben Wallace",
        "Marc Gasol",
        "DeMarcus Cousins",
        "Brook Lopez",
        "Kristaps Porzingis"
      ]
    },
    {
      "id": "warriors",
      "category": "warriors-players",
      "prompt": "Name a star who played for the Golden State Warriors.",
      "kind": "person",
      "answers": [
        "Stephen Curry",
        "Klay Thompson",
        "Kevin Durant",
        "Draymond Green",
        "Chris Mullin",
        "Rick Barry",
        "Baron Davis",
        "Andrew Wiggins"
      ],
      "extras": [
        "Andre Iguodala",
        "Jordan Poole",
        "Latrell Sprewell"
      ]
    },
    {
      "id": "defenders",
      "category": "famous-defenders",
      "prompt": "Name an NBA player famous for defense.",
      "kind": "person",
      "answers": [
        "Dennis Rodman",
        "Kawhi Leonard",
        "Draymond Green",
        "Rudy Gobert",
        "Dikembe Mutombo",
        "Hakeem Olajuwon",
        "Ben Wallace",
        "Dwight Howard"
      ],
      "extras": [
        "Giannis Antetokounmpo",
        "Marcus Smart",
        "Jrue Holiday"
      ]
    },
    {
      "id": "knicks",
      "category": "knicks-stars",
      "prompt": "Name a star who played for the New York Knicks.",
      "kind": "person",
      "answers": [
        "Jalen Brunson",
        "Carmelo Anthony",
        "Patrick Ewing",
        "Walt Frazier",
        "Willis Reed",
        "Amar'e Stoudemire",
        "Bernard King",
        "Allan Houston"
      ],
      "extras": [
        "John Starks",
        "David Lee",
        "Kristaps Porzingis"
      ]
    },
    {
      "id": "clutch",
      "category": "clutch-shots",
      "prompt": "Name an NBA player remembered for a clutch playoff shot.",
      "kind": "person",
      "answers": [
        "Michael Jordan",
        "Kobe Bryant",
        "LeBron James",
        "Damian Lillard",
        "Kawhi Leonard",
        "Kyrie Irving",
        "Ray Allen",
        "Reggie Miller"
      ],
      "extras": [
        "Stephen Curry",
        "Robert Horry",
        "Derek Fisher"
      ]
    },
    {
      "id": "duke",
      "category": "bulls-players",
      "prompt": "Name a famous NBA player who played for the Chicago Bulls.",
      "kind": "person",
      "answers": [
        "Michael Jordan",
        "Scottie Pippen",
        "Derrick Rose",
        "Jimmy Butler",
        "Dennis Rodman",
        "DeMar DeRozan",
        "Zach LaVine",
        "Pau Gasol"
      ],
      "extras": [
        "Joakim Noah",
        "Artis Gilmore",
        "Horace Grant",
        "Alex Caruso",
        "Nikola Vucevic",
        "Luol Deng",
        "Dwyane Wade",
        "Rajon Rondo",
        "Ben Wallace",
        "Kirk Hinrich"
      ]
    },
    {
      "id": "top-picks",
      "category": "point-guards",
      "prompt": "Name a famous NBA point guard.",
      "kind": "person",
      "answers": [
        "Stephen Curry",
        "Magic Johnson",
        "Chris Paul",
        "Kyrie Irving",
        "Russell Westbrook",
        "Ja Morant",
        "Steve Nash",
        "John Stockton"
      ],
      "extras": [
        "Derrick Rose",
        "Tony Parker",
        "Jason Kidd",
        "Damian Lillard",
        "Isiah Thomas",
        "Tyrese Haliburton",
        "Jalen Brunson",
        "Trae Young",
        "LaMelo Ball",
        "De'Aaron Fox",
        "Kemba Walker",
        "Rajon Rondo",
        "Jamal Murray",
        "Shai Gilgeous-Alexander"
      ]
    },
    {
      "id": "nicknames",
      "category": "nba-nicknames",
      "prompt": "Name an NBA star with a well-known nickname.",
      "kind": "person",
      "answers": [
        "Michael Jordan",
        "Kobe Bryant",
        "LeBron James",
        "Shaquille O'Neal",
        "Stephen Curry",
        "Giannis Antetokounmpo",
        "Allen Iverson",
        "Kevin Durant"
      ],
      "extras": [
        "Nikola Jokic",
        "Paul Pierce",
        "Charles Barkley",
        "Dwyane Wade",
        "Wilt Chamberlain",
        "Julius Erving",
        "Magic Johnson",
        "Damian Lillard",
        "Kawhi Leonard",
        "Russell Westbrook",
        "Victor Wembanyama"
      ]
    },
    {
      "id": "scorers-2000s",
      "category": "famous-scorers",
      "prompt": "Name an NBA player famous for scoring a lot of points.",
      "kind": "person",
      "answers": [
        "LeBron James",
        "Michael Jordan",
        "Kobe Bryant",
        "Stephen Curry",
        "Kevin Durant",
        "Shaquille O'Neal",
        "Luka Doncic",
        "James Harden"
      ],
      "extras": [
        "Wilt Chamberlain",
        "Kareem Abdul-Jabbar",
        "Dirk Nowitzki",
        "Joel Embiid",
        "Devin Booker",
        "Nikola Jokic",
        "Dwyane Wade",
        "Damian Lillard",
        "Tracy McGrady",
        "Allen Iverson",
        "Carmelo Anthony",
        "Giannis Antetokounmpo",
        "Kyrie Irving",
        "Russell Westbrook",
        "Jayson Tatum",
        "Anthony Edwards",
        "Shai Gilgeous-Alexander",
        "Donovan Mitchell",
        "Paul George",
        "Karl-Anthony Towns"
      ]
    },
    {
      "id": "mavericks",
      "category": "mavericks-stars",
      "prompt": "Name a star who played for the Dallas Mavericks.",
      "kind": "person",
      "answers": [
        "Dirk Nowitzki",
        "Luka Doncic",
        "Kyrie Irving",
        "Jason Kidd",
        "Steve Nash",
        "Jason Terry",
        "Michael Finley",
        "Tyson Chandler"
      ],
      "extras": [
        "Mark Aguirre",
        "Rolando Blackman",
        "Jalen Brunson",
        "Kristaps Porzingis"
      ]
    },
    {
      "id": "sixers",
      "category": "sixers-stars",
      "prompt": "Name a star who played for the Philadelphia 76ers.",
      "kind": "person",
      "answers": [
        "Allen Iverson",
        "Joel Embiid",
        "Charles Barkley",
        "Julius Erving",
        "Wilt Chamberlain",
        "Moses Malone",
        "Tyrese Maxey",
        "Ben Simmons"
      ],
      "extras": [
        "Jimmy Butler",
        "Andre Iguodala"
      ]
    },
    {
      "id": "spurs",
      "category": "spurs-players",
      "prompt": "Name a star who played for the San Antonio Spurs.",
      "kind": "person",
      "answers": [
        "Tim Duncan",
        "Victor Wembanyama",
        "Kawhi Leonard",
        "Tony Parker",
        "Manu Ginobili",
        "David Robinson",
        "LaMarcus Aldridge",
        "Sean Elliott"
      ],
      "extras": [
        "George Gervin",
        "Boris Diaw",
        "Bruce Bowen"
      ]
    },
    {
      "id": "thunder",
      "category": "thunder-stars",
      "prompt": "Name a star who played for the Oklahoma City Thunder.",
      "kind": "person",
      "answers": [
        "Kevin Durant",
        "Russell Westbrook",
        "Shai Gilgeous-Alexander",
        "James Harden",
        "Paul George",
        "Chet Holmgren",
        "Serge Ibaka",
        "Jalen Williams"
      ],
      "extras": [
        "Chris Paul",
        "Steven Adams"
      ]
    },
    {
      "id": "sixth",
      "category": "lebron-teammates",
      "prompt": "Name an NBA player who has played alongside LeBron James.",
      "kind": "person",
      "answers": [
        "Dwyane Wade",
        "Anthony Davis",
        "Kyrie Irving",
        "Chris Bosh",
        "Kevin Love",
        "J.R. Smith",
        "Ray Allen",
        "Russell Westbrook"
      ],
      "extras": [
        "Tristan Thompson",
        "Alex Caruso",
        "Shaquille O'Neal",
        "Kyle Kuzma",
        "Rajon Rondo",
        "Dwight Howard",
        "Austin Reaves",
        "D'Angelo Russell",
        "Lonzo Ball",
        "Bronny James",
        "Shane Battier",
        "Udonis Haslem",
        "Carmelo Anthony",
        "Zydrunas Ilgauskas",
        "Mo Williams",
        "Jae Crowder",
        "Larry Hughes",
        "Mike Miller",
        "Mario Chalmers",
        "Jared Dudley"
      ]
    },
    {
      "id": "finals24",
      "category": "cavaliers-stars",
      "prompt": "Name a famous NBA player who has played for the Cleveland Cavaliers.",
      "kind": "person",
      "answers": [
        "LeBron James",
        "Kyrie Irving",
        "Donovan Mitchell",
        "Darius Garland",
        "Kevin Love",
        "Evan Mobley",
        "Jarrett Allen",
        "Tristan Thompson"
      ],
      "extras": [
        "J.R. Smith",
        "Shaquille O'Neal",
        "Dwyane Wade",
        "Andre Drummond",
        "Caris LeVert",
        "Larry Nance Jr.",
        "Iman Shumpert",
        "Matthew Dellavedova",
        "Mark Price",
        "Zydrunas Ilgauskas",
        "Anderson Varejao",
        "Isaiah Thomas",
        "Ricky Rubio",
        "Mo Williams",
        "Kyle Korver"
      ]
    },
    {
      "id": "finals23",
      "category": "nuggets-stars",
      "prompt": "Name a famous NBA player who has played for the Denver Nuggets.",
      "kind": "person",
      "answers": [
        "Nikola Jokic",
        "Jamal Murray",
        "Carmelo Anthony",
        "Aaron Gordon",
        "Michael Porter Jr.",
        "Allen Iverson",
        "Russell Westbrook",
        "DeAndre Jordan"
      ],
      "extras": [
        "Bruce Brown",
        "Kentavious Caldwell-Pope",
        "Ty Lawson",
        "Danilo Gallinari",
        "J.R. Smith",
        "Chauncey Billups",
        "Nene",
        "Andre Miller",
        "Kenneth Faried",
        "Christian Braun"
      ]
    },
    {
      "id": "bubble",
      "category": "raptors-stars",
      "prompt": "Name a famous NBA player who has played for the Toronto Raptors.",
      "kind": "person",
      "answers": [
        "Vince Carter",
        "Kawhi Leonard",
        "DeMar DeRozan",
        "Kyle Lowry",
        "Chris Bosh",
        "Pascal Siakam",
        "Scottie Barnes",
        "Fred VanVleet"
      ],
      "extras": [
        "Tracy McGrady",
        "Serge Ibaka",
        "OG Anunoby",
        "Marc Gasol",
        "Danny Green",
        "Jonas Valanciunas",
        "RJ Barrett",
        "Bruce Brown",
        "Immanuel Quickley",
        "Andrea Bargnani"
      ]
    },
    {
      "id": "allstar10",
      "category": "all-stars",
      "prompt": "Name a famous NBA All-Star.",
      "kind": "person",
      "answers": [
        "LeBron James",
        "Stephen Curry",
        "Michael Jordan",
        "Kobe Bryant",
        "Kevin Durant",
        "Giannis Antetokounmpo",
        "Shaquille O'Neal",
        "Jayson Tatum"
      ],
      "extras": [
        "Luka Doncic",
        "Nikola Jokic",
        "Anthony Edwards",
        "Shai Gilgeous-Alexander",
        "Kyrie Irving",
        "Damian Lillard",
        "Joel Embiid",
        "Devin Booker",
        "James Harden",
        "Chris Paul",
        "Dwyane Wade",
        "Carmelo Anthony",
        "Kareem Abdul-Jabbar",
        "Bill Russell",
        "Magic Johnson",
        "Larry Bird",
        "Charles Barkley",
        "Karl Malone",
        "John Stockton",
        "Kevin Garnett",
        "Allen Iverson",
        "Chris Bosh",
        "Paul Pierce",
        "Ray Allen",
        "Patrick Ewing",
        "David Robinson",
        "Hakeem Olajuwon",
        "Dirk Nowitzki",
        "Tim Duncan",
        "Russell Westbrook",
        "Jaylen Brown",
        "Jimmy Butler",
        "Kawhi Leonard",
        "Anthony Davis",
        "Paul George",
        "Donovan Mitchell",
        "Ja Morant",
        "Zion Williamson",
        "LaMelo Ball"
      ]
    },
    {
      "id": "cavs16",
      "category": "rockets-stars",
      "prompt": "Name an NBA star who has played for the Houston Rockets.",
      "kind": "person",
      "answers": [
        "James Harden",
        "Hakeem Olajuwon",
        "Yao Ming",
        "Chris Paul",
        "Tracy McGrady",
        "Russell Westbrook",
        "Dwight Howard",
        "Clyde Drexler"
      ],
      "extras": [
        "Charles Barkley",
        "Steve Francis",
        "Alperen Sengun",
        "Jalen Green",
        "Fred VanVleet",
        "Jabari Smith Jr.",
        "Moses Malone",
        "Ralph Sampson",
        "Jeremy Lin",
        "Dillon Brooks",
        "Carmelo Anthony"
      ]
    },
    {
      "id": "mavs11",
      "category": "suns-stars",
      "prompt": "Name an NBA star who has played for the Phoenix Suns.",
      "kind": "person",
      "answers": [
        "Devin Booker",
        "Kevin Durant",
        "Steve Nash",
        "Charles Barkley",
        "Chris Paul",
        "Amar'e Stoudemire",
        "Shaquille O'Neal",
        "Bradley Beal"
      ],
      "extras": [
        "Mikal Bridges",
        "Deandre Ayton",
        "Shawn Marion",
        "Goran Dragic",
        "Eric Bledsoe",
        "Grayson Allen",
        "Raja Bell",
        "Jusuf Nurkic",
        "Grant Hill"
      ]
    },
    {
      "id": "celtics08",
      "category": "bucks-stars",
      "prompt": "Name an NBA star who has played for the Milwaukee Bucks.",
      "kind": "person",
      "answers": [
        "Giannis Antetokounmpo",
        "Damian Lillard",
        "Khris Middleton",
        "Jrue Holiday",
        "Kareem Abdul-Jabbar",
        "Ray Allen",
        "Brook Lopez",
        "Michael Redd"
      ],
      "extras": [
        "Oscar Robertson",
        "Bobby Portis",
        "Malcolm Brogdon",
        "Eric Bledsoe",
        "Glenn Robinson",
        "Brandon Jennings",
        "Andrew Bogut",
        "Jabari Parker",
        "Terry Cummings"
      ]
    },
    {
      "id": "pistons04",
      "category": "pistons-stars",
      "prompt": "Name an NBA player associated with the Detroit Pistons.",
      "kind": "person",
      "answers": [
        "Cade Cunningham",
        "Isiah Thomas",
        "Ben Wallace",
        "Chauncey Billups",
        "Rasheed Wallace",
        "Richard Hamilton",
        "Grant Hill",
        "Joe Dumars"
      ],
      "extras": [
        "Blake Griffin",
        "Andre Drummond",
        "Tayshaun Prince",
        "Jaden Ivey",
        "Jalen Duren",
        "Dennis Rodman",
        "Jerry Stackhouse",
        "Kentavious Caldwell-Pope"
      ]
    },
    {
      "id": "dunkers",
      "category": "dunking",
      "prompt": "Name an NBA player known for spectacular dunks.",
      "kind": "person",
      "answers": [
        "Vince Carter",
        "Michael Jordan",
        "LeBron James",
        "Blake Griffin",
        "Ja Morant",
        "Zion Williamson",
        "Dominique Wilkins",
        "Aaron Gordon"
      ],
      "extras": [
        "Anthony Edwards",
        "Zach LaVine",
        "Kobe Bryant",
        "Shaquille O'Neal",
        "Dwight Howard",
        "Shawn Kemp",
        "Julius Erving",
        "Jason Richardson",
        "Russell Westbrook",
        "Mac McClung",
        "Derrick Jones Jr.",
        "Spud Webb"
      ]
    },
    {
      "id": "handles",
      "category": "ball-handlers",
      "prompt": "Name an NBA player famous for flashy ball-handling.",
      "kind": "person",
      "answers": [
        "Kyrie Irving",
        "Allen Iverson",
        "Stephen Curry",
        "Jamal Crawford",
        "Chris Paul",
        "Kemba Walker",
        "Jason Williams",
        "Tim Hardaway"
      ],
      "extras": [
        "Ja Morant",
        "Derrick Rose"
      ]
    },
    {
      "id": "coaches",
      "category": "head-coaches",
      "prompt": "Name a famous NBA head coach.",
      "kind": "person",
      "answers": [
        "Phil Jackson",
        "Steve Kerr",
        "Gregg Popovich",
        "Erik Spoelstra",
        "Doc Rivers",
        "Tyronn Lue",
        "Rick Carlisle",
        "Pat Riley"
      ],
      "extras": [
        "Nick Nurse",
        "Michael Malone",
        "Joe Mazzulla",
        "Ime Udoka",
        "Mike D'Antoni",
        "Larry Brown",
        "Red Auerbach",
        "Jason Kidd",
        "Mike Brown",
        "Tom Thibodeau",
        "Steve Nash",
        "Frank Vogel",
        "Billy Donovan",
        "Darvin Ham"
      ]
    },
    {
      "id": "rookies",
      "category": "rookie-of-the-year",
      "prompt": "Name an NBA player who won Rookie of the Year.",
      "kind": "person",
      "answers": [
        "LeBron James",
        "Michael Jordan",
        "Victor Wembanyama",
        "Luka Doncic",
        "Kyrie Irving",
        "Kevin Durant",
        "Derrick Rose",
        "Allen Iverson"
      ],
      "extras": [
        "Ja Morant",
        "LaMelo Ball",
        "Paolo Banchero",
        "Scottie Barnes",
        "Ben Simmons",
        "Stephon Castle",
        "Shaquille O'Neal",
        "Tim Duncan",
        "Chris Paul",
        "Damian Lillard",
        "Karl-Anthony Towns",
        "Blake Griffin",
        "Vince Carter",
        "Chris Webber",
        "Tyreke Evans",
        "Brandon Roy",
        "Cooper Flagg"
      ]
    }
  ],
  "alias": {
    "Bam Adebayo": ["Bam"],
    "Los Angeles Clippers": ["Clippers","LA Clippers","LAC"],
    "Brooklyn Nets": ["Nets","BKN"],
    "Sacramento Kings": ["Kings"],
    "Utah Jazz": ["Jazz"],
    "Washington Wizards": ["Wizards"],
    "Orlando Magic": ["Magic"],
    "Portland Trail Blazers": ["Blazers","Trail Blazers"],
    "Seattle SuperSonics": ["Sonics","Supersonics","Seattle Sonics"],
    "Houston Rockets": ["Rockets"],
    "Cooper Flagg": ["Flagg"],
    "Bronny James": ["Bronny"],
    "Anthony Edwards": ["Ant-Man","Ant Man"],
    "Karl-Anthony Towns": ["KAT","Karl Anthony Towns"],
    "De'Aaron Fox": ["Deaaron Fox"],
    "Jaren Jackson Jr.": ["JJJ"],
    "Klay Thompson": ["Klay"],
    "Paolo Banchero": ["Paolo"],
    "Nickeil Alexander-Walker": ["NAW"],
    "J.J. Redick": ["JJ Redick"],
    "LeBron James": [
      "LeBron",
      "King James"
    ],
    "Stephen Curry": [
      "Steph Curry",
      "Steph",
      "Chef Curry"
    ],
    "Kevin Durant": [
      "KD",
      "Slim Reaper",
      "Durantula"
    ],
    "Nikola Jokic": [
      "Jokic",
      "Joker"
    ],
    "Giannis Antetokounmpo": [
      "Giannis",
      "Greek Freak",
      "Antetokounmpo"
    ],
    "Kawhi Leonard": [
      "Kawhi",
      "The Klaw"
    ],
    "Dirk Nowitzki": [
      "Dirk"
    ],
    "Jaylen Brown": [
      "JB"
    ],
    "Shai Gilgeous-Alexander": [
      "SGA",
      "Shai"
    ],
    "Shaquille O'Neal": [
      "Shaq",
      "Shaq Diesel"
    ],
    "Dwyane Wade": [
      "D Wade",
      "D-Wade",
      "Wade"
    ],
    "Kobe Bryant": [
      "Kobe",
      "Black Mamba"
    ],
    "Michael Jordan": [
      "MJ",
      "Air Jordan"
    ],
    "Anthony Davis": [
      "AD",
      "The Brow"
    ],
    "Damian Lillard": [
      "Dame",
      "Dame Time"
    ],
    "Allen Iverson": [
      "AI",
      "The Answer"
    ],
    "Jayson Tatum": [
      "JT"
    ],
    "Russell Westbrook": [
      "Russ",
      "Brodie"
    ],
    "Carmelo Anthony": [
      "Melo"
    ],
    "James Harden": [
      "The Beard"
    ],
    "Jalen Brunson": [
      "Brunson"
    ],
    "Luka Doncic": [
      "Luka"
    ],
    "Victor Wembanyama": [
      "Wemby"
    ],
    "Jrue Holiday": [
      "Jrue"
    ],
    "Derrick Rose": [
      "D Rose"
    ],
    "Chris Paul": [
      "CP3",
      "CP"
    ],
    "Tracy McGrady": [
      "T Mac",
      "T-Mac"
    ],
    "Julius Erving": [
      "Dr J",
      "Dr. J"
    ],
    "J.R. Smith": [
      "JR Smith"
    ],
    "J.J. Barea": [
      "JJ Barea"
    ],
    "JJ Redick": [
      "JJ Reddick",
      "J. J. Redick"
    ],
    "Dereck Lively II": [
      "Dereck Lively",
      "Lively"
    ],
    "Kristaps Porzingis": [
      "Porzingis",
      "KP"
    ],
    "Tim Hardaway": [
      "Tim Hardaway Sr",
      "Tim Hardaway Sr."
    ],
    "Wilt Chamberlain": [
      "Wilt"
    ],
    "Magic Johnson": [
      "Magic"
    ],
    "Kareem Abdul-Jabbar": [
      "Kareem"
    ],
    "Hakeem Olajuwon": [
      "Hakeem"
    ],
    "Los Angeles Lakers": [
      "Lakers",
      "LA Lakers",
      "L.A. Lakers"
    ],
    "Golden State Warriors": [
      "Warriors",
      "Dubs",
      "GSW"
    ],
    "Boston Celtics": [
      "Celtics"
    ],
    "San Antonio Spurs": [
      "Spurs"
    ],
    "Miami Heat": [
      "Heat"
    ],
    "Cleveland Cavaliers": [
      "Cavaliers",
      "Cavs"
    ],
    "Dallas Mavericks": [
      "Mavericks",
      "Mavs"
    ],
    "Denver Nuggets": [
      "Nuggets"
    ],
    "Milwaukee Bucks": [
      "Bucks"
    ],
    "Toronto Raptors": [
      "Raptors"
    ],
    "Detroit Pistons": [
      "Pistons"
    ],
    "Oklahoma City Thunder": [
      "Thunder",
      "OKC"
    ],
    "Phoenix Suns": [
      "Suns"
    ],
    "Indiana Pacers": [
      "Pacers"
    ],
    "Chicago Bulls": [
      "Bulls"
    ],
    "Atlanta Hawks": [
      "Hawks"
    ],
    "Minnesota Timberwolves": [
      "Timberwolves",
      "Wolves"
    ],
    "Memphis Grizzlies": [
      "Grizzlies"
    ],
    "New Orleans Pelicans": [
      "Pelicans"
    ],
    "Charlotte Hornets": [
      "Hornets"
    ],
    "New York Knicks": [
      "Knicks"
    ],
    "Philadelphia 76ers": [
      "76ers",
      "Sixers",
      "Philly"
    ],
    "Metta World Peace": [
      "Ron Artest",
      "Metta"
    ],
    "Isaiah Rider": [
      "J.R. Rider",
      "JR Rider",
      "Isiah Rider"
    ],
    "Penny Hardaway": [
      "Anfernee Hardaway",
      "Penny"
    ],
    "Anderson Varejao": [
      "Anderson Varejão",
      "Varejao"
    ],
    "Amar'e Stoudemire": [
      "Amare Stoudemire",
      "STAT"
    ],
    "Alperen Sengun": [
      "Alperen Şengün",
      "Sengun"
    ],
    "Nene": [
      "Nenê",
      "Nene Hilario"
    ],
    "Tyronn Lue": [
      "Ty Lue"
    ],
    "Isiah Thomas": [
      "Zeke"
    ],
    "Mike D'Antoni": [
      "Mike Dantoni"
    ]
  }
};

// Keep tested questions, supplement only with editorially approved additions.
BANK.main.push(...NBA_SPORTS_FEUD_MAIN_ADDITIONS);
BANK.fast.push(...NBA_SPORTS_FEUD_FAST_ADDITIONS);

export const NBA_SPORTS_FEUD_MAIN = BANK.main;
export const NBA_SPORTS_FEUD_FAST = BANK.fast;

function hash(value: string) {
  let h = 2166136261;
  for (const char of value) { h ^= char.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/** Near-identical prompts must not coexist in a seven-question run. */
function editorialLane(category: string) {
  if (/(?:-stars|-players|-legends|-champs)$/.test(category) ||
      category === "lebron-teammates" || category === "clippers-stars") return "franchise-associations";
  if (["champion-franchises","finalists","conference-teams","animal-teams"].includes(category)) return "team-facts";
  if (["finals-mvp","mvp-winners","defensive-awards","rookie-of-the-year","sixth-man-award",
    "most-improved","coach-awards","all-stars","dunk-winners","three-point-contest"].includes(category)) return "awards";
  if (["nba-eras","olympic-rosters","college-nba-stars","family-connections","draft-history",
    "unusual-size"].includes(category)) return category;
  // Closely related skills may be included only once across the playthrough.
  if (["passing","ball-handlers","triple-doubles","clutch-shots","signature-moves"].includes(category)) return "playmaking-style";
  if (["dunking","post-scoring","famous-scorers","midrange-shooting","three-point-shooting"].includes(category)) return "scoring-style";
  if (["rebounding","shot-blockers","famous-defenders","hustle-players"].includes(category)) return "defense-and-boards";
  return category;
}

function seededShuffle<T>(values: readonly T[], seed: number): T[] {
  const array = [...values];
  let state = seed || 0x6d2b79f5;
  for (let i = array.length - 1; i > 0; i--) {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    const j = (state >>> 0) % (i + 1);
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
  return array;
}

function pickQuestions(seed: string) {
  const seenCategories = new Set<string>();
  const seenLanes = new Set<string>();
  function choose(pool: readonly Authored[], count: number, salt: string) {
    const selected: Authored[] = [];
    for (const question of seededShuffle(pool, hash(seed + salt))) {
      const lane = editorialLane(question.category);
      if (seenCategories.has(question.category) || seenLanes.has(lane)) continue;
      selected.push(question);
      seenCategories.add(question.category);
      seenLanes.add(lane);
      if (selected.length === count) break;
    }
    if (selected.length !== count) throw new Error("NBA Sports Feud: insufficient distinct editorial topics.");
    return selected;
  }
  return { main: choose(BANK.main, 2, "|main"),
    fast: choose(BANK.fast, 5, "|fast") };
}

function makeQuestion(authored: Authored, ladder: readonly number[], entities: FamilyFeudEntity[]): FamilyFeudQuestion {
  const namespace = "nba-feud-" + authored.id;
  const names = [...authored.answers, ...authored.extras];
  const normalized = names.map(normalizeFamilyFeudInput);
  if (authored.answers.length !== 8 || new Set(normalized).size !== names.length)
    throw new Error(namespace + ": 8 unique ranked answers and distinct extras required.");
  const ids = names.map((name, index) => {
    const id = namespace + ":" + (index < 8 ? "a" : "v") + (index + 1);
    entities.push({ id, displayName: name, kind: authored.kind,
      aliases: BANK.alias[name] ?? [] });
    return id;
  });
  return { id: namespace, prompt: authored.prompt, candidateIds: ids,
    answers: ids.slice(0, 8).map((entityId, index) => ({ entityId, points: ladder[index]! })),
    alsoAcceptedEntityIds: ids.slice(8) };
}

/** Stable daily seed or caller-generated casual seed; no server writes. */
export function buildNbaSportsFeudPack(seed: string): FamilyFeudPack {
  const selected = pickQuestions(seed);
  const entities: FamilyFeudEntity[] = [];
  const pack: FamilyFeudPack = {
    id: NBA_SPORTS_FEUD_BANK_VERSION + ":" + seed,
    sport: "nba",
    entities,
    mainBoards: selected.main.map(q => makeQuestion(q, NBA_SPORTS_FEUD_MAIN_POINTS, entities)),
    fastMoney: selected.fast.map(q => makeQuestion(q, NBA_SPORTS_FEUD_FAST_POINTS, entities)),
  };
  assertFamilyFeudPack(pack);
  return pack;
}
