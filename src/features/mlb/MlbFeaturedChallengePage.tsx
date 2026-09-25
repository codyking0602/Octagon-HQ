import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FootballFindLeaderPresentation,
  type FootballFindLeaderPresentationCandidate,
} from "../back-room/FootballFindLeaderPresentation";
import { mlbTeamAssetByAbbreviation } from "./mlbTeamAssets";
import "../../styles/football-find-leader.css";
import "../../styles/mlb-playoffs.css";

type MlbFindLeaderCandidate = FootballFindLeaderPresentationCandidate & {
  teamAbbreviation: string;
};

type MlbFindLeaderBoard = {
  id: string;
  question: string;
  context: string;
  categoryLabel: string;
  statLabel: string;
  shortLabel: string;
  candidates: readonly MlbFindLeaderCandidate[];
};

interface ResultState {
  score: number;
  perfect: boolean;
  fatalId: string | null;
}

const BOARD_ONE: MlbFindLeaderBoard = {
  id: "mlb-preview-career-doubles",
  question: "Who has the most career MLB doubles?",
  context: "Career regular-season doubles.",
  categoryLabel: "MLB · CAREER DOUBLES",
  statLabel: "career MLB doubles",
  shortLabel: "2B",
  candidates: [
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
  ],
};

const BOARD_TWO: MlbFindLeaderBoard = {
  id: "mlb-preview-career-pitching-strikeouts",
  question: "Who has the most career MLB strikeouts?",
  context: "Career regular-season pitching strikeouts.",
  categoryLabel: "MLB · PITCHING STRIKEOUTS",
  statLabel: "career MLB strikeouts",
  shortLabel: "K",
  candidates: [
    { id: "randy-johnson", name: "Randy Johnson", subtitle: "LHP", value: 4875, teamAbbreviation: "ARI" },
    { id: "roger-clemens", name: "Roger Clemens", subtitle: "RHP", value: 4672, teamAbbreviation: "BOS" },
    { id: "steve-carlton", name: "Steve Carlton", subtitle: "LHP", value: 4136, teamAbbreviation: "PHI" },
    { id: "tom-seaver", name: "Tom Seaver", subtitle: "RHP", value: 3640, teamAbbreviation: "NYM" },
    { id: "greg-maddux", name: "Greg Maddux", subtitle: "RHP", value: 3371, teamAbbreviation: "ATL" },
    { id: "pedro-martinez", name: "Pedro Martinez", subtitle: "RHP", value: 3154, teamAbbreviation: "BOS" },
    { id: "bob-gibson", name: "Bob Gibson", subtitle: "RHP", value: 3117, teamAbbreviation: "STL" },
    { id: "curt-schilling", name: "Curt Schilling", subtitle: "RHP", value: 3116, teamAbbreviation: "ARI" },
    { id: "john-smoltz", name: "John Smoltz", subtitle: "RHP", value: 3084, teamAbbreviation: "ATL" },
    { id: "sandy-koufax", name: "Sandy Koufax", subtitle: "LHP", value: 2396, teamAbbreviation: "LAD" },
  ],
};

export const MLB_FIND_LEADER_PREVIEW_BOARDS = [BOARD_ONE, BOARD_TWO] as const;

/**
 * Everything shown while tuning the format is burned content. Scheduled MLB
 * challenges must use different questions and different player pools.
 */
export const MLB_FIND_LEADER_BURNED_CONTENT = {
  questionIds: MLB_FIND_LEADER_PREVIEW_BOARDS.map((board) => board.id),
  candidateIds: [...new Set(MLB_FIND_LEADER_PREVIEW_BOARDS.flatMap((board) => (
    board.candidates.map((candidate) => candidate.id)
  )))],
} as const;

function boardLeader(board: MlbFindLeaderBoard) {
  return board.candidates.reduce((leader, candidate) => (
    (candidate.value ?? Number.NEGATIVE_INFINITY) > (leader.value ?? Number.NEGATIVE_INFINITY)
      ? candidate
      : leader
  ));
}

