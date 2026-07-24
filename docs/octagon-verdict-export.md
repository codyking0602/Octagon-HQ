# Octagon Verdict V2 Export

Octagon Verdict knowledge is generated directly from Octagon HQ V2. V1 is no longer the export owner.

## Source ownership

The exporter reads only the existing V2 owners:

- `src/features/rankings/rankingModel.ts` for calculated ranks, scores, OVRs, profile values, visible stats, and traces;
- `src/features/rankings/data/rankingInputs.ts` for validated canonical UFC fight facts and presentation metadata;
- `src/features/rankings/rankingControls.ts` for calculated division boards;
- `src/features/intelligence/octagonVerdictExport.ts` for packaging and knowledge-document rendering.

Do not manually edit generated output or introduce another ranking, matchup, or profile source.

## Generate locally

```bash
npm install
npm run export:verdict
```

The command rebuilds `artifacts/octagon-verdict/` from scratch.

Generated outputs:

- `octagon-verdict-data.json` — complete structured feed;
- `index.json` — compact retrieval index;
- `octagon-verdict-knowledge.md` — upload-ready Custom GPT knowledge document;
- `fighters/<slug>.json` — one file per ranked fighter;
- `matchups/<pair-key>.json` — one file per real matchup between ranked fighters.

`artifacts/` is ignored by Git. Generated files are outputs, never source files.

## GitHub artifact workflow

`.github/workflows/export-octagon-verdict.yml` runs:

- on relevant pull requests;
- whenever relevant exporter or ranking ownership changes reach `main`;
- manually through **Actions → Export Octagon Verdict V2 Package → Run workflow**.

The workflow validates the package and uploads an artifact named `octagon-verdict-v2-package`.

## Update Octagon Verdict

1. Run the exporter from current `main`, or download the latest successful `octagon-verdict-v2-package` artifact from GitHub Actions.
2. Extract the package.
3. In the Octagon Verdict Custom GPT editor, replace the previous knowledge upload with `octagon-verdict-knowledge.md`.
4. Save the GPT.
5. Test at least one current ranking question, one division-only question, and one direct-fight matchup whose head-to-head result conflicts with the GOAT ranking.

The upload remains a manual, zero-API-cost step. The package itself is reproducible from V2.

## Direct-fight rules

Direct matchups are derived from validated canonical UFC fight facts for ranked fighters. Reciprocal fighter records are reconciled by fighter pair and fight date, so different method labels cannot create duplicate fights.

Head-to-head results are context only. They never override the UFC-only GOAT verdict produced by the higher current `totalScore`.

## Required validation

A valid package must have:

- 80 unique fighters: 65 men and 15 women;
- passing calculated division boards;
- one fighter file per fighter;
- one matchup file per derived direct matchup;
- no duplicate fight dates inside a matchup ledger;
- current rank, OVR, score, and category values matching `rankingModel.ts`;
- `doesNotOverrideVerdict: true` on every direct matchup.
