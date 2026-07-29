import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import type { ChallengeJson } from "../challenges/challengeModel";
import { FighterPhoto } from "../rankings/FighterPhoto";
import { useFindLeaderHistory } from "./FindLeaderHistoryProvider";
import {
  buildFindLeaderBoard,
  centralDay,
  dailyFindLeaderBoard,
  findLeaderQuestions,
  type FindLeaderBoard,
  type FindLeaderCandidate,
} from "./findLeaderEngine";
import {
  findLeaderStreaks,
  recentCalendarDays,
  type FindLeaderHistoryRow,
} from "./findLeaderStorage";
import { GameResultActions } from "./GameResultActions";
import {
  curatedLineupIdentity,
  dailyLineupIdentity,
  recordLineupCompletion,
  rememberLineup,
  replayLabelFor,
  seededLineupRandom,
  selectReplayLineup,
  shuffleLineup,
  type PlayLineupIdentity,
} from "./lineupModel";
import { playGames, type PlayGameId } from "./playRegistry";

interface FindLeaderResult {
  score: number;
  perfect: boolean;
  fatalId: string | null;
  eliminated: string[];
}

interface CasualFindLeaderRun {
  board: FindLeaderBoard;
  identity: PlayLineupIdentity;
}

const LIVE_GAME_ROUTES: Partial<Record<PlayGameId, string>> = {
  "find-leader": "/play/find-leader?mode=casual",
  wavelength: "/play/wavelength",
  "blind-resume": "/play/blind-resume",
  "blind-rank": "/play/blind-rank",
  "keep-cut": "/play/keep-cut",
  "better-than": "/play/better-than",
};

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

function validChallengeDay(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && !Array.isArray(value) && typeof value === "object";
}

function challengeSetupDay(value: unknown) {
  if (!isRecord(value)) return null;
  return validChallengeDay(typeof value.day === "string" ? value.day : null);
}

function challengeSetupBoard(value: unknown): FindLeaderBoard | null {
  if (!isRecord(value) || !isRecord(value.board)) return null;
  const board = value.board;
  if (
    typeof board.version !== "string"
    || typeof board.day !== "string"
    || typeof board.definitionId !== "string"
    || typeof board.question !== "string"
    || typeof board.context !== "string"
    || typeof board.statLabel !== "string"
    || typeof board.shortLabel !== "string"
    || typeof board.family !== "string"
    || typeof board.leaderId !== "string"
    || typeof board.leaderValue !== "number"
    || !Array.isArray(board.candidates)
    || board.candidates.length !== 10
  ) return null;

  const candidatesAreValid = board.candidates.every((candidate) => isRecord(candidate)
    && typeof candidate.id === "string"
    && typeof candidate.name === "string"
    && typeof candidate.value === "number"
    && typeof candidate.division === "string"
    && typeof candidate.thumbUrl === "string");

  return candidatesAreValid ? board as unknown as FindLeaderBoard : null;
}

function findLeaderChallengeSetup(board: FindLeaderBoard): ChallengeJson {
  return JSON.parse(JSON.stringify({ day: board.day, board })) as ChallengeJson;
}

function findLeaderChallengeResult(result: FindLeaderResult): ChallengeJson {
  return {
    score: result.score,
    perfect: result.perfect,
    fatalId: result.fatalId,
    eliminated: [...result.eliminated],
  };
}

function createCasualFindLeaderRun(day = centralDay()): CasualFindLeaderRun {
  const selected = selectReplayLineup({
    gameId: "find-leader",
    scopeId: "casual",
    lineupSize: 1,
    attempts: 12,
    validItemIds: new Set(findLeaderQuestions.map((definition) => definition.id)),
    build: (seed) => {
      const definitions = shuffleLineup(
        findLeaderQuestions,
        seededLineupRandom("find-leader", "casual-definition", seed),
      );
      const board = definitions
        .map((definition) => buildFindLeaderBoard(definition, `casual|${seed}`, day))
        .find((candidate): candidate is FindLeaderBoard => Boolean(candidate));
      if (!board) throw new Error("Find the Leader could not build a casual board.");
      return {
        value: board,
        itemIds: [board.definitionId],
        fighterIds: board.candidates.map((fighter) => fighter.id),
      };
    },
  });

  return { board: selected.value, identity: selected.identity };
}

