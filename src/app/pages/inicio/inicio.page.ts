import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { Router } from '@angular/router';

import {
  IonBadge,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  addOutline,
  bookOutline,
  calendarOutline,
  checkmarkCircleOutline,
  locationOutline,
  notificationsOutline,
  qrCodeOutline,
  timeOutline,
} from 'ionicons/icons';

import { Subscription } from 'rxjs';

import { Tarea } from '../../models/tarea.model';
import { TareasService } from '../../services/tareas.service';
import { PerfilService } from '../../services/perfil.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonIcon,
    IonButton,
    IonBadge,
    IonProgressBar,
  ],
})
export class InicioPage implements OnInit, OnDestroy {
  nombreUsuario = 'Usuario';
  tareas: Tarea[] = [];
  mostrarNotificaciones = false;

  private suscripcion?: Subscription;

  constructor(
    private router: Router,
    private tareasService: TareasService,
    private perfilService: PerfilService
  ) {
    addIcons({
      notificationsOutline,
      addOutline,
      calendarOutline,
      qrCodeOutline,
      locationOutline,
      timeOutline,
      checkmarkCircleOutline,
      bookOutline,
    });
  }

  ngOnInit(): void {
    this.suscripcion =
      this.tareasService.tareas$.subscribe(
        (tareas: Tarea[]) => {
          this.tareas = tareas;
        }
      );

    void this.cargarPerfil();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.cargarPerfil();
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  get saludoActual(): string {
    const hora = new Date().getHours();

    if (hora < 12) {
      return 'Buenos días';
    }

    if (hora < 18) {
      return 'Buenas tardes';
    }

    return 'Buenas noches';
  }

  get fechaActual(): string {
    const fecha = new Date();

    const texto = fecha.toLocaleDateString('es-DO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  get tareasPendientes(): Tarea[] {
    return this.tareas.filter(
      (tarea) => !tarea.completada
    );
  }

  get tareasCompletadas(): Tarea[] {
    return this.tareas.filter(
      (tarea) => tarea.completada
    );
  }

  get cantidadPendientes(): number {
    return this.tareasPendientes.length;
  }

  get cantidadCompletadas(): number {
    return this.tareasCompletadas.length;
  }

  get cantidadTotal(): number {
    return this.tareas.length;
  }

  get porcentajeProgreso(): number {
    if (this.cantidadTotal === 0) {
      return 0;
    }

    return (
      this.cantidadCompletadas /
      this.cantidadTotal
    );
  }

  get porcentajeTexto(): number {
    return Math.round(
      this.porcentajeProgreso * 100
    );
  }

  get proximasTareas(): Tarea[] {
    return [...this.tareasPendientes]
      .sort(
        (a, b) =>
          new Date(
            `${a.fecha}T00:00:00`
          ).getTime() -
          new Date(
            `${b.fecha}T00:00:00`
          ).getTime()
      )
      .slice(0, 2);
  }

  get tareasEstaSemana(): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const finSemana = new Date(hoy);
    finSemana.setDate(
      hoy.getDate() + 7
    );

    return this.tareasPendientes.filter(
      (tarea) => {
        const fechaTarea = new Date(
          `${tarea.fecha}T00:00:00`
        );

        return (
          fechaTarea >= hoy &&
          fechaTarea <= finSemana
        );
      }
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

  colorPrioridad(tarea: Tarea): string {
    if (tarea.prioridad === 'alta') {
      return 'danger';
    }

    if (tarea.prioridad === 'media') {
      return 'warning';
    }

    return 'success';
  }

  textoPrioridad(tarea: Tarea): string {
    const textos = {
      alta: 'Alta',
      media: 'Media',
      baja: 'Baja',
    };

    return textos[tarea.prioridad];
  }

  irATareas(): void {
    this.router.navigate(['/tabs/tareas']);
  }

  irAAgenda(): void {
    this.router.navigate(['/tabs/agenda']);
  }

  irARecursos(): void {
    this.router.navigate(['/tabs/recursos']);
  }

  irAPerfil(): void {
    this.router.navigate(['/tabs/perfil']);
  }

  alternarNotificaciones(): void {
    this.mostrarNotificaciones =
      !this.mostrarNotificaciones;
  }

  cerrarNotificaciones(): void {
    this.mostrarNotificaciones = false;
  }

  private async cargarPerfil(): Promise<void> {
    const perfil =
      await this.perfilService.obtenerPerfil();

    this.nombreUsuario =
      perfil.nombre.trim() || 'Usuario';

    document.documentElement.classList.toggle(
      'ion-palette-dark',
      perfil.temaOscuro
    );
  }

}