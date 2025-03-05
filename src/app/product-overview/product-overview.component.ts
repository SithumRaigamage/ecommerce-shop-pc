import { ProductModel } from '../models/ProductModel';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-overview.component.html',
  styleUrls: ['./product-overview.component.css']
})
export class ProductOverviewComponent implements OnInit {

  product: ProductModel | undefined;
  selectedColor: string | undefined;
  selectedSize: any | undefined;
  quantity: number = 1;
  isFavorite: boolean = true;
  selectedImage: string | undefined;
  selectedTab: string = 'details';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private toastr: ToastrService // Inject ToastrService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.productService.getProductById(id).subscribe(product => {
        if (product) {
          this.product = product;
          this.selectedImage = product.image;
          if (this.product?.colors && this.product.colors.length > 0) {
            this.selectedColor = this.product.colors[0];
          }
          if (this.product?.sizes && this.product.sizes.length > 0) {
            this.selectedSize = this.product.sizes[0];
          }
          //console.log('Fetched product:', product);
        }
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
  }

  share(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.toastr.success('Product URL copied to clipboard!', 'Success');
    }).catch(err => {
      this.toastr.error('Failed to copy URL.', 'Error');
      console.error('Failed to copy URL: ', err);
    });
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }

  addToCart(): void {
    if (!this.product) {
      this.toastr.error('Product data is missing.', 'Error');
      return;
    }

    if (!this.selectedColor) {
      this.toastr.warning('Please select a color.', 'Warning');
      return;
    }

    if (!this.selectedSize) {
      this.toastr.warning('Please select a size.', 'Warning');
      return;
    }

    if (this.quantity <= 0) {
      this.toastr.warning('Please select a valid quantity.', 'Warning');
      return;
    }

    const cartItem = {
      product: this.product,
      color: this.selectedColor,
      size: this.selectedSize,
      quantity: this.quantity
    };

    this.cartService.addToCart(cartItem);
    this.toastr.success('Product added to cart successfully!', 'Success');
  }
}
