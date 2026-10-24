import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Review-only new UFC Main concepts. Not wired to the Daily selector. */
const ROWS = [
  {
    "id": "ufc-v2-main-ufc-one-roster",
    "lane": "ufc1-participants",
    "prompt": "Name a fighter who competed on the original UFC 1 card in 1993.",
    "kind": "person",
    "ranked": "Royce Gracie|Ken Shamrock|Gerard Gordeau|Art Jimmerson|Teila Tuli|Patrick Smith|Kevin Rosier|Zane Frazier",
    "extras": "Jason DeLucia|Trent Jenkins",
    "aliases": {
      "Art Jimmerson": [
        "One Glove",
        "Art one glove Jimmerson"
      ],
      "Teila Tuli": [
        "Taylor Wily"
      ],
      "Patrick Smith": [
        "Pat Smith"
      ],
      "Jason DeLucia": [
        "Jason De Lucia"
      ]
    },
    "source": [
      "https://www.ufc.com/event/ufc-1"
    ]
  },
  {
    "id": "ufc-v2-main-tuf-head-coaches",
    "lane": "tuf-coaches",
    "prompt": "Name a UFC fighter who served as a team coach on The Ultimate Fighter.",
    "kind": "person",
    "ranked": "Conor McGregor|Jon Jones|Daniel Cormier|Michael Bisping|Georges St-Pierre|Chuck Liddell|Randy Couture|Tito Ortiz",
    "extras": "Chael Sonnen|Ken Shamrock|Quinton Jackson|Rashad Evans|BJ Penn|Dominick Cruz|Anthony Pettis|Frankie Edgar|Urijah Faber|Ronda Rousey|Miesha Tate|Joanna Jedrzejczyk|Claudia Gadelha|Junior dos Santos|Brock Lesnar|Matt Hughes|Rich Franklin|Vitor Belfort|Forrest Griffin",
    "aliases": {
      "Georges St-Pierre": [
        "GSP"
      ],
      "Quinton Jackson": [
        "Rampage"
      ],
      "Daniel Cormier": [
        "DC"
      ]
    },
    "source": [
      "https://www.ufc.com/news/tuf-coaches-numbers",
      "https://www.ufc.com/news/ultimate-fighter-returns-coaches-daniel-cormier-and-michael-bisping"
    ]
  },
  {
    "id": "ufc-v2-main-tuf-winner-champs",
    "lane": "tuf-winner-champions",
    "prompt": "Name a fighter who won The Ultimate Fighter competition and later became an undisputed UFC champion.",
    "kind": "person",
    "ranked": "Forrest Griffin|Rashad Evans|Michael Bisping|Matt Serra|Kamaru Usman|Robert Whittaker|Carla Esparza|Julianna Pena",
    "extras": "Nicco Montano",
    "aliases": {
      "Robert Whittaker": [
        "Bobby Knuckles"
      ],
      "Julianna Pena": [
        "Julianna Peña"
      ]
    },
    "source": [
      "https://www.ufc.com/news/the-winners-of-the-ultimate-fighter-diaz-ferguson-esparza-pena-usman-tuf"
    ]
  },
  {
    "id": "ufc-v2-main-interim-title-holders",
    "lane": "ufc-interim-champions",
    "prompt": "Name a fighter who has won a UFC interim championship.",
    "kind": "person",
    "ranked": "Conor McGregor|Tony Ferguson|Dustin Poirier|Justin Gaethje|Israel Adesanya|Robert Whittaker|Tom Aspinall|Colby Covington",
    "extras": "Yair Rodriguez|Brandon Moreno|Ciryl Gane|Jon Jones|Renan Barao|Shane Carwin|Carlos Condit|Frank Mir|Antonio Rodrigo Nogueira",
    "aliases": {
      "Robert Whittaker": [
        "Bobby Knuckles"
      ]
    },
    "source": [
      "https://www.ufc.com/athlete/justin-gaethje",
      "https://www.ufc.com/athlete/jon-jones"
    ]
  },
  {
    "id": "ufc-v2-main-pro-wrestlers",
    "lane": "ufc-pro-wrestling",
    "prompt": "Name a UFC fighter who has also appeared as a professional wrestler.",
    "kind": "person",
    "ranked": "Brock Lesnar|Ronda Rousey|CM Punk|Ken Shamrock|Dan Severn|Cain Velasquez|Shayna Baszler|Matt Riddle",
    "extras": "Josh Barnett|Paige VanZant|Tito Ortiz",
    "aliases": {
      "CM Punk": [
        "Phil Brooks"
      ]
    },
    "source": [
      "https://www.wwe.com/superstars/brock-lesnar",
      "https://www.wwe.com/superstars/ronda-rousey"
    ]
  },
  {
    "id": "ufc-v2-main-title-winning-submissions",
    "lane": "ufc-title-win-submissions",
    "prompt": "Name a fighter who won an undisputed UFC title by submitting their opponent in the title-winning fight.",
    "kind": "person",
    "ranked": "Jon Jones|Islam Makhachev|Georges St-Pierre|Miesha Tate|Julianna Pena|Anthony Pettis|Frank Mir|Brandon Moreno",
    "extras": "Carla Esparza",
    "aliases": {
      "Georges St-Pierre": [
        "GSP"
      ],
      "Julianna Pena": [
        "Julianna Peña"
      ]
    },
    "source": [
      "https://www.ufc.com/athlete/jon-jones",
      "https://www.ufc.com/news/tate-wins-title-after-late-submission-holm"
    ]
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_MAIN_DRAFT = makeUfcFeudDraft(ROWS);
