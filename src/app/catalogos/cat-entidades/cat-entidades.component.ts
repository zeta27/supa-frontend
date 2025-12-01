// cat-entidades.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';

// Angular Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Subject, takeUntil, finalize, catchError, of, timer, forkJoin } from 'rxjs';

interface SUPACatEntidades {
  idCatEntidades: number;
  dentidad: string;
  idCatAreas: number;
  idCatRegion: number;
  identidadUV: string;
  idCatAreasNavigation?: {
    idCatAreas: number;
    darea: string;
  };
  idCatRegionNavigation?: {
    idCatRegion: number;
    dregion: string;
  };
}

interface SUPACatAreas {
  idCatAreas: number;
  darea: string;
}

interface SUPACatRegion {
  idCatRegion: number;
  dregion: string;
}

@Component({
  selector: 'app-cat-entidades',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './cat-entidades.component.html',
  styleUrls: ['./cat-entidades.component.scss']
})
export class CatEntidadesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private backendUrl = 'http://148.226.168.138/SUPA/api/SUPACatEntidades';
  private areasUrl = 'http://148.226.168.138/SUPA/api/SUPACatAreas';
  private regionesUrl = 'http://148.226.168.138/SUPA/api/SUPACatRegion';

  // Data properties
  entidades: SUPACatEntidades[] = [];
  entidadesFiltered: SUPACatEntidades[] = [];
  areas: SUPACatAreas[] = [];
  regiones: SUPACatRegion[] = [];
  
  nuevaEntidad: Partial<SUPACatEntidades> = {};
  editando: SUPACatEntidades | null = null;
  entidadEditando: Partial<SUPACatEntidades> = {};

  // UI properties
  loading = false;
  loadingCatalogos = false;
  creating = false;
  updating = false;
  deleting = false;
  searchTerm = '';
  
  displayedColumns: string[] = ['dentidad', 'identidadUV', 'area', 'region', 'acciones'];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarCatalogos(): void {
    this.loadingCatalogos = true;

    forkJoin({
      areas: this.http.get<SUPACatAreas[]>(this.areasUrl).pipe(
        catchError(error => {
          console.error('Error al cargar áreas:', error);
          return of([]);
        })
      ),
      regiones: this.http.get<SUPACatRegion[]>(this.regionesUrl).pipe(
        catchError(error => {
          console.error('Error al cargar regiones:', error);
          return of([]);
        })
      ),
      entidades: this.http.get<SUPACatEntidades[]>(this.backendUrl).pipe(
        catchError(error => {
          console.error('Error al cargar entidades:', error);
          return of([]);
        })
      )
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loadingCatalogos = false)
    )
    .subscribe({
      next: (data) => {
        this.areas = data.areas;
        this.regiones = data.regiones;
        this.entidades = data.entidades;
        this.filtrarEntidades();
      },
      error: (error) => {
        console.error('Error al cargar catálogos:', error);
        this.mostrarMensaje('Error al cargar los catálogos', 'snackBar-dialog-Error');
      }
    });
  }

  crearEntidad(): void {
    if (!this.validarFormulario()) {
      return;
    }

    const entidadData = {
      dentidad: this.nuevaEntidad.dentidad!.trim(),
      idCatAreas: this.nuevaEntidad.idCatAreas!,
      idCatRegion: this.nuevaEntidad.idCatRegion!,
      identidadUV: this.nuevaEntidad.identidadUV!.trim()
    };

    this.creating = true;

    this.http.post<any>(this.backendUrl, entidadData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.creating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear entidad:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Entidad creada exitosamente', 'snackBar-dialog');
            this.nuevaEntidad = {};
            
            timer(1000).subscribe(() => {
              this.cargarCatalogos();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al crear la entidad';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe una entidad con estos datos';
            } else if (error.status === 0) {
              mensaje = 'Error de conexión con el servidor';
            }
            
            this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
            return of(null);
          }
        })
      )
      .subscribe({
        next: (response) => {
          if (response && !response.success) {
            this.mostrarMensaje('Entidad creada exitosamente', 'snackBar-dialog');
            this.nuevaEntidad = {};
            this.cargarCatalogos();
          }
        }
      });
  }

  prepararEdicion(entidad: SUPACatEntidades): void {
    if (this.editando) {
      this.cancelarEdicion();
    }
    
    this.editando = { ...entidad };
    this.entidadEditando = {
      dentidad: entidad.dentidad,
      identidadUV: entidad.identidadUV,
      idCatAreas: entidad.idCatAreas,
      idCatRegion: entidad.idCatRegion
    };
  }

  actualizarEntidad(): void {
    if (!this.editando || !this.validarFormularioEdicion()) {
      return;
    }

    const entidadData = {
      idCatEntidades: this.editando.idCatEntidades,
      dentidad: this.entidadEditando.dentidad!.trim(),
      idCatAreas: this.entidadEditando.idCatAreas!,
      idCatRegion: this.entidadEditando.idCatRegion!,
      identidadUV: this.entidadEditando.identidadUV!.trim()
    };

    this.updating = true;

    this.http.put<any>(`${this.backendUrl}/${this.editando.idCatEntidades}`, entidadData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar entidad:', error);
          
          if (error.status === 500 || error.status === 204) {
            this.mostrarMensaje('Entidad actualizada exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarCatalogos();
              this.cancelarEdicion();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al actualizar la entidad';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe una entidad con estos datos';
            } else if (error.status === 0) {
              mensaje = 'Error de conexión con el servidor';
            }
            
            this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
            return of(null);
          }
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            if (response.success !== undefined) {
              return;
            }
            
            this.mostrarMensaje('Entidad actualizada exitosamente', 'snackBar-dialog');
            this.cancelarEdicion();
            this.cargarCatalogos();
          }
        }
      });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.entidadEditando = {};
  }

  eliminarEntidad(id: number): void {
    const entidad = this.entidades.find(e => e.idCatEntidades === id);
    if (!entidad) return;

    const confirmacion = confirm(
      `¿Está seguro de que desea eliminar la entidad "${entidad.dentidad}"?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmacion) return;

    this.deleting = true;

    this.http.delete<any>(`${this.backendUrl}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.deleting = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar entidad:', error);
          
          if (error.status === 500 || error.status === 204) {
            this.mostrarMensaje('Entidad eliminada exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarCatalogos();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al eliminar la entidad';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'No se puede eliminar la entidad porque está siendo utilizada';
            } else if (error.status === 0) {
              mensaje = 'Error de conexión con el servidor';
            }
            
            this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
            return of(null);
          }
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            if (response.success !== undefined) {
              return;
            }
            
            this.mostrarMensaje(`Entidad "${entidad.dentidad}" eliminada exitosamente`, 'snackBar-dialog');
            
            if (this.editando?.idCatEntidades === id) {
              this.cancelarEdicion();
            }
            
            this.cargarCatalogos();
          }
        }
      });
  }

  filtrarEntidades(): void {
    if (!this.searchTerm.trim()) {
      this.entidadesFiltered = [...this.entidades];
    } else {
      const termino = this.searchTerm.toLowerCase().trim();
      this.entidadesFiltered = this.entidades.filter(entidad => {
        const area = entidad.idCatAreasNavigation?.darea || '';
        const region = entidad.idCatRegionNavigation?.dregion || '';
        
        return entidad.dentidad.toLowerCase().includes(termino) ||
               entidad.identidadUV.toLowerCase().includes(termino) ||
               area.toLowerCase().includes(termino) ||
               region.toLowerCase().includes(termino) ||
               entidad.idCatEntidades.toString().includes(termino);
      });
    }
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtrarEntidades();
  }

  private validarFormulario(): boolean {
    if (!this.nuevaEntidad.dentidad?.trim()) {
      this.mostrarMensaje('El nombre de la entidad es requerido', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.nuevaEntidad.identidadUV?.trim()) {
      this.mostrarMensaje('El identificador UV es requerido', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.nuevaEntidad.idCatAreas) {
      this.mostrarMensaje('Debe seleccionar un área', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.nuevaEntidad.idCatRegion) {
      this.mostrarMensaje('Debe seleccionar una región', 'snackBar-dialog-Warning');
      return false;
    }

    return true;
  }

  private validarFormularioEdicion(): boolean {
    if (!this.entidadEditando.dentidad?.trim()) {
      this.mostrarMensaje('El nombre de la entidad es requerido', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.entidadEditando.identidadUV?.trim()) {
      this.mostrarMensaje('El identificador UV es requerido', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.entidadEditando.idCatAreas) {
      this.mostrarMensaje('Debe seleccionar un área', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.entidadEditando.idCatRegion) {
      this.mostrarMensaje('Debe seleccionar una región', 'snackBar-dialog-Warning');
      return false;
    }

    return true;
  }

  private mostrarMensaje(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  getNombreArea(idArea: number): string {
    const area = this.areas.find(a => a.idCatAreas === idArea);
    return area ? area.darea : 'N/A';
  }

  getNombreRegion(idRegion: number): string {
    const region = this.regiones.find(r => r.idCatRegion === idRegion);
    return region ? region.dregion || 'N/A' : 'N/A';
  }

  trackByEntidadId(index: number, entidad: SUPACatEntidades): number {
    return entidad.idCatEntidades;
  }

  get formularioValido(): boolean {
    return !!(
      this.nuevaEntidad.dentidad?.trim() && 
      this.nuevaEntidad.identidadUV?.trim() &&
      this.nuevaEntidad.idCatAreas &&
      this.nuevaEntidad.idCatRegion
    );
  }

  get puedeEditar(): boolean {
    return !this.editando && !this.loadingCatalogos && !this.creating && !this.updating && !this.deleting;
  }

  get estaCargandoAlgo(): boolean {
    return this.loadingCatalogos || this.creating || this.updating || this.deleting;
  }
}