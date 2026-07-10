import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

import { PerfilUsuario } from '../models/perfil.model';
import { STORAGE_KEYS } from '../core/constants/app.constants';

@Injectable({
    providedIn: 'root',
})
export class PerfilService {
    private readonly perfilInicial: PerfilUsuario = {
        nombre: '',
        matricula: '',
        carrera: '',
        correo: '',
        foto: '',
        temaOscuro: false,
        notificaciones: true,
    };

    async obtenerPerfil(): Promise<PerfilUsuario> {
        try {
            const resultado = await Preferences.get({
                key: STORAGE_KEYS.perfil,
            });

            if (!resultado.value) {
                return { ...this.perfilInicial };
            }

            const perfilGuardado = JSON.parse(
                resultado.value
            ) as Partial<PerfilUsuario>;

            return {
                ...this.perfilInicial,
                ...perfilGuardado,
            };
        } catch (error) {
            console.error(
                'No se pudo cargar el perfil:',
                error
            );

            return { ...this.perfilInicial };
        }
    }

    async guardarPerfil(
        perfil: PerfilUsuario
    ): Promise<void> {
        await Preferences.set({
            key: STORAGE_KEYS.perfil,
            value: JSON.stringify(perfil),
        });
    }

    async eliminarPerfil(): Promise<void> {
        await Preferences.remove({
            key: STORAGE_KEYS.perfil,
        });
    }
}