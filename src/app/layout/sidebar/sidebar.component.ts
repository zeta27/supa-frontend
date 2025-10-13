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
  
  selectedModule: string = '';

  menuItems: MenuItem[] = [
    {
      name: 'Gestión Académica',
      icon: 'school',
      expanded: true,
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
      children: [
        { name: 'Citas', icon: 'event', route: 'citas' },
        { name: 'Descargas Académicas', icon: 'download', route: 'descargas' }
      ]
    },
    {
      name: 'Catálogos Básicos',
      icon: 'category',
      expanded: false,
      children: [
        { name: 'Géneros', icon: 'wc', route: 'cat-generos' },
        { name: 'Nacionalidades', icon: 'flag', route: 'cat-nacionalidades' },
        { name: 'Motivos', icon: 'help_outline', route: 'cat-motivos' },
        { name: 'Roles', icon: 'security', route: 'cat-roles' },
        { name: 'Nivel de Estudios', icon: 'school', route: 'cat-nivel-estudios' },
        { name: 'Áreas', icon: 'domain', route: 'cat-areas' },
        { name: 'Regiones', icon: 'map', route: 'cat-regiones' },
        { name: 'Entidades', icon: 'business', route: 'cat-entidades' },
        { name: 'Períodos', icon: 'date_range', route: 'cat-periodos' },
        { name: 'Disciplinas', icon: 'science', route: 'cat-disciplinas' },
        { name: 'Tipos de Contratación', icon: 'work', route: 'cat-tipo-contrataciones' },
        { name: 'Temporalidades', icon: 'schedule', route: 'cat-temp-contrataciones' },
        { name: 'Grados CA', icon: 'military_tech', route: 'cat-grado-ca' },
        { name: 'Catálogo Niveles', icon: 'format_list_numbered', route: 'cat-nivel-snii' },
        { name: 'Estados de Apoyo', icon: 'assignment_turned_in', route: 'cat-estado-apoyo' },                
        { name: 'Tipos de Apoyo', icon: 'category', route: 'cat-tipo-apoyo' }
      ]
    },

  ];

  selectModule(route: string, name: string) {
    this.selectedModule = route;
    this.moduleSelected.emit(route);
    console.log(`Módulo seleccionado: ${name} (${route})`);
  }

  trackByFn(index: number, item: MenuItem): string {
    return item.name;
  }

  trackByChildFn(index: number, item: MenuItem): string {
    return item.route || item.name;
  }
}