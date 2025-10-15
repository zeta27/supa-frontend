import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { IframeContainerComponent } from '../iframe-container/iframe-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    SidebarComponent,
    IframeContainerComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  selectedModule: string = '';
  currentSection: string = ''; // ← NUEVO
  selectedTabIndex: number = 0; // ← NUEVO

  onModuleSelected(module: string) {
    this.selectedModule = module;
    console.log('Módulo seleccionado:', module);
  }

  // ← NUEVO MÉTODO
  onSectionSelected(event: {section: string, index: number}) {
    this.currentSection = event.section;
    this.selectedTabIndex = event.index;
    console.log('Sección seleccionada:', event.section, 'Tab:', event.index);
  }
}