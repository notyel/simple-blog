import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { PostDetail } from '../../core/models/post.model';
import { PostService } from '../../services/post.service';
// Optional: Import DomSanitizer if you need to bypass security for [innerHTML]
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'], // We'll create an empty CSS file
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailComponent implements OnInit {
  post$: Observable<PostDetail | undefined>;
  // For sanitized HTML:
  // postContentHtml$: Observable<SafeHtml | undefined>;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService
    // private sanitizer: DomSanitizer // Uncomment if using SafeHtml
  ) {}

  ngOnInit(): void {
    this.post$ = this.route.paramMap.pipe(
      switchMap(params => {
        const slug = params.get('slug');
        if (slug) {
          return this.postService.getPost(slug);
        }
        return new Observable<PostDetail | undefined>(subscriber => subscriber.next(undefined)); // Or handle error
      })
    );

    // Example if sanitizing HTML content:
    // this.postContentHtml$ = this.post$.pipe(
    //   map(post => post && post.content ? this.sanitizer.bypassSecurityTrustHtml(post.content) : undefined)
    // );
  }
}
