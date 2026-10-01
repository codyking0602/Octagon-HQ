import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { OfficialAverageFanDailyView } from "./OfficialAverageFanDailyView";
import {
  createOwnerAverageFanPreviewRepository,
  type TodayChallengeProjection,
} from "./todayChallengeRepository";

function previewError(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "The owner Daily preview could not be loaded.";
}

export default function OwnerAverageFanDailyPreviewPage() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedSport = searchParams.get("sport");
  const sport = requestedSport === "football" ? "football" : "ufc";
  const day = searchParams.get("day") ?? "";
  const validDay = /^\d{4}-\d{2}-\d{2}$/.test(day);
  const authorized = identity.status === "ready" && identity.profile?.canControlPicks === true;
  const repository = useMemo(
    () => validDay ? createOwnerAverageFanPreviewRepository(day, sport) : null,
    [day, sport, validDay],
  );
  const [projection, setProjection] = useState<TodayChallengeProjection | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    setProjection(null);
    setError(null);

    if (identity.status !== "ready" || !authorized || !repository || !validDay) {
      setLoading(identity.status !== "ready");
      return () => { active = false; };
    }

    setLoading(true);
    void repository.load()
      .then((next) => {
        if (!active) return;
        if (next.gameType !== "average_fan") {
          throw new Error("The requested preview date is not an Average Fan Daily.");
        }
        setProjection(next);
      })
      .catch((nextError) => {
        if (active) setError(nextError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [authorized, identity.status, repository, validDay]);

  async function advance(action: Record<string, unknown>) {
    if (!projection || !repository || busy) return;
    setBusy(true);
    setError(null);
    try {
      const next = await repository.advance(projection, action);
      setProjection(next);
    } catch (nextError) {
      setError(nextError);
    } finally {
      setBusy(false);
    }
  }

  if (identity.status === "ready" && !authorized) {
    return <Navigate replace to={sport === "football" ? "/football" : "/play"} />;
  }

  if (!validDay) {
    return (
      <div className="page official-daily-page">
        <section className="official-daily-gate is-error">
          <p className="eyebrow">OWNER DAILY PREVIEW</p>
          <h1>Choose a valid preview date.</h1>
        </section>
      </div>
    );
  }

  if (loading || identity.status !== "ready") {
    return (
      <div className="page official-daily-page">
        <section className="official-daily-loading" aria-live="polite">
          <span />
          <strong>Loading canonical Daily preview…</strong>
        </section>
      </div>
    );
  }

  if (!projection || error) {
    return (
      <div className="page official-daily-page">
        <section className="official-daily-gate is-error">
          <p className="eyebrow">OWNER DAILY PREVIEW</p>
          <h1>The canonical preview did not load.</h1>
          <p>{previewError(error)}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            RELOAD PREVIEW
          </button>
        </section>
      </div>
    );
  }

  return (
    <OfficialAverageFanDailyView
      key={`${sport}:${day}`}
      projection={projection}
      busy={busy}
      onAdvance={(action) => { void advance(action); }}
      onExit={() => navigate(sport === "football" ? "/football" : "/play")}
    />
  );
}
