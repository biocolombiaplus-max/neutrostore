# Genera public/logo.png (logo dorado provisional de Neutro Store, mismo
# estilo que el de la tienda base: monograma grande con el nombre cruzado).
# El logo definitivo se sube desde /admin/configuracion. Ejecutar desde la raíz.
from PIL import Image, ImageDraw, ImageFont
S = 3
W, H = 480 * S, 244 * S
GOLD_L, GOLD, GOLD_D = (233, 207, 128), (196, 160, 72), (138, 104, 36)
serif = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf', 250 * S)
sans = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', 34 * S)

mask = Image.new('L', (W, H), 0)
d = ImageDraw.Draw(mask)
mono = 'NS'
mw = d.textlength(mono, font=serif)
d.text(((W - mw) / 2, -30 * S), mono, font=serif, fill=255)

# Franja donde va el nombre: se "corta" el monograma para que el texto respire.
band_y, band_h = 112 * S, 52 * S
d.rectangle((0, band_y, W, band_y + band_h), fill=0)
name, track = 'NEUTRO STORE', 9 * S
widths = [sans.getlength(c) for c in name]
total = sum(widths) + track * (len(name) - 1)
x = (W - total) / 2
for c, wc in zip(name, widths):
    d.text((x, band_y + 6 * S), c, font=sans, fill=255)
    x += wc + track

grad = Image.new('RGB', (W, H))
gd = ImageDraw.Draw(grad)
for y in range(H):
    t = y / (H - 1)
    if t < 0.5:
        c = [int(GOLD_L[i] * (1 - t * 2) + GOLD[i] * t * 2) for i in range(3)]
    else:
        c = [int(GOLD[i] * (1 - (t - 0.5) * 2) + GOLD_D[i] * (t - 0.5) * 2) for i in range(3)]
    gd.line((0, y, W, y), fill=tuple(c))

out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
out.paste(grad, (0, 0), mask)
out = out.crop(out.getbbox())
out.thumbnail((480, 260), Image.LANCZOS)
out.save('public/logo.png', optimize=True)
print(out.size)
