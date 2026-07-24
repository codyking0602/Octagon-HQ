export interface WavelengthClue {
  id: string;
  category: string;
  text: string;
  rating: number;
}

export interface WavelengthRound {
  target: number;
  clues: WavelengthClue[];
}

export const wavelengthTargets = [18, 27, 31, 35, 43, 47, 50, 56, 60, 62, 65, 67, 70, 72, 75, 77, 79, 82, 84, 85, 88, 91] as const;

const rawClues: Array<Omit<WavelengthClue, "id">> = [
  { category: "FIGHTER TRAIT", text: "Michael Chandler’s ability to follow a game plan", rating: 12 },
  { category: "LOCATION", text: "The UFC Apex as a live crowd atmosphere", rating: 5 },
  { category: "UFC LEGACY", text: "Greg Hardy’s UFC legacy", rating: 9 },
  { category: "FIGHTER", text: "CM Punk as an overall UFC fighter", rating: 2 },
  { category: "UFC CULTURE", text: "Dana White’s press-conference honesty", rating: 20 },
  { category: "UFC DATA", text: "The accuracy of UFC height listings", rating: 15 },
  { category: "PERSONALITY", text: "Hasbulla’s relevance to the UFC product", rating: 19 },
  { category: "FIGHTER TRAIT", text: "An average heavyweight’s five-round cardio", rating: 17 },
  { category: "CHAMPIONSHIP", text: "The legitimacy of a typical UFC interim belt", rating: 30 },
  { category: "UFC RESUME", text: "Paige VanZant’s UFC-only résumé", rating: 25 },
  { category: "LOCATION", text: "The UFC Apex as a fan travel destination", rating: 22 },
  { category: "PERSONALITY", text: "Tito Ortiz’s public speaking", rating: 29 },
  { category: "UFC DECISION", text: "Signing CM Punk as a sporting decision", rating: 27 },
  { category: "ATMOSPHERE", text: "The crowd energy for an average Apex prelim", rating: 28 },
  { category: "POPULARITY", text: "Greg Hardy’s popularity with hardcore UFC fans", rating: 32 },
  { category: "UFC SYSTEM", text: "The usefulness of the official UFC rankings", rating: 34 },
  { category: "UFC SYSTEM", text: "UFC judging as a whole", rating: 37 },
  { category: "MATCHMAKING", text: "The need for a fourth Moreno–Figueiredo fight", rating: 32 },
  { category: "UFC LEGACY", text: "Sage Northcutt’s UFC legacy", rating: 34 },
  { category: "UFC CULTURE", text: "The quality of an average modern UFC poster", rating: 38 },
  { category: "UFC HISTORY", text: "The BMF belt’s importance to UFC history", rating: 39 },
  { category: "CONTENDER", text: "Paulo Costa’s reliability as a contender", rating: 47 },
  { category: "PERSONALITY", text: "Nina Drama as a UFC personality", rating: 44 },
  { category: "CHAMPIONSHIP", text: "Colby Covington’s championship credibility", rating: 42 },
  { category: "CHAMPIONSHIP", text: "Jorge Masvidal’s championship résumé", rating: 45 },
  { category: "CHAMPIONSHIP", text: "Chael Sonnen’s actual UFC championship résumé", rating: 48 },
  { category: "UFC CULTURE", text: "The prestige of the BMF title", rating: 50 },
  { category: "UFC HISTORY", text: "Tito Ortiz’s relevance to modern UFC fans", rating: 46 },
  { category: "UFC RESUME", text: "Michael Chandler’s UFC-only résumé", rating: 53 },
  { category: "UFC CULTURE", text: "The BMF belt’s competitive meaning", rating: 47 },
  { category: "UFC CONTENT", text: "UFC Embedded as weekly viewing", rating: 51 },
  { category: "CONTENDER", text: "Kevin Holland’s reliability as a contender", rating: 49 },
  { category: "FIGHTER SKILL", text: "Derrick Lewis’s technical depth", rating: 53 },
  { category: "UFC RESUME", text: "Jorge Masvidal’s UFC-only résumé", rating: 58 },
  { category: "COMMENTARY", text: "Joe Rogan’s technical commentary", rating: 55 },
  { category: "LOCATION", text: "Las Vegas as a UFC travel destination", rating: 59 },
  { category: "UFC CAREER", text: "Michael Chandler’s UFC career", rating: 61 },
  { category: "PRESENTATION", text: "Fight Island’s visual presentation", rating: 63 },
  { category: "UFC RESUME", text: "Colby Covington’s UFC-only résumé", rating: 58 },
  { category: "UFC SYSTEM", text: "The consistency of UFC Hall of Fame selections", rating: 57 },
  { category: "STAR POWER", text: "Paddy Pimblett’s star power", rating: 65 },
  { category: "GOAT CASE", text: "Tony Ferguson’s UFC-only GOAT case", rating: 59 },
  { category: "PRESENTATION", text: "Bruce Buffer’s catchphrase quality", rating: 64 },
  { category: "UFC CULTURE", text: "The Reebok era’s visual identity", rating: 60 },
  { category: "CHAMPIONSHIP", text: "Dustin Poirier’s championship résumé", rating: 62 },
  { category: "OFFICIATING", text: "Herb Dean’s overall refereeing reputation", rating: 66 },
  { category: "PRESENTATION", text: "Israel Adesanya’s walkout creativity", rating: 68 },
  { category: "UFC HISTORY", text: "The Ultimate Fighter’s relevance to today’s UFC", rating: 64 },
  { category: "FIGHTER SKILL", text: "Khamzat Chimaev’s microphone skills", rating: 65 },
  { category: "ATMOSPHERE", text: "Madison Square Garden’s UFC crowd atmosphere", rating: 70 },
  { category: "UFC RESUME", text: "Anthony Pettis’s UFC-only résumé", rating: 66 },
  { category: "FIGHTER SKILL", text: "A spinning back kick as a high-percentage technique", rating: 63 },
  { category: "UFC RESUME", text: "Donald Cerrone’s UFC-only résumé", rating: 71 },
  { category: "COMMENTARY", text: "Dominick Cruz as a commentator", rating: 68 },
  { category: "ATMOSPHERE", text: "A packed UFC Fight Night crowd in London", rating: 73 },
  { category: "UFC CULTURE", text: "The BMF belt as entertainment", rating: 69 },
  { category: "FIGHTER SKILL", text: "Justin Gaethje’s wrestling", rating: 74 },
  { category: "CHAMPIONSHIP", text: "Belal Muhammad’s championship résumé", rating: 70 },
  { category: "LOCATION", text: "Abu Dhabi as a UFC location", rating: 75 },
  { category: "FIGHTER", text: "Chase Hooper as an overall UFC fighter", rating: 69 },
  { category: "PERSONALITY", text: "Alex Pereira’s ability to create hype without saying much", rating: 76 },
  { category: "FIGHTER SKILL", text: "Charles Oliveira’s recovery", rating: 78 },
  { category: "ATMOSPHERE", text: "A major UFC crowd in London", rating: 74 },
  { category: "UFC CULTURE", text: "“The Korean Zombie” as a fighter nickname", rating: 77 },
  { category: "FIGHTER SKILL", text: "Alexander Volkanovski’s fight IQ", rating: 80 },
  { category: "UFC HISTORY", text: "McGregor–Aldo’s historical importance", rating: 79 },
  { category: "COMMENTARY", text: "Laura Sanko as a commentator", rating: 75 },
  { category: "UFC CONTENT", text: "UFC Embedded as promotional content", rating: 74 },
  { category: "FIGHTER SKILL", text: "Sean O’Malley’s striking accuracy", rating: 81 },
  { category: "UFC HISTORY", text: "UFC 205’s historical importance", rating: 78 },
  { category: "COMMENTARY", text: "Daniel Cormier as an analyst", rating: 76 },
  { category: "PERSONALITY", text: "Nate Diaz’s authenticity", rating: 80 },
  { category: "PROMOTION", text: "Conor McGregor’s promotional impact", rating: 86 },
  { category: "FIGHT", text: "Zhang Weili vs. Joanna Jędrzejczyk’s rewatchability", rating: 84 },
  { category: "COACHING", text: "Trevor Wittman as a coach", rating: 79 },
  { category: "VENUE", text: "Madison Square Garden as a UFC venue", rating: 81 },
  { category: "UFC LEGACY", text: "José Aldo’s UFC-only legacy", rating: 82 },
  { category: "FIGHTER SKILL", text: "Islam Makhachev’s technical completeness", rating: 87 },
  { category: "EVENT", text: "UFC 300’s card depth", rating: 85 },
  { category: "UFC HISTORY", text: "Joe Rogan’s importance to UFC history", rating: 83 },
  { category: "FIGHTER TRAIT", text: "Max Holloway’s durability", rating: 88 },
  { category: "COMMENTARY", text: "Jon Anik’s play-by-play", rating: 84 },
  { category: "PRIME", text: "Khabib Nurmagomedov’s prime dominance", rating: 87 },
  { category: "EVENT", text: "UFC 300 as an event", rating: 83 },
  { category: "FIGHTER SKILL", text: "Georges St-Pierre’s fight IQ", rating: 91 },
  { category: "AURA", text: "Alex Pereira’s aura", rating: 89 },
  { category: "UFC HISTORY", text: "Bruce Buffer’s importance to the UFC", rating: 86 },
  { category: "FIGHT", text: "Jones–Gustafsson I’s historical value", rating: 87 },
  { category: "FIGHTER SKILL", text: "Demetrious Johnson’s technical skill", rating: 93 },
  { category: "AURA", text: "Anderson Silva’s peak aura", rating: 92 },
  { category: "PRIME", text: "Khabib Nurmagomedov’s UFC prime record", rating: 95 },
  { category: "ATMOSPHERE", text: "UFC 229’s atmosphere", rating: 89 },
  { category: "GOAT CASE", text: "Jon Jones’s UFC-only GOAT résumé", rating: 99 },
  { category: "FIGHTER SKILL", text: "Georges St-Pierre’s completeness", rating: 96 },
  { category: "GOAT CASE", text: "Amanda Nunes’s women’s UFC GOAT case", rating: 94 },
  { category: "FIGHTER TRAIT", text: "Max Holloway’s chin", rating: 93 },
];

