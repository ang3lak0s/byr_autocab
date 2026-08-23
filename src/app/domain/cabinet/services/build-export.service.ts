import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import {
  ConfiguratorState,
  SpeakerCount,
  SpeakerDiameterPreset,
  SpeakerLayoutType,
  CabinetFormFactor,
  BackEnclosureType,
  ConstructionMethodType,
  MeasurementUnit,
} from '../models/configurator-state.model';
import { CompleteBuildPlan, CutListItem } from '../models/calculation-result.model';

@Injectable({
  providedIn: 'root',
})
export class BuildExportService {
  /**
   * Triggers native browser print dialog for high-fidelity PDF export.
   */
  printBuildTraveler(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  /**
   * Generates and downloads a CSV cut list file compatible with table saws & CutList Optimizer.
   */
  exportCutListToCsv(cutList: CutListItem[], cabName: string = 'speaker-cabinet'): void {
    const headers = ['Part Name', 'Quantity', 'Width (mm)', 'Height/Depth (mm)', 'Thickness (mm)', 'Width (Inches)', 'Height/Depth (Inches)', 'Notes'];
    const rows = cutList.map((item) => [
      `"${item.partName.replace(/"/g, '""')}"`,
      item.quantity,
      item.widthMm,
      item.heightOrDepthMm,
      item.thicknessMm,
      `"${item.widthInches}"`,
      `"${item.heightOrDepthInches}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    this.downloadBlob(csvContent, `${this.slugify(cabName)}-cut-list.csv`, 'text/csv;charset=utf-8;');
  }

  /**
   * Generates and downloads a full JSON project file for backup and re-import.
   */
  exportProjectToJson(state: ConfiguratorState, plan: CompleteBuildPlan): void {
    const payload = {
      app: 'BYR-AutoCab',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      state,
      summary: {
        externalDimensionsMm: {
          width: plan.externalWidthMm,
          height: plan.externalHeightMm,
          depth: plan.externalDepthMm,
        },
        netVolumeLiters: plan.acousticVolume.volumeLiters,
        totalCost: `${plan.costs.currencySymbol}${plan.costs.totalCost}`,
        driverCount: state.speaker.count,
        driverModel: state.speaker.modelId,
        wiringMode: plan.wiringPlan.activeOption.name,
        totalImpedance: `${plan.wiringPlan.activeOption.totalImpedanceOhms} Ohms`,
      },
    };

    const jsonContent = JSON.stringify(payload, null, 2);
    const filename = `byr-autocab-${state.speaker.count}x${state.speaker.diameterPreset}-${this.slugify(new Date().toLocaleDateString())}.json`;
    this.downloadBlob(jsonContent, filename, 'application/json;charset=utf-8;');
  }

  /**
   * Serializes current state into URL query parameters for 1-click sharing.
   */
  serializeStateToQueryParams(state: ConfiguratorState): Record<string, string | number> {
    return {
      w: state.dimensions.width,
      h: state.dimensions.height,
      d: state.dimensions.depth,
      u: state.dimensions.unit,
      sp: state.speaker.count,
      sz: state.speaker.diameterPreset,
      drv: state.speaker.modelId || 'celestion-v30',
      lay: state.speaker.layout,
      ff: state.formFactor,
      thick: state.material.thicknessMm,
      back: state.backConfig,
      join: state.constructionMethod,
      cutout: state.speaker.cutoutDiameterMm,
      depth: state.speaker.mountingDepthMm || 124,
    };
  }

  /**
   * Deserializes URL query parameters back into a ConfiguratorState.
   */
  parseQueryParamsToState(params: Params, currentState: ConfiguratorState): ConfiguratorState {
    const next: ConfiguratorState = {
      ...currentState,
      dimensions: { ...currentState.dimensions },
      speaker: { ...currentState.speaker },
      material: { ...currentState.material },
      costs: { ...currentState.costs },
    };

    if (params['w']) next.dimensions.width = Number(params['w']);
    if (params['h']) next.dimensions.height = Number(params['h']);
    if (params['d']) next.dimensions.depth = Number(params['d']);
    if (params['u'] === 'mm' || params['u'] === 'inch') next.dimensions.unit = params['u'];

    if (params['sp']) next.speaker.count = Number(params['sp']) as SpeakerCount;
    if (params['sz']) next.speaker.diameterPreset = params['sz'] as SpeakerDiameterPreset;
    if (params['drv']) next.speaker.modelId = params['drv'];
    if (params['lay']) next.speaker.layout = params['lay'] as SpeakerLayoutType;
    if (params['cutout']) next.speaker.cutoutDiameterMm = Number(params['cutout']);
    if (params['depth']) next.speaker.mountingDepthMm = Number(params['depth']);

    if (params['ff']) next.formFactor = params['ff'] as CabinetFormFactor;
    if (params['thick']) next.material.thicknessMm = Number(params['thick']);
    if (params['back']) next.backConfig = params['back'] as BackEnclosureType;
    if (params['join']) next.constructionMethod = params['join'] as ConstructionMethodType;

    return next;
  }

  /**
   * Helper to trigger a client-side file download.
   */
  private downloadBlob(content: string, filename: string, mimeType: string): void {
    if (typeof window === 'undefined') return;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}
