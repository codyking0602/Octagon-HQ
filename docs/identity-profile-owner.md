# Octagon HQ Identity and Profile Owner

This is the canonical identity foundation for Octagon HQ.

## User experience

- Public identity is one simple uppercase name such as `CODY` or `SHANE`.
- A stable invisible UUID owns the account behind the name.
- A returning user enters the same name and personal four-digit PIN on Safari, desktop, or the saved app.
- Supabase persists the resulting session on each browser until the user signs out.
- There is no public username, email-login path, Play-only account, or fallback identity owner.

## Runtime ownership

- `src/features/identity/IdentityProvider.tsx` is the only app-facing identity/readiness owner.
- `src/features/identity/identityGateway.ts` is the only browser gateway to Supabase Auth and `profiles`.
- `src/lib/supabase.ts` remains the only Supabase client factory.
- Consumers call `useIdentity()` and use its cached profile. They must not call `getSession`, inspect auth storage, or resolve profiles independently.
- `src/app/App.tsx` remains the one startup owner and waits for canonical identity initialization before leaving the boot screen.

## Backend ownership

- `public.profiles` owns stable public profile data.
- `private.profile_pin_credentials` owns internal login email, hashed PIN, and lockout state. It is not exposed to browser roles.
- `register_pin_profile` and `verify_profile_pin` are service-role-only database functions.
- `supabase/functions/pin-auth` is the only name/PIN entry point.
- The browser receives a one-time hashed Supabase magic-link token after successful PIN verification and exchanges it for a normal persisted Supabase session.
- Five failed attempts lock the profile for five minutes.

## Initial deployment

1. Link the repository's `supabase/` directory to the Octagon HQ Supabase project.
2. Apply `supabase/migrations/202607240001_real_profiles.sql`.
3. Deploy the `pin-auth` Edge Function. `supabase/config.toml` deliberately sets `verify_jwt = false` because login occurs before a user session exists.
4. Set `OCTAGON_APP_ORIGIN` to the production app origin.
5. Leave `OCTAGON_PROFILE_CREATION_OPEN=true` while the small friend group creates profiles. Set it to `false` later to make new profiles invite-only without changing the client architecture.
6. Set Cloudflare's `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` values for the app build.

Until those environment values are connected, the app remains fully browsable and the profile dialog states honestly that profiles are not connected on that build. There is no hidden local identity fallback.

## Intentional first-PR boundary

This slice does not connect Challenge Center yet. The next slice replaces its preview-only local repository with the same `IdentityProvider` profile and a persistent Supabase challenge repository. The six game engines and their exact challenge setup/result contracts remain unchanged.
