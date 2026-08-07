import historicalMigrationSeedJson from "./generated/canonical-ranking-inputs-842ba06e.json";

export interface V2RankingRosterOverlay {
  additions: readonly unknown[];
  replacements: Readonly<Record<string, unknown>>;
  eraMembership: Readonly<
    Record<string, { primary: string; secondary: string | null }>
  >;
  modelAsOfDate?: string;
  factsVersion?: string | null;
  judgmentVersion?: string | null;
  eraLedgerVersion?: string | null;
  eraDepthVersion?: string | null;
  eraDepthResolutionVersion?: string | null;
}

/**
 * One V2-owned roster overlay for every ranking change after the sealed migration baseline.
 *
 * - Add new fighters in `additions`.
 * - Replace an existing fighter's complete canonical input through `replacements`.
 * - Add or update era membership in `eraMembership`.
 * - Advance the model date and version labels with the same reviewed change.
 *
 * The historical 80-fighter import is evidence only and is never regenerated from V1.
 */

interface RdaFightSeed {
  date: string;
  opponent: string;
  result: "win" | "loss";
  method: string;
  tier: string;
  division: string;
  rounds?: readonly [won: number, lost: number, drawn?: number];
  championshipType?: string;
  championshipManualCredit?: number | null;
  upward?: boolean;
}

