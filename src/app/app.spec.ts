import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });
  it('renders accessible navigation and a main content target', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.skip-link')?.getAttribute('href')).toBe('#main-content');
    expect(el.querySelector('main')?.id).toBe('main-content');
    expect(el.querySelector('nav[aria-label="Main navigation"]')).toBeTruthy();
  });
});
