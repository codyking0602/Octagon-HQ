import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Historically grounded UFC returnees who fought another promotion between stints. */
const ROWS = [
  {
    "id": "ufc-v2-main8-ufc-returnees",
    "lane": "ufc-veterans-left-and-returned",
    "prompt": "Name a fighter who had at least two UFC stints, with fights in another MMA promotion between them.",
    "kind": "person",
    "ranked": "Robbie Lawler|BJ Penn|Andrei Arlovski|Josh Barnett|Nick Diaz|Mark Coleman|Mirko Cro Cop|Fabricio Werdum",
    "extras": "Frank Trigg|Joe Riggs",
    "aliases": {
      "Robbie Lawler": [
        "Ruthless"
      ],
      "BJ Penn": [
        "The Prodigy"
      ],
      "Andrei Arlovski": [
        "Pitbull"
      ],
      "Josh Barnett": [
        "Warmaster"
      ],
      "Nick Diaz": [
        "Nick"
      ],
      "Mirko Cro Cop": [
        "Cro Cop",
        "Mirko Filipovic"
      ]
    },
    "source": [
      "https://www.ufc.com/athlete/robbie-lawler",
      "https://www.ufc.com/news/robbie-lawler-ruthless-return",
      "https://www.ufc.com/athlete/nick-diaz",
      "https://www.ufc.com/video/37191"
    ]
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_SIX_MONTH_MAIN_RETURNING_VETS = makeUfcFeudDraft(ROWS);
