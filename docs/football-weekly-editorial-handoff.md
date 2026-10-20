# Football Weekly Content: verified GitHub-to-Supabase handoff

The canonical `public.football_weekly_content_packages` table and original owner RPCs remain the editorial authority. No second package table or publisher is created.

## Each sport's own weekly path

1. Sunday 8 AM Central: prepare exactly five verified CFB Spotlight player candidates and five next-week CFB games. Monday 10:30 PM Central: do the same for NFL, independently. Research verified identity, game timing, and reliable source URLs **before** writing a manifest. A game that has not been verified must never be invented just to fill a list.
2. Create `.football-editorial/YYYY-MM-DD-cfb.json` or `...-nfl.json`, where YYYY-MM-DD is the Tuesday release date, containing `week_of`, `sport`, and exactly five valid `candidates.players` plus five `candidates.games`. Prefer a focused review PR for auditable ordinary changes. **If PR creation fails or is blocked, staging must still proceed:** verify current main and any existing Supabase proposal first, then use authenticated GitHub Contents API to add/update **only that canonical editorial JSON file directly on main**. Never move application code, workflow files, migrations, or binary artwork through this data-only fallback. These are content facts, not authentication claims. Do not disable recurring monitoring because no PR exists.
3. On a canonical editorial JSON push to **main**, whether it came from a green reviewed PR or the scoped data-only no-PR fallback, the **Football Weekly Editorial Handoff** workflow runs and requests a short-lived GitHub Actions OIDC JWT. The private `football-weekly-editorial-handoff` Edge Function verifies the GitHub issuer/JWKS, dedicated audience, repository ID, exact workflow path and main ref. Only it can use the server-held Supabase service-role key for the narrowly scoped `ingest_football_weekly_editorial_handoff` RPC. No service-role key, token, owner UUID, or secret appears in a GitHub repository file or GitHub workflow.
4. The SQL RPC validates 5+5 proposals, does not rewrite a previously different shortlist, serializes updates to the canonical Tuesday package, and reads it back. It updates only the named sport. **Staging never selects.**
5. Once the owner expressly chooses a player/game, place the existing two staged candidate IDs in the optional `selection` object, e.g. `{"player_id":"bear-bachmeier","game_id":"ole-miss-at-texas"}`. Selection writes through this path are accepted only when the verified GitHub Actions OIDC token's immutable `actor_id` matches the repository owner's GitHub user ID **284170760**. An untrusted workflow actor cannot approve, regardless of file contents or commit author email. GitHub provenance is stored as `selected_by_github_id`, `selected_via`, and the event source SHA; it is never fabricated as a Supabase `auth.uid()` or `selected_by`.
6. The original owner-authenticated in-app selection panel remains available, so the owner can approve directly through authenticated Supabase Auth if a merge was performed by an integration actor. That is an alternative **for owner approval only**, not a substitute or duplicated backend. Never automatically choose a default candidate.
7. After the player's image, verified YouTube link, four Spotlight stats, exact-matchup SeatGeek art source, and full sourced game breakdown are complete, append `preparation` containing `spotlight`, `game`, and `editorial` in the same manifest, alongside the **already approved** `selection`. A genuine GitHub owner OIDC execution uses the private `ingest_football_weekly_editorial_preparation` RPC to invoke the exact existing `prepare_football_weekly_editorial` validations; a non-owner cannot prepare. The manifest records editorial sources and canonical WebP paths, but does not claim art is deployed. The original asset checker must still verify real live assets before arming. The handoff returns `preparation_recorded` only after authoritative readback.
8. Immediately after the GitHub workflow succeeds, verify its five-and-five readback result. If it fails, fix the reported validation/permission error and retry via `workflow_dispatch` for that exact week/sport. The workflow retries transient HTTP/network errors with backoff, fails loudly on 4xx/immutable conflicts, and reports failed work in GitHub Actions rather than silently claiming staging.
9. Continue using the existing `.asset-ingest/` pipeline for verified ESPN player art and SeatGeek exact-matchup art, then the existing `prepare_football_weekly_editorial` RPC, the existing 5-minute `football-weekly-publisher`, and the existing Tuesday 12:00 AM America/Chicago server release gate. The signed handoff **does not** prepare, arm, publish, or bypass asset checks. CFB can become ready without NFL.
10. If CFB is approved but NFL is late, CFB must continue through production independently. If any art, sourcing, deployment, explicit authorization, or on-time readiness check is incomplete at the deadline, retain the previously approved material. Never publish late or use placeholders.

## PR-independent staging and graceful state reporting

- **Content staging is not a release:** the existing owner-verified GitHub Actions OIDC → private Edge Function → canonical Supabase RPC is the *only* authorized noninteractive staging route. The GitHub action is already scoped to `.football-editorial/*.json` pushes on main. No second database, publisher, owner impersonation, service-role secret, privileged SQL write or alternate JWT path is permitted.
- A failed `create_pull_request` is **not** a reason to stop research, delete a shortlist, or disable Football Weekly Content. The automation may use the **authenticated data-only GitHub Contents API** to save the 5+5 canonical JSON to current main, then must inspect the completed handoff run and independently read back the precise Supabase sport/week candidate counts. Duplicate identical proposals are idempotent; an immutable selected shortlist cannot be replaced. CFB and NFL remain independent.
- The automation's **operational report states** are `ready_for_review` (validated package exists but the Supabase handoff readback is not yet confirmed) and `staged_without_pr` (exact 5+5 persisted and verified via signed handoff after the content-only main-push fallback). These are **not** database lifecycle enums or owner approval receipts. After real owner authorization, `selected` requires persisted selected IDs; `prepared` requires stored complete sourced editorial; `armed` requires canonical artwork and deployment verification; `published` requires the server's Tuesday midnight Central release gate and actual readback. Never infer downstream states from content-file commits.
- **Code/workflow/migration changes and binary art remain on their established separate reviewed PR, exact-green-head, merge/deployment path.** Missing original SeatGeek artwork, missing verified ESPN media, missing YouTube, absent owner selection, failed verification or a missed release deadline must fail closed. Those are genuine blockers to preparation/arming, **not** to staging verified candidates. Preserve the last approved live content; never arm late.
- Recovery proof for Tuesday 2026-10-20 NFL: shortlist recovered from commit `310e8a13` in a data-only main push `0574be9b`. `Football Weekly Editorial Handoff` run `39366254454` succeeded and canonical Supabase readback confirmed five NFL players and five games, without an NFL shortlist PR.

## JSON handoff example

```json
{
  "week_of": "2026-10-20",
  "sport": "cfb",
  "candidates": {
    "players": [
      {"id":"p1","name":"Verified player","team":"Verified school","position":"QB","summary":"Documented game result"}
    ],
    "games": [
      {"id":"g1","home_team":"Verified home","away_team":"Verified away","kickoff_at":"2026-10-24T18:30:00-05:00","summary":"Documented upcoming matchup"}
    ]
  }
}
```

The example is **illustrative only**; the live array lengths must both be exactly five. The owner-selection object is omitted until explicit owner approval. The NFL and CFB JSON manifests and independent database slots never delete or reset one another.
