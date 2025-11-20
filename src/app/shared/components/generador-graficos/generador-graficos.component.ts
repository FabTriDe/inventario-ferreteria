import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Chart, ChartTypeRegistry } from 'chart.js/auto';
import { ProductosService } from '../../../core/services/productos.service';
import { VentasService } from '../../../core/services/ventas.service';
import { TrabajosService } from '../../../core/services/trabajos.service';

@Component({
  selector: 'app-generador-graficos',
  imports: [],
  templateUrl: './generador-graficos.component.html',
  styleUrl: './generador-graficos.component.css',
})
export class GeneradorGraficosComponent {
  @ViewChild('chartBarra') chartRef!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;
  @Input() tabla!: string;

  labels: string[] = [];
  data: number[] = [];

  constructor(
    private productosService: ProductosService,
    private ventasService: VentasService,
    private trabajosService: TrabajosService
  ) {}

  ngAfterViewInit(): void {
    if (this.tabla === 'ventas' || this.tabla === 'trabajos') {
      this.obtenerRegistrosGrafico();
    } else if (this.tabla === 'categorias') {
      this.generarGraficoCategorias();
    } else if (this.tabla === 'id') {
      this.generarGraficoId();
    }
  }

  async generarGraficoId() {
    const productos = await firstValueFrom(
      this.productosService.obtenerSinTornillos()
    );
    const ventas = await firstValueFrom(this.ventasService.obtenerVentas());

    const productoNombreMap: { [id: string]: string } = {};
    productos.forEach((producto: any) => {
      productoNombreMap[producto.idProducto] = producto.nombre;
    });

    const cantidadPorNombre: { [idProducto: string]: number } = {};
    ventas.forEach((venta: any) => {
      const nombre = productoNombreMap[venta.idProductoVenta];
      if (!nombre) return;

      if (!cantidadPorNombre[nombre]) cantidadPorNombre[nombre] = 0;
      cantidadPorNombre[nombre] += Number(venta.cantidad);
    });

    const top5 = Object.entries(cantidadPorNombre)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    this.labels = top5.map(([nombre]) => nombre);
    this.data = top5.map(([_, cantidad]) => cantidad);

    this.actualizarGrafico();
  }

  async generarGraficoCategorias() {
    const productos = await firstValueFrom(
      this.productosService.obtenerTodos()
    );
    const ventas = await firstValueFrom(this.ventasService.obtenerVentas());

    const productoCategoriaMap: { [id: string]: string } = {};
    productos.forEach((producto: any) => {
      productoCategoriaMap[producto.idProducto] = producto.tipo;
    });

    const totalPorCategoria: { [tipo: string]: number } = {};
    ventas.forEach((venta: any) => {
      const tipo = productoCategoriaMap[venta.idProductoVenta];
      if (!tipo) return;
      if (!totalPorCategoria[tipo]) totalPorCategoria[tipo] = 0;
      totalPorCategoria[tipo] += Number(venta.precioTotal);
    });

    this.labels = Object.keys(totalPorCategoria);
    this.data = this.labels.map((cat) => totalPorCategoria[cat]);

    this.actualizarGrafico();
  }

