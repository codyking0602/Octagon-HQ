# The HQ Universal App Roadmap

**Status:** Product architecture locked; Phase 0 audit complete; rollout PRs 2–11 complete through PR #820; PR 12 follows.  
**Last updated:** September 1, 2026  
**Canonical purpose:** Preserve the agreed multi-sport architecture for The HQ so implementation can continue across multiple chats without re-deciding settled product choices.

> **Cross-chat rule:** Read this document before making changes related to the universal app shell, Home, sport switching, branding, navigation, profile, notifications, onboarding, or sport theming. Treat sections marked **LOCKED** as authoritative unless Cody explicitly reopens a decision.

---

## 1. Product Direction — LOCKED

Octagon HQ is evolving into **The HQ**, a multi-sport app umbrella.

At launch of this architecture:

- UFC and Football are the active sports.
- **Home is universal** and belongs to The HQ, not to a single sport.
- **Picks and Play are sport-specific** and can switch between UFC and Football.
- **Rankings remains UFC-only initially** because Football Rankings does not exist yet.
- **Intelligence remains UFC-only initially** because Football Intelligence does not exist yet.
- Do not expose fake, empty, duplicate, or “coming soon” sport destinations merely for symmetry.

The app should feel like one coherent product with distinct sport identities, not two separate apps glued together.

---

## 2. Bottom Navigation — LOCKED

The bottom navigation order is:

1. **Home**
2. **Picks**
3. **Play**
4. **Rankings**

### Rules

- **War Room is removed** from the bottom navigation and product shell.
- Do not add a fifth tab simply to replace War Room.
- Home is universal and has no sport selector.
- Picks and Play support UFC / Football switching.
- Rankings is UFC-only until a real Football Rankings product exists.

---

## 3. Persistent Top Header — LOCKED

The top header remains a universal app shell.

### Persistent header contents

- The approved **The HQ symbol**
- **THE HQ** wordmark / branding
- **Notifications**
- **Intelligence**
- **Profile photo / profile access**

These controls remain visible rather than being removed to simplify the multi-sport shell.

### Logo system — LOCKED

The umbrella mark is **symbol-first, not letter-first**.

- Do not use `HQ`, an H/Q monogram, or other letters inside the logo mark.
- The current approved direction is a **white app tile with a black abstract hub / target-style symbol**.
- The Home Screen / install icon, favicon/app icon, and universal brand mark should derive from the same canonical symbol asset rather than competing logo paths.
- In the header, the symbol is paired with the visible **THE HQ** wordmark; the symbol itself does not need to spell the brand name.
- The previously approved black-and-gold interlocked H/Q asset is superseded and should not drive future brand work.

### Sport context row

On sport-specific tabs, a second row clearly identifies the current sport and section, for example:

- `UFC PICKS ▼`
- `FOOTBALL PICKS ▼`
- `UFC PLAY ▼`
- `FOOTBALL PLAY ▼`
- `UFC RANKINGS`

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

### Rankings

Rankings does **not** show a Football option until Football Rankings is a real product.

### Intelligence

The existing Intelligence button remains in the universal header.

For now:

- It opens UFC Intelligence.
- The destination should be clearly identified as UFC Intelligence.
- Do not build a fake Football Intelligence destination.

When Football Intelligence eventually exists, Intelligence can become sport-aware using the same universal shell philosophy.

---

## 5. Color / Visual Identity — LOCKED

The app keeps one shared design system while giving sport-specific surfaces an immediately recognizable identity.

### Universal The HQ

The umbrella shell is **neutral and dark-first**.

Use the shared HQ foundation:

- Near-black
- Charcoal / graphite
- White
- Soft gray
- Silver / neutral metallic detail where useful

This owns universal surfaces such as Home, profile, settings, navigation, and common system components.

**Gold / yellow is retired from the universal The HQ shell.** Do not treat gold as the umbrella brand accent going forward.

The primary app experience should remain dark even though the approved app icon uses a white tile.

### UFC

- Black / charcoal foundation
- **Red** as the dominant UFC contextual accent

### Football

- The universal shell remains neutral.
- **Navy `#1F4E79` is the dominant Football sport-level contextual accent.**
- Football Picks / Play context, selected Football controls, and other generic Football-specific interaction accents should resolve through that navy theme-token path.
- Team / matchup colors may still supply stronger content-specific accents when a team or matchup is the actual subject.

