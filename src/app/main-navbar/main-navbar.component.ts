import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { UserModel } from '../models/User';

@Component({
  selector: 'app-main-navbar',
  templateUrl: './main-navbar.component.html',
  styleUrls: ['./main-navbar.component.css']
})
export class MainNavbarComponent implements OnInit {
  @Output() cartClicked = new EventEmitter<void>();
  isDropdownOpen: boolean = false;

  isLoggedIn: boolean = false;
  user: UserModel[] = [{
    email: 'test@gmail.com',
    password: 'test123'
  }];

  ngOnInit() {
    console.log('MainNavbarComponent initialized');

    // Check if the user credentials are valid (dummy authentication)
    if (this.user.length > 0 && this.user[0].email === 'test@gmail.com' && this.user[0].password === 'test123') {
      this.isLoggedIn = true;
    }
  }

  getProfileImage(): string {
    return this.isLoggedIn
      ? 'assets/icons/profile-photo.png'
      : 'assets/icons/profile-user.png';
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onCartClick() {
    this.cartClicked.emit();
  }
}
