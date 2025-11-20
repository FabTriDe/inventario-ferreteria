import { Component } from '@angular/core';
import { ProductosService } from '../../../core/services/productos.service';
import { VistaImagenProductoComponent } from '../vista-imagen-producto/vista-imagen-producto.component';
import { ModalVentasComponent } from '../modal-ventas/modal-ventas.component';
import { BarraBusquedaComponent } from '../barra-busqueda/barra-busqueda.component';
import { NumeroFormateadoPipe } from '../../pipes/numero-formateado.pipe';
import { CommonModule } from '@angular/common';
import { FiltrosComponent } from "../filtros/filtros.component";

@Component({
  selector: 'app-catalogo',
  imports: [
    CommonModule,
    VistaImagenProductoComponent,
    ModalVentasComponent,
    BarraBusquedaComponent,
    NumeroFormateadoPipe,
    FiltrosComponent
],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css',
})
export class CatalogoComponent {
  registros: any[] = [];
  registrosFiltrados: any[] = [];
  tablaSeleccionada: string = 'productos';
  tipoSeleccionado: string = '';
  ordenSeleccionado: string = '';
  mostrarImagenProducto = false;
  productoSeleccionado: any = null;

  productoEncontrado: any = null;
  mostrarFormularioVenta: boolean = false;
  productoParaVender: any = null;

  constructor(private productoServicio: ProductosService) {
    this.productoServicio.selectedOption$.subscribe((option) => {
      this.tipoSeleccionado = option;
    });
  }

  ngOnInit() {
    this.obtenerRegistros();
  }

  obtenerRegistros() {
    this.productoServicio.obtenerTodos().subscribe((data) => {
      this.registros = data;
      this.registrosFiltrados = [...this.registros]; // inicialmente sin filtros
    });
  }

  actualizarRegistrosFiltrados(lista: any[]) {
    this.registrosFiltrados = lista;
  }

  recibirProductos(productos: any[]) {
    if (productos && productos.length > 0) {
      this.registros = productos; // muestra solo los productos filtrados
    } else {
    }
  }

  verImagenProducto(producto: any) {
    this.productoSeleccionado = producto;
    this.mostrarImagenProducto = true;
  }

  cerrarVistaImagen() {
    this.mostrarImagenProducto = false;
  }

  //Para ventas.
  venderProducto(producto: any) {
    this.productoParaVender = producto;
    this.mostrarFormularioVenta = true;
  }

  ventaRealizada(event: any) {
    console.log('Venta realizada:', event);
    this.mostrarFormularioVenta = false;
  }
  cerrarVenta() {
    this.mostrarFormularioVenta = false;
  }
}
