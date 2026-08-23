export interface InternalDimensionsMm {
  width: number;
  height: number;
  depth: number;
}

export interface AcousticVolumeResult {
  volumeLiters: number;
  volumeCuFt: number;
  internalDimensions: InternalDimensionsMm;
  disclaimer: string;
}

export interface SpeakerCutoutPosition {
  index: number;
  centerX: number; // percentage (0 to 100) on baffle
  centerY: number; // percentage (0 to 100) on baffle
  centerXMm?: number; // exact mm from left of baffle
  centerYMm?: number; // exact mm from top of baffle
  diameterMm: number;
}

import { DepthClearanceValidation } from './speaker-driver.model';

export interface SpeakerClearanceValidation {
  isValid: boolean;
  baffleWidthMm: number;
  baffleHeightMm: number;
  minRequiredBaffleWidthMm: number;
  minRequiredBaffleHeightMm: number;
  positions: SpeakerCutoutPosition[];
  depthValidation: DepthClearanceValidation;
  totalPowerHandlingWatts: number;
  totalDriverWeightKg: number;
  warnings: string[];
  infoMessages: string[];
}

export interface CutListItem {
  partName: string;
  quantity: number;
  widthMm: number;
  heightOrDepthMm: number;
  thicknessMm: number;
  widthInches: string;
  heightOrDepthInches: string;
  thicknessInches: string;
  notes: string;
}

export interface MaterialRequirementResult {
  totalNetPanelAreaM2: number;
  totalNetPanelAreaSqFt: number;
  totalWithWasteAreaM2: number;
  totalWithWasteAreaSqFt: number;
  wastePercent: number;
  estimatedSheetsCount: number;
}

export type BuildDifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface BuildDifficultyResult {
  level: BuildDifficultyLevel;
  badgeClass: string;
  summary: string;
  reasons: string[];
}

export interface ToolRequirementResult {
  requiredTools: string[];
  recommendedTools: string[];
  optionalTools: string[];
}

export interface CostEstimateResult {
  wood: number;
  speakers: number;
  grillCloth: number;
  tolex: number;
  hardware: number;
  wiring: number;
  misc: number;
  totalCost: number;
  currencySymbol: string;
}

import { SheetCutOptimizationResult } from './sheet-cut-optimizer.model';
import { SpeakerWiringResult } from './speaker-wiring.model';

export interface CompleteBuildPlan {
  externalWidthMm: number;
  externalHeightMm: number;
  externalDepthMm: number;
  materialThicknessMm: number;
  acousticVolume: AcousticVolumeResult;
  clearanceValidation: SpeakerClearanceValidation;
  cutList: CutListItem[];
  materials: MaterialRequirementResult;
  costs: CostEstimateResult;
  difficulty: BuildDifficultyResult;
  tools: ToolRequirementResult;
  sheetCutPlan: SheetCutOptimizationResult;
  wiringPlan: SpeakerWiringResult;
}


