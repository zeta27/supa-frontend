// cat-nivelestudios.component.ts
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

interface SUPACatNivelEstudios {
  idCatNivelEstudios: number;
  descripcionNivelEstudios: string;
}

@Component({
  selector: 'app-cat-nivelestudios',
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
  templateUrl: './cat-nivelestudios.component.html',
  styleUrls: ['./cat-nivelestudios.component.scss']
})
export class CatNivelEstudiosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private backendUrl = 'http://148.226.168.138/supa/api/SUPACatNivelEstudios';

  // Data properties
  nivelesEstudios: SUPACatNivelEstudios[] = [];
  nivelesEstudiosFiltered: SUPACatNivelEstudios[] = [];
  nuevoNivelEstudios: Partial<SUPACatNivelEstudios> = {};
  editando: SUPACatNivelEstudios | null = null;
  nivelEstudiosEditando: Partial<SUPACatNivelEstudios> = {};

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
    this.cargarNivelesEstudios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  crearNivelEstudios(): void {
    if (!this.nuevoNivelEstudios.descripcionNivelEstudios?.trim()) {
      this.mostrarMensaje('La descripción del nivel de estudios es requerida', 'snackBar-dialog-Warning');
      return;
    }

    const nombreNivel = this.nuevoNivelEstudios.descripcionNivelEstudios.trim();

    const nombreExiste = this.nivelesEstudios.some(nivel => 
      nivel.descripcionNivelEstudios.toLowerCase() === nombreNivel.toLowerCase()
    );

    if (nombreExiste) {
      this.mostrarMensaje('Ya existe un nivel de estudios con este nombre', 'snackBar-dialog-Warning');
      return;
    }

    const nivelData = { descripcionNivelEstudios: nombreNivel };

    this.creating = true;

    this.http.post<any>(this.backendUrl, nivelData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.creating = false;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear nivel de estudios:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Nivel de estudios creado exitosamente', 'snackBar-dialog');
            this.nuevoNivelEstudios = {};
            
            timer(1000).subscribe(() => {
              this.cargarNivelesEstudios();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al crear el nivel de estudios';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un nivel de estudios con este nombre';
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
            
            this.mostrarMensaje('Nivel de estudios creado exitosamente', 'snackBar-dialog');
            this.nuevoNivelEstudios = {};
            this.cargarNivelesEstudios();
          }
        }
      });
  }

  prepararEdicion(nivelEstudios: SUPACatNivelEstudios): void {
    if (this.editando) {
      this.cancelarEdicion();
    }
    
    this.editando = { ...nivelEstudios };
    this.nivelEstudiosEditando = { descripcionNivelEstudios: nivelEstudios.descripcionNivelEstudios };
    
    setTimeout(() => {
      const input = document.querySelector('.inline-edit-field input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  actualizarNivelEstudios(): void {
    if (!this.editando || !this.nivelEstudiosEditando.descripcionNivelEstudios?.trim()) {
      this.mostrarMensaje('La descripción del nivel de estudios es requerida', 'snackBar-dialog-Warning');
      return;
    }

    const nuevoNombre = this.nivelEstudiosEditando.descripcionNivelEstudios.trim();

    const nombreExiste = this.nivelesEstudios.some(nivel => 
      nivel.descripcionNivelEstudios.toLowerCase() === nuevoNombre.toLowerCase() &&
      nivel.idCatNivelEstudios !== this.editando!.idCatNivelEstudios
    );

    if (nombreExiste) {
      this.mostrarMensaje('Ya existe un nivel de estudios con este nombre', 'snackBar-dialog-Warning');
      return;
    }

    const nivelData = {
      idCatNivelEstudios: this.editando.idCatNivelEstudios,
      descripcionNivelEstudios: nuevoNombre
    };

    this.updating = true;

    this.http.put<any>(`${this.backendUrl}/${this.editando.idCatNivelEstudios}`, nivelData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar nivel de estudios:', error);
          
          if (error.status === 500 || error.status === 204) {
            this.mostrarMensaje('Nivel de estudios actualizado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarNivelesEstudios();
              this.cancelarEdicion();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al actualizar el nivel de estudios';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un nivel de estudios con este nombre';
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
            
            this.mostrarMensaje('Nivel de estudios actualizado exitosamente', 'snackBar-dialog');
            this.cancelarEdicion();
            this.cargarNivelesEstudios();
          }
        }
      });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.nivelEstudiosEditando = {};
  }

  cargarNivelesEstudios(): void {
    this.loading = true;
    
    this.http.get<SUPACatNivelEstudios[]>(this.backendUrl)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar niveles de estudios:', error);
          let mensaje = 'Error al cargar los niveles de estudios';
          
          if (error.status === 0) {
            mensaje = 'Error de conexión con el servidor';
          }
          
          this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.nivelesEstudios = data;
          this.filtrarNivelesEstudios();
        }
      });
  }

  eliminarNivelEstudios(id: number): void {
    const nivelEstudios = this.nivelesEstudios.find(n => n.idCatNivelEstudios === id);
    if (!nivelEstudios) return;

    const confirmacion = confirm(`¿Está seguro de que desea eliminar el nivel de estudios "${nivelEstudios.descripcionNivelEstudios}"?\n\nEsta acción no se puede deshacer.`);
    if (!confirmacion) return;

    this.deleting = true;

    this.http.delete<any>(`${this.backendUrl}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.deleting = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar nivel de estudios:', error);
          
          if (error.status === 500 || error.status === 204) {
            this.mostrarMensaje('Nivel de estudios eliminado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarNivelesEstudios();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al eliminar el nivel de estudios';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'No se puede eliminar el nivel de estudios porque está siendo utilizado por otros registros';
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
            
            this.mostrarMensaje(`Nivel de estudios "${nivelEstudios.descripcionNivelEstudios}" eliminado exitosamente`, 'snackBar-dialog');
            
            if (this.editando?.idCatNivelEstudios === id) {
              this.cancelarEdicion();
            }
            
            this.cargarNivelesEstudios();
          }
        }
      });
  }

  filtrarNivelesEstudios(): void {
    if (!this.searchTerm.trim()) {
      this.nivelesEstudiosFiltered = [...this.nivelesEstudios];
    } else {
      const termino = this.searchTerm.toLowerCase().trim();
      this.nivelesEstudiosFiltered = this.nivelesEstudios.filter(nivel =>
        nivel.descripcionNivelEstudios.toLowerCase().includes(termino) ||
        nivel.idCatNivelEstudios.toString().includes(termino)
      );
    }
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtrarNivelesEstudios();
  }

  private mostrarMensaje(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  trackByNivelId(index: number, nivel: SUPACatNivelEstudios): number {
    return nivel.idCatNivelEstudios;
  }

  get formularioValido(): boolean {
    return !!(this.nuevoNivelEstudios.descripcionNivelEstudios?.trim() && 
              this.nuevoNivelEstudios.descripcionNivelEstudios.trim().length >= 1 && 
              this.nuevoNivelEstudios.descripcionNivelEstudios.trim().length <= 100);
  }

  get puedeEditar(): boolean {
    return !this.editando && !this.loading && !this.creating && !this.updating && !this.deleting;
  }

  get estaCargandoAlgo(): boolean {
    return this.loading || this.creating || this.updating || this.deleting;
  }
}