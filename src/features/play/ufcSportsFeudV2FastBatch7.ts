import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Seventh UFC Fast Money editorial draft batch; intentionally NOT active. */
const ROWS = [
  {
    "id": "ufc-v2-fast7-retirement-reasons",
    "lane": "mma-fighter-retirement-reasons",
    "prompt": "Name a reason a UFC fighter might decide to retire.",
    "kind": "other",
    "ranked": "Age|Injuries|Family time|Health concerns|Losing streak|Financial security|Burnout|New career",
    "extras": "Repeated concussions|Chronic pain|Wanting to coach|Loss of motivation|Too many weight cuts|Contract changes|Long recovery|Personal priorities|Legacy|No longer enjoying fighting|Pursue business|Spending time with kids",
    "aliases": {
      "Age": [
        "Getting older"
      ],
      "Injuries": [
        "Injury"
      ],
      "Burnout": [
        "Tired of fighting"
      ],
      "New career": [
        "Career change"
      ],
      "Losing streak": [
        "Too many losses"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-unretire-reasons",
    "lane": "mma-fighter-comeback-motives",
    "prompt": "Name a reason a retired UFC fighter might consider returning to the Octagon.",
    "kind": "other",
    "ranked": "Miss competition|Money|Championship opportunity|Big-name opponent|One last fight|Healthy again|Unfinished business|Fan demand",
    "extras": "Rematch|New contract|Feeling young again|Prove critics wrong|Good matchup|Career legacy|Comeback story|New training team|Get a win|Major pay-per-view",
    "aliases": {
      "Miss competition": [
        "Miss fighting"
      ],
      "Money": [
        "Payday"
      ],
      "Big-name opponent": [
        "Superfight"
      ],
      "Healthy again": [
        "Recovered from injury"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-change-gym-reasons",
    "lane": "mma-fighter-gym-switch-reasons",
    "prompt": "Name a reason a UFC fighter might change training gyms.",
    "kind": "other",
    "ranked": "New coach|Better sparring partners|Move cities|Improve weak skill|Bad team relationship|Championship preparation|Better facilities|Fresh start",
    "extras": "New training style|More wrestling|More striking|Closer to family|Try new team|Coach left|More competition|Different game plan|Training camp changes|Better equipment|Travel",
    "aliases": {
      "New coach": [
        "Different coach"
      ],
      "Better sparring partners": [
        "Better teammates"
      ],
      "Fresh start": [
        "New environment"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-debut-nerves",
    "lane": "ufc-debut-fighter-pressures",
    "prompt": "Name something a fighter might be nervous about before their UFC debut.",
    "kind": "other",
    "ranked": "Losing|Big crowd|Getting knocked out|Live TV|Making weight|Fighting experienced opponent|Disappointing family|Bad performance",
    "extras": "Media attention|Sparring to real fight|New rules|First walkout|Fight night pressure|Getting hurt|Fans booing|Coach's expectations|Making a mistake|First UFC fight|High stakes|Sponsor pressure",
    "aliases": {
      "Big crowd": [
        "Crowd"
      ],
      "Live TV": [
        "Television cameras"
      ],
      "Making weight": [
        "Weight cut"
      ],
      "Losing": [
        "Lose fight"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-losing-lessons",
    "lane": "ufc-fighter-loss-takeaways",
    "prompt": "Name something a UFC fighter might decide to improve after losing a bout.",
    "kind": "other",
    "ranked": "Cardio|Takedown defense|Striking defense|Fight strategy|Ground game|Footwork|Weight cut|Mental focus",
    "extras": "Wrestling|Boxing|Submission defense|Sparring|Timing|Movement|Counterpunching|Recovery|Training camp|Conditioning|Speed|Strength|Aggression|Clinch work",
    "aliases": {
      "Cardio": [
        "Stamina"
      ],
      "Fight strategy": [
        "Game plan"
      ],
      "Mental focus": [
        "Mindset"
      ],
      "Ground game": [
        "Grappling"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-rematch-requests",
    "lane": "ufc-fighter-rematch-motivations",
    "prompt": "Name a reason a UFC fighter might ask for a rematch.",
    "kind": "other",
    "ranked": "Lost close decision|Controversial stoppage|Want title back|Unfinished rivalry|Early injury|Prove first fight was fluke|Money|Chance to avenge loss",
    "extras": "Bad judges|Knockout loss|Submission loss|First fight was competitive|Disputed foul|First fight ended in draw|Fan interest|Big event|Personal pride|New training|Legacy|Champion wants it",
    "aliases": {
      "Lost close decision": [
        "Close loss"
      ],
      "Controversial stoppage": [
        "Bad stoppage"
      ],
      "Want title back": [
        "Regain belt"
      ],
      "Unfinished rivalry": [
        "Rivalry"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-manager-discussions",
    "lane": "ufc-fighter-manager-negotiations",
    "prompt": "Name a topic UFC fighters might discuss with their managers.",
    "kind": "other",
    "ranked": "Next opponent|Fight purse|Contract|Sponsors|Title shot|Fight date|Media appearances|Travel arrangements",
    "extras": "Fight location|Negotiations|Training budget|Bonuses|Brand deals|Rematch|Opponent ranking|Promotion|Insurance|Taxes|Public relations|Social media opportunities|Agent fee|Pay-per-view",
    "aliases": {
      "Fight purse": [
        "Pay"
      ],
      "Contract": [
        "Fight contract"
      ],
      "Sponsors": [
        "Sponsorships"
      ],
      "Title shot": [
        "Championship opportunity"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-veteran-rookie-advice",
    "lane": "ufc-veteran-fighter-advice",
    "prompt": "Name advice a veteran UFC fighter might give a newcomer.",
    "kind": "other",
    "ranked": "Stay disciplined|Listen to coaches|Train hard|Manage weight|Save money|Ignore social media|Rest and recover|Stay humble",
    "extras": "Learn rules|Stay healthy|Choose good team|Build cardio|Prepare for media|Work on weaknesses|Don't rush|Be patient|Have good manager|Fight smart|Watch film|Respect opponents",
    "aliases": {
      "Stay disciplined": [
        "Discipline"
      ],
      "Manage weight": [
        "Make weight"
      ],
      "Save money": [
        "Financial planning"
      ],
      "Stay humble": [
        "Humility"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-locker-mental-prep",
    "lane": "ufc-fighter-mental-focus",
    "prompt": "Name something a fighter might do to mentally prepare just before a UFC walkout.",
    "kind": "other",
    "ranked": "Deep breathing|Visualize victory|Pray|Listen to music|Talk to coach|Meditate|Positive self-talk|Stay quiet",
    "extras": "Focus on game plan|Picture opponent|Stay calm|Stretch|Close eyes|Repeat mantra|Pep talk|Music with headphones|Review strategy|Control nerves|Relax|Take deep breaths",
    "aliases": {
      "Deep breathing": [
        "Breathing exercises"
      ],
      "Visualize victory": [
        "Visualization"
      ],
      "Positive self-talk": [
        "Affirmations"
      ],
      "Talk to coach": [
        "Coach pep talk"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-family-watch",
    "lane": "ufc-fighter-family-reactions",
    "prompt": "Name something a UFC fighter's family might do while watching their bout.",
    "kind": "other",
    "ranked": "Cheer|Pray|Clap|Stand up|Cover eyes|Yell encouragement|Celebrate|Cry",
    "extras": "Hug|Film fight|Take pictures|Worry|Hold hands|High five|Wave|Shout their name|Jump|Hug relatives|Get nervous|Feel relieved",
    "aliases": {
      "Cheer": [
        "Cheering"
      ],
      "Clap": [
        "Applaud"
      ],
      "Cry": [
        "Tear up"
      ],
      "Stand up": [
        "Get out of seat"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-doctor-no-clearance",
    "lane": "mma-prefight-medical-clearance-issues",
    "prompt": "Name a medical reason a doctor might not clear a fighter to compete.",
    "kind": "other",
    "ranked": "Concussion|Broken bone|Illness|Eye injury|Heart concern|Severe dehydration|Infection|Open wound",
    "extras": "Abnormal blood test|High fever|Head trauma|Unsafe weight cut|Severe swelling|Contagious illness|Recent surgery|Injured knee|Unhealed injury|Bad neurological exam|Vision problem|Severe illness",
    "aliases": {
      "Concussion": [
        "Head injury"
      ],
      "Broken bone": [
        "Fracture"
      ],
      "Illness": [
        "Sick"
      ],
      "Eye injury": [
        "Vision injury"
      ],
      "Severe dehydration": [
        "Dehydrated"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-big-card-promises",
    "lane": "ufc-pre-bout-promotion-claims",
    "prompt": "Name something a UFC fighter might promise fans before a big fight.",
    "kind": "other",
    "ranked": "Knockout|Submission|Victory|Exciting fight|New champion|Quick finish|Improved performance|Rematch win",
    "extras": "Finish early|First-round KO|Put on a show|Fight of the Night|Take belt home|Defend title|Win by decision|Upset opponent|Make fans proud|Be aggressive|Show skills|Prove doubters wrong",
    "aliases": {
      "Knockout": [
        "KO"
      ],
      "Quick finish": [
        "Early finish"
      ],
      "New champion": [
        "Win title"
      ],
      "Victory": [
        "Win"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-fight-card-change",
    "lane": "ufc-event-card-replacement-consequences",
    "prompt": "Name something that might happen to a UFC event if its main event is canceled.",
    "kind": "other",
    "ranked": "Co-main promoted|Replacement opponent|Fight postponed|New main event|Card reshuffled|Fight removed|Short-notice replacement|Updated advertisements",
    "extras": "New bout announced|Refund requests|Event still goes ahead|Fight rebooked|Fewer bouts|Catchweight fight|Ticket buyers notified|New broadcast promo|Rankings affected",
    "aliases": {
      "Co-main promoted": [
        "Co main becomes main"
      ],
      "Card reshuffled": [
        "Card changes"
      ],
      "New main event": [
        "Different headliner"
      ],
      "Fight postponed": [
        "Rescheduled fight"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-ufc-social-fan-actions",
    "lane": "ufc-live-fan-social-media-actions",
    "prompt": "Name something UFC fans might do on social media while watching live fights.",
    "kind": "other",
    "ranked": "Post reactions|Share highlights|Comment on fight|Vote in poll|Make memes|Discuss scorecards|Cheer for fighter|Predict winner",
    "extras": "Post stories|Retweet|Like posts|Post GIF|Tag fighter|Debate a decision|Talk in group chat|Share stats|Live-tweet|Post knockout clip|React to round|Join fan discussion|Use hashtag|Discuss betting odds",
    "aliases": {
      "Post reactions": [
        "React online"
      ],
      "Share highlights": [
        "Share clips"
      ],
      "Make memes": [
        "Post memes"
      ],
      "Predict winner": [
        "Make prediction"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-ufc-memory-shelf",
    "lane": "mma-fighter-trophy-shelf",
    "prompt": "Name something a UFC fighter might display as a career keepsake.",
    "kind": "other",
    "ranked": "Championship belt|Signed gloves|Fight poster|Award trophy|Medal|Fight photo|Fight shorts|Plaque",
    "extras": "UFC Hall of Fame award|Framed jersey|Title picture|Autographed ticket|Team photo|Championship certificate|Personal memorabilia|Scrapbook|Fight program|Ring|Signed gloves case|Championship banner",
    "aliases": {
      "Championship belt": [
        "UFC belt"
      ],
      "Signed gloves": [
        "Gloves"
      ],
      "Fight photo": [
        "Photograph"
      ],
      "Fight shorts": [
        "Shorts"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-ufc-fan-questions",
    "lane": "ufc-fan-search-queries",
    "prompt": "Name something a new UFC fan might search online about a fighter.",
    "kind": "other",
    "ranked": "Win-loss record|Next fight|Knockout highlights|Weight class|Age|Nickname|Rankings|Fight history",
    "extras": "Height|Reach|Gym|Nationality|Championships|Favorite fights|Past opponents|Fight style|Training camp|Social media|Fight purse|Injury history|Current title",
    "aliases": {
      "Win-loss record": [
        "Record"
      ],
      "Next fight": [
        "Next opponent"
      ],
      "Knockout highlights": [
        "Highlights"
      ],
      "Fight history": [
        "Previous fights"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-title-shot-discussions",
    "lane": "ufc-title-shot-criteria-factors",
    "prompt": "Name something UFC fans might consider when debating who deserves a title shot.",
    "kind": "other",
    "ranked": "Winning streak|Rankings|Recent victories|Quality of opponents|Former champion|Title eliminator win|Popularity|Injury availability",
    "extras": "Knockout wins|Past title defenses|Record|Head-to-head results|Fight activity|Big finish|Fan demand|Last opponent|Current champion|Division depth|Recent losses",
    "aliases": {
      "Winning streak": [
        "Win streak"
      ],
      "Rankings": [
        "Rank"
      ],
      "Popularity": [
        "Star power"
      ],
      "Recent victories": [
        "Wins"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-commentator-responsibilities",
    "lane": "ufc-fight-commentator-tasks",
    "prompt": "Name something a UFC commentator might do while calling a fight.",
    "kind": "other",
    "ranked": "Describe the action|Explain techniques|Read statistics|Discuss strategy|React to knockout|Identify fighter|Discuss scorecards|Provide fight history",
    "extras": "Talk about ranking|Explain submission|Discuss previous fights|Mention corner advice|Point out takedown|Call a strike|Describe replay|Discuss momentum|Explain rules|Talk about reach|Mention weight class|React to crowd",
    "aliases": {
      "Describe the action": [
        "Play by play"
      ],
      "Read statistics": [
        "Stats"
      ],
      "Discuss strategy": [
        "Fight analysis"
      ],
      "Provide fight history": [
        "Background"
      ]
    }
  },
  {
    "id": "ufc-v2-fast7-new-gym-first-day",
    "lane": "mma-gym-beginner-first-visit",
    "prompt": "Name something a beginner might do on their first day at an MMA gym.",
    "kind": "other",
    "ranked": "Sign waiver|Meet coach|Warm up|Learn stance|Borrow gloves|Try basic drills|Meet training partners|Ask questions",
    "extras": "Tour gym|Get class schedule|Learn safety rules|Practice footwork|Shadowbox|Learn to tap out|Change clothes|Put on mouthguard|Stretch|Pick a class|Try grappling|Observe sparring",
    "aliases": {
      "Sign waiver": [
        "Sign forms"
      ],
      "Meet coach": [
        "Introduce to coach"
      ],
      "Learn stance": [
        "Fighting stance"
      ],
      "Try basic drills": [
        "Beginner drills"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_FAST_BATCH7 = makeUfcFeudDraft(ROWS);
