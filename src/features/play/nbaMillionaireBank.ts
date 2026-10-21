/**
 * NBA Millionaire owner-review factual bank.
 *
 * Entries derive from the NBA's official, dated historical indexes. Source
 * URLs stay attached to every question for review; gameplay is assembled
 * solely from this fixed approved fact ledger, never a live/AI generation.
 *
 * The eight difficulty buckets intentionally contain 30 items each.
 * Host artwork and the fixed Millionaire stage are not modified here.
 */
import {
  MILLIONAIRE_CHOICE_IDS, MILLIONAIRE_LEVELS, MILLIONAIRE_MONEY_BY_LEVEL,
  type MillionaireLevel, type MillionaireRuntimeQuestion,
} from "../games/millionaireAuthority";
import type { MillionaireRun } from "../games/millionaireEngine";
import { seededLineupRandom, shuffleLineup } from "./lineupModel";

export const NBA_MILLIONAIRE_BANK_VERSION = "nba-millionaire-owner-v1";
export const NBA_MILLIONAIRE_BANK_SIZE = 240;
const NBA_MVP_SOURCE = "https://www.nba.com/news/history-mvp-award-winners";
const NBA_FINALS_MVP_SOURCE = "https://www.nba.com/news/history-finals-mvp-winners";
const NBA_FINALS_SOURCE = "https://www.nba.com/news/history-nba-champions";
const NBA_DRAFT_SOURCE = "https://www.nba.com/news/history-draft";
const VERIFIED_AT = "2026-10-21";

interface Award { year: number; name: string; team: string }
interface Finals { year: number; winner: string; loser: string }
interface Draft { year: number; name: string; team: string }
export interface NbaMillionaireQuestion extends MillionaireRuntimeQuestion {
  sourceUrl: string;
  verifiedAt: string;
  category: string;
  era: string;
  primarySubject: string;
}
type Fact = { id: string; prompt: string; correct: string; wrong: readonly string[];
  explanation: string; statSheet: string; source: string; category: string;
  year: number; subject: string };

