import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(this.getInitialTheme());
  public darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    const initialTheme = this.darkModeSubject.value;
    console.log('[ThemeService] Initializing with dark mode:', initialTheme);
    this.applyTheme(initialTheme);
  }

  private getInitialTheme(): boolean {
    if (typeof localStorage === 'undefined') return false;
    const saved = localStorage.getItem('theme-mode');
    if (saved) return saved === 'dark';
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleTheme(): void {
    const newMode = !this.darkModeSubject.value;
    console.log('[ThemeService] Toggling theme to:', newMode ? 'dark' : 'light');
    this.darkModeSubject.next(newMode);
    localStorage.setItem('theme-mode', newMode ? 'dark' : 'light');
    this.applyTheme(newMode);
  }

  setTheme(isDark: boolean): void {
    this.darkModeSubject.next(isDark);
    localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
    this.applyTheme(isDark);
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }

  private applyTheme(isDark: boolean): void {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    console.log('[ThemeService] Applying theme - isDark:', isDark, 'html element:', html.tagName);

    if (isDark) {
      html.classList.remove('light-theme');
      html.classList.add('dark-theme');
      console.log('[ThemeService] Added dark-theme class, classList:', html.className);
    } else {
      html.classList.remove('dark-theme');
      html.classList.add('light-theme');
      console.log('[ThemeService] Added light-theme class, classList:', html.className);
    }
  }
}
