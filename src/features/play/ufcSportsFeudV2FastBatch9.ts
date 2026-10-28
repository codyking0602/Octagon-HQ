import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Editorial candidates: 20 quick, specific fight-night and fight-week situations. Not approved or live. */
const ROWS = [
  {
    "id": "ufc-v2-fast9-prelim-reasons",
    "lane": "ufc-fan-prelim-motivations",
    "prompt": "Name a reason a UFC fan might tune in for the early prelims instead of only the main event.",
    "kind": "other",
    "ranked": "Discover new fighters|See more fights|Support hometown fighter|Watch prospects|Catch every finish|Value of full card|Watch favorite gym teammate|See UFC debuts",
    "extras": "Find future champions|Follow fantasy picks|Enjoy undercard|See short-notice fighters|Scout rising stars",
    "aliases": {
      "Discover new fighters": [
        "Find new fighters"
      ],
      "See more fights": [
        "More fights"
      ],
      "Watch prospects": [
        "Prospects"
      ],
      "See UFC debuts": [
        "Debuts"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-ppv-home-prep",
    "lane": "ufc-home-pay-per-view-preparation",
    "prompt": "Name something a UFC fan might do before buying and starting a pay-per-view at home.",
    "kind": "other",
    "ranked": "Check internet|Log in to service|Confirm start time|Set up television|Invite friends|Prepare snacks|Check payment method|Test sound",
    "extras": "Update app|Charge remote|Find fight card|Connect speakers|Confirm price|Clear calendar|Cast to TV|Prepare couch",
    "aliases": {
      "Check internet": [
        "Test Wi-Fi",
        "Check WiFi"
      ],
      "Log in to service": [
        "Sign in"
      ],
      "Prepare snacks": [
        "Make food"
      ],
      "Confirm start time": [
        "Check time"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-five-round-challenges",
    "lane": "ufc-five-round-fight-challenges",
    "prompt": "Name something that becomes harder for a UFC fighter in rounds four and five.",
    "kind": "other",
    "ranked": "Keeping stamina|Avoiding fatigue|Following game plan|Staying mentally focused|Defending takedowns|Keeping hands up|Managing injuries|Maintaining pace",
    "extras": "Preserving power|Dealing with cuts|Avoiding mistakes|Controlling breathing|Sustaining output|Listening to corner",
    "aliases": {
      "Keeping stamina": [
        "Cardio",
        "Endurance"
      ],
      "Avoiding fatigue": [
        "Getting tired"
      ],
      "Maintaining pace": [
        "Pace"
      ],
      "Staying mentally focused": [
        "Focus"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-fighter-rules-meeting",
    "lane": "ufc-fighter-rules-meeting-agenda",
    "prompt": "Name something fighters might discuss at their pre-fight rules meeting with an official.",
    "kind": "other",
    "ranked": "Illegal strikes|Eye pokes|Groin shots|Glove touch|Cage grabbing|Stopping when told|Mouthguard issues|Tapping to submit",
    "extras": "Headbutts|Back-of-head strikes|Stalling|Time-outs|Point deductions|Referee commands|Low blows|Hair pulling",
    "aliases": {
      "Illegal strikes": [
        "Fouls"
      ],
      "Eye pokes": [
        "Eye gouges"
      ],
      "Groin shots": [
        "Low blows"
      ],
      "Cage grabbing": [
        "Grabbing fence"
      ],
      "Tapping to submit": [
        "Tap out"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-event-site-update",
    "lane": "ufc-event-change-fan-notifications",
    "prompt": "Name something on a UFC fight card that could change between ticket purchase and fight night.",
    "kind": "other",
    "ranked": "Main event|Opponent|Fight order|Start time|Number of bouts|Weight class|Broadcast slot|Venue",
    "extras": "Replacement fighter|Co-main event|Prelims|Canceled bout|Matchup|Walkout timing|Official weigh-in results",
    "aliases": {
      "Main event": [
        "Headliner"
      ],
      "Opponent": [
        "Fighter replacement"
      ],
      "Fight order": [
        "Bout order"
      ],
      "Number of bouts": [
        "Fight count"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-postfight-reporter",
    "lane": "ufc-postfight-media-questions",
    "prompt": "Name a question reporters often ask UFC fighters after a win.",
    "kind": "other",
    "ranked": "Who do you want next?|How does the win feel?|What was your game plan?|Were you hurt?|What comes next?|How was training camp?|Did the finish surprise you?|Do you want a title shot?",
    "extras": "Did you expect that?|Who helped you prepare?|What did your corner say?|Will you fight again soon?|Was the cut serious?|Did you see the scorecards?",
    "aliases": {
      "Who do you want next?": [
        "Callout",
        "Next opponent"
      ],
      "How does the win feel?": [
        "How do you feel"
      ],
      "What comes next?": [
        "Next fight"
      ],
      "Do you want a title shot?": [
        "Title shot"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-missed-weight-outcomes",
    "lane": "ufc-missed-weight-bout-consequences",
    "prompt": "Name something that can happen when a UFC fighter misses weight.",
    "kind": "other",
    "ranked": "Pay a purse penalty|Opponent may refuse fight|Fight becomes catchweight|Lose title eligibility|Fight may be canceled|More negotiations|Opponent receives extra pay|Commission gets involved",
    "extras": "Must re-weigh|Revised contract|Event card changes|Opponent can accept overweight fighter|No championship belt|Additional medical review",
    "aliases": {
      "Pay a purse penalty": [
        "Fine",
        "Lose purse percentage"
      ],
      "Fight becomes catchweight": [
        "Catchweight"
      ],
      "Fight may be canceled": [
        "Fight canceled"
      ],
      "Opponent receives extra pay": [
        "Opponent gets purse percentage"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-final-staredown-fans",
    "lane": "ufc-staredown-audience-observations",
    "prompt": "Name something UFC fans might look for during a final faceoff at weigh-ins.",
    "kind": "other",
    "ranked": "Height difference|Eye contact|Trash talk|Who looks confident|Reach difference|Body language|Who backs away|Respect between fighters",
    "extras": "Smiling|Facial expressions|Tension|Handshake|Size difference|Who is bigger|Eye movements|Crowd response",
    "aliases": {
      "Eye contact": [
        "Stare down",
        "Staredown"
      ],
      "Body language": [
        "Posture"
      ],
      "Height difference": [
        "Height"
      ],
      "Trash talk": [
        "Talking trash"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-judges-effective-grappling",
    "lane": "ufc-judges-effective-grappling",
    "prompt": "Name a grappling action a UFC judge might consider when scoring effective offense.",
    "kind": "other",
    "ranked": "Near submission|Successful takedown|Advancing position|Ground strikes|Back control|Creating submission threat|Dominant top offense|Escaping to attack",
    "extras": "Hard elbows on ground|Positional reversal|Mount and strikes|Passing guard|Attacking from bottom|Control with offense|Submission chain",
    "aliases": {
      "Near submission": [
        "Submission attempt"
      ],
      "Ground strikes": [
        "Ground and pound",
        "Ground-and-pound"
      ],
      "Advancing position": [
        "Position advancement"
      ],
      "Dominant top offense": [
        "Effective ground offense"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-ufc-video-game-modes",
    "lane": "ufc-video-game-play-modes",
    "prompt": "Name a way a fan can play or practice in an EA SPORTS UFC video game.",
    "kind": "other",
    "ranked": "Career mode|Online match|Quick fight|Tournament|Training|Practice mode|Local multiplayer|Create a fighter",
    "extras": "Ranked championships|Fight week challenge|Against computer|Custom fight|Learn moves|Online career|Stand-up mode",
    "aliases": {
      "Career mode": [
        "Career"
      ],
      "Online match": [
        "Online multiplayer"
      ],
      "Quick fight": [
        "Quick play"
      ],
      "Local multiplayer": [
        "Two player"
      ],
      "Training": [
        "Tutorial"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-fighter-profile-content",
    "lane": "ufc-website-fighter-profile-info",
    "prompt": "Name a detail you might find on the UFC website's profile page for a fighter.",
    "kind": "other",
    "ranked": "Win-loss record|Height|Weight|Reach|Country|Nickname|Recent fights|Fight statistics",
    "extras": "Division|Stance|Age|Hometown|Bio|Upcoming fight|Photo|Knockout wins|Submission wins",
    "aliases": {
      "Win-loss record": [
        "Record"
      ],
      "Country": [
        "Nationality"
      ],
      "Fight statistics": [
        "Stats"
      ],
      "Recent fights": [
        "Fight history"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-crowd-chants",
    "lane": "ufc-arena-audience-chants",
    "prompt": "Name something UFC fans might chant during a live event.",
    "kind": "other",
    "ranked": "Fighter's name|USA|Let's go|Fight|Knock him out|Champion|One more round|Ole ole",
    "extras": "Hometown chant|Nickname|Let's go champ|Referee complaint|Boo|National team cheer|Finish him|UFC",
    "aliases": {
      "Fighter's name": [
        "Name"
      ],
      "Knock him out": [
        "KO him"
      ],
      "Let's go": [
        "Let's go fighter"
      ],
      "USA": [
        "U S A"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-live-arena-screens",
    "lane": "ufc-arena-videoboard-information",
    "prompt": "Name something shown on the big screens at a UFC arena between bouts.",
    "kind": "other",
    "ranked": "Fight replays|Upcoming fighters|Fight card|Sponsor ads|Crowd camera|Results|Countdown timer|Interviews",
    "extras": "Walkout videos|Highlight reel|Stats|Event schedule|Matchup graphic|Venue announcements|Title belt graphic",
    "aliases": {
      "Fight replays": [
        "Replays"
      ],
      "Upcoming fighters": [
        "Next fight"
      ],
      "Sponsor ads": [
        "Advertisements",
        "Ads"
      ],
      "Countdown timer": [
        "Countdown"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-sparring-week-cutback",
    "lane": "ufc-fight-week-training-taper",
    "prompt": "Name a reason a UFC fighter might train less intensely as fight night gets closer.",
    "kind": "other",
    "ranked": "Avoid injury|Save energy|Recover muscles|Keep weight under control|Stay sharp|Reduce soreness|Improve sleep|Focus on strategy",
    "extras": "Avoid cuts|Heal bruises|Lower fatigue|Rest joints|Prioritize mobility|Limit hard sparring",
    "aliases": {
      "Avoid injury": [
        "Injury prevention"
      ],
      "Save energy": [
        "Rest"
      ],
      "Stay sharp": [
        "Stay fresh"
      ],
      "Reduce soreness": [
        "Less soreness"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-title-belt-ceremony",
    "lane": "ufc-title-belt-presentation-steps",
    "prompt": "Name something that might happen immediately after a UFC championship bout ends.",
    "kind": "other",
    "ranked": "Champion announced|Belt placed on winner|Official result read|Interview|Fighter celebrates|Photos taken|Opponents congratulate|Crowd cheers",
    "extras": "New champion embraces corner|Corner lifts champion|Gloves raised|Title graphic on screen|Champion poses with belt|Commentary discusses win",
    "aliases": {
      "Belt placed on winner": [
        "Gets the belt",
        "Belt presentation"
      ],
      "Champion announced": [
        "Winner announced"
      ],
      "Photos taken": [
        "Pictures"
      ],
      "Interview": [
        "Post-fight interview"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-short-notice-decline",
    "lane": "ufc-fighter-short-notice-offer-constraints",
    "prompt": "Name a reason a UFC fighter might turn down a last-minute fight offer.",
    "kind": "other",
    "ranked": "Not in shape|Too little training time|Injured|Can't make weight|Bad matchup|Family commitment|Travel problem|Contract issue",
    "extras": "Not medically cleared|No visa|Recovery from last bout|Coach unavailable|Risk to ranking|Too far away|Already booked",
    "aliases": {
      "Not in shape": [
        "Out of shape"
      ],
      "Can't make weight": [
        "Weight cut"
      ],
      "Too little training time": [
        "Short camp"
      ],
      "Injured": [
        "Injury"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-post-weighin-rehydration",
    "lane": "ufc-after-weighin-refueling",
    "prompt": "Name something a fighter might do to recover safely after making weight.",
    "kind": "other",
    "ranked": "Drink fluids|Eat a meal|Replace electrolytes|Rest|Follow nutrition plan|Sleep|Check weight|Take small snacks",
    "extras": "Meet team physician|Sip sports drink|Stay hydrated|Eat carbohydrates|Rehydrate gradually|Avoid overdoing activity",
    "aliases": {
      "Drink fluids": [
        "Drink water",
        "Hydrate",
        "Rehydrate"
      ],
      "Replace electrolytes": [
        "Electrolytes"
      ],
      "Eat a meal": [
        "Eat food"
      ],
      "Sleep": [
        "Nap"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-5-round-fight-differences",
    "lane": "ufc-five-round-bout-distinguishing-features",
    "prompt": "Name something that changes when a UFC fight is scheduled for five rounds instead of three.",
    "kind": "other",
    "ranked": "Maximum fight time|Cardio demands|Pacing strategy|More corner breaks|Endurance importance|More scoring rounds|Training preparation|Late-round adjustments",
    "extras": "Possible round four|Possible round five|More opportunity for a comeback|Greater fatigue|Longer judging sample|More conditioning",
    "aliases": {
      "Maximum fight time": [
        "Duration",
        "Fight length"
      ],
      "Cardio demands": [
        "Cardio"
      ],
      "More corner breaks": [
        "Extra breaks"
      ],
      "More scoring rounds": [
        "Extra rounds"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-daily-training-log",
    "lane": "mma-fighter-training-log-entries",
    "prompt": "Name something a UFC fighter might record in a training journal.",
    "kind": "other",
    "ranked": "Weight|Sparring rounds|Workout duration|Running distance|Recovery|Injuries|Nutrition|Sleep",
    "extras": "Heart rate|Strength work|Skill practice|Coach notes|Fatigue|Fluid intake|Body composition|Session intensity",
    "aliases": {
      "Weight": [
        "Body weight"
      ],
      "Sparring rounds": [
        "Rounds"
      ],
      "Workout duration": [
        "Training time"
      ],
      "Sleep": [
        "Sleep hours"
      ]
    }
  },
  {
    "id": "ufc-v2-fast9-fan-ppv-rewatch",
    "lane": "ufc-why-fans-rewatch-full-events",
    "prompt": "Name a reason a UFC fan might rewatch a complete fight card after seeing it live.",
    "kind": "other",
    "ranked": "Study a favorite fight|Catch missed prelims|Review close decision|Enjoy knockout again|Show friends|Watch favorite fighter|Understand tactics|See an interview",
    "extras": "Check judging controversy|Revisit title fight|Hear commentary|Analyze submission|Celebrate a win|Find moments missed first time",
    "aliases": {
      "Study a favorite fight": [
        "Study fight"
      ],
      "Review close decision": [
        "Review scorecards"
      ],
      "Show friends": [
        "Share with friends"
      ],
      "Understand tactics": [
        "Fight analysis"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_FAST_BATCH9 = makeUfcFeudDraft(ROWS);
