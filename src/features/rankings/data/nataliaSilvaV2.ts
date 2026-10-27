/**
 * UFC-only Natalia Silva V2 addition; reviewed October 27, 2026.
 * Sources: https://www.ufc.com/athlete/natalia-silva
 * https://www.ufc.com/news/ufc-332-silva-vs-wang-results
 * https://www.ufc.com/news/ufc-332-silva-vs-wang-official-scorecards
 * https://mmadecisions.com/fighter/6248/Natalia-Silva
 * Only UFC fights count. No pre-UFC bouts or non-UFC belts.
 */

function fight(
  date: string,
  opponent: string,
  methodCategory: "decision" | "ko-tko",
  qualityTier: "solid" | "ranked" | "top-ten" | "top-five",
  won: number,
  lost: number,
  championshipType = "none",
  championshipManualCredit: number | null = null,
) {
  return {
    id: date + "-" + opponent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    date, opponent, division: "Flyweight",
    officialResult: "win" as const,
    scoringDisposition: "count-win" as const,
    methodCategory, qualityTier, championshipType,
    championshipEligible: true,
    championshipOpponentStrength: null,
    championshipManualCredit,
    rounds: { status: "audited" as const, won, lost, drawn: 0 },
    lossClassification: { competitive: true, divisionContext: "home" as const, overrideRule: null },
  };
}

const fights = [
  fight("2022-06-18", "Jasmine Jasudavicius", "decision", "solid", 3, 0),
  fight("2022-11-19", "Tereza Bleda", "ko-tko", "solid", 3, 0),
  fight("2023-05-20", "Victoria Leonardo", "ko-tko", "solid", 1, 0),
  fight("2023-08-19", "Andrea Lee", "decision", "solid", 3, 0),
  fight("2024-02-03", "Viviane Araujo", "decision", "ranked", 2, 1),
  fight("2024-09-07", "Jessica Andrade", "decision", "top-ten", 3, 0),
  fight("2025-05-10", "Alexa Grasso", "decision", "top-five", 3, 0),
  fight("2026-01-24", "Rose Namajunas", "decision", "top-five", 2, 1),
  fight("2026-10-03", "Wang Cong", "decision", "top-ten", 3, 2, "vacant-undisputed", 0.85),
];

// Judge-majority rounds; TKO finishing round included. Rose was 2-1 on
// official scorecards despite considerable media disagreement.
function qualityWin(date: string, opponent: string, finalCredit: number, note: string) {
  return {
    fighter: "Natalia Silva",
    fightId: fights.find((row) => row.date === date)!.id,
    opponent, date, division: "Flyweight", finalCredit,
    reviewStatus: "locked",
    judgmentSource: "octagon-hq-2026-10-27-silva-v2",
    judgmentStatus: "editorial-audited",
    provenance: "UFC result plus opponent status at the time of the bout",
    note,
  };
}

export const nataliaSilvaV2 = {
  fighter: "Natalia Silva",
  board: "women",
  facts: {
    identity: { primaryDivision: "Flyweight", secondaryDivisions: [] },
    primeWindow: { startFightId: "2024-02-03-viviane-araujo", endFightId: null, open: true },
    gapCapMonths: 18, fights,
  },
  era: {
    window: { start: "2024-02-03", end: null },
    statusMultiplier: 1.08,
    divisionMultiplier: 0.95,
  },
  judgments: {
    championship: {
      fighter: "Natalia Silva", benchmarkCredit: 14.54,
      inputs: [{
        fightId: "2026-10-03-wang-cong",
        opponent: "Wang Cong", date: "2026-10-03",
        event: "UFC 332", titleType: "vacant-undisputed", officialTitleFight: true,
        finalAdjustedCredit: 0.85,
        notes: "Won vacant undisputed title over No. 8 Wang Cong; not a defense or win over reigning champion Shevchenko.",
      }],
    },
    opponentQuality: {
      fighter: "Natalia Silva", benchmarkCredit: 14.54, fighterAdjustment: 0,
      inputs: [
        qualityWin("2022-06-18", "Jasmine Jasudavicius", 0.35, "Strong debut, but opponent was not yet established elite."),
        qualityWin("2023-08-19", "Andrea Lee", 0.25, "Experienced flyweight then on a losing streak."),
        qualityWin("2024-02-03", "Viviane Araujo", 0.45, "First ranked win; narrow official 29-28 sweep."),
        qualityWin("2024-09-07", "Jessica Andrade", 0.70, "Top-ten flyweight and former strawweight champion; official 30-27 sweep."),
        qualityWin("2025-05-10", "Alexa Grasso", 1.00, "Recent flyweight champion; official 30-27 sweep."),
        qualityWin("2026-01-24", "Rose Namajunas", 0.80, "Two-time strawweight champion; 29-28 official verdict disputed by media and fans."),
        qualityWin("2026-10-03", "Wang Cong", 0.65, "No. 8 flyweight entering vacant championship bout; unanimous five-round win."),
      ],
    },
    apex: {
      fighter: "Natalia Silva",
      performances: [
        { fightId: "2024-09-07-jessica-andrade", opponent: "Jessica Andrade", date: "2024-09-07", rating: 9.2 },
        { fightId: "2025-05-10-alexa-grasso", opponent: "Alexa Grasso", date: "2025-05-10", rating: 9.3 },
      ],
      components: { twoPerformanceStrength: 1.85, proof: 1.1, bestFighterClaim: 0.75, aura: 0.85 },
      notes: "Andrade and Grasso shutout decisions establish apex; no title defense is credited.",
    },
  },
  eraDepth: { fighter: "Natalia Silva", depthIndex: null, approvedAdjustment: 0.18 },
  presentation: {
    slug: "natalia-silva",
    primaryDivision: "Flyweight", secondaryDivision: null, divisionLabel: "WFLW",
    resumeTag: "UFC flyweight champion; unbeaten 9-0 start",
    oneLiner: "Fast multi-level combinations and elusive footwork carried Silva from an unbeaten UFC contender run to undisputed flyweight gold.",
    whyRankedHere: "Silva beat former UFC champions Jessica Andrade, Alexa Grasso and Rose Namajunas in succession, then defeated Wang Cong for the vacant flyweight title. She is 9-0 in the UFC, including unanimous shutouts of Andrade and Grasso.",
    whyNotHigher: "One vacant-title win and no defenses cannot equal the long reign of Valentina Shevchenko or sustained multi-defense title resumes. The Namajunas decision was disputed, Wang entered ranked No. 8, and the elite championship window is still young.",
    finalTakeaway: "A legitimate champion and elite current flyweight, Silva belongs on the historical board but needs defenses and more elite wins to challenge the division's all-time leaders.",
    keyJudgmentCalls: [
      "Only nine UFC victories from June 2022 through October 3, 2026 count; pre-UFC accomplishments do not.",
      "Prime begins with the ranked Viviane Araujo win in February 2024.",
      "The official Rose Namajunas decision counts, with tempered opponent credit for the disputed result.",
      "Vacant title credit is 0.85 against No. 8 Wang Cong, not full reigning-champion or defense credit.",
      "Zero title defenses as of October 27, 2026.",
    ],
    photoUrl: "assets/fighters/natalia-silva-spotlight.webp",
    thumbUrl: "assets/fighters/natalia-silva-thumb.webp",
    watchUrl: null, watchLabel: null, signatureFightUrl: null, signatureFightLabel: null,
  },
};
