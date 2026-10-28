import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Additional editorial candidates about fight strategy and UFC oversight; NOT live. */
const ROWS = [
  {
    "id": "ufc-v2-fast11-body-shot-setups",
    "lane": "mma-body-shot-setup-tactics",
    "prompt": "Name a way a UFC fighter might create an opening to land a punch to the body.",
    "kind": "other",
    "ranked": "Feint to head|Use the jab|Change levels|Throw combination|Catch opponent reaching|Counter a high guard|Move into range|Trap opponent on fence",
    "extras": "Draw high defense|Slip a punch|Punch off clinch|Use angle|Throw after low kick|Attack while opponent backs up",
    "aliases": {
      "Feint to head": [
        "Head feint"
      ],
      "Use the jab": [
        "Jab"
      ],
      "Change levels": [
        "Level change"
      ],
      "Throw combination": [
        "Combination"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-southpaw-adjustments",
    "lane": "mma-facing-southpaw-preparation",
    "prompt": "Name an adjustment a UFC fighter might make against a southpaw opponent.",
    "kind": "other",
    "ranked": "Watch lead hand|Mind outside foot position|Circle away from power hand|Adjust jab|Defend left straight|Check kicks|Work angles|Practice southpaw sparring",
    "extras": "Angle outside lead foot|Change stance|Practice counters|Use lead hook|Adjust defense|Watch rear kick|Protect open side",
    "aliases": {
      "Mind outside foot position": [
        "Outside foot"
      ],
      "Defend left straight": [
        "Straight left"
      ],
      "Practice southpaw sparring": [
        "Spar southpaw"
      ],
      "Work angles": [
        "Angles"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-fatigued-limb",
    "lane": "mma-signs-fighter-limb-injury",
    "prompt": "Name a sign that a UFC fighter might be favoring an injured arm or leg.",
    "kind": "other",
    "ranked": "Limping|Stops throwing jab|Keeps arm low|Shakes hand|Switches stance|Avoids planting foot|Protects shoulder|Moves awkwardly",
    "extras": "Cannot raise arm|Holds elbow|Hobbles|Avoids kicking|Slows movement|Grabs knee|Keeps weight off leg",
    "aliases": {
      "Limping": [
        "Limp"
      ],
      "Switches stance": [
        "Changes stance"
      ],
      "Shakes hand": [
        "Shaking hand"
      ],
      "Moves awkwardly": [
        "Altered movement"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-high-kick-defense",
    "lane": "mma-head-kick-defensive-reactions",
    "prompt": "Name a way a UFC fighter might defend a high kick.",
    "kind": "other",
    "ranked": "Raise guard|Move out of range|Lean back|Block with forearm|Duck under|Step away|Catch the kick|Counter as it misses",
    "extras": "Shell up|Use opposite arm|Circle away|Slip head|Check distance|Cover temple|Jam kick|Side-step",
    "aliases": {
      "Raise guard": [
        "Hands up"
      ],
      "Move out of range": [
        "Back away"
      ],
      "Lean back": [
        "Pull back"
      ],
      "Block with forearm": [
        "Forearm block"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-clinch-break",
    "lane": "mma-breaking-standing-clinch",
    "prompt": "Name something a UFC fighter might do to break free from a standing clinch.",
    "kind": "other",
    "ranked": "Frame with arms|Pummel for underhook|Push off|Circle away|Fight the grips|Turn opponent|Create distance|Duck out",
    "extras": "Peel opponent's hands|Control wrist|Post on chest|Pivot|Step outside|Switch position|Break collar tie",
    "aliases": {
      "Frame with arms": [
        "Frame"
      ],
      "Pummel for underhook": [
        "Pummel"
      ],
      "Push off": [
        "Push away"
      ],
      "Fight the grips": [
        "Hand fight"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-stance-switch",
    "lane": "mma-why-fighters-switch-stances",
    "prompt": "Name a reason a UFC fighter might switch from orthodox to southpaw or vice versa.",
    "kind": "other",
    "ranked": "Create new angles|Confuse opponent|Protect hurt leg|Set up kicks|Change punching matchup|Find distance|Avoid leg kicks|Reset rhythm",
    "extras": "Hide attack|Use different jab|Escape pressure|Show different look|Protect lead foot|Adapt to opponent",
    "aliases": {
      "Create new angles": [
        "Angles"
      ],
      "Confuse opponent": [
        "Confuse"
      ],
      "Protect hurt leg": [
        "Injured leg"
      ],
      "Reset rhythm": [
        "Change rhythm"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-counterpunching",
    "lane": "mma-counterstrike-opportunities",
    "prompt": "Name a moment when a UFC fighter might counterpunch an opponent.",
    "kind": "other",
    "ranked": "After missed jab|After missed kick|While opponent advances|After a blocked punch|During wide hook|After failed takedown|When opponent drops hands|On a predictable combination",
    "extras": "On opponent overreach|When opponent exits pocket|After slip|When opponent resets|During reckless rush|Off a feint",
    "aliases": {
      "After missed jab": [
        "Missed jab"
      ],
      "While opponent advances": [
        "Opponent comes forward"
      ],
      "After a blocked punch": [
        "Blocked punch"
      ],
      "After failed takedown": [
        "Stuffed shot"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-leg-kick-offense",
    "lane": "mma-setting-up-leg-kicks",
    "prompt": "Name something a UFC fighter might do to set up a clean leg kick.",
    "kind": "other",
    "ranked": "Jab first|Use feint|Throw punch combination|Catch opponent planted|Counter punch|Change angle|Back opponent toward fence|Wait for heavy stance",
    "extras": "Punch high then kick|Draw opponent forward|Slip counter|Kick after hook|Switch kick stance|Disguise setup|Time lead leg",
    "aliases": {
      "Jab first": [
        "Jab"
      ],
      "Use feint": [
        "Feint"
      ],
      "Change angle": [
        "Angle"
      ],
      "Catch opponent planted": [
        "Planted leg"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-cage-mistakes",
    "lane": "mma-risky-moves-near-cage",
    "prompt": "Name a mistake a UFC fighter might make while fighting with their back near the cage.",
    "kind": "other",
    "ranked": "Standing still|Letting opponent control wrists|Not circling off|Dropping hands|Crossing feet|Giving up underhook|Bending forward|Backing straight up",
    "extras": "Poor footwork|Giving up back|Letting opponent grab legs|Panicking|Overreaching|Grabbing fence|Ignoring coach",
    "aliases": {
      "Standing still": [
        "Not moving"
      ],
      "Not circling off": [
        "Staying on fence"
      ],
      "Dropping hands": [
        "Hands down"
      ],
      "Backing straight up": [
        "Backing up"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-clinch-control-signs",
    "lane": "mma-successful-clinch-control-indicators",
    "prompt": "Name something a UFC fan might notice when one fighter controls the clinch.",
    "kind": "other",
    "ranked": "Opponent against fence|Winning underhooks|Controlling wrists|Landing short knees|Turning opponent|Better head position|Pressuring forward|Breaking opponent's posture",
    "extras": "Body lock|Dominant grips|Landing elbows|Good balance|Opponent stuck|Effective dirty boxing|Avoids separation",
    "aliases": {
      "Winning underhooks": [
        "Underhooks"
      ],
      "Controlling wrists": [
        "Wrist control"
      ],
      "Landing short knees": [
        "Knees"
      ],
      "Pressuring forward": [
        "Forward pressure"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-surviving-bad-round",
    "lane": "mma-mental-comeback-responses",
    "prompt": "Name a mindset a UFC fighter might need after losing a rough round.",
    "kind": "other",
    "ranked": "Stay calm|Believe in comeback|Listen to corner|Avoid panic|Stay focused|Adapt strategy|Keep confidence|Be patient",
    "extras": "Think one round at a time|Control emotions|Reset mentally|Stay disciplined|Push through adversity|Don't quit|Accept coaching",
    "aliases": {
      "Stay calm": [
        "Calm"
      ],
      "Believe in comeback": [
        "Belief"
      ],
      "Listen to corner": [
        "Listen to coach"
      ],
      "Stay focused": [
        "Focus"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-sparring-round-debrief",
    "lane": "mma-coach-sparring-debrief-topics",
    "prompt": "Name something a coach might ask a UFC fighter after a hard sparring round.",
    "kind": "other",
    "ranked": "What worked?|Where did you get hit?|How was cardio?|Did you follow plan?|How was defense?|Were you hurt?|What did you learn?|Did you control distance?",
    "extras": "What mistakes happened?|How was your jab?|Did you breathe well?|Any injury?|Did you hear instructions?|How was footwork?",
    "aliases": {
      "How was cardio?": [
        "Conditioning"
      ],
      "How was defense?": [
        "Defense"
      ],
      "Did you follow plan?": [
        "Game plan"
      ],
      "Were you hurt?": [
        "Injury"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-postfight-suspensions",
    "lane": "ufc-commission-medical-suspension-causes",
    "prompt": "Name an injury or health concern that might cause a medical suspension after a UFC fight.",
    "kind": "other",
    "ranked": "Concussion|Broken hand|Cut requiring stitches|Broken nose|Eye injury|Leg injury|Shoulder injury|Jaw injury",
    "extras": "Rib injury|Facial fracture|Knee injury|Dizziness|Deep laceration|Severe swelling|Broken foot",
    "aliases": {
      "Concussion": [
        "Head trauma"
      ],
      "Broken hand": [
        "Hand fracture"
      ],
      "Broken nose": [
        "Nose fracture"
      ],
      "Jaw injury": [
        "Broken jaw"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-ringside-commission",
    "lane": "ufc-athletic-commission-bout-oversight",
    "prompt": "Name something an athletic commission oversees at a regulated UFC event.",
    "kind": "other",
    "ranked": "Officials|Judges|Referees|Weigh-ins|Medical clearances|Rules enforcement|Drug testing|Official results",
    "extras": "Suspensions|Glove inspection|Fighter licensing|Scoring|Foul reviews|Safety requirements|Purse disclosures",
    "aliases": {
      "Officials": [
        "Fight officials"
      ],
      "Medical clearances": [
        "Medical approval"
      ],
      "Official results": [
        "Results"
      ],
      "Rules enforcement": [
        "Rules"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-arena-sound-details",
    "lane": "ufc-live-cage-sounds-fans-hear",
    "prompt": "Name a sound fans might notice near the cage at a UFC event that television doesn't emphasize.",
    "kind": "other",
    "ranked": "Footsteps on mat|Cornermen yelling|Breathing|Glove impacts|Referee instructions|Fighter grunts|Cage rattle|Coaches shouting",
    "extras": "Fence shaking|Heavy kicks|Crowd behind seats|Mouthguard noise|Tap sound|Foot shuffling|Mat contact",
    "aliases": {
      "Footsteps on mat": [
        "Footsteps"
      ],
      "Cornermen yelling": [
        "Corner yelling"
      ],
      "Cage rattle": [
        "Fence rattle"
      ],
      "Breathing": [
        "Heavy breathing"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-fighter-interview-lessons",
    "lane": "ufc-postfight-interview-fan-insights",
    "prompt": "Name something fans might learn from a fighter's in-Octagon interview after a bout.",
    "kind": "other",
    "ranked": "Injury status|Fight plan|Who they want next|Thoughts on finish|Training camp details|Feelings about result|Corner advice|Title ambitions",
    "extras": "Was hurt during fight|Weight cut problems|Next opponent|What surprised them|Retirement thoughts|Thanks to fans",
    "aliases": {
      "Injury status": [
        "Injuries"
      ],
      "Fight plan": [
        "Game plan"
      ],
      "Who they want next": [
        "Callout"
      ],
      "Title ambitions": [
        "Title shot"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-short-notice-strategy",
    "lane": "ufc-short-notice-opponent-change-strategy",
    "prompt": "Name something a UFC fighter might have to change when their opponent is replaced on short notice.",
    "kind": "other",
    "ranked": "Game plan|Sparring partner|Wrestling preparation|Striking preparation|Weight-cut timing|Video study|Training focus|Mindset",
    "extras": "Defensive plan|Warm-up routine|Distance tactics|Coach's advice|Takedown defense|Fight pace|Travel plan",
    "aliases": {
      "Game plan": [
        "Strategy"
      ],
      "Sparring partner": [
        "Sparring"
      ],
      "Video study": [
        "Film study"
      ],
      "Mindset": [
        "Mental preparation"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-judges-ten-eight",
    "lane": "ufc-dominant-round-judging-clues",
    "prompt": "Name something that might make UFC judges consider scoring a round 10-8.",
    "kind": "other",
    "ranked": "Big damage|Repeated knockdowns|Near finish|Sustained dominant offense|Opponent barely fights back|Overwhelming strikes|Long attack sequence|Heavy ground-and-pound",
    "extras": "Effective grappling damage|Multiple damaging blows|Total offensive dominance|Significant damage|One-sided round|Dominating for most round",
    "aliases": {
      "Big damage": [
        "Damage"
      ],
      "Repeated knockdowns": [
        "Multiple knockdowns"
      ],
      "Near finish": [
        "Almost finished"
      ],
      "Heavy ground-and-pound": [
        "Ground and pound"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-fight-week-briefing",
    "lane": "ufc-athlete-fight-week-logistics-briefing",
    "prompt": "Name something a UFC fighter might be told about at a fight-week briefing.",
    "kind": "other",
    "ranked": "Media schedule|Weigh-in time|Fight order|Transportation|Medical checks|Walkout procedure|Equipment requirements|Rules meeting",
    "extras": "Check-in time|Hotel shuttle|Locker room assignment|Start time|Official uniforms|Credential pickup|Interview slots",
    "aliases": {
      "Media schedule": [
        "Media day"
      ],
      "Weigh-in time": [
        "Weigh in"
      ],
      "Fight order": [
        "Bout order"
      ],
      "Transportation": [
        "Transport"
      ]
    }
  },
  {
    "id": "ufc-v2-fast11-bout-card-size",
    "lane": "ufc-fight-night-vs-numbered-show-differences",
    "prompt": "Name something that can differ between a numbered UFC pay-per-view and a UFC Fight Night.",
    "kind": "other",
    "ranked": "Pay-per-view purchase|Main-card broadcast|Ticket demand|Promotional budget|Event marketing|Title-fight frequency|Main-card size|Venue choice",
    "extras": "Streaming platform|Broadcast start time|Headliner choice|International reach|Price to watch|Press events|Arena attendance",
    "aliases": {
      "Pay-per-view purchase": [
        "PPV price"
      ],
      "Ticket demand": [
        "Tickets"
      ],
      "Event marketing": [
        "Marketing"
      ],
      "Venue choice": [
        "Venue"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_FAST_BATCH11 = makeUfcFeudDraft(ROWS);
