import { useEffect, useState } from "react";
import "../../styles/mlb-playoffs-welcome.css";

const MLB_PLAYOFFS_LAUNCH_VERSION = "2026-v1";
const MLB_PLAYOFFS_PREVIEW_VERSION = "2026-v2";

export type MlbPlayoffsWelcomeMode = "preview" | "launch";

function storageKey(profileId: string, mode: MlbPlayoffsWelcomeMode) {
  const version = mode === "preview" ? MLB_PLAYOFFS_PREVIEW_VERSION : MLB_PLAYOFFS_LAUNCH_VERSION;
  return `octagon-hq:mlb-playoffs-welcome:${version}:${mode}:${profileId}`;
}

function Icon({ kind }: { kind: "series" | "bracket" | "challenges" | "race" }) {
  if (kind === "series") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M4 5h8v7H4M4 20h8v7H4M12 8.5h6v7M12 23.5h6v-8M18 15.5h10" />
      </svg>
    );
  }

  if (kind === "bracket") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M9 5h14v5c0 5-3.1 8.7-7 8.7S9 15 9 10V5Z" />
        <path d="M9 8H5v2c0 3 1.7 5 5 5M23 8h4v2c0 3-1.7 5-5 5M16 18.7V25M11 27h10" />
      </svg>
    );
  }

  if (kind === "challenges") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect x="5" y="4" width="22" height="24" rx="3" />
        <path d="m9 11 2 2 4-5M17 11h6M9 19l2 2 4-5M17 19h6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M6 26V17h5v9M14 26V11h5v15M22 26V5h5v21" />
    </svg>
  );
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
      aria-labelledby="mlb-welcome-title"
    >
      <div className="mlb-welcome-takeover__background" aria-hidden="true" />
      <div className="mlb-welcome-takeover__scrim" aria-hidden="true" />

      <div className="mlb-welcome-takeover__content">
        <section className="mlb-welcome-takeover__quote">
          <span aria-hidden="true">“</span>
          <blockquote aria-label="How can you not be romantic about baseball?">
            <span className="mlb-welcome-takeover__quote-line">How can you not be romantic</span>{" "}
            <span className="mlb-welcome-takeover__quote-line">about baseball?</span>
          </blockquote>
          <span aria-hidden="true">”</span>
        </section>

        <section className="mlb-welcome-takeover__heading">
          <div className="mlb-welcome-takeover__logo-row" aria-hidden="true">
            <i />
            <img src="/assets/MLB.webp" alt="" />
            <i />
          </div>
          <h1 id="mlb-welcome-title">
            <small>MLB</small>
            <strong>PLAYOFF</strong>
            <span>CHALLENGE</span>
          </h1>
          <p>Welcome to October at The HQ.</p>
        </section>

        <section className="mlb-welcome-takeover__features" aria-label="MLB Playoff Challenge overview">
          <article>
            <Icon kind="series" />
            <div>
              <strong>Series Picks</strong>
              <p>Pick every playoff series as the bracket unfolds.</p>
            </div>
          </article>

          <article>
            <Icon kind="bracket" />
            <div>
              <strong>Bracket</strong>
              <p>Lock in your full postseason bracket before the playoffs begin.</p>
            </div>
          </article>

          <article>
            <Icon kind="challenges" />
            <div>
              <strong>Featured Challenges</strong>
              <p>Play 10 baseball-themed challenges released throughout the postseason.</p>
            </div>
          </article>

          <article>
            <Icon kind="race" />
            <div>
              <strong>Championship Race</strong>
              <p>Your MLB Playoff Challenge score is built from Series Picks, Bracket Picks, and Featured Challenge results.</p>
            </div>
          </article>
        </section>

        <button className="mlb-welcome-takeover__enter" type="button" onClick={dismiss}>
          <span>ENTER THE PLAYOFFS</span>
          <b aria-hidden="true">›</b>
        </button>
      </div>
    </div>
  );
}
