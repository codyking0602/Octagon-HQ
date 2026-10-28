import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** UFC Sports Feud third new topic batch — EDITORIAL DRAFT, intentionally not live. */
const ROWS = [
  {
    "id": "ufc-v2-main3-ufc100-card",
    "lane": "ufc100-fight-card",
    "prompt": "Name a fighter who competed on the UFC 100 card in 2009.",
    "kind": "person",
    "ranked": "Brock Lesnar|Frank Mir|Georges St-Pierre|Dan Henderson|Michael Bisping|Jon Jones|Thiago Alves|Jon Fitch",
    "extras": "Paulo Thiago|Yoshihiro Akiyama|Alan Belcher|Mark Coleman|Stephan Bonnar|Jim Miller|Mac Danzig|Jake O'Brien|TJ Grant|Dong Hyun Kim|CB Dollaway|Tom Lawlor|Matt Grice|Shannon Gugerty",
    "aliases": {
      "Georges St-Pierre": [
        "GSP"
      ],
      "Yoshihiro Akiyama": [
        "Sexyama"
      ],
      "Dan Henderson": [
        "Hendo"
      ],
      "Dong Hyun Kim": [
        "Stun Gun"
      ]
    },
    "source": [
      "https://www.ufc.com/event/ufc-100",
      "https://us.ufcespanol.com/news/ufc-confirms-remaining-fights-ufc-100"
    ]
  },
  {
    "id": "ufc-v2-main3-ufc300-card",
    "lane": "ufc300-fight-card",
    "prompt": "Name a fighter who competed on the UFC 300 card in 2024.",
    "kind": "person",
    "ranked": "Alex Pereira|Max Holloway|Justin Gaethje|Charles Oliveira|Zhang Weili|Jamahal Hill|Kayla Harrison|Holly Holm",
    "extras": "Yan Xiaonan|Arman Tsarukyan|Jiri Prochazka|Aleksandar Rakic|Bo Nickal|Cody Brundage|Aljamain Sterling|Calvin Kattar|Sodiq Yusuff|Diego Lopes|Jalin Turner|Renato Moicano|Jessica Andrade|Marina Rodriguez|Bobby Green|Jim Miller|Deiveson Figueiredo|Cody Garbrandt",
    "aliases": {
      "Alex Pereira": [
        "Poatan"
      ],
      "Zhang Weili": [
        "Weili Zhang"
      ],
      "Jiri Prochazka": [
        "Jiří Procházka"
      ],
      "Bobby Green": [
        "King Green"
      ],
      "Jessica Andrade": [
        "Jéssica Andrade"
      ]
    },
    "source": [
      "https://www.ufc.com/event/ufc-300",
      "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-300-pereira-vs-hill"
    ]
  },
  {
    "id": "ufc-v2-main3-ufc200-card",
    "lane": "ufc200-fight-card",
    "prompt": "Name a fighter who competed on the UFC 200 card in 2016.",
    "kind": "person",
    "ranked": "Amanda Nunes|Miesha Tate|Brock Lesnar|Mark Hunt|Daniel Cormier|Anderson Silva|Jose Aldo|Frankie Edgar",
    "extras": "Cain Velasquez|Travis Browne|Julianna Pena|Cat Zingano|TJ Dillashaw|Raphael Assuncao|Sage Northcutt|Enrique Marin|Johny Hendricks|Kelvin Gastelum|Gegard Mousasi|Thiago Santos|Joe Lauzon|Diego Sanchez|Jim Miller|Takanori Gomi",
    "aliases": {
      "Daniel Cormier": [
        "DC"
      ],
      "Jose Aldo": [
        "Aldo"
      ],
      "Raphael Assuncao": [
        "Raphael Assunção"
      ],
      "Julianna Pena": [
        "Julianna Peña"
      ],
      "Anderson Silva": [
        "The Spider"
      ]
    },
    "source": [
      "https://www.ufc.com/news/ufc-200-results-and-news-vegas",
      "https://www.ufc.com/event/ufc-200"
    ]
  },
  {
    "id": "ufc-v2-main3-tuf1-contestants",
    "lane": "ultimate-fighter-season-one-contestants",
    "prompt": "Name a fighter who appeared as a contestant on Season 1 of The Ultimate Fighter.",
    "kind": "person",
    "ranked": "Forrest Griffin|Stephan Bonnar|Diego Sanchez|Kenny Florian|Josh Koscheck|Chris Leben|Mike Swick|Nate Quarry",
    "extras": "Bobby Southworth|Alex Schoenauer|Sam Hoger|Lodune Sincaid|Jason Thacker|Chris Sanford|Josh Rafferty|Alex Karalexis",
    "aliases": {
      "Kenny Florian": [
        "KenFlo"
      ],
      "Forrest Griffin": [
        "Forrest"
      ],
      "Stephan Bonnar": [
        "Bonnar"
      ],
      "Nate Quarry": [
        "Nathan Quarry"
      ]
    },
    "source": [
      "https://www.ufc.com/news/crippler-calls-it-day",
      "https://en.wikipedia.org/wiki/The_Ultimate_Fighter_1"
    ]
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_MAIN_BATCH3 = makeUfcFeudDraft(ROWS);
