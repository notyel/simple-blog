import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { Post } from "../../shared/models/post.model";
import { PostDetail } from "../../shared/models/post-detail.model";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class PostService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/posts`;

  /**
   * Obtiene todos los posts (metadatos)
   */
  getAllPosts(): Observable<{ success: boolean; data: Post[] }> {
    return this.http.get<{ success: boolean; data: Post[] }>(this.apiUrl);
  }

  /**
   * Obtiene un post específico por su slug
   * @param slug El slug del post
   */
  getPostBySlug(
    slug: string
  ): Observable<{ success: boolean; data: PostDetail }> {
    return this.http.get<{ success: boolean; data: PostDetail }>(
      `${this.apiUrl}/${slug}`
    );
  }
}
