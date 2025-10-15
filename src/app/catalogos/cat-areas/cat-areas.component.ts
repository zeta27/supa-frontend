// cat-areas.component.ts - COPIA EXACTA DE SISPLAN
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

interface SUPACatAreas {
  idCatAreas: number;
  darea: string;
}

@Component({
  selector: 'app-cat-areas',
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
  templateUrl: './cat-areas.component.html',
  styleUrls: ['./cat-areas.component.scss']
})
export class CatAreasComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private backendUrl = 'http://148.226.168.138/supa/api/SUPACatAreas';

  // Data properties
  areas: SUPACatAreas[] = [];
  areasFiltered: SUPACatAreas[] = [];
  nuevaArea: Partial<SUPACatAreas> = {};
  editando: SUPACatAreas | null = null;
  areaEditando: Partial<SUPACatAreas> = {};

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
    this.cargarAreas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  crearArea(): void {
    if (!this.nuevaArea.darea?.trim()) {
      this.mostrarMensaje('El nombre del área es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const nombreArea = this.nuevaArea.darea.trim();

    const nombreExiste = this.areas.some(area => 
      area.darea.toLowerCase() === nombreArea.toLowerCase()
    );

    if (nombreExiste) {
      this.mostrarMensaje('Ya existe un área con este nombre', 'snackBar-dialog-Warning');
      return;
    }

    const areaData = { darea: nombreArea };

    this.creating = true;

    this.http.post<any>(this.backendUrl, areaData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.creating = false;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear área:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Área creada exitosamente', 'snackBar-dialog');
            this.nuevaArea = {};
            
            timer(1000).subscribe(() => {
              this.cargarAreas();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al crear el área';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un área con este nombre';
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
            
            this.mostrarMensaje('Área creada exitosamente', 'snackBar-dialog');
            this.nuevaArea = {};
            this.cargarAreas();
          }
        }
      });
  }

  prepararEdicion(area: SUPACatAreas): void {
    if (this.editando) {
      this.cancelarEdicion();
    }
    
    this.editando = { ...area };
    this.areaEditando = { darea: area.darea };
    
    setTimeout(() => {
      const input = document.querySelector('.inline-edit-field input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  actualizarArea(): void {
    if (!this.editando || !this.areaEditando.darea?.trim()) {
      this.mostrarMensaje('El nombre del área es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const nuevoNombre = this.areaEditando.darea.trim();

    const nombreExiste = this.areas.some(area => 
      area.darea.toLowerCase() === nuevoNombre.toLowerCase() &&
      area.idCatAreas !== this.editando!.idCatAreas
    );

    if (nombreExiste) {
      this.mostrarMensaje('Ya existe un área con este nombre', 'snackBar-dialog-Warning');
      return;
    }

    const areaData = {
      idCatAreas: this.editando.idCatAreas,
      darea: nuevoNombre
    };

    this.updating = true;

    this.http.put<any>(`${this.backendUrl}/${this.editando.idCatAreas}`, areaData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar área:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Área actualizada exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarAreas();
              this.cancelarEdicion();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al actualizar el área';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un área con este nombre';
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
            
            this.mostrarMensaje('Área actualizada exitosamente', 'snackBar-dialog');
            this.cancelarEdicion();
            this.cargarAreas();
          }
        }
      });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.areaEditando = {};
  }

  cargarAreas(): void {
    this.loading = true;
    
    this.http.get<SUPACatAreas[]>(this.backendUrl)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar áreas:', error);
          let mensaje = 'Error al cargar las áreas';
          
          if (error.status === 0) {
            mensaje = 'Error de conexión con el servidor';
          }
          
          this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.areas = data;
          this.filtrarAreas();
        }
      });
  }

  eliminarArea(id: number): void {
    const area = this.areas.find(a => a.idCatAreas === id);
    if (!area) return;

    const confirmacion = confirm(`¿Está seguro de que desea eliminar el área "${area.darea}"?\n\nEsta acción no se puede deshacer.`);
    if (!confirmacion) return;

    this.deleting = true;

    this.http.delete<any>(`${this.backendUrl}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.deleting = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar área:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Área eliminada exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarAreas();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al eliminar el área';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'No se puede eliminar el área porque está siendo utilizada por otros registros';
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
            
            this.mostrarMensaje(`Área "${area.darea}" eliminada exitosamente`, 'snackBar-dialog');
            
            if (this.editando?.idCatAreas === id) {
              this.cancelarEdicion();
            }
            
            this.cargarAreas();
          }
        }
      });
  }

  filtrarAreas(): void {
    if (!this.searchTerm.trim()) {
      this.areasFiltered = [...this.areas];
    } else {
      const termino = this.searchTerm.toLowerCase().trim();
      this.areasFiltered = this.areas.filter(area =>
        area.darea.toLowerCase().includes(termino) ||
        area.idCatAreas.toString().includes(termino)
      );
    }
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtrarAreas();
  }

  private mostrarMensaje(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  trackByAreaId(index: number, area: SUPACatAreas): number {
    return area.idCatAreas;
  }

  get formularioValido(): boolean {
    return !!(this.nuevaArea.darea?.trim() && 
              this.nuevaArea.darea.trim().length >= 1 && 
              this.nuevaArea.darea.trim().length <= 100);
  }

  get puedeEditar(): boolean {
    return !this.editando && !this.loading && !this.creating && !this.updating && !this.deleting;
  }

  get estaCargandoAlgo(): boolean {
    return this.loading || this.creating || this.updating || this.deleting;
  }
}