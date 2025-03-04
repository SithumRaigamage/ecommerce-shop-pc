import { Component, OnDestroy, OnInit } from '@angular/core';
import { CartItemModel, CartService } from '../services/cart.service';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, OnDestroy {

  orderItems: CartItemModel[] = [];
  totalAmount: number = 0;
  shippingFee: number = 0;
  tax: number = 0;
  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.checkoutCart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.orderItems = items;
        this.shippingFee = this.cartService.getShippingFee();
        this.tax = this.cartService.getTax();
        this.calculateTotal();
        console.log('Cart details for checkout:', this.orderItems);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calculateTotal() {
    const subtotal = this.orderItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
    this.totalAmount = subtotal + this.shippingFee;
  }

  trackByProductId(index: number, item: any): number {
    return item.product.id;
  }
}
