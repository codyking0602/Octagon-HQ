import { useState } from "react";
import {
  AverageFanGame,
  FanSelector,
  RulesModal,
  useAverageFanOpeningStageScale,
  useAverageFanScreenLock,
  type AverageFanSettledResult,
} from "../play/AverageFanPrototypePage";
import type { AverageFanFan } from "../games/averageFanEngine";
import type { MlbAverageFanProductionConfig } from "./mlbAverageFanProduction";

type Scene = "intro" | "fan-select" | "game";

export default function MlbAverageFanChallenge({
  config,
  onExit,
  onSettled,
}: {
  config: MlbAverageFanProductionConfig;
  onExit: () => void;
  onSettled: (result: AverageFanSettledResult) => void;
}) {
  useAverageFanScreenLock();
  const openingStageScale = useAverageFanOpeningStageScale();
  const [scene, setScene] = useState<Scene>("intro");
  const [fan, setFan] = useState<AverageFanFan>("shane");
  const [gameKey, setGameKey] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);

  if (scene === "fan-select") {
    return (
      <FanSelector
        sport="mlb"
        onBack={() => setScene("intro")}
        onConfirm={(selectedFan) => {
          setFan(selectedFan);
          setScene("game");
        }}
      />
    );
  }

  if (scene === "game") {
    return (
      <AverageFanGame
        key={gameKey}
        fan={fan}
        questions={config.questions}
        finalQuestion={config.finalQuestion}
        onSettled={onSettled}
        onExit={onExit}
        onRestart={() => {
          setGameKey((value) => value + 1);
          setScene("fan-select");
        }}
      />
    );
  }

  return (
    <div className="average-fan-intro average-fan-intro--plate">
      <section
        className="average-fan-intro-stage"
        aria-label="Are You Smarter Than an Average Fan? opening screen"
        style={{ transform: `translate(-50%, -50%) scale(${openingStageScale})` }}
      >
        <img
          className="average-fan-intro-stage__plate"
          src="/assets/average-fan/average-fan-opening-stage.png"
          alt=""
          aria-hidden="true"
        />

        <div className="average-fan-intro-stage__actions">
          <button
            className="average-fan-intro-stage__button average-fan-intro-stage__button--start"
            type="button"
            onClick={() => setScene("fan-select")}
          >
            <span aria-hidden="true">▶</span>
            <strong>START</strong>
          </button>
          <button
            className="average-fan-intro-stage__button average-fan-intro-stage__button--rules"
            type="button"
            onClick={() => setRulesOpen(true)}
          >
            <span aria-hidden="true">▤</span>
            <strong>HOW TO PLAY</strong>
          </button>
        </div>
      </section>

      <button
        className="average-fan-exit"
        type="button"
        onClick={onExit}
        aria-label="Exit MLB Average Fan"
      >
        ‹ MLB PLAY
      </button>

      {rulesOpen ? <RulesModal onClose={() => setRulesOpen(false)} /> : null}
    </div>
  );
}
