import { barTriviaQuestion, type BarTriviaQuestion, type BarTriviaQuestionSeed } from "../games/barTriviaEngine";
/** UFC Bar Trivia editorial v3: high-difficulty fights and last-call moments. */
const authored: readonly BarTriviaQuestionSeed[] = [
  {
    "id": "ufc-bt-v3-h-001",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which former UFC heavyweight champion submitted boxer James Toney in the boxer's only UFC fight?",
    "choices": [
      "Randy Couture",
      "Frank Mir",
      "Brock Lesnar",
      "Mark Coleman"
    ],
    "answer": "Randy Couture",
    "explanation": "Randy Couture used his wrestling and grappling to submit boxer James Toney at UFC 118.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-002",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which fighter won the highly anticipated Chuck Liddell–Wanderlei Silva bout at UFC 79?",
    "choices": [
      "Chuck Liddell",
      "Wanderlei Silva",
      "Rashad Evans",
      "Quinton Jackson"
    ],
    "answer": "Chuck Liddell",
    "explanation": "Liddell defeated Wanderlei Silva by unanimous decision in their 2007 fight.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-79",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-003",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Who submitted Matt Hughes with a triangle choke in their first UFC meeting at UFC 46?",
    "choices": [
      "BJ Penn",
      "Georges St-Pierre",
      "Frank Trigg",
      "Carlos Newton"
    ],
    "answer": "BJ Penn",
    "explanation": "BJ Penn upset Hughes and took his welterweight title in 2004.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-46",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-004",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which fighter shocked Robbie Lawler with a knockout at UFC 47 in 2004?",
    "choices": [
      "Nick Diaz",
      "Carlos Condit",
      "Matt Hughes",
      "Johny Hendricks"
    ],
    "answer": "Nick Diaz",
    "explanation": "Young Nick Diaz knocked out Robbie Lawler in their first meeting at UFC 47.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-47",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-005",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "What submission did Demetrious Johnson famously secure against Ray Borg after lifting him into the air?",
    "choices": [
      "Armbar",
      "Kimura",
      "Guillotine",
      "Heel hook"
    ],
    "answer": "Armbar",
    "explanation": "Johnson finished Borg with an extraordinary suplex-to-armbar combination at UFC 216.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-006",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which heavyweight avenged a prior title loss by stopping Stipe Miocic in their 2021 rematch?",
    "choices": [
      "Francis Ngannou",
      "Daniel Cormier",
      "Junior dos Santos",
      "Alistair Overeem"
    ],
    "answer": "Francis Ngannou",
    "explanation": "Ngannou knocked out Miocic at UFC 260 and captured heavyweight gold.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/honors/fans-choice",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-007",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "How did Jon Jones win the vacant heavyweight title against Ciryl Gane at UFC 285?",
    "choices": [
      "Guillotine choke",
      "Flying knee knockout",
      "Unanimous decision",
      "Rear-naked choke"
    ],
    "answer": "Guillotine choke",
    "explanation": "Jones submitted Gane with a guillotine early in their heavyweight title fight.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/event/ufc-285",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-008",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Who did Tom Aspinall defeat to win the interim UFC heavyweight championship at UFC 295?",
    "choices": [
      "Sergei Pavlovich",
      "Curtis Blaydes",
      "Alexander Volkov",
      "Jairzinho Rozenstruik"
    ],
    "answer": "Sergei Pavlovich",
    "explanation": "Aspinall stopped Pavlovich in the first round for the interim title.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/event/ufc-295",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-009",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which former light heavyweight champion did Alex Pereira beat to capture the vacant 205-pound belt at UFC 295?",
    "choices": [
      "Jiri Prochazka",
      "Israel Adesanya",
      "Jamahal Hill",
      "Glover Teixeira"
    ],
    "answer": "Jiri Prochazka",
    "explanation": "Pereira stopped Jiri Prochazka at UFC 295 to capture the vacant UFC light heavyweight championship.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/event/ufc-295",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-010",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Who became the first fighter to knock out Max Holloway in his professional MMA career at UFC 308?",
    "choices": [
      "Ilia Topuria",
      "Alexander Volkanovski",
      "Conor McGregor",
      "Dustin Poirier"
    ],
    "answer": "Ilia Topuria",
    "explanation": "Topuria stopped Holloway in round three at UFC 308.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-ufc24",
    "sourceUrl": "https://www.ufc.com/event/ufc-308",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-011",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which featherweight champion lost his title to a head-kick knockout in a 2023 rematch with Islam Makhachev?",
    "choices": [
      "Alexander Volkanovski",
      "Max Holloway",
      "Jose Aldo",
      "Yair Rodriguez"
    ],
    "answer": "Alexander Volkanovski",
    "explanation": "Makhachev knocked out Volkanovski with a head kick in their UFC 294 rematch.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/honors/fans-choice",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-012",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which longtime lightweight contender was submitted by Islam Makhachev in the fifth round at UFC 302?",
    "choices": [
      "Dustin Poirier",
      "Justin Gaethje",
      "Charles Oliveira",
      "Michael Chandler"
    ],
    "answer": "Dustin Poirier",
    "explanation": "Makhachev submitted Poirier with a D'Arce choke in their title fight.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/event/ufc-302",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-013",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Who upset Leon Edwards by decision to capture the welterweight championship at UFC 304?",
    "choices": [
      "Belal Muhammad",
      "Kamaru Usman",
      "Colby Covington",
      "Shavkat Rakhmonov"
    ],
    "answer": "Belal Muhammad",
    "explanation": "Muhammad beat Edwards by unanimous decision in Manchester in 2024.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/event/ufc-304",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-014",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which former welterweight contender was knocked out by Kamaru Usman's right hand at UFC 261?",
    "choices": [
      "Jorge Masvidal",
      "Colby Covington",
      "Gilbert Burns",
      "Tyron Woodley"
    ],
    "answer": "Jorge Masvidal",
    "explanation": "Usman scored a devastating knockout of Masvidal in their UFC 261 rematch.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/event/ufc-261",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-015",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Who knocked out Cris Cyborg in a stunning first-round UFC 232 title fight?",
    "choices": [
      "Amanda Nunes",
      "Holly Holm",
      "Germaine de Randamie",
      "Valentina Shevchenko"
    ],
    "answer": "Amanda Nunes",
    "explanation": "Nunes knocked out Cyborg to win the UFC women's featherweight title.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-232",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-016",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which lightweight contender won the UFC 249 interim title by stopping Tony Ferguson?",
    "choices": [
      "Justin Gaethje",
      "Dustin Poirier",
      "Michael Chandler",
      "Charles Oliveira"
    ],
    "answer": "Justin Gaethje",
    "explanation": "Gaethje stopped Ferguson late in the fifth round at UFC 249.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/event/ufc-249",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-017",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which former strawweight champion knocked out Zhang Weili with a head kick at UFC 261?",
    "choices": [
      "Rose Namajunas",
      "Joanna Jedrzejczyk",
      "Jessica Andrade",
      "Carla Esparza"
    ],
    "answer": "Rose Namajunas",
    "explanation": "Namajunas finished Zhang with a first-round head kick to regain the strawweight title.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/event/ufc-261",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-018",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Who submitted Glover Teixeira late in Round 5 to win the light heavyweight title at UFC 275?",
    "choices": [
      "Jiri Prochazka",
      "Alex Pereira",
      "Jamahal Hill",
      "Jan Blachowicz"
    ],
    "answer": "Jiri Prochazka",
    "explanation": "Prochazka submitted Teixeira in the final round of their thrilling title fight.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/event/ufc-275",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-019",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Who stopped Aljamain Sterling to win the bantamweight championship at UFC 292?",
    "choices": [
      "Sean O'Malley",
      "Merab Dvalishvili",
      "Petr Yan",
      "Henry Cejudo"
    ],
    "answer": "Sean O'Malley",
    "explanation": "O'Malley stopped Sterling with punches in the second round of UFC 292.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/event/ufc-292",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-020",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which lightweight star knocked out Tony Ferguson with a front kick at UFC 274?",
    "choices": [
      "Michael Chandler",
      "Justin Gaethje",
      "Beneil Dariush",
      "Dustin Poirier"
    ],
    "answer": "Michael Chandler",
    "explanation": "Chandler landed a front kick to Ferguson's face for an unforgettable finish.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/event/ufc-274",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-021",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which Brazilian fighter knocked out Rose Namajunas with a slam to win the strawweight title at UFC 237?",
    "choices": [
      "Jessica Andrade",
      "Zhang Weili",
      "Carla Esparza",
      "Joanna Jedrzejczyk"
    ],
    "answer": "Jessica Andrade",
    "explanation": "Andrade slammed Namajunas and scored a dramatic knockout in Brazil.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-237",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-022",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Who delivered the famous head-kick knockout of Jessica Eye at UFC 238?",
    "choices": [
      "Valentina Shevchenko",
      "Amanda Nunes",
      "Holly Holm",
      "Alexa Grasso"
    ],
    "answer": "Valentina Shevchenko",
    "explanation": "Shevchenko scored one of the division's most memorable head-kick knockouts.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-238",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-023",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which fighter won the Zhang Weili–Joanna Jedrzejczyk rematch at UFC 275 with a spinning backfist?",
    "choices": [
      "Zhang Weili",
      "Joanna Jedrzejczyk",
      "Rose Namajunas",
      "Jessica Andrade"
    ],
    "answer": "Zhang Weili",
    "explanation": "Zhang knocked out Joanna with a spinning backfist in their second meeting.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/event/ufc-275",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-024",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which UFC heavyweight submitted Cain Velasquez in Mexico City to capture the undisputed title at UFC 188?",
    "choices": [
      "Fabricio Werdum",
      "Junior dos Santos",
      "Brock Lesnar",
      "Frank Mir"
    ],
    "answer": "Fabricio Werdum",
    "explanation": "Werdum submitted Velasquez with a guillotine to become heavyweight champion.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-188",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-025",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which striker knocked out Luke Rockhold with a spinning heel kick at UFC on FX 8?",
    "choices": [
      "Vitor Belfort",
      "Anderson Silva",
      "Yoel Romero",
      "Chris Weidman"
    ],
    "answer": "Vitor Belfort",
    "explanation": "Belfort stunned Rockhold with a spinning heel kick in Brazil in 2013.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-026",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which fighter broke his leg throwing a kick during his rematch with Chris Weidman at UFC 168?",
    "choices": [
      "Anderson Silva",
      "Vitor Belfort",
      "Lyoto Machida",
      "Michael Bisping"
    ],
    "answer": "Anderson Silva",
    "explanation": "Silva suffered a severe leg fracture on a checked kick against Weidman.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-168",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-027",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which UFC star knocked out Sean Salmon with a famous head kick in 2007?",
    "choices": [
      "Rashad Evans",
      "Chuck Liddell",
      "Tito Ortiz",
      "Quinton Jackson"
    ],
    "answer": "Rashad Evans",
    "explanation": "Evans landed a devastating high kick against Salmon at UFC Fight Night 8.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-028",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which fighter submitted Matt Sayles with the UFC's second twister submission in 2019?",
    "choices": [
      "Bryce Mitchell",
      "Charles Oliveira",
      "Brian Ortega",
      "Ryan Hall"
    ],
    "answer": "Bryce Mitchell",
    "explanation": "Mitchell finished Sayles with a twister at UFC on ESPN 7.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/honors/fans-choice",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-029",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which veteran submitted Viktor Pesta with an unusual Ezekiel choke at UFC Fight Night 103?",
    "choices": [
      "Aleksei Oleinik",
      "Fabricio Werdum",
      "Frank Mir",
      "Josh Barnett"
    ],
    "answer": "Aleksei Oleinik",
    "explanation": "Oleinik used an Ezekiel choke from underneath Pesta in 2017.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-030",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which contender became the first person to stop Frankie Edgar with strikes at UFC 222?",
    "choices": [
      "Brian Ortega",
      "Max Holloway",
      "Chad Mendes",
      "Yair Rodriguez"
    ],
    "answer": "Brian Ortega",
    "explanation": "Ortega knocked out Edgar with an uppercut in 2018.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/event/ufc-222",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-031",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which former featherweight contender knocked out Chad Mendes in the first round in December 2015?",
    "choices": [
      "Frankie Edgar",
      "Jose Aldo",
      "Conor McGregor",
      "Alexander Volkanovski"
    ],
    "answer": "Frankie Edgar",
    "explanation": "Edgar stopped Mendes in the main event of The Ultimate Fighter 22 Finale.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-032",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Who defeated Justin Gaethje by knockout in their action-packed 2018 lightweight main event?",
    "choices": [
      "Dustin Poirier",
      "Michael Johnson",
      "Eddie Alvarez",
      "Tony Ferguson"
    ],
    "answer": "Dustin Poirier",
    "explanation": "Poirier stopped Gaethje in the fourth round of their 2018 fight.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/honors/fans-choice",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-033",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Which fighter became the first to knock out Conor McGregor in the UFC at UFC 257?",
    "choices": [
      "Dustin Poirier",
      "Khabib Nurmagomedov",
      "Nate Diaz",
      "Eddie Alvarez"
    ],
    "answer": "Dustin Poirier",
    "explanation": "Poirier knocked out McGregor in their January 2021 rematch.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/event/ufc-257",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-034",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "During his famous 2021 performance against Calvin Kattar, which fighter shouted that he was the UFC's best boxer?",
    "choices": [
      "Max Holloway",
      "Dustin Poirier",
      "Conor McGregor",
      "Alexander Volkanovski"
    ],
    "answer": "Max Holloway",
    "explanation": "Holloway exclaimed he was the best boxer while avoiding punches in their UFC on ABC bout.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-h-035",
    "league": "ufc",
    "round": "round3",
    "category": "Memorable Fights & Champions",
    "prompt": "Who won the main event of UFC 279 by submitting Tony Ferguson?",
    "choices": [
      "Nate Diaz",
      "Khamzat Chimaev",
      "Li Jingliang",
      "Kevin Holland"
    ],
    "answer": "Nate Diaz",
    "explanation": "Nate Diaz submitted Ferguson with a guillotine in UFC 279's rearranged main event.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-honors",
    "sourceUrl": "https://www.ufc.com/event/ufc-279",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-f-001",
    "league": "ufc",
    "round": "last-call",
    "category": "Last Call: Historic Fight Moments",
    "prompt": "Which fighter lost his UFC debut to Joe Lauzon in a famous upset at UFC 63?",
    "choices": [
      "Jens Pulver",
      "BJ Penn",
      "Sean Sherk",
      "Caol Uno"
    ],
    "answer": "Jens Pulver",
    "explanation": "Lauzon shocked former UFC lightweight champion Pulver with a first-round knockout.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-63",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-f-002",
    "league": "ufc",
    "round": "last-call",
    "category": "Last Call: Historic Fight Moments",
    "prompt": "Which fighter knocked out Matt Serra with a spinning backfist at UFC 31?",
    "choices": [
      "Shonie Carter",
      "Nick Diaz",
      "Paul Daley",
      "Chris Lytle"
    ],
    "answer": "Shonie Carter",
    "explanation": "Carter scored an iconic spinning-backfist finish over Serra at UFC 31.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-31",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-f-003",
    "league": "ufc",
    "round": "last-call",
    "category": "Last Call: Historic Fight Moments",
    "prompt": "Which heavyweight was knocked out by Junior dos Santos in JDS's UFC debut at UFC 90?",
    "choices": [
      "Fabricio Werdum",
      "Gabriel Gonzaga",
      "Mirko Cro Cop",
      "Stefan Struve"
    ],
    "answer": "Fabricio Werdum",
    "explanation": "Junior dos Santos knocked out Werdum with an uppercut at UFC 90.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-90",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-f-004",
    "league": "ufc",
    "round": "last-call",
    "category": "Last Call: Historic Fight Moments",
    "prompt": "Which former PRIDE champion did Quinton Jackson defeat to unify light heavyweight gold at UFC 75?",
    "choices": [
      "Dan Henderson",
      "Mauricio Rua",
      "Wanderlei Silva",
      "Ricardo Arona"
    ],
    "answer": "Dan Henderson",
    "explanation": "Jackson outpointed Dan Henderson at UFC 75 to unify UFC and PRIDE titles.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-75",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-f-005",
    "league": "ufc",
    "round": "last-call",
    "category": "Last Call: Historic Fight Moments",
    "prompt": "Who was the opponent in Shogun Rua's UFC debut loss at UFC 76?",
    "choices": [
      "Forrest Griffin",
      "Chuck Liddell",
      "Rashad Evans",
      "Lyoto Machida"
    ],
    "answer": "Forrest Griffin",
    "explanation": "Griffin submitted Shogun Rua in one of the bigger UFC 76 upsets.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-76",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-f-006",
    "league": "ufc",
    "round": "last-call",
    "category": "Last Call: Historic Fight Moments",
    "prompt": "Which fighter delivered the spinning-backfist knockout of Kyle Watson at UFC 129?",
    "choices": [
      "John Makdessi",
      "Edson Barboza",
      "Yair Rodriguez",
      "Carlos Condit"
    ],
    "answer": "John Makdessi",
    "explanation": "Makdessi finished Watson with a spinning backfist on the UFC 129 card.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-129",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-f-007",
    "league": "ufc",
    "round": "last-call",
    "category": "Last Call: Historic Fight Moments",
    "prompt": "Which fighter stopped Matt Brown with a head kick after the two embraced before the final round at UFC 206?",
    "choices": [
      "Donald Cerrone",
      "Robbie Lawler",
      "Carlos Condit",
      "Stephen Thompson"
    ],
    "answer": "Donald Cerrone",
    "explanation": "Cerrone finished Brown early in Round 3 after a friendly embrace at the beginning of the round.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-206",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-f-008",
    "league": "ufc",
    "round": "last-call",
    "category": "Last Call: Historic Fight Moments",
    "prompt": "Which opponent did Demian Maia finish with a particularly tight choke that caused a nosebleed at UFC 153?",
    "choices": [
      "Rick Story",
      "Jake Shields",
      "Chael Sonnen",
      "Carlos Condit"
    ],
    "answer": "Rick Story",
    "explanation": "Maia submitted Story with a neck crank/choke during his welterweight run.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-153",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-f-013",
    "league": "ufc",
    "round": "last-call",
    "category": "Last Call: Historic Fight Moments",
    "prompt": "Who won the famous five-round war between Chan Sung Jung and Dustin Poirier in 2012?",
    "choices": [
      "Chan Sung Jung",
      "Dustin Poirier",
      "Yair Rodriguez",
      "Max Holloway"
    ],
    "answer": "Chan Sung Jung",
    "explanation": "The Korean Zombie submitted Poirier with a D'Arce choke in the fourth round.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/news/top-500-ufc-moments-list",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "ufc-bt-v3-f-014",
    "league": "ufc",
    "round": "last-call",
    "category": "Last Call: Historic Fight Moments",
    "prompt": "Which two veterans fought in the main event of the UFC's first show in Germany, UFC 99?",
    "choices": [
      "Rich Franklin and Wanderlei Silva",
      "Randy Couture and Antonio Nogueira",
      "Michael Bisping and Dan Henderson",
      "Anderson Silva and Forrest Griffin"
    ],
    "answer": "Rich Franklin and Wanderlei Silva",
    "explanation": "Franklin won a decision over Wanderlei Silva in the UFC 99 main event.",
    "contentType": "evergreen",
    "sourceId": "ufc-v3-moments",
    "sourceUrl": "https://www.ufc.com/event/ufc-99",
    "verifiedAt": "2026-10-24"
  }
];
export const UFC_BAR_TRIVIA_V3_HARD_FINAL: readonly BarTriviaQuestion[] = authored.map((item) => barTriviaQuestion(item));
