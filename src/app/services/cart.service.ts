import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductModel } from '../models/ProductModel';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<{ product: ProductModel, quantity: number }[]>([]);
  cartItems$ = this.cartItems.asObservable();

  private readonly shippingFee = 300;
  private readonly taxRate = 0.08;

  addToCart(product: ProductModel) {
    const currentItems = this.cartItems.value;
    const itemIndex = currentItems.findIndex(item => item.product.id === product.id);
    if (itemIndex > -1) {
      currentItems[itemIndex].quantity++;
    } else {
      currentItems.push({ product, quantity: 1 });
    }
    this.cartItems.next(currentItems);
  }

  removeFromCart(product: ProductModel) {
    const currentItems = this.cartItems.value.filter(item => item.product.id !== product.id);
    this.cartItems.next(currentItems);
  }

  updateQuantity(product: ProductModel, quantity: number) {
    const currentItems = this.cartItems.value;
    const itemIndex = currentItems.findIndex(item => item.product.id === product.id);
    if (itemIndex > -1) {
      currentItems[itemIndex].quantity = quantity;
      this.cartItems.next(currentItems);
    }
  }

  clearCart() {
    this.cartItems.next([]);
  }

  getCartItems() {
    return this.cartItems.value;
  }

  getSubtotal() {
    return this.cartItems.value.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }

  getShippingFee() {
    return this.cartItems.value.length > 0 ? this.shippingFee : 0;
  }

  getTax() {
    return this.getSubtotal() * this.taxRate; // Example tax rate of 8%
  }

  getTotal() {
    return this.getSubtotal() + this.getShippingFee() + this.getTax();
  }
}
