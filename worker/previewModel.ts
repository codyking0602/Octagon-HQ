export type RichPreviewKind =
  | "default"
  | "fighter"
  | "ranking"
  | "comparison"
  | "challenge"
  | "game-result"
  | "picks-recap"
  | "major-ranking-update";

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

export interface GamePreviewDefinition {
  id: string;
  title: string;
  description: string;
  imagePath: string;
}

export interface RichPreviewCatalog {
  version: 2;
  fighters: RankingPreviewFighter[];
  games: GamePreviewDefinition[];
  fighterAssets: Record<string, string>;
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

export interface DynamicPreviewRequest {
  kind: "challenge" | "picks-recap" | "major-ranking-update";
  key: string;
}

interface DynamicChallengePreview {
  kind: "challenge";
  game_id: string;
  game_title: string;
  summary: string;
}

interface DynamicGameResultPreview {
  kind: "game-result";
  game_id: string;
  game_title: string;
  summary: string;
  creator_name: string;
  responder_name: string;
  creator_score: string;
  responder_score: string;
  verdict: string;
}

interface PicksLeader {
  display_name: string;
  correct: number;
  incorrect: number;
  missing: number;
  total_points: number;
}

interface DynamicPicksRecapPreview {
  kind: "picks-recap";
  event_id: string;
  event_name: string;
  subtitle: string;
  entrant_count: number;
  leaders: PicksLeader[];
  main_event: {
    red_fighter_slug: string;
    red_fighter_name: string;
    blue_fighter_slug: string;
    blue_fighter_name: string;
  } | null;
}

interface RankingMovement {
  fighter_slug: string;
  fighter_name: string;
  board: "men" | "women";
  previous_rank: number;
  current_rank: number;
  movement: number;
}

interface DynamicMajorRankingPreview {
  kind: "major-ranking-update";
  source_sha: string;
  title: string;
  summary: string;
  movement_count: number;
  movements: RankingMovement[];
}

export type DynamicPreviewData =
  | DynamicChallengePreview
  | DynamicGameResultPreview
  | DynamicPicksRecapPreview
  | DynamicMajorRankingPreview;

const DEFAULT_PREVIEW: RichPreviewMetadata = {
  kind: "default",
  title: "Octagon HQ",
  description: "UFC rankings, games, picks, and conversation built for the group chat.",
  canonicalPath: "/",
  images: [{ path: "/assets/app-icon.png", alt: "Octagon HQ" }],
};

const legacyRankingLabel = new RegExp("\\bG\\.?O\\.?A\\.?T\\.?\\b", "gi");
const accentedCareerLabel = new RegExp("r(?:é|e)sum(?:é|e)", "gi");

function plainCopy(value: string) {
  return value
    .replace(legacyRankingLabel, "UFC")
    .replace(accentedCareerLabel, "resume")
    .replace(/\s+/g, " ")
    .trim();
}

function clipped(value: string, maximum = 190) {
  const copy = plainCopy(value);
  return copy.length <= maximum ? copy : `${copy.slice(0, maximum - 1).trimEnd()}…`;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}

function fighterBySlug(catalog: RichPreviewCatalog, value: string | null) {
  const slug = (value ?? "").trim();
  return slug ? catalog.fighters.find((fighter) => fighter.slug === slug) : undefined;
}

function gameById(catalog: RichPreviewCatalog, value: string | null) {
  const gameId = (value ?? "").trim();
  return gameId ? catalog.games.find((game) => game.id === gameId) : undefined;
}

function boardLabel(board: RankingPreviewFighter["board"]) {
  return board === "women" ? "women's UFC all-time board" : "men's UFC all-time board";
}

function fighterImage(fighter: RankingPreviewFighter): RichPreviewImage {
  return {
    path: fighter.imagePath,
    alt: `${fighter.displayName}, ranked #${fighter.rank} in Octagon HQ`,
  };
}

function assetImage(catalog: RichPreviewCatalog, slug: string, name: string): RichPreviewImage | null {
  const path = catalog.fighterAssets[slug] ?? fighterBySlug(catalog, slug)?.imagePath;
  return path ? { path, alt: plainCopy(name || slug) } : null;
}

function uniqueImages(images: Array<RichPreviewImage | null>, fallback: RichPreviewImage) {
  const seen = new Set<string>();
  const result = images.flatMap((image) => {
    if (!image || seen.has(image.path)) return [];
    seen.add(image.path);
    return [image];
  }).slice(0, 2);
  return result.length ? result : [fallback];
}

function gameImage(game: GamePreviewDefinition | undefined): RichPreviewImage {
  return game
    ? { path: game.imagePath, alt: `${game.title} challenge` }
    : { path: "/assets/app-icon.png", alt: "Octagon HQ game challenge" };
}

function requestPath(requestUrl: URL) {
  return `${requestUrl.pathname}${requestUrl.search}`;
}

function challengeCode(value: string | null) {
  const code = (value ?? "").trim().toUpperCase();
  return /^[A-Z0-9]{8}$/.test(code) ? code : "";
}

export function dynamicPreviewRequest(requestUrl: URL): DynamicPreviewRequest | null {
  if (requestUrl.pathname === "/picks" || requestUrl.pathname === "/picks/") {
    const eventId = (requestUrl.searchParams.get("event") ?? "").trim().toLowerCase();
    if (requestUrl.searchParams.get("view") === "recap" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(eventId)) {
      return { kind: "picks-recap", key: eventId };
    }
  }

  if (requestUrl.pathname === "/rankings" || requestUrl.pathname === "/rankings/") {
    const update = (requestUrl.searchParams.get("update") ?? "").trim().toLowerCase();
    if (/^[0-9a-f]{40}$/.test(update)) return { kind: "major-ranking-update", key: update };
  }

  if (requestUrl.pathname === "/play" || requestUrl.pathname === "/play/") {
    const code = challengeCode(requestUrl.searchParams.get("challenge"));
    return code ? { kind: "challenge", key: code } : null;
  }

  const gameMatch = requestUrl.pathname.match(/^\/play\/([^/]+)\/?$/);
  if (!gameMatch) return null;
  const gameId = safeDecode(gameMatch[1] ?? "");
  const matchCode = challengeCode(requestUrl.searchParams.get("match"));
  const findLeaderCode = gameId === "find-leader"
    ? challengeCode(requestUrl.searchParams.get("challenge"))
    : "";
  const code = matchCode || findLeaderCode;
  return code ? { kind: "challenge", key: code } : null;
}

function isDynamicPreviewData(value: unknown): value is DynamicPreviewData {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const kind = (value as { kind?: unknown }).kind;
  return kind === "challenge"
    || kind === "game-result"
    || kind === "picks-recap"
    || kind === "major-ranking-update";
}

function staticGameChallenge(requestUrl: URL, catalog: RichPreviewCatalog) {
  const gameMatch = requestUrl.pathname.match(/^\/play\/([^/]+)\/?$/);
  if (!gameMatch || !requestUrl.search) return null;
  const game = gameById(catalog, safeDecode(gameMatch[1] ?? ""));
  if (!game) return null;
  return {
    kind: "challenge" as const,
    title: `${game.title} challenge | Octagon HQ`,
    description: clipped(`${game.description} Open the exact locked challenge and play the same setup.`),
    canonicalPath: requestPath(requestUrl),
    images: [gameImage(game)],
  };
}

function dynamicMetadata(
  requestUrl: URL,
  catalog: RichPreviewCatalog,
  data: DynamicPreviewData,
): RichPreviewMetadata {
  if (data.kind === "challenge") {
    const game = gameById(catalog, data.game_id);
    return {
      kind: "challenge",
      title: `${plainCopy(data.game_title)} challenge | Octagon HQ`,
      description: clipped(`${data.summary} Open the exact locked challenge and play the same setup.`),
      canonicalPath: requestPath(requestUrl),
      images: [gameImage(game)],
    };
  }

  if (data.kind === "game-result") {
    const game = gameById(catalog, data.game_id);
    return {
      kind: "game-result",
      title: `${plainCopy(data.game_title)} result | ${plainCopy(data.verdict)} | Octagon HQ`,
      description: clipped(
        `${data.creator_name} ${data.creator_score} vs. ${data.responder_name} ${data.responder_score}. ${data.verdict}. ${data.summary}`,
      ),
      canonicalPath: requestPath(requestUrl),
      images: [gameImage(game)],
    };
  }

  if (data.kind === "picks-recap") {
    const leaders = Array.isArray(data.leaders) ? data.leaders : [];
    const leaderNames = leaders.map((leader) => plainCopy(leader.display_name)).filter(Boolean);
    const lead = leaders[0];
    const winnerCopy = lead
      ? leaderNames.length > 1
        ? `${leaderNames.join(" & ")} tied for first with ${lead.total_points} points`
        : `${leaderNames[0]} won with ${lead.total_points} points (${lead.correct}-${lead.incorrect})`
      : `${data.entrant_count} entrants completed the card`;
    const mainEvent = data.main_event;
    const mainEventCopy = mainEvent
      ? ` Main event: ${mainEvent.red_fighter_name} vs. ${mainEvent.blue_fighter_name}.`
      : "";
    const fallback = { path: "/assets/share/picks-recap.svg", alt: "UFC Picks event recap" };
    const images = mainEvent
      ? uniqueImages([
          assetImage(catalog, mainEvent.red_fighter_slug, mainEvent.red_fighter_name),
          assetImage(catalog, mainEvent.blue_fighter_slug, mainEvent.blue_fighter_name),
        ], fallback)
      : [fallback];
    return {
      kind: "picks-recap",
      title: `${plainCopy(data.event_name)} Picks recap | Octagon HQ`,
      description: clipped(`${winnerCopy}.${mainEventCopy}`),
      canonicalPath: requestPath(requestUrl),
      images,
    };
  }

  const movements = Array.isArray(data.movements) ? data.movements : [];
  const topMoves = movements.slice(0, 3);
  const movementCopy = topMoves.map((movement) => (
    `${plainCopy(movement.fighter_name)} #${movement.previous_rank} to #${movement.current_rank}`
  )).join("; ");
  const fallback = { path: "/assets/share/ranking-update.svg", alt: "Major UFC ranking update" };
  const images = uniqueImages(
    topMoves.map((movement) => assetImage(catalog, movement.fighter_slug, movement.fighter_name)),
    fallback,
  );
  return {
    kind: "major-ranking-update",
    title: `${plainCopy(data.title)} | Octagon HQ`,
    description: clipped(`${data.summary}${movementCopy ? ` Top moves: ${movementCopy}.` : ""}`),
    canonicalPath: requestPath(requestUrl),
    images,
  };
}

export function resolveRichPreview(
  requestUrl: URL,
  catalog: RichPreviewCatalog,
  dynamicData?: unknown,
): RichPreviewMetadata {
  if (isDynamicPreviewData(dynamicData)) {
    return dynamicMetadata(requestUrl, catalog, dynamicData);
  }

  const fighterMatch = requestUrl.pathname.match(/^\/fighters\/([^/]+)\/?$/);
  if (fighterMatch) {
    const fighter = fighterBySlug(catalog, safeDecode(fighterMatch[1] ?? ""));
    if (!fighter) return DEFAULT_PREVIEW;

    return {
      kind: "fighter",
      title: `${fighter.displayName} | UFC Rank #${fighter.rank} | Octagon HQ`,
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
          `UFC comparison: #${left.rank} ${left.displayName} (${left.ovr} OVR) vs. #${right.rank} ${right.displayName} (${right.ovr} OVR).`,
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
        title: `${rankedFighter.displayName} is ranked #${rankedFighter.rank} | Octagon HQ`,
        description: clipped(
          `${rankedFighter.displayName} holds the #${rankedFighter.rank} spot on the ${boardLabel(rankedFighter.board)} with a ${rankedFighter.ovr} OVR.`,
        ),
        canonicalPath: `/rankings?${search.toString()}`,
        images: [fighterImage(rankedFighter)],
      };
    }
  }

  return staticGameChallenge(requestUrl, catalog) ?? DEFAULT_PREVIEW;
}
