import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import { corsHeaders as supabaseCorsHeaders } from "jsr:@supabase/supabase-js@2.110.7/cors";

const corsHeaders = {
  ...supabaseCorsHeaders,
  "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanDisplayName(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

function validPin(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}$/.test(value);
}

function initials(displayName: string) {
  const words = displayName.split(" ").filter(Boolean);
  return words.length === 1
    ? words[0]!.slice(0, 1)
    : words.slice(0, 2).map((word) => word[0]).join("");
}

function randomPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return `${Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("")}!Aa1`;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ message: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKey = Deno.env.get("SUPABASE_SECRET_KEY")
    ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !secretKey) {
    return response({ message: "Profile service is not configured." }, 503);
  }

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let body: { action?: unknown; displayName?: unknown; pin?: unknown };
  try {
    body = await request.json();
  } catch {
    return response({ message: "Invalid request." }, 400);
  }

  const action = body.action;
  const displayName = cleanDisplayName(body.displayName);
  const pin = body.pin;
  if ((action !== "login" && action !== "create")
    || displayName.length < 2
    || displayName.length > 24
    || !validPin(pin)) {
    return response({ message: "Enter a name and a 4-digit PIN." }, 400);
  }

  async function issueSessionToken(email: string) {
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (error) throw error;
    const tokenHash = data.properties?.hashed_token;
    if (!tokenHash) throw new Error("No login token was generated.");
    return tokenHash;
  }

  if (action === "login") {
    const { data, error } = await admin.rpc("verify_profile_pin", {
      p_display_name: displayName,
      p_pin: pin,
    });
    if (error) {
      console.error("verify_profile_pin failed", { code: error.code, message: error.message });
      return response({ message: "Profile login is unavailable." }, 503);
    }

    const match = Array.isArray(data) ? data[0] : null;
    if (match?.auth_result === "locked") {
      const retrySeconds = Math.max(1, Number(match.retry_after_seconds) || 300);
      const retryMinutes = Math.max(1, Math.ceil(retrySeconds / 60));
      return response({
        message: `Too many attempts. Try again in ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`,
        retryAfterSeconds: retrySeconds,
      }, 423);
    }

    if (match?.auth_result !== "ok" || !match?.profile_id) {
      return response({ message: "That name and PIN did not match." }, 401);
    }

    const { data: authUserData, error: authUserError } = await admin.auth.admin.getUserById(match.profile_id);
    const authEmail = authUserData.user?.email;
    if (authUserError || !authEmail) {
      console.error("PIN Auth user lookup failed", {
        code: authUserError?.code ?? "missing_auth_email",
        message: authUserError?.message ?? "The verified profile has no Auth email.",
      });
      return response({ message: "Profile login is unavailable." }, 503);
    }

    try {
      return response({ tokenHash: await issueSessionToken(authEmail) });
    } catch (error) {
      console.error("PIN session token generation failed", error instanceof Error ? error.message : "unknown error");
      return response({ message: "Profile login is unavailable." }, 503);
    }
  }

  if (Deno.env.get("OCTAGON_PROFILE_CREATION_OPEN") === "false") {
    return response({ message: "New profiles are currently invite-only." }, 403);
  }

  const internalEmail = `profile-${crypto.randomUUID()}@login.octagon-hq.app`;
  const created = await admin.auth.admin.createUser({
    email: internalEmail,
    password: randomPassword(),
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (created.error || !created.data.user) {
    console.error("Profile user creation failed", created.error?.message ?? "missing created user");
    return response({ message: "The profile could not be created." }, 503);
  }

  const userId = created.data.user.id;
  const registered = await admin.rpc("register_pin_profile", {
    p_profile_id: userId,
    p_display_name: displayName,
    p_initials: initials(displayName),
    p_internal_email: internalEmail,
    p_pin: pin,
  });

  if (registered.error) {
    await admin.auth.admin.deleteUser(userId);
    if (registered.error.code === "23505") {
      return response({ message: "That name is already taken. Add your last initial." }, 409);
    }
    console.error("Profile registration failed", { code: registered.error.code, message: registered.error.message });
    return response({ message: "The profile could not be created." }, 503);
  }

  try {
    return response({ tokenHash: await issueSessionToken(internalEmail) }, 201);
  } catch (error) {
    console.error("New profile session token generation failed", error instanceof Error ? error.message : "unknown error");
    await admin.auth.admin.deleteUser(userId);
    return response({ message: "The profile could not be opened." }, 503);
  }
});
