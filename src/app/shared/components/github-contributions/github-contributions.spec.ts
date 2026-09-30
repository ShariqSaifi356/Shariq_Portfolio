import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GithubContributions } from './github-contributions';
import {
  GithubContributionsService,
  contributionCalendar,
} from '../../services/github-contributions.service';
import { vi } from 'vitest';
const response = {
  contributions: [
    { date: '2026-09-23', count: 0, level: 0 },
    { date: '2026-09-24', count: 3, level: 2 },
    { date: '2026-09-25', count: 5, level: 4 },
    { date: '2026-09-26', count: 0, level: 0 },
  ],
};
describe('GitHub contributions', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GithubContributions],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });
  function setup() {
    const fixture = TestBed.createComponent(GithubContributions);
    fixture.detectChanges();
    return fixture;
  }
  function request() {
    return http.expectOne(TestBed.inject(GithubContributionsService).endpoint);
  }
  it('aligns weeks by UTC weekday and derives totals from daily activity', () => {
    const calendar = contributionCalendar(response);
    expect(calendar.total).toBe(8);
    expect(calendar.activeDays).toBe(2);
    expect(calendar.latest?.date).toBe('2026-09-25');
    expect(calendar.weeks[0].slice(0, 3)).toEqual([null, null, null]);
    expect(calendar.weeks[0][3]?.date).toBe('2026-09-23');
    expect(() =>
      contributionCalendar({
        contributions: [response.contributions[0], response.contributions[2]],
      }),
    ).toThrow();
  });
  it('renders actual data and exposes individual days to keyboard navigation', () => {
    const fixture = setup();
    expect(fixture.componentInstance.loading()).toBe(true);
    request().flush(response);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.day').length).toBe(4);
    expect(fixture.componentInstance.calendar()?.total).toBe(8);
    expect(fixture.nativeElement.querySelector('.latest-date').textContent).toContain(
      'Sep 25, 2026',
    );
    const selected = fixture.nativeElement.querySelector(
      '[data-date="2026-09-25"]',
    ) as HTMLButtonElement;
    selected.focus();
    selected.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedDate()).toBe('2026-09-24');
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-09-24');
  });
  it('preserves last successful data when refresh fails and recovers on retry', () => {
    const fixture = setup();
    request().flush(response);
    fixture.detectChanges();
    fixture.componentInstance.refresh();
    request().flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(fixture.componentInstance.error()).toBe(true);
    expect(fixture.componentInstance.calendar()?.total).toBe(8);
    fixture.componentInstance.refresh();
    request().flush({
      contributions: response.contributions.map((d) => ({ ...d, count: 0, level: 0 })),
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.error()).toBe(false);
    expect(fixture.componentInstance.calendar()?.total).toBe(0);
    expect(fixture.componentInstance.calendar()?.latest).toBeUndefined();
  });
  it('rejects malformed responses rather than inventing contribution data', () => {
    const fixture = setup();
    request().flush({ contributions: [{ date: '2026-02-31', count: -1, level: 8 }] });
    fixture.detectChanges();
    expect(fixture.componentInstance.error()).toBe(true);
    expect(fixture.componentInstance.calendar()).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.day').length).toBe(0);
  });
  it('refreshes automatically and stops polling on destruction', () => {
    vi.useFakeTimers();
    const fixture = setup();
    request().flush(response);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    vi.advanceTimersByTime(5 * 60 * 1000);
    request().flush(response);
    fixture.destroy();
    vi.advanceTimersByTime(5 * 60 * 1000);
    http.expectNone(TestBed.inject(GithubContributionsService).endpoint);
    delete (document as unknown as { hidden?: boolean }).hidden;
  });
});
