import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/football-wheel.css";
import "../../styles/football-gm-mode.css";
import { useIdentity } from "../identity/IdentityProvider";
import {
  WHEEL_FOOTBALL_GM_CAP,
  WHEEL_FOOTBALL_GM_ROSTER_SLOTS,
  type WheelFootballGmRosterSlot,
} from "./wheelFootballGmEconomy";
import {
  formatWheelFootballGmMoney,
  wheelFootballGmCandidatesForTeam,
  wheelFootballGmCapRoom,
  wheelFootballGmEligibleTeamCodes,
  wheelFootballGmOpenSlots,
  wheelFootballGmPlayerById,
  wheelFootballGmPlayerGrade,
  wheelFootballGmPlayerSalary,
  wheelFootballGmRosterGrade,
  wheelFootballGmRosterSpend,
  wheelFootballGmThreeYearGrade,
  type WheelFootballGmPlayer,
  type WheelFootballGmRosterPick,
} from "./wheelFootballGmRuntime";
import {
  wheelFootballPoolTeams,
  wheelFootballTeam,
  type WheelFootballTeam,
} from "./wheelFootballModel";

type GmPhase = "draft" | "year1" | "offseason" | "refill" | "final";

type GmRun = {
  version: 1;
  phase: GmPhase;
  roster: WheelFootballGmRosterPick[];
  yearOneRoster: WheelFootballGmRosterPick[];
  usedPlayerKeys: string[];
  extendedPlayerIds: string[];
  pendingTeamCode: string | null;
  lastTeamCode: string | null;
};

const EMPTY_RUN: GmRun = {
  version: 1,
  phase: "draft",
  roster: [],
  yearOneRoster: [],
  usedPlayerKeys: [],
  extendedPlayerIds: [],
  pendingTeamCode: null,
  lastTeamCode: null,
};

function isGmRun(value: unknown): value is GmRun {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<GmRun>;
  return record.version === 1
    && ["draft", "year1", "offseason", "refill", "final"].includes(record.phase ?? "")
    && Array.isArray(record.roster)
    && Array.isArray(record.yearOneRoster)
    && Array.isArray(record.usedPlayerKeys)
    && Array.isArray(record.extendedPlayerIds);
}

function teamLogo(team: WheelFootballTeam) {
  return team.logoSrc
    ? <img src={team.logoSrc} alt="" />
    : <strong>{team.shortCode}</strong>;
}

function wheelTeamBackground(teams: readonly WheelFootballTeam[]) {
  if (!teams.length) return undefined;
  const slice = 360 / teams.length;
  const stops = teams.flatMap((team, index) => {
    const start = index * slice;
    const end = (index + 1) * slice;
    return [`${team.primaryColor} ${start}deg`, `${team.primaryColor} ${end}deg`];
  });
  return `conic-gradient(from ${-slice / 2}deg, ${stops.join(", ")})`;
}

