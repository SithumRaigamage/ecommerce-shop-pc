import { ProductModel } from '../models/ProductModel';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product.service';
import { FilterSectionComponent } from '../filter-section/filter-section.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, RouterModule,FilterSectionComponent],
  providers: [ProductService],
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.css']
})
export class ProductGridComponent implements OnInit {
  searchTerm: any;
  filteredProducts: ProductModel[] = [];
  selectedCategory: any;
  filterOptions: any;

  constructor(private productService: ProductService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const category = params['category'];
      //console.log('Category:', category);
      this.productService.getProductsByCategory(category).subscribe(products => {
        this.filteredProducts = products;
        //console.log('Filtered Products:', this.filteredProducts);
      });

      this.productService.getFilterOptions(category).subscribe(options => {
        console.log('Filter Options:', options);
        this.filterOptions = options;
      });
    });
  }

}
