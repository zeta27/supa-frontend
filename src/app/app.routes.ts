import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { CatAreasComponent } from './catalogos/cat-areas/cat-areas.component';
import { CatGenerosComponent } from './catalogos/cat-generos/cat-generos.component';
import { CatAreaDedicaComponent } from './catalogos/cat-area-dedica/cat-area-dedica.component';
import { CatDisciplinasComponent } from './catalogos/cat-disciplinas/cat-disciplinas.component'; 
import { CatEstadoApoyoComponent } from './catalogos/cat-estadoapoyo/cat-estadoapoyo.component';
import { CatGradoCAComponent } from './catalogos/cat-gradoca/cat-gradoca.component';




export const routes: Routes = [
  // Ruta principal CON layout (para desarrollo)
  {
    path: '',
    component: MainLayoutComponent
  },

  // Rutas STANDALONE (sin layout) para usar en iframes
  { 
    path: 'catalogo/cat-areas', 
    component: CatAreasComponent 
  },
  { 
    path: 'catalogo/cat-generos', 
    component: CatGenerosComponent 
  },
  { 
    path: 'catalogo/cat-area-dedica', 
    component: CatAreaDedicaComponent 
  },
  { 
    path: 'catalogo/cat-disciplinas', 
    component: CatDisciplinasComponent 
  },
  { 
  path: 'catalogo/cat-estadoapoyo',  
  component: CatEstadoApoyoComponent 
},
{ 
  path: 'catalogo/cat-gradoca',  
  component: CatGradoCAComponent 
} 

  // Aquí agregarás las demás rutas standalone:
  // { path: 'catalogo/cat-nacionalidades', component: CatNacionalidadesComponent },
  // { path: 'catalogo/cat-motivos', component: CatMotivosComponent },
  // { path: 'modulo/academicos', component: AcademicosComponent },
  // etc.
];