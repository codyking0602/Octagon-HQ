import type { FootballWhoAmIAuthoredIdentity } from "./footballWhoAmIAuthoredScripts";

export const footballWhoAmIAuthoredNflBatch1 = [
  {
    "league": "NFL",
    "subjectId": "cam-newton",
    "name": "Cam Newton",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "panthersRelease": "https://www.panthers.com/news/carolina-panthers-release-qb-cam-newton",
      "panthersMvp": "https://www.panthers.com/news/cam-newton-named-nfl-mvp-16796069",
      "panthersReturn": "https://www.panthers.com/news/panthers-agree-to-terms-with-cam-newton",
      "auburn": "https://auburntigers.com/sports/football/roster/player/cam-newton"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-cam-newton-a-1",
            "text": "I entered the NFL as a first-round quarterback whose running ability was immediately a major part of my game.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "panthersRelease"
            ]
          },
          {
            "id": "nfl-cam-newton-a-2",
            "text": "I started all 16 games as a rookie and won the league's Offensive Rookie of the Year award.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "panthersRelease"
            ]
          },
          {
            "id": "nfl-cam-newton-a-3",
            "text": "As a rookie, I set an NFL single-season record for rushing touchdowns by a quarterback with 14.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "panthersRelease"
            ]
          },
          {
            "id": "nfl-cam-newton-a-4",
            "text": "That same rookie season made me the first player in NFL history to pass for 4,000 yards and rush for 500 yards in one season.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "panthersRelease"
            ]
          },
          {
            "id": "nfl-cam-newton-a-5",
            "text": "Through my first four seasons, I became the first player in league history to top 3,000 passing yards and 500 rushing yards four years in a row.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "panthersMvp"
            ]
          },
          {
            "id": "nfl-cam-newton-a-6",
            "text": "In 2015, I threw 35 touchdown passes and ran for 10 more.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "panthersMvp"
            ]
          },
          {
            "id": "nfl-cam-newton-a-7",
            "text": "That made me the first player in NFL history with at least 30 passing touchdowns and 10 rushing touchdowns in the same season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "panthersMvp"
            ]
          },
          {
            "id": "nfl-cam-newton-a-8",
            "text": "I won both NFL MVP and Offensive Player of the Year while leading the league's highest-scoring offense.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "panthersMvp"
            ]
          },
          {
            "id": "nfl-cam-newton-a-9",
            "text": "My MVP season ended with Carolina representing the NFC in Super Bowl 50 after a 15-1 regular season.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "panthersRelease",
              "panthersMvp"
            ]
          },
          {
            "id": "nfl-cam-newton-a-10",
            "text": "Carolina made me the No. 1 overall pick in 2011 after I had won the Heisman Trophy and a national championship at Auburn.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "panthersRelease",
              "auburn"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-cam-newton-b-1",
            "text": "My college path included time at one SEC school before I spent a season playing outside the FBS.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "auburn"
            ]
          },
          {
            "id": "nfl-cam-newton-b-2",
            "text": "At that junior-college stop, I helped my team win an NJCAA national championship.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "auburn"
            ]
          },
          {
            "id": "nfl-cam-newton-b-3",
            "text": "I transferred again and, in my only season as the starter at my final school, won the Heisman Trophy.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "auburn"
            ]
          },
          {
            "id": "nfl-cam-newton-b-4",
            "text": "The Panthers then used the first overall selection of the 2011 draft on me.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "panthersRelease"
            ]
          },
          {
            "id": "nfl-cam-newton-b-5",
            "text": "I became the first quarterback in franchise history to win the AP NFL MVP award.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "panthersMvp"
            ]
          },
          {
            "id": "nfl-cam-newton-b-6",
            "text": "By the end of my original Carolina run, I held the franchise records for passing yards, passing touchdowns and quarterback wins.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "panthersRelease"
            ]
          },
          {
            "id": "nfl-cam-newton-b-7",
            "text": "I also left that first Carolina stint as the franchise leader in rushing touchdowns, with 58.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "panthersRelease"
            ]
          },
          {
            "id": "nfl-cam-newton-b-8",
            "text": "After one season with New England, I returned to Carolina during the 2021 season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "panthersReturn"
            ]
          },
          {
            "id": "nfl-cam-newton-b-9",
            "text": "When I returned, I was the NFL's all-time leader in rushing touchdowns by a quarterback with 70.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "panthersReturn"
            ]
          },
          {
            "id": "nfl-cam-newton-b-10",
            "text": "My path ran from Florida to Blinn College to an undefeated Auburn title season before I became Carolina's longtime dual-threat quarterback.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "auburn",
              "panthersRelease"
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
      "hof": "https://www.profootballhof.com/players/peyton-manning",
      "tennessee": "https://utsports.com/sports/football/roster/peyton-manning/15491",
      "tennesseeHall": "https://utsports.com/news/2017/12/5/manning-inducted-into-college-football-hall-of-fame"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-peyton-manning-a-1",
            "text": "I was a first-round quarterback who started every game of my rookie season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-2",
            "text": "As a rookie, I set league rookie records for completions, attempts, passing yards and touchdown passes.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-3",
            "text": "In 2004, I set an NFL single-season record with 49 touchdown passes.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-4",
            "text": "I won the AP NFL MVP award in consecutive seasons in 2003 and 2004.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-5",
            "text": "I eventually became a five-time AP NFL MVP.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-6",
            "text": "I was selected to 14 Pro Bowls during an 18-season career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-7",
            "text": "I appeared in four Super Bowls, each with a different head coach.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-8",
            "text": "I became a Super Bowl champion with two different franchises.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "tennesseeHall"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-9",
            "text": "Indianapolis drafted me first overall in 1998, and I later finished my career with Denver.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-a-10",
            "text": "My final NFL game was Denver's victory in Super Bowl 50 over Carolina.",
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
            "text": "I played four college seasons in the SEC and returned for my senior year instead of entering the draft early.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tennessee",
              "tennesseeHall"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-2",
            "text": "I finished my college career with a 39-6 record as a starting quarterback.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "tennessee"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-3",
            "text": "As a senior, I won the Maxwell, Davey O'Brien and Johnny Unitas awards and finished second in Heisman voting.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tennessee"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-4",
            "text": "That senior season also ended with an SEC championship before I became the first pick of the 1998 NFL Draft.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tennessee"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-5",
            "text": "I later led Indianapolis to eight division championships.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "tennesseeHall"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-6",
            "text": "I was named the MVP of Super Bowl XLI after winning my first NFL championship.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-7",
            "text": "In 2013, I set an NFL single-season record with 5,477 passing yards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-8",
            "text": "I retired having recorded a victory against all 32 NFL franchises.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-9",
            "text": "I am the Tennessee quarterback who became a Super Bowl winner for both the Colts and Broncos.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "tennesseeHall",
              "hof"
            ]
          },
          {
            "id": "nfl-peyton-manning-b-10",
            "text": "I finished my Hall of Fame career with five league MVP awards and championships in Indianapolis and Denver.",
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
      "mvsu": "https://mvsusports.com/news/2018/9/27/FB_2018092701.aspx"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-jerry-rice-a-1",
            "text": "I was a first-round wide receiver from a small Division I-AA program.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-2",
            "text": "As a rookie, I caught 49 passes for 927 yards and three touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-3",
            "text": "In my second season, I led the NFL with 1,570 receiving yards and 15 touchdown catches.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-4",
            "text": "The next year, I set an NFL single-season record with 22 touchdown receptions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-5",
            "text": "I put together 11 consecutive 1,000-yard receiving seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-6",
            "text": "I led the NFL in receiving yards six times and in touchdown receptions six times.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-7",
            "text": "I was voted to 13 Pro Bowls and was first-team All-Pro in 11 consecutive seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-8",
            "text": "I won three Super Bowls with San Francisco and was MVP of Super Bowl XXIII.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-9",
            "text": "I finished my career with 1,549 receptions and 22,895 receiving yards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-a-10",
            "text": "I became the defining 49ers receiver before finishing a 20-season career with stops in Oakland and Seattle.",
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
            "text": "In college, I played in a pass-heavy offense with quarterback Willie Totten at an HBCU in Mississippi.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "mvsu"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-2",
            "text": "I finished my college career with 301 receptions, 4,693 receiving yards and 50 touchdown catches.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "mvsu"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-3",
            "text": "I helped that program reach its only Division I-AA playoff appearance in 1984.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "mvsu"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-4",
            "text": "San Francisco selected me 16th overall in the 1985 draft.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-5",
            "text": "My first 100-catch NFL season came in 1990, when I led the league in receptions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-6",
            "text": "In 1995, I set an NFL single-season record with 1,848 receiving yards.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-7",
            "text": "I played in eight conference championship games and four Super Bowls.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-8",
            "text": "My 20 NFL seasons were more than any other wide receiver had played when I retired.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-9",
            "text": "Mississippi Valley State later put both my name and my college quarterback's name on its football stadium.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "mvsu"
            ]
          },
          {
            "id": "nfl-jerry-rice-b-10",
            "text": "I am the former 49ers star who retired as the NFL's career leader in receptions, receiving yards and total touchdowns.",
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
      "hof": "https://www.profootballhof.com/players/randy-moss",
      "marshall": "https://herdzone.com/honors/marshall-athletics-hall-of-fame/randy-moss/162"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-randy-moss-a-1",
            "text": "I was a first-round wide receiver who made an immediate impact in my NFL debut.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-2",
            "text": "In that debut, I caught four passes for 95 yards and two touchdowns.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-3",
            "text": "As a rookie, I led the league with 17 touchdown receptions and won Offensive Rookie of the Year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-4",
            "text": "I eventually led the NFL in touchdown receptions five different seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-5",
            "text": "I produced 10 seasons with at least 1,000 receiving yards and nine with at least 10 touchdown catches.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-6",
            "text": "In 2007, I set the NFL single-season record with 23 touchdown receptions.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-7",
            "text": "That record-setting season came for a New England team that finished the regular season 16-0.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-8",
            "text": "I earned six Pro Bowl selections and four first-team All-Pro honors.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-9",
            "text": "I appeared in Super Bowls with both New England and San Francisco.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-a-10",
            "text": "I am the Vikings receiver who set a rookie touchdown-catch record before later setting the single-season record with 23 for the Patriots.",
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
            "text": "Before college, I was named my state's high-school player of the year in both football and basketball.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "marshall"
            ]
          },
          {
            "id": "nfl-randy-moss-b-2",
            "text": "In college, I also competed in track and won conference sprint titles.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "marshall"
            ]
          },
          {
            "id": "nfl-randy-moss-b-3",
            "text": "In 1996, I helped Marshall go 15-0 and win the Division I-AA national championship while scoring 29 touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "marshall"
            ]
          },
          {
            "id": "nfl-randy-moss-b-4",
            "text": "The next season, I won the Biletnikoff and Warfield awards and became a Heisman Trophy finalist.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "marshall"
            ]
          },
          {
            "id": "nfl-randy-moss-b-5",
            "text": "Minnesota selected me 21st overall in the 1998 NFL Draft.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-b-6",
            "text": "My NFL career included two separate stints with Minnesota plus time with Oakland, New England, Tennessee and San Francisco.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-b-7",
            "text": "I finished with 15,292 receiving yards and 156 touchdown catches.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-b-8",
            "text": "I was part of both the 1998 Minnesota offense and the 2007 New England offense when each set a then-NFL record for points in a season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-b-9",
            "text": "My first NFL team was Minnesota, where I finished second in franchise history in receptions, receiving yards and touchdown catches.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-randy-moss-b-10",
            "text": "I am the Marshall star who became a Hall of Fame deep threat for the Vikings and later caught 23 touchdowns in one season for New England.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "marshall",
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
      "hof": "https://www.profootballhof.com/players/barry-sanders",
      "okstate": "https://okstate.com/news/2022/5/23/football-record-rewind-barrys-332-rushing-yards-vs-texas-tech-in-1988",
      "okstateHistory": "https://okstate.com/news/2006/7/6/OSU_Football_All_Americans"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-barry-sanders-a-1",
            "text": "I was a first-round running back who spent my entire NFL career with one franchise.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-2",
            "text": "I rushed for more than 1,000 yards in every one of my 10 NFL seasons.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-3",
            "text": "I was selected to the Pro Bowl in each of those 10 seasons.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-4",
            "text": "I was first- or second-team All-Pro for 10 consecutive seasons.",
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
            "text": "Four of those 1,500-yard seasons came consecutively from 1994 through 1997.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-7",
            "text": "In 1997, I rushed for 2,053 yards, becoming the third player to top 2,000 in a season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-8",
            "text": "I finished with 15,269 rushing yards and 109 total touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-9",
            "text": "I unexpectedly retired in 1999 at age 31 after only 10 NFL seasons.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-a-10",
            "text": "I am the Detroit running back who rushed for 2,053 yards in 1997 and never played for another NFL team.",
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
            "text": "Early in college, I made my mark as a return specialist while another future NFL star was the starting tailback.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "okstateHistory"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-2",
            "text": "I spent my first two college seasons backing up Thurman Thomas.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "okstate"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-3",
            "text": "I had only one full season as my college team's starting tailback.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "okstateHistory"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-4",
            "text": "In that 1988 season, I rushed for an NCAA-record 2,628 yards and 37 rushing touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "okstate"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-5",
            "text": "That season ended with the Heisman Trophy after I set 34 individual NCAA records.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "okstate"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-6",
            "text": "I skipped my senior season and Detroit selected me third overall in the 1989 draft.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "okstateHistory"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-7",
            "text": "As a rookie, I rushed for 1,470 yards, finishing just 10 yards short of the league lead.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-8",
            "text": "I followed my college Heisman season by becoming the first NFL back to post 10 straight 1,000-yard seasons.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "okstate"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-9",
            "text": "Oklahoma State's record book still ties my name to one of college football's most famous single-season rushing performances.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "okstate",
              "okstateHistory"
            ]
          },
          {
            "id": "nfl-barry-sanders-b-10",
            "text": "I am the Oklahoma State Heisman winner who became Detroit's Hall of Fame running back and retired with 15,269 rushing yards.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "okstate"
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
      "hof": "https://www.profootballhof.com/players/deion-sanders",
      "fsu": "https://seminoles.com/honors/florida-state-athletics-hall-of-fame/deion-sanders/99"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-deion-sanders-a-1",
            "text": "I was a first-round cornerback who also became a major factor in the return game.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-2",
            "text": "I returned a punt 68 yards for a touchdown in my NFL debut.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-3",
            "text": "My 14-season NFL career included five different franchises.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-4",
            "text": "I intercepted 53 passes during my NFL career.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-5",
            "text": "Nine of my interceptions were returned for touchdowns.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-6",
            "text": "I was named first-team All-Pro nine times and selected to eight Pro Bowls.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-7",
            "text": "In 1994, I was named NFL Defensive Player of the Year after returning three interceptions for touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-8",
            "text": "I won Super Bowl XXIX with San Francisco and Super Bowl XXX with Dallas.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-9",
            "text": "Even as a Hall of Fame cornerback, I also caught 60 NFL passes and scored three receiving touchdowns.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-a-10",
            "text": "I became the shutdown corner known as Prime Time after entering the league with Atlanta.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "fsu"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-deion-sanders-b-1",
            "text": "As a college freshman, I started at cornerback, played outfield in baseball and also competed in track.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-2",
            "text": "I became a two-time consensus football All-American in college.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-3",
            "text": "I won the 1988 Jim Thorpe Award and finished my college career with 14 interceptions.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-4",
            "text": "In 1989, I was drafted by both the Atlanta Falcons and the New York Yankees.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "fsu",
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-5",
            "text": "My professional baseball career included the Braves, Reds and Giants while I was also starring in the NFL.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "fsu"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-6",
            "text": "In the NFL, I scored six punt-return touchdowns, three kickoff-return touchdowns and nine interception-return touchdowns.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-7",
            "text": "In 1994, I became the first player ever to record two 90-yard interception-return touchdowns in the same season.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-8",
            "text": "After a three-year retirement, I returned with Baltimore and intercepted five more passes.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-9",
            "text": "Florida State knew me as an elite corner, punt returner and two-sport star before Atlanta made me the fifth pick of the NFL Draft.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "fsu",
              "hof"
            ]
          },
          {
            "id": "nfl-deion-sanders-b-10",
            "text": "I am the two-sport star nicknamed Prime Time who won Super Bowls with both the 49ers and Cowboys.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "fsu",
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
      "rams": "https://www.therams.com/team/players-roster/aaron-donald/",
      "ramsDraft": "https://www.therams.com/news/countdown-to-the-draft-2014-rams-aaron-donald",
      "ramsMoments": "https://www.therams.com/news/aaron-donald-s-10-greatest-moments-with-rams",
      "pitt": "https://pittsburghpanthers.com/sports/football/roster/aaron-donald/1442"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-aaron-donald-a-1",
            "text": "I was a first-round interior defensive lineman selected in the top half of the draft.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "ramsDraft"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-2",
            "text": "I won Defensive Rookie of the Year in my first NFL season.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "rams",
              "ramsMoments"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-3",
            "text": "I made the Pro Bowl in every season of my first 10-year NFL run.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-4",
            "text": "Beginning in 2015, I earned seven consecutive first-team All-Pro selections.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ramsMoments"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-5",
            "text": "I won my first AP Defensive Player of the Year award in 2017.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-6",
            "text": "In 2018, I recorded 20.5 sacks and won Defensive Player of the Year again.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ramsDraft"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-7",
            "text": "I added a third AP Defensive Player of the Year award in 2020.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-8",
            "text": "That made me one of only three players in NFL history to win that award three times.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-9",
            "text": "I helped seal the Rams' victory in Super Bowl LVI with the defining defensive stop of the final drive.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-aaron-donald-a-10",
            "text": "I am the Pitt defensive tackle the Rams selected 13th overall in 2014 before I became a three-time Defensive Player of the Year.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "ramsDraft",
              "pitt",
              "rams"
            ]
          }
        ]
      },
      "B": {
        "id": "B",
        "clues": [
          {
            "id": "nfl-aaron-donald-b-1",
            "text": "I stayed in my hometown for college and developed into one of the nation's most decorated defensive linemen.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "rams"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-2",
            "text": "As a college senior, I won the Nagurski, Bednarik, Outland and Lombardi awards.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "pitt"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-3",
            "text": "That senior season included 11 sacks and 28.5 tackles for loss.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ramsDraft"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-4",
            "text": "The Rams selected me 13th overall in the 2014 NFL Draft.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ramsDraft"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-5",
            "text": "By the end of my first four NFL seasons, my 39 sacks led all interior defensive linemen over that span.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "ramsDraft"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-6",
            "text": "My 2018 season produced a franchise-record 20.5 sacks.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "ramsDraft"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-7",
            "text": "I was a unanimous selection to the NFL's All-Decade Team of the 2010s.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-8",
            "text": "Across my first 154 regular-season games, I totaled 111 sacks and became the Rams' official-era franchise sack leader.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "rams"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-9",
            "text": "My college award sweep at Pitt preceded a Rams career that included a championship in Super Bowl LVI.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "pitt",
              "rams"
            ]
          },
          {
            "id": "nfl-aaron-donald-b-10",
            "text": "I am the Rams interior disruptor who paired three Defensive Player of the Year awards with a Super Bowl title.",
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
    "subjectId": "lawrence-taylor",
    "name": "Lawrence Taylor",
    "stageFocus": "NFL-career-forward",
    "earlyRotation": "normal",
    "sources": {
      "hof": "https://www.profootballhof.com/players/lawrence-taylor",
      "unc": "https://goheels.com/honors/hall-of-fame/lawrence-taylor/80",
      "uncHistory": "https://goheels.com/news/2020/1/9/football-three-placed-on-cfb150-all-time-greatest-players-list.aspx"
    },
    "scripts": {
      "A": {
        "id": "A",
        "clues": [
          {
            "id": "nfl-lawrence-taylor-a-1",
            "text": "I was a top-two draft pick at linebacker and spent my entire NFL career with one team.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "unc"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-a-2",
            "text": "My rookie season included 133 tackles and 9.5 sacks.",
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
            "text": "Starting with my rookie year, my team made the playoffs six times in a 10-season span and won two Super Bowls.",
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
            "text": "That season I won NFL MVP, becoming the first defensive player to do so since 1971.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-a-8",
            "text": "I was selected to 10 consecutive Pro Bowls.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "unc",
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-a-9",
            "text": "I played all 13 of my NFL seasons for the New York Giants.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "unc"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-a-10",
            "text": "I am the Giants pass-rushing linebacker whose 1986 season paired 20.5 sacks with the league MVP award.",
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
            "text": "My first two college seasons were affected by injuries while I played inside linebacker and nose guard.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "uncHistory"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-2",
            "text": "A move to outside linebacker before my junior year changed the course of my career.",
            "band": "broad",
            "verification": "verified",
            "sourceIds": [
              "uncHistory"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-3",
            "text": "As a senior, I set a North Carolina record with 16 sacks and was named ACC Player of the Year.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "unc"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-4",
            "text": "The Giants selected me second overall in the 1981 NFL Draft.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "unc",
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-5",
            "text": "I won NFL Rookie of the Year and immediately became one of the league's premier edge defenders.",
            "band": "helpful",
            "verification": "verified",
            "sourceIds": [
              "unc"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-6",
            "text": "In a 1988 game played with a torn pectoral muscle, I recorded three sacks and two forced fumbles in a 13-12 win.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-7",
            "text": "I finished my career with 10 Pro Bowl selections and nine first-team All-Pro honors.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-8",
            "text": "My Giants teams won two Super Bowls during my 13-season career.",
            "band": "strong",
            "verification": "verified",
            "sourceIds": [
              "hof",
              "unc"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-9",
            "text": "North Carolina retired the image of a dominant outside linebacker whose senior season helped produce an 11-1 ACC championship team.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "unc",
              "uncHistory"
            ]
          },
          {
            "id": "nfl-lawrence-taylor-b-10",
            "text": "I am the North Carolina star who became the Giants' Hall of Fame linebacker and the 1986 NFL MVP.",
            "band": "giveaway",
            "verification": "verified",
            "sourceIds": [
              "unc",
              "hof"
            ]
          }
        ]
      }
    }
  }
] as const satisfies readonly FootballWhoAmIAuthoredIdentity[];
