# Octagon HQ Auction Game

## Status and authority

This file is the canonical source of truth for the Octagon HQ asynchronous Auction game.

Use it to recover the product contract, architecture boundaries, security requirements, rarity direction, implementation sequence, and current handoff state in any future working session. Chat history, task descriptions, pull-request summaries, and generated implementation notes are secondary. When they conflict with this file, update this file through a focused reviewed pull request before changing behavior.

Repository: `codyking0602/Octagon-HQ`

Production branch: `main`

Production app: `https://octagon.hq-app.workers.dev`

Working standard:

> One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.

GitHub Actions is the only deployment owner. A merged change is not automatically considered live. Live claims require the production deployment marker to match the intended commit.

## Current implementation state

| Stage | Status | Pull request | Merge SHA |
| --- | --- | --- | --- |
| Honest V2 validation baseline | Complete | #202 | `2ce76b4172bdacf6e26a5920688388446fbb245e` |
| Auction PR 1: typed public contract and route shell | Complete | #203 | `fd294e00165b56db3a63d477622e93ff4e51f01f` |
| Canonical Auction implementation record | Complete | #204 | `4048e0e11e40ad628ade7437c8e028b18dcdf987` |
| Auction PR 2: backend foundation | Complete | #205 / #211 release proof | `b5f9d4fd6bf27f52a091fd4f15352ebb331a969d` |
| Auction PR 3: playable server engine | Complete | #212 / #213 release proof | `0e9377ee6557a33b4db5d1225761901764707537` |
| Auction PR 4: complete gameplay UI | Complete | #215 | `515e9293807a8a689d31ebca47ea59148bfeb918` |
| Auction PR 5: real UFC content and private grading | Complete | #274 | `3fdac6e7e526d92e437789c2bed128fa821914ee` |

PR #205 established the private lifecycle and PR #211 proved its production migrations. PR #212 added the authenticated transactional preparation, send, sealed-bid resolution, forced-assignment, and neutral completion boundary; PR #213 repaired and proved its production release. PR #215 added and released the complete gameplay UI. PR #274 added the versioned real UFC-only catalog, balanced private generation weights, and the fixed private grader. Its exact reviewed head `bb78d8a5db2bac51897bbfe7c60bfdd943376353` passed typecheck, all 907 tests, the production build, fresh-database Auction SQL, statistical simulations, and the complete backend verifier. The trusted backend workflow applied and verified migrations `202609020001` through `202609020008`. PR 6 remains the notification-completion and final release-proof stage.

PR #203 established one Play game identity, the sixteen public mode definitions, one canonical `/play/auction` route, and a nonfunctional preview shell. It did not add persistence, bidding, prepared challenges, deck generation, grading, or notifications.

## Product definition

Auction is a two-player, asynchronous, sealed-bid UFC collection game.

The challenger chooses the exact Auction mode. The recipient accepts or declines that exact challenge; the recipient does not substitute another mode.

Each round presents one shared item. Both players privately submit whole-dollar bids. Once both bids are locked, the server reveals the bids, assigns the item, updates bankrolls and collections, and reveals the next current item. Players may leave between actions and return through notifications or Challenge Center deep links.

The game must feel like a polished UFC/2K-style product: mobile-first, clean, intuitive, fast to understand, and suitable for group-chat competition. It must not feel like a spreadsheet.

## Canonical opening flow: prepared challenge with no reroll

The first-round tie-priority player is visible before bidding. To support that rule without leaking or rerolling private content, the challenger uses a server-owned prepared Auction flow.

1. The challenger selects the exact mode and opponent.
2. Supabase creates one private prepared Auction.
3. The server fixes the content, rarity, and grading versions for that game.
4. The server privately generates and stores the complete deck.
5. The server randomly establishes the initial visible tie-priority player.
6. The challenger receives only the first revealed item, current tie priority, and other safe public state.
7. Refreshing, leaving, or reopening resumes the same prepared Auction. It must not generate a new deck or permit repeated rerolls for stronger items.
8. The challenger submits the first sealed bid and, for Build the Ultimate Fighter, the intended category.
9. The server atomically locks that bid, creates or links the canonical Play challenge, and publishes the recipient notification.
10. The recipient sees the exact mode, first item, and visible tie priority, but never the challenger’s pending bid or hidden category choice.
11. The recipient accepts the Auction by submitting the recipient’s first sealed bid and applicable category intent.
12. The server resolves the first round transactionally and the normal asynchronous round loop begins.

