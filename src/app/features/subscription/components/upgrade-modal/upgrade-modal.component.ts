import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '../../../../domain/cabinet/services/subscription.service';

@Component({
  selector: 'app-upgrade-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upgrade-modal.component.html',
  styleUrls: ['./upgrade-modal.component.scss'],
})
export class UpgradeModalComponent {
  readonly subService = inject(SubscriptionService);

  readonly isOpen = this.subService.upgradeModalOpen;
  readonly triggerContext = this.subService.activeTriggerFeature;
  readonly isPro = this.subService.isPro;
  readonly plans = this.subService.availablePlans;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  close(): void {
    this.subService.closeUpgradeModal();
  }

  activatePro(): void {
    this.subService.upgradeToPro();
  }

  downgradeToFree(): void {
    this.subService.downgradeToFree();
    this.close();
  }
}
