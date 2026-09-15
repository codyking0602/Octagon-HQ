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
  ]],
  ["nfl-bijan-robinson", [
    batch2Supplement("bijan-texas", "I played college football at Texas.", "helpful", "background"),
    batch2Supplement("bijan-doak", "I won the Doak Walker Award in my final season at Texas.", "strong"),
    batch2Supplement("bijan-draft", "Atlanta selected me No. 8 overall in the 2023 NFL Draft.", "giveaway", "career-path", 10),
    batch2Supplement("bijan-7", "I wear No. 7 for the Falcons.", "strong", "identity"),
    batch2Supplement("bijan-2025-allpro", "I earned first-team AP All-Pro honors at running back for the 2025 season.", "giveaway", "accomplishments", 10),
    batch2Supplement("bijan-scrimmage-2025", "I led the NFL with 2,298 yards from scrimmage in 2025.", "strong", "production"),
    batch2Supplement("bijan-probowls", "I made the Pro Bowl in both 2024 and 2025.", "strong"),
    batch2Supplement("bijan-arizona-record", "I left high school as Arizona's all-time rushing leader.", "strong", "background"),
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
    batch2Supplement("rice-three-sb", "I won three Super Bowls with San Francisco.", "giveaway", "accomplishments", 9),
    batch2Supplement("rice-sb23-mvp", "I was the MVP of Super Bowl XXIII after catching 11 passes for 215 yards and a touchdown.", "giveaway", "accomplishments", 8),
    batch2Supplement("rice-records", "I retired as the NFL's career leader in receptions, receiving yards and receiving touchdowns.", "giveaway", "accomplishments", 7),
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
  ]],
  ["nfl-cliff-branch", [
    batch2Supplement("branch-raiders", "I spent my entire NFL career with the Raiders.", "giveaway", "career-path", 10),
    batch2Supplement("branch-three-sb", "I won Super Bowls XI, XV and XVIII with the Raiders.", "giveaway", "accomplishments", 8),
    batch2Supplement("branch-allpro", "I earned first-team All-Pro honors three straight seasons from 1974 through 1976.", "strong"),
    batch2Supplement("branch-hof", "I was posthumously inducted into the Pro Football Hall of Fame in 2022.", "strong"),
  ]],
  ["nfl-cris-carter", [
    batch2Supplement("carter-ohio-state", "I starred at Ohio State before entering the NFL through the supplemental draft.", "strong", "background"),
    batch2Supplement("carter-vikings", "Minnesota claimed me after Philadelphia released me, and the Vikings became the team most associated with my career.", "giveaway", "career-path", 10),
    batch2Supplement("carter-buddy-quote", "Buddy Ryan famously explained my Eagles release by saying that all I did was catch touchdowns.", "giveaway", "identity", 9),
    batch2Supplement("carter-probowls", "I was selected to eight consecutive Pro Bowls from 1993 through 2000.", "strong"),
    batch2Supplement("carter-tds", "I finished with 130 career receiving touchdowns.", "strong", "production"),
    batch2Supplement("carter-moss", "Randy Moss joined me in Minnesota in 1998, creating one of the era's defining receiver tandems.", "giveaway", "relationships", 10),
    batch2Supplement("carter-hof", "I was inducted into the Pro Football Hall of Fame in 2013.", "strong"),
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
    batch2Supplement("ditka-rookie", "As a rookie I became the first NFL tight end to top 1,000 receiving yards in a season and won Rookie of the Year.", "giveaway", "accomplishments", 8),
    batch2Supplement("ditka-iron", "I became widely known as 'Iron Mike.'", "giveaway", "nickname", 9),
    batch2Supplement("ditka-coach", "I later coached the 1985 Bears to a Super Bowl XX championship.", "giveaway", "career-path", 8),
  ]],
  ["ozzie-newsome", [
    batch2Supplement("ozzie-era", "My playing career ran from the late 1970s through the 1980s.", "broad", "era", 30),
  ]],
  ["shannon-sharpe", [
    batch2Supplement("sharpe-savannah", "I starred at Savannah State before Denver drafted me in the seventh round in 1990.", "strong", "career-path"),
    batch2Supplement("sharpe-brother", "My older brother Sterling Sharpe was already an NFL star receiver while I was becoming a tight end.", "strong", "relationships"),
    batch2Supplement("sharpe-three-sb", "I won two Super Bowls with Denver and another with Baltimore.", "giveaway", "accomplishments", 8),
    batch2Supplement("sharpe-probowls", "I was selected to eight Pro Bowls.", "strong"),
    batch2Supplement("sharpe-records", "I retired holding the NFL tight-end career records for receptions and receiving yards.", "giveaway", "accomplishments", 9),
    batch2Supplement("sharpe-ravens", "My lone team outside Denver was Baltimore, where I won Super Bowl XXXV.", "strong", "career-path"),
  ]],
  ["nfl-tony-gonzalez", [
    batch2Supplement("gonzalez-falcons", "After 12 seasons in Kansas City, I finished my career with five seasons in Atlanta.", "strong", "career-path"),
    batch2Supplement("gonzalez-probowls", "I was selected to 14 Pro Bowls.", "giveaway", "accomplishments", 9),
    batch2Supplement("gonzalez-allpro", "I earned first-team All-Pro honors seven times.", "strong"),
    batch2Supplement("gonzalez-records", "I retired as the career leader among tight ends in receptions, receiving yards and receiving touchdowns.", "giveaway", "accomplishments", 8),
  ]],
  ["nfl-travis-kelce", [
    batch2Supplement("kelce-87", "I wear No. 87 for Kansas City.", "strong", "identity"),
    batch2Supplement("kelce-three-sb", "I won Super Bowls LIV, LVII and LVIII with the Chiefs.", "giveaway", "accomplishments", 8),
    batch2Supplement("kelce-seven-1k", "I became the first tight end in NFL history to record seven consecutive 1,000-yard receiving seasons.", "giveaway", "accomplishments", 9),
    batch2Supplement("kelce-mahomes", "Patrick Mahomes became my quarterback for the Chiefs' championship run.", "strong", "relationships"),
    batch2Supplement("kelce-2026", "I returned to Kansas City for the 2026 season and remained an active Chief.", "strong", "career-path"),
  ]],
  ["zach-ertz", [
    batch2Supplement("ertz-stanford", "I played college football at Stanford.", "helpful", "background"),
    batch2Supplement("ertz-draft", "Philadelphia selected me No. 35 overall in the 2013 NFL Draft.", "strong", "career-path"),
    batch2Supplement("ertz-sb52", "I caught the go-ahead touchdown in the fourth quarter of Philadelphia's Super Bowl LII victory.", "giveaway", "accomplishments", 8),
    batch2Supplement("ertz-116", "My 116 catches in 2018 set a single-season NFL record for a tight end at the time.", "giveaway", "production", 9),
    batch2Supplement("ertz-path", "My NFL career included Philadelphia, Arizona and Washington.", "strong", "career-path"),
    batch2Supplement("ertz-probowls", "I was selected to three Pro Bowls.", "strong"),
    batch2Supplement("ertz-eagles", "I spent my first nine seasons with the Eagles.", "giveaway", "career-path", 10),
  ]],
]);

