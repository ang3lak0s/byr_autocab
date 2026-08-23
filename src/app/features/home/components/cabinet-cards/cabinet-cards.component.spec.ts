import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CabinetCardsComponent } from './cabinet-cards.component';

describe('CabinetCardsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabinetCardsComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create cabinet cards component with all 6 speaker cab presets', () => {
    const fixture = TestBed.createComponent(CabinetCardsComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
    expect(comp.cabinets().length).toBe(6);
    expect(comp.filteredCabinets().length).toBe(6);
  });

  it('should filter cabinets by category (e.g. 1x12 or bass)', () => {
    const fixture = TestBed.createComponent(CabinetCardsComponent);
    const comp = fixture.componentInstance;
    comp.setCategory('1x12');
    expect(comp.filteredCabinets().length).toBe(1);
    expect(comp.filteredCabinets()[0].category).toBe('1x12');

    comp.setCategory('bass');
    expect(comp.filteredCabinets().length).toBe(2);
  });

  it('should format dimensions in inch and mm', () => {
    const fixture = TestBed.createComponent(CabinetCardsComponent);
    const comp = fixture.componentInstance;
    expect(comp.formatDimension(24)).toBe('24"');
    comp.setUnit('mm');
    expect(comp.formatDimension(24)).toBe('610mm');
  });
});
