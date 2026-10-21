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

function era(year: number) { return year < 1990 ? "1980s" : year < 2000 ? "1990s" : year < 2010 ? "2000s" : year < 2020 ? "2010s" : "2020s"; }
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
function makeFact(level:number, number:number):Fact{
  const index=number%5, group=Math.floor(number/5), salt=level*5+number;
  const m=pickRow(mvps,level,index+group*4,number);
  const f=pickRow(finalsMvps,level,index+group*5,number);
  const series=pickRow(finals,level,index+group*6,number);
  const d=pickRow(drafts,level,index+group*3,number);
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
      statSheet:`The losing finalist represented the other conference from the ${series.winner}.`,source:NBA_FINALS_SOURCE,category:"finals-matchups",year:series.year,subject:series.loser};
  }
  // Comparisons are deterministic, season-anchored and deliberately close.
  const subject=d;
  const eventRows=[...drafts];
  // Events remain distinct and the draft year is hidden in the choices.
  const other=eventRows.filter(x=>x.year!==subject.year && x.name!==subject.name)
    .sort((a,b)=>Math.abs(a.year-subject.year)-Math.abs(b.year-subject.year)||a.year-b.year).slice(0,3);
  const ordered=[subject,...other].sort((a,b)=>a.year-b.year);
  const first=ordered[0]!;
  return {id:`nba-mil-q${level}-first-draft-${subject.year}`,
    prompt:"Which of these No. 1 overall NBA Draft selections happened earliest?",
    correct:first.name,
    wrong:ordered.slice(1).map(x=>x.name),
    explanation:`${first.name} was drafted No. 1 by the ${first.team} in ${first.year}, before the other three selections.`,
    statSheet:`The earliest selection took place in the ${era(first.year)}.`,source:NBA_DRAFT_SOURCE,
    category:"chronology",year:first.year,subject:first.name};
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
