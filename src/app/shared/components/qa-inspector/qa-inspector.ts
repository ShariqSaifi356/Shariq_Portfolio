import {
  Component,
  HostListener,
  Inject,
  signal,
  effect,
  ElementRef,
  computed,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceService } from '../../services/workspace.service';

interface QAInfo {
  bestLocator: string;
  bestLocatorLabel: string;
  xpath: string;
  css: string;
  playwright: string;
  seleniumJava: string;
  seleniumPython: string;
  tagName: string;
  elementId?: string;
  classes?: string;
  text?: string;
  role?: string;
  testId?: string;
  testIdAttribute?: string;
  name?: string;
  placeholder?: string;
  ariaLabel?: string;
  href?: string;
  dimensions: string;
  domPath: string;
}

interface LocatorRow {
  key: string;
  label: string;
  value: string;
  primary?: boolean;
}

@Component({
  selector: 'app-qa-inspector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qa-inspector.html',
})
export class QaInspectorComponent implements OnInit, OnDestroy {
  readonly activeElement = signal<HTMLElement | null>(null);
  readonly qaInfo = signal<QAInfo | null>(null);
  readonly copiedKey = signal<string | null>(null);
  readonly locked = signal<boolean>(false);
  readonly locatorRows = computed<LocatorRow[]>(() => {
    const info = this.qaInfo();
    if (!info) return [];

    return [
      {
        key: 'best',
        label: `Best (${info.bestLocatorLabel})`,
        value: info.bestLocator,
        primary: true,
      },
      { key: 'css', label: 'CSS selector', value: info.css },
      { key: 'xpath', label: 'XPath', value: info.xpath },
      { key: 'playwright', label: 'Playwright', value: info.playwright },
      { key: 'java', label: 'Selenium Java', value: info.seleniumJava },
      { key: 'python', label: 'Selenium Python', value: info.seleniumPython },
    ];
  });

  private originalOutline = '';
  private originalOutlineOffset = '';
  private copyTimeout: any;
  private readonly pageClickCaptureHandler = (event: MouseEvent): void =>
    this.onPageClickCapture(event);

  constructor(
    @Inject(WorkspaceService) public workspaceService: WorkspaceService,
    private elementRef: ElementRef,
  ) {
    // Reset hover highlight when inspector is deactivated
    effect(() => {
      if (!this.workspaceService.inspectorActive()) {
        this.clearSelection();
      }
    });
  }

