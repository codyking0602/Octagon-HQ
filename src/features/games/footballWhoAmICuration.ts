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
  ["nfl-harry-carson", keep("identity:harry-carson-college-line-to-middle-linebacker", "identity:harry-carson-parcells-team-conduit", "identity:pro-bowls", "identity:super-bowl-xxi-title")],
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
  ["nfl-darren-sharper", keep("identity:darren-sharper-mike-tomlin-college-relationship", "identity:darren-sharper-jamie-sharper-draft")],
  ["nfl-deangelo-hall", keep("identity:deangelo-hall-green-sanders-role-models")],
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
    batch4Clue("carson-scsu", "I played college football at South Carolina State.", "helpful", "background"),
    batch4Clue("carson-fourth-round", "The Giants selected me in the fourth round of the 1976 NFL Draft.", "helpful", "career-path"),
    batch4Clue("carson-giants-only", "I spent all 13 of my NFL seasons with the New York Giants.", "helpful", "career-path", 16),
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
    batch4Clue("sharper-wm", "I played college football at William & Mary.", "helpful", "background"),
    batch4Clue("sharper-second", "Green Bay selected me in the second round of the 1997 NFL Draft.", "strong", "career-path"),
    batch4Clue("sharper-path", "My NFL career included Green Bay, Minnesota and New Orleans.", "strong", "career-path"),
    batch4Clue("sharper-five-pb", "I was selected to five Pro Bowls.", "strong", "accomplishments"),
    batch4Clue("sharper-sb44", "I won Super Bowl XLIV in my first season with New Orleans.", "giveaway", "accomplishments", 9),
    batch4Clue("sharper-qb-safety", "I arrived at college as a quarterback prospect before becoming a safety.", "helpful", "role"),
    batch4Clue("sharper-11-pick-sixes", "I returned 11 interceptions for touchdowns, second-most in NFL history when I retired.", "strong", "accomplishments"),
    batch4Clue("sharper-2009-return-record", "In 2009 I set an NFL single-season record with 376 interception-return yards.", "strong", "accomplishments"),
  ]],
  ["nfl-deangelo-hall", [
    batch4Clue("hall-vt", "I played college football at Virginia Tech.", "helpful", "background"),
    batch4Clue("hall-eighth", "Atlanta selected me No. 8 overall in the 2004 NFL Draft.", "strong", "career-path"),
    batch4Clue("hall-path", "I played for Atlanta, Oakland and Washington.", "helpful", "career-path"),
    batch4Clue("hall-three-pb", "I was selected to three Pro Bowls.", "helpful", "accomplishments"),
    batch4Clue("hall-pro-bowl-mvp", "I was named MVP of the 2011 Pro Bowl.", "strong", "accomplishments", 16),
    batch4Clue("hall-four-int", "I tied an NFL single-game record with four interceptions against Chicago in 2010.", "giveaway", "accomplishments", 8),
    batch4Clue("hall-two-way-vt", "Virginia Tech used me at wide receiver as well as defensive back.", "helpful", "role"),
    batch4Clue("hall-safety", "Late in my career I moved from cornerback to safety.", "helpful", "role"),
    batch4Clue("hall-23", "No. 23 became my signature number in Washington.", "helpful", "identity"),
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
  return trimNflBatch4Pool(subject, curated);
}

export function isNflWhoAmIBatch4Subject(subjectId: string) {
  return batch4SubjectIds.has(subjectId);
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
  if (subject.league !== "NFL") return [...rawClues];
  if (batch4SubjectIds.has(subject.id)) return curateNflBatch4Clues(subject, rawClues);
  if (batch3SubjectIds.has(subject.id)) return curateNflBatch3Clues(subject, rawClues);
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
  return trimDeepPool(subject, curated);
}
