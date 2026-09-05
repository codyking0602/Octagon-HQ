import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => JSON.parse(fs.readFileSync(new URL(path, root), "utf8"));
const write = (path, value) => fs.writeFileSync(new URL(path, root), `${JSON.stringify(value)}\n`);
const ixFor = (corpus) => Object.fromEntries(corpus.columns.map((column, index) => [column, index]));
const at = (row, ix, column) => ix[column] == null ? undefined : row[ix[column]];
const promoted = (tier) => tier === "A" || tier === "B" || tier === "C";

const recognition = read("data/generated/football/recognizability-projection.json");
const nflPlayers = read("data/generated/football/nfl/player-seasons-1999-2025.json");
const ix = ixFor(nflPlayers);

const teamSeasonsBySourcePlayerId = new Map();
for (const row of nflPlayers.rows) {
  const sourcePlayerId = String(at(row, ix, "sourcePlayerId") ?? "").trim();
  const teamCode = String(at(row, ix, "recentTeam") ?? "").trim();
  const season = Number(at(row, ix, "season"));
  if (!sourcePlayerId || !teamCode || !Number.isInteger(season)) continue;

  const teamSeasons = teamSeasonsBySourcePlayerId.get(sourcePlayerId) ?? new Map();
  const seasons = teamSeasons.get(teamCode) ?? new Set();
  seasons.add(season);
  teamSeasons.set(teamCode, seasons);
  teamSeasonsBySourcePlayerId.set(sourcePlayerId, teamSeasons);
}

function representativeTeamCode(sourcePlayerId) {
  const teamSeasons = teamSeasonsBySourcePlayerId.get(String(sourcePlayerId));
  if (!teamSeasons?.size) return null;
  return [...teamSeasons.entries()]
    .map(([teamCode, seasons]) => ({ teamCode, seasons: [...seasons].sort((a, b) => a - b) }))
    .sort((left, right) => (
      right.seasons.length - left.seasons.length
      || (right.seasons.at(-1) ?? 0) - (left.seasons.at(-1) ?? 0)
      || left.teamCode.localeCompare(right.teamCode)
    ))[0]?.teamCode ?? null;
}

const nflCareerTeamCodes = recognition.records
  .filter((record) => record.kind === "player-career" && record.league === "NFL" && record.sourceProvider === "nflverse" && promoted(record.tier))
  .flatMap((record) => {
    const teamCode = representativeTeamCode(record.sourceId);
    return teamCode ? [[record.id, teamCode]] : [];
  })
  .sort((left, right) => left[0].localeCompare(right[0]));

write("data/generated/football/career-media-context.json", {
  schemaVersion: 1,
  methodology: "NFL player-career display teams derive from the pinned nflverse player-season corpus by most seasons with a franchise, then latest season and team code as deterministic tie-breakers. Reviewed person media remains authoritative when present.",
  nflCareerTeamCodes,
});

console.log(`Generated ${nflCareerTeamCodes.length} NFL career media relationships.`);
