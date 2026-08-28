import fs from "node:fs";

const path = "scripts/generate-football-find-leader-runtime.mjs";
let source = fs.readFileSync(path, "utf8");

function replaceOnce(before, after, label) {
  if (!source.includes(before)) throw new Error(`Stage 13 patch target missing: ${label}.`);
  source = source.replace(before, after);
}

replaceOnce(
`  if (recognized.league === "NFL") {
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
  }`,
`  if (recognized.league === "NFL") {
    // The checksum-pinned nflverse draft/PFR release is the full-career aggregate owner whenever a drafted
    // player's row supplies the metric. Seasonal nflverse rows remain the owner of season facts and may supply
    // career aggregates only for undrafted players whose complete recognized career is covered by the corpus.
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
      if (recognized.position === "QB") {
        setFact(recognized.id, "nfl-career-passer-rating", nflPasserRating(draft.passCompletions, draft.passAttempts, draft.passYards, draft.passTouchdowns, draft.passInterceptions));
        setFact(recognized.id, "nfl-career-completion-percentage", safeDivide(draft.passCompletions == null ? null : draft.passCompletions * 100, draft.passAttempts));
        setFact(recognized.id, "nfl-career-passing-yards-per-attempt", safeDivide(draft.passYards, draft.passAttempts));
        setFact(recognized.id, "nfl-career-passing-touchdown-percentage", safeDivide(draft.passTouchdowns == null ? null : draft.passTouchdowns * 100, draft.passAttempts));
      }
      if (recognized.position === "RB") {
        setFact(recognized.id, "nfl-career-rushing-yards-per-attempt", safeDivide(draft.rushYards, draft.rushAttempts));
      }
    }
  }`,
"draft aggregate ownership",
);

replaceOnce(
`  const recognized = nflCareerRecognition.get(sourcePlayerId);
  if (!recognized || recognized.startSeason < 1999) continue;
  registerPlayer(recognized);`,
`  const recognized = nflCareerRecognition.get(sourcePlayerId);
  if (!recognized) continue;
  registerPlayer(recognized);
  const draft = draftForRecognition(recognized);
  const normalizedSeasons = rows.map((row) => numeric(at(row, nflGrouped.ix, "season"))).filter((season) => season != null);
  const normalizedCareerCoverageComplete = recognized.startSeason != null
    && recognized.endSeason != null
    && normalizedSeasons.length > 0
    && Math.min(...normalizedSeasons) <= recognized.startSeason
    && Math.max(...normalizedSeasons) >= recognized.endSeason;`,
"NFL normalized career completeness gate",
);

const nflCareerBefore = `  setFact(recognized.id, "nfl-career-games", games);
  if (position === "QB") {
    setFact(recognized.id, "nfl-career-passing-completions", completions);
    setFact(recognized.id, "nfl-career-passing-attempts", attempts);
    setFact(recognized.id, "nfl-career-passing-yards", passingYards);
    setFact(recognized.id, "nfl-career-passing-touchdowns", passingTouchdowns);
    setFact(recognized.id, "nfl-career-interceptions-thrown", passingInterceptions);
    setFact(recognized.id, "nfl-career-passer-rating", nflPasserRating(completions, attempts, passingYards, passingTouchdowns, passingInterceptions));
    setFact(recognized.id, "nfl-career-completion-percentage", safeDivide(completions == null ? null : completions * 100, attempts));
    setFact(recognized.id, "nfl-career-passing-yards-per-attempt", safeDivide(passingYards, attempts));
    setFact(recognized.id, "nfl-career-passing-touchdown-percentage", safeDivide(passingTouchdowns == null ? null : passingTouchdowns * 100, attempts));
  }
  if (position === "RB") {
    setFact(recognized.id, "nfl-career-rushing-attempts", carries);
    setFact(recognized.id, "nfl-career-rushing-yards", rushingYards);
    setFact(recognized.id, "nfl-career-rushing-touchdowns", rushingTouchdowns);
    setFact(recognized.id, "nfl-career-rushing-yards-per-attempt", safeDivide(rushingYards, carries));
  }
  if (["RB", "WR", "TE"].includes(position)) {
    setFact(recognized.id, "nfl-career-receptions", receptions);
    setFact(recognized.id, "nfl-career-receiving-yards", receivingYards);
    setFact(recognized.id, "nfl-career-receiving-touchdowns", receivingTouchdowns);
  }
  if (["DL", "LB", "DB"].includes(position)) {
    setFact(recognized.id, "nfl-career-tackles-solo", tacklesSolo);
    setFact(recognized.id, "nfl-career-tackles-for-loss", tacklesForLoss);
    setFact(recognized.id, "nfl-career-forced-fumbles", forcedFumbles);
    setFact(recognized.id, "nfl-career-sacks", defensiveSacks);
    setFact(recognized.id, "nfl-career-interceptions", defensiveInterceptions);
    setFact(recognized.id, "nfl-career-passes-defended", passesDefended);
  }
  if (position === "K") {
    setFact(recognized.id, "nfl-career-field-goals-made", fieldGoalsMade);
    setFact(recognized.id, "nfl-career-field-goals-attempted", fieldGoalsAttempted);
    setFact(recognized.id, "nfl-career-field-goal-percentage", safeDivide(fieldGoalsMade == null ? null : fieldGoalsMade * 100, fieldGoalsAttempted));
  }
  if (position === "P") {
    setFact(recognized.id, "nfl-career-punts", puntingAttempts);
    setFact(recognized.id, "nfl-career-punting-yards", puntingYards);
    setFact(recognized.id, "nfl-career-punting-average", safeDivide(puntingYards, puntingAttempts));
  }`;

