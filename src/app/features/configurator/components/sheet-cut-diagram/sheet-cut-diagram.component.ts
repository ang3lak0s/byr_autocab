import { Component, Input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CutListItem } from '../../../../domain/cabinet/models/calculation-result.model';
import {
  SheetPresetType,
  SHEET_PRESETS,
  SheetPresetOption,
  PlacedPanel,
  SheetCutOptimizationResult,
  SheetCutLayout,
} from '../../../../domain/cabinet/models/sheet-cut-optimizer.model';
import { SheetCutOptimizerService } from '../../../../domain/cabinet/services/sheet-cut-optimizer.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';

const HU_PANEL_NAMES: Record<string, string> = {
  'Top Panel': 'Tető Lap',
  'Bottom Panel': 'Fenék Lap',
  'Left Side Panel': 'Bal Oldallap',
  'Right Side Panel': 'Jobb Oldallap',
  'Front Baffle Board': 'Előlap (Baffle)',
  'Back Panel': 'Hátlap (Zárt)',
  'Back Panel - Top Slat': 'Hátlap Felső',
  'Back Panel - Bottom Slat': 'Hátlap Alsó',
  'Back Panel - Center Slat': 'Hátlap Közép',
  'Internal Corner Cleats': 'Belső Saroklécek',
  'Baffle Perimeter Cleats': 'Előlap Lécek',
  'Back Perimeter Cleats': 'Hátlap Lécek',
};

@Component({
  selector: 'app-sheet-cut-diagram',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './sheet-cut-diagram.component.html',
  styleUrls: ['./sheet-cut-diagram.component.scss'],
})
export class SheetCutDiagramComponent {
  private readonly sheetOptimizer = inject(SheetCutOptimizerService);
  readonly i18n = inject(TranslationService);

  readonly Math = Math;

  @Input({ required: true }) cutList!: CutListItem[];
  @Input() displayUnit: 'mm' | 'inch' = 'mm';

  readonly presets: SheetPresetOption[] = SHEET_PRESETS;

  readonly selectedPreset = signal<SheetPresetType>('5x5-baltic-birch');
  readonly kerfMm = signal<number>(3.2);
  readonly allowRotation = signal<boolean>(true);
  readonly activeSheetIndex = signal<number>(1);
  readonly customWidthMm = signal<number>(1525);
  readonly customHeightMm = signal<number>(1525);
  readonly hoveredPanel = signal<PlacedPanel | null>(null);

  // Reactive 2D optimization
  readonly result = computed<SheetCutOptimizationResult>(() => {
    return this.sheetOptimizer.optimizeSheetCuts(this.cutList, {
      preset: this.selectedPreset(),
      kerfMm: this.kerfMm(),
      allowRotation: this.allowRotation(),
      sheetWidthMm: this.customWidthMm(),
      sheetHeightMm: this.customHeightMm(),
    });
  });

  readonly activeSheet = computed<SheetCutLayout>(() => {
    const res = this.result();
    const idx = Math.min(this.activeSheetIndex(), res.sheets.length) - 1;
    return res.sheets[Math.max(0, idx)] || res.sheets[0];
  });

  // SVG Canvas geometry and scaling
  readonly svgWidth = 840;
  readonly svgHeight = 520;
  readonly maxDrawW = 760;
  readonly maxDrawH = 430;

  readonly scale = computed<number>(() => {
    const sheet = this.activeSheet();
    if (!sheet || sheet.sheetWidthMm === 0 || sheet.sheetHeightMm === 0) return 0.3;
    return Math.min(this.maxDrawW / sheet.sheetWidthMm, this.maxDrawH / sheet.sheetHeightMm);
  });

  readonly sheetW = computed<number>(() => {
    return Math.round(this.activeSheet().sheetWidthMm * this.scale());
  });

  readonly sheetH = computed<number>(() => {
    return Math.round(this.activeSheet().sheetHeightMm * this.scale());
  });

  readonly sheetX = computed<number>(() => {
    return Math.round((this.svgWidth - this.sheetW()) / 2);
  });

  readonly sheetY = computed<number>(() => {
    return Math.round((this.svgHeight - this.sheetH()) / 2 + 12);
  });

  selectPreset(preset: SheetPresetType): void {
    this.selectedPreset.set(preset);
    this.activeSheetIndex.set(1);
  }

  setKerf(kerf: number): void {
    this.kerfMm.set(kerf);
  }

  toggleRotation(): void {
    this.allowRotation.update((v) => !v);
  }

  setSheetIndex(idx: number): void {
    this.activeSheetIndex.set(idx);
  }

