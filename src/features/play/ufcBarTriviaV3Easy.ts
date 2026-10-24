import { barTriviaQuestion, type BarTriviaQuestion } from "../games/barTriviaEngine";

/** New easy UFC Bar Trivia editorial candidates for the twenty-appearance cycle.
 * Answers are authored as the first choice; the existing engine shuffles choices.
 */
const SOURCES = {
  moments: "https://www.ufc.com/news/top-500-ufc-moments-list",
  ufc30: "https://www.ufc.com/30",
} as const;

const data = [
  [
    "e01",
    "Which former UFC heavyweight champion first became a household name in WWE?",
    "Brock Lesnar",
    "Stipe Miocic",
    "Cain Velasquez",
    "Junior dos Santos",
    "Brock Lesnar was a WWE star before becoming UFC heavyweight champion.",
    "moments",
    "Crossovers"
  ],
  [
    "e02",
    "Which UFC superstar fought boxer Floyd Mayweather in a 2017 crossover bout?",
    "Conor McGregor",
    "Nate Diaz",
    "Michael Bisping",
    "Jorge Masvidal",
    "McGregor boxed Mayweather in the blockbuster 2017 crossover event.",
    "moments",
    "Crossovers"
  ],
  [
    "e03",
    "Which former UFC champion later became a major star in WWE?",
    "Ronda Rousey",
    "Holly Holm",
    "Amanda Nunes",
    "Joanna Jedrzejczyk",
    "Rousey followed her UFC title run with a prominent WWE career.",
    "ufc30",
    "Crossovers"
  ],
  [
    "e04",
    "Which country does former featherweight champion Alexander Volkanovski represent?",
    "Australia",
    "Ireland",
    "England",
    "New Zealand",
    "Volkanovski is an Australian former UFC featherweight champion.",
    "ufc30",
    "Fighter Origins"
  ],
  [
    "e05",
    "Which country is longtime UFC star Israel Adesanya especially associated with as his fighting home?",
    "New Zealand",
    "Canada",
    "England",
    "South Africa",
    "Adesanya rose as a star fighting out of New Zealand.",
    "ufc30",
    "Fighter Origins"
  ],
  [
    "e06",
    "Which African country is former heavyweight champion Francis Ngannou from?",
    "Cameroon",
    "Nigeria",
    "Ghana",
    "Senegal",
    "Ngannou was born in Cameroon before becoming a UFC heavyweight champion.",
    "ufc30",
    "Fighter Origins"
  ],
  [
    "e07",
    "Which European country does former light heavyweight champion Jiri Prochazka represent?",
    "Czech Republic",
    "Poland",
    "Sweden",
    "Serbia",
    "Prochazka represents the Czech Republic.",
    "moments",
    "Fighter Origins"
  ],
  [
    "e08",
    "Which country is former title challenger Alexander Gustafsson from?",
    "Sweden",
    "Denmark",
    "Norway",
    "Finland",
    "Gustafsson helped make Swedish MMA prominent through his UFC title challenges.",
    "moments",
    "Fighter Origins"
  ],
  [
    "e09",
    "Which American state is famously associated with Dustin Poirier's Lafayette roots?",
    "Louisiana",
    "Texas",
    "Florida",
    "Georgia",
    "Poirier grew up in Lafayette, Louisiana.",
    "moments",
    "Fighter Origins"
  ],
  [
    "e10",
    "Which California city is famously associated with the Diaz brothers?",
    "Stockton",
    "San Jose",
    "Fresno",
    "Sacramento",
    "Nick and Nate Diaz are famously associated with Stockton.",
    "moments",
    "Fan Culture"
  ],
  [
    "e11",
    "Which boxer-turned-UFC champion was nicknamed 'The Preacher's Daughter'?",
    "Holly Holm",
    "Miesha Tate",
    "Ronda Rousey",
    "Valentina Shevchenko",
    "Holly Holm was a decorated boxer before winning UFC bantamweight gold.",
    "moments",
    "Fighter Backgrounds"
  ],
  [
    "e12",
    "Which former UFC champion was an Olympic wrestler before his MMA career?",
    "Daniel Cormier",
    "Michael Bisping",
    "Conor McGregor",
    "Max Holloway",
    "Daniel Cormier represented the United States in Olympic wrestling.",
    "ufc30",
    "Fighter Backgrounds"
  ],
  [
    "e13",
    "Which former UFC champion was known for the pre-fight cry 'Chama!'?",
    "Alex Pereira",
    "Charles Oliveira",
    "Jose Aldo",
    "Fabricio Werdum",
    "Alex Pereira's 'Chama!' catchphrase became popular with UFC fans.",
    "moments",
    "Fan Culture"
  ],
  [
    "e14",
    "Which Brazilian UFC legend is especially famous for his precise front kicks and elusive striking style?",
    "Anderson Silva",
    "Wanderlei Silva",
    "Vitor Belfort",
    "Junior dos Santos",
    "Anderson Silva's striking, including his celebrated front-kick finish, defined his middleweight reign.",
    "moments",
    "Fighting Styles"
  ],
  [
    "e15",
    "Which former UFC champion was nicknamed 'The Last Stylebender'?",
    "Israel Adesanya",
    "Robert Whittaker",
    "Sean Strickland",
    "Alex Pereira",
    "Adesanya's full fight nickname is The Last Stylebender.",
    "ufc30",
    "Nicknames"
  ],
  [
    "e16",
    "Which fighter famously celebrated major wins with his coach John Kavanagh and Irish supporters?",
    "Conor McGregor",
    "Nate Diaz",
    "Max Holloway",
    "Jorge Masvidal",
    "McGregor's early title run helped drive a surge of Irish UFC fandom.",
    "ufc30",
    "Fan Culture"
  ],
  [
    "e17",
    "Which fan-favorite heavyweight is known for drinking from shoes during postfight celebrations?",
    "Tai Tuivasa",
    "Derrick Lewis",
    "Stipe Miocic",
    "Mark Hunt",
    "Tai Tuivasa made the postfight shoey a memorable UFC celebration.",
    "moments",
    "Celebrations"
  ],
  [
    "e18",
    "Which former UFC champion fought in both the featherweight and lightweight divisions and was called 'The Answer'?",
    "Frankie Edgar",
    "Anthony Pettis",
    "Benson Henderson",
    "Dominick Cruz",
    "Frankie Edgar was nicknamed The Answer and held UFC lightweight gold.",
    "moments",
    "Nicknames"
  ],
  [
    "e19",
    "Which heavyweight shocked the UFC audience with a walk-off knockout of Alistair Overeem in 2017?",
    "Francis Ngannou",
    "Stipe Miocic",
    "Curtis Blaydes",
    "Derrick Lewis",
    "Ngannou's uppercut against Overeem became a signature career highlight.",
    "moments",
    "Iconic Knockouts"
  ],
  [
    "e20",
    "Which UFC fighter became famous for a pre-fight walkout with a distinctive papakha fur hat?",
    "Khabib Nurmagomedov",
    "Conor McGregor",
    "Tony Ferguson",
    "Justin Gaethje",
    "Khabib often appeared in a traditional papakha hat.",
    "ufc30",
    "Walkouts"
  ],
  [
    "e21",
    "Which fighter is famous for the line 'I'm not impressed by your performance'?",
    "Georges St-Pierre",
    "Nate Diaz",
    "Chael Sonnen",
    "Michael Bisping",
    "Georges St-Pierre famously delivered the line after a rival's fight.",
    "moments",
    "Famous Quotes"
  ],
  [
    "e22",
    "Which former middleweight champion competed in the UFC after starring in the PRIDE promotion?",
    "Anderson Silva",
    "Michael Bisping",
    "Chris Weidman",
    "Rich Franklin",
    "Anderson Silva fought in PRIDE before his historic UFC middleweight reign.",
    "ufc30",
    "MMA History"
  ],
  [
    "e23",
    "Which longtime UFC fighter earned the nickname 'The Irish Dragon'?",
    "Paul Felder",
    "Conor McGregor",
    "Ian Garry",
    "Tom Aspinall",
    "Paul Felder became known as The Irish Dragon.",
    "moments",
    "Nicknames"
  ],
  [
    "e24",
    "Which popular UFC fighter was famously called 'The Korean Zombie'?",
    "Chan Sung Jung",
    "Dong Hyun Kim",
    "Doo Ho Choi",
    "Yair Rodriguez",
    "Chan Sung Jung became known for relentless fighting and durability.",
    "moments",
    "Fighter Personalities"
  ],
  [
    "e25",
    "Which former heavyweight champion also worked as an Ohio firefighter?",
    "Stipe Miocic",
    "Brock Lesnar",
    "Cain Velasquez",
    "Fabricio Werdum",
    "Stipe Miocic famously balanced his fighting career with firefighting.",
    "ufc30",
    "Fighter Backgrounds"
  ],
  [
    "e26",
    "Which former champion famously wore a necklace of Hawaiian flowers during walkouts?",
    "Max Holloway",
    "Daniel Cormier",
    "Sean O'Malley",
    "Beneil Dariush",
    "Hawaiian fighter Max Holloway has celebrated his home roots in his UFC appearances.",
    "moments",
    "Walkouts"
  ],
  [
    "e27",
    "Which former UFC titleholder was an Olympic gold medalist in freestyle wrestling?",
    "Henry Cejudo",
    "Daniel Cormier",
    "Ronda Rousey",
    "Brock Lesnar",
    "Henry Cejudo won Olympic wrestling gold before UFC championship titles.",
    "ufc30",
    "Olympic Backgrounds"
  ],
  [
    "e28",
    "Which former UFC champion was popularly known as 'The Nigerian Nightmare'?",
    "Kamaru Usman",
    "Israel Adesanya",
    "Francis Ngannou",
    "Dricus du Plessis",
    "Kamaru Usman's long-established nickname is The Nigerian Nightmare.",
    "ufc30",
    "Nicknames"
  ],
  [
    "e29",
    "Which former UFC fighter became known for his long blond curls and nickname 'The California Kid'?",
    "Urijah Faber",
    "Cody Garbrandt",
    "TJ Dillashaw",
    "Dominick Cruz",
    "Urijah Faber built a reputation as the California Kid.",
    "moments",
    "Fighter Personalities"
  ],
  [
    "e30",
    "Which former UFC heavyweight champion was famous for repeatedly saying 'I'm the best boxer in the UFC'?",
    "Junior dos Santos",
    "Stipe Miocic",
    "Brock Lesnar",
    "Frank Mir",
    "Junior dos Santos built his MMA career around powerful boxing.",
    "moments",
    "Fighting Styles"
  ],
  [
    "e31",
    "Which former UFC champion competed in a legendary 2015 fight against Rory MacDonald?",
    "Robbie Lawler",
    "Johny Hendricks",
    "Carlos Condit",
    "Nick Diaz",
    "Robbie Lawler and Rory MacDonald staged a celebrated welterweight title rematch.",
    "moments",
    "Iconic Fights"
  ],
  [
    "e32",
    "Which former UFC fighter famously yelled 'Who the f--- is that guy?' at a press conference?",
    "Conor McGregor",
    "Nate Diaz",
    "Tony Ferguson",
    "Michael Bisping",
    "McGregor directed the notorious press conference line at Jeremy Stephens.",
    "moments",
    "Famous Quotes"
  ],
  [
    "e33",
    "Which UFC champion frequently spoke about his late father Abdulmanap as a major coaching influence?",
    "Khabib Nurmagomedov",
    "Conor McGregor",
    "Jon Jones",
    "Anderson Silva",
    "Abdulmanap Nurmagomedov was Khabib's father and longtime coach.",
    "ufc30",
    "Fighter Stories"
  ],
  [
    "e34",
    "Which UFC champion is known for his signature bow-and-arrow celebration?",
    "Alex Pereira",
    "Israel Adesanya",
    "Jiri Prochazka",
    "Jamahal Hill",
    "Pereira's bow-and-arrow gesture references his Indigenous heritage.",
    "ufc30",
    "Celebrations"
  ],
  [
    "e35",
    "Which retired UFC champion became a frequent UFC broadcast commentator alongside Jon Anik?",
    "Daniel Cormier",
    "Conor McGregor",
    "Stipe Miocic",
    "Jose Aldo",
    "Daniel Cormier transitioned into UFC broadcasting.",
    "ufc30",
    "Broadcast"
  ]
] as const;

export const UFC_BAR_TRIVIA_V3_EASY: readonly BarTriviaQuestion[] = data.map(
  ([id, prompt, answer, wrong1, wrong2, wrong3, explanation, source, category]) =>
    barTriviaQuestion({
      id: "ufc-v3-" + id,
      league: "ufc",
      round: "round1",
      category,
      prompt,
      answer,
      choices: [answer, wrong1, wrong2, wrong3],
      explanation,
      sourceId: "ufc-v3-" + source,
      sourceUrl: SOURCES[source],
      verifiedAt: "2026-10-24",
    }),
);
