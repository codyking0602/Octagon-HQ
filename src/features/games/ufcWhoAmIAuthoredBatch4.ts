import type { UfcWhoAmIAuthoredIdentity } from "./ufcWhoAmIAuthoredScripts";

/**
 * Static authored UFC Who Am I batch 4.
 * Source-backed at authoring time; runtime serves these clue strings verbatim.
 */
export const ufcWhoAmIAuthoredBatch4: readonly UfcWhoAmIAuthoredIdentity[] = [
  {
    "subjectId": "ufc:junior-dos-santos",
    "name": "Junior dos Santos",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/junior-dos-santos",
      "identity1": "https://www.sherdog.com/news/articles/Junior-dos-Santos-A-New-Chapter-103039",
      "identity2": "https://www.sherdog.com/news/articles/Junior-dos-Santos-A-New-Chapter-103039",
      "identity3": "https://jp.ufc.com/news/junior-cigano-esta-preparado-para-onde-quer-que-luta-va",
      "identity4": "https://jp.ufc.com/news/junior-cigano-esta-preparado-para-onde-quer-que-luta-va",
      "identity5": "https://www.sherdog.com/news/articles/Junior-dos-Santos-A-New-Chapter-103039"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-junior-dos-santos-a-1",
            "text": "I joined the UFC in 2008 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-2",
            "text": "My UFC debut ended with a win by stoppage.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-3",
            "text": "I spent most of my UFC career at Heavyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-4",
            "text": "I reached my first UFC title opportunity in 2011.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-5",
            "text": "I beat Stefan Struve by stoppage in 2009.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-6",
            "text": "I beat Blagoy Ivanov by decision in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-7",
            "text": "I lost to Jairzinho Rozenstruik by stoppage in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-8",
            "text": "I beat Mirko Cro Cop in 2009.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-9",
            "text": "I won UFC gold at Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-10",
            "text": "My UFC résumé includes a matchup against Cain Velasquez in 2011.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-junior-dos-santos-b-1",
            "text": "My UFC career began in 2008.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-3",
            "text": "One stretch of my UFC career reached 9 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-4",
            "text": "My first UFC title opportunity came after 7 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-5",
            "text": "I beat Gilbert Yvel by stoppage in 2010.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-6",
            "text": "I beat Tai Tuivasa by stoppage in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-7",
            "text": "I lost to Ciryl Gane by stoppage in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-8",
            "text": "I beat Gabriel Gonzaga by stoppage in 2010.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-9",
            "text": "My UFC career includes a championship victory at Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-10",
            "text": "One of my most recognizable UFC matchups came against Stipe Miocic in 2017.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:tyron-woodley",
    "name": "Tyron Woodley",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/tyron-woodley",
      "identity1": "https://www.ufc.com/news/tyron-woodley-fights-ferguson",
      "identity2": "https://www.ufc.com/athlete/tyron-woodley",
      "identity3": "https://www.ufc.com/athlete/tyron-woodley",
      "identity4": "https://www.ufc.com/athlete/tyron-woodley",
      "identity5": "https://www.stlmag.com/news/sports/q-a-with-tyron-woodlye-ufc-welterweight-champion/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-tyron-woodley-a-1",
            "text": "I earned a business degree at the University of Missouri and later pursued graduate work in public administration with a nonprofit focus.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-2",
            "text": "My UFC debut ended with a win by stoppage.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-3",
            "text": "I spent most of my UFC career at Welterweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-4",
            "text": "I reached my first UFC title opportunity in 2016.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-5",
            "text": "I beat Jay Hieron by stoppage in 2013.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-6",
            "text": "I beat Dong Hyun Kim by stoppage in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-7",
            "text": "I lost to Rory MacDonald by decision in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-8",
            "text": "I lost to Colby Covington by stoppage in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-9",
            "text": "I won UFC gold at Welterweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-10",
            "text": "I built an acting résumé alongside fighting, including an appearance in Straight Outta Compton and other film and television roles.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-tyron-woodley-b-1",
            "text": "My UFC career began in 2013.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-2",
            "text": "I won 2 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-3",
            "text": "One stretch of my UFC career reached 3 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-4",
            "text": "My first UFC title opportunity came after 7 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-5",
            "text": "I beat Josh Koscheck by stoppage in 2013.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-6",
            "text": "I lost to Jake Shields by decision in 2013.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-7",
            "text": "I lost to Gilbert Burns by decision in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-8",
            "text": "I lost to Vicente Luque by submission in 2021.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-9",
            "text": "My UFC career includes a championship victory at Welterweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-10",
            "text": "One of my most recognizable UFC matchups came against Robbie Lawler in 2016.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:alex-pantoja",
    "name": "Alexandre Pantoja",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/alex-pantoja",
      "identity1": "https://www.ufc.com/news/alexandre-pantoja-homecoming-king-champion-ufc-301",
      "identity2": "https://www.ufc.com/athlete/alexandre-pantoja",
      "identity3": "https://www.ufc.com/athlete/alexandre-pantoja",
      "identity4": "https://www.ufc.com/news/alexandre-pantoja-homecoming-king-champion-ufc-301",
      "identity5": "https://www.ufc.com/news/story-how-alexandre-pantoja-proved-who-he-was-ufc-296-flyweight"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-alex-pantoja-a-1",
            "text": "I joined the UFC in 2017 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-3",
            "text": "I spent most of my UFC career at Flyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-4",
            "text": "I reached my first UFC title opportunity in 2023.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-5",
            "text": "I beat Eric Shelton by decision in 2017.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-6",
            "text": "I beat Ulka Sasaki by submission in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-7",
            "text": "I beat Manel Kape by decision in 2021.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-8",
            "text": "I beat Wilson Reis by stoppage in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-9",
            "text": "I won UFC gold at Flyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-10",
            "text": "I grew up in Copacabana in modest circumstances and has described fighting from a young age as a possible route to a better life.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-alex-pantoja-b-1",
            "text": "My UFC career began in 2017.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-2",
            "text": "I won 2 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-3",
            "text": "One stretch of my UFC career reached 8 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-4",
            "text": "My first UFC title opportunity came after 12 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-5",
            "text": "I beat Neil Seery by submission in 2017.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-6",
            "text": "I beat Matt Schnell by stoppage in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-7",
            "text": "I lost to Dustin Ortiz by decision in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-8",
            "text": "I lost to Askar Askarov by decision in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-9",
            "text": "My UFC career includes a championship victory at Flyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-10",
            "text": "One of my most recognizable UFC matchups came against Brandon Royval in 2023.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:ilia-topuria",
    "name": "Ilia Topuria",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/ilia-topuria",
      "identity1": "https://www.ufc.com/athlete/ilia-topuria",
      "identity2": "https://www.ufc.com/athlete/ilia-topuria",
      "identity3": "https://www.ufc.com/athlete/ilia-topuria",
      "identity4": "https://www.ufc.com/athlete/ilia-topuria",
      "identity5": "https://www.ufc.com/news/ilia-topuria-world-know-his-name-vegas-16"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-ilia-topuria-a-1",
            "text": "I joined the UFC in 2020 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-3",
            "text": "My UFC career included appearances at both Featherweight and Lightweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-4",
            "text": "I reached my first UFC title opportunity in 2024.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-5",
            "text": "I beat Youssef Zalal by decision in 2020.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-6",
            "text": "I beat Ryan Hall by stoppage in 2021.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-7",
            "text": "I beat Bryce Mitchell by submission in 2022.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-8",
            "text": "I beat Charles Oliveira by stoppage in 2025.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-9",
            "text": "I won UFC championships in more than one weight class.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-10",
            "text": "My UFC résumé includes a matchup against Alexander Volkanovski in 2024.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-ilia-topuria-b-1",
            "text": "My UFC career began in 2020.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-3",
            "text": "One stretch of my UFC career reached 9 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-4",
            "text": "My first UFC title opportunity came after 6 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-5",
            "text": "I beat Damon Jackson by stoppage in 2020.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-6",
            "text": "I beat Jai Herbert by stoppage in 2022.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-7",
            "text": "I beat Josh Emmett by decision in 2023.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-8",
            "text": "I lost to Justin Gaethje in 2026.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-9",
            "text": "My UFC résumé includes championship victories in two weight classes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-10",
            "text": "One of my most recognizable UFC matchups came against Max Holloway in 2024.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:robert-whittaker",
    "name": "Robert Whittaker",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/robert-whittaker",
      "identity1": "https://www.ufc.com/athlete/robert-whittaker",
      "identity2": "https://www.ufc.com/athlete/robert-whittaker",
      "identity3": "https://www.ufc.com/athlete/robert-whittaker",
      "identity4": "https://www.ufc.com/athlete/robert-whittaker",
      "identity5": "https://www.ufc.com/athlete/robert-whittaker"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-robert-whittaker-a-1",
            "text": "I joined the UFC in 2012 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-3",
            "text": "My UFC career included appearances at both Middleweight and Welterweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-4",
            "text": "I reached my first UFC title opportunity in 2017.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-5",
            "text": "I lost to Court McGee by decision in 2013.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-6",
            "text": "I beat Colton Smith by stoppage in 2013.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-7",
            "text": "I beat Clint Hester by stoppage in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-8",
            "text": "I beat Ikram Aliskerov by stoppage in 2024.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-9",
            "text": "I won UFC gold at Middleweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-10",
            "text": "My UFC résumé includes a matchup against Israel Adesanya in 2019.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-robert-whittaker-b-1",
            "text": "My UFC career began in 2012.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-2",
            "text": "I won 2 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-3",
            "text": "One stretch of my UFC career reached 9 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-4",
            "text": "My first UFC title opportunity came after 11 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-5",
            "text": "I beat Brad Scott by decision in 2012.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-6",
            "text": "I beat Mike Rhodes by decision in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-7",
            "text": "I beat Rafael Natal by decision in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-8",
            "text": "I beat Brad Tavares by stoppage in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-9",
            "text": "My UFC career includes a championship victory at Middleweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-10",
            "text": "One of my most recognizable UFC matchups came against Israel Adesanya in 2022.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:chris-weidman",
    "name": "Chris Weidman",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/chris-weidman",
      "identity1": "https://jp.ufc.com/news/chris-weidman-ufc-career-highlights",
      "identity2": "https://www.ufc.com/news/introducing-chris-weidman",
      "identity3": "https://www.ufc.com/news/introducing-chris-weidman",
      "identity4": "https://jp.ufc.com/news/chris-weidman-ufc-career-highlights",
      "identity5": "https://www.ufc.com/news/introducing-chris-weidman"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-chris-weidman-a-1",
            "text": "I earned a bachelor's degree in psychology and later a master's degree in physical education at Hofstra.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-3",
            "text": "My UFC career included appearances at both Middleweight and Light Heavyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-4",
            "text": "I reached my first UFC title opportunity in 2013.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-5",
            "text": "I lost to Brad Tavares by decision in 2023.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-6",
            "text": "I beat Alessio Sakara by decision in 2011.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-7",
            "text": "I beat Tom Lawlor by submission in 2011.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-8",
            "text": "I lost to Uriah Hall in 2021.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-9",
            "text": "I won UFC gold at Middleweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-10",
            "text": "My UFC résumé includes a matchup against Anderson Silva in 2013.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-chris-weidman-b-1",
            "text": "My UFC career began in 2011.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-3",
            "text": "One stretch of my UFC career reached 9 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-4",
            "text": "My first UFC title opportunity came after 5 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-5",
            "text": "I lost to Eryk Anders by stoppage in 2024.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-6",
            "text": "I beat Jesse Bongfeldt by submission in 2011.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-7",
            "text": "I beat Bruno Silva by decision in 2024.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-8",
            "text": "I beat Omari Akhmedov by decision in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-9",
            "text": "My UFC career includes a championship victory at Middleweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-10",
            "text": "One of my most recognizable UFC matchups came against Anderson Silva in 2013.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:sean-strickland",
    "name": "Sean Strickland",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/sean-strickland",
      "identity1": "https://www.ufc.com/athlete/sean-strickland",
      "identity2": "https://www.ufc.com/athlete/sean-strickland",
      "identity3": "https://www.ufc.com/news/sean-strickland-all-about-life-ufc-vegas-25",
      "identity4": "https://www.ufc.com/athlete/sean-strickland",
      "identity5": "https://www.ufc.com/athlete/sean-strickland"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-sean-strickland-a-1",
            "text": "I joined the UFC in 2014 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-2",
            "text": "My UFC debut ended with a win by submission.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-3",
            "text": "My UFC career included appearances at both Middleweight and Welterweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-4",
            "text": "I reached my first UFC title opportunity in 2023.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-5",
            "text": "I beat Bubba McDaniel by submission in 2014.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-6",
            "text": "I beat Jack Marshman by decision in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-7",
            "text": "I beat Alex Garcia by stoppage in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-8",
            "text": "I beat Nordine Taleb by stoppage in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-9",
            "text": "I won UFC gold at Middleweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-10",
            "text": "My UFC résumé includes a matchup against Israel Adesanya in 2023.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-sean-strickland-b-1",
            "text": "My UFC career began in 2014.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-2",
            "text": "I won 2 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-3",
            "text": "One stretch of my UFC career reached 6 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-4",
            "text": "My first UFC title opportunity came after 19 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-5",
            "text": "I beat Igor Araujo by decision in 2015.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-6",
            "text": "I beat Luke Barnatt by decision in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-7",
            "text": "I beat Court McGee by decision in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-8",
            "text": "I beat Krzysztof Jotko by decision in 2021.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-9",
            "text": "My UFC career includes a championship victory at Middleweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-10",
            "text": "One of my most recognizable UFC matchups came against Khamzat Chimaev in 2026.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:brandon-moreno",
    "name": "Brandon Moreno",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/brandon-moreno",
      "identity1": "https://www.espn.com/mma/story/_/id/30491475/ufc-270-family-pinata-business-ufc-record-book-brandon-moreno-historic-title-quest",
      "identity2": "https://www.espn.com/mma/story/_/id/30491475/ufc-270-family-pinata-business-ufc-record-book-brandon-moreno-historic-title-quest",
      "identity3": "https://www.ufc.com/news/moreno-reaching-next-level-second-ufc-stint",
      "identity4": "https://www.espn.com/mma/story/_/id/30491475/ufc-270-family-pinata-business-ufc-record-book-brandon-moreno-historic-title-quest",
      "identity5": "https://www.ufc.com/news/brandon-moreno-putting-all-his-heart-fight-ufc-mexico-city-flyweight"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-brandon-moreno-a-1",
            "text": "I joined the UFC in 2016 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-2",
            "text": "My UFC debut ended with a win by submission.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-3",
            "text": "I spent most of my UFC career at Flyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-4",
            "text": "I reached my first UFC title opportunity in 2020.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-5",
            "text": "I beat Ryan Benoit by decision in 2016.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-6",
            "text": "I beat Dustin Ortiz by submission in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-7",
            "text": "I lost to Lone’er Kavanagh by decision in 2026.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-8",
            "text": "I beat Brandon Royval by stoppage in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-9",
            "text": "I won UFC gold at Flyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-10",
            "text": "My UFC résumé includes a matchup against Deiveson Figueiredo in 2021.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-brandon-moreno-b-1",
            "text": "My UFC career began in 2016.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-3",
            "text": "One stretch of my UFC career reached 3 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-4",
            "text": "My first UFC title opportunity came after 9 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-5",
            "text": "I beat Louis Smolka by submission in 2016.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-6",
            "text": "I fought Askar Askarov in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-7",
            "text": "I beat Kai Kara-France by decision in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-8",
            "text": "I beat Steve Erceg by decision in 2025.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-9",
            "text": "My UFC career includes a championship victory at Flyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-10",
            "text": "One of my most recognizable UFC matchups came against Deiveson Figueiredo in 2023.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:rashad-evans",
    "name": "Rashad Evans",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/rashad-evans",
      "identity1": "https://www.ufc.com/news/ufc-legend-rashad-evans-retires?language_content_entity=en",
      "identity2": "https://www.ufc.com/news/ufc-legend-rashad-evans-retires?language_content_entity=en",
      "identity3": "https://www.ufc.com/news/ufc-legend-rashad-evans-retires?language_content_entity=en",
      "identity4": "https://www.ufc.com/news/ufc-legend-rashad-evans-retires?language_content_entity=en",
      "identity5": "https://www.ufc.com/news/rashad-evans-risked-it-all-tuf"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-rashad-evans-a-1",
            "text": "I joined the UFC in 2005 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-3",
            "text": "My UFC career included appearances at both Light Heavyweight and Heavyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-4",
            "text": "I reached my first UFC title opportunity in 2008.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-5",
            "text": "I lost to Daniel Kelly by decision in 2017.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-6",
            "text": "I beat Brad Imes by decision in 2005.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-7",
            "text": "I beat Stephan Bonnar by decision in 2006.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-8",
            "text": "I beat Sean Salmon by stoppage in 2007.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-9",
            "text": "I won UFC gold at Light Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-10",
            "text": "My UFC résumé includes a matchup against Jon Jones in 2012.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-rashad-evans-b-1",
            "text": "My UFC career began in 2005.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-3",
            "text": "One stretch of my UFC career reached 5 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-4",
            "text": "My first UFC title opportunity came after 8 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-5",
            "text": "I lost to Sam Alvey by decision in 2017.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-6",
            "text": "I beat Sam Hoger by decision in 2006.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-7",
            "text": "I beat Jason Lambert by stoppage in 2006.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-8",
            "text": "I lost to Antônio Rogério Nogueira by decision in 2013.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-9",
            "text": "My UFC career includes a championship victory at Light Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-10",
            "text": "One of my most recognizable UFC matchups came against Forrest Griffin in 2008.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:dominick-cruz",
    "name": "Dominick Cruz",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/dominick-cruz",
      "identity1": "https://www.ufc.com/athlete/dominick-cruz",
      "identity2": "https://www.ufc.com/athlete/dominick-cruz",
      "identity3": "https://www.ufc.com/news/dominick-cruz-named-ufc-hall-fame-class-2026",
      "identity4": "https://www.ufc.com/news/dominick-cruz-comeback-begins-again",
      "identity5": "https://www.ufc.com/news/dominick-cruz-named-ufc-hall-fame-class-2026"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-dominick-cruz-a-1",
            "text": "I joined the UFC in 2011 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-3",
            "text": "I spent most of my UFC career at Bantamweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-4",
            "text": "I reached my first UFC title opportunity in 2011.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-5",
            "text": "I beat Casey Kenney by decision in 2021.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-6",
            "text": "I lost to Marlon Vera by stoppage in 2022.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-7",
            "text": "I beat Urijah Faber by decision in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-8",
            "text": "I beat Urijah Faber by decision in 2011.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-9",
            "text": "I won UFC gold at Bantamweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-10",
            "text": "My UFC résumé includes a matchup against Demetrious Johnson in 2011.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-dominick-cruz-b-1",
            "text": "My UFC career began in 2011.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-3",
            "text": "One stretch of my UFC career reached 5 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-4",
            "text": "My first UFC title opportunity came after 0 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-5",
            "text": "I beat Pedro Munhoz by decision in 2021.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-6",
            "text": "I beat Takeya Mizugaki by stoppage in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-7",
            "text": "I lost to Cody Garbrandt by decision in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-8",
            "text": "I lost to Henry Cejudo by stoppage in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-9",
            "text": "My UFC career includes a championship victory at Bantamweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-10",
            "text": "One of my most recognizable UFC matchups came against T.J. Dillashaw in 2016.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:michael-bisping",
    "name": "Michael Bisping",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/michael-bisping",
      "identity1": "https://www.ufc.com/news/few-have-done-it-better-bisping",
      "identity2": "https://www.ufc.com/news/michael-bisping-giving-fans-what-they-came-see",
      "identity3": "https://www.ufc.com/news/grounded-kennedy-outpoints-bisping",
      "identity4": "https://www.ufc.com/news/bisping-headlines-2019-ufc-hall-fame-class",
      "identity5": "https://www.ufc.com/news/bisping-headlines-2019-ufc-hall-fame-class"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-michael-bisping-a-1",
            "text": "I joined the UFC in 2006 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-2",
            "text": "My UFC debut ended with a win by stoppage.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-3",
            "text": "My UFC career included appearances at both Middleweight and Light Heavyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-4",
            "text": "I reached my first UFC title opportunity in 2016.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-5",
            "text": "I beat Josh Haynes by stoppage in 2006.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-6",
            "text": "I beat Elvis Sinosic by stoppage in 2007.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-7",
            "text": "I beat Jason Day by stoppage in 2008.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-8",
            "text": "I beat Denis Kang by stoppage in 2009.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-9",
            "text": "I won UFC gold at Middleweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-10",
            "text": "My UFC résumé includes a matchup against Georges St-Pierre in 2017.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-michael-bisping-b-1",
            "text": "My UFC career began in 2006.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-3",
            "text": "One stretch of my UFC career reached 5 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-4",
            "text": "My first UFC title opportunity came after 25 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-5",
            "text": "I beat Eric Schafer by stoppage in 2006.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-6",
            "text": "I beat Charles McCarthy by stoppage in 2008.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-7",
            "text": "I beat Chris Leben by decision in 2008.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-8",
            "text": "I beat Dan Miller by decision in 2010.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-9",
            "text": "My UFC career includes a championship victory at Middleweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-10",
            "text": "One of my most recognizable UFC matchups came against Luke Rockhold in 2016.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          }
        ]
      }
    }
  }
];
