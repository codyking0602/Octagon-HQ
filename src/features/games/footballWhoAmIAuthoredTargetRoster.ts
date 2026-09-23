export type FootballWhoAmIAuthoredTargetLeague = "NFL" | "CFB";

export interface FootballWhoAmIAuthoredTargetIdentity {
  league: FootballWhoAmIAuthoredTargetLeague;
  subjectId: string;
  name: string;
  kind: "player" | "coach";
}

/**
 * Cody-reviewed Football Who Am I removals from the old 180-player launch
 * census. Membership is name-audited here only to prove the frozen snapshot;
 * runtime authored coverage uses the immutable subject-id snapshot below.
 */
export const FOOTBALL_WHO_AM_I_AUDITED_CUT_NAMES = {
  "NFL": [
    "Jim Thorpe",
    "Bronko Nagurski",
    "Don Hutson",
    "Sammy Baugh",
    "Sid Luckman",
    "Otto Graham",
    "Bobby Layne",
    "Emlen Tunnell",
    "Chuck Bednarik",
    "Doak Walker",
    "Frank Gifford",
    "Raymond Berry",
    "Bart Starr",
    "Johnny Unitas",
    "Sam Huff",
    "Jim Brown",
    "Paul Hornung",
    "Alex Karras",
    "Chuck Howley",
    "Don Maynard",
    "Dick LeBeau",
    "Bob Lilly",
    "Deacon Jones",
    "Fran Tarkenton",
    "Bobby Bell",
    "Dave Robinson",
    "Jackie Smith",
    "John Mackey",
    "Carl Eller",
    "Charley Taylor",
    "Dave Wilcox",
    "Bob Hayes",
    "Chris Hanburger",
    "Dick Butkus",
    "Fred Biletnikoff",
    "Gale Sayers",
    "Emmitt Thomas",
    "Alan Page",
    "Charlie Sanders",
    "Claude Humphrey",
    "Curley Culp",
    "Elvin Bethea",
    "Charlie Joiner",
    "Cliff Harris",
    "Cliff Branch",
    "Dave Casper",
    "Donnie Shell",
    "Fred Dean",
    "Harry Carson",
    "Ozzie Newsome",
    "Dan Hampton",
    "Kellen Winslow",
    "Art Monk",
    "Anthony Muñoz",
    "Andre Tippett",
    "Chris Doleman",
    "Derrick Thomas",
    "Dick 'Night Train' Lane",
    "Andre Reed",
    "Aeneas Williams",
    "Ahman Green",
    "Alan Faneca",
    "Bruce Smith",
    "Bryant Young",
    "Cortez Kennedy",
    "Darrell Green",
    "Darren Sharper",
    "Derrick Brooks",
    "Derrick Mason",
    "Donald Driver",
    "Dre' Bly",
    "Eric Allen",
    "Jonathan Ogden",
    "Kevin Mawae",
    "Orlando Pace"
  ],
  "CFB": [
    "Davey O'Brien",
    "Doak Walker",
    "Paul Hornung",
    "Billy Cannon",
    "Ernie Davis",
    "Roger Staubach",
    "Jim Plunkett",
    "John Hannah",
    "Lee Roy Selmon",
    "Tony Dorsett",
    "Billy Sims",
    "George Rogers",
    "Marcus Allen",
    "Bruce Smith",
    "Keith Jackson",
    "Tim Brown",
    "Derrick Thomas",
    "Andre Ware",
    "Orlando Pace",
    "Peter Warrick",
    "Bryant McKinnie",
    "Chris Weinke",
    "Dan Morgan",
    "Dallas Clark",
    "Dwight Freeney",
    "Eric Crouch",
    "John Henderson"
  ]
} as const;

