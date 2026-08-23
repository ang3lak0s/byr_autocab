import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeroSectionComponent } from './hero-section.component';

describe('HeroSectionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSectionComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create hero component with default 1x12 cab preset', () => {
    const fixture = TestBed.createComponent(HeroSectionComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
    expect(comp.activePreset()).toBe('cab112');
    expect(comp.activeWidth()).toBe(24);
    expect(comp.activeHeight()).toBe(18);
    expect(comp.activeDepth()).toBe(12);
  });

  it('should switch preset to 2x12 rock cab when requested', () => {
    const fixture = TestBed.createComponent(HeroSectionComponent);
    const comp = fixture.componentInstance;
    comp.selectPreset('cab212');
    expect(comp.activePreset()).toBe('cab212');
    expect(comp.activeWidth()).toBe(30);
    expect(comp.activeHeight()).toBe(20);
    expect(comp.activeDepth()).toBe(14);
  });

  it('should toggle unit between inch and mm', () => {
    const fixture = TestBed.createComponent(HeroSectionComponent);
    const comp = fixture.componentInstance;
    comp.toggleUnit('mm');
    expect(comp.activeUnit()).toBe('mm');
    expect(comp.activeWidth()).toBe(610);
  });
});
