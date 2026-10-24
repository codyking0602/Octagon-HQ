import { makeUfcFeudDraft, type UFCFeudDraftRow } from "./ufcSportsFeudV2DraftHelpers";
/** Editorial draft batch two; never imported by live Daily generation. */
const ROWS = [
  {
    "id": "ufc-v2-fast2-nicknames",
    "lane": "fighter-nicknames",
    "prompt": "Name a famous UFC fighter nickname.",
    "kind": "other",
    "ranked": "The Notorious|Bones|The Eagle|Blessed|Poatan|The Diamond|The Last Stylebender|Thug Rose",
    "extras": "Mighty Mouse|The Spider|The Predator|The Iceman|The Korean Zombie|The Lioness|El Cucuy|The Great|Gamebred|The Natural|The Count|Suga|Borz|Do Bronx|The Machine|The Highlight|El Matador|Bullet|The Reaper|Rampage|DC|The Nigerian Nightmare|No Love|The American Gangster|Rocky|Chaos|The Black Beast|The Mauler|Wonderboy|The Hangman|The Eraser|The Axe Murderer|The Nightmare|Ruthless|Cowboy|The Korean Superboy|The Assassin Baby|The Dominator|The Answer|The California Kid|The Gorilla|Big Nog",
    "aliases": {
      "The Notorious": [
        "Conor McGregor"
      ],
      "Bones": [
        "Jon Jones"
      ],
      "The Eagle": [
        "Khabib Nurmagomedov"
      ],
      "Blessed": [
        "Max Holloway"
      ],
      "Poatan": [
        "Alex Pereira"
      ],
      "The Diamond": [
        "Dustin Poirier"
      ],
      "The Last Stylebender": [
        "Israel Adesanya"
      ],
      "Thug Rose": [
        "Rose Namajunas"
      ],
      "Mighty Mouse": [
        "Demetrious Johnson"
      ],
      "The Spider": [
        "Anderson Silva"
      ],
      "The Predator": [
        "Francis Ngannou"
      ],
      "The Iceman": [
        "Chuck Liddell"
      ],
      "The Korean Zombie": [
        "Chan Sung Jung",
        "Korean Zombie"
      ],
      "The Lioness": [
        "Amanda Nunes"
      ],
      "El Cucuy": [
        "Tony Ferguson"
      ],
      "The Great": [
        "Alexander Volkanovski"
      ],
      "Gamebred": [
        "Jorge Masvidal"
      ],
      "The Natural": [
        "Randy Couture"
      ],
      "The Count": [
        "Michael Bisping"
      ],
      "Suga": [
        "Sean O'Malley",
        "Sugar Sean"
      ],
      "Borz": [
        "Khamzat Chimaev"
      ],
      "Do Bronx": [
        "Charles Oliveira"
      ],
      "The Machine": [
        "Merab Dvalishvili"
      ],
      "The Highlight": [
        "Justin Gaethje"
      ],
      "El Matador": [
        "Ilia Topuria",
        "Topuria"
      ],
      "Bullet": [
        "Valentina Shevchenko"
      ],
      "The Reaper": [
        "Robert Whittaker",
        "Bobby Knuckles"
      ],
      "Rampage": [
        "Quinton Jackson"
      ],
      "DC": [
        "Daniel Cormier"
      ],
      "The Nigerian Nightmare": [
        "Kamaru Usman"
      ],
      "No Love": [
        "Cody Garbrandt"
      ],
      "The American Gangster": [
        "Chael Sonnen"
      ],
      "Rocky": [
        "Leon Edwards"
      ],
      "Chaos": [
        "Colby Covington"
      ],
      "The Black Beast": [
        "Derrick Lewis"
      ],
      "The Mauler": [
        "Alexander Gustafsson"
      ],
      "Wonderboy": [
        "Stephen Thompson"
      ],
      "The Hangman": [
        "Dan Hooker"
      ],
      "The Eraser": [
        "Paulo Costa"
      ],
      "The Axe Murderer": [
        "Wanderlei Silva"
      ],
      "The Nightmare": [
        "Diego Sanchez"
      ],
      "Ruthless": [
        "Robbie Lawler"
      ],
      "Cowboy": [
        "Donald Cerrone"
      ],
      "The Korean Superboy": [
        "Doo Ho Choi"
      ],
      "The Assassin Baby": [
        "Brandon Moreno"
      ],
      "The Dominator": [
        "Dominick Cruz"
      ],
      "The Answer": [
        "Frankie Edgar"
      ],
      "The California Kid": [
        "Urijah Faber"
      ],
      "The Gorilla": [
        "Darren Till"
      ],
      "Big Nog": [
        "Antonio Rodrigo Nogueira"
      ]
    }
  },
  {
    "id": "ufc-v2-fast2-defensive-moves",
    "lane": "defensive-fight-movements",
    "prompt": "Name a defensive move a UFC fighter might use to avoid a strike or takedown.",
    "kind": "other",
    "ranked": "Block a punch|Slip a punch|Check a kick|Sprawl|Parry|Duck|Step backward|Clinch up",
    "extras": "Circle away|Catch a kick|Pivot away|Bob and weave|Roll with a punch|Cover up|Frame|Fight for underhooks|Move out of range|Lean backward|Shell up|Use head movement|Backpedal|Keep distance|Defend the takedown",
    "aliases": {
      "Block a punch": [
        "Block"
      ],
      "Slip a punch": [
        "Slip"
      ],
      "Step backward": [
        "Back up",
        "Step back"
      ],
      "Clinch up": [
        "Clinch"
      ]
    }
  },
  {
    "id": "ufc-v2-fast2-injury-body-parts",
    "lane": "fight-injury-body-areas",
    "prompt": "Name a part of a UFC fighter's body that could be injured in a fight.",
    "kind": "other",
    "ranked": "Nose|Knee|Hand|Eye|Ribs|Shoulder|Ankle|Elbow",
    "extras": "Foot|Head|Wrist|Jaw|Ear|Shin|Calf|Back|Finger|Toe|Neck|Hip|Arm|Leg|Groin|Mouth|Eyebrow",
    "aliases": {
      "Ribs": [
        "Rib"
      ],
      "Eye": [
        "Eyes"
      ],
      "Knee": [
        "Knees"
      ]
    }
  },
  {
    "id": "ufc-v2-fast2-combat-disciplines",
    "lane": "mma-combat-disciplines",
    "prompt": "Name a martial art or combat sport commonly trained by UFC fighters.",
    "kind": "other",
    "ranked": "Boxing|Wrestling|Brazilian jiu-jitsu|Muay Thai|Kickboxing|Judo|Karate|Taekwondo",
    "extras": "Sambo|Sanda|Catch wrestling|Capoeira|Freestyle wrestling|Greco-Roman wrestling|Submission grappling|Dutch kickboxing|Jiu-jitsu",
    "aliases": {
      "Brazilian jiu-jitsu": [
        "BJJ",
        "Brazilian jujitsu"
      ],
      "Muay Thai": [
        "Thai boxing"
      ],
      "Taekwondo": [
        "TKD"
      ],
      "Sambo": [
        "Combat sambo"
      ]
    }
  },
  {
    "id": "ufc-v2-fast2-event-countries",
    "lane": "ufc-events-country-hosts",
    "prompt": "Name a country where the UFC has held a fight card.",
    "kind": "other",
    "ranked": "United States|Brazil|United Kingdom|Canada|Australia|United Arab Emirates|Japan|Mexico",
    "extras": "Ireland|France|Germany|China|New Zealand|Singapore|Sweden|South Korea|Russia|Poland|Czech Republic|Chile|Argentina|Denmark|Netherlands|Croatia|Philippines",
    "aliases": {
      "United States": [
        "US",
        "USA",
        "America"
      ],
      "United Kingdom": [
        "UK",
        "Britain",
        "England",
        "Scotland"
      ],
      "United Arab Emirates": [
        "UAE"
      ],
      "South Korea": [
        "Korea"
      ],
      "Czech Republic": [
        "Czechia"
      ]
    }
  },
  {
    "id": "ufc-v2-fast2-ground-positions",
    "lane": "mma-ground-positions",
    "prompt": "Name a grappling position commentators mention during UFC ground fighting.",
    "kind": "other",
    "ranked": "Full guard|Half guard|Side control|Full mount|Back mount|Turtle|North-south|Crucifix",
    "extras": "Knee on belly|Butterfly guard|Rubber guard|Fifty-fifty|Deep half guard|Front headlock|Ashi garami|Reverse De La Riva|Open guard",
    "aliases": {
      "Full guard": [
        "Guard",
        "Closed guard"
      ],
      "Full mount": [
        "Mount"
      ],
      "Back mount": [
        "Back control"
      ],
      "North-south": [
        "North south position"
      ],
      "Fifty-fifty": [
        "50/50"
      ]
    }
  },
  {
    "id": "ufc-v2-fast2-corner-shouts",
    "lane": "live-fight-corner-advice",
    "prompt": "Name something a fighter's corner might shout as advice during a UFC fight.",
    "kind": "other",
    "ranked": "Keep your hands up|Move your head|Use your jab|Breathe|Circle away|Protect your chin|Shoot a takedown|Get off the fence",
    "extras": "Keep moving|Don't rush|Work the body|Kick the legs|Defend the takedown|Stay calm|Use your footwork|Pressure forward|Keep your distance|Stand up|Keep working|Stay busy|Find your range|Watch the right hand|Cover up|Use your kicks",
    "aliases": {
      "Keep your hands up": [
        "Hands up"
      ],
      "Move your head": [
        "Head movement"
      ],
      "Use your jab": [
        "Jab"
      ],
      "Breathe": [
        "Keep breathing"
      ],
      "Get off the fence": [
        "Move off the cage"
      ]
    }
  },
  {
    "id": "ufc-v2-fast2-postfight-requests",
    "lane": "ufc-postfight-requests",
    "prompt": "Name something a UFC fighter might ask for after winning a bout.",
    "kind": "other",
    "ranked": "Title shot|Rematch|Next opponent|Performance bonus|Better contract|Time off|Fight in hometown|Main event spot",
    "extras": "Another ranked opponent|Next PPV|Fight overseas|Short-notice fight|Different weight class|Specific fight date|Fight soon|Big-name opponent|BMF title shot|Fight of the Night bonus|More opportunities",
    "aliases": {
      "Title shot": [
        "Fight for the belt",
        "Championship fight"
      ],
      "Performance bonus": [
        "Bonus",
        "50k"
      ],
      "Better contract": [
        "Higher pay",
        "More money"
      ],
      "Main event spot": [
        "Headliner"
      ],
      "Time off": [
        "Vacation"
      ]
    }
  },
  {
    "id": "ufc-v2-fast2-opponent-types",
    "lane": "opponent-style-types",
    "prompt": "Name a type of opponent a UFC fighter might prepare to face.",
    "kind": "other",
    "ranked": "Wrestler|Boxer|Submission grappler|Kickboxer|Counterstriker|Pressure fighter|Southpaw|Heavy puncher",
    "extras": "Tall fighter|Short fighter|Judo specialist|Karate specialist|Muay Thai fighter|Volume striker|Switch-stance fighter|Range fighter|Clinch fighter|Ground-and-pound fighter|Takedown specialist|BJJ specialist|Fast fighter|Defensive fighter",
    "aliases": {
      "Submission grappler": [
        "Grappler",
        "BJJ fighter"
      ],
      "Heavy puncher": [
        "Knockout artist",
        "Power puncher"
      ],
      "Pressure fighter": [
        "Aggressive fighter"
      ],
      "Southpaw": [
        "Left-handed fighter"
      ]
    }
  },
  {
    "id": "ufc-v2-fast2-referee-phrases",
    "lane": "ufc-referee-commands",
    "prompt": "Name something a UFC referee might say before or during a fight.",
    "kind": "other",
    "ranked": "Fight|Stop|Break|Work|Protect yourself|Touch gloves|Watch your fingers|Don't grab the fence",
    "extras": "Hands up|Let go|Keep it clean|Time|Back up|Defend yourself|Stop holding|Release|Stay active|Continue fighting|No grabbing|Resume|Watch the back of the head|Show me something",
    "aliases": {
      "Fight": [
        "Let's fight"
      ],
      "Stop": [
        "Stop fighting"
      ],
      "Break": [
        "Separate"
      ],
      "Work": [
        "Keep working"
      ],
      "Protect yourself": [
        "Protect yourselves"
      ],
      "Don't grab the fence": [
        "No fence grabbing"
      ],
      "Touch gloves": [
        "Glove touch"
      ]
    }
  },
  {
    "id": "ufc-v2-fast2-autograph-items",
    "lane": "ufc-fan-autographs",
    "prompt": "Name something UFC fighters might autograph for a fan.",
    "kind": "other",
    "ranked": "Fight glove|Poster|T-shirt|Replica belt|Photograph|Hat|Event ticket|Trading card",
    "extras": "Program|Flag|Fight shorts|Jersey|Book|Canvas art|Phone case|Shoes|Jacket|Wristband|Bag|Magazine|Action figure",
    "aliases": {
      "Fight glove": [
        "Glove",
        "MMA glove"
      ],
      "T-shirt": [
        "Shirt"
      ],
      "Photograph": [
        "Photo",
        "Picture"
      ],
      "Fight shorts": [
        "Shorts"
      ],
      "Replica belt": [
        "Belt"
      ]
    }
  },
  {
    "id": "ufc-v2-fast2-career-record",
    "lane": "ufc-career-statistics",
    "prompt": "Name a statistic that could appear in a UFC fighter's career record.",
    "kind": "other",
    "ranked": "Total wins|Total losses|Draws|Knockout wins|Submission wins|Decision wins|No contests|Win streak",
    "extras": "Overall record|UFC fight count|Finish percentage|Win percentage|Total fights|KO percentage|Decision losses|Submission losses|Title defenses|Career finishes|Losses by knockout",
    "aliases": {
      "Total wins": [
        "Wins",
        "W"
      ],
      "Total losses": [
        "Losses",
        "L"
      ],
      "Draws": [
        "Draw"
      ],
      "Knockout wins": [
        "KO wins",
        "TKO wins"
      ],
      "No contests": [
        "NC"
      ],
      "Win streak": [
        "Winning streak"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_FAST_BATCH2 = makeUfcFeudDraft(ROWS);
