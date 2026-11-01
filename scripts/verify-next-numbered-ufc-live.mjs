// Post-deploy smoke test for the PUBLIC UFC Picks numbered-event calendar.
// Frontend asset delivery alone does not verify that server-owned event data works.
const origin = (process.env.OCTAGON_PRODUCTION_ORIGIN ?? "https://the.hq-app.workers.dev").replace(/\/$/, "");
const expectedSha = process.env.EXPECTED_SOURCE_SHA ?? "";
const url = new URL(origin + "/api/ufc/next-numbered-event?v=2");
if (expectedSha) url.searchParams.set("verify", expectedSha);

async function verify() {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 25_000);
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json", "Cache-Control": "no-cache" },
        signal: abort.signal,
      });
      if (!response.ok) throw new Error("Live UFC Picks calendar returned HTTP " + response.status);
      const data = await response.json();
      const event = data?.event;
      if (!event || typeof event !== "object"
        || !/^UFC \d{3,4}$/.test(event.name ?? "")
        || !Number.isFinite(Date.parse(event.startsAt ?? ""))
        || Date.parse(event.startsAt) <= Date.now()
        || typeof event.matchup !== "string" || !event.matchup.trim()) {
        throw new Error("Live UFC Picks endpoint returned no usable upcoming numbered event.");
      }
      console.log("PASS: live UFC Picks event:", event.name, "|", event.matchup, "|", event.startsAt);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 2500));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}

await verify();
