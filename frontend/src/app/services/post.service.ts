import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Post, PostDetail } from '../core/models/post.model.ts'; // Adjusted path

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = 'http://localhost:4000/api/posts'; // Base URL for the backend API

  constructor(private http: HttpClient) {}

  /**
   * Fetches all posts (metadata only) from the backend.
   * @returns An Observable array of Post objects.
   */
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error fetching posts:', error);
        return of([]); // Return an empty array as a fallback
      })
    );
  }

  /**
   * Fetches a single post by its slug (including content) from the backend.
   * @param slug The slug of the post to fetch.
   * @returns An Observable of a PostDetail object, or undefined if not found.
   */
  getPost(slug: string): Observable<PostDetail | undefined> {
    return this.http.get<PostDetail>(`${this.apiUrl}/${slug}`).pipe(
      catchError((error) => {
        console.error(`Error fetching post with slug ${slug}:`, error);
        return of(undefined); // Return undefined as a fallback for a missing post
      })
    );
  }
}
