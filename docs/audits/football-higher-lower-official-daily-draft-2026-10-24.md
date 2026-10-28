# Football Higher or Lower — official Daily staging

Baseline: main fb6c9ce1c78a09170c707758b275ca621ee0c25c (October 24, 2026).

## Work completed on isolated draft
- Reuse the existing Football Higher or Lower curated 10-question comparison model. MIXED mode is five NFL and five CFB with three approachable, five competitive and two tough comparisons. The existing recognizability, statistic identity, modernity, and subject uniqueness gates remain intact.
- Provide deterministic server-owned daily publication, submission advancement and a football-branded official game / completed-result view.
- No answer or hidden numerical value is included in a client-visible unanswered question.
- Reuse the existing canonical SQL grader for higher_lower, which independently matches all ten question IDs to protected correct-choice evidence, computes normalized score out of 100, and exposes results only through the established completed Daily leaderboard gate.
- Preserve NFL/CFB branding from the established Casual game rather than duplicating its stat dataset.

## Release boundary and remaining acceptance gates
This **does not activate any Football Daily slot** or alter the 27-slot production Football rotation. The approved future **2x Higher or Lower weight** must be integrated as part of the coordinated Football / UFC / Basketball calendar rewrite and tested against six months of actual dates. Historical results, UFC Feud V2, and NBA owner-only release controls are untouched.

Before going live: confirm exact-head CI / TypeScript / build, evaluate at least thirteen concrete dated Football higher-lower boards for question-family and pair collisions, verify current backend migrations / authorized leaderboard privacy, and review actual mobile presentation. No merge or deployment without owner approval.
