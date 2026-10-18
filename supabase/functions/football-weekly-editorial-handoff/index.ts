import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@6.1.0";

// No GitHub secret, personal token or Supabase service-role key leaves this function.
// OIDC credentials are issued to the exact reviewed workflow running on main.
const repo = "codyking0602/Octagon-HQ";
const workflowRef = repo + "/.github/workflows/football-weekly-editorial-handoff.yml@refs/heads/main";
const audience = "octagon-hq-football-editorial";
const ownerActorId = "284170760";
const jwks = createRemoteJWKSet(new URL("https://token.actions.githubusercontent.com/.well-known/jwks"));
type Payload = Record<string, unknown>;
const isObject = (value: unknown): value is Payload =>
  !!value && typeof value === "object" && !Array.isArray(value);
const respond = (body: Payload, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: {
    "content-type": "application/json", "cache-control": "no-store",
  } });
const validWeek = (week: unknown) => typeof week === "string" &&
  /^20\d{2}-\d{2}-\d{2}$/.test(week) &&
  !Number.isNaN(Date.parse(week + "T12:00:00Z")) &&
  new Date(week + "T12:00:00Z").getUTCDay() === 2;

export async function handleFootballHandoff(req: Request) {
  if (req.method !== "POST") return respond({ error: "POST required" }, 405);
  const match = /^Bearer (\S+)$/.exec(req.headers.get("authorization") ?? "");
  if (!match) return respond({ error: "GitHub workflow OIDC authentication required" }, 401);
  let claims: Payload;
  try {
    const verified = await jwtVerify(match[1], jwks, {
      issuer: "https://token.actions.githubusercontent.com",
      audience,
      algorithms: ["RS256"],
      clockTolerance: "30s",
    });
    claims = verified.payload;
  } catch {
    return respond({ error: "Untrusted GitHub OIDC token" }, 401);
  }
  if (claims.repository !== repo || String(claims.repository_id) !== "1309429296" ||
      claims.repository_owner !== "codyking0602" ||
      claims.ref !== "refs/heads/main" || claims.workflow_ref !== workflowRef ||
      !["push","workflow_dispatch"].includes(String(claims.event_name)) ||
      !/^[0-9a-f]{40}$/.test(String(claims.sha))) {
    return respond({ error: "GitHub workflow/repository/ref not authorized" }, 403);
  }
  let data: Payload;
  try { data = await req.json(); } catch { return respond({ error: "Valid JSON required" }, 400); }
  if (!isObject(data) || Object.keys(data).some((key) =>
      !["week_of","sport","candidates","selection"].includes(key)) ||
      !validWeek(data.week_of) || !["cfb","nfl"].includes(String(data.sport)) ||
      !isObject(data.candidates) ||
      Object.keys(data.candidates).sort().join(",") !== "games,players" ||
      !Array.isArray(data.candidates.players) || data.candidates.players.length !== 5 ||
      !Array.isArray(data.candidates.games) || data.candidates.games.length !== 5) {
    return respond({ error: "Invalid five-plus-five Football manifest" }, 400);
  }
  const selection = data.selection;
  if (selection !== undefined && (!isObject(selection) ||
      Object.keys(selection).sort().join(",") !== "game_id,player_id" ||
      typeof selection.player_id !== "string" || typeof selection.game_id !== "string")) {
    return respond({ error: "Selection must have exact staged IDs" }, 400);
  }
  if (selection && (String(claims.actor_id) !== ownerActorId ||
      !["push","workflow_dispatch"].includes(String(claims.event_name)))) {
    return respond({ error: "Owner-authenticated GitHub execution required for selections" }, 403);
  }
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return respond({ error: "Backend secrets unavailable" }, 503);
  const admin = createClient(url, key, { auth: {
    autoRefreshToken: false, persistSession: false,
  } });
  const args = {
    p_week_of: data.week_of,
    p_sport: data.sport,
    p_candidates: data.candidates,
    p_player_id: isObject(selection) ? selection.player_id : null,
    p_game_id: isObject(selection) ? selection.game_id : null,
    p_actor_id: String(claims.actor_id),
    p_source_sha: String(claims.sha),
  };
  const { data: saved, error } = await admin.rpc("ingest_football_weekly_editorial_handoff", args);
  if (error || !isObject(saved)) {
    console.error("Football weekly editorial handoff rejected", {
      week: data.week_of, sport: data.sport, error: error?.message ?? "no receipt",
    });
    return respond({ error: error?.message ?? "Canonical readback failed" }, 409);
  }
  const proposals = isObject(saved.proposals) ? saved.proposals : {};
  const choices = isObject(saved.choices) ? saved.choices : {};
  const staged = isObject(proposals[String(data.sport)]);
  const choice = isObject(choices[String(data.sport)]) ? choices[String(data.sport)] as Payload : null;
  const selected = choice && isObject(choice.player) && isObject(choice.game) &&
    choice.player.id === (isObject(selection) ? selection.player_id : undefined) &&
    choice.game.id === (isObject(selection) ? selection.game_id : undefined);
  if (!staged || (selection && !selected)) {
    return respond({ error: "Post-write canonical verification failed" }, 503);
  }
  return respond({
    status: "verified", week_of: data.week_of, sport: data.sport,
    staged_players: 5, staged_games: 5,
    selection_recorded: Boolean(selection && selected),
    source_sha: String(claims.sha),
  });
}
Deno.serve(handleFootballHandoff);
