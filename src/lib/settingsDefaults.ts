import type { SiteSettings } from './types';

// Valores de la tienda y su combinación con lo guardado en Firestore.
// Sin dependencias de Firebase: la tienda lo usa en cada página sin cargar
// la base de datos.

export const DEFAULT_SETTINGS: SiteSettings = {
  storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'Neutro Store',
  // El logo de Neutro Store viene incluido en /public — desde el panel
  // (Configuración → General) se puede reemplazar por otro.
  logoUrl: '/logo.png',
  logoHeight: 56,
  whatsappCountryCode: process.env.NEXT_PUBLIC_WHATSAPP_COUNTRY_CODE || '57',
  // WhatsApp oficial de la tienda (10 dígitos, ej. 3001234567). Se cambia
  // desde el panel: Configuración → General.
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
  notificationEmail: process.env.NEXT_PUBLIC_NOTIFICATION_EMAIL || '',
  // Píxel de Meta de la tienda. Se configura desde el panel:
  // Configuración → Píxel de Meta.
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
  metaDomainVerification: '',
  // Inicio oficial de ventas (0 = desde siempre). Se reinicia desde el panel.
  statsResetAt: 0,
  commissionPaid: [],
  collectionsMenu: [
    { label: 'Plataformas', value: 'plataformas' },
    { label: 'Planas / Slides', value: 'planas' },
    { label: 'Con tachas y apliques', value: 'tachas' },
    { label: 'Tacón y cuña', value: 'tacon' },
  ],
  featuredBrand: {
    enabled: true,
    name: 'Guess',
    eyebrow: 'La colección #1 de Neutro Store',
    heading: 'Pisa con estilo.',
    text: 'Sandalias de plataforma con el logo GUESS en metal dorado, plantilla acolchada y un diseño que estiliza cada paso. Las más pedidas por nuestras clientas en toda Colombia — con envío a tu puerta y pago contra entrega.',
    image: '/sandalias/guess-roja-3.jpg',
    badge: 'Más vendida',
    bullets: ['Logo metálico dorado', 'Plataforma liviana', 'Plantilla acolchada', 'Diseño premium'],
    buttonText: 'Comprar Guess',
  },
  brands: ['Guess', 'Neutro Store', 'Steve Madden', 'Michael Kors', 'Calvin Klein', 'Tommy Hilfiger', 'Aldo', 'Bata'],
  colors: {
    primary: '#B8923A',
    primaryHover: '#96742A',
    primaryLight: '#D9BE72',
    cream: '#FFFFFF',
    creamAlt: '#F6F2EA',
    ink: '#0E0E0E',
    muted: '#6E6759',
    border: '#E7E1D4',
  },
  fonts: {
    headingFont: 'Montserrat',
    bodyFont: 'Montserrat',
  },
  announcementMessages: [
    '👡 Nueva colección de sandalias para mujer — ya disponible',
    '🚚 Envíos a toda Colombia — llegamos a tu puerta',
    '💵 Contra entrega: hoy solo $15.000 para garantizar tu envío y el resto al recibir',
    '🏦 Paga por transferencia, Nequi o depósito en Bancolombia',
    '🛡️ Compra segura · Garantía Neutro',
    '🔄 ¿No te quedó? Solicita tu cambio de talla hasta 48 h después de recibir',
    '⚡ Pilas: las más vendidas se agotan rapidito',
  ],
  hero: {
    eyebrow: 'Colección verano 2026 · Mujer',
    heading: 'Sandalias que enamoran a cada paso',
    subtext:
      'Plataformas, slides y diseños con tachas doradas para lucir increíble todo el día. Envío a toda Colombia y pagas por transferencia, Nequi o contra entrega.',
    images: ['/sandalias/portada-roja.jpg', '/sandalias/portada-negra.jpg'],
    badge1: '🚚 Envío a toda Colombia',
    badge2: '💵 Contra entrega',
    badge3: '🛡️ Compra segura',
    button1Text: 'Ver colección',
    button1Url: '/catalogo?genero=mujer',
    button2Text: 'Ver ofertas',
    button2Url: '/catalogo?ofertas=1',
    titleSize: 'lg',
    subtextSize: 'md',
  },
  shipping: {
    // Envío con Servientrega pagando por transferencia; se suma recién en el
    // checkout. Los departamentos con tarifa propia se agregan en el panel.
    defaultRate: 15000,
    rates: [
      { province: 'San Andrés y Providencia', rate: 35000 },
      { province: 'Amazonas', rate: 35000 },
    ],
    deliveryTime: '24 a 72 horas hábiles',
  },
  courier: { name: 'Servientrega', logoUrl: '' },
  paymentLogos: [
    { id: 'bancolombia', name: 'Bancolombia', imageUrl: '', enabled: true },
    { id: 'nequi', name: 'Nequi', imageUrl: '', enabled: true },
    { id: 'daviplata', name: 'DaviPlata', imageUrl: '', enabled: true },
    { id: 'davivienda', name: 'Davivienda', imageUrl: '', enabled: true },
    { id: 'bbva', name: 'BBVA', imageUrl: '', enabled: true },
    { id: 'bogota', name: 'Banco de Bogotá', imageUrl: '', enabled: false },
    { id: 'pse', name: 'PSE', imageUrl: '', enabled: true },
    { id: 'visa', name: 'Visa', imageUrl: '', enabled: true },
    { id: 'mastercard', name: 'Mastercard', imageUrl: '', enabled: true },
    { id: 'diners', name: 'Diners Club', imageUrl: '', enabled: false },
  ],
  exchangeWindowHours: 48,
  payments: {
    codAdvance: 15000,
    codEnabled: true,
    codUnitPrice: 209900,
    defaultPrice: 189900,
    // Cuentas de ejemplo: reemplázalas desde el panel (Configuración → Pagos).
    bankAccounts: [
      {
        bank: 'Bancolombia',
        type: 'Cuenta de ahorros',
        number: '00000000000',
        holder: 'Neutro Store',
        idNumber: '',
      },
      {
        bank: 'Nequi',
        type: 'Celular Nequi',
        number: '3000000000',
        holder: 'Neutro Store',
        idNumber: '',
      },
    ],
    transferNote: 'Envíanos la foto del comprobante por WhatsApp y despachamos tu pedido ese mismo día.',
  },
  realDeliveries: { enabled: true, heading: 'Entregas reales en toda Colombia', photos: [] },
  chatProofs: {
    enabled: true,
    heading: 'Lo que nos escriben por WhatsApp',
    subheading: 'Mensajes reales de clientas que ya recibieron sus sandalias',
    photos: [],
  },
  categoryTiles: {
    enabled: true,
    eyebrow: 'Colecciones para ella',
    heading: '¿Qué estilo eres tú?',
    tiles: [
      {
        label: 'Plataformas',
        sub: 'Altura y comodidad todo el día',
        href: '/catalogo?genero=mujer&estilo=plataformas',
        image: '/sandalias/guess-roja-2.jpg',
        buttonText: 'Comprar',
      },
      {
        label: 'Con tachas',
        sub: 'Brillo dorado que se nota',
        href: '/catalogo?genero=mujer&estilo=tachas',
        image: '/sandalias/tachas-negra-2.jpg',
        buttonText: 'Comprar',
      },
      {
        label: 'Planas / Slides',
        sub: 'Fáciles, frescas y cómodas',
        href: '/catalogo?genero=mujer&estilo=planas',
        image: '/sandalias/tachas-negra-1.jpg',
        buttonText: 'Comprar',
      },
      {
        label: 'Ofertas',
        sub: 'Precios que no se repiten',
        href: '/catalogo?ofertas=1',
        image: '/sandalias/guess-roja-3.jpg',
        buttonText: 'Comprar',
      },
    ],
  },
  trustItems: [
    { icon: '🚚', title: 'Envío Servientrega', sub: 'A toda Colombia' },
    { icon: '💵', title: 'Contra entrega', sub: 'Hoy solo $15.000' },
    { icon: '🏦', title: 'Transferencia', sub: 'Bancolombia y Nequi' },
    { icon: '🛡️', title: 'Compra segura', sub: 'Garantía Neutro' },
    { icon: '🔄', title: 'Cambio de talla', sub: 'Hasta 48 h tras recibir' },
  ],
  benefitsHeading: '¿Por qué comprar en Neutro Store?',
  benefits: [
    {
      icon: '✅',
      title: 'Calidad garantizada',
      text: 'Revisamos cada par antes de despacharlo. Si llega con un defecto de fábrica, te lo cambiamos. Así de claro.',
    },
    {
      icon: '💵',
      title: 'Pagas al recibir',
      text: 'Con contra entrega hoy pagas solo $15.000 para garantizar tu envío y el resto cuando tienes tus sandalias en la mano.',
    },
    {
      icon: '📏',
      title: 'Tu talla, a la primera',
      text: 'Guía de tallas súper clara y asesoría por WhatsApp. ¿No te quedó? Avísanos por WhatsApp dentro de las 48 horas de recibido y gestionamos el cambio.',
    },
    {
      icon: '⚡',
      title: 'Despacho de una',
      text: 'Pagas, nos envías el comprobante y despachamos el mismo día. Llega en 24 a 72 horas a todo el país.',
    },
  ],
  testimonialsHeading: 'Lo que dicen nuestras clientas',
  testimonialsSubtext: 'Clientas de toda Colombia que ya estrenaron con Neutro',
  testimonials: [
    {
      name: 'Valentina G.',
      city: 'Bogotá',
      review:
        'Súper recomendadas. Pedí las Guess rojas por contra entrega, adelanté los $15.000 y me llegaron en dos días, con su caja y todo. De una vuelvo a comprar.',
    },
    {
      name: 'Gabriela V.',
      city: 'Medellín',
      review:
        'Muy bacana la atención por WhatsApp. Me ayudaron con la talla y me quedaron perfectas. Pagué por transferencia y al otro día ya las tenía.',
    },
    {
      name: 'Daniela C.',
      city: 'Cali',
      review:
        'Tenía miedo de comprar en línea, pero con el pago al recibir me dio confianza. Las de tachas doradas están divinas, tal cual las fotos.',
    },
    {
      name: 'María José P.',
      city: 'Barranquilla',
      review: 'Rápidos y serios. Me mandaron la guía de Servientrega de una y llegó a la casa. 10 de 10.',
    },
  ],
  faqs: [
    {
      question: '¿Cómo funciona el pago contra entrega?',
      answer:
        'Hoy pagas solo $15.000 del envío por transferencia, Nequi o depósito en Bancolombia para garantizar tu pedido. Tus sandalias las pagas en efectivo cuando Servientrega te los entrega en la dirección que nos diste. Así los dos quedamos tranquilos.',
    },
    {
      question: '¿Cómo pago por transferencia o depósito?',
      answer:
        'Al confirmar tu pedido te mostramos nuestras cuentas de Bancolombia y Nequi. Haces la transferencia desde tu banco o app, o el depósito en un Corresponsal Bancolombia, nos mandas la foto del comprobante por WhatsApp y despachamos ese mismo día.',
    },
    {
      question: '¿Qué garantía tengo?',
      answer:
        'Revisamos cada par antes de enviarlo. Si tu pedido llega con un defecto de fábrica o no es lo que pediste, te lo cambiamos sin costo. Y con contra entrega pagas el resto solo cuando lo tienes en tus manos.',
    },
    {
      question: '¿Cuánto se demora en llegar?',
      answer:
        'Despachamos el mismo día que confirmas. En ciudades principales (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga...) llega en 24 a 48 horas; en el resto del país, de 48 a 72 horas hábiles.',
    },
    {
      question: '¿Y si no me queda la talla?',
      answer:
        'Escríbenos por WhatsApp máximo 48 horas después de recibir tu pedido. La sandalia debe estar sin uso, con su caja y etiquetas. Nos envías fotos, coordinamos el retiro y te despachamos la nueva talla. Pasadas las 48 horas no podemos procesar el cambio.',
    },
    {
      question: '¿Cómo sé cuál es mi talla?',
      answer:
        'En cada producto tienes el botón "¿Cuál es mi talla?": mides tu pie en centímetros y te decimos la talla exacta. También puedes tomarle foto a la etiqueta de tus zapatos o sandalias y te la calculamos al instante.',
    },
  ],
  cta: {
    eyebrow: '¿Qué esperas, reina?',
    heading: 'Estrena hoy. Paga al recibir.',
    text: 'Elige tus sandalias, confirma por WhatsApp y te llegan a la puerta de tu casa en cualquier rincón de Colombia.',
    buttonText: 'Ver sandalias',
    buttonUrl: '/catalogo?genero=mujer',
  },
  footer: {
    brandText:
      'Sandalias para mujer en Colombia: plataformas, slides y diseños con tachas, de Guess y más marcas, con envío a todo el país.',
    contactText: '¿Dudas con tu talla o tu pedido? Escríbenos, te respondemos de una.',
    email: '',
    address: 'Colombia',
    instagram: '',
    facebook: '',
    tiktok: '',
    youtube: '',
    mapQuery: '',
    copyrightText: '',
  },
};

