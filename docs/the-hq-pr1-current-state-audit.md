# The HQ PR 1 — Current-State Audit

**Audit date:** August 31, 2026  
**Audited base:** `main` at `f0ac4a3d7e819068a0930e3455a32749abb4e029`  
**Scope:** Inventory only. No runtime behavior changes.

This document is the implementation handoff for PR 1 of `docs/the-hq-universal-app-roadmap.md`. The purpose is to identify the live canonical owners before the Codex Cloud implementation PRs begin.

## Canonical owner map

| Area | Canonical owner(s) | Current-state notes |
| --- | --- | --- |
| App routing | `src/app/router.tsx` | Owns Home, Rankings, Intelligence, UFC Picks/Play, Football routes, Back Room, profile, and challenge routes. |
| App shell / top header | `src/app/AppShell.tsx` | Owns the shared header, Notifications, What’s New, Intelligence entry, profile access, and shell-level Football route styling. |
| Bottom navigation | `src/components/BottomNavigation.tsx` | Owns the current Picks / Play / War Room-or-Back Room / Ratings tabs and route-aware Football variants. |
| Universal provider composition | `src/app/providers.tsx` | Owns the provider stack. `WarRoomProvider` is currently mounted globally. |
| Canonical destinations / deep links | `src/app/canonicalDestinations.ts` | Owns canonical destination construction, including War Room destinations. |
| Home composition | `src/features/home/HomePage.tsx` | Current Home composition owner. Home-specific models/cards should be composed here rather than reimplemented. |
| UFC Picks | `src/features/picks/PicksPage.tsx`, `src/features/picks/PicksProvider.tsx`, `src/features/picks/picksDestination.ts`, `src/features/picks/picksRepository.ts` | Preserve this data/business-logic path. |
| Football Picks | `src/features/picks/FootballPicksPage.tsx`, `src/features/picks/FootballPicksRoute.tsx` | Existing Football Picks presentation/routing path. |
| Play | `src/features/play/PlayPage.tsx`, `src/features/play/playRegistry.ts` | Existing UFC/Football game registry and Play surface. |
| Ratings | `src/features/rankings/RankingsPage.tsx`, ranking model/engine/data, `src/features/rankings/rankingDestination.ts` | Remains UFC-only in this rollout. |
| Intelligence | `src/features/intelligence/IntelligencePage.tsx`, `src/features/intelligence/intelligence.ts` | Remains UFC-only in this rollout. |
| Profile identity | `src/features/identity/IdentityControl.tsx` | Profile creation/switching entry. Current profile creation requires name and optional PIN, not a favorite fighter. |
| Profile preferences | `src/features/profile/ProfilePreferencesProvider.tsx` and its repository | Current owner of optional `favoriteFighterSlug` and `footballTeam`. |
| Member profile page | `src/features/members/MemberProfilePage.tsx` | Current visible profile/history destination. |
| Notifications | `src/features/notifications/NotificationProvider.tsx`, `NotificationCenterPage.tsx`, `NotificationHeaderAction.tsx`, `notificationDestination.ts`, notification repository/model | Preserve one notification ownership path. |
| What’s New | `src/features/whats-new/WhatsNewProvider.tsx`, `WhatsNewPage.tsx`, `WhatsNewPreview.tsx`, model/repository | Existing universal change-feed ownership path. |
| War Room | `src/features/war-room/WarRoomProvider.tsx` and War Room page/access/model/repository | Still a live runtime system, not merely a bottom-nav item. |
| Global style imports | `src/main.tsx` | Imports the single global token/style chain, including Football foundation/shell/component CSS. |
| Base theme tokens | `src/styles/tokens.css` | Current root accent is UFC red. |
| Football theme | `src/styles/football-foundation.css` plus shell/nav classes | Current Football accent is route-driven and team-preference-driven. Do not create a second theme provider. |

## Sport-context audit

There is **no universal sport-context owner today**.

Current Football context is inferred from `/football...` route paths in both `AppShell.tsx` and `BottomNavigation.tsx`. Those surfaces also read `footballTeam` from `ProfilePreferencesProvider` and apply Cowboys/Longhorns-specific CSS classes.

Therefore the future shared UFC/Football selection must be introduced by extending one canonical ownership path. Do not create competing route inference, a second sport provider, or duplicate initialization.

## War Room dependency audit

Removing War Room from bottom navigation is not equivalent to deleting War Room runtime code.

Active ownership/dependencies include:

