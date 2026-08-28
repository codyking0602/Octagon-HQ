import { footballCfbChampionSeasonRows, footballQbCareerRows, footballRbCareerRows } from "./footballFactualStatsCoverage";
import { footballFindLeaderProjectedFactualRecords } from "./footballFindLeaderRuntimeProjection";
import { expandedFootballFactSources, expandedFootballFactualRecords } from "./footballFactualStatsExpansion";
import { footballFactualUniverseProjectedRecords, footballFactualUniverseSources } from "./footballFactualUniverseProjection";
import { getFootballSubject } from "./footballSubjectRegistry";

export type FootballFactScope =
  | "nfl-player-career" | "nfl-player-season" | "nfl-team-season" | "nfl-franchise" | "nfl-game"
  | "cfb-player-career" | "cfb-team-season" | "cfb-coach-career" | "cfb-program" | "cfb-program-era" | "cfb-game";

export type FootballFactUnit = "count" | "yards" | "points" | "points-per-game" | "rating" | "flag" | "percent" | "per-game" | "per-attempt" | "ratio";
export interface FootballFactMetricDefinition { id: string; label: string; unit: FootballFactUnit; decimals: 0 | 1 | 2; }
const metric = (id: string, label: string, unit: FootballFactUnit, decimals: 0 | 1 | 2): FootballFactMetricDefinition => ({ id, label, unit, decimals });

