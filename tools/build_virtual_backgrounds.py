"""Generates Kepang AI virtual backgrounds for video calls / pitch recording.

Output: brand_assets/virtual_backgrounds/*.png at 1920x1080 (16:9).

Design notes:
- Art is built from the product's OWN assets: the 34-province GeoJSON that the
  live app renders in its national choropleth, plus the blueprint corner marks
  from the app's Industry design system. So it reads as Kepang AI, not a
  generic gradient.
- The centre of the frame is deliberately kept quiet: on a video call the
  speaker sits there. Branding is pushed to the corners and the map is faded
  and pushed right, so the person never competes with it.
- Rendered at 2x then downsampled (supersampling) because PIL has no built-in
  anti-aliasing for polygons or lines.
"""

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
GEOJSON = ROOT / "frontend" / "src" / "data" / "idn_provinces.json"
OUT_DIR = ROOT / "brand_assets" / "virtual_backgrounds"

W, H = 1920, 1080
SS = 2  # supersample factor
FONT_DIR = Path("C:/Windows/Fonts")


# ---------------------------------------------------------------- palette ---
DARK_BASE = (7, 41, 31)          # #07291F deep forest
DARK_DEEP = (4, 27, 20)          # #041B14
ACCENT = (34, 197, 94)           # #22C55E emerald
ACCENT_SOFT = (74, 222, 128)     # #4ADE80
LIGHT_BASE = (243, 250, 246)     # #F3FAF6 pale mint
LIGHT_PANEL = (226, 242, 233)
TEXT_ON_DARK = (255, 255, 255)
MUTED_ON_DARK = (159, 217, 184)  # #9FD9B8
TEXT_ON_LIGHT = (11, 31, 23)     # #0B1F17
MUTED_ON_LIGHT = (91, 107, 99)   # #5B6B63


def font(name, size):
    for candidate in (name, "arial.ttf"):
        path = FONT_DIR / candidate
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


# ------------------------------------------------------------- background ---
def vertical_gradient(size, top, bottom):
    w, h = size
    grad = Image.new("RGB", (1, h))
    px = grad.load()
    for y in range(h):
        px[0, y] = lerp(top, bottom, y / max(1, h - 1))
    return grad.resize((w, h), Image.BILINEAR)


def radial_glow(size, centre, radius, color, max_alpha):
    """Soft radial light, drawn as an alpha mask so it blends smoothly."""
    w, h = size
    cx, cy = centre
    # Build small then upscale - far cheaper than per-pixel at full res.
    small_w, small_h = w // 8, h // 8
    mask = Image.new("L", (small_w, small_h), 0)
    mpx = mask.load()
    scx, scy, sr = cx / 8, cy / 8, radius / 8
    for y in range(small_h):
        for x in range(small_w):
            d = math.hypot(x - scx, y - scy) / sr
            if d < 1.0:
                mpx[x, y] = int(max_alpha * (1 - d) ** 2)
    mask = mask.resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(w / 120))
    layer = Image.new("RGB", (w, h), color)
    return layer, mask


def blueprint_grid(size, color, alpha, spacing, fade_from_x=None):
    """Faint technical grid, echoing the app's hero panel."""
    w, h = size
    grid = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(grid)
    for x in range(0, w, spacing):
        d.line([(x, 0), (x, h)], fill=alpha, width=SS)
    for y in range(0, h, spacing):
        d.line([(0, y), (w, y)], fill=alpha, width=SS)
    if fade_from_x is not None:
        # Fade the grid out toward the left so the speaker area stays clean.
        ramp = Image.new("L", (w, 1))
        rpx = ramp.load()
        for x in range(w):
            t = min(1.0, max(0.0, (x - fade_from_x) / (w - fade_from_x)))
            rpx[x, 0] = int(255 * t)
        ramp = ramp.resize((w, h))
        grid = Image.composite(grid, Image.new("L", (w, h), 0), ramp)
    layer = Image.new("RGB", (w, h), color)
    return layer, grid


