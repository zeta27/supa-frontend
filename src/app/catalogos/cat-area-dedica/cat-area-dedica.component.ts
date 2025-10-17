// cat-area-dedica.component.ts - COPIA EXACTA DE CAT-AREAS
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

interface SUPACatAreaDedica {
  idCatAreaDedica: number;
  dAreaDedica: string;
}

@Component({
  selector: 'app-cat-area-dedica',
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
  templateUrl: './cat-area-dedica.component.html',
  styleUrls: ['./cat-area-dedica.component.scss']
})
export class CatAreaDedicaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private backendUrl = 'http://148.226.168.138/supa/Api/SUPACatAreaDedica';

  // Data properties
  areasDedica: SUPACatAreaDedica[] = [];
  areasDedicaFiltered: SUPACatAreaDedica[] = [];
  nuevaAreaDedica: Partial<SUPACatAreaDedica> = {};
  editando: SUPACatAreaDedica | null = null;
  areaDedicaEditando: Partial<SUPACatAreaDedica> = {};

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
    this.cargarAreasDedica();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  crearAreaDedica(): void {
    if (!this.nuevaAreaDedica.dAreaDedica?.trim()) {
      this.mostrarMensaje('El nombre del área de dedicación es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const nombreAreaDedica = this.nuevaAreaDedica.dAreaDedica.trim();

    const nombreExiste = this.areasDedica.some(area => 
      area.dAreaDedica.toLowerCase() === nombreAreaDedica.toLowerCase()
    );

    if (nombreExiste) {
      this.mostrarMensaje('Ya existe un área de dedicación con este nombre', 'snackBar-dialog-Warning');
      return;
    }

    const areaDedicaData = { DAreaDedica: nombreAreaDedica };  // ✅ D mayúscula para el backend

    this.creating = true;

    this.http.post<any>(this.backendUrl, areaDedicaData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.creating = false;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear área de dedicación:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Área de dedicación creada exitosamente', 'snackBar-dialog');
            this.nuevaAreaDedica = {};
            
            timer(1000).subscribe(() => {
              this.cargarAreasDedica();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al crear el área de dedicación';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un área de dedicación con este nombre';
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
            
            this.mostrarMensaje('Área de dedicación creada exitosamente', 'snackBar-dialog');
            this.nuevaAreaDedica = {};
            this.cargarAreasDedica();
          }
        }
      });
  }

  prepararEdicion(areaDedica: SUPACatAreaDedica): void {
    if (this.editando) {
      this.cancelarEdicion();
    }
    
    this.editando = { ...areaDedica };
    this.areaDedicaEditando = { dAreaDedica: areaDedica.dAreaDedica };
    
    setTimeout(() => {
      const input = document.querySelector('.inline-edit-field input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  actualizarAreaDedica(): void {
    if (!this.editando || !this.areaDedicaEditando.dAreaDedica?.trim()) {
      this.mostrarMensaje('El nombre del área de dedicación es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const nuevoNombre = this.areaDedicaEditando.dAreaDedica.trim();

    const nombreExiste = this.areasDedica.some(area => 
      area.dAreaDedica.toLowerCase() === nuevoNombre.toLowerCase() &&
      area.idCatAreaDedica !== this.editando!.idCatAreaDedica
    );

    if (nombreExiste) {
      this.mostrarMensaje('Ya existe un área de dedicación con este nombre', 'snackBar-dialog-Warning');
      return;
    }

    const areaDedicaData = {
      DAreaDedica: nuevoNombre  // ✅ D mayúscula para el backend
    };

    this.updating = true;

    this.http.put<any>(`${this.backendUrl}/${this.editando.idCatAreaDedica}`, areaDedicaData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar área de dedicación:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Área de dedicación actualizada exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarAreasDedica();
              this.cancelarEdicion();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al actualizar el área de dedicación';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un área de dedicación con este nombre';
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
            
            this.mostrarMensaje('Área de dedicación actualizada exitosamente', 'snackBar-dialog');
            this.cancelarEdicion();
            this.cargarAreasDedica();
          }
        }
      });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.areaDedicaEditando = {};
  }

  cargarAreasDedica(): void {
    this.loading = true;
    
    this.http.get<SUPACatAreaDedica[]>(this.backendUrl)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar áreas de dedicación:', error);
          let mensaje = 'Error al cargar las áreas de dedicación';
          
          if (error.status === 0) {
            mensaje = 'Error de conexión con el servidor';
          }
          
          this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.areasDedica = data;
          this.filtrarAreasDedica();
        }
      });
  }

  eliminarAreaDedica(id: number): void {
    const areaDedica = this.areasDedica.find(a => a.idCatAreaDedica === id);
    if (!areaDedica) return;

    const confirmacion = confirm(`¿Está seguro de que desea eliminar el área de dedicación "${areaDedica.dAreaDedica}"?\n\nEsta acción no se puede deshacer.`);
    if (!confirmacion) return;

    this.deleting = true;

    this.http.delete<any>(`${this.backendUrl}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.deleting = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar área de dedicación:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Área de dedicación eliminada exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarAreasDedica();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al eliminar el área de dedicación';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'No se puede eliminar el área de dedicación porque está siendo utilizada por otros registros';
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
            
            this.mostrarMensaje(`Área de dedicación "${areaDedica.dAreaDedica}" eliminada exitosamente`, 'snackBar-dialog');
            
            if (this.editando?.idCatAreaDedica === id) {
              this.cancelarEdicion();
            }
            
            this.cargarAreasDedica();
          }
        }
      });
  }

  filtrarAreasDedica(): void {
    if (!this.searchTerm.trim()) {
      this.areasDedicaFiltered = [...this.areasDedica];
    } else {
      const termino = this.searchTerm.toLowerCase().trim();
      this.areasDedicaFiltered = this.areasDedica.filter(area =>
        area.dAreaDedica.toLowerCase().includes(termino) ||
        area.idCatAreaDedica.toString().includes(termino)
      );
    }
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtrarAreasDedica();
  }

  private mostrarMensaje(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  trackByAreaDedicaId(index: number, areaDedica: SUPACatAreaDedica): number {
    return areaDedica.idCatAreaDedica;
  }

  get formularioValido(): boolean {
    return !!(this.nuevaAreaDedica.dAreaDedica?.trim() && 
              this.nuevaAreaDedica.dAreaDedica.trim().length >= 1 && 
              this.nuevaAreaDedica.dAreaDedica.trim().length <= 100);
  }

  get puedeEditar(): boolean {
    return !this.editando && !this.loading && !this.creating && !this.updating && !this.deleting;
  }

  get estaCargandoAlgo(): boolean {
    return this.loading || this.creating || this.updating || this.deleting;
  }
}