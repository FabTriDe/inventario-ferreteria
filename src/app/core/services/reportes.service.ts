import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Reporte } from '../../features/reportes/models/reportes.model';

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  private apiUrl = 'http://localhost:3000/api/reportes';

  constructor(private http: HttpClient) {}

  // 🔹 Obtener todos los reportes
  getAll(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(this.apiUrl);
  }

  // 🔹 Obtener un reporte por ID
  getById(id: number): Observable<Reporte> {
    return this.http.get<Reporte>(`${this.apiUrl}/${id}`);
  }

  // 🔹 Crear un nuevo reporte
  create(reporte: Reporte): Observable<any> {
    return this.http.post(this.apiUrl, reporte);
  }

  // 🔹 Actualizar un reporte
  update(id: number, reporte: Reporte): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, reporte);
  }

  // 🔹 Eliminar un reporte
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // 🔹 Obtener reportes por tipo
  getByTipo(tipo: string): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(`${this.apiUrl}/tipo/${tipo}`);
  }
}