function rows<T>(data: string, make: (v: string[]) => T): T[] {
  return data.trim().split("\n").map(row => make(row.split("|").map(v => v.trim())));
}
const mvps: Award[] = rows(`
1980|Kareem Abdul-Jabbar|Los Angeles Lakers
1981|Julius Erving|Philadelphia 76ers
1982|Moses Malone|Houston Rockets
1983|Moses Malone|Philadelphia 76ers
1984|Larry Bird|Boston Celtics
1985|Larry Bird|Boston Celtics
1986|Larry Bird|Boston Celtics
1987|Magic Johnson|Los Angeles Lakers
1988|Michael Jordan|Chicago Bulls
1989|Magic Johnson|Los Angeles Lakers
1990|Magic Johnson|Los Angeles Lakers
1991|Michael Jordan|Chicago Bulls
1992|Michael Jordan|Chicago Bulls
1993|Charles Barkley|Phoenix Suns
1994|Hakeem Olajuwon|Houston Rockets
1995|David Robinson|San Antonio Spurs
1996|Michael Jordan|Chicago Bulls
1997|Karl Malone|Utah Jazz
1998|Michael Jordan|Chicago Bulls
1999|Karl Malone|Utah Jazz
2000|Shaquille O'Neal|Los Angeles Lakers
2001|Allen Iverson|Philadelphia 76ers
2002|Tim Duncan|San Antonio Spurs
2003|Tim Duncan|San Antonio Spurs
2004|Kevin Garnett|Minnesota Timberwolves
2005|Steve Nash|Phoenix Suns
2006|Steve Nash|Phoenix Suns
2007|Dirk Nowitzki|Dallas Mavericks
2008|Kobe Bryant|Los Angeles Lakers
2009|LeBron James|Cleveland Cavaliers
2010|LeBron James|Cleveland Cavaliers
2011|Derrick Rose|Chicago Bulls
2012|LeBron James|Miami Heat
2013|LeBron James|Miami Heat
2014|Kevin Durant|Oklahoma City Thunder
2015|Stephen Curry|Golden State Warriors
2016|Stephen Curry|Golden State Warriors
2017|Russell Westbrook|Oklahoma City Thunder
2018|James Harden|Houston Rockets
2019|Giannis Antetokounmpo|Milwaukee Bucks
2020|Giannis Antetokounmpo|Milwaukee Bucks
2021|Nikola Jokic|Denver Nuggets
2022|Nikola Jokic|Denver Nuggets
2023|Joel Embiid|Philadelphia 76ers
2024|Nikola Jokic|Denver Nuggets
2025|Shai Gilgeous-Alexander|Oklahoma City Thunder
2026|Shai Gilgeous-Alexander|Oklahoma City Thunder
`,([year,name,team])=>({year:Number(year),name,team}));
const finalsMvps: Award[] = rows(`
1980|Magic Johnson|Los Angeles Lakers
1981|Cedric Maxwell|Boston Celtics
1982|Magic Johnson|Los Angeles Lakers
1983|Moses Malone|Philadelphia 76ers
1984|Larry Bird|Boston Celtics
1985|Kareem Abdul-Jabbar|Los Angeles Lakers
1986|Larry Bird|Boston Celtics
1987|Magic Johnson|Los Angeles Lakers
1988|James Worthy|Los Angeles Lakers
1989|Joe Dumars|Detroit Pistons
1990|Isiah Thomas|Detroit Pistons
1991|Michael Jordan|Chicago Bulls
1992|Michael Jordan|Chicago Bulls
1993|Michael Jordan|Chicago Bulls
1994|Hakeem Olajuwon|Houston Rockets
1995|Hakeem Olajuwon|Houston Rockets
1996|Michael Jordan|Chicago Bulls
1997|Michael Jordan|Chicago Bulls
1998|Michael Jordan|Chicago Bulls
1999|Tim Duncan|San Antonio Spurs
2000|Shaquille O'Neal|Los Angeles Lakers
2001|Shaquille O'Neal|Los Angeles Lakers
2002|Shaquille O'Neal|Los Angeles Lakers
2003|Tim Duncan|San Antonio Spurs
2004|Chauncey Billups|Detroit Pistons
2005|Tim Duncan|San Antonio Spurs
2006|Dwyane Wade|Miami Heat
2007|Tony Parker|San Antonio Spurs
2008|Paul Pierce|Boston Celtics
2009|Kobe Bryant|Los Angeles Lakers
2010|Kobe Bryant|Los Angeles Lakers
2011|Dirk Nowitzki|Dallas Mavericks
2012|LeBron James|Miami Heat
2013|LeBron James|Miami Heat
2014|Kawhi Leonard|San Antonio Spurs
2015|Andre Iguodala|Golden State Warriors
2016|LeBron James|Cleveland Cavaliers
2017|Kevin Durant|Golden State Warriors
2018|Kevin Durant|Golden State Warriors
2019|Kawhi Leonard|Toronto Raptors
2020|LeBron James|Los Angeles Lakers
2021|Giannis Antetokounmpo|Milwaukee Bucks
2022|Stephen Curry|Golden State Warriors
2023|Nikola Jokic|Denver Nuggets
2024|Jaylen Brown|Boston Celtics
2025|Shai Gilgeous-Alexander|Oklahoma City Thunder
2026|Jalen Brunson|New York Knicks
`,([year,name,team])=>({year:Number(year),name,team}));
const finals: Finals[] = rows(`
1980|Los Angeles Lakers|Philadelphia 76ers
1981|Boston Celtics|Houston Rockets
1982|Los Angeles Lakers|Philadelphia 76ers
1983|Philadelphia 76ers|Los Angeles Lakers
1984|Boston Celtics|Los Angeles Lakers
1985|Los Angeles Lakers|Boston Celtics
1986|Boston Celtics|Houston Rockets
1987|Los Angeles Lakers|Boston Celtics
1988|Los Angeles Lakers|Detroit Pistons
1989|Detroit Pistons|Los Angeles Lakers
1990|Detroit Pistons|Portland Trail Blazers
1991|Chicago Bulls|Los Angeles Lakers
1992|Chicago Bulls|Portland Trail Blazers
1993|Chicago Bulls|Phoenix Suns
1994|Houston Rockets|New York Knicks
1995|Houston Rockets|Orlando Magic
1996|Chicago Bulls|Seattle SuperSonics
1997|Chicago Bulls|Utah Jazz
1998|Chicago Bulls|Utah Jazz
1999|San Antonio Spurs|New York Knicks
2000|Los Angeles Lakers|Indiana Pacers
2001|Los Angeles Lakers|Philadelphia 76ers
2002|Los Angeles Lakers|New Jersey Nets
2003|San Antonio Spurs|New Jersey Nets
2004|Detroit Pistons|Los Angeles Lakers
2005|San Antonio Spurs|Detroit Pistons
2006|Miami Heat|Dallas Mavericks
2007|San Antonio Spurs|Cleveland Cavaliers
2008|Boston Celtics|Los Angeles Lakers
2009|Los Angeles Lakers|Orlando Magic
2010|Los Angeles Lakers|Boston Celtics
2011|Dallas Mavericks|Miami Heat
2012|Miami Heat|Oklahoma City Thunder
2013|Miami Heat|San Antonio Spurs
2014|San Antonio Spurs|Miami Heat
2015|Golden State Warriors|Cleveland Cavaliers
2016|Cleveland Cavaliers|Golden State Warriors
2017|Golden State Warriors|Cleveland Cavaliers
2018|Golden State Warriors|Cleveland Cavaliers
2019|Toronto Raptors|Golden State Warriors
2020|Los Angeles Lakers|Miami Heat
2021|Milwaukee Bucks|Phoenix Suns
2022|Golden State Warriors|Boston Celtics
2023|Denver Nuggets|Miami Heat
2024|Boston Celtics|Dallas Mavericks
2025|Oklahoma City Thunder|Indiana Pacers
2026|New York Knicks|San Antonio Spurs
`,([year,winner,loser])=>({year:Number(year),winner,loser}));
const drafts: Draft[] = rows(`
1980|Joe Barry Carroll|Golden State Warriors
1981|Mark Aguirre|Dallas Mavericks
1982|James Worthy|Los Angeles Lakers
1983|Ralph Sampson|Houston Rockets
1984|Hakeem Olajuwon|Houston Rockets
1985|Patrick Ewing|New York Knicks
1986|Brad Daugherty|Cleveland Cavaliers
1987|David Robinson|San Antonio Spurs
1988|Danny Manning|Los Angeles Clippers
1989|Pervis Ellison|Sacramento Kings
1990|Derrick Coleman|New Jersey Nets
1991|Larry Johnson|Charlotte Hornets
1992|Shaquille O'Neal|Orlando Magic
1993|Chris Webber|Orlando Magic
1994|Glenn Robinson|Milwaukee Bucks
1995|Joe Smith|Golden State Warriors
1996|Allen Iverson|Philadelphia 76ers
1997|Tim Duncan|San Antonio Spurs
1998|Michael Olowokandi|Los Angeles Clippers
1999|Elton Brand|Chicago Bulls
2000|Kenyon Martin|New Jersey Nets
2001|Kwame Brown|Washington Wizards
2002|Yao Ming|Houston Rockets
2003|LeBron James|Cleveland Cavaliers
2004|Dwight Howard|Orlando Magic
2005|Andrew Bogut|Milwaukee Bucks
2006|Andrea Bargnani|Toronto Raptors
2007|Greg Oden|Portland Trail Blazers
2008|Derrick Rose|Chicago Bulls
2009|Blake Griffin|Los Angeles Clippers
2010|John Wall|Washington Wizards
2011|Kyrie Irving|Cleveland Cavaliers
2012|Anthony Davis|New Orleans Hornets
2013|Anthony Bennett|Cleveland Cavaliers
2014|Andrew Wiggins|Cleveland Cavaliers
2015|Karl-Anthony Towns|Minnesota Timberwolves
2016|Ben Simmons|Philadelphia 76ers
2017|Markelle Fultz|Philadelphia 76ers
2018|Deandre Ayton|Phoenix Suns
2019|Zion Williamson|New Orleans Pelicans
2020|Anthony Edwards|Minnesota Timberwolves
2021|Cade Cunningham|Detroit Pistons
2022|Paolo Banchero|Orlando Magic
2023|Victor Wembanyama|San Antonio Spurs
2024|Zaccharie Risacher|Atlanta Hawks
2025|Cooper Flagg|Dallas Mavericks
2026|AJ Dybantsa|Washington Wizards
`,([year,name,team])=>({year:Number(year),name,team}));

