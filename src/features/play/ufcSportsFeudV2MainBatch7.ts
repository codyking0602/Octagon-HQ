import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Documented Hall of Fame contributor honors (not fighters). Review-only. */
const ROWS = [
  {
    "id": "ufc-v2-main7-hof-contributors",
    "lane": "ufc-hall-of-fame-contributors",
    "prompt": "Name someone inducted into the UFC Hall of Fame's Contributor Wing.",
    "kind": "person",
    "ranked": "Art Davie|Joe Silva|Marc Ratner|Jeff Blatnick|Charles Lewis|Craig Piligian|Bob Meyrowitz|Thomas Gerbasi",
    "extras": "Bruce Connal",
    "aliases": {
      "Charles Lewis": [
        "Mask",
        "Charles Mask Lewis"
      ],
      "Art Davie": [
        "Arthur Davie"
      ],
      "Joe Silva": [
        "Joseph Silva"
      ],
      "Marc Ratner": [
        "Ratner"
      ]
    },
    "source": [
      "https://www.ufc.com/ufc-hall-of-fame",
      "https://www.ufc.com/news/ufc-hall-fame-faq"
    ]
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_MAIN_BATCH7 = makeUfcFeudDraft(ROWS);
