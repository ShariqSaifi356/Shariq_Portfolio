import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  readonly activeSection = signal<string>('home');
  readonly theme = signal<'dark' | 'light'>('dark');
  readonly inspectorActive = signal<boolean>(false);
  readonly inspectorTimerPaused = signal<boolean>(false);
  readonly inspectorTimeLeft = signal<number>(60);
  readonly snackbarMessage = signal<string | null>(null);

  private timerInterval: any = null;
  private snackbarTimeout: any = null;

  constructor() {
    // Every page load starts dark; the toggle applies only to this visit.
    this.applyTheme('dark');
  }

  toggleTheme(): void {
    const nextTheme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(nextTheme);
    this.applyTheme(nextTheme);
  }

  toggleInspector(): void {
    const nextState = !this.inspectorActive();
    this.inspectorActive.set(nextState);
    if (nextState) {
      this.startInspectorTimer();
    } else {
      this.inspectorTimerPaused.set(false);
      this.stopInspectorTimer();
    }
  }

  setInspectorTimerPaused(paused: boolean): void {
    this.inspectorTimerPaused.set(paused);
  }

  extendInspectorTime(seconds = 60): void {
    this.inspectorTimeLeft.update((val) => Math.min(val + seconds, 300));
  }

  showSnackbar(message: string): void {
    this.snackbarMessage.set(message);
    if (this.snackbarTimeout) clearTimeout(this.snackbarTimeout);
    this.snackbarTimeout = setTimeout(() => {
      this.snackbarMessage.set(null);
    }, 3000);
  }

  setActiveSection(section: string): void {
    this.activeSection.set(section);
  }

  private startInspectorTimer(): void {
    this.inspectorTimeLeft.set(60);
    this.stopInspectorTimer(); // clear any previous interval
    this.timerInterval = setInterval(() => {
      if (this.inspectorTimerPaused()) return;

      const left = this.inspectorTimeLeft();
      if (left <= 1) {
        this.inspectorActive.set(false);
        this.inspectorTimerPaused.set(false);
        this.stopInspectorTimer();
      } else {
        this.inspectorTimeLeft.set(left - 1);
      }
    }, 1000);
  }

  private stopInspectorTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private applyTheme(theme: 'dark' | 'light'): void {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.backgroundColor = '#101719';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.backgroundColor = '#f5f7f9';
    }
  }
}
