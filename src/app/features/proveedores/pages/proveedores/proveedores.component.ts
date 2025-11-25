import { Component } from '@angular/core';
import { Proveedor } from '../../models/proveedores.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProveedoresService } from '../../../../core/services/proveedores.service';
import { AlertasService } from '../../../../core/services/alertas.service';
import { TablaBaseComponent } from '../../../../shared/components/tabla-base/tabla-base.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-proveedores',
  imports: [TablaBaseComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.css',
})
export class ProveedoresComponent {
  // Estados visuales
  mostrarProveedorForm = false;
  mostrarListaProveedores = false;
  mostrarConfirmarEliminar = false;

  proveedorForm: FormGroup;
  proveedores: any[] = [];
  proveedorEditando: any = null;
  proveedorSeleccionado: any = null;

  // Configuración de tabla-base
  columnas = [
    { campo: 'idProveedor', titulo: 'Codigo', editable: false },
    { campo: 'nombreProveedor', titulo: 'Nombre', editable: true },
    { campo: 'nit', titulo: 'NIT', editable: true },
  ];

  mostrarEditar = true;
  mostrarEliminar = true;
  botonesExtras: any[] = [];

  constructor(
    private fb: FormBuilder,
    private proveedorService: ProveedoresService,
    private alertasService: AlertasService
  ) {
    this.proveedorForm = this.fb.group({
      nombreProveedor: ['', Validators.required],
      nit: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.obtenerProveedores();
  }

  // 🔹 Abrir/Cerrar modales
  abrirModalProveedores(): void {
    this.mostrarListaProveedores = true;
  }
  cerrarModalProveedores(): void {
    this.mostrarListaProveedores = false;
    this.proveedorEditando = null;
  }

  abrirConfirmarEliminar(proveedor: any): void {
    this.proveedorSeleccionado = proveedor;
    this.mostrarConfirmarEliminar = true;
  }
  cerrarConfirmarEliminar(): void {
    this.mostrarConfirmarEliminar = false;
    this.proveedorSeleccionado = null;
  }

  // 🔹 Agregar proveedor
  agregarProveedor(): void {
    if (this.proveedorForm.valid) {
      this.proveedorService.create(this.proveedorForm.value).subscribe({
        next: () => {
          this.alertasService.mostrar('Proveedor agregado con éxito', 'exito');
          this.mostrarProveedorForm = false;
          this.proveedorForm.reset();
          this.obtenerProveedores();
          this.proveedorService.notificarCambios();
        },
        error: (err) => {
          if (err.error?.error?.includes('Duplicate')) {
            this.alertasService.mostrar(
              'El proveedor con este NIT ya existe.',
              'advertencia'
            );
          } else {
            this.alertasService.mostrar(
              '⚠️ Error al agregar el proveedor. Intenta nuevamente.',
              'error'
            );
          }
          console.error('Error al agregar proveedor', err);
        },
      });
    }
  }

  // 🔹 Obtener proveedores
  obtenerProveedores(): void {
    this.proveedorService.getAll().subscribe({
      next: (datos) => {
        this.proveedores = datos;
      },
      error: (err) => console.error('Error al obtener proveedores', err),
    });
  }

  // 🔹 Editar proveedor desde la tabla-base
  onEditar(fila: any): void {
    this.proveedorEditando = { ...fila };
  }

  // 🔹 Guardar cambios de edición
  onGuardar(): void {
    if (this.proveedorEditando) {
      const id = this.proveedorEditando.idProveedor;
      this.proveedorService.update(id, this.proveedorEditando).subscribe({
        next: () => {
          this.obtenerProveedores();
          this.proveedorEditando = null;
          this.alertasService.mostrar('Proveedor editado con éxito', 'exito');
          this.proveedorService.notificarCambios();
        },
        error: (err) => {
          console.error('Error al editar proveedor', err);
          this.alertasService.mostrar('Error al guardar los cambios.', 'error');
        },
      });
    }
  }

  // 🔹 Cancelar edición
  onCancelar(): void {
    this.proveedorEditando = null;
  }

  // 🔹 Eliminar proveedor desde la tabla-base
  onEliminar(proveedor: any): void {
    const id = proveedor.idProveedor;
    if (!id) {
      console.error('No se encontró idProveedor en la fila', proveedor);
      return;
    }

    this.alertasService
      .confirmar('¿Estás seguro de eliminar este proveedor?')
      .then((confirmado) => {
        if (confirmado) {
          this.proveedorService.delete(id).subscribe({
            next: () => {
              this.obtenerProveedores();
              this.alertasService.mostrar(
                'Proveedor eliminado con éxito.',
                'exito'
              );
              this.proveedorService.notificarCambios();
            },
            error: () => {
              this.alertasService.mostrar(
                'No se puede eliminar este proveedor porque tiene facturas asociadas.',
                'error'
              );
            },
          });
        }
      });
  }
}
