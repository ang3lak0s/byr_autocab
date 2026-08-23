import { Injectable, inject } from '@angular/core';
import {
  ConfiguratorState,
  CabinetDimensionsInput,
  SpeakerConfigInput,
  MaterialConfigInput,
  CostEstimatesInput,
  ConstructionMethodType,
  BackEnclosureType,
} from '../models/configurator-state.model';
import {
  CompleteBuildPlan,
  InternalDimensionsMm,
  AcousticVolumeResult,
  SpeakerClearanceValidation,
  SpeakerCutoutPosition,
  CutListItem,
  MaterialRequirementResult,
  CostEstimateResult,
  BuildDifficultyResult,
  ToolRequirementResult,
} from '../models/calculation-result.model';
import { SheetCutOptimizerService } from './sheet-cut-optimizer.service';
import { SpeakerWiringService } from './speaker-wiring.service';

@Injectable({
  providedIn: 'root',
})
export class CabinetCalculatorService {
  private readonly sheetOptimizer = inject(SheetCutOptimizerService);
  private readonly wiringService = inject(SpeakerWiringService);

  /**
   * Primary entry point: Calculates a complete build plan from user input state.
   */
  calculateBuildPlan(state: ConfiguratorState): CompleteBuildPlan {
    const extWidthMm = this.toMm(state.dimensions.width, state.dimensions.unit);
    const extHeightMm = this.toMm(state.dimensions.height, state.dimensions.unit);
    const extDepthMm = this.toMm(state.dimensions.depth, state.dimensions.unit);
    const thicknessMm = state.material.thicknessMm || 18;

    const internalDims = this.calculateInternalDimensions(
      extWidthMm,
      extHeightMm,
      extDepthMm,
      thicknessMm
    );

    const acousticVolume = this.calculateAcousticVolume(internalDims);

    const clearanceValidation = this.validateSpeakerClearance(
      state.speaker,
      internalDims.width,
      internalDims.height,
      internalDims.depth,
      thicknessMm
    );

    const cutList = this.generateCutList(
      extWidthMm,
      extHeightMm,
      extDepthMm,
      thicknessMm,
      state.constructionMethod,
      state.backConfig
    );

    const materials = this.calculateMaterials(
      cutList,
      state.material.wasteAllowancePercent
    );

    const costs = this.calculateCosts(state.costs);

    const difficulty = this.determineDifficulty(
      state.constructionMethod,
      state.speaker.count
    );

    const tools = this.determineTools(state.constructionMethod);

    const sheetCutPlan = this.sheetOptimizer.optimizeSheetCuts(cutList);

    const wiringPlan = this.wiringService.calculateWiringPlan(
      state.speaker.count,
      state.speaker.impedanceOhms || 8,
      undefined,
      state.speaker.powerHandlingWatts || 60
    );

    return {
      externalWidthMm: extWidthMm,
      externalHeightMm: extHeightMm,
      externalDepthMm: extDepthMm,
      materialThicknessMm: thicknessMm,
      acousticVolume,
      clearanceValidation,
      cutList,
      materials,
      costs,
      difficulty,
      tools,
      sheetCutPlan,
      wiringPlan,
    };
  }

  /**
   * Internal Dimensions: W - 2T, H - 2T, D - 2T
   */
  calculateInternalDimensions(
    extWidthMm: number,
    extHeightMm: number,
    extDepthMm: number,
    thicknessMm: number
  ): InternalDimensionsMm {
    return {
      width: Math.max(0, extWidthMm - 2 * thicknessMm),
      height: Math.max(0, extHeightMm - 2 * thicknessMm),
      depth: Math.max(0, extDepthMm - 2 * thicknessMm),
    };
  }

