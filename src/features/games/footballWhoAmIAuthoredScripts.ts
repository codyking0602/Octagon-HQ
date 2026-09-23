import type { WhoAmIClueBand } from "./whoAmIEngine";

export type FootballWhoAmIAuthoredLeague = "NFL" | "CFB";
export type FootballWhoAmIAuthoredScriptId = "A" | "B" | "C";
export type FootballWhoAmIAuthoredStageFocus = "NFL-career-forward" | "CFB-career-forward";
export type FootballWhoAmIAuthoredEarlyRotation = "normal" | "deprioritized";

export interface FootballWhoAmIAuthoredClue {
  id: string;
  text: string;
  band: WhoAmIClueBand;
  verification: "verified";
  sourceIds: readonly string[];
}

export interface FootballWhoAmIAuthoredScript {
  id: FootballWhoAmIAuthoredScriptId;
  clues: readonly FootballWhoAmIAuthoredClue[];
}

export interface FootballWhoAmIAuthoredIdentity {
  league: FootballWhoAmIAuthoredLeague;
  subjectId: string;
  name: string;
  stageFocus: FootballWhoAmIAuthoredStageFocus;
  earlyRotation: FootballWhoAmIAuthoredEarlyRotation;
  /**
   * Product-owned evidence locators. Every authored clue carries sourceIds and
   * the QA gate requires those ids to resolve here.
   */
  sources: Readonly<Record<string, string>>;
  scripts: Readonly<Partial<Record<FootballWhoAmIAuthoredScriptId, FootballWhoAmIAuthoredScript>>>;
}

/**
 * Locked editorial contract:
 * - exactly two materially different scripts per identity
 * - exactly ten verified clues per script
 * - clues 1-4 create possibilities; 5-7 narrow; 8-10 identify
 * - NFL identities are career-forward (roughly 70-80% pro / 20-30% origin)
 * - CFB identities are college-career-forward
 * - school/team/number/signature-path combinations stay late
 * - coach ladders use team/program trajectory, role progression, signature decisions and championships
 * - alternate coach scripts should materially split the head-coaching arc from origin/coordinator history
 * - runtime never synthesizes or recomputes authored clue facts
 */
