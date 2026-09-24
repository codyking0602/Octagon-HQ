import { expandSportsFeudFamilies } from "./sportsFeudAuthoredHelpers";

export const UFC_SPORTS_FEUD_FAST_1 = expandSportsFeudFamilies("ufc-fast1", [
  {
    "category": "divisions",
    "entityKind": "other",
    "collisionGroup": "divisions",
    "prompts": [
      "Name a UFC weight class.",
      "Name a division you can see on a UFC card.",
      "Name a UFC division with famous champions.",
      "Name a weight class MMA fans debate constantly.",
      "Name a division a UFC fighter can compete in."
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
      "Name an undisputed UFC lightweight champion from any era.",
      "Name a fighter who has held the undisputed UFC lightweight title.",
      "Name a former or current undisputed UFC 155-pound champion.",
      "Name a lightweight whose résumé includes undisputed UFC gold.",
      "Name another fighter on the undisputed UFC lightweight champions list."
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
      {
        "name": "Frankie Edgar"
      },
      {
        "name": "Benson Henderson",
        "aliases": [
          "Bendo"
        ]
      },
      {
        "name": "Eddie Alvarez"
      },
      {
        "name": "Rafael dos Anjos",
        "aliases": [
          "RDA"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Jens Pulver"
      },
      {
        "name": "Sean Sherk"
      },
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
      "Name an undisputed UFC welterweight champion from any era.",
      "Name a fighter who has held the undisputed UFC welterweight title.",
      "Name a former or current undisputed UFC 170-pound champion.",
      "Name a welterweight whose résumé includes undisputed UFC gold.",
      "Name another fighter on the undisputed UFC welterweight champions list."
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
      {
        "name": "Carlos Newton"
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "BJ Penn",
        "aliases": [
          "BJ"
        ]
      },
      {
        "name": "Pat Miletich"
      },
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
      "Name an undisputed UFC middleweight champion from any era.",
      "Name a fighter who has held the undisputed UFC middleweight title.",
      "Name a former or current undisputed UFC 185-pound champion.",
      "Name a middleweight whose résumé includes undisputed UFC gold.",
      "Name another fighter on the undisputed UFC middleweight champions list."
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
      {
        "name": "Rich Franklin"
      },
      {
        "name": "Evan Tanner"
      },
      {
        "name": "Dave Menne"
      },
      {
        "name": "Murilo Bustamante"
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
      "Name an undisputed UFC heavyweight champion from any era.",
      "Name a fighter who has held the undisputed UFC heavyweight title.",
      "Name a former or current undisputed UFC heavyweight champion.",
      "Name a heavyweight whose résumé includes undisputed UFC gold.",
      "Name another fighter on the undisputed UFC heavyweight champions list."
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
      },
      {
        "name": "Ciryl Gane",
        "aliases": [
          "Bon Gamin"
        ]
      }
    ]
  },
  {
    "category": "champions",
    "entityKind": "person",
    "collisionGroup": "multi-division",
    "prompts": [
      "Name a UFC fighter who won titles in two weight classes.",
      "Name a fighter with UFC championships in two divisions.",
      "Name a UFC champion who proved capable of winning gold at multiple weights.",
      "Name a fighter whose UFC résumé includes titles in two weight classes.",
      "Name a multi-division UFC champion."
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
          "Dan Henderson",
          "Wanderlei Silva",
          "Jiri Prochazka",
          "Justin Gaethje"
        ],
        "alsoAcceptedAnswers": [
          "Anthony Johnson",
          "Mark Hunt",
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
          "Chuck Liddell",
          "Dan Henderson",
          "Wanderlei Silva",
          "Jiri Prochazka"
        ],
        "alsoAcceptedAnswers": [
          "Justin Gaethje",
          "Mark Hunt",
          "Mirko Cro Cop",
          "Quinton Jackson",
          "Sergei Pavlovich",
          "Tai Tuivasa"
        ]
      },
      {
        "prompt": "Name a UFC star fans associate with big knockouts.",
        "answers": [
          "Francis Ngannou",
          "Alex Pereira",
          "Chuck Liddell",
          "Derrick Lewis",
          "Dan Henderson",
          "Wanderlei Silva",
          "Jiri Prochazka",
          "Justin Gaethje"
        ],
        "alsoAcceptedAnswers": [
          "Anthony Johnson",
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
          "Francis Ngannou",
          "Alex Pereira",
          "Justin Gaethje",
          "Chuck Liddell",
          "Derrick Lewis",
          "Dan Henderson",
          "Wanderlei Silva",
          "Jiri Prochazka"
        ],
        "alsoAcceptedAnswers": [
          "Anthony Johnson",
          "Mark Hunt",
          "Mirko Cro Cop",
          "Quinton Jackson",
          "Sergei Pavlovich",
          "Tai Tuivasa"
        ]
      },
      {
        "prompt": "Name a UFC knockout artist almost every MMA fan knows.",
        "answers": [
          "Francis Ngannou",
          "Alex Pereira",
          "Chuck Liddell",
          "Derrick Lewis",
          "Dan Henderson",
          "Wanderlei Silva",
          "Jiri Prochazka",
          "Justin Gaethje"
        ],
        "alsoAcceptedAnswers": [
          "Anthony Johnson",
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
      {
        "name": "Sergei Pavlovich"
      },
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
          "BJ Penn",
          "Nate Diaz",
          "Mackenzie Dern",
          "Rodolfo Vieira",
          "Tony Ferguson"
        ],
        "alsoAcceptedAnswers": [
          "Khabib Nurmagomedov",
          "Jim Miller",
          "Islam Makhachev",
          "Brian Ortega",
          "Royce Gracie",
          "Fabricio Werdum"
        ]
      },
      {
        "prompt": "Name a fighter whose ground game can end a fight quickly.",
        "answers": [
          "Charles Oliveira",
          "Frank Mir",
          "Brian Ortega",
          "Mackenzie Dern",
          "Demian Maia",
          "BJ Penn",
          "Nate Diaz",
          "Rodolfo Vieira"
        ],
        "alsoAcceptedAnswers": [
          "Tony Ferguson",
          "Khabib Nurmagomedov",
          "Jim Miller",
          "Islam Makhachev",
          "Royce Gracie",
          "Fabricio Werdum"
        ]
      },
      {
        "prompt": "Name a UFC star fans associate with dangerous submissions.",
        "answers": [
          "Charles Oliveira",
          "Demian Maia",
          "Islam Makhachev",
          "Frank Mir",
          "BJ Penn",
          "Nate Diaz",
          "Mackenzie Dern",
          "Rodolfo Vieira"
        ],
        "alsoAcceptedAnswers": [
          "Tony Ferguson",
          "Khabib Nurmagomedov",
          "Jim Miller",
          "Brian Ortega",
          "Royce Gracie",
          "Fabricio Werdum"
        ]
      },
      {
        "prompt": "Name a fighter you would hate to grapple with.",
        "answers": [
          "Khabib Nurmagomedov",
          "Islam Makhachev",
          "Demian Maia",
          "Charles Oliveira",
          "Frank Mir",
          "BJ Penn",
          "Nate Diaz",
          "Mackenzie Dern"
        ],
        "alsoAcceptedAnswers": [
          "Rodolfo Vieira",
          "Tony Ferguson",
          "Jim Miller",
          "Brian Ortega",
          "Royce Gracie",
          "Fabricio Werdum"
        ]
      },
      {
        "prompt": "Name a submission specialist serious MMA fans know.",
        "answers": [
          "Charles Oliveira",
          "Demian Maia",
          "Royce Gracie",
          "Frank Mir",
          "BJ Penn",
          "Nate Diaz",
          "Mackenzie Dern",
          "Rodolfo Vieira"
        ],
        "alsoAcceptedAnswers": [
          "Tony Ferguson",
          "Khabib Nurmagomedov",
          "Jim Miller",
          "Islam Makhachev",
          "Brian Ortega",
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
          "Henry Cejudo",
          "Merab Dvalishvili",
          "Chael Sonnen"
        ],
        "alsoAcceptedAnswers": [
          "Matt Hughes",
          "Randy Couture",
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
          "Daniel Cormier",
          "Kamaru Usman",
          "Henry Cejudo",
          "Khabib Nurmagomedov",
          "Islam Makhachev",
          "Merab Dvalishvili",
          "Chael Sonnen"
        ],
        "alsoAcceptedAnswers": [
          "Matt Hughes",
          "Randy Couture",
          "Frankie Edgar",
          "Josh Koscheck",
          "Jon Fitch",
          "Chad Mendes"
        ]
      },
      {
        "prompt": "Name a UFC star associated with relentless grappling pressure.",
        "answers": [
          "Khabib Nurmagomedov",
          "Islam Makhachev",
          "Merab Dvalishvili",
          "Kamaru Usman",
          "Georges St-Pierre",
          "Daniel Cormier",
          "Henry Cejudo",
          "Chael Sonnen"
        ],
        "alsoAcceptedAnswers": [
          "Matt Hughes",
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
          "Matt Hughes",
          "Georges St-Pierre",
          "Kamaru Usman",
          "Henry Cejudo",
          "Merab Dvalishvili"
        ],
        "alsoAcceptedAnswers": [
          "Chael Sonnen",
          "Randy Couture",
          "Frankie Edgar",
          "Josh Koscheck",
          "Jon Fitch",
          "Chad Mendes"
        ]
      },
      {
        "prompt": "Name a wrestler who turned elite grappling into UFC success.",
        "answers": [
          "Daniel Cormier",
          "Henry Cejudo",
          "Georges St-Pierre",
          "Randy Couture",
          "Matt Hughes",
          "Khabib Nurmagomedov",
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
      {
        "name": "Frankie Edgar"
      },
      {
        "name": "Josh Koscheck"
      },
      {
        "name": "Jon Fitch"
      },
      {
        "name": "Chad Mendes"
      }
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
          "Conor McGregor",
          "Stephen Thompson",
          "Joanna Jedrzejczyk"
        ],
        "alsoAcceptedAnswers": [
          "Dustin Poirier",
          "Alexander Volkanovski",
          "Justin Gaethje",
          "Valentina Shevchenko",
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
          "Alex Pereira",
          "Conor McGregor",
          "Stephen Thompson",
          "Joanna Jedrzejczyk"
        ],
        "alsoAcceptedAnswers": [
          "Dustin Poirier",
          "Alexander Volkanovski",
          "Justin Gaethje",
          "Valentina Shevchenko",
          "Petr Yan",
          "Ilia Topuria"
        ]
      },
      {
        "prompt": "Name a UFC star you would pick for a striking showcase.",
        "answers": [
          "Israel Adesanya",
          "Anderson Silva",
          "Stephen Thompson",
          "Valentina Shevchenko",
          "Alex Pereira",
          "Max Holloway",
          "Jose Aldo",
          "Conor McGregor"
        ],
        "alsoAcceptedAnswers": [
          "Joanna Jedrzejczyk",
          "Dustin Poirier",
          "Alexander Volkanovski",
          "Justin Gaethje",
          "Petr Yan",
          "Ilia Topuria"
        ]
      },
      {
        "prompt": "Name a fighter opponents had to respect at kickboxing range.",
        "answers": [
          "Israel Adesanya",
          "Alex Pereira",
          "Stephen Thompson",
          "Jose Aldo",
          "Anderson Silva",
          "Max Holloway",
          "Conor McGregor",
          "Joanna Jedrzejczyk"
        ],
        "alsoAcceptedAnswers": [
          "Dustin Poirier",
          "Alexander Volkanovski",
          "Justin Gaethje",
          "Valentina Shevchenko",
          "Petr Yan",
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
          "Alex Pereira",
          "Max Holloway",
          "Jose Aldo",
          "Conor McGregor"
        ],
        "alsoAcceptedAnswers": [
          "Dustin Poirier",
          "Alexander Volkanovski",
          "Justin Gaethje",
          "Valentina Shevchenko",
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
      {
        "name": "Dustin Poirier"
      },
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
