import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../../styles/football-weekly-build-qb-preview.css";
import { useIdentity } from "../identity/IdentityProvider";
import {
  createFootballWeeklyAuctionRepository,
  type FootballWeeklyBuildQbState,
} from "../play/footballWeeklyAuctionRepository";
import { isFootballWeeklyBuildQbPreviewOwner } from "../play/footballWeeklyBuildQbPreviewAccess";
import { FootballWeeklyBuildQbGate } from "./FootballWeeklyBuildQbGate";

function normalizePreviewBids(bids: Record<number, number>) {
  return Object.fromEntries(
    Object.entries(bids).map(([slot, amount]) => [slot, Math.max(0, Math.floor(amount))]),
  );
}

export default function FootballWeeklyBuildQbPreviewPage() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const repository = useMemo(() => createFootballWeeklyAuctionRepository(), []);
  const [state, setState] = useState<FootballWeeklyBuildQbState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const owner = isFootballWeeklyBuildQbPreviewOwner(identity.profile);

  useEffect(() => {
    let active = true;

    if (!identity.ready) return () => { active = false; };

    if (!owner || !repository) {
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    setError(null);
    repository.loadBuildQbPreview()
      .then((next) => {
        if (!active) return;
        if (!next.available || next.subject_key !== "nfl-build-qb") {
          setError("The next Weekly Auction is not NFL Build a QB.");
          setState(null);
          return;
        }
        setState(next);
      })
      .catch((reason) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "Owner preview could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [identity.ready, owner, repository]);

  if (identity.ready && !owner) {
    return <Navigate to="/football" replace />;
  }

  if (loading || !identity.ready) {
    return (
      <div className="page football-weekly-build-qb-preview-page">
        <section className="football-weekly-build-qb-preview__note surface-card">
          <p className="eyebrow">OWNER PREVIEW · NFL WEEKLY AUCTION</p>
          <h1>Loading the real Day 1 board…</h1>
        </section>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="page football-weekly-build-qb-preview-page">
        <section className="football-weekly-build-qb-preview__note surface-card">
          <p className="eyebrow">OWNER PREVIEW · NFL WEEKLY AUCTION</p>
          <h1>Day 1 preview unavailable</h1>
          {error ? <p role="status">{error}</p> : null}
          <button type="button" onClick={() => navigate("/football")}>BACK TO FOOTBALL</button>
        </section>
      </div>
    );
  }

  return (
    <div className="page football-weekly-build-qb-preview-page">
      <section className="football-weekly-build-qb-preview__note surface-card">
        <div>
          <p className="eyebrow">OWNER PREVIEW · NEXT WEEK</p>
          <h1>Real Day 1 board</h1>
          <p>Only your profile can open this. The four cards below are the actual Day 1 launch board. Preview bids stay on this screen and never enter the live auction.</p>
        </div>
        <button type="button" onClick={() => navigate("/football")}>DONE</button>
      </section>

      <FootballWeeklyBuildQbGate
        state={state}
        busy={false}
        error={null}
        forceBoard
        onSubmit={async (bids) => {
          setState((current) => current ? {
            ...current,
            submitted_today: true,
            show_intro: false,
            bids: normalizePreviewBids(bids),
          } : current);
        }}
        onContinue={() => navigate("/football")}
      />
    </div>
  );
}
