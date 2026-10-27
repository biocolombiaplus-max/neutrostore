# Genera public/og-image.jpg (vista previa al compartir el link) a partir de
# public/logo.png. Requiere Pillow. Ejecutar desde la raíz del repo.
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H = 1200, 630
bg = Image.new('RGB', (W, H), (7, 7, 7))
glow = Image.new('L', (W, H), 0)
ImageDraw.Draw(glow).ellipse((W * 0.18, H * 0.02, W * 0.82, H * 0.9), fill=120)
glow = glow.filter(ImageFilter.GaussianBlur(170))
bg = Image.composite(Image.new('RGB', (W, H), (120, 92, 30)), bg, glow).convert('RGBA')

logo = Image.open('public/logo.png').convert('RGBA')
logo.thumbnail((640, 300), Image.LANCZOS)
bg.alpha_composite(logo, ((W - logo.width) // 2, 110))

d = ImageDraw.Draw(bg)
sans = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 34)
small = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', 26)
for text, font, y, fill in [
    ('ZAPATOS MULTIMARCA EN COLOMBIA', sans, 450, (241, 220, 154)),
    ('Envío a toda Colombia · Pago contra entrega · Nequi y Bancolombia', small, 506, (235, 235, 235)),
]:
    w = d.textlength(text, font=font)
    d.text(((W - w) / 2, y), text, font=font, fill=fill)
bg.convert('RGB').save('public/og-image.jpg', quality=88, optimize=True)
