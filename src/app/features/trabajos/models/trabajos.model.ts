export interface Trabajo {
  idTrabajo?: number;
  descripcion: string;
  valor: number;
  fechaTrabajo: Date; // o Date, según cómo lo manejes en tu backend
}
