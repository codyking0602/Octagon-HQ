#!/usr/bin/env python3
"""Verify exact nflverse release asset bytes before NFL read-only source triage.

Reads the independently published GitHub asset digests from the separate
metadata check. The same verified parquet bytes become the source rows used
by performance, snap and GSIS/PFR identity monitors. Mismatch FAILS CLOSED.
No canonical authority or checkpoint is touched.
"""
import argparse
import hashlib
import io
import json
from datetime import datetime, timezone
from pathlib import Path

ASSETS = ("production", "snaps", "identityMaster")
MAX_BYTES = {"production": 100_000_000, "snaps": 50_000_000, "identityMaster": 50_000_000}


def verify_frames(publications, get_bytes, write_frames):
    if publications.get("status") != "publisher-assets-recent" or not publications.get("sourcePublisherAssetsFresh"):
        raise ValueError("NFL publisher asset freshness not independently verified")
    sources = publications.get("sources") or {}
    checks = []
    for kind in ASSETS:
        item = sources.get(kind) or {}
        source = item.get("sourceUrl")
        expected_digest = item.get("digestSha256")
        if item.get("publisherAssetCurrent") is not True or \
           not isinstance(source, str) or not source.startswith(
                "https://github.com/nflverse/nflverse-data/releases/download/") or \
           not isinstance(expected_digest, str) or len(expected_digest) != 64:
            raise ValueError("Missing verified release metadata for " + kind)
        data = get_bytes(kind, source)
        if not isinstance(data, bytes) or len(data) > MAX_BYTES[kind] or \
           len(data) != item.get("assetBytes"):
            raise ValueError(kind + " publisher asset byte size mismatch")
        actual = hashlib.sha256(data).hexdigest()
        if actual != expected_digest:
            raise ValueError(kind + " publisher asset digest mismatch")
        # The same bytes used for this verification are consumed by triage.
        write_frames(kind, data)
        checks.append({
            "kind": kind, "sourceUrl": source,
            "sha256": actual, "verifiedByteCount": len(data),
            "publishedAt": item["publisherUpdatedAt"],
            "publishedWithinPolicy": True,
        })
    return {
        "schema": 1, "status": "exact-published-NFL-source-bytes-verified",
        "sourcesVerified": len(checks), "expectedSources": len(ASSETS),
        "verificationChecks": checks,
        "allSourceByteDigestsMatched": len(checks) == len(ASSETS),
        "publicationEvidenceObservedAt": publications.get("observedAt"),
        "observedAt": datetime.now(timezone.utc).isoformat(),
        "abilityGradesChanged": 0, "gmContractsChanged": 0,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--publications", required=True)
    ap.add_argument("--outdir", required=True)
    args = ap.parse_args()
    metadata = json.loads(Path(args.publications).read_text())
    output = Path(args.outdir)
    output.mkdir(parents=True, exist_ok=True)

    from requests import Session
    import polars as pl

    def get_bytes(kind, url):
        with Session() as session:
            response = session.get(url, timeout=(12, 60), allow_redirects=True)
            response.raise_for_status()
            return response.content

    def write_frame(kind, data):
        table = pl.read_parquet(io.BytesIO(data))
        if table.height < 500:
            raise ValueError(kind + " downloaded data too small")
        table.write_json(output / (kind + ".json"))

    result = verify_frames(metadata, get_bytes, write_frame)
    (output / "verification-receipt.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({"status": result["status"],
        "sourceDigestCount": result["sourcesVerified"],
        "rowsWrittenFor": [row["kind"] for row in result["verificationChecks"]]}))


if __name__ == "__main__":
    main()
