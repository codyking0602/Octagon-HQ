import { useEffect, useRef } from "react";
import type { FootballEntrySurface } from "./footballEntrySession";

const REVEAL_TIMEOUT_MS: Record<FootballEntrySurface, number> = {
  play: 4000,
  picks: 4700,
};

const REVEAL_VIDEO: Record<FootballEntrySurface, string> = {
  play: "/assets/football/football-play-reveal.mp4",
  picks: "/assets/football/football-picks-reveal.mp4",
};

export function FootballEntryTransition({
  surface,
  onComplete,
}: {
  surface: FootballEntrySurface;
  onComplete: () => void;
}) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const timer = window.setTimeout(() => onCompleteRef.current(), REVEAL_TIMEOUT_MS[surface]);
    return () => window.clearTimeout(timer);
  }, [surface]);

  return (
    <div className="football-entry-transition" role="presentation" aria-hidden="true">
      <video
        className="football-entry-transition__video"
        src={REVEAL_VIDEO[surface]}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => onCompleteRef.current()}
        onError={() => onCompleteRef.current()}
      />
    </div>
  );
}
