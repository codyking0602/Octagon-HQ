import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FootballFindLeaderPresentation,
  type FootballFindLeaderPresentationCandidate,
} from "../back-room/FootballFindLeaderPresentation";
import { GameResultActions } from "../play/GameResultActions";
import { mlbTeamAssetByAbbreviation } from "./mlbTeamAssets";
import "../../styles/football-find-leader.css";
import "../../styles/mlb-playoffs.css";

type MlbFindLeaderDemoCandidate = FootballFindLeaderPresentationCandidate & {
  teamAbbreviation: string;
};

interface ResultState {
  score: number;
  perfect: boolean;
  fatalId: string | null;
}

export const MLB_FIND_LEADER_DEMO_QUESTION_ID = "mlb-demo-career-doubles";
export const MLB_FIND_LEADER_DEMO_QUESTION = "Who has the most career MLB doubles?";

export const MLB_FIND_LEADER_DEMO_CANDIDATES: readonly MlbFindLeaderDemoCandidate[] = [
  { id: "ken-griffey-jr", name: "Ken Griffey Jr.", subtitle: "CF", value: 524, teamAbbreviation: "SEA" },
  { id: "cal-ripken-jr", name: "Cal Ripken Jr.", subtitle: "SS", value: 603, teamAbbreviation: "BAL" },
  { id: "david-ortiz", name: "David Ortiz", subtitle: "DH", value: 632, teamAbbreviation: "BOS" },
  { id: "tony-gwynn", name: "Tony Gwynn", subtitle: "RF", value: 543, teamAbbreviation: "SD" },
  { id: "stan-musial", name: "Stan Musial", subtitle: "OF / 1B", value: 725, teamAbbreviation: "STL" },
  { id: "derek-jeter", name: "Derek Jeter", subtitle: "SS", value: 544, teamAbbreviation: "NYY" },
  { id: "miguel-cabrera", name: "Miguel Cabrera", subtitle: "1B / 3B", value: 627, teamAbbreviation: "DET" },
  { id: "barry-bonds", name: "Barry Bonds", subtitle: "LF", value: 601, teamAbbreviation: "SF" },
  { id: "hank-aaron", name: "Hank Aaron", subtitle: "RF", value: 624, teamAbbreviation: "ATL" },
  { id: "albert-pujols", name: "Albert Pujols", subtitle: "1B", value: 686, teamAbbreviation: "STL" },
] as const;

/**
 * Demo content is permanently burned once shown to the owner. Scheduled MLB
 * challenges must use a different question/category and must not reuse any
 * candidate on this board.
 */
export const MLB_FIND_LEADER_DEMO_BURNED_CONTENT = {
  questionIds: [MLB_FIND_LEADER_DEMO_QUESTION_ID],
  candidateIds: MLB_FIND_LEADER_DEMO_CANDIDATES.map((candidate) => candidate.id),
} as const;

const DEMO_LEADER = MLB_FIND_LEADER_DEMO_CANDIDATES.reduce((leader, candidate) => (
  (candidate.value ?? Number.NEGATIVE_INFINITY) > (leader.value ?? Number.NEGATIVE_INFINITY)
    ? candidate
    : leader
));

function MlbFindLeaderVisual({
  candidateId,
  candidateName,
  compact = false,
}: {
  candidateId: string;
  candidateName: string;
  compact?: boolean;
}) {
  const candidate = MLB_FIND_LEADER_DEMO_CANDIDATES.find((row) => row.id === candidateId);
  const team = mlbTeamAssetByAbbreviation(candidate?.teamAbbreviation);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [candidateId, team?.logoUrl]);

  return (
    <span
      className={`football-find-card__visual${team && !failed ? " has-logo" : ""}${compact ? " is-compact" : ""}`}
      aria-label={team && !failed ? `${team.name} logo for ${candidateName}` : `${candidateName} MLB mark`}
    >
      {team && !failed ? (
        <img
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          src={team.logoUrl}
          title={team.name}
          onError={() => setFailed(true)}
        />
      ) : (
        <b aria-hidden="true">MLB</b>
      )}
    </span>
  );
}

export default function MlbFeaturedChallengePage() {
  const navigate = useNavigate();
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [result, setResult] = useState<ResultState | null>(null);
  const [actionStatus, setActionStatus] = useState("");
  const eliminatedSet = useMemo(() => new Set(eliminated), [eliminated]);

  function reset() {
    setEliminated([]);
    setResult(null);
    setActionStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function eliminate(id: string) {
    if (result || eliminatedSet.has(id)) return;
    const round = eliminated.length + 1;
    const next = [...eliminated, id];
    setEliminated(next);

    if (id === DEMO_LEADER.id) {
      setResult({ score: round * 10, perfect: false, fatalId: id });
      return;
    }

    if (next.length === 9) {
      setResult({ score: 100, perfect: true, fatalId: null });
    }
  }

  return (
    <div className="page football-find-leader-page mlb-find-leader-page">
      <FootballFindLeaderPresentation
        question={MLB_FIND_LEADER_DEMO_QUESTION}
        context="Career regular-season doubles."
        categoryLabel="MLB · DEMO BOARD"
        statLabel="career MLB doubles"
        shortLabel="2B"
        candidates={MLB_FIND_LEADER_DEMO_CANDIDATES}
        leaderId={DEMO_LEADER.id}
        eliminatedIds={eliminated}
        result={result}
        eyebrow="MLB PLAYOFFS · FIND THE LEADER"
        intro="Eliminate nine decoys until only the leader remains."
        onNewLineup={null}
        onEliminate={eliminate}
        renderVisual={(candidate, compact) => (
          <MlbFindLeaderVisual
            candidateId={candidate.id}
            candidateName={candidate.name}
            compact={compact}
          />
        )}
      />

      {result ? (
        <GameResultActions
          onChallenge={() => setActionStatus("Demo-only board — profile challenges are disabled.")}
          onReplay={reset}
          onAllGames={() => navigate("/mlb")}
          replayLabel="PLAY AGAIN"
          status={actionStatus}
        />
      ) : null}
    </div>
  );
}
