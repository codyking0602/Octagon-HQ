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
    source_looks_clipped,
    upper_side_background_band,
    validate_asset_quality,
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
