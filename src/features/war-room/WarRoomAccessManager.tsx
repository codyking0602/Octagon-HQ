import { useEffect } from "react";
import { useIdentity } from "../identity/IdentityProvider";
import type { WarRoomAccessProfile } from "./warRoomModel";
import { useWarRoom } from "./WarRoomProvider";

function AccessAvatar({ profile }: { profile: WarRoomAccessProfile }) {
  return (
    <span className="war-room-access-avatar" aria-hidden="true">
      {profile.avatarPhotoData ? <img src={profile.avatarPhotoData} alt="" /> : profile.initials}
    </span>
  );
}

export function WarRoomAccessManager({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const identity = useIdentity();
  const warRoom = useWarRoom();

  useEffect(() => {
    if (!open || warRoom.role !== "admin") return;
    void warRoom.loadAccessRoster();
  }, [open, warRoom.loadAccessRoster, warRoom.role]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open || warRoom.role !== "admin") return null;

  return (
    <div className="war-room-access-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className="war-room-access-sheet" role="dialog" aria-modal="true" aria-labelledby="war-room-access-title">
        <header className="war-room-access-sheet__header">
          <div>
            <p className="eyebrow">ADMIN</p>
            <h2 id="war-room-access-title">Manage War Room Access</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close War Room access manager">CLOSE</button>
        </header>

        <p className="war-room-access-sheet__copy">
          Turn access on or off for each Octagon HQ profile. Changes apply immediately.
        </p>

        {warRoom.accessRosterError ? (
          <div className="war-room-error" role="status">{warRoom.accessRosterError}</div>
        ) : null}

        <div className="war-room-access-list">
          {warRoom.accessRosterStatus === "loading" && !warRoom.accessRoster.length ? (
            <div className="war-room-access-state">Loading profiles…</div>
          ) : warRoom.accessRoster.map((profile) => {
            const isSelf = profile.id === identity.profile?.id;
            const saving = warRoom.accessSavingProfileId === profile.id;
            return (
              <article className="war-room-access-row" key={profile.id}>
                <AccessAvatar profile={profile} />
                <div className="war-room-access-row__identity">
                  <strong>{profile.displayName}</strong>
                  <span>{profile.role === "admin" ? "WAR ROOM ADMIN" : profile.hasAccess ? "MEMBER" : "NO ACCESS"}</span>
                </div>
                <button
                  type="button"
                  className={`war-room-access-toggle${profile.hasAccess ? " is-on" : ""}`}
                  aria-pressed={profile.hasAccess}
                  disabled={isSelf || saving || Boolean(warRoom.accessSavingProfileId)}
                  onClick={() => void warRoom.setProfileAccess(profile.id, !profile.hasAccess)}
                >
                  <span aria-hidden="true" />
                  {isSelf ? "YOU" : saving ? "SAVING" : profile.hasAccess ? "ON" : "OFF"}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
