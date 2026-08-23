import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { TranslationService } from '../services/translation.service';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let service: TranslationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [TranslationService, TranslatePipe],
    });
    service = TestBed.inject(TranslationService);
    pipe = TestBed.inject(TranslatePipe);
  });

  it('should transform translation key to English text by default', () => {
    const result = pipe.transform('HEADER.NAV_ENCLOSURES');
    expect(result).toBe('Speaker Enclosures');
  });

  it('should transform translation key to Hungarian when language is changed', () => {
    service.setLanguage('hu');
    const result = pipe.transform('HEADER.NAV_ENCLOSURES');
    expect(result).toBe('Hangfal Konstrukciók');
  });

  it('should interpolate params through pipe', () => {
    service.setLanguage('en');
    expect(pipe.transform('CONFIG.CUTOUT_LABEL', { mm: 283 })).toBe('Cutout: 283mm');

    service.setLanguage('hu');
    expect(pipe.transform('CONFIG.CUTOUT_LABEL', { mm: 283 })).toBe('Kivágás: 283mm');
  });
});
