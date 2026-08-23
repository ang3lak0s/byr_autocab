import { Injectable } from '@angular/core';
import {
  WiringMode,
  JackPlateType,
  WiringOption,
  SpeakerWiringResult,
} from '../models/speaker-wiring.model';

@Injectable({
  providedIn: 'root',
})
export class SpeakerWiringService {
  /**
   * Calculates all available wiring options, total impedance, and wire recommendations.
   */
  calculateWiringPlan(
    driverCount: number,
    individualImpedanceOhms: number = 8,
    selectedMode?: WiringMode,
    singleDriverWatts: number = 60
  ): SpeakerWiringResult {
    const count = Math.max(1, driverCount);
    const z = individualImpedanceOhms > 0 ? individualImpedanceOhms : 8;
    const totalPowerHandlingWatts = singleDriverWatts * count;

    const availableOptions: WiringOption[] = [];

    if (count === 1) {
      availableOptions.push({
        mode: 'direct',
        name: 'Direct Mono Connection',
        shortLabel: 'Direct Mono',
        description: `Direct 2-wire connection from 1/4" input jack to speaker terminals (+ to +, - to -).`,
        totalImpedanceOhms: z,
        monoOrStereo: 'mono',
        recommendedJack: 'single-mono',
        ampCompatibilityTip: `Connect directly to your amplifier's ${z}Ω speaker output tap.`,
        isStandardForCount: true,
      });
    } else if (count === 2) {
      // Parallel (Z / 2)
      const parallelZ = Number((z / 2).toFixed(1));
      availableOptions.push({
        mode: 'parallel',
        name: `Parallel Wiring (${parallelZ}Ω Mono)`,
        shortLabel: 'Parallel',
        description: `Both driver (+) terminals connect to Jack (+); both (-) connect to Jack (-). Safe and standard for 2x cabs.`,
        totalImpedanceOhms: parallelZ,
        monoOrStereo: 'mono',
        recommendedJack: 'dual-mono-parallel',
        ampCompatibilityTip: `Set amplifier output impedance selector to ${parallelZ}Ω.`,
        isStandardForCount: true,
      });

      // Series (2 * Z)
      const seriesZ = z * 2;
      availableOptions.push({
        mode: 'series',
        name: `Series Wiring (${seriesZ}Ω Mono)`,
        shortLabel: 'Series',
        description: `Jack (+) to Driver 1 (+), Driver 1 (-) jumpered to Driver 2 (+), Driver 2 (-) back to Jack (-).`,
        totalImpedanceOhms: seriesZ,
        monoOrStereo: 'mono',
        recommendedJack: 'single-mono',
        ampCompatibilityTip: `Set amplifier output impedance selector to ${seriesZ}Ω.`,
        isStandardForCount: false,
      });

      // Stereo Split
      availableOptions.push({
        mode: 'stereo-split',
        name: `Stereo / Dual Mono (${z}Ω / ${z}Ω Split)`,
        shortLabel: 'Stereo Split',
        description: `Separate isolated Left and Right 1/4" input jacks for stereo or wet/dry amplifier rigs.`,
        totalImpedanceOhms: z,
        monoOrStereo: 'stereo',
        recommendedJack: 'stereo-switching',
        ampCompatibilityTip: `Each input channel is ${z}Ω (${singleDriverWatts}W RMS per channel).`,
        isStandardForCount: false,
      });
    } else {
      // 4-Speaker Cabs (4x12 / 4x10)
      // Series-Parallel (Z_total = Z)
      availableOptions.push({
        mode: 'series-parallel',
        name: `Series-Parallel Wiring (${z}Ω Mono)`,
        shortLabel: 'Series-Parallel',
        description: `Industry standard 4x12 configuration. Two series pairs wired in parallel, preserving original driver impedance.`,
        totalImpedanceOhms: z,
        monoOrStereo: 'mono',
        recommendedJack: 'dual-mono-parallel',
        ampCompatibilityTip: `Total cabinet load matches individual driver impedance (${z}Ω). Connect to amp's ${z}Ω tap.`,
        isStandardForCount: true,
      });

      // All-Parallel (Z / 4)
      const allParallelZ = Number((z / 4).toFixed(1));
      availableOptions.push({
        mode: 'all-parallel',
        name: `All-Parallel Wiring (${allParallelZ}Ω Mono)`,
        shortLabel: 'All-Parallel',
        description: `All four drivers connected in parallel. Lowest impedance, high current capability.`,
        totalImpedanceOhms: allParallelZ,
        monoOrStereo: 'mono',
        recommendedJack: 'single-mono',
        ampCompatibilityTip: `Verify amplifier supports ${allParallelZ}Ω loads (common on solid-state & bass amps).`,
        isStandardForCount: false,
      });

      // Stereo / Mono Switchable
      const stereoZ = Number((z / 2).toFixed(1));
      availableOptions.push({
        mode: 'stereo-split',
        name: `Switchable Mono (${z}Ω / ${allParallelZ}Ω) & Stereo (${stereoZ}Ω + ${stereoZ}Ω)`,
        shortLabel: 'Stereo / Mono',
        description: `Marshall 1960 style switchable jack plate. Supports mono full-stack and stereo split operation.`,
        totalImpedanceOhms: z,
        monoOrStereo: 'switchable',
        recommendedJack: 'stereo-switching',
        ampCompatibilityTip: `Mono: ${z}Ω (${totalPowerHandlingWatts}W) &bull; Stereo: ${stereoZ}Ω Left / ${stereoZ}Ω Right (${totalPowerHandlingWatts / 2}W each).`,
        isStandardForCount: false,
      });
    }

    const defaultOption =
      availableOptions.find((opt) => opt.isStandardForCount) || availableOptions[0];
    const activeOption =
      (selectedMode && availableOptions.find((opt) => opt.mode === selectedMode)) ||
      defaultOption;

    let suggestedWireGauge = '16 AWG (1.3 mm²) Oxygen-Free Copper';
    if (totalPowerHandlingWatts > 300) {
      suggestedWireGauge = '14 AWG (2.1 mm²) Heavy-Duty Oxygen-Free Copper';
    } else if (totalPowerHandlingWatts <= 50) {
      suggestedWireGauge = '18 AWG (0.82 mm²) Stranded Copper';
    }

    return {
      driverCount: count,
      individualDriverImpedanceOhms: z,
      selectedWiringMode: activeOption.mode,
      jackPlate: activeOption.recommendedJack,
      availableOptions,
      activeOption,
      totalPowerHandlingWatts,
      suggestedWireGauge,
    };
  }
}
