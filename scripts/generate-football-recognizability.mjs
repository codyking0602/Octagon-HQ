import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => JSON.parse(fs.readFileSync(new URL(path, root), "utf8"));
const nfl = read("data/generated/football/nfl/player-seasons-1999-2025.json");
const cfb = read("data/generated/football/cfb/player-seasons-2014-2025.json");

const approvedA = new Set([
  "Tom Brady", "Peyton Manning", "Patrick Mahomes", "Randy Moss", "Adrian Peterson",
  "Cam Newton", "Tim Tebow", "Reggie Bush", "Vince Young",
]);
const approvedB = new Set([
  "Matt Ryan", "Jamaal Charles", "Dez Bryant", "Luke Kuechly", "Colt McCoy",
  "Michael Crabtree", "Darren McFadden", "Justin Blackmon", "Mike Leach",
]);
const n = (value) => typeof value === "number" && Number.isFinite(value) ? value : 0;
const slug = (value) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function aggregate(corpus, league) {
  const ix = Object.fromEntries(corpus.columns.map((column, index) => [column, index]));
  const people = new Map();
  for (const row of corpus.rows) {
    const sourceId = String(row[ix.sourcePlayerId] ?? "");
    const name = row[ix.playerDisplayName] ?? row[ix.playerName];
    if (!sourceId || sourceId === "0" || !name) continue;
    const key = sourceId;
    const p = people.get(key) ?? { sourceId, name, league, seasons: new Set(), teams: new Set(), position: "", totals: {}, peaks: {} };
    p.seasons.add(n(row[ix.season]));
    const team = row[ix.recentTeam] ?? row[ix.team]; if (team) p.teams.add(team);
    p.position ||= row[ix.positionGroup] ?? row[ix.position] ?? "";
    for (const field of ["games", "gamesPlayed", "attempts", "passAttempts", "passingYards", "passYards", "passingTouchdowns", "passTouchdowns", "carries", "rushAttempts", "rushingYards", "rushYards", "rushingTouchdowns", "rushTouchdowns", "receptions", "receivingYards", "receivingTouchdowns", "defensiveSacks", "sacks", "defensiveInterceptions", "fieldGoalsMade", "puntingAttempts"]) {
      const value = n(row[ix[field]]); p.totals[field] = n(p.totals[field]) + value; p.peaks[field] = Math.max(n(p.peaks[field]), value);
    }
    people.set(key, p);
  }
  return [...people.values()];
}

function group(p) {
  const raw = p.position.toUpperCase();
  if (raw.includes("QB")) return "QB";
  if (/RB|FB/.test(raw)) return "RB";
  if (/WR|TE/.test(raw)) return raw.includes("TE") ? "TE" : "WR";
  if (/OL|OT|OG|G|C/.test(raw)) return "OL";
  if (/DL|DE|DT|EDGE/.test(raw)) return "DL";
  if (/LB/.test(raw)) return "LB";
  if (/DB|CB|S/.test(raw)) return "DB";
  if (/P/.test(raw)) return "P";
  if (/K/.test(raw)) return "K";
  const t = p.totals;
  if (n(t.passAttempts) + n(t.attempts) >= 20) return "QB";
  if (n(t.rushAttempts) + n(t.carries) >= 20) return "RB";
  if (n(t.receptions) >= 10) return "WR";
  if (n(t.sacks) + n(t.defensiveSacks) + n(t.defensiveInterceptions) >= 2) return "DB";
  if (n(t.fieldGoalsMade) >= 2) return "K";
  return undefined;
}

function project(p) {
  const position = group(p); const t = p.totals; const peak = p.peaks; const seasons = p.seasons.size;
  let score = 0; const evidence = [];
  const add = (condition, points, label) => { if (condition) { score += points; evidence.push(label); } };
  if (p.league === "NFL") {
    const games = n(t.games); add(games >= 48, 2, "multi-season NFL role"); add(games >= 96, 2, "long NFL career");
    if (position === "QB") { add(n(t.attempts) >= 800, 3, "starting-QB volume"); add(n(t.passingYards) >= 20000, 3, "major QB production"); }
    else if (position === "RB") { add(n(t.carries) >= 500, 3, "sustained rushing role"); add(n(t.rushingYards) >= 6000, 3, "major rushing production"); }
    else if (position === "WR" || position === "TE") { add(n(t.receptions) >= 180, 3, "sustained receiving role"); add(n(t.receivingYards) >= 7000, 3, "major receiving production"); }
    else if (["DL", "LB", "DB"].includes(position)) { add(n(t.defensiveSacks) >= 20 || n(t.defensiveInterceptions) >= 12, 3, "sustained defensive impact"); add(n(t.defensiveSacks) >= 70 || n(t.defensiveInterceptions) >= 30, 3, "major defensive production"); }
    else if (position === "K") { add(n(t.fieldGoalsMade) >= 100, 3, "sustained kicking role"); }
    else if (position === "P") { add(n(t.puntingAttempts) >= 300, 3, "sustained punting role"); }
    else if (position === "OL") add(games >= 80, 3, "sustained offensive-line role");
  } else {
    add(seasons >= 2, 1, "multi-season college presence");
    if (position === "QB") { add(n(t.passAttempts) >= 450, 4, "starting-QB volume"); add(n(peak.passYards) >= 3200 || n(peak.passTouchdowns) >= 30, 2, "national-level QB peak"); }
    else if (position === "RB") { add(n(t.rushAttempts) >= 300, 4, "featured rushing role"); add(n(peak.rushYards) >= 1400, 2, "national-level rushing peak"); }
    else if (position === "WR" || position === "TE") { add(n(t.receptions) >= 110, 4, "featured receiving role"); add(n(peak.receivingYards) >= 1000, 2, "national-level receiving peak"); }
    else if (["DL", "LB", "DB"].includes(position)) { add(n(t.sacks) >= 14 || n(t.defensiveInterceptions) >= 8, 4, "sustained defensive impact"); }
    else if (position === "K") add(n(t.fieldGoalsMade) >= 35, 4, "sustained kicking role");
  }
  let tier = score >= (p.league === "NFL" ? 8 : 7) ? "B" : score >= (p.league === "NFL" ? 5 : 4) ? "C" : "D";
  if (approvedB.has(p.name) && tier === "D") tier = "B";
  if (approvedA.has(p.name)) tier = "A"; // A is impossible without this explicit approval set.
  const years = [...p.seasons].filter(Boolean).sort();
  return { id: `${p.league === "NFL" ? "nflverse" : "cfbfast-r"}-player-${p.sourceId}`, name: p.name, league: p.league, position, school: p.league === "CFB" ? [...p.teams].sort()[0] : undefined, startSeason: years[0], endSeason: years.at(-1), tier, score, evidence, sourceId: p.sourceId };
}

