import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TipoAlerta,
  AlertasService,
} from '../../../core/services/alertas.service';

@Component({
  selector: 'app-mensajes-alerta',
  imports: [CommonModule],
  templateUrl: './mensajes-alerta.component.html',
  styleUrl: './mensajes-alerta.component.css',
})
export class MensajesAlertaComponent {
  mensaje: string = '';
  tipo: TipoAlerta = 'info';
  visible: boolean = false;
  onConfirm?: () => void;
  onCancel?: () => void;
  onPrintCopy?: () => void; // 👈 nuevo

  constructor(private alertaService: AlertasService) {}

  ngOnInit(): void {
    this.alertaService.alerta$.subscribe((alerta) => {
      if (alerta) {
        this.mensaje = alerta.mensaje;
        this.tipo = alerta.tipo;
        this.onConfirm = alerta.onConfirm;
        this.onCancel = alerta.onCancel;
        this.onPrintCopy = alerta.onPrintCopy; // 👈 nuevo
        this.mostrar();
      } else {
        this.ocultar();
      }
    });
  }

  confirmar() {
    if (this.onConfirm) this.onConfirm();
    this.ocultar();
  }

  cancelar() {
    if (this.onCancel) this.onCancel();
    this.ocultar();
  }

  imprimirConCopia() {
    if (this.onPrintCopy) this.onPrintCopy();
    this.ocultar();
  }

  mostrar(): void {
    this.visible = true;
  }

  ocultar(): void {
    this.visible = false;
  }
}
