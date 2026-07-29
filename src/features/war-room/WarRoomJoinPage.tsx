import { useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { useWarRoom } from "./WarRoomProvider";

function inviteIsWellFormed(value: string) {
  return /^WR-[A-F0-9]{24}$/i.test(value);
}

function formatExpiration(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function WarRoomJoinPage() {
  const identity = useIdentity();
  const warRoom = useWarRoom();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = (searchParams.get("invite") ?? "").trim().toUpperCase();
  const validShape = inviteIsWellFormed(inviteCode);

  useEffect(() => {
    if (!validShape || !identity.profile) {
      warRoom.clearInvite();
      return undefined;
    }
    void warRoom.checkInvite(inviteCode);
    return () => warRoom.clearInvite();
  }, [
    identity.profile?.id,
    inviteCode,
    validShape,
    warRoom.checkInvite,
    warRoom.clearInvite,
  ]);

  useEffect(() => {
    if (warRoom.inviteAccess?.mode === "eligible" || warRoom.inviteStatus === "joined") {
      navigate("/war-room", { replace: true });
    }
  }, [navigate, warRoom.inviteAccess, warRoom.inviteStatus]);

  if (identity.status === "loading") return null;

  if (!validShape) {
    return (
      <div className="page war-room-join-page">
        <section className="surface-card war-room-join-card">
          <div className="war-room-join-mark" aria-hidden="true">!</div>
          <p className="eyebrow">WAR ROOM INVITE</p>
          <h1>This invite is unavailable</h1>
          <p>The invite link is incomplete or no longer valid.</p>
          <button type="button" className="primary-action" onClick={() => navigate("/", { replace: true })}>
            RETURN HOME
          </button>
        </section>
      </div>
    );
  }

  if (!identity.profile) {
    return (
      <div className="page war-room-join-page">
        <section className="surface-card war-room-join-card">
          <div className="war-room-join-mark" aria-hidden="true">WR</div>
          <p className="eyebrow">PRIVATE OCTAGON HQ INVITE</p>
          <h1>Join with invite</h1>
          <p>Sign in or create your Octagon HQ profile to verify this invitation. No War Room conversation is visible before you join.</p>
          <button type="button" className="primary-action" onClick={identity.openDialog}>
            SIGN IN TO CONTINUE
          </button>
        </section>
      </div>
    );
  }

  if (warRoom.inviteStatus === "checking" || warRoom.inviteStatus === "joining") {
    return (
      <div className="page war-room-join-page">
        <section className="surface-card war-room-join-card" aria-live="polite">
          <div className="war-room-join-mark" aria-hidden="true">WR</div>
          <p className="eyebrow">WAR ROOM INVITE</p>
          <h1>{warRoom.inviteStatus === "joining" ? "Joining War Room…" : "Checking your invite…"}</h1>
        </section>
      </div>
    );
  }

  if (warRoom.inviteAccess?.mode === "invite") {
    return (
      <div className="page war-room-join-page">
        <section className="surface-card war-room-join-card">
          <div className="war-room-join-mark" aria-hidden="true">WR</div>
          <p className="eyebrow">PRIVATE OCTAGON HQ INVITE</p>
          <h1>You’re invited to War Room</h1>
          <p>Join the private UFC conversation as <strong>{identity.profile.displayName}</strong>.</p>
          <div className="war-room-invite-meta">
            <span><small>EXPIRES</small><strong>{formatExpiration(warRoom.inviteAccess.inviteExpiresAt)}</strong></span>
            <span><small>USES LEFT</small><strong>{warRoom.inviteAccess.inviteUsesRemaining}</strong></span>
          </div>
          {warRoom.inviteError ? <div className="war-room-error" role="status">{warRoom.inviteError}</div> : null}
          <button
            type="button"
            className="primary-action"
            onClick={() => void warRoom.joinWithInvite(inviteCode)}
          >
            JOIN WAR ROOM
          </button>
        </section>
      </div>
    );
  }

  if (
    warRoom.inviteStatus === "invalid"
    || warRoom.inviteStatus === "error"
    || warRoom.inviteAccess?.mode === "locked"
  ) {
    return (
      <div className="page war-room-join-page">
        <section className="surface-card war-room-join-card">
          <div className="war-room-join-mark" aria-hidden="true">!</div>
          <p className="eyebrow">WAR ROOM INVITE</p>
          <h1>This invite is unavailable</h1>
          <p>{warRoom.inviteError || "It may be expired, used, revoked, or unavailable for this profile."}</p>
          <button type="button" className="primary-action" onClick={() => navigate("/", { replace: true })}>
            RETURN HOME
          </button>
        </section>
      </div>
    );
  }

  if (warRoom.status === "eligible") {
    return <Navigate to="/war-room" replace />;
  }

  return null;
}
