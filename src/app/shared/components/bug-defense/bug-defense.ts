import { afterNextRender, Component, DestroyRef, effect, ElementRef, HostListener, inject, NgZone, viewChild } from '@angular/core';
import { BugDefenseService, DefensePhase } from '../../services/bug-defense.service';
import { BackgroundEarthquake } from './background-earthquake';

const FAILURES = [
  'SYSTEM FAILURE', 'ASSERTION FAILED', 'API TIMEOUT', 'MEMORY LEAK',
  'DATABASE ERROR', 'AUTH FAILURE', 'BROKEN BUILD', 'NULL REFERENCE',
  'RACE CONDITION', 'UI REGRESSION',
] as const;
const SHOT_INTERVAL = 480;
interface Bug { x: number; y: number; delay: number; type: number; size: number; label: string; }
@Component({ selector: 'app-bug-defense', templateUrl: './bug-defense.html', styleUrl: './bug-defense.css' })
export class BugDefense {
  readonly totalBugs = FAILURES.length;
  readonly defense = inject(BugDefenseService);
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('scene');
  private readonly zone = inject(NgZone);
  private frame = 0;
  private autoTimer = 0;
  private lastRequest = 0;
  private width = 0;
  private height = 0;
  private bugs: Bug[] = [];
  private damageAnimations: Animation[] = [];
  private readonly earthquake = new BackgroundEarthquake();

  constructor() {
    const destroyRef = inject(DestroyRef);
    effect(() => {
      const request = this.defense.request();
      const canvas = this.canvas()?.nativeElement;
      if (request && request !== this.lastRequest && canvas) {
        this.lastRequest = request;
        this.start(canvas);
      }
    });
    afterNextRender(() => {
      if (!window.matchMedia) return;
      const desktop = window.matchMedia('(min-width: 1200px)');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      const sync = () => {
        this.defense.available.set(desktop.matches && !reduced.matches);
        if (!this.defense.available()) this.stop();
      };
      sync();
      desktop.addEventListener('change', sync);
      reduced.addEventListener('change', sync);
      if (this.defense.available()) this.autoTimer = window.setTimeout(() => this.defense.play(), 1600);
      destroyRef.onDestroy(() => {
        desktop.removeEventListener('change', sync);
        reduced.removeEventListener('change', sync);
      });
    });
    destroyRef.onDestroy(() => this.stop());
  }
  @HostListener('document:keydown.escape') onEscape(): void { this.stop(); }
  @HostListener('window:resize') onResize(): void { this.stop(); }
  @HostListener('document:visibilitychange') onVisibility(): void { if (document.hidden) this.stop(); }

