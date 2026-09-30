import { Injectable, signal } from '@angular/core';
export type DefensePhase = 'idle' | 'invasion' | 'defending' | 'repairing' | 'complete';
@Injectable({ providedIn: 'root' })
export class BugDefenseService {
  readonly available = signal(false);
  readonly request = signal(0);
  readonly phase = signal<DefensePhase>('idle');
  readonly cleared = signal(0);
  readonly progress = signal(0);
  play(): void { if (this.available()) this.request.update(value => value + 1); }
  dismiss(): void { this.phase.set('idle'); }
}