function era(year: number) { return year < 1980 ? "classics" : year < 1990 ? "1980s" : year < 2000 ? "1990s" : year < 2010 ? "2000s" : year < 2020 ? "2010s" : "2020s"; }
const allNames = [...new Set([...mvps,...finalsMvps,...drafts].map(row=>row.name))];
const allTeams = [...new Set([...mvps,...finalsMvps,...drafts].map(row=>row.team).concat(finals.flatMap(row=>[row.winner,row.loser])))];
function plausible(answer: string, rows: readonly string[], index: number): string[] {
  const distinct = [...new Set(rows)].filter(name=>name!==answer);
  const sorted = [...distinct.slice(index % Math.max(1, distinct.length)), ...distinct.slice(0,index % Math.max(1,distinct.length))];
  return sorted.slice(0,3);
}
function nearNames(award: Award[], year:number, correct:string): string[] {
  const ordered=[...award].sort((a,b)=>Math.abs(a.year-year)-Math.abs(b.year-year)||a.year-b.year);
  return [...new Set(ordered.map(x=>x.name))].filter(x=>x!==correct).slice(0,3);
}
function nearTeams(year:number, correct:string):string[]{
  const candidates=finals.filter(row=>Math.abs(row.year-year)<=8).flatMap(row=>[row.winner,row.loser]);
  const options=[...new Set(candidates)].filter(x=>x!==correct);
  return [...options,...allTeams.filter(x=>x!==correct && !options.includes(x))].slice(0,3);
}
function targetEra(level:number,number:number):[number,number]{
  // Every tier retains varied eras. Overall targets: ~10% 1980s,
  // 20% 1990s, 20% 2000s, 25% 2010s and 25% 2020s.
  const weights=level<=2?[1,2,3,10,14]:level<=4?[2,5,6,9,8]:level<=6?[4,7,7,7,5]:[5,10,8,5,2];
  let slot=(number*11+level*7)%30;
  const ranges:[[number,number],number][]=[[[1980,1989],weights[0]!],[[1990,1999],weights[1]!],[[2000,2009],weights[2]!],[[2010,2019],weights[3]!],[[2020,2026],weights[4]!]];
  for(const [bounds,count] of ranges){if(slot<count)return bounds;slot-=count;}
  throw new Error("NBA Millionaire era sampling exhausted");
}
function pickRow<T extends {year:number}>(all: T[], level: number, index: number, number:number):T{
  const [first,last]=targetEra(level,number);
  const eligible=all.filter(item=>item.year>=first&&item.year<=last);
  return eligible[(index*(first===2020?5:7)+level*3)%eligible.length]!;
}
// Carefully authored NBA moments supplement: five subject-diverse questions
// per tier, with individual NBA historical source pointers and explanations.
const NBA_EDITORIAL_MOMENTS: readonly (readonly Omit<Fact, "id">[])[] = [
  [
    {
      "prompt": "Which NBA star scored 81 points against Toronto in 2006?",
      "correct": "Kobe Bryant",
      "wrong": [
        "Tracy McGrady",
        "Allen Iverson",
        "Vince Carter"
      ],
      "explanation": "Kobe Bryant scored 81 points for the Lakers against the Raptors on January 22, 2006.",
      "statSheet": "It happened in a Los Angeles Lakers home game.",
      "source": "https://www.nba.com/news/history-nba-top-moments-2000s",
      "category": "iconic-moments",
      "year": 2006,
      "subject": "Kobe Bryant"
    },
    {
      "prompt": "Who scored a record 100 points in a 1962 NBA game?",
      "correct": "Wilt Chamberlain",
      "wrong": [
        "Bill Russell",
        "Elgin Baylor",
        "Jerry West"
      ],
      "explanation": "Wilt Chamberlain scored 100 for the Philadelphia Warriors against the New York Knicks in March 1962.",
      "statSheet": "He was a dominant center for the Philadelphia Warriors.",
      "source": "https://www.nba.com/news/history-all-time-records",
      "category": "records",
      "year": 1962,
      "subject": "Wilt Chamberlain"
    },
    {
      "prompt": "Which team did LeBron James win his first NBA championship with in 2012?",
      "correct": "Miami Heat",
      "wrong": [
        "Cleveland Cavaliers",
        "Los Angeles Lakers",
        "San Antonio Spurs"
      ],
      "explanation": "LeBron James claimed his first NBA championship with the Miami Heat in the 2012 NBA Finals.",
      "statSheet": "Dwyane Wade was one of his teammates on the title team.",
      "source": "https://www.nba.com/news/history-nba-champions",
      "category": "careers",
      "year": 2012,
      "subject": "Miami Heat"
    },
    {
      "prompt": "Which franchise won all six of Michael Jordan's NBA championships?",
      "correct": "Chicago Bulls",
      "wrong": [
        "Washington Wizards",
        "Los Angeles Lakers",
        "Boston Celtics"
      ],
      "explanation": "Michael Jordan led Chicago to six NBA titles, with two separate three-peats in the 1990s.",
      "statSheet": "The team was coached by Phil Jackson during both three-peats.",
      "source": "https://www.nba.com/news/history-nba-champions",
      "category": "dynasties",
      "year": 1998,
      "subject": "Chicago Bulls"
    },
    {
      "prompt": "Which team won its first NBA title with Nikola Jokic in 2023?",
      "correct": "Denver Nuggets",
      "wrong": [
        "Phoenix Suns",
        "Milwaukee Bucks",
        "Minnesota Timberwolves"
      ],
      "explanation": "Nikola Jokic and the Denver Nuggets won their first NBA championship in 2023.",
      "statSheet": "They defeated the Miami Heat in the championship series.",
      "source": "https://www.nba.com/news/history-nba-champions",
      "category": "franchises",
      "year": 2023,
      "subject": "Denver Nuggets"
    }
  ],
  [
    {
      "prompt": "Michael Jordan's famous 1989 playoff buzzer-beater, 'The Shot,' eliminated which team?",
      "correct": "Cleveland Cavaliers",
      "wrong": [
        "Detroit Pistons",
        "New York Knicks",
        "Atlanta Hawks"
      ],
      "explanation": "Michael Jordan hit 'The Shot' over Craig Ehlo to beat Cleveland in Game 5 of the 1989 first round.",
      "statSheet": "Craig Ehlo defended the shot as the Bulls advanced.",
      "source": "https://www.nba.com/news/history-nba-top-moments-1980s",
      "category": "iconic-moments",
      "year": 1989,
      "subject": "Cleveland Cavaliers"
    },
    {
      "prompt": "Which team lost the 2016 NBA Finals after holding a 3-1 series lead?",
      "correct": "Golden State Warriors",
      "wrong": [
        "San Antonio Spurs",
        "Oklahoma City Thunder",
        "Toronto Raptors"
      ],
      "explanation": "Golden State took a 3-1 Finals lead before Cleveland completed the historic comeback.",
      "statSheet": "The losing team had won 73 regular-season games.",
      "source": "https://www.nba.com/news/history-nba-top-moments-2010s",
      "category": "playoff-history",
      "year": 2016,
      "subject": "Golden State Warriors"
    },
    {
      "prompt": "Kevin Garnett joined Boston's championship-bound Big Three after leaving which team?",
      "correct": "Minnesota Timberwolves",
      "wrong": [
        "Brooklyn Nets",
        "Phoenix Suns",
        "Detroit Pistons"
      ],
      "explanation": "Boston acquired Kevin Garnett from Minnesota in 2007 and won the championship in 2008.",
      "statSheet": "The player had previously won NBA MVP in 2004.",
      "source": "https://www.nba.com/news/history-nba-top-moments-2000s",
      "category": "trades",
      "year": 2007,
      "subject": "Minnesota Timberwolves"
    },
    {
      "prompt": "Who hit the famous late three-pointer that forced overtime in Game 6 of the 2013 Finals?",
      "correct": "Ray Allen",
      "wrong": [
        "Shane Battier",
        "Mario Chalmers",
        "Mike Miller"
      ],
      "explanation": "Ray Allen's corner three tied Game 6 against the Spurs and kept Miami's title hopes alive.",
      "statSheet": "He had won a title with Boston before joining Miami.",
      "source": "https://www.nba.com/news/history-nba-top-moments-2010s",
      "category": "finals-moments",
      "year": 2013,
      "subject": "Ray Allen"
    },
    {
      "prompt": "Which Rockets guard won NBA MVP for the 2017-18 season?",
      "correct": "James Harden",
      "wrong": [
        "Chris Paul",
        "Russell Westbrook",
        "Eric Gordon"
      ],
      "explanation": "James Harden won the NBA's 2017-18 regular-season MVP while playing for Houston.",
      "statSheet": "The winner was known for his step-back three-pointer.",
      "source": "https://www.nba.com/news/history-mvp-award-winners",
      "category": "awards",
      "year": 2018,
      "subject": "James Harden"
    }
  ],
  [
    {
      "prompt": "Who became the first unanimous NBA regular-season MVP in 2016?",
      "correct": "Stephen Curry",
      "wrong": [
        "LeBron James",
        "Kevin Durant",
        "Kawhi Leonard"
      ],
      "explanation": "Stephen Curry received every first-place MVP vote for his 2015-16 season with Golden State.",
      "statSheet": "His team set a then-record with 73 regular-season wins.",
      "source": "https://www.nba.com/news/history-mvp-award-winners",
      "category": "awards-history",
      "year": 2016,
      "subject": "Stephen Curry"
    },
    {
      "prompt": "Which franchise won its first NBA championship in 2019?",
      "correct": "Toronto Raptors",
      "wrong": [
        "Vancouver Grizzlies",
        "Montreal Royals",
        "Ottawa Nationals"
      ],
      "explanation": "The Toronto Raptors won the 2019 NBA championship, the first in their franchise history.",
      "statSheet": "Kawhi Leonard earned Finals MVP for the champion.",
      "source": "https://www.nba.com/news/history-nba-champions",
      "category": "franchises",
      "year": 2019,
      "subject": "Toronto Raptors"
    },
    {
      "prompt": "Stephen Curry earned his first NBA Finals MVP award in which year?",
      "correct": "2022",
      "wrong": [
        "2015",
        "2016",
        "2017"
      ],
      "explanation": "Stephen Curry won his first NBA Finals MVP in 2022, following the Warriors' title win over Boston.",
      "statSheet": "His team defeated the Celtics in six games.",
      "source": "https://www.nba.com/news/history-finals-mvp-winners",
      "category": "finals-mvp",
      "year": 2022,
      "subject": "2022"
    },
    {
      "prompt": "Which team won the 2020 NBA title inside the Orlando playoff bubble?",
      "correct": "Los Angeles Lakers",
      "wrong": [
        "Miami Heat",
        "Boston Celtics",
        "Denver Nuggets"
      ],
      "explanation": "The Los Angeles Lakers beat the Miami Heat in the 2020 NBA Finals in the Orlando bubble.",
      "statSheet": "LeBron James was the Finals MVP.",
      "source": "https://www.nba.com/news/history-nba-champions",
      "category": "championship",
      "year": 2020,
      "subject": "Los Angeles Lakers"
    },
    {
      "prompt": "Who won the NBA Rookie of the Year award for the 2017-18 season?",
      "correct": "Ben Simmons",
      "wrong": [
        "Donovan Mitchell",
        "Jayson Tatum",
        "Lonzo Ball"
      ],
      "explanation": "Ben Simmons was named the 2017-18 NBA Rookie of the Year with Philadelphia.",
      "statSheet": "He made his NBA debut in 2017 after missing his first season due to injury.",
      "source": "https://www.nba.com/history",
      "category": "rookie-awards",
      "year": 2018,
      "subject": "Ben Simmons"
    }
  ],
  [
    {
      "prompt": "Which team drafted Dirk Nowitzki ninth overall in 1998 before trading his rights to Dallas?",
      "correct": "Milwaukee Bucks",
      "wrong": [
        "Boston Celtics",
        "Phoenix Suns",
        "Toronto Raptors"
      ],
      "explanation": "Milwaukee selected Dirk Nowitzki at No. 9 in 1998 before trading his rights to the Mavericks.",
      "statSheet": "The player went on to spend his NBA career in Dallas.",
      "source": "https://www.nba.com/news/history-draft",
      "category": "draft-trades",
      "year": 1998,
      "subject": "Milwaukee Bucks"
    },
    {
      "prompt": "Which team originally selected Kobe Bryant in the 1996 NBA Draft?",
      "correct": "Charlotte Hornets",
      "wrong": [
        "Los Angeles Lakers",
        "Philadelphia 76ers",
        "New Jersey Nets"
      ],
      "explanation": "Charlotte selected Kobe Bryant 13th in the 1996 draft and traded his rights to the Lakers.",
      "statSheet": "The selection came directly out of high school.",
      "source": "https://www.nba.com/news/history-draft",
      "category": "draft-trades",
      "year": 1996,
      "subject": "Charlotte Hornets"
    },
    {
      "prompt": "LeBron James passed which legend as the NBA's all-time regular-season scoring leader in 2023?",
      "correct": "Kareem Abdul-Jabbar",
      "wrong": [
        "Karl Malone",
        "Wilt Chamberlain",
        "Michael Jordan"
      ],
      "explanation": "LeBron James surpassed Kareem Abdul-Jabbar's longtime career regular-season points record in February 2023.",
      "statSheet": "The previous leader had starred for Milwaukee and the Lakers.",
      "source": "https://www.nba.com/news/history-all-time-records",
      "category": "records",
      "year": 2023,
      "subject": "Kareem Abdul-Jabbar"
    },
    {
      "prompt": "How many regular-season games did the 2015-16 Golden State Warriors win?",
      "correct": "73",
      "wrong": [
        "72",
        "70",
        "74"
      ],
      "explanation": "Golden State won 73 games in 2015-16, breaking Chicago's 72-win regular-season record.",
      "statSheet": "The previous best had been set by the 1995-96 Bulls.",
      "source": "https://www.nba.com/news/history-nba-top-moments-2010s",
      "category": "records",
      "year": 2016,
      "subject": "73"
    },
    {
      "prompt": "The 2011 Dallas Mavericks defeated which team to win Dirk Nowitzki's first championship?",
      "correct": "Miami Heat",
      "wrong": [
        "Boston Celtics",
        "Oklahoma City Thunder",
        "Los Angeles Lakers"
      ],
      "explanation": "Dallas beat Miami in six games in the 2011 NBA Finals, with Dirk Nowitzki winning Finals MVP.",
      "statSheet": "Dallas faced LeBron James and Dwyane Wade in the championship series.",
      "source": "https://www.nba.com/news/history-nba-champions",
      "category": "finals-matchups",
      "year": 2011,
      "subject": "Miami Heat"
    }
  ],
  [
    {
      "prompt": "Who won the 2017 NBA MVP after averaging a triple-double for the season?",
      "correct": "Russell Westbrook",
      "wrong": [
        "James Harden",
        "Stephen Curry",
        "Chris Paul"
      ],
      "explanation": "Russell Westbrook won the 2016-17 MVP after averaging a triple-double for Oklahoma City.",
      "statSheet": "He had remained with the Thunder after Kevin Durant's departure.",
      "source": "https://www.nba.com/news/history-mvp-award-winners",
      "category": "records",
      "year": 2017,
      "subject": "Russell Westbrook"
    },
    {
      "prompt": "Which Bulls superstar won both MVP and Defensive Player of the Year in 1988?",
      "correct": "Michael Jordan",
      "wrong": [
        "Scottie Pippen",
        "Dennis Rodman",
        "Horace Grant"
      ],
      "explanation": "Michael Jordan won both the regular-season MVP and Defensive Player of the Year awards for 1987-88.",
      "statSheet": "He was also the NBA scoring champion that season.",
      "source": "https://www.nba.com/history",
      "category": "awards-history",
      "year": 1988,
      "subject": "Michael Jordan"
    },
    {
      "prompt": "Which Spurs star won consecutive regular-season MVP awards in 2002 and 2003?",
      "correct": "Tim Duncan",
      "wrong": [
        "David Robinson",
        "Tony Parker",
        "Manu Ginobili"
      ],
      "explanation": "Tim Duncan won the 2001-02 and 2002-03 MVP awards while leading San Antonio.",
      "statSheet": "The winner also took home Finals MVP in 2003.",
      "source": "https://www.nba.com/news/history-mvp-award-winners",
      "category": "awards-history",
      "year": 2003,
      "subject": "Tim Duncan"
    },
    {
      "prompt": "The 1995 Orlando Magic fell to which team in Shaquille O'Neal's first NBA Finals?",
      "correct": "Houston Rockets",
      "wrong": [
        "Chicago Bulls",
        "New York Knicks",
        "San Antonio Spurs"
      ],
      "explanation": "Houston swept Orlando in the 1995 Finals to repeat as NBA champion.",
      "statSheet": "The winning center was Hakeem Olajuwon.",
      "source": "https://www.nba.com/news/history-nba-champions",
      "category": "playoff-history",
      "year": 1995,
      "subject": "Houston Rockets"
    },
    {
      "prompt": "Which team had a 27-game winning streak during the 2012-13 NBA season?",
      "correct": "Miami Heat",
      "wrong": [
        "Chicago Bulls",
        "San Antonio Spurs",
        "Oklahoma City Thunder"
      ],
      "explanation": "Miami won 27 consecutive games in 2012-13 before the streak ended against Chicago.",
      "statSheet": "LeBron James was in his third season with the team.",
      "source": "https://www.nba.com/news/history-nba-top-moments-2010s",
      "category": "records",
      "year": 2013,
      "subject": "Miami Heat"
    }
  ],
  [
    {
      "prompt": "Who scored 71 points for San Antonio against the Clippers in 1994?",
      "correct": "David Robinson",
      "wrong": [
        "Tim Duncan",
        "Shaquille O'Neal",
        "Hakeem Olajuwon"
      ],
      "explanation": "David Robinson scored 71 against the Clippers on April 24, 1994, winning the scoring race.",
      "statSheet": "His nickname was The Admiral.",
      "source": "https://www.nba.com/news/history-nba-top-moments-1990s",
      "category": "scoring-records",
      "year": 1994,
      "subject": "David Robinson"
    },
    {
      "prompt": "Michael Jordan made his 1989 series-winning 'The Shot' over which Cavaliers defender?",
      "correct": "Craig Ehlo",
      "wrong": [
        "Mark Price",
        "Ron Harper",
        "Larry Nance"
      ],
      "explanation": "Craig Ehlo was guarding Michael Jordan when he hit the Game 5 winner in Cleveland in 1989.",
      "statSheet": "The play eliminated the Cavaliers in the first round.",
      "source": "https://www.nba.com/news/history-nba-top-moments-1980s",
      "category": "iconic-moments",
      "year": 1989,
      "subject": "Craig Ehlo"
    },
    {
      "prompt": "Who set the NBA single-game record by making 14 three-pointers in 2018?",
      "correct": "Klay Thompson",
      "wrong": [
        "Stephen Curry",
        "Damian Lillard",
        "James Harden"
      ],
      "explanation": "Klay Thompson hit 14 three-pointers against Chicago in October 2018.",
      "statSheet": "He was a member of Golden State's Splash Brothers.",
      "source": "https://www.nba.com/news/history-all-time-records",
      "category": "shooting-records",
      "year": 2018,
      "subject": "Klay Thompson"
    },
    {
      "prompt": "Which Warriors player was on the receiving end of LeBron James' famous 2016 Finals Game 7 block?",
      "correct": "Andre Iguodala",
      "wrong": [
        "Harrison Barnes",
        "Draymond Green",
        "Shaun Livingston"
      ],
      "explanation": "LeBron James chased down Andre Iguodala to make his famous Game 7 block in the 2016 Finals.",
      "statSheet": "The stop occurred late in a tie game in Oakland.",
      "source": "https://www.nba.com/news/history-nba-top-moments-2010s",
      "category": "finals-moments",
      "year": 2016,
      "subject": "Andre Iguodala"
    },
    {
      "prompt": "Which player arrived in Boston from Seattle to complete the 2007-08 Celtics Big Three?",
      "correct": "Ray Allen",
      "wrong": [
        "Paul Pierce",
        "Rajon Rondo",
        "Eddie House"
      ],
      "explanation": "Ray Allen joined Boston via trade from Seattle in 2007, alongside Kevin Garnett's arrival.",
      "statSheet": "He was already an elite three-point shooter before becoming a champion.",
      "source": "https://www.nba.com/news/history-nba-top-moments-2000s",
      "category": "trades",
      "year": 2007,
      "subject": "Ray Allen"
    }
  ],
  [
    {
      "prompt": "Who scored eight points in nine seconds for Indiana against the Knicks in the 1995 playoffs?",
      "correct": "Reggie Miller",
      "wrong": [
        "Jalen Rose",
        "Mark Jackson",
        "Rik Smits"
      ],
      "explanation": "Reggie Miller stunned New York with eight points in nine seconds in the 1995 Eastern Conference semifinals.",
      "statSheet": "The iconic sequence came at Madison Square Garden.",
      "source": "https://www.nba.com/news/history-nba-top-moments-1990s",
      "category": "playoff-moments",
      "year": 1995,
      "subject": "Reggie Miller"
    },
    {
      "prompt": "Which coach passed Red Auerbach by winning his 10th NBA title as head coach in 2009?",
      "correct": "Phil Jackson",
      "wrong": [
        "Pat Riley",
        "Gregg Popovich",
        "Larry Brown"
      ],
      "explanation": "Phil Jackson won his tenth championship as a head coach with the Lakers in 2009.",
      "statSheet": "He had previously won six titles coaching Chicago.",
      "source": "https://www.nba.com/news/history-nba-top-moments-2000s",
      "category": "coaching-history",
      "year": 2009,
      "subject": "Phil Jackson"
    },
    {
      "prompt": "Which Golden State reserve won NBA Finals MVP in 2015?",
      "correct": "Andre Iguodala",
      "wrong": [
        "Shaun Livingston",
        "David Lee",
        "Leandro Barbosa"
      ],
      "explanation": "Andre Iguodala was named 2015 Finals MVP in Golden State's title victory over Cleveland.",
      "statSheet": "He moved into the starting lineup during the series.",
      "source": "https://www.nba.com/news/history-finals-mvp-winners",
      "category": "finals-mvp",
      "year": 2015,
      "subject": "Andre Iguodala"
    },
    {
      "prompt": "The Spurs' celebrated 2014 team-passing title run ended with a Finals win over whom?",
      "correct": "Miami Heat",
      "wrong": [
        "Oklahoma City Thunder",
        "Cleveland Cavaliers",
        "Indiana Pacers"
      ],
      "explanation": "San Antonio beat Miami in the 2014 Finals, playing the fluid team basketball for which the Spurs were known.",
      "statSheet": "The opponent had defeated San Antonio one year earlier.",
      "source": "https://www.nba.com/news/history-nba-champions",
      "category": "championship",
      "year": 2014,
      "subject": "Miami Heat"
    },
    {
      "prompt": "Which team handed the 2000-01 Lakers their only playoff loss?",
      "correct": "Philadelphia 76ers",
      "wrong": [
        "San Antonio Spurs",
        "Sacramento Kings",
        "Portland Trail Blazers"
      ],
      "explanation": "Philadelphia won Game 1 of the 2001 NBA Finals; the Lakers finished the playoffs 15-1.",
      "statSheet": "Allen Iverson famously stepped over Tyronn Lue in that victory.",
      "source": "https://www.nba.com/news/history-nba-top-moments-2000s",
      "category": "playoff-history",
      "year": 2001,
      "subject": "Philadelphia 76ers"
    }
  ],
  [
    {
      "prompt": "Who was the only NBA Finals MVP from the losing team, earning the award in 1969?",
      "correct": "Jerry West",
      "wrong": [
        "Elgin Baylor",
        "John Havlicek",
        "Wilt Chamberlain"
      ],
      "explanation": "Jerry West was awarded the inaugural Finals MVP even though the Lakers lost the 1969 Finals to Boston.",
      "statSheet": "He starred for Los Angeles during the Bill Russell era.",
      "source": "https://www.nba.com/news/history-finals-mvp-winners",
      "category": "awards-history",
      "year": 1969,
      "subject": "Jerry West"
    },
    {
      "prompt": "Which 1981 NBA Finals MVP never made an NBA All-Star team?",
      "correct": "Cedric Maxwell",
      "wrong": [
        "Larry Bird",
        "Kevin McHale",
        "Robert Parish"
      ],
      "explanation": "Cedric Maxwell won the 1981 Finals MVP for Boston despite never being selected as an NBA All-Star.",
      "statSheet": "The champion was the Boston Celtics.",
      "source": "https://www.nba.com/news/history-finals-mvp-winners",
      "category": "finals-mvp",
      "year": 1981,
      "subject": "Cedric Maxwell"
    },
    {
      "prompt": "Who won NBA MVP, Defensive Player of the Year and Finals MVP in the 1993-94 season?",
      "correct": "Hakeem Olajuwon",
      "wrong": [
        "David Robinson",
        "Michael Jordan",
        "Patrick Ewing"
      ],
      "explanation": "Hakeem Olajuwon captured all three major individual honors while winning Houston's 1994 championship.",
      "statSheet": "He played center for the Rockets.",
      "source": "https://www.nba.com/history",
      "category": "award-combinations",
      "year": 1994,
      "subject": "Hakeem Olajuwon"
    },
    {
      "prompt": "Which 1995 NBA champion entered the playoffs as the Western Conference's No. 6 seed?",
      "correct": "Houston Rockets",
      "wrong": [
        "San Antonio Spurs",
        "Phoenix Suns",
        "Orlando Magic"
      ],
      "explanation": "Houston won the 1995 title as a sixth seed, its second straight championship.",
      "statSheet": "Hakeem Olajuwon won Finals MVP.",
      "source": "https://www.nba.com/news/history-nba-top-moments-1990s",
      "category": "championship-history",
      "year": 1995,
      "subject": "Houston Rockets"
    },
    {
      "prompt": "Which rookie famously played center in the Lakers' 1980 Finals-clinching Game 6?",
      "correct": "Magic Johnson",
      "wrong": [
        "Michael Cooper",
        "Norm Nixon",
        "Jamaal Wilkes"
      ],
      "explanation": "Rookie Magic Johnson played center with Kareem Abdul-Jabbar out and led Los Angeles to the title.",
      "statSheet": "He earned Finals MVP as a rookie.",
      "source": "https://www.nba.com/history",
      "category": "finals-moments",
      "year": 1980,
      "subject": "Magic Johnson"
    }
  ]
];

