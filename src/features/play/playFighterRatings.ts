import type { RankingFighter } from "../rankings/rankingModel";

export type PlayGender = "men" | "women";

export const PLAY_ONLY_RATING_METHODOLOGY_VERSION = "play-ufc-depth-v1";
export const PLAY_ONLY_RATING_INITIAL_PASS_VERSION = "play-ufc-depth-initial-v1";
export const PLAY_ONLY_RATING_RECONCILIATION_VERSION = "play-ufc-depth-reconciliation-v1";
export const PLAY_ONLY_RATING_REVIEW_DATE = "2026-08-04";
export const PLAY_ONLY_MATERIAL_DISAGREEMENT_THRESHOLD = 12;
export const PLAY_ONLY_SUPPORTED_CATEGORY_IDS = ["career", "striking", "grappling"] as const;

export type PlayOnlySupportedCategoryId = typeof PLAY_ONLY_SUPPORTED_CATEGORY_IDS[number];
export type PlayCategoryRatings = Record<PlayOnlySupportedCategoryId, number>;

export interface PlayOnlyFighterRatingEvidence {
  id: string;
  name: string;
  gender: PlayGender;
  divisions: readonly string[];
  mainEra: string;
  ufcEvidence: {
    scope: "ufc-only";
    summary: string;
  };
  review: {
    initialPassVersion: typeof PLAY_ONLY_RATING_INITIAL_PASS_VERSION;
    reconciliationPassVersion: typeof PLAY_ONLY_RATING_RECONCILIATION_VERSION;
    status: "approved" | "quarantined";
  };
  ratings: PlayCategoryRatings;
}

export type PlayOnlyRatingResolution = "confirmed" | "rerated" | "rewritten" | "quarantined";

export interface PlayOnlyRatingReviewDecision {
  fighterId: string;
  category: PlayOnlySupportedCategoryId;
  initialRating: number;
  secondPassRating: number;
  resolvedRating: number;
  resolution: PlayOnlyRatingResolution;
  rationale: string;
}

export const PLAY_ONLY_RATING_RUBRIC = {
  version: PLAY_ONLY_RATING_METHODOLOGY_VERSION,
  scope: "UFC-only career evidence for career, striking, and grappling ratings used by current Play fighter categories.",
  bands: [
    "92-100: ranked-title or historically elite UFC evidence; normally supplied by canonical rankings, not Play-only records.",
    "82-91: strong contender or former-champion UFC evidence outside the current ranked projection.",
    "70-81: established veteran, ranked-quality wins, or clearly dangerous specialist UFC evidence.",
    "55-69: credible middle-tier UFC evidence with either winning UFC production or durable divisional relevance.",
    "35-54: below-average UFC evidence, limited success, exploitable skill gaps, or short replacement-level runs.",
    "0-34: clearly unsuccessful UFC evidence or novelty/low-end UFC runs.",
  ],
  reviewProcess: [
    "Initial placement uses UFC-only record quality, ranked/champion context, divisional relevance, and category-specific skill evidence.",
    "A separate reconciliation pass compares the placement against calculated ranked-fighter bands and neighboring Play-only evidence.",
    `A material disagreement is a category gap of ${PLAY_ONLY_MATERIAL_DISAGREEMENT_THRESHOLD} or more points.`,
    "Material disagreements are resolved by a documented rerating, rewrite, removal, or quarantine; they are never blindly averaged.",
    "A semantic methodology change requires a new version instead of rewriting historical evidence in place.",
  ],
} as const;

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Ranked fighters stay projected from the canonical calculated ranking model.
 * No ranked identity, OVR, total, or category map is copied into the Play-only owner.
 */
export function projectRankedPlayRatings(fighter: RankingFighter): PlayCategoryRatings {
  const finish = fighter.visibleStats.finishRatePct;
  const prime = Math.min(100, (fighter.primeDominance / 30) * 100);
  const apex = Math.min(100, 55 + (fighter.apexPeak / 6) * 44);
  const quality = Math.min(100, (fighter.opponentQuality / 30) * 100);
  const championship = Math.min(100, (fighter.championship / 30) * 100);
  const control = fighter.visibleStats.roundsWonPct;

  return {
    career: fighter.ovr,
    striking: clamp((prime * 0.45) + (finish * 0.3) + (apex * 0.25)),
    grappling: clamp((quality * 0.32) + (championship * 0.28) + (control * 0.4)),
  };
}

