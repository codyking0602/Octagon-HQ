import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** UFC Sports Feud event fan-experience candidates, future-only. */
const ROWS = [
  {
    "id": "ufc-v2-fast7-belt-design",
    "lane": "fan-experience-belt-design",
    "prompt": "Name a design feature on a UFC championship belt.",
    "kind": "other",
    "ranked": "UFC letters|Gold plates|Leather strap|Octagon shapes|Nameplate|Decorative stones|Engraving|Rivets",
    "extras": "Championship text|Weight-class plate|Belt buckle",
    "aliases": {
      "UFC letters": [
        "UFC lettering",
        "UFC logo"
      ],
      "Leather strap": [
        "Strap"
      ],
      "Decorative stones": [
        "Gems",
        "Gemstones"
      ],
      "Engraving": [
        "Engraved details"
      ],
      "Gold plates": [
        "Metal plate",
        "Gold finish"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-arena-amenities",
    "lane": "fan-experience-arena-amenities",
    "prompt": "Name a service a UFC arena might offer spectators.",
    "kind": "other",
    "ranked": "Restrooms|Food stands|Merchandise shop|First aid|Security desk|Elevators|Guest services|Accessible seating",
    "extras": "ATM|Lost and found|Drinking fountain|Parking|Bar|Escalator|VIP lounge",
    "aliases": {
      "Restrooms": [
        "Bathrooms"
      ],
      "Food stands": [
        "Concessions"
      ],
      "First aid": [
        "Medical assistance"
      ],
      "Accessible seating": [
        "ADA seating"
      ],
      "Guest services": [
        "Information booth",
        "Customer service"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-fan-access-passes",
    "lane": "fan-experience-fan-access-passes",
    "prompt": "Name a type of access credential people might wear at a UFC event.",
    "kind": "other",
    "ranked": "Media pass|Fighter credential|Corner pass|Staff badge|Security badge|VIP pass|Photographer badge|Production credential",
    "extras": "Broadcast badge|Official credential|Backstage pass|Commission badge|Medical pass|Vendor pass|All-access pass",
    "aliases": {
      "Media pass": [
        "Press pass"
      ],
      "Fighter credential": [
        "Athlete credential"
      ],
      "Corner pass": [
        "Coach pass"
      ],
      "Photographer badge": [
        "Photo badge"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-stream-troubleshooting",
    "lane": "fan-experience-stream-troubleshooting",
    "prompt": "Name a technical problem that could interrupt someone's stream of a UFC event.",
    "kind": "other",
    "ranked": "Internet outage|Buffering|App crash|Power outage|Audio delay|Login problem|Frozen screen|Black screen",
    "extras": "Weak Wi-Fi|Payment issue|Subscription expired|Bad video quality|Connection dropped|Service outage|HDMI problem|TV malfunction",
    "aliases": {
      "Internet outage": [
        "Internet down"
      ],
      "App crash": [
        "App error"
      ],
      "Audio delay": [
        "Audio out of sync"
      ],
      "Frozen screen": [
        "Stream frozen"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-event-transport",
    "lane": "fan-experience-event-transport",
    "prompt": "Name a way someone might travel to a UFC event.",
    "kind": "other",
    "ranked": "Car|Ride-share|Taxi|Train|Bus|Walking|Airplane|Motorcycle",
    "extras": "Rental car|Bike|Hotel shuttle|Carpool|Limousine|Scooter",
    "aliases": {
      "Car": [
        "Driving"
      ],
      "Ride-share": [
        "Uber",
        "Lyft"
      ],
      "Walking": [
        "Walk"
      ],
      "Airplane": [
        "Flight"
      ],
      "Bike": [
        "Bicycle"
      ],
      "Train": [
        "Subway",
        "Light rail",
        "Tram"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-premium-ticket",
    "lane": "fan-experience-premium-ticket",
    "prompt": "Name something a UFC premium ticket package might include.",
    "kind": "other",
    "ranked": "Closer seats|VIP lounge|Early entry|Special entrance|Food|Drinks|Exclusive gift|Dedicated staff",
    "extras": "Parking|Photo opportunity|Priority check-in|Reserved table|Private suite|Meet and greet|Merchandise",
    "aliases": {
      "Closer seats": [
        "Better seats",
        "Better view"
      ],
      "Special entrance": [
        "VIP entrance"
      ],
      "Exclusive gift": [
        "Gift bag"
      ],
      "Photo opportunity": [
        "Photo op"
      ],
      "VIP lounge": [
        "Hospitality area"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_SIX_MONTH_FAST_A = makeUfcFeudDraft(ROWS);
