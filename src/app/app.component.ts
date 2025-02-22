import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./footer/footer.component";
import { MainlayoutComponent } from './mainlayout/mainlayout.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent,MainlayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ecommerce-shop-pc';
}
