import type { UfcWhoAmIAuthoredIdentity } from "./ufcWhoAmIAuthoredScripts";

/**
 * Static authored UFC Who Am I batch 3.
 * Source-backed at authoring time; runtime serves these clue strings verbatim.
 */
export const ufcWhoAmIAuthoredBatch3: readonly UfcWhoAmIAuthoredIdentity[] = [
  {
    "subjectId": "ufc:michael-chandler",
    "name": "Michael Chandler",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/michael-chandler",
      "identity1": "https://www.ufc.com/news/dana-white-announces-michael-chandler-signing-ufc-254-backup",
      "identity2": "https://www.ufc.com/athlete/michael-chandler?language_content_entity=en",
      "identity3": "https://www.ufc.com/athlete/michael-chandler?language_content_entity=en",
      "identity4": "https://www.ufc.com/athlete/michael-chandler?language_content_entity=en",
      "identity5": "https://mutigers.com/sports/wrestling/roster/season/2007-08/player/michael-chandler"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-michael-chandler-a-1",
            "text": "I entered a Division I wrestling program as a walk-on and developed into an All-American and team captain.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-michael-chandler-a-2",
            "text": "Before fighting full time, I worked as a wrestling coach at my alma mater.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-michael-chandler-a-3",
            "text": "I had already been a professional mixed martial artist for more than a decade before making my UFC debut.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-michael-chandler-a-4",
            "text": "When I signed with the UFC in 2020, I was brought in as the backup for a lightweight title fight at UFC 254.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-michael-chandler-a-5",
            "text": "My UFC debut ended with a first-round knockout of Dan Hooker.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-chandler-a-6",
            "text": "My second UFC appearance was a fight with Charles Oliveira for the vacant lightweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-chandler-a-7",
            "text": "I later went three rounds with Justin Gaethje in a Madison Square Garden fight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-chandler-a-8",
            "text": "I knocked out Tony Ferguson with a front kick in the second round at UFC 274.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-chandler-a-9",
            "text": "I coached a season of The Ultimate Fighter opposite Conor McGregor.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-michael-chandler-a-10",
            "text": "Known as “Iron,” I arrived in the UFC after a championship run that had already made me a major name outside the promotion.",
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
            "id": "ufc-michael-chandler-b-1",
            "text": "I earned a college degree in personal financial management services and real estate.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-michael-chandler-b-2",
            "text": "Before college wrestling, I was also a multi-year high-school football player.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-michael-chandler-b-3",
            "text": "Two older college teammates who later became major MMA names helped influence my decision to try the sport after wrestling.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "identity3"
            ]
          },
          {
            "id": "ufc-michael-chandler-b-4",
            "text": "Before joining the UFC, my résumé already included wins over Eddie Alvarez and Benson Henderson.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-michael-chandler-b-5",
            "text": "I came to the UFC as a three-time lightweight world champion from another major promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-michael-chandler-b-6",
            "text": "I announced my UFC arrival by stopping Dan Hooker in the first round.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-chandler-b-7",
            "text": "One fight later, I challenged Charles Oliveira for the vacant UFC lightweight title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-chandler-b-8",
            "text": "My UFC run has included fights with Justin Gaethje, Dustin Poirier and Tony Ferguson.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-chandler-b-9",
            "text": "I faced Oliveira a second time in 2024, going five rounds in the rematch.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-chandler-b-10",
            "text": "My “Iron” nickname and a season coaching The Ultimate Fighter opposite Conor McGregor became two recognizable parts of my UFC identity.",
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
    "subjectId": "ufc:brian-ortega",
    "name": "Brian Ortega",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/brian-ortega",
      "identity1": "https://www.espn.com/mma/story/_/id/25456207/the-two-lives-brian-ortega-menacing-streets-ufc-stardom",
      "identity2": "https://www.ufc.com/news/brian-ortega-big-name-hunter",
      "identity3": "https://www.espn.com/general/story?id=22619156&src=desktop",
      "identity4": "https://www.ufc.com/news/brian-ortega-big-name-hunter",
      "identity5": "https://www.ufc.com/news/ortega-happy-showcase-all-skills-ufc-195"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-brian-ortega-a-1",
            "text": "I grew up around difficult circumstances and found a more stable direction through martial arts as a teenager.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-brian-ortega-a-2",
            "text": "Brazilian jiu-jitsu became the foundation of my fighting style before my striking caught up.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-brian-ortega-a-3",
            "text": "From my late teens, I helped teach self-defense techniques to law-enforcement personnel.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-brian-ortega-a-4",
            "text": "My first UFC appearance was originally a submission win but was later overturned to a no contest.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brian-ortega-a-5",
            "text": "I began building momentum with late finishes of Thiago Tavares and Clay Guida.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brian-ortega-a-6",
            "text": "A submission of Cub Swanson extended my unbeaten UFC run and earned me a title shot.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brian-ortega-a-7",
            "text": "My first UFC championship fight ended after four rounds against Max Holloway.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brian-ortega-a-8",
            "text": "After nearly two years away, I returned with a five-round decision win over Chan Sung Jung.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brian-ortega-a-9",
            "text": "I challenged Alexander Volkanovski for the featherweight title in a fight that included several dangerous submission attempts.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brian-ortega-a-10",
            "text": "Rener Gracie gave me the nickname “T-City,” short for “Triangle City,” because of my reputation for triangle chokes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "identity3"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-brian-ortega-b-1",
            "text": "A long-running striking relationship in my career began with humble garage training sessions when I was young.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-brian-ortega-b-2",
            "text": "My earliest martial-arts identity was much more grappling-heavy than the style I later showed in UFC main events.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "identity5"
            ]
          },
          {
            "id": "ufc-brian-ortega-b-3",
            "text": "I entered the UFC in 2014 after beginning my professional career unbeaten.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-brian-ortega-b-4",
            "text": "An overturned debut result meant my official UFC record started unusually.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brian-ortega-b-5",
            "text": "I submitted Diego Brandao and Renato Moicano during the rise that made me a featherweight contender.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brian-ortega-b-6",
            "text": "I finished Cub Swanson with a guillotine choke in the second round.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brian-ortega-b-7",
            "text": "That victory led to a championship fight with Max Holloway at UFC 231.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brian-ortega-b-8",
            "text": "I later defeated Chan Sung Jung over five rounds to earn another shot at UFC gold.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brian-ortega-b-9",
            "text": "My second title opportunity came against Alexander Volkanovski at UFC 266.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brian-ortega-b-10",
            "text": "The “T-City” nickname traces directly to the triangle submissions that made my jiu-jitsu reputation.",
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
    "subjectId": "ufc:ciryl-gane",
    "name": "Ciryl Gane",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/ciryl-gane",
      "identity1": "https://www.cbssports.com/mma/news/ufc-265-ciryl-gane-takes-unusual-path-to-reach-his-potential-greatness-against-derrick-lewis-in-houston/",
      "identity2": "https://www.ufc.com/athlete/ciryl-gane?language_content_entity=en",
      "identity3": "https://www.cbssports.com/mma/news/ufc-265-ciryl-gane-takes-unusual-path-to-reach-his-potential-greatness-against-derrick-lewis-in-houston/",
      "identity4": "https://www.ufc.com/athlete/ciryl-gane?language_content_entity=en",
      "identity5": "https://www.espn.com/mma/story/_/id/33102899/ufc-270-one-gym-paris-launched-careers-francis-ngannou-ciryl-gane-coach-rift-made-rivals"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-ciryl-gane-a-1",
            "text": "I grew up playing team sports, especially soccer and basketball, before entering combat sports relatively late.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-ciryl-gane-a-2",
            "text": "I completed a degree in management and marketing before fighting became my career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-ciryl-gane-a-3",
            "text": "A coworker introduced me to Muay Thai while I was working as a luxury-furniture salesman.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-ciryl-gane-a-4",
            "text": "I became a two-time national Muay Thai champion before switching fully to professional MMA.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-ciryl-gane-a-5",
            "text": "My UFC debut ended with a submission of Raphael Pessoa in 2019.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ciryl-gane-a-6",
            "text": "Wins over Junior dos Santos, Jairzinho Rozenstruik and Alexander Volkov moved me rapidly through the heavyweight rankings.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ciryl-gane-a-7",
            "text": "I stopped Derrick Lewis to win an interim UFC heavyweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ciryl-gane-a-8",
            "text": "My first undisputed title fight came against former training partner Francis Ngannou.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ciryl-gane-a-9",
            "text": "I later earned another heavyweight title opportunity against Jon Jones in 2023.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ciryl-gane-a-10",
            "text": "My résumé combines high-level Muay Thai credentials with an unusually mobile style for a UFC heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity4",
              "profile"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-ciryl-gane-b-1",
            "text": "My combat-sports career started later than that of many elite fighters because team sports occupied much of my youth.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-ciryl-gane-b-2",
            "text": "I was already working a regular sales job when a friend first pulled me toward striking training.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-ciryl-gane-b-3",
            "text": "I transitioned from Muay Thai to MMA only after becoming a champion in the striking sport.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-ciryl-gane-b-4",
            "text": "I entered the UFC in 2019 with only a handful of professional MMA fights behind me.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ciryl-gane-b-5",
            "text": "Coach Fernand Lopez pushed me to stop splitting my focus with Muay Thai and commit fully to MMA.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-ciryl-gane-b-6",
            "text": "I opened my UFC career with seven straight wins.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ciryl-gane-b-7",
            "text": "The seventh was a stoppage of Derrick Lewis for the interim heavyweight title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ciryl-gane-b-8",
            "text": "I lost the unification bout to Francis Ngannou by decision after five rounds.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ciryl-gane-b-9",
            "text": "Stoppage wins over Tai Tuivasa and Serghei Spivac later kept me near the top of the division.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ciryl-gane-b-10",
            "text": "A championship fight with Jon Jones became the other defining title opportunity of my UFC run.",
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
    "subjectId": "ufc:marlon-vera",
    "name": "Marlon Vera",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/marlon-vera",
      "identity1": "https://www.ufc.com/node/68808",
      "identity2": "https://www.ufc.com/news/vera-fighting-daughters-chance-smile",
      "identity3": "https://www.ufc.com/news/vera-fighting-daughters-chance-smile",
      "identity4": "https://www.expreso.ec/deportes/conoce-marlon-vera-chito-ecuador-192366.html",
      "identity5": "https://www.ufc.com/news/marlon-vera-hungrier-ever"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-marlon-vera-a-1",
            "text": "I had little interest in organized sports until I discovered jiu-jitsu as a teenager.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-marlon-vera-a-2",
            "text": "A major early motivation for my fighting career was helping pay for specialized medical treatment for my daughter.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-marlon-vera-a-3",
            "text": "With limited access to MMA gyms and broadcasts growing up, I downloaded fight videos and studied the sport from afar.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-marlon-vera-a-4",
            "text": "I entered the UFC in 2014 after appearing on a Latin American season of The Ultimate Fighter.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-marlon-vera-a-5",
            "text": "A 2020 stoppage of Sean O’Malley became one of the most important wins of my climb.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-marlon-vera-a-6",
            "text": "I later knocked out Frankie Edgar with a front kick at Madison Square Garden.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-marlon-vera-a-7",
            "text": "Wins over Rob Font and Dominick Cruz pushed me into the top tier of the bantamweight division.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-marlon-vera-a-8",
            "text": "A decision loss to Cory Sandhagen slowed that run but did not remove me from the title picture.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-marlon-vera-a-9",
            "text": "My first UFC championship fight came in a rematch with O’Malley at UFC 299.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-marlon-vera-a-10",
            "text": "The nickname “Chito” grew from childhood versions of my name that family members shortened over time.",
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
            "id": "ufc-marlon-vera-b-1",
            "text": "Jiu-jitsu was the sport that finally captured my attention after I had ignored most organized athletics growing up.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-marlon-vera-b-2",
            "text": "My family responsibilities became closely tied to my motivation to make fighting a successful career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-marlon-vera-b-3",
            "text": "I built much of my early MMA knowledge by seeking out fight footage when the sport was difficult to follow where I lived.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-marlon-vera-b-4",
            "text": "My UFC career began with a decision loss in 2014 rather than an immediate breakout.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-marlon-vera-b-5",
            "text": "I became the first fighter from Ecuador to compete in the UFC.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-marlon-vera-b-6",
            "text": "A first-round stoppage of Sean O’Malley in 2020 became a signature result.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-marlon-vera-b-7",
            "text": "I followed later with a front-kick knockout of Frankie Edgar and a head-kick knockout of Dominick Cruz.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-marlon-vera-b-8",
            "text": "Those wins helped carry me to a bantamweight championship opportunity.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-marlon-vera-b-9",
            "text": "I challenged O’Malley for the title in a five-round rematch in 2024.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-marlon-vera-b-10",
            "text": "“Chito” is a family nickname that dates back to shortened childhood versions of my given name.",
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
    "subjectId": "ufc:dominick-reyes",
    "name": "Dominick Reyes",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/dominick-reyes",
      "identity1": "https://stonybrookathletics.com/honors/hall-of-fame/dominick-reyes/108",
      "identity2": "https://kr.ufc.com/athlete/dominick-reyes",
      "identity3": "https://kr.ufc.com/athlete/dominick-reyes",
      "identity4": "https://www.ufcespanol.com/athlete/dominick-reyes",
      "identity5": "https://www.ufcespanol.com/athlete/dominick-reyes"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-dominick-reyes-a-1",
            "text": "Before MMA, I was a four-year college football player and a three-year starting safety.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-dominick-reyes-a-2",
            "text": "I earned a degree in information systems with a business and economics focus.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-dominick-reyes-a-3",
            "text": "Before fighting full time, I worked as a technical-support specialist at a high school.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-dominick-reyes-a-4",
            "text": "I opened my UFC career with six consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-reyes-a-5",
            "text": "A decision over Ovince Saint Preux was followed by a first-round knockout of Chris Weidman.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-reyes-a-6",
            "text": "That run earned me a light heavyweight title fight with Jon Jones in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-reyes-a-7",
            "text": "I went all five rounds with Jones and lost by decision in one of the closest fights of his championship run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-reyes-a-8",
            "text": "My next appearance was another title fight, this time for a vacant belt against Jan Błachowicz.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-reyes-a-9",
            "text": "A later main event with Jiří Procházka ended by spinning-elbow knockout after a back-and-forth fight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-reyes-a-10",
            "text": "My nickname “The Devastator” came from the power of my kicks and the mentality I wanted to bring into competition.",
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
            "id": "ufc-dominick-reyes-b-1",
            "text": "Football, not combat sports, was the athletic path I pursued most seriously before college ended.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-dominick-reyes-b-2",
            "text": "My post-college life included a technical job before MMA became a full-time profession.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-dominick-reyes-b-3",
            "text": "An older brother of mine also became a professional mixed martial artist and reached the UFC.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-dominick-reyes-b-4",
            "text": "Once I entered the UFC, I stayed unbeaten through my first six appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-reyes-b-5",
            "text": "I stopped Jared Cannonier in the first round during that climb.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-reyes-b-6",
            "text": "A later knockout of former middleweight champion Chris Weidman put me directly into title contention.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-reyes-b-7",
            "text": "My first UFC championship fight was a five-round decision with Jon Jones.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-reyes-b-8",
            "text": "I then fought Jan Błachowicz for the vacant light heavyweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-reyes-b-9",
            "text": "The next main event paired me with Jiří Procházka in a fight that ended with a spinning elbow.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-reyes-b-10",
            "text": "“The Devastator” became the nickname attached to the kicking power that helped make my early UFC rise so fast.",
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
    "subjectId": "ufc:dan-hooker",
    "name": "Dan Hooker",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/dan-hooker",
      "identity1": "https://www.espn.com/mma/story/_/id/28740668/dan-hooker-home-ufc-fight-night-auckland-headline-act",
      "identity2": "https://www.ufc.com/athlete/dan-hooker?language_content_entity=en",
      "identity3": "https://www.ufc.com/athlete/dan-hooker?language_content_entity=en",
      "identity4": "https://www.ufc.com/athlete/dan-hooker?language_content_entity=en",
      "identity5": "https://www.ufc.com/athlete/dan-hooker?language_content_entity=en"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-dan-hooker-a-1",
            "text": "Before fighting full time, I worked as a doorman.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-dan-hooker-a-2",
            "text": "I decided to try MMA after watching a friend score a quick knockout and seeing the crowd’s reaction.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-dan-hooker-a-3",
            "text": "Before the UFC, my combat résumé already included championships in kickboxing rulesets.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-dan-hooker-a-4",
            "text": "I began my UFC career at featherweight before eventually settling into a longer lightweight run.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-hooker-a-5",
            "text": "A knee knockout of Ross Pearson helped spark a four-fight winning streak at lightweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-hooker-a-6",
            "text": "That streak included stoppage wins over Jim Miller and Gilbert Burns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-hooker-a-7",
            "text": "A punishing loss to Edson Barboza became a major test before I rebuilt with more contender-level wins.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-hooker-a-8",
            "text": "I went five rounds with Dustin Poirier in a 2020 main event that became one of the year’s most memorable fights.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-hooker-a-9",
            "text": "My UFC résumé later added wins over Jalin Turner and Mateusz Gamrot.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-hooker-a-10",
            "text": "My nickname “The Hangman” came from my love of finishing fights with chokes.",
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
            "id": "ufc-dan-hooker-b-1",
            "text": "My first step into MMA came because I followed a friend into a gym after seeing how exciting a knockout could be.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-dan-hooker-b-2",
            "text": "Working nightclub doors was part of my life before professional fighting paid the bills.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-dan-hooker-b-3",
            "text": "I entered the UFC in 2014 after competing in both MMA and kickboxing.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity4"
            ]
          },
          {
            "id": "ufc-dan-hooker-b-4",
            "text": "My first several UFC years were split between featherweight and lightweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-hooker-b-5",
            "text": "A move toward lightweight produced a run of finishes that changed my standing in the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-hooker-b-6",
            "text": "I knocked out Gilbert Burns before winning a five-round decision over Paul Felder.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-hooker-b-7",
            "text": "My next fight was a five-round decision loss to Dustin Poirier after a high-volume battle.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-hooker-b-8",
            "text": "I later rebounded with decisions over Jalin Turner and Mateusz Gamrot.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-hooker-b-9",
            "text": "Outside the UFC, I have promoted a one-minute fighting concept called “1min Scraps.”",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-dan-hooker-b-10",
            "text": "The nickname “The Hangman” reflects the choke-heavy finishing style I enjoyed developing early in my career.",
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
    "subjectId": "ufc:islam-makhachev",
    "name": "Islam Makhachev",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/islam-makhachev",
      "identity1": "https://www.ufc.com/athlete/islam-makhachev?page=4",
      "identity2": "https://www.ufc.com/athlete/islam-makhachev?page=4",
      "identity3": "https://www.ufc.com/athlete/islam-makhachev?page=4",
      "identity4": "https://www.espn.com/mma/story/_/id/30958405/ufc-259-next-khabib-why-some-believe-islam-makhachev-ready-greatness",
      "identity5": "https://www.washingtonpost.com/sports/2025/11/20/islam-makhachev-ufc-brother-dagestan-fighters/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-islam-makhachev-a-1",
            "text": "I joined the UFC in 2015 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-2",
            "text": "My UFC debut ended with a win by submission.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-3",
            "text": "My UFC career included appearances at both Lightweight and Welterweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-4",
            "text": "I reached my first UFC title opportunity in 2022.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-5",
            "text": "I lost to Adriano Martins by stoppage in 2015.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-6",
            "text": "I beat Chris Wade by decision in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-7",
            "text": "I beat Kajan Johnson by submission in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-8",
            "text": "I beat Arman Tsarukyan by decision in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-9",
            "text": "I won UFC championships in more than one weight class.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-10",
            "text": "I attended Dagestan State University and studied in its athletic or physical-education faculty while developing as a fighter.",
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
            "id": "ufc-islam-makhachev-b-1",
            "text": "My UFC career began in 2015.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-2",
            "text": "I won 2 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-3",
            "text": "One stretch of my UFC career reached 16 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-4",
            "text": "My first UFC title opportunity came after 12 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-5",
            "text": "I beat Leo Kuntz by submission in 2015.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-6",
            "text": "I beat Gleison Tibau by stoppage in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-7",
            "text": "I beat Davi Ramos by decision in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-8",
            "text": "I beat Nik Lentz by decision in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-9",
            "text": "My UFC résumé includes championship victories in two weight classes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-10",
            "text": "I also shared the Octagon with Alexander Volkanovski in 2023.",
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
    "subjectId": "ufc:matt-hughes",
    "name": "Matt Hughes",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/matt-hughes",
      "identity1": "https://www.ufc.com/news/matt-hughes-joins-ufc-front-office",
      "identity2": "https://www.ufc.com/news/matt-hughes-joins-ufc-front-office",
      "identity3": "https://www.ufc.com/news/matt-hughes-joins-ufc-front-office",
      "identity4": "https://www.ufc.com/news/matt-hughes-joins-ufc-front-office",
      "identity5": "https://www.ufc.com/news/brothers-armbars-raw-story"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-matt-hughes-a-1",
            "text": "I joined the UFC in 1999 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-3",
            "text": "I spent most of my UFC career at Welterweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-4",
            "text": "I reached my first UFC title opportunity in 2001.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-5",
            "text": "I lost to Dennis Hallman by submission in 2000.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-6",
            "text": "I beat Marcelo Aguiar by stoppage in 2000.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-7",
            "text": "I beat Royce Gracie by stoppage in 2006.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-8",
            "text": "I beat Joe Riggs by submission in 2005.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-9",
            "text": "I won UFC gold at Welterweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-10",
            "text": "My UFC résumé includes a matchup against Georges St-Pierre in 2004.",
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
            "id": "ufc-matt-hughes-b-1",
            "text": "My UFC career began in 1999.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-2",
            "text": "I won 2 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-3",
            "text": "One stretch of my UFC career reached 6 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-4",
            "text": "My first UFC title opportunity came after 3 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-5",
            "text": "I beat Valeri Ignatov by decision in 1999.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-6",
            "text": "I beat Renzo Gracie by stoppage in 2010.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-7",
            "text": "I beat Renato Verissimo by decision in 2004.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-8",
            "text": "I beat Chris Lytle by decision in 2007.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-9",
            "text": "My UFC career includes a championship victory at Welterweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-10",
            "text": "I also shared the Octagon with Georges St-Pierre in 2006.",
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
    "subjectId": "ufc:stipe-miocic",
    "name": "Stipe Miocic",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/stipe-miocic",
      "identity1": "https://www.ufc.com/news/stipe-miocic-athlete",
      "identity2": "https://www.ufc.com/news/stipe-miocic-athlete",
      "identity3": "https://www.ufc.com/news/stipe-miocic-discovering-his-croatian-roots",
      "identity4": "https://www.ufc.com/news/stipe-miocic-discovering-his-croatian-roots",
      "identity5": "https://kr.ufc.com/athlete/stipe-miocic"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-stipe-miocic-a-1",
            "text": "I joined the UFC in 2011 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-3",
            "text": "I spent most of my UFC career at Heavyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-4",
            "text": "I reached my first UFC title opportunity in 2016.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-5",
            "text": "I beat Joey Beltran by decision in 2011.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-6",
            "text": "I beat Shane del Rosario by stoppage in 2012.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-7",
            "text": "I lost to Stefan Struve by stoppage in 2012.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-8",
            "text": "I beat Gabriel Gonzaga by decision in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-9",
            "text": "I won UFC gold at Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-10",
            "text": "I was a high-level multi-sport athlete in Ohio, earning varsity letters in baseball, football and wrestling before competing in both NCAA wrestling and college baseball.",
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
            "id": "ufc-stipe-miocic-b-1",
            "text": "My UFC career began in 2011.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-3",
            "text": "One stretch of my UFC career reached 6 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-4",
            "text": "My first UFC title opportunity came after 10 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-5",
            "text": "I beat Phil De Fries by stoppage in 2012.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-6",
            "text": "I beat Fabio Maldonado by stoppage in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-7",
            "text": "I beat Roy Nelson by decision in 2013.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-8",
            "text": "I beat Mark Hunt by stoppage in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-9",
            "text": "My UFC career includes a championship victory at Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-10",
            "text": "I also shared the Octagon with Jon Jones in 2024.",
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
    "subjectId": "ufc:merab-dvalishvili",
    "name": "Merab Dvalishvili",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/merab-dvalishvili",
      "identity1": "https://www.ufc.com/athlete/merab-dvalishvili",
      "identity2": "https://www.ufc.com/athlete/merab-dvalishvili",
      "identity3": "https://www.ufc.com/athlete/merab-dvalishvili",
      "identity4": "https://www.ufc.com/athlete/merab-dvalishvili",
      "identity5": "https://www.ufc.com/athlete/merab-dvalishvili"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-merab-dvalishvili-a-1",
            "text": "Before concentrating on MMA, I spent about seven years training in judo and sambo.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-2",
            "text": "My UFC debut ended with a loss by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-3",
            "text": "I spent most of my UFC career at Bantamweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-4",
            "text": "I reached my first UFC title opportunity in 2024.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-5",
            "text": "I lost to Frankie Saenz by decision in 2017.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-6",
            "text": "I beat Terrion Ware by decision in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-7",
            "text": "I beat Gustavo Lopez by decision in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-8",
            "text": "I beat Cody Stamann by decision in 2021.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-9",
            "text": "I won UFC gold at Bantamweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-10",
            "text": "I was one of the fighters whose route to a UFC opportunity ran through Dana White: Lookin' for a Fight.",
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
            "id": "ufc-merab-dvalishvili-b-1",
            "text": "My UFC career began in 2017.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-2",
            "text": "I won 1 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-3",
            "text": "One stretch of my UFC career reached 14 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-4",
            "text": "My first UFC title opportunity came after 12 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-5",
            "text": "I lost to Ricky Simon by submission in 2018.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-6",
            "text": "I beat Brad Katona by decision in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-7",
            "text": "I beat Casey Kenney by decision in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-8",
            "text": "I beat John Dodson by decision in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-9",
            "text": "My UFC career includes a championship victory at Bantamweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-10",
            "text": "I also shared the Octagon with Sean O'Malley in 2025.",
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
    "subjectId": "ufc:cain-velasquez",
    "name": "Cain Velasquez",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/cain-velasquez",
      "identity1": "https://www.ufc.com/news/si-se-puede-cain-velasquez-embodies-mexican-american-pride",
      "identity2": "https://www.ufc.com/news/raising-cain",
      "identity3": "https://www.ufc.com/news/ufc-155-flashback-velasquez-debuts-ufc",
      "identity4": "https://www.ufc.com/news/si-se-puede-cain-velasquez-embodies-mexican-american-pride",
      "identity5": "https://www.ufc.com/news/ufc-155-flashback-velasquez-debuts-ufc"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-cain-velasquez-a-1",
            "text": "I joined the UFC in 2008 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-2",
            "text": "My UFC debut ended with a win by stoppage.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-3",
            "text": "I spent most of my UFC career at Heavyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-4",
            "text": "I reached my first UFC title opportunity in 2010.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-5",
            "text": "I beat Brad Morris by stoppage in 2008.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-6",
            "text": "I beat Denis Stojnic by stoppage in 2009.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-7",
            "text": "I beat Ben Rothwell by stoppage in 2009.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-8",
            "text": "I beat Antonio Rodrigo Nogueira by stoppage in 2010.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-9",
            "text": "I won UFC gold at Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-10",
            "text": "Before MMA, I was a junior-college national champion and later a two-time NCAA All-American wrestler at Arizona State.",
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
            "id": "ufc-cain-velasquez-b-1",
            "text": "My UFC career began in 2008.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-3",
            "text": "One stretch of my UFC career reached 7 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-4",
            "text": "My first UFC title opportunity came after 6 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-5",
            "text": "I beat Jake O'Brien by stoppage in 2008.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-6",
            "text": "I beat Cheick Kongo by decision in 2009.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-7",
            "text": "I beat Travis Browne by stoppage in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-8",
            "text": "I beat Antonio Silva by stoppage in 2012.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-9",
            "text": "My UFC career includes a championship victory at Heavyweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-10",
            "text": "I considered continuing in wrestling toward the 2008 Olympics but chose to pursue MMA instead, joining American Kickboxing Academy after college.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          }
        ]
      }
    }
  }
];
