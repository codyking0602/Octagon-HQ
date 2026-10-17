# Average Fan Stage 2Z — UFC title-Final recognizability gate

Date: 2026-10-16. Based on production main `94a552c91b05dca43321f285db52e68eab4c4bb2`.

## Additional non-sampled Final-family defect

Stage 2X required recognizable supporting opponents for generated title Finals, but the **primary title-fight opponent was not screened**. A fighter with at least one title fight could therefore yield a protected Final that named an obscure challenger, even though the other one or two opponent names were familiar. This is excessive undercard-style exact name recall, inconsistent with the existing recognizable-population quality policy.

**Fix:** Generated title question families now select only **documented title fights against fighters in the 133-name recognized factual ledger**. Applies to dated title-opponent multiple choice, dated title-result identity and protected title identity Finals. When no title bout has a recognizable opponent, use the existing multi-opponent recognizable fight Final where enough unique peer anchors exist; never invent a title opponent, downgrade history or open an unanchored guess.

**Audit regression:** Every selected generated UFC title-opponent, title-identity and title Final must name a recognizable primary title opponent; that opponent must occur on the named fighter's factual title-bout ledger. Existing three-identity uniqueness and peer-gender/distractor checks continue to apply. No authored protected Final text, published history, earned points or past Daily snapshots are changed.

## Additional authored UFC history retirements

Individual primary-source comparison confirmed two historical bouts but also confirmed both short-answer definitions demand unfamiliar undercard-opponent identities, in conflict with Average Fan's hard-but-recognizable philosophy:

- `taktarov-nine` asked for **Anthony Macias** as the victim of Oleg Taktarov's nine-second 1995 submission. [UFC 6 official card](https://www.ufc.com/event/ufc-6) verifies the bout; it does not make Macias a fair unassisted name recall target for Average Fan.
- `first-155` asked for **Joao Roque** as Jens Pulver's opponent in the UFC 26 early 155-lb matchup. [UFC 26 official card](https://www.ufc.com/event/ufc-26) corroborates the pairing, but recall of Roque's name alone is the tested skill.

**Decision:** retire both future candidates, leave authored source rows for historical editorial provenance, add exclusion regressions. Do not change older published Daily questions or recoveries.

## Editorial boundary

This closes a specific **non-sampled generated Final family failure mode**, not the whole Stage 2 acceptance checklist. Remaining gates include source signoff for surviving authored content, a fresh post-rewrite future-board editorial pass and broader sport-specific generated Final sampling. All green exact-head CI and production verification remain required.
