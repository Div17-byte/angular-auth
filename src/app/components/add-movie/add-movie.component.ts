import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MoviesService } from '../../services/movies.service';
import { NavbarComponent } from '../navbar.component';

@Component({
  selector: 'app-add-movie',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditMode ? 'Edit Movie' : 'Add New Movie' }}</h2>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>

          <form (ngSubmit)="submitForm()" class="form-container">
            <!-- Read-only info when editing existing movies -->
            <div class="info-section" *ngIf="isEditMode && movie.imdb">
              <div class="info-row">
                <span class="info-label">IMDB Rating:</span>
                <span class="info-value">{{ movie.imdb?.rating }} ⭐ ({{ movie.imdb?.votes }} votes)</span>
              </div>
              <div class="info-row" *ngIf="movie.cast?.length">
                <span class="info-label">Cast:</span>
                <span class="info-value">{{ movie.cast?.slice(0, 3).join(', ') }}</span>
              </div>
              <div class="info-row" *ngIf="movie.countries?.length">
                <span class="info-label">Country:</span>
                <span class="info-value">{{ movie.countries?.join(', ') }}</span>
              </div>
            </div>

            <div class="form-group">
              <label for="title">Movie Title *</label>
              <input
                id="title"
                [(ngModel)]="movie.title"
                name="title"
                type="text"
                placeholder="Enter movie title"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="year">Year *</label>
                <input
                  id="year"
                  [(ngModel)]="movie.year"
                  name="year"
                  type="number"
                  placeholder="2024"
                  required
                />
              </div>

              <div class="form-group">
                <label for="rated">Rated</label>
                <select [(ngModel)]="movie.rated" name="rated">
                  <option value="">Select Rating</option>
                  <option value="G">G</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                  <option value="NC-17">NC-17</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="genres">Genres (comma-separated)</label>
              <input
                id="genres"
                [(ngModel)]="genresText"
                name="genresText"
                type="text"
                placeholder="Action, Drama, Sci-Fi"
              />
            </div>

            <div class="form-group">
              <label for="plot">Plot / Description</label>
              <textarea
                id="plot"
                [(ngModel)]="movie.plot"
                name="plot"
                placeholder="Enter movie plot"
                rows="4"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="runtime">Runtime (minutes)</label>
              <input
                id="runtime"
                [(ngModel)]="movie.runtime"
                name="runtime"
                type="number"
                placeholder="120"
              />
            </div>

            <div class="form-group">
              <label>Movie Poster</label>
              <div class="poster-options">
                <button
                  type="button"
                  [class.active]="!posterUrl && posterType === 'upload'"
                  (click)="setPosterType('upload')"
                  class="option-btn"
                >
                  📤 Upload Image
                </button>
                <button
                  type="button"
                  [class.active]="posterUrl && posterType === 'url'"
                  (click)="setPosterType('url')"
                  class="option-btn"
                >
                  🔗 Use URL
                </button>
              </div>

              <!-- Image Upload -->
              <div class="file-input-wrapper" *ngIf="posterType === 'upload'">
                <input
                  #fileInput
                  type="file"
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  class="file-input"
                />
                <button
                  type="button"
                  class="file-btn"
                  (click)="fileInput.click()"
                >
                  📷 Choose Image
                </button>
                <span class="file-name" *ngIf="selectedFileName">
                  {{ selectedFileName }}
                </span>
              </div>

              <!-- URL Input -->
              <input
                *ngIf="posterType === 'url'"
                type="text"
                [(ngModel)]="posterUrl"
                (ngModelChange)="updatePosterPreview()"
                name="posterUrl"
                placeholder="Enter poster image URL"
                class="url-input"
              />

              <div class="image-preview" *ngIf="previewUrl">
                <img [src]="previewUrl" alt="Preview" />
              </div>
            </div>

            <div class="form-group">
              <label for="directors">Director(s) (comma-separated)</label>
              <input
                id="directors"
                [(ngModel)]="directorsText"
                name="directorsText"
                type="text"
                placeholder="Christopher Nolan, Denis Villeneuve"
              />
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="closeModal()"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="isLoading">
                {{ isLoading ? '📤 Saving...' : (isEditMode ? 'Update Movie' : 'Add Movie') }}
              </button>
            </div>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./add-movie.component.scss']
})
export class AddMovieComponent implements OnInit {
  movie: any = {
    title: '',
    year: new Date().getFullYear(),
    rated: '',
    plot: '',
    runtime: '',
    poster: ''
  };

