import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { PostService } from './services/post.service'; // Corrected path

@Component({
  selector: 'app-root',
  standalone: true, // AppComponent is often standalone in new Angular projects
  imports: [CommonModule, RouterOutlet, RouterModule], // Added CommonModule and RouterModule
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'My Angular Blog'; // Updated title
  totalPosts: number = 0;

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    // This will attempt to get posts. If using TransferState, it should be available synchronously on first client render.
    // If posts are fetched asynchronously on the client AFTER transfer state is missed, totalPosts might update later.
    const posts = this.postService.getAllPosts();
    this.totalPosts = posts.length;
    console.log('AppComponent: Initial total posts calculated:', this.totalPosts);
  }

  getYear(): number {
    return new Date().getFullYear();
  }
}
