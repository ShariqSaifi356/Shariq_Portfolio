import { Component, HostListener, Inject, signal, effect, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceService } from '../../services/workspace.service';

interface QAInfo {
  xpath: string;
  css: string;
  playwright: string;
  seleniumJava: string;
  seleniumPython: string;
  tagName: string;
  elementId?: string;
  classes?: string;
  text?: string;
}

@Component({
  selector: 'app-qa-inspector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qa-inspector.html'
})
export class QaInspectorComponent {
  readonly activeElement = signal<HTMLElement | null>(null);
  readonly qaInfo = signal<QAInfo | null>(null);
  readonly copiedKey = signal<string | null>(null);

  private originalOutline = '';
  private originalOutlineOffset = '';
  private copyTimeout: any;

  constructor(
    @Inject(WorkspaceService) public workspaceService: WorkspaceService,
    private elementRef: ElementRef
  ) {
    // Reset hover highlight when inspector is deactivated
    effect(() => {
      if (!this.workspaceService.inspectorActive()) {
        this.clearHighlight();
      }
    });
  }

  @HostListener('document:mouseover', ['$event'])
  onMouseOver(event: MouseEvent): void {
    if (!this.workspaceService.inspectorActive()) return;

    const target = event.target as HTMLElement;
    if (!target) return;

    // Ignore html, body, and the inspector panel itself
    if (
      target === document.documentElement ||
      target === document.body ||
      target.closest('.qa-inspector-panel') ||
      this.elementRef.nativeElement.contains(target)
    ) {
      return;
    }

    // Clear previous highlight
    this.clearHighlight();

    // Store element and its original outline styles
    this.activeElement.set(target);
    this.originalOutline = target.style.outline || '';
    this.originalOutlineOffset = target.style.outlineOffset || '';

    // Apply high-contrast outline
    target.style.outline = '2px solid #3B82F6';
    target.style.outlineOffset = '2px';

    // Generate locator strings
    this.qaInfo.set(this.generateQAInfo(target));
  }

  @HostListener('document:mouseout', ['$event'])
  onMouseOut(event: MouseEvent): void {
    if (!this.workspaceService.inspectorActive()) return;

    const target = event.target as HTMLElement;
    if (this.activeElement() === target) {
      this.clearHighlight();
    }
  }

  copyLocator(key: string, value: string): void {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      this.copiedKey.set(key);
      if (this.copyTimeout) clearTimeout(this.copyTimeout);
      this.copyTimeout = setTimeout(() => {
        this.copiedKey.set(null);
      }, 1500);
    });
  }

  private clearHighlight(): void {
    const el = this.activeElement();
    if (el) {
      el.style.outline = this.originalOutline;
      el.style.outlineOffset = this.originalOutlineOffset;
      this.activeElement.set(null);
      this.qaInfo.set(null);
    }
  }

  private generateQAInfo(el: HTMLElement): QAInfo {
    const tagName = el.tagName.toLowerCase();
    const id = el.id || undefined;
    const classes = el.className && typeof el.className === 'string' ? el.className.split(' ').slice(0, 3).join('.') : undefined;
    const textRaw = el.innerText?.trim() || '';
    const text = textRaw ? textRaw.slice(0, 25).replace(/"/g, '\\"') : '';

    const nameAttr = el.getAttribute('name');
    const typeAttr = el.getAttribute('type');
    const placeholder = el.getAttribute('placeholder');
    const hrefAttr = el.getAttribute('href');

    // 1. Build CSS Selector
    let css = tagName;
    if (id) {
      css = `#${id}`;
    } else if (nameAttr) {
      css = `${tagName}[name="${nameAttr}"]`;
    } else if (typeAttr && tagName === 'input') {
      css = `input[type="${typeAttr}"]`;
    } else if (el.classList.length > 0) {
      const firstClass = el.classList.item(0);
      if (firstClass && !firstClass.includes(':') && !firstClass.startsWith('[') && !firstClass.includes('/')) {
        css = `${tagName}.${firstClass}`;
      }
    }

    // 2. Build XPath Selector
    let xpath = `//${tagName}`;
    if (id) {
      xpath = `//*[@id="${id}"]`;
    } else if (nameAttr) {
      xpath = `//${tagName}[@name="${nameAttr}"]`;
    } else if (tagName === 'button' && text) {
      xpath = `//button[contains(text(),"${text}")]`;
    } else if (tagName === 'a' && text) {
      xpath = `//a[contains(text(),"${text}")]`;
    } else if (text) {
      xpath = `//${tagName}[contains(text(),"${text.slice(0, 15)}")]`;
    }

    // 3. Playwright Locator
    let playwright = `page.locator('${css}')`;
    if (id) {
      playwright = `page.locator('#${id}')`;
    } else if (tagName === 'button' && text) {
      playwright = `page.get_by_role('button', name='${text}')`;
    } else if (tagName === 'a' && text) {
      playwright = `page.get_by_role('link', name='${text}')`;
    } else if (placeholder) {
      playwright = `page.get_by_placeholder('${placeholder}')`;
    } else if (nameAttr) {
      playwright = `page.locator('${tagName}[name="${nameAttr}"]')`;
    }

    // 4. Selenium Java
    let seleniumJava = `By.cssSelector("${css}")`;
    if (id) {
      seleniumJava = `By.id("${id}")`;
    } else if (nameAttr) {
      seleniumJava = `By.name("${nameAttr}")`;
    } else if (tagName === 'a' && text) {
      seleniumJava = `By.linkText("${text}")`;
    }

    // 5. Selenium Python
    let seleniumPython = `By.CSS_SELECTOR, "${css}"`;
    if (id) {
      seleniumPython = `By.ID, "${id}"`;
    } else if (nameAttr) {
      seleniumPython = `By.NAME, "${nameAttr}"`;
    } else if (tagName === 'a' && text) {
      seleniumPython = `By.LINK_TEXT, "${text}"`;
    }

    return {
      xpath,
      css,
      playwright,
      seleniumJava,
      seleniumPython,
      tagName: tagName.toUpperCase(),
      elementId: id,
      classes,
      text: textRaw ? `"${textRaw.slice(0, 20)}..."` : undefined
    };
  }
}
