#!/usr/bin/env python3
"""Decrypt a sealed V1 export and submit it through one atomic database RPC."""
from __future__ import annotations

import base64
import hashlib
import json
import os
from pathlib import Path
from typing import Any

EXPECTED_MEMBERS = {"BROCK", "CODY", "RHONDA", "SHANE", "TONY", "TYLER"}


def load_payload(path: Path, private_key_b64: str) -> tuple[dict[str, Any], str]:
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import x25519
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.kdf.hkdf import HKDF

    envelope = json.loads(path.read_text(encoding="utf-8"))
    if envelope.get("version") != 1:
        raise RuntimeError("Unsupported encrypted import envelope version.")
    private_key = x25519.X25519PrivateKey.from_private_bytes(base64.b64decode(private_key_b64))
    public_key = x25519.X25519PublicKey.from_public_bytes(base64.b64decode(envelope["ephemeralPublicKey"]))
    key = HKDF(algorithm=hashes.SHA256(), length=32, salt=None, info=b"octagon-v1-v2-import").derive(
        private_key.exchange(public_key)
    )
    plaintext = AESGCM(key).decrypt(
        base64.b64decode(envelope["nonce"]),
        base64.b64decode(envelope["ciphertext"]),
        base64.b64decode(envelope["aad"]),
    )
    payload = json.loads(plaintext)
    validate_payload_boundary(payload)
    return payload, hashlib.sha256(plaintext).hexdigest()


def validate_payload_boundary(payload: dict[str, Any]) -> None:
    if payload.get("schemaVersion") != 1:
        raise RuntimeError("Unsupported V1 payload schema.")
    if payload.get("cutoff") != "2026-07-25T00:00:00.000Z":
        raise RuntimeError("V1 payload cutoff does not match the protected boundary.")
    if payload.get("rules", {}).get("canonicalSixMemberGroupOnly") is not True:
        raise RuntimeError("V1 payload does not prove the canonical six-member group boundary.")
    if not payload.get("sourceGroupFingerprint"):
        raise RuntimeError("V1 payload source-group fingerprint is missing.")
    names = [str(profile.get("normalizedName", "")).strip().upper() for profile in payload.get("profiles", [])]
    if len(names) != 6 or len(set(names)) != 6 or set(names) != EXPECTED_MEMBERS:
        raise RuntimeError("V1 payload canonical profile set is invalid.")


def atomic_import(url: str, service_key: str, payload: dict[str, Any]) -> dict[str, Any]:
    """One HTTP call invokes one PostgreSQL transaction; no table mutations occur here."""
    import requests

    response = requests.post(
        f"{url.rstrip('/')}/rest/v1/rpc/import_v1_history_atomic_reconciled",
        headers={
            "apikey": service_key,
            "authorization": f"Bearer {service_key}",
            "content-type": "application/json",
        },
        json={"p_payload": payload},
        timeout=120,
    )
    if not response.ok:
        detail = response.text.replace("\n", " ")[:400]
        raise RuntimeError(f"Atomic V1 history import rolled back ({response.status_code}): {detail}")
    report = response.json()
    if report.get("recordScoringRules", {}).get("missingSelectionCountsAsLoss") is not False:
        raise RuntimeError("Reconciliation did not preserve missing Picks separately from losses.")
    if report.get("recordScoringRules", {}).get("predeterminedRecordExpected") is not False:
        raise RuntimeError("Reconciliation unexpectedly requires a predetermined Picks record.")
    return report


def main() -> None:
    envelope = Path(os.environ["V1_IMPORT_ENVELOPE"])
    report_path = Path(os.environ.get("V1_IMPORT_REPORT", "/tmp/v1-import-report.json"))
    payload, checksum = load_payload(envelope, os.environ["V2_IMPORT_PRIVATE_KEY"])
    report = atomic_import(os.environ["V2_SUPABASE_URL"], os.environ["V2_SERVICE_ROLE_KEY"], payload)
    report["payloadChecksum"] = checksum
    report_path.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"status": "success", "payloadChecksum": checksum, "changes": report["changes"]}))


if __name__ == "__main__":
    main()
