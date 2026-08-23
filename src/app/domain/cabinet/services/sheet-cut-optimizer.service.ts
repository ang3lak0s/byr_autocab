import { Injectable } from '@angular/core';
import { CutListItem } from '../models/calculation-result.model';
import {
  PlacedPanel,
  SheetCutLayout,
  SheetCutConfig,
  SheetCutOptimizationResult,
  SHEET_PRESETS,
} from '../models/sheet-cut-optimizer.model';

interface FreeRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PanelToPlace {
  id: string;
  partName: string;
  widthMm: number;
  heightMm: number;
  originalWidthMm: number;
  originalHeightMm: number;
  widthInches: string;
  heightInches: string;
  thicknessMm: number;
  notes: string;
  colorIndex: number;
}

@Injectable({
  providedIn: 'root',
})
export class SheetCutOptimizerService {
  /**
   * Optimizes 2D guillotine cutting layout of cut list panels onto standard plywood sheets.
   */
  optimizeSheetCuts(
    cutList: CutListItem[],
    customConfig?: Partial<SheetCutConfig>
  ): SheetCutOptimizationResult {
    const config: SheetCutConfig = {
      preset: customConfig?.preset || '5x5-baltic-birch',
      sheetWidthMm: customConfig?.sheetWidthMm || 1525,
      sheetHeightMm: customConfig?.sheetHeightMm || 1525,
      kerfMm: customConfig?.kerfMm !== undefined ? customConfig.kerfMm : 3.2,
      allowRotation: customConfig?.allowRotation !== undefined ? customConfig.allowRotation : true,
    };

    // If preset is known standard, ensure dimensions match preset
    if (config.preset !== 'custom') {
      const presetOption = SHEET_PRESETS.find((p) => p.id === config.preset);
      if (presetOption) {
        config.sheetWidthMm = presetOption.widthMm;
        config.sheetHeightMm = presetOption.heightMm;
      }
    }

    const panelsToPlace = this.expandAndSortPanels(cutList);
    const sheets: { layout: SheetCutLayout; freeRects: FreeRect[] }[] = [];
    const unplacedPanels: SheetCutOptimizationResult['unplacedPanels'] = [];

    // Helper to start a new sheet
    const createNewSheet = (): { layout: SheetCutLayout; freeRects: FreeRect[] } => {
      const newIndex = sheets.length + 1;
      const newSheet = {
        layout: {
          sheetIndex: newIndex,
          sheetWidthMm: config.sheetWidthMm,
          sheetHeightMm: config.sheetHeightMm,
          placedPanels: [] as PlacedPanel[],
          usedAreaMm2: 0,
          wasteAreaMm2: config.sheetWidthMm * config.sheetHeightMm,
          utilizationPercent: 0,
        },
        freeRects: [
          {
            x: 0,
            y: 0,
            w: config.sheetWidthMm,
            h: config.sheetHeightMm,
          },
        ],
      };
      sheets.push(newSheet);
      return newSheet;
    };

    // Begin with Sheet 1
    createNewSheet();

    for (const panel of panelsToPlace) {
      let placed = false;

      // Check if panel fits on any sheet even when empty
      const fitsNormal =
        panel.widthMm <= config.sheetWidthMm && panel.heightMm <= config.sheetHeightMm;
      const fitsRotated =
        config.allowRotation &&
        panel.heightMm <= config.sheetWidthMm &&
        panel.widthMm <= config.sheetHeightMm;

      if (!fitsNormal && !fitsRotated) {
        unplacedPanels.push({
          partName: panel.partName,
          widthMm: panel.widthMm,
          heightMm: panel.heightMm,
          reason: `Panel dimensions (${panel.widthMm} × ${panel.heightMm} mm) exceed sheet size (${config.sheetWidthMm} × ${config.sheetHeightMm} mm).`,
        });
        continue;
      }

      // Try placing on existing sheets
      for (const sheet of sheets) {
        const bestPlacement = this.findBestRectForPanel(sheet.freeRects, panel, config);

        if (bestPlacement) {
          this.placePanelOnSheet(sheet, panel, bestPlacement, config.kerfMm);
          placed = true;
          break;
        }
      }

      // If not placed on existing sheets, open a new sheet
      if (!placed) {
        const newSheet = createNewSheet();
        const bestPlacement = this.findBestRectForPanel(newSheet.freeRects, panel, config);

        if (bestPlacement) {
          this.placePanelOnSheet(newSheet, panel, bestPlacement, config.kerfMm);
          placed = true;
        } else {
          unplacedPanels.push({
            partName: panel.partName,
            widthMm: panel.widthMm,
            heightMm: panel.heightMm,
            reason: `Could not fit on sheet with current kerf and packing constraints.`,
          });
        }
      }
    }

    // Finalize metrics for each sheet
    let totalUsedAreaMm2 = 0;
    const finalSheets: SheetCutLayout[] = sheets.map((s) => {
      const sheetArea = s.layout.sheetWidthMm * s.layout.sheetHeightMm;
      const usedArea = s.layout.placedPanels.reduce(
        (sum, p) => sum + p.widthMm * p.heightMm,
        0
      );
      totalUsedAreaMm2 += usedArea;
      const wasteArea = Math.max(0, sheetArea - usedArea);
      const utilization = sheetArea > 0 ? (usedArea / sheetArea) * 100 : 0;

      return {
        ...s.layout,
        usedAreaMm2: Math.round(usedArea),
        wasteAreaMm2: Math.round(wasteArea),
        utilizationPercent: Number(utilization.toFixed(1)),
      };
    });

    const totalNetPanelAreaM2 = Number((totalUsedAreaMm2 / 1000000).toFixed(2));
    const totalPlywoodSheetAreaM2 = Number(
      ((finalSheets.length * config.sheetWidthMm * config.sheetHeightMm) / 1000000).toFixed(2)
    );
    const overallEfficiencyPercent =
      totalPlywoodSheetAreaM2 > 0
        ? Number(((totalNetPanelAreaM2 / totalPlywoodSheetAreaM2) * 100).toFixed(1))
        : 0;

    return {
      config,
      totalSheetsRequired: finalSheets.length,
      sheets: finalSheets,
      unplacedPanels,
      totalNetPanelAreaM2,
      totalPlywoodSheetAreaM2,
      overallEfficiencyPercent,
    };
  }

