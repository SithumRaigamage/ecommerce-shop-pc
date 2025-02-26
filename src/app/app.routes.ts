import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import {SupportComponent} from './support/support.component';
import {ProductGridComponent} from './product-grid/product-grid.component';
import { ProductOverviewComponent } from './product-overview/product-overview.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'support',
    component: SupportComponent,
  },
  { path: 'product-grid',
    component: ProductGridComponent
  },
  {
    path: 'product-overview/:id',
    component: ProductOverviewComponent
  }
];
