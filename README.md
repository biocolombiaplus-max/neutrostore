# Neutro Store — Tienda online de zapatos multimarca (Colombia)

Tienda de ecommerce completa estilo Shopify, sin Shopify: Next.js 14 + Tailwind,
Firebase (Firestore + Auth) como backend, Cloudinary para las fotos y lista
para desplegar en Vercel. Es la misma tienda de Brooklyn Store (Ecuador) con
el mismo diseño (dorado / negro / blanco) y todas sus funciones, adaptada a
Colombia:

| | Brooklyn Store (Ecuador) | **Neutro Store (Colombia)** |
|---|---|---|
| Moneda | Dólares (USD) | **Pesos colombianos (COP)**, sin decimales: `$199.900` |
| Envíos | Provincias y cantones | **33 departamentos y sus 1.100+ municipios** (datos DANE) |
| WhatsApp | +593, 9 dígitos | **+57, celular de 10 dígitos** (`300 123 4567`) |
| Pagos | Pichincha, Deuna… | **Bancolombia, Nequi, DaviPlata, Davivienda, BBVA, PSE…** |
| Transportadora | Servientrega | **Servientrega, Interrapidísimo, Coordinadora, Envía, TCC** |
| Tallas | EC | **CO** |
| Legal | Leyes de Ecuador | **Ley 1480/2011 (consumidor, retracto) y Ley 1581/2012 (datos)** |

## Qué incluye

- **Tienda multimarca con tipos de producto**: por ahora **Sandalias** y
  **Camisetas**. En `/admin/configuracion` → *Tipos de producto* se crean
  más (gorras, jeans, bolsos…) con su ícono, foto, y tipo de tallas
  (calzado 34–45 con guía por centímetros, ropa XS–XXL con tabla de medidas,
  o talla única). Cada tipo aparece en el menú, en la portada (tarjeta +
  vitrina con sus más vendidos) y como pestaña/filtro del catálogo
  (`/catalogo?tipo=camisetas`). Al crear un producto se elige su tipo y las
  tallas cambian solas.

- **Inicio tipo tienda deportiva grande**: portada a pantalla completa, barra
  de confianza, cinta de marcas, marca destacada, categorías, productos con
  pestañas (Más vendidos / Lo nuevo / Ofertas), formas de pago, cómo comprar,
  guía de tallas, beneficios, testimonios, entregas reales, chats de clientes,
  preguntas frecuentes y llamado final.
- **Catálogo con filtros** por género, marca, estilo, talla (CO), precio y
  ofertas + buscador.
- **Ficha de producto** con galería, selector de talla, calculadora "¿Cuál es
  mi talla?", lector de etiqueta, horma, temporizador, reseñas y barra fija de
  compra en celular.
- **Pagos (los dos terminan confirmando el pedido por WhatsApp):**
  - 🏦 **Transferencia / Nequi / depósito**: paga el total + envío (tarifa
    general y tarifas por departamento configurables).
  - 💵 **Contra entrega**: el cliente adelanta solo el envío (**$15.000** por
    defecto, editable) y paga el resto en efectivo al recibir.
- **Formulario de envío de Colombia**: departamento → ciudad/municipio (la
  capital aparece primero), dirección, referencia, cédula, ubicación GPS.
- **Panel administrativo** en `/admin`: productos, carga rápida con IA,
  pedidos (con guía y mensajes de estado por WhatsApp), pedidos manuales,
  visitantes, fidelización y **configuración en vivo** de TODO:
  - nombre de la tienda y **logo** (se sube desde el panel), tamaño del logo,
    colores y tipografías;
  - WhatsApp, correo de pedidos, píxel de Meta;
  - cuentas bancarias / Nequi, adelanto de contra entrega, precios generales;
  - envíos: tarifa general, **tarifa por departamento** y tiempo de entrega;
  - transportadora y logos de medios de pago;
  - portada, anuncios, categorías, marcas, beneficios, testimonios, FAQ, CTA;
  - pie de página: textos, correo, dirección, **mapa de Google** (escribe la
    dirección y aparece el mapa), **Instagram, Facebook, TikTok y YouTube**.

### Funciona desde el primer día

Sin Firebase configurado la tienda muestra un **catálogo de demostración** de
15 modelos con fotos de ejemplo y los pedidos llegan completos a WhatsApp.
Apenas publicas tu primer producto desde `/admin`, el catálogo de
demostración desaparece solo.

