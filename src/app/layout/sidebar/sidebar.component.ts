import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

interface MenuItem {
  name: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
  section?: string; // ← NUEVO
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule,
    MatDividerModule,
    MatButtonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Output() moduleSelected = new EventEmitter<string>();
  @Output() sectionSelected = new EventEmitter<{section: string, index: number}>(); // ← NUEVO
  
  selectedModule: string = '';

  menuItems: MenuItem[] = [
    {
      name: 'Gestión Académica',
      icon: 'school',
      expanded: false,
      section: 'academicos', // ← NUEVO
      children: [
        { name: 'Académicos', icon: 'person', route: 'academicos' },
        { name: 'Apoyos Individuales', icon: 'account_balance_wallet', route: 'apoyos-eco' },
        { name: 'Plazas', icon: 'location_city', route: 'plazas' }
      ]
    },
    {
      name: 'Cuerpos Académicos',
      icon: 'groups',
      expanded: false,
      section: 'cuerpos', // ← NUEVO
      children: [
        { name: 'Cuerpos Académicos', icon: 'group_work', route: 'cuerpos-academicos' },
        { name: 'Miembros', icon: 'people', route: 'miembros-ca' },
        { name: 'Apoyos CA', icon: 'group_add', route: 'apoyos-eco-ca' }
      ]
    },
    {
      name: 'Servicios',
      icon: 'room_service',
      expanded: false,
      section: 'servicios', // ← NUEVO
      children: [
        { name: 'Citas', icon: 'event', route: 'citas' },
        { name: 'Descargas Académicas', icon: 'download', route: 'descargas' }
      ]
    },
    {
      name: 'Catálogos Básicos',
      icon: 'category',
      expanded: false,
      section: 'catalogos', 
      children: [
        { name: 'Áreas', icon: 'domain', route: 'cat-areas' },
        { name: 'Áreas de Dedicación', icon: 'science', route: 'cat-area-dedica' },
        { name: 'Géneros', icon: 'wc', route: 'cat-generos' },
        { name: 'Nacionalidades', icon: 'flag', route: 'cat-nacionalidades' },
        { name: 'Motivos', icon: 'help_outline', route: 'cat-motivos' },
        { name: 'Roles', icon: 'security', route: 'cat-roles' },
        { name: 'Nivel de Estudios', icon: 'school', route: 'cat-nivel-estudios' },
        { name: 'Regiones', icon: 'map', route: 'cat-regiones' },
        { name: 'Entidades', icon: 'business', route: 'cat-entidades' },
        { name: 'Períodos', icon: 'date_range', route: 'cat-periodos' },
        { name: 'Disciplinas', icon: 'science', route: 'cat-disciplinas' },
        { name: 'Estados de Apoyo', icon: 'info', route: 'cat-estadoapoyo' },
        { name: 'Grados CA', icon: 'grade', route: 'cat-gradoca' }
      ]
    }
  ];

  selectModule(route: string, name: string) {
    this.selectedModule = route;
    this.moduleSelected.emit(route);
  }

  // ← NUEVO MÉTODO
  selectSection(section: string, childIndex: number) {
    this.sectionSelected.emit({ section, index: childIndex });
  }

  trackByFn(index: number, item: MenuItem): any {
    return item.name;
  }

  trackByChildFn(index: number, item: MenuItem): any {
    return item.route || item.name;
  }
}