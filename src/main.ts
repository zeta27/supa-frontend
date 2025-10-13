import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { IconService } from './app/core/services/icon.service';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    MatIconRegistry,
    {
      provide: IconService,
      deps: [MatIconRegistry, DomSanitizer],
      useFactory: (matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) => {
        const service = new IconService(matIconRegistry, domSanitizer);
        service.registerIcons();
        return service;
      }
    }
  ]
}).catch((err) => console.error(err));
