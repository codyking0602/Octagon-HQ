import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import { DEPLOYED_SOURCE_SHA } from "./deployment.ts";
import { footballWebpDimensions } from "./media.ts";

// Only the existing database-owned scheduler token can run this private job.
// This is a readiness checker, not an independent content generator or owner substitute.
const headers = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "content-type, x-octagon-scheduler-token",
};
function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify({ ...body, deployment_sha: DEPLOYED_SOURCE_SHA }), { status, headers });
}
type Sport = "cfb" | "nfl";
type RecordValue = Record<string, unknown>;
function asRecord(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : null;
}
function chicagoParts(now: Date) {
  const pieces = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit",
    weekday: "short", hour: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => pieces.find((piece) => piece.type === type)?.value ?? "";
  return { year: Number(get("year")), month: Number(get("month")),
    day: Number(get("day")), weekday: get("weekday"), hour: Number(get("hour")) };
}
function currentEditorialTuesday(now: Date) {
  const p = chicagoParts(now);
  const noon = new Date(Date.UTC(p.year, p.month - 1, p.day, 12));
  const delta = p.weekday === "Mon" ? 1 : (noon.getUTCDay() - 2 + 7) % 7;
  noon.setUTCDate(noon.getUTCDate() + (p.weekday === "Mon" ? delta : -delta));
  return noon.toISOString().slice(0, 10);
}
const baseUrl = "https://octagon.hq-app.workers.dev";
function assetPath(week: string, sport: Sport, kind: "spotlight" | "game-header") {
  return "/assets/football/weekly/" + week + "/" + sport + "/" + kind + ".webp";
}
async function deployedSha() {
  const fetched = await fetch(baseUrl + "/deployment.json", { cache: "no-store" });
  if (!fetched.ok) throw new Error("Unable to verify deployed Football assets");
  const marker = asRecord(await fetched.json());
  const sha = marker?.sha;
  if (typeof sha !== "string" || !/^[0-9a-f]{40}$/.test(sha)) {
    throw new Error("Invalid live Cloudflare deployment marker");
  }
  return sha;
}
async function verifyWebp(path: string, width: number, height: number) {
  const url = baseUrl + path;
  const asset = await fetch(url, { cache: "no-store" });
  if (!asset.ok) throw new Error("Football art not deployed at " + path);
  const final = new URL(asset.url);
  if (final.protocol !== "https:" || !["octagon.hq-app.workers.dev", "the.hq-app.workers.dev"].includes(final.host)) {
    throw new Error("Football art redirected to an unapproved host");
  }
  if (!(asset.headers.get("content-type") ?? "").toLowerCase().includes("image/webp")) {
    throw new Error("Football artwork is not a WebP response");
  }
  if (Number(asset.headers.get("content-length") ?? "0") > 10 * 1024 * 1024) {
    throw new Error("Football artwork unexpectedly large");
  }
  const buffer = new Uint8Array(await asset.arrayBuffer());
  if (buffer.length < 400 || buffer.length > 10 * 1024 * 1024) {
    throw new Error("Football artwork is empty or unreasonably large");
  }
  const measured = footballWebpDimensions(buffer);
  if (measured.width !== width || measured.height !== height) {
    throw new Error("Deployed Football image dimensions do not match approved art");
  }
}
Deno.serve(async (request) => {
  if (request.method !== "POST") return response({ error: "POST required" }, 405);
  let input: RecordValue;
  try { input = asRecord(await request.json()) ?? {}; } catch { input = {}; }
  if (input.mode === "deployment-info") return response({ status: "deployed" });
  if (input.mode !== "scheduled") return response({ error: "Scheduled-only endpoint" }, 401);
  const url = Deno.env.get("SUPABASE_URL");
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY");
  if (!url || !secret) return response({ error: "Backend not configured" }, 503);
  const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const token = request.headers.get("x-octagon-scheduler-token") ?? "";
  if (!token) return response({ error: "Scheduler authorization required" }, 401);
  const auth = await admin.rpc("authorize_pick_monitoring_scheduler", { p_token: token });
  if (auth.error || auth.data !== true) return response({ error: "Scheduler authorization failed" }, 401);

  const now = new Date();
  const local = chicagoParts(now);
  if (local.weekday === "Mon" && local.hour < 22) {
    return response({ status: "noop", reason: "next editorial week is not yet open" });
  }
  const week = currentEditorialTuesday(now);
  const { data: packageRow, error } = await admin.from("football_weekly_content_packages")
    .select("week_of,status,choices,production,cfb_spotlight,nfl_spotlight,cfb_game_of_week,nfl_game_of_week")
    .eq("week_of", week).maybeSingle();
  if (error) return response({ error: "Could not read canonical Football package" }, 503);
  const pkg = asRecord(packageRow);
  if (!pkg || !["draft", "ready"].includes(String(pkg.status))) {
    return response({ status: "noop", reason: "no editable Football package" });
  }
  const choices = asRecord(pkg.choices) ?? {};
  const production = asRecord(pkg.production) ?? {};
  const dueSports = (["cfb", "nfl"] as const).filter((sport) => {
    const entry = asRecord(production[sport]);
    return asRecord(choices[sport]) && entry && !entry.ready_at;
  });
  if (!dueSports.length) return response({ status: "noop", reason: "nothing approved and unarmed" });

  // Exactly one marker for this run; each asset is verified before its sport is armed.
  let sha: string;
  try { sha = await deployedSha(); } catch {
    return response({ status: "pending", reason: "deployment marker unavailable" });
  }
  const armed: Sport[] = [];
  const deferred: Sport[] = [];
  for (const sport of dueSports) {
    const featured = asRecord(pkg[sport + "_spotlight"]);
    const matchup = asRecord(pkg[sport + "_game_of_week"]);
    const spotlight = assetPath(week, sport, "spotlight");
    const header = assetPath(week, sport, "game-header");
    if (!featured || !matchup || featured.photo_asset_path !== spotlight || matchup.header_asset_path !== header) {
      deferred.push(sport);
      continue;
    }
    try {
      await Promise.all([
        verifyWebp(spotlight, 720, 900),
        verifyWebp(header, 1600, 900),
      ]);
      const result = await admin.rpc("arm_football_weekly_editorial", {
        p_week_of: week,
        p_sport: sport,
        p_verified_assets: {
          spotlight_url: baseUrl + spotlight,
          header_url: baseUrl + header,
          deployed_sha: sha,
        },
      });
      const savedProduction = asRecord(asRecord(result.data)?.production);
      if (result.error || !asRecord(savedProduction?.[sport])?.ready_at) {
        throw new Error("Unable to confirm armed Football package");
      }
      armed.push(sport);
    } catch {
      // Keep the prior published image/Spotlight and try the next five-minute check.
      deferred.push(sport);
    }
  }
  return response({ status: deferred.length ? "pending" : "checked", armed, deferred });
});
