from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw


CELL_W = 192
CELL_H = 208
COLS = 8
ROWS = 11
ATLAS_W = CELL_W * COLS
ATLAS_H = CELL_H * ROWS


OUT_DIR = Path("manual-pets") / "atelier"


def ellipse(draw: ImageDraw.ImageDraw, box, fill, outline=None, width=1):
    draw.ellipse(tuple(round(v) for v in box), fill=fill, outline=outline, width=width)


def polygon(draw: ImageDraw.ImageDraw, pts, fill, outline=None):
    draw.polygon([(round(x), round(y)) for x, y in pts], fill=fill, outline=outline)


def line(draw: ImageDraw.ImageDraw, pts, fill, width=1):
    draw.line([(round(x), round(y)) for x, y in pts], fill=fill, width=width, joint="curve")


def draw_pet(
    draw: ImageDraw.ImageDraw,
    ox: int,
    oy: int,
    frame: int,
    row: int,
    *,
    look_deg: float | None = None,
):
    # Base animation offsets.
    bob = math.sin(frame / 8 * math.tau) * 3
    sway = math.sin(frame / 8 * math.tau + 0.7) * 3
    lean = 0
    arm_lift = 0
    leg = math.sin(frame / 8 * math.tau)
    y = oy + 18 + bob
    x = ox + 96

    expression = "calm"
    if row == 1:  # running-right
        x += -7 + frame * 2
        lean = 7
        bob = math.sin(frame / 8 * math.tau) * 4
    elif row == 2:  # running-left
        x += 7 - frame * 2
        lean = -7
        bob = math.sin(frame / 8 * math.tau) * 4
    elif row == 3:  # waving
        arm_lift = 18 + abs(math.sin(frame / 8 * math.tau)) * 18
    elif row == 4:  # jumping
        y -= abs(math.sin(frame / 8 * math.tau)) * 24
    elif row == 5:  # failed
        y += 5
        expression = "sad"
    elif row == 6:  # waiting
        expression = "ask"
        arm_lift = 10
    elif row == 7:  # running/work
        expression = "focus"
        sway += math.sin(frame / 8 * math.tau * 2) * 2
    elif row == 8:  # review
        expression = "review"
        lean = -3

    if look_deg is not None:
        expression = "look"

    # Palette: quiet fashion/workshop colors.
    ink = (34, 30, 32, 255)
    outline = (47, 42, 45, 255)
    cream = (245, 238, 222, 255)
    blush = (233, 145, 137, 255)
    charcoal = (54, 55, 58, 255)
    slate = (89, 104, 116, 255)
    teal = (80, 160, 151, 255)
    coral = (229, 95, 83, 255)
    gold = (215, 164, 70, 255)

    body_cx = x + lean * 0.4
    body_y = y + 72
    head_cx = x + lean
    head_y = y + 45

    # Tiny legs.
    foot_y = body_y + 76
    leg_spread = 8 + abs(leg) * 4
    if row in (1, 2):
        leg_spread = 12
    line(draw, [(body_cx - 14, body_y + 54), (body_cx - leg_spread, foot_y)], ink, 7)
    line(draw, [(body_cx + 14, body_y + 54), (body_cx + leg_spread, foot_y)], ink, 7)
    ellipse(draw, [body_cx - leg_spread - 11, foot_y - 4, body_cx - leg_spread + 10, foot_y + 8], charcoal)
    ellipse(draw, [body_cx + leg_spread - 10, foot_y - 4, body_cx + leg_spread + 11, foot_y + 8], charcoal)

    # Tailor cape/body.
    polygon(
        draw,
        [
            (body_cx - 38 + sway, body_y - 4),
            (body_cx + 34 + sway, body_y - 2),
            (body_cx + 43, body_y + 62),
            (body_cx, body_y + 78),
            (body_cx - 45, body_y + 62),
        ],
        charcoal,
        outline,
    )
    polygon(
        draw,
        [
            (body_cx - 25 + sway, body_y + 3),
            (body_cx + 22 + sway, body_y + 3),
            (body_cx + 27, body_y + 52),
            (body_cx, body_y + 64),
            (body_cx - 29, body_y + 52),
        ],
        slate,
    )

    # Measuring-tape scarf, attached to body.
    line(draw, [(body_cx - 28, body_y + 10), (body_cx + 21, body_y + 28), (body_cx - 16, body_y + 45)], gold, 7)
    for i in range(5):
        tx = body_cx - 20 + i * 9
        line(draw, [(tx, body_y + 14 + i * 3), (tx + 3, body_y + 16 + i * 3)], ink, 1)

    # Arms.
    left_hand = (body_cx - 44 - abs(lean) * 0.3, body_y + 28)
    right_hand = (body_cx + 43 + abs(lean) * 0.3, body_y + 28 - arm_lift)
    if row == 7:
        right_hand = (body_cx + 36 + math.sin(frame) * 3, body_y + 48)
    if row == 8:
        left_hand = (body_cx - 34, body_y + 42)
        right_hand = (body_cx + 37, body_y + 39)
    line(draw, [(body_cx - 24, body_y + 19), left_hand], ink, 6)
    line(draw, [(body_cx + 24, body_y + 19), right_hand], ink, 6)
    ellipse(draw, [left_hand[0] - 7, left_hand[1] - 6, left_hand[0] + 7, left_hand[1] + 7], cream, outline)
    ellipse(draw, [right_hand[0] - 7, right_hand[1] - 6, right_hand[0] + 7, right_hand[1] + 7], cream, outline)

    # Head and hair.
    ellipse(draw, [head_cx - 34, head_y - 30, head_cx + 34, head_y + 34], cream, outline, 2)
    ellipse(draw, [head_cx - 38, head_y - 24, head_cx - 20, head_y + 9], coral, outline)
    ellipse(draw, [head_cx + 19, head_y - 22, head_cx + 39, head_y + 8], coral, outline)

    # Beret.
    ellipse(draw, [head_cx - 40, head_y - 45, head_cx + 30, head_y - 18], ink, outline)
    ellipse(draw, [head_cx - 10, head_y - 52, head_cx + 31, head_y - 29], charcoal)
    line(draw, [(head_cx + 10, head_y - 50), (head_cx + 18, head_y - 58)], ink, 3)

    # Face direction.
    eye_dx = 0
    eye_dy = 0
    nose_dx = 0
    if look_deg is not None:
        rad = math.radians(look_deg - 90)
        eye_dx = math.cos(rad) * 6
        eye_dy = math.sin(rad) * 5
        nose_dx = math.cos(rad) * 7
    elif row == 1:
        eye_dx = 4
        nose_dx = 4
    elif row == 2:
        eye_dx = -4
        nose_dx = -4
    elif expression == "review":
        eye_dx = -2
        eye_dy = 1

    left_eye = (head_cx - 12 + eye_dx, head_y - 3 + eye_dy)
    right_eye = (head_cx + 12 + eye_dx, head_y - 3 + eye_dy)
    if expression == "sad":
        line(draw, [(left_eye[0] - 4, left_eye[1]), (left_eye[0] + 4, left_eye[1] + 2)], ink, 2)
        line(draw, [(right_eye[0] - 4, right_eye[1] + 2), (right_eye[0] + 4, right_eye[1])], ink, 2)
    else:
        ellipse(draw, [left_eye[0] - 4, left_eye[1] - 4, left_eye[0] + 4, left_eye[1] + 4], ink)
        ellipse(draw, [right_eye[0] - 4, right_eye[1] - 4, right_eye[0] + 4, right_eye[1] + 4], ink)
    ellipse(draw, [head_cx - 3 + nose_dx, head_y + 5, head_cx + 5 + nose_dx, head_y + 12], blush)

    if expression == "sad":
        line(draw, [(head_cx - 9, head_y + 22), (head_cx, head_y + 17), (head_cx + 9, head_y + 22)], ink, 2)
        ellipse(draw, [head_cx + 22, head_y + 7, head_cx + 28, head_y + 18], teal, outline)
    elif expression == "ask":
        ellipse(draw, [head_cx - 6, head_y + 18, head_cx + 7, head_y + 25], ink)
    elif expression == "focus":
        line(draw, [(head_cx - 8, head_y + 19), (head_cx + 9, head_y + 19)], ink, 2)
    else:
        line(draw, [(head_cx - 8, head_y + 18), (head_cx, head_y + 23), (head_cx + 9, head_y + 18)], ink, 2)

    # Attached needle brooch.
    line(draw, [(body_cx + 17, body_y + 18), (body_cx + 30, body_y + 34)], teal, 2)
    ellipse(draw, [body_cx + 14, body_y + 15, body_cx + 20, body_y + 21], teal)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    atlas = Image.new("RGBA", (ATLAS_W, ATLAS_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(atlas)

    for row in range(9):
        for frame in range(8):
            draw_pet(draw, frame * CELL_W, row * CELL_H, frame, row)

    look_degrees = [
        0,
        22.5,
        45,
        67.5,
        90,
        112.5,
        135,
        157.5,
        180,
        202.5,
        225,
        247.5,
        270,
        292.5,
        315,
        337.5,
    ]
    for i, degree in enumerate(look_degrees):
        row = 9 + i // 8
        col = i % 8
        draw_pet(draw, col * CELL_W, row * CELL_H, i % 8, row, look_deg=degree)

    atlas.save(OUT_DIR / "spritesheet.webp", "WEBP", lossless=True, quality=100, method=6)
    atlas.save(OUT_DIR / "spritesheet.png", "PNG")

    manifest = {
        "id": "atelier",
        "displayName": "Atelier",
        "description": "A stylish studio companion for fashion-shop building and careful creative work.",
        "spriteVersionNumber": 2,
        "spritesheetPath": "spritesheet.webp",
    }
    (OUT_DIR / "pet.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print((OUT_DIR / "spritesheet.webp").resolve())
    print((OUT_DIR / "pet.json").resolve())


if __name__ == "__main__":
    main()
