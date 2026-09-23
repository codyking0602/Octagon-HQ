import type { UfcWhoAmIAuthoredIdentity } from "./ufcWhoAmIAuthoredScripts";

/**
 * Static authored UFC Who Am I batch 5.
 * Source-backed at authoring time; runtime serves these clue strings verbatim.
 */
export const ufcWhoAmIAuthoredBatch5: readonly UfcWhoAmIAuthoredIdentity[] = [
  {
    "subjectId": "ufc:quinton-jackson",
    "name": "Quinton Jackson",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/quinton-jackson",
      "identity1": "https://jp.ufc.com/news/quintons-quotables",
      "identity2": "https://jp.ufc.com/news/quintons-quotables",
      "identity3": "https://jp.ufc.com/news/quintons-quotables",
      "identity4": "https://www.ufc.com/news/rampage-jackson-theres-no-place-his-second-home",
      "identity5": "https://www.ufc.com/news/rampage-rashad-carwin-and-more-new-ufc-mag"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-quinton-jackson-a-1",
            "text": "I grew up with little money and became strongly motivated to create a better life for my family.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-quinton-jackson-a-2",
            "text": "School wrestling helped redirect aggression that had previously shown up in street fights.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-quinton-jackson-a-3",
            "text": "Early in my professional career, financial instability was severe enough that I lived in an RV while trying to establish myself.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-quinton-jackson-a-4",
            "text": "I built much of my reputation outside the UFC before joining the promotion in 2007.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity4"
            ]
          },
          {
            "id": "ufc-quinton-jackson-a-5",
            "text": "I knocked out Marvin Eastman in my UFC debut.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-quinton-jackson-a-6",
            "text": "In my next UFC fight, I stopped Chuck Liddell to win the light heavyweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-quinton-jackson-a-7",
            "text": "I then beat Dan Henderson over five rounds to unify major light heavyweight titles.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-quinton-jackson-a-8",
            "text": "Forrest Griffin took the UFC belt from me in a close five-round decision.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-quinton-jackson-a-9",
            "text": "A long-running rivalry with Rashad Evans later headlined a major UFC event after we coached The Ultimate Fighter.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-quinton-jackson-a-10",
            "text": "Known as “Rampage,” I also crossed into mainstream acting by playing B.A. Baracus in The A-Team.",
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
            "id": "ufc-quinton-jackson-b-1",
            "text": "Wrestling became the first organized sport that gave structure to my natural aggression.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-quinton-jackson-b-2",
            "text": "My path to major MMA success included years of financial struggle after I moved away from home.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-quinton-jackson-b-3",
            "text": "Fighting in Japan became such a large part of my career that I came to describe the country as a second home.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-quinton-jackson-b-4",
            "text": "By the time I reached the UFC, I was already one of the most recognizable light heavyweights in the sport.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-quinton-jackson-b-5",
            "text": "I won UFC gold in only my second appearance for the promotion by knocking out Chuck Liddell.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-quinton-jackson-b-6",
            "text": "My first defense was a five-round win over Dan Henderson.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-quinton-jackson-b-7",
            "text": "After losing the belt to Forrest Griffin, I knocked out Wanderlei Silva in their third career meeting.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-quinton-jackson-b-8",
            "text": "I later beat Lyoto Machida by split decision during another contender run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-quinton-jackson-b-9",
            "text": "My rivalry with Rashad Evans included a season coaching opposite him on The Ultimate Fighter.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-quinton-jackson-b-10",
            "text": "The “Rampage” persona and my role as B.A. Baracus made me one of the era’s most visible MMA crossover stars.",
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
    "subjectId": "ufc:brock-lesnar",
    "name": "Brock Lesnar",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/brock-lesnar",
      "identity1": "https://www.ufc.com/news/brock-lesnar-be-featured-espns-e60",
      "identity2": "https://www.ufc.com/news/brock-lesnar-be-featured-espns-e60",
      "identity3": "https://www.ufc.com/news/brock-lesnar-be-featured-espns-e60",
      "identity4": "https://www.ufc.com/news/brock-lesnar-be-featured-espns-e60",
      "identity5": "https://kr.ufc.com/news/brock-lesnar-modern-day-gladiator"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-brock-lesnar-a-1",
            "text": "I grew up on a dairy farm long before combat sports made me famous.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-brock-lesnar-a-2",
            "text": "My first elite athletic success came in wrestling, where I became an NCAA heavyweight national champion.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-brock-lesnar-a-3",
            "text": "Before MMA, I became a major professional-wrestling star.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-brock-lesnar-a-4",
            "text": "I also left that career for a time to chase an NFL opportunity despite never playing college football.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-brock-lesnar-a-5",
            "text": "My UFC debut ended in a first-round submission loss to Frank Mir.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brock-lesnar-a-6",
            "text": "Two wins later, I stopped Randy Couture to become UFC heavyweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brock-lesnar-a-7",
            "text": "I avenged the Mir loss in a championship rematch at UFC 100.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brock-lesnar-a-8",
            "text": "A severe bout of diverticulitis interrupted my title reign and eventually required major surgery.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-brock-lesnar-a-9",
            "text": "Cain Velasquez ended my championship reign by first-round stoppage.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brock-lesnar-a-10",
            "text": "My path from NCAA champion to WWE superstar to UFC heavyweight champion made my résumé unusually cross-disciplinary.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity2",
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
            "id": "ufc-brock-lesnar-b-1",
            "text": "Rural farm life and wrestling shaped my athletic identity before entertainment or MMA entered the picture.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "identity2"
            ]
          },
          {
            "id": "ufc-brock-lesnar-b-2",
            "text": "I reached the highest level of professional wrestling before testing myself in other sports.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-brock-lesnar-b-3",
            "text": "An attempt to make an NFL roster came between major chapters of my professional-wrestling career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-brock-lesnar-b-4",
            "text": "I entered the UFC with very little professional MMA experience.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brock-lesnar-b-5",
            "text": "After losing my UFC debut to Frank Mir, I beat Heath Herring by decision.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brock-lesnar-b-6",
            "text": "My next fight was a championship bout with Randy Couture, which I won by second-round stoppage.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brock-lesnar-b-7",
            "text": "I defended the belt by stopping Mir in their rematch and later submitting Shane Carwin.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brock-lesnar-b-8",
            "text": "Diverticulitis caused a major interruption during that championship period.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-brock-lesnar-b-9",
            "text": "I lost the title to Cain Velasquez and later fought Alistair Overeem in my return.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-brock-lesnar-b-10",
            "text": "Few UFC champions arrived with a public identity already built through NCAA wrestling, WWE and an NFL training camp.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "identity3",
              "identity4",
              "profile"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:paddy-pimblett",
    "name": "Paddy Pimblett",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/paddy-pimblett",
      "identity1": "https://www.ufc.com/athlete/paddy-pimblett",
      "identity2": "https://www.ufc.com/athlete/paddy-pimblett",
      "identity3": "https://www.ufc.com/athlete/paddy-pimblett",
      "identity4": "https://www.ufc.com/athlete/paddy-pimblett",
      "identity5": "https://www.bbc.co.uk/sport/mixed-martial-arts/62396350"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-paddy-pimblett-a-1",
            "text": "I began MMA training around age 15 and committed to it full time by 16.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-a-2",
            "text": "Fighting became my occupation so young that I never followed a conventional job path.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-a-3",
            "text": "Before reaching the UFC, I had already won a championship in a major European promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-a-4",
            "text": "My UFC debut came in 2021 and turned into a comeback stoppage victory.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-a-5",
            "text": "I stopped Luigi Vendramini in the first round of that debut.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-a-6",
            "text": "I followed with a first-round submission of Rodrigo Vargas.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-a-7",
            "text": "A decision over Jared Gordon kept my UFC record unbeaten despite debate over the scoring.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-a-8",
            "text": "I later beat Tony Ferguson by decision and submitted Bobby Green.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-a-9",
            "text": "I stopped Michael Chandler in 2025 to add the biggest veteran name of my UFC run to that point.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-a-10",
            "text": "I am a devoted Liverpool FC supporter whose public identity outside fighting is closely tied to the club.",
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
            "id": "ufc-paddy-pimblett-b-1",
            "text": "I committed to becoming a professional fighter while still in my mid-teens.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-b-2",
            "text": "One of the fighters I admired most growing up was Antônio Rodrigo Nogueira because of his ability to survive adversity.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-b-3",
            "text": "I arrived in the UFC after building a large following and championship résumé in Europe.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-b-4",
            "text": "My first several UFC fights extended an unbeaten start inside the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-b-5",
            "text": "A first-round comeback knockout in my debut immediately matched the high-energy reputation I brought with me.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-b-6",
            "text": "I later submitted Jordan Leavitt and won a close decision over Jared Gordon.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-b-7",
            "text": "Wins over Tony Ferguson, Bobby Green and Michael Chandler moved me from prospect attraction toward contender status.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-b-8",
            "text": "After the death of a friend, I used a post-fight interview to urge men to talk openly and seek help with mental-health struggles.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-b-9",
            "text": "Fatherhood to twin daughters became another major part of my life outside fighting.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-paddy-pimblett-b-10",
            "text": "The nickname “The Baddy” and my Liverpool identity became two of the clearest markers of my UFC persona.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity2"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:zhang-weili",
    "name": "Zhang Weili",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/zhang-weili",
      "identity1": "https://www.ufc.com/athlete/zhang-weili",
      "identity2": "https://www.xinhuanet.com/english/2020-03/12/c_138870504.htm",
      "identity3": "https://www.xinhuanet.com/english/2020-03/12/c_138870504.htm",
      "identity4": "https://www.ufc.com/news/zhang-weili-found-her-voice-in-mixed-martial-arts-ufc-248",
      "identity5": "https://www.ufc.com/athlete/zhang-weili"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-zhang-weili-a-1",
            "text": "My martial-arts foundation included sanda before professional MMA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-zhang-weili-a-2",
            "text": "Before fighting supported me, I worked jobs including supermarket cashier, kindergarten teacher and hotel desk clerk.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-zhang-weili-a-3",
            "text": "I once took a staff job at a gym partly because it gave me access to training equipment I could not otherwise afford regularly.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-zhang-weili-a-4",
            "text": "I entered the UFC in 2018 after building a long professional winning streak.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-zhang-weili-a-5",
            "text": "I knocked out Jéssica Andrade in less than a minute to win the strawweight championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-zhang-weili-a-6",
            "text": "My first title defense was a five-round battle with Joanna Jędrzejczyk that became one of the most acclaimed fights in women’s MMA.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-zhang-weili-a-7",
            "text": "Rose Namajunas ended my first title reign with a head kick and then beat me again in an immediate rematch.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-zhang-weili-a-8",
            "text": "I regained the championship by stopping Carla Esparza in 2022.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-zhang-weili-a-9",
            "text": "I later defended the belt over Amanda Lemos and Yan Xiaonan.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-zhang-weili-a-10",
            "text": "My first championship victory made me the UFC’s first champion from China.",
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
            "id": "ufc-zhang-weili-b-1",
            "text": "A serious injury interrupted my early martial-arts development for years before I returned to training.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-zhang-weili-b-2",
            "text": "For a long time, ordinary jobs had to fund the training I hoped would become my career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "identity3"
            ]
          },
          {
            "id": "ufc-zhang-weili-b-3",
            "text": "Watching women headline a UFC event helped convince me that the promotion could become a realistic goal.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-zhang-weili-b-4",
            "text": "Once I reached the UFC, my rise from debut to title fight happened very quickly.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-zhang-weili-b-5",
            "text": "I stopped Jéssica Andrade in 42 seconds to become strawweight champion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-zhang-weili-b-6",
            "text": "A razor-close five-round defense against Joanna Jędrzejczyk followed.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-zhang-weili-b-7",
            "text": "I lost back-to-back championship fights with Rose Namajunas.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-zhang-weili-b-8",
            "text": "A spinning-backfist knockout of Jędrzejczyk in their rematch put me back into title contention.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-zhang-weili-b-9",
            "text": "I submitted Carla Esparza to become champion again.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-zhang-weili-b-10",
            "text": "My two UFC strawweight title reigns made me one of the most recognizable Chinese athletes in the promotion’s history.",
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
    "subjectId": "ufc:ronda-rousey",
    "name": "Ronda Rousey",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/ronda-rousey",
      "identity1": "https://www.espn.com/espnw/athletes-life/the-buzz/article/13533062/ronda-rousey-reveals-special-connection-young-fan",
      "identity2": "https://www.ufc.com/news/ronda-rousey-judo-pressure-and-tate",
      "identity3": "https://www.ufc.com/news/ronda-rousey-makes-history-first-woman-selected-induction-ufc-hall-fame",
      "identity4": "https://www.ufc.com/news/ronda-rousey-makes-history-first-woman-selected-induction-ufc-hall-fame",
      "identity5": "https://www.espn.com/wwe/story/_/id/22244988/ronda-rousey-signs-wwe"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-ronda-rousey-a-1",
            "text": "As a young child, I had a serious speech difficulty and spent years in speech therapy.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-ronda-rousey-a-2",
            "text": "Before my main combat sport took over, I spent part of childhood as a competitive swimmer.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-ronda-rousey-a-3",
            "text": "My mother was already a world champion in the combat sport that became my athletic foundation.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-ronda-rousey-a-4",
            "text": "I reached elite international competition years before I ever fought professionally in MMA.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-ronda-rousey-a-5",
            "text": "I won an Olympic bronze medal in judo in 2008.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-ronda-rousey-a-6",
            "text": "I entered the UFC as its first women’s champion and headlined the promotion’s first women’s fight against Liz Carmouche.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ronda-rousey-a-7",
            "text": "My early UFC title fights repeatedly ended with first-round armbars.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ronda-rousey-a-8",
            "text": "I later knocked out Bethe Correia in 34 seconds for another successful defense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ronda-rousey-a-9",
            "text": "Holly Holm ended my unbeaten run and championship reign with a head kick in 2015.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ronda-rousey-a-10",
            "text": "After MMA, I turned a longtime interest in professional wrestling into a major WWE career.",
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
            "id": "ufc-ronda-rousey-b-1",
            "text": "My first major athletic identity came from an Olympic sport rather than from mixed martial arts.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-2",
            "text": "Family influence played a large role because my mother had already reached world-championship level in that sport.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-3",
            "text": "I did not enter professional MMA until after years of elite international competition.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-4",
            "text": "Before joining the UFC, I had already become a champion in another major MMA promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-5",
            "text": "I won an Olympic bronze medal in judo in 2008.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "identity3"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-6",
            "text": "When the UFC added women, I entered as its inaugural bantamweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-7",
            "text": "My first UFC fight was the promotion’s first women’s bout, and I submitted Liz Carmouche in the title main event.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "identity3"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-8",
            "text": "I later submitted Miesha Tate and Cat Zingano in title fights, with the Zingano defense lasting only 14 seconds.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-9",
            "text": "Holly Holm ended my unbeaten run and championship reign with a head kick in 2015.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-10",
            "text": "My Olympic judo medal, armbar-heavy UFC title run and later WWE career made me one of combat sports’ biggest crossover stars.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity3",
              "identity5"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:carla-esparza",
    "name": "Carla Esparza",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/carla-esparza",
      "identity1": "https://www.ufc.com/athlete/carla-esparza",
      "identity2": "https://www.ufc.com/athlete/carla-esparza",
      "identity3": "https://www.ufc.com/athlete/carla-esparza",
      "identity4": "https://www.ufc.com/athlete/carla-esparza",
      "identity5": "https://www.ufc.com/news/ufc-magazine-carla-esparza-profile"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-carla-esparza-a-1",
            "text": "I became a two-time collegiate All-American wrestler before fully transitioning to MMA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-carla-esparza-a-2",
            "text": "I earned a business degree with a concentration in sports management.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-carla-esparza-a-3",
            "text": "During college breaks, I added Brazilian jiu-jitsu and Muay Thai around my wrestling base.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-carla-esparza-a-4",
            "text": "I entered the UFC through the tournament used to crown the first women’s strawweight champion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-carla-esparza-a-5",
            "text": "I submitted Rose Namajunas in the finale to become the division’s inaugural champion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-carla-esparza-a-6",
            "text": "Joanna Jędrzejczyk ended that first reign in my next fight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-carla-esparza-a-7",
            "text": "Years later, wins over Virna Jandiroba, Michelle Waterson and Yan Xiaonan rebuilt me into contention.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-carla-esparza-a-8",
            "text": "I beat Namajunas again by split decision in 2022 to regain the strawweight title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-carla-esparza-a-9",
            "text": "That made me a champion twice with more than seven years between my two title victories.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-carla-esparza-a-10",
            "text": "My wrestling-heavy style carried me from The Ultimate Fighter’s inaugural strawweight tournament to a second UFC title reign.",
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
            "id": "ufc-carla-esparza-b-1",
            "text": "Alongside my early fight career, I worked as a personal trainer.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-carla-esparza-b-2",
            "text": "My first professional years were financially precarious enough that medical costs could consume most of a fight purse.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-carla-esparza-b-3",
            "text": "I continued living with my parents while trying to make professional fighting sustainable.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-carla-esparza-b-4",
            "text": "The UFC brought me in through a reality-show tournament rather than a normal debut booking.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-carla-esparza-b-5",
            "text": "I won that tournament by submitting Rose Namajunas for the inaugural strawweight championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-carla-esparza-b-6",
            "text": "I lost the belt to Joanna Jędrzejczyk and then spent years rebuilding without another title shot.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-carla-esparza-b-7",
            "text": "A five-fight winning streak eventually carried me back to championship contention.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-carla-esparza-b-8",
            "text": "I faced Namajunas again more than seven years after our first title fight and won by split decision.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-carla-esparza-b-9",
            "text": "My second championship made me one of the rare fighters to regain a UFC belt after such a long gap.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-carla-esparza-b-10",
            "text": "The nickname “Cookie Monster” became attached to a career defined far more by collegiate wrestling and grinding control than by striking.",
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
    "subjectId": "ufc:mackenzie-dern",
    "name": "Mackenzie Dern",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/mackenzie-dern",
      "identity1": "https://www.ufc.com/athlete/mackenzie-dern",
      "identity2": "https://www.ufc.com/athlete/mackenzie-dern",
      "identity3": "https://www.ufc.com/athlete/mackenzie-dern",
      "identity4": "https://www.ufc.com/news/mackenzie-dern-full-circle-abu-dhabi-ufc-321",
      "identity5": "https://www.ufc.com/news/mackenzie-dern-focused-motherhood-and-learning-ufc-women"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-mackenzie-dern-a-1",
            "text": "Before MMA, my profession was already competitive Brazilian jiu-jitsu rather than a conventional job.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-2",
            "text": "I built a world-level grappling résumé before ever entering the UFC.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-3",
            "text": "My professional MMA career began only after I had already become one of the best-known women in submission grappling.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity2"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-4",
            "text": "I entered the UFC in 2018 and started my run with back-to-back victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-5",
            "text": "Amanda Ribas handed me the first loss of my professional MMA career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-6",
            "text": "I rebounded with a run that included submissions of Randa Markos and Nina Nunes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-7",
            "text": "A five-round main event with Marina Rodriguez became one of my first major tests against a top strawweight striker.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-8",
            "text": "I later beat Angela Hill over five rounds in another main event.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-9",
            "text": "A 2025 rematch with Ribas ended with me earning a submission victory.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-10",
            "text": "I began jiu-jitsu around age three in the academy of my father, Wellington “Megaton” Dias.",
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
            "id": "ufc-mackenzie-dern-b-1",
            "text": "Grappling competition was already a full-time athletic career for me before I transitioned to mixed martial arts.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "identity3"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-2",
            "text": "My early accomplishments included both world-level Brazilian jiu-jitsu and ADCC championships.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-3",
            "text": "I grew up fluent in English and Portuguese with strong connections to both the United States and Brazil.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-4",
            "text": "My UFC career began in 2018 after an unbeaten start to professional MMA.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-5",
            "text": "My first UFC setback came in a decision against Amanda Ribas.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-6",
            "text": "I later submitted Nina Nunes with an armbar in the first round.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-7",
            "text": "Five-round fights with Marina Rodriguez, Yan Xiaonan and Angela Hill tested my game beyond pure grappling.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-8",
            "text": "After becoming a mother, I quickly brought my daughter into the same family jiu-jitsu culture that shaped me.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-9",
            "text": "I eventually avenged the Ribas loss by submitting her in a rematch.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-10",
            "text": "My father “Megaton” Dias and an elite BJJ résumé are the strongest clues to the grappling identity I brought into the UFC.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "identity2"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:holly-holm",
    "name": "Holly Holm",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/holly-holm",
      "identity1": "https://www.ufc.com/athlete/holly-holm",
      "identity2": "https://www.ufc.com/athlete/holly-holm",
      "identity3": "https://www.ufc.com/athlete/holly-holm",
      "identity4": "https://www.ufc.com/athlete/holly-holm",
      "identity5": "https://www.ufc.com/athlete/holly-holm"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-holly-holm-a-1",
            "text": "My combat-sports path began almost accidentally when I took cardio-kickboxing classes for exercise as a teenager.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-holly-holm-a-2",
            "text": "Before fighting became full time, I worked jobs including restaurant serving and chiropractic assistance.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-holly-holm-a-3",
            "text": "I also attended real-estate school and maintained a real-estate license outside fighting.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-holly-holm-a-4",
            "text": "I entered the UFC in 2015 after an elite career in another combat sport.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity3"
            ]
          },
          {
            "id": "ufc-holly-holm-a-5",
            "text": "I knocked out Ronda Rousey with a head kick to win the UFC bantamweight championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-a-6",
            "text": "Miesha Tate took the belt from me with a fifth-round submission in my first defense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-a-7",
            "text": "I later fought Germaine de Randamie for the inaugural UFC women’s featherweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-a-8",
            "text": "Another featherweight title opportunity came against Cris Cyborg in a five-round fight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-a-9",
            "text": "My pre-UFC boxing career was accomplished enough to earn induction into major boxing halls of fame.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-holly-holm-a-10",
            "text": "My nickname “The Preacher’s Daughter” is literal: my father was a Church of Christ preacher for much of my life.",
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
            "id": "ufc-holly-holm-b-1",
            "text": "I became a world-class professional boxer before mixed martial arts became my main stage.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-holly-holm-b-2",
            "text": "My entry into striking started with a fitness class rather than with a childhood plan to become a fighter.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-holly-holm-b-3",
            "text": "Real estate remained one of my interests and credentials outside combat sports.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-holly-holm-b-4",
            "text": "I joined the UFC unbeaten in MMA and won my first two appearances by decision.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-b-5",
            "text": "My third UFC fight was a championship bout with Ronda Rousey.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-b-6",
            "text": "A second-round head kick produced one of the biggest title upsets in UFC history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-b-7",
            "text": "I lost the championship to Miesha Tate late in the fifth round of my first defense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-b-8",
            "text": "I later challenged for featherweight gold against both Germaine de Randamie and Cris Cyborg.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-b-9",
            "text": "My career combined elite boxing credentials with a UFC championship won by one of the promotion’s most famous head kicks.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity3",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-b-10",
            "text": "“The Preacher’s Daughter” nickname came directly from my father’s profession.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:nate-diaz",
    "name": "Nate Diaz",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/nate-diaz",
      "identity1": "https://www.ufc.com/news/nate-diaz-fighting-life",
      "identity2": "https://www.ufc.com/news/nate-diaz-fighting-life",
      "identity3": "https://www.ufc.com/news/flashback-nate-diaz-23",
      "identity4": "https://www.ufc.com/news/another-side-nate-diaz",
      "identity5": "https://www.ufc.com/news/another-side-nate-diaz"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-nate-diaz-a-1",
            "text": "Martial arts gave me structure while I was growing up in a rough environment.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-2",
            "text": "An older brother helped pull me deeper into Brazilian jiu-jitsu and the fighting world.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-3",
            "text": "As a teenager, I trained around experienced professional fighters in a demanding grappling room.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-4",
            "text": "My route into the UFC came through winning season five of The Ultimate Fighter.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-5",
            "text": "I won that season’s finale against Manny Gamburyan.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-6",
            "text": "A high-volume decision over Donald Cerrone became one of the signature wins of my lightweight run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-7",
            "text": "After beating Michael Johnson, my post-fight callout set up a short-notice fight with Conor McGregor.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-8",
            "text": "I submitted McGregor in the second round at UFC 196.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-9",
            "text": "We fought again five months later, with McGregor winning a five-round majority decision.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-10",
            "text": "I later fought Jorge Masvidal for the inaugural BMF championship, adding another major event to the Diaz-family legacy.",
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
            "id": "ufc-nate-diaz-b-1",
            "text": "Brazilian jiu-jitsu became the technical foundation that kept me committed to combat sports as a teenager.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "identity2"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-2",
            "text": "I adopted a vegan or heavily plant-based diet as part of how I managed conditioning and recovery.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-3",
            "text": "My family later built a martial-arts academy where teaching the sport locally became part of life outside UFC events.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-4",
            "text": "I entered the UFC as an Ultimate Fighter winner and spent years moving between lightweight and welterweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-5",
            "text": "Wins over Jim Miller and Donald Cerrone established me as a major lightweight contender.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-6",
            "text": "A long layoff ended with a decision win over Michael Johnson and an unforgettable post-fight callout.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-7",
            "text": "I handed Conor McGregor his first UFC loss by rear-naked choke on short notice.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-8",
            "text": "The rematch became a five-round main event and one of the promotion’s biggest fights.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-9",
            "text": "Years later, I beat Anthony Pettis before facing Jorge Masvidal for the BMF belt.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-10",
            "text": "My older brother Nick and I became one of the most recognizable sibling pairings in MMA.",
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
    "subjectId": "ufc:colby-covington",
    "name": "Colby Covington",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/colby-covington",
      "identity1": "https://www.ufc.com/athlete/colby-covington",
      "identity2": "https://www.ufc.com/athlete/colby-covington",
      "identity3": "https://www.ufc.com/athlete/colby-covington",
      "identity4": "https://www.ufc.com/news/colby-covington-proud-his-wrestling-roots-ufc-fight-pass",
      "identity5": "https://www.espn.com/mma/story/_/id/33407960/ufc-272-poker-sushi-betrayal-how-colby-covington-jorge-masvidal-went-roommates-rivals"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-colby-covington-a-1",
            "text": "My foundation was elite collegiate wrestling, including conference-championship and All-American recognition.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-colby-covington-a-2",
            "text": "I earned a bachelor’s degree in sociology.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-colby-covington-a-3",
            "text": "My college path included junior college and multiple Division I programs before I found my final home.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-colby-covington-a-4",
            "text": "I entered the UFC in 2014 and built a pressure-heavy style around wrestling and pace.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-a-5",
            "text": "A decision over Demian Maia helped move me into the top tier at welterweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-a-6",
            "text": "I beat Rafael dos Anjos over five rounds to win an interim UFC welterweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-a-7",
            "text": "My first undisputed title fight with Kamaru Usman ended by fifth-round stoppage.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-a-8",
            "text": "I later beat Tyron Woodley and earned a second five-round championship fight with Usman.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-a-9",
            "text": "A former friendship with Jorge Masvidal deteriorated into a personal rivalry that eventually headlined UFC 272.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5",
              "ledger"
            ]
          },
          {
            "id": "ufc-colby-covington-a-10",
            "text": "My mother gave me the nickname “Chaos,” connecting it to both the mythological term and my behavior as a child.",
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
            "id": "ufc-colby-covington-b-1",
            "text": "Wrestling was the sport that carried me through an unusually winding college path.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-colby-covington-b-2",
            "text": "I finished college with a sociology degree before MMA became my full-time profession.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-colby-covington-b-3",
            "text": "My UFC rise was built less on quick finishes than on pace, takedowns and high-volume pressure.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-b-4",
            "text": "A long winning streak eventually moved me into an interim-title opportunity.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-b-5",
            "text": "I defeated Rafael dos Anjos to claim interim welterweight gold.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-b-6",
            "text": "After beating Robbie Lawler, I challenged Kamaru Usman for the undisputed championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-b-7",
            "text": "That fight ended late in the fifth round, and I later earned a rematch after stopping Tyron Woodley.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-b-8",
            "text": "I lost the second Usman fight by decision after another full championship bout.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-b-9",
            "text": "My former roommate and teammate Jorge Masvidal later became one of my most bitter public rivals.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-colby-covington-b-10",
            "text": "The “Chaos” nickname came from my mother and became the label attached to the provocative persona around my UFC career.",
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
    "subjectId": "ufc:yair-rodriguez",
    "name": "Yair Rodriguez",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/yair-rodriguez",
      "identity1": "https://www.ufc.com/node/68250",
      "identity2": "https://www.ufc.com/node/75863",
      "identity3": "https://www.ufc.com/node/75863",
      "identity4": "https://www.ufc.com/node/75863",
      "identity5": "https://www.ufc.com/node/68250"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-yair-rodriguez-a-1",
            "text": "I began taekwondo at about five years old.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-2",
            "text": "Before fighting became full time, I tried to balance school, work and training at the same time.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-3",
            "text": "My route into broader MMA accelerated after I found a vale-tudo gym while looking for somewhere to keep training.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-4",
            "text": "I entered the UFC by winning the featherweight tournament on The Ultimate Fighter: Latin America.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-5",
            "text": "A second-round knockout of B.J. Penn became one of my early high-profile victories in the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-6",
            "text": "I knocked out Chan Sung Jung with a last-second upward elbow at 4:59 of the fifth round.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-7",
            "text": "A five-round fight with Max Holloway ended in a decision loss but reinforced my place among the top featherweights.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-8",
            "text": "I submitted Josh Emmett to win an interim UFC featherweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-9",
            "text": "My undisputed title opportunity came against Alexander Volkanovski.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-10",
            "text": "Known as “El Pantera,” I became especially recognized for creative kicks, spinning attacks and unconventional elbows.",
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
            "id": "ufc-yair-rodriguez-b-1",
            "text": "Taekwondo formed the base of the unorthodox striking style I later brought into MMA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-2",
            "text": "Finding a more complete fighting gym changed my path from traditional martial arts toward mixed martial arts.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-3",
            "text": "I eventually moved away from home to immerse myself in higher-level training.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-4",
            "text": "A reality-show tournament victory brought me into the UFC featherweight division.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-5",
            "text": "I moved to Chicago to train with coaches including Izzy Martinez and Mike Valle as my career became more serious.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-6",
            "text": "My UFC résumé added a knockout of former champion B.J. Penn and a decision over Dan Hooker.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-7",
            "text": "The final second of a five-round fight with Chan Sung Jung produced one of the most unusual knockouts in UFC history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-8",
            "text": "I later lost a five-round battle with Max Holloway before rebounding with a submission of Josh Emmett.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-9",
            "text": "That Emmett win made me interim featherweight champion and led to a title fight with Alexander Volkanovski.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-10",
            "text": "The nickname “El Pantera” became attached to one of the division’s most creative striking styles.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          }
        ]
      }
    }
  }
];