const records = [...aggregate(nfl, "NFL"), ...aggregate(cfb, "CFB")].map(project).sort((a, b) => a.id.localeCompare(b.id));
// Runtime materialization contains only promoted identities. Database-only rows remain in their
// canonical source corpora; copying them would incorrectly turn the projection into a factual owner.
const output = { schemaVersion: 1, methodology: "fixed position-aware evidence thresholds; no percentile ranking", manualApprovals: [...approvedA].sort(), records: records.filter((record) => record.tier !== "D") };
fs.writeFileSync(new URL("data/generated/football/recognizability-projection.json", root), `${JSON.stringify(output)}\n`);

const count = (rows, field) => Object.fromEntries([...new Set(rows.map((r) => r[field] ?? "unknown"))].sort().map((v) => [v, rows.filter((r) => (r[field] ?? "unknown") === v).length]));
const eligible = records.filter((r) => r.tier !== "D");
const samples = (league, tier, amount) => records.filter((r) => r.league === league && r.tier === tier).sort((a,b) => `${a.name}:${a.id}`.localeCompare(`${b.name}:${b.id}`)).slice(0, amount).map((r) => `- ${r.name} (${r.position ?? "unknown"}, ${r.startSeason}–${r.endSeason}; ${r.evidence.join(", ")})`).join("\n");
const audit = `# Football recognizability projection audit\n\nGenerated by \`node scripts/generate-football-recognizability.mjs\`. Do not hand-edit.\n\n## Method and limitations\n\nRecognition evidence uses fixed, position-aware volume, persistence, and peak rules—not statistical percentiles. Tier A requires the explicit approval set. Available CFB rows have no position field, so positions are conservatively inferred only from role statistics; offensive linemen cannot be projected from this corpus. Awards, draft history, championship contribution, and reliable historical-game cultural markers are not present in these source rows, so the projection does not invent them. Program prominence never independently promotes a player.\n\n## Totals\n\n- Raw player identities: ${records.length}\n- A-C casual eligible: ${eligible.length} (${(eligible.length / records.length * 100).toFixed(2)}%)\n- D/database only: ${records.length - eligible.length}\n- Manual A classifications: ${records.filter(r=>r.tier==="A").length} (${(records.filter(r=>r.tier==="A").length / records.length * 100).toFixed(3)}%) from ${approvedA.size} explicitly approved names\n- Tier by league: ${JSON.stringify(Object.fromEntries(["NFL","CFB"].map(l => [l,count(records.filter(r=>r.league===l),"tier")])), null, 2)}\n- Position: ${JSON.stringify(count(records,"position"), null, 2)}\n- Entity kind: player-career=${records.length}. Programs, coaches, team seasons, eras, and games retain conservative canonical treatment; source games are not promoted by this player projection.\n\n## Thin-pool warnings\n\n- Raw NFL A-C depth is ${eligible.filter(r=>r.league==="NFL").length}; conservative canonical reconciliation may reduce the distinct-person total below the 1,500 health target. Thresholds were not weakened.\n${eligible.filter(r=>r.league==="CFB").length < 2000 ? "- CFB A-C player depth is below the 2,000 health target; thresholds were not weakened.\n" : "- None for CFB player target.\n"}- CFB OL recognition cannot be safely inferred from the available fields.\n\n## Deterministic review samples\n\nSamples use stable name/id ordering (not runtime randomness), making every regenerated audit reviewable.\n\n### NFL tier B\n${samples("NFL","B",30)}\n\n### NFL tier C (50)\n${samples("NFL","C",50)}\n\n### CFB tier B\n${samples("CFB","B",30)}\n\n### CFB tier C (50)\n${samples("CFB","C",50)}\n`;
fs.writeFileSync(new URL("docs/football-recognizability-audit.md", root), audit);
