import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS
app.use(cors());

// Define the path to the posts directory (assuming CWD is backend/)
const postsDirectory = path.resolve(process.cwd(), '../frontend/src/assets/posts');

// Endpoint to get all posts (metadata only)
app.get('/api/posts', (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(postsDirectory)) {
      console.error(`Posts directory not found: ${postsDirectory}`);
      return res.status(500).json({ error: 'Posts directory not found' });
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map(fileName => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        
        try {
          const fileContents = fs.readFileSync(fullPath, 'utf8');
          const { data } = matter(fileContents); // Only metadata needed for the list
          return {
            slug,
            ...data,
          };
        } catch (fileReadError) {
          console.error(`Error reading or parsing file ${fullPath}:`, fileReadError);
          // Optionally, return a partial error or skip this post
          return {
            slug,
            error: `Could not read or parse post: ${fileName}`,
          };
        }
      });

    res.json(allPostsData);
  } catch (error) {
    console.error('Error reading posts directory:', error);
    res.status(500).json({ error: 'Failed to load posts' });
  }
});

// Endpoint to get a single post by slug (with content)
app.get('/api/posts/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const filePath = path.join(postsDirectory, `${slug}.md`);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    res.json({
      slug,
      content,
      ...data,
    });
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    res.status(500).json({ error: `Failed to load post: ${slug}` });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

// Basic error handler for uncaught errors or unhandled routes (optional)
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
