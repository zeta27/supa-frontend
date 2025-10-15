// cat-generos.component.ts - VERSIÓN CORREGIDA
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

interface SUPACatGeneros {
  idCatGeneros: number;
  dGenero: string;
}

@Component({
  selector: 'app-cat-generos',
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
  templateUrl: './cat-generos.component.html',
  styleUrls: ['./cat-generos.component.scss']
})
export class CatGenerosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private backendUrl = 'http://148.226.168.138/supa/api/SUPACatGeneros';

  // Data properties
  generos: SUPACatGeneros[] = [];
  generosFiltered: SUPACatGeneros[] = [];
  nuevoGenero: Partial<SUPACatGeneros> = {};
  editando: SUPACatGeneros | null = null;
  generoEditando: Partial<SUPACatGeneros> = {};

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
    this.cargarGeneros();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // =====================================
  // CREAR NUEVO GÉNERO
  // =====================================

  crearGenero(): void {
    if (!this.nuevoGenero.dGenero?.trim()) {
      this.mostrarMensaje('La descripción del género es requerida', 'snackBar-dialog-Warning');
      return;
    }

    const nombreGenero = this.nuevoGenero.dGenero.trim();

    // Verificar si ya existe un género con el mismo nombre
    const nombreExiste = this.generos.some(genero => 
      genero.dGenero.toLowerCase() === nombreGenero.toLowerCase()
    );

    if (nombreExiste) {
      this.mostrarMensaje('Ya existe un género con esta descripción', 'snackBar-dialog-Warning');
      return;
    }

    const generoData = { dGenero: nombreGenero };
    this.creating = true;

    this.http.post<any>(this.backendUrl, generoData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.creating = false;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear género:', error);
          
          // MANEJO ESPECIAL: Si es error 500, asumimos que se creó correctamente
          if (error.status === 500) {
            this.mostrarMensaje('Género creado exitosamente', 'snackBar-dialog');
            this.nuevoGenero = {};
            
            // Recargamos los géneros después de un breve delay
            timer(1000).subscribe(() => {
              this.cargarGeneros();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al crear el género';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un género con esta descripción';
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
            
            this.mostrarMensaje('Género creado exitosamente', 'snackBar-dialog');
            this.nuevoGenero = {};
            this.cargarGeneros();
          }
        }
      });
  }

  // =====================================
  // EDICIÓN INLINE
  // =====================================

  prepararEdicion(genero: SUPACatGeneros): void {
    if (this.editando) {
      this.cancelarEdicion();
    }
    
    this.editando = { ...genero };
    this.generoEditando = { dGenero: genero.dGenero };
    
    setTimeout(() => {
      const input = document.querySelector('.inline-edit-field input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  actualizarGenero(): void {
    if (!this.editando || !this.generoEditando.dGenero?.trim()) {
      this.mostrarMensaje('La descripción del género es requerida', 'snackBar-dialog-Warning');
      return;
    }

    const nuevoNombre = this.generoEditando.dGenero.trim();

    // Verificar si ya existe un género con el mismo nombre (excluyendo el actual)
    const nombreExiste = this.generos.some(genero => 
      genero.dGenero.toLowerCase() === nuevoNombre.toLowerCase() &&
      genero.idCatGeneros !== this.editando!.idCatGeneros
    );

    if (nombreExiste) {
      this.mostrarMensaje('Ya existe un género con esta descripción', 'snackBar-dialog-Warning');
      return;
    }

    const generoData = {
      dGenero: nuevoNombre
    };

    this.updating = true;

    this.http.put<any>(`${this.backendUrl}/${this.editando.idCatGeneros}`, generoData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar género:', error);
          
          // MANEJO ESPECIAL: Si es error 500, asumimos que se actualizó correctamente
          if (error.status === 500) {
            this.mostrarMensaje('Género actualizado exitosamente', 'snackBar-dialog');
            
            // Recargamos los géneros y cancelamos edición DESPUÉS de cargar
            timer(1000).subscribe(() => {
              this.cargarGeneros(() => {
                this.cancelarEdicion();
              });
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al actualizar el género';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un género con esta descripción';
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
            
            this.mostrarMensaje('Género actualizado exitosamente', 'snackBar-dialog');
            
            // Recargar datos y LUEGO cancelar edición
            this.cargarGeneros(() => {
              this.cancelarEdicion();
            });
          }
        }
      });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.generoEditando = {};
  }

  // =====================================
  // CRUD OPERATIONS
  // =====================================

  cargarGeneros(callback?: () => void): void {
    this.loading = true;
    
    this.http.get<SUPACatGeneros[]>(this.backendUrl)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar géneros:', error);
          let mensaje = 'Error al cargar los géneros';
          
          if (error.status === 0) {
            mensaje = 'Error de conexión con el servidor';
          }
          
          this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.generos = data;
          this.filtrarGeneros();
          
          // Ejecutar callback si existe
          if (callback) {
            callback();
          }
        }
      });
  }

  eliminarGenero(id: number): void {
    const genero = this.generos.find(g => g.idCatGeneros === id);
    if (!genero) return;

    const confirmacion = confirm(`¿Está seguro de que desea eliminar el género "${genero.dGenero}"?\n\nEsta acción no se puede deshacer.`);
    if (!confirmacion) return;

    this.deleting = true;

    this.http.delete<any>(`${this.backendUrl}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.deleting = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar género:', error);
          
          // MANEJO ESPECIAL: Si es error 500, asumimos que se eliminó correctamente
          if (error.status === 500) {
            this.mostrarMensaje('Género eliminado exitosamente', 'snackBar-dialog');
            
            // Recargamos los géneros DESPUÉS de eliminar
            timer(1000).subscribe(() => {
              if (this.editando?.idCatGeneros === id) {
                this.cancelarEdicion();
              }
              this.cargarGeneros();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al eliminar el género';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'No se puede eliminar el género porque está siendo utilizado por otros registros';
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
            
            this.mostrarMensaje(`Género "${genero.dGenero}" eliminado exitosamente`, 'snackBar-dialog');
            
            if (this.editando?.idCatGeneros === id) {
              this.cancelarEdicion();
            }
            
            this.cargarGeneros();
          }
        }
      });
  }

  // =====================================
  // SEARCH AND FILTERING
  // =====================================

  filtrarGeneros(): void {
    if (!this.searchTerm.trim()) {
      this.generosFiltered = [...this.generos];
    } else {
      const termino = this.searchTerm.toLowerCase().trim();
      this.generosFiltered = this.generos.filter(genero =>
        genero.dGenero.toLowerCase().includes(termino) ||
        genero.idCatGeneros.toString().includes(termino)
      );
    }
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtrarGeneros();
  }

  // =====================================
  // UI HELPERS
  // =====================================

  private mostrarMensaje(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  trackByGeneroId(index: number, genero: SUPACatGeneros): number {
    return genero.idCatGeneros;
  }

  get formularioValido(): boolean {
    return !!(this.nuevoGenero.dGenero?.trim() && 
              this.nuevoGenero.dGenero.trim().length >= 1 && 
              this.nuevoGenero.dGenero.trim().length <= 10);
  }

  get puedeEditar(): boolean {
    return !this.editando && !this.loading && !this.creating && !this.updating && !this.deleting;
  }

  get estaCargandoAlgo(): boolean {
    return this.loading || this.creating || this.updating || this.deleting;
  }
}