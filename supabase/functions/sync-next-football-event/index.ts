import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import {
  footballSlateUnavailableMessage,
  normalizeFootballEvent,
  normalizeFootballFinalResult,
  normalizeFootballSlate,
} from "./normalize.ts";
import { buildFootballWeekPreview, footballWeekEspnDateRange, footballWeekRange } from "./week.ts";

type Json = Record<string, any>;

const headers = {
  "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

async function fetchEspnWeekEvents(weekStart: string, league: "nfl" | "college-football") {
  const sportPath = league === "nfl" ? "football/nfl" : "football/college-football";
  const group = league === "college-football" ? "&groups=80" : "";
  const dateRange = footballWeekEspnDateRange(weekStart);
  const response = await fetch(`https://site.web.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard?dates=${dateRange}&limit=200${group}`);
  if (!response.ok) throw new Error(`football ESPN ${league} schedule request failed (${response.status})`);
  const payload = await response.json();
  return Array.isArray(payload?.events) ? payload.events as Json[] : [];
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
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const auth = request.headers.get("Authorization") ?? "";
  const caller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: user } = await caller.auth.getUser(auth.replace(/^Bearer\s+/i, ""));
  if (!user.user) return json({ error: "authentication required" }, 401);
  const admin = createClient(url, serviceKey);
  const { data: owner } = await admin.rpc("is_pick_control_owner", { p_profile_id: user.user.id });
  if (!owner) return json({ error: "pick control owner required" }, 403);

  try {
    const input = await request.json();
    const mode = String(input.mode ?? "apply");

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
    const sportPath = league === "nfl" ? "football/nfl" : "football/college-football";
    const oddsSport = league === "nfl" ? "americanfootball_nfl" : "americanfootball_ncaaf";

    const espnResponse = await fetch(`https://site.web.api.espn.com/apis/site/v2/sports/${sportPath}/summary?event=${eventId}`);
    if (!espnResponse.ok) throw new Error("football ESPN request failed");
    const summary = await espnResponse.json();
    const finalResult = normalizeFootballFinalResult(summary.header, league);
    if (finalResult) {
      if (mode === "preview") return json({ final_preview: finalResult });
      const recorded = await admin.rpc("record_football_pick_final", {
        p_league: finalResult.league,
        p_home_team_slug: finalResult.home_team_slug,
        p_away_team_slug: finalResult.away_team_slug,
        p_home_final_score: finalResult.home_final_score,
        p_away_final_score: finalResult.away_final_score,
      });
      if (recorded.error) throw recorded.error;
      return json({ result: recorded.data, final_preview: finalResult });
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
