export type SheetPresetType =
  | '5x5-baltic-birch'
  | '4x8-standard'
  | '4x4-half'
  | 'custom';

export interface SheetPresetOption {
  id: SheetPresetType;
  name: string;
  subTitle: string;
  widthMm: number;
  heightMm: number;
  widthInches: string;
  heightInches: string;
}

export const SHEET_PRESETS: SheetPresetOption[] = [
  {
    id: '5x5-baltic-birch',
    name: "5' × 5' Baltic Birch",
    subTitle: 'Pro standard guitar cab sheet (1525 × 1525 mm)',
    widthMm: 1525,
    heightMm: 1525,
    widthInches: '60"',
    heightInches: '60"',
  },
  {
    id: '4x8-standard',
    name: "4' × 8' Standard Plywood",
    subTitle: 'Commercial full sheet (1220 × 2440 mm)',
    widthMm: 2440,
    heightMm: 1220,
    widthInches: '96"',
    heightInches: '48"',
  },
  {
    id: '4x4-half',
    name: "4' × 4' Half Sheet",
    subTitle: 'Handy pre-cut project panel (1220 × 1220 mm)',
    widthMm: 1220,
    heightMm: 1220,
    widthInches: '48"',
    heightInches: '48"',
  },
];

export interface PlacedPanel {
  id: string;
  partName: string;
  xMm: number;
  yMm: number;
  widthMm: number; // width along sheet X
  heightMm: number; // height along sheet Y
  rotated: boolean;
  originalWidthMm: number;
  originalHeightMm: number;
  widthInches: string;
  heightInches: string;
  thicknessMm: number;
  notes: string;
  colorIndex: number;
}

export interface SheetCutLayout {
  sheetIndex: number; // 1-based index (e.g. Sheet 1 of 2)
  sheetWidthMm: number;
  sheetHeightMm: number;
  placedPanels: PlacedPanel[];
  usedAreaMm2: number;
  wasteAreaMm2: number;
  utilizationPercent: number;
}

export interface SheetCutConfig {
  preset: SheetPresetType;
  sheetWidthMm: number;
  sheetHeightMm: number;
  kerfMm: number; // saw blade kerf (default 3.2mm / 1/8")
  allowRotation: boolean; // allow 90 degree panel rotation
}

export interface SheetCutOptimizationResult {
  config: SheetCutConfig;
  totalSheetsRequired: number;
  sheets: SheetCutLayout[];
  unplacedPanels: {
    partName: string;
    widthMm: number;
    heightMm: number;
    reason: string;
  }[];
  totalNetPanelAreaM2: number;
  totalPlywoodSheetAreaM2: number;
  overallEfficiencyPercent: number;
}
