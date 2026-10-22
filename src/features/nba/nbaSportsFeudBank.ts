import type { FamilyFeudEntity, FamilyFeudEntityKind, FamilyFeudPack, FamilyFeudQuestion } from "../games/familyFeudEngine";
import { assertFamilyFeudPack, normalizeFamilyFeudInput } from "../games/familyFeudEngine";

/**
 * NBA Sports Feud editorial bank, v1.
 *
 * NOT A SURVEY. Rankings are editorial estimates of general-fan recognition:
 * familiar stars / teams first, then less immediate but clearly correct answers.
 * The fixed HQ ladders preserve the Football/UFC Sports Feud scoring contract.
 *
 * Objective award, roster, and championship claims have been checked against
 * NBA history pages: nba.com/news/history-nba-champions,
 * nba.com/news/history-finals-mvp-winners, and
 * nba.com/news/history-mvp-award-winners. Each question defines its own
 * answer universe to avoid cross-question identity collisions.
 *
 * Main boards show four correct guesses, not necessarily the four top ranks.
 * Any of the eight ranked answers can fill a slot; lower-ranked valid answers
 * are awarded 2 (main) or 1 (Fast Money) as off-board acceptance.
 */
type Authored = { id: string; category: string; prompt: string; kind: FamilyFeudEntityKind;
  answers: readonly string[]; extras: readonly string[] };

export const NBA_SPORTS_FEUD_BANK_VERSION = "nba-sports-feud-v1" as const;
export const NBA_SPORTS_FEUD_MAIN_POINTS = [10, 8, 7, 5, 5, 4, 4, 3] as const;
export const NBA_SPORTS_FEUD_FAST_POINTS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

