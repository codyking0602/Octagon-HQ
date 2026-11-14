#!/usr/bin/env python3
"""Create HQ Home-only headshot proofs from approved 160px UFC portraits.

These are identity-preserving 4x super-resolution versions of the *existing*
canonical thumbnails. This deliberately does NOT substitute different profile
photos or the separate promotion/event Spotlight photographs.
"""
from __future__ import annotations

import argparse
import io
from pathlib import Path
from urllib.request import urlopen

import cv2
import numpy as np
from PIL import Image, ImageFilter

FIGHTERS = ("ciryl-gane", "kayla-harrison", "amanda-nunes")
MODEL_URL = "https://raw.githubusercontent.com/Saafke/EDSR_Tensorflow/master/models/EDSR_x4.pb"
ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "public" / "assets" / "fighters"


def build_model():
    # Download to the temporary runner, not repository assets.
    model_path = Path("/tmp/octagon-home-edsr-x4.pb")
    if not model_path.exists():
        with urlopen(MODEL_URL, timeout=75) as response:
            model_path.write_bytes(response.read())
    if model_path.stat().st_size < 30_000_000:
        raise ValueError("EDSR weights are incomplete")
    sr = cv2.dnn_superres.DnnSuperResImpl_create()
    sr.readModel(str(model_path))
    sr.setModel("edsr", 4)
    return sr


def create_home_image(slug: str, super_res) -> None:
    source = IMAGES / f"{slug}-thumb.webp"
    target = IMAGES / f"{slug}.home.webp"
    thumbnail = Image.open(source).convert("RGBA")
    if thumbnail.size != (160, 160):
        raise ValueError(f"Unexpected thumbnail source dimensions: {source} {thumbnail.size}")
    # Preserve pose, likeness and original 160px crop. Matte on the Home
    # photo tray's near-black color to avoid halos around cutout edges.
    background = Image.new("RGBA", thumbnail.size, "#111820")
    background.alpha_composite(thumbnail)
    rgb = background.convert("RGB")
    rgb_bgr = cv2.cvtColor(np.asarray(rgb), cv2.COLOR_RGB2BGR)
    enlarged_bgr = super_res.upsample(rgb_bgr)
    if enlarged_bgr.shape[:2] != (640, 640):
        raise ValueError(f"EDSR output shape mismatch: {enlarged_bgr.shape}")
    enlarged = Image.fromarray(cv2.cvtColor(enlarged_bgr, cv2.COLOR_BGR2RGB))
    enlarged.save(target, "WEBP", quality=91, method=6)
    with Image.open(target) as check:
        if check.size != (640, 640) or check.format != "WEBP":
            raise ValueError(f"Invalid generated Home image {target}")
    print(f"{slug}: 160x160 -> 640x640, {target.stat().st_size} bytes")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--fighters", nargs="*", choices=FIGHTERS, default=FIGHTERS)
    args = parser.parse_args()
    super_res = build_model()
    for slug in args.fighters:
        create_home_image(slug, super_res)


if __name__ == "__main__":
    main()
