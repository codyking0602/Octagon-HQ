import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createGeneratedHitTheNumberBoard,
  gradeHitTheNumberSelection,
  type HitTheNumberBoard,
  type HitTheNumberBoardType,
  type HitTheNumberResult,
} from "./hitTheNumberEngine";
import { HitTheNumberGameView } from "./HitTheNumberGameView";
import {
  recordLineupCompletion,
  selectReplayLineup,
  type PlayLineupIdentity,
} from "./lineupModel";

interface CasualHitTheNumberRun {
  board: HitTheNumberBoard;
  identity: PlayLineupIdentity;
}

const DEFAULT_BOARD_TYPE: HitTheNumberBoardType = "open-roster";

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

function createCasualRun(boardType: HitTheNumberBoardType): CasualHitTheNumberRun {
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

  return { board: selected.value, identity: selected.identity };
}

export default function HitTheNumberPage() {
  const navigate = useNavigate();
  const [boardType, setBoardType] = useState<HitTheNumberBoardType>(DEFAULT_BOARD_TYPE);
  const [run, setRun] = useState<CasualHitTheNumberRun>(() => createCasualRun(DEFAULT_BOARD_TYPE));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<HitTheNumberResult | null>(null);
  const [search, setSearch] = useState("");
  const setup = run.board.publicSetup;
  const selectedSet = new Set(selectedIds);

  function newLineup(nextBoardType = boardType) {
    setBoardType(nextBoardType);
    setRun(createCasualRun(nextBoardType));
    setSelectedIds([]);
    setResult(null);
    setSearch("");
  }

  function chooseBoardType(nextBoardType: HitTheNumberBoardType) {
    if (nextBoardType === boardType) return;
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

  const controls = (
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
  );

  const resultActions = result ? (
    <div className="hit-number-result__actions">
      <button type="button" onClick={() => newLineup()}>NEW LINEUP</button>
      <button type="button" onClick={() => navigate("/play")}>ALL GAMES</button>
    </div>
  ) : null;

  return (
    <div className="page hit-number-page" data-challenge-id={run.identity.challengeId}>
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
