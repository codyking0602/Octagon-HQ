import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Three distinct UFC culture and promotion prompts; editorial only, not live Daily. */
const ROWS = [
  {
    "id": "ufc-v2-fast5-other-promotions",
    "lane": "mma-promotions-besides-ufc",
    "prompt": "Name another MMA promotion where fighters who later joined the UFC have competed.",
    "kind": "other",
    "ranked": "PRIDE FC|WEC|Strikeforce|Bellator MMA|PFL|ONE Championship|Cage Warriors|Invicta FC",
    "extras": "RIZIN|KSW|LFA|Pancrase|Shooto|Titan FC|M-1 Global|EliteXC|King of the Cage|World Series of Fighting|BRAVE CF|BAMMA",
    "aliases": {
      "PRIDE FC": [
        "Pride"
      ],
      "Bellator MMA": [
        "Bellator"
      ],
      "PFL": [
        "Professional Fighters League"
      ],
      "ONE Championship": [
        "One FC"
      ],
      "LFA": [
        "Legacy Fighting Alliance"
      ],
      "WEC": [
        "World Extreme Cagefighting"
      ]
    }
  },
  {
    "id": "ufc-v2-fast5-ufc-sponsors",
    "lane": "ufc-historic-brand-partners",
    "prompt": "Name a brand that has sponsored or officially partnered with the UFC.",
    "kind": "other",
    "ranked": "Monster Energy|Venum|Reebok|Modelo|Toyo Tires|Crypto.com|DraftKings|Bud Light",
    "extras": "Harley-Davidson|BodyArmor|Prime Hydration|MetroPCS|Manscaped|EA Sports|Timex|Jose Cuervo",
    "aliases": {
      "Monster Energy": [
        "Monster"
      ],
      "Toyo Tires": [
        "Toyo"
      ],
      "Crypto.com": [
        "Crypto dot com"
      ],
      "DraftKings": [
        "Draft Kings"
      ],
      "EA Sports": [
        "Electronic Arts"
      ]
    }
  },
  {
    "id": "ufc-v2-fast5-ufc-programming",
    "lane": "ufc-owned-original-series",
    "prompt": "Name a UFC-produced video series or show that fans might watch outside a live event.",
    "kind": "other",
    "ranked": "The Ultimate Fighter|Dana White's Contender Series|UFC Embedded|UFC Countdown|UFC Unfiltered|UFC Connected|UFC Fight Motion|Dana White: Lookin' for a Fight",
    "extras": "UFC Primetime|UFC Now|Road to UFC|UFC Free Fight|UFC 25 Years in Short|UFC Fight Pass Originals|UFC Fight Night Preview|UFC Best Of",
    "aliases": {
      "The Ultimate Fighter": [
        "TUF"
      ],
      "Dana White's Contender Series": [
        "DWCS"
      ],
      "UFC Embedded": [
        "Embedded"
      ],
      "UFC Countdown": [
        "Countdown"
      ],
      "Dana White: Lookin' for a Fight": [
        "Looking for a Fight"
      ],
      "UFC Fight Motion": [
        "Fight Motion"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_FAST_BATCH5_SUPPLEMENT = makeUfcFeudDraft(ROWS);