const nflCareerAfter = `  if (normalizedCareerCoverageComplete) {
    // A drafted player's full-career PFR aggregate remains authoritative for the career metrics it supplies.
    // Undrafted players can use normalized sums only when the observed rows span the whole recognized career.
    if (!draft) {
      setFact(recognized.id, "nfl-career-games", games);
      if (position === "QB") {
        setFact(recognized.id, "nfl-career-passing-completions", completions);
        setFact(recognized.id, "nfl-career-passing-attempts", attempts);
        setFact(recognized.id, "nfl-career-passing-yards", passingYards);
        setFact(recognized.id, "nfl-career-passing-touchdowns", passingTouchdowns);
        setFact(recognized.id, "nfl-career-interceptions-thrown", passingInterceptions);
        setFact(recognized.id, "nfl-career-passer-rating", nflPasserRating(completions, attempts, passingYards, passingTouchdowns, passingInterceptions));
        setFact(recognized.id, "nfl-career-completion-percentage", safeDivide(completions == null ? null : completions * 100, attempts));
        setFact(recognized.id, "nfl-career-passing-yards-per-attempt", safeDivide(passingYards, attempts));
        setFact(recognized.id, "nfl-career-passing-touchdown-percentage", safeDivide(passingTouchdowns == null ? null : passingTouchdowns * 100, attempts));
      }
      if (position === "RB") {
        setFact(recognized.id, "nfl-career-rushing-attempts", carries);
        setFact(recognized.id, "nfl-career-rushing-yards", rushingYards);
        setFact(recognized.id, "nfl-career-rushing-touchdowns", rushingTouchdowns);
        setFact(recognized.id, "nfl-career-rushing-yards-per-attempt", safeDivide(rushingYards, carries));
      }
      if (["RB", "WR", "TE"].includes(position)) {
        setFact(recognized.id, "nfl-career-receptions", receptions);
        setFact(recognized.id, "nfl-career-receiving-yards", receivingYards);
        setFact(recognized.id, "nfl-career-receiving-touchdowns", receivingTouchdowns);
      }
    }
    if (["DL", "LB", "DB"].includes(position)) {
      setFact(recognized.id, "nfl-career-tackles-solo", tacklesSolo);
      setFact(recognized.id, "nfl-career-tackles-for-loss", tacklesForLoss);
      setFact(recognized.id, "nfl-career-forced-fumbles", forcedFumbles);
      setFact(recognized.id, "nfl-career-sacks", defensiveSacks);
      setFact(recognized.id, "nfl-career-interceptions", defensiveInterceptions);
      setFact(recognized.id, "nfl-career-passes-defended", passesDefended);
    }
    if (position === "K") {
      setFact(recognized.id, "nfl-career-field-goals-made", fieldGoalsMade);
      setFact(recognized.id, "nfl-career-field-goals-attempted", fieldGoalsAttempted);
      setFact(recognized.id, "nfl-career-field-goal-percentage", safeDivide(fieldGoalsMade == null ? null : fieldGoalsMade * 100, fieldGoalsAttempted));
    }
    if (position === "P") {
      setFact(recognized.id, "nfl-career-punts", puntingAttempts);
      setFact(recognized.id, "nfl-career-punting-yards", puntingYards);
      setFact(recognized.id, "nfl-career-punting-average", safeDivide(puntingYards, puntingAttempts));
    }
  }`;
replaceOnce(nflCareerBefore, nflCareerAfter, "NFL aggregate ownership block");

replaceOnce(
`  const recognized = cfbCareerRecognition.get(key);
  if (!recognized || recognized.startSeason <= 2014) continue;
  registerPlayer(recognized);`,
`  const recognized = cfbCareerRecognition.get(key);
  if (!recognized) continue;
  const normalizedSeasons = rows.map((row) => numeric(at(row, cfbGrouped.ix, "season"))).filter((season) => season != null);
  const normalizedCareerCoverageComplete = recognized.startSeason != null
    && recognized.endSeason != null
    && normalizedSeasons.length > 0
    && Math.min(...normalizedSeasons) <= recognized.startSeason
    && Math.max(...normalizedSeasons) >= recognized.endSeason;
  if (!normalizedCareerCoverageComplete) continue;
  registerPlayer(recognized);`,
"CFB best-season career completeness gate",
);

replaceOnce(
`    nflCareerMinimumStartSeasonForNormalizedStats: 1999,
    cfbCareerMinimumStartSeasonForNormalizedStats: 2015,`,
`    nflCareerNormalizedCoverageRule: "observed player-season endpoints must contain the full recognized career before career aggregates are emitted",
    cfbCareerNormalizedCoverageRule: "observed player-season endpoints must contain the full recognized career before career-best values are emitted",`,
"coverage metadata",
);

fs.writeFileSync(path, source);
console.log("Applied Stage 13 factual-source ownership and completeness rules.");
