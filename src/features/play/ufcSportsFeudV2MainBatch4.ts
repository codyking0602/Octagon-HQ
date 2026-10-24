import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Fourth editorial batch: distinct UFC Feud questions. NOT USED IN LIVE DAILY. */
const ROWS = [
  {
    "id": "ufc-v2-main4-mcgregor-opponents",
    "lane": "conor-mcgregor-ufc-opponents",
    "prompt": "Name a fighter who has faced Conor McGregor in an official UFC bout.",
    "kind": "person",
    "ranked": "Khabib Nurmagomedov|Nate Diaz|Dustin Poirier|Max Holloway|Jose Aldo|Eddie Alvarez|Chad Mendes|Donald Cerrone",
    "extras": "Marcus Brimage|Diego Brandao|Dennis Siver",
    "aliases": {
      "Jose Aldo": [
        "Aldo"
      ],
      "Donald Cerrone": [
        "Cowboy"
      ],
      "Khabib Nurmagomedov": [
        "Khabib"
      ],
      "Eddie Alvarez": [
        "The Underground King"
      ],
      "Nate Diaz": [
        "Nate"
      ]
    },
    "source": [
      "https://www.ufc.com/athlete/conor-mcgregor",
      "https://www.ufc.com/news/all-conor-mcgregors-ufc-wins-fight-pass"
    ]
  },
  {
    "id": "ufc-v2-main4-anderson-silva-opponents",
    "lane": "anderson-silva-ufc-opponents",
    "prompt": "Name a fighter who faced Anderson Silva in a UFC bout.",
    "kind": "person",
    "ranked": "Chris Weidman|Chael Sonnen|Vitor Belfort|Rich Franklin|Dan Henderson|Israel Adesanya|Nick Diaz|Michael Bisping",
    "extras": "Chris Leben|Nate Marquardt|Patrick Cote|Thales Leites|Forrest Griffin|Demian Maia|Yushin Okami|Stephan Bonnar|Daniel Cormier|Derek Brunson|Jared Cannonier|Uriah Hall|James Irvin|Travis Lutter",
    "aliases": {
      "Chris Weidman": [
        "Weidman"
      ],
      "Chael Sonnen": [
        "Chael"
      ],
      "Vitor Belfort": [
        "The Phenom"
      ],
      "Rich Franklin": [
        "Ace"
      ],
      "Michael Bisping": [
        "The Count"
      ],
      "Israel Adesanya": [
        "Izzy"
      ]
    },
    "source": [
      "https://www.ufc.com.br/athlete/anderson-silva",
      "https://www.ufc.com/athlete/anderson-silva"
    ]
  },
  {
    "id": "ufc-v2-main4-amanda-nunes-opponents",
    "lane": "amanda-nunes-ufc-opponents",
    "prompt": "Name a fighter who faced Amanda Nunes in a UFC bout.",
    "kind": "person",
    "ranked": "Ronda Rousey|Miesha Tate|Valentina Shevchenko|Cris Cyborg|Holly Holm|Julianna Pena|Irene Aldana|Raquel Pennington",
    "extras": "Germaine de Randamie|Felicia Spencer|Megan Anderson|Sara McMann|Cat Zingano|Alexis Davis|Sheila Gaff|Liz Carmouche|Shayna Baszler|Sarah Kaufman|Jessica Eye|Julia Budd",
    "aliases": {
      "Cris Cyborg": [
        "Cyborg"
      ],
      "Julianna Pena": [
        "Julianna Peña"
      ],
      "Miesha Tate": [
        "Cupcake"
      ],
      "Valentina Shevchenko": [
        "Bullet"
      ]
    },
    "source": [
      "https://www.ufc.com/news/ufc-womens-bantamweight-title-lineage-Rousey-Holm-Tate-Nunes-Pena",
      "https://www.ufc.com/news/ufc-womens-featherweight-title-lineage-De-Randamie-Cyborg-Nunes"
    ]
  },
  {
    "id": "ufc-v2-main4-bellator-ufc-veterans",
    "lane": "bellator-ufc-veterans",
    "prompt": "Name a fighter who competed in both Bellator MMA and the UFC.",
    "kind": "person",
    "ranked": "Michael Chandler|Eddie Alvarez|Ben Askren|Gegard Mousasi|Ryan Bader|Benson Henderson|Rory MacDonald|Cris Cyborg",
    "extras": "Quinton Jackson|Tito Ortiz|Frank Mir|Lyoto Machida|Corey Anderson|Phil Davis|Aaron Pico|Yoel Romero|Douglas Lima",
    "aliases": {
      "Quinton Jackson": [
        "Rampage Jackson"
      ],
      "Cris Cyborg": [
        "Cyborg"
      ],
      "Michael Chandler": [
        "Chandler"
      ],
      "Ben Askren": [
        "Funky"
      ]
    },
    "source": [
      "https://www.ufc.com/news/dana-white-announces-michael-chandler-signing-ufc-254-backup",
      "https://www.ufc.com/news/third-title-ben-in-askrens-sights-ufc-239"
    ]
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_MAIN_BATCH4 = makeUfcFeudDraft(ROWS);
