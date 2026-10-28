import { useEffect, useState } from "react";
import { useIdentity } from "../features/identity/IdentityProvider";
import { getSupabaseClient } from "../lib/supabase";
import "../styles/hit-number-update-notice.css";

const NOTICE_KEY = "hit-number-tiebreak-2026-09-18";

export function HitTheNumberUpdateNotice() {
  const identity = useIdentity();
  const profileId = identity.profile?.id ?? null;
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client || !profileId) {
      setVisible(false);
      return undefined;
    }

    let active = true;
    setVisible(false);

    void client
      .rpc("get_my_app_notice_state", { p_notice_key: NOTICE_KEY })
      .then(({ data, error }) => {
        if (!active || error) return;
        const pending = Boolean(
          data
          && typeof data === "object"
          && "pending" in data
          && data.pending === true,
        );
        setVisible(pending);
      });

    return () => {
      active = false;
    };
  }, [profileId]);

  async function acknowledge() {
    if (saving) return;

    const client = getSupabaseClient();
    if (!client || !profileId) return;

    setSaving(true);
    const { data, error } = await client.rpc("acknowledge_my_app_notice", {
      p_notice_key: NOTICE_KEY,
    });

    if (!error && data && typeof data === "object" && "acknowledged" in data) {
      setVisible(false);
    }

    setSaving(false);
  }

  if (!visible) return null;

  return (
    <div className="hit-number-update-notice__layer" role="presentation">
      <section
        className="hit-number-update-notice"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hit-number-update-title"
        aria-describedby="hit-number-update-intro"
      >
        <button
          type="button"
          className="hit-number-update-notice__close"
          aria-label="Dismiss Hit the Number update"
          disabled={saving}
          onClick={() => void acknowledge()}
        >
          <span aria-hidden="true">×</span>
        </button>

        <header className="hit-number-update-notice__header">
          <span className="hit-number-update-notice__megaphone" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <path d="M6 21v7h8l17 8V13l-17 8H6Z" />
              <path d="m14 28 4 11h7l-5-9" />
              <path d="M36 17l6-5M38 24h7M36 31l6 5" />
            </svg>
          </span>
          <h2 id="hit-number-update-title">Hit the Number Update</h2>
        </header>

        <p id="hit-number-update-intro" className="hit-number-update-notice__intro">
          We’ve updated how ties are handled in Hit the Number to make things more
          competitive and fair.
        </p>

        <div className="hit-number-update-notice__panel">
          <span className="hit-number-update-notice__panel-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="14" />
              <circle cx="24" cy="24" r="7" />
              <path d="M24 4v8M24 36v8M4 24h8M36 24h8" />
            </svg>
          </span>
          <div>
            <h3>Tiebreaker</h3>
            <p>
              If multiple players have the same score, the win now goes to the player{" "}
              <strong>closest to the target number.</strong>
            </p>
          </div>
        </div>

        <div className="hit-number-update-notice__panel">
          <span className="hit-number-update-notice__panel-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <path d="M9 38V28M20 38V21M31 38V13M42 38V6" />
            </svg>
          </span>
          <div>
            <h3>Recent Update</h3>
            <p>
              This change has been applied retroactively.{" "}
              <strong>
                Shane has been awarded the September 17 win, and Lib’s win has been removed.
              </strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          className="hit-number-update-notice__confirm"
          disabled={saving}
          onClick={() => void acknowledge()}
        >
          {saving ? "SAVING…" : "GOT IT"}
        </button>
      </section>
    </div>
  );
}
