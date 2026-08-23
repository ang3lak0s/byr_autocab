import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConstructionMethod } from '../../../../domain/cabinet/models/construction-method.model';
import { CONSTRUCTION_METHODS } from '../../../../domain/cabinet/mocks/construction-methods.mock';

@Component({
  selector: 'app-construction-methods',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './construction-methods.component.html',
  styleUrls: ['./construction-methods.component.scss'],
})
export class ConstructionMethodsComponent {
  readonly methods = signal<ConstructionMethod[]>(CONSTRUCTION_METHODS);
  readonly selectedMethodId = signal<string>(CONSTRUCTION_METHODS[0].id);

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
