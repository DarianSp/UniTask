import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('../pages/inicio/inicio.page').then(
            (m) => m.InicioPage
          ),
      },
      {
        path: 'tareas',
        loadComponent: () =>
          import('../pages/tareas/tareas.page').then(
            (m) => m.TareasPage
          ),
      },
      {
        path: 'agenda',
        loadComponent: () =>
          import('../pages/agenda/agenda.page').then(
            (m) => m.AgendaPage
          ),
      },
      {
        path: 'recursos',
        loadComponent: () =>
          import('../pages/recursos/recursos.page').then(
            (m) => m.RecursosPage
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('../pages/perfil/perfil.page').then(
            (m) => m.PerfilPage
          ),
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/inicio',
    pathMatch: 'full',
  },
];