import { expandSportsFeudFamilies } from "./sportsFeudAuthoredHelpers";

export const NFL_SPORTS_FEUD_FAST_2 = expandSportsFeudFamilies("nfl-fast2", [
  {
    category: "team-stars",
    collisionGroup: "quarterbacks",
    prompts: [
      "Name a quarterback who played for the Dallas Cowboys.",
      "Name a Cowboys quarterback fans remember.",
      "Name a Dallas quarterback from a memorable era.",
      "Name a quarterback associated with Cowboys history.",
      "Name a Cowboys signal caller who became a national name.",
    ],
    answers: ["Roger Staubach", "Troy Aikman", "Tony Romo", "Dak Prescott", "Danny White", "Don Meredith", "Quincy Carter", "Vinny Testaverde"],
  },
  {
    category: "team-stars",
    collisionGroup: "quarterbacks",
    prompts: [
      "Name a quarterback who played for the Green Bay Packers.",
      "Name a Packers quarterback fans remember.",
      "Name a Green Bay quarterback from a memorable era.",
      "Name a quarterback associated with Packers history.",
      "Name a Packers signal caller who became a national name.",
    ],
    answers: ["Bart Starr", "Brett Favre", "Aaron Rodgers", "Jordan Love", "Lynn Dickey", "Don Majkowski", "Matt Flynn", "Scott Hunter"],
  },
  {
    category: "team-stars",
    collisionGroup: "quarterbacks",
    prompts: [
      "Name a quarterback who played for the San Francisco 49ers.",
      "Name a 49ers quarterback fans remember.",
      "Name a San Francisco quarterback from a memorable era.",
      "Name a quarterback associated with 49ers history.",
      "Name a 49ers signal caller who became a national name.",
    ],
    answers: ["Joe Montana", "Steve Young", "Brock Purdy", "Colin Kaepernick", "Jeff Garcia", "Alex Smith", "Jimmy Garoppolo", "John Brodie"],
  },
  {
    category: "team-stars",
    collisionGroup: "quarterbacks",
    prompts: [
      "Name a quarterback who played for the Pittsburgh Steelers.",
      "Name a Steelers quarterback fans remember.",
      "Name a Pittsburgh quarterback from a memorable era.",
      "Name a quarterback associated with Steelers history.",
      "Name a Steelers signal caller who became a national name.",
    ],
    answers: ["Terry Bradshaw", "Ben Roethlisberger", "Kordell Stewart", "Neil O'Donnell", "Tommy Maddox", "Mason Rudolph", "Kenny Pickett", "Mike Tomczak"],
  },
  {
    category: "team-stars",
    collisionGroup: "quarterbacks",
    prompts: [
      "Name a quarterback who played for the New England Patriots.",
      "Name a Patriots quarterback fans remember.",
      "Name a New England quarterback from a memorable era.",
      "Name a quarterback associated with Patriots history.",
      "Name a Patriots signal caller who became a national name.",
    ],
    answers: ["Tom Brady", "Drew Bledsoe", "Mac Jones", "Jacoby Brissett", "Jimmy Garoppolo", "Matt Cassel", "Steve Grogan", "Tony Eason"],
  },
  {
    category: "team-stars",
    collisionGroup: "players",
    prompts: [
      "Name a Kansas City Chiefs player fans strongly associate with the franchise.",
      "Name a Chiefs star from a memorable era.",
      "Name a Kansas City player who became a national name.",
      "Name a player you would expect in a Chiefs legends conversation.",
      "Name a Chiefs player whose highlights define part of team history.",
    ],
    answers: ["Patrick Mahomes", "Travis Kelce", "Tony Gonzalez", "Derrick Thomas", "Jamaal Charles", "Priest Holmes", "Tyreek Hill", "Chris Jones"],
  },
  {
    category: "team-stars",
    collisionGroup: "defenders",
    prompts: [
      "Name a Baltimore Ravens defensive star.",
      "Name a defender strongly associated with Ravens football.",
      "Name a Baltimore defensive player who became a national name.",
      "Name a defender you would expect in a Ravens legends conversation.",
      "Name a Ravens player whose identity fits the franchise's defensive reputation.",
    ],
    answers: ["Ray Lewis", "Ed Reed", "Terrell Suggs", "Haloti Ngata", "Peter Boulware", "Chris McAlister", "Marlon Humphrey", "Roquan Smith"],
  },
  {
    category: "team-stars",
    collisionGroup: "receivers",
    prompts: [
      "Name a famous Minnesota Vikings receiver.",
      "Name a Vikings pass catcher fans remember quickly.",
      "Name a Minnesota wide receiver who became a national name.",
      "Name a receiver you would expect in a Vikings legends conversation.",
      "Name a Vikings receiver whose highlights helped define an era.",
    ],
    answers: ["Randy Moss", "Cris Carter", "Justin Jefferson", "Adam Thielen", "Anthony Carter", "Stefon Diggs", "Jake Reed", "Sammy White"],
  },
  {
    category: "team-stars",
    collisionGroup: "players",
    prompts: [
      "Name a famous Raiders player.",
      "Name a player strongly associated with the Raiders.",
      "Name a Raiders star whose personality fit the franchise.",
      "Name a player you would expect in a Raiders legends conversation.",
      "Name a Raiders player whose career became part of the team's mythology.",
    ],
    answers: ["Marcus Allen", "Bo Jackson", "Tim Brown", "Howie Long", "Charles Woodson", "Ken Stabler", "Gene Upshaw", "Fred Biletnikoff"],
  },
  {
    category: "team-stars",
    collisionGroup: "defenders",
    prompts: [
      "Name a famous Chicago Bears defender.",
      "Name a defensive player strongly associated with the Bears.",
      "Name a Bears defender who became a national name.",
      "Name a player you would expect in a Bears defensive legends conversation.",
      "Name a Bears player whose career fits the franchise's defensive identity.",
    ],
    answers: ["Dick Butkus", "Mike Singletary", "Brian Urlacher", "Richard Dent", "Dan Hampton", "Lance Briggs", "Charles Tillman", "Khalil Mack"],
  },
] as const);
