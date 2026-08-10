import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import * as cheerio from "npm:cheerio@1.0.0";
import { buildPickSpotlightContent, type SpotlightStatsFighter } from "../../../src/features/picks/spotlightContent.ts";
import { DEPLOYED_SOURCE_SHA } from "./deployment.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "X-Octagon-Backend-Sha",
};

const requestHeaders = {
  "User-Agent": "OctagonHQ/2.0 (+https://octagon.hq-app.workers.dev)",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
};

class SpotlightBuildError extends Error {
  constructor(readonly code: string, message: string, readonly status = 422) {
    super(message);
  }
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Octagon-Backend-Sha": DEPLOYED_SOURCE_SHA,
    },
  });
}

function clean(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function numberFrom(value: string) {
  const numeric = value.replace(/[^0-9.-]/g, "").trim();
  if (!numeric) return null;
  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? parsed : null;
}

function dateValue(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString().slice(0, 10) : null;
}

function profileIndexLetter(name: string) {
  const parts = normalizeName(name).split(" ").filter(Boolean);
  while (["jr", "sr", "ii", "iii", "iv"].includes(parts.at(-1) ?? "")) parts.pop();
  const last = parts.at(-1) ?? "";
  const char = last[0] ?? "";
  if (!/^[a-z]$/.test(char)) {
    throw new SpotlightBuildError("UFCSTATS_NAME_UNSUPPORTED", `UFCStats could not resolve ${name} safely.`);
  }
  return char;
}

async function fetchHtml(url: string, label: string) {
  let response: Response;
  try {
    response = await fetch(url, { headers: requestHeaders, redirect: "follow" });
  } catch {
    throw new SpotlightBuildError("UFCSTATS_FETCH_FAILED", `${label} could not be loaded from UFCStats.`, 502);
  }
  if (!response.ok) {
    throw new SpotlightBuildError("UFCSTATS_FETCH_FAILED", `${label} could not be loaded from UFCStats.`, 502);
  }
  return response.text();
}

async function resolveProfileUrl(name: string, indexCache: Map<string, Promise<string>>) {
  const letter = profileIndexLetter(name);
  if (!indexCache.has(letter)) {
    indexCache.set(letter, fetchHtml(`https://ufcstats.com/statistics/fighters?char=${encodeURIComponent(letter)}&page=all`, `UFCStats ${letter.toUpperCase()} fighter index`));
  }
  const html = await indexCache.get(letter)!;
  const $ = cheerio.load(html);
  const target = normalizeName(name);
  const candidates: Array<{ name: string; url: string }> = [];

  $(".b-statistics__table-row").each((_, row) => {
    const cells = $(row).find("td.b-statistics__table-col");
    if (cells.length < 2) return;
    const first = clean($(cells[0]).text());
    const last = clean($(cells[1]).text());
    const url = $(row).find('a[href*="/fighter-details/"]').first().attr("href")?.trim() ?? "";
    if (!url) return;
    const full = clean(`${first} ${last}`);
    if (normalizeName(full) === target) candidates.push({ name: full, url });
  });

  const unique = [...new Map(candidates.map((candidate) => [candidate.url, candidate])).values()];
  if (unique.length !== 1) {
    throw new SpotlightBuildError(
      unique.length ? "UFCSTATS_FIGHTER_AMBIGUOUS" : "UFCSTATS_FIGHTER_NOT_FOUND",
      unique.length
        ? `UFCStats returned more than one exact match for ${name}.`
        : `UFCStats could not find an exact fighter match for ${name}.`,
    );
  }
  return unique[0];
}

function detailValue($: cheerio.CheerioAPI, label: string) {
  let value = "";
  $(".b-list__box-list-item").each((_, item) => {
    if (value) return;
    const text = clean($(item).text());
    if (text.toLowerCase().startsWith(label.toLowerCase())) {
      value = clean(text.slice(label.length));
    }
  });
  return value === "--" ? "" : value;
}

async function loadFighter(
  name: string,
  fighterSlug: string,
  indexCache: Map<string, Promise<string>>,
): Promise<SpotlightStatsFighter> {
  const profile = await resolveProfileUrl(name, indexCache);
  const html = await fetchHtml(profile.url.replace(/^http:/i, "https:"), `${name} UFCStats profile`);
  const $ = cheerio.load(html);
  const record = clean($(".b-content__title-record").first().text()).replace(/^Record:\s*/i, "") || "--";
  const dob = detailValue($, "DOB:");

  return {
    fighterSlug,
    name,
    record,
    dob: dob ? dateValue(dob) : null,
    height: detailValue($, "Height:") || "--",
    reach: detailValue($, "Reach:") || "--",
    stance: detailValue($, "STANCE:") || "--",
    slpm: numberFrom(detailValue($, "SLpM:")),
    strikingAccuracy: numberFrom(detailValue($, "Str. Acc.:")),
    sapm: numberFrom(detailValue($, "SApM:")),
    strikingDefense: numberFrom(detailValue($, "Str. Def:")),
    takedownAverage: numberFrom(detailValue($, "TD Avg.:")),
    takedownAccuracy: numberFrom(detailValue($, "TD Acc.:")),
    takedownDefense: numberFrom(detailValue($, "TD Def.:")),
    submissionAverage: numberFrom(detailValue($, "Sub. Avg.:")),
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ code: "METHOD_NOT_ALLOWED", message: "Method not allowed.", deployment_sha: DEPLOYED_SOURCE_SHA }, 405);

  let input: Record<string, unknown> = {};
  try { input = asRecord(await request.json()) ?? {}; } catch { /* empty input */ }
  if (input.mode === "deployment-info") return json({ deployment_sha: DEPLOYED_SOURCE_SHA });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const secretKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!supabaseUrl || !anonKey || !secretKey) {
    return json({ code: "SPOTLIGHT_BUILD_NOT_CONFIGURED", message: "Spotlight building is not configured.", deployment_sha: DEPLOYED_SOURCE_SHA }, 503);
  }
  if (!token) return json({ code: "OWNER_AUTH_REQUIRED", message: "Owner sign-in required.", deployment_sha: DEPLOYED_SOURCE_SHA }, 401);

  const admin = createClient(supabaseUrl, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const user = await admin.auth.getUser(token);
  if (user.error || !user.data.user) return json({ code: "OWNER_AUTH_REQUIRED", message: "Owner sign-in required.", deployment_sha: DEPLOYED_SOURCE_SHA }, 401);

  const owner = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const setup = await owner.rpc("get_pick_event_setup");
  if (setup.error) {
    const denied = setup.error.message.toLowerCase().includes("pick control owner required");
    return json({
      code: denied ? "OWNER_ACCESS_REQUIRED" : "EVENT_SETUP_UNAVAILABLE",
      message: denied ? "Fight Night owner access required." : "Event Setup is unavailable.",
      deployment_sha: DEPLOYED_SOURCE_SHA,
    }, denied ? 403 : 503);
  }

  try {
    const draft = asRecord(setup.data);
    const draftId = typeof input.draft_id === "string" ? input.draft_id : "";
    const boutId = typeof input.bout_id === "string" ? input.bout_id : "";
    if (!draft || !draftId || draft.draft_id !== draftId) {
      throw new SpotlightBuildError("STAGED_DRAFT_CHANGED", "The staged card changed. Reload Event Setup before building this Spotlight.", 409);
    }
    const bouts = Array.isArray(draft.bouts) ? draft.bouts.map(asRecord).filter(Boolean) as Record<string, unknown>[] : [];
    const bout = bouts.find((candidate) => candidate.bout_id === boutId && candidate.included === true);
    if (!bout) throw new SpotlightBuildError("SPOTLIGHT_BOUT_NOT_FOUND", "That included fight is no longer on the staged card.", 409);
    const startsAt = typeof draft.starts_at === "string" ? draft.starts_at : "";
    if (!startsAt || !Number.isFinite(Date.parse(startsAt))) {
      throw new SpotlightBuildError("SPOTLIGHT_EVENT_DATE_MISSING", "Set the event start time before building fight Spotlights.");
    }

    const redName = typeof bout.red_fighter_name === "string" ? bout.red_fighter_name : "";
    const blueName = typeof bout.blue_fighter_name === "string" ? bout.blue_fighter_name : "";
    const redSlug = typeof bout.red_fighter_slug === "string" ? bout.red_fighter_slug : "";
    const blueSlug = typeof bout.blue_fighter_slug === "string" ? bout.blue_fighter_slug : "";
    if (!redName || !blueName || !redSlug || !blueSlug) {
      throw new SpotlightBuildError("SPOTLIGHT_FIGHTER_IDENTITY_MISSING", "Both staged fighter identities are required before building a Spotlight.");
    }

    const indexCache = new Map<string, Promise<string>>();
    const [red, blue] = await Promise.all([
      loadFighter(redName, redSlug, indexCache),
      loadFighter(blueName, blueSlug, indexCache),
    ]);
    const spotlight = buildPickSpotlightContent({
      boutId,
      eventStartsAt: startsAt,
      red,
      blue,
    });

    return json({ spotlight, deployment_sha: DEPLOYED_SOURCE_SHA });
  } catch (error) {
    const known = error instanceof SpotlightBuildError;
    return json({
      code: known ? error.code : "SPOTLIGHT_BUILD_FAILED",
      message: known ? error.message : "The fight Spotlight could not be built safely.",
      deployment_sha: DEPLOYED_SOURCE_SHA,
    }, known ? error.status : 502);
  }
});
