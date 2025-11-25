import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../../core/services/productos.service';

@Component({
  selector: 'app-filtros',
  imports: [CommonModule],
  templateUrl: './filtros.component.html',
  styleUrl: './filtros.component.css',
})
export class FiltrosComponent implements OnChanges {
  @Input() registros: any[] = [];
  @Output() registrosFiltrados = new EventEmitter<any[]>();

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
    precioCompraMenor: 'Menor Precio Compra',
    precioCompraMayor: 'Mayor Precio Compra',
    cantidadMenor: 'Menor Cantidad',
    cantidadMayor: 'Mayor Cantidad',
  };

  tipoSeleccionado = 'todo';
  ordenSeleccionado = 'idMayor';

  constructor(private productoServicio: ProductosService) {
    // 🔥 SUSCRIPCIÓN AL SIDEBAR
    this.productoServicio.selectedOption$.subscribe((tipoSidebar) => {
      if (!tipoSidebar) return;

      this.tipoSeleccionado = tipoSidebar; // cambia el tipo automáticamente
      this.aplicarOrden(); // vuelve a filtrar y ordenar
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['registros'] && this.registros.length > 0) {
      this.aplicarOrden();
    }
  }

  aplicarOrden() {
    const obtenerNumeroID = (id: string): number => {
      const match = id.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    };

    const safe = (v: any) => (v === null || v === undefined ? 0 : v);

    let lista = [...this.registros];

    switch (this.ordenSeleccionado) {
      case 'precioMenor':
        lista.sort((a, b) => safe(a.precio) - safe(b.precio));
        break;
      case 'precioMayor':
        lista.sort((a, b) => safe(b.precio) - safe(a.precio));
        break;
      case 'precioCompraMenor':
        lista.sort((a, b) => safe(a.precioCompra) - safe(b.precioCompra));
        break;
      case 'precioCompraMayor':
        lista.sort((a, b) => safe(b.precioCompra) - safe(a.precioCompra));
        break;
      case 'cantidadMenor':
        lista.sort((a, b) => safe(a.cantidad) - safe(b.cantidad));
        break;
      case 'cantidadMayor':
        lista.sort((a, b) => safe(b.cantidad) - safe(a.cantidad));
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

    if (this.tipoSeleccionado !== 'todo') {
      lista = lista.filter(
        (item) =>
          item.tipo?.toLowerCase() === this.tipoSeleccionado.toLowerCase()
      );
    }

    this.registrosFiltrados.emit(lista);
  }

  onFiltroChange() {
    this.aplicarOrden();
  }
}
