import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import type { ChallengeJson } from "../challenges/challengeModel";
import {
  HIT_THE_NUMBER_STATS,
  HIT_THE_NUMBER_VERSION,
  createGeneratedHitTheNumberBoard,
  gradeHitTheNumberSelection,
  type HitTheNumberBoard,
  type HitTheNumberBoardType,
  type HitTheNumberResult,
} from "./hitTheNumberEngine";
import { HitTheNumberGameView } from "./HitTheNumberGameView";
import { GameResultActions } from "./GameResultActions";
import {
  curatedLineupIdentity,
  recordLineupCompletion,
  rememberLineup,
  selectReplayLineup,
  stableLineupHash,
  type PlayLineupIdentity,
} from "./lineupModel";

interface HitTheNumberRun {
  board: HitTheNumberBoard;
  identity: PlayLineupIdentity;
  seed: string;
}

const DEFAULT_BOARD_TYPE: HitTheNumberBoardType = "open-roster";

function asJson(value: unknown): ChallengeJson {
  return JSON.parse(JSON.stringify(value)) as ChallengeJson;
}

function boardSignature(board: HitTheNumberBoard) {
  const setup = board.publicSetup;
  const pool = setup.boardType === "random-pool" ? setup.fighterIds.join(",") : "open";
  return [
    setup.statId,
    setup.boardType,
    setup.filter.gender ?? "all",
    setup.filter.division ?? "all",
    setup.pickCount,
    setup.target,
    pool,
  ].join("|");
}

function createCasualRun(boardType: HitTheNumberBoardType): HitTheNumberRun {
  const selected = selectReplayLineup({
    gameId: "hit-the-number",
    scopeId: boardType,
    lineupSize: 1,
    attempts: 12,
    build: (seed) => {
      const board = createGeneratedHitTheNumberBoard({ seed, boardType });
      return {
        value: board,
        itemIds: [boardSignature(board)],
        fighterIds: board.publicSetup.boardType === "random-pool"
          ? board.publicSetup.fighterIds
          : [],
      };
    },
  });

  return { board: selected.value, identity: selected.identity, seed: selected.identity.seed };
}

function createSharedRun(searchParams: URLSearchParams): HitTheNumberRun | null {
  const seed = searchParams.get("challenge")?.trim() ?? "";
  const boardParam = searchParams.get("board");
  const boardType: HitTheNumberBoardType | null = boardParam === "open-roster" || boardParam === "random-pool"
    ? boardParam
    : null;
  if (!seed || seed.length > 200 || !boardType) return null;

  try {
    const board = createGeneratedHitTheNumberBoard({ seed, boardType });
    const signature = boardSignature(board);
    const challengeId = `shared-${stableLineupHash(signature).toString(36)}`;
    const identity = curatedLineupIdentity("hit-the-number", challengeId, [signature], boardType);
    rememberLineup(identity, [signature], board.publicSetup.fighterIds);
    return { board, identity, seed };
  } catch {
    return null;
  }
}

function hitTheNumberChallengeUrl(seed: string, boardType: HitTheNumberBoardType) {
  const url = new URL("/play/hit-the-number", window.location.origin);
  url.searchParams.set("challenge", seed);
  url.searchParams.set("board", boardType);
  return url.toString();
}

