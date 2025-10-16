// cat-estadoapoyo.component.ts
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

interface SUPACatEstadoApoyo {
  idCatEstadoApoyo: number;
  dEstadoApoyo: string;
}

@Component({
  selector: 'app-cat-estadoapoyo',
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
  templateUrl: './cat-estadoapoyo.component.html',
  styleUrls: ['./cat-estadoapoyo.component.scss']
})
export class CatEstadoApoyoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private backendUrl = 'http://148.226.168.138/supa/api/SUPACatEstadoApoyo';

  // Data properties
  estadosApoyo: SUPACatEstadoApoyo[] = [];
  estadosApoyoFiltered: SUPACatEstadoApoyo[] = [];
  nuevoEstadoApoyo: Partial<SUPACatEstadoApoyo> = {};
  editando: SUPACatEstadoApoyo | null = null;
  estadoApoyoEditando: Partial<SUPACatEstadoApoyo> = {};

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
    this.cargarEstadosApoyo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  crearEstadoApoyo(): void {
    if (!this.nuevoEstadoApoyo.dEstadoApoyo?.trim()) {
      this.mostrarMensaje('El nombre del estado de apoyo es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const nuevoNombre = this.nuevoEstadoApoyo.dEstadoApoyo.trim();

    const nombreExiste = this.estadosApoyo.some(estado => 
      estado.dEstadoApoyo.toLowerCase() === nuevoNombre.toLowerCase()
    );

    if (nombreExiste) {
      this.mostrarMensaje('Ya existe un estado de apoyo con este nombre', 'snackBar-dialog-Warning');
      return;
    }

    const estadoApoyoData = {
      dEstadoApoyo: nuevoNombre
    };

    this.creating = true;

    this.http.post<SUPACatEstadoApoyo>(this.backendUrl, estadoApoyoData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.creating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear estado de apoyo:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Estado de apoyo creado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarEstadosApoyo();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al crear el estado de apoyo';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un estado de apoyo con este nombre';
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
            
            this.mostrarMensaje('Estado de apoyo creado exitosamente', 'snackBar-dialog');
            this.nuevoEstadoApoyo = {};
            this.cargarEstadosApoyo();
          }
        }
      });
  }

  prepararEdicion(estadoApoyo: SUPACatEstadoApoyo): void {
    if (this.editando) {
      this.cancelarEdicion();
    }
    
    this.editando = { ...estadoApoyo };
    this.estadoApoyoEditando = { dEstadoApoyo: estadoApoyo.dEstadoApoyo };
    
    setTimeout(() => {
      const input = document.querySelector('.inline-edit-field input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  actualizarEstadoApoyo(): void {
    if (!this.editando || !this.estadoApoyoEditando.dEstadoApoyo?.trim()) {
      this.mostrarMensaje('El nombre del estado de apoyo es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const nuevoNombre = this.estadoApoyoEditando.dEstadoApoyo.trim();

    const nombreExiste = this.estadosApoyo.some(estado => 
      estado.dEstadoApoyo.toLowerCase() === nuevoNombre.toLowerCase() &&
      estado.idCatEstadoApoyo !== this.editando!.idCatEstadoApoyo
    );

    if (nombreExiste) {
      this.mostrarMensaje('Ya existe un estado de apoyo con este nombre', 'snackBar-dialog-Warning');
      return;
    }

    const estadoApoyoData = {
      dEstadoApoyo: nuevoNombre
    };

    this.updating = true;

    this.http.put<any>(`${this.backendUrl}/${this.editando.idCatEstadoApoyo}`, estadoApoyoData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar estado de apoyo:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Estado de apoyo actualizado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarEstadosApoyo();
              this.cancelarEdicion();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al actualizar el estado de apoyo';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un estado de apoyo con este nombre';
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
            
            this.mostrarMensaje('Estado de apoyo actualizado exitosamente', 'snackBar-dialog');
            this.cancelarEdicion();
            this.cargarEstadosApoyo();
          }
        }
      });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.estadoApoyoEditando = {};
  }

  cargarEstadosApoyo(): void {
    this.loading = true;
    
    this.http.get<SUPACatEstadoApoyo[]>(this.backendUrl)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar estados de apoyo:', error);
          let mensaje = 'Error al cargar los estados de apoyo';
          
          if (error.status === 0) {
            mensaje = 'Error de conexión con el servidor';
          }
          
          this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.estadosApoyo = data;
          this.filtrarEstadosApoyo();
        }
      });
  }

  eliminarEstadoApoyo(id: number): void {
    const estadoApoyo = this.estadosApoyo.find(e => e.idCatEstadoApoyo === id);
    if (!estadoApoyo) return;

    const confirmacion = confirm(`¿Está seguro de que desea eliminar el estado de apoyo "${estadoApoyo.dEstadoApoyo}"?\n\nEsta acción no se puede deshacer.`);
    if (!confirmacion) return;

    this.deleting = true;

    this.http.delete<any>(`${this.backendUrl}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.deleting = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar estado de apoyo:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Estado de apoyo eliminado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarEstadosApoyo();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al eliminar el estado de apoyo';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'No se puede eliminar el estado de apoyo porque está siendo utilizado por otros registros';
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
            
            this.mostrarMensaje(`Estado de apoyo "${estadoApoyo.dEstadoApoyo}" eliminado exitosamente`, 'snackBar-dialog');
            
            if (this.editando?.idCatEstadoApoyo === id) {
              this.cancelarEdicion();
            }
            
            this.cargarEstadosApoyo();
          }
        }
      });
  }

  filtrarEstadosApoyo(): void {
    if (!this.searchTerm.trim()) {
      this.estadosApoyoFiltered = [...this.estadosApoyo];
    } else {
      const termino = this.searchTerm.toLowerCase().trim();
      this.estadosApoyoFiltered = this.estadosApoyo.filter(estado =>
        estado.dEstadoApoyo.toLowerCase().includes(termino) ||
        estado.idCatEstadoApoyo.toString().includes(termino)
      );
    }
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtrarEstadosApoyo();
  }

  private mostrarMensaje(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  trackByEstadoApoyoId(index: number, estadoApoyo: SUPACatEstadoApoyo): number {
    return estadoApoyo.idCatEstadoApoyo;
  }

  get formularioValido(): boolean {
    return !!(this.nuevoEstadoApoyo.dEstadoApoyo?.trim() && 
              this.nuevoEstadoApoyo.dEstadoApoyo.trim().length >= 1 && 
              this.nuevoEstadoApoyo.dEstadoApoyo.trim().length <= 100);
  }

  get puedeEditar(): boolean {
    return !this.editando && !this.loading && !this.creating && !this.updating && !this.deleting;
  }

  get estaCargandoAlgo(): boolean {
    return this.loading || this.creating || this.updating || this.deleting;
  }
}