### Team colors

Team colors can appear heavily in matchup art, Game of the Week graphics, helmets, team-specific content, and other surfaces where that team is the actual context.

They do **not** create an automatic app-wide theme based on the user's favorite team.

### Explicitly rejected

- No gold/yellow universal HQ theme.
- No letter-based H/Q logo mark.
- No automatic Football theme based on a user's favorite team.
- No favorite-team requirement solely to operate the UI theme.
- No separate component/design system for each sport.

The desired mental map is now:

- **Neutral = The HQ shell**
- **Red = UFC context**
- **Navy `#1F4E79` = Football context**
- **Team colors = content-specific Football treatment when appropriate**

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
- Sport should be immediately identifiable through text/context and the contextual accent system where appropriate:
  - UFC = red
  - Football = navy `#1F4E79` by default; team/matchup color may take over when that content is the actual context
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

- Football Rankings
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
- **PRs 2–14 are CODEX CLOUD REQUIRED by default.** They change runtime code and need focused tests, typecheck, the full test suite, and the production build on the exact final head.
- **PR 4 has one explicit execution exception:** after repeated Codex Cloud tasks could not obtain authenticated repository access, Cody explicitly authorized ChatGPT to implement and merge PR 4 using the connected GitHub tools.
- **PR 5 has one explicit execution exception:** Cody explicitly requested direct GitHub implementation and merge of PR 5 in that chat.
- **PR 6 has one explicit execution exception:** Cody explicitly requested direct GitHub implementation and merge of PR 6 in that chat.
- **PR 7 has one explicit execution exception:** Cody explicitly requested direct GitHub implementation and merge of PR 7 in that chat.
- **PR 8 has one explicit execution exception:** Cody explicitly requested direct GitHub implementation and merge of PR 8 in that chat.
- **PR 9 has one explicit execution exception:** Cody explicitly requested direct GitHub implementation and merge of PR 9 in that chat.
- **PR 10 has one explicit execution exception:** Cody explicitly requested direct GitHub implementation and merge of PR 10 in that chat.
- **PR 11 has one explicit execution exception:** Cody explicitly requested direct GitHub implementation and merge of PR 11 in this chat. This does not change the default Codex routing for PR 12+.
- ChatGPT's GitHub tools remain useful for reading the repository, reviewing Codex diffs, checking PR state / CI, updating roadmap documentation, and merging verified PRs.
- Narrow corrective follow-up PRs explicitly requested by Cody may be handled separately when they do not substitute for the next named roadmap implementation PR.

**Codex fresh-PR rule:**

- One Codex task = one roadmap PR.
- Before every Codex task, resolve the new current `main` after the previous PR has merged.
- Start a fresh Codex task / branch from that current `main`; do not ask Codex to continue the prior merged branch for the next roadmap item.
- Tell Codex to read this roadmap first and implement **only the named PR scope**. It must not opportunistically start the next roadmap PR.
- Every Codex prompt must repeat the repository rule: preserve the canonical owner; no fallback, duplicate provider, second query path, competing route owner, or duplicate initialization.
- After Codex opens the PR, review the actual diff and exact-head checks here before merge. Codex is the implementation executor, not the authority for locked product nuance.

