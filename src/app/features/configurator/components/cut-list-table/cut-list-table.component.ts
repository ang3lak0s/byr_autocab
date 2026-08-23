import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CutListItem } from '../../../../domain/cabinet/models/calculation-result.model';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';

const HU_PART_NAMES: Record<string, string> = {
  'Top Panel': 'Tető Lap',
  'Bottom Panel': 'Fenék Lap',
  'Left Side Panel': 'Bal Oldallap',
  'Right Side Panel': 'Jobb Oldallap',
  'Front Baffle Board': 'Hangszórótartó Előlap (Baffle)',
  'Back Panel': 'Hátlap (Zárt)',
  'Back Panel - Top Slat': 'Hátlap - Felső Léc',
  'Back Panel - Bottom Slat': 'Hátlap - Alsó Léc',
  'Back Panel - Center Slat': 'Hátlap - Középső Kivehető Panel',
  'Internal Corner Cleats': 'Belső Sarokmerevítő Lécek',
  'Baffle Perimeter Cleats': 'Előlap Tartólécek',
  'Back Perimeter Cleats': 'Hátlap Tartólécek',
};

@Component({
  selector: 'app-cut-list-table',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './cut-list-table.component.html',
  styleUrls: ['./cut-list-table.component.scss'],
})
export class CutListTableComponent {
  readonly i18n = inject(TranslationService);

  @Input({ required: true }) cutList: CutListItem[] = [];
  @Input() displayUnit: 'mm' | 'inch' = 'mm';

  copied = signal<boolean>(false);

  localizePartName(name: string): string {
    if (this.i18n.isHungarian()) {
      return HU_PART_NAMES[name] || name;
    }
    return name;
  }

  copyCutList(): void {
    const text = this.cutList
      .map((item) => {
        const name = this.localizePartName(item.partName);
        return `${name} (Qty: ${item.quantity}) - ${item.widthMm} x ${item.heightOrDepthMm} mm [${item.widthInches} x ${item.heightOrDepthInches}], ${item.thicknessMm}mm thick. Note: ${item.notes}`;
      })
      .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  printPlan(): void {
    window.print();
  }
}

