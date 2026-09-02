# Football Greatness Tier Philosophy

Status: **LOCKED**  
Decision date: **2026-09-02**

This document preserves the product philosophy for football greatness, future Football Rankings, and greatness-dependent game behavior.

## Core direction

Football should **start with greatness tiers, not exact all-time rankings**.

The immediate priority is finishing the football games. We should not recreate the UFC ranking project across thousands of football subjects before the games can ship.

Later, when the Football Rankings product is ready, The HQ can deeply research and exact-rank the **apex of each pool** — roughly the top few percent or another deliberately small group. The remainder of the pool can stay tiered and unordered.

The long-term shape is therefore:

1. **Now:** assign qualified subjects to greatness tiers.
2. **Later:** exact-rank the small apex where the distinction is worth the work.
3. **Keep the rest tiered:** do not manufacture precision deep in a pool where an exact order is not useful or defensible.

Nothing built for tiers should need to be thrown away when exact rankings are added later. Exact rankings add resolution to the top of the existing greatness system.

## Greatness tiers are not recognizability tiers

The existing A/B/C subject tiers answer a different question: **how recognizable is this subject?**

Greatness tiers answer: **how historically great was this subject within the relevant comparison pool?**

These systems must stay independent.

A highly recognizable player can have a lower greatness tier. A less-famous historical player can have a higher greatness tier.

## Same tier does not mean literally equal

Subjects in the same greatness tier are **not declared exactly equal**.

The correct interpretation is:

> The HQ is not claiming enough confidence or resolution to order these subjects within this tier yet.

For game purposes, subjects in the same tier are treated as equivalent unless and until an exact apex ranking explicitly orders them.

This avoids fake precision while leaving room for later research.

## Separate comparison questions remain separate

A player career and a single season are different greatness questions and should remain different pools.

For example, a quarterback can own one of the greatest single seasons ever without necessarily owning one of the greatest total college or NFL careers ever.

Do not force peak, career body of work, and single-season dominance into one universal football rating.

## No fake hidden exact ranking

The tier system must not secretly depend on a brittle exact rating that pretends to know the ordering inside every tier.

An internal calculation may help:

- classify subjects into tiers;
- measure matchup difficulty or statistical similarity;
- select interesting game questions;
- support later calibration.

But an internal decimal score must **not manufacture an official winner** between two subjects that The HQ has intentionally left unordered in the same greatness tier.

## Game behavior

Most football games naturally work with tiers.

### Blind Rank Five and other ordering games

If two subjects are in the same greatness tier, swapping their internal order should carry **no penalty**. They are interchangeable for the current greatness-resolution level.

### Objective-stat games

Games such as Hit the Number, Find the Leader, and other questions with an objective statistical answer remain driven by the underlying factual data. Greatness tiers do not replace objective facts.

### Blind Resume

Blind Resume is the important exception and should be designed around tier truth rather than fake exact scores.

The core answer set should support:

- **Resume A**
- **Same Tier**
- **Resume B**

The matchup generator should primarily select:

- same-tier matchups;
- adjacent-tier matchups;
- occasional wider gaps only when the anonymous resumes remain genuinely deceptive and interesting.

Avoid obvious mismatches simply because two subjects exist in the database.

The system may use a private closeness/difficulty calculation to choose compelling resumes, but that calculation selects the question — **it does not manufacture the historical answer**.

If both resumes belong to the same greatness tier, the correct answer is **Same Tier**.

If the tiers differ, the higher greatness tier is the answer.

The reveal should show the identities and their official greatness tiers.

## Future Football Rankings

When Football Rankings is built, exact ranking work should concentrate on the part of each pool where people actually care about the ordering.

A future presentation could therefore look like:

- exact ranks for the apex;
- then an unordered All-Time Great tier;
- then additional unordered greatness tiers below it.

The exact size of the ranked apex does not need to be fixed today and can differ by pool if justified.

The key principle is constant:

> **Rank the apex when the Rankings product is ready. Tier the rest.**

## Why this is the football model

This structure is intentionally different from the UFC ranking project.

Football has far more subjects, positions, seasons, teams, coaches, programs, and eras. Applying UFC-level individual review to every football subject would delay the games and create large amounts of false precision.

The tier-first system preserves historical judgment where it matters, scales to the football universe, improves greatness-dependent games, and creates a clean path toward deeper rankings later without requiring a second competing ranking system.
