import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WorkspaceService } from './shared/services/workspace.service';
import { Header } from './shared/header/header';
import { BugDefense } from './shared/components/bug-defense/bug-defense';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, BugDefense],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly workspaceService = inject(WorkspaceService);
  readonly showBackToTop = signal(false);
  @HostListener('window:scroll') onWindowScroll(): void {
    this.showBackToTop.set(window.scrollY > 600);
  }
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }
}
