import { TestBed } from '@angular/core/testing';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubscriptionService);
  });

  it('should initialize with default Free tier', () => {
    expect(service.tier()).toBe('free');
    expect(service.isPro()).toBe(false);
    expect(service.features().allow4xSpeakers).toBe(false);
    expect(service.features().allowProDrivers).toBe(false);
  });

  it('should upgrade to Pro tier and unlock all features', () => {
    service.upgradeToPro();
    expect(service.tier()).toBe('pro');
    expect(service.isPro()).toBe(true);
    expect(service.features().allow4xSpeakers).toBe(true);
    expect(service.features().allowProDrivers).toBe(true);
    expect(service.features().allowStereoSwitchableWiring).toBe(true);
  });

  it('should open and close upgrade modal with trigger context', () => {
    expect(service.upgradeModalOpen()).toBe(false);
    service.openUpgradeModal('4x Speaker Cabinets', 'Build 4x10 and 4x12 stacks');
    expect(service.upgradeModalOpen()).toBe(true);
    expect(service.activeTriggerFeature()?.featureName).toBe('4x Speaker Cabinets');

    service.closeUpgradeModal();
    expect(service.upgradeModalOpen()).toBe(false);
  });

  it('should toggle between free and pro tiers', () => {
    expect(service.tier()).toBe('free');
    service.toggleTier();
    expect(service.tier()).toBe('pro');
    service.toggleTier();
    expect(service.tier()).toBe('free');
  });

  it('should validate and activate valid license key', () => {
    const res = service.validateAndActivateLicense('BYR-PRO-TEST-2026');
    expect(res.success).toBe(true);
    expect(service.isPro()).toBe(true);
    expect(service.activeLicenseKey()).toBe('BYR-PRO-TEST-2026');
  });

  it('should reject short or invalid license keys', () => {
    const res = service.validateAndActivateLicense('ab');
    expect(res.success).toBe(false);
    expect(service.isPro()).toBe(false);
  });
});