export const FOOTBALL_WHO_AM_I_AUTHORED_APPROVED_ADDITIONS = {
  "NFL": [
    {
      "subjectId": "justin-jefferson",
      "name": "Justin Jefferson"
    },
    {
      "subjectId": "derrick-henry",
      "name": "Derrick Henry"
    },
    {
      "subjectId": "saquon-barkley",
      "name": "Saquon Barkley"
    },
    {
      "subjectId": "myles-garrett",
      "name": "Myles Garrett"
    },
    {
      "subjectId": "tj-watt",
      "name": "T.J. Watt"
    },
    {
      "subjectId": "joe-burrow",
      "name": "Joe Burrow"
    },
    {
      "subjectId": "micah-parsons",
      "name": "Micah Parsons"
    },
    {
      "subjectId": "tyreek-hill",
      "name": "Tyreek Hill"
    },
    {
      "subjectId": "patrick-surtain-ii",
      "name": "Patrick Surtain II"
    },
    {
      "subjectId": "jamarr-chase",
      "name": "Ja'Marr Chase"
    },
    {
      "subjectId": "george-kittle",
      "name": "George Kittle"
    },
    {
      "subjectId": "maxx-crosby",
      "name": "Maxx Crosby"
    },
    {
      "subjectId": "amon-ra-st-brown",
      "name": "Amon-Ra St. Brown"
    },
    {
      "subjectId": "jayden-daniels",
      "name": "Jayden Daniels"
    },
    {
      "subjectId": "jahmyr-gibbs",
      "name": "Jahmyr Gibbs"
    }
  ],
  "CFB": [
    {
      "subjectId": "cfb-michael-vick",
      "name": "Michael Vick"
    },
    {
      "subjectId": "cfb-trevor-lawrence",
      "name": "Trevor Lawrence"
    },
    {
      "subjectId": "cfb-jalen-hurts",
      "name": "Jalen Hurts"
    },
    {
      "subjectId": "cfb-tua-tagovailoa",
      "name": "Tua Tagovailoa"
    },
    {
      "subjectId": "cfb-kyler-murray",
      "name": "Kyler Murray"
    },
    {
      "subjectId": "cfb-marcus-mariota",
      "name": "Marcus Mariota"
    },
    {
      "subjectId": "cfb-robert-griffin-iii",
      "name": "Robert Griffin III"
    },
    {
      "subjectId": "cfb-jameis-winston",
      "name": "Jameis Winston"
    },
    {
      "subjectId": "cfb-sam-bradford",
      "name": "Sam Bradford"
    },
    {
      "subjectId": "cfb-mark-ingram",
      "name": "Mark Ingram"
    },
    {
      "subjectId": "cfb-justin-fields",
      "name": "Justin Fields"
    },
    {
      "subjectId": "cfb-jayden-daniels",
      "name": "Jayden Daniels"
    },
    {
      "subjectId": "cfb-stetson-bennett",
      "name": "Stetson Bennett"
    },
    {
      "subjectId": "cfb-bo-nix",
      "name": "Bo Nix"
    },
    {
      "subjectId": "cfb-kellen-moore",
      "name": "Kellen Moore"
    }
  ]
} as const;

export const FOOTBALL_WHO_AM_I_AUTHORED_EXPLICIT_OUT = {
  NFL: [] as const,
  CFB: ["Peter Warrick", "Eric Crouch", "Chris Weinke"] as const,
} satisfies Record<FootballWhoAmIAuthoredTargetLeague, readonly string[]>;

export const FOOTBALL_WHO_AM_I_AUTHORED_COACH_CUT_NAMES = {
  NFL: [
    "Earl 'Curly' Lambeau",
    "George Halas",
    "Paul Brown",
    "Bud Grant",
    "Dick Vermeil",
    "Don Coryell",
    "George Allen",
    "Chuck Noll",
  ],
  CFB: ["Tom Osborne"],
} as const;

export const FOOTBALL_WHO_AM_I_AUTHORED_COACH_ADDITIONS = {
  NFL: [
    { subjectId: "nfl-mike-tomlin", name: "Mike Tomlin" },
    { subjectId: "nfl-sean-payton", name: "Sean Payton" },
    { subjectId: "nfl-john-harbaugh", name: "John Harbaugh" },
    { subjectId: "nfl-sean-mcvay", name: "Sean McVay" },
    { subjectId: "nfl-mike-shanahan", name: "Mike Shanahan" },
    { subjectId: "nfl-tom-coughlin", name: "Tom Coughlin" },
    { subjectId: "nfl-tony-dungy", name: "Tony Dungy" },
  ],
  CFB: [
    { subjectId: "cfb-lou-holtz", name: "Lou Holtz" },
    { subjectId: "cfb-mack-brown", name: "Mack Brown" },
    { subjectId: "cfb-jim-harbaugh", name: "Jim Harbaugh" },
    { subjectId: "cfb-ryan-day", name: "Ryan Day" },
    { subjectId: "cfb-jim-tressel", name: "Jim Tressel" },
    { subjectId: "cfb-lincoln-riley", name: "Lincoln Riley" },
  ],
} as const;

