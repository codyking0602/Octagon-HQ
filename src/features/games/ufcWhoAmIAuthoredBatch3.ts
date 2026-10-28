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
            "text": "Before joining the UFC, my résumé already included championships and major wins in another promotion.",
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
            "text": "I began training around age 10 because I wanted to become stronger and better able to defend myself.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-2",
            "text": "Before UFC fame, I built an elite combat-sambo résumé with world, European and Russian titles.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-3",
            "text": "I studied in the athletic or physical-education faculty at a university while developing as a fighter.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-4",
            "text": "My UFC career began in 2015 and included an early setback before a very long winning run.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-5",
            "text": "After a knockout loss in my second UFC appearance, I went years without another defeat.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-6",
            "text": "I submitted Charles Oliveira to win the vacant UFC lightweight championship in 2022.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-7",
            "text": "My first title defense was a five-round decision over Alexander Volkanovski.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-8",
            "text": "I knocked Volkanovski out in the first round of their rematch later that year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-9",
            "text": "I submitted Dustin Poirier in the fifth round of a 2024 title defense.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-a-10",
            "text": "I grew up in the same training system as Khabib Nurmagomedov and was developed under his father, Abdulmanap.",
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
            "id": "ufc-islam-makhachev-b-1",
            "text": "A member of my family gave up his own fighting ambitions and worked to help support my training path.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-2",
            "text": "Combat sambo was a major part of my competitive identity before the UFC.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-3",
            "text": "I entered the UFC as a grappling-heavy prospect in 2015.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "ledger"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-4",
            "text": "My only UFC loss came early, and I followed it with a winning streak that lasted for years.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-5",
            "text": "A 2019 decision over Arman Tsarukyan became one of the more technical fights of my rise.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-6",
            "text": "Later finishes of Dan Hooker and Bobby Green pushed me to the front of the lightweight title picture.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-7",
            "text": "I won the championship by submitting Charles Oliveira at UFC 280.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-8",
            "text": "My title reign included two victories over featherweight champion Alexander Volkanovski.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-9",
            "text": "I later submitted Dustin Poirier in a fifth-round championship finish.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-islam-makhachev-b-10",
            "text": "My career has been closely linked to Khabib Nurmagomedov, first as a longtime teammate and later as part of the coaching corner around my title run.",
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
            "text": "Before MMA, I was a two-time NCAA Division I All-American wrestler.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-2",
            "text": "Even while fighting professionally, I stayed closely tied to rural life and operated an agricultural company.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-3",
            "text": "My UFC career began in 1999 after I had already accumulated significant professional experience.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-4",
            "text": "Within a few UFC appearances, I reached my first welterweight championship fight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-5",
            "text": "I won the title by lifting Carlos Newton while caught in a triangle choke and slamming him unconscious.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-6",
            "text": "That first reign included five successful title defenses before BJ Penn submitted me.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-7",
            "text": "I regained the vacant championship by submitting Georges St-Pierre in 2004.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-8",
            "text": "I later stopped Frank Trigg in a famous comeback after surviving deep trouble early in the fight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-9",
            "text": "A 2006 stoppage of Royce Gracie became another signature win of my championship era.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-a-10",
            "text": "I became a two-time UFC welterweight champion and one of the defining wrestlers of the promotion’s early 2000s era.",
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
            "id": "ufc-matt-hughes-b-1",
            "text": "My identical twin brother was also a wrestler and professional fighter, and we entered MMA around the same time.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-2",
            "text": "I remained involved with youth and community work in my hometown area even after becoming a champion.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-3",
            "text": "My wrestling background drove a pressure-heavy style built around takedowns and top control.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-4",
            "text": "I first appeared in the UFC in 1999, years before the promotion’s reality-TV boom.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-5",
            "text": "A dramatic slam of Carlos Newton gave me my first UFC championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-6",
            "text": "My title history later included a trilogy with Georges St-Pierre and multiple fights with BJ Penn.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-7",
            "text": "I submitted St-Pierre for a vacant belt before losing the championship to him in their rematch.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-8",
            "text": "I also defeated Royce Gracie in a high-profile meeting of dominant grappling styles.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-9",
            "text": "After my championship career, I moved into a UFC front-office role involving athlete development and government relations.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-matt-hughes-b-10",
            "text": "My twin brother remained part of my training and corner while I built a Hall-of-Fame-level welterweight career.",
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
            "text": "Before MMA, I was a high-level multi-sport athlete who competed in baseball, football and wrestling.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-2",
            "text": "I also won a regional Golden Gloves boxing tournament before committing fully to mixed martial arts.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-3",
            "text": "Even after becoming a UFC star, I continued working as a firefighter and paramedic.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-4",
            "text": "I joined the UFC in 2011 and needed several years to climb into the heavyweight title picture.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-5",
            "text": "I knocked out Fabricio Werdum in Brazil to win the UFC heavyweight championship in 2016.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-6",
            "text": "I defended the belt by stopping Alistair Overeem and Junior dos Santos.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-7",
            "text": "A five-round win over Francis Ngannou gave me a third consecutive successful heavyweight title defense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-8",
            "text": "Daniel Cormier ended that reign by first-round knockout in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-9",
            "text": "I stopped Cormier in their rematch to regain the belt and then beat him again to win the trilogy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-a-10",
            "text": "My championship run established the UFC heavyweight record for consecutive successful title defenses.",
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
            "id": "ufc-stipe-miocic-b-1",
            "text": "My path into MMA started when I went to a gym to help someone else prepare for a fight and became drawn into the sport myself.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-2",
            "text": "College athletics had already given me serious experience in both wrestling and baseball before I became a fighter.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-3",
            "text": "I kept a public-service career outside the cage even while competing at the highest level.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-4",
            "text": "My UFC career began with three straight wins before I suffered my first loss in the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-5",
            "text": "A five-round stoppage of Mark Hunt helped launch the run that carried me to a title shot.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-6",
            "text": "I won the heavyweight belt by knocking out Fabricio Werdum in the first round.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-7",
            "text": "My title defenses included finishes of Alistair Overeem and Junior dos Santos plus a decision over Francis Ngannou.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-8",
            "text": "I lost the championship to Daniel Cormier and later won it back from him.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-9",
            "text": "The Cormier rivalry ended with me winning a five-round decision in their third fight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-stipe-miocic-b-10",
            "text": "The firefighter-paramedic identity remained one of the most recognizable parts of my life outside a record-setting UFC heavyweight reign.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity3",
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
            "text": "Before focusing on MMA, I spent years training in judo and sambo.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-2",
            "text": "I studied physical education in college before professional fighting became my livelihood.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-3",
            "text": "I worked in construction before I was able to make fighting my full-time career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-4",
            "text": "My path to a UFC opportunity included appearing on Dana White: Lookin’ for a Fight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-5",
            "text": "I lost my first two UFC appearances, then began a long winning streak.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-6",
            "text": "That streak eventually included wins over Marlon Moraes and former champion José Aldo.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-7",
            "text": "Against Petr Yan, I set an exhausting pace built around repeated takedown attempts over five rounds.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-8",
            "text": "I followed that with a decision over former two-division champion Henry Cejudo.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-9",
            "text": "I beat Sean O’Malley over five rounds to win the UFC bantamweight championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-a-10",
            "text": "Known as “The Machine,” I built my identity around relentless pace, wrestling pressure and cardio.",
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
            "id": "ufc-merab-dvalishvili-b-1",
            "text": "My pre-UFC combat résumé included a national sambo championship and a European youth sambo medal.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-2",
            "text": "Construction work was part of my life before fighting became financially sustainable.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-3",
            "text": "I entered the UFC in 2017 and immediately had to recover from two losses.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-4",
            "text": "After that 0-2 start, I went years without another UFC defeat.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-5",
            "text": "A comeback stoppage of Marlon Moraes became one of the most dramatic wins of that run.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-6",
            "text": "I then beat José Aldo by decision before facing Petr Yan in a five-round main event.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-7",
            "text": "My pace against Yan produced one of the highest-volume takedown-attempt performances in UFC history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-8",
            "text": "A win over Henry Cejudo put me directly in line for a championship opportunity.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-9",
            "text": "I took the bantamweight belt from Sean O’Malley by unanimous decision.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-merab-dvalishvili-b-10",
            "text": "The nickname “The Machine” fits the relentless wrestling volume that became the signature of my UFC rise.",
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
            "text": "I grew up in a family whose early U.S. story included migrant farm work and seasonal agricultural jobs.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-2",
            "text": "I earned a university degree in education while building my wrestling career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-3",
            "text": "Before MMA, I was a junior-college national champion and later a two-time NCAA All-American wrestler.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-4",
            "text": "I considered continuing toward the Olympics in wrestling before choosing professional MMA instead.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-5",
            "text": "A first-round knockout of Antônio Rodrigo Nogueira put me into the UFC heavyweight title picture.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-6",
            "text": "I stopped Brock Lesnar in the first round to win the heavyweight championship in 2010.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-7",
            "text": "Junior dos Santos took the belt from me in just over a minute in my first defense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-8",
            "text": "I regained the title by dominating dos Santos over five rounds in their rematch.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-9",
            "text": "My second reign included a stoppage of Antônio Silva and another five-round win over dos Santos.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-a-10",
            "text": "My “Brown Pride” chest tattoo is tied to my Mexican heritage and the sacrifices I associate with my parents’ immigration story.",
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
            "id": "ufc-cain-velasquez-b-1",
            "text": "Wrestling was my main competitive path before I ever fought professionally.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-2",
            "text": "My parents’ work history and immigration story became an important part of how I talked about identity and motivation.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "identity2"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-3",
            "text": "I completed a college degree while competing as an elite wrestler.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-4",
            "text": "After college, I chose MMA over trying to continue toward the 2008 Olympic wrestling cycle.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-5",
            "text": "My first several UFC wins were built on pace, wrestling and heavy ground striking at heavyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-6",
            "text": "A quick knockout of Antônio Rodrigo Nogueira earned me a title fight with Brock Lesnar.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-7",
            "text": "I stopped Lesnar to become champion, then lost the belt to Junior dos Santos in my next fight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-8",
            "text": "Two wins later, I beat dos Santos over five rounds to become champion again.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-9",
            "text": "The dos Santos rivalry became a trilogy, with me winning the final two meetings.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cain-velasquez-b-10",
            "text": "I became a two-time UFC heavyweight champion whose “Brown Pride” tattoo made my Mexican-American heritage visibly central to my public identity.",
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
  }
];
