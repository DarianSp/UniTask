import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  alertCircleOutline,
  calendarOutline,
  newspaperOutline,
  refreshOutline,
} from 'ionicons/icons';

import {
  Subject,
  takeUntil,
} from 'rxjs';

import { Noticia } from '../../models/noticia.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-noticias-lista',
  templateUrl: './noticias-lista.component.html',
  styleUrls: ['./noticias-lista.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonIcon,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class NoticiasListaComponent
  implements OnInit, OnDestroy {

  noticias: Noticia[] = [];

  cargandoNoticias = false;
  mensajeErrorNoticias = '';

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService
  ) {
    addIcons({
      alertCircleOutline,
      calendarOutline,
      newspaperOutline,
      refreshOutline,
    });
  }

  ngOnInit(): void {
    this.cargarNoticias();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarNoticias(
    refresher?: HTMLIonRefresherElement
  ): void {
    this.cargandoNoticias = true;
    this.mensajeErrorNoticias = '';

    this.apiService
      .obtenerNoticias()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (noticias: Noticia[]) => {
          this.noticias = noticias;
          this.cargandoNoticias = false;
          refresher?.complete();
        },

        error: (error: unknown) => {
          console.error(
            'Error cargando noticias:',
            error
          );

          this.mensajeErrorNoticias =
            error instanceof Error
              ? error.message
              : 'No se pudieron cargar las noticias.';

          this.cargandoNoticias = false;
          refresher?.complete();
        },
      });
  }

  actualizarNoticias(event: CustomEvent): void {
    const refresher =
      event.target as HTMLIonRefresherElement;

    this.cargarNoticias(refresher);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString(
      'es-DO',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    );
  }

  abrirNoticia(noticia: Noticia): void {
  window.open(
    noticia.url,
    '_blank',
    'noopener,noreferrer'
  );
}
}