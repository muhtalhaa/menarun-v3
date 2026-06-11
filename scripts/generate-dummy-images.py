#!/usr/bin/env python3
"""Generate dummy pixel art PNG assets for menaRun Phase 0."""

from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
TOSCA = (42, 157, 143)
DARK = (26, 46, 42)
WHITE = (255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)


def draw_pixel_block(draw: ImageDraw.ImageDraw, x: int, y: int, size: int, color):
    draw.rectangle([x, y, x + size - 1, y + size - 1], fill=color)


def create_logo(path: Path):
    w, h = 120, 48
    img = Image.new("RGBA", (w, h), TRANSPARENT)
    draw = ImageDraw.Draw(img)

    # Pixel "M"
    for row, pattern in enumerate(
        [
            "█   █",
            "██ ██",
            "█ █ █",
            "█   █",
            "█   █",
        ]
    ):
        for col, ch in enumerate(pattern):
            if ch == "█":
                draw_pixel_block(draw, 8 + col * 6, 8 + row * 6, 5, TOSCA)

    # Pixel "R"
    for row, pattern in enumerate(
        [
            "████ ",
            "█   █",
            "████ ",
            "█  █ ",
            "█   █",
        ]
    ):
        for col, ch in enumerate(pattern):
            if ch == "█":
                draw_pixel_block(draw, 48 + col * 6, 8 + row * 6, 5, DARK)

    # Running figure accent
    blocks = [
        (88, 28), (94, 28), (100, 28),
        (94, 22), (100, 16),
        (88, 34), (94, 34), (100, 40),
    ]
    for bx, by in blocks:
        draw_pixel_block(draw, bx, by, 5, TOSCA)

    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)
    print(f"Created {path}")


def create_runner_sprite(path: Path):
    size = 48
    img = Image.new("RGBA", (size, size), TRANSPARENT)
    draw = ImageDraw.Draw(img)

    # Simple pixel runner (head, body, legs)
    head = [(20, 4), (24, 4), (28, 4), (20, 8), (24, 8), (28, 8)]
    body = [(20, 12), (24, 12), (28, 12), (20, 16), (24, 16), (28, 16), (20, 20), (24, 20), (28, 20)]
    arm = [(32, 16), (36, 12)]
    legs = [(16, 24), (20, 28), (24, 32), (28, 24), (32, 28)]

    for bx, by in head:
        draw_pixel_block(draw, bx, by, 4, DARK)
    for bx, by in body:
        draw_pixel_block(draw, bx, by, 4, TOSCA)
    for bx, by in arm:
        draw_pixel_block(draw, bx, by, 4, TOSCA)
    for bx, by in legs:
        draw_pixel_block(draw, bx, by, 4, DARK)

    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)
    print(f"Created {path}")


if __name__ == "__main__":
    create_logo(ROOT / "public" / "images" / "logo.png")
    create_runner_sprite(ROOT / "public" / "images" / "celebration" / "runner-sprite.png")
