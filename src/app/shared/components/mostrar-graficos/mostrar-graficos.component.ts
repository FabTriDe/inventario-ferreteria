import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GeneradorGraficosComponent } from "../generador-graficos/generador-graficos.component";

@Component({
  selector: 'app-mostrar-graficos',
  imports: [GeneradorGraficosComponent],
  templateUrl: './mostrar-graficos.component.html',
  styleUrl: './mostrar-graficos.component.css',
})
export class MostrarGraficosComponent {
  constructor(private router: Router) {}

  ngOnInit() {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    document.body.style.overflow = 'auto'; // Volver a lo normal cuando salgas
  }

  navegar(ruta: string) {
    this.router.navigate([`${ruta}`]);
  }
}
