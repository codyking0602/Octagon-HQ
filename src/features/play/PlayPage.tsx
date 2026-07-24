import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FighterPhoto } from "../rankings/FighterPhoto";
import {
  centralDay,
  dailyFindLeaderBoard,
  type FindLeaderBoard,
  type FindLeaderCandidate,
} from "./findLeaderEngine";
import {
  findLeaderStreaks,
  loadFindLeaderHistory,
  recentCalendarDays,
  recordFindLeaderAttempt,
  type FindLeaderHistoryRow,
} from "./findLeaderStorage";
import { playGames } from "./playRegistry";

interface FindLeaderResult {
  score: number;
  perfect: boolean;
  fatalId: string | null;
  eliminated: string[];
}

const DIVISION_ABBREVIATIONS: Record<string, string> = {
  Strawweight: "SW",
  Flyweight: "FLW",
  Bantamweight: "BW",
  Featherweight: "FW",
  Lightweight: "LW",
  Welterweight: "WW",
  Middleweight: "MW",
  "Light Heavyweight": "LHW",
  Heavyweight: "HW",
};

function dateLabel(day: string, includeWeekday = true) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: includeWeekday ? "short" : undefined,
    month: "short",
    day: "numeric",
  }).format(new Date(`${day}T12:00:00Z`));
}

function compactDivision(value: string) {
  return value
    .split("/")
    .map((division) => division.trim())
    .filter(Boolean)
    .map((division) => DIVISION_ABBREVIATIONS[division] ?? division)
    .join(" / ");
}

function resultStatLabel(board: FindLeaderBoard) {
  return /KO\/TKO/i.test(board.statLabel) ? "KO/TKO WINS" : board.shortLabel;
}

function objectiveCopy(board: FindLeaderBoard) {
  const label = board.statLabel.replace(/^all-time\s+/i, "");
  if (/percentage/i.test(label)) return `Leave the fighter with the highest ${label} among this group.`;
  if (/span|streak/i.test(label)) return `Leave the fighter with the longest ${label} among this group.`;
  return `Leave the fighter with the most ${label} among this group.`;
}

function DailyHistory({ rows, today }: { rows: FindLeaderHistoryRow[]; today: string }) {
  const stats = findLeaderStreaks(rows, today);
  const rowByDay = new Map(rows.map((row) => [row.day, row]));
  return (
    <details className="find-history surface-card">
      <summary>
        <div>
          <p className="eyebrow">DAILY HISTORY</p>
          <strong>Find the Leader streak</strong>
        </div>
        <span><b>{stats.current}</b>-day current · <b>{stats.best}</b>-day best</span>
      </summary>
      <div className="find-history__body">
        <div className="find-history__metrics">
          <div><span>CURRENT</span><strong>{stats.current}</strong><small>Consecutive days</small></div>
          <div><span>BEST</span><strong>{stats.best}</strong><small>Longest streak</small></div>
          <div><span>PERFECT 10s</span><strong>{stats.perfect}</strong><small>Official runs</small></div>
          <div><span>DAILY PLAYS</span><strong>{stats.total}</strong><small>Recorded days</small></div>
        </div>
        <div className="find-history__calendar" aria-label="Recent Find the Leader history">
          {recentCalendarDays(today).map((day) => {
            const row = rowByDay.get(day);
            return (
              <div className={`find-history__day${row ? " is-complete" : ""}${row?.officialScore === 10 ? " is-perfect" : ""}`} key={day}>
                <b>{day.slice(-2)}</b>
                <span>{row ? `${row.officialScore}/10` : "—"}</span>
              </div>
            );
          })}
        </div>
        <div className="find-history__recent">
          {rows.length ? rows.slice(0, 6).map((row) => (
            <div className="find-history__row" key={row.day}>
              <span><strong>{dateLabel(row.day)}</strong><small>{row.attempts > 1 ? `Best ${row.bestScore}/10 · ${row.attempts} attempts` : "Official first attempt"}</small></span>
              <b>{row.officialScore}/10</b>
            </div>
          )) : <p className="find-history__empty">Play today’s Find the Leader to begin your daily history.</p>}
        </div>
      </div>
    </details>
  );
}

function CandidatePhoto({ fighter, className = "" }: { fighter: FindLeaderCandidate; className?: string }) {
  return <FighterPhoto name={fighter.name} src={fighter.thumbUrl} className={className} />;
}

