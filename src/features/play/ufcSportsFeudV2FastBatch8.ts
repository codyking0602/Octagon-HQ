import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Fresh, separate UFC experience and practical fight-strategy editorial topics. Editorial staging only. */
const ROWS = [
  {
    "id": "ufc-v2-fast8-stream-troubles",
    "lane": "ufc-ppv-streaming-frustrations",
    "prompt": "Name a technical problem that could spoil watching a UFC pay-per-view at home.",
    "kind": "other",
    "ranked": "Buffering|Picture freezes|Stream crashes|Audio out of sync|Low video quality|Unable to log in|Internet disconnects|Black screen",
    "extras": "Repeated loading|App error|Delayed feed|No sound|Wrong language audio|Video skips|Payment error|Cast fails|Video pixelates",
    "aliases": {
      "Buffering": [
        "Lagging",
        "Lag",
        "Keeps buffering"
      ],
      "Picture freezes": [
        "Frozen video",
        "Frozen screen"
      ],
      "Stream crashes": [
        "App crashes",
        "Stream drops"
      ],
      "Audio out of sync": [
        "Sound delay",
        "Audio delay"
      ],
      "Low video quality": [
        "Blurry video",
        "Bad resolution"
      ],
      "Unable to log in": [
        "Login problems"
      ],
      "Internet disconnects": [
        "Wifi drops",
        "Wi-Fi drops"
      ],
      "Black screen": [
        "Blank screen"
      ],
      "No sound": [
        "No audio"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-game-avatar",
    "lane": "ea-ufc-career-customization",
    "prompt": "Name something you can customize about a created fighter in an EA SPORTS UFC game.",
    "kind": "other",
    "ranked": "Appearance|Weight class|Fighting style|Hair|Clothing|Tattoos|Name|Move set",
    "extras": "Facial features|Nickname|Gloves|Shorts|Skin tone|Walkout|Height|Stance|Body type|Attributes",
    "aliases": {
      "Appearance": [
        "Looks",
        "Face"
      ],
      "Weight class": [
        "Division"
      ],
      "Fighting style": [
        "Style"
      ],
      "Hair": [
        "Haircut",
        "Hairstyle"
      ],
      "Clothing": [
        "Gear",
        "Outfit"
      ],
      "Move set": [
        "Moves",
        "Move list"
      ],
      "Name": [
        "Fighter name"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-fan-arena-facilities",
    "lane": "ufc-live-arena-facilities",
    "prompt": "Name a facility a fan might use during a UFC event at a large arena.",
    "kind": "other",
    "ranked": "Restroom|Concession stand|Merchandise stand|Parking garage|Elevator|Entrance|First-aid station|Guest services",
    "extras": "Escalator|Accessible seating|Box office|Water fountain|Charging station|ATM|Rideshare zone|Food court|Exit|Information desk",
    "aliases": {
      "Restroom": [
        "Bathroom",
        "Toilet"
      ],
      "Concession stand": [
        "Food stand"
      ],
      "Merchandise stand": [
        "Merch booth",
        "Merch stand"
      ],
      "Entrance": [
        "Gate"
      ],
      "First-aid station": [
        "Medical station"
      ],
      "Guest services": [
        "Information",
        "Help desk"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-sports-bar-etiquette",
    "lane": "ufc-live-watch-social-etiquette",
    "prompt": "Name a considerate thing to do while watching UFC fights with other fans at a sports bar.",
    "kind": "other",
    "ranked": "Don't block the screen|Don't spoil results|Respect other fans|Keep your voice reasonable|Share seating|Tip staff|Don't start fights|Let others watch",
    "extras": "Wait your turn at the bar|Ask before changing channels|Clean up your table|Avoid spilling drinks|Give people space|Don't grab the remote|Pay your tab|Cheer respectfully",
    "aliases": {
      "Don't block the screen": [
        "Keep screen clear",
        "Move out of the way"
      ],
      "Don't spoil results": [
        "No spoilers"
      ],
      "Respect other fans": [
        "Be respectful"
      ],
      "Don't start fights": [
        "Don't fight"
      ],
      "Tip staff": [
        "Tip bartender",
        "Tip server"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-tattoo-placement",
    "lane": "mma-fighter-tattoo-locations",
    "prompt": "Name a part of the body on which a UFC fighter might have a tattoo.",
    "kind": "other",
    "ranked": "Arm|Chest|Back|Shoulder|Leg|Neck|Hand|Stomach",
    "extras": "Forearm|Biceps|Thigh|Ribs|Calf|Wrist|Head|Finger|Foot",
    "aliases": {
      "Arm": [
        "Arms"
      ],
      "Chest": [
        "Pec"
      ],
      "Back": [
        "Upper back"
      ],
      "Stomach": [
        "Abdomen",
        "Belly"
      ],
      "Leg": [
        "Legs"
      ],
      "Hand": [
        "Hands"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-hurt-survival",
    "lane": "ufc-rocked-fighter-recovery-tactics",
    "prompt": "Name a tactic a UFC fighter might use to survive after getting badly rocked.",
    "kind": "other",
    "ranked": "Clinch|Cover up|Back away|Circle out|Shoot for takedown|Hold opponent|Stay moving|Guard head",
    "extras": "Grab cage position|Change level|Slow the pace|Stay behind jab|Protect chin|Move off the fence|Wait for opening|Breathe and reset",
    "aliases": {
      "Clinch": [
        "Tie up"
      ],
      "Cover up": [
        "Shell up",
        "Block shots"
      ],
      "Back away": [
        "Retreat",
        "Create distance"
      ],
      "Circle out": [
        "Move laterally",
        "Circle away"
      ],
      "Shoot for takedown": [
        "Wrestle",
        "Go for takedown"
      ],
      "Hold opponent": [
        "Tie up opponent"
      ],
      "Guard head": [
        "Keep hands up"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-fan-favorites",
    "lane": "ufc-why-fan-picks-favorite-fighter",
    "prompt": "Name a reason someone might become a fan of a particular UFC fighter.",
    "kind": "other",
    "ranked": "Exciting fighting style|Personality|From hometown|Championship success|Great knockouts|Underdog story|Humility|Trash talk",
    "extras": "Charisma|Similar background|Funny interviews|Sportsmanship|Big comebacks|Great submissions|National pride|Training story|Relatable life",
    "aliases": {
      "Exciting fighting style": [
        "Fun to watch"
      ],
      "From hometown": [
        "Local fighter"
      ],
      "Championship success": [
        "Winning titles"
      ],
      "Great knockouts": [
        "Knockout power"
      ],
      "Underdog story": [
        "Comeback story"
      ],
      "Trash talk": [
        "Talking trash"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-working-gameplan",
    "lane": "ufc-fight-strategy-success-signs",
    "prompt": "Name a sign that a UFC fighter's game plan is working during a bout.",
    "kind": "other",
    "ranked": "Lands clean strikes|Gets takedowns|Controls distance|Avoids counters|Wins exchanges|Keeps opponent on fence|Controls top position|Sets the pace",
    "extras": "Defends takedowns|Gets into preferred range|Counters consistently|Opponent tires first|Creates openings|Stops opponent's attack|Scores knockdowns|Corner approves",
    "aliases": {
      "Lands clean strikes": [
        "Landing punches",
        "Lands punches"
      ],
      "Gets takedowns": [
        "Successful takedowns"
      ],
      "Controls distance": [
        "Controls range"
      ],
      "Wins exchanges": [
        "Winning exchanges"
      ],
      "Controls top position": [
        "Maintains top control"
      ],
      "Sets the pace": [
        "Controls tempo"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-fan-complaints",
    "lane": "ufc-fan-post-event-complaints",
    "prompt": "Name something UFC viewers might complain about after a disappointing event.",
    "kind": "other",
    "ranked": "Bad judging|High pay-per-view price|Early stoppage|Poor matchups|Too many ads|Late start time|Canceled fights|Broadcast problems",
    "extras": "Boring fights|Slow pacing|Too much waiting|Long walkouts|No finishes|Uneven card|Unfair decision|Bad camera angle|Ticket price",
    "aliases": {
      "Bad judging": [
        "Robbery",
        "Scorecards",
        "Bad decision"
      ],
      "High pay-per-view price": [
        "PPV cost",
        "Too expensive"
      ],
      "Early stoppage": [
        "Bad stoppage",
        "Stopped too soon"
      ],
      "Poor matchups": [
        "Bad fights"
      ],
      "Too many ads": [
        "Commercials"
      ],
      "Late start time": [
        "Too late"
      ],
      "Canceled fights": [
        "Fight cancellations"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-ufc-marketing-places",
    "lane": "ufc-event-advertising-surfaces",
    "prompt": "Name a place you could see advertising for an upcoming UFC event.",
    "kind": "other",
    "ranked": "Social media|Television|Billboard|Sports website|YouTube|Streaming service|Radio|Arena signage",
    "extras": "Bus stop|Podcast|Magazine|Movie theater|Mobile app|Restaurant TV|Email newsletter|Sports bar|Train station|Outdoor poster",
    "aliases": {
      "Social media": [
        "Instagram",
        "Facebook",
        "TikTok"
      ],
      "Television": [
        "TV"
      ],
      "Sports website": [
        "Sports news site"
      ],
      "Streaming service": [
        "Streaming app"
      ],
      "Arena signage": [
        "Arena poster"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-debut-ambitions",
    "lane": "ufc-debut-fighter-goals",
    "prompt": "Name something a fighter might hope to achieve in their first UFC bout.",
    "kind": "other",
    "ranked": "Win|Get a finish|Earn a bonus|Impress fans|Show their skills|Avoid injury|Prove they belong|Make their family proud",
    "extras": "Get a contract extension|Start winning streak|Beat experienced opponent|Put on a great fight|Get noticed by matchmakers|Make coaches proud|Build confidence|Win by knockout|Win by submission",
    "aliases": {
      "Win": [
        "Get victory",
        "Win fight"
      ],
      "Get a finish": [
        "Finish the fight"
      ],
      "Earn a bonus": [
        "Fight bonus",
        "Performance bonus"
      ],
      "Impress fans": [
        "Gain fans"
      ],
      "Avoid injury": [
        "Stay healthy"
      ],
      "Prove they belong": [
        "Prove themselves"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-fight-final-minute",
    "lane": "mma-final-minute-risk-taking",
    "prompt": "Name a high-risk move a UFC fighter might attempt when they need a finish late in a fight.",
    "kind": "other",
    "ranked": "Throw a big overhand|Go for a guillotine|Shoot a takedown|Throw a head kick|Attempt a flying knee|Rush forward with punches|Jump for a submission|Throw a spinning kick",
    "extras": "Go for knockout|Take opponent's back|Throw elbows|Try an armbar|Go for leg lock|Jump into clinch|Look for a choke|Try ground-and-pound",
    "aliases": {
      "Throw a big overhand": [
        "Overhand punch"
      ],
      "Go for a guillotine": [
        "Guillotine choke"
      ],
      "Shoot a takedown": [
        "Takedown"
      ],
      "Throw a head kick": [
        "Head kick"
      ],
      "Attempt a flying knee": [
        "Flying knee"
      ],
      "Rush forward with punches": [
        "Flurry",
        "Blitz"
      ],
      "Jump for a submission": [
        "Jump guard"
      ],
      "Throw a spinning kick": [
        "Spinning kick"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-cage-distractions",
    "lane": "ufc-in-fight-distractions",
    "prompt": "Name something that can distract a UFC fighter while the fight is underway.",
    "kind": "other",
    "ranked": "Crowd noise|Opponent's trash talk|Corner shouting|Pain|Referee's movement|Blood in eyes|Bright lights|Thinking about score",
    "extras": "Fans booing|Opponent taunts|Injury|Mouthguard slips|Camera flashes|Sweat in eyes|Clock running down|Unexpected cut",
    "aliases": {
      "Crowd noise": [
        "Fans yelling",
        "Loud crowd"
      ],
      "Opponent's trash talk": [
        "Trash talk"
      ],
      "Corner shouting": [
        "Coaches shouting"
      ],
      "Pain": [
        "Getting hurt"
      ],
      "Blood in eyes": [
        "Blood"
      ],
      "Bright lights": [
        "Arena lights"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-octagon-early-rules",
    "lane": "ufc-rule-evolution-milestones",
    "prompt": "Name something that became standardized in the UFC after its earliest no-holds-barred tournaments.",
    "kind": "other",
    "ranked": "Weight classes|Round time limits|Mandatory gloves|Judges' decisions|Fouls against headbutts|Three-round non-title bouts|Five-round title bouts|Unified rules",
    "extras": "Athletic commission oversight|No groin strikes|Medical checks|Mouthguards|No hair pulling|Point deductions",
    "aliases": {
      "Weight classes": [
        "Divisions"
      ],
      "Round time limits": [
        "Timed rounds"
      ],
      "Mandatory gloves": [
        "Gloves"
      ],
      "Judges' decisions": [
        "Scorecards"
      ],
      "Fouls against headbutts": [
        "Headbutt ban"
      ],
      "Unified rules": [
        "Unified Rules of MMA"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-mma-underdog-appeal",
    "lane": "ufc-upset-underdog-excitement",
    "prompt": "Name something that makes an underdog UFC fighter especially fun to root for.",
    "kind": "other",
    "ranked": "Chance of an upset|Fearless attitude|Comeback story|Low expectations|Big knockout potential|Determination|Fan support|Fights a superstar",
    "extras": "Underdog odds|Small gym background|Fights through adversity|Tough opponent|Heart|Breakout opportunity|Little media attention|Short-notice debut",
    "aliases": {
      "Chance of an upset": [
        "Upset"
      ],
      "Fearless attitude": [
        "Fearless"
      ],
      "Comeback story": [
        "Redemption"
      ],
      "Low expectations": [
        "Not favored"
      ],
      "Big knockout potential": [
        "Knockout punch"
      ],
      "Determination": [
        "Heart",
        "Grit"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-ufc-app-features",
    "lane": "ufc-fan-mobile-app-features",
    "prompt": "Name something a UFC fan might want to see in an official fight-night app.",
    "kind": "other",
    "ranked": "Fight schedule|Live results|Fighter profiles|Rankings|Stats|Highlights|Event reminders|Live play-by-play",
    "extras": "News|Tickets|Past fights|Video replay|Odds|Scorecards|Lineup changes|Walkout times|Interviews|Streaming access",
    "aliases": {
      "Fight schedule": [
        "Fight card",
        "Schedule"
      ],
      "Live results": [
        "Results"
      ],
      "Fighter profiles": [
        "Fighter bio"
      ],
      "Rankings": [
        "Fighter rankings"
      ],
      "Stats": [
        "Fighter stats"
      ],
      "Highlights": [
        "Clips"
      ],
      "Event reminders": [
        "Notifications"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-fighter-transport",
    "lane": "ufc-arena-fan-travel-hurdles",
    "prompt": "Name a travel problem that could make a fan late to a live UFC event.",
    "kind": "other",
    "ranked": "Traffic|Parking full|Flight delay|Wrong arena entrance|Rideshare delay|Road closures|Long train wait|Getting lost",
    "extras": "Bus late|Accident on road|Car breakdown|Bad weather|Airport delays|Venue far away|Shuttle full|Crowds|Wrong address",
    "aliases": {
      "Traffic": [
        "Traffic jam"
      ],
      "Parking full": [
        "No parking",
        "Parking issues"
      ],
      "Flight delay": [
        "Delayed flight"
      ],
      "Rideshare delay": [
        "Uber delayed",
        "Taxi delay"
      ],
      "Road closures": [
        "Closed roads"
      ],
      "Getting lost": [
        "Wrong way",
        "Lost"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-replay-moments",
    "lane": "ufc-fan-replay-worthy-fight-moments",
    "prompt": "Name a moment in a UFC broadcast a viewer might rewind to watch again.",
    "kind": "other",
    "ranked": "Knockout|Submission finish|Huge knockdown|Controversial stoppage|Great exchange|Crazy comeback|Flying knee|Big takedown",
    "extras": "Head kick|Funny interview|Slow-motion replay|Near submission|Last-second finish|Fight-ending punch|Unexpected upset|Questionable foul|Wild scramble",
    "aliases": {
      "Knockout": [
        "KO"
      ],
      "Submission finish": [
        "Submission",
        "Tapout"
      ],
      "Huge knockdown": [
        "Knockdown"
      ],
      "Controversial stoppage": [
        "Ref stoppage",
        "Bad stoppage"
      ],
      "Great exchange": [
        "Wild exchange"
      ],
      "Crazy comeback": [
        "Comeback"
      ],
      "Flying knee": [
        "Knee KO"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-gym-newcomer-concerns",
    "lane": "mma-newcomer-gym-signup-questions",
    "prompt": "Name something a beginner might ask before signing up at an MMA gym.",
    "kind": "other",
    "ranked": "Membership price|Class schedule|Required equipment|Beginner classes|Free trial|Coach experience|Safety rules|Sparring policy",
    "extras": "Class size|Contract length|Age requirements|Showers|Parking|Fitness level|Women's classes|Cancellation policy|Gi required|Private lessons",
    "aliases": {
      "Membership price": [
        "Cost",
        "Price",
        "Dues"
      ],
      "Class schedule": [
        "Times",
        "Hours"
      ],
      "Required equipment": [
        "Gear"
      ],
      "Beginner classes": [
        "Beginner class"
      ],
      "Free trial": [
        "Trial class"
      ],
      "Coach experience": [
        "Instructor credentials"
      ],
      "Safety rules": [
        "Safety"
      ],
      "Sparring policy": [
        "Sparring"
      ]
    }
  },
  {
    "id": "ufc-v2-fast8-mma-sparring-partners",
    "lane": "mma-fighter-valued-sparring-partner-traits",
    "prompt": "Name a quality a UFC fighter might value in a training or sparring partner.",
    "kind": "other",
    "ranked": "Reliable attendance|Controlled intensity|Good technique|Similar size|Helpful feedback|Different fighting style|Respectfulness|Strong conditioning",
    "extras": "Trustworthy|Safe sparring|Experienced|Good defense|Competitive|Toughness|Patience|Similar reach|Great wrestling|Great striking",
    "aliases": {
      "Reliable attendance": [
        "Reliable"
      ],
      "Controlled intensity": [
        "Control",
        "Doesn't go too hard"
      ],
      "Good technique": [
        "Technical"
      ],
      "Similar size": [
        "Same size"
      ],
      "Helpful feedback": [
        "Good feedback"
      ],
      "Respectfulness": [
        "Respectful"
      ],
      "Strong conditioning": [
        "Good cardio"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_FAST_BATCH8 = makeUfcFeudDraft(ROWS);
