export type DirectCanonicalDestination =
  | { kind: "fighter"; fighterSlug: string }
  | { kind: "ranking"; fighterSlug: string }
  | {
      kind: "comparison";
      leftFighterSlug: string;
      rightFighterSlug: string;
    }
  | { kind: "game-result"; gameSlug: string; resultId: string }
  | { kind: "challenge"; challengeId: string }
  | { kind: "auction"; auctionId: string }
  | { kind: "picks-event"; eventId: string }
  | { kind: "picks-recap"; eventId: string }
  | { kind: "daily-challenge"; sport: "ufc" | "football" }
  | {
      kind: "war-room";
      conversationId: string;
      messageId?: string;
    };

export type CanonicalDestination =
  | DirectCanonicalDestination
  | {
      kind: "notification-target";
      target: DirectCanonicalDestination;
    };

function requiredValue(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${label} is required to build a canonical destination.`);
  }
  return normalized;
}

function pathSegment(value: string, label: string): string {
  return encodeURIComponent(requiredValue(value, label));
}

function withSearch(pathname: string, entries: ReadonlyArray<readonly [string, string]>): string {
  const search = new URLSearchParams();
  entries.forEach(([key, value]) => search.set(key, requiredValue(value, key)));
  return `${pathname}?${search.toString()}`;
}

/**
 * Returns the stable, app-relative destination for anything that can be shared
 * or opened from a notification. Feature screens remain responsible for
 * consuming their own search parameters.
 */
export function canonicalDestinationPath(destination: CanonicalDestination): string {
  if (destination.kind === "notification-target") {
    return canonicalDestinationPath(destination.target);
  }

  switch (destination.kind) {
    case "fighter":
      return `/fighters/${pathSegment(destination.fighterSlug, "fighterSlug")}`;
    case "ranking":
      return withSearch("/rankings", [["fighter", destination.fighterSlug]]);
    case "comparison":
      return withSearch("/rankings", [
        ["compareLeft", destination.leftFighterSlug],
        ["compareRight", destination.rightFighterSlug],
      ]);
    case "game-result":
      return withSearch(`/play/${pathSegment(destination.gameSlug, "gameSlug")}`, [
        ["result", destination.resultId],
      ]);
    case "challenge":
      return withSearch("/play", [["challenge", destination.challengeId]]);
    case "auction":
      return withSearch("/play/auction", [["auction", destination.auctionId]]);
    case "picks-event":
      return withSearch("/picks", [["event", destination.eventId]]);
    case "picks-recap":
      return withSearch("/picks", [
        ["event", destination.eventId],
        ["view", "recap"],
      ]);
    case "daily-challenge":
      return destination.sport === "football" ? "/back-room/football/today" : "/play";
    case "war-room": {
      const entries: Array<readonly [string, string]> = [
        ["conversation", destination.conversationId],
      ];
      if (destination.messageId) entries.push(["message", destination.messageId]);
      return withSearch("/war-room", entries);
    }
  }
}

export function canonicalDestinationUrl(
  destination: CanonicalDestination,
  appOrigin: string,
): string {
  const origin = new URL(appOrigin);
  if (origin.protocol !== "https:" && origin.protocol !== "http:") {
    throw new Error("appOrigin must use http or https.");
  }
  return new URL(canonicalDestinationPath(destination), `${origin.origin}/`).toString();
}