- `src/components/BottomNavigation.tsx` — visible War Room / Back Room navigation entry.
- `src/app/router.tsx` — `/back-room` and `/back-room/access` routes.
- `src/app/providers.tsx` — globally mounted `WarRoomProvider`.
- `src/app/canonicalDestinations.ts` — canonical `war-room` destination support.
- `src/features/notifications/notificationDestination.ts` — notification deep-link support for War Room destinations.
- `src/features/war-room/*` — live War Room state/UI/repository implementation.

**Implementation consequence:** the navigation entry can be removed before the runtime owner is removed. Runtime/provider/route cleanup belongs in the later legacy-cleanup PR only after all callers and deep links are verified.

## Home composition audit

`src/features/home/HomePage.tsx` is the current Home composition owner. Existing feature owners already available for reuse include:

- Today’s Challenge state/provider.
- What’s New preview/provider/model/repository.
- Your HQ model.
- Picks Up Next state.
- Ranking Spotlight model/card.
- Shane’s Watchlist / Contender Series-related Home content.

Universal Home should compose these existing owners and the existing Football products. It should not recreate their scoring, persistence, ranking, picks, or challenge business logic.

## Onboarding and favorites audit

The current profile creation flow in `src/features/identity/IdentityControl.tsx` does **not** require a favorite fighter. It creates/switches a profile from a display name and optional PIN.

`favoriteFighterSlug` is currently an optional profile preference. Home uses it for optional favorite-fighter presentation but does not gate entry on it.

The actual hard favorite/team gate that exists today is Football first entry: `src/features/back-room/FootballBackRoomPage.tsx` renders `FootballTeamGate` until `preferences.footballTeam` is Cowboys or Longhorns. `src/features/back-room/FootballHeader.tsx` also exposes team switching and team-colored presentation.

**Implementation consequence:** the onboarding-cleanup PR must remove the obsolete Football team requirement without inventing a nonexistent favorite-fighter signup gate. Existing stored favorite/team values may remain unless a concrete safe migration requires removal.

## Theme audit

There is already one global style import chain in `src/main.tsx`.

- `src/styles/tokens.css` owns shared root tokens; the current primary accent is UFC red.
- `src/styles/football-foundation.css` owns Football variables and currently defaults to Cowboys blue while supporting Cowboys/Longhorns overrides.
- `AppShell.tsx` and `BottomNavigation.tsx` apply Football/team classes based on route and `footballTeam` preference.

The rollout should evolve these owners into the locked mental model:

- Gold = The HQ universal surfaces.
- Red = UFC.
- Blue = Football.

Do not add another theme provider, duplicate token initialization, or favorite-team-driven app-wide theme path.

## Brand-string inventory

Confirmed active universal-brand candidates that should be reconsidered during the later brand-migration PR:

- `src/app/AppShell.tsx` — default `Octagon HQ` shell brand.
- `src/features/home/HomePage.tsx` — `OCTAGON HQ` Home branding.
- `src/features/identity/IdentityControl.tsx` — `Octagon HQ Profile` framing.
- `src/main.tsx` — root startup-error wording.
- `src/features/profile/ProfilePreferencesProvider.tsx` — profile-load error wording.
- `index.html` — `Octagon HQ` title/description metadata.
- `public/app.webmanifest` — `Octagon HQ` app name and short name.
- `src/features/back-room/FootballHeader.tsx` — `Octagon HQ` umbrella label above Football Lab.

UFC-specific `Octagon HQ` wording may remain where it is intentionally the UFC identity. Do not blindly global-replace the name.

This inventory is intentionally tied to the audited runtime owners above. The later brand-cleanup PR must re-run the inventory against then-current `main` before editing, because additional strings may be added between PR 1 and that PR.

## Guardrails for PR 2 onward

1. Every Codex implementation PR starts fresh from the then-current `main`.
2. Read `docs/the-hq-universal-app-roadmap.md` and this audit before changing runtime code.
3. Preserve the canonical owner named above; extend it rather than creating a fallback or competing owner.
4. Removing a visible entry does not authorize deleting its runtime provider/routes until dependents are proven gone.
5. Do not recreate Home feature business logic in the universal Home composition.
6. Do not create a second sport-context or theme initialization path.
7. Ratings and Intelligence stay UFC-only until their real Football products exist.
8. Re-run affected owner/dependency checks against fresh `main` before each implementation PR; this audit is a baseline, not permission to ignore intervening changes.

## PR 1 completion criteria

PR 1 is complete when this audit is merged and the canonical roadmap records Phase 0 as complete. No production/runtime code should change in PR 1.
