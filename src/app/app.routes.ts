import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { CatAreasComponent } from './catalogos/cat-areas/cat-areas.component';
import { CatGenerosComponent } from './catalogos/cat-generos/cat-generos.component';
import { CatAreaDedicaComponent } from './catalogos/cat-area-dedica/cat-area-dedica.component';
import { CatDisciplinasComponent } from './catalogos/cat-disciplinas/cat-disciplinas.component'; 
import { CatEstadoApoyoComponent } from './catalogos/cat-estadoapoyo/cat-estadoapoyo.component';
import { CatGradoCAComponent } from './catalogos/cat-gradoca/cat-gradoca.component';
import { CatMotivosComponent } from './catalogos/cat-motivos/cat-motivos.component'; 
import { CatPeriodosComponent } from './catalogos/cat-periodos/cat-periodos.component';
import { CatNacionalidadesComponent } from './catalogos/cat-nacionalidades/cat-nacionalidades.component';
import { CatRolesComponent } from './catalogos/cat-roles/cat-roles.component';
import { CatRegionesComponent } from './catalogos/cat-regiones/cat-regiones.component';
import { CatEntidadesComponent } from './catalogos/cat-entidades/cat-entidades.component';

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
  },
  { 
    path: 'catalogo/cat-motivos', 
    component: CatMotivosComponent 
  },
{ 
  path: 'catalogo/cat-periodos',
  component: CatPeriodosComponent 
},
{ 
	path: 'catalogo/cat-nacionalidades', 
	component: CatNacionalidadesComponent 
},
{ 
	path: 'catalogo/cat-roles', 
	component: CatRolesComponent 
},
{
	path: 'catalogo/cat-regiones',
	component: CatRegionesComponent
},
{
	path: 'catalogo/cat-entidades',
	component: CatEntidadesComponent
}
  // { path: 'modulo/academicos', component: AcademicosComponent },

];
