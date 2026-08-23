export type SubscriptionTier = 'free' | 'pro';

export interface SubscriptionFeatureAccess {
  allow4xSpeakers: boolean;
  allowProDrivers: boolean;
  allowStereoSwitchableWiring: boolean;
  allowUnlimitedExports: boolean;
  allowMultiSheetOptimizer: boolean;
  allowCncDxfExport: boolean;
  customShopBranding: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  price: number;
  period: 'month' | 'lifetime';
  description: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Maker Tier',
    price: 0,
    period: 'lifetime',
    description: 'Perfect for DIY guitarists and hobbyist builders making 1x and 2x cabs.',
    features: [
      '1x & 2x Speaker Cabinets (1x10, 1x12, 1x15, 2x10, 2x12)',
      '10+ Standard Iconic Speaker Drivers',
      'Direct Mono Series & Parallel Wiring Calculator',
      'Basic 2D Plywood Sheet Optimizer',
      'Print-Ready Workshop Travelers (with BYR footer)',
      '1-Click URL Project Sharing',
    ],
    ctaText: 'Current Plan',
  },
  {
    id: 'pro-workshop',
    name: 'Pro Workshop Pass',
    badge: 'MOST POPULAR',
    price: 19,
    period: 'lifetime',
    popular: true,
    description: 'For custom cabinet builders, amp builders, and touring rigs needing 4x12s & pro drivers.',
    features: [
      '👑 4x10 & 4x12 Full / Half-Stack Cabinets',
      '👑 Boutique & Pro Drivers (EV EVM-12L, Alnico Blue/Gold, Jensen Blackbird)',
      '👑 Stereo / Mono Switchable Jackplate Matrix',
      '👑 Multi-Sheet Plywood Guillotine Cut Optimization',
      '👑 Unbranded High-Resolution PDF Blueprints',
      '👑 CSV / JSON Raw Shop Cut Lists & BOM',
      '👑 Lifetime Access & Free Updates',
    ],
    ctaText: 'Upgrade to Pro Workshop',
  },
];
