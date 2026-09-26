import { useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import {
  FootballHitTheNumberPresentation,
  type FootballHitNumberPresentationResult,
} from "../back-room/FootballHitTheNumberPresentation";
import { hitTheNumberScore } from "../play/hitTheNumberEngine";
import {
  recordMlbPlayChallengeResult,
  type MlbPlayChallengeResult,
} from "./mlbPlayChallenge";
import { mlbTeamAssetByAbbreviation } from "./mlbTeamAssets";
import { useMlbPlayChallengeOverview } from "./useMlbPlayChallengeOverview";

export type MlbHitNumberCandidate = {
  id: string;
  name: string;
  subtitle: string;
  teamAbbreviation: string;
  value: number;
};

export type MlbHitNumberGame = {
  id: string;
  metricLabel: "Career Home Runs" | "Single-Season Home Runs";
  configurationLabel: string;
  target: number;
  candidates: readonly MlbHitNumberCandidate[];
};

export type MlbHitNumberChallengeConfig = {
  challengeKey: string;
  challengeDate: string;
  version: string;
  games: readonly [MlbHitNumberGame, MlbHitNumberGame];
};

type CompletedHitNumberGame = {
  game: number;
  gameId: string;
  metricLabel: string;
  configurationLabel: string;
  target: number;
  total: number;
  distance: number;
  status: FootballHitNumberPresentationResult["status"];
  score: number;
  selections: Array<{
    id: string;
    name: string;
    value: number;
  }>;
};

const MLB_HIT_NUMBER_THEME = {
  "--football-accent": "var(--mlb-green-strong)",
  "--football-accent-rgb": "var(--mlb-green-rgb)",
  "--ufc-red-strong": "var(--mlb-green-strong)",
} as CSSProperties;

export function gradeMlbHitNumberGame(
  game: MlbHitNumberGame,
  selectedIds: readonly string[],
): FootballHitNumberPresentationResult {
  const values = new Map(game.candidates.map((candidate) => [candidate.id, candidate.value]));
  const total = selectedIds.reduce((sum, id) => sum + (values.get(id) ?? 0), 0);
  const status = total === game.target ? "perfect" : total > game.target ? "bust" : "under";
  const distance = Math.abs(game.target - total);
  return {
    status,
    target: game.target,
    total,
    distance,
    score: hitTheNumberScore({
      status,
      target: game.target,
      distance,
      pickCount: 5,
    }),
  };
}

function MlbCandidateMark({
  candidate,
  className,
}: {
  candidate: MlbHitNumberCandidate;
  className: string;
}) {
  const team = mlbTeamAssetByAbbreviation(candidate.teamAbbreviation);
  if (!team) {
    return <span className={className} aria-hidden="true">MLB</span>;
  }
  return (
    <img
      alt=""
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      src={team.logoUrl}
      title={team.name}
      style={{
        objectFit: "contain",
        padding: 4,
        background: "var(--football-logo-backplate, #E7E1D7)",
        border: "1px solid rgba(74, 63, 49, .22)",
      }}
    />
  );
}

function storedGameScores(result: MlbPlayChallengeResult | null) {
  if (!result) return [];
  const value = result.publicResult.game_scores;
  return Array.isArray(value)
    ? value.filter((score): score is number => typeof score === "number")
    : [];
}

export default function MlbHitTheNumberChallenge({
  config,
  mode = "production",
  season = 2026,
}: {
  config: MlbHitNumberChallengeConfig;
  mode?: "owner_review" | "production";
  season?: number;
}) {
  const navigate = useNavigate();
  const productionMode = mode === "production";
  const {
    overview,
    loading: overviewLoading,
    reload: reloadOverview,
  } = useMlbPlayChallengeOverview({
    enabled: productionMode,
    season,
    challengeKey: config.challengeKey,
  });

  const [gameIndex, setGameIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<FootballHitNumberPresentationResult | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [completedGames, setCompletedGames] = useState<CompletedHitNumberGame[]>([]);
  const [practiceMode, setPracticeMode] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordError, setRecordError] = useState("");

  const game = config.games[gameIndex] ?? config.games[0];
  const candidateById = useMemo(
    () => new Map(game.candidates.map((candidate) => [candidate.id, candidate])),
    [game],
  );
  const values = useMemo(
    () => Object.fromEntries(game.candidates.map((candidate) => [candidate.id, candidate.value])),
    [game],
  );
  const finalScore = scores.length === config.games.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : null;
  const savedResult = productionMode ? overview?.ownResult ?? null : null;

  function resetRun(asPractice = practiceMode) {
    setPracticeMode(asPractice);
    setGameIndex(0);
    setSelectedIds([]);
    setResult(null);
    setScores([]);
    setCompletedGames([]);
    setRecordError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleCandidate(id: string) {
    if (result) return;
    setSelectedIds((current) => (
      current.includes(id)
        ? current.filter((candidateId) => candidateId !== id)
        : current.length < 5
          ? [...current, id]
          : current
    ));
  }

  async function saveOfficialResult(score: number, games: CompletedHitNumberGame[]) {
    if (!productionMode || practiceMode || recording) return;
    setRecording(true);
    setRecordError("");
    try {
      await recordMlbPlayChallengeResult({
        season,
        challengeKey: config.challengeKey,
        rawScore: score,
        gameType: "hit_the_number",
        publicResult: {
          game_scores: games.map((completed) => completed.score),
          average_score: score,
        },
        resultDetail: {
          version: config.version,
          challenge_date: config.challengeDate,
          games: games.map((completed) => ({
            game: completed.game,
            game_id: completed.gameId,
            metric_label: completed.metricLabel,
            configuration_label: completed.configurationLabel,
            target: completed.target,
            total: completed.total,
            distance: completed.distance,
            status: completed.status,
            score: completed.score,
            selections: completed.selections.map((selection) => ({
              id: selection.id,
              name: selection.name,
              value: selection.value,
            })),
          })),
        },
      });
      await reloadOverview();
    } catch (nextError) {
      setRecordError(nextError instanceof Error
        ? nextError.message
        : "Your official MLB Hit the Number result could not be recorded.");
    } finally {
      setRecording(false);
    }
  }

  function lockPicks() {
    if (selectedIds.length !== 5 || result) return;
    const next = gradeMlbHitNumberGame(game, selectedIds);
    const completed: CompletedHitNumberGame = {
      game: gameIndex + 1,
      gameId: game.id,
      metricLabel: game.metricLabel,
      configurationLabel: game.configurationLabel,
      target: next.target,
      total: next.total,
      distance: next.distance,
      status: next.status,
      score: next.score,
      selections: selectedIds.map((id) => {
        const candidate = candidateById.get(id);
        if (!candidate) throw new Error(`Missing MLB Hit the Number candidate ${id}.`);
        return {
          id: candidate.id,
          name: candidate.name,
          value: candidate.value,
        };
      }),
    };
    const nextScores = [...scores.slice(0, gameIndex), next.score];
    const nextCompletedGames = [...completedGames.slice(0, gameIndex), completed];

    setResult(next);
    setScores(nextScores);
    setCompletedGames(nextCompletedGames);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (gameIndex === config.games.length - 1 && productionMode && !practiceMode) {
      const score = Math.round(nextScores.reduce((sum, value) => sum + value, 0) / nextScores.length);
      void saveOfficialResult(score, nextCompletedGames);
    }
  }

  function nextGame() {
    setGameIndex(1);
    setSelectedIds([]);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (productionMode && overviewLoading && !overview && !practiceMode) {
    return (
      <div className="page mlb-find-leader-page">
        <section className="mlb-find-saved-result">
          <p className="eyebrow">MLB PLAYOFF CHALLENGE</p>
          <h1>Loading your challenge…</h1>
        </section>
      </div>
    );
  }

  if (savedResult && !practiceMode && scores.length === 0) {
    const storedScores = storedGameScores(savedResult);
    return (
      <div className="page mlb-find-leader-page">
        <section className="mlb-find-saved-result">
          <p className="eyebrow">OFFICIAL RESULT</p>
          <h1>Hit the Number</h1>
          <strong>{savedResult.rawScore}<small>/100</small></strong>
          {storedScores.length ? (
            <div className="mlb-find-saved-result__games">
              {storedScores.map((score, index) => (
                <span key={index}>
                  <small>GAME {index + 1}</small>
                  <b>{score}</b>
                </span>
              ))}
            </div>
          ) : null}
          <p>Your official score is locked. Replays do not change the postseason standings.</p>
          <div className="mlb-find-final-actions">
            <button className="primary-action" type="button" onClick={() => resetRun(true)}>
              PLAY AGAIN
            </button>
            <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>
              MLB PLAY
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page hit-number-page football-hit-number-page mlb-hit-number-page" style={MLB_HIT_NUMBER_THEME}>
      <div className="mlb-find-series-progress" aria-label={`Game ${gameIndex + 1} of 2`}>
        <span>HIT THE NUMBER</span>
        <strong>GAME {gameIndex + 1} OF 2</strong>
      </div>

      <FootballHitTheNumberPresentation
        target={game.target}
        metricLabel={game.metricLabel}
        league="MLB"
        configurationLabel={game.configurationLabel}
        pickCount={5}
        candidates={game.candidates.map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          subtitle: candidate.subtitle,
        }))}
        selectedIds={selectedIds}
        values={result ? values : undefined}
        result={result}
        formatValue={(value) => value.toLocaleString()}
        onBack={() => navigate("/mlb")}
        onToggle={toggleCandidate}
        onLock={lockPicks}
        busy={recording}
        renderSubjectMark={(subjectId, className) => {
          const candidate = candidateById.get(subjectId);
          return candidate
            ? <MlbCandidateMark candidate={candidate} className={className} />
            : <span className={className} aria-hidden="true">MLB</span>;
        }}
        resultActions={result && gameIndex === 0 ? (
          <div className="hit-number-result__actions">
            <button type="button" onClick={nextGame}>NEXT GAME →</button>
          </div>
        ) : undefined}
      />

      {result && gameIndex === 1 && finalScore !== null ? (
        <section className="mlb-find-final-score">
          <p className="eyebrow">{practiceMode ? "REPLAY SCORE" : productionMode ? "FINAL SCORE" : "FINAL SCORE"}</p>
          <strong>{finalScore}<small>/100</small></strong>
          <div>
            <span>GAME 1 <b>{scores[0]}</b></span>
            <span>GAME 2 <b>{scores[1]}</b></span>
          </div>
          <p>
            {!productionMode
              ? "Final score is the average of both Hit the Number games."
              : practiceMode
                ? "Replay complete. Your locked official result does not change."
                : recording
                  ? "Saving your official postseason result…"
                  : recordError
                    ? recordError
                    : "Final score is the average of both Hit the Number games."}
          </p>
          <div className="mlb-find-final-actions">
            <button
              className="primary-action"
              type="button"
              disabled={recording}
              onClick={() => {
                if (recordError && productionMode && !practiceMode) {
                  void saveOfficialResult(finalScore, completedGames);
                  return;
                }
                resetRun(productionMode ? true : false);
              }}
            >
              {recordError && productionMode && !practiceMode ? "RETRY SAVE" : "PLAY AGAIN"}
            </button>
            <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>MLB PLAY</button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
