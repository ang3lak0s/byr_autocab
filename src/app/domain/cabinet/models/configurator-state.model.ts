export type SpeakerDiameterPreset = '8' | '10' | '12' | '15' | 'custom';
export type SpeakerCount = 1 | 2 | 4;
export type SpeakerLayoutType = 'single' | 'horizontal-2x' | 'vertical-2x' | 'grid-2x2';
export type CabinetFormFactor = 'horizontal' | 'square' | 'vertical' | 'custom';
export type BackEnclosureType = 'closed-back' | 'half-open' | 'mostly-open';
export type ConstructionMethodType = 'basic-screw-nail' | 'glue-screw-nail' | 'rabbet-glue';
export type MeasurementUnit = 'mm' | 'inch';

export interface CabinetDimensionsInput {
  width: number; // in current unit
  height: number;
  depth: number;
  unit: MeasurementUnit;
}

export interface SpeakerConfigInput {
  count: SpeakerCount;
  diameterPreset: SpeakerDiameterPreset;
  customDiameterInches?: number;
  cutoutDiameterMm: number; // in mm
  layout: SpeakerLayoutType;
  modelId?: string; // e.g. 'celestion-v30' or 'custom'
  mountingDepthMm?: number; // e.g. 124 mm
  magnetDiameterMm?: number; // e.g. 156 mm
  powerHandlingWatts?: number; // e.g. 60 W
  impedanceOhms?: number; // e.g. 8 or 16
  weightKg?: number; // e.g. 4.7 kg
}

export interface MaterialConfigInput {
  materialName: string; // e.g. "18mm Baltic Birch Plywood", "15mm Birch", "3/4\" Solid Pine"
  thicknessMm: number; // in mm (e.g. 18, 15, 12, 19)
  wasteAllowancePercent: number; // default 10%
  sheetWidthMm?: number; // optional sheet spec (e.g. 1525mm for 5x5)
  sheetLengthMm?: number; // (e.g. 1525mm)
  sheetPrice?: number; // optional user entered price per sheet
}

export interface CostEstimatesInput {
  woodCost: number;
  speakersCost: number;
  grillClothCost: number;
  tolexCost: number;
  hardwareCost: number;
  wiringCost: number;
  miscCost: number;
  currencySymbol: string; // e.g. "$" or "€" or "£"
}

export interface ConfiguratorState {
  formFactor: CabinetFormFactor;
  dimensions: CabinetDimensionsInput;
  speaker: SpeakerConfigInput;
  backConfig: BackEnclosureType;
  constructionMethod: ConstructionMethodType;
  material: MaterialConfigInput;
  costs: CostEstimatesInput;
}
