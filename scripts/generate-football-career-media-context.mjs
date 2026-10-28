import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => JSON.parse(fs.readFileSync(new URL(path, root), "utf8"));
const write = (path, value) => fs.writeFileSync(new URL(path, root), `${JSON.stringify(value)}\n`);
const ixFor = (corpus) => Object.fromEntries(corpus.columns.map((column, index) => [column, index]));
const at = (row, ix, column) => ix[column] == null ? undefined : row[ix[column]];
const promoted = (tier) => tier === "A" || tier === "B" || tier === "C";
const slugify = (value) => String(value ?? "")
  .toLowerCase()
  .replace(/a\s*&\s*m/g, "am")
  .replace(/&/g, "and")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const recognition = read("data/generated/football/recognizability-projection.json");
const nflPlayers = read("data/generated/football/nfl/player-seasons-1999-2025.json");
const cfbPlayers = read("data/generated/football/cfb/player-seasons-2014-2025.json");
const cfbPrograms = read("data/generated/football/relationships/cfb-programs-2002-2025.json");
const nflIx = ixFor(nflPlayers);
const cfbIx = ixFor(cfbPlayers);
const cfbProgramIx = ixFor(cfbPrograms);

function teamSeasonsByPlayer(corpus, ix, teamColumn) {
  const result = new Map();
  for (const row of corpus.rows) {
    const sourcePlayerId = String(at(row, ix, "sourcePlayerId") ?? "").trim();
    const team = String(at(row, ix, teamColumn) ?? "").trim();
    const season = Number(at(row, ix, "season"));
    if (!sourcePlayerId || !team || !Number.isInteger(season)) continue;

    const teamSeasons = result.get(sourcePlayerId) ?? new Map();
    const seasons = teamSeasons.get(team) ?? new Set();
    seasons.add(season);
    teamSeasons.set(team, seasons);
    result.set(sourcePlayerId, teamSeasons);
  }
  return result;
}

function representativeTeam(teamSeasonsBySourcePlayerId, sourcePlayerId) {
  const teamSeasons = teamSeasonsBySourcePlayerId.get(String(sourcePlayerId));
  if (!teamSeasons?.size) return null;
  return [...teamSeasons.entries()]
    .map(([team, seasons]) => ({ team, seasons: [...seasons].sort((a, b) => a - b) }))
    .sort((left, right) => (
      right.seasons.length - left.seasons.length
      || (right.seasons.at(-1) ?? 0) - (left.seasons.at(-1) ?? 0)
      || left.team.localeCompare(right.team)
    ))[0]?.team ?? null;
}

const nflTeamSeasonsBySourcePlayerId = teamSeasonsByPlayer(nflPlayers, nflIx, "recentTeam");
const cfbTeamSeasonsBySourcePlayerId = teamSeasonsByPlayer(cfbPlayers, cfbIx, "team");

/**
 * Reviewed historical media relationships are required only where the pinned normalized NFL player corpus cannot
 * reach the career at all. They intentionally provide display identity only; they do not alter factual stats,
 * recognition, rankings, or the canonical subject ledger.
 */
