import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Family identities: source-checked Main question, editorial only. */
const ROWS = [
  {
    "id": "ufc-v2-main5-ufc-siblings",
    "lane": "ufc-sibling-fighters",
    "prompt": "Name a fighter whose brother or sister has also fought in the UFC.",
    "kind": "person",
    "ranked": "Nick Diaz|Nate Diaz|Anthony Pettis|Sergio Pettis|Valentina Shevchenko|Antonina Shevchenko|Antonio Rodrigo Nogueira|Antonio Rogerio Nogueira",
    "extras": "Ken Shamrock|Frank Shamrock|Kamaru Usman|Mohammed Usman|Dan Miller|Jim Miller|Matt Hughes|Mark Hughes|Joe Lauzon|Dan Lauzon",
    "aliases": {
      "Nick Diaz": [
        "Nick"
      ],
      "Nate Diaz": [
        "Nate"
      ],
      "Anthony Pettis": [
        "Showtime"
      ],
      "Valentina Shevchenko": [
        "Bullet"
      ],
      "Antonio Rodrigo Nogueira": [
        "Big Nog",
        "Minotauro"
      ],
      "Antonio Rogerio Nogueira": [
        "Lil Nog",
        "Minotouro"
      ],
      "Frank Shamrock": [
        "Frank"
      ],
      "Ken Shamrock": [
        "Ken"
      ]
    },
    "source": [
      "https://www.ufc.com/news/national-sibling-day-diaz-brothers-shevchenko-sisters",
      "https://www.ufc.com/news/fighting-brothers-ufc-128",
      "https://www.ufc.com/news/brothers-armbars-raw-story"
    ]
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_MAIN_BATCH5_SUPPLEMENT = makeUfcFeudDraft(ROWS);
