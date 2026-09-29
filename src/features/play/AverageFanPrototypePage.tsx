import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AVERAGE_FAN_REPORT_CARDS,
  AVERAGE_FAN_SUBJECTS,
  type AverageFanFan,
  type AverageFanReportGrade,
} from "../games/averageFanEngine";
import "./AverageFanPrototypePage.css";

type PrototypeScene = "intro" | "fan-select";

const FAN_ORDER: readonly AverageFanFan[] = ["shane", "cody", "lib", "tyler", "troy"];
const FAN_LABELS: Record<AverageFanFan, string> = {
  shane: "SHANE",
  cody: "CODY",
  lib: "LIB",
  tyler: "TYLER",
  troy: "TROY",
};

function AverageFanLogo() {
  return (
    <div className="average-fan-logo" aria-label="Are You Smarter Than an Average Fan?">
      <span className="average-fan-logo__top">ARE YOU</span>
      <strong className="average-fan-logo__hero">SMARTER</strong>
      <span className="average-fan-logo__mid">THAN AN</span>
      <strong className="average-fan-logo__bottom">AVERAGE FAN?</strong>
    </div>
  );
}

function ChalkDoodles() {
  return (
    <div className="average-fan-chalk" aria-hidden="true">
      <span className="average-fan-chalk__football">Football</span>
      <span className="average-fan-chalk__ufc">UFC</span>
      <span className="average-fan-chalk__college">College<br />Sports</span>
      <i className="average-fan-chalk__ball" />
      <i className="average-fan-chalk__goalpost" />
      <i className="average-fan-chalk__glove">✦</i>
      <i className="average-fan-chalk__route route-a">↗</i>
      <i className="average-fan-chalk__route route-b">↙</i>
      <i className="average-fan-chalk__route route-c">↘</i>
    </div>
  );
}

function HostArt() {
  return (
    <div className="average-fan-host" aria-label="Pat McAfee host">
      <div className="average-fan-host__hair" />
      <div className="average-fan-host__head">
        <i className="average-fan-host__eye eye-left" />
        <i className="average-fan-host__eye eye-right" />
        <i className="average-fan-host__smile" />
      </div>
      <div className="average-fan-host__neck" />
      <div className="average-fan-host__torso">
        <span className="average-fan-host__lapel lapel-left" />
        <span className="average-fan-host__lapel lapel-right" />
        <span className="average-fan-host__shirt" />
      </div>
      <div className="average-fan-host__arm">
        <span className="average-fan-host__hand" />
      </div>
      <span className="average-fan-host__watch" />
    </div>
  );
}

function StudioBackdrop() {
  return (
    <div className="average-fan-studio" aria-hidden="true">
      <i className="average-fan-light light-one" />
      <i className="average-fan-light light-two" />
      <i className="average-fan-light light-three" />
      <i className="average-fan-light light-four" />
      <div className="average-fan-stands" />
    </div>
  );
}

function StudioProps() {
  return (
    <div className="average-fan-props" aria-hidden="true">
      <div className="average-fan-books">
        <span>FOOTBALL</span>
        <span>UFC</span>
        <span>COLLEGE SPORTS</span>
      </div>
      <div className="average-fan-football" />
      <div className="average-fan-mug">FOR<br />THE<br />FANS.</div>
      <div className="average-fan-nameplate">FOR THE FANS</div>
      <div className="average-fan-mini-player">1</div>
    </div>
  );
}

function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="average-fan-rules-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="average-fan-rules"
        role="dialog"
        aria-modal="true"
        aria-labelledby="average-fan-rules-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="average-fan-rules__close" type="button" onClick={onClose} aria-label="Close how to play">×</button>
        <p>HOW TO PLAY</p>
        <h2 id="average-fan-rules-title">ARE YOU SMARTER THAN AN AVERAGE FAN?</h2>
        <div className="average-fan-rules__grid">
          <article><b>1</b><span><strong>Pick your fan.</strong> Your fan is locked for the whole run.</span></article>
          <article><b>2</b><span><strong>Work the board.</strong> Choose any of the 10 grade-and-subject tiles.</span></article>
          <article><b>3</b><span><strong>Use your help.</strong> Peek, Copy and Save are each available once.</span></article>
          <article><b>4</b><span><strong>Make the final call.</strong> After 10 questions, see the Final subject and choose whether to walk or go for $1,000,000.</span></article>
        </div>
      </section>
    </div>
  );
}

