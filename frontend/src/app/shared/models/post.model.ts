/**
 * Modelo para los metadatos de un post
 */
export interface Post {
  title: string;
  date: string;
  description: string;
  slug: string;
  tags: string[];
  toc?: boolean;
  readingTime?: number;
}