| PR | Scope | Execution | Review sensitivity |
| --- | --- | --- | --- |
| **1** | Current-state audit + owner inventory | **COMPLETE — #801** | High breadth; no runtime edits |
| **2** | Universal THE HQ header | **COMPLETE — #802** | Normal |
| **3** | Bottom navigation: Home / Picks / Play / Rankings; remove War Room nav | **COMPLETE — #804, corrected by #805** | Normal |
| **4** | Canonical shared UFC / Football sport context + persistence | **COMPLETE — #810; explicit ChatGPT execution exception** | **HIGH — ownership / state duplication risk** |
| **5** | Picks / Play sport-switching UI + sport/section context row | **COMPLETE — #811; explicit ChatGPT execution exception** | **HIGH — preserve Rankings / Intelligence UFC-only behavior** |
| **6** | Neutral universal shell + contextual sport accent theme-token path | **COMPLETE — #812; navy correction in #813** | Normal; do not add a second theme owner |
| **7** | Universal Home foundation + locked section order | **COMPLETE — #814; base `67843661eefcf9ffd1f7785189076c6961e4e6e4`; explicit ChatGPT execution exception** | **HIGH — compose existing owners, do not recreate logic** |
| **8** | Up Next priority hero | **COMPLETE — #815; base `763a5ea69873f1869681022b2ad3a12de8d13362`; explicit ChatGPT execution exception** | **HIGH — cross-product priority logic** |
| **9** | Today's Challenges + Your HQ | **COMPLETE — #818; base `42f47089f77715b2898e669aa724b22df5f49edc`; explicit ChatGPT execution exception** | **HIGH — reuse existing challenge / record data owners** |
| **10** | UFC HQ Home block | **COMPLETE — #819; base `a2f812e5de4fbf222fe9580514dde2ba2af9bd73`; explicit ChatGPT execution exception** | **HIGH — preserve Ranking Spotlight + Shane's Contender Series** |
| **11** | Football HQ Home block + What's New integration | **COMPLETE — #820; base `9afbfdfe11bddd20051ea6eaef5b996c30d310a4`; explicit ChatGPT execution exception** | **HIGH — preserve weekly picks + both Game of the Week owners** |
| **12** | Universal Profile | **CODEX REQUIRED — NEXT** | Normal; do not reintroduce unused favorites |
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

**Status: PR 2, PR 3, PR 5, and PR 6 are merged. PR #813 is the narrow Football navy corrective follow-up.**

Goal: establish The HQ shell without rebuilding feature contents.

Completed:

- Universal **THE HQ** header shell established in PR #802.
- Notifications, Intelligence, and Profile preserved in the header.
- Bottom navigation reduced to four tabs in PR #804.
- War Room nav entry removed while runtime/provider/routes remained intact.
- Visible fourth-tab label corrected back to **Rankings** in PR #805.
- Approved neutral symbol corrective follow-up completed in PR #809.
- PR #811 added the sport/section context row to the existing AppShell owner and UFC / Football switching only for Picks and Play.
- Rankings and Intelligence remain visibly UFC-only without a Football option; Home remains universal with no sport-context row.
- PR #812 added the neutral universal shell and shared contextual theme-token path.

Validate existing UFC flows before adding additional behavior.

---

## Phase 2 — Canonical Sport Context + Theme Tokens

Goal: one sport state owner shared by Picks and Play.

Requirements:

- UFC / Football switching for Picks and Play.
- Global selection across sport-specific tabs.
- Persist last selected sport.
- One theme-token path:
  - universal HQ = neutral dark-first foundation
  - UFC = red contextual accent
  - Football = navy `#1F4E79` sport-level contextual accent
  - team/matchup colors remain content-specific where appropriate
- Rankings remains UFC-only.
- Intelligence remains UFC-only.

PR 4 established the canonical state layer:

- `src/app/SportProvider.tsx` is the one selected-sport owner.
- `src/app/providers.tsx` mounts that owner once for the app runtime.
- The selected value is limited to `ufc | football`.
- Last selection persists locally between sessions under `the-hq:selected-sport`.

PR 5 consumes that owner for Picks / Play navigation and context-row presentation only. It does not add another sport state or persistence path.

PR 6 implementation in #812 extends the existing single style path rather than introducing a theme provider or duplicate initialization:

- `src/styles/tokens.css` defines the reusable neutral / UFC / Football contextual accent tokens.
- `src/app/AppShell.tsx` remains the shell owner and applies the contextual theme scope.
- The portaled `BottomNavigation` consumes the same scope rather than resolving a second theme path.
- Favorite-team profile preferences no longer drive app-wide Football shell/nav theme classes; existing Football feature styling remains in its existing CSS owners.
- Home remains neutral, Rankings and Intelligence remain UFC contextual, and Picks / Play retain the PR 5 switching owners.
- PR #813 corrects the Football contextual token to navy `#1F4E79` without adding another state, provider, style initialization, or theme owner.

Do not add a second sport context provider or duplicate theme initialization.

---

## Phase 3 — Universal Home

**Status: PR 7 through PR 11 are complete through #820; PR 12 is next.**

Implement Home in the locked order:

1. Up Next
2. Today's Challenges
3. What's New
4. Your HQ
5. UFC HQ
6. Football HQ

Preserve the existing canonical data owners for each underlying feature. Home should compose existing products, not recreate their business logic.