export const footballFactMetricDefinitions = [
  metric("nfl-career-games", "Career games", "count", 0),
  metric("nfl-career-passing-completions", "Career completions", "count", 0),
  metric("nfl-career-passing-attempts", "Career pass attempts", "count", 0),
  metric("nfl-career-interceptions-thrown", "Career interceptions thrown", "count", 0),
  metric("nfl-career-passer-rating", "Career passer rating", "rating", 1),
  metric("nfl-career-completion-percentage", "Career completion percentage", "percent", 1),
  metric("nfl-career-passing-yards-per-attempt", "Career passing yards per attempt", "per-attempt", 2),
  metric("nfl-career-passing-touchdown-percentage", "Career passing touchdown percentage", "percent", 2),
  metric("nfl-career-passing-yards-per-game", "Career passing yards per game", "per-game", 1),
  metric("nfl-career-passing-touchdowns-per-game", "Career passing touchdowns per game", "per-game", 2),
  metric("nfl-career-passing-completions-per-game", "Career completions per game", "per-game", 1),
  metric("nfl-career-passing-attempts-per-game", "Career pass attempts per game", "per-game", 1),
  metric("nfl-career-passing-touchdown-interception-ratio", "Career touchdown-to-interception ratio", "ratio", 2),
  metric("nfl-career-passing-yards", "Career passing yards", "yards", 0),
  metric("nfl-career-passing-touchdowns", "Career passing TD", "count", 0),
  metric("nfl-career-rushing-attempts", "Career rushing attempts", "count", 0),
  metric("nfl-career-rushing-yards", "Career rushing yards", "yards", 0),
  metric("nfl-career-rushing-touchdowns", "Career rushing TD", "count", 0),
  metric("nfl-career-rushing-yards-per-attempt", "Career rushing yards per attempt", "per-attempt", 2),
  metric("nfl-career-rushing-yards-per-game", "Career rushing yards per game", "per-game", 1),
  metric("nfl-career-rushing-touchdowns-per-game", "Career rushing touchdowns per game", "per-game", 2),
  metric("nfl-career-receptions", "Career receptions", "count", 0),
  metric("nfl-career-targets", "Career targets", "count", 0),
  metric("nfl-career-receiving-yards", "Career receiving yards", "yards", 0),
  metric("nfl-career-receiving-touchdowns", "Career receiving TD", "count", 0),
  metric("nfl-career-receptions-per-game", "Career receptions per game", "per-game", 1),
  metric("nfl-career-receiving-yards-per-game", "Career receiving yards per game", "per-game", 1),
  metric("nfl-career-scrimmage-yards", "Career scrimmage yards", "yards", 0),
  metric("nfl-career-scrimmage-yards-per-game", "Career scrimmage yards per game", "per-game", 1),
  metric("nfl-career-scrimmage-touchdowns", "Career scrimmage touchdowns", "count", 0),
  metric("nfl-career-solo-tackles", "Career solo tackles", "count", 0),
  metric("nfl-career-tackles-for-loss", "Career tackles for loss", "count", 1),
  metric("nfl-career-forced-fumbles", "Career forced fumbles", "count", 0),
  metric("nfl-career-sacks", "Career sacks", "count", 1),
  metric("nfl-career-interceptions", "Career defensive interceptions", "count", 0),
  metric("nfl-career-passes-defended", "Career passes defended", "count", 0),
  metric("nfl-career-field-goals-made", "Career field goals made", "count", 0),
  metric("nfl-career-field-goals-attempted", "Career field goals attempted", "count", 0),
  metric("nfl-career-field-goal-percentage", "Career field-goal percentage", "percent", 1),
  metric("nfl-career-punts", "Career punts", "count", 0),
  metric("nfl-career-punting-yards", "Career punting yards", "yards", 0),
  metric("nfl-career-punting-average", "Career punting average", "per-attempt", 1),
  metric("nfl-ap-mvp-awards", "AP MVP awards", "count", 0),
  metric("nfl-super-bowl-titles", "Super Bowl titles", "count", 0),
  metric("nfl-defensive-player-of-year-awards", "Defensive Player of the Year awards", "count", 0),
  metric("nfl-first-team-all-pros", "First-team All-Pro selections", "count", 0),
  metric("nfl-season-passing-yards", "Season passing yards", "yards", 0),
  metric("nfl-season-passing-touchdowns", "Season passing TD", "count", 0),
  metric("nfl-season-interceptions", "Season interceptions thrown", "count", 0),
  metric("nfl-season-passer-rating", "Season passer rating", "rating", 1),
  metric("nfl-team-overall-wins", "Overall wins", "count", 0),
  metric("nfl-team-overall-losses", "Overall losses", "count", 0),
  metric("nfl-team-overall-ties", "Overall ties", "count", 0),
  metric("nfl-team-points-for", "Points for", "points", 0),
  metric("nfl-team-points-against", "Points against", "points", 0),
  metric("nfl-team-points-per-game", "Points per game", "points-per-game", 1),
  metric("nfl-team-opponent-points-per-game", "Opponent points per game", "points-per-game", 1),
  metric("nfl-team-point-differential", "Point differential", "points", 0),
  metric("nfl-team-postseason-wins", "Postseason wins", "count", 0),
  metric("nfl-team-playoff-berth", "Playoff berth", "flag", 0),
  metric("nfl-team-conference-championship-game", "Conference championship game", "flag", 0),
  metric("nfl-team-super-bowl-appearance", "Super Bowl appearance", "flag", 0),
  metric("nfl-super-bowl-title", "Super Bowl title", "flag", 0),
  metric("nfl-team-passing-yards", "Team passing yards", "yards", 0),
  metric("nfl-team-rushing-yards", "Team rushing yards", "yards", 0),
  metric("nfl-team-defensive-sacks", "Team defensive sacks", "count", 1),
  metric("nfl-team-defensive-interceptions", "Team defensive interceptions", "count", 0),
  metric("nfl-franchise-wins-since-1999", "Franchise wins since 1999", "count", 0),
  metric("nfl-franchise-losses-since-1999", "Franchise losses since 1999", "count", 0),
  metric("nfl-franchise-playoff-wins-since-1999", "Franchise playoff wins since 1999", "count", 0),
  metric("nfl-franchise-super-bowl-appearances-since-1999", "Franchise Super Bowl appearances since 1999", "count", 0),
  metric("nfl-franchise-super-bowl-titles-since-1999", "Franchise Super Bowl titles since 1999", "count", 0),
  metric("cfb-career-games", "College career games", "count", 0),
  metric("cfb-career-passing-completions", "College career completions", "count", 0),
  metric("cfb-career-passing-attempts", "College career pass attempts", "count", 0),
  metric("cfb-career-passing-yards", "College career passing yards", "yards", 0),
  metric("cfb-career-passing-touchdowns", "College career passing TD", "count", 0),
  metric("cfb-career-interceptions-thrown", "College career interceptions thrown", "count", 0),
  metric("cfb-career-rushing-attempts", "College career rushing attempts", "count", 0),
  metric("cfb-career-rushing-yards", "College career rushing yards", "yards", 0),
  metric("cfb-career-rushing-touchdowns", "College career rushing TD", "count", 0),
  metric("cfb-career-receptions", "College career receptions", "count", 0),
  metric("cfb-career-targets", "College career targets", "count", 0),
  metric("cfb-career-receiving-yards", "College career receiving yards", "yards", 0),
  metric("cfb-career-receiving-touchdowns", "College career receiving TD", "count", 0),
  metric("cfb-career-total-touchdowns", "College career total TD", "count", 0),
  metric("cfb-career-defensive-interceptions", "College career defensive interceptions", "count", 0),
  metric("cfb-career-sacks", "College career sacks", "count", 1),
  metric("cfb-career-pass-breakups", "College career pass breakups", "count", 0),
  metric("cfb-career-forced-fumbles", "College career forced fumbles", "count", 0),
  metric("cfb-career-fumble-recoveries", "College career fumble recoveries", "count", 0),
  metric("cfb-career-field-goals-made", "College career field goals made", "count", 0),
  metric("cfb-career-field-goals-attempted", "College career field goals attempted", "count", 0),
  metric("cfb-career-field-goal-percentage", "College career field-goal percentage", "percent", 1),
  metric("cfb-best-season-passing-yards", "Best-season passing yards", "yards", 0),
  metric("cfb-best-season-passing-touchdowns", "Best-season passing TD", "count", 0),
  metric("cfb-best-season-interceptions", "Best-season interceptions thrown", "count", 0),
  metric("cfb-best-season-passer-rating", "Best-season passer rating", "rating", 1),
  metric("cfb-best-season-rushing-yards", "Best-season rushing yards", "yards", 0),
  metric("cfb-best-season-rushing-touchdowns", "Best-season rushing TD", "count", 0),
  metric("cfb-best-season-receptions", "Best-season receptions", "count", 0),
  metric("cfb-best-season-receiving-yards", "Best-season receiving yards", "yards", 0),
  metric("cfb-best-season-receiving-touchdowns", "Best-season receiving TD", "count", 0),
  metric("cfb-best-season-sacks", "Best-season sacks", "count", 1),
  metric("cfb-best-season-tackles-for-loss", "Best-season tackles for loss", "count", 1),
  metric("cfb-best-season-defensive-interceptions", "Best-season defensive interceptions", "count", 0),
  metric("cfb-heisman-awards", "Heisman Trophy wins", "count", 0),
  metric("cfb-team-wins", "Wins", "count", 0),
  metric("cfb-team-losses", "Losses", "count", 0),
  metric("cfb-team-ties", "Ties", "count", 0),
  metric("cfb-team-points-for", "Points for", "points", 0),
  metric("cfb-team-points-against", "Points against", "points", 0),
  metric("cfb-team-points-per-game", "Points per game", "points-per-game", 1),
  metric("cfb-team-opponent-points-per-game", "Opponent points per game", "points-per-game", 1),
  metric("cfb-team-point-differential", "Point differential", "points", 0),
  metric("cfb-team-scoring-margin-per-game", "Scoring margin per game", "points-per-game", 1),
  metric("cfb-team-points-for-against-ratio", "Points-for to points-against ratio", "ratio", 2),
  metric("cfb-team-differential-rate-percentage", "Point differential rate", "percent", 1),
  metric("cfb-team-total-points", "Total points", "points", 0),
  metric("cfb-team-postseason-wins", "Postseason wins", "count", 0),
  metric("cfb-team-conference-wins", "Conference wins", "count", 0),
  metric("cfb-team-conference-losses", "Conference losses", "count", 0),
  metric("cfb-team-srs", "SRS", "rating", 2),
  metric("cfb-team-sos", "SOS", "rating", 2),
  metric("cfb-national-title", "National title", "flag", 0),
  metric("cfb-coach-career-wins", "Career wins", "count", 0),
  metric("cfb-coach-career-losses", "Career losses", "count", 0),
  metric("cfb-coach-career-ties", "Career ties", "count", 0),
  metric("cfb-coach-national-titles", "National titles", "count", 0),
  metric("cfb-coach-conference-titles", "Conference titles", "count", 0),
  metric("cfb-program-wins-since-2000", "Wins since 2000", "count", 0),
  metric("cfb-program-losses-since-2000", "Losses since 2000", "count", 0),
  metric("cfb-program-postseason-wins-since-2000", "Postseason wins since 2000", "count", 0),
  metric("cfb-program-national-titles-since-2000", "National titles since 2000", "count", 0),
  metric("cfb-program-conference-titles-since-2000", "Conference titles since 2000", "count", 0),
  metric("cfb-program-cfp-appearances", "CFP appearances", "count", 0),
  metric("cfb-program-title-game-appearances-since-2000", "National title-game appearances since 2000", "count", 0),
  metric("cfb-era-wins", "Era wins", "count", 0), metric("cfb-era-losses", "Era losses", "count", 0), metric("cfb-era-national-titles", "Era national titles", "count", 0),
  metric("cfb-era-conference-titles", "Era conference titles", "count", 0), metric("cfb-era-cfp-appearances", "Era CFP appearances", "count", 0), metric("cfb-era-title-game-appearances", "Era national title-game appearances", "count", 0),
  metric("football-game-home-score", "Home score", "points", 0), metric("football-game-away-score", "Away score", "points", 0), metric("football-game-margin", "Final margin", "points", 0),
  metric("football-game-overtime", "Overtime", "flag", 0), metric("football-game-postseason", "Postseason game", "flag", 0), metric("football-game-championship", "Championship game", "flag", 0),
] as const;

