import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import "./nextNumberedUfcEvent.css";

interface NumberedEvent {
  name: string;
  matchup: string;
  startsAt: string;
  venue: string;
  location: string;
  imageUrl: string | null;
}

function nextEventTime(iso: string) {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long", month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  }).format(date);
}

export function countdownUnits(startsAt: string, now: number) {
  const remaining = Math.max(0, Date.parse(startsAt) - now);
  if (!Number.isFinite(remaining)) return null;
  const minutes = Math.floor(remaining / 60_000);
  return {
    days: String(Math.floor(minutes / (24 * 60))).padStart(2, "0"),
    hours: String(Math.floor((minutes % (24 * 60)) / 60)).padStart(2, "0"),
    minutes: String(minutes % 60).padStart(2, "0"),
  };
}

export function NextNumberedUfcEvent({ canControl }: { canControl: boolean }) {
  const [event, setEvent] = useState<NumberedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch("/api/ufc/next-numbered-event?v=2", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Event schedule unavailable");
        const result = await response.json() as { event?: NumberedEvent | null };
        if (controller.signal.aborted) return;
        const candidate = result?.event;
        setEvent(candidate && /^UFC \d{3}$/.test(candidate.name)
          && Number.isFinite(Date.parse(candidate.startsAt))
          && Date.parse(candidate.startsAt) > Date.now() ? candidate : null);
      } catch {
        if (!controller.signal.aborted) setEvent(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void refresh();
    const scheduleRefresh = setInterval(() => void refresh(), 15 * 60_000);
    return () => {
      controller.abort();
      clearInterval(scheduleRefresh);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const upcoming = event && Date.parse(event.startsAt) > now ? event : null;
  const countdown = upcoming ? countdownUnits(upcoming.startsAt, now) : null;
  const style = upcoming?.imageUrl
    ? ({ "--ufc-next-event-art": "url(" + JSON.stringify(upcoming.imageUrl) + ")" } as CSSProperties)
    : undefined;

  return (
    <div className="ufc-next-event-wrap">
      <section className="surface-card ufc-next-event" aria-label="Next UFC Picks event" aria-live="polite">
        <div className="ufc-next-event__art" style={style} aria-hidden="true">
          <span>UFC</span>
        </div>
        <div className="ufc-next-event__body">
          <p className="ufc-next-event__eyebrow">NEXT PICKS EVENT</p>
          {upcoming ? (
            <>
              <h2>{upcoming.name}</h2>
              <strong className="ufc-next-event__matchup">{upcoming.matchup}</strong>
              <p className="ufc-next-event__date">{nextEventTime(upcoming.startsAt)}</p>
              {upcoming.venue ? <p className="ufc-next-event__venue">{upcoming.venue}{upcoming.location ? " · " + upcoming.location : ""}</p> : null}
              <div className="ufc-next-event__divider" />
              <p className="ufc-next-event__timer-label">COUNTDOWN TO FIGHT NIGHT</p>
              <div className="ufc-next-event__countdown" role="timer" aria-label="Time until next numbered UFC event">
                {([
                  [countdown?.days ?? "00", "DAYS"],
                  [countdown?.hours ?? "00", "HRS"],
                  [countdown?.minutes ?? "00", "MIN"],
                ] as const).map(([value, label]) => (
                  <div key={label} className="ufc-next-event__time">
                    <strong>{value}</strong><span>{label}</span>
                  </div>
                ))}
              </div>
              <p className="ufc-next-event__status">Picks open closer to fight night</p>
            </>
          ) : (
            <>
              <h2>NEXT NUMBERED UFC EVENT</h2>
              <p className="ufc-next-event__fallback">{loading
                ? "Checking the official UFC calendar…"
                : "Event details are being updated. Check back soon."}</p>
              <p className="ufc-next-event__status">Picks open closer to fight night</p>
            </>
          )}
        </div>
      </section>
      {canControl ? <Link className="ufc-next-event__owner" to="/picks/control#setup">Manage Picks event setup</Link> : null}
    </div>
  );
}
