import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Factura } from '../../features/facturas/models/facturas.model';

@Injectable({
  providedIn: 'root',
})
export class FacturasService {
  private apiUrl = 'http://localhost:3000/api/facturas'; // ajusta si cambias de puerto o ruta

  constructor(private http: HttpClient) {}

  obtenerFacturas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.apiUrl}/join`);
  }

  obtenerPorId(id: number | string): Observable<Factura> {
    return this.http.get<Factura>(`${this.apiUrl}/${id}`);
  }

  agregar(factura: Factura): Observable<any> {
    return this.http.post(`${this.apiUrl}`, factura);
  }

  editar(factura: Partial<Factura>): Observable<any> {
    return this.http.put(`${this.apiUrl}`, factura);
  }

  eliminar(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
