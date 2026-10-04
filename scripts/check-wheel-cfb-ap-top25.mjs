import fs from "node:fs";

const authorityPath = "data/curated/football/cfb/ap-top-25-2026-current.json";
const authority = JSON.parse(fs.readFileSync(authorityPath, "utf8"));
const response = await fetch(authority.monitoringSourceUrl, {
  headers: { Accept: "application/json", "User-Agent": "Octagon-HQ-AP-Top25-Monitor/1.0" },
});
if (!response.ok) {
  throw new Error(`AP Top 25 monitoring source returned HTTP ${response.status}; keeping the current verified production poll.`);
}

const payload = await response.json();
const rankings = Array.isArray(payload?.rankings) ? payload.rankings : [];
const ap = rankings.find((ranking) => {
  const identity = [ranking?.name, ranking?.shortName, ranking?.headline]
    .filter((value) => typeof value === "string")
    .join(" ");
  return /\bAP\b/i.test(identity) && /25|poll/i.test(identity);
});
if (!ap || !Array.isArray(ap.ranks)) {
  throw new Error("AP Top 25 was not present in the monitoring payload; keeping the current verified production poll.");
}

const normalize = (value) => String(value ?? "")
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]/g, "");

const live = ap.ranks
  .map((entry) => ({
    rank: Number(entry?.current),
    teamName: entry?.team?.location ?? entry?.team?.displayName ?? entry?.team?.name ?? "",
  }))
  .filter((entry) => Number.isInteger(entry.rank) && entry.rank >= 1 && entry.rank <= 25)
  .sort((left, right) => left.rank - right.rank)
  .slice(0, 25);

if (live.length !== 25 || live.some((entry, index) => entry.rank !== index + 1)) {
  throw new Error("Monitoring payload did not contain one complete ordered AP Top 25; keeping the current verified production poll.");
}

const expected = authority.teams.map((entry) => ({
  rank: entry.rank,
  teamName: entry.teamName,
}));

const changed = live.some((entry, index) => (
  entry.rank !== expected[index]?.rank
  || normalize(entry.teamName) !== normalize(expected[index]?.teamName)
));

if (changed) {
  console.error("A new AP Top 25 appears to be available. Production remains on the last verified poll until the ranked-team authority and any newly required Wheel grading are reviewed.");
  console.error(JSON.stringify(live, null, 2));
  process.exitCode = 1;
} else {
  console.log(`AP Top 25 verified unchanged from ${authority.pollDate}.`);
}
