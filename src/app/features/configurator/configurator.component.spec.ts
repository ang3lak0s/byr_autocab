import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfiguratorComponent } from './configurator.component';
import { CabinetCalculatorService } from '../../domain/cabinet/services/cabinet-calculator.service';

describe('ConfiguratorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguratorComponent],
      providers: [provideRouter([]), CabinetCalculatorService],
    }).compileComponents();
  });

  it('should create configurator component with initial 1x12 state', () => {
    const fixture = TestBed.createComponent(ConfiguratorComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
    expect(comp.activeStep()).toBe('speakers');
    expect(comp.state().speaker.count).toBe(1);
    expect(comp.buildPlan().cutList.length).toBeGreaterThan(0);
  });

  it('should advance through wizard steps', () => {
    const fixture = TestBed.createComponent(ConfiguratorComponent);
    const comp = fixture.componentInstance;
    comp.setStep('dimensions');
    expect(comp.activeStep()).toBe('dimensions');
    comp.setStep('drivers-wiring');
    expect(comp.activeStep()).toBe('drivers-wiring');
    comp.setStep('summary');
    expect(comp.activeStep()).toBe('summary');
  });

  it('should load preset correctly by id', () => {
    const fixture = TestBed.createComponent(ConfiguratorComponent);
    const comp = fixture.componentInstance;
    comp.loadPresetById('cab-4x12-halfstack');

    expect(comp.state().speaker.count).toBe(4);
    expect(comp.state().speaker.diameterPreset).toBe('12');
    expect(comp.state().speaker.layout).toBe('grid-2x2');
  });

  it('should toggle dimension units and convert values', () => {
    const fixture = TestBed.createComponent(ConfiguratorComponent);
    const comp = fixture.componentInstance;
    // initial width 610mm
    comp.setDimensionUnit('inch');
    expect(comp.state().dimensions.unit).toBe('inch');
    expect(comp.state().dimensions.width).toBeCloseTo(24.02, 1);
  });
});
