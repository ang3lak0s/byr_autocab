import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';

export type HeroCabPreset = 'cab112' | 'cab212' | 'cab412';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
})
export class HeroSectionComponent {
  readonly i18n = inject(TranslationService);
  activePreset = signal<HeroCabPreset>('cab112');
  activeUnit = signal<'in' | 'mm'>('in');

  // Interactive blueprint parametric dimensions
  activeWidth = signal<number>(24);
  activeHeight = signal<number>(18);
  activeDepth = signal<number>(12);
  activePanelsCount = signal<number>(6);

  readonly activeDriverConfig = computed(() => {
    const preset = this.activePreset();
    const isHu = this.i18n.isHungarian();
    if (preset === 'cab112') {
      return isHu ? '1 × 12" Hangszóró (11.1" Kivágás)' : '1 × 12" Driver (11.1" Cutout)';
    } else if (preset === 'cab212') {
      return isHu ? '2 × 12" Dupla Hangszóró (Egymás mellett)' : '2 × 12" Dual Drivers (Side-by-Side)';
    } else {
      return isHu ? '4 × 12" Szimmetrikus 4-es Elrendezés' : '4 × 12" Symmetrical Quad Array';
    }
  });

  readonly activeVolume = computed(() => {
    const preset = this.activePreset();
    const isHu = this.i18n.isHungarian();
    if (preset === 'cab112') {
      return isHu ? '42.5 Liter (1.50 cu ft)' : '42.5 Litres (1.50 cu ft)';
    } else if (preset === 'cab212') {
      return isHu ? '72.8 Liter (2.57 cu ft)' : '72.8 Litres (2.57 cu ft)';
    } else {
      return isHu ? '112.5 Liter (3.97 cu ft)' : '112.5 Litres (3.97 cu ft)';
    }
  });

  readonly activeEnclosure = computed(() => {
    const preset = this.activePreset();
    const isHu = this.i18n.isHungarian();
    if (preset === 'cab112') {
      return isHu ? 'Átalakítható 3-részes Hátlap' : 'Convertible 3-Piece Back';
    } else if (preset === 'cab212') {
      return isHu ? 'Zárt Hátfal' : 'Sealed Closed-Back';
    } else {
      return isHu ? 'Zárt Hátfal + Merevítő Oszlop' : 'Closed-Back + Soundpost Brace';
    }
  });

  selectPreset(preset: HeroCabPreset): void {
    this.activePreset.set(preset);

    if (preset === 'cab112') {
      this.activeWidth.set(this.activeUnit() === 'in' ? 24 : 610);
      this.activeHeight.set(this.activeUnit() === 'in' ? 18 : 457);
      this.activeDepth.set(this.activeUnit() === 'in' ? 12 : 305);
      this.activePanelsCount.set(6);
    } else if (preset === 'cab212') {
      this.activeWidth.set(this.activeUnit() === 'in' ? 30 : 762);
      this.activeHeight.set(this.activeUnit() === 'in' ? 20 : 508);
      this.activeDepth.set(this.activeUnit() === 'in' ? 14 : 356);
      this.activePanelsCount.set(5);
    } else {
      this.activeWidth.set(this.activeUnit() === 'in' ? 30 : 762);
      this.activeHeight.set(this.activeUnit() === 'in' ? 30 : 762);
      this.activeDepth.set(this.activeUnit() === 'in' ? 14 : 356);
      this.activePanelsCount.set(6);
    }
  }

  toggleUnit(unit: 'in' | 'mm'): void {
    if (this.activeUnit() === unit) return;
    this.activeUnit.set(unit);
    this.selectPreset(this.activePreset());
  }
}

