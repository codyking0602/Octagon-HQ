# College GM 2026 Year 1 NIL — first-party integration handoff (Oct 9, 2026)

**Scope:** owner-only College GM preview. This PR consumes the individual football research in research-only PR #1816 without republishing third-party market prices or ranking data. PR #1816 remains **draft and unmerged**; no imported On3 or The NIL Standard price observations are delivered with this feature.

## Decisions

- **468/468** canonical player IDs; **25/25** schools. Every Year 1 NIL entry is an independent Octagon editorial **estimate**, not a claim of compensation actually paid.
- Retain **381** individually researched editorial estimates from the handoff. Retain **27** documented independent earlier case reviews where research comparisons were added later. Supply **60** further first-party, individually adjudicated market judgments using player-specific production/award/role/transfer narratives, not the provider dollar amount.
- **No 2026 NIL formula:** no HQ grade, draft/roster slot, team OVR, development odds, AP ranking multipliers, $11M/$7.5M caps or position-role price formulas are inputs. Genuine variance, bargains and overvaluation remain possible.
- Third-party published amounts, market ranks, provider profile URLs and bulk data **never enter** the first-party market ledger or client runtime. This is not a disguised multipliers-based rewrite of the copyrighted provider table.
- Full review ledger: `data/curated/football/cfb/gm-2026-first-party-nil-market.json` (player ID, name, school, source football links, date, low-confidence individual case rationale, amount, provenance).
- Browser reads only the compact ID-to-USD projection `data/generated/football/cfb-gm-first-party-nil-runtime-2026.json`. It has no underlying third-party provider evidence. Player pool initialization validates population and IDs and **throws** on a missing/invalid price; no role-grade fallback.
- The current Year 2 negotiating/chemistry system uses independent Year 1 value as the starting point. It does not change Year 1 amounts; player-specific seeded 2027 inflation/development and binding offers still operate as in merged PR #1811.
- Saves bump to `v11-independent-nil` so previous sessions cannot silently acquire new contracts.

## Release gates

1. Verify exact head has green typecheck + affected tests. Validate ledger/runtime/live 468-row consistency, 2027 price separation and no protected data in the runtime.
2. Run multi-seed **Powerhouse and Builder** complete-game stress tests after merging other focused owner preview fixes; recalibrate *gameplay caps* if needed, **not** the 468 independently determined NIL amounts.
3. Keep owner-only route and diagnostics. Do **not** open public gameplay until final testing and owner approval.
4. Leave #1812 and #1816 unmerged. Their source-linked published valuation observations are internal research only until explicit commercial rights/permission review. See [On3 Terms of Service](https://www.on3.com/page/terms-of-service/) for commercial content usage limitations.

This data is a **market opinion**, not a disclosed NIL deal, independently audited contract, agency quote or provider-licensed resale product.
