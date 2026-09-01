# The HQ Universal App Roadmap

**Status:** Product architecture locked; Phase 0 current-state audit complete; runtime implementation not yet started.  
**Last updated:** August 31, 2026  
**Canonical purpose:** Preserve the agreed multi-sport architecture for The HQ so implementation can continue across multiple chats without re-deciding settled product choices.

> **Cross-chat rule:** Read this document before making changes related to the universal app shell, Home, sport switching, branding, navigation, profile, notifications, onboarding, or sport theming. Treat sections marked **LOCKED** as authoritative unless Cody explicitly reopens a decision.

---

## 1. Product Direction — LOCKED

Octagon HQ is evolving into **The HQ**, a multi-sport app umbrella.

At launch of this architecture:

- UFC and Football are the active sports.
- **Home is universal** and belongs to The HQ, not to a single sport.
- **Picks and Play are sport-specific** and can switch between UFC and Football.
- **Ratings remains UFC-only initially** because Football Ratings does not exist yet.
- **Intelligence remains UFC-only initially** because Football Intelligence does not exist yet.
- Do not expose fake, empty, duplicate, or “coming soon” sport destinations merely for symmetry.

The app should feel like one coherent product with distinct sport identities, not two separate apps glued together.

---

## 2. Bottom Navigation — LOCKED

The bottom navigation order is:

1. **Home**
2. **Picks**
3. **Play**
4. **Ratings**

### Rules

- **War Room is removed** from the bottom navigation and product shell.
- Do not add a fifth tab simply to replace War Room.
- Home is universal and has no sport selector.
- Picks and Play support UFC / Football switching.
- Ratings is UFC-only until a real Football Ratings product exists.

---

## 3. Persistent Top Header — LOCKED

The top header remains a universal app shell.

### Persistent header contents

- New **HQ logo**
- **THE HQ** branding
- **Notifications**
- **Intelligence**
- **Profile photo / profile access**

These controls remain visible rather than being removed to simplify the multi-sport shell.

### Sport context row

On sport-specific tabs, a second row clearly identifies the current sport and section, for example:

- `UFC PICKS ▼`
- `FOOTBALL PICKS ▼`
- `UFC PLAY ▼`
- `FOOTBALL PLAY ▼`
- `UFC RATINGS`

The sport/section context should be obvious without relying only on color.

Home does **not** show this sport context row because Home is universal.

---

## 4. Sport Switching — LOCKED

### Picks and Play

Picks and Play each have a sport selector with:

- UFC
- Football

The selected sport is **global across sport-specific tabs**.

Example:

- Switch Picks to Football.
- Tap Play.
- Football Play opens.

Likewise, switching back to UFC anywhere updates the shared sport context.

### Persistence

The app should remember the user's most recent sport selection between sessions.

### Ratings

Ratings does **not** show a Football option until Football Ratings is a real product.

### Intelligence

The existing Intelligence button remains in the universal header.

For now:

- It opens UFC Intelligence.
- The destination should be clearly identified as UFC Intelligence.
- Do not build a fake Football Intelligence destination.

When Football Intelligence eventually exists, Intelligence can become sport-aware using the same universal shell philosophy.

---

## 5. Color / Visual Identity — LOCKED

The app keeps one shared design system while giving each sport an immediately recognizable visual identity.

### Universal The HQ

Use the shared HQ foundation:

- Black
- Charcoal
- White
- Gold

This owns universal surfaces such as Home, profile, settings, navigation, and common system components.

### UFC

- Black / charcoal foundation
- **Red** as the dominant sport accent

### Football

- Black / charcoal foundation
- **Blue** as the dominant sport accent
- Direction: deep navy / bright or powder blue family

### Team colors

Team colors can still appear heavily in matchup art, Game of the Week graphics, helmets, and team-specific content.

They do **not** drive the app-wide Football theme.

### Explicitly rejected

- No automatic Football theme based on a user's favorite team.
- No favorite-team requirement solely to operate the UI theme.
- No separate component/design system for each sport.

The desired mental map is:

- **Gold = The HQ**
- **Red = UFC**
- **Blue = Football**

---

## 6. Onboarding / Favorites — LOCKED

Required favorite selection is removed from onboarding.

### Do not require

- Favorite UFC fighter
- Favorite NFL team
- Favorite college team

The prior favorite-fighter requirement should not remain merely because it already exists.

