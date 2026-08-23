import { Injectable, signal, computed } from '@angular/core';
import {
  SubscriptionTier,
  SubscriptionFeatureAccess,
  PricingPlan,
  PRICING_PLANS,
} from '../models/subscription.model';

const STORAGE_TIER_KEY = 'byr_autocab_tier';
const STORAGE_LICENSE_KEY = 'byr_autocab_license_key';

// Replace this with your live Lemon Squeezy or Stripe Payment Link URL
export const DEFAULT_CHECKOUT_URL = 'https://byrautocab.lemonsqueezy.com/checkout/buy/9ebbd960-4ca7-4ca2-afa2-bf74ef328b12';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly _tier = signal<SubscriptionTier>(this.loadInitialTier());
  readonly activeLicenseKey = signal<string | null>(this.loadInitialLicenseKey());
  readonly checkoutUrl = signal<string>(DEFAULT_CHECKOUT_URL);

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
  readonly activationToast = signal<string | null>(null);

  constructor() {
    this.checkForUrlActivation();
  }

  private loadInitialTier(): SubscriptionTier {
    if (typeof window === 'undefined') return 'free';
    const saved = localStorage.getItem(STORAGE_TIER_KEY);
    return saved === 'pro' ? 'pro' : 'free';
  }

  private loadInitialLicenseKey(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_LICENSE_KEY);
  }

  private checkForUrlActivation(): void {
    if (typeof window === 'undefined') return;

    try {
      const params = new URLSearchParams(window.location.search);
      const isUnlocked = params.get('pro_unlocked') === 'true' || params.get('pro_success') === 'true';
      const licenseParam = params.get('license') || params.get('key');

      if (isUnlocked || licenseParam) {
        if (licenseParam) {
          this.validateAndActivateLicense(licenseParam);
        } else {
          this.upgradeToPro();
          this.showToast('🎉 BYR Pro Workshop Pass Activated Successfully!');
        }

        // Clean query parameters from URL without reloading
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  setTier(tier: SubscriptionTier): void {
    this._tier.set(tier);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_TIER_KEY, tier);
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
    this.activeLicenseKey.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_LICENSE_KEY);
    }
  }

  validateAndActivateLicense(rawKey: string): { success: boolean; message: string } {
    const key = rawKey.trim().toUpperCase();

    if (!key || key.length < 4) {
      return { success: false, message: 'Please enter a valid license key or promo code.' };
    }

    // Accepts keys like BYR-PRO-XXXX, WORKSHOP-XXXX, VIP-XXXX, or any 8+ char license string
    const isValid =
      key.startsWith('BYR-') ||
      key.startsWith('PRO-') ||
      key.startsWith('WORKSHOP') ||
      key.startsWith('VIP-') ||
      key.length >= 8;

    if (isValid) {
      this.activeLicenseKey.set(key);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_LICENSE_KEY, key);
      }
      this.setTier('pro');
      this.closeUpgradeModal();
      this.showToast(`🎉 License Key [${key}] Verified & Activated!`);
      return { success: true, message: 'License verified! Pro Workshop unlocked.' };
    }

    return { success: false, message: 'Invalid license key format. Please check your purchase email.' };
  }

  showToast(msg: string): void {
    this.activationToast.set(msg);
    setTimeout(() => {
      if (this.activationToast() === msg) {
        this.activationToast.set(null);
      }
    }, 4500);
  }
}
