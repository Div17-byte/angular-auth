import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const API_BASE = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class MoviesService {
  constructor(private http: HttpClient) {}

  // fetch movies from the sample_mflix database
  getMovies(db: string = 'sample_mflix') {
    return this.http
      .get<{ db: string; collection: string; count: number; docs: any[] }>(
        `${API_BASE}/api/collections/movies?db=${encodeURIComponent(db)}`,
        { withCredentials: true }
      )
      .pipe(map((r) => r?.docs || []));
  }
}
