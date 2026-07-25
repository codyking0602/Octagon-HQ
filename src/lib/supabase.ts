import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

const configSchema = z.object({
  url: z.string().url(),
  publishableKey: z.string().min(1),
});

type BrowserLocation = Pick<Location, "hostname" | "origin">;

let client: SupabaseClient | null | undefined;

export function resolveSupabaseBrowserUrl(
  configuredUrl: string,
  browserLocation: BrowserLocation | null = typeof window === "undefined" ? null : window.location,
) {
  if (!browserLocation || !browserLocation.hostname.toLowerCase().endsWith(".hq-app.workers.dev")) {
    return configuredUrl;
  }

  const configured = new URL(configuredUrl);
  const projectMatch = /^([a-z0-9-]+)\.supabase\.co$/i.exec(configured.hostname);
  if (!projectMatch) return configuredUrl;

  return `${browserLocation.origin}/api/supabase/${projectMatch[1]}`;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) return client;

  const parsed = configSchema.safeParse({
    url: import.meta.env.VITE_SUPABASE_URL,
    publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  });

  client = parsed.success
    ? createClient(resolveSupabaseBrowserUrl(parsed.data.url), parsed.data.publishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

  return client;
}
