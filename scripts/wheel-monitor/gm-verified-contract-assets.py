#!/usr/bin/env python3
"""Read-only GM contract release asset byte attestation; never updates authority."""
import argparse
import hashlib
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

URL = "https://github.com/nflverse/nflverse-data/releases/download/contracts/historical_contracts.parquet"
MAX_BYTES = 50_000_000

def attest_contract_asset(provenance, data, now=None):
    now = now or datetime.now(timezone.utc)
    if provenance.get("status") != "provider-release-recent-loader-unbound" or (
        provenance.get("sourcePublicationCurrent") is not True
    ):
        raise ValueError("GM contract publisher metadata is missing, stale, or not certified")
    if provenance.get("datasetUrl") != URL:
        raise ValueError("Unrecognized GM contract publisher URL")
    stamp = provenance.get("observedAt")
    try:
        observed = datetime.fromisoformat(stamp.replace("Z", "+00:00"))
        if observed.utcoffset() is None:
            raise ValueError("Naive observation timestamp")
        seconds = (now - observed).total_seconds()
        if not -120 <= seconds <= 3600:
            raise ValueError("Provider metadata is stale or from the future")
    except (TypeError, AttributeError) as error:
        raise ValueError("Invalid provider metadata timestamp") from error
    expected = str(provenance.get("assetSha256") or "")
    size = provenance.get("assetBytes")
    if not re.fullmatch(r"[0-9a-f]{64}", expected) or (
        not isinstance(size, int) or isinstance(size, bool) or size < 1000 or size > MAX_BYTES
    ):
        raise ValueError("Missing validated provider digest or byte size")
    if not isinstance(data, bytes) or len(data) != size:
        raise ValueError("GM contract source byte length differs from publisher")
    actual = hashlib.sha256(data).hexdigest()
    if actual != expected:
        raise ValueError("GM contract source SHA-256 differs from publisher")
    return {
        "schema": 1, "status": "exact-published-GM-contract-bytes-verified",
        "sourceUrl": URL, "publisherUpdatedAt": provenance.get("providerPublishedAt"),
        "publisherObservedAt": stamp, "verifiedAt": now.isoformat(),
        "assetSha256": actual, "assetBytes": len(data),
        "usedByGmGenerator": False,
        "sourceIdentityCompletenessCertified": False,
        "contractsChanged": 0, "gradesChanged": 0,
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--provenance", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--receipt", required=True)
    args = parser.parse_args()
    provenance = json.loads(Path(args.provenance).read_text())
    expected_size = provenance.get("assetBytes")
    if not isinstance(expected_size, int) or expected_size > MAX_BYTES or expected_size < 1000:
        raise ValueError("GM published contract asset has invalid advertised size")
    request = urllib.request.Request(URL, headers={"User-Agent": "Octagon-HQ-GM-evidence/1"})
    with urllib.request.urlopen(request, timeout=75) as response:
        content = response.read(expected_size + 1)
    receipt = attest_contract_asset(provenance, content)
    output = Path(args.out)
    output.parent.mkdir(parents=True, exist_ok=True)
    temp = output.with_suffix(output.suffix + ".verified-tmp")
    temp.write_bytes(content)
    temp.replace(output)
    receipt["usedByGmGenerator"] = True
    path = Path(args.receipt)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps({"status": receipt["status"],
                      "verifiedBytes": receipt["assetBytes"],
                      "sourceDigestMatches": True, "contractsChanged": 0}))

if __name__ == "__main__":
    main()
