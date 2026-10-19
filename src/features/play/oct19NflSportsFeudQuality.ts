import type { SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";

/** October 19 editorial override: finite, checkable answer universes, not subjective fame tests. */
export const OCT19_NFL_SPORTS_FEUD_MAIN: readonly SportsFeudAuthoredQuestion[] = [
  {
    "id": "nfl-oct19-east-teams",
    "category": "division-team-knowledge",
    "entityKind": "team",
    "collisionGroup": "east-division-teams",
    "prompt": "Name an NFL team in the AFC East or NFC East.",
    "answers": [
      {
        "name": "Buffalo Bills",
        "aliases": [
          "Bills",
          "Buffalo"
        ]
      },
      {
        "name": "Dallas Cowboys",
        "aliases": [
          "Cowboys",
          "Dallas"
        ]
      },
      {
        "name": "Philadelphia Eagles",
        "aliases": [
          "Eagles",
          "Philly",
          "Philadelphia"
        ]
      },
      {
        "name": "Miami Dolphins",
        "aliases": [
          "Dolphins",
          "Miami"
        ]
      },
      {
        "name": "New England Patriots",
        "aliases": [
          "Patriots",
          "Pats",
          "New England"
        ]
      },
      {
        "name": "New York Giants",
        "aliases": [
          "Giants"
        ]
      },
      {
        "name": "New York Jets",
        "aliases": [
          "Jets"
        ]
      },
      {
        "name": "Washington Commanders",
        "aliases": [
          "Commanders",
          "Washington"
        ]
      }
    ]
  },
  {
    "id": "nfl-oct19-multiple-sb-winners",
    "category": "super-bowl-champions",
    "entityKind": "team",
    "collisionGroup": "multiple-super-bowl-titles",
    "prompt": "Name an NFL franchise that has won at least two Super Bowls.",
    "answers": [
      {
        "name": "New England Patriots",
        "aliases": [
          "Patriots",
          "Pats"
        ]
      },
      {
        "name": "Pittsburgh Steelers",
        "aliases": [
          "Steelers"
        ]
      },
      {
        "name": "Dallas Cowboys",
        "aliases": [
          "Cowboys"
        ]
      },
      {
        "name": "San Francisco 49ers",
        "aliases": [
          "49ers",
          "Niners"
        ]
      },
      {
        "name": "Kansas City Chiefs",
        "aliases": [
          "Chiefs",
          "KC",
          "Kansas City",
          "Cheifs"
        ]
      },
      {
        "name": "Green Bay Packers",
        "aliases": [
          "Packers",
          "Green Bay"
        ]
      },
      {
        "name": "New York Giants",
        "aliases": [
          "Giants"
        ]
      },
      {
        "name": "Denver Broncos",
        "aliases": [
          "Broncos"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Las Vegas Raiders",
        "aliases": [
          "Raiders",
          "Oakland Raiders"
        ]
      },
      {
        "name": "Washington Commanders",
        "aliases": [
          "Commanders",
          "Washington Redskins",
          "Washington"
        ]
      },
      {
        "name": "Baltimore Ravens",
        "aliases": [
          "Ravens"
        ]
      },
      {
        "name": "Miami Dolphins",
        "aliases": [
          "Dolphins"
        ]
      },
      {
        "name": "Indianapolis Colts",
        "aliases": [
          "Colts",
          "Baltimore Colts"
        ]
      },
      {
        "name": "Los Angeles Rams",
        "aliases": [
          "Rams",
          "St Louis Rams"
        ]
      },
      {
        "name": "Philadelphia Eagles",
        "aliases": [
          "Eagles"
        ]
      },
      {
        "name": "Tampa Bay Buccaneers",
        "aliases": [
          "Buccaneers",
          "Bucs"
        ]
      },
      {
        "name": "Seattle Seahawks",
        "aliases": [
          "Seahawks"
        ]
      }
    ]
  }
];

export const OCT19_NFL_SPORTS_FEUD_FAST: Readonly<Record<string, {
  prompt: string;
  additionalAccepted: readonly string[];
}>> = {
  "nfl-fast5-10-2": {
    "prompt": "Name a current NFL franchise that began play before 1970.",
    "additionalAccepted": [
      "Arizona Cardinals",
      "Atlanta Falcons",
      "Cincinnati Bengals",
      "Denver Broncos",
      "Detroit Lions",
      "New York Jets",
      "Minnesota Vikings",
      "New England Patriots",
      "Tennessee Titans",
      "Washington Commanders"
    ]
  },
  "nfl-fast1-09-4": {
    "prompt": "Name an NFL defender with at least 100 official regular-season sacks.",
    "additionalAccepted": [
      "Lawrence Taylor",
      "Rickey Jackson",
      "Jason Taylor",
      "Richard Dent",
      "Khalil Mack",
      "Justin Houston",
      "Cameron Jordan",
      "Calais Campbell",
      "John Abraham",
      "Chandler Jones",
      "Simeon Rice",
      "Robert Mathis",
      "Dwight Freeney",
      "Elvis Dumervil"
    ]
  },
  "nfl-fast2-09-1": {
    "prompt": "Name a player who made the Pro Bowl while playing for the Raiders.",
    "additionalAccepted": [
      "Maxx Crosby",
      "Khalil Mack",
      "Derek Carr",
      "Davante Adams",
      "Josh Jacobs",
      "Darren Waller",
      "Hunter Renfrow",
      "Rich Gannon",
      "Amari Cooper",
      "Nnamdi Asomugha",
      "Shane Lechler",
      "Sebastian Janikowski",
      "Rodney Hudson",
      "Steve Wisniewski",
      "Jared Cook"
    ]
  },
  "nfl-fast3-08-3": {
    "prompt": "Name a tight end with at least 5,000 NFL regular-season receiving yards.",
    "additionalAccepted": [
      "Jason Witten",
      "Greg Olsen",
      "Jimmy Graham",
      "Jared Cook",
      "Heath Miller",
      "Jeremy Shockey",
      "Todd Heap",
      "Delanie Walker",
      "Benjamin Watson"
    ]
  }
};