export type FootballFactMetricId = (typeof footballFactMetricDefinitions)[number]["id"];
export type FootballFactSourceId = string;
export interface FootballFactSource { id: FootballFactSourceId; publisher: string; title: string; url: string; reviewedOn: string; coverage: string; }
export interface FootballFactEvidence { sourceIds: readonly FootballFactSourceId[]; kind: "reported" | "derived"; formula?: string; }
export interface FootballFactValue { metricId: FootballFactMetricId; value: number; evidence: FootballFactEvidence; }
export interface FootballFactualRecord { subjectId: string; scope: FootballFactScope; scopes?: readonly FootballFactScope[]; facts: readonly FootballFactValue[]; }

const seedSources: readonly FootballFactSource[] = [
  { id: "pfr-peyton-manning", publisher: "Pro Football Reference", title: "Peyton Manning player record", url: "https://www.pro-football-reference.com/players/M/MannPe00.htm", reviewedOn: "2026-08-22", coverage: "Completed NFL career through 2015" },
  { id: "pfr-dan-marino", publisher: "Pro Football Reference", title: "Dan Marino player record", url: "https://www.pro-football-reference.com/players/M/MariDa00.htm", reviewedOn: "2026-08-22", coverage: "Completed NFL career through 1999" },
  { id: "pfr-john-elway", publisher: "Pro Football Reference", title: "John Elway player record", url: "https://www.pro-football-reference.com/players/E/ElwaJo00.htm", reviewedOn: "2026-08-22", coverage: "Completed NFL career through 1998" },
  { id: "pfr-emmitt-smith", publisher: "Pro Football Reference", title: "Emmitt Smith player record", url: "https://www.pro-football-reference.com/players/S/SmitEm00.htm", reviewedOn: "2026-08-22", coverage: "Completed NFL career through 2004" },
  { id: "pfr-barry-sanders", publisher: "Pro Football Reference", title: "Barry Sanders player record", url: "https://www.pro-football-reference.com/players/S/SandBa00.htm", reviewedOn: "2026-08-22", coverage: "Completed NFL career through 1998" },
  { id: "pfr-career-stat-lines", publisher: "Pro Football Reference", title: "NFL retired-player career stat lines", url: "https://www.pro-football-reference.com/", reviewedOn: "2026-08-22", coverage: "Reviewed compatibility career stat lines" },
  { id: "pfr-pass-yards-career", publisher: "Pro Football Reference", title: "NFL Passing Yards Career Leaders", url: "https://www.pro-football-reference.com/leaders/pass_yds_career.htm", reviewedOn: "2026-08-22", coverage: "Canonical quarterback compatibility pool" },
  { id: "pfr-rush-yards-career", publisher: "Pro Football Reference", title: "NFL Rushing Yards Career Leaders", url: "https://www.pro-football-reference.com/leaders/rush_yds_career.htm", reviewedOn: "2026-08-22", coverage: "Canonical running-back compatibility pool" },
  { id: "cfr-champion-season-stat-lines", publisher: "College Football at Sports-Reference", title: "National-champion season stat lines", url: "https://www.sports-reference.com/cfb/", reviewedOn: "2026-08-25", coverage: "Reviewed champion-season compatibility facts" },
  ...["1995-nebraska","2001-miami","2005-texas","2008-florida","2010-auburn","2013-florida-state","2014-ohio-state","2018-clemson","2019-lsu","2020-alabama","2022-georgia"].map((slug) => ({ id: `cfr-${slug}`, publisher: "College Football at Sports-Reference", title: `${slug} team record`, url: "https://www.sports-reference.com/cfb/", reviewedOn: "2026-08-22", coverage: "Completed season" })),
  { id: "nflverse-find-leader-projection", publisher: "nflverse", title: "Pinned NFL historical player/team projection for Find the Leader", url: "https://github.com/nflverse/nflverse-data", reviewedOn: "2026-08-26", coverage: "Normalized 1999-2025 Find the Leader projection" },
  { id: "cfbfast-r-find-leader-projection", publisher: "cfbfastR", title: "Pinned CFB historical player/team projection for Find the Leader", url: "https://github.com/sportsdataverse/cfbfastR-data", reviewedOn: "2026-08-26", coverage: "Normalized CFB Find the Leader projection" },
];
export const footballFactSources: readonly FootballFactSource[] = [...seedSources, ...expandedFootballFactSources, ...footballFactualUniverseSources];

