import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConstructionMethod } from '../../../../domain/cabinet/models/construction-method.model';
import { CONSTRUCTION_METHODS } from '../../../../domain/cabinet/mocks/construction-methods.mock';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';

const HU_METHODS_OVERRIDES: Record<string, Partial<ConstructionMethod>> = {
  'cleated-butt': {
    name: 'Tompa Kötés Belső Saroklécekkel',
    subtitle: 'Kezdőbarát, Sziklaszilárd és Légmentes Alapvető Kéziszerszámokkal',
    description: 'A lapokat belső 20×20 mm-es keményfa saroklécek tartják össze, melyek belülről vannak ragasztva és csavarozva. Kiküszöböli a bonyolult marószerszámokat, miközben kiváló akusztikai merevséget és légtömör illesztést biztosít.',
    jointType: 'Tompa illesztés folytonos belső sarokléc-megerősítéssel',
    toolingRequired: ['Kézi körfűrész vagy Vezetősínes fűrész', 'Akkus fúró-csavarozó', 'Süllyesztő fúróhegy', 'Szorítók'],
    advantages: [
      'Nincs szükség horonymaróra vagy speciális sablonokra',
      'A folytonos belső saroklécek hatalmas ragasztási felületet adnak',
      'A csavarfejek a láda belsejében rejtve maradnak, így a tolex borítás sima marad',
      'A leggyorsabb és legmegbocsátóbb módszer kezdő építőknek',
    ],
    jointStrength: 'Légmentes & Szilárd',
    assemblySpeed: 'Ultragyors',
    toolingComplexity: 'Alapvető (Kézifűrész/Fúró)',
    fastenerType: '3.5x35mm facsavarok + D3 vízálló faragasztó (Titebond II)',
    typicalApplication: 'Első saját építésű projektek, egyedi 1x12 és 2x12 gitárládák, strapabíró basszusládák',
  },
  'finger-joint': {
    name: 'Fogazott / Ujjkötés (Klasszikus Vintage)',
    subtitle: 'Maximális Akusztikai Zengés & Autentikus Vintage Megjelenés',
    description: 'Egymásba kapaszkodó téglalap alakú fogak a lapok szélein. Megtalálható az 50-es évekbeli klasszikus Fender tweed erősítőkön és prémium butik ládákon.',
    jointType: 'Egymásba illeszkedő 6mm vagy 12mm-es fogazott kötések',
    toolingRequired: ['Asztali körfűrész horonymaró tárcsával vagy Asztali marógép', 'Ujjmaró sablon', 'Asztalos szorítók'],
    advantages: [
      'Óriási fa-a-fához ragasztási felület, szinte elpusztíthatatlan kötés',
      'A ládatest automatikusan megtartja a tökéletes 90 fokos derékszöget',
      'Lehetővé teszi a tömör fenyő természetes akusztikai rezonanciáját',
      'Ikonikus vizuális kézműves megjelenés natúr vagy lakkozott felületnél',
    ],
    jointStrength: 'Maximális Hangzás & Merevség',
    assemblySpeed: 'Precíziós Illesztés',
    toolingComplexity: 'Haladó (Asztali körfűrész/Felsőmaró)',
    fastenerType: 'Faragasztó (Titebond Original vagy hidey-enyv vintage restaurációhoz)',
    typicalApplication: 'Vintage tweed kombók, prémium tömör fenyő ládák, natúr erezetű egzotikus fa kabinettek',
  },
  'rabbet-corner': {
    name: 'Átfalcolt Sarokillesztés',
    subtitle: 'Klasszikus Nagy Szilárdságú Kötés Süllyesztett Lépcsővel',
    description: 'A tető- és fenéklapok szélein bemarásra kerül egy lépcsős horony (falc), amely pontosan fogadja az oldallapokat. Nagy nyíróirányú terhelhetőséget és egyszerű tömíthetőséget biztosít.',
    jointType: 'Lépcsős falc (fél lemezvastagság mélységben)',
    toolingRequired: ['Felsőmaró falcmaróval vagy Asztali körfűrész', 'Rúdszorítók', 'Pneumatikus szögbelövő (opcionális)'],
    advantages: [
      'A lapok automatikusan a helyükre ugranak ragasztáskor és nem csúsznak el',
      'Kiváló ellenállás a nehéz erősítőfejek súlyával szemben',
      'Könnyen lekerekíthető 12mm-es rádiuszmaróval fém sarokvédőkhöz',
      'Rétegelt lemezhez és tömör fához egyaránt kiváló',
    ],
    jointStrength: 'Nagy',
    assemblySpeed: 'Gyors',
    toolingComplexity: 'Haladó (Körfűrész/Felsőmaró)',
    fastenerType: '35mm tűszegek / facsavarok + Titebond II ragasztó',
    typicalApplication: 'Marshall stílusú 4x12 és 2x12 turnéládák, nagy hangnyomású basszusládák',
  },
  'mitered-spline': {
    name: 'Gérbevágott Sarok Belső Ékekkel',
    subtitle: 'Folytonos Szálirányzat Pácolt Natúr Fa Hangfalakhoz',
    description: 'A panelek 45 fokban gérbe vannak vágva, így a fa erezete körbefut a láda sarkain. A 45 fokos élekbe bemart keményfa ékek biztosítják a nagy ragasztási szilárdságot.',
    jointType: '45 fokos gérillesztés rejtett keményfa ékekkel',
    toolingRequired: ['Precíziós asztali körfűrész gérvágóval', 'Lamellázó vagy Felsőmaró', 'Keretszorító szalagok'],
    advantages: [
      'Látványos, megszakítás nélküli faerezeti rajzolat a sarkok körül',
      'Nem látszanak vágott lapélek a doboz külsején',
      'Kiváló csúcsminőségű luxus audió hangsugárzókhoz és stúdióládákhoz',
      'Modern, letisztult élkialakítás',
    ],
    jointStrength: 'Nagy (megfelelő ékeléssel)',
    assemblySpeed: 'Közepes',
    toolingComplexity: 'Profi (Precíziós gérvágó gép)',
    fastenerType: 'Belső keményfa csapok / ékek + Titebond II ragasztó',
    typicalApplication: 'Audiophile stúdiómonitorok, luxus dió- vagy kőrisfa gitárkabinettek',
  },
  'floating-baffle': {
    name: 'Úszó Előlap & Hangszórótartó Lécek',
    subtitle: 'Könnyen Cserélhető Előlap és Elasztikus Akusztikai Viselkedés',
    description: 'A hangszórótartó előlap (baffle) nincs bemerítve és beragasztva a káva szerkezetébe, hanem önálló elemként csavarozódik a belső tartólécekhez. Megkönnyíti a hangszórócserét és a szövetkárpitozást.',
    jointType: 'Csavarozott kivehető előlap rezonanciamentes rögzítéssel',
    toolingRequired: ['Akkus fúró-csavarozó', 'Fafúrók & Süllyesztők', 'Fűrész', 'T-anya behúzó szerszám'],
    advantages: [
      'Az előlap bármikor eltávolítható vagy cserélhető (pl. 1x12-ről 2x10-re alakítás)',
      'A hangfalszövet kényelmesen, külön felületen feszíthető rá az előlapra',
      'Szabályozható mechanikai akusztikus csatolás a hangszóró és a káva között',
      'Megkönnyíti a hangszórók hátsó vagy elülső beépítését',
    ],
    jointStrength: 'Kiváló Szervizelhetőség',
    assemblySpeed: 'Gyors & Moduláris',
    toolingComplexity: 'Alapvető Szerszámok',
    fastenerType: 'M5 / #10 T-anyák és metrikus csavarok a hangszórókhoz',
    typicalApplication: 'Moduláris gitárládák, cserélhető baffle-lel épített egyedi ládák, vintage Fender kombók',
  },
};

@Component({
  selector: 'app-construction-methods',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './construction-methods.component.html',
  styleUrls: ['./construction-methods.component.scss'],
})
export class ConstructionMethodsComponent {
  readonly i18n = inject(TranslationService);
  readonly rawMethods = signal<ConstructionMethod[]>(CONSTRUCTION_METHODS);
  readonly selectedMethodId = signal<string>(CONSTRUCTION_METHODS[0].id);

  readonly methods = computed(() => {
    const list = this.rawMethods();
    if (!this.i18n.isHungarian()) {
      return list;
    }
    return list.map((m) => {
      const override = HU_METHODS_OVERRIDES[m.id];
      if (!override) return m;
      return {
        ...m,
        ...override,
      };
    });
  });

  selectMethod(id: string): void {
    this.selectedMethodId.set(id);
  }

  getSelectedMethod(): ConstructionMethod {
    return (
      this.methods().find((m) => m.id === this.selectedMethodId()) ||
      this.methods()[0]
    );
  }
}

