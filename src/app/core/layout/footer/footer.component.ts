import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
