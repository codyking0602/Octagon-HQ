"""Offline tests: no image network calls or athlete likeness fabrication."""
import tempfile
import unittest
from unittest.mock import Mock

from PIL import Image
from scripts.football_editorial_assets import (
    AssetError, checked_destination, checked_source,
    choose_photo, game_header, render_manifest, spotlight,
)

REF = "https://www.espn.com/nfl/player/_/id/12345/example"
PROFILE = "https://a.espncdn.com/i/headshots/nfl/players/full/12345.png"
ACTION = "https://a.espncdn.com/photo/2026/1011/action-example.jpg"


def source(url, kind):
    return {"url": url, "kind": kind, "identity_reference_url": REF}


class FootballEditorialAssetTests(unittest.TestCase):
    def setUp(self):
        self.photo = Image.new("RGB", (1200, 1000), (58, 104, 160))

    def test_block_redirect_url_and_outside_host(self):
        with self.assertRaises(AssetError):
            checked_source("http://a.espncdn.com/photo.jpg")
        with self.assertRaises(AssetError):
            checked_source("https://attacker.example/photo.jpg")
        with self.assertRaises(AssetError):
            checked_source("https://a.espncdn.com@attacker.example/anything")
        with self.assertRaises(AssetError):
            checked_source("https://a.espncdn.com/default-avatar.jpg")

    def test_priority_action_then_portrait_fallback(self):
        candidates = [source(PROFILE, "portrait"), source(ACTION, "action")]
        seen = []
        def loader(url):
            seen.append(url)
            if url == ACTION:
                raise AssetError("Image missing")
            return self.photo
        _, selected = choose_photo(candidates, loader)
        self.assertEqual(selected["kind"], "portrait")
        self.assertEqual(seen, [ACTION, PROFILE])

    def test_reject_unverified_identity_source_and_duplicate_url(self):
        with self.assertRaises(AssetError):
            choose_photo([{"url": ACTION, "kind": "action"}], lambda _: self.photo)
        with self.assertRaises(AssetError):
            choose_photo([source(ACTION, "action")] * 2, lambda _: self.photo)

    def test_exact_tuesday_week_and_canonical_paths(self):
        spec = {"week_of": "2026-10-13", "sport": "nfl",
                "kind": "football-spotlight",
                "destination": "public/assets/football/weekly/2026-10-13/nfl/spotlight.webp"}
        self.assertEqual(str(checked_destination(spec)), spec["destination"])
        for change in [{"week_of": "2026-10-12"}, {"sport": "ufc"},
                       {"destination": "public/assets/fighters/other.webp"}]:
            with self.assertRaises(AssetError):
                checked_destination({**spec, **change})

    def test_output_dimensions_and_no_pretend_upload(self):
        spec = {
            "week_of": "2026-10-13", "sport": "nfl",
            "kind": "football-spotlight",
            "destination": "public/assets/football/weekly/2026-10-13/nfl/spotlight.webp",
            "player_name": "Verified Example",
            "photos": [source(ACTION, "action")],
        }
        result = render_manifest(spec, loader=lambda _: self.photo, write=False)
        self.assertEqual(result["dimensions"], [720, 900])
        self.assertEqual(result["sources"][0]["kind"], "action")
        self.assertEqual(spotlight(self.photo).size, (720, 900))

    def test_gotw_composition_uses_actual_photos_and_team_identity(self):
        spec = {
            "week_of": "2026-10-13", "sport": "cfb",
            "kind": "football-game-header",
            "destination": "public/assets/football/weekly/2026-10-13/cfb/game-header.webp",
            "away_team": "Notre Dame", "home_team": "BYU",
            "away_color": "#0C2340", "home_color": "#002E5D",
            "away_logo_url": "https://a.espncdn.com/i/teamlogos/ncaa/500/87.png",
            "home_logo_url": "https://a.espncdn.com/i/teamlogos/ncaa/500/252.png",
            "away_photos": [source(ACTION, "action")],
            "home_photos": [source(PROFILE, "portrait")],
        }
        result = render_manifest(spec, loader=lambda _: self.photo, write=False)
        self.assertEqual(result["dimensions"], [1600, 900])
        self.assertEqual(result["sources"][1]["kind"], "portrait")
        self.assertEqual(game_header(spec, self.photo, self.photo).size, (1600, 900))
        with self.assertRaises(AssetError):
            game_header({**spec, "away_color": "red"}, self.photo, self.photo)


if __name__ == "__main__":
    unittest.main()
