import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QualityLab } from './quality-lab';

describe('QualityLab motion', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(HTMLElement.prototype, 'animate');
  });

  it('updates workflow content and cancels the previous transition on rapid selections', async () => {
    const cancel = vi.fn();
    const animate = vi.fn(() => ({ cancel }));
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate });
    TestBed.configureTestingModule({ imports: [QualityLab] });
    const fixture = TestBed.createComponent(QualityLab);
    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll('.scenario-picker button');
    buttons[1].click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.test-lens').textContent).toContain('Cover the contract');
    expect(animate).toHaveBeenCalledTimes(1);
    buttons[2].click();
    await fixture.whenStable();
    expect(cancel).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.test-lens').textContent).toContain('Choose coverage');
  });
});
