import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService } from '../../services/post.service';

// Simplified interface for post metadata for the list
interface PostMetadata {
  slug: string;
  frontmatter: {
    title: string;
    date: string;
    summary: string;
    [key: string]: any; // Allow other frontmatter properties
  };
}

@Component({
  selector: 'app-post-list',
  standalone: true, // Generated components are standalone by default in Angular 17+
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.css'
})
export class PostListComponent implements OnInit {
  posts: PostMetadata[] = [];

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.posts = this.postService.getAllPosts() as PostMetadata[]; // Cast to PostMetadata[]
    console.log('PostListComponent: Fetched posts:', this.posts);
  }
}
