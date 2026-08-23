import { TestBed } from '@angular/core/testing';
import { BuildExportService } from './build-export.service';
import { ConfiguratorState } from '../models/configurator-state.model';
import { CutListItem } from '../models/calculation-result.model';

describe('BuildExportService', () => {
  let service: BuildExportService;

  const mockState: ConfiguratorState = {
    formFactor: 'horizontal',
    dimensions: { width: 610, height: 457, depth: 305, unit: 'mm' },
    speaker: {
      count: 2,
      diameterPreset: '12',
      modelId: 'celestion-v30',
      cutoutDiameterMm: 283,
      mountingDepthMm: 124,
      magnetDiameterMm: 156,
      powerHandlingWatts: 60,
      weightKg: 4.7,
      layout: 'horizontal-2x',
    },
    backConfig: 'closed-back',
    constructionMethod: 'glue-screw-nail',
    material: {
      materialName: '18mm Baltic Birch',
      thicknessMm: 18,
      wasteAllowancePercent: 10,
      sheetPrice: 75,
    },
    costs: {
      woodCost: 65,
      speakersCost: 145,
      grillClothCost: 20,
      tolexCost: 35,
      hardwareCost: 25,
      wiringCost: 10,
      miscCost: 10,
      currencySymbol: '$',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuildExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should serialize state to query params correctly', () => {
    const params = service.serializeStateToQueryParams(mockState);
    expect(params['w']).toBe(610);
    expect(params['h']).toBe(457);
    expect(params['d']).toBe(305);
    expect(params['sp']).toBe(2);
    expect(params['sz']).toBe('12');
    expect(params['drv']).toBe('celestion-v30');
    expect(params['lay']).toBe('horizontal-2x');
  });

  it('should deserialize query params back to state', () => {
    const params = {
      w: '800',
      h: '500',
      d: '350',
      u: 'mm',
      sp: '4',
      sz: '10',
      drv: 'eminence-ragin-cajun',
      lay: 'grid-2x2',
      thick: '15',
    };

    const restored = service.parseQueryParamsToState(params, mockState);
    expect(restored.dimensions.width).toBe(800);
    expect(restored.dimensions.height).toBe(500);
    expect(restored.speaker.count).toBe(4);
    expect(restored.speaker.diameterPreset).toBe('10');
    expect(restored.speaker.modelId).toBe('eminence-ragin-cajun');
    expect(restored.speaker.layout).toBe('grid-2x2');
    expect(restored.material.thicknessMm).toBe(15);
  });
});
