# UFC media retry policy

Never treat failed visual review as a passing asset. Record exact official source URL and rejection reason. Retry with a changed verified source or an updated image processor, and validate the exact resulting head before publication.

## October 29 reviewed rejections

- Gabriel Bonfim, official ESPN MMA ID 4921516: multiple real cutout renders left rectangular gray, red, pink or orange publisher backgrounds; **not visually approved**. Preserve as pending and do not retry the same URL against an unchanged processor.
- Sean Brady, official ESPN MMA ID 4295192: colored/publisher background remnants failed review. Brady also withdrew from the November 7 card on October 29; do not publish the stale Bonfim–Brady media.
- Neither image was authorized for production. A successful processor exit or 320×320 alpha check is not visual approval. Recheck when a new verified UFC event-results headshot, distinct official ESPN source, or meaningful segmentation fix becomes available.


## October 31 — transparent-original thumbnail policy

- A clean ESPN or UFC original is **passed straight through to lossless resize and placement**; never send thumb portraits through rembg or publisher-strip erasers. The prior attempts at cleaning publisher rectangles caused or retained visible artifacts and must not recur.
- A PNG can have an alpha channel but still contain colored publisher bands. Verify the actual original pixels and finished WebP. If either shows blocks, reject and try a *different, separately verified* ESPN MMA headshot or UFC event-results headshot using the existing `fallback_sources` manifest support. Do not mark as ready based on exit code, alpha extrema, or dimensions alone.
- Rejected candidates are validated entirely in memory and cannot leave generated files in the working tree. One failed candidate may not prevent attempting an alternate or accidentally get committed with another fighter's successful image.
- Main-event Spotlight images remain a separate 626×800 media type; no thumbnail can substitute for either.
