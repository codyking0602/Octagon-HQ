import { useEffect, useRef } from "react";
import type { FootballEntrySurface } from "./footballEntrySession";

const PICKS_REVEAL_MS = 3600;
const picksRevealFrames = [
  "/assets/football/football-picks-reveal-01.jpg",
  "/assets/football/football-picks-reveal-02.jpg",
  "/assets/football/football-picks-reveal-03.jpg",
  "/assets/football/football-picks-reveal-04.jpg",
] as const;

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
    if (surface !== "picks") return undefined;
    const timer = window.setTimeout(() => onCompleteRef.current(), PICKS_REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [surface]);

  if (surface === "play") {
    return (
      <div className="football-entry-transition" role="presentation">
        <video
          className="football-entry-transition__video"
          src="/assets/football/vince-young-championship-run.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onEnded={onComplete}
          onError={onComplete}
        />
      </div>
    );
  }

  return (
    <div
      className="football-entry-transition football-entry-transition--picks"
      role="presentation"
      aria-hidden="true"
    >
      {picksRevealFrames.map((src, index) => (
        <img
          key={src}
          className={`football-entry-transition__frame football-entry-transition__frame--${index + 1}`}
          src={src}
          alt=""
          draggable={false}
        />
      ))}
    </div>
  );
}
