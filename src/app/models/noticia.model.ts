export interface NoticiaApi {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  tag_list: string[];
  user: {
    name: string;
  };
}

export interface Noticia {
  id: number;
  titulo: string;
  resumen: string;
  categoria: string;
  fecha: string;
  url: string;
  autor: string;
}