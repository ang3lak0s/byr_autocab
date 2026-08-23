import { Injectable, signal, computed, effect } from '@angular/core';
import { EN_TRANSLATIONS } from '../i18n/en';
import { HU_TRANSLATIONS } from '../i18n/hu';

export type SupportedLanguage = 'en' | 'hu';

const STORAGE_KEY = 'byr_autocab_lang';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly dictionaries: Record<SupportedLanguage, Record<string, string>> = {
    en: EN_TRANSLATIONS,
    hu: HU_TRANSLATIONS,
  };

  /**
   * Active language signal ('en' or 'hu')
   */
  readonly currentLanguage = signal<SupportedLanguage>(this.detectInitialLanguage());

  /**
   * Convenient computed flags
   */
  readonly isEnglish = computed(() => this.currentLanguage() === 'en');
  readonly isHungarian = computed(() => this.currentLanguage() === 'hu');

  constructor() {
    // Synchronize HTML lang attribute and storage
    effect(() => {
      const lang = this.currentLanguage();
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, lang);
          document.documentElement.lang = lang;
        } catch {
          // Ignore localStorage errors in restricted environments
        }
      }
    });
  }

  /**
   * Switch the active language
   */
  setLanguage(lang: SupportedLanguage): void {
    if (this.currentLanguage() !== lang) {
      this.currentLanguage.set(lang);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, lang);
          document.documentElement.lang = lang;
        } catch {
          // Ignore localStorage errors
        }
      }
    }
  }

  /**
   * Toggle between English and Hungarian
   */
  toggleLanguage(): void {
    this.setLanguage(this.currentLanguage() === 'en' ? 'hu' : 'en');
  }

  /**
   * Translates a given translation key with optional interpolation params.
   * Example: translate('CABINETS.FILTER_ALL', { count: 6 })
   */
  translate(key: string, params?: Record<string, string | number>): string {
    const lang = this.currentLanguage();
    const dictionary = this.dictionaries[lang] || this.dictionaries.en;
    let template = dictionary[key] ?? this.dictionaries.en[key] ?? key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        template = template.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return template;
  }

  /**
   * Alias for translate()
   */
  t(key: string, params?: Record<string, string | number>): string {
    return this.translate(key, params);
  }

  /**
   * Detects initial language from localStorage or browser navigator
   */
  private detectInitialLanguage(): SupportedLanguage {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'en' || stored === 'hu') {
          return stored;
        }

        const navLang = navigator.language?.toLowerCase() || '';
        if (navLang.startsWith('hu')) {
          return 'hu';
        }
      } catch {
        // Fallback to 'en'
      }
    }
    return 'en';
  }
}