const reviewedHistoricalNflCareerTeamCodes = [
  ["dan-fouts", "LAC"],
  ["ken-anderson", "CIN"],
  ["ken-stabler", "LV"],
  ["sonny-jurgensen", "WSH"],
  ["bob-griese", "MIA"],
  ["warren-moon", "TEN"],
  ["joe-namath", "NYJ"],
  ["len-dawson", "KC"],
  ["nfl-bart-starr", "GB"],
  ["nfl-bobby-layne", "DET"],
  ["nfl-fran-tarkenton", "MIN"],
  ["nfl-jim-kelly", "BUF"],
  ["nfl-otto-graham", "CLE"],
  ["nfl-sammy-baugh", "WSH"],
  ["nfl-sid-luckman", "CHI"],
  ["nfl-ya-tittle", "SF"],
  ["nfl-boomer-esiason", "CIN"],
  ["nfl-george-blanda", "LV"],
  ["nfl-joe-theismann", "WSH"],
  ["roger-craig", "SF"],
  ["john-riggins", "WSH"],
  ["franco-harris", "PIT"],
  ["gale-sayers", "CHI"],
  ["leroy-kelly", "CLE"],
  ["nfl-bronko-nagurski", "CHI"],
  ["nfl-doak-walker", "DET"],
  ["nfl-frank-gifford", "NYG"],
  ["nfl-harold-red-grange", "CHI"],
  ["nfl-paul-hornung", "GB"],
  ["nfl-floyd-little", "DEN"],
  ["nfl-larry-csonka", "MIA"],
  ["nfl-charlie-sanders", "DET"],
  ["nfl-dave-casper", "LV"],
  ["nfl-jackie-smith", "ARI"],
  ["nfl-don-hutson", "GB"],
  ["nfl-raymond-berry", "IND"],
  ["nfl-art-monk", "WSH"],
  ["nfl-bob-hayes", "DAL"],
  ["nfl-charley-taylor", "WSH"],
  ["nfl-charlie-joiner", "LAC"],
  ["nfl-cliff-branch", "LV"],
  ["nfl-don-maynard", "NYJ"],
  ["nfl-drew-pearson", "DAL"],
  ["nfl-fred-biletnikoff", "LV"],
  ["nfl-harold-carmichael", "PHI"],
  ["nfl-james-lofton", "GB"],
  ["nfl-john-stallworth", "PIT"],
  ["nfl-lance-alworth", "LAC"],
  ["nfl-lynn-swann", "PIT"],
  ["nfl-paul-warfield", "CLE"],
  ["nfl-sterling-sharpe", "GB"],
  ["nfl-steve-largent", "SEA"],
  ["nfl-andre-reed", "BUF"],
  ["nfl-michael-irvin", "DAL"],
  ["nfl-jim-thorpe", "ARI"],
];

const sourceBackedNflCareerTeamCodes = recognition.records
  .filter((record) => record.kind === "player-career" && record.league === "NFL" && record.sourceProvider === "nflverse" && promoted(record.tier))
  .flatMap((record) => {
    const teamCode = representativeTeam(nflTeamSeasonsBySourcePlayerId, record.sourceId);
    return teamCode ? [[record.id, teamCode]] : [];
  });

const nflCareerTeamCodes = [...new Map([
  ...reviewedHistoricalNflCareerTeamCodes,
  ...sourceBackedNflCareerTeamCodes,
]).entries()].sort((left, right) => left[0].localeCompare(right[0]));

const cfbProgramRowsBySlug = new Map();
for (const row of cfbPrograms.rows) {
  const sourceProgramId = String(at(row, cfbProgramIx, "sourceProgramId") ?? "").trim();
  const programName = String(at(row, cfbProgramIx, "programName") ?? "").trim();
  const slug = slugify(programName);
  if (!sourceProgramId || !programName || !slug) continue;
  const values = cfbProgramRowsBySlug.get(slug) ?? [];
  values.push({ sourceProgramId, programName });
  cfbProgramRowsBySlug.set(slug, values);
}

const cfbProgramMediaOwners = [...cfbProgramRowsBySlug.values()]
  .filter((values) => new Set(values.map((value) => value.sourceProgramId)).size === 1)
  .map((values) => [values[0].programName, values[0].sourceProgramId])
  .sort((left, right) => left[0].localeCompare(right[0]));

const cfbProgramBySlug = new Map(cfbProgramMediaOwners.map(([programName, sourceProgramId]) => [slugify(programName), { programName, sourceProgramId }]));
const cfbCareerPrograms = recognition.records
  .filter((record) => record.kind === "player-career" && record.league === "CFB" && record.sourceProvider === "cfbfastR" && promoted(record.tier))
  .flatMap((record) => {
    const teamName = representativeTeam(cfbTeamSeasonsBySourcePlayerId, record.sourceId);
    const program = teamName ? cfbProgramBySlug.get(slugify(teamName)) : null;
    return program ? [[record.id, program.programName]] : [];
  })
  .sort((left, right) => left[0].localeCompare(right[0]));

write("data/generated/football/career-media-context.json", {
  schemaVersion: 2,
  methodology: "Source-backed NFL and CFB player-career display teams derive from pinned normalized player-season corpora by most seasons with a team, then latest season and team name as deterministic tie-breakers. CFB program marks resolve through the pinned cfbfastR program relationship corpus. Reviewed historical NFL relationships cover only careers outside the normalized 1999+ source window. Reviewed person media remains authoritative when present.",
  nflCareerTeamCodes,
  cfbCareerPrograms,
  cfbProgramMediaOwners,
});

console.log(`Generated ${nflCareerTeamCodes.length} NFL career media relationships, ${cfbCareerPrograms.length} source-backed CFB career relationships, and ${cfbProgramMediaOwners.length} CFB program media owners.`);
