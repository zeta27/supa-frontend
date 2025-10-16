// cat-gradoca.component.ts
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

interface SUPACatGradoCA {
  idCatGradoCA: number;
  descripcionGrado: string;
  abreviatura: string;
}

@Component({
  selector: 'app-cat-gradoca',
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
  templateUrl: './cat-gradoca.component.html',
  styleUrls: ['./cat-gradoca.component.scss']
})
export class CatGradoCAComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private backendUrl = 'http://148.226.168.138/supa/Api/SUPACatGradoCA';

  // Data properties
  gradosCA: SUPACatGradoCA[] = [];
  gradosCAFiltered: SUPACatGradoCA[] = [];
  nuevoGradoCA: Partial<SUPACatGradoCA> = {};
  editando: SUPACatGradoCA | null = null;
  gradoCAEditando: Partial<SUPACatGradoCA> = {};

  // UI properties
  loading = false;
  creating = false;
  updating = false;
  deleting = false;
  searchTerm = '';
  
  displayedColumns: string[] = ['descripcion', 'abreviatura', 'acciones'];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarGradosCA();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  crearGradoCA(): void {
    if (!this.nuevoGradoCA.descripcionGrado?.trim()) {
      this.mostrarMensaje('La descripción del grado es requerida', 'snackBar-dialog-Warning');
      return;
    }

    if (!this.nuevoGradoCA.abreviatura?.trim()) {
      this.mostrarMensaje('La abreviatura del grado es requerida', 'snackBar-dialog-Warning');
      return;
    }

    const gradoCAData = {
      descripcionGrado: this.nuevoGradoCA.descripcionGrado.trim(),
      abreviatura: this.nuevoGradoCA.abreviatura.trim()
    };

    this.creating = true;

    this.http.post<SUPACatGradoCA>(this.backendUrl, gradoCAData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.creating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear grado CA:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Grado CA creado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarGradosCA();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al crear el grado CA';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un grado CA con estos datos';
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
            
            this.mostrarMensaje('Grado CA creado exitosamente', 'snackBar-dialog');
            this.nuevoGradoCA = {};
            this.cargarGradosCA();
          }
        }
      });
  }

  prepararEdicion(gradoCA: SUPACatGradoCA): void {
    if (this.editando) {
      this.cancelarEdicion();
    }
    
    this.editando = { ...gradoCA };
    this.gradoCAEditando = { 
      descripcionGrado: gradoCA.descripcionGrado,
      abreviatura: gradoCA.abreviatura
    };
    
    setTimeout(() => {
      const input = document.querySelector('.inline-edit-field input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  actualizarGradoCA(): void {
    if (!this.editando || !this.gradoCAEditando.descripcionGrado?.trim()) {
      this.mostrarMensaje('La descripción del grado es requerida', 'snackBar-dialog-Warning');
      return;
    }

    if (!this.gradoCAEditando.abreviatura?.trim()) {
      this.mostrarMensaje('La abreviatura del grado es requerida', 'snackBar-dialog-Warning');
      return;
    }

    const gradoCAData = {
      descripcionGrado: this.gradoCAEditando.descripcionGrado.trim(),
      abreviatura: this.gradoCAEditando.abreviatura.trim()
    };

    this.updating = true;

    this.http.put<any>(`${this.backendUrl}/${this.editando.idCatGradoCA}`, gradoCAData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar grado CA:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Grado CA actualizado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarGradosCA();
              this.cancelarEdicion();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al actualizar el grado CA';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un grado CA con estos datos';
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
            
            this.mostrarMensaje('Grado CA actualizado exitosamente', 'snackBar-dialog');
            this.cancelarEdicion();
            this.cargarGradosCA();
          }
        }
      });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.gradoCAEditando = {};
  }

  cargarGradosCA(): void {
    this.loading = true;
    
    this.http.get<SUPACatGradoCA[]>(this.backendUrl)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar grados CA:', error);
          let mensaje = 'Error al cargar los grados CA';
          
          if (error.status === 0) {
            mensaje = 'Error de conexión con el servidor';
          }
          
          this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.gradosCA = data;
          this.filtrarGradosCA();
        }
      });
  }

  eliminarGradoCA(id: number): void {
    const gradoCA = this.gradosCA.find(g => g.idCatGradoCA === id);
    if (!gradoCA) return;

    const confirmacion = confirm(`¿Está seguro de que desea eliminar el grado CA "${gradoCA.descripcionGrado}"?\n\nEsta acción no se puede deshacer.`);
    if (!confirmacion) return;

    this.deleting = true;

    this.http.delete<any>(`${this.backendUrl}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.deleting = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar grado CA:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Grado CA eliminado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarGradosCA();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al eliminar el grado CA';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'No se puede eliminar el grado CA porque está siendo utilizado por otros registros';
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
            
            this.mostrarMensaje(`Grado CA "${gradoCA.descripcionGrado}" eliminado exitosamente`, 'snackBar-dialog');
            
            if (this.editando?.idCatGradoCA === id) {
              this.cancelarEdicion();
            }
            
            this.cargarGradosCA();
          }
        }
      });
  }

  filtrarGradosCA(): void {
    if (!this.searchTerm.trim()) {
      this.gradosCAFiltered = [...this.gradosCA];
    } else {
      const termino = this.searchTerm.toLowerCase().trim();
      this.gradosCAFiltered = this.gradosCA.filter(grado =>
        grado.descripcionGrado.toLowerCase().includes(termino) ||
        grado.abreviatura.toLowerCase().includes(termino) ||
        grado.idCatGradoCA.toString().includes(termino)
      );
    }
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtrarGradosCA();
  }

  private mostrarMensaje(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  trackByGradoCAId(index: number, gradoCA: SUPACatGradoCA): number {
    return gradoCA.idCatGradoCA;
  }

  get formularioValido(): boolean {
    return !!(this.nuevoGradoCA.descripcionGrado?.trim() && 
              this.nuevoGradoCA.abreviatura?.trim() &&
              this.nuevoGradoCA.descripcionGrado.trim().length >= 1 && 
              this.nuevoGradoCA.descripcionGrado.trim().length <= 255 &&
              this.nuevoGradoCA.abreviatura.trim().length >= 1 &&
              this.nuevoGradoCA.abreviatura.trim().length <= 100);
  }

  get puedeEditar(): boolean {
    return !this.editando && !this.loading && !this.creating && !this.updating && !this.deleting;
  }

  get estaCargandoAlgo(): boolean {
    return this.loading || this.creating || this.updating || this.deleting;
  }
}