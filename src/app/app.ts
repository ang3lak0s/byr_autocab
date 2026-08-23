import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/layout/header/header.component';
import { FooterComponent } from './core/layout/footer/footer.component';
import { UpgradeModalComponent } from './features/subscription/components/upgrade-modal/upgrade-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, UpgradeModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
