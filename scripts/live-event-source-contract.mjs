const [eventUrl] = process.argv.slice(2);
if (!eventUrl) {
  console.error("Usage: node scripts/live-event-source-contract.mjs <ufc-event-url>");
  process.exit(2);
}
if (!/^https:\/\/(?:www\.)?ufc\.com\/event\/[a-z0-9-]+\/?$/i.test(eventUrl)) {
  console.error("An exact UFC.com event URL is required.");
  process.exit(2);
}
const fetchBounded = async (url) => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(10_000),
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
      "accept-language": "en-US,en;q=0.9",
      referer: "https://www.ufc.com/",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${new URL(url).hostname}`);
  const body = await response.text();
  if (Buffer.byteLength(body) > 3_000_000) throw new Error("response exceeds 3 MB");
  return {
    url,
    status: response.status,
    bytes: Buffer.byteLength(body),
    mainCardSections: (body.match(/id=["']main-card["']/gi) || []).length,
    prelimSections: (body.match(/id=["']prelims-card["']/gi) || []).length,
    athleteLinks: (body.match(/\/athlete\//gi) || []).length,
  };
};
// This deliberately performs no authentication and has no database client. It is
// a source availability/evidence probe; deployed preview verification uses the
// separate authenticated verifier.
console.log(JSON.stringify({ ufc: await fetchBounded(eventUrl), writes: false }, null, 2));
