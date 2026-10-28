import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** New distinct quick-recognition fighter/fan concepts. Editorial hold until each is QA certified. */
const ROWS = [
  {
    "id": "ufc-v2-fast12-camp-expenses",
    "lane": "ufc-fight-camp-cost-categories",
    "prompt": "Name something a UFC fighter might have to pay for during a training camp.",
    "kind": "other",
    "ranked": "Gym membership|Head coach|Sparring partners|Travel|Accommodation|Nutrition support|Physical therapy|Training equipment",
    "extras": "Strength coach|Wrestling coach|Medical tests|Sports psychologist|Meal preparation|Recovery treatment|Transportation|Personal trainer",
    "aliases": {
      "Gym membership": [
        "Gym fee"
      ],
      "Head coach": [
        "Coaching",
        "Coach fee"
      ],
      "Sparring partners": [
        "Paid sparring"
      ],
      "Accommodation": [
        "Hotel",
        "Lodging"
      ],
      "Nutrition support": [
        "Nutritionist",
        "Dietitian"
      ],
      "Physical therapy": [
        "Physiotherapy",
        "PT"
      ],
      "Training equipment": [
        "Gear"
      ],
      "Travel": [
        "Flights"
      ]
    }
  },
  {
    "id": "ufc-v2-fast12-camp-sacrifices",
    "lane": "ufc-training-camp-personal-sacrifices",
    "prompt": "Name something UFC fighters might give up while preparing for a major bout.",
    "kind": "other",
    "ranked": "Time with family|Favorite foods|Social events|Vacations|Leisure time|Sleeping late|Alcohol|Hobbies",
    "extras": "Parties|Weekends off|Late nights|Desserts|Relaxation|Money|Comfort|Dating time",
    "aliases": {
      "Time with family": [
        "Family time"
      ],
      "Favorite foods": [
        "Junk food",
        "Comfort food"
      ],
      "Social events": [
        "Partying",
        "Going out"
      ],
      "Leisure time": [
        "Free time"
      ],
      "Sleeping late": [
        "Sleeping in"
      ],
      "Alcohol": [
        "Drinking"
      ],
      "Vacations": [
        "Holiday"
      ]
    }
  },
  {
    "id": "ufc-v2-fast12-arrive-early",
    "lane": "ufc-fan-early-arrival-reasons",
    "prompt": "Name a reason a fan might arrive at a UFC event well before the main card starts.",
    "kind": "other",
    "ranked": "Watch preliminary fights|Avoid long lines|Find seats|Buy merchandise|Get food|Find parking|See warmups|Take arena photos",
    "extras": "Explore venue|Meet friends|Beat traffic|Visit sponsor booths|See more fighters|Pick up tickets|Find the restroom",
    "aliases": {
      "Watch preliminary fights": [
        "Prelims",
        "Early prelims"
      ],
      "Avoid long lines": [
        "Beat lines"
      ],
      "Find seats": [
        "Locate seats"
      ],
      "Buy merchandise": [
        "Buy merch"
      ],
      "Get food": [
        "Eat"
      ],
      "Take arena photos": [
        "Take pictures"
      ],
      "Find parking": [
        "Park"
      ]
    }
  },
  {
    "id": "ufc-v2-fast12-ppv-purchase",
    "lane": "ufc-pay-per-view-purchase-checklist",
    "prompt": "Name something a UFC fan might consider before deciding whether to buy a pay-per-view.",
    "kind": "other",
    "ranked": "Main event matchup|Price|Overall fight card|Start time|Favorite fighter competing|Title fight stakes|Available streaming service|Replay availability",
    "extras": "Expected fight quality|Number of fights|Co-main event|Whether friends are watching|Device support|Card changes|Whether prelims are free",
    "aliases": {
      "Main event matchup": [
        "Headliner",
        "Main event"
      ],
      "Price": [
        "Cost"
      ],
      "Overall fight card": [
        "Full card",
        "Card strength"
      ],
      "Start time": [
        "Schedule"
      ],
      "Favorite fighter competing": [
        "Favorite fighter"
      ],
      "Title fight stakes": [
        "Championship",
        "Title fight"
      ],
      "Available streaming service": [
        "Where to watch"
      ],
      "Replay availability": [
        "Watch later"
      ]
    }
  },
  {
    "id": "ufc-v2-fast12-fail-weight-cut",
    "lane": "ufc-weight-cut-failure-causes",
    "prompt": "Name a reason a UFC fighter might fail to make the contracted weight.",
    "kind": "other",
    "ranked": "Short-notice booking|Illness|Poor cut plan|Injury|Water retention|Safety concerns from dehydration|Travel disruption|Nutrition mistakes",
    "extras": "Wrong starting weight|Could not sweat enough|Bad timing|Slow recovery|Stopped cutting on medical advice|Inaccurate scale",
    "aliases": {
      "Short-notice booking": [
        "Short notice"
      ],
      "Poor cut plan": [
        "Poor planning"
      ],
      "Travel disruption": [
        "Travel problem"
      ],
      "Nutrition mistakes": [
        "Bad diet"
      ],
      "Illness": [
        "Sick"
      ],
      "Injury": [
        "Hurt"
      ],
      "Safety concerns from dehydration": [
        "Dehydration"
      ]
    }
  },
  {
    "id": "ufc-v2-fast12-walkout-crew",
    "lane": "ufc-fighter-walkout-production-coordination",
    "prompt": "Name something a UFC production crew has to coordinate for a fighter's walkout.",
    "kind": "other",
    "ranked": "Music cue|Lighting|Entrance timing|Cage door|Camera positions|Security|Ring announcement|Corner team",
    "extras": "Walkout path|Video package|Broadcast graphics|Stage crew|Music volume|Fighter entrance signal|Audio equipment",
    "aliases": {
      "Music cue": [
        "Walkout music",
        "Cue song"
      ],
      "Lighting": [
        "Lights"
      ],
      "Entrance timing": [
        "Timing"
      ],
      "Camera positions": [
        "Cameras"
      ],
      "Ring announcement": [
        "Bruce Buffer",
        "Announcer cue"
      ],
      "Corner team": [
        "Coaches"
      ],
      "Cage door": [
        "Open cage"
      ]
    }
  },
  {
    "id": "ufc-v2-fast12-ref-stoppage",
    "lane": "ufc-referee-safety-stoppage-triggers",
    "prompt": "Name something a UFC referee might see that makes them stop a fight to protect a competitor.",
    "kind": "other",
    "ranked": "Fighter is unconscious|Not intelligently defending|Tap to submission|Serious injury|Doctor says stop|Unable to continue|Corner calls for stoppage|Severe cut",
    "extras": "Not responding to referee|Repeated unanswered punches|Loss of consciousness|Inability to stand|Major eye injury|Broken bone|Incapacitating damage",
    "aliases": {
      "Fighter is unconscious": [
        "Knocked out",
        "KO",
        "Out cold"
      ],
      "Not intelligently defending": [
        "Not defending",
        "No intelligent defense"
      ],
      "Tap to submission": [
        "Tap out",
        "Tapping"
      ],
      "Serious injury": [
        "Injury"
      ],
      "Doctor says stop": [
        "Doctor stoppage"
      ],
      "Severe cut": [
        "Bad cut"
      ],
      "Corner calls for stoppage": [
        "Corner stops it"
      ]
    }
  },
  {
    "id": "ufc-v2-fast12-odds-terms",
    "lane": "ufc-fan-odds-board-vocabulary",
    "prompt": "Name a term you might see on an odds board for a UFC fight.",
    "kind": "other",
    "ranked": "Favorite|Underdog|Moneyline|Over/under rounds|Knockout prop|Submission prop|Decision prop|Parlay",
    "extras": "Total rounds|Method of victory|Live odds|Round betting|Point spread|Plus odds|Minus odds|Fight goes the distance",
    "aliases": {
      "Favorite": [
        "Favored"
      ],
      "Underdog": [
        "Dog"
      ],
      "Moneyline": [
        "Money line"
      ],
      "Over/under rounds": [
        "Over under",
        "Totals"
      ],
      "Knockout prop": [
        "KO prop"
      ],
      "Submission prop": [
        "Sub prop"
      ],
      "Decision prop": [
        "Decision odds"
      ],
      "Parlay": [
        "Parlay bet"
      ]
    }
  },
  {
    "id": "ufc-v2-fast12-arena-phone-use",
    "lane": "ufc-live-arena-phone-activities",
    "prompt": "Name something a fan might use their phone for while attending a UFC event.",
    "kind": "other",
    "ranked": "Show mobile ticket|Take photos|Call friends|Check fight card|Book rideshare|Look up fighter stats|Send messages|Read event updates",
    "extras": "Find seat location|Order concessions|Share on social media|Use venue map|Check time|Scan ticket barcode|Record reactions|Contact family",
    "aliases": {
      "Show mobile ticket": [
        "Mobile ticket",
        "Ticket app"
      ],
      "Take photos": [
        "Take pictures"
      ],
      "Call friends": [
        "Call someone"
      ],
      "Check fight card": [
        "Check lineup"
      ],
      "Book rideshare": [
        "Uber",
        "Lyft"
      ],
      "Send messages": [
        "Text friends",
        "Texting"
      ],
      "Look up fighter stats": [
        "Stats"
      ],
      "Read event updates": [
        "Updates"
      ]
    }
  },
  {
    "id": "ufc-v2-fast12-fan-travel-planning",
    "lane": "ufc-fan-out-of-town-event-planning",
    "prompt": "Name something an out-of-town UFC fan might need to plan before traveling to a live event.",
    "kind": "other",
    "ranked": "Fight tickets|Hotel|Flights|Event schedule|Transportation|Arena address|Budget|Travel companions",
    "extras": "Parking|Dining reservations|Time off work|Seat choice|Tourism plans|Public transit|Airport transfers|Weather forecast",
    "aliases": {
      "Fight tickets": [
        "Tickets"
      ],
      "Hotel": [
        "Accommodation",
        "Lodging"
      ],
      "Flights": [
        "Airfare"
      ],
      "Event schedule": [
        "Date and time"
      ],
      "Transportation": [
        "Getting around"
      ],
      "Arena address": [
        "Venue location"
      ],
      "Budget": [
        "Costs"
      ],
      "Travel companions": [
        "Who is going"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_FAST_BATCH12 = makeUfcFeudDraft(ROWS);
