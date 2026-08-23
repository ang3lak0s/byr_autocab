import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { CabinetCardsComponent } from './components/cabinet-cards/cabinet-cards.component';
import { ConstructionMethodsComponent } from './components/construction-methods/construction-methods.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    CabinetCardsComponent,
    ConstructionMethodsComponent,
    HowItWorksComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {}
