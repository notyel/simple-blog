import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Post } from '../../core/models/post.model';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'], // We'll create an empty CSS file for now
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostListComponent implements OnInit {
  posts$: Observable<Post[]>;

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.posts$ = this.postService.getPosts();
  }
}
