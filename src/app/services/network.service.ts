import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  ConnectionStatus,
  Network,
} from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private estadoSubject = new BehaviorSubject<ConnectionStatus>({
    connected: navigator.onLine,
    connectionType: 'unknown',
  });

  estado$ = this.estadoSubject.asObservable();

  constructor() {
    this.inicializar();
  }

  private async inicializar(): Promise<void> {
    try {
      const estado = await Network.getStatus();
      this.estadoSubject.next(estado);

      await Network.addListener(
        'networkStatusChange',
        (nuevoEstado: ConnectionStatus) => {
          this.estadoSubject.next(nuevoEstado);
        }
      );
    } catch (error) {
      console.error(
        'No se pudo obtener el estado de conexión:',
        error
      );
    }
  }

  obtenerEstadoActual(): ConnectionStatus {
    return this.estadoSubject.value;
  }
}