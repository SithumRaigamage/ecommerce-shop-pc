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
searchTerm: any;
filterProducts() {
throw new Error('Method not implemented.');
}

  filteredProducts: ProductModel[] = [];
selectedCategory: any;

  constructor(private productService: ProductService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const category = params['category'];
      console.log('Category:', category);
      this.productService.getProductsByCategory(category).subscribe(products => {
        this.filteredProducts = products;
        console.log('Filtered Products:', this.filteredProducts);
      });
    });
  }


}
