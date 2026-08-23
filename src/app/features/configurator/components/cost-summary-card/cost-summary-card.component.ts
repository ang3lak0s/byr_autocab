import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CostEstimateResult,
  BuildDifficultyResult,
  ToolRequirementResult,
  MaterialRequirementResult,
} from '../../../../domain/cabinet/models/calculation-result.model';

@Component({
  selector: 'app-cost-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cost-summary-card.component.html',
  styleUrls: ['./cost-summary-card.component.scss'],
})
export class CostSummaryCardComponent {
  @Input({ required: true }) costs!: CostEstimateResult;
  @Input({ required: true }) difficulty!: BuildDifficultyResult;
  @Input({ required: true }) tools!: ToolRequirementResult;
  @Input({ required: true }) materials!: MaterialRequirementResult;
}
