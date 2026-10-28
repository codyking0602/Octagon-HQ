import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Review-only genuinely different, easy Fast concepts; not five paraphrases. */
const ROWS = [
  {
    "id": "ufc-v2-fast-weighin-actions",
    "lane": "ceremonial-weighins",
    "prompt": "Name something a fighter might do at a UFC ceremonial weigh-in.",
    "kind": "other",
    "ranked": "Step on the scale|Face off with opponent|Pose for photos|Raise fists|Flex for the crowd|Wave to fans|Shake hands|Talk trash",
    "extras": "Stare down opponent|Smile|Point at opponent|Wear a flag|Show off a belt|Bow|Clap|Give a thumbs-up|Turn around for cameras|Speak into microphone|Take off shoes|Raise arms",
    "aliases": {
      "Step on the scale": [
        "Weigh in",
        "Get weighed"
      ],
      "Face off with opponent": [
        "Faceoff",
        "Staredown"
      ],
      "Pose for photos": [
        "Pose",
        "Picture"
      ],
      "Talk trash": [
        "Trash talk"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-practice-gear",
    "lane": "training-equipment",
    "prompt": "Name a piece of equipment MMA fighters use in training.",
    "kind": "other",
    "ranked": "Heavy bag|Boxing gloves|Focus mitts|Jump rope|Wrestling mat|Shin guards|Headgear|Punching pads",
    "extras": "Grappling dummy|Speed bag|Medicine ball|Kettlebell|Resistance bands|Treadmill|Stationary bike|Hand wraps|Mouthguard|Timer|Weightlifting bar|Foam roller",
    "aliases": {
      "Heavy bag": [
        "Punching bag"
      ],
      "Focus mitts": [
        "Mitts"
      ],
      "Jump rope": [
        "Skipping rope"
      ],
      "Wrestling mat": [
        "Mat"
      ],
      "Punching pads": [
        "Thai pads",
        "Kick pads"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-watch-party",
    "lane": "fight-watch-party",
    "prompt": "Name something you might find at a UFC watch party.",
    "kind": "other",
    "ranked": "Television|Pizza|Friends|Drinks|Wings|Couch|Snacks|UFC fans",
    "extras": "Big screen|Nachos|Popcorn|Chips|Beer|Soda|Team shirts|Streaming subscription|Remote control|Speakers|Chairs|Fighter posters|Cell phones|Family|Fight predictions",
    "aliases": {
      "Television": [
        "TV",
        "Big TV",
        "Screen"
      ],
      "Drinks": [
        "Beverages"
      ],
      "UFC fans": [
        "Fans"
      ],
      "Friends": [
        "Guests"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-merchandise",
    "lane": "ufc-merchandise",
    "prompt": "Name something a UFC fan might buy at a live event.",
    "kind": "other",
    "ranked": "Fighter T-shirt|Hat|Food|Drink|Event poster|Hoodie|Replica gloves|Souvenir",
    "extras": "Program|Autographed photo|Keychain|Lanyard|Wristband|Jacket|Replica belt|Water bottle|Sticker|Collectible|Trading card|Snacks",
    "aliases": {
      "Fighter T-shirt": [
        "Tshirt",
        "T shirt",
        "Shirt"
      ],
      "Hat": [
        "Cap"
      ],
      "Drink": [
        "Beverage"
      ],
      "Event poster": [
        "Poster"
      ],
      "Souvenir": [
        "Memorabilia"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-fight-sounds",
    "lane": "octagon-sounds",
    "prompt": "Name something you might hear during a UFC fight.",
    "kind": "other",
    "ranked": "Crowd cheering|Commentators talking|Referee instructions|Corner shouting|Round horn|Crowd booing|Fans chanting|Punches landing",
    "extras": "Fighter grunting|Applause|Announcer|Coaches yelling|Warning from referee|Music|Gasp from crowd|Crowd screaming|Bell|Stadium noise",
    "aliases": {
      "Round horn": [
        "Horn",
        "End of round buzzer"
      ],
      "Crowd cheering": [
        "Cheering",
        "Fans cheering"
      ],
      "Commentators talking": [
        "Commentary"
      ],
      "Corner shouting": [
        "Coaches shouting"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-faceoff-gestures",
    "lane": "ufc-faceoff",
    "prompt": "Name something fighters sometimes do during a UFC faceoff.",
    "kind": "other",
    "ranked": "Stare at each other|Stand nose to nose|Raise fists|Talk trash|Smile|Shake hands|Point at opponent|Pose for cameras",
    "extras": "Flex|Push|Look away|Laugh|Wave to fans|Clap|Make a gesture|Nod|Wear sunglasses|Hold championship belt|Bow|Clench fists|Turn sideways",
    "aliases": {
      "Stare at each other": [
        "Staredown"
      ],
      "Stand nose to nose": [
        "Get face to face"
      ],
      "Talk trash": [
        "Trash talk"
      ],
      "Pose for cameras": [
        "Pose",
        "Take pictures"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-press-room",
    "lane": "ufc-press-conferences",
    "prompt": "Name something you might see at a UFC press conference.",
    "kind": "other",
    "ranked": "Microphones|Fighters|Reporters|Cameras|UFC logo backdrop|Journalists asking questions|Table|Championship belt",
    "extras": "Chairs|Water bottles|Photographers|Security|Sponsor logos|Dana White|Interviewer|Lights|Notebooks|Nameplates|Media badges|Translators|Headphones|Television crew|Phones",
    "aliases": {
      "UFC logo backdrop": [
        "UFC banner",
        "Backdrop"
      ],
      "Journalists asking questions": [
        "Questions",
        "Media questions"
      ],
      "Championship belt": [
        "Belt"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-corner-gear",
    "lane": "ufc-corner-equipment",
    "prompt": "Name an item a UFC fighter's corner might use between rounds.",
    "kind": "other",
    "ranked": "Water bottle|Towel|Ice bag|Stool|Vaseline|Gauze|Cotton swab|Cold metal swelling tool",
    "extras": "Bucket|Medical tape|Scissors|Gloves|Sponge|Cutman supplies|Paper towels|Cup",
    "aliases": {
      "Cold metal swelling tool": [
        "Enswell",
        "End swell",
        "Swelling iron"
      ],
      "Vaseline": [
        "Petroleum jelly"
      ],
      "Ice bag": [
        "Ice",
        "Ice pack"
      ],
      "Gauze": [
        "Bandage"
      ],
      "Cotton swab": [
        "Swab"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-training-sites",
    "lane": "mma-training-spaces",
    "prompt": "Name a place UFC fighters might train.",
    "kind": "other",
    "ranked": "MMA gym|Boxing gym|Wrestling room|Weight room|Training cage|Jiu-jitsu academy|Running track|Swimming pool",
    "extras": "Kickboxing gym|Martial arts studio|Park|Beach|Road|Hill|Fitness center|Home gym|Outdoor field|Training camp|Sports performance center|School gym|Dojo",
    "aliases": {
      "MMA gym": [
        "Gym"
      ],
      "Jiu-jitsu academy": [
        "BJJ gym"
      ],
      "Training cage": [
        "Octagon",
        "Cage"
      ],
      "Swimming pool": [
        "Pool"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-training-sessions",
    "lane": "mma-training-activities",
    "prompt": "Name a workout or training activity UFC fighters regularly practice.",
    "kind": "other",
    "ranked": "Sparring|Running|Lifting weights|Wrestling drills|Pad work|Jiu-jitsu practice|Jump rope|Bag work",
    "extras": "Swimming|Cycling|Shadowboxing|Stretching|Kickboxing|Boxing drills|Muay Thai|Conditioning|Sprint intervals|Hill sprints|Yoga|Technical drilling|Cardio|Footwork drills",
    "aliases": {
      "Lifting weights": [
        "Weight lifting",
        "Strength training"
      ],
      "Pad work": [
        "Hit mitts",
        "Mitts"
      ],
      "Bag work": [
        "Punch heavy bag"
      ],
      "Running": [
        "Jogging"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-walkout-attire",
    "lane": "mma-walkout-clothes",
    "prompt": "Name something a UFC fighter might wear or carry during their walkout.",
    "kind": "other",
    "ranked": "Fighter shorts|Walkout shirt|Hoodie|Country flag|Hat|Sneakers|Headphones|Sunglasses",
    "extras": "Jacket|Track pants|Team uniform|Warmup top|Mouthguard|Gloves|Cape|Championship belt|Chain|Robe|Flag draped over shoulders",
    "aliases": {
      "Country flag": [
        "Flag"
      ],
      "Walkout shirt": [
        "T-shirt",
        "Shirt"
      ],
      "Sneakers": [
        "Shoes"
      ],
      "Hoodie": [
        "Sweatshirt"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-victory-actions",
    "lane": "post-win-actions",
    "prompt": "Name something a UFC fighter might do right after winning.",
    "kind": "other",
    "ranked": "Raise both arms|Hug teammates|Celebrate in the cage|Shake opponent's hand|Cry with joy|Talk to interviewer|Wave to crowd|Point to the fans",
    "extras": "Call out next opponent|Put on championship belt|Thank coaches|Pray|Kneel|Bow|Fist pump|Dance|Jump up|Climb cage|Smile|Celebrate with family|Do a backflip|Take a photo|Run around",
    "aliases": {
      "Raise both arms": [
        "Raise arms",
        "Hands up"
      ],
      "Hug teammates": [
        "Hug coaches",
        "Hug team"
      ],
      "Shake opponent's hand": [
        "Shake hands"
      ],
      "Talk to interviewer": [
        "Give interview"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-tv-graphics",
    "lane": "ufc-tv-graphics",
    "prompt": "Name something you might see in UFC's on-screen fight graphics.",
    "kind": "other",
    "ranked": "Round clock|Fighter names|Fighter records|Weight class|Country flags|Round number|Significant strikes|Betting odds",
    "extras": "Height|Reach|Age|Rankings|Event name|UFC logo|Takedowns|Control time|Fight date|Fighter pictures|Fight statistics|Sponsored graphic|PPV logo",
    "aliases": {
      "Round clock": [
        "Fight clock",
        "Timer",
        "Clock"
      ],
      "Country flags": [
        "Flags"
      ],
      "Significant strikes": [
        "Sig strikes"
      ],
      "Fighter records": [
        "Win loss record"
      ],
      "Betting odds": [
        "Odds"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-event-workers",
    "lane": "ufc-event-jobs",
    "prompt": "Name a job someone might have working at a UFC event, other than fighting.",
    "kind": "other",
    "ranked": "Referee|Judge|Ring announcer|Commentator|Coach|Cutman|Camera operator|Security guard",
    "extras": "Doctor|Medic|Production crew|Timekeeper|Translator|Photographer|Interviewer|Official|UFC staff|Promoter|Ticket taker|Lighting crew|Event coordinator|Scorekeeper|Reporter",
    "aliases": {
      "Ring announcer": [
        "Announcer"
      ],
      "Camera operator": [
        "Cameraman"
      ],
      "Commentator": [
        "Analyst"
      ],
      "Referee": [
        "Ref"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-locker-prep",
    "lane": "fighter-locker-room",
    "prompt": "Name something a UFC fighter might do in the locker room before walking out.",
    "kind": "other",
    "ranked": "Warm up|Stretch|Shadowbox|Hit pads|Talk to coaches|Listen to music|Pray|Drink water",
    "extras": "Wrap hands|Check equipment|Put on gloves|Visualize fight|Breathe deeply|Walk around|Get a massage|Get taped up|Review game plan|Eat a snack|Use bathroom|Meditate|Focus",
    "aliases": {
      "Warm up": [
        "Warmup"
      ],
      "Hit pads": [
        "Hit mitts"
      ],
      "Drink water": [
        "Hydrate"
      ],
      "Shadowbox": [
        "Shadow boxing"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-retired-careers",
    "lane": "ufc-postcareer-jobs",
    "prompt": "Name a job a retired UFC fighter might do after leaving the cage.",
    "kind": "other",
    "ranked": "MMA coach|TV analyst|Gym owner|Podcast host|Commentator|Referee|Promoter|Sports broadcaster",
    "extras": "Trainer|YouTuber|Business owner|Actor|Author|Manager|Journalist|Athlete manager|Judge|Public speaker|Brand ambassador|Instructor|Scout|Fighter mentor|Entrepreneur",
    "aliases": {
      "TV analyst": [
        "Analyst"
      ],
      "MMA coach": [
        "Coach"
      ],
      "Podcast host": [
        "Podcaster"
      ],
      "Sports broadcaster": [
        "Broadcaster"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-event-poster",
    "lane": "ufc-fight-posters",
    "prompt": "Name something you would expect to see on a UFC fight poster.",
    "kind": "other",
    "ranked": "Fighter photographs|UFC logo|Main event names|Event date|Arena or city|Event number|Fight card title|Sponsor logo",
    "extras": "Start time|Ticket information|Country flag|Promotional tagline|Fight Night name|Broadcast partner|PPV information|Website|Championship belt|Weight class|Social-media handle|Event branding",
    "aliases": {
      "Fighter photographs": [
        "Fighter photos"
      ],
      "Event date": [
        "Date"
      ],
      "Arena or city": [
        "Venue",
        "Location"
      ],
      "Main event names": [
        "Fighter names"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-recovery",
    "lane": "fighter-recovery",
    "prompt": "Name something an MMA fighter might do to recover after training.",
    "kind": "other",
    "ranked": "Sleep|Stretch|Drink water|Eat a meal|Take an ice bath|Get a massage|Rest|Use a foam roller",
    "extras": "See physiotherapist|Cool down|Sauna|Shower|Have protein shake|Meditate|Walk|Compression boots|Elevate legs|Use heat pack|Take a nap|Physical therapy|Take a day off",
    "aliases": {
      "Drink water": [
        "Hydrate"
      ],
      "Use a foam roller": [
        "Foam roll"
      ],
      "Get a massage": [
        "Massage"
      ],
      "Rest": [
        "Rest day"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-prefight-talk",
    "lane": "ufc-prefight-commentary",
    "prompt": "Name something commentators might mention before a UFC fight.",
    "kind": "other",
    "ranked": "Fighter record|Fighter rankings|Reach|Height|Recent wins|Fighting style|Betting odds|Training camp",
    "extras": "Age|Hometown|Previous opponent|Knockout power|Wrestling|Finishing rate|Weight class|Previous injuries|Title defenses|Submission wins|Last fight|Weight|Experience|Southpaw stance|Win streak",
    "aliases": {
      "Fighter record": [
        "Win loss record"
      ],
      "Fighter rankings": [
        "Ranking"
      ],
      "Recent wins": [
        "Recent fights"
      ],
      "Betting odds": [
        "Odds"
      ]
    }
  },
  {
    "id": "ufc-v2-fast-follow-results",
    "lane": "ufc-results-media",
    "prompt": "Name a way UFC fans could follow a fight's result without watching it live.",
    "kind": "other",
    "ranked": "Check UFC website|Check sports app|Read news article|Look at social media|Get a text from a friend|Watch highlights later|Listen to a podcast|Search for scores",
    "extras": "Read ESPN|Check MMA news site|Look at UFC app|Check X|Watch YouTube replay|Talk with friends|Read fight recap|Follow live blog|Get push notification|Read newspaper|Listen to sports news|Search Google",
    "aliases": {
      "Check UFC website": [
        "UFC website"
      ],
      "Check sports app": [
        "Sports app",
        "UFC app"
      ],
      "Read news article": [
        "Read recap"
      ],
      "Look at social media": [
        "Social media",
        "X",
        "Twitter",
        "Instagram"
      ],
      "Search for scores": [
        "Google scores"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_FAST_DRAFT = makeUfcFeudDraft(ROWS);
