import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CountUp } from './count-up';

@Component({ imports: [CountUp], template: '<strong aria-label="400 plus"><span [appCountUp]="400" aria-hidden="true">400</span>+</strong>' })
class CounterHost {}

describe('CountUp', () => {
  let intersect: IntersectionObserverCallback;
  let tick: FrameRequestCallback;
  let changed: () => void;
  let reduced = false;
  const cancel = vi.fn();
  const disconnect = vi.fn();

  beforeEach(() => {
    reduced = false;
    vi.clearAllMocks();
    vi.stubGlobal('matchMedia', () => ({
      get matches() { return reduced; },
      addEventListener: (_: string, callback: () => void) => { changed = callback; },
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) { intersect = callback; }
      observe = vi.fn();
      disconnect = disconnect;
    });
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { tick = callback; return 1; });
    vi.stubGlobal('cancelAnimationFrame', cancel);
    vi.spyOn(performance, 'now').mockReturnValue(0);
    TestBed.configureTestingModule({ imports: [CounterHost] });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('counts only after intersection, finishes exactly, and keeps the accessible value stable', async () => {
    const fixture = TestBed.createComponent(CounterHost);
    await fixture.whenStable();
    const number = fixture.nativeElement.querySelector('span');
    expect(number.textContent).toBe('400');
    intersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    tick(700);
    expect(Number(number.textContent)).toBeGreaterThan(0);
    expect(Number(number.textContent)).toBeLessThan(400);
    expect(fixture.nativeElement.querySelector('strong').getAttribute('aria-label')).toBe('400 plus');
    tick(1400);
    expect(number.textContent).toBe('400');
    fixture.destroy();
    expect(cancel).toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
  });

  it('restores the final number immediately if reduced motion is enabled during counting', async () => {
    const fixture = TestBed.createComponent(CounterHost);
    await fixture.whenStable();
    intersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    tick(300);
    reduced = true;
    changed();
    expect(fixture.nativeElement.querySelector('span').textContent).toBe('400');
    expect(cancel).toHaveBeenCalled();
  });
});
