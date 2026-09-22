# UFC Picks Prep

UFC Prep is a pre-staging package for the next UFC Picks event. It does **not** stage or publish Picks.

## Locked card scope

- Fight Night: main card only.
- Numbered UFC event: main card + prelims.
- Early prelims are never included.
- UFC.com is the canonical staging importer, but Monday prep must cross-check the card against at least one independent current card source and betting-odds availability.
- Missing/disappearing odds are a warning signal, not proof that a fight changed.

## Fighter asset contract

Real fighter photography only. Do not generate UFC fighter images.

For every fighter included in Picks:

- `public/assets/fighters/<fighter-slug>-thumb.webp`

For every fighter on the main card:

- `public/assets/fighters/<fighter-slug>-spotlight.webp`

Both asset types must be true transparent WebP cutouts with an alpha channel. **Thumbs are tight, face-dominant head-and-shoulders/bust portraits and may come only from official UFC or ESPN imagery. If neither UFC nor ESPN has an acceptable thumb yet, leave the thumb missing/blank. Never derive a thumb from a Spotlight image or use third-party photos, random cutouts, posters, social images, Getty-style images, or generated/recreated imagery.** Spotlights may use the larger three-quarter/full fighter presentation and keep their existing separately reviewed source treatment. For approved UFC/ESPN thumb imagery with a background, background removal is allowed; do not synthesize, redraw, restyle, or alter the fighter. After background removal, only crop/resize/center and lightly sharpen. Never bake a white, arena, cage, or other source background into the canonical asset. Existing matching transparent UFC/ESPN thumb assets should be reused.

## Editorial contract

Prepare a full Fight Spotlight package for every main-card fight:

- concise researched Fight Preview
- Tale of the Tape: record, age, height, reach, stance
- up to three meaningful matchup edges for each fighter
- optional Watch Spotlight URLs

The main-event package is automatically attached when the verified card is staged. Other prepared main-card packages remain one-tap choices inside Event Setup.

The stored Spotlight `source` remains `UFCStats` because UFCStats is the canonical structured Tale-of-the-Tape/stat source. Preview and edge copy must still be researched/editorially reviewed and must not be generated from raw stat deltas alone.

## Prep package storage

The Monday task upserts one row into `public.ufc_pick_prep_packages`, keyed by `source_event_key`.

The JSON payload must contain:

- `verification_notes: string[]`
- `bouts[]`
  - `bout_id`
  - `position`
  - `section`: `main-event | main | prelim`
  - `weight_class`
  - red/blue fighter slugs and names
- `spotlights[]`: canonical staged Spotlight objects for main-card fights
- `assets[]`
  - fighter slug/name
  - `thumb_ready`
  - `spotlight_ready`
  - final repo asset paths

Top-level row fields own event identity, scope, start time, status, and timestamps.

Status meanings:

- `ready`: card sources agree enough to prepare safely and all required main-event assets/editorial are ready.
- `review-needed`: prep is usable but at least one card/odds/asset signal deserves owner review.
- `blocked`: event identity or card scope cannot be established safely.

## Staging behavior

When a prep package exists, Event Setup does not stage on the first click.

1. Fetch a fresh UFC.com preview through the existing `sync-next-ufc-event` owner.
2. Compare the fresh selected card against the prepared card.
3. Show added/removed/order/source drift before staging.
4. Owner stages the freshly verified card.
5. If the prepared main event still matches exactly, attach its prepared Spotlight automatically.
6. Never auto-publish.

After staging, the existing Picks monitoring system remains the live change owner.