const reported = (sourceId: FootballFactSourceId, metricId: FootballFactMetricId, value: number): FootballFactValue => ({ metricId, value, evidence: { sourceIds: [sourceId], kind: "reported" } });
const derived = (sourceId: FootballFactSourceId, metricId: FootballFactMetricId, value: number, formula: string): FootballFactValue => ({ metricId, value, evidence: { sourceIds: [sourceId], kind: "derived", formula } });
const championRecords: Readonly<Record<string, readonly [number, number]>> = {
  "1995-nebraska":[12,0],"1996-florida":[12,1],"1997-michigan":[12,0],"1998-tennessee":[13,0],"1999-florida-state":[12,0],"2000-oklahoma":[13,0],"2001-miami":[12,0],"2002-ohio-state":[14,0],"2003-lsu":[13,1],"2004-usc":[13,0],"2005-texas":[13,0],"2006-florida":[13,1],"2007-lsu":[12,2],"2008-florida":[13,1],"2009-alabama":[14,0],"2010-auburn":[14,0],"2011-alabama":[12,1],"2012-alabama":[13,1],"2013-florida-state":[14,0],"2014-ohio-state":[14,1],"2015-alabama":[14,1],"2017-alabama":[13,1],"2018-clemson":[15,0],"2019-lsu":[15,0],"2020-alabama":[13,0],"2021-georgia":[14,1],"2022-georgia":[15,0],
};
function nflPasserRating(c: number, a: number, y: number, td: number, interceptions: number) { const aa=Math.min(2.375,Math.max(0,(c/a-.3)*5)); const b=Math.min(2.375,Math.max(0,(y/a-3)*.25)); const cc=Math.min(2.375,Math.max(0,td/a*20)); const d=Math.min(2.375,Math.max(0,2.375-interceptions/a*25)); return (aa+b+cc+d)/6*100; }

