/**
 * UFC-only audited all-time addition, through October 27, 2026.
 * Research: https://www.ufc.com/athlete/natalia-silva
 * Results: https://www.ufc.com/event/ufc-332 and https://www.ufc.com/news/ufc-332-silva-vs-wang-official-scorecards
 * Decisions: https://mmadecisions.com/fighter/6248/Natalia-Silva
 * Only score-bearing facts live here; overall rating and board placement are engine-calculated.
 */
import type { RankingInputFighter } from "./rankingInputs";

export const nataliaSilvaRankingInput = {
  "fighter": "Natalia Silva",
  "board": "women",
  "facts": {
    "identity": {
      "primaryDivision": "Flyweight",
      "secondaryDivisions": []
    },
    "primeWindow": {
      "startFightId": "2022-06-18-jasmine-jasudavicius",
      "endFightId": null,
      "open": true
    },
    "gapCapMonths": 18,
    "fights": [
      {
        "id": "2022-06-18-jasmine-jasudavicius",
        "date": "2022-06-18",
        "opponent": "Jasmine Jasudavicius",
        "division": "Flyweight",
        "officialResult": "win",
        "scoringDisposition": "count-win",
        "methodCategory": "decision",
        "qualityTier": "solid",
        "championshipType": "none",
        "championshipEligible": true,
        "championshipOpponentStrength": null,
        "championshipManualCredit": null,
        "rounds": {
          "status": "audited",
          "won": 3,
          "lost": 0,
          "drawn": 0
        },
        "lossClassification": {
          "competitive": true,
          "divisionContext": "home",
          "overrideRule": null
        }
      },
      {
        "id": "2022-11-19-tereza-bleda",
        "date": "2022-11-19",
        "opponent": "Tereza Bleda",
        "division": "Flyweight",
        "officialResult": "win",
        "scoringDisposition": "count-win",
        "methodCategory": "ko-tko",
        "qualityTier": "solid",
        "championshipType": "none",
        "championshipEligible": true,
        "championshipOpponentStrength": null,
        "championshipManualCredit": null,
        "rounds": {
          "status": "unavailable",
          "won": 0,
          "lost": 0,
          "drawn": 0
        },
        "lossClassification": {
          "competitive": true,
          "divisionContext": "home",
          "overrideRule": null
        }
      },
      {
        "id": "2023-05-20-victoria-leonardo",
        "date": "2023-05-20",
        "opponent": "Victoria Leonardo",
        "division": "Flyweight",
        "officialResult": "win",
        "scoringDisposition": "count-win",
        "methodCategory": "ko-tko",
        "qualityTier": "solid",
        "championshipType": "none",
        "championshipEligible": true,
        "championshipOpponentStrength": null,
        "championshipManualCredit": null,
        "rounds": {
          "status": "audited",
          "won": 1,
          "lost": 0,
          "drawn": 0
        },
        "lossClassification": {
          "competitive": true,
          "divisionContext": "home",
          "overrideRule": null
        }
      },
      {
        "id": "2023-08-19-andrea-lee",
        "date": "2023-08-19",
        "opponent": "Andrea Lee",
        "division": "Flyweight",
        "officialResult": "win",
        "scoringDisposition": "count-win",
        "methodCategory": "decision",
        "qualityTier": "ranked",
        "championshipType": "none",
        "championshipEligible": true,
        "championshipOpponentStrength": null,
        "championshipManualCredit": null,
        "rounds": {
          "status": "audited",
          "won": 3,
          "lost": 0,
          "drawn": 0
        },
        "lossClassification": {
          "competitive": true,
          "divisionContext": "home",
          "overrideRule": null
        }
      },
      {
        "id": "2024-02-03-viviane-araujo",
        "date": "2024-02-03",
        "opponent": "Viviane Araujo",
        "division": "Flyweight",
        "officialResult": "win",
        "scoringDisposition": "count-win",
        "methodCategory": "decision",
        "qualityTier": "top-ten",
        "championshipType": "none",
        "championshipEligible": true,
        "championshipOpponentStrength": null,
        "championshipManualCredit": null,
        "rounds": {
          "status": "audited",
          "won": 2,
          "lost": 1,
          "drawn": 0
        },
        "lossClassification": {
          "competitive": true,
          "divisionContext": "home",
          "overrideRule": null
        }
      },
      {
        "id": "2024-09-07-jessica-andrade",
        "date": "2024-09-07",
        "opponent": "Jessica Andrade",
        "division": "Flyweight",
        "officialResult": "win",
        "scoringDisposition": "count-win",
        "methodCategory": "decision",
        "qualityTier": "top-five",
        "championshipType": "none",
        "championshipEligible": true,
        "championshipOpponentStrength": null,
        "championshipManualCredit": null,
        "rounds": {
          "status": "audited",
          "won": 3,
          "lost": 0,
          "drawn": 0
        },
        "lossClassification": {
          "competitive": true,
          "divisionContext": "home",
          "overrideRule": null
        }
      },
      {
        "id": "2025-05-10-alexa-grasso",
        "date": "2025-05-10",
        "opponent": "Alexa Grasso",
        "division": "Flyweight",
        "officialResult": "win",
        "scoringDisposition": "count-win",
        "methodCategory": "decision",
        "qualityTier": "champion-level",
        "championshipType": "none",
        "championshipEligible": true,
        "championshipOpponentStrength": null,
        "championshipManualCredit": null,
        "rounds": {
          "status": "audited",
          "won": 3,
          "lost": 0,
          "drawn": 0
        },
        "lossClassification": {
          "competitive": true,
          "divisionContext": "home",
          "overrideRule": null
        }
      },
      {
        "id": "2026-01-24-rose-namajunas",
        "date": "2026-01-24",
        "opponent": "Rose Namajunas",
        "division": "Flyweight",
        "officialResult": "win",
        "scoringDisposition": "count-win",
        "methodCategory": "decision",
        "qualityTier": "top-five",
        "championshipType": "none",
        "championshipEligible": true,
        "championshipOpponentStrength": null,
        "championshipManualCredit": null,
        "rounds": {
          "status": "audited",
          "won": 2,
          "lost": 1,
          "drawn": 0
        },
        "lossClassification": {
          "competitive": true,
          "divisionContext": "home",
          "overrideRule": null
        }
      },
      {
        "id": "2026-10-03-wang-cong",
        "date": "2026-10-03",
        "opponent": "Wang Cong",
        "division": "Flyweight",
        "officialResult": "win",
        "scoringDisposition": "count-win",
        "methodCategory": "decision",
        "qualityTier": "top-ten",
        "championshipType": "vacant-undisputed",
        "championshipEligible": true,
        "championshipOpponentStrength": null,
        "championshipManualCredit": 0.85,
        "rounds": {
          "status": "audited",
          "won": 3,
          "lost": 2,
          "drawn": 0
        },
        "lossClassification": {
          "competitive": true,
          "divisionContext": "home",
          "overrideRule": null
        }
      }
    ]
  },
  "era": {
    "window": {
      "start": "2022-06-18",
      "end": null
    },
    "statusMultiplier": 1.08,
    "divisionMultiplier": 0.95
  },
  "judgments": {
    "championship": {
      "fighter": "Natalia Silva",
      "benchmarkCredit": 14.54,
      "inputs": [
        {
          "fightId": "2026-10-03-wang-cong",
          "opponent": "Wang Cong",
          "date": "2026-10-03",
          "event": "UFC 332",
          "titleType": "vacant-undisputed",
          "officialTitleFight": true,
          "finalAdjustedCredit": 0.85,
          "notes": "Won the vacant undisputed flyweight championship by unanimous decision over the eighth-ranked contender; single title fight, zero defenses."
        }
      ]
    },
    "opponentQuality": {
      "fighter": "Natalia Silva",
      "benchmarkCredit": 14.54,
      "fighterAdjustment": 0,
      "inputs": [
        {
          "fighter": "Natalia Silva",
          "fightId": "2022-06-18-jasmine-jasudavicius",
          "opponent": "Jasmine Jasudavicius",
          "date": "2022-06-18",
          "division": "Flyweight",
          "finalCredit": 0.3,
          "reviewStatus": "audited",
          "judgmentSource": "octagon-hq-v2-natalia-silva-20261027",
          "judgmentStatus": "research-verified",
          "provenance": "UFC result / UFC roster rankings / opponent championship history",
          "note": "UFC debut; future contender, not a ranked flyweight at the time."
        },
        {
          "fighter": "Natalia Silva",
          "fightId": "2022-11-19-tereza-bleda",
          "opponent": "Tereza Bleda",
          "date": "2022-11-19",
          "division": "Flyweight",
          "finalCredit": 0.2,
          "reviewStatus": "audited",
          "judgmentSource": "octagon-hq-v2-natalia-silva-20261027",
          "judgmentStatus": "research-verified",
          "provenance": "UFC result / UFC roster rankings / opponent championship history",
          "note": "Unbeaten debuting prospect; third-round spinning-back-kick stoppage."
        },
        {
          "fighter": "Natalia Silva",
          "fightId": "2023-05-20-victoria-leonardo",
          "opponent": "Victoria Leonardo",
          "date": "2023-05-20",
          "division": "Flyweight",
          "finalCredit": 0.2,
          "reviewStatus": "audited",
          "judgmentSource": "octagon-hq-v2-natalia-silva-20261027",
          "judgmentStatus": "research-verified",
          "provenance": "UFC result / UFC roster rankings / opponent championship history",
          "note": "UFC flyweight veteran; first-round stoppage, not an elite ranked win."
        },
        {
          "fighter": "Natalia Silva",
          "fightId": "2023-08-19-andrea-lee",
          "opponent": "Andrea Lee",
          "date": "2023-08-19",
          "division": "Flyweight",
          "finalCredit": 0.4,
          "reviewStatus": "audited",
          "judgmentSource": "octagon-hq-v2-natalia-silva-20261027",
          "judgmentStatus": "research-verified",
          "provenance": "UFC result / UFC roster rankings / opponent championship history",
          "note": "Experienced ranked fringe flyweight; unanimous shutout on all three cards."
        },
        {
          "fighter": "Natalia Silva",
          "fightId": "2024-02-03-viviane-araujo",
          "opponent": "Viviane Araujo",
          "date": "2024-02-03",
          "division": "Flyweight",
          "finalCredit": 0.65,
          "reviewStatus": "audited",
          "judgmentSource": "octagon-hq-v2-natalia-silva-20261027",
          "judgmentStatus": "research-verified",
          "provenance": "UFC result / UFC roster rankings / opponent championship history",
          "note": "Established ranked flyweight; unanimous decision with one lost round."
        },
        {
          "fighter": "Natalia Silva",
          "fightId": "2024-09-07-jessica-andrade",
          "opponent": "Jessica Andrade",
          "date": "2024-09-07",
          "division": "Flyweight",
          "finalCredit": 0.95,
          "reviewStatus": "audited",
          "judgmentSource": "octagon-hq-v2-natalia-silva-20261027",
          "judgmentStatus": "research-verified",
          "provenance": "UFC result / UFC roster rankings / opponent championship history",
          "note": "Former strawweight champion and highly ranked flyweight; 30-27 on every card."
        },
        {
          "fighter": "Natalia Silva",
          "fightId": "2025-05-10-alexa-grasso",
          "opponent": "Alexa Grasso",
          "date": "2025-05-10",
          "division": "Flyweight",
          "finalCredit": 1.05,
          "reviewStatus": "audited",
          "judgmentSource": "octagon-hq-v2-natalia-silva-20261027",
          "judgmentStatus": "research-verified",
          "provenance": "UFC result / UFC roster rankings / opponent championship history",
          "note": "Recent UFC flyweight champion; every round won on all three cards."
        },
        {
          "fighter": "Natalia Silva",
          "fightId": "2026-01-24-rose-namajunas",
          "opponent": "Rose Namajunas",
          "date": "2026-01-24",
          "division": "Flyweight",
          "finalCredit": 0.85,
          "reviewStatus": "audited",
          "judgmentSource": "octagon-hq-v2-natalia-silva-20261027",
          "judgmentStatus": "research-verified",
          "provenance": "UFC result / UFC roster rankings / opponent championship history",
          "note": "Two-time former strawweight champion; competitive 29-28 three times with substantial media disagreement."
        },
        {
          "fighter": "Natalia Silva",
          "fightId": "2026-10-03-wang-cong",
          "opponent": "Wang Cong",
          "date": "2026-10-03",
          "division": "Flyweight",
          "finalCredit": 0.8,
          "reviewStatus": "audited",
          "judgmentSource": "octagon-hq-v2-natalia-silva-20261027",
          "judgmentStatus": "research-verified",
          "provenance": "UFC result / UFC roster rankings / opponent championship history",
          "note": "No. 8 flyweight contender; vacant-title win by 48-47, 48-47, 49-46; no title defenses yet."
        }
      ]
    },
    "apex": {
      "fighter": "Natalia Silva",
      "performances": [
        {
          "fightId": "2024-09-07-jessica-andrade",
          "opponent": "Jessica Andrade",
          "date": "2024-09-07",
          "rating": 9.5
        },
        {
          "fightId": "2025-05-10-alexa-grasso",
          "opponent": "Alexa Grasso",
          "date": "2025-05-10",
          "rating": 9.4
        }
      ],
      "components": {
        "twoPerformanceStrength": 1.89,
        "proof": 1.15,
        "bestFighterClaim": 0.75,
        "aura": 0.65
      },
      "notes": "The one-sided former-champion shutouts best capture peak execution. 2026 Rose decision was genuinely close; first title win over No. 8 Wang does not yet prove a dominant multi-defense championship apex."
    }
  },
  "eraDepth": {
    "fighter": "Natalia Silva",
    "depthIndex": null,
    "approvedAdjustment": 0.18
  },
  "presentation": {
    "slug": "natalia-silva",
    "primaryDivision": "Flyweight",
    "secondaryDivision": null,
    "divisionLabel": "WFLW",
    "resumeTag": "UFC flyweight champion • 9-0 UFC • 0 defenses",
    "oneLiner": "Silva's explosive taekwondo footwork, sharp counters, and sudden angle changes powered a nine-fight unbeaten UFC ascent. She dismantled established champions in high-level striking battles, then claimed the vacant flyweight crown in 2026.",
    "whyRankedHere": "Silva entered the UFC in 2022 and won nine consecutive fights, defeating former champions Jessica Andrade, Alexa Grasso, and Rose Namajunas before capturing the vacant flyweight title against Wang Cong in October 2026. Her one-sided decisions over Andrade and Grasso established the technical level behind her undefeated run.",
    "whyNotHigher": "Her first title victory came against the eighth-ranked Wang Cong after Valentina Shevchenko vacated the belt, and she has yet to defend it. The Namajunas decision was competitive and heavily disputed by media, while nine UFC bouts cannot match the long championship reigns of the women above her.",
    "finalTakeaway": "A verified UFC flyweight champion with an unbeaten nine-fight UFC record and excellent former-champion wins; future title defenses—not hypothetical peak talent—must determine whether she approaches the division's all-time greats.",
    "keyJudgmentCalls": [
      "Only nine UFC bouts from June 2022 through October 3, 2026 are score-bearing; no regional fights.",
      "The open prime begins with a dominant undefeated UFC debut; no pre-prime UFC loss is erased.",
      "The one vacant-title victory earns 0.85 adjusted credit against the eighth-ranked challenger; zero defense credit.",
      "Opponent quality credits Grasso and Andrade's established former-champion status but discounts close Rose decision and No. 8 Wang; early unranked wins receive limited credit.",
      "Elite flyweight era multipliers follow the established women’s flyweight comparator; 0.18 era-depth adjustment matches Grasso's existing V2 calibration.",
      "Score and rank are derived by the current category calculators and ranking engine; no manual overall rating."
    ],
    "photoUrl": "assets/fighters/natalia-silva-spotlight.webp",
    "thumbUrl": "assets/fighters/natalia-silva-thumb.webp",
    "watchUrl": "https://youtube.com/shorts/TifIqSRo9_o?is=qzR-PQaz55qb05YI",
    "watchLabel": "Watch Moment",
    "signatureFightUrl": "https://youtu.be/E-UiQ6go8gg?is=akiwYYjzjt2EIfTo",
    "signatureFightLabel": "Signature Fight: Natalia Silva"
  }
} satisfies RankingInputFighter;
