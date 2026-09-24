import { expandSportsFeudFamilies } from "./sportsFeudAuthoredHelpers";

export const UFC_SPORTS_FEUD_MAIN = expandSportsFeudFamilies("ufc-main", [
  {
    "category": "fighter-legacy",
    "entityKind": "person",
    "collisionGroup": "fighters",
    "prompts": [
      {
        "prompt": "Name a fighter who belongs in almost any UFC all-time-great conversation.",
        "answers": [
          "Jon Jones",
          "Georges St-Pierre",
          "Anderson Silva",
          "Demetrious Johnson",
          "Jose Aldo",
          "Amanda Nunes",
          "Khabib Nurmagomedov",
          "Stipe Miocic"
        ],
        "alsoAcceptedAnswers": [
          "Conor McGregor",
          "Ronda Rousey",
          "Daniel Cormier",
          "Randy Couture",
          "Matt Hughes",
          "Alexander Volkanovski",
          "Israel Adesanya",
          "Chuck Liddell",
          "BJ Penn",
          "Brock Lesnar",
          "Islam Makhachev"
        ]
      },
      {
        "prompt": "Name a UFC fighter whose career defines an era.",
        "answers": [
          "Anderson Silva",
          "Georges St-Pierre",
          "Jon Jones",
          "Jose Aldo",
          "Demetrious Johnson",
          "Ronda Rousey",
          "Khabib Nurmagomedov",
          "Conor McGregor"
        ],
        "alsoAcceptedAnswers": [
          "Amanda Nunes",
          "Stipe Miocic",
          "Daniel Cormier",
          "Randy Couture",
          "Matt Hughes",
          "Alexander Volkanovski",
          "Israel Adesanya",
          "Chuck Liddell",
          "BJ Penn",
          "Brock Lesnar",
          "Islam Makhachev"
        ]
      },
      {
        "prompt": "Name a fighter casual fans might still recognize as a UFC legend.",
        "answers": [
          "Conor McGregor",
          "Ronda Rousey",
          "Jon Jones",
          "Georges St-Pierre",
          "Anderson Silva",
          "Chuck Liddell",
          "Khabib Nurmagomedov",
          "Brock Lesnar"
        ],
        "alsoAcceptedAnswers": [
          "Demetrious Johnson",
          "Jose Aldo",
          "Amanda Nunes",
          "Stipe Miocic",
          "Daniel Cormier",
          "Randy Couture",
          "Matt Hughes",
          "Alexander Volkanovski",
          "Israel Adesanya",
          "BJ Penn",
          "Islam Makhachev"
        ]
      },
      {
        "prompt": "Name a UFC champion whose legacy goes far beyond one title win.",
        "answers": [
          "Georges St-Pierre",
          "Jon Jones",
          "Anderson Silva",
          "Demetrious Johnson",
          "Amanda Nunes",
          "Jose Aldo",
          "Stipe Miocic",
          "Alexander Volkanovski"
        ],
        "alsoAcceptedAnswers": [
          "Khabib Nurmagomedov",
          "Conor McGregor",
          "Ronda Rousey",
          "Daniel Cormier",
          "Randy Couture",
          "Matt Hughes",
          "Israel Adesanya",
          "Chuck Liddell",
          "BJ Penn",
          "Brock Lesnar",
          "Islam Makhachev"
        ]
      },
      {
        "prompt": "Name a fighter you would expect in a UFC Mount Rushmore debate.",
        "answers": [
          "Jon Jones",
          "Georges St-Pierre",
          "Anderson Silva",
          "Demetrious Johnson",
          "Jose Aldo",
          "Amanda Nunes",
          "Khabib Nurmagomedov",
          "Chuck Liddell"
        ],
        "alsoAcceptedAnswers": [
          "Conor McGregor",
          "Ronda Rousey",
          "Stipe Miocic",
          "Daniel Cormier",
          "Randy Couture",
          "Matt Hughes",
          "Alexander Volkanovski",
          "Israel Adesanya",
          "BJ Penn",
          "Brock Lesnar",
          "Islam Makhachev"
        ]
      }
    ],
    "answers": [
      {
        "name": "Jon Jones",
        "aliases": [
          "Bones"
        ]
      },
      {
        "name": "Georges St-Pierre",
        "aliases": [
          "GSP",
          "St Pierre",
          "Georges St Pierre"
        ]
      },
      {
        "name": "Anderson Silva",
        "aliases": [
          "The Spider"
        ]
      },
      {
        "name": "Demetrious Johnson",
        "aliases": [
          "Mighty Mouse",
          "DJ"
        ]
      },
      {
        "name": "Jose Aldo",
        "aliases": [
          "Aldo"
        ]
      },
      {
        "name": "Khabib Nurmagomedov",
        "aliases": [
          "Khabib"
        ]
      },
      {
        "name": "Amanda Nunes",
        "aliases": [
          "The Lioness"
        ]
      },
      {
        "name": "Conor McGregor",
        "aliases": [
          "Conor",
          "Notorious"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Ronda Rousey",
        "aliases": [
          "Rowdy"
        ]
      },
      {
        "name": "Stipe Miocic",
        "aliases": [
          "Stipe"
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
          "The Natural"
        ]
      },
      {
        "name": "Matt Hughes",
        "aliases": [
          "Hughes"
        ]
      },
      {
        "name": "Alexander Volkanovski",
        "aliases": [
          "Volk"
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
        "name": "Chuck Liddell",
        "aliases": [
          "Iceman"
        ]
      },
      {
        "name": "BJ Penn",
        "aliases": [
          "BJ"
        ]
      },
      {
        "name": "Brock Lesnar",
        "aliases": [
          "Lesnar"
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
    "category": "fighter-style",
    "entityKind": "person",
    "collisionGroup": "knockouts",
    "prompts": [
      {
        "prompt": "Name a UFC fighter famous for knockout power.",
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
        "prompt": "Name a fighter whose hands make every exchange feel dangerous.",
        "answers": [
          "Alex Pereira",
          "Francis Ngannou",
          "Derrick Lewis",
          "Justin Gaethje",
          "Dan Henderson",
          "Anthony Johnson",
          "Tai Tuivasa",
          "Chuck Liddell"
        ],
        "alsoAcceptedAnswers": [
          "Wanderlei Silva",
          "Jiri Prochazka",
          "Mark Hunt",
          "Mirko Cro Cop",
          "Quinton Jackson",
          "Sergei Pavlovich"
        ]
      },
      {
        "prompt": "Name a UFC fighter fans associate with one-shot power.",
        "answers": [
          "Francis Ngannou",
          "Alex Pereira",
          "Anthony Johnson",
          "Dan Henderson",
          "Derrick Lewis",
          "Mark Hunt",
          "Jiri Prochazka",
          "Chuck Liddell"
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
        "prompt": "Name a fighter you would never want to stand and trade with.",
        "answers": [
          "Alex Pereira",
          "Justin Gaethje",
          "Chuck Liddell",
          "Dan Henderson",
          "Wanderlei Silva",
          "Jiri Prochazka",
          "Francis Ngannou",
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
        "prompt": "Name a UFC knockout artist almost every MMA fan recognizes.",
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
          "Predator"
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
          "Black Beast"
        ]
      },
      {
        "name": "Chuck Liddell",
        "aliases": [
          "Iceman"
        ]
      },
      "Wanderlei Silva",
      {
        "name": "Dan Henderson",
        "aliases": [
          "Hendo"
        ]
      },
      {
        "name": "Justin Gaethje",
        "aliases": [
          "Highlight"
        ]
      },
      {
        "name": "Jiri Prochazka",
        "aliases": [
          "Jiri"
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
          "Super Samoan"
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
      "Tai Tuivasa"
    ]
  },
  {
    "category": "fighter-style",
    "entityKind": "person",
    "collisionGroup": "submissions",
    "prompts": [
      {
        "prompt": "Name a UFC fighter famous for submissions.",
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
        "prompt": "Name a fighter whose ground game can end a fight suddenly.",
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
        "prompt": "Name a UFC fighter you associate with dangerous submission offense.",
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
        "prompt": "Name a fighter you would hate to grapple with on the mat.",
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
        "prompt": "Name a submission specialist MMA fans recognize quickly.",
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
      "Demian Maia",
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
      "Rodolfo Vieira",
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
      "Jim Miller",
      {
        "name": "Islam Makhachev",
        "aliases": [
          "Islam"
        ]
      },
      "Brian Ortega",
      "Royce Gracie",
      {
        "name": "Fabricio Werdum",
        "aliases": [
          "Vai Cavalo"
        ]
      }
    ]
  },
  {
    "category": "fighter-style",
    "entityKind": "person",
    "collisionGroup": "wrestling",
    "prompts": [
      {
        "prompt": "Name a UFC fighter famous for wrestling.",
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
        "prompt": "Name a fighter whose takedowns became a major part of his identity.",
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
        "prompt": "Name a UFC star you associate with relentless grappling pressure.",
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
        "prompt": "Name a fighter opponents dreaded having on top of them.",
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
          "St Pierre",
          "Georges St Pierre"
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
          "Triple C"
        ]
      },
      {
        "name": "Merab Dvalishvili",
        "aliases": [
          "Merab",
          "Machine"
        ]
      },
      {
        "name": "Chael Sonnen",
        "aliases": [
          "American Gangster"
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
          "The Natural"
        ]
      },
      "Frankie Edgar",
      "Josh Koscheck",
      "Jon Fitch",
      "Chad Mendes"
    ]
  },
  {
    "category": "fighter-style",
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
        "prompt": "Name a UFC star you would pick for a technical striking showcase.",
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
      "Max Holloway",
      {
        "name": "Jose Aldo",
        "aliases": [
          "Aldo"
        ]
      },
      {
        "name": "Conor McGregor",
        "aliases": [
          "Conor",
          "Notorious"
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
        "name": "Dustin Poirier",
        "aliases": [
          "Diamond"
        ]
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
          "Highlight"
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
          "El Matador"
        ]
      }
    ]
  },
  {
    "category": "fighter-personality",
    "entityKind": "person",
    "collisionGroup": "culture",
    "prompts": [
      {
        "prompt": "Name a UFC fighter famous for trash talk or personality.",
        "answers": [
          "Conor McGregor",
          "Chael Sonnen",
          "Nate Diaz",
          "Michael Bisping",
          "Colby Covington",
          "Sean Strickland",
          "Jorge Masvidal",
          "Tito Ortiz"
        ],
        "alsoAcceptedAnswers": [
          "Kevin Holland",
          "Derrick Lewis",
          "Quinton Jackson",
          "Paddy Pimblett",
          "Sean O'Malley",
          "Tony Ferguson"
        ]
      },
      {
        "prompt": "Name a fighter who could sell a fight before entering the cage.",
        "answers": [
          "Conor McGregor",
          "Chael Sonnen",
          "Michael Bisping",
          "Colby Covington",
          "Nate Diaz",
          "Jorge Masvidal",
          "Paddy Pimblett",
          "Sean O'Malley"
        ],
        "alsoAcceptedAnswers": [
          "Sean Strickland",
          "Kevin Holland",
          "Derrick Lewis",
          "Tito Ortiz",
          "Quinton Jackson",
          "Tony Ferguson"
        ]
      },
      {
        "prompt": "Name a UFC personality fans loved or hated hearing on the microphone.",
        "answers": [
          "Chael Sonnen",
          "Conor McGregor",
          "Michael Bisping",
          "Nate Diaz",
          "Sean Strickland",
          "Colby Covington",
          "Kevin Holland",
          "Derrick Lewis"
        ],
        "alsoAcceptedAnswers": [
          "Jorge Masvidal",
          "Tito Ortiz",
          "Quinton Jackson",
          "Paddy Pimblett",
          "Sean O'Malley",
          "Tony Ferguson"
        ]
      },
      {
        "prompt": "Name a fighter whose words became part of the promotion.",
        "answers": [
          "Conor McGregor",
          "Chael Sonnen",
          "Nate Diaz",
          "Colby Covington",
          "Michael Bisping",
          "Tito Ortiz",
          "Jorge Masvidal",
          "Sean Strickland"
        ],
        "alsoAcceptedAnswers": [
          "Kevin Holland",
          "Derrick Lewis",
          "Quinton Jackson",
          "Paddy Pimblett",
          "Sean O'Malley",
          "Tony Ferguson"
        ]
      },
      {
        "prompt": "Name a UFC star who knew how to create attention outside the cage.",
        "answers": [
          "Conor McGregor",
          "Chael Sonnen",
          "Colby Covington",
          "Nate Diaz",
          "Sean Strickland",
          "Jorge Masvidal",
          "Paddy Pimblett",
          "Sean O'Malley"
        ],
        "alsoAcceptedAnswers": [
          "Michael Bisping",
          "Kevin Holland",
          "Derrick Lewis",
          "Tito Ortiz",
          "Quinton Jackson",
          "Tony Ferguson"
        ]
      }
    ],
    "answers": [
      {
        "name": "Conor McGregor",
        "aliases": [
          "Conor",
          "Notorious"
        ]
      },
      {
        "name": "Chael Sonnen",
        "aliases": [
          "American Gangster"
        ]
      },
      {
        "name": "Nate Diaz",
        "aliases": [
          "Nate"
        ]
      },
      "Michael Bisping",
      {
        "name": "Colby Covington",
        "aliases": [
          "Chaos"
        ]
      },
      "Sean Strickland",
      "Kevin Holland",
      {
        "name": "Derrick Lewis",
        "aliases": [
          "Black Beast"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Jorge Masvidal",
        "aliases": [
          "Gamebred"
        ]
      },
      "Tito Ortiz",
      {
        "name": "Quinton Jackson",
        "aliases": [
          "Rampage"
        ]
      },
      "Paddy Pimblett",
      "Sean O'Malley",
      {
        "name": "Tony Ferguson",
        "aliases": [
          "El Cucuy"
        ]
      }
    ]
  },
  {
    "category": "fighter-legacy",
    "entityKind": "person",
    "collisionGroup": "champions",
    "prompts": [
      {
        "prompt": "Name a UFC champion remembered for a dominant title reign.",
        "answers": [
          "Anderson Silva",
          "Georges St-Pierre",
          "Demetrious Johnson",
          "Jon Jones",
          "Jose Aldo",
          "Amanda Nunes",
          "Valentina Shevchenko",
          "Israel Adesanya"
        ],
        "alsoAcceptedAnswers": [
          "Khabib Nurmagomedov",
          "Alexander Volkanovski",
          "Kamaru Usman",
          "Matt Hughes",
          "Ronda Rousey",
          "Islam Makhachev"
        ]
      },
      {
        "prompt": "Name a fighter who made a UFC division feel like it belonged to them.",
        "answers": [
          "Anderson Silva",
          "Georges St-Pierre",
          "Jose Aldo",
          "Demetrious Johnson",
          "Jon Jones",
          "Amanda Nunes",
          "Khabib Nurmagomedov",
          "Israel Adesanya"
        ],
        "alsoAcceptedAnswers": [
          "Valentina Shevchenko",
          "Alexander Volkanovski",
          "Kamaru Usman",
          "Matt Hughes",
          "Ronda Rousey",
          "Islam Makhachev"
        ]
      },
      {
        "prompt": "Name a champion whose title run created an aura of dominance.",
        "answers": [
          "Jon Jones",
          "Anderson Silva",
          "Georges St-Pierre",
          "Demetrious Johnson",
          "Amanda Nunes",
          "Khabib Nurmagomedov",
          "Jose Aldo",
          "Valentina Shevchenko"
        ],
        "alsoAcceptedAnswers": [
          "Israel Adesanya",
          "Alexander Volkanovski",
          "Kamaru Usman",
          "Matt Hughes",
          "Ronda Rousey",
          "Islam Makhachev"
        ]
      },
      {
        "prompt": "Name a UFC fighter associated with repeated championship defenses.",
        "answers": [
          "Demetrious Johnson",
          "Anderson Silva",
          "Georges St-Pierre",
          "Jon Jones",
          "Jose Aldo",
          "Amanda Nunes",
          "Israel Adesanya",
          "Valentina Shevchenko"
        ],
        "alsoAcceptedAnswers": [
          "Khabib Nurmagomedov",
          "Alexander Volkanovski",
          "Kamaru Usman",
          "Matt Hughes",
          "Ronda Rousey",
          "Islam Makhachev"
        ]
      },
      {
        "prompt": "Name a champion who ruled a division for a meaningful stretch.",
        "answers": [
          "Anderson Silva",
          "Georges St-Pierre",
          "Jon Jones",
          "Demetrious Johnson",
          "Jose Aldo",
          "Amanda Nunes",
          "Israel Adesanya",
          "Islam Makhachev"
        ],
        "alsoAcceptedAnswers": [
          "Valentina Shevchenko",
          "Khabib Nurmagomedov",
          "Alexander Volkanovski",
          "Kamaru Usman",
          "Matt Hughes",
          "Ronda Rousey"
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
        "name": "Georges St-Pierre",
        "aliases": [
          "GSP",
          "St Pierre",
          "Georges St Pierre"
        ]
      },
      {
        "name": "Demetrious Johnson",
        "aliases": [
          "Mighty Mouse",
          "DJ"
        ]
      },
      {
        "name": "Jon Jones",
        "aliases": [
          "Bones"
        ]
      },
      {
        "name": "Jose Aldo",
        "aliases": [
          "Aldo"
        ]
      },
      {
        "name": "Amanda Nunes",
        "aliases": [
          "The Lioness"
        ]
      },
      {
        "name": "Valentina Shevchenko",
        "aliases": [
          "Bullet"
        ]
      },
      {
        "name": "Israel Adesanya",
        "aliases": [
          "Izzy",
          "Stylebender"
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
        "name": "Alexander Volkanovski",
        "aliases": [
          "Volk"
        ]
      },
      {
        "name": "Kamaru Usman",
        "aliases": [
          "Usman"
        ]
      },
      {
        "name": "Matt Hughes",
        "aliases": [
          "Hughes"
        ]
      },
      {
        "name": "Ronda Rousey",
        "aliases": [
          "Rowdy"
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
    "category": "division-identity",
    "entityKind": "person",
    "collisionGroup": "lightweights",
    "prompts": [
      {
        "prompt": "Name a UFC lightweight star from the modern era.",
        "answers": [
          "Khabib Nurmagomedov",
          "Charles Oliveira",
          "Islam Makhachev",
          "Dustin Poirier",
          "Justin Gaethje",
          "Ilia Topuria",
          "Conor McGregor",
          "Tony Ferguson"
        ],
        "alsoAcceptedAnswers": [
          "BJ Penn",
          "Eddie Alvarez",
          "Frankie Edgar",
          "Benson Henderson",
          "Rafael dos Anjos",
          "Donald Cerrone",
          "Nate Diaz"
        ]
      },
      {
        "prompt": "Name a fighter you strongly associate with the UFC lightweight division.",
        "answers": [
          "Khabib Nurmagomedov",
          "BJ Penn",
          "Islam Makhachev",
          "Charles Oliveira",
          "Frankie Edgar",
          "Dustin Poirier",
          "Tony Ferguson",
          "Benson Henderson"
        ],
        "alsoAcceptedAnswers": [
          "Justin Gaethje",
          "Eddie Alvarez",
          "Conor McGregor",
          "Rafael dos Anjos",
          "Donald Cerrone",
          "Nate Diaz",
          "Ilia Topuria"
        ]
      },
      {
        "prompt": "Name a lightweight whose UFC career produced major fights.",
        "answers": [
          "Dustin Poirier",
          "Khabib Nurmagomedov",
          "Conor McGregor",
          "Justin Gaethje",
          "Charles Oliveira",
          "Tony Ferguson",
          "BJ Penn",
          "Eddie Alvarez"
        ],
        "alsoAcceptedAnswers": [
          "Islam Makhachev",
          "Frankie Edgar",
          "Benson Henderson",
          "Rafael dos Anjos",
          "Donald Cerrone",
          "Nate Diaz",
          "Ilia Topuria"
        ]
      },
      {
        "prompt": "Name a 155-pound fighter almost every MMA fan recognizes.",
        "answers": [
          "Conor McGregor",
          "Khabib Nurmagomedov",
          "Dustin Poirier",
          "Charles Oliveira",
          "Justin Gaethje",
          "Islam Makhachev",
          "Ilia Topuria",
          "Nate Diaz"
        ],
        "alsoAcceptedAnswers": [
          "BJ Penn",
          "Tony Ferguson",
          "Eddie Alvarez",
          "Frankie Edgar",
          "Benson Henderson",
          "Rafael dos Anjos",
          "Donald Cerrone"
        ]
      },
      {
        "prompt": "Name a lightweight you would expect in a division history conversation.",
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
          "Dustin Poirier",
          "Justin Gaethje",
          "Tony Ferguson",
          "Eddie Alvarez",
          "Donald Cerrone",
          "Nate Diaz",
          "Ilia Topuria"
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
        "name": "Dustin Poirier",
        "aliases": [
          "Diamond"
        ]
      },
      {
        "name": "Justin Gaethje",
        "aliases": [
          "Highlight"
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
        "name": "Tony Ferguson",
        "aliases": [
          "El Cucuy"
        ]
      },
      "Eddie Alvarez"
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Conor McGregor",
        "aliases": [
          "Conor",
          "Notorious"
        ]
      },
      "Frankie Edgar",
      "Benson Henderson",
      "Rafael dos Anjos",
      "Donald Cerrone",
      {
        "name": "Nate Diaz",
        "aliases": [
          "Nate"
        ]
      },
      {
        "name": "Ilia Topuria",
        "aliases": [
          "El Matador"
        ]
      }
    ]
  },
  {
    "category": "division-identity",
    "entityKind": "person",
    "collisionGroup": "welterweights",
    "prompts": [
      {
        "prompt": "Name a UFC welterweight star from the modern era.",
        "answers": [
          "Georges St-Pierre",
          "Kamaru Usman",
          "Leon Edwards",
          "Robbie Lawler",
          "Tyron Woodley",
          "Jorge Masvidal",
          "Colby Covington",
          "Stephen Thompson"
        ],
        "alsoAcceptedAnswers": [
          "Matt Hughes",
          "Carlos Condit",
          "Nick Diaz",
          "Johny Hendricks",
          "Belal Muhammad",
          "Islam Makhachev",
          "Jack Della Maddalena",
          "BJ Penn",
          "Matt Serra"
        ]
      },
      {
        "prompt": "Name a fighter you strongly associate with the UFC welterweight division.",
        "answers": [
          "Georges St-Pierre",
          "Matt Hughes",
          "Kamaru Usman",
          "Robbie Lawler",
          "Tyron Woodley",
          "Leon Edwards",
          "Carlos Condit",
          "Johny Hendricks"
        ],
        "alsoAcceptedAnswers": [
          "Stephen Thompson",
          "Jorge Masvidal",
          "Nick Diaz",
          "Colby Covington",
          "Belal Muhammad",
          "Islam Makhachev",
          "Jack Della Maddalena",
          "BJ Penn",
          "Matt Serra"
        ]
      },
      {
        "prompt": "Name a welterweight whose UFC career produced major fights.",
        "answers": [
          "Georges St-Pierre",
          "Robbie Lawler",
          "Kamaru Usman",
          "Leon Edwards",
          "Jorge Masvidal",
          "Nick Diaz",
          "Tyron Woodley",
          "Carlos Condit"
        ],
        "alsoAcceptedAnswers": [
          "Matt Hughes",
          "Stephen Thompson",
          "Colby Covington",
          "Johny Hendricks",
          "Belal Muhammad",
          "Islam Makhachev",
          "Jack Della Maddalena",
          "BJ Penn",
          "Matt Serra"
        ]
      },
      {
        "prompt": "Name a 170-pound fighter almost every MMA fan recognizes.",
        "answers": [
          "Georges St-Pierre",
          "Kamaru Usman",
          "Jorge Masvidal",
          "Leon Edwards",
          "Tyron Woodley",
          "Stephen Thompson",
          "Matt Hughes",
          "Nick Diaz"
        ],
        "alsoAcceptedAnswers": [
          "Robbie Lawler",
          "Carlos Condit",
          "Colby Covington",
          "Johny Hendricks",
          "Belal Muhammad",
          "Islam Makhachev",
          "Jack Della Maddalena",
          "BJ Penn",
          "Matt Serra"
        ]
      },
      {
        "prompt": "Name a welterweight you would expect in a division history conversation.",
        "answers": [
          "Georges St-Pierre",
          "Matt Hughes",
          "Kamaru Usman",
          "Robbie Lawler",
          "Tyron Woodley",
          "Leon Edwards",
          "Islam Makhachev",
          "BJ Penn"
        ],
        "alsoAcceptedAnswers": [
          "Stephen Thompson",
          "Carlos Condit",
          "Jorge Masvidal",
          "Nick Diaz",
          "Colby Covington",
          "Johny Hendricks",
          "Belal Muhammad",
          "Jack Della Maddalena",
          "Matt Serra"
        ]
      }
    ],
    "answers": [
      {
        "name": "Georges St-Pierre",
        "aliases": [
          "GSP",
          "St Pierre",
          "Georges St Pierre"
        ]
      },
      {
        "name": "Kamaru Usman",
        "aliases": [
          "Usman"
        ]
      },
      {
        "name": "Matt Hughes",
        "aliases": [
          "Hughes"
        ]
      },
      {
        "name": "Robbie Lawler",
        "aliases": [
          "Ruthless"
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
          "Rocky"
        ]
      },
      {
        "name": "Stephen Thompson",
        "aliases": [
          "Wonderboy"
        ]
      },
      {
        "name": "Carlos Condit",
        "aliases": [
          "Natural Born Killer"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Jorge Masvidal",
        "aliases": [
          "Gamebred"
        ]
      },
      {
        "name": "Nick Diaz",
        "aliases": [
          "Nick"
        ]
      },
      {
        "name": "Colby Covington",
        "aliases": [
          "Chaos"
        ]
      },
      {
        "name": "Johny Hendricks",
        "aliases": [
          "Bigg Rigg"
        ]
      },
      {
        "name": "Belal Muhammad",
        "aliases": [
          "Belal"
        ]
      },
      {
        "name": "Islam Makhachev",
        "aliases": [
          "Islam"
        ]
      },
      {
        "name": "Jack Della Maddalena",
        "aliases": [
          "JDM"
        ]
      },
      {
        "name": "BJ Penn",
        "aliases": [
          "BJ"
        ]
      },
      "Matt Serra"
    ]
  },
  {
    "category": "division-identity",
    "entityKind": "person",
    "collisionGroup": "heavyweights",
    "prompts": [
      {
        "prompt": "Name a famous UFC heavyweight.",
        "answers": [
          "Stipe Miocic",
          "Francis Ngannou",
          "Brock Lesnar",
          "Cain Velasquez",
          "Daniel Cormier",
          "Jon Jones",
          "Randy Couture",
          "Derrick Lewis"
        ],
        "alsoAcceptedAnswers": [
          "Junior dos Santos",
          "Fabricio Werdum",
          "Andrei Arlovski",
          "Frank Mir",
          "Mark Hunt",
          "Alistair Overeem",
          "Tom Aspinall",
          "Ciryl Gane"
        ]
      },
      {
        "prompt": "Name a fighter you strongly associate with the UFC heavyweight division.",
        "answers": [
          "Stipe Miocic",
          "Cain Velasquez",
          "Randy Couture",
          "Francis Ngannou",
          "Junior dos Santos",
          "Fabricio Werdum",
          "Andrei Arlovski",
          "Frank Mir"
        ],
        "alsoAcceptedAnswers": [
          "Daniel Cormier",
          "Derrick Lewis",
          "Brock Lesnar",
          "Mark Hunt",
          "Alistair Overeem",
          "Tom Aspinall",
          "Ciryl Gane",
          "Jon Jones"
        ]
      },
      {
        "prompt": "Name a heavyweight whose UFC career produced major moments.",
        "answers": [
          "Stipe Miocic",
          "Francis Ngannou",
          "Cain Velasquez",
          "Daniel Cormier",
          "Brock Lesnar",
          "Jon Jones",
          "Derrick Lewis",
          "Junior dos Santos"
        ],
        "alsoAcceptedAnswers": [
          "Randy Couture",
          "Fabricio Werdum",
          "Andrei Arlovski",
          "Frank Mir",
          "Mark Hunt",
          "Alistair Overeem",
          "Tom Aspinall",
          "Ciryl Gane"
        ]
      },
      {
        "prompt": "Name a big man almost every MMA fan recognizes.",
        "answers": [
          "Brock Lesnar",
          "Francis Ngannou",
          "Jon Jones",
          "Stipe Miocic",
          "Daniel Cormier",
          "Derrick Lewis",
          "Cain Velasquez",
          "Randy Couture"
        ],
        "alsoAcceptedAnswers": [
          "Junior dos Santos",
          "Fabricio Werdum",
          "Andrei Arlovski",
          "Frank Mir",
          "Mark Hunt",
          "Alistair Overeem",
          "Tom Aspinall",
          "Ciryl Gane"
        ]
      },
      {
        "prompt": "Name a heavyweight you would expect in a division history conversation.",
        "answers": [
          "Stipe Miocic",
          "Randy Couture",
          "Cain Velasquez",
          "Daniel Cormier",
          "Francis Ngannou",
          "Jon Jones",
          "Junior dos Santos",
          "Fabricio Werdum"
        ],
        "alsoAcceptedAnswers": [
          "Derrick Lewis",
          "Brock Lesnar",
          "Andrei Arlovski",
          "Frank Mir",
          "Mark Hunt",
          "Alistair Overeem",
          "Tom Aspinall",
          "Ciryl Gane"
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
        "name": "Francis Ngannou",
        "aliases": [
          "Predator"
        ]
      },
      {
        "name": "Cain Velasquez",
        "aliases": [
          "Cain"
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
          "The Natural"
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
        "name": "Derrick Lewis",
        "aliases": [
          "Black Beast"
        ]
      },
      {
        "name": "Brock Lesnar",
        "aliases": [
          "Lesnar"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Fabricio Werdum",
        "aliases": [
          "Vai Cavalo"
        ]
      },
      "Andrei Arlovski",
      {
        "name": "Frank Mir",
        "aliases": [
          "Mir"
        ]
      },
      {
        "name": "Mark Hunt",
        "aliases": [
          "Super Samoan"
        ]
      },
      "Alistair Overeem",
      {
        "name": "Tom Aspinall",
        "aliases": [
          "Aspinall"
        ]
      },
      {
        "name": "Ciryl Gane",
        "aliases": [
          "Bon Gamin"
        ]
      },
      {
        "name": "Jon Jones",
        "aliases": [
          "Bones"
        ]
      }
    ]
  },
  {
    "category": "fighter-legacy",
    "entityKind": "person",
    "collisionGroup": "women",
    "prompts": [
      {
        "prompt": "Name a legendary women's UFC fighter.",
        "answers": [
          "Amanda Nunes",
          "Ronda Rousey",
          "Valentina Shevchenko",
          "Joanna Jedrzejczyk",
          "Zhang Weili",
          "Rose Namajunas",
          "Holly Holm",
          "Cris Cyborg"
        ],
        "alsoAcceptedAnswers": [
          "Miesha Tate",
          "Julianna Pena",
          "Alexa Grasso",
          "Jessica Andrade",
          "Kayla Harrison"
        ]
      },
      {
        "prompt": "Name a woman whose career helped shape UFC history.",
        "answers": [
          "Ronda Rousey",
          "Amanda Nunes",
          "Joanna Jedrzejczyk",
          "Valentina Shevchenko",
          "Miesha Tate",
          "Holly Holm",
          "Rose Namajunas",
          "Zhang Weili"
        ],
        "alsoAcceptedAnswers": [
          "Cris Cyborg",
          "Julianna Pena",
          "Alexa Grasso",
          "Jessica Andrade",
          "Kayla Harrison"
        ]
      },
      {
        "prompt": "Name a female UFC star almost every MMA fan recognizes.",
        "answers": [
          "Ronda Rousey",
          "Amanda Nunes",
          "Valentina Shevchenko",
          "Holly Holm",
          "Rose Namajunas",
          "Joanna Jedrzejczyk",
          "Zhang Weili",
          "Miesha Tate"
        ],
        "alsoAcceptedAnswers": [
          "Cris Cyborg",
          "Julianna Pena",
          "Alexa Grasso",
          "Jessica Andrade",
          "Kayla Harrison"
        ]
      },
      {
        "prompt": "Name a women's champion you would include in an all-time UFC conversation.",
        "answers": [
          "Amanda Nunes",
          "Valentina Shevchenko",
          "Ronda Rousey",
          "Joanna Jedrzejczyk",
          "Zhang Weili",
          "Rose Namajunas",
          "Cris Cyborg",
          "Holly Holm"
        ],
        "alsoAcceptedAnswers": [
          "Miesha Tate",
          "Julianna Pena",
          "Alexa Grasso",
          "Jessica Andrade",
          "Kayla Harrison"
        ]
      },
      {
        "prompt": "Name a fighter who helped make women's MMA a major part of the UFC.",
        "answers": [
          "Ronda Rousey",
          "Amanda Nunes",
          "Miesha Tate",
          "Joanna Jedrzejczyk",
          "Holly Holm",
          "Valentina Shevchenko",
          "Rose Namajunas",
          "Zhang Weili"
        ],
        "alsoAcceptedAnswers": [
          "Cris Cyborg",
          "Julianna Pena",
          "Alexa Grasso",
          "Jessica Andrade",
          "Kayla Harrison"
        ]
      }
    ],
    "answers": [
      {
        "name": "Amanda Nunes",
        "aliases": [
          "The Lioness"
        ]
      },
      {
        "name": "Ronda Rousey",
        "aliases": [
          "Rowdy"
        ]
      },
      {
        "name": "Valentina Shevchenko",
        "aliases": [
          "Bullet"
        ]
      },
      {
        "name": "Joanna Jedrzejczyk",
        "aliases": [
          "Joanna"
        ]
      },
      {
        "name": "Rose Namajunas",
        "aliases": [
          "Thug Rose"
        ]
      },
      {
        "name": "Cris Cyborg",
        "aliases": [
          "Cyborg"
        ]
      },
      {
        "name": "Zhang Weili",
        "aliases": [
          "Weili",
          "Magnum"
        ]
      },
      {
        "name": "Holly Holm",
        "aliases": [
          "Preacher's Daughter"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Miesha Tate",
        "aliases": [
          "Cupcake"
        ]
      },
      {
        "name": "Julianna Pena",
        "aliases": [
          "Pena",
          "Peña"
        ]
      },
      "Alexa Grasso",
      "Jessica Andrade",
      {
        "name": "Kayla Harrison",
        "aliases": [
          "Kayla"
        ]
      }
    ]
  },
  {
    "category": "gyms",
    "entityKind": "other",
    "collisionGroup": "gyms",
    "prompts": [
      {
        "prompt": "Name a gym or team strongly associated with UFC fighters.",
        "answers": [
          "American Top Team",
          "AKA",
          "Jackson Wink",
          "City Kickboxing",
          "Xtreme Couture",
          "Team Alpha Male",
          "Nova Uniao",
          "Tristar Gym"
        ],
        "alsoAcceptedAnswers": [
          "Roufusport",
          "Kings MMA",
          "Serra-Longo",
          "MMA Lab",
          "Kill Cliff FC"
        ]
      },
      {
        "prompt": "Name a famous MMA camp that has produced UFC talent.",
        "answers": [
          "American Top Team",
          "AKA",
          "Jackson Wink",
          "City Kickboxing",
          "Xtreme Couture",
          "Nova Uniao",
          "Team Alpha Male",
          "Kings MMA"
        ],
        "alsoAcceptedAnswers": [
          "Roufusport",
          "Tristar Gym",
          "Serra-Longo",
          "MMA Lab",
          "Kill Cliff FC"
        ]
      },
      {
        "prompt": "Name a training team serious UFC fans recognize.",
        "answers": [
          "American Top Team",
          "AKA",
          "City Kickboxing",
          "Jackson Wink",
          "Team Alpha Male",
          "Xtreme Couture",
          "Tristar Gym",
          "Kill Cliff FC"
        ],
        "alsoAcceptedAnswers": [
          "Nova Uniao",
          "Roufusport",
          "Kings MMA",
          "Serra-Longo",
          "MMA Lab"
        ]
      },
      {
        "prompt": "Name a gym you would expect to hear mentioned during a UFC broadcast.",
        "answers": [
          "American Top Team",
          "AKA",
          "City Kickboxing",
          "Jackson Wink",
          "Xtreme Couture",
          "Team Alpha Male",
          "Kill Cliff FC",
          "Kings MMA"
        ],
        "alsoAcceptedAnswers": [
          "Nova Uniao",
          "Roufusport",
          "Tristar Gym",
          "Serra-Longo",
          "MMA Lab"
        ]
      },
      {
        "prompt": "Name an MMA team associated with multiple notable UFC fighters.",
        "answers": [
          "American Top Team",
          "AKA",
          "Jackson Wink",
          "City Kickboxing",
          "Xtreme Couture",
          "Team Alpha Male",
          "Nova Uniao",
          "Tristar Gym"
        ],
        "alsoAcceptedAnswers": [
          "Roufusport",
          "Kings MMA",
          "Serra-Longo",
          "MMA Lab",
          "Kill Cliff FC"
        ]
      }
    ],
    "answers": [
      {
        "name": "American Top Team",
        "aliases": [
          "ATT"
        ]
      },
      {
        "name": "AKA",
        "aliases": [
          "American Kickboxing Academy"
        ]
      },
      {
        "name": "Jackson Wink",
        "aliases": [
          "Jackson-Wink",
          "Jackson Wink MMA"
        ]
      },
      {
        "name": "City Kickboxing",
        "aliases": [
          "CKB"
        ]
      },
      {
        "name": "Xtreme Couture",
        "aliases": [
          "Extreme Couture"
        ]
      },
      {
        "name": "Nova Uniao",
        "aliases": [
          "Nova União"
        ]
      },
      {
        "name": "Team Alpha Male",
        "aliases": [
          "TAM"
        ]
      },
      {
        "name": "Roufusport",
        "aliases": [
          "Roufus Sport"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Tristar Gym",
        "aliases": [
          "Tristar"
        ]
      },
      {
        "name": "Kings MMA",
        "aliases": [
          "Kings"
        ]
      },
      {
        "name": "Serra-Longo",
        "aliases": [
          "Serra Longo"
        ]
      },
      {
        "name": "MMA Lab",
        "aliases": [
          "The MMA Lab"
        ]
      },
      {
        "name": "Kill Cliff FC",
        "aliases": [
          "Kill Cliff"
        ]
      }
    ]
  },
  {
    "category": "rivalries",
    "entityKind": "other",
    "collisionGroup": "rivalries",
    "prompts": [
      {
        "prompt": "Name a famous UFC rivalry.",
        "answers": [
          "Jones-Cormier",
          "McGregor-Nurmagomedov",
          "McGregor-Diaz",
          "Liddell-Ortiz",
          "Silva-Sonnen",
          "Adesanya-Pereira",
          "Ortiz-Shamrock",
          "Usman-Covington"
        ],
        "alsoAcceptedAnswers": [
          "Hughes-St-Pierre",
          "Couture-Liddell",
          "McGregor-Aldo",
          "Nunes-Shevchenko",
          "Poirier-McGregor",
          "Lesnar-Mir"
        ]
      },
      {
        "prompt": "Name a pair of fighters whose bad blood made the fight bigger.",
        "answers": [
          "Jones-Cormier",
          "McGregor-Nurmagomedov",
          "Liddell-Ortiz",
          "Ortiz-Shamrock",
          "Usman-Covington",
          "McGregor-Diaz",
          "Poirier-McGregor",
          "Silva-Sonnen"
        ],
        "alsoAcceptedAnswers": [
          "Hughes-St-Pierre",
          "Couture-Liddell",
          "Adesanya-Pereira",
          "McGregor-Aldo",
          "Nunes-Shevchenko",
          "Lesnar-Mir"
        ]
      },
      {
        "prompt": "Name a UFC feud fans still remember.",
        "answers": [
          "Jones-Cormier",
          "McGregor-Diaz",
          "Liddell-Ortiz",
          "Silva-Sonnen",
          "McGregor-Nurmagomedov",
          "Ortiz-Shamrock",
          "Adesanya-Pereira",
          "Hughes-St-Pierre"
        ],
        "alsoAcceptedAnswers": [
          "Couture-Liddell",
          "McGregor-Aldo",
          "Nunes-Shevchenko",
          "Usman-Covington",
          "Poirier-McGregor",
          "Lesnar-Mir"
        ]
      },
      {
        "prompt": "Name a rivalry that produced major UFC promotion and drama.",
        "answers": [
          "McGregor-Nurmagomedov",
          "Jones-Cormier",
          "McGregor-Diaz",
          "Liddell-Ortiz",
          "Usman-Covington",
          "Poirier-McGregor",
          "Adesanya-Pereira",
          "Ortiz-Shamrock"
        ],
        "alsoAcceptedAnswers": [
          "Silva-Sonnen",
          "Hughes-St-Pierre",
          "Couture-Liddell",
          "McGregor-Aldo",
          "Nunes-Shevchenko",
          "Lesnar-Mir"
        ]
      },
      {
        "prompt": "Name two fighters whose rivalry became part of UFC history.",
        "answers": [
          "Jones-Cormier",
          "Liddell-Ortiz",
          "McGregor-Diaz",
          "Silva-Sonnen",
          "McGregor-Nurmagomedov",
          "Hughes-St-Pierre",
          "Couture-Liddell",
          "Adesanya-Pereira"
        ],
        "alsoAcceptedAnswers": [
          "Ortiz-Shamrock",
          "McGregor-Aldo",
          "Nunes-Shevchenko",
          "Usman-Covington",
          "Poirier-McGregor",
          "Lesnar-Mir"
        ]
      }
    ],
    "answers": [
      {
        "name": "McGregor-Diaz",
        "aliases": [
          "McGregor vs Diaz",
          "Conor vs Nate"
        ]
      },
      {
        "name": "Jones-Cormier",
        "aliases": [
          "Jones vs Cormier",
          "Jones DC"
        ]
      },
      {
        "name": "Liddell-Ortiz",
        "aliases": [
          "Liddell vs Ortiz",
          "Chuck vs Tito"
        ]
      },
      {
        "name": "Silva-Sonnen",
        "aliases": [
          "Silva vs Sonnen"
        ]
      },
      {
        "name": "McGregor-Nurmagomedov",
        "aliases": [
          "McGregor vs Khabib",
          "Conor vs Khabib"
        ]
      },
      {
        "name": "Hughes-St-Pierre",
        "aliases": [
          "Hughes vs GSP"
        ]
      },
      {
        "name": "Couture-Liddell",
        "aliases": [
          "Couture vs Liddell"
        ]
      },
      {
        "name": "Adesanya-Pereira",
        "aliases": [
          "Adesanya vs Pereira",
          "Izzy vs Pereira"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Ortiz-Shamrock",
        "aliases": [
          "Ortiz vs Shamrock"
        ]
      },
      {
        "name": "McGregor-Aldo",
        "aliases": [
          "McGregor vs Aldo"
        ]
      },
      {
        "name": "Nunes-Shevchenko",
        "aliases": [
          "Nunes vs Shevchenko"
        ]
      },
      {
        "name": "Usman-Covington",
        "aliases": [
          "Usman vs Covington"
        ]
      },
      {
        "name": "Poirier-McGregor",
        "aliases": [
          "Poirier vs McGregor"
        ]
      },
      {
        "name": "Lesnar-Mir",
        "aliases": [
          "Lesnar vs Mir"
        ]
      }
    ]
  },
  {
    "category": "fights",
    "entityKind": "other",
    "collisionGroup": "fights",
    "prompts": [
      {
        "prompt": "Name an iconic UFC fight.",
        "answers": [
          "Griffin-Bonnar",
          "Jones-Gustafsson 1",
          "Lawler-MacDonald 2",
          "Henderson-Shogun 1",
          "Zhang-Jedrzejczyk 1",
          "Adesanya-Gastelum",
          "McGregor-Diaz 2",
          "Silva-Sonnen 1"
        ],
        "alsoAcceptedAnswers": [
          "Poirier-Hooker",
          "Edgar-Maynard 2",
          "Hunt-Silva",
          "Usman-Covington 1",
          "Gaethje-Chandler",
          "Holloway-Kattar",
          "Holloway-Gaethje",
          "Whittaker-Romero 2",
          "Gaethje-Topuria"
        ]
      },
      {
        "prompt": "Name a UFC fight fans still recommend to new viewers.",
        "answers": [
          "Griffin-Bonnar",
          "Lawler-MacDonald 2",
          "Zhang-Jedrzejczyk 1",
          "Gaethje-Chandler",
          "Holloway-Kattar",
          "Poirier-Hooker",
          "Hunt-Silva",
          "Adesanya-Gastelum"
        ],
        "alsoAcceptedAnswers": [
          "Jones-Gustafsson 1",
          "Henderson-Shogun 1",
          "McGregor-Diaz 2",
          "Silva-Sonnen 1",
          "Edgar-Maynard 2",
          "Usman-Covington 1",
          "Holloway-Gaethje",
          "Whittaker-Romero 2",
          "Gaethje-Topuria"
        ]
      },
      {
        "prompt": "Name a bout that belongs in a UFC history montage.",
        "answers": [
          "Griffin-Bonnar",
          "Jones-Gustafsson 1",
          "Lawler-MacDonald 2",
          "Henderson-Shogun 1",
          "Silva-Sonnen 1",
          "McGregor-Diaz 2",
          "Zhang-Jedrzejczyk 1",
          "Holloway-Gaethje"
        ],
        "alsoAcceptedAnswers": [
          "Adesanya-Gastelum",
          "Poirier-Hooker",
          "Edgar-Maynard 2",
          "Hunt-Silva",
          "Usman-Covington 1",
          "Gaethje-Chandler",
          "Holloway-Kattar",
          "Whittaker-Romero 2",
          "Gaethje-Topuria"
        ]
      },
      {
        "prompt": "Name a fight remembered for incredible action or stakes.",
        "answers": [
          "Lawler-MacDonald 2",
          "Jones-Gustafsson 1",
          "Henderson-Shogun 1",
          "Zhang-Jedrzejczyk 1",
          "Adesanya-Gastelum",
          "McGregor-Diaz 2",
          "Usman-Covington 1",
          "Whittaker-Romero 2"
        ],
        "alsoAcceptedAnswers": [
          "Griffin-Bonnar",
          "Poirier-Hooker",
          "Silva-Sonnen 1",
          "Edgar-Maynard 2",
          "Hunt-Silva",
          "Gaethje-Chandler",
          "Holloway-Kattar",
          "Holloway-Gaethje",
          "Gaethje-Topuria"
        ]
      },
      {
        "prompt": "Name a UFC matchup people still talk about years later.",
        "answers": [
          "Griffin-Bonnar",
          "Jones-Gustafsson 1",
          "Lawler-MacDonald 2",
          "McGregor-Diaz 2",
          "Silva-Sonnen 1",
          "Henderson-Shogun 1",
          "Zhang-Jedrzejczyk 1",
          "Adesanya-Gastelum"
        ],
        "alsoAcceptedAnswers": [
          "Poirier-Hooker",
          "Edgar-Maynard 2",
          "Hunt-Silva",
          "Usman-Covington 1",
          "Gaethje-Chandler",
          "Holloway-Kattar",
          "Holloway-Gaethje",
          "Whittaker-Romero 2",
          "Gaethje-Topuria"
        ]
      }
    ],
    "answers": [
      {
        "name": "Griffin-Bonnar",
        "aliases": [
          "Griffin vs Bonnar"
        ]
      },
      {
        "name": "Jones-Gustafsson 1",
        "aliases": [
          "Jones vs Gustafsson 1",
          "Jones Gustafsson"
        ]
      },
      {
        "name": "Lawler-MacDonald 2",
        "aliases": [
          "Lawler vs MacDonald 2",
          "Lawler Rory 2"
        ]
      },
      {
        "name": "Henderson-Shogun 1",
        "aliases": [
          "Henderson vs Shogun 1",
          "Hendo Shogun"
        ]
      },
      {
        "name": "Adesanya-Gastelum",
        "aliases": [
          "Adesanya vs Gastelum",
          "Izzy Gastelum"
        ]
      },
      {
        "name": "Zhang-Jedrzejczyk 1",
        "aliases": [
          "Zhang vs Joanna 1",
          "Weili Joanna"
        ]
      },
      {
        "name": "McGregor-Diaz 2",
        "aliases": [
          "McGregor vs Diaz 2",
          "Conor Nate 2"
        ]
      },
      {
        "name": "Poirier-Hooker",
        "aliases": [
          "Poirier vs Hooker"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Silva-Sonnen 1",
        "aliases": [
          "Silva vs Sonnen 1"
        ]
      },
      {
        "name": "Edgar-Maynard 2",
        "aliases": [
          "Edgar vs Maynard 2"
        ]
      },
      {
        "name": "Hunt-Silva",
        "aliases": [
          "Hunt vs Silva"
        ]
      },
      {
        "name": "Usman-Covington 1",
        "aliases": [
          "Usman vs Covington 1"
        ]
      },
      {
        "name": "Gaethje-Chandler",
        "aliases": [
          "Gaethje vs Chandler"
        ]
      },
      {
        "name": "Holloway-Kattar",
        "aliases": [
          "Holloway vs Kattar"
        ]
      },
      {
        "name": "Holloway-Gaethje",
        "aliases": [
          "Holloway vs Gaethje"
        ]
      },
      {
        "name": "Whittaker-Romero 2",
        "aliases": [
          "Whittaker vs Romero 2"
        ]
      },
      {
        "name": "Gaethje-Topuria",
        "aliases": [
          "Gaethje vs Topuria",
          "Justin vs Ilia",
          "Gaethje Topuria"
        ]
      }
    ]
  },
  {
    "category": "venues",
    "entityKind": "other",
    "collisionGroup": "venues",
    "prompts": [
      {
        "prompt": "Name a UFC arena, host city, or named event site strongly associated with major cards.",
        "answers": [
          "T-Mobile Arena",
          "Madison Square Garden",
          "MGM Grand Garden Arena",
          "UFC APEX",
          "The O2",
          "Etihad Arena",
          "Fight Island",
          "Las Vegas"
        ],
        "alsoAcceptedAnswers": [
          "Honda Center",
          "Abu Dhabi",
          "London",
          "Anaheim",
          "New York City"
        ]
      },
      {
        "prompt": "Name a UFC arena, host city, or named event site where you can picture a huge card.",
        "answers": [
          "T-Mobile Arena",
          "Madison Square Garden",
          "MGM Grand Garden Arena",
          "Etihad Arena",
          "The O2",
          "Honda Center",
          "Las Vegas",
          "New York City"
        ],
        "alsoAcceptedAnswers": [
          "UFC APEX",
          "Fight Island",
          "Abu Dhabi",
          "London",
          "Anaheim"
        ]
      },
      {
        "prompt": "Name an arena, host city, or named event site tied to memorable UFC nights.",
        "answers": [
          "MGM Grand Garden Arena",
          "T-Mobile Arena",
          "Madison Square Garden",
          "Fight Island",
          "The O2",
          "Honda Center",
          "Etihad Arena",
          "UFC APEX"
        ],
        "alsoAcceptedAnswers": [
          "Las Vegas",
          "Abu Dhabi",
          "London",
          "Anaheim",
          "New York City"
        ]
      },
      {
        "prompt": "Name a UFC arena, host city, or named event site fans associate with big fights.",
        "answers": [
          "T-Mobile Arena",
          "Madison Square Garden",
          "MGM Grand Garden Arena",
          "Las Vegas",
          "Fight Island",
          "Etihad Arena",
          "The O2",
          "UFC APEX"
        ],
        "alsoAcceptedAnswers": [
          "Honda Center",
          "Abu Dhabi",
          "London",
          "Anaheim",
          "New York City"
        ]
      },
      {
        "prompt": "Name an arena, host city, or named event site familiar to longtime UFC fans.",
        "answers": [
          "MGM Grand Garden Arena",
          "T-Mobile Arena",
          "UFC APEX",
          "Madison Square Garden",
          "The O2",
          "Honda Center",
          "Las Vegas",
          "Abu Dhabi"
        ],
        "alsoAcceptedAnswers": [
          "Fight Island",
          "Etihad Arena",
          "London",
          "Anaheim",
          "New York City"
        ]
      }
    ],
    "answers": [
      {
        "name": "T-Mobile Arena",
        "aliases": [
          "T Mobile",
          "TMobile"
        ]
      },
      {
        "name": "Madison Square Garden",
        "aliases": [
          "MSG"
        ]
      },
      {
        "name": "MGM Grand Garden Arena",
        "aliases": [
          "MGM Grand",
          "MGM"
        ]
      },
      {
        "name": "UFC APEX",
        "aliases": [
          "Apex",
          "UFC Apex"
        ]
      },
      {
        "name": "The O2",
        "aliases": [
          "O2",
          "O2 Arena"
        ]
      },
      {
        "name": "Fight Island",
        "aliases": [
          "Yas Island"
        ]
      },
      {
        "name": "Honda Center",
        "aliases": [
          "Honda"
        ]
      },
      {
        "name": "Etihad Arena",
        "aliases": [
          "Etihad"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Las Vegas",
        "aliases": [
          "Vegas"
        ]
      },
      "Abu Dhabi",
      "London",
      "Anaheim",
      {
        "name": "New York City",
        "aliases": [
          "NYC",
          "New York"
        ]
      }
    ]
  },
  {
    "category": "achievements",
    "entityKind": "other",
    "collisionGroup": "achievements",
    "prompts": [
      {
        "prompt": "Name a UFC accomplishment that can define a fighter's legacy.",
        "answers": [
          "Win a UFC title",
          "Defend the title repeatedly",
          "Become a two-division champion",
          "Beat another all-time great",
          "Long winning streak",
          "Set a UFC record",
          "Record a famous knockout",
          "Enter the UFC Hall of Fame"
        ],
        "alsoAcceptedAnswers": [
          "Headline a huge PPV",
          "Become pound-for-pound No. 1",
          "Win The Ultimate Fighter",
          "Win Fight of the Night awards",
          "Retire as champion"
        ]
      },
      {
        "prompt": "Name something a UFC fighter would love on a career résumé.",
        "answers": [
          "Win a UFC title",
          "Defend the title repeatedly",
          "Become a two-division champion",
          "Enter the UFC Hall of Fame",
          "Set a UFC record",
          "Become pound-for-pound No. 1",
          "Beat another all-time great",
          "Headline a huge PPV"
        ],
        "alsoAcceptedAnswers": [
          "Long winning streak",
          "Record a famous knockout",
          "Win The Ultimate Fighter",
          "Win Fight of the Night awards",
          "Retire as champion"
        ]
      },
      {
        "prompt": "Name an achievement that can turn a great UFC career into a legendary one.",
        "answers": [
          "Become a two-division champion",
          "Defend the title repeatedly",
          "Win a UFC title",
          "Enter the UFC Hall of Fame",
          "Set a UFC record",
          "Long winning streak",
          "Beat another all-time great",
          "Retire as champion"
        ],
        "alsoAcceptedAnswers": [
          "Headline a huge PPV",
          "Record a famous knockout",
          "Become pound-for-pound No. 1",
          "Win The Ultimate Fighter",
          "Win Fight of the Night awards"
        ]
      },
      {
        "prompt": "Name a milestone MMA fans use in legacy debates.",
        "answers": [
          "Defend the title repeatedly",
          "Become a two-division champion",
          "Long winning streak",
          "Win a UFC title",
          "Become pound-for-pound No. 1",
          "Set a UFC record",
          "Beat another all-time great",
          "Enter the UFC Hall of Fame"
        ],
        "alsoAcceptedAnswers": [
          "Headline a huge PPV",
          "Record a famous knockout",
          "Win The Ultimate Fighter",
          "Win Fight of the Night awards",
          "Retire as champion"
        ]
      },
      {
        "prompt": "Name something a fighter can accomplish that fans remember for years.",
        "answers": [
          "Win a UFC title",
          "Record a famous knockout",
          "Become a two-division champion",
          "Defend the title repeatedly",
          "Beat another all-time great",
          "Set a UFC record",
          "Enter the UFC Hall of Fame",
          "Win Fight of the Night awards"
        ],
        "alsoAcceptedAnswers": [
          "Long winning streak",
          "Headline a huge PPV",
          "Become pound-for-pound No. 1",
          "Win The Ultimate Fighter",
          "Retire as champion"
        ]
      }
    ],
    "answers": [
      {
        "name": "Win a UFC title",
        "aliases": [
          "Win title",
          "Win the title",
          "Become champion",
          "UFC champ"
        ]
      },
      {
        "name": "Defend the title repeatedly",
        "aliases": [
          "Title defenses",
          "Defend title",
          "Multiple defenses"
        ]
      },
      {
        "name": "Become a two-division champion",
        "aliases": [
          "Double champ",
          "Champ champ",
          "Two division champ",
          "Two-division champ"
        ]
      },
      {
        "name": "Beat another all-time great",
        "aliases": [
          "Beat a legend",
          "Beat an all time great"
        ]
      },
      {
        "name": "Long winning streak",
        "aliases": [
          "Win streak",
          "Winning streak"
        ]
      },
      {
        "name": "Headline a huge PPV",
        "aliases": [
          "Headline PPV",
          "Main event PPV"
        ]
      },
      {
        "name": "Record a famous knockout",
        "aliases": [
          "Famous KO",
          "Big KO",
          "Iconic knockout"
        ]
      },
      {
        "name": "Enter the UFC Hall of Fame",
        "aliases": [
          "Hall of Fame",
          "HOF",
          "UFC HOF"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Become pound-for-pound No. 1",
        "aliases": [
          "P4P number 1",
          "P4P #1",
          "Pound for pound number 1"
        ]
      },
      {
        "name": "Win The Ultimate Fighter",
        "aliases": [
          "Win TUF",
          "TUF winner"
        ]
      },
      {
        "name": "Set a UFC record",
        "aliases": [
          "UFC record",
          "Set record"
        ]
      },
      {
        "name": "Win Fight of the Night awards",
        "aliases": [
          "Fight of the Night",
          "FOTN"
        ]
      },
      {
        "name": "Retire as champion",
        "aliases": [
          "Retire champ",
          "Retire champion"
        ]
      }
    ]
  },
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
        "prompt": "Name a division on a UFC card.",
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
        "prompt": "Name a UFC weight class fans discuss constantly.",
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
        "prompt": "Name a division that has produced famous champions.",
        "answers": [
          "Heavyweight",
          "Light heavyweight",
          "Middleweight",
          "Welterweight",
          "Lightweight",
          "Featherweight",
          "Bantamweight",
          "Flyweight"
        ],
        "alsoAcceptedAnswers": [
          "Strawweight",
          "Women's flyweight",
          "Women's bantamweight"
        ]
      },
      {
        "prompt": "Name a weight class a UFC fighter can compete in.",
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
      }
    ],
    "answers": [
      {
        "name": "Lightweight",
        "aliases": [
          "LW"
        ]
      },
      {
        "name": "Welterweight",
        "aliases": [
          "WW"
        ]
      },
      {
        "name": "Middleweight",
        "aliases": [
          "MW"
        ]
      },
      {
        "name": "Featherweight",
        "aliases": [
          "FW"
        ]
      },
      {
        "name": "Bantamweight",
        "aliases": [
          "BW"
        ]
      },
      {
        "name": "Heavyweight",
        "aliases": [
          "HW"
        ]
      },
      {
        "name": "Light heavyweight",
        "aliases": [
          "LHW"
        ]
      },
      {
        "name": "Flyweight",
        "aliases": [
          "FLW"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Strawweight",
        "aliases": [
          "SW"
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
    "category": "traits",
    "entityKind": "other",
    "collisionGroup": "traits",
    "prompts": [
      {
        "prompt": "Name a trait every elite UFC fighter needs.",
        "answers": [
          "Cardio",
          "Fight IQ",
          "Durability",
          "Composure",
          "Toughness",
          "Adaptability",
          "Discipline",
          "Wrestling defense"
        ],
        "alsoAcceptedAnswers": [
          "Power",
          "Speed",
          "Striking",
          "Wrestling",
          "Submission defense",
          "Recovery"
        ]
      },
      {
        "prompt": "Name a quality that can separate a contender from the rest of the division.",
        "answers": [
          "Fight IQ",
          "Cardio",
          "Composure",
          "Adaptability",
          "Durability",
          "Wrestling defense",
          "Power",
          "Speed"
        ],
        "alsoAcceptedAnswers": [
          "Toughness",
          "Striking",
          "Wrestling",
          "Submission defense",
          "Discipline",
          "Recovery"
        ]
      },
      {
        "prompt": "Name something coaches want to see in a championship-level fighter.",
        "answers": [
          "Fight IQ",
          "Cardio",
          "Discipline",
          "Adaptability",
          "Composure",
          "Durability",
          "Wrestling defense",
          "Submission defense"
        ],
        "alsoAcceptedAnswers": [
          "Power",
          "Speed",
          "Toughness",
          "Striking",
          "Wrestling",
          "Recovery"
        ]
      },
      {
        "prompt": "Name a fighter trait fans notice quickly.",
        "answers": [
          "Power",
          "Speed",
          "Cardio",
          "Durability",
          "Toughness",
          "Composure",
          "Wrestling",
          "Striking"
        ],
        "alsoAcceptedAnswers": [
          "Fight IQ",
          "Wrestling defense",
          "Submission defense",
          "Adaptability",
          "Discipline",
          "Recovery"
        ]
      },
      {
        "prompt": "Name a quality that matters when a UFC fight gets difficult.",
        "answers": [
          "Composure",
          "Cardio",
          "Fight IQ",
          "Durability",
          "Toughness",
          "Adaptability",
          "Recovery",
          "Discipline"
        ],
        "alsoAcceptedAnswers": [
          "Power",
          "Speed",
          "Wrestling defense",
          "Striking",
          "Wrestling",
          "Submission defense"
        ]
      }
    ],
    "answers": [
      "Cardio",
      {
        "name": "Fight IQ",
        "aliases": [
          "IQ"
        ]
      },
      "Durability",
      "Power",
      "Speed",
      {
        "name": "Wrestling defense",
        "aliases": [
          "Takedown defense",
          "TDD"
        ]
      },
      "Composure",
      "Toughness"
    ],
    "alsoAcceptedAnswers": [
      "Striking",
      "Wrestling",
      {
        "name": "Submission defense",
        "aliases": [
          "Sub defense"
        ]
      },
      "Adaptability",
      "Discipline",
      "Recovery"
    ]
  },
  {
    "category": "techniques",
    "entityKind": "other",
    "collisionGroup": "techniques",
    "prompts": [
      {
        "prompt": "Name a technique you might see finish a UFC fight.",
        "answers": [
          "Rear-naked choke",
          "Guillotine",
          "Armbar",
          "Head kick",
          "Ground-and-pound",
          "Triangle choke",
          "Knee",
          "Elbow"
        ],
        "alsoAcceptedAnswers": [
          "Left hook",
          "Body shot",
          "Arm-triangle choke",
          "Kimura",
          "Uppercut",
          "Heel hook"
        ]
      },
      {
        "prompt": "Name a move that can end an MMA fight suddenly.",
        "answers": [
          "Head kick",
          "Left hook",
          "Rear-naked choke",
          "Guillotine",
          "Knee",
          "Elbow",
          "Body shot",
          "Uppercut"
        ],
        "alsoAcceptedAnswers": [
          "Armbar",
          "Ground-and-pound",
          "Triangle choke",
          "Arm-triangle choke",
          "Kimura",
          "Heel hook"
        ]
      },
      {
        "prompt": "Name a technique fighters drill because it can produce a finish.",
        "answers": [
          "Rear-naked choke",
          "Guillotine",
          "Armbar",
          "Triangle choke",
          "Head kick",
          "Ground-and-pound",
          "Arm-triangle choke",
          "Heel hook"
        ],
        "alsoAcceptedAnswers": [
          "Left hook",
          "Body shot",
          "Kimura",
          "Knee",
          "Elbow",
          "Uppercut"
        ]
      },
      {
        "prompt": "Name an MMA attack fans recognize immediately.",
        "answers": [
          "Rear-naked choke",
          "Head kick",
          "Armbar",
          "Guillotine",
          "Triangle choke",
          "Knee",
          "Elbow",
          "Ground-and-pound"
        ],
        "alsoAcceptedAnswers": [
          "Left hook",
          "Body shot",
          "Arm-triangle choke",
          "Kimura",
          "Uppercut",
          "Heel hook"
        ]
      },
      {
        "prompt": "Name a finishing technique that can change a UFC fight in seconds.",
        "answers": [
          "Head kick",
          "Rear-naked choke",
          "Left hook",
          "Guillotine",
          "Armbar",
          "Ground-and-pound",
          "Knee",
          "Body shot"
        ],
        "alsoAcceptedAnswers": [
          "Triangle choke",
          "Arm-triangle choke",
          "Kimura",
          "Elbow",
          "Uppercut",
          "Heel hook"
        ]
      }
    ],
    "answers": [
      {
        "name": "Rear-naked choke",
        "aliases": [
          "RNC",
          "Rear naked choke"
        ]
      },
      {
        "name": "Guillotine",
        "aliases": [
          "Guillotine choke"
        ]
      },
      {
        "name": "Armbar",
        "aliases": [
          "Arm bar"
        ]
      },
      {
        "name": "Head kick",
        "aliases": [
          "High kick"
        ]
      },
      {
        "name": "Left hook",
        "aliases": [
          "Hook"
        ]
      },
      {
        "name": "Ground-and-pound",
        "aliases": [
          "GNP",
          "Ground and pound",
          "Ground pound"
        ]
      },
      {
        "name": "Triangle choke",
        "aliases": [
          "Triangle"
        ]
      },
      {
        "name": "Body shot",
        "aliases": [
          "Body punch",
          "Shot to body"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Arm-triangle choke",
        "aliases": [
          "Arm triangle"
        ]
      },
      "Kimura",
      {
        "name": "Knee",
        "aliases": [
          "Knee strike"
        ]
      },
      {
        "name": "Elbow",
        "aliases": [
          "Elbow strike"
        ]
      },
      {
        "name": "Uppercut",
        "aliases": [
          "Upper cut"
        ]
      },
      {
        "name": "Heel hook",
        "aliases": [
          "Heelhook"
        ]
      }
    ]
  },
  {
    "category": "culture",
    "entityKind": "person",
    "collisionGroup": "culture",
    "prompts": [
      {
        "prompt": "Name a UFC fighter known for a memorable walkout or entrance.",
        "answers": [
          "Conor McGregor",
          "Israel Adesanya",
          "Alex Pereira",
          "Darren Till",
          "Paddy Pimblett",
          "Tom Aspinall",
          "Max Holloway",
          "The Korean Zombie"
        ],
        "alsoAcceptedAnswers": [
          "Jiri Prochazka",
          "Anderson Silva",
          "Ronda Rousey",
          "Tai Tuivasa",
          "Mike Perry",
          "Diego Sanchez"
        ]
      },
      {
        "prompt": "Name a fighter whose walk to the cage feels like part of the show.",
        "answers": [
          "Alex Pereira",
          "Israel Adesanya",
          "Conor McGregor",
          "Darren Till",
          "Paddy Pimblett",
          "The Korean Zombie",
          "Jiri Prochazka",
          "Tom Aspinall"
        ],
        "alsoAcceptedAnswers": [
          "Max Holloway",
          "Anderson Silva",
          "Ronda Rousey",
          "Tai Tuivasa",
          "Mike Perry",
          "Diego Sanchez"
        ]
      },
      {
        "prompt": "Name a UFC star with an entrance fans look forward to.",
        "answers": [
          "Alex Pereira",
          "Israel Adesanya",
          "Conor McGregor",
          "Paddy Pimblett",
          "Darren Till",
          "Tom Aspinall",
          "Max Holloway",
          "The Korean Zombie"
        ],
        "alsoAcceptedAnswers": [
          "Jiri Prochazka",
          "Anderson Silva",
          "Ronda Rousey",
          "Tai Tuivasa",
          "Mike Perry",
          "Diego Sanchez"
        ]
      },
      {
        "prompt": "Name a fighter whose walkout helps create a big-fight atmosphere.",
        "answers": [
          "Conor McGregor",
          "Alex Pereira",
          "Israel Adesanya",
          "Darren Till",
          "Paddy Pimblett",
          "Tom Aspinall",
          "Jiri Prochazka",
          "Ronda Rousey"
        ],
        "alsoAcceptedAnswers": [
          "Max Holloway",
          "Anderson Silva",
          "The Korean Zombie",
          "Tai Tuivasa",
          "Mike Perry",
          "Diego Sanchez"
        ]
      },
      {
        "prompt": "Name a UFC fighter whose entrance has become part of the fan experience.",
        "answers": [
          "Alex Pereira",
          "Conor McGregor",
          "Israel Adesanya",
          "Darren Till",
          "Paddy Pimblett",
          "The Korean Zombie",
          "Max Holloway",
          "Jiri Prochazka"
        ],
        "alsoAcceptedAnswers": [
          "Tom Aspinall",
          "Anderson Silva",
          "Ronda Rousey",
          "Tai Tuivasa",
          "Mike Perry",
          "Diego Sanchez"
        ]
      }
    ],
    "answers": [
      {
        "name": "Conor McGregor",
        "aliases": [
          "Conor",
          "Notorious"
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
      "Darren Till",
      {
        "name": "Tom Aspinall",
        "aliases": [
          "Aspinall"
        ]
      },
      "Paddy Pimblett",
      "Max Holloway",
      {
        "name": "Jiri Prochazka",
        "aliases": [
          "Jiri"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Anderson Silva",
        "aliases": [
          "The Spider"
        ]
      },
      {
        "name": "Ronda Rousey",
        "aliases": [
          "Rowdy"
        ]
      },
      {
        "name": "The Korean Zombie",
        "aliases": [
          "Korean Zombie",
          "Chan Sung Jung"
        ]
      },
      "Tai Tuivasa",
      "Mike Perry",
      "Diego Sanchez"
    ]
  }
] as const);
