import { Component, OnInit, ElementRef, ViewChild, inject, signal, AfterViewChecked } from '@angular/core';
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
  styleUrl: './custom-terminal.css'
})
export class CustomTerminal implements OnInit, AfterViewChecked {
  private readonly workspaceService = inject(WorkspaceService);
  
  @ViewChild('terminalBody') private terminalBody!: ElementRef;
  @ViewChild('cmdInput') private cmdInput!: ElementRef;

  readonly lines = signal<TerminalLine[]>([]);
  readonly currentInput = signal<string>('');
  readonly isTyping = signal<boolean>(true);
  readonly promptPrefix = 'shariq@qa-portfolio:~$ ';
  
  private initialCommand = 'whoami';
  private initialOutput = [
    "Hi, I'm Shariq",
    "QA Automation Engineer",
    "",
    "Specialized in:",
    "  • Selenium & Playwright",
    "  • Java & Python",
    "  • API Automation (REST Assured / Postman)",
    "  • Angular & Tailwind CSS",
    "",
    "Type 'help' to see a list of available custom CLI commands."
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

    // Add command to log
    this.lines.update(l => [...l, { text: `${this.promptPrefix}${command}`, type: 'input' }]);
    this.currentInput.set('');

    const cmdLower = command.toLowerCase();
    
    if (cmdLower === 'help') {
      this.lines.update(l => [
        ...l,
        { text: 'Available commands:', type: 'success' },
        { text: '  whoami      - Get a summary of my QA profile', type: 'output' },
        { text: '  skills      - List my full testing & developer automation stack', type: 'output' },
        { text: '  projects    - Show highlights of frameworks I\'ve built', type: 'output' },
        { text: '  contact     - Info on how to get in touch', type: 'output' },
        { text: '  theme       - Toggle website colors (dark/light)', type: 'output' },
        { text: '  clear       - Clear the terminal history', type: 'output' }
      ]);
    } else if (cmdLower === 'whoami') {
      this.lines.update(l => [
        ...l,
        { text: "Shariq - QA Automation Specialist dedicated to designing flawless automation rigs.", type: 'output' },
        { text: "Main Mission: Eradicate regressions, optimize pipeline speed, and secure absolute test coverage.", type: 'output' }
      ]);
    } else if (cmdLower === 'skills') {
      this.lines.update(l => [
        ...l,
        { text: 'Languages:   Java, Python, TypeScript, SQL', type: 'output' },
        { text: 'Automation:  Selenium, Playwright, Cypress, Appium', type: 'output' },
        { text: 'API Testing: REST Assured, Postman, SoapUI', type: 'output' },
        { text: 'CI/CD & Ops: Jenkins, GitHub Actions, Docker, AWS', type: 'output' }
      ]);
    } else if (cmdLower === 'projects') {
      this.lines.update(l => [
        ...l,
        { text: 'Project Highlights (Scroll down to Projects for full visual specs):', type: 'success' },
        { text: '  1. hybrid-framework-selenium  - Selenium Java framework featuring Page Object Models and ExtentReports.', type: 'output' },
        { text: '  2. playwright-ci-automation   - Playwright Python parallel suite integrated into GitHub Actions pipelines.', type: 'output' },
        { text: '  3. rest-assured-boilerplate   - API regression framework using RestAssured, JUnit 5, and Lombok.', type: 'output' }
      ]);
    } else if (cmdLower === 'contact') {
      this.lines.update(l => [
        ...l,
        { text: 'Ready to commit some code?', type: 'success' },
        { text: 'Scroll down to the Contact Section and write your message inside the Commit Form!', type: 'output' }
      ]);
    } else if (cmdLower === 'theme') {
      this.workspaceService.toggleTheme();
      this.lines.update(l => [...l, { text: `Theme toggled to: ${this.workspaceService.theme()}`, type: 'success' }]);
    } else if (cmdLower === 'clear') {
      this.lines.set([]);
    } else {
      this.lines.update(l => [
        ...l,
        { text: `Command not found: ${command}. Type 'help' for options.`, type: 'error' }
      ]);
    }
  }

  private runInitialAnimation(): void {
    let charIndex = 0;
    this.lines.set([{ text: this.promptPrefix, type: 'input' }]);

    const typeTimer = setInterval(() => {
      if (charIndex < this.initialCommand.length) {
        // Append character to the last input line
        const typedText = this.promptPrefix + this.initialCommand.slice(0, charIndex + 1);
        this.lines.update(lines => {
          const updated = [...lines];
          updated[updated.length - 1] = { text: typedText, type: 'input' };
          return updated;
        });
        charIndex++;
      } else {
        clearInterval(typeTimer);
        setTimeout(() => {
          // Output the responses lines
          this.initialOutput.forEach(lineText => {
            this.lines.update(l => [...l, { text: lineText, type: 'output' }]);
          });
          this.isTyping.set(false);
          // Wait a tick and focus input
          setTimeout(() => this.focusInput(), 100);
        }, 300);
      }
    }, 120);
  }

  private scrollToBottom(): void {
    try {
      if (this.terminalBody) {
        this.terminalBody.nativeElement.scrollTop = this.terminalBody.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }
}
