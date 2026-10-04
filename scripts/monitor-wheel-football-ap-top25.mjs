#!/usr/bin/env node
import fs from "node:fs";

const authority = JSON.parse(
  fs.readFileSync("data/curated/football/cfb/ap-top-25-current.json", "utf8"),
);
const upstreamUrl =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings";

function text(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function record(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalize(payload) {
  const rankings = Array.isArray(payload?.rankings) ? payload.rankings : [];
  const poll = rankings.find((candidate) => {
    const row = record(candidate);
    const label = [row?.name, row?.shortName, row?.type].map(text).filter(Boolean).join(" ");
    return /\bAP\b|Associated Press/i.test(label);
  });
  if (!poll || !Array.isArray(poll.ranks)) return null;

  const teams = poll.ranks
    .map((raw) => {
      const row = record(raw);
      const team = record(row?.team);
      const rank = Number(row?.current ?? row?.rank);
      const espnId = text(team?.id);
      const name = text(team?.displayName) ?? text(team?.location) ?? text(team?.name);
      return Number.isInteger(rank) && rank >= 1 && rank <= 25 && espnId && name
        ? { rank, espnId, name }
        : null;
    })
    .filter(Boolean)
    .sort((left, right) => left.rank - right.rank);

  if (teams.length !== 25 || teams.some((team, index) => team.rank !== index + 1)) return null;
  return teams;
}

let response;
try {
  response = await fetch(upstreamUrl, {
    headers: { Accept: "application/json", "User-Agent": "OctagonHQ/1.0" },
  });
} catch (error) {
  console.warn(`::warning title=AP Top 25 monitor unavailable::${error instanceof Error ? error.message : String(error)}`);
  process.exit(0);
}

if (!response.ok) {
  console.warn(`::warning title=AP Top 25 monitor unavailable::ESPN returned HTTP ${response.status}.`);
  process.exit(0);
}

const live = normalize(await response.json());
if (!live) {
  console.warn("::warning title=AP Top 25 monitor unavailable::No complete AP Top 25 was returned.");
  process.exit(0);
}

const expected = authority.teams.map(({ rank, espnId, name }) => ({ rank, espnId, name }));
const liveKey = live.map((team) => `${team.rank}:${team.espnId}`).join("|");
const expectedKey = expected.map((team) => `${team.rank}:${team.espnId}`).join("|");

if (liveKey === expectedKey) {
  console.log(`AP Top 25 Wheel authority is current: ${authority.pollDate}, 25 teams.`);
  process.exit(0);
}

const expectedById = new Map(expected.map((team) => [team.espnId, team]));
const liveById = new Map(live.map((team) => [team.espnId, team]));
const entered = live.filter((team) => !expectedById.has(team.espnId));
const left = expected.filter((team) => !liveById.has(team.espnId));
const moved = live.filter((team) => {
  const prior = expectedById.get(team.espnId);
  return prior && prior.rank !== team.rank;
});

console.error(
  [
    "::error title=AP Top 25 Wheel update required::The live AP poll differs from the checked-in Wheel authority.",
    entered.length ? `Entered: ${entered.map((team) => `#${team.rank} ${team.name}`).join(", ")}.` : "",
    left.length ? `Left: ${left.map((team) => `#${team.rank} ${team.name}`).join(", ")}.` : "",
    moved.length ? `Moved: ${moved.map((team) => `${team.name} #${expectedById.get(team.espnId).rank}->#${team.rank}`).join(", ")}.` : "",
    "Update the AP authority only after every entering school has complete Wheel candidates and locked grades.",
  ].filter(Boolean).join(" "),
);
process.exit(1);
