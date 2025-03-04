import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import {SupportComponent} from './support/support.component';
import {ProductGridComponent} from './product-grid/product-grid.component';
import { ProductOverviewComponent } from './product-overview/product-overview.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { ProfileComponent } from './profile/profile.component';
import { SignComponent } from './sign/sign.component';
import { BillingComponent } from './billing/billing.component';
import { OrderMessageComponent } from './order-message/order-message.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'build',
    component: ComingSoonComponent
  },
  {
    path: 'deals',
    component: ComingSoonComponent
  },
  {
    path: 'support',
    component: SupportComponent,
  },
  {
    path: 'settings',
    component: ProfileComponent
  },
  {
    path: 'login',
    component: SignComponent
  },
  {
    path: 'logout',
    component: SignComponent
  },
  {
    path: 'product-grid',
    component: ProductGridComponent
  },
  {
    path: 'product-overview/:id',
    component: ProductOverviewComponent
  },
  {
    path: 'checkout',
    component: CheckoutComponent
  },
  {
    path: 'billing',
    component: BillingComponent
  },
  {
    path: 'thankyou',
    component: OrderMessageComponent
  },
  {
    path: 'warranty',
    component: ComingSoonComponent
  },
  {
    path: 'installation',
    component: ComingSoonComponent
  },
  {
    path: 'contact',
    component: ComingSoonComponent
  },
  {
    path: 'faq',
    component: ComingSoonComponent
  },
  {
    path: 'shipping',
    component: ComingSoonComponent
  },
  {
    path: 'returns',
    component: ComingSoonComponent
  },
  {
    path: 'track-order',
    component: ComingSoonComponent
  }
];
