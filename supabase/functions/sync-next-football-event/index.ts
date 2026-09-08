import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import {
  footballSlateUnavailableMessage,
  normalizeFootballEvent,
  normalizeFootballFinalResult,
  normalizeFootballSlate,
} from "./normalize.ts";
import { buildFootballWeekPreview, footballWeekEspnDateRange, footballWeekRange } from "./week.ts";

type Json = Record<string, any>;
type FootballLeague = "nfl" | "college-football";

const schedulerHeader = "x-octagon-scheduler-token";
const headers = {
  "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

async function fetchEspnWeekEvents(weekStart: string, league: FootballLeague) {
  const sportPath = league === "nfl" ? "football/nfl" : "football/college-football";
  const group = league === "college-football" ? "&groups=80" : "";
  const dateRange = footballWeekEspnDateRange(weekStart);
  const response = await fetch(`https://site.web.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard?dates=${dateRange}&limit=200${group}`);
  if (!response.ok) throw new Error(`football ESPN ${league} schedule request failed (${response.status})`);
  const payload = await response.json();
  return Array.isArray(payload?.events) ? payload.events as Json[] : [];
}

async function fetchEspnEventSummary(eventId: string, league: FootballLeague) {
  const sportPath = league === "nfl" ? "football/nfl" : "football/college-football";
  const response = await fetch(`https://site.web.api.espn.com/apis/site/v2/sports/${sportPath}/summary?event=${eventId}`);
  if (!response.ok) throw new Error(`football ESPN ${league} summary request failed (${response.status})`);
  return response.json();
}

function footballSourceIdentity(boutId: string) {
  const match = /^football-(nfl|college-football)-(\d+)$/.exec(boutId);
  if (!match) return null;
  return { league: match[1] as FootballLeague, eventId: match[2] };
}

async function recordFootballFinal(admin: any, finalResult: Json) {
  const recorded = await admin.rpc("record_football_pick_final", {
    p_league: finalResult.league,
    p_home_team_slug: finalResult.home_team_slug,
    p_away_team_slug: finalResult.away_team_slug,
    p_home_final_score: finalResult.home_final_score,
    p_away_final_score: finalResult.away_final_score,
  });
  if (recorded.error) throw recorded.error;
  return recorded.data;
}

async function settleScheduledFootballFinals(admin: any) {
  const current = await admin.rpc("get_current_pick_event", { p_sport: "football" });
  if (current.error) throw current.error;

  const event = current.data && typeof current.data === "object" ? current.data as Json : null;
  const bouts = Array.isArray(event?.bouts) ? event.bouts as Json[] : [];
  const now = Date.now();
  const pendingBouts = bouts.filter((bout) => {
    if (bout?.included_in_picks === false || bout?.result_status !== "pending") return false;
    const locksAt = typeof bout?.locks_at === "string" ? Date.parse(bout.locks_at) : Number.NaN;
    return Number.isFinite(locksAt) && locksAt <= now;
  });

  if (!pendingBouts.length) return { checked: 0, finalized: 0, pending: 0, failed: 0, failures: [] };

  let checked = 0;
  let finalized = 0;
  let pending = 0;
  const failures: string[] = [];

  for (const bout of pendingBouts) {
    const boutId = String(bout?.bout_id ?? "");
    const source = footballSourceIdentity(boutId);
    if (!source) {
      failures.push(`${boutId}: invalid canonical football source identity`);
      continue;
    }

    checked += 1;
    try {
      const summary = await fetchEspnEventSummary(source.eventId, source.league);
      const finalResult = normalizeFootballFinalResult(summary.header, source.league);
      if (!finalResult) {
        pending += 1;
        continue;
      }
      await recordFootballFinal(admin, finalResult);
      finalized += 1;
    } catch (error) {
      failures.push(`${boutId}: ${error instanceof Error ? error.message : "football final sync failed"}`);
    }
  }

  return { checked, finalized, pending, failed: failures.length, failures };
}

async function stageFootballEvents(admin: any, events: Json[]) {
  let draftId: string | null = null;
  for (const event of events) {
    const staged = await admin.rpc("stage_pick_event_draft", { p_payload: event });
    if (staged.error) throw staged.error;
    draftId = staged.data;
  }
  return draftId;
}

async function cacheFootballTeamAssets(admin: any, events: Json[]) {
  const assets = events.flatMap((event) => {
    const bout = event?.bouts?.[0] ?? {};
    return [
      { team_slug: bout.home_team_slug, team_name: bout.red_fighter_name, league: event.league, logo_url: bout.home_team_logo_url },
      { team_slug: bout.away_team_slug, team_name: bout.blue_fighter_name, league: event.league, logo_url: bout.away_team_logo_url },
    ];
  }).filter((asset) => asset.team_slug && asset.team_name && /^https:\/\//.test(String(asset.logo_url ?? "")));
  if (!assets.length) return;
  const stored = await admin.rpc("upsert_football_team_assets", { p_assets: assets });
  if (stored.error) throw stored.error;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers });
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);

  let input: Json = {};
  try { input = await request.json(); } catch { /* empty input */ }
  const mode = String(input.mode ?? "apply");
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  if (mode === "scheduled-finals") {
    const schedulerToken = request.headers.get(schedulerHeader) ?? "";
    const authorized = await admin.rpc("authorize_pick_monitoring_scheduler", { p_token: schedulerToken });
    if (authorized.error || authorized.data !== true) return json({ error: "scheduled football sync authorization required" }, 401);
    try {
      const result = await settleScheduledFootballFinals(admin);
      return json(result, result.failed ? 502 : 200);
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "football final sync failed" }, 502);
    }
  }

  const auth = request.headers.get("Authorization") ?? "";
  const caller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: user } = await caller.auth.getUser(auth.replace(/^Bearer\s+/i, ""));
  if (!user.user) return json({ error: "authentication required" }, 401);
  const { data: owner } = await admin.rpc("is_pick_control_owner", { p_profile_id: user.user.id });
  if (!owner) return json({ error: "pick control owner required" }, 403);

  try {
    if (mode === "week-preview" || mode === "week-apply") {
      const weekStart = String(input.week_start ?? "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) return json({ error: "week_start is required" }, 400);
      footballWeekRange(weekStart);

      const [nflEvents, collegeEvents] = await Promise.all([
        fetchEspnWeekEvents(weekStart, "nfl"),
        fetchEspnWeekEvents(weekStart, "college-football"),
      ]);
      const weekPreview = buildFootballWeekPreview(weekStart, nflEvents, collegeEvents);
      if (mode === "week-preview") return json(weekPreview);

      const requestedIds = Array.isArray(input.college_event_ids)
        ? input.college_event_ids.map((value: unknown) => String(value).trim())
        : [];
      if (requestedIds.some((value: string) => !/^\d+$/.test(value)) || new Set(requestedIds).size !== requestedIds.length) {
        return json({ error: "college_event_ids must contain unique ESPN event IDs" }, 400);
      }
      const collegeGameIds = new Set(weekPreview.college_games.map((game) => game.espn_event_id));
      if (requestedIds.some((eventId: string) => !collegeGameIds.has(eventId))) {
        return json({ error: "college selections must come from this week's FBS schedule" }, 400);
      }

      const nflById = new Map(nflEvents.map((event) => [String(event?.id ?? ""), event]));
      const collegeById = new Map(collegeEvents.map((event) => [String(event?.id ?? ""), event]));
      const selectedNflEvents = weekPreview.nfl_games.map((game) => nflById.get(game.espn_event_id)).filter(Boolean) as Json[];
      const selectedCollegeEvents = requestedIds.map((eventId: string) => collegeById.get(eventId)).filter(Boolean) as Json[];
      if (selectedNflEvents.length !== weekPreview.nfl_games.length || selectedCollegeEvents.length !== requestedIds.length) {
        throw new Error("football ESPN weekly schedule changed during staging");
      }
      if (!selectedNflEvents.length && !selectedCollegeEvents.length) return json({ error: "this week has no Football games to stage" }, 400);

      const [nflOdds, collegeOdds] = await Promise.all([
        selectedNflEvents.length ? fetchSpreadEvents("americanfootball_nfl") : Promise.resolve([]),
        selectedCollegeEvents.length ? fetchSpreadEvents("americanfootball_ncaaf") : Promise.resolve([]),
      ]);
      const selectedGames = [
        ...selectedNflEvents.map((espnEvent) => ({ espnEvent, oddsEvents: nflOdds, league: "nfl" })),
        ...selectedCollegeEvents.map((espnEvent) => ({ espnEvent, oddsEvents: collegeOdds, league: "college-football" })),
      ];
      const normalization = normalizeFootballSlate(selectedGames);
      if (normalization.unavailable.length) {
        return json({
          error: footballSlateUnavailableMessage(normalization.unavailable, selectedGames.length),
          selected_game_count: selectedGames.length,
          unavailable_game_count: normalization.unavailable.length,
          unavailable_games: normalization.unavailable,
        }, 409);
      }

      await cacheFootballTeamAssets(admin, normalization.events);
      const draftId = await stageFootballEvents(admin, normalization.events);
      return json({ draftId, staged_game_count: normalization.events.length, ...weekPreview });
    }

    const league = input.league === "college-football" ? "college-football" : "nfl";
    const eventId = String(input.espn_event_id ?? "").trim();
    if (!/^\d+$/.test(eventId)) return json({ error: "espn_event_id is required" }, 400);
    const oddsSport = league === "nfl" ? "americanfootball_nfl" : "americanfootball_ncaaf";

    const summary = await fetchEspnEventSummary(eventId, league);
    const finalResult = normalizeFootballFinalResult(summary.header, league);
    if (finalResult) {
      if (mode === "preview") return json({ final_preview: finalResult });
      const result = await recordFootballFinal(admin, finalResult);
      return json({ result, final_preview: finalResult });
    }

    const oddsEvents = await fetchSpreadEvents(oddsSport);
    const event = normalizeFootballEvent(summary.header, oddsEvents, league);
    if (mode === "preview") return json({ event_preview: event });
    await cacheFootballTeamAssets(admin, [event]);
    const draftId = await stageFootballEvents(admin, [event]);
    return json({ draftId, event_preview: event });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "football sync failed" }, 502);
  }
});

async function fetchSpreadEvents(oddsSport: "americanfootball_nfl" | "americanfootball_ncaaf") {
  const response = await fetch(`https://api.the-odds-api.com/v4/sports/${oddsSport}/odds/?apiKey=${Deno.env.get("THE_ODDS_API_KEY")}&regions=us&markets=spreads&oddsFormat=american`);
  if (!response.ok) throw new Error("football odds request failed");
  const payload = await response.json();
  return Array.isArray(payload) ? payload as Json[] : [];
}