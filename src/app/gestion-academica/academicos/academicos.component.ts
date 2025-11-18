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
 import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


import { Subject, takeUntil, finalize, catchError, of, timer } from 'rxjs';

export interface SUPAAcademicos {
  CURP: string;
  NP: number;
  Paterno?: string;
  Materno?: string;
  Nombre: string;
  IdCatGeneros: number;
  IdCatNacionalidad: number;
  Institucion: string;
  IdPRODEP: number;
  CuentaUV?: string;
  IdSUPA: number;
  Baja: boolean;
  FechaBaja?: Date;
  Observaciones?: string;
  IdCatMotivos: number;
  IdCatGenerosNavigation?: any;
  IdCatMotivosNavigation?: any;
  IdCatNacionalidadNavigation?: any;
}

@Component({
    selector: 'app-academicos',
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
        MatSelectModule
    ],
    templateUrl: './academicos.component.html',
    styleUrls: ['./academicos.component.scss']
})

export class GestionAcadAcademicos implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

}