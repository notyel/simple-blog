import { Post } from "./post.model";

/**
 * Modelo para los detalles completos de un post
 */
export interface PostDetail extends Post {
  content: string; // Contenido HTML del post
}
