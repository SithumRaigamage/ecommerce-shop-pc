import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./footer/footer.component";
import { MainLayoutComponent } from "./main-layout/main-layout.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, MainLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ecommerce-shop-pc';
}
