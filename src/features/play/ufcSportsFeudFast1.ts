import { expandSportsFeudFamilies } from "./sportsFeudAuthoredHelpers";

export const UFC_SPORTS_FEUD_FAST_1 = expandSportsFeudFamilies("ufc-fast1", [
  {
    category: "divisions",
    entityKind: "other",
    collisionGroup: "divisions",
    prompts: [
      "Name a UFC weight class.",
      "Name a division you can see on a UFC card.",
      "Name a UFC division with famous champions.",
      "Name a weight class MMA fans debate constantly.",
      "Name a division a UFC fighter can compete in."
    ],
    answers: [
      "Lightweight",
      "Welterweight",
      "Middleweight",
      "Featherweight",
      "Bantamweight",
      "Heavyweight",
      "Light heavyweight",
      "Flyweight"
    ],
    alsoAcceptedAnswers: [
      "Strawweight",
      "Women's flyweight",
      "Women's bantamweight"
    ]
  },
  {
    category: "champions",
    entityKind: "person",
    collisionGroup: "lightweights",
    prompts: [
      "Name a UFC lightweight champion from any era.",
      "Name a fighter who has held the UFC lightweight title.",
      "Name a former or current UFC 155-pound champion.",
      "Name a lightweight whose résumé includes UFC gold.",
      "Name another fighter on the UFC lightweight champions list."
    ],
    answers: [
      {
        name: "Khabib Nurmagomedov",
        aliases: [
          "Khabib"
        ]
      },
      "Charles Oliveira",
      "BJ Penn",
      "Islam Makhachev",
      "Frankie Edgar",
      "Benson Henderson",
      "Eddie Alvarez",
      "Rafael dos Anjos"
    ],
    alsoAcceptedAnswers: [
      "Jens Pulver",
      "Sean Sherk",
      "Anthony Pettis",
      "Conor McGregor",
      "Ilia Topuria",
      "Justin Gaethje"
    ]
  },
  {
    category: "champions",
    entityKind: "person",
    collisionGroup: "welterweights",
    prompts: [
      "Name a UFC welterweight champion from any era.",
      "Name a fighter who has held the UFC welterweight title.",
      "Name a former or current UFC 170-pound champion.",
      "Name a welterweight whose résumé includes UFC gold.",
      "Name another fighter on the UFC welterweight champions list."
    ],
    answers: [
      {
        name: "Georges St-Pierre",
        aliases: [
          "GSP"
        ]
      },
      "Matt Hughes",
      "Kamaru Usman",
      "Tyron Woodley",
      "Leon Edwards",
      "Robbie Lawler",
      "Johny Hendricks",
      "Carlos Newton"
    ],
    alsoAcceptedAnswers: [
      "BJ Penn",
      "Pat Miletich",
      "Matt Serra",
      "Belal Muhammad",
      "Jack Della Maddalena",
      "Islam Makhachev"
    ]
  },
  {
    category: "champions",
    entityKind: "person",
    collisionGroup: "middleweights",
    prompts: [
      "Name a UFC middleweight champion from any era.",
      "Name a fighter who has held the UFC middleweight title.",
      "Name a former or current UFC 185-pound champion.",
      "Name a middleweight whose résumé includes UFC gold.",
      "Name another fighter on the UFC middleweight champions list."
    ],
    answers: [
      "Anderson Silva",
      "Israel Adesanya",
      "Chris Weidman",
      "Michael Bisping",
      "Robert Whittaker",
      "Alex Pereira",
      "Luke Rockhold",
      "Sean Strickland"
    ],
    alsoAcceptedAnswers: [
      "Rich Franklin",
      "Evan Tanner",
      "Dave Menne",
      "Murilo Bustamante",
      "Georges St-Pierre",
      "Dricus du Plessis",
      "Khamzat Chimaev"
    ]
  },
  {
    category: "champions",
    entityKind: "person",
    collisionGroup: "heavyweights",
    prompts: [
      "Name a UFC heavyweight champion from any era.",
      "Name a fighter who has held the UFC heavyweight title.",
      "Name a former or current UFC heavyweight champion.",
      "Name a heavyweight whose résumé includes UFC gold.",
      "Name another fighter on the UFC heavyweight champions list."
    ],
    answers: [
      {
        name: "Stipe Miocic",
        aliases: [
          "Stipe"
        ]
      },
      "Cain Velasquez",
      "Francis Ngannou",
      {
        name: "Daniel Cormier",
        aliases: [
          "DC"
        ]
      },
      "Randy Couture",
      "Junior dos Santos",
      "Brock Lesnar",
      "Fabricio Werdum"
    ],
    alsoAcceptedAnswers: [
      "Frank Mir",
      "Andrei Arlovski",
      "Tim Sylvia",
      "Josh Barnett",
      "Antonio Rodrigo Nogueira",
      "Tom Aspinall",
      "Bas Rutten",
      "Kevin Randleman",
      "Mark Coleman",
      "Ricco Rodriguez",
      "Maurice Smith",
      "Jon Jones",
      "Ciryl Gane"
    ]
  },
  {
    category: "champions",
    entityKind: "person",
    collisionGroup: "multi-division",
    prompts: [
      "Name a UFC fighter who won titles in two weight classes.",
      "Name a fighter with UFC championships in two divisions.",
      "Name a UFC champion who proved capable of winning gold at multiple weights.",
      "Name a fighter whose UFC résumé includes titles in two weight classes.",
      "Name a multi-division UFC champion."
    ],
    answers: [
      "Conor McGregor",
      "Daniel Cormier",
      "Amanda Nunes",
      "Henry Cejudo",
      "BJ Penn",
      "Randy Couture",
      "Jon Jones",
      "Alex Pereira"
    ],
    alsoAcceptedAnswers: [
      "Georges St-Pierre",
      "Ilia Topuria",
      "Islam Makhachev"
    ]
  },
  {
    category: "fighters",
    entityKind: "person",
    collisionGroup: "knockouts",
    prompts: [
      {
        prompt: "Name a UFC fighter known for knockout power.",
        answers: [
          "Francis Ngannou",
          "Alex Pereira",
          "Derrick Lewis",
          "Chuck Liddell",
          "Dan Henderson",
          "Wanderlei Silva",
          "Jiri Prochazka",
          "Justin Gaethje"
        ],
        alsoAcceptedAnswers: [
          "Anthony Johnson",
          "Mark Hunt",
          "Mirko Cro Cop",
          "Quinton Jackson",
          "Sergei Pavlovich",
          "Tai Tuivasa"
        ]
      },
      {
        prompt: "Name a fighter whose punches can end a fight instantly.",
        answers: [
          "Francis Ngannou",
          "Alex Pereira",
          "Derrick Lewis",
          "Anthony Johnson",
          "Chuck Liddell",
          "Dan Henderson",
          "Wanderlei Silva",
          "Jiri Prochazka"
        ],
        alsoAcceptedAnswers: [
          "Justin Gaethje",
          "Mark Hunt",
          "Mirko Cro Cop",
          "Quinton Jackson",
          "Sergei Pavlovich",
          "Tai Tuivasa"
        ]
      },
      {
        prompt: "Name a UFC star fans associate with big knockouts.",
        answers: [
          "Francis Ngannou",
          "Alex Pereira",
          "Chuck Liddell",
          "Derrick Lewis",
          "Dan Henderson",
          "Wanderlei Silva",
          "Jiri Prochazka",
          "Justin Gaethje"
        ],
        alsoAcceptedAnswers: [
          "Anthony Johnson",
          "Mark Hunt",
          "Mirko Cro Cop",
          "Quinton Jackson",
          "Sergei Pavlovich",
          "Tai Tuivasa"
        ]
      },
      {
        prompt: "Name a fighter you would never want to trade shots with.",
        answers: [
          "Francis Ngannou",
          "Alex Pereira",
          "Justin Gaethje",
          "Chuck Liddell",
          "Derrick Lewis",
          "Dan Henderson",
          "Wanderlei Silva",
          "Jiri Prochazka"
        ],
        alsoAcceptedAnswers: [
          "Anthony Johnson",
          "Mark Hunt",
          "Mirko Cro Cop",
          "Quinton Jackson",
          "Sergei Pavlovich",
          "Tai Tuivasa"
        ]
      },
      {
        prompt: "Name a UFC knockout artist almost every MMA fan knows.",
        answers: [
          "Francis Ngannou",
          "Alex Pereira",
          "Chuck Liddell",
          "Derrick Lewis",
          "Dan Henderson",
          "Wanderlei Silva",
          "Jiri Prochazka",
          "Justin Gaethje"
        ],
        alsoAcceptedAnswers: [
          "Anthony Johnson",
          "Mark Hunt",
          "Mirko Cro Cop",
          "Quinton Jackson",
          "Sergei Pavlovich",
          "Tai Tuivasa"
        ]
      }
    ],
    answers: [
      "Francis Ngannou",
      "Alex Pereira",
      "Derrick Lewis",
      "Chuck Liddell",
      "Dan Henderson",
      "Wanderlei Silva",
      "Jiri Prochazka",
      "Justin Gaethje"
    ],
    alsoAcceptedAnswers: [
      "Anthony Johnson",
      "Mark Hunt",
      "Mirko Cro Cop",
      "Quinton Jackson",
      "Sergei Pavlovich",
      "Tai Tuivasa"
    ]
  },
  {
    category: "fighters",
    entityKind: "person",
    collisionGroup: "submissions",
    prompts: [
      {
        prompt: "Name a UFC fighter known for submissions.",
        answers: [
          "Charles Oliveira",
          "Demian Maia",
          "Frank Mir",
          "BJ Penn",
          "Nate Diaz",
          "Mackenzie Dern",
          "Rodolfo Vieira",
          "Tony Ferguson"
        ],
        alsoAcceptedAnswers: [
          "Khabib Nurmagomedov",
          "Jim Miller",
          "Islam Makhachev",
          "Brian Ortega",
          "Royce Gracie",
          "Fabricio Werdum"
        ]
      },
      {
        prompt: "Name a fighter whose ground game can end a fight quickly.",
        answers: [
          "Charles Oliveira",
          "Frank Mir",
          "Brian Ortega",
          "Mackenzie Dern",
          "Demian Maia",
          "BJ Penn",
          "Nate Diaz",
          "Rodolfo Vieira"
        ],
        alsoAcceptedAnswers: [
          "Tony Ferguson",
          "Khabib Nurmagomedov",
          "Jim Miller",
          "Islam Makhachev",
          "Royce Gracie",
          "Fabricio Werdum"
        ]
      },
      {
        prompt: "Name a UFC star fans associate with dangerous submissions.",
        answers: [
          "Charles Oliveira",
          "Demian Maia",
          "Islam Makhachev",
          "Frank Mir",
          "BJ Penn",
          "Nate Diaz",
          "Mackenzie Dern",
          "Rodolfo Vieira"
        ],
        alsoAcceptedAnswers: [
          "Tony Ferguson",
          "Khabib Nurmagomedov",
          "Jim Miller",
          "Brian Ortega",
          "Royce Gracie",
          "Fabricio Werdum"
        ]
      },
      {
        prompt: "Name a fighter you would hate to grapple with.",
        answers: [
          "Khabib Nurmagomedov",
          "Islam Makhachev",
          "Demian Maia",
          "Charles Oliveira",
          "Frank Mir",
          "BJ Penn",
          "Nate Diaz",
          "Mackenzie Dern"
        ],
        alsoAcceptedAnswers: [
          "Rodolfo Vieira",
          "Tony Ferguson",
          "Jim Miller",
          "Brian Ortega",
          "Royce Gracie",
          "Fabricio Werdum"
        ]
      },
      {
        prompt: "Name a submission specialist serious MMA fans know.",
        answers: [
          "Charles Oliveira",
          "Demian Maia",
          "Royce Gracie",
          "Frank Mir",
          "BJ Penn",
          "Nate Diaz",
          "Mackenzie Dern",
          "Rodolfo Vieira"
        ],
        alsoAcceptedAnswers: [
          "Tony Ferguson",
          "Khabib Nurmagomedov",
          "Jim Miller",
          "Islam Makhachev",
          "Brian Ortega",
          "Fabricio Werdum"
        ]
      }
    ],
    answers: [
      "Charles Oliveira",
      "Demian Maia",
      "Frank Mir",
      "BJ Penn",
      "Nate Diaz",
      "Mackenzie Dern",
      "Rodolfo Vieira",
      "Tony Ferguson"
    ],
    alsoAcceptedAnswers: [
      {
        name: "Khabib Nurmagomedov",
        aliases: [
          "Khabib"
        ]
      },
      "Jim Miller",
      "Islam Makhachev",
      "Brian Ortega",
      "Royce Gracie",
      "Fabricio Werdum"
    ]
  },
  {
    category: "fighters",
    entityKind: "person",
    collisionGroup: "wrestling",
    prompts: [
      {
        prompt: "Name a UFC fighter known for wrestling.",
        answers: [
          "Khabib Nurmagomedov",
          "Georges St-Pierre",
          "Daniel Cormier",
          "Kamaru Usman",
          "Islam Makhachev",
          "Henry Cejudo",
          "Merab Dvalishvili",
          "Chael Sonnen"
        ],
        alsoAcceptedAnswers: [
          "Matt Hughes",
          "Randy Couture",
          "Frankie Edgar",
          "Josh Koscheck",
          "Jon Fitch",
          "Chad Mendes"
        ]
      },
      {
        prompt: "Name a fighter whose takedowns became part of his identity.",
        answers: [
          "Georges St-Pierre",
          "Daniel Cormier",
          "Kamaru Usman",
          "Henry Cejudo",
          "Khabib Nurmagomedov",
          "Islam Makhachev",
          "Merab Dvalishvili",
          "Chael Sonnen"
        ],
        alsoAcceptedAnswers: [
          "Matt Hughes",
          "Randy Couture",
          "Frankie Edgar",
          "Josh Koscheck",
          "Jon Fitch",
          "Chad Mendes"
        ]
      },
      {
        prompt: "Name a UFC star associated with relentless grappling pressure.",
        answers: [
          "Khabib Nurmagomedov",
          "Islam Makhachev",
          "Merab Dvalishvili",
          "Kamaru Usman",
          "Georges St-Pierre",
          "Daniel Cormier",
          "Henry Cejudo",
          "Chael Sonnen"
        ],
        alsoAcceptedAnswers: [
          "Matt Hughes",
          "Randy Couture",
          "Frankie Edgar",
          "Josh Koscheck",
          "Jon Fitch",
          "Chad Mendes"
        ]
      },
      {
        prompt: "Name a fighter opponents hated having on top of them.",
        answers: [
          "Khabib Nurmagomedov",
          "Daniel Cormier",
          "Islam Makhachev",
          "Matt Hughes",
          "Georges St-Pierre",
          "Kamaru Usman",
          "Henry Cejudo",
          "Merab Dvalishvili"
        ],
        alsoAcceptedAnswers: [
          "Chael Sonnen",
          "Randy Couture",
          "Frankie Edgar",
          "Josh Koscheck",
          "Jon Fitch",
          "Chad Mendes"
        ]
      },
      {
        prompt: "Name a wrestler who turned elite grappling into UFC success.",
        answers: [
          "Daniel Cormier",
          "Henry Cejudo",
          "Georges St-Pierre",
          "Randy Couture",
          "Matt Hughes",
          "Khabib Nurmagomedov",
          "Kamaru Usman",
          "Islam Makhachev"
        ],
        alsoAcceptedAnswers: [
          "Merab Dvalishvili",
          "Chael Sonnen",
          "Frankie Edgar",
          "Josh Koscheck",
          "Jon Fitch",
          "Chad Mendes"
        ]
      }
    ],
    answers: [
      "Khabib Nurmagomedov",
      "Georges St-Pierre",
      "Daniel Cormier",
      "Kamaru Usman",
      "Islam Makhachev",
      "Henry Cejudo",
      "Merab Dvalishvili",
      "Chael Sonnen"
    ],
    alsoAcceptedAnswers: [
      "Matt Hughes",
      "Randy Couture",
      "Frankie Edgar",
      "Josh Koscheck",
      "Jon Fitch",
      "Chad Mendes"
    ]
  },
  {
    category: "fighters",
    entityKind: "person",
    collisionGroup: "striking",
    prompts: [
      {
        prompt: "Name a UFC fighter known for elite striking.",
        answers: [
          "Anderson Silva",
          "Israel Adesanya",
          "Alex Pereira",
          "Max Holloway",
          "Jose Aldo",
          "Conor McGregor",
          "Stephen Thompson",
          "Joanna Jedrzejczyk"
        ],
        alsoAcceptedAnswers: [
          "Dustin Poirier",
          "Alexander Volkanovski",
          "Justin Gaethje",
          "Valentina Shevchenko",
          "Petr Yan",
          "Ilia Topuria"
        ]
      },
      {
        prompt: "Name a fighter whose stand-up skill became part of his reputation.",
        answers: [
          "Anderson Silva",
          "Israel Adesanya",
          "Max Holloway",
          "Jose Aldo",
          "Alex Pereira",
          "Conor McGregor",
          "Stephen Thompson",
          "Joanna Jedrzejczyk"
        ],
        alsoAcceptedAnswers: [
          "Dustin Poirier",
          "Alexander Volkanovski",
          "Justin Gaethje",
          "Valentina Shevchenko",
          "Petr Yan",
          "Ilia Topuria"
        ]
      },
      {
        prompt: "Name a UFC star you would pick for a striking showcase.",
        answers: [
          "Israel Adesanya",
          "Anderson Silva",
          "Stephen Thompson",
          "Valentina Shevchenko",
          "Alex Pereira",
          "Max Holloway",
          "Jose Aldo",
          "Conor McGregor"
        ],
        alsoAcceptedAnswers: [
          "Joanna Jedrzejczyk",
          "Dustin Poirier",
          "Alexander Volkanovski",
          "Justin Gaethje",
          "Petr Yan",
          "Ilia Topuria"
        ]
      },
      {
        prompt: "Name a fighter opponents had to respect at kickboxing range.",
        answers: [
          "Israel Adesanya",
          "Alex Pereira",
          "Stephen Thompson",
          "Jose Aldo",
          "Anderson Silva",
          "Max Holloway",
          "Conor McGregor",
          "Joanna Jedrzejczyk"
        ],
        alsoAcceptedAnswers: [
          "Dustin Poirier",
          "Alexander Volkanovski",
          "Justin Gaethje",
          "Valentina Shevchenko",
          "Petr Yan",
          "Ilia Topuria"
        ]
      },
      {
        prompt: "Name a striker whose UFC style looked especially polished.",
        answers: [
          "Anderson Silva",
          "Israel Adesanya",
          "Stephen Thompson",
          "Joanna Jedrzejczyk",
          "Alex Pereira",
          "Max Holloway",
          "Jose Aldo",
          "Conor McGregor"
        ],
        alsoAcceptedAnswers: [
          "Dustin Poirier",
          "Alexander Volkanovski",
          "Justin Gaethje",
          "Valentina Shevchenko",
          "Petr Yan",
          "Ilia Topuria"
        ]
      }
    ],
    answers: [
      "Anderson Silva",
      "Israel Adesanya",
      "Alex Pereira",
      "Max Holloway",
      "Jose Aldo",
      "Conor McGregor",
      "Stephen Thompson",
      "Joanna Jedrzejczyk"
    ],
    alsoAcceptedAnswers: [
      "Dustin Poirier",
      "Alexander Volkanovski",
      "Justin Gaethje",
      "Valentina Shevchenko",
      "Petr Yan",
      "Ilia Topuria"
    ]
  }
] as const);