function rdaFightId(date: string, opponent: string) {
  const opponentSlug = opponent
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${date}-${opponentSlug}`;
}

function rdaFight(seed: RdaFightSeed) {
  return {
    id: rdaFightId(seed.date, seed.opponent),
    date: seed.date,
    opponent: seed.opponent,
    division: seed.division,
    officialResult: seed.result,
    scoringDisposition: seed.result === "win" ? "count-win" : "count-loss",
    methodCategory: seed.method,
    qualityTier: seed.tier,
    championshipType: seed.championshipType ?? "none",
    championshipEligible: true,
    championshipOpponentStrength: null,
    championshipManualCredit: seed.championshipManualCredit ?? null,
    rounds: seed.rounds
      ? {
          status: "audited",
          won: seed.rounds[0],
          lost: seed.rounds[1],
          drawn: seed.rounds[2] ?? 0,
        }
      : { status: "unavailable", won: 0, lost: 0, drawn: 0 },
    lossClassification: {
      competitive: true,
      divisionContext: seed.upward ? "upward" : "home",
      overrideRule: null,
    },
  };
}

const rdaFightSeeds: readonly RdaFightSeed[] = [
  { date: "2008-11-15", opponent: "Jeremy Stephens", result: "loss", method: "ko-tko", tier: "top-ten", division: "Lightweight" },
  { date: "2009-04-01", opponent: "Tyson Griffin", result: "loss", method: "decision", tier: "top-ten", division: "Lightweight" },
  { date: "2009-09-19", opponent: "Rob Emerson", result: "win", method: "decision", tier: "solid", division: "Lightweight" },
  { date: "2010-01-11", opponent: "Kyle Bradley", result: "win", method: "decision", tier: "solid", division: "Lightweight" },
  { date: "2010-04-10", opponent: "Terry Etim", result: "win", method: "submission", tier: "ranked", division: "Lightweight" },
  { date: "2011-07-02", opponent: "George Sotiropoulos", result: "win", method: "ko-tko", tier: "top-ten", division: "Lightweight" },
  { date: "2011-11-19", opponent: "Gleison Tibau", result: "loss", method: "decision", tier: "top-ten", division: "Lightweight" },
  { date: "2012-05-15", opponent: "Kamal Shalorus", result: "win", method: "submission", tier: "solid", division: "Lightweight" },
  { date: "2012-11-10", opponent: "Mark Bocek", result: "win", method: "decision", tier: "top-ten", division: "Lightweight" },
  { date: "2013-05-18", opponent: "Evan Dunham", result: "win", method: "decision", tier: "top-ten", division: "Lightweight" },
  { date: "2013-08-28", opponent: "Donald Cerrone", result: "win", method: "decision", tier: "top-five", division: "Lightweight" },
  { date: "2014-04-19", opponent: "Khabib Nurmagomedov", result: "loss", method: "decision", tier: "champion-level", division: "Lightweight" },
  { date: "2014-06-07", opponent: "Jason High", result: "win", method: "ko-tko", tier: "ranked", division: "Lightweight" },
  { date: "2014-08-23", opponent: "Benson Henderson", result: "win", method: "ko-tko", tier: "champion-level", division: "Lightweight", rounds: [1, 0] },
  { date: "2014-12-13", opponent: "Nate Diaz", result: "win", method: "decision", tier: "top-five", division: "Lightweight", rounds: [3, 0] },
  { date: "2015-03-14", opponent: "Anthony Pettis", result: "win", method: "decision", tier: "champion-level", division: "Lightweight", rounds: [5, 0], championshipType: "normal", championshipManualCredit: 1 },
  { date: "2015-12-19", opponent: "Donald Cerrone", result: "win", method: "ko-tko", tier: "top-five", division: "Lightweight", rounds: [1, 0], championshipType: "normal", championshipManualCredit: 0.85 },
  { date: "2016-07-07", opponent: "Eddie Alvarez", result: "loss", method: "ko-tko", tier: "champion-level", division: "Lightweight", rounds: [0, 1], championshipType: "normal", championshipManualCredit: 0 },
  { date: "2016-11-05", opponent: "Tony Ferguson", result: "loss", method: "decision", tier: "top-five", division: "Lightweight", rounds: [2, 3] },
  { date: "2017-06-17", opponent: "Tarec Saffiedine", result: "win", method: "decision", tier: "top-ten", division: "Welterweight", rounds: [3, 0] },
  { date: "2017-09-09", opponent: "Neil Magny", result: "win", method: "submission", tier: "top-ten", division: "Welterweight", rounds: [1, 0] },
  { date: "2017-12-16", opponent: "Robbie Lawler", result: "win", method: "decision", tier: "champion-level", division: "Welterweight", rounds: [5, 0] },
  { date: "2018-06-09", opponent: "Colby Covington", result: "loss", method: "decision", tier: "top-five", division: "Welterweight", rounds: [1, 4], championshipType: "interim", championshipManualCredit: 0, upward: true },
  { date: "2018-11-30", opponent: "Kamaru Usman", result: "loss", method: "decision", tier: "champion-level", division: "Welterweight", rounds: [0, 5], upward: true },
  { date: "2019-05-18", opponent: "Kevin Lee", result: "win", method: "submission", tier: "top-five", division: "Welterweight", rounds: [3, 1] },
  { date: "2019-07-20", opponent: "Leon Edwards", result: "loss", method: "decision", tier: "top-five", division: "Welterweight" },
  { date: "2020-01-25", opponent: "Michael Chiesa", result: "loss", method: "decision", tier: "top-ten", division: "Welterweight" },
  { date: "2020-11-14", opponent: "Paul Felder", result: "win", method: "decision", tier: "top-ten", division: "Lightweight" },
  { date: "2022-03-05", opponent: "Renato Moicano", result: "win", method: "decision", tier: "top-ten", division: "Catchweight" },
  { date: "2022-07-09", opponent: "Rafael Fiziev", result: "loss", method: "ko-tko", tier: "top-five", division: "Lightweight" },
  { date: "2022-12-03", opponent: "Bryan Barberena", result: "win", method: "submission", tier: "ranked", division: "Welterweight" },
  { date: "2023-08-12", opponent: "Vicente Luque", result: "loss", method: "decision", tier: "top-ten", division: "Welterweight" },
  { date: "2024-03-09", opponent: "Mateusz Gamrot", result: "loss", method: "decision", tier: "top-five", division: "Lightweight" },
  { date: "2024-10-26", opponent: "Geoff Neal", result: "loss", method: "ko-tko", tier: "top-ten", division: "Welterweight" },
];

function rdaQualityWin(date: string, opponent: string, finalCredit: number) {
  return {
    fightId: rdaFightId(date, opponent),
    opponent,
    date,
    finalCredit,
  };
}

const rafaelDosAnjos = {
  fighter: "Rafael dos Anjos",
  board: "men",
  facts: {
    identity: {
      primaryDivision: "Lightweight",
      secondaryDivisions: ["Welterweight"],
    },
    primeWindow: {
      startFightId: rdaFightId("2014-08-23", "Benson Henderson"),
      endFightId: rdaFightId("2019-05-18", "Kevin Lee"),
      open: false,
    },
    gapCapMonths: 18,
    fights: rdaFightSeeds.map(rdaFight),
  },
  era: {
    window: {
      start: "2014-08-23",
      end: "2019-05-18",
    },
    statusMultiplier: 1.05,
    divisionMultiplier: 1.1,
  },
  judgments: {
    championship: {
      fighter: "Rafael dos Anjos",
      benchmarkCredit: 14.54,
      inputs: [
        {
          fightId: rdaFightId("2015-03-14", "Anthony Pettis"),
          opponent: "Anthony Pettis",
          date: "2015-03-14",
          titleType: "normal",
          officialTitleFight: true,
          finalAdjustedCredit: 1,
          notes: "Won the undisputed UFC lightweight title with a dominant five-round decision.",
        },
        {
          fightId: rdaFightId("2015-12-19", "Donald Cerrone"),
          opponent: "Donald Cerrone",
          date: "2015-12-19",
          titleType: "normal",
          officialTitleFight: true,
          finalAdjustedCredit: 0.85,
          notes: "Successfully defended the lightweight title against an elite contender.",
        },
      ],
    },
    opponentQuality: {
      fighter: "Rafael dos Anjos",
      benchmarkCredit: 14.1,
      fighterAdjustment: 0,
      inputs: [
        rdaQualityWin("2015-03-14", "Anthony Pettis", 1.25),
        rdaQualityWin("2014-08-23", "Benson Henderson", 1.25),
        rdaQualityWin("2017-12-16", "Robbie Lawler", 1.25),
        rdaQualityWin("2013-08-28", "Donald Cerrone", 1),
        rdaQualityWin("2015-12-19", "Donald Cerrone", 1),
        rdaQualityWin("2014-12-13", "Nate Diaz", 1),
        rdaQualityWin("2019-05-18", "Kevin Lee", 1),
        rdaQualityWin("2017-09-09", "Neil Magny", 0.85),
        rdaQualityWin("2020-11-14", "Paul Felder", 0.85),
        rdaQualityWin("2022-03-05", "Renato Moicano", 0.85),
        rdaQualityWin("2011-07-02", "George Sotiropoulos", 0.85),
        rdaQualityWin("2012-11-10", "Mark Bocek", 0.85),
        rdaQualityWin("2013-05-18", "Evan Dunham", 0.85),
        rdaQualityWin("2017-06-17", "Tarec Saffiedine", 0.65),
        rdaQualityWin("2014-06-07", "Jason High", 0.65),
        rdaQualityWin("2022-12-03", "Bryan Barberena", 0.65),
        rdaQualityWin("2010-04-10", "Terry Etim", 0.45),
        rdaQualityWin("2009-09-19", "Rob Emerson", 0.45),
        rdaQualityWin("2010-01-11", "Kyle Bradley", 0.45),
        rdaQualityWin("2012-05-15", "Kamal Shalorus", 0.45),
      ],
    },
    apex: {
      fighter: "Rafael dos Anjos",
      performances: [
        {
          fightId: rdaFightId("2015-03-14", "Anthony Pettis"),
          opponent: "Anthony Pettis",
          date: "2015-03-14",
          rating: 9.7,
        },
        {
          fightId: rdaFightId("2014-08-23", "Benson Henderson"),
          opponent: "Benson Henderson",
          date: "2014-08-23",
          rating: 9.6,
        },
      ],
      components: {
        twoPerformanceStrength: 1.93,
        proof: 1.4,
        bestFighterClaim: 0.9,
        aura: 0.65,
      },
      notes: "The Pettis title win and first-round Henderson knockout form an elite lightweight peak with clear championship proof.",
    },
  },
  eraDepth: {
    fighter: "Rafael dos Anjos",
    depthIndex: 0.92,
    approvedAdjustment: null,
  },
  presentation: {
    slug: "rafael-dos-anjos",
    primaryDivision: "Lightweight",
    secondaryDivision: "Welterweight",
    divisionLabel: "Lightweight / Welterweight",
    resumeTag: "Lightweight champion with two-division longevity",
    oneLiner: "A dominant UFC lightweight champion whose elite wins, welterweight contender run, and extraordinary longevity create one of the deepest UFC-only resumes outside the highest title-reign tier.",
    whyRankedHere: "Dos Anjos ranks here because he combined an undisputed lightweight title and defense with elite wins over Anthony Pettis, Benson Henderson, Donald Cerrone, Nate Diaz, Robbie Lawler, and Kevin Lee. His ability to remain relevant across lightweight and welterweight for more than a decade adds major UFC-only depth.",
    whyNotHigher: "He does not rank higher because the championship reign lasted only one defense, the Alvarez and Ferguson losses ended his lightweight peak quickly, and the later welterweight run produced strong contender wins without a second title.",
    finalTakeaway: "RDA is the deep-resume lightweight champion: a shorter reign than the division's highest legends, but an elite peak and rare two-division longevity that clearly belong on the all-time board.",
    keyJudgmentCalls: [
      "Prime begins with the Benson Henderson knockout and ends with the Kevin Lee submission.",
      "Khabib Nurmagomedov is treated as a pre-prime elite loss.",
      "Colby Covington and Kamaru Usman are treated as prime elite losses in an upward division.",
      "Michael Chiesa and every later loss are treated as post-prime.",
      "Only UFC accomplishments are scored.",
    ],
    photoUrl: "assets/fighters/rafael-dos-anjos-profile.webp",
    thumbUrl: "assets/fighters/rafael-dos-anjos-thumb.webp",
    watchUrl: "https://www.ufc.com/video/47604",
    watchLabel: "Watch: RDA dominates Nate Diaz",
    signatureFightUrl: "https://ufcfightpass.com/search?query=Rafael%20dos%20Anjos%20vs%20Anthony%20Pettis%20UFC%20185",
    signatureFightLabel: "Signature Fight: Anthony Pettis",
  },
};

const joseAldoBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Jose Aldo",
);

if (!joseAldoBaseline) {
  throw new Error("Jose Aldo is missing from the sealed ranking baseline.");
}

const joseAldo = {
  ...joseAldoBaseline,
  presentation: {
    ...joseAldoBaseline.presentation,
    oneLiner: "At his best, Aldo combined explosive speed, brutal leg kicks, elite takedown defense, and calm counterstriking. He won nearly seven of every ten scored rounds during his prime, controlling championship fights without needing to chase finishes.",
    whyRankedHere: "Eight UFC title-fight wins, two victories each over Frankie Edgar and Chad Mendes, and a deep list of ranked wins give Aldo both championship success and real depth. He repeatedly beat elite contenders and remained dangerous long after his original title reign ended.",
    whyNotHigher: "Part of Aldo's championship legacy happened before he entered the UFC, while his defining UFC losses came against the featherweights who followed him. McGregor stopped him immediately, Holloway finished him twice, and Volkanovski clearly beat him. His bantamweight run added longevity, but not another title-level peak.",
  },
};

const stipeMiocicBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Stipe Miocic",
);

if (!stipeMiocicBaseline) {
  throw new Error("Stipe Miocic is missing from the sealed ranking baseline.");
}

const stipeMiocic = {
  ...stipeMiocicBaseline,
  presentation: {
    ...stipeMiocicBaseline.presentation,
    whyRankedHere: "Stipe built the greatest heavyweight resume in UFC history through sustained championship success rather than one dominant run. He owns the division's record for consecutive title defenses, reclaimed the belt after defeat, defeated Daniel Cormier twice in their trilogy, and consistently beat championship-caliber heavyweights across multiple eras. No UFC heavyweight combines championship accomplishment, elite wins, and longevity as completely.",
    whyNotHigher: "Heavyweight has never offered the week-to-week depth or sustained elite competition of divisions like welterweight or lightweight, limiting how high even its greatest champion can climb. Stipe also lacks the extended championship dominance of the fighters above him, and his prime includes decisive losses to Daniel Cormier and Francis Ngannou before the late-career Jon Jones defeat.",
  },
};

const danielCormierBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Daniel Cormier",
);

if (!danielCormierBaseline) {
  throw new Error("Daniel Cormier is missing from the sealed ranking baseline.");
}

const danielCormier = {
  ...danielCormierBaseline,
  presentation: {
    ...danielCormierBaseline.presentation,
    oneLiner: "Cormier turned a short, powerful frame into a pressure weapon, crowding opponents with hand fighting, dirty boxing, body locks, and chain wrestling. His balance, pace, and top control let him dictate fights against much larger men.",
    whyRankedHere: "Cormier became champion in both of the UFC's heaviest divisions, made three successful light heavyweight defenses, knocked out Stipe Miocic to claim heavyweight gold, and defended that belt against Derrick Lewis. Wins over Anthony Johnson twice, Alexander Gustafsson, Volkan Oezdemir, and Miocic give him enough elite championship work to separate him from fighters with thinner title records or success in only one division.",
    whyNotHigher: "His ceiling is set by the rivals who defined each title run. Jon Jones handed him his only official light heavyweight loss and remained the superior 205-pound fighter, while Stipe Miocic won their heavyweight trilogy 2-1 and beat him in his final two bouts. Cormier entered the UFC at 34, so his elite window was shorter than the longer-reigning champions above him.",
  },
};

const jonJonesBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Jon Jones",
);

if (!jonJonesBaseline) {
  throw new Error("Jon Jones is missing from the sealed ranking baseline.");
}

const jonJones = {
  ...jonJonesBaseline,
  presentation: {
    ...jonJonesBaseline.presentation,
    oneLiner: "At his best, Jones controlled fights before opponents could establish their own game. His length, oblique and side kicks, clinch elbows, and chain wrestling let him dominate distance and punish every attempted adjustment. He could win methodical rounds, turn scrambles into top control, or finish with ground strikes and submissions. His greatest weapon was how quickly he solved elite opponents.",
    whyRankedHere: "Jones has the strongest championship resume in UFC history. He became the youngest champion, earned a record 16 title-fight wins, and beat generations of elite opposition from Mauricio Rua and Lyoto Machida through Daniel Cormier and Alexander Gustafsson. He later added heavyweight title wins over Ciryl Gane and Stipe Miocic. Twelve top-five wins and more than a decade of elite success separate him from every other case.",
    whyNotHigher: "The case against greater separation rests on three things: disputed decisions against Alexander Gustafsson, Thiago Santos, and Dominick Reyes; long absences that repeatedly interrupted his championship years; and a heavyweight resume built on only two wins. Suspensions, stripped titles, and stalled activity kept him from producing an even cleaner reign. Those flaws narrow the gap, but no rival owns the stronger UFC resume.",
  },
};

const randyCoutureBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Randy Couture",
);

if (!randyCoutureBaseline) {
  throw new Error("Randy Couture is missing from the sealed ranking baseline.");
}

const randyCouture = {
  ...randyCoutureBaseline,
  presentation: {
    ...randyCoutureBaseline.presentation,
    oneLiner: "Couture forced elite opponents into his kind of fight. He closed distance with discipline, bullied them in the clinch, and mixed dirty boxing, takedowns, and top pressure with the composure and tactical intelligence to wear down younger, faster fighters.",
    whyRankedHere: "Couture won UFC championships at heavyweight and light heavyweight, then kept adding major victories across different eras. He beat Vitor Belfort, Kevin Randleman, Pedro Rizzo, Chuck Liddell, Tito Ortiz, Tim Sylvia, and Gabriel Gonzaga, often with a title at stake. That two-division championship record, elite opponent list, and repeated ability to regain gold separate him from fighters with narrower peaks or thinner resumes.",
    whyNotHigher: "Couture's championship highs were separated by too many losses and uneven stretches to match the cleaner cases above him. He never produced one long, dominant reign, and several elite rivals beat him decisively during or near title contention. His late-career heavyweight comeback was remarkable, but the full UFC record lacks the sustained control, consistency, and extended prime that define the highest tier.",
  },
};

const israelAdesanyaBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Israel Adesanya",
);

if (!israelAdesanyaBaseline) {
  throw new Error("Israel Adesanya is missing from the sealed ranking baseline.");
}

const israelAdesanya = {
  ...israelAdesanyaBaseline,
  presentation: {
    ...israelAdesanyaBaseline.presentation,
    oneLiner: "Adesanya dictated fights through feints, stance changes, distance control, and elite counter striking. His kicks punished hesitation, while his reads made reckless entries dangerous. Once opponents became impatient, he turned small mistakes into knockdowns or sudden finishes without surrendering control.",
    whyRankedHere: "Adesanya built one of the strongest UFC middleweight resumes ever: an interim title win over Kelvin Gastelum, a knockout of Robert Whittaker to unify the division, five defenses in his first reign, and a title-regaining knockout of Alex Pereira. Wins over Whittaker twice, Paulo Costa, Marvin Vettori, Jared Cannonier, and Yoel Romero give his championship run exceptional depth.",
    whyNotHigher: "The case stops short of the highest tier because his later championship years became too uneven. Pereira ended his first reign, Sean Strickland clearly took the belt from him, and Dricus du Plessis submitted him in another title fight. The failed light heavyweight bid also denied him a second-division achievement, leaving more defining setbacks than the cleaner resumes above him.",
  },
};

const alexPereiraBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Alex Pereira",
);

if (!alexPereiraBaseline) {
  throw new Error("Alex Pereira is missing from the sealed ranking baseline.");
}

const alexPereira = {
  ...alexPereiraBaseline,
  presentation: {
    ...alexPereiraBaseline.presentation,
    oneLiner: "Pereira was a patient pressure striker with terrifying composure. Calf kicks and feints narrowed the cage, his left hook punished bad reactions, and once opponents became predictable, he could end an elite fight in a single exchange.",
    whyRankedHere: "Pereira built an extraordinary UFC resume. He stopped Israel Adesanya for middleweight gold, moved up to win the light heavyweight title, then added championship victories over Jiri Prochazka twice, Jamahal Hill, Khalil Rountree Jr., and Magomed Ankalaev. That two-division success and concentration of elite wins clearly separate him from fighters with shorter peaks or thinner title resumes.",
    whyNotHigher: "Pereira still lacks the longevity and sustained control of the fighters above him. His elite UFC window is compact, he lost the first Ankalaev fight decisively before avenging it, and Adesanya and Ciryl Gane both stopped him. The Gane loss came at heavyweight, but it still interrupted the run.",
  },
};

const chuckLiddellBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Chuck Liddell",
);

if (!chuckLiddellBaseline) {
  throw new Error("Chuck Liddell is missing from the sealed ranking baseline.");
}

const chuckLiddell = {
  ...chuckLiddellBaseline,
  presentation: {
    ...chuckLiddellBaseline.presentation,
    oneLiner: "Liddell was the prototype sprawl-and-brawl destroyer. Elite defensive wrestling kept fights standing, while his awkward counters and right-hand power made every exchange dangerous. He could hurt opponents moving backward, then swarm once they were compromised.",
    whyRankedHere: "Liddell's UFC resume carries serious championship weight. He took the light heavyweight title from Randy Couture, defended it four times, and added major wins over Couture, Tito Ortiz, Vitor Belfort, Renato Sobral, and Jeremy Horn. His 7-1 prime title stretch, finishing power, and repeated success against elite contenders separate him from fighters with shorter championship peaks.",
    whyNotHigher: "The case against going higher is the damage around the edges of his reign. Couture stopped him before the title run, Rampage ended it in the first round, and Liddell went 1-5 over his final six UFC fights. Most of that collapse came from ages 37 to 40, but the fighters above him generally sustained elite results longer and finished cleaner.",
  },
};

export const v2RankingRoster: V2RankingRosterOverlay = {
  additions: [rafaelDosAnjos],
  replacements: {
    "Jose Aldo": joseAldo,
    "Stipe Miocic": stipeMiocic,
    "Daniel Cormier": danielCormier,
    "Jon Jones": jonJones,
    "Randy Couture": randyCouture,
    "Israel Adesanya": israelAdesanya,
    "Alex Pereira": alexPereira,
    "Chuck Liddell": chuckLiddell,
  },
  eraMembership: {
    "Rafael dos Anjos": {
      primary: "golden-age",
      secondary: "superstar",
    },
  },
  factsVersion: "octagon-hq-v2-rda-20260730",
  judgmentVersion: "octagon-hq-v2-chuck-liddell-profile-20260806",
  eraDepthVersion: "octagon-hq-v2-rda-20260730",
  eraDepthResolutionVersion: "octagon-hq-v2-rda-20260730",
};