const e = (
  id: string,
  name: string,
  gender: PlayGender,
  divisions: readonly string[],
  mainEra: string,
  ufcSummary: string,
  ratings: PlayCategoryRatings,
): PlayOnlyFighterRatingEvidence => ({
  id,
  name,
  gender,
  divisions,
  mainEra,
  ufcEvidence: { scope: "ufc-only", summary: ufcSummary },
  review: {
    initialPassVersion: PLAY_ONLY_RATING_INITIAL_PASS_VERSION,
    reconciliationPassVersion: PLAY_ONLY_RATING_RECONCILIATION_VERSION,
    status: "approved",
  },
  ratings,
});

export const playOnlyFighterRatings: readonly PlayOnlyFighterRatingEvidence[] = [
  e("cm-punk", "CM Punk", "men", ["Welterweight"], "Superstar Era", "UFC 203 and UFC 225 appearances", { career: 5, striking: 5, grappling: 8 }),
  e("kimbo-slice", "Kimbo Slice", "men", ["Heavyweight"], "TUF Boom", "UFC 113 win and TUF 10 UFC tenure", { career: 25, striking: 45, grappling: 20 }),
  e("paulo-costa", "Paulo Costa", "men", ["Middleweight"], "ESPN+ Era", "UFC title challenger and ranked middleweight wins", { career: 67, striking: 78, grappling: 55 }),
  e("marvin-vettori", "Marvin Vettori", "men", ["Middleweight"], "ESPN+ Era", "UFC title challenger with durable ranked middleweight run", { career: 69, striking: 63, grappling: 72 }),
  e("derek-brunson", "Derek Brunson", "men", ["Middleweight"], "ESPN+ Era", "Long UFC middleweight contender run", { career: 68, striking: 60, grappling: 76 }),
  e("uriah-hall", "Uriah Hall", "men", ["Middleweight"], "ESPN+ Era", "Long UFC middleweight run with highlight knockouts", { career: 58, striking: 76, grappling: 45 }),
  e("edmen-shahbazyan", "Edmen Shahbazyan", "men", ["Middleweight"], "ESPN+ Era", "UFC middleweight prospect and veteran wins", { career: 49, striking: 62, grappling: 42 }),
  e("sam-alvey", "Sam Alvey", "men", ["Middleweight", "Light Heavyweight"], "ESPN+ Era", "Long UFC tenure with extended winless closing stretch", { career: 38, striking: 51, grappling: 35 }),
  e("johnny-walker", "Johnny Walker", "men", ["Light Heavyweight"], "ESPN+ Era", "Ranked UFC light heavyweight with volatile results", { career: 58, striking: 72, grappling: 45 }),
  e("anthony-smith", "Anthony Smith", "men", ["Light Heavyweight", "Middleweight"], "ESPN+ Era", "UFC light heavyweight title challenger", { career: 66, striking: 67, grappling: 63 }),
  e("thiago-santos", "Thiago Santos", "men", ["Light Heavyweight", "Middleweight"], "ESPN+ Era", "UFC title challenger and knockout threat", { career: 69, striking: 82, grappling: 42 }),
  e("volkan-oezdemir", "Volkan Oezdemir", "men", ["Light Heavyweight"], "ESPN+ Era", "UFC title challenger and ranked light heavyweight", { career: 62, striking: 72, grappling: 45 }),
  e("dominick-reyes", "Dominick Reyes", "men", ["Light Heavyweight"], "ESPN+ Era", "UFC title challenger with sharp peak and steep decline", { career: 61, striking: 73, grappling: 48 }),
  e("ovince-saint-preux", "Ovince Saint Preux", "men", ["Light Heavyweight"], "Fox / PPV Boom", "Long UFC light heavyweight run and interim title challenger", { career: 60, striking: 58, grappling: 66 }),
  e("ryan-bader", "Ryan Bader", "men", ["Light Heavyweight"], "Fox / PPV Boom", "UFC top-ten light heavyweight veteran", { career: 64, striking: 55, grappling: 77 }),
  e("patrick-cummins", "Patrick Cummins", "men", ["Light Heavyweight"], "Fox / PPV Boom", "UFC light heavyweight veteran", { career: 42, striking: 35, grappling: 62 }),
  e("ciryl-gane", "Ciryl Gane", "men", ["Heavyweight"], "ESPN+ Era", "UFC interim heavyweight champion and title challenger", { career: 75, striking: 86, grappling: 54 }),
  e("curtis-blaydes", "Curtis Blaydes", "men", ["Heavyweight"], "ESPN+ Era", "UFC heavyweight contender", { career: 70, striking: 58, grappling: 84 }),
  e("alexander-gustafsson", "Alexander Gustafsson", "men", ["Light Heavyweight"], "Fox / PPV Boom", "Multiple-time UFC title challenger", { career: 76, striking: 84, grappling: 65 }),
  e("joseph-benavidez", "Joseph Benavidez", "men", ["Flyweight", "Bantamweight"], "Fox / PPV Boom", "Multiple-time UFC flyweight title challenger", { career: 76, striking: 75, grappling: 82 }),
  e("kenny-florian", "Kenny Florian", "men", ["Lightweight", "Featherweight", "Welterweight"], "TUF Boom", "Multiple-division UFC title challenger", { career: 74, striking: 73, grappling: 80 }),
  e("gray-maynard", "Gray Maynard", "men", ["Lightweight"], "TUF Boom", "UFC lightweight title challenger", { career: 64, striking: 58, grappling: 75 }),
  e("diego-sanchez", "Diego Sanchez", "men", ["Welterweight", "Lightweight"], "TUF Boom", "TUF winner and UFC title challenger", { career: 63, striking: 62, grappling: 69 }),
  e("clay-guida", "Clay Guida", "men", ["Lightweight", "Featherweight"], "Fox / PPV Boom", "Long UFC action-veteran career", { career: 58, striking: 52, grappling: 72 }),
  e("jim-miller", "Jim Miller", "men", ["Lightweight"], "ESPN+ Era", "UFC longevity and wins record holder", { career: 70, striking: 65, grappling: 78 }),
  e("joe-lauzon", "Joe Lauzon", "men", ["Lightweight"], "TUF Boom", "UFC bonus-heavy lightweight veteran", { career: 56, striking: 55, grappling: 76 }),
  e("sage-northcutt", "Sage Northcutt", "men", ["Lightweight", "Welterweight"], "Fox / PPV Boom", "UFC prospect with limited ranked impact", { career: 43, striking: 58, grappling: 38 }),
  e("mike-jackson", "Mike Jackson", "men", ["Welterweight"], "ESPN+ Era", "Low-end UFC welterweight run including CM Punk bout", { career: 12, striking: 22, grappling: 15 }),
  e("mickey-gall", "Mickey Gall", "men", ["Welterweight"], "ESPN+ Era", "UFC welterweight prospect best known for early submission wins", { career: 40, striking: 35, grappling: 62 }),
  e("kevin-lee", "Kevin Lee", "men", ["Lightweight", "Welterweight"], "ESPN+ Era", "UFC interim lightweight title challenger", { career: 66, striking: 62, grappling: 78 }),
  e("michael-johnson", "Michael Johnson", "men", ["Lightweight", "Featherweight"], "ESPN+ Era", "Long UFC lightweight veteran with elite wins and inconsistency", { career: 57, striking: 74, grappling: 43 }),
  e("al-iaquinta", "Al Iaquinta", "men", ["Lightweight"], "ESPN+ Era", "UFC lightweight title challenger on short notice", { career: 55, striking: 66, grappling: 52 }),
  e("nate-diaz", "Nate Diaz", "men", ["Lightweight", "Welterweight"], "Fox / PPV Boom", "UFC title challenger and major rivalry winner", { career: 68, striking: 75, grappling: 82 }),
  e("nick-diaz", "Nick Diaz", "men", ["Welterweight", "Middleweight"], "TUF Boom", "UFC title challenger with notable UFC wins", { career: 62, striking: 78, grappling: 76 }),
  e("jorge-masvidal", "Jorge Masvidal", "men", ["Welterweight", "Lightweight"], "ESPN+ Era", "UFC title challenger and BMF headliner", { career: 69, striking: 80, grappling: 58 }),
  e("colby-covington", "Colby Covington", "men", ["Welterweight"], "ESPN+ Era", "Interim UFC champion and multiple-time title challenger", { career: 75, striking: 70, grappling: 86 }),
  e("stephen-thompson", "Stephen Thompson", "men", ["Welterweight"], "ESPN+ Era", "Multiple-time UFC welterweight title challenger", { career: 73, striking: 90, grappling: 48 }),
  e("gilbert-burns", "Gilbert Burns", "men", ["Welterweight", "Lightweight"], "ESPN+ Era", "UFC welterweight title challenger", { career: 72, striking: 72, grappling: 88 }),
  e("darren-till", "Darren Till", "men", ["Welterweight", "Middleweight"], "ESPN+ Era", "UFC welterweight title challenger", { career: 58, striking: 72, grappling: 45 }),
  e("ben-askren", "Ben Askren", "men", ["Welterweight"], "ESPN+ Era", "Short UFC welterweight run with one official win", { career: 42, striking: 20, grappling: 70 }),
  e("james-vick", "James Vick", "men", ["Lightweight"], "ESPN+ Era", "UFC lightweight veteran with sharp decline", { career: 44, striking: 55, grappling: 45 }),
  e("randa-markos", "Randa Markos", "women", ["Strawweight"], "ESPN+ Era", "Long UFC strawweight veteran", { career: 42, striking: 43, grappling: 55 }),
  e("paige-vanzant", "Paige VanZant", "women", ["Strawweight", "Flyweight"], "Fox / PPV Boom", "UFC strawweight/flyweight veteran and crossover name", { career: 40, striking: 49, grappling: 46 }),
  e("felice-herrig", "Felice Herrig", "women", ["Strawweight"], "Fox / PPV Boom", "UFC strawweight veteran", { career: 41, striking: 50, grappling: 48 }),
  e("michelle-waterson", "Michelle Waterson", "women", ["Strawweight"], "ESPN+ Era", "UFC strawweight contender and main-event veteran", { career: 56, striking: 62, grappling: 60 }),
  e("claudia-gadelha", "Claudia Gadelha", "women", ["Strawweight"], "Fox / PPV Boom", "UFC title challenger-level strawweight contender", { career: 68, striking: 61, grappling: 82 }),
  e("karolina-kowalkiewicz", "Karolina Kowalkiewicz", "women", ["Strawweight"], "Fox / PPV Boom", "UFC strawweight title challenger", { career: 55, striking: 64, grappling: 45 }),
  e("jessica-eye", "Jessica Eye", "women", ["Flyweight", "Bantamweight"], "ESPN+ Era", "UFC flyweight title challenger", { career: 47, striking: 54, grappling: 40 }),
  e("katlyn-chookagian", "Katlyn Chookagian", "women", ["Flyweight"], "ESPN+ Era", "UFC flyweight title challenger and contender", { career: 61, striking: 66, grappling: 48 }),
  e("lauren-murphy", "Lauren Murphy", "women", ["Flyweight", "Bantamweight"], "ESPN+ Era", "UFC flyweight title challenger", { career: 54, striking: 52, grappling: 58 }),
  e("maycee-barber", "Maycee Barber", "women", ["Flyweight"], "ESPN+ Era", "UFC flyweight contender", { career: 57, striking: 63, grappling: 55 }),
  e("cynthia-calvillo", "Cynthia Calvillo", "women", ["Flyweight", "Strawweight"], "ESPN+ Era", "UFC flyweight/strawweight contender run", { career: 45, striking: 42, grappling: 66 }),
  e("bethe-correia", "Bethe Correia", "women", ["Bantamweight"], "Fox / PPV Boom", "UFC bantamweight title challenger", { career: 43, striking: 52, grappling: 34 }),
  e("sara-mcmann", "Sara McMann", "women", ["Bantamweight"], "Fox / PPV Boom", "UFC bantamweight title challenger", { career: 52, striking: 42, grappling: 77 }),
  e("cat-zingano", "Cat Zingano", "women", ["Bantamweight"], "Fox / PPV Boom", "UFC bantamweight title challenger", { career: 58, striking: 55, grappling: 68 }),
  e("germaine-de-randamie", "Germaine de Randamie", "women", ["Featherweight", "Bantamweight"], "ESPN+ Era", "UFC featherweight champion and bantamweight contender", { career: 67, striking: 84, grappling: 42 }),
  e("megan-anderson", "Megan Anderson", "women", ["Featherweight"], "ESPN+ Era", "UFC featherweight title challenger", { career: 39, striking: 55, grappling: 32 }),
  e("darren-elkins", "Darren Elkins", "men", ["Featherweight"], "ESPN+ Era", "Long UFC featherweight veteran", { career: 53, striking: 48, grappling: 66 }),
  e("chan-sung-jung", "Chan Sung Jung", "men", ["Featherweight"], "Fox / PPV Boom", "Multiple-time UFC featherweight title challenger", { career: 70, striking: 78, grappling: 76 }),
  e("brian-ortega", "Brian Ortega", "men", ["Featherweight"], "ESPN+ Era", "Multiple-time UFC featherweight title challenger", { career: 72, striking: 68, grappling: 91 }),
  e("yair-rodriguez", "Yair Rodriguez", "men", ["Featherweight"], "ESPN+ Era", "Interim UFC featherweight champion", { career: 70, striking: 86, grappling: 54 }),
  e("josh-emmett", "Josh Emmett", "men", ["Featherweight"], "ESPN+ Era", "UFC interim featherweight title challenger", { career: 62, striking: 76, grappling: 50 }),
  e("calvin-kattar", "Calvin Kattar", "men", ["Featherweight"], "ESPN+ Era", "UFC featherweight contender", { career: 60, striking: 78, grappling: 45 }),
  e("dan-ige", "Dan Ige", "men", ["Featherweight"], "ESPN+ Era", "UFC featherweight contender", { career: 55, striking: 65, grappling: 55 }),
  e("cub-swanson", "Cub Swanson", "men", ["Featherweight"], "Fox / PPV Boom", "Long UFC featherweight action veteran", { career: 61, striking: 76, grappling: 50 }),
  e("artem-lobov", "Artem Lobov", "men", ["Featherweight"], "Fox / PPV Boom", "UFC featherweight with losing UFC record", { career: 30, striking: 45, grappling: 25 }),
  e("sean-sherk", "Sean Sherk", "men", ["Lightweight", "Welterweight"], "TUF Boom", "UFC lightweight champion", { career: 72, striking: 62, grappling: 84 }),
  e("josh-koscheck", "Josh Koscheck", "men", ["Welterweight"], "TUF Boom", "UFC welterweight title challenger", { career: 63, striking: 58, grappling: 78 }),
  e("thiago-alves", "Thiago Alves", "men", ["Welterweight"], "TUF Boom", "UFC welterweight title challenger", { career: 61, striking: 78, grappling: 48 }),
  e("dan-hardy", "Dan Hardy", "men", ["Welterweight"], "TUF Boom", "UFC welterweight title challenger", { career: 50, striking: 70, grappling: 35 }),
  e("roy-nelson", "Roy Nelson", "men", ["Heavyweight"], "Fox / PPV Boom", "UFC heavyweight veteran and TUF winner", { career: 52, striking: 70, grappling: 55 }),
  e("stefan-struve", "Stefan Struve", "men", ["Heavyweight"], "Fox / PPV Boom", "Long UFC heavyweight veteran", { career: 50, striking: 55, grappling: 62 }),
  e("greg-hardy", "Greg Hardy", "men", ["Heavyweight"], "ESPN+ Era", "UFC heavyweight with limited success", { career: 34, striking: 48, grappling: 20 }),
  e("jared-vanderaa", "Jared Vanderaa", "men", ["Heavyweight"], "ESPN+ Era", "UFC heavyweight with low-end results", { career: 24, striking: 36, grappling: 28 }),
  e("kris-moutinho", "Kris Moutinho", "men", ["Bantamweight"], "ESPN+ Era", "Short UFC bantamweight run", { career: 18, striking: 32, grappling: 20 }),
  e("joshua-culibao", "Joshua Culibao", "men", ["Featherweight"], "ESPN+ Era", "UFC featherweight veteran", { career: 41, striking: 50, grappling: 38 }),
  e("chase-hooper", "Chase Hooper", "men", ["Lightweight", "Featherweight"], "ESPN+ Era", "UFC prospect with grappling-first profile", { career: 45, striking: 32, grappling: 72 }),
  e("bo-nickal", "Bo Nickal", "men", ["Middleweight"], "ESPN+ Era", "UFC middleweight prospect with wrestling base", { career: 46, striking: 40, grappling: 80 }),
  e("raul-rosas-jr", "Raul Rosas Jr.", "men", ["Bantamweight"], "ESPN+ Era", "Young UFC bantamweight prospect", { career: 42, striking: 38, grappling: 68 }),
  e("tony-kelley", "Tony Kelley", "men", ["Bantamweight"], "ESPN+ Era", "Short UFC bantamweight run", { career: 28, striking: 42, grappling: 30 }),
  e("marlon-moraes", "Marlon Moraes", "men", ["Bantamweight"], "ESPN+ Era", "UFC bantamweight title challenger", { career: 61, striking: 80, grappling: 54 }),
  e("cory-sandhagen", "Cory Sandhagen", "men", ["Bantamweight"], "ESPN+ Era", "Interim UFC bantamweight title challenger", { career: 69, striking: 84, grappling: 58 }),
  e("marlon-vera", "Marlon Vera", "men", ["Bantamweight"], "ESPN+ Era", "UFC bantamweight title challenger", { career: 65, striking: 76, grappling: 63 }),
] as const;

