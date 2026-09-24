import { expandSportsFeudFamilies } from "./sportsFeudAuthoredHelpers";

export const UFC_SPORTS_FEUD_FAST_4 = expandSportsFeudFamilies("ufc-fast4", [
  {
    "category": "rules",
    "entityKind": "other",
    "collisionGroup": "finishes",
    "prompts": [
      {
        "prompt": "Name a broad way a UFC fight can end.",
        "answers": [
          "Knockout",
          "TKO",
          "Submission",
          "Decision",
          "Doctor stoppage",
          "Disqualification",
          "No contest",
          "Corner stoppage"
        ],
        "alsoAcceptedAnswers": [
          "Draw",
          "Technical decision",
          "Technical draw"
        ]
      },
      {
        "prompt": "Name a basic result type you can see on a UFC fight result.",
        "answers": [
          "Knockout",
          "TKO",
          "Submission",
          "Decision",
          "Doctor stoppage",
          "Disqualification",
          "No contest",
          "Corner stoppage"
        ],
        "alsoAcceptedAnswers": [
          "Draw",
          "Technical decision",
          "Technical draw"
        ]
      },
      {
        "prompt": "Name a common official outcome for an MMA fight.",
        "answers": [
          "Decision",
          "TKO",
          "Submission",
          "Knockout",
          "No contest",
          "Doctor stoppage",
          "Disqualification",
          "Corner stoppage"
        ],
        "alsoAcceptedAnswers": [
          "Draw",
          "Technical decision",
          "Technical draw"
        ]
      },
      {
        "prompt": "Name a broad finish or result type in the UFC.",
        "answers": [
          "Knockout",
          "TKO",
          "Submission",
          "Decision",
          "Doctor stoppage",
          "Disqualification",
          "No contest",
          "Corner stoppage"
        ],
        "alsoAcceptedAnswers": [
          "Draw",
          "Technical decision",
          "Technical draw"
        ]
      },
      {
        "prompt": "Name a simple UFC fight outcome.",
        "answers": [
          "Knockout",
          "Submission",
          "Decision",
          "TKO",
          "Doctor stoppage",
          "Disqualification",
          "No contest",
          "Corner stoppage"
        ],
        "alsoAcceptedAnswers": [
          "Draw",
          "Technical decision",
          "Technical draw"
        ]
      }
    ],
    "answers": [
      {
        "name": "Knockout",
        "aliases": [
          "KO",
          "K.O."
        ]
      },
      {
        "name": "TKO",
        "aliases": [
          "Technical knockout",
          "Technical KO"
        ]
      },
      {
        "name": "Submission",
        "aliases": [
          "Sub",
          "Tapout",
          "Tap out"
        ]
      },
      {
        "name": "Decision",
        "aliases": [
          "Dec",
          "Judges decision"
        ]
      },
      {
        "name": "Doctor stoppage",
        "aliases": [
          "Doctor",
          "Medical stoppage",
          "Doctor stop",
          "Doctor's stoppage"
        ]
      },
      {
        "name": "Disqualification",
        "aliases": [
          "DQ",
          "Disqualified",
          "D.Q."
        ]
      },
      {
        "name": "No contest",
        "aliases": [
          "NC",
          "No-contest"
        ]
      },
      {
        "name": "Corner stoppage",
        "aliases": [
          "Corner",
          "Corner stop",
          "Corner throws in towel",
          "Towel",
          "Throw in towel"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Draw",
        "aliases": [
          "Split draw",
          "Majority draw",
          "Tie"
        ]
      },
      {
        "name": "Technical decision",
        "aliases": [
          "Tech decision",
          "Technical dec"
        ]
      },
      {
        "name": "Technical draw",
        "aliases": [
          "Tech draw"
        ]
      }
    ]
  },
  {
    "category": "techniques",
    "entityKind": "other",
    "collisionGroup": "submissions",
    "prompts": [
      {
        "prompt": "Name a common MMA submission.",
        "answers": [
          "Rear-naked choke",
          "Guillotine",
          "Armbar",
          "Triangle choke",
          "Kimura",
          "Americana",
          "Arm-triangle choke",
          "Heel hook"
        ],
        "alsoAcceptedAnswers": [
          "D'Arce choke",
          "Anaconda choke",
          "Kneebar",
          "Neck crank",
          "Twister",
          "Calf slicer",
          "Von Flue choke",
          "Peruvian necktie"
        ]
      },
      {
        "prompt": "Name a submission you might see finish a UFC fight.",
        "answers": [
          "Rear-naked choke",
          "Guillotine",
          "Armbar",
          "Triangle choke",
          "Kimura",
          "Americana",
          "Arm-triangle choke",
          "Heel hook"
        ],
        "alsoAcceptedAnswers": [
          "D'Arce choke",
          "Anaconda choke",
          "Kneebar",
          "Neck crank",
          "Twister",
          "Calf slicer",
          "Von Flue choke",
          "Peruvian necktie"
        ]
      },
      {
        "prompt": "Name a grappling hold MMA fans recognize.",
        "answers": [
          "Rear-naked choke",
          "Armbar",
          "Triangle choke",
          "Guillotine",
          "Kimura",
          "Americana",
          "Arm-triangle choke",
          "Heel hook"
        ],
        "alsoAcceptedAnswers": [
          "D'Arce choke",
          "Anaconda choke",
          "Kneebar",
          "Neck crank",
          "Twister",
          "Calf slicer",
          "Von Flue choke",
          "Peruvian necktie"
        ]
      },
      {
        "prompt": "Name a submission fighters drill constantly.",
        "answers": [
          "Rear-naked choke",
          "Guillotine",
          "Armbar",
          "Kimura",
          "Triangle choke",
          "Americana",
          "Arm-triangle choke",
          "Heel hook"
        ],
        "alsoAcceptedAnswers": [
          "D'Arce choke",
          "Anaconda choke",
          "Kneebar",
          "Neck crank",
          "Twister",
          "Calf slicer",
          "Von Flue choke",
          "Peruvian necktie"
        ]
      },
      {
        "prompt": "Name a tap-out technique used in the UFC.",
        "answers": [
          "Rear-naked choke",
          "Guillotine",
          "Armbar",
          "Triangle choke",
          "Kimura",
          "Americana",
          "Arm-triangle choke",
          "Heel hook"
        ],
        "alsoAcceptedAnswers": [
          "D'Arce choke",
          "Anaconda choke",
          "Kneebar",
          "Neck crank",
          "Twister",
          "Calf slicer",
          "Von Flue choke",
          "Peruvian necktie"
        ]
      }
    ],
    "answers": [
      {
        "name": "Rear-naked choke",
        "aliases": [
          "RNC",
          "Rear naked",
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
        "name": "Triangle choke",
        "aliases": [
          "Triangle"
        ]
      },
      {
        "name": "Kimura",
        "aliases": [
          "Kimura lock"
        ]
      },
      {
        "name": "Americana",
        "aliases": [
          "Americana lock",
          "Keylock",
          "Key lock"
        ]
      },
      {
        "name": "Arm-triangle choke",
        "aliases": [
          "Arm triangle",
          "Arm-triangle",
          "Arm triangle choke"
        ]
      },
      {
        "name": "Heel hook",
        "aliases": [
          "Heelhook"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "D'Arce choke",
        "aliases": [
          "Darce",
          "D Arce",
          "Brabo choke"
        ]
      },
      {
        "name": "Anaconda choke",
        "aliases": [
          "Anaconda"
        ]
      },
      {
        "name": "Kneebar",
        "aliases": [
          "Knee bar"
        ]
      },
      {
        "name": "Neck crank",
        "aliases": [
          "Crank"
        ]
      },
      {
        "name": "Twister",
        "aliases": [
          "The Twister"
        ]
      },
      {
        "name": "Calf slicer",
        "aliases": [
          "Calf slice"
        ]
      },
      {
        "name": "Von Flue choke",
        "aliases": [
          "Von Flue",
          "Von Flue submission"
        ]
      },
      {
        "name": "Peruvian necktie",
        "aliases": [
          "Peruvian neck tie"
        ]
      }
    ]
  },
  {
    "category": "techniques",
    "entityKind": "other",
    "collisionGroup": "strikes",
    "prompts": [
      {
        "prompt": "Name a strike you can use in MMA.",
        "answers": [
          "Jab",
          "Cross",
          "Hook",
          "Uppercut",
          "Elbow",
          "Knee",
          "Body kick",
          "Head kick"
        ],
        "alsoAcceptedAnswers": [
          "Overhand",
          "Low kick",
          "Front kick",
          "Spinning backfist",
          "Hammerfist",
          "Spinning elbow",
          "Superman punch",
          "Spinning kick"
        ]
      },
      {
        "prompt": "Name a striking technique you might see in the UFC.",
        "answers": [
          "Jab",
          "Cross",
          "Hook",
          "Uppercut",
          "Elbow",
          "Knee",
          "Body kick",
          "Head kick"
        ],
        "alsoAcceptedAnswers": [
          "Overhand",
          "Low kick",
          "Front kick",
          "Spinning backfist",
          "Hammerfist",
          "Spinning elbow",
          "Superman punch",
          "Spinning kick"
        ]
      },
      {
        "prompt": "Name a legal attack fighters throw on the feet.",
        "answers": [
          "Jab",
          "Cross",
          "Hook",
          "Low kick",
          "Body kick",
          "Head kick",
          "Uppercut",
          "Elbow"
        ],
        "alsoAcceptedAnswers": [
          "Knee",
          "Overhand",
          "Front kick",
          "Spinning backfist",
          "Hammerfist",
          "Spinning elbow",
          "Superman punch",
          "Spinning kick"
        ]
      },
      {
        "prompt": "Name a basic strike MMA athletes train.",
        "answers": [
          "Jab",
          "Cross",
          "Hook",
          "Uppercut",
          "Low kick",
          "Elbow",
          "Knee",
          "Body kick"
        ],
        "alsoAcceptedAnswers": [
          "Head kick",
          "Overhand",
          "Front kick",
          "Spinning backfist",
          "Hammerfist",
          "Spinning elbow",
          "Superman punch",
          "Spinning kick"
        ]
      },
      {
        "prompt": "Name a strike that can hurt an opponent in the Octagon.",
        "answers": [
          "Head kick",
          "Hook",
          "Knee",
          "Elbow",
          "Uppercut",
          "Jab",
          "Cross",
          "Body kick"
        ],
        "alsoAcceptedAnswers": [
          "Overhand",
          "Low kick",
          "Front kick",
          "Spinning backfist",
          "Hammerfist",
          "Spinning elbow",
          "Superman punch",
          "Spinning kick"
        ]
      }
    ],
    "answers": [
      {
        "name": "Jab",
        "aliases": [
          "Jab punch"
        ]
      },
      {
        "name": "Cross",
        "aliases": [
          "Straight",
          "Straight right",
          "Straight left"
        ]
      },
      {
        "name": "Hook",
        "aliases": [
          "Hook punch"
        ]
      },
      {
        "name": "Uppercut",
        "aliases": [
          "Upper cut"
        ]
      },
      {
        "name": "Elbow",
        "aliases": [
          "Elbow strike",
          "Elbows"
        ]
      },
      {
        "name": "Knee",
        "aliases": [
          "Knee strike",
          "Knees"
        ]
      },
      {
        "name": "Body kick",
        "aliases": [
          "Kick to body"
        ]
      },
      {
        "name": "Head kick",
        "aliases": [
          "High kick",
          "Kick to head"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Overhand",
        "aliases": [
          "Overhand right",
          "Overhand left"
        ]
      },
      {
        "name": "Low kick",
        "aliases": [
          "Leg kick"
        ]
      },
      {
        "name": "Front kick",
        "aliases": [
          "Push kick"
        ]
      },
      {
        "name": "Spinning backfist",
        "aliases": [
          "Spinning back fist"
        ]
      },
      {
        "name": "Hammerfist",
        "aliases": [
          "Hammer fist"
        ]
      },
      {
        "name": "Spinning elbow",
        "aliases": [
          "Spin elbow"
        ]
      },
      {
        "name": "Superman punch",
        "aliases": [
          "Superman"
        ]
      },
      {
        "name": "Spinning kick",
        "aliases": [
          "Spin kick"
        ]
      }
    ]
  },
  {
    "category": "techniques",
    "entityKind": "other",
    "collisionGroup": "kicks",
    "prompts": [
      {
        "prompt": "Name a type of kick used in MMA.",
        "answers": [
          "Low kick",
          "Head kick",
          "Body kick",
          "Front kick",
          "Side kick",
          "Spinning back kick",
          "Calf kick",
          "Oblique kick"
        ],
        "alsoAcceptedAnswers": [
          "Roundhouse kick",
          "Teep",
          "Wheel kick",
          "Question-mark kick",
          "Axe kick",
          "Switch kick"
        ]
      },
      {
        "prompt": "Name a kicking technique you might see in the UFC.",
        "answers": [
          "Low kick",
          "Head kick",
          "Body kick",
          "Front kick",
          "Side kick",
          "Spinning back kick",
          "Calf kick",
          "Oblique kick"
        ],
        "alsoAcceptedAnswers": [
          "Roundhouse kick",
          "Teep",
          "Wheel kick",
          "Question-mark kick",
          "Axe kick",
          "Switch kick"
        ]
      },
      {
        "prompt": "Name a kick fighters use to attack at range.",
        "answers": [
          "Low kick",
          "Front kick",
          "Body kick",
          "Side kick",
          "Head kick",
          "Spinning back kick",
          "Calf kick",
          "Oblique kick"
        ],
        "alsoAcceptedAnswers": [
          "Roundhouse kick",
          "Teep",
          "Wheel kick",
          "Question-mark kick",
          "Axe kick",
          "Switch kick"
        ]
      },
      {
        "prompt": "Name a kick commentators identify during UFC fights.",
        "answers": [
          "Low kick",
          "Head kick",
          "Body kick",
          "Calf kick",
          "Front kick",
          "Side kick",
          "Spinning back kick",
          "Oblique kick"
        ],
        "alsoAcceptedAnswers": [
          "Roundhouse kick",
          "Teep",
          "Wheel kick",
          "Question-mark kick",
          "Axe kick",
          "Switch kick"
        ]
      },
      {
        "prompt": "Name a striking weapon that comes from the legs.",
        "answers": [
          "Low kick",
          "Head kick",
          "Front kick",
          "Spinning back kick",
          "Body kick",
          "Side kick",
          "Calf kick",
          "Oblique kick"
        ],
        "alsoAcceptedAnswers": [
          "Roundhouse kick",
          "Teep",
          "Wheel kick",
          "Question-mark kick",
          "Axe kick",
          "Switch kick"
        ]
      }
    ],
    "answers": [
      {
        "name": "Low kick",
        "aliases": [
          "Leg kick"
        ]
      },
      {
        "name": "Head kick",
        "aliases": [
          "High kick",
          "Kick to head"
        ]
      },
      {
        "name": "Body kick",
        "aliases": [
          "Kick to body"
        ]
      },
      {
        "name": "Front kick"
      },
      {
        "name": "Side kick",
        "aliases": [
          "Sidekick"
        ]
      },
      {
        "name": "Spinning back kick",
        "aliases": [
          "Spin back kick"
        ]
      },
      {
        "name": "Calf kick",
        "aliases": [
          "Calf kicks"
        ]
      },
      {
        "name": "Oblique kick",
        "aliases": [
          "Oblique"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Roundhouse kick",
        "aliases": [
          "Roundhouse"
        ]
      },
      {
        "name": "Teep",
        "aliases": [
          "Front push kick"
        ]
      },
      {
        "name": "Wheel kick",
        "aliases": [
          "Spinning wheel kick"
        ]
      },
      {
        "name": "Question-mark kick",
        "aliases": [
          "Question mark kick",
          "Question kick"
        ]
      },
      {
        "name": "Axe kick",
        "aliases": [
          "Ax kick"
        ]
      },
      {
        "name": "Switch kick",
        "aliases": [
          "Switchkick"
        ]
      }
    ]
  },
  {
    "category": "grappling",
    "entityKind": "other",
    "collisionGroup": "grappling",
    "prompts": [
      {
        "prompt": "Name a wrestling or grappling position, action, or control term used in MMA.",
        "answers": [
          "Takedown",
          "Double-leg",
          "Single-leg",
          "Clinch",
          "Back control",
          "Mount",
          "Half guard",
          "Ground-and-pound"
        ],
        "alsoAcceptedAnswers": [
          "Guard",
          "Side control",
          "Sprawl",
          "Sweep",
          "Body lock",
          "Underhook",
          "Rear body lock",
          "Mat return"
        ]
      },
      {
        "prompt": "Name a wrestling or grappling action a fighter might use after closing distance.",
        "answers": [
          "Takedown",
          "Double-leg",
          "Single-leg",
          "Clinch",
          "Body lock",
          "Back control",
          "Mount",
          "Half guard"
        ],
        "alsoAcceptedAnswers": [
          "Ground-and-pound",
          "Guard",
          "Side control",
          "Sprawl",
          "Sweep",
          "Underhook",
          "Rear body lock",
          "Mat return"
        ]
      },
      {
        "prompt": "Name a wrestling or grappling position, action, or control term commentators mention in UFC fights.",
        "answers": [
          "Takedown",
          "Clinch",
          "Back control",
          "Mount",
          "Half guard",
          "Double-leg",
          "Single-leg",
          "Ground-and-pound"
        ],
        "alsoAcceptedAnswers": [
          "Guard",
          "Side control",
          "Sprawl",
          "Sweep",
          "Body lock",
          "Underhook",
          "Rear body lock",
          "Mat return"
        ]
      },
      {
        "prompt": "Name a position, action, or control term from the wrestling or grappling side of MMA.",
        "answers": [
          "Mount",
          "Back control",
          "Half guard",
          "Side control",
          "Guard",
          "Takedown",
          "Double-leg",
          "Single-leg"
        ],
        "alsoAcceptedAnswers": [
          "Clinch",
          "Ground-and-pound",
          "Sprawl",
          "Sweep",
          "Body lock",
          "Underhook",
          "Rear body lock",
          "Mat return"
        ]
      },
      {
        "prompt": "Name a wrestling or grappling term associated with controlling an opponent.",
        "answers": [
          "Takedown",
          "Clinch",
          "Back control",
          "Mount",
          "Body lock",
          "Double-leg",
          "Single-leg",
          "Half guard"
        ],
        "alsoAcceptedAnswers": [
          "Ground-and-pound",
          "Guard",
          "Side control",
          "Sprawl",
          "Sweep",
          "Underhook",
          "Rear body lock",
          "Mat return"
        ]
      }
    ],
    "answers": [
      {
        "name": "Takedown",
        "aliases": [
          "Take down",
          "TD"
        ]
      },
      {
        "name": "Double-leg",
        "aliases": [
          "Double leg",
          "Double-leg takedown"
        ]
      },
      {
        "name": "Single-leg",
        "aliases": [
          "Single leg",
          "Single-leg takedown"
        ]
      },
      {
        "name": "Clinch",
        "aliases": [
          "Clinch work",
          "Clinch fighting"
        ]
      },
      {
        "name": "Back control",
        "aliases": [
          "Back",
          "Take the back",
          "Back mount"
        ]
      },
      {
        "name": "Mount",
        "aliases": [
          "Full mount"
        ]
      },
      {
        "name": "Half guard",
        "aliases": [
          "Half-guard"
        ]
      },
      {
        "name": "Ground-and-pound",
        "aliases": [
          "Ground and pound",
          "GNP",
          "Ground pound"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Guard",
        "aliases": [
          "Full guard"
        ]
      },
      {
        "name": "Side control",
        "aliases": [
          "Side-control"
        ]
      },
      {
        "name": "Sprawl",
        "aliases": [
          "Sprawling"
        ]
      },
      {
        "name": "Sweep",
        "aliases": [
          "Sweeps"
        ]
      },
      {
        "name": "Body lock",
        "aliases": [
          "Bodylock"
        ]
      },
      {
        "name": "Underhook",
        "aliases": [
          "Under hook"
        ]
      },
      {
        "name": "Rear body lock",
        "aliases": [
          "Rear bodylock"
        ]
      },
      {
        "name": "Mat return",
        "aliases": [
          "Mat returns"
        ]
      }
    ]
  },
  {
    "category": "rules",
    "entityKind": "other",
    "collisionGroup": "fouls",
    "prompts": [
      {
        "prompt": "Name a foul in MMA.",
        "answers": [
          "Eye poke",
          "Groin strike",
          "Fence grab",
          "Headbutt",
          "Biting",
          "Hair pulling",
          "Back-of-head strike",
          "Knee to the head of a grounded opponent"
        ],
        "alsoAcceptedAnswers": [
          "Grabbing shorts or gloves",
          "Throat attack",
          "Small-joint manipulation",
          "Fish-hooking",
          "Spiking on the head or neck",
          "Attacking the spine"
        ]
      },
      {
        "prompt": "Name something illegal inside the UFC Octagon.",
        "answers": [
          "Eye poke",
          "Groin strike",
          "Fence grab",
          "Headbutt",
          "Biting",
          "Hair pulling",
          "Back-of-head strike",
          "Knee to the head of a grounded opponent"
        ],
        "alsoAcceptedAnswers": [
          "Grabbing shorts or gloves",
          "Throat attack",
          "Small-joint manipulation",
          "Fish-hooking",
          "Spiking on the head or neck",
          "Attacking the spine"
        ]
      },
      {
        "prompt": "Name an action that can draw a warning or point deduction.",
        "answers": [
          "Eye poke",
          "Fence grab",
          "Groin strike",
          "Back-of-head strike",
          "Headbutt",
          "Biting",
          "Hair pulling",
          "Knee to the head of a grounded opponent"
        ],
        "alsoAcceptedAnswers": [
          "Grabbing shorts or gloves",
          "Throat attack",
          "Small-joint manipulation",
          "Fish-hooking",
          "Spiking on the head or neck",
          "Attacking the spine"
        ]
      },
      {
        "prompt": "Name a foul referees watch for in a UFC fight.",
        "answers": [
          "Eye poke",
          "Groin strike",
          "Fence grab",
          "Knee to the head of a grounded opponent",
          "Headbutt",
          "Biting",
          "Hair pulling",
          "Back-of-head strike"
        ],
        "alsoAcceptedAnswers": [
          "Grabbing shorts or gloves",
          "Throat attack",
          "Small-joint manipulation",
          "Fish-hooking",
          "Spiking on the head or neck",
          "Attacking the spine"
        ]
      },
      {
        "prompt": "Name an illegal technique under the unified MMA rules.",
        "answers": [
          "Eye poke",
          "Groin strike",
          "Knee to the head of a grounded opponent",
          "Back-of-head strike",
          "Fence grab",
          "Headbutt",
          "Biting",
          "Hair pulling"
        ],
        "alsoAcceptedAnswers": [
          "Grabbing shorts or gloves",
          "Throat attack",
          "Small-joint manipulation",
          "Fish-hooking",
          "Spiking on the head or neck",
          "Attacking the spine"
        ]
      }
    ],
    "answers": [
      {
        "name": "Eye poke",
        "aliases": [
          "Eye poking",
          "Poke the eye",
          "Poke eye"
        ]
      },
      {
        "name": "Groin strike",
        "aliases": [
          "Low blow",
          "Groin shot"
        ]
      },
      {
        "name": "Fence grab",
        "aliases": [
          "Grab the fence",
          "Cage grab",
          "Grab fence",
          "Fence grabbing"
        ]
      },
      {
        "name": "Headbutt",
        "aliases": [
          "Head butt",
          "Headbutting"
        ]
      },
      {
        "name": "Biting",
        "aliases": [
          "Bite"
        ]
      },
      {
        "name": "Hair pulling",
        "aliases": [
          "Pull hair",
          "Hair pull"
        ]
      },
      {
        "name": "Back-of-head strike",
        "aliases": [
          "Back of head",
          "Hit back of head",
          "Rabbit punch",
          "Back of head strike"
        ]
      },
      {
        "name": "Knee to the head of a grounded opponent",
        "aliases": [
          "Illegal knee",
          "Knee to grounded opponent",
          "Knee on grounded opponent",
          "Grounded head knee",
          "Knee to grounded head"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Grabbing shorts or gloves",
        "aliases": [
          "Grab shorts",
          "Grab gloves",
          "Shorts grab",
          "Glove grab"
        ]
      },
      {
        "name": "Throat attack",
        "aliases": [
          "Throat strike",
          "Strike to throat"
        ]
      },
      {
        "name": "Small-joint manipulation",
        "aliases": [
          "Small joint manipulation",
          "Finger bending",
          "Toe bending"
        ]
      },
      {
        "name": "Fish-hooking",
        "aliases": [
          "Fish hook",
          "Fish hooking"
        ]
      },
      {
        "name": "Spiking on the head or neck",
        "aliases": [
          "Spiking",
          "Spike on head",
          "Spike on neck",
          "Piledriver"
        ]
      },
      {
        "name": "Attacking the spine",
        "aliases": [
          "Spine strike",
          "Strike to spine",
          "Strike spine"
        ]
      }
    ]
  },
  {
    "category": "judging",
    "entityKind": "other",
    "collisionGroup": "judging",
    "prompts": [
      {
        "prompt": "Name something judges or fans look at when deciding who won a round.",
        "answers": [
          "Effective striking",
          "Effective grappling",
          "Damage",
          "Takedowns",
          "Submission attempts",
          "Control",
          "Aggression",
          "Cage pressure"
        ],
        "alsoAcceptedAnswers": [
          "Knockdowns",
          "Positional advancement",
          "Near submissions",
          "Clean strikes",
          "Ground strikes"
        ]
      },
      {
        "prompt": "Name a factor that can influence how an MMA round is scored.",
        "answers": [
          "Effective striking",
          "Effective grappling",
          "Damage",
          "Aggression",
          "Cage pressure",
          "Takedowns",
          "Submission attempts",
          "Control"
        ],
        "alsoAcceptedAnswers": [
          "Knockdowns",
          "Positional advancement",
          "Near submissions",
          "Clean strikes",
          "Ground strikes"
        ]
      },
      {
        "prompt": "Name something that helps a fighter make a round look convincing.",
        "answers": [
          "Damage",
          "Knockdowns",
          "Effective striking",
          "Takedowns",
          "Control",
          "Effective grappling",
          "Submission attempts",
          "Aggression"
        ],
        "alsoAcceptedAnswers": [
          "Cage pressure",
          "Positional advancement",
          "Near submissions",
          "Clean strikes",
          "Ground strikes"
        ]
      },
      {
        "prompt": "Name a performance area people debate on UFC scorecards.",
        "answers": [
          "Damage",
          "Control",
          "Takedowns",
          "Aggression",
          "Cage pressure",
          "Effective striking",
          "Effective grappling",
          "Submission attempts"
        ],
        "alsoAcceptedAnswers": [
          "Knockdowns",
          "Positional advancement",
          "Near submissions",
          "Clean strikes",
          "Ground strikes"
        ]
      },
      {
        "prompt": "Name something that can matter when comparing two close MMA rounds.",
        "answers": [
          "Effective striking",
          "Effective grappling",
          "Damage",
          "Aggression",
          "Control",
          "Takedowns",
          "Submission attempts",
          "Cage pressure"
        ],
        "alsoAcceptedAnswers": [
          "Knockdowns",
          "Positional advancement",
          "Near submissions",
          "Clean strikes",
          "Ground strikes"
        ]
      }
    ],
    "answers": [
      {
        "name": "Effective striking",
        "aliases": [
          "Striking",
          "Significant strikes",
          "Strikes",
          "Effective strikes"
        ]
      },
      {
        "name": "Effective grappling",
        "aliases": [
          "Grappling"
        ]
      },
      {
        "name": "Damage",
        "aliases": [
          "Visible damage"
        ]
      },
      {
        "name": "Takedowns",
        "aliases": [
          "Takedown",
          "TDs",
          "Take downs"
        ]
      },
      {
        "name": "Submission attempts",
        "aliases": [
          "Submissions",
          "Submission attempt",
          "Sub attempts",
          "Subs attempted"
        ]
      },
      {
        "name": "Control",
        "aliases": [
          "Control time",
          "Octagon control"
        ]
      },
      {
        "name": "Aggression",
        "aliases": [
          "Aggressive",
          "Effective aggression"
        ]
      },
      {
        "name": "Cage pressure",
        "aliases": [
          "Pressure",
          "Forward pressure"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Knockdowns",
        "aliases": [
          "KDs",
          "Knock downs"
        ]
      },
      {
        "name": "Positional advancement",
        "aliases": [
          "Advance position",
          "Position advancement"
        ]
      },
      {
        "name": "Near submissions",
        "aliases": [
          "Near subs",
          "Submission threats"
        ]
      },
      {
        "name": "Clean strikes",
        "aliases": [
          "Clean shots"
        ]
      },
      {
        "name": "Ground strikes",
        "aliases": [
          "Ground striking"
        ]
      }
    ]
  },
  {
    "category": "stats",
    "entityKind": "other",
    "collisionGroup": "stats",
    "prompts": [
      {
        "prompt": "Name a UFC fight statistic.",
        "answers": [
          "Significant strikes",
          "Total strikes",
          "Takedowns",
          "Takedown accuracy",
          "Control time",
          "Knockdowns",
          "Submission attempts",
          "Head strikes"
        ],
        "alsoAcceptedAnswers": [
          "Body strikes",
          "Leg strikes",
          "Distance strikes",
          "Clinch strikes",
          "Ground strikes",
          "Striking accuracy",
          "Striking differential",
          "Takedown defense"
        ]
      },
      {
        "prompt": "Name a number shown during or after an MMA fight.",
        "answers": [
          "Significant strikes",
          "Total strikes",
          "Takedowns",
          "Control time",
          "Knockdowns",
          "Takedown accuracy",
          "Submission attempts",
          "Head strikes"
        ],
        "alsoAcceptedAnswers": [
          "Body strikes",
          "Leg strikes",
          "Distance strikes",
          "Clinch strikes",
          "Ground strikes",
          "Striking accuracy",
          "Striking differential",
          "Takedown defense"
        ]
      },
      {
        "prompt": "Name a stat fans use to describe what happened in a bout.",
        "answers": [
          "Significant strikes",
          "Takedowns",
          "Control time",
          "Knockdowns",
          "Submission attempts",
          "Total strikes",
          "Takedown accuracy",
          "Head strikes"
        ],
        "alsoAcceptedAnswers": [
          "Body strikes",
          "Leg strikes",
          "Distance strikes",
          "Clinch strikes",
          "Ground strikes",
          "Striking accuracy",
          "Striking differential",
          "Takedown defense"
        ]
      },
      {
        "prompt": "Name a fight metric you might see on a UFC broadcast.",
        "answers": [
          "Significant strikes",
          "Total strikes",
          "Takedowns",
          "Control time",
          "Head strikes",
          "Takedown accuracy",
          "Knockdowns",
          "Submission attempts"
        ],
        "alsoAcceptedAnswers": [
          "Body strikes",
          "Leg strikes",
          "Distance strikes",
          "Clinch strikes",
          "Ground strikes",
          "Striking accuracy",
          "Striking differential",
          "Takedown defense"
        ]
      },
      {
        "prompt": "Name a statistic analysts use when breaking down a UFC fight.",
        "answers": [
          "Significant strikes",
          "Takedown accuracy",
          "Control time",
          "Striking accuracy",
          "Striking differential",
          "Total strikes",
          "Takedowns",
          "Knockdowns"
        ],
        "alsoAcceptedAnswers": [
          "Submission attempts",
          "Head strikes",
          "Body strikes",
          "Leg strikes",
          "Distance strikes",
          "Clinch strikes",
          "Ground strikes",
          "Takedown defense"
        ]
      }
    ],
    "answers": [
      {
        "name": "Significant strikes",
        "aliases": [
          "Sig strikes",
          "Sig. strikes",
          "Significant strike"
        ]
      },
      {
        "name": "Total strikes",
        "aliases": [
          "All strikes"
        ]
      },
      {
        "name": "Takedowns",
        "aliases": [
          "TDs",
          "Take downs"
        ]
      },
      {
        "name": "Takedown accuracy",
        "aliases": [
          "TD accuracy",
          "Takedown %"
        ]
      },
      {
        "name": "Control time",
        "aliases": [
          "Control"
        ]
      },
      {
        "name": "Knockdowns",
        "aliases": [
          "KDs",
          "Knock downs"
        ]
      },
      {
        "name": "Submission attempts",
        "aliases": [
          "Sub attempts",
          "Subs attempted"
        ]
      },
      {
        "name": "Head strikes",
        "aliases": [
          "Strikes to head"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Body strikes",
        "aliases": [
          "Strikes to body"
        ]
      },
      {
        "name": "Leg strikes",
        "aliases": [
          "Strikes to legs"
        ]
      },
      {
        "name": "Distance strikes",
        "aliases": [
          "Range strikes"
        ]
      },
      {
        "name": "Clinch strikes",
        "aliases": [
          "Clinch striking"
        ]
      },
      {
        "name": "Ground strikes",
        "aliases": [
          "Ground striking"
        ]
      },
      {
        "name": "Striking accuracy",
        "aliases": [
          "Strike accuracy",
          "Striking %"
        ]
      },
      {
        "name": "Striking differential",
        "aliases": [
          "Strike differential"
        ]
      },
      {
        "name": "Takedown defense",
        "aliases": [
          "TDD",
          "Takedown D"
        ]
      }
    ]
  },
  {
    "category": "weight-cutting",
    "entityKind": "other",
    "collisionGroup": "weight-cutting",
    "prompts": [
      {
        "prompt": "Name something a fighter may deal with during or immediately after a difficult UFC weight cut.",
        "answers": [
          "Dehydration",
          "Missed weight",
          "Dizziness",
          "Cramping",
          "Fainting",
          "Vomiting",
          "Exhaustion",
          "Rehydration"
        ],
        "alsoAcceptedAnswers": [
          "Headache",
          "Weakness",
          "Nausea",
          "Low energy",
          "Poor sleep"
        ]
      },
      {
        "prompt": "Name a symptom, problem, or recovery step tied to a hard UFC weight cut.",
        "answers": [
          "Dehydration",
          "Dizziness",
          "Cramping",
          "Exhaustion",
          "Rehydration",
          "Missed weight",
          "Fainting",
          "Vomiting"
        ],
        "alsoAcceptedAnswers": [
          "Headache",
          "Weakness",
          "Nausea",
          "Low energy",
          "Poor sleep"
        ]
      },
      {
        "prompt": "Name a symptom, outcome, or recovery need after a rough UFC weight cut.",
        "answers": [
          "Dehydration",
          "Dizziness",
          "Cramping",
          "Nausea",
          "Rehydration",
          "Missed weight",
          "Fainting",
          "Vomiting"
        ],
        "alsoAcceptedAnswers": [
          "Exhaustion",
          "Headache",
          "Weakness",
          "Low energy",
          "Poor sleep"
        ]
      },
      {
        "prompt": "Name something a fighter might deal with while cutting a lot of weight or rehydrating afterward.",
        "answers": [
          "Missed weight",
          "Dehydration",
          "Fainting",
          "Vomiting",
          "Rehydration",
          "Dizziness",
          "Cramping",
          "Exhaustion"
        ],
        "alsoAcceptedAnswers": [
          "Headache",
          "Weakness",
          "Nausea",
          "Low energy",
          "Poor sleep"
        ]
      },
      {
        "prompt": "Name something fans watch for when a UFC weight cut goes badly or recovery begins.",
        "answers": [
          "Dehydration",
          "Rehydration",
          "Exhaustion",
          "Cramping",
          "Weakness",
          "Missed weight",
          "Dizziness",
          "Fainting"
        ],
        "alsoAcceptedAnswers": [
          "Vomiting",
          "Headache",
          "Nausea",
          "Low energy",
          "Poor sleep"
        ]
      }
    ],
    "answers": [
      {
        "name": "Dehydration",
        "aliases": [
          "Dehydrated"
        ]
      },
      {
        "name": "Missed weight",
        "aliases": [
          "Miss weight",
          "Misses weight",
          "Overweight",
          "Missed the weight",
          "Weight miss"
        ]
      },
      {
        "name": "Dizziness",
        "aliases": [
          "Dizzy",
          "Lightheaded",
          "Lightheadedness"
        ]
      },
      {
        "name": "Cramping",
        "aliases": [
          "Cramps",
          "Cramp"
        ]
      },
      {
        "name": "Fainting",
        "aliases": [
          "Faint",
          "Pass out",
          "Passing out",
          "Passed out"
        ]
      },
      {
        "name": "Vomiting",
        "aliases": [
          "Vomit",
          "Throw up",
          "Throwing up"
        ]
      },
      {
        "name": "Exhaustion",
        "aliases": [
          "Exhausted",
          "Fatigue"
        ]
      },
      {
        "name": "Rehydration",
        "aliases": [
          "Rehydrate",
          "Rehydrating",
          "Hydrate",
          "Hydration"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Headache",
        "aliases": [
          "Headaches"
        ]
      },
      {
        "name": "Weakness",
        "aliases": [
          "Weak"
        ]
      },
      {
        "name": "Nausea",
        "aliases": [
          "Nauseous"
        ]
      },
      {
        "name": "Low energy",
        "aliases": [
          "No energy"
        ]
      },
      {
        "name": "Poor sleep",
        "aliases": [
          "Can't sleep",
          "Bad sleep"
        ]
      }
    ]
  },
  {
    "category": "corner",
    "entityKind": "other",
    "collisionGroup": "corner",
    "prompts": [
      {
        "prompt": "Name something a fighter's corner does between rounds.",
        "answers": [
          "Give instructions",
          "Apply ice",
          "Reduce swelling",
          "Stop bleeding",
          "Give water",
          "Control breathing",
          "Encourage the fighter",
          "Adjust the game plan"
        ],
        "alsoAcceptedAnswers": [
          "Apply petroleum jelly",
          "Check a cut",
          "Clean the fighter",
          "Calm the fighter down"
        ]
      },
      {
        "prompt": "Name a job performed by a UFC corner team.",
        "answers": [
          "Give instructions",
          "Adjust the game plan",
          "Give water",
          "Apply ice",
          "Reduce swelling",
          "Stop bleeding",
          "Control breathing",
          "Encourage the fighter"
        ],
        "alsoAcceptedAnswers": [
          "Apply petroleum jelly",
          "Check a cut",
          "Clean the fighter",
          "Calm the fighter down"
        ]
      },
      {
        "prompt": "Name something coaches might do during the one-minute break.",
        "answers": [
          "Give instructions",
          "Give water",
          "Apply ice",
          "Stop bleeding",
          "Reduce swelling",
          "Control breathing",
          "Encourage the fighter",
          "Adjust the game plan"
        ],
        "alsoAcceptedAnswers": [
          "Apply petroleum jelly",
          "Check a cut",
          "Clean the fighter",
          "Calm the fighter down"
        ]
      },
      {
        "prompt": "Name a responsibility of the people in a fighter's corner.",
        "answers": [
          "Stop bleeding",
          "Reduce swelling",
          "Apply ice",
          "Check a cut",
          "Give instructions",
          "Give water",
          "Control breathing",
          "Encourage the fighter"
        ],
        "alsoAcceptedAnswers": [
          "Adjust the game plan",
          "Apply petroleum jelly",
          "Clean the fighter",
          "Calm the fighter down"
        ]
      },
      {
        "prompt": "Name something that can happen on the stool between rounds.",
        "answers": [
          "Give instructions",
          "Give water",
          "Control breathing",
          "Calm the fighter down",
          "Apply ice",
          "Reduce swelling",
          "Stop bleeding",
          "Encourage the fighter"
        ],
        "alsoAcceptedAnswers": [
          "Adjust the game plan",
          "Apply petroleum jelly",
          "Check a cut",
          "Clean the fighter"
        ]
      }
    ],
    "answers": [
      {
        "name": "Give instructions",
        "aliases": [
          "Instructions",
          "Coaching",
          "Coach"
        ]
      },
      {
        "name": "Apply ice",
        "aliases": [
          "Ice",
          "Ice the fighter",
          "Ice them"
        ]
      },
      {
        "name": "Reduce swelling",
        "aliases": [
          "Swelling",
          "Reduce swelling",
          "Reduce inflammation"
        ]
      },
      {
        "name": "Stop bleeding",
        "aliases": [
          "Bleeding",
          "Cut",
          "Cuts",
          "Stop the cut",
          "Stop the blood"
        ]
      },
      {
        "name": "Give water",
        "aliases": [
          "Water",
          "Hydrate",
          "Hydration"
        ]
      },
      {
        "name": "Control breathing",
        "aliases": [
          "Breathing",
          "Breathe",
          "Slow breathing"
        ]
      },
      {
        "name": "Encourage the fighter",
        "aliases": [
          "Encourage",
          "Motivate",
          "Motivation"
        ]
      },
      {
        "name": "Adjust the game plan",
        "aliases": [
          "Game plan",
          "Gameplan",
          "Adjust strategy",
          "Adjustments",
          "Make adjustments"
        ]
      }
    ],
    "alsoAcceptedAnswers": [
      {
        "name": "Apply petroleum jelly",
        "aliases": [
          "Vaseline",
          "Petroleum jelly"
        ]
      },
      {
        "name": "Check a cut",
        "aliases": [
          "Check cut",
          "Cut check"
        ]
      },
      {
        "name": "Clean the fighter",
        "aliases": [
          "Clean them",
          "Wipe down"
        ]
      },
      {
        "name": "Calm the fighter down",
        "aliases": [
          "Calm them",
          "Calm down"
        ]
      }
    ]
  }
] as const);
