import { Injectable } from '@angular/core';
import { Drivers, Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage: Storage;
  private listo: Promise<Storage>;

  constructor() {
    this.storage = new Storage({
      name: 'unitask_db',
      driverOrder: [
        Drivers.IndexedDB,
        Drivers.LocalStorage,
      ],
    });

    this.listo = this.storage.create();
  }

  async guardar<T>(
    clave: string,
    valor: T
  ): Promise<void> {
    const storage = await this.listo;
    await storage.set(clave, valor);
  }

  async obtener<T>(
    clave: string
  ): Promise<T | null> {
    const storage = await this.listo;
    return storage.get(clave) as Promise<T | null>;
  }

  async eliminar(clave: string): Promise<void> {
    const storage = await this.listo;
    await storage.remove(clave);
  }

  async limpiar(): Promise<void> {
    const storage = await this.listo;
    await storage.clear();
  }
}