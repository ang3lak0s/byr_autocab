import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompleteBuildPlan } from '../../../../domain/cabinet/models/calculation-result.model';
import { ConfiguratorState } from '../../../../domain/cabinet/models/configurator-state.model';

export interface SvgSpeakerRenderData {
  index: number;
  cx: number;
  cy: number;
  radius: number;
  outerRimR: number;
  innerConeR: number;
  dustCapR: number;
  boltOffset: number;
}

@Component({
  selector: 'app-live-schematic-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-schematic-preview.component.html',
  styleUrls: ['./live-schematic-preview.component.scss'],
})
export class LiveSchematicPreviewComponent {
  readonly Math = Math;

  @Input({ required: true }) buildPlan!: CompleteBuildPlan;
  @Input({ required: true }) state!: ConfiguratorState;

  readonly viewMode = signal<'front' | 'side'>('front');

  // Viewport and drawing area bounds
  readonly canvasCenterX = 230;
  readonly canvasCenterY = 180;
  readonly maxDrawWidth = 330;
  readonly maxDrawHeight = 240;

  setViewMode(mode: 'front' | 'side'): void {
    this.viewMode.set(mode);
  }

  // --- FRONT VIEW GEOMETRY ---

  get scale(): number {
    const extW = Math.max(100, this.buildPlan.externalWidthMm || 600);
    const extH = Math.max(100, this.buildPlan.externalHeightMm || 450);
    return Math.min(this.maxDrawWidth / extW, this.maxDrawHeight / extH);
  }

  get boxW(): number {
    return Math.round((this.buildPlan.externalWidthMm || 600) * this.scale);
  }

  get boxH(): number {
    return Math.round((this.buildPlan.externalHeightMm || 450) * this.scale);
  }

  get boxX(): number {
    return Math.round(this.canvasCenterX - this.boxW / 2);
  }

  get boxY(): number {
    return Math.round(this.canvasCenterY - this.boxH / 2);
  }

  get wallThickness(): number {
    const t = this.buildPlan.materialThicknessMm || 18;
    return Math.max(3, Math.round(t * this.scale));
  }

  get baffleX(): number {
    return this.boxX + this.wallThickness;
  }

  get baffleY(): number {
    return this.boxY + this.wallThickness;
  }

  get baffleW(): number {
    return Math.max(20, this.boxW - 2 * this.wallThickness);
  }

  get baffleH(): number {
    return Math.max(20, this.boxH - 2 * this.wallThickness);
  }

  get cornerBracketSize(): number {
    return Math.min(18, Math.max(8, Math.round(Math.min(this.boxW, this.boxH) * 0.12)));
  }

  get handleWidth(): number {
    return Math.min(80, Math.max(36, Math.round(this.boxW * 0.35)));
  }

  get handleX(): number {
    return Math.round(this.canvasCenterX - this.handleWidth / 2);
  }

  get handleY(): number {
    return Math.round(this.boxY - 6);
  }

  get dimWidthY(): number {
    return this.boxY - 18;
  }

  get dimHeightX(): number {
    return this.boxX - 18;
  }

  get speakers(): SvgSpeakerRenderData[] {
    const positions = this.buildPlan.clearanceValidation?.positions || [];
    const scale = this.scale;

    return positions.map((pos) => {
      const radius = (pos.diameterMm / 2) * scale;
      let cx = 0;
      let cy = 0;

      if (pos.centerXMm !== undefined && pos.centerYMm !== undefined) {
        cx = this.baffleX + pos.centerXMm * scale;
        cy = this.baffleY + pos.centerYMm * scale;
      } else {
        cx = this.baffleX + (pos.centerX / 100) * this.baffleW;
        cy = this.baffleY + (pos.centerY / 100) * this.baffleH;
      }

      return {
        index: pos.index,
        cx: Math.round(cx * 10) / 10,
        cy: Math.round(cy * 10) / 10,
        radius: Math.round(radius * 10) / 10,
        outerRimR: Math.round(radius * 1.14 * 10) / 10,
        innerConeR: Math.round(radius * 0.65 * 10) / 10,
        dustCapR: Math.round(radius * 0.28 * 10) / 10,
        boltOffset: Math.round(radius * 1.07 * 10) / 10,
      };
    });
  }

  // --- SIDE PROFILE CROSS-SECTION GEOMETRY ---

  get sideScale(): number {
    const extD = Math.max(100, this.buildPlan.externalDepthMm || 300);
    const extH = Math.max(100, this.buildPlan.externalHeightMm || 450);
    return Math.min(this.maxDrawWidth / extD, this.maxDrawHeight / extH);
  }

  get sideBoxW(): number {
    return Math.round((this.buildPlan.externalDepthMm || 300) * this.sideScale);
  }

  get sideBoxH(): number {
    return Math.round((this.buildPlan.externalHeightMm || 450) * this.sideScale);
  }

  get sideBoxX(): number {
    return Math.round(this.canvasCenterX - this.sideBoxW / 2);
  }

  get sideBoxY(): number {
    return Math.round(this.canvasCenterY - this.sideBoxH / 2);
  }

  get sideWallThickness(): number {
    const t = this.buildPlan.materialThicknessMm || 18;
    return Math.max(3, Math.round(t * this.sideScale));
  }

  get sideBaffleInset(): number {
    return Math.round(25 * this.sideScale); // 25mm front grill inset
  }

  get sideBaffleX(): number {
    return this.sideBoxX + this.sideWallThickness + this.sideBaffleInset;
  }

  get sideBaffleBackX(): number {
    return this.sideBaffleX + this.sideWallThickness;
  }

  get sideSpeakerMountingDepth(): number {
    const depthMm =
      this.buildPlan.clearanceValidation?.depthValidation?.speakerMountingDepthMm || 124;
    return Math.round(depthMm * this.sideScale);
  }

  get sideMagnetRearX(): number {
    return this.sideBaffleBackX + this.sideSpeakerMountingDepth;
  }

  get sideBackPanelX(): number {
    return this.sideBoxX + this.sideBoxW - this.sideWallThickness;
  }

  get sideClearanceMm(): number {
    return (
      this.buildPlan.clearanceValidation?.depthValidation?.clearanceToBackPanelMm || 0
    );
  }

  get sideIsCollision(): boolean {
    return this.sideClearanceMm < 0;
  }

  get sideIsTight(): boolean {
    return this.sideClearanceMm >= 0 && this.sideClearanceMm < 20;
  }
}

