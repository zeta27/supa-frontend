// cat-roles.component.ts
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

interface SUPACatRoles {
  idCatRol: number;
  dRol: string;
}

@Component({
  selector: 'app-cat-roles',
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
  templateUrl: './cat-roles.component.html',
  styleUrls: ['./cat-roles.component.scss']
})
export class CatRolesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private backendUrl = 'http://148.226.168.138/SUPA/api/SUPACatRoles';

  // Data properties
  roles: SUPACatRoles[] = [];
  rolesFiltered: SUPACatRoles[] = [];
  nuevoRol: Partial<SUPACatRoles> = {};
  editando: SUPACatRoles | null = null;
  rolEditando: Partial<SUPACatRoles> = {};

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
    this.cargarRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  crearRol(): void {
    if (!this.nuevoRol.dRol?.trim()) {
      this.mostrarMensaje('El nombre del rol es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const rolData = {
      dRol: this.nuevoRol.dRol.trim()
    };

    this.creating = true;

    this.http.post<SUPACatRoles>(this.backendUrl, rolData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.creating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear rol:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Rol creado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarRoles();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al crear el rol';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un rol con este nombre';
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
            
            this.mostrarMensaje('Rol creado exitosamente', 'snackBar-dialog');
            this.nuevoRol = {};
            this.cargarRoles();
          }
        }
      });
  }

  prepararEdicion(rol: SUPACatRoles): void {
    if (this.editando) {
      this.cancelarEdicion();
    }
    
    this.editando = { ...rol };
    this.rolEditando = { 
      dRol: rol.dRol
    };
    
    setTimeout(() => {
      const input = document.querySelector('.inline-edit-field input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  actualizarRol(): void {
    if (!this.editando || !this.rolEditando.dRol?.trim()) {
      this.mostrarMensaje('El nombre del rol es requerido', 'snackBar-dialog-Warning');
      return;
    }

    const rolData = {
      dRol: this.rolEditando.dRol.trim()
    };

    this.updating = true;

    this.http.put<any>(`${this.backendUrl}/${this.editando.idCatRol}`, rolData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updating = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar rol:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Rol actualizado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarRoles();
              this.cancelarEdicion();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al actualizar el rol';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'Ya existe un rol con este nombre';
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
            
            this.mostrarMensaje('Rol actualizado exitosamente', 'snackBar-dialog');
            this.cancelarEdicion();
            this.cargarRoles();
          }
        }
      });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.rolEditando = {};
  }

  cargarRoles(): void {
    this.loading = true;
    
    this.http.get<SUPACatRoles[]>(this.backendUrl)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar roles:', error);
          let mensaje = 'Error al cargar los roles';
          
          if (error.status === 0) {
            mensaje = 'Error de conexión con el servidor';
          }
          
          this.mostrarMensaje(mensaje, 'snackBar-dialog-Error');
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.roles = data;
          this.filtrarRoles();
        }
      });
  }

  eliminarRol(id: number): void {
    const rol = this.roles.find(r => r.idCatRol === id);
    if (!rol) return;

    const confirmacion = confirm(`¿Está seguro de que desea eliminar el rol "${rol.dRol}"?\n\nEsta acción no se puede deshacer.`);
    if (!confirmacion) return;

    this.deleting = true;

    this.http.delete<any>(`${this.backendUrl}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.deleting = false),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar rol:', error);
          
          if (error.status === 500) {
            this.mostrarMensaje('Rol eliminado exitosamente', 'snackBar-dialog');
            
            timer(1000).subscribe(() => {
              this.cargarRoles();
            });
            
            return of({ success: true });
          } else {
            let mensaje = 'Error al eliminar el rol';
            
            if (error.status === 409 || error.status === 400) {
              mensaje = 'No se puede eliminar el rol porque está siendo utilizado por otros registros';
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
            
            this.mostrarMensaje(`Rol "${rol.dRol}" eliminado exitosamente`, 'snackBar-dialog');
            
            if (this.editando?.idCatRol === id) {
              this.cancelarEdicion();
            }
            
            this.cargarRoles();
          }
        }
      });
  }

  filtrarRoles(): void {
    if (!this.searchTerm.trim()) {
      this.rolesFiltered = [...this.roles];
    } else {
      const termino = this.searchTerm.toLowerCase().trim();
      this.rolesFiltered = this.roles.filter(rol =>
        rol.dRol.toLowerCase().includes(termino) ||
        rol.idCatRol.toString().includes(termino)
      );
    }
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtrarRoles();
  }

  private mostrarMensaje(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  trackByRolId(index: number, rol: SUPACatRoles): number {
    return rol.idCatRol;
  }

  get formularioValido(): boolean {
    return !!(this.nuevoRol.dRol?.trim() && 
              this.nuevoRol.dRol.trim().length >= 1 && 
              this.nuevoRol.dRol.trim().length <= 15);
  }

  get puedeEditar(): boolean {
    return !this.editando && !this.loading && !this.creating && !this.updating && !this.deleting;
  }

  get estaCargandoAlgo(): boolean {
    return this.loading || this.creating || this.updating || this.deleting;
  }
}