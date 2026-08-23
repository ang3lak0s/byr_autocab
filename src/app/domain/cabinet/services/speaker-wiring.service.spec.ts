import { TestBed } from '@angular/core/testing';
import { SpeakerWiringService } from './speaker-wiring.service';

describe('SpeakerWiringService', () => {
  let service: SpeakerWiringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpeakerWiringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate direct mono connection for 1x speaker cabinet', () => {
    const res8 = service.calculateWiringPlan(1, 8, 'direct', 60);
    expect(res8.activeOption.totalImpedanceOhms).toBe(8);
    expect(res8.activeOption.mode).toBe('direct');
    expect(res8.totalPowerHandlingWatts).toBe(60);

    const res16 = service.calculateWiringPlan(1, 16, 'direct', 25);
    expect(res16.activeOption.totalImpedanceOhms).toBe(16);
    expect(res16.totalPowerHandlingWatts).toBe(25);
  });

  it('should calculate parallel and series options for 2x speaker cabinet', () => {
    // 2x 16 ohm in parallel -> 8 ohm
    const parallel16 = service.calculateWiringPlan(2, 16, 'parallel', 65);
    expect(parallel16.activeOption.totalImpedanceOhms).toBe(8);
    expect(parallel16.totalPowerHandlingWatts).toBe(130);

    // 2x 8 ohm in series -> 16 ohm
    const series8 = service.calculateWiringPlan(2, 8, 'series', 60);
    expect(series8.activeOption.totalImpedanceOhms).toBe(16);
    expect(series8.totalPowerHandlingWatts).toBe(120);

    // 2x 8 ohm in parallel -> 4 ohm
    const parallel8 = service.calculateWiringPlan(2, 8, 'parallel', 60);
    expect(parallel8.activeOption.totalImpedanceOhms).toBe(4);
  });

  it('should calculate series-parallel and all-parallel for 4x speaker cabinet', () => {
    // 4x 16 ohm in Series-Parallel -> 16 ohm (Standard Marshall 1960)
    const sp16 = service.calculateWiringPlan(4, 16, 'series-parallel', 75);
    expect(sp16.activeOption.totalImpedanceOhms).toBe(16);
    expect(sp16.totalPowerHandlingWatts).toBe(300);

    // 4x 16 ohm in All-Parallel -> 4 ohm
    const ap16 = service.calculateWiringPlan(4, 16, 'all-parallel', 75);
    expect(ap16.activeOption.totalImpedanceOhms).toBe(4);

    // 4x 8 ohm in Series-Parallel -> 8 ohm
    const sp8 = service.calculateWiringPlan(4, 8, 'series-parallel', 60);
    expect(sp8.activeOption.totalImpedanceOhms).toBe(8);
    expect(sp8.totalPowerHandlingWatts).toBe(240);
  });
});
