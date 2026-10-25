import {makeUfcFeudDraft,type UFCFeudDraftRow} from "./ufcSportsFeudV2DraftHelpers";
/** Official UFC archive-sourced, distinct HOF membership and scripted-media crossovers. Editorial staging only. */
const ROWS=[
  {
    "id": "ufc-v2-main13-hall-pioneers",
    "lane": "ufc-hall-of-fame-pioneer-wing",
    "prompt": "Name a fighter inducted into the UFC Hall of Fame's Pioneer Wing as of October 2026.",
    "kind": "person",
    "ranked": "Royce Gracie|Ken Shamrock|Randy Couture|Chuck Liddell|Matt Hughes|Anderson Silva|Tito Ortiz|Bas Rutten",
    "extras": "Dan Severn|Mark Coleman|Don Frye|Antonio Rodrigo Nogueira|Rich Franklin|Matt Serra|Kevin Randleman|Kazushi Sakuraba|Maurice Smith|Wanderlei Silva|Vitor Belfort|Jens Pulver|Mark Kerr",
    "aliases": {
      "Royce Gracie": [
        "Royce"
      ],
      "Randy Couture": [
        "The Natural"
      ],
      "Chuck Liddell": [
        "The Iceman"
      ],
      "Bas Rutten": [
        "El Guapo"
      ],
      "Antonio Rodrigo Nogueira": [
        "Minotauro",
        "Big Nog"
      ],
      "Wanderlei Silva": [
        "The Axe Murderer"
      ],
      "Vitor Belfort": [
        "The Phenom"
      ],
      "Mark Kerr": [
        "The Smashing Machine"
      ]
    },
    "source": [
      "https://www.ufc.com/ufc-hall-of-fame",
      "https://www.ufc.com/news/ufc-hall-fame-faq"
    ]
  },
  {
    "id": "ufc-v2-main13-scripted-screen-fighters",
    "lane": "ufc-fighters-scripted-movies-tv",
    "prompt": "Name a UFC fighter who appeared in a scripted movie or television episode by October 2026 (including an appearance as themselves).",
    "kind": "person",
    "ranked": "Conor McGregor|Ronda Rousey|Georges St-Pierre|Randy Couture|Quinton Jackson|Michael Bisping|Valentina Shevchenko|Max Holloway",
    "extras": "Kenny Florian|Matt Hughes|Cub Swanson|Diego Sanchez",
    "aliases": {
      "Conor McGregor": [
        "The Notorious"
      ],
      "Georges St-Pierre": [
        "GSP"
      ],
      "Quinton Jackson": [
        "Rampage",
        "Rampage Jackson"
      ],
      "Michael Bisping": [
        "The Count"
      ],
      "Valentina Shevchenko": [
        "Bullet"
      ],
      "Max Holloway": [
        "Blessed"
      ],
      "Kenny Florian": [
        "KenFlo"
      ]
    },
    "source": [
      "https://www.ufc.com/news/history-ufc-fighters-movies-and-television-conor-mcgregor-road-house"
    ]
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_MAIN_BATCH13=makeUfcFeudDraft(ROWS);
