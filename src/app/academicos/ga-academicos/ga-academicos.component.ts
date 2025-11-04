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

export interface SUPAACADAcademicos {
    idSUPA: number;
    curp: string;
    np: number;
    paterno?: string | null;
    materno?: string | null;
    nombre: string;
    idCatGeneros: number;
    idCatNacionalidad: number;
    institucion: string;
    idPRODEP: number;
    cuentaUV?: string | null;
    baja: boolean;
    fechaBaja?: string | null;
    observaciones?: string | null;
    idCatMotivos: number;

    idCatGenerosNavigation?: any;
    idCatMotivosNavigation?: any;
    idCatNacionalidadNavigation?: any;

    supaApoyosEco?: any[];
    supaAreaDedica?: any[];
    supaCitas?: any[];
    supaContrataciones?: any[];
    supaDescargasA?: any[];
    supaDisciplinas?: any[];
    supaEntidades?: any[];
    supaEstudios?: any[];
    supaMiembrosCA?: any[];
    supaNivelesSNII?: any[];
    supaPlazas?: any[];
    supaVigenciaPerfiles?: any[];
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
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatSnackBarModule
    ],
    templateUrl: './ga-academicos.component.html',
    styleUrls: ['./ga-academicos.component.scss']
})

export class GaAcademicosComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    loading = false;
    creating = false;
    updating = false;
    loadingAcademicos = false;
    deleting = false;
    searchTerm = '';

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    crearAcademico(): void {

    }

    get estaCargandoAlgo(): boolean {
        return this.loadingAcademicos || this.creating || this.updating || this.deleting;
    }
}