import { Component, HostListener, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../shared/services/workspace.service';
import { CustomTerminal } from '../../shared/components/custom-terminal/custom-terminal';
import { PORTFOLIO_DATA } from '../../shared/data/portfolio-data';

interface JobExperience {
  company: string;
  role: string;
  duration: string;
  responsibilities: string[];
  techStack: string[];
  expanded: boolean;
  javaClass: string;
}

interface Project {
  name: string;
  description: string;
  techStack: string[];
  github: string;
  demo: string;
  features: string[];
  challenges: string;
  lessons: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  id: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, CustomTerminal],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  readonly workspaceService = inject(WorkspaceService);
  
  // Data imports from central JSON configuration
  readonly personal = PORTFOLIO_DATA.personal;
  readonly education = PORTFOLIO_DATA.education;
  readonly skillsData: Record<string, string[]> = PORTFOLIO_DATA.skills;
  
  // Experience state
  readonly experiences = signal<JobExperience[]>(
    PORTFOLIO_DATA.experience.map((exp, idx) => ({
      ...exp,
      expanded: idx === 0 // Default first experience expanded
    }))
  );

  // Projects state
  readonly projects = signal<Project[]>(PORTFOLIO_DATA.projects);

  // Certifications
  readonly certifications = signal<Certification[]>(PORTFOLIO_DATA.certifications);

  ngOnInit(): void {
    // Register scroll event initially
    this.onWindowScroll();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const sections = ['home', 'about', 'experience', 'skills', 'projects', 'certifications', 'contact'];
    const headerHeight = 100;
    
    for (const section of sections) {
      const el = document.getElementById(section);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= headerHeight + 50 && rect.bottom >= headerHeight) {
          this.workspaceService.setActiveSection(section);
          break;
        }
      }
    }
  }

  toggleExperience(index: number): void {
    this.experiences.update(exps => {
      const updated = [...exps];
      updated[index] = { ...updated[index], expanded: !updated[index].expanded };
      return updated;
    });
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      this.workspaceService.setActiveSection(sectionId);
    }
  }

  copyEmailToClipboard(): void {
    navigator.clipboard.writeText(this.personal.email);
  }
}
