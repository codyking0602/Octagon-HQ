# UFC fight-week poster monitor (approved publisher only)

The UFC **Picks** event hero uses the real horizontal MMA Mania poster archive; it must **not** reintroduce the poster as a top-level UFC HQ Home feature. Never generate fighters, posters or stadium art.

## Timing and approval

- The existing **UFC Picks Prep** daily 5:00 AM America/Chicago automation is the single owner for MMA Mania poster discovery and future `src/features/picks/ufcMmaManiaPoster.ts` catalog entries. Do not add a second competing poster publisher.
- During the preceding Monday's run, check the MMA Mania UFC Posters archive for a current poster depicting the **correct** upcoming Saturday UFC event. Recheck each daily run if the publisher has not yet released one. Do not reuse a poster from a different event; if no qualifying photo exists, leave it absent.
- Use the image as published and link its original MMA Mania article. The direct image must be hosted on `platform.mmamania.com` and the article on `www.mmamania.com`. Verify the real image, fighter identity, event date and horizontal composition. Avoid fan art and third-party substitutes.
- Add one event-specific approved catalog entry with `source`, `src`, measured `aspectRatio`, both headliner surnames, `eventStartsAt`, and a start/expiry window. For **new** entries, `activeAt` is Tuesday 12:00 AM `America/Chicago` (converted to correct offset-aware ISO) and `expiresAt` follows the completed event. The existing approved Edmonton Monday exception is historical only.
- Create a focused PR from fresh main, require exactly the resulting head SHA to pass all required CI and production deployment validation; merge and verify production. Never silently update the catalog in a failed/unverified run.
- A Tuesday-midnight switch is possible only when MMA Mania has already released the authentic image, and the PR is verified and merged before midnight. When no image exists at the deadline, fail closed; the daily monitor may add the correct poster once it is available, but must never promise or fabricate one.

Football CFB/NFL poster sourcing remains **SeatGeek** using the separately guarded football weekly content/asset pipeline, with owner selection of five proposals per category and a server-owned Tuesday-midnight gate.
