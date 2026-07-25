import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

const configSchema = z.object({
  url: z.string().url(),
  publishableKey: z.string().min(1),
});

export interface SupabaseBrowserConfig {
  url: string;
  publishableKey: string;
}

let client: SupabaseClient | null | undefined;

export function getSupabaseBrowserConfig(): SupabaseBrowserConfig | null {
  const parsed = configSchema.safeParse({
    url: import.meta.env.VITE_SUPABASE_URL,
    publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  });

  return parsed.success ? parsed.data : null;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) return client;

  const config = getSupabaseBrowserConfig();
  client = config
    ? createClient(config.url, config.publishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

  return client;
}
