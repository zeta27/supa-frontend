import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {}

  registerIcons() {
    // Registrar tus iconos SVG personalizados
    this.matIconRegistry.addSvgIcon(
      'ic_editar',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/ic_editar.svg')
    );
    
    this.matIconRegistry.addSvgIcon(
      'ic_eliminar',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/ic_eliminar.svg')
    );
    
    this.matIconRegistry.addSvgIcon(
      'ic_view',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/ic_view.svg')
    );
    
    this.matIconRegistry.addSvgIcon(
      'ic_search',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/ic-search.svg')
    );
  }
}