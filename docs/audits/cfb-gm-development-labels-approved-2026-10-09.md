# CFB GM — approved individual development labels (October 9, 2026)

**STATUS: LOCKED BY OWNER FOR NEXT CFB GM IMPLEMENTATION.** Documented research/label decision only. No application, gameplay, 2026 Wheel HQ current-ability grades, player-development probabilities, NIL calculations, chemistry or offseason system has changed.

Use **the exact existing five NFL development labels**, not a new college developmental-stage vocabulary and not a separate ceiling pill. The previously proposed five stages (EMERGING / ASCENDING / ESTABLISHED / PLATEAUING / VOLATILE) in the research-only audit are **superseded as proposed UI labels**. They were never put into gameplay.

## Locked proposed labels across the existing 468-player pool

| NFL-style development label | Current CFB classifications | Owner-approved recalibrated labels | Share |
| --- | ---: | ---: | ---: |
| HIGH UPSIDE | 48 | **44** | 9.4% |
| RISING | 355 | **86** | 18.4% |
| STEADY | 62 | **298** | 63.7% |
| BOOM/BUST | 0 | **28** | 6.0% |
| DECLINE RISK | 3 | **12** | 2.6% |
| **Total** | **468** | **468** | **100%** |

The **per-player exact approved classification** (with ID, name, school, family, classification, HQ current grade, prior label, new label, development odds, ceiling headroom, and source URLs) is recorded in [the 468-player approved label mapping](cfb-gm-468-development-labels-approved-2026-10-09.csv). All 468 IDs were matched; no missing or duplicated player. The proposed distribution is the result of applying the following evidence-informed thresholds consistently to all 468 records, **not a manually imposed label quota**.

### Locked classification rule for implementation

Operate on each existing researched one-season development distribution (`breakout`, `improve`, `steady`, `decline`), `maxGain`, `maxLoss`, `volatility`, and current HQ `grade`. Define:

- `positive = breakout + improve`
- `headroom = min(maxGain, max(0, 99 - grade))`

In **priority order**, assign exactly one label:

1. **BOOM/BUST:** `volatility === "HIGH"`, `breakout >= 13`, `decline >= 17`, `maxLoss >= 6`, `headroom >= 3`.
2. **DECLINE RISK:** `decline >= 22` AND (`decline >= positive × 0.65` OR `decline >= 27`).
3. **HIGH UPSIDE:** `breakout >= 18`, `positive >= 50`, `headroom >= 5`, `decline <= 18`.
4. **RISING:** `positive >= 45`, `positive >= steady + 8`, `headroom >= 2`, `decline <= 20`.
5. **STEADY:** everyone else.

**Interpretation:** RISING needs actual modeled developmental momentum, not merely positive odds greater than decline. STEADY is not a claim that improvement is impossible; it means the researched odds and current grade do not justify one of the stronger development tags. BOOM/BUST should require genuine two-sided volatility. DECLINE RISK is a relative concern and can coexist with a larger single-category STEADY probability.

### Illustrative individual corrections

| Player | Prior label | Approved label |
| --- | --- | --- |
| Keelon Russell | RISING | STEADY |
| Arch Manning | RISING | STEADY |
| Dante Moore | RISING | STEADY |
| Kamario Taylor | RISING | STEADY |
| Ty Redmond | RISING | STEADY |
| Jeremiah Smith | STEADY | STEADY |
| Malachi Toney | STEADY | STEADY |
| Braeden Jackson | HIGH UPSIDE | HIGH UPSIDE |
| Elijah Griffin | RISING | RISING |
| Jadan Baugh | DECLINE RISK | STEADY |

All individual thresholds are **gameplay scouting-label decisions informed by the existing individual-source evidence**; they are not externally validated frequencies. The underlying 468 development distributions are not being regraded by this approval. Previously documented separate HQ grade review flags are not approved by implication.

### Next implementation boundary

This decision is **locked and ready for a subsequent implementation**, but the owner expressly requested no further research or live changes at this point. If later implementing, use the mapping and exact precedence above, preserve current authoritative grades and existing development odds, and regression-test all 468 label results. Other unfinished CFB GM work (NIL economy, chemistry/retention, CFP simulation, mobile visual parity) is **not resolved by this label sign-off**.