Prepared-state authorization is lifecycle-aware:

- Before send, only the challenger may read the safe prepared projection.
- The proposed recipient must not be able to read or discover an unsent prepared Auction.
- An abandoned prepared Auction is no longer client-readable.
- After send, both canonical participants may read the safe projection.

Explicitly abandoning an unsent prepared Auction removes it without notifying the proposed opponent. A prepared Auction is private server state, not a second challenge system.

## Round rules

- One shared item is shown per round.
- Only the current item is visible. The complete deck and all future items remain server-private.
- Each player submits one whole-dollar sealed bid.
- Minimum bid is `$1`.
- There is no `$0` bid and no pass action.
- A submitted bid is locked and cannot be edited.
- The higher bidder pays the submitted amount and receives the item.
- The lower bidder pays nothing.
- Once both bids lock, both players may see the resolved bids, winner, updated bankrolls, awarded collections, and next action state.
- Ultimate Fighter category intent remains private until the round resolves.
- Already-awarded collections are visible to both players. This includes the opponent’s visible Ultimate Fighter slot placements.
- The server is authoritative for bids, assignments, bankroll arithmetic, round advancement, tie priority, forced assignments, completion, and results.

## Bankrolls, collection sizes, and legal bids

### Build the Ultimate Fighter

- Ten total rounds.
- Five required selections per player.
- `$50` starting bankroll per player.
- Category placement applies.

### Every other mode

- Eight total rounds.
- Four required selections per player.
- `$40` starting bankroll per player.
- No category placement.

There is no per-item `$10` cap. A player may spend more than `$10` on one item.

Every player must retain enough bankroll to purchase every still-required collection slot at the `$1` minimum. The server calculates the maximum legal bid as:

```text
maximum legal bid = current bankroll - required slots remaining after a potential win
```

Examples:

- Opening a four-selection Auction with `$40`: a win would leave three required slots, so the maximum opening bid is `$37`.
- Opening Build the Ultimate Fighter with `$50`: a win would leave four required slots, so the maximum opening bid is `$46`.
- If a potential win fills the player’s final required slot, the player may bid the entire remaining bankroll.

Client-side messaging may preview this maximum, but only the server validates and enforces it.

Bankrolls may never exceed their mode’s starting amount and may never increase during a game. Collection counts, current round, and revision may never move backward.

## Forced assignment

Once one player fills every required collection slot, normal bidding stops.

Each remaining item is revealed sequentially and automatically awarded to the other player for `$1` until that player’s collection is also complete. The reserve rule guarantees affordability.

Forced assignment is server-owned and must preserve the current-item-only presentation. The remaining hidden deck is not exposed all at once.

## Tie bids

- The initial tie-priority player is assigned randomly when the prepared Auction is created.
- The current tie-priority player is visible to both players before bidding.
- If bids tie, the current tie-priority player wins the item and pays the tied bid.
- After a tied round, tie priority flips to the other player.
- Tie priority does not flip after a non-tied round.

## Build the Ultimate Fighter

One UFC fighter is auctioned per round. When submitting a bid, the player privately selects the intended category.

The five required categories are:

1. Striking
2. Grappling
3. Frame
4. Power
5. Heart

Heart includes durability, recovery, composure, adversity, pace, and willingness to continue.

If the bidder wins, the fighter fills the selected category. If the bidder loses, no placement occurs. Category intent remains private until resolution. Once awarded, the category placement becomes visible to the opponent and is part of the strategy.

## Challenge lifecycle

The canonical lifecycle graph is:

```text
prepared -> sent -> active -> completed
    |         |        |
    v         v        v
abandoned  declined  cancelled
```

No reverse or skipped transition is allowed. Participants, selected mode, and fixed version snapshots never change after creation. Once linked, the canonical challenge identity cannot be replaced or removed. Completed, cancelled, abandoned, and declined rows are terminal and immutable; idempotent commands must return without rewriting terminal data.