  /**
   * Geometric Volume in Litres & Cubic Feet
   */
  calculateAcousticVolume(internalDims: InternalDimensionsMm): AcousticVolumeResult {
    const volumeLiters =
      (internalDims.width * internalDims.height * internalDims.depth) / 1000000;
    const volumeCuFt = volumeLiters / 28.3168;

    return {
      volumeLiters: Number(volumeLiters.toFixed(1)),
      volumeCuFt: Number(volumeCuFt.toFixed(2)),
      internalDimensions: internalDims,
      disclaimer:
        'Approximate geometric internal volume. Does not account for speaker displacement, bracing, or internal hardware.',
    };
  }

  /**
   * Speaker Clearance Validation: checks if drivers fit on baffle with minimum margins and validates depth clearance
   */
  validateSpeakerClearance(
    speaker: SpeakerConfigInput,
    baffleWidthMm: number,
    baffleHeightMm: number,
    internalDepthMm: number = 269,
    materialThicknessMm: number = 18
  ): SpeakerClearanceValidation {
    const cutoutMm = speaker.cutoutDiameterMm || 283;
    const edgeMarginMm = 25; // 25mm (~1 inch) minimum edge margin
    const interSpeakerGapMm = 20; // 20mm minimum gap between speakers

    let minWidth = 0;
    let minHeight = 0;
    const positions: SpeakerCutoutPosition[] = [];
    const warnings: string[] = [];
    const infoMessages: string[] = [];

    const bw = Math.max(1, baffleWidthMm);
    const bh = Math.max(1, baffleHeightMm);

    switch (speaker.layout) {
      case 'single': {
        minWidth = cutoutMm + 2 * edgeMarginMm;
        minHeight = cutoutMm + 2 * edgeMarginMm;
        const cxMm = bw / 2;
        const cyMm = bh / 2;
        positions.push({
          index: 1,
          centerX: 50,
          centerY: 50,
          centerXMm: Number(cxMm.toFixed(1)),
          centerYMm: Number(cyMm.toFixed(1)),
          diameterMm: cutoutMm,
        });
        break;
      }
      case 'horizontal-2x': {
        minWidth = 2 * cutoutMm + interSpeakerGapMm + 2 * edgeMarginMm;
        minHeight = cutoutMm + 2 * edgeMarginMm;
        const spacingMm =
          bw >= minWidth
            ? Math.max(
                cutoutMm + interSpeakerGapMm,
                Math.min(bw - cutoutMm - 2 * edgeMarginMm, bw * 0.48)
              )
            : cutoutMm + interSpeakerGapMm;

        const cx1 = bw / 2 - spacingMm / 2;
        const cx2 = bw / 2 + spacingMm / 2;
        const cy = bh / 2;

        positions.push(
          {
            index: 1,
            centerX: Number(((cx1 / bw) * 100).toFixed(1)),
            centerY: 50,
            centerXMm: Number(cx1.toFixed(1)),
            centerYMm: Number(cy.toFixed(1)),
            diameterMm: cutoutMm,
          },
          {
            index: 2,
            centerX: Number(((cx2 / bw) * 100).toFixed(1)),
            centerY: 50,
            centerXMm: Number(cx2.toFixed(1)),
            centerYMm: Number(cy.toFixed(1)),
            diameterMm: cutoutMm,
          }
        );
        break;
      }
      case 'vertical-2x': {
        minWidth = cutoutMm + 2 * edgeMarginMm;
        minHeight = 2 * cutoutMm + interSpeakerGapMm + 2 * edgeMarginMm;
        const spacingMm =
          bh >= minHeight
            ? Math.max(
                cutoutMm + interSpeakerGapMm,
                Math.min(bh - cutoutMm - 2 * edgeMarginMm, bh * 0.48)
              )
            : cutoutMm + interSpeakerGapMm;

        const cx = bw / 2;
        const cy1 = bh / 2 - spacingMm / 2;
        const cy2 = bh / 2 + spacingMm / 2;

        positions.push(
          {
            index: 1,
            centerX: 50,
            centerY: Number(((cy1 / bh) * 100).toFixed(1)),
            centerXMm: Number(cx.toFixed(1)),
            centerYMm: Number(cy1.toFixed(1)),
            diameterMm: cutoutMm,
          },
          {
            index: 2,
            centerX: 50,
            centerY: Number(((cy2 / bh) * 100).toFixed(1)),
            centerXMm: Number(cx.toFixed(1)),
            centerYMm: Number(cy2.toFixed(1)),
            diameterMm: cutoutMm,
          }
        );
        break;
      }
      case 'grid-2x2': {
        minWidth = 2 * cutoutMm + interSpeakerGapMm + 2 * edgeMarginMm;
        minHeight = 2 * cutoutMm + interSpeakerGapMm + 2 * edgeMarginMm;

        const spacingXMm =
          bw >= minWidth
            ? Math.max(
                cutoutMm + interSpeakerGapMm,
                Math.min(bw - cutoutMm - 2 * edgeMarginMm, bw * 0.48)
              )
            : cutoutMm + interSpeakerGapMm;

        const spacingYMm =
          bh >= minHeight
            ? Math.max(
                cutoutMm + interSpeakerGapMm,
                Math.min(bh - cutoutMm - 2 * edgeMarginMm, bh * 0.48)
              )
            : cutoutMm + interSpeakerGapMm;

        const cx1 = bw / 2 - spacingXMm / 2;
        const cx2 = bw / 2 + spacingXMm / 2;
        const cy1 = bh / 2 - spacingYMm / 2;
        const cy2 = bh / 2 + spacingYMm / 2;

        const x1Pct = Number(((cx1 / bw) * 100).toFixed(1));
        const x2Pct = Number(((cx2 / bw) * 100).toFixed(1));
        const y1Pct = Number(((cy1 / bh) * 100).toFixed(1));
        const y2Pct = Number(((cy2 / bh) * 100).toFixed(1));

        positions.push(
          {
            index: 1,
            centerX: x1Pct,
            centerY: y1Pct,
            centerXMm: Number(cx1.toFixed(1)),
            centerYMm: Number(cy1.toFixed(1)),
            diameterMm: cutoutMm,
          },
          {
            index: 2,
            centerX: x2Pct,
            centerY: y1Pct,
            centerXMm: Number(cx2.toFixed(1)),
            centerYMm: Number(cy1.toFixed(1)),
            diameterMm: cutoutMm,
          },
          {
            index: 3,
            centerX: x1Pct,
            centerY: y2Pct,
            centerXMm: Number(cx1.toFixed(1)),
            centerYMm: Number(cy2.toFixed(1)),
            diameterMm: cutoutMm,
          },
          {
            index: 4,
            centerX: x2Pct,
            centerY: y2Pct,
            centerXMm: Number(cx2.toFixed(1)),
            centerYMm: Number(cy2.toFixed(1)),
            diameterMm: cutoutMm,
          }
        );
        break;
      }
    }

    let isBaffleValid = true;

    if (baffleWidthMm < minWidth) {
      isBaffleValid = false;
      warnings.push(
        `⚠ Insufficient baffle width for ${speaker.count}x speaker layout. Available: ${baffleWidthMm}mm, Recommended minimum: ${Math.round(minWidth)}mm.`
      );
    }

    if (baffleHeightMm < minHeight) {
      isBaffleValid = false;
      warnings.push(
        `⚠ Insufficient baffle height for ${speaker.count}x speaker layout. Available: ${baffleHeightMm}mm, Recommended minimum: ${Math.round(minHeight)}mm.`
      );
    }

    if (isBaffleValid) {
      infoMessages.push(
        `✓ All ${speaker.count} speaker cutout(s) fit cleanly on the ${baffleWidthMm} × ${baffleHeightMm} mm baffle with ≥ ${edgeMarginMm}mm perimeter clearance.`
      );
    }

    // --- DEPTH CLEARANCE VALIDATION ---
    const baffleInsetMm = 25; // Standard front baffle setback for grill cloth & frame
    const rearCleatAllowanceMm = 19; // Rear panel cleat depth
    const polePieceCoolingGapMm = 20; // Recommended minimum air gap behind magnet
    const speakerMountingDepthMm = speaker.mountingDepthMm || 124; // Default 124mm (Celestion V30)

    const availableDepthBehindBaffleMm = Math.max(
      0,
      internalDepthMm - baffleInsetMm - rearCleatAllowanceMm
    );
    const clearanceToBackPanelMm = Number(
      (availableDepthBehindBaffleMm - speakerMountingDepthMm).toFixed(1)
    );
    const minRecommendedCabinetDepthMm = Math.round(
      speakerMountingDepthMm +
        baffleInsetMm +
        rearCleatAllowanceMm +
        polePieceCoolingGapMm +
        2 * materialThicknessMm
    );

    let isDepthValid = true;
    let hasVentBreathingRoom = true;
    let depthWarning: string | undefined;
    let depthInfo: string | undefined;

    if (clearanceToBackPanelMm < 0) {
      isDepthValid = false;
      hasVentBreathingRoom = false;
      depthWarning = `🚨 CRITICAL DEPTH COLLISION: Driver magnet (${speakerMountingDepthMm} mm mounting depth) physically hits the rear back panel by ${Math.abs(Math.round(clearanceToBackPanelMm))} mm! Increase total cabinet depth to at least ${minRecommendedCabinetDepthMm} mm.`;
      warnings.push(depthWarning);
    } else if (clearanceToBackPanelMm < polePieceCoolingGapMm) {
      isDepthValid = true;
      hasVentBreathingRoom = false;
      depthWarning = `⚠ TIGHT REAR AIR-GAP: Only ${Math.round(clearanceToBackPanelMm)} mm clearance behind speaker magnet. Drivers with vented pole pieces recommend ≥ 20 mm breathing room for voice coil thermal dissipation.`;
      warnings.push(depthWarning);
    } else {
      isDepthValid = true;
      hasVentBreathingRoom = true;
      depthInfo = `✓ Driver depth verified: ${Math.round(clearanceToBackPanelMm)} mm rear breathing clearance behind magnet.`;
      infoMessages.push(depthInfo);
    }

    const totalPowerHandlingWatts = (speaker.powerHandlingWatts || 60) * speaker.count;
    const totalDriverWeightKg = Number(((speaker.weightKg || 4.7) * speaker.count).toFixed(1));

    return {
      isValid: isBaffleValid && isDepthValid,
      baffleWidthMm,
      baffleHeightMm,
      minRequiredBaffleWidthMm: Math.round(minWidth),
      minRequiredBaffleHeightMm: Math.round(minHeight),
      positions,
      depthValidation: {
        isValid: isDepthValid,
        speakerMountingDepthMm,
        availableDepthBehindBaffleMm: Math.round(availableDepthBehindBaffleMm),
        clearanceToBackPanelMm,
        minRecommendedCabinetDepthMm,
        hasVentBreathingRoom,
        warningMessage: depthWarning,
        infoMessage: depthInfo,
      },
      totalPowerHandlingWatts,
      totalDriverWeightKg,
      warnings,
      infoMessages,
    };
  }