/**
 * Concrete reconciliation evidence sampled across high, middle, below-average,
 * and low-end bands. The Ben Askren decision records the material disagreement
 * found during review: pre-UFC dominance was not allowed to inflate UFC-only
 * grappling evidence, and the final value was not an average.
 */
export const PLAY_ONLY_RATING_REVIEW_EVIDENCE: readonly PlayOnlyRatingReviewDecision[] = [
  { fighterId: "alexander-gustafsson", category: "career", initialRating: 76, secondPassRating: 76, resolvedRating: 76, resolution: "confirmed", rationale: "Multiple UFC title challenges and elite UFC performances support the high established-contender band." },
  { fighterId: "stephen-thompson", category: "striking", initialRating: 90, secondPassRating: 90, resolvedRating: 90, resolution: "confirmed", rationale: "UFC title-level striking success and sustained stylistic effectiveness support the elite striking boundary." },
  { fighterId: "brian-ortega", category: "grappling", initialRating: 91, secondPassRating: 91, resolvedRating: 91, resolution: "confirmed", rationale: "Repeated UFC submission threat against ranked opposition supports the historically elite grappling band." },
  { fighterId: "jim-miller", category: "career", initialRating: 70, secondPassRating: 70, resolvedRating: 70, resolution: "confirmed", rationale: "Exceptional UFC longevity and win volume place the career at the established-veteran threshold." },
  { fighterId: "anthony-smith", category: "career", initialRating: 66, secondPassRating: 66, resolvedRating: 66, resolution: "confirmed", rationale: "A UFC title challenge and durable ranked light-heavyweight relevance support the upper middle band." },
  { fighterId: "michelle-waterson", category: "career", initialRating: 56, secondPassRating: 56, resolvedRating: 56, resolution: "confirmed", rationale: "UFC main-event and contender experience support a credible middle-tier career without title-level elevation." },
  { fighterId: "randa-markos", category: "career", initialRating: 42, secondPassRating: 42, resolvedRating: 42, resolution: "confirmed", rationale: "A long UFC tenure with inconsistent results fits the reviewed below-average career band." },
  { fighterId: "sam-alvey", category: "career", initialRating: 38, secondPassRating: 38, resolvedRating: 38, resolution: "confirmed", rationale: "UFC longevity is credited, while the extended winless closing stretch keeps the career below average." },
  { fighterId: "artem-lobov", category: "career", initialRating: 30, secondPassRating: 30, resolvedRating: 30, resolution: "confirmed", rationale: "A losing UFC record and limited divisional impact support the low-end career band." },
  { fighterId: "jared-vanderaa", category: "career", initialRating: 24, secondPassRating: 24, resolvedRating: 24, resolution: "confirmed", rationale: "The reviewed UFC heavyweight results remain clearly within the low-end career band." },
  { fighterId: "mike-jackson", category: "career", initialRating: 12, secondPassRating: 12, resolvedRating: 12, resolution: "confirmed", rationale: "Limited UFC success and replacement-level evidence support a score near the bottom of the pool." },
  { fighterId: "cm-punk", category: "career", initialRating: 5, secondPassRating: 5, resolvedRating: 5, resolution: "confirmed", rationale: "A winless and noncompetitive UFC run remains the benchmark low-end career case." },
  { fighterId: "ryan-bader", category: "career", initialRating: 64, secondPassRating: 64, resolvedRating: 64, resolution: "confirmed", rationale: "Only the UFC top-ten run is scored; later Bellator championship accomplishments are intentionally excluded." },
  { fighterId: "marlon-moraes", category: "career", initialRating: 61, secondPassRating: 61, resolvedRating: 61, resolution: "confirmed", rationale: "The UFC title challenge is credited while WEC accomplishments remain outside the UFC-career score." },
  { fighterId: "kimbo-slice", category: "career", initialRating: 25, secondPassRating: 25, resolvedRating: 25, resolution: "confirmed", rationale: "The short UFC run is scored without credit for celebrity or EliteXC accomplishments." },
  { fighterId: "ben-askren", category: "grappling", initialRating: 82, secondPassRating: 70, resolvedRating: 70, resolution: "rerated", rationale: "The second pass limited the score to UFC evidence and did not import pre-UFC wrestling dominance into the Play rating." },
] as const;

