import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { createPortal } from "react-dom";
import { shareAppLink, shareCanonicalDestination } from "../../app/nativeShare";
import { useIdentity } from "../identity/IdentityProvider";
import type { PlayGameId } from "../play/playRegistry";
import {
  canViewChallengeResults,
  challengeCounterpartId,
  type ChallengeJson,
  type ChallengeProfile,
  type PlayChallenge,
} from "./challengeModel";
import {
  challengeRepositoryError,
  createChallengeRepository,
  type ChallengeRepository,
} from "./challengeRepository";
import {
  ChallengeResultDetails,
  challengeResultScoreLabel,
  challengeResultVerdict,
} from "./ChallengeResultDetails";

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
  configured: boolean;
  enabled: boolean;
  loading: boolean;
  error: string;
  profiles: readonly ChallengeProfile[];
  activeProfile: ChallengeProfile | null;
  challenges: PlayChallenge[];
  preferredRecipientName: string;
  prepareRecipient: (displayName: string) => void;
  clearPreparedRecipient: () => void;
  refresh: () => Promise<void>;
  beginChallenge: (draft: ChallengeComposerDraft) => Promise<string>;
  getChallenge: (code: string) => PlayChallenge | null;
  markOpened: (code: string) => Promise<void>;
  submitResult: (code: string, result: ChallengeJson) => Promise<void>;
  dismissChallenge: (code: string) => Promise<void>;
  viewResults: (code: string) => void;
}

const PlayChallengesContext = createContext<PlayChallengesContextValue | null>(null);

function normalizeProfileName(value: string) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

async function shareDraft(draft: ChallengeComposerDraft) {
  const outcome = await shareAppLink({
    url: draft.shareUrl,
    title: draft.shareTitle,
    text: draft.shareText,
  });
  if (outcome === "shared") return "CHALLENGE SHARED";
  if (outcome === "copied") return "CHALLENGE LINK COPIED";
  if (outcome === "unavailable") return "CHALLENGE FAILED";
  return "";
}