  /**
   * Generates a deterministic panel cut list based on construction method and back configuration.
   */
  generateCutList(
    extWidthMm: number,
    extHeightMm: number,
    extDepthMm: number,
    thicknessMm: number,
    method: ConstructionMethodType,
    backConfig: BackEnclosureType
  ): CutListItem[] {
    const list: CutListItem[] = [];

    const formatInches = (mm: number) => {
      const totalInches = mm / 25.4;
      const whole = Math.floor(totalInches);
      const remainder = totalInches - whole;
      const fraction32 = Math.round(remainder * 32);

      if (fraction32 === 0) return `${whole}"`;
      if (fraction32 === 32) return `${whole + 1}"`;

      const gcd = (a: number, b: number): number => (!b ? a : gcd(b, a % b));
      const divisor = gcd(fraction32, 32);
      const num = fraction32 / divisor;
      const den = 32 / divisor;

      return whole > 0 ? `${whole}-${num}/${den}"` : `${num}/${den}"`;
    };

    if (method === 'rabbet-glue') {
      const rabbetDepthMm = thicknessMm / 2;
      // Top & Bottom caps
      list.push({
        partName: 'Top & Bottom Panels',
        quantity: 2,
        widthMm: extWidthMm,
        heightOrDepthMm: extDepthMm,
        thicknessMm,
        widthInches: formatInches(extWidthMm),
        heightOrDepthInches: formatInches(extDepthMm),
        thicknessInches: formatInches(thicknessMm),
        notes: `Rabbeted ${rabbetDepthMm}mm on end edges to capture side panels`,
      });

      // Side panels (recessed into top/bottom rabbets)
      const sideHeight = extHeightMm - 2 * (thicknessMm - rabbetDepthMm);
      list.push({
        partName: 'Left & Right Side Panels',
        quantity: 2,
        widthMm: sideHeight,
        heightOrDepthMm: extDepthMm,
        thicknessMm,
        widthInches: formatInches(sideHeight),
        heightOrDepthInches: formatInches(extDepthMm),
        thicknessInches: formatInches(thicknessMm),
        notes: `Interlocking into top/bottom rabbet grooves`,
      });
    } else {
      // Standard butt-joint construction (Basic screw/nail & Glue + screw)
      list.push({
        partName: 'Top & Bottom Panels',
        quantity: 2,
        widthMm: extWidthMm,
        heightOrDepthMm: extDepthMm,
        thicknessMm,
        widthInches: formatInches(extWidthMm),
        heightOrDepthInches: formatInches(extDepthMm),
        thicknessInches: formatInches(thicknessMm),
        notes: 'Outer top & bottom capping panels',
      });

      const sideHeight = extHeightMm - 2 * thicknessMm;
      list.push({
        partName: 'Left & Right Side Panels',
        quantity: 2,
        widthMm: sideHeight,
        heightOrDepthMm: extDepthMm,
        thicknessMm,
        widthInches: formatInches(sideHeight),
        heightOrDepthInches: formatInches(extDepthMm),
        thicknessInches: formatInches(thicknessMm),
        notes: 'Mounted flush between top and bottom panels',
      });
    }

    // Front Baffle Board
    const baffleWidth = extWidthMm - 2 * thicknessMm;
    const baffleHeight = extHeightMm - 2 * thicknessMm;
    list.push({
      partName: 'Front Speaker Baffle',
      quantity: 1,
      widthMm: baffleWidth,
      heightOrDepthMm: baffleHeight,
      thicknessMm,
      widthInches: formatInches(baffleWidth),
      heightOrDepthInches: formatInches(baffleHeight),
      thicknessInches: formatInches(thicknessMm),
      notes: 'Front mounting board with speaker circular cutout(s)',
    });

    // Rear Panel(s) based on BackEnclosureType
    if (backConfig === 'closed-back') {
      list.push({
        partName: 'Sealed Back Panel',
        quantity: 1,
        widthMm: baffleWidth,
        heightOrDepthMm: baffleHeight,
        thicknessMm,
        widthInches: formatInches(baffleWidth),
        heightOrDepthInches: formatInches(baffleHeight),
        thicknessInches: formatInches(thicknessMm),
        notes: 'Full airtight rear sealing panel with gasket perimeter',
      });
    } else if (backConfig === 'half-open') {
      const slatHeight = Math.round(baffleHeight * 0.35);
      list.push({
        partName: 'Upper & Lower Back Slats',
        quantity: 2,
        widthMm: baffleWidth,
        heightOrDepthMm: slatHeight,
        thicknessMm,
        widthInches: formatInches(baffleWidth),
        heightOrDepthInches: formatInches(slatHeight),
        thicknessInches: formatInches(thicknessMm),
        notes: 'Top & bottom rear panels creating a 30% center open vent',
      });
    } else {
      // mostly-open
      const slatHeight = Math.round(baffleHeight * 0.2);
      list.push({
        partName: 'Narrow Perimeter Back Slats',
        quantity: 2,
        widthMm: baffleWidth,
        heightOrDepthMm: slatHeight,
        thicknessMm,
        widthInches: formatInches(baffleWidth),
        heightOrDepthInches: formatInches(slatHeight),
        thicknessInches: formatInches(thicknessMm),
        notes: 'Vintage narrow upper/lower bracing slats (60% open back)',
      });
    }

    // Internal Baffle Support Cleats
    const cleatLengthHoriz = baffleWidth;
    const cleatLengthVert = Math.max(0, baffleHeight - 2 * 19);
    list.push({
      partName: 'Internal Baffle Cleats (Horiz)',
      quantity: 2,
      widthMm: cleatLengthHoriz,
      heightOrDepthMm: 19,
      thicknessMm: 19,
      widthInches: formatInches(cleatLengthHoriz),
      heightOrDepthInches: '3/4"',
      thicknessInches: '3/4"',
      notes: '3/4" x 3/4" hardwood cleats supporting front baffle perimeter',
    });

    list.push({
      partName: 'Internal Baffle Cleats (Vert)',
      quantity: 2,
      widthMm: cleatLengthVert,
      heightOrDepthMm: 19,
      thicknessMm: 19,
      widthInches: formatInches(cleatLengthVert),
      heightOrDepthInches: '3/4"',
      thicknessInches: '3/4"',
      notes: '3/4" x 3/4" hardwood side cleats for baffle mounting',
    });

    return list;
  }