function applyBatch2IdentityCuration(subjectId: string, clue: WhoAmIClue) {
  const override = batch2TextOverrides.get(subjectId + ":" + (clue.conceptId ?? clue.id));
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

function curateNflBatch2Clues(subject: FootballSubjectProfile, rawClues: readonly WhoAmIClue[]) {
  const retained = batch2RetainedIdentityConcepts.get(subject.id);
  let colorUsed = false;
  const curated: WhoAmIClue[] = [];

  for (const rawClue of rawClues) {
    if (rawClue.id === "player-career-start" || rawClue.id === "player-career-end") continue;
    if (rawClue.id === "career-span" && batch2SuppressedCareerSpanSubjectIds.has(subject.id)) continue;
    if (subject.id === "nfl-kellen-winslow" && rawClue.id === "era") continue;
    if (batch2ShouldSuppressMetric(subject, rawClue)) continue;
    if (rawClue.identityKnowledge && retained && !retained.has(rawClue.conceptId ?? "")) continue;

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
  return trimDeepPool(subject, curated);
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
  if (subject.league !== "NFL") return [...rawClues];
  if (batch2SubjectIds.has(subject.id)) return curateNflBatch2Clues(subject, rawClues);
  if (!batchSubjectIds.has(subject.id)) return [...rawClues];

  const retained = retainedIdentityConcepts.get(subject.id);
  let colorUsed = false;
  const curated: WhoAmIClue[] = [];

  for (const rawClue of rawClues) {
    if (suppressedBatchStructuralClueIds.has(rawClue.id)) continue;
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
