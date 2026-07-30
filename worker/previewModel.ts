export type RichPreviewKind = "default" | "fighter" | "ranking" | "comparison";

export interface RankingPreviewFighter {
  slug: string;
  displayName: string;
  board: "men" | "women";
  rank: number;
  ovr: number;
  division: string;
  oneLiner: string;
  imagePath: string;
}

export interface RankingPreviewCatalog {
  version: 1;
  fighters: RankingPreviewFighter[];
}

export interface RichPreviewImage {
  path: string;
  alt: string;
}

export interface RichPreviewMetadata {
  kind: RichPreviewKind;
  title: string;
  description: string;
  canonicalPath: string;
  images: RichPreviewImage[];
}

const DEFAULT_PREVIEW: RichPreviewMetadata = {
  kind: "default",
  title: "Octagon HQ",
  description: "UFC rankings, games, picks, and conversation built for the group chat.",
  canonicalPath: "/",
  images: [{ path: "/assets/app-icon.png", alt: "Octagon HQ" }],
};

function clipped(value: string, maximum = 190) {
  const copy = value.replace(/\s+/g, " ").trim();
  return copy.length <= maximum ? copy : `${copy.slice(0, maximum - 1).trimEnd()}…`;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}

function fighterBySlug(catalog: RankingPreviewCatalog, value: string | null) {
  const slug = (value ?? "").trim();
  return slug ? catalog.fighters.find((fighter) => fighter.slug === slug) : undefined;
}

function boardLabel(board: RankingPreviewFighter["board"]) {
  return board === "women" ? "women's UFC GOAT board" : "men's UFC GOAT board";
}

function fighterImage(fighter: RankingPreviewFighter): RichPreviewImage {
  return {
    path: fighter.imagePath,
    alt: `${fighter.displayName}, ranked #${fighter.rank} in Octagon HQ`,
  };
}

export function resolveRichPreview(
  requestUrl: URL,
  catalog: RankingPreviewCatalog,
): RichPreviewMetadata {
  const fighterMatch = requestUrl.pathname.match(/^\/fighters\/([^/]+)\/?$/);
  if (fighterMatch) {
    const fighter = fighterBySlug(catalog, safeDecode(fighterMatch[1] ?? ""));
    if (!fighter) return DEFAULT_PREVIEW;

    return {
      kind: "fighter",
      title: `${fighter.displayName} | UFC GOAT #${fighter.rank} | Octagon HQ`,
      description: clipped(
        `${fighter.displayName} is ranked #${fighter.rank} on the ${boardLabel(fighter.board)} with a ${fighter.ovr} OVR. ${fighter.oneLiner}`,
      ),
      canonicalPath: `/fighters/${encodeURIComponent(fighter.slug)}`,
      images: [fighterImage(fighter)],
    };
  }

  if (requestUrl.pathname === "/rankings" || requestUrl.pathname === "/rankings/") {
    const left = fighterBySlug(catalog, requestUrl.searchParams.get("compareLeft"));
    const right = fighterBySlug(catalog, requestUrl.searchParams.get("compareRight"));
    if (left && right && left.slug !== right.slug) {
      const search = new URLSearchParams({
        compareLeft: left.slug,
        compareRight: right.slug,
      });
      return {
        kind: "comparison",
        title: `${left.displayName} vs. ${right.displayName} | Octagon HQ`,
        description: clipped(
          `UFC GOAT comparison: #${left.rank} ${left.displayName} (${left.ovr} OVR) vs. #${right.rank} ${right.displayName} (${right.ovr} OVR).`,
        ),
        canonicalPath: `/rankings?${search.toString()}`,
        images: [fighterImage(left), fighterImage(right)],
      };
    }

    const rankedFighter = fighterBySlug(catalog, requestUrl.searchParams.get("fighter"));
    if (rankedFighter) {
      const search = new URLSearchParams({ fighter: rankedFighter.slug });
      return {
        kind: "ranking",
        title: `${rankedFighter.displayName} is UFC GOAT #${rankedFighter.rank} | Octagon HQ`,
        description: clipped(
          `${rankedFighter.displayName} holds the #${rankedFighter.rank} spot on the ${boardLabel(rankedFighter.board)} with a ${rankedFighter.ovr} OVR.`,
        ),
        canonicalPath: `/rankings?${search.toString()}`,
        images: [fighterImage(rankedFighter)],
      };
    }
  }

  return DEFAULT_PREVIEW;
}