const compatibilityFactualRecords: readonly FootballFactualRecord[] = [
  ...footballQbCareerRows.map((row): FootballFactualRecord => { const sourceId = ({"peyton-manning":"pfr-peyton-manning","dan-marino":"pfr-dan-marino","john-elway":"pfr-john-elway"} as Record<string,string>)[row.id] ?? "pfr-career-stat-lines"; return { subjectId: row.id, scope: "nfl-player-career", facts: [
    reported(sourceId,"nfl-career-games",row.games),reported(sourceId,"nfl-career-passing-completions",row.completions),reported(sourceId,"nfl-career-passing-attempts",row.attempts),reported(sourceId,"nfl-career-passing-yards",row.passingYards),reported(sourceId,"nfl-career-passing-touchdowns",row.passingTouchdowns),reported(sourceId,"nfl-career-interceptions-thrown",row.interceptions),
    derived(sourceId,"nfl-career-passer-rating",nflPasserRating(row.completions,row.attempts,row.passingYards,row.passingTouchdowns,row.interceptions),"NFL passer-rating formula from completions, attempts, passing yards, passing touchdowns, and interceptions"),derived(sourceId,"nfl-career-completion-percentage",row.completions/row.attempts*100,"passing completions / passing attempts * 100"),derived(sourceId,"nfl-career-passing-yards-per-attempt",row.passingYards/row.attempts,"passing yards / passing attempts"),derived(sourceId,"nfl-career-passing-touchdown-percentage",row.passingTouchdowns/row.attempts*100,"passing touchdowns / passing attempts * 100"),derived(sourceId,"nfl-career-passing-yards-per-game",row.passingYards/row.games,"passing yards / games"),derived(sourceId,"nfl-career-passing-touchdowns-per-game",row.passingTouchdowns/row.games,"passing touchdowns / games"),derived(sourceId,"nfl-career-passing-completions-per-game",row.completions/row.games,"passing completions / games"),derived(sourceId,"nfl-career-passing-attempts-per-game",row.attempts/row.games,"passing attempts / games"),derived(sourceId,"nfl-career-passing-touchdown-interception-ratio",row.passingTouchdowns/row.interceptions,"passing touchdowns / interceptions"),
    ...(row.id === "peyton-manning" ? [reported(sourceId,"nfl-ap-mvp-awards",5),reported(sourceId,"nfl-super-bowl-titles",2)] : row.id === "dan-marino" ? [reported(sourceId,"nfl-ap-mvp-awards",1),reported(sourceId,"nfl-super-bowl-titles",0)] : row.id === "john-elway" ? [reported(sourceId,"nfl-ap-mvp-awards",1),reported(sourceId,"nfl-super-bowl-titles",2)] : []),
  ] }; }),
  ...footballRbCareerRows.map((row): FootballFactualRecord => { const sourceId=({"emmitt-smith":"pfr-emmitt-smith","barry-sanders":"pfr-barry-sanders"} as Record<string,string>)[row.id] ?? "pfr-career-stat-lines"; const scrimmage=row.rushingYards+row.receivingYards; return { subjectId:row.id,scope:"nfl-player-career",facts:[reported(sourceId,"nfl-career-games",row.games),reported(sourceId,"nfl-career-rushing-attempts",row.rushingAttempts),reported(sourceId,"nfl-career-rushing-yards",row.rushingYards),reported(sourceId,"nfl-career-rushing-touchdowns",row.rushingTouchdowns),reported(sourceId,"nfl-career-receptions",row.receptions),reported(sourceId,"nfl-career-receiving-yards",row.receivingYards),reported(sourceId,"nfl-career-receiving-touchdowns",row.receivingTouchdowns),derived(sourceId,"nfl-career-rushing-yards-per-attempt",row.rushingYards/row.rushingAttempts,"rushing yards / rushing attempts"),derived(sourceId,"nfl-career-rushing-yards-per-game",row.rushingYards/row.games,"rushing yards / games"),derived(sourceId,"nfl-career-rushing-touchdowns-per-game",row.rushingTouchdowns/row.games,"rushing touchdowns / games"),derived(sourceId,"nfl-career-receptions-per-game",row.receptions/row.games,"receptions / games"),derived(sourceId,"nfl-career-receiving-yards-per-game",row.receivingYards/row.games,"receiving yards / games"),derived(sourceId,"nfl-career-scrimmage-yards",scrimmage,"rushing yards + receiving yards"),derived(sourceId,"nfl-career-scrimmage-yards-per-game",scrimmage/row.games,"(rushing yards + receiving yards) / games"),derived(sourceId,"nfl-career-scrimmage-touchdowns",row.rushingTouchdowns+row.receivingTouchdowns,"rushing touchdowns + receiving touchdowns")] }; }),
  ...footballCfbChampionSeasonRows.map((row): FootballFactualRecord => { const sourceId=({"1995-nebraska":"cfr-1995-nebraska","2001-miami":"cfr-2001-miami","2005-texas":"cfr-2005-texas","2008-florida":"cfr-2008-florida","2010-auburn":"cfr-2010-auburn","2013-florida-state":"cfr-2013-florida-state","2014-ohio-state":"cfr-2014-ohio-state","2018-clemson":"cfr-2018-clemson","2019-lsu":"cfr-2019-lsu","2020-alabama":"cfr-2020-alabama","2022-georgia":"cfr-2022-georgia"} as Record<string,string>)[row.id] ?? "cfr-champion-season-stat-lines"; const wl=championRecords[row.id]; return { subjectId:row.id,scope:"cfb-team-season",facts:[...(wl ? [reported(sourceId,"cfb-team-wins",wl[0]),reported(sourceId,"cfb-team-losses",wl[1])] : []),reported(sourceId,"cfb-team-points-for",row.pointsFor),reported(sourceId,"cfb-team-points-against",row.pointsAgainst),reported(sourceId,"cfb-team-points-per-game",row.pointsPerGame),reported(sourceId,"cfb-team-opponent-points-per-game",row.opponentPointsPerGame),reported(sourceId,"cfb-team-srs",row.srs),reported(sourceId,"cfb-team-sos",row.sos),reported(sourceId,"cfb-national-title",1),derived(sourceId,"cfb-team-point-differential",row.pointsFor-row.pointsAgainst,"points for - points against"),derived(sourceId,"cfb-team-scoring-margin-per-game",row.pointsPerGame-row.opponentPointsPerGame,"points per game - opponent points per game"),derived(sourceId,"cfb-team-points-for-against-ratio",row.pointsFor/row.pointsAgainst,"points for / points against"),derived(sourceId,"cfb-team-differential-rate-percentage",(row.pointsFor-row.pointsAgainst)/row.pointsFor*100,"(points for - points against) / points for * 100"),derived(sourceId,"cfb-team-total-points",row.pointsFor+row.pointsAgainst,"points for + points against")] }; }),
];

