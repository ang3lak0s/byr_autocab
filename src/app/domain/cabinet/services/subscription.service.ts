import { Injectable, signal, computed } from '@angular/core';
import {
  SubscriptionTier,
  SubscriptionFeatureAccess,
  PricingPlan,
  PRICING_PLANS,
} from '../models/subscription.model';

const STORAGE_KEY = 'byr_autocab_tier';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly _tier = signal<SubscriptionTier>(this.loadInitialTier());

  // Public Signals
  readonly tier = this._tier.asReadonly();
  readonly isPro = computed(() => this._tier() === 'pro');
  readonly isFree = computed(() => this._tier() === 'free');

  readonly features = computed<SubscriptionFeatureAccess>(() => {
    const isPro = this.isPro();
    return {
      allow4xSpeakers: isPro,
      allowProDrivers: isPro,
      allowStereoSwitchableWiring: isPro,
      allowUnlimitedExports: isPro,
      allowMultiSheetOptimizer: isPro,
      allowCncDxfExport: isPro,
      customShopBranding: isPro,
    };
  });

  // Modal Signals
  readonly upgradeModalOpen = signal(false);
  readonly activeTriggerFeature = signal<{
    featureName: string;
    description: string;
  } | null>(null);

  readonly availablePlans = signal<PricingPlan[]>(PRICING_PLANS);

  private loadInitialTier(): SubscriptionTier {
    if (typeof window === 'undefined') return 'free';
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'pro' ? 'pro' : 'free';
  }

  setTier(tier: SubscriptionTier): void {
    this._tier.set(tier);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, tier);
    }
  }

  toggleTier(): void {
    const nextTier: SubscriptionTier = this.isPro() ? 'free' : 'pro';
    this.setTier(nextTier);
  }

  openUpgradeModal(featureName = 'Pro Features', description = 'Unlock full workshop features with BYR Pro'): void {
    this.activeTriggerFeature.set({ featureName, description });
    this.upgradeModalOpen.set(true);
  }

  closeUpgradeModal(): void {
    this.upgradeModalOpen.set(false);
    this.activeTriggerFeature.set(null);
  }

  upgradeToPro(): void {
    this.setTier('pro');
    this.closeUpgradeModal();
  }

  downgradeToFree(): void {
    this.setTier('free');
  }
}
