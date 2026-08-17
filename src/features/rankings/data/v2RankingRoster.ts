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
  {
    date: "2008-11-15",
    opponent: "Jeremy Stephens",
    result: "loss",
    method: "ko-tko",
    tier: "top-ten",
    division: "Lightweight",
  },
  {
    date: "2009-04-01",
    opponent: "Tyson Griffin",
    result: "loss",
    method: "decision",
    tier: "top-ten",
    division: "Lightweight",
  },
  {
    date: "2009-09-19",
    opponent: "Rob Emerson",
    result: "win",
    method: "decision",
    tier: "solid",
    division: "Lightweight",
  },
  {
    date: "2010-01-11",
    opponent: "Kyle Bradley",
    result: "win",
    method: "decision",
    tier: "solid",
    division: "Lightweight",
  },
  {
    date: "2010-04-10",
    opponent: "Terry Etim",
    result: "win",
    method: "submission",
    tier: "ranked",
    division: "Lightweight",
  },
  {
    date: "2010-08-07",
    opponent: "Clay Guida",
    result: "loss",
    method: "submission",
    tier: "solid",
    division: "Lightweight",
  },
  {
    date: "2011-07-02",
    opponent: "George Sotiropoulos",
    result: "win",
    method: "ko-tko",
    tier: "top-ten",
    division: "Lightweight",
  },
  {
    date: "2011-11-19",
    opponent: "Gleison Tibau",
    result: "loss",
    method: "decision",
    tier: "top-ten",
    division: "Lightweight",
  },
  {
    date: "2012-05-15",
    opponent: "Kamal Shalorus",
    result: "win",
    method: "submission",
    tier: "solid",
    division: "Lightweight",
  },
  {
    date: "2012-07-11",
    opponent: "Anthony Njokuani",
    result: "win",
    method: "decision",
    tier: "solid",
    division: "Lightweight",
  },
  {
    date: "2012-11-17",
    opponent: "Mark Bocek",
    result: "win",
    method: "decision",
    tier: "top-ten",
    division: "Lightweight",
  },
  {
    date: "2013-05-18",
    opponent: "Evan Dunham",
    result: "win",
    method: "decision",
    tier: "top-ten",
    division: "Lightweight",
  },
  {
    date: "2013-08-28",
    opponent: "Donald Cerrone",
    result: "win",
    method: "decision",
    tier: "top-five",
    division: "Lightweight",
  },
  {
    date: "2014-04-19",
    opponent: "Khabib Nurmagomedov",
    result: "loss",
    method: "decision",
    tier: "champion-level",
    division: "Lightweight",
  },
  {
    date: "2014-06-07",
    opponent: "Jason High",
    result: "win",
    method: "ko-tko",
    tier: "ranked",
    division: "Lightweight",
  },
  {
    date: "2014-08-23",
    opponent: "Benson Henderson",
    result: "win",
    method: "ko-tko",
    tier: "champion-level",
    division: "Lightweight",
    rounds: [1, 0],
  },
  {
    date: "2014-12-13",
    opponent: "Nate Diaz",
    result: "win",
    method: "decision",
    tier: "top-five",
    division: "Lightweight",
    rounds: [3, 0],
  },
  {
    date: "2015-03-14",
    opponent: "Anthony Pettis",
    result: "win",
    method: "decision",
    tier: "champion-level",
    division: "Lightweight",
    rounds: [5, 0],
    championshipType: "normal",
    championshipManualCredit: 1,
  },
  {
    date: "2015-12-19",
    opponent: "Donald Cerrone",
    result: "win",
    method: "ko-tko",
    tier: "top-five",
    division: "Lightweight",
    rounds: [1, 0],
    championshipType: "normal",
    championshipManualCredit: 0.85,
  },
  {
    date: "2016-07-07",
    opponent: "Eddie Alvarez",
    result: "loss",
    method: "ko-tko",
    tier: "champion-level",
    division: "Lightweight",
    rounds: [0, 1],
    championshipType: "normal",
    championshipManualCredit: 0,
  },
  {
    date: "2016-11-05",
    opponent: "Tony Ferguson",
    result: "loss",
    method: "decision",
    tier: "top-five",
    division: "Lightweight",
    rounds: [2, 3],
  },
  {
    date: "2017-06-17",
    opponent: "Tarec Saffiedine",
    result: "win",
    method: "decision",
    tier: "top-ten",
    division: "Welterweight",
    rounds: [3, 0],
  },
  {
    date: "2017-09-09",
    opponent: "Neil Magny",
    result: "win",
    method: "submission",
    tier: "top-ten",
    division: "Welterweight",
    rounds: [1, 0],
  },
  {
    date: "2017-12-16",
    opponent: "Robbie Lawler",
    result: "win",
    method: "decision",
    tier: "champion-level",
    division: "Welterweight",
    rounds: [5, 0],
  },
  {
    date: "2018-06-09",
    opponent: "Colby Covington",
    result: "loss",
    method: "decision",
    tier: "top-five",
    division: "Welterweight",
    rounds: [1, 4],
    championshipType: "interim",
    championshipManualCredit: 0,
  },
  {
    date: "2018-11-30",
    opponent: "Kamaru Usman",
    result: "loss",
    method: "decision",
    tier: "champion-level",
    division: "Welterweight",
    rounds: [0, 5],
  },
  {
    date: "2019-05-18",
    opponent: "Kevin Lee",
    result: "win",
    method: "submission",
    tier: "top-five",
    division: "Welterweight",
    rounds: [3, 1],
  },
  {
    date: "2019-07-20",
    opponent: "Leon Edwards",
    result: "loss",
    method: "decision",
    tier: "top-five",
    division: "Welterweight",
  },
  {
    date: "2020-01-25",
    opponent: "Michael Chiesa",
    result: "loss",
    method: "decision",
    tier: "top-ten",
    division: "Welterweight",
  },
  {
    date: "2020-11-14",
    opponent: "Paul Felder",
    result: "win",
    method: "decision",
    tier: "top-ten",
    division: "Lightweight",
  },
  {
    date: "2022-03-05",
    opponent: "Renato Moicano",
    result: "win",
    method: "decision",
    tier: "top-ten",
    division: "Catchweight",
  },
  {
    date: "2022-07-09",
    opponent: "Rafael Fiziev",
    result: "loss",
    method: "ko-tko",
    tier: "top-five",
    division: "Lightweight",
  },
  {
    date: "2022-12-03",
    opponent: "Bryan Barberena",
    result: "win",
    method: "submission",
    tier: "ranked",
    division: "Welterweight",
  },
  {
    date: "2023-08-12",
    opponent: "Vicente Luque",
    result: "loss",
    method: "decision",
    tier: "top-ten",
    division: "Welterweight",
  },
  {
    date: "2024-03-09",
    opponent: "Mateusz Gamrot",
    result: "loss",
    method: "decision",
    tier: "top-five",
    division: "Lightweight",
  },
  {
    date: "2024-10-26",
    opponent: "Geoff Neal",
    result: "loss",
    method: "ko-tko",
    tier: "top-ten",
    division: "Welterweight",
  },
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
      endFightId: rdaFightId("2019-07-20", "Leon Edwards"),
      open: false,
    },
    gapCapMonths: 18,
    fights: rdaFightSeeds.map(rdaFight),
  },
  era: {
    window: {
      start: "2014-08-23",
      end: "2019-07-20",
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
          notes:
            "Won the undisputed UFC lightweight title with a dominant five-round decision.",
        },
        {
          fightId: rdaFightId("2015-12-19", "Donald Cerrone"),
          opponent: "Donald Cerrone",
          date: "2015-12-19",
          titleType: "normal",
          officialTitleFight: true,
          finalAdjustedCredit: 0.85,
          notes:
            "Successfully defended the lightweight title against an elite contender.",
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
        rdaQualityWin("2017-12-16", "Robbie Lawler", 1),
        rdaQualityWin("2015-12-19", "Donald Cerrone", 1),
        rdaQualityWin("2013-08-28", "Donald Cerrone", 0.85),
        rdaQualityWin("2014-12-13", "Nate Diaz", 0.85),
        rdaQualityWin("2019-05-18", "Kevin Lee", 0.85),
        rdaQualityWin("2017-09-09", "Neil Magny", 0.85),
        rdaQualityWin("2020-11-14", "Paul Felder", 0.85),
        rdaQualityWin("2011-07-02", "George Sotiropoulos", 0.85),
        rdaQualityWin("2022-03-05", "Renato Moicano", 0.65),
        rdaQualityWin("2012-11-17", "Mark Bocek", 0.65),
        rdaQualityWin("2013-05-18", "Evan Dunham", 0.65),
        rdaQualityWin("2017-06-17", "Tarec Saffiedine", 0.65),
        rdaQualityWin("2014-06-07", "Jason High", 0.45),
        rdaQualityWin("2022-12-03", "Bryan Barberena", 0.45),
        rdaQualityWin("2010-04-10", "Terry Etim", 0.45),
        rdaQualityWin("2012-07-11", "Anthony Njokuani", 0.45),
        rdaQualityWin("2009-09-19", "Rob Emerson", 0.25),
        rdaQualityWin("2010-01-11", "Kyle Bradley", 0.25),
        rdaQualityWin("2012-05-15", "Kamal Shalorus", 0.25),
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
      notes:
        "The Pettis title win and first-round Henderson knockout form an elite lightweight peak with clear championship proof.",
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
    oneLiner:
      "A dominant UFC lightweight champion whose elite wins, welterweight contender run, and extraordinary longevity create one of the deepest UFC-only resumes outside the highest title-reign tier.",
    whyRankedHere:
      "Dos Anjos ranks here because he combined an undisputed lightweight title and defense with elite wins over Anthony Pettis, Benson Henderson, Donald Cerrone, Nate Diaz, Robbie Lawler, and Kevin Lee. His ability to remain relevant across lightweight and welterweight for more than a decade adds major UFC-only depth.",
    whyNotHigher:
      "He does not rank higher because the championship reign lasted only one defense, the Alvarez and Ferguson losses ended his lightweight peak quickly, and the later welterweight run produced strong contender wins without a second title.",
    finalTakeaway:
      "RDA is the deep-resume lightweight champion: a shorter reign than the division's highest legends, but an elite peak and rare two-division longevity that clearly belong on the all-time board.",
    keyJudgmentCalls: [
      "Prime begins with the Benson Henderson knockout and ends with the Leon Edwards loss.",
      "Khabib Nurmagomedov is treated as a pre-prime elite loss.",
      "Colby Covington and Kamaru Usman are treated as prime elite welterweight losses without an upward-division discount.",
      "Michael Chiesa and every later loss are treated as post-prime.",
      "Only UFC accomplishments are scored.",
    ],
    photoUrl: "assets/fighters/rafael-dos-anjos-profile.webp",
    thumbUrl: "assets/fighters/rafael-dos-anjos-thumb.webp",
    watchUrl: "https://www.ufc.com/video/47604",
    watchLabel: "Watch: RDA dominates Nate Diaz",
    signatureFightUrl:
      "https://ufcfightpass.com/search?query=Rafael%20dos%20Anjos%20vs%20Anthony%20Pettis%20UFC%20185",
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
    oneLiner:
      "At his best, Aldo combined explosive speed, brutal leg kicks, elite takedown defense, and calm counterstriking. He won nearly seven of every ten scored rounds during his prime, controlling championship fights without needing to chase finishes.",
    whyRankedHere:
      "Eight UFC title-fight wins, two victories each over Frankie Edgar and Chad Mendes, and a deep list of ranked wins give Aldo both championship success and real depth. He repeatedly beat elite contenders and remained dangerous long after his original title reign ended.",
    whyNotHigher:
      "Part of Aldo's championship legacy happened before he entered the UFC, while his defining UFC losses came against the featherweights who followed him. McGregor stopped him immediately, Holloway finished him twice, and Volkanovski clearly beat him. His bantamweight run added longevity, but not another title-level peak.",
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
    whyRankedHere:
      "Stipe built the greatest heavyweight resume in UFC history through sustained championship success rather than one dominant run. He owns the division's record for consecutive title defenses, reclaimed the belt after defeat, defeated Daniel Cormier twice in their trilogy, and consistently beat championship-caliber heavyweights across multiple eras. No UFC heavyweight combines championship accomplishment, elite wins, and longevity as completely.",
    whyNotHigher:
      "Heavyweight has never offered the week-to-week depth or sustained elite competition of divisions like welterweight or lightweight, limiting how high even its greatest champion can climb. Stipe also lacks the extended championship dominance of the fighters above him, and his prime includes decisive losses to Daniel Cormier and Francis Ngannou before the late-career Jon Jones defeat.",
  },
};

const danielCormierBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Daniel Cormier",
);

if (!danielCormierBaseline) {
  throw new Error(
    "Daniel Cormier is missing from the sealed ranking baseline.",
  );
}

const danielCormier = {
  ...danielCormierBaseline,
  presentation: {
    ...danielCormierBaseline.presentation,
    oneLiner:
      "Cormier turned a short, powerful frame into a pressure weapon, crowding opponents with hand fighting, dirty boxing, body locks, and chain wrestling. His balance, pace, and top control let him dictate fights against much larger men.",
    whyRankedHere:
      "Cormier became champion in both of the UFC's heaviest divisions, made three successful light heavyweight defenses, knocked out Stipe Miocic to claim heavyweight gold, and defended that belt against Derrick Lewis. Wins over Anthony Johnson twice, Alexander Gustafsson, Volkan Oezdemir, and Miocic give him enough elite championship work to separate him from fighters with thinner title records or success in only one division.",
    whyNotHigher:
      "His ceiling is set by the rivals who defined each title run. Jon Jones handed him his only official light heavyweight loss and remained the superior 205-pound fighter, while Stipe Miocic won their heavyweight trilogy 2-1 and beat him in his final two bouts. Cormier entered the UFC at 34, so his elite window was shorter than the longer-reigning champions above him.",
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
    oneLiner:
      "At his best, Jones controlled fights before opponents could establish their own game. His length, oblique and side kicks, clinch elbows, and chain wrestling let him dominate distance and punish every attempted adjustment. He could win methodical rounds, turn scrambles into top control, or finish with ground strikes and submissions. His greatest weapon was how quickly he solved elite opponents.",
    whyRankedHere:
      "Jones has the strongest championship resume in UFC history. He became the youngest champion, earned a record 16 title-fight wins, and beat generations of elite opposition from Mauricio Rua and Lyoto Machida through Daniel Cormier and Alexander Gustafsson. He later added heavyweight title wins over Ciryl Gane and Stipe Miocic. Twelve top-five wins and more than a decade of elite success separate him from every other case.",
    whyNotHigher:
      "The case against greater separation rests on three things: disputed decisions against Alexander Gustafsson, Thiago Santos, and Dominick Reyes; long absences that repeatedly interrupted his championship years; and a heavyweight resume built on only two wins. Suspensions, stripped titles, and stalled activity kept him from producing an even cleaner reign. Those flaws narrow the gap, but no rival owns the stronger UFC resume.",
  },
};

const georgesStPierreBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Georges St-Pierre",
);

if (!georgesStPierreBaseline) {
  throw new Error(
    "Georges St-Pierre is missing from the sealed ranking baseline.",
  );
}

const georgesStPierre = {
  ...georgesStPierreBaseline,
  presentation: {
    ...georgesStPierreBaseline.presentation,
    oneLiner:
      "St-Pierre controlled fights with a sharp jab, explosive takedowns, suffocating top pressure, and elite defensive awareness. His prime stood out for adaptability, pace, and the ability to dictate where exchanges happened while banking rounds with remarkable consistency.",
    whyRankedHere:
      "St-Pierre built one of the UFC's deepest championship resumes at welterweight, beating Matt Hughes, BJ Penn, Jon Fitch, Carlos Condit, and elite contenders across multiple generations. He avenged both UFC losses, then returned after four years away to win the middleweight title, adding two-division success to sustained divisional dominance.",
    whyNotHigher:
      "The Serra upset is the clearest blemish on St-Pierre's prime, while Jones built a larger body of championship work and remained at the top for longer. St-Pierre's resume is cleaner than almost anyone else's, but against the strongest case above him, the difference is sustained title-level volume rather than quality of opposition.",
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
    oneLiner:
      "Couture forced elite opponents into his kind of fight. He closed distance with discipline, bullied them in the clinch, and mixed dirty boxing, takedowns, and top pressure with the composure and tactical intelligence to wear down younger, faster fighters.",
    whyRankedHere:
      "Couture won UFC championships at heavyweight and light heavyweight, then kept adding major victories across different eras. He beat Vitor Belfort, Kevin Randleman, Pedro Rizzo, Chuck Liddell, Tito Ortiz, Tim Sylvia, and Gabriel Gonzaga, often with a title at stake. That two-division championship record, elite opponent list, and repeated ability to regain gold separate him from fighters with narrower peaks or thinner resumes.",
    whyNotHigher:
      "Couture's championship highs were separated by too many losses and uneven stretches to match the cleaner cases above him. He never produced one long, dominant reign, and several elite rivals beat him decisively during or near title contention. His late-career heavyweight comeback was remarkable, but the full UFC record lacks the sustained control, consistency, and extended prime that define the highest tier.",
  },
};

const israelAdesanyaBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Israel Adesanya",
);

if (!israelAdesanyaBaseline) {
  throw new Error(
    "Israel Adesanya is missing from the sealed ranking baseline.",
  );
}

const israelAdesanya = {
  ...israelAdesanyaBaseline,
  presentation: {
    ...israelAdesanyaBaseline.presentation,
    oneLiner:
      "Adesanya dictated fights through feints, stance changes, distance control, and elite counter striking. His kicks punished hesitation, while his reads made reckless entries dangerous. Once opponents became impatient, he turned small mistakes into knockdowns or sudden finishes without surrendering control.",
    whyRankedHere:
      "Adesanya built one of the strongest UFC middleweight resumes ever: an interim title win over Kelvin Gastelum, a knockout of Robert Whittaker to unify the division, five defenses in his first reign, and a title-regaining knockout of Alex Pereira. Wins over Whittaker twice, Paulo Costa, Marvin Vettori, Jared Cannonier, and Yoel Romero give his championship run exceptional depth.",
    whyNotHigher:
      "The case stops short of the highest tier because his later championship years became too uneven. Pereira ended his first reign, Sean Strickland clearly took the belt from him, and Dricus du Plessis submitted him in another title fight. The failed light heavyweight bid also denied him a second-division achievement, leaving more defining setbacks than the cleaner resumes above him.",
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
    oneLiner:
      "Pereira was a patient pressure striker with terrifying composure. Calf kicks and feints narrowed the cage, his left hook punished bad reactions, and once opponents became predictable, he could end an elite fight in a single exchange.",
    whyRankedHere:
      "Pereira built an extraordinary UFC resume. He stopped Israel Adesanya for middleweight gold, moved up to win the light heavyweight title, then added championship victories over Jiri Prochazka twice, Jamahal Hill, Khalil Rountree Jr., and Magomed Ankalaev. That two-division success and concentration of elite wins clearly separate him from fighters with shorter peaks or thinner title resumes.",
    whyNotHigher:
      "Pereira still lacks the longevity and sustained control of the fighters above him. His elite UFC window is compact, he lost the first Ankalaev fight decisively before avenging it, and Adesanya and Ciryl Gane both stopped him. The Gane loss came at heavyweight, but it still interrupted the run.",
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
    oneLiner:
      "Liddell was the prototype sprawl-and-brawl destroyer. Elite defensive wrestling kept fights standing, while his awkward counters and right-hand power made every exchange dangerous. He could hurt opponents moving backward, then swarm once they were compromised.",
    whyRankedHere:
      "Liddell's UFC resume carries serious championship weight. He took the light heavyweight title from Randy Couture, defended it four times, and added major wins over Couture, Tito Ortiz, Vitor Belfort, Renato Sobral, and Jeremy Horn. His 7-1 prime title stretch, finishing power, and repeated success against elite contenders separate him from fighters with shorter championship peaks.",
    whyNotHigher:
      "The case against going higher is the damage around the edges of his reign. Couture stopped him before the title run, Rampage ended it in the first round, and Liddell went 1-5 over his final six UFC fights. Most of that collapse came from ages 37 to 40, but the fighters above him generally sustained elite results longer and finished cleaner.",
  },
};

const charlesOliveiraBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Charles Oliveira",
);

if (!charlesOliveiraBaseline) {
  throw new Error(
    "Charles Oliveira is missing from the sealed ranking baseline.",
  );
}

const charlesOliveira = {
  ...charlesOliveiraBaseline,
  presentation: {
    ...charlesOliveiraBaseline.presentation,
    oneLiner:
      "Oliveira makes every exchange feel dangerous. His pressure, knees, elbows, opportunistic submissions, and fearless scrambles create constant chaos, while elite jiu-jitsu and sharp striking let him turn a single mistake into an immediate finish.",
    whyRankedHere:
      "Oliveira's UFC resume combines championship success with historic finishing production. He stopped Michael Chandler to win the lightweight title, then finished Dustin Poirier and Justin Gaethje in consecutive championship fights. Later wins over Mateusz Gamrot and Max Holloway extended his relevance deep into his career, while his UFC records for finishes and submissions give the resume exceptional depth.",
    whyNotHigher:
      "The limitation is consistency across the full UFC career. Oliveira lost eight times before becoming champion, Islam Makhachev decisively ended his title run, and later defeats to Arman Tsarukyan and Ilia Topuria kept him from rebuilding another sustained championship reign. At 36, he has added major late-career wins, but the fighters above him generally sustained elite success with fewer damaging setbacks.",
  },
};

const amandaNunesBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Amanda Nunes",
);

if (!amandaNunesBaseline) {
  throw new Error("Amanda Nunes is missing from the sealed ranking baseline.");
}

const amandaNunes = {
  ...amandaNunesBaseline,
  presentation: {
    ...amandaNunesBaseline.presentation,
    oneLiner:
      "Nunes combined crushing power with patience, timing, and complete versatility. She could pressure behind heavy boxing, wrestle when needed, punish mistakes instantly, and turn one clean opening into a finish before opponents could settle into their game plan.",
    whyRankedHere:
      "Nunes built the strongest UFC resume in women's MMA: championships at bantamweight and featherweight, sustained title success, and victories over nearly every defining champion of her era. She stopped Ronda Rousey, Cris Cyborg, Holly Holm, and Miesha Tate, beat Valentina Shevchenko twice, and later reclaimed the bantamweight belt from Julianna Pena.",
    whyNotHigher:
      "Nunes does have real blemishes: she lost the bantamweight title to Julianna Pena in a massive upset, dropped multiple UFC fights before her championship peak, and barely edged Valentina Shevchenko in their second meeting. But she avenged Pena decisively, beat Shevchenko twice, and built enough elite championship work around those setbacks that they never seriously threaten her place at the top.",
  },
};

const dustinPoirierBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Dustin Poirier",
);

if (!dustinPoirierBaseline) {
  throw new Error(
    "Dustin Poirier is missing from the sealed ranking baseline.",
  );
}

const dustinPoirier = {
  ...dustinPoirierBaseline,
  presentation: {
    ...dustinPoirierBaseline.presentation,
    oneLiner:
      "Poirier's peak was built on pressure boxing, durability, and ruthless combination work. He could survive violent exchanges, keep a punishing pace, and break elite lightweights with layered punches, body work, and opportunistic grappling when fights turned chaotic.",
    whyRankedHere:
      "Poirier's 22 UFC wins are backed by unusual opponent quality and longevity. He won the interim lightweight title over Max Holloway, owns two UFC wins over Holloway and Conor McGregor, and beat Justin Gaethje, Eddie Alvarez, Anthony Pettis, Michael Chandler, and Dan Hooker. That depth gives him a stronger case than many fighters with thinner championship resumes.",
    whyNotHigher:
      "The ceiling is championship achievement. Poirier never won the undisputed lightweight title, losing title fights to Khabib Nurmagomedov, Charles Oliveira, and Islam Makhachev. The Gaethje rematch knockout added another major setback during his late prime. His final loss to Max Holloway came post-prime, but the fighters above him generally paired comparable elite wins with sustained undisputed reigns.",
  },
};

const robertWhittakerBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Robert Whittaker",
);

if (!robertWhittakerBaseline) {
  throw new Error(
    "Robert Whittaker is missing from the sealed ranking baseline.",
  );
}

const robertWhittaker = {
  ...robertWhittakerBaseline,
  presentation: {
    ...robertWhittakerBaseline.presentation,
    oneLiner:
      "Whittaker's peak combined darting karate footwork, explosive boxing entries, sharp counters, and elite takedown defense, letting him control range while sustaining a punishing pace.",
    whyRankedHere:
      "Whittaker's UFC resume has rare middleweight depth: two wins over Yoel Romero, including the interim-title victory, plus Jacare Souza, Jared Cannonier, Paulo Costa, and Marvin Vettori. Years of ranked wins separate him from the tier below.",
    whyNotHigher:
      "The lack of an official title-defense streak limits Whittaker's ceiling, and Adesanya beat him twice during his championship window. Later finish losses to Dricus du Plessis and Khamzat Chimaev further separate him from fighters with deeper reigns.",
  },
};

const kaylaHarrisonBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Kayla Harrison",
);

if (!kaylaHarrisonBaseline) {
  throw new Error(
    "Kayla Harrison is missing from the sealed ranking baseline.",
  );
}

const kaylaHarrison = {
  ...kaylaHarrisonBaseline,
  presentation: {
    ...kaylaHarrisonBaseline.presentation,
    oneLiner:
      "Harrison's UFC peak has been built on suffocating grappling control, relentless takedown pressure, heavy top positioning, and submission danger that lets her dictate rounds from start to finish.",
    whyRankedHere:
      "A perfect 3-0 UFC run already includes taking the bantamweight title from reigning champion Julianna Pena, plus wins over former champion Holly Holm and top contender Ketlen Vieira. Few fighters have built that much quality in three appearances.",
    whyNotHigher:
      "The limitation is simple: three UFC fights, one title-fight win, and no defenses. The women above Harrison built longer elite runs and deeper championship resumes, and her late UFC arrival leaves little time to match that volume.",
  },
};

const khamzatChimaevBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Khamzat Chimaev",
);

if (!khamzatChimaevBaseline) {
  throw new Error(
    "Khamzat Chimaev is missing from the sealed ranking baseline.",
  );
}

const khamzatChimaev = {
  ...khamzatChimaevBaseline,
  presentation: {
    ...khamzatChimaevBaseline.presentation,
    oneLiner:
      "Chimaev overwhelmed opponents with relentless wrestling pressure, physical control, and submission danger, turning early takedowns into long stretches of dominance and fast finishes.",
    whyRankedHere:
      "The UFC title win over Dricus du Plessis gives his resume championship weight. Wins over Robert Whittaker and Gilbert Burns, plus Kamaru Usman, back the peak with elite names, while a nine-fight UFC winning streak and four top-five wins separate him from shorter contender resumes.",
    whyNotHigher:
      "One UFC title win with no successful defense is still a thin championship case. The Sean Strickland title loss ended the unbeaten run, and Chimaev's elite window is much shorter than the sustained title-fight volume and longevity of the fighters above him.",
  },
};

const islamMakhachevBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Islam Makhachev",
);

if (!islamMakhachevBaseline) {
  throw new Error(
    "Islam Makhachev is missing from the sealed ranking baseline.",
  );
}

const islamMakhachev = {
  ...islamMakhachevBaseline,
  presentation: {
    ...islamMakhachevBaseline.presentation,
    oneLiner:
      "Islam's peak combines suffocating control with rare finishing efficiency. He dictates where fights happen through pressure, wrestling, and top control, then forces mistakes with submissions or dangerous striking. He can dominate rounds without giving up the threat of a finish.",
    whyRankedHere:
      "Islam has a 17-1 UFC record, six title-fight wins, and a 10-0 prime run. He submitted Charles Oliveira for the lightweight belt, defended it four times, including twice against Alexander Volkanovski, then beat Jack Della Maddalena over five rounds to become welterweight champion. That championship volume and elite-win quality separate him from the tier below.",
    whyNotHigher:
      "The strongest case against moving Islam higher is career length, not peak quality. His elite run is still shorter than the sustained championship eras of the UFC greats above him. The Adriano Martins knockout is a UFC loss, even if it came well before his prime. He is still active at an elite level, so that longevity deficit can shrink.",
  },
};

const robbieLawlerBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Robbie Lawler",
);

if (!robbieLawlerBaseline) {
  throw new Error("Robbie Lawler is missing from the sealed ranking baseline.");
}

const robbieLawler = {
  ...robbieLawlerBaseline,
  presentation: {
    ...robbieLawlerBaseline.presentation,
    oneLiner:
      "Lawler's peak paired a crushing southpaw left with sharp counters, elite durability, savage pocket work, and late-round surges that could turn momentum into a finish.",
    whyRankedHere:
      "Lawler earned this tier by winning the UFC welterweight title from Johny Hendricks, stopping Rory MacDonald in the fifth round of a title defense, and beating Carlos Condit. Two successful defenses separate him from thinner championship resumes.",
    whyNotHigher:
      "The limit is the short reign: Hendricks and Condit were split-decision wins, then Woodley took the belt by first-round knockout. Fighters above Lawler sustained championship control longer and stacked more elite UFC results.",
  },
};

const gloverTeixeiraBaseline = historicalMigrationSeedJson.fighters.find(
  (fighter) => fighter.fighter === "Glover Teixeira",
);

if (!gloverTeixeiraBaseline) {
  throw new Error(
    "Glover Teixeira is missing from the sealed ranking baseline.",
  );
}

const gloverTeixeira = {
  ...gloverTeixeiraBaseline,
  presentation: {
    ...gloverTeixeiraBaseline.presentation,
    oneLiner:
      "Teixeira's peak paired heavy pressure boxing with forceful takedowns, punishing top control, ground-and-pound, and submission threats that turned extended grappling exchanges into finishing opportunities.",
    whyRankedHere:
      "Sixteen UFC wins, thirteen against ranked opposition, and seven Top-5 victories give Teixeira rare light-heavyweight depth. He beat contenders across multiple eras, then submitted Jan Blachowicz for the UFC title in his forties, giving that longevity real championship weight.",
    whyNotHigher:
      "One title-fight win and no successful defense keep the championship ceiling short. Prime losses to Anthony Johnson, Alexander Gustafsson, Corey Anderson, and Jiri Prochazka also leave more volatility than the longer, steadier title runs above him.",
  },
};

const baselineFighter = (fighter: string) => {
  const input = historicalMigrationSeedJson.fighters.find(
    (candidate) => candidate.fighter === fighter,
  );
  if (!input)
    throw new Error(`${fighter} is missing from the sealed ranking baseline.`);
  return input;
};

/**
 * Ranking/fight refreshes are not editorial reviews. They may update canonical
 * ranking inputs, but the fighter's full presentation stays exactly as it was
 * until that fighter receives an intentional profile-copy review.
 */
export const rankingDataRefresh = <
  T extends { presentation: unknown },
  R extends Record<string, unknown> & { presentation?: never },
>(
  fighter: T,
  refresh: R,
) => ({
  ...fighter,
  ...refresh,
  presentation: fighter.presentation,
});

const reviewedFight = ({
  id,
  date,
  opponent,
  division,
  result,
  method = "decision",
  qualityTier,
  championshipType = "none",
  championshipManualCredit = null,
  rounds,
  upward = false,
}: {
  id: string;
  date: string;
  opponent: string;
  division: string;
  result: "win" | "loss";
  method?: string;
  qualityTier: string;
  championshipType?: string;
  championshipManualCredit?: number | null;
  rounds: readonly [number, number];
  upward?: boolean;
}) => ({
  id,
  date,
  opponent,
  division,
  officialResult: result,
  scoringDisposition: result === "win" ? "count-win" : "count-loss",
  methodCategory: method,
  qualityTier,
  championshipType,
  championshipEligible: true,
  championshipOpponentStrength: null,
  championshipManualCredit,
  rounds: { status: "audited", won: rounds[0], lost: rounds[1], drawn: 0 },
  lossClassification: {
    competitive: true,
    divisionContext: upward ? "upward" : "home",
    overrideRule: null,
  },
});

const reviewedQualityWin = (
  fighter: string,
  fightId: string,
  opponent: string,
  date: string,
  division: string,
  finalCredit: number,
  note: string,
) => ({
  fighter,
  fightId,
  opponent,
  date,
  division,
  finalCredit,
  reviewStatus: "locked",
  judgmentSource: "octagon-hq-2026-08-16-refresh",
  judgmentStatus: "cody-approved",
  provenance: "canonical UFC fight fact + approved August 16 ranking refresh",
  note,
});

const dricusBaseline = baselineFighter("Dricus du Plessis");
const dricusUsmanFight = reviewedFight({
  id: "2026-07-18-kamaru-usman",
  date: "2026-07-18",
  opponent: "Kamaru Usman",
  division: "Middleweight",
  result: "win",
  qualityTier: "top-ten",
  rounds: [4, 1],
});
const dricusDuPlessis = rankingDataRefresh(dricusBaseline, {
  facts: {
    ...dricusBaseline.facts,
    primeWindow: {
      ...dricusBaseline.facts.primeWindow,
      endFightId: null,
      open: true,
    },
    fights: [...dricusBaseline.facts.fights, dricusUsmanFight],
  },
  era: {
    ...dricusBaseline.era,
    window: { ...dricusBaseline.era.window, end: null },
  },
  judgments: {
    ...dricusBaseline.judgments,
    opponentQuality: {
      ...dricusBaseline.judgments.opponentQuality,
      inputs: [
        ...dricusBaseline.judgments.opponentQuality.inputs,
        reviewedQualityWin(
          "Dricus du Plessis",
          dricusUsmanFight.id,
          "Kamaru Usman",
          dricusUsmanFight.date,
          "Middleweight",
          0.65,
          "Meaningful former-champion win, tempered because Usman was not a current top-five middleweight.",
        ),
      ],
    },
  },
});

const usmanBaseline = baselineFighter("Kamaru Usman");
const usmanDricusFight = reviewedFight({
  id: "2026-07-18-dricus-du-plessis",
  date: "2026-07-18",
  opponent: "Dricus du Plessis",
  division: "Middleweight",
  result: "loss",
  qualityTier: "champion-level",
  rounds: [1, 4],
  upward: true,
});
const kamaruUsman = rankingDataRefresh(usmanBaseline, {
  facts: {
    ...usmanBaseline.facts,
    primeWindow: {
      ...usmanBaseline.facts.primeWindow,
      endFightId: "2023-03-18-leon-edwards",
      open: false,
    },
    fights: [...usmanBaseline.facts.fights, usmanDricusFight],
  },
});

const islamGarryFight = reviewedFight({
  id: "2026-08-15-ian-machado-garry",
  date: "2026-08-15",
  opponent: "Ian Machado Garry",
  division: "Welterweight",
  result: "win",
  qualityTier: "top-five",
  championshipType: "normal",
  championshipManualCredit: 0.95,
  rounds: [3, 2],
});
const islamMakhachevAugustRefresh = rankingDataRefresh(islamMakhachev, {
  facts: {
    ...islamMakhachev.facts,
    fights: [...islamMakhachev.facts.fights, islamGarryFight],
  },
  judgments: {
    ...islamMakhachev.judgments,
    championship: {
      ...islamMakhachev.judgments.championship,
      inputs: [
        ...islamMakhachev.judgments.championship.inputs,
        {
          fightId: islamGarryFight.id,
          opponent: "Ian Machado Garry",
          date: islamGarryFight.date,
          event: "UFC 330",
          titleType: "normal",
          officialTitleFight: true,
          finalAdjustedCredit: 0.95,
          notes:
            "First successful defense of the UFC welterweight title against the number-one challenger.",
        },
      ],
    },
    opponentQuality: {
      ...islamMakhachev.judgments.opponentQuality,
      inputs: [
        ...islamMakhachev.judgments.opponentQuality.inputs,
        reviewedQualityWin(
          "Islam Makhachev",
          islamGarryFight.id,
          "Ian Machado Garry",
          islamGarryFight.date,
          "Welterweight",
          1,
          "Number-one welterweight challenger in a successful title defense.",
        ),
      ],
    },
  },
});

const dernBaseline = baselineFighter("Mackenzie Dern");
const dernRobertsonFight = reviewedFight({
  id: "2026-08-15-gillian-robertson",
  date: "2026-08-15",
  opponent: "Gillian Robertson",
  division: "Strawweight",
  result: "win",
  qualityTier: "top-five",
  championshipType: "normal",
  championshipManualCredit: 0.9,
  rounds: [4, 1],
});
const mackenzieDern = rankingDataRefresh(dernBaseline, {
  facts: {
    ...dernBaseline.facts,
    fights: [...dernBaseline.facts.fights, dernRobertsonFight],
  },
  judgments: {
    ...dernBaseline.judgments,
    championship: {
      ...dernBaseline.judgments.championship,
      inputs: [
        ...dernBaseline.judgments.championship.inputs,
        {
          fightId: dernRobertsonFight.id,
          opponent: "Gillian Robertson",
          date: dernRobertsonFight.date,
          event: "UFC 330",
          titleType: "normal",
          officialTitleFight: true,
          finalAdjustedCredit: 0.9,
          notes:
            "First strawweight title defense against the number-five challenger.",
        },
      ],
    },
    opponentQuality: {
      ...dernBaseline.judgments.opponentQuality,
      inputs: [
        ...dernBaseline.judgments.opponentQuality.inputs,
        reviewedQualityWin(
          "Mackenzie Dern",
          dernRobertsonFight.id,
          "Gillian Robertson",
          dernRobertsonFight.date,
          "Strawweight",
          0.85,
          "Number-five strawweight challenger in Dern's first successful defense.",
        ),
      ],
    },
  },
});

const conorBaseline = baselineFighter("Conor McGregor");
const conorMcGregor = rankingDataRefresh(conorBaseline, {
  facts: {
    ...conorBaseline.facts,
    fights: conorBaseline.facts.fights.map((fight) =>
      fight.id === "2026-07-11-max-holloway"
        ? { ...fight, methodCategory: "ko-tko" }
        : fight,
    ),
  },
});

/** Applies the one-time, intentional 2026 profile-copy review without touching ranking data. */
const intentionalEditorialReview = <
  T extends { presentation: Record<string, unknown> },
>(
  fighter: T,
  copy: { oneLiner: string; whyRankedHere: string; whyNotHigher: string },
) => ({
  ...fighter,
  presentation: { ...fighter.presentation, ...copy },
});

