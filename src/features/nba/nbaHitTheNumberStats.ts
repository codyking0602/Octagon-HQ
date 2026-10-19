/**
 * Snapshot of audited NBA regular-season *per-game* stats. Career figures are
 * NBA-only completed-career averages (not ABA or playoffs). Season figures are
 * regular-season lines with >=35 games; player names match our approved 200
 * Who Am I identity bank. A year identifies the season *ending* in that year.
 *
 * Season rows: Data-Dunkers Basketball Reference per-game data, 2024–25 and
 * 2025–26 (https://github.com/Data-Dunkers/data/tree/main/NBA/player).
 * Career rows: Basketball Reference regular-season career per-game tables
 * (https://www.basketball-reference.com/players/).
 * Never approximate points from rounded FGM, FG3M and FTM.
 */
export type NbaHitStatScope = "career" | "season";
export type NbaHitMetric = "points" | "assists" | "rebounds";
export type NbaHitStat = `${NbaHitStatScope}-${NbaHitMetric}`;
export const NBA_HIT_STAT_CATALOG = [
  { id: "career-points", label: "Career Points Per Game", scope: "career", stat: "points" },
  { id: "career-assists", label: "Career Assists Per Game", scope: "career", stat: "assists" },
  { id: "career-rebounds", label: "Career Rebounds Per Game", scope: "career", stat: "rebounds" },
  { id: "season-points", label: "Season Points Per Game", scope: "season", stat: "points" },
  { id: "season-assists", label: "Season Assists Per Game", scope: "season", stat: "assists" },
  { id: "season-rebounds", label: "Season Rebounds Per Game", scope: "season", stat: "rebounds" },
] as const satisfies readonly { id: NbaHitStat; label: string; scope: NbaHitStatScope; stat: NbaHitMetric }[];
// Compact tuples: [season-ending year, player, games, PPG, RPG, APG, role, NBA id].
const SEASON_STATS: readonly (readonly [number,string,number,number,number,number,string,number|null])[] = [[2025,"Al Horford",60,9,6.2,2.1,"C",201143],[2025,"Alperen Şengün",76,19.1,10.3,4.9,"C",1630578],[2025,"Andre Drummond",40,7.3,7.8,0.9,"C",203083],[2025,"Anthony Davis",51,24.7,11.6,3.5,"F",203076],[2025,"Anthony Edwards",79,27.6,5.7,4.5,"G",1630162],[2025,"Bam Adebayo",78,18.1,9.6,4.3,"C",1628389],[2025,"Bradley Beal",53,17,3.3,3.7,"G",203078],[2025,"Brook Lopez",80,13,5,1.8,"C",201572],[2025,"Cade Cunningham",70,26.1,6.1,9.1,"G",1630595],[2025,"Chris Paul",82,8.8,3.6,7.4,"G",101108],[2025,"Damian Lillard",58,24.9,4.7,7.1,"G",203081],[2025,"De’Aaron Fox",62,23.5,4.8,6.3,"G",1628368],[2025,"DeAndre Jordan",56,3.7,5.1,0.9,"C",201599],[2025,"DeMar DeRozan",77,22.2,3.9,4.4,"G",201942],[2025,"Devin Booker",75,25.6,4.1,7.1,"G",1626164],[2025,"Domantas Sabonis",70,19.1,13.9,6,"F",1627734],[2025,"Donovan Mitchell",71,24,4.5,5,"G",1628378],[2025,"Draymond Green",68,9,6.1,5.6,"F",203110],[2025,"Evan Mobley",71,18.5,9.3,3.2,"C",1630596],[2025,"Franz Wagner",60,24.2,5.7,4.7,"F",1630532],[2025,"Giannis Antetokounmpo",67,30.4,11.9,6.5,"F",203507],[2025,"Ja Morant",50,23.2,4.1,7.3,"G",1629630],[2025,"Jalen Brunson",65,26,2.9,7.3,"G",1628973],[2025,"Jalen Williams",69,21.6,5.3,5.1,"G",1631114],[2025,"James Harden",79,22.8,5.8,8.7,"G",201935],[2025,"Jaren Jackson Jr.",74,22.2,5.6,2,"F",1628991],[2025,"Jaylen Brown",63,22.2,5.8,4.5,"G",1627759],[2025,"Jayson Tatum",72,26.8,8.7,6,"F",1628369],[2025,"Jrue Holiday",62,11.1,4.3,3.9,"G",201950],[2025,"Karl-Anthony Towns",72,24.4,12.8,3.1,"C",1626157],[2025,"Kawhi Leonard",37,21.5,5.9,3.1,"F",202695],[2025,"Kevin Durant",62,26.6,6,4.2,"F",201142],[2025,"Khris Middleton",37,11.9,3.7,4.1,"F",203114],[2025,"Klay Thompson",72,14,3.4,2,"G",202691],[2025,"Kyle Lowry",35,3.9,1.9,2.7,"G",200768],[2025,"Kyrie Irving",50,24.7,4.8,4.6,"G",202681],[2025,"LaMelo Ball",47,25.2,4.9,7.4,"G",1630163],[2025,"LeBron James",70,24.4,7.8,8.2,"F",2544],[2025,"Luka Dončić",50,28.2,8.2,7.7,"G",1629029],[2025,"Mikal Bridges",82,17.6,3.2,3.7,"G",1628969],[2025,"Mike Conley",71,8.2,2.6,4.5,"G",201144],[2025,"Nikola Jokić",70,29.6,12.7,10.2,"C",203999],[2025,"Paolo Banchero",46,25.9,7.5,4.8,"F",1631094],[2025,"Pascal Siakam",78,20.2,6.9,3.4,"F",1627783],[2025,"Paul George",41,16.2,5.3,4.3,"F",202331],[2025,"Rudy Gobert",72,12,10.9,1.8,"C",203497],[2025,"Russell Westbrook",75,13.3,4.9,6.1,"G",201566],[2025,"Shai Gilgeous-Alexander",76,32.7,5,6.4,"G",1628983],[2025,"Stephen Curry",70,24.5,4.4,6,"G",201939],[2025,"Trae Young",76,24.2,3.1,11.6,"G",1629027],[2025,"Tyrese Haliburton",73,18.6,3.5,9.2,"G",1630169],[2025,"Victor Wembanyama",46,24.3,11,3.7,"F",1641705],[2025,"Zach LaVine",74,23.3,4.3,4.2,"G",203897],[2026,"Alperen Şengün",69,20.6,8.8,6.2,"C",1630578],[2026,"Andre Drummond",59,6.3,8.2,1.2,"C",203083],[2026,"Anthony Edwards",60,28.9,5,3.7,"G",1630162],[2026,"Bam Adebayo",69,20.2,10,3,"C",1628389],[2026,"Brandon Ingram",73,21.3,5.5,3.6,"F",1627742],[2026,"Brook Lopez",71,8.2,3.4,1.3,"C",201572],[2026,"Cade Cunningham",61,24.5,5.6,9.9,"G",1630595],[2026,"Chet Holmgren",67,17,8.8,1.6,"C",1631096],[2026,"De’Aaron Fox",68,18.5,3.8,6.2,"G",1628368],[2026,"DeMar DeRozan",77,18.4,2.9,4.1,"G",201942],[2026,"Devin Booker",62,25.8,3.9,6,"G",1626164],[2026,"Donovan Mitchell",69,27.8,4.5,5.7,"G",1628378],[2026,"Draymond Green",65,8.6,5.5,5.5,"F",203110],[2026,"Evan Mobley",62,18.1,9,3.6,"C",1630596],[2026,"Jalen Brunson",71,26,3.4,6.7,"G",1628973],[2026,"James Harden",68,23.7,4.9,8.1,"G",201935],[2026,"Jaren Jackson Jr.",48,19.4,5.7,2,"F",1628991],[2026,"Jaylen Brown",69,28.7,7,5.2,"G",1627759],[2026,"Jrue Holiday",49,16.3,4.5,6.1,"G",201950],[2026,"Karl-Anthony Towns",72,20.1,11.9,2.9,"C",1626157],[2026,"Kawhi Leonard",62,28,6.3,3.6,"F",202695],[2026,"Kevin Durant",75,25.9,5.4,4.8,"F",201142],[2026,"Khris Middleton",58,10.4,3.8,2.9,"F",203114],[2026,"Klay Thompson",66,11.8,2.1,1.4,"G",202691],[2026,"LaMelo Ball",69,19.8,4.8,7.2,"G",1630163],[2026,"LeBron James",56,20.6,6,6.9,"F",2544],[2026,"Luka Dončić",64,33.5,7.7,8.3,"G",1629029],[2026,"Mikal Bridges",78,14.7,3.9,3.8,"G",1628969],[2026,"Mike Conley",52,4.4,1.7,2.9,"G",201144],[2026,"Nikola Jokić",62,27.9,12.9,10.9,"C",203999],[2026,"Paolo Banchero",68,22.2,8.4,5.1,"F",1631094],[2026,"Pascal Siakam",62,24,6.6,3.8,"F",1627783],[2026,"Rudy Gobert",75,11,11.5,1.7,"C",203497],[2026,"Russell Westbrook",64,15.2,5.4,6.7,"G",201566],[2026,"Shai Gilgeous-Alexander",66,31.4,4.4,6.5,"G",1628983],[2026,"Victor Wembanyama",62,24.9,11.6,3.1,"F",1641705],[2026,"Zion Williamson",62,21,5.7,3.2,"F",1629627]];
// Completed NBA career: [player, PPG, RPG, APG, NBA id].
const CAREER_STATS: readonly (readonly [string,number,number,number,number|null])[] = [["Michael Jordan",30.1,6.2,5.3,893],["Kobe Bryant",25,5.2,4.7,977],["Tim Duncan",19,10.8,3,1495],["Shaquille O'Neal",23.7,10.9,2.5,406],["Kareem Abdul-Jabbar",24.6,11.2,3.6,null],["Magic Johnson",19.5,7.2,11.2,null],["Larry Bird",24.3,10,6.3,null],["Bill Russell",15.1,22.5,4.3,null],["Wilt Chamberlain",30.1,22.9,4.4,null],["Oscar Robertson",25.7,7.5,9.5,null],["Jerry West",27,5.8,6.7,null],["Hakeem Olajuwon",21.8,11.1,2.5,165],["Charles Barkley",22.1,11.7,3.9,787],["Karl Malone",25,10.1,3.6,252],["John Stockton",13.1,2.7,10.5,304],["Patrick Ewing",21,9.8,1.9,121],["David Robinson",21.1,10.6,2.5,764],["Allen Iverson",26.7,3.7,6.2,947],["Dirk Nowitzki",20.7,7.5,2.4,1717],["Kevin Garnett",17.8,10,3.7,708],["Dwyane Wade",22,4.7,5.4,2548],["Steve Nash",14.3,3,8.5,959],["Ray Allen",18.9,4.1,3.4,951],["Reggie Miller",18.2,3,3,397],["Isiah Thomas",19.2,3.6,9.3,null],["Chris Bosh",19.2,8.5,2,2547],["Dwight Howard",15.7,11.8,1.3,2730],["Carmelo Anthony",22.5,6.2,2.7,2546],["Vince Carter",16.7,4.3,3.1,1713],["Paul Pierce",19.7,5.6,3.5,1718],["Dominique Wilkins",24.8,6.7,2.5,1122],["Clyde Drexler",20.4,6.1,5.6,17],["Moses Malone",20.6,12.2,1.4,null]];
export interface NbaHitSubject {
  id: string;
  name: string;
  subtitle: string;
  season: number | null;
  scope: NbaHitStatScope;
  role: "G" | "F" | "C";
  nbaId: number | null;
  values: Readonly<Record<NbaHitMetric, number>>;
}
const seasonSubjects: NbaHitSubject[] = SEASON_STATS.map(([endYear,name,games,points,rebounds,assists,role,nbaId])=>({
  id: `season-${endYear}:${name}`, name,
  subtitle: `${endYear-1}–${String(endYear).slice(-2)} season · ${games} GP`,
  season: endYear, scope: "season", role: role === "C" ? "C" : role === "G" ? "G" : "F",
  nbaId, values: {points,rebounds,assists},
}));
const CAREER_GUARDS = new Set(["Michael Jordan","Kobe Bryant","Magic Johnson","Oscar Robertson","Jerry West","John Stockton","Allen Iverson","Dwyane Wade","Steve Nash","Ray Allen","Reggie Miller","Isiah Thomas","Vince Carter","Clyde Drexler"]);
const CAREER_CENTERS = new Set(["Tim Duncan","Shaquille O\'Neal","Kareem Abdul-Jabbar","Bill Russell","Wilt Chamberlain","Hakeem Olajuwon","Patrick Ewing","David Robinson","Dwight Howard","Moses Malone"]);
const careerSubjects: NbaHitSubject[] = CAREER_STATS.map(([name,points,rebounds,assists,nbaId])=>({
  id: `career:${name}`, name, subtitle: "NBA regular-season career",
  season: null, scope: "career", role: CAREER_GUARDS.has(name) ? "G" : CAREER_CENTERS.has(name) ? "C" : "F", nbaId,
  values: {points,rebounds,assists},
}));
export const nbaHitSubjects: readonly NbaHitSubject[] = [...seasonSubjects,...careerSubjects];
export const nbaHitSubjectById = new Map(nbaHitSubjects.map(s=>[s.id,s]));
export function nbaHitSubjectsFor(statId: NbaHitStat, season?: number) {
  const scope = statId.startsWith("career-") ? "career" : "season";
  return nbaHitSubjects.filter(s=>s.scope===scope && (scope==="career" || season==null || s.season===season));
}
export function nbaHitValue(subject: NbaHitSubject, statId: NbaHitStat) {
  const stat = statId.split("-")[1] as NbaHitMetric;
  return subject.values[stat];
}
export function nbaHitHeadshot(subject: NbaHitSubject) {
  return subject.nbaId == null ? null : `https://cdn.nba.com/headshots/nba/latest/1040x760/${subject.nbaId}.png`;
}
