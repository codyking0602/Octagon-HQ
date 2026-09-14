import { useEffect, useMemo, useRef, useState } from "react";
import {
  WHO_AM_I_CLUE_LIMIT,
  WHO_AM_I_CLUES_PER_REVEAL,
  WHO_AM_I_RESCUE_GUESS_COUNT,
  WHO_AM_I_RESCUE_SCORE,
  WHO_AM_I_RESCUE_SECOND_SCORE,
  WHO_AM_I_WRONG_GUESS_PENALTY,
  whoAmIRecoveryScore,
  whoAmIRescueChoices,
  whoAmIScore,
  type WhoAmILeague,
  type WhoAmIRound,
  type WhoAmISport,
  type WhoAmISubject,
} from "../games/whoAmIEngine";
import WhoAmIPresentation from "./WhoAmIPresentation";

type Phase = "start" | "playing" | "rescue" | "result";
type ResultState = "correct" | "rescued" | "incorrect";
type RecentSubjectIdsByLeague = Partial<Record<WhoAmILeague, readonly string[]>>;
type RecentSubjectExclusions = Partial<Record<WhoAmILeague, ReadonlySet<string>>>;

const WHO_AM_I_RECENT_SUBJECT_LIMIT = 20;
const WHO_AM_I_RECENT_SUBJECTS_STORAGE_KEY = "octagon-hq:who-am-i:recent-subjects:v1";

function readRecentSubjectIds(): RecentSubjectIdsByLeague {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(WHO_AM_I_RECENT_SUBJECTS_STORAGE_KEY) ?? "{}") as Record<string, unknown>;
    const recent: RecentSubjectIdsByLeague = {};
    for (const league of ["UFC", "NFL", "CFB"] as const) {
      const ids = parsed[league];
      if (Array.isArray(ids)) {
        recent[league] = ids.filter((id): id is string => typeof id === "string").slice(-WHO_AM_I_RECENT_SUBJECT_LIMIT);
      }
    }
    return recent;
  } catch {
    return {};
  }
}

function recentSubjectExclusions(): RecentSubjectExclusions {
  const recent = readRecentSubjectIds();
  return {
    ...(recent.UFC?.length ? { UFC: new Set(recent.UFC) } : {}),
    ...(recent.NFL?.length ? { NFL: new Set(recent.NFL) } : {}),
    ...(recent.CFB?.length ? { CFB: new Set(recent.CFB) } : {}),
  };
}

function rememberRecentSubject(league: WhoAmILeague, subjectId: string) {
  if (typeof window === "undefined") return;
  const recent = readRecentSubjectIds();
  const next = [...(recent[league] ?? []).filter((id) => id !== subjectId), subjectId]
    .slice(-WHO_AM_I_RECENT_SUBJECT_LIMIT);
  try {
    window.localStorage.setItem(WHO_AM_I_RECENT_SUBJECTS_STORAGE_KEY, JSON.stringify({
      ...recent,
      [league]: next,
    }));
  } catch {
    // Recent-subject memory is a replay-quality enhancement; storage failure must not block gameplay.
  }
}

function normalized(value: string) {
  return value.trim().toLowerCase();
}

interface WhoAmIPageProps {
  sport: WhoAmISport;
  createRound: (excludedSubjectIdsByLeague: RecentSubjectExclusions) => WhoAmIRound;
}

