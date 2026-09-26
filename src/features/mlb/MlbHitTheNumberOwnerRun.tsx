import { useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import {
  FootballHitTheNumberPresentation,
  type FootballHitNumberPresentationResult,
} from "../back-room/FootballHitTheNumberPresentation";
import { hitTheNumberScore } from "../play/hitTheNumberEngine";
import { mlbTeamAssetByAbbreviation } from "./mlbTeamAssets";

export type MlbHitNumberOwnerCandidate = {
  id: string;
  name: string;
  subtitle: string;
  teamAbbreviation: string;
  value: number;
};

export type MlbHitNumberOwnerGame = {
  id: string;
  metricLabel: string;
  configurationLabel: string;
  target: number;
  candidates: readonly MlbHitNumberOwnerCandidate[];
};

// Disposable owner-review content. These exact boards, targets, and player-season
// identities are burned after review and must not be reused for the real Oct. 15 game.
// Career totals and single-season HR values are factual; Baseball-Reference/MLB leader
// tables were checked when this mock was authored.
export const MLB_HIT_NUMBER_OWNER_GAMES: readonly [MlbHitNumberOwnerGame, MlbHitNumberOwnerGame] = [
  {
    id: "mlb-owner-hit-number-career-steroid-era",
    metricLabel: "Career Home Runs",
    configurationLabel: "Steroid Era Sluggers · 1990s / 2000s",
    target: 2680,
    candidates: [
      { id: "owner-bonds", name: "Barry Bonds", subtitle: "Giants", teamAbbreviation: "SF", value: 762 },
      { id: "owner-arod", name: "Alex Rodriguez", subtitle: "Yankees", teamAbbreviation: "NYY", value: 696 },
      { id: "owner-griffey", name: "Ken Griffey Jr.", subtitle: "Mariners", teamAbbreviation: "SEA", value: 630 },
      { id: "owner-thome", name: "Jim Thome", subtitle: "Cleveland", teamAbbreviation: "CLE", value: 612 },
      { id: "owner-sosa", name: "Sammy Sosa", subtitle: "Cubs", teamAbbreviation: "CHC", value: 609 },
      { id: "owner-mcgwire", name: "Mark McGwire", subtitle: "Cardinals", teamAbbreviation: "STL", value: 583 },
      { id: "owner-palmeiro", name: "Rafael Palmeiro", subtitle: "Rangers", teamAbbreviation: "TEX", value: 569 },
      { id: "owner-manny", name: "Manny Ramirez", subtitle: "Red Sox", teamAbbreviation: "BOS", value: 555 },
      { id: "owner-frank-thomas", name: "Frank Thomas", subtitle: "White Sox", teamAbbreviation: "CWS", value: 521 },
      { id: "owner-sheffield", name: "Gary Sheffield", subtitle: "Braves", teamAbbreviation: "ATL", value: 509 },
      { id: "owner-delgado", name: "Carlos Delgado", subtitle: "Blue Jays", teamAbbreviation: "TOR", value: 473 },
      { id: "owner-bagwell", name: "Jeff Bagwell", subtitle: "Astros", teamAbbreviation: "HOU", value: 449 },
      { id: "owner-giambi", name: "Jason Giambi", subtitle: "Yankees", teamAbbreviation: "NYY", value: 440 },
      { id: "owner-juan-gonzalez", name: "Juan Gonzalez", subtitle: "Rangers", teamAbbreviation: "TEX", value: 434 },
    ],
  },
  {
    id: "mlb-owner-hit-number-single-season",
    metricLabel: "Single-Season Home Runs",
    configurationLabel: "Single-Season Bombers",
    target: 280,
    candidates: [
      { id: "owner-judge-2022", name: "Aaron Judge · 2022", subtitle: "Yankees", teamAbbreviation: "NYY", value: 62 },
      { id: "owner-stanton-2017", name: "Giancarlo Stanton · 2017", subtitle: "Marlins", teamAbbreviation: "MIA", value: 59 },
      { id: "owner-howard-2006", name: "Ryan Howard · 2006", subtitle: "Phillies", teamAbbreviation: "PHI", value: 58 },
      { id: "owner-luis-gonzalez-2001", name: "Luis Gonzalez · 2001", subtitle: "Diamondbacks", teamAbbreviation: "ARI", value: 57 },
      { id: "owner-bautista-2010", name: "Jose Bautista · 2010", subtitle: "Blue Jays", teamAbbreviation: "TOR", value: 54 },
      { id: "owner-ortiz-2006", name: "David Ortiz · 2006", subtitle: "Red Sox", teamAbbreviation: "BOS", value: 54 },
      { id: "owner-olson-2023", name: "Matt Olson · 2023", subtitle: "Braves", teamAbbreviation: "ATL", value: 54 },
      { id: "owner-alonso-2019", name: "Pete Alonso · 2019", subtitle: "Mets", teamAbbreviation: "NYM", value: 53 },
      { id: "owner-chris-davis-2013", name: "Chris Davis · 2013", subtitle: "Orioles", teamAbbreviation: "BAL", value: 53 },
      { id: "owner-andruw-jones-2005", name: "Andruw Jones · 2005", subtitle: "Braves", teamAbbreviation: "ATL", value: 51 },
      { id: "owner-prince-fielder-2007", name: "Prince Fielder · 2007", subtitle: "Brewers", teamAbbreviation: "MIL", value: 50 },
      { id: "owner-greg-vaughn-1998", name: "Greg Vaughn · 1998", subtitle: "Padres", teamAbbreviation: "SD", value: 50 },
      { id: "owner-cecil-fielder-1990", name: "Cecil Fielder · 1990", subtitle: "Tigers", teamAbbreviation: "DET", value: 51 },
      { id: "owner-george-foster-1977", name: "George Foster · 1977", subtitle: "Reds", teamAbbreviation: "CIN", value: 52 },
    ],
  },
] as const;

const MLB_HIT_NUMBER_THEME = {
  "--football-accent": "var(--mlb-green-strong)",
  "--football-accent-rgb": "var(--mlb-green-rgb)",
  "--ufc-red-strong": "var(--mlb-green-strong)",
} as CSSProperties;

function grade(game: MlbHitNumberOwnerGame, selectedIds: readonly string[]): FootballHitNumberPresentationResult {
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
  candidate: MlbHitNumberOwnerCandidate;
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

export default function MlbHitTheNumberOwnerRun() {
  const navigate = useNavigate();
  const [gameIndex, setGameIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<FootballHitNumberPresentationResult | null>(null);
  const [scores, setScores] = useState<number[]>([]);

  const game = MLB_HIT_NUMBER_OWNER_GAMES[gameIndex] ?? MLB_HIT_NUMBER_OWNER_GAMES[0];
  const candidateById = useMemo(
    () => new Map(game.candidates.map((candidate) => [candidate.id, candidate])),
    [game],
  );
  const values = useMemo(
    () => Object.fromEntries(game.candidates.map((candidate) => [candidate.id, candidate.value])),
    [game],
  );
  const finalScore = scores.length === MLB_HIT_NUMBER_OWNER_GAMES.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : null;

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

  function lockPicks() {
    if (selectedIds.length !== 5 || result) return;
    const next = grade(game, selectedIds);
    setResult(next);
    setScores((current) => [...current.slice(0, gameIndex), next.score]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextGame() {
    setGameIndex(1);
    setSelectedIds([]);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setGameIndex(0);
    setSelectedIds([]);
    setResult(null);
    setScores([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <p className="eyebrow">FINAL SCORE</p>
          <strong>{finalScore}<small>/100</small></strong>
          <div>
            <span>GAME 1 <b>{scores[0]}</b></span>
            <span>GAME 2 <b>{scores[1]}</b></span>
          </div>
          <p>Final score is the average of both Hit the Number games.</p>
          <div className="mlb-find-final-actions">
            <button className="primary-action" type="button" onClick={restart}>PLAY AGAIN</button>
            <button className="find-secondary-action" type="button" onClick={() => navigate("/mlb")}>MLB PLAY</button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