export const wavelengthClues: readonly WavelengthClue[] = rawClues.map((clue, index) => ({
  ...clue,
  id: `clue-${index + 1}`,
}));

export function clampWavelength(value: number) {
  return Math.max(1, Math.min(100, Math.round(value)));
}

export function wavelengthScore(guess: number, target: number) {
  return Math.max(0, 100 - Math.abs(guess - target));
}

export function wavelengthDistanceCopy(distance: number) {
  if (distance === 0) return "NAILED IT";
  if (distance === 1) return "ONE POINT OFF";
  if (distance <= 3) return `${distance} POINTS OFF · ELITE READ`;
  if (distance <= 7) return `${distance} POINTS OFF · CLOSE`;
  return `${distance} POINTS OFF`;
}

export function desiredWavelengthCorrection(target: number, guess: number, nextClueIndex: number, random = Math.random) {
  const error = target - guess;
  if (Math.abs(error) <= 2) return clampWavelength(target + (random() > 0.5 ? 2 : -2));
  const factors = [0, 0.36, 0.5, 0.62];
  const factor = factors[nextClueIndex] ?? 0.5;
  const push = Math.max(4, Math.min(22, Math.round(Math.abs(error) * factor)));
  return clampWavelength(target + (Math.sign(error) * push));
}