function GmWheel({
  teams,
  rotation,
  spinning,
  pendingTeam,
  onSpin,
}: {
  teams: readonly WheelFootballTeam[];
  rotation: number;
  spinning: boolean;
  pendingTeam: WheelFootballTeam | null;
  onSpin: () => void;
}) {
  const canSpin = teams.length > 0 && !pendingTeam && !spinning;
  return (
    <section className="football-wheel football-gm-wheel surface-card" aria-label="GM Mode NFL wheel">
      <div className="football-wheel__pointer" aria-hidden="true" />
      <div
        className={`football-wheel__disc${spinning ? " is-spinning" : ""}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          background: wheelTeamBackground(teams),
        }}
      >
        <div className="football-wheel__rings" aria-hidden="true" />
        {teams.map((team, index) => (
          <span
            className="football-wheel__label"
            key={team.code}
            style={{
              "--wheel-index": index,
              "--wheel-count": teams.length,
              "--team-primary": team.primaryColor,
              "--team-secondary": team.secondaryColor,
            } as CSSProperties}
            title={team.name}
          >
            {teamLogo(team)}
          </span>
        ))}
      </div>
      <button
        className={`football-wheel__center${pendingTeam ? " has-team" : ""}`}
        type="button"
        disabled={!canSpin}
        onClick={onSpin}
      >
        {pendingTeam ? (
          <>
            <span className="football-gm-wheel__center-logo">{teamLogo(pendingTeam)}</span>
            <strong>{pendingTeam.shortCode}</strong>
          </>
        ) : spinning ? (
          <><strong>SPINNING</strong><span>…</span></>
        ) : teams.length ? (
          <><strong>SPIN</strong><span>THE NFL</span></>
        ) : (
          <><strong>NO FIT</strong><span>CAP LOCKED</span></>
        )}
      </button>
    </section>
  );
}

function RosterStrip({
  roster,
  year,
}: {
  roster: readonly WheelFootballGmRosterPick[];
  year: 1 | 2 | 3;
}) {
  return (
    <section className="football-gm-roster-strip" aria-label="GM roster">
      {WHEEL_FOOTBALL_GM_ROSTER_SLOTS.map((slot) => {
        const pick = roster.find((item) => item.slot === slot);
        const player = pick ? wheelFootballGmPlayerById.get(pick.playerId) : null;
        return (
          <article className={player ? "is-filled" : ""} key={slot}>
            <small>{slot}</small>
            <strong>{player?.player ?? "OPEN"}</strong>
            <span>{player ? formatWheelFootballGmMoney(wheelFootballGmPlayerSalary(player, year)) : "—"}</span>
          </article>
        );
      })}
    </section>
  );
}

function CandidatePicker({
  team,
  openSlots,
  selectedSlot,
  year,
  remainingCap,
  usedPlayerKeys,
  onSelectSlot,
  onPick,
}: {
  team: WheelFootballTeam;
  openSlots: readonly WheelFootballGmRosterSlot[];
  selectedSlot: WheelFootballGmRosterSlot | null;
  year: 1 | 2;
  remainingCap: number;
  usedPlayerKeys: ReadonlySet<string>;
  onSelectSlot: (slot: WheelFootballGmRosterSlot) => void;
  onPick: (player: WheelFootballGmPlayer, slot: WheelFootballGmRosterSlot) => void;
}) {
  const slotCounts = new Map(
    openSlots.map((slot) => [
      slot,
      wheelFootballGmCandidatesForTeam({
        teamCode: team.code,
        slot,
        openSlots,
        year,
        remainingCap,
        usedPlayerKeys,
      }).length,
    ]),
  );

  const candidates = selectedSlot
    ? wheelFootballGmCandidatesForTeam({
        teamCode: team.code,
        slot: selectedSlot,
        openSlots,
        year,
        remainingCap,
        usedPlayerKeys,
      })
    : [];

  return (
    <section className="football-gm-picker surface-card">
      <header
        style={{
          "--gm-team-primary": team.primaryColor,
          "--gm-team-secondary": team.secondaryColor,
        } as CSSProperties}
      >
        <span className="football-gm-picker__team-logo">{teamLogo(team)}</span>
        <div>
          <p className="eyebrow">{year === 1 ? "YOUR SPIN" : "OFFSEASON SPIN"}</p>
          <h2>{team.name}</h2>
          <span>Pick a roster spot, then choose a player who fits your cap.</span>
        </div>
      </header>

      <div className="football-gm-picker__slots" aria-label="Open GM roster spots">
        {openSlots.map((slot) => (
          <button
            type="button"
            className={selectedSlot === slot ? "is-active" : ""}
            disabled={(slotCounts.get(slot) ?? 0) === 0}
            onClick={() => onSelectSlot(slot)}
            key={slot}
          >
            <strong>{slot}</strong>
            <span>{slotCounts.get(slot) ?? 0}</span>
          </button>
        ))}
      </div>

      {selectedSlot ? (
        <div className="football-gm-picker__candidates">
          {candidates.map((player) => (
            <button
              type="button"
              key={player.id}
              onClick={() => onPick(player, selectedSlot)}
            >
              <span className="football-gm-picker__candidate-team">{teamLogo(team)}</span>
              <span className="football-gm-picker__candidate-copy">
                <strong>{player.player}</strong>
                <small>{player.position} · AGE {player.age} · {player.outlook}</small>
              </span>
              <span className="football-gm-picker__contract">
                <b>{formatWheelFootballGmMoney(wheelFootballGmPlayerSalary(player, year))}</b>
                <small>{year === 1 ? player.gameContract : "YR 2 MARKET"}</small>
              </span>
              <em>SELECT →</em>
            </button>
          ))}
          {!candidates.length ? (
            <p className="football-gm-picker__empty">That team no longer has a cap-safe option for {selectedSlot}.</p>
          ) : null}
        </div>
      ) : (
        <p className="football-gm-picker__empty">Choose the roster spot you want to fill from this team.</p>
      )}
    </section>
  );
}

function YearRosterTable({
  roster,
  year,
}: {
  roster: readonly WheelFootballGmRosterPick[];
  year: 1 | 2 | 3;
}) {
  return (
    <div className="football-gm-results__roster">
      {WHEEL_FOOTBALL_GM_ROSTER_SLOTS.map((slot) => {
        const pick = roster.find((item) => item.slot === slot);
        const player = pick ? wheelFootballGmPlayerById.get(pick.playerId) : null;
        if (!player) return null;
        const team = wheelFootballTeam(player.team);
        return (
          <article key={slot}>
            <span className="football-gm-results__slot">{slot}</span>
            <span className="football-gm-results__logo">{team ? teamLogo(team) : player.team}</span>
            <span className="football-gm-results__player">
              <strong>{player.player}</strong>
              <small>{player.position} · {player.gameContract}</small>
            </span>
            <span className="football-gm-results__salary">{formatWheelFootballGmMoney(wheelFootballGmPlayerSalary(player, year))}</span>
            <b>{wheelFootballGmPlayerGrade(player, year).toFixed(1)}</b>
          </article>
        );
      })}
    </div>
  );
}

function YearOneScreen({
  roster,
  onContinue,
}: {
  roster: readonly WheelFootballGmRosterPick[];
  onContinue: () => void;
}) {
  const spend = wheelFootballGmRosterSpend(roster, 1);
  const grade = wheelFootballGmRosterGrade(roster, 1);
  return (
    <section className="football-gm-results surface-card">
      <header>
        <p className="eyebrow">YEAR 1 COMPLETE</p>
        <h1>Your first roster is built.</h1>
        <span>Now the cheap deals expire and the cap starts fighting back.</span>
      </header>
      <div className="football-gm-results__scoreboard">
        <div><small>ROSTER RATING</small><strong>{grade?.toFixed(1) ?? "—"}</strong></div>
        <div><small>CAP SPEND</small><strong>{formatWheelFootballGmMoney(spend)}</strong></div>
        <div><small>CAP ROOM</small><strong>{formatWheelFootballGmMoney(wheelFootballGmCapRoom(spend))}</strong></div>
      </div>
      <YearRosterTable roster={roster} year={1} />
      <button className="football-gm-primary" type="button" onClick={onContinue}>ENTER THE OFFSEASON →</button>
    </section>
  );
}

function OffseasonScreen({
  yearOneRoster,
  extendedPlayerIds,
  onToggle,
  onLock,
}: {
  yearOneRoster: readonly WheelFootballGmRosterPick[];
  extendedPlayerIds: readonly string[];
  onToggle: (playerId: string) => void;
  onLock: () => void;
}) {
  const extended = new Set(extendedPlayerIds);
  const retained = yearOneRoster.filter((pick) => {
    const player = wheelFootballGmPlayerById.get(pick.playerId);
    return player?.gameContract === "3YR" || extended.has(pick.playerId);
  });
  const spend = wheelFootballGmRosterSpend(retained, 2);
  const room = wheelFootballGmCapRoom(spend);
  const openCount = WHEEL_FOOTBALL_GM_ROSTER_SLOTS.length - retained.length;

  return (
    <section className="football-gm-offseason surface-card">
      <header>
        <p className="eyebrow">THE OFFSEASON</p>
        <h1>Who gets paid?</h1>
        <span>3YR players stay locked. Every 1YR player has hit the market at the calibrated Year 2 price.</span>
      </header>

      <div className={`football-gm-offseason__cap${room < 0 ? " is-over" : ""}`}>
        <div><small>YEAR 2 COMMITTED</small><strong>{formatWheelFootballGmMoney(spend)}</strong></div>
        <div><small>{room < 0 ? "OVER CAP" : "CAP ROOM"}</small><strong>{formatWheelFootballGmMoney(Math.abs(room))}</strong></div>
        <div><small>OPEN SPOTS</small><strong>{openCount}</strong></div>
      </div>

      {room < 0 ? (
        <p className="football-gm-offseason__warning">You cannot carry this group into Year 2. Let at least one expiring player walk.</p>
      ) : null}

      <div className="football-gm-offseason__decisions">
        {yearOneRoster.map((pick) => {
          const player = wheelFootballGmPlayerById.get(pick.playerId);
          if (!player) return null;
          const team = wheelFootballTeam(player.team);
          const locked = player.gameContract === "3YR";
          const keeping = locked || extended.has(player.id);
          return (
            <article className={keeping ? "is-kept" : "is-walk"} key={player.id}>
              <span className="football-gm-offseason__slot">{pick.slot}</span>
              <span className="football-gm-offseason__logo">{team ? teamLogo(team) : player.team}</span>
              <div>
                <strong>{player.player}</strong>
                <small>{locked ? "3YR CONTRACT · LOCKED" : `1YR EXPIRED · ${player.outlook}`}</small>
              </div>
              <span className="football-gm-offseason__price">
                <small>YR 2</small>
                <b>{formatWheelFootballGmMoney(wheelFootballGmPlayerSalary(player, 2))}</b>
              </span>
              {locked ? (
                <span className="football-gm-offseason__locked">KEEP</span>
              ) : (
                <button type="button" onClick={() => onToggle(player.id)}>
                  {keeping ? "LET WALK" : "EXTEND"}
                </button>
              )}
            </article>
          );
        })}
      </div>

      <button className="football-gm-primary" type="button" disabled={room < 0} onClick={onLock}>
        {openCount ? `LOCK PLAN · REFILL ${openCount} SPOT${openCount === 1 ? "" : "S"} →` : "LOCK PLAN · ADVANCE →"}
      </button>
    </section>
  );
}

function FinalScreen({
  yearOneRoster,
  finalRoster,
  onReset,
}: {
  yearOneRoster: readonly WheelFootballGmRosterPick[];
  finalRoster: readonly WheelFootballGmRosterPick[];
  onReset: () => void;
}) {
  const yearOneGrade = wheelFootballGmRosterGrade(yearOneRoster, 1);
  const yearTwoGrade = wheelFootballGmRosterGrade(finalRoster, 2);
  const yearThreeGrade = wheelFootballGmRosterGrade(finalRoster, 3);
  const threeYearGrade = wheelFootballGmThreeYearGrade(yearOneRoster, finalRoster);
  const yearTwoSpend = wheelFootballGmRosterSpend(finalRoster, 2);
  const room = wheelFootballGmCapRoom(yearTwoSpend);

  const verdict = threeYearGrade == null
    ? "INCOMPLETE"
    : threeYearGrade >= 93
      ? "TITLE WINDOW"
      : threeYearGrade >= 89
        ? "CONTENDER"
        : threeYearGrade >= 85
          ? "PLAYOFF CORE"
          : "RETOOL NEEDED";

  return (
    <section className="football-gm-results football-gm-results--final surface-card">
      <header>
        <p className="eyebrow">THREE-YEAR WINDOW COMPLETE</p>
        <h1>{verdict}</h1>
        <span>Your roster quality and the cap decisions that kept it legal across the window.</span>
      </header>

      <div className="football-gm-results__hero">
        <small>3-YEAR ROSTER RATING</small>
        <strong>{threeYearGrade?.toFixed(1) ?? "—"}</strong>
        <span>{formatWheelFootballGmMoney(room)} Year 2/3 cap room</span>
      </div>

      <div className="football-gm-results__years">
        <div><small>YEAR 1</small><strong>{yearOneGrade?.toFixed(1) ?? "—"}</strong></div>
        <div><small>YEAR 2</small><strong>{yearTwoGrade?.toFixed(1) ?? "—"}</strong></div>
        <div><small>YEAR 3</small><strong>{yearThreeGrade?.toFixed(1) ?? "—"}</strong></div>
      </div>

      <h2>Final roster</h2>
      <YearRosterTable roster={finalRoster} year={2} />

      <div className="football-gm-results__cap-footer">
        <span><small>YEAR 2 SPEND</small><strong>{formatWheelFootballGmMoney(yearTwoSpend)}</strong></span>
        <span><small>YEAR 3 SPEND</small><strong>{formatWheelFootballGmMoney(wheelFootballGmRosterSpend(finalRoster, 3))}</strong></span>
        <span><small>CAP</small><strong>{formatWheelFootballGmMoney(WHEEL_FOOTBALL_GM_CAP)}</strong></span>
      </div>

      <button className="football-gm-primary" type="button" onClick={onReset}>START A NEW GM RUN</button>
    </section>
  );
}

export default function FootballGmModePage() {
  const navigate = useNavigate();
  const identity = useIdentity();
  const profileId = identity.profile?.id ?? null;
  const storageKey = profileId ? `octagon-hq:gm-mode-playtest:${profileId}` : null;
  const allTeams = useMemo(() => wheelFootballPoolTeams("NFL"), []);
  const [run, setRun] = useState<GmRun>(EMPTY_RUN);
  const [hydrated, setHydrated] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<WheelFootballGmRosterSlot | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const spinTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!storageKey) return;
    setHydrated(false);
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : null;
      setRun(isGmRun(parsed) ? parsed : EMPTY_RUN);
    } catch {
      setRun(EMPTY_RUN);
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated || !storageKey) return;
    window.localStorage.setItem(storageKey, JSON.stringify(run));
  }, [hydrated, run, storageKey]);

  useEffect(() => () => {
    if (spinTimer.current != null) window.clearTimeout(spinTimer.current);
  }, []);

  const buildPhase = run.phase === "draft" || run.phase === "refill";
  const buildYear: 1 | 2 = run.phase === "refill" ? 2 : 1;
  const openSlots = useMemo(() => wheelFootballGmOpenSlots(run.roster), [run.roster]);
  const spend = buildPhase ? wheelFootballGmRosterSpend(run.roster, buildYear) : 0;
  const remainingCap = WHEEL_FOOTBALL_GM_CAP - spend;
  const usedPlayerKeys = useMemo(() => new Set(run.usedPlayerKeys), [run.usedPlayerKeys]);
  const eligibleTeamCodes = useMemo(() => buildPhase
    ? wheelFootballGmEligibleTeamCodes({
        teamCodes: allTeams.map((team) => team.code),
        openSlots,
        year: buildYear,
        remainingCap,
        usedPlayerKeys,
      })
    : [],
  [allTeams, buildPhase, buildYear, openSlots, remainingCap, usedPlayerKeys]);
  const eligibleCodeSet = useMemo(() => new Set(eligibleTeamCodes), [eligibleTeamCodes]);
  const eligibleTeams = useMemo(
    () => allTeams.filter((team) => eligibleCodeSet.has(team.code)),
    [allTeams, eligibleCodeSet],
  );
  const pendingTeam = run.pendingTeamCode ? wheelFootballTeam(run.pendingTeamCode) : null;

  function resetRun() {
    if (spinTimer.current != null) window.clearTimeout(spinTimer.current);
    setSpinning(false);
    setSelectedSlot(null);
    setRotation(0);
    setRun(EMPTY_RUN);
    if (storageKey) window.localStorage.removeItem(storageKey);
  }

  function spin() {
    if (!buildPhase || spinning || run.pendingTeamCode || !eligibleTeams.length) return;
    const withoutRepeat = eligibleTeams.filter((team) => team.code !== run.lastTeamCode);
    const pool = withoutRepeat.length ? withoutRepeat : eligibleTeams;
    const landed = pool[Math.floor(Math.random() * pool.length)]!;
    const landedIndex = eligibleTeams.findIndex((team) => team.code === landed.code);
    const slice = 360 / Math.max(1, eligibleTeams.length);
    const target = 1440 + (360 - landedIndex * slice);
    setSelectedSlot(null);
    setSpinning(true);
    setRotation((current) => current + target);

    spinTimer.current = window.setTimeout(() => {
      setRun((current) => ({
        ...current,
        pendingTeamCode: landed.code,
        lastTeamCode: landed.code,
      }));
      setSpinning(false);
      spinTimer.current = null;
    }, 900);
  }

  function pickPlayer(player: WheelFootballGmPlayer, slot: WheelFootballGmRosterSlot) {
    if (!buildPhase) return;
    const nextPick: WheelFootballGmRosterPick = {
      slot,
      playerId: player.id,
      acquiredYear: buildYear,
    };
    const nextRoster = [...run.roster.filter((pick) => pick.slot !== slot), nextPick];
    const nextUsed = [...new Set([...run.usedPlayerKeys, player.playerKey])];
    const complete = nextRoster.length === WHEEL_FOOTBALL_GM_ROSTER_SLOTS.length;

    setSelectedSlot(null);
    setRun((current) => {
      if (current.phase === "draft" && complete) {
        return {
          ...current,
          phase: "year1",
          roster: nextRoster,
          yearOneRoster: nextRoster,
          usedPlayerKeys: nextUsed,
          pendingTeamCode: null,
        };
      }
      if (current.phase === "refill" && complete) {
        return {
          ...current,
          phase: "final",
          roster: nextRoster,
          usedPlayerKeys: nextUsed,
          pendingTeamCode: null,
        };
      }
      return {
        ...current,
        roster: nextRoster,
        usedPlayerKeys: nextUsed,
        pendingTeamCode: null,
      };
    });
  }

  function enterOffseason() {
    const expiring = run.yearOneRoster
      .map((pick) => wheelFootballGmPlayerById.get(pick.playerId))
      .filter((player): player is WheelFootballGmPlayer => Boolean(player))
      .filter((player) => player.gameContract === "1YR")
      .map((player) => player.id);
    setRun((current) => ({
      ...current,
      phase: "offseason",
      roster: current.yearOneRoster,
      extendedPlayerIds: expiring,
      pendingTeamCode: null,
    }));
  }

  function toggleExtension(playerId: string) {
    setRun((current) => ({
      ...current,
      extendedPlayerIds: current.extendedPlayerIds.includes(playerId)
        ? current.extendedPlayerIds.filter((id) => id !== playerId)
        : [...current.extendedPlayerIds, playerId],
    }));
  }

  function lockOffseason() {
    const extended = new Set(run.extendedPlayerIds);
    const retained = run.yearOneRoster.filter((pick) => {
      const player = wheelFootballGmPlayerById.get(pick.playerId);
      return player?.gameContract === "3YR" || extended.has(pick.playerId);
    });
    const yearTwoSpend = wheelFootballGmRosterSpend(retained, 2);
    if (yearTwoSpend > WHEEL_FOOTBALL_GM_CAP) return;

    setSelectedSlot(null);
    setRun((current) => ({
      ...current,
      phase: retained.length === WHEEL_FOOTBALL_GM_ROSTER_SLOTS.length ? "final" : "refill",
      roster: retained,
      pendingTeamCode: null,
    }));
  }

  function returnToOffseason() {
    const baseKeys = run.yearOneRoster
      .map((pick) => wheelFootballGmPlayerById.get(pick.playerId)?.playerKey)
      .filter((key): key is string => Boolean(key));
    setSelectedSlot(null);
    setRun((current) => ({
      ...current,
      phase: "offseason",
      roster: current.yearOneRoster,
      usedPlayerKeys: [...new Set(baseKeys)],
      pendingTeamCode: null,
    }));
  }

  if (!hydrated) return null;

  return (
    <div className="page football-gm-page">
      <header className="football-gm-header">
        <button type="button" onClick={() => navigate("/football")}>← FOOTBALL</button>
        <div>
          <p className="eyebrow">OWNER PLAYTEST · NFL</p>
          <h1>GM MODE</h1>
          <span>Build the roster. Survive the offseason. Hold the window.</span>
        </div>
        {run.roster.length || run.yearOneRoster.length ? (
          <button type="button" onClick={resetRun}>RESET</button>
        ) : <span />}
      </header>

      {buildPhase ? (
        <>
          <section className="football-gm-capbar surface-card">
            <div><small>{buildYear === 1 ? "YEAR 1 CAP" : "YEAR 2 CAP"}</small><strong>{formatWheelFootballGmMoney(WHEEL_FOOTBALL_GM_CAP)}</strong></div>
            <div><small>COMMITTED</small><strong>{formatWheelFootballGmMoney(spend)}</strong></div>
            <div><small>REMAINING</small><strong>{formatWheelFootballGmMoney(remainingCap)}</strong></div>
            <div><small>ROSTER</small><strong>{run.roster.length}/7</strong></div>
          </section>

          {run.phase === "refill" ? (
            <section className="football-gm-refill-note surface-card">
              <div>
                <p className="eyebrow">YEAR 2 ROSTER REBUILD</p>
                <strong>Replace the players you let walk.</strong>
                <span>Replacement prices use their Year 2 market number. The wheel automatically removes teams that cannot fit your remaining cap.</span>
              </div>
              <button type="button" onClick={returnToOffseason}>EDIT EXTENSIONS</button>
            </section>
          ) : null}

          <RosterStrip roster={run.roster} year={buildYear} />
          <GmWheel
            teams={eligibleTeams}
            rotation={rotation}
            spinning={spinning}
            pendingTeam={pendingTeam}
            onSpin={spin}
          />

          {pendingTeam ? (
            <CandidatePicker
              team={pendingTeam}
              openSlots={openSlots}
              selectedSlot={selectedSlot}
              year={buildYear}
              remainingCap={remainingCap}
              usedPlayerKeys={usedPlayerKeys}
              onSelectSlot={setSelectedSlot}
              onPick={pickPlayer}
            />
          ) : null}

          {!eligibleTeams.length && openSlots.length ? (
            <section className="football-gm-deadend surface-card">
              <p className="eyebrow">NO LEGAL SPINS</p>
              <h2>You have run out of cap-safe teams.</h2>
              <span>{run.phase === "refill"
                ? "Go back to the offseason and let a different contract walk."
                : "Reset this GM run and attack the cap differently."}</span>
              <button type="button" onClick={run.phase === "refill" ? returnToOffseason : resetRun}>
                {run.phase === "refill" ? "BACK TO OFFSEASON" : "START OVER"}
              </button>
            </section>
          ) : null}
        </>
      ) : null}

      {run.phase === "year1" ? (
        <YearOneScreen roster={run.yearOneRoster} onContinue={enterOffseason} />
      ) : null}

      {run.phase === "offseason" ? (
        <OffseasonScreen
          yearOneRoster={run.yearOneRoster}
          extendedPlayerIds={run.extendedPlayerIds}
          onToggle={toggleExtension}
          onLock={lockOffseason}
        />
      ) : null}

      {run.phase === "final" ? (
        <FinalScreen
          yearOneRoster={run.yearOneRoster}
          finalRoster={run.roster}
          onReset={resetRun}
        />
      ) : null}
    </div>
  );
}
