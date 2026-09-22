import { expandSportsFeudFamilies } from "./sportsFeudAuthoredHelpers";

export const CFB_SPORTS_FEUD_FAST_2 = expandSportsFeudFamilies("cfb-fast2", [
  {
    category: "school-stars",
    collisionGroup: "quarterbacks",
    prompts: [
      "Name a quarterback who played for Alabama.",
      "Name a recent Alabama quarterback fans remember.",
      "Name a quarterback associated with Alabama football.",
      "Name a Crimson Tide quarterback from the modern era.",
      "Name an Alabama quarterback who became a national name.",
    ],
    answers: ["Tua Tagovailoa", "Jalen Hurts", "Bryce Young", "Mac Jones", "AJ McCarron", "Greg McElroy", "Blake Sims", "Jake Coker"],
  },
  {
    category: "school-stars",
    collisionGroup: "quarterbacks",
    prompts: [
      "Name a quarterback who played for Ohio State.",
      "Name an Ohio State quarterback from the modern era.",
      "Name a Buckeyes quarterback fans remember well.",
      "Name a quarterback associated with Ohio State football.",
      "Name an Ohio State signal caller who became a national name.",
    ],
    answers: ["CJ Stroud", "Justin Fields", "Dwayne Haskins", "JT Barrett", "Braxton Miller", "Troy Smith", "Terrelle Pryor", "Cardale Jones"],
  },
  {
    category: "school-stars",
    collisionGroup: "quarterbacks",
    prompts: [
      "Name a quarterback who played for USC.",
      "Name a USC quarterback fans instantly recognize.",
      "Name a Trojans quarterback from a memorable era.",
      "Name a quarterback associated with USC football.",
      "Name a USC signal caller who became a national name.",
    ],
    answers: ["Matt Leinart", "Carson Palmer", "Caleb Williams", "Sam Darnold", "Mark Sanchez", "Matt Barkley", "John David Booty", "Cody Kessler"],
  },
  {
    category: "school-stars",
    collisionGroup: "quarterbacks",
    prompts: [
      "Name a quarterback who played for Oklahoma.",
      "Name an Oklahoma quarterback from a big offensive era.",
      "Name a Sooners quarterback fans remember quickly.",
      "Name a quarterback associated with Oklahoma football.",
      "Name an Oklahoma signal caller who became a national star.",
    ],
    answers: ["Baker Mayfield", "Kyler Murray", "Jalen Hurts", "Sam Bradford", "Jason White", "Landry Jones", "Spencer Rattler", "Dillon Gabriel"],
  },
  {
    category: "school-stars",
    collisionGroup: "quarterbacks",
    prompts: [
      "Name a quarterback who played for Texas.",
      "Name a Longhorns quarterback fans remember.",
      "Name a Texas quarterback from a memorable season.",
      "Name a quarterback associated with Texas football.",
      "Name a Texas signal caller who became a national name.",
    ],
    answers: ["Vince Young", "Colt McCoy", "Quinn Ewers", "Sam Ehlinger", "Chris Simms", "Major Applewhite", "Case McCoy", "Garrett Gilbert"],
  },
  {
    category: "school-stars",
    collisionGroup: "players",
    prompts: [
      "Name an LSU player who became a huge college football star.",
      "Name a player you strongly associate with LSU football.",
      "Name an LSU star from the modern era.",
      "Name a Tigers player who became a national name.",
      "Name an LSU player you would put on a program highlight reel.",
    ],
    answers: ["Joe Burrow", "Tyrann Mathieu", "Ja'Marr Chase", "Patrick Peterson", "Leonard Fournette", "Odell Beckham Jr.", "Justin Jefferson", "Glenn Dorsey"],
  },
  {
    category: "school-stars",
    collisionGroup: "players",
    prompts: [
      "Name a Michigan player who became a huge college football star.",
      "Name a player you strongly associate with Michigan football.",
      "Name a Wolverines star fans remember quickly.",
      "Name a Michigan player whose college career became part of program history.",
      "Name a Michigan player you would expect on a program legends list.",
    ],
    answers: ["Charles Woodson", "Desmond Howard", "Tom Brady", "Blake Corum", "Aidan Hutchinson", "Denard Robinson", "Mike Hart", "JJ McCarthy"],
  },
  {
    category: "school-stars",
    collisionGroup: "players",
    prompts: [
      "Name a Notre Dame player college football fans remember.",
      "Name a player strongly associated with Notre Dame football.",
      "Name a Fighting Irish star from a famous era.",
      "Name a Notre Dame player who became a national name.",
      "Name a player you would expect in a Notre Dame legends conversation.",
    ],
    answers: ["Tim Brown", "Joe Montana", "Jerome Bettis", "Manti Te'o", "Brady Quinn", "Rocket Ismail", "Michael Mayer", "Jaylon Smith"],
  },
  {
    category: "school-stars",
    collisionGroup: "players",
    prompts: [
      "Name a Georgia player who became a major college football star.",
      "Name a player strongly associated with Georgia football.",
      "Name a Bulldogs star fans remember quickly.",
      "Name a Georgia player you would put on a modern program highlight reel.",
      "Name a player who helped build Georgia's recent powerhouse identity.",
    ],
    answers: ["Herschel Walker", "Stetson Bennett", "Brock Bowers", "Nick Chubb", "Todd Gurley", "Roquan Smith", "Jalen Carter", "Matthew Stafford"],
  },
  {
    category: "school-stars",
    collisionGroup: "players",
    prompts: [
      "Name a Clemson player who became a major college football star.",
      "Name a player strongly associated with Clemson football.",
      "Name a Tigers star from Clemson's championship era.",
      "Name a Clemson player fans remember from a huge game.",
      "Name a player you would expect in a modern Clemson legends conversation.",
    ],
    answers: ["Deshaun Watson", "Trevor Lawrence", "CJ Spiller", "Sammy Watkins", "DeAndre Hopkins", "Christian Wilkins", "Travis Etienne", "Isaiah Simmons"],
  },
] as const);
