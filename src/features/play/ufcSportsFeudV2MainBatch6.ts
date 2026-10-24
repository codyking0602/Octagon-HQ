import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Sixth editorial Main question batch. No live publisher imports. */
const ROWS = [
  {
    "id": "ufc-v2-main6-reclaimed-title",
    "lane": "former-champ-reclaimed-ufc-title",
    "prompt": "Name a UFC fighter who lost or relinquished a UFC title, then later won that same division's undisputed championship again.",
    "kind": "person",
    "ranked": "Georges St-Pierre|Amanda Nunes|Rose Namajunas|Stipe Miocic|Israel Adesanya|Zhang Weili|Dominick Cruz|Randy Couture",
    "extras": "Cain Velasquez|TJ Dillashaw|Carla Esparza|Deiveson Figueiredo|Frankie Edgar",
    "aliases": {
      "Georges St-Pierre": [
        "GSP"
      ],
      "Rose Namajunas": [
        "Thug Rose"
      ],
      "Zhang Weili": [
        "Weili Zhang"
      ],
      "Israel Adesanya": [
        "Izzy"
      ],
      "Dominick Cruz": [
        "The Dominator"
      ],
      "Deiveson Figueiredo": [
        "Deus da Guerra"
      ]
    },
    "source": [
      "https://www.ufc.com/news/reclaiming-gold-ufc-fight-pass-dillashaw-nunes-figueiredo-esparza-miocic-namajunas-cruz-jones",
      "https://www.ufc.com/athlete/rose-namajunas"
    ]
  },
  {
    "id": "ufc-v2-main6-ex-fighter-analysts",
    "lane": "ufc-fighter-broadcast-analysts",
    "prompt": "Name a former UFC fighter who has worked as a UFC fight analyst or commentator.",
    "kind": "person",
    "ranked": "Daniel Cormier|Michael Bisping|Dominick Cruz|Paul Felder|Kenny Florian|Brian Stann|Din Thomas|Anthony Smith",
    "extras": "Chael Sonnen|Rashad Evans|Matt Serra|Brendan Schaub|Dan Hardy",
    "aliases": {
      "Daniel Cormier": [
        "DC"
      ],
      "Michael Bisping": [
        "The Count"
      ],
      "Dominick Cruz": [
        "Cruz"
      ],
      "Kenny Florian": [
        "KenFlo"
      ],
      "Paul Felder": [
        "The Irish Dragon"
      ]
    },
    "source": [
      "https://www.ufc.com/news/ufc-commentators-megan-olivi-paul-felder-and-michael-bisping-re-sign-long-term-extensions",
      "https://www.ufc.com/news/actor-and-commentator-felder-still-fighter-heart",
      "https://www.ufc.com/news/ufc-fight-pass-launches-podcast-network-featuring-exclusive-content"
    ]
  },
  {
    "id": "ufc-v2-main6-trilogy-participants",
    "lane": "ufc-fighter-three-bouts-same-opponent",
    "prompt": "Name a UFC fighter who has fought the same opponent at least three times inside the UFC.",
    "kind": "person",
    "ranked": "Conor McGregor|Dustin Poirier|Stipe Miocic|Daniel Cormier|Max Holloway|Alexander Volkanovski|Brandon Moreno|Deiveson Figueiredo",
    "extras": "Georges St-Pierre|Matt Hughes|Randy Couture|Chuck Liddell|Tito Ortiz|Ken Shamrock|Cain Velasquez|Junior dos Santos|Frankie Edgar|Gray Maynard|BJ Penn|Jose Aldo",
    "aliases": {
      "Georges St-Pierre": [
        "GSP"
      ],
      "Daniel Cormier": [
        "DC"
      ],
      "Alexander Volkanovski": [
        "Volk"
      ],
      "Junior dos Santos": [
        "JDS"
      ],
      "Deiveson Figueiredo": [
        "Deus da Guerra"
      ]
    },
    "source": [
      "https://www.ufc.com/news/greatest-trilogies-ufc-history",
      "https://www.ufc.com/news/ufc-trilogies-ranking"
    ]
  },
  {
    "id": "ufc-v2-main6-women-title-holders",
    "lane": "ufc-womens-champion-identities",
    "prompt": "Name a woman who has held an undisputed UFC championship.",
    "kind": "person",
    "ranked": "Ronda Rousey|Amanda Nunes|Valentina Shevchenko|Zhang Weili|Joanna Jedrzejczyk|Rose Namajunas|Holly Holm|Cris Cyborg",
    "extras": "Miesha Tate|Julianna Pena|Carla Esparza|Jessica Andrade|Alexa Grasso|Germaine de Randamie|Raquel Pennington|Nicco Montano|Jessica Penne",
    "aliases": {
      "Cris Cyborg": [
        "Cyborg"
      ],
      "Zhang Weili": [
        "Weili Zhang"
      ],
      "Joanna Jedrzejczyk": [
        "Joanna Champion",
        "Joanna Jędrzejczyk"
      ],
      "Julianna Pena": [
        "Julianna Peña"
      ],
      "Valentina Shevchenko": [
        "Bullet"
      ]
    },
    "source": [
      "https://www.ufc.com/news/ufc-womens-bantamweight-title-lineage-Rousey-Holm-Tate-Nunes-Pena",
      "https://www.ufc.com/news/ufc-womens-strawweight-title-lineage-esparza-jedrzejczyk-namajunas-andrade-zhang"
    ]
  },
  {
    "id": "ufc-v2-main6-champion-coaches",
    "lane": "ufc-championship-coaches",
    "prompt": "Name an MMA coach who has coached a UFC champion.",
    "kind": "person",
    "ranked": "Javier Mendez|Trevor Wittman|Eugene Bareman|Greg Jackson|John Kavanagh|Mike Brown|Eric Nicksick|Firas Zahabi",
    "extras": "Mike Winkeljohn|Henri Hooft|Jason Parillo|Rafael Cordeiro|Mark Henry|Duane Ludwig|Robert Follis|Dean Thomas",
    "aliases": {
      "Javier Mendez": [
        "Mendez"
      ],
      "Trevor Wittman": [
        "Wittman"
      ],
      "Eugene Bareman": [
        "Bareman"
      ],
      "John Kavanagh": [
        "Kavanagh"
      ],
      "Firas Zahabi": [
        "Firas"
      ],
      "Mike Winkeljohn": [
        "Winkeljohn"
      ]
    },
    "source": [
      "https://www.ufc.com/news/coaches-behind-ufc-champions",
      "https://www.ufc.com/athlete/islam-makhachev"
    ]
  },
  {
    "id": "ufc-v2-main6-khabib-opponents",
    "lane": "khabib-ufc-opponents",
    "prompt": "Name a fighter who competed against Khabib Nurmagomedov in a UFC bout.",
    "kind": "person",
    "ranked": "Conor McGregor|Dustin Poirier|Justin Gaethje|Al Iaquinta|Edson Barboza|Michael Johnson|Rafael dos Anjos|Gleison Tibau",
    "extras": "Pat Healy|Abel Trujillo|Thiago Tavares|Kamal Shalorus|Darrell Horcher|Shalorus",
    "aliases": {
      "Rafael dos Anjos": [
        "RDA"
      ],
      "Conor McGregor": [
        "The Notorious"
      ],
      "Edson Barboza": [
        "Barboza"
      ],
      "Gleison Tibau": [
        "Tibau"
      ]
    },
    "source": [
      "https://www.ufc.com/athlete/khabib-nurmagomedov",
      "https://www.ufc.com/news/khabib-nurmagomedov-ufc-fight-history"
    ]
  },
  {
    "id": "ufc-v2-main6-ufc-fight-announcers",
    "lane": "ufc-fight-playbyplay-personnel",
    "prompt": "Name someone who has done UFC play-by-play or color commentary on a UFC fight broadcast.",
    "kind": "person",
    "ranked": "Joe Rogan|Jon Anik|Daniel Cormier|Michael Bisping|Paul Felder|Dominick Cruz|Laura Sanko|Mike Goldberg",
    "extras": "Brendan Fitzgerald|John Gooden|Kenny Florian|Brian Stann|Dan Hardy|Jimmy Smith|T.J. De Santis",
    "aliases": {
      "Daniel Cormier": [
        "DC"
      ],
      "Mike Goldberg": [
        "Goldie"
      ],
      "Kenny Florian": [
        "KenFlo"
      ],
      "Joe Rogan": [
        "Rogan"
      ],
      "Jon Anik": [
        "Anik"
      ]
    },
    "source": [
      "https://www.ufc.com/video/144638",
      "https://www.ufc.com/news/brendan-fitzgerald-interview-ufc-play-by-play-announcer"
    ]
  },
  {
    "id": "ufc-v2-main6-legendary-venues",
    "lane": "ufc-major-event-arenas",
    "prompt": "Name a venue where the UFC has staged a major numbered UFC event.",
    "kind": "person",
    "ranked": "T-Mobile Arena|Madison Square Garden|MGM Grand Garden Arena|Etihad Arena|O2 Arena|Rod Laver Arena|Scotiabank Arena|Jeunesse Arena",
    "extras": "Crypto.com Arena|UFC Apex|Saitama Super Arena|Accor Arena|Toyota Center|Barclays Center|The Forum|Honda Center|Etihad Stadium",
    "aliases": {
      "Madison Square Garden": [
        "MSG"
      ],
      "T-Mobile Arena": [
        "T Mobile Arena"
      ],
      "O2 Arena": [
        "The O2"
      ],
      "Scotiabank Arena": [
        "Air Canada Centre"
      ],
      "Crypto.com Arena": [
        "Staples Center"
      ],
      "Jeunesse Arena": [
        "HSBC Arena"
      ]
    },
    "source": [
      "https://www.ufc.com/events",
      "https://www.ufc.com/event/ufc-205",
      "https://www.ufc.com/event/ufc-300"
    ]
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_MAIN_BATCH6 = makeUfcFeudDraft(ROWS);
