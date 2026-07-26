import { Component, HostListener, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceService } from '../services/workspace.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnDestroy {
  readonly workspaceService = inject(WorkspaceService);
  readonly scrollProgress = signal<number>(0);
  readonly isMobileMenuOpen = signal<boolean>(false);

  readonly navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'contact', label: 'Contact' },
  ];

  ngOnDestroy(): void {
    this.unlockBodyScroll();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      this.scrollProgress.set((window.scrollY / totalHeight) * 100);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024 && this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  /** Close menu when clicking/tapping anywhere outside it (and not the hamburger). */
  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(event: PointerEvent): void {
    if (!this.isMobileMenuOpen()) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const insideMenu = !!target.closest('#mobile-nav-panel');
    const onHamburger = !!target.closest('.mobile-menu-btn');

    if (!insideMenu && !onHamburger) {
      this.closeMobileMenu();
    }
  }

  /** One click opens, next click closes. */
  toggleMobileMenu(event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();

    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu(): void {
    this.isMobileMenuOpen.set(true);
    this.lockBodyScroll();
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
    this.unlockBodyScroll();
  }

  scrollToSection(sectionId: string): void {
    this.closeMobileMenu();
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = window.innerWidth >= 1024 ? 96 : 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      this.workspaceService.setActiveSection(sectionId);
    }
  }

  private lockBodyScroll(): void {
    document.documentElement.classList.add('mobile-menu-open');
    document.body.classList.add('mobile-menu-open');
  }

  private unlockBodyScroll(): void {
    document.documentElement.classList.remove('mobile-menu-open');
    document.body.classList.remove('mobile-menu-open');
  }
}
