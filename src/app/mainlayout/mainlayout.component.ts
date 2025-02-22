import { Component } from '@angular/core';
import { MainNavbarComponent } from '../main-navbar/main-navbar.component';
import { MainContentComponent } from '../main-content/main-content.component';
import { FooterComponent } from '../footer/footer.component';
import { SideNavComponent } from '../side-nav/side-nav.component';

@Component({
  selector: 'app-mainlayout',
  imports: [MainNavbarComponent,MainContentComponent,FooterComponent,SideNavComponent ],
  templateUrl: './mainlayout.component.html',
  styleUrl: './mainlayout.component.css'
})
export class MainlayoutComponent {

}