export const v2RankingRoster: V2RankingRosterOverlay = {
  additions: [
    intentionalEditorialReview(
      rafaelDosAnjos,
      {
        oneLiner:
          "Dos Anjos reinvented himself from rugged contender into a suffocating lightweight champion, mixing pressure boxing, body kicks, takedowns, and relentless pace before carrying that physical style into a long welterweight run.",
        whyRankedHere:
          "Dos Anjos dominated Anthony Pettis to win the lightweight title, defended against Donald Cerrone, and also beat Benson Henderson, Nate Diaz, Robbie Lawler, Kevin Lee, and Neil Magny. His ability to collect elite wins across lightweight and welterweight for more than a decade gives the UFC resume exceptional depth.",
        whyNotHigher:
          "The lightweight reign ended after one defense when Eddie Alvarez stopped him, and Tony Ferguson beat him next. His welterweight run produced strong contender wins but no second championship, while later losses accumulated as the career aged. The longevity is outstanding; the sustained championship peak was brief.",
      },
    ),
  ],
  replacements: {
    "Jon Jones": intentionalEditorialReview(
      baselineFighter("Jon Jones"),
      {
        oneLiner:
          "Jones is the UFC's ultimate problem-solver: freakishly long, creative, ruthless in the clinch, elite in wrestling, and brilliant at adapting mid-fight. His dominance, longevity, aura, and controversies are inseparable from a career that has defined multiple eras.",
        whyRankedHere:
          "Jones built the deepest championship resume in UFC history. He became the youngest champion, won 16 title fights, collected 12 Top-5 victories, and beat generations of elite opposition including Mauricio Rua, Lyoto Machida, Daniel Cormier, and Alexander Gustafsson. Heavyweight title wins over Ciryl Gane and Stipe Miocic extended that dominance into a second division.",
        whyNotHigher:
          "The resume carries real blemishes despite the competitive dominance. Drug-testing failures, suspensions, stripped titles, and the overturned Daniel Cormier result interrupted his reign and complicate the legacy. Close decisions against Alexander Gustafsson, Thiago Santos, and Dominick Reyes also created legitimate debate around portions of an otherwise extraordinary championship run.",
      },
    ),
    "Georges St-Pierre": intentionalEditorialReview(
      baselineFighter("Georges St-Pierre"),
      {
        oneLiner:
          "St-Pierre turned complete MMA into a system: a sharp jab, explosive reactive takedowns, suffocating top control, and elite defensive awareness. His adaptability let him dictate where fights happened and neutralize wildly different challengers with remarkable consistency.",
        whyRankedHere:
          "St-Pierre dominated welterweight across multiple generations, avenging both UFC losses and stacking championship wins over Matt Hughes, BJ Penn, Jon Fitch, Carlos Condit, and other elite contenders. After four years away, he submitted Michael Bisping for the middleweight title, adding a second division to one of the sport's deepest title resumes.",
        whyNotHigher:
          "The Matt Serra upset is the clearest blemish on an otherwise controlled prime, and several later defenses became increasingly conservative decisions rather than emphatic separation. His retirement also ended the welterweight reign without another cycle of challengers, leaving slightly less championship volume than Jones despite an exceptionally clean elite career.",
      },
    ),
    "Anderson Silva": intentionalEditorialReview(
      baselineFighter("Anderson Silva"),
      {
        oneLiner:
          "Silva made elite middleweights look hesitant and helpless. His counterstriking, clinch knees, timing, and improvisation created a terrifying aura, and his long championship run remains one of the clearest examples of a fighter operating ahead of his division.",
        whyRankedHere:
          "Silva owned the UFC middleweight title for years, piling up ten successful defenses and a record-setting winning streak while finishing contenders with startling variety. Rich Franklin, Dan Henderson, Vitor Belfort, Chael Sonnen, and Yushin Okami all fell during a reign that combined championship volume, finishing threat, and extraordinary prime dominance.",
        whyNotHigher:
          "Chris Weidman ended the reign with back-to-back defeats, including the knockout that shattered Silva's aura and the leg injury in their rematch. Silva then went years without another meaningful UFC win. Those late results came after his great run, but the title ending and thinner elite-win depth keep the overall case below the two names above him.",
      },
    ),
    "Demetrious Johnson": intentionalEditorialReview(
      baselineFighter("Demetrious Johnson"),
      {
        oneLiner:
          "Johnson was speed, technique, and decision-making without a weak phase. He blended entries, chain wrestling, scrambles, combinations, and submissions so smoothly that flyweight championship fights often became demonstrations of how complete high-level MMA could look.",
        whyRankedHere:
          "Johnson established the UFC flyweight standard with a record eleven consecutive title defenses and victories over Joseph Benavidez, John Dodson, Henry Cejudo, Kyoji Horiguchi, and other top contenders. His reign paired sustained championship volume with technical dominance, and the Ray Borg armbar remains one of the most inventive title-fight finishes in UFC history.",
        whyNotHigher:
          "The main limitation is opponent depth relative to the strongest all-time divisions. Flyweight was still developing during much of Johnson's reign, and several challengers had shorter elite resumes than the opponents faced by Jones or St-Pierre. The close first Cejudo fight and split-decision loss in the rematch also prevented a completely uninterrupted ending.",
      },
    ),
    "Islam Makhachev": intentionalEditorialReview(
      islamMakhachevAugustRefresh,
      {
        oneLiner:
          "Makhachev suffocates opponents without becoming predictable. His pressure, clinch wrestling, trips, top control, submissions, and increasingly dangerous striking let him dictate pace and position while giving elite opponents very few safe ways to reset.",
        whyRankedHere:
          "Makhachev is 18-1 in the UFC with seven title-fight wins and a 17-fight winning streak. He submitted Charles Oliveira for lightweight gold, defended four times, then beat Jack Della Maddalena for the welterweight title and Ian Machado Garry in his first defense. Wins over Alexander Volkanovski twice add elite depth to the two-division championship run.",
        whyNotHigher:
          "His elite championship run is still shorter than the decade-spanning bodies of work above him. The Adriano Martins knockout remains the lone UFC defeat, although it came years before his prime. Makhachev has already built an extraordinary peak, but the current resume has not yet matched the same total championship longevity or multi-era opposition depth.",
      },
    ),
    "Alexander Volkanovski": intentionalEditorialReview(
      baselineFighter("Alexander Volkanovski"),
      {
        oneLiner:
          "Volkanovski was the featherweight problem nobody could solve for years: compact, fast, tactically flexible, and brilliant at changing rhythm. His footwork, feints, combinations, defensive wrestling, and mid-fight adjustments made him one of the era's most complete champions.",
        whyRankedHere:
          "Volkanovski dethroned Max Holloway and beat him three times, then defended the featherweight title against Brian Ortega, Chan Sung Jung, and Yair Rodriguez. Wins over Jose Aldo and Chad Mendes deepen the resume, while his long unbeaten UFC start and sustained control of an elite division establish a major championship body of work.",
        whyNotHigher:
          "Ilia Topuria ended the featherweight reign by knockout, creating a decisive finish to Volkanovski's championship peak. He also went 0-2 against Islam Makhachev at lightweight, including a short-notice knockout loss. Those upward-division defeats deserve lighter weight, but the Topuria result and shorter title volume than the very top names set the ceiling.",
      },
    ),
    "Khabib Nurmagomedov": intentionalEditorialReview(
      baselineFighter("Khabib Nurmagomedov"),
      {
        oneLiner:
          "Khabib turned pressure into inevitability. Once he trapped opponents near the fence, chain takedowns, wrist rides, mat returns, ground strikes, and exhausting control stripped away their offense until elite lightweights looked as trapped as everyone else.",
        whyRankedHere:
          "Khabib went 13-0 in the UFC and closed his career with dominant championship wins over Conor McGregor, Dustin Poirier, and Justin Gaethje after taking the lightweight title from Al Iaquinta. He also beat Rafael dos Anjos and Edson Barboza, producing an unbeaten run with a level of round-by-round control rarely seen at the elite level.",
        whyNotHigher:
          "The only real limitation is volume. Khabib retired with three successful title defenses and a shorter elite championship window than the champions above him. He never suffered the losses that complicate other resumes, but he also left before adding another generation of contenders or testing that dominance across a longer reign.",
      },
    ),
    "Matt Hughes": intentionalEditorialReview(
      baselineFighter("Matt Hughes"),
      {
        oneLiner:
          "Hughes was the physical standard of early UFC welterweight: explosive takedowns, crushing top pressure, slams, submissions, and the confidence to force opponents into exhausting grappling exchanges they usually could not survive.",
        whyRankedHere:
          "Hughes won the UFC welterweight title twice and accumulated seven successful defenses across his two reigns. He beat Georges St-Pierre, BJ Penn, Frank Trigg twice, Sean Sherk, and other leading welterweights of his era, giving the early division its first truly dominant long-term champion and one of the deepest championship records of that period.",
        whyNotHigher:
          "Georges St-Pierre ultimately surpassed him, beating Hughes decisively twice and becoming the division's superior champion. Hughes also accumulated meaningful losses across a long career, while the welterweight field of his first reign was less developed than later eras. The title volume is enormous, but the dominance did not age as cleanly as the cases above.",
      },
    ),
    "Kamaru Usman": intentionalEditorialReview(
      kamaruUsman,
      {
        oneLiner:
          "Usman overwhelmed welterweights with pace, clinch pressure, wrestling, and physical control before his striking caught up enough to make him dangerous everywhere. At his peak, opponents had to survive both relentless attrition and increasingly confident power punching.",
        whyRankedHere:
          "Usman won the welterweight title from Tyron Woodley and defended it five times, beating Colby Covington twice, Jorge Masvidal twice, and Gilbert Burns during a 15-fight UFC winning streak. The run combined championship volume, elite wins, and sustained round control, making him the clearest post-St-Pierre standard at welterweight.",
        whyNotHigher:
          "Leon Edwards ended the reign with a fifth-round knockout and then beat Usman again over five rounds, closing the championship chapter decisively. Usman's elite window was also shorter than the longest all-time reigns, and later losses to Khamzat Chimaev and Dricus du Plessis came after the prime rather than adding new championship depth.",
      },
    ),
    "Max Holloway": intentionalEditorialReview(
      baselineFighter("Max Holloway"),
      {
        oneLiner:
          "Holloway built his identity on relentless pace, layered boxing, durability, and the confidence to solve opponents in real time. His volume could turn competitive fights into avalanches, while his composure made prolonged exchanges feel like his territory.",
        whyRankedHere:
          "Holloway owns one of the deepest UFC win lists ever at featherweight, including Jose Aldo twice, Brian Ortega, Calvin Kattar, Arnold Allen, Frankie Edgar, and Anthony Pettis. He won and defended the featherweight title, later added major lightweight victories, and sustained elite relevance across more than a decade of UFC competition.",
        whyNotHigher:
          "Alexander Volkanovski beat Holloway three times and denied him a second featherweight reign, while Ilia Topuria later handed him his first knockout loss. Holloway's championship control therefore falls short of the longest dominant reigns despite exceptional longevity and opponent quality. The overall loss column is heavier than the resumes immediately above him.",
      },
    ),
    "Stipe Miocic": intentionalEditorialReview(
      baselineFighter("Stipe Miocic"),
      {
        oneLiner:
          "Miocic was the heavyweight champion who made reliability his superpower: sharp boxing, real wrestling, composure under fire, and the cardio to keep making good decisions after bigger punchers began to fade.",
        whyRankedHere:
          "Miocic owns the strongest championship resume in UFC heavyweight history. He set the division record with three consecutive title defenses, beat Francis Ngannou over five rounds, reclaimed the belt from Daniel Cormier, and won their trilogy. Victories over Fabricio Werdum, Junior dos Santos, Alistair Overeem, and Andrei Arlovski add exceptional heavyweight depth.",
        whyNotHigher:
          "His two title reigns were interrupted by knockout losses to Daniel Cormier and Francis Ngannou, preventing one uninterrupted era of control. Heavyweight also offers fewer deep elite runs than lighter divisions. The late Jon Jones defeat came after a long layoff and well past Stipe's prime, so it adds little.",
      },
    ),
    "Jose Aldo": intentionalEditorialReview(
      baselineFighter("Jose Aldo"),
      {
        oneLiner:
          "At his best, Aldo mixed explosive speed, brutal leg kicks, elite takedown defense, and calm counterstriking with championship composure. He could discourage pressure, punish entries, and control fights without needing reckless exchanges.",
        whyRankedHere:
          "Aldo won eight UFC title fights and twice defeated both Frankie Edgar and Chad Mendes, while adding elite wins over Kenny Florian and Renato Moicano. His UFC championship success, deep ranked-win record, and later bantamweight relevance give the resume unusual longevity even though part of his legendary featherweight reign began before the UFC merger.",
        whyNotHigher:
          "His defining UFC losses came against the featherweights who followed him. Conor McGregor stopped him in 13 seconds, Max Holloway finished him twice, and Alexander Volkanovski clearly outpointed him. Aldo remained competitive afterward, but he never regained UFC gold, leaving a shorter title run than his broader featherweight legacy can suggest.",
      },
    ),
    "Randy Couture": intentionalEditorialReview(
      baselineFighter("Randy Couture"),
      {
        oneLiner:
          "Couture kept beating younger, faster, more dangerous athletes by dragging them into his fight. Dirty boxing, body locks, takedowns, cage pressure, and elite tactical discipline made him the UFC's great late-career problem solver.",
        whyRankedHere:
          "Couture won UFC championships at heavyweight and light heavyweight and repeatedly reclaimed gold across different eras. He beat Vitor Belfort, Kevin Randleman, Pedro Rizzo, Chuck Liddell, Tito Ortiz, Tim Sylvia, and Gabriel Gonzaga, often with a title at stake. That two-division championship record and elite opponent list give him rare historical depth.",
        whyNotHigher:
          "The championship highs were separated by too many losses to form one sustained dominant reign. Liddell, Belfort, Josh Barnett, Brock Lesnar, and others beat Couture during meaningful stretches of his UFC career. His late heavyweight comeback was remarkable, but the full record is more volatile than the cleaner long-reign champions ahead of him.",
      },
    ),
    "Israel Adesanya": intentionalEditorialReview(
      baselineFighter("Israel Adesanya"),
      {
        oneLiner:
          "Adesanya made distance feel like a trap. Feints, stance changes, kicks, and elite counterstriking punished hesitation, while his reads let him turn impatient entries into clean counters and sudden knockdowns without surrendering control of the fight.",
        whyRankedHere:
          "Adesanya won the interim middleweight title, knocked out Robert Whittaker to become undisputed champion, made five successful defenses, and later knocked out Alex Pereira to regain the belt. Two wins over Whittaker plus victories over Paulo Costa, Marvin Vettori, Jared Cannonier, Kelvin Gastelum, and Yoel Romero give his middleweight run exceptional depth.",
        whyNotHigher:
          "The later championship years became uneven. Pereira ended the first reign, Sean Strickland clearly took the belt from him, and Dricus du Plessis submitted him in another title fight. Adesanya also fell short against Jan Blachowicz at light heavyweight, leaving a great middleweight reign without the second-division success that could have strengthened the case.",
      },
    ),
    "Daniel Cormier": intentionalEditorialReview(
      baselineFighter("Daniel Cormier"),
      {
        oneLiner:
          "Cormier turned a short, powerful frame into a pressure weapon. Hand fighting, dirty boxing, body locks, chain wrestling, and relentless balance let him crowd opponents, control the clinch, and impose himself on much larger men.",
        whyRankedHere:
          "Cormier became UFC champion at light heavyweight and heavyweight, made three successful defenses at 205, knocked out Stipe Miocic for heavyweight gold, and defended against Derrick Lewis. Two wins over Anthony Johnson plus victories over Alexander Gustafsson, Volkan Oezdemir, and Miocic give him a concentrated run of elite championship success.",
        whyNotHigher:
          "The two rivals who defined his championship years also set the ceiling. Jon Jones beat him twice, with the rematch later overturned after Jones failed a drug test, and Stipe Miocic won their heavyweight trilogy 2-1. Cormier entered the UFC late in his career, so his title-level volume never reached the longest-reigning champions.",
      },
    ),
    "Alex Pereira": intentionalEditorialReview(
      baselineFighter("Alex Pereira"),
      {
        oneLiner:
          "Pereira fights with the calm of someone who knows one clean read can end everything. His pressure, calf kicks, feints, and devastating left hook steadily narrow opponents' options until the knockout opening appears.",
        whyRankedHere:
          "Pereira's UFC rise produced championship success at a historic pace. He stopped Israel Adesanya for middleweight gold, then moved up and beat Jiri Prochazka for the light heavyweight title before adding championship wins over Prochazka again, Jamahal Hill, Khalil Rountree Jr., and Magomed Ankalaev.",
        whyNotHigher:
          "The elite UFC window remains compact. Adesanya knocked Pereira out in their title rematch, Magomed Ankalaev beat him before Pereira won the rematch, and Ciryl Gane later stopped him at heavyweight. Those setbacks and the shorter overall UFC career leave less sustained dominance than the longer championship runs above.",
      },
    ),
    "Chuck Liddell": intentionalEditorialReview(
      baselineFighter("Chuck Liddell"),
      {
        oneLiner:
          "Liddell became the face of sprawl-and-brawl: elite defensive wrestling kept him upright, while awkward counters and a thunderous right hand made exchanges dangerous even when he was moving backward.",
        whyRankedHere:
          "Liddell captured the light heavyweight title from Randy Couture and defended it four times, adding major UFC wins over Couture, Tito Ortiz, Vitor Belfort, Renato Sobral, and Jeremy Horn. His championship stretch paired real title volume with the finishing power and star presence that defined the division's mid-2000s boom.",
        whyNotHigher:
          "Couture stopped him before the championship run, Quinton Jackson ended it in the first round, and Liddell went 1-5 over his final six UFC fights. Most of that collapse came after his prime, but the title run itself was shorter and less clean than the strongest cases above.",
      },
    ),
    "Charles Oliveira": intentionalEditorialReview(
      baselineFighter("Charles Oliveira"),
      {
        oneLiner:
          "Oliveira makes every exchange feel dangerous. Pressure, knees, elbows, fearless scrambles, and elite jiu-jitsu create constant chaos, and he can turn one bad reaction into a submission or a finishing combination almost instantly.",
        whyRankedHere:
          "Oliveira stopped Michael Chandler to win the lightweight title, then finished Dustin Poirier and Justin Gaethje in consecutive championship fights. His record-setting UFC submission and finish totals add historic depth, while later victories over Mateusz Gamrot and Max Holloway extended his relevance long after his first contender rise.",
        whyNotHigher:
          "Oliveira lost eight UFC fights before becoming champion, Islam Makhachev decisively ended his title run, and later defeats to Arman Tsarukyan and Ilia Topuria blocked another sustained reign. The spectacular finishing record is undeniable, but the full career contains more meaningful setbacks than the champions above him.",
      },
    ),
    "T.J. Dillashaw": intentionalEditorialReview(
      baselineFighter("T.J. Dillashaw"),
      {
        oneLiner:
          "Dillashaw's best years were a blur of stance switches, angles, combination punching, kicks, and relentless movement. He could overwhelm elite bantamweights with pace and creativity, but the EPO suspension permanently complicates that championship legacy.",
        whyRankedHere:
          "Dillashaw won the bantamweight title twice and collected five UFC title-fight wins, including emphatic finishes of Renan Barao and Cody Garbrandt. He also beat Cory Sandhagen, Raphael Assuncao, and John Lineker, giving the resume quality beyond the belt and one of the division's strongest championship peaks.",
        whyNotHigher:
          "The EPO suspension and vacated title are major competitive blemishes, not background noise. Dominick Cruz also interrupted his first reign, the flyweight loss to Henry Cejudo was decisive, and the Aljamain Sterling fight ended with severe shoulder-injury context. Together those issues keep an excellent bantamweight resume from looking clean.",
      },
    ),
    "Merab Dvalishvili": intentionalEditorialReview(
      baselineFighter("Merab Dvalishvili"),
      {
        oneLiner:
          "Merab turns cardio into a weapon. Constant takedown attempts, mat returns, clinch pressure, and frantic pace force elite bantamweights to defend for minutes at a time until they are fighting his rhythm instead of theirs.",
        whyRankedHere:
          "Merab built his title case through one of bantamweight's toughest stretches, beating Jose Aldo, Petr Yan, Henry Cejudo, and Sean O'Malley while piling up relentless control. Championship success added to that contender run, and his volume against elite opposition gives the resume substance beyond a single belt-winning night.",
        whyNotHigher:
          "His championship chapter is still shorter than the established long-reign bantamweights, and the Petr Yan rivalry prevents complete separation at the top of his era. Merab's pace and elite-win depth are already outstanding, but the total title-fight volume has not yet matched the longest historical cases.",
      },
    ),
    "Frankie Edgar": intentionalEditorialReview(
      baselineFighter("Frankie Edgar"),
      {
        oneLiner:
          "Edgar made undersized toughness look like a championship skill. Endless movement, quick boxing entries, chain wrestling, recovery, and stubborn pace let him survive huge moments and keep turning fights back in his direction.",
        whyRankedHere:
          "Edgar won the UFC lightweight title from BJ Penn, beat Penn again, and produced a classic championship rivalry with Gray Maynard. He later added major featherweight wins over Chad Mendes, Cub Swanson, Urijah Faber, and Charles Oliveira, creating rare high-level depth across multiple divisions and an unusually long UFC career.",
        whyNotHigher:
          "The lightweight reign was relatively short, and Jose Aldo twice stopped Edgar from adding featherweight gold. His long career also accumulated a heavy loss column, including damaging late knockouts. Much of that came after his prime, but the championship peak lacked the sustained control of stronger cases above.",
      },
    ),
    "Francis Ngannou": intentionalEditorialReview(
      baselineFighter("Francis Ngannou"),
      {
        oneLiner:
          "Ngannou carried power that changed every tactical decision before a punch was thrown. His rise from raw knockout threat to patient champion became even more dangerous once wrestling defense and composure caught up.",
        whyRankedHere:
          "Ngannou tore through heavyweight contenders with finishes of Alistair Overeem, Junior dos Santos, Cain Velasquez, Curtis Blaydes, and Jairzinho Rozenstruik, then knocked out Stipe Miocic for the title. His five-round defense against Ciryl Gane showed another layer, giving a short championship run real substance beyond pure power.",
        whyNotHigher:
          "The UFC title run ended after one successful defense when Ngannou left the promotion, leaving far less championship volume than the heavyweight greats above him. Stipe also beat him decisively in their first meeting. The peak was frightening, but the UFC career stopped before a long reign developed.",
      },
    ),
    "Cain Velasquez": intentionalEditorialReview(
      baselineFighter("Cain Velasquez"),
      {
        oneLiner:
          "Velasquez fought heavyweight at a pace the division rarely sees. Wrestling pressure, combinations, clinch work, and elite cardio let him drown bigger men, making his healthy prime one of the division's most overwhelming runs.",
        whyRankedHere:
          "Velasquez twice won the UFC heavyweight title and built his best work around decisive victories over Junior dos Santos, Antonio Silva, Brock Lesnar, and Antonio Rodrigo Nogueira. His two dominant rematch wins over dos Santos showed the full pressure game at championship level and established a remarkable peak.",
        whyNotHigher:
          "Injuries repeatedly broke up the reign and left the UFC resume far shorter than his ability suggested. Junior dos Santos knocked him out in their first title fight, and Fabricio Werdum submitted him in another championship loss. Long layoffs prevented the defenses and elite wins needed for a deeper case.",
      },
    ),
    "Benson Henderson": intentionalEditorialReview(
      baselineFighter("Benson Henderson"),
      {
        oneLiner:
          "Henderson was a durable, adaptable lightweight champion who could wrestle, scramble, kick, and push a hard pace for five rounds. His fights were often close, but he consistently found ways to stay competitive everywhere.",
        whyRankedHere:
          "Henderson won four UFC title fights, beating Frankie Edgar twice before defending the lightweight belt against Nate Diaz and Gilbert Melendez. Wins over Jim Miller and Clay Guida strengthen the run beneath the championship results, giving him one of the division's deeper early-2010s UFC resumes.",
        whyNotHigher:
          "The reign produced several narrow decisions rather than overwhelming separation, most notably against Edgar and Melendez. Anthony Pettis then submitted Henderson to end the title run, and Rafael dos Anjos stopped him soon afterward. The championship volume is strong, but the peak was less dominant than the lightweight champions above.",
      },
    ),
    "Aljamain Sterling": intentionalEditorialReview(
      baselineFighter("Aljamain Sterling"),
      {
        oneLiner:
          "Sterling turned awkward movement, long-range kicking, back takes, and suffocating grappling into one of bantamweight's strangest championship puzzles. His title run was effective, but unusual fight circumstances kept following it.",
        whyRankedHere:
          "Sterling logged four bantamweight title-fight wins, including a clear rematch victory over Petr Yan, a defense against Henry Cejudo, and a dominant win over T.J. Dillashaw. His quick submission of Cory Sandhagen and later featherweight victories add elite depth beyond the championship stretch.",
        whyNotHigher:
          "The first Yan title win came by disqualification, and Dillashaw entered their defense with a badly compromised shoulder, so two championship results carry unusual context. Sean O'Malley then stopped Sterling to end the reign, while the later Movsar Evloev loss prevented a second title run at featherweight.",
      },
    ),
    "Junior dos Santos": intentionalEditorialReview(
      baselineFighter("Junior dos Santos"),
      {
        oneLiner:
          "Dos Santos brought elite boxing speed and combinations to heavyweight without sacrificing durability or takedown defense. During his rise, he could beat opponents to the punch repeatedly before a sudden right hand ended the night.",
        whyRankedHere:
          "Dos Santos opened his UFC career with a nine-fight winning streak, knocked out Cain Velasquez for the heavyweight title, and added major wins over Fabricio Werdum, Stipe Miocic, Frank Mir, Shane Carwin, Mark Hunt, and Derrick Lewis. That opponent list gives his one-reign championship resume unusual depth.",
        whyNotHigher:
          "Cain Velasquez decisively won their rivalry with two punishing championship victories after dos Santos took the first fight. The title reign lasted only one defense, and later prime losses added damage before the clearly post-prime skid. The win list is elite, but the sustained title control was limited.",
      },
    ),
    "B.J. Penn": intentionalEditorialReview(
      baselineFighter("B.J. Penn"),
      {
        oneLiner:
          "Penn was the natural talent who seemed built for any weight class: slick boxing, elite balance, takedown defense, and world-class jiu-jitsu. At his best, he fought with a technical freedom few early UFC stars possessed.",
        whyRankedHere:
          "Penn won UFC titles at welterweight and lightweight, stunning Matt Hughes for the 170-pound belt before later becoming the dominant lightweight champion. He defended the lightweight title three times and added victories over Joe Stevenson, Sean Sherk, Kenny Florian, and Diego Sanchez during his strongest UFC run.",
        whyNotHigher:
          "Penn's later UFC career collapsed into a long winless stretch, leaving an ugly final record for an elite champion. Georges St-Pierre also beat him twice, and Frankie Edgar ended his lightweight reign. The peak was brilliant, but the full UFC resume is far less consistent than the talent suggests.",
      },
    ),
    "Justin Gaethje": intentionalEditorialReview(
      baselineFighter("Justin Gaethje"),
      {
        oneLiner:
          "Gaethje built a career out of controlled violence: crushing leg kicks, huge right hands, pressure, and an appetite for exchanges that could turn any lightweight fight into chaos. Later patience made the danger more sustainable.",
        whyRankedHere:
          "Gaethje's UFC run includes championship success and elite wins over Ilia Topuria, Tony Ferguson, Dustin Poirier, Michael Chandler, Rafael Fiziev, Edson Barboza, and Donald Cerrone. His ability to remain a title-level threat across multiple lightweight generations gives the resume far more depth than his action-fighter reputation alone suggests.",
        whyNotHigher:
          "Khabib Nurmagomedov and Charles Oliveira finished Gaethje in title fights, while Dustin Poirier, Eddie Alvarez, and Max Holloway also stopped him in major bouts. Even with championship success, those prime setbacks prevent the sustained control seen from the stronger lightweight cases.",
      },
    ),
    "Tyron Woodley": intentionalEditorialReview(
      baselineFighter("Tyron Woodley"),
      {
        oneLiner:
          "Woodley could make a fight feel frozen until one explosive moment changed everything. Elite wrestling, a terrifying right hand, and disciplined countering let him control risk while opponents worried constantly about the burst.",
        whyRankedHere:
          "Woodley knocked out Robbie Lawler for the welterweight title, retained it in a draw with Stephen Thompson, then beat Thompson, Demian Maia, and Darren Till. Wins over Carlos Condit and Kelvin Gastelum add contender depth to a championship resume stronger than his cautious style sometimes suggested.",
        whyNotHigher:
          "Kamaru Usman dominated Woodley to end the reign, and the decline afterward was severe. Before that, several defenses were low-output, closely contested affairs rather than emphatic separation. The title run was legitimate and productive, but it lacked the longevity and sustained offensive dominance of the welterweight champions above.",
      },
    ),
    "Glover Teixeira": intentionalEditorialReview(
      baselineFighter("Glover Teixeira"),
      {
        oneLiner:
          "Teixeira's story starts with becoming UFC champion at 42, the payoff to a career built on durability, pressure boxing, takedowns, punishing top control, and a submission game that stayed dangerous late.",
        whyRankedHere:
          "Sixteen UFC wins, thirteen over ranked opponents, and seven Top-5 victories give Teixeira exceptional light-heavyweight depth. He beat contenders across multiple eras, then submitted Jan Blachowicz for the title at 42, turning remarkable longevity into a championship breakthrough.",
        whyNotHigher:
          "His championship peak was brief: one title-fight win and no successful defense. He also lost repeatedly during his prime, including decisive defeats to Anthony Johnson, Alexander Gustafsson, and Corey Anderson, leaving a less consistent elite run than the stronger cases above him.",
      },
    ),
    "Dustin Poirier": intentionalEditorialReview(
      baselineFighter("Dustin Poirier"),
      {
        oneLiner:
          "Poirier became one of lightweight's great attrition fighters, combining pressure boxing, durability, body work, and layered combinations with the composure to survive violent exchanges and keep breaking opponents late.",
        whyRankedHere:
          "Poirier won 22 UFC fights, captured the interim lightweight title over Max Holloway, and beat Conor McGregor twice. Victories over Justin Gaethje, Eddie Alvarez, Anthony Pettis, Michael Chandler, and Dan Hooker give him elite opponent depth across a remarkably long contender run.",
        whyNotHigher:
          "Poirier never won the undisputed lightweight title, losing championship fights to Khabib Nurmagomedov, Charles Oliveira, and Islam Makhachev. Justin Gaethje also knocked him out in their rematch. Repeatedly reaching the summit without taking the undisputed belt is the clearest limitation on an otherwise deep resume.",
      },
    ),
    "Alexandre Pantoja": intentionalEditorialReview(
      baselineFighter("Alexandre Pantoja"),
      {
        oneLiner:
          "Pantoja treats every scramble like an invitation. Relentless grappling, back takes, submission threats, durable exchanges, and a refusal to slow down made him the modern flyweight champion nobody could comfortably separate from.",
        whyRankedHere:
          "Pantoja beat Brandon Moreno for the flyweight title and built four successful defenses, including wins over Brandon Royval, Kai Asakura, and Kai Kara-France. His repeated success against the division's best gives him the strongest UFC flyweight championship resume outside Demetrious Johnson.",
        whyNotHigher:
          "Demetrious Johnson's reign remains far longer, while Pantoja's rise included losses to Dustin Ortiz, Deiveson Figueiredo, Askar Askarov, and Joshua Van. Several challengers also entered title fights without deep elite resumes. The championship run is excellent, but it has less longevity than the historical benchmark.",
      },
    ),
    "Leon Edwards": intentionalEditorialReview(
      baselineFighter("Leon Edwards"),
      {
        oneLiner:
          "Edwards built his game around patience: sharp straight punches, clinch elbows, kicks, takedown defense, and calm positional decisions that could make dangerous welterweights spend rounds fighting at his preferred tempo.",
        whyRankedHere:
          "Edwards completed a long welterweight climb by knocking out Kamaru Usman for the title, then beating him again over five rounds and defending against Colby Covington. Two victories over a dominant champion give the run unusual quality, while years of ranked wins support the peak.",
        whyNotHigher:
          "The reign ended after two successful defenses when Belal Muhammad clearly beat him, and Sean Brady later submitted him. Edwards also produced fewer finishes and title wins than the strongest welterweight champions. The Usman victories are enormous, but the period of divisional control was short.",
      },
    ),
    "Tito Ortiz": intentionalEditorialReview(
      baselineFighter("Tito Ortiz"),
      {
        oneLiner:
          "Ortiz was the UFC's first true light-heavyweight franchise star: relentless takedowns, punishing ground-and-pound, raw conditioning, and a confrontational personality that made his long title reign feel bigger than the promotion around it.",
        whyRankedHere:
          "Ortiz defended the UFC light heavyweight title five times, giving him championship volume that still matters decades later. Wins over Wanderlei Silva, Yuki Kondo, Evan Tanner, Vladimir Matyushenko, and Ken Shamrock established him as the division's dominant early champion before the Couture-Liddell era arrived.",
        whyNotHigher:
          "The early light-heavyweight field was thinner than later generations, and Randy Couture decisively ended Ortiz's reign before Chuck Liddell beat him twice. Those losses undercut his claim to remain the division's best once the competition deepened, leaving impressive title volume without comparable elite-win depth.",
      },
    ),
    "Ilia Topuria": intentionalEditorialReview(
      baselineFighter("Ilia Topuria"),
      {
        oneLiner:
          "Topuria brings compact, technically clean violence: sharp boxing, huge power, patient pressure, and elite grappling underneath it. His confidence comes from having genuine finishing routes anywhere, not from needing one fight.",
        whyRankedHere:
          "Topuria knocked out Alexander Volkanovski for the featherweight title and became the first man to stop Max Holloway with strikes. Those two historic wins capped an unbeaten UFC rise and created one of the loudest championship peaks of the modern era.",
        whyNotHigher:
          "The championship body of work is still short, and Justin Gaethje handed Topuria his first UFC defeat after the featherweight takeover. That loss does not erase the Volkanovski and Holloway wins, but it stopped momentum toward a longer run. Established champions accumulated more championship years.",
      },
    ),
    "Fabricio Werdum": intentionalEditorialReview(
      baselineFighter("Fabricio Werdum"),
      {
        oneLiner:
          "Werdum evolved from elite submission specialist into a complete heavyweight, adding confident Muay Thai and clinch offense to a ground game dangerous enough that even accomplished wrestlers hesitated to follow him down.",
        whyRankedHere:
          "Werdum stopped Mark Hunt for the interim belt, then submitted Cain Velasquez to become undisputed heavyweight champion. Wins over Antonio Rodrigo Nogueira, Travis Browne, and other ranked heavyweights give the resume depth beyond the title night and support a long stretch of elite relevance.",
        whyNotHigher:
          "Werdum never completed an undisputed title defense. Stipe Miocic knocked him out in the first round to end the reign, while later losses to Alistair Overeem and Alexander Volkov added setbacks. The peak was legitimate, but too short to match deeper heavyweight resumes.",
      },
    ),
    "Robbie Lawler": intentionalEditorialReview(
      baselineFighter("Robbie Lawler"),
      {
        oneLiner:
          "Lawler's second UFC life became his defining one: a crushing southpaw left, savage pocket exchanges, elite durability, and late-round surges that made five-round fights feel increasingly dangerous instead of safer.",
        whyRankedHere:
          "Lawler won the welterweight title from Johny Hendricks, stopped Rory MacDonald in the fifth round of a classic defense, and then beat Carlos Condit. Victories over Matt Brown, Jake Ellenberger, and Josh Koscheck support the late-career surge that turned him into a legitimate divisional champion.",
        whyNotHigher:
          "The reign was short and included close decisions against Hendricks and Condit before Tyron Woodley ended it by first-round knockout. Lawler's earlier UFC years were uneven. His championship peak was unforgettable, but he did not sustain control long enough to join the deepest welterweight reigns.",
      },
    ),
    "Robert Whittaker": intentionalEditorialReview(
      baselineFighter("Robert Whittaker"),
      {
        oneLiner:
          "Whittaker's darting footwork, explosive boxing entries, sharp counters, and elite takedown defense made him a nightmare to pin down. At middleweight, he could fight fast without losing balance needed to punish pressure.",
        whyRankedHere:
          "Whittaker beat Yoel Romero twice, including the interim-title victory, and added wins over Jacare Souza, Jared Cannonier, Paulo Costa, Marvin Vettori, and Derek Brunson. That ranked-win depth gives him one of the strongest middleweight resumes outside the division's long-reigning champions.",
        whyNotHigher:
          "Whittaker never recorded an official successful undisputed title defense, and Israel Adesanya beat him twice during the championship chapter. Later finish losses to Dricus du Plessis and Khamzat Chimaev limited another belt run. The contender depth is outstanding, but the title record remains thinner.",
      },
    ),
    "Tony Ferguson": intentionalEditorialReview(
      baselineFighter("Tony Ferguson"),
      {
        oneLiner:
          "Ferguson's prime was controlled chaos: elbows, front chokes, unorthodox movement, endless cardio, and a willingness to turn every scramble into attack. As fights lengthened, they became stranger and more exhausting.",
        whyRankedHere:
          "Ferguson won twelve straight UFC fights in one of lightweight's deepest eras, submitting Kevin Lee for the interim title and beating Rafael dos Anjos, Anthony Pettis, Edson Barboza, Josh Thomson, and Donald Cerrone. That streak and opponent quality give his uncrowned prime real historical weight.",
        whyNotHigher:
          "Ferguson never won the undisputed lightweight title, and repeated cancellations kept the Khabib matchup from settling the era's biggest question. Justin Gaethje then stopped him brutally and ended the elite run. The later losing streak was post-prime, but the championship window closed without undisputed gold.",
      },
    ),
    "Henry Cejudo": intentionalEditorialReview(
      baselineFighter("Henry Cejudo"),
      {
        oneLiner:
          "Cejudo packed an unusual amount of achievement into a short UFC peak, pairing Olympic-level wrestling with rapidly improving striking, explosive entries, and the tactical confidence to change plans against elite champions.",
        whyRankedHere:
          "Cejudo beat Demetrious Johnson for the flyweight title, stopped T.J. Dillashaw in a defense, then moved to bantamweight and finished Marlon Moraes for a second belt before defending against Dominick Cruz. That compact run delivered championships in two divisions and victories over defining lighter-weight champions.",
        whyNotHigher:
          "The title window was brief. Cejudo stepped away after only a handful of championship fights, then returned years later and lost to Aljamain Sterling and Merab Dvalishvili. His peak achievements are exceptional, but the total UFC volume and sustained control fall short of long-reigning champions.",
      },
    ),
    "Chris Weidman": intentionalEditorialReview(
      baselineFighter("Chris Weidman"),
      {
        oneLiner:
          "Weidman's fearless middleweight rise was built on pressure wrestling, top control, submissions, and heavy boxing. He attacked Anderson Silva without reverence, then briefly looked like the complete successor to a great reign.",
        whyRankedHere:
          "Weidman opened his UFC career 9-0, knocked out Anderson Silva for the middleweight title, beat Silva again, and defended the belt against Lyoto Machida and Vitor Belfort. Those championship wins gave him a legitimate elite peak rather than a one-night upset.",
        whyNotHigher:
          "Luke Rockhold ended the reign in a punishing title fight, and Weidman then suffered a long series of knockout losses. The title run itself lasted only three defenses. His peak was excellent, but the sustained elite window and overall consistency were much shorter.",
      },
    ),
    "Petr Yan": intentionalEditorialReview(
      baselineFighter("Petr Yan"),
      {
        oneLiner:
          "Yan's best work is built on patient reads, tight boxing, body attacks, defensive wrestling, and a habit of getting stronger as rounds unfold. At his peak, few bantamweights looked more technically complete.",
        whyRankedHere:
          "Yan knocked out Jose Aldo for the vacant bantamweight title and built elite wins over Urijah Faber, Cory Sandhagen, and other top contenders around a championship-level run. Even in close defeats, his round-winning ability and technical consistency kept him among the division's best for years.",
        whyNotHigher:
          "Yan lost the belt by disqualification against Aljamain Sterling, then lost their rematch and several close decisions against elite bantamweights. The unusual context makes the official record harsher than the performances, but the limited number of title-fight victories still prevents a stronger championship case.",
      },
    ),
    "Frank Shamrock": intentionalEditorialReview(
      baselineFighter("Frank Shamrock"),
      {
        oneLiner:
          "Shamrock was an early glimpse of what a complete MMA champion could become: conditioning, submissions, striking, wrestling, and composure blended together when most opponents were still far more specialized.",
        whyRankedHere:
          "Shamrock went 5-0 in the UFC, finished every opponent, and won five championship fights during a flawless run. His victory over Tito Ortiz remains the defining performance, combining survival, conditioning, and a late finish against the fighter who became the division's next dominant champion.",
        whyNotHigher:
          "The entire UFC resume spans only five fights in a much less developed era. That perfect championship run deserves credit, but it offers far fewer elite opponents and less long-term evidence than later champions accumulated. The limitation is extraordinary brevity, not a damaging UFC loss.",
      },
    ),
    "Dricus du Plessis": intentionalEditorialReview(
      dricusDuPlessis,
      {
        oneLiner:
          "Du Plessis makes awkwardness functional. He crashes distance, wrestles in bursts, throws from strange positions, and keeps forcing hard exchanges until opponents are solving his pressure instead of imposing their own game.",
        whyRankedHere:
          "Du Plessis beat Robert Whittaker, Sean Strickland, and Israel Adesanya during his rise to middleweight gold, then continued adding championship-level victories before beating Kamaru Usman in 2026. The run combines finishing threat, a strong UFC record, and repeated elite wins in a short span.",
        whyNotHigher:
          "The elite window is still comparatively short, and Sean Strickland handed him the lone UFC defeat in a rivalry that prevents complete separation from his era. Du Plessis has beaten excellent names, but his total title-fight volume and championship years remain below long-reigning middleweights.",
      },
    ),
    "Sean Strickland": intentionalEditorialReview(
      baselineFighter("Sean Strickland"),
      {
        oneLiner:
          "Strickland turned basic-looking offense into a suffocating style: constant jabs, forward pressure, shoulder-roll defense, hand fighting, and a pace that makes opponents work every second without giving them obvious openings.",
        whyRankedHere:
          "Strickland's upset of Israel Adesanya remains one of the great UFC title performances, and his later championship-level win over Khamzat Chimaev added another elite result. Victories over Paulo Costa, Jack Hermansson, and other contenders support a middleweight resume that extends beyond one title night.",
        whyNotHigher:
          "The title reign ended without a successful defense, and Dricus du Plessis owns the stronger rivalry results at the top of the division. Alex Pereira also knocked Strickland out during his rise. His pressure wins rounds, but the finishing output and championship volume are modest.",
      },
    ),
    "Deiveson Figueiredo": intentionalEditorialReview(
      baselineFighter("Deiveson Figueiredo"),
      {
        oneLiner:
          "Figueiredo brought menace to flyweight: explosive power, dangerous guillotines, physical clinch work, and the confidence to hunt finishes in a division usually defined by speed and volume.",
        whyRankedHere:
          "Figueiredo won the UFC flyweight title twice and built three title-fight victories around wins over Joseph Benavidez, Brandon Moreno, and other top contenders. His rivalry with Moreno defined an era, while later bantamweight victories extended his relevance beyond the division where he became champion.",
        whyNotHigher:
          "The first title reign was brief, and the Moreno rivalry included a draw and two losses that prevented clear long-term control of flyweight. Figueiredo never built a long defense streak before moving divisions. The finishing peak was elite, but championship consistency was below deeper reigns.",
      },
    ),
    "Conor McGregor": intentionalEditorialReview(
      conorMcGregor,
      {
        oneLiner:
          "McGregor became the UFC's biggest superstar, pairing unmatched aura and theatrical confidence with lethal counterstriking. His timing, distance control, and straight left made him electric while pushing MMA further into the mainstream.",
        whyRankedHere:
          "McGregor produced two of the UFC's defining championship performances, knocking out Jose Aldo in 13 seconds and dismantling Eddie Alvarez to become the first simultaneous two-division champion. Wins over Chad Mendes, Max Holloway, Dustin Poirier, and Nate Diaz add depth beneath an extraordinary competitive peak.",
        whyNotHigher:
          "The elite body of work is short. McGregor never defended either UFC title and spent long stretches inactive. Losses to Khabib Nurmagomedov and Dustin Poirier limited the championship run, while Max Holloway's 2026 knockout added another major defeat after the peak had already faded.",
      },
    ),
    "Brandon Moreno": intentionalEditorialReview(
      baselineFighter("Brandon Moreno"),
      {
        oneLiner:
          "Moreno's career is defined by resilience: cut once from the UFC, he returned to become a two-time flyweight champion through sharp boxing, scrambles, submissions, and a willingness to keep rebuilding after setbacks.",
        whyRankedHere:
          "Moreno won UFC flyweight gold twice, submitted Deiveson Figueiredo in their rivalry, reclaimed the title in their fourth meeting, and added an interim championship finish over Kai Kara-France. Wins over Brandon Royval and other ranked flyweights give the two-reign story depth beyond the belt changes.",
        whyNotHigher:
          "Moreno never completed a successful undisputed title defense and lost both UFC meetings with Alexandre Pantoja. The Figueiredo rivalry also produced a loss and a draw, leaving more volatility than dominant champions. He repeatedly returned to the top, but never held it for long.",
      },
    ),
    "Vitor Belfort": intentionalEditorialReview(
      baselineFighter("Vitor Belfort"),
      {
        oneLiner:
          "Belfort's UFC identity was explosive violence across multiple eras. Lightning hand speed, southpaw power, and sudden kicks made him dangerous for nearly two decades as his career swung between contention and setbacks.",
        whyRankedHere:
          "Belfort collected elite UFC wins over Randy Couture, Rich Franklin, Michael Bisping, Luke Rockhold, Dan Henderson, Wanderlei Silva, and Anthony Johnson. His 2013 run of head-kick finishes was one of the most violent contender streaks ever, and his longevity gives the resume unusual breadth.",
        whyNotHigher:
          "His championship record is thin: the lone undisputed UFC title win came through an early cut stoppage over Couture, and Belfort never defended the belt. He also lost multiple championship opportunities and served a suspension after a failed drug test, leaving an uneven elite career.",
      },
    ),
    "Lyoto Machida": intentionalEditorialReview(
      baselineFighter("Lyoto Machida"),
      {
        oneLiner:
          "Machida made distance feel wrong to opponents, using karate footwork, sudden counters, straight punches, and kicks to create long stretches where chasing him became the trap.",
        whyRankedHere:
          "Machida knocked out Rashad Evans to win the light heavyweight title, beat Thiago Silva and Tito Ortiz during an unbeaten rise, and later stopped Randy Couture and Ryan Bader. His elusive style produced a brief but genuine championship peak.",
        whyNotHigher:
          "The title reign lasted one controversial defense before Mauricio Rua knocked him out in the rematch. Quinton Jackson, Jon Jones, Phil Davis, and Chris Weidman also beat him in meaningful elite fights, leaving a brilliant but inconsistent championship resume.",
      },
    ),
    "Rashad Evans": intentionalEditorialReview(
      baselineFighter("Rashad Evans"),
      {
        oneLiner:
          "Evans blended explosive wrestling with quick boxing and real knockout power, growing from cautious prospect into a fast, dangerous light-heavyweight champion.",
        whyRankedHere:
          "Evans knocked out Chuck Liddell, stopped Forrest Griffin for the title, and beat Quinton Jackson, Michael Bisping, Phil Davis, Thiago Silva, and Dan Henderson. That win list gives his brief championship run serious depth.",
        whyNotHigher:
          "The reign ended immediately when Lyoto Machida stopped him, and Jon Jones later dominated their title fight. The Antonio Rogerio Nogueira upset added another costly prime loss, leaving strong contender depth without a sustained championship stretch.",
      },
    ),
    "Tom Aspinall": intentionalEditorialReview(
      baselineFighter("Tom Aspinall"),
      {
        oneLiner:
          "Aspinall brings heavyweight size at an almost middleweight tempo, combining fast boxing, reactive takedowns, submissions, and a composure that makes early finishes look unusually effortless.",
        whyRankedHere:
          "Aspinall finished Sergei Pavlovich, Curtis Blaydes, Alexander Volkov, and other ranked heavyweights while collecting two interim-title victories. Eight UFC wins and eight finishes give his short run exceptional efficiency at the top of the division.",
        whyNotHigher:
          "The championship sample remains small, with no completed undisputed title defense and fewer elite wins than established heavyweight greats. His only official UFC loss came from a freak knee injury, so the limitation is volume rather than meaningful competitive defeat.",
      },
    ),
    "Dominick Cruz": intentionalEditorialReview(
      baselineFighter("Dominick Cruz"),
      {
        oneLiner:
          "Cruz turned movement into an entire fighting language: constant angles, stance changes, feints, awkward entries, and takedowns that made opponents chase a target that rarely stayed where expected.",
        whyRankedHere:
          "Cruz beat Demetrious Johnson in the UFC, then returned from years of injuries to defeat T.J. Dillashaw for the bantamweight title. That comeback and his distinctive championship skill give his UFC resume real historical weight.",
        whyNotHigher:
          "Injuries erased huge portions of Cruz's prime, leaving far less UFC activity than his talent deserved. Cody Garbrandt then clearly beat him in a title fight. His great WEC reign is broader career context, not additional UFC championship evidence.",
      },
    ),
    "Royce Gracie": intentionalEditorialReview(
      baselineFighter("Royce Gracie"),
      {
        oneLiner:
          "Gracie changed what fighters thought fighting was. His patient clinching, guard work, and submissions turned early UFC tournaments into a showcase for Brazilian jiu-jitsu.",
        whyRankedHere:
          "Gracie won three early UFC tournaments, opened his run 11-0-1, and finished every victory. Within the format that existed, his submission dominance was overwhelming and established the promotion's first foundational competitive legend.",
        whyNotHigher:
          "Those tournaments came before modern weight classes, titles, and a developed opponent pool. The UFC sample is concentrated in a brief pioneer era, so its historical importance is enormous while its competitive depth is hard to compare with later champions.",
      },
    ),
    "Khamzat Chimaev": intentionalEditorialReview(
      baselineFighter("Khamzat Chimaev"),
      {
        oneLiner:
          "Chimaev fights like control should happen immediately, crashing into takedowns, chaining rides and submissions, and using physical pressure to make elite opponents spend entire rounds underneath him.",
        whyRankedHere:
          "Chimaev beat Dricus du Plessis for UFC gold after victories over Robert Whittaker, Gilbert Burns, and Kamaru Usman. A nine-fight UFC winning streak and four Top-5 victories give the short championship rise legitimate elite depth.",
        whyNotHigher:
          "The title reign ended without a successful defense when Sean Strickland beat him, and the total championship window remains short. Chimaev's peak is already elite, but it lacks the title-fight volume and longevity of the established champions above.",
      },
    ),
    "Michael Bisping": intentionalEditorialReview(
      baselineFighter("Michael Bisping"),
      {
        oneLiner:
          "Bisping built his career on pace, toughness, volume boxing, and refusal to disappear, eventually turning years of contender work into one of the UFC's great late-career title upsets.",
        whyRankedHere:
          "Bisping knocked out Luke Rockhold on short notice for the middleweight title, defended against Dan Henderson, and also beat Anderson Silva. His long UFC tenure and deep collection of contender wins give the championship moment real support.",
        whyNotHigher:
          "The reign was short, and Georges St-Pierre submitted Bisping to take the belt. He also lost repeatedly to elite middleweights before becoming champion, including Dan Henderson, Vitor Belfort, Chael Sonnen, and Luke Rockhold, limiting the consistency of the peak.",
      },
    ),
    "Anthony Pettis": intentionalEditorialReview(
      baselineFighter("Anthony Pettis"),
      {
        oneLiner:
          "Pettis made creativity practical: dynamic kicks, opportunistic submissions, and fearless transitions gave him a Showtime identity that could produce elite finishes from positions most fighters used to reset.",
        whyRankedHere:
          "Pettis submitted Benson Henderson for the lightweight title and Gilbert Melendez in his first defense, adding wins over Donald Cerrone, Charles Oliveira, and Stephen Thompson across multiple divisions. That championship burst remains one of his era's most memorable.",
        whyNotHigher:
          "Rafael dos Anjos decisively ended the title reign after one defense, and Pettis became inconsistent against elite competition afterward. A heavy collection of prime losses kept the spectacular finishing moments from turning into sustained championship control.",
      },
    ),
    "Sean O'Malley": intentionalEditorialReview(
      baselineFighter("Sean O'Malley"),
      {
        oneLiner:
          "O'Malley's appeal starts with precision: long-range feints, clean counters, unusual timing, and real knockout power wrapped in the confidence and showmanship of a natural UFC star.",
        whyRankedHere:
          "O'Malley knocked out Aljamain Sterling for the bantamweight title, defended against Marlon Vera, and added a close elite win over Petr Yan. Later victories kept him relevant after losing the belt, giving the championship peak useful depth.",
        whyNotHigher:
          "Merab Dvalishvili beat O'Malley twice and clearly separated himself in their rivalry, while the title reign lasted only one defense. The elite-win list remains shorter than the deeper bantamweight champions despite O'Malley's striking peak and star power.",
      },
    ),
    "Quinton Jackson": intentionalEditorialReview(
      baselineFighter("Quinton Jackson"),
      {
        oneLiner:
          "Rampage brought slams, boxing power, physical strength, and unmistakable charisma to the UFC, becoming one of light heavyweight's defining stars during the division's late-2000s boom.",
        whyRankedHere:
          "Jackson knocked out Chuck Liddell for the title and beat Dan Henderson in a unification defense, then added UFC wins over Wanderlei Silva, Keith Jardine, and Lyoto Machida. The championship peak carried real elite value.",
        whyNotHigher:
          "Forrest Griffin ended the reign after one defense, and Rashad Evans and Jon Jones later beat Jackson in major fights. His UFC run remained dangerous but never returned to sustained championship control after that brief peak.",
      },
    ),
    "Mauricio \"Shogun\" Rua": intentionalEditorialReview(
      baselineFighter("Mauricio \"Shogun\" Rua"),
      {
        oneLiner:
          "Shogun's UFC peak was violent and direct: pressure, chopping kicks, knees, and swarming combinations that could overwhelm even elite light heavyweights once he found his rhythm.",
        whyRankedHere:
          "Rua stopped Chuck Liddell, pushed Lyoto Machida to a disputed title decision, then knocked Machida out in the rematch to become UFC champion. He later avenged his loss to Forrest Griffin.",
        whyNotHigher:
          "The UFC record was highly inconsistent. Jon Jones immediately ended the title reign, and Rua accumulated numerous losses afterward. His celebrated PRIDE career does not add UFC ranking credit, leaving one excellent championship peak without comparable UFC longevity.",
      },
    ),
    "Forrest Griffin": intentionalEditorialReview(
      baselineFighter("Forrest Griffin"),
      {
        oneLiner:
          "Griffin turned grit, pace, and awkward volume into a championship career, thriving in ugly fights where toughness and persistence mattered more than clean athletic advantages.",
        whyRankedHere:
          "Griffin submitted Mauricio Rua in a major upset, then beat Quinton Jackson to win the light heavyweight title. Those back-to-back victories gave his peak genuine championship quality rather than mere popularity.",
        whyNotHigher:
          "Rashad Evans stopped Griffin in his first defense, and Anderson Silva and Rua also finished him during important stretches. The title run was brief, with too few elite UFC victories around it to build a deeper historical case.",
      },
    ),
    "Brock Lesnar": intentionalEditorialReview(
      baselineFighter("Brock Lesnar"),
      {
        oneLiner:
          "Lesnar was a heavyweight spectacle with legitimate force: enormous size, explosive wrestling, top pressure, and the confidence to turn a tiny MMA sample into a real title reign.",
        whyRankedHere:
          "Lesnar beat Randy Couture for the heavyweight title, dominated Frank Mir in their rematch, and survived Shane Carwin to defend the belt. Those championship wins gave his short UFC career meaningful elite value.",
        whyNotHigher:
          "The elite sample is tiny. Cain Velasquez ended the reign decisively, Alistair Overeem stopped him next, and the later Mark Hunt result was overturned after a failed drug test. There simply was not enough sustained UFC work.",
      },
    ),
    "Dan Henderson": intentionalEditorialReview(
      baselineFighter("Dan Henderson"),
      {
        oneLiner:
          "Henderson's UFC identity centered on the right hand everyone knew was coming, backed by elite wrestling, toughness, and the willingness to fight dangerous opponents across weight classes.",
        whyRankedHere:
          "His UFC wins include Mauricio Rua, Michael Bisping, Rich Franklin, Hector Lombard, and an early tournament victory at UFC 17. Those results preserve a meaningful UFC resume even without championship gold.",
        whyNotHigher:
          "Henderson never won an undisputed UFC title and finished his UFC career with more losses than wins. Much of his legendary broader resume happened in PRIDE and Strikeforce, which does not strengthen the UFC ranking case.",
      },
    ),
    "Chael Sonnen": intentionalEditorialReview(
      baselineFighter("Chael Sonnen"),
      {
        oneLiner:
          "Sonnen made pressure wrestling and nonstop talk equally central to his UFC identity, turning relentless takedowns and the Anderson Silva rivalry into one of middleweight's defining contender stories.",
        whyRankedHere:
          "Sonnen beat Yushin Okami, Nate Marquardt, Brian Stann, and Michael Bisping during a strong middleweight run, earning two shots at Anderson Silva before later challenging Jon Jones at light heavyweight.",
        whyNotHigher:
          "He never won a UFC title and lost all three UFC championship fights. The first Silva fight became legendary because Sonnen dominated most of it, but it still ended in submission defeat, leaving his biggest UFC moments short of gold.",
      },
    ),
    "Paddy Pimblett": intentionalEditorialReview(
      baselineFighter("Paddy Pimblett"),
      {
        oneLiner:
          "Pimblett combines crowd-magnet charisma with aggressive submissions, opportunistic scrambles, and a willingness to trade, making his UFC rise feel chaotic even when he keeps finding ways to win.",
        whyRankedHere:
          "Eight UFC victories and six finishes include wins over King Green, Michael Chandler, and Benoit Saint Denis, giving Pimblett meaningful ranked depth after an unbeaten start against lower-level opposition in the promotion.",
        whyNotHigher:
          "He has not won a UFC championship fight, owns limited Top-5 depth, and Justin Gaethje beat him in an interim-title bout. The elite window is still short compared with established champions and long-term contenders.",
      },
    ),
    "Amanda Nunes": intentionalEditorialReview(
      baselineFighter("Amanda Nunes"),
      {
        oneLiner:
          "Nunes became the standard for complete women's MMA: crushing power, patient boxing, strong wrestling, submission skill, and the composure to punish mistakes instantly. At her peak, champions from two divisions looked like they had nowhere safe to fight.",
        whyRankedHere:
          "Nunes built the strongest UFC resume in women's MMA, winning championships at bantamweight and featherweight and beating nearly every defining champion of her era. She stopped Ronda Rousey, Cris Cyborg, Holly Holm, and Miesha Tate, beat Valentina Shevchenko twice, and later reclaimed the bantamweight title from Julianna Pena after a shocking upset.",
        whyNotHigher:
          "The Julianna Pena loss is the clearest blemish because it abruptly ended a dominant reign, even though Nunes avenged it decisively. She also lost several UFC fights before reaching her championship peak, and the second Shevchenko decision was extremely close. Those imperfections keep the case from being flawless, but none seriously undermine her championship separation.",
      },
    ),
    "Valentina Shevchenko": intentionalEditorialReview(
      baselineFighter("Valentina Shevchenko"),
      {
        oneLiner:
          "Shevchenko made control look effortless. Her counterstriking, kicks, clinch trips, top control, and tactical patience let her win long championship fights without giving opponents many openings, establishing the technical standard for UFC flyweight for years.",
        whyRankedHere:
          "Shevchenko built a long flyweight reign with repeated defenses over Jessica Eye, Katlyn Chookagian, Jennifer Maia, Lauren Murphy, Taila Santos, and other contenders, then regained the title after the Alexa Grasso series. Her bantamweight wins and two competitive fights with Amanda Nunes add elite context to one of women's MMA's deepest UFC championship runs.",
        whyNotHigher:
          "Amanda Nunes owns the direct rivalry, beating Shevchenko twice, and also built the stronger two-division championship resume. Alexa Grasso then submitted Shevchenko and fought her to a draw before Shevchenko eventually reclaimed the belt. The flyweight reign is exceptional, but those head-to-head and cross-division differences keep her from the top spot.",
      },
    ),
    "Zhang Weili": intentionalEditorialReview(
      baselineFighter("Zhang Weili"),
      {
        oneLiner:
          "Zhang blends pressure, explosive combinations, physical strength, wrestling, and punishing top control into one of strawweight's most complete packages. Her second title reign showed a calmer champion who could dominate without depending on constant chaos.",
        whyRankedHere:
          "Zhang won the UFC strawweight title twice and built six title-fight victories, including wins over Joanna Jedrzejczyk, Jessica Andrade, Carla Esparza, Amanda Lemos, and Tatiana Suarez. Four successful defenses across her championship years give her sustained title volume, while the Joanna fights supplied both elite opposition and an all-time classic.",
        whyNotHigher:
          "Rose Namajunas beat Zhang twice during the heart of her championship years, first by knockout and then by decision, creating the clearest head-to-head limitation. Zhang also failed to turn her later challenge against Valentina Shevchenko into a second-division title. Her strawweight resume is elite, but those losses prevent complete separation from the division's other great champions.",
      },
    ),
    "Joanna Jedrzejczyk": intentionalEditorialReview(
      baselineFighter("Joanna Jedrzejczyk"),
      {
        oneLiner:
          "Joanna set the early strawweight standard with relentless volume, elite takedown defense, footwork, and combinations that became more punishing as opponents struggled to match her pace. Her confidence and technical sharpness made five-round fights feel increasingly one-sided.",
        whyRankedHere:
          "Joanna won the strawweight title from Carla Esparza and defended it five times, beating Jessica Penne, Valerie Letourneau, Claudia Gadelha, Karolina Kowalkiewicz, and Jessica Andrade during a dominant reign. Her striking volume and consistent round control established the division's first long championship standard and gave women's MMA one of its deepest early title runs.",
        whyNotHigher:
          "Rose Namajunas ended the reign by first-round knockout and beat Joanna again in the immediate rematch, clearly closing that championship chapter. Joanna later lost both fights with Zhang Weili, including another title opportunity. The five-defense reign remains historic, but she never regained gold and finished behind direct rivals who added stronger later championship results.",
      },
    ),
    "Rose Namajunas": intentionalEditorialReview(
      baselineFighter("Rose Namajunas"),
      {
        oneLiner:
          "Namajunas at her best mixed sharp footwork, clean boxing, head kicks, submissions, and exceptional big-fight composure. She could look brilliant against elite champions, then unexpectedly flat, making volatility almost as central to her story as the giant-killing wins.",
        whyRankedHere:
          "Namajunas won the strawweight title twice and collected four title-fight victories, beating Joanna Jedrzejczyk twice and Zhang Weili twice across two separate championship runs. She also avenged a loss to Jessica Andrade. Few women's fighters own a better collection of direct wins over other divisional greats, giving her peak remarkable opponent quality.",
        whyNotHigher:
          "The championship runs were both short, and Carla Esparza ended the second in a notoriously low-output decision after Andrade had already finished the first reign. Namajunas never built a long defense streak, so the resume swings between extraordinary individual victories and stretches without sustained control. That volatility keeps her below champions who owned their divisions for years.",
      },
    ),
    "Ronda Rousey": intentionalEditorialReview(
      baselineFighter("Ronda Rousey"),
      {
        oneLiner:
          "Rousey made the armbar feel inevitable. Judo entries, clinch throws, furious transitions, and overwhelming confidence produced lightning-fast finishes while her star power helped turn women's UFC fighting from an experiment into a centerpiece.",
        whyRankedHere:
          "Rousey became the UFC's first women's champion and defended the bantamweight belt six times, finishing every challenger during the reign. Wins over Miesha Tate, Cat Zingano, Sara McMann, and Bethe Correia built championship volume, while the speed of the finishes created one of the sport's most intimidating early title runs.",
        whyNotHigher:
          "Holly Holm exposed major striking limitations and ended the reign with a decisive knockout, then Amanda Nunes overwhelmed Rousey in 48 seconds in her only comeback. The championship peak was historically important and dominant, but the elite UFC career was short and ended without a successful answer once the division caught up.",
      },
    ),
    "Jessica Andrade": intentionalEditorialReview(
      baselineFighter("Jessica Andrade"),
      {
        oneLiner:
          "Andrade fought like a wrecking ball across three divisions: compact power, huge slams, body attacks, takedowns, and relentless physical pressure made her dangerous even when giving away height and reach.",
        whyRankedHere:
          "Andrade knocked out Rose Namajunas to win the strawweight title and built an unusually deep UFC win total around victories over Claudia Gadelha, Tecia Torres, Katlyn Chookagian, Amanda Lemos, and other contenders. Her ability to remain relevant at strawweight, flyweight, and bantamweight gives the resume rare breadth.",
        whyNotHigher:
          "The title reign ended immediately when Zhang Weili stopped her, and Andrade never successfully defended UFC gold. She also accumulated several losses in later elite fights, including decisive defeats against Valentina Shevchenko and other top contenders. The longevity and cross-division wins are impressive, but the championship peak was too brief.",
      },
    ),
    "Mackenzie Dern": intentionalEditorialReview(
      mackenzieDern,
      {
        oneLiner:
          "Dern's identity starts with world-class jiu-jitsu and the constant threat that one scramble can end the fight. Aggressive transitions, back takes, and opportunistic submissions remain her signature, while improved striking and composure helped carry her to UFC gold.",
        whyRankedHere:
          "Dern has built a 12-5 UFC record with eight ranked wins, then converted that long contender run into championship success. She won the vacant strawweight title over Virna Jandiroba and successfully defended it against Gillian Robertson, giving her two title-fight wins and an active reign.",
        whyNotHigher:
          "Her championship case is still young: the belt came through a vacant-title fight and she has only one successful defense. Earlier losses to Marina Rodriguez, Yan Xiaonan, Jessica Andrade, and Amanda Lemos also showed real inconsistency against upper-level contenders before her title run.",
      },
    ),
    "Cris Cyborg": intentionalEditorialReview(
      baselineFighter("Cris Cyborg"),
      {
        oneLiner:
          "Cyborg's UFC run was brief but terrifying: relentless pressure, physical strength, heavy combinations, and finishing intent made every featherweight fight feel like a survival test from the opening exchange onward.",
        whyRankedHere:
          "Cyborg won the UFC featherweight title, defended it against Holly Holm over five rounds, and stopped Yana Kunitskaya in another defense. She went 5-1 in the promotion with four finishes and overwhelming round control, giving the short sample clear championship authority before her UFC run ended.",
        whyNotHigher:
          "Amanda Nunes knocked Cyborg out in 51 seconds and decisively ended the reign. The UFC resume contains only six fights, so much of Cyborg's broader legend was built outside the promotion and does not add ranking credit here. The peak was elite, but the available UFC championship volume is limited.",
      },
    ),
    "Carla Esparza": intentionalEditorialReview(
      baselineFighter("Carla Esparza"),
      {
        oneLiner:
          "Esparza kept making wrestling matter in a division that evolved around her, using timing, chain takedowns, and top control to become the UFC's first strawweight champion and later climb all the way back.",
        whyRankedHere:
          "Esparza won the UFC strawweight title twice, first in the division's inaugural championship fight and later by beating Rose Namajunas again. Her second climb included wins over Yan Xiaonan, Marina Rodriguez, Michelle Waterson, and Alexa Grasso, giving the comeback real contender depth across a changing division.",
        whyNotHigher:
          "She never successfully defended either title. Joanna Jedrzejczyk dominated her to end the first reign, and Zhang Weili submitted her immediately after the second championship win. Esparza's ability to regain gold years later is remarkable, but neither reign produced sustained divisional control.",
      },
    ),
    "Alexa Grasso": intentionalEditorialReview(
      baselineFighter("Alexa Grasso"),
      {
        oneLiner:
          "Grasso's clean boxing, movement, and opportunistic grappling peaked at exactly the right moment, turning a steady flyweight climb into the submission that finally broke Valentina Shevchenko's long championship reign in stunning fashion.",
        whyRankedHere:
          "Grasso submitted Valentina Shevchenko to win the flyweight title and retained the belt through a draw in their rematch, adding championship value to earlier wins over Maycee Barber, Viviane Araujo, and Joanne Wood. Beating such a dominant champion gives her peak unusual historical weight in the division.",
        whyNotHigher:
          "The reign was short and never included a clean successful-defense victory. Shevchenko eventually reclaimed the title, while other losses kept Grasso from building the long elite run of the champions above. The defining win is enormous, but the surrounding championship volume remains limited.",
      },
    ),
    "Kayla Harrison": intentionalEditorialReview(
      baselineFighter("Kayla Harrison"),
      {
        oneLiner:
          "Harrison's UFC identity is physical control: relentless takedowns, crushing top position, submission pressure, and the confidence to force elite bantamweights into grappling exchanges they know are coming but still struggle to stop.",
        whyRankedHere:
          "Harrison's first three UFC appearances produced wins over Holly Holm, Ketlen Vieira, and Julianna Pena, with the Pena victory delivering the bantamweight title. Reaching championship success that quickly against a former champion, a ranked contender, and the reigning champion gives the short UFC run exceptional quality.",
        whyNotHigher:
          "The limitation is straightforward: only three UFC fights, one title-fight win, and no successful defense. The champions above Harrison accumulated years of elite results and far more title volume. Her broader career cannot substitute for UFC accomplishments when evaluating this resume.",
      },
    ),
    "Julianna Pe\u00f1a": intentionalEditorialReview(
      baselineFighter("Julianna Pe\u00f1a"),
      {
        oneLiner:
          "Pena's defining trait is stubborn pressure. She turned clinch work, scrambles, volume, and total belief into one of the biggest championship upsets in UFC history when almost nobody expected her to survive Amanda Nunes.",
        whyRankedHere:
          "Pena submitted Amanda Nunes to win the bantamweight title, then later beat Raquel Pennington to become champion again. Two separate title victories, especially the Nunes upset, give her UFC resume genuine historical weight and distinguish it from contenders whose elite peaks never produced championship gold.",
        whyNotHigher:
          "She never successfully defended either title, Nunes dominated the immediate rematch, and losses to Valentina Shevchenko, Germaine de Randamie, and Kayla Harrison exposed clear limits against elite opposition. The two championship wins are significant, but the surrounding record lacks sustained divisional control.",
      },
    ),
    "Miesha Tate": intentionalEditorialReview(
      baselineFighter("Miesha Tate"),
      {
        oneLiner:
          "Tate's UFC story is persistence: pressure wrestling, toughness, scrambling, and a refusal to quit finally produced a dramatic fifth-round comeback over Holly Holm after years of chasing championship gold and surviving setbacks.",
        whyRankedHere:
          "Tate submitted Holly Holm to win the bantamweight title and added contender wins over Liz Carmouche, Sara McMann, and Jessica Eye during the climb. The championship moment was brief, but it capped a credible UFC contender run built through multiple ranked victories rather than appearing from nowhere.",
        whyNotHigher:
          "Amanda Nunes stopped Tate in her first attempted defense, leaving her with one title-fight win and no successful defenses. Earlier losses to Cat Zingano and Ronda Rousey also limited the elite peak, while later returns never produced another championship run.",
      },
    ),
    "Holly Holm": intentionalEditorialReview(
      baselineFighter("Holly Holm"),
      {
        oneLiner:
          "Holm will always be the fighter who shattered Ronda Rousey's aura, using disciplined movement, straight punches, and the perfect head kick to produce one of the UFC's most famous upsets.",
        whyRankedHere:
          "Holm's knockout of Ronda Rousey won the bantamweight title and remains one of women's MMA's defining UFC moments. She stayed relevant for years afterward, adding wins over Raquel Pennington, Bethe Correia, Megan Anderson, and Irene Aldana while repeatedly earning elite and championship opportunities across two divisions.",
        whyNotHigher:
          "Miesha Tate took the belt in Holm's first defense, and Holm then lost several later championship opportunities across bantamweight and featherweight. The Rousey win is immortal, but one title victory without a defense or sustained elite winning streak limits the overall UFC case.",
      },
    ),
  },
  eraMembership: {
    "Rafael dos Anjos": {
      primary: "golden-age",
      secondary: "superstar",
    },
  },
  modelAsOfDate: "2026-08-16",
  factsVersion: "octagon-hq-v2-rankings-refresh-facts-20260816",
  judgmentVersion: "octagon-hq-v2-glover-teixeira-profile-20260817",
  eraDepthVersion: "octagon-hq-v2-rda-20260730",
  eraDepthResolutionVersion: "octagon-hq-v2-rda-20260730",
};
