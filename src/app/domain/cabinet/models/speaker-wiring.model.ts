export type WiringMode =
  | 'direct'
  | 'parallel'
  | 'series'
  | 'series-parallel'
  | 'all-parallel'
  | 'stereo-split';

export type JackPlateType =
  | 'single-mono'
  | 'dual-mono-parallel'
  | 'stereo-switching';

export interface WiringOption {
  mode: WiringMode;
  name: string;
  shortLabel: string;
  description: string;
  totalImpedanceOhms: number;
  monoOrStereo: 'mono' | 'stereo' | 'switchable';
  recommendedJack: JackPlateType;
  ampCompatibilityTip: string;
  isStandardForCount: boolean;
}

export interface SchematicTerminal {
  id: string; // e.g. "jack-plus", "jack-minus", "sp1-plus", "sp1-minus"
  label: '+' | '-';
  x: number;
  y: number;
  color: string;
}

export interface SchematicWire {
  fromTerminal: string;
  toTerminal: string;
  color: 'red' | 'black' | 'yellow' | 'blue';
  pathD: string;
  label?: string;
  isJumper?: boolean;
}

export interface SpeakerWiringResult {
  driverCount: number;
  individualDriverImpedanceOhms: number;
  selectedWiringMode: WiringMode;
  jackPlate: JackPlateType;
  availableOptions: WiringOption[];
  activeOption: WiringOption;
  totalPowerHandlingWatts: number;
  suggestedWireGauge: string;
}
