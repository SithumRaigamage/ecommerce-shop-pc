import { ProductModel } from '../models/ProductModel';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-overview.component.html',
  styleUrls: ['./product-overview.component.css']
})
export class ProductOverviewComponent implements OnInit {
  Math: any;


  product: ProductModel | undefined;
  selectedColor: string | undefined;
  selectedSize: any | undefined;
  quantity: number = 1;
  isFavorite: boolean = true;
  selectedImage: string | undefined;
  selectedTab: string = 'details';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.Math = Math;
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.productService.getProductById(id).subscribe(product => {
        this.product = product;
        console.log('Fetched product:', product);
      });
    });
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onSubmit(): void {
    if (!this.product) return;

    const orderDetails = {
      productId: this.product.id,
      color: this.selectedColor,
      size: this.selectedSize,
      quantity: this.quantity
    };
    console.log('Submitting order:', orderDetails);
    // Here you would typically call a service to process the order
  }

  share() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      console.log('URL copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy URL: ', err);
    });
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }
  addToCart() {
    throw new Error('Method not implemented.');
  }
}
