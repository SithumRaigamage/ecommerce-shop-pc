import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService, CartItemModel } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterModule, CommonModule, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  @Output() closeCart = new EventEmitter<void>();
  cartItems: CartItemModel[] = []; // ✅ Correct type

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items; // ✅ Directly assign the correct type
      console.log('Cart items:', this.cartItems);
    });
  }

  toggleCart() {
    this.closeCart.emit();
  }

  removeFromCart(cartItem: CartItemModel) {
    this.cartService.removeFromCart(cartItem);
  }

  increaseQuantity(cartItem: CartItemModel) {
    this.cartService.updateQuantity(cartItem, cartItem.quantity + 1);
  }

  decreaseQuantity(cartItem: CartItemModel) {
    if (cartItem.quantity > 1) {
      this.cartService.updateQuantity(cartItem, cartItem.quantity - 1);
    }
  }

  getSubtotal() {
    return this.cartService.getSubtotal();
  }

  getShippingFee() {
    return this.cartService.getShippingFee();
  }

  getTax() {
    return this.cartService.getTax();
  }

  getTotal() {
    return this.cartService.getTotal();
  }
}
