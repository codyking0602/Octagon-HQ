import fs from "node:fs";

const path = "scripts/generate-football-find-leader-runtime.mjs";
let source = fs.readFileSync(path, "utf8");

const before = `  if (recognized.league === "NFL") {
    setFact(recognized.id, "nfl-career-games", draft.games);
    setFact(recognized.id, "nfl-first-team-all-pros", draft.allPro);
    setFact(recognized.id, "nfl-pro-bowl-selections", draft.proBowls);
    setFact(recognized.id, "nfl-hall-of-fame", draft.hallOfFame ? 1 : 0);
    if (["QB", "RB", "WR", "TE"].includes(recognized.position)) {
      setFact(recognized.id, "nfl-career-passing-completions", recognized.position === "QB" ? draft.passCompletions : null);
      setFact(recognized.id, "nfl-career-passing-attempts", recognized.position === "QB" ? draft.passAttempts : null);
      setFact(recognized.id, "nfl-career-passing-yards", recognized.position === "QB" ? draft.passYards : null);
      setFact(recognized.id, "nfl-career-passing-touchdowns", recognized.position === "QB" ? draft.passTouchdowns : null);
      setFact(recognized.id, "nfl-career-interceptions-thrown", recognized.position === "QB" ? draft.passInterceptions : null);
      setFact(recognized.id, "nfl-career-rushing-attempts", ["QB", "RB"].includes(recognized.position) ? draft.rushAttempts : null);
      setFact(recognized.id, "nfl-career-rushing-yards", ["QB", "RB"].includes(recognized.position) ? draft.rushYards : null);
      setFact(recognized.id, "nfl-career-rushing-touchdowns", ["QB", "RB"].includes(recognized.position) ? draft.rushTouchdowns : null);
      setFact(recognized.id, "nfl-career-receptions", ["RB", "WR", "TE"].includes(recognized.position) ? draft.receptions : null);
      setFact(recognized.id, "nfl-career-receiving-yards", ["RB", "WR", "TE"].includes(recognized.position) ? draft.receivingYards : null);
      setFact(recognized.id, "nfl-career-receiving-touchdowns", ["RB", "WR", "TE"].includes(recognized.position) ? draft.receivingTouchdowns : null);
    }
  }`;

const after = `  if (recognized.league === "NFL") {
    setFact(recognized.id, "nfl-first-team-all-pros", draft.allPro);
    setFact(recognized.id, "nfl-pro-bowl-selections", draft.proBowls);
    setFact(recognized.id, "nfl-hall-of-fame", draft.hallOfFame ? 1 : 0);
    // Modern career totals belong to the normalized nflverse regular-season corpus below. The checksum-pinned
    // draft/PFR source supplies full career totals only when the career begins before that 1999 source window.
    if ((recognized.startSeason ?? 9999) < 1999) {
      setFact(recognized.id, "nfl-career-games", draft.games);
      if (["QB", "RB", "WR", "TE"].includes(recognized.position)) {
        setFact(recognized.id, "nfl-career-passing-completions", recognized.position === "QB" ? draft.passCompletions : null);
        setFact(recognized.id, "nfl-career-passing-attempts", recognized.position === "QB" ? draft.passAttempts : null);
        setFact(recognized.id, "nfl-career-passing-yards", recognized.position === "QB" ? draft.passYards : null);
        setFact(recognized.id, "nfl-career-passing-touchdowns", recognized.position === "QB" ? draft.passTouchdowns : null);
        setFact(recognized.id, "nfl-career-interceptions-thrown", recognized.position === "QB" ? draft.passInterceptions : null);
        setFact(recognized.id, "nfl-career-rushing-attempts", ["QB", "RB"].includes(recognized.position) ? draft.rushAttempts : null);
        setFact(recognized.id, "nfl-career-rushing-yards", ["QB", "RB"].includes(recognized.position) ? draft.rushYards : null);
        setFact(recognized.id, "nfl-career-rushing-touchdowns", ["QB", "RB"].includes(recognized.position) ? draft.rushTouchdowns : null);
        setFact(recognized.id, "nfl-career-receptions", ["RB", "WR", "TE"].includes(recognized.position) ? draft.receptions : null);
        setFact(recognized.id, "nfl-career-receiving-yards", ["RB", "WR", "TE"].includes(recognized.position) ? draft.receivingYards : null);
        setFact(recognized.id, "nfl-career-receiving-touchdowns", ["RB", "WR", "TE"].includes(recognized.position) ? draft.receivingTouchdowns : null);
      }
    }
  }`;

if (!source.includes(before)) throw new Error("Stage 13 draft ownership patch target missing.");
source = source.replace(before, after);
fs.writeFileSync(path, source);
console.log("Applied Stage 13 NFL factual-source ownership rule.");
