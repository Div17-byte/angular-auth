import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="user; else empty">
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 1rem;"
      >
        <img
          *ngIf="user?.picture"
          [src]="user.picture"
          [alt]="user.name || 'User'"
          class="profile-picture"
          style="width: 110px; height: 110px; border-radius: 50%; object-fit: cover; border: 3px solid #63b3ed;"
        />
        <div style="text-align: center;">
          <div
            class="profile-name"
            style="font-size: 2rem; font-weight: 600; color: #f7fafc; margin-bottom: 0.5rem;"
          >
            {{ user?.name }}
          </div>
          <div
            class="profile-email"
            style="font-size: 1.15rem; color: #a0aec0;"
          >
            {{ user?.email }}
          </div>
        </div>
      </div>
    </ng-container>
    <ng-template #empty>
      <div class="loading-text">No user loaded.</div>
    </ng-template>
  `,
  styles: [],
})
export class ProfileComponent implements OnChanges {
  @Input() user: any | null = null;
  ngOnChanges(): void {
    console.log('ProfileComponent user:', this.user);
  }
}
