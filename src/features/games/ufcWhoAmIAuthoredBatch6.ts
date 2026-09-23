import type { UfcWhoAmIAuthoredIdentity } from "./ufcWhoAmIAuthoredScripts";

/**
 * Static authored UFC Who Am I batch 6.
 * Source-backed at authoring time; runtime serves these clue strings verbatim.
 */
export const ufcWhoAmIAuthoredBatch6: readonly UfcWhoAmIAuthoredIdentity[] = [
  {
    "subjectId": "ufc:kevin-holland",
    "name": "Kevin Holland",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/kevin-holland",
      "identity1": "https://www.ufc.com/athlete/kevin-holland",
      "identity2": "https://www.ufc.com/athlete/kevin-holland",
      "identity3": "https://www.ufc.com/athlete/kevin-holland",
      "identity4": "https://www.ufc.com/athlete/kevin-holland",
      "identity5": "https://www.ufc.com/news/kevin-holland-chasing-history-ufc-311"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-kevin-holland-a-1",
            "text": "Before fighting full time, I worked as an electrical apprentice.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-kevin-holland-a-2",
            "text": "I began taking martial arts seriously as a teenager after getting humbled in a kung-fu gym.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-kevin-holland-a-3",
            "text": "My training eventually grew into an unusual mix of kung fu and Brazilian jiu-jitsu.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-kevin-holland-a-4",
            "text": "I reached the UFC in 2018 after appearing on Dana White’s Contender Series.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity5"
            ]
          },
          {
            "id": "ufc-kevin-holland-a-5",
            "text": "A breakout stretch in 2020 turned me from an active roster fighter into a ranked middleweight name.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kevin-holland-a-6",
            "text": "I won five UFC fights during the 2020 calendar year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kevin-holland-a-7",
            "text": "That run included a first-round knockout of Ronaldo “Jacaré” Souza.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kevin-holland-a-8",
            "text": "I later moved to welterweight and shared the Octagon with Stephen Thompson and Michael Page.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kevin-holland-a-9",
            "text": "Talking to opponents throughout my fights became one of my most recognizable habits.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-kevin-holland-a-10",
            "text": "My nickname is “Trailblazer,” a name tied to the kung-fu school concept of one of my earliest instructors.",
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
            "id": "ufc-kevin-holland-b-1",
            "text": "I entered the UFC in 2018 and initially built most of my résumé at middleweight.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-kevin-holland-b-2",
            "text": "My early UFC run mixed frequent activity with both decisions and finishes rather than a straight climb toward a title.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-kevin-holland-b-3",
            "text": "By 2020, I had developed a reputation for accepting fights often and staying unusually busy.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kevin-holland-b-4",
            "text": "I put together five victories in that single calendar year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kevin-holland-b-5",
            "text": "The final win of that run came by first-round knockout over Ronaldo “Jacaré” Souza.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kevin-holland-b-6",
            "text": "Derek Brunson and Marvin Vettori halted my momentum in back-to-back 2021 main events.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kevin-holland-b-7",
            "text": "I then dropped to welterweight and quickly picked up finishes in the new division.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kevin-holland-b-8",
            "text": "My later welterweight résumé included Stephen Thompson, Jack Della Maddalena and Michael Page.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kevin-holland-b-9",
            "text": "Dana White once called me “Big Mouth” because I talked so much during a Contender Series fight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-kevin-holland-b-10",
            "text": "I am the UFC fighter known as “Trailblazer,” with black belts in both kung fu and Brazilian jiu-jitsu.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity4",
              "identity5"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:gilbert-burns",
    "name": "Gilbert Burns",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/gilbert-burns",
      "identity1": "https://www.mmafighting.com/2020/5/29/21274531/bronchitis-ice-cream-gilbert-burns-durinho-tyron-woodley-ufc",
      "identity2": "https://www.mmafighting.com/2020/5/29/21274531/bronchitis-ice-cream-gilbert-burns-durinho-tyron-woodley-ufc",
      "identity3": "https://www.mmafighting.com/2020/5/29/21274531/bronchitis-ice-cream-gilbert-burns-durinho-tyron-woodley-ufc",
      "identity4": "https://www.mmafighting.com/2020/5/29/21274531/bronchitis-ice-cream-gilbert-burns-durinho-tyron-woodley-ufc",
      "identity5": "https://www.ufc.com/news/gilbert-burns-unparalleled-support-system-ufc-287"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-gilbert-burns-a-1",
            "text": "Childhood breathing problems pushed me toward sports after a doctor recommended more physical activity.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-gilbert-burns-a-2",
            "text": "My family found an unusual way to make martial-arts training affordable: my father traded upholstery work for jiu-jitsu lessons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-gilbert-burns-a-3",
            "text": "I became an elite Brazilian jiu-jitsu competitor before making MMA my full-time focus.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-gilbert-burns-a-4",
            "text": "I wanted to win a major black-belt world title in jiu-jitsu before fully committing to mixed martial arts, and I did so in 2011.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-gilbert-burns-a-5",
            "text": "My UFC career began at lightweight before I eventually found my best run one division higher.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-gilbert-burns-a-6",
            "text": "At welterweight, wins over Demian Maia and Tyron Woodley pushed me into a championship opportunity.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-gilbert-burns-a-7",
            "text": "That title fight came against Kamaru Usman in 2021.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-gilbert-burns-a-8",
            "text": "I later went three hard rounds with Khamzat Chimaev in one of the most acclaimed fights of 2022.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-gilbert-burns-a-9",
            "text": "My longtime nickname, “Durinho,” grew out of a nickname already used for my older brother.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-gilbert-burns-a-10",
            "text": "Before my own UFC run, I once cornered Vitor Belfort and met striking coach Henri Hooft, who became a major coach in my career.",
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
            "id": "ufc-gilbert-burns-b-1",
            "text": "My combat-sports foundation was built in high-level grappling long before I became a UFC contender.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-gilbert-burns-b-2",
            "text": "I transitioned fully toward MMA only after accomplishing a major world-title goal in Brazilian jiu-jitsu.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-gilbert-burns-b-3",
            "text": "I entered the UFC in 2014 and spent the first part of my run at lightweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-gilbert-burns-b-4",
            "text": "A move to welterweight changed the direction of my UFC career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-gilbert-burns-b-5",
            "text": "I beat Gunnar Nelson and Demian Maia during the climb.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-gilbert-burns-b-6",
            "text": "A dominant five-round win over Tyron Woodley earned me a shot at UFC gold.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-gilbert-burns-b-7",
            "text": "I challenged former teammate Kamaru Usman for the welterweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile",
              "identity5"
            ]
          },
          {
            "id": "ufc-gilbert-burns-b-8",
            "text": "My later résumé included Khamzat Chimaev, Jorge Masvidal and Belal Muhammad.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-gilbert-burns-b-9",
            "text": "My father once bartered work on car seats so my brothers and I could begin jiu-jitsu training.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-gilbert-burns-b-10",
            "text": "I am the Brazilian contender known as “Durinho,” a nickname connected to my older brother’s own jiu-jitsu nickname.",
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
    "subjectId": "ufc:nick-diaz",
    "name": "Nick Diaz",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/nick-diaz",
      "identity1": "https://www.ufc.com/news/nick-diaz-man-apart",
      "identity2": "https://www.ufc.com/news/nick-diaz-man-apart",
      "identity3": "https://www.ufc.com/news/nick-diaz-man-apart",
      "identity4": "https://www.ufc.com/news/fighting-has-defined-nick-diaz-ufc-266-volkanovski-vs-ortega-diaz-lawler-2",
      "identity5": "https://www.ufc.com/news/nick-diaz-knows-what-you-think-about-him-he-also-knows-you-cannot-turn-away"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-nick-diaz-a-1",
            "text": "Martial arts gave me structure during an unsettled school-age upbringing.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-nick-diaz-a-2",
            "text": "I have said that the jiu-jitsu gym gave me a community and confidence I did not have elsewhere as a teenager.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-nick-diaz-a-3",
            "text": "Before fighting became my life, I remember having only a couple of conventional jobs.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-nick-diaz-a-4",
            "text": "I first entered the UFC in 2003, early in a career that would stretch across multiple eras.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nick-diaz-a-5",
            "text": "One of my earliest signature UFC wins was a knockout of Robbie Lawler in 2004.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nick-diaz-a-6",
            "text": "Years later I returned to the UFC and beat B.J. Penn by decision in a three-round main event.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nick-diaz-a-7",
            "text": "I then fought Carlos Condit for an interim welterweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nick-diaz-a-8",
            "text": "A later title opportunity matched me with Georges St-Pierre.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nick-diaz-a-9",
            "text": "I returned after a long layoff to face Robbie Lawler again, seventeen years after our first meeting.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nick-diaz-a-10",
            "text": "My open-hand striking became famous as the “Stockton Slap.”",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-nick-diaz-b-1",
            "text": "Endurance competition became a real part of my life outside the cage, including multiple triathlons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-nick-diaz-b-2",
            "text": "My style mixed high-volume boxing pressure with a deep Brazilian jiu-jitsu base.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity1"
            ]
          },
          {
            "id": "ufc-nick-diaz-b-3",
            "text": "I was already fighting in the UFC in the early 2000s, long before many of my later high-profile opponents arrived.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-nick-diaz-b-4",
            "text": "I submitted Jeremy Jackson in my first UFC appearance.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nick-diaz-b-5",
            "text": "I later knocked out Robbie Lawler, then spent years competing outside the UFC before returning.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nick-diaz-b-6",
            "text": "My comeback run eventually led to consecutive fights with B.J. Penn, Carlos Condit and Georges St-Pierre.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nick-diaz-b-7",
            "text": "The Condit fight was for an interim welterweight belt and the St-Pierre fight was for the undisputed title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nick-diaz-b-8",
            "text": "I also went five rounds with Anderson Silva in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nick-diaz-b-9",
            "text": "My younger brother Nate became a major UFC star in his own right.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity1"
            ]
          },
          {
            "id": "ufc-nick-diaz-b-10",
            "text": "I am the older Diaz brother whose pressure style and “Stockton Slap” became part of UFC culture.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity4",
              "profile"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:alexander-volkanovski",
    "name": "Alexander Volkanovski",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/alexander-volkanovski",
      "identity1": "https://www.sbs.com.au/language/macedonian/en/podcast-episode/from-rugby-league-to-ufc-champ-meet-alexander-the-great-volkanovski/jmty4b72p",
      "identity2": "https://www.sbs.com.au/language/macedonian/en/podcast-episode/from-rugby-league-to-ufc-champ-meet-alexander-the-great-volkanovski/jmty4b72p",
      "identity3": "https://www.sbs.com.au/language/macedonian/en/podcast-episode/from-rugby-league-to-ufc-champ-meet-alexander-the-great-volkanovski/jmty4b72p",
      "identity4": "https://www.espn.com/mma/story/_/id/28234665/ufc-alexander-volkanovksi-humble-local-hero-focus-swayed",
      "identity5": "https://www.ufc.com/news/joe-lopez-says-personality-clash-fuels-featherweight-champion-alexander-volkanovski-ufc-266"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-alexander-volkanovski-a-1",
            "text": "Before MMA, I competed seriously in wrestling and won national titles in my home country.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-a-2",
            "text": "I later played rugby league at a much heavier body weight than the one I became known for in fighting.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-a-3",
            "text": "I came from a family of concreters and worked in that trade before fighting became my full-time career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-a-4",
            "text": "My path to MMA began when I entered a fight gym with rugby teammates for preseason conditioning.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-a-5",
            "text": "I reached the UFC in 2016 and built an unbeaten run inside the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-a-6",
            "text": "Wins over Chad Mendes and José Aldo moved me into the featherweight title picture.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-a-7",
            "text": "I won the UFC featherweight championship by defeating Max Holloway in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-a-8",
            "text": "I beat Holloway two more times and also defended the belt against Brian Ortega and Chan Sung Jung.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-a-9",
            "text": "I later moved up to challenge Islam Makhachev for the lightweight title.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-a-10",
            "text": "My nickname, “Alexander the Great,” connects to my Macedonian and Greek family heritage.",
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
            "id": "ufc-alexander-volkanovski-b-1",
            "text": "I entered the UFC in 2016 after already building substantial professional experience elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-b-2",
            "text": "My first several UFC appearances showed a blend of wrestling pressure, pace and increasingly polished striking.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-b-3",
            "text": "By the end of 2018, I had added a stoppage win over former title challenger Chad Mendes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-b-4",
            "text": "A decision over José Aldo in 2019 put me on the doorstep of a championship fight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-b-5",
            "text": "I took the featherweight belt from Max Holloway later that year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-b-6",
            "text": "Our rivalry eventually became a trilogy, and I won all three of our meetings.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-b-7",
            "text": "I survived a dangerous submission sequence to defend my title against Brian Ortega.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-b-8",
            "text": "I later pursued champion-versus-champion history at lightweight against Islam Makhachev.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-b-9",
            "text": "Long before those title fights, I had played rugby league at roughly 97 kilograms.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-alexander-volkanovski-b-10",
            "text": "I am “Alexander the Great,” the former rugby player who became a long-reigning UFC featherweight champion.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "ledger"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:kamaru-usman",
    "name": "Kamaru Usman",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/kamaru-usman",
      "identity1": "https://www.ufc.com/news/kamaru-usman-reflects-on-his-return-to-nigeria",
      "identity2": "https://www.espn.com/espn/feature/story/_/page/Coverstory-April2021/the-reign-kamaru-usman",
      "identity3": "https://www.ufc.com/news/its-still-kamaru-usman-time-main-event-ufc-278",
      "identity4": "https://www.ufc.com/news/its-still-kamaru-usman-time-main-event-ufc-278",
      "identity5": "https://www.espn.com/mma/story/_/id/29424043/fight-island-story-kamaru-usman-father-texas-prison"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-kamaru-usman-a-1",
            "text": "My athletic base came from high-level wrestling rather than striking.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "identity3"
            ]
          },
          {
            "id": "ufc-kamaru-usman-a-2",
            "text": "I trained at the U.S. Olympic Training Center with the goal of making an Olympic wrestling team.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-kamaru-usman-a-3",
            "text": "A former UFC champion helped become a bridge between my wrestling world and mixed martial arts.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-kamaru-usman-a-4",
            "text": "I entered the UFC in 2015 and built a long unbeaten run inside the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kamaru-usman-a-5",
            "text": "While my father was in federal prison, I tried to keep some early UFC fights on television so he could watch them.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-kamaru-usman-a-6",
            "text": "Wins over Demian Maia and Rafael dos Anjos pushed me to the front of the welterweight title picture.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kamaru-usman-a-7",
            "text": "I won the championship by defeating Tyron Woodley in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kamaru-usman-a-8",
            "text": "My title reign included two fights each with Colby Covington and Jorge Masvidal.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kamaru-usman-a-9",
            "text": "Leon Edwards ended my long UFC winning streak and title reign with a fifth-round head kick.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kamaru-usman-a-10",
            "text": "My championship identity became synonymous with the nickname “The Nigerian Nightmare.”",
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
            "id": "ufc-kamaru-usman-b-1",
            "text": "A high-school wrestling coach gave me a simplified name that followed me through much of my wrestling career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-kamaru-usman-b-2",
            "text": "I spent years pursuing elite wrestling before fully committing to mixed martial arts.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-kamaru-usman-b-3",
            "text": "I joined the UFC in 2015 and kept winning without immediately becoming a knockout-focused star.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kamaru-usman-b-4",
            "text": "My pressure, wrestling and pace carried me through a long run of decisions against ranked welterweights.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kamaru-usman-b-5",
            "text": "I beat Demian Maia and Rafael dos Anjos in back-to-back five-round fights.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kamaru-usman-b-6",
            "text": "A dominant win over Tyron Woodley made me UFC welterweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kamaru-usman-b-7",
            "text": "I stopped Colby Covington in my first title defense and later beat him again by decision.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kamaru-usman-b-8",
            "text": "I also defeated Jorge Masvidal twice, including a knockout in the rematch.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kamaru-usman-b-9",
            "text": "My reign ended when Leon Edwards knocked me out late in a fight I had been leading.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kamaru-usman-b-10",
            "text": "The wrestler once known as “Marty” became a dominant UFC champion nicknamed “The Nigerian Nightmare.”",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "profile"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:daniel-cormier",
    "name": "Daniel Cormier",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/daniel-cormier",
      "identity1": "https://www.ufc.com/news/lifetime-challenges-daniel-cormier-confronts-fight-his-life",
      "identity2": "https://www.ufc.com/news/lifetime-challenges-daniel-cormier-confronts-fight-his-life",
      "identity3": "https://www.ufc.com/news/lifetime-challenges-daniel-cormier-confronts-fight-his-life",
      "identity4": "https://www.ufc.com/news/lifetime-challenges-daniel-cormier-confronts-fight-his-life",
      "identity5": "https://www.ufc.com/news/daniel-cormier-named-to-the-ufc-hall-of-fame-modern-wing-class-of-2022"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-daniel-cormier-a-1",
            "text": "I was an all-state high-school linebacker as well as a standout wrestler before choosing wrestling as my main competitive path.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-2",
            "text": "My amateur career eventually took me to the highest levels of American wrestling before I ever competed in MMA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-3",
            "text": "I did not begin professional mixed martial arts until after that long wrestling career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-4",
            "text": "I arrived in the UFC in 2013 as an unbeaten heavyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-5",
            "text": "As captain of the 2008 U.S. Olympic wrestling team, I was hospitalized during a severe weight cut and could not compete.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-6",
            "text": "I later dropped from heavyweight to light heavyweight and quickly reached a UFC title fight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-7",
            "text": "My first UFC championship attempt came against Jon Jones.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-8",
            "text": "I then submitted Anthony Johnson to win the vacant light-heavyweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-9",
            "text": "A knockout of Stipe Miocic made me a UFC champion in a second weight class.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-10",
            "text": "I became one of the promotion’s best-known two-division champions before moving into broadcasting and the UFC Hall of Fame.",
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
            "id": "ufc-daniel-cormier-b-1",
            "text": "Wrestling remained part of my life outside the cage, including work as a high-school coach.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-2",
            "text": "I entered the UFC with an established heavyweight résumé rather than as a young prospect.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-3",
            "text": "My first several UFC wins came across heavyweight and light heavyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-4",
            "text": "After dropping to light heavyweight, I quickly moved into championship contention.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-5",
            "text": "After losing to Jon Jones, I won the vacant belt by submitting Anthony Johnson.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-6",
            "text": "I defended that championship against Alexander Gustafsson and later beat Johnson a second time.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-7",
            "text": "I then returned to heavyweight and knocked out Stipe Miocic for another championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-8",
            "text": "That victory made me a simultaneous UFC champion in two weight classes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-9",
            "text": "My heavyweight title story became a trilogy with Miocic.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-10",
            "text": "Known throughout the sport by my initials, I later became a UFC broadcaster and Hall of Famer.",
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
    "subjectId": "ufc:charles-oliveira",
    "name": "Charles Oliveira",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/charles-oliveira",
      "identity1": "https://www.espn.com/mma/story/_/id/39914950/ufc-300-there-always-plan-charles-oliveira",
      "identity2": "https://www.espn.com/mma/story/_/id/39914950/ufc-300-there-always-plan-charles-oliveira",
      "identity3": "https://www.espn.com/mma/story/_/id/39914950/ufc-300-there-always-plan-charles-oliveira",
      "identity4": "https://www.espn.com/mma/story/_/id/39914950/ufc-300-there-always-plan-charles-oliveira",
      "identity5": "https://www.espn.com/mma/story/_/id/39914950/ufc-300-there-always-plan-charles-oliveira"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-charles-oliveira-a-1",
            "text": "As a child, I was diagnosed with serious health problems and was initially told to avoid vigorous activity.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-2",
            "text": "I nevertheless became obsessed with Brazilian jiu-jitsu after being introduced to it around age twelve.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-3",
            "text": "When I needed money for an early MMA opportunity in the United States, people in my community organized a raffle to help fund the trip.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-4",
            "text": "I entered the UFC in 2010 and spent parts of my long career in two different weight classes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-5",
            "text": "My UFC path included plenty of setbacks before a long winning streak completely changed my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-6",
            "text": "That resurgence was powered by the submission game that eventually produced record-setting UFC finish totals.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-7",
            "text": "I stopped Michael Chandler to win the vacant lightweight championship in 2021.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-8",
            "text": "I followed that title win with submissions of Dustin Poirier and Justin Gaethje.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-9",
            "text": "Islam Makhachev ended that championship run in a 2022 title fight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-10",
            "text": "My nickname, “Do Bronx,” reflects the neighborhood identity I carried with me from where I grew up.",
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
            "id": "ufc-charles-oliveira-b-1",
            "text": "My family turned fight week into a shared ritual, even fasting with me while I made weight.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-2",
            "text": "My grandmother also became part of that routine by sending a voice message that I would repeatedly listen to.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-3",
            "text": "Aggressive grappling and submission attacks became the central identity of my fighting style.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-4",
            "text": "I spent more than a decade in the UFC before ever fighting for the undisputed championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-5",
            "text": "A career-changing resurgence included wins over Kevin Lee and Tony Ferguson before I finally reached a title fight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-6",
            "text": "I rallied to stop Michael Chandler and become UFC lightweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-7",
            "text": "I then submitted Dustin Poirier in my first title defense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-8",
            "text": "I submitted Justin Gaethje in my next fight after being stripped of the belt for missing championship weight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-9",
            "text": "My career became synonymous with UFC records for submissions and finishes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-10",
            "text": "I am the submission specialist known as “Do Bronx,” a nickname rooted in my home neighborhood.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "profile"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:frankie-edgar",
    "name": "Frankie Edgar",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/frankie-edgar",
      "identity1": "https://www.ufc.com/news/no-more-pipe-dreams-edgar",
      "identity2": "https://www.ufc.com/athlete/frankie-edgar",
      "identity3": "https://www.ufc.com/athlete/frankie-edgar",
      "identity4": "https://www.ufc.com/news/frankie-edgar-dreams-reality",
      "identity5": "https://www.ufc.com/news/frankie-edgar-begins-new-adventure-ufc-gym-owner"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-frankie-edgar-a-1",
            "text": "I qualified for the NCAA Division I wrestling championships in each of my four college seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-2",
            "text": "I earned a college degree in political science before fighting became my full-time profession.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-3",
            "text": "Even after reaching the UFC, I worked full shifts as a union plumber and coached wrestling before training at night.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-4",
            "text": "I made my UFC debut in 2007 and climbed the lightweight ranks largely through pace, wrestling and durability.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-5",
            "text": "I won the lightweight championship by upsetting B.J. Penn in 2010.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-6",
            "text": "I beat Penn again in an immediate title rematch.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-7",
            "text": "My championship rivalry with Gray Maynard included a draw followed by a comeback stoppage win.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-8",
            "text": "I later dropped to featherweight and twice challenged José Aldo for that division’s title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-9",
            "text": "Over the course of my UFC career I competed at lightweight, featherweight and bantamweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-10",
            "text": "My championship run and constant ability to survive trouble helped make “The Answer” one of the defining nicknames of my era.",
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
            "id": "ufc-frankie-edgar-b-1",
            "text": "I have recalled earning only about sixty dollars for my first MMA fight and breaking my orbital bone in the bout.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-2",
            "text": "For years, fighting existed alongside ordinary work rather than replacing it immediately.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-3",
            "text": "I kept plumbing, coaching wrestling and training all packed into the same routine while my UFC career was developing.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-4",
            "text": "At lightweight, wins over contenders such as Tyson Griffin and Sean Sherk moved me toward the top of the division.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-5",
            "text": "I eventually received a title shot against B.J. Penn and won a close decision.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-6",
            "text": "The immediate rematch was far more decisive, and I left with the belt again.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-7",
            "text": "Gray Maynard then became the central rival of my title reign, with two dramatic championship fights.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-8",
            "text": "After losing the lightweight belt, I moved to featherweight and challenged José Aldo.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-9",
            "text": "I later extended my UFC career into the bantamweight division as well.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-10",
            "text": "The former union plumber became a UFC lightweight champion remembered as “The Answer.”",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "profile"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:benson-henderson",
    "name": "Benson Henderson",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/benson-henderson",
      "identity1": "https://www.mmafighting.com/2009/10/06/189429/humble-ben-henderson-makes-big-statement-i-will-be-the-best",
      "identity2": "https://www.mmafighting.com/2009/10/06/189429/humble-ben-henderson-makes-big-statement-i-will-be-the-best",
      "identity3": "https://www.mmafighting.com/2009/10/06/189429/humble-ben-henderson-makes-big-statement-i-will-be-the-best",
      "identity4": "https://www.mmafighting.com/2009/10/06/189429/humble-ben-henderson-makes-big-statement-i-will-be-the-best",
      "identity5": "https://www.mmafighting.com/2023/4/2/23640361/benson-henderson-admits-hidden-toothpick-in-mouth-for-a-lot-of-ufc-fights-accidentally-swallowed"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-benson-henderson-a-1",
            "text": "My mother made martial arts part of childhood as a way for my brother and me to stay connected to her cultural background.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-2",
            "text": "I later fell in love with wrestling and became a two-time college All-American.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-3",
            "text": "I double-majored in criminal justice and sociology while competing in college.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-4",
            "text": "After graduation, I passed police testing and received job offers but chose professional fighting instead.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-5",
            "text": "I entered the UFC in 2011 after already winning a championship in another major promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity1"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-6",
            "text": "Three straight UFC wins, capped by a victory over Clay Guida, earned me a lightweight title shot.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-7",
            "text": "I defeated Frankie Edgar to become UFC lightweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-8",
            "text": "My title reign included defenses against Edgar, Nate Diaz and Gilbert Melendez.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-9",
            "text": "I later admitted that I secretly competed with a toothpick in my mouth during many fights.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-10",
            "text": "The former college wrestler and UFC lightweight champion became widely known by the nickname “Smooth.”",
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
            "id": "ufc-benson-henderson-b-1",
            "text": "My wrestling career began almost by accident after I wandered into a wrestling room and became hooked on the sport.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-2",
            "text": "A law-enforcement career was a realistic option for me before I chose MMA instead.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-3",
            "text": "By the time I reached the UFC, I had already been a champion outside the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity1"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-4",
            "text": "I won my first three UFC appearances to move directly into the lightweight title picture.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-5",
            "text": "The last of those wins came against Clay Guida in a title eliminator.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-6",
            "text": "I then beat Frankie Edgar for the championship and defeated him again in the rematch.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-7",
            "text": "I added successful defenses against Nate Diaz and Gilbert Melendez.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-8",
            "text": "Anthony Pettis ended my UFC title reign in a rematch of a rivalry that had started before either man’s UFC run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-9",
            "text": "One of my strangest trademarks was secretly keeping a toothpick in my mouth while competing.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-10",
            "text": "I am the lightweight champion nicknamed “Smooth,” known for elite wrestling, close decisions and that toothpick habit.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity5"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:bj-penn",
    "name": "B.J. Penn",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/bj-penn",
      "identity1": "https://www.ufc.com/news/bj-penn-el-hombre-el-prodigio-la-leyenda",
      "identity2": "https://www.ufc.com/news/jay-dee-penn-father-bj-dana-white-fertitta-1945-2021",
      "identity3": "https://www.ufc.com/news/bj-penn-joins-ufc-hall-fame-july",
      "identity4": "https://www.ufc.com/news/brothers-armbars-raw-story",
      "identity5": "https://www.ufc.com/news/jay-dee-penn-father-bj-dana-white-fertitta-1945-2021"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-bj-penn-a-1",
            "text": "I grew up in a family where my brothers and I trained martial arts together for years.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-bj-penn-a-2",
            "text": "A neighbor helped introduce me to Brazilian jiu-jitsu when I was a teenager.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-bj-penn-a-3",
            "text": "I earned a Brazilian jiu-jitsu black belt in less than three years.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-bj-penn-a-4",
            "text": "I then became the first American to win a black-belt world championship in the sport.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-bj-penn-a-5",
            "text": "I entered the UFC in 2001 with very little professional MMA experience.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-a-6",
            "text": "My first UFC title opportunity came against Jens Pulver at lightweight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-a-7",
            "text": "I later moved up and submitted Matt Hughes to win the welterweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-a-8",
            "text": "Years later I returned to lightweight and won that division’s vacant title by submitting Joe Stevenson.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-a-9",
            "text": "I defended the lightweight belt against Sean Sherk, Kenny Florian and Diego Sanchez.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-a-10",
            "text": "My rapid jiu-jitsu rise and championships in two UFC weight classes made “The Prodigy” a fitting nickname.",
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
            "id": "ufc-bj-penn-b-1",
            "text": "I was already an elite Brazilian jiu-jitsu competitor before my professional MMA career really began.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-bj-penn-b-2",
            "text": "The UFC signed me almost immediately, and my first three appearances all ended in stoppage victories.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-b-3",
            "text": "I reached a lightweight title fight extremely early in my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-bj-penn-b-4",
            "text": "That first championship attempt ended in a decision loss to Jens Pulver.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-b-5",
            "text": "After spending time outside the UFC, I returned and shocked Matt Hughes with a first-round submission for the welterweight title.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-b-6",
            "text": "A later chapter brought me back to lightweight and another championship opportunity.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-b-7",
            "text": "I submitted Joe Stevenson to win the vacant lightweight belt.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-b-8",
            "text": "Successful defenses over Sean Sherk, Kenny Florian and Diego Sanchez followed.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-b-9",
            "text": "I became one of the UFC’s early champions in two different weight classes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-b-10",
            "text": "My family called me “Baby Jay,” and that childhood name was shortened into the initials fans came to know me by.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:glover-teixeira",
    "name": "Glover Teixeira",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/glover-teixeira",
      "identity1": "https://www.espn.com/mma/story/_/id/21759989/glover-teixeira-my-life-fighter",
      "identity2": "https://www.espn.com/mma/story/_/id/21759989/glover-teixeira-my-life-fighter",
      "identity3": "https://www.ufc.com/news/making-glover-teixeira-urban-legend-ufc-star",
      "identity4": "https://www.ufc.com/news/making-glover-teixeira-urban-legend-ufc-star",
      "identity5": "https://www.ufc.com/news/making-glover-teixeira-urban-legend-ufc-star"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-glover-teixeira-a-1",
            "text": "I grew up doing hard physical work in a rural farming environment.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-2",
            "text": "After immigrating as a young man, I worked in landscaping and sent money home to help my family.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-3",
            "text": "I originally wanted to pursue boxing, but watching an early UFC event redirected me toward mixed martial arts.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-4",
            "text": "Immigration and visa problems kept me away from the United States for years and delayed a major part of my fighting career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-5",
            "text": "I finally reached the UFC in 2012 after already spending years as a professional fighter.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-6",
            "text": "Five straight UFC wins, including one over Quinton Jackson, carried me into a title fight with Jon Jones.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-7",
            "text": "Years later I rebuilt myself with another long winning streak deep into my career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-8",
            "text": "I submitted Jan Błachowicz in 2021 to become UFC light-heavyweight champion at age 42.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-9",
            "text": "My first defense became a dramatic five-round fight with Jiří Procházka.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-10",
            "text": "Long before winning UFC gold, I had trained closely with Chuck Liddell under coach John Hackleman.",
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
            "id": "ufc-glover-teixeira-b-1",
            "text": "My professional career began years before the UFC was able to become my long-term home.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-2",
            "text": "As a young immigrant I supported myself through physical labor while trying to build a fighting career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-3",
            "text": "A tape of the earliest UFC era changed my ambition from traditional boxing toward mixed martial arts.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-4",
            "text": "Visa problems forced me to spend years away from the United States even while my career was developing.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-5",
            "text": "Once back, I trained with Chuck Liddell and coach John Hackleman before eventually reaching the UFC.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-6",
            "text": "I opened my UFC run with five consecutive wins and then challenged Jon Jones for the title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-7",
            "text": "After later setbacks, I put together six straight victories to earn another championship opportunity.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-8",
            "text": "That second title shot came against Jan Błachowicz, and I won by second-round submission.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-9",
            "text": "I became a first-time UFC champion at 42 years old, one of the oldest title winners in promotion history.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-10",
            "text": "My late-career championship run and fights with Błachowicz and Jiří Procházka defined one of MMA’s most unusual veteran peaks.",
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
