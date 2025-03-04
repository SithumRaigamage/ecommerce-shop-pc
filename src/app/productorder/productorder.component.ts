import { Component } from '@angular/core';
import { CartItemModel, CartService } from '../services/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-productorder',
  imports: [CommonModule],
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

  trackByProductId(index: number, item: any): number {
    return item.product.id;
  }

  

}
