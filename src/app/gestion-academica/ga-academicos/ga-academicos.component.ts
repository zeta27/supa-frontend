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
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Subject, takeUntil, finalize, catchError, of, timer, forkJoin } from 'rxjs';

interface SUPAAcademicos {
  idAcademico: number;
  numeroEmpleado: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correoInstitucional: string;
  telefono?: string;
  idCatEntidades: number;
  idCatGrado?: number;
  estatus: boolean;
  idCatEntidadesNavigation?: {
    idCatEntidades: number;
    dentidad: string;
  };
}

interface SUPACatEntidades {
  idCatEntidades: number;
  dentidad: string;
}

interface SUPACatGrados {
  idCatGrado: number;
  dgrado: string;
}

@Component({
  selector: 'app-ga-academicos',
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
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './ga-academicos.component.html',
  styleUrls: ['./ga-academicos.component.scss']
})
export class GaAcademicosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private backendUrl = 'http://148.226.168.138/supa/api/SUPAAcademicos';
  private entidadesUrl = 'http://148.226.168.138/supa/api/SUPACatEntidades';
  private gradosUrl = 'http://148.226.168.138/supa/api/SUPACatGrados';

  // Data properties
  academicos: SUPAAcademicos[] = [];
  academicosFiltered: SUPAAcademicos[] = [];
  entidades: SUPACatEntidades[] = [];
  grados: SUPACatGrados[] = [];
  
  nuevoAcademico: Partial<SUPAAcademicos> = { estatus: true };
  editando: SUPAAcademicos | null = null;
  academicoEditando: Partial<SUPAAcademicos> = {};

  // UI properties
  loading = false;
  loadingCatalogos = false;
  creating = false;
  updating = false;
  deleting = false;
  searchTerm = '';
  
  displayedColumns: string[] = ['numeroEmpleado', 'nombreCompleto', 'correoInstitucional', 'entidad', 'estatus', 'acciones'];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarCatalogos(): void {
    this.loadingCatalogos = true;

    forkJoin({
      entidades: this.http.get<SUPACatEntidades[]>(this.entidadesUrl).pipe(
        catchError(error => {
          console.error('Error al cargar entidades:', error);
          return of([]);
        })
      ),
      grados: this.http.get<SUPACatGrados[]>(this.gradosUrl).pipe(
        catchError(error => {
          console.error('Error al cargar grados:', error);
          return of([]);
        })
      ),
      academicos: this.http.get<SUPAAcademicos[]>(this.backendUrl).pipe(
        catchError(error => {
          console.error('Error al cargar académicos:', error);
          return of([]);
        })
      )
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.loadingCatalogos = false;
      })
    )
    .subscribe({
      next: (result) => {
        this.entidades = result.entidades;
        this.grados = result.grados;
        this.academicos = result.academicos;
        this.academicosFiltered = [...this.academicos];
      },
      error: (error) => {
        console.error('Error general al cargar catálogos:', error);
        this.mostrarMensaje('Error al cargar los catálogos', 'snackBar-dialog-Error');
      }
    });
  }

  cargarAcademicos(): void {
    this.loading = true;
    
    this.http.get<SUPAAcademicos[]>(this.backendUrl)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        }),
        catchError((error) => {
          console.error('Error al cargar académicos:', error);
          this.mostrarMensaje('Error al cargar los académicos', 'snackBar-dialog-Error');
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.academicos = data;
          this.academicosFiltered = [...data];
          this.aplicarFiltro();
        }
      });
  }

  crearAcademico(): void {
    if (!this.formularioValido) {
      this.mostrarMensaje('Complete todos los campos requeridos', 'snackBar-dialog-Warning');
      return;
    }

    const academicoData = {
      numeroEmpleado: this.nuevoAcademico.numeroEmpleado?.trim(),
      nombre: this.nuevoAcademico.nombre?.trim(),
      apellidoPaterno: this.nuevoAcademico.apellidoPaterno?.trim(),
      apellidoMaterno: this.nuevoAcademico.apellidoMaterno?.trim() || '',
      correoInstitucional: this.nuevoAcademico.correoInstitucional?.trim(),
      telefono: this.nuevoAcademico.telefono?.trim() || '',
      idCatEntidades: this.nuevoAcademico.idCatEntidades,
      idCatGrado: this.nuevoAcademico.idCatGrado || null,
      estatus: true
    };

    this.creating = true;

    this.http.post<any>(this.backendUrl, academicoData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.creating = false;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear académico:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Académico creado exitosamente', 'snackBar-dialog');
            this.nuevoAcademico = { estatus: true };
            timer(1000).subscribe(() => {
              this.cargarAcademicos();
            });
            return of({ success: true });
          } else {
            let mensaje = 'Error al crear el académico';
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un académico con ese número de empleado';
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
            if ('success' in response) {
              return;
            }
            
            this.mostrarMensaje('Académico creado exitosamente', 'snackBar-dialog');
            this.nuevoAcademico = { estatus: true };
            this.cargarAcademicos();
          }
        }
      });
  }

  editarAcademico(academico: SUPAAcademicos): void {
    this.editando = academico;
    this.academicoEditando = { ...academico };
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.academicoEditando = {};
  }

  actualizarAcademico(): void {
    if (!this.editando || !this.academicoEditando) {
      return;
    }

    if (!this.formularioEdicionValido) {
      this.mostrarMensaje('Complete todos los campos requeridos', 'snackBar-dialog-Warning');
      return;
    }

    const academicoActualizado = {
      ...this.academicoEditando,
      numeroEmpleado: this.academicoEditando.numeroEmpleado?.trim(),
      nombre: this.academicoEditando.nombre?.trim(),
      apellidoPaterno: this.academicoEditando.apellidoPaterno?.trim(),
      apellidoMaterno: this.academicoEditando.apellidoMaterno?.trim() || '',
      correoInstitucional: this.academicoEditando.correoInstitucional?.trim(),
      telefono: this.academicoEditando.telefono?.trim() || ''
    };

    this.updating = true;

    this.http.put<any>(`${this.backendUrl}/${this.editando.idAcademico}`, academicoActualizado)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.updating = false;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar académico:', error);
          
          if (error.status === 500 || error.status === 204) {
            this.mostrarMensaje('Académico actualizado exitosamente', 'snackBar-dialog');
            this.editando = null;
            this.academicoEditando = {};
            timer(1000).subscribe(() => {
              this.cargarAcademicos();
            });
            return of({ success: true });
          } else {
            let mensaje = 'Error al actualizar el académico';
            if (error.status === 409 || error.status === 400) {
              mensaje = 'El número de empleado ya está en uso';
            } else if (error.status === 404) {
              mensaje = 'Académico no encontrado';
            }
            this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
            return of(null);
          }
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            if ('success' in response) {
              return;
            }
            
            this.mostrarMensaje('Académico actualizado exitosamente', 'snackBar-dialog');
            this.editando = null;
            this.academicoEditando = {};
            this.cargarAcademicos();
          }
        }
      });
  }

  eliminarAcademico(academico: SUPAAcademicos): void {
    if (confirm(`¿Está seguro de eliminar al académico ${academico.nombre} ${academico.apellidoPaterno}?`)) {
      this.deleting = true;

      this.http.delete<any>(`${this.backendUrl}/${academico.idAcademico}`)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.deleting = false;
          }),
          catchError((error: HttpErrorResponse) => {
            console.error('Error al eliminar académico:', error);
            
            if (error.status === 500 || error.status === 204) {
              this.mostrarMensaje('Académico eliminado exitosamente', 'snackBar-dialog');
              timer(1000).subscribe(() => {
                this.cargarAcademicos();
              });
              return of({ success: true });
            } else {
              let mensaje = 'Error al eliminar el académico';
              if (error.status === 404) {
                mensaje = 'Académico no encontrado';
              } else if (error.status === 409) {
                mensaje = 'No se puede eliminar el académico porque tiene registros relacionados';
              }
              this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
              return of(null);
            }
          })
        )
        .subscribe({
          next: (response) => {
            if (response) {
              if ('success' in response) {
                return;
              }
              
              this.mostrarMensaje('Académico eliminado exitosamente', 'snackBar-dialog');
              this.cargarAcademicos();
            }
          }
        });
    }
  }

  aplicarFiltro(): void {
    if (!this.searchTerm.trim()) {
      this.academicosFiltered = [...this.academicos];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.academicosFiltered = this.academicos.filter(academico => {
      const nombreCompleto = `${academico.nombre} ${academico.apellidoPaterno} ${academico.apellidoMaterno}`.toLowerCase();
      const entidad = this.getNombreEntidad(academico.idCatEntidades).toLowerCase();
      
      return academico.numeroEmpleado.toLowerCase().includes(term) ||
             nombreCompleto.includes(term) ||
             academico.correoInstitucional.toLowerCase().includes(term) ||
             entidad.includes(term);
    });
  }

  mostrarMensaje(mensaje: string, clase: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [clase],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  getNombreEntidad(idEntidad: number): string {
    const entidad = this.entidades.find(e => e.idCatEntidades === idEntidad);
    return entidad ? entidad.dentidad : 'N/A';
  }

  getNombreGrado(idGrado?: number): string {
    if (!idGrado) return 'N/A';
    const grado = this.grados.find(g => g.idCatGrado === idGrado);
    return grado ? grado.dgrado : 'N/A';
  }

  trackByAcademicoId(index: number, academico: SUPAAcademicos): number {
    return academico.idAcademico;
  }

  get formularioValido(): boolean {
    return !!(
      this.nuevoAcademico.numeroEmpleado?.trim() && 
      this.nuevoAcademico.nombre?.trim() &&
      this.nuevoAcademico.apellidoPaterno?.trim() &&
      this.nuevoAcademico.correoInstitucional?.trim() &&
      this.nuevoAcademico.idCatEntidades
    );
  }

  get formularioEdicionValido(): boolean {
    return !!(
      this.academicoEditando.numeroEmpleado?.trim() && 
      this.academicoEditando.nombre?.trim() &&
      this.academicoEditando.apellidoPaterno?.trim() &&
      this.academicoEditando.correoInstitucional?.trim() &&
      this.academicoEditando.idCatEntidades
    );
  }

  get puedeEditar(): boolean {
    return !this.editando && !this.loadingCatalogos && !this.creating && !this.updating && !this.deleting;
  }

  get estaCargandoAlgo(): boolean {
    return this.loadingCatalogos || this.creating || this.updating || this.deleting;
  }
}