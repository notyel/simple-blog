export interface Post {
  slug: string;
  frontmatter: {
    title: string;
    date: string;
    summary: string;
    featuredImage?: string;
    [key: string]: any;
  };
  content?: string;
  htmlContent?: string;
}
