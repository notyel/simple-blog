// Defines the structure for individual post metadata and content

export interface Post {
  slug: string;
  // All other properties from frontmatter will be at this level
  title?: string;
  date?: string;
  author?: string;
  // Add other common frontmatter properties you expect
  [key: string]: any; // Allows for arbitrary frontmatter properties
}

export interface PostDetail extends Post {
  content: string;
}
