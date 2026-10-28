// The trusted deployment workflow may replace this with an exact source SHA.
// Until that workflow revision reaches main, this unique runtime marker proves
// the persisted-source-url function revision is the code running in Supabase.
export const DEPLOYED_SOURCE_SHA = "persisted-source-url-v1";
