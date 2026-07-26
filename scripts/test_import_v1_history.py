import importlib.util
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import Mock, patch


SPEC = importlib.util.spec_from_file_location("import_v1_history", Path(__file__).with_name("import-v1-history.py"))
IMPORTER = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(IMPORTER)


class AtomicClientTests(unittest.TestCase):
    def test_submits_payload_with_one_reconciled_atomic_rpc_and_returns_report(self):
        response = Mock(ok=True)
        response.json.return_value = {
            "changes": {"eventsInserted": 2},
            "recordScoringRules": {
                "missingSelectionCountsAsLoss": False,
                "predeterminedRecordExpected": False,
            },
        }
        requests = types.SimpleNamespace(post=Mock(return_value=response))
        with patch.dict(sys.modules, {"requests": requests}):
            report = IMPORTER.atomic_import("https://example.supabase.co", "secret", {"schemaVersion": 1})
        self.assertEqual(report["changes"]["eventsInserted"], 2)
        requests.post.assert_called_once()
        args, kwargs = requests.post.call_args
        self.assertTrue(args[0].endswith("/rest/v1/rpc/import_v1_history_atomic_reconciled"))
        self.assertEqual(kwargs["json"], {"p_payload": {"schemaVersion": 1}})

    def test_rpc_failure_reports_transaction_rollback_without_retry(self):
        response = Mock(ok=False, status_code=409, text="existing historical pick conflict")
        requests = types.SimpleNamespace(post=Mock(return_value=response))
        with patch.dict(sys.modules, {"requests": requests}), self.assertRaisesRegex(RuntimeError, "rolled back"):
            IMPORTER.atomic_import("https://example.supabase.co", "secret", {})
        requests.post.assert_called_once()

    def test_rejects_report_that_counts_missing_picks_as_losses(self):
        response = Mock(ok=True)
        response.json.return_value = {
            "changes": {},
            "recordScoringRules": {
                "missingSelectionCountsAsLoss": True,
                "predeterminedRecordExpected": False,
            },
        }
        requests = types.SimpleNamespace(post=Mock(return_value=response))
        with patch.dict(sys.modules, {"requests": requests}), self.assertRaisesRegex(RuntimeError, "missing Picks"):
            IMPORTER.atomic_import("https://example.supabase.co", "secret", {})

    def test_validates_exact_canonical_payload_without_predetermined_record(self):
        payload = {
            "schemaVersion": 1,
            "cutoff": "2026-07-25T00:00:00.000Z",
            "sourceGroupFingerprint": "fixture",
            "rules": {"canonicalSixMemberGroupOnly": True},
            "profiles": [
                {"normalizedName": name}
                for name in ["BROCK", "CODY", "RHONDA", "SHANE", "TONY", "TYLER"]
            ],
        }
        IMPORTER.validate_payload_boundary(payload)
        self.assertNotIn("expectedRecord", payload)

    def test_source_contains_no_direct_table_mutation_endpoint_or_zero_thirteen_assumption(self):
        source = Path(IMPORTER.__file__).read_text(encoding="utf-8")
        self.assertNotIn("/rest/v1/pick_", source)
        self.assertNotIn("/rest/v1/profile_", source)
        self.assertNotIn("0-13", source)
        self.assertEqual(source.count("requests.post("), 1)


if __name__ == "__main__":
    unittest.main()
