# Build a QB trait-model audit (v2)

## Ownership and definitions

`footballPositionTraitRatings.ts` is the single editable trait-model owner. It resolves the mature pool through the existing canonical Football identity, comparison, factual, historical-consensus, and ranking owners. `generated/buildQbCatalog.ts` is a downstream projection, and the append-only SQL catalog is the deployment projection. Final scoring remains server-owned by the shared Auction grader.

The five locked traits stay independent: **Arm** measures throwing power, velocity, and difficult-drive throws; **Accuracy** measures repeatable ball placement; **Processing** measures read and decision speed/quality; **Mobility** measures movement, escape, rushing value, and outside-structure creation; **Clutch** measures pressure, closing, comeback, and postseason-type performance.

## Evidence method

The v2 model uses era-normalized canonical career facts plus the existing historical-consensus owner and hidden qualitative scouting/film anchors where broad career statistics cannot represent a trait cleanly. The audit source set spans factual/statistical evidence, historical evaluation, film/scouting evaluation, arm-talent review, and high-leverage evidence.

The qualitative anchors are inputs, not final grades. All final trait grades are calculated through the shared Football ranking calibration. Subject quality and generation frequency are separate from trait ceilings, so a lower or wildcard quarterback can still carry an elite individual tool.

## Universe and room generation

The mature universe contains exactly 60 canonical quarterbacks across eras and gameplay archetypes. Hidden quality bands are generation inputs only and are not collectible labels.

Build a QB does **not** own a second deck engine. The existing shared Auction generator remains authoritative. The v2 catalog supplies hidden generation weights and rarity bands to that owner, which keeps rooms unique, limits high-end saturation, and allows bounded randomness. Deterministic audit simulations cover thousands of rooms for marquee frequency, high-end mix, specialist presence, replay diversity, and individual appearance coverage.

## Score calibration and release gate

Completed-build simulations use actual ten-player room constraints, five distinct selected quarterbacks, and the five unique traits. The audit measures mean, median, tails, score-decade frequency, near-ceiling frequency, opponent differential, and ties.

The v2 catalog rotation is append-only because Stage 12 v1 has already shipped. Public release remains disabled. Direct backend use continues to require the private Draft Room access gate for both players.
