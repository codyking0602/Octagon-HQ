import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Editorial candidate expansion only: not included in any live question selector. */
const ROWS = [
  {
    "id": "ufc-v2-fast7-mma-gyms",
    "lane": "mma-ufc-mma-gyms",
    "prompt": "Name a well-known MMA gym that has trained UFC fighters.",
    "kind": "other",
    "ranked": "American Top Team|American Kickboxing Academy|Jackson Wink|City Kickboxing|Xtreme Couture|Team Alpha Male|Tristar Gym|Kings MMA",
    "extras": "Kill Cliff FC|Chute Boxe|Nova Uniao|SBG Ireland|Roufusport|Tiger Muay Thai|Fortis MMA|Renzo Gracie Academy|Alliance MMA|MMA Lab|Factory X|Syndicate MMA",
    "aliases": {
      "American Top Team": [
        "ATT"
      ],
      "American Kickboxing Academy": [
        "AKA"
      ],
      "Jackson Wink": [
        "Jackson Wink MMA"
      ],
      "City Kickboxing": [
        "CKB"
      ],
      "Team Alpha Male": [
        "TAM"
      ],
      "Tristar Gym": [
        "Tristar"
      ],
      "Nova Uniao": [
        "Nova União"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-fight-night-schedule",
    "lane": "mma-ufc-fight-night-schedule",
    "prompt": "Name something a UFC fan might check when planning what time to arrive at an event.",
    "kind": "other",
    "ranked": "Doors open|Prelims start|Main card start|Main event time|Travel time|Parking hours|Traffic|Security wait",
    "extras": "Local time zone|Public transit timetable|First fight|Hotel check-in|Ticket time|Fight card change|Food plans|Scheduled end time",
    "aliases": {
      "Doors open": [
        "Doors opening time"
      ],
      "Prelims start": [
        "Prelims time"
      ],
      "Main card start": [
        "Main card time"
      ],
      "Travel time": [
        "Driving time"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-results-page",
    "lane": "mma-ufc-results-page",
    "prompt": "Name something you'd see on a UFC event's official results page.",
    "kind": "other",
    "ranked": "Fight winners|Fight losers|Victory method|Round|Finish time|Judge scores|Fighter statistics|Event date",
    "extras": "Venue|Location|Weight division|Main event|Fight card|Performance bonuses|Referee|Decision type|Full results|Event number",
    "aliases": {
      "Fight winners": [
        "Winners"
      ],
      "Fight losers": [
        "Losers"
      ],
      "Victory method": [
        "Method of victory"
      ],
      "Finish time": [
        "Time of finish"
      ],
      "Judge scores": [
        "Scorecards"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-belt-colors",
    "lane": "mma-ufc-belt-colors",
    "prompt": "Name a colored belt rank used in martial arts practiced by some UFC fighters.",
    "kind": "other",
    "ranked": "White|Blue|Purple|Brown|Black|Yellow|Orange|Green",
    "extras": "Red|Coral|Gray|Red and white|Striped|Red and black",
    "aliases": {
      "White": [
        "White belt"
      ],
      "Black": [
        "Black belt"
      ],
      "Gray": [
        "Grey"
      ],
      "Coral": [
        "Coral belt"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-international-paperwork",
    "lane": "mma-ufc-international-paperwork",
    "prompt": "Name a document a fighter might need to travel internationally for a UFC bout.",
    "kind": "other",
    "ranked": "Passport|Visa|Flight ticket|Travel itinerary|Fighter license|Medical clearance|Photo ID|Hotel confirmation",
    "extras": "Work permit|Travel insurance|Fight contract|Commission paperwork|Event credential|Emergency contacts|Customs documents|Immigration documents",
    "aliases": {
      "Passport": [
        "Valid passport"
      ],
      "Visa": [
        "Work visa"
      ],
      "Flight ticket": [
        "Airline ticket"
      ],
      "Travel itinerary": [
        "Itinerary"
      ],
      "Photo ID": [
        "Identification"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-fighter-replay",
    "lane": "mma-ufc-fighter-replay",
    "prompt": "Name a kind of moment from a UFC fight that might be replayed on TV.",
    "kind": "other",
    "ranked": "Knockout|Submission|Big punch|Takedown|Head kick|Close exchange|Referee stoppage|Near finish",
    "extras": "Knockdown|Reversal|Ground and pound|Spinning kick|Counter strike|Replay of foul|Decision reaction|Celebration|Walkout|Final bell",
    "aliases": {
      "Knockout": [
        "KO"
      ],
      "Submission": [
        "Tapout"
      ],
      "Big punch": [
        "Heavy punch"
      ],
      "Referee stoppage": [
        "Stoppage"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_SIX_MONTH_FAST_B = makeUfcFeudDraft(ROWS);
