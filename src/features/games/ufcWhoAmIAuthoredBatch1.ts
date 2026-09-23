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
            "text": "I won a junior-college national wrestling championship before committing fully to mixed martial arts.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-jon-jones-a-2",
            "text": "I entered the UFC in 2008, less than a year after beginning my professional MMA career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "ledger"
            ]
          },
          {
            "id": "ufc-jon-jones-a-3",
            "text": "My first seven UFC appearances produced six victories and one disqualification loss.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-jon-jones-a-4",
            "text": "I reached my first UFC championship fight while still only 23 years old.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "ledger"
            ]
          },
          {
            "id": "ufc-jon-jones-a-5",
            "text": "I submitted Ryan Bader to earn the title opportunity that changed my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jon-jones-a-6",
            "text": "I stopped Mauricio Rua to become the youngest champion in UFC history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "ledger"
            ]
          },
          {
            "id": "ufc-jon-jones-a-7",
            "text": "My first title reign included defenses against Quinton Jackson, Lyoto Machida, Rashad Evans and Vitor Belfort.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jon-jones-a-8",
            "text": "A later championship rivalry with Daniel Cormier produced two of the most recognizable fights of my era.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jon-jones-a-9",
            "text": "After years away from competition, I returned at heavyweight and submitted Ciryl Gane to win a second UFC divisional title.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jon-jones-a-10",
            "text": "I later defended that heavyweight championship by stopping former champion Stipe Miocic.",
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
            "text": "I did not begin training in mixed martial arts until 2007, after college wrestling had already been part of my athletic path.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-jon-jones-b-2",
            "text": "I won a junior-college wrestling national title and also completed an associate degree.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-jon-jones-b-3",
            "text": "Early in my development, I used online videos to study and pick up unconventional techniques.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-jon-jones-b-4",
            "text": "My only official UFC loss came by disqualification in a fight I had otherwise been controlling.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jon-jones-b-5",
            "text": "Four straight UFC wins after that disqualification put me on the doorstep of a championship opportunity.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-jon-jones-b-6",
            "text": "On the day I fought for my first UFC title, my coaches and I helped detain a man we saw breaking into a car.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-jon-jones-b-7",
            "text": "I became UFC champion at 23 and went on to build one of the longest championship résumés in light heavyweight history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-jon-jones-b-8",
            "text": "My family also includes two brothers who played in the NFL.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-jon-jones-b-9",
            "text": "I later added the UFC heavyweight championship by submitting Ciryl Gane in the first round.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jon-jones-b-10",
            "text": "My résumé includes UFC title-fight wins over Mauricio Rua, Daniel Cormier, Alexander Gustafsson and Stipe Miocic.",
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
            "text": "I played several positions in football before wrestling became my main sport.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-2",
            "text": "I wrestled in college and earned a degree in kinesiology with an emphasis in clinical exercise science.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-3",
            "text": "After college wrestling ended, I turned to MMA because I still wanted a competitive outlet.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-4",
            "text": "I entered the UFC through season 14 of The Ultimate Fighter.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-5",
            "text": "I lost that season’s finale to John Dodson by first-round stoppage.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-6",
            "text": "I pulled off a major upset of Renan Barao to win the UFC bantamweight championship in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-7",
            "text": "I stopped Barao again in a title-fight rematch the following year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-8",
            "text": "After losing a close decision to Dominick Cruz, I rebuilt toward another championship run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-9",
            "text": "I reclaimed the bantamweight title by knocking out Cody Garbrandt and then stopped him again in the rematch.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-a-10",
            "text": "I later dropped to flyweight for a title fight with Olympic champion Henry Cejudo.",
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
            "id": "ufc-tj-dillashaw-b-1",
            "text": "I grew up in a family devoted to the Raiders and played running back, cornerback and linebacker before focusing on wrestling.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-2",
            "text": "My college wrestling career ended without the goals I had wanted, which helped push me toward professional fighting.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-3",
            "text": "My UFC career began on a reality-show finale rather than on a standard Fight Night card.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4",
              "ledger"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-4",
            "text": "I needed several more UFC wins after that debut loss before reaching the title picture.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-5",
            "text": "A close 2013 decision loss to Raphael Assunção became an important setback on the way to my first title shot.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-6",
            "text": "My relationship with striking coach Duane Ludwig became central to the style that carried me into championship contention.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-7",
            "text": "I stopped Renan Barao in the fifth round to win my first UFC championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-8",
            "text": "I later left Team Alpha Male and based major training camps in Colorado with Ludwig.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-9",
            "text": "A pair of knockout wins over Cody Garbrandt made me a two-time UFC bantamweight champion.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tj-dillashaw-b-10",
            "text": "My final UFC championship appearance came against Aljamain Sterling in 2022.",
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
            "text": "I began my professional MMA career in 2013 and reached the UFC two years later.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "ledger"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-2",
            "text": "My UFC debut ended in the second round and began a long run of stoppage victories.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-3",
            "text": "I won my first six UFC fights before receiving my first championship opportunity.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-4",
            "text": "That first title challenge came in 2018 after a rapid rise through the heavyweight division.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-5",
            "text": "A first-round knockout of Alistair Overeem became one of the signature finishes of my climb.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-6",
            "text": "I lost my first title fight to Stipe Miocic by decision and then dropped another decision in my next appearance.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-7",
            "text": "I answered those losses with four straight first-round knockouts.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-8",
            "text": "I stopped Miocic in their rematch to win the UFC heavyweight championship in 2021.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-9",
            "text": "My first title defense was a five-round decision over Ciryl Gane.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-a-10",
            "text": "Known as “The Predator,” I built my UFC reputation around exceptional heavyweight knockout power.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-francis-ngannou-b-1",
            "text": "Before fighting became my career, I spent part of my childhood doing physically demanding labor.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-2",
            "text": "My original combat-sports ambition was boxing rather than mixed martial arts.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-3",
            "text": "I initially resisted MMA even after reaching a gym that could help me train for combat sports.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-4",
            "text": "I eventually made the transition and turned professional in 2013.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-5",
            "text": "I had begun working in a sand mine at about nine years old.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-6",
            "text": "My journey from Africa toward Europe took roughly 14 months and required repeated attempts to cross the Strait of Gibraltar.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-7",
            "text": "After reaching Paris, I arrived determined to become a boxer like Mike Tyson before being persuaded to try MMA.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-8",
            "text": "Inside the UFC, I earned a heavyweight title rematch by putting together four consecutive first-round knockouts.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-9",
            "text": "I won that rematch by stopping Stipe Miocic in the second round.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-francis-ngannou-b-10",
            "text": "Through my foundation, I later opened an MMA gym in Cameroon designed to give local children training and educational opportunities.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5"
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
            "text": "I became a two-time NCAA Division III All-American wrestler before beginning my professional fighting career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-2",
            "text": "I turned professional in mixed martial arts in 2011 after my college wrestling career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-3",
            "text": "My UFC debut came in 2014 and went the full three rounds.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-4",
            "text": "After an uneven stretch in the middle of my UFC run, I put together five straight wins to reach the title picture.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-5",
            "text": "One of those wins ended with a rare kneebar submission of Cody Stamann late in the third round.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-6",
            "text": "I submitted Cory Sandhagen in the first round to secure my first UFC title opportunity.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-7",
            "text": "My first UFC championship fight ended when Petr Yan was disqualified for an illegal knee.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-8",
            "text": "I retained the belt in a split-decision rematch with Yan before adding two more successful defenses.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-9",
            "text": "I set the UFC bantamweight record with three consecutive successful title defenses.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-a-10",
            "text": "My nickname, “Funk Master,” grew out of the scrambling style I developed as a wrestler.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "profile"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-aljamain-sterling-b-1",
            "text": "Before fighting full time, I sold shoes at Saks Fifth Avenue and cut hair at school to help make money.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-2",
            "text": "I first studied accounting before transferring schools and earning a degree in physical education.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-3",
            "text": "I earned a Brazilian jiu-jitsu black belt under former UFC champion Matt Serra.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-4",
            "text": "I won my first four UFC appearances before suffering my first loss inside the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-5",
            "text": "A contender run later included decision wins over Jimmie Rivera and Pedro Munhoz.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-6",
            "text": "I needed less than 90 seconds to submit Cory Sandhagen in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-7",
            "text": "I became the first fighter to win a UFC championship because of an opponent’s disqualification.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-8",
            "text": "After losing my bantamweight title, I moved up a division and beat Calvin Kattar in my first fight there.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-9",
            "text": "My featherweight run later added five-round decision wins over Brian Ortega and Youssef Zalal.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-aljamain-sterling-b-10",
            "text": "My bantamweight title reign included consecutive championship wins over Petr Yan, T.J. Dillashaw and Henry Cejudo.",
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
            "text": "Before MMA, I became an NCAA Division I All-American wrestler.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-2",
            "text": "My pre-fighting jobs included demolition work, painting and bouncing.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-3",
            "text": "I entered the UFC unbeaten after already establishing myself as a champion outside the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-4",
            "text": "My UFC debut immediately earned Fight of the Night honors.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-5",
            "text": "I stopped Michael Johnson in that debut in 2017.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-6",
            "text": "Back-to-back losses to Eddie Alvarez and Dustin Poirier were followed by three straight first-round knockouts.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-7",
            "text": "I stopped Tony Ferguson to win an interim UFC lightweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-8",
            "text": "That set up a title-unification fight with Khabib Nurmagomedov.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-9",
            "text": "I later knocked out Dustin Poirier to win the BMF championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-a-10",
            "text": "My nickname “The Highlight” originally came from the highlight-reel slams I produced as a wrestler.",
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
            "id": "ufc-justin-gaethje-b-1",
            "text": "I grew up in a family closely tied to copper-mining work and spent a summer working in the mine myself.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-2",
            "text": "I studied human services in college and came close to completing the degree.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-3",
            "text": "My wrestling background was elite even though my professional fighting reputation became much more associated with striking.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-4",
            "text": "I joined the UFC with an undefeated professional record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "ledger"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-5",
            "text": "My first two UFC losses came in memorable fights with Eddie Alvarez and Dustin Poirier.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-6",
            "text": "I responded by knocking out James Vick, Edson Barboza and Donald Cerrone in consecutive fights.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-7",
            "text": "A five-round stoppage of Tony Ferguson made me the interim lightweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-8",
            "text": "I later won a five-round decision over Michael Chandler in Madison Square Garden.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-9",
            "text": "At UFC 291, I knocked out Dustin Poirier with a head kick to capture the BMF belt.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-justin-gaethje-b-10",
            "text": "The “Highlight” nickname that became synonymous with my UFC style actually began with my wrestling slams.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5"
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
            "text": "I left school in the ninth grade and have spoken about spending time in juvenile detention before fighting gave me direction.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-2",
            "text": "My early professional rise was featured in the 2011 documentary Fightville.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-3",
            "text": "I began my UFC career at featherweight before eventually moving up a division.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-4",
            "text": "After changing divisions, I rebuilt myself into a championship-level contender.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-5",
            "text": "A 2017 fight with Anthony Pettis ended when he could not continue after a body-triangle sequence.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-6",
            "text": "Wins over Justin Gaethje and Eddie Alvarez pushed me toward my first UFC championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-7",
            "text": "I beat Max Holloway over five rounds to win the interim lightweight title in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-8",
            "text": "My first undisputed title opportunity came against Khabib Nurmagomedov later that year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-9",
            "text": "I defeated Conor McGregor twice in 2021, once by knockout and once after a doctor stoppage.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-a-10",
            "text": "Known as “The Diamond,” I later challenged for undisputed lightweight gold against Charles Oliveira and Islam Makhachev as well.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity4",
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
            "id": "ufc-dustin-poirier-b-1",
            "text": "I made my professional MMA debut in 2009 and competed in the WEC before joining the UFC.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-2",
            "text": "My first UFC appearance came in 2011 and went the full three rounds.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-3",
            "text": "The first stage of my UFC career was spent competing at featherweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-4",
            "text": "A move to lightweight in 2015 opened a new chapter that eventually took me to championship opportunities.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-5",
            "text": "I stopped Bobby Green and later submitted Anthony Pettis during that climb.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-6",
            "text": "I knocked out Justin Gaethje in the fourth round of a 2018 main event.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-7",
            "text": "The charity work that became The Good Fight Foundation grew from auctioning my fight-worn gear for community causes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-8",
            "text": "I also built a Louisiana-style hot sauce brand that later became an official UFC partner.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-9",
            "text": "I fought Conor McGregor three times and won the final two meetings.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dustin-poirier-b-10",
            "text": "My longtime Louisiana coach Tim Credeur gave me the nickname “The Diamond” during my development as a fighter.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity4"
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
            "text": "I rebuilt my wrestling career at a junior college, where I earned a scholarship and became a standout competitor.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-2",
            "text": "For an early UFC appearance, I refused prize money so I could preserve my college wrestling eligibility.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-3",
            "text": "My first UFC run began in a one-night tournament format rather than a modern scheduled bout.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-4",
            "text": "Within a few years, I had worked my way from tournament prospect to a championship opportunity.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-5",
            "text": "I lost my first UFC title fight to Frank Shamrock in 1999.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-6",
            "text": "I returned the next year and beat Wanderlei Silva to win the light heavyweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-7",
            "text": "I successfully defended that title five times, setting a standard for the division in that era.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-8",
            "text": "One of those defenses came against Ken Shamrock, a rivalry that later became central to The Ultimate Fighter.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-9",
            "text": "My championship reign ended against Randy Couture before my rivalry with Chuck Liddell produced two major meetings inside the UFC.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-a-10",
            "text": "Known as the “Huntington Beach Bad Boy,” I became one of the UFC’s defining stars of the late 1990s and early 2000s.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
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
            "text": "Watching the first UFC convinced me that this new sport was something I could realistically pursue.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-2",
            "text": "Before becoming a UFC name, I gained early no-holds-barred experience by training with an established fighter from my area.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-3",
            "text": "I worked at an adult novelty store while trying to support myself before fighting became my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-4",
            "text": "My UFC debut came while I was still protecting my college wrestling eligibility.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4",
              "ledger"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-5",
            "text": "I avenged an early loss to Guy Mezger when we met again in 1999.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-6",
            "text": "A victory over Wanderlei Silva gave me the UFC light heavyweight championship in 2000.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-7",
            "text": "My title reign included defenses over Yuki Kondo, Evan Tanner, Elvis Sinosic, Vladimir Matyushenko and Ken Shamrock.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-8",
            "text": "I later coached The Ultimate Fighter opposite Ken Shamrock before beating him twice more.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-9",
            "text": "My UFC career also included championship-era fights with Randy Couture and Chuck Liddell.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tito-ortiz-b-10",
            "text": "The nickname “Huntington Beach Bad Boy” became closely tied to the persona I carried through my UFC career.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
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
            "text": "My father put me into martial arts after seeing how competitive I was with my older brother.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-2",
            "text": "I began lifting weights unusually young and later connected that early habit with developing my punching power.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-3",
            "text": "I competed in both wrestling and football before professional fighting became my full-time path.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-4",
            "text": "My first UFC run began in 2002, when I was still one of the younger fighters on the roster.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-5",
            "text": "At 16, I had begun training at Pat Miletich’s gym alongside one of the defining early American MMA teams.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-6",
            "text": "After years away from the promotion, I returned to the UFC in 2013 with a first-round win over Josh Koscheck.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-7",
            "text": "I lost a close title fight to Johny Hendricks, then beat him in the rematch to become UFC welterweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-8",
            "text": "My title defense against Rory MacDonald at UFC 189 became one of the most celebrated fights in UFC history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "identity3"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-9",
            "text": "I followed that with another five-round title defense against Carlos Condit.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-a-10",
            "text": "Known as “Ruthless,” I was inducted into the UFC Hall of Fame after a career built around aggressive striking and memorable wars.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity3",
              "profile"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-robbie-lawler-b-1",
            "text": "I moved during childhood and grew up competing in multiple sports before settling into a fighting career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-2",
            "text": "A coach who became one of my longest-running corner relationships worked dozens of my professional fights.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-3",
            "text": "I first entered the UFC in the early 2000s, then spent years competing elsewhere before eventually returning.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-4",
            "text": "My second UFC stint began more than eight years after my first one had ended.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-5",
            "text": "I beat Rory MacDonald by split decision during the contender run that led toward my first UFC title shot.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-6",
            "text": "After narrowly losing to Johny Hendricks, I won three straight fights and beat him in a rematch for the belt.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-7",
            "text": "My rematch with MacDonald ended in the fifth round after four punishing rounds of a title fight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "identity3"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-8",
            "text": "A split-decision win over Carlos Condit became my second successful title defense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-9",
            "text": "Seventeen years after our first meeting, I fought Nick Diaz again and won by third-round stoppage.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robbie-lawler-b-10",
            "text": "My nickname “Ruthless” matched the pressure-heavy style that made my championship fights with MacDonald and Condit so recognizable.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity3"
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
            "text": "I grew up in a household where money was tight and basic necessities could sometimes be difficult to secure.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-2",
            "text": "An older brother who was also a high-level wrestler was an important influence on my athletic path.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-3",
            "text": "I competed in amateur boxing and won an Arizona Bronze Gloves championship before fully committing to MMA.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-4",
            "text": "I joined the UFC in 2014 after beginning my professional MMA career unbeaten.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-5",
            "text": "At 21, I had already become the youngest American wrestler at the time to win an Olympic freestyle gold medal.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "identity4"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-6",
            "text": "My first UFC title shot ended in a first-round loss to Demetrious Johnson.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-7",
            "text": "I beat Johnson by split decision in a rematch to win the flyweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-8",
            "text": "I defended that belt by stopping T.J. Dillashaw in the first round.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-9",
            "text": "I moved up and stopped Marlon Moraes to become a UFC champion in a second division.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-a-10",
            "text": "The “Triple C” persona combined my Olympic gold medal with UFC championships at flyweight and bantamweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5",
              "profile"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-henry-cejudo-b-1",
            "text": "Wrestling became a family pursuit for me long before mixed martial arts did.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-2",
            "text": "I also spent time competing in amateur boxing before my professional MMA career began.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-3",
            "text": "My UFC debut came in 2014 and went the full three rounds.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-4",
            "text": "Two losses in 2016 forced me to rebuild before I reached championship level.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-5",
            "text": "A decision win over Sergio Pettis completed the run that earned me another shot at the flyweight title.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-6",
            "text": "I defeated Demetrious Johnson in a five-round split decision to become UFC champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-7",
            "text": "My next fight lasted less than a minute as I stopped T.J. Dillashaw in a title defense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-8",
            "text": "I then moved up a division and won another championship by stopping Marlon Moraes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-9",
            "text": "I defended the bantamweight title against Dominick Cruz before announcing a retirement that lasted nearly three years.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-henry-cejudo-b-10",
            "text": "My Olympic wrestling gold and championships in two UFC divisions became the basis for my “Triple C” nickname.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5",
              "profile"
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
            "text": "I began boxing at 13 and did not make the transition to mixed martial arts until roughly seven years later.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-petr-yan-a-2",
            "text": "I spent five years at an athletic institute specializing in training to become a youth boxing coach.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-petr-yan-a-3",
            "text": "Before fighting became my profession, I worked part-time security jobs.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-petr-yan-a-4",
            "text": "I won my first six UFC appearances after joining the promotion in 2018.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-a-5",
            "text": "I stopped Urijah Faber in the third round to move into championship position.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-a-6",
            "text": "I beat José Aldo to win the vacant UFC bantamweight championship in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-a-7",
            "text": "I lost that title to Aljamain Sterling after being disqualified for an illegal knee.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-a-8",
            "text": "While Sterling was unavailable, I beat Cory Sandhagen to win an interim bantamweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-a-9",
            "text": "A split-decision rematch with Sterling prevented me from regaining the undisputed belt.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-a-10",
            "text": "My nickname “No Mercy” reflects the opportunistic finishing mindset I have said I want to bring into fights.",
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
            "id": "ufc-petr-yan-b-1",
            "text": "My training routine has included three separate daily sessions for conditioning, sparring and technical work.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-petr-yan-b-2",
            "text": "Boxing was my first combat sport, and it remained central to my style after I moved into MMA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-petr-yan-b-3",
            "text": "I had already built a professional career outside the UFC before signing with the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-b-4",
            "text": "Once in the UFC, I opened with a six-fight winning streak.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-b-5",
            "text": "Wins over John Dodson and Jimmie Rivera helped establish me as a bantamweight contender.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-b-6",
            "text": "A third-round stoppage of Urijah Faber put me directly into a vacant-title fight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-b-7",
            "text": "I won that championship by stopping José Aldo in the fifth round.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-b-8",
            "text": "My first defense ended with a disqualification loss after an illegal knee against Aljamain Sterling.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-b-9",
            "text": "I later defeated Cory Sandhagen for an interim title and fought Sterling again for the undisputed championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-petr-yan-b-10",
            "text": "The “No Mercy” nickname became the clearest shorthand for my pressure-heavy boxing identity.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5",
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
            "text": "I completed a college degree in physical education while continuing my combat-sports training.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-2",
            "text": "My background included sumo and Brazilian jiu-jitsu in addition to the striking art that became my trademark.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-3",
            "text": "My father used very early morning training sessions as a lesson in discipline while I was growing up.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-4",
            "text": "Even after moving into MMA, I deliberately kept the distance, timing and movement of my original striking style.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-5",
            "text": "I opened my UFC career with six straight victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-6",
            "text": "I knocked out Rashad Evans to win the UFC light heavyweight championship in 2009.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-7",
            "text": "My first defense was a close decision over Mauricio Rua before I lost the immediate rematch.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-8",
            "text": "I later knocked out Randy Couture with a jumping front kick.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-9",
            "text": "After moving to middleweight, I challenged Chris Weidman for the UFC championship over five rounds.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-a-10",
            "text": "Known as “The Dragon,” I became one of the UFC fighters most closely associated with a Shotokan karate style.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity1"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-lyoto-machida-b-1",
            "text": "I grew up in a family where martial arts instruction was part of everyday life.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-2",
            "text": "I added grappling arts around a striking base rather than abandoning that original style for a conventional MMA stance.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3",
              "identity4"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-3",
            "text": "My professional MMA career began several years before I entered the UFC.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-4",
            "text": "I arrived in the UFC unbeaten and continued winning through my first several appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-5",
            "text": "A decision win over Tito Ortiz kept my unbeaten record intact in 2008.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-6",
            "text": "I then knocked out Thiago Silva before receiving my first UFC title opportunity.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-7",
            "text": "I stopped Rashad Evans in the second round to become light heavyweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-8",
            "text": "My championship rivalry with Mauricio Rua produced back-to-back championship bouts.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-9",
            "text": "Late in my UFC career, I knocked out Vitor Belfort with another front kick.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-lyoto-machida-b-10",
            "text": "My “Dragon” nickname and karate-based movement made me one of the most visually distinctive champions of my era.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity1"
            ]
          }
        ]
      }
    }
  }
];
