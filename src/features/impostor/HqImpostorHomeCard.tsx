import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { createHqImpostorRepository, type HqImpostorState } from "./hqImpostorRepository";
import { hqImpostorV1Window } from "./hqImpostorSchedule";
import { hqImpostorV1Window } from "./hqImpostorSchedule";
import "../../styles/hq-impostor.css";

function statusCopy(state: HqImpostorState | null) {
  const event = state?.event;
  if (!event) return { badge: "NEW", title: "START A GROUP", detail: "4 rounds · 4–8 players" };
  if (event.status === "completed") {
    const me = event.standings.find((standing) => event.members.find((member) => member.profile_id === standing.profile_id)?.is_current_user);
    return {
      badge: "FINAL",
      title: me ? `#${me.rank} · ${me.total_score} PTS` : "EVENT COMPLETE",
      detail: "Final standings are locked",
    };
  }

  const round = event.current_round;
  const phase = round.phase === "assignment"
    ? "ASSIGNMENT READY"
    : round.phase === "clue"
      ? "CLUE DUE"
      : round.phase === "clue_locked"
        ? "WAITING ON CLUES"
        : round.phase === "board_ready"
          ? "CLUES READY"
          : round.phase === "vote"
            ? "VOTE NOW"
            : round.phase === "vote_locked"
              ? "WAITING ON VOTES"
              : round.phase === "resolved"
                ? "REVEAL READY"
                : round.phase === "inactive"
                  ? "ROUND MISSED"
                  : "NEXT ROUND";

  return {
    badge: round.is_final_round ? "FINALE" : `ROUND ${round.round_no}`,
    title: phase,
    detail: `${round.sport === "CFB" ? "CFB" : round.sport} · ${round.category}`,
  };
}

export function HqImpostorHomeCard() {
  const identity = useIdentity();
  const rollout = hqImpostorV1Window();
  const signedIn = identity.status === "ready" && Boolean(identity.profile?.id);
  const repository = useMemo(() => createHqImpostorRepository(), []);
  const [state, setState] = useState<HqImpostorState | null>(null);
  const launchWindow = hqImpostorV1Window();

  useEffect(() => {
    let active = true;
    if (launchWindow.before || !signedIn || !repository) return () => { active = false; };

    const load = () => {
      repository.load()
        .then((next) => {
          if (active) setState(next);
        })
        .catch(() => undefined);
    };
    load();
    const timer = window.setInterval(load, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [signedIn, repository]);

  if (rollout.before || (rollout.after && !state?.event)) return null;

  if (launchWindow.before) return null;

  const copy = signedIn
    ? statusCopy(state)
    : { badge: "FEATURED", title: "KNOW THE SPORT. FOOL THE ROOM.", detail: "4–8 players · 4 rounds" };

  return (
    <Link className="home-impostor-card" to="/impostor" aria-label="Open HQ Impostor">
      <span className="home-impostor-card__mark" aria-hidden="true">?</span>
      <span className="home-impostor-card__copy">
        <small>HQ IMPOSTOR · FEATURED CHALLENGE</small>
        <strong>{copy.title}</strong>
        <em>{copy.detail}</em>
      </span>
      <span className="home-impostor-card__status">
        <b>{copy.badge}</b>
        <i>PLAY →</i>
      </span>
    </Link>
  );
}