function makeFact(level:number, number:number):Fact{
  const index=number%5, group=Math.floor(number/5);
  const m=pickRow(mvps,level,index+group*4,number);
  const f=pickRow(finalsMvps,level,index+group*5,number);
  const series=pickRow(finals,level,index+group*6,number);
  const d=pickRow(drafts,level,index+group*3,number);
  if(group===5){
    const moment=NBA_EDITORIAL_MOMENTS[level-1]?.[index];
    if(!moment)throw new Error("NBA Millionaire editorial question missing");
    return {...moment,id:`nba-mil-q${level}-editorial-${index+1}`};
  }
  if(group===0){
    return {id:`nba-mil-q${level}-champ-${series.year}`,prompt:`Which franchise won the ${series.year} NBA championship?`,
      correct:series.winner,wrong:nearTeams(series.year,series.winner),
      explanation:`The ${series.winner} defeated the ${series.loser} in the ${series.year} NBA Finals.`,
      statSheet:`The champion defeated the ${series.loser} in the NBA Finals.`,source:NBA_FINALS_SOURCE,category:"championship",year:series.year,subject:series.winner};
  }
  if(group===1){
    return {id:`nba-mil-q${level}-mvp-${m.year}`,prompt:level<=4?`Who was named NBA regular-season MVP for ${m.year-1}–${String(m.year).slice(-2)}?`:`Who won NBA regular-season MVP at the end of the ${m.year-1}–${String(m.year).slice(-2)} season?`,
      correct:m.name,wrong:nearNames(mvps,m.year,m.name),
      explanation:`${m.name} earned the ${m.year-1}–${String(m.year).slice(-2)} regular-season MVP award with the ${m.team}.`,
      statSheet:`The winner played for the ${m.team} that season.`,source:NBA_MVP_SOURCE,category:"awards",year:m.year,subject:m.name};
  }
  if(group===2){
    return {id:`nba-mil-q${level}-fmvp-${f.year}`,prompt:`Who earned NBA Finals MVP in ${f.year}?`,
      correct:f.name,wrong:nearNames(finalsMvps,f.year,f.name),
      explanation:`${f.name} was named ${f.year} Finals MVP with the ${f.team}.`,
      statSheet:`This Finals MVP played for the ${f.team}.`,source:NBA_FINALS_MVP_SOURCE,category:"finals-mvp",year:f.year,subject:f.name};
  }
  if(group===3){
    return {id:`nba-mil-q${level}-draft-${d.year}`,prompt:`Which player was selected No. 1 overall in the ${d.year} NBA Draft?`,
      correct:d.name,wrong:nearNames(drafts,d.year,d.name),
      explanation:`The ${d.team} selected ${d.name} with the first overall pick in the ${d.year} draft.`,
      statSheet:`The No. 1 pick was selected by the ${d.team}.`,source:NBA_DRAFT_SOURCE,category:"draft",year:d.year,subject:d.name};
  }
  if(group===4){
    return {id:`nba-mil-q${level}-finalist-${series.year}`,prompt:`Which team did the ${series.winner} defeat in the ${series.year} NBA Finals?`,
      correct:series.loser,wrong:nearTeams(series.year,series.loser),
      explanation:`The ${series.winner} won the ${series.year} title by defeating the ${series.loser}.`,
      statSheet:`The losing finalist represented the ${new Set(["Boston Celtics","Brooklyn Nets","New Jersey Nets","Chicago Bulls","Cleveland Cavaliers","Detroit Pistons","Indiana Pacers","Miami Heat","Milwaukee Bucks","New York Knicks","Orlando Magic","Philadelphia 76ers","Toronto Raptors","Washington Wizards","Charlotte Hornets","Atlanta Hawks"]).has(series.winner) ? "Western" : "Eastern"} Conference.`,source:NBA_FINALS_SOURCE,category:"finals-matchups",year:series.year,subject:series.loser};
  }
  throw new Error("NBA Millionaire category unsupported");
}

