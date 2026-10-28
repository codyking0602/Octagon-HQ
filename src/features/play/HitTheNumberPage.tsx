import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import type { ChallengeJson } from "../challenges/challengeModel";
import {
  HIT_THE_NUMBER_MAX_PICKS,
  HIT_THE_NUMBER_MIN_PICKS,
  HIT_THE_NUMBER_STATS,
  HIT_THE_NUMBER_VERSION,
  createGeneratedHitTheNumberBoard,
  gradeHitTheNumberSelection,
  hitTheNumberStatRows,
  type HitTheNumberBoard,
  type HitTheNumberBoardType,
  type HitTheNumberPublicSetup,
  type HitTheNumberResult,
} from "./hitTheNumberEngine";
import {
  hitTheNumberFormatSelectionSatisfies,
  hitTheNumberSlotAcceptsFighter,
  type HitTheNumberFormatSetup,
} from "./hitTheNumberFormats";
import { createQualityGatedHitTheNumberFormatPlan } from "./hitTheNumberPoolQuality";
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
  format: HitTheNumberFormatSetup;
  identity: PlayLineupIdentity;
  seed: string;
}

interface GeneratedHitTheNumberRun {
  board: HitTheNumberBoard;
  format: HitTheNumberFormatSetup;
}

const DEFAULT_BOARD_TYPE: HitTheNumberBoardType = "open-roster";
const hitTheNumberStatRowByFighterId = new Map(
  hitTheNumberStatRows.map((row) => [row.fighterId, row]),
);
const HIT_THE_NUMBER_FORMAT_IDS = new Set(["classic", "themed-lineup", "one-from-each", "build-the-team"]);

function asJson(value: unknown): ChallengeJson {
  return JSON.parse(JSON.stringify(value)) as ChallengeJson;
}

function record(value: ChallengeJson | undefined): { [key: string]: ChallengeJson } | null {
  return value && !Array.isArray(value) && typeof value === "object" ? value : null;
}

function strings(value: ChallengeJson | undefined) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function storedPublicSetup(value: ChallengeJson | undefined): HitTheNumberPublicSetup | null {
  const row = record(value);
  if (!row || (row.version !== HIT_THE_NUMBER_VERSION && row.version !== "hit-the-number-v1")) return null;
  const statId = typeof row.statId === "string"
    ? HIT_THE_NUMBER_STATS.find((item) => item.id === row.statId)?.id
    : undefined;
  const boardType = row.boardType === "open-roster" || row.boardType === "random-pool"
    ? row.boardType
    : null;
  const target = typeof row.target === "number" && Number.isInteger(row.target) && row.target > 0
    ? row.target
    : null;
  const pickCount = typeof row.pickCount === "number"
    && Number.isInteger(row.pickCount)
    && row.pickCount >= HIT_THE_NUMBER_MIN_PICKS
    && row.pickCount <= HIT_THE_NUMBER_MAX_PICKS
    ? row.pickCount
    : null;
  const fighterIds = strings(row.fighterIds);
  const filter = record(row.filter);
  const gender = filter?.gender === "men" || filter?.gender === "women" ? filter.gender : undefined;
  const division = typeof filter?.division === "string" ? filter.division : undefined;

  if (!statId || !boardType || target === null || pickCount === null || fighterIds.length < pickCount) {
    return null;
  }

  return {
    version: HIT_THE_NUMBER_VERSION,
    statId,
    boardType,
    target,
    pickCount,
    filter: { gender, division },
    fighterIds,
  };
}

function storedFormat(value: ChallengeJson | undefined): HitTheNumberFormatSetup | null {
  const row = record(value);
  if (!row
    || typeof row.formatId !== "string"
    || !HIT_THE_NUMBER_FORMAT_IDS.has(row.formatId)
    || typeof row.label !== "string"
    || !(row.configurationId === null || typeof row.configurationId === "string")
    || !(row.configurationLabel === null || typeof row.configurationLabel === "string")
    || !Array.isArray(row.rules)
    || !Array.isArray(row.slots)
  ) return null;
  return row as unknown as HitTheNumberFormatSetup;
}

function createGeneratedRun(seed: string, boardType: HitTheNumberBoardType): GeneratedHitTheNumberRun {
  const plan = createQualityGatedHitTheNumberFormatPlan({ seed, boardType });
  if (plan.format.formatId === "classic") {
    return {
      board: createGeneratedHitTheNumberBoard({ seed, boardType }),
      format: plan.format,
    };
  }

  return {
    board: {
      publicSetup: {
        version: HIT_THE_NUMBER_VERSION,
        statId: plan.statId,
        boardType: plan.boardType,
        target: plan.target,
        pickCount: plan.pickCount,
        filter: {},
        fighterIds: [...plan.fighterIds],
      },
      privateSetup: {
        solutionFighterIds: [...plan.solutionFighterIds],
      },
    },
    format: plan.format,
  };
}

