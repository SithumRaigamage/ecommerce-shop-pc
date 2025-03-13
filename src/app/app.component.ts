import { Component } from '@angular/core';

import { MainlayoutComponent } from './mainlayout/mainlayout.component';

@Component({
  selector: 'app-root',
  imports: [MainlayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ecommerce-shop-pc';
}
