import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

import {
  IonBadge,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
} from '@ionic/angular/standalone';

import { ConnectionStatus } from '@capacitor/network';
import { addIcons } from 'ionicons';

import {
  calendarOutline,
  checkmarkCircleOutline,
  cloudOfflineOutline,
  cloudOutline,
  schoolOutline,
  timeOutline,
  wifiOutline,
} from 'ionicons/icons';

import { Subscription } from 'rxjs';

import { Tarea } from '../../models/tarea.model';
import { NetworkService } from '../../services/network.service';
import { TareasService } from '../../services/tareas.service';

interface EventoAgenda {
  id: number;
  titulo: string;
  materia: string;
  fecha: string;
  hora: string;
  tipo: 'tarea' | 'examen' | 'reunion';
  completado: boolean;
}

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    IonBadge,
  ],
})
export class AgendaPage implements OnInit, OnDestroy {
  estadoConexion: ConnectionStatus = {
    connected: navigator.onLine,
    connectionType: 'unknown',
  };

  anioActual = 2026;
  mesActual = 6; // Julio: los meses comienzan en 0

  fechaSeleccionada = this.obtenerFechaLocal();

  eventos: EventoAgenda[] = [];

  private readonly eventosFijos: EventoAgenda[] = [
    {
      id: -1,
      titulo: 'Defensa individual del módulo',
      materia: 'Programación móvil',
      fecha: '2026-07-17',
      hora: '4:00 PM',
      tipo: 'examen',
      completado: false,
    },
    {
      id: -2,
      titulo: 'Reunión final del equipo',
      materia: 'Proyecto UniTask',
      fecha: '2026-07-14',
      hora: '6:00 PM',
      tipo: 'reunion',
      completado: false,
    },
  ];

  private readonly suscripciones =
    new Subscription();

  constructor(
    private networkService: NetworkService,
    private tareasService: TareasService
  ) {
    addIcons({
      calendarOutline,
      checkmarkCircleOutline,
      cloudOfflineOutline,
      cloudOutline,
      schoolOutline,
      timeOutline,
      wifiOutline,
    });
  }

  ngOnInit(): void {
    this.suscripciones.add(
      this.networkService.estado$.subscribe(
        (estado: ConnectionStatus) => {
          this.estadoConexion = estado;
        }
      )
    );

    this.suscripciones.add(
      this.tareasService.tareas$.subscribe(
        (tareas: Tarea[]) => {
          this.actualizarEventos(tareas);
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }

  get nombreMes(): string {
    return new Date(
      this.anioActual,
      this.mesActual,
      1
    ).toLocaleDateString('es-DO', {
      month: 'long',
      year: 'numeric',
    });
  }

  get diasCalendario(): Array<number | null> {
    const primerDia = new Date(
      this.anioActual,
      this.mesActual,
      1
    ).getDay();

    const espaciosIniciales =
      primerDia === 0 ? 6 : primerDia - 1;

    const cantidadDias = new Date(
      this.anioActual,
      this.mesActual + 1,
      0
    ).getDate();

    return [
      ...Array<number | null>(
        espaciosIniciales
      ).fill(null),

      ...Array.from(
        { length: cantidadDias },
        (_, indice) => indice + 1
      ),
    ];
  }

  get eventosSeleccionados(): EventoAgenda[] {
    return this.eventos.filter(
      (evento) =>
        evento.fecha === this.fechaSeleccionada
    );
  }

  get proximosEventos(): EventoAgenda[] {
    const hoy = this.obtenerFechaLocal();

    return [...this.eventos]
      .filter(
        (evento) =>
          evento.fecha >= hoy &&
          !evento.completado
      )
      .sort(
        (a, b) =>
          new Date(
            `${a.fecha}T00:00:00`
          ).getTime() -
          new Date(
            `${b.fecha}T00:00:00`
          ).getTime()
      );
  }

  seleccionarDia(dia: number | null): void {
    if (dia === null) {
      return;
    }

    this.fechaSeleccionada =
      this.crearFechaIso(dia);
  }

  esFechaSeleccionada(
    dia: number | null
  ): boolean {
    if (dia === null) {
      return false;
    }

    return (
      this.fechaSeleccionada ===
      this.crearFechaIso(dia)
    );
  }

  tieneEventos(dia: number | null): boolean {
    if (dia === null) {
      return false;
    }

    const fecha = this.crearFechaIso(dia);

    return this.eventos.some(
      (evento) => evento.fecha === fecha
    );
  }

  cantidadEventosDia(
    dia: number | null
  ): number {
    if (dia === null) {
      return 0;
    }

    const fecha = this.crearFechaIso(dia);

    return this.eventos.filter(
      (evento) => evento.fecha === fecha
    ).length;
  }

  formatearFecha(fecha: string): string {
    return new Date(
      `${fecha}T00:00:00`
    ).toLocaleDateString('es-DO', {
      day: 'numeric',
      month: 'long',
    });
  }

  textoConexion(): string {
    if (!this.estadoConexion.connected) {
      return 'Sin conexión';
    }

    if (
      this.estadoConexion.connectionType ===
      'wifi'
    ) {
      return 'Conectado por Wi-Fi';
    }

    if (
      this.estadoConexion.connectionType ===
      'cellular'
    ) {
      return 'Conectado por datos móviles';
    }

    return 'Conectado';
  }

  colorEvento(
    evento: EventoAgenda
  ): string {
    if (evento.tipo === 'examen') {
      return 'danger';
    }

    if (evento.tipo === 'reunion') {
      return 'warning';
    }

    return 'primary';
  }

  textoTipoEvento(
    evento: EventoAgenda
  ): string {
    if (evento.tipo === 'examen') {
      return 'Examen';
    }

    if (evento.tipo === 'reunion') {
      return 'Reunión';
    }

    return 'Tarea';
  }

  private actualizarEventos(
    tareas: Tarea[]
  ): void {
    const eventosTareas: EventoAgenda[] =
      tareas.map((tarea) => ({
        id: tarea.id,
        titulo: tarea.titulo,
        materia: tarea.materia,
        fecha: tarea.fecha,
        hora: '11:59 PM',
        tipo: 'tarea',
        completado: tarea.completada,
      }));

    this.eventos = [
      ...eventosTareas,
      ...this.eventosFijos,
    ];
  }

  private crearFechaIso(
    dia: number
  ): string {
    const mes = String(
      this.mesActual + 1
    ).padStart(2, '0');

    const diaFormateado = String(
      dia
    ).padStart(2, '0');

    return `${this.anioActual}-${mes}-${diaFormateado}`;
  }

  private obtenerFechaLocal(): string {
    const fecha = new Date();

    const anio = fecha.getFullYear();
    const mes = String(
      fecha.getMonth() + 1
    ).padStart(2, '0');

    const dia = String(
      fecha.getDate()
    ).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }
}