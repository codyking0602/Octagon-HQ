import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  pickSetupBoutSectionLabel,
  pickSetupDraftCardLabel,
  type PickSetupBout,
  type PickSetupBoutInput,
  type PickSetupCardScope,
  type PickSetupDraft,
  type PickSetupSourcePreview,
} from "./pickSetupModel";
import {
  createPickSetupRepository,
  type PickSetupRepository,
} from "./pickSetupRepository";

function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : "Event Setup could not complete that request.";
  if (message.toLowerCase().includes("pick control owner required")) {
    return "Event Setup is available only to the designated Fight Night owner.";
  }
  return message;
}

function displayTime(value: string | null) {
  if (!value) return "NOT SET";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function localDateTimeValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function isoDateTimeValue(value: string) {
  return value ? new Date(value).toISOString() : "";
}

const scopeOptions: Array<{ value: PickSetupCardScope; label: string; note: string }> = [
  { value: "auto", label: "AUTO", note: "Fight Night main card · Numbered event full card" },
  { value: "main", label: "MAIN CARD ONLY", note: "Main event and main card" },
  { value: "full", label: "FULL CARD", note: "Main card, prelims, and early prelims" },
];

interface BoutEditorProps {
  bout: PickSetupBout;
  index: number;
  total: number;
  busy: boolean;
  onSave: (bout: PickSetupBoutInput) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

function BoutEditor({ bout, index, total, busy, onSave, onMove, onRemove }: BoutEditorProps) {
  const [redName, setRedName] = useState(bout.redFighterName);
  const [blueName, setBlueName] = useState(bout.blueFighterName);
  const [weightClass, setWeightClass] = useState(bout.weightClass);

  useEffect(() => {
    setRedName(bout.redFighterName);
    setBlueName(bout.blueFighterName);
    setWeightClass(bout.weightClass);
  }, [bout]);

  const changed = redName.trim() !== bout.redFighterName
    || blueName.trim() !== bout.blueFighterName
    || weightClass.trim() !== bout.weightClass;

  return (
    <article className={`surface-card pick-setup-bout${bout.included ? "" : " is-excluded"}`}>
      <div className="pick-setup-bout__heading">
        <div>
          <span>{pickSetupBoutSectionLabel(bout.boutId)}{index === 0 ? "" : ` · FIGHT ${index + 1}`}</span>
          <small>{bout.included ? "INCLUDED" : "EXCLUDED FROM PICKS"}</small>
        </div>
        <div className="pick-setup-order" aria-label="Change fight order">
          <button type="button" disabled={busy || index === 0} onClick={() => onMove(-1)} aria-label={`Move ${redName} vs ${blueName} up`}>↑</button>
          <button type="button" disabled={busy || index === total - 1} onClick={() => onMove(1)} aria-label={`Move ${redName} vs ${blueName} down`}>↓</button>
        </div>
      </div>

      <label>
        RED CORNER
        <input value={redName} onChange={(event) => setRedName(event.target.value)} disabled={busy} />
      </label>
      <label>
        BLUE CORNER
        <input value={blueName} onChange={(event) => setBlueName(event.target.value)} disabled={busy} />
      </label>
      <label>
        WEIGHT CLASS
        <input value={weightClass} onChange={(event) => setWeightClass(event.target.value)} disabled={busy} placeholder="Lightweight" />
      </label>

      <div className="pick-setup-bout__actions">
        <button
          className="secondary-action"
          type="button"
          disabled={busy}
          onClick={() => onSave({
            bout_id: bout.boutId,
            position: bout.position,
            weight_class: weightClass.trim(),
            red_fighter_name: redName.trim(),
            blue_fighter_name: blueName.trim(),
            included: !bout.included,
          })}
        >
          {bout.included ? "EXCLUDE FIGHT" : "INCLUDE FIGHT"}
        </button>
        <button
          className="secondary-action"
          type="button"
          disabled={busy || !changed || !redName.trim() || !blueName.trim()}
          onClick={() => onSave({
            bout_id: bout.boutId,
            position: bout.position,
            weight_class: weightClass.trim(),
            red_fighter_name: redName.trim(),
            blue_fighter_name: blueName.trim(),
            included: bout.included,
          })}
        >
          SAVE FIGHT
        </button>
        <button className="pick-setup-danger" type="button" disabled={busy} onClick={onRemove}>REMOVE</button>
      </div>
    </article>
  );
}

interface PicksSetupPageProps {
  repository?: PickSetupRepository | null;
}

export default function PicksSetupPage({ repository: suppliedRepository }: PicksSetupPageProps) {
  const identity = useIdentity();
  const navigate = useNavigate();
  const [repository] = useState<PickSetupRepository | null>(() => (
    suppliedRepository === undefined ? createPickSetupRepository() : suppliedRepository
  ));
  const [draft, setDraft] = useState<PickSetupDraft | null>(null);
  const [sourcePreview, setSourcePreview] = useState<PickSetupSourcePreview | null>(null);
  const [cardScope, setCardScope] = useState<PickSetupCardScope>("auto");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [metadata, setMetadata] = useState({
    name: "",
    subtitle: "",
    venue: "",
    location: "",
    startsAt: "",
    locksAt: "",
  });
  const [newBout, setNewBout] = useState({ red: "", blue: "", weightClass: "" });

  const loadDraft = useCallback(async () => {
    if (!repository || !identity.profile) return;
    setLoading(true);
    try {
      const nextDraft = await repository.loadDraft();
      setDraft(nextDraft);
      setError("");
    } catch (nextError) {
      setDraft(null);
      setError(readableError(nextError));
    } finally {
      setLoading(false);
    }
  }, [identity.profile, repository]);

  useEffect(() => {
    if (!identity.ready) return;
    if (!identity.profile) {
      setLoading(false);
      setDraft(null);
      return;
    }
    if (!repository) {
      setLoading(false);
      setError("Event Setup is not connected on this build.");
      return;
    }
    void loadDraft();
  }, [identity.profile, identity.ready, loadDraft, repository]);

  useEffect(() => {
    if (!draft) return;
    setMetadata({
      name: draft.name,
      subtitle: draft.subtitle,
      venue: draft.venue,
      location: draft.location,
      startsAt: localDateTimeValue(draft.startsAt),
      locksAt: localDateTimeValue(draft.locksAt),
    });
    setSourceUrl(draft.sourceUrl ?? "");
  }, [draft]);

  const orderedBouts = useMemo(
    () => draft?.bouts.slice().sort((left, right) => left.position - right.position) ?? [],
    [draft],
  );
  const reviewedBouts = useMemo(
    () => sourcePreview?.event.bouts.slice().sort((left, right) => left.position - right.position) ?? [],
    [sourcePreview],
  );

  async function runAction<T>(key: string, action: () => Promise<T>, reload = true) {
    setBusyAction(key);
    setError("");
    try {
      const result = await action();
      if (reload) await loadDraft();
      return result;
    } catch (nextError) {
      setError(readableError(nextError));
      return undefined;
    } finally {
      setBusyAction("");
    }
  }

  function selectScope(scope: PickSetupCardScope) {
    setCardScope(scope);
    setSourcePreview(null);
  }

  function syncEvent() {
    if (!repository) return;
    void runAction("sync", () => repository.syncNextEvent(cardScope, sourceUrl));
  }

  async function checkSourceUpdates() {
    if (!repository || !draft) return;
    const preview = await runAction("preview", () => repository.previewSource(cardScope, sourceUrl), false);
    if (preview) {
      setSourcePreview(preview);
      setSourceUrl(preview.sourceUrl);
    }
  }

  function applySourceUpdates() {
    if (!repository || !sourcePreview || !sourcePreview.changes.length) return;
    if (!window.confirm("Apply these reviewed source changes? This replaces the staged draft only. The live Picks card will not change until you publish.")) return;
    void runAction("apply-preview", async () => {
      await repository.applySourcePreview(sourcePreview);
      setSourcePreview(null);
    });
  }

  function saveMetadata() {
    if (!draft) return;
    void runAction("metadata", () => repository!.updateMetadata(draft.draftId, {
      name: metadata.name.trim(),
      subtitle: metadata.subtitle.trim(),
      venue: metadata.venue.trim(),
      location: metadata.location.trim(),
      starts_at: isoDateTimeValue(metadata.startsAt),
      locks_at: isoDateTimeValue(metadata.locksAt),
      season: metadata.startsAt ? new Date(metadata.startsAt).getFullYear() : draft.season,
    }));
  }

  function saveBout(bout: PickSetupBoutInput) {
    if (!draft) return;
    void runAction(`bout:${bout.bout_id ?? "new"}`, () => repository!.saveBout(draft.draftId, bout));
  }

  function moveBout(index: number, direction: -1 | 1) {
    if (!draft) return;
    const next = orderedBouts.map((bout) => bout.boutId);
    const target = index + direction;
    [next[index], next[target]] = [next[target]!, next[index]!];
    void runAction("reorder", () => repository!.reorderBouts(draft.draftId, next));
  }

  function removeBout(bout: PickSetupBout) {
    if (!draft || !window.confirm(`Remove ${bout.redFighterName} vs. ${bout.blueFighterName} from the staged card?`)) return;
    void runAction(`remove:${bout.boutId}`, () => repository!.removeBout(draft.draftId, bout.boutId));
  }

  function addBout() {
    if (!draft || !newBout.red.trim() || !newBout.blue.trim()) return;
    void runAction("new-bout", async () => {
      await repository!.saveBout(draft.draftId, {
        position: orderedBouts.length + 1,
        weight_class: newBout.weightClass.trim(),
        red_fighter_name: newBout.red.trim(),
        blue_fighter_name: newBout.blue.trim(),
        included: true,
      });
      setNewBout({ red: "", blue: "", weightClass: "" });
    });
  }

  function publishDraft() {
    if (!draft || !draft.canPublish) return;
    if (!window.confirm("Publish this reviewed card? It will become the live upcoming Picks event.")) return;
    void runAction("publish", async () => {
      await repository!.publishDraft(draft.draftId);
      navigate("/picks");
    });
  }

  function discardDraft() {
    if (!draft || !window.confirm("Discard this staged card? This does not change the live Picks event.")) return;
    void runAction("discard", () => repository!.discardDraft(draft.draftId));
  }

  return (
    <div className="page picks-setup-page">
      <section className="page-heading picks-setup-heading">
        <p className="eyebrow">PRIVATE OWNER TOOL</p>
        <h1>Event Setup</h1>
        <p>UFC.com supplies event details. MMA Mania supplies the card sections and fight order. Nothing becomes live until you publish it.</p>
        <div className="picks-setup-heading__links">
          <Link to="/picks/control">FIGHT NIGHT RESULTS</Link>
          <Link to="/picks">PLAYER PICKS</Link>
        </div>
      </section>

      {!identity.ready || loading ? (
        <section className="surface-card picks-setup-state"><strong>Loading Event Setup…</strong></section>
      ) : null}

      {identity.ready && !identity.profile ? (
        <section className="surface-card picks-setup-state">
          <p className="eyebrow">OWNER SIGN-IN REQUIRED</p>
          <h2>Sign in to open Event Setup.</h2>
          <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN</button>
        </section>
      ) : null}

      {identity.profile && !loading ? (
        <section className="surface-card picks-setup-scope" aria-label="Card scope">
          <div>
            <p className="eyebrow">PICKS CARD SCOPE</p>
            <h2>Choose what counts</h2>
          </div>
          <div className="picks-setup-scope__options">
            {scopeOptions.map((option) => (
              <button
                className={cardScope === option.value ? "is-active" : ""}
                type="button"
                key={option.value}
                aria-pressed={cardScope === option.value}
                disabled={Boolean(busyAction)}
                onClick={() => selectScope(option.value)}
              >
                <strong>{option.label}</strong>
                <small>{option.note}</small>
              </button>
            ))}
          </div>
          <label className="picks-setup-source">
            MMA MANIA CARD URL (OPTIONAL)
            <input
              type="url"
              value={sourceUrl}
              onChange={(event) => {
                setSourceUrl(event.target.value);
                setSourcePreview(null);
              }}
              disabled={Boolean(busyAction)}
              placeholder="https://www.mmamania.com/..."
              autoCapitalize="none"
              autoCorrect="off"
            />
            <small>Leave blank for automatic discovery. Once staged, future checks reuse the saved article unless you replace it here.</small>
          </label>
        </section>
      ) : null}

      {identity.profile && !loading && error && !draft ? (
        <section className="surface-card picks-setup-state">
          <p className="eyebrow">SETUP UNAVAILABLE</p>
          <h2>{error}</h2>
          <Link className="secondary-action" to="/picks">BACK TO PICKS</Link>
        </section>
      ) : null}

      {identity.profile && !loading && !draft ? (
        <section className="surface-card picks-setup-sync">
          <div>
            <p className="eyebrow">NO STAGED CARD</p>
            <h2>Stage the next UFC event.</h2>
            <p>Auto uses the main card for Fight Nights and the full card for numbered events.</p>
          </div>
          <button className="primary-action" type="button" disabled={Boolean(busyAction)} onClick={syncEvent}>
            {busyAction === "sync" ? "SYNCING UFC CARD…" : "SYNC NEXT UFC EVENT"}
          </button>
        </section>
      ) : null}

      {draft ? (
        <>
          <section className="surface-card picks-setup-hero">
            <div className="picks-setup-hero__topline">
              <div>
                <p className="eyebrow">{sourcePreview ? "SOURCE REVIEW · NOT APPLIED" : "STAGED CARD · NOT LIVE"}</p>
                <h2>{sourcePreview?.event.name ?? draft.name}</h2>
                <strong>{sourcePreview?.event.subtitle ?? draft.subtitle}</strong>
              </div>
              <button className="secondary-action" type="button" disabled={Boolean(busyAction)} onClick={checkSourceUpdates}>
                {busyAction === "preview" ? "CHECKING…" : "CHECK FOR CARD UPDATES"}
              </button>
            </div>
            <p>
              {displayTime(sourcePreview?.event.startsAt ?? draft.startsAt)} · {(sourcePreview?.event.venue ?? draft.venue) || "VENUE MISSING"} · {(sourcePreview?.event.location ?? draft.location) || "LOCATION MISSING"}
            </p>
            <small>{sourcePreview ? `Prospective source: ${sourcePreview.source}` : `Source: ${draft.source} · Synced ${displayTime(draft.syncedAt)}`}</small>
          </section>

          {sourcePreview ? (
            <section className={`surface-card picks-setup-preview${sourcePreview.changes.length ? " has-changes" : " is-current"}`} aria-live="polite">
              <div>
                <p className="eyebrow">{sourcePreview.changes.length ? "CARD CHANGES DETECTED" : "SOURCE MATCHES DRAFT"}</p>
                <h2>{sourcePreview.effectiveScope === "full" ? "Full card" : "Main card"} · {sourcePreview.fightCount} fights</h2>
                <small>{sourcePreview.source}</small>
              </div>
              <div className="picks-setup-preview__changes" aria-label="Prospective event card">
                <strong>{sourcePreview.event.subtitle}</strong>
                <span>{displayTime(sourcePreview.event.startsAt)} · {sourcePreview.event.venue || "VENUE MISSING"} · {sourcePreview.event.location || "LOCATION MISSING"}</span>
                {reviewedBouts.map((bout) => (
                  <span key={bout.boutId}>{bout.redFighterName} vs. {bout.blueFighterName}</span>
                ))}
              </div>
              {sourcePreview.changes.length ? (
                <div className="picks-setup-preview__changes" aria-label="Detected source changes">
                  {sourcePreview.changes.map((change) => <strong key={change}>{change}</strong>)}
                </div>
              ) : <p>No staged event details, fights, sections, or order changed.</p>}
              {sourcePreview.warnings.map((warning) => <em key={warning}>{warning}</em>)}
              {sourcePreview.changes.length ? (
                <button className="primary-action" type="button" disabled={Boolean(busyAction)} onClick={applySourceUpdates}>
                  {busyAction === "apply-preview" ? "APPLYING CHANGES…" : "APPLY SOURCE CHANGES"}
                </button>
              ) : null}
              <button className="pick-setup-danger" type="button" disabled={Boolean(busyAction)} onClick={() => setSourcePreview(null)}>CLOSE REVIEW</button>
            </section>
          ) : null}

          {!sourcePreview ? (
            <>
              {draft.warnings.length ? (
                <section className="surface-card picks-setup-warnings" aria-label="Card readiness warnings">
                  <p className="eyebrow">REVIEW REQUIRED</p>
                  {draft.warnings.map((warning) => <strong key={warning}>{warning}</strong>)}
                </section>
              ) : (
                <section className="surface-card picks-setup-ready">
                  <p className="eyebrow">CARD READY</p>
                  <strong>No blocking metadata warnings.</strong>
                </section>
              )}

              <section className="surface-card picks-setup-metadata">
                <div>
                  <p className="eyebrow">EVENT DETAILS</p>
                  <h2>Review event information</h2>
                </div>
                <label>EVENT NAME<input value={metadata.name} onChange={(event) => setMetadata({ ...metadata, name: event.target.value })} /></label>
                <label>SUBTITLE<input value={metadata.subtitle} onChange={(event) => setMetadata({ ...metadata, subtitle: event.target.value })} /></label>
                <label>VENUE<input value={metadata.venue} onChange={(event) => setMetadata({ ...metadata, venue: event.target.value })} /></label>
                <label>LOCATION<input value={metadata.location} onChange={(event) => setMetadata({ ...metadata, location: event.target.value })} /></label>
                <div className="picks-setup-time-grid">
                  <label>MAIN CARD START<input type="datetime-local" value={metadata.startsAt} onChange={(event) => setMetadata({ ...metadata, startsAt: event.target.value })} /></label>
                  <label>PICKS LOCK<input type="datetime-local" value={metadata.locksAt} onChange={(event) => setMetadata({ ...metadata, locksAt: event.target.value })} /></label>
                </div>
                <button className="primary-action" type="button" disabled={Boolean(busyAction)} onClick={saveMetadata}>
                  {busyAction === "metadata" ? "SAVING DETAILS…" : "SAVE EVENT DETAILS"}
                </button>
              </section>

              <section className="picks-setup-card" aria-label="Staged Picks card">
                <div className="picks-setup-card__heading">
                  <div><p className="eyebrow">{pickSetupDraftCardLabel(draft)}</p><h2>{orderedBouts.filter((bout) => bout.included).length} fights included</h2></div>
                  <span>Use arrows to reorder</span>
                </div>
                {orderedBouts.map((bout, index) => (
                  <BoutEditor
                    key={bout.boutId}
                    bout={bout}
                    index={index}
                    total={orderedBouts.length}
                    busy={Boolean(busyAction)}
                    onSave={saveBout}
                    onMove={(direction) => moveBout(index, direction)}
                    onRemove={() => removeBout(bout)}
                  />
                ))}
              </section>

              <section className="surface-card picks-setup-add">
                <div><p className="eyebrow">EMERGENCY FALLBACK</p><h2>Add a missing fight</h2></div>
                <label>RED CORNER<input value={newBout.red} onChange={(event) => setNewBout({ ...newBout, red: event.target.value })} /></label>
                <label>BLUE CORNER<input value={newBout.blue} onChange={(event) => setNewBout({ ...newBout, blue: event.target.value })} /></label>
                <label>WEIGHT CLASS<input value={newBout.weightClass} onChange={(event) => setNewBout({ ...newBout, weightClass: event.target.value })} /></label>
                <button className="secondary-action" type="button" disabled={Boolean(busyAction) || !newBout.red.trim() || !newBout.blue.trim()} onClick={addBout}>
                  {busyAction === "new-bout" ? "ADDING FIGHT…" : "ADD MISSING FIGHT"}
                </button>
              </section>

              <section className="surface-card picks-setup-publish">
                <div>
                  <p className="eyebrow">FINAL REVIEW</p>
                  <h2>Publish upcoming card</h2>
                  <p>Publishing replaces only an unclaimed upcoming card. A locked event or an upcoming card with submitted picks cannot be overwritten.</p>
                </div>
                <button className="primary-action" type="button" disabled={!draft.canPublish || Boolean(busyAction)} onClick={publishDraft}>
                  {busyAction === "publish" ? "PUBLISHING CARD…" : "PUBLISH CARD"}
                </button>
                <button className="pick-setup-danger" type="button" disabled={Boolean(busyAction)} onClick={discardDraft}>DISCARD STAGED CARD</button>
              </section>
            </>
          ) : null}

          {error ? <p className="picks-error" role="status">{error}</p> : null}
        </>
      ) : null}
    </div>
  );
}
