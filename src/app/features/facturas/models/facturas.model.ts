export interface Factura {
  idFactura?: number | string;
  codigo: string;
  proveedorId: number | string;
  valorFactura: number;
  fechaFactura: string | Date; // backend suele recibir ISO string; en la UI puedes usar Date
  // campos opcionales que tu join puede traer:
  nombreProveedor?: string;
  nit?: string;
}
