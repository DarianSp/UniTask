import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  Geolocation,
  PermissionStatus,
  Position,
} from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  async verificarPermisos(): Promise<PermissionStatus | null> {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    return Geolocation.checkPermissions();
  }

  async solicitarPermisos(): Promise<PermissionStatus | null> {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    return Geolocation.requestPermissions();
  }

  async obtenerUbicacionActual(): Promise<Position> {
    if (Capacitor.isNativePlatform()) {
      const permisos = await this.verificarPermisos();

      const tienePermiso =
        permisos?.location === 'granted' ||
        permisos?.coarseLocation === 'granted';

      if (!tienePermiso) {
        const nuevosPermisos = await this.solicitarPermisos();

        const permisoConcedido =
          nuevosPermisos?.location === 'granted' ||
          nuevosPermisos?.coarseLocation === 'granted';

        if (!permisoConcedido) {
          throw new Error(
            'Debes permitir el acceso a la ubicación para usar el mapa.'
          );
        }
      }
    }

    return Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
    });
  }
}