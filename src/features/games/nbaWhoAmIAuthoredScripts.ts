import type { WhoAmIClueBand, WhoAmIEraBand } from "./whoAmIEngine";

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
export const nbaWhoAmIAuthoredIdentities = [
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
            "text": "I played college basketball at North Carolina before entering the NBA in the 1980s.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-2",
            "text": "My NBA career included a return with a different franchise after years away from my first team.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-3",
            "text": "I won the NBA Rookie of the Year award early in my professional career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-4",
            "text": "I earned a Defensive Player of the Year award while playing guard.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-5",
            "text": "I won the league scoring title ten times.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-6",
            "text": "I scored 63 points against Boston in a playoff game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-7",
            "text": "I stepped away from the NBA to play minor-league baseball.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-8",
            "text": "When I came back in 1995, I initially wore No. 45 instead of my familiar number.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-9",
            "text": "I led Chicago to six championships, winning Finals MVP in all six series.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-a-10",
            "text": "My No. 23 jersey and the Air Jordan brand became symbols of the Bulls dynasty.",
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
            "text": "I was selected third overall in the 1984 NBA Draft.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-b-2",
            "text": "I spent my final two playing seasons with Washington.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-b-3",
            "text": "My first NBA championship came in 1991 against the Los Angeles Lakers.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-b-4",
            "text": "The first three championship teams I led completed a three-peat from 1991 through 1993.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-b-5",
            "text": "I earned five regular-season MVP awards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-b-6",
            "text": "I came back to a team that then won 72 regular-season games in 1995-96.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-b-7",
            "text": "I played with Scottie Pippen under coach Phil Jackson throughout a six-title run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-b-8",
            "text": "My last championship-clinching performance came against the Utah Jazz in 1998.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-b-9",
            "text": "The Chicago Bulls retired my No. 23 after my remarkable 1990s run.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "profile"
            ]
          },
          {
            "id": "nba-michael-jordan-b-10",
            "text": "I was widely known by the nickname His Airness.",
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
            "text": "I entered the NBA straight from high school as a teenager.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-2",
            "text": "I spent my entire NBA playing career with one franchise.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-3",
            "text": "I played 20 NBA seasons after entering the league in 1996.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-4",
            "text": "I was selected to 18 NBA All-Star Games.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-5",
            "text": "I earned eleven All-NBA First Team selections.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-6",
            "text": "I helped my team win three championships in a row from 2000 through 2002.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-7",
            "text": "I captured the league's regular-season MVP award in 2008.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-8",
            "text": "I led back-to-back championship runs in 2009 and 2010 as Finals MVP.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-9",
            "text": "I scored 81 points against the Toronto Raptors in January 2006.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-a-10",
            "text": "I was the Lakers guard whose jersey numbers 8 and 24 were both retired.",
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
            "text": "I was born in Philadelphia and entered professional basketball at age 18.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-2",
            "text": "I was known for an especially intense competitive approach and tireless preparation.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-3",
            "text": "I won Olympic gold medals with the United States in 2008 and 2012.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-4",
            "text": "I was chosen to the NBA All-Defensive First Team nine times.",
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
            "text": "My early title teams featured Shaquille O'Neal as my fellow superstar.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-7",
            "text": "My most productive single game became the second-highest scoring game in NBA history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-8",
            "text": "I scored 60 points in the final NBA game of my career in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-9",
            "text": "My signature playing persona was known as the Black Mamba.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-kobe-bryant-b-10",
            "text": "I helped deliver five NBA championships to Los Angeles before my retirement.",
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
      "finals": "https://www.nba.com/news/history-finals-mvp-winners"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-lebron-james-a-1",
            "text": "My basketball games attracted national attention while I was still in high school.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-a-2",
            "text": "I came into the NBA as a heavily anticipated teenage prospect from Ohio.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-a-3",
            "text": "I was selected with the first pick in the 2003 NBA Draft.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-a-4",
            "text": "I took Cleveland to an NBA Finals appearance in 2007.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-a-5",
            "text": "I joined Dwyane Wade and Chris Bosh in Miami in 2010.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-a-6",
            "text": "I won consecutive championships with the Heat in 2012 and 2013.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-a-7",
            "text": "I returned to Cleveland in 2014 and led the team to an historic 2016 championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-a-8",
            "text": "My chase-down block on Andre Iguodala was a defining moment of the 2016 Finals.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-a-9",
            "text": "I won a fourth championship with the Lakers in the 2020 Orlando bubble.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-a-10",
            "text": "My nickname is King James, and I won Finals MVP with Miami, Cleveland and Los Angeles.",
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
            "id": "nba-lebron-james-b-1",
            "text": "I grew up in Akron and entered the league without attending college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-b-2",
            "text": "I earned Rookie of the Year honors in 2003-04.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-b-3",
            "text": "I won consecutive regular-season MVP awards with Cleveland in 2009 and 2010.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-b-4",
            "text": "In a 2007 playoff game in Detroit, I scored Cleveland's final 25 points.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-b-5",
            "text": "My first NBA championship opportunity with Miami ended in a loss to Dallas in 2011.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-b-6",
            "text": "I delivered a famous 2012 Eastern Conference finals Game 6 performance in Boston.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-b-7",
            "text": "I earned two more regular-season MVP awards while playing for Miami.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-b-8",
            "text": "My 2016 Finals team became the first to rally from a 3-1 series deficit to win the title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-b-9",
            "text": "I became the first NBA player to win Finals MVP for three different franchises.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-lebron-james-b-10",
            "text": "My NBA scoring milestones eventually carried me past Kareem Abdul-Jabbar's career points record.",
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
    "subjectId": "nba:stephen-curry",
    "name": "Stephen Curry",
    "eraBand": "modern",
    "rescueGroup": "guard",
    "earlyRotation": "normal",
    "sources": {
      "archive": "https://www.nba.com/news/archive-75-stephen-curry",
      "finals": "https://www.nba.com/news/stephen-curry-wins-2022-bill-russell-nba-finals-mvp-award",
      "hof": "https://www.nba.com/news/stephen-curry-honored-with-hall-of-fame-exhibit"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-stephen-curry-a-1",
            "text": "I made my name as a skilled guard without the size typically associated with NBA superstars.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-a-2",
            "text": "My creative ballhandling became as recognizable as my shooting.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-a-3",
            "text": "I played college basketball at Davidson.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-a-4",
            "text": "I was drafted by Golden State in 2009.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-a-5",
            "text": "I helped the Warriors win their first NBA championship in 40 years in 2015.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-a-6",
            "text": "I won the 2015 and 2016 regular-season MVP awards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-a-7",
            "text": "I helped a team reach 73 wins in the 2015-16 regular season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-a-8",
            "text": "I became the first unanimous MVP in NBA history.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-a-9",
            "text": "My long-range shooting made me the NBA's career leader in three-pointers.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-a-10",
            "text": "I finally won my first NBA Finals MVP in 2022 after Golden State beat Boston.",
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
            "id": "nba-stephen-curry-b-1",
            "text": "I grew up around professional basketball because my father played in the NBA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-2",
            "text": "I became famous for quick-release jumpers well beyond the three-point line.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-3",
            "text": "My college tournament runs introduced me to a national audience.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-4",
            "text": "I wear No. 30 and became the centerpiece of a Golden State dynasty.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-5",
            "text": "In a 2016 overtime win at Oklahoma City, I made 12 three-pointers, including the winner.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-6",
            "text": "My 2015-16 regular season included 402 made three-pointers.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-7",
            "text": "My championship teammates included Klay Thompson and Draymond Green.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-8",
            "text": "I also won two championships alongside Kevin Durant in 2017 and 2018.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-9",
            "text": "I won four NBA titles through the 2022 championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-stephen-curry-b-10",
            "text": "The Naismith Hall of Fame opened a special exhibit about my career while I was still an active player.",
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
    "subjectId": "nba:tim-duncan",
    "name": "Tim Duncan",
    "eraBand": "legacy",
    "rescueGroup": "big",
    "earlyRotation": "normal",
    "sources": {
      "archive": "https://www.nba.com/news/archive-75-tim-duncan",
      "mvp": "https://www.nba.com/news/history-mvp-award-winners",
      "recap": "https://www.nba.com/news/history-season-recaps-index"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-tim-duncan-a-1",
            "text": "I grew up in the U.S. Virgin Islands before becoming a college basketball prospect.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-a-2",
            "text": "Swimming was an important sport in my childhood before I devoted myself to basketball.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-a-3",
            "text": "I spent four college seasons playing at Wake Forest.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-a-4",
            "text": "I entered the NBA as the first overall pick in the 1997 Draft.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-a-5",
            "text": "My entire NBA playing career was spent with the same franchise.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-a-6",
            "text": "I earned consecutive regular-season MVP awards in 2002 and 2003.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-a-7",
            "text": "My frontcourt partner David Robinson retired after we won the 2003 title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-a-8",
            "text": "My reliable midrange bank shot became a signature part of my game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-a-9",
            "text": "I won five NBA championships with San Antonio between 1999 and 2014.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-a-10",
            "text": "The Spurs great wearing No. 21 was known as the Big Fundamental.",
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
            "text": "I played college basketball for coach Dave Odom at Wake Forest.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-b-2",
            "text": "I joined a veteran NBA team coached by Gregg Popovich.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-b-3",
            "text": "I won an NBA championship in my second professional season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-b-4",
            "text": "I shared my earliest title teams with another Hall of Fame big man nicknamed The Admiral.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-b-5",
            "text": "My 2003 team knocked out the three-time defending champion Lakers.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-b-6",
            "text": "I led championship teams in 1999, 2003, 2005 and 2007.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-b-7",
            "text": "I helped San Antonio sweep a LeBron-led Cleveland team in the 2007 Finals.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-b-8",
            "text": "After falling to Miami in the 2013 Finals, my team won the rematch in 2014.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-b-9",
            "text": "I won my first and last NBA championships fifteen years apart.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-tim-duncan-b-10",
            "text": "My calm leadership helped define the Spurs' championship era.",
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
      "june": "https://www.nba.com/news/history-this-date-in-nba-june"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-shaquille-oneal-a-1",
            "text": "My rare size and strength made me one of basketball's most dominant centers.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-2",
            "text": "I entered the league in the early 1990s after starring at LSU.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-3",
            "text": "I was the No. 1 selection in the 1992 NBA Draft.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-4",
            "text": "My first NBA team was the Orlando Magic.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-5",
            "text": "I reached the NBA Finals with Orlando in 1995.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-6",
            "text": "I later joined the Los Angeles Lakers and played under Phil Jackson.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-7",
            "text": "I was named the NBA's regular-season MVP for 1999-2000.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-8",
            "text": "I won three consecutive NBA Finals MVP awards during a 2000-02 title run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-9",
            "text": "I moved from Los Angeles to Miami in 2004 and later won the 2006 championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-10",
            "text": "My nicknames included Shaq and Diesel, and I won four NBA titles.",
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
            "text": "I became a star with Orlando before joining another franchise as a free agent in 1996.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-2",
            "text": "I was selected to fifteen NBA All-Star teams.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-3",
            "text": "I won two NBA scoring titles during my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-4",
            "text": "I played alongside a young Kobe Bryant in one of the league's most famous superstar pairings.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-5",
            "text": "In the 2000 NBA Finals, I averaged 38 points and 16.7 rebounds.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-6",
            "text": "I won three straight championships with the Lakers under coach Phil Jackson.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-7",
            "text": "A 2004 trade sent me to the Heat in exchange for players including Lamar Odom.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-8",
            "text": "I won a title with Dwyane Wade after Miami defeated Dallas in the 2006 Finals.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-9",
            "text": "Miami retired the No. 32 jersey I wore during my years with the Heat.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-10",
            "text": "I was the towering center who became known worldwide simply by my first-name nickname.",
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
      "block": "https://www.nba.com/news/giannis-antetokounmpos-clutch-block-helps-bucks-even-finals"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-giannis-antetokounmpo-a-1",
            "text": "I grew up in Greece in a family with Nigerian roots.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-2",
            "text": "I helped my family by selling items on the streets of Athens before becoming a star.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-3",
            "text": "I entered the NBA as a relatively little-known international prospect.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-4",
            "text": "I was selected fifteenth overall in the 2013 NBA Draft.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-5",
            "text": "I made my first NBA All-Star appearance in 2017.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-6",
            "text": "I won consecutive regular-season MVP awards in 2019 and 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-7",
            "text": "I also earned Defensive Player of the Year honors in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-8",
            "text": "In the 2021 Finals, I scored 50 points in the championship-clinching sixth game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-9",
            "text": "I was Finals MVP when Milwaukee ended a 50-year championship drought.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-a-10",
            "text": "My unusual athleticism and Greek background inspired the nickname Greek Freak.",
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
            "text": "I entered the league as a raw teenage prospect whose growth surprised draft analysts.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-2",
            "text": "My rise turned a struggling NBA franchise into a title contender.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-3",
            "text": "I became one of the league's leading two-way forwards.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-4",
            "text": "I won a regular-season MVP before my 26th birthday.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-5",
            "text": "My back-to-back MVP awards came before my first championship.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-6",
            "text": "In the 2021 playoffs, a knee injury raised fears I would miss the rest of the run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-7",
            "text": "I made a memorable recovery block on Deandre Ayton in Game 4 of the 2021 Finals.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-8",
            "text": "I helped Milwaukee defeat the Phoenix Suns in six games for the 2021 title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-9",
            "text": "In the clincher, I added 14 rebounds and five blocks to my 50 points.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-giannis-antetokounmpo-b-10",
            "text": "I was the 2021 Finals MVP after starring for the Milwaukee Bucks.",
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
    "subjectId": "nba:nikola-jokic",
    "name": "Nikola Jokić",
    "eraBand": "modern",
    "rescueGroup": "big",
    "earlyRotation": "normal",
    "sources": {
      "history": "https://www.nba.com/news/nikola-jokic-nba-history",
      "mvp": "https://www.nba.com/news/history-mvp-award-winners",
      "finals": "https://www.nba.com/news/history-finals-mvp-winners",
      "recap": "https://www.nba.com/news/history-season-review-2023-24"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-nikola-jokic-a-1",
            "text": "I became an NBA star despite being a second-round draft pick.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-2",
            "text": "I am a center from Serbia known for unusual playmaking ability.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-3",
            "text": "Denver selected me with the 41st pick in the 2014 NBA Draft.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-4",
            "text": "I developed into one of the league's best passing big men.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-5",
            "text": "I earned my first NBA regular-season MVP in 2021.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-6",
            "text": "I repeated as league MVP in 2022.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-7",
            "text": "In 2023, I led Denver to its first NBA championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-8",
            "text": "I earned the 2023 Finals MVP award after a championship series against Miami.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-9",
            "text": "I won a third regular-season MVP award in 2024.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-a-10",
            "text": "The Denver center whose nickname is the Joker became a three-time NBA MVP.",
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
            "text": "I reached NBA stardom as an international big man without a high draft position.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-2",
            "text": "My scoring, rebounding and passing made triple-doubles a recurring part of my career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-3",
            "text": "I won consecutive league MVP awards before winning my first title.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-4",
            "text": "I played my entire NBA career through 2025 with the Denver Nuggets.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-5",
            "text": "In the 2023 playoffs, my team beat the Los Angeles Lakers to reach the Finals.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-6",
            "text": "My championship run culminated in the 2023 Finals against the Miami Heat.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-7",
            "text": "By January 2025, I had recorded more than 140 NBA triple-doubles.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-8",
            "text": "I reached 15,000 points, 7,500 rebounds and 5,000 assists in 709 career games.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-9",
            "text": "At that January 2025 milestone, I reached the combined totals faster than Larry Bird had.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "history"
            ]
          },
          {
            "id": "nba-nikola-jokic-b-10",
            "text": "A Denver center with three MVP trophies became famous for his elite passing vision.",
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

const identitiesById = new Map(nbaWhoAmIAuthoredIdentities.map(identity => [identity.subjectId, identity] as const));
if (identitiesById.size !== nbaWhoAmIAuthoredIdentities.length) {
  throw new Error("NBA Who Am I authored bank contains duplicate player IDs.");
}

export function getNbaWhoAmIAuthoredIdentity(subjectId: string) {
  return identitiesById.get(subjectId) ?? null;
}
