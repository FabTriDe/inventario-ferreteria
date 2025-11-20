import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AlertasService } from '../../../../core/services/alertas.service';
import { FacturasService } from '../../../../core/services/facturas.service';
import { ProveedoresService } from '../../../../core/services/proveedores.service';
import { Proveedor } from '../../../proveedores/models/proveedores.model';
import { Factura } from '../../models/facturas.model';
import { TablaBaseComponent } from '../../../../shared/components/tabla-base/tabla-base.component';
import { ProveedoresComponent } from '../../../proveedores/pages/proveedores/proveedores.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-facturas',
  imports: [
    TablaBaseComponent,
    ProveedoresComponent,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.css',
})
export class FacturasComponent implements OnInit {
  registros: any[] = [];
  proveedores: Proveedor[] = [];
  facturaForm: FormGroup;
  mostrarFormulario = false;
  facturaEditando: any = null;
  nitSeleccionado: string = '';

  columnas = [
    { campo: 'idFactura', titulo: 'Codigo' },
    { campo: 'codigo', titulo: 'Código', editable: true },
    { campo: 'nombreProveedor', titulo: 'Proveedor' },
    { campo: 'nit', titulo: 'NIT' },
    {
      campo: 'valorFactura',
      titulo: 'Valor Factura',
      formato: 'currency',
      editable: true,
    },
    { campo: 'fechaFactura', titulo: 'Fecha', formato: 'date' },
  ];

  constructor(
    private fb: FormBuilder,
    private facturasService: FacturasService,
    private proveedoresService: ProveedoresService,
    private alertasService: AlertasService
  ) {
    this.facturaForm = this.fb.group({
      codigo: ['', Validators.required],
      proveedorId: ['', Validators.required],
      valorFactura: [0, [Validators.required, Validators.min(0.01)]],
      fechaFactura: [new Date(), Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarFacturas();
    this.cargarProveedores();
  }

  // Carga facturas (convierte fecha a Date para formateo en tabla)
  cargarFacturas(): void {
    this.facturasService.obtenerFacturas().subscribe({
      next: (data) => {
        console.log('📦 Facturas que llegan del backend:', data);

        this.registros = data.map((f: any) => ({
          ...f,
          fechaFactura: f.fechaFactura ? new Date(f.fechaFactura) : null,
        }));
      },
      error: (err) => console.error('Error al cargar facturas', err),
    });
  }

  // Carga proveedores (para select y mostrar NIT)
  cargarProveedores(): void {
    this.proveedoresService.getAll().subscribe({
      next: (data) => (this.proveedores = data),
      error: (err) => console.error('Error al cargar proveedores', err),
    });
  }

  // Actualiza NIT cuando se cambia proveedor en el form
  actualizarNit(event: any): void {
    const proveedorId = event?.target?.value ?? event;
    const proveedor = this.proveedores.find(
      (p) => p.idProveedor == proveedorId
    );
    this.nitSeleccionado = proveedor ? proveedor.nit : '';
  }

  // Agregar factura
  agregarRegistro(): void {
    if (this.facturaForm.valid) {
      const payload: Partial<Factura> = {
        ...this.facturaForm.value,
        // Asegurar que la fecha se envíe en formato ISO si es Date
        fechaFactura:
          this.facturaForm.value.fechaFactura instanceof Date
            ? (this.facturaForm.value.fechaFactura as Date).toISOString()
            : this.facturaForm.value.fechaFactura,
      };

      this.facturasService.agregar(payload as Factura).subscribe({
        next: () => {
          this.cargarFacturas();
          this.mostrarFormulario = false;
          this.facturaForm.reset({ fechaFactura: new Date() });
          this.nitSeleccionado = '';
          this.alertasService.mostrar('Factura agregada con éxito.', 'exito');
        },
        error: (err) => {
          if (err.error?.error?.includes('Duplicate')) {
            this.alertasService.mostrar(
              'Esta factura ya existe, ingrese una diferente.',
              'advertencia'
            );
          } else {
            this.alertasService.mostrar(
              'Error al agregar la factura, intenta nuevamente.',
              'error'
            );
          }
          console.error('Error al agregar factura:', err);
        },
      });
    } else {
      this.alertasService.mostrar(
        'Por favor completa todos los campos obligatorios.',
        'advertencia'
      );
    }
  }

  // Iniciar edición desde tabla-base
  iniciarEdicion(factura: any): void {
    // clonamos la fila para editar sin mutar la original
    this.facturaEditando = {
      ...factura,
      // aseguramos que fechaFactura sea Date si existe
      fechaFactura: factura.fechaFactura
        ? new Date(factura.fechaFactura)
        : null,
    };
  }

  // Guardar edición
  guardarEdicion(): void {
    if (this.facturaEditando) {
      const datos: Partial<Factura> = {
        idFactura: this.facturaEditando.idFactura,
        codigo: this.facturaEditando.codigo,
        valorFactura: this.facturaEditando.valorFactura,
        fechaFactura:
          this.facturaEditando.fechaFactura instanceof Date
            ? this.facturaEditando.fechaFactura.toISOString()
            : this.facturaEditando.fechaFactura,
      };

      this.facturasService.editar(datos).subscribe({
        next: () => {
          this.cargarFacturas();
          this.facturaEditando = null;
          this.alertasService.mostrar('Factura editada con éxito.', 'exito');
        },
        error: (err) => {
          console.error('Error al editar factura:', err);
          this.alertasService.mostrar(
            'Error al editar la factura, intenta nuevamente.',
            'error'
          );
        },
      });
    }
  }

  cancelarEdicion(): void {
    this.facturaEditando = null;
  }

  // Métodos para conectar con tabla-base (nombres esperados)
  onEditar(fila: any): void {
    this.iniciarEdicion(fila);
  }

  onGuardar(): void {
    this.guardarEdicion();
  }

  onCancelar(): void {
    this.cancelarEdicion();
  }

  onEliminar(factura: any): void {
    const id = factura.idFactura;
    if (!id) {
      console.error('No se encontró idFactura en la fila', factura);
      return;
    }

    this.alertasService
      .confirmar('¿Estás seguro de eliminar esta factura?')
      .then((confirmado) => {
        if (confirmado) {
          this.facturasService.eliminar(id).subscribe({
            next: () => {
              this.cargarFacturas();
              this.alertasService.mostrar(
                'Factura eliminada con éxito.',
                'exito'
              );
            },
            error: () => {
              this.alertasService.mostrar(
                'No se puede eliminar esta factura.',
                'error'
              );
            },
          });
        }
      });
  }
}
