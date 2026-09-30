import { GithubContributions } from '../../shared/components/github-contributions/github-contributions';
import { QualityLab } from '../../shared/components/quality-lab/quality-lab';
import { Component, HostListener, inject, signal } from '@angular/core';
import { WorkspaceService } from '../../shared/services/workspace.service';
import { AutomationArt } from '../../shared/components/automation-art/automation-art';
import { ExtendedToolkit } from '../../shared/components/extended-toolkit/extended-toolkit';
import { AiExpertise } from '../../shared/components/ai-expertise/ai-expertise';
import { PORTFOLIO_DATA } from '../../shared/data/portfolio-data';
import { Reveal } from '../../shared/directives/reveal';
import { CountUp } from '../../shared/directives/count-up';
@Component({
  selector: 'app-home',
  imports: [AutomationArt, ExtendedToolkit, AiExpertise, GithubContributions, QualityLab, Reveal, CountUp],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly workspaceService = inject(WorkspaceService);
  readonly personal = PORTFOLIO_DATA.personal;
  readonly education = PORTFOLIO_DATA.education;
  readonly experiences = PORTFOLIO_DATA.experience;
  readonly projects = PORTFOLIO_DATA.projects;
  readonly certifications = PORTFOLIO_DATA.certifications;
  readonly year = new Date().getFullYear();
  readonly selectedCategory = signal('All tools');
  readonly categories = ['All tools', 'Languages', 'Automation', 'API & data', 'DevOps'];
  readonly tools = [
    { name: 'Python', icon: 'python', category: 'Languages', note: 'Primary language' },
    { name: 'Java', icon: 'java', category: 'Languages', note: 'Programming' },
    { name: 'Selenium', icon: 'selenium', category: 'Automation', note: 'Web automation' },
    { name: 'Playwright', icon: 'playwright', category: 'Automation', note: 'Browser testing' },
    { name: 'Pytest', icon: 'pytest', category: 'Automation', note: 'Test framework' },
    {
      name: 'Robot Framework',
      icon: 'robotframework',
      category: 'Automation',
      note: 'Test framework',
    },
    { name: 'Cucumber', icon: 'cucumber', category: 'Automation', note: 'Behavior-driven testing' },
    { name: 'Postman', icon: 'postman', category: 'API & data', note: 'API testing' },
    {
      name: 'Oracle SQL Developer',
      icon: 'sqldeveloper',
      category: 'API & data',
      note: 'Database validation',
    },
    { name: 'Jenkins', icon: 'jenkins', category: 'DevOps', note: 'Continuous integration' },
    { name: 'Git', icon: 'git', category: 'DevOps', note: 'Version control' },
    { name: 'GitHub Actions', icon: 'githubactions', category: 'DevOps', note: 'CI/CD pipelines' },
    { name: 'Linux', icon: 'linux', category: 'DevOps', note: 'Operating system' },
  ];
  get filteredTools() {
    return this.tools.filter(
      (tool) =>
        this.selectedCategory() === 'All tools' || tool.category === this.selectedCategory(),
    );
  }
  @HostListener('window:scroll') onWindowScroll(): void {
    for (const id of [
      'contact',
      'certifications',
      'education',
      'github',
      'projects',
      'ai',
      'skills',
      'experience',
      'approach',
      'about',
      'home',
    ]) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 180) {
        this.workspaceService.setActiveSection(id);
        break;
      }
    }
  }
  async copyEmailToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.personal.email);
      this.workspaceService.showSnackbar('Email address copied.');
    } catch {
      this.workspaceService.showSnackbar(
        'Unable to copy. Please select the email address or use the email link.',
      );
    }
  }
}
