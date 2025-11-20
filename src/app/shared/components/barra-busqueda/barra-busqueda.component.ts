import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ProductosService } from '../../../core/services/productos.service';
import { AlertasService } from '../../../core/services/alertas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-barra-busqueda',
  imports: [CommonModule, FormsModule],
  templateUrl: './barra-busqueda.component.html',
  styleUrl: './barra-busqueda.component.css',
})
export class BarraBusquedaComponent {
  idProductoBuscar: string = '';
  productosCompletos: any[] = [];
  productosFiltrados: any[] = [];

  // 🔹 Emite varios productos encontrados
  @Output() productosEncontrados = new EventEmitter<any[]>();
  // 🔹 Emite un solo producto si se busca por ID
  @Output() productoEncontrado = new EventEmitter<any>();

  @Input() modoCarrito: boolean = false; // Solo para visibilidad/foco del carrito

  @ViewChild('inputBusqueda') inputBusqueda!: ElementRef<HTMLInputElement>;

  constructor(
    private productoServicio: ProductosService,
    private alertasServicio: AlertasService
  ) {}

  ngOnInit() {
    this.obtenerProductos();

    this.productoServicio.onProductoCreado().subscribe(() => {
      this.obtenerProductos();
    });

    this.productoServicio.onProductosActualizados().subscribe(() => {
      this.obtenerProductos();
    });
  }

  ngAfterViewInit() {
    if (this.modoCarrito && this.inputBusqueda) {
      setInterval(() => {
        const active = document.activeElement as HTMLElement | null;

        const estaInteractuando =
          active?.tagName === 'INPUT' ||
          active?.tagName === 'TEXTAREA' ||
          active?.isContentEditable ||
          active?.classList.contains('no-foco') ||
          window.getSelection()?.toString().length;

        // Detecta si el usuario está haciendo clic (mousedown)
        const estaClickeando = (window as any).__clickeandoEnSugerencia;

        if (!estaInteractuando && !estaClickeando && this.inputBusqueda) {
          this.inputBusqueda.nativeElement.focus();
        }
      }, 500);

      // Marca cuando el usuario está haciendo clic para evitar perder el click
      document.addEventListener('mousedown', () => {
        (window as any).__clickeandoEnSugerencia = true;
      });

      document.addEventListener('mouseup', () => {
        setTimeout(() => {
          (window as any).__clickeandoEnSugerencia = false;
        }, 200);
      });
    }
  }

  enfocarInput() {
    this.inputBusqueda.nativeElement.focus();
  }

  obtenerProductos(): void {
    this.productoServicio
      .obtenerTodos()
      .subscribe((data: any[]) => (this.productosCompletos = [...data]));
  }

  filtrarProductos(): void {
    const valor = this.idProductoBuscar.trim().toLowerCase();
    if (!valor) {
      this.productosFiltrados = [];
      return;
    }

    const filtrados = this.productosCompletos.filter((p) =>
      p.nombre.toLowerCase().includes(valor)
    );

    this.productosFiltrados = filtrados.sort((a, b) => {
      const aNombre = a.nombre.toLowerCase();
      const bNombre = b.nombre.toLowerCase();
      const aEmpieza = aNombre.startsWith(valor);
      const bEmpieza = bNombre.startsWith(valor);

      if (aEmpieza && !bEmpieza) return -1;
      if (!aEmpieza && bEmpieza) return 1;
      return aNombre.localeCompare(bNombre);
    });
  }

  buscarProducto(): void {
    const valor = this.idProductoBuscar.trim().toLowerCase();

    if (!valor) {
      this.alertasServicio.mostrar(
        'No se ingresó ningun Codigo o Nombre de Producto. Por favor escriba uno.',
        'info'
      );
      this.productosFiltrados = [];
      return;
    }

    // 🔹 Buscar por ID exacto
    const porId = this.productosCompletos.find(
      (p) => p.idProducto.trim().toLowerCase() === valor
    );

    if (porId) {
      // Si encuentra por ID → emite productoEncontrado
      this.productosEncontrados.emit([porId]);
      this.productoEncontrado.emit(porId); // Para carrito.
    } else {
      // 🔹 Buscar por nombre parcial
      const encontrados = this.productosCompletos.filter((p) =>
        p.nombre.toLowerCase().includes(valor)
      );

      const ordenados = encontrados.sort((a, b) => {
        const aStarts = a.nombre.toLowerCase().startsWith(valor);
        const bStarts = b.nombre.toLowerCase().startsWith(valor);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.nombre.localeCompare(b.nombre);
      });

      if (ordenados.length > 0) {
        this.productosEncontrados.emit(ordenados);
      } else {
        this.alertasServicio.mostrar(
          'No se encontró ningún producto con ese Codigo o Nombre',
          'error'
        );
      }
    }

    this.productosFiltrados = [];
    this.idProductoBuscar = '';
  }
}
