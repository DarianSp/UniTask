import {
  Component,
  OnInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonSpinner,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  bluetoothOutline,
  cameraOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  notificationsOutline,
  personOutline,
  saveOutline,
  schoolOutline,
} from 'ionicons/icons';

import {
  Camera,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera';

import {
  DispositivoBluetooth,
  BluetoothService,
} from '../../services/bluetooth.service';

import { PerfilService } from '../../services/perfil.service';
import { PerfilUsuario } from '../../models/perfil.model';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    IonInput,
    IonButton,
    IonToggle,
    IonSpinner,
  ],
})
export class PerfilPage implements OnInit {
  perfil: PerfilUsuario = {
    nombre: '',
    matricula: '',
    carrera: '',
    correo: '',
    foto: '',
    temaOscuro: false,
    notificaciones: true,
  };

  cargandoPerfil = true;
  guardandoPerfil = false;
  buscandoBluetooth = false;
  conectandoBluetooth = false;

  mensajePerfil = '';
  mensajeBluetooth = '';

  dispositivo?: DispositivoBluetooth;

  constructor(
    private perfilService: PerfilService,
    private bluetoothService: BluetoothService
  ) {
    addIcons({
      bluetoothOutline,
      cameraOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      notificationsOutline,
      personOutline,
      saveOutline,
      schoolOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.cargarPerfil();
  }

  async cargarPerfil(): Promise<void> {
    this.cargandoPerfil = true;

    try {
      this.perfil =
        await this.perfilService.obtenerPerfil();

      this.aplicarTema();
    } finally {
      this.cargandoPerfil = false;
    }
  }

  async guardarPerfil(): Promise<void> {
    if (!this.perfil.nombre.trim()) {
      this.mensajePerfil =
        'Debes escribir tu nombre.';
      return;
    }

    this.guardandoPerfil = true;
    this.mensajePerfil = '';

    try {
      await this.perfilService.guardarPerfil(
        this.perfil
      );

      this.aplicarTema();

      this.mensajePerfil =
        'Perfil guardado correctamente.';
    } catch (error) {
      console.error(
        'No se pudo guardar el perfil:',
        error
      );

      this.mensajePerfil =
        'No se pudo guardar el perfil.';
    } finally {
      this.guardandoPerfil = false;
    }
  }

  async seleccionarFoto(): Promise<void> {
    this.mensajePerfil = '';

    try {
      const foto = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        correctOrientation: true,
      });

      if (foto.dataUrl) {
        this.perfil.foto = foto.dataUrl;

        this.mensajePerfil =
          'Foto de perfil seleccionada.';
      }
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : '';

      if (!mensaje.toLowerCase().includes('cancel')) {
        console.error(
          'No se pudo seleccionar la foto:',
          error
        );

        this.mensajePerfil =
          'No se pudo seleccionar la foto.';
      }
    }
  }

  eliminarFoto(): void {
    this.perfil.foto = '';
    this.mensajePerfil = '';
  }

  async cambiarTema(): Promise<void> {
  this.aplicarTema();

  try {
    await this.perfilService.guardarPerfil(
      this.perfil
    );
  } catch (error) {
    console.error(
      'No se pudo guardar el tema:',
      error
    );
  }
}

  async seleccionarDispositivoBle(): Promise<void> {
    this.buscandoBluetooth = true;
    this.mensajeBluetooth = '';

    try {
      const disponible =
        await this.bluetoothService.bluetoothDisponible();

      if (!disponible) {
        this.mensajeBluetooth =
          'Bluetooth no está disponible o está apagado.';
        return;
      }

      this.dispositivo =
        await this.bluetoothService.seleccionarDispositivo();

      this.mensajeBluetooth =
        `Dispositivo seleccionado: ${this.dispositivo.nombre}`;
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : 'No se pudo seleccionar el dispositivo.';

      if (mensaje.toLowerCase().includes('cancel')) {
        this.mensajeBluetooth =
          'La selección fue cancelada.';
      } else {
        console.error(
          'Error seleccionando dispositivo BLE:',
          error
        );

        this.mensajeBluetooth = mensaje;
      }
    } finally {
      this.buscandoBluetooth = false;
    }
  }

  async conectarDispositivo(): Promise<void> {
    if (!this.dispositivo) {
      return;
    }

    this.conectandoBluetooth = true;
    this.mensajeBluetooth = '';

    try {
      await this.bluetoothService.conectar(
        this.dispositivo.id
      );

      this.dispositivo = {
        ...this.dispositivo,
        conectado: true,
      };

      this.mensajeBluetooth =
        'Dispositivo BLE conectado correctamente.';
    } catch (error) {
      console.error(
        'No se pudo conectar el dispositivo:',
        error
      );

      this.mensajeBluetooth =
        error instanceof Error
          ? error.message
          : 'No se pudo conectar el dispositivo.';
    } finally {
      this.conectandoBluetooth = false;
    }
  }

  async desconectarDispositivo(): Promise<void> {
    if (!this.dispositivo) {
      return;
    }

    try {
      await this.bluetoothService.desconectar(
        this.dispositivo.id
      );

      this.dispositivo = {
        ...this.dispositivo,
        conectado: false,
      };

      this.mensajeBluetooth =
        'Dispositivo desconectado.';
    } catch (error) {
      console.error(
        'No se pudo desconectar:',
        error
      );

      this.mensajeBluetooth =
        'No se pudo desconectar el dispositivo.';
    }
  }

  private aplicarTema(): void {
  document.documentElement.classList.toggle(
    'ion-palette-dark',
    this.perfil.temaOscuro
  );
}
}