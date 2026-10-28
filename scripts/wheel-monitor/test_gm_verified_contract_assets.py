#!/usr/bin/env python3
"""Fail-closed GM exact-byte and publisher proof regression."""
import hashlib
import importlib.util
import unittest
from datetime import datetime, timezone, timedelta
from pathlib import Path

PATH = Path(__file__).with_name("gm-verified-contract-assets.py")
spec = importlib.util.spec_from_file_location("gm_contract_attestation", PATH)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class GmContractAttestationTest(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 10, 26, 12, tzinfo=timezone.utc)
        self.data = b"source-file-fixture" * 70
        self.p = {
            "status": "provider-release-recent-loader-unbound",
            "sourcePublicationCurrent": True,
            "datasetUrl": mod.URL, "assetBytes": len(self.data),
            "assetSha256": hashlib.sha256(self.data).hexdigest(),
            "observedAt": (self.now - timedelta(minutes=5)).isoformat(),
            "providerPublishedAt": (self.now - timedelta(days=1)).isoformat(),
        }

    def test_published_bytes_proven_before_generator(self):
        result = mod.attest_contract_asset(self.p, self.data, self.now)
        self.assertEqual(result["status"], "exact-published-GM-contract-bytes-verified")
        self.assertFalse(result["sourceIdentityCompletenessCertified"])
        self.assertFalse(result["usedByGmGenerator"])
        self.assertEqual(result["contractsChanged"], 0)

    def test_corrupted_bytes_fail(self):
        with self.assertRaisesRegex(ValueError, "SHA-256"):
            mod.attest_contract_asset(self.p, b"X" + self.data[1:], self.now)

    def test_truncated_bytes_fail(self):
        with self.assertRaisesRegex(ValueError, "byte length"):
            mod.attest_contract_asset(self.p, self.data[:-1], self.now)

    def test_stale_and_failed_publication_fail(self):
        for patch in (
            {"sourcePublicationCurrent": False},
            {"status": "provider-release-stale"},
            {"observedAt": (self.now - timedelta(hours=2)).isoformat()},
            {"observedAt": (self.now + timedelta(hours=1)).isoformat()},
        ):
            with self.subTest(patch=patch), self.assertRaises(ValueError):
                mod.attest_contract_asset({**self.p, **patch}, self.data, self.now)

    def test_redirected_source_or_invalid_digest_fail(self):
        for patch in (
            {"datasetUrl": "https://example.com/different.parquet"},
            {"assetSha256": "e" * 64},
            {"assetSha256": ""},
            {"assetBytes": 10},
        ):
            with self.subTest(patch=patch), self.assertRaises(ValueError):
                mod.attest_contract_asset({**self.p, **patch}, self.data, self.now)

if __name__ == "__main__":
    unittest.main()
