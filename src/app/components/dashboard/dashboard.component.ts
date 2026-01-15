import { Component } from '@angular/core';
import { CommonModule, AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoviesService } from '../../services/movies.service';
import { NavbarComponent } from '../navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, NgForOf, NgIf, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="dashboard">
      <header class="topbar">
        <div class="title">Movies</div>
        <div class="search">
          <input [(ngModel)]="query" placeholder="Search title or plot" />
        </div>
      </header>

      <section class="grid" *ngIf="movies$ | async as movies; else loading">
        <div *ngIf="filtered(movies).length; else noData" class="grid-inner">
          <article *ngFor="let m of filtered(movies)" class="card">
            <div class="poster" *ngIf="m.poster; else noPoster">
              <img [src]="m.poster" alt="{{m.title}} poster" />
            </div>
            <ng-template #noPoster>
              <div class="poster placeholder">
                <div class="placeholder-icon">🎬</div>
              </div>
            </ng-template>
            <div class="card-body">
              <h3 class="card-title">{{ m.title }}</h3>
              <div class="meta">{{ m.year }} • {{ m.genres?.slice(0,2).join(', ') }}</div>
              <p class="plot">{{ m.plot || m.fullplot }}</p>
            </div>
          </article>
        </div>
      </section>

      <ng-template #loading>
        <div class="empty-state">Loading movies…</div>
      </ng-template>

      <ng-template #noData>
        <div class="empty-state">No movies found.</div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  movies$;
  query = '';

  constructor(private movies: MoviesService) {
    this.movies$ = this.movies.getMovies('sample_mflix');
  }

  filtered(list: any[]) {
    if (!this.query) return list || [];
    const q = this.query.toLowerCase().trim();
    return (list || []).filter((m) => {
      return (
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.plot && m.plot.toLowerCase().includes(q)) ||
        (m.fullplot && m.fullplot.toLowerCase().includes(q))
      );
    });
  }
}
