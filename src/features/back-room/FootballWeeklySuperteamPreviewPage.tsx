import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../../styles/football-weekly-superteam.css";
import "../../styles/football-weekly-build-qb-preview.css";
import { useIdentity } from "../identity/IdentityProvider";
import {
  createFootballWeeklyAuctionRepository,
  type FootballWeeklyAuctionBidInput,
  type FootballWeeklySuperteamBid,
  type FootballWeeklySuperteamState,
} from "../play/footballWeeklyAuctionRepository";
import { isFootballWeeklyBuildQbPreviewOwner } from "../play/footballWeeklyBuildQbPreviewAccess";
import { FootballWeeklySuperteamGate } from "./FootballWeeklySuperteamGate";

function previewBids(bids: Record<number, FootballWeeklyAuctionBidInput>) {
  return Object.fromEntries(
    Object.entries(bids).map(([slot, value]) => {
      const bid = value as FootballWeeklySuperteamBid;
      return [slot, {
        amount: Math.max(0, Math.floor(bid.amount)),
        priority: Math.max(1, Math.min(8, Math.floor(bid.priority))),
      }];
    }),
  );
}

export default function FootballWeeklySuperteamPreviewPage() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const repository = useMemo(() => createFootballWeeklyAuctionRepository(), []);
  const [state, setState] = useState<FootballWeeklySuperteamState | null>(null);
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
    repository.loadSuperteamPreview()
      .then((next) => {
        if (!active) return;
        if (!next.available || next.subject_key !== "cfb-superteam") {
          setError("The next Weekly Auction is not CFB Superteam.");
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

  if (identity.ready && !owner) return <Navigate to="/football" replace />;

  if (loading || !identity.ready) {
    return (
      <div className="page football-weekly-build-qb-preview-page">
        <section className="football-weekly-build-qb-preview__note surface-card">
          <p className="eyebrow">OWNER PREVIEW · CFB SUPERTEAM</p>
          <h1>Loading the real Day 1 board…</h1>
        </section>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="page football-weekly-build-qb-preview-page">
        <section className="football-weekly-build-qb-preview__note surface-card">
          <p className="eyebrow">OWNER PREVIEW · CFB SUPERTEAM</p>
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
          <p className="eyebrow">OWNER PREVIEW · SEP 29</p>
          <h1>Real CFB Superteam Day 1</h1>
          <p>These candidates are the actual launch board. Grades remain hidden. Preview bids stay local and never enter the live auction.</p>
        </div>
        <button type="button" onClick={() => navigate("/football")}>DONE</button>
      </section>

      <FootballWeeklySuperteamGate
        state={state}
        busy={false}
        error={null}
        forceBoard
        tableMode="hidden"
        onSubmit={async (bids) => {
          setState((current) => current ? {
            ...current,
            submitted_today: true,
            show_intro: false,
            bids: previewBids(bids),
          } : current);
        }}
        onContinue={() => navigate("/football")}
      />
    </div>
  );
}
