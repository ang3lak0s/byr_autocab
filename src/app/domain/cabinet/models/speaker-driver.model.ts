export type SpeakerBrand =
  | 'Celestion'
  | 'Eminence'
  | 'Jensen'
  | 'Electro-Voice'
  | 'Custom';

export type MagnetType = 'Ceramic' | 'Alnico' | 'Neodymium';

export interface SpeakerDriverModel {
  id: string;
  brand: SpeakerBrand;
  modelName: string;
  nominalSizeInches: 8 | 10 | 12 | 15;
  nominalDiameterMm: number; // overall basket diameter
  cutoutDiameterMm: number; // exact factory baffle cutout hole
  mountingDepthMm: number; // depth behind front baffle board
  overallDepthMm: number; // total physical depth including rim
  magnetDiameterMm: number; // diameter of rear magnet assembly
  magnetType: MagnetType;
  powerRatingWatts: number; // continuous power handling (RMS)
  availableImpedanceOhms: number[]; // e.g. [8, 16]
  weightKg: number;
  weightLbs: number;
  tonalDescription: string;
  genreSuitability: string[];
  recommendedEnclosure: 'closed-back' | 'open-back' | 'both';
  iconicUserOrAmp: string;
  isProOnly?: boolean;
}

export interface DepthClearanceValidation {
  isValid: boolean;
  speakerMountingDepthMm: number;
  availableDepthBehindBaffleMm: number;
  clearanceToBackPanelMm: number;
  minRecommendedCabinetDepthMm: number;
  hasVentBreathingRoom: boolean; // >= 20mm air gap to rear panel for cooling
  warningMessage?: string;
  infoMessage?: string;
}