  /**
   * Calculates total panel surface area and material requirements with waste allowance.
   */
  calculateMaterials(
    cutList: CutListItem[],
    wasteAllowancePercent: number = 10
  ): MaterialRequirementResult {
    let totalNetMm2 = 0;

    for (const item of cutList) {
      // skip small cleats from large sheet area calculation
      if (item.partName.includes('Cleats')) continue;
      const panelAreaMm2 = item.widthMm * item.heightOrDepthMm * item.quantity;
      totalNetMm2 += panelAreaMm2;
    }

    const netM2 = totalNetMm2 / 1000000;
    const netSqFt = netM2 * 10.7639;

    const wasteMultiplier = 1 + (wasteAllowancePercent || 10) / 100;
    const grossM2 = netM2 * wasteMultiplier;
    const grossSqFt = netSqFt * wasteMultiplier;

    // Standard 5'x5' Baltic Birch sheet is 1.525m x 1.525m = 2.325 m2
    const sheetAreaM2 = 2.325;
    const estimatedSheets = Math.ceil((grossM2 / sheetAreaM2) * 10) / 10;

    return {
      totalNetPanelAreaM2: Number(netM2.toFixed(2)),
      totalNetPanelAreaSqFt: Number(netSqFt.toFixed(1)),
      totalWithWasteAreaM2: Number(grossM2.toFixed(2)),
      totalWithWasteAreaSqFt: Number(grossSqFt.toFixed(1)),
      wastePercent: wasteAllowancePercent || 10,
      estimatedSheetsCount: Math.max(1, Math.round(estimatedSheets * 10) / 10),
    };
  }

