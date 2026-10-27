import type { Product } from './types';

// Catálogo de demostración: se muestra mientras la tienda todavía no tiene
// productos propios cargados desde el panel (o mientras Firebase no está
// configurado), para que la página se vea completa desde el primer día. En
// cuanto se publica el primer producto real desde /admin, este catálogo deja
// de mostrarse automáticamente.

const DAY = 24 * 60 * 60 * 1000;
const BASE = Date.UTC(2026, 8, 1);

const SANDAL_SIZES = ['35', '36', '37', '38', '39', '40'];
const TEE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const REVIEWS = {
  sandal: [
    { name: 'Valentina G.', city: 'Bogotá', rating: 5, text: 'Divinas en persona, el rojo es hermoso y la plataforma es súper cómoda. Me llegaron en 2 días.' },
    { name: 'Laura M.', city: 'Medellín', rating: 5, text: 'Las pedí contra entrega y todo perfecto. Talla exacta con la guía.' },
    { name: 'Daniela R.', city: 'Barranquilla', rating: 5, text: 'Perfectas para el calor, las uso todo el día y no maltratan.' },
  ],
  camiseta: [
    { name: 'Sebastián R.', city: 'Barranquilla', rating: 5, text: 'La tela es otra cosa, gruesita y suave. La M me quedó perfecta.' },
    { name: 'Camilo T.', city: 'Bogotá', rating: 5, text: 'No se deforma con las lavadas. Ya pedí otra en negro.' },
    { name: 'Andrea V.', city: 'Medellín', rating: 4, text: 'Se la regalé a mi novio y le encantó, el corte es muy bonito.' },
  ],
  tachas: [
    { name: 'Natalia P.', city: 'Cali', rating: 5, text: 'Las tachas brillan muchísimo, todo el mundo me pregunta dónde las compré.' },
    { name: 'Juliana C.', city: 'Bucaramanga', rating: 5, text: 'Cómodas y elegantes. Me asesoraron por WhatsApp con la talla, quedaron perfectas.' },
    { name: 'Mariana S.', city: 'Pereira', rating: 4, text: 'Bellísimas, tal cual las fotos. Ya pedí otro par para mi hermana.' },
  ],
};

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-guess-plataforma-roja',
    slug: 'guess-sandalia-plataforma-roja',
    title: 'Guess · Sandalia Plataforma H',
    brand: 'Guess',
    line: 'Plataforma',
    gender: 'mujer',
    category: 'sandalias',
    description:
      'La sandalia de la temporada: tira en H de textura granulada con el logo GUESS en metal dorado y plataforma acolchada que estiliza sin sacrificar comodidad. Se ve increíble con jean, vestido o shorts.\n\n• Tira en H con logo metálico dorado\n• Plantilla acolchada en cuero sintético\n• Plataforma liviana de 4 cm con costura decorativa\n• Suela antideslizante\n• Incluye su caja',
    price: 189900,
    compareAtPrice: 249900,
    images: ['/sandalias/guess-roja-1.jpg', '/sandalias/guess-roja-2.jpg', '/sandalias/guess-roja-3.jpg'],
    sizes: SANDAL_SIZES,
    colors: [{ name: 'Rojo', hex: '#C8202B', hex2: '#111111' }],
    collection: 'plataformas',
    fit: 'normal',
    stock: 8,
    featured: true,
    isNew: true,
    active: true,
    soldCount: 412,
    reviewsCount: 126,
    reviews: REVIEWS.sandal,
    createdAt: BASE,
  },
  {
    id: 'demo-sandalia-tachas-negra',
    slug: 'sandalia-h-tachas-doradas-negra',
    title: 'Sandalia H con Tachas Doradas',
    brand: 'Neutro Store',
    line: 'Tachas',
    gender: 'mujer',
    category: 'sandalias',
    description:
      'Glam para todos los días: tira en H cubierta de tachas doradas de diferentes tamaños sobre una base negra súper cómoda. El detalle que levanta cualquier outfit.\n\n• Tachas metálicas doradas aplicadas a mano\n• Base acolchada anatómica\n• Suela flexible y antideslizante\n• Horma cómoda para uso diario\n• Incluye su caja',
    price: 149900,
    compareAtPrice: 199900,
    images: ['/sandalias/tachas-negra-1.jpg', '/sandalias/tachas-negra-2.jpg', '/sandalias/tachas-negra-3.jpg'],
    sizes: SANDAL_SIZES,
    colors: [{ name: 'Negro / Dorado', hex: '#111111', hex2: '#C9A646' }],
    collection: 'planas',
    fit: 'normal',
    stock: 10,
    featured: true,
    isNew: true,
    active: true,
    soldCount: 538,
    reviewsCount: 164,
    reviews: REVIEWS.tachas,
    createdAt: BASE - DAY,
  },
  {
    id: 'demo-camiseta-monastery-celeste',
    slug: 'monastery-camiseta-logo-line-celeste',
    title: 'Monastery · Camiseta Logo Line',
    brand: 'Monastery',
    line: 'Logo Line',
    gender: 'unisex',
    category: 'camisetas',
    description:
      'Camiseta premium de algodón con el logo MONASTERY repetido en línea al frente. Corte regular, cuello redondo acanalado y una tela suave que conserva su forma lavada tras lavada.\n\n• 100% algodón premium\n• Estampado frontal en línea\n• Cuello redondo acanalado\n• Corte regular, unisex\n• Con sus etiquetas originales',
    price: 129900,
    compareAtPrice: 169900,
    images: ['/camisetas/camiseta-celeste.jpg'],
    sizes: TEE_SIZES,
    colors: [{ name: 'Celeste', hex: '#AACCE8' }],
    collection: 'estampadas',
    fit: 'normal',
    stock: 12,
    featured: true,
    isNew: true,
    active: true,
    soldCount: 298,
    reviewsCount: 87,
    reviews: REVIEWS.camiseta,
    createdAt: BASE - 2 * DAY,
  },
  {
    id: 'demo-camiseta-essential-negra',
    slug: 'camiseta-essential-negra',
    title: 'Camiseta Essential Oversize',
    brand: 'Neutro Store',
    line: 'Essential',
    gender: 'unisex',
    category: 'camisetas',
    description:
      'La básica que combina con todo: corte oversize, algodón pesado y caída perfecta. Ideal para el día a día con jean, jogger o shorts.\n\n• Algodón pesado 220 g\n• Corte oversize con hombro caído\n• Cuello redondo reforzado\n• Unisex',
    price: 89900,
    compareAtPrice: 119900,
    images: ['/camisetas/camiseta-negra.jpg', '/camisetas/camiseta-blanca.jpg'],
    sizes: TEE_SIZES,
    colors: [
      { name: 'Negro', hex: '#181818', image: '/camisetas/camiseta-negra.jpg' },
      { name: 'Blanco', hex: '#F6F6F4', image: '/camisetas/camiseta-blanca.jpg' },
    ],
    collection: 'basicas',
    fit: 'normal',
    stock: 20,
    featured: true,
    isNew: false,
    active: true,
    soldCount: 356,
    reviewsCount: 102,
    reviews: REVIEWS.camiseta,
    createdAt: BASE - 3 * DAY,
  },
];