export function chooseWavelengthClue(
  desiredRating: number,
  options: {
    target: number;
    direction?: number;
    usedIds?: readonly string[];
    usedCategories?: readonly string[];
    random?: () => number;
  },
) {
  const random = options.random ?? Math.random;
  const usedIds = new Set(options.usedIds ?? []);
  const usedCategories = new Set(options.usedCategories ?? []);
  let candidates = wavelengthClues.filter((clue) => !usedIds.has(clue.id));
  if ((options.direction ?? 0) > 0) {
    const directional = candidates.filter((clue) => clue.rating > options.target);
    if (directional.length) candidates = directional;
  } else if ((options.direction ?? 0) < 0) {
    const directional = candidates.filter((clue) => clue.rating < options.target);
    if (directional.length) candidates = directional;
  }
  return [...candidates]
    .map((clue) => ({
      clue,
      score: Math.abs(clue.rating - desiredRating) + (usedCategories.has(clue.category) ? 12 : 0) + random() * 2.5,
    }))
    .sort((left, right) => left.score - right.score)[0]?.clue ?? wavelengthClues[0];
}

export function createWavelengthRound(previousTarget = 0, random = Math.random): WavelengthRound {
  const targets = wavelengthTargets.filter((target) => target !== previousTarget);
  const target = targets[Math.floor(random() * targets.length)] ?? 65;
  const firstClue = chooseWavelengthClue(clampWavelength(target + (random() > 0.5 ? 3 : -3)), {
    target,
    random,
  });
  return { target, clues: [firstClue] };
}

export function nextWavelengthClue(
  round: WavelengthRound,
  lastGuess: number,
  nextClueIndex: number,
  random = Math.random,
) {
  const direction = Math.sign(round.target - lastGuess);
  const desired = desiredWavelengthCorrection(round.target, lastGuess, nextClueIndex, random);
  return chooseWavelengthClue(desired, {
    target: round.target,
    direction,
    usedIds: round.clues.map((clue) => clue.id),
    usedCategories: round.clues.map((clue) => clue.category),
    random,
  });
}
