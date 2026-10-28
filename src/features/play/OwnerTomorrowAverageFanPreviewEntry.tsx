import { useEffect, useMemo, useState } from "react";
import type { PlaySport } from "./playRegistry";
import { createOwnerAverageFanPreviewRepository } from "./todayChallengeRepository";

export function nextCentralDay(day: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12));
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function previewDayLabel(day: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${day}T12:00:00Z`));
}

export default function OwnerTomorrowAverageFanPreviewEntry({
  enabled,
  sport,
  centralDay,
  onNavigate,
}: {
  enabled: boolean;
  sport: PlaySport;
  centralDay: string;
  onNavigate: (route: string) => void;
}) {
  const tomorrow = useMemo(() => nextCentralDay(centralDay), [centralDay]);
  const [available, setAvailable] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let active = true;
    setAvailable(false);
    setStarted(false);

    if (!enabled || !tomorrow || (sport !== "ufc" && sport !== "football")) {
      return () => { active = false; };
    }

    const repository = createOwnerAverageFanPreviewRepository(tomorrow, sport);
    if (!repository) return () => { active = false; };

    void repository.load()
      .then((projection) => {
        if (!active || projection.gameType !== "average_fan") return;
        setAvailable(true);
        setStarted(projection.progressRevision > 0);
      })
      .catch(() => {
        if (active) setAvailable(false);
      });

    return () => { active = false; };
  }, [enabled, sport, tomorrow]);

  if (!available || !tomorrow) return null;

  const route = `/play/average-fan-preview?day=${encodeURIComponent(tomorrow)}&sport=${sport}`;

  return (
    <button
      className="today-hub-owner-preview"
      type="button"
      onClick={() => onNavigate(route)}
      aria-label={`${started ? "Continue" : "Preview"} tomorrow’s Average Fan Daily`}
    >
      <span>
        <small>OWNER PREVIEW · {previewDayLabel(tomorrow).toUpperCase()}</small>
        <strong>{started ? "Continue Tomorrow’s Game" : "Preview Tomorrow’s Game"}</strong>
      </span>
      <em>OPEN →</em>
    </button>
  );
}
