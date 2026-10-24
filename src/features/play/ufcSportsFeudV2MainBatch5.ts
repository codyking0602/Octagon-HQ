import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** UFC Sports Feud fifth editorial Main batch — not active in Daily. */
const ROWS = [
  {
    "id": "ufc-v2-main5-dwcs-graduates",
    "lane": "ufc-dwcs-alumni",
    "prompt": "Name a fighter who earned a UFC contract with a win on Dana White's Contender Series.",
    "kind": "person",
    "ranked": "Sean O'Malley|Jamahal Hill|Bo Nickal|Johnny Walker|Maycee Barber|Jack Della Maddalena|Carlos Ulberg|Geoff Neal",
    "extras": "Joe Pyfer|Michael Morales|Anthony Hernandez|Jailton Almeida|Sean Woodson|Punahele Soriano|Sodiq Yusuff|Carlos Prates|Quillan Salkilld",
    "aliases": {
      "Sean O'Malley": [
        "Suga Sean"
      ],
      "Jamahal Hill": [
        "Sweet Dreams"
      ],
      "Jack Della Maddalena": [
        "JDM"
      ],
      "Carlos Ulberg": [
        "Black Jag"
      ]
    },
    "source": [
      "https://www.ufc.com/dwcs",
      "https://www.ufc.com/news/champions-dana-whites-contender-series"
    ]
  },
  {
    "id": "ufc-v2-main5-ncaa-champs",
    "lane": "ufc-ncaa-division-one-wrestling-winners",
    "prompt": "Name a UFC fighter who won an NCAA Division I national wrestling championship.",
    "kind": "person",
    "ranked": "Brock Lesnar|Bo Nickal|Ben Askren|Mark Coleman|Johny Hendricks|Phil Davis|Gregor Gillespie|Kevin Randleman",
    "extras": "Josh Koscheck|Mark Schultz",
    "aliases": {
      "Ben Askren": [
        "Funky"
      ],
      "Johny Hendricks": [
        "Bigg Rigg"
      ],
      "Mark Coleman": [
        "The Hammer"
      ]
    },
    "source": [
      "https://www.ufc.com/athlete/bo-nickal",
      "https://www.ufc.com/news/wrestling-greats-made-transition-mma",
      "https://en.wikipedia.org/wiki/1987_NCAA_Division_I_Wrestling_Championships"
    ]
  },
  {
    "id": "ufc-v2-main5-military-vets",
    "lane": "ufc-fighters-us-military-service",
    "prompt": "Name a UFC fighter who served in the United States military.",
    "kind": "person",
    "ranked": "Brian Stann|Tim Kennedy|Liz Carmouche|Neil Magny|Colton Smith|Randy Couture|Brandon Vera|Rich Clementi",
    "extras": "Jorge Rivera",
    "aliases": {
      "Brian Stann": [
        "All American"
      ],
      "Liz Carmouche": [
        "Girlrilla"
      ],
      "Randy Couture": [
        "The Natural"
      ]
    },
    "source": [
      "https://www.ufc.com/news/military-vets-fight-troops-card",
      "https://www.ufc.com/news/brian-stann-retires-32",
      "https://www.ufc.com/news/colton-smith-living-proof-experience-comes-many-forms"
    ]
  },
  {
    "id": "ufc-v2-main5-professional-boxers",
    "lane": "ufc-fighters-professional-boxing-records",
    "prompt": "Name a fighter who competed in the UFC and also had a professional boxing bout.",
    "kind": "person",
    "ranked": "Conor McGregor|Francis Ngannou|Anderson Silva|Holly Holm|Nate Diaz|Tyron Woodley|Jorge Masvidal|Ben Askren",
    "extras": "Chris Avila",
    "aliases": {
      "Conor McGregor": [
        "Conor"
      ],
      "Francis Ngannou": [
        "The Predator"
      ],
      "Jorge Masvidal": [
        "Gamebred"
      ],
      "Ben Askren": [
        "Funky"
      ]
    },
    "source": [
      "https://www.ufc.com/athlete/conor-mcgregor",
      "https://www.ufc.com/athlete/holly-holm",
      "https://www.ufc.com/athlete/nate-diaz"
    ]
  },
  {
    "id": "ufc-v2-main5-bareknuckle-alumni",
    "lane": "ufc-fighters-bareknuckle-crossovers",
    "prompt": "Name a former UFC fighter who has also competed in bare-knuckle boxing.",
    "kind": "person",
    "ranked": "Mike Perry|Paige VanZant|Chad Mendes|Artem Lobov|Chris Leben|Bec Rawlings|Eddie Alvarez|Ben Rothwell",
    "extras": "John Dodson|Jeremy Stephens|Alan Belcher|Hector Lombard|Thiago Alves|Rachael Ostovich|Melvin Guillard|Jimmie Rivera",
    "aliases": {
      "Mike Perry": [
        "Platinum"
      ],
      "Paige VanZant": [
        "12 Gauge"
      ],
      "Artem Lobov": [
        "Russian Hammer"
      ]
    },
    "source": [
      "https://www.ufc.com/athlete/mike-perry",
      "https://www.ufc.com/athlete/paige-vanzant"
    ]
  },
  {
    "id": "ufc-v2-main5-title-by-strikes",
    "lane": "ufc-undisputed-title-earned-by-ko-tko",
    "prompt": "Name a fighter who first won an undisputed UFC championship with a KO or TKO in the title-winning bout.",
    "kind": "person",
    "ranked": "Conor McGregor|Holly Holm|Chris Weidman|Francis Ngannou|Charles Oliveira|Anderson Silva|Israel Adesanya|Sean O'Malley",
    "extras": "Jon Jones|Stipe Miocic|Alex Pereira|Georges St-Pierre|Rashad Evans",
    "aliases": {
      "Conor McGregor": [
        "The Notorious"
      ],
      "Jon Jones": [
        "Bones"
      ],
      "Georges St-Pierre": [
        "GSP"
      ]
    },
    "source": [
      "https://www.ufc.com/event/ufc-194",
      "https://www.ufc.com/event/ufc-260",
      "https://www.ufc.com/event/ufc-292"
    ]
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_MAIN_BATCH5 = makeUfcFeudDraft(ROWS);
