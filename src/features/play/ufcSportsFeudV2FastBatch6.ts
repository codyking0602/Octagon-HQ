import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Sixth Fast Money editorial round: not imported by live UFC Daily. */
const ROWS = [
  {
    "id": "ufc-v2-fast6-illegal-actions",
    "lane": "mma-illegal-foul-actions",
    "prompt": "Name an illegal action that can get a UFC fighter warned or penalized.",
    "kind": "other",
    "ranked": "Eye poke|Groin strike|Fence grab|Headbutt|Biting|Hair pulling|Striking the back of the head|Small-joint manipulation",
    "extras": "Throat strike|Fish hooking|Spitting|Kicking the head of a grounded opponent|Intentional finger in an opponent's mouth|Hitting after the bell|Holding opponent's shorts|Interference by a cornerman|Abusive language toward referee|Illegal knee to a grounded fighter",
    "aliases": {
      "Eye poke": [
        "Eye gouge",
        "Poke to eye"
      ],
      "Groin strike": [
        "Low blow",
        "Groin kick"
      ],
      "Fence grab": [
        "Cage grab"
      ],
      "Striking the back of the head": [
        "Rabbit punch",
        "Back of head strike"
      ],
      "Small-joint manipulation": [
        "Finger bending"
      ],
      "Kicking the head of a grounded opponent": [
        "Soccer kick to grounded opponent"
      ]
    }
  },
  {
    "id": "ufc-v2-fast6-championship-belt",
    "lane": "ufc-championship-belt-features",
    "prompt": "Name something you can see on the UFC championship belt.",
    "kind": "other",
    "ranked": "UFC logo|Gold-colored plates|Leather strap|Championship lettering|Nameplate|Decorative stones|Engraved design|Side plates",
    "extras": "Fight title|Metal plates|Black leather|Octagon design|Champion's name|World champion text|Country motif|Raised lettering|Belt buckle|Belt hardware",
    "aliases": {
      "Gold-colored plates": [
        "Gold plates",
        "Gold"
      ],
      "Leather strap": [
        "Strap",
        "Leather"
      ],
      "Nameplate": [
        "Name plate"
      ],
      "Decorative stones": [
        "Stones",
        "Gems"
      ],
      "Side plates": [
        "Side plate"
      ]
    }
  },
  {
    "id": "ufc-v2-fast6-mma-slang",
    "lane": "mma-fan-unabbreviated-slang",
    "prompt": "Name a slang term UFC fans use when discussing a fighter or a bout.",
    "kind": "other",
    "ranked": "Chin|Gas tank|Ground and pound|Starch|Scramble|Sprawl|Gatekeeper|Hype train",
    "extras": "Journeyman|War|Lay and pray|Gassed|Fight IQ|Styles make fights|Robbery|Pillow fists|Cage control|Weight bully|Mat return|Sprawl and brawl|Puncher's chance|Fight of the Night",
    "aliases": {
      "Gas tank": [
        "Cardio"
      ],
      "Ground and pound": [
        "Ground-and-pound",
        "GNP"
      ],
      "Starch": [
        "Starched"
      ],
      "Gassed": [
        "Gas out"
      ],
      "Lay and pray": [
        "Lay-and-pray"
      ]
    }
  },
  {
    "id": "ufc-v2-fast6-decision-announcements",
    "lane": "mma-judge-decision-terms",
    "prompt": "Name a term you might hear when the judges' decision is read after a UFC fight.",
    "kind": "other",
    "ranked": "Unanimous decision|Split decision|Majority decision|Draw|Split draw|Majority draw|Technical decision|Technical draw",
    "extras": "Decision|Judges' scorecards|30-27|29-28|Ten-point must|Winner by decision|Point deduction|No contest",
    "aliases": {
      "Unanimous decision": [
        "UD"
      ],
      "Split decision": [
        "SD"
      ],
      "Majority decision": [
        "MD"
      ],
      "Split draw": [
        "SD draw"
      ]
    }
  },
  {
    "id": "ufc-v2-fast6-boxing-mma-differences",
    "lane": "mma-boxing-format-comparison",
    "prompt": "Name something that is part of UFC MMA rules but not ordinary professional boxing rules.",
    "kind": "other",
    "ranked": "Leg kicks|Takedowns|Submissions|Ground fighting|Knee strikes|Elbow strikes|Cage fighting|Clinch wrestling",
    "extras": "Rear-naked chokes|Armbars|Body kicks|Spinning backfists|Ground and pound|MMA gloves|Three-round bouts|UFC five-round title fights|Ground control|Jiu-jitsu",
    "aliases": {
      "Leg kicks": [
        "Kicks"
      ],
      "Submissions": [
        "Chokes",
        "Submission holds"
      ],
      "Clinch wrestling": [
        "Wrestling in the clinch"
      ],
      "Ground fighting": [
        "Grappling on the ground"
      ],
      "Cage fighting": [
        "Octagon"
      ]
    }
  },
  {
    "id": "ufc-v2-fast6-mma-takedown-names",
    "lane": "mma-named-takedowns",
    "prompt": "Name a wrestling takedown or throw UFC commentators might call out.",
    "kind": "other",
    "ranked": "Double-leg takedown|Single-leg takedown|Body-lock takedown|Inside trip|Outside trip|Ankle pick|Hip toss|Suplex",
    "extras": "High crotch|Foot sweep|Knee tap|Snatch single|Lateral drop|Snap down|Fireman's carry|Arm drag|Mat return|Uchi mata",
    "aliases": {
      "Double-leg takedown": [
        "Double leg"
      ],
      "Single-leg takedown": [
        "Single leg"
      ],
      "Body-lock takedown": [
        "Body lock"
      ],
      "Inside trip": [
        "Inside leg trip"
      ],
      "Hip toss": [
        "Hip throw"
      ]
    }
  },
  {
    "id": "ufc-v2-fast6-fight-clock-announcements",
    "lane": "ufc-live-fight-time-calls",
    "prompt": "Name something a UFC timekeeper or referee might signal during a round.",
    "kind": "other",
    "ranked": "Start of round|End of round|Ten seconds remaining|Time-out|Restart fight|Break clinch|Pause for injury|Resume action",
    "extras": "Stop|Last ten seconds|Bell|Neutral corner|Medical time-out|Time remaining",
    "aliases": {
      "Ten seconds remaining": [
        "Ten seconds",
        "10 seconds"
      ],
      "End of round": [
        "Round over"
      ],
      "Time-out": [
        "Time"
      ],
      "Restart fight": [
        "Fight"
      ],
      "Break clinch": [
        "Break"
      ]
    }
  },
  {
    "id": "ufc-v2-fast6-respect-after-bout",
    "lane": "ufc-postfight-respect-gestures",
    "prompt": "Name something fighters might do to show respect to one another after a UFC fight.",
    "kind": "other",
    "ranked": "Shake hands|Hug|Touch gloves|Bow|Congratulate opponent|Raise opponent's hand|Help opponent stand|Speak kindly to opponent",
    "extras": "Fist bump|Nod|High five|Compliment opponent|Applaud winner|Kneel together|Thank opponent|Exchange shirts|Point at opponent|Offer handshake",
    "aliases": {
      "Shake hands": [
        "Handshake"
      ],
      "Touch gloves": [
        "Glove touch"
      ],
      "Hug": [
        "Embrace"
      ],
      "Congratulate opponent": [
        "Say good fight"
      ],
      "Raise opponent's hand": [
        "Hold up their hand"
      ]
    }
  },
  {
    "id": "ufc-v2-fast6-fan-postfight-check",
    "lane": "ufc-followup-news-after-event",
    "prompt": "Name something UFC fans might look up the morning after a major fight card.",
    "kind": "other",
    "ranked": "Fight results|Knockout highlights|Judges' scorecards|Performance bonuses|Updated rankings|Post-fight interviews|Next opponent|Injury updates",
    "extras": "Press conference|Fight recap|Finish video|Purse details|Medical suspensions|Fighter reactions|Weight class standings|Fight statistics|Media commentary|Polls|Social media posts|Future matchup news",
    "aliases": {
      "Fight results": [
        "Results"
      ],
      "Knockout highlights": [
        "Highlights"
      ],
      "Judges' scorecards": [
        "Scores",
        "Scorecards"
      ],
      "Performance bonuses": [
        "Bonuses"
      ],
      "Updated rankings": [
        "Rankings"
      ]
    }
  },
  {
    "id": "ufc-v2-fast6-mma-gym-etiquette",
    "lane": "mma-gym-safety-etiquette",
    "prompt": "Name something MMA training partners should do to keep sparring respectful and safe.",
    "kind": "other",
    "ranked": "Touch gloves|Wear protective gear|Tap to submissions|Stop when told|Control power|Follow gym rules|Respect partner|Clean equipment",
    "extras": "Listen to coach|Avoid dangerous strikes|Check on partner|Communicate injuries|Use appropriate gloves|Sanitize mats|Wear mouthguard|Warm up|Keep nails short|Help beginners|Take breaks|No cheap shots",
    "aliases": {
      "Touch gloves": [
        "Glove touch"
      ],
      "Control power": [
        "Pull punches"
      ],
      "Stop when told": [
        "Stop at bell"
      ],
      "Tap to submissions": [
        "Tap out"
      ],
      "Respect partner": [
        "Show respect"
      ]
    }
  },
  {
    "id": "ufc-v2-fast6-arena-fan-gear",
    "lane": "ufc-arena-fan-items",
    "prompt": "Name something a UFC fan might bring to show support for a fighter at an event.",
    "kind": "other",
    "ranked": "Country flag|Fighter T-shirt|Replica belt|Handmade sign|Team hat|Face paint|Fighter jersey|Poster",
    "extras": "Banners|Scarves|Headband|Gloves|Cheering section|Fighter photo|National jersey|Team colors|Merchandise|Foam finger|Bandana",
    "aliases": {
      "Country flag": [
        "Flag"
      ],
      "Fighter T-shirt": [
        "Shirt",
        "T-shirt"
      ],
      "Handmade sign": [
        "Sign"
      ],
      "Replica belt": [
        "Championship belt"
      ],
      "Fighter jersey": [
        "Jersey"
      ]
    }
  },
  {
    "id": "ufc-v2-fast6-fight-night-roles",
    "lane": "ufc-specific-cage-officials",
    "prompt": "Name someone with an official role in or immediately around a UFC bout.",
    "kind": "other",
    "ranked": "Referee|Judge|Cutman|Ringside doctor|Timekeeper|Ring announcer|Athletic commission inspector|Corner coach",
    "extras": "Cornerman|Commission supervisor|UFC official|Paramedic|Fight inspector|Scorekeeper|Medical staff|Matchmaker|Commission representative|Official scorer",
    "aliases": {
      "Ringside doctor": [
        "Doctor"
      ],
      "Athletic commission inspector": [
        "Commission inspector"
      ],
      "Referee": [
        "Fight referee"
      ],
      "Ring announcer": [
        "Announcer"
      ],
      "Corner coach": [
        "Coach"
      ]
    }
  },
  {
    "id": "ufc-v2-fast6-ufc-gym-promo",
    "lane": "mma-gym-advertised-classes",
    "prompt": "Name a class that an MMA gym might offer to people who aren't professional fighters.",
    "kind": "other",
    "ranked": "Brazilian jiu-jitsu|Boxing|Kickboxing|Muay Thai|Wrestling|Self-defense|MMA fundamentals|Fitness conditioning",
    "extras": "Kids' martial arts|Women's self-defense|Open mat|Cardio boxing|Sparring class|Grappling|Striking drills|Strength training|Beginner MMA|No-gi jiu-jitsu|Submission grappling|Youth wrestling",
    "aliases": {
      "Brazilian jiu-jitsu": [
        "BJJ",
        "Jiu-jitsu"
      ],
      "MMA fundamentals": [
        "Mixed martial arts class"
      ],
      "Fitness conditioning": [
        "Conditioning",
        "MMA fitness"
      ],
      "Self-defense": [
        "Self defense"
      ]
    }
  },
  {
    "id": "ufc-v2-fast6-mma-tired-signs",
    "lane": "ufc-gassed-fighter-observations",
    "prompt": "Name a sign that a UFC fighter might be getting tired during a fight.",
    "kind": "other",
    "ranked": "Heavy breathing|Slow punches|Hands dropping|Less footwork|Leaning on cage|Lower output|Open mouth|Slower reactions",
    "extras": "Taking deep breaths|Standing still|Resting in clinch|Bad posture|Wobbly legs|Backpedaling|Poor defense|Long pauses|Slower kicks|Sloppy technique|Fatigue|Gassed",
    "aliases": {
      "Heavy breathing": [
        "Breathing hard",
        "Panting"
      ],
      "Hands dropping": [
        "Lowered guard"
      ],
      "Less footwork": [
        "Stops moving"
      ],
      "Lower output": [
        "Less volume"
      ],
      "Resting in clinch": [
        "Stalling in clinch"
      ]
    }
  },
  {
    "id": "ufc-v2-fast6-title-fight-honors",
    "lane": "ufc-fighter-recognition-awards",
    "prompt": "Name a UFC award, title or recognition a fighter might receive.",
    "kind": "other",
    "ranked": "UFC championship belt|Fight of the Night|Performance of the Night|UFC Hall of Fame|The Ultimate Fighter winner|BMF title|Dana White's Contender Series contract|Interim UFC title",
    "extras": "Knockout of the Night|Submission of the Night|UFC title shot|Event performance bonus|UFC record|UFC ranking|Title defense|Fight of the Year recognition",
    "aliases": {
      "Fight of the Night": [
        "FOTN"
      ],
      "Performance of the Night": [
        "POTN"
      ],
      "UFC championship belt": [
        "World title",
        "UFC title"
      ],
      "The Ultimate Fighter winner": [
        "TUF champion"
      ],
      "BMF title": [
        "BMF belt"
      ],
      "UFC Hall of Fame": [
        "Hall of Fame"
      ]
    }
  },
  {
    "id": "ufc-v2-fast6-fight-result-determinations",
    "lane": "mma-fight-completion-categories",
    "prompt": "Name an official way a UFC fight can be recorded as ending.",
    "kind": "other",
    "ranked": "Knockout|Technical knockout|Submission|Unanimous decision|Split decision|Disqualification|No contest|Draw",
    "extras": "Majority decision|Doctor stoppage|Corner stoppage|Retirement|Technical decision|Technical submission|Technical draw|Split draw|Majority draw",
    "aliases": {
      "Knockout": [
        "KO"
      ],
      "Technical knockout": [
        "TKO"
      ],
      "Submission": [
        "Tap out",
        "Choke submission"
      ],
      "Unanimous decision": [
        "UD"
      ],
      "Split decision": [
        "SD"
      ],
      "Disqualification": [
        "DQ"
      ],
      "No contest": [
        "NC"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_FAST_BATCH6 = makeUfcFeudDraft(ROWS);
