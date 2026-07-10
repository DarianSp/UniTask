import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  PrioridadTarea,
  Tarea,
} from '../models/tarea.model';

import {
  STORAGE_KEYS,
} from '../core/constants/app.constants';

import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class TareasService {
  private tareasSubject =
    new BehaviorSubject<Tarea[]>([]);

  tareas$ = this.tareasSubject.asObservable();

  constructor(
    private storageService: StorageService
  ) {
    void this.inicializar();
  }

  obtenerTareas(): Tarea[] {
    return this.tareasSubject.value;
  }

  async agregarTarea(
    titulo: string,
    materia: string,
    fecha: string,
    prioridad: PrioridadTarea
  ): Promise<void> {
    const nuevaTarea: Tarea = {
      id: Date.now(),
      titulo: titulo.trim(),
      materia: materia.trim(),
      fecha,
      prioridad,
      completada: false,
      creadaEn: new Date().toISOString(),
    };

    const tareasActualizadas = [
      nuevaTarea,
      ...this.tareasSubject.value,
    ];

    await this.actualizarTareas(
      tareasActualizadas
    );
  }

  async cambiarEstado(id: number): Promise<void> {
    const tareasActualizadas =
      this.tareasSubject.value.map((tarea) =>
        tarea.id === id
          ? {
              ...tarea,
              completada: !tarea.completada,
            }
          : tarea
      );

    await this.actualizarTareas(
      tareasActualizadas
    );
  }

  async eliminarTarea(id: number): Promise<void> {
    const tareasActualizadas =
      this.tareasSubject.value.filter(
        (tarea) => tarea.id !== id
      );

    await this.actualizarTareas(
      tareasActualizadas
    );
  }

  private async inicializar(): Promise<void> {
    try {
      const tareasGuardadas =
        await this.storageService.obtener<Tarea[]>(
          STORAGE_KEYS.tareas
        );

      if (
        tareasGuardadas &&
        tareasGuardadas.length > 0
      ) {
        this.tareasSubject.next(
          tareasGuardadas
        );

        return;
      }

      const tareasIniciales =
        this.obtenerTareasIniciales();

      await this.actualizarTareas(
        tareasIniciales
      );
    } catch (error) {
      console.error(
        'No se pudieron cargar las tareas:',
        error
      );

      this.tareasSubject.next(
        this.obtenerTareasIniciales()
      );
    }
  }

  private async actualizarTareas(
    tareas: Tarea[]
  ): Promise<void> {
    try {
      await this.storageService.guardar(
        STORAGE_KEYS.tareas,
        tareas
      );

      this.tareasSubject.next(tareas);
    } catch (error) {
      console.error(
        'No se pudieron guardar las tareas:',
        error
      );

      throw error;
    }
  }

  private obtenerTareasIniciales(): Tarea[] {
  return [];
}
}