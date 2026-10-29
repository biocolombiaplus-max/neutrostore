// Marca en este navegador que aquí entra la administradora: así la tienda
// muestra el botón "Editar" solo para ella, sin cargar Firebase para los
// clientes. (Archivo aparte de auth.ts para no arrastrar Firebase a la tienda.)
export const ADMIN_FLAG_KEY = 'ns-admin';
