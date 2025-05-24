import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';
import * as fs from 'node:fs';
import * as path from 'node:path';
import matter from 'gray-matter';
import { TransferState, makeStateKey } from '@angular/core';

// Define Post interface
interface Post {
  slug: string;
  frontmatter: { [key: string]: any };
  content?: string;
}

const POSTS_KEY = makeStateKey<Post[]>('posts');
const POST_KEY = makeStateKey<Post>('post');

const postsDirectory = path.join(process.cwd(), 'src/assets/posts');

function fetchAllPostsData(): Post[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContents);
        return {
          slug,
          frontmatter: data,
        };
      });
    return allPostsData;
  } catch (error) {
    console.error('Error fetching all posts data:', error);
    return []; // Return empty array on error
  }
}

function fetchPostBySlugData(slug: string): Post | null {
  try {
    const filePath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    return {
      slug,
      frontmatter: data,
      content,
    };
  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error);
    return null; // Return null on error
  }
}

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  })
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('**', async (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  const transferState = new TransferState();

  // Basic logic to check if this is a request for a single post
  // This could be improved with more robust routing matching
  const parts = originalUrl.split('/');
  const potentialSlug = parts[parts.length - 1]; // Get the last part of the URL

  // Attempt to fetch a single post if the URL seems to be a post slug
  // This is a simplified check; real-world scenarios might need more specific routing.
  // For example, check if the URL starts with a specific path like '/blog/'
  let singlePost: Post | null = null;
  if (
    potentialSlug &&
    !potentialSlug.includes('.') &&
    parts.length > 1 &&
    originalUrl.startsWith('/blog/')
  ) {
    // Basic check: not a file and has some path segments
    console.log(
      `Attempting to fetch post with potential slug: ${potentialSlug}`
    );
    singlePost = fetchPostBySlugData(potentialSlug);
    if (singlePost) {
      transferState.set(POST_KEY, singlePost);
      console.log(`Post data for ${potentialSlug} set in TransferState.`);
    } else {
      console.log(`Post with slug ${potentialSlug} not found.`);
    }
  }

  // Fetch all posts metadata if not a single post request or for general listing
  if (!singlePost) {
    // Avoid fetching all posts if a single post was already successfully fetched
    const allPosts = fetchAllPostsData();
    if (allPosts.length > 0) {
      transferState.set(POSTS_KEY, allPosts);
      console.log('All posts data set in TransferState.');
    } else {
      console.log('No posts found or error fetching posts.');
    }
  }

  try {
    const html = await commonEngine.render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [
        { provide: APP_BASE_HREF, useValue: baseUrl },
        { provide: TransferState, useValue: transferState },
      ],
    });
    res.send(html);
  } catch (err) {
    next(err);
  }
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;
