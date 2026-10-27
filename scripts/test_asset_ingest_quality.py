"""Regression coverage for transparent UFC fighter crop/quality gates."""
import sys
import unittest
from types import SimpleNamespace

from PIL import Image, ImageDraw

# Unit-test the pure crop/quality gates without loading the heavyweight rembg ML runtime.
sys.modules.setdefault("rembg", SimpleNamespace(remove=lambda image: image))
from scripts.asset_ingest import (
    render_thumb,
    source_looks_clipped,
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
        with self.assertRaisesRegex(SystemExit, "background artifact"):
            validate_asset_quality(image, "thumb")

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
        with self.assertRaisesRegex(SystemExit, "too small or narrow"):
            validate_asset_quality(image, "thumb")


if __name__ == "__main__":
    unittest.main()
