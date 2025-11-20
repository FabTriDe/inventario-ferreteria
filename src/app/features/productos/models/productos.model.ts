export interface Producto {
  idProducto?: string; // ID del producto
  nombre: string; // Nombre del producto
  tipo: string; // Tipo de producto (tornillo, herramienta, etc.)
  precio: number; // Precio original
  precioDescuento?: number; // Precio con descuento (si aplica)
  cantidad: number; // Stock disponible
  imagen?: string; // (opcional) URL de imagen
}