### Product principle

Do not collect personalization data unless the app is actually going to use it meaningfully.

Existing favorite data may remain in storage if removing it would create unnecessary migration risk, but it should not be a required onboarding gate unless a future product feature gives it a real purpose.

---

# 7. Universal Home Architecture — LOCKED

Home becomes the command center for **The HQ** across sports.

The card/section order is:

1. **Up Next**
2. **Today's Challenges**
3. **What's New**
4. **Your HQ**
5. **UFC HQ**
6. **Football HQ**

Do not add a separate standalone Leaderboards section. Relevant standing / rank information belongs inside the card or feature it relates to.

---

## 7.1 Up Next — LOCKED

Up Next is the hero action at the top of Home.

### Purpose

Show the **single most important thing the user should do next** across the entire app.

Examples include:

- Finish UFC picks before lock
- Finish Football picks before lock
- Play an available daily challenge
- Respond to a direct challenge
- View newly available results / recap

### Rules

- One primary item at a time.
- Not a carousel.
- One clear primary CTA such as `MAKE PICKS`, `FINISH PICKS`, `PLAY NOW`, or `VIEW RESULTS`.
- Exact priority logic is an implementation detail and can be tuned without changing the locked product concept.

---

## 7.2 Today's Challenges — LOCKED

Both daily challenge products appear on universal Home.

Show:

- **UFC Today's Challenge**
- **Football Today's Challenge**

Each should show appropriate compact status such as:

- Not played
- In progress
- Completed
- Score
- Today's standing / placement when relevant

Each challenge remains independently tappable into its sport-specific game experience.

A daily challenge may also become the Up Next hero when it is the most important available action, but that does not remove the permanent Today's Challenges section.

---

## 7.3 What's New — LOCKED

What's New belongs on universal Home as its own content section.

### Purpose

Surface meaningful new product/content changes across The HQ, such as:

- New ranking update
- New Fight Spotlight
- New Shane's Contender Series fighter/content
- New weekly Football slate
- New game mode or feature

### Rule

What's New answers **“What changed?”** It should not become a duplicate activity feed or another version of Up Next.

---

## 7.4 Your HQ — LOCKED

Your HQ is a compact personal snapshot.

For the current product, show exactly these three core stats:

- **Daily Streak**
- **UFC Picks Record**
- **Football Picks Record**

### Explicitly excluded for now

- Open Challenges — too repetitive next to Today's Challenges / challenge surfaces
- Championships — no championship system exists yet
- A forced fourth stat just to fill space

Three clean stats is preferred over inventing another metric.

---

## 7.5 UFC HQ Block — LOCKED

The UFC section is a compact UFC-specific block on universal Home.

It contains:

### 1. Next UFC Event

Show useful event context and the user's picks status.

### 2. Ranking Spotlight

Preserve the existing daily Ranking Spotlight as a standing UFC Home feature.

### 3. Shane's Contender Series

Preserve Shane's Contender Series as a standing UFC feature with its own branded treatment when active.

This is not merely What's New. What's New may announce new Contender Series content, but the persistent access point remains inside the UFC HQ block.

### Standings

Relevant UFC Picks standing / rank information should be shown inline with the Picks/event context rather than in a separate universal Leaderboards section.

---

## 7.6 Football HQ Block — LOCKED

The Football section mirrors the UFC block structurally while using football-native content.

It contains:

### 1. This Week

Show current Football Picks context, including status / remaining selections as appropriate.

### 2. College Game of the Week

Use the existing weekly featured college matchup treatment.

### 3. NFL Game of the Week

Use the existing weekly featured NFL matchup treatment.

### Standings

Relevant Football Picks standing / rank information should be shown inline with the This Week / Picks context rather than in a separate universal Leaderboards section.

---

## 8. Profile — LOCKED

Profile becomes a universal **The HQ** profile rather than a UFC-only profile.

It should support universal identity and cross-sport history such as:

- Name / avatar
- Daily streak
- UFC Picks record
- Football Picks record
- Challenge history
- Settings

Do not add favorite fighter/team sections merely because those fields previously existed.

---

## 9. Notifications — LOCKED

Notifications become one universal inbox.

### Rules

- UFC and Football notifications coexist in one feed.
- Sport should be immediately identifiable, including the sport accent system where appropriate:
  - UFC = red
  - Football = blue
