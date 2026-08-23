import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CabinetConfiguration, CabinetCategory } from '../../../../domain/cabinet/models/cabinet.model';
import { EXAMPLE_CABINETS } from '../../../../domain/cabinet/mocks/example-cabinets.mock';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';

const HU_CABINET_OVERRIDES: Record<string, Partial<CabinetConfiguration>> = {
  'cab-1x12-widebody': {
    name: 'Klasszikus 1x12" Widebody Gitárláda',
    tagline: 'Sokoldalú Stúdió- és Koncert Munkaeszköz',
    description: 'Optimalizált 1x12 hangdoboz telt, határozott mélyekkel és dobozhangzás-mentes akusztikával. 3-részes átalakítható hátfallal és 1.25" süllyesztett előlappal.',
    badge: 'Legnépszerűbb',
    materials: {
      carcassThickness: 0.75,
      baffleThickness: 0.75,
      backPanelThickness: 0.5,
      cleatDimension: '3/4" x 3/4" Fenyő/Nyárfa Lécek',
      materialType: '13-rétegű Balti Nyír Rétegeltlemez',
    },
    features: [
      '30 másodperc alatt átalakítható nyitott és zárt hátfal között a kivehető középső panelnek köszönhetően',
      'Pontos 11.1" (283mm) köralakú kivágás 4 db T-anyás rögzítéssel',
      'Süllyesztett saroklécek előlapszövet-keret fogadásához',
      'Bőséges 6.5" mélységi férőhely nehéz kerámia vagy Alnico mágnesekhez',
    ],
  },
  'cab-2x12-rock': {
    name: 'Brit Rock 2x12" Vízszintes Láda',
    tagline: 'Nagy Hangerejű Kettős Hangszórós Hangdoboz',
    description: 'Nagy teherbírású 2x12 zárt hátfalú láda tekintélyes alsó-közép dinamikával és nagy hangnyomással. Egymás melletti hangszórókkal és belső csillapító bordával.',
    badge: 'Klasszikus Rock',
    materials: {
      carcassThickness: 0.75,
      baffleThickness: 0.75,
      backPanelThickness: 0.75,
      cleatDimension: '3/4" x 3/4" Keményfa Lécek',
      materialType: '13-rétegű Balti Nyír Rétegeltlemez',
    },
    features: [
      'Légmentesen zárt hátkamra habszivacs tömítőszalaggal',
      'Kettős 11.1" kivágás 2.25" tengelytávolságú akusztikai szeparálással',
      'Masszív 18mm rétegeltlemez hátlap a 100W+ hangerő melletti dobozrezonancia ellen',
      'Süllyesztett fém hordozófül-kivágások a könnyű kettesben történő mozgatáshoz',
    ],
  },
  'cab-4x12-halfstack': {
    name: 'Ikonikus 4x12" Döntött Half-Stack',
    tagline: 'A Legendás 100W-os Színpadi Aranyszabvány',
    description: '4 hangszórós zárt láda masszív központi merevítő oszloppal, 18mm rétegvastagságú balti nyír szerkezettel és strapabíró sarokvédőkkel.',
    badge: 'Turné Legenda',
    materials: {
      carcassThickness: 0.75,
      baffleThickness: 0.75,
      backPanelThickness: 0.75,
      cleatDimension: '1" x 1" Tömör Nyírfa Lécek + 2x2 Merevítő Oszlop',
      materialType: '18mm Csomómentes Balti Nyír Rétegeltlemez',
    },
    features: [
      '2x2" belső merevítő oszlop köti össze az előlapot a hátlappal a dobhártya-rezonanciák ellen',
      '4 × 12" szimmetrikus hangszóró-elrendezés számított mágnes-távolságokkal',
      'Megerősített görgő rögzítőlemezek a fenéklapon',
      'Klasszikus Marshall / Mesa stílusú masszív fogazott dobozkötés',
    ],
  },
  'cab-1x15-bass-reflex': {
    name: 'Dinamikus 1x15" Reflex Basszusláda',
    tagline: 'Mély Hangokra Hangolt Basszus Enclosure',
    description: 'Precíziós 42Hz-re hangolt basszusláda kettős kör alakú bassreflex nyílással. 18mm nyírfából, belső keresztmerevítő hálóval és opcionális magastölcsér-hellyel.',
    badge: 'Basszusra Hangolva',
    materials: {
      carcassThickness: 0.75,
      baffleThickness: 0.75,
      backPanelThickness: 0.75,
      cleatDimension: '3/4" x 3/4" Lécek + Belső Ablakos Merevítők',
      materialType: '18mm 13-rétegű Balti Nyír Rétegeltlemez',
    },
    features: [
      'Kettős 3" átmérőjű × 4.5" mélyre hangolt PVC reflexcső a tiszta 45Hz alatti átvitelért',
      'Belső ablakos merevítő vázszerkezet a ládatest elszíneződésének megakadályozására',
      'Elölről szerelt mélysugárzó rögzítés masszív acél hangszórórács-kapcsokkal',
      'Akusztikai poliészter vatelin csillapítási specifikáció a lapszabászatban mellékelve',
    ],
  },
  'cab-2x10-compact-punch': {
    name: 'Kompakt 2x10" Basszus & Gitárláda',
    tagline: 'Gyors Tranziensek & Könnyű Hordozhatóság',
    description: 'Kompakt 2x10 láda villámgyors tranziens átvitellel, precíz artikulációval és könnyű, egy kézzel hordozható kialakítással koncertekre és próbákra.',
    badge: 'Könnyű Súlyú',
    materials: {
      carcassThickness: 0.75,
      baffleThickness: 0.75,
      backPanelThickness: 0.5,
      cleatDimension: '3/4" x 3/4" Fenyőlécek',
      materialType: '15mm vagy 18mm Balti Nyír Rétegeltlemez',
    },
    features: [
      'Kettős 9.1" kivágás dinamikus 10"-os hangszórókra optimalizálva',
      'Alsó perem menti polc-reflex nyílás a frontpanel helytakarékosságáért',
      '14.5 kg alatti teljes súly neodímium mágneses hangszórókkal szerelve',
      'Kompatibilis basszusgitárral és mélyre hangolt modern elektromos gitárokkal',
    ],
  },
  'cab-1x10-tweed-vintage': {
    name: 'Vintage 1x10" Tweed Blues Láda',
    tagline: 'Meleg Zengésű Tömör Fenyő Hangzás',
    description: 'Klasszikus 1950-es évekbeli stílusú nyitott hátfalú láda könnyű, zengő tömör fehér fenyőfából, 3/8" lebegő balti nyír előlappal az autentikus vintage hangzásért.',
    badge: 'Vintage Tónus',
    materials: {
      carcassThickness: 0.75,
      baffleThickness: 0.375,
      backPanelThickness: 0.375,
      cleatDimension: '1/2" x 1/2" Fenyőlécek',
      materialType: 'Válogatott Tömör Fehér Fenyőfa',
    },
    features: [
      'Zengő tömör fenyő ládatest, amely együtt rezonál az erősítővel a zengő blues sustainért',
      'Lebegő 3/8" előlap mindössze 4 csavarral rögzítve a maximális akusztikai rezonanciáért',
      'Klasszikus 2-paneles nyitott hátfal, amely 360 fokban teríti a hangot kisebb helyiségekben',
      'Autentikus 1/4" fogazott ujjkötésű sarkok az időtálló kézműves megjelenésért',
    ],
  },
};

