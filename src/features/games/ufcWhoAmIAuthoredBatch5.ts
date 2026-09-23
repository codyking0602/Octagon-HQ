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
              "identity3",
              "identity4"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-2",
            "text": "Family influence played a large role because my mother had already reached world-championship level in that sport.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-3",
            "text": "I became a professional MMA champion before the UFC had created a women’s division.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-4",
            "text": "When the UFC added women, I was installed as the inaugural bantamweight champion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-5",
            "text": "My first UFC fight was both the promotion’s first women’s bout and a championship main event.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-6",
            "text": "I submitted Liz Carmouche, Miesha Tate and Cat Zingano in successive UFC title fights.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-7",
            "text": "The Zingano defense lasted only 14 seconds.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-8",
            "text": "My title reign ended in a major upset loss to Holly Holm.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-9",
            "text": "I later returned for one more UFC title fight against Amanda Nunes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-ronda-rousey-b-10",
            "text": "My judo medal, armbar-heavy title run and later WWE career made me one of the biggest crossover stars in women’s combat sports.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity4",
              "identity5",
              "profile"
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
            "text": "I joined the UFC in 2018 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-3",
            "text": "I spent most of my UFC career at Strawweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-4",
            "text": "I reached my first UFC title opportunity in 2025.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-5",
            "text": "I beat Ashley Yoder by decision in 2018.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-6",
            "text": "I beat Hannah Cifers by submission in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-7",
            "text": "I lost to Amanda Ribas by decision in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-8",
            "text": "I beat Nina Nunes by submission in 2021.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-9",
            "text": "I won UFC gold at Strawweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-a-10",
            "text": "My UFC résumé includes a matchup against Virna Jandiroba in 2025.",
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
            "id": "ufc-mackenzie-dern-b-1",
            "text": "My UFC career began in 2018.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-2",
            "text": "I won 2 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-3",
            "text": "One stretch of my UFC career reached 4 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-4",
            "text": "My first UFC title opportunity came after 15 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-5",
            "text": "I beat Amanda Cooper by submission in 2018.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-6",
            "text": "I beat Randa Markos by submission in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-7",
            "text": "I beat Virna Jandiroba by decision in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-8",
            "text": "I beat Tecia Torres by decision in 2022.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-9",
            "text": "My UFC career includes a championship victory at Strawweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-mackenzie-dern-b-10",
            "text": "I also shared the Octagon with Jessica Andrade in 2023.",
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
            "text": "I attended real-estate school and has maintained a real-estate license outside of fighting.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-holly-holm-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-holly-holm-a-3",
            "text": "My UFC career included appearances at both Bantamweight and Featherweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-holly-holm-a-4",
            "text": "I reached my first UFC title opportunity in 2015.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-holly-holm-a-5",
            "text": "I beat Marion Reneau by decision in 2015.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-a-6",
            "text": "I beat Raquel Pennington by decision in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-a-7",
            "text": "I beat Megan Anderson by decision in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-a-8",
            "text": "I lost to Ketlen Vieira by decision in 2022.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-a-9",
            "text": "I won UFC gold at Bantamweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-holly-holm-a-10",
            "text": "My UFC résumé includes a matchup against Ronda Rousey in 2015.",
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
            "id": "ufc-holly-holm-b-1",
            "text": "My UFC career began in 2015.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-holly-holm-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-holly-holm-b-3",
            "text": "One stretch of my UFC career reached 3 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-holly-holm-b-4",
            "text": "My first UFC title opportunity came after 2 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-holly-holm-b-5",
            "text": "I fought Mayra Bueno Silva in 2023.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-b-6",
            "text": "I beat Bethe Correia by stoppage in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-b-7",
            "text": "I beat Yana Santos by decision in 2023.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-b-8",
            "text": "I beat Raquel Pennington by decision in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-holly-holm-b-9",
            "text": "My UFC career includes a championship victory at Bantamweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-holly-holm-b-10",
            "text": "I also shared the Octagon with Amanda Nunes in 2019.",
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
            "text": "I joined the UFC in 2007 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-2",
            "text": "My UFC debut ended with a win by submission.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-3",
            "text": "My UFC career included appearances at both Lightweight and Welterweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-4",
            "text": "I reached my first UFC title opportunity in 2007.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-5",
            "text": "I lost to Clay Guida by decision in 2009.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-6",
            "text": "I lost to Gray Maynard by decision in 2010.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-7",
            "text": "I lost to Rory MacDonald by decision in 2011.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-8",
            "text": "I lost to Rafael Dos Anjos by decision in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-9",
            "text": "I challenged for UFC gold at Lightweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-nate-diaz-a-10",
            "text": "I have described martial arts as a source of structure and refuge while growing up in rough parts of Stockton, California.",
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
            "id": "ufc-nate-diaz-b-1",
            "text": "My UFC career began in 2007.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-3",
            "text": "One stretch of my UFC career reached 5 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-4",
            "text": "My first undisputed UFC title opportunity came in 2012.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-5",
            "text": "I lost to Joe Stevenson by decision in 2009.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-6",
            "text": "I lost to Dong Hyun Kim by decision in 2011.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-7",
            "text": "I lost to Josh Thomson by stoppage in 2013.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-8",
            "text": "I lost to Jorge Masvidal in 2019.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-9",
            "text": "One of my UFC title opportunities came at Lightweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-nate-diaz-b-10",
            "text": "I fought Conor McGregor twice in 2016, splitting the two fights.",
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
            "text": "My foundation was elite collegiate wrestling, including a Pac-10 championship and All-American recognition at Oregon State.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-colby-covington-a-2",
            "text": "My UFC debut ended with a win by stoppage.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-colby-covington-a-3",
            "text": "I spent most of my UFC career at Welterweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-colby-covington-a-4",
            "text": "I reached my first UFC title opportunity in 2018.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-colby-covington-a-5",
            "text": "I lost to Warlley Alves by submission in 2015.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-a-6",
            "text": "I beat Anying Wang by stoppage in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-a-7",
            "text": "I beat Mike Pyle by decision in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-a-8",
            "text": "I beat Max Griffin by stoppage in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-a-9",
            "text": "I won UFC gold at Welterweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-colby-covington-a-10",
            "text": "I and Jorge Masvidal were once close friends, teammates and roommates before their relationship deteriorated into one of MMA's most personal rivalries.",
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
            "id": "ufc-colby-covington-b-1",
            "text": "My UFC career began in 2014.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-colby-covington-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-colby-covington-b-3",
            "text": "One stretch of my UFC career reached 7 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-colby-covington-b-4",
            "text": "My first UFC title opportunity came after 9 earlier UFC appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-colby-covington-b-5",
            "text": "I lost to Joaquin Buckley in 2024.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-b-6",
            "text": "I beat Wagner Silva by submission in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-b-7",
            "text": "I beat Jonathan Meunier by submission in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-b-8",
            "text": "I beat Bryan Barberena by decision in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-colby-covington-b-9",
            "text": "My UFC career includes a championship victory at Welterweight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-colby-covington-b-10",
            "text": "I also shared the Octagon with Kamaru Usman in 2021.",
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
            "text": "I joined the UFC in 2014 after beginning my professional career elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-2",
            "text": "My UFC debut ended with a win by decision.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-3",
            "text": "I spent my UFC career primarily at Featherweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-4",
            "text": "I reached my first UFC title opportunity in 2023.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-5",
            "text": "I fought Jeremy Stephens in 2019.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-6",
            "text": "I beat Charles Rosa by decision in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-7",
            "text": "I beat Andre Fili by stoppage in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-8",
            "text": "I beat BJ Penn by stoppage in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-9",
            "text": "I won interim UFC featherweight gold.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-a-10",
            "text": "I won the interim featherweight title by submitting Josh Emmett in 2023.",
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
            "id": "ufc-yair-rodriguez-b-1",
            "text": "My UFC career began in 2014.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-2",
            "text": "I won 3 of my first three UFC appearances.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-3",
            "text": "One stretch of my UFC career reached 6 consecutive victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-4",
            "text": "My first UFC title opportunity came in 2023.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-5",
            "text": "I lost to Brian Ortega by submission in 2024.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-6",
            "text": "I beat Dan Hooker by decision in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-7",
            "text": "I beat Alex Caceres by decision in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-8",
            "text": "I beat Chan Sung Jung by stoppage in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-9",
            "text": "My UFC résumé includes an interim featherweight championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-yair-rodriguez-b-10",
            "text": "I challenged Alexander Volkanovski for the undisputed featherweight title in 2023.",
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