export default function HitTheNumberPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { beginChallenge } = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("hit-the-number");
  const searchKey = searchParams.toString();
  const sharedRun = useMemo(
    () => createSharedRun(new URLSearchParams(searchKey)),
    [searchKey],
  );
  const [run, setRun] = useState<HitTheNumberRun>(() => sharedRun ?? createCasualRun(DEFAULT_BOARD_TYPE));
  const [boardType, setBoardType] = useState<HitTheNumberBoardType>(
    () => sharedRun?.board.publicSetup.boardType ?? DEFAULT_BOARD_TYPE,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<HitTheNumberResult | null>(null);
  const [search, setSearch] = useState("");
  const [challengeStatus, setChallengeStatus] = useState("");
  const setup = run.board.publicSetup;
  const selectedSet = new Set(selectedIds);
  const shared = run.identity.type === "curated";
  const stat = HIT_THE_NUMBER_STATS.find((item) => item.id === setup.statId)!;

  useEffect(() => {
    if (
      !result
      || !profileMatch.isRecipient
      || !profileMatch.challenge
      || profileMatch.challenge.responderResult !== null
    ) return;
    profileMatch.submitResult(asJson(result));
  }, [
    result,
    profileMatch.isRecipient,
    profileMatch.challenge?.code,
    profileMatch.challenge?.responderResult,
  ]);

  function resetRound() {
    setSelectedIds([]);
    setResult(null);
    setSearch("");
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function newLineup(nextBoardType = boardType) {
    setBoardType(nextBoardType);
    setRun(createCasualRun(nextBoardType));
    resetRound();
  }

  function replay() {
    if (shared) {
      resetRound();
      return;
    }
    newLineup();
  }

  function chooseBoardType(nextBoardType: HitTheNumberBoardType) {
    if (shared || nextBoardType === boardType) return;
    newLineup(nextBoardType);
  }

  function toggleFighter(fighterId: string) {
    if (result) return;
    if (selectedSet.has(fighterId)) {
      setSelectedIds((current) => current.filter((id) => id !== fighterId));
      return;
    }
    if (selectedIds.length >= setup.pickCount) return;
    setSelectedIds((current) => [...current, fighterId]);
  }

  function lockPicks() {
    if (result || selectedIds.length !== setup.pickCount) return;
    const next = gradeHitTheNumberSelection(setup, selectedIds);
    setResult(next);
    recordLineupCompletion(run.identity, {
      status: next.status,
      score: next.score,
      target: next.target,
      total: next.total,
      distance: next.distance,
      selectedFighterIds: [...selectedIds],
    });
  }

  async function challengeSomeone() {
    if (!result) return;
    setChallengeStatus("");
    const status = await beginChallenge({
      gameId: "hit-the-number",
      gameVersion: HIT_THE_NUMBER_VERSION,
      gameTitle: "Hit the Number",
      summary: `${stat.label} · target ${setup.target} · pick ${setup.pickCount}`,
      setup: asJson({
        seed: run.seed,
        boardType: setup.boardType,
        publicSetup: setup,
      }),
      creatorResult: asJson(result),
      shareTitle: "Hit the Number Challenge",
      shareText: `I challenged you to Hit the Number on the same UFC board: target ${setup.target} ${stat.label}, pick ${setup.pickCount}.`,
      shareUrl: hitTheNumberChallengeUrl(run.seed, setup.boardType),
    });
    setChallengeStatus(status);
  }

  const controls = !shared ? (
    <section className="hit-number-controls surface-card" aria-label="Hit the Number board type">
      <div className="hit-number-mode-toggle" aria-label="Roster mode">
        <button
          type="button"
          className={boardType === "open-roster" ? "is-active" : ""}
          aria-pressed={boardType === "open-roster"}
          onClick={() => chooseBoardType("open-roster")}
        >
          OPEN ROSTER
        </button>
        <button
          type="button"
          className={boardType === "random-pool" ? "is-active" : ""}
          aria-pressed={boardType === "random-pool"}
          onClick={() => chooseBoardType("random-pool")}
        >
          RANDOM POOL
        </button>
      </div>
      <button className="hit-number-new-board" type="button" onClick={() => newLineup()}>
        NEW LINEUP
      </button>
    </section>
  ) : undefined;

  const resultActions = result ? (
    <GameResultActions
      onChallenge={() => void challengeSomeone()}
      onReplay={replay}
      onAllGames={() => navigate("/play")}
      replayLabel={shared ? "REPLAY CHALLENGE" : "NEW LINEUP"}
      status={challengeStatus}
    />
  ) : null;

  return (
    <div className="page hit-number-page" data-challenge-id={run.identity.challengeId}>
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent this exact Hit the Number board.</strong>
          <small>Play the same target and fighter pool. Both scores reveal after you finish.</small>
        </section>
      ) : null}
      <HitTheNumberGameView
        setup={setup}
        selectedIds={selectedIds}
        result={result}
        search={search}
        onSearchChange={setSearch}
        onToggleFighter={toggleFighter}
        onLock={lockPicks}
        onBack={() => navigate("/play")}
        controls={controls}
        resultActions={resultActions}
      />
    </div>
  );
}
