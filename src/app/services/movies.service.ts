import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const API_BASE = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class MoviesService {
  constructor(private readonly http: HttpClient) {}

  // fetch movies from the sample_mflix database
  getMovies(db: string = 'sample_mflix') {
    return this.http
      .get<{
        db: string;
        collection: string;
        count: number;
        docs: any[];
      }>(`${API_BASE}/api/collections/movies?db=${encodeURIComponent(db)}`, { withCredentials: true })
      .pipe(map((r) => r?.docs || []));
  }

  // add a new movie
  addMovie(movieData: any): Observable<any> {
    return this.http.post(`${API_BASE}/api/movies`, movieData, {
      withCredentials: true,
    });
  }

  // get movie by ID
  getMovieById(id: string): Observable<any> {
    return this.http.get(`${API_BASE}/api/movies/${id}`, {
      withCredentials: true,
    });
  }

  // update movie
  updateMovie(id: string, movieData: any): Observable<any> {
    return this.http.put(`${API_BASE}/api/movies/${id}`, movieData, {
      withCredentials: true,
    });
  }

  // delete movie
  deleteMovie(id: string): Observable<any> {
    return this.http.delete(`${API_BASE}/api/movies/${id}`, {
      withCredentials: true,
    });
  }
}