  localizePartName(partName: string): string {
    if (this.i18n.isHungarian()) {
      return HU_PANEL_NAMES[partName] || partName;
    }
    return partName;
  }

  getShortName(partName: string, pxW: number): string {
    if (this.i18n.isHungarian()) {
      if (pxW < 90) {
        if (partName.includes('Top') || partName.includes('Tető')) return 'Tető';
        if (partName.includes('Bottom') || partName.includes('Fenék')) return 'Fenék';
        if (partName.includes('Side') || partName.includes('Oldal')) return 'Oldal';
        if (partName.includes('Baffle') || partName.includes('Előlap')) return 'Baffle';
        if (partName.includes('Back') || partName.includes('Hátlap')) return 'Hátlap';
        if (partName.includes('Cleat') || partName.includes('Léc')) return 'Léc';
      }
      return HU_PANEL_NAMES[partName] || partName;
    }

    if (pxW < 90) {
      if (partName.includes('Top & Bottom') && partName.includes('1')) return 'Top #1';
      if (partName.includes('Top & Bottom') && partName.includes('2')) return 'Bot #2';
      if (partName.includes('Side') && partName.includes('1')) return 'Side #1';
      if (partName.includes('Side') && partName.includes('2')) return 'Side #2';
      if (partName.includes('Baffle')) return 'Baffle';
      if (partName.includes('Sealed Back')) return 'Back';
      if (partName.includes('Slat') && partName.includes('1')) return 'Slat #1';
      if (partName.includes('Slat') && partName.includes('2')) return 'Slat #2';
      if (partName.includes('Cleat')) return 'Cleat';
      return partName.substring(0, 8);
    }

    if (pxW < 140) {
      if (partName.includes('Top & Bottom') && partName.includes('1')) return 'Top Panel #1';
      if (partName.includes('Top & Bottom') && partName.includes('2')) return 'Bottom Panel #2';
      if (partName.includes('Side') && partName.includes('1')) return 'Side Panel #1';
      if (partName.includes('Side') && partName.includes('2')) return 'Side Panel #2';
      if (partName.includes('Baffle')) return 'Speaker Baffle';
      if (partName.includes('Sealed Back')) return 'Sealed Back';
      if (partName.includes('Slat') && partName.includes('1')) return 'Back Slat #1';
      if (partName.includes('Slat') && partName.includes('2')) return 'Back Slat #2';
      return partName.replace(/Left & Right /g, '').replace(/Top & Bottom /g, 'Top/Bottom ');
    }

    if (partName.includes('Top & Bottom') && partName.includes('1')) return 'Top Panel #1';
    if (partName.includes('Top & Bottom') && partName.includes('2')) return 'Bottom Panel #2';
    if (partName.includes('Side') && partName.includes('1')) return 'Left Side Panel #1';
    if (partName.includes('Side') && partName.includes('2')) return 'Right Side Panel #2';
    return partName;
  }

  getDimensionText(panel: PlacedPanel, pxW: number): string {
    if (pxW > 220) {
      return `${panel.widthMm} × ${panel.heightMm} mm (${panel.widthInches} × ${panel.heightInches})`;
    }
    if (pxW > 110) {
      return `${panel.widthMm} × ${panel.heightMm} mm`;
    }
    return `${panel.widthMm}×${panel.heightMm}`;
  }

  getTitleFontSize(pxW: number): number {
    return Math.min(11, Math.max(8.5, Math.round((pxW / 15) * 10) / 10));
  }

  getDimFontSize(pxW: number): number {
    return Math.min(9.5, Math.max(7.5, Math.round((pxW / 18) * 10) / 10));
  }

  getPanelColor(colorIndex: number): { fill: string; stroke: string; text: string; tag: string } {
    switch (colorIndex) {
      case 0:
        return {
          fill: 'rgba(14, 165, 233, 0.32)',
          stroke: '#38bdf8',
          text: '#ffffff',
          tag: 'bg-cyan',
        };
      case 1:
        return {
          fill: 'rgba(245, 158, 11, 0.32)',
          stroke: '#f59e0b',
          text: '#ffffff',
          tag: 'bg-amber',
        };
      case 2:
        return {
          fill: 'rgba(16, 185, 129, 0.32)',
          stroke: '#10b981',
          text: '#ffffff',
          tag: 'bg-emerald',
        };
      case 3:
        return {
          fill: 'rgba(168, 85, 247, 0.32)',
          stroke: '#c084fc',
          text: '#ffffff',
          tag: 'bg-purple',
        };
      default:
        return {
          fill: 'rgba(96, 165, 250, 0.32)',
          stroke: '#60a5fa',
          text: '#ffffff',
          tag: 'bg-blue',
        };
    }
  }
}
