import { useEffect, useMemo, useState } from "react";
import type {
  PickSetupBout,
  PickSetupDraft,
  PickSetupSpotlight,
} from "./pickSetupModel";

interface PicksSpotlightSetupProps {
  draft: PickSetupDraft;
  bouts: PickSetupBout[];
  busy: boolean;
  saving: boolean;
  onSave: (spotlight: PickSetupSpotlight | null) => void;
}

function validHttpUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function savedUrl(draft: PickSetupDraft, boutId: string, fighterSlug: string) {
  if (draft.spotlight?.boutId !== boutId) return "";
  return draft.spotlight.watchSpotlights.find((watch) => watch.fighterSlug === fighterSlug)?.url ?? "";
}

export function PicksSpotlightSetup({ draft, bouts, busy, saving, onSave }: PicksSpotlightSetupProps) {
  const eligibleBouts = useMemo(
    () => bouts.filter((bout) => bout.included).slice().sort((left, right) => left.position - right.position),
    [bouts],
  );
  const defaultBoutId = eligibleBouts[0]?.boutId ?? "";
  const [boutId, setBoutId] = useState(draft.spotlight?.boutId ?? defaultBoutId);
  const selectedBout = eligibleBouts.find((bout) => bout.boutId === boutId) ?? eligibleBouts[0] ?? null;
  const [redUrl, setRedUrl] = useState("");
  const [blueUrl, setBlueUrl] = useState("");

  useEffect(() => {
    const nextBoutId = draft.spotlight?.boutId && eligibleBouts.some((bout) => bout.boutId === draft.spotlight?.boutId)
      ? draft.spotlight.boutId
      : defaultBoutId;
    const nextBout = eligibleBouts.find((bout) => bout.boutId === nextBoutId) ?? null;
    setBoutId(nextBoutId);
    setRedUrl(nextBout ? savedUrl(draft, nextBoutId, nextBout.redFighterSlug) : "");
    setBlueUrl(nextBout ? savedUrl(draft, nextBoutId, nextBout.blueFighterSlug) : "");
  }, [defaultBoutId, draft, eligibleBouts]);

  function selectBout(nextBoutId: string) {
    const nextBout = eligibleBouts.find((bout) => bout.boutId === nextBoutId) ?? null;
    setBoutId(nextBoutId);
    setRedUrl(nextBout ? savedUrl(draft, nextBoutId, nextBout.redFighterSlug) : "");
    setBlueUrl(nextBout ? savedUrl(draft, nextBoutId, nextBout.blueFighterSlug) : "");
  }

  const redValid = validHttpUrl(redUrl);
  const blueValid = validHttpUrl(blueUrl);
  const videoCount = Number(Boolean(redUrl.trim())) + Number(Boolean(blueUrl.trim()));
  const canSave = Boolean(selectedBout && videoCount > 0 && redValid && blueValid && !busy);

  function save() {
    if (!selectedBout || !canSave) return;
    const watchSpotlights = [
      redUrl.trim() ? { fighterSlug: selectedBout.redFighterSlug, url: redUrl.trim() } : null,
      blueUrl.trim() ? { fighterSlug: selectedBout.blueFighterSlug, url: blueUrl.trim() } : null,
    ].filter((watch): watch is { fighterSlug: string; url: string } => Boolean(watch));
    onSave({ boutId: selectedBout.boutId, watchSpotlights });
  }

  return (
    <section className="surface-card picks-setup-spotlight" aria-label="Featured Spotlight setup">
      <div className="picks-setup-spotlight__heading">
        <div>
          <p className="eyebrow">FEATURED SPOTLIGHT</p>
          <h2>Pick the fight, paste the videos</h2>
        </div>
        <span>{draft.spotlight ? "SAVED" : "OPTIONAL"}</span>
      </div>
      <p className="picks-setup-spotlight__intro">
        Defaults to the main event. Confirm the matchup and paste a Watch Spotlight for either or both fighters.
      </p>

      <label>
        FEATURED FIGHT
        <select value={selectedBout?.boutId ?? ""} onChange={(event) => selectBout(event.target.value)} disabled={busy || !eligibleBouts.length}>
          {eligibleBouts.map((bout, index) => (
            <option value={bout.boutId} key={bout.boutId}>
              {index === 0 ? "MAIN EVENT · " : ""}{bout.redFighterName} vs. {bout.blueFighterName}
            </option>
          ))}
        </select>
      </label>

      {selectedBout ? (
        <>
          <div className="picks-setup-spotlight__matchup">
            <strong>{selectedBout.redFighterName} vs. {selectedBout.blueFighterName}</strong>
            <span>{selectedBout.weightClass || "Weight class TBD"}</span>
          </div>
          <div className="picks-setup-spotlight__urls">
            <label>
              {selectedBout.redFighterName.toUpperCase()} WATCH URL
              <input
                type="url"
                value={redUrl}
                onChange={(event) => setRedUrl(event.target.value)}
                disabled={busy}
                placeholder="https://youtu.be/..."
                autoCapitalize="none"
                autoCorrect="off"
                aria-invalid={!redValid}
              />
              {!redValid ? <small>Use a valid http/https URL.</small> : null}
            </label>
            <label>
              {selectedBout.blueFighterName.toUpperCase()} WATCH URL
              <input
                type="url"
                value={blueUrl}
                onChange={(event) => setBlueUrl(event.target.value)}
                disabled={busy}
                placeholder="https://youtu.be/..."
                autoCapitalize="none"
                autoCorrect="off"
                aria-invalid={!blueValid}
              />
              {!blueValid ? <small>Use a valid http/https URL.</small> : null}
            </label>
          </div>
          <div className="picks-setup-spotlight__review" aria-live="polite">
            <strong>{videoCount} OF 2 VIDEOS READY</strong>
            <span>{videoCount ? "These links will appear inside the selected fight's Spotlight when the card is published." : "Paste at least one fighter video to save this Spotlight."}</span>
          </div>
        </>
      ) : (
        <p>No included fight is available for a Spotlight yet.</p>
      )}

      <button className="primary-action" type="button" disabled={!canSave} onClick={save}>
        {saving ? "SAVING SPOTLIGHT…" : draft.spotlight ? "UPDATE SPOTLIGHT" : "SAVE SPOTLIGHT"}
      </button>
      {draft.spotlight ? (
        <button className="pick-setup-danger" type="button" disabled={busy} onClick={() => onSave(null)}>
          REMOVE SPOTLIGHT
        </button>
      ) : null}
    </section>
  );
}
