import { useEffect, useRef, useState } from "react";
import {
  MILLIONAIRE_LEVELS,
  MILLIONAIRE_MONEY_BY_LEVEL,
  type MillionaireChoiceId,
} from "../games/millionaireAuthority";
import {
  MILLIONAIRE_BASE_PTS,
  MILLIONAIRE_HOSTS,
  MILLIONAIRE_TIME_BANK_MS,
  millionaireLeagueLabel,
  millionaireMoneyLabel,
  millionaireTimeLabel,
  type MillionaireLeague,
} from "./MillionaireCasualModel";
import type { TodayChallengeProjection } from "./todayChallengeRepository";
import "./MillionaireCasualPage.css";
import "./MillionaireCasualPolish.css";
import "./MillionairePortrait.css";
import "./MillionairePortraitRefine.css";
import "./MillionaireFixedStage.css";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    : [];
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((row): row is string => typeof row === "string") : [];
}

function useMillionaireStageScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const sync = () => {
      const width = window.visualViewport?.width ?? window.innerWidth;
      const height = window.visualViewport?.height ?? window.innerHeight;
      setScale(Math.min(width / 1600, height / 900));
    };
    sync();
    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
    };
  }, []);
  return scale;
}

function officialResult(projection: TodayChallengeProjection) {
  const result = projection.officialAttempt?.publicResult ?? {};
  return {
    outcome: String(result.outcome ?? "lost"),
    finalMoney: Number(result.final_money ?? 0),
    completedQuestions: Number(result.completed_questions ?? 0),
    lifelinesUsed: Number(result.lifelines_used ?? 0),
    timeRemainingMs: Number(result.time_remaining_ms ?? 0),
    score: projection.officialAttempt?.normalizedScore ?? Number(result.score ?? 0),
  };
}