  genresText = '';
  directorsText = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  selectedFileName = '';
  posterUrl = '';
  posterType: 'upload' | 'url' = 'upload';
  isLoading = false;
  errorMessage = '';
  isEditMode = false;
  movieId: string | null = null;

  constructor(
    private readonly moviesService: MoviesService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check if we're in edit mode
    this.route.queryParams.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.movieId = params['id'];
        this.loadMovie(params['id']);
      }
    });
  }

  loadMovie(id: string) {
    this.moviesService.getMovieById(id).subscribe(
      (data) => {
        this.movie = data;
        if (data.genres && Array.isArray(data.genres)) {
          this.genresText = data.genres.join(', ');
        }
        if (data.directors && Array.isArray(data.directors)) {
          this.directorsText = data.directors.join(', ');
        }
        if (data.poster) {
          this.previewUrl = data.poster;
          // If poster is a URL (not base64), set it as URL type
          if (data.poster.startsWith('http')) {
            this.posterType = 'url';
            this.posterUrl = data.poster;
            this.selectedFileName = '';
          } else {
            // It's base64
            this.posterType = 'upload';
            this.selectedFileName = 'Current poster';
          }
        }
      },
      (error) => {
        this.errorMessage = 'Failed to load movie details';
        console.error(error);
      }
    );
  }

  setPosterType(type: 'upload' | 'url') {
    this.posterType = type;
    if (type === 'upload') {
      this.posterUrl = '';
    } else {
      this.selectedFile = null;
      this.selectedFileName = '';
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files?.[0]) {
      this.selectedFile = files[0];
      this.selectedFileName = files[0].name;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(files[0]);
    }
  }

  // Watch for poster URL changes to update preview
  updatePosterPreview() {
    if (this.posterType === 'url' && this.posterUrl) {
      this.previewUrl = this.posterUrl;
    }
  }

  submitForm() {
    // Validate required fields
    if (!this.movie.title || !this.movie.year) {
      this.errorMessage = 'Title and Year are required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Parse genres and directors
    this.movie.genres = this.genresText
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    this.movie.directors = this.directorsText
      .split(',')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    // Handle poster - URL or base64
    if (this.posterType === 'url' && this.posterUrl) {
      this.movie.poster = this.posterUrl;
      this.saveMovie();
    } else if (this.selectedFile) {
      this.convertFileToBase64(this.selectedFile).then((base64) => {
        this.movie.poster = base64;
        this.saveMovie();
      });
    } else {
      this.saveMovie();
    }
  }

  // Preserve existing fields not shown in the form
  private preserveExistingFields(updatedData: any): any {
    if (!this.isEditMode) {
      return updatedData;
    }

    // Fields that can be edited in the form
    const editableFields = [
      'title',
      'year',
      'rated',
      'plot',
      'runtime',
      'poster',
      'genres',
      'directors'
    ];

    // Preserve all fields from original movie except editable ones
    const preserved = { ...this.movie };
    editableFields.forEach((field) => {
      if (updatedData.hasOwnProperty(field)) {
        preserved[field] = updatedData[field];
      }
    });

    return preserved;
  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  saveMovie() {
    // When editing, preserve all existing fields not shown in form
    const dataToSave = this.isEditMode
      ? this.preserveExistingFields(this.movie)
      : this.movie;

    const apiCall = this.isEditMode
      ? this.moviesService.updateMovie(this.movieId!, dataToSave)
      : this.moviesService.addMovie(dataToSave);

    apiCall.subscribe(
      (response) => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error || 'Failed to save movie';
        console.error(error);
      }
    );
  }

  closeModal() {
    this.router.navigate(['/dashboard']);
  }
}
