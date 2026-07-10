import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  catchError,
  map,
  throwError,
} from 'rxjs';

import {
  Noticia,
  NoticiaApi,
} from '../models/noticia.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl =
    'https://dev.to/api/articles';

  constructor(
    private http: HttpClient
  ) {}

  obtenerNoticias(): Observable<Noticia[]> {
    const paginaAleatoria =
      Math.floor(Math.random() * 5) + 1;

    return this.http
      .get<NoticiaApi[]>(
        `${this.apiUrl}?tag=programming&per_page=8&page=${paginaAleatoria}`
      )
      .pipe(
        map((articulos: NoticiaApi[]) =>
          articulos.map(
            (articulo: NoticiaApi) =>
              this.convertirEnNoticia(articulo)
          )
        ),

        catchError((error: unknown) => {
          console.error(
            'No se pudieron cargar las noticias:',
            error
          );

          return throwError(
            () =>
              new Error(
                'No fue posible cargar las noticias tecnológicas. Verifica tu conexión a Internet.'
              )
          );
        })
      );
  }

  private convertirEnNoticia(
    articulo: NoticiaApi
  ): Noticia {
    return {
      id: articulo.id,
      titulo:
        articulo.title ||
        'Artículo tecnológico',

      resumen:
        articulo.description ||
        'Consulta este contenido para conocer más detalles.',

      categoria:
        articulo.tag_list?.[0]
          ? this.formatearCategoria(
              articulo.tag_list[0]
            )
          : 'Tecnología',

      fecha:
        articulo.published_at,

      url:
        articulo.url,

      autor:
        articulo.user?.name ||
        'DEV Community',
    };
  }

  private formatearCategoria(
    categoria: string
  ): string {
    if (!categoria) {
      return 'Tecnología';
    }

    return (
      categoria.charAt(0).toUpperCase() +
      categoria.slice(1)
    );
  }
}