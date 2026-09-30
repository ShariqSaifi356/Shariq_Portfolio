import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Home } from './home';
describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });
  it('filters visible skills by category and restores all tools', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('.skill-filters button'),
    ) as HTMLButtonElement[];
    buttons.find((b) => b.textContent?.trim() === 'Languages')!.click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.tool-card').length).toBe(2);
    expect(fixture.nativeElement.querySelector('.skills-grid').textContent).toContain('Python');
    expect(fixture.nativeElement.querySelector('.skills-grid').textContent).not.toContain(
      'Jenkins',
    );
    buttons[0].click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.tool-card').length).toBe(13);
  });
  it('only reports clipboard success after copying succeeds', async () => {
    const fixture = TestBed.createComponent(Home);
    const home = fixture.componentInstance;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('Denied')) },
    });
    await home.copyEmailToClipboard();
    expect(home.workspaceService.snackbarMessage()).toContain('Unable to copy');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    });
    await home.copyEmailToClipboard();
    expect(home.workspaceService.snackbarMessage()).toBe('Email address copied.');
  });
});
