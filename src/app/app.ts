import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WorkspaceService } from './shared/services/workspace.service';
import { Header } from './shared/header/header';
import { QaInspectorComponent } from './shared/components/qa-inspector/qa-inspector';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, QaInspectorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  readonly workspaceService = inject(WorkspaceService);
  readonly showBackToTop = signal<boolean>(false);

  ngOnInit(): void {
    // Initial scroll check
    this.checkScroll();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const root = document.documentElement;
    root.style.setProperty('--mouse-x', `${event.clientX}px`);
    root.style.setProperty('--mouse-y', `${event.clientY}px`);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.checkScroll();
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  private checkScroll(): void {
    this.showBackToTop.set(window.scrollY > 400);
  }
}