const BANK: { main: Authored[]; fast: Authored[]; alias: Record<string, string[]> } =
{
  "main": [
    {
      "id": "fmvp",
      "category": "finals-mvp",
      "prompt": "Name a player who won NBA Finals MVP from 2011 through 2025.",
      "kind": "person",
      "answers": [
        "LeBron James",
        "Stephen Curry",
        "Kevin Durant",
        "Nikola Jokic",
        "Giannis Antetokounmpo",
        "Kawhi Leonard",
        "Dirk Nowitzki",
        "Jaylen Brown"
      ],
      "extras": [
        "Andre Iguodala",
        "Shai Gilgeous-Alexander"
      ]
    },
    {
      "id": "champions",
      "category": "champion-franchises",
      "prompt": "Name an NBA team that won a championship from 2000 through 2025.",
      "kind": "team",
      "answers": [
        "Los Angeles Lakers",
        "Golden State Warriors",
        "Boston Celtics",
        "San Antonio Spurs",
        "Miami Heat",
        "Cleveland Cavaliers",
        "Dallas Mavericks",
        "Denver Nuggets"
      ],
      "extras": [
        "Milwaukee Bucks",
        "Toronto Raptors",
        "Detroit Pistons",
        "Oklahoma City Thunder"
      ]
    },
    {
      "id": "mvp",
      "category": "regular-season-mvp",
      "prompt": "Name an NBA regular-season MVP winner from 2010 through 2025.",
      "kind": "person",
      "answers": [
        "LeBron James",
        "Stephen Curry",
        "Nikola Jokic",
        "Giannis Antetokounmpo",
        "Kevin Durant",
        "James Harden",
        "Russell Westbrook",
        "Derrick Rose"
      ],
      "extras": [
        "Joel Embiid",
        "Shai Gilgeous-Alexander"
      ]
    },
    {
      "id": "paris24",
      "category": "usa-2024",
      "prompt": "Name a player on the USA men's basketball team at the 2024 Paris Olympics.",
      "kind": "person",
      "answers": [
        "LeBron James",
        "Stephen Curry",
        "Kevin Durant",
        "Jayson Tatum",
        "Joel Embiid",
        "Anthony Edwards",
        "Anthony Davis",
        "Devin Booker"
      ],
      "extras": [
        "Jrue Holiday",
        "Bam Adebayo",
        "Derrick White",
        "Tyrese Haliburton"
      ]
    },
    {
      "id": "finalists",
      "category": "finalists",
      "prompt": "Name an NBA team that reached the Finals between 2015 and 2025.",
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
        "Indiana Pacers"
      ]
    },
    {
      "id": "seventy",
      "category": "seventy-point-games",
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
        "David Thompson"
      ],
      "extras": [
        "Elgin Baylor"
      ]
    },
    {
      "id": "multi-mvp",
      "category": "multiple-mvps",
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
        "Bob Pettit"
      ]
    },
    {
      "id": "dunk-winners",
      "category": "dunk-contest",
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
        "Spud Webb"
      ]
    },
    {
      "id": "london12",
      "category": "usa-2012",
      "prompt": "Name a player on the USA men's basketball team at the 2012 London Olympics.",
      "kind": "person",
      "answers": [
        "LeBron James",
        "Kobe Bryant",
        "Kevin Durant",
        "Carmelo Anthony",
        "Chris Paul",
        "Russell Westbrook",
        "James Harden",
        "Anthony Davis"
      ],
      "extras": [
        "Kevin Love",
        "Deron Williams",
        "Tyson Chandler",
        "Andre Iguodala"
      ]
    },
    {
      "id": "nba75",
      "category": "nba-75",
      "prompt": "Name a player selected for the NBA's 75th Anniversary Team.",
      "kind": "person",
      "answers": [
        "Michael Jordan",
        "Kobe Bryant",
        "LeBron James",
        "Stephen Curry",
        "Shaquille O'Neal",
        "Tim Duncan",
        "Larry Bird",
        "Magic Johnson"
      ],
      "extras": [
        "Kevin Durant",
        "Dwyane Wade",
        "Dirk Nowitzki",
        "Allen Iverson",
        "Kareem Abdul-Jabbar",
        "Charles Barkley"
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
        "David Robinson"
      ]
    },
    {
      "id": "bulls-stars",
      "category": "bulls-allstars",
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
      "category": "lakers-champions",
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
        "Lamar Odom"
      ]
    },
    {
      "id": "warriors-champs",
      "category": "warriors-champions",
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
      "category": "spurs-champions",
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
      "category": "three-point-winners",
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
        "Eric Gordon"
      ]
    }
  ],
  "fast": [
    {
      "id": "lakers-legends",
      "category": "lakers-legends",
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
      "category": "three-point-shooters",
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
        "Paul George"
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
      "prompt": "Name an NBA star associated with the Miami Heat.",
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
        "Yao Ming"
      ]
    },
    {
      "id": "warriors",
      "category": "warriors-stars",
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
      "category": "duke-stars",
      "prompt": "Name an NBA player who also played college basketball at Duke.",
      "kind": "person",
      "answers": [
        "Kyrie Irving",
        "Jayson Tatum",
        "Zion Williamson",
        "Paolo Banchero",
        "Brandon Ingram",
        "Grant Hill",
        "JJ Redick",
        "Cooper Flagg"
      ],
      "extras": [
        "RJ Barrett",
        "Wendell Carter Jr.",
        "Jahlil Okafor"
      ]
    },
    {
      "id": "top-picks",
      "category": "number-one-picks",
      "prompt": "Name a star who was drafted No. 1 overall in the NBA Draft.",
      "kind": "person",
      "answers": [
        "LeBron James",
        "Shaquille O'Neal",
        "Tim Duncan",
        "Kyrie Irving",
        "Anthony Davis",
        "Dwight Howard",
        "Derrick Rose",
        "Anthony Edwards"
      ],
      "extras": [
        "Victor Wembanyama",
        "Blake Griffin",
        "John Wall"
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
        "Dwyane Wade"
      ]
    },
    {
      "id": "scorers-2000s",
      "category": "scoring-2000s",
      "prompt": "Name a star known for big scoring games during the 2000s.",
      "kind": "person",
      "answers": [
        "Kobe Bryant",
        "Allen Iverson",
        "Tracy McGrady",
        "Carmelo Anthony",
        "LeBron James",
        "Dwyane Wade",
        "Dirk Nowitzki",
        "Vince Carter"
      ],
      "extras": [
        "Gilbert Arenas",
        "Shaquille O'Neal",
        "Kevin Durant"
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
      "category": "spurs-stars",
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
      "category": "sixth-man-award",
      "prompt": "Name a player who won NBA Sixth Man of the Year.",
      "kind": "person",
      "answers": [
        "Lou Williams",
        "Jamal Crawford",
        "Manu Ginobili",
        "James Harden",
        "Tyler Herro",
        "J.R. Smith",
        "Eric Gordon",
        "Malcolm Brogdon"
      ],
      "extras": [
        "Bobby Portis",
        "Jordan Clarkson",
        "Montrezl Harrell"
      ]
    },
    {
      "id": "finals24",
      "category": "finals-2024",
      "prompt": "Name a player who appeared in the 2024 NBA Finals.",
      "kind": "person",
      "answers": [
        "Jayson Tatum",
        "Jaylen Brown",
        "Luka Doncic",
        "Kyrie Irving",
        "Jrue Holiday",
        "Derrick White",
        "Dereck Lively II",
        "Kristaps Porzingis"
      ],
      "extras": [
        "Al Horford",
        "P.J. Washington",
        "Daniel Gafford"
      ]
    },
    {
      "id": "finals23",
      "category": "finals-2023",
      "prompt": "Name a player who appeared in the 2023 NBA Finals.",
      "kind": "person",
      "answers": [
        "Nikola Jokic",
        "Jamal Murray",
        "Jimmy Butler",
        "Bam Adebayo",
        "Aaron Gordon",
        "Michael Porter Jr.",
        "Kentavious Caldwell-Pope",
        "Kyle Lowry"
      ],
      "extras": [
        "Bruce Brown",
        "Caleb Martin",
        "Max Strus"
      ]
    },
    {
      "id": "bubble",
      "category": "lakers-2020",
      "prompt": "Name a member of the Lakers' 2020 championship team.",
      "kind": "person",
      "answers": [
        "LeBron James",
        "Anthony Davis",
        "Kentavious Caldwell-Pope",
        "Alex Caruso",
        "Kyle Kuzma",
        "Rajon Rondo",
        "Dwight Howard",
        "Danny Green"
      ],
      "extras": [
        "JaVale McGee",
        "Markieff Morris"
      ]
    },
    {
      "id": "allstar10",
      "category": "ten-allstars",
      "prompt": "Name a player selected to at least 10 NBA All-Star Games.",
      "kind": "person",
      "answers": [
        "LeBron James",
        "Kevin Durant",
        "Stephen Curry",
        "Kobe Bryant",
        "Michael Jordan",
        "Shaquille O'Neal",
        "Dirk Nowitzki",
        "Tim Duncan"
      ],
      "extras": [
        "James Harden",
        "Chris Paul",
        "Dwyane Wade",
        "Carmelo Anthony",
        "Russell Westbrook"
      ]
    },
    {
      "id": "cavs16",
      "category": "cavs-2016",
      "prompt": "Name a member of Cleveland's 2016 NBA championship team.",
      "kind": "person",
      "answers": [
        "LeBron James",
        "Kyrie Irving",
        "Kevin Love",
        "J.R. Smith",
        "Tristan Thompson",
        "Richard Jefferson",
        "Iman Shumpert",
        "Matthew Dellavedova"
      ],
      "extras": [
        "Channing Frye",
        "Timofey Mozgov"
      ]
    },
    {
      "id": "mavs11",
      "category": "mavs-2011",
      "prompt": "Name a member of Dallas's 2011 NBA championship team.",
      "kind": "person",
      "answers": [
        "Dirk Nowitzki",
        "Jason Kidd",
        "Jason Terry",
        "Tyson Chandler",
        "J.J. Barea",
        "Shawn Marion",
        "Peja Stojakovic",
        "DeShawn Stevenson"
      ],
      "extras": [
        "Brian Cardinal",
        "Brendan Haywood"
      ]
    },
    {
      "id": "celtics08",
      "category": "celtics-2008",
      "prompt": "Name a member of Boston's 2008 NBA championship team.",
      "kind": "person",
      "answers": [
        "Kevin Garnett",
        "Paul Pierce",
        "Ray Allen",
        "Rajon Rondo",
        "Kendrick Perkins",
        "James Posey",
        "Glen Davis",
        "Eddie House"
      ],
      "extras": [
        "Tony Allen",
        "Leon Powe"
      ]
    },
    {
      "id": "pistons04",
      "category": "pistons-2004",
      "prompt": "Name a member of Detroit's 2004 NBA championship team.",
      "kind": "person",
      "answers": [
        "Chauncey Billups",
        "Ben Wallace",
        "Richard Hamilton",
        "Rasheed Wallace",
        "Tayshaun Prince",
        "Mehmet Okur",
        "Lindsey Hunter",
        "Corliss Williamson"
      ],
      "extras": [
        "Mike James",
        "Elden Campbell"
      ]
    },
    {
      "id": "dunkers",
      "category": "famous-dunkers",
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
        "Kobe Bryant"
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
      "category": "champion-coaches",
      "prompt": "Name a head coach who won an NBA championship since 2000.",
      "kind": "person",
      "answers": [
        "Phil Jackson",
        "Steve Kerr",
        "Gregg Popovich",
        "Erik Spoelstra",
        "Doc Rivers",
        "Michael Malone",
        "Nick Nurse",
        "Joe Mazzulla"
      ],
      "extras": [
        "Mike Budenholzer",
        "Tyronn Lue",
        "Rick Carlisle",
        "Larry Brown"
      ]
    },
    {
      "id": "rookies",
      "category": "recent-roy",
      "prompt": "Name an NBA Rookie of the Year winner from 2018 through 2025.",
      "kind": "person",
      "answers": [
        "Victor Wembanyama",
        "Luka Doncic",
        "Ja Morant",
        "LaMelo Ball",
        "Paolo Banchero",
        "Scottie Barnes",
        "Ben Simmons",
        "Stephon Castle"
      ],
      "extras": []
    }
  ],
  "alias": {
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
      "KD"
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
    ]
  }
};

