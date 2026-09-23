import type { UfcWhoAmIAuthoredIdentity } from "./ufcWhoAmIAuthoredScripts";

/**
 * Static authored UFC Who Am I batch 1.
 * Source-backed at authoring time; runtime serves these clue strings verbatim.
 */
export const ufcWhoAmIAuthoredBatch1: readonly UfcWhoAmIAuthoredIdentity[] = [
  {
    "subjectId": "ufc:jon-jones",
    "name": "Jon Jones",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/jon-jones",
      "identity1": "https://www.ufc.com/athlete/jon-jones",
      "identity2": "https://www.ufc.com/athlete/jon-jones",
      "identity3": "https://www.ufc.com/athlete/jon-jones?language_content_entity=en&page=1",
      "identity4": "https://www.ufc.com/athlete/jon-jones?language_content_entity=en&page=1",
      "identity5": "https://www.ufc.com/athlete/jon-jones?language_content_entity=en&page=1"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-jon-jones-a-1",
            "text": "At Iowa Central Community College, I won a JUCO national wrestling championship and earned an associate degree.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-jon-jones-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-jon-jones-a-3",
            "text": "My UFC career included appearances at both Light Heavyweight and Heavyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-jon-jones-a-4",
            "text": "I reached my first UFC title opportunity in 2011.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-jon-jones-a-5",
            "text": "I lost to Matt Hamill in 2009.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jon-jones-a-6",
            "text": "I beat Stephan Bonnar by decision in 2009.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jon-jones-a-7",
            "text": "I beat Brandon Vera by stoppage in 2010.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jon-jones-a-8",
            "text": "I beat Ryan Bader by submission in 2011.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jon-jones-a-9",
            "text": "I won UFC championships in more than one weight class.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-jon-jones-a-10",
            "text": "My UFC résumé includes a matchup against Stipe Miocic in 2024.",
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
            "id": "ufc-jon-jones-b-1",
            "text": "My UFC career began in 2008.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-jon-jones-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-jon-jones-b-3",
            "text": "One stretch of my UFC career reached 13 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-jon-jones-b-4",
            "text": "My first UFC title opportunity came after 7 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-jon-jones-b-5",
            "text": "I beat Andre Gusmao by decision in 2008.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jon-jones-b-6",
            "text": "I beat Jake O'Brien by submission in 2009.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jon-jones-b-7",
            "text": "I beat Vladimir Matyushenko by stoppage in 2010.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jon-jones-b-8",
            "text": "I beat Ovince Saint Preux by decision in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jon-jones-b-9",
            "text": "My UFC résumé includes championship victories in two weight classes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-jon-jones-b-10",
            "text": "I also shared the Octagon with Daniel Cormier in 2017.",
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
    "subjectId": "ufc:tj-dillashaw",
    "name": "T.J. Dillashaw",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/tj-dillashaw",
      "identity1": "https://www.ufc.com/news/dillashaw-visits-raiders-headquarters-road-ufc-177",
      "identity2": "https://www.ufc.com/athlete/tj-dillashaw",
      "identity3": "https://www.ufc.com/athlete/tj-dillashaw",
      "identity4": "https://www.ufc.com/athlete/tj-dillashaw",
      "identity5": "https://www.ufc.com/news/dillashaw-sets-training-camps-colorado"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-tj-dillashaw-a-1",
            "text": "I wrestled at Cal State Fullerton and earned a degree in kinesiology with an emphasis in clinical exercise science.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-2",
            "text": "My UFC debut ended with a loss by stoppage.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-3",
            "text": "My UFC career included appearances at both Bantamweight and Flyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-4",
            "text": "I reached my first UFC title opportunity in 2014.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-5",
            "text": "I beat Walel Watson by decision in 2012.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-6",
            "text": "I beat Issei Tamura by stoppage in 2013.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-7",
            "text": "I beat Mike Easton by decision in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-8",
            "text": "I lost to Raphael Assuncao by decision in 2013.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-9",
            "text": "I won UFC gold at Bantamweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-10",
            "text": "I grew up in a devoted Raiders family and played football in Pop Warner and high school, lining up at running back, cornerback and linebacker before focusing on wrestling.",
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
            "id": "ufc-tj-dillashaw-b-1",
            "text": "I entered the UFC through a season of The Ultimate Fighter.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-2",
            "text": "I won 2 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-3",
            "text": "One stretch of my UFC career reached 4 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-4",
            "text": "My first UFC title opportunity came after 7 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-5",
            "text": "I beat Vaughan Lee by submission in 2012.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-6",
            "text": "I beat Hugo Viana by stoppage in 2013.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-7",
            "text": "I lost to John Dodson by stoppage in 2011.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-8",
            "text": "I beat Raphael Assuncao by decision in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-9",
            "text": "My UFC career includes a championship victory at Bantamweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-10",
            "text": "I also shared the Octagon with Henry Cejudo in 2019.",
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
    "subjectId": "ufc:francis-ngannou",
    "name": "Francis Ngannou",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/francis-ngannou",
      "identity1": "https://espnpressroom.com/feature/three-things-to-know-about-the-making-of-espn-cover-story-francis-ngannou/",
      "identity2": "https://www.espn.com/espn/feature/story/_/id/33100543/francis-ngannou-miraculous-journey-ufc-stardom",
      "identity3": "https://www.espn.com/espn/feature/story/_/id/33100543/francis-ngannou-miraculous-journey-ufc-stardom",
      "identity4": "https://www.espn.com/espn/feature/story/_/id/33100543/francis-ngannou-miraculous-journey-ufc-stardom",
      "identity5": "https://www.ufc.com/news/ufc-francis-ngannou-laying-foundation-his-people-cameroon"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-francis-ngannou-a-1",
            "text": "I joined the UFC in 2015 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-2",
            "text": "My UFC debut ended with a win by stoppage.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-3",
            "text": "I spent most of my UFC career at Heavyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-4",
            "text": "I reached my first UFC title opportunity in 2018.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-5",
            "text": "I beat Luis Henrique by stoppage in 2015.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-6",
            "text": "I beat Anthony Hamilton by submission in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-7",
            "text": "I beat Andrei Arlovski by stoppage in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-8",
            "text": "I beat Alistair Overeem by stoppage in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-9",
            "text": "I won UFC gold at Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-10",
            "text": "I began working in a sand mine in Cameroon at about nine years old.",
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
            "id": "ufc-francis-ngannou-b-1",
            "text": "My UFC career began in 2015.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-3",
            "text": "One stretch of my UFC career reached 6 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-4",
            "text": "My first UFC title opportunity came after 6 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-5",
            "text": "I beat Bojan Mihajlovic by stoppage in 2016.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-6",
            "text": "I beat Curtis Blaydes in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-7",
            "text": "I lost to Derrick Lewis by decision in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-8",
            "text": "I beat Curtis Blaydes by stoppage in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-9",
            "text": "My UFC career includes a championship victory at Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-10",
            "text": "I also shared the Octagon with Stipe Miocic in 2018.",
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
    "subjectId": "ufc:aljamain-sterling",
    "name": "Aljamain Sterling",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/aljamain-sterling",
      "identity1": "https://www.ufc.com/athlete/aljamain-sterling",
      "identity2": "https://www.ufc.com/athlete/aljamain-sterling",
      "identity3": "https://www.ufc.com/athlete/aljamain-sterling",
      "identity4": "https://www.ufc.com/athlete/aljamain-sterling",
      "identity5": "https://www.ufc.com/athlete/aljamain-sterling"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-aljamain-sterling-a-1",
            "text": "I became a two-time NCAA Division III All-American wrestler at SUNY Cortland.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-3",
            "text": "My UFC career included appearances at both Bantamweight and Featherweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-4",
            "text": "I reached my first UFC title opportunity in 2021.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-5",
            "text": "I beat Cody Gibson by decision in 2014.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-6",
            "text": "I beat Manny Gamburyan by decision in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-7",
            "text": "I beat Johnny Eduardo by submission in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-8",
            "text": "I beat Cody Stamann by submission in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-9",
            "text": "I won UFC gold at Bantamweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-10",
            "text": "After initially studying accounting at SUNY Morrisville, I transferred to SUNY Cortland and earned a bachelor's degree in physical education.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-aljamain-sterling-b-1",
            "text": "Before fighting full time, I sold shoes at Saks Fifth Avenue and later cut hair at school to help make money.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-3",
            "text": "One stretch of my UFC career reached 9 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-4",
            "text": "My first UFC title opportunity came after 15 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-5",
            "text": "I beat Hugo Viana by stoppage in 2014.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-6",
            "text": "I beat Augusto Mendes by decision in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-7",
            "text": "I beat Brett Johns by decision in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-8",
            "text": "I lost to Bryan Caraway by decision in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-9",
            "text": "My UFC career includes a championship victory at Bantamweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-10",
            "text": "I also shared the Octagon with Petr Yan in 2021.",
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
    "subjectId": "ufc:justin-gaethje",
    "name": "Justin Gaethje",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/justin-gaethje",
      "identity1": "https://www.espn.com/mma/story/_/id/29133514/ufc-274-justin-gaethje-journey-mining-town-mma-stardom",
      "identity2": "https://us.ufcespanol.com/athlete/justin-gaethje",
      "identity3": "https://us.ufcespanol.com/athlete/justin-gaethje",
      "identity4": "https://us.ufcespanol.com/athlete/justin-gaethje",
      "identity5": "https://www.sherdog.com/news/news/Justin-Gaethje-Reveals-Origins-of-The-Highlight-Nickname-199769"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-justin-gaethje-a-1",
            "text": "Before MMA, I wrestled at the University of Northern Colorado and became an NCAA Division I All-American.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-2",
            "text": "My UFC debut ended with a win by stoppage.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-3",
            "text": "I spent most of my UFC career at Lightweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-4",
            "text": "I reached my first UFC title opportunity in 2020.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-5",
            "text": "I beat James Vick by stoppage in 2018.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-6",
            "text": "I beat Edson Barboza by stoppage in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-7",
            "text": "I beat Rafael Fiziev by decision in 2025.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-8",
            "text": "I beat Michael Chandler by decision in 2021.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-9",
            "text": "I won UFC gold at Lightweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-10",
            "text": "My UFC résumé includes a matchup against Khabib Nurmagomedov in 2020.",
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
            "id": "ufc-justin-gaethje-b-1",
            "text": "My UFC career began in 2017.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-2",
            "text": "I won 1 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-3",
            "text": "One stretch of my UFC career reached 4 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-4",
            "text": "My first UFC title opportunity came after 6 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-5",
            "text": "I beat Michael Johnson by stoppage in 2017.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-6",
            "text": "I beat Donald Cerrone by stoppage in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-7",
            "text": "I lost to Eddie Alvarez by stoppage in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-8",
            "text": "I beat Rafael Fiziev by decision in 2023.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-9",
            "text": "My UFC career includes a championship victory at Lightweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-10",
            "text": "I also shared the Octagon with Ilia Topuria in 2026.",
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
    "subjectId": "ufc:dustin-poirier",
    "name": "Dustin Poirier",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/dustin-poirier",
      "identity1": "https://www.ufc.com/news/dustin-poiriers-education-through-fire",
      "identity2": "https://www.ufc.com/news/shine-diamond-poirier",
      "identity3": "https://www.ufc.com/news/dustin-poirier-the-good-fight-foundation",
      "identity4": "https://www.ufc.com/athlete/dustin-poirier",
      "identity5": "https://www.ufc.com/news/ufc-and-mma-fan-favorite-dustin-diamond-poirier-announce-marketing-partnership-ufc-281?language_content_entity=en"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-dustin-poirier-a-1",
            "text": "I left school in the ninth grade and has spoken openly about spending time in juvenile detention before finding direction through fighting.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-3",
            "text": "My UFC career included appearances at both Lightweight and Featherweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-4",
            "text": "I reached my first UFC title opportunity in 2019.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-5",
            "text": "I beat Jason Young by decision in 2011.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-6",
            "text": "I beat Jonathan Brookins by submission in 2012.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-7",
            "text": "I beat Akira Corassani by stoppage in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-8",
            "text": "I beat Carlos Diego Ferreira by stoppage in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-9",
            "text": "I won UFC gold at Lightweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-10",
            "text": "My early professional rise in Louisiana was prominently documented in the 2011 documentary Fightville.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-dustin-poirier-b-1",
            "text": "My UFC career began in 2011.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-3",
            "text": "One stretch of my UFC career reached 4 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-4",
            "text": "My first UFC title opportunity came after 21 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-5",
            "text": "I beat Pablo Garza by submission in 2011.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-6",
            "text": "I beat Diego Brandao by stoppage in 2013.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-7",
            "text": "I beat Yancy Medeiros by stoppage in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-8",
            "text": "I beat Joseph Duffy by decision in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-9",
            "text": "My UFC career includes a championship victory at Lightweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-10",
            "text": "I also shared the Octagon with Islam Makhachev in 2024.",
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
    "subjectId": "ufc:tito-ortiz",
    "name": "Tito Ortiz",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/tito-ortiz",
      "identity1": "https://www.ufc.com/news/ortiz-chronicles-early-years",
      "identity2": "https://www.ufc.com/news/ortiz-chronicles-early-years",
      "identity3": "https://www.ufc.com/news/origins-champ-tito-ortiz?language_content_entity=en",
      "identity4": "https://www.ufc.com/news/origins-champ-tito-ortiz?language_content_entity=en",
      "identity5": "https://www.ufc.com/news/ortiz-chronicles-early-years"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-tito-ortiz-a-1",
            "text": "Before becoming a UFC name, I gained early no-holds-barred experience by training with another established fighter from my area.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-2",
            "text": "My UFC debut ended with a win by stoppage.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-3",
            "text": "My UFC career included appearances at both Light Heavyweight and Heavyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-4",
            "text": "I reached my first UFC title opportunity in 1999.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-5",
            "text": "I lost to Guy Mezger by submission in 1997.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-6",
            "text": "I beat Jerry Bohlander by stoppage in 1998.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-7",
            "text": "I beat Ken Shamrock by stoppage in 2006.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-8",
            "text": "I lost to Matt Hamill by decision in 2010.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-9",
            "text": "I won UFC gold at Light Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-10",
            "text": "My UFC résumé includes a matchup against Randy Couture in 2003.",
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
            "id": "ufc-tito-ortiz-b-1",
            "text": "My UFC career began in 1997.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-2",
            "text": "I won 2 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-3",
            "text": "One stretch of my UFC career reached 6 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-4",
            "text": "My first UFC title opportunity came after 4 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-5",
            "text": "I beat Wes Albritton by stoppage in 1997.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-6",
            "text": "A separate chapter of my UFC run came in the Light Heavyweight division.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-7",
            "text": "I beat Patrick Cote by decision in 2004.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-8",
            "text": "I lost to Antonio Rogerio Nogueira by stoppage in 2011.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-9",
            "text": "My UFC career includes a championship victory at Light Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-10",
            "text": "I also shared the Octagon with Chuck Liddell in 2006.",
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
    "subjectId": "ufc:robbie-lawler",
    "name": "Robbie Lawler",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/robbie-lawler",
      "identity1": "https://www.ufc.com/news/robbie-lawler-his-own-words",
      "identity2": "https://www.ufc.com/news/robbie-lawler-his-own-words",
      "identity3": "https://www.ufc.com/news/robbie-lawler-named-ufc-hall-fame-class-2025",
      "identity4": "https://www.ufc.com/news/rob-ruthless-coaching-journey",
      "identity5": "https://www.ufc.com/news/rob-ruthless-coaching-journey"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-robbie-lawler-a-1",
            "text": "I joined the UFC in 2002 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-3",
            "text": "My UFC career included appearances at both Welterweight and Middleweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-4",
            "text": "I reached my first UFC title opportunity in 2014.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-5",
            "text": "I fought Steve Berger in 2002.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-6",
            "text": "I beat Nick Diaz by stoppage in 2021.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-7",
            "text": "I lost to Bryan Barberena by stoppage in 2022.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-8",
            "text": "I beat Aaron Riley by decision in 2002.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-9",
            "text": "I won UFC gold at Welterweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-10",
            "text": "I moved from San Diego to Bettendorf, Iowa as a child and later competed in both wrestling and football there.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-robbie-lawler-b-1",
            "text": "My UFC career began in 2002.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-2",
            "text": "I won 2 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-3",
            "text": "One stretch of my UFC career reached 5 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-4",
            "text": "My first UFC title opportunity came after 10 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-5",
            "text": "I beat Tiki Ghosn by stoppage in 2002.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-6",
            "text": "I lost to Pete Spratt by stoppage in 2003.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-7",
            "text": "I lost to Santiago Ponzinibbio by stoppage in 2022.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-8",
            "text": "I beat Chris Lytle by decision in 2003.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-9",
            "text": "My UFC career includes a championship victory at Welterweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-10",
            "text": "I also shared the Octagon with Johny Hendricks in 2014.",
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
    "subjectId": "ufc:henry-cejudo",
    "name": "Henry Cejudo",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/henry-cejudo",
      "identity1": "https://www.ufc.com/news/henry-cejudo-enters-national-wrestling-hall-fame-saturday",
      "identity2": "https://www.ufc.com/news/henry-cejudo-enters-national-wrestling-hall-fame-saturday",
      "identity3": "https://www.ufc.com/athlete/henry-cejudo",
      "identity4": "https://www.teamusa.com/profiles/henry-cejudo",
      "identity5": "https://www.ufc.com/news/henry-cejudo-triple-c-last-dance-ufc-323"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-henry-cejudo-a-1",
            "text": "I have described growing up in a low-income, welfare-dependent household in Phoenix where basic necessities could be difficult to secure.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-3",
            "text": "My UFC career included appearances at both Flyweight and Bantamweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-4",
            "text": "I reached my first UFC title opportunity in 2016.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-5",
            "text": "I beat Dustin Kimura by decision in 2014.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-6",
            "text": "I beat Chico Camus by decision in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-7",
            "text": "I beat Wilson Reis by stoppage in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-8",
            "text": "I lost to Joseph Benavidez by decision in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-9",
            "text": "I won UFC championships in more than one weight class.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-10",
            "text": "At 21, I became the youngest American wrestler at the time to win an Olympic freestyle wrestling gold medal.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-henry-cejudo-b-1",
            "text": "My UFC career began in 2014.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-3",
            "text": "One stretch of my UFC career reached 6 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-4",
            "text": "My first UFC title opportunity came after 4 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-5",
            "text": "I lost to Payton Talbott by decision in 2025.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-6",
            "text": "I beat Chris Cariaso by decision in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-7",
            "text": "I beat Sergio Pettis by decision in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-8",
            "text": "I lost to Song Yadong by decision in 2025.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-9",
            "text": "My UFC résumé includes championship victories in two weight classes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-10",
            "text": "I also competed in amateur boxing and won an Arizona Bronze Gloves championship before fully committing to MMA.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:petr-yan",
    "name": "Petr Yan",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/petr-yan",
      "identity1": "https://www.ufc.com/athlete/petr-yan?page=1",
      "identity2": "https://www.ufc.com/athlete/petr-yan?page=1",
      "identity3": "https://www.ufc.com/athlete/petr-yan?page=1",
      "identity4": "https://www.ufc.com/athlete/petr-yan?page=1",
      "identity5": "https://www.ufc.com/news/yan-lives-his-nickname"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-petr-yan-a-1",
            "text": "I began boxing at 13 and did not transition into MMA until roughly seven years later.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-petr-yan-a-2",
            "text": "My UFC debut ended with a win by stoppage.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-petr-yan-a-3",
            "text": "I spent most of my UFC career at Bantamweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-petr-yan-a-4",
            "text": "I reached my first UFC title opportunity in 2020.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-petr-yan-a-5",
            "text": "I beat Teruto Ishihara by stoppage in 2018.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-a-6",
            "text": "I beat Douglas Silva de Andrade by stoppage in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-a-7",
            "text": "I beat John Dodson by decision in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-a-8",
            "text": "I beat Jimmie Rivera by decision in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-a-9",
            "text": "I won UFC gold at Bantamweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-petr-yan-a-10",
            "text": "I spent five years at an athletic institute and specialized in training to become a youth boxing coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-petr-yan-b-1",
            "text": "I have described a three-session daily training structure: strength and conditioning in the morning, sparring in the afternoon, and technical drilling in the evening.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-petr-yan-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-petr-yan-b-3",
            "text": "One stretch of my UFC career reached 7 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-petr-yan-b-4",
            "text": "My first UFC title opportunity came after 6 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-petr-yan-b-5",
            "text": "I beat Jin Soo Son by decision in 2018.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-b-6",
            "text": "I beat Marcus McGhee by decision in 2025.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-b-7",
            "text": "I beat Urijah Faber by stoppage in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-b-8",
            "text": "I beat Song Yadong by decision in 2024.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-b-9",
            "text": "My UFC career includes a championship victory at Bantamweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-petr-yan-b-10",
            "text": "I also shared the Octagon with Aljamain Sterling in 2022.",
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
    "subjectId": "ufc:lyoto-machida",
    "name": "Lyoto Machida",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/lyoto-machida",
      "identity1": "https://www.ufc.com/news/complete-machida",
      "identity2": "https://www.ufc.com/news/complete-machida",
      "identity3": "https://www.ufc.com/news/complete-machida",
      "identity4": "https://www.ufc.com/news/complete-machida",
      "identity5": "https://www.ufc.com/news/complete-machida"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-lyoto-machida-a-1",
            "text": "I completed a college degree in physical education while pursuing combat-sports training.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-3",
            "text": "My UFC career included appearances at both Light Heavyweight and Middleweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-4",
            "text": "I reached my first UFC title opportunity in 2009.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-5",
            "text": "I beat Sam Hoger by decision in 2007.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-6",
            "text": "I beat Kazuhiro Nakamura by decision in 2007.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-7",
            "text": "I beat Eryk Anders by decision in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-8",
            "text": "I beat Vitor Belfort by stoppage in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-9",
            "text": "I won UFC gold at Light Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-10",
            "text": "My UFC résumé includes a matchup against Jon Jones in 2011.",
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
            "id": "ufc-lyoto-machida-b-1",
            "text": "My UFC career began in 2007.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-3",
            "text": "One stretch of my UFC career reached 8 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-4",
            "text": "My first UFC title opportunity came after 6 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-5",
            "text": "I beat David Heath by decision in 2007.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-6",
            "text": "I beat C.B. Dollaway by stoppage in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-7",
            "text": "I lost to Derek Brunson by stoppage in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-8",
            "text": "I beat Rameau Thierry Sokoudjou by submission in 2007.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-9",
            "text": "My UFC career includes a championship victory at Light Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-10",
            "text": "I also shared the Octagon with Rashad Evans in 2009.",
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
