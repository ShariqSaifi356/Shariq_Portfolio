import { DestroyRef, Directive, ElementRef, inject, input, OnChanges, SimpleChanges } from '@angular/core';

/** Give updated workflow content a short entrance without moving keyboard focus. */
@Directive({ selector: '[appMotionChange]' })
export class MotionChange implements OnChanges {
  readonly appMotionChange = input.required<string>();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private animation?: Animation;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterMotionSetup(this.element, destroyRef, () => this.animation?.cancel());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appMotionChange']?.firstChange) return;
    this.animation?.cancel();
    if (!this.element.animate || !window.matchMedia ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.animation = this.element.animate(
      [{ opacity: 0.4, translate: '0 10px' }, { opacity: 1, translate: '0 0' }],
      { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  }
}

function afterMotionSetup(element: HTMLElement, destroyRef: DestroyRef, cancel: () => void): void {
  const preference = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)') : undefined;
  const onChange = () => { if (preference?.matches) cancel(); };
  preference?.addEventListener('change', onChange);
  element.addEventListener('focusin', cancel);
  destroyRef.onDestroy(() => {
    cancel();
    element.removeEventListener('focusin', cancel);
    preference?.removeEventListener('change', onChange);
  });
}
