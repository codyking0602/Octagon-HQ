import { useState } from "react";
import "../../styles/football-tab-entry-transition.css";

export type FootballTabEntryClip = "vince" | "zeke";

const FOOTBALL_ENTRY_CLIPS: Record<FootballTabEntryClip, string> = {
  vince: "/assets/football/vince-young-sideline-run.mp4",
  zeke: "/assets/football/ezekiel-elliott-steelers-run.mp4",
};

export function FootballTabEntryTransition({
  clip,
  onComplete,
}: {
  clip: FootballTabEntryClip;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<"clip" | "slam">("clip");

  return (
    <div className="football-tab-entry-transition" role="presentation" data-phase={phase}>
      {phase === "clip" ? (
        <video
          className="football-tab-entry-transition__video"
          src={FOOTBALL_ENTRY_CLIPS[clip]}
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onEnded={() => setPhase("slam")}
        />
      ) : (
        <div className="football-tab-entry-transition__slam" aria-hidden="true">
          <img
            className="football-tab-entry-transition__backdrop"
            src="/assets/football/football-hq-cover.jpg"
            alt=""
          />
          <span className="football-tab-entry-transition__impact" />
          <img
            className="football-tab-entry-transition__cover"
            src="/assets/football/football-hq-cover.jpg"
            alt=""
            onAnimationEnd={(event) => {
              if (event.animationName === "football-hq-cover-slam") onComplete();
            }}
          />
        </div>
      )}
    </div>
  );
}
