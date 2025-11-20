import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AlertasService } from '../../../../../core/services/alertas.service';
import { TrabajosService } from '../../../../../core/services/trabajos.service';
import { Trabajo } from '../../../models/trabajos.model';
import { TablaBaseComponent } from '../../../../../shared/components/tabla-base/tabla-base.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trabajos',
  imports: [TablaBaseComponent, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './trabajos.component.html',
  styleUrl: './trabajos.component.css',
})
export class TrabajosComponent implements OnInit {
  registros: Trabajo[] = [];
  mostrarFormulario = false;
  trabajoForm: FormGroup;

  columnas = [
    { campo: 'idTrabajo', titulo: 'Codigo', editable: false },
    { campo: 'descripcion', titulo: 'Descripción', editable: true },
    { campo: 'valor', titulo: 'Valor', editable: true, formato: 'currency' },
    {
      campo: 'fechaTrabajo',
      titulo: 'Fecha',
      editable: false,
      formato: 'date',
    },
  ];

  trabajoEditando: Trabajo | null = null;

  mostrarEditar = true;
  mostrarEliminar = true;
  botonesExtras: any[] = [];

  constructor(
    private fb: FormBuilder,
    private trabajosService: TrabajosService,
    private alertasService: AlertasService
  ) {
    this.trabajoForm = this.fb.group({
      descripcion: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.obtenerRegistros();
  }

  obtenerRegistros() {
    this.trabajosService.getAll().subscribe({
      next: (datos) => {
        // Convertimos fechaTrabajo a Date para que Angular lo pueda formatear correctamente
        this.registros = datos
          .sort(
            (a: any, b: any) =>
              new Date(b.fechaTrabajo).getTime() -
              new Date(a.fechaTrabajo).getTime()
          )
          .map((trabajo) => ({
            ...trabajo,
            fechaTrabajo: new Date(trabajo.fechaTrabajo), // <-- aquí es lo importante
          }));
      },
      error: (err) => console.error('Error al obtener los trabajos', err),
    });
  }

  agregarRegistro() {
    if (this.trabajoForm.valid) {
      const datosTrabajo = this.trabajoForm.value;
      this.trabajosService.create(datosTrabajo).subscribe({
        next: () => {
          this.alertasService.mostrar('Trabajo agregado con éxito', 'exito');
          this.obtenerRegistros();
          this.trabajoForm.reset();
          this.mostrarFormulario = false;
        },
        error: () =>
          this.alertasService.mostrar('Error al guardar el trabajo.', 'error'),
      });
    } else {
      this.alertasService.mostrar(
        'Por favor completa todos los campos obligatorios.',
        'advertencia'
      );
    }
  }

  // 🔹 Eventos de la tabla-base
  onEditar(fila: Trabajo) {
    this.trabajoEditando = { ...fila }; // clonar la fila para edición
  }

  onGuardar() {
    if (this.trabajoEditando) {
      this.trabajosService
        .update(this.trabajoEditando.idTrabajo!, this.trabajoEditando)
        .subscribe({
          next: () => {
            this.alertasService.mostrar(
              'Trabajo actualizado con éxito.',
              'exito'
            );
            this.trabajoEditando = null;
            this.obtenerRegistros();
          },
          error: (err) => {
            console.error('Error al actualizar el trabajo', err);
            this.alertasService.mostrar(
              'Error al actualizar el trabajo.',
              'error'
            );
          },
        });
    }
  }

  onCancelar() {
    this.trabajoEditando = null;
  }

  onEliminar(trabajo: Trabajo) {
    // Primero revisamos que el id exista
    const id = trabajo.idTrabajo;
    if (!id) {
      console.error('No se encontró idTrabajo en la fila', trabajo);
      return;
    }

    // Confirmación
    this.alertasService
      .confirmar('¿Estás seguro de eliminar este trabajo?')
      .then((confirmado) => {
        if (!confirmado) return;

        // Llamada al servicio
        this.trabajosService.delete(id).subscribe({
          next: () => {
            this.alertasService.mostrar(
              'Trabajo eliminado con éxito.',
              'exito'
            );
            this.obtenerRegistros(); // refresca la tabla
          },
          error: (err) => {
            console.error('Error al eliminar el trabajo:', err);
            this.alertasService.mostrar(
              'Error al eliminar el trabajo.',
              'error'
            );
          },
        });
      })
      .catch((err) => {
        console.error('Error en la confirmación:', err);
      });
  }
}
