# Average Fan — Stage 2 editorial audit: initial defect remediation

**Not a completed 880-question editorial review.** This PR removes verified systemic cross-game reuse; question-by-question independent factual/source reviews and controlled gameplay runs must still follow before marking Stage 2 complete.

## Verified systemic defects and corrections
- Bar Trivia was directly re-used as a question factory in CFB Average Fan, including **identical published trivia** on October 1/2. Stop direct CFB borrowing.
- NFL, CFB, UFC Average Fan current-event banks copied the same Bar Trivia questions. Stop borrowing all of them until Average Fan has independent, editorially reviewed events covering *different facts*, not just changed phrasing.
- CFB curated rounds held redundant DeVonta Smith Heisman and CFP first-ranked #1 prompts; retire the weaker repeats.
- CFB Finals included first AP champion, inaugural Rose Bowl opponent, and first Heisman facts already asked by Bar Trivia. Retire their duplicate Average Fan versions.
- CFB player-position, CFB conference, and UFC division subjects generated inverse true/false versions of the same facts already generated as direct questions. Retire those redundant candidate families.

## Anti-regression
The Average Fan test suite now checks against **actual Bar Trivia bank prompts and answers** across NFL/CFB/UFC for exact and high-confidence near-duplicate overlap. The mechanism is conservative: editorial fact-identity tags and human review remain required for subtle semantic repeats.

## Still required before closing Stage 2
- Review each actual selected Average Fan bank question; record keep/rewrite/retire/hold and evidence.
- Screen overlapping Millionaire, Who Am I, and other game content at the *fact* level (not just shared words).
- Validate short-answer aliases and every distractor factually; revisit difficulty ladders, Finals, questions built from event dates, and every generated published board.
- Replace the temporary loss of fresh event content only with independently verified Average Fan material, never borrowed Bar Trivia facts.
