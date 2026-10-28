import type { UfcWhoAmIAuthoredIdentity } from "./ufcWhoAmIAuthoredScripts";

/**
 * Static authored UFC Who Am I batch 7.
 * Source-backed at authoring time; runtime serves these clue strings verbatim.
 */
export const ufcWhoAmIAuthoredBatch7: readonly UfcWhoAmIAuthoredIdentity[] = [
  {
    "subjectId": "ufc:leon-edwards",
    "name": "Leon Edwards",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/leon-edwards",
      "identity1": "https://www.espn.com/mma/story/_/id/27208469/ufc-278-kamaru-usman-vs-leon-edwards-mma-saved-being-dead-prison-dead-broke",
      "identity2": "https://www.espn.com/mma/story/_/id/27208469/ufc-278-kamaru-usman-vs-leon-edwards-mma-saved-being-dead-prison-dead-broke",
      "identity3": "https://www.espn.com/mma/story/_/id/27208469/ufc-278-kamaru-usman-vs-leon-edwards-mma-saved-being-dead-prison-dead-broke",
      "identity4": "https://www.espn.com/mma/story/_/id/40642235/ufc-304-making-golden-generation-english-mma-leon-edwards-tom-aspinall-michael-bisping",
      "identity5": "https://www.espn.com/mma/story/_/id/40642235/ufc-304-making-golden-generation-english-mma-leon-edwards-tom-aspinall-michael-bisping"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-leon-edwards-a-1",
            "text": "Martial arts gave me a path away from a dangerous teenage environment before fighting became my profession.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-leon-edwards-a-2",
            "text": "My mother was the person who pushed me toward an MMA gym when I was a teenager.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-leon-edwards-a-3",
            "text": "I entered the UFC in 2014 and lost my promotional debut by decision.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-leon-edwards-a-4",
            "text": "After that early setback, I built a long stretch without a UFC loss.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-leon-edwards-a-5",
            "text": "Wins over Vicente Luque and Rafael dos Anjos helped establish me as a welterweight contender.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-leon-edwards-a-6",
            "text": "I later went five rounds with Nate Diaz and survived a late scare to win the decision.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-leon-edwards-a-7",
            "text": "My first UFC title fight came in a rematch with Kamaru Usman.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-leon-edwards-a-8",
            "text": "I won the welterweight championship with a fifth-round head kick while trailing on the scorecards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-leon-edwards-a-9",
            "text": "I then beat Usman again in a title rematch and successfully defended against Colby Covington.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-leon-edwards-a-10",
            "text": "My younger brother Fabian also became a professional fighter, while I became known in the UFC as “Rocky.”",
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
            "id": "ufc-leon-edwards-b-1",
            "text": "I joined the UFC as a young welterweight in 2014 and did not receive an immediate push toward the title.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-leon-edwards-b-2",
            "text": "My early UFC résumé was built mostly through steady decisions and incremental improvements.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-leon-edwards-b-3",
            "text": "I eventually put together years without a defeat inside the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-leon-edwards-b-4",
            "text": "That run still required a long wait before I finally reached an undisputed championship fight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-leon-edwards-b-5",
            "text": "A five-round win over Nate Diaz became one of the final major steps before my title opportunity.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-leon-edwards-b-6",
            "text": "The title shot matched me with Kamaru Usman, whom I had already faced years earlier.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-leon-edwards-b-7",
            "text": "With less than a minute left, I landed a head kick that ended Usman’s long championship reign.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-leon-edwards-b-8",
            "text": "I retained the belt by beating him again in the trilogy fight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-leon-edwards-b-9",
            "text": "My title reign also included a decision win over Colby Covington.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-leon-edwards-b-10",
            "text": "The fighter nicknamed “Rocky” became the UFC welterweight champion after one of the most dramatic late knockouts in title-fight history.",
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
    "subjectId": "ufc:fabricio-werdum",
    "name": "Fabricio Werdum",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/fabricio-werdum",
      "identity1": "https://www.mmafighting.com/2015/6/9/8735917/losing-to-girlfriends-ex-boyfriend-changed-fabricio-werdum-s-life",
      "identity2": "https://www.ufc.com/news/werdum-el-brasileno-mas-espanol-del-ufc",
      "identity3": "https://www.ufc.com/news/fabricio-werdum-se-une-como-analista-en-espanol-en-ufc",
      "identity4": "https://www.ufc.com/news/werdum-el-brasileno-mas-espanol-del-ufc",
      "identity5": "https://www.ufc.com/news/werdum-el-brasileno-mas-espanol-del-ufc"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-fabricio-werdum-a-1",
            "text": "A humiliating grappling experience in my youth pushed me to begin Brazilian jiu-jitsu seriously.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-a-2",
            "text": "I eventually became an elite heavyweight grappler before MMA became the main focus of my career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity1"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-a-3",
            "text": "My professional fighting career included major success outside the UFC before I settled into a long UFC run.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-a-4",
            "text": "My first UFC stint began in 2007, but the biggest chapter of my UFC career came after I returned years later.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-a-5",
            "text": "I spent years living in Spain and later became comfortable enough in Spanish to work on UFC broadcasts.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "identity3"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-a-6",
            "text": "A return run included wins over Roy Nelson and Travis Browne.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-a-7",
            "text": "I captured an interim heavyweight title by stopping Mark Hunt.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-a-8",
            "text": "I unified the championship by submitting Cain Velasquez in 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-a-9",
            "text": "Stipe Miocic ended my UFC title reign in my next fight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-a-10",
            "text": "My grappling-heavy heavyweight career became closely associated with the nickname “Vai Cavalo.”",
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
            "id": "ufc-fabricio-werdum-b-1",
            "text": "Brazilian jiu-jitsu was the skill that first gave my combat career a serious direction.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-b-2",
            "text": "My path to MMA also took me through coaching and training opportunities before I became a major heavyweight name myself.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-b-3",
            "text": "I fought professionally in several countries and promotions before my best UFC run.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-b-4",
            "text": "When I returned to the UFC, I put together a long winning streak in the heavyweight division.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-b-5",
            "text": "My connection to Mirko Cro Cop helped open an early door into the Japanese fight scene.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-b-6",
            "text": "A decision win over Travis Browne earned me an interim-title opportunity.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-b-7",
            "text": "I stopped Mark Hunt to win that interim belt.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-b-8",
            "text": "I then submitted Cain Velasquez to become undisputed UFC heavyweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-b-9",
            "text": "I later worked as an analyst on the UFC’s Spanish-language broadcasts.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-fabricio-werdum-b-10",
            "text": "I am the heavyweight champion and world-class grappler known by the Portuguese nickname “Vai Cavalo.”",
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
    "subjectId": "ufc:tony-ferguson",
    "name": "Tony Ferguson",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/tony-ferguson",
      "identity1": "https://www.ufc.com/news/another-new-start-tony-ferguson",
      "identity2": "https://www.ufc.com/news/another-new-start-tony-ferguson",
      "identity3": "https://www.ufc.com/athlete/tony-ferguson",
      "identity4": "https://www.ufc.com/news/tony-fergusons-perfect-storm",
      "identity5": "https://www.ufc.com/news/after-recovering-injury-tony-ferguson-feels-better-ever"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-tony-ferguson-a-1",
            "text": "I was a multi-sport high-school athlete, competing in football, baseball and wrestling.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-tony-ferguson-a-2",
            "text": "Before fighting became my full-time job, bartending was the conventional job I held the longest.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-tony-ferguson-a-3",
            "text": "I have credited hunting lessons from my father with teaching me patience and focus.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-tony-ferguson-a-4",
            "text": "My UFC career began after I won a reality-show tournament in 2011.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tony-ferguson-a-5",
            "text": "I eventually moved into the lightweight division and built one of the longest winning streaks in its history.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tony-ferguson-a-6",
            "text": "That streak reached twelve UFC victories.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tony-ferguson-a-7",
            "text": "I submitted Kevin Lee to win the interim lightweight championship in 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tony-ferguson-a-8",
            "text": "A repeatedly scheduled title fight with Khabib Nurmagomedov became famous for never actually happening.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity1"
            ]
          },
          {
            "id": "ufc-tony-ferguson-a-9",
            "text": "Justin Gaethje ended my twelve-fight winning streak in a 2020 interim-title bout.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tony-ferguson-a-10",
            "text": "My eccentric training style and the nickname “El Cucuy” became as recognizable as my elbows and submission game.",
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
            "id": "ufc-tony-ferguson-b-1",
            "text": "I became known for designing unusual training routines instead of following a conventional camp formula.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-tony-ferguson-b-2",
            "text": "Those methods included improvised equipment and recovery ideas that often looked strange from the outside.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-tony-ferguson-b-3",
            "text": "I entered the UFC in 2011 and eventually made lightweight my long-term division.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tony-ferguson-b-4",
            "text": "My rise was built on relentless pace, awkward striking, elbows and opportunistic submissions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity5"
            ]
          },
          {
            "id": "ufc-tony-ferguson-b-5",
            "text": "Wins over Edson Barboza and Rafael dos Anjos helped move me into championship position.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tony-ferguson-b-6",
            "text": "I won an interim belt by submitting Kevin Lee.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tony-ferguson-b-7",
            "text": "A matchup with Khabib Nurmagomedov was booked multiple times but repeatedly fell apart.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-tony-ferguson-b-8",
            "text": "I later beat Anthony Pettis and Donald Cerrone during the same long winning streak.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tony-ferguson-b-9",
            "text": "Justin Gaethje finally stopped that run in 2020.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tony-ferguson-b-10",
            "text": "The lightweight contender known as “El Cucuy” built a twelve-fight UFC winning streak without ever fighting for the undisputed belt.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "profile",
              "ledger"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:frank-shamrock",
    "name": "Frank Shamrock",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/frank-shamrock",
      "identity1": "https://www.espn.com/extra/mma/news/story?id=3638757",
      "identity2": "https://www.si.com/more-sports/2010/06/29/shamrock",
      "identity3": "https://www.si.com/more-sports/2010/06/29/shamrock",
      "identity4": "https://www.si.com/more-sports/2010/06/29/shamrock",
      "identity5": "https://www.si.com/more-sports/2010/06/29/shamrock",
      "lineage": "https://www.ufc.com/news/ufc-light-heavyweight-title-lineage-jones-cormier-blachowicz-teixeira-prochazka?language_content_entity=en",
      "titleFights": "https://www.ufc.com/news/10-light-heavyweight-title-fights",
      "tito": "https://www.ufc.com/news/10-top-september-skirmishes",
      "siblings": "https://www.ufc.com/news/national-sibling-day-diaz-brothers-shevchenko-sisters"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-frank-shamrock-a-1",
            "text": "I spent part of my youth moving through foster homes and group homes before finding stability at a boys ranch.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-frank-shamrock-a-2",
            "text": "I deliberately trained striking, wrestling and submissions together at a time when many fighters still specialized much more narrowly.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-frank-shamrock-a-3",
            "text": "I had already spent several years fighting professionally before entering the UFC in 1997.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "ledger"
            ]
          },
          {
            "id": "ufc-frank-shamrock-a-4",
            "text": "My UFC debut came in Japan in 1997, and the bout was already a championship fight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lineage",
              "ledger"
            ]
          },
          {
            "id": "ufc-frank-shamrock-a-5",
            "text": "I submitted Olympic wrestler Kevin Jackson in that debut to become a UFC champion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lineage",
              "ledger"
            ]
          },
          {
            "id": "ufc-frank-shamrock-a-6",
            "text": "I then defended the belt against Igor Zinoviev, Jeremy Horn and John Lober.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lineage"
            ]
          },
          {
            "id": "ufc-frank-shamrock-a-7",
            "text": "Every appearance I made in the UFC carried championship stakes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "titleFights"
            ]
          },
          {
            "id": "ufc-frank-shamrock-a-8",
            "text": "My last UFC fight ended in the fourth round against Tito Ortiz at UFC 22.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tito",
              "ledger"
            ]
          },
          {
            "id": "ufc-frank-shamrock-a-9",
            "text": "I left the UFC in 1999 without a loss in five appearances and with four successful title defenses.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lineage",
              "ledger"
            ]
          },
          {
            "id": "ufc-frank-shamrock-a-10",
            "text": "I was the first champion of the UFC division now known as light heavyweight, when the belt was still called the middleweight title.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lineage"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-frank-shamrock-b-1",
            "text": "As a teenager, I was taken in by the man who ran the boys ranch where I had lived, and he later adopted me.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-frank-shamrock-b-2",
            "text": "After my first retirement, I described myself less as only a fighter and more as a “fight executive.”",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-frank-shamrock-b-3",
            "text": "My training philosophy helped make me an early example of the well-rounded mixed martial artist rather than a one-discipline specialist.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-frank-shamrock-b-4",
            "text": "I opened my UFC career with a first-round submission in a title fight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "lineage"
            ]
          },
          {
            "id": "ufc-frank-shamrock-b-5",
            "text": "After leaving one famous fight-team orbit, I moved to San Jose and helped form American Kickboxing Academy.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-frank-shamrock-b-6",
            "text": "I won all five of my UFC appearances and defended my championship four times.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lineage",
              "ledger"
            ]
          },
          {
            "id": "ufc-frank-shamrock-b-7",
            "text": "Two of those title defenses came against Jeremy Horn and John Lober.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lineage"
            ]
          },
          {
            "id": "ufc-frank-shamrock-b-8",
            "text": "My 1999 defense against Tito Ortiz ended late in the fourth round and became one of the defining fights of that era.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tito",
              "titleFights"
            ]
          },
          {
            "id": "ufc-frank-shamrock-b-9",
            "text": "My entire UFC résumé consisted of championship fights.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "titleFights"
            ]
          },
          {
            "id": "ufc-frank-shamrock-b-10",
            "text": "The surname I became famous under came from my adoptive father, and another of his adopted sons was already one of the UFC’s earliest stars.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "siblings"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:deiveson-figueiredo",
    "name": "Deiveson Figueiredo",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/deiveson-figueiredo",
      "identity1": "https://www.espn.com/mma/story/_/id/30348955/ufc-champ-deiveson-figueiredo-put-work-sushi-chef-hairdresser",
      "identity2": "https://www.espn.com/mma/story/_/id/30348955/ufc-champ-deiveson-figueiredo-put-work-sushi-chef-hairdresser",
      "identity3": "https://www.espn.com/mma/story/_/id/30348955/ufc-champ-deiveson-figueiredo-put-work-sushi-chef-hairdresser",
      "identity4": "https://www.espn.com/mma/story/_/id/30348955/ufc-champ-deiveson-figueiredo-put-work-sushi-chef-hairdresser",
      "identity5": "https://www.espn.com/mma/story/_/id/30348955/ufc-champ-deiveson-figueiredo-put-work-sushi-chef-hairdresser"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-deiveson-figueiredo-a-1",
            "text": "Before fighting paid the bills, I worked jobs that included security work.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-a-2",
            "text": "I also worked in food service and in a hair salon while building my career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-a-3",
            "text": "My grappling background included a traditional regional wrestling style before formal MMA success.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-a-4",
            "text": "I entered the UFC in 2017 and quickly established myself as a dangerous finisher in a lighter weight class.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-a-5",
            "text": "A winning run eventually put me opposite Joseph Benavidez for a vacant championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-a-6",
            "text": "I stopped Benavidez in the first meeting but could not win the belt because I had missed championship weight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-a-7",
            "text": "I submitted him in the rematch to become UFC flyweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-a-8",
            "text": "My title story then became a four-fight rivalry with Brandon Moreno.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-a-9",
            "text": "I later moved to bantamweight and added wins over Rob Font and Cody Garbrandt.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-a-10",
            "text": "The former flyweight champion became known as “Deus da Guerra,” or “God of War.”",
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
            "id": "ufc-deiveson-figueiredo-b-1",
            "text": "I grew up around fishing, animals and hard rural work before combat sports became my career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-b-2",
            "text": "I held several ordinary jobs while trying to make fighting financially sustainable.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-b-3",
            "text": "My early combat base included a folk-wrestling style that emphasizes throws and control.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-b-4",
            "text": "My UFC run began in 2017 and featured power that stood out for the division.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-b-5",
            "text": "I reached the flyweight title picture through a series of finishes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-b-6",
            "text": "Two fights with Joseph Benavidez defined the championship breakthrough, with the second ending by submission.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-b-7",
            "text": "I then fought Brandon Moreno four times, including a draw and multiple championship changes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-b-8",
            "text": "I regained the flyweight belt from Moreno before losing it back in their fourth meeting.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-b-9",
            "text": "After that rivalry, I moved up to bantamweight and remained a contender.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-deiveson-figueiredo-b-10",
            "text": "My violent finishing style matched the nickname “God of War.”",
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
    "subjectId": "ufc:vitor-belfort",
    "name": "Vitor Belfort",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/vitor-belfort",
      "identity1": "https://www.ufc.com/news/vitor-belfort-fightography-now-live-ufc-fight-pass",
      "identity2": "https://www.ufc.com/news/vitor-belfort-named-ufc-hall-fame-class-2025",
      "identity3": "https://www.ufc.com/news/vitor-belfort-diet",
      "identity4": "https://www.ufc.com/news/defining-phenom",
      "identity5": "https://www.ufc.com/news/vitor-belfort-named-ufc-hall-fame-class-2025"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-vitor-belfort-a-1",
            "text": "I began boxing and Brazilian jiu-jitsu at a very young age.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "identity4"
            ]
          },
          {
            "id": "ufc-vitor-belfort-a-2",
            "text": "By my late teens, I had already reached black-belt level in jiu-jitsu.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-vitor-belfort-a-3",
            "text": "I moved to the United States as a teenager to accelerate my fighting development.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-vitor-belfort-a-4",
            "text": "I entered top-level mixed martial arts while I was still a teenager.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity1"
            ]
          },
          {
            "id": "ufc-vitor-belfort-a-5",
            "text": "At age 19, I won a UFC heavyweight tournament by scoring two stoppages in one night.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-vitor-belfort-a-6",
            "text": "My hand speed quickly became one of the defining traits of my early career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity1"
            ]
          },
          {
            "id": "ufc-vitor-belfort-a-7",
            "text": "I later knocked out Wanderlei Silva in less than a minute.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-vitor-belfort-a-8",
            "text": "A 2004 fight with Randy Couture gave me the UFC light-heavyweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-vitor-belfort-a-9",
            "text": "Years later, a run of spectacular knockouts put me back into title fights against Anderson Silva and Jon Jones.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-vitor-belfort-a-10",
            "text": "My explosive early career and longevity made “The Phenom” the nickname most associated with me.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity2"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-vitor-belfort-b-1",
            "text": "As a boy, I sometimes sparred grown men using improvised mouthguards because proper equipment was not always available.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-vitor-belfort-b-2",
            "text": "Boxing and Brazilian jiu-jitsu developed side by side as my two earliest major combat skills.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-vitor-belfort-b-3",
            "text": "My professional career ultimately stretched across several eras and multiple UFC weight classes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-vitor-belfort-b-4",
            "text": "I was already fighting in the UFC in 1997.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-vitor-belfort-b-5",
            "text": "My first major UFC breakthrough came by winning a heavyweight tournament as a teenager.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-vitor-belfort-b-6",
            "text": "A later first-round knockout of Wanderlei Silva became one of the signature bursts of my career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-vitor-belfort-b-7",
            "text": "I captured the light-heavyweight championship in a fight with Randy Couture.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-vitor-belfort-b-8",
            "text": "I later challenged both Anderson Silva and Jon Jones for UFC titles.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-vitor-belfort-b-9",
            "text": "In 2013 I produced consecutive head-kick or spinning-kick knockouts of Michael Bisping, Luke Rockhold and Dan Henderson.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-vitor-belfort-b-10",
            "text": "The Hall of Famer known as “The Phenom” competed in the UFC across roughly two decades.",
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
    "subjectId": "ufc:tom-aspinall",
    "name": "Tom Aspinall",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/tom-aspinall",
      "identity1": "https://www.espn.com/mma/story/_/id/40642235/ufc-304-making-golden-generation-english-mma-leon-edwards-tom-aspinall-michael-bisping",
      "identity2": "https://www.ufc.com/news/tom-aspinall-thrives-under-pressure-heavyweight-ufc-fight-night-brunson-till",
      "identity3": "https://www.espn.com/mma/story/_/id/40642235/ufc-304-making-golden-generation-english-mma-leon-edwards-tom-aspinall-michael-bisping",
      "identity4": "https://www.ufc.com/news/tom-aspinall-london-no-going-anywhere-heavyweight-ufc-main-event",
      "identity5": "https://www.espn.com/mma/story/_/id/46706704/ufc-321-secrets-tom-aspinall-heavyweight-fighting-approach"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-tom-aspinall-a-1",
            "text": "My original combat base was Brazilian jiu-jitsu rather than the striking style I later became famous for.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-tom-aspinall-a-2",
            "text": "I grew up around martial arts through my father, who also became my longtime coach.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-tom-aspinall-a-3",
            "text": "My upbringing was more blue-collar than professional-sports oriented.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-tom-aspinall-a-4",
            "text": "I deliberately trained to move like a lighter fighter instead of accepting the usual slow-heavyweight stereotype.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-tom-aspinall-a-5",
            "text": "I entered the UFC in 2020 and quickly built a reputation for unusually short heavyweight fights.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tom-aspinall-a-6",
            "text": "I submitted former champion Andrei Arlovski and later submitted Alexander Volkov.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tom-aspinall-a-7",
            "text": "A knee injury ended my first fight with Curtis Blaydes almost immediately.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tom-aspinall-a-8",
            "text": "I returned from surgery with a fast stoppage of Marcin Tybura.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tom-aspinall-a-9",
            "text": "I knocked out Sergei Pavlovich to win the interim heavyweight championship in 2023.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tom-aspinall-a-10",
            "text": "I later avenged the Blaydes loss with a first-round stoppage in an interim-title defense.",
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
            "id": "ufc-tom-aspinall-b-1",
            "text": "I spent years building a grappling base before my speed and boxing became the traits most fans noticed.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-tom-aspinall-b-2",
            "text": "My father’s background across several combat sports shaped the way I learned to fight.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-tom-aspinall-b-3",
            "text": "Earlier in my career, I also trained around elite heavyweight boxing and learned from Tyson Fury.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-tom-aspinall-b-4",
            "text": "I reached the UFC in 2020 as a heavyweight prospect with a style built around speed rather than size alone.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile",
              "identity5"
            ]
          },
          {
            "id": "ufc-tom-aspinall-b-5",
            "text": "My first five UFC victories all ended by stoppage.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-tom-aspinall-b-6",
            "text": "That run included submissions of Andrei Arlovski and Alexander Volkov.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tom-aspinall-b-7",
            "text": "A serious knee injury against Curtis Blaydes interrupted the rise.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tom-aspinall-b-8",
            "text": "After returning, I stopped Marcin Tybura in just over a minute.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tom-aspinall-b-9",
            "text": "I then knocked out Sergei Pavlovich on short notice to win interim UFC heavyweight gold.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-tom-aspinall-b-10",
            "text": "The fast-moving British heavyweight later defended that interim title by stopping Blaydes in the rematch.",
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
    "subjectId": "ufc:royce-gracie",
    "name": "Royce Gracie",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/royce-gracie",
      "identity1": "https://www.espn.com/mma/story/_/id/9964541/family-tradition",
      "identity2": "https://www.espn.com/mma/story/_/id/9964541/family-tradition",
      "identity3": "https://www.ufc.com/news/ufc-turns-30-years-old",
      "identity4": "https://www.ufc.com/news/gracie-way",
      "identity5": "https://www.espn.com/mma/story/_/id/9964541/family-tradition"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-royce-gracie-a-1",
            "text": "I grew up in a family where jiu-jitsu was part of everyday life, and I was already sparring grown men as a teenager.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-royce-gracie-a-2",
            "text": "As a young man, I joined a family member who was teaching our martial art out of a small garage in the United States.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-royce-gracie-a-3",
            "text": "I was intentionally chosen to represent my family because my relatively unimposing build would make technique beating size more convincing.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-royce-gracie-a-4",
            "text": "That decision put me into a brand-new fighting tournament in 1993.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3",
              "ledger"
            ]
          },
          {
            "id": "ufc-royce-gracie-a-5",
            "text": "I submitted Art Jimmerson in my first UFC bout.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-royce-gracie-a-6",
            "text": "I then won three fights in one night to capture the first UFC tournament.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "identity3"
            ]
          },
          {
            "id": "ufc-royce-gracie-a-7",
            "text": "I also won the UFC 2 and UFC 4 tournaments.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-royce-gracie-a-8",
            "text": "A later rematch with Ken Shamrock lasted more than half an hour and ended in a draw.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-royce-gracie-a-9",
            "text": "I returned to the UFC years later for a 2006 fight with Matt Hughes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-royce-gracie-a-10",
            "text": "The relatively small jiu-jitsu representative from the Gracie family became one of the foundational figures of the UFC.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "profile"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-royce-gracie-b-1",
            "text": "My father taught our family’s martial art but never forced me to compete with it.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-royce-gracie-b-2",
            "text": "The central idea of my early fighting identity was that leverage and technique could overcome a much larger opponent.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4",
              "identity2"
            ]
          },
          {
            "id": "ufc-royce-gracie-b-3",
            "text": "After one of my earliest tournament victories, I celebrated with Ritz crackers and apple juice before going to bed.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-royce-gracie-b-4",
            "text": "I competed in the UFC’s original open-weight tournament era rather than in a modern weight class.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "identity3"
            ]
          },
          {
            "id": "ufc-royce-gracie-b-5",
            "text": "I submitted Gerard Gordeau in the final of the first UFC event.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-royce-gracie-b-6",
            "text": "I went on to win multiple early UFC tournaments through a string of submissions.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-royce-gracie-b-7",
            "text": "Opponents such as Kimo Leopoldo and Dan Severn became part of that tournament résumé.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-royce-gracie-b-8",
            "text": "Ken Shamrock became one of my defining early rivals.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-royce-gracie-b-9",
            "text": "I later returned for a cross-generational fight with Matt Hughes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-royce-gracie-b-10",
            "text": "I was the slender Gracie family representative whose jiu-jitsu success at UFC 1 changed how the sport viewed size and technique.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "identity3"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:anthony-pettis",
    "name": "Anthony Pettis",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/anthony-pettis",
      "identity1": "https://www.mmafighting.com/2010/08/17/183020/showtime-pettis-plans-to-exploit-shane-rollers-holes-seize-w",
      "identity2": "https://www.ufc.com/news/when-its-showtime-anthony-pettis-turns-chaos-comfort",
      "identity3": "https://www.ufc.com/news/pettis-ready-defend",
      "identity4": "https://www.ufc.com/news/anthony-pettis-finally-its-showtime",
      "identity5": "https://www.ufc.com/news/when-its-showtime-anthony-pettis-turns-chaos-comfort"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-anthony-pettis-a-1",
            "text": "I first entered martial arts at age five because my mother enrolled my brother and me in a taekwondo class.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-anthony-pettis-a-2",
            "text": "I have traced some of my creativity to being the kid who always tried to outdo everyone else physically.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-anthony-pettis-a-3",
            "text": "My younger brother also became a high-level professional mixed martial artist.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-anthony-pettis-a-4",
            "text": "I reached the UFC in 2011 after already becoming a champion in another major promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity2"
            ]
          },
          {
            "id": "ufc-anthony-pettis-a-5",
            "text": "After an uneven start, knockout wins over Joe Lauzon and Donald Cerrone moved me into the lightweight title picture.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-anthony-pettis-a-6",
            "text": "Before the UFC, I had already become famous for a kick launched off the cage in a championship fight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity2",
              "profile"
            ]
          },
          {
            "id": "ufc-anthony-pettis-a-7",
            "text": "I submitted Benson Henderson to win the UFC lightweight championship in 2013.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-anthony-pettis-a-8",
            "text": "I defended the belt by submitting Gilbert Melendez.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-anthony-pettis-a-9",
            "text": "Later UFC chapters took me to featherweight and welterweight, where I knocked out Stephen Thompson.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-anthony-pettis-a-10",
            "text": "The cage kick and my nickname, “Showtime,” became inseparable parts of my fighting identity.",
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
            "id": "ufc-anthony-pettis-b-1",
            "text": "My martial-arts background began with taekwondo long before mixed martial arts became my profession.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-anthony-pettis-b-2",
            "text": "Creative movement and risk-taking became major parts of the style I developed.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-anthony-pettis-b-3",
            "text": "I entered the UFC with an established reputation from a different promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity2"
            ]
          },
          {
            "id": "ufc-anthony-pettis-b-4",
            "text": "My first UFC loss slowed the hype, but I rebuilt with a series of increasingly spectacular wins.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-anthony-pettis-b-5",
            "text": "A body kick stopped Donald Cerrone and pushed me toward a title fight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-anthony-pettis-b-6",
            "text": "I then submitted Benson Henderson to become UFC lightweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-anthony-pettis-b-7",
            "text": "My first successful defense was another submission, this time against Gilbert Melendez.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-anthony-pettis-b-8",
            "text": "I later challenged at featherweight and also competed at welterweight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-anthony-pettis-b-9",
            "text": "A knockout of Stephen Thompson became one of the biggest wins of that later run.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-anthony-pettis-b-10",
            "text": "Duke Roufus gave me the nickname “Showtime,” which later fit perfectly with the famous cage kick that defined my highlight reel.",
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
    "subjectId": "ufc:shogun-rua",
    "name": "Mauricio \"Shogun\" Rua",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/shogun-rua",
      "identity1": "https://www.ufc.com/athlete/mauricio-rua",
      "identity2": "https://www.ufc.com/athlete/mauricio-rua",
      "identity3": "https://www.ufc.com/news/how-chute-boxe-created-brazil-ufc-legends",
      "identity4": "https://www.ufc.com/news/shogun-returns-his-second-home",
      "identity5": "https://www.ufc.com/news/shogun-back-what-was-center-mma"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-shogun-rua-a-1",
            "text": "Before fighting fully took over my life, I did some modeling work, including photo shoots and fashion shows.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-shogun-rua-a-2",
            "text": "I began training seriously as a teenager after following an older brother into the sport.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-shogun-rua-a-3",
            "text": "I developed in a notoriously hard-sparring gym culture where elite teammates pushed each other daily.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-shogun-rua-a-4",
            "text": "Most of my early international reputation was built outside the UFC.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity4"
            ]
          },
          {
            "id": "ufc-shogun-rua-a-5",
            "text": "In 2005, I won a major light-heavyweight Grand Prix in Japan.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity4"
            ]
          },
          {
            "id": "ufc-shogun-rua-a-6",
            "text": "My UFC debut in 2007 ended in an upset submission loss to Forrest Griffin.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-shogun-rua-a-7",
            "text": "After rebuilding, I knocked out Chuck Liddell and earned a title fight with Lyoto Machida.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-shogun-rua-a-8",
            "text": "I lost a controversial decision to Machida, then knocked him out in the rematch to become UFC champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-shogun-rua-a-9",
            "text": "Jon Jones ended my title reign in my next championship appearance.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-shogun-rua-a-10",
            "text": "My early success in Japan and later UFC title made the nickname “Shogun” one of the defining names of my generation.",
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
            "id": "ufc-shogun-rua-b-1",
            "text": "Japan became almost a second home because so much of my early international career and fan following developed there.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-shogun-rua-b-2",
            "text": "I came from an aggressive Brazilian gym culture that prized hard sparring and attacking offense.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-shogun-rua-b-3",
            "text": "By the time I joined the UFC in 2007, I was already an established light-heavyweight star.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-shogun-rua-b-4",
            "text": "My first UFC appearance ended in a submission loss, forcing me to rebuild immediately.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-shogun-rua-b-5",
            "text": "A knockout of Chuck Liddell helped earn me a shot at Lyoto Machida’s title.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-shogun-rua-b-6",
            "text": "The first Machida fight ended in a disputed decision loss.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-shogun-rua-b-7",
            "text": "I won the rematch by first-round knockout to become UFC light-heavyweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-shogun-rua-b-8",
            "text": "Jon Jones took the belt from me in my first defense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-shogun-rua-b-9",
            "text": "Later wars with Dan Henderson became another major chapter of my UFC career.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-shogun-rua-b-10",
            "text": "The former Grand Prix winner and UFC champion became globally known by the fighting nickname “Shogun.”",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity4"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "ufc:dan-henderson",
    "name": "Dan Henderson",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/dan-henderson",
      "identity1": "https://www.ufc.com/news/dan-henderson-fue-dos-veces-seleccionado-olimpico",
      "identity2": "https://www.ufc.com/news/dan-henderson-fue-dos-veces-seleccionado-olimpico",
      "identity3": "https://www.ufc.com/news/dan-henderson-ufc-career-three-parts",
      "identity4": "https://www.ufc.com/news/dan-henderson-ufc-career-three-parts",
      "identity5": "https://www.ufc.com/news/dan-henderson-ufc-career-three-parts"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-dan-henderson-a-1",
            "text": "Wrestling was part of my life from childhood because my father coached the sport.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-dan-henderson-a-2",
            "text": "I initially viewed mixed martial arts partly as a way to finance my wrestling ambitions.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-dan-henderson-a-3",
            "text": "A longtime friend from the wrestling world helped pull me toward early MMA competition.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-dan-henderson-a-4",
            "text": "I became a major figure in the wrestling-heavy Team Quest camp.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-dan-henderson-a-5",
            "text": "I represented the United States in Greco-Roman wrestling at two Olympic Games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-dan-henderson-a-6",
            "text": "In 1998, I won a UFC tournament before leaving to build much of my reputation elsewhere.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-henderson-a-7",
            "text": "When I later returned, I challenged Quinton Jackson and Anderson Silva in UFC championship bouts.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-henderson-a-8",
            "text": "My knockout of Michael Bisping at UFC 100 became one of the most replayed finishes of my career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-henderson-a-9",
            "text": "Two wars with Mauricio Rua and a late-career title rematch with Bisping added to my UFC legacy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-henderson-a-10",
            "text": "The overhand right fans called the “H-Bomb” became the signature weapon of my career.",
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
            "id": "ufc-dan-henderson-b-1",
            "text": "I came from a serious wrestling background before mixed martial arts was an established career path.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-dan-henderson-b-2",
            "text": "Early on, fighting was secondary to my goal of making another elite wrestling team.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-dan-henderson-b-3",
            "text": "I later helped become one of the foundational figures behind Team Quest.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-dan-henderson-b-4",
            "text": "My UFC debut came in a one-night tournament in 1998.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-henderson-b-5",
            "text": "I won that tournament and then spent years collecting major accomplishments outside the UFC.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-henderson-b-6",
            "text": "On returning, I fought Quinton Jackson and Anderson Silva in back-to-back championship bouts.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-henderson-b-7",
            "text": "I knocked out Michael Bisping with my trademark right hand at UFC 100.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-henderson-b-8",
            "text": "My first fight with Mauricio Rua became a five-round classic, and I stopped him in their rematch.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-henderson-b-9",
            "text": "At age 46, I received one final UFC title opportunity in a rematch with Bisping.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dan-henderson-b-10",
            "text": "My Olympic wrestling roots, Team Quest identity and “H-Bomb” right hand made me one of MMA’s most durable crossover-era stars.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "identity3",
              "profile"
            ]
          }
        ]
      }
    }
  }
];
