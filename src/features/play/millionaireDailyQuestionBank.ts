import {
  MILLIONAIRE_LEVELS,
  MILLIONAIRE_MONEY_BY_LEVEL,
  type MillionaireChoiceId,
  type MillionaireRuntimeQuestion,
} from "../games/millionaireAuthority";
import type { MillionaireRun } from "../games/millionaireEngine";
import type { MillionaireLeague } from "./MillionaireCasualModel";

type DailyQuestionSeed = {
  type: string;
  prompt: string;
  choices: readonly [string, string, string, string];
  answer: string;
  statSheet: string | null;
};

const IDS = ["A", "B", "C", "D"] as const;

const BANKS: Record<MillionaireLeague, readonly (readonly DailyQuestionSeed[])[]> = {
  "cfb": [
    [
      {
        "type": "awards",
        "prompt": "Who won the 2019 Heisman Trophy?",
        "choices": [
          "Joe Burrow",
          "Jalen Hurts",
          "Justin Fields",
          "Chase Young"
        ],
        "answer": "Joe Burrow",
        "statSheet": "The winner led LSU to an undefeated national championship season."
      },
      {
        "type": "championship",
        "prompt": "Who won the first College Football Playoff national championship?",
        "choices": [
          "Ohio State",
          "Oregon",
          "Alabama",
          "Florida State"
        ],
        "answer": "Ohio State",
        "statSheet": "The champion entered the four-team playoff as the No. 4 seed."
      },
      {
        "type": "championship",
        "prompt": "Who did Clemson defeat to win the 2016 national championship?",
        "choices": [
          "Alabama",
          "Ohio State",
          "Oklahoma",
          "Florida State"
        ],
        "answer": "Alabama",
        "statSheet": "Deshaun Watson threw the winning touchdown with one second left."
      },
      {
        "type": "chronology",
        "prompt": "Which of these Heisman winners won the award most recently?",
        "choices": [
          "Marcus Mariota",
          "Baker Mayfield",
          "Joe Burrow",
          "Bryce Young"
        ],
        "answer": "Bryce Young",
        "statSheet": "The answer became Alabama's first quarterback to win the Heisman."
      },
      {
        "type": "awards-history",
        "prompt": "Which school produced consecutive Heisman winners in 2004 and 2005?",
        "choices": [
          "USC",
          "Oklahoma",
          "Florida",
          "Alabama"
        ],
        "answer": "USC",
        "statSheet": "Both winners played offense for Pete Carroll."
      },
      {
        "type": "awards-postseason",
        "prompt": "Which Heisman-winning quarterback did NOT win his conference championship in his Heisman season?",
        "choices": [
          "Cam Newton",
          "Joe Burrow",
          "Baker Mayfield",
          "Lamar Jackson"
        ],
        "answer": "Lamar Jackson",
        "statSheet": "The answer became Louisville's first Heisman Trophy winner."
      },
      {
        "type": "playoff-history",
        "prompt": "Which CFP national champion did NOT win its conference championship?",
        "choices": [
          "2014 Ohio State",
          "2016 Clemson",
          "2017 Alabama",
          "2019 LSU"
        ],
        "answer": "2017 Alabama",
        "statSheet": "The answer won the national title on Tua Tagovailoa's overtime touchdown pass to DeVonta Smith."
      },
      {
        "type": "stat-comparison",
        "prompt": "Which Heisman-winning quarterback threw the fewest touchdown passes in his Heisman season?",
        "choices": [
          "Tim Tebow 2007",
          "Cam Newton 2010",
          "Johnny Manziel 2012",
          "Lamar Jackson 2016"
        ],
        "answer": "Johnny Manziel 2012",
        "statSheet": null
      }
    ],
    [
      {
        "type": "championship",
        "prompt": "Who won the 2005 national championship?",
        "choices": [
          "Texas",
          "USC",
          "Penn State",
          "Ohio State"
        ],
        "answer": "Texas",
        "statSheet": "The title was decided in the Rose Bowl against USC."
      },
      {
        "type": "awards",
        "prompt": "Who won the 2013 Heisman Trophy?",
        "choices": [
          "Jameis Winston",
          "AJ McCarron",
          "Jordan Lynch",
          "Johnny Manziel"
        ],
        "answer": "Jameis Winston",
        "statSheet": "The winner was a redshirt freshman quarterback for Florida State."
      },
      {
        "type": "upset-history",
        "prompt": "Which team pulled off the famous 2007 upset at Michigan?",
        "choices": [
          "Appalachian State",
          "Boise State",
          "Utah",
          "TCU"
        ],
        "answer": "Appalachian State",
        "statSheet": "The winner blocked a field goal on the final play."
      },
      {
        "type": "chronology",
        "prompt": "Which of these programs won a national championship most recently?",
        "choices": [
          "LSU 2007",
          "Auburn 2010",
          "Florida State 2013",
          "Clemson 2016"
        ],
        "answer": "Clemson 2016",
        "statSheet": "The answer's title came on a last-second touchdown pass from Deshaun Watson."
      },
      {
        "type": "team-history",
        "prompt": "Which program had three Heisman winners between 2002 and 2005?",
        "choices": [
          "USC",
          "Oklahoma",
          "Florida",
          "Ohio State"
        ],
        "answer": "USC",
        "statSheet": "Carson Palmer began the run."
      },
      {
        "type": "awards-draft",
        "prompt": "Which Heisman winner was selected latest in the NFL Draft?",
        "choices": [
          "Tim Tebow",
          "Johnny Manziel",
          "Lamar Jackson",
          "Joe Burrow"
        ],
        "answer": "Lamar Jackson",
        "statSheet": "The answer won the Heisman while playing at Louisville."
      },
      {
        "type": "bcs-history",
        "prompt": "Which BCS national champion won the title despite two regular-season losses?",
        "choices": [
          "2007 LSU",
          "2008 Florida",
          "2010 Auburn",
          "2011 Alabama"
        ],
        "answer": "2007 LSU",
        "statSheet": "The answer won the SEC Championship before beating Ohio State for the title."
      },
      {
        "type": "stat-comparison",
        "prompt": "Which Heisman-winning running back rushed for the most yards in his Heisman season?",
        "choices": [
          "Barry Sanders 1988",
          "Marcus Allen 1981",
          "Ricky Williams 1998",
          "Derrick Henry 2015"
        ],
        "answer": "Barry Sanders 1988",
        "statSheet": null
      }
    ],
    [
      {
        "type": "championship",
        "prompt": "Who won the 2023 national championship?",
        "choices": [
          "Michigan",
          "Washington",
          "Georgia",
          "Texas"
        ],
        "answer": "Michigan",
        "statSheet": "The champion finished 15-0 under Jim Harbaugh."
      },
      {
        "type": "awards",
        "prompt": "Who won the 2020 Heisman Trophy?",
        "choices": [
          "DeVonta Smith",
          "Mac Jones",
          "Trevor Lawrence",
          "Kyle Trask"
        ],
        "answer": "DeVonta Smith",
        "statSheet": "The winner was Alabama's first wide receiver to take the award."
      },
      {
        "type": "championship",
        "prompt": "Who did Florida State defeat for the 2013 national championship?",
        "choices": [
          "Auburn",
          "Alabama",
          "Oregon",
          "Stanford"
        ],
        "answer": "Auburn",
        "statSheet": "Jameis Winston threw the winning touchdown with 13 seconds left."
      },
      {
        "type": "playoff-history",
        "prompt": "Which team became the first No. 4 seed to win the College Football Playoff?",
        "choices": [
          "Ohio State",
          "Alabama",
          "Oklahoma",
          "Georgia"
        ],
        "answer": "Ohio State",
        "statSheet": "The team used its third-string quarterback during the postseason run."
      },
      {
        "type": "coaching-history",
        "prompt": "Which coach won national championships at both LSU and Alabama?",
        "choices": [
          "Nick Saban",
          "Urban Meyer",
          "Les Miles",
          "Jimbo Fisher"
        ],
        "answer": "Nick Saban",
        "statSheet": "His first title came before he ever coached Alabama."
      },
      {
        "type": "awards-postseason",
        "prompt": "Which Heisman-winning quarterback's team did NOT play for the national championship that season?",
        "choices": [
          "Tim Tebow 2007",
          "Cam Newton 2010",
          "Jameis Winston 2013",
          "Joe Burrow 2019"
        ],
        "answer": "Tim Tebow 2007",
        "statSheet": "The answer became the first sophomore to win the Heisman Trophy."
      },
      {
        "type": "quarterback-path",
        "prompt": "Which national champion was quarterbacked by a former walk-on who later returned to the program after a junior-college stop?",
        "choices": [
          "2021 Georgia",
          "2014 Ohio State",
          "2017 Alabama",
          "2018 Clemson"
        ],
        "answer": "2021 Georgia",
        "statSheet": "That quarterback became a Heisman finalist the following season."
      },
      {
        "type": "draft-comparison",
        "prompt": "Which of these Heisman winners was selected latest in the NFL Draft?",
        "choices": [
          "Derrick Henry",
          "DeVonta Smith",
          "Reggie Bush",
          "Lamar Jackson"
        ],
        "answer": "Derrick Henry",
        "statSheet": null
      }
    ],
    [
      {
        "type": "recognition",
        "prompt": "Which school did Tim Tebow play for?",
        "choices": [
          "Florida",
          "Georgia",
          "Auburn",
          "Tennessee"
        ],
        "answer": "Florida",
        "statSheet": "He won both a Heisman Trophy and two national championships there."
      },
      {
        "type": "awards",
        "prompt": "Who won the 2003 Heisman Trophy?",
        "choices": [
          "Jason White",
          "Larry Fitzgerald",
          "Eli Manning",
          "Chris Perry"
        ],
        "answer": "Jason White",
        "statSheet": "The winner quarterbacked Oklahoma."
      },
      {
        "type": "bowl-history",
        "prompt": "Which team upset Oklahoma in the 2007 Fiesta Bowl?",
        "choices": [
          "Boise State",
          "Utah",
          "TCU",
          "West Virginia"
        ],
        "answer": "Boise State",
        "statSheet": "The winning two-point conversion came on a Statue of Liberty play."
      },
      {
        "type": "chronology",
        "prompt": "Which famous college football moment happened earliest?",
        "choices": [
          "Miracle at Michigan",
          "Bush Push",
          "Appalachian State over Michigan",
          "Kick Six"
        ],
        "answer": "Miracle at Michigan",
        "statSheet": "The play was a last-second Colorado Hail Mary caught in Ann Arbor."
      },
      {
        "type": "coaching-history",
        "prompt": "Which coach won BCS national championships at two different schools?",
        "choices": [
          "Nick Saban",
          "Urban Meyer",
          "Pete Carroll",
          "Dabo Swinney"
        ],
        "answer": "Nick Saban",
        "statSheet": "His first BCS title came at LSU."
      },
      {
        "type": "bcs-history",
        "prompt": "Which undefeated SEC team finished 13-0 but did not play for the 2004 BCS title?",
        "choices": [
          "Auburn",
          "LSU",
          "Georgia",
          "Tennessee"
        ],
        "answer": "Auburn",
        "statSheet": "The team beat Virginia Tech in the Sugar Bowl to complete its perfect season."
      },
      {
        "type": "split-title-history",
        "prompt": "Which team won the BCS championship but did NOT finish No. 1 in the AP poll in 2003?",
        "choices": [
          "LSU",
          "USC",
          "Oklahoma",
          "Miami"
        ],
        "answer": "LSU",
        "statSheet": "The answer was coached by Nick Saban."
      },
      {
        "type": "stat-comparison",
        "prompt": "Which Heisman-winning quarterback scored the most rushing touchdowns in his Heisman season?",
        "choices": [
          "Tim Tebow 2007",
          "Cam Newton 2010",
          "Johnny Manziel 2012",
          "Lamar Jackson 2016"
        ],
        "answer": "Tim Tebow 2007",
        "statSheet": null
      }
    ],
    [
      {
        "type": "recognition",
        "prompt": "Which school did Derrick Henry play for?",
        "choices": [
          "Alabama",
          "Georgia",
          "LSU",
          "Florida"
        ],
        "answer": "Alabama",
        "statSheet": "He became the school's second Heisman winner."
      },
      {
        "type": "awards",
        "prompt": "Who won the 2014 Heisman Trophy?",
        "choices": [
          "Marcus Mariota",
          "Amari Cooper",
          "Melvin Gordon",
          "Trevone Boykin"
        ],
        "answer": "Marcus Mariota",
        "statSheet": "The winner was Oregon's first Heisman Trophy recipient."
      },
      {
        "type": "championship-moment",
        "prompt": "Who caught Alabama's game-winning touchdown in the 2017 national championship game?",
        "choices": [
          "DeVonta Smith",
          "Calvin Ridley",
          "O.J. Howard",
          "Jerry Jeudy"
        ],
        "answer": "DeVonta Smith",
        "statSheet": "The touchdown came in overtime on a pass from Tua Tagovailoa."
      },
      {
        "type": "coaching-chronology",
        "prompt": "Which coach won his first national championship earliest?",
        "choices": [
          "Nick Saban",
          "Urban Meyer",
          "Jimbo Fisher",
          "Dabo Swinney"
        ],
        "answer": "Nick Saban",
        "statSheet": "His first title came at LSU."
      },
      {
        "type": "playoff-history",
        "prompt": "Which team became the first CFP participant to make the playoff without winning its conference?",
        "choices": [
          "Ohio State 2016",
          "Alabama 2017",
          "Notre Dame 2018",
          "Georgia 2021"
        ],
        "answer": "Ohio State 2016",
        "statSheet": "The answer lost 31-0 to Clemson in the semifinal."
      },
      {
        "type": "draft-history",
        "prompt": "Which Heisman-winning quarterback was NOT selected in the first round?",
        "choices": [
          "Troy Smith",
          "Tim Tebow",
          "Cam Newton",
          "Baker Mayfield"
        ],
        "answer": "Troy Smith",
        "statSheet": "The answer was drafted by Baltimore after a dominant senior season at Ohio State."
      },
      {
        "type": "stat-comparison",
        "prompt": "Which Heisman-winning quarterback threw for fewer than 3,000 yards in his Heisman season?",
        "choices": [
          "Cam Newton",
          "Tim Tebow",
          "Johnny Manziel",
          "Lamar Jackson"
        ],
        "answer": "Cam Newton",
        "statSheet": "The answer also rushed for more than 1,400 yards."
      },
      {
        "type": "championship-comparison",
        "prompt": "Which national champion won its title game by the smallest margin?",
        "choices": [
          "2010 Auburn",
          "2014 Ohio State",
          "2016 Clemson",
          "2021 Georgia"
        ],
        "answer": "2010 Auburn",
        "statSheet": null
      }
    ],
    [
      {
        "type": "championship",
        "prompt": "Who won the 2020 national championship?",
        "choices": [
          "Alabama",
          "Ohio State",
          "Clemson",
          "Notre Dame"
        ],
        "answer": "Alabama",
        "statSheet": "The champion finished 13-0 in a conference-only regular season."
      },
      {
        "type": "awards",
        "prompt": "Who won the 2022 Heisman Trophy?",
        "choices": [
          "Caleb Williams",
          "C.J. Stroud",
          "Max Duggan",
          "Stetson Bennett"
        ],
        "answer": "Caleb Williams",
        "statSheet": "The winner quarterbacked USC."
      },
      {
        "type": "team-history",
        "prompt": "Which program is most associated with the legendary 2001 team led by quarterback Ken Dorsey?",
        "choices": [
          "Miami",
          "Florida State",
          "Florida",
          "Nebraska"
        ],
        "answer": "Miami",
        "statSheet": "That team finished undefeated and won the national championship."
      },
      {
        "type": "streak-history",
        "prompt": "Which team ended USC's 34-game winning streak in the 2006 Rose Bowl?",
        "choices": [
          "Texas",
          "UCLA",
          "Notre Dame",
          "Oregon"
        ],
        "answer": "Texas",
        "statSheet": "The winning quarterback scored the decisive touchdown on fourth down."
      },
      {
        "type": "awards-history",
        "prompt": "Which school produced back-to-back Heisman-winning quarterbacks in 2017 and 2018?",
        "choices": [
          "Oklahoma",
          "Alabama",
          "USC",
          "Ohio State"
        ],
        "answer": "Oklahoma",
        "statSheet": "Both winners later became No. 1 overall NFL draft picks."
      },
      {
        "type": "championship-path",
        "prompt": "Which CFP champion lost its conference championship game before still winning the national title?",
        "choices": [
          "2021 Georgia",
          "2018 Clemson",
          "2019 LSU",
          "2020 Alabama"
        ],
        "answer": "2021 Georgia",
        "statSheet": "The answer was quarterbacked by former walk-on Stetson Bennett."
      },
      {
        "type": "preseason-ranking",
        "prompt": "Which national champion began its title season ranked No. 22 in the preseason AP poll?",
        "choices": [
          "2010 Auburn",
          "2013 Florida State",
          "2014 Ohio State",
          "2019 LSU"
        ],
        "answer": "2010 Auburn",
        "statSheet": "The team climbed behind a breakout junior-college-transfer quarterback."
      },
      {
        "type": "poll-history",
        "prompt": "Which Heisman-winning quarterback's team finished lowest in the final AP poll during his Heisman season?",
        "choices": [
          "Tim Tebow 2007",
          "Robert Griffin III 2011",
          "Johnny Manziel 2012",
          "Lamar Jackson 2016"
        ],
        "answer": "Lamar Jackson 2016",
        "statSheet": null
      }
    ],
    [
      {
        "type": "awards",
        "prompt": "Who won the 2008 Heisman Trophy?",
        "choices": [
          "Sam Bradford",
          "Tim Tebow",
          "Colt McCoy",
          "Graham Harrell"
        ],
        "answer": "Sam Bradford",
        "statSheet": "The winner quarterbacked Oklahoma to the BCS Championship Game."
      },
      {
        "type": "championship",
        "prompt": "Who did Alabama defeat for the 2011 national championship?",
        "choices": [
          "LSU",
          "Oklahoma State",
          "Oregon",
          "Stanford"
        ],
        "answer": "LSU",
        "statSheet": "The title game was a rematch of a regular-season meeting."
      },
      {
        "type": "playoff-history",
        "prompt": "Who coached Ohio State to the first College Football Playoff title?",
        "choices": [
          "Urban Meyer",
          "Ryan Day",
          "Jim Tressel",
          "Luke Fickell"
        ],
        "answer": "Urban Meyer",
        "statSheet": "The title came in his third season in Columbus."
      },
      {
        "type": "playoff-matchup",
        "prompt": "Who did Georgia defeat in the semifinal before winning the 2021 national championship?",
        "choices": [
          "Michigan",
          "Cincinnati",
          "Notre Dame",
          "Oklahoma"
        ],
        "answer": "Michigan",
        "statSheet": "The semifinal was played at the Orange Bowl."
      },
      {
        "type": "awards-history",
        "prompt": "Which school produced Heisman-winning quarterbacks Danny Wuerffel and Tim Tebow?",
        "choices": [
          "Florida",
          "Florida State",
          "Miami",
          "Georgia"
        ],
        "answer": "Florida",
        "statSheet": "Both quarterbacks also won national championships as starters."
      },
      {
        "type": "playoff-history",
        "prompt": "Which program became the first to make four consecutive College Football Playoff appearances?",
        "choices": [
          "Alabama",
          "Clemson",
          "Oklahoma",
          "Ohio State"
        ],
        "answer": "Alabama",
        "statSheet": "Nick Saban's team reached each of the first four CFP fields."
      },
      {
        "type": "coaching-history",
        "prompt": "Which coach won a national championship in his first season as a college head coach?",
        "choices": [
          "Larry Coker",
          "Jim Tressel",
          "Jimbo Fisher",
          "Kirby Smart"
        ],
        "answer": "Larry Coker",
        "statSheet": "He inherited a loaded Miami team and finished 12-0."
      },
      {
        "type": "preseason-ranking",
        "prompt": "Which of these national champions started the season lowest in the preseason AP poll?",
        "choices": [
          "2000 Oklahoma",
          "2002 Ohio State",
          "2010 Auburn",
          "2013 Florida State"
        ],
        "answer": "2010 Auburn",
        "statSheet": null
      }
    ],
    [
      {
        "type": "championship",
        "prompt": "Who won the 2019 national championship?",
        "choices": [
          "LSU",
          "Clemson",
          "Ohio State",
          "Oklahoma"
        ],
        "answer": "LSU",
        "statSheet": "The champion finished 15-0."
      },
      {
        "type": "awards",
        "prompt": "Who won the 2015 Heisman Trophy?",
        "choices": [
          "Derrick Henry",
          "Christian McCaffrey",
          "Deshaun Watson",
          "Baker Mayfield"
        ],
        "answer": "Derrick Henry",
        "statSheet": "The winner broke the SEC single-season rushing record."
      },
      {
        "type": "championship-moment",
        "prompt": "Who scored the famous fourth-down touchdown that sealed Texas's 2005 national championship?",
        "choices": [
          "Vince Young",
          "Jamaal Charles",
          "Ramonce Taylor",
          "David Thomas"
        ],
        "answer": "Vince Young",
        "statSheet": "The play came on fourth-and-5 in the final minute."
      },
      {
        "type": "transfer-history",
        "prompt": "Which school did Baker Mayfield play for before transferring to Oklahoma?",
        "choices": [
          "Texas Tech",
          "TCU",
          "Baylor",
          "Oklahoma State"
        ],
        "answer": "Texas Tech",
        "statSheet": "He began his FBS career as a walk-on."
      },
      {
        "type": "playoff-history",
        "prompt": "Which major conference had no team in the inaugural College Football Playoff?",
        "choices": [
          "Big 12",
          "SEC",
          "ACC",
          "Big Ten"
        ],
        "answer": "Big 12",
        "statSheet": "TCU and Baylor were both left outside the four-team field."
      },
      {
        "type": "playoff-history",
        "prompt": "Which team became the first CFP participant to make the field after losing its conference championship game?",
        "choices": [
          "Notre Dame 2020",
          "Georgia 2021",
          "TCU 2022",
          "Wisconsin 2017"
        ],
        "answer": "Notre Dame 2020",
        "statSheet": "The COVID season was the only season Notre Dame competed as an ACC football member."
      },
      {
        "type": "playoff-classic",
        "prompt": "Which CFP finalist won its semifinal in double overtime?",
        "choices": [
          "2017 Georgia",
          "2014 Ohio State",
          "2016 Clemson",
          "2019 LSU"
        ],
        "answer": "2017 Georgia",
        "statSheet": "The semifinal was the Rose Bowl against Oklahoma."
      },
      {
        "type": "depth-chart-history",
        "prompt": "Which championship-game starting quarterback began the season as his team's third-string quarterback?",
        "choices": [
          "Cardale Jones",
          "Tua Tagovailoa",
          "Stetson Bennett",
          "Jake Coker"
        ],
        "answer": "Cardale Jones",
        "statSheet": null
      }
    ],
    [
      {
        "type": "awards",
        "prompt": "Which school did Reggie Bush play for?",
        "choices": [
          "USC",
          "Texas",
          "Miami",
          "Oklahoma"
        ],
        "answer": "USC",
        "statSheet": "He was part of one of the defining offenses of the mid-2000s."
      },
      {
        "type": "championship-history",
        "prompt": "Which two teams split major national-title recognition in 1997?",
        "choices": [
          "Michigan and Nebraska",
          "Florida State and Nebraska",
          "Michigan and Tennessee",
          "Penn State and Florida State"
        ],
        "answer": "Michigan and Nebraska",
        "statSheet": "One finished No. 1 in the AP poll and the other No. 1 in the coaches poll."
      },
      {
        "type": "awards-championship",
        "prompt": "Who quarterbacked Auburn to the 2010 national championship and won the Heisman?",
        "choices": [
          "Cam Newton",
          "Nick Marshall",
          "Jason Campbell",
          "Bo Nix"
        ],
        "answer": "Cam Newton",
        "statSheet": "He arrived at Auburn after a junior-college stop."
      },
      {
        "type": "chronology",
        "prompt": "Who won the final BCS national championship before the CFP era began?",
        "choices": [
          "Florida State",
          "Alabama",
          "Auburn",
          "Oregon"
        ],
        "answer": "Florida State",
        "statSheet": "The title season ended with a win over Auburn."
      },
      {
        "type": "awards-postseason",
        "prompt": "Which Heisman-winning quarterback also won the national championship in his Heisman season?",
        "choices": [
          "Joe Burrow",
          "Lamar Jackson",
          "Baker Mayfield",
          "Caleb Williams"
        ],
        "answer": "Joe Burrow",
        "statSheet": "His team finished 15-0."
      },
      {
        "type": "bcs-history",
        "prompt": "Which BCS bowl matched two undefeated teams from non-automatic-qualifying conferences after the 2009 season?",
        "choices": [
          "Fiesta Bowl",
          "Sugar Bowl",
          "Orange Bowl",
          "Rose Bowl"
        ],
        "answer": "Fiesta Bowl",
        "statSheet": "Boise State and TCU met in the game."
      },
      {
        "type": "poll-history",
        "prompt": "Which undefeated team finished No. 2 in the final AP poll after beating Alabama in the Sugar Bowl?",
        "choices": [
          "Utah 2008",
          "Boise State 2006",
          "TCU 2010",
          "Cincinnati 2009"
        ],
        "answer": "Utah 2008",
        "statSheet": "The answer was coached by Kyle Whittingham and quarterbacked by Brian Johnson."
      },
      {
        "type": "championship-comparison",
        "prompt": "Which national champion scored the fewest points in its championship game?",
        "choices": [
          "2000 Oklahoma",
          "2002 Ohio State",
          "2003 LSU",
          "2011 Alabama"
        ],
        "answer": "2000 Oklahoma",
        "statSheet": null
      }
    ],
    [
      {
        "type": "championship",
        "prompt": "Who won the 2025 national championship?",
        "choices": [
          "Indiana",
          "Miami",
          "Ohio State",
          "Oregon"
        ],
        "answer": "Indiana",
        "statSheet": "The champion completed a 16-0 season."
      },
      {
        "type": "awards",
        "prompt": "Who won the 2023 Heisman Trophy?",
        "choices": [
          "Jayden Daniels",
          "Michael Penix Jr.",
          "Bo Nix",
          "Marvin Harrison Jr."
        ],
        "answer": "Jayden Daniels",
        "statSheet": "The winner played quarterback at LSU."
      },
      {
        "type": "championship-history",
        "prompt": "Who won the first BCS national championship after the 1998 season?",
        "choices": [
          "Tennessee",
          "Florida State",
          "Nebraska",
          "Florida"
        ],
        "answer": "Tennessee",
        "statSheet": "The Volunteers defeated Florida State in the Fiesta Bowl."
      },
      {
        "type": "chronology",
        "prompt": "Which of these national championship seasons happened earliest?",
        "choices": [
          "Miami 2001",
          "Ohio State 2002",
          "LSU 2003",
          "USC 2004"
        ],
        "answer": "Miami 2001",
        "statSheet": "The answer's roster is remembered as one of the most talented teams in college football history."
      },
      {
        "type": "awards-history",
        "prompt": "Which quarterback won the Heisman one year after his Oklahoma teammate Baker Mayfield?",
        "choices": [
          "Kyler Murray",
          "Jalen Hurts",
          "Sam Bradford",
          "Landry Jones"
        ],
        "answer": "Kyler Murray",
        "statSheet": "He also became the No. 1 overall NFL draft pick."
      },
      {
        "type": "coaching-history",
        "prompt": "Which coach defeated his former head coach to win his first national championship?",
        "choices": [
          "Kirby Smart",
          "Dabo Swinney",
          "Jimbo Fisher",
          "Ryan Day"
        ],
        "answer": "Kirby Smart",
        "statSheet": "The answer played defensive back at Georgia before beginning his coaching career."
      },
      {
        "type": "heisman-history",
        "prompt": "Which Heisman-winning quarterback was 28 years old when he won the award?",
        "choices": [
          "Chris Weinke",
          "Joe Burrow",
          "Baker Mayfield",
          "Carson Palmer"
        ],
        "answer": "Chris Weinke",
        "statSheet": "The answer had previously spent years in professional baseball."
      },
      {
        "type": "draft-comparison",
        "prompt": "Which national-championship-winning quarterback was selected latest in the NFL Draft?",
        "choices": [
          "Greg McElroy",
          "AJ McCarron",
          "Cardale Jones",
          "Stetson Bennett"
        ],
        "answer": "Greg McElroy",
        "statSheet": null
      }
    ]
  ],
  "nfl": [
    [
      {
        "type": "draft",
        "prompt": "Who was selected No. 1 overall in the 2020 NFL Draft?",
        "choices": [
          "Joe Burrow",
          "Chase Young",
          "Tua Tagovailoa",
          "Justin Herbert"
        ],
        "answer": "Joe Burrow",
        "statSheet": "Cincinnati held the first pick after finishing 2-14 the previous season."
      },
      {
        "type": "super-bowl",
        "prompt": "Who made the game-clinching interception in Super Bowl XLIX?",
        "choices": [
          "Malcolm Butler",
          "Devin McCourty",
          "Darrelle Revis",
          "Brandon Browner"
        ],
        "answer": "Malcolm Butler",
        "statSheet": "Seattle had the ball at New England's 1-yard line with under 30 seconds left."
      },
      {
        "type": "draft-history",
        "prompt": "Who was the only quarterback selected before Aaron Rodgers in the 2005 NFL Draft?",
        "choices": [
          "Alex Smith",
          "Jason Campbell",
          "Charlie Frye",
          "Kyle Orton"
        ],
        "answer": "Alex Smith",
        "statSheet": "The answer finished his college career at Utah with an undefeated Fiesta Bowl season."
      },
      {
        "type": "chronology",
        "prompt": "Which quarterback was drafted most recently?",
        "choices": [
          "Jared Goff",
          "Patrick Mahomes",
          "Deshaun Watson",
          "Josh Allen"
        ],
        "answer": "Josh Allen",
        "statSheet": "The answer was drafted by Buffalo after the Bills traded up into the top 10."
      },
      {
        "type": "awards",
        "prompt": "Who was the most recent non-quarterback to win AP NFL MVP?",
        "choices": [
          "Adrian Peterson",
          "LaDainian Tomlinson",
          "Marshall Faulk",
          "Shaun Alexander"
        ],
        "answer": "Adrian Peterson",
        "statSheet": "The answer rushed for more than 2,000 yards in his MVP season."
      },
      {
        "type": "awards-comparison",
        "prompt": "Which quarterback has never been named first-team All-Pro?",
        "choices": [
          "Matthew Stafford",
          "Matt Ryan",
          "Cam Newton",
          "Lamar Jackson"
        ],
        "answer": "Matthew Stafford",
        "statSheet": "Three of these quarterbacks earned first-team All-Pro honors in an MVP season."
      },
      {
        "type": "passing-history",
        "prompt": "Which legendary quarterback never had a 4,000-yard passing season?",
        "choices": [
          "Joe Montana",
          "Dan Marino",
          "Peyton Manning",
          "Drew Brees"
        ],
        "answer": "Joe Montana",
        "statSheet": "The answer's career-high passing total came during an MVP season."
      },
      {
        "type": "season-comparison",
        "prompt": "Which 5,000-yard passing season came with the fewest team wins?",
        "choices": [
          "Drew Brees 2008",
          "Dan Marino 1984",
          "Tom Brady 2011",
          "Matthew Stafford 2011"
        ],
        "answer": "Drew Brees 2008",
        "statSheet": null
      }
    ],
    [
      {
        "type": "draft",
        "prompt": "Which team selected Peyton Manning No. 1 overall in 1998?",
        "choices": [
          "Colts",
          "Chargers",
          "Jets",
          "Titans"
        ],
        "answer": "Colts",
        "statSheet": "The franchise had the first pick after a 3-13 season."
      },
      {
        "type": "super-bowl",
        "prompt": "Who was named MVP of Super Bowl 50?",
        "choices": [
          "Von Miller",
          "Peyton Manning",
          "DeMarcus Ware",
          "Cam Newton"
        ],
        "answer": "Von Miller",
        "statSheet": "Denver's defense forced four turnovers in the game."
      },
      {
        "type": "records",
        "prompt": "Who set the single-season receiving touchdown record with 23 in 2007?",
        "choices": [
          "Randy Moss",
          "Jerry Rice",
          "Terrell Owens",
          "Marvin Harrison"
        ],
        "answer": "Randy Moss",
        "statSheet": "The record came during New England's 16-0 regular season."
      },
      {
        "type": "draft-chronology",
        "prompt": "Which quarterback was drafted earliest?",
        "choices": [
          "Philip Rivers",
          "Aaron Rodgers",
          "Jay Cutler",
          "Matthew Stafford"
        ],
        "answer": "Philip Rivers",
        "statSheet": "The answer spent the bulk of his career with the Chargers."
      },
      {
        "type": "history",
        "prompt": "Who was the first player to rush for 2,000 yards in an NFL season?",
        "choices": [
          "O.J. Simpson",
          "Eric Dickerson",
          "Barry Sanders",
          "Terrell Davis"
        ],
        "answer": "O.J. Simpson",
        "statSheet": "The first 2,000-yard season came in a 14-game schedule."
      },
      {
        "type": "awards",
        "prompt": "Which defender won both AP Defensive Rookie of the Year and AP Defensive Player of the Year as a rookie?",
        "choices": [
          "Lawrence Taylor",
          "Von Miller",
          "Ndamukong Suh",
          "Patrick Willis"
        ],
        "answer": "Lawrence Taylor",
        "statSheet": "The answer was the No. 2 overall pick in his draft."
      },
      {
        "type": "mvp-comparison",
        "prompt": "Which MVP running back did NOT lead the NFL in rushing yards during his MVP season?",
        "choices": [
          "Marshall Faulk 2000",
          "Shaun Alexander 2005",
          "LaDainian Tomlinson 2006",
          "Adrian Peterson 2012"
        ],
        "answer": "Marshall Faulk 2000",
        "statSheet": "The answer scored 26 total touchdowns while powering one of the era's defining offenses."
      },
      {
        "type": "mvp-comparison",
        "prompt": "Which iconic MVP season featured the fewest touchdown passes?",
        "choices": [
          "Tom Brady 2007",
          "Aaron Rodgers 2011",
          "Peyton Manning 2013",
          "Patrick Mahomes 2018"
        ],
        "answer": "Aaron Rodgers 2011",
        "statSheet": null
      }
    ],
    [
      {
        "type": "records",
        "prompt": "Who is the NFL's all-time career rushing leader?",
        "choices": [
          "Emmitt Smith",
          "Walter Payton",
          "Barry Sanders",
          "Frank Gore"
        ],
        "answer": "Emmitt Smith",
        "statSheet": "The record holder finished with more than 18,000 rushing yards."
      },
      {
        "type": "super-bowl-moment",
        "prompt": "Who made the famous \"Helmet Catch\" in Super Bowl XLII?",
        "choices": [
          "David Tyree",
          "Plaxico Burress",
          "Mario Manningham",
          "Amani Toomer"
        ],
        "answer": "David Tyree",
        "statSheet": "The catch came on the Giants' final touchdown drive against New England."
      },
      {
        "type": "awards",
        "prompt": "Who won AP Offensive Rookie of the Year in 1998?",
        "choices": [
          "Randy Moss",
          "Peyton Manning",
          "Fred Taylor",
          "Robert Edwards"
        ],
        "answer": "Randy Moss",
        "statSheet": "The winner led the NFL with 17 receiving touchdowns."
      },
      {
        "type": "championship",
        "prompt": "Which team did Drew Brees and the Saints defeat in Super Bowl XLIV?",
        "choices": [
          "Colts",
          "Vikings",
          "Bears",
          "Chargers"
        ],
        "answer": "Colts",
        "statSheet": "New Orleans sealed the game with a late pick-six."
      },
      {
        "type": "awards-history",
        "prompt": "Which quarterback won three consecutive AP NFL MVP awards?",
        "choices": [
          "Brett Favre",
          "Peyton Manning",
          "Aaron Rodgers",
          "Tom Brady"
        ],
        "answer": "Brett Favre",
        "statSheet": "All three awards came while he was quarterbacking Green Bay."
      },
      {
        "type": "defensive-awards",
        "prompt": "Which of these defenders never won AP Defensive Player of the Year?",
        "choices": [
          "Von Miller",
          "Khalil Mack",
          "Aaron Donald",
          "J.J. Watt"
        ],
        "answer": "Von Miller",
        "statSheet": "Three choices won the award at least once during the 2010s."
      },
      {
        "type": "receiving-history",
        "prompt": "Which Hall of Fame receiver never led the NFL in receiving yards in a season?",
        "choices": [
          "Terrell Owens",
          "Randy Moss",
          "Marvin Harrison",
          "Calvin Johnson"
        ],
        "answer": "Terrell Owens",
        "statSheet": "The answer still retired with more than 15,000 receiving yards and 150 receiving touchdowns."
      },
      {
        "type": "mvp-season-comparison",
        "prompt": "Which of these MVP seasons produced the highest passer rating?",
        "choices": [
          "Aaron Rodgers 2011",
          "Peyton Manning 2004",
          "Tom Brady 2007",
          "Steve Young 1994"
        ],
        "answer": "Aaron Rodgers 2011",
        "statSheet": null
      }
    ],
    [
      {
        "type": "team-history",
        "prompt": "Which franchise did Tom Brady play his first 20 NFL seasons for?",
        "choices": [
          "Patriots",
          "Buccaneers",
          "49ers",
          "Colts"
        ],
        "answer": "Patriots",
        "statSheet": "He was drafted by the franchise in the sixth round in 2000."
      },
      {
        "type": "team-era",
        "prompt": "Who quarterbacked the 1999 \"Greatest Show on Turf\" Rams?",
        "choices": [
          "Kurt Warner",
          "Trent Green",
          "Marc Bulger",
          "Steve McNair"
        ],
        "answer": "Kurt Warner",
        "statSheet": "The quarterback also won league MVP that season."
      },
      {
        "type": "awards",
        "prompt": "Who won AP NFL MVP in 2012?",
        "choices": [
          "Adrian Peterson",
          "Peyton Manning",
          "Aaron Rodgers",
          "Tom Brady"
        ],
        "answer": "Adrian Peterson",
        "statSheet": "The winner came within nine yards of the single-season rushing record."
      },
      {
        "type": "draft",
        "prompt": "Which of these No. 1 overall picks was NOT a quarterback?",
        "choices": [
          "Mario Williams",
          "Cam Newton",
          "Sam Bradford",
          "Andrew Luck"
        ],
        "answer": "Mario Williams",
        "statSheet": "The non-quarterback was selected first overall by Houston."
      },
      {
        "type": "playoff-history",
        "prompt": "Which franchise became the first wild-card team to win the Super Bowl?",
        "choices": [
          "Raiders",
          "Steelers",
          "Packers",
          "Giants"
        ],
        "answer": "Raiders",
        "statSheet": "The championship came in Super Bowl XV."
      },
      {
        "type": "awards",
        "prompt": "Which legendary quarterback never won AP NFL MVP?",
        "choices": [
          "Drew Brees",
          "Tom Brady",
          "Peyton Manning",
          "Aaron Rodgers"
        ],
        "answer": "Drew Brees",
        "statSheet": "The answer did win Super Bowl MVP."
      },
      {
        "type": "mvp-comparison",
        "prompt": "Which MVP quarterback did NOT lead the NFL in passing touchdowns during his MVP season?",
        "choices": [
          "Cam Newton 2015",
          "Peyton Manning 2013",
          "Tom Brady 2007",
          "Patrick Mahomes 2018"
        ],
        "answer": "Cam Newton 2015",
        "statSheet": "The answer also scored 10 rushing touchdowns that season."
      },
      {
        "type": "super-bowl-history",
        "prompt": "Who was the first quarterback to start a Super Bowl for two different franchises?",
        "choices": [
          "Craig Morton",
          "Kurt Warner",
          "Peyton Manning",
          "Tom Brady"
        ],
        "answer": "Craig Morton",
        "statSheet": null
      }
    ],
    [
      {
        "type": "draft",
        "prompt": "Which team drafted Jerry Rice in 1985?",
        "choices": [
          "49ers",
          "Raiders",
          "Cowboys",
          "Bengals"
        ],
        "answer": "49ers",
        "statSheet": "San Francisco traded up in the first round to get him."
      },
      {
        "type": "team-history",
        "prompt": "Which franchise appeared in four consecutive Super Bowls in the early 1990s?",
        "choices": [
          "Bills",
          "Cowboys",
          "49ers",
          "Broncos"
        ],
        "answer": "Bills",
        "statSheet": "The answer lost all four of those Super Bowl appearances."
      },
      {
        "type": "rookie-awards",
        "prompt": "Who won AP Offensive Rookie of the Year in 2004?",
        "choices": [
          "Ben Roethlisberger",
          "Eli Manning",
          "Philip Rivers",
          "Larry Fitzgerald"
        ],
        "answer": "Ben Roethlisberger",
        "statSheet": "The winner went 13-0 as a rookie starter."
      },
      {
        "type": "career-history",
        "prompt": "Which team did Randy Moss play for immediately before joining New England?",
        "choices": [
          "Raiders",
          "Vikings",
          "Titans",
          "49ers"
        ],
        "answer": "Raiders",
        "statSheet": "His stop there lasted two seasons."
      },
      {
        "type": "records",
        "prompt": "Who holds the NFL single-season receiving-yards record?",
        "choices": [
          "Calvin Johnson",
          "Cooper Kupp",
          "Julio Jones",
          "Jerry Rice"
        ],
        "answer": "Calvin Johnson",
        "statSheet": "The record season included only five receiving touchdowns."
      },
      {
        "type": "awards",
        "prompt": "Which kicker won AP NFL MVP?",
        "choices": [
          "Mark Moseley",
          "Adam Vinatieri",
          "Jan Stenerud",
          "Gary Anderson"
        ],
        "answer": "Mark Moseley",
        "statSheet": "The award came in a strike-shortened season."
      },
      {
        "type": "awards-history",
        "prompt": "Who became the first defensive player to win NFL MVP?",
        "choices": [
          "Alan Page",
          "Lawrence Taylor",
          "Joe Greene",
          "Dick Butkus"
        ],
        "answer": "Alan Page",
        "statSheet": "The historic MVP season came in 1971."
      },
      {
        "type": "draft-history",
        "prompt": "Which quarterback was the SIXTH quarterback selected in the 1983 NFL Draft?",
        "choices": [
          "Dan Marino",
          "Jim Kelly",
          "Ken O'Brien",
          "Tony Eason"
        ],
        "answer": "Dan Marino",
        "statSheet": null
      }
    ],
    [
      {
        "type": "draft",
        "prompt": "Who was selected No. 1 overall in the 2011 NFL Draft?",
        "choices": [
          "Cam Newton",
          "Von Miller",
          "A.J. Green",
          "Julio Jones"
        ],
        "answer": "Cam Newton",
        "statSheet": "Carolina owned the first pick."
      },
      {
        "type": "playoff-moment",
        "prompt": "Who caught the \"Minneapolis Miracle\" touchdown?",
        "choices": [
          "Stefon Diggs",
          "Adam Thielen",
          "Kyle Rudolph",
          "Jarius Wright"
        ],
        "answer": "Stefon Diggs",
        "statSheet": "The play eliminated New Orleans on the final snap."
      },
      {
        "type": "career-history",
        "prompt": "Which team did Brett Favre first play for in the NFL?",
        "choices": [
          "Falcons",
          "Packers",
          "Jets",
          "Vikings"
        ],
        "answer": "Falcons",
        "statSheet": "He was traded after his rookie season."
      },
      {
        "type": "mvp-season",
        "prompt": "Which quarterback led a 15-1 team while winning AP MVP in 2011?",
        "choices": [
          "Aaron Rodgers",
          "Drew Brees",
          "Tom Brady",
          "Eli Manning"
        ],
        "answer": "Aaron Rodgers",
        "statSheet": "His team earned the NFC's No. 1 seed."
      },
      {
        "type": "records",
        "prompt": "Who owns the NFL single-season rushing record of 2,105 yards?",
        "choices": [
          "Eric Dickerson",
          "Adrian Peterson",
          "Barry Sanders",
          "Derrick Henry"
        ],
        "answer": "Eric Dickerson",
        "statSheet": "The record was set in 1984."
      },
      {
        "type": "records",
        "prompt": "Who became the first quarterback to throw 50 touchdown passes in one season?",
        "choices": [
          "Tom Brady",
          "Peyton Manning",
          "Dan Marino",
          "Patrick Mahomes"
        ],
        "answer": "Tom Brady",
        "statSheet": "It happened during an undefeated regular season."
      },
      {
        "type": "rushing-comparison",
        "prompt": "Which 2,000-yard rusher had the fewest rushing touchdowns in his 2,000-yard season?",
        "choices": [
          "Barry Sanders 1997",
          "O.J. Simpson 1973",
          "Eric Dickerson 1984",
          "Derrick Henry 2020"
        ],
        "answer": "Barry Sanders 1997",
        "statSheet": "The answer shared AP NFL MVP honors that season."
      },
      {
        "type": "mvp-statistical-comparison",
        "prompt": "Which quarterback led the NFL in both passing yards and passing touchdowns in the same season but did NOT win AP NFL MVP?",
        "choices": [
          "Drew Brees 2011",
          "Dan Marino 1984",
          "Peyton Manning 2013",
          "Patrick Mahomes 2018"
        ],
        "answer": "Drew Brees 2011",
        "statSheet": null
      }
    ],
    [
      {
        "type": "draft",
        "prompt": "Which franchise drafted Patrick Mahomes?",
        "choices": [
          "Chiefs",
          "Bears",
          "Texans",
          "Saints"
        ],
        "answer": "Chiefs",
        "statSheet": "Kansas City traded up to the 10th overall pick."
      },
      {
        "type": "playoff-moment",
        "prompt": "Who scored the \"Music City Miracle\" touchdown for Tennessee?",
        "choices": [
          "Kevin Dyson",
          "Frank Wycheck",
          "Derrick Mason",
          "Steve McNair"
        ],
        "answer": "Kevin Dyson",
        "statSheet": "The touchdown came on a kickoff return."
      },
      {
        "type": "championship",
        "prompt": "Which team did the 2000 Ravens defeat in Super Bowl XXXV?",
        "choices": [
          "Giants",
          "Rams",
          "Raiders",
          "Eagles"
        ],
        "answer": "Giants",
        "statSheet": "Baltimore's defense allowed no offensive touchdowns."
      },
      {
        "type": "super-bowl",
        "prompt": "Who was MVP of Super Bowl XLVII?",
        "choices": [
          "Joe Flacco",
          "Ray Lewis",
          "Anquan Boldin",
          "Colin Kaepernick"
        ],
        "answer": "Joe Flacco",
        "statSheet": "Baltimore defeated San Francisco."
      },
      {
        "type": "dynasty-history",
        "prompt": "Which franchise was the first to win three Super Bowls in a four-season span?",
        "choices": [
          "Cowboys",
          "Patriots",
          "Steelers",
          "49ers"
        ],
        "answer": "Cowboys",
        "statSheet": "The three titles came during the 1990s."
      },
      {
        "type": "defensive-awards",
        "prompt": "Which defender won AP Defensive Player of the Year three times?",
        "choices": [
          "Aaron Donald",
          "Ray Lewis",
          "Reggie White",
          "Deion Sanders"
        ],
        "answer": "Aaron Donald",
        "statSheet": "The three awards came within a four-season span."
      },
      {
        "type": "awards-championship",
        "prompt": "Which player won AP Defensive Player of the Year and Super Bowl MVP in the same season?",
        "choices": [
          "Ray Lewis 2000",
          "Lawrence Taylor 1986",
          "Von Miller 2015",
          "Aaron Donald 2021"
        ],
        "answer": "Ray Lewis 2000",
        "statSheet": "The answer anchored a defense that allowed just 165 points in the regular season."
      },
      {
        "type": "championship-comparison",
        "prompt": "Which of these Super Bowl champions won the fewest regular-season games?",
        "choices": [
          "2005 Steelers",
          "2007 Giants",
          "2010 Packers",
          "2011 Giants"
        ],
        "answer": "2011 Giants",
        "statSheet": null
      }
    ],
    [
      {
        "type": "team-recognition",
        "prompt": "Which team was Marshawn Lynch playing for during the \"Beast Quake\" run?",
        "choices": [
          "Seahawks",
          "Bills",
          "Raiders",
          "Packers"
        ],
        "answer": "Seahawks",
        "statSheet": "The run came in a home playoff game against New Orleans."
      },
      {
        "type": "career-history",
        "prompt": "Which quarterback retired after winning Super Bowl 50?",
        "choices": [
          "Peyton Manning",
          "Tom Brady",
          "Drew Brees",
          "Ben Roethlisberger"
        ],
        "answer": "Peyton Manning",
        "statSheet": "The championship was his second with a different franchise."
      },
      {
        "type": "super-bowl-moment",
        "prompt": "Who caught Pittsburgh's game-winning touchdown in Super Bowl XLIII?",
        "choices": [
          "Santonio Holmes",
          "Hines Ward",
          "Mike Wallace",
          "Heath Miller"
        ],
        "answer": "Santonio Holmes",
        "statSheet": "The catch came in the corner of the end zone with under a minute left."
      },
      {
        "type": "super-bowl",
        "prompt": "Which wide receiver won MVP of Super Bowl LVI?",
        "choices": [
          "Cooper Kupp",
          "Odell Beckham Jr.",
          "Ja'Marr Chase",
          "Tee Higgins"
        ],
        "answer": "Cooper Kupp",
        "statSheet": "The winner caught the game-winning touchdown."
      },
      {
        "type": "championship-history",
        "prompt": "Which franchise won the first overtime game in Super Bowl history?",
        "choices": [
          "Patriots",
          "Falcons",
          "Chiefs",
          "Rams"
        ],
        "answer": "Patriots",
        "statSheet": "The game required a 25-point comeback."
      },
      {
        "type": "awards-championship",
        "prompt": "Which AP Defensive Player of the Year also won Super Bowl MVP?",
        "choices": [
          "Ray Lewis",
          "Khalil Mack",
          "J.J. Watt",
          "Ed Reed"
        ],
        "answer": "Ray Lewis",
        "statSheet": "His Super Bowl MVP came during the 2000 season."
      },
      {
        "type": "draft-awards",
        "prompt": "Which AP Defensive Player of the Year was NOT a first-round draft pick?",
        "choices": [
          "Jason Taylor",
          "Ray Lewis",
          "Aaron Donald",
          "J.J. Watt"
        ],
        "answer": "Jason Taylor",
        "statSheet": "The answer entered the NFL from Akron and developed into a Hall of Fame pass rusher."
      },
      {
        "type": "mvp-postseason",
        "prompt": "Which MVP quarterback's team had to play on Wild Card Weekend during his MVP season?",
        "choices": [
          "Peyton Manning 2008",
          "Tom Brady 2010",
          "Aaron Rodgers 2011",
          "Cam Newton 2015"
        ],
        "answer": "Peyton Manning 2008",
        "statSheet": null
      }
    ],
    [
      {
        "type": "draft",
        "prompt": "Which franchise drafted Aaron Donald?",
        "choices": [
          "Rams",
          "Steelers",
          "Bengals",
          "Giants"
        ],
        "answer": "Rams",
        "statSheet": "He was selected in the first round in 2014."
      },
      {
        "type": "historic-play",
        "prompt": "Who made the \"Immaculate Reception\"?",
        "choices": [
          "Franco Harris",
          "Lynn Swann",
          "John Stallworth",
          "Rocky Bleier"
        ],
        "answer": "Franco Harris",
        "statSheet": "The play came in a playoff game against Oakland."
      },
      {
        "type": "super-bowl",
        "prompt": "Which quarterback led the Giants past the undefeated Patriots in Super Bowl XLII?",
        "choices": [
          "Eli Manning",
          "Philip Rivers",
          "Ben Roethlisberger",
          "Tony Romo"
        ],
        "answer": "Eli Manning",
        "statSheet": "The winning touchdown came in the final minute."
      },
      {
        "type": "draft-comparison",
        "prompt": "Which of these defenders was selected No. 1 overall?",
        "choices": [
          "Myles Garrett",
          "Khalil Mack",
          "Aaron Donald",
          "J.J. Watt"
        ],
        "answer": "Myles Garrett",
        "statSheet": "Cleveland owned the first pick in his draft."
      },
      {
        "type": "mvp-season",
        "prompt": "Which running back rushed for 2,053 yards while sharing AP MVP honors in 1997?",
        "choices": [
          "Barry Sanders",
          "Terrell Davis",
          "Emmitt Smith",
          "Curtis Martin"
        ],
        "answer": "Barry Sanders",
        "statSheet": "The award was shared with a quarterback."
      },
      {
        "type": "awards",
        "prompt": "Which receiver never won AP Offensive Player of the Year?",
        "choices": [
          "Randy Moss",
          "Jerry Rice",
          "Cooper Kupp",
          "Michael Thomas"
        ],
        "answer": "Randy Moss",
        "statSheet": "The answer did win AP Offensive Rookie of the Year."
      },
      {
        "type": "defensive-awards",
        "prompt": "Which defender won AP Defensive Player of the Year in just his second NFL season?",
        "choices": [
          "J.J. Watt",
          "Aaron Donald",
          "Khalil Mack",
          "Nick Bosa"
        ],
        "answer": "J.J. Watt",
        "statSheet": "The answer recorded 20.5 sacks that season."
      },
      {
        "type": "mvp-super-bowl",
        "prompt": "Which MVP quarterback later lost that season's Super Bowl to his former head coach?",
        "choices": [
          "Rich Gannon",
          "Kurt Warner",
          "Cam Newton",
          "Matt Ryan"
        ],
        "answer": "Rich Gannon",
        "statSheet": null
      }
    ],
    [
      {
        "type": "draft",
        "prompt": "Which team selected Joe Burrow No. 1 overall?",
        "choices": [
          "Bengals",
          "Dolphins",
          "Chargers",
          "Panthers"
        ],
        "answer": "Bengals",
        "statSheet": "Cincinnati held the first pick in 2020."
      },
      {
        "type": "super-bowl",
        "prompt": "Who was MVP of Super Bowl XXXV for Baltimore?",
        "choices": [
          "Ray Lewis",
          "Jamal Lewis",
          "Trent Dilfer",
          "Rod Woodson"
        ],
        "answer": "Ray Lewis",
        "statSheet": "Baltimore's defense dominated the Giants."
      },
      {
        "type": "awards",
        "prompt": "Who won AP Defensive Rookie of the Year in 2007?",
        "choices": [
          "Patrick Willis",
          "Darrelle Revis",
          "Jon Beason",
          "LaMarr Woodley"
        ],
        "answer": "Patrick Willis",
        "statSheet": "The winner was a first-round linebacker for San Francisco."
      },
      {
        "type": "draft-chronology",
        "prompt": "Which quarterback was selected first overall earliest?",
        "choices": [
          "Michael Vick",
          "Eli Manning",
          "Alex Smith",
          "Matthew Stafford"
        ],
        "answer": "Michael Vick",
        "statSheet": "The answer began his NFL career in Atlanta."
      },
      {
        "type": "draft-history",
        "prompt": "Which quarterback was drafted No. 1 overall by the Baltimore Colts but never played for them?",
        "choices": [
          "John Elway",
          "Dan Marino",
          "Jim Kelly",
          "Bernie Kosar"
        ],
        "answer": "John Elway",
        "statSheet": "He was traded to Denver before his rookie season."
      },
      {
        "type": "mvp-history",
        "prompt": "Who is the most recent defensive player to win AP NFL MVP?",
        "choices": [
          "Lawrence Taylor",
          "Reggie White",
          "Ray Lewis",
          "J.J. Watt"
        ],
        "answer": "Lawrence Taylor",
        "statSheet": "The MVP season came in 1986."
      },
      {
        "type": "mvp-postseason",
        "prompt": "Which multiple-time AP MVP quarterback has made exactly one Super Bowl start?",
        "choices": [
          "Aaron Rodgers",
          "Peyton Manning",
          "Tom Brady",
          "Joe Montana"
        ],
        "answer": "Aaron Rodgers",
        "statSheet": "His lone Super Bowl appearance came during a postseason run that began as the NFC's No. 6 seed."
      },
      {
        "type": "season-comparison",
        "prompt": "Which signature receiving season produced the FEWEST receiving yards?",
        "choices": [
          "Randy Moss 2007",
          "Jerry Rice 1995",
          "Calvin Johnson 2012",
          "Cooper Kupp 2021"
        ],
        "answer": "Randy Moss 2007",
        "statSheet": null
      }
    ]
  ],
  "ufc": [
    [
      {
        "type": "title-moment",
        "prompt": "Who knocked out Jose Aldo in 13 seconds to win the UFC featherweight title?",
        "choices": [
          "Conor McGregor",
          "Max Holloway",
          "Alexander Volkanovski",
          "Chad Mendes"
        ],
        "answer": "Conor McGregor",
        "statSheet": "The finish came in the opening exchange of the UFC 194 main event."
      },
      {
        "type": "title-change",
        "prompt": "Who handed Ronda Rousey her first professional loss?",
        "choices": [
          "Holly Holm",
          "Miesha Tate",
          "Amanda Nunes",
          "Cat Zingano"
        ],
        "answer": "Holly Holm",
        "statSheet": "The upset ended Rousey's unbeaten run and UFC bantamweight title reign."
      },
      {
        "type": "title-fight",
        "prompt": "Who did Charles Oliveira defeat to win the vacant UFC lightweight championship?",
        "choices": [
          "Michael Chandler",
          "Dustin Poirier",
          "Justin Gaethje",
          "Tony Ferguson"
        ],
        "answer": "Michael Chandler",
        "statSheet": "The vacant title was decided in the UFC 262 main event."
      },
      {
        "type": "title-history",
        "prompt": "Who did Georges St-Pierre defeat to win his first UFC welterweight championship?",
        "choices": [
          "Matt Hughes",
          "Matt Serra",
          "B.J. Penn",
          "Josh Koscheck"
        ],
        "answer": "Matt Hughes",
        "statSheet": "The title win came in their rematch at UFC 65."
      },
      {
        "type": "reign-change",
        "prompt": "Who ended Demetrious Johnson's UFC flyweight title reign?",
        "choices": [
          "Henry Cejudo",
          "Joseph Benavidez",
          "Deiveson Figueiredo",
          "Brandon Moreno"
        ],
        "answer": "Henry Cejudo",
        "statSheet": "The title changed hands by split decision in their second meeting."
      },
      {
        "type": "title-change",
        "prompt": "Who took the UFC bantamweight title from Dominick Cruz in 2016?",
        "choices": [
          "Cody Garbrandt",
          "T.J. Dillashaw",
          "Renan Barao",
          "Urijah Faber"
        ],
        "answer": "Cody Garbrandt",
        "statSheet": "The challenger won a five-round decision at UFC 207."
      },
      {
        "type": "title-lineage",
        "prompt": "Who became UFC welterweight champion after B.J. Penn vacated the title in 2004?",
        "choices": [
          "Matt Hughes",
          "Georges St-Pierre",
          "Matt Serra",
          "Sean Sherk"
        ],
        "answer": "Matt Hughes",
        "statSheet": "He won the vacant championship by submitting Georges St-Pierre at UFC 50."
      },
      {
        "type": "chronology",
        "prompt": "Which of these title fights happened earliest?",
        "choices": [
          "Holly Holm vs. Ronda Rousey",
          "Conor McGregor vs. Jose Aldo",
          "Luke Rockhold vs. Chris Weidman",
          "Dominick Cruz vs. T.J. Dillashaw"
        ],
        "answer": "Holly Holm vs. Ronda Rousey",
        "statSheet": null
      }
    ],
    [
      {
        "type": "fighter-identity",
        "prompt": "Who is nicknamed \"The Notorious\"?",
        "choices": [
          "Conor McGregor",
          "Dustin Poirier",
          "Justin Gaethje",
          "Michael Chandler"
        ],
        "answer": "Conor McGregor",
        "statSheet": "He won UFC championships at featherweight and lightweight."
      },
      {
        "type": "title-change",
        "prompt": "Who handed Anderson Silva his first UFC loss?",
        "choices": [
          "Chael Sonnen",
          "Vitor Belfort",
          "Chris Weidman",
          "Michael Bisping"
        ],
        "answer": "Chris Weidman",
        "statSheet": "The winner was an undefeated American wrestler entering their first fight."
      },
      {
        "type": "title-history",
        "prompt": "Who won the inaugural UFC flyweight championship?",
        "choices": [
          "Henry Cejudo",
          "Demetrious Johnson",
          "Joseph Benavidez",
          "Deiveson Figueiredo"
        ],
        "answer": "Demetrious Johnson",
        "statSheet": "He later became synonymous with the 125-pound division."
      },
      {
        "type": "event-context",
        "prompt": "UFC 205 at Madison Square Garden ended with Conor McGregor taking the lightweight belt from whom?",
        "choices": [
          "Rafael dos Anjos",
          "Eddie Alvarez",
          "Anthony Pettis",
          "Benson Henderson"
        ],
        "answer": "Eddie Alvarez",
        "statSheet": "It was the UFC's first event in New York City."
      },
      {
        "type": "reign-change",
        "prompt": "Who dethroned Max Holloway to begin a lengthy UFC featherweight title reign?",
        "choices": [
          "Jose Aldo",
          "Brian Ortega",
          "Alexander Volkanovski",
          "Ilia Topuria"
        ],
        "answer": "Alexander Volkanovski",
        "statSheet": "The Australian had previously defeated Jose Aldo."
      },
      {
        "type": "upset",
        "prompt": "Which UFC champion lost his belt to Matt Serra?",
        "choices": [
          "Matt Hughes",
          "B.J. Penn",
          "Georges St-Pierre",
          "Robbie Lawler"
        ],
        "answer": "Georges St-Pierre",
        "statSheet": "Serra earned the title shot through The Ultimate Fighter 4."
      },
      {
        "type": "title-lineage",
        "prompt": "Which lightweight champion directly preceded Anthony Pettis?",
        "choices": [
          "Frankie Edgar",
          "Benson Henderson",
          "Rafael dos Anjos",
          "Gilbert Melendez"
        ],
        "answer": "Benson Henderson",
        "statSheet": "Pettis had also beaten him in the WEC."
      },
      {
        "type": "event-history",
        "prompt": "At which event did three UFC championships change hands in three title fights?",
        "choices": [
          "UFC 205",
          "UFC 217",
          "UFC 261",
          "UFC 281"
        ],
        "answer": "UFC 217",
        "statSheet": null
      }
    ],
    [
      {
        "type": "championship-history",
        "prompt": "Who became the first fighter to hold two UFC titles simultaneously?",
        "choices": [
          "Conor McGregor",
          "Daniel Cormier",
          "Amanda Nunes",
          "Henry Cejudo"
        ],
        "answer": "Conor McGregor",
        "statSheet": "He added the lightweight championship while already holding the featherweight belt."
      },
      {
        "type": "event-history",
        "prompt": "Who did Brock Lesnar defeat in the UFC 100 main event?",
        "choices": [
          "Frank Mir",
          "Randy Couture",
          "Shane Carwin",
          "Cain Velasquez"
        ],
        "answer": "Frank Mir",
        "statSheet": "The bout unified the heavyweight championship after Mir held the interim belt."
      },
      {
        "type": "title-change",
        "prompt": "Who did Jon Jones defeat to become the youngest champion in UFC history?",
        "choices": [
          "Mauricio Rua",
          "Quinton Jackson",
          "Lyoto Machida",
          "Rashad Evans"
        ],
        "answer": "Mauricio Rua",
        "statSheet": "Jones won the light heavyweight title at age 23."
      },
      {
        "type": "title-change",
        "prompt": "Who did Amanda Nunes defeat to win the women's bantamweight title at UFC 200?",
        "choices": [
          "Miesha Tate",
          "Ronda Rousey",
          "Valentina Shevchenko",
          "Holly Holm"
        ],
        "answer": "Miesha Tate",
        "statSheet": "Nunes submitted the champion in the first round."
      },
      {
        "type": "championships",
        "prompt": "Which fighter became the first woman to hold UFC titles in two divisions simultaneously?",
        "choices": [
          "Amanda Nunes",
          "Valentina Shevchenko",
          "Cris Cyborg",
          "Holly Holm"
        ],
        "answer": "Amanda Nunes",
        "statSheet": "She added the featherweight belt while reigning as bantamweight champion."
      },
      {
        "type": "famous-fight",
        "prompt": "Who submitted Conor McGregor at UFC 196?",
        "choices": [
          "Nate Diaz",
          "Dustin Poirier",
          "Khabib Nurmagomedov",
          "Chad Mendes"
        ],
        "answer": "Nate Diaz",
        "statSheet": "The fight was contested at welterweight after Diaz accepted it on short notice."
      },
      {
        "type": "title-history",
        "prompt": "Which champion won the UFC middleweight title from Rich Franklin in 2006?",
        "choices": [
          "Anderson Silva",
          "Dan Henderson",
          "Vitor Belfort",
          "Chris Leben"
        ],
        "answer": "Anderson Silva",
        "statSheet": "The title win came at UFC 64."
      },
      {
        "type": "defense-comparison",
        "prompt": "Which champion recorded the most consecutive UFC title defenses among these four?",
        "choices": [
          "Georges St-Pierre",
          "Anderson Silva",
          "Demetrious Johnson",
          "Jon Jones"
        ],
        "answer": "Demetrious Johnson",
        "statSheet": null
      }
    ],
    [
      {
        "type": "fighter-identity",
        "prompt": "Which fighter is known as \"Thug Rose\"?",
        "choices": [
          "Rose Namajunas",
          "Joanna Jedrzejczyk",
          "Carla Esparza",
          "Jessica Andrade"
        ],
        "answer": "Rose Namajunas",
        "statSheet": "She is a two-time UFC strawweight champion."
      },
      {
        "type": "title-change",
        "prompt": "Who did Rose Namajunas defeat at UFC 217 to win the strawweight title?",
        "choices": [
          "Joanna Jedrzejczyk",
          "Jessica Andrade",
          "Zhang Weili",
          "Carla Esparza"
        ],
        "answer": "Joanna Jedrzejczyk",
        "statSheet": "The upset ended one of the longest title reigns in the division's history."
      },
      {
        "type": "championship-history",
        "prompt": "Who was the first fighter to win UFC championships in two weight classes?",
        "choices": [
          "Randy Couture",
          "B.J. Penn",
          "Conor McGregor",
          "Dan Henderson"
        ],
        "answer": "Randy Couture",
        "statSheet": "He won UFC titles at heavyweight and light heavyweight."
      },
      {
        "type": "retirement-fight",
        "prompt": "Who did Khabib Nurmagomedov defeat in his final professional fight?",
        "choices": [
          "Justin Gaethje",
          "Dustin Poirier",
          "Conor McGregor",
          "Al Iaquinta"
        ],
        "answer": "Justin Gaethje",
        "statSheet": "Khabib retired after unifying the lightweight title at UFC 254."
      },
      {
        "type": "title-change",
        "prompt": "Who did Max Holloway defeat to become undisputed UFC featherweight champion?",
        "choices": [
          "Jose Aldo",
          "Anthony Pettis",
          "Brian Ortega",
          "Frankie Edgar"
        ],
        "answer": "Jose Aldo",
        "statSheet": "Holloway stopped the longtime champion at UFC 212."
      },
      {
        "type": "title-history",
        "prompt": "Who took the UFC lightweight title from B.J. Penn at UFC 112?",
        "choices": [
          "Frankie Edgar",
          "Gray Maynard",
          "Benson Henderson",
          "Sean Sherk"
        ],
        "answer": "Frankie Edgar",
        "statSheet": "The title changed hands by decision in Abu Dhabi."
      },
      {
        "type": "short-notice-title",
        "prompt": "Who did Michael Bisping knock out on short notice to win the UFC middleweight title?",
        "choices": [
          "Luke Rockhold",
          "Chris Weidman",
          "Anderson Silva",
          "Dan Henderson"
        ],
        "answer": "Luke Rockhold",
        "statSheet": "Bisping accepted the UFC 199 title fight on short notice."
      },
      {
        "type": "chronology",
        "prompt": "Which of these UFC title changes happened latest?",
        "choices": [
          "Namajunas over Jedrzejczyk",
          "Bisping over Rockhold",
          "Holloway over Aldo",
          "Khabib over Iaquinta"
        ],
        "answer": "Khabib over Iaquinta",
        "statSheet": null
      }
    ],
    [
      {
        "type": "fighter-identity",
        "prompt": "Which UFC star is known by the nickname \"Bones\"?",
        "choices": [
          "Jon Jones",
          "Daniel Cormier",
          "Chuck Liddell",
          "Tito Ortiz"
        ],
        "answer": "Jon Jones",
        "statSheet": "He became the youngest champion in UFC history."
      },
      {
        "type": "title-change",
        "prompt": "Who did Jon Jones defeat to win the light heavyweight championship for the first time?",
        "choices": [
          "Mauricio Rua",
          "Lyoto Machida",
          "Quinton Jackson",
          "Rashad Evans"
        ],
        "answer": "Mauricio Rua",
        "statSheet": "Jones captured the belt at UFC 128."
      },
      {
        "type": "title-history",
        "prompt": "Who became the inaugural UFC women's featherweight champion?",
        "choices": [
          "Germaine de Randamie",
          "Cris Cyborg",
          "Amanda Nunes",
          "Holly Holm"
        ],
        "answer": "Germaine de Randamie",
        "statSheet": "She won the inaugural title at UFC 208."
      },
      {
        "type": "title-change",
        "prompt": "Who did Joanna Jedrzejczyk defeat to win the UFC strawweight title?",
        "choices": [
          "Carla Esparza",
          "Rose Namajunas",
          "Claudia Gadelha",
          "Jessica Andrade"
        ],
        "answer": "Carla Esparza",
        "statSheet": "Jedrzejczyk won the belt at UFC 185."
      },
      {
        "type": "title-change",
        "prompt": "Who did Anderson Silva defeat to win the UFC middleweight title?",
        "choices": [
          "Rich Franklin",
          "Chris Leben",
          "Nate Marquardt",
          "Dan Henderson"
        ],
        "answer": "Rich Franklin",
        "statSheet": "Silva captured the championship at UFC 64."
      },
      {
        "type": "comeback",
        "prompt": "Who did Dominick Cruz defeat in 2016 to regain the UFC bantamweight title?",
        "choices": [
          "T.J. Dillashaw",
          "Cody Garbrandt",
          "Urijah Faber",
          "Renan Barao"
        ],
        "answer": "T.J. Dillashaw",
        "statSheet": "Cruz returned from a long injury stretch and won by split decision."
      },
      {
        "type": "interim-title",
        "prompt": "Who won the interim UFC lightweight title at UFC 249?",
        "choices": [
          "Justin Gaethje",
          "Tony Ferguson",
          "Dustin Poirier",
          "Michael Chandler"
        ],
        "answer": "Justin Gaethje",
        "statSheet": "He stopped Tony Ferguson in the fifth round."
      },
      {
        "type": "title-lineage",
        "prompt": "Which sequence correctly traces the UFC bantamweight championship from Cruz through Garbrandt?",
        "choices": [
          "Cruz - Barao - Dillashaw - Cruz - Garbrandt",
          "Cruz - Dillashaw - Barao - Cruz - Garbrandt",
          "Barao - Cruz - Dillashaw - Garbrandt - Cruz",
          "Cruz - Barao - Garbrandt - Dillashaw - Cruz"
        ],
        "answer": "Cruz - Barao - Dillashaw - Cruz - Garbrandt",
        "statSheet": null
      }
    ],
    [
      {
        "type": "fighter-identity",
        "prompt": "Which fighter is known as \"Blessed\"?",
        "choices": [
          "Max Holloway",
          "Dustin Poirier",
          "Robert Whittaker",
          "Alexander Volkanovski"
        ],
        "answer": "Max Holloway",
        "statSheet": "He became UFC featherweight champion after a long winning streak."
      },
      {
        "type": "debut-history",
        "prompt": "Who did Conor McGregor defeat in his UFC debut?",
        "choices": [
          "Marcus Brimage",
          "Diego Brandao",
          "Dustin Poirier",
          "Max Holloway"
        ],
        "answer": "Marcus Brimage",
        "statSheet": "McGregor's UFC debut took place in Stockholm in 2013."
      },
      {
        "type": "event-history",
        "prompt": "In which city was UFC 1 held?",
        "choices": [
          "Denver",
          "Las Vegas",
          "Atlantic City",
          "New York"
        ],
        "answer": "Denver",
        "statSheet": "The inaugural event took place in Colorado in 1993."
      },
      {
        "type": "title-change",
        "prompt": "Who did Tyron Woodley knock out to win the UFC welterweight title?",
        "choices": [
          "Robbie Lawler",
          "Stephen Thompson",
          "Carlos Condit",
          "Johny Hendricks"
        ],
        "answer": "Robbie Lawler",
        "statSheet": "Woodley won the championship at UFC 201."
      },
      {
        "type": "title-change",
        "prompt": "Who did Stipe Miocic defeat in Brazil to win the UFC heavyweight title?",
        "choices": [
          "Fabricio Werdum",
          "Junior dos Santos",
          "Cain Velasquez",
          "Alistair Overeem"
        ],
        "answer": "Fabricio Werdum",
        "statSheet": "Miocic won the belt at UFC 198 in Curitiba."
      },
      {
        "type": "title-change",
        "prompt": "Who ended Rose Namajunas's first UFC strawweight title reign?",
        "choices": [
          "Jessica Andrade",
          "Joanna Jedrzejczyk",
          "Zhang Weili",
          "Carla Esparza"
        ],
        "answer": "Jessica Andrade",
        "statSheet": "Andrade won the title at UFC 237 in Brazil."
      },
      {
        "type": "division-history",
        "prompt": "Who was recognized as the inaugural UFC featherweight champion when the WEC division was absorbed?",
        "choices": [
          "Jose Aldo",
          "Urijah Faber",
          "Chad Mendes",
          "Mike Brown"
        ],
        "answer": "Jose Aldo",
        "statSheet": "Aldo entered the UFC as the reigning WEC featherweight champion."
      },
      {
        "type": "interim-title-history",
        "prompt": "Which of these fighters never won an interim UFC lightweight championship?",
        "choices": [
          "Dustin Poirier",
          "Justin Gaethje",
          "Tony Ferguson",
          "Michael Chandler"
        ],
        "answer": "Michael Chandler",
        "statSheet": null
      }
    ],
    [
      {
        "type": "fighter-identity",
        "prompt": "Which fighter is known as \"The Last Stylebender\"?",
        "choices": [
          "Israel Adesanya",
          "Robert Whittaker",
          "Alex Pereira",
          "Anderson Silva"
        ],
        "answer": "Israel Adesanya",
        "statSheet": "He became one of the defining UFC middleweights of his era."
      },
      {
        "type": "interim-title",
        "prompt": "Who did Israel Adesanya defeat to win the interim UFC middleweight title?",
        "choices": [
          "Kelvin Gastelum",
          "Robert Whittaker",
          "Yoel Romero",
          "Derek Brunson"
        ],
        "answer": "Kelvin Gastelum",
        "statSheet": "Their five-round fight took place at UFC 236."
      },
      {
        "type": "title-change",
        "prompt": "Who did Israel Adesanya defeat to become undisputed middleweight champion?",
        "choices": [
          "Robert Whittaker",
          "Paulo Costa",
          "Yoel Romero",
          "Marvin Vettori"
        ],
        "answer": "Robert Whittaker",
        "statSheet": "Adesanya unified the title at UFC 243 in Melbourne."
      },
      {
        "type": "title-change",
        "prompt": "Who took the UFC middleweight title from Israel Adesanya at UFC 281?",
        "choices": [
          "Alex Pereira",
          "Robert Whittaker",
          "Sean Strickland",
          "Jared Cannonier"
        ],
        "answer": "Alex Pereira",
        "statSheet": "Pereira stopped Adesanya in the fifth round."
      },
      {
        "type": "rematch-history",
        "prompt": "Who did Israel Adesanya knock out at UFC 287 to regain the middleweight title?",
        "choices": [
          "Alex Pereira",
          "Robert Whittaker",
          "Paulo Costa",
          "Kelvin Gastelum"
        ],
        "answer": "Alex Pereira",
        "statSheet": "The rematch reversed the result of their UFC 281 title fight."
      },
      {
        "type": "interim-title",
        "prompt": "Who did Robert Whittaker defeat for the interim UFC middleweight championship?",
        "choices": [
          "Yoel Romero",
          "Jacare Souza",
          "Derek Brunson",
          "Luke Rockhold"
        ],
        "answer": "Yoel Romero",
        "statSheet": "Whittaker won a five-round decision at UFC 213."
      },
      {
        "type": "division-history",
        "prompt": "Who was the first UFC middleweight champion?",
        "choices": [
          "Dave Menne",
          "Murilo Bustamante",
          "Rich Franklin",
          "Evan Tanner"
        ],
        "answer": "Dave Menne",
        "statSheet": "He won the inaugural middleweight title at UFC 33."
      },
      {
        "type": "title-lineage",
        "prompt": "Who held the UFC middleweight championship immediately before Rich Franklin?",
        "choices": [
          "Evan Tanner",
          "Vitor Belfort",
          "Murilo Bustamante",
          "Dave Menne"
        ],
        "answer": "Evan Tanner",
        "statSheet": null
      }
    ],
    [
      {
        "type": "fighter-identity",
        "prompt": "Georges St-Pierre represented which country?",
        "choices": [
          "Canada",
          "France",
          "United States",
          "Brazil"
        ],
        "answer": "Canada",
        "statSheet": "The longtime welterweight champion is from Quebec."
      },
      {
        "type": "title-change",
        "prompt": "Who did Georges St-Pierre defeat at UFC 65 to win his first welterweight title?",
        "choices": [
          "Matt Hughes",
          "Matt Serra",
          "B.J. Penn",
          "Josh Koscheck"
        ],
        "answer": "Matt Hughes",
        "statSheet": "It was their second meeting."
      },
      {
        "type": "upset",
        "prompt": "Who upset Georges St-Pierre at UFC 69?",
        "choices": [
          "Matt Serra",
          "Matt Hughes",
          "B.J. Penn",
          "Carlos Condit"
        ],
        "answer": "Matt Serra",
        "statSheet": "Serra entered as a major underdog after winning The Ultimate Fighter 4."
      },
      {
        "type": "title-change",
        "prompt": "Who did Georges St-Pierre defeat at UFC 83 to regain the welterweight championship?",
        "choices": [
          "Matt Serra",
          "Matt Hughes",
          "Jon Fitch",
          "Josh Koscheck"
        ],
        "answer": "Matt Serra",
        "statSheet": "The rematch took place in Montreal."
      },
      {
        "type": "title-reign",
        "prompt": "Who did Georges St-Pierre defeat in his final welterweight title defense before stepping away in 2013?",
        "choices": [
          "Johny Hendricks",
          "Nick Diaz",
          "Carlos Condit",
          "Jake Shields"
        ],
        "answer": "Johny Hendricks",
        "statSheet": "The close decision came at UFC 167."
      },
      {
        "type": "comeback",
        "prompt": "Who did Georges St-Pierre submit at UFC 217 to win the middleweight title?",
        "choices": [
          "Michael Bisping",
          "Luke Rockhold",
          "Robert Whittaker",
          "Chris Weidman"
        ],
        "answer": "Michael Bisping",
        "statSheet": "The win made St-Pierre a champion in a second division."
      },
      {
        "type": "championship-history",
        "prompt": "What did Georges St-Pierre do with the middleweight title after his UFC 217 victory?",
        "choices": [
          "Vacated it",
          "Defended it once",
          "Lost it to Whittaker",
          "Was stripped after a loss"
        ],
        "answer": "Vacated it",
        "statSheet": "He relinquished the title without making a defense."
      },
      {
        "type": "opponent-comparison",
        "prompt": "Which opponent did Georges St-Pierre NOT defeat twice in the UFC?",
        "choices": [
          "Matt Hughes",
          "B.J. Penn",
          "Josh Koscheck",
          "Matt Serra"
        ],
        "answer": "Matt Serra",
        "statSheet": null
      }
    ],
    [
      {
        "type": "fighter-identity",
        "prompt": "Which fighter is known as \"The Eagle\"?",
        "choices": [
          "Khabib Nurmagomedov",
          "Islam Makhachev",
          "Khamzat Chimaev",
          "Zabit Magomedsharipov"
        ],
        "answer": "Khabib Nurmagomedov",
        "statSheet": "The former lightweight champion retired undefeated."
      },
      {
        "type": "title-fight",
        "prompt": "Who did Khabib Nurmagomedov defeat for the vacant UFC lightweight title?",
        "choices": [
          "Al Iaquinta",
          "Conor McGregor",
          "Dustin Poirier",
          "Justin Gaethje"
        ],
        "answer": "Al Iaquinta",
        "statSheet": "The title fight headlined UFC 223."
      },
      {
        "type": "title-defense",
        "prompt": "Who challenged Khabib Nurmagomedov at UFC 229?",
        "choices": [
          "Conor McGregor",
          "Dustin Poirier",
          "Justin Gaethje",
          "Tony Ferguson"
        ],
        "answer": "Conor McGregor",
        "statSheet": "Khabib retained the title by fourth-round submission."
      },
      {
        "type": "title-defense",
        "prompt": "Who did Khabib Nurmagomedov submit at UFC 242?",
        "choices": [
          "Dustin Poirier",
          "Conor McGregor",
          "Justin Gaethje",
          "Edson Barboza"
        ],
        "answer": "Dustin Poirier",
        "statSheet": "The bout unified the lightweight championship."
      },
      {
        "type": "retirement-fight",
        "prompt": "Who did Khabib Nurmagomedov submit in his final fight at UFC 254?",
        "choices": [
          "Justin Gaethje",
          "Dustin Poirier",
          "Conor McGregor",
          "Al Iaquinta"
        ],
        "answer": "Justin Gaethje",
        "statSheet": "Khabib announced his retirement after the fight."
      },
      {
        "type": "record",
        "prompt": "What was Khabib Nurmagomedov's professional MMA record when he retired?",
        "choices": [
          "29-0",
          "28-0",
          "30-0",
          "27-0"
        ],
        "answer": "29-0",
        "statSheet": "He completed his career without a professional loss."
      },
      {
        "type": "unmade-fight",
        "prompt": "Which contender was repeatedly booked to face Khabib Nurmagomedov but never actually fought him?",
        "choices": [
          "Tony Ferguson",
          "Nate Diaz",
          "Charles Oliveira",
          "Michael Chandler"
        ],
        "answer": "Tony Ferguson",
        "statSheet": "Their matchup was canceled multiple times."
      },
      {
        "type": "finish-comparison",
        "prompt": "Which of Khabib Nurmagomedov's UFC title defenses ended latest in the fight?",
        "choices": [
          "Conor McGregor",
          "Dustin Poirier",
          "Justin Gaethje",
          "They all ended in Round 3"
        ],
        "answer": "Conor McGregor",
        "statSheet": null
      }
    ],
    [
      {
        "type": "division-history",
        "prompt": "Who became the UFC's first women's champion?",
        "choices": [
          "Ronda Rousey",
          "Miesha Tate",
          "Holly Holm",
          "Amanda Nunes"
        ],
        "answer": "Ronda Rousey",
        "statSheet": "She entered the UFC as the reigning Strikeforce bantamweight champion."
      },
      {
        "type": "title-defense",
        "prompt": "Who did Ronda Rousey defeat in the first women's fight in UFC history?",
        "choices": [
          "Liz Carmouche",
          "Miesha Tate",
          "Sara McMann",
          "Cat Zingano"
        ],
        "answer": "Liz Carmouche",
        "statSheet": "The UFC 157 main event was the promotion's first women's bout."
      },
      {
        "type": "title-change",
        "prompt": "Who did Joanna Jedrzejczyk defeat to win the UFC strawweight championship?",
        "choices": [
          "Carla Esparza",
          "Rose Namajunas",
          "Jessica Andrade",
          "Claudia Gadelha"
        ],
        "answer": "Carla Esparza",
        "statSheet": "Joanna captured the belt at UFC 185."
      },
      {
        "type": "title-fight",
        "prompt": "Who did Amanda Nunes defeat at UFC 207?",
        "choices": [
          "Ronda Rousey",
          "Miesha Tate",
          "Holly Holm",
          "Valentina Shevchenko"
        ],
        "answer": "Ronda Rousey",
        "statSheet": "Nunes stopped the former champion in 48 seconds."
      },
      {
        "type": "title-history",
        "prompt": "Who did Valentina Shevchenko defeat to win the vacant UFC flyweight championship?",
        "choices": [
          "Joanna Jedrzejczyk",
          "Jessica Eye",
          "Katlyn Chookagian",
          "Lauren Murphy"
        ],
        "answer": "Joanna Jedrzejczyk",
        "statSheet": "The title fight took place at UFC 231."
      },
      {
        "type": "title-history",
        "prompt": "Who became the first Chinese-born UFC champion?",
        "choices": [
          "Zhang Weili",
          "Yan Xiaonan",
          "Li Jingliang",
          "Song Yadong"
        ],
        "answer": "Zhang Weili",
        "statSheet": "She won the strawweight title from Jessica Andrade in Shenzhen."
      },
      {
        "type": "title-change",
        "prompt": "Who ended Valentina Shevchenko's first UFC flyweight title reign?",
        "choices": [
          "Alexa Grasso",
          "Manon Fiorot",
          "Taila Santos",
          "Jessica Andrade"
        ],
        "answer": "Alexa Grasso",
        "statSheet": "Grasso submitted Shevchenko at UFC 285."
      },
      {
        "type": "defense-history",
        "prompt": "Which UFC strawweight champion recorded five consecutive successful title defenses?",
        "choices": [
          "Joanna Jedrzejczyk",
          "Rose Namajunas",
          "Zhang Weili",
          "Carla Esparza"
        ],
        "answer": "Joanna Jedrzejczyk",
        "statSheet": null
      }
    ]
  ]
};

