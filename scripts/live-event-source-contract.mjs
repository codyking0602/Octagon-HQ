const [eventUrl] = process.argv.slice(2);
if (!eventUrl) {
  console.error("Usage: node scripts/live-event-source-contract.mjs <cbs-sports-ufc-event-url>");
  process.exit(2);
}
if (!/^https:\/\/(?:www\.)?cbssports\.com\/ufc\/event\/\d+\/[a-z0-9-]+\/?$/i.test(eventUrl)) {
  console.error("An exact CBS Sports UFC event URL is required.");
  process.exit(2);
}
const fetchBounded = async (url) => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: { "user-agent": "OctagonHQ-contract/1.0" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${new URL(url).hostname}`);
  const body = await response.text();
  if (Buffer.byteLength(body) > 2_000_000) throw new Error("response exceeds 2 MB");
  return {
    url,
    status: response.status,
    bytes: Buffer.byteLength(body),
    mainCardSections: (body.match(/>\s*Main Card\s*</gi) || []).length,
    prelimSections: (body.match(/>\s*(?:Early\s+)?Prelims?\s*</gi) || []).length,
    fighterLinks: (body.match(/\/ufc\/fighter\//gi) || []).length,
  };
};
// This deliberately performs no authentication and has no database client. It is
// a source availability/evidence probe; deployed preview verification uses the
// separate authenticated verifier.
console.log(JSON.stringify({ cbsSports: await fetchBounded(eventUrl), writes: false }, null, 2));
