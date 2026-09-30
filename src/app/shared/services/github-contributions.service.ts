import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, timeout } from 'rxjs';
import { PORTFOLIO_DATA } from '../data/portfolio-data';
export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}
export interface ContributionCalendar {
  days: ContributionDay[];
  weeks: (ContributionDay | null)[][];
  months: string[];
  total: number;
  activeDays: number;
  latest: ContributionDay | undefined;
}
export function contributionCalendar(value: unknown): ContributionCalendar {
  const rows = (value as { contributions?: unknown })?.contributions;
  if (!Array.isArray(rows) || !rows.length || rows.length > 400)
    throw new Error('Invalid calendar');
  const days: ContributionDay[] = rows
    .map((day: ContributionDay) => {
      if (
        !day ||
        typeof day.date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
        !Number.isFinite(Date.parse(day.date)) ||
        new Date(day.date).toISOString().slice(0, 10) !== day.date ||
        !Number.isInteger(day.count) ||
        day.count < 0 ||
        !Number.isInteger(day.level) ||
        day.level < 0 ||
        day.level > 4
      )
        throw new Error('Invalid contribution');
      return { date: day.date, count: day.count, level: day.level };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 1; i < days.length; i++)
    if (Date.parse(days[i].date) - Date.parse(days[i - 1].date) !== 86400000)
      throw new Error('Incomplete calendar');
  const cells: (ContributionDay | null)[] = [
    ...Array(new Date(days[0].date + 'T00:00:00Z').getUTCDay()).fill(null),
    ...days,
  ];
  while (cells.length % 7) cells.push(null);
  const weeks: (ContributionDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const months = weeks.map((week, index) => {
    const day = index === 0 ? week.find(Boolean) : week.find((d) => d?.date.endsWith('-01'));
    return day && index < weeks.length - 2
      ? new Date(day.date + 'T00:00:00Z').toLocaleDateString('en', {
          month: 'short',
          timeZone: 'UTC',
        })
      : '';
  });
  // A short first month must not overlap the following month's label.
  if (months[1] || months[2]) months[0] = '';
  return {
    days,
    weeks,
    months,
    total: days.reduce((sum, d) => sum + d.count, 0),
    activeDays: days.filter((d) => d.count > 0).length,
    latest: [...days].reverse().find((d) => d.count > 0),
  };
}
@Injectable({ providedIn: 'root' })
export class GithubContributionsService {
  private readonly http = inject(HttpClient);
  readonly profileUrl = PORTFOLIO_DATA.personal.github;
  readonly username = new URL(this.profileUrl).pathname.split('/').filter(Boolean)[0];
  readonly endpoint = `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(this.username)}?y=last`;
  load() {
    return this.http.get<unknown>(this.endpoint).pipe(timeout(12000), map(contributionCalendar));
  }
}