  /**
   * Calculates itemized and total cost estimates.
   */
  calculateCosts(costs: CostEstimatesInput): CostEstimateResult {
    const wood = Number(costs.woodCost) || 0;
    const speakers = Number(costs.speakersCost) || 0;
    const grillCloth = Number(costs.grillClothCost) || 0;
    const tolex = Number(costs.tolexCost) || 0;
    const hardware = Number(costs.hardwareCost) || 0;
    const wiring = Number(costs.wiringCost) || 0;
    const misc = Number(costs.miscCost) || 0;

    const total = wood + speakers + grillCloth + tolex + hardware + wiring + misc;

    return {
      wood,
      speakers,
      grillCloth,
      tolex,
      hardware,
      wiring,
      misc,
      totalCost: Number(total.toFixed(2)),
      currencySymbol: costs.currencySymbol || '$',
    };
  }

  /**
   * Determines build difficulty based on construction method and design factors.
   */
  determineDifficulty(
    method: ConstructionMethodType,
    speakerCount: number
  ): BuildDifficultyResult {
    switch (method) {
      case 'basic-screw-nail':
        return {
          level: 'Beginner',
          badgeClass: 'difficulty-beginner',
          summary: 'Simple straight butt-joint assembly suitable for basic hand tools.',
          reasons: [
            'Straight 90-degree cuts only (no special dado or rabbet bits needed)',
            'Standard wood screws and pre-drilled pilot holes',
            'Can be built with a hand circular saw and cordless drill',
          ],
        };
      case 'glue-screw-nail':
        return {
          level: 'Intermediate',
          badgeClass: 'difficulty-intermediate',
          summary: 'Reinforced butt joints with glue clamping and internal corner battens.',
          reasons: [
            'Requires proper clamping technique during glue cure time',
            'Airtight corner battens require accurate pre-drilling and countersinking',
            speakerCount > 2 ? 'Multiple driver wiring and baffle layout alignment' : 'Moderate woodworking precision',
          ],
        };
      case 'rabbet-glue':
        return {
          level: 'Advanced',
          badgeClass: 'difficulty-advanced',
          summary: 'Precision stepped rabbet joints requiring a router table or table saw with dado blade.',
          reasons: [
            'Stepped rabbet grooves must precisely match actual sheet thickness',
            'Requires router with rabbet bit or calibrated table saw dado stack',
            'Demands exact squareness during glue-up clamping',
          ],
        };
    }
  }

