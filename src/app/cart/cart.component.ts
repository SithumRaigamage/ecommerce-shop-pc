import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductModel } from '../models/ProductModel';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [RouterModule, CommonModule, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  @Output() closeCart = new EventEmitter<void>();
  cartItems: { product: ProductModel, quantity: number }[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      console.log('Cart items:', this.cartItems);
    });
  }

  toggleCart() {
    this.closeCart.emit();
  }

  removeFromCart(product: ProductModel) {
    this.cartService.removeFromCart(product);
  }

  increaseQuantity(product: ProductModel) {
    const item = this.cartItems.find(item => item.product.id === product.id);
    if (item) {
      this.cartService.updateQuantity(product, item.quantity + 1);
    }
  }

  decreaseQuantity(product: ProductModel) {
    const item = this.cartItems.find(item => item.product.id === product.id);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(product, item.quantity - 1);
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
