import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

import {
  BleClient,
  BleDevice,
} from '@capacitor-community/bluetooth-le';

export interface DispositivoBluetooth {
  id: string;
  nombre: string;
  conectado: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BluetoothService {
  private inicializado = false;

  async inicializar(): Promise<void> {
    if (this.inicializado) {
      return;
    }

    await BleClient.initialize({
      androidNeverForLocation: true,
    });

    this.inicializado = true;
  }

  async seleccionarDispositivo(): Promise<DispositivoBluetooth> {
    await this.inicializar();

    const dispositivo: BleDevice =
      await BleClient.requestDevice({
        optionalServices: [],
      });

    return {
      id: dispositivo.deviceId,
      nombre:
        dispositivo.name ||
        'Dispositivo BLE sin nombre',
      conectado: false,
    };
  }

  async conectar(
    dispositivoId: string
  ): Promise<void> {
    await this.inicializar();

    await BleClient.connect(
      dispositivoId,
      () => {
        console.log(
          `Dispositivo desconectado: ${dispositivoId}`
        );
      }
    );
  }

  async desconectar(
    dispositivoId: string
  ): Promise<void> {
    await BleClient.disconnect(dispositivoId);
  }

  async bluetoothDisponible(): Promise<boolean> {
    try {
      await this.inicializar();
      return await BleClient.isEnabled();
    } catch (error) {
      console.error(
        'Bluetooth BLE no está disponible:',
        error
      );

      return false;
    }
  }

  esPlataformaNativa(): boolean {
    return Capacitor.isNativePlatform();
  }
}