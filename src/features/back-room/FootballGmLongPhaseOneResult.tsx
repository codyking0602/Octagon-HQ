import type { CSSProperties } from "react";
import { footballGmMoney } from "./footballGmEngine";
import { NFL_GM_LONG_CAP, NFL_GM_LONG_SLOTS, nflGmLongSpend, type NflGmLongPick } from "./footballGmLongFoundation";
import { NFL_GM_LONG_BY_ID } from "./footballGmLongCatalog";
import { LongPlayerPortrait, LongPlayerTier, longSlotLabel } from "./FootballGmLongDraftPresentation";
import { wheelFootballTeam } from "./wheelFootballModel";
import { nflGmLongYearTwoCapOverage, type nflGmLongCoachFit } from "./footballGmLongPresentation";
import type { NflGmLongCoach } from "./footballGmLongCoaches";

type CoachFit = ReturnType<typeof nflGmLongCoachFit>;

export function nflGmLongGradeHeadline(grade: number): string {
  if (grade >= 90) return "ELITE CONTENDER";
  if (grade >= 85) return "STRONG CONTENDER";
  if (grade >= 80) return "PLAYOFF-CALIBER CORE";
  return "FRANCHISE FOUNDATION";
}

/** Owner-only Phase 1 finish: no season has been played or awarded yet. */
export function FootballGmLongPhaseOneResult({
  picks, grade, coach, coachCategoryLabel, coachFit, onStartMidseason,
}: {
  picks: readonly NflGmLongPick[];
  grade: number;
  coach: NflGmLongCoach;
  coachCategoryLabel: string;
  coachFit: CoachFit;
  onStartMidseason?: () => void;
}) {
  const yearOneLeft = NFL_GM_LONG_CAP - nflGmLongSpend(picks, NFL_GM_LONG_BY_ID, 1);
  const yearTwoEstimate = nflGmLongSpend(picks, NFL_GM_LONG_BY_ID, 2);
  const capOverage = nflGmLongYearTwoCapOverage(yearTwoEstimate, NFL_GM_LONG_CAP);
  const yearTwoRoom = Math.max(0, NFL_GM_LONG_CAP - yearTwoEstimate);
  const bySlot = new Map(picks.map(pick => [pick.slot, pick.playerId]));

  return <section className="surface-card gm-long__phase-one" aria-label="Completed NFL GM Long franchise">
    <header className="gm-long__phase-one-hero">
      <p className="gm-long__phase-one-eyebrow">PHASE 1 COMPLETE <span aria-hidden="true">✓</span> NINE STARTERS SIGNED</p>
      <h2>YOUR FRANCHISE IS BUILT</h2>
      <div className="gm-long__phase-one-grade">
        <strong className="gm-long__phase-one-grade-number">{grade.toFixed(1)}</strong>
        <span><b>TEAM CORE GRADE</b><small>{nflGmLongGradeHeadline(grade)}</small></span>
      </div>
      <p className="gm-long__phase-one-balance">
        9/9 ROSTER BUILT <span aria-hidden="true">·</span> {footballGmMoney(yearOneLeft)} YEAR 1 CAP REMAINING
      </p>
    </header>

    <section className="gm-long__summary-roster" aria-label="Your nine drafted starters">
      <header><h3>YOUR STARTING NINE</h3><strong>{picks.length}/9</strong></header>
      <div className="gm-long__summary-roster-list">
        {NFL_GM_LONG_SLOTS.map(slot => {
          const playerId = bySlot.get(slot);
          const player = playerId ? NFL_GM_LONG_BY_ID.get(playerId) : null;
          if (!player) return null;
          const team = wheelFootballTeam(player.team);
          return <div key={slot} className="gm-long__summary-roster-row"
            style={{ "--long-roster-team": team?.primaryColor ?? "#5687ad" } as CSSProperties}>
            <span className="gm-long__summary-roster-slot">{longSlotLabel(slot)}</span>
            <LongPlayerPortrait player={player} className="gm-long__summary-headshot" />
            <span className="gm-long__summary-roster-identity">
              <strong>{player.name}</strong>
              <small>{player.team} · {player.position}</small>
            </span>
            <span className="gm-long__summary-roster-tier"><LongPlayerTier player={player} /></span>
          </div>;
        })}
      </div>
    </section>

    <section className="gm-long__summary-coach" aria-label="Your selected head coach">
      <div className="gm-long__summary-coach-heading">
        <span><small>YOUR HEAD COACH <span aria-hidden="true">·</span> {coachCategoryLabel}</small>
          <h3>{coach.name}</h3></span>
        {wheelFootballTeam(coach.team)?.logoSrc
          ? <img src={wheelFootballTeam(coach.team)!.logoSrc!} alt="" className="gm-long__summary-coach-logo" />
          : null}
      </div>
      <p><b>{coachFit.headline}:</b> {coachFit.explanation}</p>
      <p className="gm-long__summary-coach-limitation"><b>Watch for:</b> {coachFit.limitation}</p>
      {coachFit.influences.length ? <div className="gm-long__summary-coach-tags" aria-label="Main coaching influences">
        {coachFit.influences.map(influence => <span key={influence}>{influence}</span>)}
      </div> : null}
    </section>

    <section className={`gm-long__summary-cap${capOverage > 0 ? " is-over" : ""}`} aria-label="Year 2 cap estimate">
      <span className="gm-long__summary-cap-icon" aria-hidden="true">{capOverage > 0 ? "!" : "✓"}</span>
      <div>
        <strong>{capOverage > 0
          ? `YEAR 2 CAP WATCH · ${footballGmMoney(capOverage)} OVER`
          : `YEAR 2 CAP ESTIMATE · ${footballGmMoney(yearTwoRoom)} ROOM`}</strong>
        <p>{capOverage > 0
          ? "Projected repricing may require an offseason roster move. No current penalty."
          : "Estimated room under the $205M cap before the offseason."}</p>
      </div>
    </section>

    <div className="gm-long__summary-next">
      <span>UP NEXT <b>· MIDSEASON</b></span>
      <p>First-half record, player development, and an optional trade deadline.</p>
      <small>Your nine-player draft and coach are saved. Ready for the first eight games.</small>
      {onStartMidseason && <button className="gm-long__phase-two-enter" type="button" onClick={onStartMidseason}>
        PLAY MIDSEASON →
      </button>}
    </div>
  </section>;
}