# -------------------------------------------------------------------- map ---
def load_projected_map(target_w, target_h):
    """Project the 34-province GeoJSON to pixel space (equirectangular).

    Indonesia straddles the equator so the distortion is negligible at this
    size, and it keeps the silhouette instantly recognisable.
    """
    data = json.loads(GEOJSON.read_text(encoding="utf-8"))
    lon_min = lat_min = float("inf")
    lon_max = lat_max = float("-inf")
    for feat in data["features"]:
        for poly in feat["geometry"]["coordinates"]:
            for ring in poly:
                for lng, lat in ring:
                    lon_min, lon_max = min(lon_min, lng), max(lon_max, lng)
                    lat_min, lat_max = min(lat_min, lat), max(lat_max, lat)

    scale = min(target_w / (lon_max - lon_min), target_h / (lat_max - lat_min))
    off_x = (target_w - (lon_max - lon_min) * scale) / 2
    off_y = (target_h - (lat_max - lat_min) * scale) / 2

    def project(lng, lat):
        return (off_x + (lng - lon_min) * scale, off_y + (lat_max - lat) * scale)

    provinces = []
    for feat in data["features"]:
        rings = []
        for poly in feat["geometry"]["coordinates"]:
            for ring in poly:
                pts = [project(lng, lat) for lng, lat in ring]
                if len(pts) >= 3:
                    rings.append(pts)
        provinces.append({"name": feat["properties"]["name"], "rings": rings})
    return provinces


# Provinces the live app currently flags as high price-pressure - highlighting
# exactly these keeps the art truthful to what the product actually shows.
HIGHLIGHT = {"Papua", "Papua Barat", "Kalimantan Tengah", "Kalimantan Selatan",
             "Kalimantan Timur", "Kalimantan Utara"}


def render_map_layer(size, fill, outline, highlight_fill, line_w):
    w, h = size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for prov in load_projected_map(w, h):
        f = highlight_fill if prov["name"] in HIGHLIGHT else fill
        for ring in prov["rings"]:
            d.polygon(ring, fill=f, outline=outline, width=line_w)
    return layer


# --------------------------------------------------------------- elements ---
def corner_marks(draw, box, color, arm, width):
    """The app's blueprint registration marks (an L at each corner)."""
    x0, y0, x1, y1 = box
    for (cx, cy, dx, dy) in ((x0, y0, 1, 1), (x1, y0, -1, 1),
                             (x0, y1, 1, -1), (x1, y1, -1, -1)):
        draw.line([(cx, cy), (cx + arm * dx, cy)], fill=color, width=width)
        draw.line([(cx, cy), (cx, cy + arm * dy)], fill=color, width=width)


def braid_mark(draw, x, y, size, tile_color, stroke_color):
    """Kepang = braid: three interleaved strokes, same mark as the app."""
    r = size * 0.22
    draw.rounded_rectangle([x, y, x + size, y + size], radius=r, fill=tile_color)
    pad = size * 0.2
    span = size - pad * 2
    w = max(2, int(size * 0.075))
    for i, alpha_y in enumerate((0.30, 0.52, 0.74)):
        base_y = y + pad + span * alpha_y
        amp = span * 0.15
        pts = []
        for step in range(41):
            t = step / 40
            px = x + pad + span * t
            py = base_y - math.sin(t * math.pi * 2 + i * 0.7) * amp * (1 - i * 0.22)
            pts.append((px, py))
        draw.line(pts, fill=stroke_color, width=w, joint="curve")


def draw_text(draw, xy, text, fnt, fill, spacing_px=0):
    """Draw text, optionally with manual letter-spacing (PIL has none)."""
    if not spacing_px:
        draw.text(xy, text, font=fnt, fill=fill)
        return
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + spacing_px


