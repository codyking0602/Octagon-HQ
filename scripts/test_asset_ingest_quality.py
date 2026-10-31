"""Regression coverage for transparent UFC fighter crop/quality gates."""
import sys
import unittest
from contextlib import redirect_stderr
from io import StringIO
from types import SimpleNamespace

from PIL import Image, ImageDraw

# Unit-test the pure crop/quality gates without loading the heavyweight rembg ML runtime.
sys.modules.setdefault("rembg", SimpleNamespace(remove=lambda image: image))
from scripts.asset_ingest import (
    render_thumb,
    approved_square_thumb_source,
    remove_flat_side_backgrounds,
    inset_side_background_panels,
    horizontal_publisher_strips,
    remove_horizontal_publisher_strips,
    trim_thumb_publisher_edge_halos,
    source_looks_clipped,
    upper_side_background_band,
    validate_asset_quality,
    require_clean_original_thumb,
    source_publisher_band,
    broad_upper_side_alpha_panel,
    source_thumb_blob_is_rejected,
    VISUALLY_REJECTED_THUMB_BLOBS,
    verified_thumb_candidates,
    ingest_fighter_candidate,
    source_needs_background_removal,
    resolve_ufc_profile_source,
    official_ufc_event_headshot_url,
)


def fake_fighter(width=160, height=480):
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    # A visible head above an increasingly long upper/lower body.
    draw.ellipse((45, 20, 115, 100), fill=(170, 120, 85, 255))
    draw.polygon([(25, 105), (135, 105), (115, height - 18), (45, height - 18)], fill=(20, 75, 120, 255))
    return image