  ngOnInit(): void {
    document.addEventListener('click', this.pageClickCaptureHandler, true);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.pageClickCaptureHandler, true);
    if (this.copyTimeout) clearTimeout(this.copyTimeout);
    this.clearSelection();
  }

  @HostListener('document:mouseover', ['$event'])
  onMouseOver(event: MouseEvent): void {
    if (!this.workspaceService.inspectorActive()) return;
    if (this.locked()) return;

    const target = this.getInspectableTarget(event.target);
    if (!target) return;

    this.inspectElement(target, false);
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (!this.workspaceService.inspectorActive()) return;

    event.preventDefault();
    this.clearSelection();
  }

  closeInspector(): void {
    this.clearSelection();
    if (this.workspaceService.inspectorActive()) {
      this.workspaceService.toggleInspector();
    }
  }

  clearSelection(): void {
    this.restoreHighlight();
    this.qaInfo.set(null);
    this.locked.set(false);
    this.workspaceService.setInspectorTimerPaused(false);
    this.copiedKey.set(null);
  }

  copyLocator(key: string, value: string): void {
    if (!value) return;

    this.writeToClipboard(value).then(() => {
      this.copiedKey.set(key);
      if (this.copyTimeout) clearTimeout(this.copyTimeout);
      this.copyTimeout = setTimeout(() => {
        this.copiedKey.set(null);
      }, 1500);
    });
  }

  copySummary(info: QAInfo): void {
    this.copyLocator('summary', this.formatClipboardSummary(info));
  }

  private onPageClickCapture(event: MouseEvent): void {
    if (!this.workspaceService.inspectorActive()) return;
    if (this.isInspectorUiTarget(event.target)) return;

    const target = this.getInspectableTarget(event.target);
    if (!target) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    this.inspectElement(target, true);
    this.workspaceService.setInspectorTimerPaused(true);
  }

  private inspectElement(target: HTMLElement, lockSelection: boolean): void {
    if (this.activeElement() !== target) {
      this.restoreHighlight();
      this.activeElement.set(target);
      this.originalOutline = target.style.outline || '';
      this.originalOutlineOffset = target.style.outlineOffset || '';
    }

    target.style.outline = '2px solid #3B82F6';
    target.style.outlineOffset = '2px';
    this.locked.set(lockSelection);
    this.qaInfo.set(this.generateQAInfo(target));
  }

  private restoreHighlight(): void {
    const el = this.activeElement();
    if (!el) return;

    el.style.outline = this.originalOutline;
    el.style.outlineOffset = this.originalOutlineOffset;
    this.activeElement.set(null);
    this.originalOutline = '';
    this.originalOutlineOffset = '';
  }

  private getInspectableTarget(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof Element)) return null;
    if (this.isInspectorUiTarget(target)) return null;

    const preferred = this.closestHTMLElement(
      target,
      [
        'button',
        'a',
        'input',
        'textarea',
        'select',
        'label',
        'summary',
        '[data-testid]',
        '[data-test]',
        '[data-cy]',
        '[aria-label]',
        '[role]',
      ].join(','),
    );
    const structural = this.closestHTMLElement(
      target,
      [
        'section',
        'article',
        'form',
        'nav',
        'header',
        'footer',
        'main',
        'h1',
        'h2',
        'h3',
        'h4',
        'li',
        'p',
      ].join(','),
    );
    const candidate = preferred ?? structural ?? (target instanceof HTMLElement ? target : null);

    if (!candidate || candidate === document.documentElement || candidate === document.body) {
      return null;
    }

    return candidate;
  }

  private closestHTMLElement(element: Element, selector: string): HTMLElement | null {
    const candidate = element.closest(selector);
    return candidate instanceof HTMLElement ? candidate : null;
  }

  private isInspectorUiTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;

    return (
      this.elementRef.nativeElement.contains(target) || !!target.closest('[data-inspector-control]')
    );
  }

  private async writeToClipboard(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  private formatClipboardSummary(info: QAInfo): string {
    const details = [
      `Element: <${info.tagName.toLowerCase()}>${info.text ? ` ${info.text}` : ''}`,
      `Best locator (${info.bestLocatorLabel}): ${info.bestLocator}`,
      `CSS: ${info.css}`,
      `XPath: ${info.xpath}`,
      `Playwright: ${info.playwright}`,
      `Selenium Java: ${info.seleniumJava}`,
      `Selenium Python: ${info.seleniumPython}`,
      `DOM path: ${info.domPath}`,
      `Size: ${info.dimensions}`,
    ];

    return details.join('\n');
  }

  private generateQAInfo(el: HTMLElement): QAInfo {
    const tagName = el.tagName.toLowerCase();
    const id = el.id || undefined;
    const testIdAttribute = this.getTestIdAttribute(el);
    const testId = testIdAttribute ? el.getAttribute(testIdAttribute) || undefined : undefined;
    const classes =
      el.className && typeof el.className === 'string'
        ? el.className.split(/\s+/).filter(Boolean).slice(0, 4).join('.')
        : undefined;
    const textRaw = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
    const locatorText = this.truncate(textRaw, 60);
    const nameAttr = el.getAttribute('name');
    const typeAttr = el.getAttribute('type');
    const placeholder = el.getAttribute('placeholder');
    const hrefAttr = el.getAttribute('href');
    const ariaLabel = el.getAttribute('aria-label') || undefined;
    const role = el.getAttribute('role') || this.getImplicitRole(el);
    const accessibleName =
      ariaLabel || placeholder || el.getAttribute('alt') || el.getAttribute('title') || locatorText;
    const css = this.buildCssSelector(el);
    const xpath = this.buildXpath(
      el,
      tagName,
      id,
      testId,
      nameAttr || undefined,
      ariaLabel,
      locatorText,
    );
    const playwright = this.buildPlaywrightLocator(
      tagName,
      css,
      id,
      testId,
      role,
      accessibleName,
      placeholder || undefined,
      nameAttr || undefined,
      locatorText,
    );
    const seleniumJava = this.buildSeleniumJavaLocator(
      tagName,
      css,
      id,
      nameAttr || undefined,
      locatorText,
    );
    const seleniumPython = this.buildSeleniumPythonLocator(
      tagName,
      css,
      id,
      nameAttr || undefined,
      locatorText,
    );
    const best = this.getBestLocator(
      css,
      testId,
      testIdAttribute,
      id,
      role,
      accessibleName,
      playwright,
    );
    const rect = el.getBoundingClientRect();

    return {
      bestLocator: best.value,
      bestLocatorLabel: best.label,
      xpath,
      css,
      playwright,
      seleniumJava,
      seleniumPython,
      tagName: tagName.toUpperCase(),
      elementId: id,
      classes,
      text: textRaw ? `"${this.truncate(textRaw, 50)}"` : undefined,
      role,
      testId,
      testIdAttribute,
      name: nameAttr || undefined,
      placeholder: placeholder || undefined,
      ariaLabel,
      href: hrefAttr || undefined,
      dimensions: `${Math.round(rect.width)} x ${Math.round(rect.height)} px`,
      domPath: this.buildDomPath(el),
    };
  }

  private buildCssSelector(el: HTMLElement): string {
    const tagName = el.tagName.toLowerCase();
    const candidates: string[] = [];
    const id = el.id;
    const testIdAttribute = this.getTestIdAttribute(el);
    const testId = testIdAttribute ? el.getAttribute(testIdAttribute) : null;
    const name = el.getAttribute('name');
    const type = el.getAttribute('type');
    const ariaLabel = el.getAttribute('aria-label');
    const placeholder = el.getAttribute('placeholder');

    if (id) candidates.push(`#${this.escapeCssIdentifier(id)}`);
    if (testId)
      candidates.push(
        `[data-testid="${this.escapeCssAttribute(testId)}"]`,
        `[data-test="${this.escapeCssAttribute(testId)}"]`,
        `[data-cy="${this.escapeCssAttribute(testId)}"]`,
      );
    if (name) candidates.push(`${tagName}[name="${this.escapeCssAttribute(name)}"]`);
    if (ariaLabel)
      candidates.push(`${tagName}[aria-label="${this.escapeCssAttribute(ariaLabel)}"]`);
    if (placeholder)
      candidates.push(`${tagName}[placeholder="${this.escapeCssAttribute(placeholder)}"]`);
    if (type && tagName === 'input')
      candidates.push(`input[type="${this.escapeCssAttribute(type)}"]`);

    const classSelector = Array.from(el.classList)
      .filter(
        (className) =>
          !className.includes(':') && !className.startsWith('[') && !className.includes('/'),
      )
      .slice(0, 2)
      .map((className) => `.${this.escapeCssIdentifier(className)}`)
      .join('');
    if (classSelector) candidates.push(`${tagName}${classSelector}`);

    const uniqueCandidate = candidates.find((candidate) => this.isUniqueCssSelector(candidate, el));
    return uniqueCandidate || this.buildDomPath(el);
  }

  private buildDomPath(el: HTMLElement): string {
    const segments: string[] = [];
    let current: HTMLElement | null = el;

    while (
      current &&
      current !== document.body &&
      current !== document.documentElement &&
      segments.length < 6
    ) {
      const tagName = current.tagName.toLowerCase();
      if (current.id) {
        segments.unshift(`#${this.escapeCssIdentifier(current.id)}`);
        break;
      }

      let segment = tagName;
      const stableClass = Array.from(current.classList).find(
        (className) =>
          !className.includes(':') && !className.startsWith('[') && !className.includes('/'),
      );
      if (stableClass) {
        segment += `.${this.escapeCssIdentifier(stableClass)}`;
      }

      const sameTagSiblings = Array.from(current.parentElement?.children || []).filter(
        (child) => child.tagName === current?.tagName,
      );
      if (sameTagSiblings.length > 1) {
        segment += `:nth-of-type(${sameTagSiblings.indexOf(current) + 1})`;
      }

      segments.unshift(segment);
      const selector = segments.join(' > ');
      if (this.isUniqueCssSelector(selector, el)) break;

      current = current.parentElement;
    }

    return segments.join(' > ') || el.tagName.toLowerCase();
  }

  private buildXpath(
    el: HTMLElement,
    tagName: string,
    id?: string,
    testId?: string,
    name?: string,
    ariaLabel?: string,
    text?: string,
  ): string {
    if (id) return `//*[@id=${this.toXpathLiteral(id)}]`;
    if (testId)
      return `//*[@data-testid=${this.toXpathLiteral(testId)} or @data-test=${this.toXpathLiteral(testId)} or @data-cy=${this.toXpathLiteral(testId)}]`;
    if (name) return `//${tagName}[@name=${this.toXpathLiteral(name)}]`;
    if (ariaLabel) return `//${tagName}[@aria-label=${this.toXpathLiteral(ariaLabel)}]`;
    if ((tagName === 'button' || tagName === 'a') && text)
      return `//${tagName}[contains(normalize-space(), ${this.toXpathLiteral(text)})]`;

    return this.buildAbsoluteXpath(el);
  }

  private buildAbsoluteXpath(el: HTMLElement): string {
    const segments: string[] = [];
    let current: HTMLElement | null = el;

    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
      const tagName = current.tagName.toLowerCase();
      const siblings = Array.from(current.parentElement?.children || []).filter(
        (child) => child.tagName === current?.tagName,
      );
      const index = siblings.length > 1 ? `[${siblings.indexOf(current) + 1}]` : '';
      segments.unshift(`${tagName}${index}`);
      current = current.parentElement;
    }

    return `//${segments.join('/')}`;
  }

  private buildPlaywrightLocator(
    tagName: string,
    css: string,
    id?: string,
    testId?: string,
    role?: string,
    accessibleName?: string,
    placeholder?: string,
    name?: string,
    text?: string,
  ): string {
    if (testId) return `page.getByTestId('${this.escapeSingleQuoted(testId)}')`;
    if (role && accessibleName)
      return `page.getByRole('${role}', { name: '${this.escapeSingleQuoted(accessibleName)}' })`;
    if (placeholder) return `page.getByPlaceholder('${this.escapeSingleQuoted(placeholder)}')`;
    if (text) return `page.getByText('${this.escapeSingleQuoted(text)}')`;
    if (id) return `page.locator('#${this.escapeSingleQuoted(this.escapeCssIdentifier(id))}')`;
    if (name) return `page.locator('${tagName}[name="${this.escapeDoubleQuoted(name)}"]')`;

    return `page.locator('${this.escapeSingleQuoted(css)}')`;
  }

  private buildSeleniumJavaLocator(
    tagName: string,
    css: string,
    id?: string,
    name?: string,
    text?: string,
  ): string {
    if (id) return `By.id("${this.escapeDoubleQuoted(id)}")`;
    if (name) return `By.name("${this.escapeDoubleQuoted(name)}")`;
    if (tagName === 'a' && text) return `By.linkText("${this.escapeDoubleQuoted(text)}")`;

    return `By.cssSelector("${this.escapeDoubleQuoted(css)}")`;
  }

  private buildSeleniumPythonLocator(
    tagName: string,
    css: string,
    id?: string,
    name?: string,
    text?: string,
  ): string {
    if (id) return `By.ID, "${this.escapeDoubleQuoted(id)}"`;
    if (name) return `By.NAME, "${this.escapeDoubleQuoted(name)}"`;
    if (tagName === 'a' && text) return `By.LINK_TEXT, "${this.escapeDoubleQuoted(text)}"`;

    return `By.CSS_SELECTOR, "${this.escapeDoubleQuoted(css)}"`;
  }

  private getBestLocator(
    css: string,
    testId: string | undefined,
    testIdAttribute: string | undefined,
    id: string | undefined,
    role: string | undefined,
    accessibleName: string | undefined,
    playwright: string,
  ): { label: string; value: string } {
    if (testId && testIdAttribute)
      return {
        label: 'test id',
        value: `[${testIdAttribute}="${this.escapeCssAttribute(testId)}"]`,
      };
    if (role && accessibleName) return { label: 'role', value: playwright };
    if (id) return { label: 'id', value: `#${this.escapeCssIdentifier(id)}` };

    return { label: 'css', value: css };
  }

  private getImplicitRole(el: HTMLElement): string | undefined {
    const tagName = el.tagName.toLowerCase();
    const type = (el.getAttribute('type') || '').toLowerCase();

    if (tagName === 'button') return 'button';
    if (tagName === 'a' && el.hasAttribute('href')) return 'link';
    if (tagName === 'select') return 'combobox';
    if (tagName === 'textarea') return 'textbox';
    if (tagName === 'input') {
      if (['button', 'submit', 'reset'].includes(type)) return 'button';
      if (type === 'checkbox') return 'checkbox';
      if (type === 'radio') return 'radio';
      if (type === 'range') return 'slider';
      return 'textbox';
    }

    return undefined;
  }

  private getTestIdAttribute(el: HTMLElement): string | undefined {
    return ['data-testid', 'data-test', 'data-cy'].find((attribute) => el.hasAttribute(attribute));
  }

  private isUniqueCssSelector(selector: string, el: HTMLElement): boolean {
    try {
      const matches = document.querySelectorAll(selector);
      return matches.length === 1 && matches.item(0) === el;
    } catch {
      return false;
    }
  }

  private truncate(value: string, maxLength: number): string {
    return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
  }

  private escapeCssIdentifier(value: string): string {
    const css = (globalThis as typeof globalThis & { CSS?: { escape?: (value: string) => string } })
      .CSS;
    if (css?.escape) return css.escape(value);

    return value.replace(/[^a-zA-Z0-9_-]/g, (match) => `\\${match}`);
  }

  private escapeCssAttribute(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  private escapeSingleQuoted(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  private escapeDoubleQuoted(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  private toXpathLiteral(value: string): string {
    if (!value.includes('"')) return `"${value}"`;
    if (!value.includes("'")) return `'${value}'`;

    return `concat(${value
      .split('"')
      .map((part) => `"${part}"`)
      .join(", '\"', ")})`;
  }
}