/**
 * Frozen post-audit authored target. Do not reconstruct this from era metadata
 * or the old 200-identity launch census: several legacy career windows are
 * intentionally incomplete and previously changed the roster by accident.
 *
 * NFL: 120 players + 19 coaches = 139 identities.
 * CFB: 168 players + 25 coaches = 193 identities.
 */
export const FOOTBALL_WHO_AM_I_AUTHORED_TARGET_IDENTITIES = {
  "NFL": [
    {
      "league": "NFL",
      "subjectId": "nfl-aaron-rodgers",
      "name": "Aaron Rodgers",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "brett-favre",
      "name": "Brett Favre",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "cam-newton",
      "name": "Cam Newton",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "dan-marino",
      "name": "Dan Marino",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "drew-brees",
      "name": "Drew Brees",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-jim-kelly",
      "name": "Jim Kelly",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "joe-montana",
      "name": "Joe Montana",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "joe-namath",
      "name": "Joe Namath",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "john-elway",
      "name": "John Elway",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-josh-allen",
      "name": "Josh Allen",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "kurt-warner",
      "name": "Kurt Warner",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-lamar-jackson",
      "name": "Lamar Jackson",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-patrick-mahomes",
      "name": "Patrick Mahomes",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "peyton-manning",
      "name": "Peyton Manning",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-roger-staubach",
      "name": "Roger Staubach",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "steve-young",
      "name": "Steve Young",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-terry-bradshaw",
      "name": "Terry Bradshaw",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "tom-brady",
      "name": "Tom Brady",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "troy-aikman",
      "name": "Troy Aikman",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-ya-tittle",
      "name": "Y.A. Tittle",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-alex-smith",
      "name": "Alex Smith",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "andrew-luck",
      "name": "Andrew Luck",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "adrian-peterson",
      "name": "Adrian Peterson",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "barry-sanders",
      "name": "Barry Sanders",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "earl-campbell",
      "name": "Earl Campbell",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "emmitt-smith",
      "name": "Emmitt Smith",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "eric-dickerson",
      "name": "Eric Dickerson",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-harold-red-grange",
      "name": "Harold 'Red' Grange",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "ladainian-tomlinson",
      "name": "LaDainian Tomlinson",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "marcus-allen",
      "name": "Marcus Allen",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "marshall-faulk",
      "name": "Marshall Faulk",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-oj-simpson",
      "name": "O.J. Simpson",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-reggie-bush",
      "name": "Reggie Bush",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "tony-dorsett",
      "name": "Tony Dorsett",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "walter-payton",
      "name": "Walter Payton",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-alvin-kamara",
      "name": "Alvin Kamara",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-ashton-jeanty",
      "name": "Ashton Jeanty",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-bijan-robinson",
      "name": "Bijan Robinson",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-chris-johnson",
      "name": "Chris Johnson",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-christian-mccaffrey",
      "name": "Christian McCaffrey",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-calvin-johnson",
      "name": "Calvin Johnson",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-jerry-rice",
      "name": "Jerry Rice",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-larry-fitzgerald",
      "name": "Larry Fitzgerald",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-randy-moss",
      "name": "Randy Moss",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-terrell-owens",
      "name": "Terrell Owens",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-a-j-brown",
      "name": "A.J. Brown",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-a-j-green",
      "name": "A.J. Green",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-amari-cooper",
      "name": "Amari Cooper",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-andre-johnson",
      "name": "Andre Johnson",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-anquan-boldin",
      "name": "Anquan Boldin",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-antonio-brown",
      "name": "Antonio Brown",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-brandon-marshall",
      "name": "Brandon Marshall",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-chad-johnson",
      "name": "Chad Johnson",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-cris-carter",
      "name": "Cris Carter",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-davante-adams",
      "name": "Davante Adams",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-deandre-hopkins",
      "name": "DeAndre Hopkins",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-desean-jackson",
      "name": "DeSean Jackson",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-devin-hester",
      "name": "Devin Hester",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-dez-bryant",
      "name": "Dez Bryant",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-drew-pearson",
      "name": "Drew Pearson",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "antonio-gates",
      "name": "Antonio Gates",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "jason-witten",
      "name": "Jason Witten",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "mike-ditka",
      "name": "Mike Ditka",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "shannon-sharpe",
      "name": "Shannon Sharpe",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-tony-gonzalez",
      "name": "Tony Gonzalez",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-travis-kelce",
      "name": "Travis Kelce",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "zach-ertz",
      "name": "Zach Ertz",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-jason-kelce",
      "name": "Jason Kelce",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-joe-thomas",
      "name": "Joe Thomas",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-marshal-yanda",
      "name": "Marshal Yanda",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-steve-hutchinson",
      "name": "Steve Hutchinson",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-trent-williams",
      "name": "Trent Williams",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-tyron-smith",
      "name": "Tyron Smith",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-aaron-donald",
      "name": "Aaron Donald",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-j-j-watt",
      "name": "J. J. Watt",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "joe-greene",
      "name": "Joe Greene",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "reggie-white",
      "name": "Reggie White",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-calais-campbell",
      "name": "Calais Campbell",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-cameron-heyward",
      "name": "Cameron Heyward",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-carlos-dunlap",
      "name": "Carlos Dunlap",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-chandler-jones",
      "name": "Chandler Jones",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-charles-haley",
      "name": "Charles Haley",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-danielle-hunter",
      "name": "Danielle Hunter",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-dwight-freeney",
      "name": "Dwight Freeney",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-elvis-dumervil",
      "name": "Elvis Dumervil",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-brian-urlacher",
      "name": "Brian Urlacher",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "lawrence-taylor",
      "name": "Lawrence Taylor",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-ray-lewis",
      "name": "Ray Lewis",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-cameron-jordan",
      "name": "Cameron Jordan",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-cameron-wake",
      "name": "Cameron Wake",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "clay-matthews",
      "name": "Clay Matthews",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-demarcus-ware",
      "name": "DeMarcus Ware",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-charles-woodson",
      "name": "Charles Woodson",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "deion-sanders",
      "name": "Deion Sanders",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-ed-reed",
      "name": "Ed Reed",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "ronnie-lott",
      "name": "Ronnie Lott",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-troy-polamalu",
      "name": "Troy Polamalu",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-aqib-talib",
      "name": "Aqib Talib",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-asante-samuel",
      "name": "Asante Samuel",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "brian-dawkins",
      "name": "Brian Dawkins",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "champ-bailey",
      "name": "Champ Bailey",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-charles-tillman",
      "name": "Charles Tillman",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-darrelle-revis",
      "name": "Darrelle Revis",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-deangelo-hall",
      "name": "DeAngelo Hall",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-devin-mccourty",
      "name": "Devin McCourty",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "justin-jefferson",
      "name": "Justin Jefferson",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "derrick-henry",
      "name": "Derrick Henry",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "saquon-barkley",
      "name": "Saquon Barkley",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "myles-garrett",
      "name": "Myles Garrett",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "tj-watt",
      "name": "T.J. Watt",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "joe-burrow",
      "name": "Joe Burrow",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "micah-parsons",
      "name": "Micah Parsons",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "tyreek-hill",
      "name": "Tyreek Hill",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "patrick-surtain-ii",
      "name": "Patrick Surtain II",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "jamarr-chase",
      "name": "Ja'Marr Chase",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "george-kittle",
      "name": "George Kittle",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "maxx-crosby",
      "name": "Maxx Crosby",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "amon-ra-st-brown",
      "name": "Amon-Ra St. Brown",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "jayden-daniels",
      "name": "Jayden Daniels",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "jahmyr-gibbs",
      "name": "Jahmyr Gibbs",
      "kind": "player"
    },
    {
      "league": "NFL",
      "subjectId": "andy-reid",
      "name": "Andy Reid",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "bill-belichick",
      "name": "Bill Belichick",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "bill-parcells",
      "name": "Bill Parcells",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "bill-walsh",
      "name": "Bill Walsh",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "don-shula",
      "name": "Don Shula",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-jimmy-johnson-coach",
      "name": "Jimmy Johnson",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "joe-gibbs",
      "name": "Joe Gibbs",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-john-madden",
      "name": "John Madden",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "pete-carroll",
      "name": "Pete Carroll",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "tom-landry",
      "name": "Tom Landry",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "vince-lombardi",
      "name": "Vince Lombardi",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "bill-cowher",
      "name": "Bill Cowher",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-mike-tomlin",
      "name": "Mike Tomlin",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-sean-payton",
      "name": "Sean Payton",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-john-harbaugh",
      "name": "John Harbaugh",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-sean-mcvay",
      "name": "Sean McVay",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-mike-shanahan",
      "name": "Mike Shanahan",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-tom-coughlin",
      "name": "Tom Coughlin",
      "kind": "coach"
    },
    {
      "league": "NFL",
      "subjectId": "nfl-tony-dungy",
      "name": "Tony Dungy",
      "kind": "coach"
    }
  ],
  "CFB": [
    {
      "league": "CFB",
      "subjectId": "cfb-cam-newton",
      "name": "Cam Newton",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-doug-flutie",
      "name": "Doug Flutie",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-joe-burrow",
      "name": "Joe Burrow",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-johnny-manziel",
      "name": "Johnny Manziel",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-lamar-jackson",
      "name": "Lamar Jackson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-matt-leinart",
      "name": "Matt Leinart",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-tim-tebow",
      "name": "Tim Tebow",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-vince-young",
      "name": "Vince Young",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-andrew-luck",
      "name": "Andrew Luck",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-baker-mayfield",
      "name": "Baker Mayfield",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-brady-quinn",
      "name": "Brady Quinn",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-bryce-young",
      "name": "Bryce Young",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-c-j-stroud",
      "name": "C.J. Stroud",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-caleb-williams",
      "name": "Caleb Williams",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-carson-palmer",
      "name": "Carson Palmer",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-charlie-ward",
      "name": "Charlie Ward",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-colt-brennan",
      "name": "Colt Brennan",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-colt-mccoy",
      "name": "Colt McCoy",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-dak-prescott",
      "name": "Dak Prescott",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-danny-wuerffel",
      "name": "Danny Wuerffel",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-deshaun-watson",
      "name": "Deshaun Watson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-drew-brees",
      "name": "Drew Brees",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-eli-manning",
      "name": "Eli Manning",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-fernando-mendoza",
      "name": "Fernando Mendoza",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-adrian-peterson",
      "name": "Adrian Peterson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-archie-griffin",
      "name": "Archie Griffin",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-barry-sanders",
      "name": "Barry Sanders",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-bo-jackson",
      "name": "Bo Jackson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-darren-mcfadden",
      "name": "Darren McFadden",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-derrick-henry",
      "name": "Derrick Henry",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-earl-campbell",
      "name": "Earl Campbell",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-herschel-walker",
      "name": "Herschel Walker",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-o-j-simpson",
      "name": "O. J. Simpson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-reggie-bush",
      "name": "Reggie Bush",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-ricky-williams",
      "name": "Ricky Williams",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-ashton-jeanty",
      "name": "Ashton Jeanty",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-bijan-robinson",
      "name": "Bijan Robinson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-cedric-benson",
      "name": "Cedric Benson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-christian-mccaffrey",
      "name": "Christian McCaffrey",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-dalvin-cook",
      "name": "Dalvin Cook",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-darren-sproles",
      "name": "Darren Sproles",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-deangelo-williams",
      "name": "DeAngelo Williams",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-eddie-george",
      "name": "Eddie George",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-ezekiel-elliott",
      "name": "Ezekiel Elliott",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jamaal-charles",
      "name": "Jamaal Charles",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-ladainian-tomlinson",
      "name": "LaDainian Tomlinson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-lamichael-james",
      "name": "LaMichael James",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-calvin-johnson",
      "name": "Calvin Johnson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-desmond-howard",
      "name": "Desmond Howard",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-devonta-smith",
      "name": "DeVonta Smith",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-justin-blackmon",
      "name": "Justin Blackmon",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-larry-fitzgerald",
      "name": "Larry Fitzgerald",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-michael-crabtree",
      "name": "Michael Crabtree",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-a-j-brown",
      "name": "A.J. Brown",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-amari-cooper",
      "name": "Amari Cooper",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-andre-johnson",
      "name": "Andre Johnson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-brandin-cooks",
      "name": "Brandin Cooks",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-braylon-edwards",
      "name": "Braylon Edwards",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-davante-adams",
      "name": "Davante Adams",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-desean-jackson",
      "name": "DeSean Jackson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-dez-bryant",
      "name": "Dez Bryant",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jamarr-chase",
      "name": "Ja'Marr Chase",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jordan-shipley",
      "name": "Jordan Shipley",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-marqise-lee",
      "name": "Marqise Lee",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-marvin-harrison-jr",
      "name": "Marvin Harrison Jr.",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-mike-evans",
      "name": "Mike Evans",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-ryan-broyles",
      "name": "Ryan Broyles",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-sammy-watkins",
      "name": "Sammy Watkins",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-brock-bowers",
      "name": "Brock Bowers",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-chase-coffman",
      "name": "Chase Coffman",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-dwayne-allen",
      "name": "Dwayne Allen",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-heath-miller",
      "name": "Heath Miller",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-hunter-henry",
      "name": "Hunter Henry",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jake-butt",
      "name": "Jake Butt",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jeremy-shockey",
      "name": "Jeremy Shockey",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jermaine-gresham",
      "name": "Jermaine Gresham",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-kellen-winslow-ii",
      "name": "Kellen Winslow II",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-kyle-pitts",
      "name": "Kyle Pitts",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-alex-mack",
      "name": "Alex Mack",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-barrett-jones",
      "name": "Barrett Jones",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-brandon-scherff",
      "name": "Brandon Scherff",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-dbrickashaw-ferguson",
      "name": "D'Brickashaw Ferguson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-david-decastro",
      "name": "David DeCastro",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jake-long",
      "name": "Jake Long",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jake-matthews",
      "name": "Jake Matthews",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-joe-alt",
      "name": "Joe Alt",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-joe-thomas",
      "name": "Joe Thomas",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-aaron-donald",
      "name": "Aaron Donald",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-chase-young",
      "name": "Chase Young",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jadeveon-clowney",
      "name": "Jadeveon Clowney",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-myles-garrett",
      "name": "Myles Garrett",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-ndamukong-suh",
      "name": "Ndamukong Suh",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-will-anderson-jr",
      "name": "Will Anderson Jr.",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-abdul-carter",
      "name": "Abdul Carter",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-aidan-hutchinson",
      "name": "Aidan Hutchinson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-brian-orakpo",
      "name": "Brian Orakpo",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-chris-long",
      "name": "Chris Long",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-david-pollack",
      "name": "David Pollack",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-gerald-mccoy",
      "name": "Gerald McCoy",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-glenn-dorsey",
      "name": "Glenn Dorsey",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-haloti-ngata",
      "name": "Haloti Ngata",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jj-watt",
      "name": "J.J. Watt",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jalen-carter",
      "name": "Jalen Carter",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-joey-bosa",
      "name": "Joey Bosa",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jonathan-allen",
      "name": "Jonathan Allen",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-julius-peppers",
      "name": "Julius Peppers",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-kayvon-thibodeaux",
      "name": "Kayvon Thibodeaux",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-luke-kuechly",
      "name": "Luke Kuechly",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-manti-teo",
      "name": "Manti Te'o",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-roquan-smith",
      "name": "Roquan Smith",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-von-miller",
      "name": "Von Miller",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-aj-hawk",
      "name": "A.J. Hawk",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-brian-urlacher",
      "name": "Brian Urlacher",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-cj-mosley",
      "name": "C.J. Mosley",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-derrick-johnson",
      "name": "Derrick Johnson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-devin-white",
      "name": "Devin White",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-isaiah-simmons",
      "name": "Isaiah Simmons",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-james-laurinaitis",
      "name": "James Laurinaitis",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jaylon-smith",
      "name": "Jaylon Smith",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-khalil-mack",
      "name": "Khalil Mack",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-micah-parsons",
      "name": "Micah Parsons",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-nakobe-dean",
      "name": "Nakobe Dean",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-patrick-willis",
      "name": "Patrick Willis",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-paul-posluszny",
      "name": "Paul Posluszny",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-rolando-mcclain",
      "name": "Rolando McClain",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-charles-woodson",
      "name": "Charles Woodson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-deion-sanders",
      "name": "Deion Sanders",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-ed-reed",
      "name": "Ed Reed",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-eric-berry",
      "name": "Eric Berry",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-minkah-fitzpatrick",
      "name": "Minkah Fitzpatrick",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-patrick-peterson",
      "name": "Patrick Peterson",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-sean-taylor",
      "name": "Sean Taylor",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-travis-hunter",
      "name": "Travis Hunter",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-tyrann-mathieu",
      "name": "Tyrann Mathieu",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-aaron-ross",
      "name": "Aaron Ross",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-antoine-winfield-jr",
      "name": "Antoine Winfield Jr.",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-budda-baker",
      "name": "Budda Baker",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-caleb-downs",
      "name": "Caleb Downs",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-champ-bailey",
      "name": "Champ Bailey",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-cooper-dejean",
      "name": "Cooper DeJean",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-darqueze-dennard",
      "name": "Darqueze Dennard",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-derwin-james",
      "name": "Derwin James",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-earl-thomas",
      "name": "Earl Thomas",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-eric-weddle",
      "name": "Eric Weddle",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jabrill-peppers",
      "name": "Jabrill Peppers",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jalen-ramsey",
      "name": "Jalen Ramsey",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jamal-adams",
      "name": "Jamal Adams",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jeff-okudah",
      "name": "Jeff Okudah",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-kyle-hamilton",
      "name": "Kyle Hamilton",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-malaki-starks",
      "name": "Malaki Starks",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-malcolm-jenkins",
      "name": "Malcolm Jenkins",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-michael-huff",
      "name": "Michael Huff",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-morris-claiborne",
      "name": "Morris Claiborne",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-michael-vick",
      "name": "Michael Vick",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-trevor-lawrence",
      "name": "Trevor Lawrence",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jalen-hurts",
      "name": "Jalen Hurts",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-tua-tagovailoa",
      "name": "Tua Tagovailoa",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-kyler-murray",
      "name": "Kyler Murray",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-marcus-mariota",
      "name": "Marcus Mariota",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-robert-griffin-iii",
      "name": "Robert Griffin III",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jameis-winston",
      "name": "Jameis Winston",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-sam-bradford",
      "name": "Sam Bradford",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-mark-ingram",
      "name": "Mark Ingram",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-justin-fields",
      "name": "Justin Fields",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jayden-daniels",
      "name": "Jayden Daniels",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-stetson-bennett",
      "name": "Stetson Bennett",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-bo-nix",
      "name": "Bo Nix",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-kellen-moore",
      "name": "Kellen Moore",
      "kind": "player"
    },
    {
      "league": "CFB",
      "subjectId": "barry-switzer",
      "name": "Barry Switzer",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "bear-bryant",
      "name": "Bear Bryant",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "bobby-bowden-cfb",
      "name": "Bobby Bowden",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "dabo-swinney-cfb",
      "name": "Dabo Swinney",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "kirby-smart-cfb",
      "name": "Kirby Smart",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "nick-saban-cfb",
      "name": "Nick Saban",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "pete-carroll-cfb",
      "name": "Pete Carroll",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "steve-spurrier-cfb",
      "name": "Steve Spurrier",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "urban-meyer-cfb",
      "name": "Urban Meyer",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "woody-hayes",
      "name": "Woody Hayes",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "bill-snyder-cfb",
      "name": "Bill Snyder",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "bob-stoops-cfb",
      "name": "Bob Stoops",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "brian-kelly-cfb",
      "name": "Brian Kelly",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "chip-kelly",
      "name": "Chip Kelly",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "chris-petersen-cfb",
      "name": "Chris Petersen",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "dan-lanning",
      "name": "Dan Lanning",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "ed-orgeron",
      "name": "Ed Orgeron",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "frank-beamer-cfb",
      "name": "Frank Beamer",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "gary-patterson-cfb",
      "name": "Gary Patterson",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-lou-holtz",
      "name": "Lou Holtz",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-mack-brown",
      "name": "Mack Brown",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jim-harbaugh",
      "name": "Jim Harbaugh",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-ryan-day",
      "name": "Ryan Day",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-jim-tressel",
      "name": "Jim Tressel",
      "kind": "coach"
    },
    {
      "league": "CFB",
      "subjectId": "cfb-lincoln-riley",
      "name": "Lincoln Riley",
      "kind": "coach"
    }
  ]
} as const satisfies Record<
  FootballWhoAmIAuthoredTargetLeague,
  readonly FootballWhoAmIAuthoredTargetIdentity[]
>;

export function footballWhoAmIAuthoredTargetRoster(
  league: FootballWhoAmIAuthoredTargetLeague,
) {
  const subjects = [...FOOTBALL_WHO_AM_I_AUTHORED_TARGET_IDENTITIES[league]];
  const players = subjects.filter((subject) => subject.kind === "player");
  const coaches = subjects.filter((subject) => subject.kind === "coach");
  return { league, players, coaches, subjects } as const;
}

export function footballWhoAmIAuthoredTargetSubjectIds(
  league: FootballWhoAmIAuthoredTargetLeague,
) {
  return new Set(FOOTBALL_WHO_AM_I_AUTHORED_TARGET_IDENTITIES[league].map((subject) => subject.subjectId));
}
