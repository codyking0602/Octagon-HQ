import { BUILD_QB_TRAITS, type BuildQbTrait } from "../play/draftRoomContract";

export const CFB_BUILD_QB_TRAIT_MODEL_VERSION = "cfb-build-qb-peak-season-v3" as const;
export const CFB_BUILD_QB_MATURE_POOL_SIZE = 80 as const;
export const CFB_BUILD_QB_RESEARCH_SNAPSHOT_DATE = "2026-09-13" as const;

export const CFB_BUILD_QB_RESEARCH_SOURCES = [
  { id: "canonical-cfb-source", evidenceType: "statistics", source: "Pinned cfbfastR player-season-team corpus in data/generated/football/cfb/player-seasons-2014-2025.json" },
  { id: "sports-reference-cfb", evidenceType: "statistics", source: "Sports-Reference College Football exact player-season pages for historical and cross-check coverage (https://www.sports-reference.com/cfb/)" },
  { id: "canonical-cfb-recognition", evidenceType: "identity", source: "Octagon HQ canonical CFB player-season recognition and subject registry" },
  { id: "canonical-cfb-history", evidenceType: "historical", source: "Octagon HQ reviewed CFB historical facts, awards, team results and comparison evidence" },
  { id: "film-audit", evidenceType: "film-scouting", source: "Reviewed exact college-season arm talent, placement, processing, movement and creation tape" },
  { id: "high-leverage-audit", evidenceType: "high-leverage", source: "Reviewed selected-season rivalry, conference-title, bowl/playoff and late-game context where applicable" },
] as const;

type CfbBuildQbResearchLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CfbBuildQbQualityBand = 1 | 2 | 3 | 4 | 5;

export const CFB_BUILD_QB_TRAIT_RATING_BY_LEVEL: Readonly<Record<CfbBuildQbResearchLevel, number>> = {
  1: 35, 2: 42, 3: 50, 4: 60, 5: 69, 6: 78, 7: 86, 8: 93, 9: 99,
};

export const CFB_BUILD_QB_GENERATION_WEIGHT_BY_RARITY: Readonly<Record<CfbBuildQbQualityBand, number>> = {
  1: 1.00,
  2: 1.25,
  3: 1.15,
  4: 0.70,
  5: 0.18,
};

interface CfbBuildQbPeakAuditRow {
  name: string;
  peakSeason: number;
  school: string;
  canonicalPlayerId: string;
  sourceProvider: "octagon-hq" | "cfbfastR";
  qualityBand: CfbBuildQbQualityBand;
  researchLevels: Readonly<Record<BuildQbTrait, CfbBuildQbResearchLevel>>;
  evidenceSourceIds: readonly string[];
  auditSummary: string;
}

export interface CfbBuildQbTraitProfile {
  catalogId: string;
  peakSeasonIdentityId: string;
  canonicalPlayerId: string;
  sourceProvider: "octagon-hq" | "cfbfastR";
  name: string;
  peakSeason: number;
  school: string;
  qualityBand: CfbBuildQbQualityBand;
  generationWeight: number;
  traits: Readonly<Record<BuildQbTrait, number>>;
  overall: number;
  evidenceSourceIds: readonly string[];
  auditSummary: string;
}