> ⚠️ Antes de vender, entra a `/admin/configuracion` y pon: tu **número de
> WhatsApp**, tus **cuentas reales** (Bancolombia / Nequi — las que vienen son
> de ejemplo), el **correo** para recibir pedidos, tu **logo** y tus redes.
> El logo incluido en `public/logo.png` es provisional (se regenera con
> `python3 scripts/logo.py`).

## 1. Crear el proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/) → **Crear proyecto**.
2. Dentro del proyecto, activa:
   - **Firestore Database** (modo producción, elige una región cercana, ej. `southamerica-east1`).
   - **Authentication** → método **Correo/Contraseña**.

   (Firebase **Storage** no se usa — ahora exige el plan de pago Blaze incluso
   para uso gratuito, así que las fotos de producto se hospedan en Cloudinary,
   ver paso 1.b.)
3. Ve a **Configuración del proyecto → Tus apps → Agregar app Web (`</>`)**.
   Copia los valores del objeto `firebaseConfig`.

## 1.b. Fotos de producto: Cloudinary (opcional)

Sin Cloudinary las fotos igual se suben: se comprimen en el navegador (WebP,
menos de 900 KB) y se guardan en Firestore, en la colección `images`; la
tienda las sirve desde `/api/img/<id>` con caché de un año. Cloudinary es
opcional y agrega recorte inteligente con IA.

### Crear cuenta en Cloudinary (gratis, sin tarjeta)

