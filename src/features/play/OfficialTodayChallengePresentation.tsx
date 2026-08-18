import { useEffect, useRef, useState } from "react";
import { FighterPhoto } from "../rankings/FighterPhoto";
import { getPlayFighter } from "./playFighterPool";
import type { OfficialAttempt } from "./todaysChallengeAdapters";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

type JsonRecord = Record<string, unknown>;

interface FighterPresentation {
  id: string;
  name: string;
  gender: string;
  divisions: string[];
  mainEra: string;
  thumbUrl: string;
  profileUrl: string;
}

interface OfficialGameViewProps {
  projection: TodayChallengeProjection;
  busy: boolean;
  onAdvance: (action: Record<string, unknown>) => void;
  onNavigate: (route: string) => void;
}

function record(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function records(value: unknown) {
  return Array.isArray(value)
    ? value.map(record).filter((row): row is JsonRecord => Boolean(row))
    : [];
}

function strings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((row): row is string => typeof row === "string")
    : [];
}

function integer(value: unknown, fallback = 0) {
  return Number.isInteger(value) ? Number(value) : fallback;
}

function fighter(value: unknown): FighterPresentation | null {
  const row = record(value);
  if (!row || typeof row.id !== "string" || typeof row.name !== "string") return null;
  return {
    id: row.id,
    name: row.name,
    gender: typeof row.gender === "string" ? row.gender : "",
    divisions: strings(row.divisions),
    mainEra: typeof row.main_era === "string"
      ? row.main_era
      : typeof row.mainEra === "string" ? row.mainEra : "",
    thumbUrl: typeof row.thumb_url === "string"
      ? row.thumb_url
      : typeof row.thumbUrl === "string" ? row.thumbUrl : "",
    profileUrl: typeof row.profile_url === "string"
      ? row.profile_url
      : typeof row.profileUrl === "string" ? row.profileUrl : "",
  };
}

function fighters(value: unknown) {
  return Array.isArray(value)
    ? value.map(fighter).filter((row): row is FighterPresentation => Boolean(row))
    : [];
}

function compactDivision(value: string) {
  const abbreviations: Record<string, string> = {
    Strawweight: "SW",
    Flyweight: "FLW",
    Bantamweight: "BW",
    Featherweight: "FW",
    Lightweight: "LW",
    Welterweight: "WW",
    Middleweight: "MW",
    "Light Heavyweight": "LHW",
    Heavyweight: "HW",
  };
  return value
    .split("/")
    .map((division) => division.trim())
    .filter(Boolean)
    .map((division) => abbreviations[division] ?? division)
    .join(" / ");
}

function ResultScore({ attempt }: { attempt: OfficialAttempt }) {
  return <strong>{attempt.normalizedScore}</strong>;
}

