// ga-academicos.component.ts
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';

import { Subject, takeUntil, finalize, catchError, of, timer, forkJoin } from 'rxjs';

interface SUPAAcademicos {
  idSUPA: number;
  curp: string;
  np: number;
  paterno?: string;
  materno?: string;
  nombre: string;
  idCatGeneros: number;
  idCatNacionalidad: number;
  institucion: string;
  idPRODEP: number;
  cuentaUV?: string;
  baja: boolean;
  fechaBaja?: Date;
  observaciones?: string;
  idCatMotivos: number;
  idCatGenerosNavigation?: {
    idCatGeneros: number;
    dGenero: string;  // ✅ Mayúscula inicial
  };
  idCatNacionalidadNavigation?: {
    idCatNacionalidad: number;
    dNacionalidad: string;  // ✅ Mayúscula inicial
  };
  idCatMotivosNavigation?: {
    idCatMotivos: number;
    dMotivos: string;  // ✅ Mayúscula inicial (y es dMotivos, no dmotivo)
  };
}

interface SUPACatGeneros {
  idCatGeneros: number;
  dGenero: string;  // ✅ Mayúscula inicial
}

interface SUPACatNacionalidades {
  idCatNacionalidad: number;
  dNacionalidad: string;  // ✅ Mayúscula inicial
}

