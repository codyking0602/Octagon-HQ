import { useEffect, useMemo, useState } from "react";
import type { PickSetupBout, PickSetupDraft, PickSetupSpotlight } from "./pickSetupModel";

interface PicksSpotlightSetupProps {
  draft?: PickSetupDraft;
  spotlights?: PickSetupSpotlight[];
  revision?: string;
  bouts: PickSetupBout[];
  busy: boolean;
  mode?: "draft" | "published";
  onBuild: (boutId: string) => Promise<PickSetupSpotlight | null>;
  onSave: (spotlights: PickSetupSpotlight[]) => void;
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

function byBout(spotlights: PickSetupSpotlight[]) {
  return new Map(spotlights.map((spotlight) => [spotlight.boutId, spotlight]));
}

function fighterUrl(spotlight: PickSetupSpotlight, fighterSlug: string) {
  return spotlight.watchSpotlights.find((watch) => watch.fighterSlug === fighterSlug)?.url ?? "";
}

export function PicksSpotlightSetup({
  draft,
  spotlights,
  revision,
  bouts,
  busy,
  mode = "draft",
  onBuild,
  onSave,
}: PicksSpotlightSetupProps) {
  const eligibleBouts = useMemo(
    () => bouts.filter((bout) => bout.included).slice().sort((left, right) => left.position - right.position),
    [bouts],
  );
  const saved = useMemo(() => spotlights ?? draft?.spotlights ?? [], [draft?.spotlights, spotlights]);
  const [working, setWorking] = useState<Map<string, PickSetupSpotlight>>(() => byBout(saved));
  const [buildingBoutId, setBuildingBoutId] = useState("");
  const [urls, setUrls] = useState<Record<string, { red: string; blue: string }>>({});

  useEffect(() => {
    const next = byBout(saved);
    setWorking(next);
    setUrls(Object.fromEntries(eligibleBouts.map((bout) => {
      const spotlight = next.get(bout.boutId);
      return [bout.boutId, {
        red: spotlight ? fighterUrl(spotlight, bout.redFighterSlug) : "",
        blue: spotlight ? fighterUrl(spotlight, bout.blueFighterSlug) : "",
      }];
    })));
  }, [draft?.updatedAt, eligibleBouts, revision, saved]);

  async function build(boutId: string) {
    setBuildingBoutId(boutId);
    const spotlight = await onBuild(boutId);
    setBuildingBoutId("");
    if (!spotlight) return;
    setWorking((current) => new Map(current).set(boutId, spotlight));
    setUrls((current) => ({ ...current, [boutId]: { red: "", blue: "" } }));
  }

  function saveBout(bout: PickSetupBout) {
    const spotlight = working.get(bout.boutId);
    if (!spotlight) return;
    const row = urls[bout.boutId] ?? { red: "", blue: "" };
    if (!validHttpUrl(row.red) || !validHttpUrl(row.blue)) return;
    const updated: PickSetupSpotlight = {
      ...spotlight,
      watchSpotlights: [
        row.red.trim() ? { fighterSlug: bout.redFighterSlug, url: row.red.trim() } : null,
        row.blue.trim() ? { fighterSlug: bout.blueFighterSlug, url: row.blue.trim() } : null,
      ].filter((watch): watch is { fighterSlug: string; url: string } => Boolean(watch)),
    };
    const collection = saved.filter((item) => item.boutId !== bout.boutId).concat(updated);
    onSave(collection);
  }

  function removeBoutSpotlight(boutId: string) {
    setWorking((current) => {
      const next = new Map(current);
      next.delete(boutId);
      return next;
    });
    onSave(saved.filter((item) => item.boutId !== boutId));
  }

  return (
    <section className="surface-card picks-setup-spotlight" aria-label="Fight Spotlights setup">
      <div className="picks-setup-spotlight__heading">
        <div>
          <p className="eyebrow">FIGHT SPOTLIGHTS</p>
          <h2>{mode === "published" ? "Update the live card" : "Build as many as you want"}</h2>
        </div>
        <span>{saved.length} SAVED</span>
      </div>
      <p className="picks-setup-spotlight__intro">
        {mode === "published"
          ? "Rebuild or update any published Spotlight without republishing the card or changing member picks."
          : "Add a Spotlight to any included fight. Octagon HQ builds the preview, Tale of the Tape, and matchup edges from UFCStats; you only add the Watch URLs you want."}
      </p>

      <div className="picks-setup-spotlight__fight-list">
        {eligibleBouts.map((bout, index) => {
          const spotlight = working.get(bout.boutId);
          const isSaved = saved.some((item) => item.boutId === bout.boutId);
          const row = urls[bout.boutId] ?? { red: "", blue: "" };
          const urlsValid = validHttpUrl(row.red) && validHttpUrl(row.blue);
          return (
            <article className="picks-setup-spotlight__fight" key={bout.boutId}>
              <div className="picks-setup-spotlight__matchup">
                <div>
                  <small>{index === 0 ? "MAIN EVENT" : `FIGHT ${index + 1}`}</small>
                  <strong>{bout.redFighterName} vs. {bout.blueFighterName}</strong>
                  <span>{bout.weightClass || "Weight class TBD"}</span>
                </div>
                <em>{isSaved ? "SPOTLIGHT SAVED" : spotlight ? "READY TO SAVE" : "STANDARD FIGHT"}</em>
              </div>

              {!spotlight ? (
                <button className="secondary-action" type="button" disabled={busy || Boolean(buildingBoutId)} onClick={() => void build(bout.boutId)}>
                  {buildingBoutId === bout.boutId ? "BUILDING SPOTLIGHT…" : "ADD SPOTLIGHT"}
                </button>
              ) : (
                <div className="picks-setup-spotlight__package">
                  <div className="picks-setup-spotlight__generated">
                    <strong>FIGHT PREVIEW</strong>
                    <p>{spotlight.preview}</p>
                  </div>
                  <div className="picks-setup-spotlight__tale">
                    <span><b>{spotlight.red.record}</b><small>RECORD</small><b>{spotlight.blue.record}</b></span>
                    <span><b>{spotlight.red.age}</b><small>AGE</small><b>{spotlight.blue.age}</b></span>
                    <span><b>{spotlight.red.height}</b><small>HEIGHT</small><b>{spotlight.blue.height}</b></span>
                    <span><b>{spotlight.red.reach}</b><small>REACH</small><b>{spotlight.blue.reach}</b></span>
                    <span><b>{spotlight.red.stance}</b><small>STANCE</small><b>{spotlight.blue.stance}</b></span>
                  </div>
                  <div className="picks-setup-spotlight__edges">
                    <div><strong>{bout.redFighterName}</strong>{spotlight.red.edges.map((edge) => <span key={edge}>{edge}</span>)}</div>
                    <div><strong>{bout.blueFighterName}</strong>{spotlight.blue.edges.map((edge) => <span key={edge}>{edge}</span>)}</div>
                  </div>
                  <div className="picks-setup-spotlight__urls">
                    <label>
                      {bout.redFighterName.toUpperCase()} WATCH URL
                      <input type="url" value={row.red} onChange={(event) => setUrls((current) => ({ ...current, [bout.boutId]: { ...row, red: event.target.value } }))} disabled={busy} placeholder="https://youtu.be/..." autoCapitalize="none" autoCorrect="off" aria-invalid={!validHttpUrl(row.red)} />
                    </label>
                    <label>
                      {bout.blueFighterName.toUpperCase()} WATCH URL
                      <input type="url" value={row.blue} onChange={(event) => setUrls((current) => ({ ...current, [bout.boutId]: { ...row, blue: event.target.value } }))} disabled={busy} placeholder="https://youtu.be/..." autoCapitalize="none" autoCorrect="off" aria-invalid={!validHttpUrl(row.blue)} />
                    </label>
                  </div>
                  <div className="picks-setup-spotlight__actions">
                    <button className="primary-action" type="button" disabled={busy || !urlsValid} onClick={() => saveBout(bout)}>{isSaved ? "UPDATE SPOTLIGHT" : "SAVE SPOTLIGHT"}</button>
                    <button className="secondary-action" type="button" disabled={busy || Boolean(buildingBoutId)} onClick={() => void build(bout.boutId)}>REBUILD FROM UFCSTATS</button>
                    <button className="pick-setup-danger" type="button" disabled={busy} onClick={() => removeBoutSpotlight(bout.boutId)}>REMOVE SPOTLIGHT</button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
