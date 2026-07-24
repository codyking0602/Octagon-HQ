import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  CHALLENGE_TEST_PROFILES,
  canViewChallengeResults,
  challengeCounterpartId,
  challengeScoreLabel,
  resultScore,
  type ChallengeJson,
  type ChallengeProfile,
  type PlayChallenge,
} from "./challengeModel";
import {
  addChallenge,
  challengesForProfile,
  completeChallengeRow,
  loadChallenges,
  openChallengeRow,
  saveChallenges,
} from "./challengeRepository";
import type { PlayGameId } from "../play/playRegistry";

const PROFILE_STORAGE_KEY = "octagon-hq:challenge-profile:v1";

export interface ChallengeComposerDraft {
  gameId: PlayGameId;
  gameVersion: string;
  gameTitle: string;
  summary: string;
  setup: ChallengeJson;
  creatorResult: ChallengeJson;
  shareTitle: string;
  shareText: string;
  shareUrl: string;
}

interface PlayChallengesContextValue {
  enabled: boolean;
  profiles: readonly ChallengeProfile[];
  activeProfile: ChallengeProfile | null;
  challenges: PlayChallenge[];
  setActiveProfile: (profileId: string) => void;
  beginChallenge: (draft: ChallengeComposerDraft) => Promise<string>;
  getChallenge: (code: string) => PlayChallenge | null;
  markOpened: (code: string) => void;
  submitResult: (code: string, result: ChallengeJson) => void;
  viewResults: (code: string) => void;
}

const PlayChallengesContext = createContext<PlayChallengesContextValue | null>(null);

function challengeLabAvailable() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost"
    || host === "127.0.0.1"
    || host.endsWith(".hq-app.workers.dev");
}

