// cat-motivos.component.ts
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

interface SUPACatMotivos {
  idCatMotivos: number;
  dMotivos: string;
}

@Component({
  selector: 'app-cat-motivos',
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
  templateUrl: './cat-motivos.component.html',
  styleUrls: ['./cat-motivos.component.scss']
})
export class CatMotivosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private backendUrl = 'http://148.226.168.138/SUPA/api/SUPACatMotivos';

  // Data properties
  motivos: SUPACatMotivos[] = [];
  motivosFiltered: SUPACatMotivos[] = [];
  nuevoMotivo: Partial<SUPACatMotivos> = {};
  editando: SUPACatMotivos | null = null;
  motivoEditando: Partial<SUPACatMotivos> = {};

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
    this.cargarMotivos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  crearMotivo(): void {
    if (!this.nuevoMotivo.dMotivos?.trim()) {
      this.mostrarMensaje('El nombre del motivo es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const motivoData = {
      dMotivos: this.nuevoMotivo.dMotivos.trim()
    };

    this.creating = true;

    this.http.post<SUPACatMotivos>(this.backendUrl, motivoData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.creating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear motivo:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Motivo creado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarMotivos();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al crear el motivo';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un motivo con este nombre';
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
            
            this.mostrarMensaje('Motivo creado exitosamente', 'snackBar-dialog');
            this.nuevoMotivo = {};
            this.cargarMotivos();
          }
        }
      });
  }

  prepararEdicion(motivo: SUPACatMotivos): void {
    if (this.editando) {
      this.cancelarEdicion();
    }
    
    this.editando = { ...motivo };
    this.motivoEditando = { 
      dMotivos: motivo.dMotivos
    };
    
    setTimeout(() => {
      const input = document.querySelector('.inline-edit-field input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  actualizarMotivo(): void {
    if (!this.editando || !this.motivoEditando.dMotivos?.trim()) {
      this.mostrarMensaje('El nombre del motivo es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const motivoData = {
      dMotivos: this.motivoEditando.dMotivos.trim()
    };

    this.updating = true;

    this.http.put<any>(`${this.backendUrl}/${this.editando.idCatMotivos}`, motivoData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar motivo:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Motivo actualizado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarMotivos();
              this.cancelarEdicion();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al actualizar el motivo';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un motivo con este nombre';
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
            
            this.mostrarMensaje('Motivo actualizado exitosamente', 'snackBar-dialog');
            this.cancelarEdicion();
            this.cargarMotivos();
          }
        }
      });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.motivoEditando = {};
  }

  cargarMotivos(): void {
    this.loading = true;
    
    this.http.get<SUPACatMotivos[]>(this.backendUrl)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar motivos:', error);
          let mensaje = 'Error al cargar los motivos';
          
          if (error.status === 0) {
            mensaje = 'Error de conexión con el servidor';
          }
          
          this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.motivos = data;
          this.filtrarMotivos();
        }
      });
  }

  eliminarMotivo(id: number): void {
    const motivo = this.motivos.find(m => m.idCatMotivos === id);
    if (!motivo) return;

    const confirmacion = confirm(`¿Está seguro de que desea eliminar el motivo "${motivo.dMotivos}"?\n\nEsta acción no se puede deshacer.`);
    if (!confirmacion) return;

    this.deleting = true;

    this.http.delete<any>(`${this.backendUrl}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.deleting = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar motivo:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Motivo eliminado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarMotivos();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al eliminar el motivo';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'No se puede eliminar el motivo porque está siendo utilizado por otros registros';
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
            
            this.mostrarMensaje(`Motivo "${motivo.dMotivos}" eliminado exitosamente`, 'snackBar-dialog');
            
            if (this.editando?.idCatMotivos === id) {
              this.cancelarEdicion();
            }
            
            this.cargarMotivos();
          }
        }
      });
  }

  filtrarMotivos(): void {
    if (!this.searchTerm.trim()) {
      this.motivosFiltered = [...this.motivos];
    } else {
      const termino = this.searchTerm.toLowerCase().trim();
      this.motivosFiltered = this.motivos.filter(motivo =>
        motivo.dMotivos.toLowerCase().includes(termino) ||
        motivo.idCatMotivos.toString().includes(termino)
      );
    }
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtrarMotivos();
  }

  private mostrarMensaje(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  trackByMotivoId(index: number, motivo: SUPACatMotivos): number {
    return motivo.idCatMotivos;
  }

  get formularioValido(): boolean {
    return !!(this.nuevoMotivo.dMotivos?.trim() && 
              this.nuevoMotivo.dMotivos.trim().length >= 1 && 
              this.nuevoMotivo.dMotivos.trim().length <= 100);
  }

  get puedeEditar(): boolean {
    return !this.editando && !this.loading && !this.creating && !this.updating && !this.deleting;
  }

  get estaCargandoAlgo(): boolean {
    return this.loading || this.creating || this.updating || this.deleting;
  }
}