function boardSignature(run: GeneratedHitTheNumberRun) {
  const setup = run.board.publicSetup;
  const pool = setup.boardType === "random-pool" ? setup.fighterIds.join(",") : "open";
  const slots = run.format.slots.map((slot) => slot.id).join(",");
  return [
    run.format.formatId,
    run.format.configurationId ?? "default",
    slots,
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
      const generated = createGeneratedRun(seed, boardType);
      return {
        value: generated,
        itemIds: [boardSignature(generated)],
        fighterIds: generated.board.publicSetup.boardType === "random-pool"
          ? generated.board.publicSetup.fighterIds
          : [],
      };
    },
  });

  return {
    board: selected.value.board,
    format: selected.value.format,
    identity: selected.identity,
    seed: selected.identity.seed,
  };
}

function createSharedRun(searchParams: URLSearchParams): HitTheNumberRun | null {
  const seed = searchParams.get("challenge")?.trim() ?? "";
  const boardParam = searchParams.get("board");
  const boardType: HitTheNumberBoardType | null = boardParam === "open-roster" || boardParam === "random-pool"
    ? boardParam
    : null;
  if (!seed || seed.length > 200 || !boardType) return null;

  try {
    const generated = createGeneratedRun(seed, boardType);
    const signature = boardSignature(generated);
    const challengeId = `shared-${stableLineupHash(signature).toString(36)}`;
    const identity = curatedLineupIdentity("hit-the-number", challengeId, [signature], boardType);
    rememberLineup(identity, [signature], generated.board.publicSetup.fighterIds);
    return {
      board: generated.board,
      format: generated.format,
      identity,
      seed,
    };
  } catch {
    return null;
  }
}

