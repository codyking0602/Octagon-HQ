import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { memberProfilePath } from "../members/memberProfilesModel";
import { useProfilePreferences } from "../profile/ProfilePreferencesProvider";
import { useIdentity } from "./IdentityProvider";

export function IdentityControl() {
  const identity = useIdentity();
  const preferences = useProfilePreferences();
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "create">("login");
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [localError, setLocalError] = useState("");
  const dialogWasOpen = useRef(false);
  const returnPath = useRef("/");

  useEffect(() => {
    if (identity.dialogOpen && !dialogWasOpen.current) {
      returnPath.current = `${location.pathname}${location.search}${location.hash}`;
    }
    dialogWasOpen.current = identity.dialogOpen;
  }, [identity.dialogOpen, location.hash, location.pathname, location.search]);

  useEffect(() => {
    if (!identity.dialogOpen) return;
    setLocalError("");
    identity.clearError();
  }, [identity.dialogOpen]);

  useEffect(() => {
    if (!identity.dialogOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [identity.dialogOpen]);

  function chooseMode(nextMode: "login" | "create") {
    setMode(nextMode);
    setPin("");
    setConfirmPin("");
    setLocalError("");
    identity.clearError();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");
    if (mode === "create" && pin !== confirmPin) {
      setLocalError("Those PINs do not match.");
      return;
    }

    const success = mode === "create"
      ? await identity.createProfile(displayName, pin)
      : await identity.signIn(displayName, pin);

    if (success) {
      setDisplayName("");
      setPin("");
      setConfirmPin("");
      navigate(returnPath.current, { replace: true });
    }
  }

  const buttonLabel = identity.profile?.displayName ?? "SIGN IN";
  const avatarPhoto = identity.profile ? preferences.avatarPhotoData : null;
  const avatar = identity.profile ? (
    avatarPhoto
      ? <img src={avatarPhoto} alt={`${identity.profile.displayName} avatar`} />
      : identity.profile.initials
  ) : null;
  const dialog = identity.dialogOpen ? createPortal(
    <div className="identity-overlay identity-overlay--viewport" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) identity.closeDialog();
    }}>
      <section className="identity-dialog" role="dialog" aria-modal="true" aria-labelledby="identity-dialog-title">
        <header>
          <div>
            <p className="eyebrow">YOUR OCTAGON HQ PROFILE</p>
            <h2 id="identity-dialog-title">{identity.profile ? identity.profile.displayName : "Get into HQ"}</h2>
            <p>{identity.profile
              ? "This is the one profile your games, picks, challenges, and future HQ features will use."
              : "Use your name and the same personal PIN on every device."}</p>
          </div>
          <button type="button" className="identity-dialog__close" aria-label="Close profile dialog" onClick={identity.closeDialog}>×</button>
        </header>

        {identity.profile ? (
          <div className="identity-profile-card">
            <i>{avatar}</i>
            <span><small>SIGNED IN AS</small><strong>{identity.profile.displayName}</strong></span>
            <div className="identity-profile-card__links">
              {identity.profile.canManagePicks ? (
                <Link className="identity-profile-card__owner-link" to="/picks/control#setup" onClick={identity.closeDialog}>
                  MANAGE PICKS
                </Link>
              ) : null}
              <Link to={memberProfilePath(identity.profile.displayName)} onClick={identity.closeDialog}>VIEW MY PROFILE</Link>
              <Link to="/members" onClick={identity.closeDialog}>BROWSE MEMBERS</Link>
            </div>
            <button type="button" disabled={identity.busy} onClick={() => void identity.signOut()}>SIGN OUT</button>
          </div>
        ) : identity.status === "unconfigured" ? (
          <div className="identity-unavailable">
            <strong>Profiles are ready in the app code.</strong>
            <p>This preview still needs the Octagon HQ Supabase connection before a real profile can be created.</p>
          </div>
        ) : (
          <>
            <div className="identity-mode" role="tablist" aria-label="Profile access">
              <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "is-active" : ""} onClick={() => chooseMode("login")}>I HAVE A PROFILE</button>
              <button type="button" role="tab" aria-selected={mode === "create"} className={mode === "create" ? "is-active" : ""} onClick={() => chooseMode("create")}>I&apos;M NEW</button>
            </div>

            <form className="identity-form" onSubmit={(event) => void submit(event)}>
              <label>
                <span>YOUR NAME</span>
                <input
                  autoComplete="name"
                  maxLength={24}
                  placeholder="CODY"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value.toUpperCase())}
                />
                <small>Just the name your friends know you by.</small>
              </label>
              <label>
                <span>{mode === "create" ? "CHOOSE A 4-DIGIT PIN" : "YOUR 4-DIGIT PIN"}</span>
                <input
                  autoComplete={mode === "create" ? "new-password" : "current-password"}
                  inputMode="numeric"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  placeholder="••••"
                  type="password"
                  value={pin}
                  onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                />
              </label>
              {mode === "create" ? (
                <label>
                  <span>CONFIRM PIN</span>
                  <input
                    autoComplete="new-password"
                    inputMode="numeric"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    placeholder="••••"
                    type="password"
                    value={confirmPin}
                    onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  />
                  <small>You will use this same PIN on Safari, desktop, and the saved app.</small>
                </label>
              ) : null}

              <p className="identity-error" role="status">{localError || identity.error}</p>
              <button className="primary-action" type="submit" disabled={identity.busy}>
                {identity.busy ? "OPENING HQ…" : mode === "create" ? "CREATE PROFILE" : "ENTER HQ"}
              </button>
            </form>

            <p className="identity-help">Forgot your PIN? The app owner can reset it without creating a second account.</p>
          </>
        )}
      </section>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <button
        type="button"
        className={`identity-trigger${identity.profile ? " is-ready" : ""}`}
        onClick={identity.openDialog}
        aria-label={identity.profile ? `Open ${identity.profile.displayName} profile menu` : "Sign in to Octagon HQ"}
      >
        {identity.profile ? <i className="identity-trigger__photo">{avatar}</i> : null}
        <span>{buttonLabel}</span>
      </button>
      {dialog}
    </>
  );
}
