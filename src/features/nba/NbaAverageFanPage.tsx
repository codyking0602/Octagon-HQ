import { useSearchParams } from "react-router-dom";
import AverageFanPrototypePage from "../play/AverageFanPrototypePage";

/** Owner-only NBA local rehearsal. The Daily-style mode is date-seeded and never persists official attempts. */
export function nbaAverageFanChicagoDay(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function nbaAverageFanPreviewSeed(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(`${day}T12:00:00.000Z`))) {
    throw new Error("NBA Average Fan preview day must be a real YYYY-MM-DD date.");
  }
  return `nba-average-fan-daily-preview-v1|${day}`;
}

export default function NbaAverageFanPage() {
  const [params] = useSearchParams();
  const daily = params.get("mode") === "daily";
  const requestedDay = params.get("day");
  const day = requestedDay && /^\d{4}-\d{2}-\d{2}$/.test(requestedDay)
    && !Number.isNaN(Date.parse(`${requestedDay}T12:00:00.000Z`))
    ? requestedDay : nbaAverageFanChicagoDay();
  return <AverageFanPrototypePage lockedSport="nba" previewSeed={daily ? nbaAverageFanPreviewSeed(day) : undefined} />;
}
