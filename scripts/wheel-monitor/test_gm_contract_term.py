"""Offline tests for reviewed OTC accounting-vs-playing-term treatment."""
import importlib.util
import sys
import types
import unittest
from pathlib import Path

provider = types.ModuleType("nflreadpy")
provider.load_contracts = lambda: None
provider.load_players = lambda: None
sys.modules.setdefault("nflreadpy", provider)
path = Path(__file__).resolve().parent.parent / "generate-wheel-nfl-gm-contracts.py"
spec = importlib.util.spec_from_file_location("wheel_gm_contracts_under_test", path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class GmContractTermTests(unittest.TestCase):
    def contract(self, **overrides):
        base = dict(otc_id=10877, team="Falcons", year_signed=2026, years=4,
                    season_history=[{"year": year, "cash_paid": 10_000_000}
                                    for year in range(2026, 2032)])
        base.update(overrides)
        return base

    def test_dexter_2026_extension_plays_through_2030(self):
        row = self.contract()
        self.assertEqual(module.season_end(row), 2031)
        self.assertEqual(module.resolved_playing_end(row, "gervondexter"), 2030)

    def test_override_does_not_inherit_future_contracts_or_wrong_identity(self):
        self.assertEqual(module.resolved_playing_end(
            self.contract(year_signed=2027), "gervondexter"), 2031)
        self.assertEqual(module.resolved_playing_end(
            self.contract(otc_id=9999), "gervondexter"), 2031)
        self.assertEqual(module.resolved_playing_end(
            self.contract(team="Chicago Bears"), "gervondexter"), 2031)
        self.assertEqual(module.resolved_playing_end(
            self.contract(), "otherplayer"), 2031)

    def test_existing_verified_stafford_override_is_preserved(self):
        self.assertEqual(module.resolved_playing_end(
            self.contract(otc_id=1234), "matthewstafford"), 2027)


if __name__ == "__main__":
    unittest.main()
