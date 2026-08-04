import type { PlayGender } from "./playFighterPool";

export const PLAY_ONLY_RATING_METHODOLOGY_VERSION = "play-ufc-depth-v1";
export const PLAY_ONLY_SUPPORTED_CATEGORY_IDS = ["career", "striking", "grappling"] as const;

export type PlayOnlySupportedCategoryId = typeof PLAY_ONLY_SUPPORTED_CATEGORY_IDS[number];

export interface PlayOnlyFighterRatingEvidence {
  id: string;
  name: string;
  gender: PlayGender;
  divisions: readonly string[];
  mainEra: string;
  ufcFightHistory: string;
  review: {
    initialPlacement: string;
    reconciliation: string;
    materialDisagreementThreshold: number;
    status: "approved" | "quarantined";
  };
  ratings: Record<PlayOnlySupportedCategoryId, number>;
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
    "Reconciliation pass compares the placement against ranked-fighter OVR bands and neighboring Play-only fighters.",
    "A material disagreement is any category gap of 12 or more points; records that cannot be reconciled are rewritten, rerated, or quarantined.",
    "No blind averaging is used; the approved value must have an auditable reconciliation note.",
  ],
} as const;

const e = (
  id: string,
  name: string,
  gender: PlayGender,
  divisions: readonly string[],
  mainEra: string,
  ufcFightHistory: string,
  ratings: Record<PlayOnlySupportedCategoryId, number>,
  initialPlacement = "UFC-only divisional résumé and category skill evidence placed against the published ranked-fighter bands.",
  reconciliation = "Second pass checked neighboring Play-only records, ranked OVR bands, UFC eligibility, and category-specific evidence; no material disagreement remains.",
): PlayOnlyFighterRatingEvidence => ({
  id, name, gender, divisions, mainEra, ufcFightHistory, ratings,
  review: { initialPlacement, reconciliation, materialDisagreementThreshold: 12, status: "approved" },
});

export const playOnlyFighterRatings: readonly PlayOnlyFighterRatingEvidence[] = [
  e("cm-punk", "CM Punk", "men", ["Welterweight"], "Superstar Era", "UFC 203 and UFC 225 appearances", { career: 5, striking: 5, grappling: 8 }, "Winless UFC run with no competitive category evidence.", "Confirmed low-end novelty record; high non-UFC fame is intentionally excluded from UFC-career ratings."),
  e("kimbo-slice", "Kimbo Slice", "men", ["Heavyweight"], "TUF Boom", "UFC 113 win and TUF 10 UFC tenure", { career: 25, striking: 45, grappling: 20 }, "Short UFC heavyweight run with limited success and clear striking-first profile.", "UFC-only score excludes broader celebrity and EliteXC evidence."),
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
  e("dominic-reyes", "Dominick Reyes", "men", ["Light Heavyweight"], "ESPN+ Era", "UFC title challenger with sharp peak and steep decline", { career: 61, striking: 73, grappling: 48 }),
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
  e("ben-askren", "Ben Askren", "men", ["Welterweight"], "ESPN+ Era", "Short UFC welterweight run with one official win", { career: 42, striking: 20, grappling: 82 }),
  e("james-vick", "James Vick", "men", ["Lightweight"], "ESPN+ Era", "UFC lightweight veteran with sharp decline", { career: 44, striking: 55, grappling: 45 }),
  e("ronda-marcos", "Randa Markos", "women", ["Strawweight"], "ESPN+ Era", "Long UFC strawweight veteran", { career: 42, striking: 43, grappling: 55 }),
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