function makeQuestion(level:number,index:number):NbaMillionaireQuestion {
  const fact=makeFact(level,index);
  const choices=[fact.correct,...fact.wrong];
  if(choices.length!==4 || new Set(choices).size!==4) throw new Error(`NBA Millionaire invalid choices: ${fact.id}`);
  // Shuffling is deterministic per question, independent of run.
  const shuffled=shuffleLineup(choices,seededLineupRandom(NBA_MILLIONAIRE_BANK_VERSION,fact.id));
  const answerIndex=shuffled.indexOf(fact.correct);
  const correctChoiceId=MILLIONAIRE_CHOICE_IDS[answerIndex]!;
  const other = MILLIONAIRE_CHOICE_IDS.find((id,idx)=>idx!==answerIndex)!;
  const removal=MILLIONAIRE_CHOICE_IDS.filter(id=>id!==correctChoiceId && id!==other);
  const levelId=MILLIONAIRE_LEVELS[level-1]!;
  return {
    id:fact.id,sport:"nba",level:levelId,money:MILLIONAIRE_MONEY_BY_LEVEL[levelId],
    type:fact.category,prompt:fact.prompt,
    choices:MILLIONAIRE_CHOICE_IDS.map((id,idx)=>({id,text:shuffled[idx]!})) as unknown as NbaMillionaireQuestion["choices"],
    correctChoiceId, explanation:fact.explanation,statSheet:level===8?null:fact.statSheet,
    fiftyFifty:{survivorChoiceIds:[correctChoiceId,other],removalChoiceIds:removal as ["A"|"B"|"C"|"D","A"|"B"|"C"|"D"]},
    lifelineCompatibility:{fiftyFifty:level!==8,statSheet:level!==8,doubleDip:level!==8},
    sourceUrl:fact.source,verifiedAt:VERIFIED_AT,category:fact.category,era:era(fact.year),primarySubject:fact.subject,
  };
}
export const NBA_MILLIONAIRE_QUESTIONS: readonly NbaMillionaireQuestion[] =
  MILLIONAIRE_LEVELS.flatMap((_,index)=>Array.from({length:30},(_,n)=>makeQuestion(index+1,n)));