PR #814 establishes only the universal Home structure and composition boundaries. It keeps the existing Home-owned Up Next action, What's New preview, Your HQ card, UFC event context, Ranking Spotlight, and Shane content in their canonical paths; Today's Challenges and Football HQ remain structural slots for their later named PRs. It does not implement the PR 8 priority engine or the completed PR 9–11 products.

PR #815 upgrades only the PR 7 Up Next slot. `src/features/home/upNextModel.ts` is a pure priority composer over existing provider/runtime state; it does not fetch or persist. The current canonical Home-accessible candidates are ranked urgent UFC Picks, unfinished UFC daily challenge, a direct received friend challenge, an unread What's New result/recap, then the next scheduled UFC event. Football Picks remains route-scoped to its existing `PicksProvider sport="football"` owner and is not duplicated onto Home in PR 8; Football Home state remains owned by PR 11.

PR #818 completes Today's Challenges + Your HQ without creating another Home data owner. Home consumes the existing UFC and Football Today's Challenge runtime/overview paths independently, and the single app-level Picks provider supplies both UFC and Football record summaries through the canonical Picks repository. Your HQ remains exactly Daily Streak, UFC Picks Record, and Football Picks Record.

PR #819 completes the UFC HQ block inside the existing Home composition owner. It keeps the live UFC event and user pick state on the existing app-level Picks context, reads the canonical Picks season standings already loaded there, preserves the calculated daily Ranking Spotlight and Shane's Contender Series components, and scopes UFC red presentation to the UFC HQ section rather than changing the neutral universal shell. No provider, repository, query path, route owner, persistence path, theme provider, or static ranking replacement is added.

PR #820 completes Football HQ without mounting the route-scoped Football Picks provider on Home. The existing app-level `PicksProvider includeFootballSummary` remains the one Home Picks owner and now exposes a read-only Football Home snapshot by calling the same canonical `PicksRepository` methods for the current Football slate, saved weekly selections, summary, and season history/standing. `src/features/home/FootballHq.tsx` composes that snapshot into This Week plus inline standing, and reuses the canonical published Football event header gallery and ordered CFB/NFL slate for the two weekly featured matchup treatments. The existing `WhatsNewPreview` / `WhatsNewProvider` remains the universal What's New owner. Football navy presentation is scoped locally to Football HQ; no Football Rankings, Intelligence, alternate route, provider, repository, or persistence owner is added.

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

Move universal shell branding toward **The HQ** using the locked neutral, symbol-first brand system.

### UFC-specific surfaces

`Octagon HQ` may remain where it functions as the UFC-specific identity rather than the umbrella app name.

### Cleanup

- Remove dead War Room navigation/runtime ownership only after dependents are verified.
- Remove obsolete universal-UFC assumptions exposed by the new shell.
- Do not remove working UFC feature identity just for naming consistency.
- Do not reintroduce the superseded H/Q letter logo or universal gold theme.

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

**Phase 0 is complete. PR 2 through PR 11 are complete through PR #820. PR 12 — Universal Profile is the next named rollout item.**

Current verified roadmap baseline:

- PR #802 — Universal THE HQ header — merge `49e3a2c07e1577679f4bef0886b16a96d0761c48`
- PR #803 — approved H/Q logo + Home Screen icon corrective follow-up — merge `6cbf76f1fdddc3f4ac08c50a0fef6f0eeab49421` — **logo direction now superseded**
- PR #804 — PR 3 bottom navigation — merge `688ef852452517b3bc4c8772b411dc7794b7ca6a`
- PR #805 — PR 3 visible label correction back to Rankings — merge `3ca3a83bfe8df15d711f3ebf6afd57fe1b28cbb1`
- PR #809 — approved neutral symbol corrective follow-up — merge `7a5376634af1c21fa2a34839564ce47e5125c2ce`
- PR #810 — PR 4 canonical shared UFC / Football sport context + persistence — merge `f607a93d04b25491df3f1b93f24861ba5f952c84`
- PR #811 — PR 5 Picks / Play sport-switching UI + sport/section context row — merge `616f19780026b74d499945aa479e8d08b8dec2f0`
- PR #812 — PR 6 neutral shell + contextual sport accent theme-token path — merge `6847615137e4cc5e71539380d904391b2870e495`
- PR #813 — Football navy contextual-accent correction — base `6847615137e4cc5e71539380d904391b2870e495`; merge `67843661eefcf9ffd1f7785189076c6961e4e6e4`.
- PR #814 — PR 7 universal Home foundation + locked section order — base `67843661eefcf9ffd1f7785189076c6961e4e6e4`; merge `763a5ea69873f1869681022b2ad3a12de8d13362`.
- PR #815 — PR 8 Up Next priority hero — base `763a5ea69873f1869681022b2ad3a12de8d13362`; merge `42f47089f77715b2898e669aa724b22df5f49edc`.
- PR #818 — PR 9 Today's Challenges + Your HQ — base `42f47089f77715b2898e669aa724b22df5f49edc`; merge `a2f812e5de4fbf222fe9580514dde2ba2af9bd73`.
- PR #819 — PR 10 UFC HQ Home block — base `a2f812e5de4fbf222fe9580514dde2ba2af9bd73`; merge `9afbfdfe11bddd20051ea6eaef5b996c30d310a4`.
- PR #820 — PR 11 Football HQ Home block + What's New integration — base `9afbfdfe11bddd20051ea6eaef5b996c30d310a4`; merge SHA to be backfilled on the next roadmap edit.

