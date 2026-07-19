import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../services/workspace.service';

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success';
}

@Component({
  selector: 'app-custom-terminal',
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-terminal.html',
  styleUrl: './custom-terminal.css',
})
export class CustomTerminal implements OnInit, AfterViewChecked {
  private readonly workspaceService = inject(WorkspaceService);

  @ViewChild('terminalBody') private terminalBody!: ElementRef;
  @ViewChild('cmdInput') private cmdInput!: ElementRef;

  readonly lines = signal<TerminalLine[]>([]);
  readonly currentInput = signal<string>('');
  readonly isTyping = signal<boolean>(true);

  private readonly initialOutput = [
    "Hi, I'm Shariq",
    'QA Automation Engineer',
    '',
    'Specialized in:',
    'Selenium and Playwright',
    'Java and Python',
    'API Automation with REST Assured and Postman',
    'Angular and Tailwind CSS',
    '',
    'Explore skills, projects, contact, theme, or clear from the field below.',
  ];

  ngOnInit(): void {
    this.runInitialAnimation();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  focusInput(): void {
    if (!this.isTyping() && this.cmdInput) {
      this.cmdInput.nativeElement.focus();
    }
  }

  handleCommand(event: Event): void {
    event.preventDefault();
    const command = this.currentInput().trim();
    if (!command) return;

    this.lines.update((lines) => [...lines, { text: `You asked: ${command}`, type: 'input' }]);
    this.currentInput.set('');

    const normalizedTopic = command.toLowerCase();

    if (normalizedTopic === 'help') {
      this.lines.update((lines) => [
        ...lines,
        { text: 'Available topics:', type: 'success' },
        { text: 'Profile - Get a summary of my QA profile', type: 'output' },
        { text: 'Skills - List my testing and automation stack', type: 'output' },
        { text: "Projects - Show highlights of frameworks I've built", type: 'output' },
        { text: 'Contact - See how to get in touch', type: 'output' },
        { text: 'Theme - Toggle website colors', type: 'output' },
        { text: 'Clear - Reset this panel', type: 'output' },
      ]);
    } else if (normalizedTopic === 'profile' || normalizedTopic === 'whoami') {
      this.lines.update((lines) => [
        ...lines,
        {
          text: 'Shariq - QA Automation Specialist focused on reliable automation systems.',
          type: 'output',
        },
        {
          text: 'Main focus: reduce regressions, improve pipeline speed, and strengthen test coverage.',
          type: 'output',
        },
      ]);
    } else if (normalizedTopic === 'skills') {
      this.lines.update((lines) => [
        ...lines,
        { text: 'Languages: Java, Python, TypeScript, SQL', type: 'output' },
        { text: 'Automation: Selenium, Playwright, Cypress, Appium', type: 'output' },
        { text: 'API Testing: REST Assured, Postman, SoapUI', type: 'output' },
        { text: 'CI/CD and Ops: Jenkins, GitHub Actions, Docker, AWS', type: 'output' },
      ]);
    } else if (normalizedTopic === 'projects') {
      this.lines.update((lines) => [
        ...lines,
        { text: 'Project highlights:', type: 'success' },
        {
          text: 'Hybrid Selenium framework with Page Object Models and ExtentReports.',
          type: 'output',
        },
        {
          text: 'Playwright Python suite with parallel execution in GitHub Actions.',
          type: 'output',
        },
        { text: 'REST Assured API regression framework with JUnit 5 and Lombok.', type: 'output' },
      ]);
    } else if (normalizedTopic === 'contact') {
      this.lines.update((lines) => [
        ...lines,
        { text: 'Ready to connect?', type: 'success' },
        {
          text: 'Scroll down to the Contact section and send a message from the form.',
          type: 'output',
        },
      ]);
    } else if (normalizedTopic === 'theme') {
      this.workspaceService.toggleTheme();
      this.lines.update((lines) => [
        ...lines,
        { text: `Theme changed to ${this.workspaceService.theme()} mode.`, type: 'success' },
      ]);
    } else if (normalizedTopic === 'clear') {
      this.lines.set([]);
    } else {
      this.lines.update((lines) => [
        ...lines,
        { text: `I did not recognize "${command}". Try help for available topics.`, type: 'error' },
      ]);
    }
  }

  private runInitialAnimation(): void {
    this.lines.set([]);
    let lineIndex = 0;

    const revealTimer = setInterval(() => {
      if (lineIndex < this.initialOutput.length) {
        this.lines.update((lines) => [
          ...lines,
          { text: this.initialOutput[lineIndex], type: 'output' },
        ]);
        lineIndex++;
        return;
      }

      clearInterval(revealTimer);
      this.isTyping.set(false);
      setTimeout(() => this.focusInput(), 100);
    }, 110);
  }

  private scrollToBottom(): void {
    try {
      if (this.terminalBody) {
        this.terminalBody.nativeElement.scrollTop = this.terminalBody.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }
}
