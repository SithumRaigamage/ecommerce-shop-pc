import { Component } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { MainContentComponent } from "../main-content/main-content.component";
import { MainNavbarComponent } from "../main-navbar/main-navbar.component";

@Component({
  selector: 'app-main-layout',
  imports: [FooterComponent, MainContentComponent, MainNavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

}
