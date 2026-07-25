import { z } from "zod";
import {
  getSupabaseBrowserConfig,
  getSupabaseClient,
  type SupabaseBrowserConfig,
} from "../../lib/supabase";
import type { IdentityProfile } from "./identityModel";

export interface IdentitySession {
  userId: string;
}

export interface IdentityGateway {
  getSession: () => Promise<IdentitySession | null>;
  subscribe: (listener: (session: IdentitySession | null) => void) => () => void;
  loadProfile: (userId: string) => Promise<IdentityProfile | null>;
  signIn: (displayName: string, pin: string) => Promise<void>;
  createProfile: (displayName: string, pin: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const profileRowSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().min(1),
  initials: z.string().min(1).max(2),
});

const pinAuthResponseSchema = z.object({
  tokenHash: z.string().min(1),
});

const functionErrorBodySchema = z.object({
  message: z.string().min(1),
});

type PinAuthAction = "login" | "create";
type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function parseJson(text: string): unknown {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function requestPinAuth(
  config: SupabaseBrowserConfig,
  action: PinAuthAction,
  displayName: string,
  pin: string,
  fetcher: FetchLike = fetch,
) {
  const endpoint = `${config.url.replace(/\/$/, "")}/functions/v1/pin-auth`;
  let response: Response;

  try {
    response = await fetcher(endpoint, {
      method: "POST",
      headers: {
        apikey: config.publishableKey,
        Authorization: `Bearer ${config.publishableKey}`,
        "Content-Type": "application/json",
        "x-client-info": "octagon-hq-web/1",
      },
      body: JSON.stringify({ action, displayName, pin }),
    });
  } catch {
    throw new Error("Octagon HQ could not reach the profile service.");
  }

  const body = parseJson(await response.text());
  if (!response.ok) {
    const parsedError = functionErrorBodySchema.safeParse(body);
    if (parsedError.success) throw new Error(parsedError.data.message);

    const platformCode = response.headers.get("sb-error-code");
    if (platformCode) throw new Error(`Profile service error (${platformCode}).`);

    throw new Error(`Profile service returned HTTP ${response.status}.`);
  }

  const parsed = pinAuthResponseSchema.safeParse(body);
  if (!parsed.success) throw new Error("Octagon HQ received an invalid login response.");
  return parsed.data.tokenHash;
}

export function createIdentityGateway(): IdentityGateway | null {
  const supabase = getSupabaseClient();
  const config = getSupabaseBrowserConfig();
  if (!supabase || !config) return null;
  const client = supabase;

  async function authenticate(action: PinAuthAction, displayName: string, pin: string) {
    const tokenHash = await requestPinAuth(config, action, displayName, pin);
    const verified = await client.auth.verifyOtp({
      token_hash: tokenHash,
      type: "magiclink",
    });
    if (verified.error) throw new Error(verified.error.message);
  }

  return {
    async getSession() {
      const { data, error } = await client.auth.getSession();
      if (error) throw new Error(error.message);
      return data.session ? { userId: data.session.user.id } : null;
    },

    subscribe(listener) {
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        listener(session ? { userId: session.user.id } : null);
      });
      return () => data.subscription.unsubscribe();
    },

    async loadProfile(userId) {
      const { data, error } = await client
        .from("profiles")
        .select("id, display_name, initials")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) return null;
      const parsed = profileRowSchema.parse(data);
      return {
        id: parsed.id,
        displayName: parsed.display_name,
        initials: parsed.initials,
      };
    },

    signIn(displayName, pin) {
      return authenticate("login", displayName, pin);
    },

    createProfile(displayName, pin) {
      return authenticate("create", displayName, pin);
    },

    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw new Error(error.message);
    },
  };
}
