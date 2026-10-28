"""Offline tests: no image network calls or athlete likeness fabrication."""
import tempfile
import unittest
from unittest.mock import Mock

from PIL import Image
from scripts.football_editorial_assets import (
    AssetError, checked_destination, checked_source,
    choose_photo, checked_seatgeek_header_source, publisher_game_header, render_manifest, spotlight,
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

    def test_game_header_keeps_real_seatgeek_artwork_uncropped(self):
        art = Image.new("RGB", (600, 450), (17, 64, 120))
        from PIL import ImageDraw
        draw = ImageDraw.Draw(art)
        draw.rectangle((0, 0, 40, 40), fill=(250, 210, 12))
        draw.rectangle((560, 410, 599, 449), fill=(13, 20, 230))
        url = "https://seatgeekimages.com/matchup/example/600x450.jpg"
        spec = {
            "week_of": "2026-10-13", "sport": "cfb",
            "kind": "football-game-header",
            "destination": "public/assets/football/weekly/2026-10-13/cfb/game-header.webp",
            "away_team": "Notre Dame", "home_team": "BYU",
            "source_publisher": "SeatGeek", "header_source_url": url,
        }
        result = render_manifest(spec, loader=lambda _: art, write=False)
        self.assertEqual(result["dimensions"], [1600, 900])
        self.assertEqual(result["sources"], [{"kind": "publisher-matchup", "publisher": "SeatGeek", "source": url}])
        rendered = publisher_game_header(art)
        self.assertEqual(rendered.size, (1600, 900))
        self.assertEqual(rendered.getpixel((200, 0)), (250, 210, 12))
        self.assertEqual(rendered.getpixel((1399, 899)), (13, 20, 230))
        self.assertEqual(checked_seatgeek_header_source(url), url)

    def test_rejects_other_publishers_and_legacy_composites(self):
        spec = {
            "week_of": "2026-10-13", "sport": "cfb",
            "kind": "football-game-header",
            "destination": "public/assets/football/weekly/2026-10-13/cfb/game-header.webp",
            "away_team": "Notre Dame", "home_team": "BYU",
            "source_publisher": "SeatGeek",
            "header_source_url": "https://seatgeekimages.com/matchup/real/600x450.jpg",
        }
        for bad in ("http://seatgeekimages.com/matchup/foo.jpg",
                    "https://seatgeekimages.com.evil.org/matchup/foo.jpg",
                    "https://seatgeekimages.com/not-matchup/foo.jpg",
                    "https://other.example/matchup/foo.jpg"):
            with self.assertRaises(AssetError):
                checked_seatgeek_header_source(bad)
        with self.assertRaises(AssetError):
            render_manifest({**spec, "away_photos": [source(ACTION, "action")]},
                            loader=lambda _: self.photo, write=False)
        with self.assertRaises(AssetError):
            render_manifest({**spec, "source_publisher": "Other"},
                            loader=lambda _: self.photo, write=False)


if __name__ == "__main__":
    unittest.main()