export const footballWhoAmIAuthoredIdentities: readonly FootballWhoAmIAuthoredIdentity[] = [
  {
    "league": "NFL",
    "subjectId": "nfl-patrick-mahomes",
    "name": "Patrick Mahomes",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "deprioritized",
    "sources": {
      "tt": "https://texastech.com/sports/football/roster/patrick-mahomes-ii/1020",
      "chiefs": "https://www.chiefs.com/news/chiefs-rookie-qb-patrick-mahomes-talks-playbook-opportunity-and-more-18831312",
      "nfl": "https://www.nfl.com/players/patrick-mahomes/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-patrick-mahomes-a-1",
            "text": "I was a three-sport athlete in high school, competing in football, baseball and basketball.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-a-2",
            "text": "I continued playing both football and baseball when I got to college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-a-3",
            "text": "I eventually gave up baseball to focus completely on quarterback.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-a-4",
            "text": "In my final college season, I led the FBS in both passing yards and total offense.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-a-5",
            "text": "I won the Sammy Baugh Award as the nation's top collegiate passer.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-a-6",
            "text": "In one game against Oklahoma, I threw for 734 yards and produced 819 yards of total offense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-a-7",
            "text": "My NFL team traded up 17 spots to select me 10th overall in the draft.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-a-8",
            "text": "I wear No. 15 because it was my basketball number in high school.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-a-9",
            "text": "In my first full NFL season as a starter, I threw for 5,097 yards and 50 touchdowns and won league MVP.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-a-10",
            "text": "I became a multiple-time league MVP and a three-time Super Bowl MVP while wearing No. 15.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-patrick-mahomes-b-1",
            "text": "I grew up in East Texas and helped my high school win its first district football title.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-b-2",
            "text": "As a high-school senior, I threw 50 touchdown passes while also rushing for 15 scores.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-b-3",
            "text": "My father spent 11 seasons as a Major League Baseball pitcher.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-b-4",
            "text": "Baseball was serious enough for me that I appeared on my college's baseball roster in addition to playing quarterback.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-b-5",
            "text": "I wore No. 5 in college, not the number most fans associate with me professionally.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-b-6",
            "text": "I finished my college career with 11,252 passing yards and 93 passing touchdowns despite leaving before my senior season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-b-7",
            "text": "My final college season included 5,052 passing yards in 12 games.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-b-8",
            "text": "The team that drafted me sent Buffalo its current first-round pick, a third-rounder and its following year's first-round pick to move up for me.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-b-9",
            "text": "I became the youngest player ever to win both an NFL MVP and a Super Bowl championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          },
          {
            "id": "nfl-patrick-mahomes-b-10",
            "text": "My professional identity became tied to No. 15 and multiple Super Bowl MVP awards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tt",
              "chiefs",
              "nfl"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-josh-allen",
    "name": "Josh Allen",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "deprioritized",
    "sources": {
      "bills": "https://www.buffalobills.com/team/players-roster/josh-allen/career",
      "awards": "https://www.buffalobills.com/news/these-bills-earned-honors-and-awards-in-the-2024-nfl-season",
      "draft": "https://www.buffalobills.com/news/bills-trade-up-to-draft-qb-josh-allen-at-no-7-20605411"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-josh-allen-a-1",
            "text": "I was a top-10 draft pick who became known for contributing heavily as both a passer and runner.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-a-2",
            "text": "As a rookie, I rushed for 631 yards and eight touchdowns despite starting only 11 games.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-a-3",
            "text": "By my third NFL season, I had jumped to more than 4,500 passing yards and 35 passing touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-a-4",
            "text": "I eventually produced multiple seasons with at least 4,000 passing yards and 35 passing touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-a-5",
            "text": "I became one of only two players in NFL history to record 40 or more offensive touchdowns in five different seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-a-6",
            "text": "In one season, I scored 15 rushing touchdowns from the quarterback position.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-a-7",
            "text": "I later became the first quarterback in the Super Bowl era to record a passing, rushing and receiving touchdown in the same game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-a-8",
            "text": "I won an NFL MVP award in a season in which I was voted second-team All-Pro at quarterback.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-a-9",
            "text": "That MVP came while I was leading Buffalo to its fifth consecutive division title.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-a-10",
            "text": "I am the No. 17 quarterback who became the first Bills quarterback to win the AP NFL MVP.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-josh-allen-b-1",
            "text": "I finished high school without a Division I scholarship offer and began college at the junior-college level.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-b-2",
            "text": "After growing several inches, I eventually received an FBS opportunity and developed into an NFL first-round prospect.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-b-3",
            "text": "My NFL team traded up five spots to select me seventh overall.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-b-4",
            "text": "As a rookie, my rushing production immediately became an important part of my game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-b-5",
            "text": "In my third NFL season, I helped my franchise win its first division title in 25 years.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-b-6",
            "text": "I followed that breakthrough by becoming a perennial 4,000-total-yard and 40-total-touchdown threat.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-b-7",
            "text": "My style produced an unusual quarterback game with touchdowns passing, rushing and receiving.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-b-8",
            "text": "I eventually became the first player in NFL history with five consecutive seasons of 40 or more total touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-b-9",
            "text": "My college was Wyoming, and professionally I became the face of the offense in Buffalo.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          },
          {
            "id": "nfl-josh-allen-b-10",
            "text": "Wearing No. 17, I became the first Bills quarterback ever to win the AP NFL MVP.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bills",
              "awards",
              "draft"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-lamar-jackson",
    "name": "Lamar Jackson",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "deprioritized",
    "sources": {
      "nfl": "https://www.nfl.com/news/ravens-qb-lamar-jackson-named-2019-nfl-mvp-0ap3000001100156",
      "ravens": "https://www.baltimoreravens.com/team/players-roster/lamar-jackson/",
      "louisville": "https://gocards.com/sports/football/roster/lamar-jackson/6874"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-lamar-jackson-a-1",
            "text": "I was a first-round quarterback who did not immediately begin my rookie season as the starter.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-a-2",
            "text": "Once I took over, my team won six of my seven regular-season starts and reached the playoffs.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-a-3",
            "text": "In my first full season as a starter, I led the NFL with 36 touchdown passes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-a-4",
            "text": "That same year, I also rushed for more than 1,200 yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-a-5",
            "text": "Those rushing yards set a new NFL single-season record for a quarterback.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-a-6",
            "text": "I became only the second unanimous MVP in NFL history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-a-7",
            "text": "Several years later, I won the league MVP award again.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-a-8",
            "text": "The season after that second MVP, I threw for a career-high 4,172 yards and 41 touchdowns with only four interceptions and was named first-team All-Pro.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-a-9",
            "text": "I have spent my entire NFL career with Baltimore.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-a-10",
            "text": "I am the No. 8 Ravens quarterback who won NFL MVP in both 2019 and 2023.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-lamar-jackson-b-1",
            "text": "I was a dual-threat quarterback from South Florida who entered the NFL after winning the Heisman Trophy.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-b-2",
            "text": "I was the fifth quarterback selected in my draft class.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-b-3",
            "text": "I was taken with the final pick of the first round.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-b-4",
            "text": "After taking over the starting job during my rookie year, I helped turn a struggling team into a division champion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-b-5",
            "text": "In my second NFL season, I led the league in touchdown passes despite also being one of the league's most dangerous runners.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-b-6",
            "text": "I became the first quarterback in NFL history to rush for more than 1,000 yards in multiple seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-b-7",
            "text": "My first MVP season was unanimous, something only one NFL player had done before me.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-b-8",
            "text": "I later became a multiple-time MVP and a three-time first-team AP All-Pro quarterback.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-b-9",
            "text": "Before the NFL I played at Louisville; professionally, I have played only for Baltimore.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          },
          {
            "id": "nfl-lamar-jackson-b-10",
            "text": "I wear No. 8 for the Ravens and own the NFL single-season quarterback rushing record.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nfl",
              "ravens",
              "louisville"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "joe-burrow",
    "name": "Joe Burrow",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "deprioritized",
    "sources": {
      "lsu": "https://lsusports.net/sports/fb/roster/player/joe-burrow/",
      "bengals": "https://www.bengals.com/team/players-roster/joe-burrow/",
      "heisman": "https://www.heisman.com/heisman-winners/joe-burrow/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-joe-burrow-a-1",
            "text": "I was an all-state point guard in high school and had opportunities to play college basketball.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-a-2",
            "text": "I was named my state's Mr. Football after throwing 63 touchdown passes as a high-school senior.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-a-3",
            "text": "I began my college career at a powerhouse program but never started a game there.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-a-4",
            "text": "I spent two seasons backing up J.T. Barrett before leaving as a graduate transfer.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-a-5",
            "text": "In my first season at my new school, I became the first quarterback in program history to beat four Top-10 opponents in one season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-a-6",
            "text": "The following year, my team went 15-0.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-a-7",
            "text": "During that championship season, I threw for 5,671 yards and an FBS-record 60 touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-a-8",
            "text": "I won the Heisman Trophy by what was then the largest voting margin in the award's history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-a-9",
            "text": "In the national semifinal, I threw seven touchdown passes and 493 yards against Oklahoma.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-a-10",
            "text": "After completing one of college football's greatest seasons, I was selected No. 1 overall in the 2020 NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-joe-burrow-b-1",
            "text": "My father and both of my older brothers played college football at Nebraska.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-b-2",
            "text": "I graduated from my first university with a degree in consumer and family financial services.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-b-3",
            "text": "Before becoming a superstar quarterback, I completed an offseason internship with Goldman Sachs.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-b-4",
            "text": "I appeared in only 10 games at my first college before transferring.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-b-5",
            "text": "In my first year as a starter at my second school, I passed for 2,894 yards and 16 touchdowns and added seven rushing scores.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-b-6",
            "text": "In the bowl game ending that season, I threw for 394 yards and four touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-b-7",
            "text": "My final college season produced 6,039 yards of total offense and 65 total touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-b-8",
            "text": "I became only the second Heisman winner in LSU history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-b-9",
            "text": "I was selected first overall, then returned from a major rookie knee injury to win NFL Comeback Player of the Year.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          },
          {
            "id": "nfl-joe-burrow-b-10",
            "text": "I followed that comeback by leading Cincinnati to the Super Bowl.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "bengals",
              "heisman"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-tim-tebow",
    "name": "Tim Tebow",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "deprioritized",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/tim-tebow/",
      "florida": "https://floridagators.com/sports/football/roster/tim-tebow/1528"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-tim-tebow-a-1",
            "text": "I was born outside the United States.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-a-2",
            "text": "I was the youngest of five children and spent part of my early football career playing tight end.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-a-3",
            "text": "By the end of high school, I had become a nationally recruited dual-threat quarterback and a state champion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-a-4",
            "text": "Over my college career, my teams went 48-7.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-a-5",
            "text": "I eventually finished college with 88 passing touchdowns and 55 rushing touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-a-6",
            "text": "I was named my conference's Offensive Player of the Year three different times.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-a-7",
            "text": "I became the first sophomore ever to win the Heisman Trophy.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-a-8",
            "text": "During that Heisman season, I accounted for 51 touchdowns during the regular season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-a-9",
            "text": "My college career included victories in two national championship games for Florida.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-a-10",
            "text": "I wore No. 15 for the Gators and left as one of the most decorated quarterbacks in college football history.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-tim-tebow-b-1",
            "text": "My path to quarterback wasn't completely conventional because I played tight end before becoming a nationally known high-school passer.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-b-2",
            "text": "I was named my state's Mr. Football after leading my high school to a state championship.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-b-3",
            "text": "Across four college seasons, I was part of a class that won 48 of 55 games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-b-4",
            "text": "I finished my career having set 28 school records and 14 conference records.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-b-5",
            "text": "My final college totals included more than 9,000 passing yards and almost 3,000 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-b-6",
            "text": "I made Heisman history by winning the award earlier in my college career than any sophomore before me.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-b-7",
            "text": "The following season, I helped defeat No. 1 Alabama to win the SEC Championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-b-8",
            "text": "I then helped defeat No. 1 Oklahoma for a national championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-b-9",
            "text": "After college, I became a first-round NFL draft pick, selected 25th overall.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          },
          {
            "id": "cfb-tim-tebow-b-10",
            "text": "I was Florida's No. 15, a Heisman winner and a member of two national championship teams.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "florida"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-cam-newton",
    "name": "Cam Newton",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "deprioritized",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/cam-newton/",
      "auburn": "https://auburntigers.com/sports/football/roster/cam-newton/653",
      "panthers": "https://www.panthers.com/team/players-roster/cam-newton/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-cam-newton-a-1",
            "text": "I was a highly recruited quarterback from the Atlanta area.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-a-2",
            "text": "My college career was unusually winding: I attended more than one school before becoming a national star.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-a-3",
            "text": "I eventually produced one of the most dominant single seasons ever by a dual-threat quarterback.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-a-4",
            "text": "In that season, I accounted for 51 touchdowns passing, rushing and receiving.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-a-5",
            "text": "I became the first player in SEC history to throw for more than 2,000 yards and rush for more than 1,000 in the same season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-a-6",
            "text": "I won the Heisman Trophy along with the Maxwell, Walter Camp and Davey O'Brien awards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-a-7",
            "text": "My team went 14-0 and won its first national championship since 1957.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-a-8",
            "text": "Only then does my unusual path become clear: I started at Florida, spent a year in junior college, and finished at Auburn.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-a-9",
            "text": "After that lone season as Auburn's starting quarterback, I was selected No. 1 overall in the NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-a-10",
            "text": "I later won NFL MVP after accounting for 45 touchdowns for a 15-1 Carolina team.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-cam-newton-b-1",
            "text": "I began college as a highly rated quarterback but didn't finish my career at the school where I originally signed.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-b-2",
            "text": "An ankle injury contributed to me redshirting during my second season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-b-3",
            "text": "After leaving my first school, I spent a season playing outside the FBS.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-b-4",
            "text": "At that stop, I led my team to a junior-college national championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-b-5",
            "text": "I then transferred again, making me a double-transfer before my breakthrough season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-b-6",
            "text": "In my only season at my final school, I threw for 2,854 yards and 30 touchdowns and rushed for 1,473 yards and 20 touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-b-7",
            "text": "That final school was Auburn, where I became the program's third Heisman Trophy winner.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-b-8",
            "text": "I completed that season 14-0 with an SEC title and a BCS national championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-b-9",
            "text": "Carolina made me the first overall selection in the following NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          },
          {
            "id": "cfb-cam-newton-b-10",
            "text": "Five seasons later, I won NFL MVP after throwing 35 touchdown passes and rushing for 10 more.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn",
              "panthers"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "derrick-henry",
    "name": "Derrick Henry",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "deprioritized",
    "sources": {
      "titans": "https://www.tennesseetitans.com/news/free-agency/henry-derrick",
      "heisman": "https://www.heisman.com/heisman-winners/derrick-henry/",
      "ravens": "https://www.baltimoreravens.com/team/players-roster/derrick-henry/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-derrick-henry-a-1",
            "text": "I was a second-round running back who spent the beginning of my professional career sharing the backfield with an established veteran.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-a-2",
            "text": "I didn't reach 1,000 rushing yards until my third NFL season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-a-3",
            "text": "That season included a 99-yard touchdown run, and I finished with 1,059 rushing yards and 12 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-a-4",
            "text": "The following year, I led the NFL with 1,540 rushing yards and 16 rushing touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-a-5",
            "text": "I came back the next season and won the rushing title again.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-a-6",
            "text": "That time, I ran for 2,027 yards and 17 touchdowns and was named AP NFL Offensive Player of the Year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-a-7",
            "text": "I became only the eighth player in NFL history to rush for 2,000 yards in a season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-a-8",
            "text": "After spending my first eight NFL seasons with one franchise, I changed teams for the first time.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-a-9",
            "text": "In my first season with Baltimore, I rushed for 1,921 yards and 16 touchdowns.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-a-10",
            "text": "Before becoming known as No. 22, I was the 45th overall pick who developed into one of the defining power backs of his generation.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-derrick-henry-b-1",
            "text": "Long before the NFL, I broke a decades-old national high-school rushing record.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-b-2",
            "text": "I finished my high-school career with 12,124 rushing yards, including 4,261 as a senior.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-b-3",
            "text": "My final college season ended with a national championship after I rushed for 2,219 yards and 28 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-b-4",
            "text": "I also won the Heisman Trophy that season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-b-5",
            "text": "Despite that resume, I wasn't selected until the second round of the NFL Draft.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-b-6",
            "text": "My professional breakout included one of the very few 99-yard rushing touchdowns in league history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-b-7",
            "text": "I then became the NFL's rushing champion in consecutive seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-b-8",
            "text": "The second of those seasons ended with 2,027 rushing yards and Offensive Player of the Year honors.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-b-9",
            "text": "I spent the first eight years of my NFL career with Tennessee before later joining Baltimore.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          },
          {
            "id": "nfl-derrick-henry-b-10",
            "text": "I'm the Heisman-winning running back nicknamed King Henry who has worn No. 22 throughout my NFL career.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "titans",
              "heisman",
              "ravens"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "justin-jefferson",
    "name": "Justin Jefferson",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "deprioritized",
    "sources": {
      "vikings": "https://www.vikings.com/news/longform/justin-jefferson-2020-nfl-rookie-the-rise",
      "rookie": "https://www.vikings.com/news/justin-jefferson-rookie-of-the-year-finalist-2020",
      "player": "https://www.vikings.com/team/players-roster/justin-jefferson/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-justin-jefferson-a-1",
            "text": "I was a first-round receiver, but four other wide receivers were drafted before me.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-a-2",
            "text": "As a rookie, I immediately broke a Super Bowl-era receiving record.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-a-3",
            "text": "I finished that rookie season with 88 catches for 1,400 yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-a-4",
            "text": "Through my first three NFL seasons, I accumulated 4,248 receiving yards, the most ever by a player over his first three seasons at the time.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-a-5",
            "text": "In my third season, I led the NFL in both receptions and receiving yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-a-6",
            "text": "That year I caught 128 passes for 1,809 yards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-a-7",
            "text": "I was named AP Offensive Player of the Year for that season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-a-8",
            "text": "One of my most famous plays was a contested, one-handed catch on fourth-and-18 that helped keep an overtime comeback alive.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-a-9",
            "text": "The equipment from that catch was sent to the Pro Football Hall of Fame.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-a-10",
            "text": "I am Minnesota's No. 18 receiver who turned the 22nd overall pick into one of the most productive starts ever by an NFL wideout.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-justin-jefferson-b-1",
            "text": "I entered the NFL as a first-round pick but wasn't even the first receiver selected from my draft class.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-b-2",
            "text": "I was chosen 22nd overall, one pick after another wide receiver.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-b-3",
            "text": "I became the only offensive rookie from that season selected to the Pro Bowl.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-b-4",
            "text": "My rookie total of 1,400 receiving yards surpassed both Randy Moss' franchise rookie record and Anquan Boldin's Super Bowl-era NFL rookie record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-b-5",
            "text": "I followed that with 1,616 receiving yards and 10 touchdowns in my second season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-b-6",
            "text": "In Year 3, I jumped again to 1,809 yards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-b-7",
            "text": "That season included a fourth-and-18 catch against Buffalo that became one of the signature receptions of the decade.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-b-8",
            "text": "I finished that year as a first-team All-Pro and the NFL Offensive Player of the Year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-b-9",
            "text": "Before the NFL, I helped LSU win a national championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          },
          {
            "id": "nfl-justin-jefferson-b-10",
            "text": "Professionally, I became the No. 18 centerpiece of Minnesota's passing game.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "rookie",
              "player"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "myles-garrett",
    "name": "Myles Garrett",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "deprioritized",
    "sources": {
      "browns": "https://www.clevelandbrowns.com/news/3-big-takeaways-myles-garrett-makes-presence-felt-on-very-1st-snap-19531083",
      "player": "https://www.clevelandbrowns.com/team/players-roster/myles-garrett/",
      "tamu": "https://12thman.com/sports/football/roster/myles-garrett/3702"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-myles-garrett-a-1",
            "text": "My very first NFL snap ended with me sacking the opposing quarterback.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-a-2",
            "text": "I finished my debut with two sacks, becoming the first No. 1 overall pick to record multiple sacks in his first NFL game.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-a-3",
            "text": "I eventually developed one of the league's longest streaks of consecutive double-digit-sack seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-a-4",
            "text": "In one game, I recorded 4.5 sacks, setting a franchise single-game record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-a-5",
            "text": "I posted 16 sacks in back-to-back seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-a-6",
            "text": "By my sixth NFL season, I had already become my franchise's all-time leader in sacks.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-a-7",
            "text": "I later became the first player in NFL history to post at least 14 sacks in four consecutive seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-a-8",
            "text": "I won my first AP Defensive Player of the Year award after the 2023 season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-a-9",
            "text": "Two seasons later, I broke the NFL single-season record with 23 sacks and won Defensive Player of the Year again.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-a-10",
            "text": "I was the first overall pick out of Texas A&M who became Cleveland's all-time sack leader before winning multiple DPOY awards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-myles-garrett-b-1",
            "text": "In three college seasons, I recorded 32.5 sacks.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-b-2",
            "text": "I produced at least eight sacks and 14 tackles for loss in every one of those seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-b-3",
            "text": "I earned first-team All-America honors twice before entering the NFL Draft.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-b-4",
            "text": "My NFL career began dramatically: I recorded a sack on my very first professional snap.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-b-5",
            "text": "I eventually set both single-game and single-season sack records for the franchise that drafted me.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-b-6",
            "text": "I broke that franchise's career sack record during only my sixth NFL season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-b-7",
            "text": "In 2023, I won AP Defensive Player of the Year for the first time.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-b-8",
            "text": "In 2025, I recorded 23 sacks, breaking the league's single-season record.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-b-9",
            "text": "That historic season made me a two-time AP Defensive Player of the Year.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          },
          {
            "id": "nfl-myles-garrett-b-10",
            "text": "My college was Texas A&M, and Cleveland made me the No. 1 overall pick in the 2017 NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "browns",
              "player",
              "tamu"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-trevor-lawrence",
    "name": "Trevor Lawrence",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "deprioritized",
    "sources": {
      "clemson": "https://clemsontigers.com/sports/football/roster/player/trevor-lawrence/",
      "heisman": "https://www.heisman.com/records-statistics/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-trevor-lawrence-a-1",
            "text": "I finished my college career with a 34-2 record as a starting quarterback.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-a-2",
            "text": "I never lost a regular-season game as a starter in either high school or college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-a-3",
            "text": "My college career included more than 10,000 passing yards and 90 passing touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-a-4",
            "text": "I also scored 18 rushing touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-a-5",
            "text": "I started five College Football Playoff games, at the time tying the record for the most by a quarterback.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-a-6",
            "text": "I became the first quarterback ever to win three ACC Championship Games.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-a-7",
            "text": "I finished second in Heisman Trophy voting during my final college season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-a-8",
            "text": "My first season as a starter ended with me becoming the first true-freshman quarterback since 1985 to lead his team to a national championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-a-9",
            "text": "That championship team finished 15-0, the first major-college team of the modern era to do so.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-a-10",
            "text": "I was Clemson's No. 16 quarterback, and I left school having won 34 of my 36 starts.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-trevor-lawrence-b-1",
            "text": "Across high school and college, I went my entire career without losing a regular-season start.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-b-2",
            "text": "In college, I started 36 games and won 34 of them.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-b-3",
            "text": "I finished with 108 touchdowns responsible for: 90 through the air and 18 on the ground.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-b-4",
            "text": "My career passer-efficiency rating broke an existing ACC record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-b-5",
            "text": "I won nine games against ranked opponents, tying a school record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-b-6",
            "text": "I became the only quarterback at the time to win three ACC Championship Games.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-b-7",
            "text": "During my first college season, my team became the first major program of the modern era to finish 15-0.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-b-8",
            "text": "I did that while becoming the first true freshman quarterback in more than three decades to lead a team to the national title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-b-9",
            "text": "I later became a Heisman runner-up while playing for Clemson.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          },
          {
            "id": "cfb-trevor-lawrence-b-10",
            "text": "I wore No. 16 and finished my career with 10,098 passing yards, 90 touchdown passes and a 34-2 starting record.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "clemson",
              "heisman"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-jalen-hurts",
    "name": "Jalen Hurts",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "deprioritized",
    "sources": {
      "bama": "https://rolltide.com/sports/football/roster/jalen-hurts/4638",
      "ou": "https://soonersports.com/sports/football/roster/jalen-hurts/3532",
      "heisman": "https://www.heisman.com/records-statistics/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-jalen-hurts-a-1",
            "text": "I appeared in 56 college games and started 42 of them.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-a-2",
            "text": "Across my college career, I threw for 9,477 yards and rushed for another 3,274.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-a-3",
            "text": "During my first season as a starter, I accounted for 36 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-a-4",
            "text": "I was named my conference's Offensive Player of the Year during that freshman season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-a-5",
            "text": "After two years as a starter, I spent the next season without making a start.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-a-6",
            "text": "I transferred for my final college season and immediately produced the best statistical year of my career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-a-7",
            "text": "That season I threw for 3,851 yards and 32 touchdowns, rushed for 1,298 yards and 20 scores, and even caught a touchdown.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-a-8",
            "text": "I finished second in the Heisman Trophy voting that year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-a-9",
            "text": "My college career took me from Alabama to Oklahoma.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-a-10",
            "text": "Wearing No. 1 for the Sooners, I ended my college career as a Heisman runner-up after accounting for 53 touchdowns in my final season.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-jalen-hurts-b-1",
            "text": "I was an unusually productive runner for a quarterback throughout my college career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-b-2",
            "text": "As a freshman, I rushed for 954 yards, setting a school single-season record for a quarterback.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-b-3",
            "text": "That season I also threw for 2,780 yards and became responsible for a school-record 36 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-b-4",
            "text": "The following season, I threw 17 touchdown passes against only one interception while adding 855 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-b-5",
            "text": "My third college season was dramatically different: I did not start a game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-b-6",
            "text": "I then transferred and became the Offensive Newcomer of the Year in a different conference.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-b-7",
            "text": "In my only season at that school, I accounted for 53 touchdowns and led the nation in yards per pass attempt.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-b-8",
            "text": "I finished second to Joe Burrow in the 2019 Heisman Trophy race.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-b-9",
            "text": "That final season came at Oklahoma after three years at Alabama.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-jalen-hurts-b-10",
            "text": "I wore No. 1 for Oklahoma, where I threw for 3,851 yards and rushed for 1,298 in my lone season as a Sooner.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "ou",
              "heisman"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "tom-brady",
    "name": "Tom Brady",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "patriots": "https://www.patriots.com/news/tom-brady-bio",
      "nfl": "https://www.nfl.com/news/tom-brady-retirement-23-seasons-in-nfl-buccaneers-patriots",
      "bucs": "https://www.buccaneers.com/news/tom-brady-named-super-bowl-lv-mvp-sblv-55-buccaneers"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-tom-brady-a-1",
            "text": "I entered the NFL as a late-round quarterback and barely played during my rookie season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-a-2",
            "text": "I became my team's full-time starter during my second professional season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-a-3",
            "text": "That season ended with me winning a championship and being named the game's MVP.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-a-4",
            "text": "Within my first four seasons as a starter, I had already won three championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-a-5",
            "text": "In 2007, I threw 50 touchdown passes while leading an undefeated regular season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-a-6",
            "text": "I later became the first unanimous AP NFL MVP.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-a-7",
            "text": "I won another league MVP at age 40, becoming the oldest player to win the award at the time.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-a-8",
            "text": "After two decades with one franchise, I changed teams and won another championship in my first season there.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-a-9",
            "text": "I finished my career with seven Super Bowl titles and five Super Bowl MVP awards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-a-10",
            "text": "I was the 199th pick of the 2000 draft who became identified with No. 12 in New England and Tampa Bay.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-tom-brady-b-1",
            "text": "I was selected in the sixth round of the NFL Draft after a college career in which I had to fight for the starting job.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-b-2",
            "text": "My draft slot was 199th overall.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-b-3",
            "text": "I took over for an injured veteran early in my second NFL season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-b-4",
            "text": "My first season as the primary starter ended with a Super Bowl victory.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-b-5",
            "text": "I eventually became a three-time AP NFL MVP.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-b-6",
            "text": "I led the NFL in touchdown passes in a season when I threw 50 of them.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-b-7",
            "text": "I reached 10 Super Bowls across my professional career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-b-8",
            "text": "I won six championships with my first franchise before leaving in free agency.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-b-9",
            "text": "At age 43, I won a seventh championship and a fifth Super Bowl MVP with a different team.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          },
          {
            "id": "nfl-tom-brady-b-10",
            "text": "I retired as the NFL's career leader in passing yards, passing touchdowns and quarterback wins.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "nfl",
              "bucs"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-aaron-rodgers",
    "name": "Aaron Rodgers",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "cal": "https://calbears.com/sports/2005/4/23/207736054",
      "packers": "https://www.packers.com/history/",
      "sb": "https://www.packers.com/news/packers-win-super-bowl-xlv-31-25-3338261"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-aaron-rodgers-a-1",
            "text": "I was a first-round quarterback who spent several seasons waiting behind an established future Hall of Famer.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-a-2",
            "text": "I did not become my team's primary starter until my fourth NFL season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-a-3",
            "text": "By my third year as a starter, I had led my team to a championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-a-4",
            "text": "In that title game, I threw for 304 yards and three touchdowns and was named MVP.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-a-5",
            "text": "I later produced a season with 45 touchdown passes and only six interceptions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-a-6",
            "text": "I won league MVP four times.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-a-7",
            "text": "Two of those MVP awards came in consecutive seasons late in my career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-a-8",
            "text": "In one MVP season, I threw a career-high 48 touchdown passes against only five interceptions.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-a-9",
            "text": "I spent the vast majority of my career in Green Bay before eventually changing teams.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-a-10",
            "text": "I was the No. 24 overall pick who became the longtime No. 12 quarterback of the Packers.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-aaron-rodgers-b-1",
            "text": "My path to major-college football included a season at a junior college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-b-2",
            "text": "I then played two seasons at California before entering the NFL Draft.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-b-3",
            "text": "I was the second quarterback selected in my draft class, but I lasted until the 24th overall pick.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-b-4",
            "text": "The team that drafted me already had Brett Favre as its established starter.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-b-5",
            "text": "When I finally became the starter, I quickly developed into one of the league's most efficient passers.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-b-6",
            "text": "I won Super Bowl MVP after throwing three touchdown passes without an interception.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-b-7",
            "text": "I became one of the few players in league history to win four AP NFL MVP awards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-b-8",
            "text": "I later won back-to-back MVPs in 2020 and 2021.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-b-9",
            "text": "My first NFL franchise was Green Bay, where I spent well over a decade as the starter.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          },
          {
            "id": "nfl-aaron-rodgers-b-10",
            "text": "My college jersey was No. 8, but my professional identity became tied to No. 12.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cal",
              "packers",
              "sb"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "adrian-peterson",
    "name": "Adrian Peterson",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "vikings": "https://www.vikings.com/history/franchise-timeline",
      "nfl": "https://www.nfl.com/players/adrian-peterson/stats/",
      "ou": "https://soonersports.com/news/2005/1/15/208368286"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-adrian-peterson-a-1",
            "text": "I was a top-10 draft pick who topped 1,300 rushing yards as a rookie.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-a-2",
            "text": "In only my fifth NFL game, I set a franchise single-game rushing record with 224 yards.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-a-3",
            "text": "Three weeks later, I broke the NFL single-game rushing record with 296 yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-a-4",
            "text": "I won Offensive Rookie of the Year and made the Pro Bowl in my first season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-a-5",
            "text": "I later led the NFL in rushing with 1,760 yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-a-6",
            "text": "Late in another season, I suffered a major knee injury that put the start of the following year in doubt.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-a-7",
            "text": "I responded by rushing for 2,097 yards the next season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-a-8",
            "text": "That total left me just nine yards short of the NFL single-season rushing record.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-a-9",
            "text": "I won both AP NFL MVP and Offensive Player of the Year for that comeback season.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-a-10",
            "text": "I became the defining No. 28 running back of the Minnesota Vikings.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-adrian-peterson-b-1",
            "text": "Before the NFL, I rushed for an NCAA freshman record 1,925 yards in my first college season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-b-2",
            "text": "That freshman season ended with me finishing second in Heisman Trophy voting.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-b-3",
            "text": "I was selected seventh overall in the NFL Draft.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-b-4",
            "text": "As a rookie, I set the league's single-game rushing record with 296 yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-b-5",
            "text": "I eventually won multiple NFL rushing titles.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-b-6",
            "text": "One of those titles came after I returned from a torn ACL and MCL suffered late the previous season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-b-7",
            "text": "My comeback year produced 2,097 rushing yards on 348 carries.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-b-8",
            "text": "That performance made me a rare running back to win the AP NFL MVP award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-b-9",
            "text": "I spent the prime of my career with Minnesota before playing for several other teams late in my career.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          },
          {
            "id": "nfl-adrian-peterson-b-10",
            "text": "I finished with 14,918 career rushing yards and 120 rushing touchdowns.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vikings",
              "nfl",
              "ou"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-calvin-johnson",
    "name": "Calvin Johnson",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "gt": "https://ramblinwreck.com/news/2018/01/08/calvin-johnson-selected-for-induction-to-college-football-hall-of-fame",
      "hof": "https://www.profootballhof.com/news/the-mission-road-to-canton-feat-calvin-johnson",
      "draft": "https://ramblinwreck.com/news/2007/04/28/johnson-goes-to-detroit-with-no-2-pick"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-calvin-johnson-a-1",
            "text": "I was selected second overall in the NFL Draft and spent my entire professional career with one franchise.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-a-2",
            "text": "I reached 1,300 receiving yards by my second NFL season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-a-3",
            "text": "I later led the league in receiving yards in back-to-back seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-a-4",
            "text": "One of those seasons ended with more than 1,600 yards and 16 receiving touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-a-5",
            "text": "The following year, I broke the NFL single-season receiving-yardage record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-a-6",
            "text": "That record season ended with 1,964 receiving yards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-a-7",
            "text": "I once produced a 329-yard receiving game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-a-8",
            "text": "I was a six-time Pro Bowler and a three-time first-team All-Pro.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-a-9",
            "text": "I retired after only nine NFL seasons and was later elected to the Pro Football Hall of Fame in my first year of eligibility.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-a-10",
            "text": "I was the Detroit Lions receiver known worldwide by the nickname Megatron.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-calvin-johnson-b-1",
            "text": "I was a two-time first-team All-American in college before becoming one of the highest-drafted receivers ever.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-b-2",
            "text": "My final college season included 1,202 receiving yards and 15 touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-b-3",
            "text": "Detroit selected me with the second overall pick.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-b-4",
            "text": "I developed into a player who combined unusual size with elite vertical speed.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-b-5",
            "text": "I eventually led the NFL in receiving yards twice.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-b-6",
            "text": "My best season produced 1,964 receiving yards, breaking the league record.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-b-7",
            "text": "I made six consecutive Pro Bowls near the end of my career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-b-8",
            "text": "I played all nine of my NFL seasons for the same franchise.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-b-9",
            "text": "My professional jersey number was 81.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-calvin-johnson-b-10",
            "text": "The nickname Megatron became inseparable from my identity as a Lions receiver.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "gt",
              "hof",
              "draft"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-troy-polamalu",
    "name": "Troy Polamalu",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "steelers": "https://www.steelers.com/history/bios/polamalu_troy_4hof",
      "hof": "https://www.profootballhof.com/players/troy-polamalu"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-troy-polamalu-a-1",
            "text": "I was a first-round defensive back who spent my entire 12-year NFL career with one franchise.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-a-2",
            "text": "I became a full-time starter in my second professional season and intercepted five passes.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-a-3",
            "text": "I eventually earned eight Pro Bowl selections.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-a-4",
            "text": "I was named first-team All-Pro four times.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-a-5",
            "text": "My career included 32 interceptions and 12 sacks.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-a-6",
            "text": "I won two Super Bowl championships.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-a-7",
            "text": "In an AFC Championship Game, I returned an interception 40 yards for a touchdown to help send my team to the Super Bowl.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-a-8",
            "text": "I won AP Defensive Player of the Year after a season with seven interceptions.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-a-9",
            "text": "I played all 158 of my NFL games for Pittsburgh.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-a-10",
            "text": "I was the No. 43 safety whose flowing hair and instinctive style became one of the defining images of the Steelers defense.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-troy-polamalu-b-1",
            "text": "I was selected 16th overall in the 2003 NFL Draft.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-b-2",
            "text": "My teammates gave me the nickname Tasmanian Devil because of my range and explosiveness.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-b-3",
            "text": "I became a defensive leader on a team that reached the playoffs seven times during my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-b-4",
            "text": "I started in four conference championship games and three Super Bowls.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-b-5",
            "text": "My teams won two of those Super Bowls.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-b-6",
            "text": "I finished my career with 32 interceptions, including three returned for touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-b-7",
            "text": "One of my signature plays was a late pick-six in the 2008 AFC Championship Game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-b-8",
            "text": "I won Defensive Player of the Year in 2010.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-b-9",
            "text": "I spent all 12 of my NFL seasons with Pittsburgh and later reached the Hall of Fame in my first year of eligibility.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          },
          {
            "id": "nfl-troy-polamalu-b-10",
            "text": "I wore No. 43 and became one of the most recognizable safeties of my era.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-reggie-bush",
    "name": "Reggie Bush",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "usc": "https://usctrojans.com/sports/2026/3/10/reggie-bush-usc-trojans-football-heisman-trophy-winner-2005",
      "profile": "https://usctrojans.com/sports/football/roster/bush-reggie/1799",
      "heisman": "https://www.heisman.com/heisman-winners/reggie-bush/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-reggie-bush-a-1",
            "text": "I was a Freshman All-American before becoming one of college football's most dangerous all-purpose players.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-a-2",
            "text": "As a sophomore, I earned consensus first-team All-America honors.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-a-3",
            "text": "That same season, I finished fifth in Heisman Trophy voting.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-a-4",
            "text": "My teammate won the Heisman that year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-a-5",
            "text": "The following season, I averaged nearly nine yards per rushing attempt.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-a-6",
            "text": "I produced more than 2,600 all-purpose yards during that season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-a-7",
            "text": "I also rushed for more than 1,600 yards while contributing as a receiver and returner.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-a-8",
            "text": "I won the Doak Walker Award and was named the Walter Camp and AP Player of the Year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-a-9",
            "text": "I won the 2005 Heisman Trophy, an award that was later vacated and ultimately reinstated.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-a-10",
            "text": "I was the No. 5 all-purpose star for USC during its mid-2000s run.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-reggie-bush-b-1",
            "text": "I arrived in college as one of the nation's highest-rated running back recruits.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-b-2",
            "text": "My freshman season included contributions as a runner, receiver and kick returner.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-b-3",
            "text": "By my second season, I was a consensus first-team All-American.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-b-4",
            "text": "I entered my final college year after already finishing in the top five of the Heisman vote.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-b-5",
            "text": "In one late-season game, I rushed for 294 yards while also adding receiving yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-b-6",
            "text": "My final college season included an extraordinary number of explosive plays of 20 yards or more.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-b-7",
            "text": "I won the award given to the nation's top running back.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-b-8",
            "text": "I also became USC's seventh Heisman Trophy winner.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-b-9",
            "text": "That Heisman came one year after teammate Matt Leinart won the award.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          },
          {
            "id": "cfb-reggie-bush-b-10",
            "text": "I wore No. 5 for USC and became one of the signature players of the Pete Carroll era.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc",
              "profile",
              "heisman"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-vince-young",
    "name": "Vince Young",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "texas": "https://texaslonghorns.com/sports/general/roster/vince-young/5058",
      "heisman": "https://www.heisman.com/heisman-winners/reggie-bush/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-vince-young-a-1",
            "text": "I was a dual-threat quarterback whose final college season included more than 3,000 passing yards and more than 1,000 rushing yards.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-a-2",
            "text": "I completed better than 65 percent of my passes during that season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-a-3",
            "text": "I was named my conference's Offensive Player of the Year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-a-4",
            "text": "I won the Maxwell, Davey O'Brien and Manning awards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-a-5",
            "text": "I finished second in Heisman Trophy voting.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-a-6",
            "text": "My team went undefeated and won its conference championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-a-7",
            "text": "I became the first player in school history to produce more than 4,000 yards of total offense in one season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-a-8",
            "text": "I was named Rose Bowl Offensive MVP for the second consecutive year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-a-9",
            "text": "In the national championship game, I passed for 267 yards and rushed for 200 more with three rushing touchdowns.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-a-10",
            "text": "I was the No. 10 Texas quarterback who ended USC's winning streak with a late fourth-down touchdown run.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-vince-young-b-1",
            "text": "I began my college career sharing quarterback duties before becoming the unquestioned starter.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-b-2",
            "text": "By my junior season, I had become one of the nation's most efficient passers while remaining an elite runner.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-b-3",
            "text": "In one game, I produced 506 yards of total offense, including 267 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-b-4",
            "text": "I led my team to a road victory that ended Ohio State's long home nonconference winning streak.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-b-5",
            "text": "I helped my school score 45 points in a rivalry win over Oklahoma.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-b-6",
            "text": "My final regular season ended with me as the Maxwell Award winner and Heisman runner-up.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-b-7",
            "text": "I entered the postseason with more than 4,000 yards of total offense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-b-8",
            "text": "I won a second straight Rose Bowl Offensive MVP award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-b-9",
            "text": "My final college game was a 41-38 national championship victory over USC.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          },
          {
            "id": "cfb-vince-young-b-10",
            "text": "I accounted for 467 yards in that title game while wearing No. 10 for Texas.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "texas",
              "heisman"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-johnny-manziel",
    "name": "Johnny Manziel",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "tamu": "https://12thman.com/sports/football/roster/season/2012/player/johnny-manziel",
      "heisman": "https://www.heisman.com/heisman-winners/johnny-manziel/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-johnny-manziel-a-1",
            "text": "I redshirted during my first college season before winning the starting quarterback job the next year.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-a-2",
            "text": "In my first year as a starter, I threw for more than 3,700 yards and rushed for more than 1,400.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-a-3",
            "text": "I accounted for 47 touchdowns that season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-a-4",
            "text": "I broke the conference record for total offense.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-a-5",
            "text": "I became the first player in NCAA history to surpass 5,000 total yards and 1,000 rushing yards in the same season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-a-6",
            "text": "I led my team to a road upset of the nation's No. 1-ranked team.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-a-7",
            "text": "I was named both conference Freshman of the Year and Offensive Player of the Year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-a-8",
            "text": "I became the first freshman ever to win the Heisman Trophy.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-a-9",
            "text": "I later produced 516 yards of total offense in a Cotton Bowl victory over Oklahoma.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-a-10",
            "text": "I was Texas A&M's No. 2 quarterback whose nickname became Johnny Football.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-johnny-manziel-b-1",
            "text": "I entered college after a high-school career in which I was productive as both a passer and runner.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-b-2",
            "text": "I originally committed to another major program before signing elsewhere.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-b-3",
            "text": "After redshirting, I won the starting job shortly before the beginning of my freshman season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-b-4",
            "text": "I broke my conference's single-game total-offense record twice in the same year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-b-5",
            "text": "That year included more than 20 rushing touchdowns from the quarterback position.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-b-6",
            "text": "A November road win over No. 1 Alabama became a defining moment of my season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-b-7",
            "text": "I won the Davey O'Brien and Manning awards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-b-8",
            "text": "I became the first freshman to win college football's most famous individual trophy.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-b-9",
            "text": "I returned the next year and threw for more than 4,100 yards and 37 touchdowns.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          },
          {
            "id": "cfb-johnny-manziel-b-10",
            "text": "My two seasons as Texas A&M's starter produced nearly 10,000 yards of total offense.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "heisman"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-derrick-henry",
    "name": "Derrick Henry",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "bama": "https://rolltide.com/sports/football/roster/derrick-henry/4710",
      "heisman": "https://www.heisman.com/heisman-winners/derrick-henry/",
      "notes": "https://rolltide.com/news/2016/1/12/Alabama_Football_vs_Clemson_Postgame_Notes"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-derrick-henry-a-1",
            "text": "I spent two college seasons in a supporting role before becoming the full-time starter.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-a-2",
            "text": "In the season before I became the starter, I still rushed for 990 yards and 11 touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-a-3",
            "text": "My first season as the featured back became one of the biggest workload seasons in conference history.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-a-4",
            "text": "I carried the ball 395 times.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-a-5",
            "text": "I rushed for more than 2,200 yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-a-6",
            "text": "I scored 28 rushing touchdowns, leading the nation.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-a-7",
            "text": "I broke conference single-season records in both rushing yards and rushing touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-a-8",
            "text": "I won the Maxwell, Doak Walker and Walter Camp awards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-a-9",
            "text": "I also won the Heisman Trophy and helped my team win the national championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-a-10",
            "text": "I was Alabama's No. 2 running back whose 2015 season broke Herschel Walker's SEC rushing record.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-derrick-henry-b-1",
            "text": "I arrived in college after setting a national high-school career rushing record.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-b-2",
            "text": "I averaged more than 10 yards per carry in limited action as a freshman.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-b-3",
            "text": "My production climbed to 990 rushing yards as a sophomore.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-b-4",
            "text": "As a junior, I recorded 10 games with at least 100 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-b-5",
            "text": "Four of those games went over 200 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-b-6",
            "text": "I set a school record with 11 consecutive games scoring a rushing touchdown.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-b-7",
            "text": "My final season included 2,219 rushing yards and 28 rushing touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-b-8",
            "text": "I was named MVP of my conference championship game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-b-9",
            "text": "I won the Heisman Trophy and then helped Alabama win the College Football Playoff national title.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          },
          {
            "id": "cfb-derrick-henry-b-10",
            "text": "I finished college with 2,891 rushing yards before becoming the 45th overall pick in the NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "heisman",
              "notes"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-travis-hunter",
    "name": "Travis Hunter",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/travis-hunter/",
      "colorado": "https://cubuffs.com/sports/football/roster/travis-hunter/16830"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-travis-hunter-a-1",
            "text": "I became a college star while playing significant snaps on both offense and defense.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-a-2",
            "text": "My college career began at the FCS level before I transferred to an FBS program.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-a-3",
            "text": "In my award-winning season, I recorded more than 90 receptions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-a-4",
            "text": "I also intercepted four passes on defense that same year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-a-5",
            "text": "I finished with 1,152 receiving yards and 14 receiving touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-a-6",
            "text": "Defensively, I added 31 tackles and 11 pass breakups.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-a-7",
            "text": "I was named first-team all-conference at both wide receiver and defensive back.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-a-8",
            "text": "I won both the Biletnikoff Award and the Bednarik Award in the same season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-a-9",
            "text": "I became the first full-time two-way player to win the Heisman Trophy since the early 1960s.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-a-10",
            "text": "I wore No. 12 for Colorado and became the school's second Heisman Trophy winner.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-travis-hunter-b-1",
            "text": "I was one of the highest-profile recruits ever to begin a college career outside the FBS.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-b-2",
            "text": "After one season, I followed my head coach to a new program.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-b-3",
            "text": "My role there was not a gadget role: I played full time at both cornerback and wide receiver.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-b-4",
            "text": "In my final college season, I caught 92 passes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-b-5",
            "text": "That same season, I defended 15 passes and intercepted four.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-b-6",
            "text": "I forced a game-winning fumble on defense while also ranking among the nation's receiving leaders.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-b-7",
            "text": "I was named my conference's Defensive Player of the Year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-b-8",
            "text": "I simultaneously won major national awards honoring the best receiver and the best defensive player.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-b-9",
            "text": "I won the Heisman Trophy over a field that included Ashton Jeanty.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          },
          {
            "id": "cfb-travis-hunter-b-10",
            "text": "I became Colorado's first Heisman winner since Rashaan Salaam while playing for Deion Sanders.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "colorado"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-joe-burrow",
    "name": "Joe Burrow",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/joe-burrow/",
      "lsu": "https://lsusports.net/sports/fb/roster/player/joe-burrow",
      "lsu2018": "https://lsusports.net/sports/fb/roster/season/2018/player/joe-burrow",
      "transfer": "https://lsusports.net/news/2019/07/11/211716544-2"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-joe-burrow-a-1",
            "text": "Before my final college season, I had never thrown more than 16 touchdown passes in a year at my current school.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-joe-burrow-a-2",
            "text": "My first year as a full-time starter there ended 10-3 and included a bowl offensive MVP honor.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu2018"
            ]
          },
          {
            "id": "cfb-joe-burrow-a-3",
            "text": "That first season made me the first quarterback in school history to throw for at least 2,500 yards and rush for at least 350 in the same year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu2018"
            ]
          },
          {
            "id": "cfb-joe-burrow-a-4",
            "text": "One year later, I completed 77.9 percent of my passes during the Heisman voting period, then the best mark in Heisman history.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-joe-burrow-a-5",
            "text": "I entered the postseason after throwing for 4,715 yards and 48 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-joe-burrow-a-6",
            "text": "I won the Heisman by a record 1,846-point margin.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-joe-burrow-a-7",
            "text": "That season I also won the Maxwell, Walter Camp, Davey O'Brien and Johnny Unitas Golden Arm awards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "lsu"
            ]
          },
          {
            "id": "cfb-joe-burrow-a-8",
            "text": "In the CFP semifinal and national championship game, I combined for 956 passing yards and 12 touchdown passes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-joe-burrow-a-9",
            "text": "I finished that season 15-0 as LSU's national-championship quarterback.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "lsu"
            ]
          },
          {
            "id": "cfb-joe-burrow-a-10",
            "text": "Wearing No. 9, I became LSU's second Heisman winner and its first since Billy Cannon in 1959.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "lsu"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-joe-burrow-b-1",
            "text": "I was named Ohio Mr. Football in high school after a senior season with nearly 4,500 passing yards and 63 touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-joe-burrow-b-2",
            "text": "I began my college career in the Big Ten, redshirting once and spending two seasons in a backup role.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-joe-burrow-b-3",
            "text": "I graduated from that first school, then moved as a graduate transfer with two seasons of eligibility remaining.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "transfer"
            ]
          },
          {
            "id": "cfb-joe-burrow-b-4",
            "text": "In my first season after the transfer, I became the first quarterback in school history to lead four wins over top-10 opponents in one year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu2018"
            ]
          },
          {
            "id": "cfb-joe-burrow-b-5",
            "text": "Across two seasons at my final school, I went 25-3 as the starting quarterback.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-joe-burrow-b-6",
            "text": "Those two seasons included 11 wins over top-10 teams, the most by a quarterback in school history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-joe-burrow-b-7",
            "text": "I became the first quarterback in that program's history to earn unanimous first-team All-America honors.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-joe-burrow-b-8",
            "text": "My path went from an Ohio State backup to a graduate transfer who eventually won the Heisman Trophy.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "transfer"
            ]
          },
          {
            "id": "cfb-joe-burrow-b-9",
            "text": "I became the first LSU player to win the Heisman since Billy Cannon in 1959.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-joe-burrow-b-10",
            "text": "I closed my LSU career with a 15-0 national championship and wore No. 9 in Baton Rouge.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-lamar-jackson",
    "name": "Lamar Jackson",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/lamar-jackson/",
      "louisville": "https://gocards.com/sports/football/roster/lamar-jackson/6874",
      "honor": "https://gocards.com/sports/2015/3/26/GEN_2014010128"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-lamar-jackson-a-1",
            "text": "As a true freshman quarterback, I also made one start from the backfield at running back.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "louisville"
            ]
          },
          {
            "id": "cfb-lamar-jackson-a-2",
            "text": "My first college season ended with a bowl MVP after I topped 200 yards both passing and rushing.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "louisville"
            ]
          },
          {
            "id": "cfb-lamar-jackson-a-3",
            "text": "The next season, I produced 610 yards of total offense in one game, including 411 passing and 199 rushing.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-lamar-jackson-a-4",
            "text": "I finished that regular season with 1,538 rushing yards, setting an ACC record for a quarterback.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-lamar-jackson-a-5",
            "text": "I became the first Heisman winner with at least 30 passing touchdowns and at least 21 rushing touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-lamar-jackson-a-6",
            "text": "I was named both ACC Player of the Year and ACC Offensive Player of the Year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "louisville"
            ]
          },
          {
            "id": "cfb-lamar-jackson-a-7",
            "text": "I also won the Maxwell and Davey O'Brien awards during that breakout season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "louisville"
            ]
          },
          {
            "id": "cfb-lamar-jackson-a-8",
            "text": "I became the youngest Heisman winner ever at 19 years and 337 days.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-lamar-jackson-a-9",
            "text": "That Heisman was the first in Louisville football history.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-lamar-jackson-a-10",
            "text": "I wore No. 8 for the Cardinals, and Louisville later retired that number.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "louisville",
              "honor"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-lamar-jackson-b-1",
            "text": "I came out of South Florida as an all-state dual-threat quarterback who also earned statewide recognition as a utility player.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "louisville"
            ]
          },
          {
            "id": "cfb-lamar-jackson-b-2",
            "text": "As a freshman, I finished second in my conference's Offensive Rookie of the Year voting.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "louisville"
            ]
          },
          {
            "id": "cfb-lamar-jackson-b-3",
            "text": "I set a school quarterback rushing record with 184 yards in one early start, then broke it with 186 later that season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "louisville"
            ]
          },
          {
            "id": "cfb-lamar-jackson-b-4",
            "text": "In my freshman bowl game, I rushed for 226 yards and became only the third quarterback in bowl history to pass and run for 200 yards in the same game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "louisville"
            ]
          },
          {
            "id": "cfb-lamar-jackson-b-5",
            "text": "My sophomore opener included eight total touchdowns, with six through the air and two on the ground.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "louisville"
            ]
          },
          {
            "id": "cfb-lamar-jackson-b-6",
            "text": "A few weeks later, I ran for 146 yards and four touchdowns in a 63-20 win over Florida State.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "louisville"
            ]
          },
          {
            "id": "cfb-lamar-jackson-b-7",
            "text": "I finished the following season as a Heisman finalist after already winning the award the year before.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "honor"
            ]
          },
          {
            "id": "cfb-lamar-jackson-b-8",
            "text": "I was the first player in ACC history to win both Player of the Year and Offensive Player of the Year in back-to-back seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "honor"
            ]
          },
          {
            "id": "cfb-lamar-jackson-b-9",
            "text": "Louisville retired my No. 8 jersey after my three-year career.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "honor"
            ]
          },
          {
            "id": "cfb-lamar-jackson-b-10",
            "text": "I am the Louisville quarterback who won the 2016 Heisman Trophy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "honor"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-baker-mayfield",
    "name": "Baker Mayfield",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/baker-mayfield/",
      "oklahoma": "https://soonersports.com/sports/football/roster/baker-mayfield/3343"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-baker-mayfield-a-1",
            "text": "I began my FBS career without a scholarship and won a starting quarterback job as a true freshman.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-baker-mayfield-a-2",
            "text": "My first college start produced 413 passing yards and four touchdown passes.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "oklahoma"
            ]
          },
          {
            "id": "cfb-baker-mayfield-a-3",
            "text": "After one season, I transferred within the same conference and had to sit out a year under the rules then in place.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "oklahoma"
            ]
          },
          {
            "id": "cfb-baker-mayfield-a-4",
            "text": "I later had a year of lost eligibility restored by a conference vote.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oklahoma"
            ]
          },
          {
            "id": "cfb-baker-mayfield-a-5",
            "text": "I finished in the top five of the Heisman voting three different times.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-baker-mayfield-a-6",
            "text": "In 2016, I set an NCAA passing-efficiency record with a 196.38 rating.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-baker-mayfield-a-7",
            "text": "One season later, I broke my own record with a 203.76 rating during the Heisman voting period.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-baker-mayfield-a-8",
            "text": "I became the first Heisman winner of the modern scholarship era to have begun his college career as a walk-on.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-baker-mayfield-a-9",
            "text": "My transfer took me from Texas Tech to Oklahoma, where I wore No. 6.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "oklahoma"
            ]
          },
          {
            "id": "cfb-baker-mayfield-a-10",
            "text": "I became Oklahoma's sixth Heisman Trophy winner in 2017.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-baker-mayfield-b-1",
            "text": "In high school, I went 25-2 as a starter and helped win a Texas state championship.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-baker-mayfield-b-2",
            "text": "My first FBS season earned me Big 12 Offensive Freshman of the Year honors.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "oklahoma"
            ]
          },
          {
            "id": "cfb-baker-mayfield-b-3",
            "text": "After transferring, I redshirted one season before taking over as the starter at my new school.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "oklahoma"
            ]
          },
          {
            "id": "cfb-baker-mayfield-b-4",
            "text": "Over three playing seasons there, I passed for 12,292 yards and 119 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oklahoma"
            ]
          },
          {
            "id": "cfb-baker-mayfield-b-5",
            "text": "In one road game during my final season, I threw for 598 yards and five touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-baker-mayfield-b-6",
            "text": "During the Heisman voting period of my final season, I threw for 4,340 yards, 41 touchdowns and only five interceptions.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-baker-mayfield-b-7",
            "text": "That team reached the College Football Playoff with a 12-1 record before the postseason.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-baker-mayfield-b-8",
            "text": "I won the Heisman with 2,398 points, more than 1,000 ahead of runner-up Bryce Love.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-baker-mayfield-b-9",
            "text": "I was a Heisman finalist in 2016 and won it for Oklahoma one year later.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-baker-mayfield-b-10",
            "text": "I am the No. 6 Sooners quarterback whose career began as a walk-on at Texas Tech.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "oklahoma"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-adrian-peterson",
    "name": "Adrian Peterson",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "freshman": "https://soonersports.com/news/2005/6/21/208387985",
      "heismanRun": "https://soonersports.com/news/2004/12/9/208368510",
      "record": "https://soonersports.com/news/2005/1/25/208391750?path=football",
      "shoulder": "https://soonersports.com/news/2005/1/18/208406076",
      "career": "https://soonersports.com/news/2007/4/28/208388438",
      "voting": "https://www.heisman.com/voting-records/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-adrian-peterson-a-1",
            "text": "I was a true freshman running back who immediately became my team's featured runner.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heismanRun"
            ]
          },
          {
            "id": "cfb-adrian-peterson-a-2",
            "text": "I ran for at least 100 yards in 11 games during that first season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "freshman",
              "record"
            ]
          },
          {
            "id": "cfb-adrian-peterson-a-3",
            "text": "I reached 1,000 career rushing yards in my seventh game, tying the NCAA freshman speed record at the time.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "record"
            ]
          },
          {
            "id": "cfb-adrian-peterson-a-4",
            "text": "I finished that freshman year with a school-record 1,925 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "freshman",
              "career"
            ]
          },
          {
            "id": "cfb-adrian-peterson-a-5",
            "text": "That total also established an NCAA freshman rushing record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "freshman",
              "career"
            ]
          },
          {
            "id": "cfb-adrian-peterson-a-6",
            "text": "I ran for 225 yards against Texas and 249 against Oklahoma State during that season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heismanRun"
            ]
          },
          {
            "id": "cfb-adrian-peterson-a-7",
            "text": "I became the first freshman ever named a finalist for the Doak Walker Award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "freshman"
            ]
          },
          {
            "id": "cfb-adrian-peterson-a-8",
            "text": "I finished second in the Heisman vote, then the highest finish ever by a freshman.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "freshman",
              "career"
            ]
          },
          {
            "id": "cfb-adrian-peterson-a-9",
            "text": "That record-setting freshman season came at Oklahoma.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "freshman",
              "career"
            ]
          },
          {
            "id": "cfb-adrian-peterson-a-10",
            "text": "I am the Sooners running back who rushed for 1,925 yards in 2004 and finished second to Matt Leinart for the Heisman.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "career",
              "voting"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-adrian-peterson-b-1",
            "text": "A shoulder problem followed me from preseason into my first college season and required surgery afterward.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "shoulder"
            ]
          },
          {
            "id": "cfb-adrian-peterson-b-2",
            "text": "The next year, an ankle injury cost me all or most of four games.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "cfb-adrian-peterson-b-3",
            "text": "Even with that interruption, I still rushed for 1,108 yards in my second season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "cfb-adrian-peterson-b-4",
            "text": "A broken collarbone then caused me to miss seven games in my third season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "cfb-adrian-peterson-b-5",
            "text": "I still cleared 1,000 rushing yards in that shortened third year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "cfb-adrian-peterson-b-6",
            "text": "I left college after three seasons with 4,045 rushing yards and 41 touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "cfb-adrian-peterson-b-7",
            "text": "I finished third on Oklahoma's career rushing list, only 74 yards behind Billy Sims' school mark at the time.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "cfb-adrian-peterson-b-8",
            "text": "I had already set the school and NCAA freshman rushing records with 1,925 yards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "freshman",
              "career"
            ]
          },
          {
            "id": "cfb-adrian-peterson-b-9",
            "text": "Minnesota selected me seventh overall immediately after my Oklahoma career.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "cfb-adrian-peterson-b-10",
            "text": "I am the Oklahoma back whose 2004 freshman season ended with a runner-up Heisman finish.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "freshman",
              "career"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-barry-sanders",
    "name": "Barry Sanders",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/barry-sanders/",
      "osu": "https://okstate.com/sports/2015/3/17/GEN_2014010114",
      "honor": "https://okstate.com/news/2021/7/22/football-barry-sanders-to-be-honored-by-oklahoma-state",
      "tokyo": "https://okstate.com/news/2022/5/23/football-record-rewind-barrys-332-rushing-yards-vs-texas-tech-in-1988"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-barry-sanders-a-1",
            "text": "I spent my first two college seasons behind another future Pro Football Hall of Fame running back.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-barry-sanders-a-2",
            "text": "As a sophomore, I made my biggest impact on special teams and led the nation in kickoff-return average.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-barry-sanders-a-3",
            "text": "I did not become my team's full-time starting tailback until my junior season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-barry-sanders-a-4",
            "text": "That junior year included four games with at least 300 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "osu"
            ]
          },
          {
            "id": "cfb-barry-sanders-a-5",
            "text": "I finished that regular season averaging 238.9 rushing yards per game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "tokyo"
            ]
          },
          {
            "id": "cfb-barry-sanders-a-6",
            "text": "I rushed for 2,628 yards and 37 touchdowns in that 11-game regular season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "tokyo"
            ]
          },
          {
            "id": "cfb-barry-sanders-a-7",
            "text": "That season produced 34 NCAA records.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-barry-sanders-a-8",
            "text": "I won the Heisman while sweeping all six voting regions.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "tokyo"
            ]
          },
          {
            "id": "cfb-barry-sanders-a-9",
            "text": "I accepted the Heisman Trophy by satellite from Tokyo before playing Texas Tech there later that day.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-barry-sanders-a-10",
            "text": "Wearing No. 21, I became Oklahoma State's first Heisman Trophy winner in 1988.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-barry-sanders-b-1",
            "text": "I did not become my high school's starting tailback until the fourth game of my senior season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-barry-sanders-b-2",
            "text": "Despite rushing for 1,417 yards over my final seven high-school games, I received only three scholarship offers.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-barry-sanders-b-3",
            "text": "As a college freshman, I rushed for 325 yards while averaging 23.7 yards on kickoff returns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-barry-sanders-b-4",
            "text": "The next year, I backed up Thurman Thomas and scored two kickoff-return touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-barry-sanders-b-5",
            "text": "In 1988, I piled up 937 rushing yards and 13 touchdowns over one three-game stretch.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "honor"
            ]
          },
          {
            "id": "cfb-barry-sanders-b-6",
            "text": "Against Texas Tech in Tokyo, I ran for 332 yards and four touchdowns on 44 carries.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tokyo"
            ]
          },
          {
            "id": "cfb-barry-sanders-b-7",
            "text": "I also won the Maxwell Award and Walter Camp Player of the Year during that historic season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tokyo"
            ]
          },
          {
            "id": "cfb-barry-sanders-b-8",
            "text": "I left after my junior season and became the third pick of the 1989 NFL Draft.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-barry-sanders-b-9",
            "text": "I played behind Thurman Thomas before turning Oklahoma State's No. 21 into a legendary college number.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "osu"
            ]
          },
          {
            "id": "cfb-barry-sanders-b-10",
            "text": "I am the Cowboys running back whose 1988 season set 34 NCAA records and won Oklahoma State its first Heisman.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "tokyo"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-devonta-smith",
    "name": "DeVonta Smith",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/devonta-smith/",
      "alabama": "https://rolltide.com/sports/football/roster/devonta-smith/6374"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-devonta-smith-a-1",
            "text": "My freshman college season produced only eight catches, but three of them went for touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-devonta-smith-a-2",
            "text": "One year later, I finished with 42 receptions and six receiving scores.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-devonta-smith-a-3",
            "text": "As a junior, I led my team with 1,256 receiving yards and 14 touchdowns on 68 catches.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-devonta-smith-a-4",
            "text": "By the end of my career, I held my school and conference records for receiving yards and receiving touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "alabama"
            ]
          },
          {
            "id": "cfb-devonta-smith-a-5",
            "text": "My final season ended with 117 catches for 1,856 yards and 23 receiving touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "alabama"
            ]
          },
          {
            "id": "cfb-devonta-smith-a-6",
            "text": "I became the first wide receiver ever named AP Player of the Year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "alabama"
            ]
          },
          {
            "id": "cfb-devonta-smith-a-7",
            "text": "I also won the Biletnikoff, Maxwell and Walter Camp awards that season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "alabama"
            ]
          },
          {
            "id": "cfb-devonta-smith-a-8",
            "text": "I became the first wide receiver in almost three decades to win the Heisman Trophy.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-devonta-smith-a-9",
            "text": "I wore No. 6 for Alabama and became the program's third Heisman winner.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "alabama"
            ]
          },
          {
            "id": "cfb-devonta-smith-a-10",
            "text": "My final catch as a freshman was the game-winning touchdown of the 2017 CFP national championship game.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-devonta-smith-b-1",
            "text": "I starred in both football and basketball before college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-devonta-smith-b-2",
            "text": "My final college season included an 84-yard punt-return touchdown.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "alabama"
            ]
          },
          {
            "id": "cfb-devonta-smith-b-3",
            "text": "Against Mississippi State that season, I caught 11 passes for 203 yards and four touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "alabama"
            ]
          },
          {
            "id": "cfb-devonta-smith-b-4",
            "text": "At LSU, I turned eight catches into 231 yards and three touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "alabama"
            ]
          },
          {
            "id": "cfb-devonta-smith-b-5",
            "text": "In the conference championship game, I set a title-game record with 15 receptions and finished with 184 receiving yards and two touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "alabama"
            ]
          },
          {
            "id": "cfb-devonta-smith-b-6",
            "text": "In the CFP semifinal, I caught seven passes for 130 yards and three touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "alabama"
            ]
          },
          {
            "id": "cfb-devonta-smith-b-7",
            "text": "In the national championship, I had 12 catches for 215 yards and three touchdowns, all before a hand injury ended my night early.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "alabama"
            ]
          },
          {
            "id": "cfb-devonta-smith-b-8",
            "text": "I was named Offensive MVP of both the CFP semifinal and the national championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "alabama"
            ]
          },
          {
            "id": "cfb-devonta-smith-b-9",
            "text": "I finished as Alabama's No. 6 receiver with program records of 235 catches, 3,965 yards and 46 receiving touchdowns.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "alabama"
            ]
          },
          {
            "id": "cfb-devonta-smith-b-10",
            "text": "I am the Alabama wide receiver who won the 2020 Heisman Trophy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "alabama"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-doug-flutie",
    "name": "Doug Flutie",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/doug-flutie/",
      "bc": "https://bceagles.com/news/2001/3/26/Football_Retired_Jerseys",
      "roster": "https://bceagles.com/sports/football/roster/1984"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-doug-flutie-a-1",
            "text": "I became a starting college quarterback as a true freshman and never missed a game in four seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-doug-flutie-a-2",
            "text": "By my junior year, I had already become a Heisman finalist and helped my team finish 9-3 with a bowl victory.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-doug-flutie-a-3",
            "text": "As a senior, I threw for 3,454 yards and 27 touchdowns during the regular season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-doug-flutie-a-4",
            "text": "I became the first major-college passer to surpass 10,000 career passing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-doug-flutie-a-5",
            "text": "I finished with 10,579 career passing yards, then an NCAA record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "bc"
            ]
          },
          {
            "id": "cfb-doug-flutie-a-6",
            "text": "I was a unanimous first-team All-American and also won the Maxwell and Davey O'Brien awards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-doug-flutie-a-7",
            "text": "I won the Heisman after receiving 678 first-place votes and 2,240 total points.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-doug-flutie-a-8",
            "text": "That trophy was the first Heisman in Boston College history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-doug-flutie-a-9",
            "text": "My senior season included a last-second 48-yard touchdown pass to Gerard Phelan to beat Miami 47-45.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "bc"
            ]
          },
          {
            "id": "cfb-doug-flutie-a-10",
            "text": "I wore No. 22 at Boston College, a number the school later retired.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "roster",
              "bc"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-doug-flutie-b-1",
            "text": "I was an all-league high-school athlete in football, basketball and baseball.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-doug-flutie-b-2",
            "text": "I measured 5-foot-9 as a senior college quarterback.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "roster"
            ]
          },
          {
            "id": "cfb-doug-flutie-b-3",
            "text": "My first college season included 1,652 passing yards and 10 touchdowns after I won the starting job as a true freshman.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-doug-flutie-b-4",
            "text": "I followed with 2,749 passing yards as a sophomore and 2,724 as a junior.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-doug-flutie-b-5",
            "text": "That junior season ended 9-3 with a Liberty Bowl victory and a third-place Heisman finish.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-doug-flutie-b-6",
            "text": "My senior team finished the regular season 9-2 and ranked eighth in the polls.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-doug-flutie-b-7",
            "text": "I was also a Rhodes Scholarship candidate during my senior year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-doug-flutie-b-8",
            "text": "The Heisman ballots were already in before the most famous play of my college career happened.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-doug-flutie-b-9",
            "text": "That play was a desperation touchdown pass at Miami that produced a 47-45 Boston College win.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "bc"
            ]
          },
          {
            "id": "cfb-doug-flutie-b-10",
            "text": "Boston College later retired the No. 22 jersey I wore while winning the 1984 Heisman.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bc",
              "roster"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-matt-leinart",
    "name": "Matt Leinart",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/matt-leinart/",
      "uscHeisman": "https://usctrojans.com/sports/2018/7/25/matt-leinart-heisman-trophy-winner",
      "uscRoster": "https://usctrojans.com/sports/football/roster/leinart-matt/1807",
      "uscOutlook": "https://usctrojans.com/news/2004/7/22/2004_usc_football_outlook",
      "uscND": "https://usctrojans.com/news/2004/11/27/no_1_usc_tramples_notre_dame_41_10"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-matt-leinart-a-1",
            "text": "I redshirted my first college season and spent the next one backing up a Heisman-winning quarterback.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-matt-leinart-a-2",
            "text": "My first career pass went for a touchdown in a road season opener.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "uscOutlook"
            ]
          },
          {
            "id": "cfb-matt-leinart-a-3",
            "text": "In my first season as the starter, I threw for 3,556 yards and a then-conference-record 38 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "uscOutlook"
            ]
          },
          {
            "id": "cfb-matt-leinart-a-4",
            "text": "That team won a national championship, and I finished sixth in the Heisman voting.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-matt-leinart-a-5",
            "text": "The next regular season, I threw for 2,990 yards and 28 touchdowns with six interceptions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-matt-leinart-a-6",
            "text": "I led my team to a 12-0 regular season while it went wire-to-wire at No. 1 in the polls.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-matt-leinart-a-7",
            "text": "I won the Heisman over a finalist group that included Adrian Peterson, Jason White, Alex Smith and one of my own teammates.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-matt-leinart-a-8",
            "text": "In the BCS title game, I threw for 332 yards and five touchdowns in a 55-19 win over Oklahoma.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-matt-leinart-a-9",
            "text": "I became USC's sixth Heisman winner and its second in three years.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "uscHeisman"
            ]
          },
          {
            "id": "cfb-matt-leinart-a-10",
            "text": "I succeeded Carson Palmer as USC's starting quarterback and won the 2004 Heisman.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-matt-leinart-b-1",
            "text": "I was California's Gatorade Player of the Year after throwing for 2,870 yards and 28 touchdowns as a high-school senior.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-matt-leinart-b-2",
            "text": "I considered Oklahoma before choosing my college program.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-matt-leinart-b-3",
            "text": "After a redshirt year and a season as a reserve, I won a spring competition for the starting quarterback job.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-matt-leinart-b-4",
            "text": "In my first season as the starter, I went 212 consecutive passes without an interception, then a conference record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "uscOutlook"
            ]
          },
          {
            "id": "cfb-matt-leinart-b-5",
            "text": "Against Notre Dame in 2004, I threw for 400 yards and five touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "uscND"
            ]
          },
          {
            "id": "cfb-matt-leinart-b-6",
            "text": "I became the first junior from my school to win the Heisman Trophy.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "uscHeisman"
            ]
          },
          {
            "id": "cfb-matt-leinart-b-7",
            "text": "After winning a second straight national championship, I returned to school for one more season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "uscHeisman"
            ]
          },
          {
            "id": "cfb-matt-leinart-b-8",
            "text": "In that final college season, I threw for 3,815 yards and 28 touchdowns and finished third in the Heisman voting.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-matt-leinart-b-9",
            "text": "My three seasons as a starter at USC included national-title teams in 2003 and 2004.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "uscHeisman"
            ]
          },
          {
            "id": "cfb-matt-leinart-b-10",
            "text": "I am the USC quarterback who won the 2004 Heisman one season before teammate Reggie Bush won it.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-andrew-luck",
    "name": "Andrew Luck",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "stanford": "https://gostanford.com/news/2013/04/17/andrew-luck-profile-1",
      "hall": "https://gostanford.com/news/2023/08/17/2023-hall-of-fame-class"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-andrew-luck-a-1",
            "text": "I took over at quarterback for a program that had endured seven straight losing seasons before my time as the starter.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "stanford"
            ]
          },
          {
            "id": "cfb-andrew-luck-a-2",
            "text": "Across 38 career starts, my teams went 31-7.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "stanford"
            ]
          },
          {
            "id": "cfb-andrew-luck-a-3",
            "text": "In 2010, I threw for 3,338 yards and 32 touchdowns while completing 70.6 percent of my passes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "stanford"
            ]
          },
          {
            "id": "cfb-andrew-luck-a-4",
            "text": "That season produced a school-record 12 wins and a runner-up finish in the Heisman voting.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "stanford"
            ]
          },
          {
            "id": "cfb-andrew-luck-a-5",
            "text": "One year later, I set school records with 37 touchdown passes and a 71.3 percent completion rate.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "stanford",
              "hall"
            ]
          },
          {
            "id": "cfb-andrew-luck-a-6",
            "text": "I won the Maxwell, Walter Camp and Johnny Unitas Golden Arm awards in my final college season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "stanford",
              "hall"
            ]
          },
          {
            "id": "cfb-andrew-luck-a-7",
            "text": "I finished second in the Heisman voting for a second consecutive season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "stanford",
              "hall"
            ]
          },
          {
            "id": "cfb-andrew-luck-a-8",
            "text": "I ended my career holding school records with 82 touchdown passes and 10,387 yards of total offense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "stanford",
              "hall"
            ]
          },
          {
            "id": "cfb-andrew-luck-a-9",
            "text": "I led Stanford to the Orange Bowl and Fiesta Bowl in my final two seasons.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "stanford",
              "hall"
            ]
          },
          {
            "id": "cfb-andrew-luck-a-10",
            "text": "After that Stanford career, I was selected No. 1 overall in the 2012 NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hall"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-andrew-luck-b-1",
            "text": "I did not see game action during my first college season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "stanford"
            ]
          },
          {
            "id": "cfb-andrew-luck-b-2",
            "text": "As a redshirt freshman, I set a school freshman record with 2,575 passing yards.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "stanford"
            ]
          },
          {
            "id": "cfb-andrew-luck-b-3",
            "text": "That first season as a starter included back-to-back upsets of ranked Oregon and USC.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "stanford"
            ]
          },
          {
            "id": "cfb-andrew-luck-b-4",
            "text": "A broken right index finger in my final regular-season game kept me out of that season's bowl game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "stanford"
            ]
          },
          {
            "id": "cfb-andrew-luck-b-5",
            "text": "The next year, I helped set a school record for wins and reached the Orange Bowl.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "stanford"
            ]
          },
          {
            "id": "cfb-andrew-luck-b-6",
            "text": "I was named Orange Bowl Most Outstanding Player after throwing for 287 yards and four touchdowns in a 40-12 win.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "stanford",
              "hall"
            ]
          },
          {
            "id": "cfb-andrew-luck-b-7",
            "text": "In my final regular season, I helped win a 56-48 triple-overtime game at USC after forcing overtime with a late touchdown drive.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "stanford"
            ]
          },
          {
            "id": "cfb-andrew-luck-b-8",
            "text": "I was named the Academic All-America of the Year during my final college season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "stanford"
            ]
          },
          {
            "id": "cfb-andrew-luck-b-9",
            "text": "I was the Stanford quarterback who finished second for the Heisman behind Cam Newton and then Robert Griffin III in consecutive years.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "stanford",
              "hall"
            ]
          },
          {
            "id": "cfb-andrew-luck-b-10",
            "text": "I closed my college career as a two-time Heisman runner-up before becoming the first pick of the 2012 NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hall"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-bryce-young",
    "name": "Bryce Young",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/bryce-young/",
      "alabama": "https://rolltide.com/sports/football/roster/young-bryce/8139",
      "roster": "https://rolltide.com/sports/football/roster/2022"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-bryce-young-a-1",
            "text": "As a college freshman, I played in nine games as a reserve for a national-championship team.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bryce-young-a-2",
            "text": "In my first year as the starter, I threw five touchdown passes in a game three different times.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bryce-young-a-3",
            "text": "One of those games included a school-record 559 passing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "alabama"
            ]
          },
          {
            "id": "cfb-bryce-young-a-4",
            "text": "Through the conference championship, I had thrown for 4,322 yards, 43 touchdowns and only four interceptions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bryce-young-a-5",
            "text": "In that conference title game, I passed for 421 yards and produced 461 yards of total offense.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "alabama"
            ]
          },
          {
            "id": "cfb-bryce-young-a-6",
            "text": "That performance set championship-game records for passing yards and total offense and earned me game MVP honors.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "alabama"
            ]
          },
          {
            "id": "cfb-bryce-young-a-7",
            "text": "I led my team to a 12-1 record, a conference championship and the top seed in the College Football Playoff.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bryce-young-a-8",
            "text": "I became Alabama's fourth Heisman winner and its second in consecutive seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bryce-young-a-9",
            "text": "My Heisman followed a teammate who had won the award as a wide receiver one year earlier.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bryce-young-a-10",
            "text": "I wore No. 9 at Alabama and won the 2021 Heisman Trophy in my first season as the starting quarterback.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "roster"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-bryce-young-b-1",
            "text": "I started high school at one Los Angeles-area program before transferring for my final two seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bryce-young-b-2",
            "text": "As a high-school senior, I threw for 4,528 yards and 58 touchdowns and was named the Gatorade Player of the Year.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bryce-young-b-3",
            "text": "As a freshman, I completed 13 of 22 passes for 156 yards and one touchdown in reserve duty.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bryce-young-b-4",
            "text": "In the Iron Bowl the next year, I helped rally my team late and finished with 317 passing yards and two touchdowns in a four-overtime win.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "alabama"
            ]
          },
          {
            "id": "cfb-bryce-young-b-5",
            "text": "One week later, I threw for 421 yards and three touchdowns against top-ranked Georgia in the conference championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "alabama"
            ]
          },
          {
            "id": "cfb-bryce-young-b-6",
            "text": "I was 20 years and 139 days old when I won the Heisman, making me the seventh-youngest winner at the time.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bryce-young-b-7",
            "text": "I returned for another season and finished my college career with 8,356 passing yards and 80 touchdown passes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bryce-young-b-8",
            "text": "Those career totals ranked second in Alabama history in both passing yards and passing touchdowns when I left.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bryce-young-b-9",
            "text": "Alabama's No. 9 quarterback became the program's fourth Heisman winner.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "roster"
            ]
          },
          {
            "id": "cfb-bryce-young-b-10",
            "text": "I am the Alabama quarterback who won the 2021 Heisman immediately after DeVonta Smith's 2020 victory.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-c-j-stroud",
    "name": "C.J. Stroud",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "awards2021": "https://ohiostatebuckeyes.com/news/2021/12/1/c-j-stroud-big-tens-offensive-qb-and-freshman-of-the-year",
      "rose": "https://ohiostatebuckeyes.com/news/2022/1/1/ohio-state-rose-bowl-recap",
      "roster": "https://ohiostatebuckeyes.com/sports/football/roster/c-j-stroud/4470",
      "finalist2022": "https://ohiostatebuckeyes.com/news/2022/12/6/c-j-stroud-a-heisman-trophy-finalist-for-second-consecutive-year",
      "repeat": "https://ohiostatebuckeyes.com/news/2022/11/30/stroud-repeats-as-the-big-tens-quarterback-offensive-player-of-the-year",
      "peach": "https://ohiostatebuckeyes.com/news/2023/1/1/recap-ohio-state-vs-georgia-123122"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-c-j-stroud-a-1",
            "text": "I entered my first season as a starting college quarterback without having thrown a collegiate pass.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "awards2021"
            ]
          },
          {
            "id": "cfb-c-j-stroud-a-2",
            "text": "That year, I became the first quarterback in school history to throw five touchdown passes without an interception in back-to-back games.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "awards2021",
              "roster"
            ]
          },
          {
            "id": "cfb-c-j-stroud-a-3",
            "text": "I became the first player in Big Ten history to win its Offensive Player, Quarterback and Freshman of the Year awards in the same season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "awards2021"
            ]
          },
          {
            "id": "cfb-c-j-stroud-a-4",
            "text": "Before my bowl game, I had thrown for 3,862 yards and 38 touchdowns with only five interceptions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "awards2021"
            ]
          },
          {
            "id": "cfb-c-j-stroud-a-5",
            "text": "Against Michigan State, I tied a school record with six touchdown passes and completed a school-record 17 consecutive throws.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "awards2021"
            ]
          },
          {
            "id": "cfb-c-j-stroud-a-6",
            "text": "I became a Heisman finalist in that first season as a starter.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "awards2021"
            ]
          },
          {
            "id": "cfb-c-j-stroud-a-7",
            "text": "In the Rose Bowl, I threw for a school-record 573 yards and six touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "rose",
              "roster"
            ]
          },
          {
            "id": "cfb-c-j-stroud-a-8",
            "text": "I finished that season with 4,435 passing yards, 44 touchdowns and a school-record 71.9 percent completion rate.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "roster"
            ]
          },
          {
            "id": "cfb-c-j-stroud-a-9",
            "text": "That Rose Bowl ended in a 48-45 Ohio State win over Utah.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "rose"
            ]
          },
          {
            "id": "cfb-c-j-stroud-a-10",
            "text": "I became a two-time Heisman Trophy finalist while playing quarterback at Ohio State.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "finalist2022",
              "roster"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-c-j-stroud-b-1",
            "text": "I entered my second season as a starting quarterback after being voted a team captain.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "roster"
            ]
          },
          {
            "id": "cfb-c-j-stroud-b-2",
            "text": "I won my conference's Quarterback of the Year and Offensive Player of the Year awards in consecutive seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "repeat"
            ]
          },
          {
            "id": "cfb-c-j-stroud-b-3",
            "text": "I became the first Big Ten quarterback with back-to-back seasons of at least 30 touchdown passes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "repeat",
              "finalist2022"
            ]
          },
          {
            "id": "cfb-c-j-stroud-b-4",
            "text": "During the 2022 regular season, I threw for 3,340 yards and 37 touchdowns with six interceptions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "finalist2022",
              "repeat"
            ]
          },
          {
            "id": "cfb-c-j-stroud-b-5",
            "text": "I led the nation in passing efficiency and co-led it in touchdown passes entering the postseason.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "repeat",
              "finalist2022"
            ]
          },
          {
            "id": "cfb-c-j-stroud-b-6",
            "text": "I was selected as a Heisman finalist for the second consecutive year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "finalist2022"
            ]
          },
          {
            "id": "cfb-c-j-stroud-b-7",
            "text": "In the CFP semifinal against No. 1 Georgia, I threw for 348 yards and four touchdowns without an interception.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "roster",
              "peach"
            ]
          },
          {
            "id": "cfb-c-j-stroud-b-8",
            "text": "I also rushed for 71 yards in that one-point semifinal loss.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "roster"
            ]
          },
          {
            "id": "cfb-c-j-stroud-b-9",
            "text": "I finished my Ohio State career with 8,123 passing yards, 85 touchdown passes and 16 school records set or tied.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "roster"
            ]
          },
          {
            "id": "cfb-c-j-stroud-b-10",
            "text": "I wore No. 7 for Ohio State and closed my career with two straight trips to New York as a Heisman finalist.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "roster",
              "finalist2022"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-caleb-williams",
    "name": "Caleb Williams",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/caleb-williams/",
      "usc": "https://usctrojans.com/sports/football/roster/williams-caleb/15820",
      "uscRoster": "https://usctrojans.com/sports/football/roster/2022"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-caleb-williams-a-1",
            "text": "I changed schools after my freshman season and immediately won the starting quarterback job at my new program.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "usc"
            ]
          },
          {
            "id": "cfb-caleb-williams-a-2",
            "text": "That new team improved from 4-8 the year before I arrived to 11-2 before bowl season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-caleb-williams-a-3",
            "text": "Through the Heisman voting period, I threw for 4,075 yards and 37 touchdowns with four interceptions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-caleb-williams-a-4",
            "text": "I also rushed for 372 yards and a team-best 10 touchdowns during that stretch.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-caleb-williams-a-5",
            "text": "My 4,447 yards of total offense broke my school's single-season record before the bowl game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-caleb-williams-a-6",
            "text": "My 47 total touchdowns led the nation and set a school record during the Heisman voting period.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-caleb-williams-a-7",
            "text": "I also won the Maxwell, Walter Camp and AP Player of the Year awards that season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-caleb-williams-a-8",
            "text": "I won the Heisman Trophy as a sophomore quarterback.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-caleb-williams-a-9",
            "text": "My transfer took me from Oklahoma to USC along with head coach Lincoln Riley.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "usc"
            ]
          },
          {
            "id": "cfb-caleb-williams-a-10",
            "text": "I wore No. 13 at USC and won the 2022 Heisman Trophy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "uscRoster"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-caleb-williams-b-1",
            "text": "I enrolled early at my first college after graduating from high school a semester early.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-caleb-williams-b-2",
            "text": "As a freshman, I appeared in 11 games and started the final seven.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-caleb-williams-b-3",
            "text": "That freshman season produced 1,912 passing yards and 21 touchdowns plus 442 rushing yards and six more scores.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-caleb-williams-b-4",
            "text": "After one season, I transferred to follow my head coach to a new program.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "usc"
            ]
          },
          {
            "id": "cfb-caleb-williams-b-5",
            "text": "In 2022, I set a USC single-game record with 503 yards of total offense against UCLA.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-caleb-williams-b-6",
            "text": "In the Cotton Bowl, I threw for 462 yards and five touchdowns, both bowl records.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-caleb-williams-b-7",
            "text": "Including that bowl, I finished the 2022 season with USC single-season records of 4,537 passing yards and 42 touchdown passes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-caleb-williams-b-8",
            "text": "My completed 2022 season also set USC records with 4,919 yards of total offense and 52 combined passing and rushing touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-caleb-williams-b-9",
            "text": "I won the Heisman at USC after beginning my college career at Oklahoma.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "usc"
            ]
          },
          {
            "id": "cfb-caleb-williams-b-10",
            "text": "I am the No. 13 USC quarterback who won the 2022 Heisman Trophy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "uscRoster"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-archie-griffin",
    "name": "Archie Griffin",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/archie-griffin/",
      "heisman75": "https://www.heisman.com/heisman-winners/archie-griffin-75/",
      "osu": "https://ohiostatebuckeyes.com/sports/2018/7/2/archie-griffin",
      "retired": "https://ohiostatebuckeyes.com/news/2007/6/28/ohio-state-retires-archie-griffins-no-45-3",
      "streak": "https://ohiostatebuckeyes.com/news/2014/7/29/did-you-know-31-days-to-kickoff",
      "anniversary": "https://ohiostatebuckeyes.com/news/2020/12/2/45-years-later-griffins-still-the-only-two-time-heisman-winner-2"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-archie-griffin-a-1",
            "text": "I became a four-year starting college tailback after arriving as a local high-school star.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "osu"
            ]
          },
          {
            "id": "cfb-archie-griffin-a-2",
            "text": "In just my second college game, I rushed for a then-school-record 239 yards.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "osu"
            ]
          },
          {
            "id": "cfb-archie-griffin-a-3",
            "text": "After 867 rushing yards as a freshman, I jumped to 1,577 as a sophomore.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-archie-griffin-a-4",
            "text": "My junior season produced a career-best 1,620 rushing yards and 12 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-archie-griffin-a-5",
            "text": "That year, I led my team to a 10-1 record and a No. 3 national ranking.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-archie-griffin-a-6",
            "text": "I won the Heisman Trophy as a junior.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-archie-griffin-a-7",
            "text": "As a senior, I rushed for 1,357 yards while my team completed an 11-0 regular season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-archie-griffin-a-8",
            "text": "I then won the Heisman Trophy for a second consecutive year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman75",
              "osu"
            ]
          },
          {
            "id": "cfb-archie-griffin-a-9",
            "text": "My four seasons included four Big Ten titles and four consecutive Rose Bowl starts for Ohio State.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-archie-griffin-a-10",
            "text": "I wore No. 45 for the Buckeyes and remain the only player ever to win two Heisman Trophies.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "retired"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-archie-griffin-b-1",
            "text": "My first college carry ended in a fumble.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "anniversary"
            ]
          },
          {
            "id": "cfb-archie-griffin-b-2",
            "text": "Two weeks later, I responded with a 239-yard rushing game that broke a school record that had stood for 27 seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "anniversary"
            ]
          },
          {
            "id": "cfb-archie-griffin-b-3",
            "text": "Beginning in my sophomore season, I rushed for at least 100 yards in 31 consecutive regular-season games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "streak",
              "osu"
            ]
          },
          {
            "id": "cfb-archie-griffin-b-4",
            "text": "That streak remains an NCAA record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "streak",
              "osu"
            ]
          },
          {
            "id": "cfb-archie-griffin-b-5",
            "text": "I finished my college career with 5,589 rushing yards, still the school record decades later.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-archie-griffin-b-6",
            "text": "My teams went 40-5-1 during my four seasons as the starting tailback.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-archie-griffin-b-7",
            "text": "I was a three-time first-team All-American and twice won the Big Ten's Silver Football as league MVP.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-archie-griffin-b-8",
            "text": "I left college as the NCAA's all-time leading rusher at the time.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "anniversary"
            ]
          },
          {
            "id": "cfb-archie-griffin-b-9",
            "text": "Ohio State later retired the No. 45 jersey I wore.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "retired"
            ]
          },
          {
            "id": "cfb-archie-griffin-b-10",
            "text": "I am the Buckeyes running back who won the Heisman in both 1974 and 1975.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "heisman75",
              "osu"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-bo-jackson",
    "name": "Bo Jackson",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/bo-jackson/",
      "auburn40": "https://auburntigers.com/news/2025/08/15/auburn-to-honor-bo-jackson-at-iron-bowl-to-commemorate-40th-anniversary-of-heisman-trophy-season",
      "auburnStory": "https://auburntigers.com/news/2025/11/28/heisman-at-40-auburn-honors-bo-jacksons-1985-season",
      "auburnRoyals": "https://auburntigers.com/news/2024/06/30/bo-jack-royals-hof"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-bo-jackson-a-1",
            "text": "I made an immediate impact as a true freshman running back, rushing for 829 yards and nine touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bo-jackson-a-2",
            "text": "As a sophomore, I rushed for 1,213 yards and 12 touchdowns while my team finished 11-1.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bo-jackson-a-3",
            "text": "Injuries limited me to 475 rushing yards during my junior football season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bo-jackson-a-4",
            "text": "I opened my senior year with a career-high 290 rushing yards and four touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "auburnStory"
            ]
          },
          {
            "id": "cfb-bo-jackson-a-5",
            "text": "That senior season ended with 1,786 rushing yards and 17 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn40"
            ]
          },
          {
            "id": "cfb-bo-jackson-a-6",
            "text": "I won the Heisman Trophy by only 45 points, then the closest vote in the award's history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburnStory"
            ]
          },
          {
            "id": "cfb-bo-jackson-a-7",
            "text": "I was a three-time All-SEC selection and a two-time All-American.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bo-jackson-a-8",
            "text": "I finished my college career with 4,303 rushing yards, a program record that still stands.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburnStory"
            ]
          },
          {
            "id": "cfb-bo-jackson-a-9",
            "text": "I became Auburn's second Heisman winner, following Pat Sullivan.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bo-jackson-a-10",
            "text": "I wore No. 34 for Auburn, a jersey the school later retired.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "auburn40"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-bo-jackson-b-1",
            "text": "I was recruited out of high school in three sports: football, baseball and track and field.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bo-jackson-b-2",
            "text": "The New York Yankees drafted me out of high school, but I chose a football scholarship instead.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bo-jackson-b-3",
            "text": "In college, I lettered not only in football but also in baseball and track.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bo-jackson-b-4",
            "text": "I hit .401 during my junior baseball season and finished my college baseball career with a .335 average.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-bo-jackson-b-5",
            "text": "On the football field, a shoulder injury cost me roughly half of my junior season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "auburnStory"
            ]
          },
          {
            "id": "cfb-bo-jackson-b-6",
            "text": "Even while playing part of my senior season with broken ribs, I topped 200 rushing yards four times.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "auburnStory"
            ]
          },
          {
            "id": "cfb-bo-jackson-b-7",
            "text": "Across four Iron Bowls, I rushed for 630 yards and six touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "auburnStory"
            ]
          },
          {
            "id": "cfb-bo-jackson-b-8",
            "text": "My 1985 Heisman season made me Auburn's second winner of the award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburnStory"
            ]
          },
          {
            "id": "cfb-bo-jackson-b-9",
            "text": "Tampa Bay selected me first overall in the 1986 NFL Draft, but I chose professional baseball instead.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburnRoyals"
            ]
          },
          {
            "id": "cfb-bo-jackson-b-10",
            "text": "I am Auburn's No. 34 two-sport icon who won the 1985 Heisman Trophy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "auburn40"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-earl-campbell",
    "name": "Earl Campbell",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/earl-campbell/",
      "texasVisit": "https://texaslonghorns.com/news/2012/1/8/010812aaa_605",
      "texasSpring": "https://texaslonghorns.com/news/2010/4/3/040310aaa_559",
      "texasThrill": "https://texaslonghorns.com/news/2009/7/9/070909aaa_585"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-earl-campbell-a-1",
            "text": "I became a starting college fullback as a freshman and rushed for 928 yards.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "texasThrill"
            ]
          },
          {
            "id": "cfb-earl-campbell-a-2",
            "text": "As a sophomore, I rushed for 1,118 yards and 13 touchdowns and earned consensus All-America honors.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "texasThrill"
            ]
          },
          {
            "id": "cfb-earl-campbell-a-3",
            "text": "A hamstring injury then caused me to miss four games during my junior season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "texasThrill"
            ]
          },
          {
            "id": "cfb-earl-campbell-a-4",
            "text": "My senior season became my breakthrough, with 1,744 rushing yards and 19 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "texasSpring"
            ]
          },
          {
            "id": "cfb-earl-campbell-a-5",
            "text": "I led the nation in both rushing and scoring that year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "texasSpring"
            ]
          },
          {
            "id": "cfb-earl-campbell-a-6",
            "text": "My team completed an 11-0 regular season and spent much of the year ranked No. 1.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-earl-campbell-a-7",
            "text": "I won the Heisman Trophy after receiving 371 first-place votes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-earl-campbell-a-8",
            "text": "I finished my college career with a then-school-record 4,443 rushing yards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "texasVisit"
            ]
          },
          {
            "id": "cfb-earl-campbell-a-9",
            "text": "I became the first Texas Longhorn to win the Heisman Trophy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-earl-campbell-a-10",
            "text": "I wore No. 20 at Texas, a number the school later retired.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "texasVisit"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-earl-campbell-b-1",
            "text": "I was the fifth of 11 children, and two of my brothers later joined me at the same college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-earl-campbell-b-2",
            "text": "My first three college seasons were spent primarily as a fullback in the Wishbone offense.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "texasThrill"
            ]
          },
          {
            "id": "cfb-earl-campbell-b-3",
            "text": "During an injury-plagued junior season, I managed only 653 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "texasThrill"
            ]
          },
          {
            "id": "cfb-earl-campbell-b-4",
            "text": "With a new head coach as a senior, I moved to tailback in an I-formation offense.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "texasThrill"
            ]
          },
          {
            "id": "cfb-earl-campbell-b-5",
            "text": "That season included road games of 222 rushing yards against Texas A&M and 213 against SMU.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "texasThrill"
            ]
          },
          {
            "id": "cfb-earl-campbell-b-6",
            "text": "I recorded ten 100-yard rushing games during my final college season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "texasThrill"
            ]
          },
          {
            "id": "cfb-earl-campbell-b-7",
            "text": "My 1,744 rushing yards set a Southwest Conference record that stood for 16 years.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "texasSpring"
            ]
          },
          {
            "id": "cfb-earl-campbell-b-8",
            "text": "That season ended with the Heisman Trophy and a trip to the Cotton Bowl with Texas.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-earl-campbell-b-9",
            "text": "I became the first Heisman winner in Longhorn history.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-earl-campbell-b-10",
            "text": "Known as the 'Tyler Rose,' I am the Texas running back whose No. 20 was retired.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "texasVisit"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-herschel-walker",
    "name": "Herschel Walker",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/herschel-walker/",
      "ugaHonor": "https://georgiadogs.com/news/2025/5/13/general-walker-diaz-wallace-selected-for-georgias-circle-of-honor",
      "ugaLegend": "https://georgiadogs.com/sports/2017/6/17/sports-m-footbl-spec-rel-geo-legends-walker-html",
      "ugaCamp": "https://georgiadogs.com/news/2002/1/31/Herschel_Walker_Named_Walter_Camp_s_2001_Alumnus_of_the_Year"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-herschel-walker-a-1",
            "text": "I played only three college seasons, and I earned major national recognition in all three.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "ugaHonor"
            ]
          },
          {
            "id": "cfb-herschel-walker-a-2",
            "text": "I was an All-American from my first season on campus.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "ugaHonor"
            ]
          },
          {
            "id": "cfb-herschel-walker-a-3",
            "text": "As a freshman, I rushed for 1,616 yards and 15 touchdowns while my team won the national championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "ugaHonor"
            ]
          },
          {
            "id": "cfb-herschel-walker-a-4",
            "text": "I finished third in the Heisman voting during that freshman title season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "ugaCamp"
            ]
          },
          {
            "id": "cfb-herschel-walker-a-5",
            "text": "As a sophomore, I rushed for 1,891 yards and 20 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ugaCamp"
            ]
          },
          {
            "id": "cfb-herschel-walker-a-6",
            "text": "That second season moved me up to second in the Heisman voting.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "ugaCamp"
            ]
          },
          {
            "id": "cfb-herschel-walker-a-7",
            "text": "As a junior, I rushed for 1,752 yards and won the Heisman Trophy.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ugaCamp",
              "ugaHonor"
            ]
          },
          {
            "id": "cfb-herschel-walker-a-8",
            "text": "I finished my three-year college career with 5,259 rushing yards in the school's current record book.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ugaLegend",
              "ugaHonor"
            ]
          },
          {
            "id": "cfb-herschel-walker-a-9",
            "text": "My No. 34 is one of the retired football jerseys at Georgia.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ugaHonor"
            ]
          },
          {
            "id": "cfb-herschel-walker-a-10",
            "text": "I am the Bulldogs running back who won the 1982 Heisman after finishing third and second the previous two years.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "ugaHonor"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-herschel-walker-b-1",
            "text": "As a high-school senior, I rushed for 3,167 yards while helping my team win its first state championship.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-herschel-walker-b-2",
            "text": "I was also the valedictorian of my high-school class.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-herschel-walker-b-3",
            "text": "My first college season set an NCAA freshman rushing record with 1,616 yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "ugaLegend"
            ]
          },
          {
            "id": "cfb-herschel-walker-b-4",
            "text": "That year, I became the first true freshman named a unanimous All-American.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ugaCamp"
            ]
          },
          {
            "id": "cfb-herschel-walker-b-5",
            "text": "In the national-title Sugar Bowl, I rushed for 150 yards and two touchdowns in a 17-10 win over Notre Dame.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ugaCamp"
            ]
          },
          {
            "id": "cfb-herschel-walker-b-6",
            "text": "I also competed in college track and earned All-America honors as a sprinter.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "ugaCamp"
            ]
          },
          {
            "id": "cfb-herschel-walker-b-7",
            "text": "I finished in the top three of the Heisman voting in all three of my college seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-herschel-walker-b-8",
            "text": "By the end of my career, I owned 41 school records, 16 SEC records and 11 NCAA records.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ugaHonor"
            ]
          },
          {
            "id": "cfb-herschel-walker-b-9",
            "text": "Georgia retired the No. 34 jersey I wore.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ugaHonor"
            ]
          },
          {
            "id": "cfb-herschel-walker-b-10",
            "text": "I am the Georgia running back whose three college seasons culminated with the 1982 Heisman Trophy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "ugaHonor"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-ricky-williams",
    "name": "Ricky Williams",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "heisman": "https://www.heisman.com/heisman-winners/ricky-williams/",
      "texasRetire": "https://texaslonghorns.com/news/2012/2/7/020712aaa_159",
      "texasCotton": "https://texaslonghorns.com/news/2017/12/28/football-ricky-williams-to-be-inducted-into-cotton-bowl-hall-of-fame",
      "texasHall": "https://texaslonghorns.com/news/2010/9/11/091110aaa_917",
      "texasTop": "https://texaslonghorns.com/news/2020/1/9/four-football-legends-named-in-college-footballs-top-150-players-of-all-time"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-ricky-williams-a-1",
            "text": "I began college at fullback and rushed for 990 yards as a freshman.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "texasHall"
            ]
          },
          {
            "id": "cfb-ricky-williams-a-2",
            "text": "As a sophomore, I rushed for 1,272 yards and 12 touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-ricky-williams-a-3",
            "text": "My junior season produced 1,893 rushing yards and 25 touchdowns while I led the nation in rushing.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-ricky-williams-a-4",
            "text": "I finished fifth in the Heisman voting that year, then returned for my senior season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-ricky-williams-a-5",
            "text": "As a senior, I rushed for 2,124 yards and 27 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-ricky-williams-a-6",
            "text": "I became the first player ever to win the Doak Walker Award twice.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "texasRetire"
            ]
          },
          {
            "id": "cfb-ricky-williams-a-7",
            "text": "I finished my career with 6,279 rushing yards and 72 rushing touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "texasRetire",
              "texasCotton"
            ]
          },
          {
            "id": "cfb-ricky-williams-a-8",
            "text": "I left college holding 21 NCAA records and 46 school records.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "texasRetire",
              "texasHall"
            ]
          },
          {
            "id": "cfb-ricky-williams-a-9",
            "text": "I became the second Texas player to win the Heisman Trophy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "texasHall"
            ]
          },
          {
            "id": "cfb-ricky-williams-a-10",
            "text": "Texas later retired the No. 34 jersey I wore.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-ricky-williams-b-1",
            "text": "I left California for college after saying the football culture of my destination appealed to me.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-ricky-williams-b-2",
            "text": "My freshman rushing total broke Earl Campbell's school freshman record.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "texasHall"
            ]
          },
          {
            "id": "cfb-ricky-williams-b-3",
            "text": "I helped my team win the Southwest Conference championship in 1995 and the Big 12 title in 1996.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "texasCotton"
            ]
          },
          {
            "id": "cfb-ricky-williams-b-4",
            "text": "I won back-to-back NCAA rushing titles in 1997 and 1998.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "texasRetire",
              "texasCotton"
            ]
          },
          {
            "id": "cfb-ricky-williams-b-5",
            "text": "In my final home game, a 60-yard touchdown run against Texas A&M broke Tony Dorsett's 22-year-old NCAA career rushing record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "texasTop"
            ]
          },
          {
            "id": "cfb-ricky-williams-b-6",
            "text": "My senior season also brought the Maxwell and Walter Camp national player-of-the-year awards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman",
              "texasRetire"
            ]
          },
          {
            "id": "cfb-ricky-williams-b-7",
            "text": "I won the Heisman with 714 first-place votes and 2,355 total points.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-ricky-williams-b-8",
            "text": "I was the first two-time Doak Walker winner and a two-time unanimous first-team All-American at Texas.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "texasCotton"
            ]
          },
          {
            "id": "cfb-ricky-williams-b-9",
            "text": "I finished my Longhorn career as the NCAA's all-time leading rusher at 6,279 yards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "texasHall",
              "texasCotton"
            ]
          },
          {
            "id": "cfb-ricky-williams-b-10",
            "text": "I am the Texas No. 34 running back who won the 1998 Heisman Trophy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-ladainian-tomlinson",
    "name": "LaDainian Tomlinson",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "nff": "https://footballfoundation.org/honors/college-football-hall-of-fame/ladainian-tomlinson/2370",
      "tcuLegacy": "https://gofrogs.com/news/2014/10/2/Tomlinson_s_Legacy_Lingers_at_TCU",
      "tcuDoak": "https://gofrogs.com/news/2000/12/9/tcu_s_ladainian_tomlinson_named_winner_of_the_2000_doak_walker_award_presented_by_vectrix",
      "tcuHonor": "https://gofrogs.com/news/2005/11/30/Footage_from_LT_Day_now_available",
      "tcuHistory": "https://gofrogs.com/documents/download/2018/7/31/06_mg_section_7.pdf",
      "tcu1998": "https://gofrogs.com/news/2000/12/14/From_1_10_to_10_1_Frogs_to_Play_in_Mobile_Alabama_Bowl"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-ladainian-tomlinson-a-1",
            "text": "I rushed for 538 yards as a college freshman and 717 as a sophomore.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tcuHistory"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-a-2",
            "text": "My junior season was the breakout: 1,850 rushing yards and 18 touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tcuHistory"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-a-3",
            "text": "That year, I set an NCAA single-game record with 406 rushing yards against UTEP.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "tcuLegacy"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-a-4",
            "text": "I followed with 2,158 rushing yards and 22 touchdowns as a senior.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tcuHistory"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-a-5",
            "text": "I led the nation in rushing in both of my final two college seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "tcuLegacy"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-a-6",
            "text": "I won the Doak Walker Award as the nation's top running back in my senior season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "tcuDoak"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-a-7",
            "text": "I finished fourth in the Heisman Trophy voting that year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "tcuLegacy"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-a-8",
            "text": "I ended my career with 5,263 rushing yards and 54 rushing touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tcuHistory",
              "tcuHonor"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-a-9",
            "text": "I became the all-time leading rusher in TCU and conference history at the time.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-a-10",
            "text": "I wore No. 5 for TCU, a jersey the school later honored so it could not be worn again without my permission.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "tcuHonor"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-ladainian-tomlinson-b-1",
            "text": "My first two college seasons totaled 1,255 rushing yards before I became a national star.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tcuHistory"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-b-2",
            "text": "As a sophomore, I started games at both fullback and tailback.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tcu1998"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-b-3",
            "text": "That sophomore team won seven games and upset USC in the Sun Bowl.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tcuLegacy"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-b-4",
            "text": "The next season, my team recovered from a 1-3 start to finish 7-1 down the stretch and earn a share of its conference championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tcuLegacy"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-b-5",
            "text": "During that run, I rushed for 406 yards on 43 carries in one game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "tcuLegacy"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-b-6",
            "text": "That performance also included an NCAA-record 287 rushing yards in one half.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-b-7",
            "text": "My senior team reached 10 wins for the first time in school history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tcuLegacy"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-b-8",
            "text": "I closed my career with consecutive national rushing titles and the 2000 Doak Walker Award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "tcuDoak"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-b-9",
            "text": "TCU later honored the No. 5 jersey I wore for four seasons.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tcuHonor"
            ]
          },
          {
            "id": "cfb-ladainian-tomlinson-b-10",
            "text": "I am the Horned Frogs running back who ran for 406 yards in a game and finished fourth for the 2000 Heisman.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "tcuLegacy"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "cam-newton",
    "name": "Cam Newton",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "rookie": "https://www.panthers.com/news/newton-earns-major-rookie-awards-6904440",
      "career": "https://www.panthers.com/news/carolina-panthers-release-qb-cam-newton",
      "return": "https://www.panthers.com/news/panthers-agree-to-terms-with-cam-newton",
      "auburn": "https://auburntigers.com/sports/football/roster/player/cam-newton"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-cam-newton-a-1",
            "text": "My running ability was a major part of my NFL game from the moment I became a starting quarterback.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "rookie",
              "career"
            ]
          },
          {
            "id": "nfl-cam-newton-a-2",
            "text": "I won AP Offensive Rookie of the Year after starting immediately as a first-year quarterback.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "rookie"
            ]
          },
          {
            "id": "nfl-cam-newton-a-3",
            "text": "My rookie season combined high-volume passing with record-setting production as a runner.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "rookie",
              "career"
            ]
          },
          {
            "id": "nfl-cam-newton-a-4",
            "text": "I earned three Pro Bowl selections during my first run with the franchise that drafted me.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "nfl-cam-newton-a-5",
            "text": "As a rookie, I became the first quarterback in NFL history to pass for 4,000 yards and rush for 500 yards in the same season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "rookie",
              "career"
            ]
          },
          {
            "id": "nfl-cam-newton-a-6",
            "text": "That rookie season also included 14 rushing touchdowns, then an NFL single-season record for a quarterback.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "rookie",
              "career"
            ]
          },
          {
            "id": "nfl-cam-newton-a-7",
            "text": "In 2015, I threw 35 touchdown passes and rushed for 10 more while my team finished 15-1.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "nfl-cam-newton-a-8",
            "text": "That 2015 season made me the first player in franchise history to win the AP NFL MVP award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "nfl-cam-newton-a-9",
            "text": "I was the No. 1 overall pick in the 2011 NFL Draft and became my franchise's all-time leader in passing yards and passing touchdowns.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "nfl-cam-newton-a-10",
            "text": "I am the former Auburn Heisman winner who took Carolina to Super Bowl 50 after an MVP season.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "auburn",
              "career"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-cam-newton-b-1",
            "text": "My path to the NFL included multiple college stops before one final season made me a top professional prospect.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "auburn"
            ]
          },
          {
            "id": "nfl-cam-newton-b-2",
            "text": "I arrived at my final college stop as a transfer and became its starting quarterback for one season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "auburn"
            ]
          },
          {
            "id": "nfl-cam-newton-b-3",
            "text": "That season, my offense leaned heavily on me as both a passer and a runner.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "auburn"
            ]
          },
          {
            "id": "nfl-cam-newton-b-4",
            "text": "I entered the NFL as the first overall draft pick and immediately became a full-time starter.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "rookie",
              "career"
            ]
          },
          {
            "id": "nfl-cam-newton-b-5",
            "text": "I spent nine seasons with my original NFL team before being released in 2020.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "nfl-cam-newton-b-6",
            "text": "When that first run ended, I was the franchise's career leader in passing yards and passing touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "nfl-cam-newton-b-7",
            "text": "My next NFL stop was New England, where I rushed for 12 touchdowns in 15 starts.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "return"
            ]
          },
          {
            "id": "nfl-cam-newton-b-8",
            "text": "I returned to my original franchise during the 2021 season after it needed help at quarterback.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "return"
            ]
          },
          {
            "id": "nfl-cam-newton-b-9",
            "text": "My lone season at Auburn ended 14-0 with the Heisman Trophy, an SEC championship and a national championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "auburn"
            ]
          },
          {
            "id": "nfl-cam-newton-b-10",
            "text": "I am the quarterback who paired that Auburn title run with the 2015 NFL MVP and a trip to Super Bowl 50 with Carolina.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "auburn",
              "career"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "peyton-manning",
    "name": "Peyton Manning",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/peyton-manning"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-peyton-manning-a-1",
            "text": "I played 18 NFL seasons at quarterback and spent significant stretches with two different franchises.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-2",
            "text": "I was a durable pocket passer who started every game for more than a decade before an injury interrupted my career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-3",
            "text": "I produced 14 seasons with at least 4,000 passing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-4",
            "text": "I remained with my first NFL franchise through the 2011 season before changing teams late in my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-5",
            "text": "In 2004, I set the NFL single-season record with 49 touchdown passes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-6",
            "text": "I was named AP NFL MVP five times.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-7",
            "text": "I eventually appeared in four Super Bowls with four different head coaches.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-8",
            "text": "In 2013, I set single-season NFL records with 5,477 passing yards and 55 touchdown passes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-9",
            "text": "I was named Super Bowl XLI MVP after beating Chicago for my first championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-10",
            "text": "I am the Colts-and-Broncos quarterback who won five league MVP awards and finished my career by winning Super Bowl 50.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-peyton-manning-b-1",
            "text": "I entered the NFL as a first-round quarterback after playing at an SEC school.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-2",
            "text": "As a rookie, I started all 16 games and set multiple league rookie passing records.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-3",
            "text": "My first NFL franchise kept me at quarterback for more than a decade.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-4",
            "text": "After the 2006 regular season, I helped erase a 21-3 deficit against New England to reach my first Super Bowl.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-5",
            "text": "That trip ended with a victory over Chicago and a Super Bowl MVP award.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-6",
            "text": "A neck injury forced me to miss the entire 2011 season and ended my 208-start opening streak.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-7",
            "text": "I signed with Denver in 2012 and immediately earned Comeback Player of the Year and first-team All-Pro honors.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-8",
            "text": "Indianapolis had selected me first overall in the 1998 NFL Draft.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-9",
            "text": "My second Denver season produced 5,477 passing yards and 55 touchdown passes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-10",
            "text": "I am the former Tennessee quarterback who starred for Indianapolis, finished with Denver and ended his career by winning Super Bowl 50.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-jerry-rice",
    "name": "Jerry Rice",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/jerry-rice",
      "draft": "https://www.49ers.com/news/the-best-draft-picks-in-san-francisco-49ers-history-15196786"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-jerry-rice-a-1",
            "text": "I was a first-round wide receiver who built a career that lasted 20 NFL seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-2",
            "text": "My first 1,000-yard season began a streak that eventually reached 11 straight years.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-3",
            "text": "By my second NFL season, I was already leading the league in both receiving yards and touchdown catches.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-4",
            "text": "I eventually led the NFL in receiving yards six different times.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-5",
            "text": "That second season included 1,570 receiving yards and 15 touchdown catches.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-6",
            "text": "In 1987, I set an NFL record with 22 touchdown receptions in a 12-game season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-7",
            "text": "In 1995, I set an NFL single-season receiving record with 1,848 yards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-8",
            "text": "I won three Super Bowl rings with the franchise that drafted me and was the MVP of Super Bowl XXIII.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-9",
            "text": "I finished with 1,549 receptions and 22,895 receiving yards, both NFL career records when I retired.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-10",
            "text": "I am the San Francisco receiver who was selected to 13 Pro Bowls and became the league's career leader in receptions and receiving yards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-jerry-rice-b-1",
            "text": "I played college football outside the major conferences before becoming a first-round NFL receiver.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "draft"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-2",
            "text": "As a rookie, I caught 49 passes for 927 yards and three touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-3",
            "text": "My first 100-catch NFL season came several years into my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-4",
            "text": "I recorded 14 different 1,000-yard receiving seasons over my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-5",
            "text": "My career included eight conference championship games and four Super Bowl appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-6",
            "text": "Three of those Super Bowl appearances ended with championships for my original franchise.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-7",
            "text": "After my long run with one franchise, I also played for Oakland and Seattle.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-8",
            "text": "San Francisco selected me 16th overall in 1985 out of Mississippi Valley State.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "draft",
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-9",
            "text": "I was the MVP of Super Bowl XXIII after catching 11 passes for 215 yards and a touchdown.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-10",
            "text": "I am the Mississippi Valley State product whose NFL career reached 208 total touchdowns and 22,895 receiving yards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-randy-moss",
    "name": "Randy Moss",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/randy-moss"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-randy-moss-a-1",
            "text": "I was a first-round wide receiver who played 14 NFL seasons for multiple franchises.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-2",
            "text": "In my NFL debut, I caught four passes for 95 yards and two touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-3",
            "text": "I led the NFL in touchdown receptions during my rookie season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-4",
            "text": "That rookie season ended with AP Offensive Rookie of the Year honors.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-5",
            "text": "My rookie total was 17 touchdown catches, breaking the previous NFL rookie record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-6",
            "text": "In 2007, I set an NFL single-season record with 23 touchdown catches.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-7",
            "text": "That record season came for a team that finished the regular season 16-0.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-8",
            "text": "I produced 10 seasons with at least 1,000 receiving yards and nine with at least 10 touchdown catches.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-9",
            "text": "I finished my career with 156 receiving touchdowns, second-most in NFL history at the time I retired.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-10",
            "text": "I am the Marshall receiver Minnesota drafted 21st overall who later caught 23 touchdown passes for New England.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-randy-moss-b-1",
            "text": "I was a two-time consensus All-American before entering the NFL from a smaller college program.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-b-2",
            "text": "I entered the league as a first-round receiver after that decorated college career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-b-3",
            "text": "My first NFL team set a then-league record for points in my rookie season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-b-4",
            "text": "I eventually ranked second in my original franchise's history in receptions, receiving yards and touchdown catches behind Cris Carter.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-b-5",
            "text": "After my first long NFL stop, I spent two seasons with Oakland.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-b-6",
            "text": "In 2010 alone, I appeared for three different teams.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-b-7",
            "text": "My career later included New England, a return to Minnesota, Tennessee and finally San Francisco.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-b-8",
            "text": "Marshall was my college, and Minnesota selected me 21st overall in the 1998 draft.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-b-9",
            "text": "I reached the Super Bowl with both New England and San Francisco.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-b-10",
            "text": "I am the Hall of Fame deep threat who starred for Minnesota and New England and finished with 15,292 receiving yards and 156 touchdown catches.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "barry-sanders",
    "name": "Barry Sanders",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/barry-sanders"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-barry-sanders-a-1",
            "text": "I spent my entire NFL career at running back with one franchise.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-2",
            "text": "I rushed for more than 1,000 yards in every season I played.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-3",
            "text": "I was named either first- or second-team All-Pro in each of my 10 NFL seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-4",
            "text": "I led the NFL in rushing four times during my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-5",
            "text": "I became the first NFL running back to record five 1,500-yard rushing seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-6",
            "text": "In 1997, I rushed for 2,053 yards and added another 305 yards receiving.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-7",
            "text": "That season included an NFL-record 14 consecutive regular-season games with at least 100 rushing yards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-8",
            "text": "I was named league MVP for that 1997 season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-9",
            "text": "I made the Pro Bowl in all 10 seasons of my career.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-10",
            "text": "I am the Detroit running back who retired after 10 seasons with 15,269 rushing yards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-barry-sanders-b-1",
            "text": "I was known for a low running style, sudden direction changes and elusiveness rather than overwhelming size.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-2",
            "text": "My first NFL carry went for 18 yards only three days after I signed my rookie contract.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-3",
            "text": "As a rookie, I rushed for 1,470 yards and finished only 10 yards short of the league lead.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-4",
            "text": "In 1994, I rushed for 1,883 yards and finished with 2,166 yards from scrimmage.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-5",
            "text": "I later became the only back at the time to post four consecutive 1,500-yard rushing seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-6",
            "text": "The year before I entered the NFL, I won the Heisman Trophy at Oklahoma State.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-7",
            "text": "Detroit selected me third overall in the 1989 draft after I left college before my senior season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-8",
            "text": "My peak rushing season reached 2,053 yards and 2,358 yards from scrimmage.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-9",
            "text": "Every one of my NFL seasons from 1989 through 1998 came with Detroit.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-10",
            "text": "I am the Oklahoma State Heisman winner who became a 10-time Pro Bowler and finished with 15,269 NFL rushing yards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "deion-sanders",
    "name": "Deion Sanders",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/deion-sanders"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-deion-sanders-a-1",
            "text": "I entered the NFL as a first-round defensive back who also had immediate value in the return game.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-2",
            "text": "I returned a punt 68 yards for a touchdown in my first NFL game.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-3",
            "text": "My 14-season career eventually included five different NFL franchises.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-4",
            "text": "I earned nine first-team All-Pro selections at cornerback.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-5",
            "text": "I finished my career with 53 interceptions and returned nine of them for touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-6",
            "text": "In one season, I gained 303 yards on six interception returns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-7",
            "text": "Three of those interceptions went for touchdowns, including two returns of at least 90 yards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-8",
            "text": "That season ended with NFL Defensive Player of the Year honors.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-9",
            "text": "I won Super Bowls with San Francisco and Dallas in back-to-back seasons.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-10",
            "text": "I am the Florida State cornerback Atlanta drafted fifth overall in 1989 who became one of the era's defining shutdown corners.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-deion-sanders-b-1",
            "text": "My NFL role extended beyond cornerback because I also contributed on returns and took snaps at wide receiver.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-2",
            "text": "I contributed on offense during my career rather than playing only defense and special teams.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-3",
            "text": "I scored touchdowns on both punt returns and kickoff returns during my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-4",
            "text": "In 1998, I led the NFL in punt-return average.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-5",
            "text": "I made the NFL's 1990s All-Decade Team at both cornerback and punt returner.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-6",
            "text": "My return-game career included six punt-return touchdowns and three kickoff-return touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-7",
            "text": "After retiring for three seasons, I returned to play for Baltimore and intercepted five passes over two seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-8",
            "text": "My NFL path ran through Atlanta, San Francisco, Dallas, Washington and Baltimore.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-9",
            "text": "My lone San Francisco season ended with Defensive Player of the Year honors and a Super Bowl title before I won another championship with Dallas the next year.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-10",
            "text": "I am the two-time Super Bowl champion who combined 53 career interceptions with elite cornerback, return and offensive versatility.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "lawrence-taylor",
    "name": "Lawrence Taylor",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/lawrence-taylor"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-lawrence-taylor-a-1",
            "text": "I entered the NFL as a top-two draft pick at linebacker.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-a-2",
            "text": "My rookie season immediately showed that I could affect games as both a tackler and a pass rusher.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-a-3",
            "text": "I was named first-team All-Pro in each of my first nine NFL seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-a-4",
            "text": "My attacking style helped redefine outside linebacker from a read-and-react role into a pressure position.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-a-5",
            "text": "My rookie year included 133 tackles, 9.5 sacks, two forced fumbles and an interception.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-a-6",
            "text": "In 1986, I recorded a career-high 20.5 sacks.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-a-7",
            "text": "That season I became the first defensive player since 1971 to win the NFL MVP award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-a-8",
            "text": "My official career sack total was 132.5, not counting the 9.5 from my rookie year before sacks became an official NFL statistic.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-a-9",
            "text": "I was selected to 10 Pro Bowls during a 13-season career.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-a-10",
            "text": "I am the Giants linebacker drafted second overall from North Carolina who won league MVP in 1986.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-lawrence-taylor-b-1",
            "text": "I was an All-America linebacker before becoming one of the first players chosen in my draft.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-2",
            "text": "I spent my entire 13-season NFL career with one franchise.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-3",
            "text": "My team became a regular playoff participant after a long drought early in my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-4",
            "text": "In a 1988 game, I played through a torn pectoral muscle with a shoulder harness and recorded three sacks and two forced fumbles.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-5",
            "text": "My career totals included 33 forced fumbles and nine interceptions in addition to my pass-rushing production.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-6",
            "text": "The Giants won two Super Bowls during my career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-7",
            "text": "The Giants selected me second overall in the 1981 NFL Draft.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-8",
            "text": "My signature statistical season produced 20.5 sacks in 1986.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-9",
            "text": "That same year, I won NFL MVP as a defensive player.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-10",
            "text": "I am the Hall of Fame Giants outside linebacker whose aggressive edge-rushing style helped change how the position was played.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-aaron-donald",
    "name": "Aaron Donald",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "pitt": "https://pittsburghpanthers.com/sports/football/roster/aaron-donald/1442",
      "draft": "https://www.therams.com/news/countdown-to-the-draft-2014-rams-aaron-donald",
      "dpoy": "https://www.therams.com/news/aaron-donald-named-ap-defensive-player-of-the-year-2020",
      "career": "https://www.therams.com/team/players-roster/aaron-donald/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-aaron-donald-a-1",
            "text": "I entered the NFL as an interior defensive lineman whose size caused some teams to question how early I should be drafted.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "draft"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-2",
            "text": "I was still selected in the first half of the first round despite those size and length concerns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "draft"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-3",
            "text": "As a rookie, I set a franchise rookie sack record and won AP Defensive Rookie of the Year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "draft",
              "career"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-4",
            "text": "I led my franchise in sacks every season from 2015 through 2019.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "draft"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-5",
            "text": "I won my first AP Defensive Player of the Year award in 2017.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "dpoy",
              "career"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-6",
            "text": "In 2018, I recorded 20.5 sacks, a franchise record and a historic total for an interior defender.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "draft",
              "career"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-7",
            "text": "Those 2017 and 2018 seasons made me a back-to-back Defensive Player of the Year winner.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "draft",
              "dpoy"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-8",
            "text": "I won the award a third time for the 2020 season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "dpoy",
              "career"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-9",
            "text": "That third award put me alongside only two other three-time winners in the history of the honor.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "dpoy",
              "career"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-10",
            "text": "I am the Rams defensive tackle who won three AP Defensive Player of the Year awards and made the game-sealing defensive stop in Super Bowl LVI.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-aaron-donald-b-1",
            "text": "I grew up in Western Pennsylvania and stayed in the region for college football.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "pitt"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-2",
            "text": "In my final college season, I recorded 11 sacks and 28.5 tackles for loss.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "draft"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-3",
            "text": "My first NFL season ended with Defensive Rookie of the Year honors and a franchise rookie sack record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "draft",
              "career"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-4",
            "text": "I made the Pro Bowl in each of my first 10 NFL seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-5",
            "text": "Across those first 10 NFL seasons, I earned eight first-team All-Pro selections.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-6",
            "text": "Before entering the NFL, I won the Nagurski, Bednarik, Outland and Lombardi awards in the same college season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "pitt"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-7",
            "text": "The Rams selected me 13th overall in the 2014 NFL Draft.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "draft"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-8",
            "text": "I was a unanimous selection to the NFL's 2010s All-Decade Team.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "career"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-9",
            "text": "I became a three-time AP Defensive Player of the Year, winning for 2017, 2018 and 2020.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "dpoy",
              "career"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-10",
            "text": "I am the Pitt defensive tackle drafted 13th overall by the Rams who later helped seal a Super Bowl LVI championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "draft",
              "career"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "brett-favre",
    "name": "Brett Favre",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/brett-favre"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-brett-favre-a-1",
            "text": "I played quarterback for 20 NFL seasons and became especially known for durability and an aggressive passing style.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-a-2",
            "text": "After seeing little action as a rookie, I changed teams before my second professional season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-a-3",
            "text": "My first full season with that new team began an NFL-record run of 18 straight seasons with at least 3,000 passing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-a-4",
            "text": "I made 11 Pro Bowls during my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-a-5",
            "text": "In the mid-1990s, I led my team to three consecutive conference championship games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-a-6",
            "text": "I won the NFL MVP award in three consecutive seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-a-7",
            "text": "During that run, I led the NFL in touchdown passes for three straight seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-a-8",
            "text": "One of those seasons ended with a Super Bowl championship over New England.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-a-9",
            "text": "I eventually started a record 299 consecutive regular-season games.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-a-10",
            "text": "I am the longtime Green Bay quarterback who won three straight MVPs and later played for the Jets and Vikings.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-brett-favre-b-1",
            "text": "I started four years at quarterback for a college program outside the major power conferences.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-b-2",
            "text": "I entered the NFL as a second-round pick and barely played for the team that drafted me.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-b-3",
            "text": "That team traded me after one season in exchange for a first-round pick.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-b-4",
            "text": "An injury to the incumbent starter gave me my first major opportunity with my second NFL franchise.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-b-5",
            "text": "By the end of my final season with that franchise, I had become the NFL career leader in attempts, completions, passing yards and touchdown passes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-b-6",
            "text": "I spent the following season with the New York Jets.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-b-7",
            "text": "At age 40, I threw for 4,202 yards, 33 touchdowns and only seven interceptions while reaching another conference title game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-b-8",
            "text": "That late-career run came with Minnesota after 16 seasons in Green Bay.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-b-9",
            "text": "Atlanta drafted me 33rd overall out of Southern Miss before Green Bay traded a first-round pick for me.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-brett-favre-b-10",
            "text": "I am the quarterback whose path ran from Atlanta to Green Bay to the Jets and Vikings before ending with 71,838 passing yards and 508 touchdowns.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "joe-montana",
    "name": "Joe Montana",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/joe-montana"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-joe-montana-a-1",
            "text": "I was a quarterback whose reputation was built heavily on late-game execution and postseason success.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-a-2",
            "text": "Across my career, I directed 26 fourth-quarter comeback victories.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-a-3",
            "text": "I led my conference in passer rating five different times.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-a-4",
            "text": "At my peak, I set a then-NFL single-season record for passer rating.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-a-5",
            "text": "I led teams to the playoffs 11 times and won nine division championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-a-6",
            "text": "In 1989, my 112.4 passer rating set that league record.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-a-7",
            "text": "I won four Super Bowl championships without losing one as a starting quarterback.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-a-8",
            "text": "I was named Super Bowl MVP three times.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-a-9",
            "text": "One championship run included a 92-yard drive in the closing minutes to beat Cincinnati.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-a-10",
            "text": "I am the San Francisco quarterback whose four titles and late-game comebacks became central to the 49ers dynasty.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-joe-montana-b-1",
            "text": "I entered the NFL as a third-round quarterback rather than a top draft pick.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-b-2",
            "text": "I spent most of my career with one franchise before being traded late in my playing days.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-b-3",
            "text": "My final two NFL seasons came with a second team in the AFC.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-b-4",
            "text": "In my first season after that trade, I led my new team to the AFC Championship Game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-b-5",
            "text": "In my final season, I became only the fifth quarterback in NFL history to pass for more than 40,000 career yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-b-6",
            "text": "My career included two AP NFL MVP awards and eight Pro Bowl selections.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-b-7",
            "text": "The team that drafted me was San Francisco, which selected me in the third round in 1979.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-b-8",
            "text": "My late-career destination was Kansas City, where I immediately made a conference title game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-b-9",
            "text": "With the 49ers, I won Super Bowls XVI, XIX, XXIII and XXIV.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-montana-b-10",
            "text": "I am the Hall of Fame quarterback who starred for San Francisco before finishing with the Chiefs and retired with 40,551 passing yards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "john-elway",
    "name": "John Elway",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/john-elway"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-john-elway-a-1",
            "text": "I spent 16 NFL seasons at quarterback with one franchise.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-a-2",
            "text": "My career became strongly associated with fourth-quarter comebacks and late-game drives.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-a-3",
            "text": "I produced 47 fourth-quarter game-winning or game-tying drives.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-a-4",
            "text": "I repeatedly led my team deep into the playoffs, including multiple conference championship victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-a-5",
            "text": "In one AFC title game, I directed a 98-yard touchdown drive to force overtime.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-a-6",
            "text": "I won the NFL MVP award in 1987.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-a-7",
            "text": "I led my team to five victories in six AFC Championship Games.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-a-8",
            "text": "Late in my career, I finally won a Super Bowl after several earlier appearances had ended in defeat.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-a-9",
            "text": "I followed that first championship by winning another Super Bowl the next season and earning game MVP honors.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-a-10",
            "text": "I am the Denver quarterback whose 98-yard 'Drive' became iconic before he closed his career with back-to-back Super Bowl victories.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-john-elway-b-1",
            "text": "I was a first-round quarterback who never played for the NFL team that originally selected me.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-b-2",
            "text": "The team that drafted me dealt me away immediately in a package that included established players and a future first-round pick.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-b-3",
            "text": "My game included unusual rushing production for a high-volume passer of my era.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-b-4",
            "text": "For seven straight seasons, I paired at least 3,000 passing yards with at least 200 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-b-5",
            "text": "That dual-threat production eventually put me over both 40,000 career passing yards and 3,000 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-b-6",
            "text": "Across my career, I was responsible for 334 touchdowns as a passer, runner and receiver.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-b-7",
            "text": "Baltimore selected me in the first round of the 1983 draft before trading me to Denver.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-b-8",
            "text": "I was selected to nine Pro Bowls during my 16-year career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-b-9",
            "text": "My final NFL season ended with a Super Bowl XXXIII victory and the game's MVP award.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-elway-b-10",
            "text": "I am the quarterback Baltimore drafted before the trade to Denver, where I became the franchise's longtime star and a two-time Super Bowl champion.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "emmitt-smith",
    "name": "Emmitt Smith",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/emmitt-smith"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-emmitt-smith-a-1",
            "text": "I was a first-round running back who joined a rebuilding NFL team and quickly became the center of its offense.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-a-2",
            "text": "As a rookie, I won Offensive Rookie of the Year after rushing for 937 yards and 11 touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-a-3",
            "text": "Beginning in my second season, I won four NFL rushing titles in a five-year span.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-a-4",
            "text": "I also led the league in rushing touchdowns three times during that stretch.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-a-5",
            "text": "My team won three Super Bowls in four seasons during the early 1990s.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-a-6",
            "text": "In 1993, I won the NFL MVP award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-a-7",
            "text": "That same championship season ended with me winning Super Bowl MVP.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-a-8",
            "text": "I put together 11 consecutive 1,000-yard rushing seasons after narrowly missing the mark as a rookie.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-a-9",
            "text": "I retired as the NFL's all-time leader with 18,355 rushing yards and a record 164 rushing touchdowns.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-a-10",
            "text": "I am the Dallas running back who powered three Super Bowl teams and finished as the NFL's career rushing leader.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-emmitt-smith-b-1",
            "text": "I entered my rookie season after holding out through training camp and the preseason.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-b-2",
            "text": "I still reported in time to start the regular season and immediately became a major part of the offense.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-b-3",
            "text": "My first NFL season ended with a Pro Bowl selection and the league's offensive rookie award.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-b-4",
            "text": "My peak rushing season produced career highs in both rushing yards and rushing touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-b-5",
            "text": "That peak season reached 1,773 rushing yards and 25 rushing touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-b-6",
            "text": "In 2002, I passed the previous NFL career rushing leader during a game against Seattle.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-b-7",
            "text": "I played two final seasons with Arizona after my long run with my original franchise.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-b-8",
            "text": "Dallas had drafted me in the first round in 1990 out of Florida.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-b-9",
            "text": "The player whose rushing record I passed was Walter Payton.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-emmitt-smith-b-10",
            "text": "I am the former Florida back who became Dallas' all-time workhorse and finished with 18,355 NFL rushing yards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "walter-payton",
    "name": "Walter Payton",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/walter-payton"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-walter-payton-a-1",
            "text": "I spent 13 NFL seasons at running back with one franchise.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-a-2",
            "text": "Durability became one of my defining traits, including a streak of 178 consecutive starts when postseason games are included.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-a-3",
            "text": "For five straight seasons, I led my conference in rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-a-4",
            "text": "I produced 10 seasons with at least 1,500 yards from scrimmage.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-a-5",
            "text": "In 1977, I set an NFL single-game record with 275 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-a-6",
            "text": "That same season, I won the NFL MVP and Offensive Player of the Year awards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-a-7",
            "text": "My versatility extended beyond rushing: I scored touchdowns as a runner, receiver and passer.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-a-8",
            "text": "In 1985, I produced more than 2,000 yards from scrimmage for a 15-1 championship team.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-a-9",
            "text": "When I retired, I held the NFL career records for rushing yards, rushing touchdowns and yards from scrimmage.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-a-10",
            "text": "I am the Chicago running back whose 1985 Bears won Super Bowl XX and whose career rushing record stood until 2002.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-walter-payton-b-1",
            "text": "I entered the NFL as a top-five running back pick after starring at a smaller college program.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-b-2",
            "text": "At about 5-foot-10 and 200 pounds, I built a reputation around toughness, balance and all-around production.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-b-3",
            "text": "I was selected to the NFL's All-Decade Team for both the 1970s and the 1980s.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-b-4",
            "text": "I became one of the most productive receiving backs of my era as well as an elite runner.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-b-5",
            "text": "I eventually recorded 492 career receptions, a record for a running back when I retired.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-b-6",
            "text": "My career production included 110 rushing touchdowns, 15 receiving touchdowns and eight touchdown passes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-b-7",
            "text": "I made nine Pro Bowls and was a seven-time All-Pro.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-b-8",
            "text": "Chicago selected me fourth overall in 1975 after I rushed for 3,563 yards at Jackson State.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-b-9",
            "text": "I retired with 16,726 rushing yards, then the most in league history.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-walter-payton-b-10",
            "text": "I am the Jackson State star whose all-purpose Chicago career ended with the NFL rushing record and a Super Bowl XX championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-ray-lewis",
    "name": "Ray Lewis",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/ray-lewis"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-ray-lewis-a-1",
            "text": "I was a first-round linebacker whose range and tackling quickly became defining parts of my NFL identity.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-a-2",
            "text": "I led my team in tackles as a rookie and eventually did so in most of my professional seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-a-3",
            "text": "My franchise credited me with more than 2,600 career tackles.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-a-4",
            "text": "One of my defenses set major league records for points and rushing yards allowed over a 16-game season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-a-5",
            "text": "That unit allowed only 165 points and 970 rushing yards while recording four shutouts.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-a-6",
            "text": "I won AP Defensive Player of the Year twice.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-a-7",
            "text": "My first title run ended with me earning Super Bowl MVP honors.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-a-8",
            "text": "I became the only player in NFL history with at least 40 career sacks and 30 career interceptions.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-a-9",
            "text": "My final NFL game ended with Baltimore winning Super Bowl XLVII.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-a-10",
            "text": "I am the Ravens linebacker who spent 17 seasons in Baltimore, won two Defensive Player of the Year awards and was MVP of Super Bowl XXXV.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-ray-lewis-b-1",
            "text": "I entered the league as a first-round linebacker after a decorated college career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-b-2",
            "text": "I was one of the first draft picks ever made by a newly established franchise.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-b-3",
            "text": "I spent 17 seasons with that same team and played 228 regular-season games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-b-4",
            "text": "My career included 12 Pro Bowl selections and eight first-team All-Pro honors.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-b-5",
            "text": "In 2003, I recorded a franchise-record 225 tackles and won another major defensive award.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-b-6",
            "text": "A torn triceps interrupted my final regular season, but I returned for the playoffs.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-b-7",
            "text": "That comeback ended with a Super Bowl victory in the final game of my career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-b-8",
            "text": "Baltimore selected me 26th overall in 1996 out of Miami.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-b-9",
            "text": "My career totals included 41.5 sacks and 31 interceptions.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ray-lewis-b-10",
            "text": "I am the Miami linebacker drafted by Baltimore who became the face of the Ravens defense for 17 seasons.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-ed-reed",
    "name": "Ed Reed",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/ed-reed"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-ed-reed-a-1",
            "text": "I was a first-round safety who immediately became a ball-hawking part of an established defense.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-a-2",
            "text": "As a rookie, I started all 16 games and intercepted five passes.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-a-3",
            "text": "I led my team in interceptions during seven of my 11 seasons with that franchise.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-a-4",
            "text": "In 2004, I intercepted nine passes and returned them for 358 yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-a-5",
            "text": "That season ended with AP Defensive Player of the Year honors.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-a-6",
            "text": "I led the NFL in interceptions three different times.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-a-7",
            "text": "I finished with 64 career interceptions and seven interception-return touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-a-8",
            "text": "My 1,590 career interception-return yards became an NFL record.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-a-9",
            "text": "I won Super Bowl XLVII after recording an interception in the championship game.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-a-10",
            "text": "I am the Baltimore safety from Miami whose range and return ability produced 61 Ravens interceptions and a Defensive Player of the Year award.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-ed-reed-b-1",
            "text": "My pro career eventually ended with a season split between two AFC teams.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-b-2",
            "text": "Before that final season, I spent 11 years with one franchise.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-b-3",
            "text": "I left my original franchise after 11 seasons and signed with Houston.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-b-4",
            "text": "After seven games there, I finished that final season with the New York Jets.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-b-5",
            "text": "My original franchise won four division titles and reached three conference championship games during my final seven seasons there.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-b-6",
            "text": "Baltimore selected me 24th overall in 2002 out of Miami.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-b-7",
            "text": "I own the NFL records for the two longest interception returns, at 107 and 106 yards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-b-8",
            "text": "I made nine Pro Bowls and was named All-Pro six times.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-b-9",
            "text": "In Super Bowl XLVII, I recorded five tackles, an interception and a pass defended in Baltimore's win over San Francisco.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ed-reed-b-10",
            "text": "I am the former Miami safety whose Baltimore career made me the Ravens' all-time interception leader with 61.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "ladainian-tomlinson",
    "name": "LaDainian Tomlinson",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/ladainian-tomlinson"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-ladainian-tomlinson-a-1",
            "text": "I was a top-five draft pick at running back who immediately became a heavy-volume NFL starter.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-a-2",
            "text": "My first eight professional seasons each included at least 1,000 rushing yards.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-a-3",
            "text": "I also became unusually productive as a receiver for a featured running back.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-a-4",
            "text": "In one season, I became a 100-catch running back and added four receiving touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-a-5",
            "text": "I scored at least 10 rushing touchdowns in every season of my first nine-year NFL stop.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-a-6",
            "text": "Across 2004 and 2005, I tied an NFL record by scoring a touchdown in 18 consecutive games.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-a-7",
            "text": "In 2006, I rushed for 1,815 yards and 28 touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-a-8",
            "text": "That MVP season ended with NFL records of 31 total touchdowns and 186 points.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-a-9",
            "text": "I finished with 13,684 rushing yards and 145 rushing touchdowns.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-a-10",
            "text": "I am the Chargers running back whose 2006 MVP season produced a record 31 touchdowns before I finished my career with the Jets.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-ladainian-tomlinson-b-1",
            "text": "I reached the NFL after a college career built around historic rushing production.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-b-2",
            "text": "I immediately became a high-volume runner and pass catcher as a rookie.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-b-3",
            "text": "My rookie season ended with 1,236 rushing yards and 10 rushing touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-b-4",
            "text": "I caught at least 50 passes in nine of my 11 professional seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-b-5",
            "text": "In college, I once set an NCAA single-game rushing record with 406 yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-b-6",
            "text": "My San Diego teams won five division titles in a six-season span.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-b-7",
            "text": "After nine seasons with the Chargers, I signed with the New York Jets and played two more years.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-b-8",
            "text": "San Diego selected me fifth overall in the 2001 NFL Draft.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-b-9",
            "text": "I finished with 163 total touchdowns and 18,456 yards from scrimmage.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-ladainian-tomlinson-b-10",
            "text": "I am the TCU star drafted fifth overall by San Diego who became a five-time Pro Bowler and the 2006 NFL MVP.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-michael-vick",
    "name": "Michael Vick",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "vt": "https://hokiesports.com/news/2025/01/15/virginia-tech-football-vick-named-to-2025-college-football-hall-of-fame-class",
      "heisman": "https://www.heisman.com/articles/notes-on-the-heisman-finalists/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-michael-vick-a-1",
            "text": "I became a first-team All-American as a redshirt freshman quarterback.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vt",
              "heisman"
            ]
          },
          {
            "id": "cfb-michael-vick-a-2",
            "text": "My first season as a starter ended with my team unbeaten through the regular season and playing for a national championship.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vt",
              "heisman"
            ]
          },
          {
            "id": "cfb-michael-vick-a-3",
            "text": "That season, I threw for 1,840 yards and 12 touchdowns while adding 585 rushing yards and eight scores.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vt",
              "heisman"
            ]
          },
          {
            "id": "cfb-michael-vick-a-4",
            "text": "I led the nation with a 180.4 passing-efficiency rating, then an NCAA freshman record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vt",
              "heisman"
            ]
          },
          {
            "id": "cfb-michael-vick-a-5",
            "text": "I finished third in the Heisman Trophy voting during that breakout season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vt",
              "heisman"
            ]
          },
          {
            "id": "cfb-michael-vick-a-6",
            "text": "I was named both Big East Offensive Player of the Year and Big East Rookie of the Year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vt",
              "heisman"
            ]
          },
          {
            "id": "cfb-michael-vick-a-7",
            "text": "In the national championship game against Florida State, I accounted for 322 yards and two touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vt",
              "heisman"
            ]
          },
          {
            "id": "cfb-michael-vick-a-8",
            "text": "Across my two playing seasons in college, my teams went 22-2.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vt",
              "heisman"
            ]
          },
          {
            "id": "cfb-michael-vick-a-9",
            "text": "Virginia Tech later retired the No. 7 jersey I wore in Blacksburg.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vt",
              "heisman"
            ]
          },
          {
            "id": "cfb-michael-vick-a-10",
            "text": "After only two college playing seasons, Atlanta selected me first overall in the 2001 NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vt",
              "heisman"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-michael-vick-b-1",
            "text": "I played only two college seasons before giving up my remaining eligibility for the NFL Draft.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-michael-vick-b-2",
            "text": "As a redshirt sophomore, I threw for 1,234 yards and eight touchdowns and rushed for 617 yards and eight more scores.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-michael-vick-b-3",
            "text": "I closed my college career as the MVP of a Gator Bowl victory over Clemson.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-michael-vick-b-4",
            "text": "I earned first-team all-conference honors one season and second-team honors the next.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-michael-vick-b-5",
            "text": "My college career ended with 3,074 passing yards and 1,202 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-michael-vick-b-6",
            "text": "My 12.0 yards per pass attempt in 1999 became a school single-season record.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-michael-vick-b-7",
            "text": "I also left with a school career record of 9.79 yards per pass attempt.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-michael-vick-b-8",
            "text": "I was selected for the College Football Hall of Fame's 2025 class.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-michael-vick-b-9",
            "text": "I was the No. 7 quarterback who became the face of Frank Beamer's Virginia Tech breakthrough.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-michael-vick-b-10",
            "text": "I led the Hokies to their first national championship game before becoming the No. 1 pick in the 2001 NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-tua-tagovailoa",
    "name": "Tua Tagovailoa",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "bama": "https://rolltide.com/sports/football/roster/tua-tagovailoa/5472",
      "title": "https://rolltide.com/news/2018/1/8/alabama-football-wins-2018-national-championship-in-overtime-thriller-against-georgia-26-23",
      "heisman": "https://www.heisman.com/kyler-murray-named-2018-heisman-trophy-winner/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-tua-tagovailoa-a-1",
            "text": "I arrived in college as a highly rated dual-threat quarterback from Hawai'i.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bama"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-a-2",
            "text": "As a freshman, I spent the regular season as a reserve but still threw 11 touchdown passes in limited action.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bama"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-a-3",
            "text": "As a sophomore starter, I set school single-season records with 3,966 passing yards and 43 passing touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "title"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-a-4",
            "text": "That season I won both the Maxwell Award and Walter Camp Player of the Year and was named my conference's Offensive Player of the Year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "title"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-a-5",
            "text": "I was named the Offensive MVP of that national championship game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "title"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-a-6",
            "text": "I entered the national championship game at halftime with my team trailing 13-0.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-a-7",
            "text": "From that point through overtime, I completed 14 passes for 166 yards and three touchdowns and added 27 rushing yards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-a-8",
            "text": "I finished second in the Heisman Trophy voting to Kyler Murray.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-a-9",
            "text": "I wore No. 13 at Alabama after coming from Ewa Beach, Hawai'i.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bama"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-a-10",
            "text": "My freshman title run ended with a 41-yard overtime touchdown pass to DeVonta Smith on second-and-26.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "title"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-tua-tagovailoa-b-1",
            "text": "I spent my first college season behind an established starter before taking over the job as a sophomore.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bama"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-b-2",
            "text": "In my first season as the starter, I earned consensus All-America recognition and led the nation in passing efficiency.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bama"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-b-3",
            "text": "I accounted for 48 touchdowns that season, 43 passing and five rushing.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-b-4",
            "text": "In the playoff semifinal against Oklahoma, I completed 24 of 27 passes for 318 yards and four touchdowns and was named Orange Bowl Offensive MVP.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-b-5",
            "text": "The next season, I became the first Alabama quarterback to throw for at least 400 yards and five touchdowns in the same game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bama"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-b-6",
            "text": "I finished my college career as Alabama's record holder with 87 passing touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-b-7",
            "text": "I also left as the program's career leader in touchdown responsibility with 96.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-b-8",
            "text": "A season-ending injury at Mississippi State ended my junior year after I had thrown 33 touchdowns in nine games.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bama"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-b-9",
            "text": "My college career included a Maxwell Award, a Walter Camp Award and a national championship while wearing Alabama's No. 13.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bama"
            ]
          },
          {
            "id": "cfb-tua-tagovailoa-b-10",
            "text": "I am the Alabama quarterback whose first national-title moment came after replacing Jalen Hurts and throwing the overtime winner to DeVonta Smith.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bama",
              "title"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-kyler-murray",
    "name": "Kyler Murray",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "ou": "https://soonersports.com/sports/football/roster/kyler-murray/3464",
      "heisman": "https://www.heisman.com/heisman-winners/kyler-murray/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-kyler-murray-a-1",
            "text": "I was an elite high-school football player who was also considered a major baseball prospect.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-kyler-murray-a-2",
            "text": "My first FBS season came at a different school, where I appeared in eight games and made three starts.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ou"
            ]
          },
          {
            "id": "cfb-kyler-murray-a-3",
            "text": "After transferring, I sat out a season before becoming a backup quarterback.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-kyler-murray-a-4",
            "text": "In 2017, I backed up the reigning Heisman Trophy winner and threw only 21 passes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-kyler-murray-a-5",
            "text": "The next season, I became the starter and led my team to a conference championship and the College Football Playoff.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-kyler-murray-a-6",
            "text": "My completed 2018 season included 4,361 passing yards, 42 passing touchdowns, 1,001 rushing yards and 12 rushing scores.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ou"
            ]
          },
          {
            "id": "cfb-kyler-murray-a-7",
            "text": "I won the Davey O'Brien Award and Manning Award and was named AP Player of the Year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ou"
            ]
          },
          {
            "id": "cfb-kyler-murray-a-8",
            "text": "I became the first player to win the Heisman the year after replacing another Heisman winner.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-kyler-murray-a-9",
            "text": "I wore No. 1 at Oklahoma after beginning my college career at Texas A&M.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ou",
              "heisman"
            ]
          },
          {
            "id": "cfb-kyler-murray-a-10",
            "text": "I followed Baker Mayfield to give Oklahoma consecutive Heisman winners before becoming the first overall NFL Draft pick.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-kyler-murray-b-1",
            "text": "I was named a state Gatorade Player of the Year in football while also starring on the baseball diamond.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-kyler-murray-b-2",
            "text": "As a true freshman at my first college, I threw for 686 yards and five touchdowns and rushed for 335 yards.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ou"
            ]
          },
          {
            "id": "cfb-kyler-murray-b-3",
            "text": "After a transfer and a year out, my first season at my new school produced only 359 passing yards as a reserve.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ou"
            ]
          },
          {
            "id": "cfb-kyler-murray-b-4",
            "text": "Through the 2018 Heisman voting period, I had 4,053 passing yards, 40 passing touchdowns, 892 rushing yards and 11 rushing scores.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-kyler-murray-b-5",
            "text": "My 205.7 passing-efficiency rating at that point set a Heisman-era record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-kyler-murray-b-6",
            "text": "I became my school's seventh Heisman Trophy winner.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-kyler-murray-b-7",
            "text": "My win made my school only the fourth program to produce Heisman winners in consecutive seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-kyler-murray-b-8",
            "text": "I received 2,167 Heisman voting points, finishing ahead of Tua Tagovailoa and Dwayne Haskins.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-kyler-murray-b-9",
            "text": "I led Oklahoma to the 2018 Big 12 title and a College Football Playoff berth.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-kyler-murray-b-10",
            "text": "I am the No. 1 Oklahoma quarterback who transferred from Texas A&M and succeeded Baker Mayfield.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ou",
              "heisman"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-marcus-mariota",
    "name": "Marcus Mariota",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "oregon": "https://goducks.com/sports/football/roster/marcus-mariota/4962",
      "heisman": "https://www.heisman.com/heisman-winners/marcus-mariota/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-marcus-mariota-a-1",
            "text": "I did not play during my first college season before becoming a three-year starting quarterback.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-marcus-mariota-a-2",
            "text": "My teams won 36 games during my three seasons as the starter.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-marcus-mariota-a-3",
            "text": "In 2013, I threw for 3,665 yards and 31 touchdowns with only four interceptions while rushing for 715 yards and nine scores.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-marcus-mariota-a-4",
            "text": "That season, I became the first player in school history to exceed 4,000 yards of total offense.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-marcus-mariota-a-5",
            "text": "I also set a conference record with a streak of 353 consecutive pass attempts without an interception.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-marcus-mariota-a-6",
            "text": "In my final season, I threw for 4,454 yards and 42 touchdowns and led the nation in passing efficiency.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-marcus-mariota-a-7",
            "text": "I accounted for a conference-record 58 touchdowns during that final season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-marcus-mariota-a-8",
            "text": "That year I won the Maxwell, Walter Camp, Davey O'Brien and Johnny Unitas Golden Arm awards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-marcus-mariota-a-9",
            "text": "I became Oregon's first Heisman Trophy winner and the first Heisman winner born in Hawai'i.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "heisman"
            ]
          },
          {
            "id": "cfb-marcus-mariota-a-10",
            "text": "Wearing No. 8, I led Oregon to a Rose Bowl playoff win over Florida State and then the inaugural College Football Playoff Championship Game.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-marcus-mariota-b-1",
            "text": "I was a dual-threat quarterback who recorded five 100-yard rushing games during my college career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-marcus-mariota-b-2",
            "text": "I produced multiple interception-free passing streaks of at least 200 attempts.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-marcus-mariota-b-3",
            "text": "I finished college with 10,796 passing yards and 2,237 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-marcus-mariota-b-4",
            "text": "My career totals included school records of 105 touchdown passes and 136 total touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-marcus-mariota-b-5",
            "text": "I became the first quarterback in Pac-12 history to earn first-team all-conference honors three times.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-marcus-mariota-b-6",
            "text": "In my final conference championship game, I threw for 367 yards and ran for three touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-marcus-mariota-b-7",
            "text": "My playoff semifinal win included 338 passing yards and two touchdowns against Florida State.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-marcus-mariota-b-8",
            "text": "I won the Heisman with 2,534 voting points, more than twice the total of the runner-up.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-marcus-mariota-b-9",
            "text": "I was Oregon's No. 8 quarterback and the first Heisman winner in program history.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "heisman"
            ]
          },
          {
            "id": "cfb-marcus-mariota-b-10",
            "text": "I am the Honolulu native who became the first player born in Hawai'i to win the Heisman Trophy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "heisman"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-robert-griffin-iii",
    "name": "Robert Griffin III",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "baylor": "https://baylorbears.com/news/2021/2/4/football-rg3-2008-11-gave-baylor-a-spot-in-the-heisman-room",
      "records": "https://baylorbears.com/news/2012/1/11/Heisman_Trophy_Winner_RG3_Declares_for_NFL_Draft",
      "manning": "https://baylorbears.com/news/2012/1/24/griffin_iii_wins_2012_manning_award",
      "heisman": "https://www.heisman.com/heisman-winners/robert-griffin-iii/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-robert-griffin-iii-a-1",
            "text": "I became a starting college quarterback as a freshman and immediately added a major rushing dimension to the offense.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-a-2",
            "text": "I was also a two-sport college athlete, competing at a national level in track and field.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-a-3",
            "text": "As a freshman quarterback, I threw for 2,091 yards and rushed for 843 yards with 13 rushing touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "records"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-a-4",
            "text": "A knee injury cost me most of my second football season, but I returned the next year to throw for 3,501 yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "records"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-a-5",
            "text": "In 2011, I finished with 4,293 passing yards and 37 passing touchdowns plus 699 rushing yards and 10 rushing scores.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "baylor",
              "records"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-a-6",
            "text": "That season, I led my program to 10 wins for only the second time in school history and the first time since 1980.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "manning"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-a-7",
            "text": "I threw for 479 yards and the winning touchdown with eight seconds left in my school's first-ever victory over Oklahoma.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "manning"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-a-8",
            "text": "I earned consensus All-America honors and won both the Davey O'Brien and Manning awards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "baylor",
              "manning"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-a-9",
            "text": "I became the first Baylor player to win the Heisman Trophy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "baylor",
              "heisman"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-a-10",
            "text": "I was Baylor's No. 10 dual-threat quarterback before becoming the second overall pick in the 2012 NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-robert-griffin-iii-b-1",
            "text": "Not every program recruiting me out of high school envisioned keeping me at quarterback.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-b-2",
            "text": "I enrolled early and won a Big 12 title in the 400-meter hurdles before ever taking a college football snap.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-b-3",
            "text": "My 2011 season produced 4,992 yards of total offense and 47 touchdowns responsible for.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "records"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-b-4",
            "text": "I finished my college career with 10,366 passing yards and 2,254 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "records"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-b-5",
            "text": "Across three full seasons, I set or tied 54 school records.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "records"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-b-6",
            "text": "During my Heisman season, my 192.31 regular-season passing-efficiency mark was the best in Heisman history at the time.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-b-7",
            "text": "I won the Heisman voting with 1,687 points, finishing ahead of Andrew Luck.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-b-8",
            "text": "My final college team won the Alamo Bowl and finished 10-3, giving the program its first bowl victory since 1992.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "manning"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-b-9",
            "text": "That Heisman was the first ever won by a Baylor player.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-robert-griffin-iii-b-10",
            "text": "I left Baylor as its record-setting No. 10 quarterback and was selected second overall in the following NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-jameis-winston",
    "name": "Jameis Winston",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "fsu": "https://seminoles.com/sports/football/roster/jameis-winston/3109",
      "heisman": "https://www.heisman.com/heisman-winners/jameis-winston/",
      "jersey": "https://seminoles.com/news/2023/11/16/football-florida-state-to-honor-jameis-winston-with-jersey-retirement",
      "hall": "https://seminoles.com/honors/florida-state-athletics-hall-of-fame/jameis-winston/395"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-jameis-winston-a-1",
            "text": "I redshirted my first college football season before taking over as the starting quarterback.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-jameis-winston-a-2",
            "text": "In my first career start, I completed 25 of 27 passes for 356 yards and four touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-jameis-winston-a-3",
            "text": "I became the first freshman ever named ACC Player of the Year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-jameis-winston-a-4",
            "text": "My first season as the starter ended with 4,057 passing yards and 40 touchdown passes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-jameis-winston-a-5",
            "text": "I became the first freshman quarterback to lead a team to 14 victories in a season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-jameis-winston-a-6",
            "text": "At 19 years and 342 days old, I became the youngest Heisman Trophy winner at the time.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "fsu",
              "heisman"
            ]
          },
          {
            "id": "cfb-jameis-winston-a-7",
            "text": "My 40 touchdown passes set conference, school and national freshman records.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-jameis-winston-a-8",
            "text": "I led a 14-0 national championship season and was named Offensive MVP of the title game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-jameis-winston-a-9",
            "text": "I became Florida State's third Heisman winner after Charlie Ward and Chris Weinke.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "heisman"
            ]
          },
          {
            "id": "cfb-jameis-winston-a-10",
            "text": "My championship season ended with an 80-yard winning drive and a touchdown pass to Kelvin Benjamin with 13 seconds left against Auburn.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-jameis-winston-b-1",
            "text": "I was a two-sport college athlete, playing football while also pitching and playing the outfield in baseball.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hall",
              "fsu"
            ]
          },
          {
            "id": "cfb-jameis-winston-b-2",
            "text": "Across two college baseball seasons, I posted a 1.94 ERA and recorded nine saves.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hall"
            ]
          },
          {
            "id": "cfb-jameis-winston-b-3",
            "text": "In my second football season as a starter, my team completed another undefeated regular season and reached the first College Football Playoff.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-jameis-winston-b-4",
            "text": "That year, I engineered four game-winning fourth-quarter drives, the most in the nation.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-jameis-winston-b-5",
            "text": "I won my first 26 college starts and finished my football career with a 26-1 record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "fsu",
              "jersey"
            ]
          },
          {
            "id": "cfb-jameis-winston-b-6",
            "text": "Across two seasons as a starter, I passed for 7,964 yards and 65 touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "jersey"
            ]
          },
          {
            "id": "cfb-jameis-winston-b-7",
            "text": "My 163.28 career passing-efficiency mark became both a school and conference record.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "jersey"
            ]
          },
          {
            "id": "cfb-jameis-winston-b-8",
            "text": "My college honors included the Heisman, Davey O'Brien and Manning awards along with ACC Player of the Year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "fsu",
              "heisman"
            ]
          },
          {
            "id": "cfb-jameis-winston-b-9",
            "text": "Florida State later retired the No. 5 jersey I wore during my two-year run as its starter.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "jersey"
            ]
          },
          {
            "id": "cfb-jameis-winston-b-10",
            "text": "I led Florida State to the 2013 national championship and returned the next season to take the Seminoles to the College Football Playoff.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "fsu",
              "jersey"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "andy-reid",
    "name": "Andy Reid",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "deprioritized",
    "sources": {
      "chiefs": "https://www.chiefs.com/team/coaches-roster/andy-reid",
      "byu": "https://byucougars.com/sports/football/roster/player/andy-reid",
      "hire": "https://www.chiefs.com/news/chiefs-name-andy-reid-head-coach-9301869"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-andy-reid-a-1",
            "text": "Before I became a head coach, I spent seven seasons on an NFL staff that reached the playoffs six times.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": ["chiefs"]
          },
          {
            "id": "nfl-andy-reid-a-2",
            "text": "My first NFL head-coaching job came in 1999 with a team that had gone 3-13 the previous season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": ["chiefs", "hire"]
          },
          {
            "id": "nfl-andy-reid-a-3",
            "text": "I led that franchise to the playoffs nine times in 14 seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": ["chiefs", "hire"]
          },
          {
            "id": "nfl-andy-reid-a-4",
            "text": "During that run, my teams won six division titles.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": ["chiefs", "hire"]
          },
          {
            "id": "nfl-andy-reid-a-5",
            "text": "I reached five conference championship games with that first franchise.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": ["chiefs", "hire"]
          },
          {
            "id": "nfl-andy-reid-a-6",
            "text": "I took that first franchise to Super Bowl XXXIX.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": ["chiefs", "hire"]
          },
          {
            "id": "nfl-andy-reid-a-7",
            "text": "I became head coach of a second franchise in 2013 and immediately produced an 11-5 playoff season after that team had gone 2-14.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": ["chiefs"]
          },
          {
            "id": "nfl-andy-reid-a-8",
            "text": "I became the first NFL head coach to record at least 100 wins with two different franchises.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": ["chiefs"]
          },
          {
            "id": "nfl-andy-reid-a-9",
            "text": "With my second franchise, I won three Super Bowls, including back-to-back championships.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": ["chiefs"]
          },
          {
            "id": "nfl-andy-reid-a-10",
            "text": "I am the longtime Kansas City head coach who previously spent 14 seasons leading Philadelphia.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": ["chiefs", "hire"]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-andy-reid-b-1",
            "text": "I played offensive tackle in college after transferring from a junior college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": ["byu"]
          },
          {
            "id": "nfl-andy-reid-b-2",
            "text": "I began my coaching career as a graduate assistant at my alma mater under LaVell Edwards.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": ["byu"]
          },
          {
            "id": "nfl-andy-reid-b-3",
            "text": "Before reaching the NFL, I coached offensive line at several colleges and also served as an offensive coordinator.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": ["chiefs"]
          },
          {
            "id": "nfl-andy-reid-b-4",
            "text": "My first NFL staff was in Green Bay under Mike Holmgren, beginning in 1992.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": ["chiefs", "hire"]
          },
          {
            "id": "nfl-andy-reid-b-5",
            "text": "I later served as Brett Favre's quarterbacks coach during a season in which he won his third consecutive league MVP award.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": ["chiefs", "hire"]
          },
          {
            "id": "nfl-andy-reid-b-6",
            "text": "My first head-coaching tenure lasted 14 seasons and included six division championships.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": ["chiefs", "hire"]
          },
          {
            "id": "nfl-andy-reid-b-7",
            "text": "After changing franchises, I became the first head coach to win 100 games with two different NFL teams.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": ["chiefs"]
          },
          {
            "id": "nfl-andy-reid-b-8",
            "text": "I coached in three consecutive Super Bowls with my second franchise following the 2022, 2023 and 2024 seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": ["chiefs"]
          },
          {
            "id": "nfl-andy-reid-b-9",
            "text": "Patrick Mahomes won multiple league MVP awards and three Super Bowl MVP awards with me as his head coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": ["chiefs"]
          },
          {
            "id": "nfl-andy-reid-b-10",
            "text": "I am the former Eagles head coach who won Super Bowls LIV, LVII and LVIII with Kansas City.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": ["chiefs", "hire"]
          }
        ]
      }
    }
  },  {
    "league": "NFL",
    "subjectId": "bill-walsh",
    "name": "Bill Walsh",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/bill-walsh"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-bill-walsh-a-1",
            "text": "I did not get my first pro head-coaching job until age 47.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-a-2",
            "text": "I inherited a team that had gone 2-14 the previous season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-a-3",
            "text": "By my third season as a head coach, I had delivered that franchise its first NFL championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-a-4",
            "text": "My teams won six division championships during my ten seasons as an NFL head coach.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-a-5",
            "text": "I reached the conference title game in three different championship seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-a-6",
            "text": "I won 10 of my 14 postseason games as a head coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-a-7",
            "text": "My teams won three Super Bowls during the 1980s.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-a-8",
            "text": "I was named NFL Coach of the Year after the first of those championship seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-a-9",
            "text": "Those Super Bowl wins came in XVI, XIX and XXIII.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-a-10",
            "text": "I was the San Francisco head coach and general manager who built the 49ers into the NFL's dominant team of the 1980s.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-bill-walsh-b-1",
            "text": "I began my pro coaching career as an assistant with Oakland in 1966.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-b-2",
            "text": "I later spent eight seasons on Cincinnati's staff before a season with San Diego.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-b-3",
            "text": "Before becoming a head coach, I built a reputation as an offensive coach specializing in the passing game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-b-4",
            "text": "I helped develop quarterbacks including Ken Anderson and Dan Fouts.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-b-5",
            "text": "When I finally became a head coach, I also held general-manager responsibilities.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-b-6",
            "text": "Seven of my final eight teams won at least 10 games and reached the playoffs.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-b-7",
            "text": "My head-coaching record included six division titles and three conference championships.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-b-8",
            "text": "Joe Montana became another quarterback closely associated with my offensive system.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-b-9",
            "text": "I won three Super Bowls in ten seasons as an NFL head coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-walsh-b-10",
            "text": "I am the Hall of Fame coach most associated with San Francisco's West Coast offense era.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "don-shula",
    "name": "Don Shula",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/don-shula"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-don-shula-a-1",
            "text": "I became an NFL head coach in my early 30s and remained one for more than three decades.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-a-2",
            "text": "My first head-coaching stop lasted seven seasons and never finished below .500.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-a-3",
            "text": "At my second stop, only two of my 26 teams finished below .500.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-a-4",
            "text": "My teams reached the playoffs 20 times and won at least 10 games in 21 seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-a-5",
            "text": "I coached in six Super Bowls, an NFL record when I retired.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-a-6",
            "text": "I won back-to-back Super Bowls in consecutive seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-a-7",
            "text": "One of those teams completed a 17-0 season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-a-8",
            "text": "I finished my career with 347 total victories.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-a-9",
            "text": "The perfect season came with Miami in 1972.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-a-10",
            "text": "I am the longtime Dolphins coach who remains the winningest head coach in NFL history.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-don-shula-b-1",
            "text": "I played college football at John Carroll before beginning my pro career with Cleveland.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-b-2",
            "text": "Early in my playing career, I was part of a 15-player trade that sent me to Baltimore.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-b-3",
            "text": "I played cornerback for four seasons there and later spent a season in Washington.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-b-4",
            "text": "My coaching career began in college before I returned to the NFL as a defensive coordinator.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-b-5",
            "text": "I became Detroit's defensive coordinator in 1960.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-b-6",
            "text": "At age 33, I became the youngest head coach in NFL history at the time.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-b-7",
            "text": "That first head-coaching job was with Baltimore, where I went 73-26-4 over seven seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-b-8",
            "text": "In 1970, I took over a Miami franchise that was only entering its fifth season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-b-9",
            "text": "I later coached the only perfect season in NFL history.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-don-shula-b-10",
            "text": "My career ended with 347 wins after long tenures with the Colts and Dolphins.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-jimmy-johnson-coach",
    "name": "Jimmy Johnson",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/jimmy-johnson-coach"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-jimmy-johnson-coach-a-1",
            "text": "Before reaching the NFL, I had already won a national championship as a college head coach.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-a-2",
            "text": "My first NFL team went 1-15 in my first season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-a-3",
            "text": "That same franchise improved to 7-9 the next year and 11-5 with a playoff berth the year after that.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-a-4",
            "text": "I won division titles in each of my final two seasons with that first NFL franchise.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-a-5",
            "text": "Both of those seasons ended with conference-championship wins over San Francisco.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-a-6",
            "text": "I then won back-to-back Super Bowls against Buffalo.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-a-7",
            "text": "I left that franchise after compiling a 7-1 postseason record there.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-a-8",
            "text": "I later coached a second NFL franchise and took it to the playoffs in three straight seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-a-9",
            "text": "My two Super Bowl wins came in XXVII and XXVIII.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-a-10",
            "text": "I am the coach who won a college national title at Miami before leading Dallas to consecutive Super Bowl championships.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-jimmy-johnson-coach-b-1",
            "text": "My NFL head-coaching career lasted nine seasons across two franchises.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-b-2",
            "text": "I arrived in pro football after a college career that had already included a national championship.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-b-3",
            "text": "At my first NFL stop, the rebuild went from one win to a playoff team in three seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-b-4",
            "text": "That team finished 13-3 in 1992, the most wins in franchise history at the time.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-b-5",
            "text": "The next season, it entered the playoffs as the NFC's top seed.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-b-6",
            "text": "Those two postseason runs ended with Super Bowl wins over the same AFC opponent.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-b-7",
            "text": "After several years away, I returned to coach Miami in 1996.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-b-8",
            "text": "My 1998 Dolphins allowed the fewest points in the NFL and finished 10-6.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-b-9",
            "text": "I won two Super Bowls in five seasons coaching the Cowboys.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jimmy-johnson-coach-b-10",
            "text": "I am the Hall of Fame coach who led both Dallas and Miami after first becoming a national-title winner in college.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "joe-gibbs",
    "name": "Joe Gibbs",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/joe-gibbs"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-joe-gibbs-a-1",
            "text": "I spent 15 seasons as a college and pro assistant before becoming an NFL head coach.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-a-2",
            "text": "My first head-coaching job began in 1981.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-a-3",
            "text": "In my first 12-year run, my teams won four division championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-a-4",
            "text": "I reached four championship games during that first tenure, including three Super Bowl victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-a-5",
            "text": "My first 12 seasons produced a 124-60 regular-season record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-a-6",
            "text": "I won Super Bowls XVII, XXII and XXVI.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-a-7",
            "text": "Those three championships came with three different starting quarterbacks.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-a-8",
            "text": "I later returned to the same franchise for four more seasons beginning in 2004.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-a-9",
            "text": "Joe Theismann, Doug Williams and Mark Rypien were my three Super Bowl-winning quarterbacks.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-a-10",
            "text": "I am the Washington coach who won three Super Bowls in three different eras of the same franchise.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-joe-gibbs-b-1",
            "text": "My assistant-coaching path included stops at San Diego State, Florida State, USC and Arkansas.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-b-2",
            "text": "Before becoming a head coach, I also worked for three different NFL franchises.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-b-3",
            "text": "Those pro assistant stops included St. Louis, Tampa Bay and San Diego.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-b-4",
            "text": "I finally became an NFL head coach after 15 years as an assistant.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-b-5",
            "text": "In my second season, a strike-shortened year, I won the conference title.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-b-6",
            "text": "My teams won 10 or more games nine times across my career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-b-7",
            "text": "I retired once after the 1992 season and returned more than a decade later.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-b-8",
            "text": "My final career record was 154-94 in the regular season and 17-7 in the playoffs.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-b-9",
            "text": "I remain the only coach to win three Super Bowls with three different quarterbacks.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-joe-gibbs-b-10",
            "text": "All three championships came while I was coaching Washington.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-john-madden",
    "name": "John Madden",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/john-madden"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-john-madden-a-1",
            "text": "I began my pro coaching career as a linebackers coach in 1967.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-a-2",
            "text": "Two seasons later, I was promoted to head coach while still in my early 30s.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-a-3",
            "text": "My first team immediately won its division.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-a-4",
            "text": "I never had a losing season in ten years as a head coach.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-a-5",
            "text": "My teams won seven division titles and made eight playoff appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-a-6",
            "text": "My teams won five consecutive division titles during the 1970s.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-a-7",
            "text": "My 1976 team finished the regular season 13-1.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-a-8",
            "text": "That season ended with a Super Bowl victory over Minnesota.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-a-9",
            "text": "I finished with a 103-32-7 regular-season record.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-a-10",
            "text": "I am the Raiders coach who won Super Bowl XI before becoming one of football's most recognizable broadcasters.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-john-madden-b-1",
            "text": "I played on both offense and defense in college and earned all-conference honors.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-b-2",
            "text": "Philadelphia selected me in the 21st round of the 1958 NFL Draft.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-b-3",
            "text": "A knee injury ended my playing career before it could really begin.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-b-4",
            "text": "I coached at a junior college before becoming defensive coordinator at San Diego State.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-b-5",
            "text": "During my three years coordinating that defense, the program went 26-4 and was ranked first among small colleges.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-b-6",
            "text": "I joined Oakland as its linebackers coach in 1967.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-b-7",
            "text": "I became head coach two years later and won AFL Coach of the Year immediately.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-b-8",
            "text": "My .759 regular-season winning percentage is the highest among coaches with at least 100 career victories.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-b-9",
            "text": "I went 13-1 and won Super Bowl XI during the 1976 season.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-john-madden-b-10",
            "text": "I am the Hall of Fame Raiders coach whose name later became synonymous with NFL broadcasting and a video-game franchise.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "tom-landry",
    "name": "Tom Landry",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/tom-landry"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-tom-landry-a-1",
            "text": "My first head-coaching job was with an expansion franchise.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-a-2",
            "text": "The rebuild took time; my first winning season did not arrive until several years into the job.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-a-3",
            "text": "Once the breakthrough came, my teams became a long-running postseason contender.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-a-4",
            "text": "I spent nearly three decades leading the same franchise.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-a-5",
            "text": "I eventually won 13 division championships with that franchise.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-a-6",
            "text": "My teams captured five conference championships.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-a-7",
            "text": "I coached in five Super Bowls and won two of them.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-a-8",
            "text": "My teams posted 20 consecutive winning seasons during the heart of my tenure.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-a-9",
            "text": "I finished with 270 victories counting the playoffs.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-a-10",
            "text": "My Super Bowl wins came in VI and XII for the Dallas Cowboys.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-tom-landry-b-1",
            "text": "I played defensive back, punted and returned kicks during my pro playing career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-b-2",
            "text": "I recorded 32 interceptions as a player.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-b-3",
            "text": "I spent time as a player-coach before moving into full-time defensive coaching.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-b-4",
            "text": "My pre-head-coaching NFL work came with the New York Giants.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-b-5",
            "text": "As a coach, I became known for introducing the flex defense and a multiple offense.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-b-6",
            "text": "I later helped revive the shotgun or spread offense and embraced situational substitution.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-b-7",
            "text": "In 1960, I took over a brand-new NFL franchise.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-b-8",
            "text": "That team reached five Super Bowls under me.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-b-9",
            "text": "I coached the Cowboys from their first season through 1988.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tom-landry-b-10",
            "text": "I am the fedora-wearing Dallas coaching icon who won Super Bowls VI and XII.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "bill-cowher",
    "name": "Bill Cowher",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/bill-cowher"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-bill-cowher-a-1",
            "text": "I became an NFL head coach at age 34.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-a-2",
            "text": "I succeeded a Hall of Fame coach who had led the same franchise for more than two decades.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-a-3",
            "text": "My teams reached the playoffs in each of my first six seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-a-4",
            "text": "Across 15 seasons, I won eight division titles and reached the postseason ten times.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-a-5",
            "text": "I took my franchise to two Super Bowls.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-a-6",
            "text": "In 2004, my team set a franchise record with 15 regular-season wins.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-a-7",
            "text": "The next season, we became the first No. 6 seed to win a Super Bowl.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-a-8",
            "text": "That championship run included a record nine road victories across the full season and postseason.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-a-9",
            "text": "The title came with a 21-10 win over Seattle in Super Bowl XL.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-a-10",
            "text": "I am the Pittsburgh coach who succeeded Chuck Noll and finally won the Super Bowl after the 2005 season.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-bill-cowher-b-1",
            "text": "Before coaching, I played linebacker and special teams in the NFL.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-b-2",
            "text": "My playing career included time with Cleveland and Philadelphia.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-b-3",
            "text": "I later coached special teams and the secondary for Cleveland.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-b-4",
            "text": "From 1989 through 1991, I served as Kansas City's defensive coordinator.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-b-5",
            "text": "My first and only NFL head-coaching job began in 1992.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-b-6",
            "text": "I finished with a 149-90-1 regular-season record.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-b-7",
            "text": "I was named Coach of the Year in my first season and again received a major coach-of-the-year honor in 2004.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-b-8",
            "text": "My teams reached Super Bowls XXX and XL.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-b-9",
            "text": "I spent all 15 of my head-coaching seasons with Pittsburgh.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-bill-cowher-b-10",
            "text": "I am the Steelers coach whose Super Bowl XL team became the first sixth seed to win the title.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "bill-belichick",
    "name": "Bill Belichick",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "patriots": "https://www.patriots.com/news/the-patriots-and-bill-belichick-have-mutually-agreed-to-part-ways",
      "giants": "https://www.patriots.com/news/a-giant-success-245451"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-bill-belichick-a-1",
            "text": "I had already been an NFL head coach for five seasons before taking over the franchise most associated with my career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-a-2",
            "text": "At that second head-coaching stop, my first season ended 5-11.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-a-3",
            "text": "Over the next two decades, that franchise became one of the league's most consistent contenders.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-a-4",
            "text": "My second head-coaching tenure ultimately lasted 24 seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-a-5",
            "text": "Beginning in my second season there, my teams produced 19 consecutive winning seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-a-6",
            "text": "I eventually won 17 division titles, including 11 consecutive division championships.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-a-7",
            "text": "My teams won nine conference championships during that run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-a-8",
            "text": "I won six Super Bowls, the most by a head coach in NFL history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-a-9",
            "text": "I finished my tenure there with 30 postseason victories for that franchise.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-a-10",
            "text": "My six titles came in Super Bowls XXXVI, XXXVIII, XXXIX, XLIX, LI and LIII with New England.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-bill-belichick-b-1",
            "text": "I entered the NFL coaching ranks in the mid-1970s as a special assistant.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-b-2",
            "text": "I worked for three NFL franchises before settling into a long assistant run with a fourth.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-b-3",
            "text": "That fourth stop began in 1979, and I worked my way from defensive and special-teams roles into greater responsibility.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-b-4",
            "text": "I eventually became the Giants' defensive coordinator.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-b-5",
            "text": "As a coordinator, I helped the Giants win championships in the 1986 and 1990 seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-b-6",
            "text": "My first head-coaching job came with Cleveland, where I spent five seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-b-7",
            "text": "After Cleveland, I reunited with Bill Parcells and later worked with the Jets.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-b-8",
            "text": "I returned to head coaching in 2000 and went on to win six Super Bowls and nine conference championships.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-b-9",
            "text": "I finished my New England tenure with 333 total career victories and an NFL-record 31 postseason wins.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          },
          {
            "id": "nfl-bill-belichick-b-10",
            "text": "I am the coach who went from Parcells' Giants staff to Cleveland and eventually built New England's six-title dynasty.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "patriots",
              "giants"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "bill-parcells",
    "name": "Bill Parcells",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/bill-parcells",
      "college": "https://www.profootballhof.com/news/college-days-bill-parcells"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-bill-parcells-a-1",
            "text": "I took over four different NFL teams during my head-coaching career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-a-2",
            "text": "Only five of my 19 seasons as a head coach ended with losing records.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-a-3",
            "text": "My first head-coaching job began with a franchise that had posted only one winning season in the previous decade.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-a-4",
            "text": "Three years into that job, my team went 14-2 and won a championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-a-5",
            "text": "I won a second championship with that same franchise four seasons later.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-a-6",
            "text": "At my next stop, I inherited a 2-14 team and reached the Super Bowl within four seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-a-7",
            "text": "I later took over a 1-15 team and reached a conference championship game in my second season there.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-a-8",
            "text": "My final head-coaching job produced two playoff appearances in four seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-a-9",
            "text": "My two Super Bowl wins came in XXI and XXV with the New York Giants.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-a-10",
            "text": "I am the coach nicknamed 'The Big Tuna' who also led New England, the Jets and Dallas.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-bill-parcells-b-1",
            "text": "I played linebacker in college and earned all-conference honors twice.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-b-2",
            "text": "I was selected in an NFL Draft but chose coaching instead of pursuing a pro playing career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-b-3",
            "text": "I immediately chose coaching rather than pursuing a professional playing career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-b-4",
            "text": "Nearly two decades passed between that draft and my first NFL head-coaching season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-b-5",
            "text": "My first NFL head-coaching season finished 3-12-1.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-b-6",
            "text": "Within three years, that same team had improved to 14-2.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-b-7",
            "text": "After two Super Bowl titles there, I later rebuilt New England into an AFC champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-b-8",
            "text": "I then produced one of the league's sharpest turnarounds with the Jets, going from a 1-15 predecessor to 12-4 in two years.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-b-9",
            "text": "I was named NFL Coach of the Year in both 1986 and 1994.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          },
          {
            "id": "nfl-bill-parcells-b-10",
            "text": "I am the Hall of Fame coach whose four head-coaching stops were the Giants, Patriots, Jets and Cowboys.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "college"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "vince-lombardi",
    "name": "Vince Lombardi",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/vince-lombardi"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-vince-lombardi-a-1",
            "text": "I did not become an NFL head coach until I was 45 years old.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-a-2",
            "text": "I took over a team that had gone 1-10-1 the season before I arrived.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-a-3",
            "text": "In my first season, that team improved to 7-5.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-a-4",
            "text": "Over the next eight seasons, my teams won six division championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-a-5",
            "text": "During that same span, I won five NFL championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-a-6",
            "text": "My teams won the first two Super Bowls ever played.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-a-7",
            "text": "I stepped away from coaching after the second of those Super Bowl wins but remained in management.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-a-8",
            "text": "I later returned to coach another franchise for one season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-a-9",
            "text": "My career head-coaching record was 105-35-6.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-a-10",
            "text": "I am the Green Bay coaching icon whose name now appears on the Super Bowl championship trophy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-vince-lombardi-b-1",
            "text": "Before my head-coaching career, I spent five NFL seasons as an assistant with the New York Giants.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-b-2",
            "text": "I built my reputation there as an offensive coach.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-b-3",
            "text": "My first NFL head-coaching opportunity also gave me control of the team's football operation.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-b-4",
            "text": "I inherited one of the league's weakest teams at that first stop.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-b-5",
            "text": "By my second season there, I had already reached the NFL Championship Game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-b-6",
            "text": "I then won three league titles before the Super Bowl era began.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-b-7",
            "text": "My final two teams at that stop won Super Bowls I and II.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-b-8",
            "text": "After a year away from coaching, I took over Washington and produced a winning season in 1969.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-b-9",
            "text": "I finished with five NFL titles and two Super Bowl victories in ten seasons as a head coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-vince-lombardi-b-10",
            "text": "I am the Hall of Fame coach most closely identified with the Packers' 1960s dynasty.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-tony-dungy",
    "name": "Tony Dungy",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/tony-dungy"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-tony-dungy-a-1",
            "text": "I took over a franchise that had suffered 12 double-digit-loss seasons in the previous 13 years.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-a-2",
            "text": "By my second year, that team finished 10-6 and reached the playoffs.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-a-3",
            "text": "Two seasons later, I delivered that franchise its first division title since 1981.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-a-4",
            "text": "I reached the playoffs four times in six seasons at my first head-coaching stop.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-a-5",
            "text": "Eight days after that tenure ended, I was hired by another franchise.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-a-6",
            "text": "My second team reached the playoffs in all seven of my seasons as head coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-a-7",
            "text": "That team won at least 12 games in six consecutive seasons under me.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-a-8",
            "text": "I won Super Bowl XLI after beating New England in the conference championship game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-a-9",
            "text": "I became the first African American head coach to win a Super Bowl.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-a-10",
            "text": "I am the Hall of Fame coach who rebuilt Tampa Bay before winning a championship with Indianapolis.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-tony-dungy-b-1",
            "text": "Before coaching, I played defensive back in the NFL.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-b-2",
            "text": "My coaching career began at the University of Minnesota in 1980.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-b-3",
            "text": "I returned to the NFL with Pittsburgh the next year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-b-4",
            "text": "I eventually rose to defensive coordinator with the Steelers.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-b-5",
            "text": "My assistant-coaching path later included Kansas City and Minnesota.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-b-6",
            "text": "I served as Minnesota's defensive coordinator from 1992 through 1995.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-b-7",
            "text": "My first head-coaching opportunity came in Tampa Bay in 1996.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-b-8",
            "text": "I later coached Peyton Manning's Colts for seven seasons and won five division titles there.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-b-9",
            "text": "My overall head-coaching record was 148-79.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-tony-dungy-b-10",
            "text": "I am the defense-rooted coach whose Indianapolis team won Super Bowl XLI.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "pete-carroll",
    "name": "Pete Carroll",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "seahawks": "https://www.seahawks.com/team/coaches-roster/all-time/pete-carroll"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-pete-carroll-a-1",
            "text": "I returned to the NFL as a head coach in 2010 after nearly a decade away from the league.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-a-2",
            "text": "That 14-season run eventually became the winningest head-coaching tenure in franchise history.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-a-3",
            "text": "My teams reached the playoffs in ten of those 14 seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-a-4",
            "text": "At their peak, my teams posted five straight 10-win seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-a-5",
            "text": "I won five division titles there.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-a-6",
            "text": "My teams reached back-to-back Super Bowls.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-a-7",
            "text": "The first of those Super Bowl trips ended with a championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-a-8",
            "text": "My defense led the NFL in scoring defense four consecutive seasons from 2012 through 2015.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-a-9",
            "text": "I won two conference championships with Seattle.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-a-10",
            "text": "I am the former USC coach who won Super Bowl XLVIII with Seattle during the Legion of Boom era.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-pete-carroll-b-1",
            "text": "My coaching career included NFL head-coaching stops before the tenure that made me a champion.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-b-2",
            "text": "I later left the NFL and spent nine seasons as a college head coach.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-b-3",
            "text": "At that college stop, my teams reached a bowl game in every season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-b-4",
            "text": "I won seven consecutive conference titles there.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-b-5",
            "text": "I went 97-19 there and won two national championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-b-6",
            "text": "I returned to the NFL in 2010.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-b-7",
            "text": "My new team reached the playoffs in ten of my 14 seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-b-8",
            "text": "That franchise earned the NFC's No. 1 seed in consecutive seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-b-9",
            "text": "I became one of the few coaches to win both a major college national title and a Super Bowl.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          },
          {
            "id": "nfl-pete-carroll-b-10",
            "text": "I am the former USC coach who later won Super Bowl XLVIII with Seattle.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "seahawks"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-mike-shanahan",
    "name": "Mike Shanahan",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "broncos": "https://www.denverbroncos.com/team/tradition/ring-of-fame/mike-shanahan"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-mike-shanahan-a-1",
            "text": "I spent 14 seasons as the head coach of the franchise most associated with my career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-a-2",
            "text": "My teams posted nine winning seasons during that run.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-a-3",
            "text": "I reached the playoffs seven times.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-a-4",
            "text": "My teams advanced to three conference championship games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-a-5",
            "text": "I became that franchise's all-time leader in regular-season coaching wins.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-a-6",
            "text": "I also became its all-time leader in postseason coaching victories.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-a-7",
            "text": "My teams won back-to-back Super Bowls.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-a-8",
            "text": "During my tenure, my offense led the NFL in both total offense and rushing offense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-a-9",
            "text": "Those championship wins came in Super Bowls XXXII and XXXIII.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-a-10",
            "text": "I am the Denver coach who won consecutive Super Bowls with John Elway.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-mike-shanahan-b-1",
            "text": "Before becoming the longtime head coach at my best-known stop, I had already worked there in two separate assistant stints.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-b-2",
            "text": "I also had an NFL head-coaching stint elsewhere between those two assistant runs.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-b-3",
            "text": "I later returned to my best-known franchise as head coach in the mid-1990s.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-b-4",
            "text": "Within my first four seasons as head coach there, I had won two Super Bowls.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-b-5",
            "text": "Across 14 seasons, my teams went 138-86 in the regular season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-b-6",
            "text": "At home, those teams compiled an 83-29 record.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-b-7",
            "text": "My offense became especially known for a productive rushing attack.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-b-8",
            "text": "I was eventually inducted into that franchise's Ring of Fame.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-b-9",
            "text": "I remain the Broncos' all-time leader in both regular-season and postseason coaching wins.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-mike-shanahan-b-10",
            "text": "I am the coach whose Denver teams won Super Bowls XXXII and XXXIII back-to-back.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-mike-tomlin",
    "name": "Mike Tomlin",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "steelers": "https://www.steelers.com/news/statement-from-steelers-president-art-rooney-ii-x1216",
      "path": "https://www.steelers.com/news/tomlin-steelers-a-perfect-match-15513466",
      "hire": "https://www.steelers.com/news/tbt-tomlin-arrives-in-pittsburgh"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-mike-tomlin-a-1",
            "text": "I became an NFL head coach in my mid-30s.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-a-2",
            "text": "I inherited a franchise known for extraordinary long-term coaching continuity.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-a-3",
            "text": "I reached the playoffs in four of my first five seasons as a head coach.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-a-4",
            "text": "In my second season, I led my team to a championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-a-5",
            "text": "I returned to the Super Bowl two seasons after that first title.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-a-6",
            "text": "Across my tenure, my teams won eight division championships.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-a-7",
            "text": "My teams reached the postseason 13 times.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-a-8",
            "text": "I never had a losing season in 19 years as a head coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-a-9",
            "text": "My championship came in Super Bowl XLIII.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-a-10",
            "text": "I am the longtime Pittsburgh head coach who succeeded Bill Cowher.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-mike-tomlin-b-1",
            "text": "My NFL coaching background began on the defensive side of the ball, especially in the secondary.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-b-2",
            "text": "My first pro staff was known for a 4-3, Tampa-2 defensive foundation.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-b-3",
            "text": "I later became Minnesota's defensive coordinator for one season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-b-4",
            "text": "When I got my first head-coaching job, I inherited a defense built around a different front than the one I had coordinated.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-b-5",
            "text": "Rather than replace it, I kept Dick LeBeau and the existing defensive system.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-b-6",
            "text": "I won division titles in each of my first two seasons as a head coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-b-7",
            "text": "I won a Super Bowl in only my second season as a head coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-b-8",
            "text": "I eventually spent 19 seasons leading the same franchise.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-b-9",
            "text": "Every one of those 19 seasons finished .500 or better.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          },
          {
            "id": "nfl-mike-tomlin-b-10",
            "text": "I am the former Vikings defensive coordinator who became Pittsburgh's Super Bowl-winning head coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "steelers",
              "path",
              "hire"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-sean-payton",
    "name": "Sean Payton",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "broncos": "https://www.denverbroncos.com/team/coaches-roster/sean-payton"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-sean-payton-a-1",
            "text": "My first NFL head-coaching job came after assistant stops with three NFC teams.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-a-2",
            "text": "In my first season as a head coach, my team won 10 games.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-a-3",
            "text": "That debut season ended with a division title and a trip to the conference championship game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-a-4",
            "text": "I was named AP Coach of the Year after that debut season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-a-5",
            "text": "Three years later, my team opened a season with 13 consecutive wins.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-a-6",
            "text": "That run ended with the first world championship in franchise history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-a-7",
            "text": "My teams later won four consecutive division titles from 2017 through 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-a-8",
            "text": "After leaving that franchise, I returned to coaching in the other conference and eventually led that team to a division title and conference championship game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-a-9",
            "text": "My Super Bowl win came in XLIV with New Orleans.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-a-10",
            "text": "I am the offensive-minded head coach most closely associated with Drew Brees and the Saints.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-sean-payton-b-1",
            "text": "I was an All-American quarterback at Eastern Illinois.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-b-2",
            "text": "I played professionally in 1987 before beginning my coaching career the next year.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-b-3",
            "text": "My college coaching stops included San Diego State, Indiana State, Miami of Ohio and Illinois.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-b-4",
            "text": "My first NFL job was coaching quarterbacks in Philadelphia.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-b-5",
            "text": "I later coached quarterbacks and coordinated the offense for the New York Giants.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-b-6",
            "text": "I spent three seasons with Dallas as assistant head coach and quarterbacks coach under Bill Parcells.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-b-7",
            "text": "My first head-coaching opportunity came in New Orleans in 2006.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-b-8",
            "text": "I built one of the league's most prolific passing attacks around Drew Brees.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-b-9",
            "text": "After winning Super Bowl XLIV there, I later became head coach in Denver.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          },
          {
            "id": "nfl-sean-payton-b-10",
            "text": "I am the coach whose NFL path ran through the Eagles, Giants and Cowboys before leading the Saints and Broncos.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "broncos"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-john-harbaugh",
    "name": "John Harbaugh",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "bio": "https://www.giants.com/team/coaches-roster/john-harbaugh",
      "timeline": "https://www.giants.com/news/coaching-timeline-john-harbaugh-s-path-to-the-giants",
      "hire": "https://www.giants.com/news/john-harbaugh-hired-head-coach-new-york-giants-nfl"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-john-harbaugh-a-1",
            "text": "Most of my NFL assistant career before head coaching was spent working with special teams.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-a-2",
            "text": "I became a head coach without first serving as an NFL offensive or defensive coordinator.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-a-3",
            "text": "My first several teams became regular postseason participants.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-a-4",
            "text": "I reached the playoffs in each of my first five seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-a-5",
            "text": "My fifth season as a head coach ended with a championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-a-6",
            "text": "That postseason included a road double-overtime win over the AFC's top seed.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-a-7",
            "text": "The championship game matched me against a team coached by my younger brother.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-a-8",
            "text": "I led Baltimore to 12 playoff berths across 18 seasons as its head coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-a-9",
            "text": "My championship came in Super Bowl XLVII.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-a-10",
            "text": "I am the longtime Baltimore coach who won a Super Bowl against my brother before becoming the Giants head coach in 2026.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-john-harbaugh-b-1",
            "text": "I played defensive back at Miami of Ohio.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-b-2",
            "text": "My coaching career began as a graduate assistant under my father.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-b-3",
            "text": "I spent 14 years coaching in college before reaching the NFL.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-b-4",
            "text": "Philadelphia hired me in 1998.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-b-5",
            "text": "I spent nine seasons there coordinating special teams.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-b-6",
            "text": "I moved to coaching the Eagles' secondary in 2007.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-b-7",
            "text": "Baltimore hired me as head coach the next year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-b-8",
            "text": "I won 180 regular-season games during 18 seasons in Baltimore.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-b-9",
            "text": "That tenure included a Super Bowl victory over a team coached by my brother.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          },
          {
            "id": "nfl-john-harbaugh-b-10",
            "text": "I am the former Eagles special teams coach who became the Giants head coach in 2026 after a championship run in Baltimore.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bio",
              "timeline",
              "hire"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-sean-mcvay",
    "name": "Sean McVay",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "rams": "https://www.therams.com/team/coaches-roster/sean-mcvay"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-sean-mcvay-a-1",
            "text": "My first NFL head-coaching opportunity came after fewer than ten seasons working in the league.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-a-2",
            "text": "I inherited a team coming off a four-win season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-a-3",
            "text": "In my first season, that team improved to 11 wins and captured its division.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-a-4",
            "text": "That first-year offense went from last in the league in scoring to first.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-a-5",
            "text": "I was named AP Coach of the Year after that debut season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-a-6",
            "text": "I reached the Super Bowl in my second season as a head coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-a-7",
            "text": "Within my first five seasons, I reached a second Super Bowl and won it.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-a-8",
            "text": "My first nine seasons produced seven playoff berths and two Super Bowl appearances.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-a-9",
            "text": "I became the youngest head coach in NFL history to win a Super Bowl.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-a-10",
            "text": "I am the Rams head coach whose championship came in Super Bowl LVI at the franchise's home stadium in Los Angeles.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-sean-mcvay-b-1",
            "text": "I played wide receiver in college before entering coaching.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-b-2",
            "text": "My first NFL coaching job came as an offensive assistant.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-b-3",
            "text": "After a season outside the NFL, I joined Washington's staff in 2010.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-b-4",
            "text": "I worked there as an offensive assistant, tight ends coach and eventually offensive coordinator.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-b-5",
            "text": "I spent three seasons as Washington's offensive coordinator.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-b-6",
            "text": "I left Washington for my first head-coaching opportunity and immediately won a division title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-b-7",
            "text": "I reached Super Bowl LIII in my second season as a head coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-b-8",
            "text": "Three seasons later, I returned to the Super Bowl.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-b-9",
            "text": "That time, I won Super Bowl LVI at age 36.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-sean-mcvay-b-10",
            "text": "I am the former Washington offensive coordinator who became the youngest Super Bowl-winning head coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-tom-coughlin",
    "name": "Tom Coughlin",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "jags": "https://www.jaguars.com/team/history/pride-of-the-jaguars/tom-coughlin/",
      "giants": "https://www.giants.com/news/tom-coughlin"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-tom-coughlin-a-1",
            "text": "I held two NFL head-coaching jobs over a long career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-a-2",
            "text": "Before my first pro head-coaching job, I had already led a college program.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-a-3",
            "text": "My first NFL team was an expansion franchise.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-a-4",
            "text": "By its second season, that team had reached a conference championship game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-a-5",
            "text": "I later moved to a second NFL franchise and won three division titles there.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-a-6",
            "text": "I reached the playoffs five times at that second stop.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-a-7",
            "text": "My teams there won two Super Bowls.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-a-8",
            "text": "Both championships came against the same opposing franchise.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-a-9",
            "text": "The first of those wins ended an opponent's bid for a 19-0 season.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-a-10",
            "text": "My Super Bowl wins came in XLII and XLVI as the Giants coach who twice defeated New England.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-tom-coughlin-b-1",
            "text": "Before becoming an NFL head coach, I had assistant stops with three professional franchises.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-b-2",
            "text": "One of those assistant tenures ended with a Super Bowl victory.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-b-3",
            "text": "I left the pro assistant ranks to become a college head coach.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-b-4",
            "text": "That college job lasted three seasons before my first NFL head-coaching opportunity.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-b-5",
            "text": "My first NFL head-coaching opportunity came with an expansion franchise.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-b-6",
            "text": "That expansion team reached the conference championship game in only its second season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-b-7",
            "text": "I later returned to the Giants as head coach in 2004.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-b-8",
            "text": "My Giants teams won 102 regular-season games and two Super Bowls.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-b-9",
            "text": "I tied Bill Parcells for the most postseason wins by a Giants head coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          },
          {
            "id": "nfl-tom-coughlin-b-10",
            "text": "I am the former Boston College and Jaguars head coach whose Giants won Super Bowls XLII and XLVI.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "jags",
              "giants"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "NFL",
    "subjectId": "nfl-dan-campbell",
    "name": "Dan Campbell",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "lions": "https://www.detroitlions.com/team/coaches-roster/dan-campbell",
      "hire": "https://www.detroitlions.com/news/lions-agree-to-terms-with-dan-campbell-to-become-team-s-new-head-coach"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-dan-campbell-a-1",
            "text": "My first full-time NFL head-coaching job came after I had previously served as an interim head coach.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-a-2",
            "text": "My first season in that full-time role was a deep rebuild.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-a-3",
            "text": "The next year, my team climbed above .500.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-a-4",
            "text": "In my third season, I led the franchise to its first division title in 30 years.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-a-5",
            "text": "That same postseason produced the franchise's first playoff win since the 1991 season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-a-6",
            "text": "My team then won a second playoff game and reached the conference championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-a-7",
            "text": "The following regular season, we set a franchise record with 15 wins.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-a-8",
            "text": "That season also brought the franchise its first No. 1 conference seed.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-a-9",
            "text": "I am the head coach who brought consecutive division titles back to Detroit.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-a-10",
            "text": "I am the former Lions player who returned to lead the franchise's modern resurgence.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-dan-campbell-b-1",
            "text": "Before coaching, I spent 11 seasons playing tight end in the NFL.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-b-2",
            "text": "I played for four different NFL franchises during that career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-b-3",
            "text": "One of those teams later gave me my first full-time NFL head-coaching job.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-b-4",
            "text": "I began coaching as an intern with Miami and later became the team's tight ends coach.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-b-5",
            "text": "I later served as Miami's interim head coach, taking over a 1-3 team and winning my first two games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-b-6",
            "text": "I then spent five seasons as New Orleans' assistant head coach and tight ends coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-b-7",
            "text": "That Saints staff won four division titles during my tenure.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-b-8",
            "text": "Detroit hired me as its head coach in 2021.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-b-9",
            "text": "I later led the Lions to their first playoff victory in more than three decades.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          },
          {
            "id": "nfl-dan-campbell-b-10",
            "text": "I am the former NFL tight end and Saints assistant who became Detroit's head coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lions",
              "hire"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "barry-switzer",
    "name": "Barry Switzer",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "cfbhall": "https://www.cfbhall.com/inductees/barry-switzer-2001/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-barry-switzer-a-1",
            "text": "I became a major-college head coach after spending seven seasons on that program's staff.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-a-2",
            "text": "My teams never had a losing season across a 16-year college head-coaching tenure.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-a-3",
            "text": "I reached a bowl game in 13 of those seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-a-4",
            "text": "My teams won 12 conference championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-a-5",
            "text": "I finished my college head-coaching career with a winning percentage above .830.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-a-6",
            "text": "My teams won national championships in 1974 and 1975.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-a-7",
            "text": "A decade later, I won a third national championship in 1985.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-a-8",
            "text": "My offense became famous for the wishbone and regularly ranked among the nation's rushing leaders.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-a-9",
            "text": "All three of my college national titles came at Oklahoma.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-a-10",
            "text": "I am the Sooners coach who later returned to coaching and won a Super Bowl with the Dallas Cowboys.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-barry-switzer-b-1",
            "text": "I played both center and linebacker in college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-b-2",
            "text": "As a senior, I captained a team that won its conference and a bowl game.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-b-3",
            "text": "After a year in the U.S. Army, I began coaching at my alma mater.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-b-4",
            "text": "I then joined another major program as an assistant in 1966.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-b-5",
            "text": "I rose from offensive coordinator to assistant head coach before taking over the program.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-b-6",
            "text": "A long unbeaten streak that began before I became head coach continued through my first seasons in charge.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-b-7",
            "text": "My college teams finished 157-29-4.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-b-8",
            "text": "I coached 16 seasons at Oklahoma and won the Big Eight 12 times.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-b-9",
            "text": "My championship seasons were 1974, 1975 and 1985.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-barry-switzer-b-10",
            "text": "I am the Oklahoma wishbone coach who also coached the Cowboys to a Super Bowl title.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "bear-bryant",
    "name": "Bear Bryant",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "nff": "https://footballfoundation.org/honors/hall-of-fame/paul-bear-bryant/1955?path=football"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-bear-bryant-a-1",
            "text": "I was a head coach for 38 seasons at four major-college programs.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-a-2",
            "text": "At my second head-coaching stop, I won the school's first conference championship.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-a-3",
            "text": "At my third stop, I won a conference championship with a team that had gone 1-9 two years earlier.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-a-4",
            "text": "I then returned to a program that had won only four games in the previous three seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-a-5",
            "text": "By my fourth year there, I had won a national championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-a-6",
            "text": "My teams at that final stop appeared in a bowl game 24 consecutive seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-a-7",
            "text": "I won six national championships there.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-a-8",
            "text": "I finished my career with 323 victories.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-a-9",
            "text": "Those six national titles came at Alabama in 1961, 1964, 1965, 1973, 1978 and 1979.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-a-10",
            "text": "I am the legendary Alabama coach whose nickname came from wrestling a circus bear as a teenager.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-bear-bryant-b-1",
            "text": "I played end in college before beginning my coaching career as an assistant.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-b-2",
            "text": "My early coaching path included service in the U.S. Navy during World War II.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-b-3",
            "text": "My first head-coaching job lasted only one season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-b-4",
            "text": "I later spent eight seasons at Kentucky and four at Texas A&M.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-b-5",
            "text": "At Kentucky, my 1950 team beat Oklahoma in the Sugar Bowl and ended a 31-game winning streak.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-b-6",
            "text": "At Texas A&M, my 1956 team won the Southwest Conference.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-b-7",
            "text": "I returned to my alma mater as head coach in 1958.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-b-8",
            "text": "In 1981, I passed Amos Alonzo Stagg on the all-time wins list.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-b-9",
            "text": "I finished 232-46-9 as Alabama's head coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bear-bryant-b-10",
            "text": "I am the coach known as 'Bear' who led Alabama for 25 seasons.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "bobby-bowden-cfb",
    "name": "Bobby Bowden",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "nff": "https://footballfoundation.org/honors/nff-college-football-hall-of-fame/bobby-bowden/2189",
      "cfbhall": "https://cfbhall.com/inductees/bobby-bowden-2006/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-bobby-bowden-a-1",
            "text": "I spent 44 seasons as a college head coach.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-a-2",
            "text": "Before my longest tenure, I had already led programs at two other schools.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-a-3",
            "text": "I took over my best-known program after it had won only four games in three years.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-a-4",
            "text": "My second team there went 10-2.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-a-5",
            "text": "That program became a national contender for decades under me.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-a-6",
            "text": "My teams won 12 conference championships there.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-a-7",
            "text": "I won national championships in 1993 and 1999.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-a-8",
            "text": "I finished my career with 377 victories.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-a-9",
            "text": "I coached Florida State from 1976 through 2009.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-a-10",
            "text": "I am the longtime Seminoles coach whose teams became one of college football's defining powers of the 1980s and 1990s.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-bobby-bowden-b-1",
            "text": "I began my college playing career at Alabama before finishing at Howard College, now Samford.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-b-2",
            "text": "One of my first head-coaching jobs came at my alma mater.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-b-3",
            "text": "I later spent six seasons as the head coach at West Virginia.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-b-4",
            "text": "That stop included two bowl appearances and my first top-20 team.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-b-5",
            "text": "I returned to a school where I had previously served as an assistant.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-b-6",
            "text": "Except for my first season there, I never had a losing season at that program.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-b-7",
            "text": "I eventually coached more than three decades at the same school.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-b-8",
            "text": "My teams there won two national championships and a dozen ACC titles.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-b-9",
            "text": "I retired after the 2009 season with 377 career wins.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          },
          {
            "id": "cfb-bobby-bowden-b-10",
            "text": "I am the Hall of Fame coach most closely associated with Florida State.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff",
              "cfbhall"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "steve-spurrier-cfb",
    "name": "Steve Spurrier",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "coach": "https://www.cfbhall.com/inductees/steve-spurrier-2017/",
      "player": "https://www.cfbhall.com/inductees/steve-spurrier-1986/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-steve-spurrier-a-1",
            "text": "I was a college head coach for 26 seasons across three schools.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-a-2",
            "text": "At my first major-college stop, I won a conference championship and ended a long bowl drought.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-a-3",
            "text": "At my next stop, my teams never finished lower than No. 13 in the final rankings.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-a-4",
            "text": "I won six conference championships there.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-a-5",
            "text": "My teams reached back-to-back national championship games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-a-6",
            "text": "I won the national championship in 1996.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-a-7",
            "text": "I later became the winningest head coach in the history of another SEC program.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-a-8",
            "text": "I am the winningest head coach in both Florida and South Carolina history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-a-9",
            "text": "My 1996 Florida team beat rival Florida State in the Sugar Bowl to win the title.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-a-10",
            "text": "I am the coach nicknamed the 'Head Ball Coach' who built Florida's high-scoring 1990s teams.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-steve-spurrier-b-1",
            "text": "Before coaching, I was an All-America quarterback and punter in college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-b-2",
            "text": "I spent a decade playing professional football before moving fully into coaching.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-b-3",
            "text": "My early coaching work was on the offensive side of the ball.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-b-4",
            "text": "My first major-college head-coaching job came at Duke.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-b-5",
            "text": "I won ACC Coach of the Year in each of my final two seasons there.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-b-6",
            "text": "I then returned to my alma mater as head coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-b-7",
            "text": "My offenses there helped redefine SEC football in the 1990s.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-b-8",
            "text": "I won six SEC championships and a national title at Florida.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-b-9",
            "text": "As a player at Florida, I won the 1966 Heisman Trophy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          },
          {
            "id": "cfb-steve-spurrier-b-10",
            "text": "I am the rare Hall of Famer inducted for both my playing and coaching careers.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "coach",
              "player"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "urban-meyer-cfb",
    "name": "Urban Meyer",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "osu": "https://ohiostatebuckeyes.com/news/2025/1/15/urban-meyer-to-be-enshrined-into-the-college-football-hall-of-fame",
      "osuhof": "https://ohiostatebuckeyes.com/news/2025/12/10/urban-meyer-enshrined-into-the-college-football-hall-of-fame"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-urban-meyer-a-1",
            "text": "I became a college head coach after years as an assistant at several programs.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-a-2",
            "text": "My first two head-coaching stops produced rapid turnarounds and conference success.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-a-3",
            "text": "I went on to win major conference championships at two different power programs.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-a-4",
            "text": "Across my college head-coaching career, I won seven conference championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-a-5",
            "text": "I won three national championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-a-6",
            "text": "Two of those titles came at my third head-coaching stop.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-a-7",
            "text": "My final college program won the inaugural College Football Playoff national championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-a-8",
            "text": "I went 7-0 against my final program's biggest rival.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-a-9",
            "text": "My national titles came twice at Florida and once at Ohio State.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-a-10",
            "text": "I am the coach who won the 2014 national championship at Ohio State after previously winning two at Florida.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-urban-meyer-b-1",
            "text": "I played defensive back in college before beginning my coaching career as a graduate assistant.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-b-2",
            "text": "That graduate-assistant job came at a school I would later lead as head coach.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-b-3",
            "text": "My assistant path included stops at Illinois State, Colorado State and Notre Dame.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-b-4",
            "text": "My first head-coaching job came at Bowling Green.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-b-5",
            "text": "I then led Utah before moving to the SEC.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-b-6",
            "text": "At Florida, I coached a Heisman-winning quarterback and won two national titles.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-b-7",
            "text": "After stepping away, I later became head coach at Ohio State.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-b-8",
            "text": "My Buckeyes won 30 consecutive conference games at one point.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-b-9",
            "text": "I finished 7-0 against Michigan and won the 2014 national championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          },
          {
            "id": "cfb-urban-meyer-b-10",
            "text": "I am the College Football Hall of Fame coach whose head-coaching path was Bowling Green, Utah, Florida and Ohio State.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "osu",
              "osuhof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "woody-hayes",
    "name": "Woody Hayes",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "cfbhall": "https://www.cfbhall.com/inductees/woody-hayes-1983/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-woody-hayes-a-1",
            "text": "I coached at three colleges in the same state during my head-coaching career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-a-2",
            "text": "My longest tenure lasted nearly three decades at one school.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-a-3",
            "text": "My teams there won more than 200 games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-a-4",
            "text": "I won 13 conference championships at that school.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-a-5",
            "text": "My teams also won three national championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-a-6",
            "text": "My program led the nation in home attendance in 21 of my 28 seasons there.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-a-7",
            "text": "My teams became famous for a physical, run-first style.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-a-8",
            "text": "That style became associated with the phrase 'three yards and a cloud of dust.'",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-a-9",
            "text": "I coached Ohio State from 1951 through 1978.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-a-10",
            "text": "I am the Buckeyes coaching legend whose career before Columbus included Denison and Miami of Ohio.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-woody-hayes-b-1",
            "text": "Before becoming a famous college coach, I served more than five years in the U.S. Navy.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-b-2",
            "text": "I began my head-coaching career at a small college in Ohio.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-b-3",
            "text": "I then moved to another Ohio program before taking a Big Ten job.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-b-4",
            "text": "My final head-coaching stop lasted nearly three decades.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-b-5",
            "text": "There, I compiled a 205-61-10 record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-b-6",
            "text": "My teams won 13 Big Ten championships.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-b-7",
            "text": "I also won three national championships.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-b-8",
            "text": "My offensive philosophy emphasized controlling the game with the run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-b-9",
            "text": "My name became inseparable from Ohio State football for a generation.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          },
          {
            "id": "cfb-woody-hayes-b-10",
            "text": "I am the Hall of Fame coach remembered for 'three yards and a cloud of dust.'",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "dabo-swinney-cfb",
    "name": "Dabo Swinney",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "clemson": "https://clemsontigers.com/staff/dabo"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-dabo-swinney-a-1",
            "text": "I was promoted from a position-coach role to interim head coach during a season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-a-2",
            "text": "I then earned the full-time job and steadily turned that program into a national contender.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-a-3",
            "text": "My teams eventually produced a streak of 12 consecutive 10-win seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-a-4",
            "text": "I became the winningest coach in my conference's history.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-a-5",
            "text": "My program reached the College Football Playoff six straight seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-a-6",
            "text": "I won multiple conference championships during that run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-a-7",
            "text": "My teams won national championships in the 2016 and 2018 seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-a-8",
            "text": "The 2018 team finished 15-0, the first major-college team in the modern era to do so.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-a-9",
            "text": "Both national championships came at Clemson.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-a-10",
            "text": "I am the longtime Clemson coach who built the program into Alabama's chief playoff-era rival.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-dabo-swinney-b-1",
            "text": "I played wide receiver in college before entering coaching.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-b-2",
            "text": "My early coaching career included a long stint working with wide receivers.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-b-3",
            "text": "I joined Clemson's staff before becoming its head coach.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-b-4",
            "text": "I took over the program during the 2008 season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-b-5",
            "text": "My breakthrough teams turned Clemson into a perennial ACC champion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-b-6",
            "text": "I coached quarterbacks Deshaun Watson and Trevor Lawrence during national-title runs.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-b-7",
            "text": "My program became the first to reach six consecutive College Football Playoffs.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-b-8",
            "text": "I passed Frank Howard as Clemson's all-time winningest head coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-b-9",
            "text": "I won national titles over Alabama in the 2016 and 2018 seasons.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          },
          {
            "id": "cfb-dabo-swinney-b-10",
            "text": "I am the Clemson coach whose name became synonymous with the program's playoff-era rise.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "clemson"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "kirby-smart-cfb",
    "name": "Kirby Smart",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "uga": "https://georgiadogs.com/sports/football/roster/coaches/kirby-smart/3728"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-kirby-smart-a-1",
            "text": "My first college head-coaching job came at my alma mater.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-a-2",
            "text": "In my second season, I won a conference championship and reached the national championship game.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-a-3",
            "text": "That title-game appearance ended a drought of roughly three decades for the program.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-a-4",
            "text": "A few years later, I ended a 41-year national-championship drought.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-a-5",
            "text": "The next season, my team won another national championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-a-6",
            "text": "That made my program the first team of the College Football Playoff era to repeat as national champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-a-7",
            "text": "I also won multiple SEC championships as head coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-a-8",
            "text": "My teams reached the playoff repeatedly while producing a large number of first-round NFL draft picks.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-a-9",
            "text": "My back-to-back national championships came in the 2021 and 2022 seasons.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-a-10",
            "text": "I am the Georgia coach who returned to his alma mater after years coordinating Alabama's defense.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-kirby-smart-b-1",
            "text": "I was a four-year letterman at defensive back in college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-b-2",
            "text": "As a senior, I earned first-team all-conference honors and led the league in interceptions.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-b-3",
            "text": "I began my coaching career in administrative and assistant roles.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-b-4",
            "text": "My early stops included Valdosta State, Florida State, LSU and the NFL.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-b-5",
            "text": "I returned to my alma mater once as a running backs coach before leaving again.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-b-6",
            "text": "I later spent nine seasons on Alabama's staff, seven as defensive coordinator.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-b-7",
            "text": "During that assistant tenure, Alabama won four national championships.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-b-8",
            "text": "I won the Broyles Award as college football's top assistant.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-b-9",
            "text": "I returned to Georgia as head coach in 2016 and later won consecutive national titles.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-kirby-smart-b-10",
            "text": "I am the former Bulldogs defensive back who became Georgia's championship-winning head coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "pete-carroll-cfb",
    "name": "Pete Carroll",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "usc": "https://usctrojans.com/honors/usc-athletics-hall-of-fame/pete-carroll/225"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-pete-carroll-a-1",
            "text": "I spent nine seasons as a college head coach at one program.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-a-2",
            "text": "My teams won more than 83 percent of their games there.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-a-3",
            "text": "I produced seven straight seasons with at least 11 victories.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-a-4",
            "text": "My teams won seven consecutive conference championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-a-5",
            "text": "I also reached seven consecutive BCS bowl games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-a-6",
            "text": "My program won national championships in 2003 and 2004.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-a-7",
            "text": "The 2004 team finished 13-0.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-a-8",
            "text": "I coached three Heisman Trophy winners during that college tenure.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-a-9",
            "text": "I went 97-16 as USC's head coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-a-10",
            "text": "I am the USC coach who later won a Super Bowl with the Seattle Seahawks.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-pete-carroll-b-1",
            "text": "I played free safety in college and earned all-conference honors.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-b-2",
            "text": "My coaching path included college assistant jobs before I moved to the NFL.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-b-3",
            "text": "I had already been an NFL head coach before taking my famous college job.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-b-4",
            "text": "I returned to college football in 2001 after a year away from coaching.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-b-5",
            "text": "My program then became a fixture in the top four of the national polls.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-b-6",
            "text": "I won three consecutive Rose Bowls during one stretch.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-b-7",
            "text": "My teams put together a 34-game winning streak.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-b-8",
            "text": "I led USC to two national championships and seven straight Pac-10 titles.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-b-9",
            "text": "After nine seasons there, I returned to the NFL.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-pete-carroll-b-10",
            "text": "I am the coach whose USC dynasty preceded a Super Bowl championship in Seattle.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "bob-stoops-cfb",
    "name": "Bob Stoops",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "nff": "https://footballfoundation.org/honors/college-football-hall-of-fame/bob-stoops/2479"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-bob-stoops-a-1",
            "text": "I spent 18 seasons as the head coach of one major program.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-a-2",
            "text": "Every one of those seasons ended with a bowl appearance.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-a-3",
            "text": "I never had a losing record as a college head coach.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-a-4",
            "text": "My teams won 10 conference championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-a-5",
            "text": "I reached four BCS National Championship Games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-a-6",
            "text": "My 2000 team completed a perfect 13-0 season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-a-7",
            "text": "That season ended with a national championship victory over Florida State.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-a-8",
            "text": "I became the only coach to win a national championship and all four BCS bowls.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-a-9",
            "text": "I finished with a school-record 190 wins at Oklahoma.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-a-10",
            "text": "I am the Sooners coach who restored the program to national-title contention at the start of the 2000s.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-bob-stoops-b-1",
            "text": "I was a four-year college starter at defensive back.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-b-2",
            "text": "As a senior, I earned first-team all-conference honors and was named my team's MVP.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-b-3",
            "text": "I began coaching under Hayden Fry at my alma mater.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-b-4",
            "text": "I later worked under Bill Snyder during a major program turnaround.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-b-5",
            "text": "My next prominent stop came as a defensive coordinator under Steve Spurrier.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-b-6",
            "text": "That staff won the 1996 national championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-b-7",
            "text": "I became Oklahoma's head coach soon afterward.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-b-8",
            "text": "In only my second season, I won the national championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-b-9",
            "text": "My Sooners later produced Heisman-winning quarterbacks Jason White and Sam Bradford.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-bob-stoops-b-10",
            "text": "I am the former Iowa defensive back and Florida coordinator who became Oklahoma's all-time winningest coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-jim-tressel",
    "name": "Jim Tressel",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "cfbhall": "https://www.cfbhall.com/inductees/jim-tressel-2015/",
      "osu": "https://ohiostatebuckeyes.com/honors/hall-of-fame-inductees/jim-tressel/422"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-jim-tressel-a-1",
            "text": "I won national championships at two different levels of Division I college football.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-a-2",
            "text": "At my first long-term head-coaching stop, I reached the postseason ten times in 15 seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-a-3",
            "text": "I won four national championships there.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-a-4",
            "text": "I then moved to a major-conference program and won another national championship in my second season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-a-5",
            "text": "That title team finished 14-0.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-a-6",
            "text": "I later returned to the national championship game in back-to-back seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-a-7",
            "text": "My teams won at least a share of six conference titles at that second stop.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-a-8",
            "text": "I finished with 241 career victories.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-a-9",
            "text": "My major-college national title came with Ohio State in the 2002 season.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-a-10",
            "text": "I am the coach who won four FCS titles at Youngstown State before leading Ohio State to a BCS championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-jim-tressel-b-1",
            "text": "I played quarterback in college for a team coached by my father.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-b-2",
            "text": "I was a first-team all-conference player before moving into coaching.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-b-3",
            "text": "My first long head-coaching tenure came at Youngstown State.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-b-4",
            "text": "There, I reached six national championship games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-b-5",
            "text": "I won four of those title games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-b-6",
            "text": "I became Ohio State's head coach in 2001.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-b-7",
            "text": "My second Buckeyes team defeated top-ranked Miami in double overtime for the national title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-b-8",
            "text": "I went 8-1 against Michigan during my Ohio State tenure.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-b-9",
            "text": "I also coached Heisman Trophy winner Troy Smith.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          },
          {
            "id": "cfb-jim-tressel-b-10",
            "text": "I am the Ohio coaching icon who won five national championships across Youngstown State and Ohio State.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "osu"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-mack-brown",
    "name": "Mack Brown",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "cfbhall": "https://www.cfbhall.com/inductees/mack-brown-2018/",
      "texas": "https://texaslonghorns.com/sports/football/roster/coaches/mack-brown/659"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-mack-brown-a-1",
            "text": "My college head-coaching career spanned more than three decades and several programs.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-a-2",
            "text": "I led two different programs to top-five national finishes.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-a-3",
            "text": "At one stop, I produced three 10-win seasons before leaving for another major job.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-a-4",
            "text": "At my next program, I won at least 10 games in nine consecutive seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-a-5",
            "text": "I won two conference championships there.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-a-6",
            "text": "My 2005 team completed an undefeated national-championship season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-a-7",
            "text": "That title ended a 35-year championship drought for the program.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-a-8",
            "text": "I later returned to a school I had coached earlier in my career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-a-9",
            "text": "My national title came at Texas with a Rose Bowl victory over USC.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-a-10",
            "text": "I am the Hall of Fame coach best known for leading Vince Young's 2005 Longhorns.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-mack-brown-b-1",
            "text": "After years as an assistant, my first college head-coaching job lasted one season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-b-2",
            "text": "I then became a head coach and athletics director at Tulane.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-b-3",
            "text": "My next long tenure came at North Carolina.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-b-4",
            "text": "I rebuilt that program into a top-five team before moving on.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-b-5",
            "text": "I became Texas head coach in 1998.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-b-6",
            "text": "My Longhorns eventually won a school-record 21 consecutive conference games.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-b-7",
            "text": "I coached Texas to national-title games after the 2005 and 2009 seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-b-8",
            "text": "The 2005 team beat USC in the Rose Bowl for the national championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-b-9",
            "text": "After retiring once, I later returned to North Carolina as head coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          },
          {
            "id": "cfb-mack-brown-b-10",
            "text": "I am the coach whose career is most associated with both North Carolina and Texas.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhall",
              "texas"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "bill-snyder-cfb",
    "name": "Bill Snyder",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "kstate": "https://www.kstatesports.com/news/2018/12/2/football-bill-snyder-announces-retirement-from-kansas-state"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-bill-snyder-a-1",
            "text": "I took over a program that was in the middle of a 27-game winless stretch.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-a-2",
            "text": "In my third season, that program posted only its second winning record since 1970.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-a-3",
            "text": "Two years later, I took the school to just the second bowl game in its history.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-a-4",
            "text": "That appearance began a run of 11 consecutive postseason trips.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-a-5",
            "text": "My teams eventually won two conference championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-a-6",
            "text": "One of those titles came with an upset of the nation's No. 1 team in a conference championship game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-a-7",
            "text": "I retired once and returned three years later to rebuild the program again.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-a-8",
            "text": "I finished as the winningest coach in school history with 215 victories.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-a-9",
            "text": "My 2012 team rose to No. 1 in the BCS standings and won the Big 12.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-a-10",
            "text": "I am the coach who engineered Kansas State's rise from one of college football's weakest programs into a national contender.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-bill-snyder-b-1",
            "text": "Before becoming a head coach, I spent many years as a college assistant.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-b-2",
            "text": "My first major head-coaching opportunity did not arrive until late in my coaching career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-b-3",
            "text": "The program I inherited had won only about a quarter of its games across more than five decades.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-b-4",
            "text": "My first tenure eventually produced six 11-win seasons in a seven-year span.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-b-5",
            "text": "I stepped away after the 2005 season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-b-6",
            "text": "I returned to the same job in 2009.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-b-7",
            "text": "Three seasons into that second stint, my team won 10 games and returned to a major bowl.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-b-8",
            "text": "The next year, we won the conference and earned a Fiesta Bowl berth.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-b-9",
            "text": "Across both tenures, I led the school to 19 of its first 21 bowl appearances.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          },
          {
            "id": "cfb-bill-snyder-b-10",
            "text": "I am the Hall of Fame coach whose entire major-college head-coaching career was spent at Kansas State.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "kstate"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "chris-petersen-cfb",
    "name": "Chris Petersen",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "boise": "https://broncosports.com/news/2026/1/14/chris-petersen-inducted-into-college-football-hall-of-fame",
      "uw": "https://gohuskies.com/sports/football/roster/coaches/chris-petersen/4183"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-chris-petersen-a-1",
            "text": "My first head-coaching job produced an undefeated season in year one.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-a-2",
            "text": "That debut season ended with a major bowl victory over a traditional power.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-a-3",
            "text": "Across eight seasons at my first school, I went 92-12.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-a-4",
            "text": "I won at least 10 games in seven of those eight seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-a-5",
            "text": "I became the first FBS coach to win the Bear Bryant Coach of the Year award twice.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-a-6",
            "text": "I later took over another program and won two conference championships there.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-a-7",
            "text": "That second program reached the College Football Playoff in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-a-8",
            "text": "I finished my head-coaching career with 147 victories against only 38 losses.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-a-9",
            "text": "My famous first-season bowl win came when Boise State beat Oklahoma in the Fiesta Bowl.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-a-10",
            "text": "I am the coach who built Boise State into a national phenomenon before leading Washington to the playoff.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-chris-petersen-b-1",
            "text": "I played quarterback at UC Davis before beginning my coaching career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-b-2",
            "text": "My early coaching path included stops at Pittsburgh State, UC Davis, Oregon and Portland State.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-b-3",
            "text": "I joined Boise State as an assistant before eventually becoming its offensive coordinator.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-b-4",
            "text": "When the head-coaching job opened, I was promoted from within.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-b-5",
            "text": "My first Boise State team finished 13-0.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-b-6",
            "text": "That season ended with one of the most memorable trick-play finishes in major-bowl history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-b-7",
            "text": "I later left Boise State for Washington.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-b-8",
            "text": "At Washington, I won Pac-12 titles in 2016 and 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-b-9",
            "text": "My 2016 Huskies became the program's first College Football Playoff team.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          },
          {
            "id": "cfb-chris-petersen-b-10",
            "text": "I am the former Boise State offensive coordinator who became a championship head coach at both Boise State and Washington.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "uw"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "frank-beamer-cfb",
    "name": "Frank Beamer",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "vt": "https://hokiesports.com/news/2018/01/08/frank-beamer-selected-to-college-football-hall-of-fames-class-of-2018"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-frank-beamer-a-1",
            "text": "I spent 35 seasons as a college head coach.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-a-2",
            "text": "My first six years as a head coach came at a smaller program before I returned to my alma mater.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-a-3",
            "text": "At my longest stop, I eventually produced 23 consecutive bowl appearances.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-a-4",
            "text": "My teams also posted eight straight 10-win seasons from 2004 through 2011.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-a-5",
            "text": "I won three Big East championships and four ACC championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-a-6",
            "text": "My best-known team completed the first undefeated regular season in school history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-a-7",
            "text": "That team reached the national championship game after the 1999 season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-a-8",
            "text": "I finished with 280 career victories, including a school-record 238 at my alma mater.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-a-9",
            "text": "My program became famous for game-changing special teams under the nickname 'Beamerball.'",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-a-10",
            "text": "I am the longtime Virginia Tech coach whose teams turned blocked kicks and special teams into a program identity.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-frank-beamer-b-1",
            "text": "I played cornerback in college for the school I would later coach for nearly three decades.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-b-2",
            "text": "Before becoming a head coach, I worked as an assistant at Maryland, The Citadel and Murray State.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-b-3",
            "text": "My first head-coaching job came at Murray State.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-b-4",
            "text": "I led that program to a share of a conference title and an FCS playoff berth.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-b-5",
            "text": "I returned to Virginia Tech as head coach in 1987.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-b-6",
            "text": "Before my arrival, the school had won only one of its six bowl appearances.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-b-7",
            "text": "I eventually won 11 bowl games there.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-b-8",
            "text": "My teams reached a bowl every season for the final 23 years of my tenure.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-b-9",
            "text": "I won seven major-conference titles while leading Virginia Tech.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          },
          {
            "id": "cfb-frank-beamer-b-10",
            "text": "I am the former Hokies defensive back who became the winningest coach in Virginia Tech history.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "vt"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "gary-patterson-cfb",
    "name": "Gary Patterson",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "tcu": "https://www.tcu.edu/news/2026/a-legendary-career-gary-patterson-inducted-into-college-football-hall-of-fame.php"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-gary-patterson-a-1",
            "text": "I spent 22 seasons as the head coach of one program.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-a-2",
            "text": "During that tenure, the school competed in three different conferences.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-a-3",
            "text": "My teams won six conference championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-a-4",
            "text": "I produced 11 final Top 25 finishes, including seven in the top 10.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-a-5",
            "text": "My 2010 team completed an undefeated season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-a-6",
            "text": "That season ended with the program's first appearance in a BCS bowl.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-a-7",
            "text": "We won that game in the Rose Bowl and finished No. 2 in the final AP poll.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-a-8",
            "text": "Four years later, my team finished No. 3 after winning a share of the Big 12 title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-a-9",
            "text": "I finished with a 181-79 record as a head coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-a-10",
            "text": "I am the defensive-minded coach who led TCU from Conference USA through the Mountain West and into the Big 12.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-gary-patterson-b-1",
            "text": "I played safety and linebacker at Kansas State before entering coaching.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-b-2",
            "text": "My assistant-coaching path included several schools before I arrived at my best-known program.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-b-3",
            "text": "I first joined that program as defensive coordinator.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-b-4",
            "text": "I was promoted to head coach after Dennis Franchione left.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-b-5",
            "text": "Defense became the defining identity of my teams.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-b-6",
            "text": "My program regularly finished among the national leaders in total defense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-b-7",
            "text": "I guided the school through major conference transitions without losing national relevance.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-b-8",
            "text": "My best team went unbeaten and won the Rose Bowl.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-b-9",
            "text": "I later won a Big 12 championship and finished No. 3 nationally in 2014.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          },
          {
            "id": "cfb-gary-patterson-b-10",
            "text": "I am the longtime TCU coach whose 22-year tenure produced 181 wins.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tcu"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-lou-holtz",
    "name": "Lou Holtz",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "nff": "https://footballfoundation.org/hof_search.aspx?hof=2228"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-lou-holtz-a-1",
            "text": "I became the only coach in NCAA history to lead six different programs to bowl games.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-a-2",
            "text": "My head-coaching career included stops in several different regions and conferences.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-a-3",
            "text": "At one stop, my first season ended with a major bowl upset of a top-three opponent.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-a-4",
            "text": "I later took over another program and won a national championship in my third season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-a-5",
            "text": "That championship team finished undefeated.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-a-6",
            "text": "I eventually won 100 games at that school.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-a-7",
            "text": "After retiring once, I returned to coaching at a program coming off a winless season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-a-8",
            "text": "That team improved by eight wins in my second season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-a-9",
            "text": "My 1988 Notre Dame team won the national championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-a-10",
            "text": "I am the Hall of Fame coach who led Notre Dame to its most recent consensus national title.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-lou-holtz-b-1",
            "text": "My college head-coaching career began at William & Mary.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-b-2",
            "text": "I later coached North Carolina State, Arkansas and Minnesota before reaching my best-known stop.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-b-3",
            "text": "At Arkansas, my first season ended with a 31-6 Orange Bowl upset of No. 3 Oklahoma.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-b-4",
            "text": "My Razorbacks reached six consecutive bowl games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-b-5",
            "text": "I took over Notre Dame in 1986.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-b-6",
            "text": "Two seasons later, that team went undefeated and won the national championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-b-7",
            "text": "After leaving Notre Dame, I spent time in broadcasting before returning to the sideline.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-b-8",
            "text": "My final coaching stop was South Carolina.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-b-9",
            "text": "There, I followed an 0-11 first season with an 8-5 campaign and an Outback Bowl upset of Ohio State.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          },
          {
            "id": "cfb-lou-holtz-b-10",
            "text": "I am the coach whose six bowl-program stops included Arkansas, Notre Dame and South Carolina.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nff"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "brian-kelly-cfb",
    "name": "Brian Kelly",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "lsu": "https://lsusports.net/sports/fb/roster/season/2025/staff/brian-kelly"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-brian-kelly-a-1",
            "text": "My first head-coaching job lasted 13 seasons at the Division II level.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-a-2",
            "text": "I won five consecutive conference championships during that first tenure.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-a-3",
            "text": "My teams there won back-to-back national championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-a-4",
            "text": "I later rebuilt a major-conference program into a team that completed a 12-0 regular season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-a-5",
            "text": "At my next stop, I reached a BCS National Championship Game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-a-6",
            "text": "I later led that same program to two College Football Playoff appearances.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-a-7",
            "text": "I became the winningest coach in that school's history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-a-8",
            "text": "My teams averaged 10 wins per season across my final five years there.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-a-9",
            "text": "That long tenure came at Notre Dame, where I recorded 113 victories.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-a-10",
            "text": "I am the coach whose path included Grand Valley State, Central Michigan, Cincinnati, Notre Dame and LSU.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-brian-kelly-b-1",
            "text": "I was a four-year college letterwinner at linebacker and served twice as a team captain.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-b-2",
            "text": "My first head-coaching stop produced 118 victories.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-b-3",
            "text": "I won Division II national titles in 2002 and 2003.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-b-4",
            "text": "I then moved to Central Michigan and won the MAC in my third season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-b-5",
            "text": "At Cincinnati, I won consecutive Big East championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-b-6",
            "text": "My final Cincinnati team finished the regular season 12-0.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-b-7",
            "text": "I took over Notre Dame in 2010.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-b-8",
            "text": "My Irish reached the national championship game in 2012 and the playoff in 2018 and 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-b-9",
            "text": "I left Notre Dame as the program's all-time wins leader.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-brian-kelly-b-10",
            "text": "I am the veteran coach who later moved from Notre Dame to LSU.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "chip-kelly",
    "name": "Chip Kelly",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "oregon": "https://goducks.com/sports/football/roster/coaches/chip-kelly/786",
      "record": "https://goducks.com/documents/download/2025/8/30/2_-_Results_Section.pdf"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-chip-kelly-a-1",
            "text": "I took over a college program after first serving as its offensive coordinator.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-a-2",
            "text": "My teams immediately became annual conference-title contenders.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-a-3",
            "text": "I won an outright conference championship in each of my first three seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-a-4",
            "text": "My teams reached a BCS bowl in all four of my seasons at that school.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-a-5",
            "text": "I produced the first three 12-win seasons in program history.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-a-6",
            "text": "My second team completed an undefeated regular season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-a-7",
            "text": "That season ended in the BCS National Championship Game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-a-8",
            "text": "I finished my four-year college tenure there with a 46-7 record.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-a-9",
            "text": "My final college game at that stop was a Fiesta Bowl victory after the 2012 season.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-a-10",
            "text": "I am the coach whose fast-paced Oregon offenses helped redefine college football in the early 2010s.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-chip-kelly-b-1",
            "text": "Before I became a head coach, I made my name as an offensive coach.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-b-2",
            "text": "I arrived at a major West Coast program as offensive coordinator in 2007.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-b-3",
            "text": "My system quickly turned that team into one of the nation's most productive offenses.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-b-4",
            "text": "I was promoted to head coach two years later.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-b-5",
            "text": "My first team as head coach reached the Rose Bowl.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-b-6",
            "text": "A year later, my team played for the national championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-b-7",
            "text": "My teams returned to the Rose Bowl the following season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-b-8",
            "text": "I went 33-3 in conference play during four seasons as Oregon's head coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-b-9",
            "text": "My .868 winning percentage remains the best among Oregon coaches with at least four seasons.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          },
          {
            "id": "cfb-chip-kelly-b-10",
            "text": "I am the Oregon coach who won three straight undisputed conference titles before leaving for the NFL.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "oregon",
              "record"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "dan-lanning",
    "name": "Dan Lanning",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "oregon": "https://goducks.com/sports/football/roster/coaches/dan-lanning/5492"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-dan-lanning-a-1",
            "text": "My first college head-coaching job came after I had coordinated a national-championship defense.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-a-2",
            "text": "I reached double-digit wins in each of my first two seasons as a head coach.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-a-3",
            "text": "My second team reached a conference championship game and won the Fiesta Bowl.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-a-4",
            "text": "In my third season, my program changed conferences.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-a-5",
            "text": "We went undefeated through the regular season in our first year in the new league.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-a-6",
            "text": "We won that conference championship immediately.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-a-7",
            "text": "That team earned the No. 1 seed in the first 12-team College Football Playoff.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-a-8",
            "text": "I became one of only two coaches in program history to post back-to-back 12-win seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-a-9",
            "text": "I led Oregon to the Big Ten title in the Ducks' first season in the conference.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-a-10",
            "text": "I am the former Georgia defensive coordinator who became Oregon's conference-championship head coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-dan-lanning-b-1",
            "text": "I played linebacker at a small college in Missouri.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-b-2",
            "text": "I began coaching at a high school, working with special teams and multiple position groups.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-b-3",
            "text": "My early college path included graduate-assistant roles at Pittsburgh and Arizona State.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-b-4",
            "text": "I later spent a season as a defensive graduate assistant at Alabama.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-b-5",
            "text": "After a stop at Memphis, I joined Georgia's defensive staff.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-b-6",
            "text": "I rose to defensive coordinator there.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-b-7",
            "text": "My three Georgia defenses as coordinator were among the nation's best.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-b-8",
            "text": "I helped Georgia win the 2021 national championship before leaving for my first head-coaching job.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-b-9",
            "text": "That head-coaching opportunity came at Oregon.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          },
          {
            "id": "cfb-dan-lanning-b-10",
            "text": "I am the former Georgia defensive coordinator who became Oregon's Big Ten championship coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "oregon"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "ed-orgeron",
    "name": "Ed Orgeron",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "lsu": "https://lsusports.net/staff/ed-orgeron",
      "title": "https://lsusports.net/news/2020/01/13/lsu-football-national-championship-game-recap"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-ed-orgeron-a-1",
            "text": "My head-coaching career included both full-time and interim opportunities before my championship season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-a-2",
            "text": "One of my interim head-coaching opportunities came at a major West Coast program.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-a-3",
            "text": "I later went 6-2 in another interim role in the SEC.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-a-4",
            "text": "That second interim opportunity became a full-time head-coaching job.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-a-5",
            "text": "My third full season there produced a conference championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-a-6",
            "text": "That team won all 15 of its games.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-a-7",
            "text": "We beat seven top-10 opponents over the course of the season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-a-8",
            "text": "The year ended with playoff victories over Oklahoma and Clemson.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-a-9",
            "text": "I was the consensus national coach of the year for the 2019 season.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-a-10",
            "text": "I am the Louisiana native who coached LSU to the 2019 national championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-ed-orgeron-b-1",
            "text": "I built much of my reputation as a defensive-line coach and recruiter.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-b-2",
            "text": "My assistant career included national-championship staffs at Miami and USC.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-b-3",
            "text": "My first full-time major-college head-coaching job came at Ole Miss.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-b-4",
            "text": "Years later, I returned to USC and went 6-2 as interim head coach.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-b-5",
            "text": "I joined LSU's staff as defensive-line coach and recruiting coordinator.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-b-6",
            "text": "I became LSU's interim head coach during the 2016 season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-b-7",
            "text": "After going 6-2, I earned the full-time job.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-b-8",
            "text": "My 2018 team won 10 games and the Fiesta Bowl.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-b-9",
            "text": "One year later, Joe Burrow won the Heisman while my team finished 15-0.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          },
          {
            "id": "cfb-ed-orgeron-b-10",
            "text": "I am the longtime defensive-line coach and recruiter who led LSU to the 2019 national championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "title"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-jim-harbaugh",
    "name": "Jim Harbaugh",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "michigan": "https://mgoblue.com/news/2024/2/21/season-review-2023-michigan-football",
      "hire": "https://mgoblue.com/news/2014/12/30/Jim_Harbaugh_Named_Michigan_Head_Football_Coach"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-jim-harbaugh-a-1",
            "text": "My college head-coaching career included a long second act after an NFL head-coaching stint.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-a-2",
            "text": "My first two teams in that return to college each won 10 games.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-a-3",
            "text": "Several years later, my program broke through for a conference championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-a-4",
            "text": "That title also brought the program its first College Football Playoff appearance.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-a-5",
            "text": "We repeated as conference champions the next season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-a-6",
            "text": "My final team won a third straight conference title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-a-7",
            "text": "That team set a school record with 15 victories.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-a-8",
            "text": "We beat Alabama in overtime in the Rose Bowl semifinal.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-a-9",
            "text": "We then defeated Washington to finish 15-0 and win the 2023 national championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-a-10",
            "text": "I am the former Michigan quarterback who returned to coach the Wolverines to their first outright national title since 1948.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-jim-harbaugh-b-1",
            "text": "I was a decorated college quarterback before a long NFL playing career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-b-2",
            "text": "I spent 15 seasons playing quarterback in the NFL.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-b-3",
            "text": "While still an NFL player, I spent years helping my father's college program as an unpaid assistant.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-b-4",
            "text": "My first full-time NFL coaching job was coaching quarterbacks for Oakland.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-b-5",
            "text": "My first head-coaching job came at the University of San Diego.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-b-6",
            "text": "I then rebuilt Stanford from a one-win team into a 12-win Orange Bowl champion.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-b-7",
            "text": "I left Stanford to coach the San Francisco 49ers.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-b-8",
            "text": "I reached the NFC Championship Game in each of my first three NFL seasons and coached in Super Bowl XLVII.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-b-9",
            "text": "I returned to Michigan as head coach in 2015.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          },
          {
            "id": "cfb-jim-harbaugh-b-10",
            "text": "I am the Michigan alumnus whose coaching path ran through San Diego, Stanford, the 49ers and finally back to Ann Arbor.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "hire"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-ryan-day",
    "name": "Ryan Day",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "osu": "https://ohiostatebuckeyes.com/sports/football/roster/coaches/ryan-day/1498"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-ryan-day-a-1",
            "text": "My first full season as a college head coach ended with an undefeated regular season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-a-2",
            "text": "That debut team won its conference and reached the College Football Playoff.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-a-3",
            "text": "I won another conference championship the following season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-a-4",
            "text": "My teams became regular participants in the playoff.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-a-5",
            "text": "I eventually guided my program into the first 12-team College Football Playoff.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-a-6",
            "text": "That postseason required four victories to win the championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-a-7",
            "text": "We beat Tennessee, Oregon, Texas and Notre Dame during that run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-a-8",
            "text": "The title capped a 14-win season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-a-9",
            "text": "I became the fifth coach in school history to win a national championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-a-10",
            "text": "I am the Ohio State coach who won the 2024 College Football Playoff national championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-ryan-day-b-1",
            "text": "I played quarterback in college before beginning my coaching career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-b-2",
            "text": "My early coaching stops included multiple programs in the Northeast.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-b-3",
            "text": "I later spent two seasons coaching quarterbacks in the NFL.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-b-4",
            "text": "Those NFL jobs came with Philadelphia and San Francisco.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-b-5",
            "text": "I joined Ohio State as co-offensive coordinator and quarterbacks coach.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-b-6",
            "text": "I became the program's offensive coordinator the next season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-b-7",
            "text": "I served as acting head coach for three games in 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-b-8",
            "text": "I was then chosen to succeed Urban Meyer as the full-time head coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-b-9",
            "text": "My tenure eventually produced five College Football Playoff appearances and a national title.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          },
          {
            "id": "cfb-ryan-day-b-10",
            "text": "I am the former Ohio State offensive coordinator who became the Buckeyes' championship-winning head coach.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "osu"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-lincoln-riley",
    "name": "Lincoln Riley",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "usc": "https://usctrojans.com/staff-directory/Lincoln-Riley/5835"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-lincoln-riley-a-1",
            "text": "My first college head-coaching job came while I was still in my early 30s.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-a-2",
            "text": "I won double-digit games in each of my first four seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-a-3",
            "text": "I won a conference championship in each of those four seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-a-4",
            "text": "My first three teams reached the College Football Playoff.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-a-5",
            "text": "I went 55-10 in five seasons at that first head-coaching stop.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-a-6",
            "text": "I then took over another traditional power coming off a four-win season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-a-7",
            "text": "Across my head-coaching career, I coached three Heisman Trophy-winning quarterbacks.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-a-8",
            "text": "Three quarterbacks I coached were selected No. 1 overall in the NFL Draft.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-a-9",
            "text": "My four conference titles came at Oklahoma before I moved to USC.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-a-10",
            "text": "I am the offensive coach associated with Baker Mayfield, Kyler Murray and Caleb Williams winning the Heisman Trophy.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-lincoln-riley-b-1",
            "text": "I briefly played college quarterback before moving almost immediately into coaching.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-b-2",
            "text": "I began as a student assistant at the same school where I had briefly played.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-b-3",
            "text": "I later coached receivers there and called plays in a bowl game as interim offensive coordinator.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-b-4",
            "text": "I spent five seasons coordinating the offense at East Carolina.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-b-5",
            "text": "I then became Oklahoma's offensive coordinator and quarterbacks coach.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-b-6",
            "text": "I won the Broyles Award as the nation's top assistant in my first season there.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-b-7",
            "text": "When Bob Stoops retired, I was promoted to head coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-b-8",
            "text": "My first Oklahoma team won 12 games, a conference championship and reached the playoff.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-b-9",
            "text": "After five seasons in Norman, I became USC's head coach in 2022.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-lincoln-riley-b-10",
            "text": "I am the West Texas native whose coaching path ran from Texas Tech to East Carolina, Oklahoma and USC.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "nick-saban-cfb",
    "name": "Nick Saban",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "deprioritized",
    "sources": {
      "bama": "https://rolltide.com/sports/football/roster/coaches/nick-saban/1436",
      "lsu": "https://lsusports.net/news/2011/12/04/177163"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-nick-saban-a-1",
            "text": "My first season as a college head coach ended 9-2 with a share of a conference championship.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": ["bama"]
          },
          {
            "id": "cfb-nick-saban-a-2",
            "text": "I later spent five seasons leading a Big Ten program and took it to four bowl games.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": ["bama"]
          },
          {
            "id": "cfb-nick-saban-a-3",
            "text": "At my next college stop, I inherited a program coming off two straight losing seasons and won eight games in year one.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": ["bama"]
          },
          {
            "id": "cfb-nick-saban-a-4",
            "text": "My second season there reached 10 wins and a conference championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": ["bama", "lsu"]
          },
          {
            "id": "cfb-nick-saban-a-5",
            "text": "Two years later, I went 13-1 and won my first national championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": ["bama"]
          },
          {
            "id": "cfb-nick-saban-a-6",
            "text": "After a two-season NFL head-coaching stint, my first season at a different SEC program finished 7-6; one year later, we completed a 12-0 regular season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": ["bama"]
          },
          {
            "id": "cfb-nick-saban-a-7",
            "text": "In my third season there, we went 14-0 and won the national championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": ["bama"]
          },
          {
            "id": "cfb-nick-saban-a-8",
            "text": "I eventually won six national championships at that school after already winning one at another SEC program.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": ["bama", "lsu"]
          },
          {
            "id": "cfb-nick-saban-a-9",
            "text": "I coached four Heisman Trophy winners at three different positions: running back, wide receiver and quarterback.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": ["bama"]
          },
          {
            "id": "cfb-nick-saban-a-10",
            "text": "I am the Alabama coach who passed Bear Bryant by winning a seventh national title in the poll era.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": ["bama"]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-nick-saban-b-1",
            "text": "Before my long-term head-coaching success, I worked as a defensive coordinator in both college football and the NFL.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": ["bama"]
          },
          {
            "id": "cfb-nick-saban-b-2",
            "text": "One of my NFL defenses eventually allowed the fewest points in the league.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": ["bama"]
          },
          {
            "id": "cfb-nick-saban-b-3",
            "text": "That NFL staff was led by Bill Belichick, and I spent four seasons as his defensive coordinator.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": ["bama"]
          },
          {
            "id": "cfb-nick-saban-b-4",
            "text": "My first college head-coaching season had ended 9-2 with a MAC co-championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": ["bama"]
          },
          {
            "id": "cfb-nick-saban-b-5",
            "text": "At LSU, I won the program's first outright SEC championship since 1986 and later a national title.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": ["bama", "lsu"]
          },
          {
            "id": "cfb-nick-saban-b-6",
            "text": "At Alabama, my 2011 defense allowed only 8.2 points per game and won the national title with a 21-0 victory.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": ["bama"]
          },
          {
            "id": "cfb-nick-saban-b-7",
            "text": "I became the first coach to win back-to-back BCS national championships.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": ["bama"]
          },
          {
            "id": "cfb-nick-saban-b-8",
            "text": "An onside kick I called in the 2015 national championship game helped swing a victory over Clemson.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": ["bama"]
          },
          {
            "id": "cfb-nick-saban-b-9",
            "text": "At Alabama, I won national championships for the 2009, 2011, 2012, 2015, 2017 and 2020 seasons.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": ["bama"]
          },
          {
            "id": "cfb-nick-saban-b-10",
            "text": "With one national championship at LSU and six at Alabama, I finished with seven national titles.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": ["bama", "lsu"]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-brady-quinn",
    "name": "Brady Quinn",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "nd": "https://fightingirish.com/news/2006/12/10/brady-quinn-finishes-third-in-heisman-trophy-balloting",
      "records": "https://fightingirish.com/news/2006/11/21/brady-quinn-named-finalist-for-maxwell-and-o-brien-awards",
      "legacy": "https://fightingirish.com/news/2018/08/07/ot-dish-archive-jan-10-html"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-brady-quinn-a-1",
            "text": "I became a long-term starter at quarterback and finished my college career with more than 11,000 passing yards.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "legacy"
            ]
          },
          {
            "id": "cfb-brady-quinn-a-2",
            "text": "I produced consecutive seasons with more than 3,000 passing yards late in my college career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nd",
              "legacy"
            ]
          },
          {
            "id": "cfb-brady-quinn-a-3",
            "text": "As a junior, I threw for 3,919 yards and 32 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "legacy"
            ]
          },
          {
            "id": "cfb-brady-quinn-a-4",
            "text": "The next season, I threw 35 touchdown passes during the regular season while being intercepted only five times.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nd"
            ]
          },
          {
            "id": "cfb-brady-quinn-a-5",
            "text": "At one point in that senior season, I went 223 consecutive pass attempts without an interception.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nd"
            ]
          },
          {
            "id": "cfb-brady-quinn-a-6",
            "text": "I won the Maxwell Award as the nation's outstanding player in my final college season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nd",
              "legacy"
            ]
          },
          {
            "id": "cfb-brady-quinn-a-7",
            "text": "I also won the Johnny Unitas Golden Arm Award as the nation's top senior quarterback.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "legacy"
            ]
          },
          {
            "id": "cfb-brady-quinn-a-8",
            "text": "I finished fourth in the Heisman voting as a junior and third as a senior.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "legacy",
              "nd"
            ]
          },
          {
            "id": "cfb-brady-quinn-a-9",
            "text": "I left Notre Dame as its career leader in passing yards, completions and touchdown passes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "legacy"
            ]
          },
          {
            "id": "cfb-brady-quinn-a-10",
            "text": "My Notre Dame career from 2003 through 2006 ended with 11,762 passing yards and 95 touchdown passes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "legacy"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-brady-quinn-b-1",
            "text": "My college career included five games with at least 400 passing yards.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "records"
            ]
          },
          {
            "id": "cfb-brady-quinn-b-2",
            "text": "I was the first quarterback in my program's history to post multiple 400-yard passing games.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "records"
            ]
          },
          {
            "id": "cfb-brady-quinn-b-3",
            "text": "One of those performances was a 487-yard game against Michigan State.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "records"
            ]
          },
          {
            "id": "cfb-brady-quinn-b-4",
            "text": "I also became the first quarterback at my school to throw for more than 300 yards in three consecutive games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "records"
            ]
          },
          {
            "id": "cfb-brady-quinn-b-5",
            "text": "By the start of my senior season, I already owned every major school passing record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "records"
            ]
          },
          {
            "id": "cfb-brady-quinn-b-6",
            "text": "I won the Sammy Baugh Award after my 3,919-yard junior season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "legacy"
            ]
          },
          {
            "id": "cfb-brady-quinn-b-7",
            "text": "I helped my team reach BCS bowls in each of my final two seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nd"
            ]
          },
          {
            "id": "cfb-brady-quinn-b-8",
            "text": "I finished my senior regular season with a 10-2 record and a second straight BCS invitation.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nd"
            ]
          },
          {
            "id": "cfb-brady-quinn-b-9",
            "text": "I was the Notre Dame quarterback who won the 2006 Maxwell Award and finished third in that year's Heisman voting.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nd"
            ]
          },
          {
            "id": "cfb-brady-quinn-b-10",
            "text": "I set 36 Notre Dame records and finished with 95 career touchdown passes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "legacy",
              "nd"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-carson-palmer",
    "name": "Carson Palmer",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "usc": "https://usctrojans.com/honors/usc-athletics-hall-of-fame/carson-palmer/122"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-carson-palmer-a-1",
            "text": "I was a four-year starting quarterback whose college career ended with more than 11,000 passing yards.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-a-2",
            "text": "By the end of my career, I had set or tied 33 school and conference records for passing and total offense.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-a-3",
            "text": "In my senior season, I completed 309 passes for 3,942 yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-a-4",
            "text": "That same season, I threw 33 touchdown passes and posted seven 300-yard games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-a-5",
            "text": "I was named my conference's co-Offensive Player of the Year as a senior.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-a-6",
            "text": "I won the Johnny Unitas Golden Arm Award as the nation's top senior quarterback.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-a-7",
            "text": "I became the first quarterback from my school to win the Heisman Trophy.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-a-8",
            "text": "That Heisman ended a 21-year drought for my program.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-a-9",
            "text": "I left USC as the Pac-10 career leader in both total offense and passing yards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-a-10",
            "text": "After winning the 2002 Heisman at USC, I was selected first overall in the 2003 NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-carson-palmer-b-1",
            "text": "I played enough college football to finish with 11,621 yards of total offense.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-b-2",
            "text": "My career passing total reached 11,818 yards.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-b-3",
            "text": "As a senior, I completed 63.2 percent of my passes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-b-4",
            "text": "I threw for at least 300 yards in three consecutive games during that final season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-b-5",
            "text": "I became my program's first first-team All-America quarterback since 1988.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-b-6",
            "text": "The Sporting News and CNN/SI both recognized me as a national player of the year in 2002.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-b-7",
            "text": "My senior season made me the first Heisman winner from the West Coast since 1981.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-b-8",
            "text": "I later entered the College Football Hall of Fame with a résumé built at Southern California.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-b-9",
            "text": "I was USC's fifth Heisman Trophy winner and its first quarterback to claim the award.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          },
          {
            "id": "cfb-carson-palmer-b-10",
            "text": "Cincinnati used the No. 1 overall pick in 2003 on the USC quarterback who had just won the Heisman.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "usc"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-charlie-ward",
    "name": "Charlie Ward",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "fsu": "https://seminoles.com/honors/florida-state-athletics-hall-of-fame/charlie-ward/104"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-charlie-ward-a-1",
            "text": "I was a two-sport college athlete who played quarterback and also spent multiple seasons on the basketball team.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-a-2",
            "text": "On the basketball court, I played on three NCAA Tournament teams.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-a-3",
            "text": "As a senior quarterback, I completed 69.5 percent of my passes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-a-4",
            "text": "That season, I threw for 3,032 yards with 27 touchdowns and only four interceptions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-a-5",
            "text": "I won both the Davey O'Brien Award and the Johnny Unitas Golden Arm Award.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-a-6",
            "text": "I also won the Walter Camp Player of the Year award during that senior season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-a-7",
            "text": "I became my school's first Heisman Trophy winner.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-a-8",
            "text": "My final football season ended with a national championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-a-9",
            "text": "I quarterbacked Florida State's 1993 national championship team.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-a-10",
            "text": "After winning Florida State's first Heisman, I chose professional basketball and became an NBA point guard instead of playing in the NFL.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-charlie-ward-b-1",
            "text": "I was a Georgia native whose college athletic career was split between football and basketball.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-b-2",
            "text": "I hit a game-winning shot in a conference basketball tournament championship game early in my college career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-b-3",
            "text": "I later helped my basketball team reach the Sweet 16 and then come one win from the Final Four.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-b-4",
            "text": "At the time of my school Hall of Fame induction, I still held program basketball records for steals in a game and in a career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-b-5",
            "text": "In football, I finished my senior season with 27 touchdown passes against only four interceptions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-b-6",
            "text": "I became only the second football player ever to win the Sullivan Award as the nation's top amateur athlete.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-b-7",
            "text": "I won essentially every major quarterback and player-of-the-year honor available to me as a senior.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-b-8",
            "text": "My 1993 season delivered both a Heisman Trophy and a national title to Florida State.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-b-9",
            "text": "I later started at point guard for the New York Knicks and played in the 1999 NBA Finals.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "cfb-charlie-ward-b-10",
            "text": "I am the Florida State quarterback-basketball standout who won the 1993 Heisman and then built an NBA career.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-dak-prescott",
    "name": "Dak Prescott",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "msu": "https://hailstate.com/sports/football/roster/dak-prescott/2911",
      "records": "https://hailstate.com/news/2016/1/5/210617290"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-dak-prescott-a-1",
            "text": "I was a dual-threat quarterback who finished college with more than 11,000 yards of total offense.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "msu"
            ]
          },
          {
            "id": "cfb-dak-prescott-a-2",
            "text": "I won a bowl MVP award before my two most productive seasons as a starter.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "msu"
            ]
          },
          {
            "id": "cfb-dak-prescott-a-3",
            "text": "In one season, I rushed for a school-record 986 yards by a quarterback.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "msu"
            ]
          },
          {
            "id": "cfb-dak-prescott-a-4",
            "text": "That same season, I produced 4,435 yards of total offense and was responsible for 41 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "msu"
            ]
          },
          {
            "id": "cfb-dak-prescott-a-5",
            "text": "I finished eighth in the Heisman Trophy voting that year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "msu"
            ]
          },
          {
            "id": "cfb-dak-prescott-a-6",
            "text": "I earned first-team All-SEC honors in each of my final two seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "msu"
            ]
          },
          {
            "id": "cfb-dak-prescott-a-7",
            "text": "I won the Conerly Trophy as Mississippi's top college player in back-to-back seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "msu"
            ]
          },
          {
            "id": "cfb-dak-prescott-a-8",
            "text": "I finished my career with 11,897 yards of total offense and 114 touchdowns responsible for.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "msu"
            ]
          },
          {
            "id": "cfb-dak-prescott-a-9",
            "text": "I wore No. 15 while setting 38 school records at Mississippi State.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "msu"
            ]
          },
          {
            "id": "cfb-dak-prescott-a-10",
            "text": "I left Mississippi State with 9,376 passing yards and 2,521 rushing yards by a quarterback.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "msu"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-dak-prescott-b-1",
            "text": "My final college season was my most accurate, as I completed 66.2 percent of my passes.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "msu",
              "records"
            ]
          },
          {
            "id": "cfb-dak-prescott-b-2",
            "text": "I threw for 3,793 yards and 29 touchdowns that season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "msu",
              "records"
            ]
          },
          {
            "id": "cfb-dak-prescott-b-3",
            "text": "In one late-season road game, I set a school record with 508 passing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "msu",
              "records"
            ]
          },
          {
            "id": "cfb-dak-prescott-b-4",
            "text": "That same game, I was responsible for seven touchdowns, another school record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "msu",
              "records"
            ]
          },
          {
            "id": "cfb-dak-prescott-b-5",
            "text": "I also set a school record by going 239 consecutive pass attempts without an interception in that season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "records"
            ]
          },
          {
            "id": "cfb-dak-prescott-b-6",
            "text": "I won the Senior CLASS Award in my final college season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "msu"
            ]
          },
          {
            "id": "cfb-dak-prescott-b-7",
            "text": "I ended that season as the MVP of the Belk Bowl.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "msu"
            ]
          },
          {
            "id": "cfb-dak-prescott-b-8",
            "text": "My career totals included 70 passing touchdowns plus the third-most quarterback rushing yards in SEC history at the time.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "msu"
            ]
          },
          {
            "id": "cfb-dak-prescott-b-9",
            "text": "I was the Mississippi State quarterback whose school record book listed 15 career, 15 single-season and eight single-game records.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "msu"
            ]
          },
          {
            "id": "cfb-dak-prescott-b-10",
            "text": "The No. 15 quarterback from Mississippi State finished with 38 school records and two Conerly Trophies.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "msu"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-darren-mcfadden",
    "name": "Darren McFadden",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "ark": "https://arkansasrazorbacks.com/darren_mcfadden_1152805/",
      "hof": "https://footballfoundation.org/honors/nff-college-football-hall-of-fame/darren-mcfadden/2439",
      "lsu": "https://arkansasrazorbacks.com/stats/football/2007/ar12.htm"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-darren-mcfadden-a-1",
            "text": "I rushed for more than 1,000 yards in each of my three college seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-a-2",
            "text": "My rushing totals climbed from 1,113 yards as a freshman to 1,647 as a sophomore.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ark",
              "hof"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-a-3",
            "text": "I finished my junior season with 1,830 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-a-4",
            "text": "I earned my conference's Offensive Player of the Year honor in back-to-back seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-a-5",
            "text": "I was a first-team All-American in each of those final two seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-a-6",
            "text": "I became only the second player ever to win the Doak Walker Award twice.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-a-7",
            "text": "I finished second in the Heisman Trophy voting in consecutive years.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-a-8",
            "text": "I won the Walter Camp Player of the Year award in 2007.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-a-9",
            "text": "I left Arkansas as the Razorbacks' all-time leading rusher.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-a-10",
            "text": "I was Arkansas' No. 5 running back known as Run DMC, a two-time Doak Walker winner and two-time Heisman runner-up.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-darren-mcfadden-b-1",
            "text": "Although I was a running back, my college offense also used me as a passer from a direct-snap package.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ark"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-b-2",
            "text": "As a sophomore, I completed seven of nine passes for three touchdowns from that package.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ark"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-b-3",
            "text": "That season also included a 92-yard kickoff return for a touchdown.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ark"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-b-4",
            "text": "Against LSU as a sophomore, I rushed for 182 yards while also completing both of my pass attempts.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ark"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-b-5",
            "text": "A year later against the nation's No. 1-ranked team, I ran for 206 yards and three touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-b-6",
            "text": "In that same upset of No. 1 LSU, I also threw a touchdown pass.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-b-7",
            "text": "My college career ended with 4,590 rushing yards and 41 rushing touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-b-8",
            "text": "I was inducted into the College Football Hall of Fame after starring at Arkansas from 2005 through 2007.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-b-9",
            "text": "The Razorbacks used my passing ability in the Wildcat-style package while I was also becoming their career rushing leader.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ark",
              "hof"
            ]
          },
          {
            "id": "cfb-darren-mcfadden-b-10",
            "text": "I am the Arkansas running back who finished second for the Heisman twice and won consecutive Doak Walker Awards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-ashton-jeanty",
    "name": "Ashton Jeanty",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "boise": "https://broncosports.com/sports/football/roster/ashton-jeanty/10215",
      "awards": "https://broncosports.com/news/2024/12/13/football-ashton-jeanty-wins-doak-walker-award-and-maxwell-award",
      "bowden": "https://broncosports.com/news/2025/1/10/football-jeanty-wins-bobby-bowden-trophy"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-ashton-jeanty-a-1",
            "text": "I produced one of the highest single-season rushing totals in major-college football history.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "bowden"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-a-2",
            "text": "My peak season included 29 rushing touchdowns and 30 total touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "boise"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-a-3",
            "text": "I finished that season with 2,601 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "bowden"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-a-4",
            "text": "That total ranked second in FBS single-season history at the time.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "bowden"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-a-5",
            "text": "I also piled up 2,739 yards from scrimmage and 2,750 all-purpose yards that season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "boise"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-a-6",
            "text": "I won both the Doak Walker Award and the Maxwell Award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "awards"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-a-7",
            "text": "I became the first Group of 5 player to win those two awards in the same season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "awards"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-a-8",
            "text": "My team won a second straight Mountain West title and earned the No. 3 seed in the College Football Playoff.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bowden"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-a-9",
            "text": "I finished my Boise State career as the program's all-time leader with 4,769 rushing yards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bowden"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-a-10",
            "text": "I was the Boise State running back whose 2024 season ended with 2,601 rushing yards plus the Maxwell and Doak Walker awards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "awards"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-ashton-jeanty-b-1",
            "text": "I opened my final college season by setting school single-game records for rushing yards and rushing touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "boise"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-b-2",
            "text": "That opener featured 267 rushing yards and six touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "boise"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-b-3",
            "text": "The next week, I ran for 192 yards and three touchdowns against a top-10 opponent.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "boise"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-b-4",
            "text": "Later that month, I posted 259 rushing yards and four touchdowns in another win.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "boise"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-b-5",
            "text": "I recorded at least 100 rushing yards in all 14 games of that season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "boise"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-b-6",
            "text": "I finished with 1,970 yards after contact, a College Football Playoff-era record.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "bowden"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-b-7",
            "text": "I also forced 164 missed tackles, another CFP-era record.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "bowden"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-b-8",
            "text": "I tied LaDainian Tomlinson's mark with five touchdown runs of at least 70 yards in one season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bowden"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-b-9",
            "text": "I led Boise State to the Fiesta Bowl while averaging 185.8 rushing yards per game.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "bowden"
            ]
          },
          {
            "id": "cfb-ashton-jeanty-b-10",
            "text": "My 2024 Boise State season produced 2,601 rushing yards, 29 rushing touchdowns and two major national awards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "boise",
              "awards"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-calvin-johnson",
    "name": "Calvin Johnson",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "cfbhof": "https://www.cfbhall.com/inductees/calvin-johnson-2018/",
      "pfhof": "https://www.profootballhof.com/players/calvin-johnson"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-calvin-johnson-a-1",
            "text": "I became a three-time first-team all-conference wide receiver in college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-a-2",
            "text": "I earned Freshman All-America honors and was named my conference's Rookie of the Year.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-a-3",
            "text": "I finished my college career with 2,927 receiving yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-a-4",
            "text": "My 28 career touchdown receptions became a school record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-a-5",
            "text": "I also posted 13 career 100-yard receiving games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-a-6",
            "text": "As a junior, I caught 15 touchdown passes and topped 1,200 receiving yards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-a-7",
            "text": "That season, I won the Biletnikoff Award as the nation's top receiver.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhof",
              "pfhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-a-8",
            "text": "I was also named my conference's Player of the Year and finished in the top 10 of the Heisman voting.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-a-9",
            "text": "I left Georgia Tech as its career leader in receiving yards and touchdown catches.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-a-10",
            "text": "After winning the 2006 Biletnikoff at Georgia Tech, I was selected second overall in the 2007 NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhof",
              "pfhof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-calvin-johnson-b-1",
            "text": "I was a 6-foot-5 receiver who made an immediate impact as a freshman.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-b-2",
            "text": "I helped my team reach a bowl game in each of my three college seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-b-3",
            "text": "I became one of only six players from my program to earn first-team All-America honors twice.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-b-4",
            "text": "As a senior-classified junior, I became a unanimous first-team All-American.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-b-5",
            "text": "My final season set school marks for receiving yards, touchdown catches and 100-yard receiving games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-b-6",
            "text": "Those single-season totals were 1,202 receiving yards, 15 touchdown catches and seven 100-yard games.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-b-7",
            "text": "I helped Georgia Tech win its division in 2006.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-b-8",
            "text": "I eventually entered the College Football Hall of Fame after playing for Georgia Tech from 2004 through 2006.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-b-9",
            "text": "Georgia Tech fans knew me as the record-setting receiver who won the 2006 Biletnikoff Award.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-calvin-johnson-b-10",
            "text": "I later became known as Megatron after leaving Georgia Tech as the second overall NFL Draft pick.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhof",
              "pfhof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-larry-fitzgerald",
    "name": "Larry Fitzgerald",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "pitt": "https://pittsburghpanthers.com/sports/general/roster/larry-fitzgerald/8662",
      "hof": "https://pittsburghpanthers.com/honors/pitt-athletics-hall-of-fame/larry-fitzgerald/58",
      "retired": "https://pittsburghpanthers.com/news/2013/7/1/LARRY_FITZGERALD_JOINS_LEGENDARY_LIST_OF_PITT_RETIRED_JERSEYS"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-larry-fitzgerald-a-1",
            "text": "I played only two college seasons but finished with more than 2,600 receiving yards.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-a-2",
            "text": "My college career included 34 touchdown receptions in 26 games.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-a-3",
            "text": "In my second season, I caught 92 passes for 1,672 yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-a-4",
            "text": "I scored 22 receiving touchdowns that season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-a-5",
            "text": "I led the nation in receiving yards per game and touchdown catches.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-a-6",
            "text": "I won the Biletnikoff Award as the nation's top receiver.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-a-7",
            "text": "I became the first sophomore to win the Walter Camp Player of the Year award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-a-8",
            "text": "I finished second in the Heisman Trophy voting, carrying three voting regions.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "retired"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-a-9",
            "text": "My No. 1 jersey was later retired by Pitt.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "retired"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-a-10",
            "text": "I was Pitt's two-year receiving star from 2002-03 before becoming the third overall pick in the 2004 NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-larry-fitzgerald-b-1",
            "text": "I built a college record streak by catching a touchdown pass in game after game across two seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-b-2",
            "text": "That streak eventually reached 18 consecutive games.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-b-3",
            "text": "I set or tied four NCAA records during my brief college career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "retired"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-b-4",
            "text": "I also set eight Big East records and 11 school records.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "retired"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-b-5",
            "text": "My sophomore season included an NCAA-record 18-game touchdown streak and 22 touchdown catches.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "pitt"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-b-6",
            "text": "I was a unanimous first-team All-American in 2003.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-b-7",
            "text": "My Heisman runner-up finish was the highest by a wide receiver since Desmond Howard won in 1991.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "retired"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-b-8",
            "text": "I left college with 161 catches, 2,677 yards and a school-record 34 receiving touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-b-9",
            "text": "The Pitt receiver wearing No. 1 became one of the defining college stars of the 2003 season.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "pitt"
            ]
          },
          {
            "id": "cfb-larry-fitzgerald-b-10",
            "text": "I am the Pitt wideout who won the Biletnikoff and Walter Camp awards before finishing second for the 2003 Heisman.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-brock-bowers",
    "name": "Brock Bowers",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "uga": "https://georgiadogs.com/sports/football/roster/brock--bowers/7345"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-brock-bowers-a-1",
            "text": "I became an immediate receiving centerpiece as a true freshman tight end.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-a-2",
            "text": "I led my team in receiving in each of my first three college seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-a-3",
            "text": "As a freshman, I caught 56 passes for 882 yards and 13 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-a-4",
            "text": "Those 13 touchdown catches set a school single-season record for any pass catcher.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-a-5",
            "text": "I was named both the conference coaches' Freshman of the Year and the FWAA Freshman of the Year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-a-6",
            "text": "As a sophomore, I led my team with 63 catches for 942 yards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-a-7",
            "text": "I became my program's first winner of the John Mackey Award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-a-8",
            "text": "A year later, I became the first player ever to win the Mackey Award in back-to-back seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-a-9",
            "text": "I wore No. 19 while helping Georgia win back-to-back national championships.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-a-10",
            "text": "I was Georgia's three-time first-team All-America tight end and the first back-to-back Mackey Award winner.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-brock-bowers-b-1",
            "text": "My college offense used me not only as a tight end but occasionally as a runner.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-b-2",
            "text": "As a freshman, I scored on an 89-yard reception and also produced a rushing touchdown.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-b-3",
            "text": "I set a conference championship-game record for a tight end with 10 receptions as a freshman.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-b-4",
            "text": "The next season, three of my nine rushing attempts ended in touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-b-5",
            "text": "I caught seven passes for 152 yards and a touchdown in a national championship game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-b-6",
            "text": "As a junior, I posted a career-high 157 receiving yards at Auburn, including the game-winning touchdown.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-b-7",
            "text": "I became only the third player in school history to earn first-team All-America honors three times.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-b-8",
            "text": "The other two players in that school trio were Herschel Walker and David Pollack.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-b-9",
            "text": "I was Georgia's No. 19 tight end during the program's 2021 and 2022 national-title seasons.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          },
          {
            "id": "cfb-brock-bowers-b-10",
            "text": "My Georgia career featured two national titles and consecutive John Mackey Awards in 2022 and 2023.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "uga"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-aaron-donald",
    "name": "Aaron Donald",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "pitt": "https://pittsburghpanthers.com/honors/pitt-athletics-hall-of-fame/aaron-donald/78",
      "acc": "https://pittsburghpanthers.com/news/2013/12/4/aaron_donald_named_acc_defensive_player_of_the_year",
      "hof": "https://pittsburghpanthers.com/news/2026/1/14/legendary-pitt-defensive-lineman-aaron-donald-elected-to-college-football-hall-of-fame"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-aaron-donald-a-1",
            "text": "I was an interior defensive lineman who accumulated 66 tackles for loss during my college career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-aaron-donald-a-2",
            "text": "That career tackles-for-loss total became the most by an FBS interior defensive lineman since the NCAA began tracking the statistic.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-aaron-donald-a-3",
            "text": "As a senior, I led the nation with 28.5 tackles for loss.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-aaron-donald-a-4",
            "text": "I also recorded 11 sacks and forced four fumbles that season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-aaron-donald-a-5",
            "text": "I was named my conference's Defensive Player of the Year as a senior.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "acc"
            ]
          },
          {
            "id": "cfb-aaron-donald-a-6",
            "text": "I won the Bronko Nagurski Trophy and the Chuck Bednarik Award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "pitt"
            ]
          },
          {
            "id": "cfb-aaron-donald-a-7",
            "text": "I also won the Outland Trophy and the Rotary Lombardi Award in the same season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "pitt"
            ]
          },
          {
            "id": "cfb-aaron-donald-a-8",
            "text": "That four-award sweep came with unanimous first-team All-America honors.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-aaron-donald-a-9",
            "text": "Pitt later retired the No. 97 jersey I wore for the Panthers.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "cfb-aaron-donald-a-10",
            "text": "I was Pitt's dominant 2013 defensive tackle before the Rams selected me 13th overall in the 2014 NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "pitt"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-aaron-donald-b-1",
            "text": "I stayed close to home for college after starring at a high school in western Pennsylvania.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "cfb-aaron-donald-b-2",
            "text": "I contributed immediately as a freshman and developed into one of the nation's most disruptive linemen.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "cfb-aaron-donald-b-3",
            "text": "By my senior season, I had reached 28.5 career sacks before the year was even complete.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "acc"
            ]
          },
          {
            "id": "cfb-aaron-donald-b-4",
            "text": "I collected five National Defensive Player of the Week honors during that final college season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "acc"
            ]
          },
          {
            "id": "cfb-aaron-donald-b-5",
            "text": "A blocked extra point I made against Syracuse proved decisive in a one-point win.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "acc"
            ]
          },
          {
            "id": "cfb-aaron-donald-b-6",
            "text": "My final season ended with 28.5 tackles for loss, 11 sacks and four forced fumbles.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          },
          {
            "id": "cfb-aaron-donald-b-7",
            "text": "I swept four of the biggest national awards available to defensive and interior linemen.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "pitt"
            ]
          },
          {
            "id": "cfb-aaron-donald-b-8",
            "text": "I later entered the College Football Hall of Fame after my No. 97 had been retired by Pitt.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "cfb-aaron-donald-b-9",
            "text": "My Pittsburgh college career ended as one of the most decorated defensive seasons in program history.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "pitt"
            ]
          },
          {
            "id": "cfb-aaron-donald-b-10",
            "text": "I am the Pitt No. 97 who won the Nagurski, Bednarik, Outland and Lombardi awards in 2013.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "hof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-ndamukong-suh",
    "name": "Ndamukong Suh",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "nebraska": "https://huskers.com/sports/football/roster/player/ndamukong-suh",
      "hall": "https://huskers.com/nebraska-athletics-hall-of-famers-s",
      "cfbhof": "https://huskers.com/news/2026/01/14/suh-selected-for-college-football-hall-of-fame"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-ndamukong-suh-a-1",
            "text": "I was an interior defensive lineman who finished my college career with more than 200 tackles.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hall"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-a-2",
            "text": "My career totals included 57 tackles for loss and 24 sacks.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hall"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-a-3",
            "text": "As a senior, I led my team with 85 tackles from the defensive tackle position.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hall"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-a-4",
            "text": "That season also included 12 sacks, 10 pass breakups and three blocked kicks.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hall"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-a-5",
            "text": "I was named my conference's Defensive Player of the Year and Defensive Lineman of the Year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nebraska",
              "cfbhof"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-a-6",
            "text": "I won both the Outland Trophy and the Lombardi Award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nebraska"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-a-7",
            "text": "I also won the Bronko Nagurski Trophy and the Chuck Bednarik Award in the same season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nebraska",
              "hall"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-a-8",
            "text": "I became the first defensive player to win the Associated Press College Football Player of the Year award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nebraska",
              "hall"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-a-9",
            "text": "I finished fourth in the 2009 Heisman voting while starring at Nebraska.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nebraska",
              "cfbhof"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-a-10",
            "text": "I was Nebraska's No. 93 defensive tackle whose 2009 season swept the Outland, Lombardi, Nagurski and Bednarik awards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "nebraska",
              "hall"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-ndamukong-suh-b-1",
            "text": "A knee injury early in my college career led to a medical redshirt.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nebraska"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-b-2",
            "text": "I later became a two-time defensive MVP for my college team.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "nebraska"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-b-3",
            "text": "My senior-season defense led the nation in scoring defense, allowing a little over 10 points per game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-b-4",
            "text": "In my conference championship game as a senior, I tied a school record with seven tackles for loss.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-b-5",
            "text": "I became the first defensive tackle invited to the Heisman ceremony in 15 years.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "nebraska"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-b-6",
            "text": "My fourth-place Heisman finish matched the best by a defensive lineman since 1972.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nebraska",
              "cfbhof"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-b-7",
            "text": "I was a unanimous first-team All-American in my final college season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "nebraska",
              "hall"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-b-8",
            "text": "Nebraska later retired my No. 93 jersey and selected me for its athletics Hall of Fame.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hall"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-b-9",
            "text": "I became a College Football Hall of Famer after one of the most decorated defensive seasons in Nebraska history.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "cfbhof"
            ]
          },
          {
            "id": "cfb-ndamukong-suh-b-10",
            "text": "Detroit selected me second overall in 2010 after my dominant senior season at Nebraska.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hall",
              "cfbhof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-von-miller",
    "name": "Von Miller",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "tamu": "https://12thman.com/news/2010/12/07/big-12-sack-leader-miller-receives-butkus-award",
      "tshof": "https://tshof.org/inductee/miller-von/"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-von-miller-a-1",
            "text": "I developed into one of college football's top edge rushers after beginning my career at linebacker.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "tshof"
            ]
          },
          {
            "id": "cfb-von-miller-a-2",
            "text": "My breakout junior season ended with an NCAA-leading 17 quarterback sacks.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "tshof"
            ]
          },
          {
            "id": "cfb-von-miller-a-3",
            "text": "That 17-sack season earned me first-team All-America recognition.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tamu"
            ]
          },
          {
            "id": "cfb-von-miller-a-4",
            "text": "I considered entering the NFL Draft after that junior season but returned for my senior year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tamu"
            ]
          },
          {
            "id": "cfb-von-miller-a-5",
            "text": "As a senior, I recorded 9.5 sacks and 14.5 tackles for loss before the bowl game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tamu"
            ]
          },
          {
            "id": "cfb-von-miller-a-6",
            "text": "I led the Big 12 in sacks for a second consecutive season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tamu"
            ]
          },
          {
            "id": "cfb-von-miller-a-7",
            "text": "I was a unanimous All-Big 12 selection as a senior.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tamu"
            ]
          },
          {
            "id": "cfb-von-miller-a-8",
            "text": "I won the 2010 Butkus Award as the nation's top collegiate linebacker.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "tshof"
            ]
          },
          {
            "id": "cfb-von-miller-a-9",
            "text": "I finished my Texas A&M career with 33 sacks.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tshof"
            ]
          },
          {
            "id": "cfb-von-miller-a-10",
            "text": "I was the Texas A&M pass rusher who won the 2010 Butkus Award before going second overall in the 2011 NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tamu",
              "tshof"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-von-miller-b-1",
            "text": "I was a Texas high school product who stayed in-state for college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tshof"
            ]
          },
          {
            "id": "cfb-von-miller-b-2",
            "text": "My two biggest college seasons both ended with me leading my conference in sacks.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tamu"
            ]
          },
          {
            "id": "cfb-von-miller-b-3",
            "text": "I forced three fumbles and recovered two more during my senior regular season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tamu"
            ]
          },
          {
            "id": "cfb-von-miller-b-4",
            "text": "I also knocked down six passes that year from my linebacker role.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tamu"
            ]
          },
          {
            "id": "cfb-von-miller-b-5",
            "text": "My return for my senior season coincided with a major statistical improvement by my team's defense.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tamu"
            ]
          },
          {
            "id": "cfb-von-miller-b-6",
            "text": "I followed an NCAA-best 17-sack junior year with another 9.5 sacks as a senior.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tamu"
            ]
          },
          {
            "id": "cfb-von-miller-b-7",
            "text": "My college career closed with consensus All-America honors and 33 sacks.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tshof"
            ]
          },
          {
            "id": "cfb-von-miller-b-8",
            "text": "The defining individual award of my senior year was named for Dick Butkus.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "tamu"
            ]
          },
          {
            "id": "cfb-von-miller-b-9",
            "text": "I became Texas A&M's Butkus-winning linebacker after leading the Big 12 in sacks in back-to-back seasons.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tamu"
            ]
          },
          {
            "id": "cfb-von-miller-b-10",
            "text": "Denver used the second pick of the 2011 NFL Draft on the Texas A&M defender who had just won the Butkus Award.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tshof"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-charles-woodson",
    "name": "Charles Woodson",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "michigan": "https://mgoblue.com/news/2018/1/6/charles-woodson-named-to-college-football-hall-of-fame",
      "title": "https://mgoblue.com/sports/2017/6/16/football-1997-national-champion",
      "heisman": "https://mgoblue.com/sports/2017/6/16/football-heisman-trophy-history"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-charles-woodson-a-1",
            "text": "I was a defensive back whose college team also used me on offense and special teams.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "michigan"
            ]
          },
          {
            "id": "cfb-charles-woodson-a-2",
            "text": "I earned first-team all-conference honors in each of my three college seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "michigan"
            ]
          },
          {
            "id": "cfb-charles-woodson-a-3",
            "text": "I became a two-time first-team All-American.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "michigan"
            ]
          },
          {
            "id": "cfb-charles-woodson-a-4",
            "text": "In my final regular-season game, I intercepted a pass, caught a 37-yard pass and returned a punt 78 yards for a touchdown.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "michigan"
            ]
          },
          {
            "id": "cfb-charles-woodson-a-5",
            "text": "That performance helped clinch an outright conference championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "michigan"
            ]
          },
          {
            "id": "cfb-charles-woodson-a-6",
            "text": "I won the Jim Thorpe Award, the Bronko Nagurski Trophy and the Chuck Bednarik Award in the same season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "title"
            ]
          },
          {
            "id": "cfb-charles-woodson-a-7",
            "text": "I also won the Walter Camp Award that year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "title"
            ]
          },
          {
            "id": "cfb-charles-woodson-a-8",
            "text": "I became the first primarily defensive player to win the Heisman Trophy.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "title",
              "heisman"
            ]
          },
          {
            "id": "cfb-charles-woodson-a-9",
            "text": "I wore No. 2 for an undefeated Michigan team that won the 1997 national championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "title"
            ]
          },
          {
            "id": "cfb-charles-woodson-a-10",
            "text": "I was Michigan's 1997 Heisman-winning cornerback, receiver and returner.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "heisman"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-charles-woodson-b-1",
            "text": "My final college team completed a perfect 12-0 season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "title"
            ]
          },
          {
            "id": "cfb-charles-woodson-b-2",
            "text": "That defense allowed only 9.5 points per game.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "title"
            ]
          },
          {
            "id": "cfb-charles-woodson-b-3",
            "text": "In the Rose Bowl, I intercepted a pass in the end zone.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "title",
              "michigan"
            ]
          },
          {
            "id": "cfb-charles-woodson-b-4",
            "text": "I also tied the Rose Bowl record at the time with four pass breakups.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "title",
              "michigan"
            ]
          },
          {
            "id": "cfb-charles-woodson-b-5",
            "text": "That 21-16 Rose Bowl win completed an undefeated national championship season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "title"
            ]
          },
          {
            "id": "cfb-charles-woodson-b-6",
            "text": "I was voted Big Ten MVP by the conference's coaches.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "title"
            ]
          },
          {
            "id": "cfb-charles-woodson-b-7",
            "text": "I was also a two-time Big Ten Defensive Player of the Year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "michigan"
            ]
          },
          {
            "id": "cfb-charles-woodson-b-8",
            "text": "My 1997 award haul included the Heisman, Walter Camp, Nagurski, Bednarik and Thorpe honors.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "michigan"
            ]
          },
          {
            "id": "cfb-charles-woodson-b-9",
            "text": "Michigan's No. 2 made his signature late-season impact against Ohio State and then Washington State in the Rose Bowl.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "michigan",
              "title"
            ]
          },
          {
            "id": "cfb-charles-woodson-b-10",
            "text": "I am the Michigan defender who won the 1997 Heisman while leading a perfect national-title team.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "title",
              "heisman"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-ed-reed",
    "name": "Ed Reed",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "miami": "https://miamihurricanes.com/sports/football/roster/player/edward-reed",
      "aa": "https://miamihurricanes.com/news/2002/04/30/205536772-2"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-ed-reed-a-1",
            "text": "I became a multi-year starter in the secondary and developed a reputation for creating turnovers.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "miami"
            ]
          },
          {
            "id": "cfb-ed-reed-a-2",
            "text": "Over my final two college seasons, I intercepted 17 passes.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "miami",
              "aa"
            ]
          },
          {
            "id": "cfb-ed-reed-a-3",
            "text": "I earned consensus first-team All-America honors in consecutive seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "miami",
              "aa"
            ]
          },
          {
            "id": "cfb-ed-reed-a-4",
            "text": "As a senior, I led the nation in interceptions per game and finished with nine picks.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "miami"
            ]
          },
          {
            "id": "cfb-ed-reed-a-5",
            "text": "I also broke up 18 passes during that senior season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "miami"
            ]
          },
          {
            "id": "cfb-ed-reed-a-6",
            "text": "I was named my conference's co-Defensive Player of the Year.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "miami"
            ]
          },
          {
            "id": "cfb-ed-reed-a-7",
            "text": "I finished my career with school records of 21 interceptions and 389 interception-return yards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "miami",
              "aa"
            ]
          },
          {
            "id": "cfb-ed-reed-a-8",
            "text": "My final college team led the nation in scoring defense, pass-efficiency defense and turnover margin.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "miami"
            ]
          },
          {
            "id": "cfb-ed-reed-a-9",
            "text": "I wore No. 20 while helping Miami complete an undefeated 2001 national championship season.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "miami"
            ]
          },
          {
            "id": "cfb-ed-reed-a-10",
            "text": "I closed my Miami career with nine tackles in a 37-14 Rose Bowl win over Nebraska for the national title.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "miami"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-ed-reed-b-1",
            "text": "I scored five college touchdowns on interception returns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "aa"
            ]
          },
          {
            "id": "cfb-ed-reed-b-2",
            "text": "My blocked kicks and takeaways helped produce 106 points for my team across my career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "miami",
              "aa"
            ]
          },
          {
            "id": "cfb-ed-reed-b-3",
            "text": "As a junior, I ranked third nationally with eight interceptions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "miami"
            ]
          },
          {
            "id": "cfb-ed-reed-b-4",
            "text": "As a senior, I returned three interceptions for touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "miami"
            ]
          },
          {
            "id": "cfb-ed-reed-b-5",
            "text": "In a road win at Florida State, I intercepted two passes and blocked a punt despite playing with a shoulder injury.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "miami"
            ]
          },
          {
            "id": "cfb-ed-reed-b-6",
            "text": "Late in another close road game, I took a lateral after a teammate's interception and raced 80 yards to seal the win.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "miami"
            ]
          },
          {
            "id": "cfb-ed-reed-b-7",
            "text": "I set my school's career interception record by picking off two passes at Virginia Tech.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "miami"
            ]
          },
          {
            "id": "cfb-ed-reed-b-8",
            "text": "I started 48 of 49 games in my college career and finished as a two-time consensus All-American.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "miami",
              "aa"
            ]
          },
          {
            "id": "cfb-ed-reed-b-9",
            "text": "I was the Miami safety whose final season featured nine interceptions and a national championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "miami"
            ]
          },
          {
            "id": "cfb-ed-reed-b-10",
            "text": "The No. 20 safety left Miami as its career leader in interceptions and interception-return yards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "miami",
              "aa"
            ]
          }
        ]
      }
    }
  },
  {
    "league": "CFB",
    "subjectId": "cfb-jayden-daniels",
    "name": "Jayden Daniels",
    "stageFocus": "CFB-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "lsu": "https://lsusports.net/sports/fb/roster/player/jayden-daniels",
      "florida": "https://lsusports.net/news/2023/11/11/daniels-adds-to-heisman-campaign-football-beats-florida-52-35"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "cfb-jayden-daniels-a-1",
            "text": "I was a five-year starting college quarterback who finished with more than 12,000 passing yards and 3,000 rushing yards.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-jayden-daniels-a-2",
            "text": "I became the first player in FBS history to reach both of those career thresholds.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-jayden-daniels-a-3",
            "text": "My final season included 3,812 passing yards and 40 touchdown passes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-jayden-daniels-a-4",
            "text": "I also rushed for 1,134 yards in that season, a school record for a quarterback.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-jayden-daniels-a-5",
            "text": "My 208.0 passer rating set an FBS single-season record.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-jayden-daniels-a-6",
            "text": "I won the Davey O'Brien Award, the Johnny Unitas Golden Arm Award and the Manning Award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-jayden-daniels-a-7",
            "text": "I was named both SEC Offensive Player of the Year and a consensus All-American.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-jayden-daniels-a-8",
            "text": "I won the 2023 Heisman Trophy, becoming the third winner in LSU history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-jayden-daniels-a-9",
            "text": "I wore No. 5 at LSU while producing one of the most explosive quarterback seasons in SEC history.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-jayden-daniels-a-10",
            "text": "I was LSU's 2023 Heisman-winning quarterback before Washington selected me second overall in the 2024 NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "cfb-jayden-daniels-b-1",
            "text": "I started 55 college games across two programs.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-jayden-daniels-b-2",
            "text": "I played 29 games at my first school before transferring and playing 26 more at my final school.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-jayden-daniels-b-3",
            "text": "My career totals reached 12,749 passing yards and 3,307 rushing yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-jayden-daniels-b-4",
            "text": "I accounted for 124 touchdowns across my college career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-jayden-daniels-b-5",
            "text": "In one senior-season game, I became the first FBS player to pass for at least 350 yards and rush for at least 200 yards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "florida"
            ]
          },
          {
            "id": "cfb-jayden-daniels-b-6",
            "text": "That performance against Florida produced an SEC-record 606 yards of total offense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu",
              "florida"
            ]
          },
          {
            "id": "cfb-jayden-daniels-b-7",
            "text": "I threw for 372 yards and ran for 234 more in that game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "florida"
            ]
          },
          {
            "id": "cfb-jayden-daniels-b-8",
            "text": "After transferring from Arizona State, I finished my career at LSU with 6,725 passing yards and 2,019 rushing yards in two seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-jayden-daniels-b-9",
            "text": "I joined Billy Cannon and Joe Burrow as LSU Heisman Trophy winners.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          },
          {
            "id": "cfb-jayden-daniels-b-10",
            "text": "I am the Arizona State transfer who became LSU's 2023 Heisman-winning No. 5 quarterback.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lsu"
            ]
          }
        ]
      }
    }
  }
] as const;

const authoredByKey = new Map(
  footballWhoAmIAuthoredIdentities.map((identity) => [`${identity.league}:${identity.name}`, identity] as const),
);

export function getFootballWhoAmIAuthoredIdentity(
  league: FootballWhoAmIAuthoredLeague,
  name: string,
) {
  return authoredByKey.get(`${league}:${name}`) ?? null;
}

export function footballWhoAmIAuthoredScript(
  league: FootballWhoAmIAuthoredLeague,
  name: string,
  scriptId: FootballWhoAmIAuthoredScriptId,
) {
  return getFootballWhoAmIAuthoredIdentity(league, name)?.scripts[scriptId] ?? null;
}
