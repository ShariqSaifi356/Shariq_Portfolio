import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('returns focus to the menu button when Escape closes the menu', async () => {
    component.openMobileMenu();
    await fixture.whenStable();
    fixture.nativeElement.querySelector('#mobile-nav-panel a').focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.mobile-menu-btn'));
    expect(component.isMobileMenuOpen()).toBe(false);
    expect(document.body.classList.contains('mobile-menu-open')).toBe(false);
  });

  it('unlocks scrolling when keyboard focus moves outside the header', async () => {
    const outside = document.createElement('button');
    document.body.append(outside);
    try {
      component.openMobileMenu();
      await fixture.whenStable();
      outside.focus();
      await fixture.whenStable();
      expect(component.isMobileMenuOpen()).toBe(false);
      expect(document.body.classList.contains('mobile-menu-open')).toBe(false);
      expect(document.activeElement).toBe(outside);
    } finally {
      outside.remove();
    }
  });
});