### Decline

Before acceptance, the recipient may decline through the existing challenge lifecycle. The linked Auction becomes terminal with no winner or score.

### Cancellation

There are no gameplay deadlines, bid timers, automatic forfeits, or expiration-based winners.

Either participant may cancel an unfinished accepted Auction from the existing Challenge Center or exact Auction destination.

Cancellation requires a confirmation dialog. It must:

- End the game for both participants.
- Remove it from active challenge presentation.
- Notify the opponent once.
- Produce no winner, loss, grade, score, or forfeit.
- Make pending bids and hidden state unreachable to clients, including pending-bid presence.
- Be terminal and idempotent.
- Record a non-null cancelling participant and timestamp for server audit.

Do not overload ordinary per-user hiding or pre-acceptance decline as active-game cancellation.

### Rematch

A rematch begins a completely new challenge flow.

- Return to Auction mode selection.
- The challenger chooses the exact mode again.
- Create a new prepared Auction.
- Generate a new deck and new fixed version snapshot.
- Do not clone the prior mode automatically.
- Do not reuse the prior game row or deck.

## Final scoring and results

The final result shows only:

- Player one’s overall score from `0` through `100`.
- Player two’s overall score from `0` through `100`.
- The winner, or an actual tie when the numeric scores are equal.

Unequal final scores require the higher-scoring participant as a non-null winner. Equal scores require a null winner and represent a true tie.

There are no letter grades.

Do not expose or display:

- Individual item values or scores.
- Category grades.
- Item grades.
- Best purchase.
- Biggest overpay.
- Missed opportunity.
- Weighting formulas.
- Intermediate grading values.
- Written explanations for why a player won.

Unspent bankroll has no grading effect and is not a tiebreaker.

The authoritative grader is server-private. Frontend bundles and client-readable payloads must not contain the grading logic, weights, hidden catalog scores, or intermediate values.

## Selectable Auction catalog

Auction is one Play game with exactly sixteen selectable modes beneath it.

| ID | Display name | Family |
| --- | --- | --- |
| `ultimate-fighter` | Build the Ultimate Fighter | Fighter Auction |
| `jon-jones-performances` | Best Jon Jones Performances | Career Performance Auction |
| `conor-mcgregor-performances` | Best Conor McGregor Performances | Career Performance Auction |
| `charles-oliveira-performances` | Best Charles Oliveira Performances | Career Performance Auction |
| `fighter-performances` | Best Fighter Performances | Historical Collection Auction |
| `strikers` | Best Strikers | Fighter Auction |
| `grapplers` | Best Grapplers | Fighter Auction |
| `knockout-artists` | Best Knockout Artists | Fighter Auction |
| `greatest-ufc-card` | Build the Greatest UFC Card | Card-Building Auction |
| `championship-performances` | Best Championship Performances | Historical Collection Auction |
| `finishes` | Best Finishes | Historical Collection Auction |
| `dominant-performances` | Most Dominant Performances | Historical Collection Auction |
| `wars` | Best Wars | Historical Collection Auction |
| `rivalries` | Best Rivalries | Historical Collection Auction |
| `iconic-moments` | Most Iconic UFC Moments | Historical Collection Auction |
| `nicknames` | Best Nicknames | Nickname Auction |

Only the Jon Jones, Conor McGregor, and Charles Oliveira modes are career-performance Auctions. Best Fighter Performances is a broad historical collection.

### Excluded from the initial catalog

- Best Chins
- Best Rounds Ever
- Best Upsets
- GOAT Résumé
- Build a Division
- Best UFC Debuts
- Greatest Non-Title Fights
- Best Short-Notice Performances
- Best Championship Reigns

These concepts must not appear in the initial selectable catalog unless the product contract is explicitly changed later.

## UFC-only content rule

The Auction product is UFC-only unless Cody explicitly changes the product scope.

Do not include Pride, Strikeforce, WEC, ONE, Bellator, or regional accomplishments as Auction items or grading evidence in the initial product. Historical fights, performances, rivalries, moments, and career selections must be UFC events or UFC achievements.

## Rarity and deck direction

