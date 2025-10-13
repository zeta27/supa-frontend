import { Component, Input, OnChanges, SimpleChanges, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface FeatureData {
  name: string;
  description: string;
  icon: string;
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
    MatTooltipModule
  ],
  templateUrl: './iframe-container.component.html',
  styleUrls: ['./iframe-container.component.scss']
})
export class IframeContainerComponent implements OnChanges, OnInit, OnDestroy {
  @Input() selectedModule: string = '';
  
  // Estados del componente
  isLoading: boolean = false;
  hasError: boolean = false;
  errorDetails: string = '';
  isFullscreen: boolean = false;
  isOnline: boolean = true;
  loadingProgress: number = 0;
  
  // Datos para la pantalla de bienvenida
  particles: any[] = Array(4).fill(null); // Para las partículas animadas
  featuresData: FeatureData[] = [
    {
      name: 'Personal Académico',
      description: 'Académicos Registrados, Datos Registrados, Vigencias y Apoyos',
      icon: 'person'
    },
    {
      name: 'Cuerpos Académicos',
      description: 'Administración de CA, miembros, líneas de investigación, Vigencias y Apoyos',
      icon: 'groups'
    },


    {
      name: 'Catálogos',
      description: 'Administración de catálogos base del sistema',
      icon: 'category'
    }
  ];
  
  // Variables para progress loading
  private loadingInterval: any;
  private onlineStatusInterval: any;
  private isBrowser: boolean;
  
  constructor(
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    // Solo ejecutar en el navegador
    if (this.isBrowser) {
      // Detectar estado de conexión
      this.checkOnlineStatus();
      this.onlineStatusInterval = setInterval(() => {
        this.checkOnlineStatus();
      }, 30000); // Verificar cada 30 segundos

      // Escuchar eventos de conexión
      window.addEventListener('online', () => this.isOnline = true);
      window.addEventListener('offline', () => this.isOnline = false);
    }
  }

  ngOnDestroy() {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
    }
    if (this.onlineStatusInterval) {
      clearInterval(this.onlineStatusInterval);
    }
    
