import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkflowStep, HOW_IT_WORKS_STEPS } from '../../../../domain/cabinet/mocks/how-it-works.mock';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';

const HU_HOW_IT_WORKS_STEPS: WorkflowStep[] = [
  {
    stepNumber: '01',
    title: 'Hangszórók & Férőhelyek Kiválasztása',
    subtitle: 'Hangszóró Méret, Kivágások & Mágnes Mélységek',
    description: 'Válaszd ki a hangfal konfigurációját (1x12, 2x12, 4x12, 1x15). A BYR AutoCab automatikusan ellenőrzi a köralakú kivágási átmérőket, a csavarosztóköröket és a mágnes mélységét, hogy a hangszórók ütközésmentesen elférjenek.',
    badge: '1. Lépés: Hangszóró Adatok',
    icon: 'speaker',
    technicalDetails: [
      'Szabványos 10", 12" és 15" hangszóró kivágási sablonok (pl. 282mm a 12"-oshoz)',
      '4 vagy 8 furatos T-anyás rögzítési körök',
      'Elölről vagy hátulról szerelt előlap (front-loaded / rear-loaded)',
      'Minimális előlapi peremtávolság ellenőrzése a lap repedésének elkerülésére',
    ],
    outputSample: '1 × 12" Hangszóró (283mm Kivágás) | 6.5" Mágnes Férőhely Rendben',
  },
  {
    stepNumber: '02',
    title: 'Hangdoboz Típus & Térfogat Beállítása',
    subtitle: 'Zárt Hátfal, Nyitott Hátfal vagy Basszusreflex Nyílás',
    description: 'Állítsd be a külső befoglaló méreteket, vagy hagyd, hogy a rendszer számítsa ki a cél akusztikai légtérfogat (liter / köbláb) alapján, figyelembe véve a fa vastagságát és a belső merevítéseket.',
    badge: '2. Lépés: Akusztikai Térfogat',
    icon: 'volume',
    technicalDetails: [
      'Zárt akusztikai nyomáskamra a feszes, ütős mélyhangokért',
      'Nyitott hátfal (ovális / 2 paneles) a 360 fokos tágas hangszórásért',
      'Átalakítható 3-részes kivehető hátfal a maximális színpadi rugalmasságért',
      'Basszusreflex cső méretezése (átmérő és hossz) basszusládákhoz',
    ],
    outputSample: 'Bruttó Térfogat: 42.5 L (1.50 cu ft) | Kialakítás: Átalakítható 3-részes',
  },
  {
    stepNumber: '03',
    title: 'Igazítás a Műhely Szerszámaihoz',
    subtitle: 'Saroklécek, Fogazott Kötés vagy Átfalcolt Illesztés',
    description: 'Ne a szoftverhez kelljen alkalmazkodnod. Válaszd ki az illesztési módot a meglévő szerszámaid alapján — az egyszerű akkus fúrótól és kézifűrésztől a precíziós asztali maróig.',
    badge: '3. Lépés: Kötések & Szerszámok',
    icon: 'tools',
    technicalDetails: [
      'Sarokléces tompa kötés: egyszerű összeszerelés kéziszerszámokkal és belső lécekkel',
      'Fogazott ujjkötés: autentikus vintage hangzás és fa rezonancia',
      'Falcolt sarokkötés: nagy mechanikai teherbírás turnéládákhoz',
      '18mm 13-rétegű balti nyír vagy tömör fenyő méretezési szabályok',
    ],
    outputSample: 'Kötés: Sarokléces Tompa | Szerszámok: Körfűrész + Fúró + Szorítók',
  },
  {
    stepNumber: '04',
    title: 'Azonnali Lapszabászat & Anyagjegyzék (BOM)',
    subtitle: 'Műhelyterv, Tolex Szükséglet & Szerelvények',
    description: 'Generálj letisztult lapszabászati rajzot (tető, fenék, oldalak, baffle, hátlap, saroklécek) és teljes anyagjegyzéket tolexre, hangfalszövetre, fémsarkokra, fogantyúkra és aljzatokra.',
    badge: '4. Lépés: Műhelyi Kimenet',
    icon: 'clipboard',
    technicalDetails: [
      'Pontos méretek tetőhöz, fenékhez, oldalakhoz, előlaphoz, hátlaphoz és lécekhez',
      'Tolex kárpit anyagszükséglet számítás (50mm-es ráhagyással)',
      'Hangfalszövet méret keretráhagyással',
      'Komplett szerelvénylista: 8 sarokvédő, bőr fül, csatlakozó tálca, T-anyák',
    ],
    outputSample: '5 Lap + 4 Sarokléc | 1.5 m Tolex | 8 Fém Sarok | 4 T-anya',
  },
];

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss'],
})
export class HowItWorksComponent {
  readonly i18n = inject(TranslationService);
  readonly rawSteps = signal<WorkflowStep[]>(HOW_IT_WORKS_STEPS);
  readonly activeStepIndex = signal<number>(0);

  readonly steps = computed(() => {
    return this.i18n.isHungarian() ? HU_HOW_IT_WORKS_STEPS : this.rawSteps();
  });

  setActiveStep(index: number): void {
    this.activeStepIndex.set(index);
  }
}

