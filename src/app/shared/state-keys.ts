import { makeStateKey } from '@angular/core';
import { Post } from '../core/models/post.model';

export const POSTS_KEY = makeStateKey<Post[]>('posts');
export const POST_KEY = makeStateKey<Post>('post');
