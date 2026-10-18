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
  earlyRotation: "normal" | "deprioritized";
  sources: Readonly<Record<string, string>>;
  scripts: Readonly<Record<NbaWhoAmIAuthoredScriptId, {
    id: NbaWhoAmIAuthoredScriptId;
    clues: readonly NbaWhoAmIAuthoredClue[];
  }>>;
}

/**
 * NBA calibration bank, NOT the release population.
 * Exact same two-authored-script contract as NFL / CFB and UFC.
 * Ten source-backed, first-person, sports-first clues per script.
 * Early clues widen the field; final clues identify the player.
 * Never derive or reshuffle the authored clue texts during gameplay.
 */
export const nbaWhoAmIAuthoredIdentities: readonly NbaWhoAmIAuthoredIdentity[] = [
  {
    "subjectId": "nba:michael-jordan",
    "name": "Michael Jordan",
    "eraBand": "legacy",
    "earlyRotation": "normal",
    "sources": {
      "legend": "https://www.nba.com/news/history-nba-legend-michael-jordan",
      "mvp": "https://www.nba.com/news/regular-season-kia-nba-most-valuable-player-award-winners-chicago-bulls"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-michael-jordan-a-1",
            "text": "I entered the NBA after playing several seasons of college basketball.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-a-2",
            "text": "I was an All-Star and the league's Rookie of the Year in my first season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-a-3",
            "text": "A broken foot disrupted my second NBA season before I returned for the playoffs.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-a-4",
            "text": "I won multiple NBA scoring titles before earning my first championship ring.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-a-5",
            "text": "My team repeatedly ran into Detroit in the postseason before finally breaking through.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-a-6",
            "text": "I earned both regular-season MVP and Defensive Player of the Year honors in 1988.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "mvp"
            ]
          },
          {
            "id": "nba-michael-jordan-a-7",
            "text": "My team beat the Lakers in the 1991 Finals to begin its first championship run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-a-8",
            "text": "I led a team that won 72 regular-season games to the 1996 NBA title.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-a-9",
            "text": "I won six championships and six Finals MVP awards with Chicago.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-a-10",
            "text": "Chicago drafted me third overall in 1984, and I became synonymous with No. 23.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nba-michael-jordan-b-1",
            "text": "I was born on the East Coast and grew up in the southeastern United States.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-b-2",
            "text": "I won a college national championship before entering the NBA Draft.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-b-3",
            "text": "I once scored more than 60 points in a playoff game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-b-4",
            "text": "I hit a buzzer-beating series winner over Cleveland in the 1989 playoffs.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-b-5",
            "text": "My NBA career-high was a 69-point game against Cleveland.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-b-6",
            "text": "I stepped away from basketball to pursue professional baseball.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-b-7",
            "text": "I returned to the NBA in 1995 following the first of my retirements.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-b-8",
            "text": "I scored 38 points in a 1997 Finals game remembered for my illness.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-b-9",
            "text": "I hit a late go-ahead jumper against Utah in the 1998 Finals.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-michael-jordan-b-10",
            "text": "After winning 10 NBA scoring titles, I ended my career with the Washington Wizards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "legend"
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
    "earlyRotation": "normal",
    "sources": {
      "bio": "https://www.nba.com/player/2544/lebron-james/bio/1000",
      "scoring": "https://www.nba.com/news/lebron-james-sets-all-time-scoring-record-nba",
      "debut": "https://www.nba.com/news/lebron-james-debut-seasons",
      "seasons": "https://www.nba.com/news/history-season-recaps-index"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-lebron-james-a-1",
            "text": "I entered the NBA directly from high school instead of playing in college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-lebron-james-a-2",
            "text": "I won Rookie of the Year after joining a struggling franchise.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "debut"
            ]
          },
          {
            "id": "nba-lebron-james-a-3",
            "text": "I reached the NBA Finals before winning my first regular-season MVP.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "seasons"
            ]
          },
          {
            "id": "nba-lebron-james-a-4",
            "text": "I won consecutive regular-season MVP awards before earning my first title.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-lebron-james-a-5",
            "text": "In 2010, I left my original team to join a star-studded roster in Miami.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-lebron-james-a-6",
            "text": "I won my first two NBA championships in 2012 and 2013.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-lebron-james-a-7",
            "text": "I returned to Cleveland and won an NBA championship with that franchise in 2016.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-lebron-james-a-8",
            "text": "I became a championship winner with three different NBA franchises.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-lebron-james-a-9",
            "text": "I passed Kareem Abdul-Jabbar as the NBA's all-time regular-season scoring leader in 2023.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "scoring"
            ]
          },
          {
            "id": "nba-lebron-james-a-10",
            "text": "I won NBA titles with Miami, Cleveland and the Lakers and became known as King James.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nba-lebron-james-b-1",
            "text": "I began my professional career as a teenager.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "debut"
            ]
          },
          {
            "id": "nba-lebron-james-b-2",
            "text": "My high-school basketball career in Ohio drew national attention.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-lebron-james-b-3",
            "text": "San Antonio swept my team in my first NBA Finals appearance.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "seasons"
            ]
          },
          {
            "id": "nba-lebron-james-b-4",
            "text": "I earned Olympic basketball gold medals in 2008 and 2012.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-lebron-james-b-5",
            "text": "I played in eight consecutive NBA Finals from 2011 through 2018.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-lebron-james-b-6",
            "text": "My Cleveland team erased a 3–1 deficit against Golden State in the 2016 Finals.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "seasons"
            ]
          },
          {
            "id": "nba-lebron-james-b-7",
            "text": "I joined the Lakers in 2018 after separate stints with Cleveland and Miami.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-lebron-james-b-8",
            "text": "I won Finals MVP honors in 2012, 2013, 2016 and 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-lebron-james-b-9",
            "text": "I was a key player on the Lakers team that won the 2020 title against Miami.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "seasons"
            ]
          },
          {
            "id": "nba-lebron-james-b-10",
            "text": "I earned four regular-season MVP awards and four NBA Finals MVP awards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bio"
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
    "earlyRotation": "normal",
    "sources": {
      "bio": "https://www.nba.com/player/201939/stephen-curry/bio",
      "season": "https://www.nba.com/news/history-season-review-2015-16",
      "record": "https://www.nba.com/news/stephen-curry-tracker-all-time-3s-record",
      "finals": "https://www.nba.com/news/stephen-curry-wins-2022-bill-russell-nba-finals-mvp-award",
      "threeK": "https://www.nba.com/news/stephen-curry-knocks-down-3000th-career-3-pointer"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-stephen-curry-a-1",
            "text": "I played college basketball outside a major conference before entering the NBA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-stephen-curry-a-2",
            "text": "My first NBA team selected me during the 2009 draft.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-stephen-curry-a-3",
            "text": "I was a lottery pick, but five players were selected before me.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-stephen-curry-a-4",
            "text": "I first made an NBA All-Star team more than four seasons after I was drafted.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-stephen-curry-a-5",
            "text": "I was voted regular-season MVP in both 2015 and 2016.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-stephen-curry-a-6",
            "text": "I led the NBA in made three-pointers in five consecutive seasons from 2013 through 2017.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-stephen-curry-a-7",
            "text": "I made 402 three-pointers in a single regular season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "season"
            ]
          },
          {
            "id": "nba-stephen-curry-a-8",
            "text": "I was the first unanimous NBA MVP as my team won 73 regular-season games.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "season"
            ]
          },
          {
            "id": "nba-stephen-curry-a-9",
            "text": "At Madison Square Garden, I passed Ray Allen for the most career NBA three-pointers.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "record"
            ]
          },
          {
            "id": "nba-stephen-curry-a-10",
            "text": "I wore No. 30 for Golden State and earned the NBA Finals MVP award in 2022.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nba-stephen-curry-b-1",
            "text": "I played three seasons of college basketball before turning professional.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-stephen-curry-b-2",
            "text": "I became known for a guard's shooting range rather than unusual size.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "record"
            ]
          },
          {
            "id": "nba-stephen-curry-b-3",
            "text": "My team repeatedly faced the same Eastern Conference opponent in the NBA Finals.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-stephen-curry-b-4",
            "text": "I helped Golden State win its first championship in four decades in 2015.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-stephen-curry-b-5",
            "text": "I was the league's leading scorer during the 2020–21 NBA season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-stephen-curry-b-6",
            "text": "I became the first NBA player to make 3,000 career regular-season three-pointers.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "threeK"
            ]
          },
          {
            "id": "nba-stephen-curry-b-7",
            "text": "My 2022 championship series was played against the Boston Celtics.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "finals"
            ]
          },
          {
            "id": "nba-stephen-curry-b-8",
            "text": "I became the first recipient of the Western Conference Finals MVP award in 2022.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-stephen-curry-b-9",
            "text": "My first four NBA titles came in 2015, 2017, 2018 and 2022.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "bio"
            ]
          },
          {
            "id": "nba-stephen-curry-b-10",
            "text": "I scored 34 points in the 2022 Finals clincher before receiving my first Finals MVP.",
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
    "subjectId": "nba:shaquille-oneal",
    "name": "Shaquille O'Neal",
    "eraBand": "legacy",
    "earlyRotation": "normal",
    "sources": {
      "magic": "https://www.nba.com/news/magic-retire-shaquille-oneal-jersey",
      "lakers": "https://www.nba.com/lakers/history/alumni/shaquille-oneal",
      "trade": "https://www.nba.com/news/legendary-moments-shaquille-oneal-trade-lakers-heat",
      "draft": "https://www.nba.com/news/looking-back-at-7-legendary-nba-draft-prospects",
      "archive": "https://www.nba.com/news/archive-75-shaquille-oneal"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-shaquille-oneal-a-1",
            "text": "I played college basketball in the SEC before entering the NBA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "draft"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-2",
            "text": "I stood over seven feet tall and built my game around an overwhelming interior presence.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-3",
            "text": "I entered the NBA as a top-three draft pick in the early 1990s.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "magic"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-4",
            "text": "I won Rookie of the Year for a young NBA franchise.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "magic"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-5",
            "text": "I helped Orlando reach the NBA Finals in 1995.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "magic"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-6",
            "text": "I signed with the Lakers in the summer of 1996.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lakers"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-7",
            "text": "I won the regular-season MVP and scoring title in 1999–2000.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lakers"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-8",
            "text": "I won three consecutive NBA championships alongside Kobe Bryant.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lakers"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-9",
            "text": "I was Finals MVP in 2000, 2001 and 2002 with Los Angeles.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "lakers"
            ]
          },
          {
            "id": "nba-shaquille-oneal-a-10",
            "text": "I added a fourth championship with Dwyane Wade and the Miami Heat in 2006.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "trade"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nba-shaquille-oneal-b-1",
            "text": "I received major college honors as an interior big man before reaching the NBA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "draft"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-2",
            "text": "I averaged more than 20 points and 10 rebounds during my rookie season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "draft"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-3",
            "text": "I started my NBA career with a team that had joined the league only a few years earlier.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "magic"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-4",
            "text": "I was selected to the NBA's 50th Anniversary Team while still early in my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "draft"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-5",
            "text": "Phil Jackson coached me during my peak run of championships in Los Angeles.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "archive"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-6",
            "text": "In the 2000 Finals against Indiana, I averaged 38 points per game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lakers"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-7",
            "text": "In 2001 my team lost only one game during its entire playoff run.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "lakers"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-8",
            "text": "Los Angeles traded me to Miami in a 2004 deal involving Lamar Odom and Caron Butler.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "trade"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-9",
            "text": "Orlando eventually retired my No. 32 jersey and Los Angeles retired my No. 34.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "magic"
            ]
          },
          {
            "id": "nba-shaquille-oneal-b-10",
            "text": "Fans knew me by a single short nickname, and I won the 2006 title with Miami.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "archive",
              "trade"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "nba:dirk-nowitzki",
    "name": "Dirk Nowitzki",
    "eraBand": "legacy",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.nba.com/news/dirk-nowitzki-hall-of-fame-profile",
      "mvp": "https://www.nba.com/news/history-mvp-award-winners",
      "seasons": "https://www.nba.com/news/history-season-recaps-index"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-dirk-nowitzki-a-1",
            "text": "I developed as a basketball player in Europe before entering the NBA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-a-2",
            "text": "I was unusually skilled as a perimeter scorer for a seven-foot forward.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-a-3",
            "text": "I entered the league as a first-round draft pick in 1998.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-a-4",
            "text": "The team that selected me traded my rights to Dallas on draft night.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-a-5",
            "text": "Early in my career, I formed an effective pick-and-pop pairing with Steve Nash.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-a-6",
            "text": "I led Dallas to its first NBA Finals appearance in 2006.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-a-7",
            "text": "My team won 67 games in the 2006–07 regular season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-a-8",
            "text": "I won the 2006–07 NBA Most Valuable Player award.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "mvp"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-a-9",
            "text": "I was the driving force behind Dallas winning the 2011 NBA championship.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-a-10",
            "text": "I spent my entire NBA playing career with the Mavericks and became famous for my one-legged fadeaway.",
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
            "id": "nba-dirk-nowitzki-b-1",
            "text": "I came to the NBA with a reputation for shooting touch unusual in a player my size.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-b-2",
            "text": "I arrived in the NBA during the lockout-shortened 1998–99 season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-b-3",
            "text": "My draft rights changed teams before I ever played an NBA game.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-b-4",
            "text": "I was coached in Dallas by Don Nelson, Avery Johnson and Rick Carlisle.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-b-5",
            "text": "I earned 14 NBA All-Star selections during my career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-b-6",
            "text": "My team lost a 2006 NBA Finals series after going up two games to none.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-b-7",
            "text": "My MVP season ended in a first-round playoff upset against eighth-seeded Golden State.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-b-8",
            "text": "I was the centerpiece of a 2011 Finals rematch against Miami.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-b-9",
            "text": "I earned NBA Finals MVP honors after the Mavericks won that 2011 series.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nba-dirk-nowitzki-b-10",
            "text": "I became the first Dallas Mavericks player to win both league MVP and Finals MVP.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "mvp"
            ]
          }
        ]
      }
    }
  },
  {
    "subjectId": "nba:magic-johnson",
    "name": "Magic Johnson",
    "eraBand": "legacy",
    "earlyRotation": "normal",
    "sources": {
      "legend": "https://www.nba.com/news/history-nba-legend-magic-johnson"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nba-magic-johnson-a-1",
            "text": "I grew up in Michigan and became a high-school basketball standout.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-a-2",
            "text": "My elite passing ability distinguished me from other players of my size.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-a-3",
            "text": "I helped my college team reach the top of the sport before entering the NBA.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-a-4",
            "text": "I entered the NBA as the first overall selection in the 1979 Draft.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-a-5",
            "text": "I spent my entire NBA playing career with the Los Angeles Lakers.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-a-6",
            "text": "As a rookie, I played center in a championship-clinching Finals game.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-a-7",
            "text": "I scored 42 points in Game 6 of the 1980 NBA Finals.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-a-8",
            "text": "I was the first rookie in league history to be named NBA Finals MVP.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-a-9",
            "text": "I won five championships as the on-court leader of the Showtime Lakers.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-a-10",
            "text": "I won three league MVP awards and became synonymous with no-look passing.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nba-magic-johnson-b-1",
            "text": "I played in the Big Ten before entering the NBA.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-b-2",
            "text": "My college team won the national title in a game against another future NBA legend.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-b-3",
            "text": "I entered the league as a 6-foot-9 point guard.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-b-4",
            "text": "I helped make fast breaks and creative passing central to my team's identity.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-b-5",
            "text": "I won Finals MVP awards in 1980, 1982 and 1987.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-b-6",
            "text": "I won the regular-season NBA MVP award three times.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-b-7",
            "text": "I publicly announced my retirement before the 1991–92 NBA season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-b-8",
            "text": "I played for the original U.S. Olympic Dream Team in 1992.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-b-9",
            "text": "I returned to play 32 regular-season games for the Lakers in 1995–96.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          },
          {
            "id": "nba-magic-johnson-b-10",
            "text": "My nickname came from a high-school performance featuring 36 points, 16 rebounds and 16 assists.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "legend"
            ]
          }
        ]
      }
    }
  }
];

export function getNbaWhoAmIAuthoredIdentity(subjectId: string) {
  return nbaWhoAmIAuthoredIdentities.find((identity) => identity.subjectId === subjectId) ?? null;
}
