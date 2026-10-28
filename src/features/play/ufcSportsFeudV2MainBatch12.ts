import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Distinct UFC championship/official/crossover editorial candidates; requires independent final signoff. */
const ROWS = [
  {
    "id": "ufc-v2-main12-two-division-ufc-champs",
    "lane": "ufc-two-division-undisputed-champs",
    "prompt": "Name a fighter who won undisputed UFC championships in two different weight classes as of October 2026.",
    "kind": "person",
    "ranked": "Conor McGregor|Amanda Nunes|Georges St-Pierre|Daniel Cormier|Henry Cejudo|Jon Jones|Alex Pereira|Randy Couture",
    "extras": "BJ Penn|Ilia Topuria|Islam Makhachev",
    "aliases": {
      "Georges St-Pierre": [
        "GSP"
      ],
      "Daniel Cormier": [
        "DC"
      ],
      "Henry Cejudo": [
        "Triple C"
      ],
      "Jon Jones": [
        "Bones"
      ],
      "Alex Pereira": [
        "Poatan"
      ],
      "BJ Penn": [
        "BJ"
      ],
      "Ilia Topuria": [
        "El Matador"
      ]
    },
    "source": [
      "https://www.ufc.com/news/history-two-division-champions-part-1-ufc-freedom-250",
      "https://www.ufc.com/news/history-two-division-champs-part-2-ufc-freedom-250"
    ]
  },
  {
    "id": "ufc-v2-main12-five-title-defenses",
    "lane": "ufc-career-five-title-defenses",
    "prompt": "Name a fighter who successfully defended an undisputed UFC championship at least five times over their UFC career.",
    "kind": "person",
    "ranked": "Demetrious Johnson|Jon Jones|Georges St-Pierre|Anderson Silva|Jose Aldo|Valentina Shevchenko|Ronda Rousey|Joanna Jedrzejczyk",
    "extras": "Amanda Nunes|Kamaru Usman|Israel Adesanya|Alexander Volkanovski|Tito Ortiz|Matt Hughes",
    "aliases": {
      "Demetrious Johnson": [
        "Mighty Mouse"
      ],
      "Georges St-Pierre": [
        "GSP"
      ],
      "Jose Aldo": [
        "José Aldo"
      ],
      "Valentina Shevchenko": [
        "Bullet"
      ],
      "Joanna Jedrzejczyk": [
        "Joanna Jędrzejczyk",
        "Joanna Champion"
      ],
      "Alexander Volkanovski": [
        "Volk"
      ]
    },
    "source": [
      "https://www.ufc.com/news/longest-ufc-title-reigns-legends-octagon",
      "https://www.ufc.com/news/ufc-womens-strawweight-title-lineage-esparza-jedrzejczyk-namajunas-andrade-zhang",
      "https://statleaders.ufc.com/en"
    ]
  },
  {
    "id": "ufc-v2-main12-pro-kickboxing-careers",
    "lane": "ufc-fighters-pro-kickboxing-careers",
    "prompt": "Name a fighter who competed in professional kickboxing before competing in the UFC.",
    "kind": "person",
    "ranked": "Alex Pereira|Israel Adesanya|Alistair Overeem|Mirko Cro Cop|Mark Hunt|Valentina Shevchenko|Joanna Jedrzejczyk|Stephen Thompson",
    "extras": "Gokhan Saki|Donald Cerrone|Edson Barboza|Cung Le|Michael Page",
    "aliases": {
      "Alex Pereira": [
        "Poatan"
      ],
      "Israel Adesanya": [
        "Izzy",
        "The Last Stylebender"
      ],
      "Mirko Cro Cop": [
        "Mirko Filipovic",
        "Cro Cop"
      ],
      "Joanna Jedrzejczyk": [
        "Joanna Champion",
        "Joanna Jędrzejczyk"
      ],
      "Donald Cerrone": [
        "Cowboy"
      ],
      "Michael Page": [
        "MVP"
      ],
      "Gokhan Saki": [
        "The Rebel"
      ]
    },
    "source": [
      "https://www.ufc.com/athlete/alex-pereira",
      "https://www.ufc.com/athlete/israel-adesanya",
      "https://www.ufc.com/athlete/mark-hunt",
      "https://www.ufc.com/athlete/valentina-shevchenko",
      "https://www.ufc.com/athlete/stephen-thompson"
    ]
  },
  {
    "id": "ufc-v2-main12-ufc-title-referees",
    "lane": "ufc-top-twelve-most-experienced-referees",
    "prompt": "Name a referee among the twelve with the most UFC fights officiated in the October 23, 2026 FightIQ all-time referee table.",
    "kind": "person",
    "ranked": "Herb Dean|John McCarthy|Marc Goddard|Dan Miragliotta|Jason Herzog|Mark Smith|Chris Tognoni|Keith Peterson",
    "extras": "Mario Yamasaki|Yves Lavigne|Mike Beltran|Steve Mazzagatti",
    "aliases": {
      "John McCarthy": ["Big John McCarthy", "Big John"],
      "Marc Goddard": ["Goddard"],
      "Dan Miragliotta": ["Miragliotta"],
      "Jason Herzog": ["Herzog"],
      "Chris Tognoni": ["Tognoni"],
      "Mario Yamasaki": ["Yamasaki"],
      "Steve Mazzagatti": ["Mazzagatti"]
    },
    "source": ["https://fightiq.net/stats/decision-rate-by-referee"]
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_MAIN_BATCH12 = makeUfcFeudDraft(ROWS);
