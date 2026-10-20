# Football Weekly Content: verified GitHub-to-Supabase handoff

The canonical `public.football_weekly_content_packages` table and original owner RPCs remain the editorial authority. No second package table or publisher is created.

## Each sport's own weekly path

1. Sunday 8 AM Central: prepare exactly five verified CFB Spotlight player candidates and five next-week CFB games. Monday 10:30 PM Central: do the same for NFL, independently. Research verified identity, game timing, and reliable source URLs **before** writing a manifest. A game that has not been verified must never be invented just to fill a list.
2. Stage `.football-editorial/YYYY-MM-DD-cfb.json` or `...-nfl.json` for that Tuesday date. The manifest contains `week_of`, `sport`, and `candidates` with the exact Phase 2 `players` and `games` arrays of five entries each. These are content facts, not authentication claims. A focused PR is preferred when available, **not a prerequisite for editorial data staging**. If PR creation fails or is blocked, create/update only this canonical, validated data-only JSON on fresh `main` via the authenticated GitHub Contents API. Do not move code, migrations, workflow files, binary assets, or secrets through this exception.
3. On the editorial JSON push to `main` (via merge **or the safe data-only fallback**), the **Football Weekly Editorial Handoff** workflow requests a short-lived GitHub Actions OIDC JWT. The private `football-weekly-editorial-handoff` Edge Function verifies the GitHub issuer/JWKS, dedicated audience, repository ID, exact workflow path and main ref. Only it can use the server-held Supabase service-role key for the narrowly scoped `ingest_football_weekly_editorial_handoff` RPC. No service-role key, token, owner UUID, or secret appears in a GitHub repository file or GitHub workflow.
4. The SQL RPC validates 5+5 proposals, does not rewrite a previously different shortlist, serializes updates to the canonical Tuesday package, and reads it back. It updates only the named sport. **Staging never selects.**
5. Once the owner expressly chooses a player/game, place the existing two staged candidate IDs in the optional `selection` object, e.g. `{"player_id":"bear-bachmeier","game_id":"ole-miss-at-texas"}`. Selection writes through this path are accepted only when the verified GitHub Actions OIDC token's immutable `actor_id` matches the repository owner's GitHub user ID **284170760**. An untrusted workflow actor cannot approve, regardless of file contents or commit author email. GitHub provenance is stored as `selected_by_github_id`, `selected_via`, and the event source SHA; it is never fabricated as a Supabase `auth.uid()` or `selected_by`.
6. The original owner-authenticated in-app selection panel remains available, so the owner can approve directly through authenticated Supabase Auth if a merge was performed by an integration actor. That is an alternative **for owner approval only**, not a substitute or duplicated backend. Never automatically choose a default candidate.
7. After the player's image, verified YouTube link, four Spotlight stats, exact-matchup SeatGeek art source, and full sourced game breakdown are complete, append `preparation` containing `spotlight`, `game`, and `editorial` in the same manifest, alongside the **already approved** `selection`. A genuine GitHub owner OIDC execution uses the private `ingest_football_weekly_editorial_preparation` RPC to invoke the exact existing `prepare_football_weekly_editorial` validations; a non-owner cannot prepare. The manifest records editorial sources and canonical WebP paths, but does not claim art is deployed. The original asset checker must still verify real live assets before arming. The handoff returns `preparation_recorded` only after authoritative readback.
8. Immediately after the GitHub workflow succeeds, verify its five-and-five readback result. If it fails, fix the reported validation/permission error and retry via `workflow_dispatch` for that exact week/sport. The workflow retries transient HTTP/network errors with backoff, fails loudly on 4xx/immutable conflicts, and reports failed work in GitHub Actions rather than silently claiming staging.
9. Continue using the existing `.asset-ingest/` pipeline for verified ESPN player art and SeatGeek exact-matchup art, then the existing `prepare_football_weekly_editorial` RPC, the existing 5-minute `football-weekly-publisher`, and the existing Tuesday 12:00 AM America/Chicago server release gate. The signed handoff **does not** prepare, arm, publish, or bypass asset checks. CFB can become ready without NFL.
10. If CFB is approved but NFL is late, CFB must continue through production independently. If any art, sourcing, deployment, explicit authorization, or on-time readiness check is incomplete at the deadline, retain the previously approved material. Never publish late or use placeholders.

## Resilient PR-independent editorial status

- **`ready_for_review`** means the sourced five-and-five manifest is validated and ready to hand off, but authoritative Supabase readback is not yet confirmed. Keep it available and retry transient handoff failures; do not disable the weekly automation.
- **`staged_without_pr`** means a PR was unavailable but the safe JSON-only `main` push triggered the existing signed OIDC handoff and the canonical Supabase package has been read back with precisely five players and five games. These are *operational report labels*, not new SQL `status` values or approval/publish states.
- The `Football Weekly Content` recurring automation must stay enabled after isolated PR, media, or handoff failures; report the relevant phase, retain the approved selection and other sport, and retry only safely. Research and staging are independent of deployment. Never bypass GitHub OIDC for candidate staging, GitHub-owner identity for selection, owner-approved full preparation, generated-asset PR verification, publisher checks, or the Tuesday 12:00 AM Central release gate.
- **Recovery proof (October 20, 2026):** NFL 5+5 from source commit `310e8a13` was pushed as only `.football-editorial/2026-10-20-nfl.json` in `0574be9b`; the existing `Football Weekly Editorial Handoff` succeeded and SQL readback confirmed five players and five games without a PR. The owner's later signed OIDC selection was recorded independently. Missing verified weekly media must keep content selected/unarmed, never force an empty publication.

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