class AssetIngestQualityTests(unittest.TestCase):
    def assert_rejected(self, image, kind, reason):
        stderr = StringIO()
        with redirect_stderr(stderr):
            with self.assertRaises(SystemExit):
                validate_asset_quality(image, kind)
        self.assertIn(reason, stderr.getvalue())

    def test_official_headshot_source_gate_rejects_profile_and_non_square(self):
        espn = "https://a.espncdn.com/i/headshots/mma/players/full/5144007.png"
        self.assertTrue(approved_square_thumb_source({"source_url": espn}, espn, (600, 600)))
        self.assertFalse(approved_square_thumb_source({"source_page_url": "https://www.ufc.com/athlete/tom-nolan"}, espn, (600, 600)))
        self.assertFalse(approved_square_thumb_source({"source_url": espn}, espn, (600, 900)))
        self.assertFalse(approved_square_thumb_source({"source_url": espn}, espn, (600, 436)))
        reviewed = {
            "source_url": espn,
            "fighter_name": "Tom Nolan",
            "official_headshot_reviewed": True,
            "verified_espn_athlete_id": "5144007",
        }
        self.assertTrue(approved_square_thumb_source(reviewed, espn, (600, 436)))
        self.assertFalse(approved_square_thumb_source(
            {**reviewed, "verified_espn_athlete_id": "4295192"}, espn, (600, 436)
        ))
        self.assertFalse(approved_square_thumb_source(
            {**reviewed, "official_headshot_reviewed": False}, espn, (600, 436)
        ))
        self.assertFalse(approved_square_thumb_source({}, "https://a.espncdn.com/i/athletes/bodyshot/5144007.png", (600, 600)))
        self.assertFalse(approved_square_thumb_source({}, "https://third-party.example/photo.png", (600, 600)))
        self.assertFalse(approved_square_thumb_source({}, "https://www.ufc.com/athlete/tom-nolan", (600, 600)))
        self.assertTrue(approved_square_thumb_source(
            {"official_square_headshot_reviewed": True},
            "https://www.ufc.com/images/verified-tom-square.png", (600, 600)
        ))
        official_ufc = "https://ufc.com/images/styles/event_results_athlete_headshot/s3/2026-07/DURDEN_CODY_07-11.png?itok=F8sg0X6W"
        self.assertTrue(approved_square_thumb_source({"source_url": official_ufc}, official_ufc, (256, 160)))
        self.assertFalse(approved_square_thumb_source({"source_url": official_ufc}, official_ufc, (600, 436)))
        promotional = "https://ufc.com/images/styles/athlete_bio_full_body/s3/2026-03/DURDEN_CODY_L_03-07.png"
        self.assertFalse(approved_square_thumb_source({"source_url": promotional}, promotional, (256, 160)))

    def test_ufc_profile_thumb_discovery_ignores_full_body_promotional_images(self):
        from unittest.mock import patch
        html = b"""
        <img alt="Waldo Cortes Acosta" src="/images/styles/athlete_bio_full_body/s3/2026-05/WALDO_L.png">
        <img alt="Johnny Walker" src="/images/styles/event_results_athlete_headshot/s3/2026-07/WALKER_JOHNNY.png">
        <img alt="Waldo Cortes Acosta" src="/images/styles/event_results_athlete_headshot/s3/2026-07/CORTES_ACOSTA_WALDO.png?itok=abc">
        """
        page = "https://www.ufc.com/athlete/waldo-cortes-acosta"
        with patch("scripts.asset_ingest.request_bytes", return_value=html):
            url = resolve_ufc_profile_source(page, "Waldo Cortes Acosta", "thumb")
        self.assertEqual(
            url,
            "https://www.ufc.com/images/styles/event_results_athlete_headshot/s3/2026-07/CORTES_ACOSTA_WALDO.png?itok=abc",
        )
        self.assertTrue(official_ufc_event_headshot_url(url))
        self.assertTrue(approved_square_thumb_source(
            {"source_page_url": page, "fighter_name": "Waldo Cortes Acosta"},
            url, (256, 160),
        ))
        self.assertFalse(approved_square_thumb_source(
            {"source_page_url": page},
            "https://www.ufc.com/images/styles/athlete_bio_full_body/s3/2026-05/WALDO_L.png",
            (256, 160),
        ))

    def test_ufc_page_missing_event_headshot_fails_instead_of_using_body(self):
        from unittest.mock import patch
        html = b'<img alt="Johnny Walker" src="/images/styles/athlete_bio_full_body/s3/2026-01/WALKER_L.png">'
        with patch("scripts.asset_ingest.request_bytes", return_value=html):
            with self.assertRaises(SystemExit):
                resolve_ufc_profile_source(
                    "https://www.ufc.com/athlete/johnny-walker", "Johnny Walker", "thumb",
                )

    def test_previously_rejected_webp_blob_cannot_reenter_a_photo_pr(self):
        import hashlib
        sample = b"unit-fixture-not-an-asset"
        expected = hashlib.sha1(
            b"blob " + str(len(sample)).encode("ascii") + b"\x00" + sample
        ).hexdigest()
        self.assertFalse(source_thumb_blob_is_rejected(sample))
        self.assertIn(
            "64f29f5a3427f390edc15bc07e68b5064768ac36",
            VISUALLY_REJECTED_THUMB_BLOBS,
        )
        self.assertEqual(len(expected), 40)

    def test_gradient_upper_publisher_panel_is_rejected_without_cleanup(self):
        # Real publisher panels often have a gradient, so flat-color RGB
        # checks alone must not certify their alpha silhouettes as clean.
        im = Image.new("RGBA", (600, 436), (0, 0, 0, 0))
        draw = ImageDraw.Draw(im)
        draw.ellipse((205, 12, 395, 250), fill=(146, 104, 81, 255))
        for x in range(420, 590):
            shade = round((x - 420) / 170 * 95)
            draw.line((x, 40, x, 210), fill=(120 + shade, 45 + shade // 3, 55, 110))
        self.assertTrue(broad_upper_side_alpha_panel(im))
        with self.assertRaises(SystemExit):
            require_clean_original_thumb(im)
        clean = Image.new("RGBA", (600, 436), (0, 0, 0, 0))
        clean_draw = ImageDraw.Draw(clean)
        clean_draw.ellipse((205, 15, 395, 245), fill=(146, 104, 81, 255))
        clean_draw.ellipse((115, 248, 485, 430), fill=(165, 112, 83, 255))
        self.assertFalse(broad_upper_side_alpha_panel(clean))

    def test_transparent_original_is_fitted_without_background_removal(self):
        import tempfile
        from pathlib import Path
        from unittest.mock import patch
        from io import BytesIO

        source = Image.new("RGBA", (600, 436), (0, 0, 0, 0))
        draw = ImageDraw.Draw(source)
        draw.ellipse((205, 12, 395, 225), fill=(146, 102, 75, 255))
        draw.ellipse((95, 224, 505, 430), fill=(167, 112, 83, 255))
        raw = BytesIO()
        source.save(raw, "PNG")
        espn = "https://a.espncdn.com/i/headshots/mma/players/full/4903365.png"
        spec = {
            "source_url": espn,
            "fighter_name": "Waldo Cortes Acosta",
            "official_headshot_reviewed": True,
            "verified_espn_athlete_id": "4903365",
        }
        with tempfile.TemporaryDirectory() as folder:
            dest = str(Path(folder) / "test-thumb.webp")
            with patch("scripts.asset_ingest.resolve_source", return_value=(espn, raw.getvalue())):
                with patch("scripts.asset_ingest.remove", side_effect=AssertionError("rembg must not run")):
                    meta = ingest_fighter_candidate(spec, "thumb", dest, (320, 320))
            check = Image.open(dest).convert("RGBA")
            self.assertEqual(check.size, (320, 320))
            self.assertEqual(meta["source_url"], espn)
            self.assertEqual(check.getpixel((0, 0))[3], 0)

    def test_opaque_and_contaminated_originals_rejected_without_writing(self):
        import tempfile
        from pathlib import Path
        from io import BytesIO
        from unittest.mock import patch

        espn = "https://a.espncdn.com/i/headshots/mma/players/full/4903365.png"
        spec = {
            "source_url": espn,
            "fighter_name": "Waldo Cortes Acosta",
            "official_headshot_reviewed": True,
            "verified_espn_athlete_id": "4903365",
        }
        bad = Image.new("RGBA", (600, 436), (0, 0, 0, 0))
        draw = ImageDraw.Draw(bad)
        draw.ellipse((205, 10, 395, 250), fill=(150, 105, 85, 255))
        draw.rectangle((425, 65, 580, 245), fill=(206, 104, 89, 255))
        self.assertTrue(source_publisher_band(bad))
        with self.assertRaises(SystemExit):
            require_clean_original_thumb(bad)
        with tempfile.TemporaryDirectory() as folder:
            dest = str(Path(folder) / "not-approved.webp")
            for source in (bad, Image.new("RGBA", (600, 436), (240, 240, 240, 255))):
                raw = BytesIO()
                source.save(raw, "PNG")
                with patch("scripts.asset_ingest.resolve_source", return_value=(espn, raw.getvalue())):
                    with patch("scripts.asset_ingest.remove", side_effect=AssertionError("no cleanup allowed")):
                        with self.assertRaises(SystemExit):
                            ingest_fighter_candidate(spec, "thumb", dest, (320, 320))
                self.assertFalse(Path(dest).exists())

    def test_alternate_sources_keep_same_fighter_and_validate_each_source(self):
        spec = {
            "kind": "thumb",
            "destination": "public/assets/fighters/johnny-walker-thumb.webp",
            "source_url": "https://a.espncdn.com/i/headshots/mma/players/full/3146944.png",
            "fighter_name": "Johnny Walker",
            "official_headshot_reviewed": True,
            "verified_espn_athlete_id": "3146944",
            "fallback_sources": [{
                "source_page_url": "https://www.ufc.com/athlete/johnny-walker",
            }],
        }
        options = verified_thumb_candidates(spec)
        self.assertEqual(len(options), 2)
        self.assertEqual(options[1]["fighter_name"], "Johnny Walker")
        self.assertEqual(options[1]["destination"], spec["destination"])
        self.assertNotIn("source_url", options[1])
        with self.assertRaises(SystemExit):
            verified_thumb_candidates({
                **spec,
                "fallback_sources": [{"fighter_name": "Different fighter",
                                      "source_page_url": "https://www.ufc.com/athlete/johnny-walker"}],
            })

    def test_clean_transparent_espn_600_by_436_is_not_resegmented(self):
        # ESPN's authentic face-dominant portrait is sometimes already a
        # transparent PNG. Re-running rembg can create publisher-color bands.
        espn = "https://a.espncdn.com/i/headshots/mma/players/full/4903365.png"
        reviewed = {
            "fighter_name": "Waldo Cortes-Acosta",
            "official_headshot_reviewed": True,
            "verified_espn_athlete_id": "4903365",
        }
        source = Image.new("RGBA", (600, 436), (0, 0, 0, 0))
        draw = ImageDraw.Draw(source)
        draw.ellipse((215, 10, 385, 230), fill=(145, 100, 76, 255))
        draw.ellipse((78, 215, 530, 600), fill=(165, 108, 74, 255))
        self.assertTrue(approved_square_thumb_source(reviewed, espn, source.size))
        self.assertFalse(source_needs_background_removal(source))
        self.assertTrue(source_needs_background_removal(
            Image.new("RGBA", (600, 436), (240, 240, 240, 255))
        ))

    def test_transparent_headshot_with_publisher_panel_still_needs_cleanup(self):
        source = Image.new("RGBA", (600, 436), (0, 0, 0, 0))
        draw = ImageDraw.Draw(source)
        draw.ellipse((220, 25, 390, 265), fill=(145, 100, 76, 255))
        draw.rectangle((510, 25, 575, 220), fill=(230, 210, 70, 255))
        self.assertTrue(source_needs_background_removal(source))

    def test_fit_does_not_reframe_original_square_headshot(self):
        source = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
        draw = ImageDraw.Draw(source)
        draw.ellipse((70, 14, 245, 210), fill=(170, 120, 85, 255))
        draw.polygon([(48, 220), (272, 220), (280, 312), (40, 312)], fill=(20, 75, 120, 255))
        thumbnail = render_thumb(source, (320, 320))
        self.assertEqual(thumbnail.size, (320, 320))
        self.assertLess(thumbnail.getpixel((0, 0))[3], 48)
        self.assertGreater(validate_asset_quality(thumbnail, "thumb")["alpha_coverage"], 0.10)

    def test_framed_rectangular_background_is_rejected(self):
        image = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
        ImageDraw.Draw(image).rectangle((10, 10, 309, 309), fill=(220, 220, 220, 255))
        self.assert_rejected(image, "thumb", "background artifact")

    def test_upper_right_rectangular_overlay_is_not_a_clean_cutout(self):
        image = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        draw.ellipse((80, 30, 235, 230), fill=(140, 95, 72, 255))
        draw.rectangle((265, 30, 315, 165), fill=(240, 240, 240, 255))
        self.assertTrue(upper_side_background_band(image))
        self.assert_rejected(image, "thumb", "publisher background artifact")

    def test_cleanup_removes_flat_right_block_but_preserves_fighter(self):
        image = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        draw.ellipse((90, 20, 230, 275), fill=(140, 94, 67, 255))
        draw.rectangle((264, 20, 315, 180), fill=(238, 238, 238, 255))
        cleaned = remove_flat_side_backgrounds(image)
        self.assertEqual(cleaned.getpixel((295, 95))[3], 0)
        self.assertEqual(cleaned.getpixel((160, 95))[3], 255)

    def test_cleanup_does_not_erase_real_portrait(self):
        source = fake_fighter()
        cleaned = remove_flat_side_backgrounds(source)
        self.assertEqual(cleaned.getpixel((80, 60))[3], 255)
        self.assertEqual(cleaned.getpixel((80, 180))[3], 255)

    def test_inset_publisher_panel_is_removed_without_erasing_fighter(self):
        im = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
        draw = ImageDraw.Draw(im)
        draw.ellipse((90, 20, 225, 230), fill=(145, 100, 75, 255))
        for y in range(30, 125):
            draw.line((255, y, 295, y), fill=(224, 212 + y % 4, 59, 255))
        self.assertTrue(inset_side_background_panels(im))
        cleaned = remove_flat_side_backgrounds(im)
        self.assertFalse(inset_side_background_panels(cleaned))
        self.assertEqual(cleaned.getpixel((275, 75))[3], 0)
        self.assertEqual(cleaned.getpixel((155, 75))[3], 255)

    def test_unremoved_inset_panel_fails_closed(self):
        im = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
        draw = ImageDraw.Draw(im)
        draw.ellipse((95, 20, 220, 245), fill=(145, 100, 75, 255))
        draw.rectangle((255, 30, 295, 155), fill=(185, 180, 192, 255))
        self.assert_rejected(im, "thumb", "publisher background artifact")

    def test_normal_fighter_is_untouched_by_panel_cleaner(self):
        im = fake_fighter()
        self.assertEqual(inset_side_background_panels(im), [])
        self.assertEqual(im.tobytes(), remove_flat_side_backgrounds(im).tobytes())

    def test_top_horizontal_publisher_bar_is_cleared(self):
        im = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
        draw = ImageDraw.Draw(im)
        draw.ellipse((90, 20, 220, 250), fill=(151, 100, 80, 255))
        draw.rectangle((215, 13, 319, 15), fill=(200, 48, 51, 255))
        self.assertTrue(horizontal_publisher_strips(im))
        self.assert_rejected(im, "thumb", "publisher background artifact")
        cleaned = remove_horizontal_publisher_strips(im)
        self.assertFalse(horizontal_publisher_strips(cleaned))
        self.assertEqual(cleaned.getpixel((250, 14))[3], 0)
        self.assertEqual(cleaned.getpixel((155, 75))[3], 255)

    def test_edge_halo_and_top_side_stroke_are_trimmed(self):
        im = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
        draw = ImageDraw.Draw(im)
        draw.ellipse((100, 14, 225, 220), fill=(152, 103, 84, 255))
        draw.line((211, 12, 319, 12), fill=(220, 35, 49, 90), width=1)
        cleaned = trim_thumb_publisher_edge_halos(im)
        self.assertEqual(cleaned.getpixel((275, 12))[3], 0)
        self.assertEqual(cleaned.getpixel((159, 70))[3], 255)
        self.assertLess(cleaned.getpixel((100, 110))[3], im.getpixel((100, 110))[3])

    def test_translucent_rectangular_background_is_rejected(self):
        im = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
        draw = ImageDraw.Draw(im)
        draw.ellipse((90, 20, 220, 230), fill=(151, 105, 77, 255))
        draw.rectangle((250, 24, 318, 170), fill=(215, 91, 81, 65))
        self.assert_rejected(im, "thumb", "publisher background artifact")

    def test_faint_publisher_side_panel_is_still_visible_and_rejected(self):
        im = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
        draw = ImageDraw.Draw(im)
        draw.ellipse((90, 20, 220, 230), fill=(151, 105, 77, 255))
        draw.rectangle((262, 28, 319, 175), fill=(218, 88, 71, 12))
        self.assert_rejected(im, "thumb", "publisher background artifact")

    def test_low_alpha_source_rectangle_gets_removed(self):
        im = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
        draw = ImageDraw.Draw(im)
        draw.ellipse((95, 22, 225, 238), fill=(155, 110, 88, 255))
        draw.rectangle((260, 35, 315, 157), fill=(171, 73, 62, 24))
        self.assertTrue(upper_side_background_band(im))
        cleaned = remove_flat_side_backgrounds(im)
        self.assertEqual(cleaned.getpixel((288, 75))[3], 0)
        self.assertEqual(cleaned.getpixel((156, 75))[3], 255)

    def test_full_bleed_opaque_background_is_rejected(self):
        image = Image.new("RGBA", (320, 320), (200, 200, 200, 255))
        with self.assertRaises(SystemExit):
            validate_asset_quality(image, "thumb")

    def test_source_top_clipping_is_detected(self):
        image = fake_fighter()
        self.assertEqual(source_looks_clipped(image, "thumb"), "")
        cropped = image.crop((0, 55, 160, 480))
        self.assertIn("top", source_looks_clipped(cropped, "thumb"))

    def test_spotlight_source_bottom_cutoff_is_detected(self):
        cropped = fake_fighter().crop((0, 0, 160, 180))
        self.assertIn("bottom", source_looks_clipped(cropped, "spotlight"))

    def test_too_small_subject_is_rejected(self):
        image = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
        ImageDraw.Draw(image).rectangle((150, 40, 160, 90), fill=(120, 80, 60, 255))
        self.assert_rejected(image, "thumb", "too small or narrow")


if __name__ == "__main__":
    unittest.main()