    // Remover event listeners solo en el navegador
    if (this.isBrowser) {
      window.removeEventListener('online', () => this.isOnline = true);
      window.removeEventListener('offline', () => this.isOnline = false);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedModule'] && this.selectedModule) {
      this.loadModule();
    }
  }

  private loadModule() {
    this.isLoading = true;
    this.hasError = false;
    this.errorDetails = '';
    this.loadingProgress = 0;
    
    // Simular progreso de carga
    this.simulateLoadingProgress();
  }

  private simulateLoadingProgress() {
    this.loadingInterval = setInterval(() => {
      this.loadingProgress += Math.random() * 15;
      
      if (this.loadingProgress >= 90) {
        this.loadingProgress = 90;
        clearInterval(this.loadingInterval);
      }
    }, 200);
  }

  private checkOnlineStatus() {
    // Solo verificar en el navegador
    if (this.isBrowser) {
      this.isOnline = navigator.onLine;
    } else {
      this.isOnline = true; // Asumir online en el servidor
    }
  }

  // Métodos para gestión del iframe
  getIframeSrc(): SafeResourceUrl {
    if (!this.selectedModule) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    }
    
    // URL base - cambiar por tu URL real de módulos
    const baseUrl = 'http://localhost:4200'; // Cambiar por tu URL base
    let moduleUrl: string;
    
    // Mapeo de rutas específicas si es necesario
    switch (this.selectedModule) {
      case 'academicos':
        moduleUrl = `${baseUrl}/modulos/academicos`;
        break;
      case 'estudios':
        moduleUrl = `${baseUrl}/modulos/estudios`;
        break;
      case 'cuerpos-academicos':
        moduleUrl = `${baseUrl}/modulos/cuerpos-academicos`;
        break;
      // Agregar más casos según sea necesario
      default:
        moduleUrl = `${baseUrl}/modulos/${this.selectedModule}`;
    }
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(moduleUrl);
  }

  getModuleTitle(): string {
    const titleMap: { [key: string]: string } = {
      // Gestión Académica
      'academicos': 'Académicos',
      'estudios': 'Estudios Realizados',
      'disciplinas': 'Disciplinas',
      'areas-dedica': 'Áreas de Dedicación',
      'entidades': 'Entidades Académicas',
      
      // Cuerpos Académicos
      'cuerpos-academicos': 'Cuerpos Académicos',
      'miembros-ca': 'Miembros de Cuerpos Académicos',
      'roles-miembros': 'Roles de Miembros',
      'grados-ca': 'Grados de Cuerpos Académicos',
      'lgac': 'Líneas de Generación y Aplicación del Conocimiento',
      
      // Apoyos
      'apoyos-eco': 'Apoyos Económicos Individuales',
      'apoyos-eco-ca': 'Apoyos Económicos para Cuerpos Académicos',
      'cat-estado-apoyo': 'Estados de Apoyo',
      'cat-tipo-apoyo': 'Tipos de Apoyo',
      
      // Personal
      'contrataciones': 'Tipos de Contratación',
      'plazas': 'Plazas PRODEP',
      'vigencias-perfil': 'Vigencias de Perfil PRODEP',
      'vigencias-cuerpo': 'Vigencias de Cuerpos Académicos',
  
      
      // Servicios
      'citas': 'Sistema de Citas',
      'descargas': 'Descargas Académicas',
      
      // Catálogos Básicos
      'cat-generos': 'Catálogo de Géneros',
      'cat-nacionalidades': 'Catálogo de Nacionalidades',
      'cat-motivos': 'Catálogo de Motivos',
      'cat-roles': 'Catálogo de Roles',
      'cat-nivel-estudios': 'Catálogo de Niveles de Estudio',
      'cat-areas': 'Catálogo de Áreas',
      'cat-regiones': 'Catálogo de Regiones',
      'cat-entidades': 'Catálogo de Entidades',
      'cat-periodos': 'Catálogo de Períodos',
      'cat-disciplinas': 'Catálogo de Disciplinas',
      'cat-tipo-contrataciones': 'Tipos de Contratación',
      'cat-temp-contrataciones': 'Temporalidades de Contratación',
      'cat-grado-ca': 'Catálogo de Grados CA',
      'cat-nivel-snii': 'Catálogo de Niveles SNII'
    };
    
    return titleMap[this.selectedModule] || 'Módulo SISE';
  }

  getModuleDescription(): string {
    const descriptionMap: { [key: string]: string } = {
      'academicos': 'Académicos',
      'estudios': 'Estudios Realizados',
      'disciplinas': 'Disciplinas',
      'cuerpos-academicos': 'Cuerpos Académicos',
      'apoyos-eco': 'Administración de apoyos económicos y financiamiento',
      'contrataciones': 'Contrataciones',
      'plazas': 'Plazas',
      'citas': 'Agenda',
      'cat-generos': 'Catálogo de Género',
      'cat-nacionalidades': 'Catálogo de Nacionales',
      'cat-areas': 'Catalogo de Áreas Académicas',
      // Agregar más descripciones según sea necesario
    };
    
    return descriptionMap[this.selectedModule] || 'Gestión de información del sistema SISE';
  }

  getModuleIcon(): string {
    const iconMap: { [key: string]: string } = {
      'academicos': 'person',
      'estudios': 'menubook',
      'disciplinas': 'science',
      'areas-dedica': 'work_outline',
      'entidades': 'business',
      'cuerpos-academicos': 'groups',
      'miembros-ca': 'people',
      'roles-miembros': 'admin_panel_settings',
      'grados-ca': 'military_tech',
      'lgac': 'psychology',
      'apoyos-eco': 'account_balance_wallet',
      'apoyos-eco-ca': 'group_add',
      'cat-estado-apoyo': 'assignment_turned_in',
      'cat-tipo-apoyo': 'category',
      'contrataciones': 'work',
      'plazas': 'location_city',
      'vigencias-perfil': 'schedule',
      'vigencias-cuerpo': 'access_time',
      'niveles-snii': 'star_border',
      'cat-nivel-snii': 'format_list_numbered',
      'citas': 'event',
      'descargas': 'download',
      'cat-generos': 'wc',
      'cat-nacionalidades': 'flag',
      'cat-motivos': 'help_outline',
      'cat-roles': 'security',
      'cat-nivel-estudios': 'school',
      'cat-areas': 'domain',
      'cat-regiones': 'map',
      'cat-entidades': 'business',
      'cat-periodos': 'date_range',
      'cat-disciplinas': 'science',
      'cat-tipo-contrataciones': 'work',
      'cat-temp-contrataciones': 'schedule',
      'cat-grado-ca': 'military_tech'
    };
    
    return iconMap[this.selectedModule] || 'dashboard';
  }

  // Event handlers del iframe
  onIframeLoad() {
    this.loadingProgress = 100;
    setTimeout(() => {
      this.isLoading = false;
      this.hasError = false;
      this.errorDetails = '';
      if (this.loadingInterval) {
        clearInterval(this.loadingInterval);
      }
    }, 500);
    
    console.log('Módulo cargado exitosamente:', this.selectedModule);
  }

  onIframeError(event?: any) {
    this.isLoading = false;
    this.hasError = true;
    this.errorDetails = event ? `Error de carga: ${event.message || 'Error desconocido'}` : 'No se pudo establecer conexión con el módulo';
    
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
    }
    
    console.error('Error al cargar el módulo:', this.selectedModule, event);
  }

  // Métodos de acción
  refreshIframe() {
    this.loadModule();
    // Recargar el iframe solo en el navegador
    if (this.isBrowser) {
      const iframe = document.querySelector('.module-iframe') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = iframe.src;
      }
    }
  }

  openInNewTab() {
    if (this.isBrowser) {
      const url = this.getIframeSrc();
      if (url) {
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
      }
    }
  }

  toggleFullscreen() {
    if (!this.isBrowser) return;
    
    this.isFullscreen = !this.isFullscreen;
    
    if (this.isFullscreen) {
      // Ocultar elementos del UI si es necesario
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar elementos del UI
      document.body.style.overflow = 'auto';
    }
  }

  retryLoad() {
    this.hasError = false;
    this.errorDetails = '';
    this.refreshIframe();
  }

  reportError() {
    // Aquí puedes implementar el sistema de reporte de errores
    const errorReport = {
      module: this.selectedModule,
      timestamp: new Date().toISOString(),
      userAgent: this.isBrowser ? navigator.userAgent : 'Server',
      url: this.getIframeSrc().toString(),
      error: this.errorDetails,
      isOnline: this.isOnline
    };
    
    console.log('Reporte de error:', errorReport);
    
    // Ejemplo: enviar a un servicio de logging
    // this.errorReportingService.reportError(errorReport);
    
    if (this.isBrowser) {
      alert('Error reportado. Nuestro equipo técnico ha sido notificado.');
    }
  }

  // Métodos para la pantalla de bienvenida
  openHelp() {
    if (this.isBrowser) {
      // Abrir manual de usuario
      window.open('/assets/docs/manual-usuario.pdf', '_blank', 'noopener,noreferrer');
    }
  }

  openSupport() {
    if (this.isBrowser) {
      // Abrir página de soporte o contacto
      window.open('mailto:wsanmartin@uv.mx?subject=Soporte SESA - Consulta', '_blank');
    }
  }

  openDocumentation() {
    if (this.isBrowser) {
      // Abrir documentación técnica
      window.open('/assets/docs/documentacion-tecnica.pdf', '_blank', 'noopener,noreferrer');
    }
  }

  getBuildInfo(): string {
    // Información de build (puede venir de environment o package.json)
    const buildDate = new Date('2025-08-21'); // Cambiar por fecha real
    return buildDate.toLocaleDateString('es-MX', { 
      year: '2-digit', 
      month: '2-digit', 
      day: '2-digit' 
    });
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  // Método para debugging
  private logModuleInfo() {
    console.log('Información del módulo:', {
      selectedModule: this.selectedModule,
      title: this.getModuleTitle(),
      description: this.getModuleDescription(),
      icon: this.getModuleIcon(),
      isLoading: this.isLoading,
      hasError: this.hasError,
      isOnline: this.isOnline
    });
  }
}