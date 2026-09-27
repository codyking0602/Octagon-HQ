import { useMemo, useState } from "react";
import { footballWavelengthClues } from "../back-room/footballWavelengthModel";
import { getPlayFighter } from "./playFighterPool";
import type { TodayChallengeProjection } from "./todayChallengeRepository";
import { wavelengthClues } from "./wavelengthEngine";
import "./DailyTwoGameLeaderboardResult.css";

type JsonRecord = Record<string, unknown>;
type Sport = "ufc" | "football";

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter((item): item is JsonRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    : [];
}

function strings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function numbers(value: unknown) {
  return Array.isArray(value)
    ? value.map(Number).filter((item) => Number.isFinite(item))
    : [];
}

function prettyId(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function candidateImage(candidate: JsonRecord) {
  for (const key of ["thumb_url", "image_url", "headshot_url", "logo_url", "team_logo_url"]) {
    const value = candidate[key];
    if (typeof value === "string" && value) return value;
  }
  return "";
}

function CandidateThumb({ candidate }: { candidate: JsonRecord }) {
  const src = candidateImage(candidate);
  const name = String(candidate.name ?? "");
  if (src) return <img src={src} alt="" loading="lazy" />;
  return <span className="daily-two-game-result__initials">{name.split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("")}</span>;
}

function roundSummary(gameType: TodayChallengeProjection["gameType"], result: JsonRecord) {
  const score = Number(result.normalized_score ?? 0);
  if (gameType === "find_leader") {
    if (result.perfect === true || Number(result.native_score) === 10) return "PERFECT RUN";
    const pick = Number(result.native_score ?? 0);
    return pick > 0 ? `ENDED ON PICK ${pick}` : "RUN ENDED";
  }
  if (gameType === "wavelength") {
    const distance = Number(result.distance ?? 0);
    return distance === 0 ? "NAILED IT" : `${distance} ${distance === 1 ? "POINT" : "POINTS"} OFF`;
  }
  if (gameType === "hit_the_number") {
    const status = String(result.status ?? "");
    if (status === "perfect") return "PERFECT";
    if (status === "bust") return "BUST";
    const distance = Number(result.distance ?? 0);
    return distance > 0 ? `${distance} OFF` : score >= 100 ? "PERFECT" : "FINAL";
  }
  return "FINAL";
}

function FindLeaderRoundDetail({
  setup,
  reveal,
  result,
}: {
  setup: JsonRecord;
  reveal: JsonRecord;
  result: JsonRecord;
}) {
  const [tab, setTab] = useState<"run" | "reveal">("run");
  const candidates = records(reveal.candidates).length ? records(reveal.candidates) : records(setup.candidates);
  const byId = new Map(candidates.map((candidate) => [String(candidate.id ?? ""), candidate]));
  const eliminatedIds = strings(result.eliminated_ids);
  const leaderId = String(reveal.leader_id ?? "");
  const perfect = result.perfect === true || Number(result.native_score) === 10;
  const runIds = perfect && leaderId && !eliminatedIds.includes(leaderId)
    ? [...eliminatedIds, leaderId]
    : eliminatedIds;
  const ranked = [...candidates]
    .map((candidate, index) => ({ candidate, index, value: Number(candidate.value ?? Number.NEGATIVE_INFINITY) }))
    .sort((left, right) => (right.value - left.value) || (left.index - right.index));

  return (
    <div className="daily-two-game-result__detail">
      <div className="daily-two-game-result__question">
        <small>{String(setup.stat_label ?? setup.short_label ?? "FIND THE LEADER")}</small>
        <strong>{String(setup.question ?? "Find the leader.")}</strong>
      </div>

      <div className="daily-two-game-result__tabs" role="tablist" aria-label="Find the Leader result view">
        <button type="button" className={tab === "run" ? "is-active" : ""} onClick={() => setTab("run")}>YOUR RUN</button>
        <button type="button" className={tab === "reveal" ? "is-active" : ""} onClick={() => setTab("reveal")}>FINAL REVEAL</button>
      </div>

      {tab === "run" ? (
        <>
          <p className="daily-two-game-result__scroll-label">SCROLL THROUGH THE PICKS →</p>
          <div className="daily-two-game-result__rail" role="list" aria-label="Elimination order">
            {runIds.map((id, index) => {
              const candidate = byId.get(id) ?? { id, name: prettyId(id) };
              const fatal = id === leaderId && !perfect;
              const survived = id === leaderId && perfect;
              return (
                <article
                  className={["daily-two-game-result__tile", fatal ? "is-fatal" : "", survived ? "is-leader" : ""].filter(Boolean).join(" ")}
                  key={id + "-" + index}
                  role="listitem"
                >
                  <span className="daily-two-game-result__position">{index + 1}</span>
                  <CandidateThumb candidate={candidate} />
                  <strong>{String(candidate.name ?? prettyId(id))}</strong>
                  <small>{String(candidate.subtitle ?? candidate.division ?? "")}</small>
                  <em>{fatal ? "LEADER" : survived ? "SURVIVED" : "SAFE"}</em>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p className="daily-two-game-result__scroll-label">SCROLL 1–10 →</p>
          <div className="daily-two-game-result__rail" role="list" aria-label="Final stat reveal">
            {ranked.map(({ candidate }, index) => (
              <article
                className={["daily-two-game-result__tile", String(candidate.id ?? "") === leaderId ? "is-leader" : ""].filter(Boolean).join(" ")}
                key={String(candidate.id ?? index)}
                role="listitem"
              >
                <span className="daily-two-game-result__position">#{index + 1}</span>
                <CandidateThumb candidate={candidate} />
                <strong>{String(candidate.name ?? "")}</strong>
                <small>{String(candidate.subtitle ?? candidate.division ?? "")}</small>
                <em>{Number.isFinite(Number(candidate.value)) ? String(candidate.value) : "—"}</em>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const ufcWavelengthById = new Map(wavelengthClues.map((clue) => [clue.id, clue]));
const footballWavelengthById = new Map(footballWavelengthClues.map((clue) => [clue.id, clue]));

function WavelengthRoundDetail({
  sport,
  result,
  detail,
}: {
  sport: Sport;
  result: JsonRecord;
  detail: JsonRecord;
}) {
  const guesses = numbers(result.guesses);
  const target = Number(detail.target);
  const finalGuess = guesses.at(-1);
  const clueMap = sport === "football" ? footballWavelengthById : ufcWavelengthById;
  const clues = strings(detail.clue_ids).map((id) => clueMap.get(id)).filter(Boolean);

  return (
    <div className="daily-two-game-result__detail">
      <div className="daily-two-game-result__metrics">
        <div><span>HIDDEN</span><strong>{Number.isFinite(target) ? target : "—"}</strong></div>
        <div><span>FINAL</span><strong>{Number.isFinite(finalGuess) ? finalGuess : "—"}</strong></div>
        <div><span>OFF</span><strong>{Number(result.distance ?? (Number.isFinite(target) && Number.isFinite(finalGuess) ? Math.abs(target - Number(finalGuess)) : 0))}</strong></div>
      </div>
      <div className="daily-two-game-result__path">
        <span>YOUR PATH</span>
        <strong>{guesses.length ? guesses.join(" → ") : "No path recorded"}</strong>
      </div>
      {clues.length ? (
        <>
          <p className="daily-two-game-result__scroll-label">CLUE REVEAL →</p>
          <div className="daily-two-game-result__rail daily-two-game-result__rail--clues" role="list" aria-label="Wavelength clue reveal">
            {clues.map((clue, index) => (
              <article className="daily-two-game-result__clue" key={clue!.id} role="listitem">
                <span>{index + 1}</span>
                <small>{clue!.category}</small>
                <strong>{clue!.text}</strong>
                <em>{clue!.rating}</em>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function HitNumberRoundDetail({
  sport,
  setup,
  result,
}: {
  sport: Sport;
  setup: JsonRecord;
  result: JsonRecord;
}) {
  const selectedIds = strings(result.selected_ids);
  const selections = records(result.selections);
  const candidateNames = new Map(records(setup.candidates).map((candidate) => [
    String(candidate.id ?? ""),
    String(candidate.name ?? ""),
  ]));
  const ids = selectedIds.length ? selectedIds : selections.map((selection) => String(selection.fighterId ?? selection.fighter_id ?? "")).filter(Boolean);
  const names = ids.map((id) => {
    const footballName = candidateNames.get(id);
    if (footballName) return footballName;
    if (sport === "ufc") return getPlayFighter(id)?.name ?? prettyId(id);
    return prettyId(id);
  });
  const total = Number(result.total);
  const target = Number(result.target ?? setup.target);
  const distance = Number(result.distance);
  const status = String(result.status ?? "").toUpperCase();

  return (
    <div className="daily-two-game-result__detail">
      <div className="daily-two-game-result__metrics">
        <div><span>TARGET</span><strong>{Number.isFinite(target) ? target : "—"}</strong></div>
        <div><span>TOTAL</span><strong>{Number.isFinite(total) ? total : "—"}</strong></div>
        <div><span>RESULT</span><strong className="is-word">{status || (Number.isFinite(distance) ? `${distance} OFF` : "—")}</strong></div>
      </div>
      {names.length ? (
        <div className="daily-two-game-result__picks">
          <span>YOUR PICKS</span>
          <div>{names.map((name, index) => <strong key={name + index}>{name}</strong>)}</div>
        </div>
      ) : null}
    </div>
  );
}

function GameRound({
  sport,
  gameType,
  index,
  score,
  setup,
  reveal,
  result,
  detail,
}: {
  sport: Sport;
  gameType: TodayChallengeProjection["gameType"];
  index: number;
  score: number;
  setup: JsonRecord;
  reveal: JsonRecord;
  result: JsonRecord;
  detail: JsonRecord;
}) {
  return (
    <details className="daily-two-game-result__game">
      <summary>
        <span className="daily-two-game-result__game-number">GAME {index + 1}</span>
        <span className="daily-two-game-result__game-copy">
          <strong>{Math.round(score)}<small>/100</small></strong>
          <em>{roundSummary(gameType, result)}</em>
        </span>
        <span className="daily-two-game-result__chevron" aria-hidden="true">⌄</span>
      </summary>
      {gameType === "find_leader" ? (
        <FindLeaderRoundDetail setup={setup} reveal={reveal} result={result} />
      ) : gameType === "wavelength" ? (
        <WavelengthRoundDetail sport={sport} result={result} detail={detail} />
      ) : gameType === "hit_the_number" ? (
        <HitNumberRoundDetail sport={sport} setup={setup} result={result} />
      ) : null}
    </details>
  );
}

export function DailyTwoGameLeaderboardResult({
  projection,
  resultDetail,
  sport,
}: {
  projection: TodayChallengeProjection;
  resultDetail: JsonRecord;
  sport: Sport;
}) {
  const series = record(projection.officialAttempt?.publicResult.daily_series);
  const roundResults = records(series.rounds);
  const setupRounds = records(projection.publicSetup.rounds);
  const revealRounds = records(record(projection.revealSetup).rounds);
  const detailRounds = records(resultDetail.rounds);
  const roundScores = numbers(series.round_scores);
  const average = Number(series.average_score ?? projection.officialAttempt?.normalizedScore ?? 0);

  const rounds = useMemo(() => Array.from({ length: 2 }, (_, index) => ({
    score: Number(roundScores[index] ?? roundResults[index]?.normalized_score ?? 0),
    setup: setupRounds[index] ?? {},
    reveal: revealRounds[index] ?? {},
    result: roundResults[index] ?? {},
    detail: detailRounds[index] ?? {},
  })), [detailRounds, revealRounds, roundResults, roundScores, setupRounds]);

  return (
    <div className={`daily-two-game-result daily-two-game-result--${sport}`}>
      <section className="daily-two-game-result__summary">
        <span>DAILY AVERAGE</span>
        <strong>{Math.round(average)}<small>/100</small></strong>
        <div>
          <span>GAME 1 <b>{Math.round(rounds[0]?.score ?? 0)}</b></span>
          <span>GAME 2 <b>{Math.round(rounds[1]?.score ?? 0)}</b></span>
        </div>
      </section>

      <section className="daily-two-game-result__games" aria-label="Two-game Daily breakdown">
        {rounds.map((round, index) => (
          <GameRound
            key={index}
            sport={sport}
            gameType={projection.gameType}
            index={index}
            score={round.score}
            setup={round.setup}
            reveal={round.reveal}
            result={round.result}
            detail={round.detail}
          />
        ))}
      </section>
    </div>
  );
}

export default DailyTwoGameLeaderboardResult;
