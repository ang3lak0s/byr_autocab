import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, SupportedLanguage } from '../../services/translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
})
export class LanguageSwitcherComponent {
  readonly i18n = inject(TranslationService);
  readonly variant = input<'header' | 'drawer' | 'footer'>('header');

  selectLanguage(lang: SupportedLanguage): void {
    this.i18n.setLanguage(lang);
  }
}