PR 4 remains the one canonical shared selected-sport owner and persistence path. PR 5 consumes that state in the existing AppShell and BottomNavigation owners. PR 6 consumes those existing owners for contextual accent scoping while preserving the single `main.tsx` style initialization path and removing favorite-team app-wide shell theming rather than introducing another theme owner. PR #813 only corrects Football's existing contextual token to the locked navy. PR #814 keeps `src/features/home/HomePage.tsx` as the single Home composition owner and adds only the six locked section boundaries plus neutral universal Home presentation; it adds no provider, repository, alternate query path, route owner, or theme initialization. PR #815 keeps that same Home owner, adds a pure Up Next priority model, reuses the existing providers/runtime state, and adds no second query/provider/repository/theme/route owner. PR #818 keeps the same Home owner, adds the two independent daily challenge summaries, and extends the single app-level Picks owner to expose the existing Football summary through its canonical repository path. PR #819 keeps the same Home owner, consumes the existing UFC event/Picks history and calculated ranking/Shane owners, and adds only UFC-local presentation plus focused tests. PR #820 keeps the same Home owner and the same app-level Picks/repository owner, extending only its existing optional Football Home read model so the completed Football HQ block consumes canonical current-slate, pick, summary, history, standing, and published event-art assets without a second provider/query owner. The canonical What's New surface remains unchanged.

The next named rollout item is **PR 12 — Universal Profile**. Resolve fresh `main` before starting it and preserve the existing profile/identity owners rather than reintroducing unused favorite sections or a second profile data path.

Do **not** restart card-by-card Home brainstorming unless Cody explicitly reopens it.

Do **not** re-debate:

- Home being universal
- Home card order
- bottom-nav order
- War Room nav removal
- shared sport state for Picks / Play
- Rankings and Intelligence being UFC-only for now
- neutral dark-first The HQ shell
- symbol-only The HQ mark and no letter logo
- UFC red / Football navy `#1F4E79` contextual accent system
- removal of required favorites onboarding
- universal profile / notifications
- inline standings rather than a standalone Home leaderboard

---

# 14. Decision Log

## September 1, 2026

### PR 11 Football HQ Home block + What's New integration

- Cody explicitly requested direct GitHub execution and merge of PR 11 in this chat; this is a PR 11 execution exception and the default Codex routing resumes with PR 12.
- PR #820 is the PR 11 implementation, based on `main` at `9afbfdfe11bddd20051ea6eaef5b996c30d310a4`.
- `src/features/home/HomePage.tsx` remains the one Home composition owner and preserves the six locked PR 9/10 Home boundaries and order.
- `src/app/providers.tsx` still mounts exactly one app-level `PicksProvider`. PR 11 extends that existing owner's already-enabled Football summary path into a read-only Home snapshot by using the same `PicksRepository.loadCurrentEvent`, `loadMyPicks`, `loadMySummary`, and `loadMyHistory` methods. No second Football provider, repository implementation, query client, persistence owner, or route owner is added.
- `src/features/home/FootballHq.tsx` owns only Football HQ presentation/composition: This Week pick completion/status, the current user's Football season standing inline with that context, and the two featured weekly matchup cards.
- The College and NFL Game of the Week cards reuse the canonical published Football Picks event header gallery and ordered weekly slate. The first published College/CFB game and first published NFL game supply matchup identity; the first two canonical event-gallery images supply the existing weekly feature art slots. If a slate or matchup is not published, the UI shows a real waiting/unavailable state instead of invented teams or static replacement data.
- The canonical `WhatsNewPreview` / `WhatsNewProvider` remains the universal What's New owner and location. PR 11 does not create a Football-specific What's New feed or duplicate provider.
- Football navy `#1F4E79` presentation is scoped to the Football HQ block; the universal Home shell remains neutral and selector-free.
- PR 11 adds no Football Rankings or Football Intelligence surface and does not begin PR 12 Universal Profile.
- PR 12 — Universal Profile is next.

