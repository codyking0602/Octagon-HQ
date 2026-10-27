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
    remove_flat_side_backgrounds,
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

    def test_tall_fighter_thumb_is_upper_body_not_full_length(self):
        source = fake_fighter()
        thumbnail = render_thumb(source, (320, 320))
        self.assertEqual(thumbnail.size, (320, 320))
        self.assertLess(thumbnail.getpixel((160, 18))[0], 220)
        self.assertLess(thumbnail.getpixel((0, 0))[3], 48)
        metrics = validate_asset_quality(thumbnail, "thumb")
        self.assertGreater(metrics["alpha_coverage"], 0.10)

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
        self.assert_rejected(image, "thumb", "rectangular upper-side background")

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
