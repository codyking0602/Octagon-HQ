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
            "text": "Years later I returned to the UFC and beat B.J. Penn in a five-round main event.",
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
            "text": "The wrestler once called “Marty” became UFC champion Kamaru Usman, “The Nigerian Nightmare.”",
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
            "text": "I joined the UFC in 2013 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-3",
            "text": "My UFC career included appearances at both Light Heavyweight and Heavyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-4",
            "text": "I reached my first UFC title opportunity in 2015.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-5",
            "text": "I beat Patrick Cummins by stoppage in 2014.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-6",
            "text": "I beat Frank Mir by decision in 2013.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-7",
            "text": "I beat Anderson Silva by decision in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-8",
            "text": "I beat Alexander Gustafsson by decision in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-9",
            "text": "I won UFC championships in more than one weight class.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-daniel-cormier-a-10",
            "text": "My UFC résumé includes a matchup against Stipe Miocic in 2018.",
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
            "id": "ufc-daniel-cormier-b-1",
            "text": "My UFC career began in 2013.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-3",
            "text": "One stretch of my UFC career reached 4 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-4",
            "text": "My first UFC title opportunity came after 4 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-5",
            "text": "I beat Dan Henderson by submission in 2014.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-6",
            "text": "I beat Roy Nelson by decision in 2013.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-7",
            "text": "I beat Anthony Johnson by submission in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-8",
            "text": "I beat Anthony Johnson by submission in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-9",
            "text": "My UFC résumé includes championship victories in two weight classes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-daniel-cormier-b-10",
            "text": "I also shared the Octagon with Jon Jones in 2015.",
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
            "text": "At about eight years old, I was diagnosed with rheumatoid arthritis and a heart murmur and was initially told to avoid vigorous activity.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-2",
            "text": "My UFC debut ended with a win by submission.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-3",
            "text": "My UFC career included appearances at both Lightweight and Featherweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-4",
            "text": "I reached my first UFC title opportunity in 2021.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-5",
            "text": "I beat Darren Elkins by submission in 2010.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-6",
            "text": "I beat Eric Wisely by submission in 2012.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-7",
            "text": "I beat Andy Ogle by submission in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-8",
            "text": "I beat Will Brooks by submission in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-9",
            "text": "I won UFC gold at Lightweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-charles-oliveira-a-10",
            "text": "My UFC résumé includes a matchup against Islam Makhachev in 2022.",
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
            "id": "ufc-charles-oliveira-b-1",
            "text": "My UFC career began in 2010.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-2",
            "text": "I won 2 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-3",
            "text": "One stretch of my UFC career reached 11 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-4",
            "text": "My first UFC title opportunity came after 27 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-5",
            "text": "I beat Efrain Escudero by submission in 2010.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-6",
            "text": "I beat Jonathan Brookins by submission in 2012.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-7",
            "text": "I beat Myles Jury by submission in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-8",
            "text": "I beat Clay Guida by submission in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-9",
            "text": "My UFC career includes a championship victory at Lightweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-charles-oliveira-b-10",
            "text": "I also shared the Octagon with Justin Gaethje in 2022.",
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
            "text": "I worked full shifts as a union plumber while already competing in the UFC, then coached wrestling before training at night.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-3",
            "text": "My UFC career included appearances at both Lightweight and Featherweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-4",
            "text": "I reached my first UFC title opportunity in 2010.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-5",
            "text": "I beat Mark Bocek by stoppage in 2007.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-6",
            "text": "I lost to Marlon Vera by stoppage in 2021.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-7",
            "text": "I beat Tyson Griffin by decision in 2007.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-8",
            "text": "I beat Hermes França by decision in 2008.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-9",
            "text": "I won UFC gold at Lightweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-frankie-edgar-a-10",
            "text": "I earned a bachelor's degree in Political Science from Clarion University.",
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
            "id": "ufc-frankie-edgar-b-1",
            "text": "My UFC career began in 2007.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-3",
            "text": "One stretch of my UFC career reached 5 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-4",
            "text": "My first UFC title opportunity came after 7 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-5",
            "text": "I beat Matt Veach by submission in 2009.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-6",
            "text": "I lost to Chris Gutiérrez by stoppage in 2022.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-7",
            "text": "I beat Spencer Fisher by decision in 2007.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-8",
            "text": "I beat Jeremy Stephens by decision in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-9",
            "text": "My UFC career includes a championship victory at Lightweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-frankie-edgar-b-10",
            "text": "I also shared the Octagon with B.J. Penn in 2010.",
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
            "text": "I fell in love with wrestling after wandering into a wrestling room and later became a two-time NAIA All-American at Dana College.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-3",
            "text": "My UFC career included appearances at both Lightweight and Welterweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-4",
            "text": "I reached my first UFC title opportunity in 2012.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-5",
            "text": "I beat Mark Bocek by decision in 2011.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-6",
            "text": "I beat Brandon Thatch by submission in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-7",
            "text": "I lost to Donald Cerrone by decision in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-8",
            "text": "I beat Clay Guida by decision in 2011.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-9",
            "text": "I won UFC gold at Lightweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-benson-henderson-a-10",
            "text": "I double-majored in criminal justice and sociology in college.",
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
            "id": "ufc-benson-henderson-b-1",
            "text": "After college, I passed police testing and received job offers from departments in Omaha and Denver, but chose to pursue MMA instead.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-3",
            "text": "One stretch of my UFC career reached 7 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-4",
            "text": "My first UFC title opportunity came after 3 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-5",
            "text": "I beat Rustam Khabilov by submission in 2014.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-6",
            "text": "I beat Jorge Masvidal by decision in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-7",
            "text": "I beat Jim Miller by decision in 2011.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-8",
            "text": "I beat Josh Thomson by decision in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-9",
            "text": "My UFC career includes a championship victory at Lightweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-benson-henderson-b-10",
            "text": "I also shared the Octagon with Frankie Edgar in 2012.",
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
            "text": "I earned a Brazilian jiu-jitsu black belt in less than three years and became the first American to win a black-belt world championship, helping establish 'The Prodigy' identity.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-bj-penn-a-2",
            "text": "My UFC debut ended with a win by stoppage.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-bj-penn-a-3",
            "text": "My UFC career included appearances at both Lightweight and Welterweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-bj-penn-a-4",
            "text": "I reached my first UFC title opportunity in 2002.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-bj-penn-a-5",
            "text": "I lost to Ryan Hall by submission in 2018.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-a-6",
            "text": "I beat Joey Gilbert by stoppage in 2001.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-a-7",
            "text": "I beat Duane Ludwig by submission in 2003.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-a-8",
            "text": "I lost to Yair Rodriguez by stoppage in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-a-9",
            "text": "I won UFC championships in more than one weight class.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-bj-penn-a-10",
            "text": "My UFC résumé includes a matchup against Matt Hughes in 2004.",
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
            "id": "ufc-bj-penn-b-1",
            "text": "My UFC career began in 2001.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-bj-penn-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-bj-penn-b-3",
            "text": "One stretch of my UFC career reached 3 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-bj-penn-b-4",
            "text": "My first UFC title opportunity came after 3 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-bj-penn-b-5",
            "text": "I lost to Clay Guida by decision in 2019.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-b-6",
            "text": "I beat Paul Creighton by stoppage in 2002.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-b-7",
            "text": "I lost to Dennis Siver by decision in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-b-8",
            "text": "I beat Din Thomas by stoppage in 2001.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-bj-penn-b-9",
            "text": "My UFC résumé includes championship victories in two weight classes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-bj-penn-b-10",
            "text": "I also shared the Octagon with Georges St-Pierre in 2009.",
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
            "text": "I joined the UFC in 2012 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-2",
            "text": "My UFC debut ended with a win by submission.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-3",
            "text": "I spent most of my UFC career at Light Heavyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-4",
            "text": "I reached my first UFC title opportunity in 2014.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-5",
            "text": "I beat Kyle Kingsbury by submission in 2012.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-6",
            "text": "I beat Karl Roberson by submission in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-7",
            "text": "I beat James Te Huna by submission in 2013.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-8",
            "text": "I beat Jared Cannonier by decision in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-9",
            "text": "I won UFC gold at Light Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-glover-teixeira-a-10",
            "text": "I grew up in the rural Brazilian town of Sobrália on a farm before emigrating to the United States as a teenager.",
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
            "id": "ufc-glover-teixeira-b-1",
            "text": "My UFC career began in 2012.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-3",
            "text": "One stretch of my UFC career reached 6 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-4",
            "text": "My first UFC title opportunity came after 5 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-5",
            "text": "I beat Fábio Maldonado in 2012.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-6",
            "text": "I lost to Corey Anderson by decision in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-7",
            "text": "I beat Patrick Cummins by stoppage in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-8",
            "text": "I beat Misha Cirkunov by stoppage in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-9",
            "text": "My UFC career includes a championship victory at Light Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-glover-teixeira-b-10",
            "text": "I also shared the Octagon with Jan Błachowicz in 2021.",
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
