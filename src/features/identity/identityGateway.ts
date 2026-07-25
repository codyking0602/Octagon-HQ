import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
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

function readableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Octagon HQ could not complete that request.";
}

function responseContext(error: unknown): Response | null {
  if (!error || typeof error !== "object" || !("context" in error)) return null;
  const context = (error as { context?: unknown }).context;
  return typeof Response !== "undefined" && context instanceof Response ? context : null;
}

export async function readFunctionErrorMessage(error: unknown) {
  const context = responseContext(error);
  if (context) {
    try {
      const body = functionErrorBodySchema.safeParse(await context.clone().json());
      if (body.success) return body.data.message;
    } catch {
      // Fall through to the SDK or platform error below.
    }

    const platformCode = context.headers.get("sb-error-code");
    if (platformCode) return `Profile service error (${platformCode}).`;
  }

  return readableError(error);
}

export function createIdentityGateway(): IdentityGateway | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  async function authenticate(action: "login" | "create", displayName: string, pin: string) {
    const { data, error } = await client.functions.invoke("pin-auth", {
      body: { action, displayName, pin },
    });

    if (error) throw new Error(await readFunctionErrorMessage(error));
    const parsed = pinAuthResponseSchema.safeParse(data);
    if (!parsed.success) throw new Error("Octagon HQ received an invalid login response.");

    const verified = await client.auth.verifyOtp({
      token_hash: parsed.data.tokenHash,
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
