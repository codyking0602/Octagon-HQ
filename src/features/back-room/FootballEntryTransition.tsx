import { useEffect, useRef, useState } from "react";
import type { FootballEntrySurface } from "./footballEntrySession";

const PICKS_REVEAL_MS = 3600;
const PLAY_SLAM_MS = 1200;
const FOOTBALL_HQ_SLAM_FRAME = "/assets/football/football-picks-reveal-04.jpg";
const picksRevealFrames = [
  "/assets/football/football-picks-reveal-01.jpg",
  "/assets/football/football-picks-reveal-02.jpg",
  "/assets/football/football-picks-reveal-03.jpg",
  FOOTBALL_HQ_SLAM_FRAME,
] as const;

export function FootballEntryTransition({
  surface,
  onComplete,
}: {
  surface: FootballEntrySurface;
  onComplete: () => void;
}) {
  const onCompleteRef = useRef(onComplete);
  const [playSlam, setPlaySlam] = useState(false);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (surface === "picks") {
      const timer = window.setTimeout(() => onCompleteRef.current(), PICKS_REVEAL_MS);
      return () => window.clearTimeout(timer);
    }
    if (playSlam) {
      const timer = window.setTimeout(() => onCompleteRef.current(), PLAY_SLAM_MS);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [playSlam, surface]);

  if (surface === "play") {
    return (
      <div className="football-entry-transition" role="presentation">
        {playSlam ? (
          <img
            className="football-entry-transition__frame football-entry-transition__slam"
            src={FOOTBALL_HQ_SLAM_FRAME}
            alt=""
            draggable={false}
            aria-hidden="true"
          />
        ) : (
          <video
            className="football-entry-transition__video"
            src="/assets/football/vince-young-championship-run.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            onEnded={() => setPlaySlam(true)}
            onError={() => setPlaySlam(true)}
          />
        )}
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