  stop(): void {
    window.clearTimeout(this.autoTimer);
    cancelAnimationFrame(this.frame);
    this.repair();
    this.defense.dismiss();
  }
  private repair(): void {
    this.earthquake.stop();
    this.damageAnimations.forEach(animation => animation.cancel());
    this.damageAnimations = [];
  }
  private start(canvas: HTMLCanvasElement): void {
    this.stop();
    if (!this.defense.available()) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.width = window.innerWidth; this.height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(this.width * ratio); canvas.height = Math.round(this.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.bugs = FAILURES.map((label, i) => ({
      label,
      x: this.width * (0.1 + ((i * 7) % this.totalBugs) / this.totalBugs * 0.8),
      y: this.height * (0.28 + (i % 4) * 0.115), delay: (i % 5) * 170, type: i % 3, size: 19 + (i % 3) * 5,
    }));
    this.defense.cleared.set(0); this.defense.progress.set(0); this.defense.phase.set('invasion');
    const started = performance.now();
    let damaged = false;
    this.zone.runOutsideAngular(() => {
      const tick = (now: number) => {
        const elapsed = now - started;
        if (elapsed >= 9000) {
          this.repair(); ctx.clearRect(0, 0, this.width, this.height);
          this.defense.cleared.set(this.totalBugs); this.defense.progress.set(100); this.defense.phase.set('complete');
          return;
        }
        const phase: DefensePhase = elapsed < 3000 ? 'invasion' : elapsed < 7800 ? 'defending' : 'repairing';
        this.defense.phase.set(phase);
        this.defense.progress.set(Math.floor(elapsed / 90));
        this.defense.cleared.set(Math.min(this.totalBugs, Math.max(0, Math.floor((elapsed - 3300) / SHOT_INTERVAL) + 1)));
        if (elapsed > 1200 && !damaged) { damaged = true; this.damage(); }
        if (elapsed > 7800) this.repair();
        this.draw(ctx, elapsed);
        this.frame = requestAnimationFrame(tick);
      };
      this.frame = requestAnimationFrame(tick);
    });
  }
  private damage(): void {
    this.earthquake.start(this.height);
    // Canceling the animations restores the original styles, without altering page content.
    const cards = document.querySelectorAll<HTMLElement>('.hero-copy, app-automation-art, .impact-strip, .experience-card, .project-card, .tool-card, .lab-shell, .ai-card, .contact-section');
    this.damageAnimations = [...cards].filter(card => {
      const rect = card.getBoundingClientRect();
      return rect.bottom > 100 && rect.top < this.height && !!card.animate;
    }).slice(0, 8).map((element, i) => element.animate([
      { translate: '0 0', rotate: '0deg', filter: 'none' },
      { translate: `${i % 2 ? -8 : 8}px 6px`, rotate: `${i % 2 ? -1 : 1}deg`, filter: 'grayscale(0.6)', offset: 0.12 },
      { translate: `${i % 2 ? 5 : -5}px 10px`, rotate: `${i % 2 ? 0.6 : -0.6}deg`, filter: 'grayscale(0.8)', offset: 0.65 },
      { translate: '0 0', rotate: '0deg', filter: 'none' },
    ], { duration: 6600, easing: 'ease-in-out' }));
  }
  private draw(ctx: CanvasRenderingContext2D, time: number): void {
    const w = this.width, h = this.height;
    ctx.clearRect(0, 0, w, h);
    const fade = time > 8000 ? Math.max(0, (9000 - time) / 1000) : Math.min(time / 500, 1);
    ctx.globalAlpha = fade;
    const wash = ctx.createLinearGradient(0, 0, 0, h);
    wash.addColorStop(0, '#11172208'); wash.addColorStop(1, '#101a2c70');
    ctx.fillStyle = wash; ctx.fillRect(0, 0, w, h);
    const origin = { x: w / 2, y: h - 65 };
    let aim = { x: w / 2, y: h / 2 };
    this.bugs.forEach((bug, i) => {
      const hit = 3300 + i * SHOT_INTERVAL;
      const fall = Math.min(1, Math.max(0, (time - bug.delay) / 1500));
      const x = bug.x + Math.sin(time / 260 + i) * 15;
      const y = -65 + (bug.y + 65) * (1 - (1 - fall) ** 2) + Math.sin(time / 350 + i) * 9;
      if (time < hit && time >= hit - SHOT_INTERVAL) aim = { x, y };
      if (time >= hit - 140 && time < hit) {
        ctx.save(); ctx.strokeStyle = '#9cffe1'; ctx.shadowColor = '#65ffd0'; ctx.shadowBlur = 14;
        const distance = Math.hypot(x - origin.x, y - origin.y);
        const dx = (x - origin.x) / distance, dy = (y - origin.y) / distance;
        for (const side of [-1, 1]) {
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(origin.x + dx * 82 - dy * side * 12, origin.y + dy * 82 + dx * side * 12);
          ctx.lineTo(x, y); ctx.stroke();
        }
        ctx.restore();
      }
      if (time >= hit) {
        const burst = (time - hit) / 580;
        if (burst < 1) {
          ctx.save(); ctx.globalAlpha = fade * (1 - burst); ctx.strokeStyle = '#aaffd6'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(x, y, 12 + burst * 44, 0, Math.PI * 2); ctx.stroke();
          for (let p = 0; p < 8; p++) {
            const a = p * Math.PI / 4;
            ctx.fillStyle = p % 2 ? '#b9ffe3' : '#f9cc7b';
            ctx.fillRect(x + Math.cos(a) * burst * 75, y + Math.sin(a) * burst * 75, 4, 4);
          }
          ctx.font = '600 11px monospace'; ctx.fillStyle = '#aaffd6'; ctx.fillText('PATCHED ✓', x - 30, y - 25 - burst * 15); ctx.restore();
        }
        return;
      }
      if (bug.type === 1 && time < 2700) {
        ctx.strokeStyle = '#b7c6eb55'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, 88); ctx.lineTo(x, y); ctx.stroke();
      }
      this.drawBug(ctx, x, y, bug, time);
      if (time > 1200) {
        const color = ['#ffac93', '#d2b2ff', '#ffda8c'][bug.type];
        ctx.save(); ctx.font = '600 10px monospace';
        const labelWidth = ctx.measureText(bug.label).width + 30;
        const labelY = y + bug.size + 17;
        ctx.fillStyle = '#111c2af5'; ctx.strokeStyle = color + '99'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(x - labelWidth / 2, labelY, labelWidth, 25, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x - labelWidth / 2 + 9, labelY + 12.5, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.textAlign = 'center'; ctx.fillText(bug.label, x + 5, labelY + 16);
        ctx.restore();
      }
    });
    if (time > 2600) this.drawBlaster(ctx, origin.x, origin.y, aim.x, aim.y, time);
    if (time > 7800) {
      const y = (time - 7800) / 1200 * h;
      const scan = ctx.createLinearGradient(0, y - 70, 0, y);
      scan.addColorStop(0, '#8effd000'); scan.addColorStop(1, '#8effd030');
      ctx.fillStyle = scan; ctx.fillRect(0, y - 70, w, 70);
      ctx.fillStyle = '#adffdc'; ctx.fillRect(0, y, w, 2);
    }
    ctx.globalAlpha = 1;
  }
  private drawBug(ctx: CanvasRenderingContext2D, x: number, y: number, bug: Bug, time: number): void {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(time / 300 + bug.type) * 0.13);
    const s = bug.size, color = ['#ff9878', '#c6a2ff', '#ffd074'][bug.type];
    const armor = ctx.createLinearGradient(-s, -s, s, s);
    armor.addColorStop(0, '#617389'); armor.addColorStop(0.35, '#293449'); armor.addColorStop(1, '#101625');
    // Articulated legs, luminous joints, and darker under-strokes give the sprites depth.
    const legs = bug.type === 1 ? 4 : 3;
    for (const side of [-1, 1]) for (let leg = 0; leg < legs; leg++) {
      const ly = (leg - (legs - 1) / 2) * 10, step = Math.sin(time / 100 + leg * 2) * 4;
      for (const outline of [true, false]) {
        ctx.strokeStyle = outline ? '#101724' : color; ctx.lineWidth = outline ? 5 : 2;
        ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(side * s * 0.45, ly);
        ctx.lineTo(side * (s + 6), ly - 9 + step); ctx.lineTo(side * (s + 17), ly + 9 + step); ctx.stroke();
      }
      ctx.fillStyle = '#edf4ff'; ctx.beginPath(); ctx.arc(side * (s + 6), ly - 9 + step, 2, 0, Math.PI * 2); ctx.fill();
    }
    if (bug.type === 2) {
      for (const side of [-1, 1]) {
        ctx.save(); ctx.rotate(side * (0.22 + Math.sin(time / 45) * 0.12));
        const wing = ctx.createLinearGradient(0, 0, side * 42, -25);
        wing.addColorStop(0, '#b9f5ff88'); wing.addColorStop(1, '#d5eaff15');
        ctx.fillStyle = wing; ctx.strokeStyle = '#c6f5ff88'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(side * 24, -8, 16, 27, side * 0.65, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(side * 5, 10); ctx.lineTo(side * 33, -27); ctx.stroke(); ctx.restore();
      }
    }
    ctx.fillStyle = armor; ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.shadowColor = color; ctx.shadowBlur = 13;
    ctx.beginPath(); ctx.ellipse(0, bug.type === 1 ? 9 : 3, s * (bug.type === 1 ? 0.78 : 0.65), s * 0.9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
    if (bug.type === 1) {
      // A separate head and a diamond marking distinguish the eight-legged spider.
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(7, 8); ctx.lineTo(0, 19); ctx.lineTo(-7, 8); ctx.closePath(); ctx.fill();
    } else {
      ctx.strokeStyle = color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, -s * 0.7); ctx.lineTo(0, s * 0.9); ctx.stroke();
      for (const side of [-1, 1]) for (let band = 0; band < 3; band++) {
        ctx.fillStyle = color; ctx.globalAlpha *= 0.8;
        ctx.beginPath(); ctx.ellipse(side * s * 0.32, -3 + band * 8, 3, 2, side * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha /= 0.8;
      }
    }
    ctx.fillStyle = armor; ctx.strokeStyle = color;
    ctx.beginPath(); ctx.ellipse(0, -s * 0.7, s * 0.49, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (const side of [-1, 1]) {
      ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(side * 6, -s); ctx.quadraticCurveTo(side * 11, -s - 16, side * 18, -s - 12); ctx.stroke();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(side * 18, -s - 12, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = color; ctx.shadowBlur = 9; ctx.fillStyle = '#fff0dc';
      ctx.beginPath(); ctx.ellipse(side * 5, -s * 0.7, 3.5, 4, side * -0.25, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }
    ctx.restore();
  }
  private drawBlaster(ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number, time: number): void {
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= Math.min(1, (time - 2600) / 400);
    const shot = Math.ceil((time - 3300) / SHOT_INTERVAL);
    const remaining = 3300 + shot * SHOT_INTERVAL - time;
    const firing = shot >= 0 && shot < this.totalBugs && remaining >= 0 && remaining < 140;
    const recoil = firing ? Math.sin((140 - remaining) / 140 * Math.PI) * 5 : 0;
    // Stabilizer feet and concentric platform rings anchor the rotating cannon.
    ctx.fillStyle = '#101d2c'; ctx.strokeStyle = '#5e938f'; ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(side * 20, 8); ctx.lineTo(side * 66, 15); ctx.lineTo(side * 77, 30); ctx.lineTo(side * 28, 28); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#a3f9d3'; ctx.fillRect(side * 62 - 5, 22, 10, 3); ctx.fillStyle = '#101d2c';
    }
    ctx.beginPath(); ctx.ellipse(0, 18, 58, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#9effd4'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(0, 18, 43, 11, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.save(); ctx.rotate(Math.atan2(ty - y, tx - x) + Math.PI / 2); ctx.translate(0, recoil);
    const metal = ctx.createLinearGradient(-28, 0, 28, 0);
    metal.addColorStop(0, '#203d4a'); metal.addColorStop(0.4, '#5a8290'); metal.addColorStop(0.6, '#294a58'); metal.addColorStop(1, '#152a38');
    ctx.fillStyle = metal; ctx.strokeStyle = '#95c9c4'; ctx.lineWidth = 1.5;
    for (const side of [-1, 1]) {
      ctx.beginPath(); ctx.roundRect(side * 12 - 7, -79, 14, 58, 3); ctx.fill(); ctx.stroke();
      for (let vent = 0; vent < 4; vent++) { ctx.fillStyle = '#0c202e'; ctx.fillRect(side * 12 - 5, -65 + vent * 8, 10, 3); }
      ctx.fillStyle = firing ? '#e5fff3' : '#7bedcf'; ctx.shadowColor = '#8affd2'; ctx.shadowBlur = firing ? 22 : 8;
      ctx.fillRect(side * 12 - 8, -83, 16, 6); ctx.shadowBlur = 0; ctx.fillStyle = metal;
    }
    ctx.beginPath(); ctx.moveTo(-24, -32); ctx.lineTo(24, -32); ctx.lineTo(31, -12); ctx.lineTo(23, 20); ctx.lineTo(-23, 20); ctx.lineTo(-31, -12); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#132839'; ctx.beginPath(); ctx.arc(0, -5, 17, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8ff5d3'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -5, 13, time / 350, time / 350 + Math.PI * 1.5); ctx.stroke();
    const core = ctx.createRadialGradient(-2, -7, 0, 0, -5, 9);
    core.addColorStop(0, '#e1fff4'); core.addColorStop(0.45, '#7decd0'); core.addColorStop(1, '#19657a');
    ctx.fillStyle = core; ctx.shadowColor = '#8affd2'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(0, -5, 8, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffc974'; ctx.fillRect(-21, 8, 6, 3); ctx.fillRect(15, 8, 6, 3);
    ctx.restore();
    ctx.fillStyle = '#102330ee'; ctx.beginPath(); ctx.roundRect(-94, 36, 188, 20, 5); ctx.fill();
    ctx.fillStyle = '#bdffe3'; ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.fillText('QA SENTINEL / DUAL PULSE', 0, 49); ctx.restore();
  }
}
