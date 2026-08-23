import { Injectable, signal, computed, PLATFORM_ID, inject, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

@Injectable({
  providedIn: 'root',
})
export class ViewportService implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Screen width & height signals
  readonly width = signal<number>(this.getInitialWidth());
  readonly height = signal<number>(this.getInitialHeight());

  // Touch capability signal
  readonly hasTouch = signal<boolean>(this.checkTouchSupport());

  // Breakpoints
  readonly isMobile = computed<boolean>(() => this.width() < 768);
  readonly isSmallMobile = computed<boolean>(() => this.width() < 480);
  readonly isTablet = computed<boolean>(() => this.width() >= 768 && this.width() < 1024);
  readonly isDesktop = computed<boolean>(() => this.width() >= 1024);

  readonly currentBreakpoint = computed<Breakpoint>(() => {
    const w = this.width();
    if (w < 640) return 'xs';
    if (w < 768) return 'sm';
    if (w < 1024) return 'md';
    if (w < 1280) return 'lg';
    if (w < 1536) return 'xl';
    return '2xl';
  });

  private resizeListener?: () => void;

  constructor() {
    if (this.isBrowser) {
      this.initListeners();
    }
  }

  private getInitialWidth(): number {
    return this.isBrowser ? window.innerWidth : 1200;
  }

  private getInitialHeight(): number {
    return this.isBrowser ? window.innerHeight : 800;
  }

  private checkTouchSupport(): boolean {
    if (!this.isBrowser) return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  private initListeners(): void {
    let timeoutId: any;
    this.resizeListener = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        this.width.set(window.innerWidth);
        this.height.set(window.innerHeight);
      }, 50);
    };

    window.addEventListener('resize', this.resizeListener, { passive: true });
    window.addEventListener('orientationchange', this.resizeListener, { passive: true });
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      window.removeEventListener('orientationchange', this.resizeListener);
    }
  }
}