Rarity is a server-private, versioned, testable content concern. It must not be scattered through UI conditionals or bundled as client-readable weights.

Exact pools, scores, weights, and confidence bands remain tunable through simulations. The following direction is locked.

### Build the Ultimate Fighter: balanced model

Use a broad UFC-only weighted fighter pool. Do not permanently hard-code the pool to a temporary fighter count.

- Jon Jones is the mythic benchmark.
- Target Jon Jones appearance rate: approximately `1%–2%` of games.
- Jon must not be guaranteed and must not become a routine excitement mechanism.
- Crown-jewel specialists and versatile legends should be meaningfully rare but appear more often than Jon.
- Most decks should contain strong, useful, imperfect fighters rather than obvious all-time cheat codes.
- Wildcards and specialists must have defensible strategic uses rather than existing as intentionally bad cards.

Current candidate crown-jewel examples include:

- Anderson Silva for Striking.
- Khabib Nurmagomedov for Grappling.
- Francis Ngannou for Power.
- Max Holloway for Heart.
- Georges St-Pierre and Demetrious Johnson as unusually versatile elite options.

Those names guide pool design but do not replace the future reviewed catalog and grading data.

A normal ten-item deck should generally trend toward:

- Zero Jon Jones appearances in almost every game.
- Zero or one crown-jewel fighter.
- One or two other elite fighters.
- Five or six strong core fighters.
- Two or three narrower specialists or wildcards.

Current simulation safeguards should test against extreme decks, including a target maximum of two Mythic/Crown fighters combined and four total high-end fighters. These are generation safeguards to validate, not UI rules.

### Broad fighter-category Auctions

Best Strikers, Best Grapplers, and Best Knockout Artists use true category aces.

- A true category ace may appear in approximately `25%` of games individually.
- A mode should have only a small number of genuine aces, generally three or four.
- A normal eight-item deck may contain zero, one, or two aces.
- Do not allow more than two category aces in one eight-item deck.
- Aces should create recurring bidding wars without making every deck automatic or star-saturated.

Initial examples:

- Strikers: Anderson Silva, Israel Adesanya, José Aldo, with Alex Pereira on the ace/elite boundary pending final catalog review.
- Grapplers: Khabib Nurmagomedov, Demian Maia, Charles Oliveira, and Islam Makhachev.
- Knockout Artists: Francis Ngannou, Anderson Silva, Chuck Liddell, and Anthony Johnson, with Alex Pereira again subject to final catalog review.

### Large historical pools

Best Fighter Performances, Best Championship Performances, Best Finishes, Most Dominant Performances, Best Wars, Best Rivalries, Most Iconic UFC Moments, and Build the Greatest UFC Card use much larger pools.

Current target direction:

- Approximately `60%–70%` of games contain at least one iconic headliner.
- Usually no more than two headliners appear.
- A specific iconic item may appear around `8%–15%`, depending on final pool size.
- No headliner is guaranteed.

### Career-performance pools

Jon Jones, Conor McGregor, and Charles Oliveira career Auctions naturally use smaller pools.

- Signature performances may appear approximately `20%–30%` of games individually.
- These modes are pure four-item collections.
- Do not impose artificial collection labels such as Best Win, Toughest Test, or Most Iconic.

### Best Nicknames

Best Nicknames should use a flatter distribution emphasizing variety, personality, cult favorites, and replayability rather than aggressively protecting only a few consensus best nicknames.

### Shared deck requirements

- No duplicate item within one game.
- The complete deck is generated and fixed server-side.
- The client receives only the current revealed item.
- Random-generation state must not allow the browser to reconstruct future items.
- Rematches and new challenges receive new decks.
- Simulations must measure superstar frequency, specialist usefulness, deck strength, repetition, weak-deck frequency, stacked-deck frequency, and rematch variety before rarity is considered final.

## Versioning

Each prepared Auction is pinned at creation to its exact:

- Content/catalog version.
- Rarity/generation version.
- Grading version.
- Full private deck.
- Initial tie-priority player.

Participants, mode, canonical challenge linkage after send, and version snapshots are immutable. Later content or grading changes apply only to newly prepared games. Active or completed games never change midstream.

