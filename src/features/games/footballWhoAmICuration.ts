import type { FootballSubjectProfile } from "../back-room/footballSubjectRegistry";
import { whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import type { WhoAmIClue, WhoAmIClueFacet } from "./whoAmIEngine";

/**
 * NFL Who Am I calibration batch 1 (launch-order subjects 1-50).
 *
 * The source research remains an archive. This layer answers the narrower game
 * question: does a clue materially help a knowledgeable football fan identify
 * the hidden player? It keeps A/B football identity, allows at most one useful
 * C/color fact, removes D biography/trivia, and trims deep stat banks to the
 * strongest 16 playable clues so replay depth comes from useful football facts.
 */
export const NFL_WHO_AM_I_BATCH_1_SUBJECT_IDS = [
  "nfl-aaron-rodgers",
  "nfl-bart-starr",
  "nfl-bobby-layne",
  "brett-favre",
  "cam-newton",
  "dan-marino",
  "drew-brees",
  "nfl-fran-tarkenton",
  "nfl-jim-kelly",
  "joe-montana",
  "joe-namath",
  "john-elway",
  "johnny-unitas",
  "nfl-josh-allen",
  "kurt-warner",
  "nfl-lamar-jackson",
  "nfl-otto-graham",
  "nfl-patrick-mahomes",
  "peyton-manning",
  "nfl-roger-staubach",
  "nfl-sammy-baugh",
  "nfl-sid-luckman",
  "steve-young",
  "nfl-terry-bradshaw",
  "tom-brady",
  "troy-aikman",
  "nfl-ya-tittle",
  "nfl-alex-smith",
  "andrew-luck",
  "adrian-peterson",
  "barry-sanders",
  "nfl-bronko-nagurski",
  "nfl-doak-walker",
  "earl-campbell",
  "emmitt-smith",
  "eric-dickerson",
  "nfl-frank-gifford",
  "gale-sayers",
  "nfl-harold-red-grange",
  "jim-brown",
  "nfl-jim-thorpe",
  "ladainian-tomlinson",
  "marcus-allen",
  "marshall-faulk",
  "nfl-oj-simpson",
  "nfl-paul-hornung",
  "nfl-reggie-bush",
  "tony-dorsett",
  "walter-payton",
  "nfl-ahman-green",
] as const;

const batchSubjectIds = new Set<string>(NFL_WHO_AM_I_BATCH_1_SUBJECT_IDS);
const keep = (...conceptIds: string[]) => new Set(conceptIds);

const retainedIdentityConcepts = new Map<string, ReadonlySet<string>>([
  ["nfl-aaron-rodgers", keep("identity:high-school-recruiting-overlook", "identity:butte-junior-college-breakthrough", "identity:garrett-cross-recruiting-discovery", "identity:teenage-cal-breakthrough", "identity:2005-draft-wait")],
  ["nfl-bart-starr", keep("identity:alabama-injury-and-benching", "identity:johnny-dee-draft-tip", "identity:lombardi-career-rescue", "identity:ice-bowl-sneak-call", "identity:pro-bowls")],
  ["nfl-bobby-layne", keep("identity:texas-baseball-two-sport-star", "identity:cotton-bowl-all-forty-points", "identity:doak-walker-lifelong-football-partnership", "identity:buddy-parker-two-team-relationship", "identity:pro-bowls")],
  ["brett-favre", keep("identity:father-wishbone-background", "identity:overlooked-high-school-quarterback", "identity:third-string-college-breakthrough", "identity:post-crash-alabama-return")],
  ["cam-newton", keep("identity:florida-blinn-auburn-path", "identity:blinn-junior-college-reset", "identity:one-year-auburn-window")],
  ["dan-marino", keep("identity:pittsburgh-hometown-pitt", "identity:do-not-change-throwing-motion", "identity:1983-draft-slide", "identity:don-shula-career-influence", "identity:achilles-comeback-opener")],
  ["drew-brees", keep("identity:championship-qb-overlooked-recruit", "identity:catastrophic-throwing-shoulder-injury", "identity:tom-house-throwing-rebuild", "identity:katrina-lakeview-calling", "identity:payton-build-around-collaboration")],
  ["nfl-fran-tarkenton", keep("identity:expansion-vikings-five-touchdown-debut", "identity:scrambling-from-self-preservation", "identity:van-brocklin-style-conflict", "identity:georgia-fourth-down-sec-clincher", "identity:pro-bowls")],
  ["nfl-jim-kelly", keep("identity:career-threatening-college-shoulder-rebuild", "identity:usfl-over-bills-path", "identity:buffalo-no-huddle-identity", "identity:pro-bowls")],
  ["joe-montana", keep("identity:1976-shoulder-lost-season", "identity:1977-purdue-breakthrough", "identity:1979-cotton-bowl-flu-comeback", "identity:third-round-draft-entry")],
  ["joe-namath", keep("identity:beaver-falls-multisport-star", "identity:rival-league-draft-leverage", "identity:knee-surgery-after-record-signing", "identity:broadway-joe-nickname-origin", "identity:super-bowl-iii-guarantee")],
  ["john-elway", keep("identity:family-move-for-passing-offense", "identity:twice-mlb-drafted", "identity:yankees-minor-league-success", "identity:baseball-leverage-colts-trade", "identity:super-bowl-helicopter-run")],
  ["johnny-unitas", keep("identity:pittsburgh-rejection", "identity:bloomfield-rams-semi-pro", "identity:construction-work-between-opportunities", "identity:fan-letter-baltimore-opportunity", "identity:first-pro-pass-interception-touchdown", "identity:iconic-high-top-shoes")],
  ["nfl-josh-allen", keep("identity:thousand-recruiting-emails-juco-path", "identity:multi-sport-firebaugh-athlete")],
  ["kurt-warner", keep("identity:one-college-start-undrafted", "identity:hyvee-grocery-store-job", "identity:arena-and-nfl-europe-route", "identity:trent-green-injury-opening", "identity:arizona-second-career-revival")],
  ["nfl-lamar-jackson", keep("identity:mother-first-football-trainer", "identity:quarterback-only-position-insistence", "identity:mother-managed-draft-process")],
  ["nfl-otto-graham", keep("identity:basketball-scholarship-football-discovery", "identity:three-sport-northwestern-athlete", "identity:pro-basketball-champion-before-browns", "identity:coast-guard-academy-coaching", "identity:pro-bowls")],
  ["nfl-patrick-mahomes", keep("identity:baseball-family-background", "identity:high-school-three-sport-profile", "identity:mlb-draft-choice", "identity:college-two-sport-path")],
  ["peyton-manning", keep("identity:freshman-starting-breakthrough", "identity:senior-year-return-decision")],
  ["nfl-roger-staubach", keep("identity:navy-service-delayed-nfl", "identity:volunteered-vietnam-command", "identity:captain-comeback-identity", "identity:hail-mary-term-popularization", "identity:cfb-roger-staubach--high-school-position-switch", "identity:cfb-roger-staubach--the-dodger-nickname")],
  ["nfl-sammy-baugh", keep("identity:quarterback-defender-punter", "identity:four-touchdowns-four-interceptions-punt", "identity:sugar-bowl-punting-masterclass", "identity:seventy-three-zero-dry-humor", "identity:pro-bowls")],
  ["nfl-sid-luckman", keep("identity:columbia-tailback-to-t-quarterback", "identity:early-t-formation-struggles", "identity:seventy-three-zero-t-formation-showcase", "identity:seven-touchdown-passing-game", "identity:merchant-marine-wartime-service", "identity:pro-bowls")],
  ["steve-young", keep("identity:eighth-string-byu-rise", "identity:brigham-young-descendant", "identity:landmark-usfl-contract")],
  ["nfl-terry-bradshaw", keep("identity:quarterback-javelin-training", "identity:phil-robertson-depth-chart", "identity:number-one-pick-coin-flip", "identity:pro-bowls")],
  ["tom-brady", keep("identity:baseball-draft-option", "identity:michigan-backup-to-griese", "identity:michigan-henson-competition", "identity:late-draft-roster-survival")],
  ["troy-aikman", keep("identity:oklahoma-position-flexibility", "identity:wishbone-mismatch-transfer", "identity:jimmy-johnson-recruiting-connection", "identity:oklahoma-to-ucla-reinvention")],
  ["nfl-ya-tittle", keep("identity:pro-bowls", "identity:all-nfl-selections", "identity:1962-touchdown-record", "identity:1963-touchdown-record", "identity:three-giants-division-titles", "identity:nfl-mvp-1961")],
  ["nfl-alex-smith", keep("identity:reggie-bush-run-first-high-school", "identity:constant-offensive-system-turnover", "identity:catastrophic-leg-injury-comeback")],
  ["andrew-luck", keep("identity:pain-rehab-cycle-retirement", "identity:cfb-andrew-luck--oliver-luck-football-family")],
  ["adrian-peterson", keep("identity:ad-all-day-nickname", "identity:sprinter-speed-deeper-alignment", "identity:vikings-draft-collarbone-concern", "identity:walkthrough-full-speed-habit", "identity:acl-mcl-rapid-comeback")],
  ["barry-sanders", keep("identity:late-high-school-position-opportunity", "identity:college-backup-to-thurman-thomas", "identity:college-return-specialist-breakthrough", "identity:historic-lone-starting-season", "identity:skipped-college-senior-season", "identity:oklahoma-state-campus-honor")],
  ["nfl-bronko-nagurski", keep("identity:five-positions-one-college-game", "identity:left-nfl-for-pro-wrestling", "identity:wartime-nfl-comeback", "identity:five-all-nfl-selections")],
  ["nfl-doak-walker", keep("identity:five-sport-high-school-athlete", "identity:bobby-layne-lifelong-football-link", "identity:merchant-marine-college-interruption", "identity:house-that-doak-built", "identity:pro-bowls")],
  ["earl-campbell", keep("identity:tyler-rose-family-origin", "identity:luv-ya-blue-monday-night-breakout")],
  ["emmitt-smith", keep("identity:historic-high-school-rushing", "identity:florida-record-book-takeover", "identity:super-bowl-champion-holdout", "identity:1993-giants-injury-game")],
  ["eric-dickerson", keep("identity:prescription-sports-goggles", "identity:pony-express-backfield", "identity:halloween-three-way-trade")],
  ["nfl-frank-gifford", keep("identity:junior-college-to-usc-path", "identity:pro-bowl-offense-and-defense", "identity:halfback-option-passer", "identity:bednarik-hit-hiatus", "identity:monday-night-football-second-career", "identity:pro-bowls")],
  ["gale-sayers", keep("identity:kansas-comet-nickname", "identity:piccolo-interracial-roommates", "identity:piccolo-knee-rehab-support", "identity:halas-award-given-to-piccolo")],
  ["nfl-harold-red-grange", keep("identity:1924-michigan-breakout", "identity:ten-days-college-to-pro", "identity:nfl-barnstorming-attraction", "identity:early-player-agent-celebrity-brand", "identity:nfl-championship-1933")],
  ["jim-brown", keep("identity:syracuse-four-sport-profile", "identity:dual-sport-hall-of-fame", "identity:early-retirement-acting-career")],
  ["nfl-jim-thorpe", keep("identity:wa-tho-huk-bright-path", "identity:carlisle-multisport-development", "identity:olympic-pentathlon-decathlon-double", "identity:major-league-baseball-crossover", "identity:first-apfa-president-player", "identity:twelve-pro-seasons")],
  ["ladainian-tomlinson", keep("identity:late-high-school-running-back-move", "identity:tcu-position-change", "identity:historic-406-yard-game", "identity:nfl-draft-2001")],
  ["marcus-allen", keep("identity:high-school-quarterback-defensive-back", "identity:recruited-as-defensive-back", "identity:charles-white-fullback-apprenticeship", "identity:super-bowl-reverse-field-run", "identity:raiders-rift-to-chiefs-second-act", "identity:damon-allen-quarterback-brother")],
  ["marshall-faulk", keep("identity:running-back-recruiting-snub", "identity:freshman-386-yard-breakout", "identity:colts-rams-trade-turning-point", "identity:rams-contract-holdout", "identity:greatest-show-chess-piece")],
  ["nfl-oj-simpson", keep("identity:junior-college-to-usc-route", "identity:usc-world-record-relay", "identity:juice-electric-company-wordplay", "identity:usc-ucla-breakaway-touchdown", "identity:pro-bowls")],
  ["nfl-paul-hornung", keep("identity:three-sport-high-school-letterman", "identity:losing-team-heisman", "identity:notre-dame-everything-role", "identity:1963-gambling-suspension-return")],
  ["nfl-reggie-bush", keep("identity:helix-teammate-alex-smith", "identity:bush-push", "identity:heisman-vacated-and-restored", "identity:texans-passed-at-number-one", "identity:post-katrina-new-orleans-arrival")],
  ["tony-dorsett", keep("identity:undersized-local-pitt-recruit", "identity:cowboys-four-pick-trade-up", "identity:ninety-nine-yard-run-ten-men", "identity:cfb-tony-dorsett--hawk-nickname-origin")],
  ["walter-payton", keep("identity:first-football-play-touchdown", "identity:segregation-era-recruiting-path", "identity:sweetness-nickname-origin")],
  ["nfl-ahman-green", keep("identity:state-champion-sprinter", "identity:high-school-baseball-center-fielder")],
]);

const facetOverrides = new Map<string, WhoAmIClueFacet>([
  ["cam-newton:identity:florida-blinn-auburn-path", "career-path"],
  ["cam-newton:identity:one-year-auburn-window", "career-path"],
  ["nfl-jim-kelly:identity:buffalo-no-huddle-identity", "style"],
  ["joe-montana:identity:1977-purdue-breakthrough", "accomplishments"],
  ["nfl-josh-allen:identity:thousand-recruiting-emails-juco-path", "career-path"],
  ["nfl-lamar-jackson:identity:mother-first-football-trainer", "relationships"],
  ["nfl-otto-graham:identity:basketball-scholarship-football-discovery", "career-path"],
  ["nfl-patrick-mahomes:identity:baseball-family-background", "relationships"],
  ["peyton-manning:identity:freshman-starting-breakthrough", "accomplishments"],
  ["nfl-roger-staubach:identity:volunteered-vietnam-command", "career-path"],
  ["nfl-sammy-baugh:identity:sugar-bowl-punting-masterclass", "style"],
  ["steve-young:identity:landmark-usfl-contract", "career-path"],
  ["troy-aikman:identity:oklahoma-to-ucla-reinvention", "career-path"],
  ["nfl-alex-smith:identity:constant-offensive-system-turnover", "career-path"],
  ["andrew-luck:identity:cfb-andrew-luck--oliver-luck-football-family", "relationships"],
  ["barry-sanders:identity:college-backup-to-thurman-thomas", "career-path"],
  ["nfl-doak-walker:identity:bobby-layne-lifelong-football-link", "relationships"],
  ["nfl-doak-walker:identity:house-that-doak-built", "accomplishments"],
  ["earl-campbell:identity:luv-ya-blue-monday-night-breakout", "accomplishments"],
  ["eric-dickerson:identity:prescription-sports-goggles", "identity"],
  ["eric-dickerson:identity:pony-express-backfield", "relationships"],
  ["nfl-frank-gifford:identity:pro-bowl-offense-and-defense", "accomplishments"],
  ["nfl-frank-gifford:identity:bednarik-hit-hiatus", "career-path"],
  ["nfl-harold-red-grange:identity:1924-michigan-breakout", "accomplishments"],
  ["nfl-harold-red-grange:identity:early-player-agent-celebrity-brand", "career-path"],
  ["nfl-jim-thorpe:identity:carlisle-multisport-development", "background"],
  ["nfl-jim-thorpe:identity:first-apfa-president-player", "career-path"],
  ["marcus-allen:identity:charles-white-fullback-apprenticeship", "career-path"],
  ["marcus-allen:identity:raiders-rift-to-chiefs-second-act", "career-path"],
  ["marshall-faulk:identity:greatest-show-chess-piece", "style"],
  ["nfl-reggie-bush:identity:bush-push", "accomplishments"],
  ["nfl-reggie-bush:identity:texans-passed-at-number-one", "career-path"],
  ["nfl-ahman-green:identity:seattle-fumble-stigma-reset", "career-path"],
]);

const clueTextOverrides = new Map<string, Pick<WhoAmIClue, "text" | "band" | "facet" | "revealPriority">>([
  ["nfl-bart-starr:identity:ice-bowl-sneak-call", {
    text: "On the final drive of the Ice Bowl, I proposed a quarterback sneak to Vince Lombardi and scored the winning touchdown myself.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 8,
  }],
  ["nfl-bobby-layne:identity:doak-walker-lifelong-football-partnership", {
    text: "My Lions partnership with Doak Walker reached the 1953 NFL Championship Game, when Walker kicked the deciding extra point after I led a late 80-yard touchdown drive.",
    band: "strong",
    facet: "relationships",
    revealPriority: 16,
  }],
  ["nfl-lamar-jackson:identity:quarterback-only-position-insistence", {
    text: "My mother and I consistently insisted that I be evaluated as a quarterback rather than moved to another position because of my athleticism.",
    band: "strong",
    facet: "career-path",
    revealPriority: 16,
  }],
  ["gale-sayers:identity:piccolo-interracial-roommates", {
    text: "Brian Piccolo and I became one of the NFL's early interracial roommate pairings while playing together for the Bears.",
    band: "strong",
    facet: "relationships",
    revealPriority: 22,
  }],
  ["gale-sayers:identity:halas-award-given-to-piccolo", {
    text: "When I received the George S. Halas Award for courage, I accepted it in Brian Piccolo's honor.",
    band: "strong",
    facet: "relationships",
    revealPriority: 24,
  }],
  ["nfl-reggie-bush:identity:bush-push", {
    text: "A controversial push that helped Matt Leinart score at Notre Dame in 2005 became one of the defining plays of my USC career.",
    band: "strong",
    facet: "accomplishments",
    revealPriority: 14,
  }],
  ["earl-campbell:identity:tyler-rose-family-origin", {
    text: "I was known as the 'Tyler Rose.'",
    band: "giveaway",
    facet: "nickname",
    revealPriority: 10,
  }],
]);

const supplementalClues = new Map<string, readonly WhoAmIClue[]>([
  ["nfl-bart-starr", [{ id: "curated:five-championships", conceptId: "curated:five-championships", text: "I quarterbacked Green Bay to five NFL championships under Vince Lombardi.", band: "giveaway", facet: "accomplishments", revealPriority: 12 }]],
  ["nfl-bobby-layne", [
    { id: "curated:three-lions-titles", conceptId: "curated:three-lions-titles", text: "I helped lead Detroit to NFL championships in 1952, 1953 and 1957.", band: "giveaway", facet: "accomplishments", revealPriority: 10 },
    { id: "curated:retired-passing-leader", conceptId: "curated:retired-passing-leader", text: "When I retired after the 1962 season, I ranked first in NFL history in completions, passing yards and touchdown passes.", band: "strong", facet: "accomplishments", revealPriority: 18 },
  ]],
  ["brett-favre", [
    { id: "curated:three-straight-mvps", conceptId: "curated:three-straight-mvps", text: "I won the AP NFL MVP award three straight seasons from 1995 through 1997.", band: "giveaway", facet: "accomplishments", revealPriority: 10 },
    { id: "curated:green-bay-ironman", conceptId: "curated:green-bay-ironman", text: "I became Green Bay's defining quarterback while building an NFL-record streak of 297 consecutive regular-season starts.", band: "giveaway", facet: "accomplishments", revealPriority: 12 },
  ]],
  ["cam-newton", [{ id: "curated:2015-mvp", conceptId: "curated:2015-mvp", text: "I was the 2015 AP NFL MVP after leading Carolina to a 15-1 regular season.", band: "giveaway", facet: "accomplishments", revealPriority: 12 }]],
  ["drew-brees", [{ id: "curated:super-bowl-xliv-mvp", conceptId: "curated:super-bowl-xliv-mvp", text: "I was Super Bowl XLIV MVP after leading New Orleans to the first championship in franchise history.", band: "giveaway", facet: "accomplishments", revealPriority: 10 }]],
  ["nfl-jim-kelly", [{ id: "curated:four-straight-super-bowls", conceptId: "curated:four-straight-super-bowls", text: "I quarterbacked Buffalo to four consecutive Super Bowl appearances.", band: "giveaway", facet: "accomplishments", revealPriority: 10 }]],
  ["joe-montana", [{ id: "curated:four-super-bowl-wins", conceptId: "curated:four-super-bowl-wins", text: "I went 4-0 as San Francisco's starting quarterback in Super Bowls.", band: "giveaway", facet: "accomplishments", revealPriority: 10 }]],
  ["nfl-josh-allen", [{ id: "curated:2024-mvp", conceptId: "curated:2024-mvp", text: "I won the AP NFL MVP award for the 2024 season.", band: "giveaway", facet: "accomplishments", revealPriority: 15 }]],
  ["kurt-warner", [{ id: "curated:super-bowl-xxxiv-mvp", conceptId: "curated:super-bowl-xxxiv-mvp", text: "I became Super Bowl XXXIV MVP in my first season as the Rams' starting quarterback.", band: "giveaway", facet: "accomplishments", revealPriority: 10 }]],
  ["nfl-lamar-jackson", [{ id: "curated:2019-unanimous-mvp", conceptId: "curated:2019-unanimous-mvp", text: "In 2019 I became the second unanimous AP NFL MVP in league history.", band: "giveaway", facet: "accomplishments", revealPriority: 12 }]],
  ["nfl-otto-graham", [{ id: "curated:ten-title-games", conceptId: "curated:ten-title-games", text: "I led Cleveland to a league championship game in each of my ten pro seasons.", band: "giveaway", facet: "accomplishments", revealPriority: 12 }]],
  ["nfl-sammy-baugh", [{ id: "curated:two-washington-titles", conceptId: "curated:two-washington-titles", text: "I led Washington to NFL championships in 1937 and 1942.", band: "giveaway", facet: "accomplishments", revealPriority: 10 }]],
  ["nfl-patrick-mahomes", [{ id: "curated:three-super-bowl-mvps", conceptId: "curated:three-super-bowl-mvps", text: "I won three Super Bowl MVP awards before turning 30.", band: "giveaway", facet: "accomplishments", revealPriority: 10 }]],
  ["steve-young", [{ id: "curated:montana-to-super-bowl-mvp", conceptId: "curated:montana-to-super-bowl-mvp", text: "I succeeded Joe Montana in San Francisco and later threw six touchdown passes as Super Bowl XXIX MVP.", band: "giveaway", facet: "accomplishments", revealPriority: 10 }]],
  ["nfl-terry-bradshaw", [{ id: "curated:four-super-bowls", conceptId: "curated:four-super-bowls", text: "I quarterbacked Pittsburgh to four Super Bowl championships in six seasons.", band: "giveaway", facet: "accomplishments", revealPriority: 10 }]],
  ["tom-brady", [{ id: "curated:seven-super-bowls", conceptId: "curated:seven-super-bowls", text: "I won seven Super Bowl championships as a starting quarterback.", band: "giveaway", facet: "accomplishments", revealPriority: 8 }]],
  ["troy-aikman", [{ id: "curated:three-super-bowls", conceptId: "curated:three-super-bowls", text: "I quarterbacked Dallas to three Super Bowl championships in four seasons.", band: "giveaway", facet: "accomplishments", revealPriority: 10 }]],
  ["andrew-luck", [
    { id: "curated:stanford", conceptId: "curated:stanford", text: "I played college football at Stanford.", band: "helpful", facet: "background", revealPriority: 20 },
    { id: "curated:first-overall-2012", conceptId: "curated:first-overall-2012", text: "Indianapolis selected me No. 1 overall in the 2012 NFL Draft.", band: "giveaway", facet: "career-path", revealPriority: 12 },
    { id: "curated:colts-only", conceptId: "curated:colts-only", text: "I spent my entire NFL career with the Indianapolis Colts.", band: "giveaway", facet: "career-path", revealPriority: 15 },
  ]],
  ["nfl-doak-walker", [{ id: "curated:1948-heisman", conceptId: "curated:1948-heisman", text: "I won the 1948 Heisman Trophy at SMU.", band: "giveaway", facet: "accomplishments", revealPriority: 10 }]],
  ["eric-dickerson", [{ id: "curated:2105-rushing", conceptId: "curated:2105-rushing", text: "I set the NFL single-season rushing record with 2,105 yards in 1984.", band: "giveaway", facet: "accomplishments", revealPriority: 8 }]],
  ["nfl-harold-red-grange", [{ id: "curated:galloping-ghost", conceptId: "curated:galloping-ghost", text: "I was famously nicknamed the 'Galloping Ghost.'", band: "giveaway", facet: "nickname", revealPriority: 8 }]],
  ["ladainian-tomlinson", [{ id: "curated:2006-touchdown-record", conceptId: "curated:2006-touchdown-record", text: "I scored an NFL-record 31 total touchdowns in my 2006 MVP season.", band: "giveaway", facet: "accomplishments", revealPriority: 8 }]],
  ["nfl-oj-simpson", [{ id: "curated:2003-in-fourteen", conceptId: "curated:2003-in-fourteen", text: "In 1973 I became the first NFL player to rush for 2,000 yards in a season, reaching 2,003 in 14 games.", band: "giveaway", facet: "accomplishments", revealPriority: 8 }]],
  ["nfl-ahman-green", [
    { id: "curated:packers-rushing-leader", conceptId: "curated:packers-rushing-leader", text: "I finished as the Packers' all-time leading rusher with 8,322 yards.", band: "giveaway", facet: "accomplishments", revealPriority: 10 },
    { id: "curated:2003-packers-record", conceptId: "curated:2003-packers-record", text: "I set Green Bay's single-season rushing record with 1,883 yards in 2003.", band: "strong", facet: "accomplishments", revealPriority: 16 },
  ]],
]);

function applyIdentityCuration(subjectId: string, clue: WhoAmIClue) {
  const override = clueTextOverrides.get(`${subjectId}:${clue.conceptId ?? clue.id}`);
  if (override) return { ...clue, ...override };
  const facet = facetOverrides.get(`${subjectId}:${clue.conceptId ?? clue.id}`);
  return facet ? { ...clue, facet } : clue;
}

function clueQualityScore(subject: FootballSubjectProfile, clue: WhoAmIClue) {
  const id = clue.id;
  const text = clue.text.toLowerCase();
  let score = clue.band === "giveaway" ? 100 : clue.band === "strong" ? 82 : clue.band === "helpful" ? 60 : 55;

  if (clue.identityKnowledge) {
    score += 24;
    if (whoAmIClueSelectionClass(clue) === "identity-color") score -= 14;
  }
  if (id === "position" || id === "era") score += 35;
  if (id === "school" || id === "draft-pick" || id === "draft-round" || id === "heisman" || id === "national-champion") score += 35;
  if (id === "career-span") score += 10;
  if (id === "player-career-start" || id === "player-career-end") score -= 28;
  if (id === "career-path") score += (subject.franchises?.length ?? 0) <= 3 ? 20 : -25;
  if (id.startsWith("affiliation:")) {
    const primary = subject.franchises?.[0]?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    score += id === `affiliation:${primary}` ? 18 : -8;
  }
  if (/fact:nfl-(?:ap-mvp|super-bowl|first-team-all-pro|defensive-player-of-year|career-pro-bowl)/.test(id)) score += 38;
  if (/fact:nfl-career-(?:passing|rushing|receiving)-(?:yards|touchdowns)$/.test(id)) score += 18;
  if (/fact:nfl-career-scrimmage-(?:yards|touchdowns)$/.test(id)) score += 12;
  if (/fact:nfl-career-(?:games|starts|targets)$/.test(id)) score -= 55;
  if (/fact:nfl-career-(?:passing|rushing|receiving)-(?:attempts|completions|receptions)$/.test(id)) score -= 20;
  if (/fact:nfl-career-(?:.*per-game|.*percentage|.*ratio|.*per-attempt)$/.test(id)) score -= 30;
  if (/fact:nfl-career-interceptions-thrown/.test(id)) score -= 10;
  if (/curated:/.test(id)) score += 45;
  if (/\b(?:nickname|super bowl|mvp|heisman|record|championship|draft)\b/.test(text)) score += 10;
  return score;
}

function trimDeepPool(subject: FootballSubjectProfile, clues: readonly WhoAmIClue[]) {
  const target = 16;
  if (clues.length <= target) return [...clues];

  const ranked = clues
    .map((clue, index) => ({ clue, index, score: clueQualityScore(subject, clue) }))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  const selected = new Set(ranked.slice(0, target).map((entry) => entry.clue.id));
  return clues.filter((clue) => selected.has(clue.id));
}

export function isNflWhoAmIBatch1Subject(subjectId: string) {
  return batchSubjectIds.has(subjectId);
}

export function curateFootballWhoAmIClues(
  subject: FootballSubjectProfile,
  rawClues: readonly WhoAmIClue[],
): WhoAmIClue[] {
  if (subject.league !== "NFL" || !batchSubjectIds.has(subject.id)) return [...rawClues];

  const retained = retainedIdentityConcepts.get(subject.id);
  let colorUsed = false;
  const curated: WhoAmIClue[] = [];

  for (const rawClue of rawClues) {
    if (rawClue.identityKnowledge && retained && !retained.has(rawClue.conceptId ?? "")) continue;
    const clue = applyIdentityCuration(subject.id, rawClue);
    if (clue.identityKnowledge) {
      const selectionClass = whoAmIClueSelectionClass(clue);
      if (selectionClass === "deep-biography") continue;
      if (selectionClass === "identity-color") {
        if (colorUsed) continue;
        colorUsed = true;
      }
    }
    curated.push(clue);
  }

  curated.push(...(supplementalClues.get(subject.id) ?? []));
  return trimDeepPool(subject, curated);
}
