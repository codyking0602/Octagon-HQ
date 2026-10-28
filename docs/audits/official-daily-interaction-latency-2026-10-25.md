# Official Daily interaction latency — October 25, 2026

## Scope

All Official Daily games in Football, UFC, and NBA use the authenticated
`daily-challenge-runtime` Edge endpoint. This audit covers the shared
per-action path, not Daily schedule rotation, question quality, or Casual rules.

## Observed baseline (production; 24-hour unified Edge request logs)

For the `daily-challenge-runtime` POST endpoint:

| HTTP status | Requests | p50 (ms) | p90 (ms) | p99 (ms) |
| --- | ---: | ---: | ---: | ---: |
| 200 | 856 | 2,884 | 4,910 | 9,028 |
| 546 (resource limit) | 50 | 3,883 | 6,434 | 10,788 |

Source: read-only Supabase project `rvbspcjvebgwqzssayts` Edge request logs,
queried on October 25, 2026. These are **endpoint-wide** observations; POST
payloads are not available in aggregated request logs. They are not
per-game timing measurements or browser frame timings. Counts may include
reads, saves, and scheduled calls. This is a baseline, not a post-fix claim.

## Root causes from source inspection

1. Every regular Football and UFC interaction first ran materialization
   recovery SQL even when today's immutable board was already published.
   UFC also checked a historical Feud relaunch reset. Published-board
   interactions reran these calls unnecessarily.
2. Most game actions wrote progress, read the same context again, and
   ran pending finalization even when the game was still in progress.
   The saved progress RPC already supplies authoritative revision and public
   state. Only completed actions require a fresh context and canonical grade.
3. The UFC Millionaire per-answer route cold-imported the full multi-game
   UFC publication-and-answer bundle. Football Millionaire similarly loaded
   the complete Football advance bundle.
4. On October 25 the Football Hit the Number progression UI also waited for
   the server before showing the next role, despite safe per-slot eligibility
   already being available. This was addressed independently by PR #2107
   and is deliberately not duplicated here.
5. The client uses one shared sequential, idempotent Daily action queue.
   Keeping that mechanism avoids lost answers, duplicate grades, and
   revision races. Answer-dependent reveals (e.g. Millionaire correct
   choice) must still be sourced from the server.

## Remediation in this PR

- On a normal **advance**, first resolve the current published board from
  the canonical DB materialization descriptor. Only fall back to full
  materialization when publication is required. **GET** and scheduled
  materialization retain their existing migration/cutover recovery path.
- For an intermediate answer, return the saved RPC's authoritative
  `revision` and `public_state` rather than refetching them. Continue
  canonical context reload + final scoring on game completion.
- Bundle Millionaire answer evaluation separately from question bank
  publication and load it only for Millionaire actions in Football/UFC.
- Leave all question banks, rules, scores, historical results, idempotency,
  authenticated identity checks, pending finalization, and rotation untouched.

## Release acceptance / safety

- Exact PR head: typecheck, unit and regression tests, backend verification,
  and generated Edge bundle validation must pass.
- Production: verify Edge deployment source marker and current published
  board responses. Re-query request latency after sufficient real traffic;
  the source audit alone cannot prove browser-perceived latency or a new p90.
- Reject repeat tap races, stale revisions, failed HTTP responses, and
  client-side fabrication of answer reveals. Do not downgrade canonical
  grades to client scoring for the sake of speed.
