import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { GameResultActions } from "../play/GameResultActions";
import { recordLineupCompletion } from "../play/lineupModel";
import { FootballFindLeaderPresentation } from "../back-room/FootballFindLeaderPresentation";
import { asChallengeJson, challengeRecord, challengeString, footballChallengeUrl } from "../back-room/footballChallengeRuntime";
import {
  createNbaFindLeaderChallenge, createNbaFindLeaderDailyPreview,
  createNbaFindLeaderRun, formatNbaFindLeaderValue, nbaFindLeaderHeadshot,
  type NbaLeaderBoard, type NbaLeaderCandidate, type NbaLeaderRun,
} from "./nbaFindTheLeaderModel";
import "../../styles/football-find-leader.css";
import "../../styles/nba-find-the-leader.css";

type Result = { score: number; perfect: boolean; fatalId: string | null };
const nbaTheme = {
  "--football-accent": "#f2a341",
  "--football-accent-rgb": "242,163,65",
} as CSSProperties;
function chicagoDay() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (part: string) => parts.find(row => row.type === part)?.value ?? "00";
  return get("year") + "-" + get("month") + "-" + get("day");
}
function NbaHeadshot({ candidate, compact = false }: { candidate: NbaLeaderCandidate; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const image = nbaFindLeaderHeadshot(candidate);
  useEffect(() => setFailed(false), [image, candidate.id]);
  const initials = candidate.name.split(" ").map(part => part[0]).filter(Boolean).slice(0, 2).join("");
  return <span className={"football-find-card__visual nba-find-card__photo" + (compact ? " is-compact" : "") + (candidate.name === "Gail Goodrich" ? " is-editorial" : "")}
    aria-label={candidate.name + (image && !failed ? " player portrait" : " player initials")}>
    {image && !failed ? <img src={image} alt="" loading="lazy" referrerPolicy="no-referrer"
      onError={() => setFailed(true)} /> : <b aria-hidden="true">{initials || "NBA"}</b>}
  </span>;
}
function findCandidate(board: NbaLeaderBoard, id: string): NbaLeaderCandidate {
  const candidate = board.candidates.find(row => row.id === id);
  if (!candidate) throw new Error("Unknown NBA Find the Leader candidate.");
  return candidate;
}
export default function NbaFindTheLeaderPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { beginChallenge } = usePlayChallenges();
  const match = useProfileChallengeMatch("find-leader");
  const setup = challengeRecord(match.challenge?.setup);
  const seedFromProfile = challengeString(setup?.seed);
  const definitionFromProfile = challengeString(setup?.definitionId);
  const seed = seedFromProfile ?? params.get("seed");
  const definition = definitionFromProfile ?? params.get("definition");
  const challengeId = match.challenge?.code ?? "shared-nba";
  const shared = useMemo(() => seed && definition
    ? createNbaFindLeaderChallenge(seed, definition, challengeId) : null, [seed, definition, challengeId]);
  const daily = params.get("mode") === "daily";
  const day = chicagoDay();
  const [run, setRun] = useState<NbaLeaderRun>(() =>
    shared ?? (daily ? createNbaFindLeaderDailyPreview(day) : createNbaFindLeaderRun()));
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [shareStatus, setShareStatus] = useState("");
  useEffect(() => {
    if (!shared || run.identity.challengeId === shared.identity.challengeId) return;
    reset(shared);
  }, [shared, run.identity.challengeId]);
  const board = run.board;
  const isShared = run.identity.type === "curated";
  const isDaily = run.identity.type === "daily";
  function reset(next: NbaLeaderRun) {
    setRun(next); setEliminated([]); setResult(null); setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function eliminate(id: string) {
    if (result || eliminated.includes(id)) return;
    findCandidate(board, id);
    const next = [...eliminated, id];
    setEliminated(next);
    const perfect = next.length === 9 && id !== board.leaderId;
    if (id !== board.leaderId && !perfect) return;
    const final = { score: perfect ? 100 : next.length * 10, perfect, fatalId: perfect ? null : id };
    setResult(final);
    recordLineupCompletion(run.identity, { ...final, eliminated: next });
    if (match.isRecipient && match.challenge?.responderResult === null) {
      match.submitResult(asChallengeJson({
        score: final.score / 10, perfect, fatalId: final.fatalId, eliminated: next,
      }));
    }
  }
  function replay() {
    if (isShared) reset(run);
    else if (isDaily) reset(createNbaFindLeaderDailyPreview(day));
    else reset(createNbaFindLeaderRun());
  }
  async function challengeSomeone() {
    if (!result) return;
    const originalSeed = isShared ? seed! : run.identity.seed;
    const status = await beginChallenge({
      gameId: "find-leader",
      gameVersion: board.version,
      gameTitle: "NBA Find the Leader",
      summary: board.categoryLabel + " · Same ten NBA players",
      setup: asChallengeJson({ seed: originalSeed, definitionId: board.definitionId,
        board: { leaderId: board.leaderId, candidates: board.candidates.map(c => ({ id: c.id, name: c.name })) } }),
      creatorResult: asChallengeJson({
        score: result.score / 10, perfect: result.perfect, fatalId: result.fatalId, eliminated,
      }),
      shareTitle: "NBA Find the Leader Challenge",
      shareText: "Try my NBA Find the Leader board: " + board.statLabel,
      shareUrl: footballChallengeUrl("/nba/find-the-leader", { seed: originalSeed, definition: board.definitionId }),
    });
    setShareStatus(status);
  }
  const visual = (candidate: { id: string }, compact?: boolean) =>
    <NbaHeadshot candidate={findCandidate(board, candidate.id)} compact={compact} />;
  const eyebrow = isShared ? "CHALLENGE BOARD" : isDaily ? "NBA DAILY · OWNER PREVIEW" : "REPLAYABLE GAME";
  return <div className="page football-find-leader-page nba-find-leader-page" data-sport="nba"
    data-game="find-the-leader" style={nbaTheme}>
    {isDaily && <section className="nba-find-preview-label" role="note">
      OWNER DAILY PREVIEW · Today's board is deterministic, but it is not an official ranked Daily Challenge yet.
    </section>}
    {match.creator && <section className="challenge-game-banner"><span>PROFILE CHALLENGE</span>
      <strong>{match.creator.displayName} sent this exact NBA Find the Leader board.</strong>
      <small>Both elimination paths reveal after you finish.</small>
    </section>}
    <FootballFindLeaderPresentation
      question={board.question} context={board.context} categoryLabel={board.categoryLabel}
      statLabel={board.statLabel} shortLabel={board.shortLabel} candidates={board.candidates}
      leaderId={board.leaderId} eliminatedIds={eliminated} result={result}
      eyebrow={eyebrow} intro="Eliminate nine decoys until only the leader remains."
      onNewLineup={!result && !isShared && !isDaily ? () => reset(createNbaFindLeaderRun()) : null}
      onEliminate={result ? null : eliminate} renderVisual={visual}
      formatValue={formatNbaFindLeaderValue}
    />
    {result && <GameResultActions onChallenge={() => void challengeSomeone()}
      onReplay={replay} onAllGames={() => navigate("/nba")}
      replayLabel={isDaily ? "REPLAY TODAY" : isShared ? "REPLAY CHALLENGE" : "NEW LINEUP"}
      status={shareStatus} />}
  </div>;
}
