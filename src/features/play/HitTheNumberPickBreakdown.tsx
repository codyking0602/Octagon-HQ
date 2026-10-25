import "./HitTheNumberPickBreakdown.css";

export type HitTheNumberPickContribution = {
  id: string;
  name: string;
  value: number | null;
};

/** Display precision only; authoritative scoring retains its full recorded values. */
export function formatHitNumberStatValue(value: number): string {
  return Number.isFinite(value)
    ? value.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(value) ? 0 : 1, maximumFractionDigits: 1 })
    : "—";
}

/** Only render this for a completed result, using its recorded pick values. */
export function HitTheNumberPickBreakdown({
  metricLabel,
  picks,
}: {
  metricLabel: string;
  picks: readonly HitTheNumberPickContribution[];
}) {
  if (!picks.length) return null;

  return (
    <section className="hit-number-pick-breakdown" aria-label="Selected player stat breakdown">
      <header>
        <span>YOUR PICKS</span>
        <small>{metricLabel}</small>
      </header>
      <ol>
        {picks.map((pick, index) => (
          <li key={pick.id + "-" + index}>
            <span>{pick.name}</span>
            <strong aria-label={pick.value === null
              ? `${pick.name}: stat unavailable`
              : `${pick.name}: ${formatHitNumberStatValue(pick.value)}`}>
              {pick.value === null ? "—" : formatHitNumberStatValue(pick.value)}
            </strong>
          </li>
        ))}
      </ol>
    </section>
  );
}
