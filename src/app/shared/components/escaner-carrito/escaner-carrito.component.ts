import { Component, ViewChild } from '@angular/core';
import { ProductosService } from '../../../core/services/productos.service';
import { lastValueFrom } from 'rxjs';
import { AlertasService } from '../../../core/services/alertas.service';
import { BarraBusquedaComponent } from '../barra-busqueda/barra-busqueda.component';
import { VentasService } from '../../../core/services/ventas.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VistaImagenProductoComponent } from '../vista-imagen-producto/vista-imagen-producto.component';

@Component({
  selector: 'app-escaner-carrito',
  imports: [
    BarraBusquedaComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    VistaImagenProductoComponent,
  ],
  templateUrl: './escaner-carrito.component.html',
  styleUrl: './escaner-carrito.component.css',
})
export class EscanerCarritoComponent {
  constructor(
    private productoServicio: ProductosService,
    private ventasService: VentasService,
    private alertasServicio: AlertasService
  ) {}

  productosEnCarrito: any[] = [];
  modalImagen: boolean = false;
  productoSeleccionado: any;
  @ViewChild(BarraBusquedaComponent) barraBusqueda!: BarraBusquedaComponent;

  devolverFocoBarra() {
    if (this.barraBusqueda) {
      this.barraBusqueda.enfocarInput();
    }
  }

  // Método que recibe el producto emitido desde la barra
  agregarAlCarrito(producto: any) {
    if (!producto) return;

    const existente = this.productosEnCarrito.find(
      (p) =>
        p.idProducto === producto.idProducto && p.nombre === producto.nombre
    );

    if (existente) {
      existente.cantidadVender += 1; // cantidad a vender
    } else {
      this.productosEnCarrito.unshift({
        ...producto,
        cantidadVender: 1, // cantidad a vender
        cantidad: parseInt(producto.cantidad), // stock real
      });
    }
  }

  // Cambiar la cantidad (botones +/-)
  cambiarCantidad(producto: any, cambio: number) {
    const index = this.productosEnCarrito.findIndex(
      (p) => p.idProducto === producto.idProducto
    );

    if (index !== -1) {
      this.productosEnCarrito[index].cantidadVender += cambio;

      if (this.productosEnCarrito[index].cantidadVender <= 0) {
        // eliminar producto si la cantidad es 0
        this.productosEnCarrito.splice(index, 1);
      }
    }
  }

  // Eliminar un producto completo del carrito
  eliminarProductoCarrito(producto: any) {
    const index = this.productosEnCarrito.findIndex(
      (p) => p.idProducto === producto.idProducto
    );
    if (index !== -1) {
      this.productosEnCarrito.splice(index, 1);
    }
  }

