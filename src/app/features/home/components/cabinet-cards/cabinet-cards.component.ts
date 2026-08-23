import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CabinetConfiguration, CabinetCategory } from '../../../../domain/cabinet/models/cabinet.model';
import { EXAMPLE_CABINETS } from '../../../../domain/cabinet/mocks/example-cabinets.mock';

@Component({
  selector: 'app-cabinet-cards',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cabinet-cards.component.html',
  styleUrls: ['./cabinet-cards.component.scss'],
})
export class CabinetCardsComponent {
  readonly cabinets = signal<CabinetConfiguration[]>(EXAMPLE_CABINETS);
  readonly selectedCategory = signal<CabinetCategory | 'all'>('all');
  readonly dimensionUnit = signal<'in' | 'mm'>('in');

  readonly filteredCabinets = computed(() => {
    const category = this.selectedCategory();
    const list = this.cabinets();
    if (category === 'all') return list;
    return list.filter((cab) => cab.category === category);
  });

  setCategory(category: CabinetCategory | 'all'): void {
    this.selectedCategory.set(category);
  }

  setUnit(unit: 'in' | 'mm'): void {
    this.dimensionUnit.set(unit);
  }

  formatDimension(inches: number): string {
    if (this.dimensionUnit() === 'in') {
      return `${inches}"`;
    }
    const mm = Math.round(inches * 25.4);
    return `${mm}mm`;
  }
}
