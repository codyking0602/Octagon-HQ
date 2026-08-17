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
    intentionalEditorialReview(rafaelDosAnjos, {
      oneLiner:
        "A dominant UFC lightweight champion whose elite wins, welterweight contender run, and extraordinary longevity create one of the deepest UFC resumes outside the highest title-reign tier. The lasting image is lightweight champion with two-division longevity.",
      whyRankedHere:
        "Dos Anjos ranks here because he combined an undisputed lightweight title and defense with elite wins over Anthony Pettis, Benson Henderson, Donald Cerrone, Nate Diaz, Robbie Lawler, and Kevin Lee. His ability to remain relevant across lightweight and welterweight for more than a decade adds major UFC depth.",
      whyNotHigher:
        "He does not rank higher because the championship reign lasted only one defense, the Alvarez and Ferguson losses ended his lightweight peak quickly, and the later welterweight run produced strong contender wins without a second title.",
    }),
  ],
  replacements: {
    "Jon Jones": intentionalEditorialReview(jonJones, {
      oneLiner:
        "Jones is the UFC's ultimate problem-solver: freakishly long, creative, ruthless in the clinch, elite in wrestling, and brilliant at adapting mid-fight. His dominance, longevity, aura, and controversies are inseparable from a career that has defined multiple eras.",
      whyRankedHere:
        "Jones built the deepest championship resume in UFC history. He became the youngest champion, won 16 title fights, collected 12 Top-5 victories, and beat generations of elite opposition including Mauricio Rua, Lyoto Machida, Daniel Cormier, and Alexander Gustafsson. Heavyweight title wins over Ciryl Gane and Stipe Miocic extended that dominance into a second division.",
      whyNotHigher:
        "The resume carries real blemishes despite the competitive dominance. Drug-testing failures, suspensions, stripped titles, and the overturned Daniel Cormier result interrupted his reign and complicate the legacy. Close decisions against Alexander Gustafsson, Thiago Santos, and Dominick Reyes also created legitimate debate around portions of an otherwise extraordinary championship run.",
    }),
    "Georges St-Pierre": intentionalEditorialReview(georgesStPierre, {
      oneLiner:
        "St-Pierre controlled fights with a sharp jab, explosive takedowns, suffocating top pressure, and elite defensive awareness. His prime stood out for adaptability, pace, and the ability to dictate where exchanges happened while banking rounds with remarkable consistency.",
      whyRankedHere:
        "St-Pierre built one of the UFC's deepest championship resumes at welterweight, beating Matt Hughes, BJ Penn, Jon Fitch, Carlos Condit, and elite contenders across multiple generations. He avenged both UFC losses, then returned after four years away to win the middleweight title, adding two-division success to sustained divisional dominance. Its signature is complete all-time resume.",
      whyNotHigher:
        "The Serra upset is the clearest blemish on St-Pierre's prime, while Jones built a larger body of championship work and remained at the top for longer. St-Pierre's resume is cleaner than almost anyone else's, but against the strongest case above him, the difference is sustained title-level volume rather than quality of opposition.",
    }),
    "Anderson Silva": intentionalEditorialReview(
      baselineFighter("Anderson Silva"),
      {
        oneLiner:
          "The peak-aura case: historic middleweight title control, terrifying finishing dominance, and one of the most iconic prime runs in UFC history. The lasting image is peak aura standard. That distinction remains important across UFC history.",
        whyRankedHere:
          "Silva belongs here because his peak remains one of the most dominant and iconic runs in UFC history. He paired a historic middleweight title reign with rare finishing threat, long-term aura, and a level of separation that still defines elite prime dominance. Its signature is peak aura standard. That matters.",
        whyNotHigher:
          "Silva does not pass the top three because the historical comparison gives Jones, St-Pierre, and Johnson stronger overall combinations of championship volume, opponent-quality wins, clean prime record, and loss context. The Weidman losses matter, and the middleweight divisional context keeps his elite-win depth below the very top tier.",
      },
    ),
    "Demetrious Johnson": intentionalEditorialReview(
      baselineFighter("Demetrious Johnson"),
      {
        oneLiner:
          "The defining UFC flyweight champion: historic title control, elite technical dominance, and one of the cleanest prime skill sets in the sport. The lasting image is flyweight standard. That distinction remains important across UFC history.",
        whyRankedHere:
          "Johnson belongs here because he built the UFC flyweight standard: a long title reign, elite technical control, strong prime dominance, and one of the best championship resumes in the UFC's history. His case is especially strong in title success and prime skill separation. Its signature is flyweight standard. That matters.",
        whyNotHigher:
          "Johnson trails Jones and St-Pierre because his elite-win depth and flyweight division-strength context are lower in the historical comparison. His later non-UFC success adds historical context, but the UFC's history is based on the UFC resume. The career remains flyweight standard. That historical context matters.",
      },
    ),
    "Islam Makhachev": intentionalEditorialReview(islamMakhachevAugustRefresh, {
      oneLiner:
        "Islam's peak combines suffocating control with rare finishing efficiency. He dictates where fights happen through pressure, wrestling, and top control, then forces mistakes with submissions or dangerous striking. He can dominate rounds without giving up the threat of a finish.",
      whyRankedHere:
        "Islam has a 17-1 UFC record, six title-fight wins, and a 10-0 prime run. He submitted Charles Oliveira for the lightweight belt, defended it four times, including twice against Alexander Volkanovski, then beat Jack Della Maddalena over five rounds to become welterweight champion. That championship volume and elite-win quality separate him from the tier below.",
      whyNotHigher:
        "The strongest case against moving Islam higher is career length, not peak quality. His elite run is still shorter than the sustained championship eras of the UFC greats above him. The Adriano Martins knockout is a UFC loss, even if it came well before his prime. He is still active at an elite level, so that longevity deficit can shrink.",
    }),
    "Alexander Volkanovski": intentionalEditorialReview(
      baselineFighter("Alexander Volkanovski"),
      {
        oneLiner:
          "The complete featherweight champion case: title consistency, strong quality wins, and one of the deepest modern resumes in the sport. The lasting image is all-around featherweight case. That context matters.",
        whyRankedHere:
          "Volkanovski belongs here because he checks every important box well: championship success, quality wins, consistency, and a long elite stretch at featherweight. He may not have the single highest competitive peak, but his overall balance is extremely strong. Its signature is all-around featherweight case. Historically.",
        whyNotHigher:
          "The historical comparison hits him for the Topuria loss and keeps his prime-dominance record below the names with more overwhelming peaks. The up-division Islam losses are handled more lightly, but they still do not boost the resume the way a win would have.",
      },
    ),
    "Khabib Nurmagomedov": intentionalEditorialReview(
      baselineFighter("Khabib Nurmagomedov"),
      {
        oneLiner:
          "The cleanest prime run at lightweight: unbeaten in the UFC, overwhelming round control, and the strongest dominance case in the UFC's history. The lasting image is prime dominance case. Historically.",
        whyRankedHere:
          "Khabib belongs here because his prime-dominance record is the strongest in the historical comparison. He combined elite control, round winning, and a perfect UFC record, giving him one of the hardest peaks to challenge in the UFC's history. Its signature is prime dominance case. Historically.",
        whyNotHigher:
          "He does not climb higher because the historical comparison gives him less championship volume and fewer quality-wins layers than the fighters above him. His peak is elite enough to compete with anyone, but his total UFC resume is shorter. The career remains prime dominance case.",
      },
    ),
    "Matt Hughes": intentionalEditorialReview(baselineFighter("Matt Hughes"), {
      oneLiner:
        "The early welterweight title-control case: real championship volume, physical dominance, and one of the defining reigns before the GSP era. The lasting image is early welterweight standard. That context matters.",
      whyRankedHere:
        "Hughes belongs here because his UFC welterweight title volume is still meaningful. He spent years as the division standard, stacked title wins, and has enough important victories to remain a serious UFC GOAT case. Its signature is early welterweight standard. That distinction remains historically important.",
      whyNotHigher:
        "He does not rank higher because era strength, loss volume, and later separation by GSP cap the case. His championship weight is real, but the modern top-tier resumes are cleaner and deeper. The career remains early welterweight standard. That matters.",
    }),
    "Kamaru Usman": intentionalEditorialReview(kamaruUsman, {
      oneLiner:
        "The post-GSP welterweight champion case: dominant title control, elite round winning, and a focused but powerful championship peak. The lasting image is modern welterweight title authority. That historical context matters.",
      whyRankedHere:
        "Usman belongs here because his welterweight title run had real champion authority. He paired elite round control with strong defenses and quality wins over the best contenders of his era. Its signature is modern welterweight title authority. The distinction remains important across the full span of UFC history.",
      whyNotHigher:
        "He does not rank higher because his elite window is more compact than the long-volume cases, and the Edwards losses damaged the clean ending. His peak was elite, but the total UFC resume is not as broad as the names above him.",
    }),
    "Max Holloway": intentionalEditorialReview(
      baselineFighter("Max Holloway"),
      {
        oneLiner:
          "The volume case: relentless pace, elite quality wins, and one of the longest useful elite windows in the featherweight era. The lasting image is volume and quality wins. That matters.",
        whyRankedHere:
          "Holloway belongs here because his elite-win depth and longevity are both elite. Few fighters in the UFC's history have stacked as many meaningful UFC wins over as long a stretch. Its signature is volume and quality wins. This distinction remains important across the UFC's history.",
        whyNotHigher:
          "He sits below the very top names because the historical comparison gives him less championship control and more resume drag from total losses. The volume is impressive, but the belt dominance is not on the level of the names above him.",
      },
    ),
    "Stipe Miocic": intentionalEditorialReview(stipeMiocic, {
      oneLiner:
        "The strongest UFC heavyweight resume case: title defenses, champion wins, Ngannou value, and trilogy separation over Cormier. The lasting image is UFC heavyweight standard. That distinction remains important across UFC history.",
      whyRankedHere:
        "Stipe built the greatest heavyweight resume in UFC history through sustained championship success rather than one dominant run. He owns the division's record for consecutive title defenses, reclaimed the belt after defeat, defeated Daniel Cormier twice in their trilogy, and consistently beat championship-caliber heavyweights across multiple eras.",
      whyNotHigher:
        "Heavyweight has never offered the week-to-week depth or sustained elite competition of divisions like welterweight or lightweight, limiting how high even its greatest champion can climb. Stipe also lacks the extended championship dominance of the fighters above him, and his prime includes decisive losses to Daniel Cormier and Francis Ngannou before the late-career Jon Jones.",
    }),
    "Jose Aldo": intentionalEditorialReview(joseAldo, {
      oneLiner:
        "At his best, Aldo combined explosive speed, brutal leg kicks, elite takedown defense, and calm counterstriking. He won nearly seven of every ten record rounds during his prime, controlling championship fights without needing to chase finishes.",
      whyRankedHere:
        "Eight UFC title-fight wins, two victories each over Frankie Edgar and Chad Mendes, and a deep list of ranked wins give Aldo both championship success and real depth. He repeatedly beat elite contenders and remained dangerous long after his original title reign ended. Its signature is scope-affected legend.",
      whyNotHigher:
        "Part of Aldo's championship legacy happened before he entered the UFC, while his defining UFC losses came against the featherweights who followed him. McGregor stopped him immediately, Holloway finished him twice, and Volkanovski clearly beat him. His bantamweight run added longevity, but not another title-level peak.",
    }),
    "Randy Couture": intentionalEditorialReview(randyCouture, {
      oneLiner:
        "Couture forced elite opponents into his kind of fight. He closed distance with discipline, bullied them in the clinch, and mixed dirty boxing, takedowns, and top pressure with the composure and tactical intelligence to wear down younger.",
      whyRankedHere:
        "Couture won UFC championships at heavyweight and light heavyweight, then kept adding major victories across different eras. He beat Vitor Belfort, Kevin Randleman, Pedro Rizzo, Chuck Liddell, Tito Ortiz, Tim Sylvia, and Gabriel Gonzaga, often with a title at stake. That two-division championship record, elite opponent list.",
      whyNotHigher:
        "Couture's championship highs were separated by too many losses and uneven stretches to match the cleaner cases above him. He never produced one long, dominant reign, and several elite rivals beat him decisively during or near title contention. His late-career heavyweight comeback was remarkable, but the full UFC record lacks the sustained control, consistency.",
    }),
    "Israel Adesanya": intentionalEditorialReview(israelAdesanya, {
      oneLiner:
        "Adesanya dictated fights through feints, stance changes, distance control, and elite counter striking. His kicks punished hesitation, while his reads made reckless entries dangerous. Once opponents became impatient. The lasting image is modern middleweight title volume.",
      whyRankedHere:
        "Adesanya built one of the strongest UFC middleweight resumes ever: an interim title win over Kelvin Gastelum, a knockout of Robert Whittaker to unify the division, five defenses in his first reign, and a title-regaining knockout of Alex Pereira. Wins over Whittaker twice, Paulo Costa, Marvin Vettori, Jared Cannonier.",
      whyNotHigher:
        "The case stops short of the highest tier because his later championship years became too uneven. Pereira ended his first reign, Sean Strickland clearly took the belt from him, and Dricus du Plessis submitted him in another title fight. The failed light heavyweight bid also denied him a second-division achievement.",
    }),
    "Daniel Cormier": intentionalEditorialReview(danielCormier, {
      oneLiner:
        "Cormier turned a short, powerful frame into a pressure weapon, crowding opponents with hand fighting, dirty boxing, body locks, and chain wrestling. His balance, pace, and top control let him dictate fights against much larger men.",
      whyRankedHere:
        "Cormier became champion in both of the UFC's heaviest divisions, made three successful light heavyweight defenses, knocked out Stipe Miocic to claim heavyweight gold, and defended that belt against Derrick Lewis. Wins over Anthony Johnson twice, Alexander Gustafsson, Volkan Oezdemir, and Miocic give him enough elite championship work to separate him from fighters with thinner.",
      whyNotHigher:
        "His ceiling is set by the rivals who defined each title run. Jon Jones handed him his only official light heavyweight loss and remained the superior 205-pound fighter, while Stipe Miocic won their heavyweight trilogy 2-1 and beat him in his final two bouts.",
    }),
    "Alex Pereira": intentionalEditorialReview(alexPereira, {
      oneLiner:
        "Pereira was a patient pressure striker with terrifying composure. Calf kicks and feints narrowed the cage, his left hook punished bad reactions, and once opponents became predictable.",
      whyRankedHere:
        "Pereira built an extraordinary UFC resume. He stopped Israel Adesanya for middleweight gold, moved up to win the light heavyweight title, then added championship victories over Jiri Prochazka twice, Jamahal Hill, Khalil Rountree Jr., and Magomed Ankalaev. That two-division success and concentration of elite wins clearly separate him from fighters.",
      whyNotHigher:
        "Pereira still lacks the longevity and sustained control of the fighters above him. His elite UFC window is compact, he lost the first Ankalaev fight decisively before avenging it, and Adesanya and Ciryl Gane both stopped him. The Gane loss came at heavyweight, but it still interrupted the run.",
    }),
    "Chuck Liddell": intentionalEditorialReview(chuckLiddell, {
      oneLiner:
        "Liddell was the prototype sprawl-and-brawl destroyer. Elite defensive wrestling kept fights standing, while his awkward counters and right-hand power made every exchange dangerous. He could hurt opponents moving backward, then swarm once they were compromised.",
      whyRankedHere:
        "Liddell's UFC resume carries serious championship weight. He took the light heavyweight title from Randy Couture, defended it four times, and added major wins over Couture, Tito Ortiz, Vitor Belfort, Renato Sobral, and Jeremy Horn. His 7-1 prime title stretch, finishing power.",
      whyNotHigher:
        "The case against going higher is the damage around the edges of his reign. Couture stopped him before the title run, Rampage ended it in the first round, and Liddell went 1-5 over his final six UFC fights.",
    }),
    "Charles Oliveira": intentionalEditorialReview(charlesOliveira, {
      oneLiner:
        "Oliveira makes every exchange feel dangerous. His pressure, knees, elbows, opportunistic submissions, and fearless scrambles create constant chaos, while elite jiu-jitsu and sharp striking let him turn a single mistake into an immediate finish.",
      whyRankedHere:
        "Oliveira's UFC resume combines championship success with historic finishing production. He stopped Michael Chandler to win the lightweight title, then finished Dustin Poirier and Justin Gaethje in consecutive championship fights. Later wins over Mateusz Gamrot and Max Holloway extended his relevance deep into his career.",
      whyNotHigher:
        "The limitation is consistency across the full UFC career. Oliveira lost eight times before becoming champion, Islam Makhachev decisively ended his title run, and later defeats to Arman Tsarukyan and Ilia Topuria kept him from rebuilding another sustained championship reign.",
    }),
    "T.J. Dillashaw": intentionalEditorialReview(
      baselineFighter("T.J. Dillashaw"),
      {
        oneLiner:
          "A real bantamweight title monster with five UFC title-fight wins, huge finishes over Barao and Garbrandt, and an EPO suspension that keeps the legacy from feeling clean.",
        whyRankedHere:
          "Dillashaw ranks here because the UFC resume has serious championship weight: two bantamweight title reigns, five UFC title-fight wins, title finishes over Renan Barao, Joe Soto, and Cody Garbrandt, plus elite wins over Cory Sandhagen, Raphael Assuncao, and John Lineker.",
        whyNotHigher:
          "He does not rank higher because the resume is permanently clouded by the EPO suspension and vacated belt, the Dominick Cruz loss cost him a cleaner reign, the Cejudo flyweight loss was ugly, and the Sterling fight ended with major shoulder-injury context.",
      },
    ),
    "Merab Dvalishvili": intentionalEditorialReview(
      baselineFighter("Merab Dvalishvili"),
      {
        oneLiner:
          "The modern bantamweight pace engine: relentless pressure, elite contender depth, and a title case built in one of the sport's toughest divisions. The lasting image is modern bantamweight pace case.",
        whyRankedHere:
          "Merab ranks here because his modern bantamweight run has serious depth. The pace, wrestling volume, and quality wins in a strong division give him one of the best active-era cases outside the top tier. Its signature is modern bantamweight pace case.",
        whyNotHigher:
          "He does not rank higher because the title run is still newer than the long-reign champions, and the Yan rematch/split rivalry keeps the case from being cleanly separated. The career remains modern bantamweight pace case.",
      },
    ),
    "Frankie Edgar": intentionalEditorialReview(
      baselineFighter("Frankie Edgar"),
      {
        oneLiner:
          "The toughness-and-longevity case: UFC lightweight gold, legendary title fights, elite featherweight wins, and enough late-career losses to keep the ceiling capped. The lasting image is lightweight champ, three-division grinder.",
        whyRankedHere:
          "Edgar ranks here because his UFC resume has real championship value, rare three-division relevance, and a deep quality-win record built around B.J. Penn, Gray Maynard, Chad Mendes, Cub Swanson, Charles Oliveira, Urijah Faber, Sean Sherk, Jeremy Stephens, and Tyson Griffin.",
        whyNotHigher:
          "He does not rank higher because the official loss column is heavy, his title reign was not long enough to match the top champions, and his prime dominance is more about grit, pace, and durability than overwhelming separation.",
      },
    ),
    "Francis Ngannou": intentionalEditorialReview(
      baselineFighter("Francis Ngannou"),
      {
        oneLiner:
          "The heavyweight terror case: historic power, Stipe title value, Gane defense value, and a UFC run capped before long-reign volume. The lasting image is heavyweight power champion.",
        whyRankedHere:
          "Ngannou ranks here because his peak danger and heavyweight title wins are massive. The Stipe knockout and Gane defense give him real championship value, while his finishing threat makes the prime-dominance case unusually strong. Its signature is heavyweight power champion.",
        whyNotHigher:
          "He does not rank higher because the UFC title volume is short. The exit from the UFC capped the long-reign case, and Stipe still has the stronger full UFC heavyweight resume. The career remains heavyweight power champion.",
      },
    ),
    "Cain Velasquez": intentionalEditorialReview(
      baselineFighter("Cain Velasquez"),
      {
        oneLiner:
          "The heavyweight pressure machine: elite pace, wrestling, cardio, and one of the best primes in UFC heavyweight history. The lasting image is heavyweight peak-dominance case. That matters.",
        whyRankedHere:
          "Cain ranks here because his prime dominance at heavyweight was exceptional. His pace, wrestling pressure, and cardio made him one of the most overwhelming heavyweights ever during his best window. Its signature is heavyweight peak-dominance case. That historical context matters.",
        whyNotHigher:
          "He does not rank higher because the UFC resume is thin compared with the deeper champions. Injuries, limited title volume, and key losses to dos Santos and Werdum keep his all-time case below Stipe and the broader top tier.",
      },
    ),
    "Benson Henderson": intentionalEditorialReview(
      baselineFighter("Benson Henderson"),
      {
        oneLiner:
          "A decision-heavy lightweight champion whose four UFC title-fight wins and seven Top-5 victories give him one of the division's deepest UFC records. The lasting image is UFC all-time case.",
        whyRankedHere:
          "Henderson ranks here because his lightweight run combined real championship volume with elite opponent depth. He beat Frankie Edgar twice, defended against Nate Diaz and Gilbert Melendez, and added strong contender wins over Jim Miller and Clay Guida while winning roughly two-thirds of his tracked rounds.",
        whyNotHigher:
          "He does not rank higher because the title reign was strong rather than historically dominant, his 18% UFC finish rate limits the separation case, and prime stoppage losses to Anthony Pettis and Rafael dos Anjos damaged the resume.",
      },
    ),
    "Aljamain Sterling": intentionalEditorialReview(
      baselineFighter("Aljamain Sterling"),
      {
        oneLiner:
          "The awkward-but-real bantamweight resume case: four UFC title-fight wins, wins over Yan, Cejudo, Sandhagen, and late featherweight relevance, with DQ/injury context keeping the debate spicy. The lasting image is modern bantamweight title resume case.",
        whyRankedHere:
          "Sterling ranks here because the UFC case is bigger than the jokes around the DQ title win. He has four bantamweight title-fight wins, a real rematch win over Petr Yan, a title defense over Henry Cejudo, an elite Sandhagen submission, and useful featherweight extension wins over Calvin Kattar, Brian Ortega.",
        whyNotHigher:
          "He does not rank higher because the championship resume needs context. The first Yan title win came by DQ, the Dillashaw defense had major shoulder-injury context, and the Sean O'Malley finish plus Movsar Evloev loss keep him below cleaner all-time champions.",
      },
    ),
    "Junior dos Santos": intentionalEditorialReview(
      baselineFighter("Junior dos Santos"),
      {
        oneLiner:
          "A UFC heavyweight champion with a historic nine-fight rise, elite Cain/Werdum/Stipe wins, and a ceiling capped by the Cain rematches. The lasting image is heavyweight knockout king.",
        whyRankedHere:
          "Dos Santos ranks here because the heavyweight win record is excellent: Cain, Werdum, Stipe, Mir, Carwin, Hunt, Lewis, Rothwell, Nelson, and more. He has enough championship value and peak danger to clear most thin-title cases. Its signature is heavyweight knockout king.",
        whyNotHigher:
          "He does not rank higher because the reign was short, he only has one defense, and Cain clearly won the rivalry with two damaging title-fight losses. The late-career losses are mostly post-prime, but they do not add value either.",
      },
    ),
    "B.J. Penn": intentionalEditorialReview(baselineFighter("B.J. Penn"), {
      oneLiner:
        "The brilliant-but-messy skill case: lightweight gold, the Hughes welterweight upset, elite talent, and a late record collapse that drags the resume down. The lasting image is two-division skill legend.",
      whyRankedHere:
        "Penn ranks here because the high-end UFC case is still real: lightweight champion, welterweight champion, the Hughes upset, and a peak skill set that was ahead of its time. Its signature is two-division skill legend. That distinction remains historically important.",
      whyNotHigher:
        "He does not rank higher because the late-career record collapse is too damaging, and the active elite window is not deep enough to offset the loss drag against cleaner champions. The career remains two-division skill legend.",
    }),
    "Justin Gaethje": intentionalEditorialReview(
      baselineFighter("Justin Gaethje"),
      {
        oneLiner:
          "The lightweight chaos case: undisputed UFC gold, two interim-title wins, elite action wins, and enough finish-loss damage to keep the GOAT case capped. The lasting image is undisputed lightweight chaos case.",
        whyRankedHere:
          "Gaethje ranks here because the UFC case now has real championship weight: undisputed lightweight gold, two interim/title-level wins, and a modern lightweight win list built around Topuria, Ferguson, Poirier, Chandler, Fiziev, Barboza, Cerrone, and Johnson. Its signature is undisputed lightweight chaos case.",
        whyNotHigher:
          "He does not rank higher because the loss context is still heavy even with the -10 cap. Gaethje has been finished in major prime fights, and one undisputed title win does not erase the Khabib, Oliveira, Max, Poirier, and Alvarez damage against cleaner all-time cases.",
      },
    ),
    "Tyron Woodley": intentionalEditorialReview(
      baselineFighter("Tyron Woodley"),
      {
        oneLiner:
          "A real UFC welterweight champion case: Lawler, Wonderboy, Maia, and Till title value, with Burns included as the end of the prime window. The lasting image is welterweight title reign.",
        whyRankedHere:
          "Woodley ranks here because his UFC title resume is stronger than casual memory usually gives it credit for: he won the welterweight belt and added multiple title-level results before Usman ended the prime window and Burns confirmed the decline. Its signature is welterweight title reign.",
        whyNotHigher:
          "He does not rank higher because the resume depth falls off after the title names, the round-control profile was inconsistent, and Usman clearly ended the prime window, while Burns confirmed the decline. The career remains welterweight title reign.",
      },
    ),
    "Glover Teixeira": intentionalEditorialReview(gloverTeixeira, {
      oneLiner:
        "Teixeira's story starts with becoming UFC champion at 42, the payoff to a career built on durability, pressure boxing, takedowns, punishing top control, and a submission game that stayed dangerous late.",
      whyRankedHere:
        "Sixteen UFC wins, thirteen over ranked opponents, and seven Top-5 victories give Teixeira exceptional light-heavyweight depth. He beat contenders across multiple eras, then submitted Jan Blachowicz for the title at 42, turning remarkable longevity into a championship breakthrough.",
      whyNotHigher:
        "His championship peak was brief: one title-fight win and no successful defense. He also lost repeatedly during his prime, including decisive defeats to Anthony Johnson, Alexander Gustafsson, and Corey Anderson, leaving a less consistent elite run than the stronger cases above him.",
    }),
    "Dustin Poirier": intentionalEditorialReview(dustinPoirier, {
      oneLiner:
        "Poirier's peak was built on pressure boxing, durability, and ruthless combination work. He could survive violent exchanges, keep a punishing pace, and break elite lightweights with layered punches, body work.",
      whyRankedHere:
        "Poirier's 22 UFC wins are backed by unusual opponent quality and longevity. He won the interim lightweight title over Max Holloway, owns two UFC wins over Holloway and Conor McGregor, and beat Justin Gaethje, Eddie Alvarez, Anthony Pettis, Michael Chandler, and Dan Hooker.",
      whyNotHigher:
        "The ceiling is championship achievement. Poirier never won the undisputed lightweight title, losing title fights to Khabib Nurmagomedov, Charles Oliveira, and Islam Makhachev. The Gaethje rematch knockout added another major setback during his late prime.",
    }),
    "Alexandre Pantoja": intentionalEditorialReview(
      baselineFighter("Alexandre Pantoja"),
      {
        oneLiner:
          "A relentless flyweight champion whose five title-fight wins, elite grappling, and eight-fight run built the best UFC flyweight resume outside Demetrious Johnson. The lasting image is UFC all-time case.",
        whyRankedHere:
          "Pantoja combines a real championship reign with repeated wins over the modern flyweight elite. He beat Brandon Moreno for the belt, defeated Brandon Royval twice, and finished both Kai Asakura and Kai Kara-France during a four-defense reign.",
        whyNotHigher:
          "His reign is much shorter than Demetrious Johnson's, the flyweight opponent pool receives a division-depth discount, and several title challengers lacked proven UFC elite resumes. The Dustin Ortiz, Deiveson Figueiredo, Askar Askarov, and Joshua Van losses also keep the case from becoming completely clean.",
      },
    ),
    "Leon Edwards": intentionalEditorialReview(
      baselineFighter("Leon Edwards"),
      {
        oneLiner:
          "A patient welterweight champion whose two victories over Kamaru Usman, three title-fight wins, and long ranked record created a serious modern resume. The lasting image is UFC all-time case.",
        whyRankedHere:
          "Edwards ranks here because he paired a long climb through the welterweight rankings with championship proof at the very top. He dethroned Kamaru Usman with one of the sport's greatest late knockouts, beat him again over five rounds, defended against Colby Covington.",
        whyNotHigher:
          "He does not rank higher because the reign stopped at three title-fight wins, his finishing rate is modest, and the Belal Muhammad title loss followed by the Sean Brady submission weakened the back end of the prime.",
      },
    ),
    "Tito Ortiz": intentionalEditorialReview(baselineFighter("Tito Ortiz"), {
      oneLiner:
        "A five-defense early UFC light heavyweight king with real title volume, huge star aura, and a ceiling capped by era strength plus Randy/Chuck losses.",
      whyRankedHere:
        "Ortiz ranks here because five UFC title defenses are too much championship volume to bury. Even after early-era discounts, his title reign gives him more championship meat than most short-window champions. Its signature is early UFC title king.",
      whyNotHigher:
        "He does not rank higher because the defense slate is not as strong as later elite reigns, the early light heavyweight division gets a depth discount, and the prime losses to Randy Couture and Chuck Liddell clearly cap the best-light-heavyweight claim.",
    }),
    "Ilia Topuria": intentionalEditorialReview(
      baselineFighter("Ilia Topuria"),
      {
        oneLiner:
          "The new-era takeover case: massive featherweight legend wins, elite finishing threat, and one current-table Gaethje loss adding the first real blemish. The lasting image is new-era title takeover.",
        whyRankedHere:
          "Topuria belongs here because the high end is already enormous. Beating Volkanovski and Holloway gives him direct value against featherweight history, and his fast title rise gives the profile a real peak-dominance lane. Its signature is new-era title takeover.",
        whyNotHigher:
          "He does not rank higher yet because the championship volume and active elite years are still early, and the current-table Gaethje loss adds the first real blemish. The resume is loud, but it has not had time to become a long reign or deep all-time.",
      },
    ),
    "Fabricio Werdum": intentionalEditorialReview(
      baselineFighter("Fabricio Werdum"),
      {
        oneLiner:
          "A complete heavyweight champion whose submission of Cain Velasquez crowned a deep six-year run of elite wins, finishes, and high-level round control. The lasting image is UFC all-time case.",
        whyRankedHere:
          "Werdum ranks here because his UFC resume is much deeper than a one-night title upset. He stopped Mark Hunt for the interim belt, submitted Cain Velasquez for the undisputed championship, beat Antonio Rodrigo Nogueira and Travis Browne, collected ten ranked wins.",
        whyNotHigher:
          "He does not rank higher because he recorded only two UFC title-fight wins and never completed an undisputed defense. The Stipe Miocic knockout ended the reign immediately, and later prime losses to Alistair Overeem and Alexander Volkov added further damage.",
      },
    ),
    "Robbie Lawler": intentionalEditorialReview(robbieLawler, {
      oneLiner:
        "Lawler's peak paired a crushing southpaw left with sharp counters, elite durability, savage pocket work, and late-round surges that could turn momentum into a finish.",
      whyRankedHere:
        "Lawler earned this tier by winning the UFC welterweight title from Johny Hendricks, stopping Rory MacDonald in the fifth round of a title defense, and beating Carlos Condit. Two successful defenses separate him from thinner championship resumes.",
      whyNotHigher:
        "The limit is the short reign: Hendricks and Condit were split-decision wins, then Woodley took the belt by first-round knockout. Fighters above Lawler sustained championship control longer and stacked more elite UFC results.",
    }),
    "Robert Whittaker": intentionalEditorialReview(robertWhittaker, {
      oneLiner:
        "Whittaker's peak combined darting karate footwork, explosive boxing entries, sharp counters, and elite takedown defense, letting him control range while sustaining a punishing pace.",
      whyRankedHere:
        "Whittaker's UFC resume has rare middleweight depth: two wins over Yoel Romero, including the interim-title victory, plus Jacare Souza, Jared Cannonier, Paulo Costa, and Marvin Vettori. Years of ranked wins separate him from the tier below.",
      whyNotHigher:
        "The lack of an official title-defense streak limits Whittaker's ceiling, and Adesanya beat him twice during his championship window. Later finish losses to Dricus du Plessis and Khamzat Chimaev further separate him from fighters with deeper reigns.",
    }),
    "Tony Ferguson": intentionalEditorialReview(
      baselineFighter("Tony Ferguson"),
      {
        oneLiner:
          "A 12-fight-streak lightweight nightmare with interim-title value and elite prime dominance, capped by no undisputed belt and a brutal late-career collapse. The lasting image is uncrowned lightweight terror.",
        whyRankedHere:
          "Ferguson lands here because the 12-fight UFC win streak, interim title, and brutal lightweight schedule make his prime impossible to ignore. Its signature is uncrowned lightweight terror. The distinction remains important across the full span of UFC history.",
        whyNotHigher:
          "He does not rank higher because he never won the undisputed UFC lightweight title, never defended a UFC belt, and the Gaethje fight ended his run toward the top of the division.",
      },
    ),
    "Henry Cejudo": intentionalEditorialReview(
      baselineFighter("Henry Cejudo"),
      {
        oneLiner:
          "The compact achievement burst: flyweight gold, bantamweight gold, huge name wins, and a short window that limits total volume. The lasting image is compact double-champ burst.",
        whyRankedHere:
          "Cejudo ranks here because he packed major value into a short UFC window: flyweight title, bantamweight title, the Demetrious Johnson win, and a fast run through elite names. Its signature is compact double-champ burst. Historically.",
        whyNotHigher:
          "He does not rank higher because the title window is short and the total UFC volume is limited. The achievements are loud, but the long-reign proof is not there. The career remains compact double-champ burst.",
      },
    ),
    "Chris Weidman": intentionalEditorialReview(
      baselineFighter("Chris Weidman"),
      {
        oneLiner:
          "A compact elite middleweight peak built on ending Anderson Silva's reign, three successful title defenses, and real contender depth before a brutal loss-heavy back half.",
        whyRankedHere:
          "Weidman ranks here because his best UFC run delivered championship proof that most contenders never reach: nine straight UFC wins, two official victories over Anderson Silva, and defenses against Silva, Lyoto Machida, and Vitor Belfort.",
        whyNotHigher:
          "He does not rank with the long-reign champions because the title run ended after three defenses and the reviewed prime includes four consecutive finished losses around one Gastelum rebound. His peak was elite.",
      },
    ),
    "Petr Yan": intentionalEditorialReview(baselineFighter("Petr Yan"), {
      oneLiner:
        "A modern bantamweight title case with elite skill, strong round control, and unusual DQ context that needs more nuance than a normal loss. The lasting image is modern bantamweight title case.",
      whyRankedHere:
        "Yan ranks here because his UFC case has real bantamweight title value, strong elite-round control, and enough quality-win/context credit to belong in the all-time conversation rather than being hidden by the messy Sterling rivalry. Its signature is modern bantamweight title case.",
      whyNotHigher:
        "He does not climb higher because the championship volume is limited and the official loss column is heavy for an all-time case, even when several losses have strong context. The career remains modern bantamweight title case.",
    }),
    "Frank Shamrock": intentionalEditorialReview(
      baselineFighter("Frank Shamrock"),
      {
        oneLiner:
          "A perfect early-UFC champion who went 5-0 with five title-fight wins, five finishes, and a defining victory over Tito Ortiz. The lasting image is UFC all-time case.",
        whyRankedHere:
          "Shamrock ranks here because his short UFC run was flawless at championship level. He won all five appearances, finished every opponent, controlled every tracked round, and closed the run by stopping Tito Ortiz in the strongest performance of his UFC resume.",
        whyNotHigher:
          "He does not rank higher because the entire UFC case spans only five fights and roughly 1.8 active elite years. The early light-heavyweight field was much thinner than later eras, only three wins reach Top-5 quality in the comparison.",
      },
    ),
    "Dricus du Plessis": intentionalEditorialReview(dricusDuPlessis, {
      oneLiner:
        "The modern middleweight chaos champion: Whittaker, Adesanya, and Strickland wins, strong finishing threat, and only one elite decision loss in the UFC. The lasting image is modern middleweight champion.",
      whyRankedHere:
        "Du Plessis ranks here because his UFC middleweight run got loud fast: Whittaker, Strickland, Adesanya, and Strickland again is a serious modern title-level win stack. The record is clean, the finishing threat is real, and the only UFC loss came to an elite champion-level opponent.",
      whyNotHigher:
        "He does not rank higher yet because the elite window is still short. He has strong championship value, but not the long title-fight volume, clean round-control dominance, active elite years, clean apex aura, or multi-era proof of the all-time names above him.",
    }),
    "Sean Strickland": intentionalEditorialReview(
      baselineFighter("Sean Strickland"),
      {
        oneLiner:
          "A pace-and-defense middleweight champion with a legendary Adesanya upset, current-table Khamzat proof, and a resume capped by Dricus/Pereira loss context. The lasting image is awkward middleweight title disruptor.",
        whyRankedHere:
          "Strickland ranks here because the top of the UFC middleweight resume is loud: the Adesanya title upset is one of the best middleweight wins ever, the current-table Khamzat win adds elite title-level proof, and his pressure/defense style gives him real round-control value.",
        whyNotHigher:
          "He does not rank higher because there is no long defense streak, the finishing profile is low, Dricus has direct title-fight separation twice, and the loss record reaches the cap. The career remains awkward middleweight title disruptor.",
      },
    ),
    "Deiveson Figueiredo": intentionalEditorialReview(
      baselineFighter("Deiveson Figueiredo"),
      {
        oneLiner:
          "A violent two-time UFC flyweight champion with real Moreno-rivalry title value, elite Pantoja/Benavidez wins, and useful bantamweight depth. The lasting image is two-time flyweight king.",
        whyRankedHere:
          "Figueiredo ranks here because he has real championship meat: three UFC flyweight title-fight wins, a draw-retainment credit, a violent title peak, and enough quality wins to separate him from thin-title cases. Its signature is two-time flyweight king.",
        whyNotHigher:
          "He does not rank higher because the reign was short, flyweight gets a division-strength discount, the Moreno rivalry includes two damaging title losses, and the late bantamweight run adds respect without becoming prime GOAT longevity.",
      },
    ),
    "Conor McGregor": intentionalEditorialReview(conorMcGregor, {
      oneLiner:
        "McGregor became the UFC's biggest superstar, pairing unmatched aura and theatrical confidence with lethal counterstriking. His timing, distance control, and straight left made him electric while pushing MMA further into the mainstream.",
      whyRankedHere:
        "McGregor produced two of the UFC's defining championship performances, knocking out Jose Aldo in 13 seconds and dismantling Eddie Alvarez to become the first simultaneous two-division champion. Wins over Chad Mendes, Max Holloway, Dustin Poirier, and Nate Diaz add depth beneath an extraordinary competitive peak.",
      whyNotHigher:
        "The elite body of work is short. McGregor never defended either UFC title, spent long stretches inactive, and has lost four of his five most recent UFC fights. Defeats to Khabib Nurmagomedov and Dustin Poirier further show that the championship-level run was not sustained.",
    }),
    "Brandon Moreno": intentionalEditorialReview(
      baselineFighter("Brandon Moreno"),
      {
        oneLiner:
          "The resilient two-reign flyweight champion: three UFC title-fight wins, a 2-1-1 Figueiredo rivalry edge, and nearly six active elite years. The lasting image is two-reign flyweight champion.",
        whyRankedHere:
          "Moreno earns his place through three UFC title-fight wins, five top-five victories, two undisputed title reigns, an interim-title finish, and a deep modern flyweight prime. His UFC 263 submission and UFC 283 title reclaim give the resume championship proof and historical identity.",
        whyNotHigher:
          "He does not rank higher because he never completed a successful undisputed defense, lost both official UFC fights to Alexandre Pantoja, and accumulated four counted prime losses. Modern flyweight also receives a modest division-depth discount compared with the strongest all-time divisions.",
      },
    ),
    "Vitor Belfort": intentionalEditorialReview(
      baselineFighter("Vitor Belfort"),
      {
        oneLiner:
          "A three-era knockout threat whose explosive finishing, five Top-5 wins, and violent 2013 contender run created a dangerous but uneven UFC legacy. The lasting image is UFC all-time case.",
        whyRankedHere:
          "Belfort ranks here because he produced elite UFC wins across an extraordinary span. His record includes Rich Franklin, Randy Couture, Michael Bisping, Luke Rockhold, Dan Henderson, Wanderlei Silva, and Anthony Johnson, while fifteen UFC wins and a 93% finishing rate give the resume rare offensive.",
        whyNotHigher:
          "He does not rank higher because the championship case is thin and unusual: his only undisputed title win came through an early cut stoppage over Randy Couture, and he never defended the belt.",
      },
    ),
    "Lyoto Machida": intentionalEditorialReview(
      baselineFighter("Lyoto Machida"),
      {
        oneLiner:
          "The Machida Era was short, but real, UFC light heavyweight gold, a scary apex. The lasting image is short-reign champion apex.",
        whyRankedHere:
          "Machida ranks here because his UFC case has real championship value, a memorable best-in-the-world window, and enough elite wins to sit above most non-champion or thin-title cases. Its signature is short-reign champion apex.",
        whyNotHigher:
          "He does not rank higher because the title reign was short, the Shogun defense is discounted for controversy, and Shogun, Rampage, Jones, Davis, and Weidman create a heavy prime-loss profile.",
      },
    ),
    "Rashad Evans": intentionalEditorialReview(
      baselineFighter("Rashad Evans"),
      {
        oneLiner:
          "A deep one-reign light-heavyweight champion whose seven Top-5 wins, iconic Chuck Liddell knockout, and Forrest Griffin title victory built a stronger resume than the brief reign suggests.",
        whyRankedHere:
          "Evans ranks here because his UFC light-heavyweight record is loaded with meaningful wins. He knocked out Chuck Liddell, stopped Forrest Griffin to win the title, beat Rampage Jackson, Michael Bisping, Phil Davis, Thiago Silva, and Dan Henderson.",
        whyNotHigher:
          "He does not rank higher because the championship reign lasted only one title-fight win and ended immediately against Lyoto Machida. The Jon Jones loss is understandable elite damage, but the Antonio Rogerio Nogueira upset is a costly non-elite prime loss.",
      },
    ),
    "Tom Aspinall": intentionalEditorialReview(
      baselineFighter("Tom Aspinall"),
      {
        oneLiner:
          "The heavyweight speed-and-finishing case: eight UFC wins, eight finishes, two interim-title wins, and a freak-injury loss that does not represent a competitive defeat.",
        whyRankedHere:
          "Aspinall earns his place through perfect UFC finishing efficiency, elite first-round wins over Sergei Pavlovich and Curtis Blaydes, an Alexander Volkov submission, and two interim-title victories. The shared comparison also recognizes that his only official UFC loss was a 15-second.",
        whyNotHigher:
          "He does not rank higher because the championship volume and active elite window are still short. He has two UFC title-fight wins, no completed undisputed title defense, and fewer top-five wins than Stipe Miocic, Francis Ngannou.",
      },
    ),
    "Dominick Cruz": intentionalEditorialReview(
      baselineFighter("Dominick Cruz"),
      {
        oneLiner:
          "The movement genius case: brilliant bantamweight skill, a legendary comeback, and a UFC resume capped by injuries and long gaps.",
        whyRankedHere:
          "Cruz ranks here because his best UFC work is brilliant. The Demetrious Johnson win, the Dillashaw comeback, and his unique championship style give him a real all-time bantamweight case inside the UFC competitive boundary.",
        whyNotHigher:
          "He does not rank higher because this is UFC and active elite years matter more than calendar legacy. The WEC reign is historical context only, and the injuries created too many gaps to record like a long uninterrupted UFC reign.",
      },
    ),
    "Royce Gracie": intentionalEditorialReview(
      baselineFighter("Royce Gracie"),
      {
        oneLiner:
          "The foundational tournament legend: an 11-0-1 opening run, complete finishing dominance, and the resume that made Brazilian jiu-jitsu impossible to ignore.",
        whyRankedHere:
          "Gracie ranks here because his early UFC run was historically dominant inside the format that existed. He won three tournaments, opened 11-0-1, finished every UFC victory. Its signature is UFC all-time case.",
        whyNotHigher:
          "He does not rank higher because early tournaments were not the same as a modern UFC title reign, the opponent pool was undeveloped, only two victories receive Top-5-level credit, and his counted elite window lasted roughly 1.4 years.",
      },
    ),
    "Khamzat Chimaev": intentionalEditorialReview(khamzatChimaev, {
      oneLiner:
        "Chimaev overwhelmed opponents with relentless wrestling pressure, physical control, and submission danger, turning early takedowns into long stretches of dominance and fast finishes.",
      whyRankedHere:
        "The UFC title win over Dricus du Plessis gives his resume championship weight. Wins over Robert Whittaker and Gilbert Burns, plus Kamaru Usman, back the peak with elite names, while a nine-fight UFC winning streak and four top-five wins separate.",
      whyNotHigher:
        "One UFC title win with no successful defense is still a thin championship case. The Sean Strickland title loss ended the unbeaten run, and Chimaev's elite window is much shorter than the sustained title-fight volume and longevity of the fighters.",
    }),
    "Michael Bisping": intentionalEditorialReview(
      baselineFighter("Michael Bisping"),
      {
        oneLiner:
          "A grit-and-volume UFC legend whose Rockhold upset and long middleweight resume make him a real champion case, even without a dominant reign.",
        whyRankedHere:
          "Bisping record as a real UFC champion case because he beat Rockhold for the belt, defended once, beat Anderson, and stacked one of the longest relevant middleweight runs in UFC history.",
        whyNotHigher:
          "He does not rank higher because the reign was short, the Henderson defense is discounted, he did not clear the Yoel/Jacare/Whittaker contender line, and the GSP title loss counts as a prime finish loss.",
      },
    ),
    "Anthony Pettis": intentionalEditorialReview(
      baselineFighter("Anthony Pettis"),
      {
        oneLiner:
          "The Showtime champion case: two UFC title-fight wins, three top-five victories, and signature finishes across three divisions. The lasting image is showtime lightweight champion.",
        whyRankedHere:
          "Pettis earns his place through an undisputed lightweight title win, a successful defense, three top-five victories, and one of the most memorable two-fight championship peaks of his era. The Henderson armbar and Melendez guillotine give the UFC resume real title.",
        whyNotHigher:
          "He does not rank higher because the title reign ended after one defense, the reviewed prime finished 7-6, and six counted prime losses-including three finishes-drag down the consistency and round-control case.",
      },
    ),
    "Sean O'Malley": intentionalEditorialReview(
      baselineFighter("Sean O'Malley"),
      {
        oneLiner:
          "A precision-striking bantamweight champion with a huge Aljo title KO, a Vera title defense, and a resume capped hard by Merab.",
        whyRankedHere:
          "O'Malley ranks here because the top of the UFC resume is real: he knocked out Aljamain Sterling to win the bantamweight title, defended against Marlon Vera, beat Petr Yan in a close elite fight, and added Song/Zahabi current-table rebound value.",
        whyNotHigher:
          "He does not rank higher yet because the reign was short, the elite-win list is not deep, and the two Merab losses sharply cap the title-prime and GOAT case. The career remains bantamweight champion burst.",
      },
    ),
    "Quinton Jackson": intentionalEditorialReview(
      baselineFighter("Quinton Jackson"),
      {
        oneLiner:
          "The high-impact UFC light heavyweight case: knocked out Chuck Liddell for the belt, defended against Dan Henderson, and stayed in the elite title mix through the Jon Jones.",
        whyRankedHere:
          "Rampage earns his place through two UFC title-fight wins, four top-five victories, championship-level wins over Chuck Liddell and Dan Henderson, and a strong late-2000s light heavyweight prime. His PRIDE resume is excluded.",
        whyNotHigher:
          "He does not rank higher because the UFC title reign was short, the reviewed prime includes losses to Forrest Griffin, Rashad Evans, and Jon Jones, and his thirteen-fight UFC sample cannot match the championship volume of the division's longest-reigning greats.",
      },
    ),
    'Mauricio "Shogun" Rua': intentionalEditorialReview(
      baselineFighter('Mauricio "Shogun" Rua'),
      {
        oneLiner:
          "A violent light-heavyweight champion whose knockout of Lyoto Machida created an elite UFC peak, even though the broader UFC resume was far less consistent than his legend suggests.",
        whyRankedHere:
          "Rua ranks here because his best UFC stretch delivered real championship proof. He stopped Chuck Liddell, pushed Lyoto Machida to a disputed decision, knocked Machida out in the rematch to win the belt, and later avenged the Forrest Griffin loss.",
        whyNotHigher:
          "He does not rank higher because the UFC's history is UFC, so his celebrated PRIDE run is excluded. His UFC record is 11-12-1, he won only one title fight, and his counted prime finished 3-3 with damaging losses to Jon.",
      },
    ),
    "Forrest Griffin": intentionalEditorialReview(
      baselineFighter("Forrest Griffin"),
      {
        oneLiner:
          "An upset-driven light-heavyweight champion whose wins over Shogun Rua and Rampage Jackson created a legitimate but short-lived elite peak. The lasting image is UFC all-time case.",
        whyRankedHere:
          "Griffin ranks here because his best two-fight stretch carried real historical weight. He submitted Mauricio Rua in a major upset, then beat Quinton Jackson to win the UFC light-heavyweight title.",
        whyNotHigher:
          "He does not rank higher because the championship run ended in his first defense, the counted prime finished only 4-3, and Rashad Evans, Anderson Silva, and Rua all stopped him during that window.",
      },
    ),
    "Brock Lesnar": intentionalEditorialReview(
      baselineFighter("Brock Lesnar"),
      {
        oneLiner:
          "A massive short-window UFC heavyweight champion whose title run was real, explosive, and historically important, but capped by tiny sample size and a brief elite window.",
        whyRankedHere:
          "Lesnar lands here because his UFC heavyweight title run was real: he beat Couture, smashed Mir in the rematch, and survived Carwin to defend the belt. Its signature is short-window heavyweight champ.",
        whyNotHigher:
          "He does not rank higher because the elite UFC sample is tiny, the title reign was short, Cain ended the run quickly, and the later Overeem/Hunt chapter does not add resume depth.",
      },
    ),
    "Dan Henderson": intentionalEditorialReview(
      baselineFighter("Dan Henderson"),
      {
        oneLiner:
          "A true all-time MMA legend whose UFC record is much harsher: great Shogun/Bisping/Franklin moments, no UFC title wins, and most of the historic aura living outside this competitive.",
        whyRankedHere:
          "Henderson ranks here because UFC still gives him real value: the Shogun classic, the Bisping knockout, the Franklin win, the Lombard knockout, old-era UFC 17 tournament context, and a long stretch of elite-name fights across middleweight and light heavyweight.",
        whyNotHigher:
          "He does not rank higher because the UFC's history does not record Pride, Strikeforce, Rings, or the broader all-time MMA resume. In the UFC alone, Hendo went 8-9, never won an undisputed UFC title.",
      },
    ),
    "Chael Sonnen": intentionalEditorialReview(
      baselineFighter("Chael Sonnen"),
      {
        oneLiner:
          "A relentless UFC title challenger whose wrestling pressure and Anderson Silva rivalry made him unforgettable, but zero title wins cap the resume hard.",
        whyRankedHere:
          "Sonnen lands here because his middleweight contender run was real: Okami, Marquardt, Stann, and Bisping gave him one of the strongest no-belt cases in this tier. Its signature is middleweight title agitator.",
        whyNotHigher:
          "He does not rank higher because he never won a UFC title, lost all three UFC title fights, and the biggest moments of his UFC career still ended as losses.",
      },
    ),
    "Paddy Pimblett": intentionalEditorialReview(
      baselineFighter("Paddy Pimblett"),
      {
        oneLiner:
          "A fearless modern lightweight contender with a 7-0 UFC start, dangerous submission offense, and a rebound win that proved he belongs against ranked opposition.",
        whyRankedHere:
          "Pimblett earns a place in the UFC historical standing through eight UFC wins, six finishes, and a current elite stretch highlighted by King Green, Michael Chandler, and Benoit Saint Denis.",
        whyNotHigher:
          "He has not won a UFC championship fight, owns only one clear top-five win, and his elite window is still short. The Justin Gaethje interim-title loss also keeps him below established champions and long-term contenders.",
      },
    ),
    "Amanda Nunes": intentionalEditorialReview(amandaNunes, {
      oneLiner:
        "Nunes combined crushing power with patience, timing, and complete versatility. She could pressure behind heavy boxing, wrestle when needed, punish mistakes instantly, and turn one clean opening into a finish before opponents could settle into their game plan.",
      whyRankedHere:
        "Nunes built the strongest UFC resume in women's MMA: championships at bantamweight and featherweight, sustained title success, and victories over nearly every defining champion of her era. She stopped Ronda Rousey, Cris Cyborg, Holly Holm, and Miesha Tate, beat Valentina Shevchenko twice, and later reclaimed the bantamweight belt from Julianna Pena.",
      whyNotHigher:
        "Nunes does have real blemishes, she lost the bantamweight title to Julianna Pena in a massive upset, dropped multiple UFC fights before her championship peak, and barely edged Valentina Shevchenko in their second meeting. But she avenged Pena decisively, beat Shevchenko twice. The career remains women's UFC GOAT standard.",
    }),
    "Valentina Shevchenko": intentionalEditorialReview(
      baselineFighter("Valentina Shevchenko"),
      {
        oneLiner:
          "The clean technical champion case: long flyweight reign, elite skill, strong opponent quality, and direct rivalry context behind Nunes. The lasting image is technical flyweight standard. The distinction remains important across the full span of UFC history.",
        whyRankedHere:
          "Valentina belongs here because her UFC flyweight reign was long, technical, and consistent. She also has meaningful bantamweight context, strong opponent quality, and years of title-level control. Its signature is technical flyweight standard. That competitive distinction still carries substantial historical importance when comparing accomplished UFC champions across multiple eras and championship generations today.",
        whyNotHigher:
          "She does not pass Nunes because Nunes owns the direct rivalry edge and the stronger two-division title case. Valentina's flyweight reign is excellent, but Nunes has the cleaner women's GOAT separation. The career remains technical flyweight standard. The distinction remains important across the full span of UFC history.",
      },
    ),
    "Zhang Weili": intentionalEditorialReview(baselineFighter("Zhang Weili"), {
      oneLiner:
        "A two-time UFC strawweight champion with six title-fight wins, a dominant second reign, elite Joanna/Andrade/Suarez proof, and Rose as the clear ceiling on the case. The lasting image is strawweight two-reign force. That matters.",
      whyRankedHere:
        "Zhang belongs in the elite women's UFC tier because the title resume is serious: two strawweight reigns, six title-fight wins, four defenses, a dominant second reign, and direct wins over Joanna. Its signature is strawweight two-reign force. That competitive distinction still carries substantial historical importance when comparing accomplished UFC champions across multiple eras and championship generations today.",
      whyNotHigher:
        "She does not pass the top women's benchmarks because Rose beat her twice in the heart of her title years, and the Valentina challenge did not create a two-division UFC title case. The second reign is elite, but the loss column keeps the ceiling clear.",
    }),
    "Joanna Jedrzejczyk": intentionalEditorialReview(
      baselineFighter("Joanna Jedrzejczyk"),
      {
        oneLiner:
          "The strawweight standard: long title control, elite striking volume, and one of the cleanest technical champion runs in women's UFC history. The lasting image is strawweight title standard. That distinction remains important across UFC history.",
        whyRankedHere:
          "Joanna belongs here because her strawweight reign was historically important and technically dominant. Her title defenses, pace, takedown defense, and striking output made her the early standard for the division. Its signature is strawweight title standard. That competitive distinction still carries substantial historical importance when comparing accomplished UFC champions across multiple eras and championship generations today.",
        whyNotHigher:
          "She does not pass Nunes or Valentina because she has less two-division value, less total title-fight separation, and the Rose/Zhang stretch damaged the back end of the case. The career remains strawweight title standard. That distinction remains especially important when comparing accomplished champions throughout the UFC's history.",
      },
    ),
    "Rose Namajunas": intentionalEditorialReview(
      baselineFighter("Rose Namajunas"),
      {
        oneLiner:
          "A volatile but elite UFC case: two strawweight reigns, four title-fight wins, Joanna twice, Zhang twice, and a 6-2 prime capped by Andrade and Esparza damage. The lasting image is two-reign strawweight giant killer.",
        whyRankedHere:
          "Rose belongs in the high-end women's UFC champion tier because the quality wins are enormous: Joanna twice, Zhang twice, Andrade, and two separate strawweight title wins. Its signature is two-reign strawweight giant killer. That competitive distinction still carries substantial historical importance when comparing accomplished UFC champions across multiple eras and championship generations today.",
        whyNotHigher:
          "The case is capped by short title reigns and volatility. Four title-fight wins is strong, but not Amanda, Valentina, or Zhang title volume, and the Andrade finish plus Esparza rematch loss keep the prime from looking clean. The career remains two-reign strawweight giant killer. Historically.",
      },
    ),
    "Ronda Rousey": intentionalEditorialReview(
      baselineFighter("Ronda Rousey"),
      {
        oneLiner:
          "The original women's UFC superstar case: historic bantamweight title dominance, instant finishes, mainstream impact, and a sharp ending that caps the record. The lasting image is original women's UFC superstar.",
        whyRankedHere:
          "Rousey belongs here because her UFC peak mattered enormously. She was the original women's UFC champion, defended repeatedly, and finished fights in a way that made her feel almost inevitable during the early run. Its signature is original women's UFC superstar. That historical context matters.",
        whyNotHigher:
          "She does not rank higher because the run was short and the ending was severe. The Holm and Nunes losses damaged the aura, and the later women's champions built deeper UFC resumes. The career remains original women's UFC superstar. Historically.",
      },
    ),
    "Jessica Andrade": intentionalEditorialReview(
      baselineFighter("Jessica Andrade"),
      {
        oneLiner:
          "A former UFC strawweight champion with elite volume, real cross-division wins, and a messy but undeniable UFC resume. The lasting image is three-division wrecking ball. That distinction remains historically important.",
        whyRankedHere:
          "Andrade belongs high in this women's champion tier because she has real UFC title value, the strongest win volume in this batch, and quality names across 115 and 125. Its signature is three-division wrecking ball. That distinction remains important when comparing accomplished champions throughout the UFC's history.",
        whyNotHigher:
          "She does not rank higher because she never defended the belt, lost several title/elite fights, and the late record is messy. The career remains three-division wrecking ball. That competitive distinction still carries substantial historical importance when comparing accomplished UFC champions across multiple eras and championship generations today.",
      },
    ),
    "Mackenzie Dern": intentionalEditorialReview(mackenzieDern, {
      oneLiner:
        "Dern's identity starts with world-class jiu-jitsu and the constant threat that one scramble can end the fight. Aggressive transitions, back takes, and opportunistic submissions remain her signature, while improved striking and composure helped carry her to UFC gold.",
      whyRankedHere:
        "Dern has built a 12-5 UFC record with eight ranked wins, then converted that long contender run into championship success. She won the vacant strawweight title over Virna Jandiroba and successfully defended it against Gillian Robertson, giving her two title-fight wins and an active reign.",
      whyNotHigher:
        "Her championship case is still young: the belt came through a vacant-title fight and she has only one successful defense. Earlier losses to Marina Rodriguez, Yan Xiaonan, Jessica Andrade, and Amanda Lemos also showed real inconsistency against upper-level contenders before her title run.",
    }),
    "Cris Cyborg": intentionalEditorialReview(baselineFighter("Cris Cyborg"), {
      oneLiner:
        "A terrifying short-run featherweight champion who went 5-1 in the UFC, won three title fights, and finished four opponents before Amanda Nunes ended the reign. The lasting image is UFC all-time case.",
      whyRankedHere:
        "Cyborg ranks here because her UFC sample was brief but clearly championship-level. She won the featherweight belt, defeated Holly Holm over five rounds, defended again against Yana Kunitskaya, finished four of her five UFC victories, and won nearly 85% of her tracked rounds during the run.",
      whyNotHigher:
        "She does not rank higher because this is a UFC list, so the long Strikeforce and Invicta portions of her legacy are excluded. Her UFC resume contains only six fights, roughly 2.6 active elite years, and one Top-5 win. The Amanda Nunes knockout is also a decisive prime title-loss finish that sharply limits an otherwise.",
    }),
    "Carla Esparza": intentionalEditorialReview(
      baselineFighter("Carla Esparza"),
      {
        oneLiner:
          "A two-time UFC strawweight champion whose resume is stronger than the eye test, built around beating Rose twice and a strong second title climb. The lasting image is two-time strawweight spoiler.",
        whyRankedHere:
          "Esparza record as a real UFC champion because two UFC title wins matter and the second-title climb had real ranked names. Its signature is two-time strawweight spoiler. That competitive distinction still carries substantial historical importance when comparing accomplished UFC champions across multiple eras and championship generations today.",
        whyNotHigher:
          "She does not rank higher because she never defended either belt, had two damaging title losses, and rarely separated from elite opponents in a dominant way. The career remains two-time strawweight spoiler. The distinction remains important across the full span of UFC history.",
      },
    ),
    "Alexa Grasso": intentionalEditorialReview(
      baselineFighter("Alexa Grasso"),
      {
        oneLiner:
          "A former UFC flyweight champion whose case is built on the Valentina upset, draw retention, and strong flyweight contender work. The lasting image is valentina title breaker. That context matters.",
        whyRankedHere:
          "Grasso belongs here because beating Valentina for the belt is one of the best women's UFC wins ever, and the draw retention adds real championship value. Its signature is valentina title breaker. That competitive distinction still carries substantial historical importance when comparing accomplished UFC champions across multiple eras and championship generations today.",
        whyNotHigher:
          "She does not rank higher because the reign was short, she never logged a clean defense win, and Valentina/Natalia losses cap the case. The career remains valentina title breaker. That distinction remains especially important when comparing accomplished champions throughout the UFC's history.",
      },
    ),
    "Kayla Harrison": intentionalEditorialReview(kaylaHarrison, {
      oneLiner:
        "Harrison's UFC peak has been built on suffocating grappling control, relentless takedown pressure, heavy top positioning, and submission danger that lets her dictate rounds from start to finish. The lasting image is bantamweight title force.",
      whyRankedHere:
        "A perfect 3-0 UFC run already includes taking the bantamweight title from reigning champion Julianna Pena, plus wins over former champion Holly Holm and top contender Ketlen Vieira. Few fighters have built that much quality in three appearances. Its signature is bantamweight title force. Historically.",
      whyNotHigher:
        "The limitation is simple: three UFC fights, one title-fight win, and no defenses. The women above Harrison built longer elite runs and deeper championship resumes, and her late UFC arrival leaves little time to match that volume. The career remains bantamweight title force.",
    }),
    "Julianna Pe\u00f1a": intentionalEditorialReview(
      baselineFighter("Julianna Pe\u00f1a"),
      {
        oneLiner:
          "A two-time UFC bantamweight champion with one of the biggest title upsets ever, balanced by no defenses and rough elite losses. The lasting image is nunes upset champion. That matters.",
        whyRankedHere:
          "Pena belongs here because beating Amanda Nunes for the belt is a gigantic UFC title result, and the Pennington title win gives her a second championship point. Its signature is nunes upset champion. That competitive distinction remains especially important when comparing accomplished champions throughout the UFC's history.",
        whyNotHigher:
          "She does not rank higher because she has zero defenses, the Nunes rematch was decisive, and the Kayla/Valentina/GDR losses keep the dominance case low. The career remains nunes upset champion. That distinction remains important when comparing accomplished champions throughout the UFC's history.",
      },
    ),
    "Miesha Tate": intentionalEditorialReview(baselineFighter("Miesha Tate"), {
      oneLiner:
        "A former UFC bantamweight champion whose UFC case is built on the legendary Holm comeback, a solid contender climb, and a short reign with no defenses. The lasting image is bantamweight title comeback.",
      whyRankedHere:
        "Tate record as a legitimate UFC champion because the Holm win was a real title-winning peak moment, and the Carmouche/McMann/Eye run gives the title climb enough support. Its signature is bantamweight title comeback. That competitive distinction remains especially important when comparing accomplished champions throughout the UFC's history.",
      whyNotHigher:
        "The UFC case is thin after the Holm win. She has one title-fight win, zero defenses, limited elite UFC win depth, and three counted finish losses before the post-prime cutoff. The career remains bantamweight title comeback. That historical context matters.",
    }),
    "Holly Holm": intentionalEditorialReview(baselineFighter("Holly Holm"), {
      oneLiner:
        "A former UFC bantamweight champion with one immortal title upset, but no defenses and too many failed elite/title spots to climb higher. The lasting image is ronda upset legend. Historically.",
      whyRankedHere:
        "Holm record because the Ronda knockout is one of the biggest UFC championship moments ever and she stayed relevant in title/elite fights for years. Its signature is ronda upset legend. That competitive distinction still carries substantial historical importance when comparing accomplished UFC champions across multiple eras and championship generations today.",
      whyNotHigher:
        "She does not rank higher because she had no successful defenses, lost the belt immediately, and came up short in several title/elite fights. The career remains ronda upset legend. That distinction remains especially important when comparing accomplished champions throughout the UFC's history.",
    }),
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
