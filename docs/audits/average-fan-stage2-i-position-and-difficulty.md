# Average Fan Stage 2I — college two-way eligibility and simple UFC vocabulary

Date: 2026-10-14. **Further selective editorial corrections; Stage 2 still NOT complete.**

## Keep / rewrite / retire decisions
- **Retire all generated single-position prompts for CFB Travis Hunter** (`g1 position`, `g2 position-tf`, `g3 school-position`), because Colorado lists his position as **Athlete**, honored him on both sides of the ball, and he played meaningful snaps at WR and cornerback. Both WR and DB answers are defensible, so merely mentioning "primary" is insufficient for his case. Keep separately supported Hunter awards questions.
- **Rewrite generic football position prompts** to ask for each other player's *primary NFL/college position*, which is what the canonical subject field means. This avoids treating secondary roles as inherently false when the player appeared there.
- **Regrade UFC "feint"** from legacy 5 to legacy 2 (playable grade 3): an ordinary technical vocabulary item is not specialist-grade championship trivia.
- **Retire UFC "switching stance" definition:** the prompt already nearly gives away "changes which side is forward," so it is a recognition-free filler question rather than a meaningful hard item.

## Evidence
- [Colorado official Travis Hunter roster/bio](https://cubuffs.com/sports/football/roster/travis-hunter/17201): official position listed as Athlete, multiple offense/defense accomplishments.
- [Colorado official 2024 two-way first-team All-America announcement](https://cubuffs.com/news/2024/12/13/football-hunter-named-first-team-sports-illustrated-all-american): WR and CB first-team distinction.
- [UFC 280 significant stats](https://www.ufc.com/news/significant-stats-ufc-280-oliveira-vs-makhachev-sterling-dillashaw-yan-omalley-chookagian-fiorot): feints and stance-switching are basic recognizable striking concepts.

No roster authority, scoring, migrations, historical Daily snapshots or rotation targets are changed. Regression tests enforce exclusions and prompts; their passing does **not** certify the remaining selected bank, which still requires question-by-question source/alias/distractor/difficulty verification and generated Daily boards.
