export type CabinetCategory = '1x12' | '2x12' | '4x12' | 'bass' | 'vintage';

export type DimensionUnit = 'inch' | 'mm';

export type EnclosureStyle = 'closed-back' | 'open-back' | 'convertible-3-piece' | 'ported-bass-reflex';

export interface CabinetDimensions {
  width: number; // in inches
  height: number;
  depth: number;
  baffleRecessDepth?: number; // e.g. 1.0" or 1.25" for grill clearance
}

export interface SpeakerDriverSpec {
  driverSize: number; // e.g. 10", 12", 15"
  driverCount: number; // 1, 2, 4
  cutoutDiameter: number; // e.g. 11.1" (282mm)
  typicalDriverModel: string; // e.g. "Celestion Vintage 30", "Eminence Legend", "Jensen P10R"
  baffleMountType: 'front-loaded' | 'rear-loaded';
}

export interface AcousticSpec {
  internalVolumeLiters: number; // e.g. 42.5 L
  internalVolumeCuFt: number; // e.g. 1.50 cu ft
  enclosureStyle: EnclosureStyle;
  portTuningHz?: number; // for bass reflex
}

export interface MaterialSpec {
  carcassThickness: number; // e.g. 0.75" (18mm Baltic Birch or 3/4" Pine)
  baffleThickness: number; // e.g. 0.75" (18mm Baltic Birch)
  backPanelThickness: number; // e.g. 0.50" or 0.75"
  cleatDimension: string; // e.g. "3/4\" x 3/4\" Hardwood Strips"
  materialType: string; // e.g. "13-Ply Baltic Birch Plywood", "Clear Solid White Pine"
}

export interface HardwareEstimate {
  tNutCount: number;
  cornerCount: number;
  handleType: string;
  jackPlate: string;
  tolexYardage: string;
  grillClothSize: string;
}

export interface CabinetConfiguration {
  id: string;
  name: string;
  code: string;
  category: CabinetCategory;
  tagline: string;
  description: string;
  defaultDimensions: CabinetDimensions;
  speakerSpec: SpeakerDriverSpec;
  acousticSpec: AcousticSpec;
  recommendedJoineryId: string;
  estimatedPanelsCount: number;
  sheetYieldEstimate: string;
  materials: MaterialSpec;
  hardware: HardwareEstimate;
  features: string[];
  badge?: string;
  previewIcon: string;
}