export function createStoredHitTheNumberProfileRun(
  setupValue: ChallengeJson | undefined,
  challengeId: string,
): HitTheNumberRun | null {
  const setup = record(setupValue);
  const seed = typeof setup?.seed === "string" ? setup.seed : "";
  const publicSetup = storedPublicSetup(setup?.publicSetup);
  const format = storedFormat(setup?.format);
  if (!seed || !publicSetup || !format) return null;

  const generated: GeneratedHitTheNumberRun = {
    board: {
      publicSetup,
      privateSetup: { solutionFighterIds: [] },
    },
    format,
  };
  const signature = boardSignature(generated);
  const identity = curatedLineupIdentity("hit-the-number", challengeId, [signature], publicSetup.boardType);
  rememberLineup(identity, [signature], publicSetup.fighterIds);
  return {
    board: generated.board,
    format,
    identity,
    seed,
  };
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
  const profileRun = useMemo(
    () => profileMatch.challenge
      ? createStoredHitTheNumberProfileRun(profileMatch.challenge.setup, profileMatch.challenge.code)
      : null,
    [profileMatch.challenge?.code, profileMatch.challenge?.setup],
  );
  const searchKey = searchParams.toString();
  const sharedRun = useMemo(
    () => createSharedRun(new URLSearchParams(searchKey)),
    [searchKey],
  );
  const initialRun = profileRun ?? sharedRun;
  const [run, setRun] = useState<HitTheNumberRun>(() => initialRun ?? createCasualRun(DEFAULT_BOARD_TYPE));
  const [boardType, setBoardType] = useState<HitTheNumberBoardType>(
    () => initialRun?.board.publicSetup.boardType ?? DEFAULT_BOARD_TYPE,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [slotAssignments, setSlotAssignments] = useState<Array<string | null>>([]);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [result, setResult] = useState<HitTheNumberResult | null>(null);
  const [search, setSearch] = useState("");
  const [challengeStatus, setChallengeStatus] = useState("");
  const setup = run.board.publicSetup;
  const slotFormat = run.format.slots.length > 0;
  const resolvedSlotAssignments = slotFormat
    ? run.format.slots.map((_, index) => slotAssignments[index] ?? null)
    : [];
  const slotSelectedIds = resolvedSlotAssignments.filter(
    (fighterId): fighterId is string => fighterId != null,
  );
  const completedSlotAssignments = slotFormat
    && slotSelectedIds.length === run.format.slots.length
    ? resolvedSlotAssignments as string[]
    : null;
  const effectiveSelectedIds = slotFormat ? slotSelectedIds : selectedIds;
  const selectedSet = new Set(effectiveSelectedIds);
  const shared = run.identity.type === "curated";
  const stat = HIT_THE_NUMBER_STATS.find((item) => item.id === setup.statId)!;
  const selectionValid = slotFormat
    ? Boolean(
        completedSlotAssignments
        && hitTheNumberFormatSelectionSatisfies(run.format, completedSlotAssignments),
      )
    : selectedIds.length === setup.pickCount
      && hitTheNumberFormatSelectionSatisfies(run.format, selectedIds);
  const formatName = run.format.configurationLabel ?? run.format.label;
  const revealedPoolValues = result && setup.boardType === "random-pool"
    ? new Map(setup.fighterIds.map((fighterId) => [
        fighterId,
        hitTheNumberStatRowByFighterId.get(fighterId)?.values[setup.statId],
      ]).filter((entry): entry is [string, number] => Number.isInteger(entry[1])))
    : undefined;

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
    setSlotAssignments([]);
    setActiveSlotIndex(0);
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

  function chooseSlot(index: number) {
    if (result || index < 0 || index >= run.format.slots.length) return;
    setActiveSlotIndex(index);
    setSearch("");
  }

  function toggleFighter(fighterId: string) {
    if (result) return;

    if (slotFormat) {
      const slotIndex = Math.min(activeSlotIndex, run.format.slots.length - 1);
      const slot = run.format.slots[slotIndex];
      if (!slot || !hitTheNumberSlotAcceptsFighter(slot, fighterId)) return;

      const nextAssignments = run.format.slots.map(
        (_, index) => slotAssignments[index] ?? null,
      );
      if (nextAssignments[slotIndex] === fighterId) {
        nextAssignments[slotIndex] = null;
        setSlotAssignments(nextAssignments);
        return;
      }
      if (nextAssignments.some((assignedId, index) => (
        index !== slotIndex && assignedId === fighterId
      ))) return;

      nextAssignments[slotIndex] = fighterId;
      setSlotAssignments(nextAssignments);

      for (let offset = 1; offset <= run.format.slots.length; offset += 1) {
        const nextSlotIndex = (slotIndex + offset) % run.format.slots.length;
        if (nextAssignments[nextSlotIndex] != null) continue;
        setActiveSlotIndex(nextSlotIndex);
        setSearch("");
        break;
      }
      return;
    }

    if (selectedSet.has(fighterId)) {
      setSelectedIds((current) => current.filter((id) => id !== fighterId));
      return;
    }
    if (selectedIds.length >= setup.pickCount) return;
    setSelectedIds((current) => [...current, fighterId]);
  }

  function lockPicks() {
    if (result || !selectionValid) return;
    const gradingIds = slotFormat ? completedSlotAssignments ?? [] : selectedIds;
    const next = gradeHitTheNumberSelection(setup, gradingIds);
    setResult(next);
    recordLineupCompletion(run.identity, {
      status: next.status,
      score: next.score,
      target: next.target,
      total: next.total,
      distance: next.distance,
      formatId: run.format.formatId,
      configurationId: run.format.configurationId,
      selectedFighterIds: [...gradingIds],
    });
  }

  async function challengeSomeone() {
    if (!result) return;
    setChallengeStatus("");
    const status = await beginChallenge({
      gameId: "hit-the-number",
      gameVersion: HIT_THE_NUMBER_VERSION,
      gameTitle: "Hit the Number",
      summary: `${formatName} · ${stat.label} · target ${setup.target} · pick ${setup.pickCount}`,
      setup: asJson({
        seed: run.seed,
        boardType: setup.boardType,
        format: run.format,
        publicSetup: setup,
      }),
      creatorResult: asJson(result),
      shareTitle: "Hit the Number Challenge",
      shareText: `I challenged you to the same ${formatName} Hit the Number board: target ${setup.target} ${stat.label}, pick ${setup.pickCount}.`,
      shareUrl: hitTheNumberChallengeUrl(run.seed, setup.boardType),
    });
    setChallengeStatus(status);
  }

  if (profileMatch.challenge && !profileRun) {
    return (
      <div className="page hit-number-page">
        <section className="surface-card" aria-live="polite">
          <p className="eyebrow">PROFILE CHALLENGE</p>
          <h1>Challenge unavailable</h1>
          <p>This matchup does not contain a valid stored Hit the Number board.</p>
        </section>
      </div>
    );
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
    <div
      className="page hit-number-page"
      data-challenge-id={run.identity.challengeId}
      data-format-id={run.format.formatId}
    >
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent this exact Hit the Number board.</strong>
          <small>Play the same format, target, and fighter pool. Both scores reveal after you finish.</small>
        </section>
      ) : null}
      <HitTheNumberGameView
        setup={setup}
        format={run.format}
        selectedIds={effectiveSelectedIds}
        slotAssignments={resolvedSlotAssignments}
        activeSlotIndex={activeSlotIndex}
        selectionValid={selectionValid}
        result={result}
        revealedPoolValues={revealedPoolValues}
        search={search}
        onSearchChange={setSearch}
        onToggleFighter={toggleFighter}
        onSelectSlot={chooseSlot}
        onLock={lockPicks}
        onBack={() => navigate("/play")}
        controls={controls}
        resultActions={resultActions}
      />
    </div>
  );
}