  async venderProductos() {
    if (!this.productosEnCarrito?.length) return;

    try {
      const errores: string[] = [];

      // 1️⃣ Validar stock en servidor
      for (const item of this.productosEnCarrito) {
        const productoServidor: any = await lastValueFrom(
          this.productoServicio.obtenerPorId(item.idProducto)
        );

        const stockServidor = Number(productoServidor?.cantidad ?? 0);
        const qty = Number(item.cantidadVender ?? 0);

        if (!Number.isFinite(qty) || qty <= 0) {
          errores.push(`Cantidad inválida para "${item.nombre}".`);
          continue;
        }

        if (qty > stockServidor) {
          errores.push(
            `No hay suficiente cantidad de "${item.nombre}". Disponible: ${stockServidor}.`
          );
          continue;
        }

        item.cantidadServidor = stockServidor;
      }

      if (errores.length > 0) {
        this.alertasServicio.mostrar(
          'No se pudo procesar la venta:\n\n' + errores.join('\n'),
          'error'
        );
        return;
      }

      // Guardar la lista de productos antes de limpiar
      const listaProductos = this.productosEnCarrito
        .map((p) => `${p.nombre} x${p.cantidadVender}`)
        .join('\n');

      // 2️⃣ Mostrar primero el modal para decidir si crear factura
      this.alertasServicio.mostrarImprimir(
        '¿Desea imprimir esta factura?',
        async () => {
          // ✅ Usuario aceptó → crear factura
          try {
            const facturaCreada: any = await lastValueFrom(
              this.ventasService.crearFactura()
            );
            const idFactura = facturaCreada.idFacturaVenta;

            // Crear ventas asociadas a esa factura
            for (const item of this.productosEnCarrito) {
              const qty = Number(item.cantidadVender);
              const precioUnitario = this.aplicarDescuento(item)
                ? Number(item.precioDescuento)
                : Number(item.precio);
              const precioTotal = precioUnitario * qty;

              const datosVenta = {
                idProductoVenta: item.idProducto,
                cantidad: qty,
                valorUnitario: precioUnitario,
                precioTotal,
                idFacturaVenta: idFactura,
              };

              await lastValueFrom(this.ventasService.agregarVenta(datosVenta));

              const nuevoStock = (Number(item.cantidadServidor) || 0) - qty;
              const productoActualizado = {
                idProducto: item.idProducto,
                nombre: item.nombre,
                precio: item.precio,
                cantidad: nuevoStock,
              };

              await lastValueFrom(
                this.productoServicio.editarProducto(productoActualizado)
              );

              // 🔄 Emitir actualización global para refrescar "productos"
              this.productoServicio.emitirActualizacion();
            }

            // Generar e imprimir la factura (solo una vez)
            await this.imprimirFactura(idFactura);
            this.limpiarDespuesDeVenta();

            setTimeout(() => {
              this.alertasServicio.mostrar(
                `Productos vendidos con éxito:\n${listaProductos}`,
                'exito'
              );
            }, 50);
          } catch (error) {
            console.error('Error al imprimir o crear factura:', error);
            this.alertasServicio.mostrar(
              'Error al generar la factura.',
              'error'
            );
          }
        },
        async () => {
          // ❌ Usuario canceló → registrar venta sin factura
          try {
            for (const item of this.productosEnCarrito) {
              const qty = Number(item.cantidadVender);
              const precioUnitario = this.aplicarDescuento(item)
                ? Number(item.precioDescuento)
                : Number(item.precio);
              const precioTotal = precioUnitario * qty;

              const datosVenta = {
                idProductoVenta: item.idProducto,
                cantidad: qty,
                valorUnitario: precioUnitario,
                precioTotal: precioTotal,
                // 👇 Sin idFacturaVenta → se guarda como NULL
              };

              await lastValueFrom(this.ventasService.agregarVenta(datosVenta));

              const nuevoStock = (Number(item.cantidadServidor) || 0) - qty;
              const productoActualizado = {
                idProducto: item.idProducto,
                nombre: item.nombre,
                precio: item.precio,
                cantidad: nuevoStock,
              };

              await lastValueFrom(
                this.productoServicio.editarProducto(productoActualizado)
              );

              // 🔄 Emitir actualización también aquí
              this.productoServicio.emitirActualizacion();
            }

            this.limpiarDespuesDeVenta();
            setTimeout(() => {
              this.alertasServicio.mostrar(
                `Productos vendidos sin factura:\n${listaProductos}`,
                'exito'
              );
            }, 50);
          } catch (error) {
            console.error('Error al vender sin factura:', error);
            this.alertasServicio.mostrar(
              'No se pudo completar la venta sin factura.',
              'error'
            );
          }
        },

        // 🧾 Nuevo callback: imprimir con copia
        async () => {
          try {
            const facturaCreada: any = await lastValueFrom(
              this.ventasService.crearFactura()
            );
            const idFactura = facturaCreada.idFacturaVenta;

            // Crear ventas asociadas a esa factura (igual que antes)
            for (const item of this.productosEnCarrito) {
              const qty = Number(item.cantidadVender);
              const precioUnitario = this.aplicarDescuento(item)
                ? Number(item.precioDescuento)
                : Number(item.precio);
              const precioTotal = precioUnitario * qty;

              const datosVenta = {
                idProductoVenta: item.idProducto,
                cantidad: qty,
                valorUnitario: precioUnitario,
                precioTotal,
                idFacturaVenta: idFactura,
              };

              await lastValueFrom(this.ventasService.agregarVenta(datosVenta));

              const nuevoStock = (Number(item.cantidadServidor) || 0) - qty;
              const productoActualizado = {
                idProducto: item.idProducto,
                nombre: item.nombre,
                precio: item.precio,
                cantidad: nuevoStock,
              };

              await lastValueFrom(
                this.productoServicio.editarProducto(productoActualizado)
              );

              this.productoServicio.emitirActualizacion();
            }

            // 🖨️ Imprimir dos veces (original + copia)
            await this.imprimirFactura(idFactura);
            await this.imprimirFactura(idFactura);

            this.limpiarDespuesDeVenta();

            setTimeout(() => {
              this.alertasServicio.mostrar(
                `Productos vendidos con éxito (2 copias):\n${listaProductos}`,
                'exito'
              );
            }, 50);
          } catch (error) {
            console.error('Error al imprimir copias de la factura:', error);
            this.alertasServicio.mostrar(
              'Error al generar la factura con copia.',
              'error'
            );
          }
        }
      );
    } catch (err) {
      console.error('Error en venderProductos:', err);
      this.alertasServicio.mostrar(
        'Ocurrió un error procesando la venta. Revisa la consola.',
        'error'
      );
    }
  }

  // 🔹 Reemplazar método imprimirFactura
  private async imprimirFactura(idFactura: number) {
    try {
      await lastValueFrom(this.ventasService.generarPDFFactura(idFactura));
      this.alertasServicio.mostrar('Factura impresa correctamente', 'exito');
    } catch (err) {
      console.error('Error al imprimir:', err);
      this.alertasServicio.mostrar('No se pudo imprimir la factura', 'error');
    }
  }

  // 🔹 Limpieza final (carrito, foco, actualización visual)
  private limpiarDespuesDeVenta() {
    this.productosEnCarrito = [];
    this.devolverFocoBarra();

    if (typeof this.productoServicio.emitirActualizacion === 'function') {
      this.productoServicio.emitirActualizacion();
    }
  }

  // Devuelve true si aplicarDescuento está activo
  aplicarDescuento(producto: any): boolean {
    return !!producto.aplicarDescuento && producto.precioDescuento != null;
  }

  // Total del carrito
  calcularTotalCarrito(): number {
    return this.productosEnCarrito.reduce((total, item) => {
      const precioUnitario = this.aplicarDescuento(item)
        ? item.precioDescuento
        : item.precio;
      return total + precioUnitario * item.cantidadVender;
    }, 0);
  }

  abrirImagen(producto: any) {
    this.productoSeleccionado = producto;
    this.modalImagen = true;
  }

  cerrarVistaImagen() {
    this.productoSeleccionado = null;
    this.modalImagen = false;
  }
}
