# Genera public/camisetas/*.jpg: ilustración de camiseta para el catálogo de
# ejemplo (se reemplaza por las fotos reales desde /admin). Requiere Pillow.
from PIL import Image, ImageDraw, ImageFilter
S = 2
W = H = 1200 * S

def tee(color, name, shade):
    bg = Image.new('RGB', (W, H), (238, 236, 232))
    d = ImageDraw.Draw(bg)
    for y in range(H):
        t = y / H
        d.line((0, y, W, y), fill=(int(246 - 18 * t), int(244 - 18 * t), int(240 - 18 * t)))
    c = W / 2
    body = [
        (c - 250 * S, 260 * S), (c - 110 * S, 215 * S), (c - 70 * S, 250 * S), (c, 268 * S),
        (c + 70 * S, 250 * S), (c + 110 * S, 215 * S), (c + 250 * S, 260 * S),
        (c + 420 * S, 420 * S), (c + 335 * S, 535 * S), (c + 255 * S, 470 * S),
        (c + 262 * S, 1000 * S), (c - 262 * S, 1000 * S), (c - 255 * S, 470 * S),
        (c - 335 * S, 535 * S), (c - 420 * S, 420 * S),
    ]
    shadow = Image.new('L', (W, H), 0)
    ImageDraw.Draw(shadow).polygon([(x + 18 * S, y + 26 * S) for x, y in body], fill=110)
    shadow = shadow.filter(ImageFilter.GaussianBlur(28 * S))
    bg = Image.composite(Image.new('RGB', (W, H), (120, 118, 112)), bg, shadow)
    d = ImageDraw.Draw(bg)
    d.polygon(body, fill=color)
    # pliegues suaves
    fold = Image.new('L', (W, H), 0)
    fd = ImageDraw.Draw(fold)
    fd.line((c - 120 * S, 560 * S, c - 60 * S, 980 * S), fill=70, width=26 * S)
    fd.line((c + 150 * S, 600 * S, c + 110 * S, 960 * S), fill=55, width=22 * S)
    fold = fold.filter(ImageFilter.GaussianBlur(22 * S))
    bg = Image.composite(Image.new('RGB', (W, H), shade), bg, fold)
    d = ImageDraw.Draw(bg)
    # cuello y costuras
    # interior del cuello (espalda) y ribete
    d.ellipse((c - 104 * S, 205 * S, c + 104 * S, 290 * S), fill=shade)
    d.arc((c - 118 * S, 195 * S, c + 118 * S, 304 * S), 0, 180, fill=tuple(max(0, v - 18) for v in shade), width=14 * S)
    d.line((c - 250 * S, 990 * S, c + 250 * S, 990 * S), fill=shade, width=3 * S)
    d.line((c - 395 * S, 445 * S, c - 318 * S, 548 * S), fill=shade, width=3 * S)
    d.line((c + 395 * S, 445 * S, c + 318 * S, 548 * S), fill=shade, width=3 * S)
    bg.resize((1200, 1200), Image.LANCZOS).save(f'public/camisetas/{name}.jpg', quality=86, optimize=True)

tee((170, 204, 232), 'camiseta-celeste', (140, 176, 206))
tee((24, 24, 24), 'camiseta-negra', (52, 52, 52))
tee((246, 246, 244), 'camiseta-blanca', (214, 214, 210))