  /**
   * Expands CutListItem quantities into individual panels and sorts by decreasing size.
   */
  private expandAndSortPanels(cutList: CutListItem[]): PanelToPlace[] {
    const panels: PanelToPlace[] = [];

    for (const item of cutList) {
      // Exclude 3/4" hardwood internal perimeter cleats from large sheet cut layouts
      if (item.partName.includes('Cleats')) continue;

      let colorIndex = 0;
      if (item.partName.includes('Top & Bottom')) colorIndex = 0; // Cyan
      else if (item.partName.includes('Side')) colorIndex = 1; // Amber
      else if (item.partName.includes('Baffle')) colorIndex = 2; // Emerald
      else if (item.partName.includes('Back') || item.partName.includes('Slats')) colorIndex = 3; // Purple
      else colorIndex = 4; // Blue

      for (let i = 1; i <= item.quantity; i++) {
        const suffix = item.quantity > 1 ? ` #${i}` : '';
        panels.push({
          id: `${item.partName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
          partName: `${item.partName}${suffix}`,
          widthMm: item.widthMm,
          heightMm: item.heightOrDepthMm,
          originalWidthMm: item.widthMm,
          originalHeightMm: item.heightOrDepthMm,
          widthInches: item.widthInches,
          heightInches: item.heightOrDepthInches,
          thicknessMm: item.thicknessMm,
          notes: item.notes,
          colorIndex,
        });
      }
    }

    // Sort descending by max dimension, then by area (Best Fit Decreasing)
    return panels.sort((a, b) => {
      const maxDimA = Math.max(a.widthMm, a.heightMm);
      const maxDimB = Math.max(b.widthMm, b.heightMm);
      if (maxDimB !== maxDimA) return maxDimB - maxDimA;
      return b.widthMm * b.heightMm - a.widthMm * a.heightMm;
    });
  }

  /**
   * Finds the best free rectangle for a panel using Best-Area-Fit / Best-Short-Side-Fit.
   */
  private findBestRectForPanel(
    freeRects: FreeRect[],
    panel: PanelToPlace,
    config: SheetCutConfig
  ): { rectIndex: number; rotated: boolean; w: number; h: number } | null {
    let bestIndex = -1;
    let bestRotated = false;
    let bestW = 0;
    let bestH = 0;
    let bestScore = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < freeRects.length; i++) {
      const r = freeRects[i];

      // Normal orientation
      if (panel.widthMm <= r.w && panel.heightMm <= r.h) {
        const leftoverArea = r.w * r.h - panel.widthMm * panel.heightMm;
        const shortSideFit = Math.min(r.w - panel.widthMm, r.h - panel.heightMm);
        const score = leftoverArea * 1000 + shortSideFit;

        if (score < bestScore) {
          bestScore = score;
          bestIndex = i;
          bestRotated = false;
          bestW = panel.widthMm;
          bestH = panel.heightMm;
        }
      }

      // Rotated orientation
      if (
        config.allowRotation &&
        panel.heightMm <= r.w &&
        panel.widthMm <= r.h
      ) {
        const leftoverArea = r.w * r.h - panel.heightMm * panel.widthMm;
        const shortSideFit = Math.min(r.w - panel.heightMm, r.h - panel.widthMm);
        const score = leftoverArea * 1000 + shortSideFit;

        if (score < bestScore) {
          bestScore = score;
          bestIndex = i;
          bestRotated = true;
          bestW = panel.heightMm;
          bestH = panel.widthMm;
        }
      }
    }

    if (bestIndex === -1) return null;

    return {
      rectIndex: bestIndex,
      rotated: bestRotated,
      w: bestW,
      h: bestH,
    };
  }

  /**
   * Places a panel inside a free rectangle and performs Guillotine space splitting.
   */
  private placePanelOnSheet(
    sheet: { layout: SheetCutLayout; freeRects: FreeRect[] },
    panel: PanelToPlace,
    placement: { rectIndex: number; rotated: boolean; w: number; h: number },
    kerfMm: number
  ): void {
    const targetRect = sheet.freeRects[placement.rectIndex];
    sheet.freeRects.splice(placement.rectIndex, 1);

    const placedPanel: PlacedPanel = {
      id: panel.id,
      partName: panel.partName,
      xMm: targetRect.x,
      yMm: targetRect.y,
      widthMm: placement.w,
      heightMm: placement.h,
      rotated: placement.rotated,
      originalWidthMm: panel.originalWidthMm,
      originalHeightMm: panel.originalHeightMm,
      widthInches: panel.widthInches,
      heightInches: panel.heightInches,
      thicknessMm: panel.thicknessMm,
      notes: panel.notes,
      colorIndex: panel.colorIndex,
    };

    sheet.layout.placedPanels.push(placedPanel);

    // Guillotine Cut Space Split
    const remW = targetRect.w - placement.w - kerfMm;
    const remH = targetRect.h - placement.h - kerfMm;

    if (remW > 0 && remH > 0) {
      // Shorter axis split rule for clean straight rip/cross cuts
      if (remW >= remH) {
        sheet.freeRects.push({
          x: targetRect.x + placement.w + kerfMm,
          y: targetRect.y,
          w: remW,
          h: targetRect.h,
        });
        sheet.freeRects.push({
          x: targetRect.x,
          y: targetRect.y + placement.h + kerfMm,
          w: placement.w,
          h: remH,
        });
      } else {
        sheet.freeRects.push({
          x: targetRect.x,
          y: targetRect.y + placement.h + kerfMm,
          w: targetRect.w,
          h: remH,
        });
        sheet.freeRects.push({
          x: targetRect.x + placement.w + kerfMm,
          y: targetRect.y,
          w: remW,
          h: placement.h,
        });
      }
    } else if (remW > 0) {
      sheet.freeRects.push({
        x: targetRect.x + placement.w + kerfMm,
        y: targetRect.y,
        w: remW,
        h: targetRect.h,
      });
    } else if (remH > 0) {
      sheet.freeRects.push({
        x: targetRect.x,
        y: targetRect.y + placement.h + kerfMm,
        w: targetRect.w,
        h: remH,
      });
    }
  }
}
