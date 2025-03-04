import { Component } from '@angular/core';
import { CartItemModel, CartService } from '../services/cart.service';

@Component({
  selector: 'app-productorder',
  imports: [],
  templateUrl: './productorder.component.html',
  styleUrl: './productorder.component.css'
})
export class ProductorderComponent {

  orderItems: CartItemModel[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.checkoutCart$.subscribe(items => {
      this.orderItems = items;
      console.log('Cart details for checkout:', this.orderItems);
    });
  }

}