function FindLeaderGame({
  board,
  onExit,
  onComplete,
}: {
  board: FindLeaderBoard;
  onExit: () => void;
  onComplete: (score: number) => void;
}) {
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [result, setResult] = useState<FindLeaderResult | null>(null);
  const eliminatedSet = new Set(eliminated);
  const remaining = board.candidates.filter((fighter) => !eliminatedSet.has(fighter.id));
  const statLabel = resultStatLabel(board);

  function finish(score: number, fatalId: string | null, nextEliminated: string[]) {
    const next = { score, perfect: score === 10, fatalId, eliminated: nextEliminated };
    setResult(next);
    onComplete(score);
  }

  function eliminate(id: string) {
    if (result || eliminatedSet.has(id)) return;
    const round = eliminated.length + 1;
    const next = [...eliminated, id];
    if (id === board.leaderId) {
      setEliminated(next);
      finish(round, id, next);
      return;
    }
    setEliminated(next);
    if (next.length === 9) finish(10, null, next);
  }

  function replay() {
    setEliminated([]);
    setResult(null);
  }

  if (result) {
    const leader = board.candidates.find((fighter) => fighter.id === board.leaderId)!;
    const sorted = [...board.candidates].sort((left, right) => right.value - left.value || left.name.localeCompare(right.name));
    const valueCounts = sorted.reduce<Map<number, number>>((counts, fighter) => {
      counts.set(fighter.value, (counts.get(fighter.value) ?? 0) + 1);
      return counts;
    }, new Map());
    let currentRank = 0;
    let previousValue: number | null = null;

    return (
      <div className="find-game page">
        <section className={`find-result-hero ${result.perfect ? "is-perfect" : ""}`}>
          <div>
            <p className="eyebrow">{result.perfect ? "PERFECT RUN" : "RUN ENDED"}</p>
            <h1>{result.perfect ? "PERFECT 10" : `ROUND ${result.score}`}</h1>
            <p>{result.perfect ? `You eliminated all nine non-leaders and left ${leader.name} standing.` : `You removed the group leader, ${leader.name}, in Round ${result.score}.`}</p>
          </div>
          <article>
            <CandidatePhoto fighter={leader} className="find-result-hero__photo" />
            <span><small>GROUP LEADER</small><strong>{leader.name}</strong><b>{leader.value} {statLabel}</b></span>
          </article>
        </section>

        <section className="surface-card find-reveal">
          <header className="section-heading">
            <div><p className="eyebrow">FULL STAT REVEAL</p><h2>{board.question}</h2></div>
            <strong>{result.score}/10</strong>
          </header>
          <div className="find-reveal__grid">
            {sorted.map((fighter, index) => {
              if (fighter.value !== previousValue) currentRank = index + 1;
              previousValue = fighter.value;
              const tied = (valueCounts.get(fighter.value) ?? 0) > 1;
              const rankLabel = tied ? `T-${currentRank}` : `#${currentRank}`;
              const fatal = result.fatalId === fighter.id;
              const leaderCard = fighter.id === board.leaderId;
              return (
                <article className={`find-reveal__row${fatal ? " is-fatal" : ""}${leaderCard ? " is-leader" : ""}`} key={fighter.id}>
                  <b>{rankLabel}</b>
                  <CandidatePhoto fighter={fighter} className="find-reveal__photo" />
                  <span><strong>{fighter.name}</strong><small>{fighter.division}</small></span>
                  <em>{fighter.value}<small>{statLabel}</small></em>
                </article>
              );
            })}
          </div>
          <div className="find-result-actions">
            <button className="primary-action" type="button" onClick={replay}>REPLAY TODAY’S BOARD</button>
            <button className="find-secondary-action" type="button" onClick={onExit}>ALL GAMES</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="find-game page">
      <section className="find-game__hero">
        <div>
          <p className="eyebrow">TODAY’S CHALLENGE</p>
          <h1>{board.question}</h1>
          <p>{objectiveCopy(board)}</p>
        </div>
        <aside>
          <div><span>ROUND</span><strong>{eliminated.length + 1}</strong></div>
          <div><span>STANDING</span><strong>{remaining.length}</strong></div>
          <div><span>SAFE</span><strong>{eliminated.length}/9</strong></div>
        </aside>
      </section>
      <section className="find-game__grid" aria-label={board.question}>
        {board.candidates.map((fighter, index) => {
          const safe = eliminatedSet.has(fighter.id);
          return (
            <button className={`find-card${safe ? " is-safe" : ""}`} disabled={safe} type="button" key={fighter.id} onClick={() => eliminate(fighter.id)}>
              <span className="find-card__number">{index + 1}</span>
              <CandidatePhoto fighter={fighter} className="find-card__photo" />
              <span className="find-card__name"><strong>{fighter.name}</strong><small>{compactDivision(fighter.division)}</small></span>
              <em>{safe ? `SAFE · ${fighter.value}` : "ELIMINATE"}</em>
            </button>
          );
        })}
      </section>
    </div>
  );
}

export default function PlayPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const today = useMemo(() => centralDay(), []);
  const board = useMemo(() => dailyFindLeaderBoard(today), [today]);
  const [carousel, setCarousel] = useState<0 | 1>(0);
  const touchStartX = useRef<number | null>(null);
  const [history, setHistory] = useState<FindLeaderHistoryRow[]>(() => loadFindLeaderHistory());
  const todayRow = history.find((row) => row.day === today);
  const isFindLeaderGame = location.pathname === "/play/find-leader";

  function complete(score: number) {
    setHistory(recordFindLeaderAttempt(today, score));
  }

  function openFindLeader() {
    if (board) navigate("/play/find-leader");
  }

  function openWavelength() {
    navigate("/play/wavelength");
  }

  function finishSwipe(clientX: number) {
    if (touchStartX.current === null) return;
    const distance = clientX - touchStartX.current;
    touchStartX.current = null;
    if (distance <= -45) setCarousel(1);
    if (distance >= 45) setCarousel(0);
  }

  if (isFindLeaderGame && board) {
    return <FindLeaderGame board={board} onExit={() => navigate("/play")} onComplete={complete} />;
  }

  return (
    <div className="page play-page">
      <section className="page-heading">
        <p className="eyebrow">GAMES & CHALLENGES</p>
        <h1>Play</h1>
        <p>Daily challenges, blind debates, and UFC rankings built to argue about.</p>
      </section>

      <section
        className="play-daily"
        onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
        onTouchEnd={(event) => finishSwipe(event.changedTouches[0]?.clientX ?? 0)}
      >
        {carousel === 0 && board ? (
          <button className="play-daily__challenge" type="button" onClick={openFindLeader}>
            <div className="play-daily__topline"><span>TODAY’S CHALLENGE</span><b>{dateLabel(today).toUpperCase()}</b></div>
            <h2>FIND THE LEADER</h2>
            <p>Eliminate nine fighters without removing today’s verified stat leader.</p>
            <div className="play-daily__category"><span>TODAY’S CATEGORY</span><strong>{board.statLabel}</strong></div>
            <div className="play-daily__graphic"><b>10</b><span>→</span><b>1</b><small>LEAVE THE LEADER</small></div>
            <em>TAP TO PLAY · SWIPE FOR LEADERBOARD →</em>
          </button>
        ) : (
          <article className="play-daily__leaderboard">
            <p className="eyebrow">{dateLabel(today).toUpperCase()}</p>
            <h2>Find the Leader<br />Leaderboard</h2>
            {todayRow ? (
              <div className="play-daily__score-row"><span><strong>Your official score</strong><small>First completed attempt</small></span><b>{todayRow.officialScore}/10</b></div>
            ) : (
              <div className="play-daily__empty">No completed score yet. Play today’s challenge to get on your board.</div>
            )}
            <small>The shared friend leaderboard will use this same daily result when V2 profiles connect.</small>
          </article>
        )}
        <div className="play-daily__dots" aria-label="Daily challenge carousel">
          <button aria-label="Show today’s challenge" className={carousel === 0 ? "is-active" : ""} type="button" onClick={() => setCarousel(0)} />
          <button aria-label="Show today’s leaderboard" className={carousel === 1 ? "is-active" : ""} type="button" onClick={() => setCarousel(1)} />
        </div>
      </section>

      <DailyHistory rows={history} today={today} />

      <section className="play-games">
        <header>
          <p className="eyebrow">ALL GAMES</p>
          <h2>Pick your debate</h2>
          <p>Quick games, blind tests, and rankings built to argue about.</p>
        </header>
        <div className="play-games__grid">
          {playGames.map((game) => {
            const isFindLeader = game.id === "find-leader";
            const isWavelength = game.id === "wavelength";
            const isLive = isFindLeader || isWavelength;
            const open = isFindLeader ? openFindLeader : isWavelength ? openWavelength : undefined;
            return isLive ? (
              <button className="play-game-card is-live" type="button" key={game.id} onClick={open}>
                <span className="play-game-card__icon">{game.icon}</span>
                <span className="play-game-card__status">PLAY NOW</span>
                <strong>{game.title}</strong>
                <small>{game.description}</small>
                <em>OPEN GAME →</em>
              </button>
            ) : (
              <article className="play-game-card" key={game.id}>
                <span className="play-game-card__icon">{game.icon}</span>
                <strong>{game.title}</strong>
                <small>{game.description}</small>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