function canonicalFactSubjectId(subjectId: string) { return getFootballSubject(subjectId)?.id ?? subjectId; }
function mergeCanonicalFactualRecords(records: readonly FootballFactualRecord[]) {
  const bySubject = new Map<string, FootballFactualRecord>();
  for (const incoming of records) {
    const subjectId=canonicalFactSubjectId(incoming.subjectId); const incomingScopes=incoming.scopes ?? [incoming.scope]; const current=bySubject.get(subjectId);
    if (!current) { bySubject.set(subjectId,{...incoming,subjectId,scopes:[...incomingScopes]}); continue; }
    const facts=new Map(current.facts.map((row)=>[row.metricId,row]));
    for (const row of incoming.facts) { const existing=facts.get(row.metricId); if (existing && existing.value !== row.value) throw new Error(`Conflicting canonical Football fact: ${subjectId}:${row.metricId}`); if (!existing) facts.set(row.metricId,row); }
    bySubject.set(subjectId,{...current,scopes:[...new Set([...(current.scopes ?? [current.scope]),...incomingScopes])],facts:[...facts.values()]});
  }
  return [...bySubject.values()];
}
function projectedGapFillRecords(projected: readonly FootballFactualRecord[], owned: readonly FootballFactualRecord[]) {
  const ownedKeys=new Set(owned.flatMap((record)=>record.facts.map((fact)=>`${record.subjectId}:${fact.metricId}`)));
  return projected.flatMap((record)=>{ const canonicalSubject=getFootballSubject(record.subjectId); if (!canonicalSubject) return []; const subjectId=canonicalSubject.id; const facts=record.facts.filter((fact)=>!ownedKeys.has(`${subjectId}:${fact.metricId}`)); return facts.length ? [{...record,subjectId,facts}] : []; });
}