1. Ve a [cloudinary.com](https://cloudinary.com) → **Sign up free** (con correo o Google, no pide tarjeta).
2. En el dashboard, copia tu **Cloud name** (aparece arriba, ej. `dxxxx1234`).
3. Ve a **Settings (⚙️) → Upload → Upload presets → Add upload preset**.
   - **Signing Mode**: cámbialo a **Unsigned**.
   - Dale un nombre corto (ej. `neutro_productos`) y **Save**.
4. Guarda esos dos valores (Cloud name y el nombre del preset) para el siguiente paso.

## 2. Configurar variables de entorno

Dentro de `webapp/`:

```bash
cp .env.local.example .env.local
```

Completa `.env.local` con los valores de Firebase y Cloudinary de los pasos
anteriores, y los datos de tu WhatsApp (`NEXT_PUBLIC_WHATSAPP_NUMBER`, celular de
10 dígitos sin el +57).

## 3. Instalar dependencias y correr localmente

```bash
cd webapp
npm install
npm run dev
```

Abre http://localhost:3000

## 4. Publicar las reglas de seguridad

Instala el CLI de Firebase (una sola vez) y publica `firestore.rules`:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # selecciona tu proyecto, usa el archivo ya existente
firebase deploy --only firestore:rules
```

Si prefieres no usar el CLI, puedes pegar el contenido de `firestore.rules`
directamente en la consola de Firebase (Firestore Database → Reglas) y
publicar desde ahí.

## 5. Entrar al panel: solo la contraseña `123456`

El panel `/admin/login` pide **solo la contraseña**: escribe **`123456`** y
entras. No hay que crear usuarios a mano: la primera vez que se escribe
`123456`, el panel crea solo su cuenta de Firebase (`admin@neutrostore.co`)
y esa cuenta queda como administradora (regla `isAdmin` de `firestore.rules`).

Lo único que hay que tener activo en Firebase (una sola vez):

1. **Authentication → Sign-in method → Correo electrónico/contraseña:
   Habilitar.**
2. Las reglas de `firestore.rules` publicadas (paso 4).
3. Las variables `NEXT_PUBLIC_FIREBASE_*` en Vercel (paso 7).

> ⚠️ Cualquier persona que escriba `123456` en `/admin/login` puede editar
> la tienda. Cuando quieras más seguridad, cámbiala en
> **/admin/configuracion → 🔐 Contraseña del panel**. (La contraseña inicial
> se puede cambiar también con la variable `NEXT_PUBLIC_ADMIN_INITIAL_PASSWORD`.)

Después de entrar una vez, en ese navegador la tienda muestra una pestaña
**✏️ Editar** al lado izquierdo: abre el panel justo en la sección que
quieres cambiar (portada, categorías, tipos de producto, logo, colores,
pagos, envíos, pie de página, redes y mapa) o en el producto que estás viendo.

## 6. (Opcional) Cargar productos de ejemplo

```bash
echo "SEED_ADMIN_EMAIL=tu-correo@ejemplo.com" >> .env.local
echo "SEED_ADMIN_PASSWORD=tu-contraseña" >> .env.local
npm run seed
```

Esto sube los 15 modelos del catálogo de demostración — entra a
`/admin/productos` para ajustar precios, stock y cambiar las fotos por las reales.

## 7. Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) → **Add New → Project** → importa
   este repositorio de GitHub.
2. Deja el **Root Directory** en la raíz del repositorio (`./`).
3. En **Environment Variables**, agrega las mismas variables de tu
   `.env.local` (las `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_CLOUDINARY_*`,
   `NEXT_PUBLIC_STORE_NAME`, `NEXT_PUBLIC_WHATSAPP_COUNTRY_CODE`,
   `NEXT_PUBLIC_WHATSAPP_NUMBER` y `NEXT_PUBLIC_SITE_URL`). Sin las de
   Firebase la tienda igual funciona con el catálogo de demostración.
4. Click **Deploy**. En unos minutos tendrás tu tienda en una URL
   `tu-proyecto.vercel.app` — puedes conectar tu dominio propio desde
   **Project Settings → Domains**.

Cada vez que hagas `git push` a la rama conectada, Vercel vuelve a desplegar
automáticamente.

## Comisión de la agencia (Biomarketing) por ventas de Meta Ads

Biomarketing gana **$5.000 por cada venta confirmada** que viene de sus
campañas de Meta Ads. El panel (`/admin`) muestra la ganancia de la quincena
(del 1 al 15 y del 16 a fin de mes), lo que está por confirmar, el historial
y el botón **Marcar pagada**. Nombre, valor, si se paga por venta o por
unidad y si cuentan solo las ventas de Meta se editan en
**Configuración → 💼 Comisión de la agencia**.

Cómo se sabe que una venta vino de Meta Ads:

- **Automático:** si el cliente entra desde un anuncio (Meta agrega `fbclid`
  al link, o usas `utm_source=fb|ig` con `utm_medium=paid`), la tienda lo
  recuerda **30 días** en ese celular y el pedido queda marcado
  **📣 Meta Ads** con su campaña. Recomendado en los anuncios:
  `?utm_source={{site_source_name}}&utm_medium=paid&utm_campaign={{campaign.name}}`
- **A mano:** en **Pedidos** cada pedido tiene el botón **📣 Meta Ads** para
  marcarlo o quitarlo (por ejemplo, ventas de anuncios que abren WhatsApp
  directo), y el pedido manual tiene la casilla “Esta venta viene de una
  campaña de Meta Ads”. El filtro **📣 Meta Ads** muestra solo esas ventas.

## Notificación por correo de cada pedido nuevo

Igual que la notificación automática de Shopify, puedes recibir un correo
con diseño profesional cada vez que alguien complete un pedido (sin importar
el método de pago). Usa [Resend](https://resend.com) — tiene plan gratis
(3.000 correos/mes) y no requiere tarjeta para empezar.

1. Crea una cuenta gratis en [resend.com](https://resend.com) y genera una
   **API Key** en **API Keys > Create API Key**.
2. Agrega esa llave como `RESEND_API_KEY` en **Vercel > Project Settings >
   Environment Variables** (nunca lleva el prefijo `NEXT_PUBLIC_`, porque el
   correo se envía desde el servidor en `/api/notify-order`, no desde el
   navegador).
3. En `/admin/configuracion`, sección **General**, escribe el correo donde
   quieres recibir los pedidos en **"Correo para recibir notificación de
   cada pedido nuevo"**.
4. (Opcional pero recomendado) Por defecto los correos se envían desde
   `onboarding@resend.dev`, una dirección de pruebas de Resend que solo
   entrega de forma confiable al correo con el que creaste la cuenta. Para
   recibir en cualquier correo (el de tu negocio, tu contador, etc.) sin
   restricciones, verifica tu propio dominio en **Resend > Domains** y
   agrega `RESEND_FROM_EMAIL` con un remitente de ese dominio, por ejemplo:
   `Brooklyn Shoes <pedidos@tudominio.com>`.

Si no configuras `RESEND_API_KEY`, el checkout sigue funcionando normal —
simplemente no se envía el correo.

## Notificación push al celular (como la app de Shopify)

Además del correo, la administradora puede recibir un **aviso push en el
celular** cada vez que llega un pedido — con sonido y vibración del
sistema, funcione o no la tienda abierta en ese momento, exactamente como
la app de Shopify. Se activa una sola vez y queda guardado en el
navegador/teléfono para siempre, sin tener que repetirlo cada vez que se
vuelve a entrar.

**Activarlo (una sola vez, gratis, sin servicios externos):**

1. En tu computador, corre este comando dentro de la carpeta `webapp/`
   (no hace falta instalar nada aparte, `npx` lo descarga solo):
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Te va a dar dos líneas, "Public Key" y "Private Key". En **Vercel >
   Project Settings > Environment Variables** agrega:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` → la llave pública
   - `VAPID_PRIVATE_KEY` → la llave privada (nunca lleva `NEXT_PUBLIC_`
     porque solo se usa en el servidor, en `/api/send-push`)
   - `VAPID_SUBJECT` → `mailto:` seguido de un correo tuyo, por ejemplo
     `mailto:admin@neutrostore.co`
3. Vuelve a desplegar el sitio en Vercel para que tome las variables.
4. Desde el celular de la administradora, entra a `/admin` (idealmente ya
   instalada como app, ver más abajo) y toca el botón **"🔔 Activar
   notificaciones de pedidos"**. El teléfono va a pedir permiso de
   notificaciones — hay que aceptar.

Importante: genera esas llaves **una sola vez** y no las cambies después
— si las regeneras, todos los celulares que ya se habían suscrito dejan de
recibir avisos y tendrían que volver a activarlos.

**Compatibilidad:** funciona perfecto en Android (Chrome, directamente).
En iPhone requiere iOS 16.4 o superior y que la tienda esté **agregada a
la pantalla de inicio** como app (ver la sección de abajo) — Safari no
entrega notificaciones push a pestañas normales, solo a la app instalada.

Sin `VAPID_PRIVATE_KEY` configurada, el botón de activar simplemente no
hace nada — el checkout y el resto de la tienda siguen funcionando
normal.

## Fotos de producto: encuadre automático a cuadrado

Al subir fotos en `/admin/productos` no hace falta recortarlas ni ajustar
nada manualmente: se suben tal cual (cualquier tamaño o proporción), y
Cloudinary las encuadra a cuadrado automáticamente usando su función de
"gravedad automática" (`g_auto`), que detecta con IA en qué parte de la
foto está el producto y recorta ahí — sin dejar franjas de fondo ni
cortar el producto, sin importar si quedó centrado o no en la foto
original. Esto pasa en la propia URL de Cloudinary (parámetro
`AUTO_OPTIMIZE` en `src/lib/storage.ts`), no en el navegador, así que
funciona igual de bien para cualquier foto que subas.

Las fotos que ya estaban subidas antes de este cambio y que se ven con
franjas de fondo a los lados hay que volver a subirlas (editar el
producto → reemplazar la foto) para que tomen el nuevo encuadre — esas
fotos anteriores ya se guardaron recortadas a cuadrado con la franja
"quemada" en los píxeles, así que no hay forma de arreglarlas sin volver
a procesar la imagen original.

## Cómo funciona una compra

1. El cliente elige talla (si no la elige, el botón lo lleva al selector).
2. Toca **Comprar con transferencia** o **Pago contra entrega** → se abre la
   compra rápida (o usa el carrito → `/checkout`).
3. Llena sus datos y toca **Confirmar pedido por WhatsApp**: el pedido se
   guarda en Firestore (si está configurado), se abre WhatsApp con el resumen
   completo (productos, total, cuánto paga ahora y cuánto al recibir, dirección)
   y llega a la página de confirmación con tus cuentas bancarias.
4. El cliente te manda el comprobante por WhatsApp y tú despachas.

Todo el cálculo de montos está en `src/lib/shipping.ts` (`computeOrderTotals`).

## Estructura del proyecto

```
src/
  app/(shop)/          Tienda pública (inicio, catálogo, producto, carrito,
                       checkout, pedido-confirmado, guia-de-tallas)
  app/admin/           Panel administrativo
  components/          Componentes (home/, product/, checkout/, sizes/, admin/)
  lib/                 Datos y lógica (settings, products, orders, shipping,
                       colombia, sizes, demo-products...)
public/logo.png        Logo de Brooklyn Store
```
