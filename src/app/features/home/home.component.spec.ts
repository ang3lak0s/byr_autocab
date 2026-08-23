import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { CabinetCardsComponent } from './components/cabinet-cards/cabinet-cards.component';
import { ConstructionMethodsComponent } from './components/construction-methods/construction-methods.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        HeroSectionComponent,
        CabinetCardsComponent,
        ConstructionMethodsComponent,
        HowItWorksComponent,
      ],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the home component', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render all 4 core sections', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('app-hero-section')).toBeTruthy();
    expect(el.querySelector('app-cabinet-cards')).toBeTruthy();
    expect(el.querySelector('app-construction-methods')).toBeTruthy();
    expect(el.querySelector('app-how-it-works')).toBeTruthy();
  });
});
