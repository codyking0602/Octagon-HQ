import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Editorial draft batch two; never imported by live Daily generation. */
const ROWS = [
  {
    "id": "ufc-v2-main2-olympic-athletes",
    "lane": "ufc-olympians",
    "prompt": "Name a UFC fighter who also competed at the Olympic Games.",
    "kind": "person",
    "ranked": "Henry Cejudo|Ronda Rousey|Daniel Cormier|Yoel Romero|Kayla Harrison|Sara McMann|Ben Askren|Dan Henderson",
    "extras": "Mark Madsen|Matt Lindland|Mark Coleman|Kevin Jackson|Mark Schultz|Robelis Despaigne",
    "aliases": {
      "Daniel Cormier": [
        "DC"
      ],
      "Henry Cejudo": [
        "The Messenger"
      ],
      "Ronda Rousey": [
        "Rowdy"
      ],
      "Yoel Romero": [
        "Soldier of God"
      ],
      "Ben Askren": [
        "Funky"
      ]
    },
    "source": [
      "https://www.ufc.com/news/olympians-who-have-competed-ufc-octagon",
      "https://www.ufc.com/news/ufc-signs-olympic-gold-winner-cejudo"
    ]
  },
  {
    "id": "ufc-v2-main2-early-tournaments",
    "lane": "old-ufc-tournament-champions",
    "prompt": "Name a fighter who won a UFC tournament during the promotion's early tournament era.",
    "kind": "person",
    "ranked": "Royce Gracie|Dan Severn|Mark Coleman|Don Frye|Mark Kerr|Oleg Taktarov|Marco Ruas|Steve Jennum",
    "extras": "Vitor Belfort|Dan Henderson|Randy Couture|Kazushi Sakuraba",
    "aliases": {
      "Mark Kerr": [
        "The Smashing Machine"
      ],
      "Mark Coleman": [
        "The Hammer"
      ],
      "Dan Severn": [
        "The Beast"
      ],
      "Vitor Belfort": [
        "The Phenom"
      ]
    },
    "source": [
      "https://www.ufc.com/news/championship-matters",
      "https://www.ufc.com/hof/mark-kerr-hall-of-fame"
    ]
  },
  {
    "id": "ufc-v2-main2-wec-champions",
    "lane": "former-wec-champions",
    "prompt": "Name a fighter who held a WEC championship and later fought in the UFC.",
    "kind": "person",
    "ranked": "Jose Aldo|Dominick Cruz|Urijah Faber|Anthony Pettis|Benson Henderson|Carlos Condit|Miguel Torres|Mike Brown",
    "extras": "Brian Bowles|Eddie Wineland|Jamie Varner|Steve Cantwell",
    "aliases": {
      "Jose Aldo": [
        "Aldo"
      ],
      "Dominick Cruz": [
        "The Dominator"
      ],
      "Urijah Faber": [
        "The California Kid"
      ],
      "Anthony Pettis": [
        "Showtime"
      ],
      "Benson Henderson": [
        "Bendo"
      ],
      "Carlos Condit": [
        "The Natural Born Killer"
      ]
    },
    "source": [
      "https://www.ufc.com/news/wec-forever-legacy-little-blue-cage-ufc",
      "https://www.ufc.com/news/best-2012-so-far",
      "https://www.ufc.com/news/wec-champ-cantwell-gets-fresh-start-ufc"
    ]
  },
  {
    "id": "ufc-v2-main2-strikeforce-champions",
    "lane": "former-strikeforce-champions",
    "prompt": "Name a fighter who won a Strikeforce championship and also fought in the UFC.",
    "kind": "person",
    "ranked": "Ronda Rousey|Luke Rockhold|Nick Diaz|Gilbert Melendez|Alistair Overeem|Miesha Tate|Ronaldo Souza|Gegard Mousasi",
    "extras": "Jake Shields|Dan Henderson|Cung Le|Sarah Kaufman|Tarec Saffiedine|Cris Cyborg|Rafael Cavalcante|Nate Marquardt",
    "aliases": {
      "Ronaldo Souza": [
        "Jacare",
        "Jacaré"
      ],
      "Alistair Overeem": [
        "The Reem"
      ],
      "Cris Cyborg": [
        "Cyborg"
      ]
    },
    "source": [
      "https://www.ufc.com/news/strikeforce-rousey-vs-kaufman-main-card-results"
    ]
  },
  {
    "id": "ufc-v2-main2-hof-fight-wing",
    "lane": "ufc-hof-fight-wing",
    "prompt": "Name a UFC fighter who appeared in a bout inducted into the UFC Hall of Fame's Fight Wing.",
    "kind": "person",
    "ranked": "Forrest Griffin|Stephan Bonnar|Jon Jones|Alexander Gustafsson|Robbie Lawler|Rory MacDonald|Anderson Silva|Chael Sonnen",
    "extras": "Dan Henderson|Mauricio Rua|Zhang Weili|Joanna Jedrzejczyk|Israel Adesanya|Kelvin Gastelum|Cub Swanson|Doo Ho Choi|Diego Sanchez|Clay Guida|Mark Coleman|Pete Williams|Matt Hughes|Frank Trigg",
    "aliases": {
      "Mauricio Rua": [
        "Shogun",
        "Shogun Rua"
      ],
      "Joanna Jedrzejczyk": [
        "Joanna Champion"
      ],
      "Anderson Silva": [
        "The Spider"
      ]
    },
    "source": [
      "https://www.ufc.com/ufc-hall-of-fame"
    ]
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_MAIN_BATCH2 = makeUfcFeudDraft(ROWS);
