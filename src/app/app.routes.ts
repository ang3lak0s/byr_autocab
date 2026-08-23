import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ConfiguratorComponent } from './features/configurator/configurator.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'BYR AutoCab - Speaker Cabinet Planner & Cut List Engine',
  },
  {
    path: 'configurator',
    component: ConfiguratorComponent,
    title: 'BYR AutoCab - Cabinet Configurator',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