  obtenerRegistrosGrafico() {
    let observable$;

    // Elegimos el servicio según la tabla
    switch (this.tabla) {
      case 'ventas':
        observable$ = this.ventasService.obtenerVentas(); // <-- usa tu servicio real
        break;
      case 'productos':
        observable$ = this.productosService.obtenerTodos();
        break;
      case 'trabajos':
        observable$ = this.trabajosService.getAll();
        break;
      default:
        console.warn(
          `No hay servicio configurado para la tabla: ${this.tabla}`
        );
        return;
    }

    observable$.subscribe((registros: any[]) => {
      const agrupadasPorMes: { [mes: string]: number } = {};
      let fechaRegistro: string;
      let totalRegistro: string;

      // Configuramos los nombres de campo según el tipo
      if (this.tabla === 'ventas') {
        fechaRegistro = 'fechaVenta';
        totalRegistro = 'precioTotal';
      } else if (this.tabla === 'trabajos') {
        fechaRegistro = 'fechaTrabajo';
        totalRegistro = 'valor';
      } else if (this.tabla === 'productos') {
        fechaRegistro = 'fechaIngreso'; // ajusta si tienes otro campo de fecha
        totalRegistro = 'precioUnitario'; // ajusta al campo que quieras graficar
      }

      registros.forEach((registro: any) => {
        if (!registro[fechaRegistro] || !registro[totalRegistro]) return;

        const fecha = new Date(registro[fechaRegistro]);
        if (isNaN(fecha.getTime())) return;

        const mes = `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`;

        if (!agrupadasPorMes[mes]) agrupadasPorMes[mes] = 0;
        agrupadasPorMes[mes] += Number(registro[totalRegistro]);
      });

      // Solo los últimos 6 meses ordenados
      const mesesOrdenados = Object.keys(agrupadasPorMes).sort();
      const ultimosMeses = mesesOrdenados.slice(-6);

      this.labels = ultimosMeses;
      this.data = ultimosMeses.map((mes) => agrupadasPorMes[mes]);

      this.actualizarGrafico();
    });
  }

  actualizarGrafico() {
    let labelName!: string;
    let typeValue: 'bar' | 'pie' = 'bar';
    let titulo!: string;
    let orientacion!: 'x' | 'y';
    let color!: string | string[];
    let borde!: string | string[];

    switch (this.tabla) {
      case 'ventas':
        labelName = 'Ventas Mensuales';
        titulo = 'Ventas Mensuales';
        orientacion = 'x';
        break;

      case 'trabajos':
        labelName = 'Trabajos Mensuales';
        titulo = 'Trabajos Mensuales';
        orientacion = 'x';
        break;

      case 'categorias':
        typeValue = 'pie';
        labelName = 'Total';
        titulo = 'Ventas por Categoría';
        break;

      case 'id':
        typeValue = 'bar';
        labelName = 'Cantidad';
        titulo = 'Productos Más Vendidos';
        orientacion = 'y';
        break;
    }

    if (typeValue === 'pie') {
      color = [
        'rgba(150, 50, 100, 0.7)',
        'rgba(255, 180, 64, 0.7)',
        'rgba(54, 185, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(118, 175, 190, 0.7)',
        'rgba(70, 80, 90, 0.7)',
        'rgba(85, 70, 255, 0.7)',
        'rgba(50, 200, 150, 0.7)',
      ];

      borde = [
        'rgba(100, 30, 70, 1)',
        'rgba(210, 140, 40, 1)',
        'rgba(40, 130, 185, 1)',
        'rgba(200, 50, 90, 1)',
        'rgba(90, 140, 160, 1)',
        'rgba(50, 60, 70, 1)',
        'rgba(60, 40, 200, 1)',
        'rgba(30, 140, 100, 1)',
      ];
    } else {
      color = 'rgba(50, 200, 200, 0.41)';
      borde = 'rgba(30, 136, 140, 0.69)';
    }

    let chartOptions: any = {};
    if (typeValue === 'bar') {
      chartOptions = {
        scales: {
          y: { beginAtZero: true },
        },
      };
    }

    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (ctx) {
      if (this.chart) {
        this.chart.data.labels = this.labels;
        this.chart.data.datasets[0].data = this.data;
        this.chart.update();
      } else {
        this.chart = new Chart(ctx, {
          type: typeValue,
          data: {
            labels: this.labels,
            datasets: [
              {
                label: labelName,
                data: this.data,
                backgroundColor: color,
                borderColor: borde,
                borderWidth: 1,
              },
            ],
          },
          options: {
            indexAxis: orientacion,
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: titulo,
                font: {
                  size: 18,
                },
              },
            },
            scales: {
              x: {
                beginAtZero: true,
              },
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }
  }
}
