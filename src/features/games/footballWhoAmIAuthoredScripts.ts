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
    "subjectId": "patrick-mahomes",
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
    "subjectId": "josh-allen",
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
    "subjectId": "lamar-jackson",
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
    "subjectId": "aaron-rodgers",
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
    "subjectId": "calvin-johnson",
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
    "subjectId": "troy-polamalu",
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
  },
  {
    "league": "CFB",
    "subjectId": "cfb-nick-saban",
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
