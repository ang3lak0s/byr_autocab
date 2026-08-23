import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { TranslationService } from '../../services/translation.service';

describe('LanguageSwitcherComponent', () => {
  let component: LanguageSwitcherComponent;
  let fixture: ComponentFixture<LanguageSwitcherComponent>;
  let translationService: TranslationService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent],
      providers: [TranslationService],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSwitcherComponent);
    component = fixture.componentInstance;
    translationService = TestBed.inject(TranslationService);
    fixture.detectChanges();
  });

  it('should create language switcher component', () => {
    expect(component).toBeTruthy();
  });

  it('should render both EN and HU buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('button.lang-btn');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('EN');
    expect(buttons[1].textContent).toContain('HU');
  });

  it('should switch language on button click', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const huButton = compiled.querySelectorAll('button.lang-btn')[1] as HTMLButtonElement;

    huButton.click();
    fixture.detectChanges();

    expect(translationService.currentLanguage()).toBe('hu');
    expect(huButton.classList.contains('active')).toBe(true);
  });
});
