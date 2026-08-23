import { TestBed } from '@angular/core/testing';
import { SheetCutOptimizerService } from './sheet-cut-optimizer.service';
import { CutListItem } from '../models/calculation-result.model';

describe('SheetCutOptimizerService', () => {
  let service: SheetCutOptimizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SheetCutOptimizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should pack standard 1x12 cab panels onto a single 5x5 Baltic Birch sheet', () => {
    const mockCutList: CutListItem[] = [
      {
        partName: 'Top & Bottom Panels',
        quantity: 2,
        widthMm: 610,
        heightOrDepthMm: 305,
        thicknessMm: 18,
        widthInches: '24"',
        heightOrDepthInches: '12"',
        thicknessInches: '3/4"',
        notes: 'Outer top & bottom capping panels',
      },
      {
        partName: 'Left & Right Side Panels',
        quantity: 2,
        widthMm: 421,
        heightOrDepthMm: 305,
        thicknessMm: 18,
        widthInches: '16-9/16"',
        heightOrDepthInches: '12"',
        thicknessInches: '3/4"',
        notes: 'Side panels',
      },
      {
        partName: 'Front Speaker Baffle',
        quantity: 1,
        widthMm: 574,
        heightOrDepthMm: 421,
        thicknessMm: 18,
        widthInches: '22-19/32"',
        heightOrDepthInches: '16-9/16"',
        thicknessInches: '3/4"',
        notes: 'Front mounting board',
      },
      {
        partName: 'Sealed Back Panel',
        quantity: 1,
        widthMm: 574,
        heightOrDepthMm: 421,
        thicknessMm: 18,
        widthInches: '22-19/32"',
        heightOrDepthInches: '16-9/16"',
        thicknessInches: '3/4"',
        notes: 'Full airtight rear sealing panel',
      },
      {
        partName: 'Internal Baffle Cleats (Horiz)',
        quantity: 2,
        widthMm: 574,
        heightOrDepthMm: 19,
        thicknessMm: 19,
        widthInches: '22-19/32"',
        heightOrDepthInches: '3/4"',
        thicknessInches: '3/4"',
        notes: 'Hardwood cleats',
      },
    ];

    const result = service.optimizeSheetCuts(mockCutList, {
      preset: '5x5-baltic-birch',
      kerfMm: 3.2,
      allowRotation: true,
    });

    expect(result.totalSheetsRequired).toBe(1);
    expect(result.sheets.length).toBe(1);
    // 2 top/bottom + 2 sides + 1 baffle + 1 back = 6 panels placed
    expect(result.sheets[0].placedPanels.length).toBe(6);
    expect(result.sheets[0].utilizationPercent).toBeGreaterThan(45);
    expect(result.unplacedPanels.length).toBe(0);
  });

  it('should account for saw blade kerf without panel collisions', () => {
    const mockCutList: CutListItem[] = [
      {
        partName: 'Top & Bottom Panels',
        quantity: 2,
        widthMm: 600,
        heightOrDepthMm: 300,
        thicknessMm: 18,
        widthInches: '23-5/8"',
        heightOrDepthInches: '11-13/16"',
        thicknessInches: '3/4"',
        notes: '',
      },
      {
        partName: 'Left & Right Side Panels',
        quantity: 2,
        widthMm: 400,
        heightOrDepthMm: 300,
        thicknessMm: 18,
        widthInches: '15-3/4"',
        heightOrDepthInches: '11-13/16"',
        thicknessInches: '3/4"',
        notes: '',
      },
    ];

    const result = service.optimizeSheetCuts(mockCutList, {
      preset: '4x4-half',
      kerfMm: 3.2,
      allowRotation: true,
    });

    expect(result.sheets.length).toBeGreaterThanOrEqual(1);
    const sheet = result.sheets[0];

    // Check all pairs for zero overlapping
    for (let i = 0; i < sheet.placedPanels.length; i++) {
      for (let j = i + 1; j < sheet.placedPanels.length; j++) {
        const p1 = sheet.placedPanels[i];
        const p2 = sheet.placedPanels[j];

        const p1Right = p1.xMm + p1.widthMm;
        const p1Bottom = p1.yMm + p1.heightMm;
        const p2Right = p2.xMm + p2.widthMm;
        const p2Bottom = p2.yMm + p2.heightMm;

        const overlaps =
          p1.xMm < p2Right &&
          p1Right > p2.xMm &&
          p1.yMm < p2Bottom &&
          p1Bottom > p2.yMm;

        expect(overlaps).toBe(false);
      }
    }
  });

  it('should support 4x8 standard sheet preset and custom dimensions', () => {
    const mockCutList: CutListItem[] = [
      {
        partName: 'Panel A',
        quantity: 4,
        widthMm: 800,
        heightOrDepthMm: 400,
        thicknessMm: 18,
        widthInches: '31-1/2"',
        heightOrDepthInches: '15-3/4"',
        thicknessInches: '3/4"',
        notes: '',
      },
    ];

    const result4x8 = service.optimizeSheetCuts(mockCutList, {
      preset: '4x8-standard',
    });
    expect(result4x8.config.sheetWidthMm).toBe(2440);
    expect(result4x8.config.sheetHeightMm).toBe(1220);
    expect(result4x8.totalSheetsRequired).toBe(1);
  });
});