function DailyHistory({
  rows,
  today,
  loading,
  profileBacked,
  error,
}: {
  rows: FindLeaderHistoryRow[];
  today: string;
  loading: boolean;
  profileBacked: boolean;
  error: string;
}) {
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
          )) : (
            <p className="find-history__empty">
              {loading
                ? "Syncing Find the Leader history…"
                : profileBacked
                  ? "Play today’s Find the Leader to begin your profile history."
                  : "Play today’s Find the Leader to begin this device’s history."}
            </p>
          )}
          {error ? <p className="find-history__error" role="status">{error}</p> : null}
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
  identity,
  onExit,
  onComplete,
  onReplay,
  challengeFrom = "",
}: {
  board: FindLeaderBoard;
  identity: PlayLineupIdentity;
  onExit: () => void;
  onComplete: (result: FindLeaderResult) => void;
  onReplay?: () => void;
  challengeFrom?: string;
}) {
  const { beginChallenge } = usePlayChallenges();
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [result, setResult] = useState<FindLeaderResult | null>(null);
  const [challengeStatus, setChallengeStatus] = useState("");
  const eliminatedSet = new Set(eliminated);
  const remaining = board.candidates.filter((fighter) => !eliminatedSet.has(fighter.id));
  const statLabel = resultStatLabel(board);
  const candidateIds = useMemo(() => board.candidates.map((fighter) => fighter.id), [board.candidates]);

  useEffect(() => {
    rememberLineup(identity, candidateIds, candidateIds);
  }, [candidateIds, identity]);

  function finish(score: number, fatalId: string | null, nextEliminated: string[]) {
    const next = { score, perfect: score === 10, fatalId, eliminated: nextEliminated };
    setResult(next);
    recordLineupCompletion(identity, next);
    onComplete(next);
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
    if (identity.type === "replayable" && onReplay) {
      onReplay();
      return;
    }
    setEliminated([]);
    setResult(null);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function challengeSomeone() {
    if (!result) return;
    setChallengeStatus("");
    const url = new URL("/play/find-leader", window.location.origin);
    url.searchParams.set("day", board.day);
    const status = await beginChallenge({
      gameId: "find-leader",
      gameVersion: board.version,
      gameTitle: "Find the Leader",
      summary: board.question,
      setup: findLeaderChallengeSetup(board),
      creatorResult: findLeaderChallengeResult(result),
      shareTitle: "Find the Leader Challenge",
      shareText: `I challenged you to the same Find the Leader board: ${board.question} Can you beat my score?`,
      shareUrl: url.toString(),
    });
    setChallengeStatus(status);
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
        {challengeFrom ? (
          <section className="challenge-game-banner">
            <span>PROFILE CHALLENGE</span>
            <strong>{challengeFrom} sent this exact board.</strong>
            <small>Your result is saved to Challenge Center. Both results unlock after completion.</small>
          </section>
        ) : null}
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
          <GameResultActions
            onChallenge={() => void challengeSomeone()}
            onReplay={replay}
            onAllGames={onExit}
            replayLabel={replayLabelFor(identity.type)}
            status={challengeStatus}
          />
        </section>
      </div>
    );
  }

  const eyebrow = identity.type === "daily"
    ? "TODAY’S CHALLENGE"
    : identity.type === "replayable"
      ? "CASUAL GAME"
      : "CURATED CHALLENGE";

  return (
    <div className="find-game page">
      {challengeFrom ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{challengeFrom} sent this exact board.</strong>
          <small>Finish to unlock both results in Challenge Center.</small>
        </section>
      ) : null}
      <section className="find-game__hero">
        <div>
          <p className="eyebrow">{eyebrow}</p>
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
  const { activeProfile, profiles, getChallenge, submitResult } = usePlayChallenges();
  const {
    rows: history,
    loading: historyLoading,
    error: historyError,
    profileBacked,
    recordAttempt,
  } = useFindLeaderHistory();
  const today = useMemo(() => centralDay(), []);
  const isFindLeaderGame = location.pathname === "/play/find-leader";
  const searchParams = new URLSearchParams(location.search);
  const challengeCode = searchParams.get("challenge")?.toUpperCase() ?? "";
  const profileChallenge = challengeCode ? getChallenge(challengeCode) : null;
  const challengeDay = validChallengeDay(searchParams.get("day"));
  const casualMode = isFindLeaderGame && searchParams.get("mode") === "casual" && !profileChallenge && !challengeDay;
  const storedChallengeBoard = challengeSetupBoard(profileChallenge?.setup);
  const profileChallengeDay = storedChallengeBoard?.day ?? challengeSetupDay(profileChallenge?.setup);
  const gameDay = isFindLeaderGame ? profileChallengeDay ?? challengeDay ?? today : today;
  const todayBoard = useMemo(() => dailyFindLeaderBoard(today), [today]);
  const generatedGameBoard = useMemo(() => dailyFindLeaderBoard(gameDay), [gameDay]);
  const [casualRun, setCasualRun] = useState<CasualFindLeaderRun | null>(() => casualMode ? createCasualFindLeaderRun(today) : null);

  useEffect(() => {
    if (casualMode && !casualRun) setCasualRun(createCasualFindLeaderRun(today));
    if (!casualMode && casualRun) setCasualRun(null);
  }, [casualMode, casualRun, today]);

  const gameBoard = storedChallengeBoard ?? (casualMode ? casualRun?.board ?? null : generatedGameBoard);
  const officialDaily = Boolean(isFindLeaderGame && gameBoard && !casualMode && !profileChallenge && !challengeDay && gameDay === today);
  const gameIdentity = useMemo(() => {
    if (!gameBoard) return null;
    if (casualMode) return casualRun?.identity ?? null;
    const ids = gameBoard.candidates.map((fighter) => fighter.id);
    if (officialDaily) return dailyLineupIdentity("find-leader", gameDay, gameBoard.definitionId);
    const challengeId = profileChallenge?.code ?? `day:${gameDay}:${gameBoard.definitionId}`;
    return curatedLineupIdentity("find-leader", challengeId, ids, gameBoard.definitionId);
  }, [casualMode, casualRun?.identity, gameBoard, gameDay, officialDaily, profileChallenge?.code]);
  const [carousel, setCarousel] = useState<0 | 1>(0);
  const touchStartX = useRef<number | null>(null);
  const todayRow = history.find((row) => row.day === today);
  const challengeCreator = profileChallenge
    ? profiles.find((profile) => profile.id === profileChallenge.creatorId)
    : null;

  function complete(result: FindLeaderResult) {
    if (profileChallenge && activeProfile?.id === profileChallenge.recipientId) {
      submitResult(profileChallenge.code, findLeaderChallengeResult(result));
      return;
    }
    if (gameIdentity?.type === "daily") void recordAttempt(gameDay, result.score);
  }

  function openFindLeader() {
    if (todayBoard) navigate("/play/find-leader");
  }

  function newCasualFindLeader() {
    setCasualRun(createCasualFindLeaderRun(today));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finishSwipe(clientX: number) {
    if (touchStartX.current === null) return;
    const distance = clientX - touchStartX.current;
    touchStartX.current = null;
    if (distance <= -45) setCarousel(1);
    if (distance >= 45) setCarousel(0);
  }

  if (isFindLeaderGame && gameBoard && gameIdentity) {
    return (
      <FindLeaderGame
        key={gameIdentity.challengeId}
        board={gameBoard}
        identity={gameIdentity}
        onExit={() => navigate("/play")}
        onComplete={complete}
        onReplay={gameIdentity.type === "replayable" ? newCasualFindLeader : undefined}
        challengeFrom={challengeCreator?.displayName}
      />
    );
  }

  return (
    <div className="page play-page">
      <section className="page-heading">
        <p className="eyebrow">GAMES &amp; CHALLENGES</p>
        <h1>Play</h1>
        <p>Daily challenges, blind debates, and UFC rankings built to argue about.</p>
      </section>

      <section
        className="play-daily"
        onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
        onTouchEnd={(event) => finishSwipe(event.changedTouches[0]?.clientX ?? 0)}
      >
        {carousel === 0 && todayBoard ? (
          <button className="play-daily__challenge" type="button" onClick={openFindLeader}>
            <div className="play-daily__topline"><span>TODAY’S CHALLENGE</span><b>{dateLabel(today).toUpperCase()}</b></div>
            <h2>FIND THE LEADER</h2>
            <p>Eliminate nine fighters without removing today’s verified stat leader.</p>
            <div className="play-daily__category"><span>TODAY’S CATEGORY</span><strong>{todayBoard.statLabel}</strong></div>
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
              <div className="play-daily__empty">{historyLoading ? "Syncing your official result…" : "No completed score yet. Play today’s challenge to get on your board."}</div>
            )}
            <small>{profileBacked ? "Your official result follows this profile across devices." : "Signed-out results stay on this device."}</small>
          </article>
        )}
        <div className="play-daily__dots" aria-label="Daily challenge carousel">
          <button aria-label="Show today’s challenge" className={carousel === 0 ? "is-active" : ""} type="button" onClick={() => setCarousel(0)} />
          <button aria-label="Show today’s leaderboard" className={carousel === 1 ? "is-active" : ""} type="button" onClick={() => setCarousel(1)} />
        </div>
      </section>

      <DailyHistory
        rows={history}
        today={today}
        loading={historyLoading}
        profileBacked={profileBacked}
        error={historyError}
      />
      <ChallengeCenter />

      <section className="play-games">
        <header>
          <p className="eyebrow">ALL GAMES</p>
          <h2>Pick your debate</h2>
          <p>Quick games, blind tests, and rankings built to argue about.</p>
        </header>
        <div className="play-games__grid">
          {playGames.map((game) => {
            const route = LIVE_GAME_ROUTES[game.id];
            return route ? (
              <button className="play-game-card" type="button" key={game.id} onClick={() => navigate(route)}>
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
