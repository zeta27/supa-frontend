import { Component, Input, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface FeatureData {
  name: string;
  description: string;
  icon: string;
}

interface TabItem {
  label: string;
  route: string;
  icon: string;
  url?: SafeResourceUrl;
}

@Component({
  selector: 'app-iframe-container',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTabsModule
  ],
  templateUrl: './iframe-container.component.html',
  styleUrls: ['./iframe-container.component.scss']
})
export class IframeContainerComponent implements OnInit, OnDestroy {
  @Input() selectedModule: string = '';
  @Input() currentSection: string = '';
  @Input() selectedTabIndex: number = 0;
  
  private isBrowser: boolean;
  
  // Datos para la pantalla de bienvenida
  particles: any[] = Array(4).fill(null);
  featuresData: FeatureData[] = [
    {
      name: 'Gestión Académica',
      description: 'Administre el personal académico, apoyos individuales y plazas PRODEP',
      icon: 'school'
    },
    {
      name: 'Cuerpos Académicos',
      description: 'Gestione cuerpos académicos, miembros, roles y apoyos para CA',
      icon: 'groups'
    },
    {
      name: 'Servicios',
      description: 'Módulo de citas y descargas académicas',
      icon: 'room_service'
    },
    {
      name: 'Catálogos',
      description: 'Administración de catálogos base del sistema',
      icon: 'inventory_2'
    }
  ];

  // Tabs por sección
  academicos: TabItem[] = [
    { label: 'Académicos', route: 'academicos', icon: 'person' },
    { label: 'Apoyos Individuales', route: 'apoyos-eco', icon: 'account_balance_wallet' },
    { label: 'Plazas', route: 'plazas', icon: 'location_city' }
  ];

  cuerpos: TabItem[] = [
    { label: 'Cuerpos Académicos', route: 'cuerpos-academicos', icon: 'group_work' },
    { label: 'Miembros', route: 'miembros-ca', icon: 'people' },
    { label: 'Apoyos CA', route: 'apoyos-eco-ca', icon: 'group_add' }
  ];

  servicios: TabItem[] = [
    { label: 'Citas', route: 'citas', icon: 'event' },
    { label: 'Descargas Académicas', route: 'descargas', icon: 'download' }
  ];

  catalogos: TabItem[] = [
    { label: 'Áreas', route: 'cat-areas', icon: 'domain' },
    { label: 'Áreas de Dedicación', route: 'cat-area-dedica', icon: 'science' },
    { label: 'Géneros', route: 'cat-generos', icon: 'wc' },
    { label: 'Nacionalidades', route: 'cat-nacionalidades', icon: 'flag' },
    { label: 'Motivos', route: 'cat-motivos', icon: 'help_outline' },
    { label: 'Roles', route: 'cat-roles', icon: 'security' },
    { label: 'Nivel de Estudios', route: 'cat-nivel-estudios', icon: 'school' },
    { label: 'Regiones', route: 'cat-regiones', icon: 'map' },
    { label: 'Entidades', route: 'cat-entidades', icon: 'business' },
    { label: 'Períodos', route: 'cat-periodos', icon: 'date_range' },
    { label: 'Disciplinas', route: 'cat-disciplinas', icon: 'science' },
    { label: 'Estados de Apoyo',route: 'cat-estadoapoyo', icon: 'info' },
     { label: 'Grados CA', route: 'cat-gradoca' , icon: 'grade'}
  ];

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private sanitizer: DomSanitizer
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initializeSafeUrls();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  private initializeSafeUrls(): void {
    const baseUrl = 'http://localhost:4200';
    
    this.academicos = this.academicos.map(item => ({
      ...item,
      url: this.sanitizer.bypassSecurityTrustResourceUrl(`${baseUrl}/#/modulo/${item.route}`)
    }));

    this.cuerpos = this.cuerpos.map(item => ({
      ...item,
      url: this.sanitizer.bypassSecurityTrustResourceUrl(`${baseUrl}/#/modulo/${item.route}`)
    }));

    this.servicios = this.servicios.map(item => ({
      ...item,
      url: this.sanitizer.bypassSecurityTrustResourceUrl(`${baseUrl}/#/modulo/${item.route}`)
    }));

    this.catalogos = this.catalogos.map(item => ({
      ...item,
      url: this.sanitizer.bypassSecurityTrustResourceUrl(`${baseUrl}/#/catalogo/${item.route}`)
    }));
  }

  getCurrentTabs(): TabItem[] {
    switch(this.currentSection) {
      case 'academicos': return this.academicos;
      case 'cuerpos': return this.cuerpos;
      case 'servicios': return this.servicios;
      case 'catalogos': return this.catalogos;
      default: return [];
    }
  }

  getSectionTitle(): string {
    const titles: {[key: string]: string} = {
      'academicos': 'Gestión Académica',
      'cuerpos': 'Cuerpos Académicos',
      'servicios': 'Servicios',
      'catalogos': 'Catálogos del Sistema'
    };
    return titles[this.currentSection] || 'Bienvenido';
  }

  getSectionSubtitle(): string {
    const subtitles: {[key: string]: string} = {
      'academicos': 'Administre el personal académico y sus datos',
      'cuerpos': 'Administre los cuerpos académicos y sus miembros',
      'servicios': 'Administre citas y descargas académicas',
      'catalogos': 'Administre la información base del sistema'
    };
    return subtitles[this.currentSection] || 'Seleccione un módulo del menú lateral';
  }

  getSectionIcon(): string {
    const icons: {[key: string]: string} = {
      'academicos': 'school',
      'cuerpos': 'groups',
      'servicios': 'room_service',
      'catalogos': 'inventory_2'
    };
    return icons[this.currentSection] || 'dashboard';
  }

  // Métodos para la pantalla de bienvenida
  openHelp(): void {
    window.open('https://www.uv.mx/', '_blank');
  }

  openSupport(): void {
    window.open('https://www.uv.mx/', '_blank');
  }

  openDocumentation(): void {
    window.open('https://www.uv.mx/', '_blank');
  }

  getBuildInfo(): string {
    return new Date().toISOString().split('T')[0].replace(/-/g, '');
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}