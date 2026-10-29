// Marca en este navegador que aquí entra la administradora: así la tienda
// muestra el botón "Editar" solo para ella, sin cargar Firebase para los
// clientes. (Archivo aparte de auth.ts para no arrastrar Firebase a la tienda.)
export const ADMIN_FLAG_KEY = 'ns-admin';

// Cuenta fija del panel: en /admin/login solo se escribe la contraseña.
// Este mismo correo está en firestore.rules (función isAdmin): si se cambia
// aquí, hay que cambiarlo también allá.
export const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@neutrostore.co').trim().toLowerCase();

// Contraseña con la que se crea la cuenta del panel la primera vez que se
// entra (después se puede cambiar desde Configuración). Solo sirve para crear
// la cuenta si todavía no existe; luego la valida Firebase.
export const ADMIN_INITIAL_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_INITIAL_PASSWORD || '123456';
