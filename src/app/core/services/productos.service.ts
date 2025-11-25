import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private apiUrl = 'http://localhost:3000/api/productos'; // Ajusta si tu backend usa otro puerto o prefijo
  private productoCreadoSubject = new Subject<void>();
  private productosActualizados = new Subject<void>();
  private selectedOptionSource = new BehaviorSubject<string>('');
  selectedOption$ = this.selectedOptionSource.asObservable();

  constructor(private http: HttpClient) {}

  updateSelectedOption(option: string) {
    //Se usa en navbar.
    this.selectedOptionSource.next(option);
  }

  emitirActualizacion() {
    //Se usa en varios features y en componentes artificiales. Buscar, escaner, productos y proveedores.
    this.productosActualizados.next();
  }

  onProductosActualizados(): Observable<void> {
    //Se usa en barra busqueda, va ligado con el de arriba.
    return this.productosActualizados.asObservable();
  }

  onProductoCreado(): Observable<void> {
    //Usado en barra busqueda. //Productos.
    return this.productoCreadoSubject.asObservable();
  }

  emitirProductoCreado() {
    this.productoCreadoSubject.next();
  }

  // 🔹 Obtener todos los productos
  obtenerTodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  // 🔹 Obtener producto por ID
  obtenerPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // 🔹 Obtener productos por tipo
  obtenerPorTipo(tipo: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  // 🔹 Obtener productos que no sean tornillos
  obtenerSinTornillos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sin-tornillos`);
  }

  // 🔹 Obtener el siguiente ID según tipo
  obtenerUltimoId(tipo: string): Observable<{ nuevoId: string }> {
    return this.http.get<{ nuevoId: string }>(
      `${this.apiUrl}/ultimo-id?tipo=${tipo}`
    );
  }

  // 🔹 Agregar nuevo producto
  agregarProducto(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, datos);
  }

  // 🔹 Editar producto
  editarProducto(datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}`, datos);
  }

  // 🔹 Eliminar producto
  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
