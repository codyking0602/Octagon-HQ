import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** UFC Sports Feud third new topic batch — EDITORIAL DRAFT, intentionally not live. */
const ROWS = [
  {
    "id": "ufc-v2-fast3-fan-acronyms",
    "lane": "ufc-fan-acronyms",
    "prompt": "Name an abbreviation UFC fans use when talking about fights.",
    "kind": "other",
    "ranked": "KO|TKO|MMA|BJJ|PPV|GOAT|P4P|RNC",
    "extras": "UFC|TUF|DQ|NC|UD|SD|MD|SUB|DWCS|GNP|BMF|FOTN|POTN|LHW|HW|WW|MW|FW|BW|FLW",
    "aliases": {
      "KO": [
        "Knockout"
      ],
      "TKO": [
        "Technical knockout"
      ],
      "MMA": [
        "Mixed martial arts"
      ],
      "BJJ": [
        "Brazilian jiu-jitsu"
      ],
      "PPV": [
        "Pay per view"
      ],
      "GOAT": [
        "Greatest of all time"
      ],
      "P4P": [
        "Pound for pound"
      ],
      "RNC": [
        "Rear naked choke"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-cage-parts",
    "lane": "octagon-physical-parts",
    "prompt": "Name a physical part of the UFC Octagon.",
    "kind": "other",
    "ranked": "Fence|Canvas|Cage door|Corner post|Padding|Floor mat|Fence panel|Center logo",
    "extras": "Cage wall|Corner padding|Chain link fence|Mat edge|Cage frame|Fence post|Cage flooring|Fighting surface|Side panel|Cage supports",
    "aliases": {
      "Fence": [
        "Cage fence"
      ],
      "Canvas": [
        "Canvas mat"
      ],
      "Cage door": [
        "Door",
        "Gate"
      ],
      "Corner post": [
        "Cage post"
      ],
      "Padding": [
        "Cage padding"
      ],
      "Floor mat": [
        "Mat",
        "Octagon floor"
      ],
      "Fence panel": [
        "Panel"
      ],
      "Center logo": [
        "UFC logo"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-announcer-intro",
    "lane": "ufc-announcer-introductions",
    "prompt": "Name something the UFC ring announcer might say when introducing a fighter.",
    "kind": "other",
    "ranked": "Fighter name|Nickname|Hometown|Height|Weight|Professional record|Fighting out of|Champion status",
    "extras": "Former champion|Country of origin|Win count|Loss count|Weight division|Reach|City|Gym|Blue corner|Red corner|Fight credentials|Main event",
    "aliases": {
      "Fighter name": [
        "Name"
      ],
      "Professional record": [
        "Record",
        "Wins and losses"
      ],
      "Hometown": [
        "From"
      ],
      "Champion status": [
        "Champion"
      ],
      "Fighting out of": [
        "Fighting from"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-fight-cancel",
    "lane": "ufc-fight-cancellations",
    "prompt": "Name a reason a scheduled UFC fight might be canceled or need a replacement.",
    "kind": "other",
    "ranked": "Injury|Illness|Missed weight|Failed medical exam|Visa issue|Personal emergency|Travel problem|Positive drug test",
    "extras": "Suspension|Contract dispute|Bad weight cut|Surgery|COVID infection|Infection|Athletic commission denial|Opponent withdrew|Passport problem|Legal trouble|Health issue",
    "aliases": {
      "Injury": [
        "Fighter injured"
      ],
      "Illness": [
        "Sick"
      ],
      "Missed weight": [
        "Weight issue"
      ],
      "Positive drug test": [
        "Drug testing issue",
        "Doping"
      ],
      "Visa issue": [
        "Visa denied"
      ],
      "Personal emergency": [
        "Family emergency"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-fight-injury-types",
    "lane": "ufc-injury-types",
    "prompt": "Name an injury a fighter might suffer during a UFC bout.",
    "kind": "other",
    "ranked": "Cut|Broken nose|Concussion|Swollen eye|Broken hand|Dislocated shoulder|Leg injury|Bruised ribs",
    "extras": "Fracture|Facial swelling|Black eye|Bloody nose|Torn ligament|Jaw injury|Eye injury|Sprained ankle|Shoulder injury|Dehydration|Nosebleed|Finger injury|Contusion",
    "aliases": {
      "Cut": [
        "Laceration"
      ],
      "Broken nose": [
        "Fractured nose"
      ],
      "Concussion": [
        "Head injury"
      ],
      "Swollen eye": [
        "Eye swelling"
      ],
      "Broken hand": [
        "Hand fracture"
      ],
      "Bruised ribs": [
        "Rib bruise"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-fight-week-events",
    "lane": "ufc-public-fight-week",
    "prompt": "Name a public event a UFC fan might attend during fight week.",
    "kind": "other",
    "ranked": "Ceremonial weigh-ins|Press conference|Open workouts|Fan meet-and-greet|Autograph signing|UFC fight card|Fan expo|Hall of Fame event",
    "extras": "Fan Q&A|Media day appearance|Fan festival|Community event|Watch party|Fighter appearance|Public workout|Fan experience|Promotional event",
    "aliases": {
      "Ceremonial weigh-ins": [
        "Weigh-in",
        "Weigh ins"
      ],
      "Press conference": [
        "Pressers"
      ],
      "Open workouts": [
        "Open workout"
      ],
      "Fan meet-and-greet": [
        "Meet and greet"
      ],
      "Autograph signing": [
        "Autographs"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-watch-devices",
    "lane": "ufc-watch-devices",
    "prompt": "Name a device someone might use to watch a UFC fight.",
    "kind": "other",
    "ranked": "Television|Smartphone|Laptop|Tablet|Desktop computer|Projector|Game console|Streaming stick",
    "extras": "Apple TV|Amazon Fire TV|Chromecast|Xbox|PlayStation|Home theater projector|Streaming box|Monitor",
    "aliases": {
      "Television": [
        "TV",
        "Smart TV"
      ],
      "Smartphone": [
        "Phone",
        "Cell phone"
      ],
      "Laptop": [
        "Laptop computer"
      ],
      "Tablet": [
        "iPad"
      ],
      "Desktop computer": [
        "Desktop PC",
        "Computer"
      ],
      "Streaming stick": [
        "Roku",
        "Fire stick",
        "Fire TV stick"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-watch-places",
    "lane": "ufc-watch-locations",
    "prompt": "Name a place fans might watch a UFC fight with other people.",
    "kind": "other",
    "ranked": "Sports bar|Friend's house|Living room|UFC arena|Restaurant|Casino|Backyard|Hotel room",
    "extras": "Pub|Watch party|Movie theater|Family home|Apartment|MMA gym|Sports lounge|Patio|Man cave|Outdoor screen|Community center|Party room",
    "aliases": {
      "Sports bar": [
        "Bar"
      ],
      "Friend's house": [
        "Friends house"
      ],
      "Living room": [
        "Home",
        "House"
      ],
      "UFC arena": [
        "Arena",
        "Live UFC event"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-fighter-travel",
    "lane": "ufc-fighter-packing",
    "prompt": "Name something a fighter might pack when traveling to a UFC event.",
    "kind": "other",
    "ranked": "Passport|MMA gloves|Mouthguard|Training clothes|Phone charger|Gym shoes|Hand wraps|Toiletries",
    "extras": "Travel documents|Headphones|Extra shorts|Laptop|Water bottle|Sneakers|Fight gear|Medicine|ID|Clothes|Shampoo|Snacks|Sports tape|Workout gear|Phone",
    "aliases": {
      "Passport": [
        "Travel passport"
      ],
      "MMA gloves": [
        "Gloves"
      ],
      "Training clothes": [
        "Workout clothes"
      ],
      "Phone charger": [
        "Charger"
      ],
      "Gym shoes": [
        "Training shoes"
      ],
      "Toiletries": [
        "Toothbrush",
        "Deodorant"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-fight-camp-people",
    "lane": "ufc-training-camp-support",
    "prompt": "Name someone who might help a UFC fighter during training camp.",
    "kind": "other",
    "ranked": "Head coach|Striking coach|Wrestling coach|Jiu-jitsu coach|Sparring partner|Strength coach|Nutritionist|Physical therapist",
    "extras": "Manager|Sports psychologist|Boxing coach|Muay Thai coach|Training partner|Conditioning coach|Cutman|Doctor|Massage therapist|Athletic trainer|Personal trainer|Dietitian|Rehab therapist",
    "aliases": {
      "Head coach": [
        "Coach"
      ],
      "Striking coach": [
        "Kickboxing coach"
      ],
      "Jiu-jitsu coach": [
        "BJJ coach"
      ],
      "Sparring partner": [
        "Sparring teammate"
      ],
      "Strength coach": [
        "Strength and conditioning coach"
      ],
      "Physical therapist": [
        "Physio"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-after-loss",
    "lane": "ufc-fight-loss-reactions",
    "prompt": "Name something a fighter might do right after losing a UFC bout.",
    "kind": "other",
    "ranked": "Shake hands|Hug opponent|Talk to their corner|Leave the cage|Cry|Receive medical attention|Applaud the winner|Speak to the interviewer",
    "extras": "Thank fans|Sit on stool|Congratulate opponent|Ask for a rematch|Walk away|Look disappointed|Raise winner's hand|Check an injury|Take a deep breath|Listen to coach|Remove gloves|Get checked by doctor",
    "aliases": {
      "Shake hands": [
        "Handshake",
        "Shake opponent's hand"
      ],
      "Hug opponent": [
        "Hug winner"
      ],
      "Cry": [
        "Tear up"
      ],
      "Receive medical attention": [
        "See doctor",
        "Medical check"
      ],
      "Applaud the winner": [
        "Clap for winner"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-walkout-music",
    "lane": "ufc-walkout-music-genres",
    "prompt": "Name a style of music a UFC fighter might use for a walkout.",
    "kind": "other",
    "ranked": "Hip-hop|Rock|Heavy metal|Country|Pop|Reggae|Electronic dance music|Latin music",
    "extras": "Trap|Punk rock|Classical|Instrumental|Techno|House|Folk|Traditional national music|Gospel|Dancehall|Afrobeats|R&B|Alternative rock",
    "aliases": {
      "Hip-hop": [
        "Rap",
        "Hip hop"
      ],
      "Heavy metal": [
        "Metal"
      ],
      "Electronic dance music": [
        "EDM"
      ],
      "Latin music": [
        "Reggaeton"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-post-weighin-meals",
    "lane": "ufc-fighter-weighin-meals",
    "prompt": "Name a food a UFC fighter might eat after making weight.",
    "kind": "other",
    "ranked": "Rice|Chicken|Pasta|Potatoes|Fruit|Salmon|Eggs|Oatmeal",
    "extras": "Steak|Bread|Sandwich|Turkey|Vegetables|Soup|Yogurt|Pancakes|Sweet potatoes|Bagel|Cereal|Peanut butter|Toast",
    "aliases": {
      "Potatoes": [
        "Potato"
      ],
      "Fruit": [
        "Banana",
        "Berries"
      ],
      "Salmon": [
        "Fish"
      ],
      "Oatmeal": [
        "Oats"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-inspection",
    "lane": "ufc-prefight-safety-checks",
    "prompt": "Name something officials might check on a UFC fighter before the bout begins.",
    "kind": "other",
    "ranked": "Gloves|Hand wraps|Mouthguard|Fingernails|Shorts|Body grease|Jewelry|Groin protector",
    "extras": "Hair|Hair ties|Tape|Shoes|Uniform|Skin|Bandages|Ankle tape|Foreign substances|Glove padding|Wrap tape|Fight kit",
    "aliases": {
      "Gloves": [
        "Fight gloves",
        "MMA gloves"
      ],
      "Hand wraps": [
        "Hand wrapping",
        "Handwraps"
      ],
      "Fingernails": [
        "Nails"
      ],
      "Body grease": [
        "Vaseline",
        "Grease"
      ],
      "Groin protector": [
        "Cup"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-fan-predictions",
    "lane": "ufc-fight-predictions",
    "prompt": "Name something UFC fans might predict before a fight starts.",
    "kind": "other",
    "ranked": "Winner|Knockout|Submission|Decision|Winning round|Fight duration|Underdog upset|Performance bonus",
    "extras": "Who gets finished|How many rounds|KO in first round|Fight of the Night|Points decision|Betting odds|Champion retains belt|New champion|Fight goes distance|Early finish|Winner by TKO|Finish time",
    "aliases": {
      "Winner": [
        "Who wins"
      ],
      "Winning round": [
        "Round"
      ],
      "Fight duration": [
        "How long"
      ],
      "Underdog upset": [
        "Upset"
      ],
      "Decision": [
        "Goes to decision"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-crowd-cheers",
    "lane": "ufc-crowd-cheer-moments",
    "prompt": "Name something in a UFC fight that might make the crowd cheer.",
    "kind": "other",
    "ranked": "Knockout|Big punch|Submission attempt|Takedown|Close finish|Fighter comeback|Exciting exchange|Title victory",
    "extras": "Head kick|Slam|Ground-and-pound|Big round|Referee stoppage|Entrance|Fight announcement|Last-second finish|Comeback win|Great escape|Walkout|Winner announced|Reversal",
    "aliases": {
      "Knockout": [
        "KO"
      ],
      "Big punch": [
        "Power punch"
      ],
      "Takedown": [
        "Wrestling takedown"
      ],
      "Fighter comeback": [
        "Comeback"
      ],
      "Title victory": [
        "New champion"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-between-fights-tv",
    "lane": "ufc-broadcast-between-fights",
    "prompt": "Name something a UFC broadcast might show between fights.",
    "kind": "other",
    "ranked": "Fight highlights|Fighter interview|Commentator analysis|Commercial break|Upcoming fight preview|Replay|Fight statistics|Walkout coverage",
    "extras": "Results graphic|Tale of the tape|Judges' scorecards|Sponsors|Promo video|Event trailer|Bonus highlights|Upcoming card|Rankings|Video package|Press conference clip|Behind-the-scenes video|Recap",
    "aliases": {
      "Fight highlights": [
        "Highlights"
      ],
      "Fighter interview": [
        "Interview"
      ],
      "Commentator analysis": [
        "Analysis"
      ],
      "Commercial break": [
        "Ads",
        "Commercial"
      ],
      "Upcoming fight preview": [
        "Preview"
      ],
      "Replay": [
        "Replays"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-ticket-details",
    "lane": "ufc-event-ticket-details",
    "prompt": "Name something displayed on a ticket to a UFC event.",
    "kind": "other",
    "ranked": "Event date|Seat number|Arena name|Section|Row|Ticket barcode|Event name|Start time",
    "extras": "Ticket price|Entry gate|Order number|Venue address|City|Ticket holder name|Ticket type|Seat location|Admit one|Venue logo|Event number|Mobile ticket|Doors open time",
    "aliases": {
      "Event date": [
        "Date"
      ],
      "Seat number": [
        "Seat"
      ],
      "Arena name": [
        "Venue"
      ],
      "Ticket barcode": [
        "Barcode",
        "QR code"
      ],
      "Start time": [
        "Time"
      ],
      "Section": [
        "Sec"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-first-minute",
    "lane": "ufc-first-minute-fight-actions",
    "prompt": "Name something fighters might do during the first minute of a UFC bout.",
    "kind": "other",
    "ranked": "Touch gloves|Circle each other|Throw a jab|Leg kick|Shoot a takedown|Feint|Clinch|Move forward",
    "extras": "Keep guard up|Find range|Step backward|Throw a combination|Block|Check a kick|Change stance|Throw a right hand|Throw a hook|Back away|Test distance|Pressure opponent|Sprawl",
    "aliases": {
      "Touch gloves": [
        "Glove touch"
      ],
      "Circle each other": [
        "Circle"
      ],
      "Throw a jab": [
        "Jab"
      ],
      "Shoot a takedown": [
        "Takedown attempt"
      ],
      "Feint": [
        "Fake a punch"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-canadian-fighters",
    "lane": "ufc-canadian-fighter-names",
    "prompt": "Name a well-known Canadian UFC fighter.",
    "kind": "other",
    "ranked": "Georges St-Pierre|Rory MacDonald|Patrick Cote|Carlos Newton|Mark Hominick|Sam Stout|TJ Grant|Mike Malott",
    "extras": "Sarah Kaufman|Olivier Aubin-Mercier|Charles Jourdain|Gillian Robertson|Jasmine Jasudavicius|David Loiseau|Elias Theodorou|Randa Markos|Valerie Letourneau|Alexis Davis|Hakeem Dawodu",
    "aliases": {
      "Georges St-Pierre": [
        "GSP"
      ],
      "Rory MacDonald": [
        "The Red King"
      ],
      "Patrick Cote": [
        "Patrick Côté"
      ],
      "Valerie Letourneau": [
        "Valérie Létourneau"
      ],
      "Olivier Aubin-Mercier": [
        "OAM"
      ]
    }
  },
  {
    "id": "ufc-v2-fast3-australia-nz-fighters",
    "lane": "ufc-australia-new-zealand-fighter-names",
    "prompt": "Name a well-known UFC fighter from Australia or New Zealand.",
    "kind": "other",
    "ranked": "Alexander Volkanovski|Robert Whittaker|Israel Adesanya|Tai Tuivasa|Dan Hooker|Mark Hunt|Kai Kara-France|Jack Della Maddalena",
    "extras": "Jake Matthews|Jimmy Crute|Brad Riddell|Tyson Pedro|Jamie Mullarkey|Shane Young|Jessica-Rose Clark|Megan Anderson|Alex Chambers|Ben Nguyen",
    "aliases": {
      "Alexander Volkanovski": [
        "Volk"
      ],
      "Robert Whittaker": [
        "Bobby Knuckles"
      ],
      "Israel Adesanya": [
        "Izzy"
      ],
      "Tai Tuivasa": [
        "Bam Bam"
      ],
      "Jack Della Maddalena": [
        "JDM"
      ],
      "Kai Kara-France": [
        "KKF"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_FAST_BATCH3 = makeUfcFeudDraft(ROWS);
