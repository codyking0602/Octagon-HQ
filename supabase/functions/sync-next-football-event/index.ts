import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import { normalizeFootballEvent, normalizeFootballFinalResult } from "./normalize.ts";

const headers = { "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

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
    const league = input.league === "college-football" ? "college-football" : "nfl";
    const eventId = String(input.espn_event_id ?? "").trim();
    if (!/^\d+$/.test(eventId)) return json({ error: "espn_event_id is required" }, 400);
    const sportPath = league === "nfl" ? "football/nfl" : "football/college-football";
    const oddsSport = league === "nfl" ? "americanfootball_nfl" : "americanfootball_ncaaf";

    const espnResponse = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sportPath}/summary?event=${eventId}`);
    if (!espnResponse.ok) throw new Error("football ESPN request failed");
    const summary = await espnResponse.json();
    const finalResult = normalizeFootballFinalResult(summary.header, league);
    if (finalResult) {
      if (input.mode === "preview") return json({ final_preview: finalResult });
      const recorded = await admin.rpc("record_football_pick_final", {
        p_home_team_slug: finalResult.home_team_slug,
        p_away_team_slug: finalResult.away_team_slug,
        p_home_final_score: finalResult.home_final_score,
        p_away_final_score: finalResult.away_final_score,
      });
      if (recorded.error) throw recorded.error;
      return json({ result: recorded.data, final_preview: finalResult });
    }

    const oddsResponse = await fetch(`https://api.the-odds-api.com/v4/sports/${oddsSport}/odds/?apiKey=${Deno.env.get("THE_ODDS_API_KEY")}&regions=us&markets=spreads&oddsFormat=american`);
    if (!oddsResponse.ok) throw new Error("football odds request failed");
    const event = normalizeFootballEvent(summary.header, await oddsResponse.json(), league);
    if (input.mode === "preview") return json({ event_preview: event });
    const staged = await admin.rpc("stage_pick_event_draft", { p_payload: event });
    if (staged.error) throw staged.error;
    return json({ draftId: staged.data, event_preview: event });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "football sync failed" }, 502);
  }
});
