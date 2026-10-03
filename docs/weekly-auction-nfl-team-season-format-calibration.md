# Best NFL Team-Seasons Since 2000 — Weekly Auction Format Calibration

This document records the approved runtime contract for the NFL Team-Seasons Weekly Auction. It is a collection game built on the shared Football Weekly Auction architecture.

## Week structure

- Days 1–6 are normal themed sealed-bid auctions.
- Day 7 replaces the seventh normal auction with the Wildcard/Reaping finale.
- Starting normal bankroll is $50.
- A player may win at most two normal teams per day and five normal teams during the week.
- Final scoring uses the best four effective team-season grades.

## Day 7 Wildcard

Day 7 reveals **4 Wildcard team-seasons before the player chooses whether to enter**.

The approved approximate target shape is 90.5 / 89.0 / 87.5 / 85.5 with natural variation.

Players rank only Wildcards they would actually accept, then choose 0–5 entries. Wildcard is an upgrade mechanism only; a player must already have at least four normal teams to enter.

Each entry is one literal Priority ticket and one literal Reaping ticket. Five entries never automatically beats one entry.

**0 entries** means no Priority-wheel upside and no Reaping risk.

Priority and Reaping are separate persisted weighted draws. A player may both claim a Wildcard and be Reaped.

A Wildcard may replace at most one team for a player and only when it strictly improves that player’s current fourth scoring team.

## Reaping

The Reaping consequence does not change the current week’s score.

The Reaped player starts the **next calendar Weekly Auction** with a one-week -$5 bankroll adjustment. For a $50 subject, that means a $45 starting bankroll.

There is no Daily Challenge penalty, cross-game penalty, post-Reaping immunity, or temporary scoring deduction.

## Completion

After Wildcard resolution, any player below four effective teams is autofilled only from unclaimed normal team-seasons that were actually exposed on Days 1–6.

Autofill assigns the worst hidden-grade eligible exposed team first until the player has four teams.

Hidden reserve cards and unclaimed Day 7 Wildcards are never completion inventory.

## Information security

Before Day 7 resolution, the client may see the four Wildcards, its own rankings, and its own entry count.

Before resolution, the client must not receive other players’ entry counts, Priority order, Reaping outcome, hidden grades, or future themes.

After resolution, the persisted Priority order, claims, Reaping outcome, and final collection may be shown.
