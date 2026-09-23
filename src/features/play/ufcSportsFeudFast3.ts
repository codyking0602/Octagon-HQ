import { expandSportsFeudFamilies } from "./sportsFeudAuthoredHelpers";

export const UFC_SPORTS_FEUD_FAST_3 = expandSportsFeudFamilies("ufc-fast3", [
  {
    category: "champion-legacy",
    collisionGroup: "champions",
    prompts: [
      "Name a UFC champion known for a long or dominant reign.",
      "Name a fighter who defended a UFC title repeatedly.",
      "Name a champion who made a division feel like it belonged to them.",
      "Name a UFC titleholder associated with sustained dominance.",
      "Name a champion whose reign became a major part of UFC history.",
    ],
    answers: ["Anderson Silva", "Georges St-Pierre", "Demetrious Johnson", "Jon Jones", "Jose Aldo", "Amanda Nunes", "Valentina Shevchenko", "Israel Adesanya"],
  },
  {
    category: "ufc-history",
    collisionGroup: "tuf",
    prompts: [
      "Name a fighter who became famous through The Ultimate Fighter.",
      "Name a notable UFC fighter who appeared on The Ultimate Fighter.",
      "Name a UFC name strongly connected with TUF.",
      "Name a fighter whose career got a major boost from The Ultimate Fighter.",
      "Name a TUF alum MMA fans still remember.",
    ],
    answers: ["Forrest Griffin", "Stephan Bonnar", "Michael Bisping", "Rashad Evans", "Tony Ferguson", "Nate Diaz", "Matt Serra", "Robert Whittaker"],
  },
  {
    category: "rivalries",
    collisionGroup: "rivalries",
    prompts: [
      "Name a famous UFC rivalry.",
      "Name a pair of fighters whose bad blood made the fight bigger.",
      "Name a UFC feud fans still remember.",
      "Name a rivalry that produced major UFC promotion and drama.",
      "Name two fighters whose rivalry became part of UFC history.",
    ],
    answers: ["McGregor-Diaz", "Jones-Cormier", "Liddell-Ortiz", "Silva-Sonnen", "McGregor-Nurmagomedov", "Hughes-St-Pierre", "Couture-Liddell", "Adesanya-Pereira"],
  },
  {
    category: "fights",
    collisionGroup: "fights",
    prompts: [
      "Name an iconic UFC fight.",
      "Name a UFC fight you would show a new MMA fan.",
      "Name a bout that belongs in a UFC history montage.",
      "Name a fight remembered for incredible action or stakes.",
      "Name a UFC matchup people still talk about years later.",
    ],
    answers: ["Griffin-Bonnar", "Jones-Gustafsson 1", "Lawler-MacDonald 2", "Henderson-Shogun 1", "Adesanya-Gastelum", "Zhang-Jedrzejczyk 1", "McGregor-Diaz 2", "Poirier-Hooker"],
  },
  {
    category: "ufc-history",
    collisionGroup: "pioneers",
    prompts: [
      "Name an early UFC pioneer.",
      "Name a fighter strongly associated with the UFC's early years.",
      "Name an old-school UFC name longtime fans recognize.",
      "Name a fighter who helped establish the UFC before the modern era.",
      "Name a pioneer you would expect in a conversation about early UFC history.",
    ],
    answers: ["Royce Gracie", "Ken Shamrock", "Dan Severn", "Mark Coleman", "Tank Abbott", "Don Frye", "Randy Couture", "Pat Miletich"],
  },
  {
    category: "mma-history",
    collisionGroup: "pride",
    prompts: [
      "Name a PRIDE star who later fought in the UFC.",
      "Name a fighter associated with both PRIDE and the UFC.",
      "Name a Japanese-era MMA legend who eventually appeared in the UFC.",
      "Name a fighter whose résumé connects PRIDE history with UFC history.",
      "Name a former PRIDE standout UFC fans recognize.",
    ],
    answers: ["Wanderlei Silva", "Mauricio Rua", "Dan Henderson", "Mirko Cro Cop", "Quinton Jackson", "Antonio Rodrigo Nogueira", "Anderson Silva", "Fabricio Werdum"],
  },
  {
    category: "ufc-history",
    collisionGroup: "hall-of-fame",
    prompts: [
      "Name a fighter inducted into the UFC Hall of Fame for their career.",
      "Name a UFC Hall of Famer honored for their career.",
      "Name a fighter in the UFC Hall of Fame's Modern or Pioneer Wing.",
      "Name a UFC legend individually inducted into the Hall of Fame.",
      "Name a fighter whose career earned an individual UFC Hall of Fame induction.",
    ],
    answers: ["Royce Gracie", "Chuck Liddell", "Randy Couture", "Georges St-Pierre", "Khabib Nurmagomedov", "BJ Penn", "Michael Bisping", "Ronda Rousey"],
  },
  {
    category: "broadcast",
    collisionGroup: "broadcast",
    prompts: [
      "Name a UFC commentator or analyst fans recognize.",
      "Name a voice you associate with UFC broadcasts.",
      "Name someone you might hear calling or analyzing a UFC fight.",
      "Name a UFC broadcaster whose voice is familiar to MMA fans.",
      "Name a commentator or analyst strongly connected with UFC coverage.",
    ],
    answers: ["Joe Rogan", "Jon Anik", "Daniel Cormier", "Michael Bisping", "Dominick Cruz", "Paul Felder", "Laura Sanko", "Brendan Fitzgerald"],
  },
  {
    category: "officials",
    collisionGroup: "officials",
    prompts: [
      "Name a referee UFC fans recognize.",
      "Name an MMA referee you have seen inside the Octagon.",
      "Name a referee associated with major UFC fights.",
      "Name an official serious UFC fans know by name.",
      "Name a referee you might hear introduced before a UFC main event.",
    ],
    answers: ["Herb Dean", "John McCarthy", "Marc Goddard", "Jason Herzog", "Dan Miragliotta", "Keith Peterson", "Mike Beltran", "Kevin MacDonald"],
  },
  {
    category: "venues",
    collisionGroup: "venues",
    prompts: [
      "Name a venue or place associated with major UFC events.",
      "Name a location where you can picture a huge UFC card.",
      "Name a venue that has hosted memorable UFC nights.",
      "Name a place UFC fans associate with big fights.",
      "Name a UFC event location that feels familiar to longtime fans.",
    ],
    answers: ["T-Mobile Arena", "Madison Square Garden", "MGM Grand Garden Arena", "UFC APEX", "The O2", "Fight Island", "Honda Center", "Etihad Arena"],
  },
] as const);
