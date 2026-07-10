import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  IonBadge,
  IonButton,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonSelect,
  IonSelectOption,
  IonToolbar,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  addOutline,
  calendarOutline,
  checkmarkCircleOutline,
  closeOutline,
  createOutline,
  schoolOutline,
  trashOutline,
} from 'ionicons/icons';

import { Subscription } from 'rxjs';

import {
  PrioridadTarea,
  Tarea,
} from '../../models/tarea.model';

import { TareasService } from '../../services/tareas.service';

type FiltroTarea =
  | 'todas'
  | 'pendientes'
  | 'completadas';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.page.html',
  styleUrls: ['./tareas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    IonButton,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonList,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonBadge,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonRefresher,
    IonRefresherContent,
    IonFab,
    IonFabButton,
  ],
})
export class TareasPage
  implements OnInit, OnDestroy {

  tareas: Tarea[] = [];
  filtroActivo: FiltroTarea = 'todas';
  mostrarFormulario = false;

  nuevaTarea = {
    titulo: '',
    materia: '',
    fecha: '',
    prioridad: 'media' as PrioridadTarea,
  };

  private suscripcion?: Subscription;

  constructor(
    private tareasService: TareasService
  ) {
    addIcons({
      addOutline,
      calendarOutline,
      checkmarkCircleOutline,
      closeOutline,
      createOutline,
      schoolOutline,
      trashOutline,
    });
  }

  ngOnInit(): void {
    this.suscripcion =
      this.tareasService.tareas$.subscribe(
        (tareas: Tarea[]) => {
          this.tareas = tareas;
        }
      );
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  get tareasFiltradas(): Tarea[] {
    if (this.filtroActivo === 'pendientes') {
      return this.tareas.filter(
        (tarea) => !tarea.completada
      );
    }

    if (this.filtroActivo === 'completadas') {
      return this.tareas.filter(
        (tarea) => tarea.completada
      );
    }

    return this.tareas;
  }

  get cantidadPendientes(): number {
    return this.tareas.filter(
      (tarea) => !tarea.completada
    ).length;
  }

  cambiarFiltro(filtro: FiltroTarea): void {
    this.filtroActivo = filtro;
  }

  abrirFormulario(): void {
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.limpiarFormulario();
  }

  async guardarTarea(): Promise<void> {
    const titulo =
      this.nuevaTarea.titulo.trim();

    const materia =
      this.nuevaTarea.materia.trim();

    if (
      !titulo ||
      !materia ||
      !this.nuevaTarea.fecha
    ) {
      return;
    }

    try {
      await this.tareasService.agregarTarea(
        titulo,
        materia,
        this.nuevaTarea.fecha,
        this.nuevaTarea.prioridad
      );

      this.cerrarFormulario();
    } catch (error) {
      console.error(
        'No se pudo guardar la tarea:',
        error
      );
    }
  }

  async cambiarEstado(
    tarea: Tarea
  ): Promise<void> {
    try {
      await this.tareasService.cambiarEstado(
        tarea.id
      );
    } catch (error) {
      console.error(
        'No se pudo cambiar el estado:',
        error
      );
    }
  }

  async eliminarTarea(
    id: number,
    slidingItem: IonItemSliding
  ): Promise<void> {
    try {
      await this.tareasService.eliminarTarea(id);
      await slidingItem.close();
    } catch (error) {
      console.error(
        'No se pudo eliminar la tarea:',
        error
      );
    }
  }

  recargar(event: CustomEvent): void {
    setTimeout(() => {
      (
        event.target as HTMLIonRefresherElement
      ).complete();
    }, 600);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) {
      return 'Sin fecha';
    }

    const fechaLocal = new Date(
      `${fecha}T00:00:00`
    );

    return fechaLocal.toLocaleDateString(
      'es-DO',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    );
  }

  textoPrioridad(
    prioridad: PrioridadTarea
  ): string {
    const nombres: Record<
      PrioridadTarea,
      string
    > = {
      alta: 'Alta',
      media: 'Media',
      baja: 'Baja',
    };

    return nombres[prioridad];
  }

  private limpiarFormulario(): void {
    this.nuevaTarea = {
      titulo: '',
      materia: '',
      fecha: '',
      prioridad: 'media',
    };
  }
}