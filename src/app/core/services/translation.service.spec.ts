import { TestBed } from '@angular/core/testing';
import { TranslationService, SupportedLanguage } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [TranslationService],
    });
    service = TestBed.inject(TranslationService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default English or stored language', () => {
    expect(service.currentLanguage()).toBe('en');
    expect(service.isHungarian()).toBe(false);
  });

  it('should restore stored Hungarian preference from localStorage', () => {
    localStorage.setItem('byr_autocab_lang', 'hu');
    const newService = new TranslationService();
    expect(newService.currentLanguage()).toBe('hu');
    expect(newService.isHungarian()).toBe(true);
  });

  it('should switch to Hungarian when setLanguage is called', () => {
    service.setLanguage('hu');
    expect(service.currentLanguage()).toBe('hu');
    expect(service.isHungarian()).toBe(true);
    expect(localStorage.getItem('byr_autocab_lang')).toBe('hu');
  });

  it('should toggle language between en and hu', () => {
    expect(service.currentLanguage()).toBe('en');
    service.toggleLanguage();
    expect(service.currentLanguage()).toBe('hu');
    service.toggleLanguage();
    expect(service.currentLanguage()).toBe('en');
  });

  it('should translate keys correctly in English and Hungarian', () => {
    service.setLanguage('en');
    expect(service.t('HEADER.PRO_WORKSHOP')).toBe('PRO WORKSHOP');
    expect(service.t('HEADER.NAV_ENCLOSURES')).toBe('Speaker Enclosures');

    service.setLanguage('hu');
    expect(service.t('HEADER.PRO_WORKSHOP')).toBe('PRO MŰHELY');
    expect(service.t('HEADER.NAV_ENCLOSURES')).toBe('Hangfal Konstrukciók');
  });

  it('should interpolate parameterized translations', () => {
    service.setLanguage('en');
    const enText = service.t('CABINETS.FILTER_ALL', { count: 6 });
    expect(enText).toBe('All Enclosures (6)');

    service.setLanguage('hu');
    const huText = service.t('CABINETS.FILTER_ALL', { count: 6 });
    expect(huText).toBe('Összes Hangfal (6)');
  });

  it('should fallback gracefully when key is not found', () => {
    expect(service.t('NON_EXISTENT.KEY')).toBe('NON_EXISTENT.KEY');
  });
});
