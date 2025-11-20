import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NumeroFormateadoPipe } from '../../pipes/numero-formateado.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vista-imagen-producto',
  imports: [NumeroFormateadoPipe, CommonModule],
  templateUrl: './vista-imagen-producto.component.html',
  styleUrl: './vista-imagen-producto.component.css',
})
export class VistaImagenProductoComponent {
  @Input() producto: any; // Producto seleccionado
  @Input() mostrar: boolean = false; // Control de visibilidad
  @Input() mostrarBotonVenta: boolean = true; //Para carrito.
  @Output() cerrar = new EventEmitter<void>(); // Evento para cerrar modal
  @Output() vender = new EventEmitter<any>(); // Evento para vender producto
}
