# Auction PR 6 release audit

- Target merge SHA: `b68384af0d7f2d4ebb131d414e50c974f76f1fc4`
- Workflow chain ready: `0`
- Workflow chain failed: `1`
- Live deployment marker: `b68384af0d7f2d4ebb131d414e50c974f76f1fc4`
- Independent live frontend verifier exit: `0`

## Exact workflow runs

| Workflow | Run | Event | Status | Conclusion | Head SHA |
|---|---:|---|---|---|---|
| Deploy Supabase Backend | 30866730716 | push | completed | success | `b68384af0d7f2d4ebb131d414e50c974f76f1fc4` |
| Deploy Cloudflare Frontend | 30866730695 | push | completed | success | `b68384af0d7f2d4ebb131d414e50c974f76f1fc4` |
| Verify Live Frontend Delivery | 30866804116 | workflow_run | completed | success | `b68384af0d7f2d4ebb131d414e50c974f76f1fc4` |
| Verify Live Notification Flow | 30866815358 | workflow_run | completed | failure | `b68384af0d7f2d4ebb131d414e50c974f76f1fc4` |

## Artifacts

- **Deploy Cloudflare Frontend:** `octagon-frontend-b68384af0d7f2d4ebb131d414e50c974f76f1fc4` (ID 8876380912), `octagon-public-config-30866730695` (ID 8876371448)
- **Deploy Supabase Backend:** none
- **Verify Live Frontend Delivery:** none
- **Verify Live Notification Flow:** `live-auction-release-proof-b68384af0d7f2d4ebb131d414e50c974f76f1fc4` (ID 8876422233), `live-notification-proof` (ID 8876419887)

## Focused log evidence

### Deploy Cloudflare Frontend

```text
2026-08-04T00:49:34.9406780Z Live frontend delivery verification attempt 1 failed: Live deployment marker is d580c20124d3d269829af693efde382622fb88ba, expected b68384af0d7f2d4ebb131d414e50c974f76f1fc4.
2026-08-04T00:49:40.2413488Z PASS: live shell loads deployment b68384af0d7f2d4ebb131d414e50c974f76f1fc4 through 3 JavaScript and 1 CSS assets.
2026-08-04T00:49:40.2520643Z [36;1m  echo "- Exact live deployment marker and shell-loaded JavaScript and CSS were verified"[0m
2026-08-04T00:49:34.9406729Z Live frontend delivery verification attempt 1 failed: Live deployment marker is d580c20124d3d269829af693efde382622fb88ba, expected b68384af0d7f2d4ebb131d414e50c974f76f1fc4.
2026-08-04T00:49:40.2413447Z PASS: live shell loads deployment b68384af0d7f2d4ebb131d414e50c974f76f1fc4 through 3 JavaScript and 1 CSS assets.
2026-08-04T00:49:40.2520640Z [36;1m  echo "- Exact live deployment marker and shell-loaded JavaScript and CSS were verified"[0m
2026-08-04T00:48:55.9469245Z [36;1m  throw new Error(`Expected deployment marker ${expectedSha}, received ${marker.sha}`);[0m
2026-08-04T00:48:55.9469241Z [36;1m  throw new Error(`Expected deployment marker ${expectedSha}, received ${marker.sha}`);[0m
```

### Deploy Supabase Backend

