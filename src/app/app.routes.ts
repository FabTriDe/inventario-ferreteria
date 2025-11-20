import { Routes } from '@angular/router';
import { ProductosComponent } from './features/productos/pages/productos/productos.component';
import { TrabajosComponent } from './features/trabajos/pages/trabajos/trabajos/trabajos.component';
import { FacturasComponent } from './features/facturas/pages/facturas/facturas.component';
import { MostrarGraficosComponent } from './shared/components/mostrar-graficos/mostrar-graficos.component';
import { EscanerCarritoComponent } from './shared/components/escaner-carrito/escaner-carrito.component';
import { VentasComponent } from './features/ventas/pages/ventas/ventas.component';
import { CatalogoComponent } from './shared/components/catalogo/catalogo.component';
import { ReportesComponent } from './features/reportes/pages/reportes/reportes.component';

export const routes: Routes = [
  { path: '', redirectTo: '/escaner', pathMatch: 'full' }, // Redirige al escaner por defecto
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'menu', component: MostrarGraficosComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'ventas', component: VentasComponent },
  { path: 'reportes', component: ReportesComponent },
  { path: 'trabajos', component: TrabajosComponent },
  { path: 'facturas', component: FacturasComponent },
  { path: 'escaner', component: EscanerCarritoComponent },
];