function buildSlug(value: string) {
  return value.toLowerCase().normalize("NFKD")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function peak(
  name: string,
  peakSeason: number,
  school: string,
  canonicalPlayerId: string,
  qualityBand: CfbBuildQbQualityBand,
  levels: readonly CfbBuildQbResearchLevel[],
  auditSummary: string,
): CfbBuildQbPeakAuditRow {
  if (levels.length !== BUILD_QB_TRAITS.length) throw new Error(`Invalid CFB Build a QB research row for ${name}`);
  return {
    name,
    peakSeason,
    school,
    canonicalPlayerId,
    sourceProvider: canonicalPlayerId.startsWith("cfbfast-r-player-") ? "cfbfastR" : "octagon-hq",
    qualityBand,
    researchLevels: Object.fromEntries(BUILD_QB_TRAITS.map((trait, index) => [trait, levels[index]!])) as Readonly<Record<BuildQbTrait, CfbBuildQbResearchLevel>>,
    evidenceSourceIds: [
      peakSeason >= 2014 ? "canonical-cfb-source" : "sports-reference-cfb",
      "canonical-cfb-history",
      "film-audit",
      "high-leverage-audit",
    ],
    auditSummary,
  };
}

/**
 * Canonical Build a QB peak-season owner.
 * Every row owns exactly one college season and school; all five research inputs
 * describe that same season. NFL performance and cross-season best-trait mixing are prohibited.
 */
export const CFB_BUILD_QB_PEAK_SEASON_AUDIT: readonly CfbBuildQbPeakAuditRow[] = [
  peak("Cam Newton", 2010, "Auburn", "cfb-cam-newton", 5, [8, 8, 7, 9, 9], "Arm: elite drive and vertical power on 2010 tape; Accuracy: efficient placement with fewer pure precision demands; Processing: decisive spread-option reads without an NFL-style burden; Mobility: historically dominant power, scramble, and designed-run value; Clutch: undefeated SEC and national-title closeouts."),
  peak("Vince Young", 2005, "Texas", "cfb-vince-young", 5, [8, 7, 7, 9, 9], "Arm: high-end velocity and deep-field capability; Accuracy: effective but less consistently surgical than the elite pocket passers; Processing: decisive in Texas spread concepts; Mobility: generational open-field creation; Clutch: iconic undefeated title run capped by the USC comeback."),
  peak("Tim Tebow", 2007, "Florida", "cfb-tim-tebow", 4, [7, 7, 7, 9, 8], "Arm: above-average college power without elite pure velocity; Accuracy: productive and efficient inside Florida's structure; Processing: strong option and leverage decisions; Mobility: elite power-running quarterback value; Clutch: major-game résumé is excellent despite not being spotless in the selected season."),
  peak("Matt Leinart", 2004, "USC", "cfb-matt-leinart", 4, [7, 8, 8, 5, 9], "Arm: solid functional college arm; Accuracy: consistently precise in USC's vertical timing game; Processing: advanced command of a loaded pro-style offense; Mobility: enough pocket movement but limited creation; Clutch: elite late-game and championship-stage résumé."),
  peak("Johnny Manziel", 2012, "Texas A&M", "cfb-johnny-manziel", 4, [7, 7, 6, 9, 8], "Arm: enough power for explosive off-platform throws; Accuracy: dangerous but volatile outside structure; Processing: more creation-led than anticipation-led; Mobility: generational scramble and improvised rushing threat; Clutch: repeatedly delivered in high-leverage SEC moments."),
  peak("Colt McCoy", 2008, "Texas", "cfb-colt-mccoy", 3, [6, 9, 8, 7, 8], "Arm: functional rather than rare power; Accuracy: elite short and intermediate placement in 2008; Processing: fast distributor with strong pre-snap command; Mobility: real designed-run and scramble value; Clutch: excellent big-game record with a few limits against top defenses."),
  peak("Sam Bradford", 2008, "Oklahoma", "cfb-sam-bradford", 4, [8, 9, 8, 5, 8], "Arm: high-end drive strength from a compact release; Accuracy: elite placement and touch across Oklahoma's offense; Processing: fast spread reads and anticipation; Mobility: limited creator but adequate movement; Clutch: huge production and major wins with the title-game loss keeping the ceiling below the top tier."),
  peak("Jameis Winston", 2013, "Florida State", "cfb-jameis-winston", 5, [8, 8, 7, 6, 9], "Arm: plus velocity to every college level; Accuracy: aggressive placement with occasional risk; Processing: advanced full-field flashes but turnover-prone decisions; Mobility: useful movement without being a core weapon; Clutch: undefeated national-title season with repeated second-half responses."),
  peak("Robert Griffin III", 2011, "Baylor", "cfb-robert-griffin-iii", 5, [8, 9, 8, 9, 8], "Arm: explosive deep and boundary throwing ability; Accuracy: elite 2011 efficiency and ball placement; Processing: disciplined vertical-spread reads; Mobility: elite speed and open-field creation; Clutch: outstanding high-leverage season without a title-stage sample."),
  peak("Doug Flutie", 1984, "Boston College", "cfb-doug-flutie", 3, [7, 7, 7, 8, 9], "Arm: strong enough for aggressive vertical play; Accuracy: effective but era-limited precision evidence; Processing: creative and decisive under pressure; Mobility: major scramble and movement value; Clutch: defining late-game résumé including the Miami finish."),
  peak("Aaron Rodgers", 2004, "California", "cfb-aaron-rodgers", 3, [8, 9, 8, 6, 7], "Arm: elite college drive talent but not yet the later-career outlier version; Accuracy: exceptional 2004 placement and efficiency; Processing: polished Tedford structure execution; Mobility: useful movement and pocket escape value; Clutch: strong season but less high-leverage team success than the all-time college peaks."),
  peak("Charlie Ward", 1993, "Florida State", "cfb-charlie-ward", 4, [7, 8, 8, 8, 9], "Arm: good functional power; Accuracy: consistently efficient placement; Processing: mature option and passing decisions; Mobility: dangerous runner and space creator; Clutch: Heisman and national-title level command in 1993."),
  peak("Andrew Luck", 2011, "Stanford", "cfb-andrew-luck", 4, [8, 9, 9, 7, 8], "Arm: high-end power with excellent layered touch; Accuracy: elite repeatable placement in 2011; Processing: exceptional pre-snap command and full-field decision quality; Mobility: strong functional athlete and pocket mover; Clutch: elite season leadership with the Fiesta Bowl loss keeping it below the absolute ceiling."),
  peak("Matt Ryan", 2007, "Boston College", "cfb-matt-ryan", 3, [7, 7, 8, 5, 9], "Arm: good but not rare pure power; Accuracy: high-volume 2007 production came with meaningful interception and completion volatility; Processing: carried a demanding pro-style passing burden; Mobility: mostly pocket-bound; Clutch: exceptional comeback and late-game résumé for Boston College."),
  peak("Jimmy Clausen", 2009, "Notre Dame", "cfb-jimmy-clausen", 3, [8, 9, 8, 4, 6], "Arm: strong vertical and boundary capability; Accuracy: elite 2009 efficiency and low-interception placement; Processing: polished pro-style execution; Mobility: limited beyond pocket movement; Clutch: individual late-game flashes were offset by a 6-6 team season."),
  peak("Sam Ehlinger", 2018, "Texas", "cfb-sam-ehlinger", 3, [7, 7, 7, 9, 9], "Arm: solid college power without elite drive velocity; Accuracy: dependable but not pinpoint across all levels; Processing: sturdy RPO and progression decisions; Mobility: elite short-yardage and designed-run production; Clutch: signature 2018 wins and repeated late-game toughness."),
  peak("Teddy Bridgewater", 2013, "Louisville", "cfb-teddy-bridgewater", 3, [7, 9, 9, 7, 8], "Arm: adequate-to-good drive strength; Accuracy: elite 2013 placement and completion efficiency; Processing: advanced anticipation and low-error decision profile; Mobility: useful escape ability without run-first volume; Clutch: consistently controlled high-leverage games."),
  peak("Russell Wilson", 2011, "Wisconsin", "cfb-russell-wilson", 4, [8, 9, 9, 8, 9], "Arm: high-end deep and outside-the-numbers power; Accuracy: elite 2011 placement and efficiency; Processing: veteran-level command and extremely clean decisions; Mobility: dynamic but selectively used creation; Clutch: Big Ten title and repeated late-game execution."),
  peak("Roger Staubach", 1963, "Navy", "cfb-roger-staubach", 4, [7, 8, 9, 9, 9], "Arm: strong era-adjusted passing capability; Accuracy: excellent relative precision for the era; Processing: elite field command and decision quality; Mobility: exceptional scrambling and option value; Clutch: Heisman-level leadership and defining high-pressure play."),
  peak("Troy Smith", 2006, "Ohio State", "cfb-troy-smith", 3, [8, 8, 8, 8, 8], "Arm: strong vertical and intermediate drive ability; Accuracy: efficient 2006 placement; Processing: mature spread and movement-game decisions; Mobility: dangerous designed and improvised runner; Clutch: dominant regular season tempered by the national-title loss."),
  peak("Brady Quinn", 2005, "Notre Dame", "cfb-brady-quinn", 2, [8, 7, 8, 5, 6], "Arm: high-end college velocity and vertical capability; Accuracy: productive but not elite placement consistency; Processing: advanced Weis-era pro-style responsibilities; Mobility: limited secondary value; Clutch: strong résumé with several defining close-game losses."),
  peak("Carson Palmer", 2002, "USC", "cfb-carson-palmer", 3, [9, 8, 8, 5, 8], "Arm: elite 2002 power and field-stretching ability; Accuracy: very good placement during the Heisman run; Processing: strong command in a pro-style system; Mobility: modest creation value; Clutch: excellent finish to the season and bowl stage."),
  peak("Marcus Vick", 2005, "Virginia Tech", "cfb-marcus-vick", 2, [8, 7, 6, 9, 6], "Arm: high-end natural throwing power; Accuracy: solid 2005 production but not elite consistency; Processing: athletic creation often carried the offense more than advanced reads; Mobility: elite speed and escape value; Clutch: good team success without a defining championship finish."),
  peak("Jason White", 2003, "Oklahoma", "cfb-jason-white", 3, [8, 8, 8, 3, 7], "Arm: plus vertical capability from the pocket; Accuracy: highly productive 2003 placement; Processing: strong Oklahoma spread command; Mobility: severely limited by knee history; Clutch: Heisman season with late championship-stage setbacks."),
  peak("Marcus Mariota", 2014, "Oregon", "cfbfast-r-player-511459-marcus-mariota", 5, [7, 9, 9, 9, 8], "Arm: good functional power with effortless release; Accuracy: elite 2014 placement and efficiency; Processing: exceptional option, RPO, and progression decisions; Mobility: elite open-field and scramble threat; Clutch: playoff breakthrough with the title-game loss below the top ceiling."),
  peak("Dak Prescott", 2014, "Mississippi State", "cfbfast-r-player-512030-dak-prescott", 3, [7, 7, 7, 9, 8], "Arm: solid SEC-level power; Accuracy: productive but streakier than elite passers; Processing: good spread-option command; Mobility: elite power-running and creation value; Clutch: drove Mississippi State to No. 1 with meaningful high-leverage wins."),
  peak("Jared Goff", 2015, "California", "cfbfast-r-player-547401-jared-goff", 2, [8, 8, 8, 4, 6], "Arm: high-end drive and vertical ability; Accuracy: strong 2015 placement and volume efficiency; Processing: advanced Cal spread distribution; Mobility: limited creation outside pocket slides; Clutch: strong season without major championship-stage leverage."),
  peak("Patrick Mahomes", 2016, "Texas Tech", "cfbfast-r-player-3139477-patrick-mahomes", 3, [9, 8, 7, 8, 7], "Arm: generational college throwing power and angle flexibility; Accuracy: high-end creation-era placement with some volatility; Processing: explosive but aggressive Air Raid decision profile; Mobility: excellent scramble and off-platform value; Clutch: remarkable individual responses despite limited team success."),
  peak("Deshaun Watson", 2016, "Clemson", "cfb-deshaun-watson", 5, [8, 8, 8, 8, 9], "Arm: high-end functional power; Accuracy: very good placement at all three levels; Processing: mature spread and progression command; Mobility: dangerous designed and scramble threat; Clutch: national-title winning drive and repeated playoff-stage excellence."),
  peak("Lamar Jackson", 2016, "Louisville", "cfb-lamar-jackson", 5, [7, 7, 7, 9, 7], "Arm: strong enough for explosive vertical throws; Accuracy: productive but inconsistent on routine placement; Processing: improved option and progression work within Louisville's offense; Mobility: generational rushing and escape value; Clutch: spectacular individual season without a championship finish."),
  peak("Baker Mayfield", 2017, "Oklahoma", "cfb-baker-mayfield", 5, [8, 9, 9, 7, 8], "Arm: high-end enough for vertical and off-platform work; Accuracy: elite 2017 placement and efficiency; Processing: elite command and quick decision-making; Mobility: useful creator without being run-first; Clutch: major wins and playoff berth with the semifinal loss below the absolute ceiling."),
  peak("Josh Allen", 2016, "Wyoming", "cfbfast-r-player-3918298-josh-allen", 1, [9, 5, 5, 8, 6], "Arm: generational raw power already obvious at Wyoming; Accuracy: notably inconsistent 2016 placement; Processing: developmental and volatile against pressure; Mobility: high-end size-speed creation; Clutch: flashes of response without elite high-leverage résumé."),
  peak("Drew Lock", 2017, "Missouri", "cfbfast-r-player-3924327-drew-lock", 1, [9, 6, 6, 5, 5], "Arm: elite college velocity and deep power; Accuracy: streaky despite huge touchdown production; Processing: productive spread reads with inconsistency under pressure; Mobility: modest secondary value; Clutch: limited defining high-leverage success."),
  peak("Mason Rudolph", 2017, "Oklahoma State", "cfbfast-r-player-3116407-mason-rudolph", 2, [8, 8, 7, 5, 6], "Arm: strong vertical Air Raid power; Accuracy: very good downfield placement; Processing: good system command with some pressure limitations; Mobility: limited but functional; Clutch: productive rivalry and bowl moments without elite closing résumé."),
  peak("Sam Darnold", 2016, "USC", "cfbfast-r-player-3912547-sam-darnold", 2, [8, 7, 7, 7, 8], "Arm: high-end improvisational and vertical capability; Accuracy: aggressive placement with turnover volatility; Processing: strong off-script problem solving but risky decisions; Mobility: useful escape and movement value; Clutch: outstanding Rose Bowl and comeback profile."),
  peak("Gardner Minshew", 2018, "Washington State", "cfbfast-r-player-4038524-gardner-minshew", 2, [6, 8, 8, 6, 8], "Arm: average pure power; Accuracy: very good short/intermediate placement in 2018; Processing: fast Air Raid distribution and decision pace; Mobility: useful pocket escape; Clutch: repeatedly stabilized Washington State in close games."),
  peak("Kyler Murray", 2018, "Oklahoma", "cfb-kyler-murray", 5, [9, 8, 8, 9, 8], "Arm: elite power from every platform; Accuracy: high-end deep and movement placement; Processing: strong spread reads with explosive-shot aggression; Mobility: generational speed and creation; Clutch: Heisman and playoff berth with the semifinal loss below the top tier."),
  peak("Tua Tagovailoa", 2018, "Alabama", "cfb-tua-tagovailoa", 4, [7, 9, 9, 7, 8], "Arm: good functional power with elite release speed; Accuracy: elite 2018 anticipation and placement; Processing: exceptional RPO and progression efficiency; Mobility: useful but not primary run value; Clutch: strong high-leverage résumé with the title-game loss in the selected season."),
  peak("Trevor Lawrence", 2019, "Clemson", "cfb-trevor-lawrence", 4, [9, 8, 8, 8, 8], "Arm: elite drive and vertical talent; Accuracy: high-end 2019 placement with occasional misses; Processing: advanced command for age and system; Mobility: real designed-run and scramble threat; Clutch: undefeated run to the title game before the LSU loss."),
  peak("Joe Burrow", 2019, "LSU", "cfb-joe-burrow", 5, [8, 9, 9, 7, 9], "Arm: high-end functional power without being the pool's strongest; Accuracy: generational 2019 placement and anticipation; Processing: elite full-field command and pressure answers; Mobility: useful escape and scramble value; Clutch: undefeated SEC, playoff, and title-game dominance."),
  peak("Jalen Hurts", 2019, "Oklahoma", "cfbfast-r-player-4040715-jalen-hurts", 4, [7, 8, 8, 9, 9], "Arm: solid power with improving deep access; Accuracy: high-end 2019 efficiency; Processing: mature Oklahoma spread command and low-error decisions; Mobility: elite power and open-field running; Clutch: repeated comeback and leadership value across a playoff season."),
  peak("Justin Fields", 2019, "Ohio State", "cfb-justin-fields", 4, [8, 9, 8, 9, 8], "Arm: high-end velocity and deep capability; Accuracy: elite 2019 placement and touchdown-to-interception profile; Processing: strong structured reads with some pressure holds; Mobility: elite designed and scramble value; Clutch: unbeaten regular season with the CFP semifinal loss."),
  peak("Justin Herbert", 2019, "Oregon", "cfbfast-r-player-4038941-justin-herbert", 3, [9, 7, 7, 7, 8], "Arm: elite drive and vertical power; Accuracy: good but inconsistent 2019 placement; Processing: solid command in a conservative structure; Mobility: useful size-speed creation; Clutch: Pac-12 title and Rose Bowl closing performance."),
  peak("Jordan Love", 2018, "Utah State", "cfbfast-r-player-4036378-jordan-love", 1, [9, 7, 6, 7, 6], "Arm: elite natural power and angle freedom; Accuracy: flashed high-level placement but was volatile in 2018; Processing: aggressive and inconsistent decision profile; Mobility: useful scramble value; Clutch: good moments without a marquee high-leverage season finish."),
  peak("Mac Jones", 2020, "Alabama", "cfbfast-r-player-4241464-mac-jones", 4, [7, 9, 9, 4, 9], "Arm: good enough but not elite raw power; Accuracy: elite 2020 placement and downfield efficiency; Processing: elite timing, anticipation, and decision quality; Mobility: limited creation; Clutch: undefeated national-title season with dominant postseason execution."),
  peak("Kyle Trask", 2020, "Florida", "cfbfast-r-player-4034946-kyle-trask", 2, [7, 8, 8, 4, 7], "Arm: solid functional power; Accuracy: very good 2020 placement and red-zone efficiency; Processing: strong progression and leverage decisions; Mobility: limited creator; Clutch: big-game production mixed with late-season losses."),
  peak("Zach Wilson", 2020, "BYU", "cfbfast-r-player-4361259-zach-wilson", 1, [9, 9, 8, 8, 7], "Arm: elite 2020 velocity and off-platform range; Accuracy: elite deep and movement placement; Processing: high-end play-action and progression decisions against a lighter schedule; Mobility: dynamic escape and creation; Clutch: strong season without elite championship-stage leverage."),
  peak("Sam Howell", 2020, "North Carolina", "cfbfast-r-player-4426875-sam-howell", 2, [8, 8, 7, 8, 7], "Arm: high-end vertical power; Accuracy: strong 2020 deep and intermediate placement; Processing: productive RPO and shot-play decisions; Mobility: meaningful scramble and toughness value; Clutch: good late-game responses without major postseason leverage."),
  peak("Spencer Rattler", 2020, "Oklahoma", "cfbfast-r-player-4426339-spencer-rattler", 1, [9, 8, 7, 7, 6], "Arm: elite natural velocity and release freedom; Accuracy: high-end 2020 placement; Processing: improved but still aggressive decision profile; Mobility: useful movement and escape value; Clutch: solid Big 12 finish without a defining title-stage moment."),
  peak("Brock Purdy", 2020, "Iowa State", "cfbfast-r-player-4361741-brock-purdy", 2, [6, 7, 7, 7, 7], "Arm: average college power; Accuracy: dependable but not elite placement; Processing: solid distributor with occasional turnover volatility; Mobility: useful scramble and toughness value; Clutch: competitive close-game profile without major postseason stage."),
  peak("Bryce Young", 2021, "Alabama", "cfb-bryce-young", 5, [7, 9, 9, 8, 9], "Arm: good functional power enhanced by release and touch; Accuracy: elite 2021 placement from multiple platforms; Processing: elite anticipation and pressure solutions; Mobility: high-end pocket escape and creation; Clutch: Heisman season with multiple defining late drives and SEC title performance."),
  peak("C.J. Stroud", 2021, "Ohio State", "cfbfast-r-player-4432577-c-j-stroud", 4, [9, 9, 8, 5, 7], "Arm: elite 2021 drive and vertical power; Accuracy: elite layered placement; Processing: advanced timing and progression command; Mobility: athletic but minimally used as a run creator that season; Clutch: huge production with rivalry and bowl context keeping the rating below the top tier."),
  peak("Kenny Pickett", 2021, "Pittsburgh", "cfbfast-r-player-4240703-kenny-pickett", 3, [7, 8, 8, 7, 8], "Arm: good functional power; Accuracy: high-end 2021 placement and efficiency; Processing: mature full-field command; Mobility: useful movement and scramble value; Clutch: ACC title run with repeated late-game control."),
  peak("Bailey Zappe", 2021, "Western Kentucky", "cfbfast-r-player-4250360-bailey-zappe", 1, [6, 8, 8, 3, 7], "Arm: average raw power; Accuracy: highly productive 2021 timing and placement; Processing: fast Air Raid distribution; Mobility: limited creation; Clutch: record-setting season with lower top-end opponent leverage."),
  peak("Matt Corral", 2021, "Ole Miss", "cfbfast-r-player-4362874-matt-corral", 2, [8, 8, 7, 8, 7], "Arm: high-end quick-release power; Accuracy: very good 2021 placement; Processing: improved RPO and progression decisions; Mobility: dangerous designed-run and scramble threat; Clutch: strong SEC responses without championship-stage proof."),
  peak("Malik Willis", 2021, "Liberty", "cfbfast-r-player-4242512-malik-willis", 1, [9, 5, 5, 9, 5], "Arm: elite raw power and off-platform capability; Accuracy: inconsistent routine placement; Processing: developmental and pressure-sensitive; Mobility: elite burst, power, and creation; Clutch: limited high-leverage résumé against top competition."),
  peak("Sam Hartman", 2021, "Wake Forest", "cfbfast-r-player-4361994-sam-hartman", 2, [7, 7, 7, 6, 6], "Arm: solid functional power; Accuracy: productive but streaky 2021 placement; Processing: good slow-mesh and progression command; Mobility: limited secondary creation; Clutch: strong season with costly late-game and title-game turnovers."),
  peak("Caleb Williams", 2022, "USC", "cfb-caleb-williams", 5, [9, 8, 8, 9, 8], "Arm: elite power, angles, and off-platform range; Accuracy: high-end 2022 movement and deep placement; Processing: strong creation-era decisions with some extended-play risk; Mobility: elite escape and open-field threat; Clutch: Heisman season with repeated late responses despite team defensive limitations."),
  peak("Max Duggan", 2022, "TCU", "cfbfast-r-player-4427105-max-duggan", 3, [7, 7, 7, 8, 9], "Arm: good enough vertical power; Accuracy: competitive but not elite placement consistency; Processing: decisive and tough within TCU's offense; Mobility: high-end designed and scramble value; Clutch: extraordinary 2022 comeback and playoff résumé."),
  peak("Drake Maye", 2022, "North Carolina", "cfbfast-r-player-4431452-drake-maye", 4, [9, 8, 8, 8, 7], "Arm: elite 2022 drive and deep power; Accuracy: high-end layered placement; Processing: advanced downfield progression work; Mobility: dangerous scramble and designed-run value; Clutch: strong individual season without elite championship-stage finishes."),
  peak("Michael Vick", 1999, "Virginia Tech", "cfb-michael-vick", 4, [9, 6, 6, 9, 9], "Arm: generational 1999 velocity and explosive downfield ability; Accuracy: dynamic but inconsistent completion profile; Processing: offense leaned on athletic stress more than complex progression volume; Mobility: generational speed and creation; Clutch: undefeated run to the national-title game and major high-pressure performances."),
  peak("Stetson Bennett", 2022, "Georgia", "cfbfast-r-player-4259553-stetson-bennett", 3, [6, 8, 8, 7, 9], "Arm: adequate rather than rare power; Accuracy: high-end 2022 placement and timing; Processing: mature command of a pro-style championship offense; Mobility: useful scramble and designed-run value; Clutch: undefeated title season with defining CFP comeback execution."),
  peak("Michael Penix Jr.", 2023, "Washington", "cfb-michael-penix-jr", 4, [9, 8, 8, 4, 9], "Arm: elite 2023 vertical and boundary power; Accuracy: high-end aggressive placement; Processing: advanced vertical timing and coverage decisions; Mobility: limited run value; Clutch: undefeated run through the semifinal with repeated late-game throws."),
  peak("Bo Nix", 2023, "Oregon", "cfb-bo-nix", 4, [7, 9, 9, 7, 8], "Arm: good functional power; Accuracy: elite 2023 efficiency and short/intermediate precision; Processing: elite tempo and leverage decisions; Mobility: useful designed and scramble value; Clutch: excellent season with two narrow Washington losses keeping the ceiling below elite."),
  peak("Jayden Daniels", 2023, "LSU", "cfb-jayden-daniels", 5, [8, 9, 9, 9, 8], "Arm: high-end vertical ability; Accuracy: elite 2023 deep and intermediate placement; Processing: elite explosive-play decisions with major growth; Mobility: generational open-field speed and creation; Clutch: Heisman dominance without conference-title or playoff leverage."),
  peak("J.J. McCarthy", 2023, "Michigan", "cfbfast-r-player-4433970-j-j-mccarthy", 3, [8, 8, 8, 7, 9], "Arm: high-end drive capability; Accuracy: very good 2023 placement; Processing: efficient decisions in a run-heavy championship structure; Mobility: useful scramble and movement value; Clutch: undefeated national-title run with key third-down and comeback throws."),
  peak("Jordan Travis", 2023, "Florida State", "cfbfast-r-player-4360799-jordan-travis", 3, [7, 8, 8, 8, 9], "Arm: good functional power; Accuracy: high-end 2023 placement; Processing: mature command and low-error decisions; Mobility: dangerous creator even as usage moderated; Clutch: undefeated leadership before injury with repeated close-game responses."),
  peak("Quinn Ewers", 2023, "Texas", "cfb-quinn-ewers", 2, [8, 8, 7, 5, 8], "Arm: high-end release and drive power; Accuracy: very good 2023 placement with some streakiness; Processing: improving but occasionally slow against rotation; Mobility: modest secondary value; Clutch: road win at Alabama and CFP berth."),
  peak("Dillon Gabriel", 2024, "Oregon", "cfbfast-r-player-4427238-dillon-gabriel", 3, [7, 8, 9, 7, 8], "Arm: good but not elite raw power; Accuracy: high-end 2024 placement and efficiency; Processing: elite veteran command and fast decisions; Mobility: useful designed and scramble value; Clutch: Big Ten title run and repeated late-game control."),
  peak("Shedeur Sanders", 2024, "Colorado", "cfb-shedeur-sanders", 3, [8, 9, 8, 6, 7], "Arm: high-end drive and touch ability; Accuracy: elite 2024 placement under heavy pressure; Processing: advanced full-field and pressure responses with some sack-taking tradeoff; Mobility: functional escape rather than run-first value; Clutch: strong late-game play without championship-stage opportunity."),
  peak("Cameron Ward", 2024, "Miami", "cfbfast-r-player-4688380-cameron-ward", 3, [9, 8, 8, 8, 7], "Arm: elite 2024 velocity, angles, and vertical range; Accuracy: high-end placement with aggressive variance; Processing: strong creation-heavy coverage decisions; Mobility: dangerous escape and scramble value; Clutch: major comeback flashes with late-season losses limiting the top tier."),
  peak("Jaxson Dart", 2024, "Ole Miss", "cfbfast-r-player-4689114-jaxson-dart", 3, [8, 8, 8, 7, 7], "Arm: high-end functional power; Accuracy: very good 2024 downfield efficiency; Processing: strong play-action and progression command; Mobility: meaningful scramble and designed-run value; Clutch: several big wins without a championship-stage finish."),
  peak("Will Howard", 2024, "Ohio State", "cfbfast-r-player-4429955-will-howard", 4, [8, 8, 8, 7, 9], "Arm: high-end enough for Ohio State's vertical game; Accuracy: very good 2024 placement; Processing: strong full-field operation in a talented offense; Mobility: useful power and scramble value; Clutch: national-title run with elite playoff response after the Michigan loss."),
  peak("Kyle McCord", 2024, "Syracuse", "cfbfast-r-player-4433971-kyle-mccord", 1, [8, 8, 7, 4, 7], "Arm: high-end volume passing power; Accuracy: very good 2024 Syracuse placement; Processing: solid progression command with some pressure limits; Mobility: limited creator; Clutch: productive season without major championship-stage leverage."),
  peak("Jalen Milroe", 2023, "Alabama", "cfbfast-r-player-4432734-jalen-milroe", 3, [9, 6, 6, 9, 8], "Arm: elite 2023 deep and drive power; Accuracy: volatile on routine and intermediate placement; Processing: inconsistent progression and pressure decisions; Mobility: elite speed and power-run threat; Clutch: defining Auburn finish and SEC title response."),
  peak("Carson Beck", 2023, "Georgia", "cfbfast-r-player-4430841-carson-beck", 2, [8, 8, 8, 5, 7], "Arm: high-end functional power; Accuracy: very good 2023 placement but short of generational precision; Processing: advanced Georgia progression command; Mobility: modest secondary value; Clutch: strong undefeated regular season with SEC title loss limiting the ceiling."),
  peak("Riley Leonard", 2024, "Notre Dame", "cfbfast-r-player-4683423-riley-leonard", 3, [6, 7, 8, 9, 9], "Arm: adequate rather than elite power; Accuracy: solid 2024 placement with some downfield limits; Processing: mature option and progression command; Mobility: elite power and designed-run value; Clutch: Notre Dame playoff run with repeated high-leverage conversion and comeback play."),
  peak("Kaidon Salter", 2023, "Liberty", "cfbfast-r-player-4432803-kaidon-salter", 1, [8, 7, 6, 9, 7], "Arm: high-end vertical power; Accuracy: good but uneven 2023 placement; Processing: explosive-play oriented with developmental reads; Mobility: elite open-field creation; Clutch: strong Liberty run without top-tier opponent leverage."),
  peak("Grayson McCall", 2021, "Coastal Carolina", "cfbfast-r-player-4427936-grayson-mccall", 1, [6, 9, 8, 7, 8], "Arm: average raw power; Accuracy: elite 2021 touch and placement in Coastal's option structure; Processing: high-end option, RPO, and leverage decisions; Mobility: useful run and scramble value; Clutch: strong close-game résumé with limited championship-stage exposure."),
  peak("D'Eriq King", 2018, "Houston", "cfbfast-r-player-4039300-d-eriq-king", 1, [7, 7, 7, 9, 6], "Arm: solid functional power; Accuracy: productive 2018 placement with some variance; Processing: good spread and option decisions; Mobility: elite rushing, escape, and red-zone value; Clutch: major production without an elite high-leverage postseason résumé."),
] as const;

export function buildFootballCfbBuildQbTraitProfiles(): readonly CfbBuildQbTraitProfile[] {
  if (CFB_BUILD_QB_PEAK_SEASON_AUDIT.length !== CFB_BUILD_QB_MATURE_POOL_SIZE) {
    throw new Error(`CFB Build a QB requires exactly ${CFB_BUILD_QB_MATURE_POOL_SIZE} audited peak seasons.`);
  }

  const canonicalPlayers = new Set<string>();
  const catalogIds = new Set<string>();

  return CFB_BUILD_QB_PEAK_SEASON_AUDIT.map((row) => {
    if (canonicalPlayers.has(row.canonicalPlayerId)) {
      throw new Error(`Duplicate canonical CFB Build a QB player identity: ${row.canonicalPlayerId}`);
    }
    canonicalPlayers.add(row.canonicalPlayerId);

    const catalogId = `cfb-build-qb-${buildSlug(row.name)}-${row.peakSeason}`;
    if (catalogIds.has(catalogId)) throw new Error(`Duplicate CFB Build a QB catalog identity: ${catalogId}`);
    catalogIds.add(catalogId);

    const traits = Object.fromEntries(BUILD_QB_TRAITS.map((trait) => [
      trait,
      CFB_BUILD_QB_TRAIT_RATING_BY_LEVEL[row.researchLevels[trait]],
    ])) as Readonly<Record<BuildQbTrait, number>>;
    const overall = Math.round(BUILD_QB_TRAITS.reduce((sum, trait) => sum + traits[trait], 0) / BUILD_QB_TRAITS.length);

    return {
      catalogId,
      peakSeasonIdentityId: `${row.canonicalPlayerId}@${row.peakSeason}:${buildSlug(row.school)}`,
      canonicalPlayerId: row.canonicalPlayerId,
      sourceProvider: row.sourceProvider,
      name: row.name,
      peakSeason: row.peakSeason,
      school: row.school,
      qualityBand: row.qualityBand,
      generationWeight: CFB_BUILD_QB_GENERATION_WEIGHT_BY_RARITY[row.qualityBand],
      traits,
      overall,
      evidenceSourceIds: row.evidenceSourceIds,
      auditSummary: row.auditSummary,
    };
  });
}

const CFB_BUILD_QB_PROFILE_BY_CATALOG_ID = new Map(
  buildFootballCfbBuildQbTraitProfiles().map((profile) => [profile.catalogId, profile]),
);

/** Exact catalog-reference lookup only. Rendered player names never own identity. */
export function cfbBuildQbProfileForItemReference(itemReference: string | null | undefined) {
  if (!itemReference) return null;
  return CFB_BUILD_QB_PROFILE_BY_CATALOG_ID.get(itemReference) ?? null;
}