export function validatePlayOnlyRatingDecision(decision: PlayOnlyRatingReviewDecision) {
  const ratings = [decision.initialRating, decision.secondPassRating, decision.resolvedRating];
  if (ratings.some((rating) => !Number.isInteger(rating) || rating < 0 || rating > 100)) return false;
  if (decision.rationale.trim().length < 24) return false;

  const disagreement = Math.abs(decision.initialRating - decision.secondPassRating);
  const material = disagreement >= PLAY_ONLY_MATERIAL_DISAGREEMENT_THRESHOLD;
  if (material) {
    if (decision.resolution === "confirmed") return false;
    if (decision.resolvedRating === Math.round((decision.initialRating + decision.secondPassRating) / 2)) return false;
  } else if (
    decision.resolution === "confirmed"
    && (decision.initialRating !== decision.secondPassRating || decision.resolvedRating !== decision.initialRating)
  ) {
    return false;
  }

  return true;
}

export function validatePlayOnlyRatingAudit() {
  const canonicalKeys = [...PLAY_ONLY_SUPPORTED_CATEGORY_IDS].sort().join("|");
  const byId = new Map(playOnlyFighterRatings.map((fighter) => [fighter.id, fighter]));

  for (const fighter of playOnlyFighterRatings) {
    if (fighter.review.initialPassVersion !== PLAY_ONLY_RATING_INITIAL_PASS_VERSION) return false;
    if (fighter.review.reconciliationPassVersion !== PLAY_ONLY_RATING_RECONCILIATION_VERSION) return false;
    if (fighter.review.status !== "approved") return false;
    if (fighter.ufcEvidence.scope !== "ufc-only" || !/\bUFC\b/i.test(fighter.ufcEvidence.summary)) return false;
    if (Object.keys(fighter.ratings).sort().join("|") !== canonicalKeys) return false;
    if (Object.values(fighter.ratings).some((rating) => !Number.isInteger(rating) || rating < 0 || rating > 100)) return false;
  }

  const seen = new Set<string>();
  for (const decision of PLAY_ONLY_RATING_REVIEW_EVIDENCE) {
    const key = `${decision.fighterId}:${decision.category}`;
    if (seen.has(key) || !validatePlayOnlyRatingDecision(decision)) return false;
    seen.add(key);
    const fighter = byId.get(decision.fighterId);
    if (!fighter || fighter.ratings[decision.category] !== decision.resolvedRating) return false;
  }

  return true;
}

export const PLAY_ONLY_RATING_AUDIT = {
  methodologyVersion: PLAY_ONLY_RATING_METHODOLOGY_VERSION,
  initialPassVersion: PLAY_ONLY_RATING_INITIAL_PASS_VERSION,
  reconciliationPassVersion: PLAY_ONLY_RATING_RECONCILIATION_VERSION,
  reviewDate: PLAY_ONLY_RATING_REVIEW_DATE,
  reviewedRecordCount: playOnlyFighterRatings.length,
  reconciliationEvidenceCount: PLAY_ONLY_RATING_REVIEW_EVIDENCE.length,
  materialDisagreementThreshold: PLAY_ONLY_MATERIAL_DISAGREEMENT_THRESHOLD,
  disagreementPolicy: "Rewrite, rerate, remove, or quarantine. Never blindly average a material disagreement.",
} as const;
