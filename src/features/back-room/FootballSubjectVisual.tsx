import { useEffect, useState } from "react";
import type {
  FootballRankFiveItem,
  FootballRankFivePackId,
} from "./footballRankFiveModel";
import { footballSubjectAsset } from "./footballSubjectAssets";

export type FootballSubjectVisualKind = "player" | "coach" | "program" | "team-season";

interface FootballSubjectVisualMeta {
  kind: FootballSubjectVisualKind;
  shortLabel: string;
  folder: "players" | "coaches" | "programs" | "teams";
}

const VISUAL_META_BY_PACK: Record<FootballRankFivePackId, FootballSubjectVisualMeta> = {
  "nfl-quarterbacks": { kind: "player", shortLabel: "QB", folder: "players" },
  "nfl-running-backs": { kind: "player", shortLabel: "RB", folder: "players" },
  "nfl-wide-receivers": { kind: "player", shortLabel: "WR", folder: "players" },
  "nfl-tight-ends": { kind: "player", shortLabel: "TE", folder: "players" },
  "nfl-defensive-players": { kind: "player", shortLabel: "DEF", folder: "players" },
  "nfl-head-coaches": { kind: "coach", shortLabel: "HC", folder: "coaches" },
  "nfl-qb-seasons": { kind: "player", shortLabel: "QB", folder: "players" },
  "nfl-team-seasons": { kind: "team-season", shortLabel: "TEAM", folder: "teams" },
  "college-quarterbacks": { kind: "player", shortLabel: "QB", folder: "players" },
  "college-head-coaches": { kind: "coach", shortLabel: "HC", folder: "coaches" },
  "college-programs": { kind: "program", shortLabel: "PROGRAM", folder: "programs" },
  "college-program-eras": { kind: "program", shortLabel: "ERA", folder: "programs" },
  "college-team-seasons": { kind: "team-season", shortLabel: "TEAM", folder: "teams" },
};

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
  const asset = footballSubjectAsset(item.id);
  const [assetFailed, setAssetFailed] = useState(false);
  const classes = ["football-subject-visual", `is-${meta.kind}`, className].filter(Boolean).join(" ");

  useEffect(() => {
    setAssetFailed(false);
  }, [asset?.src, item.id]);

  return (
    <span
      className={classes}
      data-asset-path={footballSubjectAssetPath(item.id, packId)}
      data-visual-kind={asset?.kind ?? "fallback"}
      aria-label={`${item.name} visual`}
    >
      {asset && !assetFailed ? (
        <img
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          src={asset.src}
          title={asset.label}
          onError={() => setAssetFailed(true)}
        />
      ) : (
        <span className="football-subject-visual__fallback" aria-hidden="true">
          <b>{item.league}</b>
          <small>{meta.shortLabel}</small>
        </span>
      )}
    </span>
  );
}
