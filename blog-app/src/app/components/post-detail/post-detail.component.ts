import { Component, OnInit, SecurityContext } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Title, Meta, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PostService } from '../../services/post.service';

// Assuming Post interface is defined in PostService or a shared types file
// For clarity, if it's not exported from PostService, it should be defined/imported here.
// For this example, we'll assume it's implicitly available or PostService.Post is accessible.
// If PostService defines and exports Post, you might import it like:
// import { Post } from '../../services/post.service';
interface Post { // Re-defining for clarity if not imported
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


@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  postHtmlContent: SafeHtml | null = null;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private titleService: Title,
    private metaService: Meta,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.post = this.postService.getPostBySlug(slug);
      console.log('PostDetailComponent: Fetched post:', this.post);

      if (this.post) {
        if (this.post.htmlContent) {
          this.postHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.post.htmlContent);
        }

        // Set SEO Meta Tags
        this.titleService.setTitle(this.post.frontmatter.title);
        this.metaService.updateTag({ name: 'description', content: this.post.frontmatter.summary });
        this.metaService.updateTag({ property: 'og:title', content: this.post.frontmatter.title });
        this.metaService.updateTag({ property: 'og:description', content: this.post.frontmatter.summary });
        if (this.post.frontmatter.featuredImage) {
          // Make sure the URL is absolute or correctly handled by crawlers
          this.metaService.updateTag({ property: 'og:image', content: this.post.frontmatter.featuredImage });
        }
      } else {
        // Handle post not found, e.g., navigate to a 404 page or show a message
        console.warn(`PostDetailComponent: Post with slug "${slug}" not found.`);
      }
    }
  }
}
