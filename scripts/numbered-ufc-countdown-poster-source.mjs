/**
 * Strict, source-bound selectors for the next numbered UFC countdown poster.
 * Discovery is separate from the staged/owner-controlled Picks event.
 */
export function centralEventDate(iso) {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(ms));
  const part = (name) => parts.find((p) => p.type === name)?.value ?? "";
  return [part("year"), part("month"), part("day")].join("-");
}

export function nextNumberedFromEspn(value, now = new Date()) {
  if (!Array.isArray(value?.leagues)) return null;
  const events = value.leagues.flatMap((league) => Array.isArray(league?.calendar) ? league.calendar : []);
  return events.flatMap((entry) => {
    const label = typeof entry?.label === "string" ? entry.label.trim() : "";
    const match = /^UFC\s+(\d{3})(?:\s*:\s*(.+))?$/i.exec(label);
    const startsAt = typeof entry?.startDate === "string" ? entry.startDate : "";
    if (!match || !Number.isFinite(Date.parse(startsAt)) || Date.parse(startsAt) <= now.getTime()) return [];
    const pair = match[2]?.split(/\s+vs\.?\s+/i) ?? [];
    const surnames = pair.map((name) => name.trim().split(/\s+/).at(-1)?.replace(/[^a-z'-]/gi, "").toLowerCase() ?? "");
    if (surnames.length !== 2 || surnames.some((name) => name.length < 3) || surnames[0] === surnames[1]) return [];
    return [{
      name: "UFC " + match[1],
      number: match[1],
      firstName: surnames[0],
      secondName: surnames[1],
      date: centralEventDate(startsAt),
      startsAt: new Date(startsAt).toISOString(),
    }];
  }).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0] ?? null;
}

function entities(s) {
  return s.replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&#x27;/gi, "'");
}

function getMeta(html, key) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const identity = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1] ?? "";
    if (identity.toLowerCase() !== key.toLowerCase()) continue;
    return entities(tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1] ?? "");
  }
  return "";
}

export function numberedPosterLinks(html, number, archiveUrl = "https://www.mmamania.com/ufc-strikeforce-posters") {
  const links = [...html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)].map((m) => entities(m[1]))
    .map((value) => { try { return new URL(value, archiveUrl); } catch { return null; } })
    .filter((url) => url && url.protocol === "https:" && url.hostname === "www.mmamania.com"
      && /^\/ufc-strikeforce-posters\/\d+\//.test(url.pathname)
      && new RegExp("\\bufc-" + number + "\\b", "i").test(url.pathname))
    .map((url) => url.href);
  return [...new Set(links)].slice(0, 12);
}

export function verifiedNumberedPosterArticle(html, url, event) {
  let source;
  try { source = new URL(url); } catch { return null; }
  if (source.protocol !== "https:" || source.hostname !== "www.mmamania.com"
    || !/^\/ufc-strikeforce-posters\/\d+\//.test(source.pathname)
    || !new RegExp("\\bufc-" + event.number + "\\b", "i").test(source.pathname)) return null;

  const headline = getMeta(html, "og:title").toLowerCase();
  const body = entities(html.replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).toLowerCase();
  if (!new RegExp("\\bufc\\s*" + event.number + "\\b", "i").test(headline + " " + body)
    || (!headline.includes("poster") && !headline.includes("ufc " + event.number))
    || !body.includes("poster")
    || ![event.firstName, event.secondName].every((name) => new RegExp("\\b" + name + "\\b", "i").test(body))) return null;

  const raw = getMeta(html, "og:image");
  let image;
  try { image = new URL(raw); } catch { return null; }
  if (image.protocol !== "https:" || image.hostname !== "platform.mmamania.com"
    || !/\.(?:jpe?g|png|webp)$/i.test(image.pathname)) return null;
  const width = Number(getMeta(html, "og:image:width"));
  const height = Number(getMeta(html, "og:image:height"));
  // The countdown is a wide hero; reject portrait stories/photos and unknown sizes.
  if (!(width >= 600 && height >= 300 && width / height >= 1.2 && width / height <= 2.5)) return null;

  return {
    name: event.name,
    firstName: event.firstName,
    secondName: event.secondName,
    date: event.date,
    source: source.href,
    src: image.href,
  };
}
