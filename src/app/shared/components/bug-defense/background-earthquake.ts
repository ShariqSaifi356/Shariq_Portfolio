/** Decorative copies keep the real text, links, and document layout intact. */
export class BackgroundEarthquake {
  private layer?: HTMLDivElement;
  private animations: Animation[] = [];
  private readonly onScroll = () => this.stop();

  start(height: number): void {
    this.stop();
    const main = document.querySelector<HTMLElement>('main');
    const background = main?.querySelector<HTMLElement>('.page-shell');
    if (!main || !background?.animate) return;

    const layer = document.createElement('div');
    layer.className = 'earthquake-characters';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText = 'position:fixed;inset:0;z-index:54;pointer-events:none;overflow:hidden;contain:strict;';
    this.layer = layer;
    document.body.append(layer);
    // Viewport-positioned copies no longer match their sources after scrolling.
    window.addEventListener('scroll', this.onScroll, { passive: true });

    // Measure before shaking so each letter starts exactly over its source.
    const targets = main.querySelectorAll<HTMLElement>('h1, h2, h3, .intro, .eyebrow, .impact-strip strong');
    let count = 0;
    for (const target of targets) {
      const bounds = target.getBoundingClientRect();
      if (bounds.top < 100 || bounds.bottom > height - 30 || !bounds.width) continue;
      const letters: { text: string; rect: DOMRect; style: CSSStyleDeclaration }[] = [];
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const style = getComputedStyle(node.parentElement!);
        if (style.visibility === 'hidden' || style.display === 'none') continue;
        let offset = 0;
        for (const character of node.textContent ?? '') {
          const range = document.createRange();
          range.setStart(node, offset);
          offset += character.length;
          range.setEnd(node, offset);
          if (!character.trim()) continue;
          const rect = range.getBoundingClientRect();
          if (rect.width && rect.height) letters.push({ text: character, rect, style });
        }
      }
      if (!letters.length || count + letters.length > 220) continue;
      const delay = 360 + (count % 5) * 85;
      this.animations.push(target.animate([
        { opacity: 1, offset: 0 },
        { opacity: 0, offset: 0.001 },
        { opacity: 0, offset: 0.94 },
        { opacity: 1, offset: 1 },
      ], { delay, duration: 6600 - delay, fill: 'none' }));

      for (const { text, rect, style } of letters) {
        const index = count++;
        const letter = document.createElement('span');
        letter.textContent = style.textTransform === 'uppercase' ? text.toUpperCase() : text;
        letter.style.cssText = 'position:absolute;display:block;white-space:pre;opacity:0;transform-origin:50% 75%;';
        Object.assign(letter.style, {
          left: `${rect.left}px`, top: `${rect.top}px`,
          fontFamily: style.fontFamily, fontSize: style.fontSize,
          fontWeight: style.fontWeight, fontStyle: style.fontStyle,
          lineHeight: `${rect.height}px`, color: style.color,
          letterSpacing: style.letterSpacing,
        });
        layer.append(letter);
        const drift = ((index * 37) % 181) - 90;
        const drop = Math.max(35, height - rect.bottom - 18 - (index % 4) * 12);
        const rotation = ((index * 53) % 241) - 120;
        this.animations.push(letter.animate([
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1, offset: 0 },
          { transform: `translate(${index % 2 ? -5 : 5}px, 3px) rotate(${index % 2 ? -8 : 8}deg)`, opacity: 1, offset: 0.09 },
          { transform: `translate(${drift * 0.25}px, ${drop * 0.08}px) rotate(${rotation * 0.2}deg)`, opacity: 1, offset: 0.2 },
          { transform: `translate(${drift}px, ${drop}px) rotate(${rotation}deg)`, opacity: 0.85, offset: 0.52 },
          { transform: `translate(${drift * 1.08}px, ${drop - 28}px) rotate(${rotation + 18}deg)`, opacity: 0.85, offset: 0.58 },
          { transform: `translate(${drift * 1.12}px, ${drop}px) rotate(${rotation + 25}deg)`, opacity: 0.8, offset: 0.64 },
          { transform: `translate(${drift * 1.12}px, ${drop}px) rotate(${rotation + 25}deg)`, opacity: 0.7, offset: 0.7 },
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1, offset: 0.94 },
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 0, offset: 1 },
        ], { delay, duration: 6600 - delay, easing: 'linear', fill: 'none' }));
      }
    }

    const tremors: Keyframe[] = Array.from({ length: 45 }, (_, index) => {
      const progress = index / 44;
      const strength = progress < 0.3 ? 1 : (1 - progress) * 0.65;
      return {
        translate: index === 0 || index === 44 ? '0 0' : `${Math.sin(index * 2.4) * 9 * strength}px ${Math.cos(index * 3.7) * 5 * strength}px`,
        offset: progress,
      };
    });
    this.animations.push(background.animate(tremors, { duration: 5900, easing: 'linear' }));
  }

  stop(): void {
    window.removeEventListener('scroll', this.onScroll);
    this.animations.forEach(animation => animation.cancel());
    this.animations = [];
    this.layer?.remove();
    this.layer = undefined;
  }
}