export const NBA_SPORTS_FEUD_MAIN = BANK.main;
export const NBA_SPORTS_FEUD_FAST = BANK.fast;

function hash(value: string) {
  let h = 2166136261;
  for (const char of value) { h ^= char.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function pickQuestions(seed: string) {
  const first = hash(seed + "|main") % BANK.main.length;
  const main = [BANK.main[first]!];
  for (let i = 1; i < BANK.main.length; i++) {
    const q = BANK.main[(first + i) % BANK.main.length]!;
    if (q.category !== main[0]!.category) { main.push(q); break; }
  }
  if (main.length !== 2) throw new Error("NBA Sports Feud requires two distinct main categories.");
  const excluded = new Set(main.map(q => q.category));
  const fast: Authored[] = [];
  const start = hash(seed + "|fast") % BANK.fast.length;
  // Coprime step visits all questions, so every seed can assemble five topics.
  for (let i = 0; i < BANK.fast.length && fast.length < 5; i++) {
    const q = BANK.fast[(start + 13 * i) % BANK.fast.length]!;
    if (!excluded.has(q.category)) { fast.push(q); excluded.add(q.category); }
  }
  if (fast.length !== 5) throw new Error("NBA Sports Feud requires five distinct Fast Money topics.");
  return { main, fast };
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
