// cat-periodos.component.ts
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { Subject, takeUntil, finalize, catchError, of, timer } from 'rxjs';

interface SUPACatPeriodos {
  idCatPeriodos: number;
  descripcionPeriodo: string;
  fechaInicio: string | null;
  fechaTermino: string | null;
}

@Component({
  selector: 'app-cat-periodos',
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
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './cat-periodos.component.html',
  styleUrls: ['./cat-periodos.component.scss']
})
export class CatPeriodosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private backendUrl = 'http://148.226.168.138/supa/api/SUPACatPeriodos';

  // Data properties
  periodos: SUPACatPeriodos[] = [];
  periodosFiltered: SUPACatPeriodos[] = [];
  nuevoPeriodo: Partial<SUPACatPeriodos> = {};
  editando: SUPACatPeriodos | null = null;
  periodoEditando: Partial<SUPACatPeriodos> = {};

  // UI properties
  loading = false;
  creating = false;
  updating = false;
  deleting = false;
  searchTerm = '';
  
  displayedColumns: string[] = ['descripcion', 'fechaInicio', 'fechaTermino', 'acciones'];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarPeriodos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  crearPeriodo(): void {
    if (!this.nuevoPeriodo.descripcionPeriodo?.trim()) {
      this.mostrarMensaje('La descripción del periodo es requerida', 'snackBar-dialog-Warning');
      return;
    }

    const periodoData = {
      descripcionPeriodo: this.nuevoPeriodo.descripcionPeriodo.trim(),
      fechaInicio: this.nuevoPeriodo.fechaInicio || null,
      fechaTermino: this.nuevoPeriodo.fechaTermino || null
    };

    this.creating = true;

    this.http.post<SUPACatPeriodos>(this.backendUrl, periodoData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.creating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear periodo:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Periodo creado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarPeriodos();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al crear el periodo';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un periodo con esta descripción';
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
            
            this.mostrarMensaje('Periodo creado exitosamente', 'snackBar-dialog');
            this.nuevoPeriodo = {};
            this.cargarPeriodos();
          }
        }
      });
  }

  prepararEdicion(periodo: SUPACatPeriodos): void {
    if (this.editando) {
      this.cancelarEdicion();
    }
    
    this.editando = { ...periodo };
    this.periodoEditando = { 
      descripcionPeriodo: periodo.descripcionPeriodo,
      fechaInicio: periodo.fechaInicio,
      fechaTermino: periodo.fechaTermino
    };
  }

  actualizarPeriodo(): void {
    if (!this.editando || !this.periodoEditando.descripcionPeriodo?.trim()) {
      this.mostrarMensaje('La descripción del periodo es requerida', 'snackBar-dialog-Warning');
      return;
    }

    const periodoData = {
      descripcionPeriodo: this.periodoEditando.descripcionPeriodo.trim(),
      fechaInicio: this.periodoEditando.fechaInicio || null,
      fechaTermino: this.periodoEditando.fechaTermino || null
    };

    this.updating = true;

    this.http.put<any>(`${this.backendUrl}/${this.editando.idCatPeriodos}`, periodoData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar periodo:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Periodo actualizado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarPeriodos();
              this.cancelarEdicion();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al actualizar el periodo';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un periodo con esta descripción';
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
            
            this.mostrarMensaje('Periodo actualizado exitosamente', 'snackBar-dialog');
            this.cancelarEdicion();
            this.cargarPeriodos();
          }
        }
      });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.periodoEditando = {};
  }

  cargarPeriodos(): void {
    this.loading = true;
    
    this.http.get<SUPACatPeriodos[]>(this.backendUrl)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar periodos:', error);
          let mensaje = 'Error al cargar los periodos';
          
          if (error.status === 0) {
            mensaje = 'Error de conexión con el servidor';
          }
          
          this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.periodos = data;
          this.filtrarPeriodos();
        }
      });
  }

  eliminarPeriodo(id: number): void {
    const periodo = this.periodos.find(p => p.idCatPeriodos === id);
    if (!periodo) return;

    const confirmacion = confirm(`¿Está seguro de que desea eliminar el periodo "${periodo.descripcionPeriodo}"?\n\nEsta acción no se puede deshacer.`);
    if (!confirmacion) return;

    this.deleting = true;

    this.http.delete<any>(`${this.backendUrl}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.deleting = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar periodo:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Periodo eliminado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarPeriodos();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al eliminar el periodo';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'No se puede eliminar el periodo porque está siendo utilizado por otros registros';
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
            
            this.mostrarMensaje(`Periodo "${periodo.descripcionPeriodo}" eliminado exitosamente`, 'snackBar-dialog');
            
            if (this.editando?.idCatPeriodos === id) {
              this.cancelarEdicion();
            }
            
            this.cargarPeriodos();
          }
        }
      });
  }

  filtrarPeriodos(): void {
    if (!this.searchTerm.trim()) {
      this.periodosFiltered = [...this.periodos];
    } else {
      const termino = this.searchTerm.toLowerCase().trim();
      this.periodosFiltered = this.periodos.filter(periodo =>
        periodo.descripcionPeriodo?.toLowerCase().includes(termino) ||
        periodo.idCatPeriodos.toString().includes(termino) ||
        periodo.fechaInicio?.includes(termino) ||
        periodo.fechaTermino?.includes(termino)
      );
    }
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtrarPeriodos();
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  private mostrarMensaje(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  trackByPeriodoId(index: number, periodo: SUPACatPeriodos): number {
    return periodo.idCatPeriodos;
  }

  get formularioValido(): boolean {
    return !!(this.nuevoPeriodo.descripcionPeriodo?.trim() && 
              this.nuevoPeriodo.descripcionPeriodo.trim().length >= 1 && 
              this.nuevoPeriodo.descripcionPeriodo.trim().length <= 100);
  }

  get puedeEditar(): boolean {
    return !this.editando && !this.loading && !this.creating && !this.updating && !this.deleting;
  }

  get estaCargandoAlgo(): boolean {
    return this.loading || this.creating || this.updating || this.deleting;
  }
}