import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Venta } from '../../features/ventas/models/ventas.model';

@Injectable({
  providedIn: 'root',
})
export class VentasService {
  private apiUrl = 'http://localhost:3000/api/ventas';

  constructor(private http: HttpClient) {}

  crearFactura() {
    return this.http.post(
      'http://localhost:3000/api/facturas-ventas/crear',
      {}
    );
  }

  // Generar PDF de factura
  generarPDFFactura(idFactura: number) {
    return this.http.get(
      `http://localhost:3000/api/facturas-ventas/pdf/${idFactura}`,
      {
        responseType: 'blob', // importante para descargar PDF
      }
    );
  }

  // 🔹 Obtener todas las ventas
  obtenerVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.apiUrl);
  }

  // 🔹 Obtener ventas con JOIN (productos + ventas)
  obtenerVentasJoin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/join`);
  }

  // 🔹 Obtener venta por ID
  obtenerVentasPorId(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/${id}`);
  }

  // 🔹 Agregar una nueva venta
  agregarVenta(venta: Venta): Observable<any> {
    return this.http.post(this.apiUrl, venta);
  }

  // 🔹 Editar una venta existente
  editarVenta(venta: Venta): Observable<any> {
    return this.http.put(this.apiUrl, venta);
  }

  // 🔹 Eliminar una venta por ID
  eliminarVenta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
