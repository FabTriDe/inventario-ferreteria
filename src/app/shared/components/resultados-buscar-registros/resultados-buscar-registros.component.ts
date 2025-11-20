import { Component, EventEmitter, Output } from '@angular/core';
import { ProductosService } from '../../../core/services/productos.service';
import { AlertasService } from '../../../core/services/alertas.service';
import { CommonModule } from '@angular/common';
import { BarraBusquedaComponent } from '../barra-busqueda/barra-busqueda.component';
import { ModalVentasComponent } from '../modal-ventas/modal-ventas.component';
import { VistaImagenProductoComponent } from '../vista-imagen-producto/vista-imagen-producto.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-resultados-buscar-registros',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    BarraBusquedaComponent,
    ModalVentasComponent,
    VistaImagenProductoComponent,
  ],
  templateUrl: './resultados-buscar-registros.component.html',
  styleUrl: './resultados-buscar-registros.component.css',
})
export class ResultadosBuscarRegistrosComponent {
  @Output() productoEditado = new EventEmitter<any>();
  @Output() productoEliminado = new EventEmitter<number>();

  productoEncontrado: any = null;
  productos: any[] = [];
  mostrarTablaMultiple = false;
  productosOriginales: Map<string, any> = new Map();

  productoParaVender: any = null;

  formularioImagenVisible = false;
  productoSeleccionado: any = null;
  imagenSeleccionada: File | null = null;
  nombreImagenSeleccionada: string | null = null;
  mostrarImagenProducto = false;

  tipos = [
    { valor: 'tornillo', nombre: 'Tornillo' },
    { valor: 'herramienta', nombre: 'Herramienta' },
    { valor: 'griferia', nombre: 'Griferia' },
    { valor: 'electrico', nombre: 'Electrico' },
    { valor: 'gas', nombre: 'Gas' },
    { valor: 'pintura', nombre: 'Pintura' },
    { valor: 'alcantarillado', nombre: 'Alcantarillado' },
    { valor: 'accesorio', nombre: 'Accesorio' },
    { valor: 'estufa', nombre: 'Estufa' },
    { valor: 'cerrajeria', nombre: 'Cerrajeria' },
    { valor: 'material', nombre: 'Material' },
  ];

  constructor(
    private productoServicio: ProductosService,
    private alertasServicio: AlertasService
  ) {}

  // --- Recibir productos desde barra de búsqueda ---
  recibirProductos(productos: any[]) {
    if (productos.length === 1) {
      this.productoEncontrado = { ...productos[0], editando: false };
      this.productos = [];
      this.mostrarTablaMultiple = false;
    } else if (productos.length > 1) {
      this.productos = productos.map((p) => ({ ...p, editando: false }));
      this.productoEncontrado = null;
      this.mostrarTablaMultiple = true;
    } else {
      this.productos = [];
      this.productoEncontrado = null;
      this.mostrarTablaMultiple = false;
    }
  }

  // --- Edición ---
  activarEdicion(producto?: any) {
    const productoObjetivo = producto || this.productoEncontrado;

    if (productoObjetivo) {
      this.productosOriginales.set(productoObjetivo.idProducto, {
        ...productoObjetivo,
      });
      productoObjetivo.editando = true;
    }
  }

  cancelarEdicion(producto?: any) {
    const productoObjetivo = producto || this.productoEncontrado;

    if (productoObjetivo) {
      const original = this.productosOriginales.get(
        productoObjetivo.idProducto
      );
      if (original) {
        Object.assign(productoObjetivo, original);
      }
      productoObjetivo.editando = false;
    }
  }

  guardarEdicion(producto?: any) {
    const productoObjetivo = producto || this.productoEncontrado;

    if (productoObjetivo) {
      const { editando, ...productoLimpio } = productoObjetivo;

      this.productoServicio.editarProducto(productoLimpio).subscribe({
        next: () => {
          this.alertasServicio.mostrar('Producto editado con éxito', 'exito');
          productoObjetivo.editando = false;
          this.productoEditado.emit(productoObjetivo);
          this.productoServicio.emitirActualizacion();
        },
        error: () => {
          this.alertasServicio.mostrar('Error al editar producto', 'error');
        },
      });
    }
  }

