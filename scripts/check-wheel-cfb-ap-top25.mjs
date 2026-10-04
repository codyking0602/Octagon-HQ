import { readFileSync } from "node:fs";

const ESPN_RANKINGS_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings";

const ESPN_ID_BY_SCHOOL = Object.freeze({
  texas: "251",
  georgia: "61",
  "notre-dame": "87",
  miami: "2390",
  "ohio-state": "194",
  indiana: "84",
  alabama: "333",
  florida: "57",
  "ole-miss": "145",
  byu: "252",
  lsu: "99",
  "texas-tech": "2641",
  utah: "254",
  iowa: "2294",
  oregon: "2483",
  "mississippi-state": "344",
  tennessee: "2633",
  usc: "30",
  "oklahoma-state": "197",
  houston: "248",
  smu: "2567",
  "boise-state": "68",
  ucla: "26",
  kentucky: "96",
  missouri: "142",
});

function checkedInSnapshot() {
  const source = readFileSync(
    "src/features/back-room/wheelFootballApTop25.ts",
    "utf8",
  );
  const entries = [...source.matchAll(/\{ rank: (\d+), schoolId: "([^"]+)" \}/g)]
    .map((match) => ({
      rank: Number(match[1]),
      schoolId: match[2],
      espnId: ESPN_ID_BY_SCHOOL[match[2]],
    }));
  if (entries.length !== 25 || entries.some((entry) => !entry.espnId)) {
    throw new Error("Checked-in Wheel AP Top 25 snapshot is not a complete 25-team ESPN mapping.");
  }
  return entries;
}

function currentApRows(payload) {
  const rankings = Array.isArray(payload?.rankings) ? payload.rankings : [];
  const poll = rankings.find((ranking) => /AP Top 25/i.test(
    String(ranking?.name ?? ranking?.shortName ?? ""),
  ));
  if (!poll) throw new Error("ESPN rankings payload did not include the AP Top 25.");

  const rows = Array.isArray(poll.ranks) ? poll.ranks : [];
  const normalized = rows
    .map((row) => ({
      rank: Number(row?.current ?? row?.rank ?? row?.ranking),
      espnId: String(row?.team?.id ?? ""),
      name: String(row?.team?.location ?? row?.team?.displayName ?? row?.team?.name ?? ""),
    }))
    .filter((row) => Number.isInteger(row.rank) && row.rank >= 1 && row.rank <= 25)
    .sort((left, right) => left.rank - right.rank);

  if (normalized.length !== 25 || normalized.some((row, index) => row.rank !== index + 1 || !row.espnId)) {
    throw new Error(`ESPN AP Top 25 payload was incomplete: received ${normalized.length} ranked rows.`);
  }
  return normalized;
}

const expected = checkedInSnapshot();
const response = await fetch(ESPN_RANKINGS_URL, {
  headers: { Accept: "application/json", "User-Agent": "Octagon-HQ-AP-Top25-Monitor/1.0" },
});
if (!response.ok) throw new Error(`ESPN rankings request failed: ${response.status}`);
const current = currentApRows(await response.json());

const differences = current.flatMap((row) => {
  const checkedIn = expected[row.rank - 1];
  if (checkedIn?.espnId === row.espnId) return [];
  return [{
    rank: row.rank,
    checkedIn: checkedIn ? { schoolId: checkedIn.schoolId, espnId: checkedIn.espnId } : null,
    current: { name: row.name, espnId: row.espnId },
  }];
});

if (differences.length) {
  console.error("AP Top 25 changed. Update Wheel snapshot + backend poll rows before the next deploy.");
  console.error(JSON.stringify(differences, null, 2));
  process.exit(1);
}

console.log("Wheel AP Top 25 snapshot matches the current ESPN AP poll mirror.");
