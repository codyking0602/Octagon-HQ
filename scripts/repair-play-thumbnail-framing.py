from __future__ import annotations

import argparse
import io
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

FIGHTER_SLUGS = [
    "al-iaquinta",
    "anthony-smith",
    "bo-nickal",
    "brian-ortega",
    "calvin-kattar",
    "cat-zingano",
    "ciryl-gane",
    "claudia-gadelha",
    "curtis-blaydes",
    "cynthia-calvillo",
    "dan-hardy",
    "dan-ige",
    "derek-brunson",
    "dominick-reyes",
    "edmen-shahbazyan",
    "felice-herrig",
    "gilbert-burns",
    "james-vick",
    "jared-vanderaa",
    "johnny-walker",
    "joseph-benavidez",
    "josh-emmett",
    "joshua-culibao",
    "katlyn-chookagian",
    "kenny-florian",
    "kris-moutinho",
    "lauren-murphy",
    "marlon-moraes",
    "marvin-vettori",
    "megan-anderson",
    "michael-johnson",
    "mickey-gall",
    "mike-jackson",
    "ovince-saint-preux",
    "patrick-cummins",
    "randa-markos",
    "raul-rosas-jr",
    "roy-nelson",
    "ryan-bader",
    "sara-mcmann",
    "sean-sherk",
    "stefan-struve",
    "tony-kelley",
    "uriah-hall",
    "volkan-oezdemir",
    "yair-rodriguez",
]

CANVAS_SIZE = 160
TARGET_FOREGROUND_HEIGHT = 168
MAX_FOREGROUND_WIDTH = 176
TOP_OFFSET = 4

# Small hand-tuned nudges are allowed after contact-sheet review. Values are
# scale multiplier, x offset, and y offset relative to the shared framing owner.
OVERRIDES: dict[str, tuple[float, int, int]] = {}


def read_git_file(source_sha: str, path: str) -> bytes:
    result = subprocess.run(
        ["git", "show", f"{source_sha}:{path}"],
        check=True,
        stdout=subprocess.PIPE,
    )
    return result.stdout


def foreground_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value > 8 else 0)
    bbox = mask.getbbox()
    if bbox is None:
        raise ValueError("Image has no visible foreground")
    return bbox


def repair_thumbnail(source: Image.Image, slug: str) -> tuple[Image.Image, tuple[int, int, int, int]]:
    rgba = source.convert("RGBA")
    bbox = foreground_bbox(rgba)
    subject = rgba.crop(bbox)

    base_scale = min(
        TARGET_FOREGROUND_HEIGHT / subject.height,
        MAX_FOREGROUND_WIDTH / subject.width,
    )
    scale_multiplier, x_nudge, y_nudge = OVERRIDES.get(slug, (1.0, 0, 0))
    scale = base_scale * scale_multiplier

    resized = subject.resize(
        (
            max(1, round(subject.width * scale)),
            max(1, round(subject.height * scale)),
        ),
        Image.Resampling.LANCZOS,
    )
    resized = resized.filter(ImageFilter.UnsharpMask(radius=0.7, percent=110, threshold=3))

    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    x = round((CANVAS_SIZE - resized.width) / 2) + x_nudge
    y = TOP_OFFSET + y_nudge
    canvas.alpha_composite(resized, (x, y))
    return canvas, bbox


def render_checkerboard(size: tuple[int, int], cell: int = 12) -> Image.Image:
    board = Image.new("RGB", size, "#080808")
    draw = ImageDraw.Draw(board)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if (x // cell + y // cell) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill="#111111")
    return board


def flattened(image: Image.Image) -> Image.Image:
    background = render_checkerboard(image.size)
    background.paste(image, mask=image.getchannel("A"))
    return background


def create_contact_sheet(rows: list[tuple[str, Image.Image, Image.Image, tuple[int, int, int, int]]], output: Path) -> None:
    columns = 4
    tile_width = 370
    tile_height = 215
    sheet = Image.new(
        "RGB",
        (columns * tile_width, ((len(rows) + columns - 1) // columns) * tile_height),
        "#050505",
    )
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()

    for index, (slug, original, repaired, bbox) in enumerate(rows):
        column = index % columns
        row = index // columns
        left = column * tile_width
        top = row * tile_height
        draw.rounded_rectangle(
            (left + 4, top + 4, left + tile_width - 4, top + tile_height - 4),
            radius=12,
            fill="#161616",
            outline="#333333",
        )
        draw.text((left + 12, top + 10), slug, fill="#f3f3f3", font=font)
        draw.text((left + 12, top + 27), "OLD", fill="#999999", font=font)
        draw.text((left + 194, top + 27), "NEW", fill="#29ef78", font=font)
        sheet.paste(flattened(original), (left + 12, top + 43))
        sheet.paste(flattened(repaired), (left + 194, top + 43))
        bbox_width = bbox[2] - bbox[0]
        bbox_height = bbox[3] - bbox[1]
        draw.text(
            (left + 12, top + 207 - 14),
            f"old fg {bbox_width}x{bbox_height}",
            fill="#777777",
            font=font,
        )

    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, "PNG", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-sha", required=True)
    parser.add_argument("--contact-sheet", required=True, type=Path)
    args = parser.parse_args()

    contact_rows: list[tuple[str, Image.Image, Image.Image, tuple[int, int, int, int]]] = []
    for slug in FIGHTER_SLUGS:
        relative_path = f"public/assets/fighters/{slug}-thumb.webp"
        source_bytes = read_git_file(args.source_sha, relative_path)
        with Image.open(io.BytesIO(source_bytes)) as loaded:
            original = loaded.convert("RGBA")
        repaired, bbox = repair_thumbnail(original, slug)
        repaired.save(
            relative_path,
            "WEBP",
            quality=92,
            method=6,
            lossless=False,
            exact=True,
        )
        contact_rows.append((slug, original, repaired, bbox))

    create_contact_sheet(contact_rows, args.contact_sheet)
    print(f"Reframed {len(FIGHTER_SLUGS)} thumbnails from {args.source_sha}")
    print(f"Contact sheet: {args.contact_sheet}")


if __name__ == "__main__":
    main()
