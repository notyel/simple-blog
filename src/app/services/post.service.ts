import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TransferState, makeStateKey } from '@angular/core';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { Post } from '../core/models/post.model';
import { POSTS_KEY, POST_KEY } from '../shared/state-keys';

const renderer = new marked.Renderer();

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    renderer.code = ({ text, lang }) => {
      const language =
        typeof lang === 'string' && hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(text ?? '', { language }).value;
      return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
    };

    // Configure marked to use highlight.js for syntax highlighting
    marked.setOptions({
      renderer,
      gfm: true,
      breaks: false,
      pedantic: false,
    });
  }

  getAllPosts(): Post[] {
    console.log(POSTS_KEY);
    console.log(this.transferState.hasKey(POSTS_KEY));

    if (this.transferState.hasKey(POSTS_KEY)) {
      const posts = this.transferState.get<Post[]>(POSTS_KEY, []);
      this.transferState.remove(POSTS_KEY); // Clean up after reading
      console.log('PostService: Fetched all posts from TransferState');
      return posts;
    } else {
      console.log(
        'PostService: No posts found in TransferState for getAllPosts.'
      );
      // In a real app, for client-side navigation, you might fetch from an API here.
      // For now, returning empty or handling as per requirements.
      return [];
    }
  }

  getPostBySlug(slug: string): Post | null {
    if (this.transferState.hasKey(POST_KEY)) {
      const post = this.transferState.get<Post | null>(POST_KEY, null);
      // Ensure the fetched post matches the requested slug, especially if POST_KEY might be generic
      if (post && post.slug === slug) {
        this.transferState.remove(POST_KEY); // Clean up after reading
        if (post.content) {
          post.htmlContent = marked.parse(post.content) as string;
        }
        console.log(`PostService: Fetched post "${slug}" from TransferState`);
        return post;
      } else if (post && post.slug !== slug) {
        // Transferred post is not the one we're looking for.
        // This might happen if navigation occurs quickly or state isn't perfectly managed for specific slugs.
        // For now, we assume server.ts sets the correct post for the current slug.
        console.warn(
          `PostService: Transferred post slug "${post.slug}" does not match requested slug "${slug}".`
        );
        // Fall-through to "not found in TransferState" logic.
        // Clear the mismatched post from state
        this.transferState.remove(POST_KEY);
      }
    }

    console.log(
      `PostService: Post "${slug}" not found in TransferState for getPostBySlug.`
    );
    // In a real app, for client-side navigation, you might fetch from an API here.
    return null;
  }
}
