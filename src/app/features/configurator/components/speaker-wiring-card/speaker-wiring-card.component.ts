import { Component, signal, computed, inject, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  WiringMode,
  WiringOption,
  SpeakerWiringResult,
} from '../../../../domain/cabinet/models/speaker-wiring.model';
import { SpeakerWiringService } from '../../../../domain/cabinet/services/speaker-wiring.service';
import { SubscriptionService } from '../../../../domain/cabinet/services/subscription.service';

@Component({
  selector: 'app-speaker-wiring-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './speaker-wiring-card.component.html',
  styleUrls: ['./speaker-wiring-card.component.scss'],
})
export class SpeakerWiringCardComponent {
  private readonly wiringService = inject(SpeakerWiringService);
  readonly subService = inject(SubscriptionService);

  readonly driverCount = input.required<number>();
  readonly driverModelName = input<string>('Speaker Driver');
  readonly singleDriverWatts = input<number>(60);
  readonly initialDriverImpedance = input<number>(8);

  readonly selectedImpedance = signal<number>(8);
  readonly selectedWiringMode = signal<WiringMode | undefined>(undefined);

  constructor() {
    // When driver count changes, reset selectedWiringMode so default standard topology is selected immediately
    effect(() => {
      this.driverCount();
      this.selectedWiringMode.set(undefined);
    });

    // When initialDriverImpedance input updates from parent
    effect(() => {
      const z = this.initialDriverImpedance();
      if (z) {
        this.selectedImpedance.set(z);
      }
    });
  }

  readonly wiringResult = computed<SpeakerWiringResult>(() => {
    return this.wiringService.calculateWiringPlan(
      this.driverCount(),
      this.selectedImpedance(),
      this.selectedWiringMode(),
      this.singleDriverWatts()
    );
  });

  setImpedance(z: number): void {
    this.selectedImpedance.set(z);
  }

  setWiringMode(mode: WiringMode): void {
    if (mode === 'stereo-split' && !this.subService.isPro()) {
      this.subService.openUpgradeModal(
        'Stereo / Mono Switchable Jackplate',
        'Unlock stereo split and multi-tap impedance switching matrix with the BYR Pro Workshop Pass.'
      );
      return;
    }
    this.selectedWiringMode.set(mode);
  }
}