# ----------------------------------------------------------------- layouts --
def build_dark(with_map=True, minimal=False):
    size = (W * SS, H * SS)
    img = vertical_gradient(size, DARK_BASE, DARK_DEEP).convert("RGB")

    glow, gmask = radial_glow(size, (size[0] * 0.86, size[1] * 0.12),
                              size[0] * 0.62, ACCENT, 46)
    img.paste(glow, (0, 0), gmask)
    glow2, gmask2 = radial_glow(size, (size[0] * 0.06, size[1] * 0.96),
                                size[0] * 0.45, (14, 165, 233), 22)
    img.paste(glow2, (0, 0), gmask2)

    if not minimal:
        grid, gridmask = blueprint_grid(size, (255, 255, 255), 16,
                                        56 * SS, fade_from_x=size[0] * 0.30)
        img.paste(grid, (0, 0), gridmask)

    if with_map:
        # Width is the binding dimension (Indonesia is ~2.7:1), so the map spans
        # exactly this box width - keep it under 0.57 so Papua's tip stays
        # inside the frame instead of bleeding off the right edge.
        map_w = int(size[0] * 0.56)
        map_h = int(size[1] * 0.82)
        layer = render_map_layer(
            (map_w, map_h),
            fill=(34, 197, 94, 26),
            outline=(110, 231, 183, 92),
            highlight_fill=(34, 197, 94, 74),
            line_w=max(1, SS),
        )
        # Fade the map out toward the frame centre so the speaker stays clear.
        ramp = Image.new("L", (map_w, 1))
        rpx = ramp.load()
        for x in range(map_w):
            t = min(1.0, max(0.0, (x / map_w - 0.06) / 0.5))
            rpx[x, 0] = int(255 * t)
        ramp = ramp.resize((map_w, map_h))
        faded = layer.copy()
        faded.putalpha(Image.composite(layer.getchannel("A"),
                                       Image.new("L", (map_w, map_h), 0), ramp))
        img.paste(faded, (int(size[0] * 0.40), int(size[1] * 0.10)), faded)

    d = ImageDraw.Draw(img)
    margin = int(52 * SS)
    corner_marks(d, (margin, margin, size[0] - margin, size[1] - margin),
                 (110, 231, 183), int(26 * SS), max(2, int(2 * SS)))

    lx, ly = int(96 * SS), int(88 * SS)
    if minimal:
        # Small mark bottom-left only - maximum quiet.
        bx, by = int(96 * SS), size[1] - int(190 * SS)
        braid_mark(d, bx, by, int(64 * SS), ACCENT, DARK_DEEP)
        draw_text(d, (bx + int(84 * SS), by + int(6 * SS)), "Kepang AI",
                  font("calibrib.ttf", int(38 * SS)), TEXT_ON_DARK)
        draw_text(d, (bx + int(84 * SS), by + int(56 * SS)),
                  "FOOD RESILIENCE INTELLIGENCE",
                  font("calibri.ttf", int(17 * SS)), MUTED_ON_DARK, spacing_px=1.6 * SS)
        return img

    braid_mark(d, lx, ly, int(88 * SS), ACCENT, DARK_DEEP)
    draw_text(d, (lx + int(114 * SS), ly + int(4 * SS)), "Kepang AI",
              font("calibrib.ttf", int(56 * SS)), TEXT_ON_DARK)
    draw_text(d, (lx + int(116 * SS), ly + int(72 * SS)),
              "FOOD RESILIENCE INTELLIGENCE",
              font("calibri.ttf", int(20 * SS)), ACCENT_SOFT, spacing_px=2.2 * SS)

    # Bottom-left strapline + live-dot, mirroring the app's sidebar footer.
    by = size[1] - int(150 * SS)
    dot_r = int(7 * SS)
    d.ellipse([lx, by + int(12 * SS), lx + dot_r * 2, by + int(12 * SS) + dot_r * 2],
              fill=ACCENT)
    draw_text(d, (lx + int(26 * SS), by), "Decision Intelligence untuk Ketahanan Pangan Daerah",
              font("calibri.ttf", int(26 * SS)), TEXT_ON_DARK)
    draw_text(d, (lx + int(26 * SS), by + int(42 * SS)),
              "BI Harga Pangan  ·  BMKG  ·  BPS  ·  NOAA",
              font("calibri.ttf", int(19 * SS)), MUTED_ON_DARK, spacing_px=0.8 * SS)
    return img


