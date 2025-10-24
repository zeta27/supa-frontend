// cat-nacionalidades.component.ts
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

interface SUPACatNacionalidades {
  idCatNacionalidad: number;
  dNacionalidad: string;
}

@Component({
  selector: 'app-cat-nacionalidades',
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
  templateUrl: './cat-nacionalidades.component.html',
  styleUrls: ['./cat-nacionalidades.component.scss']
})
export class CatNacionalidadesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private backendUrl = 'http://148.226.168.138/supa/api/SUPACatNacionalidades';

  // Data properties
  nacionalidades: SUPACatNacionalidades[] = [];
  nacionalidadesFiltered: SUPACatNacionalidades[] = [];
  nuevaNacionalidad: Partial<SUPACatNacionalidades> = {};
  editando: SUPACatNacionalidades | null = null;
  nacionalidadEditando: Partial<SUPACatNacionalidades> = {};

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
    this.cargarNacionalidades();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  crearNacionalidad(): void {
    if (!this.nuevaNacionalidad.dNacionalidad?.trim()) {
      this.mostrarMensaje('El nombre de la nacionalidad es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const nacionalidadData = {
      dNacionalidad: this.nuevaNacionalidad.dNacionalidad.trim()
    };

    this.creating = true;

    this.http.post<SUPACatNacionalidades>(this.backendUrl, nacionalidadData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.creating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear nacionalidad:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Nacionalidad creada exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarNacionalidades();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al crear la nacionalidad';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe una nacionalidad con este nombre';
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
            
            this.mostrarMensaje('Nacionalidad creada exitosamente', 'snackBar-dialog');
            this.nuevaNacionalidad = {};
            this.cargarNacionalidades();
          }
        }
      });
  }

  prepararEdicion(nacionalidad: SUPACatNacionalidades): void {
    if (this.editando) {
      this.cancelarEdicion();
    }
    
    this.editando = { ...nacionalidad };
    this.nacionalidadEditando = { 
      dNacionalidad: nacionalidad.dNacionalidad
    };
    
    setTimeout(() => {
      const input = document.querySelector('.inline-edit-field input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  actualizarNacionalidad(): void {
    if (!this.editando || !this.nacionalidadEditando.dNacionalidad?.trim()) {
      this.mostrarMensaje('El nombre de la nacionalidad es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const nacionalidadData = {
      dNacionalidad: this.nacionalidadEditando.dNacionalidad.trim()
    };

    this.updating = true;

    this.http.put<any>(`${this.backendUrl}/${this.editando.idCatNacionalidad}`, nacionalidadData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar nacionalidad:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Nacionalidad actualizada exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarNacionalidades();
              this.cancelarEdicion();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al actualizar la nacionalidad';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe una nacionalidad con este nombre';
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
            
            this.mostrarMensaje('Nacionalidad actualizada exitosamente', 'snackBar-dialog');
            this.cancelarEdicion();
            this.cargarNacionalidades();
          }
        }
      });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.nacionalidadEditando = {};
  }

  cargarNacionalidades(): void {
    this.loading = true;
    
    this.http.get<SUPACatNacionalidades[]>(this.backendUrl)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar nacionalidades:', error);
          let mensaje = 'Error al cargar las nacionalidades';
          
          if (error.status === 0) {
            mensaje = 'Error de conexión con el servidor';
          }
          
          this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.nacionalidades = data;
          this.filtrarNacionalidades();
        }
      });
  }

  eliminarNacionalidad(id: number): void {
    const nacionalidad = this.nacionalidades.find(n => n.idCatNacionalidad === id);
    if (!nacionalidad) return;

    const confirmacion = confirm(`¿Está seguro de que desea eliminar la nacionalidad "${nacionalidad.dNacionalidad}"?\n\nEsta acción no se puede deshacer.`);
    if (!confirmacion) return;

    this.deleting = true;

    this.http.delete<any>(`${this.backendUrl}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.deleting = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar nacionalidad:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Nacionalidad eliminada exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarNacionalidades();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al eliminar la nacionalidad';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'No se puede eliminar la nacionalidad porque está siendo utilizada por otros registros';
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
            
            this.mostrarMensaje(`Nacionalidad "${nacionalidad.dNacionalidad}" eliminada exitosamente`, 'snackBar-dialog');
            
            if (this.editando?.idCatNacionalidad === id) {
              this.cancelarEdicion();
            }
            
            this.cargarNacionalidades();
          }
        }
      });
  }

  filtrarNacionalidades(): void {
    if (!this.searchTerm.trim()) {
      this.nacionalidadesFiltered = [...this.nacionalidades];
    } else {
      const termino = this.searchTerm.toLowerCase().trim();
      this.nacionalidadesFiltered = this.nacionalidades.filter(nacionalidad =>
        nacionalidad.dNacionalidad.toLowerCase().includes(termino) ||
        nacionalidad.idCatNacionalidad.toString().includes(termino)
      );
    }
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtrarNacionalidades();
  }

  private mostrarMensaje(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  trackByNacionalidadId(index: number, nacionalidad: SUPACatNacionalidades): number {
    return nacionalidad.idCatNacionalidad;
  }

  get formularioValido(): boolean {
    return !!(this.nuevaNacionalidad.dNacionalidad?.trim() && 
              this.nuevaNacionalidad.dNacionalidad.trim().length >= 1 && 
              this.nuevaNacionalidad.dNacionalidad.trim().length <= 20);
  }

  get puedeEditar(): boolean {
    return !this.editando && !this.loading && !this.creating && !this.updating && !this.deleting;
  }

  get estaCargandoAlgo(): boolean {
    return this.loading || this.creating || this.updating || this.deleting;
  }
}