"""Tests for inventory-first UFC Prep media reuse."""
import json
import tempfile
import unittest
from pathlib import Path

from scripts.ufc_prep_asset_inventory import inventory, preflight_manifest


class UfcPrepMediaInventoryTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        src = self.root / "src/features/picks"
        src.mkdir(parents=True)
        (src / "FighterThumbnail.tsx").write_text(
            'const thumbnailSlugAliases = new Map([\n'
            '  ["bobby-green", "king-green"],\n'
            ']);\n'
            'const remotePhotoBySlug = new Map([\n'
            '  ["remote-fighter", "https://a.espncdn.com/i/headshots/mma/players/full/1234.png"],\n'
            ']);\n',
            encoding="utf-8",
        )
        self.assets = self.root / "public/assets/fighters"
        self.assets.mkdir(parents=True)
        for name in ("ciryl-gane-thumb.webp", "king-green-thumb.webp",
                     "ciryl-gane-spotlight.webp", "drew-dober-thumb.webp"):
            (self.assets / name).write_bytes(b"existing local HQ photo fixture")

    def test_local_photos_and_alias_are_reused_before_any_download(self):
        rows = inventory(
            ["ciryl-gane", "drew-dober", "bobby-green", "josh-hokit"], self.root
        )
        self.assertEqual(
            [row["thumbnail_status"] for row in rows],
            ["existing_local", "existing_local", "existing_local", "missing"],
        )
        self.assertEqual(rows[2]["canonical_slug"], "king-green")
        self.assertEqual(rows[0]["spotlight_path"], "/assets/fighters/ciryl-gane-spotlight.webp")
        self.assertTrue(rows[3]["needs_new_thumb"])
        self.assertFalse(rows[0]["needs_new_thumb"])

    def test_existing_png_and_jpeg_thumbnails_match_frontend_glob(self):
        (self.assets / "legacy-fighter-thumb.png").write_bytes(b"legacy png")
        (self.assets / "other-fighter-thumb.jpeg").write_bytes(b"legacy jpeg")
        rows = inventory(["legacy-fighter", "other-fighter"], self.root)
        self.assertEqual([row["thumbnail_status"] for row in rows],
                         ["existing_local", "existing_local"])
        self.assertEqual(rows[0]["thumb_path"], "/assets/fighters/legacy-fighter-thumb.png")
        self.assertEqual(rows[1]["thumb_path"], "/assets/fighters/other-fighter-thumb.jpeg")

    def test_current_frontend_remote_is_accepted_hq_photo(self):
        row = inventory(["remote-fighter"], self.root)[0]
        self.assertEqual(row["thumbnail_status"], "existing_remote")
        self.assertTrue(row["accepted_existing_hq_photo"])
        self.assertFalse(row["needs_new_thumb"])
        self.assertIsNone(row["thumb_path"])

    def test_ingest_manifest_defaults_to_reuse_and_requires_reason_to_replace(self):
        spec = {
            "kind": "thumb",
            "destination": "public/assets/fighters/ciryl-gane-thumb.webp",
            "source_url": "https://a.espncdn.com/i/headshots/mma/players/full/123.png",
        }
        self.assertEqual(preflight_manifest(spec, self.root), "reuse")
        self.assertEqual(preflight_manifest({
            **spec, "destination": "public/assets/fighters/josh-hokit-thumb.webp"
        }, self.root), "process")
        with self.assertRaisesRegex(ValueError, "replacement_reason"):
            preflight_manifest({**spec, "replace_existing": True}, self.root)
        self.assertEqual(preflight_manifest({
            **spec, "replace_existing": True,
            "replacement_reason": "Reviewed existing image has a proven wrong fighter ID",
        }, self.root), "process")

    def test_spotlight_is_independent_of_thumbnail_and_remote(self):
        spec = {"kind": "spotlight",
                "destination": "public/assets/fighters/ciryl-gane-spotlight.webp"}
        self.assertEqual(preflight_manifest(spec, self.root), "reuse")
        self.assertEqual(preflight_manifest({
            **spec, "destination": "public/assets/fighters/drew-dober-spotlight.webp"
        }, self.root), "process")
        self.assertEqual(preflight_manifest({"kind": "football-spotlight"}, self.root), "process")

    def test_bad_destination_never_bypasses_safety(self):
        with self.assertRaisesRegex(ValueError, "Invalid"):
            preflight_manifest({
                "kind": "thumb",
                "destination": "public/assets/fighters/../../elsewhere-thumb.webp",
            }, self.root)
        with self.assertRaisesRegex(ValueError, "Invalid fighter"):
            inventory(["../outside"], self.root)


if __name__ == "__main__":
    unittest.main()
