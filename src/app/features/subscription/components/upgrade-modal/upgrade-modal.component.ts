import { Component, inject, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionService } from '../../../../domain/cabinet/services/subscription.service';

@Component({
  selector: 'app-upgrade-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upgrade-modal.component.html',
  styleUrls: ['./upgrade-modal.component.scss'],
})
export class UpgradeModalComponent {
  readonly subService = inject(SubscriptionService);

  readonly isOpen = this.subService.upgradeModalOpen;
  readonly triggerContext = this.subService.activeTriggerFeature;
  readonly isPro = this.subService.isPro;
  readonly activeLicenseKey = this.subService.activeLicenseKey;

  readonly showLicenseInput = signal(false);
  readonly licenseKeyInput = signal('');
  readonly licenseError = signal<string | null>(null);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  close(): void {
    this.subService.closeUpgradeModal();
    this.showLicenseInput.set(false);
    this.licenseError.set(null);
    this.licenseKeyInput.set('');
  }

  activateDemoPro(): void {
    this.subService.upgradeToPro();
  }

  downgradeToFree(): void {
    this.subService.downgradeToFree();
    this.close();
  }

  toggleLicenseInput(): void {
    this.showLicenseInput.update((v) => !v);
    this.licenseError.set(null);
  }

  redeemLicense(): void {
    const key = this.licenseKeyInput();
    const res = this.subService.validateAndActivateLicense(key);
    if (!res.success) {
      this.licenseError.set(res.message);
    } else {
      this.licenseError.set(null);
    }
  }

  openCheckout(): void {
    // If you want to open live Lemon Squeezy / Stripe payment link in a new tab:
    const url = this.subService.checkoutUrl();
    if (url && url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      this.activateDemoPro();
    }
  }
}
