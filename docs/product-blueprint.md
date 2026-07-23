# Octagon HQ V2 Product Blueprint

## Product promise
Octagon HQ is a UFC-only rankings, games, picks, and community product built for debate and the group chat.

## Locked experience
- A branded black startup screen prevents unfinished UI and theme flicker.
- Fresh launches always open Home.
- Routes load independently so one feature cannot delay the entire app.
- War Room is absent from navigation, Home, routes, onboarding, and notifications unless the user has access.
- Public language uses Octagon HQ. Internal labels such as “UFC App” and “GOAT26” are never shown.
- Home includes Your HQ: Daily streak, Current Picks record, Favorite fighter, and Open challenges.
- Sharing is minimal, native, consistent, and uses clean links.

## Architecture owners
- `src/main.tsx`: one application entry.
- `src/app/router.tsx`: one routing owner.
- `src/app/App.tsx`: one startup readiness owner.
- `src/lib/supabase.ts`: one Supabase client owner.
- `src/styles/tokens.css`: one semantic color and spacing source.
- Feature folders own their screens, state, and tests.

## Intentionally absent from the foundation
- No service worker.
- No custom cache or update manager.
- No copied V1 scripts or CSS.
- No authentication fallback.
- No War Room placeholder.
- No production database connection until the V2 development project is ready.

## Migration order
1. Foundation and preview deployment.
2. Rankings and fighter profiles.
3. Home personalization and onboarding.
4. Games and Challenge Center.
5. Picks and event recaps.
6. Profiles, War Room, mentions, and notifications.
7. Standardized sharing, installability, and cutover.
