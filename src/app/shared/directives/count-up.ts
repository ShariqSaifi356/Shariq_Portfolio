import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

/** Animate only the decorative number; its accessible label always contains the final value. */
@Directive({ selector: '[appCountUp]' })
export class CountUp {
  readonly appCountUp = input.required<number>();

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (!window.matchMedia || !window.IntersectionObserver) return;
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (preference.matches) return;
      let frame = 0;
      const finish = () => {
        cancelAnimationFrame(frame);
        element.textContent = String(this.appCountUp());
      };
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        if (preference.matches) return;
        const started = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - started) / 1400, 1);
          element.textContent = String(Math.round(this.appCountUp() * (1 - (1 - progress) ** 3)));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      }, { threshold: 0.5 });
      const onPreferenceChange = () => {
        if (preference.matches) {
          observer.disconnect();
          finish();
        }
      };
      observer.observe(element);
      preference.addEventListener('change', onPreferenceChange);
      destroyRef.onDestroy(() => {
        observer.disconnect();
        finish();
        preference.removeEventListener('change', onPreferenceChange);
      });
    });
  }
}
