import { TestBed } from '@angular/core/testing';
import { ViewportService } from './viewport.service';

describe('ViewportService', () => {
  let service: ViewportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ViewportService],
    });
    service = TestBed.inject(ViewportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize width and height signals', () => {
    expect(service.width()).toBeGreaterThan(0);
    expect(service.height()).toBeGreaterThan(0);
  });

  it('should compute breakpoint correctly', () => {
    service.width.set(375);
    expect(service.isMobile()).toBe(true);
    expect(service.isSmallMobile()).toBe(true);
    expect(service.isDesktop()).toBe(false);
    expect(service.currentBreakpoint()).toBe('xs');

    service.width.set(800);
    expect(service.isMobile()).toBe(false);
    expect(service.isTablet()).toBe(true);
    expect(service.isDesktop()).toBe(false);
    expect(service.currentBreakpoint()).toBe('md');

    service.width.set(1280);
    expect(service.isMobile()).toBe(false);
    expect(service.isTablet()).toBe(false);
    expect(service.isDesktop()).toBe(true);
    expect(service.currentBreakpoint()).toBe('xl');
  });
});