async function shareDraft(draft: ChallengeComposerDraft) {
  const payload = `${draft.shareText}\n\n${draft.shareUrl}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: draft.shareTitle, text: draft.shareText, url: draft.shareUrl });
      return "CHALLENGE READY TO SEND";
    }
    await navigator.clipboard.writeText(payload);
    return "CHALLENGE LINK COPIED";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "";
    try {
      await navigator.clipboard.writeText(payload);
      return "CHALLENGE LINK COPIED";
    } catch {
      return "CHALLENGE FAILED";
    }
  }
}

function profileById(id: string | null) {
  return CHALLENGE_TEST_PROFILES.find((profile) => profile.id === id) ?? null;
}

function ComposerDialog({
  draft,
  activeProfile,
  onClose,
  onSend,
}: {
  draft: ChallengeComposerDraft;
  activeProfile: ChallengeProfile;
  onClose: () => void;
  onSend: (recipientId: string) => void;
}) {
  const recipients = CHALLENGE_TEST_PROFILES.filter((profile) => profile.id !== activeProfile.id);
  const [recipientId, setRecipientId] = useState(recipients[0]?.id ?? "");
  const [status, setStatus] = useState("");

  async function copyLink() {
    setStatus(await shareDraft(draft));
  }

  return (
    <div className="challenge-overlay" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className="challenge-dialog" role="dialog" aria-modal="true" aria-labelledby="challenge-dialog-title">
        <header>
          <div>
            <p className="eyebrow">GAME CHALLENGE</p>
            <h2 id="challenge-dialog-title">Challenge Someone</h2>
            <p>They receive this exact setup. Your result stays hidden until they finish.</p>
          </div>
          <button type="button" className="challenge-dialog__close" aria-label="Close challenge dialog" onClick={onClose}>×</button>
        </header>

        <div className="challenge-dialog__summary">
          <span><small>{draft.gameTitle}</small><strong>{draft.summary}</strong></span>
          <b>LOCKED</b>
        </div>

        <div className="challenge-dialog__profiles">
          {recipients.map((profile) => (
            <button
              className={profile.id === recipientId ? "is-selected" : ""}
              type="button"
              key={profile.id}
              onClick={() => setRecipientId(profile.id)}
            >
              <i>{profile.initials}</i>
              <span><strong>{profile.displayName}</strong><small>PREVIEW PROFILE</small></span>
              <em aria-hidden="true" />
            </button>
          ))}
        </div>

        <p className="challenge-dialog__lab-note">
          Profile delivery is running in the preview identity lab until the real V2 profile owner is connected.
        </p>
        <p className="challenge-dialog__status" role="status">{status}</p>
        <footer>
          <button type="button" onClick={() => void copyLink()}>COPY SHARE LINK</button>
          <button type="button" className="primary-action" disabled={!recipientId} onClick={() => onSend(recipientId)}>SEND CHALLENGE</button>
        </footer>
      </section>
    </div>
  );
}

function ResultsDialog({
  challenge,
  profiles,
  activeProfileId,
  onClose,
}: {
  challenge: PlayChallenge;
  profiles: readonly ChallengeProfile[];
  activeProfileId: string;
  onClose: () => void;
}) {
  if (!canViewChallengeResults(challenge, activeProfileId)) return null;
  const creator = profiles.find((profile) => profile.id === challenge.creatorId);
  const responder = profiles.find((profile) => profile.id === challenge.recipientId);
  const creatorScore = resultScore(challenge.creatorResult);
  const responderScore = resultScore(challenge.responderResult);
  const verdict = creatorScore === null || responderScore === null
    ? "Matchup complete"
    : creatorScore === responderScore
      ? "Tie game"
      : creatorScore > responderScore
        ? `${creator?.displayName ?? "Sender"} wins`
        : `${responder?.displayName ?? "Responder"} wins`;

  return (
    <div className="challenge-overlay" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className="challenge-dialog challenge-results-dialog" role="dialog" aria-modal="true" aria-labelledby="challenge-results-title">
        <header>
          <div>
            <p className="eyebrow">CHALLENGE RESULTS</p>
            <h2 id="challenge-results-title">{challenge.gameTitle}</h2>
            <p>Both players completed the exact same challenge.</p>
          </div>
          <button type="button" className="challenge-dialog__close" aria-label="Close challenge results" onClick={onClose}>×</button>
        </header>
        <div className="challenge-results-dialog__verdict">
          <small>MATCHUP COMPLETE</small>
          <strong>{verdict}</strong>
          <span>{challenge.summary}</span>
        </div>
        <div className="challenge-results-dialog__scoreboard">
          <article>
            <small>SENDER</small>
            <strong>{creator?.displayName ?? "Sender"}</strong>
            <b>{challengeScoreLabel(challenge.gameId, challenge.creatorResult)}</b>
          </article>
          <em>VS</em>
          <article>
            <small>RESPONDER</small>
            <strong>{responder?.displayName ?? "Responder"}</strong>
            <b>{challengeScoreLabel(challenge.gameId, challenge.responderResult)}</b>
          </article>
        </div>
        <button type="button" className="primary-action challenge-results-dialog__close" onClick={onClose}>CLOSE</button>
      </section>
    </div>
  );
}

export function ChallengeProvider({ children }: PropsWithChildren) {
  const enabled = challengeLabAvailable();
  const [activeProfileId, setActiveProfileId] = useState(() => {
    if (!enabled || typeof window === "undefined") return "";
    const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return profileById(stored)?.id ?? CHALLENGE_TEST_PROFILES[0]!.id;
  });
  const [rows, setRows] = useState<PlayChallenge[]>(() => {
    if (!enabled || typeof window === "undefined") return [];
    return loadChallenges(window.localStorage);
  });
  const [composer, setComposer] = useState<ChallengeComposerDraft | null>(null);
  const [resultCode, setResultCode] = useState<string | null>(null);

  const activeProfile = profileById(activeProfileId);
  const challenges = useMemo(
    () => activeProfile ? challengesForProfile(rows, activeProfile.id) : [],
    [activeProfile, rows],
  );

  function persist(next: PlayChallenge[]) {
    setRows(next);
    if (enabled) saveChallenges(window.localStorage, next);
  }

  function setActiveProfile(profileId: string) {
    const profile = profileById(profileId);
    if (!profile) return;
    setActiveProfileId(profile.id);
    window.localStorage.setItem(PROFILE_STORAGE_KEY, profile.id);
    setComposer(null);
    setResultCode(null);
  }

  async function beginChallenge(draft: ChallengeComposerDraft) {
    if (!enabled || !activeProfile) return shareDraft(draft);
    setComposer(draft);
    return "CHOOSE A PROFILE OR COPY THE LINK";
  }

  function sendChallenge(recipientId: string) {
    if (!composer || !activeProfile || recipientId === activeProfile.id) return;
    const next = addChallenge(rows, {
      gameId: composer.gameId,
      gameVersion: composer.gameVersion,
      gameTitle: composer.gameTitle,
      summary: composer.summary,
      creatorId: activeProfile.id,
      recipientId,
      setup: composer.setup,
      creatorResult: composer.creatorResult,
    });
    persist(next.rows);
    setComposer(null);
  }

  function getChallenge(code: string) {
    return rows.find((row) => row.code === code) ?? null;
  }

  function markOpened(code: string) {
    if (!activeProfile) return;
    persist(openChallengeRow(rows, code, activeProfile.id));
  }

  function submitResult(code: string, result: ChallengeJson) {
    if (!activeProfile) return;
    persist(completeChallengeRow(rows, code, activeProfile.id, result));
  }

  function viewResults(code: string) {
    const challenge = getChallenge(code);
    if (!challenge || !activeProfile || !canViewChallengeResults(challenge, activeProfile.id)) return;
    setResultCode(code);
  }

  useEffect(() => {
    if (!enabled) return undefined;
    const onStorage = () => setRows(loadChallenges(window.localStorage));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [enabled]);

  const resultChallenge = resultCode ? getChallenge(resultCode) : null;
  const value: PlayChallengesContextValue = {
    enabled,
    profiles: CHALLENGE_TEST_PROFILES,
    activeProfile,
    challenges,
    setActiveProfile,
    beginChallenge,
    getChallenge,
    markOpened,
    submitResult,
    viewResults,
  };

  return (
    <PlayChallengesContext.Provider value={value}>
      {children}
      {composer && activeProfile ? (
        <ComposerDialog
          draft={composer}
          activeProfile={activeProfile}
          onClose={() => setComposer(null)}
          onSend={sendChallenge}
        />
      ) : null}
      {resultChallenge && activeProfile ? (
        <ResultsDialog
          challenge={resultChallenge}
          profiles={CHALLENGE_TEST_PROFILES}
          activeProfileId={activeProfile.id}
          onClose={() => setResultCode(null)}
        />
      ) : null}
    </PlayChallengesContext.Provider>
  );
}

export function usePlayChallenges() {
  const value = useContext(PlayChallengesContext);
  if (!value) throw new Error("usePlayChallenges must be used inside ChallengeProvider");
  return value;
}

export function challengeCounterpart(
  challenge: PlayChallenge,
  activeProfileId: string,
  profiles: readonly ChallengeProfile[] = CHALLENGE_TEST_PROFILES,
) {
  const counterpartId = challengeCounterpartId(challenge, activeProfileId);
  return profiles.find((profile) => profile.id === counterpartId) ?? null;
}
