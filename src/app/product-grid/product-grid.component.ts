import { ProductModel } from '../models/ProductModel';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, RouterModule,],
  providers: [ProductService],
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.css']
})
export class ProductGridComponent {

  products: ProductModel[] = [];

  constructor(private productService: ProductService,private route: ActivatedRoute) { }

  ngOnInit() {
    this.productService.getAllProducts().subscribe((data) => {
      this.products = data;
    });

    // Subscribe to route params changes
    this.route.params.subscribe(params => {
      const category = params['category'];
      console.log('Category:', category);
    });

  }


}