if(NBA_MILLIONAIRE_QUESTIONS.length!==NBA_MILLIONAIRE_BANK_SIZE ||
   new Set(NBA_MILLIONAIRE_QUESTIONS.map(q=>q.id)).size!==NBA_MILLIONAIRE_BANK_SIZE)
  throw new Error("NBA Millionaire question inventory is incomplete or duplicated");

export function nbaMillionaireQuestionsForLevel(level:MillionaireLevel){
  return NBA_MILLIONAIRE_QUESTIONS.filter(question=>question.level===level);
}
export function nbaMillionaireRun(seed:string,recentQuestionIds:readonly string[]=[]):MillionaireRun{
  const random=seededLineupRandom("nba-millionaire-run",NBA_MILLIONAIRE_BANK_VERSION,seed);
  const usedSubjects=new Map<string,number>();
  const usedCategories=new Map<string,number>();
  const run=MILLIONAIRE_LEVELS.map(level=>{
    const candidates=shuffleLineup(nbaMillionaireQuestionsForLevel(level),random);
    const scored=candidates.map(question=>{
      const previous=recentQuestionIds.indexOf(question.id);
      const repeatPenalty=previous>=0?5000+(recentQuestionIds.length-previous)*20:0;
      const subjectPenalty=(usedSubjects.get(question.primarySubject)??0)*1000;
      const categoryPenalty=(usedCategories.get(question.category)??0)*220;
      return {question,penalty:repeatPenalty+subjectPenalty+categoryPenalty};
    }).sort((a,b)=>a.penalty-b.penalty);
    const base=scored[0]!.question;
    usedSubjects.set(base.primarySubject,(usedSubjects.get(base.primarySubject)??0)+1);
    usedCategories.set(base.category,(usedCategories.get(base.category)??0)+1);
    // Shuffle the choices each run, fixing the choice ID and 50:50 correctly.
    const choices=shuffleLineup(base.choices.map(c=>c.text),random);
    const winner=base.choices.find(c=>c.id===base.correctChoiceId)!.text;
    const correctChoiceId=MILLIONAIRE_CHOICE_IDS[choices.indexOf(winner)]!;
    const other=MILLIONAIRE_CHOICE_IDS.find(id=>id!==correctChoiceId)!;
    const removal=MILLIONAIRE_CHOICE_IDS.filter(id=>id!==correctChoiceId && id!==other);
    return {...base,
      choices:MILLIONAIRE_CHOICE_IDS.map((id,idx)=>({id,text:choices[idx]!})) as unknown as NbaMillionaireQuestion["choices"],
      correctChoiceId,
      fiftyFifty:{survivorChoiceIds:[correctChoiceId,other] as [typeof correctChoiceId,typeof other],
        removalChoiceIds:removal as [typeof correctChoiceId,typeof other]},
    };
  });
  return run as unknown as MillionaireRun;
}