The canonical private owner is `private.auction_catalog_versions` plus `private.auction_catalog`, extended append-only by `supabase/migrations/202609020001_auction_real_ufc_catalog_private_grading.sql`. The active snapshots are `ufc-auction-2026-08-v1`, `balanced-rarity-2026-08-v1`, and `ufc-private-grader-2026-08-v1`. `private.generate_auction_deck` remains the only generator and `private.grade_auction` is the only authoritative grader. Catalog grading inputs, rarity bands, and generation weights have no browser grants; prepared games retain their pinned versions and fixed deck.

Version metadata and hidden scores remain backend-owned. Public version identifiers may be exposed only when they reveal no private content and have a concrete product or support purpose.

## Canonical existing owners

Preserve these existing ownership paths.

| Concern | Canonical owner |
| --- | --- |
| Play game identity and metadata | `src/features/play/playRegistry.ts` |
| Public Auction mode contract | `src/features/play/auctionContract.ts` |
| SPA route tree | `src/app/router.tsx` |
| Challenge game-to-route mapping | `src/features/challenges/challengeRuntime.ts` |
| Play Hub launch presentation | `src/features/play/PlayPage.tsx` |
| Auction route shell and future board entry | `src/features/play/AuctionPage.tsx` |
| Challenge orchestration | `src/features/challenges/ChallengeProvider.tsx` |
| Challenge list and lifecycle UI | `src/features/challenges/ChallengeCenter.tsx` |
| Generic challenge browser access | `src/features/challenges/challengeRepository.ts` |
| Shared Supabase browser client | `src/lib/supabase.ts` |
| Database ownership | Append-only files under `supabase/migrations/` |
| Database tests | `supabase/tests/` and migration contract tests under `src/app/` |
| Notification publication | Existing private database notification publisher |
| Browser notification feed | Existing notification repository/provider |
| Push delivery | `supabase/functions/deliver-notification-push/` |
| Frontend delivery and rich previews | Existing Cloudflare Worker |
| Frontend deployment | `.github/workflows/deploy-cloudflare.yml` |
| Backend deployment | `.github/workflows/deploy-supabase.yml` |
| General validation | Existing Validate V2 workflow |
| Backend live verification | Existing Verify Supabase Backend workflow |

Do not create a second registry, router, Challenge Center, challenge provider, Supabase client, notification provider, push service, scheduler, Cloudflare deployment path, or Supabase deployment path.

## Minimum justified new owners

The Auction requires a limited set of new owners because its hidden state cannot safely fit the existing frontend-owned game engines or generic challenge JSON.

1. A focused frontend Auction repository using the shared Supabase client and Zod-validated safe payloads.
2. Server-private Auction lifecycle, deck, bid, category-intent, collection, bankroll, version, and audit storage linked to the canonical challenge identity.
3. Transactional authenticated SQL RPCs for prepared creation, send-with-first-bid, recipient accept-with-bid, later bids, round resolution, safe reads, cancellation, and required state transitions.
4. A private versioned catalog and rarity owner.
5. A server-authoritative deck generator.
6. A private grader implemented in Supabase SQL or one existing-workflow-deployed Edge Function only when SQL is genuinely unsuitable.
7. A purpose-built safe Auction projection.

These additions must extend the canonical challenge and notification systems rather than compete with them.

## Privacy and security boundary

### Safe client-readable state

The safe projection may include only information needed to render the authorized current state, such as:

- Challenge or Auction identifier.
- Safe participant profile fields.
- Selected mode.
- Current round number.
- Current revealed item.
- Visible tie-priority player.
- Awarded collection items and resolved Ultimate Fighter placements.
- Current bankrolls and collection progress.
- Whether the current user has submitted a bid, as a boolean, only while that bid state is currently actionable and authorized.
- Whose action is required.
- Prepared, sent, active, forced-assignment, completed, declined, abandoned, or cancelled presentation state as applicable.
- Final overall scores and winner or tie after completion.

### State that must never be client-readable before authorized reveal

- Either player’s pending bid.
- The challenger’s first sealed bid before the recipient responds.
- A pending Ultimate Fighter category choice.
- Future deck entries.
- Random seeds or generation state capable of reconstructing the future deck.
- Private catalog weights.
- Hidden item values.
- Grading weights, features, intermediate scores, explanations, or item grades.
- Service-role credentials or grader secrets.
- The existence or state of an unsent prepared Auction to the proposed recipient.
- Pending-bid presence after cancellation, decline, abandonment, or completion.

