import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** UFC official statleaders.com October 18 2026 published snapshot. Revisit before final approval. */
const ROWS = [
  {
    "id": "ufc-v2-main11-shortest-average-bouts",
    "lane": "ufc-career-shortest-average-fight-time",
    "prompt": "On the UFC Record Book snapshot dated October 18, 2026, name a fighter in the shortest average UFC fight time Top 10 (minimum five bouts).",
    "kind": "person",
    "ranked": "Tom Aspinall|Drew McFedries|Terrance McKinney|James Irvin|Manuel Torres|Ronda Rousey|Chris Daukaus|Cyril Asker",
    "extras": "Todd Duffee|Gadzhimurad Antigulov",
    "aliases": {
      "Tom Aspinall": [
        "Aspinall"
      ],
      "Ronda Rousey": [
        "Rowdy"
      ],
      "Terrance McKinney": [
        "T Wrecks"
      ]
    },
    "source": [
      "https://statleaders.ufc.com/en"
    ]
  },
  {
    "id": "ufc-v2-main11-top-position-percent",
    "lane": "ufc-career-top-position-percentage",
    "prompt": "On the UFC Record Book snapshot dated October 18, 2026, name a fighter in the Top 10 for percentage of total fight time spent in top position (minimum five UFC bouts).",
    "kind": "person",
    "ranked": "Jailton Almeida|Chael Sonnen|Bartosz Fabinski|Grant Dawson|Charlie Brenneman|Matt Lindland|Khamzat Chimaev|Gregor Gillespie",
    "extras": "Matt Hughes|Pat Sabatini",
    "aliases": {
      "Khamzat Chimaev": [
        "Borz"
      ],
      "Chael Sonnen": [
        "The American Gangster"
      ]
    },
    "source": [
      "https://statleaders.ufc.com/en"
    ]
  },
  {
    "id": "ufc-v2-main11-knockdowns-per-fifteen",
    "lane": "ufc-knockdown-rate-top-ten",
    "prompt": "On the UFC Record Book snapshot dated October 18, 2026, name a fighter in the Top 10 for UFC knockdowns landed per 15 minutes (minimum five UFC bouts).",
    "kind": "person",
    "ranked": "Drew McFedries|Chris Daukaus|Tom Aspinall|Uros Medic|Manuel Torres|Ateba Gautier|Todd Duffee|Carlos Prates",
    "extras": "Gilbert Urbina|Shane Carwin",
    "aliases": {
      "Uros Medic": [
        "Uroš Medić"
      ],
      "Tom Aspinall": [
        "Aspinall"
      ]
    },
    "source": [
      "https://statleaders.ufc.com/en"
    ]
  },
  {
    "id": "ufc-v2-main11-striking-differential",
    "lane": "ufc-striking-differential-top-ten",
    "prompt": "On the UFC Record Book snapshot dated October 18, 2026, name a fighter in the Top 10 for significant-striking differential per minute (minimum five UFC bouts).",
    "kind": "person",
    "ranked": "Cristiane Justino|Cain Velasquez|Tom Aspinall|Carli Judice|Navajo Stirling|Todd Duffee|Terrance McKinney|Ciryl Gane",
    "extras": "Payton Talbott|Michael Morales",
    "aliases": {
      "Cristiane Justino": [
        "Cris Cyborg",
        "Cyborg"
      ],
      "Cain Velasquez": [
        "Cain"
      ]
    },
    "source": [
      "https://statleaders.ufc.com/en"
    ]
  },
  {
    "id": "ufc-v2-main11-significant-accuracy",
    "lane": "ufc-significant-striking-accuracy-top-ten",
    "prompt": "On the UFC Record Book snapshot dated October 18, 2026, name a fighter in the Top 10 for career significant strike accuracy (minimum five UFC bouts and 500 attempts).",
    "kind": "person",
    "ranked": "Alistair Overeem|Shara Magomedov|Ciryl Gane|Chidi Njokuani|Josh Barnett|Alex Pereira|Phil Hawes|Sean O'Malley",
    "extras": "Tatiana Suarez|Anthony Hernandez",
    "aliases": {
      "Alex Pereira": [
        "Poatan"
      ],
      "Shara Magomedov": [
        "Shara Bullet"
      ],
      "Sean O'Malley": [
        "Suga"
      ],
      "Alistair Overeem": [
        "The Reem"
      ]
    },
    "source": [
      "https://statleaders.ufc.com/en"
    ]
  },
  {
    "id": "ufc-v2-main11-takedown-accuracy",
    "lane": "ufc-takedown-accuracy-top-ten",
    "prompt": "On the UFC Record Book snapshot dated October 18, 2026, name a fighter in the Top 10 ranks for takedown accuracy (minimum five UFC fights and 20 takedown attempts; ties count).",
    "kind": "person",
    "ranked": "Nordine Taleb|Taila Santos|Robbie Lawler|Georges St-Pierre|Bartosz Fabinski|Jonathan Goulet|Diego Brandao|Renato Sobral",
    "extras": "Melvin Guillard|Makhmud Muradov|Joanderson Brito|Fatima Kline",
    "aliases": {
      "Georges St-Pierre": [
        "GSP"
      ],
      "Renato Sobral": [
        "Babalu Sobral",
        "Babalu"
      ]
    },
    "source": [
      "https://statleaders.ufc.com/en"
    ]
  },
  {
    "id": "ufc-v2-main11-strikes-absorbed",
    "lane": "ufc-lowest-strikes-absorbed-rate",
    "prompt": "On the UFC Record Book snapshot dated October 18, 2026, name a fighter in the ten lowest ranked significant strikes absorbed per minute (minimum five UFC bouts; ties count).",
    "kind": "person",
    "ranked": "Pete Spratt|Ivan Salaverry|Pat Sabatini|Jon Madsen|Renato Sobral|Matt Lindland|Ricco Rodriguez|Chael Sonnen",
    "extras": "Jailton Almeida|Phil Davis|Ryan Hall",
    "aliases": {
      "Renato Sobral": [
        "Babalu"
      ],
      "Chael Sonnen": [
        "The American Gangster"
      ]
    },
    "source": [
      "https://statleaders.ufc.com/en"
    ]
  },
  {
    "id": "ufc-v2-main11-most-total-strikes",
    "lane": "ufc-career-total-strikes-landed",
    "prompt": "On the UFC Record Book snapshot dated October 18, 2026, name a fighter in the Top 10 for all career strikes landed, including significant and non-significant strikes.",
    "kind": "person",
    "ranked": "Max Holloway|Neil Magny|Merab Dvalishvili|Angela Hill|Kamaru Usman|Sean Strickland|Rafael dos Anjos|Darren Elkins",
    "extras": "Georges St-Pierre|Nate Diaz",
    "aliases": {
      "Max Holloway": [
        "Blessed"
      ],
      "Rafael dos Anjos": [
        "RDA"
      ],
      "Georges St-Pierre": [
        "GSP"
      ]
    },
    "source": [
      "https://statleaders.ufc.com/en"
    ]
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_MAIN_BATCH11 = makeUfcFeudDraft(ROWS);
