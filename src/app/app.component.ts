import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'; // Importación añadida
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { IconService } from './core/services/icon.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatIconModule, // Módulo añadido aquí
    MainLayoutComponent
  ],
  template: `<app-main-layout></app-main-layout>`,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'supa-frontend';

  constructor(private iconService: IconService) {}

  ngOnInit() {
    this.iconService.registerIcons();
  }
}