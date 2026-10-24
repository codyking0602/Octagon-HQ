import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Verifiable cross-combat-sport achievements; not live. */
const ROWS = [
  {
    "id": "ufc-v2-main8-pro-kickboxing",
    "lane": "ufc-fighters-with-pro-kickboxing-bouts",
    "prompt": "Name a UFC fighter who also competed professionally in kickboxing or Muay Thai.",
    "kind": "person",
    "ranked": "Alex Pereira|Israel Adesanya|Alistair Overeem|Mark Hunt|Mirko Cro Cop|Stephen Thompson|Joanna Jedrzejczyk|Valentina Shevchenko",
    "extras": "Cung Le|Gokhan Saki|Edson Barboza|Darren Till",
    "aliases": {
      "Alex Pereira": [
        "Poatan"
      ],
      "Israel Adesanya": [
        "Izzy"
      ],
      "Stephen Thompson": [
        "Wonderboy"
      ],
      "Valentina Shevchenko": [
        "Bullet"
      ],
      "Joanna Jedrzejczyk": [
        "Joanna Champion",
        "Joanna Jędrzejczyk"
      ],
      "Mirko Cro Cop": [
        "Cro Cop",
        "Mirko Filipovic"
      ],
      "Alistair Overeem": [
        "The Reem"
      ]
    },
    "source": [
      "https://www.ufc.com/news/overeem-vs-hunt-lands-ufc-209-card",
      "https://www.ufc.com/news/they-have-history-pre-ufc-rematches-ufc-281-adesanya-vs-pereira",
      "https://www.ufc.com/athlete/stephen-thompson",
      "https://www.ufc.com/news/past-present-and-future-mirko-cro-cop"
    ]
  },
  {
    "id": "ufc-v2-main8-grappling-world-titles",
    "lane": "ufc-fighters-international-grappling-world-titles",
    "prompt": "Name a UFC fighter who has won an IBJJF world title or an ADCC world championship in grappling.",
    "kind": "person",
    "ranked": "BJ Penn|Gilbert Burns|Mackenzie Dern|Rodolfo Vieira|Ronaldo Souza|Fabricio Werdum|Kron Gracie|Gabriel Gonzaga",
    "extras": "Robert Drysdale|Demian Maia|Augusto Mendes",
    "aliases": {
      "BJ Penn": [
        "The Prodigy"
      ],
      "Gilbert Burns": [
        "Durinho"
      ],
      "Ronaldo Souza": [
        "Jacare Souza",
        "Jacaré"
      ],
      "Fabricio Werdum": [
        "Vai Cavalo"
      ],
      "Mackenzie Dern": [
        "Dern"
      ],
      "Kron Gracie": [
        "Kron"
      ]
    },
    "source": [
      "https://www.ufc.com/news/penns-prodigious-history",
      "https://www.ufc.com/athlete/gilbert-burns",
      "https://www.ufc.com/athlete/mackenzie-dern",
      "https://www.ufc.com/athlete/rodolfo-vieira"
    ]
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_SIX_MONTH_MAIN_ATHLETE_HONORS = makeUfcFeudDraft(ROWS);
