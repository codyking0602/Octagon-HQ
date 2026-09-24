import { expandSportsFeudFamilies } from "./sportsFeudAuthoredHelpers";

export const UFC_SPORTS_FEUD_FAST_1 = expandSportsFeudFamilies("ufc-fast1", [
  {
    "category": "divisions",
    "entityKind": "other",
    "collisionGroup": "divisions",
    "prompts": [
      {
        "prompt": "Name a UFC weight class.",
        "answers": [
          "Lightweight",
          "Welterweight",
          "Middleweight",
          "Featherweight",
          "Bantamweight",
          "Heavyweight",
          "Light heavyweight",
          "Flyweight"
        ],
        "alsoAcceptedAnswers": [
          "Strawweight",
          "Women's flyweight",
          "Women's bantamweight"
        ]
      },
      {
        "prompt": "Name a division you can see on a UFC card.",
        "answers": [
          "Lightweight",
          "Welterweight",
          "Middleweight",
          "Heavyweight",
          "Featherweight",
          "Bantamweight",
          "Flyweight",
          "Light heavyweight"
        ],
        "alsoAcceptedAnswers": [
          "Strawweight",
          "Women's flyweight",
          "Women's bantamweight"
        ]
      },
      {
        "prompt": "Name a UFC division with famous champions.",
        "answers": [
          "Lightweight",
          "Welterweight",
          "Heavyweight",
          "Middleweight",
          "Featherweight",
          "Bantamweight",
          "Light heavyweight",
          "Flyweight"
        ],
        "alsoAcceptedAnswers": [
          "Strawweight",
          "Women's flyweight",
          "Women's bantamweight"
        ]
      },
      {
        "prompt": "Name a weight class MMA fans debate constantly.",
        "answers": [
          "Lightweight",
          "Welterweight",
          "Middleweight",
          "Featherweight",
          "Bantamweight",
          "Flyweight",
          "Heavyweight",
          "Light heavyweight"
        ],
        "alsoAcceptedAnswers": [
          "Strawweight",
          "Women's flyweight",
          "Women's bantamweight"
        ]
      },
      {
        "prompt": "Name a division a UFC fighter can compete in.",
        "answers": [
          "Lightweight",
          "Welterweight",
          "Middleweight",
          "Featherweight",
          "Bantamweight",
          "Heavyweight",
          "Flyweight",
          "Light heavyweight"
        ],
        "alsoAcceptedAnswers": [
          "Strawweight",
          "Women's flyweight",
          "Women's bantamweight"
        ]
      }
    ],
    "answers": [
      {
        "name": "Lightweight",
        "aliases": [
          "LW",
          "155"
        ]
      },
      {
        "name": "Welterweight",
        "aliases": [
          "WW",
          "170"
        ]
      },
      {
        "name": "Middleweight",
        "aliases": [
          "MW",
          "185"
        ]
      },
      {
        "name": "Featherweight",
        "aliases": [
          "FW",
          "145"
        ]
      },
      {
        "name": "Bantamweight",
        "aliases": [
          "BW",
          "135"
        ]
      },
      {
        "name": "Heavyweight",
        "aliases": [
          "HW",
          "265"
        ]
      },
      {
        "name": "Light heavyweight",
        "aliases": [
          "LHW",
          "205"
        ]
      },
      {
        "name": "Flyweight",
        "aliases": [
          "FLW",
          "125"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Strawweight",
        "aliases": [
          "SW",
          "115"
        ]
      },
      {
        "name": "Women's flyweight",
        "aliases": [
          "Women's FLW",
          "WFLW"
        ]
      },
      {
        "name": "Women's bantamweight",
        "aliases": [
          "Women's BW",
          "WBW"
        ]
      }
    ]
  },
  {
    "category": "champions",
    "entityKind": "person",
    "collisionGroup": "lightweights",
    "prompts": [
      {
        "prompt": "Name an undisputed UFC lightweight champion from any era.",
        "answers": [
          "Khabib Nurmagomedov",
          "BJ Penn",
          "Islam Makhachev",
          "Charles Oliveira",
          "Conor McGregor",
          "Frankie Edgar",
          "Benson Henderson",
          "Justin Gaethje"
        ],
        "alsoAcceptedAnswers": [
          "Eddie Alvarez",
          "Rafael dos Anjos",
          "Jens Pulver",
          "Sean Sherk",
          "Anthony Pettis",
          "Ilia Topuria"
        ]
      },
      {
        "prompt": "Name a fighter who has held the undisputed UFC lightweight title.",
        "answers": [
          "Khabib Nurmagomedov",
          "Islam Makhachev",
          "Charles Oliveira",
          "BJ Penn",
          "Frankie Edgar",
          "Benson Henderson",
          "Anthony Pettis",
          "Conor McGregor"
        ],
        "alsoAcceptedAnswers": [
          "Eddie Alvarez",
          "Rafael dos Anjos",
          "Jens Pulver",
          "Sean Sherk",
          "Ilia Topuria",
          "Justin Gaethje"
        ]
      },
      {
        "prompt": "Name a former or current undisputed UFC 155-pound champion.",
        "answers": [
          "Justin Gaethje",
          "Ilia Topuria",
          "Islam Makhachev",
          "Charles Oliveira",
          "Khabib Nurmagomedov",
          "Conor McGregor",
          "Rafael dos Anjos",
          "Eddie Alvarez"
        ],
        "alsoAcceptedAnswers": [
          "BJ Penn",
          "Frankie Edgar",
          "Benson Henderson",
          "Jens Pulver",
          "Sean Sherk",
          "Anthony Pettis"
        ]
      },
      {
        "prompt": "Name a lightweight whose résumé includes undisputed UFC gold.",
        "answers": [
          "Khabib Nurmagomedov",
          "BJ Penn",
          "Islam Makhachev",
          "Charles Oliveira",
          "Frankie Edgar",
          "Benson Henderson",
          "Rafael dos Anjos",
          "Conor McGregor"
        ],
        "alsoAcceptedAnswers": [
          "Eddie Alvarez",
          "Jens Pulver",
          "Sean Sherk",
          "Anthony Pettis",
          "Ilia Topuria",
          "Justin Gaethje"
        ]
      },
      {
        "prompt": "Name another fighter on the undisputed UFC lightweight champions list.",
        "answers": [
          "Khabib Nurmagomedov",
          "BJ Penn",
          "Islam Makhachev",
          "Charles Oliveira",
          "Frankie Edgar",
          "Benson Henderson",
          "Conor McGregor",
          "Ilia Topuria"
        ],
        "alsoAcceptedAnswers": [
          "Eddie Alvarez",
          "Rafael dos Anjos",
          "Jens Pulver",
          "Sean Sherk",
          "Anthony Pettis",
          "Justin Gaethje"
        ]
      }
    ],
    "answers": [
      {
        "name": "Khabib Nurmagomedov",
        "aliases": [
          "Khabib"
        ]
      },
      {
        "name": "Charles Oliveira",
        "aliases": [
          "Do Bronx"
        ]
      },
      {
        "name": "BJ Penn",
        "aliases": [
          "BJ"
        ]
      },
      {
        "name": "Islam Makhachev",
        "aliases": [
          "Islam"
        ]
      },
      "Frankie Edgar",
      {
        "name": "Benson Henderson",
        "aliases": [
          "Bendo"
        ]
      },
      "Eddie Alvarez",
      {
        "name": "Rafael dos Anjos",
        "aliases": [
          "RDA"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      "Jens Pulver",
      "Sean Sherk",
      {
        "name": "Anthony Pettis",
        "aliases": [
          "Showtime"
        ]
      },
      {
        "name": "Conor McGregor",
        "aliases": [
          "Conor"
        ]
      },
      {
        "name": "Ilia Topuria",
        "aliases": [
          "Topuria"
        ]
      },
      {
        "name": "Justin Gaethje",
        "aliases": [
          "Gaethje"
        ]
      }
    ]
  },
  {
    "category": "champions",
    "entityKind": "person",
    "collisionGroup": "welterweights",
    "prompts": [
      {
        "prompt": "Name an undisputed UFC welterweight champion from any era.",
        "answers": [
          "Georges St-Pierre",
          "Matt Hughes",
          "Kamaru Usman",
          "Islam Makhachev",
          "Leon Edwards",
          "Robbie Lawler",
          "Tyron Woodley",
          "BJ Penn"
        ],
        "alsoAcceptedAnswers": [
          "Johny Hendricks",
          "Carlos Newton",
          "Pat Miletich",
          "Matt Serra",
          "Belal Muhammad",
          "Jack Della Maddalena"
        ]
      },
      {
        "prompt": "Name a fighter who has held the undisputed UFC welterweight title.",
        "answers": [
          "Georges St-Pierre",
          "Matt Hughes",
          "Kamaru Usman",
          "Islam Makhachev",
          "Leon Edwards",
          "Robbie Lawler",
          "Tyron Woodley",
          "Belal Muhammad"
        ],
        "alsoAcceptedAnswers": [
          "Johny Hendricks",
          "Carlos Newton",
          "BJ Penn",
          "Pat Miletich",
          "Matt Serra",
          "Jack Della Maddalena"
        ]
      },
      {
        "prompt": "Name a former or current undisputed UFC 170-pound champion.",
        "answers": [
          "Islam Makhachev",
          "Jack Della Maddalena",
          "Belal Muhammad",
          "Leon Edwards",
          "Kamaru Usman",
          "Tyron Woodley",
          "Robbie Lawler",
          "Georges St-Pierre"
        ],
        "alsoAcceptedAnswers": [
          "Matt Hughes",
          "Johny Hendricks",
          "Carlos Newton",
          "BJ Penn",
          "Pat Miletich",
          "Matt Serra"
        ]
      },
      {
        "prompt": "Name a welterweight whose résumé includes undisputed UFC gold.",
        "answers": [
          "Georges St-Pierre",
          "Matt Hughes",
          "Kamaru Usman",
          "Islam Makhachev",
          "Leon Edwards",
          "Robbie Lawler",
          "Tyron Woodley",
          "Johny Hendricks"
        ],
        "alsoAcceptedAnswers": [
          "Carlos Newton",
          "BJ Penn",
          "Pat Miletich",
          "Matt Serra",
          "Belal Muhammad",
          "Jack Della Maddalena"
        ]
      },
      {
        "prompt": "Name another fighter on the undisputed UFC welterweight champions list.",
        "answers": [
          "Georges St-Pierre",
          "Matt Hughes",
          "Kamaru Usman",
          "Islam Makhachev",
          "Leon Edwards",
          "Robbie Lawler",
          "Tyron Woodley",
          "BJ Penn"
        ],
        "alsoAcceptedAnswers": [
          "Johny Hendricks",
          "Carlos Newton",
          "Pat Miletich",
          "Matt Serra",
          "Belal Muhammad",
          "Jack Della Maddalena"
        ]
      }
    ],
    "answers": [
      {
        "name": "Georges St-Pierre",
        "aliases": [
          "GSP",
          "Georges St Pierre",
          "St Pierre"
        ]
      },
      {
        "name": "Matt Hughes",
        "aliases": [
          "Hughes"
        ]
      },
      {
        "name": "Kamaru Usman",
        "aliases": [
          "Usman"
        ]
      },
      {
        "name": "Tyron Woodley",
        "aliases": [
          "Woodley"
        ]
      },
      {
        "name": "Leon Edwards",
        "aliases": [
          "Leon"
        ]
      },
      {
        "name": "Robbie Lawler",
        "aliases": [
          "Ruthless"
        ]
      },
      {
        "name": "Johny Hendricks",
        "aliases": [
          "Bigg Rigg"
        ]
      },
      "Carlos Newton"
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "BJ Penn",
        "aliases": [
          "BJ"
        ]
      },
      "Pat Miletich",
      {
        "name": "Matt Serra",
        "aliases": [
          "Serra"
        ]
      },
      {
        "name": "Belal Muhammad",
        "aliases": [
          "Belal"
        ]
      },
      {
        "name": "Jack Della Maddalena",
        "aliases": [
          "JDM",
          "Della Maddalena"
        ]
      },
      {
        "name": "Islam Makhachev",
        "aliases": [
          "Islam"
        ]
      }
    ]
  },
  {
    "category": "champions",
    "entityKind": "person",
    "collisionGroup": "middleweights",
    "prompts": [
      {
        "prompt": "Name an undisputed UFC middleweight champion from any era.",
        "answers": [
          "Anderson Silva",
          "Israel Adesanya",
          "Chris Weidman",
          "Sean Strickland",
          "Dricus du Plessis",
          "Khamzat Chimaev",
          "Robert Whittaker",
          "Michael Bisping"
        ],
        "alsoAcceptedAnswers": [
          "Alex Pereira",
          "Luke Rockhold",
          "Rich Franklin",
          "Evan Tanner",
          "Dave Menne",
          "Murilo Bustamante",
          "Georges St-Pierre"
        ]
      },
      {
        "prompt": "Name a fighter who has held the undisputed UFC middleweight title.",
        "answers": [
          "Anderson Silva",
          "Israel Adesanya",
          "Chris Weidman",
          "Sean Strickland",
          "Dricus du Plessis",
          "Khamzat Chimaev",
          "Robert Whittaker",
          "Alex Pereira"
        ],
        "alsoAcceptedAnswers": [
          "Michael Bisping",
          "Luke Rockhold",
          "Rich Franklin",
          "Evan Tanner",
          "Dave Menne",
          "Murilo Bustamante",
          "Georges St-Pierre"
        ]
      },
      {
        "prompt": "Name a former or current undisputed UFC 185-pound champion.",
        "answers": [
          "Sean Strickland",
          "Khamzat Chimaev",
          "Dricus du Plessis",
          "Israel Adesanya",
          "Alex Pereira",
          "Robert Whittaker",
          "Chris Weidman",
          "Anderson Silva"
        ],
        "alsoAcceptedAnswers": [
          "Michael Bisping",
          "Luke Rockhold",
          "Rich Franklin",
          "Evan Tanner",
          "Dave Menne",
          "Murilo Bustamante",
          "Georges St-Pierre"
        ]
      },
      {
        "prompt": "Name a middleweight whose résumé includes undisputed UFC gold.",
        "answers": [
          "Anderson Silva",
          "Israel Adesanya",
          "Chris Weidman",
          "Robert Whittaker",
          "Michael Bisping",
          "Alex Pereira",
          "Sean Strickland",
          "Dricus du Plessis"
        ],
        "alsoAcceptedAnswers": [
          "Luke Rockhold",
          "Rich Franklin",
          "Evan Tanner",
          "Dave Menne",
          "Murilo Bustamante",
          "Georges St-Pierre",
          "Khamzat Chimaev"
        ]
      },
      {
        "prompt": "Name another fighter on the undisputed UFC middleweight champions list.",
        "answers": [
          "Anderson Silva",
          "Israel Adesanya",
          "Chris Weidman",
          "Robert Whittaker",
          "Sean Strickland",
          "Dricus du Plessis",
          "Khamzat Chimaev",
          "Michael Bisping"
        ],
        "alsoAcceptedAnswers": [
          "Alex Pereira",
          "Luke Rockhold",
          "Rich Franklin",
          "Evan Tanner",
          "Dave Menne",
          "Murilo Bustamante",
          "Georges St-Pierre"
        ]
      }
    ],
    "answers": [
      {
        "name": "Anderson Silva",
        "aliases": [
          "The Spider"
        ]
      },
      {
        "name": "Israel Adesanya",
        "aliases": [
          "Izzy",
          "Stylebender"
        ]
      },
      {
        "name": "Chris Weidman",
        "aliases": [
          "Weidman"
        ]
      },
      {
        "name": "Michael Bisping",
        "aliases": [
          "Bisping"
        ]
      },
      {
        "name": "Robert Whittaker",
        "aliases": [
          "Whittaker",
          "Bobby Knuckles",
          "The Reaper"
        ]
      },
      {
        "name": "Alex Pereira",
        "aliases": [
          "Poatan"
        ]
      },
      {
        "name": "Luke Rockhold",
        "aliases": [
          "Rockhold"
        ]
      },
      {
        "name": "Sean Strickland",
        "aliases": [
          "Strickland"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      "Rich Franklin",
      "Evan Tanner",
      "Dave Menne",
      "Murilo Bustamante",
      {
        "name": "Georges St-Pierre",
        "aliases": [
          "GSP",
          "Georges St Pierre",
          "St Pierre"
        ]
      },
      {
        "name": "Dricus du Plessis",
        "aliases": [
          "DDP",
          "Dricus"
        ]
      },
      {
        "name": "Khamzat Chimaev",
        "aliases": [
          "Khamzat",
          "Borz"
        ]
      }
    ]
  },
  {
    "category": "champions",
    "entityKind": "person",
    "collisionGroup": "heavyweights",
    "prompts": [
      {
        "prompt": "Name an undisputed UFC heavyweight champion from any era.",
        "answers": [
          "Stipe Miocic",
          "Cain Velasquez",
          "Francis Ngannou",
          "Daniel Cormier",
          "Randy Couture",
          "Junior dos Santos",
          "Brock Lesnar",
          "Jon Jones"
        ],
        "alsoAcceptedAnswers": [
          "Fabricio Werdum",
          "Frank Mir",
          "Andrei Arlovski",
          "Tim Sylvia",
          "Josh Barnett",
          "Tom Aspinall",
          "Bas Rutten",
          "Kevin Randleman",
          "Mark Coleman",
          "Ricco Rodriguez",
          "Maurice Smith"
        ]
      },
      {
        "prompt": "Name a fighter who has held the undisputed UFC heavyweight title.",
        "answers": [
          "Stipe Miocic",
          "Cain Velasquez",
          "Francis Ngannou",
          "Daniel Cormier",
          "Randy Couture",
          "Junior dos Santos",
          "Brock Lesnar",
          "Tom Aspinall"
        ],
        "alsoAcceptedAnswers": [
          "Fabricio Werdum",
          "Frank Mir",
          "Andrei Arlovski",
          "Tim Sylvia",
          "Josh Barnett",
          "Bas Rutten",
          "Kevin Randleman",
          "Mark Coleman",
          "Ricco Rodriguez",
          "Maurice Smith",
          "Jon Jones"
        ]
      },
      {
        "prompt": "Name a former or current undisputed UFC heavyweight champion.",
        "answers": [
          "Tom Aspinall",
          "Jon Jones",
          "Francis Ngannou",
          "Stipe Miocic",
          "Daniel Cormier",
          "Cain Velasquez",
          "Fabricio Werdum",
          "Junior dos Santos"
        ],
        "alsoAcceptedAnswers": [
          "Randy Couture",
          "Brock Lesnar",
          "Frank Mir",
          "Andrei Arlovski",
          "Tim Sylvia",
          "Josh Barnett",
          "Bas Rutten",
          "Kevin Randleman",
          "Mark Coleman",
          "Ricco Rodriguez",
          "Maurice Smith"
        ]
      },
      {
        "prompt": "Name a heavyweight whose résumé includes undisputed UFC gold.",
        "answers": [
          "Stipe Miocic",
          "Cain Velasquez",
          "Francis Ngannou",
          "Daniel Cormier",
          "Randy Couture",
          "Brock Lesnar",
          "Jon Jones",
          "Tom Aspinall"
        ],
        "alsoAcceptedAnswers": [
          "Junior dos Santos",
          "Fabricio Werdum",
          "Frank Mir",
          "Andrei Arlovski",
          "Tim Sylvia",
          "Josh Barnett",
          "Bas Rutten",
          "Kevin Randleman",
          "Mark Coleman",
          "Ricco Rodriguez",
          "Maurice Smith"
        ]
      },
      {
        "prompt": "Name another fighter on the undisputed UFC heavyweight champions list.",
        "answers": [
          "Stipe Miocic",
          "Randy Couture",
          "Cain Velasquez",
          "Francis Ngannou",
          "Daniel Cormier",
          "Jon Jones",
          "Tom Aspinall",
          "Brock Lesnar"
        ],
        "alsoAcceptedAnswers": [
          "Junior dos Santos",
          "Fabricio Werdum",
          "Frank Mir",
          "Andrei Arlovski",
          "Tim Sylvia",
          "Josh Barnett",
          "Bas Rutten",
          "Kevin Randleman",
          "Mark Coleman",
          "Ricco Rodriguez",
          "Maurice Smith"
        ]
      }
    ],
    "answers": [
      {
        "name": "Stipe Miocic",
        "aliases": [
          "Stipe"
        ]
      },
      {
        "name": "Cain Velasquez",
        "aliases": [
          "Cain"
        ]
      },
      {
        "name": "Francis Ngannou",
        "aliases": [
          "Ngannou"
        ]
      },
      {
        "name": "Daniel Cormier",
        "aliases": [
          "DC"
        ]
      },
      {
        "name": "Randy Couture",
        "aliases": [
          "Couture"
        ]
      },
      {
        "name": "Junior dos Santos",
        "aliases": [
          "JDS",
          "Dos Santos"
        ]
      },
      {
        "name": "Brock Lesnar",
        "aliases": [
          "Lesnar"
        ]
      },
      {
        "name": "Fabricio Werdum",
        "aliases": [
          "Werdum"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Frank Mir",
        "aliases": [
          "Mir"
        ]
      },
      {
        "name": "Andrei Arlovski",
        "aliases": [
          "Arlovski"
        ]
      },
      {
        "name": "Tim Sylvia",
        "aliases": [
          "Sylvia"
        ]
      },
      {
        "name": "Josh Barnett",
        "aliases": [
          "Barnett"
        ]
      },
      {
        "name": "Tom Aspinall",
        "aliases": [
          "Aspinall"
        ]
      },
      {
        "name": "Bas Rutten",
        "aliases": [
          "Rutten"
        ]
      },
      {
        "name": "Kevin Randleman",
        "aliases": [
          "Randleman"
        ]
      },
      {
        "name": "Mark Coleman",
        "aliases": [
          "Coleman"
        ]
      },
      {
        "name": "Ricco Rodriguez",
        "aliases": [
          "Ricco"
        ]
      },
      {
        "name": "Maurice Smith",
        "aliases": [
          "Smith"
        ]
      },
      {
        "name": "Jon Jones",
        "aliases": [
          "Jones",
          "Bones"
        ]
      }
    ]
  },
  {
    "category": "champions",
    "entityKind": "person",
    "collisionGroup": "multi-division",
    "prompts": [
      {
        "prompt": "Name a UFC fighter who won titles in two weight classes.",
        "answers": [
          "Conor McGregor",
          "Daniel Cormier",
          "Amanda Nunes",
          "Henry Cejudo",
          "BJ Penn",
          "Randy Couture",
          "Jon Jones",
          "Alex Pereira"
        ],
        "alsoAcceptedAnswers": [
          "Georges St-Pierre",
          "Ilia Topuria",
          "Islam Makhachev"
        ]
      },
      {
        "prompt": "Name a fighter with UFC championships in two divisions.",
        "answers": [
          "Conor McGregor",
          "Daniel Cormier",
          "Amanda Nunes",
          "Henry Cejudo",
          "Jon Jones",
          "Alex Pereira",
          "Ilia Topuria",
          "Islam Makhachev"
        ],
        "alsoAcceptedAnswers": [
          "BJ Penn",
          "Randy Couture",
          "Georges St-Pierre"
        ]
      },
      {
        "prompt": "Name a UFC champion who proved capable of winning gold at multiple weights.",
        "answers": [
          "Amanda Nunes",
          "Daniel Cormier",
          "Henry Cejudo",
          "Jon Jones",
          "Alex Pereira",
          "Conor McGregor",
          "Ilia Topuria",
          "Islam Makhachev"
        ],
        "alsoAcceptedAnswers": [
          "BJ Penn",
          "Randy Couture",
          "Georges St-Pierre"
        ]
      },
      {
        "prompt": "Name a fighter whose UFC résumé includes titles in two weight classes.",
        "answers": [
          "Conor McGregor",
          "Daniel Cormier",
          "Amanda Nunes",
          "Henry Cejudo",
          "Jon Jones",
          "Alex Pereira",
          "Georges St-Pierre",
          "Islam Makhachev"
        ],
        "alsoAcceptedAnswers": [
          "BJ Penn",
          "Randy Couture",
          "Ilia Topuria"
        ]
      },
      {
        "prompt": "Name a multi-division UFC champion.",
        "answers": [
          "Conor McGregor",
          "Daniel Cormier",
          "Amanda Nunes",
          "Henry Cejudo",
          "Jon Jones",
          "Alex Pereira",
          "Ilia Topuria",
          "Islam Makhachev"
        ],
        "alsoAcceptedAnswers": [
          "BJ Penn",
          "Randy Couture",
          "Georges St-Pierre"
        ]
      }
    ],
    "answers": [
      {
        "name": "Conor McGregor",
        "aliases": [
          "Conor"
        ]
      },
      {
        "name": "Daniel Cormier",
        "aliases": [
          "DC"
        ]
      },
      {
        "name": "Amanda Nunes",
        "aliases": [
          "Nunes",
          "The Lioness"
        ]
      },
      {
        "name": "Henry Cejudo",
        "aliases": [
          "Cejudo",
          "Triple C"
        ]
      },
      {
        "name": "BJ Penn",
        "aliases": [
          "BJ"
        ]
      },
      {
        "name": "Randy Couture",
        "aliases": [
          "Couture"
        ]
      },
      {
        "name": "Jon Jones",
        "aliases": [
          "Jones",
          "Bones"
        ]
      },
      {
        "name": "Alex Pereira",
        "aliases": [
          "Poatan"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Georges St-Pierre",
        "aliases": [
          "GSP",
          "Georges St Pierre",
          "St Pierre"
        ]
      },
      {
        "name": "Ilia Topuria",
        "aliases": [
          "Topuria"
        ]
      },
      {
        "name": "Islam Makhachev",
        "aliases": [
          "Islam"
        ]
      }
    ]
  },
  {
    "category": "fighters",
    "entityKind": "person",
    "collisionGroup": "knockouts",
    "prompts": [
      {
        "prompt": "Name a UFC fighter known for knockout power.",
        "answers": [
          "Francis Ngannou",
          "Alex Pereira",
          "Derrick Lewis",
          "Chuck Liddell",
          "Anthony Johnson",
          "Dan Henderson",
          "Mark Hunt",
          "Jiri Prochazka"
        ],
        "alsoAcceptedAnswers": [
          "Wanderlei Silva",
          "Justin Gaethje",
          "Mirko Cro Cop",
          "Quinton Jackson",
          "Sergei Pavlovich",
          "Tai Tuivasa"
        ]
      },
      {
        "prompt": "Name a fighter whose punches can end a fight instantly.",
        "answers": [
          "Francis Ngannou",
          "Alex Pereira",
          "Derrick Lewis",
          "Anthony Johnson",
          "Dan Henderson",
          "Jiri Prochazka",
          "Mark Hunt",
          "Tai Tuivasa"
        ],
        "alsoAcceptedAnswers": [
          "Chuck Liddell",
          "Wanderlei Silva",
          "Justin Gaethje",
          "Mirko Cro Cop",
          "Quinton Jackson",
          "Sergei Pavlovich"
        ]
      },
      {
        "prompt": "Name a UFC star fans associate with big knockouts.",
        "answers": [
          "Francis Ngannou",
          "Alex Pereira",
          "Derrick Lewis",
          "Chuck Liddell",
          "Jiri Prochazka",
          "Justin Gaethje",
          "Dan Henderson",
          "Anthony Johnson"
        ],
        "alsoAcceptedAnswers": [
          "Wanderlei Silva",
          "Mark Hunt",
          "Mirko Cro Cop",
          "Quinton Jackson",
          "Sergei Pavlovich",
          "Tai Tuivasa"
        ]
      },
      {
        "prompt": "Name a fighter you would never want to trade shots with.",
        "answers": [
          "Alex Pereira",
          "Francis Ngannou",
          "Justin Gaethje",
          "Chuck Liddell",
          "Jiri Prochazka",
          "Wanderlei Silva",
          "Dan Henderson",
          "Mark Hunt"
        ],
        "alsoAcceptedAnswers": [
          "Derrick Lewis",
          "Anthony Johnson",
          "Mirko Cro Cop",
          "Quinton Jackson",
          "Sergei Pavlovich",
          "Tai Tuivasa"
        ]
      },
      {
        "prompt": "Name a UFC knockout artist almost every MMA fan knows.",
        "answers": [
          "Chuck Liddell",
          "Francis Ngannou",
          "Alex Pereira",
          "Derrick Lewis",
          "Dan Henderson",
          "Anthony Johnson",
          "Justin Gaethje",
          "Wanderlei Silva"
        ],
        "alsoAcceptedAnswers": [
          "Jiri Prochazka",
          "Mark Hunt",
          "Mirko Cro Cop",
          "Quinton Jackson",
          "Sergei Pavlovich",
          "Tai Tuivasa"
        ]
      }
    ],
    "answers": [
      {
        "name": "Francis Ngannou",
        "aliases": [
          "Ngannou"
        ]
      },
      {
        "name": "Alex Pereira",
        "aliases": [
          "Poatan"
        ]
      },
      {
        "name": "Derrick Lewis",
        "aliases": [
          "The Black Beast"
        ]
      },
      {
        "name": "Chuck Liddell",
        "aliases": [
          "The Iceman"
        ]
      },
      {
        "name": "Dan Henderson",
        "aliases": [
          "Hendo"
        ]
      },
      {
        "name": "Wanderlei Silva",
        "aliases": [
          "Wanderlei"
        ]
      },
      {
        "name": "Jiri Prochazka",
        "aliases": [
          "Jiri",
          "Prochazka"
        ]
      },
      {
        "name": "Justin Gaethje",
        "aliases": [
          "Gaethje"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Anthony Johnson",
        "aliases": [
          "Rumble"
        ]
      },
      {
        "name": "Mark Hunt",
        "aliases": [
          "Hunt"
        ]
      },
      {
        "name": "Mirko Cro Cop",
        "aliases": [
          "Cro Cop"
        ]
      },
      {
        "name": "Quinton Jackson",
        "aliases": [
          "Rampage"
        ]
      },
      "Sergei Pavlovich",
      {
        "name": "Tai Tuivasa",
        "aliases": [
          "Bam Bam"
        ]
      }
    ]
  },
  {
    "category": "fighters",
    "entityKind": "person",
    "collisionGroup": "submissions",
    "prompts": [
      {
        "prompt": "Name a UFC fighter known for submissions.",
        "answers": [
          "Charles Oliveira",
          "Demian Maia",
          "Frank Mir",
          "Royce Gracie",
          "BJ Penn",
          "Nate Diaz",
          "Brian Ortega",
          "Mackenzie Dern"
        ],
        "alsoAcceptedAnswers": [
          "Rodolfo Vieira",
          "Tony Ferguson",
          "Khabib Nurmagomedov",
          "Jim Miller",
          "Islam Makhachev",
          "Fabricio Werdum"
        ]
      },
      {
        "prompt": "Name a fighter whose ground game can end a fight quickly.",
        "answers": [
          "Charles Oliveira",
          "Islam Makhachev",
          "Khabib Nurmagomedov",
          "Demian Maia",
          "Frank Mir",
          "Brian Ortega",
          "Fabricio Werdum",
          "BJ Penn"
        ],
        "alsoAcceptedAnswers": [
          "Nate Diaz",
          "Mackenzie Dern",
          "Rodolfo Vieira",
          "Tony Ferguson",
          "Jim Miller",
          "Royce Gracie"
        ]
      },
      {
        "prompt": "Name a UFC star fans associate with dangerous submissions.",
        "answers": [
          "Charles Oliveira",
          "Demian Maia",
          "Brian Ortega",
          "Frank Mir",
          "Mackenzie Dern",
          "Islam Makhachev",
          "BJ Penn",
          "Fabricio Werdum"
        ],
        "alsoAcceptedAnswers": [
          "Nate Diaz",
          "Rodolfo Vieira",
          "Tony Ferguson",
          "Khabib Nurmagomedov",
          "Jim Miller",
          "Royce Gracie"
        ]
      },
      {
        "prompt": "Name a fighter you would hate to grapple with.",
        "answers": [
          "Demian Maia",
          "Khabib Nurmagomedov",
          "Islam Makhachev",
          "Charles Oliveira",
          "Rodolfo Vieira",
          "Fabricio Werdum",
          "Frank Mir",
          "Mackenzie Dern"
        ],
        "alsoAcceptedAnswers": [
          "BJ Penn",
          "Nate Diaz",
          "Tony Ferguson",
          "Jim Miller",
          "Brian Ortega",
          "Royce Gracie"
        ]
      },
      {
        "prompt": "Name a submission specialist serious MMA fans know.",
        "answers": [
          "Charles Oliveira",
          "Demian Maia",
          "Frank Mir",
          "Royce Gracie",
          "Nate Diaz",
          "BJ Penn",
          "Brian Ortega",
          "Tony Ferguson"
        ],
        "alsoAcceptedAnswers": [
          "Mackenzie Dern",
          "Rodolfo Vieira",
          "Khabib Nurmagomedov",
          "Jim Miller",
          "Islam Makhachev",
          "Fabricio Werdum"
        ]
      }
    ],
    "answers": [
      {
        "name": "Charles Oliveira",
        "aliases": [
          "Do Bronx"
        ]
      },
      {
        "name": "Demian Maia",
        "aliases": [
          "Maia"
        ]
      },
      {
        "name": "Frank Mir",
        "aliases": [
          "Mir"
        ]
      },
      {
        "name": "BJ Penn",
        "aliases": [
          "BJ"
        ]
      },
      {
        "name": "Nate Diaz",
        "aliases": [
          "Nate"
        ]
      },
      {
        "name": "Mackenzie Dern",
        "aliases": [
          "Dern"
        ]
      },
      {
        "name": "Rodolfo Vieira",
        "aliases": [
          "Vieira"
        ]
      },
      {
        "name": "Tony Ferguson",
        "aliases": [
          "El Cucuy"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Khabib Nurmagomedov",
        "aliases": [
          "Khabib"
        ]
      },
      {
        "name": "Jim Miller",
        "aliases": [
          "Miller"
        ]
      },
      {
        "name": "Islam Makhachev",
        "aliases": [
          "Islam"
        ]
      },
      {
        "name": "Brian Ortega",
        "aliases": [
          "T-City",
          "Ortega"
        ]
      },
      {
        "name": "Royce Gracie",
        "aliases": [
          "Royce"
        ]
      },
      {
        "name": "Fabricio Werdum",
        "aliases": [
          "Werdum"
        ]
      }
    ]
  },
  {
    "category": "fighters",
    "entityKind": "person",
    "collisionGroup": "wrestling",
    "prompts": [
      {
        "prompt": "Name a UFC fighter known for wrestling.",
        "answers": [
          "Khabib Nurmagomedov",
          "Georges St-Pierre",
          "Daniel Cormier",
          "Kamaru Usman",
          "Islam Makhachev",
          "Matt Hughes",
          "Randy Couture",
          "Henry Cejudo"
        ],
        "alsoAcceptedAnswers": [
          "Merab Dvalishvili",
          "Chael Sonnen",
          "Frankie Edgar",
          "Josh Koscheck",
          "Jon Fitch",
          "Chad Mendes"
        ]
      },
      {
        "prompt": "Name a fighter whose takedowns became part of his identity.",
        "answers": [
          "Georges St-Pierre",
          "Khabib Nurmagomedov",
          "Kamaru Usman",
          "Daniel Cormier",
          "Islam Makhachev",
          "Merab Dvalishvili",
          "Matt Hughes",
          "Chad Mendes"
        ],
        "alsoAcceptedAnswers": [
          "Henry Cejudo",
          "Chael Sonnen",
          "Randy Couture",
          "Frankie Edgar",
          "Josh Koscheck",
          "Jon Fitch"
        ]
      },
      {
        "prompt": "Name a UFC star associated with relentless grappling pressure.",
        "answers": [
          "Khabib Nurmagomedov",
          "Merab Dvalishvili",
          "Islam Makhachev",
          "Kamaru Usman",
          "Daniel Cormier",
          "Georges St-Pierre",
          "Chael Sonnen",
          "Matt Hughes"
        ],
        "alsoAcceptedAnswers": [
          "Henry Cejudo",
          "Randy Couture",
          "Frankie Edgar",
          "Josh Koscheck",
          "Jon Fitch",
          "Chad Mendes"
        ]
      },
      {
        "prompt": "Name a fighter opponents hated having on top of them.",
        "answers": [
          "Khabib Nurmagomedov",
          "Daniel Cormier",
          "Islam Makhachev",
          "Kamaru Usman",
          "Matt Hughes",
          "Randy Couture",
          "Georges St-Pierre",
          "Jon Fitch"
        ],
        "alsoAcceptedAnswers": [
          "Henry Cejudo",
          "Merab Dvalishvili",
          "Chael Sonnen",
          "Frankie Edgar",
          "Josh Koscheck",
          "Chad Mendes"
        ]
      },
      {
        "prompt": "Name a wrestler who turned elite grappling into UFC success.",
        "answers": [
          "Khabib Nurmagomedov",
          "Georges St-Pierre",
          "Daniel Cormier",
          "Henry Cejudo",
          "Randy Couture",
          "Matt Hughes",
          "Kamaru Usman",
          "Islam Makhachev"
        ],
        "alsoAcceptedAnswers": [
          "Merab Dvalishvili",
          "Chael Sonnen",
          "Frankie Edgar",
          "Josh Koscheck",
          "Jon Fitch",
          "Chad Mendes"
        ]
      }
    ],
    "answers": [
      {
        "name": "Khabib Nurmagomedov",
        "aliases": [
          "Khabib"
        ]
      },
      {
        "name": "Georges St-Pierre",
        "aliases": [
          "GSP",
          "Georges St Pierre",
          "St Pierre"
        ]
      },
      {
        "name": "Daniel Cormier",
        "aliases": [
          "DC"
        ]
      },
      {
        "name": "Kamaru Usman",
        "aliases": [
          "Usman"
        ]
      },
      {
        "name": "Islam Makhachev",
        "aliases": [
          "Islam"
        ]
      },
      {
        "name": "Henry Cejudo",
        "aliases": [
          "Cejudo",
          "Triple C"
        ]
      },
      {
        "name": "Merab Dvalishvili",
        "aliases": [
          "Merab"
        ]
      },
      {
        "name": "Chael Sonnen",
        "aliases": [
          "Chael"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Matt Hughes",
        "aliases": [
          "Hughes"
        ]
      },
      {
        "name": "Randy Couture",
        "aliases": [
          "Couture"
        ]
      },
      "Frankie Edgar",
      "Josh Koscheck",
      "Jon Fitch",
      "Chad Mendes"
    ]
  },
  {
    "category": "fighters",
    "entityKind": "person",
    "collisionGroup": "striking",
    "prompts": [
      {
        "prompt": "Name a UFC fighter known for elite striking.",
        "answers": [
          "Anderson Silva",
          "Israel Adesanya",
          "Alex Pereira",
          "Max Holloway",
          "Jose Aldo",
          "Stephen Thompson",
          "Joanna Jedrzejczyk",
          "Valentina Shevchenko"
        ],
        "alsoAcceptedAnswers": [
          "Conor McGregor",
          "Dustin Poirier",
          "Alexander Volkanovski",
          "Justin Gaethje",
          "Petr Yan",
          "Ilia Topuria"
        ]
      },
      {
        "prompt": "Name a fighter whose stand-up skill became part of his reputation.",
        "answers": [
          "Anderson Silva",
          "Israel Adesanya",
          "Max Holloway",
          "Jose Aldo",
          "Conor McGregor",
          "Stephen Thompson",
          "Joanna Jedrzejczyk",
          "Alexander Volkanovski"
        ],
        "alsoAcceptedAnswers": [
          "Alex Pereira",
          "Dustin Poirier",
          "Justin Gaethje",
          "Valentina Shevchenko",
          "Petr Yan",
          "Ilia Topuria"
        ]
      },
      {
        "prompt": "Name a UFC star you would pick for a striking showcase.",
        "answers": [
          "Stephen Thompson",
          "Israel Adesanya",
          "Anderson Silva",
          "Valentina Shevchenko",
          "Joanna Jedrzejczyk",
          "Alexander Volkanovski",
          "Jose Aldo",
          "Alex Pereira"
        ],
        "alsoAcceptedAnswers": [
          "Max Holloway",
          "Conor McGregor",
          "Dustin Poirier",
          "Justin Gaethje",
          "Petr Yan",
          "Ilia Topuria"
        ]
      },
      {
        "prompt": "Name a fighter opponents had to respect at kickboxing range.",
        "answers": [
          "Alex Pereira",
          "Israel Adesanya",
          "Stephen Thompson",
          "Jose Aldo",
          "Valentina Shevchenko",
          "Joanna Jedrzejczyk",
          "Anderson Silva",
          "Petr Yan"
        ],
        "alsoAcceptedAnswers": [
          "Max Holloway",
          "Conor McGregor",
          "Dustin Poirier",
          "Alexander Volkanovski",
          "Justin Gaethje",
          "Ilia Topuria"
        ]
      },
      {
        "prompt": "Name a striker whose UFC style looked especially polished.",
        "answers": [
          "Anderson Silva",
          "Israel Adesanya",
          "Stephen Thompson",
          "Joanna Jedrzejczyk",
          "Jose Aldo",
          "Max Holloway",
          "Valentina Shevchenko",
          "Alexander Volkanovski"
        ],
        "alsoAcceptedAnswers": [
          "Alex Pereira",
          "Conor McGregor",
          "Dustin Poirier",
          "Justin Gaethje",
          "Petr Yan",
          "Ilia Topuria"
        ]
      }
    ],
    "answers": [
      {
        "name": "Anderson Silva",
        "aliases": [
          "The Spider"
        ]
      },
      {
        "name": "Israel Adesanya",
        "aliases": [
          "Izzy",
          "Stylebender"
        ]
      },
      {
        "name": "Alex Pereira",
        "aliases": [
          "Poatan"
        ]
      },
      {
        "name": "Max Holloway",
        "aliases": [
          "Blessed"
        ]
      },
      {
        "name": "Jose Aldo",
        "aliases": [
          "Aldo"
        ]
      },
      {
        "name": "Conor McGregor",
        "aliases": [
          "Conor"
        ]
      },
      {
        "name": "Stephen Thompson",
        "aliases": [
          "Wonderboy"
        ]
      },
      {
        "name": "Joanna Jedrzejczyk",
        "aliases": [
          "Joanna"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      "Dustin Poirier",
      {
        "name": "Alexander Volkanovski",
        "aliases": [
          "Volk"
        ]
      },
      {
        "name": "Justin Gaethje",
        "aliases": [
          "Gaethje"
        ]
      },
      {
        "name": "Valentina Shevchenko",
        "aliases": [
          "Bullet"
        ]
      },
      {
        "name": "Petr Yan",
        "aliases": [
          "Yan"
        ]
      },
      {
        "name": "Ilia Topuria",
        "aliases": [
          "Topuria"
        ]
      }
    ]
  }
] as const);
