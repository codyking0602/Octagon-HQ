import { barTriviaQuestion, type BarTriviaQuestion, type BarTriviaQuestionSeed } from "../games/barTriviaEngine";
/** UFC Bar Trivia editorial v3: recognizability-first authored questions, anchored to UFC sources. */
const authored: readonly BarTriviaQuestionSeed[] = [
  {
    "id": "ufc-bt-v3-e-001",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "What combat sport did Henry Cejudo win an Olympic gold medal in?",
    "choices": [
      "Wrestling",
      "Boxing",
      "Judo",
      "Taekwondo"
    ],
    "answer": "Wrestling",
    "explanation": "Cejudo won Olympic wrestling gold before becoming a UFC champion.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-002",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which former WWE champion also won the UFC heavyweight championship?",
    "choices": [
      "Brock Lesnar",
      "CM Punk",
      "Bobby Lashley",
      "Jake Hager"
    ],
    "answer": "Brock Lesnar",
    "explanation": "Lesnar won UFC heavyweight gold after becoming a WWE star.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-003",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which fighter is especially famous for his karate-based stance and counterstriking?",
    "choices": [
      "Lyoto Machida",
      "Brock Lesnar",
      "Daniel Cormier",
      "Mark Hunt"
    ],
    "answer": "Lyoto Machida",
    "explanation": "Machida's karate background shaped his distinctive UFC striking style.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-004",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which UFC fighter landed the famous off-the-cage 'Showtime Kick'?",
    "choices": [
      "Anthony Pettis",
      "Edson Barboza",
      "Yair Rodriguez",
      "Stephen Thompson"
    ],
    "answer": "Anthony Pettis",
    "explanation": "Pettis launched his famous kick against Benson Henderson in the WEC, an iconic highlight in MMA history.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-005",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which former champion first rose to fame as a professional kickboxer in GLORY?",
    "choices": [
      "Alex Pereira",
      "Jorge Masvidal",
      "Colby Covington",
      "Demetrious Johnson"
    ],
    "answer": "Alex Pereira",
    "explanation": "Pereira won GLORY kickboxing world titles before becoming a UFC champion.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-006",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which former UFC heavyweight champion is originally from Cameroon?",
    "choices": [
      "Francis Ngannou",
      "Ciryl Gane",
      "Stipe Miocic",
      "Alistair Overeem"
    ],
    "answer": "Francis Ngannou",
    "explanation": "Ngannou was born in Cameroon and later became the UFC heavyweight champion.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-007",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which Russian region is closely associated with Khabib Nurmagomedov?",
    "choices": [
      "Dagestan",
      "Siberia",
      "Tatarstan",
      "Chechnya"
    ],
    "answer": "Dagestan",
    "explanation": "Khabib grew up in Dagestan and became one of its most famous athletes.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-008",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "What does the 'TKO' abbreviation stand for in UFC results?",
    "choices": [
      "Technical knockout",
      "Total knockout",
      "Timed knockout",
      "Tactical knockout"
    ],
    "answer": "Technical knockout",
    "explanation": "TKO means technical knockout, such as a referee stopping a fight due to unanswered strikes.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-009",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which of these can end a UFC fight without a knockout or decision?",
    "choices": [
      "Submission",
      "Offside",
      "Home run",
      "Penalty shootout"
    ],
    "answer": "Submission",
    "explanation": "A fighter can win by submission when the opponent taps or the referee stops the bout.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-010",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "In standard MMA scoring, what is the usual score awarded to the winner of a round?",
    "choices": [
      "10 points",
      "5 points",
      "7 points",
      "12 points"
    ],
    "answer": "10 points",
    "explanation": "The Unified Rules use a ten-point must scoring system.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-011",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "What does 'southpaw' describe in combat sports?",
    "choices": [
      "A left-handed fighting stance",
      "A fighter's nickname",
      "A wrestling submission",
      "A judge's scorecard"
    ],
    "answer": "A left-handed fighting stance",
    "explanation": "Southpaw generally means a stance with the right side forward and left hand as the power hand.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-012",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which UFC broadcast figure used to host Fear Factor?",
    "choices": [
      "Joe Rogan",
      "Bruce Buffer",
      "Jon Anik",
      "Daniel Cormier"
    ],
    "answer": "Joe Rogan",
    "explanation": "Joe Rogan was the host of Fear Factor as well as a longtime UFC commentator.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-013",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which of these is a common Brazilian jiu-jitsu submission used in UFC fights?",
    "choices": [
      "Triangle choke",
      "Two-point conversion",
      "Corner kick",
      "Double fault"
    ],
    "answer": "Triangle choke",
    "explanation": "The triangle choke is a common submission applied using the legs.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-014",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "What happens when a fighter 'taps out'?",
    "choices": [
      "They concede the submission",
      "They win the round",
      "They request a new referee",
      "They earn a point"
    ],
    "answer": "They concede the submission",
    "explanation": "Tapping tells the referee and opponent that the fighter submits.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-015",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which UFC heavyweight famously coined the postfight line 'My balls was hot'?",
    "choices": [
      "Derrick Lewis",
      "Tai Tuivasa",
      "Roy Nelson",
      "Mark Hunt"
    ],
    "answer": "Derrick Lewis",
    "explanation": "Lewis gave the memorable interview after his victory over Alexander Volkov.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-016",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which American city are the Diaz brothers strongly associated with?",
    "choices": [
      "Stockton",
      "Miami",
      "Chicago",
      "Boston"
    ],
    "answer": "Stockton",
    "explanation": "Nick and Nate Diaz became famous for representing Stockton, California.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-017",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which future UFC heavyweight champion was a two-time NCAA All-American wrestler at Arizona State?",
    "choices": [
      "Cain Velasquez",
      "Anderson Silva",
      "Conor McGregor",
      "Michael Bisping"
    ],
    "answer": "Cain Velasquez",
    "explanation": "Cain Velasquez was a two-time NCAA Division I All-American wrestler at Arizona State.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-018",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which UFC pioneer is known as the 'Godfather of Ground and Pound'?",
    "choices": [
      "Mark Coleman",
      "Royce Gracie",
      "Chuck Liddell",
      "Bas Rutten"
    ],
    "answer": "Mark Coleman",
    "explanation": "Mark Coleman popularized the term ground and pound and used it to dominate early UFC competition.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-019",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "In the UFC, what is an interim champion?",
    "choices": [
      "A temporary titleholder while the undisputed title is unavailable",
      "A fighter with two belts",
      "A champion of the preliminary card",
      "A referee's substitute"
    ],
    "answer": "A temporary titleholder while the undisputed title is unavailable",
    "explanation": "Interim titles can be contested when the undisputed champion cannot defend.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-020",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which type of strike is generally illegal to the back of an opponent's head?",
    "choices": [
      "Punches to the back of the head",
      "A jab to the face",
      "A kick to the leg",
      "A punch to the body"
    ],
    "answer": "Punches to the back of the head",
    "explanation": "The Unified Rules prohibit strikes to the back of the head.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-021",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which MMA position puts a fighter on top of an opponent's torso facing them?",
    "choices": [
      "Mount",
      "Southpaw",
      "Clinch",
      "Sprawl"
    ],
    "answer": "Mount",
    "explanation": "Full mount puts one fighter on top of the other's torso.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-022",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "What is 'ground and pound' in MMA?",
    "choices": [
      "Striking an opponent while grappling on the mat",
      "A specific kick",
      "A points-only decision",
      "A type of weigh-in"
    ],
    "answer": "Striking an opponent while grappling on the mat",
    "explanation": "Ground and pound combines top control with strikes on the mat.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-023",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which discipline is especially associated with the Gracie family's early UFC success?",
    "choices": [
      "Brazilian jiu-jitsu",
      "Sumo wrestling",
      "Fencing",
      "Savate"
    ],
    "answer": "Brazilian jiu-jitsu",
    "explanation": "Royce Gracie showcased Brazilian jiu-jitsu in the first UFC tournaments.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-024",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which UFC welterweight contender is particularly famous for his karate background and side-on stance?",
    "choices": [
      "Stephen Thompson",
      "Khabib Nurmagomedov",
      "Matt Hughes",
      "Brock Lesnar"
    ],
    "answer": "Stephen Thompson",
    "explanation": "Stephen Thompson brought a decorated karate and kickboxing background into UFC welterweight competition.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-025",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which fighter crossed over from professional wrestling and lost his UFC debut to Mickey Gall?",
    "choices": [
      "CM Punk",
      "Brock Lesnar",
      "Ronda Rousey",
      "Ken Shamrock"
    ],
    "answer": "CM Punk",
    "explanation": "CM Punk made his UFC debut against Mickey Gall in 2016.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-026",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which UFC star once fought Floyd Mayweather Jr. in a professional boxing match?",
    "choices": [
      "Conor McGregor",
      "Nate Diaz",
      "Israel Adesanya",
      "Max Holloway"
    ],
    "answer": "Conor McGregor",
    "explanation": "McGregor boxed Mayweather in 2017.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-027",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "What does 'no contest' usually mean in a UFC result?",
    "choices": [
      "The fight has no official winner",
      "Both fighters win",
      "Both fighters are disqualified for life",
      "The judges award a draw"
    ],
    "answer": "The fight has no official winner",
    "explanation": "A no-contest result records no winner under the applicable rules.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-028",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which gym was famously linked with fighters such as Jon Jones and Holly Holm?",
    "choices": [
      "Jackson-Wink MMA",
      "American Kickboxing Academy",
      "Team Alpha Male",
      "City Kickboxing"
    ],
    "answer": "Jackson-Wink MMA",
    "explanation": "Jackson-Wink trained prominent fighters including Jones and Holm.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-029",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which gym is strongly associated with Khabib Nurmagomedov and Daniel Cormier?",
    "choices": [
      "American Kickboxing Academy",
      "Jackson-Wink MMA",
      "City Kickboxing",
      "Tristar Gym"
    ],
    "answer": "American Kickboxing Academy",
    "explanation": "AKA in San Jose has been associated with both Khabib and Daniel Cormier.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-030",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which Canadian gym is famously associated with Georges St-Pierre?",
    "choices": [
      "Tristar Gym",
      "American Top Team",
      "City Kickboxing",
      "Team Alpha Male"
    ],
    "answer": "Tristar Gym",
    "explanation": "St-Pierre trained for many years with the Tristar team in Montreal.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-031",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which New Zealand gym helped develop Israel Adesanya and Alexander Volkanovski?",
    "choices": [
      "City Kickboxing",
      "American Top Team",
      "Tristar Gym",
      "Team Alpha Male"
    ],
    "answer": "City Kickboxing",
    "explanation": "City Kickboxing produced multiple UFC stars, including Adesanya and Volkanovski.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-032",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "What does a fighter commonly do during a UFC 'weigh-in'?",
    "choices": [
      "Step on a scale to make their division's weight",
      "Choose the judges",
      "Select the referee",
      "Change the cage size"
    ],
    "answer": "Step on a scale to make their division's weight",
    "explanation": "Weigh-ins are held to establish each fighter's weight before competing.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-033",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which of these is an example of an illegal UFC foul?",
    "choices": [
      "Eye gouging",
      "A body jab",
      "A legal takedown",
      "A low kick to the thigh"
    ],
    "answer": "Eye gouging",
    "explanation": "Eye gouging is prohibited by the Unified Rules.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-034",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "What is a 'clinch' in an MMA fight?",
    "choices": [
      "Close-range grappling while standing",
      "A long-range punch",
      "A judge's ruling",
      "A scheduled break"
    ],
    "answer": "Close-range grappling while standing",
    "explanation": "Clinching is close-range grappling in a standing position.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-035",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which fighter is recognized as a former PRIDE heavyweight champion who later won a UFC interim heavyweight title?",
    "choices": [
      "Antonio Rodrigo Nogueira",
      "Randy Couture",
      "Brock Lesnar",
      "Daniel Cormier"
    ],
    "answer": "Antonio Rodrigo Nogueira",
    "explanation": "Nogueira was a PRIDE heavyweight champion and later held a UFC interim heavyweight belt.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-036",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which Brazilian fighter famously used capoeira-inspired techniques in the Octagon?",
    "choices": [
      "Michel Pereira",
      "Brock Lesnar",
      "Ben Askren",
      "Matt Hughes"
    ],
    "answer": "Michel Pereira",
    "explanation": "Pereira has become known for unorthodox acrobatic attacks influenced by capoeira.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-037",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "What do referees usually signal when they wave off a UFC fight after a knockout?",
    "choices": [
      "The fight is over",
      "The round is tied",
      "Another round starts",
      "A point is awarded"
    ],
    "answer": "The fight is over",
    "explanation": "Referees wave off contests to indicate a finish.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-038",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which MMA technique is a 'sprawl' primarily used to defend?",
    "choices": [
      "A takedown attempt",
      "A leg kick",
      "A jab",
      "A rear-naked choke"
    ],
    "answer": "A takedown attempt",
    "explanation": "A sprawl drives the hips back to counter an opponent's takedown attempt.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-rules",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-039",
    "league": "ufc",
    "round": "round1",
    "category": "UFC Fundamentals & Stories",
    "prompt": "Which UFC organization holds fighter interviews and broadcasts many events at its Las Vegas Apex venue?",
    "choices": [
      "The UFC",
      "Bellator",
      "PFL",
      "ONE Championship"
    ],
    "answer": "The UFC",
    "explanation": "The UFC built its Apex production facility in Las Vegas.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-m-001",
    "league": "ufc",
    "round": "round2",
    "category": "Championship History",
    "prompt": "Which fighter knocked out Chuck Liddell to take the light heavyweight championship at UFC 71?",
    "choices": [
      "Quinton Jackson",
      "Rashad Evans",
      "Tito Ortiz",
      "Mauricio Rua"
    ],
    "answer": "Quinton Jackson",
    "explanation": "Rampage Jackson stopped Liddell in their UFC 71 rematch to become champion.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-71"
  },
  {
    "id": "ufc-bt-v3-m-002",
    "league": "ufc",
    "round": "round2",
    "category": "Championship History",
    "prompt": "Who did Jon Jones beat to win his first UFC light heavyweight championship in 2011?",
    "choices": [
      "Mauricio Rua",
      "Rashad Evans",
      "Lyoto Machida",
      "Quinton Jackson"
    ],
    "answer": "Mauricio Rua",
    "explanation": "Jones defeated Shogun Rua for the title at UFC 128.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-m-003",
    "league": "ufc",
    "round": "round2",
    "category": "Championship History",
    "prompt": "Who stopped Brock Lesnar to take the heavyweight title at UFC 121?",
    "choices": [
      "Cain Velasquez",
      "Frank Mir",
      "Shane Carwin",
      "Junior dos Santos"
    ],
    "answer": "Cain Velasquez",
    "explanation": "Velasquez beat Lesnar by first-round TKO to become champion.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-121"
  },
  {
    "id": "ufc-bt-v3-m-004",
    "league": "ufc",
    "round": "round2",
    "category": "Championship History",
    "prompt": "Who submitted Michael Bisping to capture the middleweight championship at UFC 217?",
    "choices": [
      "Georges St-Pierre",
      "Luke Rockhold",
      "Anderson Silva",
      "Dan Henderson"
    ],
    "answer": "Georges St-Pierre",
    "explanation": "GSP returned from a long layoff and submitted Bisping for the middleweight title.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-217"
  },
  {
    "id": "ufc-bt-v3-m-005",
    "league": "ufc",
    "round": "round2",
    "category": "Championship History",
    "prompt": "Which UFC champion famously defended his title against Chael Sonnen after being badly hurt early in the fight?",
    "choices": [
      "Anderson Silva",
      "Chris Weidman",
      "Robert Whittaker",
      "Vitor Belfort"
    ],
    "answer": "Anderson Silva",
    "explanation": "Silva survived difficult rounds and finished Sonnen by triangle armbar at UFC 117.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-m-006",
    "league": "ufc",
    "round": "round2",
    "category": "Championship History",
    "prompt": "Which longtime UFC champion made his debut against Marcus Brimage in Sweden?",
    "choices": [
      "Conor McGregor",
      "Jose Aldo",
      "Max Holloway",
      "Dustin Poirier"
    ],
    "answer": "Conor McGregor",
    "explanation": "McGregor's UFC debut was a first-round stoppage of Brimage in 2013.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-m-007",
    "league": "ufc",
    "round": "round2",
    "category": "Championship History",
    "prompt": "Which former lightweight champion also appeared in the WEC as the 'Smooth' champion?",
    "choices": [
      "Benson Henderson",
      "Frankie Edgar",
      "Anthony Pettis",
      "Rafael dos Anjos"
    ],
    "answer": "Benson Henderson",
    "explanation": "Benson Henderson held the WEC lightweight title before later winning UFC gold.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-m-008",
    "league": "ufc",
    "round": "round2",
    "category": "Championship History",
    "prompt": "Which former UFC women's champion had a notable rivalry with Miesha Tate before signing with the UFC?",
    "choices": [
      "Ronda Rousey",
      "Zhang Weili",
      "Valentina Shevchenko",
      "Rose Namajunas"
    ],
    "answer": "Ronda Rousey",
    "explanation": "Rousey and Tate had a major rivalry in Strikeforce and later the UFC.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-m-009",
    "league": "ufc",
    "round": "round2",
    "category": "Championship History",
    "prompt": "Who beat Lyoto Machida in their UFC 113 rematch to become light heavyweight champion?",
    "choices": [
      "Mauricio Rua",
      "Rashad Evans",
      "Jon Jones",
      "Randy Couture"
    ],
    "answer": "Mauricio Rua",
    "explanation": "Shogun Rua avenged his controversial decision loss to Machida with a knockout at UFC 113.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-113"
  },
  {
    "id": "ufc-bt-v3-m-010",
    "league": "ufc",
    "round": "round2",
    "category": "Championship History",
    "prompt": "Which fighter ended Chuck Liddell's UFC career by knocking him out at UFC 115?",
    "choices": [
      "Rich Franklin",
      "Quinton Jackson",
      "Mauricio Rua",
      "Rashad Evans"
    ],
    "answer": "Rich Franklin",
    "explanation": "Franklin's knockout of Liddell was Liddell's final UFC fight.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-115"
  },
  {
    "id": "ufc-bt-v3-m-011",
    "league": "ufc",
    "round": "round2",
    "category": "Championship History",
    "prompt": "Which lightweight star was once famous for performing a cage-side backflip after a win?",
    "choices": [
      "Justin Gaethje",
      "Tony Ferguson",
      "Frankie Edgar",
      "Khabib Nurmagomedov"
    ],
    "answer": "Justin Gaethje",
    "explanation": "Gaethje became known for his backflips, including after some victories.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-m-012",
    "league": "ufc",
    "round": "round2",
    "category": "Championship History",
    "prompt": "Which fighter became UFC welterweight champion by outpointing Johny Hendricks at UFC 181?",
    "choices": [
      "Robbie Lawler",
      "Carlos Condit",
      "Tyron Woodley",
      "Matt Brown"
    ],
    "answer": "Robbie Lawler",
    "explanation": "Lawler defeated Hendricks by split decision to win the welterweight championship.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-181"
  },
  {
    "id": "ufc-bt-v3-m-013",
    "league": "ufc",
    "round": "round2",
    "category": "Championship History",
    "prompt": "Which heavyweight beat Fedor Emelianenko in Strikeforce and later held UFC heavyweight gold?",
    "choices": [
      "Fabricio Werdum",
      "Alistair Overeem",
      "Antonio Silva",
      "Josh Barnett"
    ],
    "answer": "Fabricio Werdum",
    "explanation": "Werdum's triangle-armbar win over Fedor preceded his UFC heavyweight championship.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-m-014",
    "league": "ufc",
    "round": "round2",
    "category": "Championship History",
    "prompt": "Which fighter was nicknamed 'The All-American' and became UFC middleweight champion?",
    "choices": [
      "Chris Weidman",
      "Colby Covington",
      "Rashad Evans",
      "Michael Bisping"
    ],
    "answer": "Chris Weidman",
    "explanation": "Weidman held the middleweight championship and used the nickname The All-American.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-043",
    "league": "ufc",
    "round": "round1",
    "category": "Fight Fundamentals & Fighter Culture",
    "prompt": "What does MMA stand for?",
    "choices": [
      "Mixed martial arts",
      "Modern martial association",
      "Mixed match athletics",
      "Maximum martial action"
    ],
    "answer": "Mixed martial arts",
    "explanation": "MMA stands for mixed martial arts.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-authority",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-044",
    "league": "ufc",
    "round": "round1",
    "category": "Fight Fundamentals & Fighter Culture",
    "prompt": "What does BJJ stand for in MMA training?",
    "choices": [
      "Brazilian jiu-jitsu",
      "Boxing jump jitsu",
      "Basic judo judging",
      "Bare-knuckle jiu-jitsu"
    ],
    "answer": "Brazilian jiu-jitsu",
    "explanation": "BJJ abbreviates Brazilian jiu-jitsu.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-authority",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-045",
    "league": "ufc",
    "round": "round1",
    "category": "Fight Fundamentals & Fighter Culture",
    "prompt": "What is a UFC cutman's primary job during a bout?",
    "choices": [
      "Treat cuts and reduce swelling",
      "Judge each round",
      "Choose the referee",
      "Coach wrestling technique"
    ],
    "answer": "Treat cuts and reduce swelling",
    "explanation": "Cutmen help control cuts and swelling between rounds.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-authority",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list"
  },
  {
    "id": "ufc-bt-v3-e-046",
    "league": "ufc",
    "round": "round1",
    "category": "Fight Fundamentals & Fighter Culture",
    "prompt": "How many judges typically score a UFC fight if it goes the distance?",
    "choices": [
      "Three",
      "One",
      "Two",
      "Five"
    ],
    "answer": "Three",
    "explanation": "Standard UFC bouts are scored by three judges.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-authority",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-047",
    "league": "ufc",
    "round": "round1",
    "category": "Fight Fundamentals & Fighter Culture",
    "prompt": "Which part of the body does a rear-naked choke principally attack?",
    "choices": [
      "The neck",
      "The ankle",
      "The shoulder",
      "The wrist"
    ],
    "answer": "The neck",
    "explanation": "A rear-naked choke applies pressure to the neck.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-authority",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-048",
    "league": "ufc",
    "round": "round1",
    "category": "Fight Fundamentals & Fighter Culture",
    "prompt": "Which former UFC welterweight champion is known as 'The Nigerian Nightmare'?",
    "choices": [
      "Kamaru Usman",
      "Tyron Woodley",
      "Leon Edwards",
      "Jorge Masvidal"
    ],
    "answer": "Kamaru Usman",
    "explanation": "Kamaru Usman competes under the nickname Nigerian Nightmare.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-authority",
    "sourceUrl": "https://www.ufc.com/athlete/kamaru-usman"
  },
  {
    "id": "ufc-bt-v3-e-049",
    "league": "ufc",
    "round": "round1",
    "category": "Fight Fundamentals & Fighter Culture",
    "prompt": "Which UFC superstar acted alongside Jake Gyllenhaal in the 2024 film Road House?",
    "choices": [
      "Conor McGregor",
      "Jon Jones",
      "Dustin Poirier",
      "Michael Chandler"
    ],
    "answer": "Conor McGregor",
    "explanation": "McGregor appeared alongside Gyllenhaal in the 2024 Road House remake.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-authority",
    "sourceUrl": "https://www.ufc.com/news/history-ufc-fighters-movies-and-television-conor-mcgregor-road-house"
  },
  {
    "id": "ufc-bt-v3-e-050",
    "league": "ufc",
    "round": "round1",
    "category": "Fight Fundamentals & Fighter Culture",
    "prompt": "Who said 'headshot, dead' after a famous UFC title-winning knockout?",
    "choices": [
      "Leon Edwards",
      "Israel Adesanya",
      "Jorge Masvidal",
      "Max Holloway"
    ],
    "answer": "Leon Edwards",
    "explanation": "Edwards used the phrase after knocking out Kamaru Usman.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-authority",
    "sourceUrl": "https://www.ufc.com/news/best-moments-salt-lake-city"
  },
  {
    "id": "ufc-bt-v3-e-051",
    "league": "ufc",
    "round": "round1",
    "category": "Fight Fundamentals & Fighter Culture",
    "prompt": "Which former UFC two-division champion is a familiar color commentator on UFC broadcasts?",
    "choices": [
      "Daniel Cormier",
      "Brock Lesnar",
      "Georges St-Pierre",
      "Chuck Liddell"
    ],
    "answer": "Daniel Cormier",
    "explanation": "Cormier became a UFC analyst and commentator after his championship career.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-authority",
    "sourceUrl": "https://www.ufc.com/athlete/daniel-cormier"
  },
  {
    "id": "ufc-bt-v3-e-052",
    "league": "ufc",
    "round": "round1",
    "category": "Fight Fundamentals & Fighter Culture",
    "prompt": "What piece of protective equipment do UFC fighters wear inside their mouths?",
    "choices": [
      "A mouthguard",
      "A shin guard",
      "A headguard",
      "A wrist splint"
    ],
    "answer": "A mouthguard",
    "explanation": "UFC fighters use a protective mouthguard.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-authority",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-053",
    "league": "ufc",
    "round": "round1",
    "category": "Fight Fundamentals & Fighter Culture",
    "prompt": "What does it mean when a UFC fighter wins a unanimous decision?",
    "choices": [
      "All three judges scored the fight for that fighter",
      "The referee stopped the fight",
      "Both fighters submitted",
      "A single judge picked the winner"
    ],
    "answer": "All three judges scored the fight for that fighter",
    "explanation": "A unanimous decision means all three judges scored the contest for the same fighter.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-authority",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  },
  {
    "id": "ufc-bt-v3-e-054",
    "league": "ufc",
    "round": "round1",
    "category": "Fight Fundamentals & Fighter Culture",
    "prompt": "What is an orthodox fighting stance?",
    "choices": [
      "Left side forward, right power hand",
      "Right side forward, left power hand",
      "Both feet even and square",
      "An inverted grappling guard"
    ],
    "answer": "Left side forward, right power hand",
    "explanation": "Orthodox fighters conventionally lead with their left hand and use their right hand as the rear power hand.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-authority",
    "sourceUrl": "https://www.ufc.com/unified-rules-mixed-martial-arts"
  }
];
export const UFC_BAR_TRIVIA_V3_EASY_MEDIUM: readonly BarTriviaQuestion[] = authored.map((item) => barTriviaQuestion(item));
