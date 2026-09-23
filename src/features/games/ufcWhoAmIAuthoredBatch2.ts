import type { UfcWhoAmIAuthoredIdentity } from "./ufcWhoAmIAuthoredScripts";

/**
 * Static authored UFC Who Am I batch 2.
 * Source-backed at authoring time; runtime serves these clue strings verbatim.
 */
export const ufcWhoAmIAuthoredBatch2: readonly UfcWhoAmIAuthoredIdentity[] = [
  {
    "subjectId": "ufc:dricus-du-plessis",
    "name": "Dricus du Plessis",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/dricus-du-plessis",
      "identity1": "https://www.ufc.com/athlete/dricus-du-plessis?language_content_entity=en",
      "identity2": "https://www.ufc.com/athlete/dricus-du-plessis?language_content_entity=en",
      "identity3": "https://www.ufc.com/athlete/dricus-du-plessis?language_content_entity=en",
      "identity4": "https://www.ufc.com/athlete/dricus-du-plessis?language_content_entity=en",
      "identity5": "https://www.ufc.com/athlete/dricus-du-plessis?language_content_entity=en"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-dricus-du-plessis-a-1",
            "text": "My martial-arts path moved through judo, wrestling and kickboxing before I committed fully to MMA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-a-2",
            "text": "I studied agricultural economics at university before leaving in my final year to pursue a championship opportunity in fighting.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-a-3",
            "text": "I entered the UFC in 2020 after already building a championship résumé outside the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-a-4",
            "text": "I won my first six UFC appearances to earn my first championship fight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-a-5",
            "text": "A submission of Darren Till was part of the run that moved me into the middleweight elite.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-a-6",
            "text": "I stopped former champion Robert Whittaker in the second round to secure a title shot.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-a-7",
            "text": "I beat Sean Strickland by split decision to win the UFC middleweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-a-8",
            "text": "My first title defense ended with a fourth-round submission of Israel Adesanya.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-a-9",
            "text": "I later defeated Strickland again in a five-round championship rematch.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-a-10",
            "text": "My brother gave me the nickname “Stillknocks,” a reference to the knockout-heavy kickboxing run I had before MMA.",
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
            "id": "ufc-dricus-du-plessis-b-1",
            "text": "As a teenager, I competed at a high level in K-1 kickboxing before moving into professional MMA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-b-2",
            "text": "Fighting became my full-time career early enough that I never built a separate conventional job after school.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-b-3",
            "text": "I made my UFC debut with a first-round stoppage in 2020.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-b-4",
            "text": "My first UFC run stayed unbeaten through six fights across three calendar years.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-b-5",
            "text": "I beat Brad Tavares over three rounds before submitting Darren Till in my next appearance.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-b-6",
            "text": "A corner stoppage against Derek Brunson extended the run that pushed me toward title contention.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-b-7",
            "text": "I then stopped Robert Whittaker, a former champion, before receiving my first UFC title opportunity.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-b-8",
            "text": "A split decision over Sean Strickland made me UFC middleweight champion in 2024.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-b-9",
            "text": "I defended the belt by submitting Israel Adesanya and later winning a rematch with Strickland.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-dricus-du-plessis-b-10",
            "text": "The “Stillknocks” nickname traces back to my brother and my earlier reputation for knocking opponents out in kickboxing.",
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
    "subjectId": "ufc:khamzat-chimaev",
    "name": "Khamzat Chimaev",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/khamzat-chimaev",
      "identity1": "https://www.ufc.com/athlete/khamzat-chimaev",
      "identity2": "https://www.ufc.com/athlete/khamzat-chimaev",
      "identity3": "https://www.ufc.com/athlete/khamzat-chimaev",
      "identity4": "https://kr.ufc.com/athlete/khamzat-chimaev?page=1",
      "identity5": "https://www.ufc.com/athlete/khamzat-chimaev"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-khamzat-chimaev-a-1",
            "text": "Wrestling was my main combat sport long before I became a professional mixed martial artist.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-a-2",
            "text": "Before fighting full time, I worked jobs that included poultry-factory work and security.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-a-3",
            "text": "I have described training days that begin with a 5 a.m. run before later team practice.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-a-4",
            "text": "My first two UFC victories came only days apart during my 2020 debut stretch.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-a-5",
            "text": "I submitted John Phillips in my UFC debut and then stopped Rhys McKee in my next appearance.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-a-6",
            "text": "My third UFC fight lasted only seconds before I knocked out Gerald Meerschaert.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-a-7",
            "text": "I submitted Li Jingliang in the first round without absorbing a significant strike.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-a-8",
            "text": "A three-round win over Gilbert Burns became the first extended test of my UFC career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-a-9",
            "text": "I later submitted former champion Robert Whittaker in the first round.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-a-10",
            "text": "I won the UFC middleweight championship by defeating Dricus du Plessis, adding a belt to an unbeaten professional run.",
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
            "id": "ufc-khamzat-chimaev-b-1",
            "text": "I continued wrestling seriously after relocating during my youth and only later reorganized my life around MMA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-b-2",
            "text": "My path into full-time fighting came after ordinary jobs rather than directly from a professional sports career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-b-3",
            "text": "A chance visit to a major MMA gym convinced me to reshape my training around mixed martial arts.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-b-4",
            "text": "Once I reached the UFC, I won three fights in a remarkably short opening stretch.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-b-5",
            "text": "The third of those wins was a 17-second knockout of Gerald Meerschaert.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-b-6",
            "text": "I submitted Kevin Holland in the first round after a chaotic fight-week change of opponent.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-b-7",
            "text": "I beat former welterweight champion Kamaru Usman by decision on short notice.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-b-8",
            "text": "A first-round submission of Robert Whittaker put me directly into the middleweight title picture.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-b-9",
            "text": "I later defeated Dricus du Plessis in a five-round championship fight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-khamzat-chimaev-b-10",
            "text": "My nickname “Borz” means “wolf” in Chechen.",
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
    "subjectId": "ufc:sean-omalley",
    "name": "Sean O'Malley",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/sean-omalley",
      "identity1": "https://www.ufc.com/news/sean-omalley-fighting-to-be-the-best-ufc-250",
      "identity2": "https://www.montanasports.com/more-sports/molded-who-i-was-sean-omalley-credits-growing-up-in-montana-as-huge-role-in-ufc-success",
      "identity3": "https://www.bbc.co.uk/sport/mixed-martial-arts/53763265",
      "identity4": "https://www.bbc.co.uk/sport/mixed-martial-arts/53763265",
      "identity5": "https://www.espn.com/mma/ufc/story/_/id/28809373/facial-tattoos-smoking-snoop-meet-star-fighter-sean-omalley"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-sean-omalley-a-1",
            "text": "Before discovering fighting as a teenager, I had imagined trying to reach the NFL.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-sean-omalley-a-2",
            "text": "An early MMA coach helped give me unusually strong belief that I could become a top-level fighter.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-sean-omalley-a-3",
            "text": "A knockout on Dana White’s Contender Series earned me my UFC contract.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity5"
            ]
          },
          {
            "id": "ufc-sean-omalley-a-4",
            "text": "I built a long winning start in the UFC before suffering my first loss inside the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-omalley-a-5",
            "text": "A walk-off knockout of Eddie Wineland became one of my early signature UFC finishes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-omalley-a-6",
            "text": "I stopped Kris Moutinho in the third round after landing a huge volume of strikes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-omalley-a-7",
            "text": "A split-decision win over Petr Yan moved me into the bantamweight title picture.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-omalley-a-8",
            "text": "I knocked out Aljamain Sterling in the second round to become UFC bantamweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-omalley-a-9",
            "text": "I defended that championship by winning a five-round rematch with Marlon Vera.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-omalley-a-10",
            "text": "My “Sugar” nickname and bright, fight-specific hair colors became two of the most recognizable parts of my UFC identity.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity3",
              "identity4"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "ufc-sean-omalley-b-1",
            "text": "I found mixed martial arts at 16 after realizing my build made an NFL path unrealistic.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-sean-omalley-b-2",
            "text": "My early career grew quickly after I began training under a coach who strongly believed in my potential.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-sean-omalley-b-3",
            "text": "My breakout before the UFC came through the Contender Series rather than The Ultimate Fighter.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity5"
            ]
          },
          {
            "id": "ufc-sean-omalley-b-4",
            "text": "My first several UFC appearances established me as a dangerous long-range striker.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "ledger"
            ]
          },
          {
            "id": "ufc-sean-omalley-b-5",
            "text": "My first UFC loss came against Marlon Vera in 2020 after a leg injury affected the fight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-omalley-b-6",
            "text": "I rebuilt from that loss with a run of finishes before beating Petr Yan by split decision.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-omalley-b-7",
            "text": "I won the bantamweight championship by stopping Aljamain Sterling at UFC 292.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-omalley-b-8",
            "text": "A five-round decision over Vera later avenged my first UFC defeat.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-sean-omalley-b-9",
            "text": "Snoop Dogg became part of the viral moment around my Contender Series breakthrough before I was a UFC champion.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-sean-omalley-b-10",
            "text": "An early coach gave me the nickname “Sugar” because he thought my striking looked sweet.",
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
    "subjectId": "ufc:forrest-griffin",
    "name": "Forrest Griffin",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/forrest-griffin",
      "identity1": "https://www.ufc.com/news/flashback-forrest-griffins-new-reality",
      "identity2": "https://www.ufc.com/news/flashback-forrest-griffins-new-reality",
      "identity3": "https://www.ufc.com/news/griffin-bonnar-night-changed-everything?language_content_entity=en",
      "identity4": "https://www.ufc.com/news/ufc-25-forrest-griffin",
      "identity5": "https://www.ufc.com/news/forrest-griffin-he-did-it-his-way"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-forrest-griffin-a-1",
            "text": "Before fighting became my full-time career, I worked as a university police officer.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-forrest-griffin-a-2",
            "text": "I initially treated MMA as a side pursuit while holding a regular job.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-forrest-griffin-a-3",
            "text": "My first professional fight came against a far more experienced veteran for a very small purse.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-forrest-griffin-a-4",
            "text": "I entered the UFC through the first season of a reality competition built around fighters living and training together.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity3"
            ]
          },
          {
            "id": "ufc-forrest-griffin-a-5",
            "text": "My finale fight with Stephan Bonnar became one of the defining breakthrough moments in UFC television history.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3",
              "ledger"
            ]
          },
          {
            "id": "ufc-forrest-griffin-a-6",
            "text": "I later submitted Mauricio Rua in a major upset that pushed me toward a title shot.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-forrest-griffin-a-7",
            "text": "I beat Quinton Jackson over five rounds to win the UFC light heavyweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-forrest-griffin-a-8",
            "text": "My title reign ended when Rashad Evans stopped me in the third round.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-forrest-griffin-a-9",
            "text": "Outside fighting, I became the author of two New York Times bestselling books.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-forrest-griffin-a-10",
            "text": "My fight with Bonnar was later inducted into the UFC Hall of Fame’s Fight Wing.",
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
            "id": "ufc-forrest-griffin-b-1",
            "text": "I balanced professional fighting with police work before deciding to pursue MMA full time.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "identity2"
            ]
          },
          {
            "id": "ufc-forrest-griffin-b-2",
            "text": "My personality became known for being self-deprecating and unusually open about the rough side of fighting.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-forrest-griffin-b-3",
            "text": "A reality-show opportunity in 2005 became the turning point that brought me into the UFC.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity3"
            ]
          },
          {
            "id": "ufc-forrest-griffin-b-4",
            "text": "I won that competition in a three-round fight that helped change the trajectory of the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3",
              "ledger"
            ]
          },
          {
            "id": "ufc-forrest-griffin-b-5",
            "text": "I defeated Stephan Bonnar again by decision in a later UFC rematch.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-forrest-griffin-b-6",
            "text": "A submission win over Mauricio Rua earned me a shot at the light heavyweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-forrest-griffin-b-7",
            "text": "I took the belt from Quinton Jackson by unanimous decision at UFC 86.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-forrest-griffin-b-8",
            "text": "Later UFC wins included decisions over Tito Ortiz and Rich Franklin.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-forrest-griffin-b-9",
            "text": "I once described removing my own stitches with an X-Acto knife after the famous Bonnar fight.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-forrest-griffin-b-10",
            "text": "The first Ultimate Fighter winner and the man opposite Bonnar in that landmark finale became central parts of my UFC legacy.",
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
    "subjectId": "ufc:chael-sonnen",
    "name": "Chael Sonnen",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/chael-sonnen",
      "identity1": "https://www.ufc.com/news/outside-octagon-there-will-only-be-one-chael-sonnen",
      "identity2": "https://www.ufc.com/news/chael-says-quotables-mmas-most-interesting-man-0",
      "identity3": "https://www.themat.com/news/2016/february/24/bp32-chael-sonnen",
      "identity4": "https://www.ufc.com/news/sonnen-says-words-wisdom",
      "identity5": "https://www.mmafighting.com/2014/9/5/6108945/morning-report-ufc-chael-sonnen-wanderlei-silva-dana-white-overeem-jacare-king-mo-mma-news"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-chael-sonnen-a-1",
            "text": "Before MMA, I became an NCAA Division I All-American wrestler and also competed extensively in Greco-Roman wrestling.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-chael-sonnen-a-2",
            "text": "I attended the University of Oregon, majoring in sociology and minoring in business.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-chael-sonnen-a-3",
            "text": "Outside fighting, I worked in real estate and also pursued political ambitions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-chael-sonnen-a-4",
            "text": "My UFC career came in multiple stints before I emerged as a championship-level middleweight contender.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chael-sonnen-a-5",
            "text": "A decision win over Nate Marquardt earned me my first UFC title opportunity.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chael-sonnen-a-6",
            "text": "I controlled most of a five-round championship fight with Anderson Silva before being submitted late in the final round.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chael-sonnen-a-7",
            "text": "Wins over Brian Stann and Michael Bisping eventually earned me another fight with Silva.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chael-sonnen-a-8",
            "text": "I later moved up to light heavyweight and challenged Jon Jones for another UFC championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chael-sonnen-a-9",
            "text": "My career became as famous for relentless trash talk and promotional skill as for wrestling pressure.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity4"
            ]
          },
          {
            "id": "ufc-chael-sonnen-a-10",
            "text": "I leaned into the nickname “The American Gangster” as part of the deliberately provocative persona built around my fights.",
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
            "id": "ufc-chael-sonnen-b-1",
            "text": "I repeatedly described professional fighting as a “hobby,” arguing that my regular work should provide a conventional service to the community.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-chael-sonnen-b-2",
            "text": "Real estate and politics were both serious interests for me outside the cage.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-chael-sonnen-b-3",
            "text": "Wrestling was the technical foundation of my fighting style long before my UFC title opportunities.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-chael-sonnen-b-4",
            "text": "It took several UFC runs and setbacks before I put together the streak that made me a title challenger.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chael-sonnen-b-5",
            "text": "Consecutive wins over Yushin Okami and Nate Marquardt moved me to the front of the middleweight title line.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chael-sonnen-b-6",
            "text": "Against Anderson Silva, I was minutes away from a championship before a triangle-armbar ended the fight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chael-sonnen-b-7",
            "text": "I submitted Brian Stann and then beat Michael Bisping to earn a rematch with Silva.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chael-sonnen-b-8",
            "text": "A later coaching role on The Ultimate Fighter opposite Jon Jones led directly to a light heavyweight title fight.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chael-sonnen-b-9",
            "text": "I never won a UFC championship, but I challenged for belts in two divisions.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-chael-sonnen-b-10",
            "text": "The “American Gangster” moniker became inseparable from one of the most talkative personas in UFC history.",
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
    "subjectId": "ufc:valentina-shevchenko",
    "name": "Valentina Shevchenko",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/valentina-shevchenko",
      "identity1": "https://www.ufc.com/news/shevchenko-hoping-take-fast-lane-title-shot",
      "identity2": "https://www.mmafighting.com/2019/6/7/18650518/valentina-shevchenko-a-woman-of-many-nations-ahead-of-first-ufc-title-defense",
      "identity3": "https://www.ufc.com/athlete/valentina-shevchenko?language_content_entity=en",
      "identity4": "https://www.ufc.com/news/shevchenko-hoping-take-fast-lane-title-shot",
      "identity5": "https://www.ufc.com/news/antonina-shevchenko-family-business"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-valentina-shevchenko-a-1",
            "text": "I began martial arts at five in a family that was already deeply involved in combat sports.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-a-2",
            "text": "I earned an undergraduate degree in film directing outside my fighting career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-a-3",
            "text": "My UFC career began at bantamweight rather than the division where I would later build my longest title reign.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-a-4",
            "text": "I reached my first UFC championship opportunity after climbing through a larger weight class.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-a-5",
            "text": "A five-round decision over Holly Holm became a major step in that rise.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-a-6",
            "text": "I submitted Julianna Peña to earn a bantamweight title shot against Amanda Nunes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-a-7",
            "text": "After a close decision loss in that championship fight, I moved down and quickly entered the flyweight title picture.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-a-8",
            "text": "I beat Joanna Jedrzejczyk over five rounds to win the vacant UFC flyweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-a-9",
            "text": "That reign grew to seven consecutive successful title defenses before Alexa Grasso ended it.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-a-10",
            "text": "Known as “Bullet,” I became one of the defining champions in UFC women’s flyweight history.",
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
            "id": "ufc-valentina-shevchenko-b-1",
            "text": "Dance was part of my training from a young age and helped shape the body control I brought into martial arts.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-b-2",
            "text": "My older sister also became a professional fighter, making combat sports a shared family profession.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-b-3",
            "text": "I entered the UFC after an extensive combat-sports career that included high-level striking competition.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-b-4",
            "text": "My first several UFC fights came at bantamweight before I changed divisions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-b-5",
            "text": "I lived for years in Peru, learned Spanish and came to represent that country alongside Kyrgyzstan.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-b-6",
            "text": "My bantamweight run included two decision fights with Amanda Nunes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-b-7",
            "text": "At flyweight, I won the vacant championship by defeating Joanna Jedrzejczyk.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-b-8",
            "text": "One of my most famous defenses ended with a head-kick knockout of Jessica Eye.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-b-9",
            "text": "My championship story later developed into a multi-fight rivalry with Alexa Grasso.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-valentina-shevchenko-b-10",
            "text": "The nickname “Bullet” became closely tied to a career built on precise striking and a long flyweight title run.",
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
    "subjectId": "ufc:rose-namajunas",
    "name": "Rose Namajunas",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/rose-namajunas",
      "identity1": "https://www.ufc.com/athlete/rose-namajunas",
      "identity2": "https://www.ufc.com/athlete/rose-namajunas",
      "identity3": "https://www.ufc.com/athlete/rose-namajunas",
      "identity4": "https://www.mmafighting.com/2019/5/6/18534776/ufc-237-embedded-episode-1-dont-put-drinks-on-the-piano",
      "identity5": "https://www.ufc.com/news/rose-namajunas-one-win-away"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-rose-namajunas-a-1",
            "text": "I began martial arts at age five and developed an early base that included taekwondo and karate.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-rose-namajunas-a-2",
            "text": "As a teenager, I worked at a frozen-custard shop before fighting became my profession.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-rose-namajunas-a-3",
            "text": "I entered the UFC through the season of The Ultimate Fighter used to launch the women’s strawweight division.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-rose-namajunas-a-4",
            "text": "My UFC career began in 2014 after reaching the final of that tournament.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rose-namajunas-a-5",
            "text": "My first UFC appearance was a championship fight against Carla Esparza.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rose-namajunas-a-6",
            "text": "Wins over Paige VanZant and Michelle Waterson helped carry me back toward another title opportunity.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rose-namajunas-a-7",
            "text": "I knocked out Joanna Jedrzejczyk in the first round to win the strawweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rose-namajunas-a-8",
            "text": "I beat Jedrzejczyk again in an immediate five-round rematch.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rose-namajunas-a-9",
            "text": "After losing the belt, I later regained it by knocking out Zhang Weili with a head kick.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rose-namajunas-a-10",
            "text": "The nickname “Thug” came from people around my gym who connected my tough demeanor with the adversity I had grown up around.",
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
            "id": "ufc-rose-namajunas-b-1",
            "text": "Playing piano has remained one of my visible interests away from fighting.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-rose-namajunas-b-2",
            "text": "Gardening is another major part of how I spend time outside the cage.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-rose-namajunas-b-3",
            "text": "My path into the UFC came through a tournament rather than a conventional debut signing.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-rose-namajunas-b-4",
            "text": "I was still early in my professional career when that tournament put me into an immediate title fight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rose-namajunas-b-5",
            "text": "I lost the inaugural strawweight championship bout to Carla Esparza by submission.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rose-namajunas-b-6",
            "text": "Three straight wins later put me across from Joanna Jedrzejczyk for another title opportunity.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rose-namajunas-b-7",
            "text": "I shocked the champion with a first-round knockout and then won their rematch by decision.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rose-namajunas-b-8",
            "text": "A slam knockout loss to Jessica Andrade ended that reign, but I beat Andrade in a later rematch.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rose-namajunas-b-9",
            "text": "I became a two-time champion by head-kicking Zhang Weili and then beat her again in a title rematch.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-rose-namajunas-b-10",
            "text": "“Thug Rose” became the nickname most associated with my calm personality and championship career.",
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
    "subjectId": "ufc:cris-cyborg",
    "name": "Cris Cyborg",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/cris-cyborg",
      "identity1": "https://www.ufc.com/news/defined-her-courage-cyborg-protects-undefeated-streak",
      "identity2": "https://www.ufc.com/news/cyborg-ready-place-amongst-ufc-legends",
      "identity3": "https://www.ufc.com/news/defined-her-courage-cyborg-protects-undefeated-streak",
      "identity4": "https://www.ufc.com/news/cyborg-one-greatest-all-time-looks-add-legacy-vs-holm",
      "identity5": "https://www.ufc.com/news/defined-her-courage-cyborg-protects-undefeated-streak"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-cris-cyborg-a-1",
            "text": "Before combat sports became my profession, I played competitive handball.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-cris-cyborg-a-2",
            "text": "I lost my professional MMA debut and then built a long run without another defeat.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity3",
              "profile"
            ]
          },
          {
            "id": "ufc-cris-cyborg-a-3",
            "text": "I reached the UFC only after already establishing myself as a major champion elsewhere.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-cris-cyborg-a-4",
            "text": "My first two UFC appearances were stoppage wins contested at catchweight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cris-cyborg-a-5",
            "text": "I stopped Leslie Smith and Lina Lansberg in my first two appearances in the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cris-cyborg-a-6",
            "text": "My third UFC appearance was for a vacant featherweight championship against Tonya Evinger.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cris-cyborg-a-7",
            "text": "I won that belt by third-round stoppage and then defended it over five rounds against Holly Holm.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cris-cyborg-a-8",
            "text": "Another successful defense ended with a first-round stoppage of Yana Kunitskaya.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cris-cyborg-a-9",
            "text": "Amanda Nunes ended my UFC title reign with a first-round knockout in 2018.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cris-cyborg-a-10",
            "text": "The “Cyborg” name entered my fighting career through my then-husband, Evangelista Santos, before becoming most strongly associated with me.",
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
            "id": "ufc-cris-cyborg-b-1",
            "text": "I was first noticed for my athletic potential while playing a team sport rather than while training in a fight gym.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-cris-cyborg-b-2",
            "text": "My mother worked as a seamstress and made dresses for me to wear during fight week.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-cris-cyborg-b-3",
            "text": "Only months after losing my professional debut, I had already rebounded into a prominent women’s MMA main event.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-cris-cyborg-b-4",
            "text": "By the time I joined the UFC, I had spent years building a reputation as one of the sport’s most feared finishers.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-cris-cyborg-b-5",
            "text": "I became the first woman to train inside the famously demanding Chute Boxe team environment.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-cris-cyborg-b-6",
            "text": "My UFC run opened with two catchweight stoppages before the promotion created a featherweight title opportunity for me.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cris-cyborg-b-7",
            "text": "I stopped Tonya Evinger to become UFC featherweight champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cris-cyborg-b-8",
            "text": "My defenses included a five-round win over Holly Holm and a first-round stoppage of Yana Kunitskaya.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cris-cyborg-b-9",
            "text": "My only UFC loss came in a championship fight with Amanda Nunes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-cris-cyborg-b-10",
            "text": "The surname-like fighting identity “Cyborg” came from my relationship with fellow fighter Evangelista Santos.",
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
    "subjectId": "ufc:kayla-harrison",
    "name": "Kayla Harrison",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/kayla-harrison",
      "identity1": "https://www.ufc.com/athlete/kayla-harrison",
      "identity2": "https://www.ufc.com/athlete/kayla-harrison",
      "identity3": "https://www.ufc.com/athlete/kayla-harrison",
      "identity4": "https://www.ufc.com/athlete/kayla-harrison",
      "identity5": "https://www.ufc.com/athlete/kayla-harrison"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-kayla-harrison-a-1",
            "text": "While developing as an athlete, I worked jobs that included landscaping, dog walking and hardware-store work.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-kayla-harrison-a-2",
            "text": "At 16, I moved away from home to pursue elite training under an Olympic medalist and coach.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-kayla-harrison-a-3",
            "text": "After the 2016 Olympics, I retired from competitive judo and began learning striking for a move into MMA.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-kayla-harrison-a-4",
            "text": "I made my professional MMA debut in 2018 and built an established career before entering the UFC.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-kayla-harrison-a-5",
            "text": "My UFC debut came on UFC 300 in 2024.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kayla-harrison-a-6",
            "text": "I submitted former champion Holly Holm in the second round of that debut.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kayla-harrison-a-7",
            "text": "In my third UFC appearance, I submitted Julianna Peña to win the women’s bantamweight championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kayla-harrison-a-8",
            "text": "I became the youngest American awarded a sixth-degree black belt in judo.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-kayla-harrison-a-9",
            "text": "I became the first American to win an Olympic gold medal in judo.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-kayla-harrison-a-10",
            "text": "Four years after that breakthrough, I won Olympic judo gold again.",
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
            "id": "ufc-kayla-harrison-b-1",
            "text": "I turned professional in MMA only after completing an elite career in another combat sport.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile",
              "identity5"
            ]
          },
          {
            "id": "ufc-kayla-harrison-b-2",
            "text": "I spent several years building my MMA résumé outside the UFC before joining the promotion.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-kayla-harrison-b-3",
            "text": "My first UFC appearance was on the promotion’s 300th numbered event.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kayla-harrison-b-4",
            "text": "I won each of my first three appearances in the promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger"
            ]
          },
          {
            "id": "ufc-kayla-harrison-b-5",
            "text": "My first UFC win came by submission against a former UFC champion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kayla-harrison-b-6",
            "text": "My second UFC fight was a three-round decision win over Ketlen Vieira.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kayla-harrison-b-7",
            "text": "My third UFC fight was a title bout against Julianna Peña.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kayla-harrison-b-8",
            "text": "I won that championship fight with a second-round kimura.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-kayla-harrison-b-9",
            "text": "As a teenager, I moved to train under Olympic medalist Jimmy Pedro.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-kayla-harrison-b-10",
            "text": "My pre-MMA résumé includes becoming the first American Olympic judo champion and then repeating as a gold medalist four years later.",
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
    "subjectId": "ufc:miesha-tate",
    "name": "Miesha Tate",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/miesha-tate",
      "identity1": "https://www.ufc.com/news/tates-journey-bottom-could-reach-top-ufc-196",
      "identity2": "https://www.ufc.com/athlete/miesha-tate",
      "identity3": "https://www.ufc.com/news/miesha-tate-having-champions-heart",
      "identity4": "https://www.ufc.com/athlete/miesha-tate",
      "identity5": "https://www.ufc.com/news/miesha-tate-cupcake-nickname-only"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-miesha-tate-a-1",
            "text": "I found wrestling after basketball did not suit me and joined my high school’s boys wrestling team.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-miesha-tate-a-2",
            "text": "I later won a state girls high-school wrestling championship.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-miesha-tate-a-3",
            "text": "At 19, while in college, I took an amateur MMA fight after wrestling led me into submission grappling.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          },
          {
            "id": "ufc-miesha-tate-a-4",
            "text": "I entered the UFC in 2013 after already becoming a champion in another major women’s promotion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-miesha-tate-a-5",
            "text": "My UFC debut ended in a third-round loss to Cat Zingano.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-miesha-tate-a-6",
            "text": "My next championship opportunity came against Ronda Rousey after I coached opposite her on The Ultimate Fighter.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-miesha-tate-a-7",
            "text": "Four straight decision wins rebuilt me into another bantamweight title shot.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-miesha-tate-a-8",
            "text": "I came from behind to submit Holly Holm in the fifth round and win the UFC championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-miesha-tate-a-9",
            "text": "I lost that belt to Amanda Nunes in my first defense at UFC 200.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-miesha-tate-a-10",
            "text": "My “Cupcake” nickname played on the contrast between my appearance, my toughness and my genuine enjoyment of baking.",
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
            "id": "ufc-miesha-tate-b-1",
            "text": "Before fighting became my full-time career, I worked at Costco.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-miesha-tate-b-2",
            "text": "My combat-sports foundation came from wrestling rather than striking.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity1",
              "identity2"
            ]
          },
          {
            "id": "ufc-miesha-tate-b-3",
            "text": "I had already spent years in high-level women’s MMA before the UFC added my division.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-miesha-tate-b-4",
            "text": "My first UFC appearance came in 2013 against another top contender rather than in a tune-up fight.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-miesha-tate-b-5",
            "text": "A loss to Cat Zingano was followed by a title fight with Ronda Rousey later that year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-miesha-tate-b-6",
            "text": "Wins over Liz Carmouche, Rin Nakai, Sara McMann and Jessica Eye produced a four-fight streak.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-miesha-tate-b-7",
            "text": "I took the bantamweight championship from Holly Holm with a late rear-naked choke at UFC 196.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-miesha-tate-b-8",
            "text": "Amanda Nunes stopped me in the first round of my first title defense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-miesha-tate-b-9",
            "text": "I retired after a 2016 loss, then returned to the UFC nearly five years later with a stoppage win.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-miesha-tate-b-10",
            "text": "The nickname “Cupcake” became a familiar contrast to the wrestling-heavy style and durability that defined my career.",
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
    "subjectId": "ufc:jorge-masvidal",
    "name": "Jorge Masvidal",
    "earlyRotation": "normal",
    "sources": {
      "ledger": "https://ufcstats.com/statistics/fighters",
      "profile": "https://www.ufc.com/athlete/jorge-masvidal",
      "identity1": "https://www.ufc.com/news/jorge-masvidal-gamebred-journey-his-miami-homecoming-ufc-287",
      "identity2": "https://www.espn.com/mma/story/_/id/27931280/from-miami-brawler-ufc-star-jorge-masvidal-always-bmf",
      "identity3": "https://www.ufc.com/news/masvidal-de-la-calle-la-jaula",
      "identity4": "https://www.espn.com/mma/story/_/id/27931280/from-miami-brawler-ufc-star-jorge-masvidal-always-bmf",
      "identity5": "https://www.ufc.com/news/jorge-masvidal-exclamation-point"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "ufc-jorge-masvidal-a-1",
            "text": "My professional career took me through several countries and promotions long before I became a UFC headliner.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-a-2",
            "text": "One of the first people to take my fighting ambition seriously was my father.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity4"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-a-3",
            "text": "I had already been a professional mixed martial artist for about a decade before my UFC debut.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-a-4",
            "text": "My UFC career included long stretches at both lightweight and welterweight before a late-career surge.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-a-5",
            "text": "I knocked out Darren Till in London to start a breakthrough 2019 run.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-a-6",
            "text": "My next fight ended with a flying knee against Ben Askren after only five seconds.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-a-7",
            "text": "I finished that year by beating Nate Diaz in the first fight for the BMF championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-a-8",
            "text": "In 2020, I accepted a welterweight title fight with Kamaru Usman on short notice.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-a-9",
            "text": "I challenged Usman again the following year and was knocked out in the rematch.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-a-10",
            "text": "My brother suggested the nickname “Gamebred,” a term I associated with a pit bull bred for fighting.",
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
            "id": "ufc-jorge-masvidal-b-1",
            "text": "I began fighting professionally in the early 2000s and built an unusually long résumé before UFC title opportunities arrived.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-b-2",
            "text": "My pre-UFC career included fights in the United States, Costa Rica and Japan.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "identity5"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-b-3",
            "text": "I joined the UFC in 2013 after competing in several major organizations.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-b-4",
            "text": "For years inside the UFC, I was known as an experienced contender rather than a championship headliner.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-b-5",
            "text": "Before formal MMA fame, filmed backyard fights connected me to the same South Florida scene that made Kimbo Slice famous.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "identity2"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-b-6",
            "text": "A 2019 knockout of Darren Till was followed by the fastest knockout in UFC history against Ben Askren.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-b-7",
            "text": "I closed that three-fight surge by defeating Nate Diaz for the BMF title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-b-8",
            "text": "That run led to two welterweight championship fights with Kamaru Usman.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ledger",
              "profile"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-b-9",
            "text": "My career identity remained closely tied to Miami and the Cuban-American community where I grew up.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity1"
            ]
          },
          {
            "id": "ufc-jorge-masvidal-b-10",
            "text": "The nickname “Gamebred” became shorthand for the street-fighting image and mentality I carried into professional MMA.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "identity3"
            ]
          }
        ]
      }
    }
  }
];
