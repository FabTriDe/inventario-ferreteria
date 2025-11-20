import { Component } from '@angular/core';
import { ReportesService } from '../../../../core/services/reportes.service';
import { Reporte } from '../../models/reportes.model';
import { TablaBaseComponent } from '../../../../shared/components/tabla-base/tabla-base.component';

@Component({
  selector: 'app-reportes',
  imports: [TablaBaseComponent],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css',
})
export class ReportesComponent {
  reportes: Reporte[] = [];
  // Configuración de tabla-base
  columnas = [
    { campo: 'idReporte', titulo: 'Codigo', editable: false },
    { campo: 'tipoReporte', titulo: 'Tipo Reporte', editable: false },
    { campo: 'valorMensual', titulo: 'Valor Mensual', editable: true },
    { campo: 'fecha', titulo: 'Fecha Reporte', editable: true },
  ];

  constructor(private reportesService: ReportesService) {}

  ngOnInit(): void {
    this.obtenerReportes();
  }

  obtenerReportes(): void {
    this.reportesService.getAll().subscribe({
      next: (data) => {
        this.reportes = data.sort((a: any, b: any) => {
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        });
      },
      error: (err) => {
        console.error('Error al obtener los reportes:', err);
      },
    });
  }
}