function ComposerDialog({
  draft,
  activeProfile,
  repository,
  initialProfileName,
  onClose,
  onSend,
}: {
  draft: ChallengeComposerDraft;
  activeProfile: ChallengeProfile;
  repository: ChallengeRepository;
  initialProfileName: string;
  onClose: () => void;
  onSend: (recipient: ChallengeProfile) => Promise<void>;
}) {
  const [profileName, setProfileName] = useState(initialProfileName);
  const [recipient, setRecipient] = useState<ChallengeProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function lookupProfile(name: string) {
    const normalizedName = normalizeProfileName(name);
    if (normalizedName.length < 2) return;
    setBusy(true);
    setStatus("");
    setRecipient(null);
    try {
      const match = await repository.findProfile(normalizedName, activeProfile.id);
      if (!match) {
        setStatus("NO PROFILE FOUND WITH THAT EXACT NAME");
        return;
      }
      setRecipient(match);
      setStatus(`${match.displayName} FOUND`);
    } catch (error) {
      setStatus(challengeRepositoryError(error));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (initialProfileName) void lookupProfile(initialProfileName);
  }, [initialProfileName]);

  async function findProfile() {
    await lookupProfile(profileName);
  }

  async function sendToProfile() {
    if (!recipient) return;
    setBusy(true);
    setStatus("");
    try {
      await onSend(recipient);
    } catch (error) {
      setStatus(challengeRepositoryError(error));
      setBusy(false);
    }
  }

  async function shareExternally() {
    setStatus(await shareDraft(draft));
  }

  return createPortal(
    <div className="challenge-overlay" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className="challenge-dialog" role="dialog" aria-modal="true" aria-labelledby="challenge-dialog-title">
        <header>
          <div>
            <p className="eyebrow">GAME CHALLENGE</p>
            <h2 id="challenge-dialog-title">Challenge Someone</h2>
            <p>Enter the exact Octagon HQ profile name. The same locked game will appear on their device.</p>
          </div>
          <button type="button" className="challenge-dialog__close" aria-label="Close challenge dialog" onClick={onClose}>×</button>
        </header>

        <div className="challenge-dialog__summary">
          <span><small>{draft.gameTitle}</small><strong>{draft.summary}</strong></span>
          <b>LOCKED</b>
        </div>

        <form className="challenge-dialog__profile-search" onSubmit={(event) => {
          event.preventDefault();
          void findProfile();
        }}>
          <label>
            <span>PROFILE NAME</span>
            <input
              autoCapitalize="characters"
              autoComplete="off"
              maxLength={24}
              placeholder="SHANE"
              value={profileName}
              onChange={(event) => {
                setProfileName(event.target.value.toUpperCase());
                setRecipient(null);
                setStatus("");
              }}
            />
          </label>
          <button type="submit" disabled={busy || profileName.trim().length < 2}>FIND PROFILE</button>
        </form>

        {recipient ? (
          <div className="challenge-dialog__profiles">
            <button className="is-selected" type="button" onClick={() => undefined}>
              <i>{recipient.initials}</i>
              <span><strong>{recipient.displayName}</strong><small>OCTAGON HQ PROFILE</small></span>
              <em aria-hidden="true" />
            </button>
          </div>
        ) : null}

        <p className="challenge-dialog__status" role="status">{status}</p>
        <footer>
          <button type="button" disabled={busy} onClick={() => void shareExternally()}>TEXT / SHARE LINK</button>
          <button type="button" className="primary-action" disabled={!recipient || busy} onClick={() => void sendToProfile()}>
            {busy ? "SENDING…" : "SEND TO PROFILE"}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
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
  const [shareStatus, setShareStatus] = useState("");
  if (!canViewChallengeResults(challenge, activeProfileId) || !challenge.responderResult) return null;
  const creator = profiles.find((profile) => profile.id === challenge.creatorId);
  const responder = profiles.find((profile) => profile.id === challenge.recipientId);
  const creatorName = creator?.displayName ?? "Sender";
  const responderName = responder?.displayName ?? "Responder";
  const verdict = challengeResultVerdict(challenge, creatorName, responderName);
  const creatorScore = challengeResultScoreLabel(challenge, challenge.creatorResult);
  const responderScore = challengeResultScoreLabel(challenge, challenge.responderResult);

  async function shareResults() {
    const outcome = await shareCanonicalDestination({
      destination: { kind: "challenge", challengeId: challenge.code },
      title: `${challenge.gameTitle} challenge result · Octagon HQ`,
      text: `${creatorName} ${creatorScore} vs. ${responderName} ${responderScore}. ${verdict}`,
    });
    setShareStatus(
      outcome === "copied"
        ? "RESULT LINK COPIED"
        : outcome === "unavailable"
          ? "SHARING IS UNAVAILABLE"
          : "",
    );
  }

  return createPortal(
    <div className="challenge-overlay" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className="challenge-dialog challenge-results-dialog" role="dialog" aria-modal="true" aria-labelledby="challenge-results-title">
        <header>
          <div>
            <p className="eyebrow">CHALLENGE RESULTS</p>
            <h2 id="challenge-results-title">{challenge.gameTitle}</h2>
            <p>Both profiles completed the exact same challenge.</p>
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
            <strong>{creatorName}</strong>
            <b>{creatorScore}</b>
          </article>
          <em>VS</em>
          <article>
            <small>RESPONDER</small>
            <strong>{responderName}</strong>
            <b>{responderScore}</b>
          </article>
        </div>
        <ChallengeResultDetails challenge={challenge} creatorName={creatorName} responderName={responderName} />
        <p className="challenge-dialog__status" role="status">{shareStatus}</p>
        <footer>
          <button type="button" onClick={() => void shareResults()}>SHARE RESULTS</button>
          <button type="button" className="primary-action" onClick={onClose}>CLOSE</button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

export function ChallengeProvider({
  children,
  repository: suppliedRepository,
}: PropsWithChildren<{ repository?: ChallengeRepository | null }>) {
  const identity = useIdentity();
  const initialRepository = suppliedRepository === undefined ? createChallengeRepository() : suppliedRepository;
  const [repository] = useState<ChallengeRepository | null>(initialRepository);
  const [rows, setRows] = useState<PlayChallenge[]>([]);
  const [counterparts, setCounterparts] = useState<ChallengeProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [composer, setComposer] = useState<ChallengeComposerDraft | null>(null);
  const [resultCode, setResultCode] = useState<string | null>(null);
  const [preferredRecipientName, setPreferredRecipientName] = useState("");

  const activeProfile = identity.profile;
  const configured = Boolean(repository);
  const enabled = Boolean(repository && activeProfile);
  const profiles = useMemo(() => {
    const map = new Map<string, ChallengeProfile>();
    if (activeProfile) map.set(activeProfile.id, activeProfile);
    counterparts.forEach((profile) => map.set(profile.id, profile));
    return [...map.values()];
  }, [activeProfile, counterparts]);

  const refresh = useCallback(async () => {
    if (!repository || !activeProfile) {
      setRows([]);
      setCounterparts([]);
      return;
    }

    setLoading(true);
    try {
      const snapshot = await repository.load();
      setRows(snapshot.challenges);
      setCounterparts(snapshot.profiles);
      setError("");
    } catch (nextError) {
      setError(challengeRepositoryError(nextError));
    } finally {
      setLoading(false);
    }
  }, [activeProfile, repository]);

  useEffect(() => {
    setComposer(null);
    setResultCode(null);
    setPreferredRecipientName("");
    void refresh();
  }, [activeProfile?.id, refresh]);

  useEffect(() => {
    if (!enabled) return undefined;
    const interval = window.setInterval(() => void refresh(), 15_000);
    const onFocus = () => void refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, refresh]);

  useEffect(() => {
    if (!composer && !resultCode) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [composer, resultCode]);

  function prepareRecipient(displayName: string) {
    if (!activeProfile) {
      identity.openDialog();
      return;
    }
    const normalized = normalizeProfileName(displayName);
    if (!normalized || normalized === normalizeProfileName(activeProfile.displayName)) return;
    setPreferredRecipientName(normalized);
  }

  function closeComposer() {
    setComposer(null);
    setPreferredRecipientName("");
  }

  async function beginChallenge(draft: ChallengeComposerDraft) {
    if (!activeProfile) {
      identity.openDialog();
      return "SIGN IN TO SEND PROFILE CHALLENGES";
    }
    if (!repository) return "CHALLENGES ARE NOT CONNECTED ON THIS BUILD";
    setComposer(draft);
    return preferredRecipientName
      ? `CHOOSE ${preferredRecipientName}`
      : "CHOOSE AN OCTAGON HQ PROFILE";
  }

  async function sendChallenge(recipient: ChallengeProfile) {
    if (!composer || !repository || !activeProfile) return;
    await repository.create({
      gameId: composer.gameId,
      gameVersion: composer.gameVersion,
      gameTitle: composer.gameTitle,
      summary: composer.summary,
      recipientId: recipient.id,
      playUrl: composer.shareUrl,
      setup: composer.setup,
      creatorResult: composer.creatorResult,
    });
    setComposer(null);
    setPreferredRecipientName("");
    await refresh();
  }

  const getChallenge = useCallback(
    (code: string) => rows.find((row) => row.code === code) ?? null,
    [rows],
  );

  const markOpened = useCallback(async (code: string) => {
    if (!repository || !activeProfile) return;
    try {
      await repository.markOpened(code);
      await refresh();
    } catch (nextError) {
      setError(challengeRepositoryError(nextError));
    }
  }, [activeProfile, refresh, repository]);

  const submitResult = useCallback(async (code: string, result: ChallengeJson) => {
    if (!repository || !activeProfile) return;
    try {
      await repository.submitResult(code, result);
      await refresh();
    } catch (nextError) {
      setError(challengeRepositoryError(nextError));
    }
  }, [activeProfile, refresh, repository]);

  const dismissChallenge = useCallback(async (code: string) => {
    if (!repository || !activeProfile) return;
    try {
      await repository.dismiss(code);
      if (resultCode === code) setResultCode(null);
      await refresh();
    } catch (nextError) {
      setError(challengeRepositoryError(nextError));
    }
  }, [activeProfile, refresh, repository, resultCode]);

  function viewResults(code: string) {
    const challenge = getChallenge(code);
    if (!challenge || !activeProfile || !canViewChallengeResults(challenge, activeProfile.id)) return;
    setResultCode(code);
  }

  const resultChallenge = resultCode ? getChallenge(resultCode) : null;
  const value: PlayChallengesContextValue = {
    configured,
    enabled,
    loading,
    error,
    profiles,
    activeProfile,
    challenges: rows,
    preferredRecipientName,
    prepareRecipient,
    clearPreparedRecipient: () => setPreferredRecipientName(""),
    refresh,
    beginChallenge,
    getChallenge,
    markOpened,
    submitResult,
    dismissChallenge,
    viewResults,
  };

  return (
    <PlayChallengesContext.Provider value={value}>
      {children}
      {composer && activeProfile && repository ? (
        <ComposerDialog
          draft={composer}
          activeProfile={activeProfile}
          repository={repository}
          initialProfileName={preferredRecipientName}
          onClose={closeComposer}
          onSend={sendChallenge}
        />
      ) : null}
      {resultChallenge && activeProfile ? (
        <ResultsDialog
          challenge={resultChallenge}
          profiles={profiles}
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
  profiles: readonly ChallengeProfile[],
) {
  const counterpartId = challengeCounterpartId(challenge, activeProfileId);
  return profiles.find((profile) => profile.id === counterpartId) ?? null;
}
