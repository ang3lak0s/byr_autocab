import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ConfiguratorState,
  SpeakerCount,
  SpeakerDiameterPreset,
  SpeakerLayoutType,
  CabinetFormFactor,
  BackEnclosureType,
  ConstructionMethodType,
  MeasurementUnit,
} from '../../domain/cabinet/models/configurator-state.model';
import { CompleteBuildPlan } from '../../domain/cabinet/models/calculation-result.model';
import { CabinetCalculatorService } from '../../domain/cabinet/services/cabinet-calculator.service';
import { EXAMPLE_CABINETS } from '../../domain/cabinet/mocks/example-cabinets.mock';
import { SPEAKER_DATABASE } from '../../domain/cabinet/mocks/speaker-database.mock';
import { SpeakerDriverModel } from '../../domain/cabinet/models/speaker-driver.model';
import { LiveSchematicPreviewComponent } from './components/live-schematic-preview/live-schematic-preview.component';
import { CutListTableComponent } from './components/cut-list-table/cut-list-table.component';
import { CostSummaryCardComponent } from './components/cost-summary-card/cost-summary-card.component';
import { SheetCutDiagramComponent } from './components/sheet-cut-diagram/sheet-cut-diagram.component';
import { SpeakerWiringCardComponent } from './components/speaker-wiring-card/speaker-wiring-card.component';
import { BuildExportService } from '../../domain/cabinet/services/build-export.service';
import { SubscriptionService } from '../../domain/cabinet/services/subscription.service';

import { ViewportService } from '../../core/services/viewport.service';

export type ConfigStep = 'speakers' | 'dimensions' | 'drivers-wiring' | 'summary';

@Component({
  selector: 'app-configurator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LiveSchematicPreviewComponent,
    CutListTableComponent,
    CostSummaryCardComponent,
    SheetCutDiagramComponent,
    SpeakerWiringCardComponent,
  ],
  templateUrl: './configurator.component.html',
  styleUrls: ['./configurator.component.scss'],
})
export class ConfiguratorComponent implements OnInit {
  private readonly calculator = inject(CabinetCalculatorService);
  private readonly exportService = inject(BuildExportService);
  readonly subService = inject(SubscriptionService);
  readonly viewport = inject(ViewportService);
  private readonly route = inject(ActivatedRoute);

  readonly activeStep = signal<ConfigStep>('speakers');
  readonly mobileViewMode = signal<'controls' | 'preview'>('controls');
  readonly presets = signal(EXAMPLE_CABINETS);
  readonly speakerDatabase = signal<SpeakerDriverModel[]>(SPEAKER_DATABASE);
  readonly selectedBrandFilter = signal<string>('all');
  readonly toastMessage = signal<string | null>(null);

  // Default state: 1x12 Widebody Guitar Cab with Celestion Vintage 30
  readonly state = signal<ConfiguratorState>({
    formFactor: 'horizontal',
    dimensions: {
      width: 610,
      height: 457,
      depth: 305,
      unit: 'mm',
    },
    speaker: {
      count: 1,
      diameterPreset: '12',
      modelId: 'celestion-v30',
      cutoutDiameterMm: 283,
      mountingDepthMm: 124,
      magnetDiameterMm: 156,
      powerHandlingWatts: 60,
      weightKg: 4.7,
      layout: 'single',
    },
    backConfig: 'closed-back',
    constructionMethod: 'glue-screw-nail',
    material: {
      materialName: '18mm Baltic Birch Plywood',
      thicknessMm: 18,
      wasteAllowancePercent: 10,
      sheetPrice: 75,
    },
    costs: {
      woodCost: 65,
      speakersCost: 145,
      grillClothCost: 20,
      tolexCost: 35,
      hardwareCost: 25,
      wiringCost: 10,
      miscCost: 10,
      currencySymbol: '$',
    },
  });

  readonly Math = Math;

  // Reactive calculation result driven strictly by deterministic domain logic
  readonly buildPlan = computed<CompleteBuildPlan>(() => {
    return this.calculator.calculateBuildPlan(this.state());
  });

