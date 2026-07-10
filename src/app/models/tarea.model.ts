export type PrioridadTarea = 'alta' | 'media' | 'baja';

export interface Tarea {
  id: number;
  titulo: string;
  materia: string;
  fecha: string;
  prioridad: PrioridadTarea;
  completada: boolean;
  creadaEn: string;
}