interface SUPACatMotivos {
  idCatMotivos: number;
  dMotivos: string;  // ✅ Es dMotivos (plural), no dmotivo
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
    MatSnackBarModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule
  ],
  templateUrl: './ga-academicos.component.html',
  styleUrls: ['./ga-academicos.component.scss']
})
export class GaAcademicosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private backendUrl = 'http://148.226.168.138/SUPA/api/SUPAAcademicos';
  private generosUrl = 'http://148.226.168.138/SUPA/api/SUPACatGeneros';
  private nacionalidadesUrl = 'http://148.226.168.138/SUPA/api/SUPACatNacionalidades';
  private motivosUrl = 'http://148.226.168.138/SUPA/api/SUPACatMotivos';

  // Data properties
  academicos: SUPAAcademicos[] = [];
  academicosFiltered: SUPAAcademicos[] = [];
  generos: SUPACatGeneros[] = [];
  nacionalidades: SUPACatNacionalidades[] = [];
  motivos: SUPACatMotivos[] = [];
  
  nuevoAcademico: Partial<SUPAAcademicos> = {
    institucion: 'Universidad Veracruzana',
    baja: false,
    idCatMotivos: 1
  };
  editando: SUPAAcademicos | null = null;
  academicoEditando: Partial<SUPAAcademicos> = {};

  // UI properties
  loading = false;
  loadingCatalogos = false;
  creating = false;
  updating = false;
  deleting = false;
  searchTerm = '';
  mostrarFormulario = false;
  
  displayedColumns: string[] = ['curp', 'nombreCompleto', 'np', 'cuentaUV', 'genero', 'nacionalidad', 'estatus', 'acciones'];

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
      generos: this.http.get<SUPACatGeneros[]>(this.generosUrl).pipe(
        catchError(error => {
          console.error('Error al cargar géneros:', error);
          return of([]);
        })
      ),
      nacionalidades: this.http.get<SUPACatNacionalidades[]>(this.nacionalidadesUrl).pipe(
        catchError(error => {
          console.error('Error al cargar nacionalidades:', error);
          return of([]);
        })
      ),
      motivos: this.http.get<SUPACatMotivos[]>(this.motivosUrl).pipe(
        catchError(error => {
          console.error('Error al cargar motivos:', error);
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
      finalize(() => this.loadingCatalogos = false)
    )
    .subscribe({
      next: (data) => {
        console.log('Datos cargados:', data); // DEBUG
        console.log('Géneros:', data.generos); // DEBUG
        console.log('Nacionalidades:', data.nacionalidades); // DEBUG
        console.log('Motivos:', data.motivos); // DEBUG
        
        this.generos = data.generos;
        this.nacionalidades = data.nacionalidades;
        this.motivos = data.motivos;
        this.academicos = data.academicos;
        this.filtrarAcademicos();
      },
      error: (error) => {
        console.error('Error al cargar catálogos:', error);
        this.mostrarMensaje('Error al cargar los catálogos', 'snackBar-dialog-Error');
      }
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.limpiarFormulario();
    }
  }

  limpiarFormulario(): void {
    this.nuevoAcademico = {
      institucion: 'Universidad Veracruzana',
      baja: false,
      idCatMotivos: 1
    };
  }

  crearAcademico(): void {
    if (!this.validarFormulario()) {
      return;
    }

    const academicoData = {
      curp: this.nuevoAcademico.curp!.trim().toUpperCase(),
      np: this.nuevoAcademico.np!,
      paterno: this.nuevoAcademico.paterno?.trim() || null,
      materno: this.nuevoAcademico.materno?.trim() || null,
      nombre: this.nuevoAcademico.nombre!.trim(),
      idCatGeneros: this.nuevoAcademico.idCatGeneros!,
      idCatNacionalidad: this.nuevoAcademico.idCatNacionalidad!,
      institucion: this.nuevoAcademico.institucion!.trim(),
      idPRODEP: this.nuevoAcademico.idPRODEP!,
      cuentaUV: this.nuevoAcademico.cuentaUV?.trim() || null,
      baja: this.nuevoAcademico.baja || false,
      fechaBaja: this.nuevoAcademico.fechaBaja || null,
      observaciones: this.nuevoAcademico.observaciones?.trim() || null,
      idCatMotivos: this.nuevoAcademico.idCatMotivos || 1
    };

    this.creating = true;

    this.http.post<any>(this.backendUrl, academicoData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.creating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear académico:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Académico creado exitosamente', 'snackBar-dialog');
            this.limpiarFormulario();
            this.mostrarFormulario = false;
            
            timer(1000).subscribe(() => {
              this.cargarCatalogos();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al crear el académico';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un académico con este CURP o NP';
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
          if (response && !response.success) {
            this.mostrarMensaje('Académico creado exitosamente', 'snackBar-dialog');
            this.limpiarFormulario();
            this.mostrarFormulario = false;
            this.cargarCatalogos();
          }
        }
      });
  }

  prepararEdicion(academico: SUPAAcademicos): void {
    if (this.editando) {
      this.cancelarEdicion();
    }
    
    this.editando = { ...academico };
    this.academicoEditando = {
      curp: academico.curp,
      np: academico.np,
      paterno: academico.paterno,
      materno: academico.materno,
      nombre: academico.nombre,
      idCatGeneros: academico.idCatGeneros,
      idCatNacionalidad: academico.idCatNacionalidad,
      institucion: academico.institucion,
      idPRODEP: academico.idPRODEP,
      cuentaUV: academico.cuentaUV,
      baja: academico.baja,
      fechaBaja: academico.fechaBaja,
      observaciones: academico.observaciones,
      idCatMotivos: academico.idCatMotivos
    };
  }

  actualizarAcademico(): void {
    if (!this.editando || !this.validarFormularioEdicion()) {
      return;
    }

    const academicoData = {
      idSUPA: this.editando.idSUPA,
      curp: this.academicoEditando.curp!.trim().toUpperCase(),
      np: this.academicoEditando.np!,
      paterno: this.academicoEditando.paterno?.trim() || null,
      materno: this.academicoEditando.materno?.trim() || null,
      nombre: this.academicoEditando.nombre!.trim(),
      idCatGeneros: this.academicoEditando.idCatGeneros!,
      idCatNacionalidad: this.academicoEditando.idCatNacionalidad!,
      institucion: this.academicoEditando.institucion!.trim(),
      idPRODEP: this.academicoEditando.idPRODEP!,
      cuentaUV: this.academicoEditando.cuentaUV?.trim() || null,
      baja: this.academicoEditando.baja || false,
      fechaBaja: this.academicoEditando.fechaBaja || null,
      observaciones: this.academicoEditando.observaciones?.trim() || null,
      idCatMotivos: this.academicoEditando.idCatMotivos || 1
    };

    this.updating = true;

    this.http.put<any>(`${this.backendUrl}/${this.editando.idSUPA}`, academicoData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar académico:', error);
          
          if (error.status === 500 || error.status === 204) {
            this.mostrarMensaje('Académico actualizado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarCatalogos();
              this.cancelarEdicion();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al actualizar el académico';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un académico con estos datos';
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
            
            this.mostrarMensaje('Académico actualizado exitosamente', 'snackBar-dialog');
            this.cancelarEdicion();
            this.cargarCatalogos();
          }
        }
      });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.academicoEditando = {};
  }

  eliminarAcademico(id: number): void {
    const academico = this.academicos.find(a => a.idSUPA === id);
    if (!academico) return;

    const nombreCompleto = `${academico.nombre} ${academico.paterno || ''} ${academico.materno || ''}`.trim();
    const confirmacion = confirm(
      `¿Está seguro de que desea eliminar al académico "${nombreCompleto}"?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmacion) return;

    this.deleting = true;

    this.http.delete<any>(`${this.backendUrl}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.deleting = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar académico:', error);
          
          if (error.status === 500 || error.status === 204) {
            this.mostrarMensaje('Académico eliminado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarCatalogos();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al eliminar el académico';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'No se puede eliminar el académico porque está siendo utilizado';
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
            
            this.mostrarMensaje(`Académico "${nombreCompleto}" eliminado exitosamente`, 'snackBar-dialog');
            
            if (this.editando?.idSUPA === id) {
              this.cancelarEdicion();
            }
            
            this.cargarCatalogos();
          }
        }
      });
  }

  filtrarAcademicos(): void {
    if (!this.searchTerm.trim()) {
      this.academicosFiltered = [...this.academicos];
    } else {
      const termino = this.searchTerm.toLowerCase().trim();
      this.academicosFiltered = this.academicos.filter(academico => {
        const nombreCompleto = `${academico.nombre} ${academico.paterno || ''} ${academico.materno || ''}`.toLowerCase();
        const genero = academico.idCatGenerosNavigation?.dGenero || '';  // ✅ dGenero con mayúscula
        const nacionalidad = academico.idCatNacionalidadNavigation?.dNacionalidad || '';  // ✅ dNacionalidad con mayúscula
        
        return academico.curp.toLowerCase().includes(termino) ||
               nombreCompleto.includes(termino) ||
               academico.np.toString().includes(termino) ||
               (academico.cuentaUV?.toLowerCase().includes(termino) || false) ||
               genero.toLowerCase().includes(termino) ||
               nacionalidad.toLowerCase().includes(termino) ||
               academico.idSUPA.toString().includes(termino);
      });
    }
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtrarAcademicos();
  }

  private validarFormulario(): boolean {
    if (!this.nuevoAcademico.curp?.trim()) {
      this.mostrarMensaje('El CURP es requerido', 'snackBar-dialog-Warning');
      return false;
    }

    if (this.nuevoAcademico.curp.trim().length !== 18) {
      this.mostrarMensaje('El CURP debe tener 18 caracteres', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.nuevoAcademico.np) {
      this.mostrarMensaje('El número de personal (NP) es requerido', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.nuevoAcademico.nombre?.trim()) {
      this.mostrarMensaje('El nombre es requerido', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.nuevoAcademico.idCatGeneros) {
      this.mostrarMensaje('Debe seleccionar un género', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.nuevoAcademico.idCatNacionalidad) {
      this.mostrarMensaje('Debe seleccionar una nacionalidad', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.nuevoAcademico.idPRODEP) {
      this.mostrarMensaje('El ID PRODEP es requerido', 'snackBar-dialog-Warning');
      return false;
    }

    return true;
  }

  private validarFormularioEdicion(): boolean {
    if (!this.academicoEditando.curp?.trim()) {
      this.mostrarMensaje('El CURP es requerido', 'snackBar-dialog-Warning');
      return false;
    }

    if (this.academicoEditando.curp.trim().length !== 18) {
      this.mostrarMensaje('El CURP debe tener 18 caracteres', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.academicoEditando.np) {
      this.mostrarMensaje('El número de personal (NP) es requerido', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.academicoEditando.nombre?.trim()) {
      this.mostrarMensaje('El nombre es requerido', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.academicoEditando.idCatGeneros) {
      this.mostrarMensaje('Debe seleccionar un género', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.academicoEditando.idCatNacionalidad) {
      this.mostrarMensaje('Debe seleccionar una nacionalidad', 'snackBar-dialog-Warning');
      return false;
    }

    if (!this.academicoEditando.idPRODEP) {
      this.mostrarMensaje('El ID PRODEP es requerido', 'snackBar-dialog-Warning');
      return false;
    }

    return true;
  }

  private mostrarMensaje(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  getNombreGenero(idGenero: number): string {
    const genero = this.generos.find(g => g.idCatGeneros === idGenero);
    return genero ? genero.dGenero : 'N/A';  // ✅ dGenero con mayúscula
  }

  getNombreNacionalidad(idNacionalidad: number): string {
    const nacionalidad = this.nacionalidades.find(n => n.idCatNacionalidad === idNacionalidad);
    return nacionalidad ? nacionalidad.dNacionalidad : 'N/A';  // ✅ dNacionalidad con mayúscula
  }

  getNombreMotivo(idMotivo: number): string {
    const motivo = this.motivos.find(m => m.idCatMotivos === idMotivo);
    return motivo ? motivo.dMotivos : 'N/A';  // ✅ dMotivos (plural) con mayúscula
  }

  trackByAcademicoId(index: number, academico: SUPAAcademicos): number {
    return academico.idSUPA;
  }

  get formularioValido(): boolean {
    return !!(
      this.nuevoAcademico.curp?.trim() && 
      this.nuevoAcademico.curp.trim().length === 18 &&
      this.nuevoAcademico.np &&
      this.nuevoAcademico.nombre?.trim() &&
      this.nuevoAcademico.idCatGeneros &&
      this.nuevoAcademico.idCatNacionalidad &&
      this.nuevoAcademico.idPRODEP
    );
  }

  get puedeEditar(): boolean {
    return !this.editando && !this.loadingCatalogos && !this.creating && !this.updating && !this.deleting;
  }

  get estaCargandoAlgo(): boolean {
    return this.loadingCatalogos || this.creating || this.updating || this.deleting;
  }
}