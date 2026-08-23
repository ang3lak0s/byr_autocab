import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CutListItem } from '../../../../domain/cabinet/models/calculation-result.model';

@Component({
  selector: 'app-cut-list-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cut-list-table.component.html',
  styleUrls: ['./cut-list-table.component.scss'],
})
export class CutListTableComponent {
  @Input({ required: true }) cutList: CutListItem[] = [];
  @Input() displayUnit: 'mm' | 'inch' = 'mm';

  copied = signal<boolean>(false);

  copyCutList(): void {
    const text = this.cutList
      .map(
        (item) =>
          `${item.partName} (Qty: ${item.quantity}) - ${item.widthMm} x ${item.heightOrDepthMm} mm [${item.widthInches} x ${item.heightOrDepthInches}], ${item.thicknessMm}mm thick. Note: ${item.notes}`
      )
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
