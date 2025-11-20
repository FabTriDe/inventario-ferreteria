import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
export type TipoAlerta =
  | 'error'
  | 'exito'
  | 'info'
  | 'advertencia'
  | 'confirmacion'
  | 'imprimir';

interface Alerta {
  mensaje: string;
  tipo: TipoAlerta;
  onConfirm?: () => void;
  onCancel?: () => void;
  onPrintCopy?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class AlertasService {
  private alertaSubject = new BehaviorSubject<Alerta | null>(null);
  alerta$ = this.alertaSubject.asObservable();

  mostrar(mensaje: string, tipo: TipoAlerta = 'info') {
    this.alertaSubject.next({ mensaje, tipo });

    // ⏳ Solo se ocultan automáticamente si NO son de confirmación
    if (tipo !== 'confirmacion') {
      setTimeout(() => this.ocultar(), 6000);
    }
  }

  ocultar() {
    this.alertaSubject.next(null);
  }

  confirmar(mensaje: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.alertaSubject.next({
        mensaje,
        tipo: 'confirmacion',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }

  mostrarImprimir(
    mensaje: string,
    onConfirm: () => void,
    onCancel?: () => void,
    onPrintCopy?: () => void
  ) {
    this.alertaSubject.next({
      mensaje,
      tipo: 'imprimir',
      onConfirm: () => {
        this.ocultar();
        onConfirm();
      },
      onCancel: () => {
        this.ocultar();
        if (onCancel) onCancel();
      },
      // Nuevo callback para imprimir con copia
      onPrintCopy: () => {
        this.ocultar();
        if (onPrintCopy) onPrintCopy();
      },
    } as any); // "as any" para no tener error de tipo
  }
}
