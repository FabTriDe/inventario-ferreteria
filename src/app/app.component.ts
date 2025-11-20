import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MensajesAlertaComponent } from './shared/components/mensajes-alerta/mensajes-alerta.component';
import { SideBarComponent } from './shared/components/side-bar/side-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MensajesAlertaComponent, SideBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'inventario-ferreteria';
}
