# NBA Average Fan — Current Events Readiness

Status: **owner-only Casual and date-seeded Daily-style preview**. Not an official Daily game. The NBA bank contains evergreen questions only. No automatic NBA current-event feed is configured, and the preview does not consult server publication history, leaderboard state, or other Daily game's published current-event source IDs.

## Existing canonical pattern

The locked Football/UFC Average Fan official Daily runtime already supports editorially authored current events. The authored record contains `contentType: "current-event"`, a source identity, valid expiry, source reference, and optional activation date. At publication, the Daily runtime uses `used_current_event_source_ids` from publication history to exclude stories previously used by other Daily games. A board uses at most one current event and rejects grade-2 news by the authored grade rules.

The current-event feed is *not* a license to copy Bar Trivia questions: each Average Fan story/question must be independently edited and verified and must avoid the same fact family.

## NBA activation contract — not activated by this PR

1. Editorially source and verify each NBA story against reliable records; author NBA Average Fan wording independently of Bar Trivia and other NBA trivia banks.
2. Assign a canonical immutable `sourceId` for the underlying story, `sourceUrl` (HTTPS), `verifiedAt`, `expiresAt`, and Grade 3–5 difficulty. The NBA question validator rejects unverified current-event records.
3. Compare new facts against NBA Millionaire, Sports Feud, other NBA question games, and any eventual NBA Bar Trivia bank before adding them. A matching underlying event must keep the **same** `sourceId` across games even if phrased differently.
4. When NBA Official Daily is explicitly approved, integrate NBA with the existing *server-owned* Daily publication workflow. Its history query must include **all NBA Daily game families' published source IDs**; apply the same current-event exclusion and no-repeat logic as Football/UFC.
5. Select **at most one** vetted, unexpired NBA current event on an official Average Fan Daily board. If none is available, build an evergreen-only board. Never auto-publish a new question or activate NBA Official Daily from editorial ingestion alone.
6. Add publication-history tests for two games using one `sourceId`, expiry, fallback, same-day determinism, and source collisions before enabling the NBA public Daily route.

**Important:** The local owner preview's date seed does not provide official cross-game source deduplication. The present tests intentionally assert zero NBA current events; production Daily publication stays disabled.
