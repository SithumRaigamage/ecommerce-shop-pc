import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductModel } from '../models/ProductModel';

export interface CartItemModel {
  product: ProductModel;
  color: string;
  size: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItemModel[]>([]);
  cartItems$ = this.cartItems.asObservable();

  private readonly shippingFee = 300;
  private readonly taxRate = 0.08;

  addToCart(product: CartItemModel) {
    const currentItems = [...this.cartItems.value]; // Avoid direct mutation
    const itemIndex = currentItems.findIndex(item => item.product.id === product.product.id);

    if (itemIndex > -1) {
      currentItems[itemIndex] = {
        ...currentItems[itemIndex],
        quantity: currentItems[itemIndex].quantity + product.quantity
      };
    } else {
      currentItems.push({ ...product });
    }

    this.cartItems.next(currentItems);
  }

  removeFromCart(product: CartItemModel) {
    const updatedItems = this.cartItems.value.filter(item => item.product.id !== product.product.id);
    this.cartItems.next(updatedItems);
  }

  updateQuantity(product: CartItemModel, quantity: number) {
    if (quantity < 1) return; // Prevent setting quantity below 1

    const currentItems = this.cartItems.value.map(item =>
      item.product.id === product.product.id ? { ...item, quantity } : item
    );

    this.cartItems.next(currentItems);
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
    return this.getSubtotal() * this.taxRate;
  }

  getTotal() {
    return this.getSubtotal() + this.getShippingFee() + this.getTax();
  }
}
