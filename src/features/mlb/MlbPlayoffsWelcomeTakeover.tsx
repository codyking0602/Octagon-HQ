import { useEffect, useState } from "react";
import "../../styles/mlb-playoffs-welcome.css";

const MLB_PLAYOFFS_LAUNCH_VERSION = "2026-v1";
const MLB_PLAYOFFS_PREVIEW_VERSION = "2026-v3";

export type MlbPlayoffsWelcomeMode = "preview" | "launch";

function storageKey(profileId: string, mode: MlbPlayoffsWelcomeMode) {
  const version = mode === "preview" ? MLB_PLAYOFFS_PREVIEW_VERSION : MLB_PLAYOFFS_LAUNCH_VERSION;
  return `octagon-hq:mlb-playoffs-welcome:${version}:${mode}:${profileId}`;
}

export function MlbPlayoffsWelcomeTakeover({
  profileId,
  mode = "launch",
}: {
  profileId: string;
  mode?: MlbPlayoffsWelcomeMode;
}) {
  const [visible, setVisible] = useState(() => {
    try {
      return window.localStorage.getItem(storageKey(profileId, mode)) !== "dismissed";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!visible) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  if (!visible) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(storageKey(profileId, mode), "dismissed");
    } catch {
      // The acknowledgement still closes for this session if storage is unavailable.
    }
    setVisible(false);
  }

  return (
    <div
      className="mlb-welcome-takeover"
      role="dialog"
      aria-modal="true"
      aria-label="MLB Playoff Challenge welcome"
    >
      <div className="mlb-welcome-takeover__poster">
        <img
          src="/assets/mlb/69608B72-2CD3-4A50-A271-8CC234EFBD11.png"
          alt="MLB Playoff Challenge. How can you not be romantic about baseball? Welcome to October at The HQ. Series Picks. Bracket. Featured Challenges. Championship Race."
          draggable={false}
        />

        <button
          className="mlb-welcome-takeover__enter"
          type="button"
          aria-label="Enter the playoffs"
          onClick={dismiss}
        >
          <span>ENTER THE PLAYOFFS</span>
          <b aria-hidden="true">›</b>
        </button>
      </div>
    </div>
  );
}
