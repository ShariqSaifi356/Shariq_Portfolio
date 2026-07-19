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

type SkillCategory =
  | 'Languages'
  | 'Automation'
  | 'API'
  | 'Frameworks'
  | 'CI_CD'
  | 'Databases'
  | 'Test Management'
  | 'Testing Types'
  | 'Reports'
  | 'Banking Domain';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, CustomTerminal],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  readonly workspaceService = inject(WorkspaceService);

  // Data imports from central JSON configuration
  readonly personal = PORTFOLIO_DATA.personal;
  readonly education = PORTFOLIO_DATA.education;
  readonly skillsData: Record<string, string[]> = PORTFOLIO_DATA.skills;

  private readonly skillCategories: SkillCategory[] = [
    'Languages',
    'Automation',
    'API',
    'Frameworks',
    'CI_CD',
    'Databases',
    'Test Management',
    'Testing Types',
    'Reports',
    'Banking Domain',
  ];

  private readonly skillCategoryAliases: Record<string, SkillCategory> = {
    selenium: 'Automation',
    'selenium webdriver': 'Automation',
    requests: 'API',
    'python requests': 'API',
    'oracle db': 'Databases',
    'oracle developer': 'Databases',
    'oracle sql developer': 'Databases',
    jira: 'Test Management',
  };

  // Experience state
  readonly experiences = signal<JobExperience[]>(
    PORTFOLIO_DATA.experience.map((exp, idx) => ({
      ...exp,
      expanded: idx === 0, // Default first experience expanded
    })),
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
    const sections = [
      'home',
      'about',
      'experience',
      'skills',
      'projects',
      'certifications',
      'contact',
    ];
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
    this.experiences.update((exps) => {
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
        behavior: 'smooth',
      });

      this.workspaceService.setActiveSection(sectionId);
    }
  }

  getExperienceSkillCategoryClass(skill: string): string {
    const category = this.getSkillCategory(skill);
    const categoryIndex = this.skillCategories.indexOf(category);

    return `skill-card-${categoryIndex >= 0 ? categoryIndex : 0}`;
  }

  copyEmailToClipboard(): void {
    navigator.clipboard.writeText(this.personal.email);
  }

  private getSkillCategory(skill: string): SkillCategory {
    const normalizedSkill = this.normalizeSkillName(skill);
    const aliasedCategory = this.skillCategoryAliases[normalizedSkill];

    if (aliasedCategory) {
      return aliasedCategory;
    }

    const matchedCategory = this.skillCategories.find((category) =>
      this.skillsData[category].some(
        (categorySkill) => this.normalizeSkillName(categorySkill) === normalizedSkill,
      ),
    );

    return matchedCategory ?? 'Automation';
  }

  private normalizeSkillName(skill: string): string {
    return skill
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }
}
