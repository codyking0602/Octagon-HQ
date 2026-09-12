import { Navigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import type { IdentityProfile } from "../identity/identityModel";

export const BUILD_A_QB_TRAITS = [
  "Arm",
  "Accuracy",
  "Processing",
  "Mobility",
  "Clutch",
] as const;

export function hasDraftRoomAdminAccess(profile: IdentityProfile | null | undefined) {
  return profile?.canControlPicks === true;
}

export default function FootballDraftRoomPage() {
  const identity = useIdentity();

  if (!identity.ready) {
    return (
      <div className="page football-room-page">
        <section className="surface-card" aria-live="polite">
          <p className="eyebrow">DRAFT ROOM</p>
          <strong>Checking preview access…</strong>
        </section>
      </div>
    );
  }

  if (!hasDraftRoomAdminAccess(identity.profile)) {
    return <Navigate to="/football" replace />;
  }

  return (
    <div className="page football-room-page">
      <section className="page-heading">
        <p className="eyebrow">STAGE 12 · ADMIN PREVIEW</p>
        <h1>Draft Room</h1>
        <p>Football’s sealed-bid strategy room. This surface stays private until the public release is explicitly approved.</p>
      </section>

      <section className="surface-card" aria-labelledby="build-a-qb-title">
        <p className="eyebrow">LAUNCH ROOM</p>
        <h2 id="build-a-qb-title">Build a QB</h2>
        <p>Two players. One nomination at a time. Sealed bids. Fixed bankrolls. Five traits decide the finished quarterback build.</p>
        <div aria-label="Build a QB traits">
          {BUILD_A_QB_TRAITS.map((trait) => <span key={trait}>{trait}</span>)}
        </div>
      </section>

      <section className="surface-card">
        <p className="eyebrow">FOUNDATION STATUS</p>
        <h2>Private shell is live for admins.</h2>
        <p>The next Stage 12 slices will wire canonical QB trait grading, nominations, bankroll rules, sealed bids, challenge lifecycle, and mobile gameplay without creating a second Football rating or challenge owner.</p>
      </section>
    </div>
  );
}
