import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FechaHoraPipe } from '../../pipes/fecha-hora.pipe';
import { NumeroFormateadoPipe } from '../../pipes/numero-formateado.pipe';

@Component({
  selector: 'app-tabla-base',
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    FechaHoraPipe,
    NumeroFormateadoPipe,
  ],
  templateUrl: './tabla-base.component.html',
  styleUrl: './tabla-base.component.css',
})
export class TablaBaseComponent {
  @Input() datos: any[] = [];
  @Input() columnas: {
    campo: string;
    titulo: string;
    tipo?: string; // Para modo edicion.
    formato?: string; // Para modo lectura.
    opciones?: any[];
    editable?: boolean;
  }[] = [];

  @Input() campoId: string = 'id'; // Por defecto 'id', se puede cambiar
  @Input() mostrarEditar: boolean = true;
  @Input() mostrarEliminar: boolean = true;
  @Input() botonExtra: {
    icono: string;
    tooltip: string;
    accion: string;
    color?: string;
    texto?: string;
  } | null = null;

  @Input() filaEditando: any = null;
  copiaTemporal: any = null;

  @Output() editar = new EventEmitter<any>();
  @Output() eliminar = new EventEmitter<any>();
  @Output() guardar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<any>();
  @Output() botonExtraOutput = new EventEmitter<{
    accion: string;
    fila: any;
  }>();

  activarEdicion(fila: any) {
    this.filaEditando = { ...fila };
    this.copiaTemporal = { ...fila };
    this.editar.emit(fila);
  }

  cancelarEdicion() {
    this.filaEditando = null;
    this.copiaTemporal = null;
    this.cancelar.emit();
  }

  guardarEdicion() {
    if (this.filaEditando) {
      this.guardar.emit(this.filaEditando);
      this.filaEditando = null;
    }
  }

  emitirEliminar(fila: any) {
    this.eliminar.emit(fila);
  }

  emitirExtra(accion: string, fila: any) {
    this.botonExtraOutput.emit({ accion, fila });
  }

  enEdicion(fila: any) {
    if (!this.filaEditando) return false;
    return this.filaEditando[this.campoId] === fila[this.campoId];
  }
}