### PR 10 UFC HQ Home block

- Cody explicitly requested direct GitHub execution and merge of PR 10 in that chat; this is a PR 10 execution exception.
- PR #819 is the PR 10 implementation, based on `main` at `a2f812e5de4fbf222fe9580514dde2ba2af9bd73` and merged as `9afbfdfe11bddd20051ea6eaef5b996c30d310a4`.
- `src/features/home/HomePage.tsx` remains the one Home composition owner; PR 10 completes only the existing UFC HQ slot and leaves Football HQ structural for PR 11.
- The existing app-level `PicksProvider` remains the one Picks runtime owner. UFC HQ reads the live event, selections, history, and canonical `seasonStandings` already loaded there; it adds no provider, repository, query path, or persistence path.
- UFC HQ now presents useful next-event context, pick completion/status, and the current user's UFC Picks season standing inline with that event context. No standalone universal leaderboard is added.
- The existing calculated daily `RankingSpotlightCard` and Shane's Contender Series preview remain persistent UFC HQ features; no static ranking array or replacement source is introduced.
- UFC red treatment is scoped to the UFC HQ section through its Home presentation stylesheet. The universal Home shell remains neutral and selector-free.
- Real loading/unavailable/not-published event states are shown instead of inventing fallback event data.
- PR 11 — Football HQ Home block + What's New integration follows PR 10; PR 10 does not begin Football HQ work.

### PR 9 Today's Challenges + Your HQ

- Cody explicitly requested direct GitHub execution and merge of PR 9 in that chat; this is a PR 9 execution exception.
- PR #818 is the PR 9 implementation, based on `main` at `42f47089f77715b2898e669aa724b22df5f49edc` and merged as `a2f812e5de4fbf222fe9580514dde2ba2af9bd73`.
- `src/features/home/HomePage.tsx` remains the one Home composition owner.
- Today's Challenges consumes the existing UFC and Football Today’s Challenge runtime/overview paths independently; it adds no challenge repository, persistence, or duplicate route owner.
- `src/app/providers.tsx` still mounts exactly one app-level `PicksProvider`. PR 9 extends that existing owner with the optional Football summary through the canonical `PicksRepository.loadMySummary` path rather than mounting a second provider/query on Home.
- Your HQ remains exactly three stats: Daily Streak, UFC Picks Record, and Football Picks Record.
- Universal Home remains neutral and selector-free; PR 9 does not begin PR 10 UFC HQ or PR 11 Football HQ work.

### PR 8 Up Next priority hero

- Cody explicitly requested direct GitHub execution and merge of PR 8 in that chat; this is a PR 8 execution exception.
- PR #815 is the PR 8 implementation, based on `main` at `763a5ea69873f1869681022b2ad3a12de8d13362` and merged as `42f47089f77715b2898e669aa724b22df5f49edc`.
- `src/features/home/HomePage.tsx` remains the one Home composition owner. PR 8 replaces the temporary PR 7 Up Next action with one neutral command-center hero and exactly one destination per resolved render.
- `src/features/home/upNextModel.ts` owns priority composition only. It consumes canonical state passed from existing owners and performs no query, persistence, repository creation, provider initialization, or routing ownership.
- Locked current priority is urgent UFC Picks → unfinished UFC daily challenge → direct received friend challenge → unread result/recap from What's New → next scheduled UFC event.
- Existing challenge title/route construction is reused through `buildDirectChallengeAction`; it is not cloned in the Up Next model.
- Football Picks remains owned by the existing route-scoped `PicksProvider sport="football"`. PR 8 deliberately does not mount a second Football Picks provider/query on Home; PR 11 remains responsible for canonical Football Home integration.
- Universal Home remains neutral; the hero uses the existing neutral theme-token path and does not paint Home UFC red or Football navy.
- PR 9 — Today's Challenges + Your HQ follows PR 8. PR 8 does not implement PR 9–11 product blocks early.

