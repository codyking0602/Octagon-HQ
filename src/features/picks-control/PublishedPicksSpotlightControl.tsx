import { useEffect, useMemo, useState } from "react";
import { PicksSpotlightSetup } from "../picks-setup/PicksSpotlightSetup";
import type { PickSetupBout, PickSetupSpotlight } from "../picks-setup/pickSetupModel";
import type { PickControlEvent } from "./pickControlModel";
import type { PickControlRepository } from "./pickControlRepository";

interface PublishedPicksSpotlightControlProps {
  event: PickControlEvent;
  repository: PickControlRepository | null;
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "The published Fight Spotlight could not be updated.";
}

export default function PublishedPicksSpotlightControl({
  event,
  repository,
}: PublishedPicksSpotlightControlProps) {
  const [spotlights, setSpotlights] = useState<PickSetupSpotlight[]>(event.spotlights ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bouts = useMemo<PickSetupBout[]>(() => event.bouts.map((bout) => ({
    boutId: bout.boutId,
    position: bout.position,
    weightClass: bout.weightClass,
    redFighterSlug: bout.redFighterSlug,
    redFighterName: bout.redFighterName,
    blueFighterSlug: bout.blueFighterSlug,
    blueFighterName: bout.blueFighterName,
    included: bout.includedInPicks && bout.resultStatus !== "cancelled",
  })), [event.bouts]);

  useEffect(() => {
    setSpotlights(event.spotlights ?? []);
    setError("");
  }, [event.eventId, event.spotlights]);

  async function buildSpotlight(boutId: string) {
    if (!repository?.buildSpotlight || event.status !== "upcoming") return null;
    setBusy(true);
    setError("");
    try {
      return await repository.buildSpotlight(event.eventId, boutId);
    } catch (nextError) {
      setError(readableError(nextError));
      return null;
    } finally {
      setBusy(false);
    }
  }

  function saveSpotlights(next: PickSetupSpotlight[]) {
    if (!repository?.saveSpotlights || event.status !== "upcoming") return;
    void (async () => {
      setBusy(true);
      setError("");
      try {
        await repository.saveSpotlights!(event.eventId, next);
        setSpotlights(next);
      } catch (nextError) {
        setError(readableError(nextError));
      } finally {
        setBusy(false);
      }
    })();
  }

  if (event.status !== "upcoming") return null;
  if (!repository?.buildSpotlight || !repository.saveSpotlights) {
    return <p className="picks-error" role="status">Published Fight Spotlight controls are not connected on this build.</p>;
  }

  return (
    <div className="published-picks-spotlights">
      <PicksSpotlightSetup
        spotlights={spotlights}
        revision={`${event.eventId}:${spotlights.map((spotlight) => spotlight.generatedAt).join("|")}`}
        bouts={bouts}
        busy={busy}
        mode="published"
        onBuild={buildSpotlight}
        onSave={saveSpotlights}
      />
      {error ? <p className="picks-error" role="status">{error}</p> : null}
    </div>
  );
}
