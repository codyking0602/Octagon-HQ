# Exact final Auction production certification

- Target main SHA: `313da4481a50c21a92531df726dbf225e69afa5c`
- Workflow state: `failed`
- Live deployment marker: `313da4481a50c21a92531df726dbf225e69afa5c`
- Independent live verifier exit: `0`
- Full Auction proof artifact present: `True`

| Workflow | Run | Conclusion | Head SHA |
|---|---:|---|---|
| Deploy Cloudflare Frontend | 30868824618 | success | `313da4481a50c21a92531df726dbf225e69afa5c` |
| Verify Live Frontend Delivery | 30868911476 | success | `313da4481a50c21a92531df726dbf225e69afa5c` |
| Verify Live Notification Flow | 30868924701 | failure | `313da4481a50c21a92531df726dbf225e69afa5c` |

## Jobs and artifacts

- **Deploy Cloudflare Frontend jobs:** resolve-public-config (ID 91866343324, success), build-production-artifact (ID 91866366785, success), deploy-production-artifact (ID 91866462872, success)
- **Deploy Cloudflare Frontend artifacts:** octagon-frontend-313da4481a50c21a92531df726dbf225e69afa5c (ID 8877116889), octagon-public-config-30868824618 (ID 8877106117)
- **Verify Live Frontend Delivery jobs:** verify-live-delivery (ID 91866599460, success)
- **Verify Live Frontend Delivery artifacts:** none
- **Verify Live Notification Flow jobs:** verify-live-notification (ID 91866641200, failure)
- **Verify Live Notification Flow artifacts:** live-auction-release-proof-313da4481a50c21a92531df726dbf225e69afa5c (ID 8877403370), live-notification-proof (ID 8877170740)

## Focused proof logs

### Deploy Cloudflare Frontend

```text
2026-08-04T01:29:16.9469457Z Live frontend delivery verification attempt 1 failed: Live deployment marker is b68384af0d7f2d4ebb131d414e50c974f76f1fc4, expected 313da4481a50c21a92531df726dbf225e69afa5c.
2026-08-04T01:29:22.0177334Z Live frontend delivery verification attempt 2 failed: Live deployment marker is b68384af0d7f2d4ebb131d414e50c974f76f1fc4, expected 313da4481a50c21a92531df726dbf225e69afa5c.
2026-08-04T01:29:27.0825525Z Live frontend delivery verification attempt 3 failed: Live deployment marker is b68384af0d7f2d4ebb131d414e50c974f76f1fc4, expected 313da4481a50c21a92531df726dbf225e69afa5c.
2026-08-04T01:29:32.4204378Z PASS: live shell loads deployment 313da4481a50c21a92531df726dbf225e69afa5c through 3 JavaScript and 1 CSS assets.
2026-08-04T01:29:32.4333657Z [36;1m  echo "- Exact live deployment marker and shell-loaded JavaScript and CSS were verified"[0m
2026-08-04T01:29:16.9469403Z Live frontend delivery verification attempt 1 failed: Live deployment marker is b68384af0d7f2d4ebb131d414e50c974f76f1fc4, expected 313da4481a50c21a92531df726dbf225e69afa5c.
2026-08-04T01:29:22.0177296Z Live frontend delivery verification attempt 2 failed: Live deployment marker is b68384af0d7f2d4ebb131d414e50c974f76f1fc4, expected 313da4481a50c21a92531df726dbf225e69afa5c.
2026-08-04T01:29:27.0825479Z Live frontend delivery verification attempt 3 failed: Live deployment marker is b68384af0d7f2d4ebb131d414e50c974f76f1fc4, expected 313da4481a50c21a92531df726dbf225e69afa5c.
2026-08-04T01:29:32.4204337Z PASS: live shell loads deployment 313da4481a50c21a92531df726dbf225e69afa5c through 3 JavaScript and 1 CSS assets.
2026-08-04T01:29:32.4333649Z [36;1m  echo "- Exact live deployment marker and shell-loaded JavaScript and CSS were verified"[0m
2026-08-04T01:28:35.2973470Z [36;1m  throw new Error(`Expected deployment marker ${expectedSha}, received ${marker.sha}`);[0m
2026-08-04T01:28:35.2973467Z [36;1m  throw new Error(`Expected deployment marker ${expectedSha}, received ${marker.sha}`);[0m
```

### Verify Live Frontend Delivery

```text
2026-08-04T01:29:50.1208871Z PASS: live shell loads deployment 313da4481a50c21a92531df726dbf225e69afa5c through 3 JavaScript and 1 CSS assets.
2026-08-04T01:29:50.1291767Z [36;1m  echo "- Live deployment marker matches the exact source SHA"[0m
2026-08-04T01:29:50.1208832Z PASS: live shell loads deployment 313da4481a50c21a92531df726dbf225e69afa5c through 3 JavaScript and 1 CSS assets.
2026-08-04T01:29:50.1291762Z [36;1m  echo "- Live deployment marker matches the exact source SHA"[0m
```

### Verify Live Notification Flow

```text
2026-08-04T01:43:56.9031479Z   name: live-auction-release-proof-313da4481a50c21a92531df726dbf225e69afa5c
2026-08-04T01:43:57.9542182Z Artifact live-auction-release-proof-313da4481a50c21a92531df726dbf225e69afa5c.zip successfully finalized. Artifact ID 8877403370
2026-08-04T01:43:57.9543273Z Artifact live-auction-release-proof-313da4481a50c21a92531df726dbf225e69afa5c has been successfully uploaded! Final size is 436 bytes. Artifact ID is 8877403370
2026-08-04T01:43:56.9031477Z   name: live-auction-release-proof-313da4481a50c21a92531df726dbf225e69afa5c
2026-08-04T01:43:57.9542151Z Artifact live-auction-release-proof-313da4481a50c21a92531df726dbf225e69afa5c.zip successfully finalized. Artifact ID 8877403370
2026-08-04T01:43:57.9543236Z Artifact live-auction-release-proof-313da4481a50c21a92531df726dbf225e69afa5c has been successfully uploaded! Final size is 436 bytes. Artifact ID is 8877403370
```

## Independent live delivery

```text
PASS: live shell loads deployment 313da4481a50c21a92531df726dbf225e69afa5c through 3 JavaScript and 1 CSS assets.
```

## Certification

FAIL
