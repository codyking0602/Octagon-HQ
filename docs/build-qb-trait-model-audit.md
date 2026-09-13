# Build a QB trait-model audit (v2)

## Ownership and definitions

`footballPositionTraitRatings.ts` is the single editable model. The generated TypeScript catalog and append-only SQL catalog version are deployment projections; grading remains server-owned. The five locked traits are evaluated independently: **Arm** is power/velocity and difficult-drive throws; **Accuracy** is repeatable ball placement at every level; **Processing** is read/decision speed and correctness; **Mobility** is escape, rushing, and outside-structure creation; **Clutch** is pressure, closing, comeback, and postseason performance.

## Evidence method

The 60-player audit uses a peak-capability/career blend rather than a box-score formula. Each profile was cross-checked across reputable contemporary scouting and film analysis, era-relative efficiency and accuracy evidence, sack/pressure and rushing evidence, and high-leverage/postseason records. Traditional statistics are corroboration only. Completion percentage does not stand in for placement; rushing totals do not fully stand in for creation; championships do not automatically stand in for clutch.

Era normalization compares what a player demonstrated against the defensive rules, passing environment, and offensive conventions of his own era. It avoids mechanically inflating modern completion rates or penalizing older deep-pass offenses. The values describe transferable trait quality, not an all-time-greatness ranking.

## Specialists and rarity

Rarity is independently curated for room composition and recognizability. It never caps a trait. The universe intentionally contains cannon arms, runners, placement specialists, quick processors, high-leverage specialists, balanced stars, and volatile players at lower bands.

A room draws one marquee, two strong, four core, two lower, and one wildcard profile through the existing catalog/deck ownership. Every draw is unique. Seeded tests run 5,000 rooms and audit identity uniqueness, mix, specialist representation, and diversity.

## Score calibration

Simulation assigns each room between two opponents, then models legal five-category builds using five distinct QBs per player. It samples strategic—not purely uniform—category choices and records mean, median, tails, decade frequencies, opponent differential, ties, and near-ceiling outcomes. This guards against compressed 90–95 outcomes while retaining rare exceptional builds. Version rotation is append-only because v1 has already shipped.