### PR 7 universal Home foundation

- Cody explicitly requested direct GitHub execution and merge of PR 7 in that chat; this is a PR 7 execution exception. PR 8 was separately authorized for direct GitHub execution.
- PR #814 is the PR 7 implementation, based on `main` at `67843661eefcf9ffd1f7785189076c6961e4e6e4`.
- `src/features/home/HomePage.tsx` remains the one Home composition owner and now exposes the six locked boundaries in exact order: Up Next, Today's Challenges, What's New, Your HQ, UFC HQ, Football HQ.
- Existing Home content is composed through its current owners. PR 7 does not add a second Picks/challenge/What's New/ranking/profile data path.
- Today's Challenges and Football HQ are intentionally structural slots in PR 7; their completed product logic remains owned by PR 9 and PR 11 respectively.
- PR 7 does not implement the PR 8 cross-product Up Next priority engine, PR 9 completed Today's Challenges / Your HQ, PR 10 completed UFC HQ block, or PR 11 completed Football HQ / What's New integration.
- Universal Home remains neutral for persisted UFC or Football selection, with no sport selector/context row. UFC content remains red and Football's contextual token remains navy `#1F4E79`.

### Football navy contextual-accent correction

- After seeing PR #812 live, Cody explicitly reopened only the Football color portion of the locked visual identity.
- The universal The HQ shell remains neutral and dark-first.
- UFC remains red.
- Football now has a permanent sport-level navy contextual accent: **`#1F4E79`**.
- Team and matchup colors remain valid inside content where the team/matchup is the actual context, but favorite-team app-wide theming remains rejected.
- PR #813 is the narrow corrective follow-up, based on the PR #812 merge `6847615137e4cc5e71539380d904391b2870e495`; it changes the existing token path rather than adding another theme/state/provider owner.
- PR 7 follows this correction; the correction itself did not begin Universal Home implementation.

### PR 6 neutral shell and contextual sport accent path

- Cody explicitly requested direct GitHub execution and merge of PR 6 in that chat; this is a PR 6 execution exception and the default Codex routing resumed until the separately authorized PR 7 exception.
- PR #812 is the PR 6 implementation, based on `main` at the PR #811 merge `616f19780026b74d499945aa479e8d08b8dec2f0` and merged as `6847615137e4cc5e71539380d904391b2870e495`.
- `src/app/SportProvider.tsx` remains the one selected-sport state and persistence owner; PR 6 adds no provider, sport state, route-derived persistence, or localStorage path.
- `src/app/AppShell.tsx` remains the one shared shell owner and now applies the reusable `neutral | ufc | football` contextual theme scope through the existing style-token path.
- `src/styles/tokens.css` and the existing `src/main.tsx` import chain remain the theme/style initialization owner; no ThemeProvider, second stylesheet entrypoint, or duplicate initialization is introduced.
- Universal header chrome and Home use the neutral HQ foundation; UFC Picks / Play and the UFC-only Rankings / Intelligence context use UFC red; Football Picks / Play consume the same contextual path, with the Football token corrected to navy `#1F4E79` in PR #813.
- Favorite-team preferences no longer apply Cowboys/Longhorns classes to the app-wide shell or bottom navigation. Team colors remain available inside existing Football feature/content owners where the team is the actual context.
- PR 6 deliberately does not begin PR 7 Home composition, later profile/notifications/onboarding work, broad brand cleanup, or War Room deletion.

### PR 5 sport-switching UI and context row

- Cody explicitly requested direct GitHub execution and merge of PR 5 in that chat; this was a PR 5 execution exception. PR 6 was separately authorized for direct GitHub execution.
- PR #811 is the PR 5 implementation, based on `main` at `f607a93d04b25491df3f1b93f24861ba5f952c84` and merged as `616f19780026b74d499945aa479e8d08b8dec2f0`.
- `src/app/SportProvider.tsx` remains the only selected-sport state and persistence owner; PR 5 consumes it rather than creating another provider, state value, localStorage path, or route-derived competing selection.
- The existing AppShell owns the sport/section context row. Picks and Play expose UFC / Football switching; Rankings and Intelligence remain UFC-only; Home has no sport-context row.
- Bottom-navigation Picks and Play destinations follow the globally selected sport, while the canonical `/rankings` destination remains unchanged.
- Existing Play double-tap behavior is preserved and updates the same shared sport selection when it crosses between UFC and Football.
- PR 5 deliberately avoids PR 6 theme-token migration and all later Home, profile, notifications, onboarding, broad brand, and War Room cleanup scope.