### Enforcement requirements

- Revoke direct browser access to Auction-private tables.
- Use authenticated server commands based on `auth.uid()`.
- Verify that the caller is authorized for the current lifecycle state, not merely named in the row.
- Do not trust client-declared winners, assignments, bankrolls, rounds, scores, or next items.
- Validate integer whole-dollar bids and the `$1` minimum server-side.
- Validate the reserve-based maximum bid server-side.
- Compare bids, apply tie priority, assign the item, update bankrolls, reveal the next item, and advance the revision in one transaction.
- Require an expected game or round revision to reject stale-tab races.
- Make appropriate commands idempotent or explicitly reject duplicates.
- Keep notifications free of bids, hidden categories, future items, and grading details.
- Test raw RPC payloads using both participants and an unrelated authenticated user.
- Test prepared-state confidentiality separately from sent and active participant access.
- Test PostgreSQL NULL behavior for cancellation audits, winners, and every security-sensitive check constraint.
- Test every allowed lifecycle edge, forbidden reverse/skip edge, terminal immutability, and canonical challenge-link immutability.

Do not place the private deck, bids, category intent, or grading data in generic challenge `setup`, `creator_result`, `responder_result`, route parameters, notification payloads, local storage, or browser-readable tables.

Frontend hiding, minification, TypeScript types, and browser-side encryption are not security boundaries.

## Conceptual data flow

```text
Challenger selects opponent and exact mode
  -> authenticated prepare command
  -> server fixes versions, private deck, first item, and initial tie priority
  -> challenger-only safe prepared projection returns

Challenger locks first bid and optional category
  -> authenticated atomic send command
  -> server stores private bid and creates/links canonical challenge
  -> existing notification publisher notifies recipient

Recipient opens exact /play/auction challenge destination
  -> generic challenge projection plus safe Auction projection
  -> recipient submits first bid to accept
  -> server resolves round transactionally

Players submit later bids asynchronously
  -> safe projections refresh current item, bankrolls, collections, and action owner
  -> forced $1 assignment begins after one collection fills

Game completes
  -> private grader reads fixed private collections and grading version
  -> only final 0-100 scores and winner/tie enter the safe result projection
  -> existing Challenge Center and result owners present the result
```

## Explicit forbidden duplication and shortcuts

Do not add:

- Sixteen separate Play game IDs.
- Sixteen separate SPA routes.
- A top-level `/auction` route.
- An Auction-only challenge table disconnected from `play_challenges`.
- A second Challenge Provider or Auction Center.
- A second Supabase client, raw REST fallback, or service-role browser client.
- Local-storage fallback for prepared games, bids, bankrolls, or active state.
- Client-authoritative deck generation.
- A browser-visible seed that reconstructs future items.
- Hidden data in generic challenge JSON.
- Route-opening as acceptance; acceptance requires the recipient’s bid.
- Dismissal as active-game cancellation.
- Frontend grading logic.
- Direct push calls from Auction UI.
- A forfeiture timer, gameplay-expiration cron, or automatic loss.
- A second Cloudflare Worker deployment integration.
- A new deployment workflow when the existing canonical workflow can be extended.
- A second Supabase project or alternate backend deployment script.
- A rematch that reuses the prior game row, mode automatically, or deck.
- A second backend-foundation PR competing with PR #205.

## Implementation sequence

The implementation now uses six feature PRs total: the completed public-contract PR plus five remaining delivery PRs. The prior PR 3 through PR 12 micro-stage plan was retired because it split one playable product into too many review and handoff boundaries.

Each PR still follows one owner, one coherent purpose, focused tests, and exact-head verification. Split a PR only when its diff becomes genuinely unreviewable or crosses an ownership boundary—not merely to preserve an old numbering plan.

### PR 1 — Public contract and route shell — complete in #203

- One Auction Play identity.
- Sixteen typed modes.
- Public structural rules.
- One canonical `/play/auction` route.
- Nonfunctional preview shell.