// La marca estrella siempre va primera en la lista de marcas (menú, cinta,
// footer), aunque en el panel se haya guardado otro orden.
function withFeaturedFirst(brands: string[], featured: { enabled: boolean; name: string }): string[] {
  if (!featured.enabled || !featured.name.trim()) return brands;
  const name = featured.name.trim();
  return [name, ...brands.filter((b) => b.trim().toLowerCase() !== name.toLowerCase())];
}

export function mergeWithDefaults(data: Partial<SiteSettings> | undefined): SiteSettings {
  if (!data) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    colors: { ...DEFAULT_SETTINGS.colors, ...data.colors },
    fonts: { ...DEFAULT_SETTINGS.fonts, ...data.fonts },
    hero: {
      ...DEFAULT_SETTINGS.hero,
      ...data.hero,
      // El texto viejo por defecto del botón principal pasa a "Ver catálogo".
      button1Text:
        !data.hero?.button1Text || data.hero.button1Text.trim().toLowerCase() === 'comprar ahora'
          ? DEFAULT_SETTINGS.hero.button1Text
          : data.hero.button1Text,
      images: data.hero?.images?.length ? data.hero.images : DEFAULT_SETTINGS.hero.images,
    },
    cta: { ...DEFAULT_SETTINGS.cta, ...data.cta },
    footer: { ...DEFAULT_SETTINGS.footer, ...data.footer, email: data.footer?.email || DEFAULT_SETTINGS.footer.email },
    shipping: {
      ...DEFAULT_SETTINGS.shipping,
      ...data.shipping,
      rates: data.shipping?.rates ?? DEFAULT_SETTINGS.shipping.rates,
    },
    payments: {
      ...DEFAULT_SETTINGS.payments,
      ...data.payments,
      // Las cuentas de ejemplo (número vacío o solo ceros) no se muestran.
      bankAccounts: data.payments?.bankAccounts?.some((b) => !/^0*$/.test(b.number.replace(/\D/g, '')))
        ? data.payments.bankAccounts.filter((b) => !/^0*$/.test(b.number.replace(/\D/g, '')))
        : DEFAULT_SETTINGS.payments.bankAccounts,
    },
    courier: { ...DEFAULT_SETTINGS.courier, ...data.courier, name: data.courier?.name || DEFAULT_SETTINGS.courier.name },
    paymentLogos: data.paymentLogos ?? DEFAULT_SETTINGS.paymentLogos,
    logoUrl: data.logoUrl || DEFAULT_SETTINGS.logoUrl,
    whatsappNumber: data.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
    whatsappCountryCode: data.whatsappCountryCode || DEFAULT_SETTINGS.whatsappCountryCode,
    notificationEmail: data.notificationEmail || DEFAULT_SETTINGS.notificationEmail,
    metaPixelId: (data.metaPixelId || DEFAULT_SETTINGS.metaPixelId).replace(/\D/g, ''),
    metaDomainVerification: (data.metaDomainVerification ?? '').trim(),
    statsResetAt: typeof data.statsResetAt === 'number' ? data.statsResetAt : DEFAULT_SETTINGS.statsResetAt,
    commissionPaid: Array.isArray(data.commissionPaid) ? data.commissionPaid : [],
    logoHeight: data.logoHeight ?? DEFAULT_SETTINGS.logoHeight,
    exchangeWindowHours: data.exchangeWindowHours || DEFAULT_SETTINGS.exchangeWindowHours,
    collectionsMenu: data.collectionsMenu ?? DEFAULT_SETTINGS.collectionsMenu,
    brands: withFeaturedFirst(data.brands?.length ? data.brands : DEFAULT_SETTINGS.brands, {
      ...DEFAULT_SETTINGS.featuredBrand,
      ...data.featuredBrand,
    }),
    featuredBrand: {
      ...DEFAULT_SETTINGS.featuredBrand,
      ...data.featuredBrand,
      bullets: data.featuredBrand?.bullets?.length ? data.featuredBrand.bullets : DEFAULT_SETTINGS.featuredBrand.bullets,
    },
    announcementMessages: data.announcementMessages?.length ? data.announcementMessages : DEFAULT_SETTINGS.announcementMessages,
    categoryTiles: {
      ...DEFAULT_SETTINGS.categoryTiles,
      ...data.categoryTiles,
      tiles: data.categoryTiles?.tiles ?? DEFAULT_SETTINGS.categoryTiles.tiles,
    },
    realDeliveries: {
      ...DEFAULT_SETTINGS.realDeliveries,
      ...data.realDeliveries,
      photos: Array.isArray(data.realDeliveries?.photos) ? data.realDeliveries.photos : [],
    },
    chatProofs: {
      ...DEFAULT_SETTINGS.chatProofs,
      ...data.chatProofs,
      photos: Array.isArray(data.chatProofs?.photos) ? data.chatProofs.photos : [],
    },
    trustItems: data.trustItems?.length ? data.trustItems : DEFAULT_SETTINGS.trustItems,
    benefits: data.benefits?.length ? data.benefits : DEFAULT_SETTINGS.benefits,
    testimonials: data.testimonials?.length ? data.testimonials : DEFAULT_SETTINGS.testimonials,
    faqs: data.faqs?.length ? data.faqs : DEFAULT_SETTINGS.faqs,
  };
}

