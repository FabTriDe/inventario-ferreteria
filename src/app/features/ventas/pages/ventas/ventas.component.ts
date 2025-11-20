import { Component } from '@angular/core';
import { ProductosService } from '../../../../core/services/productos.service';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AlertasService } from '../../../../core/services/alertas.service';
import { VentasService } from '../../../../core/services/ventas.service';
import { Venta } from '../../models/ventas.model';
import { TablaBaseComponent } from '../../../../shared/components/tabla-base/tabla-base.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ventas',
  imports: [TablaBaseComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css',
})
export class VentasComponent {
  registros: Venta[] = [];
  productos: any[] = [];
  mostrarFormulario = false;
  productoBusqueda: string = '';
  productosFiltrados: any[] = [];
  aplicarDescuento = false;
  productoSeleccionado: any = null;
  ventaEditando: any = null;
  ventaForm: FormGroup;

  columnas = [
    { campo: 'idVenta', titulo: 'Código' },
    { campo: 'nombreProducto', titulo: 'Producto Vendido' },
    { campo: 'cantidad', titulo: 'Cantidad', editable: true },
    { campo: 'valorUnitario', titulo: 'Valor Unitario' },
    { campo: 'precioTotal', titulo: 'Precio Total' },
    { campo: 'fechaVenta', titulo: 'Fecha', formato: 'date' },
  ];

  constructor(
    private fb: FormBuilder,
    private ventasService: VentasService,
    private productosService: ProductosService,
    private alertasService: AlertasService
  ) {
    this.ventaForm = this.fb.group({
      idProductoVenta: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      valorUnitario: [{ value: '', disabled: true }],
      precioTotal: [{ value: '', disabled: true }],
      descuento: [false],
    });
  }

  ngOnInit() {
    this.obtenerRegistros();
    this.obtenerProductos();
  }

  obtenerRegistros() {
    this.ventasService.obtenerVentasJoin().subscribe({
      next: (data) => {
        this.registros = data.sort((a, b) => {
          const fechaA = a.fechaVenta ? new Date(a.fechaVenta).getTime() : 0;
          const fechaB = b.fechaVenta ? new Date(b.fechaVenta).getTime() : 0;
          return fechaB - fechaA;
        });
      },
      error: (err) => console.error('Error al cargar ventas', err),
    });
  }

  obtenerProductos() {
    this.productosService.obtenerTodos().subscribe((data) => {
      this.productos = data;
    });
  }

  filtrarProductos() {
    const texto = this.productoBusqueda.toLowerCase();
    this.productosFiltrados = this.productos.filter(
      (p) =>
        p.idProducto.toLowerCase().includes(texto) ||
        p.nombre.toLowerCase().includes(texto)
    );
  }

  actualizarPrecioUnitario() {
    const idProducto = this.ventaForm.get('idProductoVenta')?.value;
    this.productoSeleccionado = this.productos.find(
      (p) => p.idProducto === idProducto
    );

    if (this.productoSeleccionado) {
      const precio = this.aplicarDescuento
        ? this.productoSeleccionado.precioDescuento
        : this.productoSeleccionado.precio;

      this.ventaForm.patchValue({
        valorUnitario: precio,
        precioTotal: this.ventaForm.get('cantidad')?.value * precio,
      });
    }
  }

  calcularPrecioTotal() {
    const cantidad = this.ventaForm.get('cantidad')?.value;
    const valor = this.ventaForm.get('valorUnitario')?.value;
    this.ventaForm.patchValue({ precioTotal: cantidad * valor });
  }

  toggleDescuento() {
    this.aplicarDescuento = this.ventaForm.get('descuento')?.value;
    this.actualizarPrecioUnitario();
  }

  agregarRegistro() {
    if (this.ventaForm.valid) {
      const idProducto = this.ventaForm.get('idProductoVenta')?.value;
      const producto = this.productos.find((p) => p.idProducto === idProducto);

      if (!producto) {
        this.alertasService.mostrar('Producto no encontrado.', 'advertencia');
        return;
      }

      const cantidadSolicitada = this.ventaForm.get('cantidad')?.value;
      if (cantidadSolicitada > producto.cantidad) {
        this.alertasService.mostrar(
          `No hay suficiente stock disponible. Stock actual: ${producto.cantidad}`,
          'advertencia'
        );
        return;
      }

      this.ventaForm.get('valorUnitario')?.enable();
      this.ventaForm.get('precioTotal')?.enable();

      const nuevaVenta: Venta = {
        ...this.ventaForm.getRawValue(),
      };
      delete (nuevaVenta as any).descuento;

      this.ventaForm.get('valorUnitario')?.disable();
      this.ventaForm.get('precioTotal')?.disable();

      this.ventasService.agregarVenta(nuevaVenta).subscribe({
        next: () => {
          this.alertasService.mostrar('Venta agregada con éxito.', 'exito');
          this.obtenerRegistros();
          this.ventaForm.reset();
          this.mostrarFormulario = false;
          this.productoSeleccionado = null;
          this.aplicarDescuento = false;
        },
        error: (err) => {
          this.alertasService.mostrar('Error al guardar la venta', 'error');
          console.error('Error en la petición:', err);
        },
      });
    } else {
      this.alertasService.mostrar(
        'Por favor, completa todos los campos obligatorios.',
        'advertencia'
      );
    }
  }

  // 🟢 Editar venta
  onEditar(fila: any): void {
    this.ventaEditando = { ...fila };
  }

  // 🟢 Guardar cambios
  onGuardar(): void {
    if (!this.ventaEditando) return;

    const producto = this.productos.find(
      (p) => p.idProducto === this.ventaEditando.idProductoVenta
    );
    if (!producto) {
      this.alertasService.mostrar('Producto no encontrado.', 'error');
      return;
    }

    this.ventaEditando.precioTotal =
      this.ventaEditando.cantidad * this.ventaEditando.valorUnitario;

    // 🔹 Evitar enviar campo descuento si existe
    delete this.ventaEditando.descuento;
    delete this.ventaEditando.nombreProducto;

    this.ventasService.editarVenta(this.ventaEditando).subscribe({
      next: () => {
        this.alertasService.mostrar('Venta editada con éxito.', 'exito');
        this.ventaEditando = null;
        this.obtenerRegistros();
      },
      error: (err) => {
        console.error('Error al editar venta', err);
        this.alertasService.mostrar('Error al guardar los cambios.', 'error');
      },
    });
  }

  onCancelar(): void {
    this.ventaEditando = null;
  }

  // 🟢 Eliminar venta
  onEliminar(fila: any): void {
    const id = fila.idVenta;
    if (!id) {
      console.error('No se encontró idVenta en la fila', fila);
      return;
    }

    this.alertasService
      .confirmar('¿Estás seguro de eliminar esta venta?')
      .then((confirmado) => {
        if (confirmado) {
          this.ventasService.eliminarVenta(id).subscribe({
            next: () => {
              this.obtenerRegistros();
              this.alertasService.mostrar(
                'Venta eliminada con éxito.',
                'exito'
              );
            },
            error: (err) => {
              console.error('Error al eliminar venta:', err);
              this.alertasService.mostrar(
                'No se pudo eliminar la venta.',
                'error'
              );
            },
          });
        }
      });
  }

  onProductoInput(event: Event): void {
    const valor = (event.target as HTMLInputElement).value.toLowerCase();
    this.productosFiltrados = this.productos.filter(
      (p) =>
        p.idProducto.toLowerCase().includes(valor) ||
        p.nombre.toLowerCase().includes(valor)
    );
  }
}
