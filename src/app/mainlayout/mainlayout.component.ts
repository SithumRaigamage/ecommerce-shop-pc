
import { MainNavbarComponent } from '../main-navbar/main-navbar.component';
import { MainContentComponent } from '../main-content/main-content.component';
import { FooterComponent } from '../footer/footer.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { CartComponent } from '../cart/cart.component';
import { CommonModule } from '@angular/common';

import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-mainlayout',
  imports: [MainNavbarComponent,MainContentComponent,FooterComponent,SideNavComponent,CartComponent,CommonModule ],
  templateUrl: './mainlayout.component.html',
  styleUrls: ['./mainlayout.component.css']
})
export class MainlayoutComponent implements OnInit {
  isCartOpen = false;
  isLeftVisible: boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Check for specific routes where you want to hide or show the left div
      this.isLeftVisible = !['/checkout', '/billing','/thankyou'].some(path => event.url.includes(path));
    });
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  onCategorySelected(category: string): void {
    //console.log('category selected: ', category);
    this.router.navigate(['/product-grid'], { queryParams: { category } });
  }
}