function MlbFindLeaderVisual({
  board,
  candidateId,
  candidateName,
  compact = false,
}: {
  board: MlbFindLeaderBoard;
  candidateId: string;
  candidateName: string;
  compact?: boolean;
}) {
  const candidate = board.candidates.find((row) => row.id === candidateId);
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
  const [boardIndex, setBoardIndex] = useState(0);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [result, setResult] = useState<ResultState | null>(null);
  const [completedScores, setCompletedScores] = useState<number[]>([]);
  const board = MLB_FIND_LEADER_PREVIEW_BOARDS[boardIndex];
  const leader = boardLeader(board);
  const eliminatedSet = useMemo(() => new Set(eliminated), [eliminated]);
  const finalScore = completedScores.length === MLB_FIND_LEADER_PREVIEW_BOARDS.length
    ? Math.round(completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length)
    : null;

  function resetBoard(nextBoardIndex = boardIndex) {
    setBoardIndex(nextBoardIndex);
    setEliminated([]);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetChallenge() {
    setCompletedScores([]);
    resetBoard(0);
  }

  function finishBoard(nextResult: ResultState) {
    setResult(nextResult);
    setCompletedScores((scores) => [...scores.slice(0, boardIndex), nextResult.score]);
  }

  function eliminate(id: string) {
    if (result || eliminatedSet.has(id)) return;
    const round = eliminated.length + 1;
    const next = [...eliminated, id];
    setEliminated(next);

    if (id === leader.id) {
      finishBoard({ score: round * 10, perfect: false, fatalId: id });
      return;
    }

    if (next.length === 9) {
      finishBoard({ score: 100, perfect: true, fatalId: null });
    }
  }

  const isLastBoard = boardIndex === MLB_FIND_LEADER_PREVIEW_BOARDS.length - 1;

  return (
    <div className="page football-find-leader-page mlb-find-leader-page">
      <div className="mlb-find-series-progress" aria-label={`Game ${boardIndex + 1} of ${MLB_FIND_LEADER_PREVIEW_BOARDS.length}`}>
        <span>FIND THE LEADER</span>
        <strong>GAME {boardIndex + 1} OF {MLB_FIND_LEADER_PREVIEW_BOARDS.length}</strong>
      </div>

      <FootballFindLeaderPresentation
        question={board.question}
        context={board.context}
        categoryLabel={board.categoryLabel}
        statLabel={board.statLabel}
        shortLabel={board.shortLabel}
        candidates={board.candidates}
        leaderId={leader.id}
        eliminatedIds={eliminated}
        result={result}
        eyebrow="MLB PLAYOFF CHALLENGE"
        intro="Eliminate nine decoys until only the leader remains."
        onNewLineup={null}
        onEliminate={eliminate}
        renderVisual={(candidate, compact) => (
          <MlbFindLeaderVisual
            board={board}
            candidateId={candidate.id}
            candidateName={candidate.name}
            compact={compact}
          />
        )}
      />

      {result && !isLastBoard ? (
        <section className="mlb-find-between-games">
          <div>
            <span>GAME 1 COMPLETE</span>
            <strong>{result.score}<small>/100</small></strong>
            <p>One more board. Your two scores will be averaged.</p>
          </div>
          <button className="primary-action" type="button" onClick={() => resetBoard(boardIndex + 1)}>
            NEXT GAME →
          </button>
        </section>
      ) : null}

      {result && isLastBoard && finalScore !== null ? (
        <section className="mlb-find-final-score">
          <p className="eyebrow">FINAL SCORE</p>
          <strong>{finalScore}<small>/100</small></strong>
          <div>
            <span>GAME 1 <b>{completedScores[0]}</b></span>
            <span>GAME 2 <b>{completedScores[1]}</b></span>
          </div>
          <p>Final score is the average of both Find the Leader boards.</p>
          <div className="mlb-find-final-actions">
            <button className="primary-action" type="button" onClick={resetChallenge}>PLAY AGAIN</button>
            <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>MLB PLAYOFFS</button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