export function OfficialMillionaireDailyView({
  projection,
  busy,
  onAdvance,
  onExit,
}: {
  projection: TodayChallengeProjection;
  busy: boolean;
  onAdvance: (action: JsonRecord) => void;
  onExit?: () => void;
}) {
  const setup = projection.publicSetup;
  const state = projection.publicState;
  const questions = records(setup.questions);
  const league = String(setup.league ?? (projection.sport === "football" ? "cfb" : "ufc")) as MillionaireLeague;
  const status = String(state.status ?? "playing");
  const currentIndex = Math.min(7, Math.max(0, Number(state.current_question_index ?? 0)));
  const completedQuestions = Math.min(8, Math.max(0, Number(state.completed_questions ?? 0)));
  const question = questions[currentIndex] ?? {};
  const choices = records(question.choices);
  const level = MILLIONAIRE_LEVELS[currentIndex]!;
  const questionState = record(state.question_state);
  const lifelinesUsed = record(state.lifelines_used);
  const removedChoices = strings(questionState.removed_choice_ids);
  const doubleDipMisses = strings(questionState.double_dip_wrong_choice_ids);
  const stageScale = useMillionaireStageScale();
  const initialTime = Math.min(
    MILLIONAIRE_TIME_BANK_MS,
    Math.max(0, Number(state.time_remaining_ms ?? MILLIONAIRE_TIME_BANK_MS)),
  );
  const [timeRemainingMs, setTimeRemainingMs] = useState(initialTime);
  const [walkPromptOpen, setWalkPromptOpen] = useState(
    currentIndex === 7 && completedQuestions === 7 && status === "playing",
  );
  const [statSheetOpen, setStatSheetOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(
    projection.progressRevision === 0 && !projection.officialAttempt && status === "playing",
  );
  const timeoutSent = useRef(false);
  const priorIndex = useRef(currentIndex);

  useEffect(() => {
    document.body.classList.add("millionaire-daily-active");
    return () => document.body.classList.remove("millionaire-daily-active");
  }, []);

  useEffect(() => {
    setTimeRemainingMs(Math.min(
      MILLIONAIRE_TIME_BANK_MS,
      Math.max(0, Number(state.time_remaining_ms ?? MILLIONAIRE_TIME_BANK_MS)),
    ));
    timeoutSent.current = false;
  }, [projection.progressRevision, state.time_remaining_ms]);

  useEffect(() => {
    if (currentIndex === 7 && completedQuestions === 7 && status === "playing" && priorIndex.current !== 7) {
      setWalkPromptOpen(true);
    }
    if (currentIndex !== 7) setWalkPromptOpen(false);
    priorIndex.current = currentIndex;
  }, [completedQuestions, currentIndex, status]);

  const lifelineReveal = record(state.last_lifeline_reveal);
  useEffect(() => {
    if (lifelineReveal.type === "stat-sheet" && typeof lifelineReveal.text === "string") {
      setStatSheetOpen(true);
    }
  }, [projection.progressRevision, lifelineReveal.text, lifelineReveal.type]);

  useEffect(() => {
    if (rulesOpen || projection.officialAttempt || status !== "playing" || busy || walkPromptOpen || timeRemainingMs <= 0) return;
    const started = performance.now();
    const starting = timeRemainingMs;
    const id = window.setInterval(() => {
      setTimeRemainingMs(Math.max(0, starting - (performance.now() - started)));
    }, 100);
    return () => window.clearInterval(id);
  }, [busy, currentIndex, projection.officialAttempt, rulesOpen, status, walkPromptOpen]);

  useEffect(() => {
    if (rulesOpen || projection.officialAttempt || status !== "playing" || busy || timeRemainingMs > 0 || timeoutSent.current) return;
    timeoutSent.current = true;
    onAdvance({ type: "timeout", time_remaining_ms: 0 });
  }, [busy, onAdvance, projection.officialAttempt, rulesOpen, status, timeRemainingMs]);

  const hostNumber = Math.min(3, Math.max(1, Math.trunc(Number(setup.host_number ?? 1))));
  const stageBackground = MILLIONAIRE_HOSTS[league][hostNumber - 1] ?? MILLIONAIRE_HOSTS[league][0];
  const timerUrgency = timeRemainingMs <= 15_000 ? " is-critical" : timeRemainingMs <= 35_000 ? " is-low" : "";
  const q8 = currentIndex === 7;
  const currentMoney = Number(state.current_money ?? 0);
  const result = projection.officialAttempt ? officialResult(projection) : null;

  const advance = (action: JsonRecord) => {
    if (busy || projection.officialAttempt) return;
    onAdvance({ ...action, time_remaining_ms: Math.max(0, Math.floor(timeRemainingMs)) });
  };

  if (rulesOpen) {
    return (
      <div className="millionaire-shell millionaire-shell--rules">
        <div className="millionaire-arena" aria-hidden="true" />
        <div className="millionaire-crowd" aria-hidden="true" />
        <section className="millionaire-rules" aria-labelledby="millionaire-daily-rules-title">
          <header>
            <span>{millionaireLeagueLabel(league)} DAILY</span>
            <h1 id="millionaire-daily-rules-title">MILLIONAIRE</h1>
            <p>8 questions. $500 to $1,000,000.</p>
          </header>
          <div className="millionaire-rules__body">
            <section className="millionaire-rules__ladder" aria-label="Money and points ladder">
              {MILLIONAIRE_LEVELS.slice().reverse().map((ruleLevel, reverseIndex) => {
                const index = 7 - reverseIndex;
                const checkpoint = ruleLevel === "Q3" || ruleLevel === "Q6";
                return (
                  <div key={ruleLevel} className={checkpoint ? "is-checkpoint" : ""}>
                    <b>{index + 1}</b>
                    <strong>{millionaireMoneyLabel(MILLIONAIRE_MONEY_BY_LEVEL[ruleLevel])}</strong>
                    <span>{MILLIONAIRE_BASE_PTS[ruleLevel]} PTS</span>
                    {checkpoint ? <small>CHECKPOINT</small> : null}
                  </div>
                );
              })}
            </section>
            <section className="millionaire-rules__how" aria-label="How to play">
              <h2>HOW TO PLAY</h2>
              <div className="millionaire-rules__quick">
                <p><strong>2:30 TIME BANK</strong><span>Shared across all 8. Time only breaks leaderboard ties.</span></p>
                <p><strong>$5,000 CHECKPOINT</strong><span>Clear Q3. Miss Q4–Q6: leave with $5,000.</span></p>
                <p><strong>$100,000 CHECKPOINT</strong><span>Clear Q6. Miss Q7–Q8: leave with $100,000.</span></p>
                <p><strong>WALK AWAY</strong><span>Before Q8, bank $500,000 / 90 PTS or risk the checkpoint for $1,000,000 / 100 PTS.</span></p>
              </div>
              <h3>LIFELINES</h3>
              <div className="millionaire-rules__lifelines">
                <p><b>50:50</b><span>Remove 2 wrong answers.</span></p>
                <p><b>STAT SHEET</b><span>Extra clue.</span></p>
                <p><b>DOUBLE DIP</b><span>2 attempts; no walk-away.</span></p>
              </div>
              <small>Each lifeline can be used once and costs 2 PTS. No lifelines on Q8. 50:50 and Double Dip cannot be used on the same question.</small>
            </section>
          </div>
          <button className="millionaire-rules__start" type="button" onClick={() => setRulesOpen(false)}>START GAME</button>
        </section>
      </div>
    );
  }

  return (
    <div className={`millionaire-shell millionaire-shell--game millionaire-shell--fixed-stage millionaire-shell--${league} millionaire-shell--${level.toLowerCase()} millionaire-shell--answering`}>
      <div className="millionaire-stage-canvas" style={{ transform: `translate(-50%, -50%) scale(${stageScale})` }}>
        <img className="millionaire-stage-background" src={stageBackground} alt="" aria-hidden="true" />
        <header className="millionaire-title">
          <span>{millionaireLeagueLabel(league)} DAILY</span><strong>MILLIONAIRE</strong>
        </header>
        <section className="millionaire-stakes" aria-label={`Question ${currentIndex + 1} value`}>
          <strong>{millionaireMoneyLabel(Number(question.money ?? MILLIONAIRE_MONEY_BY_LEVEL[level]))}</strong>
          <span>{MILLIONAIRE_BASE_PTS[level]} PTS</span>
        </section>
        <div className={`millionaire-clock${timerUrgency}`} aria-label={`${millionaireTimeLabel(timeRemainingMs)} remaining`}>
          <div><strong>{millionaireTimeLabel(timeRemainingMs)}</strong><span>TIME BANK</span></div>
        </div>

        <aside className="millionaire-lifelines" aria-label="Lifelines">
          <button
            type="button"
            className={lifelinesUsed.fifty_fifty === true ? "is-spent" : ""}
            disabled={busy || q8 || lifelinesUsed.fifty_fifty === true || questionState.double_dip_active === true || walkPromptOpen}
            onClick={() => advance({ type: "use_lifeline", lifeline: "fifty-fifty" })}
          ><b>50:50</b><span>50:50</span></button>
          <button
            type="button"
            className={lifelinesUsed.stat_sheet === true ? "is-spent" : ""}
            disabled={busy || q8 || lifelinesUsed.stat_sheet === true || walkPromptOpen}
            onClick={() => advance({ type: "use_lifeline", lifeline: "stat-sheet" })}
          ><b>▥</b><span>STAT SHEET</span></button>
          <button
            type="button"
            className={`${lifelinesUsed.double_dip === true ? "is-spent" : ""}${questionState.double_dip_active === true ? " is-active" : ""}`}
            disabled={busy || q8 || lifelinesUsed.double_dip === true || questionState.fifty_fifty_applied === true || walkPromptOpen}
            onClick={() => advance({ type: "use_lifeline", lifeline: "double-dip" })}
          ><b>↝</b><span>{questionState.double_dip_active === true ? "2 PICKS" : "DOUBLE DIP"}</span></button>
        </aside>

        <aside className="millionaire-ladder" aria-label="Money ladder">
          {MILLIONAIRE_LEVELS.slice().reverse().map((ladderLevel, reverseIndex) => {
            const index = 7 - reverseIndex;
            const checkpoint = ladderLevel === "Q3" || ladderLevel === "Q6";
            const current = !result && index === currentIndex;
            const complete = index < completedQuestions;
            return (
              <div key={ladderLevel} className={`${current ? "is-current" : ""}${complete ? " is-complete" : ""}${checkpoint ? " is-checkpoint" : ""}`}>
                <b>{index + 1}</b>
                <strong>{millionaireMoneyLabel(MILLIONAIRE_MONEY_BY_LEVEL[ladderLevel])}</strong>
                <span>{MILLIONAIRE_BASE_PTS[ladderLevel]} PTS</span>
                {checkpoint ? <small>CHECKPOINT</small> : null}
              </div>
            );
          })}
        </aside>

        {statSheetOpen && typeof lifelineReveal.text === "string" ? (
          <section className="millionaire-stat-sheet" aria-label="Stat Sheet">
            <button type="button" onClick={() => setStatSheetOpen(false)} aria-label="Close Stat Sheet">×</button>
            <span>STAT SHEET</span><strong>{millionaireLeagueLabel(league)}</strong><p>{lifelineReveal.text}</p>
          </section>
        ) : null}

        {walkPromptOpen && !result ? (
          <section className="millionaire-decision" aria-label="Walk away decision">
            <span>WALK AWAY?</span>
            <strong>You have {millionaireMoneyLabel(currentMoney)} guaranteed.</strong>
            <p>Play for $1,000,000 and 100 PTS, or bank your Q7 result.</p>
            <div>
              <button type="button" className="is-play" onClick={() => setWalkPromptOpen(false)}>
                <small>PLAY FOR</small><b>$1,000,000</b><em>100 PTS</em>
              </button>
              <button type="button" onClick={() => advance({ type: "walk_away" })}>
                <small>WALK AWAY WITH</small><b>{millionaireMoneyLabel(currentMoney)}</b><em>90 PTS</em>
              </button>
            </div>
          </section>
        ) : null}

        {result ? (
          <section className="millionaire-results" aria-live="polite">
            <span>{result.outcome === "won" ? "MILLIONAIRE" : "YOU LEAVE WITH"}</span>
            <strong>{millionaireMoneyLabel(result.finalMoney)}</strong>
            <div className="millionaire-results__score"><b>{result.score}</b><small>PTS</small></div>
            <dl>
              <div><dt>Questions correct</dt><dd>{result.completedQuestions} / 8</dd></div>
              <div><dt>Lifelines used</dt><dd>{result.lifelinesUsed}{result.lifelinesUsed ? ` (-${result.lifelinesUsed * 2})` : ""}</dd></div>
              <div><dt>Time remaining</dt><dd>{millionaireTimeLabel(result.timeRemainingMs)}</dd></div>
            </dl>
            {onExit ? <button className="millionaire-results__continue" type="button" onClick={onExit}>CONTINUE</button> : null}
          </section>
        ) : (
          <>
            <section className="millionaire-question" aria-live="polite"><strong>{String(question.prompt ?? "")}</strong></section>
            <div className="millionaire-answers" aria-label="Answer choices">
              {choices.map((choice) => {
                const id = String(choice.id ?? "") as MillionaireChoiceId;
                const removed = removedChoices.includes(id);
                const spent = doubleDipMisses.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    className={`${removed ? "is-removed" : ""}${spent ? " is-double-dip-spent" : ""}`}
                    disabled={busy || walkPromptOpen || removed || spent}
                    onClick={() => advance({ type: "answer", choice_id: id })}
                  >
                    <b>{id}</b><span>{String(choice.text ?? "")}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