```text
2026-08-04T00:48:33.8770229Z [36;1mecho "Exact deployment source verified: $checked_out_sha"[0m
2026-08-04T00:48:33.8933981Z Exact deployment source verified: b68384af0d7f2d4ebb131d414e50c974f76f1fc4
2026-08-04T00:48:43.3324068Z  • [1m202609030001_auction_notifications_share_release.sql[22m
2026-08-04T00:48:43.8448820Z Applying migration 202609030001_auction_notifications_share_release.sql...
2026-08-04T00:49:09.7345788Z [36;1mif [ -f supabase/migrations/202609030001_auction_notifications_share_release.sql ]; then[0m
2026-08-04T00:49:09.7346267Z [36;1m  require_remote_migration "202609030001"[0m
2026-08-04T00:49:11.4793679Z    `202609030001` | `202609030001` | `202609030001` 
2026-08-04T00:49:36.8160150Z [36;1m  if [ -f supabase/migrations/202609030001_auction_notifications_share_release.sql ]; then[0m
2026-08-04T00:49:36.8161651Z [36;1m    echo "- Auction notification, push-eligibility, and completed-share migration 202609030001 verified in linked production history"[0m
2026-08-04T00:48:33.8770225Z [36;1mecho "Exact deployment source verified: $checked_out_sha"[0m
2026-08-04T00:48:33.8933906Z Exact deployment source verified: b68384af0d7f2d4ebb131d414e50c974f76f1fc4
2026-08-04T00:48:43.3324029Z  • [1m202609030001_auction_notifications_share_release.sql[22m
2026-08-04T00:48:43.8448681Z Applying migration 202609030001_auction_notifications_share_release.sql...
2026-08-04T00:49:09.7345786Z [36;1mif [ -f supabase/migrations/202609030001_auction_notifications_share_release.sql ]; then[0m
2026-08-04T00:49:09.7346259Z [36;1m  require_remote_migration "202609030001"[0m
2026-08-04T00:49:11.4793677Z    `202609030001` | `202609030001` | `202609030001` 
2026-08-04T00:49:36.8160141Z [36;1m  if [ -f supabase/migrations/202609030001_auction_notifications_share_release.sql ]; then[0m
2026-08-04T00:49:36.8161639Z [36;1m    echo "- Auction notification, push-eligibility, and completed-share migration 202609030001 verified in linked production history"[0m
```

### Verify Live Frontend Delivery

```text
2026-08-04T00:49:56.4923927Z PASS: live shell loads deployment b68384af0d7f2d4ebb131d414e50c974f76f1fc4 through 3 JavaScript and 1 CSS assets.
2026-08-04T00:49:56.5004264Z [36;1m  echo "- Live deployment marker matches the exact source SHA"[0m
2026-08-04T00:49:56.4923865Z PASS: live shell loads deployment b68384af0d7f2d4ebb131d414e50c974f76f1fc4 through 3 JavaScript and 1 CSS assets.
2026-08-04T00:49:56.5004260Z [36;1m  echo "- Live deployment marker matches the exact source SHA"[0m
```

### Verify Live Notification Flow

```text
2026-08-04T00:51:11.3684333Z   name: live-auction-release-proof-b68384af0d7f2d4ebb131d414e50c974f76f1fc4
2026-08-04T00:51:11.9144312Z Artifact live-auction-release-proof-b68384af0d7f2d4ebb131d414e50c974f76f1fc4.zip successfully finalized. Artifact ID 8876422233
2026-08-04T00:51:11.9146116Z Artifact live-auction-release-proof-b68384af0d7f2d4ebb131d414e50c974f76f1fc4 has been successfully uploaded! Final size is 816 bytes. Artifact ID is 8876422233
2026-08-04T00:51:11.3684330Z   name: live-auction-release-proof-b68384af0d7f2d4ebb131d414e50c974f76f1fc4
2026-08-04T00:51:11.9144271Z Artifact live-auction-release-proof-b68384af0d7f2d4ebb131d414e50c974f76f1fc4.zip successfully finalized. Artifact ID 8876422233
2026-08-04T00:51:11.9146084Z Artifact live-auction-release-proof-b68384af0d7f2d4ebb131d414e50c974f76f1fc4 has been successfully uploaded! Final size is 816 bytes. Artifact ID is 8876422233
```

## Independent live delivery

```text
PASS: live shell loads deployment b68384af0d7f2d4ebb131d414e50c974f76f1fc4 through 3 JavaScript and 1 CSS assets.
```

## Result

FAIL
