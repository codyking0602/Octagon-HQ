import type { WhoAmIClueBand, WhoAmIEraBand } from "./whoAmIEngine";
import { nbaWhoAmIAuthoredBatch1 } from "./nbaWhoAmIAuthoredBatch1";
import { nbaWhoAmIAuthoredBatch2 } from "./nbaWhoAmIAuthoredBatch2";
import { nbaWhoAmIAuthoredBatch3 } from "./nbaWhoAmIAuthoredBatch3";
import { nbaWhoAmIAuthoredBatch4 } from "./nbaWhoAmIAuthoredBatch4";

export type NbaWhoAmIAuthoredScriptId = "A" | "B";
export interface NbaWhoAmIAuthoredClue {
  id: string;
  text: string;
  band: WhoAmIClueBand;
  verification: "verified";
  sourceIds: readonly string[];
}
export interface NbaWhoAmIAuthoredIdentity {
  subjectId: string;
  name: string;
  eraBand: WhoAmIEraBand;
  rescueGroup: string;
  earlyRotation: "normal" | "deprioritized";
  sources: Readonly<Record<string, string>>;
  scripts: Readonly<Record<NbaWhoAmIAuthoredScriptId, { id: NbaWhoAmIAuthoredScriptId; clues: readonly NbaWhoAmIAuthoredClue[] }>>;
}

/**
 * NBA Who Am I calibration batch: editorially authored A and B ladders per player.
 * Ten source-backed clues each, in the SAME broad/broad/helpful/helpful/helpful/
 * strong/strong/strong/giveaway/giveaway order as UFC and Football.
 * No runtime clue generation, no duplication of game engine or scoring logic.
 * Expand after owner clue-quality review; do not treat this pilot as the launch bank.
 */
