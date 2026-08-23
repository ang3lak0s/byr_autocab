import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export type HeroCabPreset = 'cab112' | 'cab212' | 'cab412';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
})
export class HeroSectionComponent {
  activePreset = signal<HeroCabPreset>('cab112');
  activeUnit = signal<'in' | 'mm'>('in');

  // Interactive blueprint parametric dimensions
  activeWidth = signal<number>(24);
  activeHeight = signal<number>(18);
  activeDepth = signal<number>(12);
  activeDriverConfig = signal<string>('1 × 12" Driver (11.1" Cutout)');
  activeVolume = signal<string>('42.5 Litres (1.50 cu ft)');
  activeEnclosure = signal<string>('Convertible 3-Piece Back');
  activePanelsCount = signal<number>(6);

  selectPreset(preset: HeroCabPreset): void {
    this.activePreset.set(preset);

    if (preset === 'cab112') {
      this.activeWidth.set(this.activeUnit() === 'in' ? 24 : 610);
      this.activeHeight.set(this.activeUnit() === 'in' ? 18 : 457);
      this.activeDepth.set(this.activeUnit() === 'in' ? 12 : 305);
      this.activeDriverConfig.set('1 × 12" Driver (11.1" Cutout)');
      this.activeVolume.set('42.5 Litres (1.50 cu ft)');
      this.activeEnclosure.set('Convertible 3-Piece Back');
      this.activePanelsCount.set(6);
    } else if (preset === 'cab212') {
      this.activeWidth.set(this.activeUnit() === 'in' ? 30 : 762);
      this.activeHeight.set(this.activeUnit() === 'in' ? 20 : 508);
      this.activeDepth.set(this.activeUnit() === 'in' ? 14 : 356);
      this.activeDriverConfig.set('2 × 12" Dual Drivers (Side-by-Side)');
      this.activeVolume.set('72.8 Litres (2.57 cu ft)');
      this.activeEnclosure.set('Sealed Closed-Back');
      this.activePanelsCount.set(5);
    } else {
      this.activeWidth.set(this.activeUnit() === 'in' ? 30 : 762);
      this.activeHeight.set(this.activeUnit() === 'in' ? 30 : 762);
      this.activeDepth.set(this.activeUnit() === 'in' ? 14 : 356);
      this.activeDriverConfig.set('4 × 12" Symmetrical Quad Array');
      this.activeVolume.set('112.5 Litres (3.97 cu ft)');
      this.activeEnclosure.set('Closed-Back + Soundpost Brace');
      this.activePanelsCount.set(6);
    }
  }

  toggleUnit(unit: 'in' | 'mm'): void {
    if (this.activeUnit() === unit) return;
    this.activeUnit.set(unit);
    this.selectPreset(this.activePreset());
  }
}
