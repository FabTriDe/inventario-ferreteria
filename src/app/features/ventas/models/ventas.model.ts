export interface Venta {
  idVenta?: number;
  idProductoVenta: string; // sigue existiendo en la base
  nombreProducto?: string; // viene del JOIN
  cantidad: number;
  valorUnitario: number;
  precioTotal: number;
  fechaVenta?: string;
}
