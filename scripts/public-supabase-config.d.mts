export interface PublicSupabaseConfig {
  url?: string;
  publishableKey?: string;
  expectedHostname?: string;
}

export function validatePublicSupabaseConfig(config: PublicSupabaseConfig): {
  url: string;
  publishableKey: string;
  expectedHostname: string;
};

export function isPublicSupabaseKey(key: string): boolean;
export const forbiddenBrowserCredentialPatterns: RegExp[];