const preStage13FactualRecords=mergeCanonicalFactualRecords([...compatibilityFactualRecords,...expandedFootballFactualRecords]);
const stage13GapFillFactualRecords=projectedGapFillRecords(footballFactualUniverseProjectedRecords,preStage13FactualRecords);
export const footballFactualRecords: readonly FootballFactualRecord[]=mergeCanonicalFactualRecords([...preStage13FactualRecords,...stage13GapFillFactualRecords]);
const findLeaderGapFillFactualRecords=projectedGapFillRecords(footballFindLeaderProjectedFactualRecords,footballFactualRecords);
const footballFactualLookupRecords: readonly FootballFactualRecord[]=mergeCanonicalFactualRecords([...footballFactualRecords,...findLeaderGapFillFactualRecords]);
const recordIds=footballFactualLookupRecords.map((record)=>record.subjectId); if (new Set(recordIds).size !== recordIds.length) throw new Error("Canonical Football factual lookup ledger contains duplicate subject records.");
const recordsBySubjectId=new Map(footballFactualLookupRecords.map((record)=>[record.subjectId,record]));
const metricDefinitionsById=new Map(footballFactMetricDefinitions.map((row)=>[row.id,row]));
const sourcesById=new Map(footballFactSources.map((source)=>[source.id,source]));
export function getFootballFactualRecord(subjectId: string) { return recordsBySubjectId.get(canonicalFactSubjectId(subjectId)) ?? null; }
export function getFootballFact(subjectId: string, metricId: FootballFactMetricId) { const record=getFootballFactualRecord(subjectId); const found=record?.facts.find((row)=>row.metricId===metricId); if (!record || !found) return null; const definition=metricDefinitionsById.get(metricId); if (!definition) throw new Error(`Missing Football fact metric definition: ${metricId}`); const sources=found.evidence.sourceIds.map((id)=>{ const source=sourcesById.get(id); if (!source) throw new Error(`Missing Football fact source: ${id}`); return source; }); return {record,fact:found,definition,sources}; }
export function formatFootballFact(metricId: FootballFactMetricId,value:number) { const definition=metricDefinitionsById.get(metricId); if (!definition) throw new Error(`Missing Football fact metric definition: ${metricId}`); if (definition.unit === "flag") return value===1 ? "Yes" : "No"; const formatted=value.toLocaleString("en-US",{minimumFractionDigits:definition.decimals,maximumFractionDigits:definition.decimals}); return definition.unit === "percent" ? `${formatted}%` : formatted; }
