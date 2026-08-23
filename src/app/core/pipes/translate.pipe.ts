import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // Ensures reactive re-evaluation when currentLanguage signal changes
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(key: string, params?: Record<string, string | number>): string {
    if (!key) return '';
    // Reading the signal ensures dependency tracking in templates
    this.translationService.currentLanguage();
    return this.translationService.translate(key, params);
  }
}
