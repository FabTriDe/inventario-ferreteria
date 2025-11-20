import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numeroFormateado',
})
export class NumeroFormateadoPipe implements PipeTransform {
  transform(
    value: number | string,
    opciones: { moneda?: boolean; simbolo?: string } = {}
  ): string {
    if (!value && value !== 0) return '';

    const numero = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numero)) return '';

    const numeroFormateado = numero.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (opciones.moneda) {
      const simbolo = opciones.simbolo || '$';
      return `${simbolo} ${numeroFormateado}`;
    }

    return numeroFormateado;
  }
}
