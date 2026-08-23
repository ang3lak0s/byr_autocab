import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-configurator-placeholder',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './configurator-placeholder.component.html',
  styleUrls: ['./configurator-placeholder.component.scss'],
})
export class ConfiguratorPlaceholderComponent {}
