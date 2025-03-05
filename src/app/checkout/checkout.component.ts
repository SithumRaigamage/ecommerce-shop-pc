import { Component, OnDestroy, OnInit } from '@angular/core';
import { CartItemModel, CartService } from '../services/cart.service';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule, FormsModule], // <-- Add FormsModule to imports
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  orderItems: CartItemModel[] = [];
  totalAmount: number = 0;
  shippingFee: number = 0;
  tax: number = 0;
  couponCode: string = '';
  discountAmount: number = 0;
  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService,private toastr: ToastrService ) {}

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

  applyCoupon() {
    const couponCodes: { [key: string]: number } = {
      'DISCOUNT10': 0.10,
      'DISCOUNT20': 0.20,
      'DISCOUNT30': 0.30
    };

    console.log('Applying coupon:', this.couponCode);

    if (couponCodes[this.couponCode]) {
      const discount = couponCodes[this.couponCode];
      console.log('Discount applied:', discount * 100, '%');
      const subtotal = this.orderItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
      this.discountAmount = subtotal * discount;
      this.totalAmount = (subtotal + this.shippingFee - this.discountAmount);
      this.totalAmount = parseFloat(this.totalAmount.toFixed(2)); // Ensure two decimal places
      this.toastr.success('Coupon Code applied successfully', 'Success');
    } else {
      console.log('Invalid coupon code');
      this.toastr.error('Invalid Coupon Code', 'Error');
      this.discountAmount = 0;
    }
  }
}
