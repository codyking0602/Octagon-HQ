import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";

/** Individually sourced UFC history / culture candidates. These are not live. */
const ROWS = [
  {
    id: "ufc-v2-main8-ea-cover-athletes",
    lane: "ea-sports-ufc-cover-athletes",
    prompt: "Name a UFC fighter who has appeared on the cover of an EA SPORTS UFC video game, from UFC 1 through UFC 6.",
    kind: "person",
    ranked: "Conor McGregor|Ronda Rousey|Jon Jones|Israel Adesanya|Alexander Volkanovski|Valentina Shevchenko|Jorge Masvidal|Alexander Gustafsson",
    extras: "Alex Pereira|Max Holloway",
    aliases: {
      "Conor McGregor": ["The Notorious", "Conor"],
      "Ronda Rousey": ["Rowdy Ronda", "Rousey"],
      "Jon Jones": ["Bones Jones", "Bones"],
      "Israel Adesanya": ["Stylebender", "Izzy"],
      "Alexander Volkanovski": ["Volk", "The Great"],
      "Valentina Shevchenko": ["The Bullet", "Shevchenko"],
      "Jorge Masvidal": ["Gamebred", "Masvidal"],
      "Alexander Gustafsson": ["The Mauler", "Gustafsson"],
      "Alex Pereira": ["Poatan"],
      "Max Holloway": ["Blessed", "Holloway"]
    },
    source: [
      "https://www.ufc.com/news/its-jones-vs-gustafsson-ea-game-cover",
      "https://www.ufc.com/news/aldo-and-mcgregor-fight-cover",
      "https://www.mmafighting.com/2023/9/5/23714232/alexander-volkanovski-valentina-shevchenko-announced-as-cover-athletes-for-ea-sports-ufc-5",
      "https://www.ufc.com/news/fight-your-fight-ea-sports-ufc-6-arrives-june-19-delivering-next-level-fighter-individuality"
    ]
  },
  {
    id: "ufc-v2-main8-first-division-champions",
    lane: "inaugural-ufc-division-champions",
    prompt: "Name a fighter who became the first recognized UFC champion in a men's or women's weight division.",
    kind: "person",
    ranked: "Ronda Rousey|Demetrious Johnson|Jose Aldo|Dominick Cruz|Mark Coleman|Jens Pulver|Pat Miletich|Frank Shamrock",
    extras: "Dave Menne|Carla Esparza|Nicco Montano|Germaine de Randamie",
    aliases: {
      "Ronda Rousey": ["Rousey", "Rowdy Ronda"],
      "Demetrious Johnson": ["Mighty Mouse", "DJ"],
      "Jose Aldo": ["José Aldo", "Aldo"],
      "Dominick Cruz": ["The Dominator", "Cruz"],
      "Mark Coleman": ["The Hammer", "Coleman"],
      "Jens Pulver": ["Lil Evil", "Little Evil"],
      "Pat Miletich": ["Miletich"],
      "Frank Shamrock": ["Frank"],
      "Carla Esparza": ["Cookie Monster"],
      "Germaine de Randamie": ["The Iron Lady", "GDR"],
      "Nicco Montano": ["Nicco Montaño"]
    },
    source: [
      "https://www.ufc.com/news/top-500-ufc-moments-list",
      "https://www.ufc.com/news/women-in-the-ufc-30th-anniversary",
      "https://www.ufc.com/news/ufc-womens-featherweight-title-lineage-De-Randamie-Cyborg-Nunes",
      "https://www.ufc.com/news/unfiltered-episode-222-nicco-montano"
    ]
  }
] as const satisfies readonly UFCFeudDraftRow[];

export const UFC_SPORTS_FEUD_V2_MAIN_BATCH8 = makeUfcFeudDraft(ROWS);
