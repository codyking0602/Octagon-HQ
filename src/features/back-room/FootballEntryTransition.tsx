import { useEffect, useRef, useState } from "react";
import type { FootballEntrySurface } from "./footballEntrySession";

const PLAY_SLAM_MS = 1200;
const PICKS_REVEAL_VIDEO = "/assets/football/football-picks-reveal.mp4";
const PLAY_REVEAL_VIDEO = "/assets/football/vince-young-championship-run.mp4";

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
    if (!playSlam) return undefined;
    const timer = window.setTimeout(() => onCompleteRef.current(), PLAY_SLAM_MS);
    return () => window.clearTimeout(timer);
  }, [playSlam]);

  if (surface === "play") {
    return (
      <div className="football-entry-transition" role="presentation">
        {playSlam ? (
          <div
            className="football-entry-transition__hq-card"
            data-testid="football-entry-play-slam"
            aria-hidden="true"
          >
            <div className="football-entry-transition__hq-wordmark">
              <span>FOOTBALL</span>
              <strong>HQ</strong>
            </div>
            <img
              className="football-entry-transition__hq-helmet football-entry-transition__hq-helmet--cowboys"
              src="/assets/football/cowboys-helmet.webp"
              alt=""
              draggable={false}
            />
            <img
              className="football-entry-transition__hq-helmet football-entry-transition__hq-helmet--longhorns"
              src="/assets/football/longhorns-helmet.webp"
              alt=""
              draggable={false}
            />
          </div>
        ) : (
          <video
            className="football-entry-transition__video"
            data-testid="football-entry-play"
            src={PLAY_REVEAL_VIDEO}
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
    <div className="football-entry-transition" role="presentation">
      <video
        className="football-entry-transition__video"
        data-testid="football-entry-picks"
        src={PICKS_REVEAL_VIDEO}
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
