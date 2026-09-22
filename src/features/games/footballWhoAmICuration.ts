import type { FootballSubjectProfile } from "../back-room/footballSubjectRegistry";
import { refineCfbWhoAmIContent } from "./whoAmICfbPr3Curation";
import { refineNflWhoAmIContent } from "./whoAmINflPr4Curation";
import { whoAmIClueFacet, whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
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

const suppressedBatchStructuralClueIds = new Set(["player-career-start", "player-career-end"]);
const suppressedCareerSpanSubjectIds = new Set([
  "nfl-aaron-rodgers",
  "brett-favre",
  "nfl-josh-allen",
  "nfl-lamar-jackson",
  "nfl-patrick-mahomes",
  "peyton-manning",
  "troy-aikman",
  "nfl-ahman-green",
  "nfl-jim-thorpe",
]);

const active2026SubjectIds = new Set([
  "nfl-aaron-rodgers",
  "nfl-josh-allen",
  "nfl-lamar-jackson",
  "nfl-patrick-mahomes",
]);

const partialQuarterbackRushingSubjectIds = new Set([
  "brett-favre",
  "dan-marino",
  "nfl-fran-tarkenton",
  "nfl-jim-kelly",
  "joe-montana",
  "joe-namath",
  "john-elway",
  "johnny-unitas",
  "kurt-warner",
  "nfl-otto-graham",
  "peyton-manning",
  "nfl-roger-staubach",
  "nfl-sammy-baugh",
  "nfl-sid-luckman",
  "steve-young",
  "nfl-terry-bradshaw",
  "troy-aikman",
  "nfl-ya-tittle",
]);

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
  ["troy-aikman:era", {
    text: "I was active in the 1980s, 1990s and 2000s.",
    band: "broad",
    facet: "era",
    revealPriority: 20,
  }],
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
  ["nfl-aaron-rodgers", [
    { id: "curated:three-team-path", conceptId: "curated:three-team-path", text: "My NFL career has included Green Bay, the New York Jets, and Pittsburgh.", band: "giveaway", facet: "career-path", revealPriority: 12 },
    { id: "curated:four-ap-mvps", conceptId: "curated:four-ap-mvps", text: "I won the AP NFL MVP award four times.", band: "giveaway", facet: "accomplishments", revealPriority: 10 },
    { id: "curated:super-bowl-xlv-mvp", conceptId: "curated:super-bowl-xlv-mvp", text: "I was Super Bowl XLV MVP after leading Green Bay to a championship.", band: "giveaway", facet: "accomplishments", revealPriority: 8 },
  ]],
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
  ["nfl-fran-tarkenton", [
    { id: "curated:1975-mvp", conceptId: "curated:1975-mvp", text: "I was named the NFL's Most Valuable Player in 1975.", band: "giveaway", facet: "accomplishments", revealPriority: 12 },
    { id: "curated:retirement-record-book", conceptId: "curated:retirement-record-book", text: "When I retired, I ranked first in NFL history in career completions, passing yards and touchdown passes.", band: "strong", facet: "accomplishments", revealPriority: 18 },
  ]],
  ["nfl-jim-kelly", [
    { id: "curated:four-straight-super-bowls", conceptId: "curated:four-straight-super-bowls", text: "I quarterbacked Buffalo to four consecutive Super Bowl appearances.", band: "giveaway", facet: "accomplishments", revealPriority: 10 },
    { id: "curated:eleven-bills-seasons", conceptId: "curated:eleven-bills-seasons", text: "I spent all 11 of my NFL seasons with the Buffalo Bills.", band: "strong", facet: "career-path", revealPriority: 16 },
  ]],
  ["joe-montana", [{ id: "curated:four-super-bowl-wins", conceptId: "curated:four-super-bowl-wins", text: "I went 4-0 as San Francisco's starting quarterback in Super Bowls.", band: "giveaway", facet: "accomplishments", revealPriority: 10 }]],
  ["nfl-josh-allen", [
    { id: "curated:2024-mvp", conceptId: "curated:2024-mvp", text: "I won the AP NFL MVP award for the 2024 season.", band: "giveaway", facet: "accomplishments", revealPriority: 15 },
    { id: "curated:five-straight-40-total-td", conceptId: "curated:five-straight-40-total-td", text: "I became the first player in NFL history with five straight seasons of at least 40 total touchdowns.", band: "strong", facet: "accomplishments", revealPriority: 18 },
    { id: "curated:pass-rush-receive-td-game", conceptId: "curated:pass-rush-receive-td-game", text: "I became the first quarterback in NFL history with a passing, rushing, and receiving touchdown in the same game.", band: "strong", facet: "accomplishments", revealPriority: 20 },
    { id: "curated:bills-total-td-record", conceptId: "curated:bills-total-td-record", text: "In 2024 I passed Jim Kelly for the most total touchdowns in Bills franchise history.", band: "strong", facet: "accomplishments", revealPriority: 22 },
    { id: "curated:jersey-17", conceptId: "curated:jersey-17", text: "I wear No. 17 in the NFL.", band: "giveaway", facet: "identity", revealPriority: 10 },
    { id: "curated:three-pass-three-rush", conceptId: "curated:three-pass-three-rush", text: "In 2024 I became the first player in NFL history with three passing touchdowns and three rushing touchdowns in the same game.", band: "strong", facet: "accomplishments", revealPriority: 20 },
    { id: "curated:six-rush-td-seven-seasons", conceptId: "curated:six-rush-td-seven-seasons", text: "I became the first quarterback in NFL history with at least six rushing touchdowns in seven consecutive seasons.", band: "strong", facet: "style", revealPriority: 22 },
  ]],
  ["kurt-warner", [{ id: "curated:super-bowl-xxxiv-mvp", conceptId: "curated:super-bowl-xxxiv-mvp", text: "I became Super Bowl XXXIV MVP in my first season as the Rams' starting quarterback.", band: "giveaway", facet: "accomplishments", revealPriority: 10 }]],
  ["nfl-lamar-jackson", [
    { id: "curated:two-ap-mvps", conceptId: "curated:two-ap-mvps", text: "I won AP NFL MVP awards in 2019 and 2023, with the first coming by unanimous vote.", band: "giveaway", facet: "accomplishments", revealPriority: 10 },
    { id: "curated:qb-rushing-record", conceptId: "curated:qb-rushing-record", text: "I passed Michael Vick in 2024 to become the NFL's career rushing-yard leader among quarterbacks.", band: "giveaway", facet: "accomplishments", revealPriority: 12 },
    { id: "curated:2019-qb-rushing-season-record", conceptId: "curated:2019-qb-rushing-season-record", text: "In my 2019 MVP season I set the single-season quarterback rushing record with 1,206 yards.", band: "strong", facet: "accomplishments", revealPriority: 16 },
    { id: "curated:jersey-8", conceptId: "curated:jersey-8", text: "I wear No. 8 in the NFL.", band: "giveaway", facet: "identity", revealPriority: 10 },
    { id: "curated:houdini-run", conceptId: "curated:houdini-run", text: "My 47-yard spinning touchdown run against Cincinnati in 2019 became one of the signature highlights of my career.", band: "strong", facet: "style", revealPriority: 18 },
    { id: "curated:youngest-two-time-mvp", conceptId: "curated:youngest-two-time-mvp", text: "At 27, I became the youngest quarterback in NFL history to win multiple MVP awards.", band: "strong", facet: "accomplishments", revealPriority: 20 },
  ]],
  ["nfl-otto-graham", [{ id: "curated:ten-title-games", conceptId: "curated:ten-title-games", text: "I led Cleveland to a league championship game in each of my ten pro seasons.", band: "giveaway", facet: "accomplishments", revealPriority: 12 }]],
  ["nfl-sammy-baugh", [
    { id: "curated:two-washington-titles", conceptId: "curated:two-washington-titles", text: "I led Washington to NFL championships in 1937 and 1942.", band: "giveaway", facet: "accomplishments", revealPriority: 10 },
    { id: "curated:1943-triple-crown", conceptId: "curated:1943-triple-crown", text: "In 1943 I led the NFL in passing, punting, and defensive interceptions.", band: "giveaway", facet: "style", revealPriority: 12 },
    { id: "curated:slingin-sammy", conceptId: "curated:slingin-sammy", text: "I was famously known as 'Slingin' Sammy.'", band: "giveaway", facet: "nickname", revealPriority: 8 },
  ]],
  ["nfl-patrick-mahomes", [
    { id: "curated:three-super-bowl-mvps", conceptId: "curated:three-super-bowl-mvps", text: "I won three Super Bowl MVP awards before turning 30.", band: "giveaway", facet: "accomplishments", revealPriority: 10 },
    { id: "curated:2018-fifty-touchdown-mvp", conceptId: "curated:2018-fifty-touchdown-mvp", text: "In my first season as a full-time starter, I threw for 5,097 yards and 50 touchdowns and won the 2018 NFL MVP award.", band: "giveaway", facet: "accomplishments", revealPriority: 12 },
    { id: "curated:alex-smith-rookie-year", conceptId: "curated:alex-smith-rookie-year", text: "I spent my rookie season behind Alex Smith before taking over as Kansas City's starter.", band: "strong", facet: "career-path", revealPriority: 18 },
    { id: "curated:jersey-15", conceptId: "curated:jersey-15", text: "I wear No. 15 in the NFL.", band: "giveaway", facet: "identity", revealPriority: 10 },
    { id: "curated:thirteen-second-drive", conceptId: "curated:thirteen-second-drive", text: "With 13 seconds left against Buffalo in the 2021 divisional round, I completed two passes to set up the tying field goal before winning in overtime.", band: "giveaway", facet: "accomplishments", revealPriority: 12 },
    { id: "curated:youngest-mvp-and-super-bowl", conceptId: "curated:youngest-mvp-and-super-bowl", text: "At 24, I became the youngest player to win both an NFL MVP award and a Super Bowl title.", band: "strong", facet: "accomplishments", revealPriority: 18 },
  ]],
  ["steve-young", [{ id: "curated:montana-to-super-bowl-mvp", conceptId: "curated:montana-to-super-bowl-mvp", text: "I succeeded Joe Montana in San Francisco and later threw six touchdown passes as Super Bowl XXIX MVP.", band: "giveaway", facet: "accomplishments", revealPriority: 10 }]],
  ["nfl-terry-bradshaw", [
    { id: "curated:four-super-bowls", conceptId: "curated:four-super-bowls", text: "I quarterbacked Pittsburgh to four Super Bowl championships in six seasons.", band: "giveaway", facet: "accomplishments", revealPriority: 10 },
    { id: "curated:1978-mvp", conceptId: "curated:1978-mvp", text: "I was the NFL's Most Valuable Player in 1978.", band: "strong", facet: "accomplishments", revealPriority: 16 },
  ]],
  ["tom-brady", [{ id: "curated:seven-super-bowls", conceptId: "curated:seven-super-bowls", text: "I won seven Super Bowl championships as a starting quarterback.", band: "giveaway", facet: "accomplishments", revealPriority: 8 }]],
  ["troy-aikman", [{ id: "curated:three-super-bowls", conceptId: "curated:three-super-bowls", text: "I quarterbacked Dallas to three Super Bowl championships in four seasons.", band: "giveaway", facet: "accomplishments", revealPriority: 10 }]],
  ["andrew-luck", [
    { id: "curated:stanford", conceptId: "curated:stanford", text: "I played college football at Stanford.", band: "helpful", facet: "background", revealPriority: 20 },
    { id: "curated:first-overall-2012", conceptId: "curated:first-overall-2012", text: "Indianapolis selected me No. 1 overall in the 2012 NFL Draft.", band: "giveaway", facet: "career-path", revealPriority: 12 },
    { id: "curated:colts-only", conceptId: "curated:colts-only", text: "I spent my entire NFL career with the Indianapolis Colts.", band: "giveaway", facet: "career-path", revealPriority: 15 },
  ]],
  ["nfl-bronko-nagurski", [
    { id: "curated:both-sides-all-america", conceptId: "curated:both-sides-all-america", text: "At Minnesota I earned All-America honors at both fullback and tackle.", band: "strong", facet: "accomplishments", revealPriority: 15 },
    { id: "curated:bears-title-impact", conceptId: "curated:bears-title-impact", text: "I made defining plays for Chicago's 1932 and 1933 league titles and returned to score in the 1943 NFL Championship Game.", band: "giveaway", facet: "accomplishments", revealPriority: 10 },
  ]],
  ["nfl-doak-walker", [{ id: "curated:1948-heisman", conceptId: "curated:1948-heisman", text: "I won the 1948 Heisman Trophy at SMU.", band: "giveaway", facet: "accomplishments", revealPriority: 10 }]],
  ["eric-dickerson", [{ id: "curated:2105-rushing", conceptId: "curated:2105-rushing", text: "I set the NFL single-season rushing record with 2,105 yards in 1984.", band: "giveaway", facet: "accomplishments", revealPriority: 8 }]],
  ["nfl-harold-red-grange", [{ id: "curated:galloping-ghost", conceptId: "curated:galloping-ghost", text: "I was famously nicknamed the 'Galloping Ghost.'", band: "giveaway", facet: "nickname", revealPriority: 8 }]],
  ["nfl-jim-thorpe", [
    { id: "curated:carlisle-all-american", conceptId: "curated:carlisle-all-american", text: "I was a consensus All-American at Carlisle in both 1911 and 1912.", band: "strong", facet: "accomplishments", revealPriority: 15 },
    { id: "curated:harvard-upset", conceptId: "curated:harvard-upset", text: "In 1911 I kicked four field goals in Carlisle's 18-15 upset of Harvard.", band: "strong", facet: "accomplishments", revealPriority: 18 },
    { id: "curated:canton-championships", conceptId: "curated:canton-championships", text: "As a star and coach, I helped the Canton Bulldogs claim pro football championships in 1916, 1917, and 1919.", band: "giveaway", facet: "career-path", revealPriority: 10 },
  ]],
  ["ladainian-tomlinson", [{ id: "curated:2006-touchdown-record", conceptId: "curated:2006-touchdown-record", text: "I scored an NFL-record 31 total touchdowns in my 2006 MVP season.", band: "giveaway", facet: "accomplishments", revealPriority: 8 }]],
  ["nfl-paul-hornung", [
    { id: "curated:1961-mvp", conceptId: "curated:1961-mvp", text: "I was the AP NFL MVP for the 1961 season.", band: "giveaway", facet: "accomplishments", revealPriority: 10 },
    { id: "curated:four-lombardi-titles", conceptId: "curated:four-lombardi-titles", text: "I played on four of Vince Lombardi's five Green Bay championship teams.", band: "strong", facet: "accomplishments", revealPriority: 15 },
  ]],
  ["nfl-oj-simpson", [{ id: "curated:2003-in-fourteen", conceptId: "curated:2003-in-fourteen", text: "In 1973 I became the first NFL player to rush for 2,000 yards in a season, reaching 2,003 in 14 games.", band: "giveaway", facet: "accomplishments", revealPriority: 8 }]],
  ["nfl-ahman-green", [
    { id: "curated:packers-rushing-leader", conceptId: "curated:packers-rushing-leader", text: "I finished as the Packers' all-time leading rusher with 8,322 yards.", band: "giveaway", facet: "accomplishments", revealPriority: 10 },
    { id: "curated:2003-packers-record", conceptId: "curated:2003-packers-record", text: "I set Green Bay's single-season rushing record with 1,883 yards in 2003.", band: "strong", facet: "accomplishments", revealPriority: 16 },
  ]],
]);

function applyIdentityCuration(subjectId: string, clue: WhoAmIClue) {
  const key = `${subjectId}:${clue.conceptId ?? clue.id}`;
  const override = clueTextOverrides.get(key);
  if (override) return { ...clue, ...override };
  const facet = facetOverrides.get(key);
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
  if (/curated:/.test(id) || /curated-cfb1:/.test(id) || /curated-cfb2:/.test(id) || /curated-cfb3:/.test(id)) score += 45;
  if (/fact:cfb-(?:heisman-awards|all-america-selections|national-championships-won|nfl-draft-overall-pick)/.test(id)) score += 38;
  if (/fact:cfb-best-season-(?:passing-yards|passing-touchdowns|rushing-yards|rushing-touchdowns|receiving-yards|receiving-touchdowns|sacks|tackles-for-loss|defensive-interceptions)$/.test(id)) score += 22;
  if (/fact:cfb-career-(?:passing-yards|passing-touchdowns|rushing-yards|rushing-touchdowns|receiving-yards|receiving-touchdowns|sacks|defensive-interceptions)$/.test(id)) score += 14;
  if (/fact:cfb-career-(?:passing-completions|passing-attempts|rushing-attempts|receptions|interceptions-thrown)$/.test(id)) score -= 18;
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


export const NFL_WHO_AM_I_BATCH_2_SUBJECT_IDS = [
  "nfl-alvin-kamara",
  "nfl-ashton-jeanty",
  "nfl-bijan-robinson",
  "nfl-chris-johnson",
  "nfl-christian-mccaffrey",
  "nfl-calvin-johnson",
  "nfl-don-hutson",
  "nfl-jerry-rice",
  "nfl-larry-fitzgerald",
  "nfl-randy-moss",
  "nfl-raymond-berry",
  "nfl-terrell-owens",
  "nfl-a-j-brown",
  "nfl-a-j-green",
  "nfl-amari-cooper",
  "nfl-andre-johnson",
  "nfl-andre-reed",
  "nfl-anquan-boldin",
  "nfl-antonio-brown",
  "nfl-art-monk",
  "nfl-bob-hayes",
  "nfl-brandon-marshall",
  "nfl-chad-johnson",
  "nfl-charley-taylor",
  "nfl-charlie-joiner",
  "nfl-cliff-branch",
  "nfl-cris-carter",
  "nfl-davante-adams",
  "nfl-deandre-hopkins",
  "nfl-derrick-mason",
  "nfl-desean-jackson",
  "nfl-devin-hester",
  "nfl-dez-bryant",
  "nfl-don-maynard",
  "nfl-donald-driver",
  "nfl-drew-pearson",
  "nfl-fred-biletnikoff",
  "john-mackey",
  "antonio-gates",
  "nfl-charlie-sanders",
  "nfl-dave-casper",
  "nfl-jackie-smith",
  "jason-witten",
  "nfl-kellen-winslow",
  "mike-ditka",
  "ozzie-newsome",
  "shannon-sharpe",
  "nfl-tony-gonzalez",
  "nfl-travis-kelce",
  "zach-ertz",
] as const;

const batch2SubjectIds = new Set<string>(NFL_WHO_AM_I_BATCH_2_SUBJECT_IDS);

const batch2ActiveOrUnsettledSubjectIds = new Set<string>([
  "nfl-alvin-kamara",
  "nfl-ashton-jeanty",
  "nfl-bijan-robinson",
  "nfl-christian-mccaffrey",
  "nfl-a-j-brown",
  "nfl-davante-adams",
  "nfl-deandre-hopkins",
  "nfl-travis-kelce",
  "zach-ertz",
]);

const batch2PartialCareerCoverageSubjectIds = new Set<string>([
  "nfl-andre-reed",
  "nfl-cris-carter",
  "nfl-kellen-winslow",
]);

const batch2SuppressedCareerSpanSubjectIds = new Set<string>([
  ...batch2ActiveOrUnsettledSubjectIds,
  ...batch2PartialCareerCoverageSubjectIds,
  "shannon-sharpe",
  "jason-witten",
]);

const batch2RetainedIdentityConcepts = new Map<string, ReadonlySet<string>>([
  ["nfl-alvin-kamara", new Set(["identity:junior-college-reset-path", "identity:mark-ingram-brotherhood", "identity:free-spirit-game-day-style"])],
  ["nfl-ashton-jeanty", new Set(["identity:organized-soccer-before-football", "identity:european-road-game-travel", "identity:michael-myers-stance-change", "identity:cfb-ashton-jeanty--five-prep-positions"])],
  ["nfl-bijan-robinson", new Set(["identity:grandfather-referee-father-figure", "identity:signature-juke-craft"])],
  ["nfl-chris-johnson", new Set(["identity:chris-johnson-national-level-track-speed", "identity:chris-johnson-signed-as-wide-receiver", "identity:chris-johnson-424-combine", "identity:chris-johnson-cj2k-media-nickname"])],
  ["nfl-christian-mccaffrey", new Set(["identity:christian-mccaffrey-shanahan-generational-link", "identity:cfb-christian-mccaffrey--both-parents-stanford-athletes", "identity:cfb-christian-mccaffrey--grandfather-dave-sime-olympian", "identity:cfb-christian-mccaffrey--high-school-relay-record"])],
  ["nfl-calvin-johnson", new Set(["identity:megatron", "identity:retired-thirty"])],
  ["nfl-don-hutson", new Set(["identity:baseball-walkon", "identity:track", "identity:routes", "identity:multi-role", "identity:29-quarter", "identity:resume-nfl-don-hutson-01"])],
  ["nfl-jerry-rice", new Set(["identity:football-after-cutting-class", "identity:overlooked-by-big-programs", "identity:cooley-scouted-basketball", "identity:eighteen-ncaa-records", "identity:49ers-traded-up", "identity:edgewood-hill-workout"])],
  ["nfl-larry-fitzgerald", new Set(["identity:green", "identity:raiders-call", "identity:pr8-cfb-larry-fitzgerald--carter-moss-mentorship", "identity:valley-forge"])],
  ["nfl-randy-moss", new Set(["identity:wv-football-basketball-poy", "identity:marshall-i-aa-title", "identity:track-team-instant-champion", "identity:marshall-i-a-transition-star", "identity:drafted-21st-then-17-td"])],
  ["nfl-raymond-berry", new Set(["identity:special-shoes", "identity:twentieth-round", "identity:route-moves", "identity:resume-nfl-raymond-berry-01"])],
  ["nfl-terrell-owens", new Set(["identity:chattanooga-three-sport", "identity:basketball-ncaa-tournaments", "identity:little-known-third-rounder", "identity:developed-beside-jerry-rice", "identity:hall-speech-at-chattanooga"])],
  ["nfl-a-j-brown", new Set(["identity:pr7-eagles-receiver-legend-mentorship", "identity:pr9-cfbfast-r-player-4047646-a-j-brown--padres-draft-and-summer-baseball"])],
  ["nfl-a-j-green", new Set(["identity:pr7-fitzgerald-johnson-receiver-mentorship"])],
  ["nfl-amari-cooper", new Set(["identity:pr7-chess-informed-route-deception", "identity:pr7-quiet-observer-persona", "identity:pr7-route-running-technician-identity", "identity:pr7-coverage-diagnosis-quarterback-dialogue"])],
  ["nfl-andre-johnson", new Set(["identity:pr7-finnegans-rare-loss-of-composure"])],
  ["nfl-andre-reed", new Set(["identity:pr7-high-school-quarterback-to-receiver", "identity:pr7-yac-playing-identity", "identity:pr7-comeback-three-touchdown-role"])],
  ["nfl-anquan-boldin", new Set(["identity:pr7-college-quarterback-receiver-interchange", "identity:pr7-angry-football-receiver-style", "identity:pr7-shattered-face-return"])],
  ["nfl-antonio-brown", new Set(["identity:pr7-return-specialist-entry-role", "identity:pr7-obsessive-practice-work-ethic", "identity:pr7-separation-over-measurables", "identity:pr7-old-helmet-grievance"])],
  ["nfl-art-monk", new Set(["identity:pr7-actions-not-words-persona", "identity:pr7-prototype-big-physical-receiver"])],
  ["nfl-bob-hayes", new Set(["identity:pr7-unbeaten-college-sprinter", "identity:pr7-tokyo-worlds-fastest-human", "identity:pr7-bullet-bob-speed-identity", "identity:pr7-speed-forced-defensive-structure-change"])],
  ["nfl-brandon-marshall", new Set(["identity:pr7-high-school-quarterback-two-way-athlete", "identity:pr7-receiver-to-safety-and-back"])],
  ["nfl-chad-johnson", new Set(["identity:pr7-chad-johnson-soccer-first-love", "identity:pr7-chad-johnson-legal-ochocinco-name"])],
  ["nfl-charley-taylor", new Set(["identity:pr7-charley-taylor-usc-to-arizona-state", "identity:pr7-charley-taylor-running-back-to-receiver", "identity:pr7-charley-taylor-scout-to-posse-coach", "identity:resume-nfl-charley-taylor-01"])],
  ["nfl-charlie-joiner", new Set(["identity:pr7-charlie-joiner-drafted-defensive-back", "identity:pr7-charlie-joiner-age-39-receiver", "identity:pr7-charlie-joiner-retired-as-dual-career-leader", "identity:pr7-charlie-joiner-immediate-coaching-career", "identity:resume-nfl-charlie-joiner-01"])],
  ["nfl-cliff-branch", new Set(["identity:pr7-cliff-branch-junior-college-route", "identity:pr7-cliff-branch-ncaa-sprint-record", "identity:pr7-cliff-branch-al-davis-speed-evaluation", "identity:pr7-cliff-branch-maximum-length-reception", "identity:resume-nfl-cliff-branch-01"])],
  ["nfl-cris-carter", new Set(["identity:pr7-cris-carter-agent-money-lost-senior-year", "identity:pr7-cris-carter-eagles-release-sobriety-turning-point", "identity:pr7-cris-carter-jugs-machine-practice"])],
  ["nfl-davante-adams", new Set(["identity:pr7-davante-adams-accidental-fresno-recruitment", "identity:pr7-davante-adams-receiver-film-synthesis", "identity:pr9-cfb-davante-adams--basketball-first-point-guard", "identity:resume-cfb-davante-adams-02"])],
  ["nfl-deandre-hopkins", new Set(["identity:pr7-deandre-hopkins-mother-touchdown-ball-tradition", "identity:pr7-deandre-hopkins-nuk-pacifier-nickname", "identity:pr7-deandre-hopkins-sammy-watkins-catch-contests"])],
  ["nfl-derrick-mason", new Set(["identity:pr7-derrick-mason-too-slow-draft-evaluation", "identity:pr7-derrick-mason-late-receiving-breakout", "identity:pr7-derrick-mason-return-receiving-dual-career", "identity:pr7-derrick-mason-cracked-scapula-season", "identity:pr7-derrick-mason-chose-ravens-retirement"])],
  ["nfl-desean-jackson", new Set(["identity:pr7-desean-jackson-baseball-draft-choice", "identity:pr7-desean-jackson-miracle-new-meadowlands", "identity:resume-cfb-desean-jackson-01"])],
  ["nfl-devin-hester", new Set(["identity:pr7-devin-hester-anytime-deion", "identity:pr7-devin-hester-miami-three-phase-player", "identity:pr7-devin-hester-kick-away-effect", "identity:pr7-devin-hester-first-return-specialist-hof"])],
  ["nfl-dez-bryant", new Set(["identity:pr7-dez-bryant-x-celebration-meaning", "identity:pr7-dez-bryant-green-bay-catch-rule"])],
  ["nfl-don-maynard", new Set(["identity:pr7-don-maynard-cowboy-don", "identity:pr7-don-maynard-nfl-cfl-afl-path", "identity:pr7-don-maynard-first-new-york-titan", "identity:pr7-don-maynard-namath-first-meeting", "identity:resume-nfl-don-maynard-01"])],
  ["nfl-donald-driver", new Set(["identity:pr7-donald-driver-elite-high-jump", "identity:pr7-donald-driver-spur-of-moment-draft"])],
  ["nfl-drew-pearson", new Set(["identity:pr7-drew-pearson-tulsa-qb-to-wr", "identity:pr7-drew-pearson-undrafted-special-teams-entry", "identity:pr7-drew-pearson-staubach-apartment-workouts", "identity:pr7-drew-pearson-original-hail-mary", "identity:resume-nfl-drew-pearson-01"])],
  ["nfl-fred-biletnikoff", new Set(["identity:pr7-fred-biletnikoff-man-made-receiver", "identity:pr7-fred-biletnikoff-stickum-ritual", "identity:pr7-fred-biletnikoff-high-jump-multisport", "identity:pr7-fred-biletnikoff-raiders-receiver-coach", "identity:resume-nfl-fred-biletnikoff-01"])],
  ["john-mackey", new Set(["identity:syracuse-running-back-to-tight-end", "identity:redefined-tight-end-deep-threat", "identity:six-long-touchdowns-1966", "identity:super-bowl-v-deflection-touchdown", "identity:nflpa-president-mackey-v-nfl", "identity:resume-john-mackey-01"])],
  ["antonio-gates", new Set(["identity:pr7-no-college-football-basketball-path", "identity:pr7-saban-two-sport-conflict-transfer", "identity:pr7-three-school-basketball-odyssey", "identity:pr7-rob-murphy-pathway-mentor"])],
  ["nfl-charlie-sanders", new Set(["identity:pr7-charlie-sanders-multisport-background", "identity:pr7-charlie-sanders-receiving-tight-end-era", "identity:pr7-charlie-sanders-43-years-lions", "identity:resume-nfl-charlie-sanders-01"])],
  ["nfl-dave-casper", new Set(["identity:pr7-dave-casper-notre-dame-tackle-to-tight-end", "identity:pr7-dave-casper-ron-wolf-fake-name-call", "identity:pr7-dave-casper-lost-weight-to-stay-tight-end", "identity:pr7-dave-casper-holy-roller-rule-change", "identity:resume-nfl-dave-casper-01"])],
  ["nfl-jackie-smith", new Set(["identity:pr7-jackie-smith-track-hurdler", "identity:pr7-jackie-smith-tight-end-punter", "identity:pr7-jackie-smith-super-bowl-drop-perspective", "identity:resume-nfl-jackie-smith-01"])],
  ["jason-witten", new Set(["identity:pr7-jason-witten-defense-first-high-school", "identity:pr7-jason-witten-parcells-bavaro-mentor", "identity:pr7-jason-witten-lacerated-spleen-return"])],
  ["nfl-kellen-winslow", new Set(["identity:pr7-kellen-winslow-late-football-start", "identity:pr7-kellen-winslow-football-as-chess", "identity:pr7-kellen-winslow-basketball-box-out", "identity:pr7-kellen-winslow-epic-in-miami", "identity:pr7-kellen-winslow-knee-injury-comeback"])],
  ["mike-ditka", new Set(["identity:pr7-mike-ditka-dentistry-plan", "identity:pr7-mike-ditka-early-modern-tight-end", "identity:pr7-mike-ditka-letter-to-halas", "identity:pr7-mike-ditka-super-bowl-prediction", "identity:pr7-mike-ditka-player-assistant-head-coach-title-arc", "identity:resume-mike-ditka-01"])],
  ["ozzie-newsome", new Set(["identity:pr7-ozzie-newsome-wizard-of-oz-bear-bryant", "identity:pr7-ozzie-newsome-alabama-wr-to-nfl-te", "identity:pr7-ozzie-newsome-player-to-scout", "identity:pr7-ozzie-newsome-cleveland-baltimore-first-draft", "identity:pr7-ozzie-newsome-first-black-nfl-gm", "identity:resume-ozzie-newsome-01", "identity:resume-ozzie-newsome-02", "identity:resume-ozzie-newsome-03"])],
  ["shannon-sharpe", new Set(["identity:pr7-shannon-sharpe-brown-grocery-bags-college", "identity:pr7-shannon-sharpe-wr-te-tweener-nearly-cut"])],
  ["nfl-tony-gonzalez", new Set(["identity:pr7-tony-gonzalez-cal-basketball-sweet-sixteen", "identity:pr7-tony-gonzalez-goalpost-dunk", "identity:pr7-tony-gonzalez-kansas-city-contender-choice"])],
  ["nfl-travis-kelce", new Set(["identity:pr7-travis-kelce-quarterback-to-tight-end", "identity:pr7-travis-kelce-connor-barwin-blocking-lesson", "identity:pr7-travis-kelce-jason-path-mentor", "identity:pr7-travis-kelce-andy-reid-draft-warning"])],
  ["zach-ertz", new Set(["identity:pr7-zach-ertz-brent-jones-basketball-to-tight-end", "identity:pr7-zach-ertz-tennis-ball-hand-training"])],
]);

const batch2TextOverrides = new Map<string, Partial<WhoAmIClue>>([
  ["nfl-terrell-owens:identity:developed-beside-jerry-rice", { text: "Jerry Rice was my 49ers teammate for most of my first eight seasons, giving me a Hall of Fame standard at my own position.", facet: "relationships" }],
  ["nfl-anquan-boldin:identity:pr7-shattered-face-return", { text: "I returned to NFL action less than a month after an injury that caused multiple facial fractures and required surgical repair.", facet: "career-path" }],
  ["nfl-bob-hayes:identity:pr7-tokyo-worlds-fastest-human", { facet: "accomplishments" }],
  ["nfl-devin-hester:identity:pr7-devin-hester-miami-three-phase-player", { facet: "role" }],
  ["nfl-devin-hester:identity:pr7-devin-hester-kick-away-effect", { facet: "style" }],
  ["nfl-dez-bryant:identity:pr7-dez-bryant-green-bay-catch-rule", { text: "My apparent fourth-down catch at Green Bay in the 2014 playoffs was overturned under the catch rule and became one of the era's defining officiating controversies.", facet: "accomplishments" }],
  ["nfl-don-maynard:identity:pr7-don-maynard-first-new-york-titan", { facet: "career-path" }],
  ["nfl-drew-pearson:identity:pr7-drew-pearson-staubach-apartment-workouts", { text: "Roger Staubach became my Cowboys teammate and a key throwing partner as I developed from an undrafted player into a starting receiver.", facet: "relationships" }],
  ["nfl-fred-biletnikoff:identity:pr7-fred-biletnikoff-stickum-ritual", { facet: "style" }],
  ["nfl-charlie-sanders:identity:pr7-charlie-sanders-receiving-tight-end-era", { facet: "role" }],
  ["nfl-dave-casper:identity:pr7-dave-casper-holy-roller-rule-change", { text: "I recovered the final fumble in the end zone on the Raiders' game-winning 1978 'Holy Roller,' a play that helped trigger a rule change.", facet: "accomplishments" }],
  ["jason-witten:identity:pr7-jason-witten-parcells-bavaro-mentor", { text: "Bill Parcells coached me early in Dallas and repeatedly used former Giants tight end Mark Bavaro as my toughness standard.", facet: "relationships" }],
  ["nfl-kellen-winslow:identity:pr7-kellen-winslow-basketball-box-out", { facet: "style" }],
  ["nfl-tony-gonzalez:identity:pr7-tony-gonzalez-kansas-city-contender-choice", { facet: "career-path" }],
  ["nfl-bijan-robinson:identity:signature-juke-craft", { band: "helpful", facet: "style" }],
  ["nfl-jerry-rice:identity:overlooked-by-big-programs", { band: "helpful", facet: "background" }],
  ["nfl-a-j-brown:identity:pr9-cfbfast-r-player-4047646-a-j-brown--padres-draft-and-summer-baseball", { band: "helpful", facet: "background" }],
  ["nfl-charlie-joiner:identity:pr7-charlie-joiner-drafted-defensive-back", { band: "helpful", facet: "background" }],
  ["nfl-cris-carter:identity:pr7-cris-carter-agent-money-lost-senior-year", { band: "helpful", facet: "background" }],
  ["nfl-cris-carter:identity:pr7-cris-carter-jugs-machine-practice", { band: "helpful", facet: "style" }],
  ["nfl-deandre-hopkins:identity:pr7-deandre-hopkins-sammy-watkins-catch-contests", { band: "helpful", facet: "identity" }],
  ["nfl-devin-hester:identity:pr7-devin-hester-anytime-deion", { band: "helpful", facet: "identity" }],
  ["nfl-devin-hester:identity:pr7-devin-hester-kick-away-effect", { band: "helpful", facet: "style" }],
  ["mike-ditka:identity:pr7-mike-ditka-dentistry-plan", { band: "helpful", facet: "identity" }],
  ["mike-ditka:identity:pr7-mike-ditka-early-modern-tight-end", { band: "helpful", facet: "style" }],
  ["ozzie-newsome:identity:pr7-ozzie-newsome-alabama-wr-to-nfl-te", { band: "helpful", facet: "background" }],
  ["ozzie-newsome:identity:pr7-ozzie-newsome-wizard-of-oz-bear-bryant", { band: "helpful", facet: "identity" }],
  ["shannon-sharpe:identity:pr7-shannon-sharpe-wr-te-tweener-nearly-cut", { band: "helpful", facet: "style" }],
  ["nfl-tony-gonzalez:identity:pr7-tony-gonzalez-cal-basketball-sweet-sixteen", { band: "helpful", facet: "background" }],
  ["nfl-travis-kelce:identity:pr7-travis-kelce-quarterback-to-tight-end", { band: "helpful", facet: "background" }],
  ["nfl-travis-kelce:identity:pr7-travis-kelce-connor-barwin-blocking-lesson", { band: "helpful", facet: "style" }],
]);

function batch2Supplement(
  id: string,
  text: string,
  band: WhoAmIClue["band"] = "strong",
  facet: WhoAmIClue["facet"] = "accomplishments",
  revealPriority = 16,
): WhoAmIClue {
  return { id: "curated2:" + id, conceptId: "curated2:" + id, text, band, facet, revealPriority };
}

const batch2SupplementalClues = new Map<string, readonly WhoAmIClue[]>([
  ["nfl-alvin-kamara", [
    batch2Supplement("kamara-draft", "New Orleans selected me in the third round, No. 67 overall, in the 2017 NFL Draft.", "strong", "career-path"),
    batch2Supplement("kamara-oroy", "I was the AP Offensive Rookie of the Year in 2017.", "strong"),
    batch2Supplement("kamara-six-td", "On Christmas Day 2020, I tied the NFL record by rushing for six touchdowns in one game.", "giveaway", "accomplishments", 8),
    batch2Supplement("kamara-41", "I became one of the defining No. 41s in Saints history.", "strong", "identity"),
    batch2Supplement("kamara-pro-bowls", "I earned five Pro Bowl selections in my first five NFL seasons.", "strong"),
    batch2Supplement("kamara-saints-rusher", "By 2026 I had become the Saints' all-time leading rusher.", "giveaway", "accomplishments", 10),
    batch2Supplement("kamara-saints-current", "I remained with New Orleans for the 2026 season after restructuring my contract.", "strong", "career-path"),
  ]],
  ["nfl-ashton-jeanty", [
    batch2Supplement("jeanty-boise", "I became a national star at Boise State.", "helpful", "background"),
    batch2Supplement("jeanty-2601", "I rushed for 2,601 yards in the 2024 college season.", "giveaway", "production", 9),
    batch2Supplement("jeanty-awards", "I won both the Maxwell Award and Doak Walker Award in 2024.", "giveaway", "accomplishments", 8),
    batch2Supplement("jeanty-heisman-runnerup", "I finished second in the 2024 Heisman Trophy voting.", "strong"),
    batch2Supplement("jeanty-sixth", "Las Vegas selected me No. 6 overall in the 2025 NFL Draft.", "giveaway", "career-path", 10),
    batch2Supplement("jeanty-raiders-2", "I wear No. 2 for the Raiders.", "strong", "identity"),
    batch2Supplement("jeanty-unanimous-aa", "I became the first unanimous All-American in Boise State football history in 2024.", "strong", "accomplishments"),
    batch2Supplement("jeanty-30-touchdowns", "I scored 30 total touchdowns during Boise State's 2024 season.", "strong", "production"),
    batch2Supplement("jeanty-cfp", "I helped Boise State win the 2024 Mountain West title and earn the No. 3 seed in the College Football Playoff.", "strong", "accomplishments"),
  ]],
  ["nfl-bijan-robinson", [
    batch2Supplement("bijan-texas", "I played college football at Texas.", "helpful", "background"),
    batch2Supplement("bijan-doak", "I won the Doak Walker Award in my final season at Texas.", "strong"),
    batch2Supplement("bijan-draft", "Atlanta selected me No. 8 overall in the 2023 NFL Draft.", "giveaway", "career-path", 10),
    batch2Supplement("bijan-7", "I wear No. 7 for the Falcons.", "helpful", "identity"),
    batch2Supplement("bijan-2025-allpro", "I earned first-team AP All-Pro honors at running back for the 2025 season.", "giveaway", "accomplishments", 10),
    batch2Supplement("bijan-scrimmage-2025", "I led the NFL with 2,298 yards from scrimmage in 2025.", "strong", "production"),
    batch2Supplement("bijan-probowls", "I made the Pro Bowl in both 2024 and 2025.", "strong"),
    batch2Supplement("bijan-arizona-record", "I left high school as Arizona's all-time rushing leader.", "helpful", "background"),
    batch2Supplement("bijan-unanimous-aa", "I was a unanimous first-team All-American at Texas in 2022.", "strong", "accomplishments"),
    batch2Supplement("bijan-2024-rushing", "I rushed for 1,456 yards and 14 touchdowns for Atlanta in 2024.", "strong", "production"),
  ]],
  ["nfl-chris-johnson", [
    batch2Supplement("cj-draft", "Tennessee selected me No. 24 overall in the 2008 NFL Draft.", "strong", "career-path"),
    batch2Supplement("cj-2009", "I rushed for 2,006 yards in 2009 and won AP Offensive Player of the Year.", "giveaway", "accomplishments", 8),
    batch2Supplement("cj-scrimmage", "My 2,509 yards from scrimmage in 2009 set an NFL single-season record.", "giveaway", "production", 9),
  ]],
  ["nfl-christian-mccaffrey", [
    batch2Supplement("cmc-1000-1000", "In 2019 I became the third player in NFL history with 1,000 rushing yards and 1,000 receiving yards in the same season.", "giveaway", "accomplishments", 8),
    batch2Supplement("cmc-opoy", "I won AP Offensive Player of the Year for the 2023 season.", "giveaway", "accomplishments", 8),
    batch2Supplement("cmc-rushing-title", "I led the NFL in rushing yards in 2023.", "strong", "production"),
    batch2Supplement("cmc-23", "I wear No. 23 for San Francisco.", "strong", "identity"),
  ]],
  ["nfl-calvin-johnson", [
    batch2Supplement("calvin-1964", "I set the NFL single-season receiving-yardage record with 1,964 yards in 2012.", "giveaway", "accomplishments", 8),
    batch2Supplement("calvin-hof", "I was elected to the Pro Football Hall of Fame in my first year of eligibility.", "strong"),
    batch2Supplement("calvin-lions-only", "I spent my entire NFL career with Detroit.", "giveaway", "career-path", 11),
  ]],
  ["nfl-don-hutson", [
    batch2Supplement("hutson-mvps", "I won back-to-back NFL MVP awards in 1941 and 1942.", "giveaway", "accomplishments", 9),
    batch2Supplement("hutson-packers", "I spent my entire pro career with Green Bay and helped the Packers win three NFL championships.", "giveaway", "career-path", 10),
  ]],
  ["nfl-jerry-rice", [
    batch2Supplement("rice-three-sb", "I won three Super Bowls with San Francisco.", "strong", "accomplishments", 9),
    batch2Supplement("rice-sb23-mvp", "I was the MVP of Super Bowl XXIII after catching 11 passes for 215 yards and a touchdown.", "giveaway", "accomplishments", 8),
    batch2Supplement("rice-records", "I retired as the NFL's career leader in receptions, receiving yards and receiving touchdowns.", "giveaway", "accomplishments", 7),
    batch2Supplement("rice-mvsu", "I played college football at Mississippi Valley State.", "helpful", "background"),
    batch2Supplement("rice-80", "No. 80 became my signature number in San Francisco.", "helpful", "identity"),
    batch2Supplement("rice-route-work", "My receiving identity was built on precise route running and relentless conditioning.", "helpful", "style"),
  ]],
  ["nfl-larry-fitzgerald", [
    batch2Supplement("fitz-cardinals-only", "I spent all 17 of my NFL seasons with the Arizona Cardinals.", "giveaway", "career-path", 10),
    batch2Supplement("fitz-probowls", "I was selected to 11 Pro Bowls.", "strong"),
    batch2Supplement("fitz-sb-run", "During Arizona's run to Super Bowl XLIII, I produced one of the most prolific receiving postseasons in NFL history.", "strong", "accomplishments"),
  ]],
  ["nfl-randy-moss", [
    batch2Supplement("moss-23", "I set the NFL single-season record with 23 receiving touchdowns in 2007.", "giveaway", "accomplishments", 8),
    batch2Supplement("moss-oroy", "I was AP Offensive Rookie of the Year after catching 17 touchdowns in 1998.", "giveaway", "accomplishments", 10),
    batch2Supplement("moss-probowls", "I was selected to six Pro Bowls and four first-team All-Pro teams.", "strong"),
  ]],
  ["nfl-raymond-berry", [
    batch2Supplement("berry-unitas", "Johnny Unitas and I formed one of the defining quarterback-receiver partnerships of the 1950s Colts.", "strong", "relationships"),
    batch2Supplement("berry-1958", "In the 1958 NFL Championship Game I caught 12 passes for 178 yards and a touchdown in Baltimore's overtime win.", "giveaway", "accomplishments", 8),
    batch2Supplement("berry-records", "I retired as the NFL career leader in both receptions and receiving yards.", "strong"),
  ]],
  ["nfl-terrell-owens", [
    batch2Supplement("to-path", "My peak NFL stops included San Francisco, Philadelphia and Dallas.", "strong", "career-path"),
    batch2Supplement("to-sb39", "I returned from a severe ankle injury to catch nine passes for 122 yards in Super Bowl XXXIX.", "giveaway", "accomplishments", 9),
    batch2Supplement("to-allpro", "I earned five first-team All-Pro selections and six Pro Bowl selections.", "strong"),
    batch2Supplement("to-20-catches", "I once caught 20 passes in a single game for San Francisco.", "strong", "production"),
  ]],
  ["nfl-a-j-brown", [
    batch2Supplement("ajb-olemiss", "I played college football at Ole Miss.", "helpful", "background"),
    batch2Supplement("ajb-draft", "Tennessee selected me No. 51 overall in the 2019 NFL Draft.", "strong", "career-path"),
    batch2Supplement("ajb-metcalf", "DK Metcalf was my college teammate at Ole Miss.", "strong", "relationships"),
    batch2Supplement("ajb-eagles-trade", "I was traded from Tennessee to Philadelphia during the first round of the 2022 NFL Draft.", "giveaway", "career-path", 10),
    batch2Supplement("ajb-eagles-record", "My 1,496 receiving yards in 2022 set an Eagles single-season franchise record.", "strong", "production"),
    batch2Supplement("ajb-superbowl", "I won Super Bowl LIX with Philadelphia.", "giveaway", "accomplishments", 9),
    batch2Supplement("ajb-patriots", "In 2026 I was traded to New England, reuniting with former Titans coach Mike Vrabel.", "giveaway", "career-path", 9),
    batch2Supplement("ajb-padres", "The Padres drafted me in baseball before my NFL career.", "strong", "career-path"),
    batch2Supplement("ajb-11", "No. 11 became my signature number with both Tennessee and Philadelphia.", "helpful", "identity"),
    batch2Supplement("ajb-physical-yac", "I became known as a physical catch-and-run receiver who could create yards through contact.", "helpful", "style"),
  ]],
  ["nfl-a-j-green", [
    batch2Supplement("ajg-georgia", "I starred at Georgia before entering the NFL.", "helpful", "background"),
    batch2Supplement("ajg-draft", "Cincinnati selected me No. 4 overall in the 2011 NFL Draft.", "giveaway", "career-path", 10),
    batch2Supplement("ajg-bengals", "I spent my first 10 NFL seasons with the Bengals before finishing with Arizona.", "strong", "career-path"),
    batch2Supplement("ajg-seven-probowls", "I made the Pro Bowl in each of my first seven NFL seasons.", "giveaway", "accomplishments", 10),
    batch2Supplement("ajg-five-1k", "I opened my career with five consecutive 1,000-yard receiving seasons.", "strong", "production"),
    batch2Supplement("ajg-18", "I became closely associated with No. 18 in Cincinnati.", "strong", "identity"),
  ]],
  ["nfl-amari-cooper", [
    batch2Supplement("cooper-alabama", "I won the Biletnikoff Award at Alabama.", "strong", "accomplishments"),
    batch2Supplement("cooper-fourth", "The Raiders selected me No. 4 overall in the 2015 NFL Draft.", "giveaway", "career-path", 10),
    batch2Supplement("cooper-cowboys", "A midseason trade sent me from the Raiders to Dallas in 2018.", "strong", "career-path"),
    batch2Supplement("cooper-browns", "I later posted back-to-back 1,000-yard seasons for Cleveland.", "strong", "production"),
    batch2Supplement("cooper-probowls", "I was selected to five Pro Bowls.", "strong"),
  ]],
  ["nfl-andre-johnson", [
    batch2Supplement("andre-miami", "I played college football at Miami and won a national championship there.", "strong", "background"),
    batch2Supplement("andre-third", "Houston selected me No. 3 overall in the 2003 NFL Draft.", "giveaway", "career-path", 10),
    batch2Supplement("andre-texans", "I became the defining receiver of the Texans' early franchise history.", "strong", "career-path"),
    batch2Supplement("andre-probowls", "I was selected to seven Pro Bowls and twice earned first-team All-Pro honors.", "strong"),
    batch2Supplement("andre-yard-titles", "I led the NFL in receiving yards in both 2008 and 2009.", "strong", "production"),
    batch2Supplement("andre-hof", "I became the first longtime Houston Texan elected to the Pro Football Hall of Fame.", "giveaway", "accomplishments", 10),
    batch2Supplement("andre-late-path", "After 12 seasons in Houston, I finished with Indianapolis and Tennessee.", "strong", "career-path"),
  ]],
  ["nfl-andre-reed", [
    batch2Supplement("reed-kutztown", "I played college football at Division II Kutztown.", "strong", "background"),
    batch2Supplement("reed-bills", "Buffalo drafted me in the fourth round in 1985, and I spent 15 seasons with the Bills.", "giveaway", "career-path", 10),
    batch2Supplement("reed-kgun", "I was a core target for Jim Kelly in Buffalo's K-Gun offense.", "giveaway", "relationships", 10),
    batch2Supplement("reed-four-superbowls", "I played in four consecutive Super Bowls with Buffalo.", "giveaway", "accomplishments", 9),
    batch2Supplement("reed-seven-probowls", "I was selected to seven Pro Bowls.", "strong"),
    batch2Supplement("reed-hof", "I was inducted into the Pro Football Hall of Fame in 2014.", "strong"),
    batch2Supplement("reed-951", "I finished my career with 951 receptions.", "strong", "production"),
    batch2Supplement("reed-washington", "My final NFL season came with Washington after 15 years in Buffalo.", "strong", "career-path"),
  ]],
  ["nfl-anquan-boldin", [
    batch2Supplement("boldin-draft", "Arizona selected me in the second round of the 2003 NFL Draft.", "strong", "career-path"),
    batch2Supplement("boldin-debut", "In my NFL debut I caught 10 passes for 217 yards and two touchdowns.", "giveaway", "production", 10),
    batch2Supplement("boldin-oroy", "I was AP Offensive Rookie of the Year in 2003.", "strong"),
    batch2Supplement("boldin-sb47", "I won Super Bowl XLVII with Baltimore and led the Ravens with 104 receiving yards in that game.", "giveaway", "accomplishments", 9),
    batch2Supplement("boldin-path", "My NFL career took me from Arizona to Baltimore, San Francisco and Detroit.", "strong", "career-path"),
  ]],
  ["nfl-antonio-brown", [
    batch2Supplement("ab-cmu", "I played college football at Central Michigan.", "helpful", "background"),
    batch2Supplement("ab-sixth", "Pittsburgh selected me in the sixth round of the 2010 NFL Draft.", "strong", "career-path"),
    batch2Supplement("ab-steelers", "I became a perennial All-Pro as the Steelers' No. 84.", "giveaway", "identity", 10),
    batch2Supplement("ab-four-allpro", "I earned first-team All-Pro honors four consecutive seasons from 2014 through 2017.", "giveaway", "accomplishments", 9),
    batch2Supplement("ab-sb55", "I won Super Bowl LV with Tampa Bay and caught a touchdown in the game.", "strong", "accomplishments"),
  ]],
  ["nfl-art-monk", [
    batch2Supplement("monk-three-sb", "I was part of all three Washington Super Bowl championship teams under Joe Gibbs.", "giveaway", "accomplishments", 9),
    batch2Supplement("monk-106", "My 106 catches in 1984 set an NFL single-season record.", "giveaway", "production", 9),
    batch2Supplement("monk-streak", "I once held the NFL record with a 183-game streak with a reception.", "strong", "accomplishments"),
    batch2Supplement("monk-career-catches", "In 1992 I became the NFL's career receptions leader with my 820th catch.", "strong", "accomplishments"),
    batch2Supplement("monk-posse", "I was the veteran pillar of Washington's 'Posse' receiving trio with Gary Clark and Ricky Sanders.", "giveaway", "relationships", 10),
  ]],
  ["nfl-bob-hayes", [
    batch2Supplement("hayes-cowboys", "I spent most of my NFL career stretching the field for the Dallas Cowboys.", "strong", "career-path"),
    batch2Supplement("hayes-sb6", "I won Super Bowl VI with Dallas after previously winning Olympic sprint gold.", "giveaway", "accomplishments", 9),
    batch2Supplement("hayes-hof", "I was inducted into the Pro Football Hall of Fame in 2009.", "strong"),
  ]],
  ["nfl-brandon-marshall", [
    batch2Supplement("marshall-ucf", "I played college football at UCF before Denver drafted me in the fourth round.", "strong", "career-path"),
    batch2Supplement("marshall-21", "I set the NFL single-game receptions record with 21 catches against Indianapolis in 2009.", "giveaway", "accomplishments", 8),
    batch2Supplement("marshall-probowls", "I was selected to six Pro Bowls.", "strong"),
    batch2Supplement("marshall-four-teams-1k", "I recorded 1,000-yard receiving seasons for Denver, Miami, Chicago and the Jets.", "giveaway", "career-path", 10),
    batch2Supplement("marshall-cutler", "Jay Cutler was my quarterback in both Denver and Chicago.", "strong", "relationships"),
    batch2Supplement("marshall-path", "My prime NFL stops included Denver, Miami, Chicago and the New York Jets.", "strong", "career-path"),
  ]],
  ["nfl-chad-johnson", [
    batch2Supplement("ochocinco-oregon-state", "I played college football at Oregon State after a junior-college stop.", "helpful", "background"),
    batch2Supplement("ochocinco-draft", "Cincinnati selected me No. 36 overall in the 2001 NFL Draft.", "strong", "career-path"),
    batch2Supplement("ochocinco-85", "No. 85 became central to my Bengals identity and eventually to my Ochocinco persona.", "giveaway", "identity", 9),
    batch2Supplement("ochocinco-probowls", "I was selected to six Pro Bowls.", "strong"),
    batch2Supplement("ochocinco-2006", "I led the NFL in receiving yards in 2006.", "strong", "production"),
    batch2Supplement("ochocinco-patriots", "After 10 seasons in Cincinnati, I spent my final NFL season with New England.", "strong", "career-path"),
  ]],
  ["nfl-charley-taylor", [
    batch2Supplement("taylor-washington", "I spent my entire 14-season NFL career with Washington.", "giveaway", "career-path", 10),
    batch2Supplement("taylor-receptions-record", "I retired as the NFL's all-time leader in receptions.", "strong", "accomplishments"),
    batch2Supplement("taylor-sb7", "I helped Washington reach Super Bowl VII after the 1972 season.", "strong", "accomplishments"),
    batch2Supplement("taylor-hof", "I was inducted into the Pro Football Hall of Fame in 1984.", "strong"),
  ]],
  ["nfl-charlie-joiner", [
    batch2Supplement("joiner-path", "My pro career ran through Houston, Cincinnati and San Diego.", "strong", "career-path"),
    batch2Supplement("joiner-air-coryell", "I became a key target for Dan Fouts in San Diego's 'Air Coryell' offense.", "giveaway", "relationships", 9),
    batch2Supplement("joiner-hof", "I was inducted into the Pro Football Hall of Fame in 1996.", "strong"),
    batch2Supplement("joiner-grambling", "I played college football at Grambling State.", "helpful", "background"),
    batch2Supplement("joiner-18", "No. 18 became my signature number in San Diego.", "helpful", "identity"),
    batch2Supplement("joiner-route-technique", "I became known as a precise route runner in San Diego's vertical passing attack.", "helpful", "style"),
  ]],
  ["nfl-cliff-branch", [
    batch2Supplement("branch-raiders", "I spent my entire NFL career with the Raiders.", "giveaway", "career-path", 10),
    batch2Supplement("branch-three-sb", "I won Super Bowls XI, XV and XVIII with the Raiders.", "giveaway", "accomplishments", 8),
    batch2Supplement("branch-allpro", "I earned first-team All-Pro honors three straight seasons from 1974 through 1976.", "strong"),
    batch2Supplement("branch-hof", "I was posthumously inducted into the Pro Football Hall of Fame in 2022.", "strong"),
  ]],
  ["nfl-cris-carter", [
    batch2Supplement("carter-ohio-state", "I starred at Ohio State before entering the NFL through the supplemental draft.", "helpful", "background"),
    batch2Supplement("carter-vikings", "Minnesota claimed me after Philadelphia released me, and the Vikings became the team most associated with my career.", "giveaway", "career-path", 10),
    batch2Supplement("carter-buddy-quote", "Buddy Ryan famously explained my Eagles release by saying that all I did was catch touchdowns.", "giveaway", "identity", 9),
    batch2Supplement("carter-probowls", "I was selected to eight consecutive Pro Bowls from 1993 through 2000.", "strong"),
    batch2Supplement("carter-tds", "I finished with 130 career receiving touchdowns.", "strong", "production"),
    batch2Supplement("carter-moss", "Randy Moss joined me in Minnesota in 1998, creating one of the era's defining receiver tandems.", "giveaway", "relationships", 10),
    batch2Supplement("carter-hof", "I was inducted into the Pro Football Hall of Fame in 2013.", "strong"),
    batch2Supplement("carter-80", "No. 80 became my signature number in Minnesota.", "helpful", "identity"),
  ]],
  ["nfl-davante-adams", [
    batch2Supplement("adams-fresno", "I starred at Fresno State before entering the NFL.", "helpful", "background"),
    batch2Supplement("adams-17", "No. 17 became my signature number in Green Bay and remained my number with the Rams.", "strong", "identity"),
    batch2Supplement("adams-allpro", "I earned three consecutive first-team All-Pro selections from 2020 through 2022.", "giveaway", "accomplishments", 10),
    batch2Supplement("adams-18td", "I led the NFL with 18 receiving touchdowns in 2020.", "strong", "production"),
    batch2Supplement("adams-path", "My NFL path went from Green Bay to Las Vegas, the New York Jets and the Los Angeles Rams.", "giveaway", "career-path", 9),
    batch2Supplement("adams-rams", "I remained the Rams' No. 17 for the 2026 season.", "strong", "career-path"),
  ]],
  ["nfl-deandre-hopkins", [
    batch2Supplement("hopkins-clemson", "I starred at Clemson before entering the NFL.", "helpful", "background"),
    batch2Supplement("hopkins-draft", "Houston selected me No. 27 overall in the 2013 NFL Draft.", "strong", "career-path"),
    batch2Supplement("hopkins-path", "My NFL career included Houston, Arizona, Tennessee, Kansas City and Baltimore.", "giveaway", "career-path", 9),
    batch2Supplement("hopkins-allpro", "I earned three first-team All-Pro selections and five Pro Bowl selections.", "strong"),
    batch2Supplement("hopkins-hail-murray", "I caught the 2020 'Hail Murray' over multiple Bills defenders to win a game for Arizona.", "giveaway", "accomplishments", 8),
    batch2Supplement("hopkins-2017td", "I led the NFL in receiving touchdowns in 2017.", "strong", "production"),
    batch2Supplement("hopkins-sammy", "Sammy Watkins was my Clemson teammate and practice rival at wide receiver.", "strong", "relationships"),
    batch2Supplement("hopkins-10", "No. 10 became my signature number across my long runs in Houston and Arizona.", "helpful", "identity"),
    batch2Supplement("hopkins-trade-arizona", "Houston traded me to Arizona in 2020 in the deal that brought running back David Johnson to the Texans.", "helpful", "background"),
    batch2Supplement("hopkins-hands", "I became known for elite hands, body control and contested-catch ability along the boundary.", "helpful", "style"),
  ]],
  ["nfl-derrick-mason", [
    batch2Supplement("mason-titans-ravens", "My two defining NFL stops were Tennessee and Baltimore.", "strong", "career-path"),
    batch2Supplement("mason-probowls", "I was selected to two Pro Bowls.", "strong"),
    batch2Supplement("mason-sb34", "I played in Super Bowl XXXIV with Tennessee.", "strong", "accomplishments"),
  ]],
  ["nfl-desean-jackson", [
    batch2Supplement("djax-cal", "I starred at California before Philadelphia drafted me No. 49 overall in 2008.", "strong", "career-path"),
    batch2Supplement("djax-eagles", "I became one of the NFL's defining deep threats and returners with Philadelphia.", "giveaway", "career-path", 10),
    batch2Supplement("djax-probowls", "I was selected to three Pro Bowls.", "strong"),
    batch2Supplement("djax-path", "My long career later included Washington, Tampa Bay, the Rams, Raiders and Ravens.", "strong", "career-path"),
  ]],
  ["nfl-devin-hester", [
    batch2Supplement("hester-draft", "Chicago selected me in the second round of the 2006 NFL Draft out of Miami.", "strong", "career-path"),
    batch2Supplement("hester-bears", "I became the most feared returner of my era with the Chicago Bears.", "giveaway", "career-path", 10),
    batch2Supplement("hester-sb41", "I opened Super Bowl XLI by returning the kickoff for a touchdown.", "giveaway", "accomplishments", 8),
    batch2Supplement("hester-20", "I finished with an NFL-record 20 combined return touchdowns.", "giveaway", "accomplishments", 8),
    batch2Supplement("hester-probowls", "I was selected to four Pro Bowls as a return specialist.", "strong"),
    batch2Supplement("hester-hof", "I became the first primary return specialist elected to the Pro Football Hall of Fame.", "giveaway", "accomplishments", 9),
    batch2Supplement("hester-miami", "I played college football at Miami.", "helpful", "background"),
    batch2Supplement("hester-23", "No. 23 became my signature number in Chicago.", "helpful", "identity"),
  ]],
  ["nfl-dez-bryant", [
    batch2Supplement("dez-okstate", "I starred at Oklahoma State before entering the NFL.", "helpful", "background"),
    batch2Supplement("dez-draft", "Dallas selected me No. 24 overall in the 2010 NFL Draft.", "strong", "career-path"),
    batch2Supplement("dez-88", "I became one of the Cowboys' signature No. 88 receivers.", "giveaway", "identity", 9),
    batch2Supplement("dez-16td", "I led the NFL with 16 receiving touchdowns in 2014.", "strong", "production"),
    batch2Supplement("dez-probowls", "I was selected to three Pro Bowls.", "strong"),
  ]],
  ["nfl-don-maynard", [
    batch2Supplement("maynard-jets", "I became Joe Namath's Hall of Fame receiving partner for the New York Jets.", "giveaway", "relationships", 9),
    batch2Supplement("maynard-sb3", "I was part of the Jets team that upset Baltimore in Super Bowl III.", "giveaway", "accomplishments", 8),
    batch2Supplement("maynard-record", "I retired as the NFL's career receiving-yardage leader.", "strong", "accomplishments"),
  ]],
  ["nfl-donald-driver", [
    batch2Supplement("driver-draft", "Green Bay selected me in the seventh round of the 1999 NFL Draft out of Alcorn State.", "strong", "career-path"),
    batch2Supplement("driver-packers-only", "I spent my entire 14-season NFL career with the Packers.", "giveaway", "career-path", 10),
    batch2Supplement("driver-sb45", "I won Super Bowl XLV with Green Bay.", "strong"),
    batch2Supplement("driver-records", "I retired as Green Bay's career leader in both receptions and receiving yards.", "giveaway", "accomplishments", 9),
    batch2Supplement("driver-probowls", "I was selected to three Pro Bowls.", "strong"),
  ]],
  ["nfl-drew-pearson", [
    batch2Supplement("pearson-cowboys", "I spent my entire NFL career with the Dallas Cowboys.", "giveaway", "career-path", 10),
    batch2Supplement("pearson-sb12", "I won Super Bowl XII with Dallas.", "strong"),
    batch2Supplement("pearson-88", "I helped establish the Cowboys' tradition of star receivers wearing No. 88.", "giveaway", "identity", 9),
    batch2Supplement("pearson-hof", "I was inducted into the Pro Football Hall of Fame in 2021.", "strong"),
  ]],
  ["nfl-fred-biletnikoff", [
    batch2Supplement("biletnikoff-raiders", "I spent my NFL career with the Oakland Raiders.", "giveaway", "career-path", 10),
    batch2Supplement("biletnikoff-sb11", "I was named MVP of Super Bowl XI after Oakland's first championship.", "giveaway", "accomplishments", 8),
    batch2Supplement("biletnikoff-hof", "I was inducted into the Pro Football Hall of Fame in 1988.", "strong"),
    batch2Supplement("biletnikoff-award", "College football's annual award for the nation's outstanding receiver bears my name.", "giveaway", "identity", 8),
  ]],
  ["john-mackey", [
    batch2Supplement("mackey-allpro", "I was first-team All-NFL three straight seasons from 1966 through 1968.", "strong"),
    batch2Supplement("mackey-unitas", "Johnny Unitas was my quarterback for most of my Baltimore Colts career.", "strong", "relationships"),
  ]],
  ["antonio-gates", [
    batch2Supplement("gates-116", "My 116 receiving touchdowns remain the NFL record for a tight end.", "giveaway", "accomplishments", 8),
    batch2Supplement("gates-hof", "I was inducted into the Pro Football Hall of Fame in 2025.", "strong"),
    batch2Supplement("gates-probowls", "I was selected to eight consecutive Pro Bowls.", "strong"),
    batch2Supplement("gates-chargers-only", "I spent all 16 of my NFL seasons with the Chargers.", "giveaway", "career-path", 10),
    batch2Supplement("gates-allpro", "I earned first-team All-Pro honors three straight seasons from 2004 through 2006.", "strong", "accomplishments"),
  ]],
  ["nfl-charlie-sanders", [
    batch2Supplement("sanders-lions", "I spent my entire 10-season NFL career with Detroit.", "giveaway", "career-path", 10),
    batch2Supplement("sanders-hof", "I was inducted into the Pro Football Hall of Fame in 2007.", "strong"),
    batch2Supplement("sanders-decade", "I was named to the NFL's All-Decade Team of the 1970s.", "strong"),
    batch2Supplement("sanders-lions-record", "I retired as the Lions' all-time leader in receptions.", "strong", "accomplishments"),
  ]],
  ["nfl-dave-casper", [
    batch2Supplement("casper-raiders", "I became a Hall of Fame tight end with the Oakland Raiders.", "giveaway", "career-path", 10),
    batch2Supplement("casper-ghost", "My 42-yard catch in the 1977 playoff classic at Baltimore became the signature play of the 'Ghost to the Post' game.", "giveaway", "accomplishments", 8),
    batch2Supplement("casper-sb11", "I won Super Bowl XI with the Raiders.", "strong"),
    batch2Supplement("casper-hof", "I was inducted into the Pro Football Hall of Fame in 2002.", "strong"),
  ]],
  ["nfl-jackie-smith", [
    batch2Supplement("jackie-cardinals", "I spent 15 seasons with the St. Louis Cardinals before one final year in Dallas.", "giveaway", "career-path", 10),
    batch2Supplement("jackie-tenth", "St. Louis selected me in the 10th round of the 1963 NFL Draft.", "strong", "career-path"),
    batch2Supplement("jackie-leading-te", "I retired as the NFL's all-time leading tight end in receptions and receiving yards.", "giveaway", "accomplishments", 9),
    batch2Supplement("jackie-hof", "I was inducted into the Pro Football Hall of Fame in 1994.", "strong"),
  ]],
  ["jason-witten", [
    batch2Supplement("witten-tennessee", "I played college football at Tennessee.", "helpful", "background"),
    batch2Supplement("witten-draft", "Dallas selected me No. 69 overall in the 2003 NFL Draft.", "strong", "career-path"),
    batch2Supplement("witten-probowls", "I was selected to 11 Pro Bowls.", "giveaway", "accomplishments", 10),
    batch2Supplement("witten-return", "I retired after the 2017 season, returned to Dallas in 2019 and finished with the Raiders in 2020.", "strong", "career-path"),
    batch2Supplement("witten-17seasons", "I played 17 NFL seasons, 16 of them with Dallas.", "strong", "career-path"),
  ]],
  ["nfl-kellen-winslow", [
    batch2Supplement("winslow-era", "I played in the NFL from 1979 through 1987.", "broad", "era", 30),
    batch2Supplement("winslow-missouri", "I played college football at Missouri.", "helpful", "background"),
    batch2Supplement("winslow-draft", "San Diego selected me No. 13 overall in the 1979 NFL Draft.", "strong", "career-path"),
    batch2Supplement("winslow-chargers", "I spent my entire NFL career with the San Diego Chargers.", "giveaway", "career-path", 10),
    batch2Supplement("winslow-air-coryell", "Don Coryell moved me around the formation as a centerpiece of the 'Air Coryell' offense.", "giveaway", "relationships", 9),
    batch2Supplement("winslow-probowls", "I was selected to five Pro Bowls and three first-team All-Pro teams.", "strong"),
    batch2Supplement("winslow-correct-stats", "I finished with 541 receptions for 6,741 yards and 45 touchdowns.", "strong", "production"),
  ]],
  ["mike-ditka", [
    batch2Supplement("ditka-era", "My playing career ran from the 1960s into the early 1970s.", "broad", "era", 30),
    batch2Supplement("ditka-pitt", "I starred at Pitt before entering the NFL.", "helpful", "background"),
    batch2Supplement("ditka-fifth", "Chicago selected me No. 5 overall in the 1961 NFL Draft.", "giveaway", "career-path", 10),
    batch2Supplement("ditka-rookie", "As a rookie I became the first NFL tight end to top 1,000 receiving yards in a season and won Rookie of the Year.", "strong", "accomplishments", 8),
    batch2Supplement("ditka-iron", "I became widely known as 'Iron Mike.'", "giveaway", "nickname", 9),
    batch2Supplement("ditka-coach", "I later coached the 1985 Bears to a Super Bowl XX championship.", "giveaway", "career-path", 8),
    batch2Supplement("ditka-89", "No. 89 became my signature number as a Bears tight end.", "helpful", "identity"),
    batch2Supplement("ditka-pitt-two-way", "At Pitt I led the team in receiving for three straight seasons while also playing defense and punting.", "helpful", "background"),
  ]],
  ["ozzie-newsome", [
    batch2Supplement("ozzie-era", "My playing career ran from the late 1970s through the 1980s.", "broad", "era", 30),
    batch2Supplement("ozzie-alabama", "I played college football at Alabama.", "helpful", "background"),
    batch2Supplement("ozzie-82", "No. 82 became my signature number in Cleveland.", "helpful", "identity"),
  ]],
  ["shannon-sharpe", [
    batch2Supplement("sharpe-savannah", "I starred at Savannah State before Denver drafted me in the seventh round in 1990.", "helpful", "background"),
    batch2Supplement("sharpe-brother", "My older brother Sterling Sharpe was already an NFL star receiver while I was becoming a tight end.", "strong", "relationships"),
    batch2Supplement("sharpe-three-sb", "I won two Super Bowls with Denver and another with Baltimore.", "giveaway", "accomplishments", 8),
    batch2Supplement("sharpe-probowls", "I was selected to eight Pro Bowls.", "strong"),
    batch2Supplement("sharpe-records", "I retired holding the NFL tight-end career records for receptions and receiving yards.", "giveaway", "accomplishments", 9),
    batch2Supplement("sharpe-ravens", "My lone team outside Denver was Baltimore, where I won Super Bowl XXXV.", "strong", "career-path"),
    batch2Supplement("sharpe-84", "No. 84 became my signature number in Denver.", "helpful", "identity"),
  ]],
  ["nfl-tony-gonzalez", [
    batch2Supplement("gonzalez-falcons", "After 12 seasons in Kansas City, I finished my career with five seasons in Atlanta.", "strong", "career-path"),
    batch2Supplement("gonzalez-probowls", "I was selected to 14 Pro Bowls.", "giveaway", "accomplishments", 9),
    batch2Supplement("gonzalez-allpro", "I earned first-team All-Pro honors seven times.", "strong"),
    batch2Supplement("gonzalez-records", "I retired as the career leader among tight ends in receptions, receiving yards and receiving touchdowns.", "giveaway", "accomplishments", 8),
    batch2Supplement("gonzalez-88", "No. 88 became my signature number in both Kansas City and Atlanta.", "helpful", "identity"),
    batch2Supplement("gonzalez-basketball-style", "I used basketball-style body positioning and rebounding instincts to create receiving mismatches at tight end.", "helpful", "style"),
  ]],
  ["nfl-travis-kelce", [
    batch2Supplement("kelce-87", "I wear No. 87 for Kansas City.", "helpful", "identity"),
    batch2Supplement("kelce-three-sb", "I won Super Bowls LIV, LVII and LVIII with the Chiefs.", "giveaway", "accomplishments", 8),
    batch2Supplement("kelce-seven-1k", "I became the first tight end in NFL history to record seven consecutive 1,000-yard receiving seasons.", "giveaway", "accomplishments", 9),
    batch2Supplement("kelce-mahomes", "Patrick Mahomes became my quarterback for the Chiefs' championship run.", "strong", "relationships"),
    batch2Supplement("kelce-2026", "I returned to Kansas City for the 2026 season and remained an active Chief.", "strong", "career-path"),
    batch2Supplement("kelce-chief-career", "Kansas City has been my only NFL team.", "helpful", "background"),
  ]],
  ["zach-ertz", [
    batch2Supplement("ertz-stanford", "I played college football at Stanford.", "helpful", "background"),
    batch2Supplement("ertz-draft", "Philadelphia selected me No. 35 overall in the 2013 NFL Draft.", "strong", "career-path"),
    batch2Supplement("ertz-sb52", "I caught the go-ahead touchdown in the fourth quarter of Philadelphia's Super Bowl LII victory.", "giveaway", "accomplishments", 8),
    batch2Supplement("ertz-116", "My 116 catches in 2018 set a single-season NFL record for a tight end at the time.", "giveaway", "production", 9),
    batch2Supplement("ertz-path", "My NFL career included Philadelphia, Arizona and Washington.", "strong", "career-path"),
    batch2Supplement("ertz-probowls", "I was selected to three Pro Bowls.", "strong"),
    batch2Supplement("ertz-eagles", "I spent my first nine seasons with the Eagles.", "giveaway", "career-path", 10),
    batch2Supplement("ertz-86", "No. 86 became my signature number in the NFL.", "helpful", "identity"),
    batch2Supplement("ertz-basketball", "Basketball was a major part of my athletic background before I developed into an NFL tight end.", "helpful", "background"),
  ]],
]);


export const NFL_WHO_AM_I_BATCH_3_SUBJECT_IDS = [
  "nfl-alan-faneca",
  "nfl-anthony-munoz",
  "nfl-chuck-bednarik",
  "nfl-jason-kelce",
  "nfl-joe-thomas",
  "nfl-jonathan-ogden",
  "nfl-kevin-mawae",
  "nfl-marshal-yanda",
  "nfl-orlando-pace",
  "nfl-steve-hutchinson",
  "nfl-trent-williams",
  "nfl-tyron-smith",
  "nfl-aaron-donald",
  "nfl-alan-page",
  "bruce-smith",
  "nfl-deacon-jones",
  "nfl-j-j-watt",
  "joe-greene",
  "reggie-white",
  "nfl-alex-karras",
  "nfl-bob-lilly",
  "nfl-bryant-young",
  "nfl-calais-campbell",
  "nfl-cameron-heyward",
  "nfl-carl-eller",
  "nfl-carlos-dunlap",
  "nfl-chandler-jones",
  "nfl-charles-haley",
  "nfl-chris-doleman",
  "nfl-claude-humphrey",
  "nfl-cortez-kennedy",
  "nfl-curley-culp",
  "nfl-dan-hampton",
  "nfl-danielle-hunter",
  "nfl-dwight-freeney",
  "nfl-elvin-bethea",
  "nfl-elvis-dumervil",
  "nfl-fred-dean",
  "nfl-brian-urlacher",
  "dick-butkus",
  "lawrence-taylor",
  "nfl-ray-lewis",
  "nfl-sam-huff",
  "nfl-andre-tippett",
  "nfl-bobby-bell",
  "nfl-cameron-jordan",
  "nfl-cameron-wake",
  "nfl-chris-hanburger",
  "nfl-chuck-howley",
  "clay-matthews",
] as const;

const batch3SubjectIds = new Set<string>(NFL_WHO_AM_I_BATCH_3_SUBJECT_IDS);

const batch3Active2026SubjectIds = new Set<string>([
  "nfl-trent-williams",
  "nfl-calais-campbell",
  "nfl-cameron-heyward",
  "nfl-danielle-hunter",
  "nfl-cameron-jordan",
]);

const batch3PartialCareerCoverageSubjectIds = new Set<string>([
  "bruce-smith",
  "nfl-bryant-young",
  "nfl-charles-haley",
  "nfl-chris-doleman",
  "nfl-cortez-kennedy",
  "nfl-ray-lewis",
]);

const batch3RetrospectiveSackSubjectIds = new Set<string>([
  "nfl-alan-page",
  "nfl-deacon-jones",
  "joe-greene",
  "nfl-alex-karras",
  "nfl-bob-lilly",
  "nfl-carl-eller",
  "nfl-claude-humphrey",
  "nfl-curley-culp",
  "nfl-dan-hampton",
  "nfl-elvin-bethea",
  "nfl-fred-dean",
  "nfl-bobby-bell",
  "nfl-chris-hanburger",
  "nfl-chuck-howley",
]);

const batch3RetainedIdentityConcepts = new Map<string, ReadonlySet<string>>([
  ["nfl-alan-faneca", keep("identity:guard-to-left-tackle-emergency", "identity:pulling-guard-identity", "identity:pro-bowls")],
  ["nfl-anthony-munoz", keep("identity:usc-champion-baseball-pitcher", "identity:knee-injuries-rose-bowl-return", "identity:paul-brown-medical-draft-gamble", "identity:consecutive-pro-bowls", "identity:eleven-consecutive-all-pro-selections")],
  ["nfl-chuck-bednarik", keep("identity:concrete-salesman-nickname", "identity:last-sixty-minute-man", "identity:gifford-hit-iconic-image", "identity:1960-title-final-tackle", "identity:pro-bowls", "identity:nine-all-nfl-selections")],
  ["nfl-jason-kelce", keep("identity:cincinnati-walk-on-origin", "identity:college-position-conversion", "identity:brothers-super-bowl-matchup")],
  ["nfl-joe-thomas", keep("identity:historic-consecutive-snap-streak", "identity:blocked-for-twenty-quarterbacks", "identity:cleveland-loyalty", "identity:decade-long-pro-bowl-opening", "identity:first-ballot-hall-entry", "identity:cfb-joe-thomas--music-city-bowl-defensive-end")],
  ["nfl-jonathan-ogden", keep("identity:ncaa-shot-put-champion", "identity:first-ravens-draft-pick", "identity:newsome-over-lawrence-phillips", "identity:rookie-guard-to-left-tackle", "identity:pro-bowls")],
  ["nfl-kevin-mawae", keep("identity:four-line-spots-plus-tight-end", "identity:pro-bowls")],
  ["nfl-marshal-yanda", keep("identity:junior-college-to-last-minute-iowa", "identity:shoulder-injury-position-switch", "identity:fractured-ankle-walkoff", "identity:pro-bowls")],
  ["nfl-orlando-pace", keep("identity:immediate-ohio-state-starter", "identity:pancake-block-identity", "identity:historic-lombardi-award", "identity:lineman-heisman-finish", "identity:offensive-lineman-first-overall")],
  ["nfl-steve-hutchinson", keep("identity:defense-to-offensive-line-switch", "identity:walter-jones-left-side-partnership", "identity:poison-pill-contract-rule-change", "identity:michigan-two-years-no-sack-allowed", "identity:pro-bowls")],
  ["nfl-trent-williams", keep("identity:silverback-nickname-origin", "identity:medical-dispute-and-holdout", "identity:shanahan-reunion-in-san-francisco", "identity:pro-bowls", "identity:fourth-ol-twelve-pro-bowls")],
  ["nfl-tyron-smith", keep("identity:twenty-year-old-lockout-rookie", "identity:college-and-rookie-right-tackle", "identity:pro-bowls", "identity:two-first-team-all-pro")],
  ["nfl-aaron-donald", keep("identity:freshman-scout-team-breakthrough")],
  ["nfl-alan-page", keep("identity:minnesota-supreme-court-justice", "identity:pro-bowls")],
  ["bruce-smith", keep("identity:rookie-conditioning-transformation")],
  ["nfl-deacon-jones", keep("identity:david-to-deacon-self-nickname", "identity:coined-football-sack-term", "identity:head-slap-pass-rush", "identity:fearsome-foursome-identity", "identity:accidental-scouting-film-discovery", "identity:pro-bowls")],
  ["nfl-j-j-watt", keep("identity:college-tight-end-origin", "identity:wisconsin-walk-on-gamble", "identity:transfer-year-transformation", "identity:scout-team-scholarship-breakthrough")],
  ["joe-greene", keep("identity:mean-joe-nickname-mean-green-link", "identity:agile-mobile-hostile-scouting-description", "identity:coke-commercial", "identity:pro-bowls")],
  ["reggie-white", keep("identity:minister-of-defense-nickname", "identity:free-agency-landmark", "identity:green-bay-defensive-turnaround", "identity:green-bay-number-retirement", "identity:pro-bowls")],
  ["nfl-alex-karras", keep("identity:undersized-lightning-quick-interior-style", "identity:gambling-suspension-and-bartending-interlude", "identity:paper-lion-cultural-figure", "identity:pro-bowls", "identity:four-first-team-all-pro")],
  ["nfl-bob-lilly", keep("identity:first-ever-cowboys-draft-pick", "identity:mr-cowboy-nickname", "identity:griese-sack-cigar-redemption", "identity:pro-bowls", "identity:seven-first-team-all-pro-seasons")],
  ["nfl-bryant-young", keep("identity:compound-leg-fracture-comeback", "identity:forty-niner-way-one-team-identity")],
  ["nfl-calais-campbell", keep("identity:mayor-of-sacksonville-proclamation")],
  ["nfl-cameron-heyward", keep("identity:iron-head-eye-black-fine")],
  ["nfl-carl-eller", keep("identity:quick-mobile-power-rusher", "identity:caused-jim-marshall-wrong-way-play", "identity:pro-bowls", "identity:george-halas-award-1971")],
  ["nfl-carlos-dunlap", keep()],
  ["nfl-chandler-jones", keep("identity:chandler-jones-arthur-football-path", "identity:chandler-jones-boxing-pass-rush-training")],
  ["nfl-charles-haley", keep("identity:charles-haley-linebacker-to-defensive-end", "identity:charles-haley-back-surgery-comeback", "identity:charles-haley-first-five-super-bowl-wins", "identity:pro-bowls", "identity:two-nfc-defensive-player-of-year-awards")],
  ["nfl-chris-doleman", keep("identity:chris-doleman-valley-forge-route", "identity:chris-doleman-linebacker-to-end", "identity:chris-doleman-late-spin-move-development", "identity:pro-bowls", "identity:three-first-team-all-pro")],
  ["nfl-claude-humphrey", keep("identity:claude-humphrey-knee-injury-career-best-return", "identity:claude-humphrey-temporary-retirement-eagles-return", "identity:pro-bowls", "identity:all-nfl-selections", "identity:defensive-rookie-of-year")],
  ["nfl-cortez-kennedy", keep("identity:cortez-kennedy-junior-college-to-miami", "identity:cortez-kennedy-twenty-pound-transformation", "identity:cortez-kennedy-jerome-brown-99-tribute", "identity:cortez-kennedy-dpoy-two-win-team", "identity:pro-bowls", "identity:defensive-player-of-year-1992")],
  ["nfl-curley-culp", keep("identity:curley-culp-ncaa-wrestling-olympic-path", "identity:curley-culp-broncos-offensive-guard-experiment", "identity:curley-culp-nose-tackle-34-innovation", "identity:pro-bowls", "identity:first-team-all-pro-1975")],
  ["nfl-dan-hampton", keep("identity:dan-hampton-danimal-nickname", "identity:dan-hampton-double-digit-knee-operations", "identity:dan-hampton-declined-super-bowl-shuffle", "identity:pro-bowls", "identity:all-pro-selections", "identity:super-bowl-xx-title")],
  ["nfl-danielle-hunter", keep("identity:danielle-hunter-youth-all-position-background")],
  ["nfl-dwight-freeney", keep("identity:dwight-freeney-undersized-edge", "identity:dwight-freeney-and1-spin-origin", "identity:dwight-freeney-michael-vick-game", "identity:dwight-freeney-super-bowl-torn-ankle")],
  ["nfl-elvin-bethea", keep("identity:elvin-bethea-ncat-two-way-versatility", "identity:elvin-bethea-drafted-offense-became-defense", "identity:elvin-bethea-135-game-durability", "identity:pro-bowls", "identity:six-all-afl-afc-selections")],
  ["nfl-elvis-dumervil", keep("identity:elvis-dumervil-fax-fiasco")],
  ["nfl-fred-dean", keep("identity:fred-dean-college-linebacker-to-nfl-line", "identity:fred-dean-early-pass-rush-specialist", "identity:fred-dean-the-closer", "identity:pro-bowls", "identity:two-super-bowl-titles")],
  ["nfl-brian-urlacher", keep("identity:lobo-back-hybrid-position", "identity:three-way-college-player", "identity:red-zone-receiver-role", "identity:multiple-nfl-position-projections", "identity:outside-to-middle-linebacker-switch")],
  ["dick-butkus", keep("identity:hometown-football-path", "identity:illinois-two-way-star", "identity:linebacker-heisman-finish", "identity:dual-league-draft-choice", "identity:butkus-award-namesake", "identity:eight-pro-bowls")],
  ["lawrence-taylor", keep("identity:linebacker-role-redefinition", "identity:played-through-torn-pectoral", "identity:pro-bowls", "identity:nfl-mvp-1986")],
  ["nfl-ray-lewis", keep("identity:final-miami-scholarship", "identity:miami-immediate-starter", "identity:ravens-franchise-origin", "identity:one-franchise-career")],
  ["nfl-sam-huff", keep("identity:nearly-left-giants-camp", "identity:ray-beck-injury-middle-linebacker-opening", "identity:violent-world-media-profile", "identity:pro-bowls", "identity:nfl-title-games", "identity:two-all-pro-selections")],
  ["nfl-andre-tippett", keep("identity:fifth-degree-karate-black-belt", "identity:career-sacks", "identity:pro-bowls", "identity:afc-defensive-player-of-year-1985")],
  ["nfl-bobby-bell", keep("identity:quarterback-lineman-linebacker-evolution", "identity:basketball-pioneer-and-baseball-offer", "identity:chose-afl-chiefs-over-vikings", "identity:super-bowl-iv-title")],
  ["nfl-cameron-jordan", keep("identity:nfl-father-opposite-side-path", "identity:state-discus-champion")],
  ["nfl-cameron-wake", keep("identity:giants-cut-to-mortgage-broker", "identity:unfamiliar-cfl-last-chance")],
  ["nfl-chris-hanburger", keep("identity:chris-hanburger-weight-plate-weigh-ins", "identity:chris-hanburger-hangman-nickname", "identity:chris-hanburger-defensive-quarterback", "identity:pro-bowls", "identity:four-first-team-all-pro")],
  ["nfl-chuck-howley", keep("identity:chuck-howley-five-sport-college-letterman", "identity:chuck-howley-knee-retirement-gas-station-comeback", "identity:chuck-howley-losing-team-super-bowl-mvp", "identity:five-all-nfl-selections")],
  ["clay-matthews", keep("identity:clay-matthews-multigenerational-nfl-family", "identity:clay-matthews-usc-walk-on", "identity:clay-matthews-special-teams-to-hybrid-defender", "identity:clay-matthews-long-hair-bet")],
]);

const batch3TextOverrides = new Map<string, Partial<WhoAmIClue>>([
  ["nfl-jason-kelce:identity:cincinnati-walk-on-origin", {
    band: "helpful",
    facet: "background",
    revealPriority: 12,
  }],
  ["nfl-jason-kelce:identity:college-position-conversion", {
    band: "strong",
    facet: "career-path",
    revealPriority: 10,
  }],
  ["nfl-jason-kelce:identity:brothers-super-bowl-matchup", {
    band: "giveaway",
    facet: "relationships",
    revealPriority: 8,
  }],
  ["nfl-joe-thomas:identity:historic-consecutive-snap-streak", {
    band: "strong",
    facet: "accomplishments",
    revealPriority: 14,
  }],
  ["nfl-joe-thomas:identity:blocked-for-twenty-quarterbacks", {
    band: "strong",
    facet: "relationships",
    revealPriority: 16,
  }],
  ["nfl-joe-thomas:identity:decade-long-pro-bowl-opening", {
    band: "strong",
    facet: "accomplishments",
    revealPriority: 16,
  }],
  ["nfl-joe-thomas:identity:first-ballot-hall-entry", {
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 8,
  }],
  ["nfl-orlando-pace:identity:immediate-ohio-state-starter", {
    band: "helpful",
    facet: "background",
    revealPriority: 14,
  }],
  ["nfl-orlando-pace:identity:pancake-block-identity", {
    band: "helpful",
    facet: "style",
    revealPriority: 14,
  }],
  ["nfl-orlando-pace:identity:historic-lombardi-award", {
    band: "strong",
    facet: "accomplishments",
    revealPriority: 14,
  }],
  ["nfl-orlando-pace:identity:lineman-heisman-finish", {
    band: "strong",
    facet: "accomplishments",
    revealPriority: 16,
  }],
  ["nfl-orlando-pace:identity:offensive-lineman-first-overall", {
    band: "giveaway",
    facet: "career-path",
    revealPriority: 8,
  }],
]);

function applyBatch3IdentityCuration(subjectId: string, clue: WhoAmIClue) {
  const override = batch3TextOverrides.get(subjectId + ":" + (clue.conceptId ?? clue.id))
    ?? batch3TextOverrides.get(subjectId + ":" + clue.id);
  return override ? { ...clue, ...override } : clue;
}

function batch3Supplement(
  id: string,
  text: string,
  band: WhoAmIClue["band"] = "strong",
  facet: WhoAmIClue["facet"] = "accomplishments",
  revealPriority = 16,
): WhoAmIClue {
  return { id: "curated3:" + id, conceptId: "curated3:" + id, text, band, facet, revealPriority };
}

const batch3SupplementalClues = new Map<string, readonly WhoAmIClue[]>([
  ["nfl-alan-faneca", [
    batch3Supplement("faneca-lsu", "I played college football at LSU.", "helpful", "background"),
    batch3Supplement("faneca-draft", "Pittsburgh selected me No. 26 overall in the 1998 NFL Draft.", "strong", "career-path"),
    batch3Supplement("faneca-steelers", "I spent my first 10 NFL seasons with the Pittsburgh Steelers.", "strong", "career-path"),
    batch3Supplement("faneca-sb40", "I won Super Bowl XL with Pittsburgh.", "giveaway", "accomplishments", 9),
  ]],
  ["nfl-anthony-munoz", [
    batch3Supplement("munoz-usc", "I played college football at USC.", "helpful", "background"),
    batch3Supplement("munoz-draft", "Cincinnati selected me No. 3 overall in the 1980 NFL Draft.", "strong", "career-path"),
    batch3Supplement("munoz-bengals", "The Cincinnati Bengals were my only regular-season NFL team.", "giveaway", "career-path", 10),
    batch3Supplement("munoz-super-bowls", "I started at left tackle for Cincinnati in Super Bowls XVI and XXIII.", "giveaway", "accomplishments", 9),
  ]],
  ["nfl-chuck-bednarik", [
    batch3Supplement("bednarik-penn", "I starred at Penn before entering the NFL.", "helpful", "background"),
    batch3Supplement("bednarik-first", "Philadelphia selected me first overall in the 1949 NFL Draft.", "giveaway", "career-path", 9),
    batch3Supplement("bednarik-eagles", "I spent my entire NFL career with the Philadelphia Eagles.", "giveaway", "career-path", 10),
    batch3Supplement("bednarik-titles", "I helped Philadelphia win NFL championships in 1949 and 1960.", "giveaway", "accomplishments", 8),
    batch3Supplement("bednarik-60", "No. 60 became my signature number in Philadelphia and was retired by the Eagles.", "strong", "identity"),
  ]],
  ["nfl-jason-kelce", [
    batch3Supplement("kelce-cincinnati", "I played college football at Cincinnati.", "helpful", "background"),
    batch3Supplement("kelce-draft", "Philadelphia selected me in the sixth round, No. 191 overall, in the 2011 NFL Draft.", "strong", "career-path"),
    batch3Supplement("kelce-eagles-only", "I spent all 13 of my NFL seasons with the Eagles.", "giveaway", "career-path", 10),
    batch3Supplement("kelce-sb52", "I won Super Bowl LII with Philadelphia.", "strong", "accomplishments"),
    batch3Supplement("kelce-probowls", "I was selected to seven Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("kelce-sneak", "I was the center at the heart of Philadelphia's highly recognizable quarterback-sneak package.", "giveaway", "style", 9),
  ]],
  ["nfl-joe-thomas", [
    batch3Supplement("thomas-wisconsin", "I played college football at Wisconsin.", "helpful", "background"),
    batch3Supplement("thomas-draft", "Cleveland selected me No. 3 overall in the 2007 NFL Draft.", "strong", "career-path"),
    batch3Supplement("thomas-browns-only", "I spent my entire NFL career with the Cleveland Browns.", "giveaway", "career-path", 10),
    batch3Supplement("thomas-73", "No. 73 became my signature number in Cleveland.", "helpful", "identity"),
  ]],
  ["nfl-jonathan-ogden", [
    batch3Supplement("ogden-ucla", "I played college football at UCLA.", "helpful", "background"),
    batch3Supplement("ogden-fourth", "Baltimore selected me No. 4 overall in the 1996 NFL Draft.", "strong", "career-path"),
    batch3Supplement("ogden-ravens-only", "I spent my entire NFL career with the Baltimore Ravens.", "giveaway", "career-path", 10),
    batch3Supplement("ogden-sb35", "I protected the edge for Baltimore's Super Bowl XXXV championship team.", "giveaway", "accomplishments", 9),
  ]],
  ["nfl-kevin-mawae", [
    batch3Supplement("mawae-lsu", "I played college football at LSU.", "helpful", "background"),
    batch3Supplement("mawae-draft", "Seattle selected me in the second round, No. 36 overall, in the 1994 NFL Draft.", "strong", "career-path"),
    batch3Supplement("mawae-path", "My NFL career included Seattle, the New York Jets and Tennessee.", "strong", "career-path"),
    batch3Supplement("mawae-center", "Center became my defining NFL position during a 16-season career.", "helpful", "role"),
    batch3Supplement("mawae-hof", "I was elected to the Pro Football Hall of Fame in 2019.", "strong", "accomplishments"),
  ]],
  ["nfl-marshal-yanda", [
    batch3Supplement("yanda-iowa", "I played college football at Iowa.", "helpful", "background"),
    batch3Supplement("yanda-draft", "Baltimore selected me in the third round, No. 86 overall, in the 2007 NFL Draft.", "strong", "career-path"),
    batch3Supplement("yanda-ravens-only", "I spent my entire 13-season NFL career with Baltimore.", "giveaway", "career-path", 10),
    batch3Supplement("yanda-sb47", "I won Super Bowl XLVII with the Ravens.", "giveaway", "accomplishments", 9),
    batch3Supplement("yanda-guard", "Right guard became the position most associated with my Ravens career.", "helpful", "role"),
  ]],
  ["nfl-orlando-pace", [
    batch3Supplement("pace-ohio-state", "I starred at Ohio State before entering the NFL.", "helpful", "background"),
    batch3Supplement("pace-rams", "I protected the blind side for the St. Louis Rams' 'Greatest Show on Turf.'", "giveaway", "career-path", 9),
    batch3Supplement("pace-probowls", "I was selected to seven Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("pace-sb34", "I won Super Bowl XXXIV with the Rams.", "strong", "accomplishments", 12),
  ]],
  ["nfl-steve-hutchinson", [
    batch3Supplement("hutch-michigan", "I played college football at Michigan.", "helpful", "background"),
    batch3Supplement("hutch-draft", "Seattle selected me No. 17 overall in the 2001 NFL Draft.", "strong", "career-path"),
    batch3Supplement("hutch-path", "My NFL career included Seattle, Minnesota and Tennessee.", "strong", "career-path"),
    batch3Supplement("hutch-hof", "I was elected to the Pro Football Hall of Fame in 2020.", "strong", "accomplishments"),
  ]],
  ["nfl-trent-williams", [
    batch3Supplement("trent-oklahoma", "I played college football at Oklahoma.", "helpful", "background"),
    batch3Supplement("trent-washington-sf", "My NFL career has run through Washington and San Francisco.", "strong", "career-path"),
    batch3Supplement("trent-71", "I wear No. 71 for San Francisco.", "strong", "identity"),
    batch3Supplement("trent-current", "I remained the 49ers' starting left tackle and a team captain in 2026.", "giveaway", "career-path", 9),
  ]],
  ["nfl-tyron-smith", [
    batch3Supplement("tyron-usc", "I played college football at USC.", "helpful", "background"),
    batch3Supplement("tyron-draft", "Dallas selected me No. 9 overall in the 2011 NFL Draft.", "strong", "career-path"),
    batch3Supplement("tyron-cowboys", "I spent 13 seasons with the Dallas Cowboys before finishing with the New York Jets.", "giveaway", "career-path", 10),
    batch3Supplement("tyron-77", "No. 77 became my signature number in Dallas.", "strong", "identity"),
  ]],
  ["nfl-aaron-donald", [
    batch3Supplement("donald-pitt", "I played college football at Pittsburgh.", "helpful", "background"),
    batch3Supplement("donald-13", "The Rams selected me No. 13 overall in the 2014 NFL Draft.", "strong", "career-path"),
    batch3Supplement("donald-rams-only", "I spent my entire 10-season NFL career with the Rams organization.", "giveaway", "career-path", 10),
    batch3Supplement("donald-dpoy", "I won AP NFL Defensive Player of the Year three times.", "giveaway", "accomplishments", 8),
    batch3Supplement("donald-allpro", "I was an AP first-team All-Pro eight times.", "strong", "accomplishments"),
    batch3Supplement("donald-sb56", "I won Super Bowl LVI with the Rams.", "giveaway", "accomplishments", 8),
    batch3Supplement("donald-99", "No. 99 became my signature NFL number.", "strong", "identity"),
  ]],
  ["nfl-alan-page", [
    batch3Supplement("page-notre-dame", "I played college football at Notre Dame.", "helpful", "background"),
    batch3Supplement("page-vikings", "I was a centerpiece of Minnesota's 'Purple People Eaters' defensive front.", "giveaway", "career-path", 9),
    batch3Supplement("page-mvp", "In 1971 I became the first defensive player to win the AP NFL MVP award.", "giveaway", "accomplishments", 8),
    batch3Supplement("page-dpoy", "I won NFL Defensive Player of the Year twice.", "strong", "accomplishments"),
    batch3Supplement("page-superbowls", "I played in four Super Bowls with Minnesota.", "strong", "accomplishments"),
    batch3Supplement("page-88", "Minnesota retired my No. 88.", "strong", "identity"),
  ]],
  ["bruce-smith", [
    batch3Supplement("bruce-vt", "I played college football at Virginia Tech.", "helpful", "background"),
    batch3Supplement("bruce-first", "Buffalo selected me first overall in the 1985 NFL Draft.", "giveaway", "career-path", 9),
    batch3Supplement("bruce-bills", "I became the pass-rushing centerpiece of Buffalo's four straight Super Bowl teams.", "giveaway", "career-path", 9),
    batch3Supplement("bruce-200", "I retired with an NFL-record 200 career sacks.", "giveaway", "accomplishments", 8),
    batch3Supplement("bruce-dpoy", "I won AP NFL Defensive Player of the Year twice.", "strong", "accomplishments"),
    batch3Supplement("bruce-probowls", "I was selected to 11 Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("bruce-78", "Buffalo retired my No. 78.", "strong", "identity"),
  ]],
  ["nfl-deacon-jones", [
    batch3Supplement("deacon-rams", "I became a star defensive end for the Los Angeles Rams.", "giveaway", "career-path", 10),
    batch3Supplement("deacon-75", "No. 75 became my signature number with the Rams.", "strong", "identity"),
    batch3Supplement("deacon-eight", "I was selected to eight Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("deacon-hof", "I was elected to the Pro Football Hall of Fame in 1980.", "strong", "accomplishments"),
  ]],
  ["nfl-j-j-watt", [
    batch3Supplement("jj-wisconsin", "I played college football at Wisconsin.", "helpful", "background"),
    batch3Supplement("jj-draft", "Houston selected me No. 11 overall in the 2011 NFL Draft.", "strong", "career-path"),
    batch3Supplement("jj-texans", "I spent my first 10 NFL seasons with the Houston Texans before finishing with Arizona.", "giveaway", "career-path", 10),
    batch3Supplement("jj-dpoy", "I won AP NFL Defensive Player of the Year three times.", "giveaway", "accomplishments", 8),
    batch3Supplement("jj-allpro", "I earned AP first-team All-Pro honors five times.", "strong", "accomplishments"),
    batch3Supplement("jj-20", "I produced two different 20.5-sack seasons.", "giveaway", "production", 9),
    batch3Supplement("jj-99", "No. 99 became my signature NFL number.", "strong", "identity"),
  ]],
  ["joe-greene", [
    batch3Supplement("greene-north-texas", "I played college football at North Texas State.", "helpful", "background"),
    batch3Supplement("greene-fourth", "Pittsburgh selected me No. 4 overall in the 1969 NFL Draft.", "strong", "career-path"),
    batch3Supplement("greene-steelers", "I became the centerpiece of Pittsburgh's 'Steel Curtain' defense.", "giveaway", "career-path", 9),
    batch3Supplement("greene-four-rings", "I won four Super Bowls with the Steelers.", "giveaway", "accomplishments", 8),
    batch3Supplement("greene-dpoy", "I won NFL Defensive Player of the Year twice.", "strong", "accomplishments"),
    batch3Supplement("greene-75", "Pittsburgh retired my No. 75.", "strong", "identity"),
  ]],
  ["reggie-white", [
    batch3Supplement("white-tennessee", "I played college football at Tennessee.", "helpful", "background"),
    batch3Supplement("white-usfl", "I played for the Memphis Showboats in the USFL before joining Philadelphia in the NFL.", "strong", "career-path"),
    batch3Supplement("white-path", "My NFL career included Philadelphia, Green Bay and Carolina.", "strong", "career-path"),
    batch3Supplement("white-198", "I finished my NFL career with 198 sacks.", "giveaway", "production", 9),
    batch3Supplement("white-dpoy", "I won AP NFL Defensive Player of the Year twice.", "strong", "accomplishments"),
    batch3Supplement("white-sb31", "I won Super Bowl XXXI with Green Bay.", "giveaway", "accomplishments", 8),
  ]],
  ["nfl-alex-karras", [
    batch3Supplement("karras-iowa", "I played college football at Iowa.", "helpful", "background"),
    batch3Supplement("karras-tenth", "Detroit selected me No. 10 overall in the 1958 NFL Draft.", "strong", "career-path"),
    batch3Supplement("karras-lions", "I spent my entire NFL playing career with the Detroit Lions.", "giveaway", "career-path", 10),
    batch3Supplement("karras-four-ap", "I earned first-team All-Pro honors four times.", "strong", "accomplishments"),
  ]],
  ["nfl-bob-lilly", [
    batch3Supplement("lilly-tcu", "I played college football at TCU.", "helpful", "background"),
    batch3Supplement("lilly-cowboys-only", "I spent my entire 14-season NFL career with Dallas.", "giveaway", "career-path", 10),
    batch3Supplement("lilly-sb6", "I won Super Bowl VI with the Cowboys.", "giveaway", "accomplishments", 9),
    batch3Supplement("lilly-74", "Dallas retired my No. 74.", "strong", "identity"),
  ]],
  ["nfl-bryant-young", [
    batch3Supplement("young-notre-dame", "I played college football at Notre Dame.", "helpful", "background"),
    batch3Supplement("young-seventh", "San Francisco selected me No. 7 overall in the 1994 NFL Draft.", "strong", "career-path"),
    batch3Supplement("young-49ers-only", "I spent all 14 of my NFL seasons with the 49ers.", "giveaway", "career-path", 10),
    batch3Supplement("young-sb29", "I won Super Bowl XXIX as a rookie with San Francisco.", "giveaway", "accomplishments", 9),
    batch3Supplement("young-probowls", "I was selected to four Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("young-hof", "I was elected to the Pro Football Hall of Fame in 2022.", "strong", "accomplishments"),
  ]],
  ["nfl-calais-campbell", [
    batch3Supplement("calais-miami", "I played college football at Miami.", "helpful", "background"),
    batch3Supplement("calais-draft", "Arizona selected me in the second round, No. 50 overall, in the 2008 NFL Draft.", "strong", "career-path"),
    batch3Supplement("calais-jags", "My first Jacksonville season produced my 'Mayor of Sacksonville' identity and an AP first-team All-Pro selection.", "giveaway", "career-path", 9),
    batch3Supplement("calais-probowls", "I have been selected to six Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("calais-wpmoy", "I was the Walter Payton NFL Man of the Year for the 2019 season.", "strong", "accomplishments"),
    batch3Supplement("calais-current", "I returned to Baltimore for the 2026 season, my 19th in the NFL.", "giveaway", "career-path", 9),
    batch3Supplement("calais-93", "I wear No. 93 in Baltimore.", "strong", "identity"),
    batch3Supplement("calais-ap1", "I earned AP first-team All-Pro honors with Jacksonville in 2017.", "strong", "accomplishments"),
    batch3Supplement("calais-decade", "I was selected to the NFL's All-Decade Team of the 2010s.", "strong", "accomplishments"),
    batch3Supplement("calais-cardinals-sb", "I reached Super Bowl XLIII as a rookie with Arizona.", "strong", "accomplishments"),
  ]],
  ["nfl-cameron-heyward", [
    batch3Supplement("heyward-osu", "I played college football at Ohio State.", "helpful", "background"),
    batch3Supplement("heyward-draft", "Pittsburgh selected me No. 31 overall in the 2011 NFL Draft.", "strong", "career-path"),
    batch3Supplement("heyward-steelers", "The Pittsburgh Steelers have been my only NFL team.", "giveaway", "career-path", 10),
    batch3Supplement("heyward-97", "I wear No. 97 for Pittsburgh.", "strong", "identity"),
    batch3Supplement("heyward-current", "I remained a starting Steelers defensive lineman in 2026, my 16th NFL season.", "giveaway", "career-path", 9),
    batch3Supplement("heyward-seven", "I was selected to seven Pro Bowls through the 2025 season.", "strong", "accomplishments"),
    batch3Supplement("heyward-four-ap", "I earned AP first-team All-Pro honors four times.", "strong", "accomplishments"),
    batch3Supplement("heyward-wpmoy", "I was the Walter Payton NFL Man of the Year for the 2023 season.", "strong", "accomplishments"),
    batch3Supplement("heyward-captain", "I served as a Steelers team captain for 11 consecutive seasons through 2025.", "strong", "career-path"),
    batch3Supplement("heyward-2024-ap", "At age 35, I earned first-team All-Pro honors in 2024.", "strong", "accomplishments"),
  ]],
  ["nfl-carl-eller", [
    batch3Supplement("eller-minnesota", "I played college football at Minnesota.", "helpful", "background"),
    batch3Supplement("eller-vikings", "I was a defensive end on Minnesota's 'Purple People Eaters' front.", "giveaway", "career-path", 9),
    batch3Supplement("eller-six", "I was selected to six Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("eller-superbowls", "I played in four Super Bowls with the Vikings.", "strong", "accomplishments"),
  ]],
  ["nfl-carlos-dunlap", [
    batch3Supplement("dunlap-florida", "I played college football at Florida.", "helpful", "background"),
    batch3Supplement("dunlap-draft", "Cincinnati selected me in the second round, No. 54 overall, in the 2010 NFL Draft.", "strong", "career-path"),
    batch3Supplement("dunlap-bengals", "I spent more than a decade rushing the passer for the Cincinnati Bengals.", "giveaway", "career-path", 10),
    batch3Supplement("dunlap-probowls", "I was selected to two Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("dunlap-100", "I finished my NFL career with 100 sacks.", "strong", "production"),
    batch3Supplement("dunlap-sb57", "I won Super Bowl LVII in my final NFL season with Kansas City.", "giveaway", "accomplishments", 9),
  ]],
  ["nfl-chandler-jones", [
    batch3Supplement("chandler-syracuse", "I played college football at Syracuse.", "helpful", "background"),
    batch3Supplement("chandler-draft", "New England selected me No. 21 overall in the 2012 NFL Draft.", "strong", "career-path"),
    batch3Supplement("chandler-path", "My NFL career included New England, Arizona and Las Vegas.", "strong", "career-path"),
    batch3Supplement("chandler-sb49", "I won Super Bowl XLIX with the Patriots.", "strong", "accomplishments"),
    batch3Supplement("chandler-probowls", "I was selected to four Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("chandler-sack-title", "I led the NFL with 17 sacks in 2017.", "giveaway", "production", 9),
  ]],
  ["nfl-charles-haley", [
    batch3Supplement("haley-jmu", "I played college football at James Madison.", "helpful", "background"),
    batch3Supplement("haley-fourth", "San Francisco selected me in the fourth round of the 1986 NFL Draft.", "strong", "career-path"),
    batch3Supplement("haley-path", "My NFL career was split between the 49ers and Cowboys.", "giveaway", "career-path", 10),
    batch3Supplement("haley-five", "I became the first player in NFL history to win five Super Bowls.", "giveaway", "accomplishments", 8),
    batch3Supplement("haley-100", "I finished my career with 100.5 sacks.", "strong", "production"),
  ]],
  ["nfl-chris-doleman", [
    batch3Supplement("doleman-pitt", "I played college football at Pittsburgh.", "helpful", "background"),
    batch3Supplement("doleman-fourth", "Minnesota selected me No. 4 overall in the 1985 NFL Draft.", "strong", "career-path"),
    batch3Supplement("doleman-path", "My NFL career included Minnesota, Atlanta and San Francisco.", "strong", "career-path"),
    batch3Supplement("doleman-150", "I finished my career with 150.5 sacks.", "giveaway", "production", 9),
    batch3Supplement("doleman-21", "I recorded 21 sacks for Minnesota in 1989.", "giveaway", "production", 9),
  ]],
  ["nfl-claude-humphrey", [
    batch3Supplement("humphrey-tsu", "I played college football at Tennessee State.", "helpful", "background"),
    batch3Supplement("humphrey-third", "Atlanta selected me No. 3 overall in the 1968 NFL Draft.", "strong", "career-path"),
    batch3Supplement("humphrey-path", "I starred for Atlanta before finishing my career with Philadelphia.", "strong", "career-path"),
    batch3Supplement("humphrey-six", "I was selected to six Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("humphrey-droy", "I was the NFL Defensive Rookie of the Year in 1968.", "strong", "accomplishments"),
  ]],
  ["nfl-cortez-kennedy", [
    batch3Supplement("kennedy-miami", "I played college football at Miami.", "helpful", "background"),
    batch3Supplement("kennedy-third", "Seattle selected me No. 3 overall in the 1990 NFL Draft.", "strong", "career-path"),
    batch3Supplement("kennedy-seahawks", "I spent my entire 11-season NFL career with the Seahawks.", "giveaway", "career-path", 10),
    batch3Supplement("kennedy-eight", "I was selected to eight Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("kennedy-dpoy", "I won AP NFL Defensive Player of the Year in 1992 despite Seattle finishing 2-14.", "giveaway", "accomplishments", 8),
  ]],
  ["nfl-curley-culp", [
    batch3Supplement("culp-asu", "I played college football at Arizona State.", "helpful", "background"),
    batch3Supplement("culp-path", "My pro career included Kansas City, Houston and Detroit after Denver originally drafted me.", "strong", "career-path"),
    batch3Supplement("culp-sb4", "I won Super Bowl IV with Kansas City.", "giveaway", "accomplishments", 9),
    batch3Supplement("culp-oilers", "My work as an undersized nose tackle became a defining part of Houston's 3-4 defense.", "giveaway", "style", 9),
  ]],
  ["nfl-dan-hampton", [
    batch3Supplement("hampton-arkansas", "I played college football at Arkansas.", "helpful", "background"),
    batch3Supplement("hampton-fourth", "Chicago selected me No. 4 overall in the 1979 NFL Draft.", "strong", "career-path"),
    batch3Supplement("hampton-bears", "I spent my entire 12-season NFL career with the Bears.", "giveaway", "career-path", 10),
    batch3Supplement("hampton-85", "I was a cornerstone of Chicago's dominant 1985 defense.", "giveaway", "career-path", 9),
  ]],
  ["nfl-danielle-hunter", [
    batch3Supplement("hunter-lsu", "I played college football at LSU.", "helpful", "background"),
    batch3Supplement("hunter-draft", "Minnesota selected me in the third round, No. 88 overall, in the 2015 NFL Draft.", "strong", "career-path"),
    batch3Supplement("hunter-vikings", "I spent my first nine NFL seasons rushing the passer for Minnesota.", "strong", "career-path"),
    batch3Supplement("hunter-texans", "I joined Houston in 2024 after leaving the Vikings.", "strong", "career-path"),
    batch3Supplement("hunter-55", "I wear No. 55 for the Texans.", "strong", "identity"),
    batch3Supplement("hunter-current", "I remained a starting Houston defensive end in 2026.", "giveaway", "career-path", 9),
    batch3Supplement("hunter-four-probowls", "I earned four Pro Bowl selections with Minnesota.", "strong", "accomplishments"),
    batch3Supplement("hunter-2018-ap", "I was an AP second-team All-Pro in 2018.", "strong", "accomplishments"),
    batch3Supplement("hunter-2025-ap", "I earned AP second-team All-Pro honors with Houston for the 2025 season.", "strong", "accomplishments"),
    batch3Supplement("hunter-2025-sacks", "I recorded 15 sacks for Houston in 2025.", "strong", "production"),
    batch3Supplement("hunter-youngest-50", "In 2019 I became the youngest player since sacks became official in 1982 to reach 50 career sacks.", "strong", "accomplishments"),
  ]],
  ["nfl-dwight-freeney", [
    batch3Supplement("freeney-syracuse", "I played college football at Syracuse.", "helpful", "background"),
    batch3Supplement("freeney-draft", "Indianapolis selected me No. 11 overall in the 2002 NFL Draft.", "strong", "career-path"),
    batch3Supplement("freeney-colts", "I became the signature edge rusher of the Peyton Manning-era Colts.", "giveaway", "career-path", 10),
    batch3Supplement("freeney-seven", "I was selected to seven Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("freeney-sb41", "I won Super Bowl XLI with Indianapolis.", "giveaway", "accomplishments", 9),
  ]],
  ["nfl-elvin-bethea", [
    batch3Supplement("bethea-ncat", "I played college football at North Carolina A&T.", "helpful", "background"),
    batch3Supplement("bethea-oilers", "I spent all 16 of my NFL seasons with the Houston Oilers.", "giveaway", "career-path", 10),
    batch3Supplement("bethea-eight", "I was selected to eight Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("bethea-hof", "I was elected to the Pro Football Hall of Fame in 2003.", "strong", "accomplishments"),
  ]],
  ["nfl-elvis-dumervil", [
    batch3Supplement("dumervil-louisville", "I played college football at Louisville.", "helpful", "background"),
    batch3Supplement("dumervil-fourth", "Denver selected me in the fourth round, No. 126 overall, in the 2006 NFL Draft.", "strong", "career-path"),
    batch3Supplement("dumervil-path", "My NFL career included Denver, Baltimore and San Francisco.", "strong", "career-path"),
    batch3Supplement("dumervil-five", "I was selected to five Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("dumervil-17", "I led the NFL with 17 sacks in 2009.", "giveaway", "production", 9),
    batch3Supplement("dumervil-103", "I finished my career with 103.5 sacks.", "strong", "production"),
  ]],
  ["nfl-fred-dean", [
    batch3Supplement("dean-latech", "I played college football at Louisiana Tech.", "helpful", "background"),
    batch3Supplement("dean-chargers-49ers", "I began my NFL career with San Diego before a 1981 trade sent me to San Francisco.", "strong", "career-path"),
    batch3Supplement("dean-two-rings", "I won two Super Bowls with the 49ers.", "giveaway", "accomplishments", 9),
    batch3Supplement("dean-four", "I was selected to four Pro Bowls.", "strong", "accomplishments"),
  ]],
  ["nfl-brian-urlacher", [
    batch3Supplement("urlacher-new-mexico", "I played college football at New Mexico.", "helpful", "background"),
    batch3Supplement("urlacher-ninth", "Chicago selected me No. 9 overall in the 2000 NFL Draft.", "strong", "career-path"),
    batch3Supplement("urlacher-bears", "I spent my entire 13-season NFL career with the Bears.", "giveaway", "career-path", 10),
    batch3Supplement("urlacher-droy", "I was AP NFL Defensive Rookie of the Year in 2000.", "strong", "accomplishments"),
    batch3Supplement("urlacher-dpoy", "I was AP NFL Defensive Player of the Year in 2005.", "giveaway", "accomplishments", 9),
    batch3Supplement("urlacher-eight", "I was selected to eight Pro Bowls.", "strong", "accomplishments"),
  ]],
  ["dick-butkus", [
    batch3Supplement("butkus-illinois", "I played college football at Illinois.", "helpful", "background"),
    batch3Supplement("butkus-third", "Chicago selected me No. 3 overall in the 1965 NFL Draft.", "strong", "career-path"),
    batch3Supplement("butkus-bears", "I spent my entire NFL career with the Bears.", "giveaway", "career-path", 10),
    batch3Supplement("butkus-51", "Chicago retired my No. 51.", "strong", "identity"),
  ]],
  ["lawrence-taylor", [
    batch3Supplement("lt-unc", "I played college football at North Carolina.", "helpful", "background"),
    batch3Supplement("lt-second", "The Giants selected me No. 2 overall in the 1981 NFL Draft.", "strong", "career-path"),
    batch3Supplement("lt-giants", "I spent my entire 13-season NFL career with the New York Giants.", "giveaway", "career-path", 10),
    batch3Supplement("lt-rookie", "As a rookie I won both Defensive Rookie of the Year and Defensive Player of the Year.", "giveaway", "accomplishments", 8),
    batch3Supplement("lt-three-dpoy", "I won AP NFL Defensive Player of the Year three times.", "strong", "accomplishments"),
    batch3Supplement("lt-two-rings", "I won two Super Bowls with the Giants.", "strong", "accomplishments"),
    batch3Supplement("lt-56", "The Giants retired my No. 56.", "strong", "identity"),
  ]],
  ["nfl-ray-lewis", [
    batch3Supplement("ray-miami", "I played college football at Miami.", "helpful", "background"),
    batch3Supplement("ray-26", "Baltimore selected me No. 26 overall in the 1996 NFL Draft.", "strong", "career-path"),
    batch3Supplement("ray-17", "I spent all 17 of my NFL seasons with the Ravens.", "giveaway", "career-path", 10),
    batch3Supplement("ray-dpoy", "I won AP NFL Defensive Player of the Year twice.", "strong", "accomplishments"),
    batch3Supplement("ray-sb35", "I was MVP of Super Bowl XXXV.", "giveaway", "accomplishments", 8),
    batch3Supplement("ray-sb47", "I finished my career by winning Super Bowl XLVII.", "giveaway", "accomplishments", 9),
    batch3Supplement("ray-52", "No. 52 became my signature number in Baltimore.", "strong", "identity"),
  ]],
  ["nfl-sam-huff", [
    batch3Supplement("huff-wvu", "I played college football at West Virginia.", "helpful", "background"),
    batch3Supplement("huff-giants", "I became the middle linebacker at the center of the New York Giants defense.", "giveaway", "career-path", 10),
    batch3Supplement("huff-path", "My NFL career included the Giants and Washington.", "strong", "career-path"),
    batch3Supplement("huff-five", "I was selected to five Pro Bowls.", "strong", "accomplishments"),
  ]],
  ["nfl-andre-tippett", [
    batch3Supplement("tippett-iowa", "I played college football at Iowa.", "helpful", "background"),
    batch3Supplement("tippett-draft", "New England selected me in the second round, No. 41 overall, in the 1982 NFL Draft.", "strong", "career-path"),
    batch3Supplement("tippett-pats", "I spent my entire NFL career with the Patriots.", "giveaway", "career-path", 10),
    batch3Supplement("tippett-sb20", "I was a defensive star on New England's first Super Bowl team in the 1985 season.", "strong", "accomplishments"),
  ]],
  ["nfl-bobby-bell", [
    batch3Supplement("bell-minnesota", "I played college football at Minnesota.", "helpful", "background"),
    batch3Supplement("bell-chiefs", "I spent my entire pro football career with the Kansas City Chiefs franchise.", "giveaway", "career-path", 10),
    batch3Supplement("bell-sb4", "I helped Kansas City win Super Bowl IV.", "giveaway", "accomplishments", 9),
    batch3Supplement("bell-nine", "I was selected to nine Pro Bowls or AFL All-Star games.", "strong", "accomplishments"),
  ]],
  ["nfl-cameron-jordan", [
    batch3Supplement("jordan-position", "I built my NFL career as a defensive end and edge rusher.", "broad", "role", 12),
    batch3Supplement("jordan-cal", "I played college football at California.", "helpful", "background"),
    batch3Supplement("jordan-draft", "New Orleans selected me No. 24 overall in the 2011 NFL Draft.", "strong", "career-path"),
    batch3Supplement("jordan-saints", "The Saints have been my only NFL team.", "giveaway", "career-path", 10),
    batch3Supplement("jordan-94", "I wear No. 94 for New Orleans.", "strong", "identity"),
    batch3Supplement("jordan-sack-leader", "I became the Saints' all-time franchise leader in sacks.", "giveaway", "accomplishments", 9),
    batch3Supplement("jordan-current", "I returned to New Orleans for a 16th Saints season in 2026.", "giveaway", "career-path", 8),
    batch3Supplement("jordan-eight", "I was selected to eight Pro Bowls, the most by a defensive player in Saints history.", "strong", "accomplishments"),
    batch3Supplement("jordan-ap1", "I earned AP first-team All-Pro honors in 2017.", "strong", "accomplishments"),
    batch3Supplement("jordan-decade", "I was selected to the NFL's All-Decade Team of the 2010s.", "strong", "accomplishments"),
    batch3Supplement("jordan-2025-sacks", "I led New Orleans with 10.5 sacks in 2025.", "strong", "production"),
    batch3Supplement("jordan-bart-starr", "I received the Bart Starr Award for the 2025 season.", "strong", "accomplishments"),
  ]],
  ["nfl-cameron-wake", [
    batch3Supplement("wake-penn-state", "I played college football at Penn State.", "helpful", "background"),
    batch3Supplement("wake-cfl", "After being cut by the Giants, I rebuilt my career with the BC Lions in the CFL.", "giveaway", "career-path", 9),
    batch3Supplement("wake-dolphins", "My NFL breakthrough came with the Miami Dolphins in 2009.", "giveaway", "career-path", 10),
    batch3Supplement("wake-five", "I was selected to five Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("wake-100", "I finished my NFL career with more than 100 sacks.", "strong", "production"),
    batch3Supplement("wake-titans", "I finished my NFL career with Tennessee after a decade in Miami.", "strong", "career-path"),
  ]],
  ["nfl-chris-hanburger", [
    batch3Supplement("hanburger-unc", "I played college football at North Carolina.", "helpful", "background"),
    batch3Supplement("hanburger-washington", "I spent my entire 14-season NFL career with Washington.", "giveaway", "career-path", 10),
    batch3Supplement("hanburger-nine", "I was selected to nine Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("hanburger-four", "I earned first-team All-Pro honors four times.", "strong", "accomplishments"),
  ]],
  ["nfl-chuck-howley", [
    batch3Supplement("howley-wvu", "I played college football at West Virginia.", "helpful", "background"),
    batch3Supplement("howley-bears-cowboys", "My NFL career began with Chicago before I came out of retirement and became a star for Dallas.", "strong", "career-path"),
    batch3Supplement("howley-six", "I was selected to six Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("howley-sb5", "I became the only player to win Super Bowl MVP while playing for the losing team.", "giveaway", "accomplishments", 8),
    batch3Supplement("howley-sb6", "I returned the next season and won Super Bowl VI with Dallas.", "giveaway", "accomplishments", 9),
  ]],
  ["clay-matthews", [
    batch3Supplement("clay-usc", "I played college football at USC.", "helpful", "background"),
    batch3Supplement("clay-draft", "Green Bay selected me No. 26 overall in the 2009 NFL Draft.", "strong", "career-path"),
    batch3Supplement("clay-packers", "I spent 10 seasons with Green Bay before one final year with the Rams.", "giveaway", "career-path", 10),
    batch3Supplement("clay-six", "I was selected to six Pro Bowls.", "strong", "accomplishments"),
    batch3Supplement("clay-sb45", "I won Super Bowl XLV with the Packers.", "giveaway", "accomplishments", 9),
    batch3Supplement("clay-52", "No. 52 became my signature number in Green Bay.", "strong", "identity"),
  ]],
]);


function batch3ReplayClue(
  id: string,
  text: string,
  band: WhoAmIClue["band"] = "helpful",
  facet: WhoAmIClue["facet"] = "identity",
  revealPriority = 18,
): WhoAmIClue {
  return { id: "curated3-replay:" + id, conceptId: "curated3-replay:" + id, text, band, facet, revealPriority };
}

const batch3ReplayDepthClues = new Map<string, readonly WhoAmIClue[]>([
  ["nfl-chuck-bednarik", [
    batch3ReplayClue("bednarik-two-way", "Center and linebacker were both defining positions in my Eagles career.", "helpful", "role"),
    batch3ReplayClue("bednarik-hof", "I was elected to the Pro Football Hall of Fame in 1967.", "strong", "accomplishments"),
  ]],
  ["nfl-joe-thomas", [
    batch3ReplayClue("thomas-left-tackle", "Left tackle was my position throughout my Cleveland career.", "helpful", "role"),
    batch3ReplayClue("thomas-snap-ending", "My record run of consecutive snaps ended only when a triceps injury stopped my 2017 season.", "helpful", "accomplishments"),
    batch3ReplayClue("thomas-six-ap1", "I earned first-team All-Pro honors six times.", "strong", "accomplishments", 14),
  ]],
  ["nfl-orlando-pace", [
    batch3ReplayClue("pace-left-tackle", "Left tackle was my signature NFL position.", "helpful", "role"),
    batch3ReplayClue("pace-rams-bears", "I spent 12 seasons with the Rams before finishing my career with Chicago.", "helpful", "career-path"),
    batch3ReplayClue("pace-76", "No. 76 became my signature number with the Rams.", "helpful", "identity"),
  ]],
  ["bruce-smith", [
    batch3ReplayClue("bruce-end", "Defensive end was my primary NFL position.", "helpful", "role"),
    batch3ReplayClue("bruce-buffalo-washington", "I spent 15 seasons with Buffalo before finishing my career in Washington.", "helpful", "career-path"),
    batch3ReplayClue("bruce-hof", "I was elected to the Pro Football Hall of Fame in 2009.", "strong", "accomplishments"),
  ]],
  ["nfl-alex-karras", [
    batch3ReplayClue("karras-dt", "Defensive tackle was my position in Detroit.", "helpful", "role"),
    batch3ReplayClue("karras-71", "I wore No. 71 for the Lions.", "helpful", "identity"),
    batch3ReplayClue("karras-hof", "I was elected to the Pro Football Hall of Fame in 2020.", "strong", "accomplishments"),
  ]],
  ["nfl-bob-lilly", [
    batch3ReplayClue("lilly-dt", "Defensive tackle was my defining position in Dallas.", "helpful", "role"),
    batch3ReplayClue("lilly-eleven-probowls", "I was selected to 11 Pro Bowls.", "strong", "accomplishments"),
    batch3ReplayClue("lilly-hof", "I was elected to the Pro Football Hall of Fame in 1980.", "strong", "accomplishments"),
  ]],
  ["nfl-bryant-young", [
    batch3ReplayClue("young-dt", "Defensive tackle was my primary position in San Francisco.", "helpful", "role"),
    batch3ReplayClue("young-97", "I wore No. 97 throughout my 49ers career.", "helpful", "identity"),
    batch3ReplayClue("young-ap1", "I earned first-team All-Pro honors in 1996.", "strong", "accomplishments"),
  ]],
  ["nfl-carl-eller", [
    batch3ReplayClue("eller-end", "Defensive end was my position on Minnesota's front.", "helpful", "role"),
    batch3ReplayClue("eller-81", "I wore No. 81 for the Vikings.", "helpful", "identity"),
    batch3ReplayClue("eller-sixth", "Minnesota selected me No. 6 overall in the 1964 NFL Draft.", "strong", "career-path"),
  ]],
  ["nfl-carlos-dunlap", [
    batch3ReplayClue("dunlap-end", "Defensive end was my primary NFL position.", "helpful", "role"),
    batch3ReplayClue("dunlap-96", "No. 96 became my signature number in Cincinnati.", "helpful", "identity"),
    batch3ReplayClue("dunlap-bcs-mvp", "I was the defensive MVP of Florida's BCS National Championship Game win for the 2008 season.", "strong", "accomplishments"),
  ]],
  ["nfl-chandler-jones", [
    batch3ReplayClue("chandler-edge", "I built my NFL career as an edge rusher and defensive end.", "helpful", "role"),
    batch3ReplayClue("chandler-55", "No. 55 became my signature number in Arizona.", "helpful", "identity"),
    batch3ReplayClue("chandler-ap1", "I earned first-team All-Pro honors in 2017.", "strong", "accomplishments"),
  ]],
  ["nfl-charles-haley", [
    batch3ReplayClue("haley-1992-trade", "A 1992 trade sent me from San Francisco to Dallas.", "helpful", "career-path"),
    batch3ReplayClue("haley-hof", "I was elected to the Pro Football Hall of Fame in 2015.", "strong", "accomplishments"),
    batch3ReplayClue("haley-edge-role", "I moved between outside linebacker and defensive end as a pass rusher.", "helpful", "role"),
  ]],
  ["nfl-chris-doleman", [
    batch3ReplayClue("doleman-end", "Defensive end was my primary NFL position.", "helpful", "role"),
    batch3ReplayClue("doleman-minnesota", "Most of my NFL career came with the Minnesota Vikings.", "helpful", "career-path"),
    batch3ReplayClue("doleman-hof", "I was elected to the Pro Football Hall of Fame in 2012.", "strong", "accomplishments"),
  ]],
  ["nfl-elvin-bethea", [
    batch3ReplayClue("bethea-65", "I wore No. 65 for the Houston Oilers.", "helpful", "identity"),
    batch3ReplayClue("bethea-third-round", "Houston selected me in the third round of the 1968 draft.", "strong", "career-path"),
    batch3ReplayClue("bethea-end", "Defensive end became my NFL home after I entered the league with offensive-line experience.", "helpful", "role"),
  ]],
  ["nfl-elvis-dumervil", [
    batch3ReplayClue("dumervil-six-sacks", "At Louisville I tied the NCAA single-game record with six sacks against Kentucky in 2005.", "helpful", "production"),
    batch3ReplayClue("dumervil-big-east", "I was the Big East Defensive Player of the Year in 2005.", "strong", "accomplishments"),
    batch3ReplayClue("dumervil-edge", "I made my NFL living as an undersized edge rusher.", "helpful", "role"),
  ]],
  ["nfl-fred-dean", [
    batch3ReplayClue("dean-second-round", "San Diego selected me in the second round of the 1975 NFL Draft.", "strong", "career-path"),
    batch3ReplayClue("dean-hof", "I was elected to the Pro Football Hall of Fame in 2008.", "strong", "accomplishments"),
    batch3ReplayClue("dean-end", "Defensive end became my NFL position after I had played linebacker in college.", "helpful", "role"),
  ]],
  ["nfl-andre-tippett", [
    batch3ReplayClue("tippett-olb", "Outside linebacker was my position in New England.", "helpful", "role"),
    batch3ReplayClue("tippett-56", "I wore No. 56 for the Patriots.", "helpful", "identity"),
    batch3ReplayClue("tippett-hof", "I was elected to the Pro Football Hall of Fame in 2008.", "strong", "accomplishments"),
  ]],
  ["nfl-bobby-bell", [
    batch3ReplayClue("bell-olb", "Outside linebacker became my defining pro position in Kansas City.", "helpful", "role"),
    batch3ReplayClue("bell-78", "I wore No. 78 for the Chiefs.", "helpful", "identity"),
    batch3ReplayClue("bell-outland", "I won the Outland Trophy at Minnesota in 1962.", "strong", "accomplishments"),
    batch3ReplayClue("bell-hof", "I was elected to the Pro Football Hall of Fame in 1983.", "strong", "accomplishments"),
    batch3ReplayClue("bell-super-bowl-i", "I also started for Kansas City in the first Super Bowl.", "strong", "accomplishments"),
  ]],
  ["nfl-cameron-wake", [
    batch3ReplayClue("wake-undrafted", "I went undrafted in 2005 before eventually earning my NFL breakthrough.", "helpful", "career-path"),
    batch3ReplayClue("wake-91", "I wore No. 91 for Miami.", "helpful", "identity"),
    batch3ReplayClue("wake-ap1", "I earned first-team All-Pro honors in 2012.", "strong", "accomplishments"),
    batch3ReplayClue("wake-cfl-awards", "Before returning to the NFL, I twice won the CFL's Most Outstanding Defensive Player award.", "strong", "accomplishments"),
  ]],
]);

function batch3ShouldSuppressMetric(subject: FootballSubjectProfile, clue: WhoAmIClue) {
  if (!clue.id.startsWith("fact:nfl-")) return false;
  if (clue.id === "fact:nfl-career-games" || clue.id === "fact:nfl-career-targets") return true;
  if (
    /^fact:nfl-career-(?:solo-tackles|tackles-for-loss|forced-fumbles|interceptions|passes-defended)$/.test(clue.id)
  ) return true;
  if (
    (batch3Active2026SubjectIds.has(subject.id) || batch3PartialCareerCoverageSubjectIds.has(subject.id))
    && /^fact:nfl-career-/.test(clue.id)
  ) return true;
  if (batch3RetrospectiveSackSubjectIds.has(subject.id) && clue.id === "fact:nfl-career-sacks") return true;
  return false;
}

function batch3ClueQualityScore(subject: FootballSubjectProfile, clue: WhoAmIClue) {
  let score = clueQualityScore(subject, clue);
  if (clue.id.startsWith("curated3:")) score += 55;
  if (clue.id.startsWith("curated3-replay:")) score += 85;
  if (clue.id === "position" || clue.id === "era") score += 20;
  return score;
}

const batch3ForcedPoolIds = new Map<string, ReadonlySet<string>>([
  ["nfl-joe-thomas", new Set([
    "position",
    "era",
    "curated3:thomas-wisconsin",
    "curated3-replay:thomas-left-tackle",
    "curated3:thomas-73",
    "identity:ten-thousand-snap-streak",
    "identity:twenty-starting-quarterbacks",
    "identity:ten-straight-pro-bowls",
    "curated3:thomas-draft",
    "identity:first-ballot-browns-tackle",
    "curated3:thomas-browns-only",
    "curated3-replay:thomas-six-ap1",
  ])],
  ["nfl-orlando-pace", new Set([
    "position",
    "era",
    "identity:started-first-day-freshman-camp",
    "identity:pancake-block-famous",
    "curated3:pace-ohio-state",
    "curated3-replay:pace-76",
    "identity:first-sophomore-lombardi",
    "identity:fourth-in-heisman",
    "curated3:pace-probowls",
    "curated3:pace-sb34",
    "identity:first-overall-1997",
    "curated3:pace-rams",
  ])],
]);

function trimNflBatch3Pool(subject: FootballSubjectProfile, clues: readonly WhoAmIClue[]) {
  const target = 16;
  if (clues.length <= target) return [...clues];
  const ranked = clues
    .map((clue, index) => ({ clue, index, score: batch3ClueQualityScore(subject, clue) }))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  const selected = new Set(ranked.slice(0, target).map((entry) => entry.clue.id));
  return clues.filter((clue) => selected.has(clue.id));
}

function curateNflBatch3Clues(subject: FootballSubjectProfile, rawClues: readonly WhoAmIClue[]) {
  const retained = batch3RetainedIdentityConcepts.get(subject.id);
  let colorUsed = false;
  const curated: WhoAmIClue[] = [];

  for (const rawClue of rawClues) {
    if (rawClue.id === "player-career-start" || rawClue.id === "player-career-end") continue;
    if (
      rawClue.id === "career-span"
      && (batch3Active2026SubjectIds.has(subject.id) || batch3PartialCareerCoverageSubjectIds.has(subject.id))
    ) continue;
    if (subject.id === "nfl-cameron-jordan" && rawClue.id === "position") continue;
    if (batch3ShouldSuppressMetric(subject, rawClue)) continue;
    if (
      rawClue.identityKnowledge
      && retained
      && !retained.has(rawClue.conceptId ?? "")
      && !retained.has(rawClue.id)
    ) continue;

    const clue = applyBatch3IdentityCuration(subject.id, rawClue);
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

  curated.push(...(batch3SupplementalClues.get(subject.id) ?? []));
  curated.push(...(batch3ReplayDepthClues.get(subject.id) ?? []));
  const forcedPool = batch3ForcedPoolIds.get(subject.id);
  if (forcedPool) return curated.filter((clue) => forcedPool.has(clue.id));
  return trimNflBatch3Pool(subject, curated);
}

export function isNflWhoAmIBatch3Subject(subjectId: string) {
  return batch3SubjectIds.has(subjectId);
}



export const NFL_WHO_AM_I_BATCH_4_SUBJECT_IDS = [
  "nfl-dave-robinson",
  "nfl-dave-wilcox",
  "nfl-demarcus-ware",
  "derrick-brooks",
  "nfl-derrick-thomas",
  "nfl-harry-carson",
  "nfl-charles-woodson",
  "deion-sanders",
  "nfl-dick-night-train-lane",
  "nfl-ed-reed",
  "nfl-emlen-tunnell",
  "ronnie-lott",
  "nfl-troy-polamalu",
  "nfl-aeneas-williams",
  "nfl-aqib-talib",
  "nfl-asante-samuel",
  "brian-dawkins",
  "champ-bailey",
  "nfl-charles-tillman",
  "nfl-cliff-harris",
  "nfl-darrell-green",
  "nfl-darrelle-revis",
  "nfl-darren-sharper",
  "nfl-deangelo-hall",
  "nfl-devin-mccourty",
  "nfl-dick-lebeau",
  "nfl-donnie-shell",
  "nfl-dre-bly",
  "nfl-emmitt-thomas",
  "nfl-eric-allen",
  "andy-reid",
  "bill-belichick",
  "bill-parcells",
  "bill-walsh",
  "chuck-noll",
  "don-shula",
  "nfl-earl-curly-lambeau",
  "nfl-george-halas",
  "nfl-jimmy-johnson-coach",
  "joe-gibbs",
  "nfl-john-madden",
  "paul-brown",
  "pete-carroll",
  "tom-landry",
  "vince-lombardi",
  "bill-cowher",
  "nfl-bud-grant",
  "dick-vermeil",
  "nfl-don-coryell",
  "nfl-george-allen",
] as const;

const batch4SubjectIds = new Set<string>(NFL_WHO_AM_I_BATCH_4_SUBJECT_IDS);

const batch4PartialCareerCoverageSubjectIds = new Set<string>([
  "derrick-brooks",
  "nfl-derrick-thomas",
  "nfl-charles-woodson",
  "nfl-aeneas-williams",
  "brian-dawkins",
  "nfl-darren-sharper",
  "nfl-darrell-green",
  "nfl-eric-allen",
]);

const batch4Active2026SubjectIds = new Set<string>(["andy-reid"]);

const batch4RetainedIdentityConcepts = new Map<string, ReadonlySet<string>>([
  ["nfl-dave-robinson", keep("identity:dave-robinson-two-way-end-to-linebacker", "identity:dave-robinson-achilles-comeback", "identity:dave-robinson-tight-end-jam-technique", "identity:dave-robinson-retirement-trade-return", "identity:pro-bowls")],
  ["nfl-dave-wilcox", keep("identity:dave-wilcox-afl-nfl-choice", "identity:dave-wilcox-hula-bowl-defensive-first", "identity:dave-wilcox-intimidator-nickname-contrast", "identity:dave-wilcox-internal-1306-grade", "identity:pro-bowls", "identity:five-all-nfl-selections")],
  ["nfl-demarcus-ware", keep("identity:demarcus-ware-lanky-receiver-to-pass-rusher", "identity:demarcus-ware-pass-rush-notebook")],
  ["derrick-brooks", keep()],
  ["nfl-derrick-thomas", keep("identity:three-all-pro-selections")],
  ["nfl-harry-carson", keep("identity:harry-carson-college-line-to-middle-linebacker", "identity:harry-carson-parcells-team-conduit", "identity:harry-carson-gatorade-shower", "identity:pro-bowls", "identity:super-bowl-xxi-title")],
  ["nfl-charles-woodson", keep()],
  ["deion-sanders", keep()],
  ["nfl-dick-night-train-lane", keep("identity:offense-to-defense-position-switch", "identity:night-train-song-nickname", "identity:clothesline-tackling-style", "identity:pro-bowls")],
  ["nfl-ed-reed", keep("identity:2001-boston-college-lateral")],
  ["nfl-emlen-tunnell", keep("identity:college-status-draft-confusion", "identity:hitchhike-giants-tryout", "identity:first-black-giant-and-hall-pioneer")],
  ["ronnie-lott", keep()],
  ["nfl-troy-polamalu", keep("identity:quiet-to-tasmanian-devil-persona")],
  ["nfl-aeneas-williams", keep("identity:accounting-student-late-football-walkon")],
  ["nfl-aqib-talib", keep("identity:kansas-two-way-corner-receiver")],
  ["nfl-asante-samuel", keep("identity:quarterback-dream-to-defensive-back", "identity:eighteen-interception-first-camp")],
  ["brian-dawkins", keep("identity:free-lance-safety-role")],
  ["champ-bailey", keep("identity:champ-bailey-georgia-long-jump-record")],
  ["nfl-charles-tillman", keep("identity:charles-tillman-peanut-nickname-origin", "identity:charles-tillman-high-school-film-study")],
  ["nfl-cliff-harris", keep("identity:cliff-harris-undrafted-seventeen-rounds", "identity:cliff-harris-free-safety-archetype", "identity:cliff-harris-small-college-award", "identity:six-all-pro-all-nfc-selections")],
  ["nfl-darrell-green", keep("identity:darrell-green-track-speed-identity")],
  ["nfl-darrelle-revis", keep("identity:darrelle-revis-acl-near-retirement", "identity:darrelle-revis-anticipatory-film-study")],
  ["nfl-darren-sharper", keep("identity:darren-sharper-scout-wakeup-call", "identity:darren-sharper-mike-tomlin-college-relationship")],
  ["nfl-deangelo-hall", keep("identity:deangelo-hall-green-sanders-role-models", "identity:deangelo-hall-shanahan-practice-reset")],
  ["nfl-devin-mccourty", keep()],
  ["nfl-dick-lebeau", keep("identity:dick-lebeau-ohio-state-qb-halfback", "identity:dick-lebeau-coach-dad", "identity:dick-lebeau-coached-to-eighty", "identity:pro-bowls")],
  ["nfl-donnie-shell", keep("identity:donnie-shell-bill-nunn-willie-jeffries", "identity:donnie-shell-torpedo-nickname", "identity:donnie-shell-fifth-1974-hall-of-famer", "identity:pro-bowls", "identity:five-all-pro-selections")],
  ["nfl-dre-bly", keep("identity:dre-bly-freshman-consensus-all-american", "identity:dre-bly-three-straight-first-team-all-america")],
  ["nfl-emmitt-thomas", keep("identity:emmitt-thomas-qb-wr-to-corner", "identity:emmitt-thomas-coached-offense-first", "identity:emmitt-thomas-51-year-nfl-circle")],
  ["nfl-eric-allen", keep("identity:eric-allen-nearly-retired-before-raiders", "identity:eric-allen-charles-woodson-oracle", "identity:eric-allen-refused-safety-switch", "identity:upi-defensive-player-of-year-1993")],
  ["andy-reid", keep("identity:punt-pass-kick-giant-kid", "identity:lavell-edwards-coaching-nudge", "identity:holmgren-byu-connection")],
  ["bill-belichick", keep("identity:navy-coaching-family", "identity:father-film-study-mentorship", "identity:lacrosse-first-sport-preference", "identity:wesleyan-multi-sport-profile", "identity:entry-level-nfl-origin")],
  ["bill-parcells", keep("identity:earn-the-star-rookie-tradition")],
  ["bill-walsh", keep("identity:marv-levy-career-bridge", "identity:greg-cook-injury-offensive-pivot", "identity:late-head-coaching-breakthrough", "identity:49ers-three-year-turnaround", "identity:coaching-tree-legacy")],
  ["chuck-noll", keep("identity:messenger-guard-player-role", "identity:teacher-first-philosophy", "identity:discarded-opponent-playbook")],
  ["don-shula", keep("identity:coached-before-playing-pro", "identity:pro-playing-career", "identity:youngest-head-coach-breakthrough")],
  ["nfl-earl-curly-lambeau", keep("identity:career-coaching-wins", "identity:pass-first-offensive-pioneer")],
  ["nfl-george-halas", keep("identity:yankees-outfielder-before-nfl", "identity:bears-every-role", "identity:t-formation-modernization")],
  ["nfl-jimmy-johnson-coach", keep("identity:draft-obsession-team-builder")],
  ["joe-gibbs", keep("identity:don-coryell-protege", "identity:zero-five-first-season-start")],
  ["nfl-john-madden", keep("identity:injury-led-film-education", "identity:teacher-before-famous-coach", "identity:don-coryell-apprenticeship")],
  ["paul-brown", keep("identity:year-round-professional-coaching", "identity:messenger-guard-playcalling", "identity:pro-football-integration")],
  ["pete-carroll", keep("identity:jets-fake-spike-collapse", "identity:buffalo-banners-win-forever-seed", "identity:post-patriots-john-wooden-reset", "identity:music-driven-practices")],
  ["tom-landry", keep("identity:multi-role-playing-career", "identity:player-coach-transition", "identity:offensive-and-personnel-innovation")],
  ["vince-lombardi", keep("identity:fordham-seven-blocks", "identity:pre-packers-coaching-path")],
  ["bill-cowher", keep("identity:linebacker-special-teamer-to-coach", "identity:super-bowl-onside-kick-gamble", "identity:succeeding-noll-without-replacing-him")],
  ["nfl-bud-grant", keep("identity:nfl-defensive-end-to-receiver-switch", "identity:contract-dispute-led-to-canada", "identity:cfl-player-to-young-head-coach")],
  ["dick-vermeil", keep("identity:dick-vermeil-first-full-time-special-teams-coach", "identity:dick-vermeil-emotional-leadership")],
  ["nfl-don-coryell", keep("identity:don-coryell-itinerant-early-coaching", "identity:nfl-coach-of-year-1974")],
  ["nfl-george-allen", keep("identity:george-allen-left-footed-practice-punter", "identity:george-allen-game-time-sun-practice", "identity:george-allen-double-o-spy-patrol", "identity:nfl-coach-of-year-1967")],
]);

function batch4Clue(
  id: string,
  text: string,
  band: WhoAmIClue["band"] = "strong",
  facet: WhoAmIClue["facet"] = "accomplishments",
  revealPriority = 16,
): WhoAmIClue {
  return { id: "curated4:" + id, conceptId: "curated4:" + id, text, band, facet, revealPriority };
}

const batch4SupplementalClues = new Map<string, readonly WhoAmIClue[]>([
  ["nfl-dave-robinson", [
    batch4Clue("robinson-penn-state", "I played college football at Penn State.", "helpful", "background"),
    batch4Clue("robinson-packers-first", "Green Bay selected me in the first round of the 1963 NFL Draft.", "helpful", "career-path"),
    batch4Clue("robinson-packers-washington", "I spent 10 seasons with Green Bay before finishing with two seasons in Washington.", "strong", "career-path"),
    batch4Clue("robinson-three-titles", "I started at linebacker on three straight championship teams in Green Bay, including the winners of Super Bowls I and II.", "giveaway", "accomplishments", 9),
    batch4Clue("robinson-hof", "I was elected to the Pro Football Hall of Fame in 2013.", "strong", "accomplishments"),
  ]],
  ["nfl-dave-wilcox", [
    batch4Clue("wilcox-oregon", "I finished my college career at Oregon after beginning at Boise Junior College.", "helpful", "background"),
    batch4Clue("wilcox-29", "San Francisco selected me No. 29 overall in the 1964 NFL Draft.", "strong", "career-path"),
    batch4Clue("wilcox-49ers-only", "I spent all 11 of my NFL seasons with the San Francisco 49ers.", "giveaway", "career-path", 10),
    batch4Clue("wilcox-hof", "I was elected to the Pro Football Hall of Fame in 2000.", "strong", "accomplishments"),
  ]],
  ["nfl-demarcus-ware", [
    batch4Clue("ware-troy", "I played college football at Troy.", "helpful", "background"),
    batch4Clue("ware-eleventh", "Dallas selected me No. 11 overall in the 2005 NFL Draft.", "strong", "career-path"),
    batch4Clue("ware-cowboys-broncos", "My NFL career was split between the Dallas Cowboys and Denver Broncos.", "strong", "career-path"),
    batch4Clue("ware-nine-pro-bowls", "I was selected to nine Pro Bowls.", "strong", "accomplishments"),
    batch4Clue("ware-super-bowl-50", "I won Super Bowl 50 with Denver.", "giveaway", "accomplishments", 9),
    batch4Clue("ware-hof", "I was elected to the Pro Football Hall of Fame in 2023.", "strong", "accomplishments"),
    batch4Clue("ware-94", "No. 94 became my signature NFL jersey number.", "helpful", "identity"),
  ]],
  ["derrick-brooks", [
    batch4Clue("brooks-fsu", "I was a three-time All-American at Florida State.", "helpful", "background"),
    batch4Clue("brooks-28", "Tampa Bay selected me No. 28 overall in the 1995 NFL Draft.", "strong", "career-path"),
    batch4Clue("brooks-bucs-only", "I spent all 14 of my NFL seasons with the Tampa Bay Buccaneers.", "giveaway", "career-path", 10),
    batch4Clue("brooks-eleven-pro-bowls", "I was selected to 11 Pro Bowls.", "strong", "accomplishments"),
    batch4Clue("brooks-dpoy", "I was the NFL Defensive Player of the Year in 2002.", "strong", "accomplishments"),
    batch4Clue("brooks-sb37", "I returned an interception for a touchdown in Tampa Bay's Super Bowl XXXVII victory.", "giveaway", "accomplishments", 8),
    batch4Clue("brooks-55", "Tampa Bay retired my No. 55.", "giveaway", "identity", 10),
    batch4Clue("brooks-hof", "I was elected to the Pro Football Hall of Fame in 2014.", "strong", "accomplishments"),
    batch4Clue("brooks-ap", "I earned six first-team All-Pro selections.", "strong", "accomplishments"),
    batch4Clue("brooks-cornerstone", "I was the long-term weak-side linebacker at the heart of Tampa Bay's championship-era defense.", "helpful", "role"),
  ]],
  ["nfl-derrick-thomas", [
    batch4Clue("thomas-alabama", "I won the Butkus Award as an All-American at Alabama.", "helpful", "background"),
    batch4Clue("thomas-fourth", "Kansas City selected me No. 4 overall in the 1989 NFL Draft.", "strong", "career-path"),
    batch4Clue("thomas-chiefs-only", "I spent my entire 11-season NFL career with the Kansas City Chiefs.", "giveaway", "career-path", 10),
    batch4Clue("thomas-droy", "I was the NFL Defensive Rookie of the Year in 1989.", "helpful", "accomplishments"),
    batch4Clue("thomas-nine-pro-bowls", "I was selected to nine consecutive Pro Bowls.", "strong", "accomplishments"),
    batch4Clue("thomas-seven-sacks", "I set an NFL single-game record with seven sacks against Seattle in 1990.", "giveaway", "accomplishments", 8),
    batch4Clue("thomas-58", "Kansas City retired my No. 58.", "giveaway", "identity", 10),
    batch4Clue("thomas-126", "I finished my career with 126.5 sacks.", "helpful", "production"),
    batch4Clue("thomas-hof", "I was elected to the Pro Football Hall of Fame in 2009.", "strong", "accomplishments"),
    batch4Clue("thomas-90s", "No NFL player recorded more sacks during the 1990s than I did.", "strong", "accomplishments"),
  ]],
  ["nfl-harry-carson", [
    batch4Clue("carson-scsu", "I played college football at South Carolina State.", "helpful", "career-path"),
    batch4Clue("carson-fourth-round", "The Giants selected me in the fourth round of the 1976 NFL Draft.", "helpful", "career-path"),
    batch4Clue("carson-giants-only", "I spent all 13 of my NFL seasons with the New York Giants.", "helpful", "career-path", 24),
    batch4Clue("carson-lt-banks", "I formed a famous Giants linebacker trio with Lawrence Taylor and Carl Banks.", "strong", "role", 12),
    batch4Clue("carson-hof", "I was elected to the Pro Football Hall of Fame in 2006.", "strong", "accomplishments"),
    batch4Clue("carson-53", "No. 53 became my signature number with the Giants.", "helpful", "identity"),
  ]],
  ["nfl-charles-woodson", [
    batch4Clue("woodson-michigan", "I won the Heisman Trophy at Michigan in 1997.", "giveaway", "background", 10),
    batch4Clue("woodson-fourth", "Oakland selected me No. 4 overall in the 1998 NFL Draft.", "strong", "career-path"),
    batch4Clue("woodson-rookie", "I was the AP Defensive Rookie of the Year in 1998.", "strong", "accomplishments"),
    batch4Clue("woodson-raiders-packers", "I played only for the Raiders and Packers during my 18 NFL seasons.", "strong", "career-path"),
    batch4Clue("woodson-dpoy", "I was the NFL Defensive Player of the Year in 2009.", "strong", "accomplishments"),
    batch4Clue("woodson-sb45", "I won Super Bowl XLV with Green Bay.", "giveaway", "accomplishments", 9),
    batch4Clue("woodson-nine-pro-bowls", "I was selected to nine Pro Bowls.", "strong", "accomplishments"),
    batch4Clue("woodson-50-20", "I became the first NFL player to reach both 50 interceptions and 20 sacks.", "strong", "accomplishments"),
    batch4Clue("woodson-hof", "I was elected to the Pro Football Hall of Fame in 2021.", "strong", "accomplishments"),
    batch4Clue("woodson-24", "No. 24 became my signature NFL jersey number.", "helpful", "identity"),
  ]],
  ["deion-sanders", [
    batch4Clue("deion-fsu", "I played college football at Florida State.", "helpful", "background"),
    batch4Clue("deion-fifth", "Atlanta selected me No. 5 overall in the 1989 NFL Draft.", "strong", "career-path"),
    batch4Clue("deion-prime-time", "“Prime Time” became my signature nickname.", "giveaway", "nickname", 9),
    batch4Clue("deion-five-teams", "My NFL career included Atlanta, San Francisco, Dallas, Washington and Baltimore.", "strong", "career-path"),
    batch4Clue("deion-1994-dpoy", "I was the NFL Defensive Player of the Year in 1994 with San Francisco.", "strong", "accomplishments"),
    batch4Clue("deion-back-to-back", "I won Super Bowls in consecutive seasons with the 49ers and Cowboys.", "giveaway", "accomplishments", 8),
    batch4Clue("deion-return", "Cornerback, punt returner and kick returner were all major parts of my NFL identity.", "helpful", "role"),
    batch4Clue("deion-21", "No. 21 became my signature NFL jersey number.", "helpful", "identity"),
    batch4Clue("deion-baseball", "I also reached Major League Baseball while building my football career.", "strong", "career-path"),
    batch4Clue("deion-hof", "I was elected to the Pro Football Hall of Fame in 2011.", "strong", "accomplishments"),
  ]],
  ["nfl-dick-night-train-lane", [
    batch4Clue("lane-undrafted", "I entered the NFL as an undrafted free agent with the Los Angeles Rams in 1952.", "helpful", "career-path"),
    batch4Clue("lane-three-teams", "I played for the Rams, Cardinals and Lions.", "helpful", "career-path"),
    batch4Clue("lane-68", "I finished with 68 career interceptions.", "strong", "production"),
    batch4Clue("lane-hof", "I was elected to the Pro Football Hall of Fame in 1974.", "strong", "accomplishments"),
    batch4Clue("lane-record", "My 14 interceptions as a rookie came in a 12-game season and remain an NFL single-season record.", "giveaway", "accomplishments", 8),
  ]],
  ["nfl-ed-reed", [
    batch4Clue("reed-20", "No. 20 became my signature number in Baltimore.", "helpful", "identity"),
    batch4Clue("reed-ravens", "I spent my first 11 NFL seasons with the Baltimore Ravens.", "giveaway", "career-path", 10),
    batch4Clue("reed-nine-pro-bowls", "I was selected to nine Pro Bowls.", "strong", "accomplishments"),
    batch4Clue("reed-sb47", "I intercepted a pass in Baltimore's Super Bowl XLVII victory.", "giveaway", "accomplishments", 8),
    batch4Clue("reed-return-record", "I hold the NFL career record for interception-return yardage.", "strong", "accomplishments"),
    batch4Clue("reed-long-returns", "I own the two longest interception returns in NFL history, 107 and 106 yards.", "giveaway", "accomplishments", 9),
    batch4Clue("reed-hof", "I was elected to the Pro Football Hall of Fame in 2019.", "strong", "accomplishments"),
  ]],
  ["nfl-emlen-tunnell", [
    batch4Clue("tunnell-giants-packers", "I played for the New York Giants before finishing with the Green Bay Packers.", "strong", "career-path"),
    batch4Clue("tunnell-free-agent", "I entered the NFL as an undrafted free agent in 1948.", "strong", "career-path"),
    batch4Clue("tunnell-79", "I retired with a then-record 79 career interceptions.", "strong", "production"),
    batch4Clue("tunnell-umbrella", "I was the deep safety in the Giants' famed Umbrella Defense.", "strong", "role"),
    batch4Clue("tunnell-hof", "I was elected to the Pro Football Hall of Fame in 1967.", "strong", "accomplishments"),
    batch4Clue("tunnell-nine-pro-bowls", "I was selected to nine Pro Bowls.", "strong", "accomplishments"),
  ]],
  ["ronnie-lott", [
    batch4Clue("lott-usc", "I played college football at USC.", "helpful", "background"),
    batch4Clue("lott-eighth", "San Francisco selected me No. 8 overall in the 1981 NFL Draft.", "strong", "career-path"),
    batch4Clue("lott-three-teams", "I played for the 49ers, Raiders and Jets.", "strong", "career-path"),
    batch4Clue("lott-four-super-bowls", "I won four Super Bowls with San Francisco.", "giveaway", "accomplishments", 8),
    batch4Clue("lott-ten-pro-bowls", "I made 10 Pro Bowls across cornerback, free safety and strong safety.", "strong", "accomplishments"),
    batch4Clue("lott-pinky", "I chose to have the tip of an injured pinky amputated rather than face a longer recovery.", "giveaway", "identity", 9),
    batch4Clue("lott-42", "No. 42 became my signature number with the 49ers.", "helpful", "identity"),
    batch4Clue("lott-63", "I finished with 63 career interceptions.", "strong", "production"),
    batch4Clue("lott-hof", "I was elected to the Pro Football Hall of Fame in 2000.", "strong", "accomplishments"),
    batch4Clue("lott-hard-hit", "A punishing, linebacker-like tackling style became central to my reputation in the secondary.", "helpful", "style"),
  ]],
  ["nfl-troy-polamalu", [
    batch4Clue("polamalu-steelers-only", "I spent my entire 12-season NFL career with the Pittsburgh Steelers.", "giveaway", "career-path", 10),
    batch4Clue("polamalu-43", "No. 43 became my signature number in Pittsburgh.", "helpful", "identity"),
    batch4Clue("polamalu-two-sb", "I won Super Bowls XL and XLIII with Pittsburgh.", "giveaway", "accomplishments", 8),
    batch4Clue("polamalu-eight-pb", "I was selected to eight Pro Bowls.", "strong", "accomplishments"),
    batch4Clue("polamalu-2010-dpoy", "I was the NFL Defensive Player of the Year in 2010.", "strong", "accomplishments"),
    batch4Clue("polamalu-afc-title", "My 40-yard interception-return touchdown helped seal the 2008 AFC Championship Game.", "strong", "accomplishments"),
    batch4Clue("polamalu-hof", "I was elected to the Pro Football Hall of Fame in 2020.", "strong", "accomplishments"),
    batch4Clue("polamalu-hair", "My long hair became one of the most recognizable visual signatures in the NFL.", "helpful", "identity"),
  ]],
  ["nfl-aeneas-williams", [
    batch4Clue("williams-southern", "I walked on at Southern University and eventually led the nation in interceptions as a senior.", "helpful", "background"),
    batch4Clue("williams-59", "The Phoenix Cardinals selected me No. 59 overall in the 1991 NFL Draft.", "helpful", "career-path"),
    batch4Clue("williams-cardinals-rams", "I spent 10 seasons with the Cardinals and my final four with the St. Louis Rams.", "strong", "career-path"),
    batch4Clue("williams-eight-pb", "I was selected to eight Pro Bowls, seven at cornerback and one at safety.", "strong", "accomplishments"),
    batch4Clue("williams-55", "I finished with 55 career interceptions.", "strong", "production"),
    batch4Clue("williams-safety", "I successfully moved from cornerback to safety late in my career.", "helpful", "role"),
    batch4Clue("williams-hof", "I was elected to the Pro Football Hall of Fame in 2014.", "strong", "accomplishments"),
    batch4Clue("williams-rams-sb", "I helped the Rams reach Super Bowl XXXVI.", "strong", "accomplishments"),
    batch4Clue("williams-nine-pick-sixes", "I retired with nine interception-return touchdowns, then the second-most in NFL history.", "strong", "accomplishments"),
    batch4Clue("williams-all-decade", "I was named to the NFL's All-Decade Team of the 1990s.", "strong", "accomplishments"),
  ]],
  ["nfl-aqib-talib", [
    batch4Clue("talib-kansas", "I played college football at Kansas.", "helpful", "background"),
    batch4Clue("talib-20", "Tampa Bay selected me No. 20 overall in the 2008 NFL Draft.", "strong", "career-path"),
    batch4Clue("talib-path", "My NFL stops were Tampa Bay, New England, Denver and the Rams.", "strong", "career-path"),
    batch4Clue("talib-five-pb", "I was selected to five straight Pro Bowls from 2013 through 2017.", "strong", "accomplishments"),
    batch4Clue("talib-ap1", "I earned first-team All-Pro honors in 2016.", "strong", "accomplishments"),
    batch4Clue("talib-sb50", "I was part of Denver's 'No Fly Zone' secondary on the Super Bowl 50 champions.", "giveaway", "accomplishments", 8),
    batch4Clue("talib-pick-sixes", "I returned 10 interceptions for touchdowns during my NFL career.", "strong", "production"),
    batch4Clue("talib-21", "No. 21 became my signature jersey number.", "helpful", "identity"),
    batch4Clue("talib-press", "Physical press coverage and constant trash talk were hallmarks of my cornerback style.", "helpful", "style"),
  ]],
  ["nfl-asante-samuel", [
    batch4Clue("samuel-ucf", "I played college football at UCF.", "helpful", "background"),
    batch4Clue("samuel-120", "New England selected me in the fourth round, No. 120 overall, in the 2003 NFL Draft.", "strong", "career-path"),
    batch4Clue("samuel-path", "I played for the Patriots, Eagles and Falcons.", "strong", "career-path"),
    batch4Clue("samuel-two-rings", "I won Super Bowls XXXVIII and XXXIX with New England.", "giveaway", "accomplishments", 8),
    batch4Clue("samuel-ten-picks", "I tied for the NFL lead with 10 interceptions in 2006.", "strong", "accomplishments"),
    batch4Clue("samuel-four-pb", "I was selected to four Pro Bowls.", "strong", "accomplishments"),
    batch4Clue("samuel-51", "I finished my NFL career with 51 interceptions.", "strong", "production"),
    batch4Clue("samuel-ballhawk", "Reading route combinations and quarterback tendencies made ball-hawking anticipation central to my style.", "helpful", "style"),
  ]],
  ["brian-dawkins", [
    batch4Clue("dawkins-clemson", "I played college football at Clemson.", "helpful", "background"),
    batch4Clue("dawkins-61", "Philadelphia selected me No. 61 overall in the 1996 NFL Draft.", "helpful", "career-path"),
    batch4Clue("dawkins-eagles-broncos", "I spent 13 seasons with Philadelphia before finishing with three in Denver.", "strong", "career-path"),
    batch4Clue("dawkins-nine-pb", "I was selected to nine Pro Bowls.", "strong", "accomplishments"),
    batch4Clue("dawkins-weapon-x", "“Weapon X” became my signature alter ego and nickname.", "giveaway", "nickname", 8),
    batch4Clue("dawkins-20", "Philadelphia retired my No. 20.", "giveaway", "identity", 10),
    batch4Clue("dawkins-sb39", "I started at safety for Philadelphia in Super Bowl XXXIX.", "strong", "accomplishments"),
    batch4Clue("dawkins-hof", "I was elected to the Pro Football Hall of Fame in 2018.", "strong", "accomplishments"),
    batch4Clue("dawkins-five-ap", "I earned first-team All-Pro honors five times.", "strong", "accomplishments"),
    batch4Clue("dawkins-all-decade", "I was named to the NFL's All-Decade Team of the 2000s.", "strong", "accomplishments"),
  ]],
  ["champ-bailey", [
    batch4Clue("bailey-georgia", "I starred at Georgia on offense, defense and special teams.", "helpful", "background"),
    batch4Clue("bailey-seventh", "Washington selected me No. 7 overall in the 1999 NFL Draft.", "strong", "career-path"),
    batch4Clue("bailey-was-den", "I played five seasons in Washington before spending the rest of my career with Denver.", "strong", "career-path"),
    batch4Clue("bailey-portis", "A 2004 blockbuster trade sent me to Denver in a deal built around running back Clinton Portis.", "giveaway", "career-path", 9),
    batch4Clue("bailey-12-pb", "My 12 Pro Bowl selections are the most ever by a defensive back.", "strong", "accomplishments"),
    batch4Clue("bailey-2006", "I led the NFL with 10 interceptions in 2006.", "strong", "accomplishments"),
    batch4Clue("bailey-100", "I returned a playoff interception 100 yards against New England before being tackled at the 1-yard line.", "strong", "accomplishments"),
    batch4Clue("bailey-hof", "I was elected to the Pro Football Hall of Fame in 2019.", "strong", "accomplishments"),
    batch4Clue("bailey-24", "No. 24 became my signature NFL jersey number.", "helpful", "identity"),
  ]],
  ["nfl-charles-tillman", [
    batch4Clue("tillman-ull", "I played college football at Louisiana-Lafayette.", "helpful", "background"),
    batch4Clue("tillman-35", "Chicago selected me No. 35 overall in the 2003 NFL Draft.", "strong", "career-path"),
    batch4Clue("tillman-bears-panthers", "I spent 12 seasons with Chicago before finishing my career with Carolina.", "strong", "career-path"),
    batch4Clue("tillman-peanut-punch", "The ball-stripping technique associated with me became known league-wide as the 'Peanut Punch.'", "giveaway", "style", 8),
    batch4Clue("tillman-two-pb", "I was selected to two Pro Bowls.", "helpful", "accomplishments"),
    batch4Clue("tillman-42-ff", "I forced 42 fumbles during my career, including 10 in 2012.", "helpful", "production"),
    batch4Clue("tillman-sb41", "I started at cornerback for Chicago in Super Bowl XLI.", "strong", "accomplishments"),
    batch4Clue("tillman-def-td", "I set Bears records for defensive touchdowns and interception-return touchdowns.", "strong", "accomplishments"),
  ]],
  ["nfl-cliff-harris", [
    batch4Clue("harris-ouachita", "I played college football at Ouachita Baptist.", "helpful", "background"),
    batch4Clue("harris-cowboys-only", "I spent all 10 of my NFL seasons with the Dallas Cowboys.", "giveaway", "career-path", 10),
    batch4Clue("harris-two-rings", "I won Super Bowls VI and XII with Dallas.", "giveaway", "accomplishments", 8),
    batch4Clue("harris-six-pb", "I was selected to six Pro Bowls.", "helpful", "accomplishments"),
    batch4Clue("harris-hof", "I was elected to the Pro Football Hall of Fame in 2020.", "strong", "accomplishments"),
    batch4Clue("harris-crash", "“Captain Crash” captured my reputation as a collision-heavy free safety.", "giveaway", "nickname", 9),
  ]],
  ["nfl-darrell-green", [
    batch4Clue("green-tami", "I played college football at Texas A&I.", "helpful", "background"),
    batch4Clue("green-28-pick", "Washington selected me No. 28 overall in the 1983 NFL Draft.", "strong", "career-path"),
    batch4Clue("green-20", "I spent all 20 of my NFL seasons with Washington.", "giveaway", "career-path", 9),
    batch4Clue("green-speed", "Elite speed remained a defining trait throughout one of the longest cornerback careers in league history.", "helpful", "style"),
    batch4Clue("green-two-rings", "I won Super Bowls XXII and XXVI with Washington.", "giveaway", "accomplishments", 8),
    batch4Clue("green-seven-pb", "I was selected to seven Pro Bowls.", "strong", "accomplishments"),
    batch4Clue("green-54", "I finished with 54 career interceptions.", "strong", "production"),
    batch4Clue("green-hof", "I was elected to the Pro Football Hall of Fame in 2008.", "strong", "accomplishments"),
    batch4Clue("green-28", "No. 28 became my signature number in Washington.", "helpful", "identity"),
  ]],
  ["nfl-darrelle-revis", [
    batch4Clue("revis-island", "An island-themed nickname became shorthand for the isolation coverage I played against top receivers.", "giveaway", "nickname", 8),
    batch4Clue("revis-jets", "The New York Jets were the franchise most closely associated with my career.", "giveaway", "career-path", 10),
    batch4Clue("revis-seven-pb", "I was selected to seven Pro Bowls.", "strong", "accomplishments"),
    batch4Clue("revis-four-ap1", "I earned first-team All-Pro honors four times.", "strong", "accomplishments"),
    batch4Clue("revis-sb49", "I won Super Bowl XLIX during my one season with New England.", "giveaway", "accomplishments", 9),
    batch4Clue("revis-hof", "I was elected to the Pro Football Hall of Fame in 2023.", "strong", "accomplishments"),
    batch4Clue("revis-24", "No. 24 became my signature number with the Jets.", "helpful", "identity"),
  ]],
  ["nfl-darren-sharper", [
    batch4Clue("sharper-wm", "I played college football at William & Mary.", "helpful", "career-path"),
    batch4Clue("sharper-second", "Green Bay selected me in the second round of the 1997 NFL Draft.", "helpful", "career-path", 18),
    batch4Clue("sharper-path", "My NFL career included Green Bay, Minnesota and New Orleans.", "helpful", "career-path", 20),
    batch4Clue("sharper-five-pb", "I was selected to five Pro Bowls.", "strong", "accomplishments"),
    batch4Clue("sharper-sb44", "I won Super Bowl XLIV in my first season with New Orleans.", "giveaway", "accomplishments", 9),
    batch4Clue("sharper-qb-safety", "I arrived at college as a quarterback prospect before becoming a safety.", "helpful", "career-path"),
    batch4Clue("sharper-jamie", "My older brother Jamie was also an NFL player, and we were both selected in the second round of the 1997 NFL Draft.", "strong", "relationships"),
    batch4Clue("sharper-11-pick-sixes", "I returned 11 interceptions for touchdowns, second-most in NFL history when I retired.", "strong", "accomplishments"),
    batch4Clue("sharper-2009-return-record", "In 2009 I set an NFL single-season record with 376 interception-return yards.", "strong", "accomplishments"),
  ]],
  ["nfl-deangelo-hall", [
    batch4Clue("hall-vt", "I played college football at Virginia Tech.", "helpful", "career-path"),
    batch4Clue("hall-eighth", "Atlanta selected me No. 8 overall in the 2004 NFL Draft.", "strong", "career-path"),
    batch4Clue("hall-path", "I played for Atlanta, Oakland and Washington.", "helpful", "career-path"),
    batch4Clue("hall-three-pb", "I was selected to three Pro Bowls.", "strong", "accomplishments"),
    batch4Clue("hall-pro-bowl-mvp", "I was named MVP of the 2011 Pro Bowl.", "strong", "accomplishments", 16),
    batch4Clue("hall-four-int", "I tied an NFL single-game record with four interceptions against Chicago in 2010.", "giveaway", "accomplishments", 8),
    batch4Clue("hall-two-way-vt", "Virginia Tech used me at wide receiver as well as defensive back.", "helpful", "career-path"),
    batch4Clue("hall-safety", "Late in my career I moved from cornerback to safety.", "helpful", "career-path"),
    batch4Clue("hall-23", "No. 23 became my signature number in Washington.", "helpful", "identity"),
    batch4Clue("hall-pro-bowl-mvp", "I was named MVP of the 2011 Pro Bowl after recording an interception and returning a fumble for a touchdown.", "strong", "accomplishments"),
  ]],
  ["nfl-devin-mccourty", [
    batch4Clue("mccourty-rutgers", "I played college football at Rutgers.", "helpful", "background"),
    batch4Clue("mccourty-32", "New England selected me No. 32 overall in the 2010 NFL Draft.", "strong", "career-path"),
    batch4Clue("mccourty-pats-only", "I spent all 13 of my NFL seasons with the New England Patriots.", "giveaway", "career-path", 10),
    batch4Clue("mccourty-cb-s", "I entered the NFL at cornerback before becoming a long-term safety.", "helpful", "role"),
    batch4Clue("mccourty-three-rings", "I won three Super Bowls with New England.", "giveaway", "accomplishments", 8),
    batch4Clue("mccourty-four-pb", "I was selected to four Pro Bowls.", "strong", "accomplishments"),
    batch4Clue("mccourty-captain", "I served as a Patriots team captain for many seasons.", "strong", "role"),
    batch4Clue("mccourty-jason", "My twin brother Jason joined me in New England and won Super Bowl LIII with me.", "strong", "relationships"),
    batch4Clue("mccourty-seven-rookie-ints", "I intercepted seven passes as a rookie in 2010, the second-highest rookie total in Patriots history.", "strong", "accomplishments"),
    batch4Clue("mccourty-32", "No. 32 became my signature number in New England.", "helpful", "identity"),
  ]],
  ["nfl-dick-lebeau", [
    batch4Clue("lebeau-ohio-state", "I was part of Ohio State's 1957 national championship team.", "helpful", "background"),
    batch4Clue("lebeau-browns-cut", "Cleveland drafted me in 1959 but cut me before my rookie season.", "helpful", "career-path"),
    batch4Clue("lebeau-lions", "I then spent all 14 of my playing seasons with the Detroit Lions.", "giveaway", "career-path", 10),
    batch4Clue("lebeau-62", "I finished my playing career with 62 interceptions.", "helpful", "production"),
    batch4Clue("lebeau-zone-blitz", "As a coach, I became one of the figures most closely associated with the zone blitz.", "giveaway", "style", 8),
    batch4Clue("lebeau-steelers", "My coaching legacy is especially tied to Pittsburgh's defenses.", "giveaway", "career-path", 9),
    batch4Clue("lebeau-hof", "I was elected to the Pro Football Hall of Fame in 2010 for my playing career.", "strong", "accomplishments"),
  ]],
  ["nfl-donnie-shell", [
    batch4Clue("shell-scsu", "I played college football at South Carolina State.", "helpful", "background"),
    batch4Clue("shell-undrafted", "I joined Pittsburgh as an undrafted rookie in 1974.", "helpful", "career-path"),
    batch4Clue("shell-steelers-only", "I spent all 14 of my NFL seasons with the Pittsburgh Steelers.", "giveaway", "career-path", 10),
    batch4Clue("shell-four-rings", "I won four Super Bowls with Pittsburgh.", "giveaway", "accomplishments", 8),
    batch4Clue("shell-51", "I finished with 51 career interceptions.", "helpful", "production"),
    batch4Clue("shell-hof", "I was elected to the Pro Football Hall of Fame in 2020.", "strong", "accomplishments"),
  ]],
  ["nfl-dre-bly", [
    batch4Clue("bly-unc", "I played college football at North Carolina.", "helpful", "background"),
    batch4Clue("bly-rams", "The St. Louis Rams selected me in the second round of the 1999 NFL Draft.", "helpful", "career-path"),
    batch4Clue("bly-sb34", "I won Super Bowl XXXIV as a rookie with the Rams.", "giveaway", "accomplishments", 9),
    batch4Clue("bly-path", "My NFL stops included the Rams, Lions, Broncos and 49ers.", "strong", "career-path"),
    batch4Clue("bly-two-pb", "I was selected to two Pro Bowls while with Detroit.", "strong", "accomplishments"),
    batch4Clue("bly-43", "I finished with 43 career interceptions.", "helpful", "production"),
    batch4Clue("bly-rude-boys", "I coined 'Rude Boys' for North Carolina's defensive backs and later returned to coach that position group.", "strong", "identity"),
  ]],
  ["nfl-emmitt-thomas", [
    batch4Clue("emmitt-bishop", "I played college football at Bishop College.", "helpful", "background"),
    batch4Clue("emmitt-undrafted", "I joined Kansas City as an undrafted free agent in 1966.", "strong", "career-path"),
    batch4Clue("emmitt-chiefs-only", "I spent all 13 of my playing seasons with the Kansas City Chiefs.", "giveaway", "career-path", 10),
    batch4Clue("emmitt-58", "I finished with a Chiefs-record 58 career interceptions.", "strong", "production"),
    batch4Clue("emmitt-five-pb", "I was selected to five Pro Bowls.", "strong", "accomplishments"),
    batch4Clue("emmitt-sb4", "I intercepted a pass in Kansas City's Super Bowl IV victory.", "giveaway", "accomplishments", 8),
    batch4Clue("emmitt-18", "Kansas City retired my No. 18.", "giveaway", "identity", 9),
    batch4Clue("emmitt-hof", "I was elected to the Pro Football Hall of Fame in 2008.", "strong", "accomplishments"),
  ]],
  ["nfl-eric-allen", [
    batch4Clue("allen-asu", "I played college football at Arizona State.", "helpful", "background"),
    batch4Clue("allen-eagles", "Philadelphia selected me in the second round of the 1988 NFL Draft.", "helpful", "career-path"),
    batch4Clue("allen-path", "I played for the Eagles, Saints and Raiders.", "strong", "career-path"),
    batch4Clue("allen-six-pb", "I was selected to six Pro Bowls.", "helpful", "accomplishments"),
    batch4Clue("allen-54", "I finished with 54 career interceptions.", "strong", "production"),
    batch4Clue("allen-weather", "My playoff career was bookended by the Fog Bowl and the Tuck Rule game.", "giveaway", "career-path", 9),
    batch4Clue("allen-hof", "I was elected to the Pro Football Hall of Fame in 2025.", "strong", "accomplishments"),
  ]],
  ["andy-reid", [
    batch4Clue("reid-eagles-chiefs", "I became an NFL head coach with Philadelphia in 1999 and took over Kansas City in 2013.", "strong", "career-path"),
    batch4Clue("reid-current", "I entered the 2026 season as Kansas City's head coach.", "strong", "career-path"),
    batch4Clue("reid-three-rings", "I have won three Super Bowls as Kansas City's head coach: LIV, LVII and LVIII.", "giveaway", "accomplishments", 8),
    batch4Clue("reid-eagles-sb", "I also led Philadelphia to Super Bowl XXXIX.", "strong", "accomplishments"),
    batch4Clue("reid-byu", "I played offensive line at BYU before beginning my coaching career.", "helpful", "background"),
    batch4Clue("reid-favre", "Before becoming a head coach, I coached Brett Favre as Green Bay's quarterbacks coach.", "strong", "career-path"),
    batch4Clue("reid-four-nfc", "I led Philadelphia to four consecutive NFC Championship Games from 2001 through 2004.", "strong", "accomplishments"),
    batch4Clue("reid-sb31-staff", "I was an assistant on Green Bay's Super Bowl XXXI championship staff.", "helpful", "career-path"),
  ]],
  ["bill-belichick", [
    batch4Clue("belichick-browns-pats", "My NFL head-coaching stops were Cleveland and New England.", "strong", "career-path"),
    batch4Clue("belichick-six", "I won six Super Bowls as New England's head coach.", "giveaway", "accomplishments", 8),
    batch4Clue("belichick-giants-dc", "Before my head-coaching success, I coordinated the Giants defense for two Super Bowl champions.", "strong", "career-path"),
    batch4Clue("belichick-pats-24", "I spent 24 seasons as the Patriots' head coach.", "giveaway", "career-path", 9),
    batch4Clue("belichick-colts-entry", "My NFL coaching career began at the bottom of the Baltimore Colts staff in 1975.", "helpful", "career-path"),
    batch4Clue("belichick-three-coy", "I won AP NFL Coach of the Year three times.", "strong", "accomplishments"),
    batch4Clue("belichick-sb25-plan", "My defensive game plan from the Giants' Super Bowl XXV win is preserved in the Pro Football Hall of Fame.", "strong", "accomplishments"),
  ]],
  ["bill-parcells", [
    batch4Clue("parcells-four-teams", "I was head coach of the Giants, Patriots, Jets and Cowboys.", "strong", "career-path"),
    batch4Clue("parcells-two-rings", "I won Super Bowls XXI and XXV with the New York Giants.", "giveaway", "accomplishments", 8),
    batch4Clue("parcells-tuna", "“The Big Tuna” became my enduring nickname.", "giveaway", "nickname", 9),
    batch4Clue("parcells-drafted", "Detroit drafted me as a linebacker in 1964, but I never played an NFL regular-season game.", "helpful", "career-path"),
    batch4Clue("parcells-belichick", "Bill Belichick served as my defensive coordinator on both Giants Super Bowl champions.", "strong", "relationships"),
    batch4Clue("parcells-hof", "I was elected to the Pro Football Hall of Fame in 2013.", "strong", "accomplishments"),
    batch4Clue("parcells-three-sb", "I led two different franchises to the Super Bowl as a head coach.", "strong", "accomplishments"),
    batch4Clue("parcells-two-coy", "I was AP NFL Coach of the Year in 1986 with the Giants and 1994 with the Patriots.", "strong", "accomplishments"),
    batch4Clue("parcells-pats-sb31", "I later took New England to Super Bowl XXXI.", "helpful", "career-path"),
  ]],
  ["bill-walsh", [
    batch4Clue("walsh-49ers", "San Francisco was my only NFL head-coaching job.", "strong", "career-path", 12),
    batch4Clue("walsh-three-rings", "I won Super Bowls XVI, XIX and XXIII with the 49ers.", "giveaway", "accomplishments", 8),
    batch4Clue("walsh-west-coast", "The passing system associated with me became known as the West Coast offense.", "giveaway", "style", 9),
    batch4Clue("walsh-montana", "Joe Montana became the quarterback most closely associated with my offense in San Francisco.", "helpful", "career-path"),
    batch4Clue("walsh-hof", "I was elected to the Pro Football Hall of Fame in 1993.", "strong", "accomplishments"),
    batch4Clue("walsh-montana-draft", "I selected Joe Montana in the third round of the 1979 NFL Draft.", "strong", "career-path"),
    batch4Clue("walsh-two-coy", "I was AP NFL Coach of the Year in 1981 and 1984.", "helpful", "accomplishments"),
  ]],
  ["chuck-noll", [
    batch4Clue("noll-steelers-only", "Pittsburgh was my only NFL head-coaching job.", "giveaway", "career-path", 10),
    batch4Clue("noll-four", "I became the first head coach to win four Super Bowls.", "giveaway", "accomplishments", 8),
    batch4Clue("noll-74-class", "My 1974 Steelers rookie class produced four drafted Hall of Famers, plus undrafted Donnie Shell.", "strong", "accomplishments"),
    batch4Clue("noll-emperor", "Players called me 'The Emperor' because of my reserved, authoritative style.", "strong", "nickname"),
    batch4Clue("noll-hof", "I was elected to the Pro Football Hall of Fame in 1993.", "strong", "accomplishments"),
    batch4Clue("noll-69", "I took over Pittsburgh in 1969 and remained head coach through 1991.", "helpful", "career-path"),
    batch4Clue("noll-browns-player", "Before coaching, I played seven NFL seasons with the Cleveland Browns.", "helpful", "career-path"),
    batch4Clue("noll-colts-dc", "Before Pittsburgh hired me, I coordinated Baltimore's defense under Don Shula.", "strong", "career-path"),
  ]],
  ["don-shula", [
    batch4Clue("shula-colts-dolphins", "I was head coach of the Baltimore Colts before spending 26 seasons with the Miami Dolphins.", "helpful", "career-path"),
    batch4Clue("shula-347", "I retired with an NFL-record 347 total head-coaching victories.", "strong", "accomplishments", 14),
    batch4Clue("shula-perfect", "I coached the 1972 Dolphins to the NFL's only perfect season.", "giveaway", "accomplishments", 8),
    batch4Clue("shula-two-rings", "I won back-to-back Super Bowls VII and VIII with Miami.", "giveaway", "accomplishments", 8),
    batch4Clue("shula-six-sb", "I coached in six Super Bowls across Baltimore and Miami.", "strong", "accomplishments"),
    batch4Clue("shula-hof", "I was elected to the Pro Football Hall of Fame in 1997.", "strong", "accomplishments"),
    batch4Clue("shula-sb3", "Before Miami, I led Baltimore to Super Bowl III.", "helpful", "career-path"),
  ]],
  ["nfl-earl-curly-lambeau", [
    batch4Clue("lambeau-founder", "I helped found the Green Bay Packers and served as player, captain and coach in the club's early years.", "giveaway", "career-path", 9),
    batch4Clue("lambeau-packing", "My job at the Indian Packing Company helped supply the team name 'Packers.'", "giveaway", "identity", 8),
    batch4Clue("lambeau-six", "I coached Green Bay to six NFL championships.", "giveaway", "accomplishments", 8),
    batch4Clue("lambeau-field", "Green Bay's home stadium carries my surname.", "giveaway", "identity", 7),
    batch4Clue("lambeau-pass", "I was an early pro-football advocate of using the forward pass as a core offensive weapon.", "strong", "style"),
    batch4Clue("lambeau-hof", "I was a charter member of the Pro Football Hall of Fame's 1963 class.", "strong", "accomplishments"),
    batch4Clue("lambeau-notre-dame", "I briefly played at Notre Dame under Knute Rockne before returning home to Green Bay.", "helpful", "background"),
    batch4Clue("lambeau-after-green-bay", "After leaving Green Bay, I later coached the Chicago Cardinals and Washington.", "strong", "career-path"),
  ]],
  ["nfl-george-halas", [
    batch4Clue("halas-staleys-bears", "I took charge of the Decatur Staleys and developed that club into the Chicago Bears.", "giveaway", "career-path", 9),
    batch4Clue("halas-founder", "I participated in the meetings that created the league that became the NFL.", "strong", "accomplishments"),
    batch4Clue("halas-six", "I won six NFL championships as Chicago's head coach.", "giveaway", "accomplishments", 8),
    batch4Clue("halas-324", "I won 324 games as a professional head coach.", "helpful", "production"),
    batch4Clue("halas-papa-bear", "“Papa Bear” became a signature nickname for me.", "giveaway", "nickname", 9),
    batch4Clue("halas-trophy", "The NFC championship trophy is named in my honor.", "giveaway", "accomplishments", 8),
    batch4Clue("halas-hof", "I was a charter member of the Pro Football Hall of Fame's 1963 class.", "strong", "accomplishments"),
  ]],
  ["nfl-jimmy-johnson-coach", [
    batch4Clue("jimmy-arkansas", "I played on Arkansas' 1964 national championship team alongside future Cowboys owner Jerry Jones.", "helpful", "background"),
    batch4Clue("jimmy-miami", "Before the NFL, I coached Miami to the 1987 college national championship.", "helpful", "career-path"),
    batch4Clue("jimmy-cowboys", "I replaced Tom Landry as Dallas head coach in 1989.", "giveaway", "career-path", 9),
    batch4Clue("jimmy-two-rings", "I won consecutive Super Bowls XXVII and XXVIII with the Cowboys.", "giveaway", "accomplishments", 8),
    batch4Clue("jimmy-walker", "The Herschel Walker trade supplied a huge draft-pick haul that fueled my Dallas rebuild.", "giveaway", "career-path", 9),
    batch4Clue("jimmy-dolphins", "I later returned to the NFL as head coach of the Miami Dolphins.", "strong", "career-path"),
    batch4Clue("jimmy-hof", "I was elected to the Pro Football Hall of Fame in 2020.", "strong", "accomplishments"),
    batch4Clue("jimmy-first-both", "I became the first coach to win a college national championship and then lead an NFL team to a Super Bowl victory.", "strong", "accomplishments"),
    batch4Clue("jimmy-turnaround", "My first Dallas team went 1-15; three seasons later I coached the Cowboys to the first of back-to-back Super Bowl wins.", "strong", "accomplishments"),
    batch4Clue("jimmy-how-bout", "“How ’bout them Cowboys!” became a signature line after my first NFC Championship Game victory with Dallas.", "giveaway", "identity", 9),
  ]],
  ["joe-gibbs", [
    batch4Clue("gibbs-washington", "Both of my NFL head-coaching stints came with Washington.", "giveaway", "career-path", 10),
    batch4Clue("gibbs-three-rings", "I won three Super Bowls with three different starting quarterbacks.", "giveaway", "accomplishments", 8),
    batch4Clue("gibbs-qbs", "Joe Theismann, Doug Williams and Mark Rypien each quarterbacked one of my Super Bowl champions.", "strong", "relationships", 14),
    batch4Clue("gibbs-hogs", "My championship teams became closely associated with the offensive line nicknamed 'The Hogs.'", "strong", "style", 14),
    batch4Clue("gibbs-nascar", "Between my two NFL coaching stints, I built a championship NASCAR organization that carried my name.", "helpful", "career-path", 18),
    batch4Clue("gibbs-hof", "I was elected to the Pro Football Hall of Fame in 1996.", "strong", "accomplishments"),
    batch4Clue("gibbs-four-sb", "I led Washington to four Super Bowl appearances, winning three.", "strong", "accomplishments"),
    batch4Clue("gibbs-two-stints", "I coached Washington from 1981 through 1992, then returned for a second stint from 2004 through 2007.", "helpful", "career-path"),
    batch4Clue("gibbs-counter", "The counter-trey running concept became a signature part of my Washington offense.", "helpful", "style"),
  ]],
  ["nfl-john-madden", [
    batch4Clue("madden-raiders", "The Raiders were my only NFL head-coaching team.", "giveaway", "career-path", 10),
    batch4Clue("madden-sb11", "I coached Oakland to victory in Super Bowl XI.", "giveaway", "accomplishments", 8),
    batch4Clue("madden-record", "My NFL regular-season coaching record was 103-32-7.", "helpful", "production"),
    batch4Clue("madden-no-losing", "I never had a losing season as an NFL head coach.", "strong", "accomplishments"),
    batch4Clue("madden-broadcast", "After coaching, I became one of football's most recognizable television analysts.", "helpful", "career-path"),
    batch4Clue("madden-game", "My name became the title of a long-running football video-game franchise.", "giveaway", "identity", 7),
    batch4Clue("madden-hof", "I was elected to the Pro Football Hall of Fame in 2006.", "strong", "accomplishments"),
  ]],
  ["paul-brown", [
    batch4Clue("brown-browns-name", "The Cleveland Browns franchise was named after me.", "giveaway", "identity", 7),
    batch4Clue("brown-bengals", "I later co-founded the Cincinnati Bengals and served as their first head coach.", "giveaway", "career-path", 8),
    batch4Clue("brown-eight-titles", "I won eight league championships as a professional head coach.", "strong", "accomplishments"),
    batch4Clue("brown-film", "I helped make film study, classroom teaching and systematic player grading standard parts of pro coaching.", "helpful", "style"),
    batch4Clue("brown-radio", "My staff experimented with radio communication inside a quarterback's helmet decades before it became standard.", "helpful", "identity"),
    batch4Clue("brown-hof", "I was elected to the Pro Football Hall of Fame in 1967.", "strong", "accomplishments"),
    batch4Clue("brown-dynasty", "My Cleveland teams won four AAFC titles and three NFL championships.", "strong", "accomplishments"),
  ]],
  ["pete-carroll", [
    batch4Clue("carroll-jets-pats", "My first two NFL head-coaching jobs were with the Jets and Patriots in the 1990s.", "helpful", "career-path"),
    batch4Clue("carroll-usc", "I returned to the NFL after a championship run as USC's head coach.", "helpful", "career-path"),
    batch4Clue("carroll-seahawks", "I coached Seattle from 2010 through 2023.", "giveaway", "career-path", 10),
    batch4Clue("carroll-sb48", "I coached Seattle to a 43-8 victory in Super Bowl XLVIII.", "giveaway", "accomplishments", 8),
    batch4Clue("carroll-legion", "The 'Legion of Boom' secondary became the signature unit of my championship Seahawks.", "giveaway", "style", 9),
    batch4Clue("carroll-raiders", "I returned for one season as the Las Vegas Raiders' head coach in 2025.", "strong", "career-path"),
    batch4Clue("carroll-compete", "“Always Compete” became a central phrase in my coaching philosophy.", "strong", "identity"),
  ]],
  ["tom-landry", [
    batch4Clue("landry-original", "I was the first head coach in Dallas Cowboys history.", "giveaway", "career-path", 9),
    batch4Clue("landry-29", "I remained the Cowboys' head coach for 29 seasons.", "giveaway", "career-path", 9),
    batch4Clue("landry-two-rings", "I won Super Bowls VI and XII with Dallas.", "giveaway", "accomplishments", 8),
    batch4Clue("landry-flex", "The flex defense became one of the schemes most closely associated with me.", "helpful", "style"),
    batch4Clue("landry-fedora", "A fedora became my trademark sideline look.", "giveaway", "identity", 9),
    batch4Clue("landry-winning", "My Cowboys posted 20 consecutive winning seasons from 1966 through 1985.", "strong", "accomplishments"),
    batch4Clue("landry-hof", "I was elected to the Pro Football Hall of Fame in 1990.", "strong", "accomplishments"),
    batch4Clue("landry-giants-dc", "Before Dallas existed, I served as the Giants’ defensive coordinator while Vince Lombardi ran the offense.", "helpful", "career-path"),
  ]],
  ["vince-lombardi", [
    batch4Clue("lombardi-packers", "Green Bay hired me for my first NFL head-coaching job in 1959.", "strong", "career-path"),
    batch4Clue("lombardi-five", "I coached the Packers to five NFL championships in seven seasons.", "giveaway", "accomplishments", 8),
    batch4Clue("lombardi-first-two", "My teams won the first two Super Bowls.", "giveaway", "accomplishments", 7),
    batch4Clue("lombardi-trophy", "The trophy presented to the Super Bowl champion bears my surname.", "giveaway", "identity", 6),
    batch4Clue("lombardi-washington", "I finished my head-coaching career with one season in Washington.", "strong", "career-path"),
    batch4Clue("lombardi-hof", "I was elected to the Pro Football Hall of Fame in 1971.", "strong", "accomplishments"),
    batch4Clue("lombardi-no-losing", "I never had a losing season as an NFL head coach.", "strong", "accomplishments"),
    batch4Clue("lombardi-giants", "Before Green Bay, I coordinated the Giants offense while Tom Landry coordinated the defense.", "strong", "career-path"),
    batch4Clue("lombardi-sweep", "The Packers sweep became the signature running play of my Green Bay teams.", "strong", "style"),
  ]],
  ["bill-cowher", [
    batch4Clue("cowher-steelers", "Pittsburgh was my only NFL head-coaching job.", "strong", "career-path", 12),
    batch4Clue("cowher-1992", "I succeeded Chuck Noll as Steelers head coach in 1992.", "helpful", "career-path", 14),
    batch4Clue("cowher-two-sb", "I led Pittsburgh to Super Bowls XXX and XL.", "strong", "accomplishments"),
    batch4Clue("cowher-sb40", "I won Super Bowl XL with the Steelers.", "giveaway", "accomplishments", 8),
    batch4Clue("cowher-chin", "My intense sideline style and jutting jaw produced the nickname 'The Chin.'", "giveaway", "nickname", 9),
    batch4Clue("cowher-hof", "I was elected to the Pro Football Hall of Fame in 2020.", "strong", "accomplishments"),
    batch4Clue("cowher-15", "I coached Pittsburgh for 15 seasons, from 1992 through 2006.", "helpful", "career-path"),
    batch4Clue("cowher-first-six", "I took Pittsburgh to the playoffs in each of my first six seasons as head coach.", "strong", "accomplishments"),
  ]],
  ["nfl-bud-grant", [
    batch4Clue("grant-vikings", "Minnesota was my only NFL head-coaching job.", "giveaway", "career-path", 10),
    batch4Clue("grant-four-sb", "I coached the Vikings to four Super Bowl appearances.", "giveaway", "accomplishments", 8),
    batch4Clue("grant-nba", "Before my football career fully took off, I played in the NBA and won a championship with the Minneapolis Lakers.", "giveaway", "career-path", 9),
    batch4Clue("grant-winnipeg", "I became a championship head coach with the Winnipeg Blue Bombers before taking over the Vikings.", "helpful", "career-path"),
    batch4Clue("grant-cold", "I discouraged sideline heaters and extra cold-weather gear, treating Minnesota's climate as an advantage.", "helpful", "style"),
    batch4Clue("grant-hof", "I was elected to the Pro Football Hall of Fame in 1994.", "strong", "accomplishments"),
    batch4Clue("grant-grey-cups", "Before Minnesota, I won four Grey Cups as Winnipeg’s head coach.", "strong", "accomplishments"),
    batch4Clue("grant-return", "I retired after the 1983 season, then returned to coach Minnesota for one more season in 1985.", "strong", "career-path"),
  ]],
  ["dick-vermeil", [
    batch4Clue("vermeil-three", "I was an NFL head coach for Philadelphia, the St. Louis Rams and Kansas City.", "strong", "career-path"),
    batch4Clue("vermeil-papale", "An Eagles open tryout during my first season gave Vince Papale the opportunity later dramatized in Invincible.", "giveaway", "career-path", 9),
    batch4Clue("vermeil-break", "I left coaching for roughly 15 years after burnout before returning with the Rams.", "helpful", "career-path"),
    batch4Clue("vermeil-sb34", "I coached the St. Louis Rams to victory in Super Bowl XXXIV.", "giveaway", "accomplishments", 8),
    batch4Clue("vermeil-greatest-show", "My Rams championship team became known as the 'Greatest Show on Turf.'", "giveaway", "style", 9),
    batch4Clue("vermeil-hof", "I was elected to the Pro Football Hall of Fame in 2022.", "strong", "accomplishments"),
    batch4Clue("vermeil-rose", "Before the Eagles hired me, I coached UCLA to an upset victory over top-ranked Ohio State in the 1976 Rose Bowl.", "helpful", "career-path"),
    batch4Clue("vermeil-sb15", "I led Philadelphia to Super Bowl XV.", "strong", "accomplishments"),
  ]],
  ["nfl-don-coryell", [
    batch4Clue("coryell-cardinals-chargers", "My NFL head-coaching jobs were with the Cardinals and Chargers.", "strong", "career-path"),
    batch4Clue("coryell-air", "My Chargers’ aggressive vertical passing system became famous under an “Air” nickname built around my surname.", "giveaway", "style", 8),
    batch4Clue("coryell-fouts", "Dan Fouts was the quarterback most closely associated with my San Diego offense.", "strong", "relationships"),
    batch4Clue("coryell-winslow", "I helped turn tight end Kellen Winslow into a movable receiving mismatch.", "strong", "style"),
    batch4Clue("coryell-madden-gibbs", "My San Diego State staffs included future Hall of Fame coaches John Madden and Joe Gibbs.", "giveaway", "relationships", 9),
    batch4Clue("coryell-hof", "I was elected to the Pro Football Hall of Fame in 2023.", "strong", "accomplishments"),
    batch4Clue("coryell-sdsu", "Before the NFL, I built San Diego State into a major passing program and won more than 100 games there.", "strong", "career-path"),
    batch4Clue("coryell-cardinals-title", "In 1974 I led St. Louis to its first 10-win season since 1948 and won NFL Coach of the Year.", "strong", "accomplishments"),
  ]],
  ["nfl-george-allen", [
    batch4Clue("allen-rams-washington", "My NFL head-coaching stops were the Rams and Washington.", "helpful", "career-path"),
    batch4Clue("allen-future-now", "My veteran-heavy roster building became associated with the phrase 'The future is now.'", "giveaway", "identity", 9),
    batch4Clue("allen-over-hill", "My veteran-heavy Washington teams were nicknamed the 'Over-the-Hill Gang.'", "giveaway", "nickname", 9),
    batch4Clue("allen-sb7", "I coached Washington to Super Bowl VII.", "strong", "accomplishments"),
    batch4Clue("allen-special-teams", "I created the NFL's first full-time special-teams coaching position and hired Dick Vermeil for it.", "helpful", "career-path"),
    batch4Clue("allen-hof", "I was elected to the Pro Football Hall of Fame in 2002.", "strong", "accomplishments"),
    batch4Clue("allen-no-losing", "I never had a losing season in 12 years as an NFL head coach.", "strong", "accomplishments"),
  ]],
]);

function batch4ShouldSuppress(subject: FootballSubjectProfile, clue: WhoAmIClue) {
  if (
    clue.id === "player-career-start"
    || clue.id === "player-career-end"
    || clue.id === "coach-start"
    || clue.id === "coach-end"
    || clue.id === "career-span"
    || clue.id === "coach-affiliation-count"
    || clue.id === "career-path"
    || clue.id.startsWith("affiliation:")
  ) return true;

  if (clue.id.startsWith("fact:nfl-coach-")) return true;
  if (batch4PartialCareerCoverageSubjectIds.has(subject.id) && /^fact:nfl-career-/.test(clue.id)) return true;
  if (batch4Active2026SubjectIds.has(subject.id) && /^fact:nfl-(?:career|coach)-/.test(clue.id)) return true;
  if (
    clue.id === "fact:nfl-career-games"
    || clue.id === "fact:nfl-career-solo-tackles"
    || clue.id === "fact:nfl-career-tackles-for-loss"
    || clue.id === "fact:nfl-career-forced-fumbles"
    || clue.id === "fact:nfl-career-sacks"
    || clue.id === "fact:nfl-career-passes-defended"
  ) return true;
  return false;
}

function batch4ApplyOverrides(subject: FootballSubjectProfile, clue: WhoAmIClue): WhoAmIClue {
  if (
    subject.id === "nfl-harry-carson"
    && clue.conceptId === "identity:harry-carson-college-line-to-middle-linebacker"
  ) {
    return { ...clue, band: "helpful", facet: "career-path", revealPriority: 18 };
  }
  if (
    subject.id === "nfl-harry-carson"
    && clue.conceptId === "identity:harry-carson-gatorade-shower"
  ) {
    return { ...clue, band: "strong", facet: "identity", revealPriority: 16 };
  }
  if (
    subject.id === "nfl-harry-carson"
    && clue.conceptId === "identity:harry-carson-parcells-team-conduit"
  ) {
    return { ...clue, band: "strong", facet: "role", revealPriority: 18 };
  }
  if (
    subject.id === "nfl-darren-sharper"
    && clue.conceptId === "identity:darren-sharper-scout-wakeup-call"
  ) {
    return { ...clue, band: "helpful", facet: "career-path", revealPriority: 20 };
  }
  if (
    subject.id === "bill-cowher"
    && clue.conceptId === "identity:super-bowl-onside-kick-gamble"
  ) {
    return { ...clue, band: "strong", facet: "accomplishments", revealPriority: 16 };
  }
  if (subject.id === "pete-carroll" && clue.id === "era") {
    return { ...clue, text: "I was an NFL head coach in the 1990s, 2010s and 2020s." };
  }
  if (subject.id === "dick-vermeil" && clue.id === "era") {
    return { ...clue, text: "My NFL head-coaching career stretched across the 1970s, 1980s, 1990s and 2000s." };
  }
  if (subject.id === "bill-belichick" && clue.id === "era") {
    return { ...clue, text: "I was an NFL head coach in the 1990s, 2000s, 2010s and 2020s." };
  }
  return clue;
}

const batch4FocusedPoolIds = new Map<string, ReadonlySet<string>>([
  ["nfl-harry-carson", new Set([
    "position",
    "era",
    "curated4:carson-scsu",
    "curated4:carson-fourth-round",
    "curated4:carson-giants-only",
    "curated4:carson-53",
    "identity:pr7-harry-carson-college-line-to-middle-linebacker",
    "curated4:carson-lt-banks",
    "curated4:carson-hof",
    "identity:resume-nfl-harry-carson-03",
    "identity:pr7-harry-carson-gatorade-shower",
    "identity:pr7-harry-carson-parcells-team-conduit",
    "identity:resume-nfl-harry-carson-04",
  ])],
  ["nfl-darren-sharper", new Set([
    "position",
    "era",
    "curated4:sharper-wm",
    "curated4:sharper-second",
    "curated4:sharper-path",
    "curated4:sharper-qb-safety",
    "identity:pr7-darren-sharper-scout-wakeup-call",
    "curated4:sharper-five-pb",
    "curated4:sharper-11-pick-sixes",
    "curated4:sharper-2009-return-record",
    "curated4:sharper-jamie",
    "identity:pr7-darren-sharper-mike-tomlin-college-relationship",
    "curated4:sharper-sb44",
  ])],
  ["nfl-deangelo-hall", new Set([
    "position",
    "era",
    "curated4:hall-vt",
    "curated4:hall-path",
    "curated4:hall-two-way-vt",
    "curated4:hall-safety",
    "curated4:hall-23",
    "curated4:hall-eighth",
    "curated4:hall-three-pb",
    "curated4:hall-pro-bowl-mvp",
    "identity:pr7-deangelo-hall-green-sanders-role-models",
    "identity:pr7-deangelo-hall-shanahan-practice-reset",
    "curated4:hall-four-int",
  ])],
]);

function trimNflBatch4Pool(subject: FootballSubjectProfile, clues: readonly WhoAmIClue[]) {
  const target = 16;
  if (clues.length <= target) return [...clues];
  const ranked = clues
    .map((clue, index) => ({ clue, index, score: clueQualityScore(subject, clue) }))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  const selected = new Set(ranked.slice(0, target).map((entry) => entry.clue.id));
  return clues.filter((clue) => selected.has(clue.id));
}

function curateNflBatch4Clues(subject: FootballSubjectProfile, rawClues: readonly WhoAmIClue[]) {
  const retained = batch4RetainedIdentityConcepts.get(subject.id);
  let colorUsed = false;
  const curated: WhoAmIClue[] = [];

  for (const rawClue of rawClues) {
    if (batch4ShouldSuppress(subject, rawClue)) continue;
    if (
      rawClue.identityKnowledge
      && retained
      && !retained.has(rawClue.conceptId ?? "")
      && !retained.has(rawClue.id)
    ) continue;

    const clue = batch4ApplyOverrides(subject, rawClue);
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

  curated.push(...(batch4SupplementalClues.get(subject.id) ?? []));
  const focusedPool = batch4FocusedPoolIds.get(subject.id);
  if (focusedPool) return curated.filter((clue) => focusedPool.has(clue.id));
  return trimNflBatch4Pool(subject, curated);
}

export function isNflWhoAmIBatch4Subject(subjectId: string) {
  return batch4SubjectIds.has(subjectId);
}


/**
 * CFB Who Am I calibration batch 1 (launch-order subjects 1-50).
 *
 * College identity stays stage-owned: school/transfer path, college awards,
 * championships, signature seasons and draft transition may identify the
 * player, while NFL-stage résumé and deep biography are intentionally excluded.
 */
export const CFB_WHO_AM_I_BATCH_1_SUBJECT_IDS = [
  "cfb-cam-newton",
  "cfb-davey-obrien",
  "cfb-doug-flutie",
  "cfb-jim-plunkett",
  "cfb-joe-burrow",
  "cfb-johnny-manziel",
  "cfb-lamar-jackson",
  "cfb-matt-leinart",
  "cfb-paul-hornung",
  "cfb-roger-staubach",
  "cfb-tim-tebow",
  "cfb-vince-young",
  "cfb-andre-ware",
  "cfb-andrew-luck",
  "cfb-baker-mayfield",
  "cfb-brady-quinn",
  "cfb-bryce-young",
  "cfb-c-j-stroud",
  "cfb-caleb-williams",
  "cfb-carson-palmer",
  "cfb-charlie-ward",
  "cfb-chris-weinke",
  "cfb-colt-brennan",
  "cfb-colt-mccoy",
  "cfb-dak-prescott",
  "cfb-danny-wuerffel",
  "cfb-deshaun-watson",
  "cfb-drew-brees",
  "cfb-eli-manning",
  "cfb-eric-crouch",
  "cfb-fernando-mendoza",
  "cfb-adrian-peterson",
  "cfb-archie-griffin",
  "cfb-barry-sanders",
  "cfb-billy-cannon",
  "cfb-billy-sims",
  "cfb-bo-jackson",
  "cfb-darren-mcfadden",
  "cfb-derrick-henry",
  "cfb-doak-walker",
  "cfb-earl-campbell",
  "cfb-ernie-davis",
  "cfb-herschel-walker",
  "cfb-marcus-allen",
  "cfb-o-j-simpson",
  "cfb-reggie-bush",
  "cfb-ricky-williams",
  "cfb-tony-dorsett",
  "cfb-ashton-jeanty",
  "cfb-bijan-robinson",
] as const;

const cfbBatch1SubjectIds = new Set<string>(CFB_WHO_AM_I_BATCH_1_SUBJECT_IDS);
const cfbBatch1StructuralClueIds = new Set([
  "player-career-start",
  "player-career-end",
  "career-span",
]);

const cfbBatch1SpecificHeismanSubjectIds = new Set<string>([
  "cfb-cam-newton",
  "cfb-joe-burrow",
  "cfb-baker-mayfield",
  "cfb-bryce-young",
  "cfb-caleb-williams",
  "cfb-doug-flutie",
  "cfb-jim-plunkett",
  "cfb-johnny-manziel",
  "cfb-lamar-jackson",
  "cfb-matt-leinart",
  "cfb-roger-staubach",
  "cfb-tim-tebow",
  "cfb-carson-palmer",
  "cfb-charlie-ward",
  "cfb-chris-weinke",
  "cfb-danny-wuerffel",
  "cfb-eric-crouch",
  "cfb-archie-griffin",
  "cfb-derrick-henry",
  "cfb-earl-campbell",
  "cfb-ernie-davis",
  "cfb-herschel-walker",
  "cfb-marcus-allen",
  "cfb-o-j-simpson",
  "cfb-reggie-bush",
  "cfb-ricky-williams",
  "cfb-tony-dorsett",
]);


const cfbBatch1SuppressedIdentityConcepts = new Set([
  "identity:cfb-andrew-luck--high-school-valedictorian",
  "identity:cfb-andrew-luck--architectural-design-major",
  "identity:cfb-andrew-luck--academic-father-son-hall",
  "identity:architecture-degree-designed-home",
  "identity:cfb-davey-obrien--gaston-avenue-bulldogs",
  "identity:cfb-davey-obrien--left-nfl-for-fbi",
  "identity:nfl-draft-1939",
  "identity:cfb-baker-mayfield--texas-tech-walk-on",
  "identity:cfb-baker-mayfield--transferred-and-walked-on-oklahoma",
  "identity:cfb-barry-sanders--roofing-with-father",
  "identity:hall-of-fame-father-introduction",
  "identity:father-third-best-introduction",
  "identity:cfb-billy-cannon--halloween-run",
  "identity:cfb-billy-cannon--dentistry-during-pro-career",
  "identity:cfb-billy-cannon--counterfeiting-conviction",
  "identity:cfb-bijan-robinson--raised-with-grandfather-cleo",
  "identity:cfb-bijan-robinson--grandfather-pac12-official",
  "identity:cfb-bijan-robinson--childhood-near-drowning-swim-safety",
  "identity:cfb-bijan-robinson--bijan-mustardson",
  "identity:grandfather-referee-father-figure",
  "identity:cfb-brady-quinn--middle-school-notre-dame-visits",
  "identity:cfb-brady-quinn--finance-political-science-double-major",
  "identity:cfb-brady-quinn--law-school-aspiration",
  "identity:cfb-c-j-stroud--youngest-of-four-competitive-siblings",
  "identity:cfbfast-r-player-4432577-c-j-stroud--youngest-of-four-competitive-siblings",
  "identity:cfbfast-r-player-4432577-c-j-stroud--rancho-cucamonga-state-semifinal-run",
  "identity:cfb-caleb-williams--followed-lincoln-riley-to-usc",
  "identity:cfb-carson-palmer--troy-nickname-after-ucla-qb",
  "identity:cfb-charlie-ward--thomasville-near-tallahassee",
  "identity:cfb-charlie-ward--chose-nba-after-nfl-draft-uncertainty",
  "identity:cfb-colt-brennan--worcester-academy-merit-scholarship",
  "identity:cfb-colt-mccoy--peru-mission-work",
  "identity:cfb-danny-wuerffel--desire-street-ministries",
  "identity:cfb-deshaun-watson--815-gainesville-roots",
  "identity:cfb-deshaun-watson--habitat-warrick-dunn-home",
  "identity:cfb-drew-brees--industrial-management-business-expectation",
  "identity:tom-house-throwing-rebuild",
  "identity:katrina-lakeview-calling",
  "identity:cfb-fernando-mendoza--fourth-grade-nearly-quit",
  "identity:cfb-fernando-mendoza--cal-degree-three-years",
  "identity:cfb-fernando-mendoza--cuban-family-service-trip",
  "identity:cfb-joe-burrow--basketball-point-guard",
  "identity:cfb-joe-burrow--lost-osu-job-then-lsu-transfer",
  "identity:cfb-joe-burrow--destroyed-second-place-trophy",
  "identity:cfb-roger-staubach--volunteered-for-vietnam",
  "identity:raked-leaves-turning-point",
  "identity:cfb-vince-young--raked-leaves-turning-point",
  "identity:cfb-vince-young--rose-bowl-fourth-and-five",
  "identity:rose-bowl-fourth-and-five",
  "identity:cfb-andre-ware--alvin-cc-two-jobs",
  "identity:brother-brian-tragedy",
  "identity:father-iowa-state-game",
  "identity:elite-athletic-parents",
  "identity:palestine-summer-giveback",
  "identity:archie-griffin-parents-work-ethic",
  "identity:archie-griffin-grew-up-around-ohio-state",
  "identity:archie-griffin-woody-hayes-childrens-hospital",
  "identity:archie-griffin-tank-youth-football",
  "identity:cfb-barry-sanders--declined-high-school-record-chase",
  "identity:rural-work-ethic",
  "identity:boomer-heisman-ceremony",
  "identity:darren-mcfadden-leecie-henson-mentor",
  "identity:cfb-doak-walker--asked-colliers-to-honor-someone-else",
  "identity:earl-campbell-arrived-texas-with-little",
  "identity:earl-campbell-ann-campbell-controlled-recruiting",
  "identity:earl-campbell-buy-mother-house-motivation",
  "identity:ernie-davis-elmira-multisport-52-straight",
  "identity:cfb-herschel-walker--schoolwork-before-signing",
  "identity:eight-intentional-fumbles",
  "identity:five-touchdown-title-game",
  "identity:oj-simpson-rickets-leg-braces",
  "identity:oj-simpson-willie-mays-youth-intervention",
  "identity:super-bowl-student-reporter",
  "identity:alex-smith-helix-teammate",
  "identity:bush-push",
  "identity:ricky-williams-returned-to-texas-finished-degree",
  "identity:cfb-tony-dorsett--steel-mill-motivation",
  "identity:cfb-tony-dorsett--media-friendly-sportscaster-ambition",
]);

const cfbBatch1IdentityOverrides = new Map<string, Partial<WhoAmIClue>>([
  ["cfb-cam-newton:identity:auburn-visit-scheme-questions", {
    text: "During my Auburn recruitment, I focused heavily on how Gus Malzahn's offense would use me and talked openly about competing for college football's top honors.",
    band: "strong",
    facet: "career-path",
    revealPriority: 24,
  }],
  ["cfb-davey-obrien:identity:cfb-davey-obrien--tiny-high-school-quarterback", {
    text: "At about 5-foot-7 and 118 pounds, I still became an all-state high-school quarterback.",
    band: "helpful",
    facet: "background",
    revealPriority: 28,
  }],
  ["cfb-davey-obrien:identity:cfb-davey-obrien--behind-sammy-baugh", {
    text: "At TCU, I first waited behind Sammy Baugh before succeeding him at quarterback.",
    band: "strong",
    facet: "relationships",
    revealPriority: 24,
  }],
  ["cfb-davey-obrien:identity:cfb-davey-obrien--heisman-stagecoach-arrival", {
    text: "When I went to New York to receive the Heisman, Fort Worth supporters arranged for a stagecoach to carry me to the ceremony.",
    band: "strong",
    facet: "identity",
    revealPriority: 32,
  }],
  ["cfb-johnny-manziel:identity:johnny-manziel-alabama-bobble-improvisation", {
    text: "In the 2012 win at Alabama, I collided with my own lineman, lost the ball, recovered it on the move and still threw across my body for a touchdown to Ryan Swope.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 9,
  }],
  ["cfb-lamar-jackson:identity:lamar-jackson-quarterback-only-recruiting-demand", {
    text: "Some recruiters projected me as an athlete, but my mother and I insisted that my college choice give me a real opportunity to play quarterback.",
    band: "strong",
    facet: "career-path",
    revealPriority: 22,
  }],
  ["cfb-paul-hornung:identity:paul-hornung-one-platoon-do-everything-role", {
    text: "In Notre Dame's one-platoon era, I handled quarterback and running-back duties, played defensive back, punted and kicked.",
    band: "strong",
    facet: "role",
    revealPriority: 22,
  }],
  ["cfb-tim-tebow:identity:ole-miss-promise", {
    text: "After Florida's upset loss to Ole Miss in 2008, I delivered an emotional postgame promise about how hard my team would play from that point forward.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 12,
  }],
  ["cfb-baker-mayfield:identity:cfb-baker-mayfield--sat-2014-transfer-rule", {
    text: "I had to sit out the 2014 season after transferring to Oklahoma under the transfer rules then in place.",
    band: "helpful",
    facet: "career-path",
    revealPriority: 26,
  }],
  ["cfb-bryce-young:identity:cfb-bryce-young--father-craig-quarterback-tutor", {
    text: "My father had quarterback experience and closely tutored my development at the position.",
    band: "strong",
    facet: "style",
    revealPriority: 28,
  }],
  ["cfb-caleb-williams:identity:cfb-caleb-williams--red-river-bench-spark", {
    text: "As an Oklahoma freshman, I replaced Spencer Rattler during the 2021 Red River game and helped lead a historic comeback over Texas.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 10,
  }],
  ["cfb-colt-brennan:identity:cfb-colt-brennan--saddleback-juco-reset", {
    text: "After Colorado, I rebuilt my football career at Saddleback Community College and earned all-conference and state offensive-player recognition.",
    band: "strong",
    facet: "career-path",
    revealPriority: 24,
  }],
  ["cfb-dak-prescott:identity:cfbfast-r-player-512030-dak-prescott--2013-egg-bowl-injury-return", {
    text: "After missing time with a nerve injury in my non-throwing arm, I entered the 2013 Egg Bowl in the fourth quarter, tied the game and scored the winning overtime touchdown on fourth-and-1.",
    band: "strong",
    facet: "accomplishments",
    revealPriority: 18,
  }],
  ["cfb-deshaun-watson:identity:cfb-deshaun-watson--championship-crush-to-renfrow", {
    text: "On Clemson's final drive of the 2016 national championship game, I executed the play 'Crush' and found Hunter Renfrow for the winning touchdown with one second remaining against Alabama.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 8,
  }],
  ["cfb-drew-brees:identity:cfb-drew-brees--joe-tiller-purdue-fit", {
    text: "New Purdue coach Joe Tiller saw me as a fit for the spread passing system he was bringing to West Lafayette and gave me the opportunity Texas programs had not.",
    band: "strong",
    facet: "career-path",
    revealPriority: 24,
  }],
  ["cfb-drew-brees:identity:cfb-drew-brees--holy-toledo-ohio-state-touchdown", {
    text: "In 2000 against Ohio State, I hit Seth Morales for a 64-yard late touchdown on the play remembered by the 'Holy Toledo!' radio call.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 9,
  }],
  ["cfb-eric-crouch:identity:cfb-eric-crouch--newcombe-qb-battle-nearly-left", {
    text: "After losing the quarterback job to Bobby Newcombe in 1999, I briefly went home and considered leaving before Frank Solich persuaded me to return.",
    band: "strong",
    facet: "career-path",
    revealPriority: 24,
  }],
  ["cfb-eric-crouch:identity:cfb-eric-crouch--black-41-flash-reverse", {
    text: "Against No. 1 Oklahoma in 2001, I caught a 63-yard touchdown pass on the trick play known as 'Black 41 Flash Reverse.'",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 9,
  }],
  ["cfb-fernando-mendoza:identity:cfb-fernando-mendoza--alberto-indiana-transfer-link", {
    text: "My younger brother Alberto was already a quarterback at Indiana, and his experience with the staff and culture helped shape my transfer decision.",
    band: "strong",
    facet: "relationships",
    revealPriority: 24,
  }],
  ["cfb-billy-sims:identity:switzer-halftime-payphone", {
    text: "While I was leaning toward Baylor, Barry Switzer called me from a pay phone during halftime of an Oklahoma game at Colorado and kept recruiting me.",
    band: "strong",
    facet: "career-path",
    revealPriority: 24,
  }],
  ["cfb-bo-jackson:identity:bo-jackson-bo-over-the-top", {
    text: "As a freshman in the 1982 Iron Bowl, I scored the decisive touchdown by going over the top on fourth-and-goal, ending Alabama's nine-game winning streak in the rivalry.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 9,
  }],
  ["cfb-derrick-henry:identity:derrick-henry-ken-hall-record", {
    text: "At Yulee High School, I broke the national high-school career rushing record that Ken Hall had held for 59 years.",
    band: "strong",
    facet: "accomplishments",
    revealPriority: 24,
  }],
  ["cfb-herschel-walker:identity:cfb-herschel-walker--bill-bates-debut-run", {
    text: "In my first college game at Tennessee in 1980, I ran through safety Bill Bates on a touchdown that became permanently linked to my Georgia identity.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 9,
  }],
  ["cfb-o-j-simpson:identity:oj-simpson-usc-world-record-relay", {
    text: "At USC, I also competed in track and ran on a 440-yard relay team that set a world record.",
    band: "strong",
    facet: "style",
    revealPriority: 28,
  }],
  ["cfb-o-j-simpson:identity:oj-simpson-1967-ucla-weaving-touchdown", {
    text: "In the 1967 USC-UCLA rivalry game, I broke a long fourth-quarter touchdown run that provided the decisive points in USC's 21-20 win.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 9,
  }],
]);

function cfbBatch1Clue(
  id: string,
  text: string,
  band: WhoAmIClue["band"] = "strong",
  facet: WhoAmIClue["facet"] = "accomplishments",
  revealPriority = 14,
): WhoAmIClue {
  return { id: "curated-cfb1:" + id, conceptId: "curated-cfb1:" + id, text, band, facet, revealPriority };
}

const cfbBatch1SupplementalClues = new Map<string, readonly WhoAmIClue[]>([
  ["cfb-cam-newton", [
    cfbBatch1Clue("newton-path", "My college path ran from Florida to Blinn College and then Auburn.", "strong", "career-path"),
    cfbBatch1Clue("newton-2010-title", "In my lone Auburn season, I won the Heisman Trophy and the national championship.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("newton-first-pick", "I became the No. 1 overall pick in the 2011 NFL Draft.", "giveaway", "career-path", 10),
  ]],
  ["cfb-davey-obrien", [
    cfbBatch1Clue("obrien-1938-title", "I quarterbacked TCU through an undefeated 1938 season and a national championship.", "giveaway", "accomplishments", 9),
    cfbBatch1Clue("obrien-maxwell", "I also won the Maxwell Award in 1938.", "strong", "accomplishments", 14),
    cfbBatch1Clue("obrien-draft", "Philadelphia selected me No. 4 overall in the 1939 NFL Draft.", "strong", "career-path"),
    cfbBatch1Clue("obrien-all-american", "I was a unanimous All-American at quarterback in 1938.", "strong", "accomplishments"),
    cfbBatch1Clue("obrien-double-wing", "TCU coach Dutch Meyer built a pass-heavy double-wing offense around my skills at quarterback.", "helpful", "style", 27),
    cfbBatch1Clue("obrien-sugar", "I finished the undefeated 1938 season by throwing a touchdown pass and kicking a field goal in a Sugar Bowl win over Carnegie Tech.", "strong", "accomplishments", 22),
  ]],
  ["cfb-joe-burrow", [
    cfbBatch1Clue("burrow-transfer", "I began at Ohio State before transferring to LSU for my final two college seasons.", "strong", "career-path"),
    cfbBatch1Clue("burrow-2019", "In 2019 I won the Heisman Trophy, threw 60 touchdown passes and finished a 15-0 national-title season.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("burrow-first-pick", "I became the No. 1 overall pick in the 2020 NFL Draft.", "giveaway", "career-path", 10),
  ]],
  ["cfb-andrew-luck", [
    cfbBatch1Clue("luck-stanford", "I quarterbacked Stanford and finished as the Heisman runner-up in both 2010 and 2011.", "giveaway", "accomplishments", 9),
    cfbBatch1Clue("luck-orange", "I led Stanford to a 12-win season and an Orange Bowl victory after the 2010 season.", "helpful", "accomplishments"),
    cfbBatch1Clue("luck-bcs-bowls", "I led Stanford to consecutive BCS bowl appearances, first the Orange Bowl and then the Fiesta Bowl.", "strong", "accomplishments"),
    cfbBatch1Clue("luck-conference-poy", "I was the conference offensive player of the year in both 2010 and 2011.", "helpful", "accomplishments"),
    cfbBatch1Clue("luck-2011-awards", "I won both the Maxwell Award and Walter Camp Award in 2011.", "strong", "accomplishments"),
    cfbBatch1Clue("luck-unitas", "I won the Johnny Unitas Golden Arm Award in 2011.", "strong", "accomplishments"),
    cfbBatch1Clue("luck-redshirt", "After redshirting in 2008, I became Stanford's starting quarterback in 2009.", "helpful", "career-path"),
    cfbBatch1Clue("luck-12", "No. 12 was my Stanford jersey number.", "strong", "identity"),
  ]],
  ["cfb-baker-mayfield", [
    cfbBatch1Clue("mayfield-walkon-path", "I walked on at Texas Tech, transferred, and then walked on again at Oklahoma.", "giveaway", "career-path", 9),
    cfbBatch1Clue("mayfield-heisman", "I won the 2017 Heisman Trophy after three straight Big 12 championship seasons at Oklahoma.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("mayfield-first-pick", "I became the No. 1 overall pick in the 2018 NFL Draft.", "giveaway", "career-path", 10),
  ]],
  ["cfb-bryce-young", [
    cfbBatch1Clue("young-heisman", "In 2021 I became the first Alabama quarterback to win the Heisman Trophy.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("young-sec", "I led Alabama to the 2021 SEC championship.", "strong", "accomplishments"),
    cfbBatch1Clue("young-first-pick", "I became the No. 1 overall pick in the 2023 NFL Draft.", "giveaway", "career-path", 10),
  ]],
  ["cfb-caleb-williams", [
    cfbBatch1Clue("williams-transfer", "I followed Lincoln Riley from Oklahoma to USC after the 2021 season.", "giveaway", "career-path", 9),
    cfbBatch1Clue("williams-heisman", "I won the 2022 Heisman Trophy in my first season at USC.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("williams-first-pick", "I became the No. 1 overall pick in the 2024 NFL Draft.", "giveaway", "career-path", 10),
  ]],
  ["cfb-c-j-stroud", [
    cfbBatch1Clue("stroud-bigten", "I was a two-time Big Ten Offensive Player of the Year at Ohio State.", "strong", "accomplishments"),
    cfbBatch1Clue("stroud-georgia", "I threw four touchdown passes against Georgia in the College Football Playoff semifinal after the 2022 season.", "strong", "accomplishments"),
    cfbBatch1Clue("stroud-second-pick", "I became the No. 2 overall pick in the 2023 NFL Draft.", "giveaway", "career-path", 10),
  ]],
  ["cfb-drew-brees", [
    cfbBatch1Clue("brees-big-ten", "I led Purdue to the 2000 Big Ten championship and its first Rose Bowl appearance in more than three decades.", "giveaway", "accomplishments", 9),
    cfbBatch1Clue("brees-maxwell", "I won the Maxwell Award in 2000.", "strong", "accomplishments"),
    cfbBatch1Clue("brees-draft", "I was selected No. 32 overall in the 2001 NFL Draft.", "strong", "career-path"),
    cfbBatch1Clue("brees-heisman-finalist", "I was a Heisman Trophy finalist twice during my Purdue career.", "strong", "accomplishments", 24),
    cfbBatch1Clue("brees-big-ten-poy", "I was twice named Big Ten Offensive Player of the Year.", "helpful", "accomplishments", 28),
    cfbBatch1Clue("brees-number-15", "I wore No. 15 at Purdue.", "helpful", "identity", 30),
    cfbBatch1Clue("brees-record-book", "I left Purdue having set two NCAA records, 13 Big Ten records and 19 school records.", "helpful", "production", 30),
  ]],
  ["cfb-eli-manning", [
    cfbBatch1Clue("eli-maxwell", "I won the Maxwell Award in my final college season.", "strong", "accomplishments"),
    cfbBatch1Clue("eli-cotton", "I finished my college career by leading a 10-win team to a Cotton Bowl victory.", "strong", "accomplishments"),
    cfbBatch1Clue("eli-first-pick", "I became the No. 1 overall pick in the 2004 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-fernando-mendoza", [
    cfbBatch1Clue("mendoza-transfer", "My college quarterback path included California before I transferred to Indiana.", "strong", "career-path"),
  ]],
  ["cfb-doak-walker", [
    cfbBatch1Clue("walker-heisman", "I won the 1948 Heisman Trophy at SMU.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("walker-all-america", "I was a three-time All-American for SMU.", "strong", "accomplishments"),
    cfbBatch1Clue("walker-cotton", "I led SMU into consecutive Cotton Bowls after the 1947 and 1948 seasons.", "strong", "accomplishments"),
    cfbBatch1Clue("walker-draft", "Detroit selected me No. 3 overall in the 1949 NFL Draft.", "strong", "career-path"),
  ]],
  ["cfb-billy-cannon", [
    cfbBatch1Clue("cannon-title", "I was a two-way star on LSU's 1958 national championship team.", "strong", "accomplishments"),
    cfbBatch1Clue("cannon-halloween", "My 89-yard punt return against Ole Miss on Halloween night in 1959 became one of LSU's defining plays.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-barry-sanders", [
    cfbBatch1Clue("sanders-1988", "My 1988 season at Oklahoma State produced the Heisman Trophy and one of the most prolific rushing seasons in college football history.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("sanders-third-pick", "Detroit selected me No. 3 overall in the 1989 NFL Draft.", "strong", "career-path"),
  ]],
  ["cfb-o-j-simpson", [
    cfbBatch1Clue("simpson-1967-title", "I helped USC win the 1967 national championship.", "strong", "accomplishments"),
    cfbBatch1Clue("simpson-heisman", "I won the 1968 Heisman Trophy.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("simpson-first-pick", "I became the No. 1 overall pick in the 1969 NFL Draft.", "giveaway", "career-path", 10),
  ]],
  ["cfb-doug-flutie", [
    cfbBatch1Clue("flutie-hail-mary", "My last-second touchdown pass to Gerard Phelan beat Miami in 1984 in one of college football's most famous finishes.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("flutie-heisman", "I won the 1984 Heisman Trophy at Boston College.", "giveaway", "accomplishments", 9),
  ]],
  ["cfb-jim-plunkett", [
    cfbBatch1Clue("plunkett-heisman", "I won the 1970 Heisman Trophy at Stanford.", "giveaway", "accomplishments", 9),
    cfbBatch1Clue("plunkett-rose", "I finished that season by leading Stanford past Ohio State in the Rose Bowl.", "strong", "accomplishments"),
    cfbBatch1Clue("plunkett-latino", "I became the first Latino winner of the Heisman Trophy.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-johnny-manziel", [
    cfbBatch1Clue("manziel-freshman-heisman", "In 2012 I became the first freshman to win the Heisman Trophy.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-lamar-jackson", [
    cfbBatch1Clue("lamar-heisman", "In 2016 I became Louisville's first Heisman Trophy winner.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("lamar-dual-threat", "My Heisman season paired more than 3,500 passing yards with more than 1,500 rushing yards.", "strong", "production"),
  ]],
  ["cfb-matt-leinart", [
    cfbBatch1Clue("leinart-heisman", "I won the 2004 Heisman Trophy as USC's quarterback.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("leinart-title", "I quarterbacked USC through an undefeated 2004 season and a national championship.", "giveaway", "accomplishments", 9),
    cfbBatch1Clue("leinart-notre-dame", "My late quarterback sneak at Notre Dame in 2005 finished one of the era's most famous games.", "strong", "accomplishments"),
  ]],
  ["cfb-paul-hornung", [
    cfbBatch1Clue("hornung-number-5", "I wore No. 5 at Notre Dame.", "strong", "identity"),
    cfbBatch1Clue("hornung-all-america", "I earned All-America honors in both 1955 and 1956 at Notre Dame.", "strong", "accomplishments"),
  ]],
  ["cfb-roger-staubach", [
    cfbBatch1Clue("staubach-heisman", "I won the 1963 Heisman Trophy while playing quarterback at Navy.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("staubach-cotton", "I led Navy to a No. 2 national ranking and a Cotton Bowl matchup with No. 1 Texas after the 1963 season.", "strong", "accomplishments"),
  ]],
  ["cfb-tim-tebow", [
    cfbBatch1Clue("tebow-sophomore", "In 2007 I became the first sophomore to win the Heisman Trophy.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("tebow-titles", "I was part of Florida national championship teams in 2006 and 2008.", "giveaway", "accomplishments", 9),
  ]],
  ["cfb-vince-young", [
    cfbBatch1Clue("young-title", "I led Texas to an undefeated national championship season in 2005.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("young-rose", "On fourth-and-five with the national title on the line, I ran for the winning touchdown against USC.", "giveaway", "accomplishments", 7),
  ]],
  ["cfb-andre-ware", [
    cfbBatch1Clue("ware-1989-production", "In my Heisman season, I threw for 4,699 yards and 46 touchdowns.", "strong", "production", 24),
    cfbBatch1Clue("ware-records", "I set 26 NCAA records during my Heisman-winning season.", "helpful", "production", 28),
    cfbBatch1Clue("ware-smu", "During that season, I threw six touchdown passes as Houston beat SMU 95-21.", "helpful", "accomplishments", 30),
    cfbBatch1Clue("ware-seventh-pick", "Detroit selected me No. 7 overall in the 1990 NFL Draft.", "strong", "career-path", 22),
  ]],
  ["cfb-brady-quinn", [
    cfbBatch1Clue("quinn-heisman-finishes", "I finished in the top four of the Heisman voting in both 2005 and 2006 at Notre Dame.", "strong", "accomplishments"),
    cfbBatch1Clue("quinn-records", "I left Notre Dame as the program's career leader in passing yards and touchdown passes.", "strong", "accomplishments"),
  ]],
  ["cfb-carson-palmer", [
    cfbBatch1Clue("palmer-heisman", "I won the 2002 Heisman Trophy at USC.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("palmer-orange", "I closed my USC career by leading a decisive Orange Bowl win over Iowa.", "strong", "accomplishments"),
  ]],
  ["cfb-charlie-ward", [
    cfbBatch1Clue("ward-heisman-title", "In 1993 I won the Heisman Trophy and led Florida State to its first national championship.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("ward-basketball", "I also played point guard for Florida State and became a first-round NBA pick after college.", "giveaway", "career-path", 9),
  ]],
  ["cfb-chris-weinke", [
    cfbBatch1Clue("weinke-title", "I quarterbacked Florida State to the 1999 national championship.", "strong", "accomplishments"),
    cfbBatch1Clue("weinke-oldest-heisman", "I won the 2000 Heisman Trophy at age 28 after returning from professional baseball.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-colt-brennan", [
    cfbBatch1Clue("brennan-58", "I threw 58 touchdown passes in 2006, setting the NCAA single-season record at the time.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("brennan-undefeated", "I led Hawaii through an undefeated 2007 regular season and into the Sugar Bowl.", "giveaway", "accomplishments", 9),
  ]],
  ["cfb-colt-mccoy", [
    cfbBatch1Clue("mccoy-wins", "I finished my Texas career with 45 victories as a starting quarterback, an NCAA record at the time.", "strong", "accomplishments"),
    cfbBatch1Clue("mccoy-2009", "I led Texas to the 2009 Big 12 championship and the national championship game.", "giveaway", "accomplishments", 9),
  ]],
  ["cfb-dak-prescott", [
    cfbBatch1Clue("dak-number-one", "In 2014 I led Mississippi State to the first No. 1 ranking in program history.", "giveaway", "accomplishments", 9),
    cfbBatch1Clue("dak-15", "I wore No. 15 at Mississippi State in tribute to Tim Tebow.", "strong", "identity"),
  ]],
  ["cfb-danny-wuerffel", [
    cfbBatch1Clue("wuerffel-heisman-title", "I won the Heisman Trophy in 1996 and finished the season by leading Florida to a national championship.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("wuerffel-spurrier", "My head coach at Florida had also won the Heisman as a Gators quarterback.", "strong", "relationships"),
  ]],
  ["cfb-deshaun-watson", [
    cfbBatch1Clue("watson-clemson", "I left Clemson after three seasons with a national title and two straight championship-game appearances.", "strong", "accomplishments"),
  ]],
  ["cfb-eric-crouch", [
    cfbBatch1Clue("crouch-heisman", "I won the 2001 Heisman Trophy while running Nebraska's option offense.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-adrian-peterson", [
    cfbBatch1Clue("peterson-freshman", "As a true freshman at Oklahoma in 2004, I rushed for 1,925 yards and finished second in Heisman voting.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("peterson-title-game", "That freshman season ended with Oklahoma playing for the national championship.", "strong", "accomplishments"),
    cfbBatch1Clue("peterson-all-big12", "I earned All-Big 12 honors in each of my three seasons at Oklahoma.", "helpful", "accomplishments", 28),
    cfbBatch1Clue("peterson-doak-finalist", "As a freshman, I became the first freshman ever named a finalist for the Doak Walker Award.", "strong", "accomplishments", 24),
    cfbBatch1Clue("peterson-collarbone", "I broke my collarbone on a touchdown run at Iowa State in 2006 and missed seven games.", "helpful", "career-path", 28),
    cfbBatch1Clue("peterson-seventh-pick", "Minnesota selected me No. 7 overall in the 2007 NFL Draft.", "strong", "career-path", 22),
  ]],
  ["cfb-archie-griffin", [
    cfbBatch1Clue("griffin-two-heismans", "I remain the only player to win the Heisman Trophy twice, taking it in 1974 and 1975.", "giveaway", "accomplishments", 7),
    cfbBatch1Clue("griffin-rose", "My Ohio State teams reached four consecutive Rose Bowls.", "strong", "accomplishments"),
  ]],
  ["cfb-darren-mcfadden", [
    cfbBatch1Clue("mcfadden-doak", "I won the Doak Walker Award in both 2006 and 2007 at Arkansas.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("mcfadden-heisman", "I finished second in the Heisman voting in consecutive seasons.", "giveaway", "accomplishments", 9),
  ]],
  ["cfb-derrick-henry", [
    cfbBatch1Clue("henry-heisman", "I won the 2015 Heisman Trophy after rushing for more than 2,200 yards.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("henry-title", "My final Alabama season ended with a national championship.", "strong", "accomplishments"),
  ]],
  ["cfb-earl-campbell", [
    cfbBatch1Clue("campbell-heisman", "I won the 1977 Heisman Trophy in my final season at Texas.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("campbell-1744", "I rushed for 1,744 yards during that Heisman season.", "strong", "production"),
  ]],
  ["cfb-ernie-davis", [
    cfbBatch1Clue("davis-title", "I helped Syracuse win the 1959 national championship while wearing the program's famous No. 44.", "giveaway", "accomplishments", 9),
    cfbBatch1Clue("davis-heisman", "In 1961 I became the first Black player to win the Heisman Trophy.", "giveaway", "accomplishments", 7),
  ]],
  ["cfb-herschel-walker", [
    cfbBatch1Clue("walker-title", "As a freshman I helped Georgia complete an undefeated 1980 season and win the national championship.", "giveaway", "accomplishments", 9),
    cfbBatch1Clue("walker-heisman", "I won the 1982 Heisman Trophy in my third and final Georgia season.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-marcus-allen", [
    cfbBatch1Clue("allen-heisman", "I won the 1981 Heisman Trophy at USC.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("allen-2000", "That season I became the first player in NCAA history to rush for more than 2,000 yards in a season.", "giveaway", "accomplishments", 9),
  ]],
  ["cfb-reggie-bush", [
    cfbBatch1Clue("bush-goalline", "On the decisive late goal-line play at Notre Dame in 2005, I pushed quarterback Matt Leinart from behind as he crossed the goal line.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("bush-heisman", "My 2005 Heisman Trophy was formally reinstated in 2024.", "giveaway", "accomplishments", 9),
    cfbBatch1Clue("bush-title", "I was a major part of USC's undefeated 2004 national championship team.", "strong", "accomplishments"),
  ]],
  ["cfb-ricky-williams", [
    cfbBatch1Clue("ricky-heisman", "I won the 1998 Heisman Trophy at Texas.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("ricky-record", "I finished at Texas with 6,279 rushing yards after breaking the major-college career rushing record.", "giveaway", "accomplishments", 9),
    cfbBatch1Clue("ricky-34", "I wore No. 34 as a senior in tribute to Texas legend Earl Campbell.", "strong", "identity"),
  ]],
  ["cfb-tony-dorsett", [
    cfbBatch1Clue("dorsett-title", "I won the Heisman Trophy and a national championship with Pittsburgh in 1976.", "giveaway", "accomplishments", 8),
    cfbBatch1Clue("dorsett-record", "I finished my Pitt career with 6,082 rushing yards, then the NCAA career record.", "giveaway", "accomplishments", 9),
  ]],
  ["cfb-ashton-jeanty", [
    cfbBatch1Clue("jeanty-2601", "I rushed for 2,601 yards in my final Boise State season.", "giveaway", "production", 8),
    cfbBatch1Clue("jeanty-awards", "That season I won both the Maxwell Award and the Doak Walker Award.", "giveaway", "accomplishments", 9),
    cfbBatch1Clue("jeanty-heisman", "I finished second in the Heisman voting after that record-setting season.", "strong", "accomplishments"),
  ]],
  ["cfb-bijan-robinson", [
    cfbBatch1Clue("bijan-doak", "I won the Doak Walker Award as the nation's top running back in 2022.", "strong", "accomplishments"),
    cfbBatch1Clue("bijan-all-america", "I was a unanimous first-team All-American in my final Texas season.", "strong", "accomplishments"),
    cfbBatch1Clue("bijan-eighth-pick", "Atlanta selected me No. 8 overall in the 2023 NFL Draft.", "giveaway", "career-path", 10),
  ]],
]);

function isCfbBatch1NflStageLeak(clue: WhoAmIClue) {
  if (!clue.identityKnowledge) return false;
  const text = clue.text.toLowerCase();
  return (
    /\bnfl\b|super bowl|all-pro|pro bowl|professional football hall of fame/.test(text)
    && !/draft|selected|pick/.test(text)
  );
}

function cfbBatch1ApplyOverride(subjectId: string, clue: WhoAmIClue) {
  const override = cfbBatch1IdentityOverrides.get(subjectId + ":" + (clue.conceptId ?? clue.id));
  return override ? { ...clue, ...override } : clue;
}

function shouldSuppressCfbBatch1Clue(subject: FootballSubjectProfile, clue: WhoAmIClue) {
  if (cfbBatch1StructuralClueIds.has(clue.id)) return true;
  if (
    cfbBatch1SpecificHeismanSubjectIds.has(subject.id)
    && (clue.id === "heisman" || clue.id === "fact:cfb-heisman-awards")
  ) return true;
  if (
    clue.id === "fact:cfb-career-games"
    || clue.id === "fact:cfb-career-starts"
    || clue.id === "fact:cfb-career-passing-completions"
    || clue.id === "fact:cfb-career-passing-attempts"
    || clue.id === "fact:cfb-career-rushing-attempts"
    || clue.id === "fact:cfb-career-interceptions-thrown"
  ) return true;
  if (
    clue.conceptId === "identity:career-games"
    || clue.conceptId === "identity:career-starts"
    || clue.conceptId === "identity:career-passing-completions"
    || clue.conceptId === "identity:career-passing-attempts"
    || clue.conceptId === "identity:career-rushing-attempts"
    || clue.conceptId === "identity:career-interceptions-thrown"
  ) return true;
  if (clue.conceptId && cfbBatch1SuppressedIdentityConcepts.has(clue.conceptId)) return true;
  if (isCfbBatch1NflStageLeak(clue)) return true;
  return false;
}

function trimCfbBatch1Pool(subject: FootballSubjectProfile, clues: readonly WhoAmIClue[]) {
  const target = 16;
  if (clues.length <= target) return [...clues];

  const requiredIds = new Set(["position", "school"]);
  const required = clues.filter((clue) => requiredIds.has(clue.id));
  const requiredIdSet = new Set(required.map((clue) => clue.id));
  const ranked = clues
    .map((clue, index) => ({ clue, index, score: clueQualityScore(subject, clue) }))
    .filter((entry) => !requiredIdSet.has(entry.clue.id))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  const selected = new Set([
    ...required.map((clue) => clue.id),
    ...ranked.slice(0, Math.max(0, target - required.length)).map((entry) => entry.clue.id),
  ]);
  return clues.filter((clue) => selected.has(clue.id));
}

function curateCfbBatch1Clues(subject: FootballSubjectProfile, rawClues: readonly WhoAmIClue[]) {
  let colorUsed = false;
  let relationshipUsed = false;
  const curated: WhoAmIClue[] = [];

  for (const rawClue of rawClues) {
    if (shouldSuppressCfbBatch1Clue(subject, rawClue)) continue;
    const clue = cfbBatch1ApplyOverride(subject.id, rawClue);
    if (clue.identityKnowledge) {
      const selectionClass = whoAmIClueSelectionClass(clue);
      if (selectionClass === "deep-biography") continue;
      if (selectionClass === "identity-color") {
        if (colorUsed) continue;
        colorUsed = true;
      }
      if (whoAmIClueFacet(clue) === "relationships") {
        if (relationshipUsed) continue;
        relationshipUsed = true;
      }
    }
    curated.push(clue);
  }

  curated.push(...(cfbBatch1SupplementalClues.get(subject.id) ?? []));
  return trimCfbBatch1Pool(subject, curated);
}

export function isCfbWhoAmIBatch1Subject(subjectId: string) {
  return cfbBatch1SubjectIds.has(subjectId);
}

export const CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS = [
  "cfb-cedric-benson",
  "cfb-christian-mccaffrey",
  "cfb-dalvin-cook",
  "cfb-darren-sproles",
  "cfb-deangelo-williams",
  "cfb-eddie-george",
  "cfb-ezekiel-elliott",
  "cfb-george-rogers",
  "cfb-jamaal-charles",
  "cfb-ladainian-tomlinson",
  "cfb-lamichael-james",
  "cfb-calvin-johnson",
  "cfb-desmond-howard",
  "cfb-devonta-smith",
  "cfb-justin-blackmon",
  "cfb-larry-fitzgerald",
  "cfb-michael-crabtree",
  "cfb-a-j-brown",
  "cfb-amari-cooper",
  "cfb-andre-johnson",
  "cfb-brandin-cooks",
  "cfb-braylon-edwards",
  "cfb-davante-adams",
  "cfb-desean-jackson",
  "cfb-dez-bryant",
  "cfb-jamarr-chase",
  "cfb-jordan-shipley",
  "cfb-marqise-lee",
  "cfb-marvin-harrison-jr",
  "cfb-mike-evans",
  "cfb-peter-warrick",
  "cfb-ryan-broyles",
  "cfb-sammy-watkins",
  "cfb-tim-brown",
  "cfb-brock-bowers",
  "cfb-chase-coffman",
  "cfb-dallas-clark",
  "cfb-dwayne-allen",
  "cfb-heath-miller",
  "cfb-hunter-henry",
  "cfb-jake-butt",
  "cfb-jeremy-shockey",
  "cfb-jermaine-gresham",
  "cfb-keith-jackson",
  "cfb-kellen-winslow-ii",
  "cfb-kyle-pitts",
  "cfb-john-hannah",
  "cfb-orlando-pace",
  "cfb-alex-mack",
  "cfb-barrett-jones",
] as const;

const cfbBatch2SubjectIds = new Set<string>(CFB_WHO_AM_I_BATCH_2_SUBJECT_IDS);
const cfbBatch2StructuralClueIds = new Set(["player-career-start", "player-career-end", "career-span"]);
const cfbBatch2GenericMetricIds = new Set([
  "fact:cfb-career-games",
  "fact:cfb-career-starts",
  "fact:cfb-career-targets",
  "fact:cfb-career-passing-completions",
  "fact:cfb-career-passing-attempts",
  "fact:cfb-career-rushing-attempts",
  "fact:cfb-career-interceptions-thrown",
]);
const cfbBatch2GenericIdentityConcepts = new Set([
  "identity:career-games",
  "identity:career-starts",
  "identity:career-games-starts",
  "identity:career-passing-completions",
  "identity:career-passing-attempts",
  "identity:career-rushing-attempts",
  "identity:career-targets",
  "identity:career-interceptions-thrown",
]);
const cfbBatch2PartialCareerMetricSubjectIds = new Set([
  "cfb-ezekiel-elliott",
  "cfb-amari-cooper",
  "cfb-hunter-henry",
  "cfb-jake-butt",
]);


const cfbBatch2SuppressedIdentityConcepts = new Set([
  "identity:cfb-cedric-benson--first-high-school-dave-campbell-cover",
  "identity:cfb-cedric-benson--quit-baseball-before-senior-year",
  "identity:cfb-christian-mccaffrey--pianist",
  "identity:cfb-christian-mccaffrey--rwanda-mission-trip",
  "identity:christian-mccaffrey-multigenerational-athletic-family",
  "identity:cfbfast-r-player-3116593-dalvin-cook--moved-to-grandmother-for-miami-central",
  "identity:cfbfast-r-player-3116593-dalvin-cook--youth-handoffs-from-brother-deandre",
  "identity:cfbfast-r-player-3116593-dalvin-cook--joseph-yearby-friend-to-rival",
  "identity:cfbfast-r-player-3116593-dalvin-cook--clemson-florida-fsu-recruiting-flips",
  "identity:cfb-darren-sproles--tank-nickname-birthweight",
  "identity:cfb-darren-sproles--childhood-stutter-public-speaking",
  "identity:cfb-darren-sproles--mother-annette-academics",
  "identity:cfb-deangelo-williams--family-breast-cancer-advocacy",
  "identity:cfb-eddie-george--illinois-fumbles-cooper-stuck-with-him",
  "identity:cfb-ezekiel-elliott--missouri-athlete-family",
  "identity:cfb-ezekiel-elliott--gus-frerotte-high-school-coach",
  "identity:cfb-ezekiel-elliott--mizzou-late-recruiting-pull",
  "identity:cfb-george-rogers--two-dollar-insurance-aunt-othella",
  "identity:cfb-george-rogers--foundation-first-generation-students",
  "identity:cfb-jamaal-charles--raised-by-mother-aunt-grandmother",
  "identity:cfb-jamaal-charles--broke-joe-washington-port-arthur-record",
  "identity:emmitt-smith-formative-encounter",
  "identity:cfb-lamichael-james--raised-by-grandmother",
  "identity:cfb-lamichael-james--lived-alone-senior-year",
  "identity:cfb-lamichael-james--kenjon-barner-friendship",
  "identity:cfb-lamichael-james--returned-to-eugene-restaurants",
  "identity:cfb-calvin-johnson--academic-family",
  "identity:pr8-devonta-smith-butler-town-park-childhood",
  "identity:pr8-devonta-smith-mother-social-worker-influence",
  "identity:pr8-devonta-smith-chose-alabama-for-structure",
  "identity:devonta-smith-no-ac-gym-recruiting-image",
  "identity:cfb-justin-blackmon--class-president",
  "identity:cfb-justin-blackmon--drummer",
  "identity:pr8-cfb-larry-fitzgerald--promise-to-mother",
  "identity:father",
  "identity:cfbfast-r-player-4047646-a-j-brown--middle-name-spelling-story",
  "identity:pr7-parents-instilled-ceiling-obsession",
  "identity:cfb-andre-johnson--foundation-single-parent-youth",
  "identity:childhood-scarcity-shaped-foundation",
  "identity:cfb-brandin-cooks--raised-by-mother-after-fathers-death",
  "identity:cfb-braylon-edwards--endowed-no-1-scholarship",
  "identity:cfb-braylon-edwards--returned-to-finish-degree",
  "identity:cfb-davante-adams--mother-worked-two-jobs",
  "identity:davante-adams-childhood-raiders-fan",
  "identity:cfb-davante-adams--first-scholarship-eased-family-burden",
  "identity:pr7-dez-bryant-unstable-childhood-structure",
  "identity:pr7-dez-bryant-david-wells-father-figure",
  "identity:cfb-jordan-shipley--childhood-with-colt-mccoy",
  "identity:pr8-hunting-fishing-with-father",
  "identity:cfb-chase-coffman--all-four-siblings-c-names",
  "identity:cfb-dallas-clark--century-family-farm-return",
  "identity:cfb-hunter-henry--church-fca-food-drive",
  "identity:cfb-jake-butt--medal-speech-rubadeau",
  "identity:cfb-jermaine-gresham--maintenance-job",
  "identity:cfb-jermaine-gresham--real-estate-interest",
  "identity:cfb-jermaine-gresham--grandmother-shaped-life",
  "identity:cfb-keith-jackson--four-time-academic-all-big-eight",
  "identity:cfb-keith-jackson--ou-radio-broadcast-crew",
  "identity:cfb-alex-mack--legal-studies-magna-cum-laude",
  "identity:cfb-alex-mack--graduate-student-education",
  "identity:cfb-barrett-jones--accounting-bachelors-and-masters",
  "identity:cfb-barrett-jones--four-time-academic-all-american",
  "identity:cfb-barrett-jones--haiti-nicaragua-mission-trips",
  "identity:hannah-alabama-family",
  "identity:big-oak-signing-bonus-pledge",
  "identity:pregame-visualization-routine",
  "identity:play-through-pain-code",
  "identity:cfb-kellen-winslow-ii--father-kellen-winslow",
  "identity:cfb-kellen-winslow-ii--high-school-multi-role-kicker",
  "identity:cfb-kellen-winslow-ii--uncle-david-basketball",
  "identity:cfb-davante-adams--first-scholarship-eased-family-burden",
  "identity:cfb-michael-crabtree--dallas-and-tech-giveback",
  "identity:cfb-braylon-edwards--returned-to-finish-degree",
  "identity:cfb-keith-jackson--four-time-academic-all-big-eight",
  "identity:cfb-alex-mack--legal-studies-magna-cum-laude",
  "identity:cfb-alex-mack--graduate-student-education",
  "identity:cfb-barrett-jones--accounting-bachelors-and-masters",
  "identity:cfb-barrett-jones--four-time-academic-all-american",
  "identity:cfb-barrett-jones--haiti-nicaragua-mission-trips",
  "identity:megatron-nickname-origin",
  "identity:cfb-marvin-harrison-jr--grew-during-covid-shutdown",
  "identity:cfb-amari-cooper--teddy-bridgewater-teammate",
  "identity:cfb-amari-cooper--coconut-grove-barnyard-football",
  "identity:cfb-amari-cooper--chess-from-music-teacher",
  "identity:cfb-amari-cooper--route-runner-brand",
  "identity:quiet-receiver-mentor",
  "identity:cfb-michael-crabtree--academic-eligibility-fight",
  "identity:cfb-desean-jackson--team-jackson-family-training",
  "identity:desean-jackson-team-jackson-childhood-training",
  "identity:cfb-desean-jackson--long-commute-to-long-beach-poly",
  "identity:desean-jackson-richard-sherman-baseball",
  "identity:cfb-jordan-shipley--west-texas-moves-and-stephen-mcgee",
  "identity:cfb-peter-warrick--payton-warrick-foundation",
  "identity:cfb-tim-brown--multisport-student-leadership",
  "identity:cfb-heath-miller--parents-work-ethic-example",
  "identity:cfb-heath-miller--fourth-generation-southwest-virginia",
  "identity:cfb-eddie-george--childhood-heisman-speech-practice",
  "identity:cfb-ladainian-tomlinson--walter-payton-idol",
  "identity:butterfingers-early-nickname",
  "identity:cfb-brandin-cooks--stepbrother-maurice-washington",
  "identity:cfb-dwayne-allen--basketball-first-sport",
  "identity:cfb-dwayne-allen--wayne-inman-football-mentor",
  "identity:cfb-dallas-clark--mother-died-before-graduation",
  "identity:cfb-dallas-clark--walk-on-linebacker-brother-motivation",
  "identity:cfb-ryan-broyles--returned-senior-to-finish-degree",
  "identity:cfb-orlando-pace--sandusky-basketball-athlete",
]);

const cfbBatch2MalformedFirstPerson = /\bme\s+(?:focused|collided|attended|led|entered|executed|hit|briefly|passed|produced|repeatedly|scored|announced|rebuilt|chose|went|pursued|scrambled|delivered|handled|could|asked|broke|also|gave|weighed|pledged|lost|wanted|committed|struck|learned|watched|lived|told|decided|caught|built|excelled|arrived|returned|rushed|played|won|became|had|was|is|underwent|pointed|created|helped|impressed|reportedly)\b|\bI\s+to\s+sit\b|\bI\s+a\b|\bI\s+died\b|\bI\s+has\b|\bme\s+and\s+my\b|\bFuture\s+and\s+I\s+quarterback\b|\bWilliam\s+myself\b|\bI\s+saw\s+me\b|\bAfter\s+(?:got|left)\b|\bWhile\s+was\b|\bWhen\s+finally\s+got\b|\bthe\s+skinny\s+me\b|\bQuarterback\s+and\s+I\s+[A-Z]|\bAfter[’']s\b|\binjurthis player\b/i;

const cfbBatch2IdentityOverrides = new Map<string, Partial<WhoAmIClue>>([
  ["cfb-darren-sproles:identity:2003-big12-title-game", {
    text: "In the 2003 Big 12 Championship Game against No. 1 Oklahoma, I had 235 rushing yards and 88 receiving yards in Kansas State's 35-7 win.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 8,
  }],
  ["cfb-darren-sproles:identity:cfb-darren-sproles--number-43-for-father", {
    text: "I wore No. 43 at Kansas State, the same number my father Larry had worn.",
    band: "strong",
    facet: "identity",
    revealPriority: 24,
  }],
  ["cfb-deangelo-williams:identity:cfb-deangelo-williams--state-title-game-three-way-touchdowns", {
    text: "During my high-school state-title run, I scored in the championship game as a runner, receiver and returner.",
    band: "helpful",
    facet: "style",
    revealPriority: 30,
  }],
  ["cfb-ezekiel-elliott:identity:cfb-ezekiel-elliott--sugar-bowl-85-yard-run", {
    text: "Against No. 1 Alabama in the 2015 Sugar Bowl, I broke an 85-yard fourth-quarter touchdown run that helped seal Ohio State's CFP semifinal win.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 8,
  }],
  ["cfb-calvin-johnson:identity:cfb-calvin-johnson--first-day-vertical-record", {
    text: "On my first official day at Georgia Tech, I reportedly broke the program's vertical-jump record with a 42-inch leap.",
    band: "strong",
    facet: "style",
    revealPriority: 22,
  }],
  ["cfb-desmond-howard:identity:pr8-spontaneous-heisman-pose", {
    text: "After returning a punt for a touchdown against Ohio State in 1991, I struck the Heisman pose in the end zone.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 7,
  }],
  ["cfb-amari-cooper:identity:cfb-amari-cooper--alabama-camp-earned-saban-offer", {
    text: "At an Alabama camp, I impressed Nick Saban during one-on-one work and was called into his office for a scholarship offer.",
    band: "strong",
    facet: "career-path",
    revealPriority: 22,
  }],
  ["cfb-jamarr-chase:identity:cfb-jamarr-chase--national-title-game-221-two-touchdowns", {
    text: "In LSU's national-championship win over Clemson after the 2019 season, I caught nine passes for 221 yards and two touchdowns.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 7,
  }],
  ["cfb-peter-warrick:identity:cfb-peter-warrick--sugar-bowl-three-score-performance", {
    text: "In the 2000 Sugar Bowl national championship game, I scored on two receptions and a 59-yard punt return and also caught a two-point conversion.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 7,
  }],
  ["cfb-dallas-clark:identity:cfb-dallas-clark--purdue-95-yard-and-winning-touchdowns", {
    text: "Against Purdue in 2002, I caught a 95-yard touchdown and later the winning touchdown on fourth-and-goal from the 7-yard line.",
    band: "strong",
    facet: "accomplishments",
    revealPriority: 16,
  }],
  ["cfb-keith-jackson:identity:cfb-keith-jackson--88-yard-nebraska-reverse", {
    text: "Against No. 2 Nebraska in 1985, I scored on an 88-yard tight-end reverse.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 8,
  }],
  ["cfb-heath-miller:identity:cfb-heath-miller--quarterback-to-tight-end-conversion", {
    band: "strong",
    facet: "career-path",
    revealPriority: 18,
  }],
  ["cfb-heath-miller:identity:mackey-award-2004", {
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 8,
  }],
  ["cfb-justin-blackmon:identity:two-biletnikoff-awards", {
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 7,
  }],
  ["cfb-marvin-harrison-jr:identity:cfb-marvin-harrison-jr--father-marvin-harrison", {
    text: "My father was a Pro Football Hall of Fame wide receiver.",
    band: "giveaway",
    facet: "relationships",
    revealPriority: 6,
  }],
  ["cfb-marvin-harrison-jr:identity:cfb-marvin-harrison-jr--st-josephs-with-kyle-mccord", {
    text: "At St. Joseph's Prep, I formed a quarterback-receiver partnership with Kyle McCord before both of us went to Ohio State.",
    band: "helpful",
    facet: "career-path",
    revealPriority: 28,
  }],
  ["cfb-marvin-harrison-jr:identity:cfb-marvin-harrison-jr--extreme-jugs-work-routine", {
    text: "Ohio State teammates and coaches described my habit of doing extra JUGS-machine and route work at unusually early and late hours.",
    band: "helpful",
    facet: "style",
    revealPriority: 30,
  }],
  ["cfb-kyle-pitts:identity:cfb-kyle-pitts--trask-second-team-connection", {
    text: "My on-field chemistry with quarterback Kyle Trask began in 2018 when we worked together with Florida's second-team offense.",
    band: "strong",
    facet: "relationships",
    revealPriority: 22,
  }],
  ["cfb-kellen-winslow-ii:identity:cfb-kellen-winslow-ii--miami-receiver-to-tight-end", {
    text: "I began my Miami career at wide receiver before moving to tight end.",
    band: "helpful",
    facet: "career-path",
    revealPriority: 20,
  }],
  ["cfb-kellen-winslow-ii:identity:cfb-kellen-winslow-ii--true-freshman-title-team-special-teams", {
    text: "As a true freshman on Miami's 2001 national championship team, I contributed heavily on special teams, including tackles in the Rose Bowl.",
    band: "strong",
    facet: "accomplishments",
    revealPriority: 18,
  }],
]);

function cfbBatch2Clue(
  id: string,
  text: string,
  band: WhoAmIClue["band"] = "strong",
  facet: WhoAmIClue["facet"] = "accomplishments",
  revealPriority = 14,
): WhoAmIClue {
  return { id: "curated-cfb2:" + id, conceptId: "curated-cfb2:" + id, text, band, facet, revealPriority };
}

const cfbBatch2SupplementalClues = new Map<string, readonly WhoAmIClue[]>([
  ["cfb-ladainian-tomlinson", [
    cfbBatch2Clue("tomlinson-doak", "I won the 2000 Doak Walker Award after leading the nation in rushing for a second straight season.", "giveaway", "accomplishments", 8),
    cfbBatch2Clue("tomlinson-2158", "As a senior at TCU in 2000, I rushed for 2,158 yards.", "strong", "production", 22),
    cfbBatch2Clue("tomlinson-heisman-fourth", "I finished fourth in the 2000 Heisman Trophy voting.", "strong", "accomplishments", 17),
    cfbBatch2Clue("tomlinson-rushing-titles", "I led the nation in rushing in both 1999 and 2000.", "strong", "accomplishments", 19),
  ]],
  ["cfb-lamichael-james", [
    cfbBatch2Clue("james-doak", "I won the 2010 Doak Walker Award after leading the nation with 1,731 rushing yards.", "giveaway", "accomplishments", 8),
    cfbBatch2Clue("james-unanimous-aa", "In 2010 I became Oregon's first unanimous All-American.", "strong", "accomplishments", 18),
    cfbBatch2Clue("james-heisman-title-game", "I finished third in the 2010 Heisman voting as Oregon reached its first national championship game.", "strong", "accomplishments", 16),
  ]],
  ["cfb-andre-johnson", [
    cfbBatch2Clue("andre-rose-199", "In Miami's national-title Rose Bowl win after the 2001 season, I had 199 receiving yards and two touchdowns.", "giveaway", "accomplishments", 8),
    cfbBatch2Clue("andre-2002", "In my final Miami season, I topped 1,000 receiving yards and caught nine touchdown passes.", "strong", "production", 22),
    cfbBatch2Clue("andre-third-pick", "Houston selected me No. 3 overall in the 2003 NFL Draft.", "giveaway", "career-path", 9),
    cfbBatch2Clue("andre-national-title", "I was a starting receiver on Miami's undefeated 2001 national championship team.", "strong", "accomplishments", 16),
    cfbBatch2Clue("andre-big-east", "I earned first-team All-Big East honors in my final Miami season.", "strong", "accomplishments", 19),
  ]],
  ["cfb-davante-adams", [
    cfbBatch2Clue("adams-freshman", "I was Mountain West Freshman of the Year in 2012 after catching 102 passes for 1,312 yards and 14 touchdowns.", "strong", "accomplishments", 18),
    cfbBatch2Clue("adams-2013", "In 2013 I led the nation with 131 receptions and 24 touchdown catches while setting a Fresno State record with 1,718 receiving yards.", "giveaway", "production", 8),
    cfbBatch2Clue("adams-38-td", "I left Fresno State after only two playing seasons with school career records for receptions and touchdown catches.", "strong", "accomplishments", 16),
    cfbBatch2Clue("adams-two-aa", "I earned All-America recognition in both of my playing seasons at Fresno State.", "strong", "accomplishments", 20),
  ]],
  ["cfb-dez-bryant", [
    cfbBatch2Clue("dez-24th-pick", "Dallas selected me No. 24 overall in the 2010 NFL Draft.", "giveaway", "career-path", 9),
    cfbBatch2Clue("dez-return-star", "My Oklahoma State career included three punt-return touchdowns in addition to 29 receiving touchdowns.", "strong", "style", 22),
    cfbBatch2Clue("dez-2008-aa", "I was a consensus All-American and Biletnikoff Award runner-up in 2008.", "strong", "accomplishments", 17),
    cfbBatch2Clue("dez-2008-line", "My 2008 season produced 87 catches for 1,480 yards and 19 receiving touchdowns.", "strong", "production", 21),
  ]],
  ["cfb-ryan-broyles", [
    cfbBatch2Clue("broyles-two-biletnikoff-finals", "I was a Biletnikoff Award finalist in both 2010 and 2011.", "strong", "accomplishments", 16),
    cfbBatch2Clue("broyles-2010-aa", "As a 2010 consensus All-American, I caught 131 passes for 1,622 yards and 14 touchdowns.", "strong", "accomplishments", 18),
  ]],
  ["cfb-jermaine-gresham", [
    cfbBatch2Clue("gresham-2008", "In 2008 I caught 66 passes for 950 yards and 14 touchdowns at Oklahoma.", "strong", "production", 20),
    cfbBatch2Clue("gresham-title-run", "I was an All-American on an Oklahoma team that won a third straight Big 12 title and reached the BCS Championship Game.", "giveaway", "accomplishments", 9),
  ]],
  ["cfb-john-hannah", [
    cfbBatch2Clue("hannah-two-aa", "I was a two-time football All-American at Alabama in 1971 and 1972.", "strong", "accomplishments", 16),
    cfbBatch2Clue("hannah-unanimous", "I was a unanimous All-American in 1972.", "strong", "accomplishments", 18),
    cfbBatch2Clue("hannah-all-sec", "I earned All-SEC honors in both 1971 and 1972.", "helpful", "accomplishments", 22),
    cfbBatch2Clue("hannah-fourth-pick", "New England selected me No. 4 overall in the 1973 NFL Draft.", "giveaway", "career-path", 8),
    cfbBatch2Clue("hannah-number", "I wore No. 73 while playing offensive guard at Alabama.", "helpful", "identity", 20),
    cfbBatch2Clue("hannah-bryant", "Bear Bryant described me as the finest offensive lineman he had ever been around.", "strong", "relationships", 18),
  ]],
  ["cfb-orlando-pace", [
    cfbBatch2Clue("pace-lombardi", "I won the Lombardi Award twice at Ohio State, becoming its first sophomore winner and first two-time winner.", "giveaway", "accomplishments", 8),
    cfbBatch2Clue("pace-outland", "I won the 1996 Outland Trophy as the nation's top interior lineman.", "strong", "accomplishments", 16),
    cfbBatch2Clue("pace-heisman-fourth", "As an offensive tackle, I finished fourth in the 1996 Heisman Trophy voting.", "giveaway", "accomplishments", 9),
    cfbBatch2Clue("pace-two-aa", "I was a first-team All-American at Ohio State in both 1995 and 1996.", "helpful", "accomplishments", 17),
    cfbBatch2Clue("pace-big-ten-mvp", "I was named the Big Ten's most valuable player in 1996 as an offensive tackle.", "helpful", "accomplishments", 18),
    cfbBatch2Clue("pace-pancakes", "My junior year became famous for the pancake block, with Ohio State crediting me with 80 of them.", "helpful", "style", 20),
    cfbBatch2Clue("pace-no-sacks", "I did not allow a sack in either of my final two Ohio State seasons.", "helpful", "style", 22),
  ]],
  ["cfb-darren-sproles", [
    cfbBatch2Clue("sproles-2003-aa", "I was a first-team All-American in 2003 as Kansas State won the Big 12 championship.", "strong", "accomplishments", 18),
    cfbBatch2Clue("sproles-records", "I left Kansas State holding the program's career, single-season and single-game rushing records.", "strong", "accomplishments", 20),
  ]],
  ["cfb-desmond-howard", [
    cfbBatch2Clue("howard-maxwell-walter-camp", "Along with the 1991 Heisman Trophy, I won the Maxwell Award and Walter Camp Player of the Year.", "strong", "accomplishments", 15),
    cfbBatch2Clue("howard-big-ten-scoring", "In 1991 I became the first receiver to lead the Big Ten in scoring.", "strong", "accomplishments", 19),
  ]],
  ["cfb-desean-jackson", [
    cfbBatch2Clue("jackson-return-aa", "I was a first-team All-American punt returner in 2006 after leading the nation at 18.2 yards per return.", "helpful", "accomplishments", 17),
    cfbBatch2Clue("jackson-randy-moss", "I won the inaugural Randy Moss Award as the nation's top return specialist in 2006.", "strong", "accomplishments", 18),
    cfbBatch2Clue("jackson-four-pr-td", "I returned four punts for touchdowns in 2006, setting Cal and Pac-10 single-season records.", "helpful", "production", 20),
    cfbBatch2Clue("jackson-two-time-aa", "My two first-team All-America selections came in different roles: returner in 2006 and all-purpose player in 2007.", "helpful", "style", 19),
    cfbBatch2Clue("jackson-2005-bowl", "As a freshman in the 2005 Las Vegas Bowl, I caught six passes for 130 yards and two touchdowns against BYU.", "helpful", "production", 23),
    cfbBatch2Clue("jackson-first-touch", "My first college reception was a 31-yard touchdown, and my first punt return in that same opener went 49 yards for another score.", "helpful", "style", 21),
  ]],
  ["cfb-jordan-shipley", [
    cfbBatch2Clue("shipley-2009-aa", "I was a consensus first-team All-American and Biletnikoff Award finalist in 2009.", "strong", "accomplishments", 16),
    cfbBatch2Clue("shipley-2009-records", "In 2009 I set Texas single-season records with 116 receptions and 1,485 receiving yards.", "helpful", "production", 20),
    cfbBatch2Clue("shipley-title-game", "In the national championship game after the 2009 season, I caught 10 passes for 122 yards and two touchdowns against Alabama.", "helpful", "accomplishments", 18),
  ]],
  ["cfb-tim-brown", [
    cfbBatch2Clue("brown-heisman-receiver", "I won the 1987 Heisman Trophy as a receiver and return specialist at Notre Dame.", "giveaway", "accomplishments", 7),
    cfbBatch2Clue("brown-msu-returns", "Against Michigan State in 1987, I returned consecutive punts 66 and 71 yards for touchdowns.", "helpful", "accomplishments", 17),
    cfbBatch2Clue("brown-1986-all-purpose", "As a junior in 1986, I set a Notre Dame single-season record with 1,937 all-purpose yards.", "helpful", "production", 22),
    cfbBatch2Clue("brown-six-return-td", "Across my Notre Dame career, I scored six return touchdowns: three on punts and three on kickoffs.", "helpful", "style", 20),
  ]],
  ["cfb-dwayne-allen", [
    cfbBatch2Clue("allen-consensus-aa", "I was a consensus first-team All-American in 2011.", "strong", "accomplishments", 16),
    cfbBatch2Clue("allen-acc-title", "I caught two touchdown passes in Clemson's 2011 ACC Championship Game victory over Virginia Tech.", "strong", "accomplishments", 18),
    cfbBatch2Clue("allen-mackey", "I became Clemson's first John Mackey Award winner in 2011.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-heath-miller", [
    cfbBatch2Clue("miller-unanimous-aa", "I was a unanimous All-American at Virginia in 2004.", "strong", "accomplishments", 16),
    cfbBatch2Clue("miller-acc-td-record", "I finished my Virginia career with 20 touchdown catches, then the ACC record for a tight end.", "helpful", "accomplishments", 19),
  ]],
  ["cfb-chase-coffman", [
    cfbBatch2Clue("coffman-hurdle-style", "I became known for hurdling defenders when they dove at my legs, a move that became a signature part of my game.", "strong", "style", 17),
  ]],
  ["cfb-keith-jackson", [
    cfbBatch2Clue("jackson-two-consensus-aa", "I was a consensus All-American at Oklahoma in both 1986 and 1987.", "strong", "accomplishments", 15),
  ]],
  ["cfb-hunter-henry", [
    cfbBatch2Clue("henry-fourth-25", "On fourth-and-25 in overtime at Ole Miss in 2015, I threw the blind backward lateral that kept Arkansas' winning drive alive.", "giveaway", "accomplishments", 8),
    cfbBatch2Clue("henry-mackey", "I won the 2015 John Mackey Award as the nation's top tight end.", "giveaway", "accomplishments", 7),
    cfbBatch2Clue("henry-career-line", "From 2013 through 2015 at Arkansas, I caught 116 passes for 1,661 yards and nine touchdowns.", "helpful", "production", 18),
    cfbBatch2Clue("henry-consensus-aa", "I was a consensus first-team All-American in 2015.", "helpful", "accomplishments", 16),
  ]],
  ["cfb-kellen-winslow-ii", [
    cfbBatch2Clue("winslow-consensus-aa", "I was a consensus first-team All-American and unanimous first-team All-Big East selection in 2003.", "helpful", "accomplishments", 16),
    cfbBatch2Clue("winslow-fiesta", "In the 2002 season's national championship game, I caught 11 passes for 122 yards and a touchdown against Ohio State.", "helpful", "accomplishments", 18),
    cfbBatch2Clue("winslow-mackey", "I won the 2003 John Mackey Award as the nation's top tight end.", "giveaway", "accomplishments", 8),
  ]],
  ["cfb-barrett-jones", [
    cfbBatch2Clue("jones-two-position-awards", "I won the Outland Trophy as a left tackle in 2011 and the Rimington Trophy as a center in 2012.", "giveaway", "accomplishments", 8),
    cfbBatch2Clue("jones-title-positions", "I started on three Alabama national-title teams while playing right guard, left tackle and center.", "helpful", "identity", 17),
  ]],
  ["cfb-ezekiel-elliott", [
    cfbBatch2Clue("elliott-career-yards", "I left Ohio State with 3,961 career rushing yards, the second-most in program history at the time.", "strong", "accomplishments", 18),
    cfbBatch2Clue("elliott-postseason-run", "During Ohio State's 2014 championship postseason, I rushed for 696 yards and eight touchdowns across the Big Ten title game, Sugar Bowl and national championship game.", "giveaway", "accomplishments", 8),
    cfbBatch2Clue("elliott-2015-big-ten", "I was the Big Ten Offensive Player of the Year and Running Back of the Year in 2015.", "strong", "accomplishments", 17),
  ]],
  ["cfb-amari-cooper", [
    cfbBatch2Clue("cooper-career-line", "Across three Alabama seasons from 2012 through 2014, I caught 228 passes for 3,463 yards and 31 touchdowns.", "helpful", "production", 18),
    cfbBatch2Clue("cooper-biletnikoff", "I won the 2014 Biletnikoff Award and finished third in Heisman Trophy voting.", "giveaway", "accomplishments", 8),
    cfbBatch2Clue("cooper-2014-honors", "I was a unanimous first-team All-American and SEC Offensive Player of the Year in 2014.", "helpful", "accomplishments", 16),
    cfbBatch2Clue("cooper-fourth-pick", "I became the No. 4 overall pick in the 2015 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-jake-butt", [
    cfbBatch2Clue("butt-career-records", "I finished Michigan with tight-end program records of 138 receptions and 1,646 receiving yards.", "helpful", "accomplishments", 18),
    cfbBatch2Clue("butt-mackey", "I won the 2016 John Mackey Award as the nation's top tight end.", "giveaway", "accomplishments", 8),
    cfbBatch2Clue("butt-two-time-aa", "I was an All-American in both 2015 and 2016 and won Big Ten Tight End of the Year twice.", "strong", "accomplishments", 16),
    cfbBatch2Clue("butt-career-td", "I caught 11 touchdown passes during my four-year Michigan career.", "helpful", "production", 21),
  ]],
]);

function cfbBatch2ApplyOverride(subjectId: string, clue: WhoAmIClue) {
  const override = cfbBatch2IdentityOverrides.get(subjectId + ":" + (clue.conceptId ?? clue.id));
  return override ? { ...clue, ...override } : clue;
}

function isCfbBatch2NflStageLeak(clue: WhoAmIClue) {
  if (!clue.identityKnowledge) return false;
  const text = clue.text.toLowerCase();
  return (
    /\bnfl\b|super bowl|all-pro|pro bowl|nfl mvp|nfl defensive player of the year|professional football hall of fame/.test(text)
    && !/draft|selected|pick/.test(text)
  );
}

function shouldSuppressCfbBatch2Clue(subject: FootballSubjectProfile, clue: WhoAmIClue) {
  if (cfbBatch2StructuralClueIds.has(clue.id)) return true;
  if (cfbBatch2PartialCareerMetricSubjectIds.has(subject.id) && /^fact:cfb-career-/.test(clue.id)) return true;
  if (cfbBatch2GenericMetricIds.has(clue.id)) return true;
  if (clue.conceptId && cfbBatch2GenericIdentityConcepts.has(clue.conceptId)) return true;
  if (clue.conceptId && cfbBatch2SuppressedIdentityConcepts.has(clue.conceptId)) return true;
  if (isCfbBatch2NflStageLeak(clue)) return true;
  if (clue.identityKnowledge && cfbBatch2MalformedFirstPerson.test(clue.text)) return true;
  if (
    subject.id === "cfb-kellen-winslow-ii"
    && /\bWinslow\b/i.test(clue.text)
    && !cfbBatch2IdentityOverrides.has(subject.id + ":" + (clue.conceptId ?? clue.id))
  ) return true;
  return false;
}

function trimCfbBatch2Pool(subject: FootballSubjectProfile, clues: readonly WhoAmIClue[]) {
  const target = 16;
  if (clues.length <= target) return [...clues];

  const requiredIds = new Set(["position", "school"]);
  const required = clues.filter((clue) => requiredIds.has(clue.id));
  const requiredIdSet = new Set(required.map((clue) => clue.id));
  const ranked = clues
    .map((clue, index) => ({ clue, index, score: clueQualityScore(subject, clue) }))
    .filter((entry) => !requiredIdSet.has(entry.clue.id))
    .sort((left, right) => right.score - left.score || left.index - right.index);

  const selected = new Set(required.map((clue) => clue.id));
  const selectedConcepts = new Set(required.map((clue) => clue.conceptId ?? clue.id));
  for (const entry of ranked) {
    if (selected.size >= target) break;
    const concept = entry.clue.conceptId ?? entry.clue.id;
    if (selectedConcepts.has(concept)) continue;
    selected.add(entry.clue.id);
    selectedConcepts.add(concept);
  }
  if (selected.size < target) {
    for (const entry of ranked) {
      if (selected.size >= target) break;
      selected.add(entry.clue.id);
    }
  }
  return clues.filter((clue) => selected.has(clue.id));
}

function curateCfbBatch2Clues(subject: FootballSubjectProfile, rawClues: readonly WhoAmIClue[]) {
  let colorUsed = false;
  let relationshipUsed = false;
  const curated: WhoAmIClue[] = [];

  for (const rawClue of rawClues) {
    const clue = cfbBatch2ApplyOverride(subject.id, rawClue);
    if (shouldSuppressCfbBatch2Clue(subject, clue)) continue;

    if (clue.identityKnowledge) {
      const selectionClass = whoAmIClueSelectionClass(clue);
      if (selectionClass === "deep-biography") continue;
      if (selectionClass === "identity-color") {
        if (colorUsed) continue;
        colorUsed = true;
      }
      if (whoAmIClueFacet(clue) === "relationships") {
        if (relationshipUsed) continue;
        relationshipUsed = true;
      }
    }
    curated.push(clue);
  }

  curated.push(...(cfbBatch2SupplementalClues.get(subject.id) ?? []));
  return trimCfbBatch2Pool(subject, curated);
}

export function isCfbWhoAmIBatch2Subject(subjectId: string) {
  return cfbBatch2SubjectIds.has(subjectId);
}


export const CFB_WHO_AM_I_BATCH_3_SUBJECT_IDS = [
  "cfb-brandon-scherff",
  "cfb-bryant-mckinnie",
  "cfb-dbrickashaw-ferguson",
  "cfb-david-decastro",
  "cfb-jake-long",
  "cfb-jake-matthews",
  "cfb-joe-alt",
  "cfb-joe-thomas",
  "cfb-aaron-donald",
  "cfb-bruce-smith",
  "cfb-chase-young",
  "cfb-jadeveon-clowney",
  "cfb-lee-roy-selmon",
  "cfb-myles-garrett",
  "cfb-ndamukong-suh",
  "cfb-will-anderson-jr",
  "cfb-abdul-carter",
  "cfb-aidan-hutchinson",
  "cfb-brian-orakpo",
  "cfb-chris-long",
  "cfb-david-pollack",
  "cfb-dwight-freeney",
  "cfb-gerald-mccoy",
  "cfb-glenn-dorsey",
  "cfb-haloti-ngata",
  "cfb-jj-watt",
  "cfb-jalen-carter",
  "cfb-joey-bosa",
  "cfb-john-henderson",
  "cfb-jonathan-allen",
  "cfb-julius-peppers",
  "cfb-kayvon-thibodeaux",
  "cfb-derrick-thomas",
  "cfb-luke-kuechly",
  "cfb-manti-teo",
  "cfb-roquan-smith",
  "cfb-von-miller",
  "cfb-aj-hawk",
  "cfb-brian-urlacher",
  "cfb-cj-mosley",
  "cfb-dan-morgan",
  "cfb-derrick-johnson",
  "cfb-devin-white",
  "cfb-isaiah-simmons",
  "cfb-james-laurinaitis",
  "cfb-jaylon-smith",
  "cfb-khalil-mack",
  "cfb-micah-parsons",
  "cfb-nakobe-dean",
  "cfb-patrick-willis",
] as const;

const cfbBatch3SubjectIds = new Set<string>(CFB_WHO_AM_I_BATCH_3_SUBJECT_IDS);
const cfbBatch3StructuralClueIds = new Set(["player-career-start", "player-career-end", "career-span"]);
const cfbBatch3GenericMetricIds = new Set([
  "fact:cfb-career-games",
  "fact:cfb-career-starts",
  "fact:cfb-career-targets",
  "fact:cfb-career-passing-completions",
  "fact:cfb-career-passing-attempts",
  "fact:cfb-career-rushing-attempts",
  "fact:cfb-career-interceptions-thrown",
]);
const cfbBatch3GenericIdentityConcepts = new Set([
  "identity:career-games",
  "identity:career-starts",
  "identity:career-games-starts",
  "identity:career-passing-completions",
  "identity:career-passing-attempts",
  "identity:career-rushing-attempts",
  "identity:career-targets",
  "identity:career-interceptions-thrown",
]);

const cfbBatch3SuppressedMetricClueIds = new Map<string, ReadonlySet<string>>([
  ["cfb-chase-young", new Set(["fact:cfb-career-sacks", "fact:cfb-career-forced-fumbles", "fact:cfb-best-season-sacks"])],
  ["cfb-myles-garrett", new Set(["fact:cfb-career-sacks", "fact:cfb-best-season-sacks", "fact:cfb-career-forced-fumbles", "fact:cfb-career-defensive-interceptions", "fact:cfb-best-season-defensive-interceptions"])],
  ["cfb-will-anderson-jr", new Set(["fact:cfb-career-sacks", "fact:cfb-career-defensive-interceptions", "fact:cfb-best-season-defensive-interceptions"])],
  ["cfb-abdul-carter", new Set(["fact:cfb-career-sacks", "fact:cfb-best-season-sacks"])],
  ["cfb-aidan-hutchinson", new Set(["fact:cfb-career-sacks", "fact:cfb-best-season-sacks"])],
  ["cfb-kayvon-thibodeaux", new Set(["fact:cfb-career-sacks", "fact:cfb-best-season-sacks"])],
  ["cfb-jalen-carter", new Set(["fact:cfb-career-sacks"])],
  ["cfb-joey-bosa", new Set(["fact:cfb-career-sacks"])],
  ["cfb-jonathan-allen", new Set(["fact:cfb-career-sacks", "fact:cfb-career-forced-fumbles", "fact:cfb-best-season-sacks"])],
  ["cfb-roquan-smith", new Set(["fact:cfb-career-sacks", "fact:cfb-best-season-sacks", "fact:cfb-career-pass-breakups"])],
  ["cfb-devin-white", new Set(["fact:cfb-career-sacks", "fact:cfb-best-season-sacks", "fact:cfb-career-defensive-interceptions", "fact:cfb-best-season-defensive-interceptions"])],
  ["cfb-isaiah-simmons", new Set(["fact:cfb-career-sacks", "fact:cfb-best-season-sacks", "fact:cfb-career-defensive-interceptions", "fact:cfb-best-season-defensive-interceptions"])],
  ["cfb-micah-parsons", new Set(["fact:cfb-career-sacks", "fact:cfb-best-season-sacks"])],
  ["cfb-nakobe-dean", new Set(["fact:cfb-career-defensive-interceptions", "fact:cfb-best-season-defensive-interceptions"])],
]);

const cfbBatch3SuppressedIdentityConcepts = new Set([
  "identity:cfb-dbrickashaw-ferguson--thorn-birds-name-origin",
  "identity:cfb-dbrickashaw-ferguson--religious-studies-degree-early",
  "identity:cfb-david-decastro--south-african-rugby-family",
  "identity:cfb-david-decastro--mother-delayed-football-start",
  "identity:cfb-david-decastro--management-science-engineering-major",
  "identity:cfb-jake-long--whole-school-leadership-reputation",
  "identity:cfb-jake-long--survived-house-fire",
  "identity:cfb-jake-matthews--bruce-matthews-son",
  "identity:cfb-jake-matthews--fell-for-am-on-kevin-visits",
  "identity:cfb-jake-matthews--elkins-line-with-brother-mike",
  "identity:cfb-jake-matthews--four-brothers-aggies",
  "identity:consecutive-starts",
  "identity:cfb-joe-alt--brother-mark-hockey",
  "identity:cfb-joe-alt--mechanical-engineering",
  "identity:cfb-aaron-donald--basement-workout-origin",
  "identity:cfb-aaron-donald--pitt-return-and-gift",
  "identity:bruce-smith-reluctant-football-father-no-quit",
  "identity:cfb-chase-young--father-accountability",
  "identity:cfb-chase-young--ian-thomas-mentor",
  "identity:mother-frito-lay-motivation",
  "identity:doo-doo-nickname-origin",
  "identity:youngest-of-nine-farm",
  "identity:college-community-service",
  "identity:built-usf-football-program",
  "identity:myles-garrett-paleontology-dinosaur-interest",
  "identity:myles-garrett-poetry-maya-angelou",
  "identity:myles-garrett-athletic-family-brea-aandm-link",
  "identity:cfb-ndamukong-suh--house-of-spears-name",
  "identity:cfb-ndamukong-suh--mother-pushed-degree-return",
  "identity:cfb-will-anderson-jr--youngest-with-five-sisters",
  "identity:cfb-will-anderson-jr--father-provoked-competitive-edge",
  "identity:cfb-abdul-carter--father-bloomsburg-defender",
  "identity:cfb-abdul-carter--deion-barnes-same-street",
  "identity:cfb-aidan-hutchinson--whole-family-michigan-tie",
  "identity:cfb-brian-orakpo--parents-nigerian-immigrants",
  "identity:cfb-david-pollack--family-faith",
  "identity:cfb-kayvon-thibodeaux--wants-to-start-school",
  "identity:cfb-dwight-freeney--mother-track-background",
  "identity:cfb-gerald-mccoy--mother-died-senior-year",
  "identity:cfb-glenn-dorsey--family-katrina",
  "identity:cfb-haloti-ngata--parents-died-young",
  "identity:cfb-jj-watt--family-sports",
  "identity:cfb-jalen-carter--family-background",
  "identity:cfb-joey-bosa--bosa-football-family",
  "identity:cfb-john-henderson--family-hardship",
  "identity:cfb-jonathan-allen--military-family",
  "identity:cfb-julius-peppers--family-background",
  "identity:cfb-derrick-thomas--father-killed-vietnam",
  "identity:cfb-luke-kuechly--family-athletes",
  "identity:cfb-manti-teo--hawaiian-elder-respect-leadership",
  "identity:cfb-manti-teo--declan-sullivan-response",
  "identity:cfb-manti-teo--catfishing-hoax",
  "identity:cfb-manti-teo--eagle-scout-service",
  "identity:montezuma-rural-roots",
  "identity:montezuma-youth-camp",
  "identity:michael-phelps-swim-training",
  "identity:region-title-running-back-switch",
  "identity:ucla-signing-day-reversal",
  "identity:von-miller-returned-senior-degree-family",
  "identity:von-miller-poultry-science-chicken-farming",
  "identity:von-miller-childhood-glasses-vons-vision",
  "identity:cfb-aj-hawk--childhood-with-mike-nugent",
  "identity:cfb-aj-hawk--played-with-brother-ryan",
  "identity:cfb-aj-hawk--community-park-upbringing",
  "identity:cfb-cj-mosley--younger-brother-jamey-alabama-walkon",
  "identity:cfb-dan-morgan--miami-fan-before-hurricane",
  "identity:cfb-derrick-johnson--waco-baylor-brother-upbringing",
  "identity:cfb-derrick-johnson--brother-kept-recruitment-neutral",
  "identity:cfb-derrick-johnson--extended-college-football-family",
  "identity:cfb-derrick-johnson--waco-homesickness-and-tattoo",
  "identity:cfb-devin-white--daisy-mae-horseman",
  "identity:cfb-devin-white--rode-horse-to-final-and-stadium",
  "identity:cfb-james-laurinaitis--father-animal-road-warriors",
  "identity:cfb-jaylon-smith--older-brother-rod-smith",
  "identity:cfb-khalil-mack--competitive-multi-sport-family",
  "identity:cfb-nakobe-dean--mechanical-engineering-major",
  "identity:cfb-nakobe-dean--returned-to-finish-degree",
  "identity:cfb-nakobe-dean--brother-nikolas-ole-miss",
  "identity:cfb-patrick-willis--worked-young-to-help-family",
  "identity:cfb-patrick-willis--moved-with-siblings-to-coach",
  "identity:pitt-giving-back",
  "identity:cfb-jj-watt--foundation-started-in-college",
  "identity:cfb-derrick-thomas--third-and-long-literacy",
  "identity:luke-kuechly-jesuit-boston-college-fit",
  "identity:cfb-chase-young--rose-bowl-travel-loan-suspension",
]);

const cfbBatch3MalformedFirstPerson = /\bme\s+(?:focused|collided|attended|led|entered|executed|hit|briefly|passed|produced|repeatedly|scored|announced|rebuilt|chose|went|pursued|scrambled|delivered|handled|could|asked|broke|also|gave|weighed|pledged|lost|wanted|committed|struck|learned|watched|lived|told|decided|caught|built|excelled|arrived|returned|rushed|played|won|became|had|was|is|underwent|pointed|created|helped|impressed|reportedly|shifted|redshirted|forced|participated|faced|stayed|starred|followed|mentored)\b|\bsaid\s+me\b|\bfour\s+me\s+brothers\b|\bI\s+to\s+sit\b|\bI\s+a\b|\bI\s+died\b|\bI\s+has\b|\bme\s+and\s+my\b|\bFuture\s+and\s+I\s+quarterback\b|\bWilliam\s+myself\b|\bI\s+saw\s+me\b|\bAfter\s+(?:got|left)\b|\bWhile\s+was\b|\bWhen\s+finally\s+got\b|\bthe\s+skinny\s+me\b|\bQuarterback\s+and\s+I\s+[A-Z]/i;

const cfbBatch3IdentityOverrides = new Map<string, Partial<WhoAmIClue>>([
  ["cfb-bryant-mckinnie:identity:cfb-bryant-mckinnie--lackawanna-juco-conversion", {
    text: "I moved from defensive end to offensive line at Lackawanna Junior College before transferring to Miami.",
    band: "strong",
    facet: "career-path",
    revealPriority: 20,
  }],
  ["cfb-bryant-mckinnie:identity:cfb-bryant-mckinnie--no-sacks-at-miami", {
    text: "Miami credits me with not allowing a sack at left tackle during my two seasons with the Hurricanes.",
    band: "strong",
    facet: "style",
    revealPriority: 18,
  }],
  ["cfb-jadeveon-clowney:identity:outback-bowl-the-hit", {
    text: "In the 2013 Outback Bowl against Michigan, I blasted Vincent Smith, forced a fumble and recovered it on the play remembered simply as 'The Hit.'",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 7,
  }],
  ["cfb-brian-urlacher:identity:cfb-brian-urlacher--lobo-hybrid-position", {
    text: "At New Mexico, I played the hybrid 'Lobo' role, blending middle-linebacker and free-safety responsibilities.",
    band: "giveaway",
    facet: "role",
    revealPriority: 9,
  }],
  ["cfb-dan-morgan:identity:cfb-dan-morgan--first-defensive-award-triple-sweep", {
    text: "In 2000 I became the first player to win the Bednarik, Butkus and Nagurski awards in the same season.",
    band: "giveaway",
    facet: "accomplishments",
    revealPriority: 8,
  }],
  ["cfb-khalil-mack:identity:cfb-khalil-mack--number-46-video-game-motivation", {
    text: "I kept No. 46 at Buffalo partly because I remembered being rated 46 overall in the NCAA football video game and used it as motivation.",
    band: "strong",
    facet: "identity",
    revealPriority: 18,
  }],
  ["cfb-brandon-scherff:identity:cfb-brandon-scherff--quarterback-to-two-way-line", {
    text: "After my sophomore quarterback season, I shifted to offensive and defensive line for my final two high-school seasons before Iowa recruited me as a lineman.",
  }],
  ["cfb-jake-matthews:identity:cfb-jake-matthews--four-brothers-aggies", {
    text: "I was one of four brothers who played football at Texas A&M.",
  }],
  ["cfb-joe-thomas:identity:cfb-joe-thomas--three-sport-high-school-captain", {
    text: "In high school I participated in football, basketball and track, and captained both the football and basketball teams.",
  }],
  ["cfb-aidan-hutchinson:identity:cfb-aidan-hutchinson--michigan-legacy-no-97", {
    text: "My father Chris was a Michigan captain and team MVP, and I followed him to Michigan wearing the same No. 97.",
  }],
  ["cfb-gerald-mccoy:identity:cfb-gerald-mccoy--elite-recruit-redshirted", {
    text: "Despite arriving as one of the nation's most celebrated defensive recruits, I redshirted in 2006.",
  }],
  ["cfb-glenn-dorsey:identity:cfb-glenn-dorsey--band-or-football-choice", {
    text: "At East Ascension High School, I participated in both band and football until overlapping practice schedules forced me to choose football.",
  }],
  ["cfb-glenn-dorsey:identity:cfb-glenn-dorsey--first-college-snap-forced-fumble", {
    text: "On the first collegiate snap of my LSU career, I forced a fumble against Oregon State.",
  }],
  ["cfb-derrick-thomas:identity:cfb-derrick-thomas--kentucky-leadership-moment", {
    text: "During Alabama's 1988 game with Kentucky, I challenged teammates not to accept losing and then produced impact plays on defense and special teams as the Tide rallied.",
  }],
  ["cfb-aj-hawk:identity:cfb-aj-hawk--quinn-fiesta-family-rivalry", {
    text: "In the 2006 Fiesta Bowl, I faced Notre Dame quarterback Brady Quinn while dating Quinn's sister Laura.",
  }],
  ["cfb-cj-mosley:identity:cfb-cj-mosley--chose-alabama-over-national-offers", {
    text: "Despite offers from programs including Auburn, Florida State, Georgia, Stanford, Oklahoma and LSU, I stayed in-state for Alabama.",
  }],
  ["cfb-cj-mosley:identity:cfb-cj-mosley--mentored-reggie-ragland", {
    text: "Reggie Ragland, who succeeded me at Alabama, said I mentored him, taught him about leadership and was the smartest player he had played with.",
  }],
  ["cfb-jaylon-smith:identity:cfb-jaylon-smith--high-school-running-back-linebacker", {
    text: "At Bishop Luers, I starred on both sides of the ball as a running back and linebacker.",
  }],
]);

function cfbBatch3Clue(
  id: string,
  text: string,
  band: WhoAmIClue["band"] = "strong",
  facet: WhoAmIClue["facet"] = "accomplishments",
  revealPriority = 14,
): WhoAmIClue {
  return { id: "curated-cfb3:" + id, conceptId: "curated-cfb3:" + id, text, band, facet, revealPriority };
}

const cfbBatch3SupplementalClues = new Map<string, readonly WhoAmIClue[]>([
  ["cfb-dbrickashaw-ferguson", [
    cfbBatch3Clue("ferguson-49-starts", "I started all 49 games I played at Virginia, a school record for an offensive lineman.", "helpful", "production", 22),
    cfbBatch3Clue("ferguson-jersey-retired", "Virginia retired my jersey after a career that included first-team All-America honors in 2005.", "strong", "identity", 17),
  ]],
  ["cfb-david-decastro", [
    cfbBatch3Clue("decastro-39-right-guard", "I started all 39 games of my Stanford career at right guard.", "helpful", "production", 22),
    cfbBatch3Clue("decastro-outland-finalist", "I was a finalist for the 2011 Outland Trophy while earning unanimous All-America honors.", "strong", "accomplishments", 17),
    cfbBatch3Clue("decastro-line-protection", "During my three seasons as a starter, Stanford's offensive line allowed only 24 sacks.", "helpful", "style", 24),
  ]],
  ["cfb-jake-long", [
    cfbBatch3Clue("long-40-starts", "I started 40 games at Michigan.", "helpful", "production", 23),
    cfbBatch3Clue("long-two-time-captain", "My Michigan teammates elected me a team captain twice.", "helpful", "identity", 21),
  ]],
  ["cfb-jake-matthews", [
    cfbBatch3Clue("matthews-manziel-line", "As a junior in 2012, I helped block for freshman Heisman Trophy winner Johnny Manziel.", "helpful", "production", 20),
    cfbBatch3Clue("matthews-outland-finalist", "I was an Outland Trophy finalist as a Texas A&M senior in 2013.", "strong", "accomplishments", 17),
    cfbBatch3Clue("matthews-sixth-pick", "Atlanta selected me No. 6 overall in the 2014 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-joe-alt", [
    cfbBatch3Clue("alt-two-time-aa", "I earned first-team All-America recognition in each of my final two Notre Dame seasons.", "strong", "accomplishments", 18),
    cfbBatch3Clue("alt-fifth-pick", "The Chargers selected me No. 5 overall in the 2024 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-joe-thomas", [
    cfbBatch3Clue("thomas-captain-comvp", "I was a Wisconsin team captain and co-MVP as a senior in 2006.", "helpful", "identity", 20),
    cfbBatch3Clue("thomas-two-aa", "I earned first-team All-America honors in both 2005 and 2006.", "strong", "accomplishments", 18),
    cfbBatch3Clue("thomas-third-pick", "Cleveland selected me No. 3 overall in the 2007 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-aaron-donald", [
    { ...cfbBatch3Clue("donald-morning-workouts", "My father introduced me to disciplined early-morning weight training while I was young, a habit that became central to my football development.", "helpful", "style", 22), conceptId: "identity:father-morning-workouts" },
    cfbBatch3Clue("donald-award-sweep", "In 2013 I won the Nagurski, Bednarik, Outland and Lombardi awards at Pitt.", "giveaway", "accomplishments", 7),
    cfbBatch3Clue("donald-66-tfl", "I finished my Pitt career with 66 tackles for loss, an extraordinary total for an interior defensive lineman.", "helpful", "production", 20),
    cfbBatch3Clue("donald-97-retired", "Pitt later retired the No. 97 jersey I wore for the Panthers.", "strong", "identity", 16),
  ]],
  ["cfb-bruce-smith", [
    cfbBatch3Clue("smith-outland", "I won the Outland Trophy as college football's top interior lineman.", "giveaway", "accomplishments", 8),
    cfbBatch3Clue("smith-46-sacks", "I recorded 46 sacks during my college career.", "helpful", "production", 20),
    cfbBatch3Clue("smith-two-aa", "I was a two-time All-American in college.", "strong", "accomplishments", 17),
    cfbBatch3Clue("smith-first-pick", "Buffalo selected me No. 1 overall in the 1985 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-chase-young", [
    cfbBatch3Clue("young-16-5", "I led the nation with 16.5 sacks for Ohio State in 2019.", "helpful", "accomplishments", 19),
    cfbBatch3Clue("young-award-sweep", "In 2019 I won the Nagurski Trophy, Bednarik Award and Ted Hendricks Award.", "giveaway", "accomplishments", 7),
    cfbBatch3Clue("young-big-ten-dpoy", "I was the Big Ten Defensive Player of the Year and Defensive Lineman of the Year in 2019.", "strong", "accomplishments", 15),
    cfbBatch3Clue("young-heisman-finalist", "I became a Heisman Trophy finalist as a defensive end in 2019.", "strong", "accomplishments", 13),
    cfbBatch3Clue("young-second-pick", "Washington selected me No. 2 overall in the 2020 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-jadeveon-clowney", [
    cfbBatch3Clue("clowney-hendricks", "I won the 2012 Ted Hendricks Award as the nation's top defensive end.", "strong", "accomplishments", 16),
    cfbBatch3Clue("clowney-sec-dpoy", "I was the SEC Defensive Player of the Year in 2012.", "strong", "accomplishments", 17),
    cfbBatch3Clue("clowney-first-pick", "Houston selected me No. 1 overall in the 2014 NFL Draft.", "giveaway", "career-path", 8),
  ]],
  ["cfb-lee-roy-selmon", [
    cfbBatch3Clue("selmon-32-1-1", "Oklahoma went 32-1-1 during my three seasons as a starting defensive lineman.", "helpful", "accomplishments", 22),
    cfbBatch3Clue("selmon-hall", "I entered the College Football Hall of Fame in 1988.", "strong", "accomplishments", 18),
    cfbBatch3Clue("selmon-93", "I wore No. 93 on Oklahoma's defensive line.", "helpful", "identity", 20),
    cfbBatch3Clue("selmon-1975-aa", "I finished my Oklahoma career as one of the nation's most decorated linemen in 1975.", "strong", "identity", 19),
    cfbBatch3Clue("selmon-award-double", "I won both the Outland Trophy and Lombardi Award in my final college season.", "strong", "accomplishments", 17),
  ]],
  ["cfb-ndamukong-suh", [
    cfbBatch3Clue("suh-award-sweep", "In 2009 I swept the Outland, Lombardi, Bednarik and Nagurski awards.", "giveaway", "accomplishments", 7),
    cfbBatch3Clue("suh-heisman-fourth", "I finished fourth in the 2009 Heisman Trophy voting as a defensive tackle.", "giveaway", "accomplishments", 9),
    cfbBatch3Clue("suh-title-game", "I had 4.5 sacks and seven tackles for loss against Texas in the 2009 Big 12 Championship Game.", "giveaway", "accomplishments", 8),
    cfbBatch3Clue("suh-215-tackles", "I finished my Nebraska career with 215 tackles and 57 tackles for loss.", "helpful", "production", 21),
    cfbBatch3Clue("suh-second-pick", "Detroit selected me No. 2 overall in the 2010 NFL Draft.", "giveaway", "career-path", 10),
  ]],
  ["cfb-will-anderson-jr", [
    cfbBatch3Clue("anderson-career-sacks", "I left Alabama with 34.5 career sacks, second in program history behind Derrick Thomas.", "helpful", "production", 19),
    cfbBatch3Clue("anderson-two-nagurski", "I won the Bronko Nagurski Trophy in both 2021 and 2022.", "giveaway", "accomplishments", 8),
    cfbBatch3Clue("anderson-two-sec-dpoy", "I was the SEC Defensive Player of the Year in both 2021 and 2022.", "strong", "accomplishments", 16),
    cfbBatch3Clue("anderson-two-unanimous-aa", "I became Alabama's first two-time unanimous All-American.", "strong", "accomplishments", 15),
    cfbBatch3Clue("anderson-third-pick", "Houston selected me No. 3 overall in the 2023 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-abdul-carter", [
    cfbBatch3Clue("carter-career-sacks", "I finished my Penn State career with 23 sacks and 39.5 tackles for loss.", "helpful", "production", 20),
    cfbBatch3Clue("carter-big-ten-dpoy", "I was the Big Ten Defensive Player of the Year and Defensive Lineman of the Year in 2024.", "strong", "accomplishments", 15),
    cfbBatch3Clue("carter-unanimous-aa", "I became Penn State's first unanimous consensus All-American since Saquon Barkley.", "strong", "accomplishments", 17),
  ]],
  ["cfb-aidan-hutchinson", [
    cfbBatch3Clue("hutchinson-14-sacks", "I set Michigan's single-season sack record with 14 in 2021.", "helpful", "production", 19),
    cfbBatch3Clue("hutchinson-big-ten-dpoy", "I was the Big Ten Defensive Player of the Year in 2021.", "strong", "accomplishments", 16),
    cfbBatch3Clue("hutchinson-consensus-aa", "I was a consensus first-team All-American in 2021.", "strong", "accomplishments", 18),
  ]],
  ["cfb-chris-long", [
    cfbBatch3Clue("long-acc-dpoy", "I was the ACC Defensive Player of the Year in 2007.", "strong", "accomplishments", 15),
    cfbBatch3Clue("long-unanimous-aa", "I became a unanimous All-American at Virginia in 2007.", "strong", "accomplishments", 17),
    cfbBatch3Clue("long-second-pick", "St. Louis selected me No. 2 overall in the 2008 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-kayvon-thibodeaux", [
    cfbBatch3Clue("thibodeaux-freshman-dpoy", "I was the Pac-12 Freshman Defensive Player of the Year in 2019.", "strong", "accomplishments", 17),
    cfbBatch3Clue("thibodeaux-morris", "I won the 2020 Morris Trophy as the Pac-12's top defensive lineman.", "strong", "accomplishments", 16),
    cfbBatch3Clue("thibodeaux-title-mvp", "I was MVP of the 2020 Pac-12 Championship Game after helping Oregon beat USC.", "giveaway", "accomplishments", 9),
    cfbBatch3Clue("thibodeaux-two-year-sacks", "Across my first two Oregon seasons, I totaled 12 sacks and 23.5 tackles for loss.", "helpful", "production", 20),
  ]],
  ["cfb-jj-watt", [
    cfbBatch3Clue("watt-2010-all-big-ten", "I earned first-team All-Big Ten honors at Wisconsin in 2010.", "strong", "accomplishments", 18),
    cfbBatch3Clue("watt-2010-production", "In my final Wisconsin season, I recorded 21 tackles for loss and seven sacks.", "helpful", "production", 20),
    cfbBatch3Clue("watt-11th-pick", "Houston selected me No. 11 overall in the 2011 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-jalen-carter", [
    cfbBatch3Clue("carter-two-titles", "I was part of Georgia's back-to-back national championship teams in 2021 and 2022.", "giveaway", "accomplishments", 9),
    cfbBatch3Clue("carter-unanimous-aa", "I was a unanimous first-team All-American in 2022.", "strong", "accomplishments", 16),
    cfbBatch3Clue("carter-ninth-pick", "Philadelphia selected me No. 9 overall in the 2023 NFL Draft.", "giveaway", "career-path", 10),
  ]],
  ["cfb-john-henderson", [
    cfbBatch3Clue("henderson-sec-dpoy", "I was the SEC Defensive Player of the Year in 2000.", "helpful", "accomplishments", 18),
    cfbBatch3Clue("henderson-ninth-pick", "Jacksonville selected me No. 9 overall in the 2002 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-jonathan-allen", [
    cfbBatch3Clue("allen-award-sweep", "As an Alabama senior I won the Nagurski, Bednarik, Hendricks and Lombardi awards.", "giveaway", "accomplishments", 7),
    cfbBatch3Clue("allen-sec-dpoy", "I was the SEC Defensive Player of the Year in 2016.", "strong", "accomplishments", 15),
    cfbBatch3Clue("allen-28-5", "I finished my Alabama career with 28.5 sacks, second in school history at the time.", "helpful", "production", 19),
    cfbBatch3Clue("allen-national-title", "I was a starting defensive lineman on Alabama's 2015 national championship team.", "strong", "accomplishments", 18),
    cfbBatch3Clue("allen-17th-pick", "Washington selected me No. 17 overall in the 2017 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-derrick-thomas", [
    cfbBatch3Clue("thomas-27-sacks", "I recorded 27 sacks for Alabama in 1988.", "giveaway", "production", 8),
    cfbBatch3Clue("thomas-52-sacks", "I finished my Alabama career with 52 sacks and 68 tackles for loss.", "helpful", "production", 19),
    cfbBatch3Clue("thomas-butkus", "I won the 1988 Butkus Award.", "giveaway", "accomplishments", 7),
    cfbBatch3Clue("thomas-heisman-top-ten", "I finished in the top 10 of the 1988 Heisman Trophy voting.", "strong", "accomplishments", 16),
    cfbBatch3Clue("thomas-hall", "I was elected to the College Football Hall of Fame.", "strong", "accomplishments", 18),
    cfbBatch3Clue("thomas-fourth-pick", "Kansas City selected me No. 4 overall in the 1989 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-roquan-smith", [
    cfbBatch3Clue("roquan-butkus", "I won the 2017 Butkus Award as the nation's top linebacker.", "giveaway", "accomplishments", 7),
    cfbBatch3Clue("roquan-sec-dpoy", "I was the SEC Defensive Player of the Year in 2017.", "strong", "accomplishments", 15),
    cfbBatch3Clue("roquan-137", "I led Georgia with 137 tackles during the 2017 season.", "helpful", "production", 19),
    cfbBatch3Clue("roquan-sec-title", "I helped Georgia win the 2017 SEC championship and reach the national title game.", "strong", "accomplishments", 17),
    cfbBatch3Clue("roquan-eighth-pick", "Chicago selected me No. 8 overall in the 2018 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-von-miller", [
    cfbBatch3Clue("miller-second-pick", "Denver selected me No. 2 overall in the 2011 NFL Draft.", "giveaway", "career-path", 9),
    cfbBatch3Clue("miller-first-team-aa", "I was a first-team All-American during my Texas A&M career.", "strong", "accomplishments", 18),
  ]],
  ["cfb-aj-hawk", [
    cfbBatch3Clue("hawk-national-title", "I was a starting linebacker on Ohio State's 2002 national championship team.", "strong", "accomplishments", 16),
    cfbBatch3Clue("hawk-two-time-aa", "I earned first-team All-America honors in each of my final two Ohio State seasons.", "strong", "accomplishments", 18),
    cfbBatch3Clue("hawk-fifth-pick", "Green Bay selected me No. 5 overall in the 2006 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-brian-urlacher", [
    cfbBatch3Clue("urlacher-178", "I led the nation with a New Mexico school-record 178 tackles in 1998.", "helpful", "production", 19),
    cfbBatch3Clue("urlacher-mwc-poy", "I was the Mountain West Player of the Year in 1999.", "strong", "accomplishments", 15),
    cfbBatch3Clue("urlacher-consensus-aa", "I was a consensus first-team All-American in 1999 while playing free safety in New Mexico's hybrid defense.", "strong", "accomplishments", 17),
    cfbBatch3Clue("urlacher-six-rec-td", "As a senior I also caught six touchdown passes while contributing on offense.", "helpful", "style", 21),
    cfbBatch3Clue("urlacher-44", "New Mexico later honored the No. 44 jersey I wore for the Lobos.", "helpful", "identity", 20),
  ]],
  ["cfb-dan-morgan", [
    cfbBatch3Clue("morgan-512", "I left Miami as the program's career tackles leader with 512.", "helpful", "production", 19),
    cfbBatch3Clue("morgan-four-100", "I became the first Miami player with at least 100 tackles in four straight seasons.", "helpful", "accomplishments", 20),
    cfbBatch3Clue("morgan-11th-pick", "Carolina selected me No. 11 overall in the 2001 NFL Draft.", "giveaway", "career-path", 9),
  ]],
  ["cfb-derrick-johnson", [
    cfbBatch3Clue("johnson-award-double", "I won both the 2004 Butkus Award and Bronko Nagurski Trophy.", "giveaway", "accomplishments", 7),
    cfbBatch3Clue("johnson-big12-dpoy", "I was the unanimous Big 12 Defensive Player of the Year in 2004.", "strong", "accomplishments", 15),
    cfbBatch3Clue("johnson-unanimous-aa", "I was a unanimous first-team All-American in 2004.", "strong", "accomplishments", 17),
    cfbBatch3Clue("johnson-nine-fumbles", "I forced nine fumbles in 2004, tying the NCAA single-season record.", "helpful", "production", 19),
    cfbBatch3Clue("johnson-number-11", "I wore No. 11 at Texas.", "helpful", "identity", 20),
  ]],
  ["cfb-james-laurinaitis", [
    cfbBatch3Clue("laurinaitis-three-consensus-aa", "I became a three-time consensus All-American at Ohio State.", "strong", "accomplishments", 16),
    cfbBatch3Clue("laurinaitis-number-33", "I wore No. 33 at Ohio State.", "helpful", "identity", 21),
  ]],
  ["cfb-micah-parsons", [
    cfbBatch3Clue("parsons-big-ten-lb", "I was the Big Ten Linebacker of the Year as a sophomore in 2019.", "strong", "accomplishments", 16),
    cfbBatch3Clue("parsons-2019-line", "In 2019 I led Penn State with 109 tackles and added 14 tackles for loss.", "helpful", "production", 20),
    cfbBatch3Clue("parsons-cotton-mvp", "I was the defensive MVP of Penn State's 2019 Cotton Bowl win over Memphis.", "giveaway", "accomplishments", 9),
    cfbBatch3Clue("parsons-12th-pick", "Dallas selected me No. 12 overall in the 2021 NFL Draft.", "giveaway", "career-path", 10),
  ]],
  ["cfb-nakobe-dean", [
    cfbBatch3Clue("dean-butkus", "I won the 2021 Butkus Award as the nation's top linebacker.", "giveaway", "accomplishments", 7),
    cfbBatch3Clue("dean-national-title", "I was a leader of Georgia's defense on the 2021 national championship team.", "giveaway", "accomplishments", 9),
    cfbBatch3Clue("dean-unanimous-aa", "I was a unanimous All-American in 2021.", "strong", "accomplishments", 16),
    cfbBatch3Clue("dean-2021-line", "In 2021 I made 72 tackles, 10.5 tackles for loss and six sacks.", "helpful", "production", 19),
    cfbBatch3Clue("dean-pick-six", "My 2021 season included a 50-yard interception return for a touchdown against Florida.", "helpful", "accomplishments", 20),
    cfbBatch3Clue("dean-third-round", "Philadelphia selected me in the third round of the 2022 NFL Draft.", "strong", "career-path", 14),
  ]],
]);

const cfbBatch3ReplayDepthClues = new Map<string, readonly WhoAmIClue[]>([
  ["cfb-jake-matthews", [
    cfbBatch3Clue("matthews-two-all-sec", "I earned first-team All-SEC honors in both 2012 and 2013.", "strong", "accomplishments", 18),
    cfbBatch3Clue("matthews-2012-sec-offense", "In 2012 I helped a Texas A&M offense lead the SEC in rushing, passing, scoring and total offense.", "helpful", "production", 23),
    cfbBatch3Clue("matthews-deep-snapper", "In 2012 I also served as Texas A&M's deep snapper while starting at tackle.", "helpful", "role", 21),
  ]],
  ["cfb-bruce-smith", [
    cfbBatch3Clue("smith-78-retired", "Virginia Tech retired the No. 78 jersey I wore for the Hokies.", "helpful", "identity", 20),
    cfbBatch3Clue("smith-22-sacks-1983", "I recorded 22 sacks for Virginia Tech in 1983.", "helpful", "production", 21),
  ]],
  ["cfb-chase-young", [
    cfbBatch3Clue("young-2019-tfl", "I finished second nationally with 21.5 tackles for loss during my 2019 Ohio State season.", "helpful", "accomplishments", 22),
    cfbBatch3Clue("young-number-two", "I wore No. 2 while starring at defensive end for Ohio State.", "helpful", "identity", 20),
    cfbBatch3Clue("young-team-captain", "My Ohio State teammates selected me as a team captain for the 2019 season.", "strong", "identity", 18),
    cfbBatch3Clue("young-unanimous-aa", "I was a unanimous first-team All-American at Ohio State in 2019.", "strong", "accomplishments", 16),
  ]],
  ["cfb-lee-roy-selmon", [
    cfbBatch3Clue("selmon-two-national-titles", "I helped my team win national championships in each of my final two college seasons.", "helpful", "accomplishments", 19),
    cfbBatch3Clue("selmon-two-time-aa", "I earned All-America honors in each of my final two college seasons.", "helpful", "accomplishments", 21),
  ]],
  ["cfb-myles-garrett", [
    cfbBatch3Clue("garrett-career-pressure", "I finished my Texas A&M career with 32.5 sacks and 48.5 tackles for loss.", "helpful", "production", 19),
    cfbBatch3Clue("garrett-2015-line", "In 2015 I led the SEC with 12.5 sacks, 19.5 tackles for loss and five forced fumbles.", "helpful", "production", 20),
    cfbBatch3Clue("garrett-two-first-team-aa", "I earned consensus first-team All-America honors in each of my final two Texas A&M seasons.", "helpful", "accomplishments", 18),
    cfbBatch3Clue("garrett-unanimous-2016", "I was a unanimous first-team All-American in 2016.", "strong", "accomplishments", 16),
    cfbBatch3Clue("garrett-first-aggie-no1", "I became the first Texas A&M player selected No. 1 overall in the NFL Draft.", "giveaway", "career-path", 8),
    cfbBatch3Clue("garrett-number-15", "I wore No. 15 on Texas A&M's defensive line.", "helpful", "identity", 21),
    cfbBatch3Clue("garrett-freshman-sack-record", "As a freshman in 2014, I set Texas A&M and SEC freshman records with 11.5 sacks.", "helpful", "accomplishments", 18),
    cfbBatch3Clue("garrett-team-defensive-mvp", "Texas A&M named me its team Defensive MVP after my 2014 freshman season.", "helpful", "accomplishments", 20),
    cfbBatch3Clue("garrett-award-finalist", "As a junior in 2016, I was a finalist for the Bednarik and Lombardi awards.", "helpful", "accomplishments", 21),
  ]],
  ["cfb-abdul-carter", [
    cfbBatch3Clue("carter-2024-line", "In 2024 I recorded 12 sacks and a nation-leading 23.5 tackles for loss for Penn State.", "helpful", "production", 19),
    cfbBatch3Clue("carter-cfp-run", "I helped Penn State reach the College Football Playoff semifinal in my final college season.", "strong", "accomplishments", 18),
    cfbBatch3Clue("carter-award-finalist", "I was a finalist for the Bednarik, Nagurski and Lombardi awards in 2024.", "helpful", "accomplishments", 18),
    cfbBatch3Clue("carter-ten-sacks", "I became Penn State's first player with at least 10 sacks in a season since Carl Nassib in 2015.", "helpful", "accomplishments", 21),
    cfbBatch3Clue("carter-number-eleven", "I wore No. 11 at Penn State.", "helpful", "identity", 20),
  ]],
  ["cfb-aidan-hutchinson", [
    cfbBatch3Clue("hutchinson-two-time-captain", "My Michigan teammates elected me a team captain twice.", "helpful", "identity", 21),
    cfbBatch3Clue("hutchinson-ohio-state", "I recorded three sacks against Ohio State in 2021 as Michigan won the rivalry game and advanced to the Big Ten title game.", "helpful", "accomplishments", 19),
  ]],
  ["cfb-jj-watt", [
    cfbBatch3Clue("watt-lott", "I won the 2010 Lott IMPACT Trophy at Wisconsin.", "helpful", "accomplishments", 18),
    cfbBatch3Clue("watt-team-mvp", "Wisconsin named me its team MVP after my final college season.", "helpful", "identity", 21),
    cfbBatch3Clue("watt-blocked-kicks", "I blocked four kicks during my Wisconsin career.", "helpful", "style", 22),
  ]],
  ["cfb-joey-bosa", [
    cfbBatch3Clue("bosa-2014-line", "In 2014 I recorded 13.5 sacks and 21 tackles for loss for Ohio State.", "helpful", "production", 20),
    cfbBatch3Clue("bosa-big-ten-dpoy", "I was the Big Ten Defensive Player of the Year and Defensive Lineman of the Year in 2014.", "helpful", "accomplishments", 18),
    cfbBatch3Clue("bosa-national-title", "I was a starting defensive end on Ohio State's 2014 national championship team.", "helpful", "accomplishments", 21),
  ]],
  ["cfb-john-henderson", [
    cfbBatch3Clue("henderson-two-aa", "I earned first-team All-America recognition in both 2000 and 2001 at Tennessee.", "helpful", "accomplishments", 20),
    cfbBatch3Clue("henderson-2000-line", "In 2000 I recorded 12 sacks and 21 tackles for loss for Tennessee.", "strong", "production", 17),
  ]],
  ["cfb-kayvon-thibodeaux", [
    cfbBatch3Clue("thibodeaux-freshman-line", "As an Oregon freshman in 2019, I set a program freshman record with nine sacks and added 14 tackles for loss.", "helpful", "production", 20),
    cfbBatch3Clue("thibodeaux-number-five", "I wore No. 5 on Oregon's defensive line.", "helpful", "identity", 22),
  ]],
  ["cfb-derrick-thomas", [
    cfbBatch3Clue("thomas-consensus-aa", "I was a consensus first-team All-American for Alabama in 1988.", "helpful", "accomplishments", 19),
    cfbBatch3Clue("thomas-number-55", "I wore No. 55 while terrorizing quarterbacks at Alabama.", "helpful", "identity", 20),
  ]],
  ["cfb-roquan-smith", [
    cfbBatch3Clue("roquan-2017-disruption", "My 2017 Georgia season included 14 tackles for loss and 6.5 sacks.", "helpful", "production", 20),
    cfbBatch3Clue("roquan-sec-title-mvp", "I was named MVP of the 2017 SEC Championship Game after Georgia beat Auburn.", "helpful", "accomplishments", 18),
    cfbBatch3Clue("roquan-consensus-aa", "I was a consensus first-team All-American in 2017.", "helpful", "accomplishments", 19),
    cfbBatch3Clue("roquan-number-three", "I wore No. 3 at Georgia.", "helpful", "identity", 22),
    cfbBatch3Clue("roquan-rose-bowl-mvp", "I was the defensive MVP of Georgia's Rose Bowl win over Oklahoma after the 2017 season.", "helpful", "accomplishments", 17),
    cfbBatch3Clue("roquan-team-captain-mvp", "Georgia named me a permanent team captain and its defensive MVP for the 2017 season.", "helpful", "identity", 20),
  ]],
  ["cfb-derrick-johnson", [
    cfbBatch3Clue("johnson-2004-line", "As a Texas senior in 2004, I made 130 tackles and 19 tackles for loss.", "helpful", "production", 20),
    cfbBatch3Clue("johnson-rose-bowl", "I helped Texas finish 11-1 with a Rose Bowl victory over Michigan after the 2004 season.", "helpful", "accomplishments", 22),
    cfbBatch3Clue("johnson-holiday-bowl-mvp", "I was the defensive MVP of Texas's 2001 Holiday Bowl win over Washington.", "helpful", "accomplishments", 18),
    cfbBatch3Clue("johnson-award-finalist", "As a senior I was a finalist for the Bednarik, Lombardi and Lott awards.", "helpful", "accomplishments", 20),
    cfbBatch3Clue("johnson-2003-team-mvp", "Texas named me its team MVP after my 2003 junior season.", "helpful", "accomplishments", 19),
  ]],
  ["cfb-devin-white", [
    cfbBatch3Clue("white-career-line", "I finished my LSU career with 286 tackles, 29 tackles for loss and 8.5 sacks.", "helpful", "production", 19),
    cfbBatch3Clue("white-sec-tackles", "I led the SEC in tackles in each of my final two LSU seasons.", "helpful", "accomplishments", 20),
    cfbBatch3Clue("white-consensus-aa", "I was a consensus first-team All-American in 2018.", "helpful", "accomplishments", 18),
    cfbBatch3Clue("white-fifth-pick", "Tampa Bay selected me No. 5 overall in the 2019 NFL Draft.", "giveaway", "career-path", 8),
  ]],
  ["cfb-isaiah-simmons", [
    cfbBatch3Clue("simmons-2019-line", "In 2019 I made 107 tackles with 16 tackles for loss, eight sacks and three interceptions for Clemson.", "helpful", "production", 19),
    cfbBatch3Clue("simmons-butkus", "I won the 2019 Butkus Award as the nation's top linebacker.", "helpful", "accomplishments", 17),
    cfbBatch3Clue("simmons-acc-aa", "I was the ACC Defensive Player of the Year and a unanimous All-American in 2019.", "helpful", "accomplishments", 18),
    cfbBatch3Clue("simmons-eighth-pick", "Arizona selected me No. 8 overall in the 2020 NFL Draft.", "giveaway", "career-path", 8),
  ]],
]);

const cfbBatch3ForcedPoolIds = new Map<string, ReadonlySet<string>>([
  ["cfb-chase-young", new Set([
    "position",
    "school",
    "identity:pr8-cfb-chase-young--track-for-football-speed",
    "curated-cfb3:young-16-5",
    "curated-cfb3:young-2019-tfl",
    "curated-cfb3:young-number-two",
    "role-school",
    "curated-cfb3:young-big-ten-dpoy",
    "curated-cfb3:young-heisman-finalist",
    "curated-cfb3:young-team-captain",
    "curated-cfb3:young-award-sweep",
    "curated-cfb3:young-second-pick",
  ])],
  ["cfb-abdul-carter", new Set([
    "position",
    "school",
    "identity:pr9-cfb-abdul-carter--linebacker-to-edge-switch",
    "curated-cfb3:carter-award-finalist",
    "curated-cfb3:carter-ten-sacks",
    "curated-cfb3:carter-number-eleven",
    "role-school",
    "recognition:first-team-all-america",
    "curated-cfb3:carter-big-ten-dpoy",
    "curated-cfb3:carter-unanimous-aa",
    "curated-cfb3:carter-cfp-run",
    "identity:resume-cfb-abdul-carter-01",
  ])],
  ["cfb-john-henderson", new Set([
    "position",
    "school",
    "identity:pr9-cfb-john-henderson--partial-qualifier-1998",
    "identity:pr9-cfb-john-henderson--played-through-ankle-2001",
    "curated-cfb3:henderson-sec-dpoy",
    "curated-cfb3:henderson-two-aa",
    "role-school",
    "recognition:first-team-all-america",
    "identity:resume-cfb-john-henderson-02",
    "curated-cfb3:henderson-2000-line",
    "identity:pr9-cfb-john-henderson--big-john-nickname",
    "curated-cfb3:henderson-ninth-pick",
  ])],
  ["cfb-roquan-smith", new Set([
    "position",
    "school",
    "curated-cfb3:roquan-sec-title-mvp",
    "curated-cfb3:roquan-consensus-aa",
    "curated-cfb3:roquan-rose-bowl-mvp",
    "curated-cfb3:roquan-team-captain-mvp",
    "role-school",
    "recognition:first-team-all-america",
    "curated-cfb3:roquan-sec-dpoy",
    "curated-cfb3:roquan-sec-title",
    "curated-cfb3:roquan-butkus",
    "curated-cfb3:roquan-eighth-pick",
  ])],
  ["cfb-derrick-johnson", new Set([
    "position",
    "school",
    "curated-cfb3:johnson-rose-bowl",
    "curated-cfb3:johnson-holiday-bowl-mvp",
    "curated-cfb3:johnson-award-finalist",
    "curated-cfb3:johnson-2003-team-mvp",
    "role-school",
    "identity:resume-cfb-derrick-johnson-02",
    "curated-cfb3:johnson-big12-dpoy",
    "curated-cfb3:johnson-unanimous-aa",
    "identity:resume-cfb-derrick-johnson-03",
    "curated-cfb3:johnson-award-double",
  ])],
]);

function cfbBatch3ApplyOverride(subjectId: string, clue: WhoAmIClue) {
  const override = cfbBatch3IdentityOverrides.get(subjectId + ":" + (clue.conceptId ?? clue.id));
  const curated = override ? { ...clue, ...override } : clue;
  if (curated.id === "era") {
    return { ...curated, text: curated.text.replace(/^I was active in /, "My college career came in ") };
  }
  return curated;
}

function isCfbBatch3NflStageLeak(clue: WhoAmIClue) {
  if (!clue.identityKnowledge) return false;
  const text = clue.text.toLowerCase();
  return (
    /\bnfl\b|super bowl|all-pro|pro bowl|nfl mvp|defensive player of the year|professional football hall of fame/.test(text)
    && !/draft|selected|pick/.test(text)
  );
}

function shouldSuppressCfbBatch3Clue(subject: FootballSubjectProfile, clue: WhoAmIClue) {
  if (cfbBatch3StructuralClueIds.has(clue.id)) return true;
  if (cfbBatch3SuppressedMetricClueIds.get(subject.id)?.has(clue.id)) return true;
  if (/\b1 (?:sacks|defensive interceptions|pass breakups)\b/i.test(clue.text)) return true;
  if (cfbBatch3GenericMetricIds.has(clue.id)) return true;
  if (clue.conceptId && cfbBatch3GenericIdentityConcepts.has(clue.conceptId)) return true;
  if (clue.conceptId && cfbBatch3SuppressedIdentityConcepts.has(clue.conceptId)) return true;
  if (isCfbBatch3NflStageLeak(clue)) return true;
  if (clue.identityKnowledge && cfbBatch3MalformedFirstPerson.test(clue.text)) return true;
  return false;
}

function trimCfbBatch3Pool(subject: FootballSubjectProfile, clues: readonly WhoAmIClue[]) {
  const target = 16;
  if (clues.length <= target) return [...clues];

  const requiredIds = new Set(["position", "school"]);
  const required = clues.filter((clue) => requiredIds.has(clue.id));
  const requiredIdSet = new Set(required.map((clue) => clue.id));
  const ranked = clues
    .map((clue, index) => ({ clue, index, score: clueQualityScore(subject, clue) }))
    .filter((entry) => !requiredIdSet.has(entry.clue.id))
    .sort((left, right) => right.score - left.score || left.index - right.index);

  const selected = new Set(required.map((clue) => clue.id));
  const selectedConcepts = new Set(required.map((clue) => clue.conceptId ?? clue.id));
  for (const entry of ranked) {
    if (selected.size >= target) break;
    const concept = entry.clue.conceptId ?? entry.clue.id;
    if (selectedConcepts.has(concept)) continue;
    selected.add(entry.clue.id);
    selectedConcepts.add(concept);
  }
  if (selected.size < target) {
    for (const entry of ranked) {
      if (selected.size >= target) break;
      selected.add(entry.clue.id);
    }
  }
  return clues.filter((clue) => selected.has(clue.id));
}

function curateCfbBatch3Clues(subject: FootballSubjectProfile, rawClues: readonly WhoAmIClue[]) {
  let colorUsed = false;
  let relationshipUsed = false;
  const curated: WhoAmIClue[] = [];

  for (const rawClue of rawClues) {
    const clue = cfbBatch3ApplyOverride(subject.id, rawClue);
    if (shouldSuppressCfbBatch3Clue(subject, clue)) continue;

    if (clue.identityKnowledge) {
      const selectionClass = whoAmIClueSelectionClass(clue);
      if (selectionClass === "deep-biography") continue;
      if (selectionClass === "identity-color") {
        if (colorUsed) continue;
        colorUsed = true;
      }
      if (whoAmIClueFacet(clue) === "relationships") {
        if (relationshipUsed) continue;
        relationshipUsed = true;
      }
    }
    curated.push(clue);
  }

  curated.push(...(cfbBatch3SupplementalClues.get(subject.id) ?? []));
  curated.push(...(cfbBatch3ReplayDepthClues.get(subject.id) ?? []));
  const forcedPool = cfbBatch3ForcedPoolIds.get(subject.id);
  if (forcedPool) return curated.filter((clue) => forcedPool.has(clue.id));
  return trimCfbBatch3Pool(subject, curated);
}

export function isCfbWhoAmIBatch3Subject(subjectId: string) {
  return cfbBatch3SubjectIds.has(subjectId);
}

export const CFB_WHO_AM_I_BATCH_4_SUBJECT_IDS = [
  "cfb-paul-posluszny",
  "cfb-rolando-mcclain",
  "cfb-charles-woodson",
  "cfb-deion-sanders",
  "cfb-ed-reed",
  "cfb-eric-berry",
  "cfb-minkah-fitzpatrick",
  "cfb-patrick-peterson",
  "cfb-sean-taylor",
  "cfb-travis-hunter",
  "cfb-tyrann-mathieu",
  "cfb-aaron-ross",
  "cfb-antoine-winfield-jr",
  "cfb-budda-baker",
  "cfb-caleb-downs",
  "cfb-champ-bailey",
  "cfb-cooper-dejean",
  "cfb-darqueze-dennard",
  "cfb-derwin-james",
  "cfb-earl-thomas",
  "cfb-eric-weddle",
  "cfb-jabrill-peppers",
  "cfb-jalen-ramsey",
  "cfb-jamal-adams",
  "cfb-jeff-okudah",
  "cfb-kyle-hamilton",
  "cfb-malaki-starks",
  "cfb-malcolm-jenkins",
  "cfb-michael-huff",
  "cfb-morris-claiborne",
  "barry-switzer",
  "bear-bryant",
  "bobby-bowden-cfb",
  "dabo-swinney-cfb",
  "kirby-smart-cfb",
  "nick-saban-cfb",
  "pete-carroll-cfb",
  "steve-spurrier-cfb",
  "tom-osborne",
  "urban-meyer-cfb",
  "woody-hayes",
  "bill-snyder-cfb",
  "bob-stoops-cfb",
  "brian-kelly-cfb",
  "chip-kelly",
  "chris-petersen-cfb",
  "dan-lanning",
  "ed-orgeron",
  "frank-beamer-cfb",
  "gary-patterson-cfb",
] as const;

const cfbBatch4SubjectIds = new Set<string>(CFB_WHO_AM_I_BATCH_4_SUBJECT_IDS);
const cfbBatch4StructuralClueIds = new Set([
  "player-career-start",
  "player-career-end",
  "career-span",
  "coach-affiliation-count",
]);
const cfbBatch4GenericMetricIds = new Set([
  "fact:cfb-career-games",
  "fact:cfb-career-starts",
  "fact:cfb-career-targets",
  "fact:cfb-career-passing-completions",
  "fact:cfb-career-passing-attempts",
  "fact:cfb-career-rushing-attempts",
  "fact:cfb-career-interceptions-thrown",
  "fact:cfb-coach-career-losses",
  "fact:cfb-coach-career-ties",
]);
const cfbBatch4GenericIdentityConcepts = new Set([
  "identity:career-games",
  "identity:career-starts",
  "identity:career-games-starts",
  "identity:career-passing-completions",
  "identity:career-passing-attempts",
  "identity:career-rushing-attempts",
  "identity:career-targets",
  "identity:career-interceptions-thrown",
]);

const cfbBatch4SuppressedClueIds = new Set([
  "identity:pr8-suwanee-housing-and-coach-support",
  "identity:pr8-sugar-bowl-end-zone-interception",
  "identity:pr9-cfb-budda-baker--budda-nickname-origin",
  "identity:pr9-cfb-champ-bailey--roland-champ-nickname",
  "identity:pr7-champ-bailey-mother-gave-champ-nickname",
  "identity:pr9-cfb-earl-thomas--four-sport-two-way-prep-athlete",
  "identity:pr9-cfb-earl-thomas--church-musician",
  "identity:pr9-cfb-eric-weddle--san-diego-state-three-interception-three-touchdown-game",
  "identity:pr9-cfb-eric-weddle--armed-forces-bowl-final-play-interception",
  "identity:pr9-cfb-kyle-hamilton--inside-the-garage-podcast",
  "identity:pr9-cfb-malcolm-jenkins--high-school-receiving-role",
  "identity:pr8-pete-carroll--firings-triggered-philosophy-reset",
  "identity:pr9-bill-snyder--hayden-fry-apprenticeship",
  "identity:pr9-ed-orgeron--bear-bryant-visit-turned-away",
]);

const cfbBatch4MalformedFirstPerson = /\bme\s+(?:focused|collided|attended|led|entered|executed|hit|briefly|passed|produced|repeatedly|scored|announced|rebuilt|chose|went|pursued|scrambled|delivered|handled|could|asked|broke|also|gave|weighed|pledged|lost|wanted|committed|struck|learned|watched|lived|told|decided|caught|built|excelled|arrived|returned|rushed|played|won|became|had|was|is|underwent|pointed|created|helped|impressed|reportedly|shifted|redshirted|forced|participated|faced|stayed|starred|followed|mentored|appeared|did|blocked|listed|pushed|exploited|coached|instituted|drove)\b|\bsaid\s+me\b|\b(?:three|four)\s+me\s+brothers\b|\bI\s+scholarship\s+opportunities\b|\bI\s+to\s+sit\b|\bI\s+a\b|\bI\s+died\b|\bI\s+has\b|\bme\s+and\s+my\b|\bFuture\s+and\s+I\s+quarterback\b|\bWilliam\s+myself\b|\bI\s+saw\s+me\b|\bAfter\s+(?:got|left)\b|\bWhile\s+was\b|\bWhen\s+finally\s+got\b|\bthe\s+skinny\s+me\b|\bQuarterback\s+and\s+I\s+[A-Z]|\bwhen\s+me\b|\bme\s+(?:intercepted|lettered|contributed|co-hosted|accepted|used|succeeded)\b|\bAfter[’']s\b|\binjurthis player\b|\bnicknamed\s+me\s+[“\"']?me\b|\bnickname\s+[“\"']?me\b|[“\"']me[”\"']\s+was\b/i;
const cfbBatch4OffFieldFiller = /\b(?:academic|degree|engineering|poultry|poetry|paleontolog|community[- ]service|volunteer|fundraising|charity|business venture|real estate|horseman|horse|catfishing|restaurant|tattoo|service station|coal mine|naval service|navy service|military service)\b|\bmajor(?:ed)?\s+(?:in|at)\b/i;



const cfbBatch4IdentityOverrides = new Map<string, Partial<WhoAmIClue>>([
  ["cfb-kyle-hamilton:affiliation:notre-dame", {
    text: "I played college football at Notre Dame.",
    band: "broad",
    facet: "background",
  }],
  ["steve-spurrier-cfb:affiliation:south-carolina", {
    band: "strong",
    facet: "career-path",
  }],
  ["dan-lanning:affiliation:oregon", {
    text: "I was a college head coach at Oregon.",
    band: "broad",
    facet: "role",
  }],
  ["ed-orgeron:affiliation:lsu", {
    text: "I was a college head coach at LSU.",
    band: "broad",
    facet: "role",
  }],
  ["cfb-sean-taylor:identity:pr8-sean-taylor-gulliver-three-position-football", {
    text: "At Gulliver Prep, I played running back, defensive back and linebacker before becoming known as a safety.",
    band: "helpful",
    facet: "career-path",
  }],
  ["cfb-sean-taylor:identity:pr8-sean-taylor-gulliver-only-loss-missed", {
    text: "Gulliver Prep's state-championship team went 14-1, and its only loss came in a game I did not play.",
  }],
  ["cfb-sean-taylor:identity:pr8-sean-taylor-local-miami-true-freshman", {
    text: "I chose nearby Miami over other major programs and was one of only four true freshmen to play for the 2001 national-championship Hurricanes, initially contributing in sub packages and on special teams.",
    band: "helpful",
    facet: "career-path",
  }],
  ["cfb-sean-taylor:identity:pr8-sean-taylor-replaced-ed-reed", {
    text: "When I became a full-time Miami starter, I stepped into the safety role vacated by Ed Reed.",
    band: "helpful",
    facet: "career-path",
  }],
  ["cfb-jeff-okudah:identity:pr9-cfb-jeff-okudah--high-school-receiver-production", {
    text: "Although recruited as an elite defensive back, I was also a productive high-school receiver and averaged more than 24 yards per catch as a junior.",
    band: "helpful",
    facet: "career-path",
  }],
  ["cfb-jeff-okudah:identity:pr9-cfb-jeff-okudah--nike-testing-behind-dobbins", {
    text: "At The Opening, I finished second in Nike+ athletic testing to fellow future Ohio State signee J.K. Dobbins.",
    band: "helpful",
    facet: "career-path",
  }],
  ["cfb-jeff-okudah:identity:pr9-cfb-jeff-okudah--ranked-top-corner-and-safety", {
    text: "As a recruit, I was evaluated at the very top of the class at both cornerback and safety rather than as a one-position defensive back.",
    band: "helpful",
    facet: "career-path",
  }],
  ["cfb-ed-reed:identity:pr8-cfb-ed-reed--hurt-dawg-halftime-leadership", {
    text: "While injured during the 2001 Florida State game, I delivered a famous halftime challenge demanding that Miami play to its standard.",
    band: "helpful",
    facet: "career-path",
  }],
  ["cfb-ed-reed:identity:high-school-four-football-roles", {
    band: "helpful",
    facet: "career-path",
  }],
  ["cfb-ed-reed:identity:miami-track-participant", {
    band: "strong",
    facet: "style",
  }],
  ["bear-bryant:identity:pr8-bear-bryant-bear-wrestling-nickname", {
    text: "As a teenager in Fordyce, Arkansas, I accepted a theater promotion to wrestle a captive bear.",
    band: "helpful",
    facet: "identity",
  }],
  ["pete-carroll-cfb:identity:pr8-pete-carroll--bob-troppmann-mentor", {
    text: "I credited high-school coach Bob Troppmann as a foundational mentor, worked his camp for years and later called him from the USC sideline before games.",
    band: "helpful",
    facet: "career-path",
  }],
  ["gary-patterson-cfb:identity:pr9-gary-patterson-cfb--franchione-multi-stop-coaching-partnership", {
    text: "Dennis Franchione and I coached together at Kansas State, Tennessee Tech, Pittsburg State, New Mexico and TCU before I succeeded him as TCU head coach.",
    band: "strong",
    facet: "career-path",
  }],
]);

function cfbBatch4ApplyOverride(subjectId: string, clue: WhoAmIClue) {
  const override = cfbBatch4IdentityOverrides.get(subjectId + ":" + clue.id)
    ?? cfbBatch4IdentityOverrides.get(subjectId + ":" + (clue.conceptId ?? clue.id));
  return override ? { ...clue, ...override } : clue;
}

function cfbBatch4Clue(
  id: string,
  text: string,
  band: WhoAmIClue["band"] = "strong",
  facet: WhoAmIClue["facet"] = "accomplishments",
  revealPriority = 14,
): WhoAmIClue {
  return { id: "curated-cfb4:" + id, conceptId: "curated-cfb4:" + id, text, band, facet, revealPriority };
}

const cfbBatch4SupplementalClues = new Map<string, readonly WhoAmIClue[]>([
  ["cfb-eric-berry", [
    cfbBatch4Clue("berry-thorpe-2009", "I won the 2009 Jim Thorpe Award as the nation's top defensive back.", "giveaway", "accomplishments", 8),
    cfbBatch4Clue("berry-sec-dpoy-2008", "I was the SEC Defensive Player of the Year in 2008.", "strong", "accomplishments", 14),
    cfbBatch4Clue("berry-two-unanimous-aa", "I became the first Tennessee player to earn unanimous All-America honors twice.", "strong", "accomplishments", 13),
    cfbBatch4Clue("berry-delayed-commitment", "I knew relatively early that I wanted Tennessee, but delayed announcing my commitment so recruiters would keep visiting my high school and evaluating my teammates.", "strong", "career-path", 17),
  ]],
  ["cfb-kyle-hamilton", [
    cfbBatch4Clue("hamilton-first-stadium-snap", "On my first defensive snap in Notre Dame Stadium, I returned an interception for a touchdown against New Mexico.", "strong", "accomplishments", 15),
    cfbBatch4Clue("hamilton-four-freshman-picks", "As a Notre Dame freshman in 2019, I made four interceptions, one of only four FBS freshmen with at least four that season.", "strong", "production", 16),
    cfbBatch4Clue("hamilton-2020-tackle-leader", "I led Notre Dame with 63 tackles in 11 games during the 2020 season and earned first-team All-ACC honors.", "strong", "production", 14),
    cfbBatch4Clue("hamilton-two-picks-fsu", "I opened the 2021 season with two interceptions in Notre Dame's overtime win at Florida State.", "strong", "accomplishments", 17),
    cfbBatch4Clue("hamilton-career-eight-picks", "Across three seasons at Notre Dame, I totaled 138 tackles and eight interceptions.", "strong", "production", 18),
  ]],
  ["cfb-travis-hunter", [
    cfbBatch4Clue("hunter-jackson-state-colorado", "I played one season at Jackson State before transferring to Colorado.", "giveaway", "career-path", 7),
  ]],
  ["cfb-ed-reed", [
    cfbBatch4Clue("reed-two-star-miami-find", "I described myself as a two-star recruit before Miami found me while scholarship sanctions forced its staff to search creatively.", "strong", "career-path", 16),
    cfbBatch4Clue("reed-fsu-halftime", "During Miami's 2001 game at Florida State, I delivered a halftime challenge that became one of the signature leadership moments of my college career.", "strong", "career-path", 15),
  ]],
  ["cfb-patrick-peterson", [
    cfbBatch4Clue("peterson-thorpe-bednarik", "In 2010 I won both the Jim Thorpe Award and the Bednarik Award at LSU.", "giveaway", "accomplishments", 7),
    cfbBatch4Clue("peterson-three-way-scores", "I scored LSU touchdowns three different ways: punt return, interception return and return of a blocked field goal.", "strong", "production", 16),
    cfbBatch4Clue("peterson-return-double", "As a junior I led the SEC in both punt-return and kickoff-return average.", "strong", "style", 15),
    cfbBatch4Clue("peterson-west-virginia-punt", "I returned a punt for a touchdown against West Virginia in 2010 and celebrated with a spontaneous Heisman pose.", "helpful", "identity", 20),
  ]],
  ["cfb-tyrann-mathieu", [
    cfbBatch4Clue("mathieu-honey-badger", "My relentless LSU style became nationally associated with the nickname Honey Badger.", "giveaway", "identity", 8),
    cfbBatch4Clue("mathieu-eleven-forced-fumbles", "I forced a school-record 11 fumbles during only two seasons at LSU.", "strong", "production", 16),
    cfbBatch4Clue("mathieu-bednarik", "I won the 2011 Bednarik Award as the nation's top defensive player.", "giveaway", "accomplishments", 7),
  ]],
  ["cfb-antoine-winfield-jr", [
    cfbBatch4Clue("winfield-unanimous-aa", "I was a unanimous All-American for Minnesota in 2019.", "strong", "accomplishments", 15),
    cfbBatch4Clue("winfield-big-ten-db", "I was the Big Ten Defensive Back of the Year in 2019.", "giveaway", "accomplishments", 9),
    cfbBatch4Clue("winfield-seven-picks", "I made seven interceptions in 2019, tying Minnesota's single-season record.", "strong", "production", 17),
  ]],
  ["cfb-budda-baker", [
    cfbBatch4Clue("baker-three-way-prep", "In high school I played safety, running back and return specialist on three consecutive undefeated state-title teams.", "helpful", "background", 22),
    cfbBatch4Clue("baker-track-titles", "I won Washington state high-school track titles in the 100 meters, 200 meters and relays.", "helpful", "background", 23),
    cfbBatch4Clue("baker-oregon-to-washington", "I originally committed to Oregon before changing course and playing for Washington.", "strong", "career-path", 17),
  ]],
  ["cfb-caleb-downs", [
    cfbBatch4Clue("downs-bama-tackle-leader", "As a true freshman I became the first Alabama freshman in at least 50 years to lead the team in tackles, finishing with 107.", "strong", "production", 15),
    cfbBatch4Clue("downs-sec-freshman", "I was the SEC Freshman of the Year in 2023.", "strong", "accomplishments", 14),
    cfbBatch4Clue("downs-transfer", "After one season at Alabama, I transferred to Ohio State before the 2024 season.", "giveaway", "career-path", 8),
    cfbBatch4Clue("downs-2024-unanimous-aa", "I became a unanimous first-team All-American at Ohio State in 2024.", "strong", "accomplishments", 13),
    cfbBatch4Clue("downs-two-school-awards", "My first two college seasons produced major honors at two schools: SEC Freshman of the Year at Alabama and Big Ten Defensive Back of the Year at Ohio State.", "giveaway", "identity", 7),
  ]],
  ["cfb-champ-bailey", [
    cfbBatch4Clue("bailey-three-phase", "At Georgia I played major snaps on defense, offense and special teams.", "strong", "style", 14),
    cfbBatch4Clue("bailey-nagurski", "I won the 1998 Bronko Nagurski Award as the nation's top defensive player.", "giveaway", "accomplishments", 8),
    cfbBatch4Clue("bailey-1998-receiving", "During my 1998 All-America season I also caught 47 passes for 744 yards and five touchdowns.", "strong", "production", 15),
    cfbBatch4Clue("bailey-long-jump", "I competed in Georgia track and set a school indoor long-jump record.", "helpful", "background", 22),
  ]],
  ["cfb-derwin-james", [
    cfbBatch4Clue("james-youth-positions", "Before moving to safety as a high-school freshman, I had played quarterback, running back and wide receiver.", "helpful", "career-path", 22),
    cfbBatch4Clue("james-offer-at-fourteen", "Florida State offered me a scholarship when I was a 14-year-old high-school freshman.", "strong", "career-path", 16),
    cfbBatch4Clue("james-2017-aa", "I earned first-team All-America recognition at Florida State in 2017.", "strong", "accomplishments", 14),
  ]],
  ["cfb-jabrill-peppers", [
    cfbBatch4Clue("peppers-fifteen-positions", "Michigan credited me with lining up at 15 different positions during the 2016 season.", "giveaway", "style", 7),
    cfbBatch4Clue("peppers-hornung", "I won the 2016 Paul Hornung Award as the nation's most versatile player.", "giveaway", "accomplishments", 8),
    cfbBatch4Clue("peppers-three-big-ten-awards", "In 2016 I became the first Big Ten player to win three conference individual awards in the same season.", "strong", "accomplishments", 13),
    cfbBatch4Clue("peppers-heisman-finalist", "I finished fifth in the 2016 Heisman Trophy voting as a defensive and return star.", "strong", "accomplishments", 12),
    cfbBatch4Clue("peppers-four-state-titles", "I won four straight New Jersey state football championships across two high schools.", "helpful", "background", 23),
  ]],
  ["cfb-jamal-adams", [
    cfbBatch4Clue("adams-first-team-aa", "I earned first-team All-America recognition at LSU in 2016.", "strong", "accomplishments", 15),
    cfbBatch4Clue("adams-team-captain", "LSU named me a permanent team captain for the 2016 season.", "strong", "identity", 17),
    cfbBatch4Clue("adams-three-coordinators", "I played for three different defensive coordinators during my three seasons at LSU.", "helpful", "career-path", 23),
  ]],
  ["cfb-earl-thomas", [
    cfbBatch4Clue("thomas-ten-interceptions", "I finished my Texas career with 10 interceptions in only two playing seasons.", "strong", "production", 16),
    cfbBatch4Clue("thomas-four-sport-prep", "In high school I lettered in football, basketball, baseball and track while playing defensive back, running back and receiver.", "helpful", "background", 22),
    cfbBatch4Clue("thomas-33-breakups", "I recorded 33 pass breakups during my Texas career.", "strong", "production", 18),
  ]],
  ["cfb-cooper-dejean", [
    cfbBatch4Clue("dejean-only-fbs-offer", "Iowa was my only FBS scholarship offer despite a four-sport high-school career.", "strong", "career-path", 16),
    cfbBatch4Clue("dejean-high-school-qb", "I was a high-school quarterback as well as a defensive back before Iowa recruited me for defense.", "helpful", "career-path", 20),
    cfbBatch4Clue("dejean-state-title-play", "In a high-school state championship game I blocked an extra point, later scored the tying touchdown and then scored the winning touchdown.", "helpful", "career-path", 20),
  ]],
  ["cfb-sean-taylor", [
    cfbBatch4Clue("taylor-2001-title-team", "I was one of only four true freshmen to play for Miami's 2001 national-championship team.", "strong", "accomplishments", 16),
    cfbBatch4Clue("taylor-ten-picks", "I tied Miami's single-season record with 10 interceptions in 2003.", "strong", "production", 14),
    cfbBatch4Clue("taylor-big-east-dpoy", "I was the 2003 Big East Defensive Player of the Year.", "giveaway", "accomplishments", 8),
  ]],
  ["barry-switzer", [
    cfbBatch4Clue("switzer-oklahoma-head-coach", "I was the head coach at Oklahoma.", "broad", "background", 24),
    cfbBatch4Clue("switzer-wishbone", "As Oklahoma's offensive coordinator in 1970, I pushed the program to switch to the wishbone offense.", "giveaway", "style", 8),
    cfbBatch4Clue("switzer-three-titles", "As Oklahoma head coach I won three national championships.", "giveaway", "accomplishments", 7),
    cfbBatch4Clue("switzer-integration", "I aggressively recruited Black players across Oklahoma's roster, including at quarterback, during a major period of integration in the region.", "strong", "career-path", 17),
    cfbBatch4Clue("switzer-arkansas-player", "Before coaching at Oklahoma, I played college football at Arkansas.", "helpful", "background", 23),
  ]],
  ["bear-bryant", [
    cfbBatch4Clue("bryant-six-titles", "I won six national championships as Alabama's head coach.", "giveaway", "accomplishments", 7),
    cfbBatch4Clue("bryant-323-wins", "I finished my college head-coaching career with 323 wins.", "strong", "production", 15),
    cfbBatch4Clue("bryant-junction", "At Texas A&M, my famously demanding 1954 preseason camp produced the group remembered as the Junction Boys.", "giveaway", "identity", 8),
    cfbBatch4Clue("bryant-broken-leg", "As an Alabama player in 1935, I played against Tennessee despite a broken bone in my leg.", "helpful", "background", 22),
  ]],
  ["bobby-bowden-cfb", [
    cfbBatch4Clue("bowden-two-titles", "I led Florida State to national championships in 1993 and 1999.", "giveaway", "accomplishments", 7),
    cfbBatch4Clue("bowden-fsu-dynasty", "My Florida State teams finished in the AP top five for 14 consecutive seasons from 1987 through 2000.", "strong", "accomplishments", 13),
    cfbBatch4Clue("bowden-howard-transfer", "As a player I transferred from Alabama to Howard College after Alabama's rules for married players affected my path.", "helpful", "career-path", 22),
    cfbBatch4Clue("bowden-track-coach", "Early in my coaching career I also served as a head track coach while building my football resume.", "helpful", "background", 23),
  ]],
  ["dabo-swinney-cfb", [
    cfbBatch4Clue("swinney-six-acc-run", "I led Clemson to six consecutive outright ACC championships from 2015 through 2020.", "strong", "accomplishments", 12),
    cfbBatch4Clue("swinney-walk-on", "I entered Alabama as a regular student and earned a spot on the football team through a walk-on tryout.", "strong", "career-path", 16),
    cfbBatch4Clue("swinney-spiller-card", "While recruiting C.J. Spiller, I wrote an informal commitment on the back of a business card and later kept it framed.", "strong", "career-path", 17),
    cfbBatch4Clue("swinney-clemson-2003", "I joined Clemson's staff in 2003 and eventually took over as head coach during the 2008 season.", "strong", "career-path", 15),
    cfbBatch4Clue("swinney-playoff-run", "I turned Clemson into a playoff-era power that reached the College Football Playoff in six consecutive seasons from 2015 through 2020.", "strong", "accomplishments", 12),
    cfbBatch4Clue("swinney-alabama-title-player", "I was a receiver on Alabama's 1992 national-championship team before entering coaching.", "helpful", "background", 21),
  ]],
  ["kirby-smart-cfb", [
    cfbBatch4Clue("smart-two-titles", "I led Georgia to back-to-back national championships after the 2021 and 2022 seasons.", "giveaway", "accomplishments", 7),
    cfbBatch4Clue("smart-georgia-player", "Before coaching Georgia, I played defensive back for the Bulldogs.", "strong", "identity", 16),
    cfbBatch4Clue("smart-2005-rbs", "Despite my defensive background, I returned to Georgia in 2005 to coach running backs.", "helpful", "career-path", 22),
    cfbBatch4Clue("smart-saban-college-path", "I worked under Nick Saban at LSU and Alabama before becoming Georgia's head coach.", "strong", "career-path", 15),
  ]],
  ["nick-saban-cfb", [
    cfbBatch4Clue("saban-seven-titles", "I won seven major-college national championships as a head coach, one at LSU and six at Alabama.", "giveaway", "accomplishments", 6),
    cfbBatch4Clue("saban-kent-state-ga", "Don James gave me a graduate-assistant opportunity at Kent State that helped redirect me into coaching.", "helpful", "career-path", 21),
    cfbBatch4Clue("saban-two-title-programs", "I won national championships as head coach at two SEC programs.", "strong", "identity", 14),
    cfbBatch4Clue("saban-alabama-six", "My Alabama teams won six national championships between the 2009 and 2020 seasons.", "giveaway", "accomplishments", 8),
  ]],
  ["pete-carroll-cfb", [
    cfbBatch4Clue("carroll-2004-ap-no1", "My 2004 USC team held the AP No. 1 ranking from preseason through the entire campaign and won the Orange Bowl.", "strong", "accomplishments", 12),
    cfbBatch4Clue("carroll-pacific-safety", "My own college playing path went through junior college before I became a free safety at Pacific.", "helpful", "background", 22),
    cfbBatch4Clue("carroll-seven-pac10", "My USC teams won seven consecutive Pac-10 championships from 2002 through 2008.", "strong", "accomplishments", 12),
    cfbBatch4Clue("carroll-win-forever", "At USC I built the program around a competition-centered philosophy that became known as Win Forever.", "strong", "style", 16),
  ]],
  ["steve-spurrier-cfb", [
    cfbBatch4Clue("spurrier-1996-title", "I coached Florida to the 1996 national championship.", "giveaway", "accomplishments", 7),
    cfbBatch4Clue("spurrier-six-sec", "My Florida teams won six SEC championships.", "strong", "accomplishments", 13),
    cfbBatch4Clue("spurrier-heisman", "Long before I coached Florida, I won the 1966 Heisman Trophy as the Gators' quarterback.", "giveaway", "identity", 6),
    cfbBatch4Clue("spurrier-qb-punter", "At Florida I handled punting duties in addition to playing quarterback.", "helpful", "background", 22),
    cfbBatch4Clue("spurrier-fun-n-gun", "My Florida offenses became famous for the pass-heavy Fun 'n' Gun attack.", "giveaway", "style", 8),
  ]],
  ["tom-osborne", [
    cfbBatch4Clue("osborne-three-titles", "I led Nebraska to three national championships in my final four seasons as head coach.", "giveaway", "accomplishments", 7),
    cfbBatch4Clue("osborne-thirteen-conference", "I led Nebraska to 13 conference championships during my 25 seasons as head coach.", "strong", "accomplishments", 14),
    cfbBatch4Clue("osborne-nine-win-streak", "Every one of my 25 Nebraska teams won at least nine games.", "strong", "accomplishments", 13),
    cfbBatch4Clue("osborne-hastings-three-sport", "I played football and basketball and competed in track at Hastings College.", "helpful", "background", 22),
    cfbBatch4Clue("osborne-devaney-path", "Bob Devaney brought me into Nebraska's program before I eventually succeeded him as head coach.", "strong", "career-path", 16),
    cfbBatch4Clue("osborne-nebraska-offense", "Before becoming head coach, I helped build the Nebraska offense that became the foundation of my long tenure.", "strong", "style", 17),
  ]],
  ["woody-hayes", [
    cfbBatch4Clue("hayes-thirteen-big-ten", "My Ohio State teams won 13 Big Ten championships.", "giveaway", "accomplishments", 7),
    cfbBatch4Clue("hayes-eleven-bowls", "I led Ohio State to 11 bowl games, including eight Rose Bowls.", "strong", "accomplishments", 14),
    cfbBatch4Clue("hayes-ten-year-war", "My rivalry with former assistant Bo Schembechler at Michigan became known as the Ten-Year War.", "giveaway", "relationships", 8),
    cfbBatch4Clue("hayes-national-title-teams", "I coached multiple Ohio State national-championship teams across nearly three decades in Columbus.", "strong", "accomplishments", 14),
    cfbBatch4Clue("hayes-gator-bowl-end", "My Ohio State tenure ended after the sideline incident with Clemson's Charlie Bauman in the 1978 Gator Bowl.", "giveaway", "identity", 9),
  ]],
  ["bill-snyder-cfb", [
    cfbBatch4Clue("snyder-two-big12", "I won two conference championships as Kansas State's head coach.", "strong", "accomplishments", 14),
    cfbBatch4Clue("snyder-miracle-manhattan", "I took over a Kansas State program that had gone 0-26-1 immediately before my arrival and led the turnaround known as the Miracle of Manhattan.", "giveaway", "identity", 7),
    cfbBatch4Clue("snyder-retire-return", "I retired after the 2005 season, returned as Kansas State head coach in 2009 and rebuilt the program again.", "strong", "career-path", 15),
    cfbBatch4Clue("snyder-hayden-fry", "Before Kansas State, I spent a decade as Hayden Fry's offensive coordinator at Iowa.", "strong", "career-path", 17),
  ]],
  ["bob-stoops-cfb", [
    cfbBatch4Clue("stoops-2000-title", "I coached Oklahoma to the 2000 national championship in my second season as head coach.", "giveaway", "accomplishments", 7),
    cfbBatch4Clue("stoops-ten-big12", "My Oklahoma teams won 10 Big 12 championships.", "giveaway", "accomplishments", 8),
    cfbBatch4Clue("stoops-iowa-db", "I played defensive back at Iowa before starting my coaching career there.", "helpful", "background", 22),
    cfbBatch4Clue("stoops-three-brothers", "I was the oldest of three brothers who played defensive back at Iowa.", "helpful", "background", 23),
    cfbBatch4Clue("stoops-iowa-ga", "After my final Iowa playing season, I stayed with the Hawkeyes as a graduate assistant before moving into full-time coaching.", "helpful", "career-path", 20),
  ]],
  ["brian-kelly-cfb", [
    cfbBatch4Clue("kelly-cincinnati-2008-title", "I led Cincinnati to the 2008 Big East championship and the program's first BCS bowl berth.", "strong", "accomplishments", 15),
    cfbBatch4Clue("kelly-cincinnati-2009-run", "My 2009 Cincinnati team opened 10-0 and reached No. 5 in the BCS standings before the regular season ended.", "strong", "accomplishments", 16),
    cfbBatch4Clue("kelly-major-stage", "I coached Notre Dame to a BCS national-title game and later to two College Football Playoff appearances.", "strong", "accomplishments", 13),
    cfbBatch4Clue("kelly-gvsu-back-to-back-titles", "At Grand Valley State, I won back-to-back Division II national championships in 2002 and 2003.", "strong", "accomplishments", 14),
    cfbBatch4Clue("kelly-gvsu-offensive-machine", "My 2001 Grand Valley State team averaged 58.4 points and 600.8 yards per game on its way to the Division II national-title game.", "strong", "style", 18),
  ]],
  ["chip-kelly", [
    cfbBatch4Clue("kelly-unh-qb-safety", "I played both quarterback and safety at New Hampshire.", "helpful", "background", 22),
    cfbBatch4Clue("kelly-defensive-start", "My coaching career began on defense and special teams before I became known for offense.", "strong", "career-path", 18),
    cfbBatch4Clue("kelly-three-conference", "I became the first Oregon coach to win three consecutive undisputed conference championships.", "strong", "accomplishments", 13),
    cfbBatch4Clue("kelly-2010-title-game", "I coached Oregon to an unbeaten 2010 regular season and the BCS National Championship Game.", "giveaway", "accomplishments", 8),
  ]],
  ["chris-petersen-cfb", [
    cfbBatch4Clue("petersen-uc-davis-qb", "I began at Sacramento City College before transferring to UC Davis, where I became a standout quarterback.", "helpful", "background", 22),
    cfbBatch4Clue("petersen-first-season-fiesta", "In my first season as Boise State head coach, I went unbeaten and won the Fiesta Bowl over Oklahoma with a series of famous trick plays.", "giveaway", "accomplishments", 7),
    cfbBatch4Clue("petersen-okg", "My recruiting philosophy at Boise State emphasized players I called OKGs, short for Our Kind of Guys.", "strong", "style", 16),
    cfbBatch4Clue("petersen-boise-washington", "I produced two unbeaten Boise State teams and later took Washington to the College Football Playoff.", "strong", "career-path", 13),
  ]],
  ["dan-lanning", [
    cfbBatch4Clue("lanning-william-jewell", "I played linebacker at William Jewell College before beginning my coaching career in high school.", "helpful", "background", 22),
    cfbBatch4Clue("lanning-pitt-drive", "While still a high-school coach, I drove roughly 13 hours overnight to Pittsburgh without an appointment to chase a Division I opportunity.", "strong", "career-path", 18),
    cfbBatch4Clue("lanning-georgia-dc", "Before becoming a head coach, I was Georgia's defensive coordinator during its 2021 national-championship season.", "strong", "career-path", 14),
    cfbBatch4Clue("lanning-oregon-first-hc", "Oregon gave me my first head-coaching job before the 2022 season.", "strong", "career-path", 16),
    cfbBatch4Clue("lanning-big-ten-title", "I led Oregon to the Big Ten championship in the program's first season in the conference.", "giveaway", "accomplishments", 8),
    cfbBatch4Clue("lanning-2024-regular", "My 2024 Oregon team completed an unbeaten regular season before the College Football Playoff.", "strong", "accomplishments", 12),
  ]],
  ["ed-orgeron", [
    cfbBatch4Clue("orgeron-2019-title", "I led LSU to a 15-0 season and the 2019 national championship.", "giveaway", "accomplishments", 6),
    cfbBatch4Clue("orgeron-2019-sec", "My 2019 LSU team also won the SEC championship and beat seven top-10 opponents.", "strong", "accomplishments", 12),
    cfbBatch4Clue("orgeron-coach-o", "My gravelly Cajun voice and high-energy recruiting style became central to the Coach O identity at LSU.", "giveaway", "identity", 8),
    cfbBatch4Clue("orgeron-lsu-dream", "I grew up in Louisiana following LSU football and later returned to lead the Tigers as head coach.", "strong", "career-path", 17),
  ]],
  ["frank-beamer-cfb", [
    cfbBatch4Clue("beamer-238-vt", "I won a school-record 238 games as Virginia Tech's head coach.", "strong", "production", 14),
    cfbBatch4Clue("beamer-23-bowls", "My Virginia Tech teams reached a bowl game in 23 consecutive seasons.", "strong", "accomplishments", 13),
    cfbBatch4Clue("beamer-1999-title-game", "I led Virginia Tech through an undefeated 1999 regular season and into the national championship game.", "giveaway", "accomplishments", 8),
    cfbBatch4Clue("beamer-ball", "My Virginia Tech program became famous for blocked kicks and special-teams touchdowns as a defining part of its identity.", "giveaway", "style", 7),
    cfbBatch4Clue("beamer-seven-conference", "My Virginia Tech teams won seven conference championships.", "strong", "accomplishments", 15),
    cfbBatch4Clue("beamer-vt-player", "Before coaching Virginia Tech, I played defensive back there.", "helpful", "background", 22),
    cfbBatch4Clue("beamer-newspaper-vpi", "Newspaper coverage of my high-school play helped catch VPI coaches' attention and led me to Virginia Tech as a player.", "helpful", "career-path", 21),
    cfbBatch4Clue("beamer-radford-start", "After graduating from Virginia Tech, I began my coaching career at Radford High School.", "helpful", "career-path", 20),
    cfbBatch4Clue("beamer-two-conferences", "I won conference championships with Virginia Tech in both the Big East and the ACC.", "strong", "accomplishments", 14),
  ]],
  ["gary-patterson-cfb", [
    cfbBatch4Clue("patterson-181", "I won 181 games at TCU, the most by a head coach in program history.", "strong", "production", 14),
    cfbBatch4Clue("patterson-rose-bowl", "I led TCU to a 13-0 season capped by a Rose Bowl win over Wisconsin.", "giveaway", "accomplishments", 7),
    cfbBatch4Clue("patterson-six-conference", "My TCU teams won six conference championships across three different leagues.", "strong", "accomplishments", 13),
    cfbBatch4Clue("patterson-2014-big12", "I coached TCU to a Big 12 championship and a No. 3 final AP ranking in 2014.", "strong", "accomplishments", 12),
    cfbBatch4Clue("patterson-425", "My defenses became closely associated with an adaptable 4-2-5 scheme.", "giveaway", "style", 9),
    cfbBatch4Clue("patterson-franchione", "I coached with Dennis Franchione at several stops before succeeding him as TCU's head coach.", "strong", "career-path", 17),
  ]],
]);

function cfbBatch4AnswerNameLeak(subject: FootballSubjectProfile, clue: WhoAmIClue) {
  const text = clue.text.toLowerCase();
  if (text.includes(subject.name.toLowerCase())) return true;
  const surname = subject.name
    .replace(/\s+(?:Jr\.?|Sr\.?|II|III|IV)$/i, "")
    .trim()
    .split(/\s+/)
    .at(-1)
    ?.replace(/[^A-Za-z'-]/g, "");
  if (!surname || surname.length < 5) return false;
  return new RegExp("\\b" + surname.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&") + "\\b", "i").test(clue.text);
}

function isCfbBatch4NflStageLeak(clue: WhoAmIClue) {
  const text = clue.text.toLowerCase();
  return (
    /\bnfl\b|super bowl|all-pro|pro bowl|nfl mvp|defensive player of the year|professional football hall of fame/.test(text)
    && !/draft|selected|pick/.test(text)
  );
}

function shouldSuppressCfbBatch4Clue(subject: FootballSubjectProfile, clue: WhoAmIClue) {
  if (
    subject.id === "cfb-kyle-hamilton"
    && (clue.id === "career-path" || clue.id === "affiliation:florida-state" || clue.id === "identity:pr9-cfb-kyle-hamilton--first-notre-dame-stadium-snap-pick-six")
  ) return true;
  if (
    subject.id === "brian-kelly-cfb"
    && (
      clue.id === "affiliation:central-michigan"
      || clue.id === "affiliation:cincinnati"
      || clue.id === "affiliation:lsu"
      || clue.id === "historical-conference:independent"
    )
  ) return true;
  if (cfbBatch4SuppressedClueIds.has(clue.id)) return true;
  if (clue.id.startsWith("fact:nfl-")) return true;
  if (
    clue.id === "fact:cfb-coach-career-wins"
    && (subject.id === "frank-beamer-cfb" || subject.id === "brian-kelly-cfb")
  ) return true;
  if (cfbBatch4StructuralClueIds.has(clue.id)) return true;
  if (cfbBatch4GenericMetricIds.has(clue.id)) return true;
  if (clue.conceptId && cfbBatch4GenericIdentityConcepts.has(clue.conceptId)) return true;
  if (/\b1 (?:sacks|defensive interceptions|pass breakups)\b/i.test(clue.text)) return true;
  if (isCfbBatch4NflStageLeak(clue)) return true;
  if (cfbBatch4AnswerNameLeak(subject, clue)) return true;
  if (cfbBatch4MalformedFirstPerson.test(clue.text)) return true;
  if (cfbBatch4OffFieldFiller.test(clue.text)) return true;
  return false;
}

function trimCfbBatch4Pool(subject: FootballSubjectProfile, clues: readonly WhoAmIClue[]) {
  const target = 16;
  if (clues.length <= target) return [...clues];

  const requiredIds = new Set(subject.kind === "coach" ? [] : [
    "position",
    "school",
    ...(subject.id === "cfb-travis-hunter" ? ["curated-cfb4:hunter-jackson-state-colorado"] : []),
  ]);
  const required = clues.filter((clue) => requiredIds.has(clue.id));
  const requiredIdSet = new Set(required.map((clue) => clue.id));
  const ranked = clues
    .map((clue, index) => ({ clue, index, score: clueQualityScore(subject, clue) }))
    .filter((entry) => !requiredIdSet.has(entry.clue.id))
    .sort((left, right) => right.score - left.score || left.index - right.index);

  const selected = new Set(required.map((clue) => clue.id));
  const selectedConcepts = new Set(required.map((clue) => clue.conceptId ?? clue.id));
  for (const entry of ranked) {
    if (selected.size >= target) break;
    const concept = entry.clue.conceptId ?? entry.clue.id;
    if (selectedConcepts.has(concept)) continue;
    selected.add(entry.clue.id);
    selectedConcepts.add(concept);
  }
  if (selected.size < target) {
    for (const entry of ranked) {
      if (selected.size >= target) break;
      selected.add(entry.clue.id);
    }
  }
  return clues.filter((clue) => selected.has(clue.id));
}

function cfbBatch4ReplayStrength(clue: WhoAmIClue) {
  const facet = whoAmIClueFacet(clue);
  const base: Readonly<Record<NonNullable<WhoAmIClue["facet"]>, number>> = {
    role: 20,
    era: 20,
    background: 40,
    style: 55,
    "career-path": 75,
    accomplishments: 85,
    relationships: 80,
    nickname: 100,
    "off-field": 35,
    production: 25,
    identity: 60,
  };
  let strength = base[facet ?? "identity"] ?? 60;
  const text = clue.text.toLowerCase();
  const selectionClass = whoAmIClueSelectionClass(clue);

  if (selectionClass === "sports-identity") strength += 10;
  else if (selectionClass === "identity-color") strength -= 10;
  else strength -= 35;

  if (/\b(?:heisman|mvp|hall of fame|no\. 1 overall|first overall|first quarterback|champion|championship|title|all-america|all-american|all-pro)\b/.test(text)) strength += 15;
  if (/\b(?:defeated|lost to|fought|shared the octagon|played for|head coach for|transferred from|transferred to|drafted|selected no\.)\b/.test(text)) strength += 12;
  if (/\b(?:signature|celebration|nickname|moniker|jersey number|wore no\.)\b/.test(text)) strength += 18;
  if (/\b\d{2,4}\b/.test(text) && facet === "production") strength -= 5;
  if (/\b\d+\s+(?:ufc\s+)?(?:wins|fights|games|starts)\b/.test(text) && facet === "production") strength -= 8;

  return strength;
}

function rebalanceCfbBatch4ReplayBands(_subject: FootballSubjectProfile, clues: readonly WhoAmIClue[]) {
  const normalized = clues.map((clue) => (
    clue.id === "era" && clue.band === "broad"
      ? { ...clue, band: "helpful" as const }
      : clue
  ));

  const helpfulCandidates = normalized
    .map((clue, index) => ({ clue, index, strength: cfbBatch4ReplayStrength(clue) }))
    .filter(({ clue }) => (
      clue.band !== "broad"
      && clue.band !== "giveaway"
      && whoAmIClueSelectionClass(clue) === "sports-identity"
    ))
    .sort((left, right) => left.strength - right.strength || left.index - right.index)
    .slice(0, 3);

  const helpfulIds = new Set(helpfulCandidates.map(({ clue }) => clue.id));

  return normalized.map((clue) => {
    if (clue.band === "broad" || clue.band === "giveaway") return clue;
    return helpfulIds.has(clue.id)
      ? { ...clue, band: "helpful" as const }
      : { ...clue, band: "strong" as const };
  });
}

function curateCfbBatch4Clues(subject: FootballSubjectProfile, rawClues: readonly WhoAmIClue[]) {
  let colorUsed = false;
  let relationshipUsed = false;
  const curated: WhoAmIClue[] = [];

  for (const rawClue of rawClues) {
    const overriddenClue = cfbBatch4ApplyOverride(subject.id, rawClue);
    const clue = overriddenClue.id === "era"
      ? { ...overriddenClue, text: overriddenClue.text.replace(/^I was active in /, subject.kind === "coach" ? "My college head-coaching career came in " : "My college career came in ") }
      : subject.kind === "coach" && overriddenClue.id === "school"
        ? { ...overriddenClue, text: overriddenClue.text.replace(/^I played college football at /, "I was a college head coach at ") }
        : overriddenClue;
    if (shouldSuppressCfbBatch4Clue(subject, clue)) continue;

    if (clue.identityKnowledge) {
      const selectionClass = whoAmIClueSelectionClass(clue);
      if (selectionClass === "deep-biography") continue;
      if (selectionClass === "identity-color") {
        if (colorUsed) continue;
        colorUsed = true;
      }
      if (whoAmIClueFacet(clue) === "relationships") {
        if (relationshipUsed) continue;
        relationshipUsed = true;
      }
    }
    curated.push(clue);
  }
  curated.push(
    ...(cfbBatch4SupplementalClues.get(subject.id) ?? [])
      .filter((clue) => !shouldSuppressCfbBatch4Clue(subject, clue)),
  );
  return rebalanceCfbBatch4ReplayBands(subject, trimCfbBatch4Pool(subject, curated));
}

export function isCfbWhoAmIBatch4Subject(subjectId: string) {
  return cfbBatch4SubjectIds.has(subjectId);
}

function applyBatch2IdentityCuration(subjectId: string, clue: WhoAmIClue) {
  const override = batch2TextOverrides.get(subjectId + ":" + (clue.conceptId ?? clue.id))
    ?? batch2TextOverrides.get(subjectId + ":" + clue.id);
  return override ? { ...clue, ...override } : clue;
}

function batch2ShouldSuppressMetric(subject: FootballSubjectProfile, clue: WhoAmIClue) {
  if (!clue.id.startsWith("fact:nfl-")) return false;
  if (batch2ActiveOrUnsettledSubjectIds.has(subject.id)) return /^fact:nfl-career-/.test(clue.id);
  if (batch2PartialCareerCoverageSubjectIds.has(subject.id)) return /^fact:nfl-career-/.test(clue.id);
  if (clue.id === "fact:nfl-career-games" || clue.id === "fact:nfl-career-targets") return true;
  if (subject.position === "WR" || subject.position === "TE") {
    if (/^fact:nfl-career-rushing-/.test(clue.id)) return true;
  }
  if (subject.position === "RB") {
    if (/^fact:nfl-career-rushing-(?:attempts|yards-per-attempt)$/.test(clue.id)) return true;
  }
  if (subject.id === "nfl-devin-hester" && /^fact:nfl-career-receiv/.test(clue.id)) return true;
  if (subject.id === "mike-ditka" && /^fact:nfl-coach-/.test(clue.id)) return true;
  return false;
}

const batch2ForcedPoolIds = new Map<string, ReadonlySet<string>>([
  ["nfl-jerry-rice", new Set([
    "position",
    "era",
    "school",
    "identity:football-after-cutting-class",
    "curated2:rice-80",
    "curated2:rice-route-work",
    "draft-pick",
    "identity:49ers-traded-up",
    "identity:edgewood-hill-workout",
    "curated2:rice-three-sb",
    "curated2:rice-sb23-mvp",
    "curated2:rice-records",
  ])],
  ["mike-ditka", new Set([
    "position",
    "curated2:ditka-era",
    "identity:pr7-mike-ditka-dentistry-plan",
    "identity:pr7-mike-ditka-early-modern-tight-end",
    "curated2:ditka-pitt",
    "curated2:ditka-89",
    "curated2:ditka-pitt-two-way",
    "fact:nfl-career-receiving-yards",
    "identity:pr7-mike-ditka-letter-to-halas",
    "identity:resume-mike-ditka-01",
    "curated2:ditka-rookie",
    "curated2:ditka-fifth",
    "curated2:ditka-iron",
    "curated2:ditka-coach",
  ])],
]);

function trimNflBatch2Pool(subject: FootballSubjectProfile, clues: readonly WhoAmIClue[]) {
  const target = subject.id === "nfl-jerry-rice" || subject.id === "mike-ditka" ? 12 : 16;
  if (clues.length <= target) return [...clues];

  const ranked = clues
    .map((clue, index) => ({ clue, index, score: clueQualityScore(subject, clue) }))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  const selected = new Set(ranked.slice(0, target).map((entry) => entry.clue.id));
  return clues.filter((clue) => selected.has(clue.id));
}

function curateNflBatch2Clues(subject: FootballSubjectProfile, rawClues: readonly WhoAmIClue[]) {
  const retained = batch2RetainedIdentityConcepts.get(subject.id);
  let colorUsed = false;
  const curated: WhoAmIClue[] = [];

  for (const rawClue of rawClues) {
    if (rawClue.id === "player-career-start" || rawClue.id === "player-career-end") continue;
    if (rawClue.id === "career-span" && batch2SuppressedCareerSpanSubjectIds.has(subject.id)) continue;
    if (subject.id === "nfl-kellen-winslow" && rawClue.id === "era") continue;
    if (batch2ShouldSuppressMetric(subject, rawClue)) continue;
    if (
      rawClue.identityKnowledge
      && retained
      && !retained.has(rawClue.conceptId ?? "")
      && !retained.has(rawClue.id)
    ) continue;

    const clue = applyBatch2IdentityCuration(subject.id, rawClue);
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

  curated.push(...(batch2SupplementalClues.get(subject.id) ?? []));
  const forcedPool = batch2ForcedPoolIds.get(subject.id);
  if (forcedPool) return curated.filter((clue) => forcedPool.has(clue.id));
  return trimNflBatch2Pool(subject, curated);
}

export function isNflWhoAmIBatch2Subject(subjectId: string) {
  return batch2SubjectIds.has(subjectId);
}

export function isNflWhoAmIBatch1Subject(subjectId: string) {
  return batchSubjectIds.has(subjectId);
}

export function curateFootballWhoAmIClues(
  subject: FootballSubjectProfile,
  rawClues: readonly WhoAmIClue[],
): WhoAmIClue[] {
  if (subject.league === "CFB" && cfbBatch1SubjectIds.has(subject.id)) {
    return refineCfbWhoAmIContent(subject, curateCfbBatch1Clues(subject, rawClues));
  }
  if (subject.league === "CFB" && cfbBatch2SubjectIds.has(subject.id)) {
    return refineCfbWhoAmIContent(subject, curateCfbBatch2Clues(subject, rawClues));
  }
  if (subject.league === "CFB" && cfbBatch3SubjectIds.has(subject.id)) {
    return refineCfbWhoAmIContent(subject, curateCfbBatch3Clues(subject, rawClues));
  }
  if (subject.league === "CFB" && cfbBatch4SubjectIds.has(subject.id)) {
    return refineCfbWhoAmIContent(subject, curateCfbBatch4Clues(subject, rawClues));
  }
  if (subject.league !== "NFL") return [...rawClues];
  if (batch4SubjectIds.has(subject.id)) return refineNflWhoAmIContent(subject, curateNflBatch4Clues(subject, rawClues));
  if (batch3SubjectIds.has(subject.id)) return refineNflWhoAmIContent(subject, curateNflBatch3Clues(subject, rawClues));
  if (batch2SubjectIds.has(subject.id)) return refineNflWhoAmIContent(subject, curateNflBatch2Clues(subject, rawClues));
  if (!batchSubjectIds.has(subject.id)) return refineNflWhoAmIContent(subject, rawClues);

  const retained = retainedIdentityConcepts.get(subject.id);
  let colorUsed = false;
  const curated: WhoAmIClue[] = [];

  for (const rawClue of rawClues) {
    if (suppressedBatchStructuralClueIds.has(rawClue.id)) continue;
    if (subject.id === "brett-favre" && rawClue.id === "era") continue;
    if (rawClue.id === "career-span" && suppressedCareerSpanSubjectIds.has(subject.id)) continue;
    if (active2026SubjectIds.has(subject.id) && /^fact:nfl-career-/.test(rawClue.id)) continue;
    if (
      subject.id === "nfl-aaron-rodgers"
      && (rawClue.id === "career-path" || rawClue.id.startsWith("affiliation:"))
    ) continue;
    if (
      partialQuarterbackRushingSubjectIds.has(subject.id)
      && /^fact:nfl-career-rushing-/.test(rawClue.id)
    ) continue;
    if (
      rawClue.identityKnowledge
      && retained
      && !retained.has(rawClue.conceptId ?? "")
      && !retained.has(rawClue.id)
    ) continue;
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
  return refineNflWhoAmIContent(subject, trimDeepPool(subject, curated));
}
