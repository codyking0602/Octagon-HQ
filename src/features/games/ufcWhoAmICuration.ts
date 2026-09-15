/**
 * UFC Who Am I calibration set (subjects 1-50).
 *
 * The underlying PR10 research remains an archive of sourced person-identity facts.
 * This layer answers a narrower gameplay question: does the fact materially help a
 * knowledgeable sports fan identify the hidden fighter? We retain sports identity,
 * signature public identity, and at most one useful color lane per fighter while
 * removing biography/job/degree/hobby filler from the playable clue pool.
 */
export const UFC_WHO_AM_I_CALIBRATION_SUBJECT_IDS = [
  "ufc:jon-jones",
  "ufc:demetrious-johnson",
  "ufc:khabib-nurmagomedov",
  "ufc:max-holloway",
  "ufc:randy-couture",
  "ufc:alex-pereira",
  "ufc:tj-dillashaw",
  "ufc:francis-ngannou",
  "ufc:aljamain-sterling",
  "ufc:justin-gaethje",
  "ufc:dustin-poirier",
  "ufc:tito-ortiz",
  "ufc:robbie-lawler",
  "ufc:henry-cejudo",
  "ufc:petr-yan",
  "ufc:conor-mcgregor",
  "ufc:lyoto-machida",
  "ufc:dricus-du-plessis",
  "ufc:khamzat-chimaev",
  "ufc:sean-omalley",
  "ufc:forrest-griffin",
  "ufc:chael-sonnen",
  "ufc:valentina-shevchenko",
  "ufc:rose-namajunas",
  "ufc:cris-cyborg",
  "ufc:kayla-harrison",
  "ufc:miesha-tate",
  "ufc:jorge-masvidal",
  "ufc:michael-chandler",
  "ufc:brian-ortega",
  "ufc:ciryl-gane",
  "ufc:marlon-vera",
  "ufc:dominick-reyes",
  "ufc:dan-hooker",
  "ufc:georges-st-pierre",
  "ufc:islam-makhachev",
  "ufc:matt-hughes",
  "ufc:stipe-miocic",
  "ufc:israel-adesanya",
  "ufc:chuck-liddell",
  "ufc:merab-dvalishvili",
  "ufc:cain-velasquez",
  "ufc:junior-dos-santos",
  "ufc:tyron-woodley",
  "ufc:alex-pantoja",
  "ufc:ilia-topuria",
  "ufc:robert-whittaker",
  "ufc:chris-weidman",
  "ufc:sean-strickland",
  "ufc:brandon-moreno",
] as const;