  /**
   * Determines required, recommended, and optional tools based on joinery method.
   */
  determineTools(method: ConstructionMethodType): ToolRequirementResult {
    if (method === 'rabbet-glue') {
      return {
        requiredTools: [
          'Measuring Tape & Steel Square',
          'Table Saw or Circular Track Saw',
          'Router with 3/8" or 1/2" Rabbeting Bit (or Dado Stack)',
          'Jigsaw or Router Circle Jig for speaker cutout',
          'Cordless Drill & Driver bits',
          'Wood Glue (Titebond II) & 4x Bar Clamps',
        ],
        recommendedTools: [
          'Countersink Drill Bit Set',
          'Sanding Block or Orbital Sander',
          'Safety Glasses & Ear Protection',
        ],
        optionalTools: [
          'Pneumatic 18-Gauge Brad Nailer',
          'Pocket Hole Jig for internal bracing',
        ],
      };
    }

    if (method === 'glue-screw-nail') {
      return {
        requiredTools: [
          'Measuring Tape & Speed Square',
          'Circular Saw or Hand Saw',
          'Jigsaw with wood cutting blade (for speaker circle)',
          'Cordless Drill / Driver',
          'Countersink Drill Bit',
          'Wood Glue (Titebond II) & 2x Bar Clamps',
        ],
        recommendedTools: [
          'Clamping Straight-Edge Guide for circular saw',
          'Center Punch for T-nut hole positioning',
          'Hammer (for T-nut insertion)',
        ],
        optionalTools: [
          'Corner Clamping Jigs (90-degree)',
          'Orbital Sander with 120/220 grit paper',
        ],
      };
    }

    // basic-screw-nail
    return {
      requiredTools: [
        'Measuring Tape & Square',
        'Hand Saw or Circular Saw',
        'Jigsaw (for speaker circular cutout)',
        'Cordless Drill / Driver',
        'Screwdriver bits & 1-1/4" Wood Screws',
      ],
      recommendedTools: [
        'Pre-drill / Pilot drill bit',
        'Sandpaper (80 & 120 grit)',
        'Hammer for T-nut setting',
      ],
      optionalTools: [
        'Wood Glue for extra joint rigidity',
        '2x Quick-Grip Clamps',
      ],
    };
  }

  private toMm(val: number, unit: 'mm' | 'inch'): number {
    if (!val || isNaN(val)) return 0;
    return unit === 'inch' ? Math.round(val * 25.4) : Math.round(val);
  }
}
