import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

/** One-shot entrances. Content remains visible if motion APIs are unavailable. */
@Directive({ selector: '[appReveal]' })
export class Reveal {
  readonly revealDelay = input(0);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const element = this.element;
      if (!window.matchMedia || !window.IntersectionObserver || !element.animate) return;
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (preference.matches) return;

      let animation: Animation | undefined;
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        element.classList.add('motion-entered');
        if (preference.matches || element.contains(document.activeElement)) return;
        animation = element.animate(
          [
            { opacity: 0, translate: '0 24px' },
            { opacity: 1, translate: '0 0' },
          ],
          {
            duration: 720,
            delay: Math.min(Math.max(this.revealDelay(), 0), 480),
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'backwards',
          },
        );
      }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

      const stop = () => animation?.cancel();
      const onPreferenceChange = () => {
        if (preference.matches) {
          observer.disconnect();
          stop();
        }
      };
      observer.observe(element);
      // Never delay visibility when someone tabs or clicks into an entering element.
      element.addEventListener('focusin', stop);
      element.addEventListener('pointerdown', stop);
      preference.addEventListener('change', onPreferenceChange);
      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        stop();
        element.removeEventListener('focusin', stop);
        element.removeEventListener('pointerdown', stop);
        preference.removeEventListener('change', onPreferenceChange);
      });
    });
  }
}