function FanAvatar({ fan, large = false }: { fan: AverageFanFan; large?: boolean }) {
  const hasGlasses = fan === "shane" || fan === "cody";
  return (
    <span
      className={`average-fan-avatar average-fan-avatar--${fan}${large ? " is-large" : ""}`}
      aria-hidden="true"
    >
      <i className="average-fan-avatar__hair" />
      <i className="average-fan-avatar__head">
        <b className="average-fan-avatar__eye eye-a" />
        <b className="average-fan-avatar__eye eye-b" />
        {hasGlasses ? <b className="average-fan-avatar__glasses" /> : null}
        <b className="average-fan-avatar__smile" />
      </i>
      <i className="average-fan-avatar__body" />
    </span>
  );
}

function FanCard({
  fan,
  selected,
  onSelect,
}: {
  fan: AverageFanFan;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`average-fan-card average-fan-card--${fan}${selected ? " is-selected" : ""}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <FanAvatar fan={fan} />
      <strong>{FAN_LABELS[fan]}</strong>
    </button>
  );
}

function FanSelector({ onBack }: { onBack: () => void }) {
  const [selectedFan, setSelectedFan] = useState<AverageFanFan>("shane");
  const [confirmed, setConfirmed] = useState(false);
  const sport = "ufc" as const;

  const rows = useMemo(() => {
    const subjects = AVERAGE_FAN_SUBJECTS[sport];
    const report = AVERAGE_FAN_REPORT_CARDS[sport][selectedFan] as Record<string, AverageFanReportGrade>;
    return subjects.map((subject) => ({ subject, grade: report[subject] }));
  }, [selectedFan]);

  function chooseFan(fan: AverageFanFan) {
    setSelectedFan(fan);
    setConfirmed(false);
  }

  return (
    <div className="average-fan-selector">
      <StudioBackdrop />
      <button className="average-fan-exit" type="button" onClick={onBack} aria-label="Back to opening screen">‹ BACK</button>

      <section className="average-fan-selector-board" aria-labelledby="average-fan-selector-title">
        <div className="average-fan-selector-title" id="average-fan-selector-title">Select Your Fan</div>

        <div className="average-fan-card-grid" aria-label="Fans">
          {FAN_ORDER.map((fan) => (
            <FanCard
              key={fan}
              fan={fan}
              selected={fan === selectedFan}
              onSelect={() => chooseFan(fan)}
            />
          ))}
        </div>

        <section className="average-fan-report" aria-label={`${FAN_LABELS[selectedFan]} UFC report card`}>
          <h2>{FAN_LABELS[selectedFan]}</h2>
          <span className="average-fan-report__underline" aria-hidden="true" />
          <div className="average-fan-report__rows">
            {rows.map(({ subject, grade }) => (
              <div className="average-fan-report__row" key={subject}>
                <span>{subject}</span>
                <strong data-grade={grade}>{grade}</strong>
              </div>
            ))}
          </div>
        </section>

        <div className="average-fan-selector-hero">
          <span className="average-fan-selector-crown" aria-hidden="true">♛</span>
          <FanAvatar fan={selectedFan} large />
          <span className="average-fan-selector-pedestal" aria-hidden="true" />
        </div>

        <button
          className={`average-fan-select-button${confirmed ? " is-confirmed" : ""}`}
          type="button"
          onClick={() => setConfirmed(true)}
        >
          <span aria-hidden="true">{confirmed ? "✓" : "▶"}</span>
          {confirmed ? "FAN SELECTED" : "SELECT FAN"}
        </button>
      </section>

      <StudioProps />
    </div>
  );
}

export default function AverageFanPrototypePage() {
  const navigate = useNavigate();
  const [scene, setScene] = useState<PrototypeScene>("intro");
  const [rulesOpen, setRulesOpen] = useState(false);

  if (scene === "fan-select") {
    return <FanSelector onBack={() => setScene("intro")} />;
  }

  return (
    <div className="average-fan-intro">
      <button
        className="average-fan-exit"
        type="button"
        onClick={() => navigate("/play")}
        aria-label="Exit Average Fan preview"
      >
        ‹ HQ
      </button>

      <StudioBackdrop />

      <section className="average-fan-board" aria-label="Average Fan opening screen">
        <ChalkDoodles />
        <AverageFanLogo />
        <p className="average-fan-tagline">Pick your fan. Work the board. Go for $1,000,000.</p>
      </section>

      <HostArt />
      <StudioProps />

      <div className="average-fan-intro-actions">
        <button
          className="average-fan-intro-button average-fan-intro-button--start"
          type="button"
          onClick={() => setScene("fan-select")}
        >
          <span aria-hidden="true">▶</span>
          START
        </button>
        <button
          className="average-fan-intro-button average-fan-intro-button--rules"
          type="button"
          onClick={() => setRulesOpen(true)}
        >
          <span aria-hidden="true">▤</span>
          HOW TO PLAY
        </button>
      </div>

      {rulesOpen ? <RulesModal onClose={() => setRulesOpen(false)} /> : null}
    </div>
  );
}