export default function WhoAmIPage({ sport, createRound }: WhoAmIPageProps) {
  const [round, setRound] = useState<WhoAmIRound>(() => createRound(recentSubjectExclusions()));
  const [phase, setPhase] = useState<Phase>("start");
  const [resultState, setResultState] = useState<ResultState>("incorrect");
  const [revealedCount, setRevealedCount] = useState(WHO_AM_I_CLUES_PER_REVEAL);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [rescueMisses, setRescueMisses] = useState(0);
  const [guessOpen, setGuessOpen] = useState(false);
  const [guessSearch, setGuessSearch] = useState("");
  const [selectedGuess, setSelectedGuess] = useState<WhoAmISubject | null>(null);
  const [guessNotice, setGuessNotice] = useState<{ name: string; score: number } | null>(null);
  const [rejectedSubjectIds, setRejectedSubjectIds] = useState<Set<string>>(() => new Set());
  const [rejectedRescueSubjectIds, setRejectedRescueSubjectIds] = useState<Set<string>>(() => new Set());
  const [rescueChoices, setRescueChoices] = useState<readonly WhoAmISubject[]>([]);
  const [reviewCluesOpen, setReviewCluesOpen] = useState(false);
  const latestClueRef = useRef<HTMLElement | null>(null);
  const shouldScrollAfterReveal = useRef(false);
  const guessInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    rememberRecentSubject(round.league, round.hiddenSubject.id);
  }, [round.hiddenSubject.id, round.league]);

  const football = sport === "football";
  const finalGuessRequired = phase === "playing" && revealedCount >= WHO_AM_I_CLUE_LIMIT;
  const recoveryScore = whoAmIRecoveryScore(rescueMisses);
  const score = whoAmIScore(revealedCount, wrongGuesses);
  const nextRevealedCount = Math.min(WHO_AM_I_CLUE_LIMIT, revealedCount + WHO_AM_I_CLUES_PER_REVEAL);
  const nextRevealScore = whoAmIScore(nextRevealedCount, wrongGuesses);
  const revealedClues = round.clues.slice(0, revealedCount);
  const latestPairStart = Math.max(0, revealedCount - WHO_AM_I_CLUES_PER_REVEAL);
  const cluePairs = useMemo(() => (
    Array.from({ length: Math.ceil(round.clues.length / WHO_AM_I_CLUES_PER_REVEAL) }, (_value, pairIndex) => (
      round.clues.slice(
        pairIndex * WHO_AM_I_CLUES_PER_REVEAL,
        pairIndex * WHO_AM_I_CLUES_PER_REVEAL + WHO_AM_I_CLUES_PER_REVEAL,
      )
    ))
  ), [round.clues]);

  const guessMatches = useMemo(() => {
    const query = normalized(guessSearch);
    if (query.length < 2) return [];
    return round.subjects
      .filter((subject) => !rejectedSubjectIds.has(subject.id))
      .filter((subject) => normalized(subject.name).includes(query))
      .slice(0, 16);
  }, [guessSearch, rejectedSubjectIds, round.subjects]);

  useEffect(() => {
    if (phase !== "playing" || !shouldScrollAfterReveal.current) return;
    shouldScrollAfterReveal.current = false;
    latestClueRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  }, [phase, revealedCount]);

  useEffect(() => {
    if (phase !== "playing" || (!guessOpen && !finalGuessRequired)) return;
    guessInputRef.current?.focus({ preventScroll: true });
  }, [finalGuessRequired, guessOpen, phase]);

  function resetRound() {
    setRound(createRound(recentSubjectExclusions()));
    setPhase("start");
    setResultState("incorrect");
    setRevealedCount(WHO_AM_I_CLUES_PER_REVEAL);
    setWrongGuesses(0);
    setRescueMisses(0);
    setGuessOpen(false);
    setGuessSearch("");
    setSelectedGuess(null);
    setGuessNotice(null);
    setRejectedSubjectIds(new Set());
    setRejectedRescueSubjectIds(new Set());
    setRescueChoices([]);
    setReviewCluesOpen(false);
    shouldScrollAfterReveal.current = false;
  }

  function openGuess() {
    setGuessOpen(true);
    setGuessSearch("");
    setSelectedGuess(null);
    setGuessNotice(null);
  }

  function closeGuess() {
    if (finalGuessRequired) return;
    setGuessOpen(false);
    setGuessSearch("");
    setSelectedGuess(null);
  }

  function revealMore() {
    if (phase !== "playing" || finalGuessRequired) return;
    shouldScrollAfterReveal.current = true;
    setRevealedCount(nextRevealedCount);
    setGuessNotice(null);
    setGuessSearch("");
    setSelectedGuess(null);
    setGuessOpen(nextRevealedCount >= WHO_AM_I_CLUE_LIMIT);
  }

  function openRescue(excludedSubjectIds = rejectedSubjectIds) {
    setRescueChoices(whoAmIRescueChoices(round, Math.random, excludedSubjectIds));
    setRescueMisses(0);
    setRejectedRescueSubjectIds(new Set());
    setSelectedGuess(null);
    setGuessOpen(false);
    setGuessNotice(null);
    setPhase("rescue");
  }

  function submitGuess() {
    if (phase !== "playing" || !selectedGuess) return;
    if (selectedGuess.id === round.hiddenSubject.id) {
      setResultState("correct");
      setPhase("result");
      setGuessOpen(false);
      setGuessNotice(null);
      return;
    }

    const missedName = selectedGuess.name;
    const nextWrongGuesses = wrongGuesses + 1;
    const nextRejectedSubjectIds = new Set([...rejectedSubjectIds, selectedGuess.id]);
    const nextScore = whoAmIScore(revealedCount, nextWrongGuesses);
    setWrongGuesses(nextWrongGuesses);
    setRejectedSubjectIds(nextRejectedSubjectIds);

    if (finalGuessRequired) {
      openRescue(nextRejectedSubjectIds);
      return;
    }

    setGuessNotice({ name: missedName, score: nextScore });
    setGuessSearch("");
    setSelectedGuess(null);
    setGuessOpen(false);
  }

  function submitRescueGuess(subject: WhoAmISubject) {
    if (phase !== "rescue" || rejectedRescueSubjectIds.has(subject.id)) return;
    if (subject.id === round.hiddenSubject.id) {
      setResultState("rescued");
      setPhase("result");
      return;
    }

    const nextMisses = rescueMisses + 1;
    setRejectedRescueSubjectIds((current) => new Set([...current, subject.id]));
    if (nextMisses >= WHO_AM_I_RESCUE_GUESS_COUNT) {
      setRescueMisses(nextMisses);
      setResultState("incorrect");
      setPhase("result");
      return;
    }
    setRescueMisses(nextMisses);
  }

  const finalScore = resultState === "correct"
    ? whoAmIScore(revealedCount, wrongGuesses)
    : resultState === "rescued"
      ? recoveryScore
      : 0;
  const resultLabel = resultState === "correct"
    ? "NATURAL SOLVE"
    : resultState === "rescued"
      ? "RECOVERED"
      : "MISS";

  return (
    <WhoAmIPresentation
      sport={sport}
      league={round.league}
      phase={phase}
      revealedCount={revealedCount}
      wrongGuesses={wrongGuesses}
      rescueMisses={rescueMisses}
      score={score}
      nextRevealScore={nextRevealScore}
      recoveryScore={recoveryScore}
      clues={revealedClues}
      allClues={round.clues}
      guessOpen={guessOpen}
      guessSearch={guessSearch}
      selectedGuess={selectedGuess}
      guessMatches={guessMatches}
      guessNotice={guessNotice}
      rescueChoices={rescueChoices}
      rejectedRescueSubjectIds={rejectedRescueSubjectIds}
      reviewOpen={reviewCluesOpen}
      resultState={resultState}
      resultLabel={resultLabel}
      resultName={round.hiddenSubject.name}
      finalScore={finalScore}
      onStart={() => setPhase("playing")}
      onOpenGuess={openGuess}
      onRevealMore={revealMore}
      onGuessSearchChange={(value) => {
        setGuessSearch(value);
        setSelectedGuess(null);
      }}
      onSelectGuess={(subject) => {
        setSelectedGuess(subject);
        setGuessSearch(subject.name);
      }}
      onChangeGuess={() => setSelectedGuess(null)}
      onSubmitGuess={submitGuess}
      onCloseGuess={closeGuess}
      onEnterRecovery={() => openRescue()}
      onRecoveryGuess={submitRescueGuess}
      onToggleReview={() => setReviewCluesOpen((open) => !open)}
      onReplay={resetRound}
    />
  );
}
