import { useState } from "react";
import { createRoot } from "react-dom/client";
import { NbaOfficialFindLeader, NbaOfficialHitTheNumber, NbaOfficialHigherLower } from "../../src/features/nba/NbaOfficialDailyPage";
import { nbaHitSubjects } from "../../src/features/nba/nbaHitTheNumberStats";
import { createNbaHigherLowerBoard } from "../../src/features/nba/nbaHigherLowerModel";
import type { TodayChallengeProjection } from "../../src/features/play/todayChallengeRepository";
import "../../src/styles/tokens.css";
import "../../src/styles/global.css";
import "../../src/styles/play.css";

type Json = Record<string, unknown>;
function projection(gameType: "find_leader" | "hit_the_number" | "higher_lower", setup: Json, state: Json): TodayChallengeProjection {
  return {
    available: true, id: "11111111-1111-4111-8111-111111111111",
    centralDay: "2026-10-27", scheduleVersion: "nba-phone-proof-v1",
    gameType, setupKey: "nba-portrait-phone:" + gameType,
    contentVersion: "nba-portrait-phone-v1", scoringVersion: "play-official-score-v1",
    fallbackReason: null, publicSetup: setup, progressRevision: 1,
    publicState: state, revealSetup: null, officialAttempt: null,
    deploymentSha: "nba-portrait-phone-proof",
  };
}
const historical = [
  ["Gary Payton", 1996], ["Clyde Drexler", 1993],
  ["Shawn Kemp", 1996], ["Michael Finley", 1996],
  ["Tim Hardaway", 1993], ["Glen Rice", 1993],
  ["Reggie Miller", 1996], ["Robert Parish", 1993],
  ["Jerry Stackhouse", 1996], ["Grant Hill", 1996],
] as const;
const leaderCandidates = historical.map(([name, season]) => ({
  id: "season:" + season + ":" + name.replace(/[^a-z0-9]/gi, "").toLowerCase(),
  name, display_name: name, season, season_label: (season-1) + "–" + String(season).slice(-2),
  subtitle: "NBA regular season",
}));
const hitPlayers = nbaHitSubjects.filter(s => s.season === 2025).slice(0, 14);
const hitSetup = {
  candidates: hitPlayers.map(s => ({ id: s.id, name: s.name, subtitle: s.subtitle })),
  pick_count: 4, stat_id: "season-points", metric_label: "Points Per Game",
  format_id: "classic", configuration_label: "Classic", target: 85.5,
  slots: [],
};
const higherQuestion = createNbaHigherLowerBoard("nba-portrait-phone-proof").questions[0]!;
function Harness() {
  const [leaderEliminated, setLeaderEliminated] = useState<string[]>([]);
  const [hitSelected, setHitSelected] = useState<string[]>([]);
  const [higherIndex, setHigherIndex] = useState(0);
  const [higherResult, setHigherResult] = useState<Json>({});
  const game = new URLSearchParams(location.search).get("game") ?? "find_leader";
  if (game === "hit_the_number") {
    return <div data-game="hit_the_number">
      <NbaOfficialHitTheNumber
        projection={projection("hit_the_number", hitSetup, {
          selected_ids: hitSelected, available_subject_ids: hitPlayers.map(s=>s.id),
        })}
        busy={false} advance={action => {
          const id = String(action.fighter_id ?? "");
          if (id && hitPlayers.some(s=>s.id===id)) setHitSelected(previous => [...new Set([...previous, id])]);
        }}
      />
    </div>;
  }
  if (game === "higher_lower") {
    return <div data-game="higher_lower">
      <NbaOfficialHigherLower
        projection={projection("higher_lower", {}, {
          index: higherIndex, current_question: higherQuestion, last_result: higherResult,
        })}
        busy={false} advance={action => {
          const choice = String(action.choice ?? "");
          setHigherResult({ choice, correct: choice === higherQuestion.answer });
          setHigherIndex(index => index + 1);
        }}
      />
    </div>;
  }
  return <div data-game="find_leader">
    <NbaOfficialFindLeader
      projection={projection("find_leader", {
        question: "Who averaged the most assists per game?",
        context: "1992–93 and 1995–96 NBA player-seasons",
        stat_label: "ASSISTS", candidates: leaderCandidates,
      }, { eliminated_ids: leaderEliminated })}
      busy={false} advance={action => {
        const id = String(action.eliminated_id ?? "");
        if (id) setLeaderEliminated(rows => [...new Set([...rows, id])]);
      }}
    />
  </div>;
}
createRoot(document.getElementById("root")!).render(<Harness />);
