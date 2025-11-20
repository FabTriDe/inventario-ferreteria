import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Trabajo } from '../../features/trabajos/models/trabajos.model';

@Injectable({
  providedIn: 'root',
})
export class TrabajosService {
  private apiUrl = 'http://localhost:3000/api/trabajos';

  constructor(private http: HttpClient) {}

  // Obtener todos los trabajos
  getAll(): Observable<Trabajo[]> {
    return this.http.get<Trabajo[]>(this.apiUrl);
  }

  // Obtener un trabajo por ID
  getById(id: number): Observable<Trabajo> {
    return this.http.get<Trabajo>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo trabajo
  create(trabajo: Trabajo): Observable<any> {
    return this.http.post(this.apiUrl, trabajo);
  }

  // Actualizar un trabajo
  update(id: number, trabajo: Trabajo): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, trabajo);
  }

  // Eliminar un trabajo
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
