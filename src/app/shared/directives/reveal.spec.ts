import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Reveal } from './reveal';

@Component({ imports: [Reveal], template: '<div appReveal [revealDelay]="120"><button>Open</button></div>' })
class TestHost {}

describe('Reveal', () => {
  let intersect: IntersectionObserverCallback;
  let preferenceChange: () => void;
  let reduced = false;
  const disconnect = vi.fn();
  const observe = vi.fn();
  const cancel = vi.fn();
  const animate = vi.fn(() => ({ cancel }));
  const removeListener = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    reduced = false;
    vi.stubGlobal('matchMedia', () => ({
      get matches() { return reduced; },
      addEventListener: (_: string, callback: () => void) => { preferenceChange = callback; },
      removeEventListener: removeListener,
    }));
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) { intersect = callback; }
      observe = observe;
      disconnect = disconnect;
    });
    Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate });
    TestBed.configureTestingModule({ imports: [TestHost] });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(HTMLElement.prototype, 'animate');
  });

  it('starts on intersection and disconnects its observer', async () => {
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    expect(animate).not.toHaveBeenCalled();
    intersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(animate).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ delay: 120 }));
    expect(disconnect).toHaveBeenCalled();
    fixture.destroy();
    expect(cancel).toHaveBeenCalled();
    expect(removeListener).toHaveBeenCalled();
  });

  it('leaves content visible with reduced motion', async () => {
    reduced = true;
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    expect(observe).not.toHaveBeenCalled();
    expect(animate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Open');
  });

  it('cancels active motion when the system preference changes', async () => {
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    intersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    reduced = true;
    preferenceChange();
    expect(cancel).toHaveBeenCalled();
  });

  it('immediately reveals content when keyboard focus enters', async () => {
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    intersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    fixture.nativeElement.querySelector('button').dispatchEvent(new Event('focusin', { bubbles: true }));
    expect(cancel).toHaveBeenCalled();
  });
});
