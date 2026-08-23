import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CostEstimateResult,
  BuildDifficultyResult,
  ToolRequirementResult,
  MaterialRequirementResult,
} from '../../../../domain/cabinet/models/calculation-result.model';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';

const HU_TOOL_MAP: Record<string, string> = {
  'Circular Saw or Track Saw': 'Kézi körfűrész vagy Vezetősínes körfűrész',
  'Cordless Drill & Driver': 'Akkus fúró-csavarozó',
  'Countersink Drill Bit': 'Süllyesztő fúrófej',
  'Clamps (4+ Bar Clamps)': 'Asztalos szorítók (4+ db)',
  'Jigsaw (for speaker cutouts)': 'Szúrófűrész (körkivágáshoz)',
  'PVA Wood Glue (Titebond II)': 'D3 Faragasztó (Titebond II)',
  'Router with Circle Jig': 'Felsőmaró körkivágó sablonnal',
  'Pneumatic Brad Nailer': 'Pneumatikus szögbelövő',
  'Table Saw': 'Asztali körfűrész',
  'Router Table': 'Asztali marógép',
  'Drill Press': 'Állványos fúrógép',
  'Moisture Meter': 'Fa nedvességmérő',
};

@Component({
  selector: 'app-cost-summary-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './cost-summary-card.component.html',
  styleUrls: ['./cost-summary-card.component.scss'],
})
export class CostSummaryCardComponent {
  readonly i18n = inject(TranslationService);

  @Input({ required: true }) costs!: CostEstimateResult;
  @Input({ required: true }) difficulty!: BuildDifficultyResult;
  @Input({ required: true }) tools!: ToolRequirementResult;
  @Input({ required: true }) materials!: MaterialRequirementResult;

  localizeTool(tool: string): string {
    if (this.i18n.isHungarian()) {
      return HU_TOOL_MAP[tool] || tool;
    }
    return tool;
  }
}