- Tapping a notification should deep-link directly into the correct sport and relevant destination.

Do not create separate notification centers per sport.

---

## 10. Leaderboards / Standings Placement — LOCKED

Do **not** create a standalone universal Leaderboards section on Home.

Standing information should stay with its relevant product context.

Examples:

- UFC Today's Challenge card → today's UFC challenge placement
- Football Today's Challenge card → today's Football challenge placement
- UFC Picks / Next Event context → UFC Picks season standing
- Football This Week / Picks context → Football Picks season standing

This keeps “how am I doing?” attached to the activity being measured.

---

# 11. Explicit Non-Goals for This Rollout — LOCKED

Do not expand the scope by building these merely to complete symmetry:

- Football Ratings
- Football Intelligence
- Personalized favorite-team UI themes
- Required favorite fighter/team onboarding
- Championship stats before championships actually exist
- A replacement fifth navigation tab for War Room
- A standalone Home Leaderboards block
- Duplicate sport-specific versions of universal systems such as notifications or profile

---

# 12. Implementation Roadmap

The architecture above is settled. Implementation should now follow the repository working standard:

> One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.

Do not implement the whole migration in one giant PR.

### PR Tool Routing — LOCKED

Use the following routing so the rollout does not get trapped between the limited GitHub editing tools available in normal ChatGPT and Codex Cloud's fresh-PR workflow.

**Default rule:**

- **PR 1 may be handled in ChatGPT with the GitHub tools.** It is an audit / documentation PR and should not change runtime behavior.
- **PRs 2–14 are CODEX CLOUD REQUIRED.** They change runtime code and need a real repository checkout plus focused tests, typecheck, the full test suite, and the production build on the exact final head.
- ChatGPT's GitHub tools remain useful for reading the repository, reviewing Codex diffs, checking PR state / CI, updating roadmap documentation, and merging verified PRs. Do not use the limited GitHub file-edit path as a substitute for Codex on these implementation PRs.

**Codex fresh-PR rule:**

- One Codex task = one roadmap PR.
- Before every Codex task, resolve the new current `main` after the previous PR has merged.
- Start a fresh Codex task / branch from that current `main`; do not ask Codex to continue the prior merged branch for the next roadmap item.
- Tell Codex to read this roadmap first and implement **only the named PR scope**. It must not opportunistically start the next roadmap PR.
- Every Codex prompt must repeat the repository rule: preserve the canonical owner; no fallback, duplicate provider, second query path, competing route owner, or duplicate initialization.
- After Codex opens the PR, review the actual diff and exact-head checks here before merge. Codex is the implementation executor, not the authority for locked product nuance.

| PR | Scope | Execution | Review sensitivity |
| --- | --- | --- | --- |
| **1** | Current-state audit + owner inventory | **CHATGPT / GITHUB OK** | High breadth; no runtime edits |
| **2** | Universal THE HQ header | **CODEX REQUIRED** | Normal |
| **3** | Bottom navigation: Home / Picks / Play / Ratings; remove War Room nav | **CODEX REQUIRED** | Normal |
| **4** | Canonical shared UFC / Football sport context + persistence | **CODEX REQUIRED** | **HIGH — ownership / state duplication risk** |
| **5** | Picks / Play sport-switching UI + sport/section context row | **CODEX REQUIRED** | **HIGH — preserve Ratings / Intelligence UFC-only behavior** |
| **6** | Universal gold / UFC red / Football blue theme-token path | **CODEX REQUIRED** | Normal; do not add a second theme owner |
| **7** | Universal Home foundation + locked section order | **CODEX REQUIRED** | **HIGH — compose existing owners, do not recreate logic** |
| **8** | Up Next priority hero | **CODEX REQUIRED** | **HIGH — cross-product priority logic** |
| **9** | Today's Challenges + Your HQ | **CODEX REQUIRED** | **HIGH — reuse existing challenge / record data owners** |
| **10** | UFC HQ Home block | **CODEX REQUIRED** | **HIGH — preserve Ranking Spotlight + Shane's Contender Series** |
| **11** | Football HQ Home block + What's New integration | **CODEX REQUIRED** | **HIGH — preserve weekly picks + both Game of the Week owners** |
| **12** | Universal Profile | **CODEX REQUIRED** | Normal; do not reintroduce unused favorites |
| **13** | Universal Notifications + onboarding cleanup | **CODEX REQUIRED** | **HIGH — deep links, delivery ownership, auth/profile creation** |
| **14** | Brand migration + War Room / legacy cleanup | **CODEX REQUIRED** | **HIGH — deletion / regression risk; inventory first** |

