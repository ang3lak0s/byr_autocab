import { TestBed } from '@angular/core/testing';
import { CabinetCalculatorService } from './cabinet-calculator.service';
import { ConfiguratorState } from '../models/configurator-state.model';

describe('CabinetCalculatorService', () => {
  let service: CabinetCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CabinetCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateInternalDimensions', () => {
    it('should correctly calculate internal dimensions by deducting 2x material thickness', () => {
      const internal = service.calculateInternalDimensions(600, 450, 300, 18);
      expect(internal.width).toBe(564); // 600 - 36
      expect(internal.height).toBe(414); // 450 - 36
      expect(internal.depth).toBe(264); // 300 - 36
    });

    it('should guard against negative dimensions if material is thicker than envelope', () => {
      const internal = service.calculateInternalDimensions(30, 30, 30, 20);
      expect(internal.width).toBe(0);
      expect(internal.height).toBe(0);
      expect(internal.depth).toBe(0);
    });
  });

  describe('calculateAcousticVolume', () => {
    it('should calculate volume in litres and cubic feet correctly', () => {
      const volume = service.calculateAcousticVolume({
        width: 500,
        height: 400,
        depth: 250,
      });

      // 500 * 400 * 250 = 50,000,000 mm3 = 50.0 Litres
      expect(volume.volumeLiters).toBe(50.0);
      // 50.0 / 28.3168 = 1.77 cu ft
      expect(volume.volumeCuFt).toBe(1.77);
      expect(volume.disclaimer).toContain('geometric');
    });
  });

  describe('validateSpeakerClearance', () => {
    it('should validate single 12" driver on an adequate baffle', () => {
      const res = service.validateSpeakerClearance(
        {
          count: 1,
          diameterPreset: '12',
          cutoutDiameterMm: 282,
          layout: 'single',
        },
        564,
        414
      );

      expect(res.isValid).toBe(true);
      expect(res.warnings.length).toBe(0);
      expect(res.positions.length).toBe(1);
      expect(res.positions[0].centerX).toBe(50);
      expect(res.positions[0].centerY).toBe(50);
    });

    it('should reject two 12" horizontal speakers on a narrow baffle and generate explicit warning', () => {
      // 2 * 282 + 20 + 50 = 634mm required. Baffle is only 500mm
      const res = service.validateSpeakerClearance(
        {
          count: 2,
          diameterPreset: '12',
          cutoutDiameterMm: 282,
          layout: 'horizontal-2x',
        },
        500,
        400
      );

      expect(res.isValid).toBe(false);
      expect(res.warnings.length).toBeGreaterThan(0);
      expect(res.warnings[0]).toContain('Insufficient baffle width');
      expect(res.minRequiredBaffleWidthMm).toBe(634);
    });

    it('should generate 4 positions for 2x2 grid layout', () => {
      const res = service.validateSpeakerClearance(
        {
          count: 4,
          diameterPreset: '12',
          cutoutDiameterMm: 282,
          layout: 'grid-2x2',
        },
        700,
        700
      );

      expect(res.isValid).toBe(true);
      expect(res.positions.length).toBe(4);
      expect(res.positions[0].centerXMm).toBeDefined();
      expect(res.positions[0].centerYMm).toBeDefined();
    });

    it('should dynamically space 2x vertical speakers when baffle height increases', () => {
      // Tall cab: baffle height 764mm (800mm ext)
      const tallRes = service.validateSpeakerClearance(
        {
          count: 2,
          diameterPreset: '12',
          cutoutDiameterMm: 282,
          layout: 'vertical-2x',
        },
        564,
        764
      );

      expect(tallRes.isValid).toBe(true);
      expect(tallRes.positions.length).toBe(2);
      expect(tallRes.positions[1].centerYMm! - tallRes.positions[0].centerYMm!).toBeGreaterThanOrEqual(282 + 20);
    });

    it('should validate depth clearance for deep cabinets and flag collisions for overly shallow cabinets', () => {
      // Deep cab (305mm ext, 269mm internal): 124mm V30 driver has plenty of clearance
      const deepRes = service.validateSpeakerClearance(
        {
          count: 1,
          diameterPreset: '12',
          cutoutDiameterMm: 283,
          mountingDepthMm: 124,
          powerHandlingWatts: 60,
          weightKg: 4.7,
          layout: 'single',
        },
        564,
        414,
        269,
        18
      );

      expect(deepRes.depthValidation.isValid).toBe(true);
      expect(deepRes.depthValidation.hasVentBreathingRoom).toBe(true);
      expect(deepRes.depthValidation.clearanceToBackPanelMm).toBeGreaterThan(50);
      expect(deepRes.totalPowerHandlingWatts).toBe(60);
      expect(deepRes.totalDriverWeightKg).toBe(4.7);

      // Overly shallow cab (150mm internal depth, available behind baffle: 150 - 44 = 106mm): 153mm EVM-12L driver collides!
      const shallowRes = service.validateSpeakerClearance(
        {
          count: 1,
          diameterPreset: '12',
          cutoutDiameterMm: 281,
          mountingDepthMm: 153,
          powerHandlingWatts: 300,
          weightKg: 8.6,
          layout: 'single',
        },
        564,
        414,
        150,
        18
      );

      expect(shallowRes.depthValidation.isValid).toBe(false);
      expect(shallowRes.isValid).toBe(false);
      expect(shallowRes.depthValidation.clearanceToBackPanelMm).toBeLessThan(0);
      expect(shallowRes.warnings.some((w) => w.includes('COLLISION'))).toBe(true);
    });
  });

  describe('generateCutList', () => {
    it('should produce exact butt-joint cut list for closed-back cabinet', () => {
      const cutList = service.generateCutList(
        610,
        457,
        305,
        18,
        'basic-screw-nail',
        'closed-back'
      );

      const topBottom = cutList.find((p) => p.partName.includes('Top & Bottom'));
      expect(topBottom).toBeTruthy();
      expect(topBottom?.quantity).toBe(2);
      expect(topBottom?.widthMm).toBe(610);
      expect(topBottom?.heightOrDepthMm).toBe(305);

      const sides = cutList.find((p) => p.partName.includes('Side'));
      expect(sides).toBeTruthy();
      expect(sides?.quantity).toBe(2);
      expect(sides?.widthMm).toBe(421); // 457 - 36
      expect(sides?.heightOrDepthMm).toBe(305);

      const baffle = cutList.find((p) => p.partName.includes('Baffle'));
      expect(baffle).toBeTruthy();
      expect(baffle?.widthMm).toBe(574); // 610 - 36
      expect(baffle?.heightOrDepthMm).toBe(421); // 457 - 36

      const back = cutList.find((p) => p.partName.includes('Back'));
      expect(back?.partName).toContain('Sealed Back Panel');
    });

    it('should produce 2 upper/lower slats for half-open and mostly-open backs', () => {
      const cutListHalf = service.generateCutList(
        600,
        400,
        300,
        18,
        'glue-screw-nail',
        'half-open'
      );

      const backSlats = cutListHalf.find((p) => p.partName.includes('Upper & Lower'));
      expect(backSlats).toBeTruthy();
      expect(backSlats?.quantity).toBe(2);
    });

    it('should calculate rabbeted deductions for rabbet-glue method', () => {
      const cutListRabbet = service.generateCutList(
        600,
        400,
        300,
        18,
        'rabbet-glue',
        'closed-back'
      );

      const sides = cutListRabbet.find((p) => p.partName.includes('Side'));
      // 400 - 2*(18 - 9) = 400 - 18 = 382mm
      expect(sides?.widthMm).toBe(382);
    });
  });

  describe('calculateBuildPlan end-to-end', () => {
    it('should generate complete build plan matching known 1x12 widebody specs', () => {
      const state: ConfiguratorState = {
        formFactor: 'horizontal',
        dimensions: {
          width: 24, // 24" = 610mm
          height: 18, // 18" = 457mm
          depth: 12, // 12" = 305mm
          unit: 'inch',
        },
        speaker: {
          count: 1,
          diameterPreset: '12',
          cutoutDiameterMm: 282,
          layout: 'single',
        },
        backConfig: 'closed-back',
        constructionMethod: 'glue-screw-nail',
        material: {
          materialName: '18mm Baltic Birch',
          thicknessMm: 18,
          wasteAllowancePercent: 10,
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

      const plan = service.calculateBuildPlan(state);

      expect(plan.externalWidthMm).toBe(610);
      expect(plan.externalHeightMm).toBe(457);
      expect(plan.externalDepthMm).toBe(305);
      expect(plan.acousticVolume.volumeLiters).toBeGreaterThan(60);
      expect(plan.clearanceValidation.isValid).toBe(true);
      expect(plan.cutList.length).toBeGreaterThan(4);
      expect(plan.costs.totalCost).toBe(310);
      expect(plan.difficulty.level).toBe('Intermediate');
      expect(plan.tools.requiredTools.length).toBeGreaterThan(3);
    });
  });
});
