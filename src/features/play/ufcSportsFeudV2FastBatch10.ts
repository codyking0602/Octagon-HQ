import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Editorial candidates: 22 distinct tactical and operational UFC situations. Not certified or live. */
const ROWS = [
  {
    "id": "ufc-v2-fast10-leg-kick-defense",
    "lane": "mma-leg-kick-counters",
    "prompt": "Name a way an MMA fighter might defend against repeated leg kicks.",
    "kind": "other",
    "ranked": "Check the kick|Step out of range|Catch the leg|Switch stance|Counter punch|Block with shin|Move off line|Close distance",
    "extras": "Angle away|Use teep|Step back|Raise leg|Counter with own kick|Jam the kick|Shift weight|Avoid planted leg",
    "aliases": {
      "Check the kick": [
        "Check kicks",
        "Leg check"
      ],
      "Step out of range": [
        "Back away"
      ],
      "Switch stance": [
        "Change stance"
      ],
      "Move off line": [
        "Circle out"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-reach-advantage",
    "lane": "mma-long-reach-strategy",
    "prompt": "Name a way a UFC fighter with a reach advantage might use it.",
    "kind": "other",
    "ranked": "Establish the jab|Fight at range|Use front kicks|Keep distance|Use straight punches|Counter entries|Move backward|Control center",
    "extras": "Use teep|Intercept opponent|Use long guard|Angle away|Measure range|Stay outside pocket|Jab to body",
    "aliases": {
      "Establish the jab": [
        "Jab"
      ],
      "Fight at range": [
        "Stay outside"
      ],
      "Use front kicks": [
        "Teep"
      ],
      "Keep distance": [
        "Manage distance"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-shorter-reach",
    "lane": "mma-shorter-reach-strategy",
    "prompt": "Name a tactic a shorter-reach UFC fighter might use against a taller striker.",
    "kind": "other",
    "ranked": "Get inside|Use head movement|Attack the body|Pressure opponent|Cut off the cage|Change levels|Use leg kicks|Work in clinch",
    "extras": "Slip jab|Close distance|Throw overhand|Shoot takedown|Angle out|Crowd range|Use feints|Counter long punches",
    "aliases": {
      "Get inside": [
        "Close distance"
      ],
      "Use head movement": [
        "Slip punches"
      ],
      "Attack the body": [
        "Body shots"
      ],
      "Pressure opponent": [
        "Pressure"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-cage-defense",
    "lane": "mma-defending-along-cage",
    "prompt": "Name a way a UFC fighter might escape being trapped against the cage.",
    "kind": "other",
    "ranked": "Circle off fence|Use underhook|Frame with arms|Pummel for position|Turn opponent|Create space|Sprawl|Push off",
    "extras": "Change angle|Fight for wrist control|Hip escape|Switch position|Break clinch|Slide along fence|Post on opponent",
    "aliases": {
      "Circle off fence": [
        "Circle out"
      ],
      "Use underhook": [
        "Underhooks"
      ],
      "Create space": [
        "Separate"
      ],
      "Frame with arms": [
        "Frame"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-fighter-behind-scorecards",
    "lane": "mma-trailing-on-scorecards-adjustments",
    "prompt": "Name an adjustment a UFC fighter might make when they know they're behind on the scorecards.",
    "kind": "other",
    "ranked": "Increase aggression|Throw more strikes|Seek a finish|Take more risks|Pressure opponent|Go for submission|Push pace|Close distance",
    "extras": "Cut off Octagon|Attempt takedowns|Listen to corner|Look for KO|Attack more often|Give up safe strategy|Change stance",
    "aliases": {
      "Seek a finish": [
        "Go for finish"
      ],
      "Go for submission": [
        "Submission"
      ],
      "Increase aggression": [
        "Be aggressive"
      ],
      "Push pace": [
        "Speed up"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-back-control-escape",
    "lane": "mma-defending-back-control",
    "prompt": "Name something a fighter might do to escape an opponent's back control in a UFC fight.",
    "kind": "other",
    "ranked": "Fight the hands|Protect neck|Hand-fight choking arm|Turn toward opponent|Clear hooks|Keep chin tucked|Post to mat|Get shoulders to mat",
    "extras": "Peel off grip|Break body triangle|Roll to safe side|Bridge|Stand up|Use two-on-one grip|Control wrist|Keep breathing",
    "aliases": {
      "Fight the hands": [
        "Hand fighting"
      ],
      "Protect neck": [
        "Defend neck"
      ],
      "Clear hooks": [
        "Remove hooks"
      ],
      "Keep chin tucked": [
        "Tuck chin"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-ground-space",
    "lane": "mma-bottom-position-space-creation",
    "prompt": "Name a technique a UFC fighter on the bottom might use to create space on the ground.",
    "kind": "other",
    "ranked": "Frame with forearms|Hip escape|Bridge|Push opponent away|Shrimp|Regain guard|Make an underhook|Kick off",
    "extras": "Post on hips|Move hips|Recover knee shield|Turn to side|Use feet on hips|Stand up|Technical get-up",
    "aliases": {
      "Hip escape": [
        "Shrimp",
        "Shrimping"
      ],
      "Frame with forearms": [
        "Framing"
      ],
      "Bridge": [
        "Hip bridge"
      ],
      "Regain guard": [
        "Recover guard"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-ground-pound-defense",
    "lane": "mma-defending-ground-and-pound",
    "prompt": "Name a way a fighter might defend ground-and-pound while on the mat.",
    "kind": "other",
    "ranked": "Cover head|Tie up arms|Control wrists|Move hips|Regain guard|Bridge|Clinch opponent|Get up",
    "extras": "Block elbows|Roll to side|Create distance|Use butterfly hooks|Pull opponent close|Keep hands by temples|Trap arm",
    "aliases": {
      "Cover head": [
        "Protect head"
      ],
      "Tie up arms": [
        "Control arms"
      ],
      "Control wrists": [
        "Wrist control"
      ],
      "Get up": [
        "Stand up"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-fight-week-open-workouts",
    "lane": "ufc-official-open-workout-demonstrations",
    "prompt": "Name something a UFC fighter might demonstrate at an open workout for fans.",
    "kind": "other",
    "ranked": "Shadowboxing|Punching pads|Kicking pads|Footwork|Wrestling drills|Light sparring|Stretching|Posing for crowd",
    "extras": "Submission movements|Speed drills|Bag work|Jump rope|Defensive slips|Combination punches|Warm-up|Meet fans",
    "aliases": {
      "Punching pads": [
        "Pad work"
      ],
      "Kicking pads": [
        "Kick pads"
      ],
      "Footwork": [
        "Movement"
      ],
      "Shadowboxing": [
        "Shadow box"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-striking-feints",
    "lane": "mma-uses-of-fighting-feints",
    "prompt": "Name a reason a UFC fighter might use a feint instead of throwing a real strike.",
    "kind": "other",
    "ranked": "Draw a reaction|Set up punch|Open a takedown|Create an opening|Disguise next move|Test opponent's defense|Control distance|Make opponent hesitate",
    "extras": "Freeze opponent|Set up kick|Interrupt rhythm|Hide attack|Bait counter|Make defense drop|Learn tendencies",
    "aliases": {
      "Draw a reaction": [
        "Get a reaction"
      ],
      "Set up punch": [
        "Set up a strike"
      ],
      "Disguise next move": [
        "Deceive opponent"
      ],
      "Make opponent hesitate": [
        "Hesitation"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-takedown-warning",
    "lane": "mma-takedown-setup-signals",
    "prompt": "Name a sign that a UFC fighter may be setting up a takedown.",
    "kind": "other",
    "ranked": "Level change|Reaches for legs|Closes distance|Body lock|Moves to clinch|Drives forward|Drops head level|Tries underhook",
    "extras": "Shoots double-leg|Fake punch then shoot|Grabs wrist|Changes stance|Gets opponent to fence|Ducks under punch|Steps inside",
    "aliases": {
      "Level change": [
        "Changes levels"
      ],
      "Reaches for legs": [
        "Grabs legs"
      ],
      "Body lock": [
        "Locks body"
      ],
      "Moves to clinch": [
        "Clinch"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-anti-takedown",
    "lane": "mma-takedown-defense-after-shot",
    "prompt": "Name something a UFC fighter might do when an opponent shoots for a takedown.",
    "kind": "other",
    "ranked": "Sprawl|Defend hips|Use underhooks|Whizzer|Crossface|Move feet back|Frame opponent|Circle away",
    "extras": "Fight hands|Back into fence|Switch hips|Stuff head|Post on mat|Hip pressure|Break grip|Reshoot",
    "aliases": {
      "Sprawl": [
        "Sprawling"
      ],
      "Whizzer": [
        "Overhook"
      ],
      "Use underhooks": [
        "Underhook"
      ],
      "Move feet back": [
        "Kick legs back"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-clinch-offense",
    "lane": "mma-clinch-offensive-options",
    "prompt": "Name an offensive move a UFC fighter might attempt while in the clinch.",
    "kind": "other",
    "ranked": "Knee strike|Elbow strike|Dirty boxing|Trip|Takedown|Body lock|Foot sweep|Uppercut",
    "extras": "Short hook|Shoulder strike|Inside trip|Outside trip|Push to fence|Snap down|Hip throw",
    "aliases": {
      "Knee strike": [
        "Knee"
      ],
      "Elbow strike": [
        "Elbow"
      ],
      "Dirty boxing": [
        "Short punches"
      ],
      "Foot sweep": [
        "Sweep"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-top-control",
    "lane": "mma-dominant-top-position-offense",
    "prompt": "Name something a UFC fighter might do after securing a dominant top position.",
    "kind": "other",
    "ranked": "Throw punches|Land elbows|Pass guard|Look for armbar|Attempt choke|Control hips|Take back|Pin opponent",
    "extras": "Posture up|Set up submission|Strike body|Keep pressure|Mount opponent|Advance position|Trap opponent's arm",
    "aliases": {
      "Throw punches": [
        "Ground punches"
      ],
      "Land elbows": [
        "Elbows"
      ],
      "Look for armbar": [
        "Armbar"
      ],
      "Attempt choke": [
        "Choke"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-altitude-training",
    "lane": "mma-fight-card-altitude-prep",
    "prompt": "Name something a UFC fighter might adjust before competing at high altitude.",
    "kind": "other",
    "ranked": "Arrive earlier|Train cardio|Improve breathing|Plan acclimatization|Adjust pace|Monitor hydration|Rest more|Do altitude training",
    "extras": "Simulate conditions|Limit hard effort initially|Discuss with coach|Travel ahead|Prepare conditioning|Manage recovery|Adjust round strategy",
    "aliases": {
      "Arrive earlier": [
        "Arrive early"
      ],
      "Train cardio": [
        "Cardio"
      ],
      "Improve breathing": [
        "Breathing"
      ],
      "Adjust pace": [
        "Pacing"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-international-entry",
    "lane": "ufc-international-fight-travel-essentials",
    "prompt": "Name an administrative or travel detail a UFC fighter must plan for when competing overseas.",
    "kind": "other",
    "ranked": "Passport|Visa|Flight booking|Hotel|Equipment transport|Local transportation|Time-zone change|Travel documents",
    "extras": "Customs|Work permit|Medical paperwork|Corner travel|Coach itinerary|Connecting flights|Entry requirements|Training space",
    "aliases": {
      "Passport": [
        "Valid passport"
      ],
      "Visa": [
        "Work visa"
      ],
      "Flight booking": [
        "Plane tickets"
      ],
      "Hotel": [
        "Accommodation"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-cutman-actions",
    "lane": "ufc-cutman-between-rounds-tasks",
    "prompt": "Name something a cutman might do when treating a UFC fighter between rounds.",
    "kind": "other",
    "ranked": "Apply cold enswell|Stop bleeding|Treat cut|Use petroleum jelly|Swab wound|Apply pressure|Check swelling|Clean blood",
    "extras": "Ice swelling|Use gauze|Inspect facial cut|Wipe sweat|Help seal wound|Communicate injury|Look for bleeding",
    "aliases": {
      "Apply cold enswell": [
        "Enswell"
      ],
      "Stop bleeding": [
        "Control blood"
      ],
      "Treat cut": [
        "Cut treatment"
      ],
      "Use petroleum jelly": [
        "Vaseline"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-cage-inspection",
    "lane": "ufc-cage-safety-checks",
    "prompt": "Name something officials or crew might inspect inside the Octagon before a UFC bout.",
    "kind": "other",
    "ranked": "Canvas|Cage door|Fence|Floor padding|Corner posts|Mat condition|Visible debris|Glove tape",
    "extras": "Fence tension|Damaged padding|Slippery spots|Cage corners|Lighting|Entry gate|Loose equipment|Blood on mat",
    "aliases": {
      "Canvas": [
        "Mat"
      ],
      "Fence": [
        "Cage wall"
      ],
      "Cage door": [
        "Door"
      ],
      "Visible debris": [
        "Debris"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-split-decision-arguments",
    "lane": "ufc-why-fans-see-close-fight-differently",
    "prompt": "Name a reason UFC viewers might disagree about who won a close decision.",
    "kind": "other",
    "ranked": "Damage versus control|Close rounds|Takedown value|Significant strikes|Cage control|Submission attempts|Late knockdowns|Different scoring views",
    "extras": "Ground time|More total strikes|Aggression|Judges' angle|Round-by-round scoring|Close exchanges|Near finishes",
    "aliases": {
      "Close rounds": [
        "Close round"
      ],
      "Takedown value": [
        "Wrestling"
      ],
      "Significant strikes": [
        "Clean strikes"
      ],
      "Cage control": [
        "Octagon control"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-fight-bonus-reasons",
    "lane": "ufc-memorable-fight-of-night-features",
    "prompt": "Name something that might make a UFC bout a fan favorite for Fight of the Night.",
    "kind": "other",
    "ranked": "Back-and-forth action|Big knockdowns|Exciting finish|Both fighters tough|Nonstop pace|Dramatic comeback|High stakes|Close competition",
    "extras": "Wild exchanges|Heart|Near submissions|Last-second finish|Five-round battle|Surprise upset|Huge crowd reaction|Technical skills",
    "aliases": {
      "Back-and-forth action": [
        "Back and forth"
      ],
      "Big knockdowns": [
        "Knockdowns"
      ],
      "Dramatic comeback": [
        "Comeback"
      ],
      "Nonstop pace": [
        "Fast pace"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-postfight-medical-exam",
    "lane": "ufc-immediate-postfight-health-checks",
    "prompt": "Name something a cage-side doctor might check after a UFC fight.",
    "kind": "other",
    "ranked": "Cuts|Concussion signs|Eyes|Broken bones|Breathing|Swelling|Balance|Blood pressure",
    "extras": "Facial injury|Vision|Joint pain|Bleeding|Neck pain|Dizziness|Heart rate|Hand injury",
    "aliases": {
      "Cuts": [
        "Lacerations"
      ],
      "Concussion signs": [
        "Head injury"
      ],
      "Eyes": [
        "Vision"
      ],
      "Breathing": [
        "Respiration"
      ]
    }
  },
  {
    "id": "ufc-v2-fast10-ppv-event-hype",
    "lane": "ufc-championship-matchup-fan-excitement",
    "prompt": "Name something that can make a UFC title-fight matchup especially exciting to fans.",
    "kind": "other",
    "ranked": "Rivalry|Undefeated challenger|Great fighting styles|Rematch|Historic stakes|Big-name champion|Underdog story|Trash talk",
    "extras": "Championship on line|Record chase|Different styles|Bad blood|Famous fighters|Possible upset|Fans invested|Title unification",
    "aliases": {
      "Rivalry": [
        "Bad blood"
      ],
      "Rematch": [
        "Second fight"
      ],
      "Historic stakes": [
        "History"
      ],
      "Underdog story": [
        "Underdog"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_FAST_BATCH10 = makeUfcFeudDraft(ROWS);