const retainedConceptsBySubject = new Map<string, ReadonlySet<string>>([
  ["ufc:jon-jones", new Set(["iowa-central-wrestling-and-degree", "nfl-brothers-arthur-and-chandler", "youtube-technique-study", "robbery-intervention-title-day"])],
  ["ufc:demetrious-johnson", new Set(["wrestling-accountability-origin", "matt-hume-longtime-mentor", "mighty-mouse-nickname-origin", "lifelong-gamer-and-streamer"])],
  ["ufc:khabib-nurmagomedov", new Set(["father-school-before-fighting", "combat-sambo-world-champion", "post-retirement-coaching-role", "eagle-fighting-championship-owner"])],
  ["ufc:max-holloway", new Set(["josh-keanu-speedbag-gym-origin", "blessed-nickname-origin", "mini-blessed-son-rush"])],
  ["ufc:randy-couture", new Set(["army-101st-airborne-service", "olympic-alternate-wrestling-background", "the-natural-nickname-origin", "expendables-acting-career"])],
  ["ufc:alex-pereira", new Set(["kickboxing-to-escape-alcohol", "glory-simultaneous-two-division-champion", "poatan-indigenous-name-origin", "fighter-sister-aline-pereira"])],
  ["ufc:tj-dillashaw", new Set(["raiders-family-and-football-background", "mma-after-college-wrestling", "ultimate-fighter-team-bisping", "duane-ludwig-colorado-move"])],
  ["ufc:francis-ngannou", new Set(["fourteen-month-migration-seventh-crossing", "boxing-dream-to-mma-factory-pivot"])],
  ["ufc:aljamain-sterling", new Set(["funk-master-nickname-origin", "division-three-all-american-wrestler", "matt-serra-bjj-black-belt"])],
  ["ufc:justin-gaethje", new Set(["morenci-copper-mining-family", "northern-colorado-all-american-wrestler", "highlight-nickname-wrestling-slams"])],
  ["ufc:dustin-poirier", new Set(["fightville-documentary-subject", "diamond-nickname-tim-credeur", "louisiana-hot-sauce-and-cajun-roots"])],
  ["ufc:tito-ortiz", new Set(["ufc-one-royce-gracie-inspiration", "tank-abbott-training-connection", "golden-west-wrestling-scholarship", "ufc-thirteen-no-prize-money"])],
  ["ufc:robbie-lawler", new Set(["father-started-martial-arts-after-brother", "san-diego-to-iowa-athletic-upbringing", "miletich-gym-at-sixteen", "matt-pena-longtime-corner"])],
  ["ufc:henry-cejudo", new Set(["youngest-us-freestyle-olympic-gold", "arizona-bronze-gloves-boxing", "older-brother-angel-wrestling-influence", "triple-c-nickname-origin"])],
  ["ufc:petr-yan", new Set(["boxing-at-thirteen-to-mma", "youth-boxing-trainer-education", "no-mercy-nickname-mindset"])],
  ["ufc:conor-mcgregor", new Set(["crumlin-boxing-after-football", "john-kavanagh-sbg-commitment-pivot", "notorious-nickname-origin", "proper-no-twelve-cofounder"])],
  ["ufc:lyoto-machida", new Set(["shotokan-with-father-from-age-three", "five-thirty-discipline-training", "karate-core-in-mma", "sumo-and-jiu-jitsu-cross-training"])],
  ["ufc:dricus-du-plessis", new Set(["judo-wrestling-kickboxing-childhood", "teenage-south-african-wako-champion", "stillknocks-nickname-brother-origin"])],
  ["ufc:khamzat-chimaev", new Set(["chechnya-to-sweden-wrestling", "hotel-gift-card-allstars-origin", "borz-means-wolf"])],
  ["ufc:sean-omalley", new Set(["helena-montana-first-coach", "sugar-nickname-sweet-to-watch", "fight-week-colorful-hair-tradition", "snoop-dogg-contender-series-connection"])],
  ["ufc:forrest-griffin", new Set(["university-police-officer", "mma-hobby-dan-severn-first-pro", "tuf-one-bonnar-mainstream-breakthrough"])],
  ["ufc:chael-sonnen", new Set(["realtor-and-political-ambitions", "ncaa-and-greco-roman-wrestling", "fighting-as-hobby-philosophy", "american-gangster-persona-origin"])],
  ["ufc:valentina-shevchenko", new Set(["martial-arts-family-start-age-five", "peru-eight-year-home", "lifelong-dance-training", "fighter-sister-antonina"])],
  ["ufc:rose-namajunas", new Set(["martial-arts-since-age-five", "thug-nickname-origin"])],
  ["ufc:cris-cyborg", new Set(["handball-discovery-at-nineteen", "chute-boxe-first-woman", "early-womens-mma-main-event", "cyborg-name-from-evangelista-santos"])],
  ["ufc:kayla-harrison", new Set(["moved-to-boston-for-jimmy-pedro", "first-us-olympic-judo-gold", "youngest-us-rokudan", "retirement-to-striking-to-mma"])],
  ["ufc:miesha-tate", new Set(["boys-wrestling-team-after-basketball", "washington-girls-wrestling-champion", "mma-start-at-nineteen", "cupcake-nickname-and-baking"])],
  ["ufc:jorge-masvidal", new Set(["miami-cuban-american-upbringing", "backyard-fights-kimbo-circle", "gamebred-nickname-brother-origin", "global-pre-ufc-fight-circuit"])],
  ["ufc:michael-chandler", new Set(["missouri-wrestling-walk-on", "woodley-askren-big-brother-influence", "mizzou-wrestling-coach-job", "high-school-football-background"])],
  ["ufc:brian-ortega", new Set(["rener-gracie-student-from-thirteen", "t-city-triangle-nickname-origin", "law-enforcement-self-defense-instructor", "james-luhrsen-garage-training"])],
  ["ufc:ciryl-gane", new Set(["soccer-basketball-youth-sports", "luxury-furniture-coworker-muay-thai", "two-time-france-muay-thai-champion", "fernand-lopez-mma-factory-pivot"])],
  ["ufc:marlon-vera", new Set(["jiu-jitsu-start-at-sixteen", "first-ecuadorian-ufc-fighter", "daughter-surgery-career-motivation", "chito-childhood-nickname-origin", "downloaded-fight-videos-in-ecuador"])],
  ["ufc:dominick-reyes", new Set(["stony-brook-football-safety", "devastator-nickname-origin", "fighter-brother-alex-reyes"])],
  ["ufc:dan-hooker", new Set(["friend-knockout-mma-origin", "hangman-nickname-chokes", "pre-ufc-kickboxing-titles", "one-minute-scraps-promotion"])],
  ["ufc:georges-st-pierre", new Set(["bullying-karate-self-defense", "gymnastics-olympic-lifting-cross-training"])],
  ["ufc:islam-makhachev", new Set(["training-age-ten-self-defense", "combat-sambo-championship-pedigree", "abdulmanap-khabib-training-lineage"])],
  ["ufc:matt-hughes", new Set(["eastern-illinois-all-american-wrestling", "agricultural-company-parallel-career", "ufc-front-office-athlete-development", "identical-twin-mark-mma-partner"])],
  ["ufc:stipe-miocic", new Set(["cleveland-multi-sport-athlete", "cleveland-golden-gloves-boxing", "firefighter-paramedic-career", "croatian-family-roots", "mma-start-helping-training-partner"])],
  ["ufc:israel-adesanya", new Set(["self-protection-training-origin", "computer-graphic-design-study", "last-stylebender-anime-identity", "dance-background-ufc243-walkout"])],
  ["ufc:chuck-liddell", new Set(["karate-since-twelve-dream-gym", "head-tattoo-peace-prosperity", "post-retirement-ufc-executive"])],
  ["ufc:merab-dvalishvili", new Set(["judo-sambo-seven-year-foundation", "georgian-sambo-youth-medals", "lookin-for-a-fight-discovery"])],
  ["ufc:cain-velasquez", new Set(["brown-pride-tattoo-family-heritage", "elite-amateur-wrestling-path", "olympic-path-chose-mma"])],
  ["ufc:junior-dos-santos", new Set(["capoeira-adolescent-origin", "yuri-carlton-jiujitsu-to-mma", "cigano-soap-opera-nickname"])],
  ["ufc:tyron-woodley", new Set(["missouri-wrestling-credentials", "college-wrestling-coach-job", "acting-straight-outta-compton"])],
  ["ufc:alex-pantoja", new Set(["bjj-muay-thai-to-mma-career", "uber-driving-acl-period"])],
  ["ufc:ilia-topuria", new Set(["father-bjj-age-four", "arnold-fighter-tournament-win", "european-youth-bjj-runner-up", "georgia-spain-dual-identity"])],
  ["ufc:robert-whittaker", new Set(["railcorp-electrician-apprentice", "three-martial-arts-black-belts"])],
  ["ufc:chris-weidman", new Set(["assistant-wrestling-coach-grad-student", "jiujitsu-through-helping-mma-fighters", "grapplers-quest-thirteen-submissions", "basement-apartment-waited-for-ufc"])],
  ["ufc:sean-strickland", new Set(["training-age-fourteen-anger-outlet", "professional-since-sixteen", "motorcycle-accident-career-hiatus", "unfiltered-no-character-persona"])],
  ["ufc:brandon-moreno", new Set(["family-pinata-business", "mma-start-exercise-chubby-kid", "assassin-baby-nickname-debut"])],
]);

const calibrationSubjectIds = new Set<string>(UFC_WHO_AM_I_CALIBRATION_SUBJECT_IDS);

export function isUfcWhoAmICalibrationSubject(subjectId: string) {
  return calibrationSubjectIds.has(subjectId);
}

export function shouldUseUfcWhoAmIIdentityConcept(subjectId: string, conceptId: string) {
  const retained = retainedConceptsBySubject.get(subjectId);
  return retained ? retained.has(conceptId) : true;
}

export function retainedUfcWhoAmIIdentityConcepts(subjectId: string) {
  return retainedConceptsBySubject.get(subjectId) ?? null;
}
