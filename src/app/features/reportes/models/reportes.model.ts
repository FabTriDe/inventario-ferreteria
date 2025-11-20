export interface Reporte {
  idReporte?: number; // ID del reporte (clave primaria)
  tipoReporte: string; // Tipo de reporte (por ejemplo: ventas, gastos, etc.)
  valorMensual: number; // Valor mensual asociado al reporte
  fecha: string; // Fecha del reporte (en formato ISO o yyyy-mm-dd)
}