If PR 13 proves to cross genuinely separate canonical owners, split it into **13A Notifications** and **13B Onboarding**, with each one run as its own fresh Codex PR from then-current `main`. In that case the rollout becomes 15 PRs rather than forcing unrelated ownership into one diff.

---

## Phase 0 — Current-State Audit

**Status: COMPLETE — rollout PR 1 / GitHub PR #801**

Audit baseline: `main` at `f0ac4a3d7e819068a0930e3455a32749abb4e029`.

Persistent handoff: `docs/the-hq-pr1-current-state-audit.md`.

Confirmed before runtime implementation:

- `src/app/AppShell.tsx` owns the current shared shell/header.
- `src/components/BottomNavigation.tsx` owns bottom navigation.
- `src/app/router.tsx` owns app routing.
- `src/features/home/HomePage.tsx` owns Home composition.
- There is no shared universal sport-context owner yet; current Football context is route-inferred.
- Football shell/nav styling currently reads the optional `footballTeam` profile preference and applies Cowboys/Longhorns theme classes.
- War Room remains a live runtime dependency through navigation, routes, the globally mounted `WarRoomProvider`, canonical destinations, and notification deep links. Removing its nav entry does not authorize early runtime deletion.
- Profile creation currently has no favorite-fighter gate. The live hard favorite/team gate is Football first entry, which requires Cowboys or Longhorns.
- `src/main.tsx` plus `src/styles/tokens.css` and the existing Football CSS files are the current single theme/style initialization path; do not add a second theme owner.
- Universal `Octagon HQ` brand candidates and UFC-specific exceptions are inventoried in the audit handoff; the later brand PR must re-run that inventory against then-current `main` before editing.

**Do not create duplicate route owners, theme providers, sport state providers, or fallback navigation paths.**

---

## Phase 1 — Universal Shell + Navigation

Goal: establish The HQ shell without rebuilding feature contents.

Likely narrow changes:

- Introduce / update universal **THE HQ** header branding.
- Preserve Notifications, Intelligence, and Profile in the header.
- Change bottom navigation to:
  - Home
  - Picks
  - Play
  - Ratings
- Remove War Room from navigation.
- Add the sport/section context row on sport-specific surfaces.

Validate existing UFC flows before adding additional behavior.

---

## Phase 2 — Canonical Sport Context + Theme Tokens

Goal: one sport state owner shared by Picks and Play.

Requirements:

- UFC / Football switching for Picks and Play.
- Global selection across sport-specific tabs.
- Persist last selected sport.
- One theme-token path:
  - universal HQ = gold foundation
  - UFC = red accent
  - Football = blue accent
- Ratings remains UFC-only.
- Intelligence remains UFC-only.

Do not add a second sport context provider or duplicate theme initialization.

---

## Phase 3 — Universal Home

Implement Home in the locked order:

1. Up Next
2. Today's Challenges
3. What's New
4. Your HQ
5. UFC HQ
6. Football HQ

Preserve the existing canonical data owners for each underlying feature. Home should compose existing products, not recreate their business logic.

### Home acceptance checks

- Both daily challenges render independently.
- Ranking Spotlight remains available.
- Shane's Contender Series remains available.
- UFC Next Event / Picks state is accurate.
- Football This Week / Picks state is accurate.
- College and NFL Game of the Week content remains intact.
- Standings are inline and not duplicated in a new universal leaderboard system.

---

## Phase 4 — Universal Profile + Notifications

### Profile

- Convert visible framing to The HQ.
- Show cross-sport records/history where data already exists.
- Avoid adding favorite sections with no product use.

### Notifications

- One inbox.
- Sport-aware visual tags/accent.
- Correct deep links into UFC / Football destinations.
- Preserve existing notification ownership and delivery systems.

---

## Phase 5 — Onboarding Cleanup

Goal: remove obsolete favorite-fighter gating without disturbing existing accounts.

Requirements:

- New users are not forced to select a favorite fighter/team.
- Existing users are not re-onboarded.
- Preserve existing stored favorite values unless a safe migration has a concrete reason to remove them.
- Authentication/profile creation must remain intact.

