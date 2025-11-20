import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filtros',
  imports: [CommonModule],
  templateUrl: './filtros.component.html',
  styleUrl: './filtros.component.css',
})
export class FiltrosComponent implements OnChanges {
  @Input() registros: any[] = []; // recibe los productos desde el padre
  @Output() registrosFiltrados = new EventEmitter<any[]>(); // devuelve los productos ordenados o filtrados

  tiposFiltro = [
    { valor: 'todo', nombre: 'Todo' },
    { valor: 'tornillo', nombre: 'Tornillo' },
    { valor: 'herramienta', nombre: 'Herramienta' },
    { valor: 'griferia', nombre: 'Grifería' },
    { valor: 'electrico', nombre: 'Eléctrico' },
    { valor: 'gas', nombre: 'Gas' },
    { valor: 'pintura', nombre: 'Pintura' },
    { valor: 'alcantarillado', nombre: 'Alcantarillado' },
    { valor: 'accesorio', nombre: 'Accesorio' },
    { valor: 'estufa', nombre: 'Estufa' },
    { valor: 'cerrajeria', nombre: 'Cerrajería' },
    { valor: 'material', nombre: 'Material' },
  ];

  ordenNombres: { [key: string]: string } = {
    idMenor: 'Codigo Ascendente',
    idMayor: 'Codigo Descendente',
    precioMenor: 'Menor Precio',
    precioMayor: 'Mayor Precio',
    cantidadMenor: 'Menor Cantidad',
    cantidadMayor: 'Mayor Cantidad',
  };

  tipoSeleccionado = 'todo';
  ordenSeleccionado = 'idMayor';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['registros'] && this.registros.length > 0) {
      this.aplicarOrden(); // ✅ Se ejecuta cada vez que llegan o cambian los registros
    }
  }

  aplicarOrden() {
    const obtenerNumeroID = (id: string): number => {
      const match = id.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    };

    let lista = [...this.registros]; // copia para no modificar directamente

    if (this.ordenSeleccionado !== '') {
      switch (this.ordenSeleccionado) {
        case 'precioMenor':
          lista.sort((a, b) => a.precio - b.precio);
          break;
        case 'precioMayor':
          lista.sort((a, b) => b.precio - a.precio);
          break;
        case 'cantidadMenor':
          lista.sort((a, b) => a.cantidad - b.cantidad);
          break;
        case 'cantidadMayor':
          lista.sort((a, b) => b.cantidad - a.cantidad);
          break;
        case 'idMenor':
          lista.sort(
            (a, b) =>
              obtenerNumeroID(a.idProducto) - obtenerNumeroID(b.idProducto)
          );
          break;
        case 'idMayor':
          lista.sort(
            (a, b) =>
              obtenerNumeroID(b.idProducto) - obtenerNumeroID(a.idProducto)
          );
          break;
      }
    }

    // Si hay tipo seleccionado (y no es "todo"), filtra
    if (this.tipoSeleccionado && this.tipoSeleccionado !== 'todo') {
      lista = lista.filter(
        (item) =>
          item.tipo.toLowerCase() === this.tipoSeleccionado.toLowerCase()
      );
    }

    // Emitimos el resultado final al padre
    this.registrosFiltrados.emit(lista);
  }

  onFiltroChange() {
    this.aplicarOrden();
  }
}
