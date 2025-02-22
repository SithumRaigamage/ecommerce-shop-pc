import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import {SupportComponent} from './support/support.component';
import {ProductGridComponent} from './product-grid/product-grid.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'support',
    component: SupportComponent,
  },
  {
    path: 'category/:category',
    component: ProductGridComponent
  }
];