const nbaWhoAmIApprovedCalibrationIdentities = [
  {
    "subjectId": "nba:michael-jordan",
    "name": "Michael Jordan",
    "eraBand": "legacy",
    "rescueGroup": "wing",
    "earlyRotation": "normal",
    "sources": {
      "profile": "https://www.nba.com/news/history-nba-legend-michael-jordan",
      "finals": "https://www.nba.com/news/history-season-recaps-index"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-michael-jordan-a-1",
            "text": "I earned Rookie of the Year before becoming a regular presence on All-NBA and All-Defensive teams.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-2",
            "text": "I reached consecutive conference finals before my team captured its first championship.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-3",
            "text": "I won more than one NBA All-Star Game MVP award over my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-4",
            "text": "I led the league in scoring in multiple seasons before winning my first championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-5",
            "text": "I won the scoring title and Defensive Player of the Year in the same season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-6",
            "text": "I scored 63 points in a playoff loss early in my career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-7",
            "text": "I stepped away from basketball to play minor-league baseball, then returned to the NBA.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-8",
            "text": "After one comeback, my team set an NBA record with 72 regular-season wins.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-9",
            "text": "I won six titles and six Finals MVP awards with Chicago.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-10",
            "text": "I became the No. 23 Bulls icon behind the Air Jordan name.",
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
            "id": "nba-michael-jordan-b-1",
            "text": "I became a multiple-time league MVP after earning Rookie of the Year honors.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-b-2",
            "text": "I was recognized as an elite defender despite winning numerous scoring titles.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-b-3",
            "text": "I reached several conference finals before winning my first NBA championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "finals"
            ]
          },
          {
            "id": "nba-michael-jordan-b-4",
            "text": "I won the Finals MVP award in three straight seasons before a break in my title run.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "finals"
            ]
          },
          {
            "id": "nba-michael-jordan-b-5",
            "text": "I finished my career with ten NBA scoring titles.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-b-6",
            "text": "I returned to the league and helped a team win 72 games in a single regular season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-b-7",
            "text": "My championship partner Scottie Pippen played alongside me under Phil Jackson.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-b-8",
            "text": "My final championship came against Utah in 1998, with a decisive late basket in Game 6.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "finals"
            ]
          },
          {
            "id": "nba-michael-jordan-b-9",
            "text": "I won each of my six titles with the Chicago Bulls.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-b-10",
            "text": "I wore No. 23 and became known as His Airness.",
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
    "subjectId": "nba:kobe-bryant",
    "name": "Kobe Bryant",
    "eraBand": "legacy",
    "rescueGroup": "wing",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.hoophall.com/hall-of-famers/kobe-bryant",
      "archive": "https://www.nba.com/archive-75-kobe-bryant"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-kobe-bryant-a-1",
            "text": "I earned repeated All-NBA and All-Defensive selections while carrying a heavy scoring load.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-2",
            "text": "I won multiple NBA scoring titles and later finished among the league's career scoring leaders.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-3",
            "text": "I entered the NBA at an unusually young age and did not immediately become a full-time starter.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-4",
            "text": "My first three titles came before I won a regular-season MVP award.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-5",
            "text": "I was chosen for eighteen NBA All-Star Games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-6",
            "text": "I played all twenty of my NBA seasons for the same franchise.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-7",
            "text": "I was named Finals MVP in consecutive championship seasons in 2009 and 2010.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-8",
            "text": "My first three championship runs featured Shaquille O'Neal as a teammate.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-9",
            "text": "I scored 81 points against Toronto in a 2006 regular-season game.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-10",
            "text": "The Lakers retired both my No. 8 and No. 24 jerseys.",
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
            "id": "nba-kobe-bryant-b-1",
            "text": "I began my professional career as a teenager and grew into a perennial All-NBA selection.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-2",
            "text": "My career included scoring championships as well as repeated All-Defensive First Team honors.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-3",
            "text": "I won two Olympic gold medals after establishing myself as an NBA champion.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-4",
            "text": "I developed into one of the league's most prolific career scorers.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-5",
            "text": "I finished my NBA career with 33,643 regular-season points.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-6",
            "text": "Every one of my twenty NBA seasons came with the Los Angeles Lakers.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-7",
            "text": "I scored 60 points in the final game of my NBA career in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-8",
            "text": "I won five championships, including three alongside Shaquille O'Neal.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-9",
            "text": "My competitive alter ego was known as the Black Mamba.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-10",
            "text": "My Los Angeles career is remembered through two retired jersey numbers: 8 and 24.",
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
    "subjectId": "nba:lebron-james",
    "name": "LeBron James",
    "eraBand": "modern",
    "rescueGroup": "wing",
    "earlyRotation": "normal",
    "sources": {
      "archive": "https://www.nba.com/news/archive-75-lebron-james",
      "decision": "https://www.nba.com/news/legendary-moments-lebron-james-decision-miami-heat",
      "block": "https://www.nba.com/news/history-finals-moments-lebron-chasedown-block-2016",
      "finals": "https://www.nba.com/news/history-finals-mvp-winners",
      "scoring": "https://www.nba.com/news/lebron-james-scoring-tracker"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-lebron-james-a-1",
            "text": "I earned Rookie of the Year honors and later led the NBA in scoring for a season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-a-2",
            "text": "I reached the NBA Finals before winning my first regular-season MVP award.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-a-3",
            "text": "I made multiple All-Defensive First Teams while also running my team's offense.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-a-4",
            "text": "I won a regular-season MVP award several years before winning a championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-a-5",
            "text": "One of my early championship chances ended in a Finals defeat against Dallas in 2011.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "decision"
            ]
          },
          {
            "id": "nba-lebron-james-a-6",
            "text": "My first two NBA titles came in consecutive seasons alongside other established All-Stars.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "decision"
            ]
          },
          {
            "id": "nba-lebron-james-a-7",
            "text": "I spent part of my career in Miami before returning to the Cleveland team that drafted me.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "decision"
            ]
          },
          {
            "id": "nba-lebron-james-a-8",
            "text": "I led a comeback from a 3-1 Finals deficit against Golden State in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "block"
            ]
          },
          {
            "id": "nba-lebron-james-a-9",
            "text": "I won Finals MVP with Miami, Cleveland and the Los Angeles Lakers.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-a-10",
            "text": "I passed Kareem Abdul-Jabbar to become the NBA's all-time leading scorer.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "finals"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nba-lebron-james-b-1",
            "text": "I became a perennial NBA All-Star without playing college basketball.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-b-2",
            "text": "I earned repeated All-NBA selections over a long career that included several deep playoff runs.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-b-3",
            "text": "I made the NBA Finals in my fourth professional season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "decision"
            ]
          },
          {
            "id": "nba-lebron-james-b-4",
            "text": "I earned an NBA scoring title before capturing my first championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-b-5",
            "text": "In a 2007 conference finals game, I scored my team's last 25 points.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "decision"
            ]
          },
          {
            "id": "nba-lebron-james-b-6",
            "text": "I won back-to-back regular-season MVP awards twice, in two different stretches.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-b-7",
            "text": "I won consecutive NBA championships after joining Dwyane Wade and Chris Bosh in Miami.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-b-8",
            "text": "A famous road performance in Boston helped save my team's 2012 playoff run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "block"
            ]
          },
          {
            "id": "nba-lebron-james-b-9",
            "text": "I became the first player to earn Finals MVP with three different franchises.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "finals"
            ]
          },
          {
            "id": "nba-lebron-james-b-10",
            "text": "I won championships with the Heat, Cavaliers and Lakers and broke the NBA career points record.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "scoring"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "nba:stephen-curry",
    "name": "Stephen Curry",
    "eraBand": "modern",
    "rescueGroup": "guard",
    "earlyRotation": "normal",
    "sources": {
      "archive": "https://www.nba.com/news/archive-75-stephen-curry",
      "finals": "https://www.nba.com/news/stephen-curry-wins-2022-bill-russell-nba-finals-mvp-award",
      "hof": "https://www.nba.com/news/stephen-curry-honored-with-hall-of-fame-exhibit",
      "records": "https://www.nba.com/news/history-top-moments-warriors-win-record-73-games"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-stephen-curry-a-1",
            "text": "I became a league MVP after beginning my basketball career without a major recruiting profile.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-a-2",
            "text": "My team returned to the playoffs after a lengthy absence before becoming a championship contender.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-a-3",
            "text": "I went from a small-conference college program to being selected in the NBA lottery.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-a-4",
            "text": "I helped a franchise end a championship drought that had lasted several decades.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-a-5",
            "text": "I won consecutive regular-season MVP awards in the middle of the 2010s.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-a-6",
            "text": "During my second MVP season, I averaged more than 30 points per game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "records"
            ]
          },
          {
            "id": "nba-stephen-curry-a-7",
            "text": "I helped a team win a record 73 games during the 2015-16 regular season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "records"
            ]
          },
          {
            "id": "nba-stephen-curry-a-8",
            "text": "I scored 43 points in a 2022 NBA Finals game against Boston.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "records"
            ]
          },
          {
            "id": "nba-stephen-curry-a-9",
            "text": "I became the first unanimous NBA MVP and the league's career leader in made threes.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-a-10",
            "text": "Wearing No. 30 for Golden State, I won four championships and the 2022 Finals MVP.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "finals"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nba-stephen-curry-b-1",
            "text": "I made my first All-Star Game after several seasons of developing in the NBA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-2",
            "text": "I became an offensive centerpiece on teams that reached the NBA Finals repeatedly.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-3",
            "text": "I grew into a multiple-time All-Star after spending my first few NBA seasons establishing myself.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-4",
            "text": "I won more than one NBA scoring title during my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-5",
            "text": "In one regular season, I made more than 400 three-pointers.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-6",
            "text": "My college tournament breakout came at Davidson, far from a traditional basketball power.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "records"
            ]
          },
          {
            "id": "nba-stephen-curry-b-7",
            "text": "I hit twelve three-pointers, including an overtime winner, against Oklahoma City in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-8",
            "text": "I won two NBA championships alongside Kevin Durant with Golden State.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-9",
            "text": "I was the first unanimous regular-season MVP in league history.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-10",
            "text": "I earned my first Finals MVP in 2022 after winning a fourth Warriors championship.",
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
    "subjectId": "nba:tim-duncan",
    "name": "Tim Duncan",
    "eraBand": "legacy",
    "rescueGroup": "big",
    "earlyRotation": "normal",
    "sources": {
      "archive": "https://www.nba.com/news/archive-75-tim-duncan",
      "mvp": "https://www.nba.com/news/history-mvp-award-winners",
      "recap": "https://www.nba.com/news/history-season-recaps-index",
      "spursTimeline": "https://www.nba.com/spurs/duncanhof"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-tim-duncan-a-1",
            "text": "I was an All-NBA selection from the first season of a lengthy professional career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-a-2",
            "text": "My teams relied on disciplined defense as much as the production of their leading scorer.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-a-3",
            "text": "I earned both All-NBA First Team and All-Defensive Second Team recognition as a rookie.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "spursTimeline"
            ]
          },
          {
            "id": "nba-tim-duncan-a-4",
            "text": "I earned a Finals MVP award before I ever won a regular-season MVP.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "spursTimeline"
            ]
          },
          {
            "id": "nba-tim-duncan-a-5",
            "text": "I collected consecutive NBA MVP awards in the early 2000s.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-a-6",
            "text": "My second title run coincided with the retirement of a veteran teammate who had been the franchise's star.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "mvp"
            ]
          },
          {
            "id": "nba-tim-duncan-a-7",
            "text": "I won championships under one head coach in three different decades.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-a-8",
            "text": "My early frontcourt partner was David Robinson, who had been known as The Admiral.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-a-9",
            "text": "I helped San Antonio win five NBA championships between 1999 and 2014.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-a-10",
            "text": "I wore No. 21 for the Spurs and earned the nickname The Big Fundamental.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nba-tim-duncan-b-1",
            "text": "I earned repeated All-NBA First Team honors over a long career with strong defensive recognition.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-b-2",
            "text": "I entered the NBA from college rather than directly from high school or an overseas league.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-b-3",
            "text": "I reached my first NBA Finals just two seasons into my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "spursTimeline"
            ]
          },
          {
            "id": "nba-tim-duncan-b-4",
            "text": "My first and last championships came fifteen years apart.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-b-5",
            "text": "I earned two straight regular-season MVP awards in 2002 and 2003.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-b-6",
            "text": "I spent much of my career playing for coach Gregg Popovich.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "recap"
            ]
          },
          {
            "id": "nba-tim-duncan-b-7",
            "text": "My team defeated a LeBron James-led Cleveland side in the 2007 Finals.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "recap"
            ]
          },
          {
            "id": "nba-tim-duncan-b-8",
            "text": "After losing a Finals series to Miami in 2013, I won the rematch in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "recap"
            ]
          },
          {
            "id": "nba-tim-duncan-b-9",
            "text": "All five of my championship seasons came with San Antonio.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-b-10",
            "text": "The No. 21 Spur known for bank shots became famous as the Big Fundamental.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "nba:shaquille-oneal",
    "name": "Shaquille O'Neal",
    "eraBand": "legacy",
    "rescueGroup": "big",
    "earlyRotation": "normal",
    "sources": {
      "archive": "https://www.nba.com/news/archive-75-shaquille-oneal",
      "trade": "https://www.nba.com/news/legendary-moments-shaquille-oneal-trade-lakers-heat",
      "history": "https://www.nba.com/news/history-top-moments-key-superstars-retire-in-2010s",
      "june": "https://www.nba.com/news/history-this-date-in-nba-june",
      "orlandoHall": "https://www.nba.com/magic/news/magic-induct-shaq-magic-hall-fame"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-shaquille-oneal-a-1",
            "text": "I won Rookie of the Year and eventually led the league in scoring more than once.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "orlandoHall"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-2",
            "text": "I reached the NBA Finals with more than one franchise during my career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-3",
            "text": "I became a Finals MVP several seasons after arriving in the league.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-4",
            "text": "I won both the regular-season MVP and Finals MVP awards in the same season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-5",
            "text": "I was the first overall pick in the 1992 NBA Draft after a college career at LSU.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-6",
            "text": "I reached my first Finals with Orlando in 1995.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-7",
            "text": "I signed with the Los Angeles Lakers as a free agent in 1996.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-8",
            "text": "I won three consecutive Finals MVP awards during a title run under Phil Jackson.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "trade"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-9",
            "text": "After a move to Miami, I won another championship alongside Dwyane Wade in 2006.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "trade"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-10",
            "text": "Known as Shaq and Diesel, I won four championships as a dominant center.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nba-shaquille-oneal-b-1",
            "text": "I won an NBA scoring title before I captured my first championship.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-2",
            "text": "I made fifteen All-Star teams while playing for multiple franchises.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "orlandoHall"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-3",
            "text": "I won Rookie of the Year and eventually earned an NBA regular-season MVP.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-4",
            "text": "I reached the championship series with my original team before changing clubs.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-5",
            "text": "I averaged 38 points and nearly 17 rebounds per game in the 2000 Finals.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "june"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-6",
            "text": "My first three titles came with the Lakers and coach Phil Jackson.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-7",
            "text": "I teamed with Kobe Bryant during an NBA championship three-peat.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "trade"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-8",
            "text": "A 2004 trade sent me to Miami, where I later won a title with Dwyane Wade.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "trade"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-9",
            "text": "Both Orlando and Miami eventually retired jersey numbers that I wore.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "trade"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-10",
            "text": "My worldwide nickname was simply Shaq.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "nba:giannis-antetokounmpo",
    "name": "Giannis Antetokounmpo",
    "eraBand": "modern",
    "rescueGroup": "big",
    "earlyRotation": "normal",
    "sources": {
      "archive": "https://www.nba.com/news/archive-75-giannis-antetokounmpo",
      "finals": "https://www.nba.com/news/giannis-wins-2021-finals-mvp",
      "block": "https://www.nba.com/news/giannis-antetokounmpos-clutch-block-helps-bucks-even-finals",
      "mostImproved": "https://www.nba.com/news/history-most-improved-award-winners"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-giannis-antetokounmpo-a-1",
            "text": "I developed into a multi-time All-NBA selection after entering the league as a teenager.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-2",
            "text": "My game developed from raw potential into a blend of scoring, rebounding and defense.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-3",
            "text": "I was voted Most Improved Player before I won any NBA MVP awards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "mostImproved"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-4",
            "text": "I reached my first All-Star Game several seasons after being drafted.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-5",
            "text": "I won the league MVP and Defensive Player of the Year awards in the same season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-6",
            "text": "I earned consecutive regular-season MVP awards in 2019 and 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-7",
            "text": "I was selected fifteenth overall in the 2013 draft after playing basketball in Greece.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-8",
            "text": "I scored 50 points to clinch the 2021 NBA Finals against Phoenix.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "finals"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-9",
            "text": "I was Finals MVP when Milwaukee won its first championship in fifty years.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "finals"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-10",
            "text": "My athleticism and Greek background inspired the nickname Greek Freak.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nba-giannis-antetokounmpo-b-1",
            "text": "I was considered a developmental prospect rather than an immediate NBA superstar.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-2",
            "text": "My improvement eventually made me one of the league's best two-way players.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-3",
            "text": "My first major NBA individual award recognized how much my game had developed.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "mostImproved"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-4",
            "text": "I made my first All-Star appearance in my fourth NBA season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-5",
            "text": "I won a regular-season MVP before my twenty-sixth birthday.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-6",
            "text": "A knee injury during the 2021 playoffs briefly threatened my team's championship run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "finals"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-7",
            "text": "I made a crucial alley-oop block against Deandre Ayton in the 2021 Finals.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "block"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-8",
            "text": "I helped Milwaukee beat Phoenix in six games to win the 2021 championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "finals"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-9",
            "text": "In the clincher I had 50 points, fourteen rebounds and five blocks.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "finals"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-10",
            "text": "I was the 2021 Finals MVP known as the Greek Freak.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "finals"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "nba:nikola-jokic",
    "name": "Nikola Jokić",
    "eraBand": "modern",
    "rescueGroup": "big",
    "earlyRotation": "normal",
    "sources": {
      "history": "https://www.nba.com/news/nikola-jokic-nba-history",
      "mvp": "https://www.nba.com/news/history-mvp-award-winners",
      "finals": "https://www.nba.com/news/history-finals-mvp-winners",
      "recap": "https://www.nba.com/news/history-season-review-2023-24",
      "title": "https://www.nba.com/news/nikola-jokics-hometown-in-serbia-celebrates-nuggets-1st-nba-title",
      "officialBio": "https://www.nba.com/player/203999/nikola-jokic/bio",
      "finalsMvp": "https://www.nba.com/news/nikola-jokic-2023-bill-russell-nba-finals-mvp-award"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-nikola-jokic-a-1",
            "text": "I became an NBA All-Star several seasons after making my professional debut.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-2",
            "text": "My playoff teams relied on me to create shots for teammates as well as score.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-3",
            "text": "I regularly contributed in multiple statistical categories rather than relying on points alone.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "title"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-4",
            "text": "I earned league MVP honors before reaching my first NBA Finals.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-5",
            "text": "I won my first regular-season MVP award in 2021.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "mvp"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-6",
            "text": "I repeated as NBA MVP in 2022, still without reaching the Finals.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "mvp"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-7",
            "text": "I was drafted forty-first overall in 2014 and became an unusually gifted passing center.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "title"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-8",
            "text": "I led Denver to its first NBA championship in 2023.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "finals"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-9",
            "text": "I was named Finals MVP after a championship series against Miami.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "finalsMvp"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-10",
            "text": "The Serbian Denver center nicknamed the Joker won his third MVP award in 2024.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nba-nikola-jokic-b-1",
            "text": "I developed from a reserve into an established All-Star rather than arriving as an immediate star.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-2",
            "text": "Playmaking became as important to my game as scoring and rebounding.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-3",
            "text": "I became a frequent triple-double threat after earning a regular starting role.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-4",
            "text": "I reached a conference finals before I ever reached the NBA Finals.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-5",
            "text": "I won two consecutive league MVP awards before my first championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "title"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-6",
            "text": "In 2023, I helped sweep the Los Angeles Lakers in the Western Conference finals.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "finals"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-7",
            "text": "By early 2025, I had recorded more than 140 career NBA triple-doubles.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-8",
            "text": "I reached 15,000 points, 7,500 rebounds and 5,000 assists in just 709 games.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-9",
            "text": "I won the 2023 Finals MVP while leading Denver to its first title.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "finalsMvp"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-10",
            "text": "A Serbian Nuggets center, I became a three-time MVP known as the Joker.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          }
        ]
      }
    }
  }
] as const satisfies readonly NbaWhoAmIAuthoredIdentity[];

export const nbaWhoAmIAuthoredIdentities: readonly NbaWhoAmIAuthoredIdentity[] = [
  ...nbaWhoAmIApprovedCalibrationIdentities,
  ...nbaWhoAmIAuthoredBatch1,
  ...nbaWhoAmIAuthoredBatch2,
  ...nbaWhoAmIAuthoredBatch3,
  ...nbaWhoAmIAuthoredBatch4,
];

const identitiesById = new Map<string, NbaWhoAmIAuthoredIdentity>(nbaWhoAmIAuthoredIdentities.map(identity => [identity.subjectId, identity] as const));
if (identitiesById.size !== nbaWhoAmIAuthoredIdentities.length) {
  throw new Error("NBA Who Am I authored bank contains duplicate player IDs.");
}

export function getNbaWhoAmIAuthoredIdentity(subjectId: string) {
  return identitiesById.get(subjectId) ?? null;
}