### PR 2 — Backend foundation — current #205

- Final server-private lifecycle schema linked to the canonical challenge identity.
- Lifecycle-aware authorization: prepared challenger-only, abandoned unreadable, sent/active/terminal participant access as authorized.
- Explicit forward-only lifecycle graph with declined, cancelled, abandoned, and completed terminal states.
- Immutable participants, mode, version snapshots, canonical challenge link, and terminal records.
- Private foundations for versions, round/revision, bankrolls, collections, tie priority, deck positions, bids, category intent, cancellation audit, and final result fields.
- Direct browser access revoked.
- Narrow safe read projection that omits pending bids, future deck items, hidden category intent, grading internals, and terminal pending-bid presence.
- Adversarial SQL and source-contract tests for both participants, an unrelated user, PostgreSQL NULL behavior, lifecycle edges, terminal immutability, and challenge-link immutability.
- No real catalog content, deck generation, prepare/send/bid commands, grading, notifications, or gameplay UI.
- This is the final backend-foundation PR. Do not create a repair PR after it; repair #205 until exact-head green.

### PR 3 — Playable server engine

- Private catalog/content/rarity/grading version framework.
- Server-private deck generator with deterministic injectable randomness for tests.
- Prepared creation with fixed deck, first revealed item, initial tie priority, and no reroll.
- Atomic send with challenger’s first sealed bid and canonical challenge creation/linkage.
- Recipient acceptance only through the recipient’s first bid.
- Later bid command and transactional round resolution.
- Whole-dollar minimum, reserve maximum, participant membership, stale-revision, duplicate/idempotency, tie-priority, bankroll, collection, and round enforcement.
- Sequential `$1` forced assignments.
- Basic notifications required by these state transitions through the existing publisher.
- Statistical simulation contracts for Jon, category aces, duplicate prevention, deck strength, and extreme decks.

### PR 4 — Complete gameplay UI

- One focused frontend Auction repository using the shared Supabase client and Zod-safe payloads.
- Shared mobile Auction board for current item, bid entry, bankrolls, collections, tie priority, action state, and resolved-round reveal.
- Exact refresh, reopening, and Challenge Center destination restoration.
- Build the Ultimate Fighter private category selection and visible awarded placements.
- Preserve pre-acceptance decline.
- Confirmed accepted-game cancellation with no winner/loss semantics.
- Challenge Center states and actions.
- Rematch returns to mode choice and creates a new prepared game.
- No hidden-state requests, fake persistence, duplicate provider, or alternate route owner.

### PR 5 — Real content and grading

- Real UFC-only content for all sixteen modes.
- Balanced Ultimate Fighter pool and five-category data.
- Jon Jones mythic target and specialist/elite/core/wildcard simulation checks.
- Broad striker, grappler, knockout-artist, and nickname pools.
- Historical, card-building, rivalry, moment, finish, dominance, championship, and fighter-performance pools.
- Jon Jones, Conor McGregor, and Charles Oliveira career-performance pools.
- Private fixed-version grader.
- Final overall `0–100` scores only, with numeric ties.
- Existing result presentation integration.
- Artifact tests proving no grading internals, item values, private rarity data, or intermediate scores reach the browser.

### PR 6 — Notifications and release proof

- Complete all Auction notification producers through the existing publisher.
- Reuse existing push delivery.
- Verify exact deep links and reopening for prepared, sent, active, action-needed, declined, cancelled, completed, and rematch flows.
- Add safe rich previews only.
- Complete end-to-end privacy proof with two real profiles and an unrelated user.
- Extend existing backend verification and frontend artifact privacy checks without creating a second deployment or verification owner.
- Prove exact deployed frontend SHA and deployed backend migrations/functions before any live claim.

## Verification standard for every Auction PR

Before merge:

1. Resolve current `main` before branching.
2. Branch from that exact `main`.
3. Preserve the canonical owner.
4. Make one coherent change.
5. Add focused tests appropriate to that layer.
6. Resolve the exact final PR head.
7. Require typecheck, full test suite, and production build on that exact head.
8. Require relevant backend verification to be genuinely green for Supabase changes.
9. Do not dismiss a permanently failing or skipped required check as unrelated.
10. For database foundations, execute or otherwise genuinely validate the migration and adversarial SQL path; source-string tests alone are not backend proof.
11. Merge only the exact verified head.
12. Deploy the exact head through GitHub Actions when live testing is required.
13. Verify the exact production deployment SHA before describing it as live.

