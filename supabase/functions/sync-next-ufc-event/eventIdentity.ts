export interface EventIdentity {
  name: string;
  subtitle: string;
  venue: string;
  location: string;
  starts_at: string;
}

export interface ArticleIdentity {
  url: string;
  title: string;
  metadata: string;
  body: string;
  cardDateText: string;
  publishedAt: string;
  usedSectionHeadings: boolean;
  boutCount: number;
}

export interface IdentityMatch {
  accepted: boolean;
  score: number;
  date: "match" | "conflict" | "unknown";
  signals: string[];
  reason: string;
}

const genericTokens = new Set([
  "ufc", "fight", "fights", "card", "main", "prelim", "prelims", "night", "event",
  "arena", "center", "centre", "the", "and", "with", "from", "live", "stream", "start", "time",
]);

function normalized(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(value: string, minimumLength = 3) {
  return Array.from(new Set(normalized(value).split(/\s+/).filter((token) => token.length >= minimumLength && !genericTokens.has(token))));
}

function eventNumber(value: string) {
  return normalized(value).match(/\bufc\s+(\d{3,4})\b/)?.[1] ?? "";
}

function headliners(subtitle: string) {
  const parts = subtitle.split(/\s+(?:vs\.?|versus|v\.?)\s+/i);
  if (parts.length !== 2) return [];
  return parts.map((name) => tokens(name, 2)).filter((nameTokens) => nameTokens.length > 0);
}

function containsName(haystack: string, nameTokens: string[]) {
  // Requiring every meaningful name token avoids confusing fighters who share a surname.
  return nameTokens.every((token) => new RegExp(`\\b${token}\\b`, "i").test(haystack));
}

function isoDay(value: string) {
  const match = value.match(/\b(20\d{2})-(\d{2})-(\d{2})(?!\d)/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
}

const months: Record<string, string> = {
  january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
  july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
  jan: "01", feb: "02", mar: "03", apr: "04", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function explicitDays(value: string) {
  const days = new Set<string>();
  for (const match of value.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})\b/g)) days.add(`${match[1]}-${match[2]}-${match[3]}`);
  for (const match of value.matchAll(/\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s+(20\d{2})\b/gi)) {
    const month = months[match[1].toLowerCase().replace("sept", "sep")];
    if (month) days.add(`${match[3]}-${month}-${match[2].padStart(2, "0")}`);
  }
  return days;
}

function dayDistance(left: string, right: string) {
  const leftTime = Date.parse(`${left}T00:00:00Z`);
  const rightTime = Date.parse(`${right}T00:00:00Z`);
  return Number.isNaN(leftTime) || Number.isNaN(rightTime) ? Number.POSITIVE_INFINITY : Math.abs(leftTime - rightTime) / 86400000;
}

function locationSignals(event: EventIdentity, haystack: string) {
  const groups = Array.from(new Map(
    [event.venue, ...event.location.split(/[,|]/)].map((part) => tokens(part)).filter((part) => part.length > 0)
      .map((group) => [group.join("|"), group]),
  ).values());
  return groups.filter((group) => group.every((token) => new RegExp(`\\b${token}\\b`, "i").test(haystack))).length;
}

export function matchEventIdentity(event: EventIdentity, article: ArticleIdentity): IdentityMatch {
  if (!article.usedSectionHeadings || article.boutCount < 4 || article.boutCount > 20) {
    return { accepted: false, score: 0, date: "unknown", signals: [], reason: "card parsing: no plausible section-aware card was parsed" };
  }

  const haystack = normalized(`${article.title} ${article.url} ${article.metadata} ${article.body}`);
  const expectedDay = isoDay(event.starts_at);
  // Only card/event date copy can reject identity. Publication timestamps are useful discovery metadata,
  // but an advance article is normally published before the event and therefore cannot conflict.
  const statedDays = explicitDays(article.cardDateText);
  // UFC's timestamp is an instant while MMA Mania normally prints the venue's calendar date;
  // a one-day UTC boundary difference is therefore the same event date, not a conflict.
  const date = expectedDay && Array.from(statedDays).some((day) => dayDistance(day, expectedDay) <= 1)
    ? "match"
    : statedDays.size ? "conflict" : "unknown";
  if (date === "conflict") {
    return { accepted: false, score: -100, date, signals: [], reason: `identity matching: article card date conflicts with UFC.com event date ${expectedDay}` };
  }

  const signals: string[] = ["section-aware-card"];
  let score = 15 + Math.min(article.boutCount, 15);
  const expectedNumber = eventNumber(`${event.name} ${event.subtitle}`);
  const candidateNumber = eventNumber(haystack);
  const exactNumber = Boolean(expectedNumber && candidateNumber === expectedNumber);
  if (expectedNumber && candidateNumber && candidateNumber !== expectedNumber) {
    return { accepted: false, score: -100, date, signals, reason: `identity matching: article identifies UFC ${candidateNumber}, not UFC ${expectedNumber}` };
  }
  if (exactNumber) { signals.push("exact-event-number"); score += 100; }

  const fighterMatches = headliners(event.subtitle).filter((fighter) => containsName(haystack, fighter)).length;
  const bothHeadliners = fighterMatches === 2;
  if (bothHeadliners) { signals.push("both-headliners"); score += 60; }
  else if (fighterMatches === 1) { signals.push("one-headliner"); score += 15; }

  const places = locationSignals(event, haystack);
  if (places) { signals.push(`location:${places}`); score += Math.min(places, 2) * 20; }
  if (date === "match") { signals.push("event-date"); score += 50; }

  const strongIdentitySignals = Number(bothHeadliners) + Math.min(places, 2);
  const accepted = exactNumber || (date === "match" && bothHeadliners) || (date === "match" && strongIdentitySignals >= 2);
  return {
    accepted,
    score,
    date,
    signals,
    reason: accepted
      ? `identified by ${signals.join(", ")}`
      : "identity matching: candidate lacked an exact event number or the required event-date identity signals",
  };
}

export function chooseEventArticle<T extends { match: IdentityMatch }>(candidates: T[]) {
  const accepted = candidates.filter((candidate) => candidate.match.accepted).sort((left, right) => right.match.score - left.match.score);
  if (!accepted.length) return { candidate: null, error: "identity matching: no article met the event identity confidence rules" };
  if (accepted[1] && accepted[0].match.score - accepted[1].match.score < 20) {
    return { candidate: null, error: `ambiguity: two MMA Mania articles had similar confidence (${accepted[0].match.score} and ${accepted[1].match.score})` };
  }
  return { candidate: accepted[0], error: "" };
}