  readonly activeStepIndex = computed<number>(() => {
    switch (this.activeStep()) {
      case 'speakers': return 1;
      case 'dimensions': return 2;
      case 'drivers-wiring': return 3;
      case 'summary': return 4;
    }
  });

  readonly activeStepTitle = computed<string>(() => {
    switch (this.activeStep()) {
      case 'speakers': return 'Speaker Layout';
      case 'dimensions': return 'Dimensions & Materials';
      case 'drivers-wiring': return 'Drivers & Wiring';
      case 'summary': return 'Build Plan & Cut List';
    }
  });

  get clearanceToBackMm(): number {
    return this.buildPlan().clearanceValidation?.depthValidation?.clearanceToBackPanelMm ?? 0;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['preset']) {
        this.loadPresetById(params['preset']);
      } else if (params['w'] || params['sp']) {
        const restored = this.exportService.parseQueryParamsToState(params, this.state());
        this.state.set(restored);
        this.showToast('✓ Custom build design loaded from URL parameters!');
      }
    });
  }

  setStep(step: ConfigStep): void {
    this.activeStep.set(step);
    this.mobileViewMode.set('controls');
  }

  nextStep(): void {
    const steps: ConfigStep[] = ['speakers', 'dimensions', 'drivers-wiring', 'summary'];
    const currentIndex = steps.indexOf(this.activeStep());
    if (currentIndex < steps.length - 1) {
      this.activeStep.set(steps[currentIndex + 1]);
      this.mobileViewMode.set('controls');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  prevStep(): void {
    const steps: ConfigStep[] = ['speakers', 'dimensions', 'drivers-wiring', 'summary'];
    const currentIndex = steps.indexOf(this.activeStep());
    if (currentIndex > 0) {
      this.activeStep.set(steps[currentIndex - 1]);
      this.mobileViewMode.set('controls');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  toggleMobileView(mode: 'controls' | 'preview'): void {
    this.mobileViewMode.set(mode);
  }

  loadPresetById(presetId: string): void {
    const preset = this.presets().find((p) => p.id === presetId);
    if (!preset) return;

    const widthMm = Math.round(preset.defaultDimensions.width * 25.4);
    const heightMm = Math.round(preset.defaultDimensions.height * 25.4);
    const depthMm = Math.round(preset.defaultDimensions.depth * 25.4);
    const cutoutMm = Math.round(preset.speakerSpec.cutoutDiameter * 25.4);
    const thicknessMm = Math.round(preset.materials.carcassThickness * 25.4);

    let layout: SpeakerLayoutType = 'single';
    if (preset.speakerSpec.driverCount === 2) {
      layout = 'horizontal-2x';
    } else if (preset.speakerSpec.driverCount === 4) {
      layout = 'grid-2x2';
    }

    let backConfig: BackEnclosureType = 'closed-back';
    if (preset.acousticSpec.enclosureStyle === 'open-back') {
      backConfig = 'mostly-open';
    } else if (preset.acousticSpec.enclosureStyle === 'convertible-3-piece') {
      backConfig = 'half-open';
    }

    this.state.update((s) => ({
      ...s,
      dimensions: {
        width: widthMm,
        height: heightMm,
        depth: depthMm,
        unit: 'mm',
      },
      speaker: {
        count: preset.speakerSpec.driverCount as SpeakerCount,
        diameterPreset: `${preset.speakerSpec.driverSize}` as SpeakerDiameterPreset,
        cutoutDiameterMm: cutoutMm,
        layout,
      },
      backConfig,
      material: {
        ...s.material,
        thicknessMm,
        materialName: preset.materials.materialType,
      },
    }));
  }

  // Dimension & Unit Handlers
  setDimensionUnit(unit: MeasurementUnit): void {
    const current = this.state();
    if (current.dimensions.unit === unit) return;

    let w = current.dimensions.width;
    let h = current.dimensions.height;
    let d = current.dimensions.depth;

    if (unit === 'inch') {
      w = Number((w / 25.4).toFixed(2));
      h = Number((h / 25.4).toFixed(2));
      d = Number((d / 25.4).toFixed(2));
    } else {
      w = Math.round(w * 25.4);
      h = Math.round(h * 25.4);
      d = Math.round(d * 25.4);
    }

    this.state.update((s) => ({
      ...s,
      dimensions: { width: w, height: h, depth: d, unit },
    }));
  }

  updateWidth(val: number): void {
    this.state.update((s) => ({
      ...s,
      dimensions: { ...s.dimensions, width: Number(val) },
    }));
  }

  updateHeight(val: number): void {
    this.state.update((s) => ({
      ...s,
      dimensions: { ...s.dimensions, height: Number(val) },
    }));
  }

  updateDepth(val: number): void {
    this.state.update((s) => ({
      ...s,
      dimensions: { ...s.dimensions, depth: Number(val) },
    }));
  }

  readonly selectedDriver = computed<SpeakerDriverModel | undefined>(() => {
    const modelId = this.state().speaker.modelId;
    return this.speakerDatabase().find((d) => d.id === modelId);
  });

  readonly filteredDrivers = computed<SpeakerDriverModel[]>(() => {
    const brand = this.selectedBrandFilter();
    const size = this.state().speaker.diameterPreset;
    return this.speakerDatabase().filter((d) => {
      const matchBrand = brand === 'all' || d.brand.toLowerCase() === brand.toLowerCase();
      const matchSize = size === 'custom' || d.nominalSizeInches.toString() === size;
      return matchBrand && matchSize;
    });
  });

  // Speaker Configuration Handlers
  setSpeakerCount(count: SpeakerCount): void {
    if (count === 4 && !this.subService.isPro()) {
      this.subService.openUpgradeModal(
        '4x10 & 4x12 Stacks',
        'Build heavy 4x10 & 4x12 full and half-stack speaker cabinets with the BYR Pro Workshop Pass.'
      );
      return;
    }

    let layout: SpeakerLayoutType = 'single';
    if (count === 2) layout = 'horizontal-2x';
    if (count === 4) layout = 'grid-2x2';

    this.state.update((s) => ({
      ...s,
      speaker: { ...s.speaker, count, layout },
    }));
  }

  setFormFactor(formFactor: CabinetFormFactor): void {
    this.state.update((s) => ({
      ...s,
      formFactor,
    }));
  }

  setSpeakerDiameter(preset: SpeakerDiameterPreset): void {
    let cutoutMm = 283; // 12" standard
    let depthMm = 124;
    let powerW = 60;
    let weight = 4.7;

    if (preset === '8') {
      cutoutMm = 183;
      depthMm = 83;
      powerW = 15;
      weight = 1.0;
    } else if (preset === '10') {
      cutoutMm = 232;
      depthMm = 98;
      powerW = 30;
      weight = 1.6;
    } else if (preset === '12') {
      cutoutMm = 283;
      depthMm = 124;
      powerW = 60;
      weight = 4.7;
    } else if (preset === '15') {
      cutoutMm = 356;
      depthMm = 154;
      powerW = 450;
      weight = 6.8;
    }

    // Auto-select first non-pro (or active) matching driver in database if available
    const match = this.speakerDatabase().find((d) => {
      const matchSize = d.nominalSizeInches.toString() === preset;
      return this.subService.isPro() ? matchSize : matchSize && !d.isProOnly;
    });

    this.state.update((s) => ({
      ...s,
      speaker: {
        ...s.speaker,
        diameterPreset: preset,
        modelId: match ? match.id : 'custom',
        cutoutDiameterMm: match ? match.cutoutDiameterMm : cutoutMm,
        mountingDepthMm: match ? match.mountingDepthMm : depthMm,
        magnetDiameterMm: match ? match.magnetDiameterMm : 150,
        powerHandlingWatts: match ? match.powerRatingWatts : powerW,
        weightKg: match ? match.weightKg : weight,
      },
    }));
  }

  selectDriver(driverId: string): void {
    const driver = this.speakerDatabase().find((d) => d.id === driverId);
    if (!driver) return;

    if (driver.isProOnly && !this.subService.isPro()) {
      this.subService.openUpgradeModal(
        driver.modelName,
        `Unlock ${driver.modelName} and all boutique/cast-frame pro drivers with the BYR Pro Workshop Pass.`
      );
      return;
    }

    this.state.update((s) => ({
      ...s,
      speaker: {
        ...s.speaker,
        modelId: driver.id,
        diameterPreset: driver.nominalSizeInches.toString() as SpeakerDiameterPreset,
        cutoutDiameterMm: driver.cutoutDiameterMm,
        mountingDepthMm: driver.mountingDepthMm,
        magnetDiameterMm: driver.magnetDiameterMm,
        powerHandlingWatts: driver.powerRatingWatts,
        weightKg: driver.weightKg,
      },
    }));
  }

  setBrandFilter(brand: string): void {
    this.selectedBrandFilter.set(brand);
  }

  updateCustomCutout(val: number): void {
    this.state.update((s) => ({
      ...s,
      speaker: { ...s.speaker, cutoutDiameterMm: Number(val) },
    }));
  }

  updateMountingDepth(val: number): void {
    this.state.update((s) => ({
      ...s,
      speaker: { ...s.speaker, mountingDepthMm: Number(val) },
    }));
  }

  updateDriverPower(val: number): void {
    this.state.update((s) => ({
      ...s,
      speaker: { ...s.speaker, powerHandlingWatts: Number(val) },
    }));
  }

  setLayout(layout: SpeakerLayoutType): void {
    this.state.update((s) => ({
      ...s,
      speaker: { ...s.speaker, layout },
    }));
  }

  // Material & Construction Handlers
  setThickness(thicknessMm: number): void {
    this.state.update((s) => ({
      ...s,
      material: { ...s.material, thicknessMm },
    }));
  }

  setBackConfig(backConfig: BackEnclosureType): void {
    this.state.update((s) => ({
      ...s,
      backConfig,
    }));
  }

  setConstructionMethod(constructionMethod: ConstructionMethodType): void {
    this.state.update((s) => ({
      ...s,
      constructionMethod,
    }));
  }

  // Cost Input Handlers
  updateCost(field: keyof ConfiguratorState['costs'], val: number): void {
    this.state.update((s) => ({
      ...s,
      costs: { ...s.costs, [field]: Number(val) },
    }));
  }

  // Workshop Export & Project Persistence Actions
  printTraveler(): void {
    this.exportService.printBuildTraveler();
  }

  exportCsv(): void {
    const cabName = `${this.state().speaker.count}x${this.state().speaker.diameterPreset}-cab`;
    this.exportService.exportCutListToCsv(this.buildPlan().cutList, cabName);
    this.showToast('✓ Cut List CSV exported successfully!');
  }

  exportJson(): void {
    this.exportService.exportProjectToJson(this.state(), this.buildPlan());
    this.showToast('✓ Project JSON configuration saved!');
  }

  copyShareLink(): void {
    if (typeof window === 'undefined') return;

    const queryParams = this.exportService.serializeStateToQueryParams(this.state());
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([k, v]) => searchParams.set(k, String(v)));

    const shareUrl = `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      this.showToast('✓ Shareable URL copied to clipboard!');
    });
  }

  triggerProjectUpload(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onProjectFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.state) {
          this.state.set(parsed.state);
          this.showToast('✓ Project configuration restored successfully!');
        } else {
          this.showToast('⚠ Invalid project file format.');
        }
      } catch (err) {
        this.showToast('⚠ Error parsing project file.');
      }
      input.value = ''; // Reset input
    };
    reader.readAsText(file);
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => {
      if (this.toastMessage() === message) {
        this.toastMessage.set(null);
      }
    }, 3500);
  }
}