Audit clarification: the current profile-creation flow does not require a favorite fighter. The actual live gate to remove is Football first-entry team selection. Re-check fresh `main` before this PR and remove only the obsolete gate that actually exists.

---

## Phase 6 — Brand Migration + Legacy Cleanup

This phase requires an explicit inventory before edits.

### Universal surfaces

Move universal shell branding toward **The HQ**.

### UFC-specific surfaces

`Octagon HQ` may remain where it functions as the UFC-specific identity rather than the umbrella app name.

### Cleanup

- Remove dead War Room navigation/runtime ownership only after dependents are verified.
- Remove obsolete universal-UFC assumptions exposed by the new shell.
- Do not remove working UFC feature identity just for naming consistency.

---

## Phase 7 — Release Verification

For each implementation PR:

1. Start from current `main`.
2. Preserve the canonical owner.
3. Make one narrow change.
4. Add focused tests.
5. Require the exact final head to pass:
   - typecheck
   - full test suite
   - production build
   - relevant backend verification
6. Merge only after exact-head green.
7. Let GitHub Actions remain the only deployment owner.
8. When live testing is required, deploy the exact intended head through the canonical workflow.
9. Verify the production live deployment marker matches the intended commit SHA.

Do not claim a merged change is live until the live deployment SHA is verified.

---

# 13. Current Resume Point

**Phase 0 audit is complete.**

The next rollout item is **PR 2 — Universal THE HQ header**. It must be implemented as a **fresh Codex Cloud PR from the then-current `main`** and must read both:

- `docs/the-hq-universal-app-roadmap.md`
- `docs/the-hq-pr1-current-state-audit.md`

PR 2 should change only the universal header scope; do not begin bottom-navigation, shared sport-context, Home, or theme-token work early.

Do **not** restart card-by-card Home brainstorming unless Cody explicitly reopens it.

Do **not** re-debate:

- Home being universal
- Home card order
- bottom-nav order
- War Room removal
- shared sport state for Picks / Play
- Ratings and Intelligence being UFC-only for now
- The HQ / UFC / Football color identities
- removal of required favorites onboarding
- universal profile / notifications
- inline standings rather than a standalone Home leaderboard

---

# 14. Decision Log

## August 31, 2026

Locked the first universal The HQ architecture after Football Picks reached rollout readiness.

Key decisions:

- Universal Home
- Four-tab nav: Home / Picks / Play / Ratings
- War Room removed
- Shared UFC / Football selector for Picks and Play
- Ratings UFC-only initially
- Intelligence UFC-only initially
- Persistent THE HQ header with Notifications, Intelligence, and Profile
- Universal gold identity, UFC red, Football blue
- No favorite-based theme personalization
- No required favorite onboarding
- Home stack locked as Up Next / Today's Challenges / What's New / Your HQ / UFC HQ / Football HQ
- Ranking Spotlight and Shane's Contender Series preserved inside UFC HQ
- College and NFL Game of the Week preserved inside Football HQ
- Standings stay inline with their relevant products
- Profile and Notifications become universal
- Tool routing locked: PR 1 may use ChatGPT GitHub tools; runtime implementation PRs 2–14 require fresh Codex Cloud PRs from current `main`, followed by exact-head review here

### Phase 0 completion

- Rollout item: PR 1 — Current-State Audit
- GitHub PR: #801
- Audited base: `f0ac4a3d7e819068a0930e3455a32749abb4e029`
- Handoff: `docs/the-hq-pr1-current-state-audit.md`
- Runtime behavior changed: no
- Newly confirmed implementation nuance: no shared sport-context owner exists yet; War Room has runtime/deep-link dependencies beyond navigation; profile creation has no favorite-fighter gate while Football first entry has the actual team gate.

---

## Maintenance Rule

Update this document whenever Cody explicitly changes a locked architecture decision or when an implementation phase is completed.

When updating progress, record:

- date
- PR number
- merged SHA
- exact phase / item completed
- any newly locked product decision

For a PR that itself updates this roadmap, its merge SHA cannot be known inside the commit being merged. Record the PR number and audited/base SHA in that PR, verify the exact merge result externally, and backfill the prior merged SHA the next time this roadmap is edited.

This file should remain the canonical cross-chat handoff for the universal The HQ rollout until the migration is complete.