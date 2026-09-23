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
            "text": "I grew up in a working-class family and took ordinary jobs to support myself before fighting paid the bills.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "identity2"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-2",
            "text": "My first martial art was capoeira rather than boxing or wrestling.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-3",
            "text": "Brazilian jiu-jitsu training became the bridge that convinced people around me I could pursue MMA seriously.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-4",
            "text": "I entered the UFC in 2008 and began my run with a string of heavyweight victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-5",
            "text": "I knocked out Fabricio Werdum in the first round of my UFC debut.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-6",
            "text": "Wins over Roy Nelson and Shane Carwin carried me into my first heavyweight title opportunity.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-7",
            "text": "I knocked out Cain Velasquez in just over a minute to win the UFC heavyweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-8",
            "text": "Velasquez took the belt back in a five-round rematch, and we eventually completed a trilogy.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-9",
            "text": "I later challenged Stipe Miocic for the heavyweight title after having beaten him in an earlier five-round fight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-a-10",
            "text": "My nickname “Cigano” came from a long-haired look that reminded people of a gypsy character from a Brazilian soap opera.",
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
            "id": "ufc-junior-dos-santos-b-1",
            "text": "When I moved away from home as a young man, I supported myself with jobs such as washing dishes and selling ice cream.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-2",
            "text": "My combat-sports path started with capoeira before expanding into jiu-jitsu and boxing.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3",
              "identity4"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-3",
            "text": "I reached the UFC after only a few years as a professional mixed martial artist.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-4",
            "text": "My first several UFC appearances established me as a fast-rising heavyweight striker.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-5",
            "text": "A debut knockout of Fabricio Werdum immediately announced me as a contender.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-6",
            "text": "I later beat Mirko Cro Cop, Roy Nelson and Shane Carwin during an unbeaten UFC climb.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-7",
            "text": "A first-round knockout of Cain Velasquez made me UFC heavyweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-8",
            "text": "My championship story became closely linked to Velasquez through three fights.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-9",
            "text": "I also had two UFC meetings with Stipe Miocic, including a later championship challenge.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-junior-dos-santos-b-10",
            "text": "The “Cigano” nickname stuck from my appearance even though I initially disliked the comparison that created it.",
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
            "text": "My athletic foundation was elite wrestling, including two NCAA Division I All-American seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-2",
            "text": "I earned a business degree and later pursued graduate work in public administration.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-3",
            "text": "Before fighting full time, I worked as a college wrestling coach.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-4",
            "text": "I reached the UFC in 2013 after building much of my early professional résumé elsewhere.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-5",
            "text": "I knocked out Josh Koscheck in the first round during my climb at welterweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-6",
            "text": "A first-round knockout of Dong Hyun Kim helped keep me near the top of the division.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-7",
            "text": "I stopped Robbie Lawler in the first round to win the UFC welterweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-8",
            "text": "My first two title defenses came in back-to-back fights with Stephen Thompson, first a draw and then a decision win.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-9",
            "text": "I later defended the belt against Demian Maia and Darren Till before losing it to Kamaru Usman.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-a-10",
            "text": "Alongside fighting, I built an acting résumé that included an appearance in Straight Outta Compton.",
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
            "text": "I grew up in a large household and have spoken about experiencing an eviction while I was young.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-2",
            "text": "Wrestling carried me from an undefeated high-school state-title season to Big 12 and NCAA success.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-3",
            "text": "My education included both business and public-administration studies.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-4",
            "text": "I arrived in the UFC after already fighting at a high level in another major promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-5",
            "text": "My UFC debut lasted less than a minute before I stopped Jay Hieron.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-6",
            "text": "A knockout of Robbie Lawler made me welterweight champion in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-7",
            "text": "The first defense of my title ended in a majority draw with Stephen Thompson.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-8",
            "text": "I beat Thompson in the rematch and later defended successfully against Demian Maia and Darren Till.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-9",
            "text": "Kamaru Usman ended my championship reign with a five-round decision.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tyron-woodley-b-10",
            "text": "My career combined NCAA-level wrestling, UFC championship success and work in film and television.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "identity5",
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
            "text": "Before MMA paid the bills, I worked jobs that included waiting tables, masonry and helping with boat rides.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-2",
            "text": "I competed in both Brazilian jiu-jitsu and Muay Thai before choosing MMA as my professional path.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-3",
            "text": "My route into the UFC included a season of The Ultimate Fighter built around flyweight contenders.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-4",
            "text": "I entered the UFC in 2017 and spent years working through a crowded flyweight division.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-5",
            "text": "A decision win over Brandon Moreno in 2018 became an important early result in a rivalry that would continue later.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-6",
            "text": "I submitted Brandon Royval in the second round during my climb toward a title shot.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-7",
            "text": "I beat Moreno by split decision in 2023 to win the UFC flyweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-8",
            "text": "My first defense was a five-round decision over Royval in a rematch.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-9",
            "text": "I then defended the title in another five-round fight against Steve Erceg.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-a-10",
            "text": "Known as “The Cannibal,” I built my championship run around relentless grappling, pressure and durability.",
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
            "id": "ufc-alex-pantoja-b-1",
            "text": "I grew up in modest circumstances and saw fighting as a possible route to a better life.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-2",
            "text": "Before fighting became financially stable, I worked a long list of ordinary jobs to support myself.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-3",
            "text": "There was a period of my UFC career when I drove for Uber while dealing with an ACL injury and family expenses.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-4",
            "text": "I had to navigate setbacks and long gaps between major opportunities before reaching a title fight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-5",
            "text": "My UFC history with Brandon Moreno began with a decision win years before either of us fought for the belt against the other.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-6",
            "text": "A submission of Brandon Royval helped push me toward the top of the flyweight rankings.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-7",
            "text": "I took the championship from Moreno in a five-round split decision at UFC 290.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-8",
            "text": "I defended the belt against Royval and Steve Erceg in consecutive five-round fights.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-9",
            "text": "Around my first Royval fight, I spoke openly about wanting fighting success to improve my family’s situation.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-alex-pantoja-b-10",
            "text": "The nickname “The Cannibal” became attached to the aggressive grappling style that carried me to UFC flyweight gold.",
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
            "text": "I began learning Brazilian jiu-jitsu when I was very young, long before MMA became a career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-2",
            "text": "Before fighting paid the bills, I worked as a cashier at a clothing retailer.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-3",
            "text": "My pre-UFC grappling résumé included a runner-up finish in a European jiu-jitsu competition.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-4",
            "text": "I entered the UFC unbeaten and kept that professional record intact through my early appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-5",
            "text": "I knocked out Ryan Hall in the first round in 2021.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-6",
            "text": "A submission of Bryce Mitchell and a five-round win over Josh Emmett moved me into title contention.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-7",
            "text": "I knocked out Alexander Volkanovski in the second round to win the UFC featherweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-8",
            "text": "In my first title defense, I became the first fighter to knock out Max Holloway.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-9",
            "text": "My unbeaten UFC rise included stoppage wins by both knockout and submission before I ever fought for gold.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-a-10",
            "text": "My public identity bridges Georgia and Spain, and the nickname “El Matador” became closely tied to my championship rise.",
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
            "id": "ufc-ilia-topuria-b-1",
            "text": "Grappling rather than striking was the first major foundation of my combat-sports development.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "identity4"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-2",
            "text": "I had a regular retail job before professional fighting became financially sustainable.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-3",
            "text": "My pre-UFC résumé included winning the Arnold Fighter tournament.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-4",
            "text": "Once I reached the UFC, I stayed unbeaten while gradually moving from prospect to main-event contender.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-5",
            "text": "I stopped Jai Herbert with a knockout after surviving serious trouble earlier in the fight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-6",
            "text": "I then submitted Bryce Mitchell and dominated Josh Emmett over five rounds.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-7",
            "text": "A second-round knockout of Alexander Volkanovski made me featherweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-8",
            "text": "I defended the title by knocking out Max Holloway, something no previous opponent had done.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-9",
            "text": "My career story became closely associated with both Georgia and Spain as I rose to UFC gold.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-ilia-topuria-b-10",
            "text": "The nickname “El Matador” became one of the clearest identifiers of my unbeaten championship run.",
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
            "text": "Before fighting became my full-time profession, I worked as an apprentice electrician.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-2",
            "text": "My martial-arts background eventually included black belts in Brazilian jiu-jitsu, hapkido and karate.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-3",
            "text": "I entered the UFC by winning a season of The Ultimate Fighter built around fighters from Australia and the United Kingdom.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-4",
            "text": "I began in the UFC at welterweight before a move up changed the trajectory of my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-5",
            "text": "At middleweight, wins over Uriah Hall and Derek Brunson helped launch a long winning streak.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-6",
            "text": "I stopped Ronaldo Souza and then beat Yoel Romero to win an interim UFC middleweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-7",
            "text": "I later became the undisputed champion and beat Romero again in a five-round rematch.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-8",
            "text": "Israel Adesanya ended my title reign by second-round knockout in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-9",
            "text": "I rebuilt with wins over Darren Till, Jared Cannonier and Kelvin Gastelum before earning a rematch with Adesanya.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-a-10",
            "text": "Known as “The Reaper,” I became one of the defining middleweights of the era between the Silva and Adesanya title runs.",
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
            "id": "ufc-robert-whittaker-b-1",
            "text": "I have consistently described providing for my family as the main reason I compete.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-2",
            "text": "Reading and video games are among the hobbies I have repeatedly listed away from training.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-3",
            "text": "The challenge of testing myself competitively was a major reason I committed to fighting as a career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-4",
            "text": "My UFC career changed significantly after I left welterweight and moved to middleweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-5",
            "text": "A long middleweight winning streak eventually included a knockout of Derek Brunson and a stoppage of Ronaldo Souza.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-6",
            "text": "I beat Yoel Romero over five rounds to win interim championship gold.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-7",
            "text": "I later entered a second five-round fight with Romero after being elevated to undisputed champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-8",
            "text": "My title reign ended against Israel Adesanya in front of a massive crowd in Melbourne.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-9",
            "text": "I later earned another championship fight with Adesanya after rebuilding through three straight wins.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-robert-whittaker-b-10",
            "text": "The nickname “The Reaper” became attached to a career that included an Ultimate Fighter win and UFC middleweight championship.",
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
            "text": "I earned a bachelor’s degree in psychology and later a master’s degree in physical education.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-2",
            "text": "After college wrestling, I stayed at my university as an assistant coach while attending graduate school.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-3",
            "text": "I became absorbed in Brazilian jiu-jitsu after first helping local MMA fighters with their wrestling.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-4",
            "text": "I entered the UFC in 2011 after choosing to wait for that opportunity rather than sign quickly elsewhere.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-5",
            "text": "A knockout of Mark Muñoz put me into the middleweight championship picture.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-6",
            "text": "I knocked out Anderson Silva in the second round to win the UFC middleweight title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-7",
            "text": "In the rematch, I retained the belt when Silva suffered a leg injury after I checked a kick.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-8",
            "text": "I then defended successfully against Lyoto Machida and Vitor Belfort.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-9",
            "text": "Luke Rockhold ended my championship reign with a fourth-round stoppage.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-a-10",
            "text": "Known as “The All-American,” I became the fighter who ended Silva’s record-setting UFC title reign.",
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
            "id": "ufc-chris-weidman-b-1",
            "text": "Early in my grappling transition, I entered a major tournament and submitted all 13 opponents while winning both my weight class and the absolute division.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-2",
            "text": "I balanced graduate school and wrestling coaching while trying to build a path toward professional MMA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-3",
            "text": "As a young husband and father living in a basement apartment, I turned down quicker-paying opportunities because I wanted the UFC.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-4",
            "text": "My UFC start stayed unbeaten through several appearances as my wrestling and jiu-jitsu translated quickly.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-5",
            "text": "A second-round knockout of Mark Muñoz made me the leading challenger at middleweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-6",
            "text": "I ended Anderson Silva’s long championship reign with a knockout at UFC 162.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-7",
            "text": "Our rematch ended when Silva broke his leg on a checked kick.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-8",
            "text": "I later defended the championship over Lyoto Machida and Vitor Belfort.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-9",
            "text": "My first professional loss came when Luke Rockhold stopped me in a title fight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chris-weidman-b-10",
            "text": "The “All-American” nickname fit a résumé that combined elite college wrestling with the UFC middleweight championship.",
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
            "text": "I began martial-arts training around age 14 because combat sports gave me an outlet that other athletics did not.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-2",
            "text": "I turned professional as a teenager, so fighting became essentially my only adult career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-3",
            "text": "A serious motorcycle crash caused major injuries and kept me out of competition for nearly two years.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-4",
            "text": "My UFC career began at welterweight before I later established myself at middleweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-5",
            "text": "After returning from the motorcycle crash, I put together a long winning run that included Uriah Hall.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-6",
            "text": "A knockout loss to Alex Pereira interrupted that rise before I rebuilt with more main-event wins.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-7",
            "text": "I entered a middleweight title fight with Israel Adesanya as a major underdog and beat him over five rounds.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-8",
            "text": "That upset made me UFC middleweight champion in 2023.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-9",
            "text": "I lost the belt by split decision to Dricus du Plessis and later fought him again in a championship rematch.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-a-10",
            "text": "I have described my public persona as unfiltered rather than a character created for promotion.",
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
            "id": "ufc-sean-strickland-b-1",
            "text": "Professional fighting has been my main occupation since I was still a teenager.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-2",
            "text": "Outside the gym, I have described spending time with dogs, motorcycles and recreational shooting among my interests.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-3",
            "text": "My career survived a motorcycle accident serious enough to keep me out for an extended period.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-4",
            "text": "I returned to UFC competition and eventually built a middleweight winning streak.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-5",
            "text": "A five-round decision over Uriah Hall moved me into the upper tier of the division.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-6",
            "text": "After a loss to Alex Pereira, wins over Nassourdine Imavov and Abus Magomedov rebuilt my momentum.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-7",
            "text": "I outpointed Israel Adesanya over five rounds to take the middleweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-8",
            "text": "My first title defense ended in a split-decision loss to Dricus du Plessis.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-9",
            "text": "I later earned another title fight with du Plessis after beating Paulo Costa.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-strickland-b-10",
            "text": "The blunt, confrontational personality fans associate with me is one I have repeatedly said is not an invented fight persona.",
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
            "text": "I grew up working in my family’s piñata business while I trained.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-2",
            "text": "I started MMA around age 12 mainly as exercise after describing myself as a kid who loved video games and junk food.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-3",
            "text": "Before fighting became a realistic career, I had considered studying law.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-4",
            "text": "My path to the UFC included The Ultimate Fighter and eventually two separate stints with the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-5",
            "text": "After being released from the UFC, I fought outside the promotion and earned my way back.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-6",
            "text": "My first UFC title fight with Deiveson Figueiredo ended in a draw after five rounds.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-7",
            "text": "I submitted Figueiredo in their rematch to win the flyweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-8",
            "text": "After losing the belt, I stopped Kai Kara-France to win an interim title and set up a fourth fight with Figueiredo.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-9",
            "text": "I beat Figueiredo in that fourth meeting to become undisputed champion again.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-a-10",
            "text": "The nickname “Assassin Baby” dates to my teenage professional debut, when an announcer played off my youthful appearance.",
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
            "id": "ufc-brandon-moreno-b-1",
            "text": "My parents required me to keep helping with the family business while I trained toward a fighting career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "identity4"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-2",
            "text": "LEGO building became one of my most recognizable hobbies away from the cage.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-3",
            "text": "I entered the UFC as a young flyweight prospect, was later released, and eventually returned.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-4",
            "text": "My second UFC stint proved far more successful than the first.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-5",
            "text": "A first-round knockout of Brandon Royval helped move me into my first title opportunity.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-6",
            "text": "That championship fight with Deiveson Figueiredo ended in a majority draw.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-7",
            "text": "I won the rematch by third-round submission and became the first Mexican-born UFC champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-8",
            "text": "Our rivalry eventually stretched to four fights, with the belt changing hands along the way.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-9",
            "text": "I also won an interim flyweight title by stopping Kai Kara-France.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brandon-moreno-b-10",
            "text": "“Assassin Baby” became the nickname attached to a career that went from a teenage-looking debutant to a two-time UFC champion.",
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
            "text": "Before MMA became my profession, my original career plan was to become a police officer.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-2",
            "text": "I wrestled at the NCAA Division I level in college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-3",
            "text": "I graduated with a degree in psychology before committing fully to fighting.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-4",
            "text": "My route into the UFC came through The Ultimate Fighter, where I competed above my natural weight class.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-5",
            "text": "I won that heavyweight season by beating Brad Imes in the finale.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-6",
            "text": "Back at light heavyweight, a knockout of Chuck Liddell became the biggest win of my rise.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-7",
            "text": "I stopped Forrest Griffin to win the UFC light heavyweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-8",
            "text": "Lyoto Machida ended my title reign with a second-round knockout.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-9",
            "text": "I later beat Quinton Jackson and earned another title opportunity against Jon Jones.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-a-10",
            "text": "Known as “Suga,” I eventually entered the UFC Hall of Fame after a career that began with an unlikely heavyweight reality-show run.",
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
            "id": "ufc-rashad-evans-b-1",
            "text": "Fighting was not originally my life plan; I expected to pursue law enforcement after college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "identity4"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-2",
            "text": "My college athletic background came from Division I wrestling.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-3",
            "text": "Psychology was my academic field before professional MMA took over.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-4",
            "text": "I accepted a heavyweight spot on The Ultimate Fighter even though I was naturally closer to light heavyweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-5",
            "text": "Winning that season launched an unbeaten start to my UFC career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-6",
            "text": "I knocked out Chuck Liddell in the second round in 2008.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-7",
            "text": "My next fight ended with me stopping Forrest Griffin to become light heavyweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-8",
            "text": "I lost the belt to Lyoto Machida, then rebuilt with wins over Thiago Silva, Quinton Jackson and Phil Davis.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-9",
            "text": "That comeback produced a championship fight with former teammate Jon Jones.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rashad-evans-b-10",
            "text": "The nickname “Suga” and my Ultimate Fighter-to-champion path became the clearest identifiers of my UFC career.",
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
            "text": "Before fighting became my career, I worked as a customer-service representative.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-2",
            "text": "My combat-sports foundation began with wrestling when I was still in middle school.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-3",
            "text": "I developed a movement-heavy striking style that looked very different from more conventional boxing stances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-4",
            "text": "I entered the UFC already carrying championship status from the WEC merger.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-5",
            "text": "I defended the UFC bantamweight title against Urijah Faber in 2011.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-6",
            "text": "A long injury cycle then included multiple ACL surgeries and other major setbacks that kept me out for years.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-7",
            "text": "I returned after nearly three years away and stopped Takeya Mizugaki in just over a minute.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-8",
            "text": "After another injury layoff, I beat T.J. Dillashaw by split decision to regain the bantamweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-9",
            "text": "Cody Garbrandt ended that second title reign in a five-round decision.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-a-10",
            "text": "My nickname “The Dominator” began as a tongue-in-cheek high-school football nickname when I was an undersized linebacker.",
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
            "id": "ufc-dominick-cruz-b-1",
            "text": "Wrestling gave me my first serious competitive identity long before I became known for striking movement.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-2",
            "text": "My nickname actually started in high school football rather than in mixed martial arts.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-3",
            "text": "I built a second career as a combat-sports analyst and broadcaster alongside fighting.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-4",
            "text": "My first UFC bout was already a title defense because my WEC championship carried into the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-5",
            "text": "I beat Urijah Faber over five rounds in that first UFC championship appearance.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-6",
            "text": "Two left-ACL surgeries, a groin tear and later a right-ACL tear defined a long stretch of my career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-7",
            "text": "I returned from one long layoff with a quick stoppage of Takeya Mizugaki.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-8",
            "text": "I then came back from another absence to take the title from T.J. Dillashaw by split decision.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-9",
            "text": "My second reign ended in a memorable five-round loss to Cody Garbrandt.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dominick-cruz-b-10",
            "text": "“The Dominator” became associated with an injury-comeback story, two UFC bantamweight title reigns and one of the division’s most unusual movement styles.",
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
            "text": "Before MMA paid my bills, I worked physically demanding jobs that included laboring and upholstery.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-2",
            "text": "I began jiu-jitsu as a child and competed in an early British no-holds-barred event as a teenager.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-3",
            "text": "My UFC path began by winning a season of The Ultimate Fighter.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-4",
            "text": "I spent many years near the top of the UFC without receiving a championship opportunity.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-5",
            "text": "A detached retina became a major career obstacle and eventually required multiple surgeries.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-6",
            "text": "A five-round decision win over Anderson Silva in 2016 put me back into the title conversation.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-7",
            "text": "On short notice, I knocked out Luke Rockhold in their rematch to win the UFC middleweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-8",
            "text": "I defended the belt by avenging an earlier knockout loss to Dan Henderson.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-9",
            "text": "Georges St-Pierre ended my title reign by submission in 2017.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-a-10",
            "text": "My nickname “The Count” came from family ancestry rather than from my fight record or a self-declared royal persona.",
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
            "id": "ufc-michael-bisping-b-1",
            "text": "I supported myself with a range of hard physical jobs before fighting became a stable career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-2",
            "text": "Combat sports had been part of my life since childhood, long before the modern UFC version of my career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-3",
            "text": "I entered the UFC through reality television and then became one of the promotion’s most durable long-term contenders.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-4",
            "text": "A serious eye injury threatened my career years before I finally fought for a UFC title.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-5",
            "text": "I lost to Luke Rockhold in 2014, then rebuilt with wins that included Anderson Silva.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-6",
            "text": "When an injury opened a late-notice title opportunity in 2016, I accepted a rematch with Rockhold.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-7",
            "text": "I knocked him out in the first round to become middleweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-8",
            "text": "My first defense was a five-round rematch with Dan Henderson, who had knocked me out years earlier.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-9",
            "text": "After retirement, I built a major second career as a UFC commentator, analyst and actor.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-michael-bisping-b-10",
            "text": "“The Count” became the nickname attached to an Ultimate Fighter winner who waited a decade for his UFC championship breakthrough.",
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
