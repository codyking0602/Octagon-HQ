import { readFileSync, readdirSync } from "node:fs";

const ESPN_RANKINGS_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings";
const BASELINE_PATH =
  "data/generated/football/cfb/wheel-football-current-priorities-2026.json";
const EXTRA_AUDIT_DIR = "data/curated/football/cfb";
const EXTRA_AUDIT_FILE =
  /^wheel-football-(.+)-grading-audit-\d{4}-\d{2}-\d{2}\.json$/;

function auditedCoverage() {
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  const bySchoolId = new Map();
  const byEspnId = new Map();

  for (const [schoolId, team] of Object.entries(baseline?.teams ?? {})) {
    const espnId = String(team?.espnId ?? "").trim();
    if (!espnId) throw new Error(`Missing ESPN id for audited CFB base school ${schoolId}.`);
    const coverage = { schoolId, espnId, source: "68-school-base" };
    bySchoolId.set(schoolId, coverage);
    byEspnId.set(espnId, coverage);
  }

  for (const filename of readdirSync(EXTRA_AUDIT_DIR)) {
    if (!EXTRA_AUDIT_FILE.test(filename)) continue;
    const path = `${EXTRA_AUDIT_DIR}/${filename}`;
    const audit = JSON.parse(readFileSync(path, "utf8"));
    if (audit?.status !== "audit-locked-runtime") continue;

    const schoolId = String(audit?.schoolId ?? "").trim();
    const espnId = String(audit?.priority?.espnId ?? "").trim();
    if (!schoolId || !espnId) {
      throw new Error(`Locked AP Top 25 extra audit ${path} is missing schoolId or priority.espnId.`);
    }
    if (audit?.auditResult?.result !== "passed"
      || audit?.auditResult?.priorityAndGradeStatus !== "locked"
      || audit?.eaDiscrepancyAudit?.result !== "passed"
      || audit?.coachExternalAudit?.result !== "passed") {
      throw new Error(`Locked AP Top 25 extra audit ${path} has not passed the full Boise-style audit contract.`);
    }

    const coverage = { schoolId, espnId, source: path };
    bySchoolId.set(schoolId, coverage);
    byEspnId.set(espnId, coverage);
  }

  return { bySchoolId, byEspnId };
}

function checkedInSnapshot(coverage) {
  const source = readFileSync(
    "src/features/back-room/wheelFootballApTop25.ts",
    "utf8",
  );
  const entries = [...source.matchAll(/\{ rank: (\d+), schoolId: "([^"]+)" \}/g)]
    .map((match) => {
      const schoolId = match[2];
      return {
        rank: Number(match[1]),
        schoolId,
        espnId: coverage.bySchoolId.get(schoolId)?.espnId ?? null,
      };
    });

  if (entries.length !== 25) {
    throw new Error(`Checked-in Wheel AP Top 25 snapshot has ${entries.length} teams instead of 25.`);
  }

  const uncovered = entries.filter((entry) => !entry.espnId);
  if (uncovered.length) {
    throw new Error(
      "Checked-in Wheel AP Top 25 includes team(s) without audited Wheel coverage: "
      + uncovered.map((entry) => entry.schoolId).join(", ")
      + ". A team outside the audited 68-school base must complete the full Boise State extra-team audit before the snapshot can ship.",
    );
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

const coverage = auditedCoverage();
const expected = checkedInSnapshot(coverage);
const response = await fetch(ESPN_RANKINGS_URL, {
  headers: { Accept: "application/json", "User-Agent": "Octagon-HQ-AP-Top25-Monitor/2.0" },
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
  const uncoveredEntrants = differences
    .map((difference) => difference.current)
    .filter((team) => !coverage.byEspnId.has(team.espnId));

  console.error("AP Top 25 changed. Update the Wheel snapshot + backend poll rows before the next deploy.");
  console.error(JSON.stringify(differences, null, 2));

  if (uncoveredEntrants.length) {
    console.error("");
    console.error("NEW AP TOP 25 TEAM OUTSIDE THE AUDITED WHEEL BASE:");
    console.error(JSON.stringify(uncoveredEntrants, null, 2));
    console.error(
      "Do not add this team to the Wheel snapshot by itself. First run the full Boise State process: "
      + "current roster/priority audit; all seven grading families; the shared current-ability CFB calibration; "
      + "EA 7+/10+ discrepancy review; head-coach external audit; roster-proxy allowlist; runtime team metadata; "
      + "server-owned grade migration; regression coverage; and an audit-locked-runtime artifact. "
      + "Only then should the AP Top 25 snapshot be updated.",
    );
  }

  process.exit(1);
}

console.log(
  "Wheel AP Top 25 snapshot matches the current ESPN AP poll mirror, and every ranked team has audited Wheel coverage.",
);
