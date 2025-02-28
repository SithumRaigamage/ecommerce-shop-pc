import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  @Output() closeCart = new EventEmitter<void>();

  toggleCart() {
    this.closeCart.emit();
  }
}