### PR 4 shared sport-context owner

- Cody explicitly authorized direct ChatGPT execution of PR 4 after repeated Codex Cloud tasks could not access the authenticated repository; this was the first explicit runtime execution exception.
- PR #810 is the PR 4 implementation, based on `main` at `7a5376634af1c21fa2a34839564ce47e5125c2ce` and merged as `f607a93d04b25491df3f1b93f24861ba5f952c84`.
- `src/app/SportProvider.tsx` is the canonical universal selected-sport owner.
- `src/app/providers.tsx` mounts it exactly once.
- Supported shared sport state is `ufc | football`.
- Between-session persistence uses the single local key `the-hq:selected-sport`.
- PR 4 deliberately added no selector/context-row UI, route rewrite, theme-token work, or other PR 5+ presentation behavior.

### Brand direction superseded and re-locked

Cody explicitly reopened the umbrella brand visual identity after seeing the black-and-gold H/Q logo in-app.

New locked decisions:

- The HQ umbrella logo is **symbol-only**; no letters inside the mark.
- Current approved direction: **white app tile + black abstract hub / target-style symbol**.
- Header lockup uses **symbol + THE HQ wordmark**.
- Home Screen/install icon, favicon/app icon, and header brand mark should derive from the same canonical symbol asset.
- The black-and-gold interlocked H/Q logo is superseded.
- Gold/yellow is retired from the universal The HQ shell.
- The universal shell is dark-first and neutral: near-black, charcoal/graphite, white, gray, restrained silver.
- UFC supplies red contextual accent.
- Football supplies navy `#1F4E79` as its sport-level contextual accent; team/matchup colors remain content-specific.
- Favorite-team-based automatic theming remains rejected.
- PR 6 remains a **neutral universal shell + contextual sport accent** theme-token architecture; the Football branch of that path is navy rather than favorite-team-driven.

### Rollout progress through PR 3

- PR #802 completed the universal header shell; merge `49e3a2c07e1577679f4bef0886b16a96d0761c48`.
- PR #803 corrected the header/Home Screen icon to the then-approved H/Q asset; merge `6cbf76f1fdddc3f4ac08c50a0fef6f0eeab49421`; that asset is now superseded by the new symbol-first decision.
- PR #804 completed the four-tab bottom navigation and removed the War Room nav entry while preserving War Room runtime; merge `688ef852452517b3bc4c8772b411dc7794b7ca6a`.
- PR #805 corrected the visible fourth-tab label back to Rankings without changing the canonical `/rankings` route; merge `3ca3a83bfe8df15d711f3ebf6afd57fe1b28cbb1`.
- PR #809 completed the approved neutral symbol corrective follow-up; merge `7a5376634af1c21fa2a34839564ce47e5125c2ce`.

## August 31, 2026

Locked the first universal The HQ architecture after Football Picks reached rollout readiness.

Key decisions:

- Universal Home
- Four-tab nav: Home / Picks / Play / Rankings
- War Room removed from bottom navigation
- Shared UFC / Football selector for Picks and Play
- Rankings UFC-only initially
- Intelligence UFC-only initially
- Persistent THE HQ header with Notifications, Intelligence, and Profile
- No favorite-based theme personalization
- No required favorite onboarding
- Home stack locked as Up Next / Today's Challenges / What's New / Your HQ / UFC HQ / Football HQ
- Ranking Spotlight and Shane's Contender Series preserved inside UFC HQ
- College and NFL Game of the Week preserved inside Football HQ
- Standings stay inline with their relevant products
- Profile and Notifications become universal
- Tool routing locked: PR 1 may use ChatGPT GitHub tools; named runtime implementation PRs 2–14 require fresh Codex Cloud PRs from current `main`, followed by exact-head review here unless Cody explicitly authorizes a direct GitHub execution exception

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