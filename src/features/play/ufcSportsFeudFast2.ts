import { expandSportsFeudFamilies } from "./sportsFeudAuthoredHelpers";

export const UFC_SPORTS_FEUD_FAST_2 = expandSportsFeudFamilies("ufc-fast2", [
  {
    category: "gyms",
    collisionGroup: "gyms",
    prompts: [
      "Name a UFC fighter associated with American Top Team.",
      "Name a notable fighter who has trained at American Top Team.",
      "Name a UFC name you connect with ATT.",
      "Name a fighter whose career has included American Top Team.",
      "Name an MMA star associated with the American Top Team camp.",
    ],
    answers: ["Amanda Nunes", "Dustin Poirier", "Jorge Masvidal", "Joanna Jedrzejczyk", "Kayla Harrison", "Thiago Alves", "Yoel Romero", "Junior dos Santos"],
  },
  {
    category: "gyms",
    collisionGroup: "gyms",
    prompts: [
      "Name a UFC fighter associated with AKA.",
      "Name a notable fighter who has trained at American Kickboxing Academy.",
      "Name a UFC name you connect with AKA.",
      "Name a fighter whose career has included AKA.",
      "Name an MMA star associated with the American Kickboxing Academy camp.",
    ],
    answers: ["Khabib Nurmagomedov", "Daniel Cormier", "Cain Velasquez", "Islam Makhachev", "Luke Rockhold", "Josh Thomson", "Jon Fitch", "Josh Koscheck"],
  },
  {
    category: "gyms",
    collisionGroup: "gyms",
    prompts: [
      "Name a UFC fighter associated with City Kickboxing.",
      "Name a notable fighter who has trained at City Kickboxing.",
      "Name a UFC name you connect with City Kickboxing.",
      "Name a fighter whose rise included the City Kickboxing team.",
      "Name an MMA star associated with the Auckland-based City Kickboxing camp.",
    ],
    answers: ["Israel Adesanya", "Alexander Volkanovski", "Dan Hooker", "Kai Kara-France", "Carlos Ulberg", "Brad Riddell", "Shane Young", "Blood Diamond"],
  },
  {
    category: "gyms",
    collisionGroup: "gyms",
    prompts: [
      "Name a UFC fighter associated with Team Alpha Male.",
      "Name a notable fighter who trained with Team Alpha Male.",
      "Name a UFC name you connect with Team Alpha Male.",
      "Name a fighter whose career included the Sacramento-based camp.",
      "Name an MMA star associated with Team Alpha Male.",
    ],
    answers: ["Urijah Faber", "TJ Dillashaw", "Cody Garbrandt", "Chad Mendes", "Joseph Benavidez", "Paige VanZant", "Andre Fili", "Song Yadong"],
  },
  {
    category: "gyms",
    collisionGroup: "gyms",
    prompts: [
      "Name a UFC fighter associated with Jackson Wink.",
      "Name a notable fighter who trained with Jackson Wink MMA.",
      "Name a UFC name you connect with the Albuquerque camp.",
      "Name a fighter whose career included Jackson Wink.",
      "Name an MMA star associated with Greg Jackson's team.",
    ],
    answers: ["Jon Jones", "Holly Holm", "Carlos Condit", "Rashad Evans", "Donald Cerrone", "Diego Sanchez", "Michelle Waterson-Gomez", "Cub Swanson"],
  },
  {
    category: "national-identity",
    collisionGroup: "fighters",
    prompts: [
      "Name a famous Brazilian UFC fighter.",
      "Name a Brazilian fighter who became a major UFC star.",
      "Name a UFC legend from Brazil.",
      "Name a Brazilian champion or contender MMA fans recognize.",
      "Name a fighter who helped build Brazil's UFC legacy.",
    ],
    answers: ["Anderson Silva", "Jose Aldo", "Amanda Nunes", "Charles Oliveira", "Fabricio Werdum", "Junior dos Santos", "Lyoto Machida", "Vitor Belfort"],
  },
  {
    category: "national-identity",
    collisionGroup: "fighters",
    prompts: [
      "Name a famous UFC fighter from the UK or Ireland.",
      "Name a British or Irish fighter who became a major UFC name.",
      "Name a UFC star from the British Isles.",
      "Name a UK or Irish fighter MMA fans recognize quickly.",
      "Name a fighter who helped grow UFC interest in Britain or Ireland.",
    ],
    answers: ["Conor McGregor", "Michael Bisping", "Tom Aspinall", "Leon Edwards", "Paddy Pimblett", "Darren Till", "Molly McCann", "Dan Hardy"],
  },
  {
    category: "national-identity",
    collisionGroup: "fighters",
    prompts: [
      "Name a UFC fighter from Dagestan or strongly associated with Dagestani MMA.",
      "Name a fighter connected to the Dagestani wrestling pipeline.",
      "Name a UFC name fans associate with Dagestan.",
      "Name a fighter from the Nurmagomedov-Makhachev MMA circle.",
      "Name a Dagestani fighter serious UFC fans recognize.",
    ],
    answers: ["Khabib Nurmagomedov", "Islam Makhachev", "Umar Nurmagomedov", "Magomed Ankalaev", "Said Nurmagomedov", "Abubakar Nurmagomedov", "Tagir Ulanbekov", "Zabit Magomedsharipov"],
  },
  {
    category: "women",
    collisionGroup: "women",
    prompts: [
      "Name a famous women's UFC fighter.",
      "Name a female fighter who became a major UFC star.",
      "Name a women's champion or contender almost every MMA fan knows.",
      "Name a fighter who helped shape women's MMA in the UFC.",
      "Name a woman you would expect in a UFC history conversation.",
    ],
    answers: ["Amanda Nunes", "Ronda Rousey", "Valentina Shevchenko", "Joanna Jedrzejczyk", "Rose Namajunas", "Zhang Weili", "Holly Holm", "Cris Cyborg"],
  },
  {
    category: "heavyweights",
    collisionGroup: "heavyweights",
    prompts: [
      "Name a famous UFC heavyweight.",
      "Name a heavyweight who became a major UFC star.",
      "Name a big man whose UFC fights drew major attention.",
      "Name a heavyweight almost every MMA fan recognizes.",
      "Name a fighter you would expect in a UFC heavyweight history conversation.",
    ],
    answers: ["Stipe Miocic", "Francis Ngannou", "Cain Velasquez", "Daniel Cormier", "Randy Couture", "Junior dos Santos", "Derrick Lewis", "Brock Lesnar"],
  },
] as const);