def build_light():
    size = (W * SS, H * SS)
    img = vertical_gradient(size, LIGHT_BASE, LIGHT_PANEL).convert("RGB")

    glow, gmask = radial_glow(size, (size[0] * 0.88, size[1] * 0.10),
                              size[0] * 0.55, ACCENT, 34)
    img.paste(glow, (0, 0), gmask)

    grid, gridmask = blueprint_grid(size, (11, 31, 23), 12, 56 * SS,
                                    fade_from_x=size[0] * 0.32)
    img.paste(grid, (0, 0), gridmask)

    map_w, map_h = int(size[0] * 0.56), int(size[1] * 0.80)
    layer = render_map_layer(
        (map_w, map_h),
        fill=(22, 163, 74, 30),
        outline=(22, 163, 74, 96),
        highlight_fill=(22, 163, 74, 78),
        line_w=max(1, SS),
    )
    ramp = Image.new("L", (map_w, 1))
    rpx = ramp.load()
    for x in range(map_w):
        t = min(1.0, max(0.0, (x / map_w - 0.06) / 0.5))
        rpx[x, 0] = int(255 * t)
    ramp = ramp.resize((map_w, map_h))
    faded = layer.copy()
    faded.putalpha(Image.composite(layer.getchannel("A"),
                                   Image.new("L", (map_w, map_h), 0), ramp))
    img.paste(faded, (int(size[0] * 0.42), int(size[1] * 0.11)), faded)

    d = ImageDraw.Draw(img)
    margin = int(52 * SS)
    corner_marks(d, (margin, margin, size[0] - margin, size[1] - margin),
                 (22, 163, 74), int(26 * SS), max(2, int(2 * SS)))

    lx, ly = int(96 * SS), int(88 * SS)
    braid_mark(d, lx, ly, int(88 * SS), (22, 163, 74), LIGHT_BASE)
    draw_text(d, (lx + int(114 * SS), ly + int(4 * SS)), "Kepang AI",
              font("calibrib.ttf", int(56 * SS)), TEXT_ON_LIGHT)
    draw_text(d, (lx + int(116 * SS), ly + int(72 * SS)),
              "FOOD RESILIENCE INTELLIGENCE",
              font("calibri.ttf", int(20 * SS)), (21, 128, 61), spacing_px=2.2 * SS)

    by = size[1] - int(150 * SS)
    dot_r = int(7 * SS)
    d.ellipse([lx, by + int(12 * SS), lx + dot_r * 2, by + int(12 * SS) + dot_r * 2],
              fill=(22, 163, 74))
    draw_text(d, (lx + int(26 * SS), by), "Decision Intelligence untuk Ketahanan Pangan Daerah",
              font("calibri.ttf", int(26 * SS)), TEXT_ON_LIGHT)
    draw_text(d, (lx + int(26 * SS), by + int(42 * SS)),
              "BI Harga Pangan  ·  BMKG  ·  BPS  ·  NOAA",
              font("calibri.ttf", int(19 * SS)), MUTED_ON_LIGHT, spacing_px=0.8 * SS)
    return img


VARIANTS = {
    "kepang-vbg-dark-map": lambda: build_dark(with_map=True),
    "kepang-vbg-dark-plain": lambda: build_dark(with_map=False),
    "kepang-vbg-minimal": lambda: build_dark(with_map=True, minimal=True),
    "kepang-vbg-light-map": build_light,
}


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, builder in VARIANTS.items():
        img = builder().resize((W, H), Image.LANCZOS)
        out = OUT_DIR / f"{name}.png"
        img.save(out, "PNG", optimize=True)
        print(f"{out.name}  {img.size[0]}x{img.size[1]}  {out.stat().st_size/1024:.0f} KB")


if __name__ == "__main__":
    main()
