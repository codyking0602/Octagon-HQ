export const FOOTBALL_TIME_ZONE = "America/Chicago";
export const FOOTBALL_TIME_ZONE_LABEL = "CT";

export function footballDateTimeLabel(value: string, includeWeekday = true) {
  const label = new Intl.DateTimeFormat("en-US", {
    ...(includeWeekday ? { weekday: "short" as const } : {}),
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: FOOTBALL_TIME_ZONE,
  }).format(new Date(value));

  return `${label} ${FOOTBALL_TIME_ZONE_LABEL}`;
}
