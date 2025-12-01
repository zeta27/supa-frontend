// cat-disciplinas.component.ts
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

interface SUPACatDisciplinas {
  idCatDisciplinas: number;
  ddisciplina: string | null;
}

@Component({
  selector: 'app-cat-disciplinas',
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
  templateUrl: './cat-disciplinas.component.html',
  styleUrls: ['./cat-disciplinas.component.scss']
})
export class CatDisciplinasComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private backendUrl = 'http://148.226.168.138/SUPA/api/SUPACatDisciplinas';

  // Data properties
  disciplinas: SUPACatDisciplinas[] = [];
  disciplinasFiltered: SUPACatDisciplinas[] = [];
  nuevaDisciplina: Partial<SUPACatDisciplinas> = {};
  editando: SUPACatDisciplinas | null = null;
  disciplinaEditando: Partial<SUPACatDisciplinas> = {};

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
    this.cargarDisciplinas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  crearDisciplina(): void {
    if (!this.nuevaDisciplina.ddisciplina?.trim()) {
      this.mostrarMensaje('El nombre de la disciplina es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const nuevoNombre = this.nuevaDisciplina.ddisciplina.trim();

    const nombreExiste = this.disciplinas.some(disciplina => 
      disciplina.ddisciplina?.toLowerCase() === nuevoNombre.toLowerCase()
    );

    if (nombreExiste) {
      this.mostrarMensaje('Ya existe una disciplina con este nombre', 'snackBar-dialog-Warning');
      return;
    }

    const disciplinaData = {
      ddisciplina: nuevoNombre
    };

    this.creating = true;

    this.http.post<SUPACatDisciplinas>(this.backendUrl, disciplinaData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.creating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear disciplina:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Disciplina creada exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarDisciplinas();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al crear la disciplina';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe una disciplina con este nombre';
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
            
            this.mostrarMensaje('Disciplina creada exitosamente', 'snackBar-dialog');
            this.nuevaDisciplina = {};
            this.cargarDisciplinas();
          }
        }
      });
  }

  prepararEdicion(disciplina: SUPACatDisciplinas): void {
    if (this.editando) {
      this.cancelarEdicion();
    }
    
    this.editando = { ...disciplina };
    this.disciplinaEditando = { ddisciplina: disciplina.ddisciplina };
    
    setTimeout(() => {
      const input = document.querySelector('.inline-edit-field input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  actualizarDisciplina(): void {
    if (!this.editando || !this.disciplinaEditando.ddisciplina?.trim()) {
      this.mostrarMensaje('El nombre de la disciplina es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const nuevoNombre = this.disciplinaEditando.ddisciplina.trim();

    const nombreExiste = this.disciplinas.some(disciplina => 
      disciplina.ddisciplina?.toLowerCase() === nuevoNombre.toLowerCase() &&
      disciplina.idCatDisciplinas !== this.editando!.idCatDisciplinas
    );

    if (nombreExiste) {
      this.mostrarMensaje('Ya existe una disciplina con este nombre', 'snackBar-dialog-Warning');
      return;
    }

    const disciplinaData = {
      ddisciplina: nuevoNombre
    };

    this.updating = true;

    this.http.put<any>(`${this.backendUrl}/${this.editando.idCatDisciplinas}`, disciplinaData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar disciplina:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Disciplina actualizada exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarDisciplinas();
              this.cancelarEdicion();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al actualizar la disciplina';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe una disciplina con este nombre';
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
            
            this.mostrarMensaje('Disciplina actualizada exitosamente', 'snackBar-dialog');
            this.cancelarEdicion();
            this.cargarDisciplinas();
          }
        }
      });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.disciplinaEditando = {};
  }

  cargarDisciplinas(): void {
    this.loading = true;
    
    this.http.get<SUPACatDisciplinas[]>(this.backendUrl)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar disciplinas:', error);
          let mensaje = 'Error al cargar las disciplinas';
          
          if (error.status === 0) {
            mensaje = 'Error de conexión con el servidor';
          }
          
          this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.disciplinas = data;
          this.filtrarDisciplinas();
        }
      });
  }

  eliminarDisciplina(id: number): void {
    const disciplina = this.disciplinas.find(d => d.idCatDisciplinas === id);
    if (!disciplina) return;

    const confirmacion = confirm(`¿Está seguro de que desea eliminar la disciplina "${disciplina.ddisciplina}"?\n\nEsta acción no se puede deshacer.`);
    if (!confirmacion) return;

    this.deleting = true;

    this.http.delete<any>(`${this.backendUrl}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.deleting = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar disciplina:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Disciplina eliminada exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarDisciplinas();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al eliminar la disciplina';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'No se puede eliminar la disciplina porque está siendo utilizada por otros registros';
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
            
            this.mostrarMensaje(`Disciplina "${disciplina.ddisciplina}" eliminada exitosamente`, 'snackBar-dialog');
            
            if (this.editando?.idCatDisciplinas === id) {
              this.cancelarEdicion();
            }
            
            this.cargarDisciplinas();
          }
        }
      });
  }

  filtrarDisciplinas(): void {
    if (!this.searchTerm.trim()) {
      this.disciplinasFiltered = [...this.disciplinas];
    } else {
      const termino = this.searchTerm.toLowerCase().trim();
      this.disciplinasFiltered = this.disciplinas.filter(disciplina =>
        disciplina.ddisciplina?.toLowerCase().includes(termino) ||
        disciplina.idCatDisciplinas.toString().includes(termino)
      );
    }
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtrarDisciplinas();
  }

  private mostrarMensaje(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  trackByDisciplinaId(index: number, disciplina: SUPACatDisciplinas): number {
    return disciplina.idCatDisciplinas;
  }

  get formularioValido(): boolean {
    return !!(this.nuevaDisciplina.ddisciplina?.trim() && 
              this.nuevaDisciplina.ddisciplina.trim().length >= 1 && 
              this.nuevaDisciplina.ddisciplina.trim().length <= 50);
  }

  get puedeEditar(): boolean {
    return !this.editando && !this.loading && !this.creating && !this.updating && !this.deleting;
  }

  get estaCargandoAlgo(): boolean {
    return this.loading || this.creating || this.updating || this.deleting;
  }
}