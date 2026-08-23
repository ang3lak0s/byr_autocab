import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
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
}
