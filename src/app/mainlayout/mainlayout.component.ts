import { Component } from '@angular/core';
import { MainNavbarComponent } from '../main-navbar/main-navbar.component';
import { MainContentComponent } from '../main-content/main-content.component';
import { FooterComponent } from '../footer/footer.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { Router } from '@angular/router';
import { CartComponent } from '../cart/cart.component';

@Component({
  selector: 'app-mainlayout',
  imports: [MainNavbarComponent,MainContentComponent,FooterComponent,SideNavComponent,CartComponent ],
  templateUrl: './mainlayout.component.html',
  styleUrls: ['./mainlayout.component.css']
})
export class MainlayoutComponent {
  isCartOpen = false;

  constructor(private router: Router) {}

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  onCategorySelected(category: string): void {
    console.log('category selected: ', category);
    this.router.navigate(['/product-grid'], { queryParams: { category } });
  }
}
