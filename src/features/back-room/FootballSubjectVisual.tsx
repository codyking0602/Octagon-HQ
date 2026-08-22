import type {
  FootballRankFiveItem,
  FootballRankFivePackId,
} from "./footballRankFiveModel";

export type FootballSubjectVisualKind = "player" | "coach" | "program" | "team-season";

interface FootballSubjectVisualMeta {
  kind: FootballSubjectVisualKind;
  shortLabel: string;
  folder: "players" | "coaches" | "programs" | "teams";
}

const VISUAL_META_BY_PACK: Record<FootballRankFivePackId, FootballSubjectVisualMeta> = {
  "nfl-quarterbacks": { kind: "player", shortLabel: "QB", folder: "players" },
  "nfl-running-backs": { kind: "player", shortLabel: "RB", folder: "players" },
  "nfl-head-coaches": { kind: "coach", shortLabel: "HC", folder: "coaches" },
  "college-quarterbacks": { kind: "player", shortLabel: "QB", folder: "players" },
  "college-programs": { kind: "program", shortLabel: "PROGRAM", folder: "programs" },
  "college-team-seasons": { kind: "team-season", shortLabel: "TEAM", folder: "teams" },
};

/**
 * Canonical Football game-art registry.
 *
 * Add only approved square player/coach headshots or transparent team/program marks here.
 * The filename convention is owned by footballSubjectAssetPath; game pages should never
 * construct alternate image URLs or maintain their own visual registries.
 */
export const footballSubjectAssets: Readonly<Partial<Record<string, string>>> = {};

export function footballSubjectVisualMeta(packId: FootballRankFivePackId) {
  return VISUAL_META_BY_PACK[packId];
}

export function footballSubjectAssetPath(itemId: string, packId: FootballRankFivePackId) {
  const meta = footballSubjectVisualMeta(packId);
  return `/images/football/${meta.folder}/${itemId}.webp`;
}

export function FootballSubjectVisual({
  item,
  packId,
  className = "",
}: {
  item: Pick<FootballRankFiveItem, "id" | "name" | "league">;
  packId: FootballRankFivePackId;
  className?: string;
}) {
  const meta = footballSubjectVisualMeta(packId);
  const registered = footballSubjectAssets[item.id];
  const classes = ["football-subject-visual", `is-${meta.kind}`, className].filter(Boolean).join(" ");

  return (
    <span
      className={classes}
      data-asset-path={footballSubjectAssetPath(item.id, packId)}
      aria-label={`${item.name} visual`}
    >
      {registered ? (
        <img alt="" src={registered} />
      ) : (
        <span className="football-subject-visual__fallback" aria-hidden="true">
          <b>{item.league}</b>
          <small>{meta.shortLabel}</small>
        </span>
      )}
    </span>
  );
}
