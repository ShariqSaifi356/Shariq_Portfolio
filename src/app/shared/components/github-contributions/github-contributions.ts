import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import {
  ContributionCalendar,
  ContributionDay,
  GithubContributionsService,
} from '../../services/github-contributions.service';
@Component({
  selector: 'app-github-contributions',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './github-contributions.html',
  styleUrl: './github-contributions.css',
})
export class GithubContributions implements OnInit {
  readonly service = inject(GithubContributionsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly calendar = signal<ContributionCalendar | null>(null);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly checkedAt = signal<Date | null>(null);
  readonly selectedDate = signal('');
  readonly selectedDay = computed(() =>
    this.calendar()?.days.find((d) => d.date === this.selectedDate()),
  );
  readonly levels = [0, 1, 2, 3, 4];
  readonly refreshInterval = 5 * 60 * 1000;
  ngOnInit(): void {
    this.refresh();
    interval(this.refreshInterval)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!document.hidden) this.refresh();
      });
  }
  @HostListener('document:visibilitychange') onVisibilityChange(): void {
    if (!document.hidden && Date.now() - (this.checkedAt()?.getTime() ?? 0) >= this.refreshInterval)
      this.refresh();
  }
  refresh(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.service
      .load()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (calendar) => {
          this.calendar.set(calendar);
          if (!calendar.days.some((d) => d.date === this.selectedDate()))
            this.selectedDate.set(
              (calendar.latest ?? calendar.days[calendar.days.length - 1]).date,
            );
          this.checkedAt.set(new Date());
          this.error.set(false);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }
  dayLabel(day: ContributionDay): string {
    const date = new Date(day.date + 'T00:00:00Z').toLocaleDateString('en', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
    return `${day.count} ${day.count === 1 ? 'contribution' : 'contributions'} on ${date}`;
  }
  onDayKey(event: KeyboardEvent, day: ContributionDay): void {
    const offsets: Record<string, number> = {
      ArrowUp: -1,
      ArrowDown: 1,
      ArrowLeft: -7,
      ArrowRight: 7,
    };
    const offset = offsets[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    const days = this.calendar()?.days ?? [];
    const index = days.findIndex((d) => d.date === day.date);
    const target = days[Math.max(0, Math.min(days.length - 1, index + offset))];
    if (target) {
      this.selectedDate.set(target.date);
      this.host.nativeElement
        .querySelector<HTMLButtonElement>(`[data-date="${target.date}"]`)
        ?.focus();
    }
  }
}