const HU_ENCLOSURE_STYLES: Record<string, string> = {
  'convertible-3-piece': 'Átalakítható (3-részes)',
  'closed-back': 'Zárt hátfalú',
  'ported-bass-reflex': 'Basszusreflex nyílásos',
  'open-back': 'Nyitott hátfalú',
};

@Component({
  selector: 'app-cabinet-cards',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './cabinet-cards.component.html',
  styleUrls: ['./cabinet-cards.component.scss'],
})
export class CabinetCardsComponent {
  readonly i18n = inject(TranslationService);
  readonly rawCabinets = signal<CabinetConfiguration[]>(EXAMPLE_CABINETS);
  readonly selectedCategory = signal<CabinetCategory | 'all'>('all');
  readonly dimensionUnit = signal<'in' | 'mm'>('in');

  readonly cabinets = computed(() => {
    const list = this.rawCabinets();
    if (!this.i18n.isHungarian()) {
      return list;
    }
    return list.map((cab) => {
      const override = HU_CABINET_OVERRIDES[cab.id];
      if (!override) return cab;
      return {
        ...cab,
        ...override,
        materials: {
          ...cab.materials,
          ...(override.materials || {}),
        },
      };
    });
  });

  readonly filteredCabinets = computed(() => {
    const category = this.selectedCategory();
    const list = this.cabinets();
    if (category === 'all') return list;
    return list.filter((cab) => cab.category === category);
  });

  setCategory(category: CabinetCategory | 'all'): void {
    this.selectedCategory.set(category);
  }

  setUnit(unit: 'in' | 'mm'): void {
    this.dimensionUnit.set(unit);
  }

  formatDimension(inches: number): string {
    if (this.dimensionUnit() === 'in') {
      return `${inches}"`;
    }
    const mm = Math.round(inches * 25.4);
    return `${mm}mm`;
  }

  formatEnclosureStyle(style: string): string {
    if (this.i18n.isHungarian()) {
      return HU_ENCLOSURE_STYLES[style] || style;
    }
    return style.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  formatCutout(cutoutInches: number): string {
    if (this.dimensionUnit() === 'mm') {
      const mm = Math.round(cutoutInches * 25.4);
      return this.i18n.isHungarian() ? `${mm}mm Kivágás` : `${mm}mm Cutout`;
    }
    return this.i18n.isHungarian() ? `${cutoutInches}" Kivágás` : `${cutoutInches}" Cutout`;
  }

  formatHardware(cab: CabinetConfiguration): string {
    if (this.i18n.isHungarian()) {
      const tolexStr = cab.hardware.tolexYardage
        .replace(/Yards?/gi, 'yard')
        .replace(/Wide/gi, 'széles')
        .replace(/Tweed & Lacquer/gi, 'Tweed & Lakk');
      return `${cab.hardware.tNutCount} T-anya • ${tolexStr} Tolex`;
    }
    return `${cab.hardware.tNutCount} T-Nuts • ${cab.hardware.tolexYardage} Tolex`;
  }
}

