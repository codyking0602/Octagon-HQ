# Football Sports Feud rebuild staging — October 23, 2026

Branch-only editorial staging. **No live player gets these questions yet**. The old v1 publisher, score ladders, bank selection, result IDs and prior official packs remain unchanged.

## Ground truth

- Audit source: main ec0944bb62ece69f70cc3c86b2611bfbde589ce7.
- Old claim: 350 NFL and 350 CFB questions, but 70 five-prompt families each.
- This branch retains only one original (-1) entry per KEEP family. Variants -2 through -5 are not counted as distinct.
- New entries are individually authored topic lanes, not five prompt variations.
- NFL candidate bank: **23 Main + 53 Fast = 76** independent source IDs, consisting of 21 old KEEP and 55 new.
- CFB candidate bank: **21 Main + 54 Fast = 75** independent source IDs, consisting of 23 old KEEP and 52 new.
- 151 candidate IDs combined, compared with 700 padded old variants. KEEP remains subject to final fact-and-alias certification.

## Gating

The isolated rotation preview permits **10 appearances per sport (20 Football appearances in all)** without repeating source question IDs, with two Main and five Fast per appearance. It deliberately rejects requests for 20 appearances *per sport*: that more demanding standard needs at least 40 genuinely distinct Main and 100 Fast questions per sport, before quality buffer. Six months plus buffer should target roughly 50 Main and 120 Fast per sport; do not activate early.

The rotation preview does **not** change the current Daily schedule or replace the publication code. Materialization into canonical result entity metadata, persisted Daily pack version, challenge-history behavior and no-repeat cadence must be implemented and verified in a future release step after content is sufficient.

## Editorial review policy

Eight ranked examples plus explicit additional correct answers on each new board. Ranking is editorial recognition, **not an actual survey**. Scope annual awards and historical affiliation explicitly; NBA's no-repeat and fan-language acceptance work informs this bank. Brand/type and collision checks exist in `footballSportsFeudRebuildCandidates.test.ts`; more objective source cross-checks and native CI are still required before activation.

Sources to check during final historical gate include NFL Awards history, Pro Football Reference, NCAA official record books, CFP 2024-2025 field lists, official Heisman archives and Doak Walker/Biletnikoff recipients. Stage objective questions with curated eligibility caps instead of manufacturing fillers.

## High-risk history-aware areas to keep reviewing

- Franchise relocations and stadium sponsor renames must accept contemporaneous labels.
- 2024 conference realignment must not use present membership to retroactively classify earlier seasons.
- Historic MVP/award recipients include shared awards and renamed recognitions.
- NFL quarterbacks starting on different franchises must never be credited for seasons they did not play there.
- Avoid ranking near-synonymous plays/actions as separate substantive responses.
- Main may require history knowledge; Fast should allow a casual fan to respond within seconds.

## Never overwrite

The original v1 bank files, published Daily setups and completed results. Live integration is explicitly deferred. No PR merge or deployment authorization is implied.