function FindLeaderView({ projection, busy, onAdvance }: OfficialGameViewProps) {
  const setup = projection.publicSetup;
  const state = projection.publicState;
  const candidates = records(setup.candidates).map((row) => ({
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    division: String(row.division ?? ""),
    thumbUrl: String(row.thumb_url ?? ""),
  })).filter((row) => row.id && row.name);
  const eliminated = strings(state.eliminated_ids);
  const eliminatedSet = new Set(eliminated);
  const question = String(setup.question ?? "Find today’s stat leader");
  const context = String(setup.context ?? "Eliminate one fighter at a time. Leave the group leader standing.");
  const statLabel = String(setup.stat_label ?? "OFFICIAL STAT").replace(/^all-time\s+/i, "");
  const attempt = projection.officialAttempt;

  if (attempt) {
    const reveal = projection.revealSetup ?? record(state.reveal) ?? {};
    const leaderId = String(reveal.leader_id ?? "");
    const revealed = records(reveal.candidates).map((row) => ({
      id: String(row.id ?? ""),
      name: String(row.name ?? ""),
      division: String(row.division ?? ""),
      thumbUrl: String(row.thumb_url ?? ""),
      value: integer(row.value),
    })).sort((left, right) => right.value - left.value || left.name.localeCompare(right.name));
    const leader = revealed.find((row) => row.id === leaderId) ?? revealed[0];
    const perfect = attempt.nativeScore === 10;
    return (
      <div className="find-game page" data-game="find_leader">
        <section className={`find-result-hero ${perfect ? "is-perfect" : ""}`}>
          <div>
            <p className="eyebrow">{perfect ? "PERFECT RUN" : "RUN ENDED"}</p>
            <h1>{perfect ? "PERFECT 10" : `ROUND ${attempt.nativeScore}`}</h1>
            <p>{perfect ? "You eliminated all nine non-leaders and left the group leader standing." : "You removed the group leader and ended the run."}</p>
          </div>
          {leader ? (
            <article>
              <FighterPhoto name={leader.name} src={leader.thumbUrl} className="find-result-hero__photo" />
              <span><small>GROUP LEADER</small><strong>{leader.name}</strong><b>{leader.value} {statLabel}</b></span>
            </article>
          ) : null}
        </section>
        <section className="surface-card find-reveal">
          <header className="section-heading">
            <div><p className="eyebrow">FULL STAT REVEAL</p><h2>{question}</h2></div>
            <strong>{attempt.nativeScore}/10</strong>
          </header>
          <div className="find-reveal__grid">
            {revealed.map((row, index) => (
              <article className={`find-reveal__row${row.id === leaderId ? " is-leader" : ""}`} key={row.id}>
                <b>#{index + 1}</b>
                <FighterPhoto name={row.name} src={row.thumbUrl} className="find-reveal__photo" />
                <span><strong>{row.name}</strong><small>{row.division}</small></span>
                <em>{row.value}<small>{statLabel}</small></em>
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="find-game page" data-game="find_leader">
      <section className="find-game__hero">
        <div>
          <p className="eyebrow">TODAY’S CHALLENGE</p>
          <h1>{question}</h1>
          <p>{context}</p>
        </div>
        <aside>
          <div><span>ROUND</span><strong>{Math.min(10, eliminated.length + 1)}</strong></div>
          <div><span>STANDING</span><strong>{Math.max(1, candidates.length - eliminated.length)}</strong></div>
          <div><span>SAFE</span><strong>{eliminated.length}/9</strong></div>
        </aside>
      </section>
      <section className="find-game__grid" aria-label={question}>
        {candidates.map((row, index) => {
          const safe = eliminatedSet.has(row.id);
          return (
            <button
              className={`find-card${safe ? " is-safe" : ""}`}
              disabled={safe || busy}
              type="button"
              key={row.id}
              onClick={() => onAdvance({ eliminated_id: row.id })}
            >
              <span className="find-card__number">{index + 1}</span>
              <FighterPhoto name={row.name} src={row.thumbUrl} className="find-card__photo" />
              <span className="find-card__name"><strong>{row.name}</strong><small>{compactDivision(row.division)}</small></span>
              <em>{safe ? "SAFE" : busy ? "LOCKING…" : "ELIMINATE"}</em>
            </button>
          );
        })}
      </section>
    </div>
  );
}

function WavelengthView({ projection, busy, onAdvance }: OfficialGameViewProps) {
  const state = projection.publicState;
  const guesses = Array.isArray(state.guesses)
    ? state.guesses.map((value) => integer(value)).filter((value) => value >= 1 && value <= 100)
    : [];
  const clues = records(state.clues);
  const clueIndex = Math.max(0, Math.min(3, guesses.length));
  const clue = clues.at(-1) ?? null;
  const [guess, setGuess] = useState(50);
  useEffect(() => setGuess(50), [guesses.length]);
  const attempt = projection.officialAttempt;

  if (attempt) {
    const reveal = record(state.reveal) ?? projection.revealSetup ?? {};
    const target = integer(reveal.target);
    const finalGuess = guesses.at(-1) ?? 50;
    const distance = integer(attempt.publicResult.distance, Math.abs(finalGuess - target));
    return (
      <div className="wavelength-page page" data-game="wavelength">
        <section className="wavelength-result-hero">
          <p className="eyebrow">FINAL SCORE</p>
          <ResultScore attempt={attempt} />
          <span>{distance === 0 ? "Bullseye." : `${distance} away from the hidden number.`}</span>
        </section>
        <section className="wavelength-result-metrics">
          <div><span>HIDDEN NUMBER</span><strong>{target}</strong></div>
          <div><span>FINAL GUESS</span><strong>{finalGuess}</strong></div>
        </section>
        <div className="wavelength-path" aria-label="Your Wavelength path">
          <span>YOUR PATH</span>
          {guesses.map((value, index) => (
            <span className="wavelength-path__step" key={`${index}-${value}`}>
              {index > 0 && <em>→</em>}<b>{value}</b>
            </span>
          ))}
        </div>
        <section className="surface-card wavelength-reveal">
          <header className="section-heading"><div><p className="eyebrow">CLUE REVEAL</p><h2>How the scale moved</h2></div></header>
          {records(reveal.clues).map((item, index) => (
            <article className="wavelength-reveal__row" key={String(item.id ?? index)}>
              <b>{index + 1}</b>
              <span><small>{String(item.category ?? "CLUE")}</small><strong>{String(item.text ?? "")}</strong></span>
              <em>{String(item.rating ?? "—")}</em>
            </article>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="wavelength-page page" data-game="wavelength">
      <section className="wavelength-topline">
        <span>TODAY’S CHALLENGE</span>
        <b>CLUE {clueIndex + 1} OF 4</b>
      </section>
      <div className="wavelength-progress" aria-label="Wavelength clue progress">
        {[0, 1, 2, 3].map((index) => (
          <i className={`${index < clueIndex ? "is-complete" : ""}${index === clueIndex ? " is-current" : ""}`} key={index} />
        ))}
      </div>
      {clue ? (
        <section className="wavelength-clue" aria-live="polite">
          <div><span>{String(clue.category ?? "CLUE")}</span><b>CLUE {clueIndex + 1}</b></div>
          <h1>{String(clue.text ?? "")}</h1>
          <p>Where does it land on Octagon HQ’s 1–100 UFC scale?</p>
        </section>
      ) : null}
      <section className="wavelength-guess-panel">
        <div><span>{clueIndex === 3 ? "FINAL ANSWER" : "YOUR GUESS"}</span><strong>{guess}</strong></div>
        <input
          aria-label="Your Wavelength guess from 1 to 100"
          max="100"
          min="1"
          onChange={(event) => setGuess(Math.min(100, Math.max(1, Number(event.target.value) || 1)))}
          step="1"
          type="range"
          value={guess}
          disabled={busy}
        />
        <div className="wavelength-scale"><span>1 · BAD</span><span>50 · AVERAGE</span><span>100 · ELITE</span></div>
        <button className="primary-action" type="button" disabled={busy} onClick={() => onAdvance({ guess })}>
          {busy ? "LOCKING…" : clueIndex === 3 ? "LOCK FINAL GUESS" : "LOCK GUESS & REVEAL NEXT CLUE"}
        </button>
      </section>
      <div className="wavelength-path">
        <span>YOUR PATH</span>
        {[0, 1, 2, 3].map((index) => (
          <span className="wavelength-path__step" key={index}>
            {index > 0 && <em>→</em>}<b>{guesses[index] ?? "—"}</b>
          </span>
        ))}
      </div>
      <p className="wavelength-rules">Each clue reacts to your last guess. Only your fourth guess determines your score.</p>
    </div>
  );
}

function rankCopy(row: FighterPresentation) {
  const ranked = getPlayFighter(row.id)?.model;
  if (!ranked) return "UFC career ranking";
  return `${row.gender === "women" ? "Women’s" : "Men’s"} UFC GOAT #${ranked.rank}`;
}

function BlindResumeView({ projection, busy, onAdvance, onNavigate }: OfficialGameViewProps) {
  const state = projection.publicState;
  const results = records(state.results);
  const currentRound = record(state.current_round);
  const previousCount = useRef(results.length);
  const [pendingReveal, setPendingReveal] = useState<number | null>(null);
  const newlyAdded = results.length > previousCount.current ? results.length - 1 : null;
  const revealIndex = pendingReveal ?? newlyAdded;

  useEffect(() => {
    if (results.length > previousCount.current) setPendingReveal(results.length - 1);
    previousCount.current = results.length;
  }, [results.length]);

  if (revealIndex !== null) {
    const result = results[revealIndex];
    const fighterA = fighter(result?.fighter_a);
    const fighterB = fighter(result?.fighter_b);
    const winnerId = String(result?.winner_id ?? "");
    const pickedId = String(result?.picked_id ?? "");
    const winner = fighterA?.id === winnerId ? fighterA : fighterB;
    const loser = fighterA?.id === winnerId ? fighterB : fighterA;
    const correct = result?.correct === true;
    const finalRound = results.length >= 5 && Boolean(projection.officialAttempt);
    if (fighterA && fighterB && winner && loser) {
      const params = new URLSearchParams({
        mode: "compare",
        fighter: fighterA.id,
        opponent: fighterB.id,
        returnTo: "/play/blind-resume?mode=daily",
        returnLabel: "Back to Blind Resume",
      });
      return (
        <div className="page blind-resume-page" data-game="blind_resume">
          <section className={`blind-resume-verdict ${correct ? "is-correct" : "is-miss"}`}>
            <p className="eyebrow">{correct ? "YOU PICKED THE MODEL WINNER" : "THE MODEL DISAGREES"}</p>
            <h1>{winner.name} ranks higher</h1>
            <p>{rankCopy(winner)}. {loser.name} is {rankCopy(loser).replace(/^(Men’s|Women’s) UFC GOAT /, "")}.</p>
          </section>
          <section className="blind-resume-reveal-grid">
            {[fighterA, fighterB].map((row, index) => (
              <article className={`${row.id === winnerId ? "is-winner" : ""}${row.id === pickedId ? " is-picked" : ""}`} key={row.id}>
                <FighterPhoto className="blind-resume-reveal-photo" name={row.name} src={row.profileUrl || row.thumbUrl} />
                <span>FIGHTER {index === 0 ? "A" : "B"}</span>
                <strong>{row.name}</strong>
                <small>{rankCopy(row)}</small>
                {row.id === pickedId ? <em>YOUR PICK</em> : null}
              </article>
            ))}
          </section>
          <button className="blind-resume-intelligence" type="button" onClick={() => onNavigate(`/intelligence?${params.toString()}`)}>TAKE MATCHUP TO INTELLIGENCE</button>
          <button className="primary-action" type="button" onClick={() => setPendingReveal(null)}>{finalRound ? "SEE FINAL SCORE" : "NEXT ROUND"}</button>
        </div>
      );
    }
  }

  const attempt = projection.officialAttempt;
  if (attempt) {
    return (
      <div className="page blind-resume-page blind-resume-page--final" data-game="blind_resume">
        <section className="blind-resume-final">
          <div><p className="eyebrow">FIVE-ROUND RESULTS</p><strong>{attempt.nativeScore}/5</strong><h1>{attempt.nativeScore === 5 ? "Perfect card" : "Official card complete"}</h1></div>
          <p>Your five official picks are saved to Today’s Challenge.</p>
        </section>
        <section className="blind-resume-recap" aria-label="Five-round Blind Resume recap">
          {results.map((result, index) => {
            const fighterA = fighter(result.fighter_a);
            const fighterB = fighter(result.fighter_b);
            const winnerId = String(result.winner_id ?? "");
            const pickedId = String(result.picked_id ?? "");
            if (!fighterA || !fighterB) return null;
            return (
              <article className="blind-resume-recap__round" key={`${index}-${fighterA.id}-${fighterB.id}`}>
                <header><span>R{index + 1}</span><b className={result.correct === true ? "is-correct" : "is-miss"}>{result.correct === true ? "CORRECT" : "MISS"}</b></header>
                <div>
                  {[fighterA, fighterB].map((row) => (
                    <section className={row.id === winnerId ? "is-winner" : ""} key={row.id}>
                      <FighterPhoto className="blind-resume-recap__photo" name={row.name} src={row.thumbUrl} />
                      <span><strong>{row.name}</strong><small>{rankCopy(row).replace(/^(Men’s|Women’s) UFC /, "")}</small></span>
                      <em>{row.id === winnerId ? "WINNER" : row.id === pickedId ? "PICK" : ""}</em>
                    </section>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    );
  }

  const stats = records(currentRound?.stats);
  const score = results.filter((row) => row.correct === true).length;
  return (
    <div className="page blind-resume-page" data-game="blind_resume">
      <section className="blind-resume-scoreboard">
        <div><p className="eyebrow">TODAY’S CHALLENGE</p><h1>Which UFC career ranks higher?</h1></div>
        <aside><span>ROUND {integer(currentRound?.round_number, results.length + 1)} OF 5</span><b>SCORE {score}-{results.length - score}</b></aside>
      </section>
      {currentRound ? (
        <section className="blind-resume-card">
          <header><div><span>FIGHTER A</span><strong>?</strong></div><b>RESUME</b><div><span>FIGHTER B</span><strong>?</strong></div></header>
          <div className="blind-resume-stats">
            {stats.map((stat, index) => (
              <div key={`${String(stat.label)}-${index}`}><strong>{String(stat.value_a ?? "—")}</strong><span>{String(stat.label ?? "STAT")}</span><strong>{String(stat.value_b ?? "—")}</strong></div>
            ))}
          </div>
          <p className="blind-resume-apex-note">Apex rating measures the fighter’s best one-night or short-stretch UFC peak.</p>
          <div className="blind-resume-picks">
            <button type="button" disabled={busy} onClick={() => onAdvance({ choice: "A" })}>PICK A</button>
            <button type="button" disabled={busy} onClick={() => onAdvance({ choice: "B" })}>PICK B</button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function BlindRankFighter({ row }: { row: FighterPresentation }) {
  return <FighterPhoto className="blind-rank-slot__photo" name={row.name} src={row.thumbUrl} />;
}

function BlindRankView({ projection, busy, onAdvance }: OfficialGameViewProps) {
  const setup = projection.publicSetup;
  const state = projection.publicState;
  const pack = record(setup.pack) ?? {};
  const slots = Array.isArray(state.slots) ? state.slots : [];
  const current = fighter(state.current_fighter);
  const attempt = projection.officialAttempt;

  return (
    <div className="page blind-rank-page" data-game="blind_rank_5">
      <section className="blind-rank-intro">
        <div><p className="eyebrow">TODAY’S CHALLENGE</p><h1>{String(pack.prompt ?? "Blind Rank 5")}</h1><p>{String(pack.intro ?? "Place each fighter before the next one is revealed.")}</p></div>
        <span className="blind-rank-shared-pack">{String(pack.name ?? "UFC Careers")}</span>
      </section>
      <section className={`blind-rank-game${attempt ? " is-complete" : ""}`}>
        <header><strong>{attempt ? "COMPLETE" : `LOCKED ${slots.filter(Boolean).length} OF 5`}</strong>{!attempt ? <span>{String(pack.name ?? "UFC Careers")}</span> : null}</header>
        {!attempt ? (
          <div className="blind-rank-slots" aria-label="Blind Rank locked slots">
            {Array.from({ length: 5 }, (_, index) => {
              const row = fighter(slots[index]);
              return row ? (
                <button className="blind-rank-slot is-filled" type="button" disabled key={index}>
                  <b>{index + 1}</b><BlindRankFighter row={row} /><strong>{row.name}</strong>
                </button>
              ) : (
                <button className="blind-rank-slot" type="button" disabled={busy || !current} key={index} onClick={() => onAdvance({ slot: index + 1 })}>
                  <b>{index + 1}</b><span>PLACE HERE</span>
                </button>
              );
            })}
          </div>
        ) : null}
        {attempt ? (
          <div className="blind-rank-finish">
            <p className="eyebrow">YOUR FINAL RANKING</p>
            <div className="blind-rank-results">
              {slots.map((value, index) => {
                const row = fighter(value);
                return row ? (
                  <article key={row.id}>
                    <b>#{index + 1}</b>
                    <FighterPhoto className="blind-rank-result__photo" name={row.name} src={row.thumbUrl} />
                    <span><strong>{row.name}</strong><small>{row.divisions.map(compactDivision).join(" / ")}</small></span>
                  </article>
                ) : null;
              })}
            </div>
          </div>
        ) : current ? (
          <article className="blind-rank-current">
            <FighterPhoto className="blind-rank-current__photo" name={current.name} src={current.thumbUrl} />
            <div><p className="eyebrow">FIGHTER {integer(state.reveal_index) + 1} OF 5</p><h2>{current.name}</h2><p>{current.divisions.map(compactDivision).join(" / ")}</p><strong>Choose an open slot. Once placed, it is locked.</strong></div>
          </article>
        ) : null}
      </section>
    </div>
  );
}

function KeepCutFighter({ row, compact = false }: { row: FighterPresentation; compact?: boolean }) {
  return (
    <article className={`keep-cut-fighter${compact ? " keep-cut-fighter--compact" : ""}`}>
      <FighterPhoto name={row.name} src={row.thumbUrl} className="keep-cut-fighter__photo" />
      <span><strong>{row.name}</strong><small>{row.divisions.join(" / ")}{row.mainEra ? ` · ${row.mainEra}` : ""}</small></span>
    </article>
  );
}

function KeepCutTray({ title, values }: { title: "keep" | "cut"; values: unknown }) {
  const rows = fighters(values);
  return (
    <section className={`keep-cut-tray keep-cut-tray--${title}`}>
      <header><strong>{title.toUpperCase()}</strong><span>{rows.length}/4</span></header>
      <div className="keep-cut-tray__slots">
        {Array.from({ length: 4 }, (_, index) => rows[index] ? <KeepCutFighter row={rows[index]!} compact key={rows[index]!.id} /> : <div className="keep-cut-empty-slot" key={index}><span>{index + 1}</span></div>)}
      </div>
    </section>
  );
}

function KeepCutView({ projection, busy, onAdvance }: OfficialGameViewProps) {
  const setup = projection.publicSetup;
  const state = projection.publicState;
  const pack = record(setup.pack) ?? {};
  const kept = fighters(state.kept);
  const cut = fighters(state.cut);
  const current = fighter(state.current_fighter);
  const forcedChoice = state.forced_choice === "keep" || state.forced_choice === "cut" ? state.forced_choice : null;
  const attempt = projection.officialAttempt;

  if (attempt) {
    const reveal = record(state.reveal) ?? projection.revealSetup ?? {};
    const modelTopFour = new Set(strings(reveal.model_top_four_ids));
    const modelTopFourKept = kept.filter((row) => modelTopFour.has(row.id)).length;
    return (
      <div className="page keep-cut-page" data-game="keep_4_cut_4">
        <section className="keep-cut-result-hero">
          <p className="eyebrow">EIGHT CALLS LOCKED</p>
          <h1>{attempt.normalizedScore}/100 · OFFICIAL RESULT</h1>
          <p>{modelTopFourKept} OF OCTAGON HQ’S TOP 4 KEPT</p>
          <small>Your four keeps are graded against the strongest four fighters on this board.</small>
        </section>
        <section className="keep-cut-results">
          <div className="keep-cut-result-group keep-cut-result-group--keep"><header><span>YOUR FOUR</span><strong>KEPT</strong></header><div>{kept.map((row) => <KeepCutFighter row={row} key={row.id} />)}</div></div>
          <div className="keep-cut-result-group keep-cut-result-group--cut"><header><span>YOUR FOUR</span><strong>CUT</strong></header><div>{cut.map((row) => <KeepCutFighter row={row} key={row.id} />)}</div></div>
        </section>
      </div>
    );
  }

  const forced = forcedChoice === "cut"
    ? "KEEP IS FULL — THIS FIGHTER MUST BE CUT"
    : forcedChoice === "keep"
      ? "CUT IS FULL — THIS FIGHTER MUST BE KEPT"
      : "MAKE THE CALL. IT LOCKS IMMEDIATELY.";

  return (
    <div className="page keep-cut-page" data-game="keep_4_cut_4">
      <section className="keep-cut-intro">
        <div className="keep-cut-intro__copy"><p className="eyebrow">TODAY’S CHALLENGE</p><h1>{String(pack.prompt ?? "Keep 4, Cut 4")}</h1><p>{String(pack.description ?? "")} Eight fighters arrive one at a time. Every call locks, and you will not see who comes next.</p></div>
        <span className="blind-rank-shared-pack">{String(pack.name ?? "UFC Careers")}</span>
      </section>
      <section className="keep-cut-game-card">
        <header className="keep-cut-progress" aria-live="polite"><strong>FIGHTER {integer(state.reveal_index) + 1} OF 8</strong><span>{String(pack.group ?? "Careers")} · {String(pack.name ?? "UFC Careers")}</span></header>
        <div className="keep-cut-board"><KeepCutTray title="keep" values={state.kept} /><KeepCutTray title="cut" values={state.cut} /></div>
        {current ? (
          <section className="keep-cut-current" style={{ gridTemplateColumns: "96px minmax(0, 1fr)" }}>
            <FighterPhoto name={current.name} src={current.thumbUrl} className="keep-cut-current__photo" style={{ width: "96px", height: "96px", aspectRatio: "1 / 1", objectFit: "cover", objectPosition: "center" }} />
            <div>
              <span>REVEAL {integer(state.reveal_index) + 1} OF 8</span>
              <h2>{current.name}</h2>
              <p>{current.divisions.join(" / ")}{current.mainEra ? ` · ${current.mainEra}` : ""}</p>
              <small className={forcedChoice ? "is-forced" : ""}>{forced}</small>
              <div className="keep-cut-current__actions">
                <button type="button" className="keep" disabled={busy || forcedChoice === "cut" || kept.length >= 4} onClick={() => onAdvance({ choice: "keep" })}>KEEP</button>
                <button type="button" className="cut" disabled={busy || forcedChoice === "keep" || cut.length >= 4} onClick={() => onAdvance({ choice: "cut" })}>CUT</button>
              </div>
            </div>
          </section>
        ) : null}
      </section>
    </div>
  );
}

export function OfficialTodayChallengeView({
  projection,
  busy,
  onAdvance,
  onNavigate,
}: {
  projection: TodayChallengeProjection;
  busy: boolean;
  onAdvance: (action: Record<string, unknown>) => void;
  onNavigate: (route: string) => void;
}) {
  switch (projection.gameType) {
    case "find_leader": return <FindLeaderView projection={projection} busy={busy} onAdvance={onAdvance} onNavigate={onNavigate} />;
    case "wavelength": return <WavelengthView projection={projection} busy={busy} onAdvance={onAdvance} onNavigate={onNavigate} />;
    case "blind_resume": return <BlindResumeView projection={projection} busy={busy} onAdvance={onAdvance} onNavigate={onNavigate} />;
    case "blind_rank_5": return <BlindRankView projection={projection} busy={busy} onAdvance={onAdvance} onNavigate={onNavigate} />;
    case "keep_4_cut_4": return <KeepCutView projection={projection} busy={busy} onAdvance={onAdvance} onNavigate={onNavigate} />;
  }
}