import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkflowStep, HOW_IT_WORKS_STEPS } from '../../../../domain/cabinet/mocks/how-it-works.mock';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss'],
})
export class HowItWorksComponent {
  readonly steps = signal<WorkflowStep[]>(HOW_IT_WORKS_STEPS);
  readonly activeStepIndex = signal<number>(0);

  setActiveStep(index: number): void {
    this.activeStepIndex.set(index);
  }
}
