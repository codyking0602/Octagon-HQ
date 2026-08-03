export type EffectiveScope = "main" | "full";
export type CardSection = "main-event" | "main" | "prelim" | "early-prelim";

export interface SectionedBout {
  section: CardSection;
}

export function selectImportedBouts<T extends SectionedBout>(
  bouts: T[],
  scope: EffectiveScope,
): T[] {
  return bouts.filter((bout) => (
    bout.section !== "early-prelim"
    && (
      scope === "full"
      || bout.section === "main-event"
      || bout.section === "main"
    )
  ));
}

export function segmentImportedBouts<T extends SectionedBout>(bouts: T[]) {
  const totals = bouts.reduce((counts, bout) => {
    if (bout.section === "early-prelim") {
      throw new Error("Early Prelims are not eligible for Picks import.");
    }
    const segment = bout.section === "prelim" ? "prelim" : "main";
    counts[segment] += 1;
    return counts;
  }, { prelim: 0, main: 0 });
  const seen = { prelim: 0, main: 0 };

  return bouts.map((bout) => {
    const card_segment = bout.section === "prelim" ? "prelim" as const : "main" as const;
    seen[card_segment] += 1;
    return {
      bout,
      card_segment,
      segment_sequence: totals[card_segment] - seen[card_segment] + 1,
    };
  });
}
