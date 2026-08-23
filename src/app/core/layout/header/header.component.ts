import { Component, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SubscriptionService } from '../../../domain/cabinet/services/subscription.service';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  readonly subService = inject(SubscriptionService);
  isMobileMenuOpen = signal<boolean>(false);
  isScrolled = signal<boolean>(false);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  openUpgradeModal(): void {
    this.subService.openUpgradeModal();
  }
}
