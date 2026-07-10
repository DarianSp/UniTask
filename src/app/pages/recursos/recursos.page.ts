import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import {
  NoticiasListaComponent,
} from '../../components/noticias-lista/noticias-lista.component';

import { CommonModule } from '@angular/common';

import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonRange,
  IonSpinner,
  IonToolbar,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  cameraOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  copyOutline,
  imageOutline,
  locateOutline,
  mapOutline,
  musicalNotesOutline,
  pauseOutline,
  playOutline,
  qrCodeOutline,
  refreshOutline,
  scanOutline,
  stopOutline,
} from 'ionicons/icons';

import {
  Camera,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera';

import { Capacitor } from '@capacitor/core';

import {
  BarcodeFormat,
  BarcodeScanner,
} from '@capacitor-mlkit/barcode-scanning';

import * as L from 'leaflet';

import { GeolocationService } from '../../services/geolocation.service';
import { MAP_CONFIG } from '../../core/constants/app.constants';
import { Podcast } from '../../models/podcast.model';

@Component({
  selector: 'app-recursos',
  templateUrl: './recursos.page.html',
  styleUrls: ['./recursos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    IonButton,
    IonSpinner,
    IonRange,
    NoticiasListaComponent,
  ],
})
export class RecursosPage implements OnDestroy {
  @ViewChild('qrFileInput')
  qrFileInput?: ElementRef<HTMLInputElement>;

  cargandoUbicacion = false;
  cargandoCamara = false;
  escaneandoQr = false;

  mensajeError = '';
  mensajeCamara = '';
  mensajeQr = '';
  mensajePodcast = '';

  latitud?: number;
  longitud?: number;

  fotoApunte?: string;
  resultadoQr = '';

  podcasts: Podcast[] = [
    {
      id: 1,
      titulo: 'Introducción a Ionic',
      descripcion:
        'Conceptos fundamentales para crear aplicaciones móviles híbridas.',
      categoria: 'Desarrollo móvil',
      duracionTexto: '08:30',
      archivo: 'assets/audio/podcast-ionic.mp3',
    },
    {
      id: 2,
      titulo: 'Componentes modernos de Angular',
      descripcion:
        'Standalone Components, servicios y organización profesional.',
      categoria: 'Angular',
      duracionTexto: '10:15',
      archivo: 'assets/audio/podcast-angular.mp3',
    },
    {
      id: 3,
      titulo: 'Productividad académica',
      descripcion:
        'Consejos prácticos para organizar tareas y entregas.',
      categoria: 'Organización',
      duracionTexto: '06:45',
      archivo: 'assets/audio/podcast-productividad.mp3',
    },
  ];

  podcastActual?: Podcast;
  reproduciendoPodcast = false;
  tiempoPodcast = 0;
  duracionPodcast = 0;

  private mapa?: L.Map;
  private marcadorUsuario?: L.Marker;
  private reproductorAudio = new Audio();

  constructor(
    private geolocationService: GeolocationService
  ) {
    addIcons({
      cameraOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      copyOutline,
      imageOutline,
      locateOutline,
      mapOutline,
      musicalNotesOutline,
      pauseOutline,
      playOutline,
      qrCodeOutline,
      refreshOutline,
      scanOutline,
      stopOutline,
    });

    this.configurarReproductor();
  }

  ionViewDidEnter(): void {
    if (!this.mapa) {
      this.inicializarMapa();
    }

    setTimeout(() => {
      this.mapa?.invalidateSize({
        pan: false,
      });
    }, 400);
  }

  ngOnDestroy(): void {
    this.mapa?.remove();

    this.reproductorAudio.pause();
    this.reproductorAudio.src = '';
    this.reproductorAudio.load();
  }

  async escanearQr(): Promise<void> {
    this.mensajeQr = '';
    this.resultadoQr = '';

    if (!Capacitor.isNativePlatform()) {
      this.qrFileInput?.nativeElement.click();
      return;
    }

    this.escaneandoQr = true;

    try {
      if (Capacitor.getPlatform() === 'android') {
        const modulo =
          await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();

        if (!modulo.available) {
          await BarcodeScanner.installGoogleBarcodeScannerModule();

          this.mensajeQr =
            'Se está instalando el módulo del escáner. Intenta nuevamente en unos segundos.';
          return;
        }
      }

      const resultado = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
        autoZoom: true,
      });

      const codigo = resultado.barcodes[0];

      if (!codigo) {
        this.mensajeQr = 'No se detectó ningún código QR.';
        return;
      }

      this.resultadoQr =
        codigo.rawValue ||
        codigo.displayValue ||
        'Código QR detectado sin contenido de texto';

      this.mensajeQr =
        'Código QR escaneado correctamente.';
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : 'No se pudo escanear el código QR.';

      if (mensaje.toLowerCase().includes('cancel')) {
        this.mensajeQr = 'El escaneo fue cancelado.';
      } else {
        console.error('Error al escanear QR:', error);
        this.mensajeQr = mensaje;
      }
    } finally {
      this.escaneandoQr = false;
    }
  }

  async leerQrDesdeImagen(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    this.escaneandoQr = true;
    this.mensajeQr = '';
    this.resultadoQr = '';

    try {
      const resultado =
        await BarcodeScanner.readBarcodesFromImage({
          blob: archivo,
        });

      const codigo = resultado.barcodes[0];

      if (!codigo) {
        this.mensajeQr =
          'No se encontró un código QR en la imagen seleccionada.';
        return;
      }

      this.resultadoQr =
        codigo.rawValue ||
        codigo.displayValue ||
        'Código QR detectado sin contenido de texto';

      this.mensajeQr =
        'Código QR leído correctamente desde la imagen.';
    } catch (error) {
      console.error('Error al leer el código QR:', error);

      this.mensajeQr =
        error instanceof Error
          ? error.message
          : 'No se pudo analizar la imagen.';
    } finally {
      this.escaneandoQr = false;
      input.value = '';
    }
  }

  async copiarResultadoQr(): Promise<void> {
    if (!this.resultadoQr) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        this.resultadoQr
      );

      this.mensajeQr =
        'Contenido copiado al portapapeles.';
    } catch (error) {
      console.error(
        'No se pudo copiar el resultado:',
        error
      );

      this.mensajeQr =
        'No se pudo copiar el contenido.';
    }
  }

  limpiarResultadoQr(): void {
    this.resultadoQr = '';
    this.mensajeQr = '';
  }

  irAPodcasts(seccion: HTMLElement): void {
    seccion.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  async reproducirPodcast(podcast: Podcast): Promise<void> {
    this.mensajePodcast = '';

    try {
      if (this.podcastActual?.id !== podcast.id) {
        this.reproductorAudio.pause();
        this.reproductorAudio.src = podcast.archivo;
        this.reproductorAudio.load();

        this.podcastActual = podcast;
        this.tiempoPodcast = 0;
        this.duracionPodcast = 0;
      }

      if (this.reproductorAudio.paused) {
        await this.reproductorAudio.play();
      } else {
        this.reproductorAudio.pause();
      }
    } catch (error) {
      console.error(
        'No se pudo reproducir el podcast:',
        error
      );

      this.mensajePodcast =
        'No se encontró el audio. Verifica que el archivo exista en src/assets/audio.';
    }
  }

  pausarPodcast(): void {
    this.reproductorAudio.pause();
  }

  detenerPodcast(): void {
    this.reproductorAudio.pause();
    this.reproductorAudio.currentTime = 0;

    this.tiempoPodcast = 0;
    this.reproduciendoPodcast = false;
  }

  cambiarProgreso(event: CustomEvent): void {
    const valor = Number(event.detail.value);

    if (
      Number.isFinite(valor) &&
      Number.isFinite(this.reproductorAudio.duration)
    ) {
      this.reproductorAudio.currentTime = valor;
    }
  }

  formatearTiempo(segundos: number): string {
    if (!Number.isFinite(segundos) || segundos < 0) {
      return '00:00';
    }

    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = Math.floor(
      segundos % 60
    );

    return `${minutos
      .toString()
      .padStart(2, '0')}:${segundosRestantes
        .toString()
        .padStart(2, '0')}`;
  }

  esPodcastActual(podcast: Podcast): boolean {
    return this.podcastActual?.id === podcast.id;
  }

  async obtenerMiUbicacion(): Promise<void> {
    this.cargandoUbicacion = true;
    this.mensajeError = '';

    try {
      const posicion =
        await this.geolocationService.obtenerUbicacionActual();

      this.latitud = posicion.coords.latitude;
      this.longitud = posicion.coords.longitude;

      this.mostrarUbicacionEnMapa(
        this.latitud,
        this.longitud
      );
    } catch (error) {
      console.error(
        'No se pudo obtener la ubicación:',
        error
      );

      this.mensajeError =
        error instanceof Error
          ? error.message
          : 'No fue posible obtener la ubicación actual.';
    } finally {
      this.cargandoUbicacion = false;
    }
  }

  async tomarFoto(): Promise<void> {
    await this.obtenerImagen(CameraSource.Camera);
  }

  async elegirImagen(): Promise<void> {
    await this.obtenerImagen(CameraSource.Photos);
  }

  eliminarFoto(): void {
    this.fotoApunte = undefined;
    this.mensajeCamara = '';
  }

  private async obtenerImagen(
    origen: CameraSource
  ): Promise<void> {
    this.cargandoCamara = true;
    this.mensajeCamara = '';

    try {
      const foto = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: origen,
        saveToGallery: false,
        correctOrientation: true,
      });

      if (!foto.dataUrl) {
        throw new Error(
          'La imagen no pudo procesarse correctamente.'
        );
      }

      this.fotoApunte = foto.dataUrl;

      this.mensajeCamara =
        origen === CameraSource.Camera
          ? 'La fotografía fue capturada correctamente.'
          : 'La imagen fue seleccionada correctamente.';
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : 'No se pudo obtener la imagen.';

      if (
        mensaje.toLowerCase().includes('cancel') ||
        mensaje
          .toLowerCase()
          .includes('user cancelled')
      ) {
        this.mensajeCamara =
          'La operación fue cancelada.';
      } else {
        console.error('Error de cámara:', error);
        this.mensajeCamara = mensaje;
      }
    } finally {
      this.cargandoCamara = false;
    }
  }

  private configurarReproductor(): void {
    this.reproductorAudio.addEventListener(
      'loadedmetadata',
      () => {
        this.duracionPodcast = Number.isFinite(
          this.reproductorAudio.duration
        )
          ? this.reproductorAudio.duration
          : 0;
      }
    );

    this.reproductorAudio.addEventListener(
      'timeupdate',
      () => {
        this.tiempoPodcast =
          this.reproductorAudio.currentTime;
      }
    );

    this.reproductorAudio.addEventListener(
      'play',
      () => {
        this.reproduciendoPodcast = true;
      }
    );

    this.reproductorAudio.addEventListener(
      'pause',
      () => {
        this.reproduciendoPodcast = false;
      }
    );

    this.reproductorAudio.addEventListener(
      'ended',
      () => {
        this.reproduciendoPodcast = false;
        this.tiempoPodcast = 0;
        this.reproductorAudio.currentTime = 0;
      }
    );

    this.reproductorAudio.addEventListener(
      'error',
      () => {
        this.reproduciendoPodcast = false;
        this.mensajePodcast =
          'No fue posible cargar el archivo de audio.';
      }
    );
  }

  private inicializarMapa(): void {
    if (this.mapa) {
      return;
    }

    const ubicacionInicial: L.LatLngExpression = [
      MAP_CONFIG.latitudInicial,
      MAP_CONFIG.longitudInicial,
    ];

    this.mapa = L.map('mapa-recursos', {
      center: ubicacionInicial,
      zoom: MAP_CONFIG.zoomInicial,
      zoomControl: true,
    });

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution:
          '&copy; OpenStreetMap contributors',
      }
    ).addTo(this.mapa);

    L.marker(ubicacionInicial)
      .addTo(this.mapa)
      .bindPopup('Ubicación inicial');
  }

  private mostrarUbicacionEnMapa(
    latitud: number,
    longitud: number
  ): void {
    if (!this.mapa) {
      return;
    }

    const coordenadas: L.LatLngExpression = [
      latitud,
      longitud,
    ];

    if (this.marcadorUsuario) {
      this.marcadorUsuario.setLatLng(coordenadas);
    } else {
      this.marcadorUsuario = L.marker(coordenadas)
        .addTo(this.mapa)
        .bindPopup('Tu ubicación actual');
    }

    this.marcadorUsuario.openPopup();

    this.mapa.setView(
      coordenadas,
      MAP_CONFIG.zoomUbicacion
    );

  }

}