function runtimeQuestion(
  league: MillionaireLeague,
  runIndex: number,
  questionIndex: number,
  seed: DailyQuestionSeed,
): MillionaireRuntimeQuestion {
  const level = MILLIONAIRE_LEVELS[questionIndex]!;
  const answerIndex = seed.choices.indexOf(seed.answer);
  if (answerIndex < 0) {
    throw new Error(`Millionaire ${league} run ${runIndex + 1} ${level} answer is not in its choices.`);
  }
  const correctChoiceId = IDS[answerIndex]!;
  const distractorChoiceId = IDS[(answerIndex + 1) % IDS.length]!;
  const survivorChoiceIds = [correctChoiceId, distractorChoiceId] as [MillionaireChoiceId, MillionaireChoiceId];
  const removalChoiceIds = IDS.filter((id) => !survivorChoiceIds.includes(id)) as [MillionaireChoiceId, MillionaireChoiceId];
  const q8 = level === "Q8";

  return {
    id: `millionaire-${league}-run-${runIndex + 1}-${level.toLowerCase()}`,
    sport: league === "ufc" ? "ufc" : "football",
    level,
    money: MILLIONAIRE_MONEY_BY_LEVEL[level],
    type: seed.type,
    prompt: seed.prompt,
    choices: IDS.map((id, index) => ({ id, text: seed.choices[index]! })) as [
      { id: "A"; text: string },
      { id: "B"; text: string },
      { id: "C"; text: string },
      { id: "D"; text: string },
    ],
    correctChoiceId,
    explanation: `${seed.answer} is the correct answer.`,
    statSheet: q8 ? null : seed.statSheet,
    fiftyFifty: {
      survivorChoiceIds,
      removalChoiceIds,
    },
    lifelineCompatibility: {
      fiftyFifty: !q8,
      statSheet: !q8,
      doubleDip: !q8,
    },
  };
}

export const MILLIONAIRE_DAILY_RUN_COUNT = 10;

export function millionaireDailyRun(league: MillionaireLeague, runIndex: number): MillionaireRun {
  const normalized = ((runIndex % MILLIONAIRE_DAILY_RUN_COUNT) + MILLIONAIRE_DAILY_RUN_COUNT)
    % MILLIONAIRE_DAILY_RUN_COUNT;
  const seeds = BANKS[league][normalized];
  if (!seeds || seeds.length !== 8) {
    throw new Error(`Millionaire ${league} run ${normalized + 1} is incomplete.`);
  }
  return seeds.map((seed, index) => runtimeQuestion(league, normalized, index, seed)) as unknown as MillionaireRun;
}
