# Football Ledger — Stage 13.6 CFB DL/EDGE Modern Historical Source Review

Date: 2026-08-29

Purpose: record the next source-exhaustion findings for recognizable CFB DL/EDGE careers whose normalized cfbfastR factual coverage does not reach their college seasons.

This review does not change recognition membership, ranking logic, candidate ownership, or factual ownership. It is evidence for the existing canonical factual owner and exists specifically to prevent a pre-2014 source-window gap from being mistaken for an unavailable historical fact.

## Aaron Donald — Pitt, 2010-2013

College Football at Sports-Reference publishes a complete defensive season table for Donald's Pitt career. His 2013 senior season is his best season in both required disruption dimensions:

- sacks: 11.0
- tackles for loss: 28.5

The same table reports 29.5 career sacks and 66.0 career tackles for loss, but the current canonical CFB DL/EDGE readiness contract is keyed to the existing `cfb-best-season-sacks` and `cfb-best-season-tackles-for-loss` metrics. Stage 13.6 should therefore hydrate the two reported 2013 best-season facts rather than introducing a new metric shape.

Source:
- https://www.sports-reference.com/cfb/players/aaron-donald-1.html

Disposition: **repairable from a credible historical source; not source-exhausted/unavailable.**

## Jadeveon Clowney — South Carolina, 2011-2013

College Football at Sports-Reference publishes a complete defensive season table for Clowney's South Carolina career. His 2012 sophomore season is his best season in both required disruption dimensions:

- sacks: 13.0
- tackles for loss: 23.5

The table also reports 24.0 career sacks and 47.0 career tackles for loss. As with Donald, the existing canonical readiness contract expects best-season disruption facts, so Stage 13.6 should hydrate the 2012 values through the existing factual owner rather than inventing another career-stat path.

Source:
- https://www.sports-reference.com/cfb/players/jadeveon-clowney-1.html

Disposition: **repairable from a credible historical source; not source-exhausted/unavailable.**

## Ownership and next repair

The facts belong in the existing `footballFactualStatsExpansion.ts` subordinate sourced-fact input and must continue to resolve publicly through `footballFactualStatsCore.ts`. Recognition remains owned by the existing recognition/projection path.

A follow-up repair must make both canonical subjects `Full` in `footballLedgerAudit`, prove their missing readiness groups are empty, and assert the exact source-backed values through `getFootballFact(...)`.

Stage 13.6 remains open after this source review. No ranking implementation/calibration should advance merely because these values are now documented; they must be wired into the canonical factual path and all other required factual gaps must be repaired or explicitly exhausted.
