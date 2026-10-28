const placeholders = ["your-project-id", "your-publishable-key"];

export function validatePublicSupabaseConfig(config) {
  const urlValue = config.url?.trim();
  const key = config.publishableKey?.trim();
  const expectedHostname = config.expectedHostname?.trim().toLowerCase();

  if (!urlValue) throw new Error("VITE_SUPABASE_URL is required for a production build.");
  if (placeholders.some((value) => urlValue.toLowerCase().includes(value))) {
    throw new Error("VITE_SUPABASE_URL contains a placeholder value.");
  }

  let url;
  try {
    url = new URL(urlValue);
  } catch {
    throw new Error("VITE_SUPABASE_URL must be a valid URL.");
  }

  if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("VITE_SUPABASE_URL must be an HTTPS project origin without a path, query, or fragment.");
  }
  if (!expectedHostname) {
    throw new Error("VITE_EXPECTED_SUPABASE_HOSTNAME is required for a production build.");
  }
  if (!/^[a-z0-9-]+\.supabase\.co$/.test(expectedHostname)) {
    throw new Error("VITE_EXPECTED_SUPABASE_HOSTNAME must be a Supabase project hostname.");
  }
  if (url.hostname.toLowerCase() !== expectedHostname) {
    throw new Error(`VITE_SUPABASE_URL must use the expected Supabase hostname ${expectedHostname}.`);
  }

  if (!key) throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY is required for a production build.");
  if (placeholders.some((value) => key.toLowerCase().includes(value))) {
    throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY contains a placeholder value.");
  }
  if (!isPublicSupabaseKey(key)) {
    throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY is not a valid public Supabase key.");
  }

  return { url: url.origin, publishableKey: key, expectedHostname };
}

export function isPublicSupabaseKey(key) {
  if (/^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(key)) return true;
  const parts = key.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return payload.role === "anon";
  } catch {
    return false;
  }
}

export const forbiddenBrowserCredentialPatterns = [
  /sb_secret_[A-Za-z0-9_-]+/i,
  /SUPABASE_(?:ACCESS_TOKEN|SERVICE_ROLE_KEY|DB_PASSWORD)/,
  /CLOUDFLARE_(?:API_TOKEN|ACCOUNT_ID)/,
  /\"role\"\s*:\s*\"service_role\"/,
];
