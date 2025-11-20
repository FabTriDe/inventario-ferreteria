import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { AlertasService } from '../../../core/services/alertas.service';
import { VentasService } from '../../../core/services/ventas.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductosService } from '../../../core/services/productos.service';

@Component({
  selector: 'app-modal-ventas',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modal-ventas.component.html',
  styleUrl: './modal-ventas.component.css',
})
export class ModalVentasComponent {
  @Input() producto: any | null = null;
  @Output() ventaConfirmada = new EventEmitter<any>();
  @Output() cerrar = new EventEmitter<void>();

  ventaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ventaService: VentasService,
    private productoServicio: ProductosService,
    private alertasService: AlertasService
  ) {
    this.ventaForm = this.fb.group({
      cantidad: [null, [Validators.required, Validators.min(1)]],
      aplicarDescuento: [false],
      valorUnitario: [{ value: 0, disabled: true }, Validators.required],
      precioTotal: [{ value: 0, disabled: true }],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['producto'] && this.producto) {
      this.ventaForm.reset({
        cantidad: null,
        aplicarDescuento: false,
        valorUnitario: this.producto.precio,
        precioTotal: 0,
      });
      this.actualizarPrecioUnitario();
    }
  }

  actualizarPrecioUnitario() {
    if (!this.producto) return;

    const aplicarDescuento = this.ventaForm.get('aplicarDescuento')?.value;
    const valor =
      aplicarDescuento && this.producto.precioDescuento
        ? Number(this.producto.precioDescuento)
        : Number(this.producto.precio);

    this.ventaForm.get('valorUnitario')?.setValue(valor);
    this.calcularPrecioTotal();
  }

  calcularPrecioTotal() {
    const cantidad = this.ventaForm.get('cantidad')?.value;
    const valorUnitario = this.ventaForm.get('valorUnitario')?.value;

    if (!cantidad || cantidad <= 0) {
      this.ventaForm.get('precioTotal')?.setValue(0);
      return;
    }

    const total = cantidad * valorUnitario;
    this.ventaForm.get('precioTotal')?.setValue(total);
  }

  toggleDescuento() {
    this.actualizarPrecioUnitario();
  }

  confirmarVenta() {
    const cantidad = this.ventaForm.get('cantidad')?.value;

    if (!this.producto || !cantidad || cantidad <= 0) {
      this.alertasService.mostrar(
        'La cantidad debe ser mayor a 0.',
        'advertencia'
      );
      return;
    }

    if (cantidad > this.producto.cantidad) {
      this.alertasService.mostrar(
        `No hay suficiente stock disponible. Cantidad disponible: ${this.producto.cantidad}`,
        'advertencia'
      );
      return;
    }

    const datosVenta = {
      idProductoVenta: this.producto.idProducto,
      cantidad: Number(this.ventaForm.get('cantidad')?.value),
      valorUnitario: Number(this.ventaForm.get('valorUnitario')?.value),
      precioTotal: Number(this.ventaForm.get('precioTotal')?.value),
    };

    console.log('Datos enviados:', datosVenta); // ← Para debug

    this.ventaService.agregarVenta(datosVenta).subscribe({
      next: () => {
        this.alertasService.mostrar('Venta realizada con éxito.', 'exito');
        this.producto.cantidad -= cantidad;
        this.ventaConfirmada.emit({ ...datosVenta, producto: this.producto });
        this.cerrarModal();
      },
      error: (err) => {
        console.error('Error completo:', err); // ← Ver error del backend
        this.alertasService.mostrar('No se pudo realizar la venta.', 'error');
      },
    });
  }

  cerrarModal() {
    this.ventaForm.reset({
      cantidad: null,
      aplicarDescuento: false,
      valorUnitario: 0,
      precioTotal: 0,
    });
    this.cerrar.emit();
    this.productoServicio.emitirActualizacion();
  }
}
