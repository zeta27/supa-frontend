// cat-regiones.component.ts
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Subject, takeUntil, finalize, catchError, of, timer } from 'rxjs';

interface SUPACatRegion {
  idCatRegion: number;
  dregion: string;
}

@Component({
  selector: 'app-cat-regiones',
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
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './cat-regiones.component.html',
  styleUrls: ['./cat-regiones.component.scss']
})
export class CatRegionesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private backendUrl = 'http://148.226.168.138/supa/api/SUPACatRegion';

  // Data properties
  regiones: SUPACatRegion[] = [];
  regionesFiltered: SUPACatRegion[] = [];
  nuevaRegion: Partial<SUPACatRegion> = {};
  editando: SUPACatRegion | null = null;
  regionEditando: Partial<SUPACatRegion> = {};

  // UI properties
  loading = false;
  creating = false;
  updating = false;
  deleting = false;
  searchTerm = '';
  
  displayedColumns: string[] = ['nombre', 'acciones'];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarRegiones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  crearRegion(): void {
    if (!this.nuevaRegion.dregion?.trim()) {
      this.mostrarMensaje('El nombre de la región es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const regionData = {
      dregion: this.nuevaRegion.dregion.trim()
    };

    this.creating = true;

    this.http.post<SUPACatRegion>(this.backendUrl, regionData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.creating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear región:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Región creada exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarRegiones();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al crear la región';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe una región con este nombre';
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
            if (response.hasOwnProperty('success')) {
              return;
            }
            
            this.mostrarMensaje('Región creada exitosamente', 'snackBar-dialog');
            this.nuevaRegion = {};
            this.cargarRegiones();
          }
        }
      });
  }

  prepararEdicion(region: SUPACatRegion): void {
    if (this.editando) {
      this.cancelarEdicion();
    }
    
    this.editando = { ...region };
    this.regionEditando = { 
      dregion: region.dregion
    };
    
    setTimeout(() => {
      const input = document.querySelector('.inline-edit-field input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  actualizarRegion(): void {
    if (!this.editando || !this.regionEditando.dregion?.trim()) {
      this.mostrarMensaje('El nombre de la región es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const regionData = {
      dregion: this.regionEditando.dregion.trim()
    };

    this.updating = true;

    this.http.put<any>(`${this.backendUrl}/${this.editando.idCatRegion}`, regionData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar región:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Región actualizada exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarRegiones();
              this.cancelarEdicion();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al actualizar la región';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe una región con este nombre';
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
            
            this.mostrarMensaje('Región actualizada exitosamente', 'snackBar-dialog');
            this.cancelarEdicion();
            this.cargarRegiones();
          }
        }
      });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.regionEditando = {};
  }

  cargarRegiones(): void {
    this.loading = true;
    
    this.http.get<SUPACatRegion[]>(this.backendUrl)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar regiones:', error);
          let mensaje = 'Error al cargar las regiones';
          
          if (error.status === 0) {
            mensaje = 'Error de conexión con el servidor';
          }
          
          this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.regiones = data;
          this.filtrarRegiones();
        }
      });
  }

  eliminarRegion(id: number): void {
    const region = this.regiones.find(r => r.idCatRegion === id);
    if (!region) return;

    const confirmacion = confirm(`¿Está seguro de que desea eliminar la región "${region.dregion}"?\n\nEsta acción no se puede deshacer.`);
    if (!confirmacion) return;

    this.deleting = true;

    this.http.delete<any>(`${this.backendUrl}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.deleting = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar región:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Región eliminada exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarRegiones();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al eliminar la región';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'No se puede eliminar la región porque está siendo utilizada por otros registros';
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
            
            this.mostrarMensaje(`Región "${region.dregion}" eliminada exitosamente`, 'snackBar-dialog');
            
            if (this.editando?.idCatRegion === id) {
              this.cancelarEdicion();
            }
            
            this.cargarRegiones();
          }
        }
      });
  }

  filtrarRegiones(): void {
    if (!this.searchTerm.trim()) {
      this.regionesFiltered = [...this.regiones];
    } else {
      const termino = this.searchTerm.toLowerCase().trim();
      this.regionesFiltered = this.regiones.filter(region =>
        region.dregion.toLowerCase().includes(termino) ||
        region.idCatRegion.toString().includes(termino)
      );
    }
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtrarRegiones();
  }

  private mostrarMensaje(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  trackByRegionId(index: number, region: SUPACatRegion): number {
    return region.idCatRegion;
  }

  get formularioValido(): boolean {
    return !!(this.nuevaRegion.dregion?.trim() && 
              this.nuevaRegion.dregion.trim().length >= 1 && 
              this.nuevaRegion.dregion.trim().length <= 50);
  }

  get puedeEditar(): boolean {
    return !this.editando && !this.loading && !this.creating && !this.updating && !this.deleting;
  }

  get estaCargandoAlgo(): boolean {
    return this.loading || this.creating || this.updating || this.deleting;
  }
}