Update this document in the same PR when a stage completes, a locked rule changes, a material architecture fact is discovered, or the next PR boundary changes. Do not create a competing Auction handoff document.

## Locked decisions versus tunable implementation data

### Locked

- Two-player asynchronous sealed-bid gameplay.
- Challenger selects exact mode.
- Prepared challenge with fixed deck and no reroll.
- Prepared state is challenger-only until send; abandoned state is unreadable.
- First visible tie priority before challenger’s bid.
- First bid locked before recipient notification.
- Acceptance requires recipient’s bid.
- `$1` minimum; no pass.
- Reserve-based maximum bid.
- `$50`/five selections/ten rounds for Ultimate Fighter.
- `$40`/four selections/eight rounds for all other modes.
- Alternating visible tie priority after tied rounds only.
- Five Ultimate Fighter categories and private category intent.
- Current-item-only deck visibility.
- Sequential `$1` forced assignment.
- No timers, forfeits, or gameplay expiration.
- Participant cancellation with no winner or loss.
- Non-null cancellation audit for cancelled games.
- Forward-only lifecycle with immutable terminal rows.
- Immutable participants, selected mode, version snapshots, and canonical challenge link.
- Rematch returns to mode selection and creates a new game.
- Final overall `0–100` scores only.
- Numeric equality is an actual tie; unequal scores require the higher-scoring participant as winner.
- Unspent money has no grading effect.
- Sixteen-mode initial catalog.
- UFC-only initial content.
- Server-private bids, decks, category intent, rarity, and grading.
- Fixed content, rarity, and grading versions per game.
- Ultimate Fighter balanced rarity direction.
- Jon Jones target near `1%–2%` of games.
- Broad category aces near `25%` individually.
- Existing canonical providers, routes, repositories, notifications, and deployment owners remain in control.
- Six feature PRs total: PR #203 plus five remaining delivery PRs, unless a future reviewed contract change proves a split is necessary.

### Tunable through reviewed content work and simulations

- Exact pool sizes.
- Exact fighter and item membership.
- Exact hidden item and category values.
- Final rarity weights and confidence bands within the approved direction.
- Which borderline fighter is Ace versus Elite.
- Exact large-pool headliner rates within the approved direction.
- Exact career signature-performance rates within the approved direction.
- Private grading formulas and weights.
- Visual polish that does not alter the product contract.

## Decision log

### 2026-08-01

- Replaced letter grades with final `0–100` scores only.
- Confirmed sequential `$1` forced assignment.
- Confirmed visible alternating tie priority.
- Selected the balanced Ultimate Fighter rarity model.
- Set broad category aces to approximately `25%` individual game appearance.
- Adopted the prepared challenge/no-reroll opening flow.
- Completed the architecture inspection and preserved the existing Play, Challenge, Supabase, notification, Worker, and deployment owners.
- Merged implementation PR #203 establishing the typed public catalog and canonical route shell.
- Merged PR #204 establishing this canonical implementation record.
- Rejected the original PR #205 head because its privacy, lifecycle, NULL constraints, terminal immutability, tests, and backend verification were not sufficient.
- Kept PR #205 as the one backend-foundation owner and required repair on the same branch.
- Replaced the prior ten remaining micro-PRs with five coherent delivery PRs: backend foundation, playable server engine, complete gameplay UI, real content and grading, and notifications/release proof.

### 2026-08-03

- Merged PR #274 from exact reviewed head `bb78d8a5db2bac51897bbfe7c60bfdd943376353` as merge commit `3fdac6e7e526d92e437789c2bed128fa821914ee`.
- Released all sixteen UFC-only content pools, the balanced private generator, and the fixed-version private grader.
- Applied and verified production migrations `202609020001` through `202609020008` through the canonical Supabase workflow.
- Preserved PR 6 for notification completion, rich previews, full multi-profile privacy proof, and final Auction certification.