  // --- Eliminación ---
  eliminarProducto(producto?: any) {
    const productoObjetivo = producto || this.productoEncontrado;

    if (!productoObjetivo) return;

    this.alertasServicio
      .confirmar('¿Estás seguro de eliminar este producto?')
      .then((confirmado) => {
        if (confirmado) {
          this.productoServicio
            .eliminarProducto(productoObjetivo.idProducto)
            .subscribe({
              next: () => {
                this.alertasServicio.mostrar(
                  'Producto eliminado con éxito',
                  'exito'
                );
                this.productoEliminado.emit(productoObjetivo.idProducto);

                // Eliminar de la vista
                if (productoObjetivo === this.productoEncontrado) {
                  this.productoEncontrado = null;
                }

                this.productos = this.productos.filter(
                  (p) => p.idProducto !== productoObjetivo.idProducto
                );
              },
              error: () => {
                this.alertasServicio.mostrar(
                  'Error al eliminar producto',
                  'error'
                );
              },
            });
        }
      });
  }

  // --- Imagen ---
  mostrarFormularioImagen(producto: any) {
    this.productoSeleccionado = producto;
    this.formularioImagenVisible = true;
    this.imagenSeleccionada = null;
    this.nombreImagenSeleccionada = null;
  }

  cerrarFormularioImagen() {
    this.formularioImagenVisible = false;
    this.productoSeleccionado = null;
    this.imagenSeleccionada = null;
    this.nombreImagenSeleccionada = null;
  }

  onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;
      this.nombreImagenSeleccionada = file.name;
    }
  }

  subirImagen() {
    if (!this.imagenSeleccionada || !this.productoSeleccionado) {
      this.alertasServicio.mostrar(
        'Seleccione una imagen y un producto',
        'advertencia'
      );
      return;
    }

    const formData = new FormData();
    formData.append('file', this.imagenSeleccionada);
    formData.append('upload_preset', 'inventario-ferreteria');
    formData.append('cloud_name', 'dsdnkc3eb');
    formData.append('folder', 'productos');

    fetch('https://api.cloudinary.com/v1_1/dsdnkc3eb/image/upload', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        const urlImagen = data.secure_url;
        const { editando, ...productoLimpio } = this.productoSeleccionado;
        const productoActualizado = { ...productoLimpio, imagen: urlImagen };

        this.productoServicio.editarProducto(productoActualizado).subscribe({
          next: () => {
            // Actualizar en memoria
            if (this.productoSeleccionado === this.productoEncontrado) {
              Object.assign(this.productoEncontrado, productoActualizado);
            }

            const index = this.productos.findIndex(
              (p) => p.idProducto === productoActualizado.idProducto
            );
            if (index !== -1) {
              Object.assign(this.productos[index], productoActualizado);
            }

            this.alertasServicio.mostrar('Imagen subida con éxito', 'exito');
            this.cancelarEdicion(this.productoSeleccionado);
            this.cerrarFormularioImagen();
            this.productoEditado.emit(productoActualizado);
          },
          error: () => {
            this.alertasServicio.mostrar('Error al guardar la imagen', 'error');
          },
        });
      })
      .catch(() => {
        this.alertasServicio.mostrar('Error al subir la imagen', 'error');
      });
  }

  // --- Ver imagen ---
  verImagenProducto(producto: any) {
    this.productoSeleccionado = producto;
    this.mostrarImagenProducto = true;
  }

  cerrarVistaImagen() {
    this.mostrarImagenProducto = false;
  }

  // --- Ventas ---
  venderProducto(producto: any) {
    this.productoParaVender = producto;
  }

  cerrarVenta() {
    this.productoParaVender = null;
  }

  // --- Cerrar tabla ---
  cerrarTablaMultiple() {
    this.productos = [];
    this.mostrarTablaMultiple = false;
    this.productoEncontrado = null;
  }
}
