# NBA Average Fan — four-month readiness review

**October 22, 2026 — FOR OWNER REVIEW. DO NOT MERGE UNTIL APPROVED.**

## Scope and inventory

The owner-only NBA Average Fan preview now has a curated **180-question bank**: 40 Grade 2, 40 Grade 3, 40 Grade 4, 40 Grade 5, and 20 protected Finals. This is **59 additions** over the previous 121-question bank, providing **20 full nine-question runs** (five games per month for four months). Grades 2–5 use two questions each; Finals use one.

Difficulty intent: accessible Grade 2; broad-fan Grade 3; substantial NBA knowledge Grade 4; genuinely demanding but recognizable Grade 5 and Finals. Historical moments, distinct franchise history, and real basketball strategies take priority over dry award-list trivia.

## Cross-game factual and editorial audit

- Compared the completed bank against 240 locked NBA Millionaire facts using automated prompt and same-answer/wording overlap detection: no identified collisions.
- Inspected Sports Feud question families and authored Who Am I identity scripts. Removed/replaced direct overlaps including David Robinson's quadruple-double, the Malice at the Palace, Ron Artest's 2010 Finals clutch three, Klay Thompson's 2016 11-threes, and the 2016 Cavaliers Finals win. Subtle semantic overlap can never be entirely ruled out by automated text checks.
- Confirmed significant postseason facts with NBA.com game reports, season history, team features; tactics with NBA film study, and rules with NBA's official rulebook.
- Four different choices, a correct canonical answer, and an explanation for each new item. Mobile-length options are kept within the existing fixed studio layout. No CSS or visual design changes.

## No-repeat owner-preview rotation

- A **20-game no-repeat cycle**, including mixtures of Casual and Daily-style preview, uses only local browser storage. Save consumed question IDs, schema version, and short day-to-board snapshots; **never save guesses, scores, results, analytics, or official NBA Daily progress**.
- Reserve two unused questions per grade plus one unused protected Final when the owner chooses a fan and actually starts playing. Each 40-question grade has 20 pairs and the 20-Final pool has 20 selections. Recycle a pool only after exhausting it.
- Repeated same-date Daily preview loads the exact same questions without consuming more. New dates claim fresh rounds. Local storage is browser-specific; switching devices or clearing site data resets the rotation.
- Try to avoid overlapping named topics within the same board and balance subjects across picks. This is scoped to NBA owner preview only; other sports retain their current behavior.

## Handoff — do not merge yet

Run full Validate V2 on the **exact current PR head**: all shards, production build, typecheck, mobile-layout checks, same-day preview determinism, cross-game guards, and 20-run no-repeat simulation. Return the green PR, exact audit findings, and any caveats for owner approval. Do not merge or deploy until specifically told to.
