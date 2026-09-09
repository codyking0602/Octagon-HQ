import { useRef } from "react";
import type { FootballEntrySurface } from "./footballEntrySession";

const REVEAL_VIDEO_BY_SURFACE: Record<FootballEntrySurface, string> = {
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

  return (
    <div className="football-entry-transition" role="presentation">
      <video
        className="football-entry-transition__video"
        data-testid={`football-entry-${surface}`}
        src={REVEAL_VIDEO_BY_SURFACE[surface]}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onEnded={() => onCompleteRef.current()}
        onError={() => onCompleteRef.current()}
      />
    </div>
  );
}
