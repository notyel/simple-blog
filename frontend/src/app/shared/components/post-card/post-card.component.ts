import { Component, Input } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Post } from "../../models/post.model";

@Component({
  selector: "app-post-card",
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <article class="post-card">
      <div class="post-content">
        <header>
          <h2>
            <a [routerLink]="['/blog', post.slug]">{{ post.title }}</a>
          </h2>
          <div class="post-meta">
            <time class="date" [dateTime]="post.date">{{
              post.date | date : "longDate"
            }}</time>
            <span class="separator">•</span>
            <span>{{ post.readingTime }} min read</span>
          </div>
        </header>

        <div class="post-tags">
          <span *ngFor="let tag of post.tags" class="tag">
            {{ tag }}
          </span>
        </div>

        <p class="description">{{ post.description }}</p>
      </div>

      <footer class="post-footer">
        <a [routerLink]="['/blog', post.slug]" class="read-more">
          Read more
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </footer>
    </article>
  `,
  styles: [],
})
export class PostCardComponent {
  @Input({ required: true }) post!: Post;
}
