import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Fourth editorial batch: distinct UFC Feud questions. NOT USED IN LIVE DAILY. */
const ROWS = [
  {
    "id": "ufc-v2-fast4-arena-snacks",
    "lane": "ufc-arena-concessions",
    "prompt": "Name a food you might buy at a UFC arena concession stand.",
    "kind": "other",
    "ranked": "Hot dog|Pizza|Nachos|Popcorn|Chicken tenders|Pretzel|Hamburger|French fries",
    "extras": "Wings|Candy|Chips|Tacos|Sandwich|Nuts|Peanuts|Ice cream|Cookie|Sausage|Salad|Chicken sandwich|Sushi|Wrap",
    "aliases": {
      "Hot dog": [
        "Hotdog"
      ],
      "Hamburger": [
        "Burger"
      ],
      "French fries": [
        "Fries"
      ],
      "Chicken tenders": [
        "Chicken strips"
      ],
      "Pretzel": [
        "Soft pretzel"
      ]
    }
  },
  {
    "id": "ufc-v2-fast4-arena-entry",
    "lane": "ufc-arena-entry-process",
    "prompt": "Name something a fan might do when entering the arena for a UFC event.",
    "kind": "other",
    "ranked": "Scan ticket|Wait in line|Pass security|Show ID|Check bag|Find entrance gate|Go through metal detector|Find seat",
    "extras": "Use mobile ticket|Have ticket checked|Empty pockets|Get wristband|Ask usher|Enter through turnstile|Follow signs|Show QR code|Visit ticket desk|Check arena rules|Take off jacket|Show pass",
    "aliases": {
      "Scan ticket": [
        "Scan QR code",
        "Scan mobile ticket",
        "Have ticket scanned",
        "Show ticket"
      ],
      "Pass security": [
        "Security screening",
        "Security check"
      ],
      "Check bag": [
        "Bag search",
        "Bag inspection"
      ],
      "Find entrance gate": [
        "Find gate"
      ],
      "Find seat": [
        "Go to seat"
      ]
    }
  },
  {
    "id": "ufc-v2-fast4-fan-carry",
    "lane": "ufc-fan-arena-belongings",
    "prompt": "Name an item a fan might bring to watch a UFC event in person.",
    "kind": "other",
    "ranked": "Phone|Ticket|Wallet|ID|Jacket|Hat|Country flag|Handmade sign",
    "extras": "Camera|Backpack|Purse|Keys|Sunglasses|Portable charger|Cash|Credit card|Fighter poster|Water bottle|Earplugs|Merchandise|Replica belt|Binoculars|Team shirt",
    "aliases": {
      "Phone": [
        "Cell phone"
      ],
      "Ticket": [
        "Entry ticket",
        "Mobile ticket"
      ],
      "ID": [
        "Identification"
      ],
      "Handmade sign": [
        "Poster",
        "Sign"
      ],
      "Country flag": [
        "Flag"
      ],
      "Portable charger": [
        "Power bank"
      ]
    }
  },
  {
    "id": "ufc-v2-fast4-crowd-boos",
    "lane": "ufc-why-crowd-boos",
    "prompt": "Name something that might make UFC fans boo during an event.",
    "kind": "other",
    "ranked": "Slow fight|Controversial decision|Unpopular fighter|Bad referee stoppage|Too much clinching|Eye poke|Trash talk|Long delay",
    "extras": "Fence grab|Foul|Running away|No action|Bad call|No contest|Opponent disrespect|Interrupted fight|Canceled bout",
    "aliases": {
      "Slow fight": [
        "Boring fight",
        "Stalling"
      ],
      "Controversial decision": [
        "Bad judging"
      ],
      "Bad referee stoppage": [
        "Unfair stoppage"
      ],
      "Trash talk": [
        "Disrespect"
      ]
    }
  },
  {
    "id": "ufc-v2-fast4-referee-foul",
    "lane": "ufc-referee-foul-response",
    "prompt": "Name something a UFC referee might do after a fighter commits a foul.",
    "kind": "other",
    "ranked": "Stop the action|Issue warning|Deduct a point|Give recovery time|Call a doctor|Separate fighters|Restart the fight|Disqualify fighter",
    "extras": "Wave fight off|Send opponent to neutral corner|Speak to judges|Consult official|Check injured fighter|Announce point deduction|Pause the clock|Review the foul|Reset the position|Ask fighter if able to continue|Disqualification",
    "aliases": {
      "Stop the action": [
        "Stop fight",
        "Pause fight"
      ],
      "Issue warning": [
        "Warn fighter",
        "Warning"
      ],
      "Deduct a point": [
        "Point deduction",
        "Take a point"
      ],
      "Call a doctor": [
        "Doctor check",
        "Medical evaluation"
      ],
      "Give recovery time": [
        "Recovery time"
      ],
      "Disqualify fighter": [
        "DQ"
      ]
    }
  },
  {
    "id": "ufc-v2-fast4-mma-news",
    "lane": "ufc-mma-news-outlets",
    "prompt": "Name a media outlet where a UFC fan might read or hear MMA news.",
    "kind": "other",
    "ranked": "ESPN|UFC.com|MMA Fighting|MMA Junkie|Sherdog|CBS Sports|Bleacher Report|Sports Illustrated",
    "extras": "Yahoo Sports|The Athletic|Bloody Elbow|MMAMania|Fightful|BBC Sport|TSN|Fox Sports|USA Today|YouTube news channel|Local news|Sports radio|MMA podcast",
    "aliases": {
      "UFC.com": [
        "UFC website"
      ],
      "ESPN": [
        "ESPN MMA"
      ],
      "MMA Junkie": [
        "MMAJunkie"
      ],
      "CBS Sports": [
        "CBS"
      ]
    }
  },
  {
    "id": "ufc-v2-fast4-fighter-posts",
    "lane": "ufc-fighter-social-content",
    "prompt": "Name a type of content UFC fighters commonly share on social media.",
    "kind": "other",
    "ranked": "Training video|Fight announcement|Highlight clip|Family photo|Sponsor ad|Selfie|Weigh-in photo|Behind-the-scenes video",
    "extras": "Workout photos|Interview|Fan thank-you|Gym footage|Travel photos|Callout|Fight poster|Recovery update|Podcast clip|Meal photo|Victory celebration|Coach appreciation|Charity work|Injury update|Live stream",
    "aliases": {
      "Training video": [
        "Training footage"
      ],
      "Fight announcement": [
        "Fight news"
      ],
      "Sponsor ad": [
        "Advertisement"
      ],
      "Behind-the-scenes video": [
        "Backstage footage"
      ],
      "Highlight clip": [
        "Highlights"
      ]
    }
  },
  {
    "id": "ufc-v2-fast4-delay-causes",
    "lane": "ufc-event-delay-causes",
    "prompt": "Name something that could delay a live UFC event.",
    "kind": "other",
    "ranked": "Injury check|Long fight|Medical timeout|Equipment problem|Broadcast issue|Late walkout|Replay review|Arena technical issue",
    "extras": "Doctor stoppage|Extra time between fights|Fighter unavailable|Power failure|Microphone issue|Audio problem|Camera issue|Security issue|Unscheduled interruption|Fight card change|Transportation delay|Cage problem|Lighting malfunction",
    "aliases": {
      "Injury check": [
        "Doctor check"
      ],
      "Broadcast issue": [
        "TV issue"
      ],
      "Arena technical issue": [
        "Technical difficulty"
      ],
      "Medical timeout": [
        "Medical delay"
      ],
      "Equipment problem": [
        "Equipment malfunction"
      ]
    }
  },
  {
    "id": "ufc-v2-fast4-ticket-shopping",
    "lane": "ufc-ticket-buying-considerations",
    "prompt": "Name something a UFC fan might check before buying tickets.",
    "kind": "other",
    "ranked": "Ticket price|Seat location|Main event|Date|Venue|Fight card|Parking|Start time",
    "extras": "Resale price|Travel costs|Row|Who is fighting|Ticket fees|View from seat|Ticket availability|Ticket seller|Refund policy|Hotels|Distance from home|Accessibility|Age restrictions|Door time",
    "aliases": {
      "Ticket price": [
        "Cost",
        "Price"
      ],
      "Seat location": [
        "Seat",
        "Section"
      ],
      "Main event": [
        "Headliner"
      ],
      "Date": [
        "Event date"
      ],
      "Venue": [
        "Arena",
        "Location"
      ]
    }
  },
  {
    "id": "ufc-v2-fast4-camera-shots",
    "lane": "ufc-broadcast-camera-angles",
    "prompt": "Name a type of camera shot fans often see during a televised UFC fight.",
    "kind": "other",
    "ranked": "Close-up|Wide shot|Overhead shot|Slow-motion replay|Corner shot|Crowd shot|Walkout camera|Cage-side angle",
    "extras": "Ground-level angle|Handheld shot|Follow camera|Fighter face close-up|Replay angle|Camera zoom|Audience reaction|Referee shot|Ring announcer shot|Cage-door shot|Low angle|Broadcast cutaway",
    "aliases": {
      "Close-up": [
        "Close up"
      ],
      "Wide shot": [
        "Wide angle"
      ],
      "Overhead shot": [
        "Aerial view",
        "Overhead camera"
      ],
      "Slow-motion replay": [
        "Slow motion",
        "Slo-mo"
      ],
      "Crowd shot": [
        "Audience shot"
      ]
    }
  },
  {
    "id": "ufc-v2-fast4-fighter-thanks",
    "lane": "ufc-fighter-postfight-thanks",
    "prompt": "Name someone a UFC fighter might thank during a post-fight interview.",
    "kind": "other",
    "ranked": "Coaches|Family|Fans|Training partners|God|Teammates|Sponsors|Opponent",
    "extras": "UFC staff|Gym|Cornermen|Spouse|Children|Country|Manager|Promoter|Medical staff|Training camp|Friends",
    "aliases": {
      "Coaches": [
        "Coach"
      ],
      "Training partners": [
        "Sparring partners"
      ],
      "Teammates": [
        "Team"
      ],
      "Fans": [
        "Supporters"
      ],
      "Family": [
        "Mom",
        "Dad",
        "Parents"
      ]
    }
  },
  {
    "id": "ufc-v2-fast4-weight-class-switch",
    "lane": "ufc-change-weight-class-reasons",
    "prompt": "Name a reason a UFC fighter might move to another weight class.",
    "kind": "other",
    "ranked": "Difficult weight cut|Title opportunity|Size advantage|New challenge|Health concerns|Performance problems|Age|Advice from coaches",
    "extras": "Missed weight|Better matchups|More energy|New opponent|Weight gain|Weight loss|Wants second belt|Fight availability|Injury recovery|Training change|Long-term safety|Too small for division|Too big for division",
    "aliases": {
      "Difficult weight cut": [
        "Hard cut",
        "Weight cut"
      ],
      "Title opportunity": [
        "Second belt"
      ],
      "Health concerns": [
        "Health"
      ],
      "Advice from coaches": [
        "Coach recommendation"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_FAST_BATCH4 = makeUfcFeudDraft(ROWS);
